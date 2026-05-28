<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $httpCode, array $payload): void {
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_data(): array {
    $data = $_GET;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw ?: '{}', true);
        if (is_array($json)) {
            $data = array_merge($data, $json);
        }
    }

    return $data;
}

function request_float(array $data, string $key, ?float $default = null): ?float {
    if (!array_key_exists($key, $data) || $data[$key] === '') {
        return $default;
    }

    $value = filter_var($data[$key], FILTER_VALIDATE_FLOAT);
    return $value === false ? null : (float)$value;
}

function request_int(array $data, string $key, int $default): int {
    if (!array_key_exists($key, $data) || $data[$key] === '') {
        return $default;
    }

    $value = filter_var($data[$key], FILTER_VALIDATE_INT);
    return $value === false ? $default : (int)$value;
}

function clean_text($value, string $default, int $maxLength = 120): string {
    $text = trim((string)($value ?? $default));
    if ($text === '') {
        return $default;
    }

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function normalize_units(string $units): string {
    $normalized = strtolower(trim($units));
    return in_array($normalized, ['ft', 'feet'], true) ? 'ft' : 'm';
}

function provider_height_factor(string $units): float {
    return $units === 'ft' ? 3.28084 : 1.0;
}

function valid_date_or_fail(string $date): string {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        respond(400, [
            'ok' => false,
            'error' => 'Invalid date',
        ]);
    }

    $dt = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$dt || $dt->format('Y-m-d') !== $date) {
        respond(400, [
            'ok' => false,
            'error' => 'Invalid date',
        ]);
    }

    return $date;
}

function parse_point_dt($value, ?DateTimeZone $tz = null): ?DateTimeImmutable {
    try {
        if (is_numeric($value)) {
            $dt = new DateTimeImmutable('@' . (string)$value);
            return $tz ? $dt->setTimezone($tz) : $dt;
        }

        $dt = new DateTimeImmutable((string)$value);
        return $tz ? $dt->setTimezone($tz) : $dt;
    } catch (Throwable $e) {
        return null;
    }
}

function is_local_request(): bool {
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    return str_starts_with($host, '127.0.0.1')
        || str_starts_with($host, 'localhost')
        || str_starts_with($host, '[::1]');
}

function label_for_type(string $type, bool $isRu): string {
    if ($type === 'high') {
        return $isRu ? 'Прилив' : 'High water';
    }

    if ($type === 'low') {
        return $isRu ? 'Отлив' : 'Low water';
    }

    return '-';
}

function build_mock_provider(string $date, int $days, float $lat, float $lon): array {
    $tz = new DateTimeZone('Europe/Podgorica');
    $start = new DateTimeImmutable($date . 'T00:00:00', $tz);
    $heights = [];
    $extremes = [];

    for ($minutes = 0; $minutes < $days * 24 * 60; $minutes += 30) {
        $dt = $start->modify('+' . $minutes . ' minutes');
        $hours = $minutes / 60;
        $dayOffset = (int)floor($minutes / (24 * 60));
        $springNeap = 0.04 * sin(2 * M_PI * $dayOffset / 7);
        $height = 0.55 + (0.37 + $springNeap) * cos(2 * M_PI * ($hours - 10.55) / 12.42);

        $heights[] = [
            'date' => $dt->format(DATE_ATOM),
            'height' => round($height, 2),
        ];
    }

    $dailyExtremes = [
        ['04:12', 'Low', 0.18],
        ['10:34', 'High', 0.92],
        ['16:48', 'Low', 0.22],
        ['23:05', 'High', 0.88],
    ];

    for ($day = 0; $day < $days; $day += 1) {
        $base = $start->modify('+' . $day . ' day');
        $adjustment = 0.04 * sin(2 * M_PI * $day / 7);

        foreach ($dailyExtremes as $point) {
            [$time, $type, $height] = $point;
            $dt = new DateTimeImmutable($base->format('Y-m-d') . 'T' . $time . ':00', $tz);
            $extremes[] = [
                'date' => $dt->format(DATE_ATOM),
                'type' => $type,
                'height' => round($height + ($type === 'High' ? $adjustment : -$adjustment / 2), 2),
            ];
        }
    }

    return [
        'status' => 200,
        'timezone' => 'Europe/Podgorica',
        'responseLat' => $lat,
        'responseLon' => $lon,
        'responseDatum' => 'CD',
        'atlas' => 'local mock',
        'station' => 'local mock',
        'heights' => $heights,
        'extremes' => $extremes,
    ];
}

function provider_timezone(array $provider): ?DateTimeZone {
    if (empty($provider['timezone'])) {
        return null;
    }

    try {
        return new DateTimeZone((string)$provider['timezone']);
    } catch (Throwable $e) {
        return null;
    }
}

function normalize_series(array $heights, ?DateTimeZone $tz, float $charted, float $draft, float $requiredDepth, string $units): array {
    $series = [];
    $heightFactor = provider_height_factor($units);

    foreach ($heights as $point) {
        if (!is_array($point)) {
            continue;
        }

        $rawTime = $point['dt'] ?? $point['date'] ?? '';
        $dt = parse_point_dt($rawTime, $tz);
        $height = isset($point['height']) ? (float)$point['height'] * $heightFactor : null;

        if (!$dt || $height === null) {
            continue;
        }

        $availableDepth = $charted + $height;
        $clearance = $availableDepth - $draft;
        $margin = $availableDepth - $requiredDepth;

        $series[] = [
            'date' => $dt->format('Y-m-d'),
            'time' => $dt->format('H:i'),
            'iso' => $dt->format(DATE_ATOM),
            'tide_height' => round($height, 2),
            'available_depth' => round($availableDepth, 2),
            'clearance' => round($clearance, 2),
            'margin' => round($margin, 2),
            'safe' => $margin >= 0,
            'units' => $units,
        ];
    }

    return $series;
}

function normalize_extremes(array $extremes, ?DateTimeZone $tz, string $units, bool $isRu): array {
    $events = [];
    $heightFactor = provider_height_factor($units);

    foreach ($extremes as $item) {
        if (!is_array($item)) {
            continue;
        }

        $rawTime = $item['dt'] ?? $item['date'] ?? '';
        $dt = parse_point_dt($rawTime, $tz);
        if (!$dt) {
            continue;
        }

        $typeRaw = strtolower((string)($item['type'] ?? ''));
        $type = $typeRaw === 'high' ? 'high' : ($typeRaw === 'low' ? 'low' : 'unknown');
        $height = isset($item['height']) ? round((float)$item['height'] * $heightFactor, 2) : null;

        $events[] = [
            'date' => $dt->format('Y-m-d'),
            'time' => $dt->format('H:i'),
            'iso' => $dt->format(DATE_ATOM),
            'type' => $type,
            'label' => label_for_type($type, $isRu),
            'height' => $height,
            'tide_height' => $height,
            'units' => $units,
        ];
    }

    return $events;
}

function summarize_safe_window(array $rows): array {
    $minMargin = null;
    $minAvailableDepth = null;

    foreach ($rows as $row) {
        $margin = (float)$row['margin'];
        $available = (float)$row['available_depth'];

        if ($minMargin === null || $margin < $minMargin) {
            $minMargin = $margin;
        }

        if ($minAvailableDepth === null || $available < $minAvailableDepth) {
            $minAvailableDepth = $available;
        }
    }

    $first = $rows[0];
    $last = $rows[count($rows) - 1];

    return [
        'date_start' => $first['date'],
        'date_end' => $last['date'],
        'start_time' => $first['time'],
        'end_time' => $last['time'],
        'start_iso' => $first['iso'],
        'end_iso' => $last['iso'],
        'min_margin' => $minMargin !== null ? round($minMargin, 2) : null,
        'min_available_depth' => $minAvailableDepth !== null ? round($minAvailableDepth, 2) : null,
        'point_count' => count($rows),
    ];
}

function find_safe_windows(array $series): array {
    $windows = [];
    $current = [];

    foreach ($series as $row) {
        if (!empty($row['safe'])) {
            $current[] = $row;
            continue;
        }

        if ($current) {
            $windows[] = summarize_safe_window($current);
            $current = [];
        }
    }

    if ($current) {
        $windows[] = summarize_safe_window($current);
    }

    return $windows;
}

function daily_summaries(array $series, array $events): array {
    $byDate = [];

    foreach ($series as $row) {
        $date = (string)$row['date'];
        if (!isset($byDate[$date])) {
            $byDate[$date] = [
                'date' => $date,
                'point_count' => 0,
                'safe_point_count' => 0,
                'min_tide_height' => null,
                'max_tide_height' => null,
                'min_available_depth' => null,
                'max_available_depth' => null,
                'min_margin' => null,
                'max_margin' => null,
                'events' => [],
                'safe_windows' => [],
            ];
        }

        $summary = &$byDate[$date];
        $summary['point_count'] += 1;
        if (!empty($row['safe'])) {
            $summary['safe_point_count'] += 1;
        }

        foreach ([
            'min_tide_height' => ['tide_height', 'min'],
            'max_tide_height' => ['tide_height', 'max'],
            'min_available_depth' => ['available_depth', 'min'],
            'max_available_depth' => ['available_depth', 'max'],
            'min_margin' => ['margin', 'min'],
            'max_margin' => ['margin', 'max'],
        ] as $target => $rule) {
            [$source, $mode] = $rule;
            $value = (float)$row[$source];

            if ($summary[$target] === null || ($mode === 'min' && $value < $summary[$target]) || ($mode === 'max' && $value > $summary[$target])) {
                $summary[$target] = $value;
            }
        }

        unset($summary);
    }

    foreach ($events as $event) {
        $date = (string)($event['date'] ?? '');
        if (isset($byDate[$date])) {
            $byDate[$date]['events'][] = $event;
        }
    }

    foreach ($byDate as $date => $summary) {
        $rows = array_values(array_filter($series, static fn(array $row): bool => $row['date'] === $date));
        $byDate[$date]['safe_ratio'] = $summary['point_count'] > 0
            ? round($summary['safe_point_count'] / $summary['point_count'], 3)
            : 0.0;
        $byDate[$date]['safe_windows'] = find_safe_windows($rows);

        foreach (['min_tide_height', 'max_tide_height', 'min_available_depth', 'max_available_depth', 'min_margin', 'max_margin'] as $key) {
            $byDate[$date][$key] = $byDate[$date][$key] !== null ? round((float)$byDate[$date][$key], 2) : null;
        }
    }

    return array_values($byDate);
}

$input = request_data();
$lat = request_float($input, 'lat');
$lon = request_float($input, 'lon');

if ($lat === null || $lon === null) {
    respond(400, [
        'ok' => false,
        'error' => 'Missing or invalid lat/lon',
    ]);
}

$date = valid_date_or_fail(clean_text($input['date'] ?? date('Y-m-d'), date('Y-m-d'), 20));
$days = max(1, min(7, request_int($input, 'days', 7)));
$units = normalize_units(clean_text($input['units'] ?? 'm', 'm', 12));
$place = clean_text($input['place'] ?? 'Location', 'Location');
$lang = clean_text($input['lang'] ?? 'ru', 'ru', 8);
$isRu = $lang === 'ru';
$charted = request_float($input, 'charted_depth', 0.0);
$draft = request_float($input, 'draft', 0.0);
$ukc = request_float($input, 'ukc', 0.0);

if ($charted === null || $draft === null || $ukc === null) {
    respond(400, [
        'ok' => false,
        'error' => 'Missing or invalid vessel/depth settings',
    ]);
}

$requiredDepth = $draft + $ukc;
$step = 1800;
$configPath = '/home/brkovic/private/worldtides.php';
$provider = null;
$source = 'worldtides';

if (!is_file($configPath)) {
    if (!is_local_request()) {
        respond(500, [
            'ok' => false,
            'error' => 'WorldTides config not found',
        ]);
    }

    $provider = build_mock_provider($date, $days, (float)$lat, (float)$lon);
    $source = 'local-mock';
} else {
    $config = require $configPath;
    $key = trim((string)($config['key'] ?? ''));

    if ($key === '' || $key === 'PASTE_YOUR_WORLDTIDES_KEY_HERE') {
        if (!is_local_request()) {
            respond(500, [
                'ok' => false,
                'error' => 'WorldTides key not configured',
            ]);
        }

        $provider = build_mock_provider($date, $days, (float)$lat, (float)$lon);
        $source = 'local-mock';
    } else {
        $params = [
            'heights' => '',
            'extremes' => '',
            'lat' => (string)$lat,
            'lon' => (string)$lon,
            'date' => $date,
            'days' => (string)$days,
            'step' => (string)$step,
            'localtime' => '1',
            'timezone' => '',
            'datum' => 'CD',
            'key' => $key,
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

        $provider = json_decode($raw, true);
        if (!is_array($provider)) {
            respond(502, [
                'ok' => false,
                'error' => 'Invalid WorldTides response',
            ]);
        }

        if (($provider['status'] ?? 500) !== 200 || $httpCode >= 400) {
            respond(502, [
                'ok' => false,
                'error' => 'WorldTides returned error',
                'provider_status' => $provider['status'] ?? $httpCode,
                'provider_error' => $provider['error'] ?? 'Unknown provider error',
            ]);
        }
    }
}

$heights = $provider['heights'] ?? [];
if (!is_array($heights)) {
    $heights = [];
}

$rawExtremes = $provider['extremes'] ?? [];
if (!is_array($rawExtremes)) {
    $rawExtremes = [];
}

$providerTz = provider_timezone($provider);
$series = normalize_series($heights, $providerTz, (float)$charted, (float)$draft, (float)$requiredDepth, $units);
$events = normalize_extremes($rawExtremes, $providerTz, $units, $isRu);
$daily = daily_summaries($series, $events);

respond(200, [
    'ok' => true,
    'source' => $source,
    'location' => [
        'name' => $place,
        'region' => null,
        'country' => null,
        'lat' => $provider['responseLat'] ?? $lat,
        'lon' => $provider['responseLon'] ?? $lon,
        'timezone' => $provider['timezone'] ?? null,
        'station_label' => $provider['station'] ?? ($place ?: 'Location'),
    ],
    'provider' => [
        'atlas' => $provider['atlas'] ?? null,
        'station' => $provider['station'] ?? null,
        'datum' => $provider['responseDatum'] ?? 'CD',
        'copyright' => $provider['copyright'] ?? null,
    ],
    'request' => [
        'date' => $date,
        'days' => $days,
        'units' => $units,
        'step' => $step,
        'place' => $place,
        'lat' => $lat,
        'lon' => $lon,
        'lang' => $lang,
    ],
    'settings' => [
        'charted_depth' => round((float)$charted, 2),
        'draft' => round((float)$draft, 2),
        'ukc' => round((float)$ukc, 2),
        'required_depth' => round((float)$requiredDepth, 2),
        'units' => $units,
        'formula' => [
            'available_depth' => 'charted_depth + tide_height',
            'required_depth' => 'draft + ukc',
            'safe' => 'available_depth >= required_depth',
        ],
    ],
    'series' => $series,
    'events' => $events,
    'extremes' => $events,
    'daily' => $daily,
    'safe_windows' => find_safe_windows($series),
]);
