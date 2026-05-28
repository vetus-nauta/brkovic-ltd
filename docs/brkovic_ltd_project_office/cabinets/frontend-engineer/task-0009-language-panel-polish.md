# Task 0009 - Language Panel Polish

**Task ID:** `BRK-MVP-FE-009`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-28
**Status:** For Review

## Context

After `BRK-MVP-FE-008`, the language model no longer uses the old visible `RU / EN` switcher. The remaining issue is visual and UX clarity: the language panel still feels technical and bulky.

## Goal

Bring the language panel into a calm, professional menu state without redesigning the whole site menu.

The panel must:

- feel like a normal settings section, not a temporary technical block;
- show that the site supports language versions and can grow beyond two languages;
- use full language names, not `RU` / `EN`;
- clearly show the current language;
- keep the system-language hint behavior;
- preserve NavDesk day/night mode and disclaimers.

## Scope

Allowed files:

```text
js/main.js
css/main.css
lang/ru.json
lang/en.json
docs/brkovic_ltd_project_office/reports/frontend-language-panel-polish-2026-05-28.md
```

Do not touch:

```text
production / FTP / backend / secrets
journal content
NavDesk tool algorithms
page layouts outside the menu language panel
```

## Acceptance Criteria

1. The panel title is user-facing, not technical.
2. The explanatory text avoids `UI`, `language desk`, or internal production vocabulary.
3. The current language is visible as a status line and on the active option.
4. The option list is compact enough for mobile menus.
5. The block works in normal public pages and NavDesk night mode.
6. Adding future languages still happens from the central option list introduced in `BRK-MVP-FE-008`.
