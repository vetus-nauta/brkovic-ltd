# TASK-0051 - отчет по Playable Greybox Scene Pack

**Статус:** done  
**Owner Chat:** CHAT-ENGINE-001 / Engine / Godot Prototype  
**Дата:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`

## Объем

Реализован первый local playable greybox scene pack для Watch Officer scenario 1.

Scene pack запускает validated scenario, использует existing runtime bootstrap и `runtime_step_orchestrator`, показывает simple top-down greybox, принимает keyboard controls и выводит minimal debug HUD из Engine snapshot.

Это local Godot prototype only. Это не final art, не production, не public web deployment и не final maritime training content.

## Файлы

```text
game.brkovic.ltd/prototypes/watch-officer-godot/project.godot
game.brkovic.ltd/prototypes/watch-officer-godot/scenes/README.md
game.brkovic.ltd/prototypes/watch-officer-godot/scenes/playable_greybox_scene.tscn
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_playable_greybox_scene_pack.gd
game.brkovic.ltd/docs/watch-officer/playable-greybox-scene-pack-report.md
```

## Local Launch

```bash
godot --path game.brkovic.ltd/prototypes/watch-officer-godot
```

`project.godot` now sets:

```text
run/main_scene="res://scenes/playable_greybox_scene.tscn"
```

## Controls

```text
A / Left  -> turn port
D / Right -> turn starboard
Q / Down  -> speed down
E / Up    -> speed up
R         -> reset scenario
```

Keyboard input is converted into tick-indexed orchestrator input records. The scene does not compute maritime logic in HUD/display code.

## Rendered Greybox

The scene renders:

- ownship marker;
- target marker;
- safe corridor polygon;
- shallow zone polygons;
- finish gate;
- one Region A lateral pair;
- ownship heading cue;
- target heading/vector cue;
- minimal debug HUD.

HUD displays Engine snapshot fields:

- tick/time;
- ownship heading;
- speed level;
- CPA/TCPA qualitative state;
- primary warning text key/severity;
- scenario result state;
- VTS disabled/inactive;
- draft/non-final status.

## Команды

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
```

Результат:

```text
playable_greybox_scene_pack_test: 31 passed, 0 failed
```

Полный regression run:

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
```

Результаты:

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
```

## Known Greybox Limitations

- Heading-up transform is deterministic and anchored to ownship lower-third, but camera smoothing and full production camera tuning are not implemented.
- Geometry and vessel markers are simple immediate-mode `Node2D` drawing, not final art.
- HUD is a debug overlay only.
- Target/ownship labels are not final UI.
- No VTS popup is shown because scenario 1 VTS remains disabled.
- No web embedding or export is included.

## Границы сохранены

Подтверждено, что не включено:

- production deployment;
- `public/`;
- game hub routing;
- Captain Ether;
- Nav Desk;
- auth;
- production config;
- final art requirements;
- final maritime training claims;
- VTS in scenario 1;
- web embedding or export.

## Next Expected

QA review for TASK-0051.
