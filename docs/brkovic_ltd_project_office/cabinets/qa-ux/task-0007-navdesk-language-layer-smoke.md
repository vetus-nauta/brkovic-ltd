# Task 0007 - NavDesk Language Layer Smoke

**Task ID:** `BRK-MVP-QAUX-007`
**Owner chat:** `CHAT-BRK-QA-UX-001`
**Assigned:** 2026-05-28
**Status:** For Review

## Context

Frontend completed the first safe JavaScript UI i18n migration for NavDesk:

- shared translation helper is exposed as `window.t`;
- safe runtime labels were moved to dictionary keys;
- accessibility attributes are now translated for selected NavDesk controls.

QA must verify that the language layer initializes correctly on the local MVP before the next language sprint step.

## Scope

Smoke-test these local pages in English and Russian:

- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`

Use `?lang=en` and `?lang=ru` to force language selection.

## Checks

1. Pages return `200` locally.
2. `<html lang>` and `data-language-source` follow the requested query language.
3. NavDesk day/night icon buttons keep translated `aria-label` and `title` values.
4. Tides safe runtime/accessibility labels are translated:
   - place suggestion list hint;
   - trend label;
   - weekly tide graph label.
5. UKV smart-pick buttons keep translated `aria-label` and helper `title`.
6. Route page shell translates in both languages and route search runtime keys exist for later interactive testing.
7. Language panel remains many-language-ready:
   - `en` and `ru` available;
   - `de`, `it`, `es`, `sr`, `zh` visible as future/disabled versions;
   - no compact visible `RU / EN` switcher.
8. Run the i18n diagnostics gate after the smoke.

## Output

Write the report:

```text
docs/brkovic_ltd_project_office/reports/navdesk-language-layer-smoke-2026-05-28.md
```

## Hard Rules

- Do not redesign NavDesk.
- Do not change production, FTP, backend, or secrets.
- Preserve NavDesk disclaimer and day/night behavior.
- Do not rewrite the owner's Russian copy.
- Do not enable future language versions until content, URLs, SEO and QA are ready.
