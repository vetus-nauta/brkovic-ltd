# NavDesk Tides Search Expansion

**Task:** `BRK-MVP-BEIMPL-002`
**Role:** `CHAT-BRK-BE-IMPL-001 / Backend Engineer`
**Date:** 2026-05-27
**Status:** implemented locally, not deployed
**Scope:** `api/tides/search.php`, small `js/navdesk.js` tide-place autocomplete section, this report.

## Summary

Expanded `/api/tides/search.php` from a fixed 9-place list into an MVP place search endpoint:

- empty or too-short query returns `ok=true`, `status=min_query`, `results=[]`;
- local Adriatic/Mediterranean priority places are still searched first;
- for query length >= 2, backend calls Nominatim/OpenStreetMap and returns geocoded `lat/lon`;
- response stays compatible with existing NavDesk JS fields: `id`, `name`, `region`, `country`, `lat`, `lon`, `timezone`, `source`;
- result count is capped, default `limit=6`, hard max `10`;
- Nominatim failures are graceful: endpoint returns local matches only with `status=fallback`, not fatal.

No production, FTP, secrets, or WorldTides key were touched.

## Files Changed

- `api/tides/search.php`
  - added sanitized query handling and min query length;
  - kept local priority places with `source=local-priority`;
  - added Nominatim request with timeout, connect timeout, `User-Agent`, JSON normalization, and dedupe;
  - added source/fallback metadata.
- `js/navdesk.js`
  - added `TIDE_PLACE_MIN_QUERY = 2`;
  - added 300 ms debounce for tide place suggestions;
  - changed suggestion rendering to DOM nodes/textContent instead of `innerHTML`, because Nominatim returns external strings.
- `docs/brkovic_ltd_project_office/reports/navdesk-tides-search-expansion-2026-05-27.md`
  - implementation notes and verification record.

## Behavior

Min query:

- `q=""` returns no results and `status=min_query`;
- `q="a"` returns no results and `status=min_query`;
- `q` length >= 2 searches local priority places and then Nominatim.

Autocomplete:

- frontend does not call search for fewer than 2 trimmed characters;
- frontend debounces requests by 300 ms;
- stale autocomplete responses are ignored if the user typed a newer query;
- click selection still stores `name`, `lat`, `lon`, and `timezone` in the input dataset.

Sources:

- local priority list covers Kotor, Tivat, Budva, Bar, Split, Dubrovnik, Zadar, Bari, Corfu;
- external search uses `https://nominatim.openstreetmap.org/search` from PHP backend;
- Nominatim results have `timezone=null` because Nominatim does not provide timezone in this response; forecast/window continue to use selected `lat/lon`.

## Risks

- Nominatim has public usage limits and can rate-limit or temporarily reject traffic. The MVP mitigates with debounce, backend timeout, `limit=6`, and graceful local fallback, but production should avoid high-frequency automated calls.
- Nominatim is a geocoder, not a tide-station database. A place can be inland or ambiguous; WorldTides forecast/window still decide provider data availability by `lat/lon`.
- Ambiguous names such as London return multiple locations. Existing NavDesk run flow still picks the first search result when the user presses calculate without explicitly selecting a suggestion.
- Timezone for external places is not resolved by this endpoint. Current WorldTides localtime behavior remains the source of tide event times.

## Local Verification

Local server used:

```bash
php -S 127.0.0.1:8787 -t .
```

Checks:

```text
php -l api/tides/search.php
No syntax errors detected in api/tides/search.php

node --check js/navdesk.js
passed
```

Search smoke:

```text
GET /api/tides/search.php?q=Kotor
ok=true
status=ok
source=local-priority+nominatim
first=Kotor, Montenegro
first_source=local-priority

GET /api/tides/search.php?q=London
ok=true
status=ok
source=local-priority+nominatim
first=Greater London, England, United Kingdom
first_source=nominatim

GET /api/tides/search.php?q=a
ok=true
status=min_query
results=[]

GET /api/tides/search.php?q=
ok=true
status=min_query
results=[]
```

Forecast/window smoke using London result coordinates:

```text
GET /api/tides/forecast.php?lat=51.507446&lon=-0.127765&date=2026-05-27&units=m&place=Greater%20London&lang=en
ok=true
source=local-mock
events=8

POST /api/tides/window.php
payload lat=51.507446 lon=-0.127765 date=2026-05-27 charted_depth=3 draft=1.4 ukc=0.3
ok=true
source=local-mock
status=passable
```

## Production Checks Needed

- Verify `/api/tides/search.php?q=London` reaches PHP through production Apache/Passenger routing.
- Verify production outbound HTTPS to `nominatim.openstreetmap.org` is allowed.
- Verify response latency under real hosting; timeout is currently 4 seconds with 2 seconds connect timeout.
- Verify WorldTides forecast/window still work for selected external `lat/lon`.
- Monitor whether Nominatim rate limiting appears; if it does, add caching or a dedicated geocoder provider before wider release.

## Deferred UX Idea

Do not implement without separate approval: require an explicit suggestion selection before running forecast/window for ambiguous place names, or show a compact "using first match" confirmation.
