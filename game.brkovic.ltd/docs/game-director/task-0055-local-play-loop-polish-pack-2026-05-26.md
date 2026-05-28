# TASK-0055 - Local Play Loop Polish Pack

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
- `game.brkovic.ltd/docs/watch-officer/qa-hud-binding-readability-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/hud-binding-readability-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-playable-greybox-scene-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement a local play loop polish pack for the Watch Officer greybox prototype.

The goal is to make the local Godot prototype feel like a complete short attempt: start state, live control, finish/result state, concise captain-style feedback, and restart/reset. This remains local-only. It is not public web integration, not export, not production deployment, not final art, and not final maritime training content.

## Allowed Work

- Refine the existing playable greybox scene and controller.
- Add a lightweight local attempt state:
  - pre-start or ready;
  - running;
  - completed/result;
  - reset/restart.
- Add start/restart input handling if needed.
- Make finish/result state readable in HUD.
- Add a concise local captain report panel for result summary.
- Keep report copy non-final and scenario-local:
  - allowed wording: `scenario result`, `captain note`, `training draft`, `needs review`;
  - forbidden wording: `official`, `certified`, `COLREGS compliant`, `correct rule`.
- Keep VTS disabled/inactive.
- Add or extend tests for local play loop state, result visibility, reset/restart, and non-final wording.
- Run all existing headless tests plus the new play loop polish test.
- Create a concise implementation report.

## Required Behaviour

- Local scene starts in a deterministic ready state.
- Player can start or immediately control the attempt; document whichever behaviour is implemented.
- Simulation advances through the existing orchestrator only.
- Result state is shown from Engine snapshot/result data, not computed in UI.
- Finish/result panel can display:
  - result state;
  - active warning ids or `none`;
  - safe-water state;
  - CPA/TCPA qualitative state;
  - draft/non-final training label.
- Reset/restart returns to deterministic initial state.
- No final training claim is displayed.
- No web export, public route, production deployment, game hub routing, Captain Ether, Nav Desk, auth, or production config is touched.

## Required Assertions

- existing playable greybox test still passes;
- existing HUD readability test still passes;
- new local play loop polish test passes;
- local attempt starts deterministic;
- start/running state is represented and visible;
- orchestrator remains the only simulation step source;
- result/captain report panel reads Engine snapshot/result state;
- result/captain report panel includes draft/non-final wording;
- forbidden final-training words are absent from local result copy;
- reset/restart returns tick/time/result/input queue to deterministic initial state;
- VTS remains disabled/inactive;
- public routes, Captain Ether, Nav Desk, auth, production config, web embedding/export remain untouched.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md
```

Record:

- files changed or added;
- how to launch locally;
- exact Godot commands used;
- pass/fail output;
- known remaining local prototype limitations;
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
- Do not introduce VTS in scenario 1.
- Do not add final art requirements.
- Do not add final maritime training claims.
- Do not add new scenario rules unless required for blocking integration and explicitly reported.
