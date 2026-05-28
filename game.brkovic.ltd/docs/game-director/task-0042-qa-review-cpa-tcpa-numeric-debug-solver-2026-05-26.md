# TASK-0042 - QA Review CPA/TCPA Numeric Debug Solver

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

- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-encounter-classifier-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0041 from QA side.

Confirm whether the CPA/TCPA numeric debug solver is acceptable before warning escalation, result evaluation, safe-water geometry checks, playable scenes, or UI implementation.

Check specifically:

- all prior headless tests pass;
- CPA/TCPA numeric debug solver test passed with `21 passed, 0 failed`;
- solver returns numeric `cpa_m_debug`;
- solver returns numeric `tcpa_sec_debug`;
- closest point positions are deterministic;
- qualitative state is one of scenario states;
- `active` respects TCPA active window;
- repeated calls with same inputs return same output;
- previous state and changed tick are preserved when provided;
- warnings remain unchanged;
- scenario result remains `ready`;
- safe-water geometry state remains unchanged;
- encounter class remains existing scenario-1 draft output;
- no warning or result event is emitted;
- no out-of-scope warning escalation, result evaluation, safe-water geometry checks, playable scene, UI, public route, Captain Ether, Nav Desk, auth, or production config work is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-cpa-tcpa-numeric-debug-solver-review.md
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
