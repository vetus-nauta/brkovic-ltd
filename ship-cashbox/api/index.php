<?php
declare(strict_types=1);

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_name('ship_cashbox_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

const APP_VERSION = '2026.05.31-ship-cashbox-001';
const AUTH_BASE = 'https://brkovic.ltd/api';
const STORAGE_DIR = __DIR__ . '/../storage';
const SESSIONS_DIR = STORAGE_DIR . '/sessions';
const EXPORTS_DIR = STORAGE_DIR . '/exports';
const INDEX_FILE = STORAGE_DIR . '/index.json';
const AUTH_COOKIE = 'ship_cashbox_auth';

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    cors_headers();
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void {
    respond(['error' => $message], $status);
}

function input_json(): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (preg_match('#^https?://(127\.0\.0\.1|localhost)(:\d+)?$#', $origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
}

function ensure_dirs(): void {
    foreach ([STORAGE_DIR, SESSIONS_DIR, EXPORTS_DIR] as $dir) {
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            fail('Не удалось подготовить хранилище', 500);
        }
    }
}

function is_local_request(): bool {
    return in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
}

function auth_secret(): string {
    ensure_dirs();
    $path = STORAGE_DIR . '/.ship-cashbox-secret';
    if (!is_file($path)) {
        file_put_contents($path, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($path, 0600);
    }
    return trim((string) file_get_contents($path));
}

function set_local_auth_cookie(): void {
    $expires = time() + 60 * 60 * 24 * 30;
    $payload = (string) $expires;
    $sig = hash_hmac('sha256', $payload, auth_secret());
    setcookie(AUTH_COOKIE, $payload . '.' . $sig, [
        'expires' => $expires,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function has_local_auth_cookie(): bool {
    $raw = (string) ($_COOKIE[AUTH_COOKIE] ?? '');
    if (!str_contains($raw, '.')) {
        return false;
    }
    [$expires, $sig] = explode('.', $raw, 2);
    if (!ctype_digit($expires) || (int) $expires < time()) {
        return false;
    }
    $expected = hash_hmac('sha256', $expires, auth_secret());
    return hash_equals($expected, $sig);
}

function auth_request(string $route, string $method = 'GET', array $payload = []): array {
    $ch = curl_init(AUTH_BASE . $route);
    if (!$ch) {
        fail('Auth unavailable', 502);
    }

    $headers = ['Accept: application/json'];
    if (!empty($_SESSION['brkovic_live_cookie'])) {
        $headers[] = 'Cookie: ' . $_SESSION['brkovic_live_cookie'];
    }
    if ($method !== 'GET') {
        $headers[] = 'Content-Type: application/json';
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 25,
    ]);

    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    }

    $response = curl_exec($ch);
    if ($response === false) {
        $message = curl_error($ch) ?: 'Auth request failed';
        curl_close($ch);
        fail($message, 502);
    }

    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $rawHeaders = substr((string) $response, 0, $headerSize);
    $body = substr((string) $response, $headerSize);
    curl_close($ch);

    foreach (preg_split('/\r\n|\n|\r/', $rawHeaders) as $line) {
        if (stripos($line, 'Set-Cookie:') !== 0) {
            continue;
        }
        $cookie = trim(substr($line, 11));
        $pair = explode(';', $cookie, 2)[0] ?? '';
        if (stripos($pair, 'ship_journal_admin=') === 0) {
            $_SESSION['brkovic_live_cookie'] = $pair;
        }
    }

    $data = json_decode($body, true);
    return ['status' => $status, 'data' => is_array($data) ? $data : []];
}

function authenticated(): bool {
    if (is_local_request()) {
        return true;
    }
    if (has_local_auth_cookie()) {
        return true;
    }
    if (empty($_SESSION['brkovic_live_cookie'])) {
        return false;
    }
    $me = auth_request('/auth/me');
    return (bool) ($me['data']['authenticated'] ?? false);
}

function require_auth(): void {
    if (!authenticated()) {
        fail('Нужно войти в админку', 401);
    }
}

function now_iso(): string {
    return gmdate('c');
}

function rand_id(string $prefix): string {
    return $prefix . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(4)), 0, 8);
}

function money_round(float $value): float {
    return round($value, 2);
}

function bool_value(mixed $value, bool $default = false): bool {
    if ($value === null) {
        return $default;
    }
    if (is_bool($value)) {
        return $value;
    }
    if (is_string($value)) {
        $normalized = strtolower(trim($value));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }
    }
    return (bool) $value;
}

function money_input(mixed $value): float {
    if (is_string($value)) {
        $value = str_replace(',', '.', trim($value));
    }
    return money_round((float) $value);
}

function notebook_hash(string $text): string {
    return hash('sha256', str_replace("\r", '', $text));
}

function session_path(string $id, ?string $createdAt = null): string {
    $year = $createdAt ? substr($createdAt, 0, 4) : date('Y');
    $dir = SESSIONS_DIR . '/' . $year;
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать папку сессий', 500);
    }
    return $dir . '/' . basename($id) . '.json';
}

function read_json_file(string $path): ?array {
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : null;
}

function write_json_file(string $path, array $data): void {
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать каталог для записи', 500);
    }
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function read_index(): array {
    ensure_dirs();
    $data = read_json_file(INDEX_FILE);
    if ($data) {
        return $data;
    }
    return ['active_session_id' => null];
}

function write_index(array $index): void {
    write_json_file(INDEX_FILE, $index);
}

function normalize_entry(array $entry, int $lineIndex = 0): array {
    $kind = in_array($entry['entry_kind'] ?? '', ['contribution', 'expense', 'note'], true) ? $entry['entry_kind'] : 'note';
    $amount = isset($entry['amount']) ? (float) $entry['amount'] : 0.0;
    if ($kind === 'contribution') {
        $amount = abs($amount);
    } elseif ($kind === 'expense') {
        $amount = -abs($amount);
    } else {
        $amount = 0.0;
    }

    return [
        'id' => (string) ($entry['id'] ?? rand_id('entry')),
        'line_index' => $lineIndex,
        'raw_text' => trim((string) ($entry['raw_text'] ?? '')),
        'note' => trim((string) ($entry['note'] ?? '')),
        'amount' => money_round($amount),
        'entry_kind' => $kind,
        'created_at' => (string) ($entry['created_at'] ?? now_iso()),
        'updated_at' => (string) ($entry['updated_at'] ?? now_iso()),
    ];
}

function normalize_participant(array $participant, bool $treasurerFallback = false): array {
    $role = $participant['role'] ?? ($treasurerFallback ? 'treasurer' : 'participant');
    if (!in_array($role, ['treasurer', 'participant'], true)) {
        $role = $treasurerFallback ? 'treasurer' : 'participant';
    }

    $entries = [];
    foreach (($participant['entries'] ?? []) as $index => $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $entries[] = normalize_entry($entry, $index);
    }

    return [
        'id' => (string) ($participant['id'] ?? rand_id('part')),
        'display_name' => trim((string) ($participant['display_name'] ?? '')) ?: ($role === 'treasurer' ? 'Treasurer' : 'Crew member'),
        'role' => $role,
        'active' => array_key_exists('active', $participant) ? (bool) $participant['active'] : true,
        'included_in_split' => array_key_exists('included_in_split', $participant) ? bool_value($participant['included_in_split'], true) : true,
        'cashbox_contribution' => array_key_exists('cashbox_contribution', $participant) ? max(0, money_input($participant['cashbox_contribution'])) : 0.0,
        'authorized_at' => $participant['authorized_at'] ?? ($role === 'treasurer' ? now_iso() : null),
        'invite_token' => (string) ($participant['invite_token'] ?? bin2hex(random_bytes(16))),
        'joined_at' => (string) ($participant['joined_at'] ?? now_iso()),
        'notebook_text' => str_replace("\r", '', (string) ($participant['notebook_text'] ?? '')),
        'notebook_hash' => (string) ($participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? ''))),
        'last_synced_at' => $participant['last_synced_at'] ?? null,
        'last_sync_source' => (string) ($participant['last_sync_source'] ?? ''),
        'entries' => $entries,
    ];
}

function normalize_attachment(array $item): ?array {
    $id = trim((string) ($item['id'] ?? ''));
    $filePath = trim((string) ($item['file_path'] ?? $item['filePath'] ?? ''));
    if ($id === '' || $filePath === '') {
        return null;
    }

    return [
        'id' => $id,
        'file_path' => $filePath,
        'type' => trim((string) ($item['type'] ?? 'IMAGE')) ?: 'IMAGE',
        'alt' => trim((string) ($item['alt'] ?? $item['altRu'] ?? '')),
        'mime_type' => trim((string) ($item['mime_type'] ?? $item['mimeType'] ?? '')),
        'created_at' => (string) ($item['created_at'] ?? $item['createdAt'] ?? now_iso()),
    ];
}

function parse_notebook(string $text): array {
    $lines = preg_split('/\r\n|\n|\r/', str_replace("\r", '', $text)) ?: [];
    $entries = [];

    foreach ($lines as $index => $line) {
        $raw = trim($line);
        if ($raw === '') {
            continue;
        }

        $match = [];
        $pattern = '/^\s*(?<sign>[+-])?\s*(?<currency>€)?\s*(?<amount>\d+(?:[.,]\d+)?)\s*(?<note>.*)$/u';
        if (!preg_match($pattern, $raw, $match)) {
            $entries[] = normalize_entry([
                'raw_text' => $raw,
                'note' => $raw,
                'entry_kind' => 'note',
            ], $index);
            continue;
        }

        $amount = (float) str_replace(',', '.', (string) ($match['amount'] ?? '0'));
        $sign = (string) ($match['sign'] ?? '');
        $note = trim((string) ($match['note'] ?? ''));
        $kind = $sign === '+' ? 'contribution' : 'expense';
        if ($sign === '' && (($match['currency'] ?? '') === '€')) {
            $kind = 'expense';
        }

        $entries[] = normalize_entry([
            'raw_text' => $raw,
            'note' => $note !== '' ? $note : $raw,
            'amount' => $kind === 'contribution' ? $amount : -$amount,
            'entry_kind' => $kind,
        ], $index);
    }

    return $entries;
}

function normalized_treasurer_expense_mode(array $session): string {
    $mode = (string) ($session['treasurer_expense_mode'] ?? 'auto');
    return in_array($mode, ['auto', 'cashbox', 'personal'], true) ? $mode : 'auto';
}

function build_direct_settlement_lines(array $participantTotals, string $balanceKey = 'balance'): array {
    $creditors = [];
    $debtors = [];

    foreach ($participantTotals as $totals) {
        $balance = money_round((float) ($totals[$balanceKey] ?? 0));
        if ($balance > 0.009) {
            $creditors[] = ['participant_id' => $totals['participant_id'], 'display_name' => $totals['display_name'], 'amount' => $balance];
        } elseif ($balance < -0.009) {
            $debtors[] = ['participant_id' => $totals['participant_id'], 'display_name' => $totals['display_name'], 'amount' => abs($balance)];
        }
    }

    $lines = [];
    $creditorIndex = 0;
    $debtorIndex = 0;

    while ($creditorIndex < count($creditors) && $debtorIndex < count($debtors)) {
        $credit = $creditors[$creditorIndex];
        $debt = $debtors[$debtorIndex];
        $amount = money_round(min($credit['amount'], $debt['amount']));

        if ($amount > 0) {
            $lines[] = [
                'kind' => 'participant_transfer',
                'from_participant_id' => $debt['participant_id'],
                'from_display_name' => $debt['display_name'],
                'to_participant_id' => $credit['participant_id'],
                'to_display_name' => $credit['display_name'],
                'amount' => $amount,
            ];
        }

        $creditors[$creditorIndex]['amount'] = money_round($credit['amount'] - $amount);
        $debtors[$debtorIndex]['amount'] = money_round($debt['amount'] - $amount);

        if ($creditors[$creditorIndex]['amount'] <= 0.009) {
            $creditorIndex += 1;
        }
        if ($debtors[$debtorIndex]['amount'] <= 0.009) {
            $debtorIndex += 1;
        }
    }

    return $lines;
}

function build_cashbox_settlement_lines(array $participantTotals, string $treasurerId): array {
    $treasurer = $participantTotals[$treasurerId] ?? null;
    if (!$treasurer) {
        return [];
    }

    $lines = [];
    foreach ($participantTotals as $totals) {
        if (($totals['participant_id'] ?? '') === $treasurerId) {
            continue;
        }
        $balance = money_round((float) ($totals['balance'] ?? 0));
        if ($balance > 0.009) {
            $lines[] = [
                'kind' => 'cashbox_payout',
                'from_participant_id' => $treasurerId,
                'from_display_name' => $treasurer['display_name'],
                'to_participant_id' => $totals['participant_id'],
                'to_display_name' => $totals['display_name'],
                'amount' => $balance,
            ];
        } elseif ($balance < -0.009) {
            $lines[] = [
                'kind' => 'cashbox_topup',
                'from_participant_id' => $totals['participant_id'],
                'from_display_name' => $totals['display_name'],
                'to_participant_id' => $treasurerId,
                'to_display_name' => $treasurer['display_name'],
                'amount' => abs($balance),
            ];
        }
    }

    return $lines;
}

function compute_totals(array $session): array {
    $participantTotals = [];
    $totalContributions = 0.0;
    $splitCount = 0;

    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }

        $includedInSplit = bool_value($participant['included_in_split'] ?? true, true);
        if ($includedInSplit) {
            $splitCount += 1;
        }
        $contributions = max(0, money_input($participant['cashbox_contribution'] ?? 0));
        $totalContributions += $contributions;
    }

    $storedMode = normalized_treasurer_expense_mode($session);
    $resolvedTreasurerMode = $storedMode === 'auto'
        ? ($totalContributions > 0.009 ? 'cashbox' : 'personal')
        : $storedMode;
    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    $totalPersonalExpenses = 0.0;
    $totalCashboxExpenses = 0.0;

    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }

        $includedInSplit = bool_value($participant['included_in_split'] ?? true, true);
        $contributions = max(0, money_input($participant['cashbox_contribution'] ?? 0));
        $personalExpenses = 0.0;
        $cashboxExpenses = 0.0;
        $notes = [];
        $usesCashbox = (($participant['id'] ?? '') === $treasurerId) && $resolvedTreasurerMode === 'cashbox';
        foreach (($participant['entries'] ?? []) as $entry) {
            $kind = $entry['entry_kind'] ?? 'note';
            if ($kind === 'expense') {
                $amount = abs((float) ($entry['amount'] ?? 0));
                if ($usesCashbox) {
                    $cashboxExpenses += $amount;
                } else {
                    $personalExpenses += $amount;
                }
            } else {
                $notes[] = $entry;
            }
        }

        $totalPersonalExpenses += $personalExpenses;
        $totalCashboxExpenses += $cashboxExpenses;
        $participantTotals[$participant['id']] = [
            'participant_id' => $participant['id'],
            'display_name' => $participant['display_name'],
            'role' => $participant['role'],
            'included_in_split' => $includedInSplit,
            'contributions' => money_round($contributions),
            'personal_expenses' => money_round($personalExpenses),
            'cashbox_expenses' => money_round($cashboxExpenses),
            'expenses' => money_round($cashboxExpenses > 0 ? $cashboxExpenses : $personalExpenses),
            'balance' => 0.0,
            'direct_balance' => 0.0,
            'notes' => $notes,
            'entries' => $participant['entries'] ?? [],
        ];
    }

    $totalExpenses = money_round($totalPersonalExpenses + $totalCashboxExpenses);
    $share = $splitCount > 0 ? money_round($totalExpenses / $splitCount) : 0.0;
    foreach ($participantTotals as $id => $totals) {
        $participantShare = ($totals['included_in_split'] ?? true) ? $share : 0.0;
        $participantTotals[$id]['direct_balance'] = money_round($totals['personal_expenses'] - $participantShare);
        $participantTotals[$id]['balance'] = money_round($totals['contributions'] + $totals['personal_expenses'] - $participantShare);
    }

    $cashboxBalance = money_round($totalContributions - $totalCashboxExpenses);
    $settlementMode = ($totalContributions > 0.009 || $totalCashboxExpenses > 0.009 || $resolvedTreasurerMode === 'cashbox')
        ? 'cashbox'
        : 'direct';

    return [
        'total_contributions' => money_round($totalContributions),
        'total_expenses' => money_round($totalExpenses),
        'total_personal_expenses' => money_round($totalPersonalExpenses),
        'total_cashbox_expenses' => money_round($totalCashboxExpenses),
        'cashbox_balance' => $cashboxBalance,
        'share' => money_round($share),
        'participant_count' => $splitCount,
        'treasurer_expense_mode' => $storedMode,
        'treasurer_expense_mode_resolved' => $resolvedTreasurerMode,
        'settlement_mode' => $settlementMode,
        'participants' => $participantTotals,
    ];
}

function build_settlement_lines(array $participantTotals): array {
    return build_direct_settlement_lines($participantTotals, 'balance');
}

function default_session(): array {
    $createdAt = now_iso();
    $treasurer = normalize_participant([
        'display_name' => 'Treasurer',
        'role' => 'treasurer',
        'active' => true,
        'included_in_split' => true,
        'cashbox_contribution' => 0,
        'authorized_at' => $createdAt,
        'notebook_text' => '',
        'entries' => [],
    ], true);

    return [
        'id' => rand_id('cashbox'),
        'title' => 'Ship Cashbox',
        'currency' => 'EUR',
        'treasurer_expense_mode' => 'auto',
        'status' => 'active',
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'closed_at' => null,
        'treasurer_participant_id' => $treasurer['id'],
        'participants' => [$treasurer],
        'settlement' => null,
        'exports' => [],
    ];
}

function list_sessions(): array {
    ensure_dirs();
    $sessions = [];
    foreach (glob(SESSIONS_DIR . '/*/*.json') ?: [] as $path) {
        $data = read_json_file($path);
        if (!is_array($data)) {
            continue;
        }
        $sessions[] = normalize_session($data);
    }
    usort($sessions, static function (array $a, array $b): int {
        return strcmp((string) ($b['updated_at'] ?? ''), (string) ($a['updated_at'] ?? ''));
    });
    return $sessions;
}

function normalize_session(array $session): array {
    $participants = [];
    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');

    foreach (($session['participants'] ?? []) as $index => $participant) {
        if (!is_array($participant)) {
            continue;
        }
        $participants[] = normalize_participant($participant, $index === 0 && $treasurerId === '');
    }

    if (!$participants) {
        $participants[] = normalize_participant(['display_name' => 'Treasurer', 'role' => 'treasurer'], true);
    }

    $participantIds = array_column($participants, 'id');
    if ($treasurerId === '' || !in_array($treasurerId, $participantIds, true)) {
        $treasurerId = $participants[0]['id'];
        $participants[0]['role'] = 'treasurer';
    }

    foreach ($participants as &$participant) {
        $participant['role'] = $participant['id'] === $treasurerId ? 'treasurer' : 'participant';
    }
    unset($participant);

    return [
        'id' => (string) ($session['id'] ?? rand_id('cashbox')),
        'title' => trim((string) ($session['title'] ?? 'Ship Cashbox')) ?: 'Ship Cashbox',
        'currency' => trim((string) ($session['currency'] ?? 'EUR')) ?: 'EUR',
        'treasurer_expense_mode' => normalized_treasurer_expense_mode($session),
        'status' => in_array($session['status'] ?? '', ['active', 'closed'], true) ? $session['status'] : 'active',
        'created_at' => (string) ($session['created_at'] ?? now_iso()),
        'updated_at' => (string) ($session['updated_at'] ?? now_iso()),
        'closed_at' => $session['closed_at'] ?? null,
        'treasurer_participant_id' => $treasurerId,
        'participants' => $participants,
        'attachment_post_id' => trim((string) ($session['attachment_post_id'] ?? '')) ?: null,
        'attachments' => array_values(array_filter(array_map(
            static fn(array $item): ?array => normalize_attachment($item),
            array_values(array_filter($session['attachments'] ?? [], 'is_array'))
        ))),
        'settlement' => is_array($session['settlement'] ?? null) ? $session['settlement'] : null,
        'exports' => array_values(array_filter($session['exports'] ?? [], 'is_array')),
    ];
}

function save_session(array $session): array {
    $normalized = normalize_session($session);
    $normalized['updated_at'] = now_iso();
    write_json_file(session_path($normalized['id'], $normalized['created_at']), $normalized);
    return $normalized;
}

function find_session(string $id): ?array {
    foreach (list_sessions() as $session) {
        if (($session['id'] ?? '') === $id) {
            return $session;
        }
    }
    return null;
}

function find_session_by_token(string $token): ?array {
    foreach (list_sessions() as $session) {
        foreach (($session['participants'] ?? []) as $participant) {
            if (($participant['invite_token'] ?? '') === $token) {
                return $session;
            }
        }
    }
    return null;
}

function find_participant_by_token(array $session, string $token): ?array {
    foreach (($session['participants'] ?? []) as $participant) {
        if (($participant['invite_token'] ?? '') === $token) {
            return $participant;
        }
    }
    return null;
}

function participant_for_session(array $session, string $participantId): ?array {
    foreach (($session['participants'] ?? []) as $participant) {
        if (($participant['id'] ?? '') === $participantId) {
            return $participant;
        }
    }
    return null;
}

function relative_export_path(string $absolutePath): string {
    return 'storage/exports/' . ltrim(str_replace(EXPORTS_DIR, '', $absolutePath), '/');
}

function build_treasurer_payload(?array $session): array {
    $archive = [];

    foreach (list_sessions() as $item) {
        if (($item['status'] ?? '') !== 'closed') {
            continue;
        }
        $itemTotals = compute_totals($item);
        $archive[] = [
            'id' => $item['id'],
            'title' => $item['title'],
            'currency' => $item['currency'],
            'closed_at' => $item['closed_at'],
            'participants' => $itemTotals['participant_count'],
            'cashbox_balance' => $itemTotals['cashbox_balance'],
            'exports' => $item['exports'],
            'settlement_lines' => $item['settlement']['lines'] ?? [],
        ];
    }

    if (!$session) {
        return [
            'session' => null,
            'archive' => $archive,
        ];
    }

    $totals = compute_totals($session);
    $settlementLines = $totals['settlement_mode'] === 'cashbox'
        ? build_cashbox_settlement_lines($totals['participants'], (string) $session['treasurer_participant_id'])
        : build_direct_settlement_lines($totals['participants'], 'direct_balance');

    return [
        'session' => [
            'id' => $session['id'],
            'title' => $session['title'],
            'currency' => $session['currency'],
            'treasurer_expense_mode' => normalized_treasurer_expense_mode($session),
            'treasurer_expense_mode_resolved' => $totals['treasurer_expense_mode_resolved'],
            'status' => $session['status'],
            'created_at' => $session['created_at'],
            'updated_at' => $session['updated_at'],
            'closed_at' => $session['closed_at'],
            'treasurer_participant_id' => $session['treasurer_participant_id'],
            'participants' => array_values(array_map(static function (array $participant) use ($totals, $session): array {
                $summary = $totals['participants'][$participant['id']] ?? [
                    'contributions' => 0.0,
                    'expenses' => 0.0,
                    'balance' => 0.0,
                    'entries' => [],
                ];
                return [
                    'id' => $participant['id'],
                    'display_name' => $participant['display_name'],
                    'role' => $participant['role'],
                    'active' => $participant['active'],
                    'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
                    'cashbox_contribution' => money_input($participant['cashbox_contribution'] ?? 0),
                    'authorized_at' => $participant['authorized_at'] ?? null,
                    'invite_token' => $participant['invite_token'],
                    'invite_link' => build_invite_link($participant['invite_token']),
                    'notebook_text' => $participant['notebook_text'],
                    'notebook_hash' => $participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? '')),
                    'last_synced_at' => $participant['last_synced_at'] ?? null,
                    'last_sync_source' => $participant['last_sync_source'] ?? '',
                    'entries' => $participant['entries'],
                    'contributions' => $summary['contributions'],
                    'expenses' => $summary['expenses'],
                    'personal_expenses' => $summary['personal_expenses'],
                    'cashbox_expenses' => $summary['cashbox_expenses'],
                    'balance' => $summary['balance'],
                    'joined_at' => $participant['joined_at'],
                    'read_only' => ($session['status'] ?? '') === 'closed',
                ];
            }, $session['participants'])),
            'totals' => $totals,
            'settlement_preview' => [
                'mode' => $totals['settlement_mode'],
                'lines' => $settlementLines,
                'ready' => count($settlementLines) > 0 || $totals['participant_count'] > 0,
            ],
            'attachment_post_id' => $session['attachment_post_id'] ?? null,
            'attachments' => $session['attachments'] ?? [],
            'exports' => $session['exports'],
        ],
        'archive' => $archive,
    ];
}

function build_participant_payload(array $session, array $participant): array {
    $totals = compute_totals($session);
    $summary = $totals['participants'][$participant['id']] ?? [
        'contributions' => 0.0,
        'expenses' => 0.0,
        'balance' => 0.0,
        'entries' => [],
    ];

    $instructions = [];
    foreach (($session['settlement']['lines'] ?? []) as $line) {
        if (($line['from_participant_id'] ?? '') === $participant['id'] || ($line['to_participant_id'] ?? '') === $participant['id']) {
            $instructions[] = $line;
        }
    }

    $viewParticipantId = trim((string) ($_GET['view'] ?? ''));
    $requestedView = $viewParticipantId !== '' ? participant_for_session($session, $viewParticipantId) : null;
    $viewTarget = $requestedView ?: $participant;
    $viewSummary = $totals['participants'][$viewTarget['id']] ?? [
        'contributions' => 0.0,
        'expenses' => 0.0,
        'balance' => 0.0,
        'entries' => [],
    ];
    $readOnlyView = $viewTarget['id'] !== $participant['id'] || (($session['status'] ?? '') === 'closed');

    $directory = [];
    foreach (($session['participants'] ?? []) as $item) {
        if (!($item['active'] ?? true)) {
            continue;
        }
        $directory[] = [
            'id' => $item['id'],
            'display_name' => $item['display_name'],
            'role' => $item['role'],
            'is_self' => $item['id'] === $participant['id'],
            'read_link' => build_invite_link($participant['invite_token']) . '&view=' . rawurlencode($item['id']),
        ];
    }

    return [
        'session' => [
            'id' => $session['id'],
            'title' => $session['title'],
            'currency' => $session['currency'],
            'status' => $session['status'],
            'created_at' => $session['created_at'],
            'closed_at' => $session['closed_at'],
        ],
        'participant' => [
            'id' => $participant['id'],
            'display_name' => $participant['display_name'],
            'role' => $participant['role'],
            'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
            'cashbox_contribution' => money_input($participant['cashbox_contribution'] ?? 0),
            'authorized_at' => $participant['authorized_at'] ?? null,
            'notebook_text' => $participant['notebook_text'],
            'entries' => $participant['entries'],
            'contributions' => $summary['contributions'],
            'expenses' => $summary['expenses'],
            'personal_expenses' => $summary['personal_expenses'],
            'cashbox_expenses' => $summary['cashbox_expenses'],
            'balance' => $summary['balance'],
            'invite_token' => $participant['invite_token'],
            'notebook_hash' => $participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? '')),
            'last_synced_at' => $participant['last_synced_at'] ?? null,
            'last_sync_source' => $participant['last_sync_source'] ?? '',
            'read_only' => (($session['status'] ?? '') === 'closed'),
            'settlement_lines' => $instructions,
            'directory' => $directory,
            'viewing' => [
                'id' => $viewTarget['id'],
                'display_name' => $viewTarget['display_name'],
                'role' => $viewTarget['role'],
                'included_in_split' => bool_value($viewTarget['included_in_split'] ?? true, true),
                'cashbox_contribution' => money_input($viewTarget['cashbox_contribution'] ?? 0),
                'authorized_at' => $viewTarget['authorized_at'] ?? null,
                'notebook_text' => $viewTarget['notebook_text'],
                'entries' => $viewTarget['entries'],
                'contributions' => $viewSummary['contributions'],
                'expenses' => $viewSummary['expenses'],
                'personal_expenses' => $viewSummary['personal_expenses'],
                'cashbox_expenses' => $viewSummary['cashbox_expenses'],
                'balance' => $viewSummary['balance'],
                'read_only' => $readOnlyView,
                'is_self' => $viewTarget['id'] === $participant['id'],
            ],
        ],
    ];
}

function build_invite_link(string $token): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:18090';
    $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/ship-cashbox/api/index.php')), '/');
    return $scheme . '://' . $host . $base . '/index.html?invite=' . rawurlencode($token);
}

function save_session_meta(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }

    $inputParticipants = array_values(array_filter($payload['participants'] ?? [], 'is_array'));
    if (!$inputParticipants) {
        fail('Добавьте хотя бы одного участника', 422);
    }

    $existing = [];
    foreach ($session['participants'] as $participant) {
        $existing[$participant['id']] = $participant;
    }

    $participants = [];
    $treasurerId = trim((string) ($payload['treasurer_participant_id'] ?? ''));
    foreach ($inputParticipants as $index => $item) {
        $id = trim((string) ($item['id'] ?? ''));
        $base = $existing[$id] ?? [];
        $isTreasurer = $treasurerId !== '' ? $treasurerId === $id : $index === 0;
        $role = $isTreasurer ? 'treasurer' : 'participant';
        $participant = normalize_participant([
            'id' => $id !== '' ? $id : rand_id('part'),
            'display_name' => trim((string) ($item['display_name'] ?? '')),
            'role' => $role,
            'active' => array_key_exists('active', $item) ? (bool) $item['active'] : true,
            'included_in_split' => $role === 'treasurer'
                ? bool_value($item['included_in_split'] ?? ($base['included_in_split'] ?? true), true)
                : true,
            'cashbox_contribution' => $role === 'treasurer' && !bool_value($item['included_in_split'] ?? ($base['included_in_split'] ?? true), true)
                ? 0
                : money_input($item['cashbox_contribution'] ?? ($base['cashbox_contribution'] ?? 0)),
            'authorized_at' => $base['authorized_at'] ?? ($role === 'treasurer' ? now_iso() : null),
            'invite_token' => $base['invite_token'] ?? null,
            'joined_at' => $base['joined_at'] ?? null,
            'notebook_text' => $base['notebook_text'] ?? '',
            'notebook_hash' => $base['notebook_hash'] ?? null,
            'last_synced_at' => $base['last_synced_at'] ?? null,
            'last_sync_source' => $base['last_sync_source'] ?? '',
            'entries' => $base['entries'] ?? [],
        ], $role === 'treasurer');
        if ($role === 'treasurer') {
            $treasurerId = $participant['id'];
        }
        $participants[] = $participant;
    }

    if ($treasurerId === '') {
        $participants[0]['role'] = 'treasurer';
        $treasurerId = $participants[0]['id'];
    }

    foreach ($participants as &$participant) {
        $participant['role'] = $participant['id'] === $treasurerId ? 'treasurer' : 'participant';
    }
    unset($participant);

    $session['title'] = trim((string) ($payload['title'] ?? $session['title'])) ?: 'Ship Cashbox';
    $session['currency'] = trim((string) ($payload['currency'] ?? $session['currency'])) ?: 'EUR';
    $session['treasurer_expense_mode'] = in_array(($payload['treasurer_expense_mode'] ?? null), ['auto', 'cashbox', 'personal'], true)
        ? (string) $payload['treasurer_expense_mode']
        : normalized_treasurer_expense_mode($session);
    $session['treasurer_participant_id'] = $treasurerId;
    $session['participants'] = $participants;
    $session['attachment_post_id'] = trim((string) ($payload['attachment_post_id'] ?? ($session['attachment_post_id'] ?? ''))) ?: null;
    $session['attachments'] = array_values(array_filter(array_map(
        static fn(array $item): ?array => normalize_attachment($item),
        array_values(array_filter($payload['attachments'] ?? ($session['attachments'] ?? []), 'is_array'))
    )));

    return save_session($session);
}

function save_notebook_text(string $token, string $text, string $source = 'manual'): array {
    $session = find_session_by_token($token);
    if (!$session) {
        fail('Инвайт не найден', 404);
    }
    if (($session['status'] ?? '') !== 'active') {
        fail('Касса уже закрыта', 409);
    }

    $source = in_array($source, ['manual', 'scheduled'], true) ? $source : 'manual';
    $text = str_replace("\r", '', $text);
    $incomingHash = notebook_hash($text);

    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        if (($participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? ''))) === $incomingHash) {
            $saved = normalize_session($session);
            $found = find_participant_by_token($saved, $token);
            if (!$found) {
                fail('Участник не найден', 404);
            }
            $payload = build_participant_payload($saved, $found);
            $payload['sync_result'] = 'noop';
            return $payload;
        }
        $participant['notebook_text'] = $text;
        $participant['notebook_hash'] = $incomingHash;
        $participant['entries'] = parse_notebook($participant['notebook_text']);
        $participant['joined_at'] = $participant['joined_at'] ?: now_iso();
        $participant['authorized_at'] = $participant['authorized_at'] ?? now_iso();
        $participant['last_synced_at'] = now_iso();
        $participant['last_sync_source'] = $source;
    }
    unset($participant);

    $saved = save_session($session);
    $participant = find_participant_by_token($saved, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $payload = build_participant_payload($saved, $participant);
    $payload['sync_result'] = 'updated';
    return $payload;
}

function authorize_participant_view(array $session, string $token): array {
    $changed = false;
    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        if (empty($participant['authorized_at'])) {
            $participant['authorized_at'] = now_iso();
            $changed = true;
        }
        $participant['joined_at'] = $participant['joined_at'] ?: now_iso();
    }
    unset($participant);

    return $changed ? save_session($session) : normalize_session($session);
}

function save_treasurer_notebook(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }

    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $treasurerId) {
            continue;
        }
        $participant['notebook_text'] = str_replace("\r", '', (string) ($payload['notebook_text'] ?? ''));
        $participant['notebook_hash'] = notebook_hash($participant['notebook_text']);
        $participant['entries'] = parse_notebook($participant['notebook_text']);
        $participant['last_synced_at'] = now_iso();
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    return save_session($session);
}

function create_new_session(array $payload = []): array {
    $session = default_session();
    if (trim((string) ($payload['title'] ?? '')) !== '') {
        $session['title'] = trim((string) $payload['title']);
    }
    if (trim((string) ($payload['currency'] ?? '')) !== '') {
        $session['currency'] = trim((string) $payload['currency']);
    }
    $saved = save_session($session);
    write_index(['active_session_id' => $saved['id']]);
    return $saved;
}

function export_year_dir(array $session): string {
    $year = substr((string) ($session['created_at'] ?? date('Y-m-d')), 0, 4);
    $dir = EXPORTS_DIR . '/' . $year;
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать каталог экспортов', 500);
    }
    return $dir;
}

function money_format(float $value, string $currency): string {
    $sign = $value > 0 ? '+' : ($value < 0 ? '-' : '');
    return $sign . $currency . number_format(abs($value), 2, '.', ' ');
}

function session_export_text(array $session, array $totals, array $lines, string $type): string {
    $text = [];
    $text[] = 'Vetus Nauta / Ship Cashbox';
    $text[] = $session['title'];
    $text[] = 'Status: ' . ($type === 'settlement' ? 'Settled' : ucfirst((string) ($session['status'] ?? 'active')));
    $text[] = 'Created: ' . ($session['created_at'] ?? '');
    if (!empty($session['closed_at'])) {
        $text[] = 'Settled: ' . $session['closed_at'];
    }
    $text[] = 'Currency: ' . $session['currency'];
    $text[] = '';

    if ($type === 'settlement') {
        $text[] = 'Summary';
        $text[] = 'Total contributions: ' . money_format((float) $totals['total_contributions'], (string) $session['currency']);
        $text[] = 'Total expenses: ' . money_format((float) $totals['total_expenses'], (string) $session['currency']);
        $text[] = 'Cashbox balance: ' . money_format((float) $totals['cashbox_balance'], (string) $session['currency']);
        $text[] = 'Equal share: ' . money_format((float) $totals['share'], (string) $session['currency']);
        $text[] = '';
        $text[] = 'Participants';
        foreach ($totals['participants'] as $participant) {
            $text[] = sprintf(
                '%s | +%s | -%s | %s',
                $participant['display_name'],
                number_format((float) $participant['contributions'], 2, '.', ' '),
                number_format((float) $participant['expenses'], 2, '.', ' '),
                money_format((float) $participant['balance'], (string) $session['currency'])
            );
        }
        $text[] = '';
        $text[] = 'Settlement transfers';
        if (!$lines) {
            $text[] = 'No transfers required.';
        }
        foreach ($lines as $line) {
            $text[] = sprintf('%s -> %s : %s', $line['from_display_name'], $line['to_display_name'], money_format((float) $line['amount'], (string) $session['currency']));
        }
        return implode("\n", $text) . "\n";
    }

    $text[] = 'Expense log';
    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }
        $text[] = '';
        $text[] = $participant['display_name'];
        $entries = $participant['entries'] ?? [];
        if (!$entries) {
            $text[] = '(empty)';
            continue;
        }
        foreach ($entries as $entry) {
            $text[] = $entry['raw_text'] ?: ($entry['note'] ?? '');
        }
    }

    return implode("\n", $text) . "\n";
}

function ascii_text(string $text): string {
    $map = [
        'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Д' => 'D', 'Ђ' => 'Dj', 'Е' => 'E', 'Ж' => 'Zh', 'З' => 'Z',
        'И' => 'I', 'Ј' => 'J', 'К' => 'K', 'Л' => 'L', 'Љ' => 'Lj', 'М' => 'M', 'Н' => 'N', 'Њ' => 'Nj', 'О' => 'O',
        'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T', 'Ћ' => 'C', 'У' => 'U', 'Ф' => 'F', 'Х' => 'H', 'Ц' => 'C',
        'Ч' => 'Ch', 'Џ' => 'Dz', 'Ш' => 'Sh', 'Щ' => 'Sh', 'Ы' => 'Y', 'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya',
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'ђ' => 'dj', 'е' => 'e', 'ж' => 'zh', 'з' => 'z',
        'и' => 'i', 'ј' => 'j', 'к' => 'k', 'л' => 'l', 'љ' => 'lj', 'м' => 'm', 'н' => 'n', 'њ' => 'nj', 'о' => 'o',
        'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'ћ' => 'c', 'у' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'c',
        'ч' => 'ch', 'џ' => 'dz', 'ш' => 'sh', 'щ' => 'sh', 'ы' => 'y', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
    ];
    $text = strtr($text, $map);
    $text = preg_replace('/[^\x09\x0A\x0D\x20-\x7E]/', '?', $text) ?? $text;
    return $text;
}

function simple_pdf(string $text, string $path): void {
    $text = ascii_text($text);
    $lines = preg_split('/\r\n|\n|\r/', $text) ?: [];
    $pages = array_chunk($lines, 42);
    $objects = [];
    $pageIds = [];

    $objects[] = "<< /Type /Catalog /Pages 2 0 R >>";
    $objects[] = "";

    foreach ($pages as $pageIndex => $pageLines) {
        $content = "BT\n/F1 10 Tf\n50 790 Td\n14 TL\n";
        foreach ($pageLines as $line) {
            $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $line);
            $content .= '(' . $escaped . ") Tj\nT*\n";
        }
        $content .= "ET\n";

        $contentObjectId = count($objects) + 1;
        $objects[] = "<< /Length " . strlen($content) . " >>\nstream\n" . $content . "endstream";

        $pageObjectId = count($objects) + 1;
        $objects[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 " . (count($pages) * 2 + 3) . " 0 R >> >> /Contents {$contentObjectId} 0 R >>";
        $pageIds[] = $pageObjectId;
    }

    $kids = implode(' ', array_map(static fn(int $id): string => $id . ' 0 R', $pageIds));
    $objects[1] = "<< /Type /Pages /Kids [{$kids}] /Count " . count($pageIds) . " >>";
    $objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $index => $object) {
        $offsets[] = strlen($pdf);
        $pdf .= ($index + 1) . " 0 obj\n" . $object . "\nendobj\n";
    }

    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
    $pdf .= "0000000000 65535 f \n";
    foreach (array_slice($offsets, 1) as $offset) {
        $pdf .= sprintf('%010d 00000 n ', $offset) . "\n";
    }
    $pdf .= "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\n";
    $pdf .= "startxref\n{$xref}\n%%EOF";
    file_put_contents($path, $pdf, LOCK_EX);
}

function html_to_pdf(string $html, string $path): void {
    $tmpHtml = tempnam(sys_get_temp_dir(), 'ship-cashbox-html-');
    if ($tmpHtml === false) {
        simple_pdf(strip_tags($html), $path);
        return;
    }

    file_put_contents($tmpHtml, $html, LOCK_EX);

    $commands = [
        'google-chrome --headless --disable-gpu --no-margins --print-to-pdf=' . escapeshellarg($path) . ' ' . escapeshellarg($tmpHtml),
        'chromium-browser --headless --disable-gpu --no-margins --print-to-pdf=' . escapeshellarg($path) . ' ' . escapeshellarg($tmpHtml),
        'chromium --headless --disable-gpu --no-margins --print-to-pdf=' . escapeshellarg($path) . ' ' . escapeshellarg($tmpHtml),
        'wkhtmltopdf ' . escapeshellarg($tmpHtml) . ' ' . escapeshellarg($path),
    ];

    foreach ($commands as $command) {
        $bin = strtok($command, ' ');
        if (!$bin || trim((string) shell_exec('command -v ' . escapeshellarg($bin) . ' 2>/dev/null')) === '') {
            continue;
        }
        @exec($command . ' >/dev/null 2>&1', $output, $code);
        if ($code === 0 && is_file($path) && filesize($path) > 0) {
            @unlink($tmpHtml);
            return;
        }
    }

    @unlink($tmpHtml);
    simple_pdf(strip_tags($html), $path);
}

function settlement_html(array $session, array $totals, array $lines): string {
    $rows = '';
    foreach ($totals['participants'] as $participant) {
        $rows .= '<tr><td>' . htmlspecialchars($participant['display_name'], ENT_QUOTES, 'UTF-8') . '</td><td>' . number_format((float) $participant['contributions'], 2) . '</td><td>' . number_format((float) $participant['expenses'], 2) . '</td><td>' . number_format((float) $participant['balance'], 2) . '</td></tr>';
    }
    $lineRows = '';
    foreach ($lines as $line) {
        $lineRows .= '<tr><td>' . htmlspecialchars($line['from_display_name'], ENT_QUOTES, 'UTF-8') . '</td><td>' . htmlspecialchars($line['to_display_name'], ENT_QUOTES, 'UTF-8') . '</td><td>' . number_format((float) $line['amount'], 2) . ' ' . htmlspecialchars($session['currency'], ENT_QUOTES, 'UTF-8') . '</td></tr>';
    }
    if ($lineRows === '') {
        $lineRows = '<tr><td colspan="3">No transfers required.</td></tr>';
    }

    return '<!doctype html><html><head><meta charset="utf-8"><style>'
        . 'body{font-family:Arial,sans-serif;color:#111827;padding:18px}h1,h2{margin:0 0 12px}p{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#f3f4f6}'
        . '</style></head><body>'
        . '<h1>Vetus Nauta / Ship Cashbox</h1>'
        . '<p><strong>Cashbox:</strong> ' . htmlspecialchars($session['title'], ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Status:</strong> Settled</p>'
        . '<p><strong>Created:</strong> ' . htmlspecialchars((string) $session['created_at'], ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Settled:</strong> ' . htmlspecialchars((string) ($session['closed_at'] ?? ''), ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Currency:</strong> ' . htmlspecialchars($session['currency'], ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Total contributions:</strong> ' . number_format((float) $totals['total_contributions'], 2) . '</p>'
        . '<p><strong>Total expenses:</strong> ' . number_format((float) $totals['total_expenses'], 2) . '</p>'
        . '<p><strong>Cashbox balance:</strong> ' . number_format((float) $totals['cashbox_balance'], 2) . '</p>'
        . '<p><strong>Equal share:</strong> ' . number_format((float) $totals['share'], 2) . '</p>'
        . '<h2>Participants</h2><table><tr><th>Name</th><th>Contributions</th><th>Expenses</th><th>Balance</th></tr>' . $rows . '</table>'
        . '<h2>Settlement transfers</h2><table><tr><th>From</th><th>To</th><th>Amount</th></tr>' . $lineRows . '</table>'
        . '</body></html>';
}

function log_html(array $session): string {
    $groups = '';
    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }
        $items = '';
        foreach (($participant['entries'] ?? []) as $entry) {
            $items .= '<li>' . htmlspecialchars($entry['raw_text'] ?: ($entry['note'] ?? ''), ENT_QUOTES, 'UTF-8') . '</li>';
        }
        if ($items === '') {
            $items = '<li>(empty)</li>';
        }
        $groups .= '<section><h2>' . htmlspecialchars($participant['display_name'], ENT_QUOTES, 'UTF-8') . '</h2><ul>' . $items . '</ul></section>';
    }

    return '<!doctype html><html><head><meta charset="utf-8"><style>'
        . 'body{font-family:Arial,sans-serif;color:#111827;padding:18px}h1,h2{margin:0 0 10px}section{margin:18px 0}ul{margin:0;padding-left:18px}li{margin:6px 0}'
        . '</style></head><body>'
        . '<h1>Vetus Nauta / Ship Cashbox</h1>'
        . '<p><strong>Cashbox:</strong> ' . htmlspecialchars($session['title'], ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Status:</strong> ' . htmlspecialchars(ucfirst((string) ($session['status'] ?? 'active')), ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><strong>Created:</strong> ' . htmlspecialchars((string) ($session['created_at'] ?? ''), ENT_QUOTES, 'UTF-8') . '</p>'
        . $groups
        . '</body></html>';
}

function create_export_files(array $session, array $totals, array $lines): array {
    $dir = export_year_dir($session);
    $stamp = date('Ymd-His');
    $base = basename($session['id']) . '-' . $stamp;

    $settlementTxt = $dir . '/' . $base . '-settlement.txt';
    file_put_contents($settlementTxt, session_export_text($session, $totals, $lines, 'settlement'), LOCK_EX);

    $settlementPdf = $dir . '/' . $base . '-settlement.pdf';
    html_to_pdf(settlement_html($session, $totals, $lines), $settlementPdf);

    $logTxt = $dir . '/' . $base . '-expense-log.txt';
    file_put_contents($logTxt, session_export_text($session, $totals, $lines, 'log'), LOCK_EX);

    $logPdf = $dir . '/' . $base . '-expense-log.pdf';
    html_to_pdf(log_html($session), $logPdf);

    return [
        ['type' => 'settlement_txt', 'file_path' => relative_export_path($settlementTxt), 'created_at' => now_iso()],
        ['type' => 'settlement_pdf', 'file_path' => relative_export_path($settlementPdf), 'created_at' => now_iso()],
        ['type' => 'expense_log_txt', 'file_path' => relative_export_path($logTxt), 'created_at' => now_iso()],
        ['type' => 'expense_log_pdf', 'file_path' => relative_export_path($logPdf), 'created_at' => now_iso()],
    ];
}

function clone_participants_for_new_session(array $session): array {
    $participants = [];
    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }
        $participants[] = normalize_participant([
            'display_name' => $participant['display_name'],
            'role' => $participant['role'],
            'active' => true,
            'joined_at' => now_iso(),
            'notebook_text' => '',
            'notebook_hash' => notebook_hash(''),
            'last_synced_at' => null,
            'last_sync_source' => '',
            'entries' => [],
        ], ($participant['role'] ?? '') === 'treasurer');
    }
    return $participants ?: [normalize_participant(['display_name' => 'Treasurer', 'role' => 'treasurer'], true)];
}

function confirm_settlement(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }

    $totals = compute_totals($session);
    $lines = $totals['settlement_mode'] === 'cashbox'
        ? build_cashbox_settlement_lines($totals['participants'], (string) $session['treasurer_participant_id'])
        : build_direct_settlement_lines($totals['participants'], 'direct_balance');

    $session['status'] = 'closed';
    $session['closed_at'] = now_iso();
    $session['settlement'] = [
        'confirmed_at' => $session['closed_at'],
        'totals' => $totals,
        'lines' => $lines,
    ];
    $session['exports'] = create_export_files($session, $totals, $lines);
    $savedClosed = save_session($session);
    write_index(['active_session_id' => null]);

    return [
        'closed' => build_treasurer_payload($savedClosed),
        'active' => build_treasurer_payload(null),
    ];
}

function reopen_session(string $id): array {
    $session = find_session($id);
    if (!$session || ($session['status'] ?? '') !== 'closed') {
        fail('Закрытая касса не найдена', 404);
    }

    $index = read_index();
    if (!empty($index['active_session_id'])) {
        $current = find_session((string) $index['active_session_id']);
        if ($current && ($current['status'] ?? '') === 'active' && $current['id'] !== $session['id']) {
            fail('Сначала завершите или закройте текущую активную кассу', 409);
        }
    }

    $session['status'] = 'active';
    $session['closed_at'] = null;
    $session['settlement'] = null;
    $saved = save_session($session);
    write_index(['active_session_id' => $saved['id']]);
    return $saved;
}

$action = (string) ($_GET['action'] ?? 'me');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    cors_headers();
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    exit;
}

if ($action === 'login') {
    $payload = input_json();
    $auth = auth_request('/auth/login', 'POST', [
        'email' => $payload['email'] ?? '',
        'password' => $payload['password'] ?? '',
    ]);
    if (($auth['status'] ?? 500) >= 400) {
        fail($auth['data']['error']['message'] ?? 'Не удалось войти', 401);
    }
    set_local_auth_cookie();
    respond(['authenticated' => true, 'version' => APP_VERSION]);
}

if ($action === 'me') {
    respond(['authenticated' => authenticated(), 'version' => APP_VERSION]);
}

if ($action === 'participant') {
    $token = trim((string) ($_GET['token'] ?? ''));
    if ($token === '') {
        fail('Нужен invite token', 422);
    }
    $session = find_session_by_token($token);
    if (!$session) {
        fail('Инвайт не найден', 404);
    }
    $participant = find_participant_by_token($session, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $session = authorize_participant_view($session, $token);
    $participant = find_participant_by_token($session, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    respond(build_participant_payload($session, $participant));
}

if ($action === 'participant-save') {
    $payload = input_json();
    $token = trim((string) ($payload['token'] ?? ''));
    if ($token === '') {
        fail('Нужен invite token', 422);
    }
    respond(save_notebook_text($token, (string) ($payload['notebook_text'] ?? ''), (string) ($payload['sync_source'] ?? 'manual')));
}

require_auth();

if ($action === 'boot') {
    $index = read_index();
    $session = null;
    if (!empty($index['active_session_id'])) {
        $candidate = find_session((string) $index['active_session_id']);
        if ($candidate && ($candidate['status'] ?? '') === 'active') {
            $session = $candidate;
        }
    }
    respond(build_treasurer_payload($session) + ['version' => APP_VERSION]);
}

if ($action === 'create-session') {
    respond(build_treasurer_payload(create_new_session(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'save-session') {
    respond(build_treasurer_payload(save_session_meta(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'save-treasurer-notebook') {
    respond(build_treasurer_payload(save_treasurer_notebook(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'confirm-settlement') {
    respond(confirm_settlement(input_json()) + ['version' => APP_VERSION]);
}
if ($action === 'reopen-session') {
    $payload = input_json();
    respond(build_treasurer_payload(reopen_session((string) ($payload['id'] ?? ''))) + ['version' => APP_VERSION]);
}

fail('Не найдено', 404);
