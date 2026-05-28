# Watch Officer Production Deploy: Scenario 1 Decision Coaching Pack

**Task:** `TASK-0089`  
**Status:** `production-prototype-updated`  
**Date:** 2026-05-27  
**Owner Chat:** `CHAT-PLATFORM-DEPLOY-001`  

## Scope

Controlled production deployment of the QA-approved Watch Officer `Scenario 1 Decision Coaching Pack` staged public candidate.

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
/home/alexey/.local/share/brkovic-ltd/backups/watch-officer-scenario-one-decision-coaching-production-deploy-20260527T142232Z/
```

Backup method:

```text
curl FTP fetch using local runtime credentials from the operator environment; credentials were not written to repository files, report, screenshots, or chat output.
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
htaccess_headers_mime: 6 passed, 0 failed
```

Local staged public file sizes before upload:

```text
.htaccess 385 bytes
index.apple-touch-icon.png 12142 bytes
index.audio.worklet.js 7199 bytes
index.html 6558 bytes
index.icon.png 5683 bytes
index.js 452321 bytes
index.pck 241840 bytes
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
godot_index_content: 1 passed, 0 failed
production_index_forbidden_claim_scan: 1 passed, 0 failed
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
ready_briefing_screenshot: captured
Space start: passed
opening_cue_immediate_screenshot: captured
opening_cue_hold_window_screenshot: captured
later_target_monitoring_screenshot: captured
R reset: passed
Captain Ether route: passed
positive final/official/certified/COLREGS-compliant claim check: passed
```

Canvas samples:

```text
ready: 1280x720, non-empty, hash 1195288121
immediate after Space: 1280x720, non-empty, hash 3183739035
early hold window: 1280x720, non-empty, hash 1102139554
later running: 1280x720, non-empty, hash 4152692715
reset after R: 1280x720, non-empty, hash 1195288121
```

Visual screenshot checks:

```text
ready state shows briefing: passed
Space starts attempt and hides briefing: passed
opening lateral-pair cue visible immediately: passed
opening cue text visible at early hold window, tick 30 / time 1.50s: passed
later running progresses to target monitoring cue: passed
R reset returns to ready with briefing visible and running coaching cleared: passed
VTS remains false/inactive: passed
no VTS popup appears: passed
draft/non-final wording remains visible: passed
```

Observed cue text:

```text
Read the lateral pair. Stay in the marked corridor.
Monitor the crossing target.
```

Screenshots were kept outside the repository:

```text
/tmp/watch-officer-task-0089-smoke/brief-route.png
/tmp/watch-officer-task-0089-smoke/ready-briefing.png
/tmp/watch-officer-task-0089-smoke/opening-cue-immediate.png
/tmp/watch-officer-task-0089-smoke/opening-cue-hold-window-fast.png
/tmp/watch-officer-task-0089-smoke/later-target-monitoring.png
/tmp/watch-officer-task-0089-smoke/reset-ready-briefing.png
/tmp/watch-officer-task-0089-smoke/captain-ether.png
```

Non-blocking browser console notes included known Godot Web/audio/readPixels warnings. They did not block route load, canvas rendering, Space start, cue visibility, later-running progression, R reset, VTS inactive visibility, or Captain Ether route rendering.

## Scope Confirmation

Confirmed untouched by this deployment:

```text
Captain Ether
Nav Desk
router/registry
auth
unrelated production config
unrelated files
FTP credentials
```

No `.import` files were uploaded. No new scenario was created. VTS was not introduced for scenario 1. No final, official, certified, COLREGS-compliant, legally correct, or approved-instruction maritime training claim was introduced.

## Result

`TASK-0089` is complete with status `production-prototype-updated`.

