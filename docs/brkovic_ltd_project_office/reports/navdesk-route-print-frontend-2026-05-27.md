# NavDesk Route Print Frontend

**Date:** 2026-05-27
**Owner:** Frontend Engineer / Director integration
**Status:** Approved for MVP

## Summary

The route tool now has an MVP print/PDF workflow for orthodrome and loxodrome calculations.

## Changed Files

- `navdesk-route.html`
- `js/navdesk.js`
- `css/navdesk.css`

## Implemented

- Added a `Печать / PDF` button to the route actions.
- Button starts disabled and becomes available after a successful route calculation.
- Added a human-readable route report with:
  - route report title;
  - generation date;
  - route point step;
  - From / To coordinates;
  - orthodrome distance, initial course, final course;
  - loxodrome distance and constant course;
  - orthodrome waypoint table.
- Print report uses the existing NavDesk print engine with `A4 landscape`.
- Added handling for identical start/finish points with a clear status message instead of a misleading `0.0 nm` report.
- Updated route page CSS/JS cache busting to `20260528-route-print-compact-01`.
- Compact print polish: reduced route report header/table spacing and allowed the waypoint table block to continue on the first page instead of forcing a page break.

## Verification

- `node --check js/navdesk.js`
- `git diff --check -- navdesk-route.html js/navdesk.js css/navdesk.css`
- Worker headless check: Las Palmas to St Lucia calculates, print button enables, report body contains From/To, loxodrome, and 24 route table rows.
- Director verification after compact polish: generated route report HTML from Las Palmas to St Lucia, printed to `/tmp/brkovic-route-print-compact.pdf`; `pdfinfo` reports `Pages: 1`, `Page size: 841.92 x 594.96 pts (A4)`.

## Remaining Risk

- Visual browser print preview is still worth checking on the owner's machine, but the headless PDF export now confirms one-page A4 landscape output for the standard Atlantic demo.
