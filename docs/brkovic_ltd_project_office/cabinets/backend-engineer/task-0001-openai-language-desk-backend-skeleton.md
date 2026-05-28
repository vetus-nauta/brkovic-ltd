# Chat Assignment

**Chat ID:** `CHAT-BRK-BE-IMPL-001`
**Department:** Backend Engineer
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-BEIMPL-001`
**Status:** Assigned / report-first

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
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-api-key-server-boundary-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
```

Backend files to inspect:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/package.json
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/prisma/schema.prisma
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/app.module.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/admin.module.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/posts/admin-posts.controller.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/collections/admin-journal-collections.controller.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/posts/posts.service.ts
```

## Task

Prepare the first implementable backend skeleton plan for the OpenAI language desk.

Report-first means:

- inspect the backend;
- identify exact files to touch;
- identify whether Prisma schema needs migration before code;
- identify whether OpenAI SDK dependency should be added or whether native `fetch` is enough;
- propose the smallest safe local patch sequence;
- do not read or print the real OpenAI key;
- do not call OpenAI;
- do not modify production or FTP.

If the implementation is obviously safe and isolated, you may propose the exact patch set, but do not apply it until Director/owner approval.

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-skeleton-2026-05-27.md
```

Required sections:

- backend state;
- proposed files to add/change;
- Prisma schema/migration decision;
- endpoint contract;
- secret handling;
- build/test plan;
- risks;
- recommended next command for Director.

## Boundaries

- No production.
- No FTP.
- No live DB.
- No OpenAI API call.
- No secret readback.
- No frontend redesign.
- No browser-side OpenAI.

## Required Short Chat Reply

```text
BRK-MVP-BEIMPL-001 done.
Report: docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-skeleton-2026-05-27.md
Secrets: not read, printed, committed, or sent to browser.
Next expected: Director approves or blocks local backend skeleton implementation.
```
