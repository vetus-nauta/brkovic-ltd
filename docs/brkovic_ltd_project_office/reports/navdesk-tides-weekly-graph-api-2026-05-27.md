# NavDesk Tides Weekly Graph API

**Task:** `BRK-MVP-BEIMPL-003`
**Role:** `CHAT-BRK-BE-IMPL-001 / Backend Engineer`
**Date:** 2026-05-27
**Status:** implemented locally, not deployed
**Scope:** `api/tides/weekly.php`, this report.

## Summary

Added `/api/tides/weekly.php` as a frontend-friendly data endpoint for a weekly tide graph.

The endpoint:

- accepts `lat`, `lon`, `date`, `days`, `units`, `place`, `charted_depth`, `draft`, `ukc`, `lang`;
- defaults `days` to `7` and caps it at `7`;
- requests WorldTides `heights` with `step=1800` and `extremes` in the same provider call;
- normalizes `units` to `m` or `ft` and converts provider tide heights from meters to feet when `units=ft`;
- returns localhost mock data when the private WorldTides config/key is unavailable;
- returns safe production errors for missing config/key, matching the existing `forecast/window` behavior;
- does not generate images and does not call WorldTides `plot`;
- does not print or log the WorldTides key.

## Response Shape

Top-level response fields:

- `ok`;
- `source`;
- `location`;
- `provider`;
- `request`;
- `settings`;
- `series`;
- `events`;
- `extremes`;
- `daily`;
- `safe_windows`.

Each `series` point includes:

- `date`;
- `time`;
- `iso`;
- `tide_height`;
- `available_depth`;
- `clearance`;
- `margin`;
- `safe`;
- `units`.

The depth calculations are:

```text
available_depth = charted_depth + tide_height
required_depth = draft + ukc
clearance = available_depth - draft
margin = available_depth - required_depth
safe = available_depth >= required_depth
```

## Local Mock

When the endpoint is called from `localhost`, `127.0.0.1`, or `[::1]` without `/home/brkovic/private/worldtides.php` or without a configured key, it returns `source=local-mock`.

The mock includes:

- 30-minute height points for the requested capped range;
- four high/low events per day;
- provider/location metadata shaped like the production response.

WorldTides documents tide `height` values in meters, so the endpoint treats provider/mock heights as meters before optional `ft` conversion.

For a 7-day request the mock returns:

- `series=336`;
- `events=28`;
- `daily=7`.

## Production Behavior

If the private WorldTides config is missing outside localhost, the endpoint returns:

```json
{"ok":false,"error":"WorldTides config not found"}
```

If the config exists but the key is empty or placeholder outside localhost, the endpoint returns:

```json
{"ok":false,"error":"WorldTides key not configured"}
```

Provider failures return `502` without exposing the key or provider URL.

## Verification

Syntax:

```text
php -l api/tides/weekly.php
No syntax errors detected in api/tides/weekly.php
```

Local smoke through existing `127.0.0.1:18090` server:

```text
GET /api/tides/weekly.php?lat=42.4247&lon=18.7712&date=2026-05-27&days=9&units=m&place=Kotor&charted_depth=3&draft=1.4&ukc=0.3&lang=en
HTTP 200
ok=true
source=local-mock
days=7
series=336
events=28
daily=7
required_depth=1.7
first_margin=2.07
first_safe=true
```

Units conversion smoke:

```text
GET /api/tides/weekly.php?lat=42.4247&lon=18.7712&date=2026-05-27&days=7&units=ft&place=Kotor&charted_depth=10&draft=4.5&ukc=1&lang=en
HTTP 200
units=ft
first_tide_height=2.53
first_available_depth=12.53
required_depth=5.5
```

Whitespace check:

```text
git diff --check -- api/tides/weekly.php docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md
passed
```

## Notes

- Frontend files were not changed.
- Existing `api/tides/forecast.php` and `api/tides/window.php` were read for compatibility only and were not edited.
- Production, FTP, private config, and secrets were not touched.
