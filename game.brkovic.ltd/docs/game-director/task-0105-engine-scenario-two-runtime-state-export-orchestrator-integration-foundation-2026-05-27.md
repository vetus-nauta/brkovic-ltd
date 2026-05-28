# TASK-0105 - Engine Scenario 2 Runtime State Export / Orchestrator Integration Foundation

**Chat ID:** CHAT-ENGINE-001
**Department:** Engine / Godot Architect
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer
**Date:** 2026-05-27
**Status:** Passed

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-port-to-port-pass-early-starboard-event-foundation-review.md`

## Task

Implement the next narrow Scenario 2 Engine slice:

```text
runtime state export and orchestrator integration foundation
```

## Allowed Scope

- Add Scenario 2 runtime state branch.
- Export Scenario 2 display-safe snapshot branch.
- Export Scenario 2 QA/debug snapshot branch.
- Route Scenario 2 runtime step through Scenario 2 classifier and detector modules.
- Preserve Scenario 1 runtime behavior and tests.
- Add focused headless test.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-orchestrator-integration-foundation-report.md
```

## Boundaries

- Do not implement playable Scenario 2.
- Do not implement UI/HUD.
- Do not change result evaluation semantics.
- Do not change warning escalation semantics.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.

## Result

Report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-orchestrator-integration-foundation-report.md
```

Tests:

```text
scenario_two_runtime_state_export_orchestrator_test: 27 passed, 0 failed
runtime_step_orchestrator_test: 43 passed, 0 failed
runtime_bootstrap_test: 27 passed, 0 failed
full headless regression: passed, 0 failed
```
