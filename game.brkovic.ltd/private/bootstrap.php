<?php
declare(strict_types=1);

const APP_ROOT = __DIR__ . '/..';
const STORAGE_DIR = APP_ROOT . '/storage';
const CONTENT_DIR = APP_ROOT . '/content';

$configPath = __DIR__ . '/config.php';
$exampleConfigPath = __DIR__ . '/config.example.php';
$appConfig = is_file($configPath) ? require $configPath : require $exampleConfigPath;

if (!is_dir(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0775, true);
}

function app_config(?string $key = null, mixed $default = null): mixed {
    global $appConfig;
    if ($key === null) return $appConfig;
    return $appConfig[$key] ?? $default;
}

function json_response(int $status, array $payload): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : [];
}

function require_method(string $method): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        json_response(405, ['ok' => false, 'error' => 'Method not allowed']);
    }
}

function storage_path(string $name): string {
    return STORAGE_DIR . '/' . preg_replace('/[^a-z0-9_.-]/i', '', $name) . '.json';
}

function storage_load_unlocked(string $name, array $default): array {
    $path = storage_path($name);
    if (!is_file($path)) return $default;
    $raw = file_get_contents($path);
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : $default;
}

function storage_read(string $name, array $default): array {
    return storage_load_unlocked($name, $default);
}

function storage_write_unlocked(string $name, array $data): void {
    $path = storage_path($name);
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        json_response(500, ['ok' => false, 'error' => 'JSON encode failed']);
    }
    file_put_contents($tmp, $encoded . PHP_EOL, LOCK_EX);
    rename($tmp, $path);
}

function storage_mutate(string $name, array $default, callable $callback): mixed {
    $lockPath = STORAGE_DIR . '/.' . preg_replace('/[^a-z0-9_.-]/i', '', $name) . '.lock';
    $lock = fopen($lockPath, 'c+');
    if (!$lock) {
        json_response(500, ['ok' => false, 'error' => 'Storage lock unavailable']);
    }
    try {
        flock($lock, LOCK_EX);
        $data = storage_load_unlocked($name, $default);
        $result = $callback($data);
        storage_write_unlocked($name, $data);
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function client_ip(): string {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return is_string($ip) && filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
}

function clean_email(mixed $value): string {
    $email = mb_strtolower(trim((string) $value), 'UTF-8');
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
}

function clean_text(mixed $value, int $maxLength = 240): string {
    $text = trim((string) $value);
    $text = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $text) ?? '';
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    if ($maxLength > 0 && mb_strlen($text, 'UTF-8') > $maxLength) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }
    return $text;
}

function now_ts(): int {
    return time();
}

function iso_time(?int $ts = null): string {
    return gmdate('c', $ts ?? now_ts());
}

function cookie_secure(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

function set_session_cookie(string $token, int $expires): void {
    setcookie(app_config('session_cookie', 'brk_game_session'), $token, [
        'expires' => $expires,
        'path' => '/',
        'secure' => cookie_secure(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clear_session_cookie(): void {
    setcookie(app_config('session_cookie', 'brk_game_session'), '', [
        'expires' => now_ts() - 3600,
        'path' => '/',
        'secure' => cookie_secure(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function session_token_from_request(): string {
    $cookieName = app_config('session_cookie', 'brk_game_session');
    return preg_replace('/[^a-f0-9]/', '', (string) ($_COOKIE[$cookieName] ?? '')) ?: '';
}

function users_default(): array {
    return ['users' => [], 'email_index' => []];
}

function sessions_default(): array {
    return ['sessions' => []];
}

function login_codes_default(): array {
    return ['codes' => []];
}

function progress_default(): array {
    return ['users' => []];
}

function weak_points_default(): array {
    return ['users' => []];
}

function watch_sessions_default(): array {
    return ['sessions' => []];
}

function public_user(array $user): array {
    return [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'player',
        'created_at' => $user['created_at'] ?? null,
    ];
}

function find_or_create_user(string $email, array $profile = []): array {
    return storage_mutate('users', users_default(), function (array &$store) use ($email, $profile) {
        $emailKey = hash('sha256', $email);
        $id = $store['email_index'][$emailKey] ?? null;
        if ($id && isset($store['users'][$id])) {
            $store['users'][$id]['last_login_at'] = iso_time();
            foreach (['ecosystem_user_id', 'provider', 'name'] as $key) {
                if (!empty($profile[$key])) {
                    $store['users'][$id][$key] = clean_text($profile[$key], 240);
                }
            }
            return $store['users'][$id];
        }

        $adminEmails = array_map(
            static fn($item) => mb_strtolower((string) $item, 'UTF-8'),
            app_config('admin_emails', [])
        );
        $id = 'usr_' . bin2hex(random_bytes(8));
        $store['users'][$id] = [
            'id' => $id,
            'email' => $email,
            'role' => in_array($email, $adminEmails, true) ? 'admin' : 'player',
            'provider' => clean_text($profile['provider'] ?? 'email', 80),
            'ecosystem_user_id' => clean_text($profile['ecosystem_user_id'] ?? '', 160),
            'name' => clean_text($profile['name'] ?? '', 240),
            'created_at' => iso_time(),
            'last_login_at' => iso_time(),
        ];
        $store['email_index'][$emailKey] = $id;
        return $store['users'][$id];
    });
}

function create_session(array $user): array {
    $token = bin2hex(random_bytes(32));
    $csrf = bin2hex(random_bytes(16));
    $expires = now_ts() + ((int) app_config('session_days', 30) * 86400);
    storage_mutate('sessions', sessions_default(), function (array &$store) use ($token, $csrf, $expires, $user) {
        $store['sessions'][$token] = [
            'token' => $token,
            'csrf' => $csrf,
            'user_id' => $user['id'],
            'created_at' => iso_time(),
            'expires_at' => iso_time($expires),
        ];
        foreach ($store['sessions'] as $key => $session) {
            if (strtotime((string) ($session['expires_at'] ?? '')) < now_ts()) {
                unset($store['sessions'][$key]);
            }
        }
    });
    set_session_cookie($token, $expires);
    return ['token' => $token, 'csrf' => $csrf, 'expires_at' => iso_time($expires)];
}

function current_session(): ?array {
    $token = session_token_from_request();
    if ($token === '') return null;
    $sessionStore = storage_read('sessions', sessions_default());
    $session = $sessionStore['sessions'][$token] ?? null;
    if (!is_array($session)) return null;
    if (strtotime((string) ($session['expires_at'] ?? '')) < now_ts()) return null;
    return $session;
}

function current_user(bool $required = true): ?array {
    $session = current_session();
    if (!$session) {
        if ($required) json_response(401, ['ok' => false, 'error' => 'Login required']);
        return null;
    }
    $users = storage_read('users', users_default());
    $user = $users['users'][$session['user_id'] ?? ''] ?? null;
    if (!is_array($user)) {
        if ($required) json_response(401, ['ok' => false, 'error' => 'Login required']);
        return null;
    }
    $user['_session'] = $session;
    return $user;
}

function require_csrf(array $user): void {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') return;
    $sent = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $expected = (string) ($user['_session']['csrf'] ?? '');
    if ($expected === '' || !hash_equals($expected, $sent)) {
        json_response(403, ['ok' => false, 'error' => 'CSRF check failed']);
    }
}

function send_login_code_email(string $email, string $code): bool {
    if (app_config('app_env', 'local') !== 'production') {
        return true;
    }

    $subject = 'Your Brkovic Games login code';
    $body = "Your Brkovic Maritime Games login code is {$code}.\n\n"
        . "It expires in " . app_config('login_code_ttl_minutes', 10) . " minutes.\n\n"
        . "If you did not request this code, ignore this email.";

    $smtp = smtp_config();
    if ($smtp) {
        try {
            send_via_smtp($smtp, $email, $subject, $body);
            return true;
        } catch (Throwable $error) {
            @file_put_contents(
                STORAGE_DIR . '/mail-error.log',
                json_encode([
                    'time' => iso_time(),
                    'type' => 'smtp',
                    'message' => $error->getMessage(),
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
                FILE_APPEND | LOCK_EX
            );
            return false;
        }
    }

    $from = sanitize_header_value(app_config('mail_from', 'no-reply@brkovic.ltd'));
    $name = sanitize_header_value(app_config('mail_from_name', 'Brkovic Maritime Games'));
    $headers = [
        'From: ' . $name . ' <' . $from . '>',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    return mail($email, $subject, $body, implode("\r\n", $headers));
}

function smtp_config(): array {
    $direct = app_config('smtp', []);
    if (is_array($direct) && $direct) {
        return $direct;
    }

    $path = (string) app_config('smtp_config_path', '');
    if ($path !== '' && is_file($path)) {
        $config = require $path;
        if (is_array($config) && is_array($config['smtp'] ?? null)) {
            return $config['smtp'];
        }
    }

    return [];
}

function sanitize_header_value(mixed $value): string {
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $value) ?? '');
}

function smtp_read($socket): string {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (preg_match('/^\d{3} /', $line)) {
            break;
        }
    }
    return $data;
}

function smtp_expect($socket, array $allowedCodes): string {
    $response = smtp_read($socket);
    $code = (int) substr(trim($response), 0, 3);
    if (!in_array($code, $allowedCodes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }
    return $response;
}

function smtp_command($socket, string $command, array $allowedCodes): string {
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $allowedCodes);
}

function smtp_headers(array $headers): string {
    $result = [];
    foreach ($headers as $name => $value) {
        $result[] = $name . ': ' . $value;
    }
    return implode("\r\n", $result);
}

function send_via_smtp(array $smtp, string $recipient, string $subject, string $body): void {
    $host = (string) ($smtp['host'] ?? '');
    $port = (int) ($smtp['port'] ?? 465);
    $encryption = (string) ($smtp['encryption'] ?? 'ssl');
    $username = (string) ($smtp['username'] ?? '');
    $password = (string) ($smtp['password'] ?? '');
    $fromEmail = sanitize_header_value($smtp['from_email'] ?? $username);
    $fromName = sanitize_header_value($smtp['from_name'] ?? app_config('mail_from_name', 'Brkovic Maritime Games'));
    $timeout = (int) ($smtp['timeout'] ?? 20);
    $recipient = sanitize_header_value($recipient);
    $subject = sanitize_header_value($subject);

    if ($host === '' || $username === '' || $password === '' || $fromEmail === '') {
        throw new RuntimeException('SMTP is not fully configured.');
    }

    $transportHost = $encryption === 'ssl' ? 'ssl://' . $host : $host;
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ],
    ]);

    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client(
        $transportHost . ':' . $port,
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT,
        $context
    );
    if (!$socket) {
        throw new RuntimeException('SMTP connection failed: ' . $errstr . ' (' . $errno . ')');
    }

    stream_set_timeout($socket, $timeout);
    try {
        smtp_expect($socket, [220]);
        smtp_command($socket, 'EHLO game.brkovic.ltd', [250]);

        if ($encryption === 'tls') {
            smtp_command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Could not enable TLS encryption.');
            }
            smtp_command($socket, 'EHLO game.brkovic.ltd', [250]);
        }

        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode($username), [334]);
        smtp_command($socket, base64_encode($password), [235]);
        smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $headers = smtp_headers([
            'Date' => date(DATE_RFC2822),
            'From' => sprintf('%s <%s>', $fromName, $fromEmail),
            'Reply-To' => $fromEmail,
            'To' => $recipient,
            'Subject' => '=?UTF-8?B?' . base64_encode($subject) . '?=',
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'X-Mailer' => 'Brkovic Maritime Games',
        ]);

        $safeBody = preg_replace("/(\r\n|\r|\n)/", "\r\n", $body) ?? $body;
        $safeBody = preg_replace('/^\./m', '..', $safeBody) ?? $safeBody;
        fwrite($socket, $headers . "\r\n\r\n" . $safeBody . "\r\n.\r\n");
        smtp_expect($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

function normalize_answer(string $value): string {
    $value = mb_strtolower(trim($value), 'UTF-8');
    $value = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $value) ?? $value;
    return preg_replace('/\s+/u', ' ', trim($value)) ?? trim($value);
}

function captain_content(): array {
    $path = CONTENT_DIR . '/captain-ether/starter.json';
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : ['items' => [], 'grammar_patterns' => [], 'scenarios' => []];
}

function captain_items_by_id(): array {
    $items = [];
    foreach (captain_content()['items'] ?? [] as $item) {
        if (is_array($item) && isset($item['id'])) {
            $items[$item['id']] = $item;
        }
    }
    return $items;
}

function visible_question(array $question, array $item): array {
    return [
        'index' => $question['index'],
        'item_id' => $item['id'],
        'type' => $item['type'],
        'level' => $item['level'],
        'topic' => $item['topic'],
        'prompt' => $item['source_text'],
        'hint' => $item['hint_' . ($question['level'] ?? 'beginner')] ?? $item['hint_beginner'] ?? '',
        'answered' => isset($question['answer']),
        'result' => $question['result'] ?? null,
    ];
}

function user_progress(string $userId): array {
    $store = storage_read('progress', progress_default());
    $default = [
        'skip_cleanup_count' => 0,
        'completed_watches' => 0,
        'last_level' => 'beginner',
        'history' => [],
    ];
    return array_replace($default, $store['users'][$userId] ?? []);
}

function unresolved_weak_points(string $userId): array {
    $store = storage_read('weak_points', weak_points_default());
    $points = $store['users'][$userId] ?? [];
    return array_filter($points, static fn($point) => empty($point['resolved_at']));
}

function mark_weak_point(string $userId, array $item, string $reason, string $answer): void {
    storage_mutate('weak_points', weak_points_default(), function (array &$store) use ($userId, $item, $reason, $answer) {
        $store['users'][$userId] = $store['users'][$userId] ?? [];
        $existing = $store['users'][$userId][$item['id']] ?? [];
        $store['users'][$userId][$item['id']] = [
            'item_id' => $item['id'],
            'reason' => $reason,
            'last_answer' => $answer,
            'wrong_count' => (int) ($existing['wrong_count'] ?? 0) + ($reason === 'wrong' ? 1 : 0),
            'hint_count' => (int) ($existing['hint_count'] ?? 0) + ($reason === 'hint' ? 1 : 0),
            'skip_count' => (int) ($existing['skip_count'] ?? 0) + ($reason === 'skip' ? 1 : 0),
            'created_at' => $existing['created_at'] ?? iso_time(),
            'updated_at' => iso_time(),
            'resolved_at' => null,
        ];
    });
}

function resolve_weak_point(string $userId, string $itemId): void {
    storage_mutate('weak_points', weak_points_default(), function (array &$store) use ($userId, $itemId) {
        if (isset($store['users'][$userId][$itemId])) {
            $store['users'][$userId][$itemId]['resolved_at'] = iso_time();
            $store['users'][$userId][$itemId]['updated_at'] = iso_time();
        }
    });
}

function maritime_message(string $type): string {
    $messages = [
        'clean' => ['Вот. Берег понял.', 'Эфир чистый.', 'Уже похоже на человека с рацией.'],
        'hint' => ['Подглядели в штурманский стол — засчитаем половину.', 'С подсказкой дошли. Тоже путь.'],
        'weak' => ['Почти. Но берег бы переспросил.', 'Смысл рядом, фраза ушла к чайкам.', 'Не страшно. Соберём фразу по-морскому.'],
        'hangar' => ['Вёсла на борту. Эфир подлатали.'],
    ];
    $pool = $messages[$type] ?? $messages['weak'];
    return $pool[array_rand($pool)];
}
