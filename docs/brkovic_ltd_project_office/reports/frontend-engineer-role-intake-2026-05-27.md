# Frontend/NavDesk Engineer Role Intake

**Task:** `BRK-MVP-FE-001`
**Chat:** `CHAT-BRK-FE-IMPL-001 / Frontend/NavDesk Engineer`
**Date:** 2026-05-27
**Status:** intake complete, implementation brief prepared
**Scope:** documentation-only role intake for future NavDesk tides frontend implementation. No product code changes, no production, no FTP, no secrets.

## 1. Role And Boundaries Confirmed

I accept the `CHAT-BRK-FE-IMPL-001` role as frontend/NavDesk implementation engineer for approved tasks only.

Boundaries confirmed:

- work from `/home/alexey/GitHub/Revoyacht/brkovic-ltd`;
- start tasks with `git status --short --branch`;
- do not deploy, use FTP, read secrets, or touch production;
- do not redesign without Director/owner approval;
- do not revert or overwrite other chats' dirty work;
- preserve NavDesk shared disclaimer behavior;
- preserve NavDesk day/night mode through `body.navdesk-theme-night`;
- verify desktop/tablet/mobile for frontend changes that affect layout or behavior;
- keep full findings in report files and short chat replies in the required compressed format.

For this intake task, product code was not edited.

## 2. Likely NavDesk Tides Frontend Scope

Future approved frontend implementation for tides will usually be limited to:

- `navdesk-tides.html` for tides page markup and DOM surfaces;
- `js/navdesk.js` for tide autocomplete, explicit selection, UI state, forecast/window wiring, and day/night-safe behavior;
- `css/navdesk.css` for tides-specific layout, autocomplete, result, table, and responsive states;
- `css/responsive.css` only if a shared responsive rule is explicitly needed;
- `lang/ru.json` and `lang/en.json` if implementation exposes new localized strings;
- `docs/brkovic_ltd_project_office/reports/**` for implementation notes.

Backend/API files are not frontend scope by default:

- `api/tides/search.php`;
- `api/tides/forecast.php`;
- `api/tides/window.php`;
- production/private WorldTides config.

Current assignment also explicitly protects `js/navdesk.js`, `api/tides/search.php`, and `navdesk-tides.html` while backend search expansion is in progress.

## 3. Needed After Backend Search Expansion

Before frontend coding starts, the frontend engineer needs the final backend search contract from `CHAT-BRK-BE-IMPL-001`:

- final response shape for `/api/tides/search.php`;
- minimum query length and result limit;
- possible `status` values, for example `min_query`, `ok`, `fallback`, `error`;
- exact fields guaranteed per result: `id`, `name`, `region`, `country`, `lat`, `lon`, `timezone`, `source`;
- how backend marks local-priority, provider/geocoder, fallback, and empty results;
- whether external search can return inland/ambiguous places and how that should be displayed;
- final behavior when Nominatim/provider is unavailable or rate-limited;
- any changed JS already made by backend in the tide autocomplete area, so frontend does not overwrite it.

Frontend should then implement only the missing UX contract, especially explicit selection and stale-selection handling, against the final backend behavior.

## 4. Frontend UX Contract For Tides

Implementation should keep the existing compact tool flow:

```text
place -> date/units/depth inputs -> mode -> calculate -> result -> table
```

Search:

- do not request or show suggestions before the approved minimum query length, currently expected as 2 characters;
- debounce typing around 250-350 ms;
- cap visible suggestions to about 5-7 items;
- ignore stale responses when the user has typed a newer query;
- render external result strings safely with text nodes or escaped text, not raw provider HTML.

States:

- empty: hide suggestions and clear or mark selected place as stale;
- below min query: show no broad list, optionally a quiet hint;
- loading: show compact inline search status;
- no results: show a compact `Место не найдено` state;
- error/fallback: show recoverable search feedback without marking the tide window unsafe;
- result provider/source: show factual provenance near results, not a second safety disclaimer.

Selection:

- calculation should use a selected suggestion's coordinates/station;
- if input text changes after selection, clear selected `lat/lon/station/source`;
- if typed text has multiple or uncertain matches and no explicit suggestion is selected, require selection instead of silently using the first result;
- support click/tap, Enter on highlighted suggestion, Escape/outside click to close.

NavDesk shared behavior:

- keep the shared NavDesk disclaimer as the common entry warning;
- do not add a new tide-specific modal or repeated safety warning wall;
- if old `.navdesk-tides-disclaimer` copy remains, treat it as compact data-source/provenance text only after Director approval;
- preserve day/night mode and test the same hierarchy in both skins;
- avoid adding another visual layer over existing tide result/card CSS without consolidation.

## 5. Acceptance Checklist For Future Implementation

- [ ] Product files touched only after Director/owner-approved frontend implementation task.
- [ ] Backend search expansion is complete or explicitly handed off with final contract.
- [ ] `git status --short --branch` reviewed before edits.
- [ ] No production, FTP, secrets, or private provider config touched.
- [ ] Shared NavDesk disclaimer still opens/accepts according to existing behavior.
- [ ] Day/night switch still works on `navdesk-tides.html`.
- [ ] Search does not request or display broad results for the first character.
- [ ] Search has min query, debounce, loading, no-results, and recoverable error/fallback states.
- [ ] External/geocoder strings are rendered safely.
- [ ] Suggestions show enough disambiguation: name, region/country, source/station/coordinates where available.
- [ ] Ambiguous calculation requires explicit selected suggestion.
- [ ] Editing the place input after selection clears stale coordinates/station/source.
- [ ] Calculate flow is clear and does not silently use stale or first-match data.
- [ ] Source/provenance appears near results and is not styled as a second disclaimer.
- [ ] Manual mode remains available and does not break shared disclaimer/day-night behavior.
- [ ] Desktop `1440x1000`: no page horizontal overflow; compact form and readable result/table.
- [ ] Tablet `768x1024`: touch-friendly autocomplete and stable layout.
- [ ] Mobile `390x844`: single-column flow, no overlap, no page horizontal overflow.
- [ ] Long station/source/result text wraps inside its container.
- [ ] Event table remains readable; any scroll is internal to the table wrapper.
- [ ] `node --check js/navdesk.js` passes if JS is touched.
- [ ] Relevant PHP lint is run only if an approved task touches PHP.
- [ ] Implementation report lists touched files, checks, and preserved scope.
