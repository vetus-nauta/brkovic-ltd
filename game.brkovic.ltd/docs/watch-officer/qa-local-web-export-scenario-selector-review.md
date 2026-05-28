# QA Local Web Export Scenario Selector Review

**Task:** TASK-0117  
**Reviewed Task:** TASK-0116  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-27  
**Status:** approved-for-staged-public-candidate-decision

## Result

TASK-0116 is approved for the staged public candidate decision gate.

This QA review approves only the prototype-local Web export smoke for the Watch Officer Scenario 1 / Scenario 2 selector build. It does not approve deploy, `public/` changes, production route, registry entry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.

## Environment

Export directory served locally:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local
```

Initial plain server check:

```text
python3 -m http.server 8127 --bind 127.0.0.1
```

The plain server served artifacts, but Chromium blocked the Godot Web runtime with the expected SharedArrayBuffer/Cross-Origin Isolation error because COOP/COEP headers were absent.

Browser smoke server used for the passing run:

```text
python3 temporary ThreadingHTTPServer on 127.0.0.1:8127
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

The temporary server was stopped after QA.

## Artifact And HTTP Checks

Export artifacts exist:

```text
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

HTTP/MIME checks returned `200 OK`:

```text
index.html              text/html
index.js                text/javascript
index.wasm              application/wasm
index.pck               application/octet-stream
index.worker.js         text/javascript
index.audio.worklet.js  text/javascript
```

## Browser Smoke Checks

- Godot Web loaded in Chromium through Playwright.
- Canvas was present at `1280x720`.
- WebGL pixel sample was non-empty: `256/256` sampled pixels non-black and non-transparent.
- Fresh load showed the scenario selector.
- Fresh load defaulted to `Scenario 1 - Safe Water / Crossing Target`.
- Selector dropdown exposed Scenario 1 and Scenario 2.
- Scenario 2 was selectable in browser: `Scenario 2 - Head-On Port-to-Port Drill`.
- Starting an attempt hid the selector during Scenario 1 running state.
- Scenario 2 reset with `R` returned to ready state and preserved Scenario 2 selection.
- Scenario 1 was selectable again after Scenario 2.
- Draft/non-final wording remained visible: `Draft training`, `Draft / non-final training`, `Not final maritime instruction.`
- Region/VTS wording remained visible: `Region A / VTS inactive`, `VTS: false/inactive`.
- Forbidden visible claims were absent in reviewed browser states: `certified`, `legal`, `COLREGS-compliant`, `final maritime training`, `final training product`.

## Screenshots

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-fresh.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-dropdown-open.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-scenario2-selected.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-scenario2-reset.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-scenario1-reselected.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-scenario1-start-100ms.png
```

## Browser Console Notes

Observed non-blocking runtime/browser warnings:

```text
Invalid mix rate of 0, defaulting mix rate to 44100.
Blocking on the main thread is very dangerous.
GPU stall due to ReadPixels.
```

These did not block the smoke checks.

## Blockers

None for the staged public candidate decision.

Public/staged hosting must provide the required Cross-Origin Isolation headers for Godot Web:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without those headers, Chromium shows the SharedArrayBuffer/Cross-Origin Isolation startup error and the canvas does not reach the game scene.

## Scope Preserved

QA did not edit code, deploy, edit `public/`, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.

Files created by this QA task:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-review.md
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-*.png
```
