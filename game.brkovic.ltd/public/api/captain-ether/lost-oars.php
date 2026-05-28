<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('GET');
$user = current_user();

$items = captain_items_by_id();
$lost = [];
foreach (unresolved_weak_points($user['id']) as $point) {
    $item = $items[$point['item_id'] ?? ''] ?? null;
    if (!is_array($item)) continue;
    $lost[] = [
        'item_id' => $item['id'],
        'type' => $item['type'],
        'topic' => $item['topic'],
        'prompt' => $item['source_text'],
        'target_text' => $item['target_text'],
        'hint' => $item['hint_beginner'] ?? '',
        'reason' => $point['reason'] ?? 'weak',
        'wrong_count' => $point['wrong_count'] ?? 0,
        'hint_count' => $point['hint_count'] ?? 0,
        'skip_count' => $point['skip_count'] ?? 0,
    ];
}

json_response(200, ['ok' => true, 'lost_oars' => $lost]);

