<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('POST');
$user = current_user();
require_csrf($user);

$unresolved = count(unresolved_weak_points($user['id']));
if ($unresolved === 0) {
    json_response(200, ['ok' => true, 'force_hangar' => false, 'message' => 'Пока вёсла на месте.', 'skip_count' => 0]);
}

$progress = storage_mutate('progress', progress_default(), function (array &$store) use ($user) {
    $progress = user_progress($user['id']);
    $progress['skip_cleanup_count'] = min(3, (int) ($progress['skip_cleanup_count'] ?? 0) + 1);
    $progress['updated_at'] = iso_time();
    $store['users'][$user['id']] = $progress;
    return $progress;
});

$count = (int) ($progress['skip_cleanup_count'] ?? 0);
$message = match ($count) {
    1 => 'Ладно, капитан. Пару вёсел оставили за бортом, но пока идём.',
    2 => 'Так-так. Вёсла уже не просто плавают, они начинают жить своей жизнью.',
    default => 'Всё, капитан. Дальше без вёсел не пустим. Пора в ангар.',
};

json_response(200, [
    'ok' => true,
    'skip_count' => $count,
    'reward_multiplier' => $count === 1 ? 0.8 : ($count === 2 ? 0.6 : 0),
    'force_hangar' => $count >= 3,
    'message' => $message,
]);

