# TASK-0126 - Engine Fix Scenario 2 Coaching + Result Feedback QA Findings

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-28  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md`

## Task

Fix the two QA findings from `TASK-0125`:

1. Scenario 2 ready briefing must show:

```text
Region A / VTS inactive
```

2. Isolated early-starboard live coaching must show:

```text
Early starboard alteration made.
```

with approved chips when `early_starboard_detected` is true and no stronger cue is active.

## Allowed Files

- `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_coaching_result_feedback_pack.gd`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-qa-fix-report.md`

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-qa-fix-report.md
```

Status must be one of:

```text
passed
changes-required
blocked
```

## Boundaries

- Do not export.
- Do not deploy.
- Do not use FTP.
- Do not edit public files.
- Do not touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS expansion, Region B, or final maritime training claims.

## Required Chat Reply

```text
TASK-0126 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-qa-fix-report.md
Tests:
- <focused_test>: <N> passed, 0 failed
Scope preserved:
- public files, deploy, Captain Ether, Nav Desk, auth, VTS, Region B, final training claims not touched.
Next expected: QA rerun.
```
