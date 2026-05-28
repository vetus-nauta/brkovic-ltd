# TASK-0020 - Scenario Loader Test Plan

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
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

## Prototype Path

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/new-chat-handoff-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director-dashboard-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director/task-registry.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director/scenario-schema-validation-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`

## Task

Prepare a scenario loader test plan for Watch Officer prototype scaffold.

The plan must define how Godot-side loading will verify:

- scenario JSON can be found at `data/scenarios/safe-water-crossing-target.json`;
- schema-critical fields are present before runtime use;
- `iala_region` exists and equals `"A"`;
- `rule_review_status` exists and equals `"draft"`;
- VTS is disabled for scenario 1;
- exactly one target vessel exists;
- target vessel crossing side is `starboard`;
- Region A port and starboard lateral marks are present;
- safe corridor and shallow zones are present;
- no hard danger polygon is required for scenario 1;
- replay metadata includes fixed tick, seed, input log, event log, and tolerance of `1` fixed tick;
- loader failure messages are deterministic and QA-readable.

## Required Output

Create a concise report:

```text
game.brkovic.ltd/docs/watch-officer/scenario-loader-test-plan.md
```

The report must include:

1. Proposed Godot file locations for the future loader test.
2. Loader responsibilities and non-responsibilities.
3. Pass/fail checklist.
4. Failure cases QA must be able to trigger.
5. Confirmation that no gameplay implementation is included.

## Boundaries

- Do not implement gameplay.
- Do not create playable Godot scenes.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
- Do not use the deprecated `/home/alexey/GitHub/Revoyacht/game-brkovic-ltd` path.
