# Task 0008 - Static-Unused Key Classification

**Task ID:** `BRK-MVP-LOC-008`  
**Owner Chat:** `CHAT-BRK-LOC-001`  
**Status:** For Review  
**Created:** 2026-05-28

## Assignment

Classify the keys reported by the i18n diagnostics as static-unused.

This is report-only. Do not edit product code, language JSON, production, backend, data, secrets or OpenAI configuration.

## Inputs

Read:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-28-language-goals-sequential-plan.md
docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
tools/i18n-diagnostics.mjs
lang/en.json
lang/ru.json
js/main.js
js/form.js
js/journal.js
js/navdesk.js
js/management.js
js/delivery-calculator.js
docs/brkovic_ltd_project_office/reports/navdesk-maritime-glossary-2026-05-28.md
```

Write only:

```text
docs/brkovic_ltd_project_office/reports/static-unused-key-classification-2026-05-28.md
```

## Required Classification

For each static-unused key group, classify:

- JS-used and should remain;
- likely obsolete and candidate for later cleanup;
- owner-voice / content-risk;
- safety-critical / document / radio risk;
- needs backend/admin/journal handling.

## Output

The report must recommend the next safe frontend migration set for `BRK-MVP-FE-016`.
