# NavDesk Tides Function Audit

**Task:** `BRK-MVP-BE-003`
**Chat:** `CHAT-BRK-BACKEND-001`
**Date:** 2026-05-27
**Status:** audit-only, ready for Director review
**Scope:** NavDesk tides page/API audit. No code changes, no production, no FTP, no private provider key readback.

## Summary

`navdesk-tides.html` is functional locally in both auto/mock mode and manual mode.

What works now:

- page loads locally;
- shared NavDesk disclaimer opens and can be accepted;
- day/night switch works;
- tide place search works from local mock list;
- forecast endpoint returns `local-mock` on localhost when private WorldTides config is absent;
- safe passage window endpoint returns `local-mock` on localhost;
- manual LW/HW calculation works without provider data;
- desktop/tablet/mobile browser smoke found no horizontal overflow.

Main MVP concerns:

- production auto mode depends on `/home/brkovic/private/worldtides.php`; if that private config/key is absent or invalid on the server, production auto mode returns a controlled `500` instead of mock data;
- `/api/.htaccess` mounts the Node journal backend on `/api` through Passenger. Production must verify that `/api/tides/*.php` is still served as PHP and not shadowed by the Node app;
- place search is currently a fixed local list, not a worldwide station/geocoder search;
- manual mode hides the on-page tide disclaimer with the tide table; the shared modal still protects the page, but the tool-level warning should stay visible near manual calculations.

This is acceptable as a boundary, but production readiness needs a deploy-side private-config check, not a frontend code guess.

## Files Checked

```text
navdesk.html
navdesk-tides.html
js/navdesk.js
css/navdesk.css
api/tides/search.php
api/tides/forecast.php
api/tides/window.php
api/.htaccess
lang/ru.json
lang/en.json
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/local-qa-ux-smoke-2026-05-27.md
```

## Local API Smoke

Commands/checks:

```bash
php -l api/tides/search.php
php -l api/tides/forecast.php
php -l api/tides/window.php
node --check js/navdesk.js
git diff --check -- navdesk-tides.html js/navdesk.js css/navdesk.css api/tides/search.php api/tides/forecast.php api/tides/window.php docs/brkovic_ltd_project_office
```

Results:

```text
PHP syntax: passed
JS syntax: passed
diff whitespace check: passed
```

Local endpoint smoke on `http://127.0.0.1:18090`:

```text
GET /api/tides/search.php?q=Kotor
HTTP 200
ok=true
count=1
first=Kotor

GET /api/tides/forecast.php?lat=42.4247&lon=18.7712&date=2026-05-27&units=m&place=Kotor&lang=ru
HTTP 200
ok=true
source=local-mock
events=8
station=Kotor local mock

POST /api/tides/window.php
HTTP 200
ok=true
source=local-mock
status=passable
window=00:00-23:30

GET /api/tides/forecast.php?... with Host: brkovic.ltd
ok=false
error=WorldTides config not found

POST /api/tides/window.php with Host: brkovic.ltd
ok=false
error=WorldTides config not found
```

Browser smoke via Chrome DevTools Protocol:

| Viewport | Auto mode | Manual mode | Night switch | Overflow |
| --- | --- | --- | --- | --- |
| Desktop `1440x1000` | `Проход возможен`, station `Kotor local mock` | `Ручной расчёт: проход возможен` | passed | none |
| Tablet `768x1024` | `Проход возможен`, station `Kotor local mock` | `Ручной расчёт: проход возможен` | passed | none |
| Mobile `390x844` | `Проход возможен`, station `Kotor local mock` | `Ручной расчёт: проход возможен` | passed | none |

## Current Data Flow

Frontend page:

```text
navdesk-tides.html
```

Shared script:

```text
js/navdesk.js
```

Important DOM IDs:

```text
tidePlace
tideSuggestions
tideDate
tideUnits
tideDraft
tideUkc
tideChartedDepth
tideModeAuto
tideModeManual
tideManualFields
tideManualLwTime
tideManualLwLevel
tideManualHwTime
tideManualHwLevel
tideRun
tideNextHigh
tideNextLow
tideTrend
tideStation
tideWindowStatus
tideSafeWindow
tideRequiredDepth
tideMinDepth
tideMaxDepth
tideTableBody
```

Auto mode:

1. user enters place;
2. JS calls `/api/tides/search.php?q=...`;
3. JS takes the first matching result from the fixed local list;
4. JS calls `/api/tides/forecast.php?...`;
5. JS calls `/api/tides/window.php` with depth/draft/UKC payload;
6. UI renders event table and safe-window card.

Manual mode:

1. radio switches to manual;
2. place input and automatic event rows are not used;
3. user enters LW/HW time and level;
4. JS calculates safe passage interval client-side;
5. table area shows manual-mode note.

Legacy note:

- `navdesk.html` still contains the old collapsed/legacy tide block with the same IDs as the extracted page. It is hidden as part of the NavDesk landing fallback. Keep it untouched until the Director approves legacy cleanup.

## Production / Private Config Boundary

Private provider config expected by both production endpoints:

```text
/home/brkovic/private/worldtides.php
```

Expected shape:

```php
<?php
return ['key' => '...'];
```

Behavior:

- if config/key is missing on localhost, endpoints return `local-mock`;
- if config/key is missing on production/non-local host, endpoints return controlled `500`;
- private key is not in the repository and was not read in this audit;
- provider requests go to `https://www.worldtides.info/api/v3`.

This boundary is good for not leaking keys, but deployment must verify the private file exists on the server before relying on production auto mode.

Additional production boundary:

- `api/.htaccess` declares `PassengerBaseURI "/api"` for the journal backend. Local PHP server smoke does not exercise Apache/Passenger routing. Before upload/after upload, check:
  - `https://brkovic.ltd/api/tides/search.php?q=Kotor`;
  - `https://brkovic.ltd/api/tides/forecast.php?...`;
  - `https://brkovic.ltd/api/tides/window.php`.
- If those routes are captured by the Node `/api` app, the tide PHP endpoints need a routing exception or a different public path.

## UX / Mobile Risks

Observed okay:

- no horizontal overflow in desktop/tablet/mobile smoke;
- manual fields become visible only in manual mode;
- day/night state applies on the tides page;
- the separate tides page is much better than the old one-page NavDesk overload.

Risks:

- auto mode silently chooses the first search result. If a user types an ambiguous place, the calculation can use a nearby but unintended station.
- place search is not provider-backed; it only knows the hardcoded list in `api/tides/search.php`.
- manual mode copy is functional but still technical. It says `local time искомого места`; this is understandable but should later be normalized by Localization Architect.
- the result card and event table are useful, but the action sequence is still form-like. Later UX pass can improve hierarchy after functional MVP.
- no offline persistence exists for the last tide calculation; after reload the user must re-enter values.
- no GPS/autolocation handoff into tides page yet.
- CSS has several stacked historical layers for `.navdesk-window-card`, including `!important` overrides. It works now, but future visual edits should consolidate instead of adding another layer.
- `js/navdesk.js` has two manual-mode visibility handlers for tides. Current behavior is coherent, but it is a maintenance risk if one handler is changed and the other is forgotten.
- search suggestions and event table rows are rendered with HTML strings. The current search list is controlled locally, but before any external provider search is added, render/escape strings safely.
- direct API calls with empty numeric strings can become `0` after PHP casting. Frontend prevents this for normal use, but API validation should be tightened before treating the endpoints as public tools.

## Day-Night / Disclaimer Risks

Current behavior:

- `initNavdeskConsent()` is shared and uses `navdeskAcceptedVersion` plus `navdeskAcceptedAt`;
- TTL is 14 days;
- modal is present on `navdesk-tides.html`;
- night theme is applied via `body.navdesk-theme-night`;
- browser smoke confirmed the switch to night mode.

Risks:

- do not remove or duplicate the modal when refactoring pages;
- do not change `navdeskAcceptedVersion` casually, because it will force all users to accept again;
- do not move the theme switch out of the shared NavDesk header without testing all NavDesk pages.
- manual tide mode currently hides `.navdesk-tides-disclaimer` because it hides the table section. The global modal remains, but a compact per-tool warning should remain visible in manual mode too.

## Localization Notes

Checked `lang/ru.json` and `lang/en.json` for tide/window/modal/table keys:

```text
tide/window/modal/table keys: 53
missing ru: none
missing en: none
```

Remaining localization risks are hardcoded or generated strings, not missing RU/EN key parity:

- `navdesk-tides.html` hero title/intro/action links are hardcoded Russian;
- theme switch aria/title strings are hardcoded Russian while `role="group"` uses English `Screen mode`;
- `js/navdesk.js` manual tide messages contain generated RU/EN strings inside JS instead of `lang/*.json`;
- `navdesk-tides.html` has `html lang="en"` while the fallback text is Russian. The language script may correct visible text, but this is an SEO/accessibility detail for the localization workstream.

## Blockers

No local functional blocker found for MVP.

Production blocker if the site owner expects live auto tide data immediately:

```text
Need server-side confirmation that /home/brkovic/private/worldtides.php exists and contains a valid WorldTides key.
```

Without that private file, production auto mode will not use local mock data and will return a controlled provider-config error.

Second production gate:

```text
Need live route confirmation that /api/tides/*.php is not shadowed by Passenger /api routing.
```

## Safe Next Fixes

Do first, small and functional:

1. Verify production routing for `/api/tides/*.php` before relying on live tides.
2. Confirm private WorldTides config exists server-side without printing the key.
3. Keep a compact on-page disclaimer visible in manual mode.
4. Add a visible non-alarming provider status when auto mode is using local/mock or when production provider config fails.
5. Make station selection explicit after search instead of always using the first result.
6. Persist last local tide form values in `localStorage` under a NavDesk tides key.
7. Add one GPS/autolocation action that fills lat/lon/place when permission is available, but keep manual entry as primary fallback.
8. Normalize hardcoded/generated tide strings into the localization plan before adding more languages.
9. Tighten API numeric validation and escape/render returned strings safely before connecting any external place search.

Can wait until after MVP:

- richer tide graphs;
- multiple stations comparison;
- offline cached tide tables;
- export/print for tide calculations;
- full nautical glossary pass for all tide terms.

## Scope Preserved

- audit-only; no product code changed;
- production, FTP, private provider config, and secrets were not touched;
- private WorldTides key was not read or printed;
- day/night and disclaimer code was not changed.
