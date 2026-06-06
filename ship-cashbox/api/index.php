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

const APP_VERSION = '2026.06.07-ship-cashbox-personal-reports-scope-01';
const AUTH_BASE = 'https://brkovic.ltd/api';
const STORAGE_DIR = __DIR__ . '/../storage';
const SESSIONS_DIR = STORAGE_DIR . '/sessions';
const EXPORTS_DIR = STORAGE_DIR . '/exports';
const ATTACHMENTS_DIR = __DIR__ . '/../attachments';
const INDEX_FILE = STORAGE_DIR . '/index.json';
const AUTH_COOKIE = 'ship_cashbox_auth';
const MAIL_FROM_ADDRESS = 'brkovic@brkovic.ltd';
const MAIL_REPLY_TO = 'vetus.nauta@gmail.com';
const AUTH_REQUEST_TIMEOUT = 7;
const AUTH_CONNECT_TIMEOUT = 4;
const OCR_REQUEST_TIMEOUT = 16;
const OCR_MAX_DOWNLOAD_BYTES = 12582912;

function load_ship_cashbox_env_file(): void {
    $paths = array_values(array_filter([
        getenv('SHIP_CASHBOX_ENV_FILE') ?: '',
        STORAGE_DIR . '/.ship-cashbox.env',
    ]));
    foreach ($paths as $path) {
        if (!is_file($path) || !is_readable($path)) {
            continue;
        }
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim((string) $line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$name, $value] = array_map('trim', explode('=', $line, 2));
            if ($name === '' || !preg_match('/^[A-Z0-9_]+$/', $name)) {
                continue;
            }
            $value = trim($value, "\"'");
            if (getenv($name) === false) {
                putenv($name . '=' . $value);
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

load_ship_cashbox_env_file();

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
    foreach ([STORAGE_DIR, SESSIONS_DIR, EXPORTS_DIR, ATTACHMENTS_DIR] as $dir) {
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            fail('Не удалось подготовить хранилище', 500);
        }
    }
}

function command_path(string $command): string {
    if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $command)) {
        return '';
    }
    $output = [];
    $status = 1;
    @exec('command -v ' . escapeshellarg($command) . ' 2>/dev/null', $output, $status);
    $path = trim((string) ($output[0] ?? ''));
    return $status === 0 && $path !== '' ? $path : '';
}

function command_first_line(string $command): string {
    $output = [];
    $status = 1;
    @exec($command . ' 2>/dev/null', $output, $status);
    return $status === 0 ? trim((string) ($output[0] ?? '')) : '';
}

function scan_ocr_status(): array {
    $tesseract = command_path('tesseract');
    $pdftoppm = command_path('pdftoppm');
    $magick = command_path('magick');
    $convert = command_path('convert');
    $timeout = command_path('timeout');
    $available = $tesseract !== '';

    return [
        'available' => $available,
        'provider' => $available ? 'tesseract-server' : 'none',
        'mode' => $available ? 'server' : 'manual',
        'timeout_seconds' => OCR_REQUEST_TIMEOUT,
        'tools' => [
            'tesseract' => $tesseract !== '',
            'pdftoppm' => $pdftoppm !== '',
            'magick' => $magick !== '',
            'convert' => $convert !== '',
            'timeout' => $timeout !== '',
        ],
        'version' => $available ? command_first_line(escapeshellarg($tesseract) . ' --version') : '',
        'languages' => $available ? scan_ocr_languages($tesseract) : [],
    ];
}

function scan_ocr_extract(array $payload): array {
    $status = scan_ocr_status();
    if (!($status['available'] ?? false)) {
        return [
            'available' => false,
            'provider' => 'none',
            'text' => '',
            'lines' => [],
            'message' => 'OCR provider is not installed on this server.',
            'status' => $status,
        ];
    }

    $attachmentPath = trim((string) ($payload['attachment_path'] ?? ''));
    $amountOnly = !empty($payload['amount_only']);
    if ($attachmentPath === '') {
        return scan_ocr_unavailable($status, 'Attachment path is required for OCR.');
    }

    $workDir = scan_ocr_temp_dir();
    $sourcePath = $workDir . '/source';
    $ocrPath = $sourcePath;

    try {
        $localPath = attachment_storage_path($attachmentPath);
        if ($localPath !== '' && is_file($localPath)) {
            if (!copy($localPath, $sourcePath)) {
                throw new RuntimeException('Could not prepare local OCR source file.');
            }
        } else {
            if (is_local_request() && preg_match('#^/ship-cashbox/attachments/#', (string) (parse_url($attachmentPath, PHP_URL_PATH) ?: $attachmentPath))) {
                return scan_ocr_unavailable($status, 'Attachment file is not available locally for OCR.');
            }
            $url = scan_ocr_attachment_url($attachmentPath);
            if ($url === '') {
                return scan_ocr_unavailable($status, 'Attachment path is not allowed for OCR.');
            }
            scan_ocr_download($url, $sourcePath);
        }
        $mime = scan_ocr_mime($sourcePath, $attachmentPath);
        $isPdf = str_contains($mime, 'pdf') || preg_match('/\.pdf(?:$|\?)/i', $attachmentPath);
        if ($isPdf) {
            $ocrPath = scan_ocr_pdf_first_page($sourcePath, $workDir, $status, 220, 'page');
        }

        $tsv = scan_ocr_run_tesseract($ocrPath, true, $status, 6);
        $lines = scan_ocr_parse_tsv($tsv);
        $text = trim(implode("\n", array_map(static function (array $line): string {
            return (string) ($line['text'] ?? '');
        }, $lines)));

        if (!$amountOnly) {
            $fullText = scan_ocr_run_tesseract($ocrPath, false, $status, 6);
            if (!scan_ocr_text_has_date($fullText)) {
                $sparsePath = $isPdf ? scan_ocr_pdf_first_page($sourcePath, $workDir, $status, 360, 'page-hi') : $ocrPath;
                $sparseText = scan_ocr_run_tesseract($sparsePath, false, $status, 11);
                if (trim($sparseText) !== '') {
                    $fullText = trim($fullText . "\n" . $sparseText);
                }
                if (!scan_ocr_text_has_date($fullText)) {
                    $blockText = scan_ocr_run_tesseract($sparsePath, false, $status, 4);
                    if (trim($blockText) !== '') {
                        $fullText = trim($fullText . "\n" . $blockText);
                    }
                }
            }
            if ($isPdf && !scan_ocr_text_has_date($fullText)) {
                $dateRegionText = scan_ocr_pdf_date_region_text($sourcePath, $workDir, $status, $lines);
                if (scan_ocr_text_has_date($dateRegionText)) {
                    $fullText = trim($fullText . "\n" . $dateRegionText);
                }
            }
            $text = trim($text . "\n" . $fullText);
        }

        return [
            'available' => true,
            'provider' => $status['provider'],
            'text' => trim($text),
            'lines' => $lines,
            'message' => trim($text) !== '' || count($lines) > 0 ? 'OCR extraction completed.' : 'OCR returned no text.',
            'status' => $status,
        ];
    } catch (Throwable $error) {
        return scan_ocr_unavailable($status, $error->getMessage());
    } finally {
        scan_ocr_remove_dir($workDir);
    }
}

function scan_ocr_unavailable(array $status, string $message): array {
    return [
        'available' => false,
        'provider' => (string) ($status['provider'] ?? 'none'),
        'text' => '',
        'lines' => [],
        'message' => $message,
        'status' => $status,
    ];
}

function scan_ocr_languages(string $tesseract): array {
    $output = [];
    $status = 1;
    @exec(escapeshellarg($tesseract) . ' --list-langs 2>/dev/null', $output, $status);
    if ($status !== 0) {
        return [];
    }
    $langs = [];
    foreach ($output as $line) {
        $line = trim((string) $line);
        if ($line === '' || str_contains(strtolower($line), 'list of available languages')) {
            continue;
        }
        if (preg_match('/^[a-zA-Z_]+$/', $line)) {
            $langs[] = $line;
        }
    }
    return array_values(array_unique($langs));
}

function scan_ocr_language_arg(array $status): string {
    $available = $status['languages'] ?? [];
    if (!is_array($available) || count($available) === 0) {
        return 'eng';
    }
    $preferred = ['srp', 'eng', 'deu', 'ita', 'spa'];
    $picked = [];
    foreach ($preferred as $lang) {
        if (in_array($lang, $available, true)) {
            $picked[] = $lang;
        }
    }
    return count($picked) > 0 ? implode('+', array_slice($picked, 0, 2)) : (string) $available[0];
}

function scan_ocr_latin_language_arg(array $status): string {
    $available = $status['languages'] ?? [];
    if (is_array($available) && in_array('eng', $available, true)) {
        return 'eng';
    }
    return scan_ocr_language_arg($status);
}

function scan_ocr_attachment_url(string $path): string {
    if (preg_match('#^https?://#i', $path)) {
        $host = strtolower((string) (parse_url($path, PHP_URL_HOST) ?: ''));
        $allowed = ['brkovic.ltd', 'www.brkovic.ltd', '127.0.0.1', 'localhost'];
        return in_array($host, $allowed, true) ? $path : '';
    }
    if (str_starts_with($path, '/') && !str_starts_with($path, '//')) {
        if (is_local_request()) {
            $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1';
            return 'http://' . $host . $path;
        }
        return 'https://brkovic.ltd' . $path;
    }
    return '';
}

function scan_ocr_temp_dir(): string {
    $base = rtrim(sys_get_temp_dir(), '/') . '/ship-cashbox-ocr-' . bin2hex(random_bytes(8));
    if (!mkdir($base, 0700, true) && !is_dir($base)) {
        throw new RuntimeException('Could not create OCR temp directory.');
    }
    return $base;
}

function scan_ocr_remove_dir(string $dir): void {
    if ($dir === '' || !is_dir($dir)) {
        return;
    }
    foreach (glob($dir . '/*') ?: [] as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }
    @rmdir($dir);
}

function scan_ocr_download(string $url, string $target): void {
    $ch = curl_init($url);
    if (!$ch) {
        throw new RuntimeException('Could not start OCR download.');
    }
    $handle = fopen($target, 'wb');
    if (!$handle) {
        curl_close($ch);
        throw new RuntimeException('Could not prepare OCR source file.');
    }
    $written = 0;
    curl_setopt_array($ch, [
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => OCR_REQUEST_TIMEOUT,
        CURLOPT_FAILONERROR => true,
        CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use ($handle, &$written): int {
            $length = strlen($chunk);
            $written += $length;
            if ($written > OCR_MAX_DOWNLOAD_BYTES) {
                return 0;
            }
            fwrite($handle, $chunk);
            return $length;
        },
    ]);
    $ok = curl_exec($ch);
    $error = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    fclose($handle);

    if ($ok === false || $status >= 400 || !is_file($target) || filesize($target) <= 0) {
        @unlink($target);
        throw new RuntimeException($written > OCR_MAX_DOWNLOAD_BYTES ? 'OCR source file is too large.' : ($error ?: 'Could not download OCR source file.'));
    }
}

function scan_ocr_mime(string $path, string $fallbackName = ''): string {
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = (string) finfo_file($finfo, $path);
            finfo_close($finfo);
            if ($mime !== '') {
                return strtolower($mime);
            }
        }
    }
    $file = command_path('file');
    if ($file !== '') {
        $output = [];
        $status = 1;
        @exec(escapeshellarg($file) . ' --mime-type -b ' . escapeshellarg($path), $output, $status);
        $mime = trim((string) ($output[0] ?? ''));
        if ($status === 0 && $mime !== '') {
            return strtolower($mime);
        }
    }
    return preg_match('/\.pdf(?:$|\?)/i', $fallbackName) ? 'application/pdf' : 'application/octet-stream';
}

function scan_ocr_pdf_first_page(string $pdfPath, string $workDir, array $status, int $resolution = 220, string $name = 'page'): string {
    if (empty($status['tools']['pdftoppm'])) {
        throw new RuntimeException('PDF OCR requires pdftoppm on the server.');
    }
    $resolution = max(160, min(420, $resolution));
    $pdftoppm = command_path('pdftoppm');
    $prefix = $workDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
    $command = scan_ocr_timeout_prefix() . escapeshellarg($pdftoppm)
        . ' -f 1 -l 1 -singlefile -r ' . $resolution . ' -png '
        . escapeshellarg($pdfPath) . ' ' . escapeshellarg($prefix);
    $output = [];
    $exit = 1;
    @exec($command . ' 2>&1', $output, $exit);
    $page = $prefix . '.png';
    if ($exit !== 0 || !is_file($page) || filesize($page) <= 0) {
        throw new RuntimeException('Could not prepare PDF page for OCR.');
    }
    return $page;
}

function scan_ocr_pdf_region(string $pdfPath, string $workDir, array $status, int $resolution, string $name, array $rect): string {
    if (empty($status['tools']['pdftoppm'])) {
        throw new RuntimeException('PDF OCR requires pdftoppm on the server.');
    }
    $resolution = max(160, min(420, $resolution));
    $pdftoppm = command_path('pdftoppm');
    $prefix = $workDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
    $command = scan_ocr_timeout_prefix() . escapeshellarg($pdftoppm)
        . ' -f 1 -l 1 -singlefile -r ' . $resolution . ' -png'
        . ' -x ' . max(0, (int) ($rect['x'] ?? 0))
        . ' -y ' . max(0, (int) ($rect['y'] ?? 0))
        . ' -W ' . max(40, (int) ($rect['width'] ?? 0))
        . ' -H ' . max(24, (int) ($rect['height'] ?? 0))
        . ' ' . escapeshellarg($pdfPath) . ' ' . escapeshellarg($prefix);
    $output = [];
    $exit = 1;
    @exec($command . ' 2>&1', $output, $exit);
    $page = $prefix . '.png';
    if ($exit !== 0 || !is_file($page) || filesize($page) <= 0) {
        return '';
    }
    return $page;
}

function scan_ocr_timeout_prefix(): string {
    $timeout = command_path('timeout');
    return $timeout !== '' ? escapeshellarg($timeout) . ' ' . OCR_REQUEST_TIMEOUT . 's ' : '';
}

function scan_ocr_text_has_date(string $text): bool {
    return (bool) preg_match('/\b\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?\b/', $text);
}

function scan_ocr_run_tesseract(string $imagePath, bool $tsv, array $status, int $psm = 6, array $configs = [], string $language = ''): string {
    $tesseract = command_path('tesseract');
    if ($tesseract === '') {
        throw new RuntimeException('Tesseract is not installed.');
    }
    $psm = in_array($psm, [4, 6, 7, 11, 12, 13], true) ? $psm : 6;
    $lang = $language !== '' ? $language : scan_ocr_language_arg($status);
    $command = scan_ocr_timeout_prefix() . escapeshellarg($tesseract)
        . ' ' . escapeshellarg($imagePath)
        . ' stdout -l ' . escapeshellarg($lang)
        . ' --psm ' . $psm;
    foreach ($configs as $name => $value) {
        $name = (string) $name;
        if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $name)) {
            continue;
        }
        $command .= ' -c ' . escapeshellarg($name . '=' . (string) $value);
    }
    if ($tsv) {
        $command .= ' tsv';
    }
    $output = [];
    $exit = 1;
    @exec($command . ' 2>/dev/null', $output, $exit);
    if ($exit !== 0) {
        return '';
    }
    return implode("\n", $output);
}

function scan_ocr_pdf_date_region_text(string $pdfPath, string $workDir, array $status, array $lines): string {
    $rects = [];
    foreach ($lines as $line) {
        $text = strtolower((string) ($line['text'] ?? ''));
        $bbox = is_array($line['bbox'] ?? null) ? $line['bbox'] : [];
        if (!$bbox) {
            continue;
        }
        $x = (int) ($bbox['x'] ?? 0);
        $y = (int) ($bbox['y'] ?? 0);
        $height = (int) ($bbox['height'] ?? 0);
        if (preg_match('/rac|ra[cč]un|racl|2026|\d{4}/i', $text)) {
            $rects[] = ['x' => max(0, $x - 260), 'y' => max(0, $y + $height - 6), 'width' => 980, 'height' => 125];
            $rects[] = ['x' => max(0, $x - 160), 'y' => max(0, $y + $height + 16), 'width' => 820, 'height' => 90];
        }
        if (preg_match('/oper|iter|nikol/i', $text)) {
            $rects[] = ['x' => max(0, $x - 80), 'y' => max(0, $y - 92), 'width' => 760, 'height' => 88];
        }
    }
    $rects = array_merge($rects, [
        ['x' => 270, 'y' => 670, 'width' => 1050, 'height' => 245],
        ['x' => 340, 'y' => 720, 'width' => 900, 'height' => 140],
        ['x' => 390, 'y' => 742, 'width' => 760, 'height' => 96],
    ]);

    $seen = [];
    $texts = [];
    $whitelist = '0123456789.:/- ';
    foreach ($rects as $index => $rect) {
        $key = implode(':', array_map('intval', [$rect['x'], $rect['y'], $rect['width'], $rect['height']]));
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        foreach ([220, 360] as $resolution) {
            $factor = $resolution / 220;
            $scaled = [
                'x' => (int) round($rect['x'] * $factor),
                'y' => (int) round($rect['y'] * $factor),
                'width' => (int) round($rect['width'] * $factor),
                'height' => (int) round($rect['height'] * $factor),
            ];
            $crop = scan_ocr_pdf_region($pdfPath, $workDir, $status, $resolution, 'date-' . $index . '-' . $resolution, $scaled);
            if ($crop === '') {
                continue;
            }
            foreach ([7, 6, 11] as $psm) {
                $text = trim(scan_ocr_run_tesseract($crop, false, $status, $psm, [
                    'tessedit_char_whitelist' => $whitelist,
                ], scan_ocr_latin_language_arg($status)));
                if ($text !== '') {
                    $texts[] = $text;
                }
                if (scan_ocr_text_has_date($text)) {
                    return $text;
                }
            }
        }
    }
    return trim(implode("\n", array_unique($texts)));
}

function scan_ocr_parse_tsv(string $tsv): array {
    $rows = preg_split('/\r\n|\n|\r/', trim($tsv));
    if (!$rows || count($rows) < 2) {
        return [];
    }
    $headers = str_getcsv((string) array_shift($rows), "\t");
    $groups = [];
    foreach ($rows as $row) {
        if (trim((string) $row) === '') {
            continue;
        }
        $cols = str_getcsv((string) $row, "\t");
        $item = [];
        foreach ($headers as $index => $name) {
            $item[$name] = $cols[$index] ?? '';
        }
        $text = trim((string) ($item['text'] ?? ''));
        if ($text === '') {
            continue;
        }
        $conf = (float) ($item['conf'] ?? -1);
        if ($conf < 0) {
            continue;
        }
        $key = implode(':', [
            $item['page_num'] ?? '1',
            $item['block_num'] ?? '0',
            $item['par_num'] ?? '0',
            $item['line_num'] ?? '0',
        ]);
        $left = (int) ($item['left'] ?? 0);
        $top = (int) ($item['top'] ?? 0);
        $width = (int) ($item['width'] ?? 0);
        $height = (int) ($item['height'] ?? 0);
        if (!isset($groups[$key])) {
            $groups[$key] = [
                'parts' => [],
                'conf' => [],
                'left' => $left,
                'top' => $top,
                'right' => $left + $width,
                'bottom' => $top + $height,
            ];
        }
        $groups[$key]['parts'][] = $text;
        $groups[$key]['conf'][] = $conf;
        $groups[$key]['left'] = min($groups[$key]['left'], $left);
        $groups[$key]['top'] = min($groups[$key]['top'], $top);
        $groups[$key]['right'] = max($groups[$key]['right'], $left + $width);
        $groups[$key]['bottom'] = max($groups[$key]['bottom'], $top + $height);
    }

    $lines = [];
    foreach ($groups as $group) {
        $left = (int) $group['left'];
        $top = (int) $group['top'];
        $right = (int) $group['right'];
        $bottom = (int) $group['bottom'];
        $conf = count($group['conf']) > 0 ? array_sum($group['conf']) / count($group['conf']) : null;
        $lines[] = [
            'text' => implode(' ', $group['parts']),
            'bbox' => [
                'x' => $left,
                'y' => $top,
                'width' => max(0, $right - $left),
                'height' => max(0, $bottom - $top),
            ],
            'confidence' => $conf === null ? null : round($conf, 2),
        ];
    }
    return array_values(array_filter($lines, static fn (array $line): bool => trim((string) ($line['text'] ?? '')) !== ''));
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
    $authCookie = auth_cookie_header();
    if ($authCookie !== '') {
        $headers[] = 'Cookie: ' . $authCookie;
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
        CURLOPT_TIMEOUT => AUTH_REQUEST_TIMEOUT,
        CURLOPT_CONNECTTIMEOUT => AUTH_CONNECT_TIMEOUT,
    ]);

    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    }

    $response = curl_exec($ch);
    if ($response === false) {
        $message = curl_error($ch) ?: 'Auth request failed';
        curl_close($ch);
        return [
            'status' => 502,
            'data' => [
                'error' => [
                    'message' => $message,
                ],
            ],
        ];
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
            $_SESSION['brkovic_live_cookies']['admin'] = $pair;
            $_SESSION['brkovic_live_cookie'] = $pair;
            continue;
        }
        if (stripos($pair, 'ship_journal_tool_user=') === 0) {
            $_SESSION['brkovic_live_cookies']['toolUser'] = $pair;
        }
    }

    $data = json_decode($body, true);
    return ['status' => $status, 'data' => is_array($data) ? $data : []];
}

function auth_cookie_header(): string {
    $pairs = [];
    $stored = $_SESSION['brkovic_live_cookies'] ?? [];
    if (is_array($stored)) {
        foreach (['admin', 'toolUser'] as $key) {
            $cookie = $stored[$key] ?? '';
            if (is_string($cookie) && $cookie !== '' && $cookie !== '1') {
                $pairs[] = $cookie;
            }
        }
    }

    foreach (proxy_session_auth_cookies() as $cookie) {
        $pairs[] = $cookie;
    }

    $sessionCookie = $_SESSION['brkovic_live_cookie'] ?? '';
    if (is_string($sessionCookie) && $sessionCookie !== '' && $sessionCookie !== '1') {
        $pairs[] = $sessionCookie;
    }

    $raw = $_SERVER['HTTP_COOKIE'] ?? '';
    if (is_string($raw) && $raw !== '') {
        foreach (explode(';', $raw) as $part) {
            $pair = trim($part);
            if (stripos($pair, 'ship_journal_admin=') === 0 || stripos($pair, 'ship_journal_tool_user=') === 0) {
                $pairs[] = $pair;
            }
        }
    }

    $unique = [];
    foreach ($pairs as $pair) {
        $name = strtolower(strtok($pair, '=') ?: $pair);
        $unique[$name] = $pair;
    }

    return implode('; ', array_values($unique));
}

function proxy_session_auth_cookies(): array {
    $proxySessionId = (string) ($_COOKIE['brkovic_local_admin'] ?? '');
    if ($proxySessionId === '' || !preg_match('/^[a-zA-Z0-9,-]{16,128}$/', $proxySessionId)) {
        return [];
    }

    $currentName = session_name();
    $currentId = session_id();
    $currentData = $_SESSION;
    session_write_close();

    $cookies = [];
    session_name('brkovic_local_admin');
    session_id($proxySessionId);
    if (@session_start(['read_and_close' => true])) {
        $stored = $_SESSION['brkovic_live_cookies'] ?? [];
        if (is_array($stored)) {
            foreach (['admin', 'toolUser'] as $key) {
                $cookie = $stored[$key] ?? '';
                if (is_string($cookie) && $cookie !== '' && $cookie !== '1') {
                    $cookies[] = $cookie;
                }
            }
        }
    }

    $_SESSION = [];
    session_name($currentName);
    session_id($currentId);
    session_start();
    $_SESSION = $currentData;

    return $cookies;
}

function has_shared_site_auth(): bool {
    $cookie = auth_cookie_header();
    if ($cookie === '') {
        return false;
    }

    foreach (['/auth/me', '/auth/user/me'] as $route) {
        $auth = auth_request($route);
        $payload = $auth['data']['data']['data'] ?? $auth['data']['data'] ?? $auth['data'];
        if (($auth['status'] ?? 500) < 400 && (bool) ($payload['authenticated'] ?? false)) {
            return true;
        }
    }

    return false;
}

function auth_payload_from_response(array $auth): array {
    return $auth['data']['data']['data'] ?? $auth['data']['data'] ?? $auth['data'];
}

function local_dev_auth_email(): string {
    if (!is_local_request()) {
        return '';
    }
    $index = read_index();
    $email = clean_email($index['local_owner_email'] ?? $index['seeded_owner_email'] ?? '');
    return $email !== '' ? $email : 'local@brkovic.ltd';
}

function current_auth_profile(): array {
    static $cachedProfile = null;
    if (is_array($cachedProfile)) {
        return $cachedProfile;
    }

    if (is_local_request()) {
        $cachedProfile = [
            'authenticated' => true,
            'email' => local_dev_auth_email(),
            'displayName' => 'Local treasurer',
        ];
        return $cachedProfile;
    }

    if (auth_cookie_header() === '' && !has_local_auth_cookie()) {
        $cachedProfile = ['authenticated' => false];
        return $cachedProfile;
    }

    foreach (['/auth/me', '/auth/user/me'] as $route) {
        $auth = auth_request($route);
        $payload = auth_payload_from_response($auth);
        if (($auth['status'] ?? 500) < 400 && (bool) ($payload['authenticated'] ?? false)) {
            $cachedProfile = [
                'authenticated' => true,
                'email' => clean_email($payload['email'] ?? $payload['user']['email'] ?? ''),
                'displayName' => trim((string) ($payload['displayName'] ?? $payload['user']['displayName'] ?? $payload['name'] ?? '')),
            ];
            return $cachedProfile;
        }
    }

    $cachedProfile = ['authenticated' => has_local_auth_cookie()];
    return $cachedProfile;
}

function current_auth_email(): string {
    $profile = current_auth_profile();
    $email = clean_email($profile['email'] ?? '');
    if ($email !== '') {
        return $email;
    }
    return is_local_request() || has_local_auth_cookie() ? 'local@brkovic.ltd' : '';
}

function authenticated(): bool {
    if (is_local_request()) {
        return true;
    }
    if (has_local_auth_cookie()) {
        return true;
    }
    if (auth_cookie_header() === '') {
        return false;
    }
    $profile = current_auth_profile();
    return (bool) ($profile['authenticated'] ?? false);
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

function clean_email(mixed $value): string {
    $email = strtolower(trim((string) $value));
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
}

function html_escape(mixed $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
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

function ship_cashbox_env(string $name, string $default = ''): string {
    $value = getenv($name);
    if ($value === false || trim((string) $value) === '') {
        return $default;
    }
    return trim((string) $value);
}

function ship_cashbox_storage_provider(): string {
    $provider = strtolower(ship_cashbox_env('SHIP_CASHBOX_STORAGE', 'json'));
    return in_array($provider, ['mongo', 'mongodb', 'atlas'], true) ? 'mongodb' : 'json';
}

function ship_cashbox_mongodb_uri(): string {
    return ship_cashbox_env('SHIP_CASHBOX_MONGODB_URI', ship_cashbox_env('MONGODB_URI'));
}

function ship_cashbox_mongodb_db(): string {
    return ship_cashbox_env('SHIP_CASHBOX_MONGODB_DB', ship_cashbox_env('MONGODB_DB'));
}

function ship_cashbox_mongodb_collection_name(string $name): string {
    $prefix = ship_cashbox_env('SHIP_CASHBOX_MONGODB_COLLECTION_PREFIX', 'shipCashbox');
    $safePrefix = preg_replace('/[^a-zA-Z0-9_]/', '', $prefix) ?: 'shipCashbox';
    return $safePrefix . $name;
}

function ship_cashbox_mongodb_namespace(string $collection): string {
    $db = ship_cashbox_mongodb_db();
    if ($db === '' || !preg_match('/^[a-zA-Z0-9_.-]+$/', $db)) {
        fail('MongoDB database for Ship Cashbox is not configured', 500);
    }
    return $db . '.' . ship_cashbox_mongodb_collection_name($collection);
}

function ship_cashbox_storage_health(): array {
    $provider = ship_cashbox_storage_provider();
    $mongoUri = ship_cashbox_mongodb_uri();
    $mongoDb = ship_cashbox_mongodb_db();
    return [
        'provider' => $provider,
        'jsonStorageDir' => STORAGE_DIR,
        'mongodb' => [
            'requested' => $provider === 'mongodb',
            'extensionLoaded' => class_exists('\\MongoDB\\Driver\\Manager'),
            'uriConfigured' => $mongoUri !== '',
            'dbConfigured' => $mongoDb !== '',
            'database' => $mongoDb,
            'sessionsCollection' => ship_cashbox_mongodb_collection_name('Sessions'),
            'indexCollection' => ship_cashbox_mongodb_collection_name('Index'),
        ],
    ];
}

function ship_cashbox_mongodb_assert_ready(): void {
    if (!class_exists('\\MongoDB\\Driver\\Manager')) {
        fail('MongoDB PHP extension is not installed for Ship Cashbox storage', 500);
    }
    if (ship_cashbox_mongodb_uri() === '') {
        fail('MongoDB URI for Ship Cashbox is not configured', 500);
    }
    if (ship_cashbox_mongodb_db() === '') {
        fail('MongoDB database for Ship Cashbox is not configured', 500);
    }
}

function ship_cashbox_mongodb_manager(): \MongoDB\Driver\Manager {
    static $manager = null;
    ship_cashbox_mongodb_assert_ready();
    if ($manager instanceof \MongoDB\Driver\Manager) {
        return $manager;
    }
    try {
        $manager = new \MongoDB\Driver\Manager(ship_cashbox_mongodb_uri());
        return $manager;
    } catch (Throwable $error) {
        fail('MongoDB connection initialization failed for Ship Cashbox', 500);
    }
}

function ship_cashbox_bson_to_array(mixed $document): array {
    if ($document === null) {
        return [];
    }
    $json = json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $array = json_decode((string) $json, true);
    if (!is_array($array)) {
        return [];
    }
    unset($array['_id']);
    return $array;
}

function ship_cashbox_mongodb_find_one(string $collection, array $filter): ?array {
    $query = new \MongoDB\Driver\Query($filter, ['limit' => 1]);
    try {
        $cursor = ship_cashbox_mongodb_manager()->executeQuery(ship_cashbox_mongodb_namespace($collection), $query);
        foreach ($cursor as $document) {
            $data = ship_cashbox_bson_to_array($document);
            return $data ?: null;
        }
    } catch (Throwable $error) {
        fail('MongoDB read failed for Ship Cashbox', 500);
    }
    return null;
}

function ship_cashbox_mongodb_find_many(string $collection, array $filter = [], array $options = []): array {
    $query = new \MongoDB\Driver\Query($filter, $options);
    try {
        $cursor = ship_cashbox_mongodb_manager()->executeQuery(ship_cashbox_mongodb_namespace($collection), $query);
        $items = [];
        foreach ($cursor as $document) {
            $data = ship_cashbox_bson_to_array($document);
            if ($data) {
                $items[] = $data;
            }
        }
        return $items;
    } catch (Throwable $error) {
        fail('MongoDB read failed for Ship Cashbox', 500);
    }
}

function ship_cashbox_mongodb_replace_one(string $collection, array $filter, array $document): void {
    $bulk = new \MongoDB\Driver\BulkWrite();
    $bulk->update($filter, $document, ['upsert' => true, 'multi' => false]);
    try {
        ship_cashbox_mongodb_manager()->executeBulkWrite(ship_cashbox_mongodb_namespace($collection), $bulk);
    } catch (Throwable $error) {
        fail('MongoDB write failed for Ship Cashbox', 500);
    }
}

function read_index(): array {
    if (ship_cashbox_storage_provider() === 'mongodb') {
        $data = ship_cashbox_mongodb_find_one('Index', ['key' => 'active']);
        return $data ?: ['key' => 'active', 'active_session_id' => null];
    }
    ensure_dirs();
    $data = read_json_file(INDEX_FILE);
    if ($data) {
        return $data;
    }
    return ['active_session_id' => null];
}

function write_index(array $index): void {
    if (ship_cashbox_storage_provider() === 'mongodb') {
        $existing = read_index();
        ship_cashbox_mongodb_replace_one('Index', ['key' => 'active'], array_merge($existing, $index, ['key' => 'active']));
        return;
    }
    $existing = read_json_file(INDEX_FILE) ?: [];
    write_json_file(INDEX_FILE, array_merge($existing, $index));
}

function normalize_accounting_state(string $state, string $kind = 'note'): string {
    if (in_array($state, ['free', 'report', 'disputed', 'excluded'], true)) {
        return $state;
    }
    return $kind === 'note' ? 'free' : 'report';
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
        'report_id' => trim((string) ($entry['report_id'] ?? '')) ?: null,
        'accounting_state' => normalize_accounting_state((string) ($entry['accounting_state'] ?? ''), $kind),
        'created_at' => (string) ($entry['created_at'] ?? now_iso()),
        'updated_at' => (string) ($entry['updated_at'] ?? now_iso()),
    ];
}

function normalize_personal_report_status(string $status): string {
    return in_array($status, ['active', 'fixed', 'deleted'], true) ? $status : 'active';
}

function normalize_personal_report(array $report, int $index = 0): array {
    $createdAt = (string) ($report['created_at'] ?? $report['opened_at'] ?? now_iso());
    $status = normalize_personal_report_status((string) ($report['status'] ?? 'active'));
    $openingBalance = money_round((float) money_input($report['opening_balance'] ?? $report['incoming_balance'] ?? 0));
    $incomeTotal = money_round((float) ($report['income_total'] ?? $report['total_income'] ?? 0));
    $expenseTotal = money_round(abs((float) ($report['expense_total'] ?? $report['total_expenses'] ?? 0)));
    $currentBalance = array_key_exists('current_balance', $report)
        ? money_round((float) money_input($report['current_balance']))
        : money_round($openingBalance + $incomeTotal - $expenseTotal);

    return [
        'id' => trim((string) ($report['id'] ?? '')) ?: rand_id('report'),
        'report_index' => $index,
        'title' => trim((string) ($report['title'] ?? '')) ?: 'Личный отчет',
        'status' => $status,
        'currency' => trim((string) ($report['currency'] ?? '')) ?: null,
        'opening_balance' => $openingBalance,
        'incoming_balance' => $openingBalance,
        'income_total' => $incomeTotal,
        'expense_total' => $expenseTotal,
        'current_balance' => $currentBalance,
        'record_count' => max(0, (int) ($report['record_count'] ?? 0)),
        'entry_count' => max(0, (int) ($report['entry_count'] ?? 0)),
        'period_start' => trim((string) ($report['period_start'] ?? $report['opened_at'] ?? $createdAt)) ?: $createdAt,
        'period_end' => trim((string) ($report['period_end'] ?? $report['closed_at'] ?? '')) ?: null,
        'opened_at' => trim((string) ($report['opened_at'] ?? $report['period_start'] ?? $createdAt)) ?: $createdAt,
        'closed_at' => $status === 'fixed' ? (trim((string) ($report['closed_at'] ?? $report['period_end'] ?? '')) ?: now_iso()) : null,
        'fixed_at' => $status === 'fixed' ? (trim((string) ($report['fixed_at'] ?? $report['closed_at'] ?? $report['period_end'] ?? '')) ?: now_iso()) : null,
        'deleted_at' => $status === 'deleted' ? (trim((string) ($report['deleted_at'] ?? '')) ?: now_iso()) : null,
        'carryover_from_report_id' => trim((string) ($report['carryover_from_report_id'] ?? '')) ?: null,
        'opening_balance_source' => in_array(($report['opening_balance_source'] ?? ''), ['manual', 'carryover'], true) ? (string) $report['opening_balance_source'] : 'manual',
        'created_at' => $createdAt,
        'updated_at' => (string) ($report['updated_at'] ?? $createdAt),
    ];
}

function normalize_personal_reports(array $reports, string $sessionCurrency = 'EUR'): array {
    $normalized = [];
    $seen = [];
    foreach ($reports as $index => $report) {
        if (!is_array($report)) {
            continue;
        }
        $item = normalize_personal_report($report, count($normalized));
        if (isset($seen[$item['id']])) {
            $item['id'] = rand_id('report');
        }
        $item['currency'] = $item['currency'] ?: $sessionCurrency;
        $seen[$item['id']] = true;
        $normalized[] = $item;
    }
    return $normalized;
}

function active_personal_report_id(array $session, array $reports): ?string {
    $requested = trim((string) ($session['active_personal_report_id'] ?? ''));
    foreach ($reports as $report) {
        if (($report['id'] ?? '') === $requested && ($report['status'] ?? '') === 'active') {
            return $requested;
        }
    }
    foreach ($reports as $report) {
        if (($report['status'] ?? '') === 'active') {
            return (string) $report['id'];
        }
    }
    return null;
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
    $notebookBatches = [];
    foreach (($participant['notebook_batches'] ?? []) as $index => $batch) {
        if (!is_array($batch)) {
            continue;
        }
        $notebookBatches[] = normalize_notebook_batch($batch, $index);
    }
    $notebookTrash = [];
    $now = time();
    foreach (($participant['notebook_trash'] ?? []) as $index => $item) {
        if (!is_array($item)) {
            continue;
        }
        $normalizedTrash = normalize_notebook_trash_item($item, $index);
        $deleteAfter = strtotime((string) ($normalizedTrash['delete_after'] ?? '')) ?: 0;
        if ($deleteAfter > 0 && $deleteAfter < $now) {
            continue;
        }
        $notebookTrash[] = $normalizedTrash;
    }

    return [
        'id' => (string) ($participant['id'] ?? rand_id('part')),
        'display_name' => trim((string) ($participant['display_name'] ?? '')) ?: ($role === 'treasurer' ? 'Treasurer' : 'Crew member'),
        'role' => $role,
        'active' => array_key_exists('active', $participant) ? (bool) $participant['active'] : true,
        'email' => clean_email($participant['email'] ?? ''),
        'account_email' => clean_email($participant['account_email'] ?? ''),
        'account_claimed_at' => $participant['account_claimed_at'] ?? null,
        'included_in_split' => array_key_exists('included_in_split', $participant) ? bool_value($participant['included_in_split'], true) : true,
        'cashbox_contribution' => array_key_exists('cashbox_contribution', $participant) ? max(0, money_input($participant['cashbox_contribution'])) : 0.0,
        'authorized_at' => $participant['authorized_at'] ?? ($role === 'treasurer' ? now_iso() : null),
        'invite_sent_at' => $participant['invite_sent_at'] ?? null,
        'invite_last_error' => trim((string) ($participant['invite_last_error'] ?? '')) ?: null,
        'invite_token' => (string) ($participant['invite_token'] ?? bin2hex(random_bytes(16))),
        'invite_code_hash' => (string) ($participant['invite_code_hash'] ?? ''),
        'invite_code_expires_at' => $participant['invite_code_expires_at'] ?? null,
        'invite_code_sent_at' => $participant['invite_code_sent_at'] ?? null,
        'invite_code_used_at' => $participant['invite_code_used_at'] ?? null,
        'joined_at' => (string) ($participant['joined_at'] ?? now_iso()),
        'notebook_text' => str_replace("\r", '', (string) ($participant['notebook_text'] ?? '')),
        'notebook_hash' => (string) ($participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? ''))),
        'last_synced_at' => $participant['last_synced_at'] ?? null,
        'last_sync_source' => (string) ($participant['last_sync_source'] ?? ''),
        'settled_left_at' => $participant['settled_left_at'] ?? null,
        'settlement_event_id' => trim((string) ($participant['settlement_event_id'] ?? '')) ?: null,
        'entries' => $entries,
        'notebook_batches' => $notebookBatches,
        'notebook_trash' => $notebookTrash,
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

function timestamp_value(?string $value): int {
    $time = strtotime((string) $value);
    return $time === false ? 0 : $time;
}

function normalize_treasurer_period(array $period, string $fallbackTreasurerId, string $fallbackStartedAt): ?array {
    $treasurerId = trim((string) ($period['treasurer_participant_id'] ?? $period['treasurer_id'] ?? '')) ?: $fallbackTreasurerId;
    if ($treasurerId === '') {
        return null;
    }
    $startedAt = (string) ($period['started_at'] ?? $fallbackStartedAt);
    $endedAt = $period['ended_at'] ?? null;
    if ($startedAt === '') {
        $startedAt = $fallbackStartedAt ?: now_iso();
    }

    return [
        'id' => (string) ($period['id'] ?? rand_id('treasurer-period')),
        'treasurer_participant_id' => $treasurerId,
        'started_at' => $startedAt,
        'ended_at' => $endedAt ? (string) $endedAt : null,
        'reason' => in_array(($period['reason'] ?? ''), ['session_start', 'treasurer_rotation'], true)
            ? (string) $period['reason']
            : 'session_start',
    ];
}

function normalize_treasurer_periods(array $session, string $treasurerId): array {
    $createdAt = (string) ($session['created_at'] ?? now_iso());
    $periods = [];
    foreach (($session['treasurer_periods'] ?? []) as $period) {
        if (!is_array($period)) {
            continue;
        }
        $normalized = normalize_treasurer_period($period, $treasurerId, $createdAt);
        if ($normalized) {
            $periods[] = $normalized;
        }
    }

    if (!$periods) {
        $periods[] = normalize_treasurer_period([
            'id' => rand_id('treasurer-period'),
            'treasurer_participant_id' => $treasurerId,
            'started_at' => $createdAt,
            'ended_at' => null,
            'reason' => 'session_start',
        ], $treasurerId, $createdAt);
    }

    $periods = array_values(array_filter($periods));
    usort($periods, static fn(array $a, array $b): int => timestamp_value($a['started_at'] ?? '') <=> timestamp_value($b['started_at'] ?? ''));

    $hasOpen = false;
    foreach ($periods as &$period) {
        if (($period['ended_at'] ?? null) === null) {
            if ($hasOpen) {
                $period['ended_at'] = now_iso();
                continue;
            }
            $period['treasurer_participant_id'] = $period['treasurer_participant_id'] ?: $treasurerId;
            $hasOpen = true;
        }
    }
    unset($period);

    if (!$hasOpen) {
        $periods[] = normalize_treasurer_period([
            'treasurer_participant_id' => $treasurerId,
            'started_at' => now_iso(),
            'ended_at' => null,
            'reason' => 'treasurer_rotation',
        ], $treasurerId, $createdAt);
    }

    return $periods;
}

function treasurer_for_entry_at(array $session, array $entry): string {
    $entryTime = timestamp_value((string) ($entry['created_at'] ?? $session['created_at'] ?? ''));
    $fallbackTreasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    $matched = '';
    foreach (($session['treasurer_periods'] ?? []) as $period) {
        if (!is_array($period)) {
            continue;
        }
        $started = timestamp_value((string) ($period['started_at'] ?? ''));
        $ended = ($period['ended_at'] ?? null) ? timestamp_value((string) $period['ended_at']) : PHP_INT_MAX;
        if ($entryTime >= $started && $entryTime <= $ended) {
            $matched = (string) ($period['treasurer_participant_id'] ?? '');
        }
    }
    return $matched !== '' ? $matched : $fallbackTreasurerId;
}

function attachment_public_path(string $fileName, ?string $createdAt = null): string {
    $year = $createdAt ? substr($createdAt, 0, 4) : gmdate('Y');
    return '/ship-cashbox/attachments/' . $year . '/' . basename($fileName);
}

function attachment_storage_path(string $publicPath): string {
    $path = parse_url($publicPath, PHP_URL_PATH) ?: '';
    if (!preg_match('#^/ship-cashbox/attachments/([0-9]{4})/([a-zA-Z0-9_.-]+)$#', $path, $matches)) {
        return '';
    }
    $target = ATTACHMENTS_DIR . '/' . $matches[1] . '/' . $matches[2];
    $base = realpath(ATTACHMENTS_DIR);
    $dir = realpath(dirname($target));
    if (!$base || !$dir || !str_starts_with($dir, $base)) {
        return '';
    }
    return $target;
}

function attachment_extension(string $name, string $mime): string {
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
    if (in_array($ext, $allowed, true)) {
        return $ext === 'jpeg' ? 'jpg' : $ext;
    }
    return match ($mime) {
        'application/pdf' => 'pdf',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/heic' => 'heic',
        'image/heif' => 'heif',
        default => 'jpg',
    };
}

function attachment_mime(string $path, string $fallback = ''): string {
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = (string) finfo_file($finfo, $path);
            finfo_close($finfo);
            if ($mime !== '') {
                return $mime;
            }
        }
    }
    return $fallback !== '' ? $fallback : 'application/octet-stream';
}

function upload_cashbox_attachment(): array {
    $session = require_current_active_owner_session(
        (string) ($_POST['session_id'] ?? ''),
        normalized_payload_mode((string) ($_POST['session_mode'] ?? ''))
    );

    $file = $_FILES['file'] ?? null;
    if (!is_array($file)) {
        $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
        $limit = ini_get('post_max_size') ?: '';
        $message = $contentLength > 0
            ? 'Файл не получен сервером. Вероятно, исходное фото больше лимита загрузки' . ($limit !== '' ? ' (' . $limit . ')' : '') . '.'
            : 'Файл не получен';
        fail($message, 422);
    }
    $uploadError = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($uploadError !== UPLOAD_ERR_OK) {
        $message = match ($uploadError) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Файл слишком большой для загрузки',
            UPLOAD_ERR_PARTIAL => 'Файл был загружен не полностью',
            UPLOAD_ERR_NO_FILE => 'Файл не выбран',
            default => 'Файл не получен',
        };
        fail($message, 422);
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_file($tmp)) {
        fail('Файл не подготовлен', 422);
    }
    $size = (int) ($file['size'] ?? filesize($tmp));
    if ($size <= 0 || $size > OCR_MAX_DOWNLOAD_BYTES) {
        fail('Файл слишком большой', 413);
    }

    $originalName = basename((string) ($file['name'] ?? 'receipt'));
    $mime = attachment_mime($tmp, (string) ($file['type'] ?? ''));
    $isAllowed = str_starts_with($mime, 'image/') || $mime === 'application/pdf';
    if (!$isAllowed) {
        fail('Этот тип файла не поддерживается', 415);
    }

    $createdAt = now_iso();
    $year = substr($createdAt, 0, 4);
    $dir = ATTACHMENTS_DIR . '/' . $year;
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать папку вложений', 500);
    }

    $id = rand_id('att');
    $ext = attachment_extension($originalName, $mime);
    $targetName = $id . '.' . $ext;
    $target = $dir . '/' . $targetName;
    $moved = is_uploaded_file($tmp) ? move_uploaded_file($tmp, $target) : rename($tmp, $target);
    if (!$moved || !is_file($target)) {
        fail('Не удалось сохранить файл', 500);
    }
    @chmod($target, 0664);

    $attachment = [
        'id' => $id,
        'file_path' => attachment_public_path($targetName, $createdAt),
        'type' => $mime === 'application/pdf' ? 'PDF' : 'IMAGE',
        'alt' => $originalName,
        'mime_type' => $mime,
        'created_at' => $createdAt,
    ];
    $session['attachments'] = array_values(array_merge($session['attachments'] ?? [], [$attachment]));
    $session = save_session($session);
    return build_treasurer_payload($session) + ['attachment' => $attachment];
}

function delete_cashbox_attachment(array $payload): array {
    $session = require_current_active_owner_session(
        (string) ($payload['session_id'] ?? ''),
        normalized_payload_mode((string) ($payload['session_mode'] ?? ''))
    );

    $id = trim((string) ($payload['attachment_id'] ?? $payload['id'] ?? ''));
    if ($id === '') {
        fail('Не указано вложение', 422);
    }

    $removed = null;
    $session['attachments'] = array_values(array_filter($session['attachments'] ?? [], static function ($item) use ($id, &$removed): bool {
        if (!is_array($item) || (string) ($item['id'] ?? '') !== $id) {
            return true;
        }
        $removed = $item;
        return false;
    }));
    if (is_array($removed)) {
        $target = attachment_storage_path((string) ($removed['file_path'] ?? ''));
        if ($target !== '' && is_file($target)) {
            @unlink($target);
        }
    }

    return build_treasurer_payload(save_session($session));
}

function parse_notebook(string $text, string $mode = 'group', array $context = []): array {
    $mode = $mode === 'personal' ? 'personal' : 'group';
    $reportId = trim((string) ($context['report_id'] ?? ''));
    $recordScope = in_array(($context['record_scope'] ?? ''), ['free', 'report', 'excluded'], true)
        ? (string) $context['record_scope']
        : ($reportId !== '' ? 'report' : 'free');
    $lines = preg_split('/\r\n|\n|\r/', str_replace("\r", '', $text)) ?: [];
    $entries = [];

    foreach ($lines as $index => $line) {
        $raw = trim($line);
        if ($raw === '') {
            continue;
        }
        $parsedRaw = trim((string) preg_replace('/^\s*[✓✔]\s*/u', '', $raw));

        $segments = array_values(array_filter(array_map('trim', preg_split('/\s*,\s*/u', $parsedRaw) ?: [$parsedRaw])));
        $signedPattern = '/^(?<sign>[+-])(?:€ ?)?(?<amount>\d+(?:[.,]\d+)?)\s*(?<note>.*)$/u';
        $malformedSignedPattern = '/^[+-]\s{2,}(?:€\s*)?(?<amount>\d+(?:[.,]\d+)?)\s*(?<note>.*)$/u';
        $invalidNumberPattern = '/^(?=.*\d)(?![+-](?: ?)(?:€ ?)?\d)(.*?)(?<amount>\d+(?:[.,]\d+)?)(.*)$/u';
        $unsignedPattern = '/^(?:€ ?)?(?<amount>\d+(?:[.,]\d+)?)\s*(?<note>.*)$/u';
        foreach ($segments as $segmentIndex => $segment) {
            $segment = preg_replace('/^([+-]) ([0-9])/', '$1$2', $segment);
            $segment = preg_replace('/^([+-]) (€ ?[0-9])/', '$1$2', $segment);
            $match = [];
            if (preg_match($malformedSignedPattern, $segment, $match)) {
                $amount = (float) str_replace(',', '.', (string) ($match['amount'] ?? '0'));
                $note = trim((string) ($match['note'] ?? ''));
                $entries[] = normalize_entry([
                    'raw_text' => $segment,
                    'note' => $note !== '' ? $note : $segment,
                    'amount' => 0,
                    'entry_kind' => 'note',
                    'accounting_state' => 'disputed',
                ], ($index * 100) + $segmentIndex);
                continue;
            }

            if (preg_match($signedPattern, $segment, $match)) {
                $amount = (float) str_replace(',', '.', (string) ($match['amount'] ?? '0'));
                $sign = (string) ($match['sign'] ?? '');
                $note = trim((string) ($match['note'] ?? ''));
                $kind = $sign === '+' ? 'contribution' : 'expense';
                $entryReportId = $recordScope === 'report' && $reportId !== '' ? $reportId : null;

                $entries[] = normalize_entry([
                    'raw_text' => $segment,
                    'note' => $note !== '' ? $note : $segment,
                    'amount' => $kind === 'contribution' ? $amount : -$amount,
                    'entry_kind' => $kind,
                    'report_id' => $entryReportId,
                    'accounting_state' => $recordScope,
                ], ($index * 100) + $segmentIndex);
                continue;
            }

            if (preg_match($invalidNumberPattern, $segment, $match)) {
                $amount = (float) str_replace(',', '.', (string) ($match['amount'] ?? '0'));
                $entries[] = normalize_entry([
                    'raw_text' => $segment,
                    'note' => $segment,
                    'amount' => 0,
                    'entry_kind' => 'note',
                    'accounting_state' => 'disputed',
                ], ($index * 100) + $segmentIndex);
                continue;
            }

            if (!preg_match($unsignedPattern, $segment, $match)) {
                $entries[] = normalize_entry([
                    'raw_text' => $segment,
                    'note' => $segment,
                    'entry_kind' => 'note',
                    'accounting_state' => 'free',
                ], $index);
                continue;
            }

            $amount = (float) str_replace(',', '.', (string) ($match['amount'] ?? '0'));
            $note = trim((string) ($match['note'] ?? ''));
            $entries[] = normalize_entry([
                'raw_text' => $segment,
                'note' => $note !== '' ? $note : $segment,
                'amount' => 0,
                'entry_kind' => 'note',
                'accounting_state' => 'disputed',
            ], ($index * 100) + $segmentIndex);
        }
    }

    return $entries;
}

function parse_notebook_preserving_entries(string $text, array $existingEntries = [], string $mode = 'group', array $context = []): array {
    $parsed = parse_notebook($text, $mode, $context);
    $existingByKey = [];
    foreach ($existingEntries as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $key = implode('|', [
            (string) ($entry['line_index'] ?? ''),
            trim((string) ($entry['raw_text'] ?? '')),
            (string) ($entry['entry_kind'] ?? ''),
            (string) money_round((float) ($entry['amount'] ?? 0)),
        ]);
        $existingByKey[$key][] = $entry;
    }

    foreach ($parsed as &$entry) {
        $key = implode('|', [
            (string) ($entry['line_index'] ?? ''),
            trim((string) ($entry['raw_text'] ?? '')),
            (string) ($entry['entry_kind'] ?? ''),
            (string) money_round((float) ($entry['amount'] ?? 0)),
        ]);
        $existing = !empty($existingByKey[$key]) ? array_shift($existingByKey[$key]) : null;
        if (!$existing) {
            continue;
        }
        $entry['id'] = (string) ($existing['id'] ?? $entry['id']);
        $entry['created_at'] = (string) ($existing['created_at'] ?? $entry['created_at']);
        if (($entry['report_id'] ?? null) === null && trim((string) ($existing['report_id'] ?? '')) !== '') {
            $entry['report_id'] = trim((string) $existing['report_id']);
        }
        if (!in_array(($context['record_scope'] ?? ''), ['free', 'report', 'excluded'], true)) {
            $entry['accounting_state'] = normalize_accounting_state((string) ($existing['accounting_state'] ?? $entry['accounting_state'] ?? ''), (string) ($entry['entry_kind'] ?? 'note'));
        }
    }
    unset($entry);

    return $parsed;
}

function notebook_context_from_payload(array $payload): array {
    $reportId = trim((string) ($payload['report_id'] ?? ''));
    $recordScope = in_array(($payload['record_scope'] ?? ''), ['free', 'report', 'excluded'], true)
        ? (string) $payload['record_scope']
        : ($reportId !== '' ? 'report' : 'free');
    return [
        'report_id' => $reportId,
        'record_scope' => $recordScope,
    ];
}

function notebook_entries_total(array $entries): float {
    $total = 0.0;
    foreach ($entries as $entry) {
        if (in_array(($entry['accounting_state'] ?? ''), ['disputed', 'excluded'], true)) {
            continue;
        }
        if (($entry['entry_kind'] ?? '') === 'expense') {
            $total += abs((float) ($entry['amount'] ?? 0));
        }
    }
    return money_round($total);
}

function create_notebook_batch(string $text, string $source = 'manual', string $mode = 'group', array $context = []): ?array {
    $rawText = trim(str_replace("\r", '', $text));
    if ($rawText === '') {
        return null;
    }
    return normalize_notebook_batch([
        'id' => rand_id('batch'),
        'raw_text' => $rawText,
        'entries' => parse_notebook($rawText, $mode, $context),
        'submitted_at' => now_iso(),
        'source' => $source,
        'report_id' => trim((string) ($context['report_id'] ?? '')) ?: null,
        'record_scope' => in_array(($context['record_scope'] ?? ''), ['free', 'report', 'excluded'], true) ? (string) $context['record_scope'] : 'free',
    ]);
}

function normalize_notebook_batch(array $batch, int $index = 0): array {
    $rawText = str_replace("\r", '', (string) ($batch['raw_text'] ?? $batch['notebook_text'] ?? ''));
    $entries = [];
    foreach (($batch['entries'] ?? parse_notebook($rawText)) as $entryIndex => $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $entries[] = normalize_entry($entry, $entryIndex);
    }

    return [
        'id' => (string) ($batch['id'] ?? rand_id('batch')),
        'batch_index' => $index,
        'raw_text' => $rawText,
        'entries' => $entries,
        'total_expenses' => notebook_entries_total($entries),
        'submitted_at' => (string) ($batch['submitted_at'] ?? now_iso()),
        'report_id' => trim((string) ($batch['report_id'] ?? '')) ?: null,
        'record_scope' => in_array(($batch['record_scope'] ?? ''), ['free', 'report', 'excluded'], true) ? (string) $batch['record_scope'] : 'free',
        'source' => in_array(($batch['source'] ?? ''), ['manual', 'scheduled'], true) ? (string) $batch['source'] : 'manual',
    ];
}

function normalize_notebook_trash_item(array $item, int $index = 0): array {
    $batch = normalize_notebook_batch($item['batch'] ?? $item, $index);
    $trashedAt = (string) ($item['trashed_at'] ?? now_iso());
    $baseTime = strtotime($trashedAt);
    if ($baseTime === false) {
        $baseTime = time();
    }
    $deleteAfter = (string) ($item['delete_after'] ?? gmdate('c', $baseTime + 60 * 24 * 60 * 60));
    return [
        'id' => (string) ($item['id'] ?? ('trash_' . $batch['id'])),
        'batch' => $batch,
        'trashed_at' => $trashedAt,
        'delete_after' => $deleteAfter,
        'source' => (string) ($item['source'] ?? 'manual'),
    ];
}

function restore_notebook_trash_item_for_participant(array &$participant, string $trashId): ?array {
    $trashId = trim($trashId);
    if ($trashId === '') {
        return null;
    }

    $restored = null;
    $remainingTrash = [];
    foreach (($participant['notebook_trash'] ?? []) as $index => $item) {
        if (!is_array($item)) {
            continue;
        }
        $normalized = normalize_notebook_trash_item($item, $index);
        $batchId = (string) ($normalized['batch']['id'] ?? '');
        if ($restored === null && ($normalized['id'] === $trashId || $batchId === $trashId)) {
            $restored = $normalized;
            continue;
        }
        $remainingTrash[] = $normalized;
    }

    if ($restored === null) {
        return null;
    }

    $participant['notebook_batches'] = array_values(array_filter($participant['notebook_batches'] ?? [], 'is_array'));
    $participant['notebook_batches'][] = $restored['batch'];
    $participant['notebook_trash'] = $remainingTrash;
    $participant['last_synced_at'] = now_iso();
    $participant['last_sync_source'] = 'trash-restore';

    return $restored;
}

function participant_all_entries(array $participant): array {
    $entries = [];
    foreach (($participant['notebook_batches'] ?? []) as $batch) {
        if (!is_array($batch)) {
            continue;
        }
        $entries = array_merge($entries, array_values(array_filter($batch['entries'] ?? [], 'is_array')));
    }
    return array_merge($entries, array_values(array_filter($participant['entries'] ?? [], 'is_array')));
}

function personal_report_zero_totals(string $currency = 'EUR'): array {
    return [
        'currency' => $currency,
        'opening_balance' => 0.0,
        'incoming_balance' => 0.0,
        'income_total' => 0.0,
        'expense_total' => 0.0,
        'current_balance' => 0.0,
        'record_count' => 0,
        'entry_count' => 0,
        'entries' => [],
    ];
}

function personal_report_apply_entry(array &$target, array $entry, ?array $batch = null, ?array $participant = null): void {
    $kind = (string) ($entry['entry_kind'] ?? 'note');
    if (!in_array($kind, ['contribution', 'expense'], true)) {
        return;
    }
    if (in_array(($entry['accounting_state'] ?? ''), ['disputed', 'excluded'], true)) {
        return;
    }

    $amount = abs((float) ($entry['amount'] ?? 0));
    if ($amount <= 0.009) {
        return;
    }
    if ($kind === 'contribution') {
        $target['income_total'] = money_round((float) ($target['income_total'] ?? 0) + $amount);
    } else {
        $target['expense_total'] = money_round((float) ($target['expense_total'] ?? 0) + $amount);
    }
    $target['entry_count'] = (int) ($target['entry_count'] ?? 0) + 1;
    $target['entries'][] = [
        'id' => (string) ($entry['id'] ?? ''),
        'batch_id' => $batch ? (string) ($batch['id'] ?? '') : null,
        'participant_id' => $participant ? (string) ($participant['id'] ?? '') : null,
        'raw_text' => trim((string) ($entry['raw_text'] ?? '')),
        'note' => trim((string) ($entry['note'] ?? '')),
        'amount' => money_round((float) ($entry['amount'] ?? 0)),
        'entry_kind' => $kind,
        'report_id' => trim((string) ($entry['report_id'] ?? $batch['report_id'] ?? '')) ?: null,
        'accounting_state' => (string) ($entry['accounting_state'] ?? ''),
        'created_at' => (string) ($entry['created_at'] ?? ''),
        'updated_at' => (string) ($entry['updated_at'] ?? ''),
    ];
}

function personal_report_finalize_totals(array $target): array {
    $opening = money_round((float) ($target['opening_balance'] ?? $target['incoming_balance'] ?? 0));
    $income = money_round((float) ($target['income_total'] ?? 0));
    $expenses = money_round(abs((float) ($target['expense_total'] ?? 0)));
    $target['opening_balance'] = $opening;
    $target['incoming_balance'] = $opening;
    $target['income_total'] = $income;
    $target['expense_total'] = $expenses;
    $target['current_balance'] = money_round($opening + $income - $expenses);
    $target['record_count'] = max(0, (int) ($target['record_count'] ?? 0));
    $target['entry_count'] = max(0, (int) ($target['entry_count'] ?? 0));
    $target['entries'] = array_values(array_filter($target['entries'] ?? [], 'is_array'));
    return $target;
}

function compute_personal_report_summary(array $session): array {
    $currency = trim((string) ($session['currency'] ?? 'EUR')) ?: 'EUR';
    $zero = personal_report_zero_totals($currency);
    if (normalized_session_mode($session) !== 'personal') {
        return [
            'active_report_id' => null,
            'active_report' => null,
            'active_report_totals' => $zero,
            'reports' => [],
            'active_reports' => [],
            'fixed_reports' => [],
            'unlinked' => $zero,
        ];
    }

    $reports = [];
    foreach (($session['personal_reports'] ?? []) as $report) {
        if (!is_array($report)) {
            continue;
        }
        $id = trim((string) ($report['id'] ?? ''));
        if ($id === '') {
            continue;
        }
        $reports[$id] = array_merge($report, [
            'income_total' => 0.0,
            'expense_total' => 0.0,
            'current_balance' => money_round((float) ($report['opening_balance'] ?? 0)),
            'record_count' => 0,
            'entry_count' => 0,
            'entries' => [],
        ]);
    }

    $unlinked = personal_report_zero_totals($currency);
    foreach (($session['participants'] ?? []) as $participant) {
        if (!is_array($participant)) {
            continue;
        }
        foreach (($participant['notebook_batches'] ?? []) as $batch) {
            if (!is_array($batch)) {
                continue;
            }
            $batchReportId = trim((string) ($batch['report_id'] ?? ''));
            $batchScope = (string) ($batch['record_scope'] ?? 'free');
            $countedReportBatch = false;
            $countedUnlinkedBatch = false;

            if ($batchScope === 'report' && $batchReportId !== '' && isset($reports[$batchReportId])) {
                $reports[$batchReportId]['record_count'] = (int) ($reports[$batchReportId]['record_count'] ?? 0) + 1;
                $countedReportBatch = true;
            } else {
                $unlinked['record_count'] = (int) ($unlinked['record_count'] ?? 0) + 1;
                $countedUnlinkedBatch = true;
            }

            foreach (($batch['entries'] ?? []) as $entry) {
                if (!is_array($entry)) {
                    continue;
                }
                $entryReportId = trim((string) ($entry['report_id'] ?? $batchReportId));
                $entryState = (string) ($entry['accounting_state'] ?? '');
                $isReportEntry = $entryReportId !== ''
                    && isset($reports[$entryReportId])
                    && ($entryState === 'report' || $batchScope === 'report');
                if ($isReportEntry) {
                    if (!$countedReportBatch) {
                        $reports[$entryReportId]['record_count'] = (int) ($reports[$entryReportId]['record_count'] ?? 0) + 1;
                        $countedReportBatch = true;
                    }
                    personal_report_apply_entry($reports[$entryReportId], $entry, $batch, $participant);
                    continue;
                }
                if (!$countedUnlinkedBatch && $batchScope !== 'report') {
                    $unlinked['record_count'] = (int) ($unlinked['record_count'] ?? 0) + 1;
                    $countedUnlinkedBatch = true;
                }
                personal_report_apply_entry($unlinked, $entry, $batch, $participant);
            }
        }

        $draftHasFinancialEntry = false;
        foreach (($participant['entries'] ?? []) as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $entryReportId = trim((string) ($entry['report_id'] ?? ''));
            $entryState = (string) ($entry['accounting_state'] ?? '');
            $isReportEntry = $entryReportId !== '' && isset($reports[$entryReportId]) && $entryState === 'report';
            if ($isReportEntry) {
                personal_report_apply_entry($reports[$entryReportId], $entry, null, $participant);
                continue;
            }
            $before = (int) ($unlinked['entry_count'] ?? 0);
            personal_report_apply_entry($unlinked, $entry, null, $participant);
            if ((int) ($unlinked['entry_count'] ?? 0) > $before) {
                $draftHasFinancialEntry = true;
            }
        }
        if ($draftHasFinancialEntry && trim((string) ($participant['notebook_text'] ?? '')) !== '') {
            $unlinked['record_count'] = (int) ($unlinked['record_count'] ?? 0) + 1;
        }
    }

    $finalReports = [];
    foreach ($reports as $report) {
        $finalReports[] = personal_report_finalize_totals($report);
    }
    $activeReportId = active_personal_report_id($session, $finalReports);
    $activeReport = null;
    foreach ($finalReports as $report) {
        if (($report['id'] ?? '') === $activeReportId) {
            $activeReport = $report;
            break;
        }
    }

    return [
        'active_report_id' => $activeReportId,
        'active_report' => $activeReport,
        'active_report_totals' => $activeReport ? personal_report_finalize_totals($activeReport) : $zero,
        'reports' => $finalReports,
        'active_reports' => array_values(array_filter($finalReports, static fn(array $report): bool => ($report['status'] ?? '') === 'active')),
        'fixed_reports' => array_values(array_filter($finalReports, static fn(array $report): bool => ($report['status'] ?? '') === 'fixed')),
        'unlinked' => personal_report_finalize_totals($unlinked),
    ];
}

function normalized_treasurer_expense_mode(array $session): string {
    $mode = (string) ($session['treasurer_expense_mode'] ?? 'auto');
    return in_array($mode, ['auto', 'cashbox', 'personal'], true) ? $mode : 'auto';
}

function normalized_session_mode(array $session): string {
    $mode = (string) ($session['session_mode'] ?? $session['mode'] ?? 'group');
    return in_array($mode, ['group', 'personal'], true) ? $mode : 'group';
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
        foreach (participant_all_entries($participant) as $entry) {
            if (in_array(($entry['accounting_state'] ?? ''), ['disputed', 'excluded'], true)) {
                continue;
            }
            if (($entry['entry_kind'] ?? '') === 'contribution') {
                $contributions += abs((float) ($entry['amount'] ?? 0));
            }
        }
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
        foreach (participant_all_entries($participant) as $entry) {
            if (in_array(($entry['accounting_state'] ?? ''), ['disputed', 'excluded'], true)) {
                $notes[] = $entry;
                continue;
            }
            $kind = $entry['entry_kind'] ?? 'note';
            if ($kind === 'contribution') {
                $contributions += abs((float) ($entry['amount'] ?? 0));
            } elseif ($kind === 'expense') {
                $amount = abs((float) ($entry['amount'] ?? 0));
                $entryTreasurerId = treasurer_for_entry_at($session, $entry);
                $usesCashbox = (($participant['id'] ?? '') === $entryTreasurerId) && $resolvedTreasurerMode === 'cashbox';
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
            'entries' => participant_all_entries($participant),
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

function normalize_participant_settlement_event(array $event): ?array {
    $participantId = trim((string) ($event['participant_id'] ?? ''));
    if ($participantId === '') {
        return null;
    }
    $lines = [];
    foreach (($event['lines'] ?? []) as $line) {
        if (!is_array($line)) {
            continue;
        }
        $amount = money_round((float) ($line['amount'] ?? 0));
        if ($amount <= 0) {
            continue;
        }
        $lines[] = [
            'kind' => in_array(($line['kind'] ?? ''), ['participant_transfer', 'cashbox_payout', 'cashbox_topup'], true) ? (string) $line['kind'] : 'participant_transfer',
            'from_participant_id' => (string) ($line['from_participant_id'] ?? ''),
            'from_display_name' => trim((string) ($line['from_display_name'] ?? '')),
            'to_participant_id' => (string) ($line['to_participant_id'] ?? ''),
            'to_display_name' => trim((string) ($line['to_display_name'] ?? '')),
            'amount' => $amount,
        ];
    }

    return [
        'id' => (string) ($event['id'] ?? rand_id('participant-settlement')),
        'participant_id' => $participantId,
        'display_name' => trim((string) ($event['display_name'] ?? '')) ?: 'Participant',
        'settled_at' => (string) ($event['settled_at'] ?? now_iso()),
        'currency' => trim((string) ($event['currency'] ?? 'EUR')) ?: 'EUR',
        'mode' => in_array(($event['mode'] ?? ''), ['cashbox', 'direct'], true) ? (string) $event['mode'] : 'direct',
        'outgoing' => money_round((float) ($event['outgoing'] ?? 0)),
        'incoming' => money_round((float) ($event['incoming'] ?? 0)),
        'net' => money_round((float) ($event['net'] ?? 0)),
        'share' => money_round((float) ($event['share'] ?? 0)),
        'total_expenses' => money_round((float) ($event['total_expenses'] ?? 0)),
        'lines' => $lines,
    ];
}

function default_session(string $ownerEmail = '', string $mode = 'group'): array {
    $createdAt = now_iso();
    $mode = in_array($mode, ['group', 'personal'], true) ? $mode : 'group';
    $treasurer = normalize_participant([
        'display_name' => $mode === 'personal' ? 'Personal journal' : 'Treasurer',
        'role' => 'treasurer',
        'email' => $ownerEmail,
        'active' => true,
        'included_in_split' => true,
        'cashbox_contribution' => 0,
        'authorized_at' => $createdAt,
        'notebook_text' => '',
        'entries' => [],
        'notebook_batches' => [],
    ], true);

    return [
        'id' => rand_id('cashbox'),
        'title' => $mode === 'personal' ? 'Личный журнал расходов' : 'Ship Cashbox',
        'session_mode' => $mode,
        'currency' => 'EUR',
        'owner_email' => $ownerEmail,
        'treasurer_expense_mode' => $mode === 'personal' ? 'cashbox' : 'auto',
        'schema_version' => 2,
        'cashbox_series_id' => $mode === 'personal' ? rand_id('cashbox-series') : null,
        'carryover_from_report_id' => null,
        'opening_balance_source' => 'manual',
        'personal_reports' => [],
        'status' => 'active',
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'closed_at' => null,
        'treasurer_participant_id' => $treasurer['id'],
        'treasurer_periods' => [[
            'id' => rand_id('treasurer-period'),
            'treasurer_participant_id' => $treasurer['id'],
            'started_at' => $createdAt,
            'ended_at' => null,
            'reason' => 'session_start',
        ]],
        'participants' => [$treasurer],
        'participant_settlements' => [],
        'settlement' => null,
        'exports' => [],
    ];
}

function list_json_sessions(): array {
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

function list_sessions(): array {
    if (ship_cashbox_storage_provider() === 'mongodb') {
        $sessions = array_map(
            static fn(array $session): array => normalize_session($session),
            ship_cashbox_mongodb_find_many('Sessions', [], ['sort' => ['updated_at' => -1]])
        );
        usort($sessions, static function (array $a, array $b): int {
            return strcmp((string) ($b['updated_at'] ?? ''), (string) ($a['updated_at'] ?? ''));
        });
        return $sessions;
    }
    return list_json_sessions();
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
    unset($batch);
    unset($participant);

    $treasurerPeriods = normalize_treasurer_periods($session, $treasurerId);

    $participantSettlements = [];
    foreach (($session['participant_settlements'] ?? []) as $event) {
        if (!is_array($event)) {
            continue;
        }
        $normalizedEvent = normalize_participant_settlement_event($event);
        if ($normalizedEvent) {
            $participantSettlements[] = $normalizedEvent;
        }
    }

    $sessionMode = normalized_session_mode($session);
    $currency = trim((string) ($session['currency'] ?? 'EUR')) ?: 'EUR';
    $personalReports = $sessionMode === 'personal'
        ? normalize_personal_reports(array_values(array_filter($session['personal_reports'] ?? [], 'is_array')), $currency)
        : [];
    $activePersonalReportId = $sessionMode === 'personal' ? active_personal_report_id($session, $personalReports) : null;

    return [
        'id' => (string) ($session['id'] ?? rand_id('cashbox')),
        'title' => trim((string) ($session['title'] ?? 'Ship Cashbox')) ?: 'Ship Cashbox',
        'session_mode' => $sessionMode,
        'currency' => $currency,
        'treasurer_expense_mode' => normalized_treasurer_expense_mode($session),
        'schema_version' => max(1, (int) ($session['schema_version'] ?? 1)),
        'cashbox_series_id' => trim((string) ($session['cashbox_series_id'] ?? '')) ?: ($sessionMode === 'personal' ? (string) ($session['id'] ?? rand_id('cashbox-series')) : null),
        'carryover_from_report_id' => trim((string) ($session['carryover_from_report_id'] ?? '')) ?: null,
        'opening_balance_source' => in_array(($session['opening_balance_source'] ?? ''), ['manual', 'carryover'], true) ? (string) $session['opening_balance_source'] : 'manual',
        'active_personal_report_id' => $activePersonalReportId,
        'personal_reports' => $personalReports,
        'status' => in_array($session['status'] ?? '', ['active', 'closed', 'deleted'], true) ? $session['status'] : 'active',
        'created_at' => (string) ($session['created_at'] ?? now_iso()),
        'updated_at' => (string) ($session['updated_at'] ?? now_iso()),
        'closed_at' => $session['closed_at'] ?? null,
        'deleted_at' => $session['deleted_at'] ?? null,
        'purge_after' => $session['purge_after'] ?? null,
        'owner_email' => clean_email($session['owner_email'] ?? ''),
        'treasurer_participant_id' => $treasurerId,
        'treasurer_periods' => $treasurerPeriods,
        'participants' => $participants,
        'participant_settlements' => $participantSettlements,
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
    if (ship_cashbox_storage_provider() === 'mongodb') {
        ship_cashbox_mongodb_replace_one('Sessions', ['id' => $normalized['id']], $normalized);
        return $normalized;
    }
    write_json_file(session_path($normalized['id'], $normalized['created_at']), $normalized);
    return $normalized;
}

function find_session(string $id): ?array {
    if (ship_cashbox_storage_provider() === 'mongodb') {
        $session = ship_cashbox_mongodb_find_one('Sessions', ['id' => $id]);
        return $session ? normalize_session($session) : null;
    }
    foreach (list_sessions() as $session) {
        if (($session['id'] ?? '') === $id) {
            return $session;
        }
    }
    return null;
}

function migrate_json_storage_to_mongodb(): array {
    if (ship_cashbox_storage_provider() !== 'mongodb') {
        fail('Включите SHIP_CASHBOX_STORAGE=mongodb перед миграцией', 409);
    }
    ship_cashbox_mongodb_assert_ready();
    $sessions = list_json_sessions();
    $written = 0;
    foreach ($sessions as $session) {
        $normalized = normalize_session($session);
        ship_cashbox_mongodb_replace_one('Sessions', ['id' => $normalized['id']], $normalized);
        $written++;
    }
    $index = read_json_file(INDEX_FILE) ?: ['active_session_id' => null];
    ship_cashbox_mongodb_replace_one('Index', ['key' => 'active'], array_merge($index, ['key' => 'active']));
    return [
        'storage' => ship_cashbox_storage_health(),
        'sessionsFound' => count($sessions),
        'sessionsWritten' => $written,
        'indexMigrated' => true,
    ];
}


function session_owner_email(array $session): string {
    return clean_email($session['owner_email'] ?? '');
}

function owns_session(array $session, string $ownerEmail): bool {
    $sessionOwner = session_owner_email($session);
    return $ownerEmail !== '' && ($sessionOwner === '' || $sessionOwner === $ownerEmail);
}

function require_session_owner(array $session): void {
    $ownerEmail = current_auth_email();
    if (!owns_session($session, $ownerEmail)) {
        fail('Нет доступа к этой кассе', 403);
    }
}

function normalized_payload_mode(string $mode): ?string {
    $mode = trim($mode);
    return in_array($mode, ['group', 'personal'], true) ? $mode : null;
}

function require_current_active_owner_session(string $sessionId, ?string $mode = null): array {
    $sessionId = trim($sessionId);
    if ($sessionId === '') {
        fail('Не указан текущий журнал', 422);
    }
    $session = find_session($sessionId);
    if (!$session) {
        fail('Текущий журнал не найден', 404);
    }
    require_session_owner($session);
    if (($session['status'] ?? '') !== 'active') {
        fail('Этот журнал уже закрыт', 409);
    }
    if ($mode !== null && normalized_session_mode($session) !== $mode) {
        fail('Журнал открыт в другом режиме', 409);
    }
    return $session;
}

function require_group_session(array $session): void {
    if (normalized_session_mode($session) === 'personal') {
        fail('Эта операция доступна только для групповой кассы', 409);
    }
}

function find_active_session_for_owner(string $ownerEmail, ?string $mode = null): ?array {
    $mode = in_array($mode, ['group', 'personal'], true) ? $mode : null;
    $legacy = null;
    foreach (list_sessions() as $session) {
        if (($session['status'] ?? '') !== 'active') {
            continue;
        }
        if ($mode !== null && normalized_session_mode($session) !== $mode) {
            continue;
        }
        $sessionOwner = session_owner_email($session);
        if ($sessionOwner !== '' && $sessionOwner === $ownerEmail) {
            return $session;
        }
        if ($sessionOwner === '' && $legacy === null) {
            $legacy = $session;
        }
    }
    return $legacy;
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

function find_session_by_invite_code(string $code): ?array {
    $code = preg_replace('/\D+/', '', $code) ?? '';
    if (!preg_match('/^\d{6}$/', $code)) {
        return null;
    }
    $hash = hash('sha256', $code);
    $now = time();
    foreach (list_sessions() as $session) {
        if (($session['status'] ?? '') !== 'active') {
            continue;
        }
        foreach (($session['participants'] ?? []) as $participant) {
            $storedHash = (string) ($participant['invite_code_hash'] ?? '');
            if ($storedHash === '' || !hash_equals($storedHash, $hash)) {
                continue;
            }
            $expiresAt = strtotime((string) ($participant['invite_code_expires_at'] ?? '')) ?: 0;
            if ($expiresAt > 0 && $expiresAt < $now) {
                return null;
            }
            return $session;
        }
    }
    return null;
}

function find_participant_by_invite_code(array $session, string $code): ?array {
    $hash = hash('sha256', preg_replace('/\D+/', '', $code) ?? '');
    foreach (($session['participants'] ?? []) as $participant) {
        $storedHash = (string) ($participant['invite_code_hash'] ?? '');
        if ($storedHash !== '' && hash_equals($storedHash, $hash)) {
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

function build_treasurer_payload(?array $session, ?string $archiveMode = null): array {
    $archive = [];
    $archiveMode = normalized_payload_mode((string) ($archiveMode ?? ''));
    if ($archiveMode === null && $session) {
        $archiveMode = normalized_session_mode($session);
    }

    foreach (list_sessions() as $item) {
        $itemStatus = (string) ($item['status'] ?? '');
        if (!in_array($itemStatus, ['closed', 'deleted'], true)) {
            continue;
        }
        if ($itemStatus === 'deleted') {
            $purgeAfter = strtotime((string) ($item['purge_after'] ?? '')) ?: 0;
            if ($purgeAfter > 0 && $purgeAfter < time()) {
                continue;
            }
        }
        $itemMode = normalized_session_mode($item);
        if ($archiveMode !== null && $itemMode !== $archiveMode) {
            continue;
        }
        $itemTotals = compute_totals($item);
        $archive[] = [
            'id' => $item['id'],
            'title' => $item['title'],
            'session_mode' => $itemMode,
            'status' => $itemStatus,
            'currency' => $item['currency'],
            'closed_at' => $item['closed_at'],
            'deleted_at' => $item['deleted_at'] ?? null,
            'purge_after' => $item['purge_after'] ?? null,
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
    $personalReportSummary = compute_personal_report_summary($session);
    $settlementLines = $totals['settlement_mode'] === 'cashbox'
        ? build_cashbox_settlement_lines($totals['participants'], (string) $session['treasurer_participant_id'])
        : build_direct_settlement_lines($totals['participants'], 'direct_balance');

    return [
        'session' => [
            'id' => $session['id'],
            'title' => $session['title'],
            'session_mode' => normalized_session_mode($session),
            'currency' => $session['currency'],
            'treasurer_expense_mode' => normalized_treasurer_expense_mode($session),
            'treasurer_expense_mode_resolved' => $totals['treasurer_expense_mode_resolved'],
            'status' => $session['status'],
            'cashbox_series_id' => $session['cashbox_series_id'] ?? null,
            'carryover_from_report_id' => $session['carryover_from_report_id'] ?? null,
            'opening_balance_source' => $session['opening_balance_source'] ?? 'manual',
            'active_personal_report_id' => $personalReportSummary['active_report_id'] ?? ($session['active_personal_report_id'] ?? null),
            'personal_reports' => $personalReportSummary['reports'] ?? ($session['personal_reports'] ?? []),
            'personal_report_summary' => $personalReportSummary,
            'created_at' => $session['created_at'],
            'updated_at' => $session['updated_at'],
            'closed_at' => $session['closed_at'],
            'treasurer_participant_id' => $session['treasurer_participant_id'],
            'treasurer_periods' => $session['treasurer_periods'] ?? [],
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
                    'email' => clean_email($participant['email'] ?? ''),
                    'active' => $participant['active'],
                    'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
                    'cashbox_contribution' => money_input($participant['cashbox_contribution'] ?? 0),
                    'authorized_at' => $participant['authorized_at'] ?? null,
                    'invite_sent_at' => $participant['invite_sent_at'] ?? null,
                    'invite_last_error' => $participant['invite_last_error'] ?? null,
                    'invite_token' => $participant['invite_token'],
                    'invite_link' => build_invite_link($participant['invite_token']),
                    'notebook_text' => $participant['notebook_text'],
                    'notebook_hash' => $participant['notebook_hash'] ?? notebook_hash((string) ($participant['notebook_text'] ?? '')),
	                    'last_synced_at' => $participant['last_synced_at'] ?? null,
	                    'last_sync_source' => $participant['last_sync_source'] ?? '',
	                    'settled_left_at' => $participant['settled_left_at'] ?? null,
	                    'settlement_event_id' => $participant['settlement_event_id'] ?? null,
                    'entries' => $summary['entries'],
                    'notebook_batches' => $participant['notebook_batches'] ?? [],
                    'notebook_trash' => $participant['notebook_trash'] ?? [],
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
            'participant_settlements' => $session['participant_settlements'] ?? [],
            'settlement' => $session['settlement'] ?? null,
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
            'email' => clean_email($participant['email'] ?? ''),
            'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
            'cashbox_contribution' => money_input($participant['cashbox_contribution'] ?? 0),
            'authorized_at' => $participant['authorized_at'] ?? null,
            'notebook_text' => $participant['notebook_text'],
            'entries' => $summary['entries'],
            'notebook_batches' => $participant['notebook_batches'] ?? [],
            'notebook_trash' => $participant['notebook_trash'] ?? [],
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
            'directory' => [],
            'viewing' => [
                'id' => $participant['id'],
                'display_name' => $participant['display_name'],
                'role' => $participant['role'],
                'email' => clean_email($participant['email'] ?? ''),
                'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
                'cashbox_contribution' => money_input($participant['cashbox_contribution'] ?? 0),
                'authorized_at' => $participant['authorized_at'] ?? null,
                'notebook_text' => $participant['notebook_text'],
                'entries' => $summary['entries'],
                'notebook_batches' => $participant['notebook_batches'] ?? [],
                'notebook_trash' => $participant['notebook_trash'] ?? [],
                'contributions' => $summary['contributions'],
                'expenses' => $summary['expenses'],
                'personal_expenses' => $summary['personal_expenses'],
                'cashbox_expenses' => $summary['cashbox_expenses'],
                'balance' => $summary['balance'],
                'read_only' => (($session['status'] ?? '') === 'closed'),
                'is_self' => true,
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

function build_invite_code_link(string $code): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:18090';
    $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/ship-cashbox/api/index.php')), '/');
    return $scheme . '://' . $host . $base . '/index.html?inviteCode=' . rawurlencode($code);
}

function generate_invite_code(): string {
    return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function save_session_meta(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);

    $inputParticipants = array_values(array_filter($payload['participants'] ?? [], 'is_array'));
    if (!$inputParticipants) {
        fail('Добавьте хотя бы одного участника', 422);
    }

    $existing = [];
    foreach ($session['participants'] as $participant) {
        $existing[$participant['id']] = $participant;
    }
    if (normalized_session_mode($session) === 'personal') {
        foreach ($inputParticipants as $item) {
            $id = trim((string) ($item['id'] ?? ''));
            if ($id === '' || !isset($existing[$id])) {
                fail('Личный журнал не поддерживает добавление участников', 409);
            }
        }
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
            'email' => clean_email($item['email'] ?? ($base['email'] ?? '')),
            'active' => array_key_exists('active', $item) ? (bool) $item['active'] : true,
            'included_in_split' => $role === 'treasurer'
                ? bool_value($item['included_in_split'] ?? ($base['included_in_split'] ?? true), true)
                : true,
            'cashbox_contribution' => $role === 'treasurer' && !bool_value($item['included_in_split'] ?? ($base['included_in_split'] ?? true), true)
                ? 0
                : money_input($item['cashbox_contribution'] ?? ($base['cashbox_contribution'] ?? 0)),
            'authorized_at' => $base['authorized_at'] ?? ($role === 'treasurer' ? now_iso() : null),
            'invite_sent_at' => $base['invite_sent_at'] ?? null,
            'invite_last_error' => $base['invite_last_error'] ?? null,
            'invite_token' => $base['invite_token'] ?? null,
            'invite_code_hash' => $base['invite_code_hash'] ?? '',
            'invite_code_expires_at' => $base['invite_code_expires_at'] ?? null,
            'invite_code_sent_at' => $base['invite_code_sent_at'] ?? null,
            'invite_code_used_at' => $base['invite_code_used_at'] ?? null,
            'joined_at' => $base['joined_at'] ?? null,
            'notebook_text' => $base['notebook_text'] ?? '',
            'notebook_hash' => $base['notebook_hash'] ?? null,
            'last_synced_at' => $base['last_synced_at'] ?? null,
            'last_sync_source' => $base['last_sync_source'] ?? '',
            'entries' => $base['entries'] ?? [],
            'notebook_batches' => $base['notebook_batches'] ?? [],
            'notebook_trash' => $base['notebook_trash'] ?? [],
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

	    $submittedIds = array_column($participants, 'id');
	    foreach ($session['participants'] as $existingParticipant) {
	        $existingId = (string) ($existingParticipant['id'] ?? '');
	        if ($existingId === '' || in_array($existingId, $submittedIds, true)) {
	            continue;
	        }
	        if (($existingParticipant['active'] ?? true) === false) {
	            $participants[] = normalize_participant($existingParticipant, false);
	            $submittedIds[] = $existingId;
	        }
	    }

	    $treasurerCandidate = null;
	    foreach ($participants as $participant) {
	        if (($participant['id'] ?? '') === $treasurerId) {
	            $treasurerCandidate = $participant;
	            break;
	        }
	    }
	    if (
	        !$treasurerCandidate
	        || !($treasurerCandidate['active'] ?? true)
	        || !empty($treasurerCandidate['settlement_event_id'])
	        || !empty($treasurerCandidate['settled_left_at'])
	    ) {
	        fail('Казначеем может быть только активный член экипажа', 422);
	    }

	    foreach ($participants as &$participant) {
	        $participant['role'] = $participant['id'] === $treasurerId ? 'treasurer' : 'participant';
	    }
    unset($participant);

    $session['title'] = trim((string) ($payload['title'] ?? $session['title'])) ?: 'Ship Cashbox';
    $session['currency'] = trim((string) ($payload['currency'] ?? $session['currency'])) ?: 'EUR';
    if (session_owner_email($session) === '') {
        $session['owner_email'] = current_auth_email();
    }
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

function start_personal_report(array $payload): array {
    $sessionId = trim((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    if ($sessionId !== '') {
        $session = require_current_active_owner_session($sessionId, 'personal');
    } else {
        $session = find_active_session_for_owner(current_auth_email(), 'personal');
        if (!$session || ($session['status'] ?? '') !== 'active') {
            fail('Активный личный журнал не найден', 404);
        }
        require_session_owner($session);
    }
    if (normalized_session_mode($session) !== 'personal') {
        fail('Отчет можно начать только в личном журнале', 409);
    }

    $now = now_iso();
    $title = trim((string) ($payload['title'] ?? ''));
    $periodStart = trim((string) ($payload['period_start'] ?? $payload['opened_at'] ?? '')) ?: $now;
    $report = normalize_personal_report([
        'id' => rand_id('report'),
        'title' => $title !== '' ? $title : 'Личный отчет',
        'status' => 'active',
        'currency' => $session['currency'] ?? 'EUR',
        'opening_balance' => money_input($payload['opening_balance'] ?? $payload['incoming_balance'] ?? 0),
        'opening_balance_source' => in_array(($payload['opening_balance_source'] ?? ''), ['manual', 'carryover'], true)
            ? (string) $payload['opening_balance_source']
            : 'manual',
        'period_start' => $periodStart,
        'opened_at' => $periodStart,
        'created_at' => $now,
        'updated_at' => $now,
        'carryover_from_report_id' => trim((string) ($payload['carryover_from_report_id'] ?? '')) ?: null,
    ]);

    $reports = array_values(array_filter($session['personal_reports'] ?? [], 'is_array'));
    $reports[] = $report;
    $session['personal_reports'] = $reports;
    $session['active_personal_report_id'] = $report['id'];
    $session['opening_balance_source'] = $report['opening_balance_source'];
    if ($report['carryover_from_report_id']) {
        $session['carryover_from_report_id'] = $report['carryover_from_report_id'];
    }

    if (bool_value($payload['dry_run'] ?? false, false)) {
        return normalize_session($session);
    }
    return save_session($session);
}

function select_personal_report(array $payload): array {
    $sessionId = trim((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    $reportId = trim((string) ($payload['report_id'] ?? $payload['id_report'] ?? ''));
    if ($reportId === '') {
        fail('Не указан отчет', 422);
    }
    if ($sessionId !== '') {
        $session = require_current_active_owner_session($sessionId, 'personal');
    } else {
        $session = find_active_session_for_owner(current_auth_email(), 'personal');
        if (!$session || ($session['status'] ?? '') !== 'active') {
            fail('Активный личный журнал не найден', 404);
        }
        require_session_owner($session);
    }
    if (normalized_session_mode($session) !== 'personal') {
        fail('Отчет можно выбрать только в личном журнале', 409);
    }

    $found = null;
    foreach (($session['personal_reports'] ?? []) as $report) {
        if (!is_array($report)) {
            continue;
        }
        if (($report['id'] ?? '') === $reportId) {
            $found = normalize_personal_report($report);
            break;
        }
    }
    if (!$found || ($found['status'] ?? '') !== 'active') {
        fail('Активный отчет не найден', 404);
    }

    $session['active_personal_report_id'] = $reportId;
    if (bool_value($payload['dry_run'] ?? false, false)) {
        return normalize_session($session);
    }
    return save_session($session);
}

function attach_personal_record_to_report(array $payload): array {
    $sessionId = trim((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    $batchId = trim((string) ($payload['batch_id'] ?? ''));
    if ($batchId === '') {
        fail('Не указана запись', 422);
    }
    if ($sessionId !== '') {
        $session = require_current_active_owner_session($sessionId, 'personal');
    } else {
        $session = find_active_session_for_owner(current_auth_email(), 'personal');
        if (!$session || ($session['status'] ?? '') !== 'active') {
            fail('Активный личный журнал не найден', 404);
        }
        require_session_owner($session);
    }
    if (normalized_session_mode($session) !== 'personal') {
        fail('Запись можно подключить только в личном журнале', 409);
    }

    $reportId = trim((string) ($payload['report_id'] ?? $session['active_personal_report_id'] ?? ''));
    if ($reportId === '') {
        fail('Сначала начните или выберите отчет', 409);
    }
    $reportFound = false;
    foreach (($session['personal_reports'] ?? []) as $report) {
        if (!is_array($report)) {
            continue;
        }
        if (($report['id'] ?? '') === $reportId && normalize_personal_report_status((string) ($report['status'] ?? 'active')) === 'active') {
            $reportFound = true;
            break;
        }
    }
    if (!$reportFound) {
        fail('Активный отчет не найден', 404);
    }

    $attached = false;
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== ($session['treasurer_participant_id'] ?? '')) {
            continue;
        }
        foreach (($participant['notebook_batches'] ?? []) as &$batch) {
            if (!is_array($batch) || ($batch['id'] ?? '') !== $batchId) {
                continue;
            }
            $batch['report_id'] = $reportId;
            $batch['record_scope'] = 'report';
            $entries = [];
            foreach (($batch['entries'] ?? []) as $entryIndex => $entry) {
                if (!is_array($entry)) {
                    continue;
                }
                $entry = normalize_entry($entry, $entryIndex);
                $entry['report_id'] = $reportId;
                if (!in_array(($entry['accounting_state'] ?? ''), ['disputed', 'excluded'], true) && in_array(($entry['entry_kind'] ?? ''), ['contribution', 'expense'], true)) {
                    $entry['accounting_state'] = 'report';
                }
                $entries[] = $entry;
            }
            $batch['entries'] = $entries;
            $batch = normalize_notebook_batch($batch);
            $attached = true;
            break 2;
        }
    }
    unset($batch);
    unset($participant);

    if (!$attached) {
        fail('Запись не найдена', 404);
    }
    $session['active_personal_report_id'] = $reportId;
    if (bool_value($payload['dry_run'] ?? false, false)) {
        return normalize_session($session);
    }
    return save_session($session);
}

function fix_personal_report(array $payload): array {
    $sessionId = trim((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    if ($sessionId !== '') {
        $session = require_current_active_owner_session($sessionId, 'personal');
    } else {
        $session = find_active_session_for_owner(current_auth_email(), 'personal');
        if (!$session || ($session['status'] ?? '') !== 'active') {
            fail('Активный личный журнал не найден', 404);
        }
        require_session_owner($session);
    }
    if (normalized_session_mode($session) !== 'personal') {
        fail('Отчет можно закрепить только в личном журнале', 409);
    }
    $reportId = trim((string) ($payload['report_id'] ?? $session['active_personal_report_id'] ?? ''));
    if ($reportId === '') {
        fail('Сначала начните или выберите отчет', 409);
    }

    $summary = compute_personal_report_summary($session);
    $reportTotals = null;
    foreach (($summary['reports'] ?? []) as $item) {
        if (is_array($item) && ($item['id'] ?? '') === $reportId) {
            $reportTotals = $item;
            break;
        }
    }
    if (!$reportTotals || (int) ($reportTotals['record_count'] ?? 0) <= 0 && (int) ($reportTotals['entry_count'] ?? 0) <= 0) {
        fail('Пустой отчет нельзя закрепить', 409);
    }

    $now = now_iso();
    $fixed = false;
    $nextActiveReportId = null;
    foreach (($session['personal_reports'] ?? []) as &$report) {
        if (!is_array($report)) {
            continue;
        }
        if (($report['id'] ?? '') === $reportId) {
            $report = normalize_personal_report(array_merge($report, [
                'status' => 'fixed',
                'period_end' => trim((string) ($payload['period_end'] ?? $payload['closed_at'] ?? '')) ?: $now,
                'closed_at' => trim((string) ($payload['closed_at'] ?? '')) ?: $now,
                'fixed_at' => $now,
                'updated_at' => $now,
            ]));
            $fixed = true;
            continue;
        }
        if ($nextActiveReportId === null && normalize_personal_report_status((string) ($report['status'] ?? 'active')) === 'active') {
            $nextActiveReportId = (string) ($report['id'] ?? '');
        }
    }
    unset($report);
    if (!$fixed) {
        fail('Активный отчет не найден', 404);
    }

    $session['active_personal_report_id'] = $nextActiveReportId ?: null;
    if ($reportId) {
        $session['carryover_from_report_id'] = $reportId;
    }
    if (bool_value($payload['dry_run'] ?? false, false)) {
        return normalize_session($session);
    }
    return save_session($session);
}

function restore_personal_report(array $payload): array {
    $sessionId = trim((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    if ($sessionId !== '') {
        $session = require_current_active_owner_session($sessionId, 'personal');
    } else {
        $session = find_active_session_for_owner(current_auth_email(), 'personal');
        if (!$session || ($session['status'] ?? '') !== 'active') {
            fail('Активный личный журнал не найден', 404);
        }
        require_session_owner($session);
    }
    if (normalized_session_mode($session) !== 'personal') {
        fail('Отчет можно вернуть только в личном журнале', 409);
    }
    $reportId = trim((string) ($payload['report_id'] ?? ''));
    if ($reportId === '') {
        fail('Не указан отчет', 422);
    }

    $restored = false;
    $now = now_iso();
    foreach (($session['personal_reports'] ?? []) as &$report) {
        if (!is_array($report) || ($report['id'] ?? '') !== $reportId) {
            continue;
        }
        if (normalize_personal_report_status((string) ($report['status'] ?? 'active')) !== 'fixed') {
            fail('Закрепленный отчет не найден', 404);
        }
        $report = normalize_personal_report(array_merge($report, [
            'status' => 'active',
            'period_end' => null,
            'closed_at' => null,
            'fixed_at' => null,
            'updated_at' => $now,
        ]));
        $restored = true;
        break;
    }
    unset($report);
    if (!$restored) {
        fail('Закрепленный отчет не найден', 404);
    }

    $session['active_personal_report_id'] = $reportId;
    if (bool_value($payload['dry_run'] ?? false, false)) {
        return normalize_session($session);
    }
    return save_session($session);
}

function save_notebook_text(string $token, string $text, string $source = 'manual', bool $submit = false): array {
    $session = find_session_by_token($token);
    if (!$session) {
        fail('Инвайт не найден', 404);
    }
    if (($session['status'] ?? '') !== 'active') {
        fail('Касса уже закрыта', 409);
    }

    $source = in_array($source, ['manual', 'scheduled'], true) ? $source : 'manual';
    $mode = normalized_session_mode($session);
    $text = str_replace("\r", '', $text);
    $incomingHash = notebook_hash($text);

    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        if ($submit) {
            $batch = create_notebook_batch($text, $source, $mode);
            if (!$batch) {
                fail('Сначала внесите строки расходов', 422);
            }
            $participant['notebook_batches'] = array_values(array_filter($participant['notebook_batches'] ?? [], 'is_array'));
            $participant['notebook_batches'][] = $batch;
            $participant['notebook_text'] = '';
            $participant['notebook_hash'] = notebook_hash('');
            $participant['entries'] = [];
            $participant['joined_at'] = $participant['joined_at'] ?: now_iso();
            $participant['authorized_at'] = $participant['authorized_at'] ?? now_iso();
            $participant['last_synced_at'] = now_iso();
            $participant['last_sync_source'] = $source;
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
        $participant['entries'] = parse_notebook($participant['notebook_text'], $mode);
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
    $payload['sync_result'] = $submit ? 'submitted' : 'updated';
    return $payload;
}

function restore_notebook_batch_by_token(string $token, string $batchId): array {
    $session = find_session_by_token($token);
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    $mode = normalized_session_mode($session);

    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        $restoredText = '';
        $remaining = [];
        foreach (($participant['notebook_batches'] ?? []) as $batch) {
            $normalized = is_array($batch) ? normalize_notebook_batch($batch) : null;
            if ($normalized && $normalized['id'] === $batchId && $restoredText === '') {
                $restoredText = $normalized['raw_text'];
                continue;
            }
            if ($normalized) {
                $remaining[] = $normalized;
            }
        }
        if ($restoredText === '') {
            fail('Запись не найдена', 404);
        }
        $currentText = str_replace("\r", '', (string) ($participant['notebook_text'] ?? ''));
        $participant['notebook_text'] = trim($currentText) === '' ? $restoredText : trim($currentText) . "\n" . $restoredText;
        $participant['notebook_hash'] = notebook_hash($participant['notebook_text']);
        $participant['entries'] = parse_notebook($participant['notebook_text'], $mode);
        $participant['notebook_batches'] = $remaining;
        $participant['last_synced_at'] = now_iso();
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    $saved = save_session($session);
    $participant = find_participant_by_token($saved, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $payload = build_participant_payload($saved, $participant);
    $payload['sync_result'] = 'restored';
    return $payload;
}

function trash_notebook_batch_by_token(string $token, string $batchId): array {
    $session = find_session_by_token($token);
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }

    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        $remaining = [];
        $trashedBatch = null;
        foreach (($participant['notebook_batches'] ?? []) as $batch) {
            $normalized = is_array($batch) ? normalize_notebook_batch($batch) : null;
            if ($normalized && $normalized['id'] === $batchId && $trashedBatch === null) {
                $trashedBatch = $normalized;
                continue;
            }
            if ($normalized) {
                $remaining[] = $normalized;
            }
        }
        if (!$trashedBatch) {
            fail('Запись не найдена', 404);
        }
        $trashedAt = now_iso();
        $participant['notebook_batches'] = $remaining;
        $participant['notebook_trash'] = array_values(array_filter($participant['notebook_trash'] ?? [], 'is_array'));
        $participant['notebook_trash'][] = normalize_notebook_trash_item([
            'batch' => $trashedBatch,
            'trashed_at' => $trashedAt,
            'delete_after' => gmdate('c', time() + 60 * 24 * 60 * 60),
            'source' => 'manual',
        ]);
        $participant['last_synced_at'] = $trashedAt;
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    $saved = save_session($session);
    $participant = find_participant_by_token($saved, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $payload = build_participant_payload($saved, $participant);
    $payload['sync_result'] = 'trashed';
    return $payload;
}

function restore_notebook_trash_by_token(string $token, string $trashId): array {
    $session = find_session_by_token($token);
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }

    $restored = null;
    foreach ($session['participants'] as &$participant) {
        if (($participant['invite_token'] ?? '') !== $token) {
            continue;
        }
        $restored = restore_notebook_trash_item_for_participant($participant, $trashId);
        break;
    }
    unset($participant);

    if (!$restored) {
        fail('Запись в корзине не найдена', 404);
    }

    $saved = save_session($session);
    $participant = find_participant_by_token($saved, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $payload = build_participant_payload($saved, $participant);
    $payload['sync_result'] = 'trash-restored';
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

function authorize_participant_by_code(string $code): array {
    $code = preg_replace('/\D+/', '', $code) ?? '';
    if (!preg_match('/^\d{6}$/', $code)) {
        fail('Введите 6 цифр кода приглашения', 422);
    }
    $session = find_session_by_invite_code($code);
    if (!$session) {
        fail('Код приглашения не найден или устарел', 404);
    }
    $participant = find_participant_by_invite_code($session, $code);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    $token = (string) ($participant['invite_token'] ?? '');
    foreach ($session['participants'] as &$item) {
        if (($item['invite_token'] ?? '') !== $token) {
            continue;
        }
        $item['authorized_at'] = $item['authorized_at'] ?? now_iso();
        $item['joined_at'] = $item['joined_at'] ?: now_iso();
        $item['invite_code_used_at'] = now_iso();
    }
    unset($item);

    $saved = save_session($session);
    $participant = find_participant_by_token($saved, $token);
    if (!$participant) {
        fail('Участник не найден', 404);
    }
    return build_participant_payload($saved, $participant);
}

function save_treasurer_notebook(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);

    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    $submit = bool_value($payload['submit'] ?? false, false);
    $mode = normalized_session_mode($session);
    $notebookContext = notebook_context_from_payload($payload);
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $treasurerId) {
            continue;
        }
        $text = str_replace("\r", '', (string) ($payload['notebook_text'] ?? ''));
        if ($submit) {
            $batch = create_notebook_batch($text, 'manual', $mode, $notebookContext);
            if (!$batch) {
                fail('Сначала внесите строки расходов', 422);
            }
            $participant['notebook_batches'] = array_values(array_filter($participant['notebook_batches'] ?? [], 'is_array'));
            $participant['notebook_batches'][] = $batch;
            $participant['notebook_text'] = '';
        } else {
            $participant['notebook_text'] = $text;
        }
        $participant['notebook_hash'] = notebook_hash($participant['notebook_text']);
        $participant['entries'] = parse_notebook_preserving_entries($participant['notebook_text'], $participant['entries'] ?? [], $mode, $notebookContext);
        $participant['last_synced_at'] = now_iso();
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    return save_session($session);
}

function restore_treasurer_notebook_batch(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    $mode = normalized_session_mode($session);
    $batchId = trim((string) ($payload['batch_id'] ?? ''));
    if ($batchId === '') {
        fail('Нужен id записи', 422);
    }

    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $treasurerId) {
            continue;
        }
        $restoredText = '';
        $remaining = [];
        foreach (($participant['notebook_batches'] ?? []) as $batch) {
            $normalized = is_array($batch) ? normalize_notebook_batch($batch) : null;
            if ($normalized && $normalized['id'] === $batchId && $restoredText === '') {
                $restoredText = $normalized['raw_text'];
                continue;
            }
            if ($normalized) {
                $remaining[] = $normalized;
            }
        }
        if ($restoredText === '') {
            fail('Запись не найдена', 404);
        }
        $currentText = str_replace("\r", '', (string) ($participant['notebook_text'] ?? ''));
        $participant['notebook_text'] = trim($currentText) === '' ? $restoredText : trim($currentText) . "\n" . $restoredText;
        $participant['notebook_hash'] = notebook_hash($participant['notebook_text']);
        $participant['entries'] = parse_notebook_preserving_entries($participant['notebook_text'], $participant['entries'] ?? [], $mode);
        $participant['notebook_batches'] = $remaining;
        $participant['last_synced_at'] = now_iso();
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    return save_session($session);
}

function trash_treasurer_notebook_batch(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    $batchId = trim((string) ($payload['batch_id'] ?? ''));
    if ($batchId === '') {
        fail('Нужен id записи', 422);
    }

    $treasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $treasurerId) {
            continue;
        }
        $remaining = [];
        $trashedBatch = null;
        foreach (($participant['notebook_batches'] ?? []) as $batch) {
            $normalized = is_array($batch) ? normalize_notebook_batch($batch) : null;
            if ($normalized && $normalized['id'] === $batchId && $trashedBatch === null) {
                $trashedBatch = $normalized;
                continue;
            }
            if ($normalized) {
                $remaining[] = $normalized;
            }
        }
        if (!$trashedBatch) {
            fail('Запись не найдена', 404);
        }
        $trashedAt = now_iso();
        $participant['notebook_batches'] = $remaining;
        $participant['notebook_trash'] = array_values(array_filter($participant['notebook_trash'] ?? [], 'is_array'));
        $participant['notebook_trash'][] = normalize_notebook_trash_item([
            'batch' => $trashedBatch,
            'trashed_at' => $trashedAt,
            'delete_after' => gmdate('c', time() + 60 * 24 * 60 * 60),
            'source' => 'manual',
        ]);
        $participant['last_synced_at'] = $trashedAt;
        $participant['last_sync_source'] = 'manual';
    }
    unset($participant);

    return save_session($session);
}

function restore_notebook_trash_by_owner(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? $payload['session_id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);

    $trashId = trim((string) ($payload['trash_id'] ?? $payload['batch_id'] ?? ''));
    if ($trashId === '') {
        fail('Нужен id записи в корзине', 422);
    }

    $participantId = trim((string) ($payload['participant_id'] ?? ''));
    $restored = null;
    foreach ($session['participants'] as &$participant) {
        if ($participantId !== '' && (string) ($participant['id'] ?? '') !== $participantId) {
            continue;
        }
        $restored = restore_notebook_trash_item_for_participant($participant, $trashId);
        if ($restored) {
            break;
        }
    }
    unset($participant);

    if (!$restored) {
        fail('Запись в корзине не найдена', 404);
    }

    return save_session($session);
}

function create_new_session(array $payload = []): array {
    $ownerEmail = current_auth_email();
    $mode = in_array(($payload['mode'] ?? $payload['session_mode'] ?? ''), ['group', 'personal'], true)
        ? (string) ($payload['mode'] ?? $payload['session_mode'])
        : 'group';
    $current = find_active_session_for_owner($ownerEmail, $mode);
    if ($current && ($current['status'] ?? '') === 'active') {
        fail($mode === 'personal' ? 'У вас уже есть активный личный журнал' : 'У вас уже есть активная судовая касса', 409);
    }
    $session = default_session($ownerEmail, $mode);
    if (trim((string) ($payload['title'] ?? '')) !== '') {
        $session['title'] = trim((string) $payload['title']);
    }
    if (trim((string) ($payload['currency'] ?? '')) !== '') {
        $session['currency'] = trim((string) $payload['currency']);
    }
    if ($mode === 'personal') {
        $session['treasurer_expense_mode'] = 'cashbox';
        $session['participants'][0]['cashbox_contribution'] = max(0, money_input($payload['opening_balance'] ?? 0));
        $session['participants'][0]['display_name'] = trim((string) ($payload['display_name'] ?? '')) ?: 'Personal journal';
    }
    $saved = save_session($session);
    write_index(['active_session_id' => $saved['id']]);
    return $saved;
}

function account_profile_payload(): array {
    $profile = current_auth_profile();
    return [
        'authenticated' => authenticated(),
        'email' => current_auth_email(),
        'display_name' => trim((string) ($profile['displayName'] ?? '')),
        'local' => is_local_request() || has_local_auth_cookie(),
    ];
}

function participant_matches_account(array $participant, string $accountEmail): bool {
    $accountEmail = clean_email($accountEmail);
    if ($accountEmail === '') {
        return false;
    }
    $participantEmail = clean_email($participant['email'] ?? '');
    $linkedEmail = clean_email($participant['account_email'] ?? '');
    return $participantEmail === $accountEmail || $linkedEmail === $accountEmail;
}

function workspace_summary(array $session, string $relation, ?array $participant = null): array {
    $mode = normalized_session_mode($session);
    return [
        'id' => (string) ($session['id'] ?? ''),
        'title' => trim((string) ($session['title'] ?? 'Ship Cashbox')) ?: 'Ship Cashbox',
        'session_mode' => $mode,
        'status' => (string) ($session['status'] ?? 'active'),
        'currency' => trim((string) ($session['currency'] ?? 'EUR')) ?: 'EUR',
        'relation' => $relation,
        'role' => $participant ? (string) ($participant['role'] ?? 'participant') : ($relation === 'owned' ? 'owner' : 'member'),
        'participant_id' => $participant ? (string) ($participant['id'] ?? '') : '',
        'owner_email' => session_owner_email($session),
        'created_at' => (string) ($session['created_at'] ?? ''),
        'updated_at' => (string) ($session['updated_at'] ?? ''),
        'closed_at' => $session['closed_at'] ?? null,
        'open_action' => $relation === 'owned' ? 'open-workspace:owner' : 'open-workspace:membership',
    ];
}

function account_workspaces_payload(): array {
    $account = account_profile_payload();
    $email = clean_email($account['email'] ?? '');
    $owned = [];
    $memberships = [];

    foreach (list_sessions() as $session) {
        $ownerEmail = session_owner_email($session);
        $isOwned = $ownerEmail !== '' && $ownerEmail === $email;
        $isLegacyOwned = $ownerEmail === '' && $email !== '' && (bool) ($account['local'] ?? false);
        if ($isOwned || $isLegacyOwned) {
            $owned[] = workspace_summary($session, 'owned');
            continue;
        }

        foreach (($session['participants'] ?? []) as $participant) {
            if (!participant_matches_account($participant, $email)) {
                continue;
            }
            $memberships[] = workspace_summary($session, 'membership', $participant);
        }
    }

    $activeOwned = array_values(array_filter($owned, static fn(array $item): bool => ($item['status'] ?? '') === 'active'));
    $activeMemberships = array_values(array_filter($memberships, static fn(array $item): bool => ($item['status'] ?? '') === 'active'));

    return [
        'account' => $account,
        'workspaces' => [
            'owned' => $owned,
            'owned_active' => $activeOwned,
            'memberships' => $memberships,
            'membership_active' => $activeMemberships,
        ],
        'connectors' => [
            'list' => 'account-workspaces',
            'open_owner' => 'open-workspace',
            'open_membership' => 'open-workspace',
            'invite_preview' => 'account-invite-preview',
            'create_parallel_owner_workspace' => 'create-account-workspace',
        ],
        'capabilities' => [
            'parallel_owner_workspaces' => true,
            'membership_context' => true,
            'invite_claim_preview' => true,
            'invite_claim_binding' => false,
            'legacy_boot_unchanged' => true,
        ],
    ];
}

function find_account_participant_in_session(array $session, string $accountEmail, string $participantId = '', string $token = ''): ?array {
    foreach (($session['participants'] ?? []) as $participant) {
        $matchesTarget = true;
        if ($participantId !== '') {
            $matchesTarget = (string) ($participant['id'] ?? '') === $participantId;
        } elseif ($token !== '') {
            $matchesTarget = (string) ($participant['invite_token'] ?? '') === $token;
        }
        if (!$matchesTarget || !participant_matches_account($participant, $accountEmail)) {
            continue;
        }
        return $participant;
    }
    return null;
}

function account_open_workspace(array $payload): array {
    $email = current_auth_email();
    $sessionId = trim((string) ($payload['session_id'] ?? $payload['id'] ?? ''));
    $kind = trim((string) ($payload['kind'] ?? $payload['relation'] ?? $payload['viewer'] ?? ''));
    $participantId = trim((string) ($payload['participant_id'] ?? ''));
    $token = trim((string) ($payload['token'] ?? $payload['invite_token'] ?? ''));

    if ($sessionId === '') {
        fail('Нужен id workspace', 422);
    }
    $session = find_session($sessionId);
    if (!$session) {
        fail('Workspace не найден', 404);
    }

    if ($kind === '' && owns_session($session, $email)) {
        $kind = 'owner';
    }

    if (in_array($kind, ['owner', 'owned', 'treasurer'], true)) {
        require_session_owner($session);
        return build_treasurer_payload($session, normalized_session_mode($session)) + [
            'context' => [
                'kind' => 'owner',
                'workspace' => workspace_summary($session, 'owned'),
            ],
        ];
    }

    $participant = find_account_participant_in_session($session, $email, $participantId, $token);
    if (!$participant) {
        fail('Membership не найден для текущего аккаунта', 403);
    }

    return build_participant_payload($session, $participant) + [
        'context' => [
            'kind' => 'membership',
            'workspace' => workspace_summary($session, 'membership', $participant),
        ],
    ];
}

function account_invite_preview(array $payload): array {
    $code = preg_replace('/\D+/', '', (string) ($payload['code'] ?? $_GET['code'] ?? '')) ?? '';
    $token = trim((string) ($payload['token'] ?? $_GET['token'] ?? ''));
    $session = null;
    $participant = null;

    if ($code !== '') {
        if (!preg_match('/^\d{6}$/', $code)) {
            fail('Введите 6 цифр кода приглашения', 422);
        }
        $session = find_session_by_invite_code($code);
        $participant = $session ? find_participant_by_invite_code($session, $code) : null;
    } elseif ($token !== '') {
        $session = find_session_by_token($token);
        $participant = $session ? find_participant_by_token($session, $token) : null;
    } else {
        fail('Нужен код или token приглашения', 422);
    }

    if (!$session || !$participant) {
        fail('Приглашение не найдено или устарело', 404);
    }

    return [
        'account' => account_profile_payload(),
        'binding' => [
            'will_bind' => false,
            'route' => 'account-invite-preview',
            'next_route' => 'account-claim-invite',
        ],
        'workspace' => workspace_summary($session, 'membership', $participant),
        'participant' => [
            'id' => (string) ($participant['id'] ?? ''),
            'display_name' => trim((string) ($participant['display_name'] ?? '')),
            'role' => (string) ($participant['role'] ?? 'participant'),
            'email' => clean_email($participant['email'] ?? ''),
            'account_email' => clean_email($participant['account_email'] ?? ''),
            'authorized_at' => $participant['authorized_at'] ?? null,
            'account_claimed_at' => $participant['account_claimed_at'] ?? null,
        ],
    ];
}

function create_account_workspace(array $payload): array {
    $ownerEmail = current_auth_email();
    $mode = in_array(($payload['mode'] ?? $payload['session_mode'] ?? ''), ['group', 'personal'], true)
        ? (string) ($payload['mode'] ?? $payload['session_mode'])
        : 'group';
    $session = default_session($ownerEmail, $mode);
    if (trim((string) ($payload['title'] ?? '')) !== '') {
        $session['title'] = trim((string) $payload['title']);
    }
    if (trim((string) ($payload['currency'] ?? '')) !== '') {
        $session['currency'] = trim((string) $payload['currency']);
    }
    if ($mode === 'personal') {
        $session['treasurer_expense_mode'] = 'cashbox';
        $session['participants'][0]['cashbox_contribution'] = max(0, money_input($payload['opening_balance'] ?? 0));
        $session['participants'][0]['display_name'] = trim((string) ($payload['display_name'] ?? '')) ?: 'Personal journal';
    }

    $saved = save_session($session);
    write_index(['account_last_workspace_id' => $saved['id']]);
    return build_treasurer_payload($saved, $mode) + [
        'context' => [
            'kind' => 'owner',
            'workspace' => workspace_summary($saved, 'owned'),
            'parallel_owner_workspace' => true,
        ],
    ];
}

function encoded_mail_subject(string $subject): string {
    return function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n")
        : $subject;
}

function cashbox_mail_shell(string $title, string $preheader, string $bodyHtml, string $buttonLabel = '', string $buttonUrl = ''): string {
    $button = $buttonLabel !== '' && $buttonUrl !== ''
        ? '<p style="margin:28px 0;"><a href="' . html_escape($buttonUrl) . '" style="display:inline-block;padding:15px 22px;border-radius:14px;background:#10243a;color:#fff;text-decoration:none;font-weight:800;">' . html_escape($buttonLabel) . '</a></p>'
        : '';
    $fallback = $buttonUrl !== ''
        ? '<p style="margin:24px 0 0;color:#64717c;font-size:13px;">Если кнопка не открылась, используйте ссылку:<br><a href="' . html_escape($buttonUrl) . '" style="color:#10243a;">' . html_escape($buttonUrl) . '</a></p>'
        : '';

    return '<!doctype html><html><body style="margin:0;padding:0;background:#f6f3ea;color:#10243a;font-family:Arial,Helvetica,sans-serif;">'
        . '<div style="display:none;max-height:0;overflow:hidden;color:transparent;">' . html_escape($preheader) . '</div>'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ea;padding:24px 12px;"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e3ddd0;border-radius:22px;overflow:hidden;">'
        . '<tr><td style="padding:22px 24px;background:#10243a;color:#f7ead0;"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;">VETUS NAUTA - Brkovic</div><h1 style="margin:10px 0 0;font-size:25px;line-height:1.18;">' . html_escape($title) . '</h1></td></tr>'
        . '<tr><td style="padding:24px;font-size:16px;line-height:1.58;">' . $bodyHtml . $button . $fallback
        . '</td></tr></table></td></tr></table></body></html>';
}

function send_multipart_mail(string $to, string $subject, string $textBody, string $htmlBody, string $messagePrefix): bool {
    if (is_local_request()) {
        return true;
    }

    $boundary = '=_cashbox_' . bin2hex(random_bytes(16));
    $headers = [
        'From: VETUS NAUTA - Brkovic <' . MAIL_FROM_ADDRESS . '>',
        'Sender: ' . MAIL_FROM_ADDRESS,
        'Reply-To: ' . MAIL_REPLY_TO,
        'Return-Path: ' . MAIL_FROM_ADDRESS,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        'Date: ' . date(DATE_RFC2822),
        'Message-ID: <' . $messagePrefix . '-' . bin2hex(random_bytes(8)) . '@brkovic.ltd>',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];

    $body = '--' . $boundary . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $textBody . "\r\n\r\n"
        . '--' . $boundary . "\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $htmlBody . "\r\n\r\n"
        . '--' . $boundary . "--\r\n";

    return mail($to, encoded_mail_subject($subject), $body, implode("\r\n", $headers), '-f ' . escapeshellarg(MAIL_FROM_ADDRESS));
}

function send_invite_email_message(string $to, string $name, string $link, array $session, string $code = ''): bool {
    $groupTitle = trim((string) ($session['title'] ?? 'Ship Cashbox')) ?: 'Ship Cashbox';
    $safeName = trim($name) !== '' ? trim($name) : 'участник';
    $subject = 'Вас пригласили в группу «' . $groupTitle . '»';
    $textBody = "Здравствуйте, {$safeName}.\n\n"
        . "Вас пригласили в судовую кассу группы «{$groupTitle}».\n\n"
        . ($code !== '' ? "Код приглашения в группу: {$code}\n\n" : '')
        . "Принять приглашение:\n{$link}\n\n"
        . "Что откроется:\n"
        . "- ваш личный блокнот расходов внутри этой группы;\n"
        . "- карточки отправленных записей;\n"
        . "- итоговый расчет после закрытия кассы.\n\n"
        . "В этой группе вы участник, не казначей. Вы видите и редактируете только свои записи. Казначей видит сводку группы.\n\n"
        . "Как не потерять группу: сохраните это письмо, добавьте Судовую кассу на главный экран или заходите через меню приложения -> Группа.\n\n"
        . "VETUS NAUTA - Brkovic\n";

    $htmlBody = cashbox_mail_shell(
        'Вас пригласили в группу «' . $groupTitle . '»',
        'Откройте личный блокнот расходов и примите участие в судовой кассе.',
        '<p>Здравствуйте, <strong>' . html_escape($safeName) . '</strong>.</p>'
        . '<p>Казначей пригласил вас в судовую кассу группы <strong>«' . html_escape($groupTitle) . '»</strong>.</p>'
        . ($code !== '' ? '<div style="margin:18px 0;padding:18px;border-radius:18px;background:#10243a;color:#f7ead0;text-align:center;"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;">Код приглашения в группу</div><div style="margin-top:8px;font-size:34px;font-weight:900;letter-spacing:.18em;">' . html_escape($code) . '</div></div>' : '')
        . '<div style="padding:16px;border-radius:16px;background:#f6f3ea;border:1px solid #e3ddd0;"><strong>Что откроет программа</strong><ul style="margin:10px 0 0;padding-left:20px;"><li>личный блокнот расходов только для этой группы;</li><li>карточки отправленных записей с датой и суммой;</li><li>финальный расчет после закрытия кассы.</li></ul></div>'
        . '<p>В этой группе вы участник, не казначей. Вы видите и редактируете свои расходы, а казначей видит общую сводку.</p>'
        . '<p><strong>Как не потерять группу:</strong> сохраните это письмо, добавьте Судовую кассу на главный экран или возвращайтесь через меню приложения: <em>Группа</em>.</p>',
        'Войти в группу',
        $link
    );

    return send_multipart_mail($to, $subject, $textBody, $htmlBody, 'cashbox-invite');
}

function send_settlement_email_message(string $to, array $participant, array $session, array $totals, array $lines): bool {
    $currency = (string) ($session['currency'] ?? 'EUR');
    $groupTitle = trim((string) ($session['title'] ?? 'Ship Cashbox')) ?: 'Ship Cashbox';
    $participantName = trim((string) ($participant['display_name'] ?? 'участник')) ?: 'участник';
    $participantId = (string) ($participant['id'] ?? '');
    $personalLink = build_invite_link((string) ($participant['invite_token'] ?? ''));
    $subject = 'Итог судовой кассы «' . $groupTitle . '»';
    $relevantLines = array_values(array_filter($lines, static function (array $line) use ($participantId, $participant): bool {
        if (($participant['role'] ?? '') === 'treasurer') {
            return true;
        }
        return ($line['from_participant_id'] ?? '') === $participantId || ($line['to_participant_id'] ?? '') === $participantId;
    }));

    $lineText = "Переводы не требуются.";
    if ($relevantLines) {
        $lineText = implode("\n", array_map(static function (array $line) use ($currency): string {
            return sprintf(
                '%s -> %s : %s %.2f',
                (string) ($line['from_display_name'] ?? ''),
                (string) ($line['to_display_name'] ?? ''),
                $currency,
                (float) ($line['amount'] ?? 0)
            );
        }, $relevantLines));
    }

    $summary = $totals['participants'][$participantId] ?? ['contributions' => 0, 'expenses' => 0, 'balance' => 0];
    $textBody = "Здравствуйте, {$participantName}.\n\n"
        . "Судовая касса группы «{$groupTitle}» закрыта.\n\n"
        . "Ваш итог:\n"
        . "Передано казначею: {$currency} " . number_format((float) ($summary['contributions'] ?? 0), 2, '.', ' ') . "\n"
        . "Ваши расходы: {$currency} " . number_format((float) ($summary['expenses'] ?? 0), 2, '.', ' ') . "\n"
        . "Баланс: {$currency} " . number_format((float) ($summary['balance'] ?? 0), 2, '.', ' ') . "\n\n"
        . "Расчет:\n{$lineText}\n\n"
        . "Открыть свой расчет:\n{$personalLink}\n\n"
        . "VETUS NAUTA - Brkovic\n";

    $lineRows = $relevantLines
        ? implode('', array_map(static function (array $line) use ($currency): string {
            return '<tr><td style="padding:8px;border-bottom:1px solid #e3ddd0;">' . html_escape($line['from_display_name'] ?? '') . '</td><td style="padding:8px;border-bottom:1px solid #e3ddd0;">' . html_escape($line['to_display_name'] ?? '') . '</td><td style="padding:8px;border-bottom:1px solid #e3ddd0;text-align:right;">' . html_escape($currency . ' ' . number_format((float) ($line['amount'] ?? 0), 2, '.', ' ')) . '</td></tr>';
        }, $relevantLines))
        : '<tr><td colspan="3" style="padding:10px;color:#64717c;">Переводы не требуются.</td></tr>';

    $htmlBody = cashbox_mail_shell(
        'Итог судовой кассы «' . $groupTitle . '»',
        'Касса закрыта, расчет готов.',
        '<p>Здравствуйте, <strong>' . html_escape($participantName) . '</strong>.</p>'
        . '<p>Касса группы <strong>«' . html_escape($groupTitle) . '»</strong> закрыта. Ниже ваш личный итог.</p>'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border:1px solid #e3ddd0;border-radius:14px;overflow:hidden;"><tr><td style="padding:10px;background:#f6f3ea;">Передано казначею</td><td style="padding:10px;text-align:right;font-weight:800;">' . html_escape($currency . ' ' . number_format((float) ($summary['contributions'] ?? 0), 2, '.', ' ')) . '</td></tr><tr><td style="padding:10px;background:#f6f3ea;">Ваши расходы</td><td style="padding:10px;text-align:right;font-weight:800;">' . html_escape($currency . ' ' . number_format((float) ($summary['expenses'] ?? 0), 2, '.', ' ')) . '</td></tr><tr><td style="padding:10px;background:#f6f3ea;">Баланс</td><td style="padding:10px;text-align:right;font-weight:800;">' . html_escape($currency . ' ' . number_format((float) ($summary['balance'] ?? 0), 2, '.', ' ')) . '</td></tr></table>'
        . '<p><strong>Расчет переводов</strong></p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">' . $lineRows . '</table>',
        'Открыть свой расчет',
        $personalLink
    );

    return send_multipart_mail($to, $subject, $textBody, $htmlBody, 'cashbox-settlement');
}

function send_settlement_emails(array $session, array $totals, array $lines): array {
    $delivery = [];
    foreach (($session['participants'] ?? []) as $participant) {
        if (!($participant['active'] ?? true)) {
            continue;
        }
        $email = clean_email($participant['email'] ?? '');
        if ($email === '') {
            $delivery[] = [
                'participant_id' => $participant['id'] ?? '',
                'email' => '',
                'sent' => false,
                'error' => 'missing_email',
            ];
            continue;
        }
        $delivery[] = [
            'participant_id' => $participant['id'] ?? '',
            'email' => $email,
            'sent' => send_settlement_email_message($email, $participant, $session, $totals, $lines),
            'error' => null,
        ];
    }
    return $delivery;
}

function send_participant_invite(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    require_group_session($session);

    $participantId = trim((string) ($payload['participant_id'] ?? ''));
    if ($participantId === '') {
        fail('Нужен участник', 422);
    }

    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $participantId) {
            continue;
        }
        if (($participant['role'] ?? '') === 'treasurer') {
            fail('Казначей не получает приглашение участника', 422);
        }

        $email = clean_email($payload['email'] ?? '');
        if ($email === '') {
            $email = clean_email($participant['email'] ?? '');
        }
        if ($email === '') {
            fail('Укажите email участника', 422);
        }

        $participant['email'] = $email;
        $code = generate_invite_code();
        $participant['invite_code_hash'] = hash('sha256', $code);
        $participant['invite_code_expires_at'] = gmdate('c', time() + 15 * 60);
        $participant['invite_code_sent_at'] = now_iso();
        $participant['invite_code_used_at'] = null;
        $link = build_invite_code_link($code);
        $sent = send_invite_email_message($email, (string) ($participant['display_name'] ?? ''), $link, $session, $code);
        if (!$sent) {
            $participant['invite_last_error'] = 'mail_failed';
            save_session($session);
            fail('Не удалось отправить email приглашение', 502);
        }

        $participant['invite_sent_at'] = now_iso();
        $participant['invite_last_error'] = null;
        $saved = save_session($session);
        return $saved;
    }
    unset($participant);

    fail('Участник не найден', 404);
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
            'email' => clean_email($participant['email'] ?? ''),
            'active' => true,
            'included_in_split' => bool_value($participant['included_in_split'] ?? true, true),
            'cashbox_contribution' => 0,
            'joined_at' => now_iso(),
            'notebook_text' => '',
            'notebook_hash' => notebook_hash(''),
            'last_synced_at' => null,
            'last_sync_source' => '',
            'entries' => [],
            'notebook_batches' => [],
        ], ($participant['role'] ?? '') === 'treasurer');
    }
    return $participants ?: [normalize_participant(['display_name' => 'Treasurer', 'role' => 'treasurer'], true)];
}

function create_followup_session_from_closed(array $closedSession): array {
    $ownerEmail = session_owner_email($closedSession);
    if ($ownerEmail === '') {
        $ownerEmail = current_auth_email();
    }
    $mode = normalized_session_mode($closedSession);
    $session = default_session($ownerEmail, $mode);
    $session['title'] = $mode === 'personal'
        ? 'Личный журнал расходов'
        : 'Ship Cashbox';
    $session['currency'] = trim((string) ($closedSession['currency'] ?? 'EUR')) ?: 'EUR';
    $session['treasurer_expense_mode'] = normalized_treasurer_expense_mode($closedSession);

    $participants = clone_participants_for_new_session($closedSession);
    $treasurer = null;
    foreach ($participants as $participant) {
        if (($participant['role'] ?? '') === 'treasurer') {
            $treasurer = $participant;
            break;
        }
    }
    if (!$treasurer) {
        $participants[0]['role'] = 'treasurer';
        $treasurer = $participants[0];
    }
    $session['treasurer_participant_id'] = (string) ($treasurer['id'] ?? $participants[0]['id']);
    foreach ($participants as &$participant) {
        $participant['role'] = (($participant['id'] ?? '') === $session['treasurer_participant_id']) ? 'treasurer' : 'participant';
    }
    unset($participant);
    $session['participants'] = $participants;
    $session['treasurer_periods'] = [[
        'id' => rand_id('treasurer-period'),
        'treasurer_participant_id' => $session['treasurer_participant_id'],
        'started_at' => $session['created_at'],
        'ended_at' => null,
        'reason' => 'session_start',
    ]];

    return save_session($session);
}

function settle_participant_and_remove(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    require_group_session($session);

    $participantId = trim((string) ($payload['participant_id'] ?? ''));
    if ($participantId === '') {
        fail('Нужен участник для расчета', 422);
    }
    if ($participantId === (string) ($session['treasurer_participant_id'] ?? '')) {
        fail('Казначея нельзя вывести без передачи роли', 422);
    }
    foreach (($session['participant_settlements'] ?? []) as $event) {
        if (($event['participant_id'] ?? '') === $participantId) {
            fail('Этот член экипажа уже рассчитан и выведен из будущего учета', 409);
        }
    }

    $activeParticipants = array_values(array_filter(
        $session['participants'] ?? [],
        static fn(array $participant): bool => ($participant['active'] ?? true) === true
    ));
    if (count($activeParticipants) <= 1) {
        fail('В группе должен остаться хотя бы один участник', 422);
    }

    $target = null;
    foreach ($session['participants'] as $participant) {
        if (($participant['id'] ?? '') === $participantId) {
            $target = $participant;
            break;
        }
    }
    if (!$target || !($target['active'] ?? true)) {
        fail('Участник уже не участвует в активной кассе', 404);
    }
    if (($target['role'] ?? '') === 'treasurer' || !empty($target['settlement_event_id']) || !empty($target['settled_left_at'])) {
        fail('Этого члена экипажа нельзя списать в текущем состоянии ротации', 422);
    }

    $totals = compute_totals($session);
    $allLines = $totals['settlement_mode'] === 'cashbox'
        ? build_cashbox_settlement_lines($totals['participants'], (string) $session['treasurer_participant_id'])
        : build_direct_settlement_lines($totals['participants'], 'direct_balance');
    $lines = array_values(array_filter($allLines, static function (array $line) use ($participantId): bool {
        return ($line['from_participant_id'] ?? '') === $participantId || ($line['to_participant_id'] ?? '') === $participantId;
    }));
    $outgoing = 0.0;
    $incoming = 0.0;
    foreach ($lines as $line) {
        $amount = money_round((float) ($line['amount'] ?? 0));
        if (($line['from_participant_id'] ?? '') === $participantId) {
            $outgoing += $amount;
        }
        if (($line['to_participant_id'] ?? '') === $participantId) {
            $incoming += $amount;
        }
    }

    $event = normalize_participant_settlement_event([
        'id' => rand_id('participant-settlement'),
        'participant_id' => $participantId,
        'display_name' => $target['display_name'] ?? 'Participant',
        'settled_at' => now_iso(),
        'currency' => $session['currency'] ?? 'EUR',
        'mode' => $totals['settlement_mode'],
        'outgoing' => $outgoing,
        'incoming' => $incoming,
        'net' => money_round($incoming - $outgoing),
        'share' => $totals['share'] ?? 0,
        'total_expenses' => $totals['total_expenses'] ?? 0,
        'lines' => $lines,
    ]);

    if (!$event) {
        fail('Не удалось создать запись расчета', 500);
    }

    $session['participant_settlements'] = array_values(array_filter($session['participant_settlements'] ?? [], 'is_array'));
    $session['participant_settlements'][] = $event;
    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') !== $participantId) {
            continue;
        }
        $participant['active'] = false;
        $participant['included_in_split'] = false;
        $participant['settled_left_at'] = $event['settled_at'];
        $participant['settlement_event_id'] = $event['id'];
    }
    unset($participant);

    $saved = save_session($session);
    return build_treasurer_payload($saved);
}

function rotate_treasurer(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    require_group_session($session);

    $nextTreasurerId = trim((string) ($payload['participant_id'] ?? ''));
    if ($nextTreasurerId === '') {
        fail('Нужен новый казначей', 422);
    }
    $currentTreasurerId = (string) ($session['treasurer_participant_id'] ?? '');
    if ($nextTreasurerId === $currentTreasurerId) {
        fail('Этот член экипажа уже казначей', 422);
    }

    $currentTreasurer = null;
    $nextTreasurer = null;
    foreach ($session['participants'] as $participant) {
        if (($participant['id'] ?? '') === $currentTreasurerId) {
            $currentTreasurer = $participant;
        }
        if (($participant['id'] ?? '') === $nextTreasurerId) {
            $nextTreasurer = $participant;
        }
    }
    if (!$currentTreasurer || !($currentTreasurer['active'] ?? true)) {
        fail('Текущий казначей не активен. Сначала восстановите состав экипажа.', 409);
    }
    if (!$nextTreasurer) {
        fail('Член экипажа не найден', 404);
    }
    if (!($nextTreasurer['active'] ?? true) || !empty($nextTreasurer['settlement_event_id']) || !empty($nextTreasurer['settled_left_at'])) {
        fail('Нельзя назначить выведенного участника казначеем', 422);
    }

    foreach ($session['participants'] as &$participant) {
        if (($participant['id'] ?? '') === $nextTreasurerId) {
            $participant['role'] = 'treasurer';
            $participant['authorized_at'] = $participant['authorized_at'] ?? now_iso();
            continue;
        }
        if (($participant['id'] ?? '') === $currentTreasurerId) {
            $participant['role'] = 'participant';
            continue;
        }
        $participant['role'] = 'participant';
    }
    unset($participant);

    $session['treasurer_participant_id'] = $nextTreasurerId;
    $now = now_iso();
    $periods = normalize_treasurer_periods($session, $currentTreasurerId);
    $closedOpenPeriod = false;
    foreach ($periods as &$period) {
        if (($period['ended_at'] ?? null) === null) {
            $period['ended_at'] = $now;
            $closedOpenPeriod = true;
        }
    }
    unset($period);
    if (!$closedOpenPeriod) {
        $periods[] = [
            'id' => rand_id('treasurer-period'),
            'treasurer_participant_id' => $currentTreasurerId,
            'started_at' => (string) ($session['created_at'] ?? $now),
            'ended_at' => $now,
            'reason' => 'session_start',
        ];
    }
    $periods[] = [
        'id' => rand_id('treasurer-period'),
        'treasurer_participant_id' => $nextTreasurerId,
        'started_at' => $now,
        'ended_at' => null,
        'reason' => 'treasurer_rotation',
    ];
    $session['treasurer_periods'] = $periods;
    $saved = save_session($session);
    return build_treasurer_payload($saved);
}

function confirm_settlement(array $payload): array {
    $session = find_session((string) ($payload['id'] ?? ''));
    if (!$session || ($session['status'] ?? '') !== 'active') {
        fail('Активная касса не найдена', 404);
    }
    require_session_owner($session);
    require_group_session($session);

    $totals = compute_totals($session);
    $lines = $totals['settlement_mode'] === 'cashbox'
        ? build_cashbox_settlement_lines($totals['participants'], (string) $session['treasurer_participant_id'])
        : build_direct_settlement_lines($totals['participants'], 'direct_balance');
    $emailDelivery = send_settlement_emails($session, $totals, $lines);

    $session['status'] = 'closed';
    $session['closed_at'] = now_iso();
    $session['settlement'] = [
        'confirmed_at' => $session['closed_at'],
        'totals' => $totals,
        'lines' => $lines,
        'email_delivery' => $emailDelivery,
    ];
    $session['exports'] = create_export_files($session, $totals, $lines);
    $savedClosed = save_session($session);
    $nextSession = create_followup_session_from_closed($savedClosed);
    write_index(['active_session_id' => $nextSession['id']]);

    return [
        'closed' => build_treasurer_payload($savedClosed),
        'active' => build_treasurer_payload($nextSession),
    ];
}

function reopen_session(string $id): array {
    $session = find_session($id);
    if (!$session || !in_array(($session['status'] ?? ''), ['closed', 'deleted'], true)) {
        fail('Закрытая касса не найдена', 404);
    }
    if (($session['status'] ?? '') === 'deleted') {
        $purgeAfter = strtotime((string) ($session['purge_after'] ?? '')) ?: 0;
        if ($purgeAfter > 0 && $purgeAfter < time()) {
            fail('Срок хранения карточки в корзине истек', 410);
        }
    }
    require_session_owner($session);

    $current = find_active_session_for_owner(current_auth_email(), normalized_session_mode($session));
    if ($current && ($current['status'] ?? '') === 'active' && $current['id'] !== $session['id']) {
        fail('Сначала завершите или закройте текущую активную кассу', 409);
    }

    $session['status'] = 'active';
    $session['closed_at'] = null;
    $session['deleted_at'] = null;
    $session['purge_after'] = null;
    $session['settlement'] = null;
    $saved = save_session($session);
    write_index(['active_session_id' => $saved['id']]);
    return $saved;
}

function delete_archived_session(string $id): array {
    $session = find_session($id);
    if (!$session || !in_array(($session['status'] ?? ''), ['closed', 'deleted'], true)) {
        fail('Закрытая касса не найдена', 404);
    }
    require_session_owner($session);

    $session['status'] = 'deleted';
    $session['deleted_at'] = now_iso();
    $session['purge_after'] = gmdate('c', time() + 60 * 24 * 60 * 60);
    return save_session($session);
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

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'] ?: '/',
            'domain' => $params['domain'] ?: '',
            'secure' => (bool) $params['secure'],
            'httponly' => (bool) $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax',
        ]);
    }
    setcookie(AUTH_COOKIE, '', [
        'expires' => time() - 42000,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_destroy();
    respond(['authenticated' => false, 'version' => APP_VERSION]);
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
    respond(save_notebook_text(
        $token,
        (string) ($payload['notebook_text'] ?? ''),
        (string) ($payload['sync_source'] ?? 'manual'),
        bool_value($payload['submit'] ?? false, false)
    ));
}

if ($action === 'participant-restore-batch') {
    $payload = input_json();
    $token = trim((string) ($payload['token'] ?? ''));
    $batchId = trim((string) ($payload['batch_id'] ?? ''));
    if ($token === '' || $batchId === '') {
        fail('Нужен invite token и id записи', 422);
    }
    respond(restore_notebook_batch_by_token($token, $batchId));
}

if ($action === 'participant-trash-batch') {
    $payload = input_json();
    $token = trim((string) ($payload['token'] ?? ''));
    $batchId = trim((string) ($payload['batch_id'] ?? ''));
    if ($token === '' || $batchId === '') {
        fail('Нужен invite token и id записи', 422);
    }
    respond(trash_notebook_batch_by_token($token, $batchId) + ['version' => APP_VERSION]);
}

if ($action === 'participant-restore-trash-batch') {
    $payload = input_json();
    $token = trim((string) ($payload['token'] ?? ''));
    $trashId = trim((string) ($payload['trash_id'] ?? $payload['batch_id'] ?? ''));
    if ($token === '' || $trashId === '') {
        fail('Нужен invite token и id записи в корзине', 422);
    }
    respond(restore_notebook_trash_by_token($token, $trashId) + ['version' => APP_VERSION]);
}

if ($action === 'verify-invite-code') {
    $payload = input_json();
    respond(authorize_participant_by_code((string) ($payload['code'] ?? '')) + ['version' => APP_VERSION]);
}

require_auth();

if ($action === 'storage-health') {
    respond(['storage' => ship_cashbox_storage_health(), 'version' => APP_VERSION]);
}

if (in_array($action, ['account-workspaces', 'list-my-workspaces'], true)) {
    respond(account_workspaces_payload() + ['version' => APP_VERSION]);
}

if (in_array($action, ['account-invite-preview', 'claim-invite-preview'], true)) {
    respond(account_invite_preview(input_json()) + ['version' => APP_VERSION]);
}

if (in_array($action, ['open-workspace', 'open-membership'], true)) {
    $payload = input_json();
    if ($action === 'open-membership' && trim((string) ($payload['kind'] ?? '')) === '') {
        $payload['kind'] = 'membership';
    }
    respond(account_open_workspace($payload) + ['version' => APP_VERSION]);
}

if ($action === 'create-account-workspace') {
    respond(create_account_workspace(input_json()) + ['version' => APP_VERSION]);
}

if ($action === 'migrate-storage') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail('Метод миграции должен быть POST', 405);
    }
    respond(migrate_json_storage_to_mongodb() + ['version' => APP_VERSION]);
}

if ($action === 'boot') {
    $payload = input_json();
    $mode = normalized_payload_mode((string) ($_GET['mode'] ?? ''))
        ?? normalized_payload_mode((string) ($payload['mode'] ?? $payload['session_mode'] ?? ''));
    $session = find_active_session_for_owner(current_auth_email(), $mode);
    respond(build_treasurer_payload($session, $mode) + ['version' => APP_VERSION]);
}

if ($action === 'scan-ocr-status') {
    respond(['ocr' => scan_ocr_status(), 'version' => APP_VERSION]);
}

if ($action === 'scan-ocr') {
    respond(['ocr' => scan_ocr_extract(input_json()), 'version' => APP_VERSION]);
}

if ($action === 'upload-attachment') {
    respond(upload_cashbox_attachment() + ['version' => APP_VERSION]);
}

if ($action === 'delete-attachment') {
    respond(delete_cashbox_attachment(input_json()) + ['version' => APP_VERSION]);
}

if ($action === 'create-session') {
    respond(build_treasurer_payload(create_new_session(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'save-session') {
    respond(build_treasurer_payload(save_session_meta(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'start-personal-report') {
    respond(build_treasurer_payload(start_personal_report(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'select-personal-report') {
    respond(build_treasurer_payload(select_personal_report(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'attach-personal-record') {
    respond(build_treasurer_payload(attach_personal_record_to_report(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'fix-personal-report') {
    respond(build_treasurer_payload(fix_personal_report(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'restore-personal-report') {
    respond(build_treasurer_payload(restore_personal_report(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'send-invite') {
    respond(build_treasurer_payload(send_participant_invite(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'save-treasurer-notebook') {
    respond(build_treasurer_payload(save_treasurer_notebook(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'restore-treasurer-batch') {
    respond(build_treasurer_payload(restore_treasurer_notebook_batch(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'trash-treasurer-batch') {
    respond(build_treasurer_payload(trash_treasurer_notebook_batch(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'restore-trash-batch') {
    respond(build_treasurer_payload(restore_notebook_trash_by_owner(input_json())) + ['version' => APP_VERSION]);
}

if ($action === 'confirm-settlement') {
    respond(confirm_settlement(input_json()) + ['version' => APP_VERSION]);
}

if ($action === 'settle-participant') {
    respond(settle_participant_and_remove(input_json()) + ['version' => APP_VERSION]);
}

if ($action === 'rotate-treasurer') {
    respond(rotate_treasurer(input_json()) + ['version' => APP_VERSION]);
}

if ($action === 'archive-session') {
    $id = trim((string) ($_GET['id'] ?? ''));
    if ($id === '') {
        fail('Нужен id архива', 422);
    }
    $session = find_session($id);
    if (!$session || !in_array(($session['status'] ?? ''), ['closed', 'deleted'], true)) {
        fail('Закрытая касса не найдена', 404);
    }
    if (($session['status'] ?? '') === 'deleted') {
        $purgeAfter = strtotime((string) ($session['purge_after'] ?? '')) ?: 0;
        if ($purgeAfter > 0 && $purgeAfter < time()) {
            fail('Срок хранения карточки в корзине истек', 410);
        }
    }
    require_session_owner($session);
    respond(build_treasurer_payload($session) + ['version' => APP_VERSION]);
}

if ($action === 'reopen-session') {
    $payload = input_json();
    respond(build_treasurer_payload(reopen_session((string) ($payload['id'] ?? ''))) + ['version' => APP_VERSION]);
}

if ($action === 'delete-archive-session') {
    $payload = input_json();
    delete_archived_session((string) ($payload['id'] ?? ''));
    $mode = normalized_payload_mode((string) ($payload['mode'] ?? ''));
    $session = null;
    $currentSessionId = trim((string) ($payload['current_session_id'] ?? ''));
    if ($currentSessionId !== '') {
        $candidate = find_session($currentSessionId);
        if ($candidate && ($candidate['status'] ?? '') === 'active') {
            require_session_owner($candidate);
            if ($mode === null || normalized_session_mode($candidate) === $mode) {
                $session = $candidate;
            }
        }
    }
    if (!$session) {
        $session = find_active_session_for_owner(current_auth_email(), $mode);
    }
    respond(build_treasurer_payload($session) + ['version' => APP_VERSION]);
}

fail('Не найдено', 404);
