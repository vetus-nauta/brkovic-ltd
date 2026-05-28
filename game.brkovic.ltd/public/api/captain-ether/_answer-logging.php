<?php
declare(strict_types=1);

function captain_answer_logs_default(): array {
    return [
        'entries' => [],
        'total_logged' => 0,
        'updated_at' => null,
    ];
}

function captain_answer_log_kind(array $event): string {
    if (!empty($event['skipped'])) return 'skip';
    if (empty($event['correct'])) return 'wrong';
    if (!empty($event['used_hint']) || ($event['reason'] ?? '') === 'hint') return 'hint';
    if (($event['match_type'] ?? '') === 'spelling') return 'spelling';
    if (($event['match_type'] ?? '') === 'variant') return 'variant';

    $answer = normalize_answer((string) ($event['answer'] ?? ''));
    $target = normalize_answer((string) (($event['item']['target_text'] ?? '') ?: ($event['target_text'] ?? '')));
    if ($answer !== '' && $target !== '' && $answer !== $target) {
        return 'accepted_variant';
    }

    return 'clean';
}

function captain_should_log_answer_event(array $event): bool {
    return in_array(captain_answer_log_kind($event), [
        'wrong',
        'skip',
        'hint',
        'spelling',
        'variant',
        'accepted_variant',
    ], true);
}

function captain_answer_log_entry(array $event): array {
    $item = is_array($event['item'] ?? null) ? $event['item'] : [];
    $user = is_array($event['user'] ?? null) ? $event['user'] : [];
    $answer = clean_text($event['answer'] ?? '', 500);
    $target = clean_text($item['target_text'] ?? ($event['target_text'] ?? ''), 500);

    return [
        'id' => 'ans_' . bin2hex(random_bytes(8)),
        'observed_at' => iso_time(),
        'source' => clean_text($event['source'] ?? 'watch', 40),
        'player_hash' => substr(hash('sha256', (string) ($user['id'] ?? 'anonymous')), 0, 16),
        'watch_id' => clean_text($event['watch_id'] ?? '', 80),
        'question_index' => isset($event['question_index']) ? (int) $event['question_index'] : null,
        'level' => clean_text($event['level'] ?? '', 40),
        'item_id' => clean_text($item['id'] ?? ($event['item_id'] ?? ''), 120),
        'item_type' => clean_text($item['type'] ?? '', 80),
        'topic' => clean_text($item['topic'] ?? '', 120),
        'prompt' => clean_text($item['source_text'] ?? '', 500),
        'answer' => $answer,
        'normalized_answer' => normalize_answer($answer),
        'target_text' => $target,
        'normalized_target' => normalize_answer($target),
        'correct' => !empty($event['correct']),
        'reason' => clean_text($event['reason'] ?? '', 40),
        'match_type' => clean_text($event['match_type'] ?? '', 40),
        'log_kind' => captain_answer_log_kind($event),
        'used_hint' => !empty($event['used_hint']),
        'skipped' => !empty($event['skipped']),
    ];
}

function captain_log_answer_event(array $event): void {
    if (!captain_should_log_answer_event($event)) return;
    $entry = captain_answer_log_entry($event);

    storage_mutate('captain_answer_logs', captain_answer_logs_default(), function (array &$store) use ($entry) {
        $store['entries'] = $store['entries'] ?? [];
        $store['entries'][] = $entry;
        $store['entries'] = array_slice($store['entries'], -1000);
        $store['total_logged'] = (int) ($store['total_logged'] ?? 0) + 1;
        $store['updated_at'] = iso_time();
    });
}

function captain_answer_log_summary(array $entries): array {
    $byKind = [];
    $byMatchType = [];
    $byItem = [];

    foreach ($entries as $entry) {
        $kind = (string) ($entry['log_kind'] ?? 'unknown');
        $matchType = (string) ($entry['match_type'] ?? 'unknown');
        $itemId = (string) ($entry['item_id'] ?? 'unknown');

        $byKind[$kind] = ($byKind[$kind] ?? 0) + 1;
        $byMatchType[$matchType] = ($byMatchType[$matchType] ?? 0) + 1;
        $byItem[$itemId] = ($byItem[$itemId] ?? 0) + 1;
    }

    arsort($byItem);

    return [
        'by_kind' => $byKind,
        'by_match_type' => $byMatchType,
        'top_items' => array_slice($byItem, 0, 20, true),
    ];
}

function captain_answer_log_review_flags(array $group): array {
    $byKind = $group['by_kind'] ?? [];
    $flags = [];

    if (($byKind['wrong'] ?? 0) > 0) {
        $flags[] = 'possible_missing_variant';
    }
    if (($byKind['skip'] ?? 0) > 0 || ($byKind['hint'] ?? 0) > 0) {
        $flags[] = 'prompt_or_hint_friction';
    }
    if (($byKind['accepted_variant'] ?? 0) > 0 || ($byKind['variant'] ?? 0) > 0) {
        $flags[] = 'accepted_variant_review';
    }
    if (($byKind['spelling'] ?? 0) > 0) {
        $flags[] = 'common_spelling_review';
    }
    if (($group['total'] ?? 0) >= 3) {
        $flags[] = 'repeated_pattern';
    }

    return $flags;
}

function captain_answer_log_review_groups(array $entries, int $groupLimit = 20, int $answerLimit = 5): array {
    $groups = [];

    foreach ($entries as $entry) {
        if (!is_array($entry)) continue;

        $itemId = clean_text($entry['item_id'] ?? 'unknown', 120);
        if ($itemId === '') $itemId = 'unknown';
        $kind = clean_text($entry['log_kind'] ?? 'unknown', 40) ?: 'unknown';
        $matchType = clean_text($entry['match_type'] ?? 'unknown', 40) ?: 'unknown';
        $source = clean_text($entry['source'] ?? 'unknown', 40) ?: 'unknown';
        $level = clean_text($entry['level'] ?? '', 40);
        $observedAt = clean_text($entry['observed_at'] ?? '', 40);
        $answer = clean_text($entry['answer'] ?? '', 500);
        $normalizedAnswer = normalize_answer($answer);
        $answerKey = $normalizedAnswer !== '' ? $normalizedAnswer : '[empty]';

        if (!isset($groups[$itemId])) {
            $groups[$itemId] = [
                'item_id' => $itemId,
                'item_type' => clean_text($entry['item_type'] ?? '', 80),
                'topic' => clean_text($entry['topic'] ?? '', 120),
                'prompt' => clean_text($entry['prompt'] ?? '', 500),
                'target_text' => clean_text($entry['target_text'] ?? '', 500),
                'total' => 0,
                'latest_at' => '',
                'by_kind' => [],
                'by_match_type' => [],
                'sources' => [],
                'levels' => [],
                '_answers' => [],
            ];
        }

        $group =& $groups[$itemId];
        $group['total']++;
        if ($observedAt !== '' && strcmp($observedAt, (string) $group['latest_at']) > 0) {
            $group['latest_at'] = $observedAt;
        }
        $group['by_kind'][$kind] = ($group['by_kind'][$kind] ?? 0) + 1;
        $group['by_match_type'][$matchType] = ($group['by_match_type'][$matchType] ?? 0) + 1;
        $group['sources'][$source] = ($group['sources'][$source] ?? 0) + 1;
        if ($level !== '') {
            $group['levels'][$level] = ($group['levels'][$level] ?? 0) + 1;
        }

        if (!isset($group['_answers'][$answerKey])) {
            $group['_answers'][$answerKey] = [
                'answer' => $answer,
                'normalized_answer' => $normalizedAnswer,
                'total' => 0,
                'latest_at' => '',
                'by_kind' => [],
                'by_match_type' => [],
            ];
        }
        $answerRow =& $group['_answers'][$answerKey];
        $answerRow['total']++;
        if ($observedAt !== '' && strcmp($observedAt, (string) $answerRow['latest_at']) > 0) {
            $answerRow['latest_at'] = $observedAt;
        }
        $answerRow['by_kind'][$kind] = ($answerRow['by_kind'][$kind] ?? 0) + 1;
        $answerRow['by_match_type'][$matchType] = ($answerRow['by_match_type'][$matchType] ?? 0) + 1;
        unset($answerRow, $group);
    }

    $result = [];
    foreach ($groups as $group) {
        $answers = array_values($group['_answers']);
        usort($answers, static function (array $a, array $b): int {
            return ((int) ($b['total'] ?? 0)) <=> ((int) ($a['total'] ?? 0))
                ?: strcmp((string) ($b['latest_at'] ?? ''), (string) ($a['latest_at'] ?? ''));
        });

        unset($group['_answers']);
        arsort($group['by_kind']);
        arsort($group['by_match_type']);
        arsort($group['sources']);
        arsort($group['levels']);

        $wrongWeight = (int) ($group['by_kind']['wrong'] ?? 0) * 4;
        $skipWeight = (int) ($group['by_kind']['skip'] ?? 0) * 3;
        $hintWeight = (int) ($group['by_kind']['hint'] ?? 0) * 2;
        $variantWeight = (int) (($group['by_kind']['variant'] ?? 0) + ($group['by_kind']['accepted_variant'] ?? 0));
        $spellingWeight = (int) ($group['by_kind']['spelling'] ?? 0);

        $group['priority_score'] = $wrongWeight + $skipWeight + $hintWeight + $variantWeight + $spellingWeight;
        $group['review_flags'] = captain_answer_log_review_flags($group);
        $group['top_answers'] = array_slice($answers, 0, $answerLimit);
        $result[] = $group;
    }

    usort($result, static function (array $a, array $b): int {
        return ((int) ($b['priority_score'] ?? 0)) <=> ((int) ($a['priority_score'] ?? 0))
            ?: ((int) ($b['total'] ?? 0)) <=> ((int) ($a['total'] ?? 0))
            ?: strcmp((string) ($b['latest_at'] ?? ''), (string) ($a['latest_at'] ?? ''));
    });

    return array_slice($result, 0, $groupLimit);
}
