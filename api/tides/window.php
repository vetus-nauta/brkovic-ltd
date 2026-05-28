<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $httpCode, array $payload): void {
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function parse_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
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

function fmt_time($value, ?DateTimeZone $tz = null): string {
    $dt = parse_point_dt($value, $tz);
    return $dt ? $dt->format('H:i') : (string)$value;
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
            $windows[] = $current;
            $current = [];
        }
    }

    if ($current) {
        $windows[] = $current;
    }

    return $windows;
}

function is_local_request(): bool {
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    return str_starts_with($host, '127.0.0.1')
        || str_starts_with($host, 'localhost')
        || str_starts_with($host, '[::1]');
}

function build_mock_provider(string $date, float $lat, float $lon): array {
    $tz = new DateTimeZone('Europe/Podgorica');
    $start = new DateTimeImmutable($date . 'T00:00:00', $tz);
    $heights = [];

    for ($minutes = 0; $minutes <= 24 * 60; $minutes += 30) {
        $dt = $start->modify('+' . $minutes . ' minutes');
        $hours = $minutes / 60;
        $height = 0.55 + 0.37 * cos(2 * M_PI * ($hours - 10.55) / 12.42);
        $heights[] = [
            'date' => $dt->format(DATE_ATOM),
            'height' => round($height, 2),
        ];
    }

    return [
        'status' => 200,
        'timezone' => 'Europe/Podgorica',
        'responseLat' => $lat,
        'responseLon' => $lon,
        'heights' => $heights,
    ];
}

$data = parse_json_body();

$lang = trim((string)($data['lang'] ?? 'ru'));
$isRu = ($lang === 'ru');

$lat = isset($data['lat']) ? (float)$data['lat'] : null;
$lon = isset($data['lon']) ? (float)$data['lon'] : null;
$date = trim((string)($data['date'] ?? date('Y-m-d')));
$units = trim((string)($data['units'] ?? 'm'));
$charted = isset($data['charted_depth']) ? (float)$data['charted_depth'] : null;
$draft = isset($data['draft']) ? (float)$data['draft'] : null;
$ukc = isset($data['ukc']) ? (float)$data['ukc'] : 0.0;

if ($lat === null || $lon === null || $charted === null || $draft === null) {
    respond(400, [
        'ok' => false,
        'error' => 'Missing required parameters',
    ]);
}

$requiredDepth = $draft + $ukc;
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

    $provider = build_mock_provider($date, (float)$lat, (float)$lon);
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

        $provider = build_mock_provider($date, (float)$lat, (float)$lon);
        $source = 'local-mock';
    } else {
        $params = [
            'heights'   => '',
            'lat'       => (string)$lat,
            'lon'       => (string)$lon,
            'date'      => $date,
            'days'      => '1',
            'step'      => '1800',
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
if (!is_array($heights) || !$heights) {
    respond(200, [
        'ok' => true,
        'source' => $source,
        'request' => [
            'date' => $date,
            'units' => $units,
            'charted_depth' => $charted,
            'draft' => $draft,
            'ukc' => $ukc,
        ],
        'result' => [
            'status' => 'not_passable',
            'status_label' => $isRu ? 'Проход не рекомендован' : 'Passage not advised',
            'window_start' => null,
            'window_end' => null,
            'min_under_keel_clearance' => null,
            'units' => $units,
            'message' => $isRu
                ? 'Не удалось получить ряд уровней воды для расчёта окна.'
                : 'Could not retrieve water-level series for passage window calculation.',
        ],
        'series' => [],
    ]);
}

$providerTz = null;
if (!empty($provider['timezone'])) {
    try {
        $providerTz = new DateTimeZone((string)$provider['timezone']);
    } catch (Throwable $e) {
        $providerTz = null;
    }
}

$series = [];
$selectedDaySeries = [];
$minSafeUkc = null;

foreach ($heights as $point) {
    $rawTime = $point['dt'] ?? $point['date'] ?? '';
    $dt = parse_point_dt($rawTime, $providerTz);
    $height = isset($point['height']) ? (float)$point['height'] : null;

    if (!$dt || $height === null) {
        continue;
    }

    $availableDepth = $charted + $height;
    $clearance = $availableDepth - $draft;
    $margin = $availableDepth - $requiredDepth;
    $isSafe = $margin >= 0;

    $row = [
        'iso' => is_numeric($rawTime) ? (string)$rawTime : $dt->format(DATE_ATOM),
        'time' => $dt->format('H:i'),
        'date' => $dt->format('Y-m-d'),
        'tide_height' => round($height, 2),
        'available_depth' => round($availableDepth, 2),
        'clearance' => round($clearance, 2),
        'margin' => round($margin, 2),
        'safe' => $isSafe,
        'units' => $units,
    ];
    $series[] = $row;

    if ($row['date'] === $date) {
        $selectedDaySeries[] = $row;
        if ($isSafe && ($minSafeUkc === null || $margin < $minSafeUkc)) {
            $minSafeUkc = $margin;
        }
    }
}

if (!$selectedDaySeries) {
    respond(200, [
        'ok' => true,
        'source' => $source,
        'location' => [
            'lat' => $provider['responseLat'] ?? $lat,
            'lon' => $provider['responseLon'] ?? $lon,
            'timezone' => $provider['timezone'] ?? null,
        ],
        'request' => [
            'date' => $date,
            'units' => $units,
            'charted_depth' => $charted,
            'draft' => $draft,
            'ukc' => $ukc,
            'required_depth' => round($requiredDepth, 2),
        ],
        'result' => [
            'status' => 'not_passable',
            'status_label' => $isRu ? 'Проход не рекомендован' : 'Passage not advised',
            'window_start' => null,
            'window_end' => null,
            'min_under_keel_clearance' => null,
            'units' => $units,
            'message' => $isRu
                ? 'Нет данных уровней воды на выбранную дату.'
                : 'No water-level data available for the selected date.',
        ],
        'series' => $selectedDaySeries,
    ]);
}

$minAvailableDepth = null;
$maxAvailableDepth = null;

foreach ($selectedDaySeries as $row) {
    $available = (float)$row['available_depth'];
    if ($minAvailableDepth === null || $available < $minAvailableDepth) {
        $minAvailableDepth = $available;
    }
    if ($maxAvailableDepth === null || $available > $maxAvailableDepth) {
        $maxAvailableDepth = $available;
    }
}

$safeWindows = find_safe_windows($selectedDaySeries);

if (!$safeWindows) {
    $maxMargin = null;
    foreach ($selectedDaySeries as $row) {
        if ($maxMargin === null || $row['margin'] > $maxMargin) {
            $maxMargin = $row['margin'];
        }
    }

    respond(200, [
        'ok' => true,
        'source' => $source,
        'location' => [
            'lat' => $provider['responseLat'] ?? $lat,
            'lon' => $provider['responseLon'] ?? $lon,
            'timezone' => $provider['timezone'] ?? null,
        ],
        'request' => [
            'date' => $date,
            'units' => $units,
            'charted_depth' => $charted,
            'draft' => $draft,
            'ukc' => $ukc,
            'required_depth' => round($requiredDepth, 2),
        ],
        'result' => [
            'status' => 'not_passable',
            'status_label' => $isRu ? 'Проход не рекомендован' : 'Passage not advised',
            'window_start' => null,
            'window_end' => null,
            'min_under_keel_clearance' => $maxMargin !== null ? round($maxMargin, 2) : null,
            'units' => $units,
            'message' => $isRu
                ? 'На выбранную дату безопасное окно прохода не найдено.'
                : 'No safe passage window was found for the selected date.',
        'required_depth' => round($requiredDepth, 2),
        'min_available_depth' => $minAvailableDepth !== null ? round($minAvailableDepth, 2) : null,
        'max_available_depth' => $maxAvailableDepth !== null ? round($maxAvailableDepth, 2) : null,
        ],
        'series' => $selectedDaySeries,
    ]);
}

usort($safeWindows, static function (array $a, array $b): int {
    return count($b) <=> count($a);
});

$bestWindow = $safeWindows[0];
$windowStart = $bestWindow[0]['time'];
$windowEnd = $bestWindow[count($bestWindow) - 1]['time'];

respond(200, [
    'ok' => true,
    'source' => $source,
    'location' => [
        'lat' => $provider['responseLat'] ?? $lat,
        'lon' => $provider['responseLon'] ?? $lon,
        'timezone' => $provider['timezone'] ?? null,
    ],
    'request' => [
        'date' => $date,
        'units' => $units,
        'charted_depth' => $charted,
        'draft' => $draft,
        'ukc' => $ukc,
        'required_depth' => round($requiredDepth, 2),
    ],
    'result' => [
        'status' => 'passable',
        'status_label' => $isRu ? 'Проход возможен' : 'Passage possible',
        'window_start' => $windowStart,
        'window_end' => $windowEnd,
        'min_under_keel_clearance' => $minSafeUkc !== null ? round($minSafeUkc, 2) : null,
        'units' => $units,
        'message' => $isRu
            ? 'Безопасное окно: ' . $windowStart . '–' . $windowEnd . '. Минимальный запас под килем: ' . round((float)$minSafeUkc, 2) . ' ' . $units . '.'
            : 'Safe window: ' . $windowStart . '–' . $windowEnd . '. Minimum under keel clearance: ' . round((float)$minSafeUkc, 2) . ' ' . $units . '.',
        'required_depth' => round($requiredDepth, 2),
        'min_available_depth' => $minAvailableDepth !== null ? round($minAvailableDepth, 2) : null,
        'max_available_depth' => $maxAvailableDepth !== null ? round($maxAvailableDepth, 2) : null,
    ],
    'series' => $selectedDaySeries,
]);
