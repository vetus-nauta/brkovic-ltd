# Language Menu QA - 2026-05-28

**Task:** `BRK-MVP-QAUX-006`
**Owner:** Director-compiled QA after two watcher-closed QA attempts
**Status:** FAIL / requires frontend correction

## Verdict

The old compact `RU / EN` switcher was not reproduced in the current local source or in the QA screenshots created during this run.

However, the language/menu model still fails the owner's requirement as a stable multilingual interface:

- the implementation is still hardcoded around two supported languages in `js/language.js`;
- `js/main.js` and the static menu in `services/yacht-management.html` hardcode only `Русский` and `English`;
- legacy `.lang-switch` compatibility remains in `css/main.css`, `js/main.js`, and `js/language.js`, which keeps the old model alive in the code path;
- the visible copy says "current public UI languages" and "language desk", which is technically useful but not a polished user-facing explanation;
- `services/yacht-management.html` uses a static menu, so it can drift from the shared menu model again.

## Evidence

Source search:

```text
css/main.css: .lang-switch__btn / .lang-switch legacy styles remain.
js/language.js: SUPPORTED_LANGS = ["ru", "en"].
js/language.js: binds ".lang-switch__btn, .site-menu-language__option[data-lang]".
js/main.js: removes ".lang-switch, .language-switch" but still contains legacy cleanup path.
js/main.js: builds only two options: Русский and English.
services/yacht-management.html: static menu contains only two options: Русский and English.
```

QA screenshots created:

```text
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/index-html-desktop-normal-hint.png
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/index-html-mobile-normal-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/navdesk-html-desktop-day-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/navdesk-tides-html-tablet-night-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/navdesk-watch-html-mobile-night-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-menu-qa-2026-05-28/services-yacht-management-html-mobile-normal-menu.png
```

Visible current local UI in those screenshots:

- shows full names `Русский` and `English`, not compact `RU / EN`;
- shows "Языковые версии" section;
- marks the current language with `Текущий`;
- shows the system-language hint on `index.html`;
- allows hint dismissal visually via the hint button.

## Findings

### High - language model is still two-language hardcoded

The owner wants a multilingual model, not a `RU/EN` product decision. Current code still treats languages as a two-item list in multiple places. This is fragile and explains why old two-language UI keeps returning conceptually.

### High - legacy switch code remains

Even if visible HTML is currently clean, `.lang-switch` remains in CSS and JS. The code removes legacy controls after load, but the project should not keep a visible-language control model that contradicts the new rule.

### Medium - yacht-management static menu can drift

Most pages use `main.js` to generate the menu. `services/yacht-management.html` contains a static `#siteMenuModal`, so future menu/language fixes can miss it again.

### Medium - user-facing text is too technical

`Текущие публичные UI-языки доступны здесь.` and `Новые языковые версии будут добавляться через language desk.` are understandable to the team, but too internal for a visitor.

Suggested meaning for owner approval before copy change:

```text
Язык выбран автоматически по настройкам устройства. Здесь можно выбрать доступную языковую версию сайта. Новые языки будут добавляться постепенно.
```

## Coverage Gaps

Two QA subagents were watcher-closed because they created screenshots but did not finalize reports. This Director report uses their artifacts plus source inspection. A full click-through on every service page was not completed in this QA round.

## Acceptance Criteria For Frontend

1. No visible `RU`, `EN`, `RU / EN`, pill switcher, or compact two-button language selector appears in any menu.
2. Language UI is generated from one central language registry/list, not duplicated in `main.js` and static HTML.
3. The menu remains ready for many languages: adding a language should be a data/config change, not a new hardcoded button in each page.
4. The current language is shown by full language name plus a calm `Текущий` state.
5. The hint text says that language was selected from system settings and can be changed in the menu.
6. Hint dismissal persists by `HINT_VERSION` and does not reappear immediately after closing.
7. `services/yacht-management.html` uses the same language menu model as the rest of the site or has no divergent static language block.
8. NavDesk day/night modes preserve the same language behavior and do not break disclaimer behavior.

## Likely Frontend Files

```text
js/language.js
js/main.js
css/main.css
services/yacht-management.html
lang/ru.json
lang/en.json
```

Do not touch production, FTP, backend, or journal content.
