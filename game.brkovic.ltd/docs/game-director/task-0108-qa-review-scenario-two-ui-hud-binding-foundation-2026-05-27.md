# TASK-0108 - QA Review Scenario 2 UI/HUD Binding Foundation

**Chat ID:** CHAT-QA-001  
**Department:** Maritime QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-ui-hud-binding-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-runtime-state-export-orchestrator-integration-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/roles/localization-language-lead/rules.md`

## Task

Review TASK-0107 as a QA gate.

Confirm whether Scenario 2 UI/HUD binding foundation is approved for the next Scenario 2 playable-scene planning slice.

## Required Checks

Confirm:

- Scenario 2 briefing uses approved draft/non-final wording.
- Scenario 2 active coaching uses one primary cue plus no more than two chips.
- Scenario 2 HUD reads Engine-owned `snapshot["scenario_two"]` as display-only.
- HUD does not compute encounter class, pass relationship, CPA/TCPA, warnings, safe-water, or result state.
- HUD does not read or display `snapshot["qa"]["scenario_two_debug"]`.
- Player-facing HUD does not expose numeric CPA/TCPA, raw geometry, thresholds, legal rule numbers, replay seed/tolerance, official/certified/COLREGS-compliant/legal correctness claims, VTS popup, Region B, or final maritime training claims.
- Scenario 1 HUD binding remains preserved.

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_hud_binding_readability_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_hud_binding_readability_pack.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_runtime_state_export_orchestrator.gd
```

If feasible, run the full headless regression set.

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-ui-hud-binding-foundation-review.md
```

Status must be one of:

```text
approved-for-next-slice
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not implement playable Scenario 2.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, FTP, VTS, Region B, or final maritime training claims.
