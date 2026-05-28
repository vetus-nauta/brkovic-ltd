# TASK-0025 - UI/HUD Review Engine Runtime State Contract

**Chat ID:** CHAT-UX-001  
**Department:** UI/HUD  
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

- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review the Engine Runtime State Contract from the UI/HUD side.

Confirm whether the exported Engine state is sufficient for the MVP HUD without UI computing maritime logic.

Check specifically:

- heading-up camera export fields;
- ownship lower-third state;
- target AIS/vector fields;
- safe/shallow/corridor state fields;
- CPA/TCPA qualitative state and debug fields;
- warning queue fields and priority model;
- VTS inactive state for scenario 1;
- draft/non-final training status visibility;
- QA/debug fields that UI may hide in player mode but must expose in QA mode.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md
```

The review must state one of:

- `approved-for-hud-binding-plan`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Boundaries

- Do not implement UI.
- Do not create screens or playable scenes.
- Do not change Engine loader or runtime code.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
