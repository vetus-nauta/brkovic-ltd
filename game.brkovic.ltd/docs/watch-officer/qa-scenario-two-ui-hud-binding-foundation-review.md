# QA Scenario 2 UI/HUD Binding Foundation Review

**Task:** TASK-0108
**Owner:** CHAT-QA-001 / Maritime QA
**Date:** 2026-05-27
**Status:** approved-for-next-slice

## Result

TASK-0107 is approved for the next Scenario 2 playable-scene planning slice.

The Scenario 2 UI/HUD binding foundation remains a display-only HUD layer over Engine-owned Scenario 2 runtime snapshot state. No playable Scenario 2 route, export, public candidate, deploy, or final maritime training claim is approved by this review.

## Checks

- Scenario 2 briefing uses the approved draft/non-final title, situation, objective, and limitation wording.
- Scenario 2 active coaching uses one primary cue plus no more than two chips.
- Scenario 2 player-facing cues are scenario-specific and remain draft/non-final.
- Scenario 2 HUD reads `runtime_snapshot["scenario_two"]` for encounter, early starboard, and port-to-port display state.
- HUD binder does not import or call simulation modules for Scenario 2 classifier, pass detector, CPA/TCPA solver, warning escalation, safe-water, or result evaluation.
- HUD binder does not read or display `snapshot["qa"]["scenario_two_debug"]`.
- Player-facing Scenario 2 briefing, coaching, result status, and result feedback do not expose numeric CPA/TCPA, raw geometry, debug separation, thresholds, legal rule numbers, replay seed/tolerance, official/certified/COLREGS-compliant/legal correctness claims, VTS popup, Region B, or final maritime training claims.
- Scenario 1 HUD binding remains preserved.

## Evidence

- `hud_snapshot_binder.gd` Scenario 2 briefing and coaching use approved Scenario 2 copy and capped chips.
- `hud_snapshot_binder.gd` Scenario 2 result/status labels bind qualitative snapshot fields only.
- Source scan found no `scripts/sim/`, `ScenarioTwoHeadOnClassifier`, `ScenarioTwoPassEventDetector`, or `CpaTcpaDebugSolver` use in HUD binder.
- Source scan found no `scenario_two_debug` use in HUD binder.
- Scenario 2 focused HUD test excludes debug geometry and prohibited claims from player-facing text.
- Scenario 1 focused HUD test still passes and confirms HUD read does not mutate runtime snapshot.
- Scenario 2 runtime export test confirms `snapshot["scenario_two"]` exists, display snapshot excludes `scenario_two.debug`, and QA debug remains only under `snapshot["qa"]["scenario_two_debug"]`.

## Tests

Required local tests:

```text
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
hud_binding_readability_pack_test: 43 passed, 0 failed
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
```

Full headless regression was not rerun for TASK-0108. TASK-0107 documented the full regression pass, and this QA gate locally re-confirmed the focused Scenario 2 HUD, Scenario 1 HUD preservation, and Scenario 2 runtime export coverage required by TASK-0108.

## Non-Blocking Note

The existing shared QA/debug status section still displays deterministic QA seed/tick tolerance values as a visibly separated debug/non-final status surface inherited from the Scenario 1 HUD foundation. This review treats it as QA/debug status, not Scenario 2 player-facing briefing/coaching/result copy. It does not read or expose `snapshot["qa"]["scenario_two_debug"]`.

## Blockers

None.

## Scope Preserved

QA did not edit code, implement playable Scenario 2, run export/browser/deploy checks, edit `public/`, or touch Captain Ether, Nav Desk, router/registry, auth, production config, FTP, VTS, Region B, or final maritime training claims.

## Next Expected

Game Director may assign the next Scenario 2 playable-scene planning slice.
