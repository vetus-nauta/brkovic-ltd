# TASK-0039 - Scenario 1 Encounter Classifier

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

- `game.brkovic.ltd/docs/watch-officer/qa-range-bearing-relative-side-review.md`
- `game.brkovic.ltd/docs/watch-officer/range-bearing-relative-side-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a scenario-1 draft encounter classifier for deterministic headless tests.

The classifier may confirm `crossing` and `give_way` for the current scenario using validated scenario expectations and the existing neutral range/bearing/relative-side state. It must not make final COLREGS claims, solve CPA/TCPA, evaluate safe-water geometry, raise warnings, change scenario result, create playable scenes, or render UI.

## Allowed Work

- Add a small encounter classifier module under `scripts/sim/`.
- Use existing scenario `encounter.expected_initial_class`, `encounter.expected_player_role`, and target relative fields.
- Add one headless test under `tests/runtime/`.
- Run loader, bootstrap, fixed tick/input log, ownship integrator, target integrator, range/bearing, and new encounter classifier tests.
- Create a concise implementation report.

## Required Behaviour

- Return `class: "crossing"` for scenario 1 when target relative side is `starboard` and scenario expected class is `crossing`.
- Return `player_role: "give_way"` when scenario expected role is `give_way`.
- Set `draft_training_logic: true`.
- Set `initial_match: true` when classifier output matches scenario expectations.
- Preserve confidence as a deterministic numeric value.
- Do not compute CPA/TCPA.
- Do not evaluate safe/shallow geometry.
- Do not raise warnings.
- Do not change scenario result.
- Do not present the classifier output as final maritime training content.

## Required Assertions

- classifier returns `crossing`;
- classifier returns `give_way`;
- `initial_match == true`;
- `draft_training_logic == true`;
- confidence is deterministic;
- CPA/TCPA state remains unchanged;
- warnings remain unchanged;
- scenario result remains `ready`;
- no safe-water geometry state change is produced;
- no final maritime training claim is made in report wording.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-one-encounter-classifier-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that CPA/TCPA, safe-water geometry checks, warnings, result evaluation, scenes, and UI remain unopened.

## Boundaries

- Do not implement a general COLREGS classifier.
- Do not implement CPA/TCPA solver.
- Do not implement safe-water geometry checks.
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
