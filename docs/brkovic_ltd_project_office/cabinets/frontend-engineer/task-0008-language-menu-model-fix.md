# Task 0008 - Language Menu Model Fix

**Task ID:** `BRK-MVP-FE-008`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-28
**Status:** Assigned

## Context

QA task `BRK-MVP-QAUX-006` found that the current menu no longer visibly shows the old compact `RU / EN` switch in local screenshots, but the implementation still carries a two-language and legacy-switch model.

Read first:

```text
docs/brkovic_ltd_project_office/reports/language-menu-qa-2026-05-28.md
docs/brkovic_ltd_project_office/reports/frontend-language-access-new-model-2026-05-28.md
docs/brkovic_ltd_project_office/reports/qa-language-access-new-model-2026-05-28.md
```

## Goal

Make the language menu model consistent with a future many-language site.

This is not a redesign. Preserve the current menu visual direction, but remove the hardcoded two-language/legacy switch behavior that keeps recreating confusion.

## Required Fixes

1. Create one central language option source in frontend code.
   - It must currently contain `ru` and `en`, because those are the available public UI files.
   - It must be structured so future languages can be added in one place.
   - Display names must be full names (`Русский`, `English`), not `RU` / `EN`.

2. Generate `.site-menu-language__option` buttons from that central source.
   - `js/main.js` must not hardcode separate Russian/English buttons in the modal template.
   - `services/yacht-management.html` must not keep a divergent hardcoded static language block if shared generation can handle it.

3. Remove visible legacy switch paths.
   - No public page may render `.lang-switch` / `.lang-switch__btn`.
   - Remove legacy CSS if it is no longer needed.
   - Keep only non-visible defensive cleanup if absolutely necessary, and document why in the frontend report.

4. Keep the system-language hint.
   - It must explain: language was selected from system settings; it can be changed in the menu under language versions.
   - Dismissal must persist.

5. Improve user-facing language section copy only within the already approved meaning.
   - Do not rewrite owner marketing text.
   - Keep meaning close to:

```text
Язык выбран автоматически по настройкам устройства. Здесь можно выбрать доступную языковую версию сайта. Новые языки будут добавляться постепенно.
```

6. Preserve NavDesk day/night mode and the shared NavDesk disclaimer behavior.

## Write Scope

Allowed:

```text
js/language.js
js/main.js
css/main.css
services/yacht-management.html
lang/ru.json
lang/en.json
docs/brkovic_ltd_project_office/reports/frontend-language-menu-model-fix-2026-05-28.md
```

Do not touch:

```text
journal backend
admin pages
FTP / production
api secrets
NavDesk tool algorithms
```

## Required Verification

Run:

```bash
node --check js/language.js
node --check js/main.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8')); JSON.parse(require('fs').readFileSync('lang/en.json','utf8')); console.log('json ok')"
git diff --check -- js/language.js js/main.js css/main.css services/yacht-management.html lang/ru.json lang/en.json docs/brkovic_ltd_project_office/reports/frontend-language-menu-model-fix-2026-05-28.md
```

Browser spot check:

- `index.html` mobile menu;
- `journal.html` desktop menu;
- `services/yacht-management.html` mobile menu;
- `navdesk.html` desktop day menu;
- `navdesk-watch.html` mobile night menu.

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/frontend-language-menu-model-fix-2026-05-28.md
```

Include:

- changed files;
- how the central language source works;
- screenshots or exact browser checks;
- validation commands;
- remaining limitations, especially that only RU/EN UI files exist today.
