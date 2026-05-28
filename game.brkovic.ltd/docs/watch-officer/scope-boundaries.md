# Watch Officer Scope Boundaries

**Status:** Updated after public prototype smoke  
**Owner:** Game Director  
**Date:** 2026-05-26

## Approved Direction

Watch Officer is a scenario-based decision simulator, not an arcade game and not a full maritime simulator.

## Current Approved State

Watch Officer has a public production prototype live at:

```text
https://game.brkovic.ltd/play/watch-officer/
```

The game hub/brief route remains:

```text
https://game.brkovic.ltd/games/watch-officer
```

The prototype remains draft/non-final training content.

## Allowed For Next Prototype Increment

- Product docs.
- Rule reports.
- UI/HUD reports.
- Technical architecture reports.
- QA validation checklists.
- Static route/card in game hub.
- Narrow improvements to the existing Scenario 1 playable loop after Game Director assignment.
- Local Godot prototype changes after Engine assignment.
- Export/deploy only after QA and Game Director approval.

## Not Allowed Without New Approval

- New Watch Officer API endpoints.
- Unverified maritime rule implementation.
- Large open-world map.
- Random traffic systems.
- Full physics.
- Radar/night mode implementation.
- New platform auth changes.
- Rewrites of Captain Ether.
- New auth work.
- New production deploy.
- Final maritime training claims.

## Required Approvals For Any New Production Increment

1. Game Director task assignment.
2. Role report/specification when needed.
3. Engine implementation report when code changes.
4. QA review.
5. Export/deploy decision if production changes are needed.

## Integration Boundaries

Captain Ether is the active first game. Its content, endpoints, scoring, and Lost Oars loop are outside Watch Officer scope.

Nav Desk integration is route-level only unless assigned separately.
