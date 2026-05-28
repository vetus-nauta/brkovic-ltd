# TASK-0036 - QA Review Target Kinematic Integrator

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

- `game.brkovic.ltd/docs/watch-officer/target-kinematic-integrator-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-ownship-kinematic-integrator-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## Task

Review TASK-0035 from QA side.

Confirm whether the target-only constant-course kinematic integrator is acceptable before geometry checks, CPA/TCPA solving, warning escalation, result evaluation, playable scenes, or UI implementation.

Check specifically:

- loader test passed with `82 passed, 0 failed`;
- runtime bootstrap test passed with `27 passed, 0 failed`;
- fixed tick/input log test passed with `24 passed, 0 failed`;
- ownship kinematic integrator test passed with `19 passed, 0 failed`;
- target kinematic integrator test passed with `18 passed, 0 failed`;
- target starts at scenario spawn position `[150, 260]`;
- target heading remains `270`;
- target speed remains `4.2`;
- target position advances deterministically on heading `270`;
- AIS vector endpoint is deterministic;
- ownship position remains unchanged;
- scenario result remains `ready`;
- warnings remain unchanged;
- CPA/TCPA state remains bootstrap-only and unchanged;
- range/bearing remain bootstrap defaults;
- no out-of-scope geometry checks, CPA solver, warning escalation, result evaluation, playable scene, UI, public route, Captain Ether, Nav Desk, auth, or production config work is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-target-kinematic-integrator-review.md
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
