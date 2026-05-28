# Watch Officer Target Kinematic Integrator Report

**Статус:** реализовано и проверено headless  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Дата:** 2026-05-26  
**Task:** `TASK-0035`  
**Scenario:** `safe-water-crossing-target`

## Объём

Реализован только target kinematic integrator для deterministic headless tests.

Этот slice двигает scenario 1 target vessel по `constant_course_speed` и вычисляет AIS `vector_end_position_m`. Он не применяет input records к target, не двигает ownship, не считает range/bearing сверх bootstrap defaults, не считает CPA/TCPA, не проверяет geometry, не поднимает warnings и не меняет scenario result.

Maritime content остаётся draft technical scenario content и не является final training content.

## Изменённые Файлы

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/target_kinematic_integrator.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_target_kinematic_integrator.gd
```

## Реализовано

`target_kinematic_integrator.gd`:

- стартует от bootstrap target state;
- поддерживает только `behaviour == "constant_course_speed"`;
- использует `heading_deg`, `speed_mps`, `vector_horizon_sec`;
- продвигает target position по fixed delta;
- сохраняет heading unchanged для scenario 1;
- вычисляет `vector_end_position_m` из текущей target position, heading, speed и AIS vector horizon.

Координатная convention совпадает с ownship integrator:

- heading `0` двигает объект вдоль положительной Y-оси сценария;
- heading `270` двигает target в отрицательном X-направлении.

## Проверенные Assertions

Новый headless test проверяет:

- target starts at scenario spawn position `[150, 260]`;
- target heading remains `270`;
- target speed remains `4.2`;
- after fixed ticks, target position advances deterministically on heading `270`;
- target AIS vector endpoint is deterministic;
- ownship position remains unchanged;
- `scenario_result` remains `ready`;
- `warnings.primary_warning` remains `null`;
- no CPA/TCPA state change is produced by this slice;
- range/bearing remain bootstrap defaults.

## Verification

Godot binary:

```text
/home/alexey/.local/bin/godot
4.2.2.stable.official.15073afe3
```

Loader verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Result:

```text
scenario_loader_test: 82 passed, 0 failed
```

Runtime bootstrap verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
```

Result:

```text
runtime_bootstrap_test: 27 passed, 0 failed
```

Fixed tick and input log verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_fixed_tick_input_log.gd
```

Result:

```text
fixed_tick_input_log_test: 24 passed, 0 failed
```

Ownship kinematic integrator verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_ownship_kinematic_integrator.gd
```

Result:

```text
ownship_kinematic_integrator_test: 19 passed, 0 failed
```

Target kinematic integrator verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_target_kinematic_integrator.gd
```

Result:

```text
target_kinematic_integrator_test: 18 passed, 0 failed
```

## Границы Сохранены

Не реализовано:

- CPA/TCPA solver;
- geometry collision checks;
- encounter classifier beyond existing bootstrap assumptions;
- warning escalation;
- result success/failure evaluation;
- playable scenes;
- UI rendering;
- public routes;
- Captain Ether changes;
- hub routing changes;
- Nav Desk changes;
- auth changes;
- production config changes;
- final maritime training claims.

## Notes

Интегратор возвращает новый target state dictionary и не мутирует runtime-level ownship, warnings, CPA/TCPA или result state.

AIS vector endpoint вычисляется как projection from current target position over `vector_horizon_sec`. Это только vector geometry for runtime state; это не CPA/TCPA solver и не encounter risk assessment.

## Report For Project Lead

TASK-0035 реализован и verified headless.

Engine теперь имеет deterministic target movement slice: target vessel двигается по constant course/speed, сохраняет heading, и выдаёт AIS vector endpoint. Slice намеренно не открывает CPA solving, geometry checks, warning escalation, result evaluation, playable scenes или UI.
