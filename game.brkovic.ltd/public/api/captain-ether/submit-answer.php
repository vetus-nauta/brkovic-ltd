<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';
require __DIR__ . '/_answer-matching.php';
require __DIR__ . '/_answer-logging.php';

require_method('POST');
$user = current_user();
require_csrf($user);

$input = read_json_body();
$sessionId = preg_replace('/[^a-z0-9_]/i', '', (string) ($input['watch_id'] ?? ''));
$index = (int) ($input['index'] ?? -1);
$answer = trim((string) ($input['answer'] ?? ''));
$usedHint = !empty($input['used_hint']);
$skipped = !empty($input['skipped']);
$items = captain_items_by_id();

$result = watch_sessions_mutate(function (array &$store) use ($sessionId, $index, $answer, $usedHint, $skipped, $items, $user) {
    $watch = $store['sessions'][$sessionId] ?? null;
    if (!is_array($watch) || ($watch['user_id'] ?? '') !== $user['id']) {
        return ['error' => 'Watch not found', 'status' => 404];
    }
    if (($watch['status'] ?? '') !== 'active') {
        return ['error' => 'Watch is not active', 'status' => 409];
    }
    if (!isset($watch['questions'][$index])) {
        return ['error' => 'Question not found', 'status' => 404];
    }

    $question = $watch['questions'][$index];
    $item = $items[$question['item_id']] ?? null;
    if (!is_array($item)) {
        return ['error' => 'Content item not found', 'status' => 500];
    }

    $match = captain_match_answer($answer, $item, $skipped);
    $correct = (bool) $match['correct'];
    $points = $correct ? ($usedHint ? 0.5 : 1.0) : 0.0;
    $reason = $skipped ? 'skip' : ($correct && $usedHint ? 'hint' : ($correct ? ((string) $match['match_type'] === 'spelling' ? 'spelling' : 'clean') : 'wrong'));

    $watch['questions'][$index]['answer'] = $answer;
    $watch['questions'][$index]['used_hint'] = $usedHint;
    $watch['questions'][$index]['skipped'] = $skipped;
    $watch['questions'][$index]['result'] = [
        'correct' => $correct,
        'points' => $points,
        'reason' => $reason,
        'match_type' => $match['match_type'],
        'answered_at' => iso_time(),
    ];

    $store['sessions'][$sessionId] = $watch;

    if ($reason === 'wrong' || $reason === 'skip' || $reason === 'hint') {
        mark_weak_point($user['id'], $item, $reason, $answer);
    } elseif (in_array($reason, ['clean', 'spelling'], true)) {
        resolve_weak_point($user['id'], (string) $item['id']);
    }

    $nextIndex = $index + 1;
    $next = isset($watch['questions'][$nextIndex])
        ? visible_question($watch['questions'][$nextIndex], $items[$watch['questions'][$nextIndex]['item_id']])
        : null;

    return [
        'ok' => true,
        'correct' => $correct,
        'points' => $points,
        'reason' => $reason,
        'match_type' => $match['match_type'],
        'message' => $usedHint && $correct ? maritime_message('hint') : (string) $match['message'],
        'target_text' => $item['target_text'] ?? '',
        'next' => $next,
        'done' => $next === null,
        '_answer_log' => [
            'source' => 'watch',
            'user' => $user,
            'watch_id' => $sessionId,
            'question_index' => $index,
            'level' => $watch['level'] ?? '',
            'item' => $item,
            'answer' => $answer,
            'correct' => $correct,
            'reason' => $reason,
            'match_type' => $match['match_type'],
            'used_hint' => $usedHint,
            'skipped' => $skipped,
        ],
    ];
});

if (!empty($result['error'])) {
    json_response((int) ($result['status'] ?? 400), ['ok' => false, 'error' => $result['error']]);
}

if (is_array($result['_answer_log'] ?? null)) {
    captain_log_answer_event($result['_answer_log']);
    unset($result['_answer_log']);
}

json_response(200, $result);
