# Task 0014 - Accessibility Attribute Keys

**Task ID:** `BRK-MVP-FE-014`  
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`  
**Status:** For Review  
**Created:** 2026-05-28

## Assignment

Use the attribute support from `BRK-MVP-FE-013` on safe real-page surfaces.

This is not redesign and not content translation. Do not change layout, visible copy, page composition, hero imagery, marketing text, owner voice or service meaning.

## Allowed Write Scope

```text
index.html
journal.html
services/*.html
navdesk.html
navdesk-watch.html
navdesk-tides.html
navdesk-route.html
navdesk-ukv.html
navdesk-english.html
lang/ru.json
lang/en.json
docs/brkovic_ltd_project_office/reports/frontend-accessibility-attribute-keys-2026-05-28.md
```

Do not touch:

```text
css/**
js/**
data/**
admin-*.html
forms/**
api/**
production/FTP/backend/secrets/OpenAI key
```

## Safe Surfaces

Add `data-i18n-aria-label`, `data-i18n-title`, or `data-i18n-alt` only to neutral shell/accessibility elements:

- brand/home logo links;
- Instagram links;
- mobile dock / quick actions nav;
- footer sitemap nav labels;
- menu close buttons only where already generated/static and safe;
- NavDesk day/night switch group and day/night buttons;
- NavDesk generic suggestion toggles;
- simple tool region labels such as filters/tablist/radiogroup when already present as hardcoded accessibility labels.

## Forbidden In This Task

- Do not alter visible text.
- Do not localize service hero image `alt` texts unless they are purely logo/icon alt. Hero/service image alt can carry marketing/context meaning and needs a later content task.
- Do not alter journal entry/media alt from live/snapshot content.
- Do not change NavDesk disclaimer wording.
- Do not change radio/emergency/UKV output.
- Do not make planned languages clickable.

## Key Naming

Use stable generic keys, for example:

```text
a11y_brand_home
a11y_instagram
a11y_quick_actions
a11y_footer_services
a11y_footer_leisure_tools
a11y_screen_mode
a11y_day_mode
a11y_night_mode
a11y_open_suggestions
```

Prefer reusing one key across repeated pages.

## Required Checks

Run:

```bash
node --check js/language.js
node --check js/main.js
node -e "const fs=require('fs'); for (const f of ['lang/ru.json','lang/en.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
git diff --check -- index.html journal.html services/*.html navdesk.html navdesk-watch.html navdesk-tides.html navdesk-route.html navdesk-ukv.html navdesk-english.html lang/ru.json lang/en.json docs/brkovic_ltd_project_office/reports/frontend-accessibility-attribute-keys-2026-05-28.md
```

Smoke at least:

- `index.html`;
- one service page;
- `journal.html`;
- one NavDesk day/night page.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/frontend-accessibility-attribute-keys-2026-05-28.md
```

Report changed files, keys added, checks, and residual risks.
