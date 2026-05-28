<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('POST');

$input = read_json_body();
$email = clean_email($input['email'] ?? '');
if ($email === '') {
    json_response(422, ['ok' => false, 'error' => 'Enter a valid email']);
}

$code = (string) random_int(100000, 999999);
$ttl = (int) app_config('login_code_ttl_minutes', 10);
$expires = now_ts() + ($ttl * 60);
$emailHash = hash('sha256', $email);
$ipHash = hash('sha256', client_ip());
$now = now_ts();

$rateLimited = storage_mutate('login_codes', login_codes_default(), function (array &$store) use ($email, $code, $expires, $emailHash, $ipHash, $now) {
    $store['codes'] = array_values(array_filter($store['codes'], static function ($item) use ($now) {
        return is_array($item) && (int) ($item['created_ts'] ?? 0) > $now - 86400;
    }));

    $recentEmail = 0;
    $recentIp = 0;
    foreach ($store['codes'] as $item) {
        if (($item['email_hash'] ?? '') === $emailHash && (int) ($item['created_ts'] ?? 0) > $now - 600) {
            $recentEmail++;
        }
        if (($item['ip_hash'] ?? '') === $ipHash && (int) ($item['created_ts'] ?? 0) > $now - 600) {
            $recentIp++;
        }
    }

    if ($recentEmail >= 3 || $recentIp >= 8) {
        return true;
    }

    $store['codes'][] = [
        'id' => 'code_' . bin2hex(random_bytes(8)),
        'email' => $email,
        'email_hash' => $emailHash,
        'ip_hash' => $ipHash,
        'code_hash' => password_hash($code, PASSWORD_DEFAULT),
        'created_at' => iso_time($now),
        'created_ts' => $now,
        'expires_at' => iso_time($expires),
        'expires_ts' => $expires,
        'used_at' => null,
        'attempts' => 0,
    ];

    return false;
});

if ($rateLimited) {
    json_response(429, ['ok' => false, 'error' => 'Too many code requests']);
}

$sent = send_login_code_email($email, $code);
if (!$sent) {
    json_response(500, ['ok' => false, 'error' => 'Could not send login code']);
}

$payload = [
    'ok' => true,
    'message' => 'Code sent',
    'expires_in_minutes' => $ttl,
];

if (app_config('app_env', 'local') !== 'production') {
    $payload['dev_code'] = $code;
}

json_response(200, $payload);

