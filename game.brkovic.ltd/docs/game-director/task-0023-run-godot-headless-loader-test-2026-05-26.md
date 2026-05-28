# TASK-0023 - Run Godot Headless Scenario Loader Test

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Ready to run  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Task

Run the Watch Officer scenario loader test in an environment with Godot 4.2+ CLI.

## Command

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

If the executable name is `godot4`, run:

```bash
godot4 --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

## Required Output

Update:

```text
game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md
```

Record:

- command used;
- pass/fail result;
- exact failing error if any;
- whether TASK-0022 can move from `For Review` to `Approved`.

## Boundaries

- Do not implement gameplay.
- Do not create playable scenes.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
