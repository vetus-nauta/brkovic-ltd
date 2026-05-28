# QA Production Scenario Selector Review

**Task:** TASK-0121  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-27  
**Status:** approved-public-prototype-live

## Result

Production smoke for the Watch Officer Scenario 1 / Scenario 2 selector build is approved as a public prototype live check.

This QA review approves only the production smoke result for the deployed Watch Officer prototype route. It does not approve final maritime training release status, certification, legal correctness, COLREGS compliance, hub route changes, registry changes, Captain Ether implementation changes, Nav Desk, auth, production config, VTS, Region B, or any final maritime training claims.

## Production Routes

Checked routes:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

HTTP smoke results:

```text
https://game.brkovic.ltd/games/watch-officer: HTTP 200, text/html
https://game.brkovic.ltd/play/watch-officer/: HTTP 200, text/html
https://game.brkovic.ltd/games/captain-ether: HTTP 200, text/html
```

Captain Ether route remained HTTP 200.

## Required Artifacts

Production Godot Web artifact checks:

```text
https://game.brkovic.ltd/play/watch-officer/index.html: HTTP 200, text/html
https://game.brkovic.ltd/play/watch-officer/index.js: HTTP 200, text/javascript
https://game.brkovic.ltd/play/watch-officer/index.wasm: HTTP 200, application/wasm
https://game.brkovic.ltd/play/watch-officer/index.pck: HTTP 200, application/octet-stream
https://game.brkovic.ltd/play/watch-officer/index.worker.js: HTTP 200, text/javascript
https://game.brkovic.ltd/play/watch-officer/index.audio.worklet.js: HTTP 200, text/javascript
https://game.brkovic.ltd/play/watch-officer/index.png: HTTP 200, image/png, 21443 bytes
https://game.brkovic.ltd/play/watch-officer/index.icon.png: HTTP 200, image/png, 5683 bytes
https://game.brkovic.ltd/play/watch-officer/index.apple-touch-icon.png: HTTP 200, image/png, 12142 bytes
```

## Headers And MIME

Production responses for the play route and required executable/data artifacts included:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
```

MIME checks passed:

```text
index.wasm: application/wasm
index.pck: application/octet-stream
index.js: text/javascript
index.worker.js: text/javascript
index.audio.worklet.js: text/javascript
```

## Browser Smoke

Browser smoke runner:

```text
/home/alexey/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome
Chrome DevTools Protocol direct smoke
--headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist
1280x720 viewport
```

Browser checks:

```text
canvas_present: passed
canvas_size: 1280x577
webgl_pixel_sample: 256/256 sampled pixels non-empty
fresh_load_default: Scenario 1 - Safe Water / Crossing Target
dropdown_options: Scenario 1 and Scenario 2 visible
scenario_2_selectable: Scenario 2 - Head-On Port-to-Port Drill selected
reset_preserves_scenario_2: passed
scenario_1_reselect: passed
```

Visible wording checks passed:

```text
Draft training
Draft / non-final training
Not final maritime instruction.
Region A / VTS inactive
VTS: false/inactive
```

Visible forbidden-claim checks passed in reviewed browser states. No player-facing final, certified, legal, COLREGS-compliant, final maritime training, or final training product claim was visible.

Note: a production payload string scan found internal negative QA/assertion literals such as checks that text "avoids certified claim"; those are not player-facing production claims and were not visible in the browser smoke states.

## Screenshots

Production screenshots captured in the repository under the allowed QA screenshot scope:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-fresh.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-dropdown-open.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-scenario2-selected.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-scenario2-started.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-scenario2-reset.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-scenario1-reselected.png
```

## Blockers

None.

## Scope Preserved

QA did not edit code, deploy, use FTP, or touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.

Files created by this QA task:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-review.md
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-*.png
```
