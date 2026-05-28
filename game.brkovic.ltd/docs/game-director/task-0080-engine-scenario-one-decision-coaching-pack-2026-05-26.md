# TASK-0080 - Engine Implementation: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Passed

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md`

## Task

Implement the Watch Officer `Scenario 1 Decision Coaching Pack` in the local Godot prototype only.

This is a local prototype implementation task. Do not export, deploy, copy to `public/`, touch production files, or use FTP.

## Required Implementation

Implement display-only coaching behavior based on existing Engine-owned state:

- active attempt coaching rail;
- maximum `1` primary cue + `2` chips;
- opening lateral-pair cue after start;
- safe-water cue states driven by `safe_water.state`;
- crossing-target cue states driven by `cpa_tcpa.state` and warning/result state;
- finish/result cue states driven by Engine result state;
- post-attempt reason list tied to existing result/warning state;
- reset behavior after `R` clearing coaching and returning to briefing;
- draft/non-final wording preserved.

Player surface must not show:

- numeric CPA/TCPA;
- CPA/TCPA thresholds;
- encounter confidence;
- raw geometry distances;
- debug closest points;
- replay seed/tolerance;
- legal rule numbers;
- final/official/certified/COLREGS-compliant training claims.

## Engine/UI Boundary

UI/HUD remains display-only.

Do not move maritime logic into UI:

- no UI-side encounter classification;
- no UI-side CPA/TCPA calculation;
- no UI-side safe-water geometry check;
- no UI-side warning escalation;
- no UI-side scenario result evaluation.

If additional exported fields are needed, add them from Engine/runtime state in a narrow way and cover them with tests.

## Expected Files

Likely files may include:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_one_decision_coaching_pack.gd
game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md
```

Keep changes narrow. Do not modify unrelated systems.

## Required Tests

Run the new focused test:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_decision_coaching_pack.gd
```

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
game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md
```

The report must state one of:

- `passed`
- `changes-required`
- `blocked`

Record:

- files changed;
- cue behavior implemented;
- reason-list behavior implemented;
- tests run and pass/fail summaries;
- confirmation that no public/export/deploy/production/Captain Ether/Nav Desk/router/auth files were touched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0080 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, export artifacts, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP not touched.
Next expected: QA review for TASK-0080
```

## Boundaries

- Do not export.
- Do not deploy.
- Do not copy to `public/`.
- Do not touch Captain Ether.
- Do not touch Nav Desk.
- Do not touch router or registry.
- Do not touch auth.
- Do not touch production config.
- Do not use FTP.
- Do not add VTS to scenario 1.
- Do not add a new scenario.
- Do not add final maritime training claims.
