# Task 0015 - PWA Install Reminder Smoke

**Task ID:** `BRK-MVP-QAUX-015`
**Owner:** `CHAT-BRK-QA-UX-001`
**Status:** `Backlog`
**Date:** `2026-05-30`
**Depends on:** `BRK-MVP-FE-022`

## Goal

Validate the Vetus Nauta PWA install hint and modal after frontend implementation.

## Scope

Test local/staged public pages only. Do not edit code and do not deploy.

Minimum surfaces:

```text
index.html
journal.html
navdesk.html
navdesk-watch.html
services/yacht-management.html
services/iyt-training.html
```

Viewports:

```text
desktop
tablet
mobile
```

## Checks

1. Fresh browser first paint does not show the large PWA modal.
2. Hint appears after 35% scroll or 45 seconds active viewing.
3. Close button suppresses automatic hint immediately and across reload.
4. Simulated 3 distinct visit days in a 7-day window allows a new automatic reminder.
5. Menu item opens PWA modal even while automatic reminder is suppressed.
6. Escape, overlay, close button, and "continue in browser" close modal cleanly.
7. Installed/standalone simulation suppresses automatic hint/modal.
8. iOS/iPad path shows manual Share -> Add to Home Screen instructions.
9. Android/Chrome path uses system install prompt when `beforeinstallprompt` is available, otherwise shows Android instructions.
10. PWA UI does not overlap or block:
    - auth modal / `ensureToolAccess`;
    - language modal;
    - NavDesk disclaimer;
    - yacht-management disclaimer;
    - journal read/comments flow.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/qa-pwa-install-reminder-smoke-2026-05-30.md
```

## Acceptance Criteria

PASS only if the flow is non-repetitive, manually reachable from menu, visually consistent, and removable without touching backend or content.

Required short reply:

```text
BRK-MVP-QAUX-015 done.
Report: docs/brkovic_ltd_project_office/reports/qa-pwa-install-reminder-smoke-2026-05-30.md
Tests:
- desktop/tablet/mobile PWA flow smoke
Scope preserved:
- product code, backend, FTP, database not touched.
Next expected: Director gate decision.
```
