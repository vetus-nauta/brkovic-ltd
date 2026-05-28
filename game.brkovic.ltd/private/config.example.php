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
    'smtp_config_path' => '',
    'mail_from' => 'no-reply@brkovic.ltd',
    'mail_from_name' => 'Brkovic Maritime Games',
];
