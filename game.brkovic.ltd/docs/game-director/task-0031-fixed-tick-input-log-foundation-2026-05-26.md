# TASK-0031 - Fixed Tick And Input Log Foundation

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

- `game.brkovic.ltd/docs/watch-officer/qa-runtime-bootstrap-snapshot-review.md`
- `game.brkovic.ltd/docs/watch-officer/runtime-bootstrap-snapshot-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/minimal-runtime-planning-skeleton.md`

## Task

Implement only the deterministic fixed-tick and replay input-log foundation.

This slice must prove that Engine can advance ticks deterministically and record input events by tick without moving vessels, solving CPA/TCPA, evaluating geometry, raising warnings, changing result states, creating playable scenes, or rendering UI.

## Allowed Work

- Extend `fixed_tick_clock.gd` with deterministic tick advance.
- Extend `replay_input_log.gd` with append/read behaviour for tick-indexed input records.
- Add one headless test for fixed tick and input log behaviour.
- Run the existing loader test, runtime bootstrap test, and new foundation test.
- Create a concise report.

## Required Assertions

- fixed tick starts at `0`;
- `fixed_tick_hz == 20`;
- advancing one tick sets `tick == 1`;
- `time_sec == 0.05` after one tick at 20 Hz;
- multiple advances are deterministic;
- input records include `tick`, `time_sec`, `input_type`, `input_value`, `input_source`;
- input records preserve insertion order for the same tick;
- replay input log keeps `seed == 1001`;
- replay input log keeps `event_timing_tolerance_ticks == 1`;
- no vessel position changes are performed in this slice.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/fixed-tick-input-log-foundation-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that movement, gameplay, CPA/TCPA, warnings, result evaluation, scenes, and UI remain unopened.

## Boundaries

- Do not implement movement controls.
- Do not implement vessel movement.
- Do not implement geometry collision checks.
- Do not implement CPA/TCPA solver.
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
