# Chat Assignment

**Chat ID:** `CHAT-BRK-BACKEND-001`
**Department:** Backend/Admin Integrity
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-BE-002`
**Status:** Ready / implementation design, no production mutation

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
docs/brkovic_ltd_project_office/cabinets/backend-admin/README.md
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
docs/brkovic_ltd_project_office/reports/openai-api-key-server-boundary-2026-05-27.md
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
admin-posts.html
js/admin-posts.js
admin-api-proxy.php
```

## Task

Design the first safe backend/admin implementation slice for the AI multilingual journal language desk.

The owner has an active OpenAI API key. The key must never be pasted into chat, committed to Git, placed in browser JavaScript, stored in `lang/*.json`, or written into reports. The API boundary must be server-side only.

## Required Decisions To Validate

- Where the production backend will load the key:
  - preferred: environment variable or private server file outside public root;
  - never: frontend JavaScript, HTML, public JSON, Git, Google Drive.
- Which backend owns the endpoint:
  - preferred: journal backend under authenticated `/api/admin/...`;
  - local PHP files may only be used as temporary scaffolding if explicitly approved.
- Whether current `JournalTranslation` and `JournalMediaTranslation` models already support the required fields.
- Whether old RU/EN flat fields remain as compatibility fields during migration.
- How admin auth/session protects the generation endpoint.
- How to avoid auto-publishing generated translations.

## Proposed Endpoint Shape

Authenticated admin endpoint:

```text
POST /api/admin/posts/:id/translations/generate
POST /api/admin/journal-collections/:id/translations/generate
```

Request body:

```json
{
  "sourceLanguage": "ru",
  "targetLanguages": ["en", "de", "it"],
  "sourceRevisionHash": "server-calculated",
  "scope": ["post", "media", "seo"],
  "overwritePolicy": "missing_or_stale_only",
  "promptRulesVersion": "journal-ai-translation-2026-05-27",
  "glossaryVersion": "brkovic-nautical-2026-05-27"
}
```

Response body should return per-language status, not one all-or-nothing result.

Generated translations must be stored as draft/review states:

```text
generated -> needs_review -> approved -> published
```

No generated text becomes public until owner approval and publication.

## OpenAI API Requirements

Use the OpenAI API only from the server.

Current official guidance checked on 2026-05-27:

- API credentials are bearer credentials and must be loaded from server environment variables or a key-management service.
- Do not expose API keys in client-side code.
- For this translation workflow, use the Responses API with structured outputs so the backend receives predictable JSON fields.
- Use prompt/rules/glossary versions in metadata.
- Use low reasoning effort for routine draft translations unless quality testing shows otherwise.

## Structured Output Contract

The model response should be constrained to a JSON schema with fields similar to:

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

The backend must validate the schema before writing to the database.

## Prompt Discipline

- Russian source is canonical.
- Do not rewrite Russian.
- Preserve structure, paragraph order, chapter/page order, media order and factual claims.
- Preserve brand and names: `BRKOVIC`, `VETUS NAUTA`, vessel names, place names unless owner-approved localization exists.
- Translate nautical terminology by glossary, not by literal guesses.
- SEO output is a draft and must not keyword-stuff.

## Local Secret Setup

If a local developer test is needed, the key should be read from:

```text
~/.config/brkovic-ltd/openai.env
```

The repo also ignores:

```text
/.env
/.env.*
/openai.env
/api/openai.config.php
```

The example file `api/openai.config.example.php` contains placeholders only and must not be renamed into a committed real config.

## Boundaries

- Do not paste or print the real key.
- Do not call OpenAI from browser code.
- Do not modify production backend or database without a separate Director task.
- Do not deploy.
- Do not remove existing RU/EN admin fields during this slice.
- Do not auto-publish AI output.

## Required Output

Write implementation notes or patch summary to:

```text
docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md
```

Required short chat reply:

```text
BRK-MVP-BE-002 ready for review.
Report: docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md
Secrets:
- no OpenAI key read, printed, committed, or sent to browser.
Next expected: Director approves exact backend implementation slice.
```
