# Backend Engineer Report: OpenAI Language Desk Skeleton

**Task:** `BRK-MVP-BEIMPL-001`
**Chat:** `CHAT-BRK-BE-IMPL-001`
**Date:** 2026-05-27
**Status:** report-first, ready for Director review
**Scope:** local journal backend inspection and skeleton plan only. No production, FTP, live DB, OpenAI request, secret readback, or backend code changes.

## Backend State

Working roots:

```text
frontend: /home/alexey/GitHub/Revoyacht/brkovic-ltd
journal backend: /home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Backend stack:

```text
NestJS 11
Prisma 6
PostgreSQL
TypeScript strict mode
Node runtime expected through CloudLinux Passenger
```

Current backend working copy status:

```text
## main
clean
```

Important current backend facts:

- global prefix is `/api`;
- admin routes are protected by `AdminSessionGuard`;
- existing admin route families include `/api/admin/posts`, `/api/admin/journal-collections`, `/api/admin/journal-groups`, `/api/admin/comments`, `/api/admin/gps`;
- `ConfigModule.forRoot()` is already global and loads `app.config.ts` and `database.config.ts`;
- current translation storage exists:
  - `JournalTranslation`;
  - `JournalMediaTranslation`;
  - `TranslationStatus` with `MISSING`, `DRAFT`, `NEEDS_REVIEW`, `PUBLISHED`;
- current admin services still write legacy RU/EN fields directly on `Post`, `JournalCollection`, and `Media`;
- no OpenAI module, OpenAI SDK, OpenAI config loader, generation endpoint, or translation review endpoint exists yet.

Current storage is enough for a local first skeleton that writes generated language drafts as `NEEDS_REVIEW`. It is not enough for a mature production AI editorial workflow because there is no source hash, prompt/rules version, model metadata, generation timestamp, reviewer metadata, or failure/stale state.

## Proposed Files To Add/Change

Smallest local backend skeleton, without frontend redesign:

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

Optional later frontend bridge after backend works:

```text
admin-api-proxy.php
admin-posts.html
js/admin-posts.js
```

Do not touch the frontend bridge in the first backend skeleton unless the Director explicitly expands the task. Current proxy patterns already appear broad enough for nested `/admin/posts/...` and `/admin/journal-collections/...` routes, but this should be verified after endpoints exist.

## Prisma Schema / Migration Decision

Recommended first local skeleton:

```text
No Prisma migration required.
```

Reason:

- `JournalTranslation` can already store language, status, title, excerpt, content, SEO title, SEO description for posts and collections.
- `JournalMediaTranslation` can already store media alt/caption per language.
- `NEEDS_REVIEW` already exists and matches the non-publishing AI draft rule.

Production-quality AI language desk requires a later migration before real use:

```text
sourceRevisionHash
promptRulesVersion
glossaryVersion
model
generatedAt
reviewedAt
approvedAt
lastError
```

Optional later enum/data design:

- add `FAILED` and `STALE`, or store failure/stale in a separate generation audit table;
- avoid changing enum status in production without a migration/rollback plan;
- avoid adding fixed `titleFr/titleDe/...` columns.

## Endpoint Contract

First implementable endpoint group should remain under authenticated admin routes:

```text
POST /api/admin/posts/:id/translations/generate
GET  /api/admin/posts/:id/translations
PATCH /api/admin/posts/:id/translations/:language

POST /api/admin/journal-collections/:id/translations/generate
GET  /api/admin/journal-collections/:id/translations
PATCH /api/admin/journal-collections/:id/translations/:language
```

Publishing should stay separate and explicit:

```text
POST /api/admin/posts/:id/translations/:language/publish
POST /api/admin/journal-collections/:id/translations/:language/publish
```

First `generate` request shape:

```json
{
  "targetLanguages": ["en"],
  "force": false,
  "includeMedia": true,
  "includeSeo": true,
  "rulesVersion": "brkovic-journal-v1",
  "glossaryVersion": "brkovic-nautical-v1"
}
```

First `generate` response shape:

```json
{
  "success": true,
  "data": {
    "entityType": "post",
    "entityId": "uuid",
    "sourceLanguage": "ru",
    "items": [
      {
        "language": "en",
        "status": "NEEDS_REVIEW",
        "translationId": "uuid",
        "mediaTranslations": [
          {
            "mediaId": "uuid",
            "status": "NEEDS_REVIEW"
          }
        ],
        "warnings": []
      }
    ]
  }
}
```

Structured AI draft shape expected inside `OpenAiLanguageService`:

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

Guardrails:

- Russian canonical text remains source.
- AI output must write `NEEDS_REVIEW`, not `PUBLISHED`.
- Do not overwrite an existing `PUBLISHED` translation unless a later owner-confirmed UI action explicitly allows it.
- Retry should be per language, not all-or-nothing.
- Backend must validate target language codes and structured output before DB writes.

## Secret Handling

Do not read or print the real key in reports or chat.

Recommended loader behavior:

1. read `process.env.OPENAI_API_KEY`;
2. if missing and local, read `~/.config/brkovic-ltd/openai.env`;
3. if production needs a file fallback, read a private path outside public root, for example `/home/brkovic/private/openai.env`;
4. never log the value;
5. expose only boolean health such as `configured: true`.

Implementation note:

- use server-side `fetch` first, not browser JavaScript;
- adding the OpenAI SDK can wait until the first skeleton proves the route/data flow;
- no OpenAI call should run in the skeleton test unless the Director assigns a separate live-provider test.

## Build / Test Plan

Checks already run in report-first inspection:

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
git status --short --branch
npm run build
DATABASE_URL='postgresql://user:pass@localhost:5432/db?schema=public' npx prisma validate
```

Results:

```text
backend git status: clean
npm run build: passed
prisma validate: passed
```

After local skeleton implementation, run:

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
npm run build
DATABASE_URL='postgresql://user:pass@localhost:5432/db?schema=public' npx prisma validate
```

If endpoint code is implemented without real OpenAI calls, add unit-level/service-level local smoke with a stub provider. Do not hit OpenAI in the default test.

## Risks

- Translation schema lacks audit metadata; okay for local skeleton, not enough for production editorial traceability.
- `TranslationStatus` lacks `FAILED` and `STALE`; first skeleton can report failures in response only, but production needs durable failure/stale state.
- Current admin code still uses legacy RU/EN fields; translation-row workflow must not break existing admin publishing.
- Browser-side free translation helpers still exist in `js/admin-posts.js`; future OpenAI workflow must not expose the key or send private drafts from browser.
- Target language list and glossary rules need Localization Architect ownership before production use.
- Production DB is reachable to backend on server only; every schema change needs backup/migration/deploy gate.

## Recommended Next Command For Director

Approve one local implementation slice:

```text
CHAT-BRK-BE-IMPL-001 may implement the local backend skeleton only:
- add OpenAI config loader without printing the key;
- add AI module/service with provider stub mode by default;
- add authenticated admin translation generate/list/patch endpoints;
- write existing JournalTranslation/JournalMediaTranslation rows as NEEDS_REVIEW;
- do not call OpenAI live;
- do not deploy;
- run npm run build and prisma validate.
```

Required next report after implementation:

```text
docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-local-skeleton-2026-05-27.md
```

## Scope Preserved

- real OpenAI key was not read, printed, committed, or sent to browser;
- OpenAI API was not called;
- production, FTP, and live DB were not touched;
- backend code was not changed in this report-first task;
- frontend admin UI was not changed.
