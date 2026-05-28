# Local Scenario Selector Implementation Report

**Task:** TASK-0114  
**Owner:** Game Director / Engine Integration  
**Date:** 2026-05-27  
**Status:** Passed

## Summary

The Watch Officer Godot prototype now has a local scenario selector for:

- Scenario 1 - Safe Water / Crossing Target
- Scenario 2 - Head-On Port-to-Port Drill

Scenario 1 remains the fresh-boot default. Scenario 2 is selectable locally before starting an attempt.

This is not a public route, game hub, export, deploy, registry entry, or final maritime training release.

## Implemented

- Added `ScenarioSelector` `OptionButton` to the existing greybox scene HUD layer.
- Added `ScenarioSelectorStatusLabel` with:
  - `Draft training`
  - `Region A / VTS inactive`
  - `Not final maritime instruction.`
- Added controller-local scenario options for Scenario 1 and Scenario 2.
- Added controller API:
  - `select_scenario_index(index: int) -> Dictionary`
  - `get_selected_scenario_index() -> int`
  - `get_scenario_selector_snapshot() -> Dictionary`
- Kept existing `set_scenario_path`, `load_scenario_path`, `get_scenario_path`, and `reset_scenario` behavior.
- Selector hides while an attempt is running and returns in ready/reset states.
- Reset preserves the selected scenario path.
- Scenario 1 can be selected again after Scenario 2.

## Tests

Focused tests:

```text
scenario_selector_local_flow_test: 51 passed, 0 failed
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
```

## Scope Preserved

Not touched:

- export artifacts;
- `public/`;
- production deploy;
- hub route;
- product registry;
- Captain Ether;
- Nav Desk;
- auth;
- production config;
- FTP;
- VTS;
- Region B;
- final maritime training claims.

The controller still does not import Scenario 2 simulation modules directly. Scenario logic remains behind the existing orchestrator boundary.

## Next Expected

QA review for TASK-0114.
