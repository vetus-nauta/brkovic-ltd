<?php
header('Content-Type: application/json; charset=utf-8');
$config = require __DIR__ . '/config.php';

function respond($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
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

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$lang = trim($_POST['lang'] ?? 'en');
$requestType = trim($_POST['request_type'] ?? 'general');
$isRu = $lang === 'ru';
$isCvRequest = $requestType === 'cv' || mb_strtolower($service, 'UTF-8') === mb_strtolower('CV Request', 'UTF-8') || mb_strtolower($service, 'UTF-8') === mb_strtolower('Запрос CV', 'UTF-8');

if ($name === '' || $email === '' || $message === '') {
    respond(false, $isRu ? 'Пожалуйста, заполните обязательные поля.' : 'Please fill in the required fields.', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, $isRu ? 'Введите корректный email.' : 'Please enter a valid email address.', 422);
}

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
        . ($isCvRequest ? "PDF на сайте: https://brkovic.ltd/docs/cv.pdf\n\n" : "\n")
        . "Сообщение:\n{$message}\n"
    : "New request from the website\n\n"
        . "Name: {$name}\n"
        . "Email: {$email}\n"
        . "Phone / Messenger: {$phone}\n"
        . "Service: {$service}\n"
        . "Request type: " . ($isCvRequest ? 'CV' : 'General') . "\n"
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
    send_via_smtp($config['smtp'] ?? [], $email, $recipient, $replySubject, $replyBody);

    respond(
        true,
        $isCvRequest
            ? ($isRu ? 'Запрос CV отправлен. Подтверждение направлено на ваш email.' : 'Your CV request has been sent. A confirmation copy was sent to your email address.')
            : ($isRu ? 'Заявка отправлена. Подтверждение направлено на ваш email.' : 'Your request has been sent. A confirmation copy was sent to your email address.')
    );
} catch (Throwable $e) {
    $logLine = '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . PHP_EOL;
    @file_put_contents(__DIR__ . '/smtp-error.log', $logLine, FILE_APPEND);
    respond(false, $isRu ? 'Сейчас форма не отправилась. Напишите напрямую на vetus.nauta@gmail.com или в WhatsApp / Telegram.' : 'The form could not be sent right now. Please contact me directly by email, WhatsApp or Telegram.', 500);
}
