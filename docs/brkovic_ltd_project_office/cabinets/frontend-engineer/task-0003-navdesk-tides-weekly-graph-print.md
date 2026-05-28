# Task 0003 - NavDesk Tides Weekly Graph And Print

**Task ID:** `BRK-MVP-FE-003`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-27
**Status:** In Progress
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-frontend-2026-05-27.md`

## Context

Backend weekly endpoint is ready for review:

```text
api/tides/weekly.php
docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md
```

UX/print requirements are ready for review:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-print-ux-2026-05-27.md
```

Autocomplete frontend implementation is ready for review:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-frontend-autocomplete-2026-05-27.md
```

## Scope

Implement the weekly tide/depth graph on `navdesk-tides.html`.

Allowed write scope:

- `navdesk-tides.html`
- `js/navdesk.js`
- `css/navdesk.css`
- `lang/ru.json`, `lang/en.json` only if small UI strings are needed
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-frontend-2026-05-27.md`

Do not edit backend endpoints in this task.

## Requirements

- Keep the shared NavDesk disclaimer as the single entry warning.
- Preserve day/night mode.
- Preserve manual tide mode.
- Preserve autocomplete behavior and explicit selected-place requirement.
- Do not make the output look like an official navigation certificate.
- Render the weekly graph from `/api/tides/weekly.php`; do not use WorldTides plot images.
- Show user settings: charted depth, draft, UKC, required depth, formula.
- Graph should emphasize available depth and required-depth threshold.
- Show safe/below-required intervals visually but subdued.
- Show HW/LW markers if endpoint events are available.
- Add a secondary print/PDF action that uses browser `window.print()`.
- Print layout must hide navigation/inputs/buttons and print a clean report with title, place, date range, settings, graph, summary and source/provenance.
- Source/provenance must be compact, not a second disclaimer.
- Desktop/tablet/mobile must avoid page-level horizontal overflow.

## Verification

Run:

```bash
node --check js/navdesk.js
git diff --check -- navdesk-tides.html js/navdesk.js css/navdesk.css lang/ru.json lang/en.json docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-frontend-2026-05-27.md
```

Browser smoke:

- desktop around `1440x1000`;
- tablet around `768x1024`;
- mobile around `390x844`;
- day and night;
- print emulation or at least `window.print` action binding checked.

Functional smoke:

- select `Kotor`;
- calculate daily result and weekly graph;
- verify graph gets 7-day data from weekly endpoint;
- print action is present after graph data;
- manual mode still works and does not require weekly graph.

## Report

Report must include:

- touched files;
- graph implementation notes;
- print/PDF behavior;
- tests run;
- deferred risks.
