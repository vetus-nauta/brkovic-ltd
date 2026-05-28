# Chat Assignment

**Chat ID:** `CHAT-BRK-BE-IMPL-001`  
**Department:** Backend Engineer  
**Assigned by:** `CHAT-BRK-DIRECTOR-001`  
**Date:** 2026-05-28  
**Task ID:** `BRK-MVP-BEIMPL-004`  
**Status:** Assigned / local implementation only

## Working Directories

Frontend project:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Journal backend:

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
git status --short --branch
```

## Source Documents

Read first:

```text
docs/brkovic_ltd_project_office/cabinets/backend-engineer/README.md
docs/brkovic_ltd_project_office/director-reports/2026-05-28-openai-language-desk-sprint-01-launch.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-api-key-server-boundary-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md
docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-skeleton-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-live-key-health-2026-05-28.md
```

## Task

Implement the first local backend skeleton for the AI multilingual journal language desk.

This is not a production deployment and not a real translation run.

### Required Backend Shape

Add or update the smallest safe set of backend files in:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Expected files or equivalent local pattern:

```text
src/config/openai.config.ts
src/modules/ai/ai.module.ts
src/modules/ai/openai-language.service.ts
src/modules/ai/openai-language.types.ts
src/modules/admin/translations/admin-translations.controller.ts
src/modules/admin/translations/admin-translations.service.ts
src/modules/admin/admin.module.ts
src/app.module.ts
```

### Required Behavior

- Load OpenAI config server-side only.
- Prefer `process.env.OPENAI_API_KEY`.
- For local development, allow fallback to `~/.config/brkovic-ltd/openai.env`.
- Never log, print, return, commit, or expose the key.
- Default tests should use provider stub mode and must not call OpenAI live.
- Add authenticated admin endpoints:

```text
POST /api/admin/posts/:id/translations/generate
GET  /api/admin/posts/:id/translations
PATCH /api/admin/posts/:id/translations/:language

POST /api/admin/journal-collections/:id/translations/generate
GET  /api/admin/journal-collections/:id/translations
PATCH /api/admin/journal-collections/:id/translations/:language
```

- Write generated drafts as `NEEDS_REVIEW`.
- Use existing `JournalTranslation` and `JournalMediaTranslation` tables for this first slice.
- Do not overwrite existing `PUBLISHED` translations unless a later explicit owner-confirmed overwrite flow exists.
- Validate target language codes:

```text
en
de
it
es
sr
zh
```

Russian is the source language for journal authoring and does not need generated output in this task.

### Structured Draft Contract

The internal service should validate or stub this shape:

```json
{
  "language": "en",
  "title": "",
  "excerpt": "",
  "content": "",
  "seoTitle": "",
  "seoDescription": "",
  "shareExcerpt": "",
  "media": [
    {
      "mediaId": "",
      "alt": "",
      "caption": ""
    }
  ],
  "warnings": []
}
```

## Boundaries

- No production.
- No FTP.
- No live DB.
- No browser-side OpenAI.
- No real post translation unless separately assigned.
- No admin UI redesign.
- No public URL, `hreflang`, sitemap or indexing changes.
- No key readback in chat or reports.

## Checks

Run after implementation:

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
npm run build
DATABASE_URL='postgresql://user:pass@localhost:5432/db?schema=public' npx prisma validate
```

If a local endpoint smoke is possible without real OpenAI calls, include it in the report.

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-local-skeleton-2026-05-28.md
```

Required sections:

- files changed in backend working copy;
- endpoint contract implemented;
- provider mode and secret boundary;
- Prisma/migration decision;
- build/check results;
- risks and blocked items;
- next task for frontend/admin UI.

## Required Short Chat Reply

```text
BRK-MVP-BEIMPL-004 done.
Report: docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-local-skeleton-2026-05-28.md
Secrets: not printed, committed, or sent to browser.
Production: untouched.
```

