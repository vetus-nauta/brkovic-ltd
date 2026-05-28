# TASK-0051 - Playable Greybox Scene Pack

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
- `game.brkovic.ltd/docs/watch-officer/qa-runtime-step-orchestrator-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/runtime-step-orchestrator-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement the first playable greybox Godot scene pack for Watch Officer scenario 1.

This is a larger integration task. The goal is a local Godot prototype that a developer can launch, see the scenario, steer the ownship, and watch the existing runtime snapshot update. It must remain a greybox prototype, not final art, not production, not public web deployment, and not final maritime training content.

## Allowed Work

- Add one main playable scene under `prototypes/watch-officer-godot/scenes/`.
- Add scene scripts under `prototypes/watch-officer-godot/scripts/` as needed.
- Set the Godot project main scene if required for local launch.
- Bind the scene to the existing runtime bootstrap and `runtime_step_orchestrator`.
- Add basic keyboard controls:
  - port turn;
  - starboard turn;
  - speed down;
  - speed up;
  - reset scenario.
- Render a simple top-down heading-up greybox:
  - ownship marker;
  - target marker;
  - safe corridor polygon;
  - shallow zone polygon;
  - finish gate;
  - one Region A lateral pair;
  - ownship heading/vector cue;
  - target vector cue.
- Add a minimal debug HUD overlay from Engine snapshot:
  - tick/time;
  - heading;
  - speed level;
  - CPA/TCPA qualitative state;
  - primary warning text key/severity;
  - scenario result state;
  - `draft` / non-final status.
- Add one smoke/headless or script-level test that verifies the scene pack can instantiate or that the playable controller can run at least one orchestrated tick without UI rendering failure.
- Run all existing headless tests plus the new scene-pack smoke test.
- Create a concise implementation report.

## Required Behaviour

- Scene launches locally in Godot 4.2+ from the prototype project.
- Scenario data is loaded from `safe-water-crossing-target.json`.
- The scene uses the existing orchestrator for simulation truth.
- The scene does not compute maritime logic in UI/scene nodes.
- Keyboard input is converted into tick-indexed input records for the orchestrator.
- Camera keeps ownship in the lower third or close greybox equivalent.
- World view is heading-up or visibly prepared for heading-up; if full heading-up rotation is too risky in this pack, document the limitation and keep the camera deterministic.
- VTS remains disabled/inactive.
- Draft/non-final training status is visible in debug HUD or report.
- Reset returns to deterministic initial state.

## Required Assertions

- playable scene file exists;
- project can load the playable scene;
- scenario loader still passes;
- runtime orchestrator still passes;
- scene/controller can advance at least one fixed tick through the orchestrator;
- keyboard input mapping produces orchestrator-compatible input records;
- reset returns tick/time/result to initial deterministic state;
- no maritime logic is computed in HUD-only display code;
- public routes, Captain Ether, Nav Desk, auth, and production config remain untouched.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/playable-greybox-scene-pack-report.md
```

Record:

- files changed or added;
- how to launch locally;
- exact Godot commands used;
- pass/fail output;
- known greybox limitations;
- confirmation that public routes, Captain Ether, Nav Desk, auth, and production config remain unopened.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not modify `public/`.
- Do not modify game hub routing.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not add final art requirements.
- Do not add final maritime training claims.
- Do not introduce VTS in scenario 1.
- Do not add new scenario data unless required for scene loading and explicitly reported.
- Do not implement web embedding or export in this task.
