<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$q = trim((string)($_GET['q'] ?? ''));
$qLower = mb_strtolower($q, 'UTF-8');

$all = [
    ['id' => 'me-kotor', 'name' => 'Kotor', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.4247, 'lon' => 18.7712, 'timezone' => 'Europe/Podgorica', 'source' => 'mock'],
    ['id' => 'me-tivat', 'name' => 'Tivat', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.4304, 'lon' => 18.6963, 'timezone' => 'Europe/Podgorica', 'source' => 'mock'],
    ['id' => 'me-budva', 'name' => 'Budva', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.2864, 'lon' => 18.8400, 'timezone' => 'Europe/Podgorica', 'source' => 'mock'],
    ['id' => 'me-bar', 'name' => 'Bar', 'region' => 'Montenegro', 'country' => 'Montenegro', 'lat' => 42.0931, 'lon' => 19.1003, 'timezone' => 'Europe/Podgorica', 'source' => 'mock'],
    ['id' => 'hr-split', 'name' => 'Split', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 43.5081, 'lon' => 16.4402, 'timezone' => 'Europe/Zagreb', 'source' => 'mock'],
    ['id' => 'hr-dubrovnik', 'name' => 'Dubrovnik', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 42.6507, 'lon' => 18.0944, 'timezone' => 'Europe/Zagreb', 'source' => 'mock'],
    ['id' => 'hr-zadar', 'name' => 'Zadar', 'region' => 'Dalmatia', 'country' => 'Croatia', 'lat' => 44.1194, 'lon' => 15.2314, 'timezone' => 'Europe/Zagreb', 'source' => 'mock'],
    ['id' => 'it-bari', 'name' => 'Bari', 'region' => 'Apulia', 'country' => 'Italy', 'lat' => 41.1171, 'lon' => 16.8719, 'timezone' => 'Europe/Rome', 'source' => 'mock'],
    ['id' => 'gr-corfu', 'name' => 'Corfu', 'region' => 'Ionian Islands', 'country' => 'Greece', 'lat' => 39.6243, 'lon' => 19.9217, 'timezone' => 'Europe/Athens', 'source' => 'mock'],
];

if ($qLower === '') {
    $results = array_slice($all, 0, 8);
} else {
    $results = array_values(array_filter($all, static function (array $item) use ($qLower): bool {
        $haystack = mb_strtolower($item['name'] . ' ' . $item['region'] . ' ' . $item['country'], 'UTF-8');
        return mb_strpos($haystack, $qLower) !== false;
    }));
}

echo json_encode([
    'ok' => true,
    'query' => $q,
    'results' => $results,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
