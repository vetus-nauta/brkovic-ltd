# QA Scenario 2 Coaching + Result Feedback Review Plan

**Task:** TASK-0125 / CHAT-QA-001 preparation lane  
**Target review:** Scenario 2 Coaching + Result Feedback Pack  
**Depends on:** TASK-0124 Engine report  
**Owner:** Maritime QA / Validation  
**Date:** 2026-05-28  
**Status:** preflight-plan-ready; QA execution blocked until the TASK-0124 Engine report exists

## Result

This document defines the QA review plan only.

It does not approve implementation, export, browser release, deploy, public route, registry entry, production integration, or final maritime training claims. QA must not approve the Scenario 2 Coaching + Result Feedback Pack until the TASK-0124 Engine report exists and the checks below pass against repository source.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-review.md`

## QA Start Prerequisites

QA may start the review only after the TASK-0124 Engine report is present in the repository and includes:

- exact implementation summary for Scenario 2 coaching and result feedback;
- exact changed files and test files;
- focused Godot headless test command results;
- regression command results;
- statement that Scenario 1 behavior is preserved;
- statement that no browser/export/deploy/public route/registry/production work was performed;
- statement that no final, official, certified, legal, COLREGS-compliant, or final maritime training claims were introduced.

If the Engine report is missing, incomplete, or claims browser/export/deploy/production approval, QA status must be `blocked`.

## Required Focused Tests

QA must require and run the focused TASK-0124 test named by the Engine report. Expected focused test name:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_coaching_result_feedback_pack.gd
```

Expected command:

```text
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_coaching_result_feedback_pack.gd
```

The focused test must prove:

- Scenario 2 loads through the existing local selector/controller path:
  `res://data/scenarios/head-on-port-to-port.json`.
- Scenario 2 starts from deterministic ready state with tick `0`, time `0.0`, and `scenario_result` `ready`.
- Ready state shows Scenario 2 briefing and draft/non-final status, with result feedback hidden.
- Running state shows Scenario 2 coaching from exported Engine/runtime state, including head-on risk and early starboard guidance.
- Starboard input is queued/applied through the existing orchestrator boundary, not through UI-owned maritime logic.
- Coaching updates when Engine-owned Scenario 2 state changes, including early-starboard/action-status and port-to-port status.
- Result feedback appears only after completed/terminal Engine result.
- Result feedback is Scenario 2-specific and explains early starboard action and port-to-port outcome without exposing debug-only numeric fields.
- Reset returns Scenario 2 to ready state, hides stale coaching/result feedback, keeps draft/non-final wording visible, and preserves the active local Scenario 2 path.
- Player-facing HUD excludes `scenario_two_debug`, raw QA branches, numeric CPA/TCPA debug fields, route/registry/deploy language, public release claims, and forbidden maritime claims.

## Required Regression Tests

QA must also run these existing local Godot headless tests unless the Engine report justifies a renamed successor with equivalent coverage:

```text
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_playable_scene_slice.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_runtime_state_export_orchestrator.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_selector_local_flow.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_playable_greybox_scene_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_local_play_loop_polish_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_briefing_result_feedback_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_decision_coaching_pack.gd
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Minimum regression purpose:

- Scenario 2 remains selectable locally and still advances through `RuntimeStepOrchestrator`.
- Scenario 2 display snapshot keeps debug data out of player-facing branches.
- Scenario selector keeps Scenario 1 and Scenario 2 local flow stable.
- Scenario 1 playable path, briefing, coaching, result feedback, reset, and local play loop remain passing.
- Scenario loader validation still passes for both Scenario 1 and Scenario 2 data.

## Browser And Export Exclusions

This QA lane must not perform or approve:

- Godot Web export;
- local browser smoke;
- production browser smoke;
- screenshot capture for approval;
- public artifact checks;
- MIME/header checks;
- FTP upload;
- production deploy;
- hub route or registry validation;
- game hub, Captain Ether, Nav Desk, auth, production config, VTS expansion, or Region B validation.

If a future task asks for browser/export QA, it must be assigned as a separate gate after this local Engine QA passes.

## Forbidden-Claim Checks

QA must inspect the focused test assertions, Engine report, relevant player-facing copy, and HUD/result snapshots for forbidden claims.

Player-facing text must not include:

- `official`;
- `certified`;
- `legally correct`;
- `legal`;
- `COLREGS-compliant`;
- `COLREGS compliant`;
- `final maritime training`;
- `final training`;
- `approved navigation procedure`;
- public release, deploy, route, registry, or production availability claims.

Required allowed limit language remains:

```text
Draft training
Not final maritime instruction.
Region A / VTS inactive
```

Scenario 2 feedback may describe only the narrow draft drill outcome, such as early starboard alteration and port-to-port pass status. It must not generalize into final maritime instruction, certification, legal correctness, or full COLREGS coverage.

## Scenario 1 Preservation Checks

QA approval requires explicit evidence that Scenario 1 remains intact:

- fresh local boot defaults to Scenario 1 / `res://data/scenarios/safe-water-crossing-target.json`;
- Scenario 1 can be selected after Scenario 2 and restores Scenario 1 briefing/runtime behavior;
- Scenario 1 decision coaching test remains passing;
- Scenario 1 briefing/result feedback test remains passing;
- Scenario 1 local play loop and playable greybox tests remain passing;
- Scenario 1 copy keeps draft/non-final training limits and does not gain Scenario 2 port-to-port wording;
- Scenario 1 reset behavior is unchanged.

Any Scenario 1 regression is a QA blocker for this pack.

## QA Gate Criteria

Approve the TASK-0124 implementation only if all criteria are met:

- TASK-0124 Engine report exists and contains complete local implementation and validation evidence.
- Focused Scenario 2 coaching/result feedback test passes with `0 failed`.
- Required regression tests pass with `0 failed`.
- Scenario 2 coaching/result feedback is driven by exported Engine/runtime state and preserves the orchestrator boundary.
- Scenario 2 player-facing result feedback appears only after terminal/completed result.
- Reset clears stale Scenario 2 coaching/result feedback and returns to deterministic ready state.
- Scenario 1 default boot, selector return path, coaching, briefing/result feedback, and reset behavior remain passing.
- Player-facing text contains required draft/non-final/Region A/VTS inactive limits.
- No forbidden claims, debug data, public route/registry/deploy wording, VTS expansion, Region B, or final maritime training claims are visible.
- QA did not edit code, export artifacts, public files, production files, route/registry files, or unrelated product areas.

Block the TASK-0124 implementation if any criterion fails, if the Engine report is absent, or if implementation scope crosses into forbidden areas.

## Scope Preserved

This preflight task created only:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-review-plan.md
```

No code, Godot scenes/scripts/tests, public files, export artifacts, production deploy, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS expansion, Region B, or final maritime training claims were changed.

## Next Expected

Run the QA review after TASK-0124 Engine implementation and report are complete.
