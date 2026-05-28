<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('POST');

$input = read_json_body();
$email = clean_email($input['email'] ?? '');
$code = preg_replace('/\D+/', '', (string) ($input['code'] ?? ''));

if ($email === '' || strlen($code) !== 6) {
    json_response(422, ['ok' => false, 'error' => 'Enter email and 6-digit code']);
}

$matched = storage_mutate('login_codes', login_codes_default(), function (array &$store) use ($email, $code) {
    $now = now_ts();
    for ($i = count($store['codes']) - 1; $i >= 0; $i--) {
        $item = $store['codes'][$i];
        if (!is_array($item) || ($item['email'] ?? '') !== $email || !empty($item['used_at'])) {
            continue;
        }
        if ((int) ($item['expires_ts'] ?? 0) < $now) {
            continue;
        }
        if ((int) ($item['attempts'] ?? 0) >= 5) {
            return false;
        }

        $store['codes'][$i]['attempts'] = (int) ($item['attempts'] ?? 0) + 1;
        if (!password_verify($code, (string) ($item['code_hash'] ?? ''))) {
            return false;
        }

        $store['codes'][$i]['used_at'] = iso_time();
        return true;
    }
    return false;
});

if (!$matched) {
    json_response(401, ['ok' => false, 'error' => 'Code is invalid or expired']);
}

$user = find_or_create_user($email);
$session = create_session($user);

json_response(200, [
    'ok' => true,
    'user' => public_user($user),
    'csrf' => $session['csrf'],
]);

