<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 10;
const NOMINATIM_TIMEOUT = 4;
const NOMINATIM_CONNECT_TIMEOUT = 2;
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

function respond(array $payload): void {
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_query(string $value): string {
    $value = strip_tags($value);
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    $value = trim($value);
    return mb_substr($value, 0, 80, 'UTF-8');
}

function query_length(string $value): int {
    return mb_strlen($value, 'UTF-8');
}

function normalize_text(string $value): string {
    return mb_strtolower($value, 'UTF-8');
}

function make_local_places(): array {
    return [
        ['id' => 'me-kotor', 'name' => 'Kotor', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.4247, 'lon' => 18.7712, 'timezone' => 'Europe/Podgorica', 'source' => 'local-priority'],
        ['id' => 'me-tivat', 'name' => 'Tivat', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.4304, 'lon' => 18.6963, 'timezone' => 'Europe/Podgorica', 'source' => 'local-priority'],
        ['id' => 'me-budva', 'name' => 'Budva', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.2864, 'lon' => 18.8400, 'timezone' => 'Europe/Podgorica', 'source' => 'local-priority'],
        ['id' => 'me-bar', 'name' => 'Bar', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.0931, 'lon' => 19.1003, 'timezone' => 'Europe/Podgorica', 'source' => 'local-priority'],
        ['id' => 'hr-split', 'name' => 'Split', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 43.5081, 'lon' => 16.4402, 'timezone' => 'Europe/Zagreb', 'source' => 'local-priority'],
        ['id' => 'hr-dubrovnik', 'name' => 'Dubrovnik', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 42.6507, 'lon' => 18.0944, 'timezone' => 'Europe/Zagreb', 'source' => 'local-priority'],
        ['id' => 'hr-zadar', 'name' => 'Zadar', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 44.1194, 'lon' => 15.2314, 'timezone' => 'Europe/Zagreb', 'source' => 'local-priority'],
        ['id' => 'it-bari', 'name' => 'Bari', 'region' => 'Apulia', 'country' => 'Italy', 'lat' => 41.1171, 'lon' => 16.8719, 'timezone' => 'Europe/Rome', 'source' => 'local-priority'],
        ['id' => 'gr-corfu', 'name' => 'Corfu', 'region' => 'Ionian Islands', 'country' => 'Greece', 'lat' => 39.6243, 'lon' => 19.9217, 'timezone' => 'Europe/Athens', 'source' => 'local-priority'],
    ];
}

function search_local_places(string $query, int $limit): array {
    $qLower = normalize_text($query);
    $matches = [];

    foreach (make_local_places() as $item) {
        $haystack = normalize_text($item['name'] . ' ' . $item['region'] . ' ' . $item['country']);
        if (mb_strpos($haystack, $qLower, 0, 'UTF-8') === false) {
            continue;
        }

        $nameLower = normalize_text((string)$item['name']);
        $score = 30;
        if ($nameLower === $qLower) {
            $score = 0;
        } elseif (mb_strpos($nameLower, $qLower, 0, 'UTF-8') === 0) {
            $score = 10;
        }

        $matches[] = ['score' => $score, 'item' => $item];
    }

    usort($matches, static function (array $a, array $b): int {
        return $a['score'] <=> $b['score']
            ?: strcmp((string)$a['item']['name'], (string)$b['item']['name']);
    });

    return array_slice(array_map(static fn(array $row): array => $row['item'], $matches), 0, $limit);
}

function first_non_empty(array $source, array $keys): ?string {
    foreach ($keys as $key) {
        $value = trim((string)($source[$key] ?? ''));
        if ($value !== '') {
            return $value;
        }
    }

    return null;
}

function host_for_user_agent(): string {
    $host = trim((string)($_SERVER['HTTP_HOST'] ?? 'brkovic.ltd'));
    $host = preg_replace('/[^a-z0-9.:\-\[\]]/i', '', $host) ?: 'brkovic.ltd';
    return $host;
}

function nominatim_user_agent(): string {
    return 'BrkovicLtdNavDesk/1.0 (https://' . host_for_user_agent() . '; tides place search)';
}

function fetch_nominatim(string $query, int $limit): array {
    $params = [
        'format' => 'jsonv2',
        'q' => $query,
        'limit' => (string)$limit,
        'addressdetails' => '1',
        'dedupe' => '1',
        'extratags' => '0',
        'namedetails' => '0',
    ];

    $acceptLanguage = trim((string)($_GET['lang'] ?? ''));
    if ($acceptLanguage !== '') {
        $params['accept-language'] = mb_substr($acceptLanguage, 0, 16, 'UTF-8');
    }

    $url = NOMINATIM_ENDPOINT . '?' . http_build_query($params);

    if (!function_exists('curl_init')) {
        return ['ok' => false, 'error' => 'curl_unavailable', 'items' => []];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => NOMINATIM_TIMEOUT,
        CURLOPT_CONNECTTIMEOUT => NOMINATIM_CONNECT_TIMEOUT,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: ' . nominatim_user_agent(),
        ],
    ]);

    $raw = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($raw === false || $curlErr !== '') {
        return ['ok' => false, 'error' => 'request_failed', 'details' => $curlErr, 'items' => []];
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        return ['ok' => false, 'error' => 'bad_status', 'status_code' => $httpCode, 'items' => []];
    }

    $items = json_decode($raw, true);
    if (!is_array($items)) {
        return ['ok' => false, 'error' => 'invalid_json', 'items' => []];
    }

    return ['ok' => true, 'items' => $items];
}

function normalize_nominatim_item(array $item): ?array {
    $lat = filter_var($item['lat'] ?? null, FILTER_VALIDATE_FLOAT);
    $lon = filter_var($item['lon'] ?? null, FILTER_VALIDATE_FLOAT);

    if ($lat === false || $lon === false) {
        return null;
    }

    $address = is_array($item['address'] ?? null) ? $item['address'] : [];
    $displayParts = array_values(array_filter(array_map('trim', explode(',', (string)($item['display_name'] ?? '')))));
    $name = trim((string)($item['name'] ?? ''));

    if ($name === '') {
        $name = first_non_empty($address, ['city', 'town', 'village', 'hamlet', 'municipality', 'county', 'state', 'country'])
            ?? ($displayParts[0] ?? '');
    }

    if ($name === '') {
        return null;
    }

    $region = first_non_empty($address, ['state', 'region', 'county', 'municipality']);
    $country = first_non_empty($address, ['country']);
    $osmType = preg_replace('/[^a-z0-9_-]/i', '', (string)($item['osm_type'] ?? 'osm'));
    $osmId = preg_replace('/[^a-z0-9_-]/i', '', (string)($item['osm_id'] ?? ''));
    $id = $osmId !== '' ? 'osm-' . strtolower($osmType ?: 'place') . '-' . $osmId : 'osm-' . substr(sha1($name . '|' . $lat . '|' . $lon), 0, 12);

    return [
        'id' => $id,
        'name' => mb_substr($name, 0, 90, 'UTF-8'),
        'region' => $region ? mb_substr($region, 0, 90, 'UTF-8') : null,
        'country' => $country ? mb_substr($country, 0, 90, 'UTF-8') : null,
        'lat' => round((float)$lat, 6),
        'lon' => round((float)$lon, 6),
        'timezone' => null,
        'source' => 'nominatim',
    ];
}

function dedupe_key(array $item): string {
    $name = normalize_text((string)($item['name'] ?? ''));
    $lat = round((float)($item['lat'] ?? 0), 2);
    $lon = round((float)($item['lon'] ?? 0), 2);
    return $name . '|' . $lat . '|' . $lon;
}

function merge_results(array $local, array $remote, int $limit): array {
    $results = [];
    $seen = [];

    foreach (array_merge($local, $remote) as $item) {
        $key = dedupe_key($item);
        if (isset($seen[$key])) {
            continue;
        }

        $seen[$key] = true;
        $results[] = $item;

        if (count($results) >= $limit) {
            break;
        }
    }

    return $results;
}

$q = clean_query((string)($_GET['q'] ?? ''));
$limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, [
    'options' => ['default' => DEFAULT_LIMIT, 'min_range' => 1, 'max_range' => MAX_LIMIT],
]);
$limit = is_int($limit) ? $limit : DEFAULT_LIMIT;

if ($q === '' || query_length($q) < MIN_QUERY_LENGTH) {
    respond([
        'ok' => true,
        'query' => $q,
        'status' => 'min_query',
        'message' => 'Enter at least ' . MIN_QUERY_LENGTH . ' characters.',
        'min_query_length' => MIN_QUERY_LENGTH,
        'limit' => $limit,
        'source' => 'none',
        'results' => [],
    ]);
}

$localResults = search_local_places($q, $limit);
$remoteResult = fetch_nominatim($q, $limit);
$remoteResults = [];
$fallback = null;

if (!empty($remoteResult['ok'])) {
    foreach ($remoteResult['items'] as $item) {
        if (!is_array($item)) {
            continue;
        }

        $normalized = normalize_nominatim_item($item);
        if ($normalized) {
            $remoteResults[] = $normalized;
        }
    }
} else {
    $fallback = [
        'source' => 'nominatim',
        'reason' => $remoteResult['error'] ?? 'unavailable',
    ];
}

$results = merge_results($localResults, $remoteResults, $limit);

respond([
    'ok' => true,
    'query' => $q,
    'status' => $fallback ? 'fallback' : 'ok',
    'message' => $fallback ? 'External place search is unavailable; showing local matches only.' : null,
    'min_query_length' => MIN_QUERY_LENGTH,
    'limit' => $limit,
    'source' => $fallback ? 'local-priority' : 'local-priority+nominatim',
    'fallback' => $fallback,
    'results' => $results,
]);
