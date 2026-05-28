# Frontend Legacy Language Switch Removal

**Date:** 2026-05-28
**Owner:** CHAT-BRK-FE-IMPL-001 / Frontend NavDesk
**Status:** Completed locally, not deployed

## Summary

The old visible RU/EN language switcher is removed from the current user-facing HTML surface and no longer created by the shared site menu. The existing `data-i18n`, `lang/ru.json`, `lang/en.json`, and `BRKOVIC_LANGUAGE` runtime remain in place for the current translation keys and future AI language desk transition.

## Changed

- `js/language.js`
  - Disabled the legacy language hint UI path. If `.language-hint` exists, it is removed instead of rendering the old message that tells users to change language in the menu.
- `css/main.css`
  - Kept legacy `.lang-switch` / `.language-switch` compatibility, but forced it hidden and removed the visible `inline-flex` display from the switch wrapper.
- `css/responsive.css`
  - Removed mobile sizing rules for the old language switch buttons.
- `css/navdesk.css`
  - Removed NavDesk night-mode legacy language switch styling, including broad `[class*="lang"]` and `[data-lang]` selectors.
  - Removed old site-menu-specific language switch night styling.

## Verified Current HTML Surface

The target pages currently contain no visible legacy switch blocks:

- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- `services/*.html`

The shared menu in `js/main.js` does not create `site_menu_language` and still keeps the normal menu links, Instagram/contact plumbing, modal close behavior, and footer/contact systems outside this change.

## Checks

- `git status --short --branch`
- `node --check js/main.js`
- `node --check js/language.js`
- `rg -n 'lang-switch|lang-switch__btn|Language switcher|Язык' index.html journal.html navdesk.html navdesk-watch.html navdesk-tides.html navdesk-route.html navdesk-ukv.html navdesk-english.html services/*.html`
  - no matches
- `rg -n 'site_menu_language|data-i18n="site_menu_language"' js/main.js`
  - no matches
- Local server smoke:
  - `curl -I --max-time 2 http://127.0.0.1:18090/navdesk.html` returned `HTTP/1.1 200 OK`
  - Node fetch check against `navdesk.html` and `js/main.js?v=20260528-language-menu-01` returned `{ "htmlHasLegacy": false, "modalSourceHasLegacy": false }`

## Remaining Risks

- `lang/en.json` and `lang/ru.json` still contain `site_menu_language` and `language_hint_*` keys intentionally; these were not removed because the translation architecture is still in transition.
- Base compatibility selectors for `.lang-switch__btn` and `.language-hint` still exist in CSS/JS, but the user-facing HTML does not render them and `main.js` removes legacy controls from the current document/menu.
- Playwright/jsdom were not available in this working tree, so the local smoke was HTTP/source based rather than a real browser-click DOM test.

## Deployment

No deploy, FTP, or production action was performed.
