# TASK-0053 - отчет по HUD Binding And Readability Pack

**Статус:** done  
**Owner Chat:** CHAT-ENGINE-001 / Engine / Godot Prototype  
**Дата:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`

## Объем

Реализован локальный HUD/readability pack для Godot greybox scene Watch Officer.

HUD теперь разделен на экранные зоны: instrument strip, warning stack, result status, draft/QA debug status, cue legend и controls legend. Отображение читает данные из Engine `runtime_snapshot` как read-only display data и не вычисляет encounter class, player role, CPA/TCPA, safe-water state, warnings, VTS или scenario result.

Это локальный prototype pack. Это не public web integration, не export, не production, не final art и не final maritime training content.

## Файлы

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scenes/playable_greybox_scene.tscn
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/runtime_snapshot_exporter.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_hud_binding_readability_pack.gd
game.brkovic.ltd/docs/watch-officer/hud-binding-readability-pack-report.md
```

## Что изменено

- Добавлен `HudSnapshotBinder`, который форматирует HUD sections только из `runtime_snapshot`.
- `runtime_snapshot` расширен read-only блоком `scenario_static` для HUD: scenario id/version, title key, `rule_review_status`, `training_claim_status`, `iala_region`.
- `playable_greybox_scene.tscn` получил отдельные labels для warnings, result, draft/debug, cue legend и controls.
- `PlayableGreyboxController` обновляет HUD sections после bootstrap/reset и после каждого orchestrator tick.
- Safe corridor, shallow zones, finish gate, Region A lateral pair, ownship cue, target cue и AIS vector получили более читаемые greybox-обводки/подсказки.
- VTS popup не добавлялся; scenario 1 остается `enabled=false`, `state=inactive`.

## HUD Binding

HUD отображает из `runtime_snapshot`:

- tick/time;
- ownship heading, speed level, turn state;
- safe-water qualitative state;
- CPA/TCPA qualitative state;
- primary warning и secondary warnings;
- scenario result;
- VTS disabled/inactive;
- draft/non-final status;
- QA seed, fixed tick Hz, replay tolerance.

Player-facing CPA/TCPA остается qualitative. Numeric debug values не выведены в player strip.

## Local Launch

```bash
godot --path game.brkovic.ltd/prototypes/watch-officer-godot
```

Главная сцена остается:

```text
res://scenes/playable_greybox_scene.tscn
```

## Commands Used

Новый HUD smoke test:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_hud_binding_readability_pack.gd
```

Результат:

```text
hud_binding_readability_pack_test: 43 passed, 0 failed
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
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_hud_binding_readability_pack.gd
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
hud_binding_readability_pack_test: 43 passed, 0 failed
```

## Known Greybox/HUD Limitations

- HUD positioning is deterministic and screen-readable for the local greybox, but not final responsive UI polish.
- Greybox drawing still uses immediate-mode `Node2D`, not final art/assets.
- Heading-up/lower-third placement remains local prototype camera logic without production smoothing.
- Cue legend is compact debug/training status support, not final localized UI copy.
- No VTS popup exists because scenario 1 keeps VTS disabled.
- No web embedding/export is included.

## Границы сохранены

Подтверждено, что не открывались и не менялись:

- `public/`;
- Captain Ether;
- game hub routing;
- Nav Desk;
- auth;
- production config;
- public web embedding/export.

Не добавлялись final art requirements и final maritime training claims.

## Next Expected

QA review for TASK-0053.
