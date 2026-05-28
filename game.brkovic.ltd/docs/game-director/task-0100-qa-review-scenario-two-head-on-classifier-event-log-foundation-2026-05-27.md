# TASK-0100 - QA Review Scenario 2 Head-On Classifier / Event Log Foundation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-classifier-event-log-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-schema-data-loader-validation-review.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`

## Task

Review TASK-0099 as a QA gate.

Confirm whether Scenario 2 head-on classifier / event log foundation is approved for the next Engine slice.

## Required Checks

Confirm:

- Scenario 2 classifier is scenario-specific and does not replace Scenario 1 classifier.
- Scenario 1 classifier regression is preserved.
- Classifier returns `head_on` and `head_on_alter_starboard` only for the controlled Scenario 2 contract.
- Invalid Scenario 2 inputs reject to `ambiguous` / `none`.
- Deterministic event type is present:

```text
scenario_two_head_on_initial_classified
```

- Event payload is deterministic and contains no player identity, private data, or final maritime training claim.
- No playable Scenario 2, UI/HUD, export, public copy, deploy, VTS, Region B, or final maritime training claim was introduced.

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_head_on_classifier_event_log.gd
```

If feasible, run the existing headless regression set under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/
```

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-head-on-classifier-event-log-foundation-review.md
```

Status must be one of:

```text
approved-for-next-engine-slice
changes-required
blocked
```

## Boundaries

- Do not edit implementation code.
- Do not implement port-to-port pass detection.
- Do not implement UI/HUD.
- Do not implement playable Scenario 2.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.
