# TASK-0027 - Minimal Runtime Planning Skeleton

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

- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-engine-ui-contract-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Create a minimal runtime planning skeleton for scenario 1.

This is a planning artifact only. It must define the first safe runtime implementation slice after Godot headless loader verification becomes available.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/minimal-runtime-planning-skeleton.md
```

The document must cover:

- proposed future GDScript file/module names;
- initialization order after loader success;
- fixed-tick update order;
- runtime state object boundaries;
- Engine -> UI/HUD snapshot boundary;
- replay/event log foundation;
- first implementation slice after Godot loader test passes;
- explicit stop conditions that prevent opening full gameplay too early.

## Boundaries

- Do not implement runtime code.
- Do not implement gameplay.
- Do not create playable scenes.
- Do not change loader implementation.
- Do not implement UI.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
