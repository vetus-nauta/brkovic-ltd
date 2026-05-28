# Task 0002 - NavDesk Tides Search Expansion

**Task ID:** `BRK-MVP-BEIMPL-002`
**Owner chat:** `CHAT-BRK-BE-IMPL-001`
**Assigned:** 2026-05-27
**Status:** In Progress
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-tides-search-expansion-2026-05-27.md`

## Context

The live WorldTides key is working through the production tide forecast/window endpoints. The current limitation is not the tide provider, but `api/tides/search.php`: it only searches a short hardcoded local list.

## Scope

Implement an MVP-safe expansion of tide place search.

Allowed write scope:

- `api/tides/search.php`
- a small, tide-search-only section of `js/navdesk.js` if debounce/min-query behavior needs client support

Do not edit unrelated NavDesk tools.

## Requirements

- Keep the shared NavDesk disclaimer as the single user warning.
- Do not add per-tool disclaimer blocks.
- Preserve day/night behavior.
- Preserve compatible result fields: `id`, `name`, `region`, `country`, `lat`, `lon`, `timezone`, `source`.
- Empty or too-short queries must not return the full list.
- Use a minimum query threshold and a small result limit.
- Keep local priority results for the Adriatic/Mediterranean list.
- Add server-side wider place lookup for real-world locations.
- Fail gracefully if the external lookup is unavailable.
- Do not read, print or move private provider keys.
- Do not deploy.

## Verification

Run:

```bash
php -l api/tides/search.php
node --check js/navdesk.js
curl -sS 'http://127.0.0.1:18090/api/tides/search.php?q=Kotor'
curl -sS 'http://127.0.0.1:18090/api/tides/search.php?q=London'
curl -sS 'http://127.0.0.1:18090/api/tides/search.php?q=a'
```

Expected:

- `Kotor` returns a useful result.
- `London` returns wider lookup results.
- `a` does not dump the whole catalog.
