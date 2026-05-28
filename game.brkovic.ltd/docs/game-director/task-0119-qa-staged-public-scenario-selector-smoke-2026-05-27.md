# TASK-0119 - QA Staged Public Scenario Selector Smoke

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

- `game.brkovic.ltd/docs/watch-officer/staged-public-scenario-selector-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-review.md`

## Task

Run staged public candidate smoke against:

```text
game.brkovic.ltd/public/play/watch-officer/
```

## Required Checks

Confirm:

- required staged files exist;
- `.htaccess` has COOP/COEP and MIME rules;
- no `.import` files are present;
- local HTTP/header smoke passes with Godot Web headers;
- browser loads non-empty canvas;
- selector default Scenario 1;
- Scenario 2 selectable;
- reset preserves Scenario 2;
- Scenario 1 reselect works;
- draft/non-final and Region A/VTS inactive wording visible;
- forbidden final/certified/legal/COLREGS-compliant claims absent;
- no deploy/FTP/production server touched.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-review.md
```

Status must be one of:

```text
approved-for-production-deploy-decision
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not deploy.
- Do not use FTP.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.
