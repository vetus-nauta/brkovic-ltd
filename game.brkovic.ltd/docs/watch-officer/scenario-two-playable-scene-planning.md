# Scenario 2 Playable Scene Planning

**Task:** TASK-0109  
**Owner:** CHAT-ENGINE-001 / Engine Godot Architect  
**Date:** 2026-05-27  
**Status:** planning-only  
**Scope:** Minimal next local Godot implementation slice after TASK-0108.

## Goal

Make Scenario 2 locally playable inside the existing Godot prototype by loading the approved Scenario 2 data path through the existing greybox play loop, orchestrator, and HUD binding.

This slice must produce a local prototype experience only. It must not create an export, public deploy candidate, game hub route, registry entry, Captain Ether integration, Nav Desk integration, auth flow, or final maritime training claim.

## Starting Point

Already available foundations:

- Scenario 2 data: `res://data/scenarios/head-on-port-to-port.json`.
- Existing playable scene: `res://scenes/playable_greybox_scene.tscn`.
- Existing local controller: `res://scripts/runtime/playable_greybox_controller.gd`.
- Existing bootstrap path support: `RuntimeBootstrap.bootstrap(scenario_path)`.
- Scenario 2 runtime state and display snapshot branch: `runtime_snapshot["scenario_two"]`.
- Scenario 2 HUD binding: `HudSnapshotBinder.build_sections(...)` reads `runtime_snapshot["scenario_two"]` display-only.
- Existing local controls and attempt states: ready, running, completed, restart.

## Minimal Implementation Slice

The next Engine slice should do only this:

1. Add a local scene-loading boundary that lets the existing playable scene boot either Scenario 1 or Scenario 2.
2. Route Scenario 2 loading through `ScenarioLoader` and `RuntimeBootstrap.bootstrap(scenario_path)`.
3. Reuse `RuntimeStepOrchestrator.step(...)` for fixed-tick simulation.
4. Reuse `HudSnapshotBinder.build_sections(...)` without moving Scenario 2 maritime computation into UI.
5. Add focused headless tests proving Scenario 2 can boot, start, accept starboard input, step, expose Scenario 2 HUD text, and reset locally.

No new product navigation, account state, browser public shell, deploy pipeline, or scenario registry should be introduced in this slice.

## Scene Loading / Selection Boundary

Preferred narrow boundary:

- Keep `playable_greybox_scene.tscn` as the only local playable scene and main scene.
- Add a controller-level scenario path property or setter on `PlayableGreyboxController`.
- Default remains Scenario 1:

```text
res://data/scenarios/safe-water-crossing-target.json
```

- Scenario 2 local tests instantiate the same scene, set the path to:

```text
res://data/scenarios/head-on-port-to-port.json
```

- Then call `reset_scenario()` or a dedicated local `load_scenario_path(path)` method.

Acceptable local-only alternatives:

- A second local `.tscn` wrapper that instances the same controller and sets the Scenario 2 path.
- A debug-only command-line/project setting override for local QA.

Do not add:

- hub route;
- public URL;
- scenario registry;
- menu system;
- Captain Ether or Nav Desk selector;
- auth-gated selection;
- production config.

## Scenario Path Handling

Path handling should be explicit and deterministic:

- Store the active path in controller state, not as a hard-coded Scenario 2 replacement.
- Validate loading through the existing `ScenarioLoader`.
- Bootstrap using the same active path.
- Preserve loader error reporting in HUD for failed paths.
- Preserve existing Scenario 1 default path and tests.

Recommended controller surface:

```text
set_scenario_path(path: String) -> Dictionary
get_scenario_path() -> String
reset_scenario() -> void
```

`set_scenario_path` should not advance ticks. It may either call `reset_scenario()` directly or require the caller/test to call `reset_scenario()`; whichever matches the existing controller style with the least churn.

Stop if Scenario 2 requires schema changes, data edits, or relaxed loader validation. Those belong to a separate Engine/data task.

## Controller Integration

The playable controller should remain a thin local shell:

- load scenario data;
- own local attempt state;
- collect keyboard input;
- call `RuntimeStepOrchestrator.step(...)`;
- store returned `runtime_state`, `runtime_snapshot`, and `scenario_result_detail`;
- pass snapshots to HUD binder;
- draw existing greybox geometry and vessels.

It must not import or call:

- `ScenarioTwoHeadOnClassifier`;
- `ScenarioTwoPassEventDetector`;
- `CpaTcpaDebugSolver`;
- safe-water monitor;
- warning escalation pipeline;
- result evaluator.

Those stay behind the orchestrator.

Keyboard behavior can remain unchanged:

- Space / Enter starts attempt.
- D / Right creates starboard alteration.
- A / Left creates port alteration.
- Q / E adjust speed.
- R resets current active scenario path.

For Scenario 2 acceptance, the local play loop only needs to prove that starboard input reaches the orchestrator and Scenario 2 display state can update. It does not need polished navigation UX or a full scenario-select screen.

## HUD Binding Reuse

Reuse the existing HUD binder exactly as the Scenario 2 display boundary:

- Briefing should show `Head-On Port-to-Port Drill`.
- Active coaching should use Scenario 2 cues from TASK-0107/TASK-0108.
- Result/status should read display-safe Scenario 2 fields only.
- HUD must not read `snapshot["qa"]["scenario_two_debug"]`.
- HUD must not expose numeric CPA/TCPA, raw geometry, thresholds, legal rule numbers, official/certified claims, or final maritime training claims.

The playable-scene slice may adjust controller/layout wiring only if Scenario 2 HUD sections fail to appear in the existing labels. It should not redesign the HUD.

## Test Plan

Add a focused headless test, recommended name:

```text
tests/runtime/test_scenario_two_playable_scene_slice.gd
```

Required assertions:

- Existing `playable_greybox_scene.tscn` still loads.
- Default scenario path remains Scenario 1 unless explicitly changed.
- Scenario 2 path can be selected locally without router/registry.
- Reset after selecting Scenario 2 boots tick `0`, time `0.0`, result `ready`.
- Runtime snapshot includes `scenario_two`.
- Snapshot excludes `scenario_two.debug` from display branch.
- QA debug, if present, remains under `snapshot["qa"]["scenario_two_debug"]`.
- Space/Enter starts local attempt without advancing a tick.
- D/Right queues a `turn_starboard_pressed` input record.
- At least one orchestrated tick advances using Scenario 2.
- HUD text contains approved Scenario 2 briefing/coaching/result-safe wording.
- HUD text does not contain prohibited claims or debug fields.
- R/reset preserves the active Scenario 2 path for the local attempt, unless the chosen API explicitly documents reset-to-default behavior and tests cover it.
- Scenario 1 focused playable/HUD tests still pass.

Focused regression set for implementation owner:

```text
scenario_two_playable_scene_slice_test
playable_greybox_scene_pack_test
local_play_loop_polish_pack_test
scenario_two_hud_binding_readability_pack_test
scenario_two_runtime_state_export_orchestrator_test
scenario_loader_test
```

Run full headless regression if controller path handling touches shared boot/reset behavior beyond a tiny setter.

## Stop Conditions

Stop and report to Game Director if any of these are needed:

- export or deploy work;
- files under `public/`;
- hub route, scenario registry, or public selection UI;
- Captain Ether, Nav Desk, or auth integration;
- production config changes;
- schema relaxation or Scenario 2 data edits;
- new maritime rule semantics;
- UI-side Scenario 2 classifier/pass/CPA/warning/result computation;
- display of `scenario_two_debug` in player-facing HUD;
- numeric CPA/TCPA, threshold, legal rule, certified, official, or final training claims in player-facing text;
- VTS popup or Region B work;
- broad HUD redesign unrelated to making Scenario 2 locally playable.

## Acceptance

The slice is acceptable when Scenario 2 can be launched locally in Godot through the existing playable scene/controller boundary, started with the existing controls, stepped through the existing orchestrator, and displayed through the existing Scenario 2 HUD binding, with focused tests passing and Scenario 1 preserved.

The result is still draft/non-final local prototype work only.

## Next Expected

Assign Engine implementation for the local Scenario 2 playable-scene slice. QA should review after implementation confirms focused headless tests and scope boundaries.
