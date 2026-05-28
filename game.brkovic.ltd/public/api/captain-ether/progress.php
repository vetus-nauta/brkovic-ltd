<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');
$user = current_user();
$progress = user_progress($user['id']);

json_response(200, [
    'ok' => true,
    'progress' => [
        'completed_watches' => $progress['completed_watches'] ?? 0,
        'last_level' => $progress['last_level'] ?? 'beginner',
        'skip_cleanup_count' => $progress['skip_cleanup_count'] ?? 0,
        'unresolved_lost_oars' => count(unresolved_weak_points($user['id'])),
        'history' => $progress['history'] ?? [],
    ],
]);

