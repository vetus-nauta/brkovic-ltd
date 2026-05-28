<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

$appRoot = dirname(__DIR__, 3);
$phpBin = getenv('CAPTAIN_ETHER_PHP') ?: PHP_BINARY;
$cookieName = (string) app_config('session_cookie', 'brk_game_session');
$testUserId = 'usr_captain_ether_api_smoke';
$testEmail = 'captain-ether-api-smoke@example.invalid';
$sessionToken = bin2hex(random_bytes(32));
$csrfToken = bin2hex(random_bytes(16));
$port = 19000 + random_int(0, 999);
$baseUrl = 'http://127.0.0.1:' . $port;
$server = null;
$serverLog = tempnam(sys_get_temp_dir(), 'captain_ether_api_smoke_');

$storageNames = [
    'users',
    'sessions',
    'progress',
    'watch_sessions',
    'weak_points',
    'captain_answer_logs',
];

$backup = [];
$failures = [];
$checks = [];

function smoke_storage_files(array $names): array {
    $paths = [];
    foreach ($names as $name) {
        $path = storage_path($name);
        $paths[$path] = true;
        $paths[STORAGE_DIR . '/.' . preg_replace('/[^a-z0-9_.-]/i', '', $name) . '.lock'] = true;
    }
    return array_keys($paths);
}

function smoke_backup_storage(array $paths): array {
    $backup = [];
    foreach ($paths as $path) {
        $backup[$path] = is_file($path) ? file_get_contents($path) : null;
    }
    return $backup;
}

function smoke_restore_storage(array $backup): void {
    foreach ($backup as $path => $contents) {
        if ($contents === null) {
            if (is_file($path)) {
                unlink($path);
            }
            continue;
        }
        file_put_contents($path, $contents, LOCK_EX);
    }
}

function smoke_write_json(string $name, array $data): void {
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        throw new RuntimeException('Could not encode storage fixture: ' . $name);
    }
    file_put_contents(storage_path($name), $encoded . PHP_EOL, LOCK_EX);
}

function smoke_read_json(string $name, array $default): array {
    $path = storage_path($name);
    if (!is_file($path)) return $default;
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : $default;
}

function smoke_seed_user(string $userId, string $email, string $token, string $csrf): void {
    smoke_write_json('users', [
        'users' => [
            $userId => [
                'id' => $userId,
                'email' => $email,
                'role' => 'admin',
                'provider' => 'api-smoke',
                'ecosystem_user_id' => '',
                'name' => 'Captain Ether API Smoke',
                'created_at' => gmdate('c'),
                'last_login_at' => gmdate('c'),
            ],
        ],
        'email_index' => [
            hash('sha256', $email) => $userId,
        ],
    ]);
    smoke_write_json('sessions', [
        'sessions' => [
            $token => [
                'token' => $token,
                'csrf' => $csrf,
                'user_id' => $userId,
                'created_at' => gmdate('c'),
                'expires_at' => gmdate('c', time() + 86400),
            ],
        ],
    ]);
    smoke_write_json('progress', ['users' => []]);
    smoke_write_json('watch_sessions', ['sessions' => []]);
    smoke_write_json('weak_points', ['users' => []]);
    smoke_write_json('captain_answer_logs', ['entries' => [], 'total_logged' => 0, 'updated_at' => null]);
}

function smoke_seed_weak_points(string $userId, array $itemIds): void {
    $points = [];
    foreach (array_values(array_unique($itemIds)) as $index => $itemId) {
        $points[$itemId] = [
            'item_id' => $itemId,
            'reason' => 'wrong',
            'last_answer' => 'fixture answer',
            'wrong_count' => 1 + $index,
            'hint_count' => 0,
            'skip_count' => 0,
            'created_at' => gmdate('c'),
            'updated_at' => gmdate('c'),
            'resolved_at' => null,
        ];
    }
    smoke_write_json('weak_points', ['users' => [$userId => $points]]);
}

function smoke_start_server(string $phpBin, string $appRoot, int $port, string $logPath): mixed {
    $command = escapeshellarg($phpBin) . ' -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($appRoot . '/public');
    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['file', $logPath, 'a'],
        2 => ['file', $logPath, 'a'],
    ];
    $process = proc_open($command, $descriptorSpec, $pipes, $appRoot);
    if (!is_resource($process)) {
        throw new RuntimeException('Could not start PHP built-in server.');
    }
    if (isset($pipes[0]) && is_resource($pipes[0])) {
        fclose($pipes[0]);
    }
    return $process;
}

function smoke_wait_for_server(string $host, int $port): void {
    $deadline = microtime(true) + 5.0;
    do {
        $socket = @fsockopen($host, $port, $errno, $errstr, 0.2);
        if (is_resource($socket)) {
            fclose($socket);
            return;
        }
        usleep(100000);
    } while (microtime(true) < $deadline);
    throw new RuntimeException('PHP built-in server did not become ready.');
}

function smoke_stop_server(mixed $server): void {
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
}

function smoke_request(string $method, string $url, ?array $body, string $cookieName, string $token, string $csrf): array {
    $headers = [
        'Accept: application/json',
        'Cookie: ' . $cookieName . '=' . $token,
    ];
    $content = null;
    if ($method === 'POST') {
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'X-CSRF-Token: ' . $csrf;
        $content = json_encode($body ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $content,
            'ignore_errors' => true,
            'timeout' => 10,
        ],
    ]);

    $raw = file_get_contents($url, false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $matches)) {
            $status = (int) $matches[1];
            break;
        }
    }

    $json = json_decode((string) $raw, true);
    return [
        'status' => $status,
        'json' => is_array($json) ? $json : null,
        'raw' => is_string($raw) ? $raw : '',
    ];
}

function smoke_post(string $path, array $body): array {
    global $baseUrl, $cookieName, $sessionToken, $csrfToken;
    return smoke_request('POST', $baseUrl . $path, $body, $cookieName, $sessionToken, $csrfToken);
}

function smoke_get(string $path): array {
    global $baseUrl, $cookieName, $sessionToken, $csrfToken;
    return smoke_request('GET', $baseUrl . $path, null, $cookieName, $sessionToken, $csrfToken);
}

function smoke_check(string $name, bool $condition, string $detail = ''): void {
    global $checks, $failures;
    $checks[] = $name;
    if (!$condition) {
        $failures[] = $detail === '' ? $name : $name . ': ' . $detail;
    }
}

function smoke_items(): array {
    $items = captain_items_by_id();
    return array_values($items);
}

function smoke_item_map(): array {
    return captain_items_by_id();
}

function smoke_allowed_levels(string $level): array {
    if ($level === 'advanced') return ['beginner', 'intermediate', 'advanced'];
    if ($level === 'intermediate') return ['beginner', 'intermediate'];
    return ['beginner'];
}

function smoke_watch_length(string $level): int {
    return match ($level) {
        'advanced' => 20,
        'intermediate' => 16,
        default => 12,
    };
}

function smoke_focus_quota(string $level): int {
    return match ($level) {
        'advanced' => 15,
        'intermediate' => 12,
        default => 9,
    };
}

function smoke_weak_quota(string $level): int {
    return max(2, (int) floor(smoke_watch_length($level) * 0.35));
}

function smoke_selected_ids(string $watchId): array {
    $store = smoke_read_json('watch_sessions', ['sessions' => []]);
    $watch = $store['sessions'][$watchId] ?? [];
    $ids = [];
    foreach ($watch['questions'] ?? [] as $question) {
        $ids[] = (string) ($question['item_id'] ?? '');
    }
    return array_values(array_filter($ids));
}

function smoke_selected_items(string $watchId): array {
    $map = smoke_item_map();
    $result = [];
    foreach (smoke_selected_ids($watchId) as $id) {
        if (isset($map[$id])) {
            $result[] = $map[$id];
        }
    }
    return $result;
}

function smoke_count_branch(array $items, string $branch): int {
    return count(array_filter($items, static fn(array $item): bool => ($item['branch'] ?? '') === $branch));
}

function smoke_type_counts(array $items): array {
    $counts = ['word' => 0, 'short_expression' => 0, 'phrase' => 0];
    foreach ($items as $item) {
        $type = (string) ($item['type'] ?? 'phrase');
        if (!isset($counts[$type])) $type = 'phrase';
        $counts[$type]++;
    }
    return $counts;
}

function smoke_type_floor(string $level): array {
    return match ($level) {
        'advanced' => ['word' => 6, 'short_expression' => 6, 'phrase' => 8],
        'intermediate' => ['word' => 4, 'short_expression' => 5, 'phrase' => 7],
        default => ['word' => 3, 'short_expression' => 3, 'phrase' => 6],
    };
}

function smoke_meets_type_floor(array $items, string $level): bool {
    $counts = smoke_type_counts($items);
    foreach (smoke_type_floor($level) as $type => $floor) {
        if (($counts[$type] ?? 0) < $floor) return false;
    }
    return true;
}

function smoke_no_public_keys(?array $payload, array $forbidden): bool {
    if (!is_array($payload)) return false;
    foreach ($payload as $key => $value) {
        if (in_array((string) $key, $forbidden, true)) return false;
        if (is_array($value) && !smoke_no_public_keys($value, $forbidden)) return false;
    }
    return true;
}

function smoke_storage_counts(): array {
    return [
        'watch_sessions' => count(smoke_read_json('watch_sessions', ['sessions' => []])['sessions'] ?? []),
        'progress_users' => count(smoke_read_json('progress', ['users' => []])['users'] ?? []),
    ];
}

function smoke_expect_error_no_mutation(string $name, array $body, int $status, string $error): void {
    $before = smoke_storage_counts();
    $response = smoke_post('/api/captain-ether/start-watch.php', $body);
    $after = smoke_storage_counts();
    smoke_check($name . ' status', $response['status'] === $status, 'expected ' . $status . ', got ' . $response['status']);
    smoke_check($name . ' error', ($response['json']['error'] ?? '') === $error, 'unexpected error code');
    smoke_check($name . ' mutation-free', $before === $after, 'storage counts changed on rejected request');
    smoke_check($name . ' error privacy', smoke_no_public_keys($response['json'], ['token', 'csrf', 'email', 'user_id']), 'error payload exposed private keys');
}

function smoke_start_watch(string $name, array $body, string $level, ?string $branch = null): string {
    $response = smoke_post('/api/captain-ether/start-watch.php', $body);
    smoke_check($name . ' status', $response['status'] === 200, 'expected 200, got ' . $response['status']);
    smoke_check($name . ' ok', ($response['json']['ok'] ?? false) === true, 'ok was not true');
    $watch = $response['json']['watch'] ?? [];
    $watchId = (string) ($watch['id'] ?? '');
    smoke_check($name . ' watch id', $watchId !== '', 'watch id missing');
    smoke_check($name . ' level', ($watch['level'] ?? '') === $level, 'level mismatch');
    smoke_check($name . ' total', (int) ($watch['total'] ?? 0) === smoke_watch_length($level), 'total mismatch');
    smoke_check($name . ' response privacy', smoke_no_public_keys($response['json'], ['accepted_answers', 'answer', 'branch', 'module', 'user_id', 'email', 'token', 'csrf']), 'public response exposed private keys');

    $items = $watchId !== '' ? smoke_selected_items($watchId) : [];
    smoke_check($name . ' stored count', count($items) === smoke_watch_length($level), 'stored item count mismatch');
    if ($branch !== null) {
        smoke_check($name . ' focus quota', smoke_count_branch($items, $branch) === smoke_focus_quota($level), 'focused branch quota mismatch');
        smoke_check($name . ' type floor', smoke_meets_type_floor($items, $level), 'focused type floor failed');
    }

    return $watchId;
}

function smoke_ids_for(callable $predicate, int $limit): array {
    $ids = [];
    foreach (smoke_items() as $item) {
        if ($predicate($item)) {
            $ids[] = (string) $item['id'];
            if (count($ids) >= $limit) break;
        }
    }
    return $ids;
}

function smoke_target_text(string $itemId): string {
    $map = smoke_item_map();
    return (string) ($map[$itemId]['target_text'] ?? '');
}

function smoke_first_item_id(string $watchId): string {
    return smoke_selected_ids($watchId)[0] ?? '';
}

function smoke_answer_watch_item(string $watchId, int $index, string $answer, bool $usedHint = false, bool $skipped = false): array {
    return smoke_post('/api/captain-ether/submit-answer.php', [
        'watch_id' => $watchId,
        'index' => $index,
        'answer' => $answer,
        'used_hint' => $usedHint,
        'skipped' => $skipped,
    ]);
}

try {
    $backup = smoke_backup_storage(smoke_storage_files($storageNames));
    smoke_seed_user($testUserId, $testEmail, $sessionToken, $csrfToken);
    $server = smoke_start_server($phpBin, $appRoot, $port, (string) $serverLog);
    smoke_wait_for_server('127.0.0.1', $port);

    smoke_start_watch('mixed beginner default', ['level' => 'beginner'], 'beginner');
    smoke_start_watch('mixed intermediate', ['level' => 'intermediate'], 'intermediate');
    smoke_start_watch('mixed advanced', ['level' => 'advanced'], 'advanced');
    smoke_start_watch('legacy branch ignored', ['level' => 'beginner', 'branch' => 'core_radio'], 'beginner');
    smoke_start_watch('legacy module ignored', ['level' => 'beginner', 'module' => 'radio_basics'], 'beginner');
    smoke_start_watch('explicit mixed ignores focus fields', ['level' => 'beginner', 'mode' => 'mixed', 'branch' => 'core_radio', 'module' => 'radio_basics'], 'beginner');

    $unbranched = smoke_ids_for(static fn(array $item): bool => ($item['branch'] ?? '') === '', 1);
    smoke_check('legacy unbranched content remains eligible', count($unbranched) > 0, 'no unbranched starter items found');

    $weakIds = smoke_ids_for(static fn(array $item): bool => in_array($item['level'] ?? '', smoke_allowed_levels('advanced'), true), 12);
    smoke_seed_weak_points($testUserId, $weakIds);
    $mixedWeakWatch = smoke_start_watch('mixed weak hard cap', ['level' => 'advanced'], 'advanced');
    $mixedWeakSelected = array_intersect(smoke_selected_ids($mixedWeakWatch), $weakIds);
    smoke_check('mixed weak hard cap count', count($mixedWeakSelected) <= smoke_weak_quota('advanced'), 'selected too many weak items');

    smoke_seed_weak_points($testUserId, []);
    smoke_expect_error_no_mutation('invalid mode', ['level' => 'beginner', 'mode' => 'bad_mode'], 400, 'invalid_watch_mode');
    smoke_expect_error_no_mutation('missing focused branch', ['level' => 'beginner', 'mode' => 'focused_branch'], 400, 'missing_branch');
    smoke_expect_error_no_mutation('invalid focused branch', ['level' => 'beginner', 'mode' => 'focused_branch', 'branch' => 'not_a_branch'], 400, 'invalid_branch');

    smoke_start_watch('focused core beginner', ['level' => 'beginner', 'mode' => 'focused_branch', 'branch' => 'core_radio'], 'beginner', 'core_radio');
    smoke_start_watch('focused core intermediate', ['level' => 'intermediate', 'mode' => 'focused_branch', 'branch' => 'core_radio'], 'intermediate', 'core_radio');
    smoke_start_watch('focused marina advanced', ['level' => 'advanced', 'mode' => 'focused_branch', 'branch' => 'marina_harbour'], 'advanced', 'marina_harbour');
    smoke_start_watch('focused navigation intermediate', ['level' => 'intermediate', 'mode' => 'focused_branch', 'branch' => 'navigation_reports'], 'intermediate', 'navigation_reports');
    smoke_start_watch('focused safety advanced', ['level' => 'advanced', 'mode' => 'focused_branch', 'branch' => 'safety_securite'], 'advanced', 'safety_securite');

    smoke_expect_error_no_mutation('focused navigation beginner unavailable', ['level' => 'beginner', 'mode' => 'focused_branch', 'branch' => 'navigation_reports'], 409, 'branch_watch_unavailable');
    smoke_expect_error_no_mutation('focused traffic collision unavailable', ['level' => 'advanced', 'mode' => 'focused_branch', 'branch' => 'traffic_collision'], 409, 'branch_watch_unavailable');
    smoke_expect_error_no_mutation('focused urgency below threshold', ['level' => 'beginner', 'mode' => 'focused_branch', 'branch' => 'urgency_panpan'], 409, 'branch_watch_unavailable');
    smoke_expect_error_no_mutation('focused module no branch', ['level' => 'beginner', 'mode' => 'focused_module'], 409, 'focused_module_unavailable');
    smoke_expect_error_no_mutation('focused module no module', ['level' => 'beginner', 'mode' => 'focused_module', 'branch' => 'core_radio'], 409, 'focused_module_unavailable');
    smoke_expect_error_no_mutation('focused module invalid module', ['level' => 'beginner', 'mode' => 'focused_module', 'branch' => 'core_radio', 'module' => 'x'], 409, 'focused_module_unavailable');
    smoke_expect_error_no_mutation('focused module valid-looking unavailable', ['level' => 'beginner', 'mode' => 'focused_module', 'branch' => 'core_radio', 'module' => 'radio_basics'], 409, 'focused_module_unavailable');

    $branchWeakIds = smoke_ids_for(static fn(array $item): bool => ($item['branch'] ?? '') === 'core_radio' && in_array($item['level'] ?? '', smoke_allowed_levels('intermediate'), true), 2);
    $reviewWeakIds = smoke_ids_for(static fn(array $item): bool => ($item['branch'] ?? '') !== 'core_radio' && ($item['branch'] ?? '') !== '' && in_array($item['level'] ?? '', smoke_allowed_levels('intermediate'), true), 2);
    smoke_seed_weak_points($testUserId, array_merge($branchWeakIds, $reviewWeakIds));
    $focusedWeakWatch = smoke_start_watch('focused branch weak distribution', ['level' => 'intermediate', 'mode' => 'focused_branch', 'branch' => 'core_radio'], 'intermediate', 'core_radio');
    $focusedWeakItems = smoke_selected_items($focusedWeakWatch);
    $focusedWeakIds = smoke_selected_ids($focusedWeakWatch);
    smoke_check('focused weak hard cap count', count(array_intersect($focusedWeakIds, array_merge($branchWeakIds, $reviewWeakIds))) <= smoke_weak_quota('intermediate'), 'selected too many weak items');
    smoke_check('focused review excludes same branch overflow', count($focusedWeakItems) - smoke_count_branch($focusedWeakItems, 'core_radio') === smoke_watch_length('intermediate') - smoke_focus_quota('intermediate'), 'review quota mismatch');

    smoke_seed_weak_points($testUserId, []);
    $flowWatch = smoke_start_watch('submit flow watch', ['level' => 'beginner', 'mode' => 'focused_branch', 'branch' => 'core_radio'], 'beginner', 'core_radio');
    $firstItemId = smoke_first_item_id($flowWatch);
    $submit = smoke_answer_watch_item($flowWatch, 0, smoke_target_text($firstItemId));
    smoke_check('submit answer status', $submit['status'] === 200, 'expected 200, got ' . $submit['status']);
    smoke_check('submit answer correct', ($submit['json']['correct'] ?? false) === true, 'answer not accepted');
    smoke_check('submit answer next privacy', smoke_no_public_keys($submit['json']['next'] ?? [], ['accepted_answers', 'answer', 'branch', 'module', 'user_id', 'email', 'token', 'csrf']), 'next payload exposed private keys');

    foreach (smoke_selected_ids($flowWatch) as $index => $itemId) {
        if ($index === 0) continue;
        smoke_answer_watch_item($flowWatch, $index, smoke_target_text($itemId));
    }
    $finish = smoke_post('/api/captain-ether/finish-watch.php', ['watch_id' => $flowWatch]);
    smoke_check('finish status', $finish['status'] === 200, 'expected 200, got ' . $finish['status']);
    smoke_check('finish summary', isset($finish['json']['summary']['final_score']), 'final score missing');

    $progress = smoke_get('/api/captain-ether/progress.php');
    smoke_check('progress status', $progress['status'] === 200, 'expected 200, got ' . $progress['status']);
    smoke_check('progress completed', (int) ($progress['json']['progress']['completed_watches'] ?? 0) >= 1, 'completed watch not recorded');

    $lostWatch = smoke_start_watch('lost oar source watch', ['level' => 'beginner'], 'beginner');
    smoke_answer_watch_item($lostWatch, 0, 'definitely wrong answer');
    $lost = smoke_get('/api/captain-ether/lost-oars.php');
    smoke_check('lost oars status', $lost['status'] === 200, 'expected 200, got ' . $lost['status']);
    smoke_check('lost oars present', count($lost['json']['lost_oars'] ?? []) >= 1, 'lost oar not created');
    smoke_check('lost oars privacy', smoke_no_public_keys($lost['json'], ['email', 'user_id', 'token', 'csrf']), 'lost-oars payload exposed private keys');

    $answerLog = smoke_get('/api/captain-ether/answer-log.php?limit=20');
    smoke_check('answer log status', $answerLog['status'] === 200, 'expected 200, got ' . $answerLog['status']);
    smoke_check('answer log entries', count($answerLog['json']['entries'] ?? []) >= 1, 'answer log was not written');
    smoke_check('answer log privacy', smoke_no_public_keys($answerLog['json'], ['email', 'user_id', 'token', 'csrf']), 'answer-log payload exposed private keys');

    $lostItemId = (string) (($lost['json']['lost_oars'][0]['item_id'] ?? ''));
    $resolve = smoke_post('/api/captain-ether/resolve-lost-oar.php', ['item_id' => $lostItemId, 'answer' => smoke_target_text($lostItemId)]);
    smoke_check('resolve lost oar status', $resolve['status'] === 200, 'expected 200, got ' . $resolve['status']);
    smoke_check('resolve lost oar correct', ($resolve['json']['correct'] ?? false) === true, 'lost oar was not resolved');

    $skip = smoke_post('/api/captain-ether/skip-cleanup.php', []);
    smoke_check('skip cleanup no unresolved status', $skip['status'] === 200, 'expected 200, got ' . $skip['status']);
    smoke_check('skip cleanup no force', ($skip['json']['force_hangar'] ?? true) === false, 'unexpected force_hangar');
} catch (Throwable $error) {
    $failures[] = 'fatal: ' . $error->getMessage();
} finally {
    smoke_stop_server($server);
    smoke_restore_storage($backup);
    if (is_string($serverLog) && is_file($serverLog)) {
        unlink($serverLog);
    }
}

if ($failures) {
    echo 'FAIL captain-ether-api-smoke checks=' . count($checks) . ' failures=' . count($failures) . PHP_EOL;
    foreach ($failures as $failure) {
        echo '- ' . $failure . PHP_EOL;
    }
    exit(1);
}

echo 'PASS captain-ether-api-smoke checks=' . count($checks) . PHP_EOL;
