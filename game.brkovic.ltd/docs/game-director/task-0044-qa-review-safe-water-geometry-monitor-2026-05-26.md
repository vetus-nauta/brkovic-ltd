# TASK-0044 - QA Review Safe Water Geometry Monitor

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

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/safe-water-geometry-monitor-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-cpa-tcpa-numeric-debug-solver-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0043 from QA side.

Confirm whether the safe-water geometry monitor is acceptable before warning escalation, result evaluation, playable scenes, or UI implementation.

Check specifically:

- all prior headless tests pass;
- safe-water geometry monitor test passed with `24 passed, 0 failed`;
- monitor evaluates ownship against safe corridor, shallow zones, caution buffers, and finish gate;
- `nearest_boundary_m_debug` is deterministic;
- safe-water state is limited to scenario-local geometry states;
- `finish_gate_crossed` is only a geometry flag and does not complete the scenario;
- warnings remain unchanged;
- scenario result remains `ready`;
- CPA/TCPA state remains unchanged;
- monitor does not mutate ownship, target, warnings, result, or CPA/TCPA state;
- no warning or result event is emitted;
- no playable scene, UI, public route, Captain Ether, Nav Desk, auth, production config, or final maritime training claim is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-safe-water-geometry-monitor-review.md
```

The review must state one of:

- `approved-for-next-engine-slice`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

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
