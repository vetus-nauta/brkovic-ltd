# NavDesk Tides Weekly Graph Frontend

**Task:** `BRK-MVP-FE-003`
**Role:** `CHAT-BRK-FE-IMPL-001 / Frontend/NavDesk Engineer`
**Date:** 2026-05-27
**Status:** implemented locally, not deployed

## Touched Files

- `navdesk-tides.html`
- `js/navdesk.js`
- `css/navdesk.css`
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-frontend-2026-05-27.md`

## Implementation Notes

- Added a compact weekly report block after the existing passage-window result and before the daily tide events table.
- Added frontend fetch for `/api/tides/weekly.php` with selected place `lat/lon`, date, units, place name, charted depth, draft, UKC and current UI language.
- Weekly graph is rendered as frontend SVG, not provider image.
- Graph shows:
  - available depth as the primary line;
  - required depth as a dashed threshold;
  - safe and below-required background intervals;
  - day separators and date labels;
  - HW/LW markers when endpoint events are present.
- Added compact settings summary for charted depth, draft, UKC, required depth and formulas.
- Added compact source/provenance line with source, station, coordinates, datum and generated timestamp.
- Manual tide mode clears/hides the weekly graph and keeps the existing manual calculation flow.
- Autocomplete selected-place rules are preserved; weekly fetch uses the explicit stored selection.

## Print/PDF Behavior

- Added secondary `Print / PDF` action using `window.print()`.
- Print action applies a temporary `body.navdesk-tides-printing` class.
- Print CSS hides header, hero, form controls, buttons, daily table and surrounding UI, then prints the weekly report with title, meta, settings, graph, summary, legend and source.
- Added a page-specific print section id to override the existing global print rules that hide non-management sections.

## Verification

- `node --check js/navdesk.js` - passed.
- Local smoke server: `php -S 127.0.0.1:8787 -t .`.
- Browser smoke via headless Chrome DevTools:
  - `1440x1000`: Kotor selected through autocomplete, weekly SVG rendered, no page-level horizontal overflow.
  - `768x1024`: graph visible, no page-level horizontal overflow, chart scrolls inside its block.
  - `390x844`: graph visible, no page-level horizontal overflow, chart scrolls inside its block.
  - Night mode toggled and preserved graph visibility/overflow.
  - Print button calls `window.print()` and applies print class.
  - Print media check: report visible, print title visible, print button hidden, weekly section not collapsed.
  - Manual mode: graph hidden, manual state preserved.

## Deferred Risks

- Exact provider station naming and availability remain backend/provider concerns.
- Mobile print depends on browser support for `window.print()`.
- The existing global print CSS is broad; the tides print override is intentionally scoped to `body.navdesk-tides-printing`.
