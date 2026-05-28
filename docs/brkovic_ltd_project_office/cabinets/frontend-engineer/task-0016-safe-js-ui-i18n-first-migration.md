# Task 0016 - Safe JS UI I18N First Migration

**Task ID:** `BRK-MVP-FE-016`  
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`  
**Status:** For Review  
**Created:** 2026-05-28

## Assignment

Move the first low-risk JavaScript-generated UI strings into the active i18n layer.

This is not redesign and not full NavDesk localization.

## Dependencies

Wait for:

```text
docs/brkovic_ltd_project_office/reports/static-unused-key-classification-2026-05-28.md
```

Use:

```text
tools/i18n-diagnostics.mjs
docs/brkovic_ltd_project_office/director-reports/2026-05-28-language-goals-sequential-plan.md
docs/brkovic_ltd_project_office/reports/navdesk-maritime-glossary-2026-05-28.md
```

## Allowed First Candidates

Only low-risk generated UI statuses, for example:

- generic copy/saved/open/close statuses;
- empty state UI text if already represented in `lang/en.json` and `lang/ru.json`;
- form validation/status strings that already have keys;
- non-safety search helper text.

## Forbidden In This Task

Do not change:

- Russian owner voice;
- journal entry content;
- NavDesk disclaimer;
- GPS, tide/depth, route formulas or safety warnings;
- radio/emergency/UKV output;
- print/PDF/share document wording;
- yacht management commercial/proforma wording;
- backend/admin/API/data/secrets.

## Required Checks

```bash
node --check js/language.js
node --check js/main.js
node --check js/form.js
node --check js/journal.js
node --check js/navdesk.js
node --check js/management.js
node --check js/delivery-calculator.js
node tools/i18n-diagnostics.mjs
git diff --check
```

## Required Output

```text
docs/brkovic_ltd_project_office/reports/frontend-safe-js-ui-i18n-first-migration-2026-05-28.md
```
