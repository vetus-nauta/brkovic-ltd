# Scenario 2 UI/HUD Binding Foundation Report

**Task:** TASK-0107  
**Owner:** Game Director / UI-HUD Integration  
**Date:** 2026-05-27  
**Status:** Passed

## Summary

Scenario 2 now has a narrow player-facing HUD binding foundation.

The HUD reads Engine-owned `runtime_snapshot["scenario_two"]` as display-only and maps it to approved Scenario 2 briefing, coaching, status, and result feedback copy.

This is not a playable Scenario 2 route, export, staged public candidate, or production deploy.

## Implemented

- Added Scenario 2-specific briefing in `hud_snapshot_binder.gd`.
- Added Scenario 2 active decision coaching:
  - `Head-on risk. Alter starboard early.`
  - `CPA caution. Increase separation.`
  - `CPA danger. Avoid collision.`
  - `Port-to-port pass achieved.`
- Added capped Scenario 2 chips:
  - `Head-on`
  - `Port-to-port`
  - `Draft training`
  - existing qualitative CPA chips.
- Added Scenario 2 result/status display for:
  - encounter class/player role;
  - early starboard status;
  - port-to-port status.
- Added Scenario 2 result feedback reasons:
  - `Early starboard alteration made.`
  - `Port-to-port pass achieved.`
  - `CPA state recovered in this scenario.`
- Added focused headless test:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
```

## Display-Only Boundary

HUD binding does not import or call simulation modules.

The new test confirms:

- no `scripts/sim/` import in HUD binder;
- HUD does not compute Scenario 2 classifier;
- HUD does not compute Scenario 2 pass event;
- HUD does not compute CPA/TCPA;
- HUD does not read `scenario_two_debug`;
- player-facing text does not expose debug geometry, numeric debug separation, COLREGS claims, official claims, certified claims, or legal correctness claims.

## Tests

Focused tests:

```text
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
```

Full headless regression:

```text
scenario_loader_test: 121 passed, 0 failed
runtime_bootstrap_test: 27 passed, 0 failed
fixed_tick_input_log_test: 24 passed, 0 failed
ownship_kinematic_integrator_test: 19 passed, 0 failed
target_kinematic_integrator_test: 18 passed, 0 failed
range_bearing_relative_side_test: 23 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
cpa_tcpa_numeric_debug_solver_test: 21 passed, 0 failed
safe_water_geometry_monitor_test: 24 passed, 0 failed
warning_escalation_foundation_test: 127 passed, 0 failed
scenario_result_evaluator_test: 66 passed, 0 failed
runtime_step_orchestrator_test: 43 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
briefing_result_feedback_pack_test: 56 passed, 0 failed
scenario_one_decision_coaching_pack_test: 78 passed, 0 failed
scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed
scenario_two_pass_event_detector_test: 30 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
```

## Scope Preserved

Not implemented or touched:

- playable Scenario 2 route;
- scenario selection UI;
- export artifacts;
- public files;
- staged public candidate;
- production deploy;
- Captain Ether;
- Nav Desk;
- router/registry;
- auth;
- production config;
- FTP;
- VTS;
- Region B;
- final maritime training claims.

## Next Expected Step

QA review for TASK-0107.
