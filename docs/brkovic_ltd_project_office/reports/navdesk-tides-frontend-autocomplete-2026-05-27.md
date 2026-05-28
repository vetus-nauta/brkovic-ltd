# NavDesk Tides Frontend Autocomplete

**Task:** `BRK-MVP-FE-002`
**Role:** `CHAT-BRK-FE-IMPL-001 / Frontend/NavDesk Engineer`
**Date:** 2026-05-27
**Status:** implemented locally, not deployed

## Scope

Touched files:

- `js/navdesk.js`
- `css/navdesk.css`
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-frontend-autocomplete-2026-05-27.md`

Not touched:

- `api/tides/search.php`
- production, FTP, private configs, provider secrets
- unrelated NavDesk tools
- `navdesk-tides.html`, `lang/ru.json`, `lang/en.json`

## Behavior Changed

- Tide place autocomplete now has explicit UI states:
  - below minimum query: asks for at least 2 characters;
  - loading: shows a compact search row;
  - no results: shows `Место не найдено.`;
  - recoverable error: suggests retry or manual mode;
  - backend fallback: shows local-match fallback text when applicable.
- Suggestions render as DOM nodes with `textContent`, including compact place detail: region/country, source and coordinates.
- Selected place is stored explicitly in JS state and input `dataset`:
  - `id`
  - `name`
  - `lat`
  - `lon`
  - `source`
  - `timezone`
  - `region`
  - `country`
- Editing the input after selection clears stale selected data and coordinates.
- Calculation now prefers the selected coordinates.
- Empty or too-short place input no longer falls back silently to Kotor.
- If a typed query returns multiple matches and the user has not selected one, calculation stops and asks for explicit selection.
- If a typed query returns exactly one coordinate-bearing match, frontend selects it and proceeds.
- Keyboard basics added for suggestions: Arrow Up/Down, Enter on highlighted suggestion and Escape to close.

## Tide-Specific Hacks / Tails

Fixed directly related items:

- Removed the old silent `place || 'Kotor'` fallback from calculation.
- Removed the first-result calculation shortcut for ambiguous place names.
- Replaced tide table state/event rendering `innerHTML` with DOM node rendering to avoid brittle markup and provider text injection.
- Adjusted the later duplicate manual-mode visibility patch so it no longer hides the manual-mode table state note, station/trend context, or table section after the main tide UI state has rendered.

Deferred:

- Existing `.navdesk-tides-disclaimer` remains as-is. UX notes recommend reframing it as compact provenance/data-source text, but that is copy/contract work and was not changed in this task.
- Broader consolidation of stacked `.navdesk-window-card` and tide CSS layers remains deferred.
- NavDesk has multiple historical `DOMContentLoaded` blocks. Only the tide-specific conflict was patched.

## Verification

Commands:

```text
node --check js/navdesk.js
passed
```

Local browser smoke:

- Server: `php -S 127.0.0.1:8787 -t .`
- Browser: headless `google-chrome` via DevTools Protocol.
- Viewports:
  - desktop `1440x1000`: no horizontal overflow, tide input and run button present;
  - tablet `768x1024`: no horizontal overflow;
  - mobile `390x844`: no horizontal overflow.

Functional smoke:

- One-letter query `a`: no suggestion buttons; shows minimum-query state.
- `Kotor`: selectable, stores `42.4247 / 18.7712`, source `local-priority`; calculation returned passable local mock window and event rows.
- Editing selected `Kotor` to `Kotorx`: clears selected flag, lat and source.
- `London`: returned 6 suggestions; pressing calculate without selecting did not use the first match and showed explicit selection-required state.
- No-results query: showed `Место не найдено.` in suggestions.
- Simulated offline search: showed recoverable error state in suggestions.
- Manual mode: calculation still works, place input is disabled, manual station is shown, table section remains visible with manual note.
- Night mode: toggles `body.navdesk-theme-night`; shared disclaimer stayed accepted/closed during smoke.

## Residual Risks

- External Nominatim latency/rate limits remain backend/provider risk; frontend now presents fallback/error states but cannot remove provider dependency.
- External geocoder results may still be inland or non-tide-specific. Forecast/window provider remains responsible for tide availability at selected coordinates.
- Exact one-match auto-selection is allowed for MVP, but a future QA pass may choose to require explicit selection for all external provider matches.
- Existing tide disclaimer copy still duplicates some safety language below the tool; should be handled by owner-approved copy/provenance cleanup.
