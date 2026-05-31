# Frontend Report - PWA Install Reminder Flow

**Task ID:** BRK-MVP-FE-022  
**Date:** 2026-05-30  
**Owner:** Sprint 2 frontend worker

## Summary

Implemented the gentle Vetus Nauta PWA install flow for the main brkovic.ltd public site.

## Changed Files

- `js/main.js`
- `css/main.css`
- `site.webmanifest`
- `pwa-service-worker.js`
- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-english.html`
- `navdesk-route.html`
- `navdesk-tides.html`
- `navdesk-ukv.html`
- `navdesk-watch.html`
- `services/iyt-training.html`
- `services/sailing-tours.html`
- `services/skipper-service.html`
- `services/yacht-acceptance-delivery.html`
- `services/yacht-management.html`
- `services/yacht-registration.html`
- `lang/de.json`
- `lang/en.json`
- `lang/es.json`
- `lang/it.json`
- `lang/ru.json`
- `lang/sr.json`
- `lang/zh.json`

## Behavior Implemented

- No large install modal is opened automatically on first paint.
- Compact install hint appears only after eligibility plus interest:
  - scroll progress at or above 35%;
  - or 45 seconds active page time;
  - or return-visit reminder eligibility.
- Local state is stored under `brkovic_pwa_install_state_v1`.
- State tracks distinct visit days in a rolling 7-day window.
- Automatic reminders do not repeat on every reload or app launch.
- After an auto hint, another automatic reminder requires 3 distinct visit days in the reminder window.
- Closing an auto-surfaced hint/modal suppresses automatic reminders for 7 days.
- `appinstalled` and accepted browser install prompt suppress automatic reminders for 365 days.
- Standalone/PWA display mode suppresses automatic install UI.
- Site menu has a persistent “Add to Home Screen” item that opens the install modal manually even when automatic reminders are suppressed.
- Platform copy handles:
  - browser `beforeinstallprompt`;
  - iPhone/iPad Share -> Add to Home Screen;
  - Android browser menu installation;
  - desktop browser install behavior.
- Modal uses the approved Russian copy and honest offline wording:
  - manual calculations and saved pages may remain available;
  - fresh tide/place/online checks require internet.
- Main public pages now link `/site.webmanifest`.
- Added a root-scoped main-site service worker for same-origin static shell assets only.

## Scope Preserved

- No backend, database, FTP, or production deploy changes.
- No changes under `game.brkovic.ltd`.
- Auth modal / `ensureToolAccess` flow preserved.
- Language modal preserved.
- NavDesk disclaimer and day/night classes preserved.
- Yacht-management disclaimer preserved.
- Journal read/comments files were not changed.

## Verification

- `node --check js/main.js && node --check pwa-service-worker.js`
- `node -e "JSON.parse(require('fs').readFileSync('site.webmanifest','utf8')); for (const f of require('fs').readdirSync('lang').filter(f=>f.endsWith('.json'))) JSON.parse(require('fs').readFileSync('lang/'+f,'utf8')); console.log('json ok')"`
- Manifest link check across public pages with `rg`.
- Served local HTTP smoke:
  - `/site.webmanifest` reachable;
  - `/pwa-service-worker.js` reachable;
  - `/index.html` contains the manifest link.

## Notes For QAUX-015

Recommended smoke focus:

- Fresh profile: no modal on first paint.
- Scroll to 35% and verify compact hint appears.
- Close hint and verify localStorage `dismissedUntil` suppresses auto hint.
- Seed 3 distinct visit days in `brkovic_pwa_install_state_v1` and verify gentle reminder can appear again.
- Simulate standalone display mode where possible and verify automatic UI is suppressed.
- Open menu item manually while auto reminder is suppressed.
- On Chromium mobile/desktop, verify `beforeinstallprompt` path where available.
- On iOS Safari, verify instruction copy instead of unsupported system prompt.
