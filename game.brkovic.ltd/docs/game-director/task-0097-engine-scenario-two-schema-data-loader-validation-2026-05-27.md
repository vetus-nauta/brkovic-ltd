# TASK-0097 - Engine Scenario 2 Schema / Data / Loader Validation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md`

## Task

Implement only the first Scenario 2 Engine slice:

```text
schema/data/loader validation
```

## Allowed Scope

- Add Scenario 2 draft JSON data.
- Narrowly generalize scenario schema for Scenario 1 and Scenario 2.
- Narrowly generalize Godot scenario loader validation for Scenario 1 and Scenario 2.
- Add or update headless loader tests.
- Preserve Scenario 1 regression.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-schema-data-loader-validation-report.md
```

## Required Tests

Run at minimum:

```text
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Also run a JSON parse check for:

- `data/scenarios/safe-water-crossing-target.json`;
- `data/scenarios/head-on-port-to-port.json`;
- `data/schemas/scenario.schema.json`.

## Boundaries

- Do not implement playable Scenario 2.
- Do not implement UI/HUD.
- Do not implement head-on classifier runtime.
- Do not implement port-to-port pass detection.
- Do not implement warnings/results beyond loader/data contract validation.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.

## Result

Report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-schema-data-loader-validation-report.md
```

Tests:

```text
JSON parse check: 3 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
full headless regression: passed, 0 failed
```
