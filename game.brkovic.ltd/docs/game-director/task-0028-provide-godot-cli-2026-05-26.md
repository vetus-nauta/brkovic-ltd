# TASK-0028 - Provide Godot CLI For Prototype Verification

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Local Tooling  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Task

Make Godot 4.2+ CLI available in the local shell as either `godot` or `godot4`, then run the existing headless loader verification.

## Required Checks

First check:

```bash
command -v godot || command -v godot4 || command -v godot4.2
```

Then run one of:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

```bash
godot4 --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

## Required Output

Update:

```text
game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md
```

Record:

- Godot binary path;
- Godot version if available;
- exact command used;
- pass/fail output;
- whether `TASK-0023` can be unblocked.

## Boundaries

- Do not change project code to bypass missing Godot.
- Do not rewrite loader or tests unless the headless run exposes a concrete failure.
- Do not implement runtime code.
- Do not implement gameplay.
- Do not create playable scenes.
- Do not implement UI.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
