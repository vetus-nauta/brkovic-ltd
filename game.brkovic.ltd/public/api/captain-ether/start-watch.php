<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

require_method('POST');
$user = current_user();
require_csrf($user);

function captain_watch_length(string $level): int {
    return match ($level) {
        'advanced' => 20,
        'intermediate' => 16,
        default => 12,
    };
}

function captain_allowed_levels(string $level): array {
    if ($level === 'advanced') return ['beginner', 'intermediate', 'advanced'];
    if ($level === 'intermediate') return ['beginner', 'intermediate'];
    return ['beginner'];
}

function captain_item_type_order(array $item): int {
    return match ((string) ($item['type'] ?? 'phrase')) {
        'word' => 0,
        'short_expression' => 1,
        default => 2,
    };
}

function captain_item_length_score(array $item): int {
    return count(explode(' ', normalize_answer((string) ($item['target_text'] ?? ''))));
}

function captain_sort_progressive_items(array &$items): void {
    usort($items, static function (array $a, array $b): int {
        return captain_item_type_order($a) <=> captain_item_type_order($b)
            ?: captain_item_length_score($a) <=> captain_item_length_score($b)
            ?: (int) ($a['difficulty_score'] ?? 0) <=> (int) ($b['difficulty_score'] ?? 0)
            ?: strcmp((string) ($a['id'] ?? ''), (string) ($b['id'] ?? ''));
    });
}

function captain_weak_item_quota(int $watchLength): int {
    return max(2, (int) floor($watchLength * 0.35));
}

function captain_focus_quota(int $watchLength): int {
    return match ($watchLength) {
        20 => 15,
        16 => 12,
        default => 9,
    };
}

function captain_valid_branches(): array {
    return [
        'core_radio',
        'marina_harbour',
        'navigation_reports',
        'traffic_collision',
        'safety_securite',
        'urgency_panpan',
        'distress_mayday',
        'onboard_operations',
        'vts_port_control',
        'review_minimal_pairs',
    ];
}

function captain_filter_error(string $error, string $reason, int $status = 400): never {
    json_response($status, [
        'ok' => false,
        'error' => $error,
        'reason' => $reason,
        'required_mode' => 'mixed',
    ]);
}

function captain_focused_branch_enabled(string $branch, string $level): bool {
    if (in_array($branch, ['core_radio', 'marina_harbour'], true)) {
        return true;
    }
    return in_array($branch, ['navigation_reports', 'safety_securite'], true)
        && in_array($level, ['intermediate', 'advanced'], true);
}

function captain_type_floor(int $watchLength): array {
    if ($watchLength === 20) {
        return ['word' => 6, 'short_expression' => 6, 'phrase' => 8];
    }
    if ($watchLength === 16) {
        return ['word' => 4, 'short_expression' => 5, 'phrase' => 7];
    }
    return ['word' => 3, 'short_expression' => 3, 'phrase' => 6];
}

function captain_item_type(array $item): string {
    $type = (string) ($item['type'] ?? 'phrase');
    return in_array($type, ['word', 'short_expression', 'phrase'], true) ? $type : 'phrase';
}

function captain_type_count(array $items, string $type): int {
    return count(array_filter($items, static fn($item) => captain_item_type($item) === $type));
}

function captain_meets_type_floor(array $items, int $watchLength): bool {
    $counts = ['word' => 0, 'short_expression' => 0, 'phrase' => 0];
    foreach ($items as $item) {
        $counts[captain_item_type($item)]++;
    }

    foreach (captain_type_floor($watchLength) as $type => $floor) {
        if ($counts[$type] < $floor) return false;
    }
    return true;
}

function captain_normalize_weak_set(array $weakItemIds): array {
    return array_fill_keys(array_map(static fn($id): string => (string) $id, $weakItemIds), true);
}

function captain_weak_selected_count(array $selected, array $weakItemIds): int {
    $weakSet = captain_normalize_weak_set($weakItemIds);
    return count(array_filter($selected, static fn($selectedItem) => isset($weakSet[(string) ($selectedItem['id'] ?? '')])));
}

function captain_weak_pool(array $byId, array $weakItemIds, ?string $branch = null, bool $sameBranch = true): array {
    $pool = [];
    foreach ($weakItemIds as $weakItemId) {
        if (!isset($byId[$weakItemId])) continue;
        if ($branch !== null) {
            $matchesBranch = ($byId[$weakItemId]['branch'] ?? '') === $branch;
            if ($sameBranch !== $matchesBranch) continue;
        }
        $pool[] = $byId[$weakItemId];
    }
    return $pool;
}

function captain_pool_by_branch(array $byId, array $selected, array $weakSet, ?string $branch = null, ?bool $sameBranch = null, ?string $type = null): array {
    return array_values(array_filter($byId, static function ($item) use ($selected, $weakSet, $branch, $sameBranch, $type) {
        $id = (string) ($item['id'] ?? '');
        if ($id === '' || isset($selected[$id]) || isset($weakSet[$id])) return false;
        if ($type !== null && captain_item_type($item) !== $type) return false;
        if ($branch === null || $sameBranch === null) return true;
        return $sameBranch ? (($item['branch'] ?? '') === $branch) : (($item['branch'] ?? '') !== $branch);
    }));
}

function captain_selected_branch_count(array $selected, string $branch): int {
    return count(array_filter($selected, static fn($item) => ($item['branch'] ?? '') === $branch));
}

function captain_selected_review_count(array $selected, string $branch): int {
    return count($selected) - captain_selected_branch_count($selected, $branch);
}

function captain_add_candidates(array &$selected, array $pool, int $limit, string $level): void {
    foreach (captain_selection_pool($pool, $level) as $item) {
        if (count($selected) >= $limit) break;
        $selected[(string) $item['id']] = $item;
    }
}

function captain_select_limited_weak_items(array $byId, array $weakItemIds, int $weakQuota, string $level, ?string $branch = null, bool $sameBranch = true): array {
    $selected = [];
    foreach (captain_selection_pool(captain_weak_pool($byId, $weakItemIds, $branch, $sameBranch), $level) as $item) {
        if (count($selected) >= $weakQuota) break;
        $selected[(string) $item['id']] = $item;
    }
    return $selected;
}

function captain_selection_pool(array $items, string $level): array {
    $preferred = [];
    $other = [];
    foreach ($items as $item) {
        if (($item['level'] ?? '') === $level) {
            $preferred[] = $item;
        } else {
            $other[] = $item;
        }
    }
    shuffle($preferred);
    shuffle($other);
    return array_merge($preferred, $other);
}

function captain_select_watch_items(array $items, array $weakItemIds, int $watchLength, string $level): array {
    $byId = [];
    foreach ($items as $item) {
        if (is_array($item) && isset($item['id'])) {
            $byId[(string) $item['id']] = $item;
        }
    }

    $selected = captain_select_limited_weak_items($byId, $weakItemIds, captain_weak_item_quota($watchLength), $level);
    $weakSet = captain_normalize_weak_set($weakItemIds);

    $groups = ['word' => [], 'short_expression' => [], 'phrase' => []];
    foreach ($byId as $id => $item) {
        if (isset($selected[$id])) continue;
        if (isset($weakSet[$id])) continue;
        $type = (string) ($item['type'] ?? 'phrase');
        if (!isset($groups[$type])) $type = 'phrase';
        $groups[$type][$id] = $item;
    }

    $quotas = [
        'word' => max(2, (int) floor($watchLength * 0.30)),
        'short_expression' => max(3, (int) floor($watchLength * 0.32)),
        'phrase' => $watchLength,
    ];

    foreach (['word', 'short_expression', 'phrase'] as $type) {
        $pool = captain_selection_pool(array_values($groups[$type]), $level);
        foreach ($pool as $item) {
            if (count($selected) >= $watchLength || count(array_filter($selected, static fn($selectedItem) => ($selectedItem['type'] ?? 'phrase') === $type)) >= $quotas[$type]) {
                break;
            }
            $selected[(string) $item['id']] = $item;
        }
    }

    $remaining = captain_selection_pool(
        array_values(array_filter($byId, static fn($item) => !isset($selected[(string) $item['id']]) && !isset($weakSet[(string) $item['id']]))),
        $level
    );
    foreach ($remaining as $item) {
        if (count($selected) >= $watchLength) break;
        $selected[(string) $item['id']] = $item;
    }

    $result = array_values($selected);
    captain_sort_progressive_items($result);
    return array_slice($result, 0, $watchLength);
}

function captain_select_focused_branch_items(array $items, array $weakItemIds, int $watchLength, string $level, string $branch): array {
    if (!captain_focused_branch_enabled($branch, $level)) {
        return [];
    }

    $byId = [];
    foreach ($items as $item) {
        if (is_array($item) && isset($item['id'])) {
            $byId[(string) $item['id']] = $item;
        }
    }

    $focusQuota = captain_focus_quota($watchLength);
    $weakQuota = captain_weak_item_quota($watchLength);
    $selected = [];
    $weakSet = captain_normalize_weak_set($weakItemIds);

    $branchWeak = captain_select_limited_weak_items($byId, $weakItemIds, min($weakQuota, $focusQuota), $level, $branch);
    foreach ($branchWeak as $id => $item) {
        if (captain_selected_branch_count($selected, $branch) >= $focusQuota) break;
        $selected[$id] = $item;
    }

    $reviewWeak = captain_select_limited_weak_items($byId, $weakItemIds, $weakQuota - count($selected), $level, $branch, false);
    foreach ($reviewWeak as $id => $item) {
        if (isset($selected[$id])) continue;
        if (($item['branch'] ?? '') === $branch) continue;
        if (captain_selected_review_count($selected, $branch) >= $watchLength - $focusQuota) break;
        $selected[$id] = $item;
    }

    foreach (captain_type_floor($watchLength) as $type => $floor) {
        while (captain_type_count(array_values($selected), $type) < $floor) {
            $before = count($selected);
            if (captain_selected_branch_count($selected, $branch) < $focusQuota) {
                captain_add_candidates(
                    $selected,
                    captain_pool_by_branch($byId, $selected, $weakSet, $branch, true, $type),
                    count($selected) + 1,
                    $level
                );
            }
            if ($before === count($selected) && captain_selected_review_count($selected, $branch) < $watchLength - $focusQuota) {
                captain_add_candidates(
                    $selected,
                    captain_pool_by_branch($byId, $selected, $weakSet, $branch, false, $type),
                    count($selected) + 1,
                    $level
                );
            }
            if ($before === count($selected)) {
                return [];
            }
        }
    }

    while (captain_selected_branch_count($selected, $branch) < $focusQuota) {
        $before = count($selected);
        captain_add_candidates(
            $selected,
            captain_pool_by_branch($byId, $selected, $weakSet, $branch, true),
            count($selected) + 1,
            $level
        );
        if ($before === count($selected)) return [];
    }

    while (count($selected) < $watchLength) {
        $before = count($selected);
        captain_add_candidates(
            $selected,
            captain_pool_by_branch($byId, $selected, $weakSet, $branch, false),
            count($selected) + 1,
            $level
        );
        if ($before === count($selected)) return [];
    }

    $result = array_values($selected);
    if (
        count($result) !== $watchLength
        || captain_weak_selected_count($result, $weakItemIds) > $weakQuota
        || captain_selected_branch_count($result, $branch) !== $focusQuota
        || !captain_meets_type_floor($result, $watchLength)
    ) {
        return [];
    }

    captain_sort_progressive_items($result);
    return $result;
}

$input = read_json_body();
$level = is_string($input['level'] ?? null) ? $input['level'] : 'beginner';
if (!in_array($level, ['beginner', 'intermediate', 'advanced'], true)) {
    $level = 'beginner';
}

$mode = 'mixed';
if (array_key_exists('mode', $input)) {
    if (!is_string($input['mode']) || !in_array($input['mode'], ['mixed', 'focused_branch', 'focused_module'], true)) {
        captain_filter_error('invalid_watch_mode', 'Watch mode is not available');
    }
    $mode = $input['mode'];
}

if ($mode === 'focused_module') {
    captain_filter_error('focused_module_unavailable', 'Focused module watches are not enabled', 409);
}

$branch = '';
if ($mode === 'focused_branch') {
    if (!array_key_exists('branch', $input) || $input['branch'] === null || $input['branch'] === '') {
        captain_filter_error('missing_branch', 'Focused branch watches require a branch');
    }
    if (!is_string($input['branch']) || !in_array($input['branch'], captain_valid_branches(), true)) {
        captain_filter_error('invalid_branch', 'Focused branch is not available');
    }
    $branch = $input['branch'];
}

$content = captain_content();
$items = array_values(array_filter($content['items'] ?? [], static function ($item) use ($level) {
    if (!is_array($item)) return false;
    return in_array($item['level'] ?? '', captain_allowed_levels($level), true);
}));

$byId = captain_items_by_id();
$weak = unresolved_weak_points($user['id']);

if (!$items) {
    json_response(500, ['ok' => false, 'error' => 'Captain Ether content is empty']);
}

$watchLength = captain_watch_length($level);
if ($mode === 'focused_branch') {
    $items = captain_select_focused_branch_items($items, array_keys($weak), $watchLength, $level, $branch);
    if (!$items) {
        captain_filter_error('branch_watch_unavailable', 'Focused watch pool is below threshold', 409);
    }
} else {
    $items = captain_select_watch_items($items, array_keys($weak), $watchLength, $level);
}

$questions = [];
foreach ($items as $i => $item) {
    $questions[] = [
        'index' => $i,
        'item_id' => $item['id'],
        'level' => $level,
    ];
}

$sessionId = 'watch_' . bin2hex(random_bytes(8));
storage_mutate('watch_sessions', watch_sessions_default(), function (array &$store) use ($sessionId, $user, $level, $questions) {
    $store['sessions'][$sessionId] = [
        'id' => $sessionId,
        'user_id' => $user['id'],
        'game' => 'captain_ether',
        'level' => $level,
        'status' => 'active',
        'created_at' => iso_time(),
        'finished_at' => null,
        'questions' => $questions,
    ];
});

storage_mutate('progress', progress_default(), function (array &$store) use ($user, $level) {
    $store['users'][$user['id']] = array_replace(user_progress($user['id']), [
        'last_level' => $level,
        'updated_at' => iso_time(),
    ]);
});

json_response(200, [
    'ok' => true,
    'watch' => [
        'id' => $sessionId,
        'level' => $level,
        'total' => count($questions),
        'current' => visible_question($questions[0], $byId[$questions[0]['item_id']]),
    ],
]);
