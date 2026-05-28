# TASK-0098 - QA Review Scenario 2 Schema / Data / Loader Validation

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-schema-data-loader-validation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md`

## Task

Review TASK-0097 as a QA gate.

Confirm whether Scenario 2 schema/data/loader validation is approved for the next Engine slice:

```text
Scenario 2 head-on classifier and event logging foundation
```

## Required Checks

Confirm:

- Scenario 1 loader regression is preserved.
- Scenario 2 draft data loads.
- Scenario 2 uses `iala_region: "A"`.
- Scenario 2 keeps `rule_review_status: "draft"`.
- Scenario 2 keeps `training_claim_status: "draft_not_final_training_content"`.
- Scenario 2 keeps VTS disabled.
- Scenario 2 has one power-driven target vessel.
- Scenario 2 target has `heading_relation: "reciprocal_or_nearly_reciprocal"`.
- Scenario 2 encounter contract is `head_on` / `head_on_alter_starboard`.
- Scenario 2 replay metadata uses fixed tick, input log, event log, and `event_timing_tolerance_ticks: 1`.
- Loader produces blocking errors for invalid Scenario 2 contract fields.
- No playable Scenario 2, UI/HUD, export, public copy, deploy, VTS, Region B, or final maritime training claim was introduced.

## Required Tests

Run at minimum:

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

If feasible, run the existing headless regression set under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/tests/
```

Do not run export/browser/deploy checks for this task.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-two-schema-data-loader-validation-review.md
```

Status must be one of:

```text
approved-for-next-engine-slice
changes-required
blocked
```

## Boundaries

- Do not edit implementation code.
- Do not edit scenario data unless reporting a required change.
- Do not implement head-on classifier runtime.
- Do not implement UI/HUD.
- Do not implement playable Scenario 2.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.
