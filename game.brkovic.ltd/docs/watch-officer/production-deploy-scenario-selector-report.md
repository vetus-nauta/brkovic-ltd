# Production Deploy Scenario Selector Report

**Task:** TASK-0120  
**Owner:** Game Director / Platform Deploy  
**Date:** 2026-05-27  
**Status:** production-updated

## Summary

The approved Watch Officer Scenario 1 / Scenario 2 selector build was deployed to production:

```text
https://game.brkovic.ltd/play/watch-officer/
```

This deployment updated only the Watch Officer Godot Web files under the production Watch Officer play path.

This is not final maritime training release approval.

## Remote Target

FTP-visible target path used:

```text
/game.brkovic.ltd/public/play/watch-officer/
```

No credentials are recorded in this report.

## Backup

Remote files overwritten by this task were backed up before upload to local storage outside the repository:

```text
/home/alexey/.local/share/brkovic-ltd/backups/watch-officer-scenario-selector-production-deploy-20260527T210917Z/
```

Backed up files:

```text
.htaccess
index.apple-touch-icon.png
index.audio.worklet.js
index.html
index.icon.png
index.js
index.pck
index.png
index.wasm
index.worker.js
```

## Uploaded Files

Uploaded only the approved Watch Officer staged candidate files:

```text
.htaccess
index.apple-touch-icon.png
index.audio.worklet.js
index.html
index.icon.png
index.js
index.pck
index.png
index.wasm
index.worker.js
```

No `.import` files were uploaded.

## Pre-Upload Checks

```text
approved_artifacts_present: 10 passed, 0 failed
import_exclusion: 1 passed, 0 failed
forbidden_claim_scan: passed
htaccess_headers_mime: passed
```

Local staged public file sizes before upload:

```text
.htaccess 385 bytes
index.apple-touch-icon.png 12142 bytes
index.audio.worklet.js 7199 bytes
index.html 6558 bytes
index.icon.png 5683 bytes
index.js 452321 bytes
index.pck 322768 bytes
index.png 21443 bytes
index.wasm 35708238 bytes
index.worker.js 5793 bytes
```

## Upload Result

```text
backup_files: 10
uploaded_files: 10
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

## Headers And MIME

Production responses for `/play/watch-officer/` and required artifacts include:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
```

MIME checks:

```text
/play/watch-officer/index.wasm: application/wasm
/play/watch-officer/index.pck: application/octet-stream
```

## Production Browser Sanity

Production browser sanity used Chromium CDP at 1280x720 against:

```text
https://game.brkovic.ltd/play/watch-officer/
```

Checks:

```text
canvas_present: passed
canvas_size: 1280x577
fresh_load_screenshot: captured
selector_dropdown_screenshot: captured
scenario_2_selection_screenshot: captured
scenario_2_start_screenshot: captured
scenario_2_reset_screenshot: captured
```

Screenshots were kept outside the repository:

```text
/tmp/watch-officer-production-selector-smoke/
```

Screenshot hashes:

```text
production-selector-fresh.png: 0bc166294660d66f
production-selector-dropdown.png: 716c14db24c3ea83
production-selector-scenario2.png: 4aa59e3036cd7e5c
production-selector-scenario2-start.png: 18b7a9c6ba449bd2
production-selector-scenario2-reset.png: 5b1751394dc1f34c
```

## Scope Confirmation

Confirmed untouched by this deployment:

```text
Captain Ether
Nav Desk
hub route
registry
auth
unrelated production config
VTS
Region B
final maritime training claims
```

## Next Expected

QA production smoke for the deployed Scenario selector build.
