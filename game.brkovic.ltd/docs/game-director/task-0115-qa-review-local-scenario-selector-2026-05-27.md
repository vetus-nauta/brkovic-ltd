# TASK-0115 - QA Review Local Scenario Selector

**Chat ID:** CHAT-QA-001  
**Department:** Maritime QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/local-scenario-selector-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md`

## Task

Review TASK-0114 as a QA gate.

Confirm whether the local scenario selector is approved for local Web export decision.

## Required Checks

Confirm:

- fresh boot defaults to Scenario 1;
- selector exposes Scenario 1 and Scenario 2;
- selector status shows draft/non-final and `Region A / VTS inactive`;
- selecting Scenario 2 boots Scenario 2 ready state;
- starting an attempt hides selector;
- reset preserves selected Scenario 2;
- selecting Scenario 1 after Scenario 2 restores Scenario 1;
- selector does not add public route, registry, hub, deploy, or final/certified/legal claims;
- Scenario 1 and Scenario 2 focused tests still pass.

## Required Tests

Run:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_selector_local_flow.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_playable_scene_slice.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
```

If feasible, also run:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-scenario-selector-review.md
```

Status must be one of:

```text
approved-for-local-export-decision
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
