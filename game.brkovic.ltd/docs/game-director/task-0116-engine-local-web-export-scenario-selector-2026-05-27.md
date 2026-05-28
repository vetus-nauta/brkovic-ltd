# TASK-0116 - Engine Local Web Export Scenario Selector Build

**Chat ID:** CHAT-GD-001 / Engine Integration  
**Department:** Watch Officer / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-selector-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-scenario-selector-implementation-report.md`

## Task

Run local Web export for the Watch Officer build that includes the local Scenario 1 / Scenario 2 selector.

## Required Checks

- Run focused headless tests before export.
- Export using existing Godot Web preset.
- Keep artifacts under prototype `exports/`.
- Do not copy artifacts to `public/`.
- Do not deploy.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-selector-report.md
```

## Boundaries

- Local export only.
- Do not edit `public/`.
- Do not deploy.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
