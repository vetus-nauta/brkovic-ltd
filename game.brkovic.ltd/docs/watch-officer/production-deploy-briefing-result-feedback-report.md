# Watch Officer Production Deploy: Briefing + Result Feedback Pack

**Task:** `TASK-0075`  
**Status:** `production-prototype-updated`  
**Date:** 2026-05-26  
**Owner Chat:** `CHAT-PLATFORM-DEPLOY-001`  

## Scope

Controlled production deployment of the QA-approved Watch Officer `Briefing + Result Feedback Pack` staged public candidate.

This deployment updated only Watch Officer prototype/draft Godot Web build artifacts for:

```text
https://game.brkovic.ltd/play/watch-officer/
```

This is not final maritime training release approval.

## Remote Target

Production document root confirmed from project path docs:

```text
/home/brkovic/game.brkovic.ltd/public
```

FTP-visible target path used:

```text
/game.brkovic.ltd/public/play/watch-officer/
```

No credentials are recorded in this report.

## Backup

Every remote file overwritten by this task was backed up before upload to local storage outside the repository:

```text
/home/alexey/.local/share/brkovic-ltd/backups/watch-officer-briefing-result-production-deploy-20260526T205746Z/
```

Backup method:

```text
curl FTP fetch using local runtime credentials from the operator environment; credentials were not written to repo files, logs, screenshots, report, or chat output.
```

Backed up files:

```text
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

## Uploaded Files

Uploaded only the approved files:

```text
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

No `.import` files were uploaded.

## Pre-Upload Checks

```text
approved_artifacts_present: 10 passed, 0 failed
import_exclusion: 1 passed, 0 failed
forbidden_claim_scan: 1 passed, 0 failed
```

Local staged public file sizes before upload:

```text
.htaccess 385 bytes
index.apple-touch-icon.png 12142 bytes
index.audio.worklet.js 7199 bytes
index.html 6558 bytes
index.icon.png 5683 bytes
index.js 452321 bytes
index.pck 218288 bytes
index.png 21443 bytes
index.wasm 35708238 bytes
index.worker.js 5793 bytes
```

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

Production registry and route checks:

```text
Watch Officer entry_route: /games/watch-officer
Watch Officer launch_route: /play/watch-officer/
Watch Officer review_status: draft_not_final_training_content
Captain Ether entry_route: /games/captain-ether
production_registry_routes: 4 passed, 0 failed
```

Production app shell checks:

```text
production_app_js_syntax: 1 passed, 0 failed
briefLaunchPrototypeButton wiring present
draft/non-final wording present in brief route code
```

## Headers And MIME

`/play/watch-officer/` and Watch Officer artifact responses included:

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

Production browser smoke used Playwright/Chromium at 1280x720 against:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
https://game.brkovic.ltd/games/captain-ether
```

Scripted checks:

```text
brief_route: passed
launch_route: passed
canvas_non_empty: passed
Space start: passed
R reset: passed
Captain Ether route: passed
positive final/official/certified/COLREGS-compliant claim check: passed
```

Canvas samples:

```text
ready: 1280x720, non-empty, hash 1195288121
running after Space: 1280x720, non-empty, hash 3093735870
reset after R: 1280x720, non-empty, hash 1195288121
```

Visual screenshot checks:

```text
ready state shows briefing: passed
Space starts attempt and hides briefing: passed
R reset returns to ready with briefing visible: passed
VTS remains false/inactive: passed
no VTS popup appears: passed
draft/non-final wording remains visible: passed
```

Screenshots were kept outside the repository:

```text
/tmp/watch-officer-task-0075-smoke/brief-route.png
/tmp/watch-officer-task-0075-smoke/ready-briefing.png
/tmp/watch-officer-task-0075-smoke/running-after-space.png
/tmp/watch-officer-task-0075-smoke/reset-ready-briefing.png
/tmp/watch-officer-task-0075-smoke/captain-ether.png
```

Non-blocking browser console notes included known Godot Web/audio/readPixels warnings. They did not block route load, canvas rendering, Space start, R reset, VTS inactive visibility, or Captain Ether route rendering.

## Scope Confirmation

Confirmed untouched by this deployment:

```text
Captain Ether
Nav Desk
router/registry
auth
unrelated production config
unrelated files
```

No `.import` files were uploaded. No new scenario was created. VTS was not introduced for scenario 1. No final, official, certified, or COLREGS-compliant maritime training claim was introduced.

## Result

`TASK-0075` is complete with status `production-prototype-updated`.

