# TASK-0107 - UI/HUD Scenario 2 Binding Foundation

**Chat ID:** CHAT-GD-001 / ШЕФ ПРОЕКТА Watch Officer  
**Department:** Game Director / UI-HUD Integration  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Passed

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-runtime-state-export-orchestrator-integration-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/roles/localization-language-lead/rules.md`

## Task

Bind Scenario 2 player-facing HUD copy to Engine-owned `runtime_snapshot["scenario_two"]` as a narrow display-only foundation.

## Implementation Scope

- Scenario 2 briefing text.
- Scenario 2 active coaching cue/chips.
- Scenario 2 result status lines.
- Scenario 2 result feedback reasons.
- Display-only safety checks.

## Boundaries

- Do not compute encounter class in HUD.
- Do not compute CPA/TCPA in HUD.
- Do not compute pass relationship in HUD.
- Do not read `snapshot["qa"]["scenario_two_debug"]` in HUD.
- Do not show numeric CPA/TCPA, debug geometry, thresholds, legal rule numbers, final/certified/official claims, VTS popup, Region B, or final maritime training claims.
- Do not implement playable Scenario 2 route.
- Do not export, deploy, edit `public/`, or touch Captain Ether, Nav Desk, router/registry, auth, production config, or FTP.

## Output

Report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-ui-hud-binding-foundation-report.md
```
