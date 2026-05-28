# TASK-0033 - Ownship Kinematic Integrator

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

- `game.brkovic.ltd/docs/watch-officer/qa-fixed-tick-input-log-review.md`
- `game.brkovic.ltd/docs/watch-officer/fixed-tick-input-log-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/runtime-bootstrap-snapshot-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## Task

Implement only an ownship kinematic integrator for deterministic headless tests.

This slice may apply tick-indexed input records to ownship heading, speed level, and position over fixed ticks. It must not implement target movement, geometry checks, CPA/TCPA solving, encounter classification beyond existing bootstrap assumptions, warning escalation, result evaluation, playable scenes, or UI rendering.

## Allowed Work

- Add a small ownship kinematic integrator module under `scripts/sim/`.
- Use existing `FixedTickClock` and `ReplayInputLog`.
- Add one headless test under `tests/runtime/`.
- Run loader, bootstrap, fixed tick/input log, and new ownship integrator tests.
- Create a concise implementation report.

## Required Behaviour

- Start from bootstrap ownship state.
- Support deterministic turn input records:
  - `turn_port_pressed`;
  - `turn_starboard_pressed`;
  - `turn_released`.
- Support deterministic speed input records:
  - `speed_set` with one of `stop`, `slow`, `cruise`, `fast`.
- Advance ownship position using heading and speed over fixed ticks.
- Keep heading normalized to `0..360`.
- Append positions to `recent_track_m`.
- Do not move target vessel.
- Do not evaluate safe/shallow geometry.
- Do not compute CPA/TCPA.
- Do not raise warnings.
- Do not change scenario result.

## Required Assertions

- ownship starts at scenario spawn position;
- after fixed ticks with no turn input, ownship moves straight on heading `0`;
- `turn_port_pressed` changes heading deterministically according to configured turn rate;
- `turn_released` stops heading change;
- `speed_set` changes ownship speed level deterministically;
- ownship recent track grows with movement samples;
- target position remains unchanged;
- `scenario_result` remains `ready`;
- `warnings.primary_warning` remains `null`;
- no CPA/TCPA state change is produced by this slice.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/ownship-kinematic-integrator-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that target movement, geometry checks, CPA/TCPA, warnings, result evaluation, scenes, and UI remain unopened.

## Boundaries

- Do not implement target movement.
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
