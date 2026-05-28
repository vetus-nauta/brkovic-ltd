# Watch Officer Decision Coaching Local Export Decision

**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for local Web export  
**Product:** Watch Officer  

## Decision

Approve local Web export of the Watch Officer `Scenario 1 Decision Coaching Pack`.

Engine may export the local Godot prototype to:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Reason

TASK-0081 QA approved the local implementation for export decision. QA confirmed coaching appears during running, clears in ready/reset, respects the `1` primary cue plus `2` chips cap, uses Engine-owned state, remains display-only, hides numeric/debug data from player-facing surfaces, keeps VTS disabled, and introduces no new scenario, VTS popup, maritime rule, or final-training claim.

## Approved Scope

Engine may:

- run the full headless regression;
- run Godot Web export for the existing local prototype;
- update only prototype-local export artifacts under `prototypes/watch-officer-godot/exports/web-local/`;
- create a local export report.

## Not Approved

This decision does not approve:

- copying files to `game.brkovic.ltd/public/`;
- production deploy;
- FTP;
- Captain Ether changes;
- Nav Desk changes;
- router/registry changes;
- auth changes;
- production config changes;
- new scenario;
- VTS activation;
- final maritime training claims.

## Required Next Output

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md
```

## Related Files

- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
