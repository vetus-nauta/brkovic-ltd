<?php
declare(strict_types=1);

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_name('captain_fin_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => $secure ? 'None' : 'Lax',
]);
session_start();

const APP_VERSION = '2026.06.01-captain-fin-019';
const AUTH_BASE = 'https://brkovic.ltd/api';
const STORAGE_DIR = __DIR__ . '/../storage';
const REPORTS_DIR = STORAGE_DIR . '/reports';
const EXPORTS_DIR = STORAGE_DIR . '/exports';
const TRASH_DIR = STORAGE_DIR . '/trash';
const ATTACHMENTS_DIR = STORAGE_DIR . '/attachments';
const V2_DIR = STORAGE_DIR . '/v2';
const V2_LIVE_REPORTS_DIR = V2_DIR . '/live_reports';
const V2_ARCHIVES_DIR = V2_DIR . '/archives';
const V2_STATE_FILE = V2_DIR . '/state.json';
const V2_AUDIT_LOG = V2_DIR . '/audit.log';
const V2_ADMIN_ID = 'admin';
const V2_DEFAULT_CURRENCY = 'EUR';
const DRIVE_FOLDER_ID = '1x9m41AUYPocx7H0UezF_lZnFvzWO54zQ';
const AUTH_COOKIE = 'captain_fin_auth';

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
    if ($raw === '') return [];
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

function is_local_request(): bool {
    return in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
}

function auth_secret(): string {
    ensure_dirs();
    $path = STORAGE_DIR . '/.captain-fin-secret';
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
    if (!str_contains($raw, '.')) return false;
    [$expires, $sig] = explode('.', $raw, 2);
    if (!ctype_digit($expires) || (int) $expires < time()) return false;
    $expected = hash_hmac('sha256', $expires, auth_secret());
    return hash_equals($expected, $sig);
}

function auth_request(string $route, string $method = 'GET', array $payload = []): array {
    $ch = curl_init(AUTH_BASE . $route);
    if (!$ch) fail('Auth unavailable', 502);

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
        if (stripos($line, 'Set-Cookie:') !== 0) continue;
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
    if (is_local_request()) return true;
    if (has_local_auth_cookie()) return true;
    if (empty($_SESSION['brkovic_live_cookie'])) return false;
    $me = auth_request('/auth/me');
    return (bool) ($me['data']['authenticated'] ?? false);
}

function require_auth(): void {
    if (!authenticated()) fail('Нужно войти в админку', 401);
}

function ensure_dirs(): void {
    foreach ([REPORTS_DIR, EXPORTS_DIR, TRASH_DIR, ATTACHMENTS_DIR, V2_DIR, V2_LIVE_REPORTS_DIR, V2_ARCHIVES_DIR] as $dir) {
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            fail('Не удалось создать папку хранения', 500);
        }
    }
}

function year_dir(string $base, string $date): string {
    $year = preg_match('/^\d{4}/', $date) ? substr($date, 0, 4) : date('Y');
    $dir = $base . '/' . $year;
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    return $dir;
}

function report_path(string $id, string $date): string {
    return year_dir(REPORTS_DIR, $date) . '/' . basename($id) . '.json';
}

function safe_file_name(string $name): string {
    $name = preg_replace('/[^\pL\pN._ -]+/u', '_', basename($name)) ?: 'attachment';
    return trim($name, " .\t\n\r\0\x0B") ?: 'attachment';
}

function attachment_dir(string $id, string $date): string {
    $dir = year_dir(ATTACHMENTS_DIR, $date) . '/' . basename($id);
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    return $dir;
}

function attachment_mime(string $path): string {
    $extension = strtolower((string) pathinfo($path, PATHINFO_EXTENSION));
    $type = match ($extension) {
        'pdf' => 'application/pdf',
        'jpg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'heic' => 'image/heic',
        'txt' => 'text/plain',
        'json' => 'application/json',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls' => 'application/vnd.ms-excel',
        default => 'application/octet-stream',
    };
    if ($type !== 'application/octet-stream') return $type;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detected = is_resource($finfo) ? finfo_file($finfo, $path) : false;
        if (is_string($detected) && $detected !== '') {
            finfo_close($finfo);
            return $detected;
        }
        if (is_resource($finfo)) finfo_close($finfo);
    }
    return $type;
}

function list_attachments(string $id, string $date): array {
    $dir = year_dir(ATTACHMENTS_DIR, $date) . '/' . basename($id);
    $year = preg_match('/^\\d{4}/', $date) ? substr($date, 0, 4) : date('Y');
    $items = [];
    foreach (glob($dir . '/*') ?: [] as $path) {
        if (!is_file($path)) continue;
        $name = basename($path);
        $items[] = [
            'name' => $name,
            'size' => filesize($path) ?: 0,
            'updated_at' => gmdate('c', filemtime($path) ?: time()),
            'path' => 'storage/attachments/' . $year . '/' . basename($id) . '/' . $name,
            'relative_path' => 'storage/attachments/' . $year . '/' . basename($id) . '/' . $name,
            'mime' => attachment_mime($path),
            'url' => 'api/?action=attachment&id=' . rawurlencode($id) . '&file=' . rawurlencode($name),
            'download_url' => 'api/?action=attachment&id=' . rawurlencode($id) . '&file=' . rawurlencode($name) . '&disposition=attachment',
            'open_url' => 'api/?action=attachment&id=' . rawurlencode($id) . '&file=' . rawurlencode($name) . '&disposition=inline',
        ];
    }
    usort($items, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $items;
}

function sync_attachment_dir(string $id, string $oldDate, string $newDate): void {
    $oldYear = preg_match('/^\d{4}/', $oldDate) ? substr($oldDate, 0, 4) : date('Y');
    $newYear = preg_match('/^\d{4}/', $newDate) ? substr($newDate, 0, 4) : date('Y');
    if ($oldYear === $newYear) return;
    $oldDir = ATTACHMENTS_DIR . '/' . $oldYear . '/' . basename($id);
    $newDir = ATTACHMENTS_DIR . '/' . $newYear . '/' . basename($id);
    if (!is_dir($oldDir) || is_dir($newDir) && $oldDir === $newDir) return;
    if (!is_dir($newDir)) mkdir($newDir, 0775, true);
    foreach (glob($oldDir . '/*') ?: [] as $source) {
        if (!is_file($source)) continue;
        $target = $newDir . '/' . basename($source);
        if (!is_file($target)) {
            @rename($source, $target);
            continue;
        }
        $pathInfo = pathinfo($source);
        $base = $pathInfo['filename'] ?? 'attachment';
        $ext = isset($pathInfo['extension']) ? '.' . $pathInfo['extension'] : '';
        @rename($source, $newDir . '/' . $base . '-' . date('His') . $ext);
    }
    if (is_dir($oldDir) && count(glob($oldDir . '/*') ?: []) === 0) {
        @rmdir($oldDir);
    }
}

function read_report_file(string $path): ?array {
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? normalize_report($data) : null;
}

function all_reports(): array {
    ensure_dirs();
    $reports = [];
    foreach (glob(REPORTS_DIR . '/*/*.json') ?: [] as $path) {
        $report = read_report_file($path);
        if ($report) $reports[] = $report;
    }
    usort($reports, fn($a, $b) => strcmp($b['report_date'] . $b['id'], $a['report_date'] . $a['id']));
    return $reports;
}

function archived_reports(): array {
    ensure_dirs();
    $reports = [];
    foreach (glob(TRASH_DIR . '/*/*.json') ?: [] as $path) {
        $report = read_report_file($path);
        if (!$report) continue;
        $report['deleted_file'] = basename($path);
        $reports[] = $report;
    }
    usort($reports, fn($a, $b) => strcmp((string) ($b['deleted_at'] ?? '') . $b['id'], (string) ($a['deleted_at'] ?? '') . $a['id']));
    return $reports;
}

function find_report(string $id): ?array {
    foreach (glob(REPORTS_DIR . '/*/' . basename($id) . '.json') ?: [] as $path) {
        return read_report_file($path);
    }
    return null;
}

function compute(array $entries, float $opening): array {
    $income = $expense = $upcoming = 0.0;
    foreach ($entries as $entry) {
        $amount = (float) ($entry['amount'] ?? 0);
        if (($entry['type'] ?? '') === 'income') $income += $amount;
        if (($entry['type'] ?? '') === 'expense') $expense += $amount;
        if (($entry['type'] ?? '') === 'upcoming') $upcoming += $amount;
    }
    $current = $opening + $income - $expense;
    return compact('income', 'expense', 'upcoming', 'current') + ['future' => $current - $upcoming];
}

function normalize_report(array $payload): array {
    $date = (string) ($payload['report_date'] ?? date('Y-m-d'));
    $entries = [];
    foreach (($payload['entries'] ?? []) as $entry) {
        if (!is_array($entry)) continue;
        $type = in_array($entry['type'] ?? '', ['income', 'expense', 'upcoming'], true) ? $entry['type'] : 'expense';
        $entries[] = [
            'type' => $type,
            'description' => trim((string) ($entry['description'] ?? '')),
            'amount' => (float) ($entry['amount'] ?? 0),
            'entry_date' => (string) ($entry['entry_date'] ?? ''),
        ];
    }
    $report = [
        'id' => (string) ($payload['id'] ?? ('cf-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)))),
        'report_date' => $date,
        'opening_balance' => (float) ($payload['opening_balance'] ?? 0),
        'notes' => (string) ($payload['notes'] ?? ''),
        'submitted' => !empty($payload['submitted']) ? 1 : 0,
        'deleted_at' => (string) ($payload['deleted_at'] ?? ''),
        'entries' => $entries,
        'updated_at' => gmdate('c'),
        'app_version' => APP_VERSION,
    ];
    $report['computed'] = compute($entries, $report['opening_balance']);
    $report['attachments'] = list_attachments($report['id'], $report['report_date']);
    return $report;
}

function save_report(array $payload): array {
    ensure_dirs();
    $report = normalize_report($payload);
    foreach (glob(REPORTS_DIR . '/*/' . basename($report['id']) . '.json') ?: [] as $old) {
        $oldDate = basename(dirname($old));
        if ($old !== report_path($report['id'], $report['report_date'])) {
            sync_attachment_dir($report['id'], $oldDate, $report['report_date']);
            @unlink($old);
        }
    }
    $path = report_path($report['id'], $report['report_date']);
    file_put_contents($path, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    if (!empty($report['submitted'])) {
        duplicate_to_drive($path);
    }
    return $report;
}

function delete_report(string $id): bool {
    $deleted = false;
    foreach (glob(REPORTS_DIR . '/*/' . basename($id) . '.json') ?: [] as $path) {
        $report = read_report_file($path);
        $date = $report['report_date'] ?? date('Y-m-d');
        $report['deleted_at'] = gmdate('c');
        $trash = year_dir(TRASH_DIR, (string) $date) . '/' . gmdate('Ymd-His') . '-' . basename($id) . '.json';
        file_put_contents($trash, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
        @unlink($path);
        $deleted = true;
    }
    return $deleted;
}

function restore_report(string $id): ?array {
    foreach (glob(TRASH_DIR . '/*/*-' . basename($id) . '.json') ?: [] as $path) {
        $report = read_report_file($path);
        if (!$report) continue;
        $report['deleted_at'] = '';
        file_put_contents(report_path($report['id'], $report['report_date']), json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
        @unlink($path);
        return $report;
    }
    return null;
}

function upload_attachment(string $id): array {
    $report = find_report($id);
    if (!$report) fail('Отчет не найден', 404);
    if (empty($_FILES['attachment']) || !is_uploaded_file($_FILES['attachment']['tmp_name'])) fail('Файл не получен', 400);
    if ((int) ($_FILES['attachment']['size'] ?? 0) > 25 * 1024 * 1024) fail('Файл больше 25 МБ', 413);
    $name = safe_file_name((string) ($_FILES['attachment']['name'] ?? 'attachment'));
    $target = attachment_dir($report['id'], $report['report_date']) . '/' . $name;
    if (is_file($target)) {
        $info = pathinfo($name);
        $base = $info['filename'] ?? 'attachment';
        $ext = isset($info['extension']) ? '.' . $info['extension'] : '';
        $target = attachment_dir($report['id'], $report['report_date']) . '/' . $base . '-' . date('His') . $ext;
    }
    if (!move_uploaded_file($_FILES['attachment']['tmp_name'], $target)) fail('Не удалось сохранить вложение', 500);
    if (!empty($report['submitted'])) duplicate_to_drive($target);
    return list_attachments($report['id'], $report['report_date']);
}

function summary_reports(?string $from, ?string $to): array {
    $items = array_values(array_filter(all_reports(), function ($report) use ($from, $to) {
        if (empty($report['submitted'])) return false;
        $date = (string) $report['report_date'];
        if ($from && $date < $from) return false;
        if ($to && $date > $to) return false;
        return true;
    }));
    $totals = ['count' => count($items), 'opening' => 0.0, 'income' => 0.0, 'expense' => 0.0, 'upcoming' => 0.0, 'current' => 0.0, 'future' => 0.0];
    foreach ($items as $report) {
        $totals['opening'] += (float) $report['opening_balance'];
        foreach (['income', 'expense', 'upcoming', 'current', 'future'] as $key) {
            $totals[$key] += (float) ($report['computed'][$key] ?? 0);
        }
    }
    return ['from' => $from, 'to' => $to, 'totals' => $totals, 'reports' => $items];
}

function xml_escape(mixed $value): string {
    return htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function xlsx_cell(string $ref, mixed $value, int $style = 0): string {
    $styleAttr = $style > 0 ? ' s="' . $style . '"' : '';
    if (is_int($value) || is_float($value)) {
        return '<c r="' . $ref . '"' . $styleAttr . '><v>' . $value . '</v></c>';
    }
    return '<c r="' . $ref . '"' . $styleAttr . ' t="inlineStr"><is><t>' . xml_escape($value) . '</t></is></c>';
}

function xlsx_row(int $row, array $cells, ?float $height = null): string {
    $heightAttr = $height ? ' ht="' . $height . '" customHeight="1"' : '';
    $xml = '<row r="' . $row . '"' . $heightAttr . '>';
    foreach ($cells as $cell) {
        [$col, $value, $style] = $cell + [null, null, 0];
        $xml .= xlsx_cell($col . $row, $value, (int) $style);
    }
    return $xml . '</row>';
}

function xlsx_styles(): string {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        . '<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>'
        . '<fonts count="4">'
        . '<font><sz val="11"/><color rgb="FF111827"/><name val="Arial"/></font>'
        . '<font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>'
        . '<font><b/><sz val="11"/><color rgb="FF111827"/><name val="Arial"/></font>'
        . '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>'
        . '</fonts>'
        . '<fills count="11">'
        . '<fill><patternFill patternType="none"/></fill>'
        . '<fill><patternFill patternType="gray125"/></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FF065F46"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFF9FAFB"/><bgColor indexed="64"/></patternFill></fill>'
        . '</fills>'
        . '<borders count="2"><border/><border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom></border></borders>'
        . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        . '<cellXfs count="18">'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        . '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment horizontal="center" vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>'
        . '<xf numFmtId="164" fontId="2" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>'
        . '<xf numFmtId="164" fontId="2" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>'
        . '<xf numFmtId="164" fontId="2" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>'
        . '<xf numFmtId="164" fontId="2" fillId="7" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>'
        . '<xf numFmtId="164" fontId="3" fillId="8" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>'
        . '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"><alignment horizontal="right" vertical="top"/></xf>'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment horizontal="center" vertical="top"/></xf>'
        . '<xf numFmtId="164" fontId="0" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="top"/></xf>'
        . '<xf numFmtId="164" fontId="0" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="top"/></xf>'
        . '<xf numFmtId="164" fontId="0" fillId="7" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"><alignment horizontal="right" vertical="top"/></xf>'
        . '<xf numFmtId="0" fontId="0" fillId="10" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>'
        . '</cellXfs>'
        . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        . '</styleSheet>';
}

function make_xlsx(array $report): string {
    if (!class_exists('ZipArchive')) return make_excel_html($report);
    $dir = year_dir(EXPORTS_DIR, $report['report_date']);
    $path = $dir . '/report-' . $report['report_date'] . '-' . $report['id'] . '.xlsx';
    $generated = date('Y-m-d H:i');
    $current = (float) $report['computed']['current'];
    $future = (float) $report['computed']['future'];
    $notes = trim((string) ($report['notes'] ?? ''));
    $sheetRows = '';
    $sheetRows .= xlsx_row(1, [['A', 'CAPTAIN FIN · ФИНАНСОВЫЙ ОТЧЕТ', 1]], 28);
    $sheetRows .= xlsx_row(3, [['A', 'Дата отчета', 2], ['B', $report['report_date'], 3], ['D', 'Сформировано', 2], ['E', $generated, 3]]);
    $sheetRows .= xlsx_row(5, [['A', 'БЫЛО', 4], ['B', 'ПРИХОД', 4], ['C', 'РАСХОД', 4], ['D', 'СТАЛО', 4], ['E', 'БУДЕТ', 4]]);
    $sheetRows .= xlsx_row(6, [
        ['A', (float) $report['opening_balance'], 5],
        ['B', (float) $report['computed']['income'], 6],
        ['C', -(float) $report['computed']['expense'], 7],
        ['D', $current, 9],
        ['E', $future, 8],
    ], 26);
    $sheetRows .= xlsx_row(8, [['A', 'Строки отчета', 4], ['B', '', 4], ['C', '', 4], ['D', '', 4], ['E', '', 4]]);
    $sheetRows .= xlsx_row(9, [['A', 'Тип', 10], ['B', 'Описание', 10], ['C', 'Сумма', 10], ['D', 'Дата', 10], ['E', 'Комментарий', 10]]);
    $names = ['income' => 'Приход', 'expense' => 'Расход', 'upcoming' => 'Будущий расход'];
    $entryRow = 10;
    foreach ($report['entries'] as $entry) {
        $amount = (float) $entry['amount'];
        if ($entry['type'] !== 'income') $amount = -$amount;
        $moneyStyle = $entry['type'] === 'income' ? 14 : ($entry['type'] === 'upcoming' ? 16 : 15);
        $sheetRows .= xlsx_row($entryRow, [
            ['A', $names[$entry['type']] ?? $entry['type'], 11],
            ['B', $entry['description'], 11],
            ['C', $amount, $moneyStyle],
            ['D', $entry['entry_date'], 13],
            ['E', '', 11],
        ], 22);
        $entryRow++;
    }
    $noteRow = max($entryRow + 1, 12);
    $sheetRows .= xlsx_row($noteRow, [['A', 'Заметки', 10], ['B', '', 10], ['C', '', 10], ['D', '', 10], ['E', '', 10]]);
    $sheetRows .= xlsx_row($noteRow + 1, [['A', $notes !== '' ? $notes : 'Без заметок', 17]], 70);
    $dimensionEnd = 'E' . ($noteRow + 1);
    $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        . '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
        . '<dimension ref="A1:' . $dimensionEnd . '"/>'
        . '<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>'
        . '<cols><col min="1" max="1" width="18" customWidth="1"/><col min="2" max="2" width="42" customWidth="1"/><col min="3" max="3" width="16" customWidth="1"/><col min="4" max="4" width="16" customWidth="1"/><col min="5" max="5" width="24" customWidth="1"/></cols>'
        . '<sheetData>' . $sheetRows . '</sheetData>'
        . '<mergeCells count="3"><mergeCell ref="A1:E1"/><mergeCell ref="A8:E8"/><mergeCell ref="A' . ($noteRow + 1) . ':E' . ($noteRow + 1) . '"/></mergeCells>'
        . '<printOptions horizontalCentered="1"/>'
        . '<pageMargins left="0.35" right="0.35" top="0.55" bottom="0.55" header="0.2" footer="0.2"/>'
        . '<pageSetup paperSize="9" orientation="portrait" fitToWidth="1" fitToHeight="0"/>'
        . '</worksheet>';
    $zip = new ZipArchive();
    $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $zip->addFromString('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    $zip->addFromString('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Отчет" sheetId="1" r:id="rId1"/></sheets></workbook>');
    $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    $zip->addFromString('xl/styles.xml', xlsx_styles());
    $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
    $zip->close();
    duplicate_to_drive($path);
    return $path;
}

function make_excel_html(array $report): string {
    $dir = year_dir(EXPORTS_DIR, $report['report_date']);
    $path = $dir . '/report-' . $report['report_date'] . '-' . $report['id'] . '.xls';
    $names = ['income' => 'Приход', 'expense' => 'Расход', 'upcoming' => 'Будущий расход'];
    $rowColors = ['income' => '#dcfce7', 'expense' => '#fee2e2', 'upcoming' => '#fef3c7'];
    $rows = '';
    foreach ($report['entries'] as $entry) {
        $amount = (float) $entry['amount'];
        if ($entry['type'] !== 'income') $amount = -$amount;
        $bg = $rowColors[$entry['type']] ?? '#ffffff';
        $rows .= '<tr><td>' . xml_escape($names[$entry['type']] ?? $entry['type']) . '</td><td>'
            . xml_escape($entry['description']) . '</td><td style="background:' . $bg . ';text-align:right">' . $amount . '</td><td>'
            . xml_escape($entry['entry_date']) . '</td><td></td></tr>';
    }
    $html = '<html><head><meta charset="utf-8"><style>'
        . '@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#111827}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d1d5db;padding:8px}th{background:#111827;color:#fff}.title{background:#111827;color:#fff;font-size:22px;font-weight:700;text-align:center}.meta{background:#f3f4f6;font-weight:700}.money{text-align:right;font-weight:700}.before{background:#dbeafe}.income{background:#d1fae5}.expense{background:#fee2e2}.future{background:#fef3c7}.after{background:#065f46;color:#fff}.notes{height:80px;vertical-align:top;background:#f9fafb}'
        . '</style></head><body>'
        . '<table><tr><td colspan="5" class="title">CAPTAIN FIN · ФИНАНСОВЫЙ ОТЧЕТ</td></tr>'
        . '<tr><td class="meta">Дата отчета</td><td>' . xml_escape($report['report_date']) . '</td><td></td><td class="meta">Сформировано</td><td>' . date('Y-m-d H:i') . '</td></tr>'
        . '<tr><th>БЫЛО</th><th>ПРИХОД</th><th>РАСХОД</th><th>СТАЛО</th><th>БУДЕТ</th></tr>'
        . '<tr><td class="money before">' . (float) $report['opening_balance'] . '</td><td class="money income">' . (float) $report['computed']['income'] . '</td><td class="money expense">' . (-(float) $report['computed']['expense']) . '</td><td class="money after">' . (float) $report['computed']['current'] . '</td><td class="money future">' . (float) $report['computed']['future'] . '</td></tr>'
        . '</table><br><table><tr><th>Тип</th><th>Описание</th><th>Сумма</th><th>Дата</th><th>Комментарий</th></tr>'
        . $rows . '</table><br><table><tr><th colspan="5">Заметки</th></tr><tr><td colspan="5" class="notes">' . nl2br(xml_escape($report['notes'] ?? '')) . '</td></tr></table></body></html>';
    file_put_contents($path, $html, LOCK_EX);
    duplicate_to_drive($path);
    return $path;
}

function duplicate_to_drive(string $path): void {
    $rclone = trim((string) shell_exec('command -v rclone 2>/dev/null'));
    if ($rclone === '') return;
    $cmd = escapeshellcmd($rclone) . ' copy ' . escapeshellarg($path) . ' gdrive: --drive-root-folder-id ' . escapeshellarg(DRIVE_FOLDER_ID) . ' >/dev/null 2>&1 &';
    @exec($cmd);
}

function v2_now(): string {
    return gmdate('c');
}

function v2_request_data(): array {
    $payload = input_json();
    foreach ($_GET as $key => $value) {
        if ($key === 'action' || array_key_exists($key, $payload)) continue;
        $payload[$key] = $value;
    }
    return $payload;
}

function v2_default_state(): array {
    $now = v2_now();
    return [
        'schema' => 2,
        'created_at' => $now,
        'updated_at' => $now,
        'currency' => V2_DEFAULT_CURRENCY,
        'selected_mode' => 'owner',
        'selected_session_id' => '',
        'selected_participant_id' => '',
        'admin' => [
            'id' => V2_ADMIN_ID,
            'name' => 'Администратор',
            'role' => 'owner',
            'active' => true,
            'currency' => V2_DEFAULT_CURRENCY,
        ],
        'groups' => [],
        'participants' => [],
        'sessions' => [],
        'issues' => [],
        'preferences' => [],
    ];
}

function v2_write_json_atomic(string $path, array $data): void {
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать папку v2 storage', 500);
    }
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json)) fail('Не удалось сериализовать v2 JSON', 500);
    $tmp = $dir . '/.' . basename($path) . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false) {
        fail('Не удалось записать временный v2 файл', 500);
    }
    @chmod($tmp, 0664);
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        fail('Не удалось заменить v2 файл', 500);
    }
}

function v2_read_json(string $path): ?array {
    if (!is_file($path)) return null;
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : null;
}

function v2_audit(string $event, array $data = []): void {
    ensure_dirs();
    $line = json_encode([
        'at' => v2_now(),
        'event' => $event,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($line) || file_put_contents(V2_AUDIT_LOG, $line . PHP_EOL, FILE_APPEND | LOCK_EX) === false) {
        fail('Не удалось записать v2 audit', 500);
    }
}

function v2_load_state(): array {
    ensure_dirs();
    $data = v2_read_json(V2_STATE_FILE);
    return v2_normalize_state($data ?? v2_default_state());
}

function v2_save_state(array $state, string $event, array $audit = []): array {
    $state = v2_normalize_state($state);
    $state['updated_at'] = v2_now();
    v2_write_json_atomic(V2_STATE_FILE, $state);
    v2_audit($event, $audit);
    return $state;
}

function v2_normalize_state(array $state): array {
    $default = v2_default_state();
    $state['schema'] = 2;
    foreach (['created_at', 'updated_at', 'currency', 'selected_mode', 'selected_session_id', 'selected_participant_id'] as $key) {
        if (!isset($state[$key]) || !is_string($state[$key])) $state[$key] = $default[$key];
    }
    $state['currency'] = strtoupper(substr(trim($state['currency']) ?: V2_DEFAULT_CURRENCY, 0, 8));
    if (!in_array($state['selected_mode'], ['owner', 'participant'], true)) $state['selected_mode'] = 'owner';
    if (!isset($state['admin']) || !is_array($state['admin'])) $state['admin'] = [];
    $state['admin'] = array_replace($default['admin'], $state['admin']);
    $state['admin']['id'] = V2_ADMIN_ID;
    $state['admin']['role'] = 'owner';
    $state['admin']['active'] = true;
    $state['admin']['currency'] = $state['currency'];
    foreach (['groups', 'participants', 'sessions', 'issues'] as $key) {
        if (!isset($state[$key]) || !is_array($state[$key])) $state[$key] = [];
        $state[$key] = array_values(array_filter($state[$key], 'is_array'));
    }
    if (!isset($state['preferences']) || !is_array($state['preferences'])) $state['preferences'] = [];
    $state['participants'] = array_values(array_map('v2_normalize_participant', $state['participants']));
    $state['groups'] = array_values(array_map('v2_normalize_group', $state['groups']));
    $state['sessions'] = array_values(array_map('v2_normalize_session', $state['sessions']));
    $state['issues'] = array_values(array_map('v2_normalize_issue', $state['issues']));
    return $state;
}

function v2_normalize_group(array $group): array {
    $now = v2_now();
    return [
        'id' => v2_clean_id((string) ($group['id'] ?? ''), 'group'),
        'name' => trim((string) ($group['name'] ?? 'Работа')) ?: 'Работа',
        'active' => !array_key_exists('active', $group) || !empty($group['active']),
        'created_at' => (string) ($group['created_at'] ?? $now),
        'updated_at' => (string) ($group['updated_at'] ?? $now),
    ];
}

function v2_normalize_participant(array $participant): array {
    $now = v2_now();
    return [
        'id' => v2_clean_id((string) ($participant['id'] ?? ''), 'participant'),
        'group_id' => v2_clean_id((string) ($participant['group_id'] ?? 'group-default'), 'group'),
        'name' => trim((string) ($participant['name'] ?? 'Сотрудник')) ?: 'Сотрудник',
        'role' => 'participant',
        'active' => !array_key_exists('active', $participant) || !empty($participant['active']),
        'created_at' => (string) ($participant['created_at'] ?? $now),
        'updated_at' => (string) ($participant['updated_at'] ?? $now),
    ];
}

function v2_normalize_session(array $session): array {
    $now = v2_now();
    $status = (string) ($session['status'] ?? 'active');
    if (!in_array($status, ['active', 'closed'], true)) $status = 'active';
    return [
        'id' => v2_clean_id((string) ($session['id'] ?? ''), 'session'),
        'group_id' => v2_clean_id((string) ($session['group_id'] ?? 'group-default'), 'group'),
        'title' => trim((string) ($session['title'] ?? ('Сессия ' . gmdate('Y-m-d')))) ?: ('Сессия ' . gmdate('Y-m-d')),
        'status' => $status,
        'opened_at' => (string) ($session['opened_at'] ?? $now),
        'closed_at' => (string) ($session['closed_at'] ?? ''),
        'final_report_id' => (string) ($session['final_report_id'] ?? ''),
        'archive_path' => (string) ($session['archive_path'] ?? ''),
        'created_at' => (string) ($session['created_at'] ?? $now),
        'updated_at' => (string) ($session['updated_at'] ?? $now),
    ];
}

function v2_normalize_issue(array $issue): array {
    $now = v2_now();
    $status = (string) ($issue['status'] ?? 'pending');
    if (!in_array($status, ['pending', 'confirmed', 'cancelled'], true)) $status = 'pending';
    $amountMinor = abs(v2_minor_from_value($issue['amount_minor'] ?? 0));
    return [
        'id' => v2_clean_id((string) ($issue['id'] ?? ''), 'issue'),
        'session_id' => v2_clean_id((string) ($issue['session_id'] ?? ''), 'session'),
        'participant_id' => v2_clean_id((string) ($issue['participant_id'] ?? ''), 'participant'),
        'amount_minor' => $amountMinor,
        'amount' => v2_minor_to_amount($amountMinor),
        'currency' => strtoupper(substr(trim((string) ($issue['currency'] ?? V2_DEFAULT_CURRENCY)) ?: V2_DEFAULT_CURRENCY, 0, 8)),
        'status' => $status,
        'description' => trim((string) ($issue['description'] ?? '')),
        'client_operation_id' => trim((string) ($issue['client_operation_id'] ?? '')),
        'issued_by' => (string) ($issue['issued_by'] ?? V2_ADMIN_ID),
        'confirmed_by' => (string) ($issue['confirmed_by'] ?? ''),
        'issued_at' => (string) ($issue['issued_at'] ?? $now),
        'confirmed_at' => (string) ($issue['confirmed_at'] ?? ''),
        'updated_at' => (string) ($issue['updated_at'] ?? $now),
    ];
}

function v2_clean_id(string $value, string $prefix): string {
    $value = trim($value);
    $value = preg_replace('/[^A-Za-z0-9._-]+/', '-', $value) ?: '';
    $value = trim($value, '.-_');
    if ($value === '') return v2_new_id($prefix);
    return substr($value, 0, 96);
}

function v2_require_id(mixed $value, string $field): string {
    $id = trim((string) $value);
    if ($id === '' || !preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/', $id)) {
        fail('Некорректный идентификатор: ' . $field, 400);
    }
    return $id;
}

function v2_new_id(string $prefix): string {
    return $prefix . '-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(3));
}

function v2_minor_from_value(mixed $value): int {
    if (is_int($value)) return $value;
    if (is_float($value)) return (int) round($value);
    $raw = trim((string) $value);
    if ($raw === '') return 0;
    $negative = str_starts_with($raw, '-') || str_contains($raw, '−');
    $digits = preg_replace('/[^\d]+/', '', $raw) ?: '0';
    $minor = (int) $digits;
    return $negative ? -$minor : $minor;
}

function v2_major_to_minor(mixed $value): int {
    if (is_int($value)) return $value * 100;
    if (is_float($value)) return (int) round($value * 100);
    $raw = trim((string) $value);
    if ($raw === '') return 0;
    $negative = str_starts_with($raw, '-') || str_contains($raw, '−');
    $clean = preg_replace('/[^\d,.]+/u', '', $raw) ?: '';
    if ($clean === '') return 0;

    $lastComma = strrpos($clean, ',');
    $lastDot = strrpos($clean, '.');
    if ($lastComma !== false && $lastDot !== false) {
        $decimal = $lastComma > $lastDot ? ',' : '.';
        $thousands = $decimal === ',' ? '.' : ',';
        $clean = str_replace($thousands, '', $clean);
        $clean = str_replace($decimal, '.', $clean);
    } elseif ($lastComma !== false) {
        $decimals = strlen($clean) - $lastComma - 1;
        $clean = $decimals > 0 && $decimals <= 2 ? str_replace(',', '.', $clean) : str_replace(',', '', $clean);
    } elseif ($lastDot !== false) {
        $decimals = strlen($clean) - $lastDot - 1;
        if ($decimals > 2) $clean = str_replace('.', '', $clean);
    }

    $minor = (int) round(((float) $clean) * 100);
    return $negative ? -$minor : $minor;
}

function v2_amount_minor_from_payload(array $payload): int {
    if (array_key_exists('amount_minor', $payload)) return v2_minor_from_value($payload['amount_minor']);
    if (array_key_exists('minor', $payload)) return v2_minor_from_value($payload['minor']);
    return v2_major_to_minor($payload['amount'] ?? 0);
}

function v2_minor_to_amount(int $minor): float {
    return round($minor / 100, 2);
}

function v2_find_index(array $items, string $id): ?int {
    foreach ($items as $index => $item) {
        if (is_array($item) && (string) ($item['id'] ?? '') === $id) return $index;
    }
    return null;
}

function v2_find_item(array $items, string $id): ?array {
    $index = v2_find_index($items, $id);
    return $index === null ? null : $items[$index];
}

function v2_active_sessions(array $state): array {
    return array_values(array_filter($state['sessions'], fn($session) => ($session['status'] ?? '') === 'active'));
}

function v2_first_active_session_id(array $state): string {
    $active = v2_active_sessions($state);
    return (string) ($active[0]['id'] ?? '');
}

function v2_first_active_participant_id(array $state): string {
    foreach ($state['participants'] as $participant) {
        if (!empty($participant['active'])) return (string) $participant['id'];
    }
    return '';
}

function v2_selected_session_id(array $state): string {
    $candidates = [
        (string) ($_SESSION['captain_fin_v2_session_id'] ?? ''),
        (string) ($state['selected_session_id'] ?? ''),
        (string) ($state['preferences']['selected_session_id'] ?? ''),
    ];
    foreach ($candidates as $candidate) {
        if ($candidate === '') continue;
        $session = v2_find_item($state['sessions'], $candidate);
        if ($session && ($session['status'] ?? '') === 'active') return $candidate;
    }
    return v2_first_active_session_id($state);
}

function v2_selected_participant_id(array $state): string {
    $candidates = [
        (string) ($_SESSION['captain_fin_v2_participant_id'] ?? ''),
        (string) ($state['selected_participant_id'] ?? ''),
        (string) ($state['preferences']['selected_participant_id'] ?? ''),
    ];
    foreach ($candidates as $candidate) {
        if ($candidate === '') continue;
        $participant = v2_find_item($state['participants'], $candidate);
        if ($participant && !empty($participant['active'])) return $candidate;
    }
    return v2_first_active_participant_id($state);
}

function v2_selected_mode(array $state): string {
    $mode = (string) ($_SESSION['captain_fin_v2_mode'] ?? $state['selected_mode'] ?? $state['preferences']['mode'] ?? 'owner');
    return in_array($mode, ['owner', 'participant'], true) ? $mode : 'owner';
}

function v2_require_mode(array $state, string $required): void {
    $mode = v2_selected_mode($state);
    if ($mode !== $required) {
        fail($required === 'owner' ? 'Нужен режим владельца' : 'Нужен режим участника', 403);
    }
}

function v2_require_active_session(array $state, string $sessionId): array {
    $session = v2_find_item($state['sessions'], $sessionId);
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная сессия не найдена или уже закрыта', 404);
    }
    return $session;
}

function v2_find_issue_by_client_operation(array $state, string $clientOperationId): ?array {
    if ($clientOperationId === '') return null;
    foreach ($state['issues'] as $issue) {
        if ((string) ($issue['client_operation_id'] ?? '') === $clientOperationId) return $issue;
    }
    return null;
}

function v2_ensure_bootstrap(array $state, array $payload, bool &$changed): array {
    $changed = false;
    $now = v2_now();
    $currency = strtoupper(substr(trim((string) ($payload['currency'] ?? $state['currency'] ?? V2_DEFAULT_CURRENCY)) ?: V2_DEFAULT_CURRENCY, 0, 8));
    $state['currency'] = $currency;
    $state['admin']['currency'] = $currency;

    if (count($state['groups']) === 0) {
        $state['groups'][] = [
            'id' => 'group-default',
            'name' => trim((string) ($payload['group_name'] ?? $payload['group']['name'] ?? 'Работа')) ?: 'Работа',
            'active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $changed = true;
    }
    $groupId = (string) ($state['groups'][0]['id'] ?? 'group-default');

    $activeParticipants = array_values(array_filter($state['participants'], fn($participant) => !empty($participant['active'])));
    if (count($state['participants']) === 0 || count($activeParticipants) === 0) {
        $rawParticipants = isset($payload['participants']) && is_array($payload['participants']) ? $payload['participants'] : [];
        if (count($rawParticipants) === 0) {
            $rawParticipants = [
                ['id' => 'participant-1', 'name' => 'Сотрудник 1'],
                ['id' => 'participant-2', 'name' => 'Сотрудник 2'],
            ];
        }
        foreach ($rawParticipants as $index => $participant) {
            if (!is_array($participant)) continue;
            $state['participants'][] = [
                'id' => v2_clean_id((string) ($participant['id'] ?? ('participant-' . ($index + 1))), 'participant'),
                'group_id' => $groupId,
                'name' => trim((string) ($participant['name'] ?? ('Сотрудник ' . ($index + 1)))) ?: ('Сотрудник ' . ($index + 1)),
                'role' => 'participant',
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $changed = true;
    }

    if (v2_first_active_session_id($state) === '') {
        $sessionId = v2_new_id('session');
        $state['sessions'][] = [
            'id' => $sessionId,
            'group_id' => $groupId,
            'title' => trim((string) ($payload['session_title'] ?? $payload['title'] ?? ('Сессия ' . gmdate('Y-m-d')))) ?: ('Сессия ' . gmdate('Y-m-d')),
            'status' => 'active',
            'opened_at' => $now,
            'closed_at' => '',
            'final_report_id' => '',
            'archive_path' => '',
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $state['selected_session_id'] = $sessionId;
        $state['preferences']['selected_session_id'] = $sessionId;
        $changed = true;
    }

    if ($state['selected_participant_id'] === '') {
        $state['selected_participant_id'] = v2_first_active_participant_id($state);
        $state['preferences']['selected_participant_id'] = $state['selected_participant_id'];
        $changed = true;
    }
    return v2_normalize_state($state);
}

function v2_report_path(string $sessionId, string $participantId): string {
    return V2_LIVE_REPORTS_DIR . '/' . v2_require_id($sessionId, 'session_id') . '__' . v2_require_id($participantId, 'participant_id') . '.json';
}

function v2_default_report(string $sessionId, string $participantId): array {
    $now = v2_now();
    return [
        'schema' => 2,
        'id' => 'live-' . $sessionId . '-' . $participantId,
        'session_id' => $sessionId,
        'participant_id' => $participantId,
        'report_date' => gmdate('Y-m-d'),
        'notes' => '',
        'entries' => [],
        'computed' => v2_compute_entries([], false),
        'created_at' => $now,
        'updated_at' => $now,
        'app_version' => APP_VERSION,
    ];
}

function v2_load_report(string $sessionId, string $participantId): array {
    $path = v2_report_path($sessionId, $participantId);
    $data = v2_read_json($path);
    if (!is_array($data)) return v2_default_report($sessionId, $participantId);
    return v2_normalize_report_data($data, $sessionId, $participantId);
}

function v2_store_report(array $report): array {
    $sessionId = v2_require_id($report['session_id'] ?? '', 'session_id');
    $participantId = v2_require_id($report['participant_id'] ?? '', 'participant_id');
    $report = v2_normalize_report_data($report, $sessionId, $participantId);
    $report['updated_at'] = v2_now();
    $report['computed'] = v2_compute_entries($report['entries'], false);
    v2_write_json_atomic(v2_report_path($sessionId, $participantId), $report);
    return $report;
}

function v2_normalize_report_data(array $data, string $sessionId, string $participantId): array {
    $now = v2_now();
    $entries = [];
    foreach (($data['entries'] ?? []) as $entry) {
        if (!is_array($entry)) continue;
        $entries[] = v2_normalize_entry($entry, (string) ($data['report_date'] ?? gmdate('Y-m-d')));
    }
    $report = [
        'schema' => 2,
        'id' => (string) ($data['id'] ?? ('live-' . $sessionId . '-' . $participantId)),
        'session_id' => $sessionId,
        'participant_id' => $participantId,
        'report_date' => (string) ($data['report_date'] ?? gmdate('Y-m-d')),
        'notes' => (string) ($data['notes'] ?? ''),
        'entries' => $entries,
        'created_at' => (string) ($data['created_at'] ?? $now),
        'updated_at' => (string) ($data['updated_at'] ?? $now),
        'app_version' => APP_VERSION,
    ];
    $report['computed'] = v2_compute_entries($entries, false);
    return $report;
}

function v2_save_live_report(array $state, array $payload): array {
    $reportPayload = isset($payload['report']) && is_array($payload['report']) ? $payload['report'] : $payload;
    $sessionId = v2_require_id($reportPayload['session_id'] ?? $payload['session_id'] ?? v2_selected_session_id($state), 'session_id');
    $participantId = v2_require_id($reportPayload['participant_id'] ?? $payload['participant_id'] ?? v2_selected_participant_id($state), 'participant_id');
    $session = v2_find_item($state['sessions'], $sessionId);
    if (!$session || ($session['status'] ?? '') !== 'active') fail('Активная сессия не найдена', 404);
    if ($participantId !== V2_ADMIN_ID) {
        $participant = v2_find_item($state['participants'], $participantId);
        if (!$participant || empty($participant['active'])) fail('Участник не найден', 404);
    }

    $existing = v2_load_report($sessionId, $participantId);
    $entriesProvided = array_key_exists('entries', $reportPayload) && is_array($reportPayload['entries']);
    $entries = $entriesProvided ? [] : $existing['entries'];
    if ($entriesProvided) {
        foreach ($reportPayload['entries'] as $entry) {
            if (is_array($entry)) $entries[] = v2_normalize_entry($entry, (string) ($reportPayload['report_date'] ?? gmdate('Y-m-d')));
        }
        $entries = v2_merge_system_entries($entries, $existing['entries']);
    }

    $report = [
        'schema' => 2,
        'id' => (string) ($existing['id'] ?? ('live-' . $sessionId . '-' . $participantId)),
        'session_id' => $sessionId,
        'participant_id' => $participantId,
        'report_date' => (string) ($reportPayload['report_date'] ?? $reportPayload['date'] ?? $existing['report_date'] ?? gmdate('Y-m-d')),
        'notes' => (string) ($reportPayload['notes'] ?? $existing['notes'] ?? ''),
        'entries' => $entries,
        'created_at' => (string) ($existing['created_at'] ?? v2_now()),
        'updated_at' => v2_now(),
        'app_version' => APP_VERSION,
    ];
    $report['computed'] = v2_compute_entries($entries, false);
    return v2_store_report($report);
}

function v2_normalize_entry(array $entry, string $fallbackDate): array {
    $type = strtolower(trim((string) ($entry['type'] ?? 'expense')));
    $aliases = [
        'in' => 'income',
        'income' => 'income',
        'expense' => 'expense',
        'out' => 'expense',
        'upcoming' => 'upcoming',
        'future' => 'upcoming',
        'transfer-in' => 'transfer_in',
        'transfer_in' => 'transfer_in',
        'transferin' => 'transfer_in',
        'transfer-out' => 'transfer_out',
        'transfer_out' => 'transfer_out',
        'transferout' => 'transfer_out',
    ];
    $type = $aliases[$type] ?? 'expense';
    $amountMinor = abs(v2_amount_minor_from_payload($entry));
    $now = v2_now();
    $normalized = [
        'id' => v2_clean_id((string) ($entry['id'] ?? ''), 'entry'),
        'type' => $type,
        'description' => trim((string) ($entry['description'] ?? $entry['title'] ?? '')),
        'amount_minor' => $amountMinor,
        'amount' => v2_minor_to_amount($amountMinor),
        'entry_date' => (string) ($entry['entry_date'] ?? $entry['date'] ?? $fallbackDate),
        'source' => trim((string) ($entry['source'] ?? 'user')) ?: 'user',
        'created_at' => (string) ($entry['created_at'] ?? $now),
        'updated_at' => (string) ($entry['updated_at'] ?? $now),
    ];
    foreach (['category', 'note', 'issue_id'] as $key) {
        if (array_key_exists($key, $entry)) $normalized[$key] = (string) $entry[$key];
    }
    return $normalized;
}

function v2_merge_system_entries(array $incoming, array $existing): array {
    $ids = [];
    foreach ($incoming as $entry) {
        $ids[(string) ($entry['id'] ?? '')] = true;
    }
    foreach ($existing as $entry) {
        if (!is_array($entry)) continue;
        $isIssueEntry = (string) ($entry['source'] ?? '') === 'issue' || (string) ($entry['issue_id'] ?? '') !== '';
        if (!$isIssueEntry || isset($ids[(string) ($entry['id'] ?? '')])) continue;
        $incoming[] = v2_normalize_entry($entry, (string) ($entry['entry_date'] ?? gmdate('Y-m-d')));
    }
    return $incoming;
}

function v2_compute_entries(array $entries, bool $common): array {
    $income = $expense = $upcoming = $transferIn = $transferOut = 0;
    foreach ($entries as $entry) {
        if (!is_array($entry)) continue;
        $amount = abs((int) ($entry['amount_minor'] ?? 0));
        match ((string) ($entry['type'] ?? 'expense')) {
            'income' => $income += $amount,
            'expense' => $expense += $amount,
            'upcoming' => $upcoming += $amount,
            'transfer_in' => $transferIn += $amount,
            'transfer_out' => $transferOut += $amount,
            default => null,
        };
    }
    $transferNet = $transferIn - $transferOut;
    $current = $income - $expense + ($common ? 0 : $transferNet);
    $future = $current - $upcoming;
    return v2_summary_payload([
        'income_minor' => $income,
        'expense_minor' => $expense,
        'upcoming_minor' => $upcoming,
        'transfer_in_minor' => $transferIn,
        'transfer_out_minor' => $transferOut,
        'transfer_net_minor' => $transferNet,
        'current_minor' => $current,
        'future_minor' => $future,
    ]);
}

function v2_summary_payload(array $summary): array {
    foreach (['income', 'expense', 'upcoming', 'transfer_in', 'transfer_out', 'transfer_net', 'current', 'future', 'pending_in', 'pending_out'] as $key) {
        $minorKey = $key . '_minor';
        if (array_key_exists($minorKey, $summary)) $summary[$key] = v2_minor_to_amount((int) $summary[$minorKey]);
    }
    return $summary;
}

function v2_common_summary(array $reports): array {
    $entries = [];
    foreach ($reports as $report) {
        foreach (($report['entries'] ?? []) as $entry) {
            if (is_array($entry)) $entries[] = $entry;
        }
    }
    return v2_compute_entries($entries, true);
}

function v2_issues_for_session(array $state, string $sessionId, ?string $participantId = null): array {
    $issues = array_values(array_filter($state['issues'], function ($issue) use ($sessionId, $participantId) {
        if (($issue['session_id'] ?? '') !== $sessionId) return false;
        if ($participantId !== null && ($issue['participant_id'] ?? '') !== $participantId) return false;
        return true;
    }));
    usort($issues, fn($a, $b) => strcmp((string) ($b['issued_at'] ?? ''), (string) ($a['issued_at'] ?? '')));
    return $issues;
}

function v2_pending_totals(array $issues, string $participantId): array {
    $pendingIn = $pendingOut = 0;
    foreach ($issues as $issue) {
        if (($issue['status'] ?? '') !== 'pending') continue;
        $amount = (int) ($issue['amount_minor'] ?? 0);
        if ($participantId === V2_ADMIN_ID) $pendingOut += $amount;
        if (($issue['participant_id'] ?? '') === $participantId) $pendingIn += $amount;
    }
    return ['pending_in_minor' => $pendingIn, 'pending_out_minor' => $pendingOut];
}

function v2_card_payload(array $profile, array $report, array $issues): array {
    $participantId = (string) ($profile['id'] ?? '');
    $pending = v2_pending_totals($issues, $participantId);
    $balance = $report['computed'] ?? v2_compute_entries([], false);
    $balance['pending_in_minor'] = $pending['pending_in_minor'];
    $balance['pending_out_minor'] = $pending['pending_out_minor'];
    $balance = v2_summary_payload($balance);
    return [
        'id' => $participantId,
        'name' => (string) ($profile['name'] ?? $participantId),
        'role' => (string) ($profile['role'] ?? 'participant'),
        'active' => !array_key_exists('active', $profile) || !empty($profile['active']),
        'report' => $report,
        'balance' => $balance,
        'issue_statuses' => $participantId === V2_ADMIN_ID ? $issues : v2_issues_for_participant($issues, $participantId),
    ];
}

function v2_participant_public_admin_card(array $adminCard, array $participantIssues): array {
    $adminCard['issue_statuses'] = $participantIssues;
    $adminCard['report'] = [];
    $adminCard['balance'] = [];
    return $adminCard;
}

function v2_issues_for_participant(array $issues, string $participantId): array {
    return array_values(array_filter($issues, fn($issue) => ($issue['participant_id'] ?? '') === $participantId));
}

function v2_state_response(array $state): array {
    $state = v2_normalize_state($state);
    $activeSessions = v2_active_sessions($state);
    $selectedSessionId = v2_selected_session_id($state);
    $selectedParticipantId = v2_selected_participant_id($state);
    $selectedMode = v2_selected_mode($state);
    $selectedSession = $selectedSessionId !== '' ? v2_find_item($state['sessions'], $selectedSessionId) : null;
    $selectedGroupId = (string) ($selectedSession['group_id'] ?? ($state['groups'][0]['id'] ?? ''));
    $sessionIssues = $selectedSessionId !== '' ? v2_issues_for_session($state, $selectedSessionId) : [];
    $visibleIssues = $selectedMode === 'participant'
        ? v2_issues_for_participant($sessionIssues, $selectedParticipantId)
        : $sessionIssues;

    $adminReport = $selectedSessionId !== '' ? v2_load_report($selectedSessionId, V2_ADMIN_ID) : v2_default_report('', V2_ADMIN_ID);
    $adminCard = v2_card_payload($state['admin'], $adminReport, $visibleIssues);
    $participantCards = [];
    $liveReports = [V2_ADMIN_ID => $adminReport];
    foreach ($state['participants'] as $participant) {
        if (empty($participant['active'])) continue;
        if ($selectedGroupId !== '' && ($participant['group_id'] ?? '') !== $selectedGroupId) continue;
        if ($selectedMode === 'participant' && (string) $participant['id'] !== $selectedParticipantId) continue;
        $participantId = (string) $participant['id'];
        $report = $selectedSessionId !== '' ? v2_load_report($selectedSessionId, $participantId) : v2_default_report('', $participantId);
        $liveReports[$participantId] = $report;
        $participantCards[] = v2_card_payload($participant, $report, $visibleIssues);
    }
    if ($selectedMode === 'participant') {
        $adminCard = v2_participant_public_admin_card($adminCard, $visibleIssues);
        $liveReports = array_filter($liveReports, fn($key) => $key === V2_ADMIN_ID || $key === $selectedParticipantId, ARRAY_FILTER_USE_KEY);
    }

    $commonSummary = v2_common_summary(array_values($liveReports));
    $participantBalances = [];
    foreach ($participantCards as $card) {
        $participantBalances[$card['id']] = $card['balance'];
    }

    $activeGroup = null;
    foreach ($state['groups'] as $group) {
        if (($group['id'] ?? '') !== $selectedGroupId) continue;
        $activeGroup = $group;
        break;
    }
    if (!$activeGroup && isset($state['groups'][0])) $activeGroup = $state['groups'][0];
    if ($activeGroup) {
        $activeGroup['admin'] = $adminCard;
        $activeGroup['participants'] = $participantCards;
        $activeGroup['currency'] = $state['currency'];
    }

    return [
        'schema' => 2,
        'version' => APP_VERSION,
        'storage' => 'storage/v2',
        'viewer' => [
            'mode' => $selectedMode,
            'selected_session_id' => $selectedSessionId,
            'selected_participant_id' => $selectedParticipantId,
        ],
        'selected_mode' => $selectedMode,
        'selected_session_id' => $selectedSessionId,
        'selected_participant_id' => $selectedParticipantId,
        'selected_group_id' => $selectedGroupId,
        'currency' => $state['currency'],
        'active_sessions' => $activeSessions,
        'sessions' => $state['sessions'],
        'active_group' => $activeGroup,
        'groups' => $state['groups'],
        'admin_card' => $adminCard,
        'participants_cards' => $participantCards,
        'balances' => [
            'currency' => $state['currency'],
            'selected_session_id' => $selectedSessionId,
            'common' => $commonSummary,
            'admin' => $adminCard['balance'],
            'participants' => $participantBalances,
        ],
        'issue_statuses' => $visibleIssues,
        'live_reports' => $liveReports,
        'updated_at' => $state['updated_at'],
    ];
}

function v2_handle_bootstrap(array $payload): array {
    $state = v2_load_state();
    $changed = false;
    $state = v2_ensure_bootstrap($state, $payload, $changed);
    if ($changed) {
        $state = v2_save_state($state, 'v2_bootstrap', ['changed' => true]);
    }
    $_SESSION['captain_fin_v2_mode'] = v2_selected_mode($state);
    $_SESSION['captain_fin_v2_session_id'] = v2_selected_session_id($state);
    $_SESSION['captain_fin_v2_participant_id'] = v2_selected_participant_id($state);
    return ['bootstrapped' => $changed] + v2_state_response($state);
}

function v2_handle_state(): array {
    $state = v2_load_state();
    $changed = false;
    $state = v2_ensure_bootstrap($state, [], $changed);
    if ($changed) {
        $state = v2_save_state($state, 'v2_bootstrap_from_state', ['changed' => true]);
    }
    $_SESSION['captain_fin_v2_mode'] = v2_selected_mode($state);
    $_SESSION['captain_fin_v2_session_id'] = v2_selected_session_id($state);
    $_SESSION['captain_fin_v2_participant_id'] = v2_selected_participant_id($state);
    return ['bootstrapped' => $changed] + v2_state_response($state);
}

function v2_handle_save_report(array $payload): array {
    $state = v2_load_state();
    $reportPayload = isset($payload['report']) && is_array($payload['report']) ? $payload['report'] : $payload;
    $sessionId = v2_require_id($reportPayload['session_id'] ?? $payload['session_id'] ?? v2_selected_session_id($state), 'session_id');
    v2_require_active_session($state, $sessionId);
    $participantId = v2_require_id($reportPayload['participant_id'] ?? $payload['participant_id'] ?? v2_selected_participant_id($state), 'participant_id');
    if (v2_selected_mode($state) === 'participant' && $participantId !== v2_selected_participant_id($state)) {
        fail('Участник может менять только свой отчет', 403);
    }
    $report = v2_save_live_report($state, $payload);
    v2_audit('v2_save_report', [
        'session_id' => $report['session_id'],
        'participant_id' => $report['participant_id'],
        'entry_count' => count($report['entries']),
    ]);
    return ['saved' => true, 'report' => $report, 'state' => v2_state_response($state)];
}

function v2_handle_issue_money(array $payload): array {
    $state = v2_load_state();
    v2_require_mode($state, 'owner');
    $sessionId = v2_require_id($payload['session_id'] ?? v2_selected_session_id($state), 'session_id');
    $participantId = v2_require_id($payload['participant_id'] ?? v2_selected_participant_id($state), 'participant_id');
    v2_require_active_session($state, $sessionId);
    $participant = v2_find_item($state['participants'], $participantId);
    if (!$participant || empty($participant['active'])) fail('Участник не найден', 404);
    $amountMinor = abs(v2_amount_minor_from_payload($payload));
    if ($amountMinor <= 0) fail('Сумма должна быть больше нуля', 400);
    $clientOperationId = trim((string) ($payload['client_operation_id'] ?? $payload['operation_id'] ?? ''));
    $existingIssue = v2_find_issue_by_client_operation($state, $clientOperationId);
    if ($existingIssue) {
        return ['issued' => true, 'idempotent' => true, 'issue' => $existingIssue, 'state' => v2_state_response($state)];
    }

    $issue = [
        'id' => v2_new_id('issue'),
        'session_id' => $sessionId,
        'participant_id' => $participantId,
        'amount_minor' => $amountMinor,
        'amount' => v2_minor_to_amount($amountMinor),
        'currency' => strtoupper(substr(trim((string) ($payload['currency'] ?? $state['currency'])) ?: V2_DEFAULT_CURRENCY, 0, 8)),
        'status' => 'pending',
        'description' => trim((string) ($payload['description'] ?? $payload['note'] ?? '')),
        'client_operation_id' => $clientOperationId,
        'issued_by' => V2_ADMIN_ID,
        'confirmed_by' => '',
        'issued_at' => v2_now(),
        'confirmed_at' => '',
        'updated_at' => v2_now(),
    ];
    $state['issues'][] = $issue;
    $state = v2_save_state($state, 'v2_issue_money', [
        'issue_id' => $issue['id'],
        'session_id' => $sessionId,
        'participant_id' => $participantId,
        'amount_minor' => $amountMinor,
    ]);
    return ['issued' => true, 'issue' => $issue, 'state' => v2_state_response($state)];
}

function v2_handle_confirm_issue(array $payload): array {
    $state = v2_load_state();
    v2_require_mode($state, 'participant');
    $issueIndex = null;
    if (!empty($payload['issue_id'])) {
        $issueIndex = v2_find_index($state['issues'], v2_require_id($payload['issue_id'], 'issue_id'));
    } else {
        $sessionId = v2_require_id($payload['session_id'] ?? v2_selected_session_id($state), 'session_id');
        $participantId = v2_require_id($payload['participant_id'] ?? v2_selected_participant_id($state), 'participant_id');
        foreach ($state['issues'] as $index => $issue) {
            if (($issue['session_id'] ?? '') === $sessionId && ($issue['participant_id'] ?? '') === $participantId && ($issue['status'] ?? '') === 'pending') {
                $issueIndex = $index;
                break;
            }
        }
    }
    if ($issueIndex === null) fail('Выдача не найдена', 404);

    $issue = $state['issues'][$issueIndex];
    $selectedParticipantId = v2_selected_participant_id($state);
    if ((string) $issue['participant_id'] !== $selectedParticipantId) {
        fail('Можно подписать только свою выдачу', 403);
    }
    if (!empty($payload['participant_id']) && (string) $issue['participant_id'] !== v2_require_id($payload['participant_id'], 'participant_id')) {
        fail('Выдача относится к другому участнику', 403);
    }
    v2_require_active_session($state, (string) $issue['session_id']);
    $participant = v2_find_item($state['participants'], (string) $issue['participant_id']);
    if (!$participant) fail('Участник не найден', 404);

    $confirmedAt = (string) (($issue['confirmed_at'] ?? '') ?: v2_now());
    $state['issues'][$issueIndex]['status'] = 'confirmed';
    $state['issues'][$issueIndex]['confirmed_by'] = (string) $issue['participant_id'];
    $state['issues'][$issueIndex]['confirmed_at'] = $confirmedAt;
    $state['issues'][$issueIndex]['updated_at'] = v2_now();
    $issue = v2_normalize_issue($state['issues'][$issueIndex]);

    $adminReport = v2_upsert_issue_transfer(v2_load_report($issue['session_id'], V2_ADMIN_ID), $issue, 'out', (string) $participant['name']);
    $participantReport = v2_upsert_issue_transfer(v2_load_report($issue['session_id'], $issue['participant_id']), $issue, 'in', (string) ($state['admin']['name'] ?? 'Admin'));
    $adminReport = v2_store_report($adminReport);
    $participantReport = v2_store_report($participantReport);
    $state = v2_save_state($state, 'v2_confirm_issue', [
        'issue_id' => $issue['id'],
        'session_id' => $issue['session_id'],
        'participant_id' => $issue['participant_id'],
        'amount_minor' => $issue['amount_minor'],
    ]);
    return [
        'confirmed' => true,
        'issue' => $issue,
        'reports' => [
            V2_ADMIN_ID => $adminReport,
            $issue['participant_id'] => $participantReport,
        ],
        'state' => v2_state_response($state),
    ];
}

function v2_upsert_issue_transfer(array $report, array $issue, string $direction, string $counterpartyName): array {
    $isOut = $direction === 'out';
    $entryId = 'transfer-' . $issue['id'] . '-' . ($isOut ? 'out' : 'in');
    $description = trim((string) ($issue['description'] ?? ''));
    $description = $description !== '' ? $description : ($isOut ? ('Выдача для ' . $counterpartyName) : ('Выдача от ' . $counterpartyName));
    $entry = [
        'id' => $entryId,
        'type' => $isOut ? 'transfer_out' : 'transfer_in',
        'description' => $description,
        'amount_minor' => (int) $issue['amount_minor'],
        'amount' => v2_minor_to_amount((int) $issue['amount_minor']),
        'entry_date' => substr((string) ($issue['confirmed_at'] ?: v2_now()), 0, 10),
        'source' => 'issue',
        'issue_id' => (string) $issue['id'],
        'created_at' => (string) ($issue['issued_at'] ?? v2_now()),
        'updated_at' => v2_now(),
    ];
    $replaced = false;
    foreach ($report['entries'] as $index => $existing) {
        if (($existing['id'] ?? '') !== $entryId) continue;
        $report['entries'][$index] = $entry;
        $replaced = true;
        break;
    }
    if (!$replaced) $report['entries'][] = $entry;
    $report['computed'] = v2_compute_entries($report['entries'], false);
    return $report;
}

function v2_reports_for_session(array $state, string $sessionId): array {
    $reports = [];
    $ids = [V2_ADMIN_ID => true];
    foreach ($state['participants'] as $participant) {
        if (!empty($participant['active'])) $ids[(string) $participant['id']] = true;
    }
    foreach (array_keys($ids) as $participantId) {
        $reports[$participantId] = v2_load_report($sessionId, $participantId);
    }
    $prefix = V2_LIVE_REPORTS_DIR . '/' . $sessionId . '__';
    foreach (glob($prefix . '*.json') ?: [] as $path) {
        $data = v2_read_json($path);
        if (!is_array($data)) continue;
        $participantId = (string) ($data['participant_id'] ?? '');
        if ($participantId === '') continue;
        $reports[$participantId] = v2_normalize_report_data($data, $sessionId, $participantId);
    }
    return array_values($reports);
}

function v2_handle_finalize_session(array $payload): array {
    $state = v2_load_state();
    v2_require_mode($state, 'owner');
    $sessionId = v2_require_id($payload['session_id'] ?? v2_selected_session_id($state), 'session_id');
    $sessionIndex = v2_find_index($state['sessions'], $sessionId);
    if ($sessionIndex === null) fail('Сессия не найдена', 404);
    $session = $state['sessions'][$sessionIndex];
    if (($session['status'] ?? '') !== 'active' && empty($session['archive_path'])) {
        fail('Сессия уже закрыта', 409);
    }
    $pendingIssues = array_values(array_filter(
        v2_issues_for_session($state, $sessionId),
        fn($issue) => ($issue['status'] ?? '') === 'pending'
    ));
    if ($pendingIssues) {
        fail('Нельзя закрыть сессию: есть неподписанные выдачи', 409);
    }
    $archivePath = V2_ARCHIVES_DIR . '/' . $sessionId . '.json';
    $archive = v2_read_json($archivePath);
    $createdArchive = false;

    if (!$archive) {
        $reports = v2_reports_for_session($state, $sessionId);
        $issues = v2_issues_for_session($state, $sessionId);
        $participantSummaries = [];
        foreach ($reports as $report) {
            $participantSummaries[(string) ($report['participant_id'] ?? '')] = $report['computed'] ?? v2_compute_entries([], false);
        }
        $archive = [
            'schema' => 2,
            'immutable' => true,
            'id' => 'common-' . $sessionId,
            'session_id' => $sessionId,
            'session' => $session,
            'group' => v2_find_item($state['groups'], (string) ($session['group_id'] ?? '')),
            'admin' => $state['admin'],
            'participants' => $state['participants'],
            'reports' => $reports,
            'issues' => $issues,
            'summary' => v2_common_summary($reports),
            'participant_summaries' => $participantSummaries,
            'finalized_at' => v2_now(),
            'app_version' => APP_VERSION,
        ];
        v2_write_json_atomic($archivePath, $archive);
        $createdArchive = true;
    }

    $state['sessions'][$sessionIndex]['status'] = 'closed';
    $state['sessions'][$sessionIndex]['closed_at'] = (string) (($state['sessions'][$sessionIndex]['closed_at'] ?? '') ?: ($archive['finalized_at'] ?? v2_now()));
    $state['sessions'][$sessionIndex]['final_report_id'] = (string) ($archive['id'] ?? ('common-' . $sessionId));
    $state['sessions'][$sessionIndex]['archive_path'] = 'storage/v2/archives/' . $sessionId . '.json';
    $state['sessions'][$sessionIndex]['updated_at'] = v2_now();
    if (($state['selected_session_id'] ?? '') === $sessionId) {
        $state['selected_session_id'] = v2_first_active_session_id($state);
        $state['preferences']['selected_session_id'] = $state['selected_session_id'];
    }
    $state = v2_save_state($state, 'v2_finalize_session', [
        'session_id' => $sessionId,
        'archive_id' => (string) ($archive['id'] ?? ''),
        'created_archive' => $createdArchive,
    ]);

    return ['finalized' => true, 'created_archive' => $createdArchive, 'archive' => $archive, 'state' => v2_state_response($state)];
}

function v2_handle_switch_mode(array $payload): array {
    $state = v2_load_state();
    $mode = (string) ($payload['mode'] ?? $payload['selected_mode'] ?? v2_selected_mode($state));
    if (!in_array($mode, ['owner', 'participant'], true)) fail('Некорректный режим', 400);
    $sessionId = (string) ($payload['session_id'] ?? $payload['selected_session_id'] ?? v2_selected_session_id($state));
    if ($sessionId !== '') {
        $sessionId = v2_require_id($sessionId, 'session_id');
        $session = v2_find_item($state['sessions'], $sessionId);
        if (!$session || ($session['status'] ?? '') !== 'active') fail('Активная сессия не найдена', 404);
    }
    $participantId = (string) ($payload['participant_id'] ?? $payload['selected_participant_id'] ?? v2_selected_participant_id($state));
    if ($participantId !== '') {
        $participantId = v2_require_id($participantId, 'participant_id');
        $participant = v2_find_item($state['participants'], $participantId);
        if (!$participant || empty($participant['active'])) fail('Участник не найден', 404);
    }

    $state['selected_mode'] = $mode;
    $state['selected_session_id'] = $sessionId;
    $state['selected_participant_id'] = $participantId;
    $state['preferences']['mode'] = $mode;
    $state['preferences']['selected_session_id'] = $sessionId;
    $state['preferences']['selected_participant_id'] = $participantId;
    $_SESSION['captain_fin_v2_mode'] = $mode;
    $_SESSION['captain_fin_v2_session_id'] = $sessionId;
    $_SESSION['captain_fin_v2_participant_id'] = $participantId;
    $state = v2_save_state($state, 'v2_switch_mode', [
        'mode' => $mode,
        'session_id' => $sessionId,
        'participant_id' => $participantId,
    ]);
    return ['switched' => true] + v2_state_response($state);
}

$action = (string) ($_GET['action'] ?? 'me');
ensure_dirs();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    cors_headers();
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    exit;
}

if ($action === 'login') {
    $payload = input_json();
    $auth = auth_request('/auth/login', 'POST', ['email' => $payload['email'] ?? '', 'password' => $payload['password'] ?? '']);
    if (($auth['status'] ?? 500) >= 400) fail($auth['data']['error']['message'] ?? 'Не удалось войти', 401);
    set_local_auth_cookie();
    respond(['authenticated' => true]);
}

if ($action === 'me') respond(['authenticated' => authenticated(), 'version' => APP_VERSION]);

require_auth();

if ($action === 'v2_bootstrap') respond(v2_handle_bootstrap(v2_request_data()));
if ($action === 'v2_state') respond(v2_handle_state());
if ($action === 'v2_save_report') respond(v2_handle_save_report(v2_request_data()));
if ($action === 'v2_issue_money') respond(v2_handle_issue_money(v2_request_data()));
if ($action === 'v2_confirm_issue') respond(v2_handle_confirm_issue(v2_request_data()));
if ($action === 'v2_finalize_session') respond(v2_handle_finalize_session(v2_request_data()));
if ($action === 'v2_switch_mode') respond(v2_handle_switch_mode(v2_request_data()));

if ($action === 'reports') respond(all_reports());
if ($action === 'archived') respond(archived_reports());
if ($action === 'report') {
    $report = find_report((string) ($_GET['id'] ?? ''));
    $report ? respond($report) : fail('Отчет не найден', 404);
}
if ($action === 'save') respond(save_report(input_json()));
if ($action === 'delete') {
    $deleted = delete_report((string) ($_GET['id'] ?? ''));
    if (!$deleted) fail('Отчет не найден', 404);
    respond(['archived' => true, 'id' => (string) ($_GET['id'] ?? '')]);
}
if ($action === 'restore') {
    $report = restore_report((string) ($_GET['id'] ?? ''));
    $report ? respond($report) : fail('Архивная запись не найдена', 404);
}
if ($action === 'upload') {
    respond(['attachments' => upload_attachment((string) ($_GET['id'] ?? ''))]);
}
if ($action === 'attachment') {
    $report = find_report((string) ($_GET['id'] ?? ''));
    if (!$report) fail('Отчет не найден', 404);
    $file = safe_file_name((string) ($_GET['file'] ?? ''));
    $path = year_dir(ATTACHMENTS_DIR, $report['report_date']) . '/' . basename($report['id']) . '/' . $file;
    if (!is_file($path)) fail('Вложение не найдено', 404);
    $disposition = strtolower(trim((string) ($_GET['disposition'] ?? 'attachment')));
    if (!in_array($disposition, ['inline', 'attachment'], true)) {
        $disposition = 'attachment';
    }
    header('Content-Type: ' . attachment_mime($path));
    header('Content-Disposition: ' . $disposition . '; filename="' . basename($path) . '"');
    header('Content-Length: ' . filesize($path));
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    readfile($path);
    exit;
}
if ($action === 'summary') {
    $from = trim((string) ($_GET['from'] ?? '')) ?: null;
    $to = trim((string) ($_GET['to'] ?? '')) ?: null;
    respond(summary_reports($from, $to));
}
if ($action === 'storage-info') {
    respond([
        'server_root' => STORAGE_DIR,
        'reports' => REPORTS_DIR . '/YYYY/*.json',
        'deleted_archive' => TRASH_DIR . '/YYYY/*.json',
        'attachments' => ATTACHMENTS_DIR . '/YYYY/report-id/*',
        'exports' => EXPORTS_DIR . '/YYYY/*.xlsx',
        'drive_folder_id' => DRIVE_FOLDER_ID,
        'drive_url' => 'https://drive.google.com/drive/folders/' . DRIVE_FOLDER_ID,
    ]);
}
if ($action === 'export') {
    $payload = input_json();
    $report = find_report((string) ($payload['id'] ?? ''));
    if (!$report) fail('Отчет не найден', 404);
    $path = make_xlsx($report);
    $file = basename(dirname($path)) . '/' . basename($path);
    respond(['path' => './storage/exports/' . $file, 'url' => 'api/?action=download&file=' . rawurlencode($file)]);
}
if ($action === 'download') {
    $file = (string) ($_GET['file'] ?? '');
    if (!preg_match('#^\d{4}/[A-Za-z0-9._-]+\.(xlsx|xls)$#', $file)) fail('Некорректный файл', 400);
    $path = EXPORTS_DIR . '/' . $file;
    if (!is_file($path)) fail('Файл не найден', 404);
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $type = $ext === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel';
    header('Content-Type: ' . $type);
    header('Content-Disposition: attachment; filename="' . basename($path) . '"');
    header('Content-Length: ' . filesize($path));
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    readfile($path);
    exit;
}
if ($action === 'export-json') respond(['version' => APP_VERSION, 'reports' => all_reports()]);

fail('Не найдено', 404);
