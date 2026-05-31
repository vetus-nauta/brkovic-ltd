<?php
declare(strict_types=1);

session_name('brkovic_local_admin');
session_start();

const BRK_SEO_HOST = 'brkovic.ltd';
const BRK_SEO_BASE_URL = 'https://brkovic.ltd';

function brk_seo_json(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function brk_seo_ok(array $data = []): void {
    brk_seo_json(200, ['success' => true, 'data' => $data]);
}

function brk_seo_fail(int $status, string $message, array $details = []): void {
    brk_seo_json($status, [
        'success' => false,
        'error' => [
            'message' => $message,
            'details' => $details,
        ],
    ]);
}

function brk_seo_request_json(): array {
    $body = file_get_contents('php://input');
    if ($body === false || trim($body) === '') {
        return [];
    }
    $data = json_decode($body, true);
    if (!is_array($data)) {
        brk_seo_fail(400, 'Некорректный JSON.');
    }
    return $data;
}

function brk_seo_cookie_header(): string {
    $pairs = [];
    $stored = $_SESSION['brkovic_live_cookies'] ?? [];
    if (is_array($stored)) {
        foreach (['admin', 'toolUser'] as $key) {
            if (!empty($stored[$key]) && is_string($stored[$key])) {
                $pairs[] = $stored[$key];
            }
        }
    }
    $rawCookie = $_SERVER['HTTP_COOKIE'] ?? '';
    if (is_string($rawCookie) && trim($rawCookie) !== '') {
        $pairs[] = trim($rawCookie);
    }
    return implode('; ', array_unique($pairs));
}

function brk_seo_is_authenticated(): bool {
    $configuredTargetBase = getenv('BRK_TOOL_PROXY_TARGET_BASE');
    $targetBase = (is_string($configuredTargetBase) && trim($configuredTargetBase) !== '')
        ? rtrim(trim($configuredTargetBase), '/')
        : BRK_SEO_BASE_URL . '/api';
    $url = $targetBase . '/auth/me';
    $headers = ['Accept: application/json'];
    $cookie = brk_seo_cookie_header();
    if ($cookie !== '') {
        $headers[] = 'Cookie: ' . $cookie;
    }

    $ch = curl_init($url);
    if ($ch === false) {
        return false;
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $errNo = (int) curl_errno($ch);
    curl_close($ch);

    if ($body === false && $errNo !== 0) {
        return false;
    }
    if ($status < 200 || $status >= 300 || !is_string($body)) {
        return false;
    }
    $data = json_decode($body, true);
    if (!is_array($data)) {
        return false;
    }
    if (($data['authenticated'] ?? null) === true) {
        return true;
    }
    if (($data['data']['authenticated'] ?? null) === true) {
        return true;
    }
    return (($data['data']['data']['authenticated'] ?? null) === true);
}

function brk_seo_private_dir(): string {
    $candidates = [];
    $envDir = getenv('BRK_SEO_STORAGE_DIR');
    if (is_string($envDir) && trim($envDir) !== '') {
        $candidates[] = trim($envDir);
    }
    $candidates[] = '/home/brkovic/private/brkovic-seo';
    $home = getenv('HOME');
    if (is_string($home) && trim($home) !== '') {
        $candidates[] = rtrim($home, '/') . '/.local/share/brkovic-ltd/seo';
    }
    $candidates[] = __DIR__ . '/.private/seo';

    foreach ($candidates as $dir) {
        if ($dir === '') {
            continue;
        }
        if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
            continue;
        }
        if (!is_writable($dir)) {
            continue;
        }
        if (strpos(realpath($dir) ?: $dir, realpath(__DIR__) ?: __DIR__) === 0) {
            @file_put_contents(dirname($dir) . '/.htaccess', "Require all denied\nDeny from all\n");
            @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
        }
        return $dir;
    }

    brk_seo_fail(500, 'Не удалось подготовить приватное хранилище SEO.');
}

function brk_seo_settings_file(): string {
    return brk_seo_private_dir() . '/settings.json';
}

function brk_seo_allowed_setting_ids(): array {
    return [
        'gscVerification',
        'gscVerificationHost',
        'gscVerificationValue',
        'ga4MeasurementId',
        'gtmContainerId',
        'bingVerification',
        'yandexVerification',
        'clarityId',
        'metaPixelId',
        'indexNowKey',
    ];
}

function brk_seo_read_settings(): array {
    $file = brk_seo_settings_file();
    if (!is_file($file)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function brk_seo_sanitize_settings(array $data): array {
    $settings = [];
    foreach (brk_seo_allowed_setting_ids() as $id) {
        $value = $data[$id] ?? '';
        $value = is_scalar($value) ? trim((string) $value) : '';
        $settings[$id] = mb_substr($value, 0, 300);
    }
    if ($settings['indexNowKey'] !== '' && !preg_match('/^[A-Za-z0-9_-]{8,128}$/', $settings['indexNowKey'])) {
        brk_seo_fail(400, 'IndexNow key должен содержать 8-128 символов: латиница, цифры, дефис или подчеркивание.');
    }
    if (($settings['gscVerificationValue'] ?? '') === '' && ($settings['gscVerification'] ?? '') !== '') {
        $settings['gscVerificationValue'] = $settings['gscVerification'];
    }
    if (($settings['gscVerificationHost'] ?? '') === '' && ($settings['gscVerificationValue'] ?? '') !== '') {
        $settings['gscVerificationHost'] = '@';
    }
    return $settings;
}

function brk_seo_write_settings(array $data): array {
    $settings = brk_seo_sanitize_settings($data);
    $payload = json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($payload === false || file_put_contents(brk_seo_settings_file(), $payload . "\n", LOCK_EX) === false) {
        brk_seo_fail(500, 'Не удалось сохранить SEO-настройки.');
    }
    return $settings;
}

function brk_seo_pages(): array {
    return [
        ['path' => '/', 'label' => 'Главная', 'type' => 'home'],
        ['path' => '/journal.html', 'label' => 'Судовой журнал', 'type' => 'journal'],
        ['path' => '/navdesk.html', 'label' => 'Штурманский стол', 'type' => 'tool'],
        ['path' => '/ship-cashbox/index.html', 'label' => 'Судовая касса', 'type' => 'tool'],
        ['path' => '/navdesk-route.html', 'label' => 'Ортодромия и локсодромия', 'type' => 'tool'],
        ['path' => '/navdesk-tides.html', 'label' => 'Приливы и окно прохода', 'type' => 'tool'],
        ['path' => '/navdesk-ukv.html', 'label' => 'УКВ и шаблоны', 'type' => 'tool'],
        ['path' => '/navdesk-watch.html', 'label' => 'Вахтенный журнал', 'type' => 'tool'],
        ['path' => '/navdesk-english.html', 'label' => 'Maritime English', 'type' => 'tool'],
        ['path' => '/services/yacht-management.html', 'label' => 'Yacht Management', 'type' => 'service'],
        ['path' => '/services/iyt-training.html', 'label' => 'IYT Training', 'type' => 'service'],
        ['path' => '/services/skipper-service.html', 'label' => 'Skipper Service', 'type' => 'service'],
        ['path' => '/services/sailing-tours.html', 'label' => 'Sailing Tours', 'type' => 'service'],
        ['path' => '/services/yacht-acceptance-delivery.html', 'label' => 'Acceptance & Delivery', 'type' => 'service'],
        ['path' => '/services/yacht-registration.html', 'label' => 'Yacht Registration', 'type' => 'service'],
        ['path' => '/copyright.html', 'label' => 'Авторские права', 'type' => 'legal'],
    ];
}

function brk_seo_page_file(string $path): string {
    if ($path === '/') {
        return __DIR__ . '/index.html';
    }
    if (!preg_match('#^/[A-Za-z0-9/_-]+\.html$#', $path)) {
        brk_seo_fail(400, 'Недопустимый путь страницы.');
    }
    return __DIR__ . $path;
}

function brk_seo_attr(string $tag, string $name): string {
    if (preg_match('/\s' . preg_quote($name, '/') . '\s*=\s*([\'"])(.*?)\1/is', $tag, $m)) {
        return html_entity_decode(trim($m[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    return '';
}

function brk_seo_meta(string $html, string $attr, string $value): string {
    if (!preg_match_all('/<meta\b[^>]*>/is', $html, $matches)) {
        return '';
    }
    foreach ($matches[0] as $tag) {
        if (strcasecmp(brk_seo_attr($tag, $attr), $value) === 0) {
            return brk_seo_attr($tag, 'content');
        }
    }
    return '';
}

function brk_seo_link(string $html, string $rel, string $attr = 'href'): string {
    if (!preg_match_all('/<link\b[^>]*>/is', $html, $matches)) {
        return '';
    }
    foreach ($matches[0] as $tag) {
        if (strcasecmp(brk_seo_attr($tag, 'rel'), $rel) === 0) {
            return brk_seo_attr($tag, $attr);
        }
    }
    return '';
}

function brk_seo_hreflangs(string $html): array {
    if (!preg_match_all('/<link\b[^>]*>/is', $html, $matches)) {
        return [];
    }
    $langs = [];
    foreach ($matches[0] as $tag) {
        if (strcasecmp(brk_seo_attr($tag, 'rel'), 'alternate') !== 0) {
            continue;
        }
        $lang = brk_seo_attr($tag, 'hreflang');
        if ($lang !== '') {
            $langs[] = $lang;
        }
    }
    return array_values(array_unique($langs));
}

function brk_seo_text_title(string $html): string {
    if (preg_match('/<title\b[^>]*>(.*?)<\/title>/is', $html, $m)) {
        return trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }
    return '';
}

function brk_seo_tone(array $issues): string {
    foreach ($issues as $issue) {
        if (($issue['level'] ?? '') === 'error') {
            return 'error';
        }
    }
    foreach ($issues as $issue) {
        if (($issue['level'] ?? '') === 'warning') {
            return 'warning';
        }
    }
    return 'ok';
}

function brk_seo_audit_page(array $page): array {
    $file = brk_seo_page_file((string) $page['path']);
    if (!is_file($file)) {
        return $page + [
            'title' => '',
            'description' => '',
            'canonical' => '',
            'robots' => '',
            'hreflangs' => [],
            'jsonLdCount' => 0,
            'issues' => [['level' => 'error', 'text' => 'Файл страницы не найден.']],
            'tone' => 'error',
        ];
    }
    $html = (string) file_get_contents($file);
    $title = brk_seo_text_title($html);
    $description = brk_seo_meta($html, 'name', 'description');
    $robots = brk_seo_meta($html, 'name', 'robots');
    $canonical = brk_seo_link($html, 'canonical');
    $ogTitle = brk_seo_meta($html, 'property', 'og:title');
    $ogDescription = brk_seo_meta($html, 'property', 'og:description');
    $ogImage = brk_seo_meta($html, 'property', 'og:image');
    $twitterTitle = brk_seo_meta($html, 'name', 'twitter:title');
    $hreflangs = brk_seo_hreflangs($html);
    $jsonLdCount = preg_match_all('/<script\b[^>]*type\s*=\s*([\'"])application\/ld\+json\1[^>]*>/is', $html);
    $issues = [];

    if ($title === '') {
        $issues[] = ['level' => 'error', 'text' => 'Нет title.'];
    } elseif (mb_strlen($title) > 75) {
        $issues[] = ['level' => 'warning', 'text' => 'Title длинный: ' . mb_strlen($title) . ' символов.'];
    }
    if ($description === '') {
        $issues[] = ['level' => 'error', 'text' => 'Нет meta description.'];
    } elseif (mb_strlen($description) > 175) {
        $issues[] = ['level' => 'warning', 'text' => 'Description длинный: ' . mb_strlen($description) . ' символов.'];
    }
    if ($canonical === '') {
        $issues[] = ['level' => 'error', 'text' => 'Нет canonical.'];
    }
    if (stripos($robots, 'noindex') !== false) {
        $issues[] = ['level' => 'error', 'text' => 'Страница закрыта noindex.'];
    }
    if ($robots === '') {
        $issues[] = ['level' => 'warning', 'text' => 'Нет robots meta.'];
    }
    if ($ogTitle === '' || $ogDescription === '' || $ogImage === '') {
        $issues[] = ['level' => 'warning', 'text' => 'Open Graph заполнен не полностью.'];
    }
    if ($twitterTitle === '') {
        $issues[] = ['level' => 'warning', 'text' => 'Twitter Card заполнен не полностью.'];
    }
    if (strpos($html, 'js/seo.js') === false) {
        $issues[] = ['level' => 'warning', 'text' => 'Не подключен js/seo.js.'];
    }
    if ($jsonLdCount < 1) {
        $issues[] = ['level' => 'warning', 'text' => 'Нет JSON-LD.'];
    }
    $requiredLangs = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh', 'x-default'];
    foreach ($requiredLangs as $lang) {
        if (!in_array($lang, $hreflangs, true)) {
            $issues[] = ['level' => 'warning', 'text' => 'Hreflang покрытие неполное.'];
            break;
        }
    }
    if (($page['path'] ?? '') !== '/copyright.html' && strpos($html, 'copyright.html') === false) {
        $issues[] = ['level' => 'warning', 'text' => 'В футере не найдена ссылка на авторские права.'];
    }

    return $page + [
        'title' => $title,
        'description' => $description,
        'canonical' => $canonical,
        'robots' => $robots,
        'hreflangs' => $hreflangs,
        'jsonLdCount' => $jsonLdCount,
        'ogTitle' => $ogTitle,
        'ogDescription' => $ogDescription,
        'ogImage' => $ogImage,
        'issues' => $issues,
        'tone' => brk_seo_tone($issues),
    ];
}

function brk_seo_audit_sitemap(): array {
    $file = __DIR__ . '/sitemap.xml';
    if (!is_file($file)) {
        return ['ok' => false, 'urls' => 0, 'copyrightFound' => false, 'hreflangLinks' => 0, 'issues' => ['sitemap.xml не найден.']];
    }
    $text = (string) file_get_contents($file);
    preg_match_all('/<loc>\s*([^<]+)\s*<\/loc>/i', $text, $locMatches);
    $locs = array_map('trim', $locMatches[1] ?? []);
    $hreflangLinks = preg_match_all('/\bhreflang\s*=/i', $text);
    $issues = [];
    if (!in_array(BRK_SEO_BASE_URL . '/copyright.html', $locs, true)) {
        $issues[] = 'copyright.html отсутствует в sitemap.';
    }
    foreach (brk_seo_pages() as $page) {
        if (!in_array(BRK_SEO_BASE_URL . $page['path'], $locs, true)) {
            $issues[] = $page['path'] . ' отсутствует в sitemap.';
        }
    }
    if ($hreflangLinks < 1) {
        $issues[] = 'В sitemap не найдены hreflang-ссылки.';
    }
    return [
        'ok' => count($issues) === 0,
        'urls' => count($locs),
        'locs' => $locs,
        'copyrightFound' => in_array(BRK_SEO_BASE_URL . '/copyright.html', $locs, true),
        'hreflangLinks' => $hreflangLinks,
        'issues' => $issues,
    ];
}

function brk_seo_audit_robots(): array {
    $file = __DIR__ . '/robots.txt';
    if (!is_file($file)) {
        return ['ok' => false, 'hasSitemap' => false, 'blocksAdmin' => false, 'issues' => ['robots.txt не найден.']];
    }
    $text = (string) file_get_contents($file);
    $hasSitemap = (bool) preg_match('/sitemap:\s*https:\/\/brkovic\.ltd\/sitemap\.xml/i', $text);
    $blocksAdmin = (bool) preg_match('/disallow:\s*\/admin-seo\.html/i', $text)
        && (bool) preg_match('/disallow:\s*\/admin-seo-api\.php/i', $text);
    $issues = [];
    if (!$hasSitemap) {
        $issues[] = 'Нет директивы Sitemap.';
    }
    if (!$blocksAdmin) {
        $issues[] = 'SEO Admin/API не полностью закрыты в robots.';
    }
    return [
        'ok' => count($issues) === 0,
        'hasSitemap' => $hasSitemap,
        'blocksAdmin' => $blocksAdmin,
        'issues' => $issues,
    ];
}

function brk_seo_run_audit(): array {
    $pageResults = [];
    foreach (brk_seo_pages() as $page) {
        $pageResults[] = brk_seo_audit_page($page);
    }
    $summary = [
        'total' => count($pageResults),
        'ok' => count(array_filter($pageResults, static fn($item) => ($item['tone'] ?? '') === 'ok')),
        'warning' => count(array_filter($pageResults, static fn($item) => ($item['tone'] ?? '') === 'warning')),
        'error' => count(array_filter($pageResults, static fn($item) => ($item['tone'] ?? '') === 'error')),
    ];
    return [
        'pages' => $pageResults,
        'sitemap' => brk_seo_audit_sitemap(),
        'robots' => brk_seo_audit_robots(),
        'searchConsole' => brk_seo_audit_search_console(),
        'analytics' => brk_seo_audit_analytics(),
        'summary' => $summary,
        'generatedAt' => gmdate('c'),
    ];
}

function brk_seo_audit_search_console(): array {
    $settings = brk_seo_read_settings();
    $host = isset($settings['gscVerificationHost']) && is_string($settings['gscVerificationHost'])
        ? trim($settings['gscVerificationHost'])
        : '';
    $value = isset($settings['gscVerificationValue']) && is_string($settings['gscVerificationValue'])
        ? trim($settings['gscVerificationValue'])
        : '';
    if ($value === '' && isset($settings['gscVerification']) && is_string($settings['gscVerification'])) {
        $value = trim($settings['gscVerification']);
    }
    if ($host === '' && $value !== '') {
        $host = '@';
    }

    $queryHost = $host;
    if ($queryHost === '' || $queryHost === '@') {
        $queryHost = BRK_SEO_HOST;
    } elseif (strpos($queryHost, '.') === false) {
        $queryHost .= '.' . BRK_SEO_HOST;
    }

    $dnsFound = false;
    $dnsError = '';
    if ($value !== '' && function_exists('dns_get_record')) {
        $records = @dns_get_record($queryHost, DNS_TXT);
        if (is_array($records)) {
            foreach ($records as $record) {
                $txt = isset($record['txt']) && is_string($record['txt']) ? trim($record['txt']) : '';
                if ($txt === $value) {
                    $dnsFound = true;
                    break;
                }
            }
        }
    } elseif ($value !== '') {
        $dnsError = 'dns_get_record недоступен на сервере.';
    }

    return [
        'host' => $host,
        'value' => $value,
        'configured' => $value !== '',
        'dnsHost' => $queryHost,
        'dnsFound' => $dnsFound,
        'dnsError' => $dnsError,
    ];
}

function brk_seo_audit_analytics(): array {
    $settings = brk_seo_read_settings();
    $ga4Id = isset($settings['ga4MeasurementId']) && is_string($settings['ga4MeasurementId'])
        ? trim($settings['ga4MeasurementId'])
        : '';
    $clarityId = isset($settings['clarityId']) && is_string($settings['clarityId'])
        ? trim($settings['clarityId'])
        : '';
    $seoScript = __DIR__ . '/js/seo.js';
    $scriptText = is_file($seoScript) ? (string) file_get_contents($seoScript) : '';
    $connected = $ga4Id !== ''
        && strpos($scriptText, $ga4Id) !== false
        && strpos($scriptText, 'googletagmanager.com/gtag/js') !== false;
    $clarityConnected = $clarityId !== ''
        && strpos($scriptText, $clarityId) !== false
        && strpos($scriptText, 'clarity.ms/tag') !== false;

    return [
        'ga4MeasurementId' => $ga4Id,
        'configured' => $ga4Id !== '',
        'connected' => $connected,
        'clarityId' => $clarityId,
        'clarityConfigured' => $clarityId !== '',
        'clarityConnected' => $clarityConnected,
        'source' => 'js/seo.js',
    ];
}

function brk_seo_valid_indexnow_key(string $key): bool {
    return (bool) preg_match('/^[A-Za-z0-9_-]{8,128}$/', $key);
}

function brk_seo_indexnow_key_file(string $key): string {
    if (!brk_seo_valid_indexnow_key($key)) {
        brk_seo_fail(400, 'Некорректный IndexNow key.');
    }
    return __DIR__ . '/' . $key . '.txt';
}

function brk_seo_create_indexnow_key(bool $force = false): array {
    $settings = brk_seo_read_settings();
    $key = isset($settings['indexNowKey']) && is_string($settings['indexNowKey']) ? trim($settings['indexNowKey']) : '';
    if ($force || !brk_seo_valid_indexnow_key($key)) {
        $key = bin2hex(random_bytes(16));
        $settings['indexNowKey'] = $key;
    }
    $file = brk_seo_indexnow_key_file($key);
    if (file_put_contents($file, $key . "\n", LOCK_EX) === false) {
        brk_seo_fail(500, 'Не удалось создать IndexNow key-файл в корне сайта.');
    }
    brk_seo_write_settings($settings);
    return [
        'key' => $key,
        'keyLocation' => BRK_SEO_BASE_URL . '/' . $key . '.txt',
        'fileCreated' => true,
    ];
}

function brk_seo_normalize_indexnow_urls(array $urlList): array {
    $allowedPaths = array_map(static fn($page) => $page['path'], brk_seo_pages());
    $urls = [];
    foreach ($urlList as $url) {
        if (!is_scalar($url)) {
            continue;
        }
        $url = trim((string) $url);
        if ($url === '') {
            continue;
        }
        $parts = parse_url($url);
        if (!is_array($parts)) {
            continue;
        }
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $path = (string) ($parts['path'] ?? '/');
        if ($scheme !== 'https' || $host !== BRK_SEO_HOST || !in_array($path, $allowedPaths, true)) {
            continue;
        }
        $urls[] = BRK_SEO_BASE_URL . $path;
    }
    return array_values(array_unique(array_slice($urls, 0, 100)));
}

function brk_seo_submit_indexnow(array $urlList): array {
    $settings = brk_seo_read_settings();
    $key = isset($settings['indexNowKey']) && is_string($settings['indexNowKey']) ? trim($settings['indexNowKey']) : '';
    if (!brk_seo_valid_indexnow_key($key)) {
        brk_seo_fail(400, 'Сначала создайте IndexNow key.');
    }
    $file = brk_seo_indexnow_key_file($key);
    if (!is_file($file)) {
        brk_seo_fail(400, 'IndexNow key-файл не найден в корне сайта. Нажмите “IndexNow key”.');
    }
    $urls = brk_seo_normalize_indexnow_urls($urlList);
    if (!$urls) {
        $urls = array_map(static fn($page) => BRK_SEO_BASE_URL . $page['path'], brk_seo_pages());
    }
    $payload = json_encode([
        'host' => BRK_SEO_HOST,
        'key' => $key,
        'keyLocation' => BRK_SEO_BASE_URL . '/' . $key . '.txt',
        'urlList' => $urls,
    ], JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        brk_seo_fail(500, 'Не удалось подготовить IndexNow payload.');
    }
    $ch = curl_init('https://api.indexnow.org/indexnow');
    if ($ch === false) {
        brk_seo_fail(500, 'cURL недоступен.');
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 25,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    return [
        'submittedUrls' => $urls,
        'status' => $status,
        'accepted' => in_array($status, [200, 202], true),
        'response' => is_string($body) ? mb_substr($body, 0, 1000) : '',
        'curlError' => $error,
    ];
}

function brk_seo_read_env_file(string $file): array {
    if (!is_file($file) || !is_readable($file)) {
        return [];
    }
    $data = [];
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $data[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
    return $data;
}

function brk_seo_openai_config(): array {
    $config = [
        'api_key' => getenv('OPENAI_API_KEY') ?: '',
        'model' => getenv('OPENAI_MODEL') ?: 'gpt-5',
        'reasoning_effort' => getenv('OPENAI_REASONING_EFFORT') ?: 'low',
        'text_verbosity' => getenv('OPENAI_TEXT_VERBOSITY') ?: 'medium',
        'request_timeout_seconds' => (int) (getenv('OPENAI_TIMEOUT_SECONDS') ?: 90),
    ];

    foreach (['/home/brkovic/private/openai.env', (getenv('HOME') ?: '') . '/.config/brkovic-ltd/openai.env'] as $file) {
        $env = brk_seo_read_env_file($file);
        if (!$env) {
            continue;
        }
        $config['api_key'] = $env['OPENAI_API_KEY'] ?? $env['api_key'] ?? $config['api_key'];
        $config['model'] = $env['OPENAI_MODEL'] ?? $env['model'] ?? $config['model'];
        $config['reasoning_effort'] = $env['OPENAI_REASONING_EFFORT'] ?? $env['reasoning_effort'] ?? $config['reasoning_effort'];
        $config['text_verbosity'] = $env['OPENAI_TEXT_VERBOSITY'] ?? $env['text_verbosity'] ?? $config['text_verbosity'];
        $config['request_timeout_seconds'] = (int) ($env['OPENAI_TIMEOUT_SECONDS'] ?? $env['request_timeout_seconds'] ?? $config['request_timeout_seconds']);
    }

    $phpConfigFile = __DIR__ . '/api/openai.config.php';
    if (is_file($phpConfigFile)) {
        $phpConfig = include $phpConfigFile;
        if (is_array($phpConfig)) {
            foreach (['api_key', 'model', 'reasoning_effort', 'text_verbosity', 'request_timeout_seconds'] as $key) {
                if (!empty($phpConfig[$key])) {
                    $config[$key] = $phpConfig[$key];
                }
            }
        }
    }

    if ($config['api_key'] === 'PASTE_OPENAI_API_KEY_HERE') {
        $config['api_key'] = '';
    }
    $config['request_timeout_seconds'] = max(20, min(180, (int) $config['request_timeout_seconds']));
    return $config;
}

function brk_seo_extract_openai_text(array $response): string {
    if (isset($response['output_text']) && is_string($response['output_text'])) {
        return trim($response['output_text']);
    }
    $chunks = [];
    foreach (($response['output'] ?? []) as $item) {
        if (!is_array($item)) {
            continue;
        }
        foreach (($item['content'] ?? []) as $content) {
            if (is_array($content) && isset($content['text']) && is_string($content['text'])) {
                $chunks[] = $content['text'];
            }
        }
    }
    return trim(implode("\n", $chunks));
}

function brk_seo_ai_draft(array $payload): array {
    $config = brk_seo_openai_config();
    if (trim((string) $config['api_key']) === '') {
        return [
            'available' => false,
            'message' => 'OpenAI key не найден на сервере. SEO Admin готов, AI включится после размещения ключа вне public_html.',
        ];
    }
    $selectedPath = isset($payload['path']) && is_string($payload['path']) ? $payload['path'] : '/';
    $page = null;
    foreach (brk_seo_run_audit()['pages'] as $candidate) {
        if (($candidate['path'] ?? '') === $selectedPath) {
            $page = $candidate;
            break;
        }
    }
    if (!$page) {
        $page = brk_seo_audit_page(brk_seo_pages()[0]);
    }
    $userPrompt = isset($payload['prompt']) && is_string($payload['prompt']) ? mb_substr($payload['prompt'], 0, 6000) : '';
    $input = [
        'Страница: ' . BRK_SEO_BASE_URL . $page['path'],
        'Тип: ' . ($page['type'] ?? 'page'),
        'Текущий title: ' . ($page['title'] ?? ''),
        'Текущий description: ' . ($page['description'] ?? ''),
        'Canonical: ' . ($page['canonical'] ?? ''),
        'Замечания: ' . json_encode($page['issues'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'Дополнительное ТЗ из панели:',
        $userPrompt,
    ];
    $request = [
        'model' => (string) $config['model'],
        'reasoning' => ['effort' => (string) $config['reasoning_effort']],
        'text' => ['verbosity' => (string) $config['text_verbosity']],
        'instructions' => 'Ты SEO-редактор VETUS NAUTA - Brkovic. Дай практичный черновик без автопубликации. Пиши по-русски для владельца сайта. Учитывай языки en, ru, de, it, es, sr, zh и морскую аудиторию. Верни: диагноз, приоритеты, title/description по языкам, внутренние ссылки, риск переспама, что проверить руками.',
        'input' => implode("\n", $input),
    ];
    $ch = curl_init('https://api.openai.com/v1/responses');
    if ($ch === false) {
        brk_seo_fail(500, 'cURL недоступен.');
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $config['api_key'],
        ],
        CURLOPT_POSTFIELDS => json_encode($request, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => (int) $config['request_timeout_seconds'],
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if (!is_string($body) || $status < 200 || $status >= 300) {
        return [
            'available' => true,
            'ok' => false,
            'message' => 'OpenAI вернул ошибку. Ключ не раскрывается.',
            'status' => $status,
            'curlError' => $error,
            'response' => is_string($body) ? mb_substr($body, 0, 1000) : '',
        ];
    }
    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        return [
            'available' => true,
            'ok' => false,
            'message' => 'OpenAI ответил не JSON.',
            'status' => $status,
        ];
    }
    return [
        'available' => true,
        'ok' => true,
        'model' => (string) $config['model'],
        'draft' => brk_seo_extract_openai_text($decoded),
    ];
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$action = $_GET['action'] ?? '';
if (!is_string($action) || $action === '') {
    brk_seo_fail(400, 'Не указано действие SEO API.');
}
if (!brk_seo_is_authenticated()) {
    brk_seo_fail(401, 'Нужна авторизация администратора.');
}

switch ($action) {
    case 'settings':
        if ($method === 'GET') {
            brk_seo_ok(['settings' => brk_seo_read_settings()]);
        }
        if ($method === 'POST') {
            brk_seo_ok(['settings' => brk_seo_write_settings(brk_seo_request_json())]);
        }
        break;

    case 'audit':
        if ($method === 'GET' || $method === 'POST') {
            brk_seo_ok(brk_seo_run_audit());
        }
        break;

    case 'indexnow-key':
        if ($method === 'POST') {
            $payload = brk_seo_request_json();
            brk_seo_ok(brk_seo_create_indexnow_key(($payload['force'] ?? false) === true));
        }
        break;

    case 'indexnow-submit':
        if ($method === 'POST') {
            $payload = brk_seo_request_json();
            $urls = isset($payload['urlList']) && is_array($payload['urlList']) ? $payload['urlList'] : [];
            brk_seo_ok(brk_seo_submit_indexnow($urls));
        }
        break;

    case 'ai-draft':
        if ($method === 'POST') {
            brk_seo_ok(brk_seo_ai_draft(brk_seo_request_json()));
        }
        break;
}

brk_seo_fail(405, 'Метод или действие SEO API не разрешены.');
