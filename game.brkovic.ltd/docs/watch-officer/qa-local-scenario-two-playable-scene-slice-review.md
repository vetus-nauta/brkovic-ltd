# QA Local Scenario 2 Playable Scene Slice Review

**Task:** TASK-0111  
**Reviewed Task:** TASK-0110  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-27  
**Status:** approved-for-next-slice

## Result

TASK-0110 is approved for the next local polish/export-decision slice.

The local Scenario 2 playable-scene slice passes the QA gate as a local Godot prototype path only. This review does not approve export, browser release, deploy, public route, registry entry, production integration, or final maritime training claims.

## Checks

- Scenario 1 remains the default local playable path:
  `res://data/scenarios/safe-water-crossing-target.json`.
- Scenario 2 can be selected locally through the playable greybox controller path API without router, registry, or public route work.
- Scenario 2 reset boots deterministic tick `0`, time `0.0`, and result `ready`.
- Scenario 2 runtime snapshot includes the display branch and excludes a display debug object.
- Scenario 2 QA debug remains under `snapshot["qa"]["scenario_two_debug"]`.
- Space starts Scenario 2 and leaves the simulation tick unchanged.
- `D` queues `turn_starboard_pressed`, and the queued starboard input reaches the orchestrator.
- Scenario 2 advances through `RuntimeStepOrchestrator`.
- HUD displays approved Scenario 2 briefing, coaching, action status, and port-to-port result-safe copy.
- Player-facing HUD excludes Scenario 2 debug fields and forbidden final/legal/certified/official/COLREGS-compliant claims.
- Reset preserves the selected local Scenario 2 path.
- Scenario 1 playable path and local play loop regression coverage remain passing.

## Evidence

- `test_scenario_two_playable_scene_slice.gd` confirms local Scenario 2 path selection, deterministic reset, start behavior, starboard input queueing, orchestrator stepping, HUD Scenario 2 copy, debug exclusion, forbidden-claim exclusion, and Scenario 2 reset persistence.
- `test_playable_greybox_scene_pack.gd` confirms the existing playable greybox scene and default Scenario 1 path still boot and advance through the orchestrator.
- `test_local_play_loop_polish_pack.gd` confirms the existing local play loop states, reset behavior, non-final copy, and Engine-owned result/HUD binding remain intact.
- `test_scenario_two_hud_binding_readability_pack.gd` confirms Scenario 2 HUD binding stays display-only and excludes QA debug, numeric debug data, and forbidden claims.
- `test_scenario_two_runtime_state_export_orchestrator.gd` confirms Scenario 2 runtime state, display snapshot, QA debug placement, and orchestrator branch behavior.
- `test_safe_water_crossing_target.gd` confirms Scenario 1 and Scenario 2 scenario loader validation coverage remains passing.

## Tests

```text
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
```

## Blockers

None.

## Scope Preserved

QA did not edit code, run export/browser/deploy checks, edit `public/`, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.

The only file created by this QA task is:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md
```

## Next Expected

Game Director may assign the next local polish/export-decision slice.
