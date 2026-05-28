# Task 0018 - Delivery Calculator Safe JS UI I18N Layer

**Task ID:** `BRK-MVP-FE-018`  
**Owner chat:** `CHAT-BRK-FE-IMPL-001`  
**Assigned:** 2026-05-28  
**Status:** Assigned

## Context

`LOC-009` marked `js/delivery-calculator.js` as a good next controlled slice because it is small and the visible EN/RU helper text already exists in parallel.

This is not a copywriting task. Preserve exact current meaning.

## Scope

Allowed files:

- `js/delivery-calculator.js`
- `js/journal.js` only for the leftover safe comment submitting status from `FE-017`
- `lang/en.json`
- `lang/ru.json`

Allowed strings:

- delivery calculator crew helper strings;
- calculation speed helper;
- empty-distance summary;
- time/fuel summary fragments;
- leftover journal comment submitting status.

Out of scope:

- rates;
- formulas;
- fuel/distance logic;
- service promises;
- delivery liability language;
- route lookup behavior;
- future language activation.

## Acceptance Criteria

1. Existing EN/RU meaning is preserved exactly.
2. No formulas or calculation behavior change.
3. EN/RU dictionaries remain aligned.
4. Diagnostics report no missing keys, no dictionary drift and no broken pages.
5. Smoke checks cover journal comment status source and the delivery page in `?lang=en` and `?lang=ru`.

## Output

```text
docs/brkovic_ltd_project_office/reports/frontend-delivery-safe-js-ui-i18n-layer-2026-05-28.md
```
