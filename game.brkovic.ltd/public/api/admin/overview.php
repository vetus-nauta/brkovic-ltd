<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');
$user = current_user();
if (($user['role'] ?? 'player') !== 'admin') {
    json_response(403, ['ok' => false, 'error' => 'Admin role required']);
}

$users = storage_read('users', users_default());
$watchSessions = storage_read('watch_sessions', watch_sessions_default());

json_response(200, [
    'ok' => true,
    'overview' => [
        'users' => count($users['users'] ?? []),
        'watch_sessions' => count($watchSessions['sessions'] ?? []),
        'admin_sections' => [
            'users',
            'groups',
            'crews',
            'competitions',
            'results'
        ],
    ],
]);

