# TASK-0046 - QA Review Warning Escalation Foundation

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/warning-escalation-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-safe-water-geometry-monitor-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Review TASK-0045 from QA side.

Confirm whether the warning escalation foundation is acceptable before scenario result evaluation, playable scenes, or UI implementation.

Check specifically:

- all prior headless tests pass;
- warning escalation foundation test passed with `127 passed, 0 failed`;
- no-warning baseline returns no active warning;
- corridor buffer maps to caution `warning.leaving_safe_water`;
- shallow buffer maps to caution `warning.shallow_water`;
- shallow maps to danger `warning.shallow_water`;
- grounded maps to immediate `warning.grounding`;
- CPA/TCPA caution/danger/immediate warnings only activate when CPA/TCPA is active;
- priority ordering matches TASK-0045;
- duplicate source warnings are deduplicated deterministically;
- repeated calls with same input return same ordered warnings;
- `started_tick`, `updated_tick`, and `cleared_tick` behaviour is deterministic;
- warning output does not mutate `safe_water`, `cpa_tcpa`, ownship, target, or scenario result;
- scenario result remains `ready`;
- no warning/result event semantics were opened beyond this foundation slice;
- no result evaluation, collision checks, movement, safe-water geometry computation, CPA/TCPA computation, playable scene, UI, public route, Captain Ether, Nav Desk, auth, production config, or final maritime training claim is implied.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-warning-escalation-foundation-review.md
```

The review must state one of:

- `approved-for-next-engine-slice`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not implement runtime code.
- Do not implement gameplay.
- Do not create playable scenes.
- Do not implement UI.
- Do not change Engine code unless there is a blocking QA defect.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
