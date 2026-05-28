# Frontend Report - BRK-MVP-FE-016

**Task:** Safe JS UI i18n first migration  
**Status:** Implemented and checked  
**Date:** 2026-05-28

## Scope

Implemented the first narrow JavaScript-generated UI migration.

This is not redesign and not full NavDesk localization. No safety formulas, radio output, disclaimer copy, print/PDF wording, journal content, backend, admin, data, production or secrets were changed.

## Changed Files

- `js/language.js`
- `js/navdesk.js`
- `docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md`

Office/status files were updated separately for task tracking.

## Implementation

Added a real global translation helper:

- `window.t(key, fallback)`
- `window.BRKOVIC_LANGUAGE.t(key, fallback)`

This makes existing generated UI calls usable without each module creating its own private translation bridge.

Applied it only to safe NavDesk UI surfaces:

- tide suggestions list hint via `navdesk_tides_suggestion_hint`;
- tide trend accessibility label via `navdesk_tides_trend_label`;
- route place search idle/inserted/prefix helper text via:
  - `navdesk_route_search_status_idle_inline`
  - `navdesk_route_search_status_inserted_short`
  - `navdesk_route_search_result_prefix`
- UKV smart-pick toggle tooltip via `navdesk_ukv_phrase_pick_hint`.

## Deliberately Not Changed

- NavDesk disclaimer.
- Tide/depth formulas and safety thresholds.
- Route calculations, orthodrome/loxodrome output and print/PDF report wording.
- UKV generated radio phrases, emergency structures, Mayday/Pan-Pan/Securite output.
- Signed watch, GPS, notification, rest-control and print document wording.
- Yacht Management commercial/proforma language.

## Diagnostics Result

Current i18n gate:

```text
i18n ok: pages=15 jsFiles=12 htmlKeys=613 jsKeys=140 totalKeys=732 missing=0 totalUnused=192 broken=0
```

## Checks

Passed:

- `node --check js/language.js`
- `node --check js/main.js`
- `node --check js/form.js`
- `node --check js/journal.js`
- `node --check js/navdesk.js`
- `node --check js/management.js`
- `node --check js/delivery-calculator.js`
- `node tools/i18n-diagnostics.mjs`

## Next Safe Step

Continue with a second safe JS UI migration only after review:

- route search empty/error helper states;
- NavDesk non-safety empty states;
- form statuses that already have approved `en/ru` keys.

Keep print/PDF, radio, formulas and owner-voice for later gated tasks.
