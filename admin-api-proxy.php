<?php
declare(strict_types=1);

session_name('brkovic_local_admin');
session_start();

$targetBase = 'https://brkovic.ltd/api';
$path = $_GET['path'] ?? '';

function proxy_error(int $status, string $message): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => ['message' => $message],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!is_string($path) || $path === '' || $path[0] !== '/') {
    proxy_error(400, 'Bad proxy path');
}

if (preg_match('/\r|\n|(?:^|\/)\.\.(?:\/|$)/', $path)) {
    proxy_error(400, 'Bad proxy path');
}

$parsedPath = parse_url($path);
$route = $parsedPath['path'] ?? '';
$query = isset($parsedPath['query']) ? '?' . $parsedPath['query'] : '';

if ($route === '' || preg_match('/(?:^|\/)\.\.(?:\/|$)/', $route)) {
    proxy_error(400, 'Bad proxy path');
}

$allowed = [
    '#^/auth/(login|logout|me)$#',
    '#^/admin/posts(?:/[^?]*)?$#',
    '#^/admin/journal-groups(?:/[^?]*)?$#',
    '#^/admin/comments(?:/[^?]*)?$#',
    '#^/admin/gps/rebuild$#',
];

$isAllowed = false;
foreach ($allowed as $pattern) {
    if (preg_match($pattern, $route)) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    proxy_error(403, 'Proxy path is not allowed');
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$targetUrl = $targetBase . $route . $query;
$headers = ['Accept: application/json'];

if (!empty($_SESSION['brkovic_live_cookie'])) {
    $headers[] = 'Cookie: ' . $_SESSION['brkovic_live_cookie'];
}

$ch = curl_init($targetUrl);
if ($ch === false) {
    proxy_error(500, 'Proxy is unavailable');
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 45,
]);

if ($method !== 'GET' && $method !== 'HEAD') {
    if (!empty($_FILES)) {
        $payload = [];
        foreach ($_POST as $key => $value) {
            $payload[$key] = $value;
        }
        foreach ($_FILES as $key => $file) {
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $payload[$key] = new CURLFile(
                    $file['tmp_name'],
                    $file['type'] ?: 'application/octet-stream',
                    $file['name'] ?: 'upload'
                );
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    } else {
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? 'application/json';
            curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($headers, ['Content-Type: ' . $contentType]));
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    }
}

$response = curl_exec($ch);
if ($response === false) {
    $message = curl_error($ch) ?: 'Proxy request failed';
    curl_close($ch);
    proxy_error(502, $message);
}

$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$rawHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

foreach (preg_split('/\r\n|\n|\r/', $rawHeaders) as $line) {
    if (stripos($line, 'Set-Cookie:') !== 0) {
        continue;
    }

    $cookie = trim(substr($line, strlen('Set-Cookie:')));
    $pair = explode(';', $cookie, 2)[0] ?? '';
    if (stripos($pair, 'ship_journal_admin=') === 0) {
        if ($method === 'POST' && $route === '/auth/logout') {
            unset($_SESSION['brkovic_live_cookie']);
        } else {
            $_SESSION['brkovic_live_cookie'] = $pair;
        }
    }
}

http_response_code($status ?: 502);
header('Content-Type: application/json; charset=utf-8');
echo $body;
