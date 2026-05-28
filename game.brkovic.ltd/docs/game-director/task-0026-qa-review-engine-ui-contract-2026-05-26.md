# TASK-0026 - QA Review Engine/UI Runtime Contract

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

- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review the Engine Runtime State Contract and UI/HUD Runtime State Review from QA side.

Confirm whether the contract is testable and whether QA can validate the MVP without UI computing maritime logic.

Check specifically:

- Engine owns encounter, role, CPA/TCPA, warnings, safe-water state, result, replay/event log;
- UI/HUD consumes exported state as display-only;
- QA can inspect player-mode fields and QA/debug fields separately;
- draft/non-final training status is testable;
- VTS inactive state for scenario 1 is testable;
- replay/event log event names and payload are sufficient for future deterministic QA;
- no gameplay, playable scene, public route, Captain Ether, Nav Desk, auth, or production config work is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-engine-ui-contract-review.md
```

The review must state one of:

- `approved-for-runtime-planning`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Boundaries

- Do not implement gameplay.
- Do not create playable scenes.
- Do not change Engine loader or runtime code.
- Do not implement UI.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
