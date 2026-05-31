<?php
declare(strict_types=1);

return [
    'app_env' => 'local',
    'app_url' => 'https://game.brkovic.ltd',
    'session_cookie' => 'brk_game_session',
    'session_days' => 30,
    'login_code_ttl_minutes' => 10,
    'admin_emails' => [
        'admin@example.com',
    ],
    'ecosystem_sso_enabled' => false,
    'ecosystem_sso_secret' => 'CHANGE_ME_SHARED_SECRET',
    'brkovic_login_url' => 'https://brkovic.ltd/login',
    'atlas_secret_path' => '',
    'atlas_mirror' => [
        'enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'uri' => (string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_URI') ?: ''),
        'uri_env' => 'CAPTAIN_ETHER_ATLAS_MIRROR_URI',
        'node_bin' => (string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_NODE_BIN') ?: 'node'),
        'driver_path' => (string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DRIVER_PATH') ?: ''),
        'database' => (string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DATABASE') ?: 'captain_ether'),
        'timeout_ms' => (int) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_TIMEOUT_MS') ?: 15000),
        'error_log' => (string) (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_ERROR_LOG') ?: (APP_ROOT . '/storage/atlas-mirror-error.log')),
    ],
    'atlas_live_read' => [
        'enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'answer_logs_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_ANSWER_LOGS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'progress_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_PROGRESS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'weak_points_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_WEAK_POINTS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'watch_sessions_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_WATCH_SESSIONS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'uri' => (string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_URI') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_URI') ?: '')),
        'uri_env' => 'CAPTAIN_ETHER_ATLAS_LIVE_READ_URI',
        'node_bin' => (string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_NODE_BIN') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_NODE_BIN') ?: 'node')),
        'driver_path' => (string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_DRIVER_PATH') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DRIVER_PATH') ?: '')),
        'database' => (string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_DATABASE') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DATABASE') ?: 'captain_ether')),
        'timeout_ms' => (int) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_TIMEOUT_MS') ?: 15000),
        'error_log' => (string) (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_ERROR_LOG') ?: (APP_ROOT . '/storage/atlas-live-read-error.log')),
    ],
    'atlas_primary_write' => [
        'enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'answer_logs_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_ANSWER_LOGS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'progress_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_PROGRESS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'weak_points_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_WEAK_POINTS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'watch_sessions_enabled' => in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_WATCH_SESSIONS_ENABLED') ?: '0')),
            ['1', 'true', 'yes', 'on'],
            true
        ),
        'json_shadow_enabled' => !in_array(
            strtolower((string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_JSON_SHADOW_ENABLED') ?: '1')),
            ['0', 'false', 'no', 'off'],
            true
        ),
        'uri' => (string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_URI') ?: (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_URI') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_URI') ?: ''))),
        'uri_env' => 'CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_URI',
        'node_bin' => (string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_NODE_BIN') ?: (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_NODE_BIN') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_NODE_BIN') ?: 'node'))),
        'driver_path' => (string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_DRIVER_PATH') ?: (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_DRIVER_PATH') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DRIVER_PATH') ?: ''))),
        'database' => (string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_DATABASE') ?: (getenv('CAPTAIN_ETHER_ATLAS_LIVE_READ_DATABASE') ?: (getenv('CAPTAIN_ETHER_ATLAS_MIRROR_DATABASE') ?: 'captain_ether'))),
        'timeout_ms' => (int) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_TIMEOUT_MS') ?: 15000),
        'error_log' => (string) (getenv('CAPTAIN_ETHER_ATLAS_PRIMARY_WRITE_ERROR_LOG') ?: (APP_ROOT . '/storage/atlas-primary-write-error.log')),
    ],
    'smtp_config_path' => '',
    'mail_from' => 'no-reply@brkovic.ltd',
    'mail_from_name' => 'Brkovic Maritime Games',
];
