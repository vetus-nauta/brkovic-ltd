# Watch Officer QA Production Smoke: Scenario 1 Decision Coaching Pack

**Task:** `TASK-0090`  
**Status:** `approved-production-prototype-updated`  
**Date:** 2026-05-27  
**Owner Chat:** `CHAT-QA-001`

## Scope

Independent public production smoke for the deployed Watch Officer `Scenario 1 Decision Coaching Pack`.

Production targets tested:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
https://game.brkovic.ltd/games/captain-ether
```

This QA pass did not deploy, upload by FTP, edit production files, edit product code, change Captain Ether, change Nav Desk, change router/registry, touch auth, or change production config.

## Public URL Checks

```text
https://game.brkovic.ltd/games/watch-officer: HTTP 200, text/html
https://game.brkovic.ltd/play/watch-officer/: HTTP 200, text/html
https://game.brkovic.ltd/play/watch-officer/index.html: HTTP 200, text/html
https://game.brkovic.ltd/play/watch-officer/index.js: HTTP 200, text/javascript
https://game.brkovic.ltd/play/watch-officer/index.wasm: HTTP 200, application/wasm
https://game.brkovic.ltd/play/watch-officer/index.pck: HTTP 200, application/octet-stream
https://game.brkovic.ltd/play/watch-officer/index.worker.js: HTTP 200, text/javascript
https://game.brkovic.ltd/play/watch-officer/index.audio.worklet.js: HTTP 200, text/javascript
https://game.brkovic.ltd/games/captain-ether: HTTP 200, text/html
```

Result: passed.

## Headers And MIME

The Watch Officer Web route and tested artifacts returned:

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

Result: passed.

## Browser Smoke

Browser: Chromium via cached Playwright runtime, viewport `1280x720`.

Screenshots captured:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-hub-route.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-ready.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-immediate.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-hold-window.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-later-running.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-reset-ready.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-captain-ether-route.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-immediate-fast.png
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-hold-window-fast.png
```

Canvas samples:

```text
ready: 1280x720, non-empty, hash 2149329327
immediate after Space: 1280x720, non-empty, hash 2295406060
early hold window: 1280x720, non-empty, hash 3976641487
later running: 1280x720, non-empty, hash 1222146872
reset after R: 1280x720, non-empty, hash 2149329327
immediate fast rerun: 1280x720, non-empty, hash 2900707359
hold-window fast rerun: 1280x720, non-empty, hash 385454038
```

Observed browser results:

```text
ready state shows briefing: passed
Space starts attempt and hides briefing: passed
opening lateral-pair cue visible immediately: passed
opening cue remains visible during early-running hold window: passed at tick 35 / time 1.75s
later running progresses to target monitoring cue: passed at tick 241 / time 12.05s
R reset returns to ready with briefing visible: passed
running coaching cleared on reset: passed
canvas non-empty throughout tested states: passed
```

Observed cue text:

```text
Read the lateral pair. Stay in the marked corridor.
Monitor the crossing target.
```

Non-blocking console notes included Godot Web/audio/readPixels warnings. They did not block route load, canvas rendering, Space start, cue visibility, later-running progression, R reset, or route separation.

## VTS Check

Visual production smoke showed:

```text
VTS: false/inactive
no VTS popup visible
```

Result: passed.

## Draft / Non-Final Wording

The Watch Officer hub route displayed draft/prototype wording:

```text
prototype/draft, не финальный учебный продукт и не навигационная инструкция
draft/non-final training content, не навигационная инструкция и не финальное обучение
```

The Watch Officer Web canvas displayed draft/non-final wording:

```text
Draft training scenario - not final maritime instruction.
Draft / non-final training
training_claim: draft_not_final_training_content
```

Result: passed.

## Forbidden Final-Claim Scan

Public route/artifact scan covered:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/assets/app.js
https://game.brkovic.ltd/play/watch-officer/index.html
https://game.brkovic.ltd/play/watch-officer/index.js
https://game.brkovic.ltd/play/watch-officer/index.pck
```

No player-facing final, official, certified, legally correct, or COLREGS-compliant training claim was found. Matches for `final` were implementation identifiers such as `final_score`, `progressIsFinal`, or explicit draft/non-final disclaimers. Matches for `official`, `certified`, and `COLREGS` in the pack were internal negative assertions that those claims remain absent.

Result: passed.

## Captain Ether Route Separation

`https://game.brkovic.ltd/games/captain-ether` opened separately with the Captain Ether login route content. It did not load the Watch Officer brief route or Watch Officer Web build.

Result: passed.

## Test Results

```text
production_public_urls: 9 passed, 0 failed
production_watch_officer_artifact_http: 6 passed, 0 failed
production_headers_coop_coep_corp: 7 passed, 0 failed
production_wasm_mime: 1 passed, 0 failed
production_pck_mime: 1 passed, 0 failed
production_browser_canvas_non_empty: 7 passed, 0 failed
production_ready_briefing: 1 passed, 0 failed
production_space_start_hides_briefing: 1 passed, 0 failed
production_opening_lateral_pair_cue_immediate: 1 passed, 0 failed
production_opening_lateral_pair_cue_hold_window: 1 passed, 0 failed
production_later_target_monitoring_cue: 1 passed, 0 failed
production_r_reset_ready: 1 passed, 0 failed
production_vts_inactive_no_popup: 2 passed, 0 failed
production_draft_non_final_wording: 2 passed, 0 failed
production_forbidden_final_claim_scan: 5 passed, 0 failed
production_captain_ether_route_separation: 1 passed, 0 failed
```

## Scope Preservation

```text
No deploy.
No FTP.
No production file edits.
No product code edits.
No Captain Ether implementation changes.
No Nav Desk changes.
No router/registry changes.
No auth changes.
No production config changes.
No credentials, cookies, sessions, CSRF, SMTP, .netrc, player email, player identity, or other secrets stored.
```

## QA Decision

`TASK-0090` passes independent public production QA smoke.

Status: `approved-production-prototype-updated`.

Next expected: Game Director production prototype status decision.
