# Task 0003 - NavDesk Tides Weekly Graph API

**Task ID:** `BRK-MVP-BEIMPL-003`
**Owner chat:** `CHAT-BRK-BE-IMPL-001`
**Assigned:** 2026-05-27
**Status:** In Progress
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md`

## Context

The owner wants a human-readable weekly tide graph for a selected place with print/PDF support. The graph must include the user's vessel/depth settings:

- charted depth;
- draft;
- under-keel clearance;
- required depth;
- tide height;
- available depth;
- safe/unsafe intervals.

WorldTides production key is already confirmed working through existing forecast/window endpoints. Do not read or print the key.

## Scope

Build the server-side data endpoint for a weekly tide graph.

Allowed write scope:

- `api/tides/weekly.php` or another clearly named new endpoint under `api/tides/`;
- small shared helper extraction only if it is safer than duplication;
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md`.

Do not touch:

- `js/navdesk.js`;
- `css/navdesk.css`;
- `navdesk-tides.html`;
- production/FTP/private configs.

## Requirements

- Endpoint accepts `lat`, `lon`, `date`, `days`, `units`, `place`, `charted_depth`, `draft`, `ukc`, `lang`.
- Default `days=7`; cap days at `7` for MVP.
- Use WorldTides `heights` for the graph data; include `extremes` if practical so frontend can mark HW/LW.
- Use `step=1800` unless there is a strong reason not to.
- On localhost without private config/key, return local mock data shaped like production response.
- On production without config/key, fail safely like existing endpoints.
- Return a frontend-friendly structure:
  - request metadata;
  - location/provider metadata;
  - settings: charted depth, draft, UKC, required depth;
  - series points with time/date/tide height/available depth/clearance/margin/safe;
  - extremes/events;
  - daily summaries and safe windows if practical.
- Do not generate a chart image server-side.
- Do not use WorldTides `plot`; frontend should render the graph to match day/night and print styles.

## Verification

Run:

```bash
php -l api/tides/weekly.php
curl -sS 'http://127.0.0.1:18090/api/tides/weekly.php?...'
git diff --check -- api/tides/weekly.php docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md
```

Smoke should prove:

- localhost mock works;
- 7-day series is returned;
- settings affect available depth/safety fields;
- no secret is printed.

## Notes

Expected WorldTides credit impact:

- `heights` for 7 days at 30-minute intervals costs about 1 credit;
- adding `extremes` for the same range costs about another credit;
- avoid provider `plot` because it costs extra and is not styleable.
