# Frontend Language Access New Model

Date: 2026-05-28
Role: CHAT-BRK-FE-IMPL-001

## Summary

Returned a user-visible language path without restoring the old compact `EN/RU` switch. The shared site menu now uses a neutral `Language versions / Языковые версии` section with full language-name buttons for `Русский` and `English`. Manual language selection still goes through `BRKOVIC_LANGUAGE.setLanguage()`.

## QA Blocker And Fix

QA found a blocker on `services/yacht-management.html`: the page owns a separate static `#siteMenuModal`, so it did not receive the generated menu's `Language versions`, `Русский`, and `English` controls.

Fix: the static yacht-management modal now includes the same `.site-menu-language` block as the generated menu. Existing management links remain in place:

- `Калькулятор`
- `Услуги`
- `Заявка`

The shared `js/main.js` language-control binding handles both generated and static menu markup.

## Changed Files

- `js/main.js`
  - Added shared binding for `.site-menu-language__option[data-lang]`.
  - Keeps existing static `#siteMenuModal` instead of replacing it.
  - Calls `BRKOVIC_LANGUAGE.setLanguage()` for manual selection.
- `js/language.js`
  - Restored the system-language hint for `source === "system"`.
  - Updated hint dismiss version to `2026-05-28-language-access`.
  - Keeps `.lang-switch__btn` compatibility and adds active-state sync for the new language list.
- `css/main.css`
  - Added styling for the new language-version section and full-name language buttons.
  - Kept legacy `.lang-switch` hidden.
- `lang/ru.json`, `lang/en.json`
  - Added/updated menu language-version labels and truthful system hint text.
- `services/yacht-management.html`
  - Added the static language-version section to its own `#siteMenuModal`.
- HTML cache-bust references
  - Updated shared `main.css`, `language.js`, and `main.js` references to `20260528-language-access-01` on affected public pages.

## Checks

- `node --check js/main.js` passed.
- `node --check js/language.js` passed.
- `JSON.parse` for `lang/ru.json` and `lang/en.json` passed.
- Grep check passed: old `lang-switch`, `lang-switch__btn`, `Language switcher`, `Язык /`, `EN / RU` did not return in public HTML/menu files.
- Local Chrome smoke on `services/yacht-management.html` passed after preseed/acceptance of the management disclaimer:
  - menu opens;
  - management links still show `Калькулятор`, `Услуги`, `Заявка`;
  - language section shows `Языковые версии`, `Русский`, `English`;
  - selecting `Русский` and `English` updates `document.documentElement.lang`;
  - active language state updates;
  - no legacy compact switch is present;
  - Instagram URL is still populated;
  - calculator and contact form are still present.

## Compatibility Left In Place

- `data-i18n`, `lang/ru.json`, `lang/en.json`, and `BRKOVIC_LANGUAGE` remain the current frontend localization runtime.
- Legacy `.lang-switch__btn` handling remains inside `language.js` for compatibility, but no user-facing public HTML/menu reintroduces the old compact `EN/RU` switch.
- This is still client-side UI language switching, not the future crawlable multilingual URL model.

No deploy performed.
