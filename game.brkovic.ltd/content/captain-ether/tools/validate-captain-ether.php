<?php
declare(strict_types=1);

$root = dirname(__DIR__, 3);

require $root . '/private/bootstrap.php';
require $root . '/public/api/captain-ether/_answer-matching.php';

function usage(): void {
    echo "Captain Ether validator\n";
    echo "\n";
    echo "Usage:\n";
    echo "  php content/captain-ether/tools/validate-captain-ether.php [--batch=content/captain-ether/batches/file.json] [--runs=30]\n";
    echo "\n";
    echo "Checks starter content, matcher regression, dangerous pairs, watch selection, and optional draft batch files.\n";
}

function option_value(array $argv, string $name, ?string $default = null): ?string {
    $prefix = '--' . $name . '=';
    foreach ($argv as $arg) {
        if ($arg === '--' . $name) return '1';
        if (str_starts_with($arg, $prefix)) return substr($arg, strlen($prefix));
    }
    return $default;
}

function load_json_file(string $path): array {
    try {
        $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    } catch (Throwable $e) {
        throw new RuntimeException($path . ': ' . $e->getMessage(), 0, $e);
    }
    if (!is_array($data)) {
        throw new RuntimeException($path . ': JSON root is not an object');
    }
    return $data;
}

function rel_or_abs_path(string $root, string $path): string {
    if (str_starts_with($path, '/')) return $path;
    return $root . '/' . ltrim($path, '/');
}

function add_failure(array &$failures, string $block, string $message, array $context = []): void {
    $failures[] = [
        'block' => $block,
        'message' => $message,
        'context' => $context,
    ];
}

function add_warning(array &$warnings, string $block, string $message, array $context = []): void {
    $warnings[] = [
        'block' => $block,
        'message' => $message,
        'context' => $context,
    ];
}

function count_by(array $rows, string $key): array {
    $counts = [];
    foreach ($rows as $row) {
        $value = is_array($row) ? (string) ($row[$key] ?? '(missing)') : '(invalid)';
        $counts[$value] = ($counts[$value] ?? 0) + 1;
    }
    ksort($counts);
    return $counts;
}

function duplicate_values(array $values): array {
    $seen = [];
    $duplicates = [];
    foreach ($values as $value) {
        $value = (string) $value;
        if (isset($seen[$value])) {
            $duplicates[$value] = true;
        }
        $seen[$value] = true;
    }
    return array_keys($duplicates);
}

function items_by_id(array $items): array {
    $byId = [];
    foreach ($items as $item) {
        if (is_array($item) && isset($item['id'])) {
            $byId[(string) $item['id']] = $item;
        }
    }
    return $byId;
}

function validate_required_item_fields(array &$failures, array &$warnings, array $items, string $block, bool $requireBranchModule, bool $requireQaNotes): void {
    $required = [
        'id',
        'type',
        'level',
        'difficulty_score',
        'topic',
        'source_language',
        'source_text',
        'target_language',
        'target_text',
        'accepted_answers',
        'hint_beginner',
        'hint_intermediate',
        'hint_advanced',
    ];
    if ($requireBranchModule) {
        $required[] = 'branch';
        $required[] = 'module';
    }

    foreach ($items as $index => $item) {
        if (!is_array($item)) {
            add_failure($failures, $block, 'Item is not an object', ['index' => $index]);
            continue;
        }
        $id = (string) ($item['id'] ?? ('index:' . $index));
        foreach ($required as $field) {
            if (!array_key_exists($field, $item)) {
                add_failure($failures, $block, 'Missing required item field', ['item_id' => $id, 'field' => $field]);
            }
        }
        if (!in_array((string) ($item['type'] ?? ''), ['word', 'short_expression', 'phrase'], true)) {
            add_failure($failures, $block, 'Invalid item type', ['item_id' => $id, 'type' => $item['type'] ?? null]);
        }
        if (!in_array((string) ($item['level'] ?? ''), ['beginner', 'intermediate', 'advanced'], true)) {
            add_failure($failures, $block, 'Invalid item level', ['item_id' => $id, 'level' => $item['level'] ?? null]);
        }
        if (!isset($item['accepted_answers']) || !is_array($item['accepted_answers']) || count($item['accepted_answers']) === 0) {
            add_failure($failures, $block, 'accepted_answers must be a non-empty array', ['item_id' => $id]);
        } else {
            $normalized = array_map(static fn($value): string => normalize_answer((string) $value), $item['accepted_answers']);
            $duplicates = duplicate_values($normalized);
            if ($duplicates) {
                add_warning($warnings, $block, 'Duplicate accepted_answers after normalization', ['item_id' => $id, 'duplicates' => $duplicates]);
            }
            $target = normalize_answer((string) ($item['target_text'] ?? ''));
            if ($target !== '' && !in_array($target, $normalized, true)) {
                add_failure($failures, $block, 'target_text is not covered by accepted_answers after normalization', ['item_id' => $id]);
            }
        }
        if ($requireQaNotes) {
            foreach (['should_accept', 'should_reject', 'dangerous_minimal_pairs'] as $field) {
                if (!isset($item['qa_notes'][$field]) || !is_array($item['qa_notes'][$field])) {
                    add_failure($failures, $block, 'Missing qa_notes field', ['item_id' => $id, 'field' => $field]);
                }
            }
        }
    }
}

function validate_matcher_cases(array &$failures, array $items, ?array $cases, string $block): array {
    $itemsById = items_by_id($items);
    $targetCount = 0;
    $acceptCount = 0;
    $rejectCount = 0;

    if ($cases === null) {
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $itemId = (string) ($item['id'] ?? '');
            $targetCount++;
            $result = captain_match_answer((string) ($item['target_text'] ?? ''), $item);
            if (!$result['correct']) {
                add_failure($failures, $block, 'target_text did not pass matcher', [
                    'item_id' => $itemId,
                    'answer' => $item['target_text'] ?? '',
                    'match_type' => $result['match_type'] ?? '',
                ]);
            }
            foreach ($item['qa_notes']['should_accept'] ?? [] as $answer) {
                $acceptCount++;
                $result = captain_match_answer((string) $answer, $item);
                if (!$result['correct']) {
                    add_failure($failures, $block, 'should_accept did not pass matcher', [
                        'item_id' => $itemId,
                        'answer' => $answer,
                        'match_type' => $result['match_type'] ?? '',
                    ]);
                }
            }
            foreach ($item['qa_notes']['should_reject'] ?? [] as $answer) {
                $rejectCount++;
                $result = captain_match_answer((string) $answer, $item);
                if ($result['correct']) {
                    add_failure($failures, $block, 'should_reject passed matcher', [
                        'item_id' => $itemId,
                        'answer' => $answer,
                        'match_type' => $result['match_type'] ?? '',
                    ]);
                }
            }
        }
        return [$targetCount, $acceptCount, $rejectCount];
    }

    foreach ($items as $item) {
        if (!is_array($item)) continue;
        $targetCount++;
        $result = captain_match_answer((string) ($item['target_text'] ?? ''), $item);
        if (!$result['correct']) {
            add_failure($failures, $block, 'target_text did not pass matcher', [
                'item_id' => $item['id'] ?? '',
                'answer' => $item['target_text'] ?? '',
                'match_type' => $result['match_type'] ?? '',
            ]);
        }
    }

    foreach ($cases as $case) {
        $caseId = (string) ($case['id'] ?? '');
        $item = $itemsById[$caseId] ?? null;
        if (!$item) {
            add_failure($failures, $block, 'Regression case item_id is missing from starter', ['item_id' => $caseId]);
            continue;
        }
        foreach ($case['should_accept'] ?? [] as $answer) {
            $acceptCount++;
            $result = captain_match_answer((string) $answer, $item);
            if (!$result['correct']) {
                add_failure($failures, $block, 'should_accept did not pass matcher', [
                    'item_id' => $caseId,
                    'answer' => $answer,
                    'match_type' => $result['match_type'] ?? '',
                ]);
            }
        }
        foreach ($case['should_reject'] ?? [] as $answer) {
            $rejectCount++;
            $result = captain_match_answer((string) $answer, $item);
            if ($result['correct']) {
                add_failure($failures, $block, 'should_reject passed matcher', [
                    'item_id' => $caseId,
                    'answer' => $answer,
                    'match_type' => $result['match_type'] ?? '',
                ]);
            }
        }
    }

    return [$targetCount, $acceptCount, $rejectCount];
}

function validate_dangerous_pairs(array &$failures, array $items, array $pairs, string $block): array {
    $itemsById = items_by_id($items);
    $acceptCount = 0;
    $rejectCount = 0;

    foreach ($pairs as $pair) {
        if (!is_array($pair)) {
            add_failure($failures, $block, 'Dangerous pair entry is not an object');
            continue;
        }
        $pairName = (string) ($pair['pair'] ?? '(unnamed)');
        foreach ($pair['must_accept'] ?? [] as $itemId => $answers) {
            $item = $itemsById[(string) $itemId] ?? null;
            if (!$item) {
                add_failure($failures, $block, 'Dangerous pair must_accept item missing', ['pair' => $pairName, 'item_id' => $itemId]);
                continue;
            }
            foreach ($answers as $answer) {
                $acceptCount++;
                $result = captain_match_answer((string) $answer, $item);
                if (!$result['correct']) {
                    add_failure($failures, $block, 'Dangerous pair must_accept failed', [
                        'pair' => $pairName,
                        'item_id' => $itemId,
                        'answer' => $answer,
                        'match_type' => $result['match_type'] ?? '',
                    ]);
                }
            }
        }
        foreach ($pair['must_reject'] ?? [] as $itemId => $answers) {
            $item = $itemsById[(string) $itemId] ?? null;
            if (!$item) {
                add_failure($failures, $block, 'Dangerous pair must_reject item missing', ['pair' => $pairName, 'item_id' => $itemId]);
                continue;
            }
            foreach ($answers as $answer) {
                $rejectCount++;
                $result = captain_match_answer((string) $answer, $item);
                if ($result['correct']) {
                    add_failure($failures, $block, 'Dangerous pair must_reject passed matcher', [
                        'pair' => $pairName,
                        'item_id' => $itemId,
                        'answer' => $answer,
                        'match_type' => $result['match_type'] ?? '',
                    ]);
                }
            }
        }
    }

    return [$acceptCount, $rejectCount];
}

function validator_watch_length(string $level): int {
    return match ($level) {
        'advanced' => 20,
        'intermediate' => 16,
        default => 12,
    };
}

function validator_item_type_order(array $item): int {
    return match ((string) ($item['type'] ?? 'phrase')) {
        'word' => 0,
        'short_expression' => 1,
        default => 2,
    };
}

function validator_item_length_score(array $item): int {
    $normalized = normalize_answer((string) ($item['target_text'] ?? ''));
    return $normalized === '' ? 0 : count(explode(' ', $normalized));
}

function validator_sort_progressive_items(array &$items): void {
    usort($items, static function (array $a, array $b): int {
        return validator_item_type_order($a) <=> validator_item_type_order($b)
            ?: validator_item_length_score($a) <=> validator_item_length_score($b)
            ?: (int) ($a['difficulty_score'] ?? 0) <=> (int) ($b['difficulty_score'] ?? 0)
            ?: strcmp((string) ($a['id'] ?? ''), (string) ($b['id'] ?? ''));
    });
}

function validator_selection_pool(array $items, string $level): array {
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

function validator_select_watch_items(array $items, int $watchLength, string $level): array {
    $byId = [];
    foreach ($items as $item) {
        if (is_array($item) && isset($item['id'])) {
            $byId[(string) $item['id']] = $item;
        }
    }

    $selected = [];
    $groups = ['word' => [], 'short_expression' => [], 'phrase' => []];
    foreach ($byId as $id => $item) {
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
        $pool = validator_selection_pool(array_values($groups[$type]), $level);
        foreach ($pool as $item) {
            $typeCount = count(array_filter($selected, static fn($selectedItem) => ($selectedItem['type'] ?? 'phrase') === $type));
            if (count($selected) >= $watchLength || $typeCount >= $quotas[$type]) {
                break;
            }
            $selected[(string) $item['id']] = $item;
        }
    }

    $remaining = validator_selection_pool(
        array_values(array_filter($byId, static fn($item) => !isset($selected[(string) $item['id']]))),
        $level
    );
    foreach ($remaining as $item) {
        if (count($selected) >= $watchLength) break;
        $selected[(string) $item['id']] = $item;
    }

    $result = array_values($selected);
    validator_sort_progressive_items($result);
    return array_slice($result, 0, $watchLength);
}

function validate_watch_selection(array &$failures, array $starter, int $runs): array {
    $summary = [];
    foreach (['beginner', 'intermediate', 'advanced'] as $level) {
        $allowed = array_values(array_filter($starter['items'] ?? [], static function ($item) use ($level) {
            if (!is_array($item)) return false;
            $allowedLevels = ['beginner'];
            if ($level === 'intermediate') $allowedLevels[] = 'intermediate';
            if ($level === 'advanced') $allowedLevels = ['beginner', 'intermediate', 'advanced'];
            return in_array($item['level'] ?? '', $allowedLevels, true);
        }));
        $watchLength = validator_watch_length($level);
        $reached = [];
        $badRuns = 0;
        for ($run = 0; $run < $runs; $run++) {
            $items = validator_select_watch_items($allowed, $watchLength, $level);
            foreach ($items as $item) {
                $reached[(string) $item['id']] = true;
            }
            if (count($items) !== $watchLength) {
                $badRuns++;
                add_failure($failures, 'watch_selection', 'Watch length mismatch', [
                    'level' => $level,
                    'run' => $run + 1,
                    'expected' => $watchLength,
                    'actual' => count($items),
                ]);
            }
            for ($i = 1; $i < count($items); $i++) {
                if (validator_item_type_order($items[$i - 1]) > validator_item_type_order($items[$i])) {
                    $badRuns++;
                    add_failure($failures, 'watch_selection', 'Watch type order is not progressive', [
                        'level' => $level,
                        'run' => $run + 1,
                        'previous' => $items[$i - 1]['id'] ?? '',
                        'current' => $items[$i]['id'] ?? '',
                    ]);
                    break;
                }
            }
        }
        $summary[$level] = [
            'allowed' => count($allowed),
            'runs' => $runs,
            'length' => $watchLength,
            'bad_runs' => $badRuns,
            'reached' => count($reached),
        ];
    }
    return $summary;
}

function validate_id_sets(array &$failures, array $starter, array $qa): void {
    $itemIds = array_values(array_map(static fn($item): string => (string) ($item['id'] ?? ''), $starter['items'] ?? []));
    $duplicateItems = duplicate_values($itemIds);
    if ($duplicateItems) {
        add_failure($failures, 'ids', 'Duplicate starter item ids', ['ids' => $duplicateItems]);
    }

    $patternIds = array_values(array_map(static fn($pattern): string => (string) ($pattern['id'] ?? ''), $starter['grammar_patterns'] ?? []));
    $duplicatePatterns = duplicate_values($patternIds);
    if ($duplicatePatterns) {
        add_failure($failures, 'ids', 'Duplicate starter grammar pattern ids', ['ids' => $duplicatePatterns]);
    }

    $qaIds = array_values(array_map(static fn($item): string => (string) ($item['id'] ?? ''), $qa['items'] ?? []));
    $duplicateQa = duplicate_values($qaIds);
    if ($duplicateQa) {
        add_failure($failures, 'ids', 'Duplicate regression QA item ids', ['ids' => $duplicateQa]);
    }

    $starterIdSet = array_fill_keys($itemIds, true);
    foreach ($qaIds as $qaId) {
        if (!isset($starterIdSet[$qaId])) {
            add_failure($failures, 'ids', 'Regression QA item id is missing from starter', ['item_id' => $qaId]);
        }
    }
}

function validate_batch(array &$failures, array &$warnings, array $batch, array $starter): array {
    $summary = [
        'items' => count($batch['items'] ?? []),
        'grammar_patterns' => count($batch['grammar_patterns'] ?? []),
        'dangerous_pairs' => count($batch['dangerous_minimal_pairs'] ?? []),
        'status' => $batch['status'] ?? '',
    ];

    validate_required_item_fields($failures, $warnings, $batch['items'] ?? [], 'batch_schema', true, true);

    $batchIds = array_values(array_map(static fn($item): string => (string) ($item['id'] ?? ''), $batch['items'] ?? []));
    $duplicateBatchIds = duplicate_values($batchIds);
    if ($duplicateBatchIds) {
        add_failure($failures, 'batch_ids', 'Duplicate batch item ids', ['ids' => $duplicateBatchIds]);
    }

    $batchPatternIds = array_values(array_map(static fn($pattern): string => (string) ($pattern['id'] ?? ''), $batch['grammar_patterns'] ?? []));
    $duplicateBatchPatterns = duplicate_values($batchPatternIds);
    if ($duplicateBatchPatterns) {
        add_failure($failures, 'batch_ids', 'Duplicate batch grammar pattern ids', ['ids' => $duplicateBatchPatterns]);
    }

    $starterIds = array_fill_keys(array_map(static fn($item): string => (string) ($item['id'] ?? ''), $starter['items'] ?? []), true);
    $starterPatternIds = array_fill_keys(array_map(static fn($pattern): string => (string) ($pattern['id'] ?? ''), $starter['grammar_patterns'] ?? []), true);
    $isMerged = ($batch['status'] ?? '') === 'merged';
    foreach ($batchIds as $id) {
        $exists = isset($starterIds[$id]);
        if ($isMerged && !$exists) {
            add_failure($failures, 'batch_ids', 'Merged batch item id is missing from starter', ['item_id' => $id]);
        }
        if (!$isMerged && $exists) {
            add_failure($failures, 'batch_ids', 'Draft batch item id already exists in starter', ['item_id' => $id]);
        }
    }
    foreach ($batchPatternIds as $id) {
        $exists = isset($starterPatternIds[$id]);
        if ($isMerged && !$exists) {
            add_failure($failures, 'batch_ids', 'Merged batch grammar pattern id is missing from starter', ['pattern_id' => $id]);
        }
        if (!$isMerged && $exists) {
            add_failure($failures, 'batch_ids', 'Draft batch grammar pattern id already exists in starter', ['pattern_id' => $id]);
        }
    }

    [$targets, $accepts, $rejects] = validate_matcher_cases($failures, $batch['items'] ?? [], null, 'batch_matcher');
    [$pairAccepts, $pairRejects] = validate_dangerous_pairs($failures, $batch['items'] ?? [], $batch['dangerous_minimal_pairs'] ?? [], 'batch_dangerous_pairs');
    $summary['target_text'] = $targets;
    $summary['should_accept'] = $accepts;
    $summary['should_reject'] = $rejects;
    $summary['danger_must_accept'] = $pairAccepts;
    $summary['danger_must_reject'] = $pairRejects;

    return $summary;
}

if (in_array('--help', $argv, true) || in_array('-h', $argv, true)) {
    usage();
    exit(0);
}

$runs = max(1, (int) option_value($argv, 'runs', '30'));
$batchOption = option_value($argv, 'batch');
$failures = [];
$warnings = [];

$starterPath = $root . '/content/captain-ether/starter.json';
$qaPath = $root . '/content/captain-ether/accept-reject-qa-pairs.json';
$starter = load_json_file($starterPath);
$qa = load_json_file($qaPath);

validate_required_item_fields($failures, $warnings, $starter['items'] ?? [], 'starter_schema', false, false);
foreach ($starter['items'] ?? [] as $item) {
    if (is_array($item) && array_key_exists('qa_notes', $item)) {
        add_failure($failures, 'starter_schema', 'Playable starter item contains qa_notes', ['item_id' => $item['id'] ?? '']);
    }
}
validate_id_sets($failures, $starter, $qa);

[$targetCount, $acceptCount, $rejectCount] = validate_matcher_cases($failures, $starter['items'] ?? [], $qa['items'] ?? [], 'starter_regression');
[$pairAcceptCount, $pairRejectCount] = validate_dangerous_pairs($failures, $starter['items'] ?? [], $qa['dangerous_minimal_pairs'] ?? [], 'starter_dangerous_pairs');
$watchSummary = validate_watch_selection($failures, $starter, $runs);

$batchSummary = null;
if ($batchOption !== null) {
    $batchPath = rel_or_abs_path($root, $batchOption);
    $batch = load_json_file($batchPath);
    $batchSummary = validate_batch($failures, $warnings, $batch, $starter);
}

echo "Captain Ether validation\n";
echo "Root: " . $root . "\n";
echo "\n";
echo "Starter:\n";
echo "  items: " . count($starter['items'] ?? []) . "\n";
echo "  grammar_patterns: " . count($starter['grammar_patterns'] ?? []) . "\n";
echo "  scenarios: " . count($starter['scenarios'] ?? []) . "\n";
echo "  type_counts: " . json_encode(count_by($starter['items'] ?? [], 'type'), JSON_UNESCAPED_SLASHES) . "\n";
echo "  level_counts: " . json_encode(count_by($starter['items'] ?? [], 'level'), JSON_UNESCAPED_SLASHES) . "\n";
echo "  branch_counts: " . json_encode(count_by($starter['items'] ?? [], 'branch'), JSON_UNESCAPED_SLASHES) . "\n";
echo "  module_counts: " . json_encode(count_by($starter['items'] ?? [], 'module'), JSON_UNESCAPED_SLASHES) . "\n";
echo "\n";
echo "Regression:\n";
echo "  qa_items: " . count($qa['items'] ?? []) . "\n";
echo "  target_text: " . $targetCount . "\n";
echo "  should_accept: " . $acceptCount . "\n";
echo "  should_reject: " . $rejectCount . "\n";
echo "  dangerous_pairs: " . count($qa['dangerous_minimal_pairs'] ?? []) . "\n";
echo "  danger_must_accept: " . $pairAcceptCount . "\n";
echo "  danger_must_reject: " . $pairRejectCount . "\n";
echo "\n";
echo "Watch selection:\n";
foreach ($watchSummary as $level => $summary) {
    echo "  " . $level . ': ' . json_encode($summary, JSON_UNESCAPED_SLASHES) . "\n";
}

if ($batchSummary !== null) {
    echo "\n";
    echo "Batch:\n";
    foreach ($batchSummary as $key => $value) {
        echo "  " . $key . ': ' . (is_array($value) ? json_encode($value, JSON_UNESCAPED_SLASHES) : (string) $value) . "\n";
    }
}

if ($failures) {
    echo "\n";
    echo "FAIL (" . count($failures) . ")\n";
    foreach (array_slice($failures, 0, 40) as $failure) {
        echo "- [" . $failure['block'] . '] ' . $failure['message'];
        if (($failure['context'] ?? []) !== []) {
            echo ' ' . json_encode($failure['context'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        echo "\n";
    }
    if (count($failures) > 40) {
        echo "- ... " . (count($failures) - 40) . " more failures\n";
    }
    exit(1);
}

if ($warnings) {
    echo "\n";
    echo "WARN (" . count($warnings) . ")\n";
    foreach (array_slice($warnings, 0, 20) as $warning) {
        echo "- [" . $warning['block'] . '] ' . $warning['message'];
        if (($warning['context'] ?? []) !== []) {
            echo ' ' . json_encode($warning['context'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        echo "\n";
    }
    if (count($warnings) > 20) {
        echo "- ... " . (count($warnings) - 20) . " more warnings\n";
    }
}

echo "\n";
echo "PASS\n";
