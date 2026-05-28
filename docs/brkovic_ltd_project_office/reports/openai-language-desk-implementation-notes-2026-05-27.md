# OpenAI Language Desk Implementation Notes - 2026-05-27

**Task:** `BRK-MVP-BE-002`
**Owner chat:** `CHAT-BRK-BACKEND-001`
**Status:** for Director/owner review
**Scope:** implementation design only; no OpenAI request, no production, no DB mutation, no secret readback

## Summary

The local OpenAI key is now configured safely on `Vetus-Home`:

```text
~/.config/brkovic-ltd/openai.env
permissions: 600
```

The next implementation step should be backend-first, not UI-first.

The checked journal backend already has the right foundation for many languages:

- `JournalTranslation`
- `JournalMediaTranslation`
- `sourceLanguage`
- admin auth guard on `/api/admin/...`
- collection/post admin route families

But it does not yet have:

- OpenAI config loader;
- OpenAI service/client;
- generation endpoints;
- source revision hash;
- prompt/glossary/model metadata fields;
- failure/error metadata;
- reviewed/approved timestamps;
- admin UI for translation row workflow.

## Files Checked

Frontend project:

```text
admin-api-proxy.php
admin-posts.html
js/admin-posts.js
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-api-key-server-boundary-2026-05-27.md
```

Local journal backend working copy:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/package.json
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/prisma/schema.prisma
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/app.module.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/config/app.config.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/admin.module.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/posts/admin-posts.controller.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/collections/admin-journal-collections.controller.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/posts/posts.service.ts
/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/admin/collections/admin-journal-collections.service.ts
```

## Current Backend Shape

Backend stack:

```text
NestJS 11
Prisma 6
PostgreSQL
```

Admin routes are protected with `AdminSessionGuard`.

Existing route families:

```text
/api/admin/posts
/api/admin/journal-collections
/api/admin/journal-groups
/api/admin/comments
/api/admin/gps
```

Existing translation storage:

```text
JournalTranslation:
- language
- status
- sourceLanguage
- title
- excerpt
- content
- seoTitle
- seoDescription
- postId
- collectionId

JournalMediaTranslation:
- mediaId
- language
- status
- alt
- caption
```

Existing `TranslationStatus`:

```text
MISSING
DRAFT
NEEDS_REVIEW
PUBLISHED
```

This is acceptable for the first draft flow. For a mature editorial workflow, add `APPROVED`, `FAILED`, `STALE`, or store those states in a separate generation/audit table.

## Recommended First Implementation Slice

Do this locally in the journal backend working copy before any production upload.

### 1. Config loader

Add a server-only OpenAI config source.

Recommended behavior:

1. Read `process.env.OPENAI_API_KEY`.
2. If missing, read `~/.config/brkovic-ltd/openai.env` locally.
3. In production, allow `/home/brkovic/private/openai.env`.
4. Never log the key.
5. Return only boolean health/status such as `configured: true`.

Suggested files:

```text
src/config/openai.config.ts
src/modules/ai/ai.module.ts
src/modules/ai/openai-language.service.ts
```

### 2. OpenAI language service

Create one internal service that:

- accepts canonical Russian source payload;
- accepts target languages;
- creates source revision hash;
- calls OpenAI Responses API server-side;
- requests structured JSON output;
- validates response shape before DB writes;
- returns per-language draft result.

Use no browser-side OpenAI code.

Initial model policy:

```text
model: gpt-5.5
reasoning.effort: low
text.verbosity: medium
```

Raise reasoning effort only after quality testing on difficult nautical/literary posts.

### 3. Admin generation endpoints

Add authenticated endpoints:

```text
POST /api/admin/posts/:id/translations/generate
GET  /api/admin/posts/:id/translations
PATCH /api/admin/posts/:id/translations/:language
POST /api/admin/posts/:id/translations/:language/publish

POST /api/admin/journal-collections/:id/translations/generate
GET  /api/admin/journal-collections/:id/translations
PATCH /api/admin/journal-collections/:id/translations/:language
POST /api/admin/journal-collections/:id/translations/:language/publish
```

For the first local slice, `generate` may create `NEEDS_REVIEW` rows only. Publishing should remain a separate explicit action.

### 4. DB writes

First generation pass should write:

```text
JournalTranslation.status = NEEDS_REVIEW
JournalTranslation.title
JournalTranslation.excerpt
JournalTranslation.content
JournalTranslation.seoTitle
JournalTranslation.seoDescription

JournalMediaTranslation.status = NEEDS_REVIEW
JournalMediaTranslation.alt
JournalMediaTranslation.caption
```

Do not overwrite `PUBLISHED` translations unless the request explicitly asks for overwrite and the owner confirms in UI.

### 5. Proxy allowlist

After backend endpoints exist, local frontend proxy must allow them:

```text
admin-api-proxy.php
```

Current pattern `#^/admin/posts(?:/[^?]*)?$#` probably already permits nested post translation routes.

Current pattern `#^/admin/journal-collections(?:/[^?]*)?$#` probably already permits nested collection translation routes.

Still verify after implementation.

### 6. Admin UI

Do not redesign `admin-posts.html` in the first backend slice.

Add only a compact advanced section after backend is working:

```text
AI language desk
- target language checklist
- generate drafts
- per-language status
- review/edit/publish
```

The Russian writing workflow must remain fast and first.

## Structured Output Contract

Use a strict schema similar to:

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

The backend should reject or mark failed if:

- required fields are missing;
- `language` differs from requested language;
- media ids do not match source media ids;
- content is empty when source content exists;
- generated response contains unexpected public claims.

## Prompt Rules

Stable prompt rules should live in versioned non-secret files.

Minimum rules:

- Russian is canonical.
- Do not rewrite Russian.
- Preserve paragraph order, page order, media order and factual claims.
- Preserve `BRKOVIC`, `VETUS NAUTA`, vessel names and personal names unless glossary says otherwise.
- Translate nautical terms by glossary.
- SEO is a draft, not keyword stuffing.
- Return warnings when a phrase is ambiguous.

## Schema Gap To Resolve

Before production AI use, add audit fields or a separate generation table.

Recommended minimal addition:

```text
sourceRevisionHash
promptRulesVersion
glossaryVersion
model
generatedAt
lastError
reviewedAt
approvedAt
approvedBy
```

If Prisma enum migration is acceptable, extend `TranslationStatus`:

```text
GENERATED
APPROVED
FAILED
STALE
```

If enum migration risk is high, keep current enum for MVP and store more precise state in metadata table.

## No-Code Verification Done

- Local backend working copy exists and is clean.
- Translation models exist in Prisma.
- Admin post/collection controllers exist and are protected by `AdminSessionGuard`.
- Frontend proxy patterns likely already allow nested translation routes.
- No OpenAI call was made.
- No secret value was read or printed.

## Recommended Next Director Decision

Approve one of two paths:

1. **Design-only path:** keep this as architecture, return to NavDesk MVP stabilization.
2. **Implementation path:** implement local backend `BRK-MVP-BE-002` skeleton in `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`, build it locally, then wire a tiny admin section.

The safer next technical move is implementation path step 1 only: backend skeleton plus build, no production deploy and no real OpenAI request until a test post and target language are chosen.
