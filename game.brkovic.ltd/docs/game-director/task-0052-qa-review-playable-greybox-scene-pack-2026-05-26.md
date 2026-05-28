# TASK-0052 - QA Review Playable Greybox Scene Pack

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
- `game.brkovic.ltd/docs/watch-officer/playable-greybox-scene-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-runtime-step-orchestrator-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0051 from QA side.

Confirm whether the local playable greybox scene pack is acceptable as the first visible Watch Officer prototype before HUD polish, public web integration, export, or production deployment.

Check specifically:

- all prior headless tests pass;
- playable greybox scene pack test passed with `31 passed, 0 failed`;
- Godot project main scene points to `res://scenes/playable_greybox_scene.tscn`;
- playable scene file exists and loads;
- scene/controller can advance at least one fixed tick through the existing orchestrator;
- keyboard input mapping produces orchestrator-compatible input records;
- reset returns tick/time/result to deterministic initial state;
- scenario data loads from `safe-water-crossing-target.json`;
- visible greybox includes ownship, target, safe corridor, shallow zones, finish gate, Region A lateral pair, ownship heading/vector cue, and target vector cue;
- debug HUD uses Engine snapshot fields for tick/time, heading, speed, CPA/TCPA state, warning, result, VTS inactive, and draft/non-final status;
- scene/display code does not compute maritime logic that belongs to Engine;
- VTS remains disabled/inactive;
- known greybox limitations are documented;
- no public routes, Captain Ether, Nav Desk, auth, production config, web embedding/export, final art requirement, or final maritime training claim is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-playable-greybox-scene-pack-review.md
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
- Do not implement HUD polish.
- Do not implement public web embedding or export.
- Do not deploy to production.
- Do not change Engine code unless there is a blocking QA defect.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
