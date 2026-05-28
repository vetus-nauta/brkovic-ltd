# TASK-0106 - QA Review Scenario 2 Runtime State Export / Orchestrator Integration Foundation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-orchestrator-integration-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-port-to-port-pass-early-starboard-event-foundation-review.md`

## Task

Review TASK-0105 as a QA gate.

Confirm whether Scenario 2 runtime state export / orchestrator integration foundation is approved for the next Engine/UI planning slice.

## Required Checks

Confirm:

- Scenario 1 runtime step behavior is preserved.
- Scenario 2 runtime state branch exists.
- Scenario 2 snapshot branch exists.
- Scenario 2 QA/debug branch exists under `snapshot["qa"]`.
- Scenario 2 orchestrator route uses Scenario 2 classifier/detector modules.
- Display snapshot does not expose debug object.
- VTS remains disabled/inactive.
- No UI/HUD, playable scene, export, deploy, VTS, Region B, or final maritime training claim was introduced.

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_runtime_state_export_orchestrator.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_step_orchestrator.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
```

If feasible, run the full headless regression set.

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-runtime-state-export-orchestrator-integration-foundation-review.md
```

Status must be one of:

```text
approved-for-next-slice
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not implement UI/HUD.
- Do not implement playable Scenario 2.
- Do not change result evaluation semantics.
- Do not change warning escalation semantics.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.
