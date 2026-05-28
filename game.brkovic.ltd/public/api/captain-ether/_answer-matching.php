<?php
declare(strict_types=1);

function captain_answer_tokens(string $value): array {
    $normalized = normalize_answer($value);
    if ($normalized === '') return [];
    $tokens = explode(' ', $normalized);
    $aliases = [
        'requesting' => 'request',
        'requested' => 'request',
        'requests' => 'request',
        'need' => 'require',
        'needs' => 'require',
        'needed' => 'require',
        'help' => 'assistance',
        'changing' => 'switch',
        'change' => 'switch',
        'switching' => 'switch',
        'passing' => 'pass',
        'reducing' => 'reduce',
        'altering' => 'alter',
        'altered' => 'alter',
        'one' => '1',
        'two' => '2',
        'three' => '3',
        'four' => '4',
        'five' => '5',
        'six' => '6',
        'seven' => '7',
        'eight' => '8',
        'nine' => '9',
        'zero' => '0',
        'oh' => '0',
        'nought' => '0',
        'seventy' => '7',
        'seventytwo' => '72',
        'utc' => 'utc',
        'u' => 'utc',
    ];
    $optional = ['a' => true, 'an' => true, 'the' => true, 'please' => true];
    $result = [];
    foreach ($tokens as $token) {
        if ($token === '' || isset($optional[$token])) continue;
        $result[] = $aliases[$token] ?? $token;
    }
    return $result;
}

function captain_answer_semantic_key(string $value): string {
    return implode(' ', captain_answer_tokens($value));
}

function captain_answer_compact_key(string $value): string {
    return str_replace(' ', '', captain_answer_semantic_key($value));
}

function captain_answer_typo_limit(string $expected): int {
    $length = strlen($expected);
    if ($length < 4) return 0;
    if ($length <= 5) return 1;
    return max(1, min(4, (int) floor($length * 0.12)));
}

function captain_answer_is_numeric_token(string $token): bool {
    return preg_match('/^\d+$/', $token) === 1;
}

function captain_answer_token_contains_digit(string $token): bool {
    return preg_match('/\d/', $token) === 1;
}

function captain_answer_is_protected_signal_token(string $token): bool {
    return in_array($token, ['mayday', 'pan', 'securite', 'sécurité'], true);
}

function captain_answer_is_forbidden_typo_pair(string $given, string $target): bool {
    $pairs = [
        'advice' => ['advise'],
        'advise' => ['advice'],
        'berth' => ['birth'],
        'birth' => ['berth'],
        'fender' => ['finder'],
        'finder' => ['fender'],
        'fenders' => ['finders'],
        'finders' => ['fenders'],
    ];
    return in_array($given, $pairs[$target] ?? [], true);
}

function captain_answer_token_has_close_typo(string $given, string $target): bool {
    if ($given === $target) return false;
    if (captain_answer_is_numeric_token($given) || captain_answer_is_numeric_token($target)) return false;
    if (captain_answer_token_contains_digit($given) || captain_answer_token_contains_digit($target)) return false;
    if (captain_answer_is_protected_signal_token($target)) return false;
    if (captain_answer_is_forbidden_typo_pair($given, $target)) return false;
    if (strlen($target) <= 6 && strlen($given) !== strlen($target)) return false;

    $limit = captain_answer_typo_limit($target);
    return $limit > 0 && levenshtein($given, $target) <= $limit;
}

function captain_answer_is_close_typo(string $answer, string $expected): bool {
    if ($answer === '' || $expected === '' || $answer === $expected) return false;

    $answerTokens = captain_answer_tokens($answer);
    $expectedTokens = captain_answer_tokens($expected);
    if (!$answerTokens || !$expectedTokens) return false;

    if (count($answerTokens) !== count($expectedTokens)) return false;

    $hasTypo = false;
    foreach ($expectedTokens as $index => $target) {
        $given = $answerTokens[$index] ?? '';
        if ($given === $target) continue;
        if (!captain_answer_token_has_close_typo($given, $target)) return false;
        $hasTypo = true;
    }

    return $hasTypo;
}

function captain_match_answer(string $answer, array $item, bool $skipped = false): array {
    if ($skipped) {
        return [
            'correct' => false,
            'match_type' => 'skip',
            'message' => maritime_message('weak'),
        ];
    }

    $accepted = array_values(array_filter(array_map(
        static fn($value) => (string) $value,
        $item['accepted_answers'] ?? [$item['target_text'] ?? '']
    )));
    $target = (string) ($item['target_text'] ?? ($accepted[0] ?? ''));
    if (!in_array($target, $accepted, true)) {
        $accepted[] = $target;
    }

    $normalized = normalize_answer($answer);
    $acceptedNormalized = array_map('normalize_answer', $accepted);
    if (in_array($normalized, $acceptedNormalized, true)) {
        return [
            'correct' => true,
            'match_type' => 'exact',
            'message' => maritime_message('clean'),
        ];
    }

    $semantic = captain_answer_semantic_key($answer);
    $compact = captain_answer_compact_key($answer);
    foreach ($accepted as $expected) {
        if ($semantic !== '' && ($semantic === captain_answer_semantic_key($expected) || $compact === captain_answer_compact_key($expected))) {
            return [
                'correct' => true,
                'match_type' => 'variant',
                'message' => 'Принято. Стандартная форма ниже.',
            ];
        }
    }

    foreach ($accepted as $expected) {
        if (captain_answer_is_close_typo($answer, $expected)) {
            return [
                'correct' => true,
                'match_type' => 'spelling',
                'message' => 'Засчитано. Только проверь написание ниже.',
            ];
        }
    }

    return [
        'correct' => false,
        'match_type' => 'wrong',
        'message' => maritime_message('weak'),
    ];
}
