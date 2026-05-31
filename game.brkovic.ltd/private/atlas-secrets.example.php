<?php
declare(strict_types=1);

return [
    'atlas_mirror' => [
        'enabled' => true,
        'uri' => 'mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?appName=game-prod-01',
    ],
    'atlas_live_read' => [
        'enabled' => true,
        'uri' => 'mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?appName=game-prod-01',
    ],
    'atlas_primary_write' => [
        'enabled' => true,
        'uri' => 'mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?appName=game-prod-01',
    ],
];
