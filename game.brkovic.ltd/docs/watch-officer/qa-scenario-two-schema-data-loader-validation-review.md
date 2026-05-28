# QA Scenario 2 Schema / Data / Loader Validation Review

**Task:** TASK-0098
**Owner:** Maritime QA / Validation
**Date:** 2026-05-27
**Status:** approved-for-next-engine-slice

## Result

TASK-0097 is approved for the next Engine slice:

```text
Scenario 2 head-on classifier and event logging foundation
```

## Checks

- Scenario 1 loader regression is preserved.
- Scenario 2 draft data loads.
- Scenario 2 uses `iala_region: "A"`.
- Scenario 2 keeps `rule_review_status: "draft"`.
- Scenario 2 keeps `training_claim_status: "draft_not_final_training_content"`.
- Scenario 2 keeps VTS disabled.
- Scenario 2 has one power-driven target vessel.
- Scenario 2 target has `heading_relation: "reciprocal_or_nearly_reciprocal"`.
- Scenario 2 encounter contract is `head_on` / `head_on_alter_starboard`.
- Scenario 2 replay metadata uses fixed tick, input log, event log, and `event_timing_tolerance_ticks: 1`.
- Loader produces blocking errors for invalid Scenario 2 contract fields.

## Tests

JSON parse check:

```text
JSON OK game.brkovic.ltd/prototypes/watch-officer-godot/data/schemas/scenario.schema.json
JSON OK game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json
JSON OK game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/head-on-port-to-port.json
```

Required loader test:

```text
scenario_loader_test: 121 passed, 0 failed
```

Full headless regression:

```text
briefing_result_feedback_pack_test: 56 passed, 0 failed
cpa_tcpa_numeric_debug_solver_test: 21 passed, 0 failed
fixed_tick_input_log_test: 24 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
ownship_kinematic_integrator_test: 19 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
range_bearing_relative_side_test: 23 passed, 0 failed
runtime_bootstrap_test: 27 passed, 0 failed
runtime_step_orchestrator_test: 43 passed, 0 failed
safe_water_geometry_monitor_test: 24 passed, 0 failed
scenario_one_decision_coaching_pack_test: 78 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
scenario_result_evaluator_test: 66 passed, 0 failed
target_kinematic_integrator_test: 18 passed, 0 failed
warning_escalation_foundation_test: 127 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
```

## Scope Preserved

No playable Scenario 2, UI/HUD implementation, export, public copy, deploy, VTS, Region B, or final maritime training claim was introduced.

QA did not edit implementation code, scenario data, public files, production files, Captain Ether, Nav Desk, router/registry, auth, or production config.

## Next Expected

Game Director may assign the next Engine slice:

```text
Scenario 2 head-on classifier and event logging foundation
```
