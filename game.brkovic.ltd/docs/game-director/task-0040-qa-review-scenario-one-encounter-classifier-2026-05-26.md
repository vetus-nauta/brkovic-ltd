# TASK-0040 - QA Review Scenario 1 Encounter Classifier

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
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

- `game.brkovic.ltd/docs/watch-officer/scenario-one-encounter-classifier-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-range-bearing-relative-side-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0039 from QA side.

Confirm whether the scenario-1 draft encounter classifier is acceptable before CPA/TCPA solving, safe-water geometry checks, warning escalation, result evaluation, playable scenes, or UI implementation.

Check specifically:

- all prior headless tests pass;
- scenario 1 encounter classifier test passed with `16 passed, 0 failed`;
- classifier returns `crossing`;
- classifier returns `give_way`;
- `initial_match == true`;
- `draft_training_logic == true`;
- confidence is deterministic;
- output is limited to scenario 1 assumptions and not a general COLREGS classifier;
- CPA/TCPA remains unchanged;
- warnings remain unchanged;
- scenario result remains `ready`;
- safe-water geometry state remains unchanged;
- no final maritime training claim is made;
- no out-of-scope CPA solver, safe-water geometry checks, warning escalation, result evaluation, playable scene, UI, public route, Captain Ether, Nav Desk, auth, or production config work is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-one-encounter-classifier-review.md
```

The review must state one of:

- `approved-for-next-engine-slice`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Boundaries

- Do not implement runtime code.
- Do not implement gameplay.
- Do not create playable scenes.
- Do not implement UI.
- Do not change Engine code unless there is a blocking QA defect.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
