# TASK-0037 - Range Bearing Relative Side Updater

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

- `game.brkovic.ltd/docs/watch-officer/qa-target-kinematic-integrator-review.md`
- `game.brkovic.ltd/docs/watch-officer/target-kinematic-integrator-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## Task

Implement only range, bearing, relative bearing, and relative side update between ownship and target for deterministic headless tests.

This slice may compute neutral geometry values needed by runtime state. It must not classify encounters, solve CPA/TCPA, evaluate safe/shallow geometry, raise warnings, change scenario result, create playable scenes, or render UI.

## Allowed Work

- Add a small range/bearing updater module under `scripts/sim/`.
- Use existing ownship and target runtime states.
- Add one headless test under `tests/runtime/`.
- Run loader, bootstrap, fixed tick/input log, ownship integrator, target integrator, and new range/bearing tests.
- Create a concise implementation report.

## Required Behaviour

- Compute `range_m` between ownship and target.
- Compute `bearing_true_deg` from ownship to target in scenario heading convention.
- Compute `relative_bearing_deg` against ownship heading.
- Compute `relative_side` as one of:
  - `port`;
  - `starboard`;
  - `ahead`;
  - `astern`;
  - `ambiguous`.
- Preserve target position, heading, speed, and AIS vector.
- Preserve ownship position and heading.
- Do not compute encounter class.
- Do not compute CPA/TCPA.
- Do not evaluate safe/shallow geometry.
- Do not raise warnings.
- Do not change scenario result.

## Required Assertions

- initial target range from ownship spawn is deterministic;
- initial true bearing from ownship to target is deterministic;
- initial relative side remains compatible with scenario `crossing_from: "starboard"`;
- after ownship/target movement samples, range and bearing update deterministically;
- ownship position is not changed by the updater;
- target position is not changed by the updater;
- `encounter.class` remains bootstrap assumption;
- `cpa_tcpa.state` remains bootstrap-only and unchanged;
- `warnings.primary_warning` remains `null`;
- `scenario_result` remains `ready`.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/range-bearing-relative-side-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that encounter classification, CPA/TCPA, geometry checks, warnings, result evaluation, scenes, and UI remain unopened.

## Boundaries

- Do not implement encounter classifier.
- Do not implement CPA/TCPA solver.
- Do not implement geometry collision checks.
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
