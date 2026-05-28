# Task 0017 - Journal Safe JS UI I18N Layer

**Task ID:** `BRK-MVP-FE-017`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-28
**Status:** For Review

## Context

The first safe JavaScript UI i18n migration covered selected NavDesk runtime labels.

The next safe layer is the public journal UI shell, excluding owner-written journal content and SEO text.

## Scope

Allowed files:

- `js/journal.js`
- `lang/en.json`
- `lang/ru.json`
- `tools/i18n-diagnostics.mjs` if the diagnostic gate needs to recognize a new safe helper pattern

Allowed strings:

- journal single-mode labels;
- carousel navigation labels;
- lightbox accessibility labels;
- multi-page entry shell labels;
- comment submit status;
- journal NavDesk card UI labels.

Out of scope:

- journal entry text;
- titles/excerpts/content from API or snapshot;
- SEO fields;
- alt text written by the owner;
- comments from users;
- backend/admin translation workflow.

## Acceptance Criteria

1. Safe JS-generated labels use dictionary keys.
2. EN/RU dictionaries remain aligned.
3. `tools/i18n-diagnostics.mjs` sees the used keys.
4. Diagnostics reports no missing keys, no dictionary drift and no broken pages.
5. Journal page smoke passes in `?lang=en` and `?lang=ru`.
6. No future languages are enabled.

## Output

```text
docs/brkovic_ltd_project_office/reports/frontend-journal-safe-js-ui-i18n-layer-2026-05-28.md
```

