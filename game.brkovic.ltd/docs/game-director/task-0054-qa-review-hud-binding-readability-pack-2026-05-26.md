# TASK-0054 - QA Review HUD Binding And Readability Pack

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
- `game.brkovic.ltd/docs/watch-officer/hud-binding-readability-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-playable-greybox-scene-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0053 from QA side.

Confirm whether the local HUD binding and readability pack is acceptable before local play loop polish, web export, public integration, or production deployment.

Check specifically:

- all prior headless tests pass;
- HUD binding readability test passed with `43 passed, 0 failed`;
- scene still loads as project main scene;
- HUD exposes instrument strip, warning stack, result status, debug/non-final section, cue legend, and controls section;
- HUD binds tick/time from `runtime_snapshot`;
- HUD binds heading and speed from `runtime_snapshot.ownship`;
- HUD binds safe-water state from `runtime_snapshot.safe_water`;
- HUD binds qualitative CPA/TCPA state from `runtime_snapshot.cpa_tcpa`;
- HUD binds primary/secondary warnings from `runtime_snapshot.warnings`;
- HUD binds result from `runtime_snapshot.scenario_result`;
- HUD binds VTS disabled/inactive state and no VTS popup exists for scenario 1;
- HUD exposes draft/non-final status, `rule_review_status`, and `training_claim_status`;
- QA/debug fields are visibly separated from player-facing state;
- cue legend includes Region A lateral pair and target AIS vector cue;
- controls legend includes port/starboard, speed up/down, and reset;
- HUD updates after orchestrator step;
- HUD binder does not import simulation modules;
- HUD binder does not compute CPA/TCPA, result state, warnings, safe-water state, or encounter class;
- known HUD/greybox limitations are documented;
- no public routes, Captain Ether, Nav Desk, auth, production config, web embedding/export, final art requirement, or final maritime training claim is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-hud-binding-readability-pack-review.md
```

The review must state one of:

- `approved-for-next-pack`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not implement runtime code.
- Do not implement gameplay changes.
- Do not implement public web embedding or export.
- Do not deploy to production.
- Do not change Engine code unless there is a blocking QA defect.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
