# Watch Officer: отчёт по CPA/TCPA numeric debug solver

**Статус:** реализовано и проверено headless  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Дата:** 2026-05-26  
**Task:** `TASK-0041`  
**Scenario:** `safe-water-crossing-target`

## Объём

Реализован только CPA/TCPA numeric debug solver для deterministic headless tests.

Solver вычисляет numeric `cpa_m_debug`, `tcpa_sec_debug`, closest point positions для ownship/target и мапит результат в один из scenario qualitative states: `safe`, `caution`, `danger`, `immediate`.

Это draft technical scenario logic. Она не является финальным учебным материалом и не должна подаваться как final maritime training content.

## Изменённые файлы

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/cpa_tcpa_debug_solver.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_cpa_tcpa_numeric_debug_solver.gd
```

## Реализовано

`cpa_tcpa_debug_solver.gd`:

- читает current ownship `position_m`, `heading_deg`, `speed_mps`;
- читает current target `position_m`, `heading_deg`, `speed_mps`;
- использует scenario heading convention, где heading `0` направлен вдоль положительной Y-оси;
- вычисляет relative velocity и raw TCPA;
- clamp-ит closest point projection в пределах `scenario.cpa_tcpa.horizon_sec`;
- выставляет `active == true` только когда raw TCPA не в прошлом и попадает в `active_tcpa_max_sec`;
- мапит CPA/TCPA в qualitative state по scenario thresholds;
- сохраняет `previous_state` и `changed_tick`, если они переданы;
- возвращает отдельный CPA/TCPA dictionary и не мутирует runtime state.

Для стартового scenario state deterministic debug values:

```text
cpa_m_debug: 146.6936
tcpa_sec_debug: 53.5789
closest_point_ownship_m: [0.0, 133.9473]
closest_point_target_m: [-75.0314, 260.0]
state: safe
active: true
```

## Проверенные assertions

Новый headless test проверяет:

- solver returns numeric `cpa_m_debug`;
- solver returns numeric `tcpa_sec_debug`;
- closest point positions deterministic;
- output state входит в `scenario.cpa_tcpa.qualitative_states`;
- repeated calls with same inputs return same output;
- `previous_state` сохраняется, если передан previous CPA/TCPA state;
- warnings remain unchanged;
- scenario result remains `ready`;
- safe-water geometry state remains unchanged;
- encounter class remains existing scenario-1 draft output;
- no warning or result event is emitted by this slice.

## Проверка

Godot binary:

```text
/home/alexey/.local/bin/godot
4.2.2.stable.official.15073afe3
```

Loader verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Результат:

```text
scenario_loader_test: 82 passed, 0 failed
```

Runtime bootstrap verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
```

Результат:

```text
runtime_bootstrap_test: 27 passed, 0 failed
```

Fixed tick and input log verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_fixed_tick_input_log.gd
```

Результат:

```text
fixed_tick_input_log_test: 24 passed, 0 failed
```

Ownship kinematic integrator verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_ownship_kinematic_integrator.gd
```

Результат:

```text
ownship_kinematic_integrator_test: 19 passed, 0 failed
```

Target kinematic integrator verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_target_kinematic_integrator.gd
```

Результат:

```text
target_kinematic_integrator_test: 18 passed, 0 failed
```

Range/bearing/relative side verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_range_bearing_relative_side.gd
```

Результат:

```text
range_bearing_relative_side_test: 23 passed, 0 failed
```

Scenario 1 encounter classifier verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
```

Результат:

```text
scenario_one_encounter_classifier_test: 16 passed, 0 failed
```

CPA/TCPA numeric debug solver verification:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_cpa_tcpa_numeric_debug_solver.gd
```

Результат:

```text
cpa_tcpa_numeric_debug_solver_test: 21 passed, 0 failed
```

## Границы сохранены

Не реализовано:

- warning escalation;
- result success/failure evaluation;
- safe-water geometry checks;
- playable scenes;
- UI rendering;
- public routes;
- Captain Ether changes;
- hub routing changes;
- Nav Desk changes;
- auth changes;
- production config changes;
- final maritime training claims.

## Примечания

Qualitative CPA/TCPA state в этом slice является Engine debug/risk state для прототипной проверки. Он не поднимает warnings и не меняет scenario result.

Solver использует только текущие kinematic states. Он не двигает vessels, не классифицирует encounter заново и не проверяет safe/shallow geometry.

## Отчет для ШЕФ ПРОЕКТА Watch Officer

TASK-0041 реализован и verified headless.

Engine теперь имеет deterministic CPA/TCPA numeric debug solver: он вычисляет CPA, TCPA, closest point positions, active flag и qualitative state по scenario thresholds. Slice намеренно не открывает warning escalation, result evaluation, safe-water geometry checks, playable scenes или UI rendering.
