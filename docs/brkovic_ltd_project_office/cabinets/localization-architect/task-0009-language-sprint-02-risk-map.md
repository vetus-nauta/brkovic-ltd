# Task 0009 - Language Sprint 02 Risk Map

**Task ID:** `BRK-MVP-LOC-009`
**Owner chat:** `CHAT-BRK-LOC-001`
**Assigned:** 2026-05-28
**Status:** Assigned

## Goal

Prepare the localization risk map for the remaining hardcoded or generated strings before frontend moves them into dictionaries.

## Required Buckets

Classify remaining strings by risk:

- safe UI;
- owner voice;
- safety/navigation;
- radio/emergency;
- legal/disclaimer;
- commercial/pricing;
- print/PDF document;
- SEO;
- backend/admin language-desk.

## Required Areas

Review:

- `js/journal.js`
- `js/navdesk.js`
- `js/management.js`
- `js/delivery-calculator.js`
- `js/main.js`
- `js/form.js`
- active HTML pages with `data-i18n`

## Hard Rules

- Do not translate future languages yet.
- Do not rewrite Russian owner copy.
- Do not change code.
- Do not enable `de`, `it`, `es`, `sr`, `zh`.
- Do not touch SEO metadata except to mark risk.

## Output

```text
docs/brkovic_ltd_project_office/reports/language-sprint-02-risk-map-2026-05-28.md
```

