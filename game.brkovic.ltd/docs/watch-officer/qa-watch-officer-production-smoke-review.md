TASK-0064 done.

Report: game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md

Status: approved-public-prototype-live

Scope:
QA performed independent public production smoke checks for the deployed Watch Officer prototype/draft build.
QA used only public production URLs on https://game.brkovic.ltd.
QA did not deploy, upload by FTP, edit product code, edit Engine/Godot files, touch public routing beyond read-only verification, touch Captain Ether implementation, Nav Desk, auth, or production config.

Sources reviewed:
game.brkovic.ltd/docs/game-director/task-0064-qa-watch-officer-production-smoke-2026-05-26.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
game.brkovic.ltd/docs/game-director/watch-officer-production-deploy-decision-2026-05-26.md
game.brkovic.ltd/docs/watch-officer/production-deploy-watch-officer-report.md
game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-review.md
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js

Production URL checks:
https://game.brkovic.ltd/games/watch-officer: HTTP 200, text/html, brief route remains app-shell game brief and is not raw Godot.
https://game.brkovic.ltd/play/watch-officer/: HTTP 200, text/html, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.html: HTTP 200, text/html, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.js: HTTP 200, text/javascript, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.wasm: HTTP 200, application/wasm, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.pck: HTTP 200, application/octet-stream, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.worker.js: HTTP 200, text/javascript, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/play/watch-officer/index.audio.worklet.js: HTTP 200, text/javascript, COOP same-origin, COEP require-corp, CORP same-origin.
https://game.brkovic.ltd/games/captain-ether: HTTP 200, separate Captain Ether route remains available.

Header and MIME result:
Godot Web route and all required Godot artifact responses include the required COOP/COEP/CORP isolation headers.
index.wasm MIME is application/wasm.
index.pck MIME is application/octet-stream.
Brief app-shell routes are not the threaded Godot Web export route; QA did not treat their lack of COOP/COEP/CORP as a blocker because the required Web export route and artifacts are correctly isolated.

Browser smoke method:
Tool: Playwright Chromium, headless, 1280x720 viewport.
Production-only URLs were used.
Watch Officer brief route was loaded first.
Watch Officer play route was loaded directly at /play/watch-officer/.
Canvas presence and non-empty WebGL rendering were verified with readPixels sampling.
Space was pressed to start the attempt.
R was pressed to reset the attempt.
Screenshots were captured and visually checked.
Captain Ether route was opened separately after Watch Officer smoke.

Browser smoke result:
Watch Officer brief route passed: route stays /games/watch-officer, no canvas, shows Watch Officer, shows /play/watch-officer/, shows prototype/draft and draft/non-final wording.
Watch Officer play route passed: Godot Web canvas renders non-empty.
Space start passed: attempt changes to running state and canvas remains non-empty.
R reset passed: attempt returns to ready, tick 0, canvas remains non-empty.
Draft/non-final status passed: visible in brief and in HUD as Draft/non-final training, draft_training true, rule_review draft, training_claim draft_not_final_training_content.
VTS inactive passed: HUD shows VTS false/inactive.
Forbidden claim check passed: no positive official, certified, COLREGS-compliant, final maritime training, or final training product claim was found during smoke.
Captain Ether route passed: /games/captain-ether remains separate and renders its own login/entry screen.

Screenshots:
game.brkovic.ltd/docs/watch-officer/qa-production-watch-officer-brief.png
game.brkovic.ltd/docs/watch-officer/qa-production-watch-officer-ready.png
game.brkovic.ltd/docs/watch-officer/qa-production-watch-officer-after-start.png
game.brkovic.ltd/docs/watch-officer/qa-production-watch-officer-after-reset.png
game.brkovic.ltd/docs/watch-officer/qa-production-captain-ether-route.png

Tests:
production_url_http_smoke: 9 passed, 0 failed
production_header_mime_smoke: 7 passed, 0 failed
production_brief_route_smoke: passed, 0 failed
production_godot_browser_smoke: passed, 0 failed
production_keyboard_smoke_space_start: passed, 0 failed
production_keyboard_smoke_r_reset: passed, 0 failed
production_draft_non_final_claim_smoke: passed, 0 failed
production_vts_inactive_smoke: passed, 0 failed
captain_ether_route_smoke: passed, 0 failed

Blocking changes:
None.

Approval criteria result:
approved-public-prototype-live.
The deployed Watch Officer production prototype/draft build is acceptable as a public prototype smoke pass.
This is not approval of final maritime training content.

Scope preserved:
public deployment was not changed by QA.
Captain Ether implementation was not changed by QA.
Hub routing was not changed by QA.
Nav Desk was not touched.
Auth was not touched.
Production config was not touched.
Engine/Godot code was not changed.

Next expected:
Game Director may record the production prototype as live, with draft/non-final training limits still active.
