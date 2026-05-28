# Frontend Language Roadmap Panel - 2026-05-28

**Task:** `BRK-MVP-FE-010`
**Owner:** Director-scoped frontend pass
**Status:** Done, local only

## Summary

Corrected the language panel from a two-language mental model to the project roadmap:

- English is shown first and marked as the primary public site language;
- Russian remains available;
- German, Italian, Spanish, regional Serbian/Montenegrin/Croatian, and Mandarin are visible as planned versions;
- planned languages are disabled in the UI and cannot trigger missing JSON loads;
- the old compact `RU/EN` switch is still absent.

## Changed Files

```text
js/language.js
js/main.js
css/main.css
lang/ru.json
lang/en.json
docs/brkovic_ltd_project_knowledge.md
docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md
docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0004-target-language-matrix.md
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0010-language-roadmap-panel.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md
docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md
```

## Browser Smoke

Local server:

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

Headless Chrome checks:

- `index.html?lang=ru`, mobile 390x844: menu opens; language panel has 7 options; `en` and `ru` are enabled; `de`, `it`, `es`, `sr`, `zh` are disabled/planned; legacy language switch count is 0.
- Selecting English changes `document.documentElement.lang` to `en`.
- Attempting to click disabled German leaves `document.documentElement.lang` at `en`.
- `navdesk-watch.html?lang=ru`, mobile 390x844, night mode: menu opens; night theme preserved; language panel has the same 7-option roadmap; legacy language switch count is 0.

Screenshots:

```text
docs/brkovic_ltd_project_office/reports/screenshots/language-roadmap-panel-2026-05-28/index-mobile-menu.png
docs/brkovic_ltd_project_office/reports/screenshots/language-roadmap-panel-2026-05-28/navdesk-watch-night-mobile-menu.png
```

Runtime facts:

```text
optionCount: 7
available: en, ru
planned disabled: de, it, es, sr, zh
legacyCount: 0
```

## Validation

Passed:

```bash
node --check js/language.js
node --check js/main.js
node -e "const fs=require('fs'); for (const f of ['lang/ru.json','lang/en.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
git diff --check -- js/language.js js/main.js css/main.css lang/ru.json lang/en.json docs/brkovic_ltd_project_knowledge.md docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0004-target-language-matrix.md docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0010-language-roadmap-panel.md docs/brkovic_ltd_project_office/task-registry.md docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md docs/brkovic_ltd_project_office/reports/frontend-language-panel-polish-2026-05-28.md
```

No production deploy performed.
