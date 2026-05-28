<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $httpCode, array $payload): void {
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_place(mixed $value): string {
    $place = trim((string)$value);
    $place = preg_replace('/\s+/u', ' ', $place) ?? $place;
    return mb_substr($place, 0, 160, 'UTF-8');
}

function find_config(): ?array {
    $paths = [
        '/home/brkovic/private/distance-tools.php',
        __DIR__ . '/delivery-distance.config.php',
    ];

    foreach ($paths as $path) {
        if (!is_file($path)) {
            continue;
        }

        $config = require $path;
        if (is_array($config)) {
            return $config;
        }
    }

    return null;
}

function first_numeric_path(array $data, array $paths): ?float {
    foreach ($paths as $path) {
        $value = $data;
        foreach ($path as $part) {
            if (!is_array($value) || !array_key_exists($part, $value)) {
                continue 2;
            }
            $value = $value[$part];
        }

        if (is_numeric($value)) {
            return (float)$value;
        }
    }

    return null;
}

function distance_meters(array $data): ?float {
    $nauticalMiles = first_numeric_path($data, [
        ['route', 'sea', 'distanceNM'],
        ['steps', 0, 'distance', 'sea', 'distanceNM'],
        ['distanceNm'],
        ['distanceNM'],
        ['distance_nm'],
        ['nauticalMiles'],
        ['nautical_miles'],
        ['route', 'distanceNm'],
        ['route', 'nauticalMiles'],
        ['data', 'distanceNm'],
    ]);

    if ($nauticalMiles !== null && $nauticalMiles > 0) {
        return $nauticalMiles * 1852;
    }

    $meters = first_numeric_path($data, [
        ['routes', 0, 'distance'],
        ['route', 'routes', 0, 'distance'],
        ['data', 'routes', 0, 'distance'],
        ['data', 'route', 'distance'],
        ['route', 'distance'],
        ['distance'],
    ]);

    if ($meters !== null && $meters > 0) {
        return $meters;
    }

    $kilometers = first_numeric_path($data, [
        ['route', 'sea', 'distance'],
        ['steps', 0, 'distance', 'sea', 'distance'],
        ['distanceKm'],
        ['distance_km'],
        ['kilometers'],
        ['route', 'distanceKm'],
        ['route', 'kilometers'],
        ['data', 'distanceKm'],
    ]);

    if ($kilometers !== null && $kilometers > 0) {
        return $kilometers * 1000;
    }

    return null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'ok' => false,
        'error' => 'Method not allowed',
    ]);
}

$rawInput = file_get_contents('php://input');
$input = json_decode((string)$rawInput, true);

if (!is_array($input)) {
    respond(400, [
        'ok' => false,
        'error' => 'Invalid JSON request',
    ]);
}

$from = clean_place($input['from'] ?? '');
$to = clean_place($input['to'] ?? '');

if (mb_strlen($from, 'UTF-8') < 2 || mb_strlen($to, 'UTF-8') < 2) {
    respond(400, [
        'ok' => false,
        'error' => 'Start and finish points are required',
    ]);
}

$config = find_config();
$token = is_array($config)
    ? trim((string)($config['billing_token'] ?? $config['token'] ?? $config['key'] ?? ''))
    : '';

if ($token === '' || $token === 'PASTE_YOUR_DISTANCE_TOOLS_KEY_HERE') {
    respond(500, [
        'ok' => false,
        'error' => 'Distance Tools key is not configured',
    ]);
}

$payload = [
    'route' => [
        ['name' => $from],
        ['name' => $to],
    ],
];

$ch = curl_init('https://api.distance.tools/api/v2/distance/route/maritime');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 24,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
        'X-Billing-Token: ' . $token,
    ],
]);

$providerRaw = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($providerRaw === false || $curlErr) {
    respond(502, [
        'ok' => false,
        'error' => 'Distance Tools request failed',
        'details' => $curlErr,
    ]);
}

$providerData = json_decode((string)$providerRaw, true);
if (!is_array($providerData)) {
    respond(502, [
        'ok' => false,
        'error' => 'Invalid Distance Tools response',
        'provider_status' => $httpCode,
        'provider_excerpt' => mb_substr((string)$providerRaw, 0, 500, 'UTF-8'),
    ]);
}

if ($httpCode >= 400) {
    respond($httpCode === 401 || $httpCode === 403 ? 502 : $httpCode, [
        'ok' => false,
        'error' => 'Distance Tools returned an error',
        'provider_status' => $httpCode,
        'provider_message' => $providerData['message'] ?? $providerData['error'] ?? 'Provider error',
    ]);
}

$meters = distance_meters($providerData);
if ($meters === null || $meters <= 0) {
    respond(502, [
        'ok' => false,
        'error' => 'Distance Tools response does not contain a recognized distance',
        'provider_status' => $httpCode,
        'provider_keys' => array_slice(array_keys($providerData), 0, 12),
    ]);
}

respond(200, [
    'ok' => true,
    'provider' => 'distance.tools',
    'from' => $from,
    'to' => $to,
    'distance_m' => round($meters, 1),
    'distance_km' => round($meters / 1000, 1),
    'distance_nm' => round($meters / 1852, 1),
]);
