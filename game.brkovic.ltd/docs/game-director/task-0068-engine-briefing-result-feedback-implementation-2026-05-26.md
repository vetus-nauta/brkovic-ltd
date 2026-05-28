# TASK-0068 - Engine Implementation: Briefing + Result Feedback Pack

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Prototype Path

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-next-prototype-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md`

## Task

Implement the Watch Officer `Briefing + Result Feedback Pack` in the local Godot prototype.

This task intentionally combines two small implementation tasks:

1. Pre-start briefing in ready state.
2. Result feedback surface in completed/terminal state.

This is local prototype implementation only. Do not export, deploy, upload, or modify production public files.

## Required Implementation Scope

Implement in the existing Scenario 1 playable greybox:

- briefing visible in `ready` state before attempt start;
- briefing hidden after `Space`/`Enter` start;
- result feedback visible only after completed/terminal result;
- restart returns to `ready` and shows briefing again;
- result feedback renders Engine/exported state only:
  - `scenario_result`;
  - safe-water state;
  - CPA/TCPA qualitative state;
  - active/final warnings;
  - draft/non-final status;
- player-facing mode does not show numeric CPA/TCPA values;
- debug/QA mode may retain numeric/debug fields if already available;
- VTS remains disabled/inactive;
- no VTS popup is introduced;
- no new scenario is added.

Use the UX copy and hierarchy from:

```text
game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md
```

## Expected Files

Prefer minimal edits in existing prototype files:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scenes/playable_greybox_scene.tscn
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd
```

Add a focused test if needed:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_briefing_result_feedback_pack.gd
```

Create implementation report:

```text
game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-implementation-report.md
```

## Required Tests

Run the new focused headless test.

Run full existing headless regression:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_fixed_tick_input_log.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_ownship_kinematic_integrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_target_kinematic_integrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_range_bearing_relative_side.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_cpa_tcpa_numeric_debug_solver.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_safe_water_geometry_monitor.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_warning_escalation_foundation.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_result_evaluator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_step_orchestrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_hud_binding_readability_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_briefing_result_feedback_pack.gd
```

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-implementation-report.md
```

The report must state one of:

- `implemented-local-prototype`
- `changes-required`
- `blocked`

Record:

- files changed;
- UX spec points implemented;
- exact tests run;
- pass/fail summaries;
- known limitations;
- confirmation that public production, export artifacts, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state were not touched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0068 done.
Report: game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-implementation-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, export artifacts, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state not touched.
Next expected: QA review for TASK-0068
```

## Boundaries

- Do not export.
- Do not deploy.
- Do not modify `game.brkovic.ltd/public/`.
- Do not modify production files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
