# TASK-0102 - Engine Scenario 2 Port-To-Port Pass / Early Starboard Event Foundation

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
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-head-on-classifier-event-log-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`

## Task

Implement the next narrow Scenario 2 Engine slice:

```text
port-to-port pass detection and early starboard alteration event foundation
```

## Allowed Scope

- Add a Scenario 2 specific event detector module.
- Detect early starboard alteration from deterministic input/heading history data.
- Detect port-to-port pass foundation from controlled pass-side geometry data.
- Add deterministic event names and payloads.
- Add focused headless tests for valid and invalid inputs.
- Preserve Scenario 1 regression and Scenario 2 classifier regression.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-port-to-port-pass-early-starboard-event-foundation-report.md
```

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_head_on_classifier_event_log.gd
```

Add and run a focused Scenario 2 port-to-port / early starboard event test.

If feasible, run full headless regression.

## Boundaries

- Do not implement playable Scenario 2.
- Do not implement UI/HUD.
- Do not change result evaluation.
- Do not change warning escalation.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.

## Result

Report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-port-to-port-pass-early-starboard-event-foundation-report.md
```

Tests:

```text
scenario_loader_test: 121 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed
scenario_two_pass_event_detector_test: 30 passed, 0 failed
full headless regression: passed, 0 failed
```
