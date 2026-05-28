# TASK-0053 - HUD Binding And Readability Pack

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

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/qa-playable-greybox-scene-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/playable-greybox-scene-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement a HUD binding and readability pack for the local Watch Officer greybox scene.

The goal is to make the existing local Godot prototype readable as a training screen: instrument strip, warning stack, result state, draft/non-final status, clear safe-water/target cues, and controls help. This is still a local prototype pack, not public web integration, not final art, and not final maritime training content.

## Allowed Work

- Refine `playable_greybox_scene.tscn` and scene/controller scripts.
- Add UI/HUD helper scripts if needed.
- Bind HUD fields directly to Engine `runtime_snapshot`.
- Improve visual readability of:
  - ownship lower-third placement;
  - heading/vector cue;
  - target AIS/vector cue;
  - safe corridor;
  - shallow zone;
  - finish gate;
  - Region A lateral pair;
  - warning stack;
  - result status;
  - draft/non-final training status.
- Add compact keyboard/control legend in the local prototype.
- Add QA/debug toggle or keep QA/debug fields visibly separated from player-facing state.
- Add/extend smoke tests to verify HUD binding keys and non-final status are present.
- Run all existing headless tests plus the HUD/readability test.
- Create a concise implementation report.

## Required Behaviour

- UI/HUD must consume Engine snapshot fields as read-only display data.
- UI/HUD must not compute encounter class, player role, CPA/TCPA, safe-water state, warnings, VTS, or result.
- CPA/TCPA player display remains qualitative.
- VTS remains disabled/inactive and no VTS popup is introduced.
- Draft/non-final status must be explicit in the scene or debug HUD.
- Warning stack shows primary warning and may show secondary warnings.
- Result state remains visible and clearly separate from warning state.
- Text labels must remain screen-readable and should not rotate with the world.
- Ownship should remain in the lower third or the report must document any remaining greybox limitation.
- Controls must not hide ownship, target vector, warning stack, or key geometry.

## Required Assertions

- scene still loads as project main scene;
- playable greybox test still passes;
- new HUD/readability smoke test passes;
- HUD binds tick/time from `runtime_snapshot`;
- HUD binds heading and speed from `runtime_snapshot.ownship`;
- HUD binds CPA/TCPA qualitative state from `runtime_snapshot.cpa_tcpa`;
- HUD binds primary warning from `runtime_snapshot.warnings`;
- HUD binds result from `runtime_snapshot.scenario_result`;
- HUD binds VTS disabled/inactive state;
- HUD exposes draft/non-final training status;
- UI/HUD code does not compute maritime/risk/result state;
- public routes, Captain Ether, Nav Desk, auth, production config, web embedding/export remain untouched.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/hud-binding-readability-pack-report.md
```

Record:

- files changed or added;
- how to launch locally;
- exact Godot commands used;
- pass/fail output;
- known remaining greybox/HUD limitations;
- confirmation that public routes, Captain Ether, Nav Desk, auth, production config, web embedding/export remain unopened.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not implement public web embedding or export.
- Do not modify `public/`.
- Do not modify game hub routing.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not add final art requirements.
- Do not add final maritime training claims.
- Do not introduce VTS in scenario 1.
- Do not change Engine-owned maritime/risk/result logic unless there is a blocking integration defect and it is reported.
