# TASK-0120 - Controlled Production Deploy Scenario Selector Build

**Chat ID:** CHAT-GD-001 / Platform Deploy  
**Department:** Watch Officer / Platform Deploy  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-selector-review.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-scenario-selector-report.md`

## Task

Deploy the approved Watch Officer Scenario 1 / Scenario 2 selector build to production.

## Production Path

Deploy only the files from:

```text
game.brkovic.ltd/public/play/watch-officer/
```

to the matching production path for:

```text
https://game.brkovic.ltd/play/watch-officer/
```

## Required Checks

- Pre-upload artifact check.
- Upload only approved Watch Officer files.
- Preserve `.htaccess` with COOP/COEP and MIME rules.
- Verify production HTTP 200 for required files.
- Verify production headers/MIME for `index.html`, `.js`, `.wasm`, `.pck`.
- Verify browser smoke for selector:
  - non-empty canvas;
  - Scenario 1 default;
  - Scenario 2 selectable;
  - reset preserves Scenario 2;
  - Scenario 1 reselect;
  - draft/non-final and Region A/VTS inactive wording;
  - forbidden claims absent.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-selector-report.md
```

## Boundaries

- Do not touch Captain Ether, Nav Desk, hub route, registry, auth, unrelated production config, VTS, Region B, or final maritime training claims.
- Do not write secrets, FTP credentials, cookies, sessions, private config, or identity data into reports.
