# TASK-0110 - Engine Local Scenario 2 Playable Scene Slice

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Architect  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-planning.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-ui-hud-binding-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-ui-hud-binding-foundation-report.md`

## Task

Implement the narrow local Scenario 2 playable-scene slice.

Make Scenario 2 playable locally through the existing Godot greybox scene/controller boundary while preserving Scenario 1 as the default scenario.

## Write Scope

Allowed files:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_playable_scene_slice.gd
game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md
```

## Required Checks

Confirm:

- existing greybox scene still loads;
- default scenario path remains Scenario 1;
- Scenario 2 path can be selected locally;
- reset boots selected Scenario 2 to tick `0`, time `0.0`, result `ready`;
- snapshot includes `scenario_two`;
- display snapshot excludes `scenario_two.debug`;
- QA debug remains under `snapshot["qa"]["scenario_two_debug"]`;
- Space/Enter starts attempt without advancing a tick;
- D/Right queues starboard input;
- at least one orchestrated Scenario 2 tick advances;
- HUD text contains approved Scenario 2 briefing/coaching/status text;
- HUD text excludes forbidden debug/final/legal/certified claims;
- reset preserves selected Scenario 2 path for the local attempt;
- Scenario 1 playable/HUD tests still pass.

## Required Tests

Run:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_playable_scene_slice.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_runtime_state_export_orchestrator.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md
```

## Boundaries

- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not implement hub route, registry, menu system, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
- Do not move Scenario 2 classifier/pass/CPA/warning/result logic into controller or HUD.
