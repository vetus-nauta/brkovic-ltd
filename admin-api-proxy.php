<?php
declare(strict_types=1);

session_name('brkovic_local_admin');
session_start();

$configuredTargetBase = getenv('BRK_TOOL_PROXY_TARGET_BASE');
$targetBase = (is_string($configuredTargetBase) && trim($configuredTargetBase) !== '')
  ? trim($configuredTargetBase)
  : 'https://brkovic.ltd/api';
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

function is_local_proxy_host(string $host): bool {
  $normalized = strtolower(trim(preg_replace('/:\d+$/', '', $host)));
  if ($normalized === '') return false;
  if ($normalized === 'localhost' || $normalized === '127.0.0.1' || $normalized === '::1') {
    return true;
  }
  return (bool) preg_match('/(?:^|\.)local$/', $normalized);
}

function is_tls_cert_error(int $curlErrNo, string $message): bool {
  if ($curlErrNo === 60) {
    return true;
  }
  $lower = strtolower($message);
  return strpos($lower, 'subject name') !== false
    || strpos($lower, 'certificate verify failed') !== false
    || strpos($lower, 'ssl') !== false;
}

function is_html_block_payload(string $body, string $contentType = ''): bool {
  if (stripos($contentType, 'text/html') !== false) {
    return true;
  }
  return (bool) preg_match('/^\s*</', $body);
}

function html_error_message(string $body): string {
  $bodyLower = strtolower(trim(strip_tags($body)));
  if ($bodyLower === '') {
    return 'Сервис авторизации недоступен через прокси.';
  }
  if (strpos($bodyLower, 'firewall') !== false && strpos($bodyLower, 'blocking your connection') !== false) {
    return 'Серверная защита блокирует соединения с вашего IP. Пройдите разлочивание/капчу и повторите.';
  }
  if (strpos($bodyLower, 'unauthorized access') !== false || strpos($bodyLower, 'contact server owner') !== false) {
    return 'Запрос заблокирован облачной защитой сервера. Проверьте доступ к домену в браузере и повторите позже.';
  }
  return 'Сервис авторизации недоступен через прокси.';
}

if (!is_string($path) || $path === '' || $path[0] !== '/') {
    proxy_error(400, 'Bad proxy path');
}

if (preg_match('/\r|\n|(?:^|\/)[.]\.(?:\/|$)/', $path)) {
    proxy_error(400, 'Bad proxy path');
}

$parsedPath = parse_url($path);
$route = $parsedPath['path'] ?? '';
$query = isset($parsedPath['query']) ? '?' . $parsedPath['query'] : '';
$route = preg_replace('#^/api(?=/)#', '', $route);

if ($route === '' || preg_match('/(?:^|\/)[.]\.(?:\/|$)/', $route)) {
    proxy_error(400, 'Bad proxy path');
}

$allowed = [
    '#^/auth/(login|logout|me)$#',
    '#^/auth/user/(request-code|verify-code|me|logout|ecosystem-token)$#',
    '#^/auth/user/google/(start|status|callback)$#',
    '#^/public/journal(?:/[^?]*)?$#',
    '#^/admin/posts(?:/[^?]*)?$#',
    '#^/admin/journal-groups(?:/[^?]*)?$#',
    '#^/admin/journal-collections(?:/[^?]*)?$#',
    '#^/admin/posts/[^/]+/translations(?:/.+)?$#',
    '#^/admin/journal-collections/[^/]+/translations(?:/.+)?$#',
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

$storedCookies = $_SESSION['brkovic_live_cookies'] ?? [];
if (!is_array($storedCookies)) {
    $storedCookies = [];
}

$headers = ['Accept: application/json'];
$cookiePairs = [];
if (!empty($storedCookies['admin']) && is_string($storedCookies['admin'])) {
    $cookiePairs[] = $storedCookies['admin'];
}
if (!empty($storedCookies['toolUser']) && is_string($storedCookies['toolUser'])) {
    $cookiePairs[] = $storedCookies['toolUser'];
}
if (!empty($cookiePairs)) {
    $headers[] = 'Cookie: ' . implode('; ', $cookiePairs);
}

// local development/diagnostic mode: allow fallback without strict TLS verification
// on certificate mismatch when backend host is local.
$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
$targetHost = strtolower((string)parse_url($targetBase, PHP_URL_HOST));
$hostMismatchRisk = in_array($targetHost, ['brkovic.ltd', 'www.brkovic.ltd'], true);
$envAllowInsecure = getenv('BRK_TOOL_PROXY_ALLOW_INSECURE_SSL');
$fallbackTlsVerify = $hostMismatchRisk || is_local_proxy_host($host) || (is_string($envAllowInsecure) && strtolower($envAllowInsecure) === '1');
if (is_string($envAllowInsecure) && strtolower($envAllowInsecure) === '0') {
  $fallbackTlsVerify = false;
}

$payloadData = null;
$requestHeaders = $headers;

if ($method !== 'GET' && $method !== 'HEAD') {
  if (!empty($_FILES)) {
    $payloadData = [];
    foreach ($_POST as $key => $value) {
      $payloadData[$key] = $value;
    }
    foreach ($_FILES as $key => $file) {
      if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
        $payloadData[$key] = new CURLFile(
          $file['tmp_name'],
          $file['type'] ?: 'application/octet-stream',
          $file['name'] ?: 'upload'
        );
      }
    }
  } else {
    $body = file_get_contents('php://input');
    if ($body !== false && $body !== '') {
      $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? 'application/json';
      $requestHeaders = array_merge($headers, ['Content-Type: ' . $contentType]);
      $payloadData = $body;
    }
  }
}

$payloadToSend = $payloadData;
$attempts = [
  ['verifyPeer' => true, 'verifyHost' => 2],
];
if ($fallbackTlsVerify) {
  $attempts[] = ['verifyPeer' => false, 'verifyHost' => 0];
}

$response = false;
$curlErrorNo = 0;
$curlErrorMessage = '';

foreach ($attempts as $index => $attempt) {
  $ch = curl_init($targetUrl);
  if ($ch === false) {
      proxy_error(500, 'Proxy is unavailable');
  }

  curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HEADER => true,
      CURLOPT_FOLLOWLOCATION => false,
      CURLOPT_CUSTOMREQUEST => $method,
      CURLOPT_HTTPHEADER => $requestHeaders,
      CURLOPT_TIMEOUT => 45,
      CURLOPT_SSL_VERIFYPEER => $attempt['verifyPeer'],
      CURLOPT_SSL_VERIFYHOST => $attempt['verifyHost'],
  ]);

  if ($payloadToSend !== null && $method !== 'GET' && $method !== 'HEAD') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadToSend);
  }

  $response = curl_exec($ch);
  $curlErrorNo = (int) curl_errno($ch);
  $curlErrorMessage = curl_error($ch) ?: 'Proxy request failed';
  if ($response !== false) {
    break;
  }

  $isCertError = is_tls_cert_error($curlErrorNo, $curlErrorMessage);
  curl_close($ch);

  if (!$fallbackTlsVerify || !$isCertError || $index >= count($attempts) - 1) {
    break;
  }
}

if ($response === false) {
  proxy_error(502, $curlErrorMessage);
}

$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$rawHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
$responseContentType = '';
curl_close($ch);

foreach (preg_split('/\r\n|\n|\r/', $rawHeaders) as $line) {
    if (stripos($line, 'content-type:') === 0) {
        $responseContentType = trim(substr($line, strlen('content-type:')));
        continue;
    }
    if (stripos($line, 'Set-Cookie:') !== 0) {
        continue;
    }

    $cookie = trim(substr($line, strlen('Set-Cookie:')));
    $pair = explode(';', $cookie, 2)[0] ?? '';
    if (stripos($pair, 'ship_journal_admin=') === 0) {
        if ($method === 'POST' && $route === '/auth/logout') {
            unset($_SESSION['brkovic_live_cookies']['admin']);
        } else {
            $_SESSION['brkovic_live_cookies']['admin'] = $pair;
        }
        continue;
    }

    if (stripos($pair, 'ship_journal_tool_user=') === 0) {
        if ($method === 'POST' && $route === '/auth/user/logout') {
            unset($_SESSION['brkovic_live_cookies']['toolUser']);
        } else {
            $_SESSION['brkovic_live_cookies']['toolUser'] = $pair;
        }
    }
}

if (is_html_block_payload($body, $responseContentType)) {
  $status = 502;
  $body = json_encode([
    'success' => false,
    'error' => ['code' => 'HTTP_NON_JSON', 'message' => html_error_message($body)],
    'data' => null,
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

http_response_code($status ?: 502);
header('Content-Type: application/json; charset=utf-8');
echo $body;
