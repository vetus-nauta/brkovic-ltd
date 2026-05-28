# TASK-0124 - Engine Scenario 2 Coaching + Result Feedback Pack

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

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-ux-spec.md` when available

## Task

Implement or confirm the local-only Scenario 2 Coaching + Result Feedback Pack in the Godot prototype.

If current implementation already satisfies the sprint intent, strengthen focused coverage and report that no production/export work was needed. If a small local-only refinement is needed, implement it narrowly.

## Allowed Files

- `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_two_coaching_result_feedback_pack.gd`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md`

## Required Checks

Confirm:

- Scenario 2 briefing uses approved draft/non-final wording.
- Scenario 2 running coaching gives a clear early-starboard cue.
- Coaching chips remain capped and do not expose debug-only data.
- Scenario 2 result feedback reports early starboard and port-to-port status in player-safe language.
- Scenario 1 briefing/coaching/result feedback remains preserved.
- VTS remains disabled/inactive.
- Region B remains absent.
- No final/certified/official/legal/COLREGS-compliant claim appears.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md
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
TASK-0124 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md
Tests:
- <focused_test>: <N> passed, 0 failed
Scope preserved:
- public files, deploy, Captain Ether, Nav Desk, auth, VTS, Region B, final training claims not touched.
Next expected: QA review.
```
