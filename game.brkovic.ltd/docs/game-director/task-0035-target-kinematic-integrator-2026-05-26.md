# TASK-0035 - Target Kinematic Integrator

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

- `game.brkovic.ltd/docs/watch-officer/qa-ownship-kinematic-integrator-review.md`
- `game.brkovic.ltd/docs/watch-officer/ownship-kinematic-integrator-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a target kinematic integrator for deterministic headless tests.

This slice may move the scenario 1 target vessel on constant course/speed over fixed ticks and calculate its AIS vector endpoint. It must not implement CPA/TCPA solving, geometry checks, encounter reclassification, warning escalation, result evaluation, playable scenes, or UI rendering.

## Allowed Work

- Add a small target kinematic integrator module under `scripts/sim/`.
- Use existing `FixedTickClock`.
- Add one headless test under `tests/runtime/`.
- Run loader, bootstrap, fixed tick/input log, ownship integrator, and new target integrator tests.
- Create a concise implementation report.

## Required Behaviour

- Start from bootstrap target state.
- Use target `heading_deg`, `speed_mps`, and `behaviour == "constant_course_speed"`.
- Advance target position deterministically over fixed ticks.
- Keep heading unchanged for scenario 1.
- Compute `vector_end_position_m` from heading, speed, and `vector_horizon_sec`.
- Do not apply input records to target.
- Do not move ownship in this slice.
- Do not compute range/bearing to ownship beyond existing bootstrap defaults.
- Do not compute CPA/TCPA.
- Do not evaluate safe/shallow geometry.
- Do not raise warnings.
- Do not change scenario result.

## Required Assertions

- target starts at scenario spawn position `[150, 260]`;
- target heading remains `270`;
- target speed remains `4.2`;
- after fixed ticks, target position advances deterministically on heading `270`;
- target AIS vector endpoint is deterministic;
- ownship position remains unchanged;
- `scenario_result` remains `ready`;
- `warnings.primary_warning` remains `null`;
- no CPA/TCPA state change is produced by this slice.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/target-kinematic-integrator-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that CPA/TCPA, geometry checks, warnings, result evaluation, scenes, and UI remain unopened.

## Boundaries

- Do not implement CPA/TCPA solver.
- Do not implement geometry collision checks.
- Do not implement encounter classifier beyond existing bootstrap assumptions.
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
