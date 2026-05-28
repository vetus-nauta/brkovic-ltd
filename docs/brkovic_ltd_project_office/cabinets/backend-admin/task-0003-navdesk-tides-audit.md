# Chat Assignment

**Chat ID:** `CHAT-BRK-BACKEND-001`
**Department:** Backend/Admin Integrity
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-BE-003`
**Status:** Assigned / audit-only

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Source Documents

Read first:

```text
docs/brkovic_ltd_project_office/cabinets/backend-admin/README.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/local-qa-ux-smoke-2026-05-27.md
```

Files to inspect:

```text
navdesk.html
navdesk-tides.html
js/navdesk.js
css/navdesk.css
api/tides/search.php
api/tides/forecast.php
api/tides/window.php
api/.htaccess
lang/ru.json
lang/en.json
```

## Task

Audit the NavDesk tides function: search, forecast, passage window, manual/local fallback, production config boundary, day/night/disclaimer interaction, mobile usability risks and current failure modes.

This is audit-only. Do not implement UI changes or API changes.

## Required Checks

- PHP syntax for tides API files.
- Local PHP server smoke for:
  - `api/tides/search.php`
  - `api/tides/forecast.php`
  - `api/tides/window.php`
- Verify local mock behavior versus production private config requirement.
- Inspect JS selectors and state flow for tides widgets.
- Inspect mobile layout and day/night considerations.
- Identify what is missing before MVP and what can wait.

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-audit-2026-05-27.md
```

Required sections:

- summary;
- files checked;
- local API smoke;
- current data flow;
- production/private config boundary;
- UX/mobile risks;
- day-night/disclaimer risks;
- blockers;
- safe next fixes.

## Boundaries

- Do not deploy.
- Do not touch FTP.
- Do not read private provider keys.
- Do not modify production/private configs.
- Do not redesign NavDesk.
- Do not change code in this audit task.

## Required Short Chat Reply

```text
BRK-MVP-BE-003 done.
Report: docs/brkovic_ltd_project_office/reports/navdesk-tides-audit-2026-05-27.md
Scope preserved: audit-only, no production, no secrets, no code changes.
```
