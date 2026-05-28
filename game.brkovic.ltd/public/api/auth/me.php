<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');

$user = current_user(false);
if (!$user) {
    json_response(200, ['ok' => true, 'user' => null]);
}

json_response(200, [
    'ok' => true,
    'user' => public_user($user),
    'csrf' => $user['_session']['csrf'] ?? null,
]);

