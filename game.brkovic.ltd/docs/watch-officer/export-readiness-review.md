# TASK-0057 - Export Readiness Review

**Статус:** done  
**Owner Chat:** CHAT-ENGINE-001 / Engine / Godot Prototype  
**Дата:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`

## Readiness Decision

**Decision:** `changes-required-before-export-task`

Локальный Godot prototype функционально готов к export readiness planning: QA approved local play loop, HUD readability и playable greybox packs. Но отдельная export task пока небезопасна без export setup preconditions:

1. В проекте нет `export_presets.cfg`.
2. Локальные Godot Web export templates для `4.2.2.stable.official.15073afe3` не обнаружены.
3. Не задана явная политика output directory / gitignore для generated export artifacts.

Это не runtime blocker и не gameplay blocker. Это export setup blocker.

## Current Godot Project Status

Project path:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

Godot CLI:

```text
/home/alexey/.local/bin/godot
```

Godot version:

```text
4.2.2.stable.official.15073afe3
```

`project.godot` status:

```text
config/name="Watch Officer Prototype"
config/description="Local playable greybox prototype; draft/non-final training content."
run/main_scene="res://scenes/playable_greybox_scene.tscn"
config/features=PackedStringArray("4.2")
renderer/rendering_method="mobile"
```

Main scene:

```text
res://scenes/playable_greybox_scene.tscn
```

Local launch:

```bash
godot --path game.brkovic.ltd/prototypes/watch-officer-godot
```

## Current Test Suite

Latest QA-approved pass summaries:

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

## Export Presets And Templates

Export presets:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

Status:

```text
not found
```

Generated export artifacts in prototype path:

```text
not found
```

Local Web export templates:

```text
not confirmed / not found by read-only filesystem check
```

Observed template check commands:

```bash
find game.brkovic.ltd/prototypes/watch-officer-godot -maxdepth 2 -type f -name 'export_presets.cfg' -print
find "$HOME/.local/share/godot" "$HOME/.var/app/org.godotengine.Godot/data/godot" "$HOME/.var/app/org.godotengine.Godot/.local/share/godot" "$HOME/.config/godot" -maxdepth 4 -type d -iname '*template*' -o -type f -iname '*web*release*' 2>/dev/null
```

No Godot export command was run.

## Likely Export Target

Recommended first export target:

```text
Godot Web / HTML5 local build
```

Reason:

- The prototype is a local 2D greybox with keyboard controls.
- No public route or hub integration is approved yet.
- Web export is the natural next validation step before any public embedding discussion.

## Proposed Output Path

Recommended output directory for a future export task:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

This path is intentionally outside:

```text
game.brkovic.ltd/public/
public/
```

Generated files should remain local prototype artifacts until Game Director approves public integration.

Expected generated artifact examples:

```text
*.html
*.js
*.wasm
*.pck
*.png
*.worker.js
```

## Gitignore / Artifact Policy

Before any export is run, add a project-safe ignore rule for generated prototype exports, for example:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

Do not place generated export artifacts in `public/` or production paths during the first export task.

## Risks

### Draft Maritime Content

Scenario 1 remains draft/non-final:

```text
rule_review_status: "draft"
training_claim_status: "draft_not_final_training_content"
```

Exported builds must visibly preserve draft/non-final wording and must not use final-training claims such as:

```text
official
certified
COLREGS compliant
correct rule
```

### Local-Only Greybox UI/Art

The current scene is readable enough for local QA, but it is not final art or final responsive UI. Browser screenshots must verify:

- HUD text remains readable;
- ownship remains lower-third;
- target AIS vector remains visible;
- controls/help do not hide critical geometry;
- captain report remains non-final/draft.

### Browser / Web Runtime

Risks to verify in local Web build:

- WebGL renderer compatibility with current `mobile` renderer setting;
- keyboard focus and browser key capture for arrows, space, enter, and reset;
- browser scaling / viewport behavior;
- font rendering and label clipping;
- fixed tick behavior under browser frame pacing;
- audio policy if audio is later added. Current prototype does not require audio.

### Public Hub Integration

Public game hub integration should remain blocked until:

- local Web export builds successfully;
- build is served locally and manually smoke-tested;
- QA approves browser behavior;
- Game Director explicitly approves moving artifacts toward public paths.

## Export Preconditions

Required before a safe export task:

1. Install or verify Godot `4.2.2` Web export templates locally.
2. Add a minimal Web export preset under `game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg`.
3. Add generated export output path to ignore policy before running export.
4. Run the full headless regression suite.
5. Confirm no generated artifact path points to `public/`.
6. Confirm draft/non-final wording is still visible in HUD/captain report.
7. Confirm VTS remains disabled/inactive for scenario 1.

## Exact Verification Commands Before Export

```bash
godot --version
test -f game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
find game.brkovic.ltd/prototypes/watch-officer-godot -maxdepth 3 -type f \( -name '*.html' -o -name '*.js' -o -name '*.wasm' -o -name '*.pck' \) -print
```

Regression commands:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_fixed_tick_input_log.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_ownship_kinematic_integrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_target_kinematic_integrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_range_bearing_relative_side.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_cpa_tcpa_numeric_debug_solver.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_safe_water_geometry_monitor.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_warning_escalation_foundation.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_result_evaluator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_step_orchestrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_hud_binding_readability_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
```

Do not run export until export setup preconditions are complete.

## Paths That Must Remain Untouched

```text
public/
game.brkovic.ltd/public/
Captain Ether
game hub routing
Nav Desk
auth
production config
```

No web embedding, public route, production deploy, or game hub integration should be included in the next export setup task.

## Recommended Next Task Wording

```text
TASK-0058 - Local Web Export Setup Preconditions

Working directory:
/home/alexey/GitHub/Revoyacht/brkovic-ltd

Read:
game.brkovic.ltd/docs/watch-officer/export-readiness-review.md
game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md

Task:
Prepare local-only Godot Web export setup for Watch Officer prototype without running public integration:
- verify/install Godot 4.2.2 Web export templates;
- create minimal Web export preset for prototypes/watch-officer-godot;
- add generated export output path to ignore policy;
- run full headless regression suite;
- if and only if setup passes, run a local Web export to prototypes/watch-officer-godot/exports/web-local/;
- do not touch public/, hub routing, Captain Ether, Nav Desk, auth, production config;
- do not deploy or embed publicly;
- keep draft/non-final maritime wording visible.

Required output:
game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md
```

## Notes

`game.brkovic.ltd/prototypes/watch-officer-godot/README.md` still says "Scaffold only. This is not a playable prototype." That wording is stale after TASK-0051 through TASK-0055. It is not an export blocker, but should be updated in a separate documentation cleanup or export setup task so local operators do not confuse the current playable greybox state with the original scaffold state.
