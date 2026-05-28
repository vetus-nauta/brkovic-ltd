# Cabinet: Backend Engineer

**Chat ID:** `CHAT-BRK-BE-IMPL-001`
**Role:** backend implementation engineer for journal backend, admin API, server-side AI language desk, and safe local backend changes
**Status:** Ready

## Function

This cabinet owns implementation work after the Director/owner approves a backend task.

Primary areas:

- NestJS journal backend in `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`;
- Prisma schema/migrations for journal backend;
- authenticated admin endpoints;
- server-side OpenAI language desk plumbing;
- backend build/type checks;
- local-only integration notes;
- frontend proxy/admin API touchpoints only when explicitly assigned.

## Difference From Backend/Admin Integrity

`CHAT-BRK-BACKEND-001` is the auditor and integrity reviewer.

`CHAT-BRK-BE-IMPL-001` is the implementer.

The implementer does not self-approve production readiness. After implementation, Backend/Admin Integrity or Director reviews risks, secrets, DB migration, deploy package and rollback path.

## Required First Read

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-api-key-server-boundary-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
```

## Operating Rules

- Do not deploy.
- Do not connect to production FTP unless a separate Director deployment/audit task says so.
- Do not connect to production database unless explicitly assigned.
- Do not read, print, copy, commit, or paste secrets.
- Do not print `~/.config/brkovic-ltd/openai.env`.
- Do not put OpenAI calls in browser JavaScript.
- Do not auto-publish AI generated content.
- Do not remove legacy RU/EN admin compatibility fields without a migration task.
- Do not overwrite user changes or unrelated worktree changes.
- Run build/type checks after backend changes.
- Document touched files and test results.

## Allowed Work Areas By Default

Read:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
/home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Write only when a task explicitly says so:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/**
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/prisma/**
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/package.json
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/package-lock.json
docs/brkovic_ltd_project_office/reports/**
```

Frontend bridge files such as `admin-api-proxy.php`, `admin-posts.html`, and `js/admin-posts.js` require explicit task approval.

## First Task

Open:

```text
docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0001-openai-language-desk-backend-skeleton.md
```
