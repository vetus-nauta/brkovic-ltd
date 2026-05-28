# QA Scenario 2 Coaching + Result Feedback Review

**Task:** TASK-0125  
**Reviewed Task:** TASK-0124  
**Owner:** CHAT-QA-001 / Maritime QA  
**Date:** 2026-05-28  
**Status:** changes-required

## Result

TASK-0124 is not approved yet.

The focused and regression Godot headless tests pass, and the implementation remains local-only. QA still requires changes before approval because the implementation misses two Scenario 2 UX acceptance details:

- Scenario 2 ready briefing does not show the required `Region A / VTS inactive` line.
- Isolated early-starboard live coaching does not show the required `Early starboard alteration made.` cue.

This review does not approve export, browser release, deploy, public route, registry entry, production integration, VTS expansion, Region B, or final maritime training claims.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-review-plan.md`
- `game.brkovic.ltd/docs/game-director/task-0125-qa-review-scenario-two-coaching-result-feedback-pack-2026-05-28.md`

## Required Changes

1. Add the required Scenario 2 briefing limit line.

   The UX acceptance checklist requires Scenario 2 briefing to show draft/non-final wording and `Region A / VTS inactive`. The current Scenario 2 briefing in `hud_snapshot_binder.gd` includes the draft line and scenario situation, but not `Region A / VTS inactive`. VTS disabled/inactive is visible elsewhere in HUD status, but the required briefing line is missing.

2. Add isolated early-starboard live coaching.

   The UX cue mapping requires the early starboard state to display `Early starboard alteration made.` with approved chips. Current Scenario 2 live coaching displays `Monitor the closing target.` when `early_starboard_detected` is true and no stronger port-to-port/CPA/late/port-risk cue is active. Result status and result feedback include early-starboard text, but the running coaching cue is missing for the isolated early-starboard state.

## Checks Passed

- TASK-0124 Engine report exists and is scoped to local Godot prototype work.
- Scenario 2 remains selectable through the local prototype flow.
- Scenario 2 opening, late-action, port-risk, CPA danger/caution, port-to-port, terminal, and result feedback tests pass.
- Scenario 2 result feedback is driven by exported runtime/result state and hides debug-only numeric values.
- Scenario 1 default boot, selector reselect, briefing/result feedback, decision coaching, reset, and local play loop regressions pass.
- VTS remains disabled/inactive in runtime/HUD coverage.
- Region B remains absent from the reviewed implementation path.
- No player-facing official, certified, legally correct, COLREGS-compliant, final maritime training, public route, deploy, or production claim was found in the tested Scenario 2 player surfaces.
- Scoped worktree review found no `public/`, export, deploy, route, or registry file change for this QA gate.

## Tests

```text
scenario_two_coaching_result_feedback_pack_test: 62 passed, 0 failed
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
scenario_selector_local_flow_test: 51 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
briefing_result_feedback_pack_test: 56 passed, 0 failed
scenario_one_decision_coaching_pack_test: 78 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
```

## Browser And Export

Not run. This QA gate is local Godot headless only.

QA did not run Godot Web export, local browser smoke, production browser smoke, screenshot approval, artifact checks, MIME/header checks, FTP, deploy, hub route, or registry validation.

## Scope Preserved

QA created only:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-review.md
```

QA did not edit code, Godot scenes/scripts/tests, public files, export artifacts, production deploy, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS expansion, Region B, or final maritime training claims.

## Next Expected

Engine follow-up for the two required changes, then QA re-run of the focused Scenario 2 coaching/result feedback test and affected regressions.
