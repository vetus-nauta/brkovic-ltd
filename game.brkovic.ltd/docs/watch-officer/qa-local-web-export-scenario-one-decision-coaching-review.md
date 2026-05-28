TASK-0083 done.

Report: game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md

Status: changes-required

Scope:
QA ran local browser smoke for the exported Watch Officer Scenario 1 Decision Coaching Pack.
QA used only the local export in game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/.
QA did not copy to public/, deploy, use FTP, touch production files, edit code, touch Captain Ether, Nav Desk, router/registry, auth, production config, or deploy state.

Sources reviewed:
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
game.brkovic.ltd/docs/game-director/task-0083-qa-local-web-export-smoke-scenario-one-decision-coaching-2026-05-26.md
game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md
game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md
game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md

Export path:
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/

Artifact checks:
index.html: present
index.js: present
index.wasm: present
index.pck: present
index.worker.js: present
index.audio.worklet.js: present

Local server command:
PORT=8128 node /tmp/watch_officer_web_local_server.js

Local server result:
http://127.0.0.1:8128/ served the local export.
COOP same-origin, COEP require-corp, CORP same-origin, and Cache-Control no-store were present on the local server responses.
index.wasm was served as application/wasm.
index.pck was served as application/octet-stream.

HTTP checks:
index.html: HTTP 200
index.js: HTTP 200
index.wasm: HTTP 200
index.pck: HTTP 200
index.worker.js: HTTP 200
index.audio.worklet.js: HTTP 200

Browser smoke method:
Tool: Playwright Chromium, headless, 1280x720 viewport.
URL: http://127.0.0.1:8128/
Canvas presence and non-empty WebGL rendering were verified with readPixels sampling.
Screenshots were captured for ready, after Space, later running, reset, immediate-after-Space, and CPU-throttled after-Space checks.

Browser smoke result:
Local Web build loaded successfully.
Canvas rendered non-empty in ready state.
Ready state showed briefing.
Space started the attempt and hid briefing.
Running state showed active decision coaching.
The visible running coaching cue was Monitor the crossing target with CPA safe and Draft training chips.
Cue count stayed within 1 primary cue plus 2 chips on observed running surfaces.
Player-facing running surfaces did not show numeric CPA/TCPA, thresholds, encounter confidence, closest-point debug text, replay seed/tolerance, raw geometry distances, or warning debug payload.
VTS remained false/inactive.
No VTS popup appeared.
R reset returned to ready state, tick 0, briefing visible, and coaching cleared.
Canvas returned to the ready hash after reset.
Draft/non-final wording remained visible.
Forbidden final-training claim scan passed for the local export text assets.

Failed browser smoke check:
Opening lateral-pair cue was not visible in the local browser smoke after Space.
Expected: Read the lateral pair. Stay in the marked corridor.
Observed: Monitor the crossing target. CPA safe | Draft training.
Immediate screenshot after Space already showed tick 10 and the target-monitoring cue.
CPU-throttled screenshot after Space still showed tick 21 and the target-monitoring cue.
The focused headless test from TASK-0081 confirms the opening cue exists at the scene/test level, but the exported browser build advances past it before QA can observe or capture it in normal browser flow.

Blocking change required:
Make the opening lateral-pair cue visible long enough in the exported browser build for normal player and QA smoke observation.
Recommended acceptance target: keep the opening cue visible for a minimum early-running window, for example first 1-2 seconds or first 20-40 ticks after Start, unless a higher-priority Engine warning/result cue appears.

Screenshots:
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-ready.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-opening-cue.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-running.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-reset-ready.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-opening-immediate.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-decision-coaching-opening-throttled.png

Tests:
local_web_export_artifact_presence: 6 passed, 0 failed
local_web_export_http_artifacts: 6 passed, 0 failed
local_web_export_runtime_headers: passed, 0 failed
local_web_export_wasm_mime: passed, 0 failed
local_web_export_pck_mime: passed, 0 failed
local_web_export_browser_canvas_ready: passed, 0 failed
local_web_export_browser_space_start: passed, 0 failed
local_web_export_browser_running_coaching_visible: passed, 0 failed
local_web_export_cue_count_visual_smoke: passed, 0 failed
local_web_export_hidden_debug_visual_smoke: passed, 0 failed
local_web_export_vts_inactive_smoke: passed, 0 failed
local_web_export_browser_r_reset: passed, 0 failed
local_web_export_draft_non_final_smoke: passed, 0 failed
local_web_export_forbidden_claim_scan: 1 passed, 0 failed
local_web_export_opening_lateral_pair_cue_browser_smoke: 0 passed, 1 failed

Non-blocking notes:
Chromium console emitted known local Godot Web/audio/readPixels warnings during smoke. They did not block load, rendering, Space start, running cue display, R reset, or VTS inactive visibility.

Implementation acceptance result:
changes-required.
The local Web export is not approved for staged public candidate until the opening lateral-pair cue is browser-visible in normal smoke flow.
This is not approval of final maritime training content.

Scope preserved:
public/ not touched by QA.
Export source not modified by QA.
Captain Ether not touched by QA.
Nav Desk not touched by QA.
Router/registry not touched by QA.
Auth not touched by QA.
Production config not touched by QA.
Deploy state not touched by QA.
Production files not touched by QA.
FTP not used by QA.
No deploy, public copy, production file edit, or code edit was performed by QA.

Next expected:
Changes-required owner to make the opening lateral-pair cue visible in browser flow, then rerun local Web export and QA smoke.
