# Prototype Scaffolding Readiness

**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Ready for explicit scaffolding task

## Result

Engine and QA confirmed that `first-scenario-decision-pack-2026-05-26.md` removes blockers for preparing a prototype scaffolding task.

No critical contradiction was found.

## Boundary

This readiness note is not itself a command to create files. Prototype scaffolding requires an explicit task.

## Required Scaffolding Conditions

1. Create structure outside public runtime and outside Captain Ether:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

2. Scenario 1 data contract:

```json
{
  "iala_region": "A",
  "rule_review_status": "draft"
}
```

Scenario 1 must include:

- one Region A lateral pair;
- one deterministic power-driven crossing target from starboard;
- VTS disabled.

3. Engine validation must reject missing or non-`"A"` `iala_region` values and log draft/non-final status.

4. Deterministic replay/logging foundation must include:

- fixed tick;
- seed;
- input log;
- event log;
- numeric CPA/TCPA debug values;
- target replay tolerance of +/- 1 fixed tick.

5. UI/Engine separation must be preserved:

- Engine owns encounter class, player role, CPA/TCPA state, warnings, and scenario result.
- UI renders exported state only.
