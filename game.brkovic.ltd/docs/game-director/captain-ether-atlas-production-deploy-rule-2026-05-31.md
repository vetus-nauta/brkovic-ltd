# Captain Ether Atlas Production Deploy Rule — 2026-05-31

Scope: `Captain Ether` only.

## Fixed Production Dependencies

- Production code root: `/home/brkovic/game.brkovic.ltd`
- Production Atlas secret file: `/home/brkovic/private/captain-ether-atlas.php`
- Production Atlas example file: `/home/brkovic/private/captain-ether-atlas.example.php`
- Production Atlas driver path: `/home/brkovic/game.brkovic.ltd/private/node_modules/mongodb`
- Production Atlas allowlist IP: `162.0.217.98/32`

## Deploy Rule

1. Deploy only tracked `Captain Ether` code and config files.
2. Do not overwrite or delete `/home/brkovic/private/captain-ether-atlas.php`.
3. Do not overwrite or delete `/home/brkovic/game.brkovic.ltd/private/node_modules/mongodb`.
4. Keep `private/config.php` on the production-safe version that points to the server-only secret file.
5. After each deploy, run the production Atlas ping check.
6. If Atlas ping fails, stop and treat the deploy as incomplete.

## Approved Commands

Deploy:

```bash
game.brkovic.ltd/tools/captain-ether-production-deploy.sh
```

Post-deploy Atlas ping:

```bash
game.brkovic.ltd/tools/captain-ether-production-atlas-ping.sh
```

## Failure Policy

If the Atlas ping result shows `ping_ok=false`, do not continue with product work until one of these is fixed:

- broken or missing `/home/brkovic/private/captain-ether-atlas.php`
- broken or missing Mongo driver directory
- Atlas allowlist missing the production server IP
- production host network/TLS issue toward Atlas

## Expected Success Signal

Minimum acceptable result:

- `mirror_enabled=true`
- `live_read_enabled=true`
- `primary_write_enabled=true`
- `node_probe.ping_ok=true`
