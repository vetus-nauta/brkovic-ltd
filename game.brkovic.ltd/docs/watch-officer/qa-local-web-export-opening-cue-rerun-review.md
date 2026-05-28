CHAT-QA-001
TASK-0085
QA Review Local Web Export Opening Cue Rerun

Status: approved-for-staged-public-candidate

Scope reviewed:
Local browser smoke only.
No public deploy.
No FTP.
No production files.
No Captain Ether.
No Nav Desk.
No router or registry changes.
No auth.
No production config.

Sources read:
game.brkovic.ltd/docs/game-director/task-0085-qa-rerun-local-web-export-opening-cue-smoke-2026-05-27.md
game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md

Export under test:
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/

Local server:
PORT=8129 node /tmp/watch_officer_web_local_server.js
URL: http://127.0.0.1:8129/

Artifact checks:
index.html present.
index.js present.
index.wasm present.
index.pck present.
index.worker.js present.
index.audio.worklet.js present.

HTTP checks:
index.html returned HTTP 200.
index.js returned HTTP 200.
index.wasm returned HTTP 200 with Content-Type application/wasm.
index.pck returned HTTP 200 with Content-Type application/octet-stream.
index.worker.js returned HTTP 200.
index.audio.worklet.js returned HTTP 200.
Required COOP/COEP/CORP headers were present for local browser smoke.

Browser smoke method:
Chromium local browser smoke against local export.
Viewport: 1280x720.
Canvas pixel sampling was nonblank for ready, immediate-running, hold-window, later-running, and reset states.

Browser smoke result:
Ready briefing rendered.
Space started the scenario and hid the briefing.
Opening cue was visible immediately after start:
Read the lateral pair. Stay in the marked corridor.
Observed with chips:
IALA A
Draft training
Opening cue remained visible during the early-running hold window.
Fast hold-window screenshot observed tick 36, time 1.80s, with the opening cue still visible.
Cue count stayed within the allowed limit: one primary cue plus two chips.
Later running progressed to target monitoring cue after the opening hold window:
Monitor the crossing target.
Later running chips observed:
CPA safe
Draft training
No player-facing numeric debug fields were visible in the browser smoke.
VTS stayed false and inactive.
No VTS popup appeared.
R reset returned the scenario to ready briefing at tick 0 and cleared running coaching.
Draft and non-final status remained visible.
Forbidden final-training claim scan passed.

Screenshots captured:
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-ready.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-immediate.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-hold-window.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-later-running.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-reset-ready.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-immediate-fast.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-hold-window-fast.png

Test results:
local_web_export_artifact_presence: 6 passed, 0 failed
local_web_export_http_artifacts: 6 passed, 0 failed
local_web_export_runtime_headers: passed, 0 failed
local_web_export_wasm_mime: passed, 0 failed
local_web_export_pck_mime: passed, 0 failed
local_web_export_browser_canvas_ready: passed, 0 failed
local_web_export_browser_space_start: passed, 0 failed
local_web_export_opening_lateral_pair_cue_immediate: passed, 0 failed
local_web_export_opening_lateral_pair_cue_hold_window: passed, 0 failed
local_web_export_later_target_monitoring_cue: passed, 0 failed
local_web_export_cue_count_visual_smoke: passed, 0 failed
local_web_export_hidden_debug_visual_smoke: passed, 0 failed
local_web_export_vts_inactive_smoke: passed, 0 failed
local_web_export_browser_r_reset: passed, 0 failed
local_web_export_draft_non_final_smoke: passed, 0 failed
local_web_export_forbidden_claim_scan: 1 passed, 0 failed

Blocking changes:
None.

QA decision:
The TASK-0084 opening cue visibility fix resolves the TASK-0083 local export blocker.
The local web export is approved for staged public candidate review.

Scope preservation:
QA did not edit gameplay code.
QA did not edit export source files.
QA did not create or modify public files.
QA did not deploy.
QA did not use FTP.
QA did not touch Captain Ether, Nav Desk, router or registry, auth, or production config.

Next expected step:
Game Director staged public candidate decision.
