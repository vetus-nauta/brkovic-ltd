# Scenario 2 Playable Scene Slice Report

**Task:** TASK-0110  
**Owner:** CHAT-ENGINE-001 / Engine Godot Architect  
**Date:** 2026-05-27  
**Status:** Passed

## Summary

Scenario 2 can now be selected locally through the existing Godot playable greybox controller and scene.

The default local playable path remains Scenario 1:

```text
res://data/scenarios/safe-water-crossing-target.json
```

Scenario 2 local tests select:

```text
res://data/scenarios/head-on-port-to-port.json
```

The controller still loads through `ScenarioLoader`, bootstraps through `RuntimeBootstrap.bootstrap(active_path)`, steps through `RuntimeStepOrchestrator.step(...)`, and binds HUD text through `HudSnapshotBinder.build_sections(...)`.

## Implemented

- Added controller-owned active scenario path state.
- Added local controller API:
  - `set_scenario_path(path: String) -> Dictionary`
  - `load_scenario_path(path: String) -> Dictionary`
  - `get_scenario_path() -> String`
  - existing `reset_scenario() -> void` now reloads the active path.
- Preserved Scenario 1 as the default playable scene boot path.
- Preserved `R`/restart behavior for the currently active path, including Scenario 2.
- Added focused headless test:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_playable_scene_slice.gd
```

## Validation

Focused tests:

```text
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
```

## Scope Preserved

No changes were made to `public/`, export artifacts, router/registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.

The controller still does not import or call Scenario 2 sim modules directly. Scenario 2 classifier/pass/CPA/safe-water/warning/result work remains behind the orchestrator boundary.

No HUD redesign, scene redesign, schema relaxation, Scenario 2 data edit, public route, scenario registry, or deployment work was introduced.
