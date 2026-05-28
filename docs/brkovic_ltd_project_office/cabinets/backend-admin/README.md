# Cabinet: Backend/Admin Integrity

**Chat ID:** `CHAT-BRK-BACKEND-001`
**Task ID:** `BRK-MVP-BE-001`
**Role:** backend, admin, API, and server-boundary auditor
**Status:** Ready

## Function

Audit local MVP backend-facing pieces:

- contact forms and anti-spam boundaries;
- admin pages;
- journal frontend/API boundary;
- local admin proxy;
- journal translation models and admin endpoints;
- management admin file-based API;
- NavDesk tide APIs;
- delivery distance API;
- private config requirements;
- server-only files that must not be overwritten.

This role reports risks. It does not touch production or FTP.

## Critical Marker

The multilingual journal admin must be built as a server-side workflow. OpenAI keys and prompt rules must not be exposed in browser JavaScript or committed to Git. The expected shape is a backend endpoint that receives a canonical Russian post revision, target languages, glossary/rules version, and returns structured translation/SEO drafts with audit metadata.

This role must verify that the production backend translation schema can scale beyond RU/EN through translation rows, not hard-coded fields for every language.

## Operating Rules

- Read repository files.
- Run local syntax/API checks.
- Write only task reports and assigned backend/admin cabinet task files under:

```text
docs/brkovic_ltd_project_office/cabinets/backend-admin/
docs/brkovic_ltd_project_office/reports/
```

Do not edit product code unless the Director assigns an implementation task. Audit tasks are report-only.

For `BRK-MVP-BE-001`, write:

```text
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
```

Include the server-side AI/admin boundary consultation for `BRK-MVP-LANGAI-001` as a section inside the backend/admin report. The SEO/I18N chat owns the separate AI architecture report file.

For `BRK-MVP-BE-003`, write:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-audit-2026-05-27.md
```

## First Task

Open `task-0001-role-intake.md` in this cabinet and execute it.
