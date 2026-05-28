CHAT-QA-001
TASK-0088
QA Staged Public Smoke Scenario 1 Decision Coaching Pack

Status: approved-for-production-deploy-decision

Scope reviewed:
QA staged public candidate smoke only.
No deploy.
No FTP.
No production server.
No production files.
No code edits.
No Captain Ether implementation changes.
No Nav Desk changes.
No router or registry changes.
No auth changes.
No production config changes.

Sources read:
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-staged-public-decision-2026-05-27.md
game.brkovic.ltd/docs/watch-officer/staged-public-scenario-one-decision-coaching-report.md
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md

Staged public candidate under test:
game.brkovic.ltd/public/play/watch-officer/

Local staged public server/browser method:
Temporary local Node static server from /tmp.
Server root: game.brkovic.ltd/public/
URL: http://127.0.0.1:8130/
The temporary server served /play/watch-officer/ with COOP/COEP/CORP and MIME headers.
The temporary server served /api/games/registry.php from local content/game-registry.json only to support local SPA route smoke.
Browser: Chromium via Playwright.
Viewport: 1280x720.

Artifact checks:
.htaccess present.
index.html present.
index.js present.
index.wasm present.
index.pck present.
index.worker.js present.
index.audio.worklet.js present.
index.apple-touch-icon.png present.
index.icon.png present.
index.png present.

.import exclusion:
No .import files were found under game.brkovic.ltd/public/play/watch-officer/.

.htaccess check:
Cross-Origin-Opener-Policy same-origin preserved.
Cross-Origin-Embedder-Policy require-corp preserved.
Cross-Origin-Resource-Policy same-origin preserved.
X-Content-Type-Options nosniff preserved.
AddType application/wasm .wasm preserved.
AddType application/octet-stream .pck preserved.

Route preservation:
/games/watch-officer remains the hub/brief route in game-registry.json.
/play/watch-officer/ remains the Watch Officer build route in game-registry.json.
Local browser route smoke loaded /games/watch-officer and displayed Watch Officer staged public candidate content.
Captain Ether route check was feasible and loaded separately at /games/captain-ether.

HTTP/header smoke:
/play/watch-officer/index.html returned HTTP 200.
/play/watch-officer/index.js returned HTTP 200.
/play/watch-officer/index.wasm returned HTTP 200 with Content-Type application/wasm.
/play/watch-officer/index.pck returned HTTP 200 with Content-Type application/octet-stream.
/play/watch-officer/index.worker.js returned HTTP 200.
/play/watch-officer/index.audio.worklet.js returned HTTP 200.
COOP/COEP/CORP and nosniff headers were present for the staged build route.

Browser smoke:
Canvas loaded and was non-empty in ready state.
Ready state showed briefing.
Space started the attempt and hid briefing.
Opening lateral-pair cue was visible immediately after start:
Read the lateral pair. Stay in the marked corridor.
Opening cue remained visible during the early-running hold window.
Fast hold-window screenshot observed tick 34, time 1.70s, with the opening cue still visible.
Later running progressed to target monitoring cue:
Monitor the crossing target.
Cue count remained within the allowed limit of one primary cue plus two chips.
No numeric CPA/TCPA solver values were visible on player-facing staged browser surfaces.
VTS remained false/inactive.
No VTS popup appeared.
R reset returned the scenario to ready/briefing and cleared running coaching.
Draft/non-final wording remained visible.
Forbidden final-training claim scan passed.

Screenshots captured:
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-hub-route.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-ready.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-immediate.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-hold-window.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-later-running.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-reset-ready.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-immediate-fast.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-hold-window-fast.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-captain-ether-route.png

Test results:
required_staged_public_artifacts: 7 passed, 0 failed
staged_public_import_exclusion: 1 passed, 0 failed
staged_public_htaccess_headers_mime: 6 passed, 0 failed
staged_public_route_preservation: 2 passed, 0 failed
staged_public_http_artifacts: 6 passed, 0 failed
staged_public_runtime_headers: passed, 0 failed
staged_public_wasm_mime: passed, 0 failed
staged_public_pck_mime: passed, 0 failed
staged_public_browser_canvas_ready: passed, 0 failed
staged_public_browser_ready_briefing: passed, 0 failed
staged_public_browser_space_start: passed, 0 failed
staged_public_opening_lateral_pair_cue_immediate: passed, 0 failed
staged_public_opening_lateral_pair_cue_hold_window: passed, 0 failed
staged_public_later_target_monitoring_cue: passed, 0 failed
staged_public_cue_count_visual_smoke: passed, 0 failed
staged_public_hidden_numeric_cpa_tcpa_visual_smoke: passed, 0 failed
staged_public_vts_inactive_smoke: passed, 0 failed
staged_public_browser_r_reset: passed, 0 failed
staged_public_draft_non_final_smoke: passed, 0 failed
staged_public_forbidden_claim_scan: 1 passed, 0 failed
staged_public_approved_artifact_compare: 9 passed, 0 failed
staged_public_godot_artifact_isolation: 1 passed, 0 failed
staged_public_captain_ether_route_separate: passed, 0 failed

Blocking changes:
None.

QA decision:
The staged public candidate passes QA staged public smoke for the Scenario 1 Decision Coaching Pack.
The staged public candidate is approved for Game Director production deploy decision.

Scope preservation:
QA did not deploy.
QA did not upload by FTP.
QA did not touch production server files.
QA did not edit product code.
QA did not change public staged candidate files.
QA did not change Captain Ether implementation.
QA did not change Nav Desk.
QA did not change router or registry.
QA did not change auth.
QA did not change production config.
QA did not add VTS to scenario 1.
QA did not add a new scenario.
QA did not add final maritime training claims.

Next expected step:
Game Director production deploy decision.
