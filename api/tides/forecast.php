<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $httpCode, array $payload): void {
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fmt_time(string $iso): string {
    try {
        $dt = new DateTimeImmutable($iso);
        return $dt->format('H:i');
    } catch (Throwable $e) {
        return $iso;
    }
}

function parse_dt(string $iso): ?DateTimeImmutable {
    try {
        return new DateTimeImmutable($iso);
    } catch (Throwable $e) {
        return null;
    }
}

function detect_now_state(array $extremes, bool $isRu, string $requestedDate): string {
    if (empty($extremes)) {
        return $isRu ? 'нет данных' : 'no data';
    }

    $firstDt = parse_dt((string)($extremes[0]['date'] ?? ''));
    if (!$firstDt) {
        return $isRu ? 'нет данных' : 'no data';
    }

    $tz = $firstDt->getTimezone();
    $todayInTz = (new DateTimeImmutable('now', $tz))->format('Y-m-d');

    if ($requestedDate !== $todayInTz) {
        return $isRu ? 'по графику' : 'scheduled';
    }

    $nowTs = (new DateTimeImmutable('now', $tz))->getTimestamp();

    $prev = null;
    $next = null;

    foreach ($extremes as $item) {
        $dt = parse_dt((string)($item['date'] ?? ''));
        if (!$dt) {
            continue;
        }

        $ts = $dt->getTimestamp();

        if ($ts <= $nowTs) {
            $prev = $item;
            continue;
        }

        if ($ts > $nowTs) {
            $next = $item;
            break;
        }
    }

    $prevType = strtolower((string)($prev['type'] ?? ''));
    $nextType = strtolower((string)($next['type'] ?? ''));

    if ($prev === null && $next !== null) {
        if ($nextType === 'high') {
            return $isRu ? 'к приливу' : 'toward high water';
        }
        if ($nextType === 'low') {
            return $isRu ? 'к отливу' : 'toward low water';
        }
    }

    if ($prev !== null && $next === null) {
        if ($prevType === 'low') {
            return $isRu ? 'после отлива' : 'after low water';
        }
        if ($prevType === 'high') {
            return $isRu ? 'после прилива' : 'after high water';
        }
    }

    if ($prevType === 'low' && $nextType === 'high') {
        return $isRu ? 'прибывает' : 'rising';
    }

    if ($prevType === 'high' && $nextType === 'low') {
        return $isRu ? 'убывает' : 'falling';
    }

    return $isRu ? 'по графику' : 'scheduled';
}

function make_day_label(?DateTimeImmutable $eventDt, ?DateTimeImmutable $baseDt, bool $isRu): ?string {
    if (!$eventDt || !$baseDt) {
        return null;
    }

    $eventDay = $eventDt->format('Y-m-d');
    $baseDay = $baseDt->format('Y-m-d');
    $tomorrow = $baseDt->modify('+1 day')->format('Y-m-d');

    if ($eventDay === $baseDay) {
        return $isRu ? 'сегодня' : 'today';
    }

    if ($eventDay === $tomorrow) {
        return $isRu ? 'завтра' : 'tomorrow';
    }

    return $eventDt->format('d.m');
}

$lat   = filter_input(INPUT_GET, 'lat', FILTER_VALIDATE_FLOAT);
$lon   = filter_input(INPUT_GET, 'lon', FILTER_VALIDATE_FLOAT);
$date  = trim((string)($_GET['date'] ?? date('Y-m-d')));
$units = trim((string)($_GET['units'] ?? 'm'));
$place = trim((string)($_GET['place'] ?? 'Location'));
$lang  = trim((string)($_GET['lang'] ?? 'ru'));

$isRu = ($lang === 'ru');

if ($lat === false || $lon === false) {
    respond(400, [
        'ok' => false,
        'error' => 'Missing or invalid lat/lon',
    ]);
}

$configPath = '/home/brkovic/private/worldtides.php';
if (!is_file($configPath)) {
    respond(500, [
        'ok' => false,
        'error' => 'WorldTides config not found',
    ]);
}

$config = require $configPath;
$key = trim((string)($config['key'] ?? ''));
if ($key === '' || $key === 'PASTE_YOUR_WORLDTIDES_KEY_HERE') {
    respond(500, [
        'ok' => false,
        'error' => 'WorldTides key not configured',
    ]);
}

$params = [
    'extremes'  => '',
    'lat'       => (string)$lat,
    'lon'       => (string)$lon,
    'date'      => $date,
    'days'      => '2',
    'localtime' => '1',
    'timezone'  => '',
    'datum'     => 'CD',
    'key'       => $key,
];

$url = 'https://www.worldtides.info/api/v3?' . http_build_query($params);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$raw = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($raw === false || $curlErr) {
    respond(502, [
        'ok' => false,
        'error' => 'WorldTides request failed',
        'details' => $curlErr,
    ]);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(502, [
        'ok' => false,
        'error' => 'Invalid WorldTides response',
        'raw' => mb_substr($raw, 0, 500),
    ]);
}

if (($data['status'] ?? 500) !== 200 || $httpCode >= 400) {
    respond(502, [
        'ok' => false,
        'error' => 'WorldTides returned error',
        'provider_status' => $data['status'] ?? $httpCode,
        'provider_error' => $data['error'] ?? 'Unknown provider error',
    ]);
}

$extremes = $data['extremes'] ?? [];
if (!is_array($extremes)) {
    $extremes = [];
}

$baseDt = null;
if (!empty($extremes)) {
    $baseDt = parse_dt((string)($extremes[0]['date'] ?? ''));
}
if (!$baseDt) {
    $baseDt = new DateTimeImmutable($date);
}

$events = [];
foreach ($extremes as $item) {
    $typeRaw = strtolower((string)($item['type'] ?? ''));
    $type = $typeRaw === 'high' ? 'high' : ($typeRaw === 'low' ? 'low' : 'unknown');
    $dt = parse_dt((string)($item['date'] ?? ''));

    $label = $isRu
        ? ($type === 'high' ? 'Прилив' : ($type === 'low' ? 'Отлив' : '—'))
        : ($type === 'high' ? 'High water' : ($type === 'low' ? 'Low water' : '—'));

    $events[] = [
        'time' => fmt_time((string)($item['date'] ?? '')),
        'type' => $type,
        'label' => $label,
        'height' => isset($item['height']) ? round((float)$item['height'], 2) : null,
        'units' => $units,
        'iso' => (string)($item['date'] ?? ''),
        'date' => $dt ? $dt->format('Y-m-d') : null,
        'day_label' => make_day_label($dt, $baseDt, $isRu),
    ];
}

$firstDt = null;
foreach ($extremes as $item) {
    $tmpDt = parse_dt((string)($item['date'] ?? ''));
    if ($tmpDt) {
        $firstDt = $tmpDt;
        break;
    }
}

$nowTs = null;
$todayInTz = null;
if ($firstDt) {
    $tz = $firstDt->getTimezone();
    $todayInTz = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
    if ($date === $todayInTz) {
        $nowTs = (new DateTimeImmutable('now', $tz))->getTimestamp();
    }
}

$nextHigh = null;
$nextLow = null;

foreach ($events as $event) {
    $eventDt = parse_dt((string)($event['iso'] ?? ''));
    $eventTs = $eventDt ? $eventDt->getTimestamp() : null;

    if ($event['type'] === 'high' && $nextHigh === null) {
        if ($nowTs === null || ($eventTs !== null && $eventTs > $nowTs)) {
            $nextHigh = $event;
        }
    }

    if ($event['type'] === 'low' && $nextLow === null) {
        if ($nowTs === null || ($eventTs !== null && $eventTs > $nowTs)) {
            $nextLow = $event;
        }
    }
}

$nowState = detect_now_state($extremes, $isRu, $date);

respond(200, [
    'ok' => true,
    'source' => 'worldtides',
    'location' => [
        'name' => $place,
        'region' => null,
        'country' => null,
        'lat' => $data['responseLat'] ?? $lat,
        'lon' => $data['responseLon'] ?? $lon,
        'timezone' => $data['timezone'] ?? null,
        'station_label' => $data['station'] ?? $place,
    ],
    'request' => [
        'date' => $date,
        'units' => $units,
        'datum' => $data['responseDatum'] ?? 'CD',
    ],
    'summary' => [
        'now_state' => $nowState,
        'next_high' => $nextHigh ? [
            'time' => $nextHigh['time'],
            'height' => $nextHigh['height'],
            'units' => $units,
            'iso' => $nextHigh['iso'],
            'day_label' => $nextHigh['day_label'],
        ] : null,
        'next_low' => $nextLow ? [
            'time' => $nextLow['time'],
            'height' => $nextLow['height'],
            'units' => $units,
            'iso' => $nextLow['iso'],
            'day_label' => $nextLow['day_label'],
        ] : null,
    ],
    'events' => $events,
    'provider' => [
        'atlas' => $data['atlas'] ?? null,
        'station' => $data['station'] ?? null,
        'copyright' => $data['copyright'] ?? null,
    ],
]);
