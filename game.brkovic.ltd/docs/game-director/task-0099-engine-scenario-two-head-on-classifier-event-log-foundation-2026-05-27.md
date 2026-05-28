# TASK-0099 - Engine Scenario 2 Head-On Classifier / Event Log Foundation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-schema-data-loader-validation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-schema-data-loader-validation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`

## Task

Implement the next narrow Scenario 2 Engine slice:

```text
head-on classifier and event logging foundation
```

## Allowed Scope

- Add a Scenario 2 specific classifier module for the draft head-on contract.
- Use existing loader data and runtime-neutral geometry fields where available.
- Classify only Scenario 2 initial encounter as:
  - `encounter_class: "head_on"`
  - `player_role: "head_on_alter_starboard"`
  - `draft_training_logic: true`
- Add deterministic event log names/payloads for initial Scenario 2 classification.
- Add focused headless tests for valid and invalid Scenario 2 classifier inputs.
- Preserve Scenario 1 classifier regression.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-classifier-event-log-foundation-report.md
```

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
```

Add and run the new Scenario 2 classifier/event log test.

If feasible, run the full headless regression set under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/
```

## Boundaries

- Do not implement playable Scenario 2.
- Do not implement UI/HUD.
- Do not implement port-to-port pass detection.
- Do not implement result evaluation changes.
- Do not implement warning escalation changes unless only adding inert event names required by this slice.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.

## Result

Report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-classifier-event-log-foundation-report.md
```

Tests:

```text
scenario_loader_test: 121 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed
full headless regression: passed, 0 failed
```
