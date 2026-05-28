# Frontend Language Panel Polish - 2026-05-28

**Task:** `BRK-MVP-FE-009`
**Owner:** Director-scoped frontend pass
**Status:** Done, local only

## Summary

The language panel in the site menu was made calmer and more user-facing.

Changes:

- panel heading now reads as a normal setting: `Язык сайта` / `Языковые версии`;
- added a compact status row: `Сейчас: Русский`;
- language options remain full names only: `Русский`, `English`;
- active language uses a small check mark instead of a wide `Текущий` badge that was colliding with text;
- removed the visible placeholder line about future settings;
- removed technical wording such as `UI` and `language desk` from the visible panel copy.

## Changed Files

```text
js/main.js
css/main.css
lang/ru.json
lang/en.json
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0009-language-panel-polish.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/reports/frontend-language-panel-polish-2026-05-28.md
```

## Browser Smoke

Local server:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Headless Chrome checks:

- `index.html`, mobile 390x844: menu opened, language panel visible, no legacy language switch, no future-settings placeholder.
- `navdesk-watch.html`, mobile 390x844, night mode: menu opened, language panel visible in night style, `body.navdesk-theme-night` preserved, no legacy language switch.

Screenshots:

```text
docs/brkovic_ltd_project_office/reports/screenshots/language-panel-polish-2026-05-28/index-mobile-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-panel-polish-2026-05-28/navdesk-night-mobile-menu.png
```

Runtime values from Chrome:

```text
title: Языковые версии
kicker: Язык сайта
status: Сейчас Русский
optionCount: 2
legacyCount: 0
futureCount: 0
```

## Validation

Passed:

```bash
node --check js/language.js
node --check js/main.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8')); JSON.parse(require('fs').readFileSync('lang/en.json','utf8')); console.log('json ok')"
git diff --check -- js/main.js css/main.css lang/ru.json lang/en.json docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0009-language-panel-polish.md docs/brkovic_ltd_project_office/task-registry.md
```

Also checked:

```bash
rg -n "site-menu-future|site_menu_future_settings|language desk|UI-язык|UI language|\\bRU\\b|\\bEN\\b|lang-switch__btn" js/main.js css/main.css lang/ru.json lang/en.json index.html journal.html services/*.html navdesk*.html
```

No matches.

## Remaining Limitation

Only `lang/ru.json` and `lang/en.json` exist today, so the panel lists two available site versions. The central language registry from `BRK-MVP-FE-008` remains the place for adding future languages.

## Superseded Detail

Owner clarification after this pass: the project language model is broader than two visible languages. English is primary; target versions are Russian, German, Italian, Spanish, regional Serbian/Montenegrin/Croatian, and Mandarin. See:

```text
reports/target-language-matrix-2026-05-28.md
reports/frontend-language-roadmap-panel-2026-05-28.md
```
