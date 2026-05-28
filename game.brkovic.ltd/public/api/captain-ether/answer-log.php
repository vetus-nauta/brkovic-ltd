<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';
require __DIR__ . '/_answer-logging.php';

require_method('GET');
$user = current_user();
if (($user['role'] ?? 'player') !== 'admin') {
    json_response(403, ['ok' => false, 'error' => 'Admin role required']);
}

$limit = max(1, min(200, (int) ($_GET['limit'] ?? 100)));
$groupLimit = max(1, min(50, (int) ($_GET['group_limit'] ?? 20)));
$answerLimit = max(1, min(10, (int) ($_GET['answer_limit'] ?? 5)));
$itemId = preg_replace('/[^a-z0-9_]/i', '', (string) ($_GET['item_id'] ?? ''));
$kind = preg_replace('/[^a-z_]/i', '', (string) ($_GET['kind'] ?? ''));

$store = storage_read('captain_answer_logs', captain_answer_logs_default());
$entries = array_values(array_filter($store['entries'] ?? [], static function ($entry) use ($itemId, $kind) {
    if (!is_array($entry)) return false;
    if ($itemId !== '' && ($entry['item_id'] ?? '') !== $itemId) return false;
    if ($kind !== '' && ($entry['log_kind'] ?? '') !== $kind) return false;
    return true;
}));

$entries = array_reverse($entries);
$summary = captain_answer_log_summary($entries);
$reviewGroups = captain_answer_log_review_groups($entries, $groupLimit, $answerLimit);

json_response(200, [
    'ok' => true,
    'summary' => [
        'stored_entries' => count($store['entries'] ?? []),
        'total_logged' => (int) ($store['total_logged'] ?? 0),
        'filtered_entries' => count($entries),
        'limit' => $limit,
        'group_limit' => $groupLimit,
        'answer_limit' => $answerLimit,
        'updated_at' => $store['updated_at'] ?? null,
        'filters' => [
            'item_id' => $itemId,
            'kind' => $kind,
        ],
    ] + $summary,
    'review_groups' => $reviewGroups,
    'entries' => array_slice($entries, 0, $limit),
]);
