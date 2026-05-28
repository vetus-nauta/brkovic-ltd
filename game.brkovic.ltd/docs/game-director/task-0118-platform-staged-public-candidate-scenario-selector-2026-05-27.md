# TASK-0118 - Platform Staged Public Candidate Scenario Selector Build

**Chat ID:** CHAT-GD-001 / Platform Local Integration  
**Department:** Watch Officer / Platform  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-selector-report.md`

## Task

Update the local staged public candidate under:

```text
game.brkovic.ltd/public/play/watch-officer/
```

Use approved local Web export artifacts from:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Required Checks

- Copy approved export artifacts only.
- Preserve `.htaccess` with COOP/COEP and MIME rules.
- Confirm required files exist.
- Confirm no `.import` files are copied.
- Confirm `public/` update is limited to `public/play/watch-officer/`.
- Confirm no deploy/FTP.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/staged-public-scenario-selector-report.md
```

## Boundaries

- Local staged public candidate only.
- Do not deploy.
- Do not use FTP.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.
