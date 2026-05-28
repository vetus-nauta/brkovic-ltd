<?php
declare(strict_types=1);

return [
    // Keep the real key outside Git and outside public browser code.
    // Preferred production path: /home/brkovic/private/openai.env
    // Preferred local path: ~/.config/brkovic-ltd/openai.env
    'api_key' => 'PASTE_OPENAI_API_KEY_HERE',
    'model' => 'gpt-5.5',
    'reasoning_effort' => 'low',
    'text_verbosity' => 'medium',
    'request_timeout_seconds' => 90,
];
