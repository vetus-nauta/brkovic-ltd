# Watch Officer Decision Coaching Staged Public Decision

**Decision ID:** GD-20260527-33  
**Date:** 2026-05-27  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for staged public candidate update  
**Product:** Watch Officer

## Decision

Approve a local repository staged public candidate update for the Watch Officer `Scenario 1 Decision Coaching Pack`.

This approval allows preparing a staged public candidate from the QA-approved local Web export:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

to the local staged public path:

```text
game.brkovic.ltd/public/play/watch-officer/
```

## Reason

TASK-0085 QA rerun confirmed the opening lateral-pair cue is visible in the exported browser build:

```text
Read the lateral pair. Stay in the marked corridor.
```

QA observed the cue through the early-running hold window at tick `36` / time `1.80s`, confirmed normal later-running target monitoring, verified reset behavior, VTS inactive state, no debug leaks, no final-training claims, and preserved local-only scope.

## Required Work Split

1. Engine prepares an artifact handoff manifest.
2. Platform updates the local staged public candidate from the approved handoff.
3. QA reviews the staged public candidate before any production deploy decision.

## Not Approved

This is not approval for:

- production deploy;
- FTP upload;
- production server changes;
- final maritime training content;
- official, certified, or COLREGS-compliant claims;
- new scenario;
- VTS for scenario 1;
- auth changes;
- Captain Ether changes;
- Nav Desk changes;
- router/registry changes unless explicitly needed to preserve the existing Watch Officer launch route.

## Required Preservation

Keep:

- `/games/watch-officer` as the game hub/brief route;
- `/play/watch-officer/` as the Godot Web build route;
- draft/non-final training wording;
- VTS disabled/inactive;
- Scenario 1 only;
- Godot artifacts isolated under `public/play/watch-officer/`.

## Source Basis

- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/game-director/task-0085-qa-rerun-local-web-export-opening-cue-smoke-2026-05-27.md`
