# TASK-0043 - Safe Water Geometry Monitor

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

- `game.brkovic.ltd/docs/watch-officer/qa-cpa-tcpa-numeric-debug-solver-review.md`
- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a safe-water geometry monitor for deterministic headless tests.

This slice may evaluate ownship position against the scenario safe corridor, shallow zones, caution buffers, and finish gate. It must not raise warnings, change scenario result, evaluate CPA/TCPA, create playable scenes, render UI, or present final maritime training claims.

## Allowed Work

- Add a small safe-water geometry monitor module under `scripts/sim/`.
- Use scenario `geometry.safe_corridor_polygon`, `shallow_zone_polygons`, `caution_buffers`, and `finish_gate`.
- Add one headless test under `tests/runtime/`.
- Run all existing headless tests plus the new safe-water geometry monitor test.
- Create a concise implementation report.

## Required Behaviour

- Determine whether ownship is inside `safe_corridor_polygon`.
- Determine whether ownship is inside any `shallow_zone_polygons`.
- Compute a deterministic `nearest_boundary_m_debug` value for corridor/shallow checks.
- Set safe-water state to one of:
  - `in_corridor`;
  - `corridor_buffer`;
  - `shallow_buffer`;
  - `shallow`;
  - `grounded`.
- Detect `finish_gate_crossed` as a geometry flag only.
- Preserve previous safe-water state in output if provided.
- Do not raise warnings.
- Do not change scenario result.
- Do not evaluate CPA/TCPA.
- Do not implement UI.

## Required Assertions

- spawn position starts in corridor;
- point near corridor edge maps deterministically to `corridor_buffer`;
- point inside shallow zone maps deterministically to `shallow`;
- shallow approach buffer maps deterministically to `shallow_buffer`;
- finish gate crossing flag can become true for a crossing sample;
- warnings remain unchanged;
- scenario result remains `ready`;
- CPA/TCPA state remains unchanged;
- no warning or result event is emitted by this slice.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/safe-water-geometry-monitor-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that warnings, result evaluation, CPA/TCPA changes, scenes, and UI remain unopened.

## Boundaries

- Do not implement warning escalation.
- Do not implement result success/failure evaluation.
- Do not change CPA/TCPA state.
- Do not create playable scenes.
- Do not implement UI rendering.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
