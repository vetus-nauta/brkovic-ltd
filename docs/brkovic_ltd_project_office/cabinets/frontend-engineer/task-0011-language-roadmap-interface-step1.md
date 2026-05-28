# Task 0011 - Language Roadmap Interface Step 1

**Task ID:** `BRK-MVP-FE-011`  
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`  
**Status:** Assigned  
**Created:** 2026-05-28

## Assignment

Validate and, only if necessary, minimally patch the current language roadmap panel.

This task is not a redesign. Do not recompose the menu, restyle the site, or introduce a new visual direction.

## Scope

Allowed write scope if a direct blocker is found:

```text
js/language.js
js/main.js
css/main.css
lang/ru.json
lang/en.json
services/yacht-management.html
docs/brkovic_ltd_project_office/reports/frontend-language-roadmap-interface-step1-2026-05-28.md
docs/brkovic_ltd_project_office/reports/screenshots/language-roadmap-interface-step1-2026-05-28/
```

Do not touch production, backend, FTP, data files, OpenAI config, unrelated HTML pages, or Russian marketing copy.

## Acceptance

- The old compact `RU/EN` switch is not visible.
- Menu shows the roadmap: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- English is primary.
- Only `en` and `ru` are clickable.
- Planned languages are visible as planned/coming and cannot trigger missing JSON fetches.
- System-language hint still says the selected language can be changed in menu language versions.
- Static `services/yacht-management.html` menu behaves like generated menus.
- NavDesk day/night mode is preserved.
- Mobile layout is readable at 390px; no text collisions in language buttons.

## Required Checks

Run at minimum:

```bash
node --check js/language.js
node --check js/main.js
node -e "const fs=require('fs'); for (const f of ['lang/ru.json','lang/en.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
git diff --check -- js/language.js js/main.js css/main.css lang/ru.json lang/en.json services/yacht-management.html
```

Browser smoke:

- `index.html` desktop and mobile;
- `services/yacht-management.html` desktop and mobile;
- `navdesk.html` or `navdesk-watch.html` day/night mobile.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/frontend-language-roadmap-interface-step1-2026-05-28.md
```

Report changed files, screenshots, checks, and any remaining risk. If no code patch was needed, say so clearly.
