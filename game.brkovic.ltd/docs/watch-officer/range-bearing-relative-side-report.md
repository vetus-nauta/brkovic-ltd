# Watch Officer: отчёт по range/bearing/relative side

**Статус:** реализовано и проверено headless  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Дата:** 2026-05-26  
**Task:** `TASK-0037`  
**Scenario:** `safe-water-crossing-target`

## Объём

Реализован только updater для нейтральных geometry values между ownship и target vessel сценария 1.

Этот slice вычисляет `range_m`, `bearing_true_deg`, `relative_bearing_deg` и `relative_side`. Он не классифицирует encounter, не считает CPA/TCPA, не проверяет safe/shallow geometry, не поднимает warnings, не меняет scenario result, не создаёт playable scenes и не реализует UI rendering.

Maritime content остаётся draft technical scenario content и не является финальным учебным материалом.

## Изменённые файлы

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/range_bearing_updater.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_range_bearing_relative_side.gd
```

## Реализовано

`range_bearing_updater.gd`:

- читает существующие ownship runtime state и target runtime state;
- вычисляет расстояние между `position_m` ownship и target;
- вычисляет true bearing в scenario heading convention, где heading `0` направлен вдоль положительной Y-оси;
- вычисляет relative bearing относительно `ownship.heading_deg`;
- определяет `relative_side` как `port`, `starboard`, `ahead`, `astern` или `ambiguous`;
- возвращает updated target dictionary и не мутирует переданные ownship/target dictionaries.

## Проверенные assertions

Новый headless test проверяет:

- начальная дистанция до target от spawn-позиции ownship детерминирована;
- начальный true bearing от ownship к target детерминирован;
- начальный relative side совместим с `crossing_from: "starboard"`;
- после movement samples ownship/target значения range и bearing обновляются детерминированно;
- updater не меняет позицию ownship;
- updater сохраняет target position, heading, speed и AIS vector;
- `encounter.class` остаётся bootstrap assumption `crossing`;
- `cpa_tcpa.state` остаётся bootstrap-only `safe`;
- `warnings.primary_warning` остаётся `null`;
- `scenario_result` остаётся `ready`.

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

## Границы сохранены

Не реализовано:

- encounter classifier;
- CPA/TCPA solver;
- geometry collision checks;
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

## Примечания

`relative_side` в этом slice является geometry-derived display/runtime field. Это не новое решение по encounter class и не maritime rule evaluation.

Пороговые зоны side намеренно узкие и относятся только к neutral geometry:

- `ahead`: relative bearing `<= 10` или `>= 350`;
- `astern`: `170..190`;
- `starboard`: `(10..170)`;
- `port`: `(190..350)`;
- остальные граничные случаи возвращают `ambiguous`.

## Отчет для ШЕФ ПРОЕКТА Watch Officer

TASK-0037 реализован и verified headless.

Engine теперь имеет deterministic updater для range, true bearing, relative bearing и relative side между ownship и target. Slice намеренно не открывает encounter classifier, CPA/TCPA solver, geometry checks, warnings, result evaluation, playable scenes или UI rendering.
