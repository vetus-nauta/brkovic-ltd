# Watch Officer Minimal Runtime Planning Skeleton

**Status:** Planning artifact only  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0027`  
**Scenario:** `safe-water-crossing-target`

## Purpose

This document defines the first safe runtime implementation slice after Godot headless loader verification becomes available.

It is not runtime code. It does not implement gameplay, create playable scenes, change the loader, implement UI, change public routes, modify Captain Ether, Nav Desk, auth, production config, or present draft maritime rules as final training content.

## Current Gate

Runtime implementation remains blocked until this command passes with Godot 4.2+:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

The planning below is the next slice only after that loader test passes.

## Planning Inputs

- Engine runtime state contract: approved for UI/HUD and QA planning.
- UI/HUD runtime state review: approved for HUD binding plan.
- QA Engine/UI contract review: approved for runtime planning.
- Scenario loader implementation: implemented, pending Godot headless run.
- Game Director scenario 1 decisions:
  - Region A lateral pair.
  - VTS disabled.
  - Qualitative CPA/TCPA mandatory.
  - Numeric CPA/TCPA debug values required in logs.
  - Safe corridor + shallow zone + caution buffers.
  - `rule_review_status: "draft"` only, with non-final training wording.

## Proposed Future GDScript Modules

These are proposed names only. Do not create them until the loader headless test passes and the next implementation task is assigned.

```text
res://scripts/core/fixed_tick_clock.gd
res://scripts/core/runtime_bootstrap.gd
res://scripts/core/event_log.gd
res://scripts/runtime/runtime_state.gd
res://scripts/runtime/runtime_snapshot_exporter.gd
res://scripts/runtime/replay_input_log.gd
res://scripts/sim/ownship_state_builder.gd
res://scripts/sim/target_state_builder.gd
res://scripts/sim/static_geometry_state_builder.gd
res://scripts/ui_bridge/hud_snapshot_stub.gd
res://tests/runtime/test_runtime_bootstrap_state.gd
```

Deferred modules, not part of the first slice:

```text
res://scripts/sim/movement_model.gd
res://scripts/sim/geometry_monitor.gd
res://scripts/sim/encounter_classifier.gd
res://scripts/sim/cpa_solver.gd
res://scripts/sim/warning_pipeline.gd
res://scripts/sim/scenario_result_model.gd
res://scripts/runtime/replay_player.gd
```

The first slice should build deterministic initialized state and export a static tick-0 snapshot. It should not simulate vessel motion or decide outcomes.

## Initialization Order After Loader Success

The minimal runtime bootstrap should follow this order:

1. Call `ScenarioLoader.load_scenario("res://data/scenarios/safe-water-crossing-target.json")`.
2. Stop immediately if loader returns `{}` or `loader.last_error` is not empty.
3. Create a deterministic `run_id`.
4. Read `scenario_id`, `scenario_version`, `rule_review_status`, `training_claim_status`, `iala_region`, `replay.seed`, and `replay.fixed_tick_hz`.
5. Initialize event log and emit `scenario_loaded`.
6. Build immutable `scenario_static` export from validated scenario data.
7. Build tick-0 Engine-owned runtime state:
   - root runtime state;
   - ownship state from spawn config;
   - target state from spawn config;
   - geometry state from scenario polygons;
   - inactive VTS state;
   - baseline warning/result state.
8. Initialize fixed tick clock at tick `0`, without advancing simulation.
9. Export first `runtime_snapshot`.
10. Emit `runtime_initialized`.
11. Finalize bootstrap test without opening gameplay.

## Fixed-Tick Update Order

The planned future tick order is:

1. Apply queued input.
2. Update ownship movement.
3. Update target movement.
4. Evaluate safe corridor and shallow geometry.
5. Classify encounter.
6. Solve CPA/TCPA.
7. Update warning queue.
8. Update scenario result.
9. Export runtime snapshot.
10. Append deterministic events.

For the first implementation slice, only tick `0` initialization is allowed. Steps 1-8 must be represented as placeholders or explicit TODO boundaries, not implemented simulation.

## Runtime State Object Boundaries

### Root Runtime State

Owns run identity, tick identity, fixed tick settings, scenario state, result state, and draft-training flag.

```text
runtime_state.root
```

Allowed in first slice:

- `run_id`
- `engine_version`
- `tick: 0`
- `time_sec: 0.0`
- `fixed_tick_hz`
- `scenario_state: "ready"`
- `scenario_result: "ready"`
- `draft_training: true`

### Scenario Static State

Immutable scenario data exported to UI/HUD.

```text
runtime_state.scenario_static
```

Allowed in first slice:

- identity/review fields;
- `iala_region`;
- camera config;
- marks;
- safe corridor;
- shallow zones;
- empty danger polygons;
- caution buffers;
- finish gate;
- `vts.enabled: false`.

### Ownship State

Engine-owned runtime vessel state.

```text
runtime_state.ownship
```

Allowed in first slice:

- spawn position;
- spawn heading;
- initial speed level;
- initial speed in m/s;
- collision/grounding radius;
- empty or single-point recent track;
- projected vector may be zero/null until vector math is assigned.

Not allowed in first slice:

- turn input handling;
- acceleration/deceleration;
- movement integration.

### Target State

Engine-owned runtime target state.

```text
runtime_state.target
```

Allowed in first slice:

- spawn position;
- spawn heading;
- speed;
- collision radius;
- behaviour;
- AIS label;
- vector horizon.

Not allowed in first slice:

- target movement;
- CPA/TCPA calculation;
- autonomous behaviour.

### Geometry, Encounter, CPA/TCPA, Warnings, Result

First slice allowed defaults:

```text
safe_water.state: "in_corridor"
encounter.class: "crossing"
encounter.player_role: "give_way"
encounter.draft_training_logic: true
cpa_tcpa.state: "safe"
warnings.primary_warning: null
warnings.secondary_warnings: []
scenario_result: "ready"
vts.state: "inactive"
```

These defaults are bootstrap state only. They must be logged or labelled as initialized assumptions until corresponding runtime modules exist.

## Engine -> UI/HUD Snapshot Boundary

The first slice should export one read-only snapshot object matching the Engine runtime state contract shape.

```text
scenario_static
runtime_snapshot
```

UI/HUD boundary rules:

- UI receives static scenario data and tick-0 runtime snapshot only.
- UI must treat snapshot as read-only.
- UI must not compute encounter class, player role, CPA/TCPA state, warning severity, safe-water state, VTS state, or result.
- Player-facing mode may hide QA/debug fields.
- QA/debug mode may display seed, fixed tick, draft status, and validation fields.

First slice does not implement HUD rendering. A future `hud_snapshot_stub.gd` may print or assert snapshot shape in a headless test only.

## Replay/Event Log Foundation

First slice should create the event log foundation without replay playback.

Required bootstrap events:

| Event | Required payload |
| --- | --- |
| `scenario_load_started` | `scenario_path` |
| `scenario_loaded` | `scenario_id`, `scenario_version`, `iala_region`, `rule_review_status`, `training_claim_status`, `target_count`, `mark_count`, `vts_enabled` |
| `runtime_initialized` | `run_id`, `seed`, `fixed_tick_hz`, `ownship_spawn`, `ownship_heading_deg`, `target_spawn`, `target_heading_deg` |
| `snapshot_exported` | `tick`, `time_sec`, `scenario_state`, `scenario_result` |
| `event_log_finalized` | `event_count`, `final_result` |

If loader fails, allowed event:

| Event | Required payload |
| --- | --- |
| `scenario_load_failed` | loader error object with `code`, `message_key`, `json_path`, `expected`, `actual`, `blocking` |

Replay input log foundation:

- Store `seed`.
- Store `fixed_tick_hz`.
- Store empty input list for bootstrap.
- Store `event_timing_tolerance_ticks: 1`.
- Do not implement playback or fixture comparison in the first slice.

## First Implementation Slice After Godot Loader Test Passes

Name:

```text
Runtime Bootstrap Snapshot Slice
```

Goal:

Prove that validated scenario data can become a deterministic tick-0 Engine state and exported snapshot without creating gameplay.

Allowed work:

- Add future runtime bootstrap modules listed above.
- Add one headless runtime bootstrap test.
- Load canonical scenario through existing `ScenarioLoader`.
- Build immutable `scenario_static`.
- Build tick-0 `runtime_snapshot`.
- Emit deterministic bootstrap events.
- Verify VTS remains inactive.
- Verify draft/non-final status is present in static and snapshot data.
- Verify event log contains seed, fixed tick, and 1-tick tolerance metadata.

Required test assertions:

- Loader success is required before bootstrap starts.
- `scenario_static.iala_region == "A"`.
- `scenario_static.rule_review_status == "draft"`.
- `runtime_snapshot.tick == 0`.
- `runtime_snapshot.qa.seed == 1001`.
- `runtime_snapshot.qa.fixed_tick_hz == 20`.
- `runtime_snapshot.qa.event_timing_tolerance_ticks == 1`.
- `runtime_snapshot.vts.enabled == false`.
- `runtime_snapshot.vts.state == "inactive"`.
- `runtime_snapshot.encounter.class == "crossing"`.
- `runtime_snapshot.encounter.player_role == "give_way"`.
- `runtime_snapshot.cpa_tcpa.state == "safe"` as bootstrap default only.
- `runtime_snapshot.warnings.primary_warning == null`.
- Event log order is deterministic.

Explicitly not included:

- movement controls;
- vessel movement;
- geometry collision checks;
- CPA/TCPA calculation;
- warning escalation;
- result success/failure evaluation;
- UI rendering;
- playable scene.

## Stop Conditions

Stop immediately and do not open broader gameplay if any condition is true:

- Godot headless loader test has not passed.
- Loader returns `{}` or has `last_error`.
- Runtime bootstrap requires changing loader validation without a documented blocking contract issue.
- Scenario data changes are needed to make runtime pass.
- Any code path creates a playable scene.
- Any code path adds movement, controls, CPA solver, warning pipeline, or scenario result evaluation before bootstrap snapshot passes.
- UI begins computing Engine-owned fields.
- VTS becomes active in scenario 1.
- Draft maritime assumptions are described as final, official, certified, or legally authoritative.
- Implementation requires touching `public/`, Captain Ether, hub routing, Nav Desk, auth, or production config.
- Event order is nondeterministic between identical bootstrap runs.
- Snapshot shape diverges from `engine-runtime-state-contract.md` without a contract update and review.

## Out Of Scope

- Full runtime.
- Gameplay.
- Playable scenes.
- UI implementation.
- Movement model.
- Geometry monitor.
- CPA/TCPA solver.
- Encounter classifier beyond bootstrap defaults.
- Warning pipeline beyond empty initialized queue.
- Scenario result evaluation beyond `ready`.
- Replay playback.
- Public deployment or route work.
- Captain Ether.
- Nav Desk.
- Auth.
- Production config.
- Final maritime training approval.

## Report For Project Lead

TASK-0027 can move to For Review after this planning skeleton is accepted.

The first safe runtime slice after Godot headless loader verification is a headless Runtime Bootstrap Snapshot Slice: load the validated scenario, build immutable static state, build tick-0 Engine-owned runtime state, export one UI/HUD snapshot, and emit deterministic bootstrap events. It deliberately stops before movement, gameplay, CPA solving, warning escalation, result evaluation, playable scenes, or UI rendering.
