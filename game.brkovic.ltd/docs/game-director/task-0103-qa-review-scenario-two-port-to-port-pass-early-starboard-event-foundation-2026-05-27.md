# TASK-0103 - QA Review Scenario 2 Port-To-Port Pass / Early Starboard Event Foundation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-port-to-port-pass-early-starboard-event-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-head-on-classifier-event-log-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`

## Task

Review TASK-0102 as a QA gate.

Confirm whether Scenario 2 port-to-port pass / early starboard event foundation is approved for the next Engine slice.

## Required Checks

Confirm:

- Detector is Scenario 2 specific.
- Early starboard alteration detection uses scenario action window.
- Late starboard action is rejected.
- Port turn is rejected as early starboard alteration.
- Port-to-port achievement requires controlled `port_to_port` relationship.
- Unsafe CPA/collision conditions do not achieve pass.
- Deterministic event types are present:

```text
scenario_two_early_starboard_alteration_detected
scenario_two_port_to_port_pass_achieved
```

- Event payloads are deterministic and contain no player identity, private data, or final maritime training claim.
- No playable Scenario 2, UI/HUD, result evaluation change, warning escalation change, export, public copy, deploy, VTS, Region B, or final maritime training claim was introduced.

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_encounter_classifier.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_head_on_classifier_event_log.gd
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_two_pass_event_detector.gd
```

If feasible, run the full headless regression set.

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-port-to-port-pass-early-starboard-event-foundation-review.md
```

Status must be one of:

```text
approved-for-next-engine-slice
changes-required
blocked
```

## Boundaries

- Do not edit implementation code.
- Do not implement UI/HUD.
- Do not implement playable Scenario 2.
- Do not change result evaluation.
- Do not change warning escalation.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.
