# Watch Officer Production Deploy Report

**Task:** `TASK-0063`  
**Status:** `production-prototype-deployed`  
**Date:** 2026-05-26  
**Owner Chat:** `CHAT-PLATFORM-DEPLOY-001`  

## Scope

Controlled production deployment of the approved Watch Officer prototype/draft candidate to:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

This deploy is not final maritime training release approval.

## Remote Target

Production document root confirmed from project path docs:

```text
/home/brkovic/game.brkovic.ltd/public
```

FTP-visible target paths used:

```text
/game.brkovic.ltd/content/game-registry.json
/game.brkovic.ltd/public/assets/app.js
/game.brkovic.ltd/public/play/watch-officer/
```

No credentials are recorded in this report.

## Backup

Remote files were backed up before upload to local storage outside the repository:

```text
/home/alexey/.local/share/brkovic-ltd/backups/watch-officer-production-deploy-20260526T192601Z/
```

Backed up existing remote files:

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js
```

`/game.brkovic.ltd/public/play/watch-officer/` was not present before this deployment, so no existing Watch Officer Godot files were overwritten there.

## Uploaded Files

Uploaded only the approved scope:

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js
game.brkovic.ltd/public/play/watch-officer/.htaccess
game.brkovic.ltd/public/play/watch-officer/index.apple-touch-icon.png
game.brkovic.ltd/public/play/watch-officer/index.audio.worklet.js
game.brkovic.ltd/public/play/watch-officer/index.html
game.brkovic.ltd/public/play/watch-officer/index.icon.png
game.brkovic.ltd/public/play/watch-officer/index.js
game.brkovic.ltd/public/play/watch-officer/index.pck
game.brkovic.ltd/public/play/watch-officer/index.png
game.brkovic.ltd/public/play/watch-officer/index.wasm
game.brkovic.ltd/public/play/watch-officer/index.worker.js
```

## Pre-Upload Checks

```text
registry_json: passed
app_js_syntax: passed
required_artifacts: passed
forbidden_final_training_wording_scan: passed
```

Forbidden wording scan checked:

```text
official
certified
COLREGS compliant
correct rule
```

No matches were found in the deployed Watch Officer registry/app/export files.

## Public URL Checks

```text
https://game.brkovic.ltd/games/watch-officer: HTTP 200
https://game.brkovic.ltd/play/watch-officer/: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.html: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.js: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.wasm: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.pck: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.worker.js: HTTP 200
https://game.brkovic.ltd/play/watch-officer/index.audio.worklet.js: HTTP 200
https://game.brkovic.ltd/games/captain-ether: HTTP 200
```

Production registry/app checks confirmed:

```text
brief route remains /games/watch-officer
brief route launches /play/watch-officer/
Watch Officer remains prototype/draft
Captain Ether remains /games/captain-ether
```

## Headers And MIME

`/play/watch-officer/` and the Watch Officer export files returned:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

MIME checks:

```text
/play/watch-officer/index.wasm: application/wasm
/play/watch-officer/index.pck: application/octet-stream
```

## Browser Smoke

Production browser smoke used Playwright/Chromium against:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

Result:

```text
browser_smoke: passed
brief_route: passed
play_route: passed
canvas: 1280x720, non-empty WebGL pixels
Space start: passed; canvas changed after Space
R reset: passed; canvas returned to ready-state hash
draft/non-final wording: visible in brief and canvas screenshot
VTS inactive: visible as false/inactive in canvas screenshot
```

Screenshots were kept outside the repository:

```text
/tmp/watch-officer-smoke/production-ready-focused.png
/tmp/watch-officer-smoke/production-after-space.png
/tmp/watch-officer-smoke/production-after-reset.png
```

## Scope Confirmation

Confirmed untouched by this deployment:

```text
Captain Ether gameplay
Captain Ether APIs
Nav Desk
auth
unrelated production config
```

No final, official, certified, or COLREGS-compliant maritime training claim was introduced.

## Result

`TASK-0063` is complete with status `production-prototype-deployed`.

