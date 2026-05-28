# TASK-0041 - CPA/TCPA Numeric Debug Solver

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

- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-encounter-classifier-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-encounter-classifier-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a CPA/TCPA numeric debug solver for deterministic headless tests.

This slice may compute numeric CPA/TCPA debug values from current ownship and target kinematic state and map them to the existing qualitative state thresholds. It must not raise warnings, evaluate safe-water geometry, change scenario result, create playable scenes, render UI, or present final maritime training claims.

## Allowed Work

- Add a small CPA/TCPA solver module under `scripts/sim/`.
- Use existing ownship state, target state, scenario `cpa_tcpa` thresholds, and fixed-tick conventions.
- Add one headless test under `tests/runtime/`.
- Run all existing headless tests plus the new CPA/TCPA test.
- Create a concise implementation report.

## Required Behaviour

- Compute numeric `cpa_m_debug`.
- Compute numeric `tcpa_sec_debug`.
- Compute closest point positions for ownship and target.
- Use scenario `cpa_tcpa.horizon_sec` and `active_tcpa_max_sec`.
- Map CPA/TCPA to one of existing qualitative states:
  - `safe`;
  - `caution`;
  - `danger`;
  - `immediate`.
- Mark `active` only when TCPA is within active window and not in the past.
- Preserve previous state in output if provided.
- Do not raise warnings.
- Do not change scenario result.
- Do not evaluate safe/shallow geometry.
- Do not implement UI.

## Required Assertions

- solver returns numeric `cpa_m_debug`;
- solver returns numeric `tcpa_sec_debug`;
- solver returns deterministic closest point positions;
- solver output state is one of scenario qualitative states;
- repeated calls with same inputs return same output;
- warnings remain unchanged;
- scenario result remains `ready`;
- safe-water geometry state remains unchanged;
- encounter class remains existing scenario-1 draft output;
- no warning or result event is emitted by this slice.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that warnings, result evaluation, safe-water geometry checks, scenes, and UI remain unopened.

## Boundaries

- Do not implement warning escalation.
- Do not implement result success/failure evaluation.
- Do not implement safe-water geometry checks.
- Do not create playable scenes.
- Do not implement UI rendering.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
