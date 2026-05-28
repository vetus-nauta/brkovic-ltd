# Scenario 2 Schema / Data / Loader Validation Report

**Task:** TASK-0097
**Owner:** Engine / Godot Architect
**Date:** 2026-05-27
**Status:** Passed

## Summary

Scenario 2 Head-On Port-to-Port now has a draft scenario data file and loader-level validation.

This is a data/schema/loader slice only. It does not make Scenario 2 playable.

## Implemented

- Added Scenario 2 draft scenario data:
  - `game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/head-on-port-to-port.json`
- Generalized scenario schema for both supported MVP scenario IDs:
  - `safe-water-crossing-target`
  - `head-on-port-to-port`
- Generalized `ScenarioLoader` validation for scenario-specific contracts:
  - Scenario 1 requires crossing / give_way and starboard crossing target.
  - Scenario 2 requires head_on / head_on_alter_starboard and reciprocal-or-nearly-reciprocal target heading relation.
  - Both scenarios require `iala_region: "A"`, `rule_review_status: "draft"`, draft/non-final training claim status, disabled VTS, deterministic replay metadata, and numeric CPA/TCPA debug readiness.
- Extended the headless loader test to cover Scenario 2 valid load and blocking validation errors.

## Scenario 2 Data Contract

Scenario 2 is stored as:

```text
res://data/scenarios/head-on-port-to-port.json
```

Core contract:

- `scenario_id: "head-on-port-to-port"`
- `iala_region: "A"`
- `rule_review_status: "draft"`
- `training_claim_status: "draft_not_final_training_content"`
- one power-driven target vessel
- target `heading_relation: "reciprocal_or_nearly_reciprocal"`
- `encounter.expected_initial_class: "head_on"`
- `encounter.expected_player_role: "head_on_alter_starboard"`
- VTS disabled
- replay metadata uses fixed tick, input log, event log, and `event_timing_tolerance_ticks: 1`

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

## Boundaries Preserved

Not implemented:

- playable Scenario 2
- UI/HUD implementation
- head-on runtime classifier
- port-to-port pass detection
- warnings/results runtime changes
- export
- deploy
- public files
- Captain Ether
- Nav Desk
- router/registry
- auth
- production config
- VTS
- Region B
- final maritime training claims

## Next Expected Step

QA review of TASK-0097, then Game Director decision for the next Engine slice:

```text
Scenario 2 head-on classifier and event logging foundation
```
