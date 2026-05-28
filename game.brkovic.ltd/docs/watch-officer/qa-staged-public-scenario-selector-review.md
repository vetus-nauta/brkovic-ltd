# QA Staged Public Scenario Selector Review

**Task:** TASK-0119  
**Reviewed Task:** TASK-0118  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-27  
**Status:** approved-for-production-deploy-decision

## Result

TASK-0118 staged public candidate is approved for the production deploy decision gate.

This QA review approves only the local staged public candidate smoke for the Watch Officer Scenario 1 / Scenario 2 selector build. It does not approve deploy, FTP upload, production server changes, hub route, registry entry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.

## Environment

Staged public candidate served locally:

```text
game.brkovic.ltd/public/play/watch-officer/
```

Temporary local QA server:

```text
python3 temporary ThreadingHTTPServer on 127.0.0.1:8129
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
```

Browser smoke runner:

```text
/home/alexey/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome
Chrome DevTools Protocol direct smoke
--headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist
```

The temporary server and Chromium were stopped after QA.

## Artifact And Staged File Checks

Required staged files exist:

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

No `.import` files were present in:

```text
game.brkovic.ltd/public/play/watch-officer/
```

The staged `.htaccess` contains:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
AddType application/wasm .wasm
AddType application/octet-stream .pck
```

## HTTP/Header Smoke

Local HTTP checks returned `200 OK` with the required Godot Web headers:

```text
index.html   text/html                  COOP same-origin, COEP require-corp
index.js     text/javascript            COOP same-origin, COEP require-corp
index.wasm   application/wasm           COOP same-origin, COEP require-corp
index.pck    application/octet-stream   COOP same-origin, COEP require-corp
```

## Browser Smoke Checks

- Godot Web loaded in Chromium through local staged HTTP.
- Canvas was present and non-empty.
- Canvas viewport was `1280x577` inside the `1280x720` browser window.
- WebGL pixel sample was non-empty: `256/256` sampled pixels non-black/non-transparent.
- Fresh load defaulted to `Scenario 1 - Safe Water / Crossing Target`.
- Selector dropdown exposed Scenario 1 and Scenario 2.
- Scenario 2 was selectable: `Scenario 2 - Head-On Port-to-Port Drill`.
- Reset with `R` returned to ready/reset state and preserved Scenario 2 selection.
- Scenario 1 was selectable again after Scenario 2.
- Draft/non-final wording was visible: `Draft training`, `Draft / non-final training`, `Not final maritime instruction.`
- Region A/VTS inactive wording was visible: `Region A / VTS inactive`, `VTS: false/inactive`, and scenario text indicating VTS is disabled/inactive.
- Forbidden visible claims were absent in reviewed browser states: `certified`, `legal`, `COLREGS-compliant`, `final maritime training`, `final training product`.

## Screenshots

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-fresh.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-dropdown-open.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-scenario2-selected.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-scenario2-reset.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-scenario1-reselected.png
```

## Browser Console Notes

Observed environment/runtime warnings during the QA browser run:

```text
DBus service unavailable in headless container
GPU/SwiftShader software rendering notices
```

An initial QA-browser launch with `--disable-gpu` produced the expected unusable QA environment error, `WebGL2` missing. The passing smoke used SwiftShader WebGL and loaded the staged candidate successfully.

## Blockers

None for the production deploy decision gate.

Production hosting must preserve the required Godot Web Cross-Origin Isolation headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Scope Preserved

QA did not edit code, deploy, use FTP, or touch production server, hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.

Files created by this QA task:

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-review.md
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-*.png
```
