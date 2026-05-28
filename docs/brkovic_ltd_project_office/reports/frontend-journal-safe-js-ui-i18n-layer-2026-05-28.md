# Frontend Journal Safe JS UI I18N Layer - 2026-05-28

**Task:** `BRK-MVP-FE-017`
**Owner:** Director-run frontend implementation
**Status:** For Review

## Summary

Moved a narrow safe layer of JavaScript-generated journal UI labels to EN/RU dictionary keys.

No journal content, owner prose, SEO text, media alt text, backend API, production files, FTP, print/PDF documents or future language availability were changed.

## Changed Files

```text
js/journal.js
lang/en.json
lang/ru.json
tools/i18n-diagnostics.mjs
```

## Implemented

Journal UI keys now cover:

- single-entry and multi-page-entry section labels;
- back-to-journal label;
- group carousel progress, previous and next labels;
- lightbox dialog/previous/next labels;
- multi-page book shell labels: cover progress, chapters count, back/next, part labels;
- note label;
- comment submitted/failed statuses;
- journal NavDesk card labels.

`tools/i18n-diagnostics.mjs` now recognizes the safe template helper pattern:

```text
tf("key", "fallback", values)
```

This prevents new templated dictionary keys from hiding from the i18n gate.

## Gates

Passed:

```text
node --check js/journal.js
node --check tools/i18n-diagnostics.mjs
JSON parse: lang/en.json, lang/ru.json
node tools/i18n-diagnostics.mjs --markdown --out docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
```

Diagnostic result after this layer:

```text
missing keys: none
dictionary drift: none
broken pages: none
js/journal.js referenced keys: 51
total referenced keys: 757
```

## Notes

This is a technical language-layer step, not a journal redesign and not a translation of journal articles into future languages.

Future languages remain disabled until real dictionaries, URLs, SEO rules and QA exist.

