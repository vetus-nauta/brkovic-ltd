# TASK-0024 - Engine Runtime State Contract

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

- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-test-plan.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Create the Engine Runtime State Contract for scenario 1.

Define what the loader gives to runtime, what Engine owns during simulation, what state Engine exports to UI/HUD, and what events must go into replay/event logs.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md
```

The document must cover:

- loaded scenario data fields consumed by runtime;
- Engine-owned runtime state fields;
- UI/HUD exported state fields;
- warning state model;
- scenario result state model;
- replay/event log event names and required payload;
- deterministic fixed-tick assumptions;
- what is explicitly out of scope before Godot headless loader test passes.

## Boundaries

- Do not implement gameplay.
- Do not create playable scenes.
- Do not change loader implementation unless a blocking contract issue is found.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
