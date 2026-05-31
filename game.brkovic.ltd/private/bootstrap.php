<?php
declare(strict_types=1);

const APP_ROOT = __DIR__ . '/..';
const STORAGE_DIR = APP_ROOT . '/storage';
const CONTENT_DIR = APP_ROOT . '/content';

function app_merge_recursive(array $base, array $overrides): array {
    foreach ($overrides as $key => $value) {
        if (is_array($value) && isset($base[$key]) && is_array($base[$key])) {
            $base[$key] = app_merge_recursive($base[$key], $value);
            continue;
        }
        $base[$key] = $value;
    }
    return $base;
}

function app_load_config_with_secret_overrides(string $configPath, string $exampleConfigPath): array {
    $config = is_file($configPath) ? require $configPath : require $exampleConfigPath;
    if (!is_array($config)) {
        return [];
    }

    $secretPath = trim((string) ($config['atlas_secret_path'] ?? ''));
    if ($secretPath === '' || !is_file($secretPath)) {
        return $config;
    }

    $secretOverrides = require $secretPath;
    if (!is_array($secretOverrides)) {
        return $config;
    }

    return app_merge_recursive($config, $secretOverrides);
}

$configPath = __DIR__ . '/config.php';
$exampleConfigPath = __DIR__ . '/config.example.php';
$appConfig = app_load_config_with_secret_overrides($configPath, $exampleConfigPath);

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
        $data = storage_source_for_mutation($name, $default);
        $result = $callback($data);
        storage_persist_after_mutation($name, $data);
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function storage_source_for_mutation(string $name, array $default): array {
    if (!atlas_primary_write_store_enabled($name)) {
        return storage_load_unlocked($name, $default);
    }

    return match ($name) {
        'progress' => progress_store(),
        'weak_points' => weak_points_store(),
        'watch_sessions' => watch_sessions_store(),
        'captain_answer_logs' => function_exists('captain_answer_logs_store')
            ? captain_answer_logs_store()
            : storage_load_unlocked($name, $default),
        default => storage_load_unlocked($name, $default),
    };
}

function storage_persist_after_mutation(string $name, array $data): void {
    if (atlas_primary_write_store_enabled($name)) {
        if (atlas_primary_write_sync_store($name, $data)) {
            if (atlas_primary_write_json_shadow_enabled()) {
                storage_write_unlocked($name, $data);
            }
            return;
        }
    }

    storage_write_unlocked($name, $data);
    atlas_mirror_sync_store($name, $data);
}

function atlas_mirror_config(): array {
    $config = app_config('atlas_mirror', []);
    return is_array($config) ? $config : [];
}

function atlas_mirror_enabled(): bool {
    return !empty(atlas_mirror_config()['enabled']);
}

function atlas_mirror_store_plan(string $name, array $data): ?array {
    $mirroredAt = iso_time();
    return match ($name) {
        'watch_sessions' => [
            'collection' => 'watch_sessions',
            'documents' => atlas_mirror_watch_session_documents($data, $mirroredAt),
        ],
        'progress' => [
            'collection' => 'progress',
            'documents' => atlas_mirror_progress_documents($data, $mirroredAt),
        ],
        'weak_points' => [
            'collection' => 'weak_points',
            'documents' => atlas_mirror_weak_point_documents($data, $mirroredAt),
        ],
        'captain_answer_logs' => [
            'collection' => 'answer_logs',
            'documents' => array_values(array_map(
                static function (array $entry) use ($mirroredAt): array {
                    $id = (string) ($entry['id'] ?? '');
                    return ['_id' => $id] + $entry + ['mirrored_at' => $mirroredAt];
                },
                array_filter($data['entries'] ?? [], 'is_array')
            )),
        ],
        default => null,
    };
}

function atlas_mirror_watch_session_documents(array $data, string $mirroredAt): array {
    $documents = [];
    foreach ($data['sessions'] ?? [] as $session) {
        if (!is_array($session)) continue;
        $id = (string) ($session['id'] ?? '');
        $documents[] = ['_id' => $id, 'session_id' => $id] + $session + ['mirrored_at' => $mirroredAt];
    }
    return $documents;
}

function atlas_mirror_progress_documents(array $data, string $mirroredAt): array {
    $documents = [];
    foreach ($data['users'] ?? [] as $userId => $progress) {
        if (!is_array($progress)) continue;
        $userId = (string) $userId;
        $documents[] = ['_id' => $userId, 'user_id' => $userId] + $progress + ['mirrored_at' => $mirroredAt];
    }
    return $documents;
}

function atlas_mirror_weak_point_documents(array $data, string $mirroredAt): array {
    $documents = [];
    foreach ($data['users'] ?? [] as $userId => $points) {
        if (!is_array($points)) continue;
        foreach ($points as $itemId => $point) {
            if (!is_array($point)) continue;
            $userId = (string) $userId;
            $resolvedItemId = (string) ($point['item_id'] ?? $itemId);
            $documents[] = ['_id' => $userId . ':' . $resolvedItemId, 'user_id' => $userId, 'item_id' => $resolvedItemId]
                + $point
                + ['mirrored_at' => $mirroredAt];
        }
    }
    return $documents;
}

function atlas_mirror_uri(array $config): string {
    $uri = trim((string) ($config['uri'] ?? ''));
    if ($uri !== '') return $uri;
    $envName = trim((string) ($config['uri_env'] ?? ''));
    if ($envName === '') return '';
    return trim((string) getenv($envName));
}

function atlas_mirror_clean_name(string $value): string {
    return preg_replace('/[^a-z0-9_.-]/i', '', trim($value)) ?? '';
}

function atlas_mirror_sync_store(string $name, array $data): void {
    if (!atlas_mirror_enabled()) return;
    $plan = atlas_mirror_store_plan($name, $data);
    if ($plan === null) return;

    $config = atlas_mirror_config();
    $uri = atlas_mirror_uri($config);
    $driverPath = trim((string) ($config['driver_path'] ?? ''));
    $nodeBin = trim((string) ($config['node_bin'] ?? 'node'));
    $database = atlas_mirror_clean_name((string) ($config['database'] ?? 'captain_ether'));
    $timeoutMs = max(1000, (int) ($config['timeout_ms'] ?? 15000));

    if ($uri === '' || $driverPath === '' || $nodeBin === '' || $database === '') {
        atlas_mirror_log('config_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Atlas mirror configuration is incomplete.',
        ]);
        return;
    }

    $encoded = json_encode($plan['documents'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        atlas_mirror_log('encode_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Could not encode Atlas mirror documents.',
        ]);
        return;
    }

    $command = escapeshellarg($nodeBin) . ' -e ' . escapeshellarg(atlas_mirror_node_script());
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $environment = array_merge($_ENV, [
        'ATLAS_MIRROR_URI' => $uri,
        'ATLAS_MIRROR_DRIVER_PATH' => $driverPath,
        'ATLAS_MIRROR_DATABASE' => $database,
        'ATLAS_MIRROR_COLLECTION' => atlas_mirror_clean_name((string) $plan['collection']),
        'ATLAS_MIRROR_TIMEOUT_MS' => (string) $timeoutMs,
    ]);

    $process = @proc_open($command, $descriptors, $pipes, APP_ROOT, $environment);
    if (!is_resource($process)) {
        atlas_mirror_log('process_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Could not start Atlas mirror process.',
        ]);
        return;
    }

    try {
        fwrite($pipes[0], $encoded);
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);
        if ($exitCode !== 0) {
            atlas_mirror_log('sync_error', $name, [
                'collection' => $plan['collection'],
                'exit_code' => $exitCode,
                'stdout' => atlas_mirror_truncate((string) $stdout),
                'stderr' => atlas_mirror_truncate((string) $stderr),
            ]);
        }
    } catch (Throwable $error) {
        foreach ($pipes as $pipe) {
            if (is_resource($pipe)) fclose($pipe);
        }
        proc_terminate($process);
        proc_close($process);
        atlas_mirror_log('runtime_error', $name, [
            'collection' => $plan['collection'],
            'message' => $error->getMessage(),
        ]);
    }
}

function atlas_mirror_log(string $type, string $store, array $context): void {
    $config = atlas_mirror_config();
    $path = (string) ($config['error_log'] ?? (STORAGE_DIR . '/atlas-mirror-error.log'));
    $payload = [
        'time' => iso_time(),
        'type' => $type,
        'store' => $store,
        'context' => $context,
    ];
    @file_put_contents(
        $path,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function atlas_mirror_truncate(string $value, int $limit = 2000): string {
    if (strlen($value) <= $limit) return $value;
    return substr($value, 0, $limit) . '...';
}

function atlas_mirror_node_script(): string {
    return <<<'JS'
const fs = require('fs');

const docs = JSON.parse(fs.readFileSync(0, 'utf8') || '[]');
const driverPath = process.env.ATLAS_MIRROR_DRIVER_PATH || '';
const uri = process.env.ATLAS_MIRROR_URI || '';
const database = process.env.ATLAS_MIRROR_DATABASE || '';
const collection = process.env.ATLAS_MIRROR_COLLECTION || '';
const timeoutMs = Number(process.env.ATLAS_MIRROR_TIMEOUT_MS || '15000');

if (!driverPath || !uri || !database || !collection) {
  throw new Error('Atlas mirror environment is incomplete.');
}

const { MongoClient } = require(driverPath);

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeoutMs });
  await client.connect();
  try {
    const target = client.db(database).collection(collection);
    await target.deleteMany({});
    if (docs.length > 0) {
      await target.insertMany(docs, { ordered: true });
    }
    process.stdout.write(JSON.stringify({ ok: true, count: docs.length }));
  } finally {
    await client.close();
  }
})().catch((error) => {
  process.stderr.write(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
JS;
}

function atlas_runtime_store_key(string $name): string {
    return match ($name) {
        'captain_answer_logs' => 'answer_logs',
        default => $name,
    };
}

function atlas_primary_write_config(): array {
    $config = app_config('atlas_primary_write', []);
    return is_array($config) ? $config : [];
}

function atlas_primary_write_enabled(): bool {
    return !empty(atlas_primary_write_config()['enabled']);
}

function atlas_primary_write_store_enabled(string $name): bool {
    if (!atlas_primary_write_enabled()) return false;
    $config = atlas_primary_write_config();
    $key = atlas_runtime_store_key($name);
    return !empty($config[$key . '_enabled']);
}

function atlas_primary_write_json_shadow_enabled(): bool {
    if (!atlas_primary_write_enabled()) return true;
    $config = atlas_primary_write_config();
    return !array_key_exists('json_shadow_enabled', $config) || !empty($config['json_shadow_enabled']);
}

function atlas_primary_write_uri(array $config): string {
    $uri = trim((string) ($config['uri'] ?? ''));
    if ($uri !== '') return $uri;
    $envName = trim((string) ($config['uri_env'] ?? ''));
    if ($envName !== '') {
        $value = trim((string) getenv($envName));
        if ($value !== '') return $value;
    }
    return atlas_live_read_uri(atlas_live_read_config());
}

function atlas_primary_write_sync_store(string $name, array $data): bool {
    $plan = atlas_mirror_store_plan($name, $data);
    if ($plan === null) return false;

    $config = atlas_primary_write_config();
    $uri = atlas_primary_write_uri($config);
    $driverPath = trim((string) ($config['driver_path'] ?? ''));
    $nodeBin = trim((string) ($config['node_bin'] ?? 'node'));
    $database = atlas_mirror_clean_name((string) ($config['database'] ?? 'captain_ether'));
    $timeoutMs = max(1000, (int) ($config['timeout_ms'] ?? 15000));

    if ($uri === '' || $driverPath === '' || $nodeBin === '' || $database === '') {
        atlas_primary_write_log('config_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Atlas primary-write configuration is incomplete.',
        ]);
        return false;
    }

    $encoded = json_encode($plan['documents'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        atlas_primary_write_log('encode_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Could not encode Atlas primary-write documents.',
        ]);
        return false;
    }

    $command = escapeshellarg($nodeBin) . ' -e ' . escapeshellarg(atlas_primary_write_node_script());
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $environment = array_merge($_ENV, [
        'ATLAS_PRIMARY_WRITE_URI' => $uri,
        'ATLAS_PRIMARY_WRITE_DRIVER_PATH' => $driverPath,
        'ATLAS_PRIMARY_WRITE_DATABASE' => $database,
        'ATLAS_PRIMARY_WRITE_COLLECTION' => atlas_mirror_clean_name((string) $plan['collection']),
        'ATLAS_PRIMARY_WRITE_TIMEOUT_MS' => (string) $timeoutMs,
    ]);

    $process = @proc_open($command, $descriptors, $pipes, APP_ROOT, $environment);
    if (!is_resource($process)) {
        atlas_primary_write_log('process_error', $name, [
            'collection' => $plan['collection'],
            'message' => 'Could not start Atlas primary-write process.',
        ]);
        return false;
    }

    try {
        fwrite($pipes[0], $encoded);
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);
        if ($exitCode !== 0) {
            atlas_primary_write_log('sync_error', $name, [
                'collection' => $plan['collection'],
                'exit_code' => $exitCode,
                'stdout' => atlas_mirror_truncate((string) $stdout),
                'stderr' => atlas_mirror_truncate((string) $stderr),
            ]);
            return false;
        }

        return true;
    } catch (Throwable $error) {
        foreach ($pipes as $pipe) {
            if (is_resource($pipe)) fclose($pipe);
        }
        proc_terminate($process);
        proc_close($process);
        atlas_primary_write_log('runtime_error', $name, [
            'collection' => $plan['collection'],
            'message' => $error->getMessage(),
        ]);
        return false;
    }
}

function atlas_primary_write_log(string $type, string $store, array $context): void {
    $config = atlas_primary_write_config();
    $path = (string) ($config['error_log'] ?? (STORAGE_DIR . '/atlas-primary-write-error.log'));
    $payload = [
        'time' => iso_time(),
        'type' => $type,
        'store' => $store,
        'context' => $context,
    ];
    @file_put_contents(
        $path,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function atlas_primary_write_node_script(): string {
    return <<<'JS'
const fs = require('fs');

const docs = JSON.parse(fs.readFileSync(0, 'utf8') || '[]');
const driverPath = process.env.ATLAS_PRIMARY_WRITE_DRIVER_PATH || '';
const uri = process.env.ATLAS_PRIMARY_WRITE_URI || '';
const database = process.env.ATLAS_PRIMARY_WRITE_DATABASE || '';
const collection = process.env.ATLAS_PRIMARY_WRITE_COLLECTION || '';
const timeoutMs = Number(process.env.ATLAS_PRIMARY_WRITE_TIMEOUT_MS || '15000');

if (!driverPath || !uri || !database || !collection) {
  throw new Error('Atlas primary-write environment is incomplete.');
}

const { MongoClient } = require(driverPath);

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeoutMs });
  await client.connect();
  try {
    const target = client.db(database).collection(collection);
    await target.deleteMany({});
    if (docs.length > 0) {
      await target.insertMany(docs, { ordered: true });
    }
    process.stdout.write(JSON.stringify({ ok: true, count: docs.length }));
  } finally {
    await client.close();
  }
})().catch((error) => {
  process.stderr.write(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
JS;
}

function atlas_live_read_config(): array {
    $config = app_config('atlas_live_read', []);
    return is_array($config) ? $config : [];
}

function atlas_live_read_enabled(): bool {
    return !empty(atlas_live_read_config()['enabled']);
}

function atlas_live_read_store_enabled(string $store): bool {
    if (!atlas_live_read_enabled()) return false;
    $config = atlas_live_read_config();
    return !empty($config[$store . '_enabled']);
}

function atlas_live_read_uri(array $config): string {
    $uri = trim((string) ($config['uri'] ?? ''));
    if ($uri !== '') return $uri;
    $envName = trim((string) ($config['uri_env'] ?? ''));
    if ($envName !== '') {
        $value = trim((string) getenv($envName));
        if ($value !== '') return $value;
    }
    $primaryConfig = atlas_primary_write_config();
    $primaryUri = trim((string) ($primaryConfig['uri'] ?? ''));
    if ($primaryUri !== '') return $primaryUri;
    $primaryEnvName = trim((string) ($primaryConfig['uri_env'] ?? ''));
    if ($primaryEnvName !== '') {
        $primaryEnvValue = trim((string) getenv($primaryEnvName));
        if ($primaryEnvValue !== '') return $primaryEnvValue;
    }
    return atlas_mirror_uri(atlas_mirror_config());
}

function atlas_live_read_collection_documents(string $collection): ?array {
    $config = atlas_live_read_config();
    $primaryConfig = atlas_primary_write_config();
    $uri = atlas_live_read_uri($config);
    $driverPath = trim((string) ($config['driver_path'] ?? ($primaryConfig['driver_path'] ?? '')));
    $nodeBin = trim((string) ($config['node_bin'] ?? ($primaryConfig['node_bin'] ?? 'node')));
    $database = atlas_mirror_clean_name((string) ($config['database'] ?? ($primaryConfig['database'] ?? 'captain_ether')));
    $timeoutMs = max(1000, (int) ($config['timeout_ms'] ?? 15000));
    $collection = atlas_mirror_clean_name($collection);

    if ($uri === '' || $driverPath === '' || $nodeBin === '' || $database === '' || $collection === '') {
        atlas_live_read_log('config_error', $collection, ['message' => 'Atlas live-read configuration is incomplete.']);
        return null;
    }

    $command = escapeshellarg($nodeBin) . ' -e ' . escapeshellarg(atlas_live_read_node_script());
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $environment = array_merge($_ENV, [
        'ATLAS_LIVE_READ_URI' => $uri,
        'ATLAS_LIVE_READ_DRIVER_PATH' => $driverPath,
        'ATLAS_LIVE_READ_DATABASE' => $database,
        'ATLAS_LIVE_READ_COLLECTION' => $collection,
        'ATLAS_LIVE_READ_TIMEOUT_MS' => (string) $timeoutMs,
    ]);

    $process = @proc_open($command, $descriptors, $pipes, APP_ROOT, $environment);
    if (!is_resource($process)) {
        atlas_live_read_log('process_error', $collection, ['message' => 'Could not start Atlas live-read process.']);
        return null;
    }

    try {
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);
        if ($exitCode !== 0) {
            atlas_live_read_log('read_error', $collection, [
                'exit_code' => $exitCode,
                'stdout' => atlas_mirror_truncate((string) $stdout),
                'stderr' => atlas_mirror_truncate((string) $stderr),
            ]);
            return null;
        }

        $payload = json_decode((string) $stdout, true);
        if (!is_array($payload) || !is_array($payload['documents'] ?? null)) {
            atlas_live_read_log('decode_error', $collection, ['stdout' => atlas_mirror_truncate((string) $stdout)]);
            return null;
        }
        return $payload['documents'];
    } catch (Throwable $error) {
        foreach ($pipes as $pipe) {
            if (is_resource($pipe)) fclose($pipe);
        }
        proc_terminate($process);
        proc_close($process);
        atlas_live_read_log('runtime_error', $collection, ['message' => $error->getMessage()]);
        return null;
    }
}

function atlas_live_read_log(string $type, string $collection, array $context): void {
    $config = atlas_live_read_config();
    $path = (string) ($config['error_log'] ?? (STORAGE_DIR . '/atlas-live-read-error.log'));
    $payload = [
        'time' => iso_time(),
        'type' => $type,
        'collection' => $collection,
        'context' => $context,
    ];
    @file_put_contents(
        $path,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function atlas_live_read_node_script(): string {
    return <<<'JS'
const driverPath = process.env.ATLAS_LIVE_READ_DRIVER_PATH || '';
const uri = process.env.ATLAS_LIVE_READ_URI || '';
const database = process.env.ATLAS_LIVE_READ_DATABASE || '';
const collection = process.env.ATLAS_LIVE_READ_COLLECTION || '';
const timeoutMs = Number(process.env.ATLAS_LIVE_READ_TIMEOUT_MS || '15000');

if (!driverPath || !uri || !database || !collection) {
  throw new Error('Atlas live-read environment is incomplete.');
}

const { MongoClient } = require(driverPath);

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeoutMs });
  await client.connect();
  try {
    const documents = await client.db(database).collection(collection).find({}).sort({ $natural: 1 }).toArray();
    process.stdout.write(JSON.stringify({ ok: true, documents }));
  } finally {
    await client.close();
  }
})().catch((error) => {
  process.stderr.write(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
JS;
}

function progress_live_read_enabled(): bool {
    return atlas_primary_write_store_enabled('progress') || atlas_live_read_store_enabled('progress');
}

function progress_store(): array {
    $jsonStore = storage_read('progress', progress_default());
    if (!progress_live_read_enabled()) {
        return $jsonStore;
    }

    $mongoDocuments = atlas_live_read_collection_documents('progress');
    if ($mongoDocuments === null) {
        return $jsonStore;
    }

    $mongoStore = progress_mongo_store($mongoDocuments);
    if (!progress_parity_ok($jsonStore, $mongoStore)) {
        atlas_live_read_log('parity_error', 'progress', [
            'json_users' => count(progress_store_users($jsonStore)),
            'mongo_users' => count(progress_store_users($mongoStore)),
        ]);
        return $jsonStore;
    }

    return $mongoStore;
}

function progress_mongo_store(array $documents): array {
    $users = [];
    foreach ($documents as $document) {
        if (!is_array($document)) continue;
        if (($document['_id'] ?? '') === '__meta__') continue;
        $userId = (string) ($document['user_id'] ?? '');
        if ($userId === '') continue;
        unset($document['_id'], $document['mirrored_at'], $document['user_id']);
        $users[$userId] = $document;
    }
    return ['users' => $users];
}

function progress_store_users(array $store): array {
    $users = [];
    foreach ($store['users'] ?? [] as $userId => $progress) {
        if (!is_array($progress)) continue;
        $users[(string) $userId] = $progress;
    }
    ksort($users);
    return $users;
}

function progress_parity_ok(array $jsonStore, array $mongoStore): bool {
    $jsonUsers = progress_store_users($jsonStore);
    $mongoUsers = progress_store_users($mongoStore);
    if (array_keys($jsonUsers) !== array_keys($mongoUsers)) {
        return false;
    }
    foreach ($jsonUsers as $userId => $progress) {
        if (($mongoUsers[$userId] ?? null) != $progress) {
            return false;
        }
    }
    return true;
}

function weak_points_live_read_enabled(): bool {
    return atlas_primary_write_store_enabled('weak_points') || atlas_live_read_store_enabled('weak_points');
}

function weak_points_store(): array {
    $jsonStore = storage_read('weak_points', weak_points_default());
    if (!weak_points_live_read_enabled()) {
        return $jsonStore;
    }

    $mongoDocuments = atlas_live_read_collection_documents('weak_points');
    if ($mongoDocuments === null) {
        return $jsonStore;
    }

    $mongoStore = weak_points_mongo_store($mongoDocuments);
    if (!weak_points_parity_ok($jsonStore, $mongoStore)) {
        atlas_live_read_log('parity_error', 'weak_points', [
            'json_users' => count(weak_points_store_users($jsonStore)),
            'mongo_users' => count(weak_points_store_users($mongoStore)),
        ]);
        return $jsonStore;
    }

    return $mongoStore;
}

function weak_points_mongo_store(array $documents): array {
    $users = [];
    foreach ($documents as $document) {
        if (!is_array($document)) continue;
        if (($document['_id'] ?? '') === '__meta__') continue;
        $userId = (string) ($document['user_id'] ?? '');
        $itemId = (string) ($document['item_id'] ?? '');
        if ($userId === '' || $itemId === '') continue;
        unset($document['_id'], $document['mirrored_at'], $document['user_id']);
        $users[$userId] = is_array($users[$userId] ?? null) ? $users[$userId] : [];
        $users[$userId][$itemId] = $document;
    }
    return ['users' => $users];
}

function weak_points_store_users(array $store): array {
    $users = [];
    foreach ($store['users'] ?? [] as $userId => $points) {
        if (!is_array($points)) continue;
        $normalizedPoints = [];
        foreach ($points as $itemId => $point) {
            if (!is_array($point)) continue;
            $normalizedPoints[(string) $itemId] = $point;
        }
        ksort($normalizedPoints);
        $users[(string) $userId] = $normalizedPoints;
    }
    ksort($users);
    return $users;
}

function weak_points_parity_ok(array $jsonStore, array $mongoStore): bool {
    $jsonUsers = weak_points_store_users($jsonStore);
    $mongoUsers = weak_points_store_users($mongoStore);
    if (array_keys($jsonUsers) !== array_keys($mongoUsers)) {
        return false;
    }
    foreach ($jsonUsers as $userId => $jsonPoints) {
        $mongoPoints = $mongoUsers[$userId] ?? null;
        if (!is_array($mongoPoints) || array_keys($jsonPoints) !== array_keys($mongoPoints)) {
            return false;
        }
        foreach ($jsonPoints as $itemId => $jsonPoint) {
            if (($mongoPoints[$itemId] ?? null) != $jsonPoint) {
                return false;
            }
        }
    }
    return true;
}

function watch_sessions_live_read_enabled(): bool {
    return atlas_primary_write_store_enabled('watch_sessions') || atlas_live_read_store_enabled('watch_sessions');
}

function watch_sessions_store(): array {
    $jsonStore = storage_read('watch_sessions', watch_sessions_default());
    if (!watch_sessions_live_read_enabled()) {
        return $jsonStore;
    }

    $mongoDocuments = atlas_live_read_collection_documents('watch_sessions');
    if ($mongoDocuments === null) {
        return $jsonStore;
    }

    $mongoStore = watch_sessions_mongo_store($mongoDocuments);
    if (!watch_sessions_parity_ok($jsonStore, $mongoStore)) {
        atlas_live_read_log('parity_error', 'watch_sessions', [
            'json_sessions' => count(watch_sessions_store_sessions($jsonStore)),
            'mongo_sessions' => count(watch_sessions_store_sessions($mongoStore)),
        ]);
        return $jsonStore;
    }

    return $mongoStore;
}

function watch_sessions_mongo_store(array $documents): array {
    $sessions = [];
    foreach ($documents as $document) {
        if (!is_array($document)) continue;
        if (($document['_id'] ?? '') === '__meta__') continue;
        $sessionId = (string) (($document['session_id'] ?? '') ?: ($document['id'] ?? ''));
        if ($sessionId === '') continue;
        unset($document['_id'], $document['mirrored_at'], $document['session_id']);
        $sessions[$sessionId] = $document;
    }
    return ['sessions' => $sessions];
}

function watch_sessions_store_sessions(array $store): array {
    $sessions = [];
    foreach ($store['sessions'] ?? [] as $sessionId => $session) {
        if (!is_array($session)) continue;
        $sessions[(string) $sessionId] = $session;
    }
    ksort($sessions);
    return $sessions;
}

function watch_sessions_parity_ok(array $jsonStore, array $mongoStore): bool {
    $jsonSessions = watch_sessions_store_sessions($jsonStore);
    $mongoSessions = watch_sessions_store_sessions($mongoStore);
    if (array_keys($jsonSessions) !== array_keys($mongoSessions)) {
        return false;
    }
    foreach ($jsonSessions as $sessionId => $jsonSession) {
        if (($mongoSessions[$sessionId] ?? null) != $jsonSession) {
            return false;
        }
    }
    return true;
}

function watch_sessions_mutate(callable $callback): mixed {
    $name = 'watch_sessions';
    $lockPath = STORAGE_DIR . '/.' . preg_replace('/[^a-z0-9_.-]/i', '', $name) . '.lock';
    $lock = fopen($lockPath, 'c+');
    if (!$lock) {
        json_response(500, ['ok' => false, 'error' => 'Storage lock unavailable']);
    }
    try {
        flock($lock, LOCK_EX);
        $data = storage_source_for_mutation($name, watch_sessions_default());
        $result = $callback($data);
        storage_persist_after_mutation($name, $data);
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
    $store = progress_store();
    $default = [
        'skip_cleanup_count' => 0,
        'completed_watches' => 0,
        'last_level' => 'beginner',
        'history' => [],
    ];
    return array_replace($default, $store['users'][$userId] ?? []);
}

function unresolved_weak_points(string $userId): array {
    $store = weak_points_store();
    $points = $store['users'][$userId] ?? [];
    return array_filter($points, static fn($point) => is_array($point) && empty($point['resolved_at']));
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
