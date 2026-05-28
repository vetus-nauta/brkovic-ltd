# TASK-0029 - Runtime Bootstrap Snapshot Slice

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/watch-officer/minimal-runtime-planning-skeleton.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-engine-ui-contract-review.md`

## Task

Implement the first runtime slice only: a headless Runtime Bootstrap Snapshot Slice.

The slice must load the validated scenario, build immutable static state, build tick-0 Engine-owned runtime state, export one UI/HUD snapshot, and emit deterministic bootstrap events.

## Allowed Work

- Add minimal GDScript modules under `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/`.
- Add one headless runtime bootstrap test under `game.brkovic.ltd/prototypes/watch-officer-godot/tests/`.
- Use the existing `ScenarioLoader`.
- Run Godot headless tests.
- Update a concise implementation report.

## Required Test Assertions

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

## Required Output

Create or update:

```text
game.brkovic.ltd/docs/watch-officer/runtime-bootstrap-snapshot-report.md
```

Record:

- files created;
- exact Godot command used;
- pass/fail output;
- confirmation that gameplay was not opened.

## Boundaries

- Do not implement movement controls.
- Do not implement vessel movement.
- Do not implement geometry collision checks.
- Do not implement CPA/TCPA solver.
- Do not implement warning escalation.
- Do not implement result success/failure evaluation.
- Do not create playable scenes.
- Do not implement UI rendering.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
