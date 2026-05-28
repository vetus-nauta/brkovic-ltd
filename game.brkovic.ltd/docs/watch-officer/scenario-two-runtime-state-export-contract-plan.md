# Scenario 2 Runtime State Export Contract / Orchestrator Integration Plan

**Task:** TASK-0104
**Owner:** Engine / Godot Architect
**Date:** 2026-05-27
**Status:** Passed

## Purpose

Define how Scenario 2 Engine-owned state should be exposed before UI/HUD or playable-scene work starts.

This is a planning/contract artifact only. No code was changed.

## Source Foundation

Approved inputs:

- Scenario 2 loader/data validation.
- Scenario 2 head-on classifier.
- Scenario 2 initial classification event.
- Scenario 2 early starboard alteration detector.
- Scenario 2 port-to-port pass detector.
- QA approvals through TASK-0103.

## Runtime State Fields

Scenario 2 runtime should add or populate an Engine-owned branch:

```text
runtime_state["scenario_two"]
```

Proposed fields:

```text
scenario_two.encounter_class
scenario_two.player_role
scenario_two.initial_match
scenario_two.classifier_status
scenario_two.early_starboard_status
scenario_two.early_starboard_detected
scenario_two.early_starboard_tick
scenario_two.early_starboard_time_sec
scenario_two.port_to_port_status
scenario_two.port_to_port_achieved
scenario_two.pass_relationship
scenario_two.draft_training_logic
scenario_two.last_event_types
```

Debug-only fields:

```text
scenario_two.debug.relative_heading_deg
scenario_two.debug.reciprocal_error_deg
scenario_two.debug.bearing_ahead_delta_deg
scenario_two.debug.heading_delta_deg
scenario_two.debug.separation_m
```

Debug fields must not be shown in normal player UI unless a separate debug/QA task approves it.

## Classifier Export

Classifier state source:

```text
ScenarioTwoHeadOnClassifier.classify(...)
```

Export as:

```text
encounter.class: "head_on" | "ambiguous"
encounter.player_role: "head_on_alter_starboard" | "none"
encounter.initial_match: bool
encounter.draft_training_logic: true
scenario_two.classifier_status: "matched" | "not_matched"
```

UI/HUD must read these fields as display-only.

## Early Starboard Export

Detector source:

```text
ScenarioTwoPassEventDetector.detect_early_starboard_alteration(...)
```

Export as:

```text
scenario_two.early_starboard_status: "not_detected" | "detected"
scenario_two.early_starboard_detected: bool
scenario_two.early_starboard_tick: int
scenario_two.early_starboard_time_sec: float
```

Player-facing copy must not say this is a universal legal manoeuvre. Use scenario-specific wording.

## Port-To-Port Export

Detector source:

```text
ScenarioTwoPassEventDetector.detect_port_to_port_pass(...)
```

Export as:

```text
scenario_two.port_to_port_status: "not_achieved" | "achieved"
scenario_two.port_to_port_achieved: bool
scenario_two.pass_relationship: "unknown" | "port_to_port" | "starboard_to_starboard"
```

Achievement must remain controlled by Engine state. UI must not infer pass relationship.

## Event Log Contract

Approved event types:

```text
scenario_two_head_on_initial_classified
scenario_two_early_starboard_alteration_detected
scenario_two_port_to_port_pass_achieved
```

Payload rules:

- deterministic;
- no player identity;
- no private data;
- no credentials;
- no cookies/sessions;
- no final maritime training claim;
- debug values allowed for QA/headless tests only.

## Snapshot Contract

Runtime snapshot should expose:

```text
snapshot.scenario_two
```

with display-safe fields:

```text
classifier_status
early_starboard_status
port_to_port_status
pass_relationship
draft_training_logic
```

and QA/debug-only fields under:

```text
snapshot.qa.scenario_two_debug
```

Normal UI must not render QA/debug numeric thresholds or debug geometry.

## Orchestrator Update Order

Recommended Scenario 2 order:

```text
apply_tick_inputs
ownship_kinematic_integrator
target_kinematic_integrator
range_bearing_relative_side_updater
scenario_two_head_on_classifier
cpa_tcpa_numeric_debug_solver
scenario_two_early_starboard_detector
scenario_two_port_to_port_pass_detector
safe_water_geometry_monitor
warning_escalation_pipeline
scenario_result_evaluator
runtime_snapshot_exporter
```

Scenario 1 order must remain unchanged unless the next implementation explicitly routes by scenario id.

## Next Implementation Slice

Recommended next Engine task:

```text
Scenario 2 runtime state export and orchestrator integration foundation
```

Allowed in that slice:

- route Scenario 2 through Scenario 2 classifier/detector modules;
- add `runtime_state["scenario_two"]`;
- export `snapshot["scenario_two"]`;
- keep Scenario 1 regression intact;
- add focused headless tests.

Closed in that slice:

- playable Scenario 2;
- UI/HUD implementation;
- result evaluation changes;
- warning escalation changes;
- export;
- deploy;
- public files;
- VTS;
- Region B;
- final maritime training claims.

## QA Acceptance Criteria

QA should confirm:

- Scenario 1 runtime tests still pass.
- Scenario 2 runtime state branch exists after Scenario 2 bootstrap/step.
- Scenario 2 snapshot branch exists.
- Classifier state is Engine-owned.
- Early starboard and port-to-port status are Engine-owned.
- UI/HUD does not compute these fields.
- Debug values are not in normal display fields.
- Event log payloads remain non-secret and deterministic.

## Scope Preserved

No implementation code, UI/HUD, playable scene, export, deploy, public files, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims changed.
