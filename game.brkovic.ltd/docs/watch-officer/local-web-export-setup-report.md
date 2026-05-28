# TASK-0059 - отчет по Install Web Export Templates And Rerun Local Export

**Статус:** `local-web-export-created`  
**Owner Chat:** CHAT-ENGINE-001 / Engine / Godot Prototype  
**Дата:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`

## Summary

Godot Web export templates for `4.2.2.stable.official.15073afe3` установлены локально, полный headless regression suite прошел, local-only Web export выполнен в разрешенный prototype output path:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Публичные пути, routing, hub, Captain Ether, Nav Desk, auth и production config не менялись. Export artifacts не переносились в `public/`.

## Files Changed Or Added

```text
.gitignore
game.brkovic.ltd/prototypes/watch-officer-godot/README.md
game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md
```

`exports/` is ignored by root `.gitignore`, so generated build artifacts remain local prototype artifacts.

## Godot Version

Command:

```bash
godot --version
```

Output:

```text
4.2.2.stable.official.15073afe3
```

## Template Install Method

Downloaded official Godot export templates archive:

```text
https://github.com/godotengine/godot/releases/download/4.2.2-stable/Godot_v4.2.2-stable_export_templates.tpz
```

Command:

```bash
mkdir -p /tmp/godot-4.2.2-templates
curl -L --fail --show-error --output /tmp/godot-4.2.2-templates/Godot_v4.2.2-stable_export_templates.tpz https://github.com/godotengine/godot/releases/download/4.2.2-stable/Godot_v4.2.2-stable_export_templates.tpz
```

Archive verification:

```text
templates/web_debug.zip
templates/web_release.zip
templates/version.txt
```

Installed standard local templates path:

```text
/home/alexey/.local/share/godot/export_templates/4.2.2.stable/
```

Installed WebStorm/Flatpak runtime path used by the current `godot` process:

```text
/home/alexey/.var/app/com.jetbrains.WebStorm/data/godot/export_templates/4.2.2.stable/
```

Verified files:

```text
version.txt
web_debug.zip
web_dlink_debug.zip
web_dlink_release.zip
web_release.zip
```

Template version:

```text
4.2.2.stable
```

## Export Setup Status

Preset:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

Verification:

```bash
test -f game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

Result:

```text
export_presets.cfg exists
```

Preset summary:

```text
name="Web Local"
platform="Web"
export_path="exports/web-local/index.html"
```

Ignore policy:

```text
/game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

## Headless Regression

Command set:

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

Pass/fail output:

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

## Export Command

Initial export attempt exposed the Godot runtime template path used by this environment:

```text
/home/alexey/.var/app/com.jetbrains.WebStorm/data/godot/export_templates/4.2.2.stable/
```

After installing templates there, export succeeded.

Command:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --export-release "Web Local" exports/web-local/index.html
```

Pass output summary:

```text
Godot Engine v4.2.2.stable.official.15073afe3
savepack: begin: Packing steps: 102
savepack: end
```

Non-blocking warnings:

```text
WARNING: Custom cursor shape not supported by this display server.
WARNING: Blend file import is enabled in the project settings, but no Blender path is configured in the editor settings.
```

## Generated Artifacts

Generated files:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.apple-touch-icon.png
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.audio.worklet.js
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.html
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.icon.png
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.js
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.pck
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.png
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.wasm
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.worker.js
```

Required artifact classes present:

```text
index.html
index.js
index.wasm
index.pck
```

## Public Path Verification

Command:

```bash
find public game.brkovic.ltd/public -type f \( -name 'index.pck' -o -name 'index.wasm' -o -name 'index.worker.js' -o -name '*.pck' -o -name '*.wasm' \) -print 2>/dev/null
```

Output:

```text
none
```

No generated export artifacts were placed under:

```text
public/
game.brkovic.ltd/public/
```

## Main Scene Verification

Command:

```bash
grep -n 'run/main_scene' game.brkovic.ltd/prototypes/watch-officer-godot/project.godot
```

Output:

```text
10:run/main_scene="res://scenes/playable_greybox_scene.tscn"
```

## Boundaries Preserved

Confirmed untouched:

```text
public/
game.brkovic.ltd/public/
game hub routing
Captain Ether
Nav Desk
auth
production config
```

No public server was run. No deployment, public web embedding, game hub integration, or final maritime training claim was introduced.

## Next Expected

QA review for local Web export artifact behavior. Browser smoke testing should serve `exports/web-local/` locally only and verify input focus, viewport readability, draft/non-final wording, and deterministic restart behavior before any public integration decision.
