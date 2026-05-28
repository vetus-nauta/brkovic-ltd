# QA Local Web Export Scenario 2 Coaching + Result Feedback Review

**Task:** TASK-0129 / CHAT-QA-001  
**Reviewed Task:** TASK-0128  
**Owner:** Maritime QA / Validation  
**Date:** 2026-05-28  
**Status:** approved

## Result

The prototype-local Web export smoke is approved for the Game Director staged public candidate decision.

This approval is limited to the local Web export under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

It does not approve deploy, `public/` changes, hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS expansion, Region B, FTP, or final maritime training claims.

## Sources Reviewed

- `game.brkovic.ltd/docs/game-director/task-0129-qa-local-web-export-smoke-scenario-two-coaching-result-feedback-2026-05-28.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-two-coaching-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-review.md`

## Environment

Local export server:

```text
http://127.0.0.1:8130/
python3 ThreadingHTTPServer
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

The temporary local server was stopped after QA.

Browser smoke:

```text
Playwright 1.60.0
Google Chrome for Testing 147.0.7727.15
Viewport 1280x720
```

Godot focused coverage:

```text
/home/alexey/.local/bin/godot4
4.2.2.stable.official.15073afe3
```

## Artifact And HTTP Checks

Expected local Web export files are present:

```text
index.html
index.js
index.wasm
index.pck
index.worker.js
index.audio.worklet.js
```

HTTP checks returned `200 OK` with the required isolation headers:

```text
index.html              text/html                  6558 bytes
index.js                text/javascript            452321 bytes
index.wasm              application/wasm           35708238 bytes
index.pck               application/octet-stream   344880 bytes
index.worker.js         text/javascript            5793 bytes
index.audio.worklet.js  text/javascript            7199 bytes
```

## Browser Smoke Checks

- Chromium loaded the Godot Web export with `crossOriginIsolated: true`.
- Canvas rendered at `1280x720`.
- Canvas pixel sample was non-empty: `256/256` sampled pixels were non-black and non-transparent.
- Fresh load defaulted to `Scenario 1 - Safe Water / Crossing Target`.
- Selector dropdown exposed Scenario 1 and Scenario 2.
- Scenario 2 was selectable: `Scenario 2 - Head-On Port-to-Port Drill`.
- Scenario 2 ready briefing showed `Region A / VTS inactive`.
- Draft/non-final wording remained visible, including `Draft training`, `Draft / non-final training`, and `not final maritime instruction`.
- Reviewed browser states did not show official, certified, legal, `COLREGS-compliant`, `final maritime training`, or `final training product` claims.

## Early-Starboard Browser Limitation

Direct UI-only browser verification of `Early starboard alteration made.` was not practical in this smoke run. Starting Scenario 2 in the browser reached a terminal `near_miss` state on the first rendered tick with `CPA/TCPA: immediate`, before the early-starboard coaching cue could be reached through browser controls.

The exact cue remains covered by focused local headless QA:

```text
scenario_two_coaching_result_feedback_pack_test: 65 passed, 0 failed
```

That pack asserts:

```text
Early starboard alteration made.
Starboard early
Draft training
```

## Focused Headless Coverage

```text
scenario_two_coaching_result_feedback_pack_test: 65 passed, 0 failed
scenario_selector_local_flow_test: 51 passed, 0 failed
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
```

## Screenshots

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-fresh.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-dropdown-open.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-scenario2-selected.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-scenario2-running-opening.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-scenario2-starboard-attempt.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-scenario2-d-start-120ms.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-scenario2-d-start-820ms.png
```

## Browser Console Notes

Observed non-blocking runtime/browser warnings:

```text
Invalid mix rate of 0, defaulting mix rate to 44100.
Blocking on the main thread is very dangerous.
Output buffer has not enough frames. Skipping output frame.
```

These did not block local export loading, canvas rendering, selector checks, Scenario 2 selection, or Scenario 2 briefing review.

## Scope Preserved

- Code was not edited.
- Export artifacts were not edited.
- `public/` was not edited or used as a copy target.
- No deploy, FTP, staged candidate, hub route, registry, Captain Ether, Nav Desk, auth, or production config work was performed.
- No VTS expansion or Region B work was performed.
- No official, certified, legal, `COLREGS-compliant`, or final maritime training claim was added.

## Next Expected

Game Director staged public candidate decision.
