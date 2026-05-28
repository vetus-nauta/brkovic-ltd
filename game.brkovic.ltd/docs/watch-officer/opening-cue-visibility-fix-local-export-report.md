# TASK-0084 — Opening Cue Visibility Fix And Local Export Rerun

Status: `passed`

Owner chat: CHAT-ENGINE-001 / Engine / Godot Prototype

Дата: 2026-05-27

## Summary

Исправлен QA blocker TASK-0083: opening lateral-pair cue теперь остаётся видимым достаточно долго в exported browser flow.

Expected cue:

```text
Read the lateral pair. Stay in the marked corridor.
```

Fix выполнен только в локальном Godot prototype. После фикса повторно выполнен prototype-local Web export в:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

`public/`, deploy, FTP, production files, Captain Ether, Nav Desk, router/registry, auth и production config не трогались.

## Files Changed

- `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_one_decision_coaching_pack.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/`
- `game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`

## Fix Approach

- Added `OPENING_CUE_HOLD_TICKS := 40` in `HudSnapshotBinder`.
- Opening cue now remains active through the first 40 fixed ticks of `running`.
- This covers QA-observed exported-browser states at tick 10 and tick 21.
- Higher-priority Engine state still overrides the opening cue:
  - terminal result;
  - immediate warning;
  - CPA/TCPA `danger` or `immediate`;
  - shallow/grounded safe-water states;
  - warning `danger` or `caution`;
  - CPA/TCPA `caution`;
  - corridor buffer;
  - finish crossed.
- Cue count remains capped to one primary cue plus two chips.
- Reset with `R` still clears coaching and returns to ready/briefing.
- Player-facing surfaces still hide numeric CPA/TCPA, debug fields, thresholds, encounter confidence, replay seed/tolerance, and final/official/certified/COLREGS-compliant claims.
- VTS remains disabled/inactive.

## Godot

Binary:

```text
/home/alexey/.local/bin/godot
```

Version:

```text
4.2.2.stable.official.15073afe3
```

## Commands Run

Focused test:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_decision_coaching_pack.gd
```

Full headless regression:

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
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_briefing_result_feedback_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_decision_coaching_pack.gd
```

Local Web export:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --export-release "Web Local" exports/web-local/index.html
```

Artifact check:

```bash
for file in index.html index.js index.wasm index.pck index.worker.js index.audio.worklet.js; do test -f "game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/$file" && printf 'present %s\n' "$file" || printf 'missing %s\n' "$file"; done
find game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local -maxdepth 1 -type f -printf '%f %s bytes\n' | sort
```

## Test Result

- `scenario_loader_test`: 82 passed, 0 failed
- `runtime_bootstrap_test`: 27 passed, 0 failed
- `fixed_tick_input_log_test`: 24 passed, 0 failed
- `ownship_kinematic_integrator_test`: 19 passed, 0 failed
- `target_kinematic_integrator_test`: 18 passed, 0 failed
- `range_bearing_relative_side_test`: 23 passed, 0 failed
- `scenario_one_encounter_classifier_test`: 16 passed, 0 failed
- `cpa_tcpa_numeric_debug_solver_test`: 21 passed, 0 failed
- `safe_water_geometry_monitor_test`: 24 passed, 0 failed
- `warning_escalation_foundation_test`: 127 passed, 0 failed
- `scenario_result_evaluator_test`: 66 passed, 0 failed
- `runtime_step_orchestrator_test`: 43 passed, 0 failed
- `playable_greybox_scene_pack_test`: 31 passed, 0 failed
- `hud_binding_readability_pack_test`: 43 passed, 0 failed
- `local_play_loop_polish_pack_test`: 45 passed, 0 failed
- `briefing_result_feedback_pack_test`: 56 passed, 0 failed
- `scenario_one_decision_coaching_pack_test`: 78 passed, 0 failed

## Export Result

Export command completed with exit code 0.

Non-blocking warnings:

```text
WARNING: Custom cursor shape not supported by this display server.
WARNING: Blend file import is enabled in the project settings, but no Blender path is configured in the editor settings. Blend files will not be imported.
```

Required artifacts:

```text
present index.html
present index.js
present index.wasm
present index.pck
present index.worker.js
present index.audio.worklet.js
```

Generated local artifact list:

```text
index.apple-touch-icon.png        12142 bytes
index.apple-touch-icon.png.import   818 bytes
index.audio.worklet.js             7199 bytes
index.html                         6558 bytes
index.icon.png                     5683 bytes
index.icon.png.import               782 bytes
index.js                         452321 bytes
index.pck                        241840 bytes
index.png                         21443 bytes
index.png.import                    766 bytes
index.wasm                     35708238 bytes
index.worker.js                    5793 bytes
```

`.import` files remain export-side local metadata only and were not copied to any public handoff.

## Scope Preserved

- `public/` not touched.
- No copy to `game.brkovic.ltd/public/`.
- No deploy.
- No FTP/upload.
- Production files not touched.
- Captain Ether not touched.
- Nav Desk not touched.
- Router/registry not touched.
- Auth not touched.
- Production config not touched.
- Deploy state not touched.
- No new scenario added.
- No VTS added to scenario 1.
- No final maritime training claims added.

## Next Expected

QA rerun local Web export smoke for opening cue visibility.
