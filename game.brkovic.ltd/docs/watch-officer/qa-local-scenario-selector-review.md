# QA Local Scenario Selector Review

**Task:** TASK-0115  
**Reviewed Task:** TASK-0114  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-27  
**Status:** approved-for-local-export-decision

## Result

TASK-0114 is approved for the local Web export decision gate.

This QA review approves only the local Watch Officer Godot prototype scenario selector behavior for the next local export-decision step. It does not approve browser export, deploy, public route, registry entry, production integration, VTS, Region B, or final maritime training claims.

## Checks

- Fresh local boot defaults to Scenario 1, `Safe Water / Crossing Target`.
- Selector exposes Scenario 1 and Scenario 2.
- Selector status shows `Draft training`, `Region A / VTS inactive`, and `Not final maritime instruction.`
- Selecting Scenario 2 boots the Scenario 2 ready state.
- Starting an attempt hides the selector and selector status while running.
- Reset preserves the selected Scenario 2 path and returns Scenario 2 to ready state.
- Selecting Scenario 1 after Scenario 2 restores Scenario 1 and the Scenario 1 briefing path.
- Selector coverage confirms no public route, registry dependency, hub/deploy surface, direct Scenario 2 simulation imports, or final/certified/legal/COLREGS-compliant claims were introduced.
- Scenario 1 and Scenario 2 focused regression tests remain passing.

## Tests

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_selector_local_flow.gd
scenario_selector_local_flow_test: 51 passed, 0 failed

/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_playable_scene_slice.gd
scenario_two_playable_scene_slice_test: 57 passed, 0 failed

/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
playable_greybox_scene_pack_test: 31 passed, 0 failed

/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
local_play_loop_polish_pack_test: 45 passed, 0 failed

/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed

/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
scenario_loader_test: 121 passed, 0 failed
```

## Blockers

None.

## Scope Preserved

QA did not edit code, run export/browser/deploy checks, edit `public/`, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.

The only file created by this QA task is:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-scenario-selector-review.md
```

## Next Expected

Game Director may use this QA result for the local Web export decision.
