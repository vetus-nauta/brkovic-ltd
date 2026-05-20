<?php
header('Content-Type: application/json; charset=utf-8');

const FORM_MIN_SECONDS = 3;
const FORM_MAX_SECONDS = 43200;
const FORM_TOKEN_PREFIX = 'brk2-';
const FORM_TOKEN_SALT = 'sail-skill';
const RATE_WINDOW_SHORT = 600;
const RATE_WINDOW_DAY = 86400;

function respond($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function get_client_ip(): string {
    $candidates = [
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_REAL_IP'] ?? '',
        explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0] ?? '',
    ];

    foreach ($candidates as $candidate) {
        $ip = trim((string) $candidate);
        if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return 'unknown';
}

function header_host(string $value): string {
    $host = parse_url($value, PHP_URL_HOST);
    return strtolower((string) $host);
}

function is_private_preview_host(string $host): bool {
    return $host === 'localhost'
        || $host === '127.0.0.1'
        || $host === '::1'
        || str_ends_with($host, '.local')
        || preg_match('/^10\./', $host)
        || preg_match('/^192\.168\./', $host)
        || preg_match('/^172\.(1[6-9]|2\d|3[0-1])\./', $host);
}

function is_allowed_host(string $host): bool {
    $host = strtolower(trim($host));
    $serverHost = strtolower(trim(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]));
    $allowedHosts = array_filter([
        $serverHost,
        'brkovic.ltd',
        'www.brkovic.ltd',
    ]);

    return in_array($host, $allowedHosts, true) || is_private_preview_host($host);
}

function is_same_site_request(): bool {
    $origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        return is_allowed_host(header_host($origin));
    }

    $referer = trim($_SERVER['HTTP_REFERER'] ?? '');
    if ($referer !== '') {
        return is_allowed_host(header_host($referer));
    }

    return false;
}

function clean_text($value, int $maxLength): string {
    $text = trim((string) $value);
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);
    return mb_substr($text, 0, $maxLength, 'UTF-8');
}

function text_len(string $value): int {
    return mb_strlen($value, 'UTF-8');
}

function fnv1a_base36(string $value): string {
    $hash = 2166136261;
    $bytes = unpack('C*', $value);
    if (!is_array($bytes)) {
        return '';
    }

    foreach ($bytes as $byte) {
        $hash ^= $byte;
        $hash = ($hash * 16777619) & 0xffffffff;
    }

    return base_convert((string) $hash, 10, 36);
}

function expected_form_token(string $sourcePage, string $rawFormTs): string {
    return FORM_TOKEN_PREFIX . fnv1a_base36($sourcePage . '|' . $rawFormTs . '|' . FORM_TOKEN_SALT);
}

function is_valid_form_token(string $token, string $sourcePage, string $rawFormTs): bool {
    if ($token === '' || $sourcePage === '' || $rawFormTs === '') {
        return false;
    }

    if (!str_starts_with($sourcePage, '/')) {
        return false;
    }

    $expected = expected_form_token($sourcePage, $rawFormTs);
    return hash_equals($expected, $token);
}

function write_security_log(string $reason, array $context = []): void {
    $line = [
        'time' => date('c'),
        'reason' => $reason,
        'ip' => get_client_ip(),
        'ua' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 180, 'UTF-8'),
    ] + $context;

    @file_put_contents(
        __DIR__ . '/form-security.log',
        json_encode($line, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function reject_spam(string $reason, int $code = 204, string $message = ''): void {
    write_security_log($reason);
    if ($code === 204) {
        http_response_code(204);
        exit;
    }

    respond(false, $message !== '' ? $message : 'Request rejected.', $code);
}

function count_recent(array $items, int $since): int {
    $count = 0;
    foreach ($items as $item) {
        if ((int) $item >= $since) {
            $count++;
        }
    }
    return $count;
}

function prune_times(array $items, int $since): array {
    return array_values(array_filter($items, static fn($item) => (int) $item >= $since));
}

function rate_limit_reason(string $ip, string $email): string {
    $dir = __DIR__;
    $path = $dir . '/form-rate-limit.json';
    $lockPath = $dir . '/form-rate-limit.lock';
    $now = time();
    $dayAgo = $now - RATE_WINDOW_DAY;
    $shortAgo = $now - RATE_WINDOW_SHORT;
    $ipKey = hash('sha256', $ip);
    $emailKey = hash('sha256', mb_strtolower($email, 'UTF-8'));

    $lock = @fopen($lockPath, 'c+');
    if (!$lock) {
        return '';
    }

    try {
        flock($lock, LOCK_EX);
        $data = is_file($path) ? json_decode((string) file_get_contents($path), true) : [];
        if (!is_array($data)) $data = [];
        $data['ip'] = is_array($data['ip'] ?? null) ? $data['ip'] : [];
        $data['email'] = is_array($data['email'] ?? null) ? $data['email'] : [];
        $data['global'] = is_array($data['global'] ?? null) ? $data['global'] : [];

        foreach ($data['ip'] as $key => $items) {
            $data['ip'][$key] = prune_times(is_array($items) ? $items : [], $dayAgo);
            if (!$data['ip'][$key]) unset($data['ip'][$key]);
        }
        foreach ($data['email'] as $key => $items) {
            $data['email'][$key] = prune_times(is_array($items) ? $items : [], $dayAgo);
            if (!$data['email'][$key]) unset($data['email'][$key]);
        }
        $data['global'] = prune_times($data['global'], $shortAgo);

        $data['ip'][$ipKey] = $data['ip'][$ipKey] ?? [];
        $data['email'][$emailKey] = $data['email'][$emailKey] ?? [];
        $data['ip'][$ipKey][] = $now;
        $data['email'][$emailKey][] = $now;
        $data['global'][] = $now;

        $reason = '';
        if (count_recent($data['global'], $shortAgo) > 80) {
            $reason = 'global-rate-limit';
        } elseif (count_recent($data['ip'][$ipKey], $shortAgo) > 4) {
            $reason = 'ip-short-rate-limit';
        } elseif (count_recent($data['ip'][$ipKey], $dayAgo) > 16) {
            $reason = 'ip-day-rate-limit';
        } elseif (count_recent($data['email'][$emailKey], $shortAgo) > 2) {
            $reason = 'email-rate-limit';
        }

        @file_put_contents($path, json_encode($data, JSON_UNESCAPED_SLASHES), LOCK_EX);
        return $reason;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function has_spam_content(string $message): bool {
    $urlCount = preg_match_all('/(?:https?:\/\/|www\.|[a-z0-9.-]+\.(?:xyz|top|shop|click|online|site|info|biz|casino|icu|bond)\b)/iu', $message);
    if ($urlCount > 2) {
        return true;
    }

    return (bool) preg_match('/\b(?:viagra|casino|porn|crypto|bitcoin|forex|loan|backlink|guest\s*post|seo\s*services)\b/iu', $message);
}

function has_low_human_signal(string $name, string $message): bool {
    $normalizedName = trim(mb_strtolower($name, 'UTF-8'));
    $normalizedMessage = trim(mb_strtolower($message, 'UTF-8'));

    $messageHasWhitespace = (bool) preg_match('/\s/u', $normalizedMessage);
    $messageIsSingleAsciiWord = (bool) preg_match('/^[a-z]{18,90}$/', $normalizedMessage);
    if ($messageIsSingleAsciiWord && !$messageHasWhitespace) {
        return true;
    }

    $nameLooksGenerated = (bool) preg_match('/^[a-z]{8,24}$/', $normalizedName);
    $messageLooksGenerated = (bool) preg_match('/^[a-z]{12,120}$/', $normalizedMessage);
    if ($nameLooksGenerated && $messageLooksGenerated && !$messageHasWhitespace) {
        return true;
    }

    return false;
}

function sanitize_header_value($value): string {
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $value));
}

function smtp_read($socket) {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (preg_match('/^\d{3} /', $line)) {
            break;
        }
    }
    return $data;
}

function smtp_expect($socket, array $allowedCodes) {
    $response = smtp_read($socket);
    $code = (int) substr(trim($response), 0, 3);
    if (!in_array($code, $allowedCodes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }
    return $response;
}

function smtp_command($socket, $command, array $allowedCodes) {
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $allowedCodes);
}

function build_headers(array $headers) {
    $result = [];
    foreach ($headers as $name => $value) {
        $result[] = $name . ': ' . $value;
    }
    return implode("\r\n", $result);
}

function send_via_smtp(array $smtp, $recipient, $replyTo, $subject, $body) {
    $host = $smtp['host'] ?? '';
    $port = (int) ($smtp['port'] ?? 465);
    $encryption = $smtp['encryption'] ?? 'ssl';
    $username = $smtp['username'] ?? '';
    $password = $smtp['password'] ?? '';
    $fromEmail = $smtp['from_email'] ?? $username;
    $fromName = $smtp['from_name'] ?? 'Website';
    $timeout = (int) ($smtp['timeout'] ?? 20);
    $recipient = sanitize_header_value($recipient);
    $replyTo = sanitize_header_value($replyTo);
    $subject = sanitize_header_value($subject);
    $fromEmail = sanitize_header_value($fromEmail);
    $fromName = sanitize_header_value($fromName);

    if ($host === '' || $username === '' || $password === '' || $fromEmail === '') {
        throw new RuntimeException('SMTP is not fully configured.');
    }

    $transportHost = $host;
    if ($encryption === 'ssl') {
        $transportHost = 'ssl://' . $host;
    }

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
        smtp_command($socket, 'EHLO brkovic.ltd', [250]);

        if ($encryption === 'tls') {
            smtp_command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Could not enable TLS encryption.');
            }
            smtp_command($socket, 'EHLO brkovic.ltd', [250]);
        }

        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode($username), [334]);
        smtp_command($socket, base64_encode($password), [235]);
        smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $headers = build_headers([
            'Date' => date(DATE_RFC2822),
            'From' => sprintf('%s <%s>', $fromName, $fromEmail),
            'Reply-To' => $replyTo,
            'To' => $recipient,
            'Subject' => $encodedSubject,
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'X-Mailer' => 'BRKOVIC SMTP Form',
        ]);

        $safeBody = preg_replace("/(\r\n|\r|\n)/", "\r\n", $body);
        $safeBody = preg_replace('/^\./m', '..', $safeBody);
        $message = $headers . "\r\n\r\n" . $safeBody . "\r\n.";

        fwrite($socket, $message . "\r\n");
        smtp_expect($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$lang = clean_text($_POST['lang'] ?? 'en', 8);
$isRu = $lang === 'ru';

if (!is_same_site_request()) {
    reject_spam('bad-origin', 403, $isRu ? 'Перезагрузите страницу и отправьте форму еще раз.' : 'Please reload the page and send the form again.');
}

$honeypot = trim((string) ($_POST['company_url'] ?? '') . (string) ($_POST['website'] ?? '') . (string) ($_POST['homepage'] ?? ''));
if ($honeypot !== '') {
    reject_spam('honeypot-filled');
}

$rawFormTs = trim((string) ($_POST['form_ts'] ?? ''));
$formTs = (int) $rawFormTs;
if ($formTs > 20000000000) {
    $formTs = (int) floor($formTs / 1000);
}
$formAge = time() - $formTs;
if ($formTs <= 0 || $formAge < FORM_MIN_SECONDS || $formAge > FORM_MAX_SECONDS) {
    reject_spam('bad-form-age', 429, $isRu ? 'Перезагрузите страницу и отправьте форму еще раз.' : 'Please reload the page and send the form again.');
}

$rawName = (string) ($_POST['name'] ?? '');
$rawEmail = (string) ($_POST['email'] ?? '');
$rawPhone = (string) ($_POST['phone'] ?? '');
$rawService = (string) ($_POST['service'] ?? '');
$rawMessage = (string) ($_POST['message'] ?? '');
if (text_len($rawName) > 120 || text_len($rawEmail) > 180 || text_len($rawPhone) > 120 || text_len($rawService) > 180 || text_len($rawMessage) > 3500) {
    reject_spam('too-long', 422, $isRu ? 'Сообщение слишком длинное.' : 'The message is too long.');
}

$name = clean_text($rawName, 120);
$email = clean_text($rawEmail, 180);
$phone = clean_text($rawPhone, 120);
$service = clean_text($rawService, 180);
$message = clean_text($rawMessage, 3500);
$requestType = clean_text($_POST['request_type'] ?? 'general', 40);
$sourcePage = clean_text($_POST['source_page'] ?? '', 240);
$formToken = clean_text($_POST['form_token'] ?? '', 80);
$isCvRequest = $requestType === 'cv' || mb_strtolower($service, 'UTF-8') === mb_strtolower('CV Request', 'UTF-8') || mb_strtolower($service, 'UTF-8') === mb_strtolower('Запрос CV', 'UTF-8');

if (!is_valid_form_token($formToken, $sourcePage, $rawFormTs)) {
    reject_spam('bad-form-token', 403, $isRu ? 'Перезагрузите страницу и отправьте форму еще раз.' : 'Please reload the page and send the form again.');
}

if ($name === '' || $email === '' || $message === '') {
    respond(false, $isRu ? 'Пожалуйста, заполните обязательные поля.' : 'Please fill in the required fields.', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, $isRu ? 'Введите корректный email.' : 'Please enter a valid email address.', 422);
}
$allowedServices = [
    'Yacht Management',
    'IYT Training',
    'IYT Training Center in Montenegro',
    'Skipper Service',
    'Sailing Tours',
    'Yacht Acceptance & Delivery',
    'Yacht Registration',
    'CV Request',
    'Яхт менеджмент',
    'IYT обучение',
    'IYT тренинг-центр в Черногории',
    'Услуги шкипера',
    'Морские туры',
    'Перегон яхт',
    'Регистрация яхты',
    'Запрос CV',
];
if ($service !== '' && !in_array($service, $allowedServices, true)) {
    reject_spam('bad-service');
}
if (has_spam_content($message . ' ' . $name . ' ' . $phone)) {
    reject_spam('spam-content');
}
if (has_low_human_signal($name, $message)) {
    reject_spam('low-human-signal');
}

$rateReason = rate_limit_reason(get_client_ip(), $email);
if ($rateReason !== '') {
    reject_spam($rateReason, 429, $isRu ? 'Слишком много отправок. Попробуйте позже или напишите напрямую.' : 'Too many submissions. Please try later or contact me directly.');
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    respond(false, $isRu ? 'Не настроена отправка формы.' : 'Form sending is not configured.', 500);
}
$config = require $configPath;

$recipient = $config['recipient_email'] ?? '';
if ($recipient === '') {
    respond(false, $isRu ? 'Не настроен email для получения заявок.' : 'Recipient email is not configured.', 500);
}

$siteName = $config['site_name'] ?? 'BRKOVIC';
$adminSubject = $isRu ? 'Новая заявка с сайта ' . $siteName : 'New request from ' . $siteName . ' website';
if ($isCvRequest) {
    $adminSubject = $isRu ? 'Запрос CV с сайта ' . $siteName : 'CV request from ' . $siteName . ' website';
}

$adminBody = $isRu
    ? "Новая заявка с сайта\n\n"
        . "Имя: {$name}\n"
        . "Email: {$email}\n"
        . "Телефон / Messenger: {$phone}\n"
        . "Услуга: {$service}\n"
        . "Тип запроса: " . ($isCvRequest ? 'CV' : 'Общий') . "\n"
        . "Страница: {$sourcePage}\n"
        . "IP: " . get_client_ip() . "\n"
        . ($isCvRequest ? "PDF на сайте: https://brkovic.ltd/docs/cv.pdf\n\n" : "\n")
        . "Сообщение:\n{$message}\n"
    : "New request from the website\n\n"
        . "Name: {$name}\n"
        . "Email: {$email}\n"
        . "Phone / Messenger: {$phone}\n"
        . "Service: {$service}\n"
        . "Request type: " . ($isCvRequest ? 'CV' : 'General') . "\n"
        . "Page: {$sourcePage}\n"
        . "IP: " . get_client_ip() . "\n"
        . ($isCvRequest ? "PDF on site: https://brkovic.ltd/docs/cv.pdf\n\n" : "\n")
        . "Message:\n{$message}\n";

$replySubject = $isCvRequest
    ? ($isRu ? 'BRKOVIC — запрос CV получен' : 'BRKOVIC — CV request received')
    : ($isRu ? 'BRKOVIC — заявка получена' : 'BRKOVIC — request received');

$replyBody = $isRu
    ? "Здравствуйте" . ($name !== '' ? ", {$name}" : "") . "!\n\n"
        . ($isCvRequest
            ? "Спасибо, ваш запрос на CV получен. Я лично отправлю вам прямую ссылку на скачивание после проверки запроса.\n\n"
            : "Спасибо, ваша заявка получена. Я свяжусь с вами в ближайшее время.\n\n")
        . "Кратко по вашему запросу:\n"
        . "Услуга: {$service}\n"
        . ($phone !== '' ? "Телефон / Messenger: {$phone}\n" : "")
        . "\nBRKOVIC\n"
        . "Яхт менеджмент • Обучение • Туры\n"
        . "Email: vetus.nauta@gmail.com\n"
        . "Telegram: @Alexey_Usov"
    : "Hello" . ($name !== '' ? ", {$name}" : "") . "!\n\n"
        . ($isCvRequest
            ? "Thank you, your CV request has been received. I will personally send you the direct download link after reviewing the request.\n\n"
            : "Thank you, your request has been received. I will get back to you shortly.\n\n")
        . "A short recap of your request:\n"
        . "Service: {$service}\n"
        . ($phone !== '' ? "Phone / Messenger: {$phone}\n" : "")
        . "\nBRKOVIC\n"
        . "Yacht Management • Training • Tours\n"
        . "Email: vetus.nauta@gmail.com\n"
        . "Telegram: @Alexey_Usov";

try {
    send_via_smtp($config['smtp'] ?? [], $recipient, $email, $adminSubject, $adminBody);
    if (!empty($config['send_auto_reply'])) {
        send_via_smtp($config['smtp'] ?? [], $email, $recipient, $replySubject, $replyBody);
    }

    respond(
        true,
        $isCvRequest
            ? ($isRu ? 'Запрос CV отправлен. Я свяжусь с вами после проверки запроса.' : 'Your CV request has been sent. I will get back to you after reviewing it.')
            : ($isRu ? 'Заявка отправлена. Я свяжусь с вами в ближайшее время.' : 'Your request has been sent. I will get back to you shortly.')
    );
} catch (Throwable $e) {
    $logLine = '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . PHP_EOL;
    @file_put_contents(__DIR__ . '/smtp-error.log', $logLine, FILE_APPEND);
    respond(false, $isRu ? 'Сейчас форма не отправилась. Напишите напрямую на vetus.nauta@gmail.com или в WhatsApp / Telegram.' : 'The form could not be sent right now. Please contact me directly by email, WhatsApp or Telegram.', 500);
}
