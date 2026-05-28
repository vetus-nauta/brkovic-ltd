# QA: language access new model

Date: 2026-05-28
Inspector: CHAT-BRK-QA-UX-001
Scope: local QA/UX check for the new language hint and language access path after removing the old compact `EN/RU` switch.

## Summary

Status: FAIL, partial pass.

The new language model works on generated site menus: `index.html`, `journal.html`, `navdesk.html`, `navdesk-watch.html`, and the standard service page `services/skipper-service.html` open the menu without the old compact `EN/RU` toggle and show a clear `Языковые версии` section with `Русский` and `English`.

Blocker: `services/yacht-management.html` uses a special static `#siteMenuModal`. Its menu opens and has no legacy `EN/RU` toggle, but it does not contain `Языковые версии`, `Русский`, or `English` on any tested viewport. Users on this service page still have no visible language-change path.

Initial git state was already dirty on branch `handoff-2026-05-20-full...origin/handoff-2026-05-20-full [ahead 10]`. Product files were changing during frontend work while QA was running; the final pass below reflects the stabilized local state after those updates.

## Test Setup

Local URL: `http://127.0.0.1:4173` via `python3 -m http.server 4173 --bind 127.0.0.1`.

Browser automation: headless Google Chrome over CDP, with `navigator.languages` mocked to `ru-RU` for first-run system language checks.

Viewports:

- Desktop: `1440x900`
- Tablet: `768x1024`
- Mobile: `390x844`

Pages checked:

- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-watch.html`
- `services/skipper-service.html`
- Additional service risk check: `services/yacht-management.html`

## Results

- PASS: Menus open on `index.html`, `journal.html`, `navdesk.html`, `navdesk-watch.html`, and `services/skipper-service.html` at all three viewports.
- PASS: No visible legacy `.lang-switch` / `.language-switch` compact `EN/RU` control was found in the checked menus.
- PASS: The generated menus show `Языковые версии`, `Русский`, and `English`.
- PASS: Choosing `English` from the menu changes page text, sets `document.documentElement.lang` to `en`, marks English active, and saves `brkovic_language=en`.
- PASS: Reload after choosing English keeps `lang=en` with language source `saved`.
- PASS: Choosing `Русский` from the menu changes page text back, sets `document.documentElement.lang` to `ru`, marks Russian active, and saves `brkovic_language=ru`.
- PASS: First automatic system-language selection shows the hint: `Язык выбран по настройкам вашей системы. Сменить его можно в меню в разделе «Языковые версии».`
- PASS: Closing the hint removes it, writes `brkovic_language_hint_dismissed=2026-05-28-language-access`, and the hint does not reappear immediately after reload.
- PASS: NavDesk first-run disclaimer opens, locks the page, accepts correctly, stores `navdeskAcceptedVersion=2026-04-20`, and unlocks the page.
- PASS: NavDesk day/night switch toggles `navdesk-theme-night` / `navdesk-theme-day` and stores `navdesk_watch_theme_v1`.
- FAIL: `services/yacht-management.html` menu opens on `1440x900`, `768x1024`, and `390x844`, but has no `site-menu-language` section and no language options.

## Blocker

`services/yacht-management.html` needs the same language-access model as the generated menu, or `main.js` needs to inject/bind the `site-menu-language` block into existing static `#siteMenuModal` instances. Current visible menu text there is only: `Калькулятор`, `Услуги`, `Заявка`.

## Residual Risks

- I checked one standard service page plus the special yacht-management service page. Other service pages were not exhaustively matrix-tested in this pass.
- No production, FTP, backend, or secrets checks were performed, by instruction.
- No visual screenshot artifact was created for this report; verification was DOM/click/state based in Chrome.

## No-Code-Change Confirmation

No production HTML/CSS/JS/PHP/backend files were edited by this QA pass. No FTP, production backend, or secrets were touched.

Created artifact only:

- `docs/brkovic_ltd_project_office/reports/qa-language-access-new-model-2026-05-28.md`
