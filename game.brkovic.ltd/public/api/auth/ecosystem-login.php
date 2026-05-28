<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');

function base64url_decode_string(string $value): string {
    $value = strtr($value, '-_', '+/');
    $padding = strlen($value) % 4;
    if ($padding) {
        $value .= str_repeat('=', 4 - $padding);
    }
    $decoded = base64_decode($value, true);
    return is_string($decoded) ? $decoded : '';
}

function clean_return_path(mixed $value): string {
    $path = trim((string) $value);
    if ($path === '' || !str_starts_with($path, '/') || str_starts_with($path, '//')) {
        return '/';
    }
    return mb_substr($path, 0, 300, 'UTF-8');
}

if (!app_config('ecosystem_sso_enabled', false)) {
    json_response(503, [
        'ok' => false,
        'error' => 'Ecosystem SSO is not enabled yet',
    ]);
}

$secret = (string) app_config('ecosystem_sso_secret', '');
if ($secret === '' || $secret === 'CHANGE_ME_SHARED_SECRET') {
    json_response(500, [
        'ok' => false,
        'error' => 'Ecosystem SSO secret is not configured',
    ]);
}

$token = trim((string) ($_GET['token'] ?? ''));
$parts = explode('.', $token, 2);
if (count($parts) !== 2) {
    json_response(400, ['ok' => false, 'error' => 'Invalid SSO token']);
}

[$payloadPart, $signature] = $parts;
$expected = hash_hmac('sha256', $payloadPart, $secret);
if (!hash_equals($expected, $signature)) {
    json_response(401, ['ok' => false, 'error' => 'Invalid SSO signature']);
}

$payload = json_decode(base64url_decode_string($payloadPart), true);
if (!is_array($payload)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid SSO payload']);
}

$email = clean_email($payload['email'] ?? '');
$ecosystemUserId = clean_text($payload['sub'] ?? $payload['ecosystem_user_id'] ?? '', 160);
$expires = (int) ($payload['exp'] ?? 0);

if ($email === '' || $ecosystemUserId === '' || $expires < now_ts()) {
    json_response(401, ['ok' => false, 'error' => 'SSO token is expired or incomplete']);
}

$user = find_or_create_user($email, [
    'provider' => 'brkovic.ltd',
    'ecosystem_user_id' => $ecosystemUserId,
    'name' => $payload['name'] ?? '',
]);
create_session($user);

header('Location: ' . clean_return_path($payload['return_to'] ?? '/'), true, 302);
exit;

