# TASK-0021 - QA Review Scenario Loader Test Plan

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

- `game.brkovic.ltd/docs/new-chat-handoff-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director-dashboard-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director/task-registry.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director/scenario-schema-validation-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-test-plan.md`

## Task

Review `scenario-loader-test-plan.md` as QA.

Confirm whether the plan is sufficient before Engine implements a Godot-side loader test.

Check specifically:

- positive load test covers all approved scenario 1 blockers;
- negative tests are enough to catch wrong Region, VTS, target count, crossing side, lateral marks, geometry, replay metadata, and draft-status violations;
- error contract is deterministic and QA-readable;
- QA can reproduce failures without editing the canonical source JSON;
- no gameplay, playable scene, public route, Captain Ether, Nav Desk, auth, or production config work is implied.

## Required Output

Create a concise QA review note:

```text
game.brkovic.ltd/docs/watch-officer/scenario-loader-test-plan-qa-review.md
```

The note must state one of:

- `approved-for-loader-implementation`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

## Boundaries

- Do not implement loader code.
- Do not implement gameplay.
- Do not create playable Godot scenes.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
