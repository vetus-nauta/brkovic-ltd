# Task 0002 - NavDesk Tides Autocomplete Implementation

**Task ID:** `BRK-MVP-FE-002`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-27
**Status:** In Progress
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-tides-frontend-autocomplete-2026-05-27.md`

## Context

Backend search expansion is ready for review:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-search-expansion-2026-05-27.md
```

UX/QA contract is ready for review:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-ux-qa-2026-05-27.md
```

Frontend intake is complete:

```text
docs/brkovic_ltd_project_office/reports/frontend-engineer-role-intake-2026-05-27.md
```

## Scope

Implement the frontend side of tide place search and selection.

Allowed write scope:

- `js/navdesk.js`
- `css/navdesk.css`
- `navdesk-tides.html` only if a small DOM hook is truly needed
- `lang/ru.json` and `lang/en.json` only for small UI-state strings
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-frontend-autocomplete-2026-05-27.md`

Do not edit `api/tides/search.php` unless Director explicitly reassigns backend scope.

## Requirements

- Keep the shared NavDesk disclaimer as the single entry warning.
- Do not add a new tide-specific modal or warning wall.
- Preserve day/night mode.
- Preserve manual tide mode.
- Do not redesign the page.
- Do not rewrite Russian marketing/explanatory text.
- Use backend search contract: min query, capped results, `status=min_query/ok/fallback`, compatible result fields.
- Search must not dump a broad list on first character.
- Suggestions must have loading, no-results and recoverable error/fallback states.
- User must explicitly select an ambiguous place before calculation.
- Changing the place text after selection must clear stale `lat/lon/source/station`.
- Calculation must not silently use stale coordinates or the first match when multiple matches exist.
- Source/provenance may be shown compactly near result/search state; do not style it as a second disclaimer.
- Inspect nearby NavDesk tide patches/hacks and fix only directly related brokenness. Broader cleanup goes to report, not patch.

## Verification

Run at least:

```bash
node --check js/navdesk.js
git diff --check -- js/navdesk.js css/navdesk.css navdesk-tides.html lang/ru.json lang/en.json docs/brkovic_ltd_project_office/reports/navdesk-tides-frontend-autocomplete-2026-05-27.md
```

Browser/device smoke:

- desktop around `1440x1000`;
- tablet around `768x1024`;
- mobile around `390x844`.

Functional smoke:

- one-letter search does not show broad suggestions;
- `Kotor` selectable and calculation works;
- `London` suggestions appear and calculation requires/uses selected item;
- editing selected text clears old coordinates;
- no-results/error state is recoverable;
- day/night still works;
- shared disclaimer still works.

## Report

Report must include:

- touched files;
- what frontend behavior changed;
- which hacks/tails were found and either fixed or deferred;
- tests run;
- residual risks.
