# Chat Assignment

**Chat ID:** `CHAT-BRK-BACKEND-001`
**Department:** Backend/Admin Integrity
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-BE-001`
**Status:** Assigned

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Source Documents

Read first:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md
docs/brkovic_ltd_project_office/cabinets/backend-admin/README.md
docs/brkovic_ltd_project_office/cabinets/seo-i18n/task-0002-ai-multilingual-admin-architecture.md
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
```

## Task

Understand your Backend/Admin role and audit all local backend/admin/API boundaries before MVP upload.

Check:

- PHP syntax;
- JS syntax for admin/API-facing scripts;
- contact form runtime/server-only files;
- `admin-api-proxy.php` allowed routes;
- journal API assumptions;
- journal translation schema and many-language readiness;
- OpenAI/server-side boundary for future AI language desk;
- management admin API and data file permissions;
- NavDesk tide API behavior and server config dependency;
- delivery distance API method/config dependency;
- files that must be present on production but not committed or overwritten.

## Required Output

Write the full report to:

```text
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
```

Also include a section named `BRK-MVP-LANGAI-001 backend consultation` in that same report. Do not write the separate AI architecture report; it is owned by `CHAT-BRK-SEO-I18N-001`.

## Boundaries

- Do not deploy.
- Do not connect to FTP unless Director assigns a later deployment/audit task.
- Do not print private config contents or tokens.
- Do not edit code unless a later implementation task is assigned.
- Do not alter journal backend or production database.

## Required Short Chat Reply

```text
BRK-MVP-BE-001 done.
Report: docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
Tests:
- <syntax/API checks>: <N> passed, 0 failed
Scope preserved:
- product code, FTP, production, journal backend, database, secrets not touched.
Next expected: Director gate review.
```
