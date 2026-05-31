#!/usr/bin/env bash
set -euo pipefail

FTP_HOST="162.0.217.114"
REMOTE_PROBE="/game.brkovic.ltd/public/api/captain-ether/_atlas_probe_runtime.php"
REMOTE_URL="https://game.brkovic.ltd/api/captain-ether/_atlas_probe_runtime.php"
TMP_PROBE="$(mktemp)"

cleanup() {
  rm -f "$TMP_PROBE"
  curl --silent --show-error --fail --netrc --quote "DELE ${REMOTE_PROBE}" "ftp://${FTP_HOST}/" >/dev/null 2>&1 || true
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing required command: $1" >&2
    exit 1
  }
}

require_cmd curl

cat > "$TMP_PROBE" <<'PHP'
<?php
declare(strict_types=1);

require __DIR__ . '/../../../private/bootstrap.php';

function probe_run_node_check(array $config): array {
    $nodeBin = (string) ($config['node_bin'] ?? '');
    $driverPath = (string) ($config['driver_path'] ?? '');
    $uri = (string) ($config['uri'] ?? '');
    $database = (string) ($config['database'] ?? '');
    $timeoutMs = (int) ($config['timeout_ms'] ?? 15000);

    $result = [
        'node_bin' => $nodeBin,
        'driver_path' => $driverPath,
        'database' => $database,
        'node_exists' => $nodeBin !== '' && is_file($nodeBin),
        'driver_exists' => $driverPath !== '' && is_dir($driverPath),
        'proc_open_exists' => function_exists('proc_open'),
        'ping_ok' => false,
        'exit_code' => null,
        'stdout' => '',
        'stderr' => '',
    ];

    if (!$result['node_exists'] || !$result['driver_exists'] || !$result['proc_open_exists'] || $uri === '' || $database === '') {
        return $result;
    }

    $script = <<<'JS'
const { MongoClient } = require(process.env.CE_DRIVER_PATH);
(async () => {
  const client = new MongoClient(process.env.CE_URI, { serverSelectionTimeoutMS: Number(process.env.CE_TIMEOUT_MS || '15000') });
  try {
    await client.connect();
    await client.db(process.env.CE_DATABASE).command({ ping: 1 });
    process.stdout.write(JSON.stringify({ ok: true }));
  } finally {
    await client.close().catch(() => {});
  }
})().catch((error) => {
  process.stderr.write(String(error && error.stack ? error.stack : error));
  process.exit(1);
});
JS;

    $command = escapeshellarg($nodeBin) . ' -e ' . escapeshellarg($script);
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $env = array_merge($_ENV, [
        'CE_DRIVER_PATH' => $driverPath,
        'CE_URI' => $uri,
        'CE_DATABASE' => $database,
        'CE_TIMEOUT_MS' => (string) max(1000, $timeoutMs),
    ]);

    $process = @proc_open($command, $descriptors, $pipes, APP_ROOT, $env);
    if (!is_resource($process)) {
        $result['stderr'] = 'proc_open_failed';
        return $result;
    }

    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    $exitCode = proc_close($process);

    $result['exit_code'] = $exitCode;
    $result['stdout'] = $stdout === false ? '' : $stdout;
    $result['stderr'] = $stderr === false ? '' : $stderr;
    $result['ping_ok'] = $exitCode === 0;
    return $result;
}

$mirror = app_config('atlas_mirror', []);
$liveRead = app_config('atlas_live_read', []);
$primaryWrite = app_config('atlas_primary_write', []);

json_response(200, [
    'ok' => true,
    'mirror_enabled' => !empty($mirror['enabled']),
    'live_read_enabled' => !empty($liveRead['enabled']),
    'primary_write_enabled' => !empty($primaryWrite['enabled']),
    'node_probe' => probe_run_node_check(is_array($primaryWrite) ? $primaryWrite : []),
]);
PHP

curl --silent --show-error --fail --netrc --ftp-pasv --ftp-create-dirs \
  -T "$TMP_PROBE" "ftp://${FTP_HOST}${REMOTE_PROBE}" >/dev/null

curl --fail --silent --show-error "$REMOTE_URL"
echo
