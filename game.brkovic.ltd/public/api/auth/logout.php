<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('POST');

$token = session_token_from_request();
if ($token !== '') {
    storage_mutate('sessions', sessions_default(), function (array &$store) use ($token) {
        unset($store['sessions'][$token]);
    });
}

clear_session_cookie();
json_response(200, ['ok' => true]);

