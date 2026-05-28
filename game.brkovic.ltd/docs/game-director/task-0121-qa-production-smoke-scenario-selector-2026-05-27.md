# TASK-0121 - QA Production Smoke Scenario Selector

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

- `game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-selector-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-review.md`

## Task

Run production smoke against:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

## Required Checks

Confirm:

- public route HTTP 200;
- play route HTTP 200;
- required Godot artifacts HTTP 200;
- COOP/COEP and MIME headers are present;
- browser loads non-empty canvas;
- selector defaults to Scenario 1;
- Scenario 2 selectable;
- reset preserves Scenario 2;
- Scenario 1 reselect works;
- draft/non-final and Region A/VTS inactive wording visible;
- forbidden final/certified/legal/COLREGS-compliant claims absent;
- Captain Ether route remains HTTP 200.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-review.md
```

Status must be one of:

```text
approved-public-prototype-live
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not deploy.
- Do not use FTP.
- Do not touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.
