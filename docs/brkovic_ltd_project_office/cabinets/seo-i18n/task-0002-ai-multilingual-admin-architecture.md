# Task 0002: AI Multilingual Journal Admin Architecture

**Task ID:** `BRK-MVP-LANGAI-001`
**Primary owner:** `CHAT-BRK-SEO-I18N-001`
**Required consult:** `CHAT-BRK-BACKEND-001`
**Status:** Assigned
**Required output:** `docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md`

## Purpose

Do not let the multilingual journal plan disappear during MVP release work.

The owner writes journal posts in Russian while moving, sailing, photographing, and documenting events. Russian is the canonical source language in the admin. Other languages must be generated as structured duplicates by an AI workflow using the owner's OpenAI account, then reviewed and approved.

## Existing Context To Read

```text
docs/brkovic_ltd_journal_audit_2026-05-25.md
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md
admin-posts.html
js/admin-posts.js
admin-api-proxy.php
```

Known current frontend state:

- `admin-posts.html` already has an advanced "Переводы и SEO" area.
- `js/admin-posts.js` still contains legacy RU/EN fields such as `titleEn`, `contentEn`, `seoTitleEn`.
- `js/admin-posts.js` has a local/free translation helper. Treat it as a draft-era helper, not the final multilingual architecture.

Known backend direction:

- production backend has journal translation-related schema notes in the handoff;
- expected scalable shape is `JournalTranslation` and `JournalMediaTranslation`, not hard-coded `titleFr/titleDe/titleIt/...` fields;
- journal collection/multipage work must preserve the same multilingual model.

## Required Admin Behavior

The admin must keep fast Russian entry first:

- Russian title;
- Russian short description;
- Russian text;
- photo upload;
- photo GPS/geotag metadata;
- Russian alt text and captions;
- publish/save controls.

Then an AI language desk should provide:

- target-language selection;
- "create/update language versions" action;
- per-language status badges;
- generated title, excerpt, content, media alt/caption, SEO title, SEO description;
- preview and diff from previous generated revision;
- owner review and approval;
- safe retry for one language without touching others.

Generated translations must default to draft/needs-review. They must not auto-publish or overwrite approved text without an explicit owner action.

## AI Discipline

The architecture must require:

- OpenAI API key stored server-side only;
- prompt/rules version saved in the repository without secrets;
- stable glossary for nautical terms, brand names, personal voice, place names, and terms that must not be translated;
- source revision/hash stored with every generated language version;
- model name, generation time, and generation status stored for audit;
- a clear failure state per language;
- no final Russian rewriting without owner approval.

## SEO Discipline

Each language version must have:

- language code;
- SEO title;
- SEO description;
- social/share excerpt;
- image alt text;
- canonical/hreflang strategy;
- slug/URL decision documented before indexing;
- status for "translation ready", "SEO ready", and "indexing allowed".

The task must call out that real multilingual SEO needs crawlable per-language public URLs or static/exported language pages. Client-only language switching is not enough for final indexing.

## Report Must Include

1. Current admin/frontend state.
2. Current backend/schema assumption.
3. Proposed data model delta, if any.
4. Proposed admin UI section.
5. Proposed backend endpoints.
6. Prompt/rules governance.
7. SEO and hreflang plan.
8. Release-safe MVP step that does not break existing journal posts.
