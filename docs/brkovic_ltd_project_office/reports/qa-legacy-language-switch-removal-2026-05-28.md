# QA: legacy language switch removal

Date: 2026-05-28
Inspector: CHAT-BRK-QA-UX-001
Scope: independent UI check for removal of the old visible RU/EN language switch from BRKOVIC.LTD pages.

## Summary

Status: PASS, with one test-precondition note for the service page.

The old visible language selector was not found in the checked headers or site menus. No visible `Язык` / `Language` row, no `EN` / `RU` buttons, and no visible `.lang-switch`, `.language-switch`, or `.language-hint` controls appeared in the tested UI states.

The internal `data-i18n` / `language.js` compatibility layer and legacy translation keys/styles are still present in the codebase, but they were not visible in the checked user interface. This matches the stated migration model.

Initial git state was already dirty on branch `handoff-2026-05-20-full...origin/handoff-2026-05-20-full [ahead 10]`; this QA pass did not edit product code.

## Pages / viewports checked

Local test URL: `http://127.0.0.1:4173` via `python3 -m http.server 4173`.

Viewports:

- Desktop: `1440x900`
- Tablet: `768x1024`
- Mobile: `390x844`

Pages:

- `navdesk.html`: checked in day and night mode on all three viewports.
- `index.html`: checked on all three viewports.
- `journal.html`: checked on all three viewports.
- `services/yacht-management.html`: checked on all three viewports after accepting/pre-seeding the required management disclaimer.
- `navdesk-watch.html`: checked on all three viewports.
- `navdesk-tides.html`: additionally checked on all three viewports as a second NavDesk tool page.

## Findings

- PASS: `navdesk.html` menu opens in day and night mode. The menu contains Home, Services, Deck Log, Nav Desk, Contact. No visible legacy language row or RU/EN controls.
- PASS: `navdesk.html` day/night switch remains in the header. Both buttons are visible and the theme toggles between `navdesk-theme-day` and `navdesk-theme-night`.
- PASS: `index.html` and `journal.html` menu opens on desktop/tablet/mobile. No visible legacy language switch.
- PASS: `services/yacht-management.html` menu opens after the required management disclaimer is accepted. No visible legacy language switch in header or menu.
- PASS: `navdesk-watch.html` and `navdesk-tides.html` have no visible RU/EN switch in header or menu. Header day/night controls remain visible and functional.
- PASS: Instagram links resolve to `https://instagram.com/uskipper`; contact/request links remain present in menus.
- PASS: NavDesk disclaimer opens on first run and closes after Accept. Management disclaimer on the service page also behaves as a first-run blocking modal.
- INFO: `lang/en.json`, `lang/ru.json`, CSS, and JS still contain legacy language-switch compatibility strings/selectors. These were not visible in the tested UI and are consistent with the current technical-compatibility requirement.

## Blockers if any

No QA blockers for the legacy language switch removal.

Test note: on `services/yacht-management.html`, the first-run `managementDisclaimerModal` intentionally intercepts clicks until accepted. The menu test was repeated after acceptance/pre-seeding `managementDisclaimerAcceptedVersion=2026-05-19`, and passed on all viewports.

## Screenshots / paths

Screenshots created under:

`docs/brkovic_ltd_project_office/reports/screenshots/qa-legacy-language-switch-removal-2026-05-28/`

- `navdesk-desktop-disclaimer.png`
- `navdesk-desktop-day-menu.png`
- `navdesk-mobile-night-menu.png`
- `index-mobile-day-menu.png`
- `journal-tablet-day-menu.png`
- `service-yacht-management-desktop-day-menu.png`
- `navdesk-watch-mobile-day-menu.png`
- `navdesk-tides-tablet-day-menu.png`

## No-code-change confirmation

No production HTML/CSS/JS/PHP/backend files were edited by this QA pass. No FTP, production, backend, or secrets were touched.

Created artifacts only:

- `docs/brkovic_ltd_project_office/reports/qa-legacy-language-switch-removal-2026-05-28.md`
- Screenshot PNGs in the report screenshot directory listed above.
