# Frontend Language Menu Model Fix - 2026-05-28

**Task:** `BRK-MVP-FE-008`  
**Worker:** `CHAT-BRK-FE-IMPL-001`  
**Status:** Done, local only

## Summary

The public language menu now uses one frontend language option source instead of hardcoded `ru` / `en` buttons in each menu template.

Current available UI languages remain:

- `ru` - `Русский`
- `en` - `English`

No compact `RU` / `EN` visible switch was added or restored.

## Changed Files

- `js/language.js`
  - Added central `LANGUAGE_OPTIONS` registry with `code`, full display `name`, and default marker.
  - Exposed `BRKOVIC_LANGUAGE.getLanguageOptions()` and `window.BRKOVIC_LANGUAGE_OPTIONS`.
  - Kept language detection, saved/manual selection, system-language hint, and hint dismissal.
  - Removed legacy `.lang-switch__btn` binding/state sync from the language runtime.
- `js/main.js`
  - Generates `.site-menu-language__option` buttons from `BRKOVIC_LANGUAGE.getLanguageOptions()`.
  - Rebuilds the language section for both generated menus and existing static `#siteMenuModal` instances.
  - Keeps a defensive `.lang-switch` / `.language-switch` cleanup path so stale static markup cannot remain visible if it appears in a cached or older modal.
- `css/main.css`
  - Removed legacy `.lang-switch` / `.lang-switch__btn` CSS.
  - Kept the current `.site-menu-language` styling and NavDesk night styling.
- `services/yacht-management.html`
  - Removed the divergent static language option block.
  - The static management modal is now populated by shared `main.js` language-section generation.
- `lang/ru.json`
  - Updated user-facing language note and system-language hint copy.
- `lang/en.json`
  - Updated matching English strings.

## Central Source

The language option source is now in `js/language.js`:

```js
const LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({ code: "ru", name: "Русский" }),
  Object.freeze({ code: "en", name: "English", isDefault: true })
]);
```

Future public UI languages can be added in this list after the corresponding `lang/<code>.json` file and translation keys exist. `js/main.js` reads the list through `BRKOVIC_LANGUAGE.getLanguageOptions()` and renders the menu buttons from that data.

## Browser Spot Check

Local server:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Browser automation: headless Google Chrome via CDP on `http://127.0.0.1:4173`.

Checked:

- `index.html`, mobile `390x844`: menu opened; language section rendered; options `Русский`, `English`; no `.lang-switch`, `.language-switch`, `.lang-switch__btn`; no compact `RU / EN`; system-language hint visible with updated copy.
- `journal.html`, desktop `1440x900`: menu opened; same language options; no legacy controls.
- `services/yacht-management.html`, mobile `390x844`: static modal opened; shared language section injected before Instagram settings; management links preserved; no legacy controls.
- `navdesk.html`, desktop `1440x900`, day mode seeded by `navdesk_watch_theme_v1=day`: menu opened; body kept `navdesk-theme-day`; NavDesk disclaimer stayed accepted; no legacy controls.
- `navdesk-watch.html`, mobile `390x844`, night mode seeded by `navdesk_watch_theme_v1=night`: menu opened; body kept `navdesk-theme-night`; NavDesk disclaimer stayed accepted; no legacy controls.

## Validation

Passed:

```bash
node --check js/language.js
node --check js/main.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8')); JSON.parse(require('fs').readFileSync('lang/en.json','utf8')); console.log('json ok')"
git diff --check -- js/language.js js/main.js css/main.css services/yacht-management.html lang/ru.json lang/en.json docs/brkovic_ltd_project_office/reports/frontend-language-menu-model-fix-2026-05-28.md
```

## Limitations

- Only `lang/ru.json` and `lang/en.json` exist today, so the registry intentionally contains only Russian and English.
- This remains client-side UI language switching, not a crawlable multilingual URL architecture.
- Non-rendering NavDesk selector fallbacks outside the allowed files were not changed; no tested public page rendered legacy `.lang-switch` controls.
- No production, FTP, backend, secrets, journal content, or NavDesk tool algorithms were touched.
