<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');

$path = CONTENT_DIR . '/game-registry.json';
$data = json_decode((string) file_get_contents($path), true);
json_response(200, ['ok' => true, 'registry' => is_array($data) ? $data : ['games' => []]]);

