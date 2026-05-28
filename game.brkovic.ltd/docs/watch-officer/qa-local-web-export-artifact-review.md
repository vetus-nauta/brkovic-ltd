# Watch Officer QA Review: Local Web Export Artifact Behavior

**Status:** approved-for-game-director-public-integration-decision  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0060`  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`

## Purpose

This report reviews `TASK-0059` from the QA side.

It confirms whether the local Web export artifacts behave correctly when served locally before any public integration, web embedding, or production deployment.

This report does not deploy to production, implement public web embedding, modify `public/`, modify `game.brkovic.ltd/public/`, modify game hub routing, modify Captain Ether, modify Nav Desk, touch auth or production config, move exported artifacts into public paths, or present draft maritime rules as final training content.

## Sources Reviewed

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/export-readiness-review.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/`

## Prior Headless Tests

The TASK-0059 setup report documents the full headless regression suite as passed:

```text
scenario_loader_test: 82 passed, 0 failed
runtime_bootstrap_test: 27 passed, 0 failed
fixed_tick_input_log_test: 24 passed, 0 failed
ownship_kinematic_integrator_test: 19 passed, 0 failed
target_kinematic_integrator_test: 18 passed, 0 failed
range_bearing_relative_side_test: 23 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
cpa_tcpa_numeric_debug_solver_test: 21 passed, 0 failed
safe_water_geometry_monitor_test: 24 passed, 0 failed
warning_escalation_foundation_test: 127 passed, 0 failed
scenario_result_evaluator_test: 66 passed, 0 failed
runtime_step_orchestrator_test: 43 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
```

QA did not rerun the headless suite for this task; this review focused on local Web artifact behavior.

## Local Server

Plain static serving command verified `index.html` with HTTP 200:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local
```

However, Godot 4 Web runtime did not boot under plain `http.server` because Chromium reported missing Cross-Origin Isolation and SharedArrayBuffer support.

Runtime smoke used this localhost-only server with required headers:

```bash
python3 - <<'PY'
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        super().end_headers()
handler = partial(Handler, directory='game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local')
server = ThreadingHTTPServer(('127.0.0.1', 8766), handler)
server.serve_forever()
PY
```

Header check:

```text
HTTP/1.0 200 OK
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

## Browser Smoke Method

Browser smoke used headless Chromium through Playwright against:

```text
http://127.0.0.1:8766/index.html
```

Smoke checks:

- waited for `canvas`;
- waited for Godot Web runtime startup;
- sampled WebGL pixels through `readPixels`;
- pressed `Space`;
- captured after-start screenshot;
- pressed `R`;
- captured after-reset screenshot;
- visually inspected screenshots for HUD readability, draft/non-final wording, VTS inactive state, and deterministic reset.

Screenshots produced:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-ready.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-after-start.png
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-after-reset.png
```

Browser smoke result:

```text
browser_smoke_test: passed
canvas: 1280x720, non-empty WebGL pixels
Space input: Attempt running visible
R input: Attempt ready and Tick 0 visible
```

Observed non-blocking console notes:

```text
Godot Engine v4.2.2.stable.official.15073afe3
OpenGL ES 3.0 / WebGL 2.0
USER WARNING: Invalid mix rate of 0; defaulting to 44100
Blocking on the main thread is very dangerous
```

The audio mix warning and browser-thread warning did not block local artifact behavior for this no-audio greybox smoke.

## Artifact Checks

| Check | QA result |
| --- | --- |
| Required artifacts exist under `exports/web-local/` | Passed. `index.html`, `index.js`, `index.wasm`, and `index.pck` are present. |
| No generated Godot export artifacts exist under `public/` or `game.brkovic.ltd/public/` | Passed. Scan found no `.pck`, `.wasm`, or generated Web export files in public paths. |
| Local static server can serve exported `index.html` | Passed. Plain localhost server returned HTTP 200 for `index.html`. |
| Browser can load the Godot Web build locally | Passed with localhost COOP/COEP server. Plain `http.server` is insufficient for Godot Web runtime boot. |
| Canvas is non-empty after load | Passed. WebGL canvas sampled at 1280x720 with non-empty pixels. |
| Keyboard focus and controls work | Passed. `Space` started the attempt; `R` reset the attempt. |
| HUD remains readable in browser | Passed for local smoke. Screenshots show instrument strip, warning/result panels, captain report, cue legend, controls, and debug/non-final section. |
| Draft/non-final wording remains visible | Passed. Screenshots show `Training draft - needs review`, `draft_training: true`, `rule_review: draft`, and `training_claim: draft_not_final_training_content`. |
| VTS remains disabled/inactive | Passed. Screenshots show `VTS: false/inactive`. |
| Local restart/reset remains deterministic enough for QA | Passed. After reset screenshot shows `Attempt ready`, `Tick 0`, `Time 0.00s`, and `Scenario ready`. |
| No final maritime training claim appears | Passed. Local artifact text/screenshot inspection did not show `official`, `certified`, `COLREGS compliant`, or `correct rule`. |
| Public integration remains blocked until separate Game Director task | Passed. Artifacts remain in prototype export path only; no public route or embedding work was performed. |

## Blocking Changes

None.

## QA Conditions For Public Integration Decision

- Any future public hosting or integration must serve the Godot Web build with Cross-Origin Isolation headers: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
- Do not move artifacts from `exports/web-local/` into `public/` or `game.brkovic.ltd/public/` without a separate Game Director task.
- Preserve visible draft/non-final training wording in any public-integration candidate.
- Recheck HUD layout at target public viewport sizes; the 1280x720 local smoke is readable but still prototype-dense near the bottom debug/control area.
- Keep VTS disabled/inactive for scenario 1.

## Scope Confirmation

Confirmed not touched by this QA review:

```text
public/
game.brkovic.ltd/public/
game hub routing
Captain Ether
Nav Desk
auth
production config
```

No deployment, public web embedding, game hub integration, or final maritime training claim was introduced.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0060 result: **approved-for-game-director-public-integration-decision**.

QA confirms the local Web export artifacts exist, remain isolated under the prototype export path, and run locally in Chromium when served with required COOP/COEP headers. Browser smoke verified non-empty canvas rendering, visible HUD/draft/VTS status in screenshots, start via `Space`, deterministic reset via `R`, and no final maritime training claims.

No blocking changes are required before Game Director decides whether to assign a separate public integration task. Public integration must not proceed without explicit assignment and must include the required cross-origin isolation headers.
