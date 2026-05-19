<?php
declare(strict_types=1);

session_name('brkovic_local_admin');
session_start();

const PRICING_FILE = __DIR__ . '/data/management-pricing.json';

function json_response(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function fail(int $status, string $message): void {
    json_response($status, [
        'success' => false,
        'error' => ['message' => $message],
    ]);
}

function is_local_request(): bool {
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $host = explode(':', $host, 2)[0];
    $localHosts = ['127.0.0.1', 'localhost', 'brkovic-local.local'];
    $localRemotes = ['127.0.0.1', '::1'];

    return in_array($remote, $localRemotes, true) && in_array($host, $localHosts, true);
}

function require_admin(): void {
    if (is_local_request()) {
        return;
    }

    $hasLocalSession = !empty($_SESSION['brkovic_live_cookie']);
    if (!$hasLocalSession) {
        fail(401, 'Нужно войти в админку');
    }
}

function diagnostics_payload(): array {
    $dir = dirname(PRICING_FILE);
    return [
        'mode' => is_local_request() ? 'local' : 'live',
        'authenticated' => is_local_request() || !empty($_SESSION['brkovic_live_cookie']),
        'remoteAddr' => $_SERVER['REMOTE_ADDR'] ?? '',
        'host' => $_SERVER['HTTP_HOST'] ?? '',
        'pricingFile' => [
            'path' => PRICING_FILE,
            'exists' => is_file(PRICING_FILE),
            'readable' => is_readable(PRICING_FILE),
            'writable' => is_writable(PRICING_FILE),
            'perms' => is_file(PRICING_FILE) ? substr(sprintf('%o', fileperms(PRICING_FILE)), -4) : null,
            'owner' => function_exists('posix_getpwuid') && is_file(PRICING_FILE)
                ? (posix_getpwuid((int) fileowner(PRICING_FILE))['name'] ?? null)
                : null,
        ],
        'dataDir' => [
            'path' => $dir,
            'exists' => is_dir($dir),
            'readable' => is_readable($dir),
            'writable' => is_writable($dir),
            'perms' => is_dir($dir) ? substr(sprintf('%o', fileperms($dir)), -4) : null,
            'owner' => function_exists('posix_getpwuid') && is_dir($dir)
                ? (posix_getpwuid((int) fileowner($dir))['name'] ?? null)
                : null,
        ],
    ];
}

function read_json_file(string $path): array {
    if (!is_file($path)) {
        fail(404, 'Файл цен не найден');
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        fail(500, 'Не удалось прочитать файл цен');
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail(500, 'Файл цен содержит некорректный JSON');
    }

    return $data;
}

function write_json_file(string $path, string $content): void {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        fail(500, 'Не найдена папка data для файла цен');
    }

    $directError = null;
    if (is_file($path) && is_writable($path)) {
        if (file_put_contents($path, $content, LOCK_EX) !== false) {
            return;
        }
        $directError = error_get_last()['message'] ?? null;
    }

    if (!is_writable($dir)) {
        $detail = $directError ? ': ' . $directError : '';
        fail(500, 'Не удалось сохранить файл цен: нет прав на запись в папку data' . $detail);
    }

    $tmp = tempnam($dir, '.management-pricing-');
    if ($tmp === false) {
        $detail = $directError ? ': ' . $directError : '';
        fail(500, 'Не удалось создать временный файл цен' . $detail);
    }

    $written = file_put_contents($tmp, $content, LOCK_EX);
    if ($written === false) {
        $detail = error_get_last()['message'] ?? 'ошибка записи временного файла';
        @unlink($tmp);
        fail(500, 'Не удалось записать временный файл цен: ' . $detail);
    }

    @chmod($tmp, 0664);
    if (!rename($tmp, $path)) {
        $detail = error_get_last()['message'] ?? 'ошибка замены файла';
        @unlink($tmp);
        fail(500, 'Не удалось заменить файл цен: ' . $detail);
    }
}

function as_number(mixed $value, float $fallback = 0.0): float {
    if (is_int($value) || is_float($value)) {
        return (float) $value;
    }
    if (is_string($value) && is_numeric($value)) {
        return (float) $value;
    }
    return $fallback;
}

function sanitize_group(mixed $group, array $allowedFields): array {
    if (!is_array($group)) {
        return [];
    }

    $clean = [];
    foreach ($group as $key => $item) {
        if (!is_string($key) || !is_array($item)) {
            continue;
        }

        $row = [];
        foreach ($allowedFields as $field => $type) {
            if (!array_key_exists($field, $item)) {
                continue;
            }

            if ($type === 'number') {
                $row[$field] = as_number($item[$field]);
            } elseif ($type === 'bool') {
                $row[$field] = (bool) $item[$field];
            } else {
                $row[$field] = is_scalar($item[$field]) ? trim((string) $item[$field]) : '';
            }
        }

        if ($row) {
            $clean[$key] = $row;
        }
    }

    return $clean;
}

function sanitize_legal_sections(mixed $sections): array {
    if (!is_array($sections)) {
        return [];
    }

    $clean = [];
    foreach ($sections as $section) {
        if (!is_array($section)) {
            continue;
        }

        $title = trim((string) ($section['title'] ?? ''));
        $articles = [];
        $rawArticles = is_array($section['articles'] ?? null) ? $section['articles'] : [];
        foreach ($rawArticles as $article) {
            if (!is_array($article)) {
                continue;
            }

            $articleTitle = trim((string) ($article['title'] ?? ''));
            $body = trim((string) ($article['body'] ?? ''));
            if ($articleTitle === '' && $body === '') {
                continue;
            }
            $articles[] = [
                'title' => $articleTitle,
                'body' => $body,
            ];
        }

        if ($title === '' && !$articles) {
            continue;
        }
        $clean[] = [
            'title' => $title,
            'articles' => $articles,
        ];
    }

    return $clean;
}

function sanitize_pricing(array $input, array $current): array {
    $output = $current;
    $output['version'] = (int) ($current['version'] ?? 1);
    $output['updatedAt'] = gmdate('c');
    $output['currency'] = 'EUR';

    $output['typeData'] = sanitize_group($input['typeData'] ?? [], [
        'label' => 'string',
        'factor' => 'number',
    ]);

    $output['lengthData'] = sanitize_group($input['lengthData'] ?? [], [
        'label' => 'string',
        'base' => 'number',
        'factor' => 'number',
        'individual' => 'bool',
    ]);

    $output['crewData'] = sanitize_group($input['crewData'] ?? [], [
        'label' => 'string',
        'factor' => 'number',
        'note' => 'string',
    ]);

    $serviceFields = [
        'label' => 'string',
        'title' => 'string',
        'titleRu' => 'string',
        'titleEn' => 'string',
        'description' => 'string',
        'descriptionText' => 'string',
        'descriptionRu' => 'string',
        'descriptionEn' => 'string',
        'frequency' => 'string',
        'price' => 'number',
        'order' => 'number',
        'reduction' => 'string',
        'enabled' => 'bool',
        'sailingOnly' => 'bool',
        'publicVisible' => 'bool',
        'adminOnly' => 'bool',
        'allowQuantity' => 'bool',
        'quantityDefault' => 'number',
    ];
    $output['monthlyServices'] = sanitize_group($input['monthlyServices'] ?? [], $serviceFields);
    $output['sailingServices'] = sanitize_group($input['sailingServices'] ?? [], $serviceFields);
    $output['oneTimeServices'] = sanitize_group($input['oneTimeServices'] ?? [], $serviceFields);

    $range = is_array($input['range'] ?? null) ? $input['range'] : [];
    $output['range'] = [
        'monthlyLow' => as_number($range['monthlyLow'] ?? ($current['range']['monthlyLow'] ?? 0.86), 0.86),
        'monthlyHigh' => as_number($range['monthlyHigh'] ?? ($current['range']['monthlyHigh'] ?? 1.18), 1.18),
        'oneTimeLow' => as_number($range['oneTimeLow'] ?? ($current['range']['oneTimeLow'] ?? 0.85), 0.85),
        'oneTimeHigh' => as_number($range['oneTimeHigh'] ?? ($current['range']['oneTimeHigh'] ?? 1.2), 1.2),
    ];

    $contract = is_array($input['contractDefaults'] ?? null) ? $input['contractDefaults'] : [];
    $currentContract = is_array($current['contractDefaults'] ?? null) ? $current['contractDefaults'] : [];
    $output['contractDefaults'] = [
        'provider' => trim((string) ($contract['provider'] ?? ($currentContract['provider'] ?? 'VETUS NAUTA / BRKOVIC'))),
        'jurisdiction' => trim((string) ($contract['jurisdiction'] ?? ($currentContract['jurisdiction'] ?? 'Montenegro'))),
        'paymentTerms' => trim((string) ($contract['paymentTerms'] ?? ($currentContract['paymentTerms'] ?? ''))),
        'estimateClause' => trim((string) ($contract['estimateClause'] ?? ($currentContract['estimateClause'] ?? ''))),
        'exclusions' => trim((string) ($contract['exclusions'] ?? ($currentContract['exclusions'] ?? ''))),
    ];

    $legal = sanitize_legal_sections($input['contractLegalSections'] ?? ($current['contractLegalSections'] ?? []));
    if ($legal) {
        $output['contractLegalSections'] = $legal;
    }

    $invoice = is_array($input['invoiceDefaults'] ?? null) ? $input['invoiceDefaults'] : [];
    $currentInvoice = is_array($current['invoiceDefaults'] ?? null) ? $current['invoiceDefaults'] : [];
    $output['invoiceDefaults'] = [
        'companyName' => trim((string) ($invoice['companyName'] ?? ($currentInvoice['companyName'] ?? 'VETUS NAUTA / BRKOVIC'))),
        'address' => trim((string) ($invoice['address'] ?? ($currentInvoice['address'] ?? '85320, Obala BB, Tivat, Porto Montenegro'))),
        'email' => trim((string) ($invoice['email'] ?? ($currentInvoice['email'] ?? 'vetus.nauta@gmail.com'))),
        'phone' => trim((string) ($invoice['phone'] ?? ($currentInvoice['phone'] ?? '+38268255550'))),
        'logoUrl' => trim((string) ($invoice['logoUrl'] ?? ($currentInvoice['logoUrl'] ?? 'brand/logo-vetus-nauta-night-clean.png'))),
        'electronicBaseUrl' => trim((string) ($invoice['electronicBaseUrl'] ?? ($currentInvoice['electronicBaseUrl'] ?? 'https://brkovic.ltd/docs/proforma'))),
        'discountPercent' => as_number($invoice['discountPercent'] ?? ($currentInvoice['discountPercent'] ?? 0), 0),
        'vatPercent' => as_number($invoice['vatPercent'] ?? ($currentInvoice['vatPercent'] ?? 21), 21),
        'paymentNote' => trim((string) ($invoice['paymentNote'] ?? ($currentInvoice['paymentNote'] ?? ''))),
    ];

    foreach (['typeData', 'lengthData', 'crewData', 'monthlyServices', 'oneTimeServices'] as $groupKey) {
        if (!$output[$groupKey]) {
            fail(422, "Группа {$groupKey} не может быть пустой");
        }
    }

    return $output;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    require_admin();
    if (isset($_GET['diagnostics'])) {
        json_response(200, [
            'success' => true,
            'data' => diagnostics_payload(),
        ]);
    }
    json_response(200, [
        'success' => true,
        'data' => read_json_file(PRICING_FILE),
    ]);
}

if ($method === 'PUT' || $method === 'POST') {
    require_admin();
    $raw = file_get_contents('php://input');
    $input = json_decode($raw ?: '', true);
    if (!is_array($input)) {
        fail(400, 'Некорректные JSON-данные');
    }

    $current = read_json_file(PRICING_FILE);
    $next = sanitize_pricing($input, $current);
    $encoded = json_encode($next, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        fail(500, 'Не удалось подготовить файл цен');
    }

    write_json_file(PRICING_FILE, $encoded . PHP_EOL);

    json_response(200, [
        'success' => true,
        'data' => $next,
    ]);
}

fail(405, 'Метод не поддерживается');
