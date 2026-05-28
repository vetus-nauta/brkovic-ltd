# TASK-0111 - QA Review Local Scenario 2 Playable Scene Slice

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

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-planning.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-ui-hud-binding-foundation-review.md`

## Task

Review TASK-0110 as a QA gate.

Confirm whether the local Scenario 2 playable-scene slice is approved for the next local polish/export-decision slice.

## Required Checks

Confirm:

- Scenario 1 remains the default local playable path.
- Scenario 2 can be selected locally without router/registry/public route.
- Scenario 2 reset boots deterministic tick `0`, time `0.0`, result `ready`.
- Scenario 2 snapshot includes display branch and excludes display debug object.
- Scenario 2 QA debug remains under `snapshot["qa"]`.
- Space/Enter starts Scenario 2 without advancing a tick.
- D/Right queues starboard input and reaches orchestrator.
- Scenario 2 advances through the orchestrator.
- HUD displays approved Scenario 2 briefing/coaching/status copy.
- Player-facing HUD excludes forbidden debug/final/legal/certified/official claims.
- Reset preserves selected local Scenario 2 path.
- No export, deploy, `public/`, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claim was introduced.

## Required Tests

Run:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_playable_scene_slice.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
```

If feasible, also run:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_runtime_state_export_orchestrator.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md
```

Status must be one of:

```text
approved-for-next-slice
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
