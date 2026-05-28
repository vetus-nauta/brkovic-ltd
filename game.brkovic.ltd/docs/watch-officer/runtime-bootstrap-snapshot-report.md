# Watch Officer Runtime Bootstrap Snapshot Report

**Status:** Implemented and verified headless  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0029`  
**Scenario:** `safe-water-crossing-target`

## Scope

Implemented only the first runtime slice: headless Runtime Bootstrap Snapshot Slice.

This slice loads the validated scenario, builds immutable static state, builds tick-0 Engine-owned runtime state, exports one UI/HUD snapshot, and records deterministic bootstrap events.

This is not playable gameplay. Maritime content remains draft technical scenario content and is not final training content.

## Files Added

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/core/fixed_tick_clock.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/core/event_log.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/core/runtime_bootstrap.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/runtime_state.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/runtime_snapshot_exporter.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/replay_input_log.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/ownship_state_builder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/target_state_builder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/static_geometry_state_builder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_runtime_bootstrap_state.gd
```

## Implemented Behaviour

`RuntimeBootstrap` now:

1. Uses the existing `ScenarioLoader`.
2. Stops if loader validation fails.
3. Builds a deterministic run id.
4. Initializes fixed tick metadata at tick `0`.
5. Builds immutable `scenario_static`.
6. Builds tick-0 runtime state for ownship, target, safe-water bootstrap state, encounter bootstrap state, CPA/TCPA bootstrap default, inactive VTS, empty warnings, QA metadata, and replay foundation.
7. Exports one `runtime_snapshot`.
8. Records deterministic bootstrap event order:
   - `scenario_load_started`
   - `scenario_loaded`
   - `runtime_initialized`
   - `snapshot_exported`
   - `event_log_finalized`

## Required Assertions Covered

The runtime bootstrap test verifies:

- loader success is required before bootstrap starts;
- `scenario_static.iala_region == "A"`;
- `scenario_static.rule_review_status == "draft"`;
- `runtime_snapshot.tick == 0`;
- `runtime_snapshot.qa.seed == 1001`;
- `runtime_snapshot.qa.fixed_tick_hz == 20`;
- `runtime_snapshot.qa.event_timing_tolerance_ticks == 1`;
- `runtime_snapshot.vts.enabled == false`;
- `runtime_snapshot.vts.state == "inactive"`;
- `runtime_snapshot.encounter.class == "crossing"`;
- `runtime_snapshot.encounter.player_role == "give_way"`;
- `runtime_snapshot.cpa_tcpa.state == "safe"` as bootstrap default only;
- `runtime_snapshot.warnings.primary_warning == null`;
- deterministic event log order.

## Verification

Godot binary:

```text
/home/alexey/.local/bin/godot
4.2.2.stable.official.15073afe3
```

Loader verification command:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Result:

```text
scenario_loader_test: 82 passed, 0 failed
```

Runtime bootstrap verification command:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
```

Result:

```text
runtime_bootstrap_test: 27 passed, 0 failed
```

## Boundary Preserved

Not implemented:

- movement controls;
- vessel movement;
- geometry collision checks;
- CPA/TCPA solver;
- warning escalation;
- result success/failure evaluation;
- playable scenes;
- UI rendering;
- replay playback;
- public routes;
- Captain Ether changes;
- hub routing changes;
- Nav Desk changes;
- auth changes;
- production config changes;
- final maritime training claims.

## Notes

`runtime_snapshot.cpa_tcpa.state` is initialized as `safe` only as a bootstrap default. It is not a CPA solver result.

`encounter.class` and `encounter.player_role` are initialized from validated scenario expectations for scenario 1. They remain draft scenario assumptions, not final COLREGS training claims.

`safe_water.state` is initialized as `in_corridor` only for tick-0 bootstrap state. No geometry collision or boundary calculation is implemented in this slice.

## Report For Project Lead

TASK-0029 is implemented and verified headless.

The Engine now has the first runtime foundation after loader verification: validated scenario data can become deterministic tick-0 static/runtime state, a read-only UI/HUD snapshot, and ordered bootstrap events. The next implementation step should remain narrow and should not open movement, CPA solving, warning escalation, result evaluation, playable scenes, or UI rendering without a separate task.
