# Ship Cashbox Full Audit

**Date:** `2026-05-31`  
**Branch:** `handoff-2026-05-20-full`  
**Scope:** `/ship-cashbox/index.html`, working assets, API, PWA runtime, SEO inclusion, GitHub materials.  
**Decision:** `Release candidate after live asset repair; real-device attachment QA still required.`

## Director Summary

The `Ship Cashbox` model matches the agreed product direction:

- one practical onboard cash notebook;
- participants may spend personally;
- participants may give money to the treasurer at any time;
- treasurer may spend from physically held cash;
- the system computes direct or treasurer-mediated settlement automatically.

During production audit, the public HTML page was present, but the working module files were missing on the live server. This was a release blocker and was fixed immediately.

## Repairs Applied During Audit

- Deployed missing production files:
  - `ship-cashbox/assets/app.js`
  - `ship-cashbox/assets/app.css`
  - `ship-cashbox/api/index.php`
  - `ship-cashbox/sw.js`
  - `ship-cashbox/manifest.webmanifest`
- Changed `ship-cashbox/index.html` to use the tool manifest:
  - from `../site.webmanifest`
  - to `manifest.webmanifest`
- Fixed `ship-cashbox/manifest.webmanifest` icon paths to existing favicon assets.
- Bumped `ship-cashbox/sw.js` cache to `ship-cashbox-shell-v20260531-07`.
- Added common JS, all seven site dictionaries, logo, and icon assets to the Ship Cashbox PWA shell cache.
- Added `ship-cashbox/storage/.htaccess` to block direct web access to runtime data.
- Added `robots.txt` disallow rules for:
  - `/ship-cashbox/api/`
  - `/ship-cashbox/storage/`
- Added `.gitignore` rules so runtime JSON sessions and export files do not enter GitHub.
- Hardened Ship Cashbox PHP session cookie from `SameSite=None` to `SameSite=Lax`.

## SEO And Site Integration

Pass:

- `Nav Desk` entry card links to `/ship-cashbox/index.html`.
- Page is present in `sitemap.xml`.
- Page is present in `js/seo.js` page map.
- Canonical is correct: `https://brkovic.ltd/ship-cashbox/index.html`.
- Robots meta is `index,follow`.
- Open Graph, Twitter Card, and JSON-LD exist.
- Footer includes copyright link.
- Live SEO Admin audit result:
  - `summary={"total":16,"ok":16,"warning":0,"error":0}`
  - `cashbox_tone=ok`
  - `sitemap_urls=21`

Note:

- The tool interface has working strings for all seven site languages: `ru`, `en`, `de`, `it`, `es`, `sr`, `zh`.
- DE/IT/ES/SR/ZH strings are AI first-pass localization and should receive human/native review before paid promotion.

## Runtime And API Verification

Local checks:

- `node --check ship-cashbox/assets/app.js`
- `node --check ship-cashbox/sw.js`
- `php -l ship-cashbox/api/index.php`
- `ship-cashbox/manifest.webmanifest` JSON parse
- local page reachable at `http://127.0.0.1:18090/ship-cashbox/index.html`
- local API boot reachable at `http://127.0.0.1:18090/ship-cashbox/api/?action=boot`

Live checks:

- `https://brkovic.ltd/ship-cashbox/index.html` returns `200`.
- `assets/app.js`, `assets/app.css`, `sw.js`, `manifest.webmanifest` return `200`.
- unauthenticated live API boot returns `401` with `X-Robots-Tag: noindex, nofollow, noarchive`.
- authenticated live API login and boot pass.
- `ship-cashbox/storage/index.json` returns `403`.
- all service-worker shell assets return `200`.

## Financial Scenario Recheck

Storage was backed up before scenario testing and restored after the run.

Rechecked scenarios through local API:

1. Direct-only settlement, no physical cashbox.
2. Late handover of money to treasurer.
3. Positive cashbox remainder.
4. Negative cashbox remainder.

Result:

`ship-cashbox scenarios ok: 4/4`

## Remaining Risks

- Real-device QA is still required for camera capture, gallery capture, PDF scan, and native share flows.
- Browser print/PDF visual quality should be reviewed on desktop and mobile after real data is entered.
- DE/IT/ES/SR/ZH native copy is complete as AI first pass, but still requires human/localizer review before ads or broad marketing.
- Production data retention policy for cashbox sessions should be defined before heavy real use.

## Director Close

`Ship Cashbox` is no longer blocked by missing live assets or basic SEO integration.

Release-candidate status is acceptable for controlled use after:

1. real-device attachment QA;
2. print/PDF visual QA;
3. human review of non-RU/EN localization if the tool is promoted outside RU/EN audiences.
