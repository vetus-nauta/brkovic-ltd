<?php
declare(strict_types=1);

session_name('brkovic_local_admin');
session_start();

const PRICING_FILE = __DIR__ . '/data/management-pricing.json';
const PROJECTS_FILE = __DIR__ . '/data/management-projects.json';

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
        'projectsFile' => [
            'path' => PROJECTS_FILE,
            'exists' => is_file(PROJECTS_FILE),
            'readable' => !is_file(PROJECTS_FILE) || is_readable(PROJECTS_FILE),
            'writable' => is_file(PROJECTS_FILE) ? is_writable(PROJECTS_FILE) : is_writable($dir),
            'perms' => is_file(PROJECTS_FILE) ? substr(sprintf('%o', fileperms(PROJECTS_FILE)), -4) : null,
            'owner' => function_exists('posix_getpwuid') && is_file(PROJECTS_FILE)
                ? (posix_getpwuid((int) fileowner(PROJECTS_FILE))['name'] ?? null)
                : null,
        ],
    ];
}

function read_json_file(string $path, string $label = 'цен'): array {
    if (!is_file($path)) {
        fail(404, 'Файл ' . $label . ' не найден');
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        fail(500, 'Не удалось прочитать файл ' . $label);
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail(500, 'Файл ' . $label . ' содержит некорректный JSON');
    }

    return $data;
}

function write_json_file(string $path, string $content, string $label = 'цен'): void {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        fail(500, 'Не найдена папка data для файла ' . $label);
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
        fail(500, 'Не удалось сохранить файл ' . $label . ': нет прав на запись в папку data' . $detail);
    }

    $tmp = tempnam($dir, '.management-data-');
    if ($tmp === false) {
        $detail = $directError ? ': ' . $directError : '';
        fail(500, 'Не удалось создать временный файл ' . $label . $detail);
    }

    $written = file_put_contents($tmp, $content, LOCK_EX);
    if ($written === false) {
        $detail = error_get_last()['message'] ?? 'ошибка записи временного файла';
        @unlink($tmp);
        fail(500, 'Не удалось записать временный файл ' . $label . ': ' . $detail);
    }

    @chmod($tmp, 0664);
    if (!rename($tmp, $path)) {
        $detail = error_get_last()['message'] ?? 'ошибка замены файла';
        @unlink($tmp);
        fail(500, 'Не удалось заменить файл ' . $label . ': ' . $detail);
    }
}

function default_projects_store(): array {
    return [
        'version' => 1,
        'updatedAt' => gmdate('c'),
        'counters' => [
            'project' => 0,
            'counterparty' => 0,
            'document' => 0,
            'commitment' => 0,
        ],
        'counterparties' => [],
        'projects' => [],
        'commitments' => [],
        'documents' => [],
    ];
}

function read_projects_store(): array {
    if (!is_file(PROJECTS_FILE)) {
        return default_projects_store();
    }

    $store = read_json_file(PROJECTS_FILE, 'проектов');
    $defaults = default_projects_store();
    foreach ($defaults as $key => $value) {
        if (!array_key_exists($key, $store)) {
            $store[$key] = $value;
        }
    }
    foreach (['counterparties', 'projects', 'commitments', 'documents'] as $key) {
        if (!is_array($store[$key])) {
            $store[$key] = [];
        }
    }
    if (!is_array($store['counters'])) {
        $store['counters'] = $defaults['counters'];
    }
    return $store;
}

function write_projects_store(array $store): void {
    $store['version'] = (int) ($store['version'] ?? 1);
    $store['updatedAt'] = gmdate('c');
    $encoded = json_encode($store, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        fail(500, 'Не удалось подготовить файл проектов');
    }
    write_json_file(PROJECTS_FILE, $encoded . PHP_EOL, 'проектов');
}

function clean_text(mixed $value, int $maxLength = 5000): string {
    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }
    if (!is_scalar($value)) {
        return '';
    }
    $text = trim((string) $value);
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }
    return substr($text, 0, $maxLength);
}

function clean_key(mixed $value): string {
    return preg_replace('/[^A-Za-z0-9_.:-]/', '', clean_text($value, 96)) ?: '';
}

function clean_recursive(mixed $value, int $depth = 0): mixed {
    if ($depth > 8) {
        return null;
    }
    if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
        return $value;
    }
    if (is_string($value)) {
        return clean_text($value);
    }
    if (!is_array($value)) {
        return null;
    }

    $clean = [];
    $isList = array_is_list($value);
    $count = 0;
    foreach ($value as $key => $item) {
        $count += 1;
        if ($count > 300) {
            break;
        }
        if ($isList) {
            $clean[] = clean_recursive($item, $depth + 1);
            continue;
        }
        $cleanKey = clean_text($key, 96);
        if ($cleanKey === '') {
            continue;
        }
        $clean[$cleanKey] = clean_recursive($item, $depth + 1);
    }
    return $clean;
}

function next_counter(array &$store, string $key): int {
    $store['counters'] = is_array($store['counters'] ?? null) ? $store['counters'] : [];
    $store['counters'][$key] = (int) ($store['counters'][$key] ?? 0) + 1;
    return (int) $store['counters'][$key];
}

function next_id(array &$store, string $prefix, string $counterKey): string {
    return $prefix . '_' . gmdate('Ymd') . '_' . str_pad((string) next_counter($store, $counterKey), 4, '0', STR_PAD_LEFT);
}

function next_number(array &$store, string $prefix, string $counterKey): string {
    return $prefix . '-' . gmdate('Ymd') . '-' . str_pad((string) next_counter($store, $counterKey), 3, '0', STR_PAD_LEFT);
}

function sanitize_document_html(mixed $html): string {
    $clean = clean_text($html, 300000);
    $clean = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $clean) ?? $clean;
    $clean = preg_replace('/\son[a-z]+\s*=\s*(["\']).*?\1/is', '', $clean) ?? $clean;
    return $clean;
}

function project_title(array $project): string {
    $clientData = is_array($project['client'] ?? null) ? $project['client'] : [];
    $yachtData = is_array($project['yacht'] ?? null) ? $project['yacht'] : [];
    $client = clean_text($clientData['name'] ?? '');
    $yacht = clean_text($yachtData['name'] ?? '');
    if ($client !== '' && $yacht !== '') {
        return $client . ' / ' . $yacht;
    }
    return $client !== '' ? $client : ($yacht !== '' ? $yacht : 'Yacht management project');
}

function ensure_project_numbers(array &$store, array &$project): void {
    $project['documentNumbers'] = is_array($project['documentNumbers'] ?? null) ? $project['documentNumbers'] : [];
    if (clean_text($project['projectNumber'] ?? '') === '') {
        $project['projectNumber'] = next_number($store, 'VN-YM', 'project');
    }
    if (clean_text($project['documentNumbers']['project'] ?? '') === '') {
        $project['documentNumbers']['project'] = $project['projectNumber'];
    }
}

function ensure_document_number(array &$store, array &$project, string $type): string {
    ensure_project_numbers($store, $project);
    $map = [
        'monthlyProforma' => ['monthlyProforma', 'VN-PF-M'],
        'oneTimeProforma' => ['oneTimeProforma', 'VN-PF-O'],
        'contract' => ['contract', 'VN-AGR'],
        'combinedProforma' => ['combinedProforma', 'VN-PF'],
    ];
    [$key, $prefix] = $map[$type] ?? ['document', 'VN-DOC'];
    if (clean_text($project['documentNumbers'][$key] ?? '') === '') {
        $project['documentNumbers'][$key] = next_number($store, $prefix, 'document');
    }
    return $project['documentNumbers'][$key];
}

function upsert_counterparty(array &$store, array $project): ?string {
    $client = is_array($project['client'] ?? null) ? $project['client'] : [];
    $name = clean_text($client['name'] ?? '');
    $email = strtolower(clean_text($client['email'] ?? ''));
    $phone = clean_text($client['phone'] ?? '');
    $company = clean_text($client['company'] ?? '');
    if ($name === '' && $email === '' && $phone === '' && $company === '') {
        return null;
    }

    $fingerprint = $email !== '' ? 'email:' . $email : ($phone !== '' ? 'phone:' . preg_replace('/\D+/', '', $phone) : 'name:' . strtolower($name . '|' . $company));
    foreach ($store['counterparties'] as &$counterparty) {
        if (($counterparty['fingerprint'] ?? '') !== $fingerprint) {
            continue;
        }
        $counterparty['name'] = $name !== '' ? $name : ($counterparty['name'] ?? '');
        $counterparty['email'] = $email !== '' ? $email : ($counterparty['email'] ?? '');
        $counterparty['phone'] = $phone !== '' ? $phone : ($counterparty['phone'] ?? '');
        $counterparty['company'] = $company !== '' ? $company : ($counterparty['company'] ?? '');
        $counterparty['updatedAt'] = gmdate('c');
        $counterparty['projectIds'] = is_array($counterparty['projectIds'] ?? null) ? $counterparty['projectIds'] : [];
        if (!in_array($project['id'], $counterparty['projectIds'] ?? [], true)) {
            $counterparty['projectIds'][] = $project['id'];
        }
        return $counterparty['id'];
    }
    unset($counterparty);

    $id = next_id($store, 'ymc', 'counterparty');
    $store['counterparties'][] = [
        'id' => $id,
        'fingerprint' => $fingerprint,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $company,
        'projectIds' => [$project['id']],
        'createdAt' => gmdate('c'),
        'updatedAt' => gmdate('c'),
    ];
    return $id;
}

function save_management_project(array &$store, array $input): array {
    $incoming = clean_recursive($input['project'] ?? []);
    if (!is_array($incoming)) {
        fail(400, 'Некорректные данные проекта');
    }

    $now = gmdate('c');
    $id = clean_key($incoming['id'] ?? '');
    if ($id === '') {
        $id = next_id($store, 'ymp', 'project');
    }
    $existingIndex = null;
    foreach ($store['projects'] as $index => $project) {
        if (($project['id'] ?? '') === $id) {
            $existingIndex = $index;
            break;
        }
    }

    $existing = $existingIndex === null ? [] : $store['projects'][$existingIndex];
    $project = array_replace_recursive($existing, $incoming);
    $project['id'] = $id;
    $project['status'] = clean_key($project['status'] ?? 'draft') ?: 'draft';
    $project['source'] = clean_key($project['source'] ?? 'admin') ?: 'admin';
    $project['title'] = clean_text($project['title'] ?? project_title($project), 240);
    $project['createdAt'] = clean_text($project['createdAt'] ?? ($existing['createdAt'] ?? $now));
    $project['updatedAt'] = $now;
    ensure_project_numbers($store, $project);

    $counterpartyId = upsert_counterparty($store, $project);
    if ($counterpartyId !== null) {
        $project['counterpartyId'] = $counterpartyId;
    }

    if ($existingIndex === null) {
        array_unshift($store['projects'], $project);
    } else {
        $store['projects'][$existingIndex] = $project;
    }

    return $project;
}

function add_project_document(array &$store, array &$project, string $type, mixed $html, string $status = 'issued'): array {
    $type = clean_key($type) ?: 'document';
    $number = ensure_document_number($store, $project, $type);
    $document = [
        'id' => next_id($store, 'ymd', 'document'),
        'projectId' => $project['id'],
        'projectNumber' => $project['projectNumber'] ?? '',
        'type' => $type,
        'number' => $number,
        'status' => clean_key($status) ?: 'issued',
        'title' => clean_text(project_title($project) . ' · ' . $number, 260),
        'totals' => clean_recursive($project['amounts'] ?? []),
        'html' => sanitize_document_html($html),
        'createdAt' => gmdate('c'),
    ];

    $project['documents'] = is_array($project['documents'] ?? null) ? $project['documents'] : [];
    $project['documents'][] = [
        'id' => $document['id'],
        'type' => $document['type'],
        'number' => $document['number'],
        'status' => $document['status'],
        'createdAt' => $document['createdAt'],
    ];
    $project['updatedAt'] = gmdate('c');
    array_unshift($store['documents'], $document);

    foreach ($store['projects'] as $index => $storedProject) {
        if (($storedProject['id'] ?? '') === $project['id']) {
            $store['projects'][$index] = $project;
            break;
        }
    }

    return $document;
}

function add_commitment(array &$store, array &$project): array {
    $commitment = [
        'id' => next_id($store, 'ymk', 'commitment'),
        'projectId' => $project['id'],
        'projectNumber' => $project['projectNumber'] ?? '',
        'counterpartyId' => $project['counterpartyId'] ?? null,
        'title' => project_title($project),
        'status' => 'saved',
        'createdAt' => gmdate('c'),
    ];
    array_unshift($store['commitments'], $commitment);
    $project['status'] = 'commitment';
    $project['commitmentId'] = $commitment['id'];
    return $commitment;
}

function handle_projects_request(array $input): array {
    $store = read_projects_store();
    $action = clean_key($input['action'] ?? 'saveProject') ?: 'saveProject';
    $project = save_management_project($store, $input);
    $document = null;
    $commitment = null;

    if ($action === 'saveCommitment') {
        $commitment = add_commitment($store, $project);
    }

    if ($action === 'issueDocument') {
        $type = clean_key($input['documentType'] ?? 'combinedProforma') ?: 'combinedProforma';
        $status = $type === 'contract' ? 'prepared' : 'issued';
        $document = add_project_document($store, $project, $type, $input['documentHtml'] ?? '', $status);
    }

    foreach ($store['projects'] as $index => $storedProject) {
        if (($storedProject['id'] ?? '') === $project['id']) {
            $store['projects'][$index] = $project;
            break;
        }
    }

    write_projects_store($store);

    return [
        'project' => $project,
        'document' => $document,
        'commitment' => $commitment,
        'store' => $store,
    ];
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
    if (isset($_GET['projects'])) {
        json_response(200, [
            'success' => true,
            'data' => read_projects_store(),
        ]);
    }
    json_response(200, [
        'success' => true,
        'data' => read_json_file(PRICING_FILE),
    ]);
}

if ($method === 'POST' && isset($_GET['projects'])) {
    require_admin();
    $raw = file_get_contents('php://input');
    $input = json_decode($raw ?: '', true);
    if (!is_array($input)) {
        fail(400, 'Некорректные JSON-данные');
    }

    json_response(200, [
        'success' => true,
        'data' => handle_projects_request($input),
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
