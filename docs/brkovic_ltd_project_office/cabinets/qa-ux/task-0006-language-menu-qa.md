# Task 0006 - Language Menu QA

**Task ID:** `BRK-MVP-QAUX-006`
**Owner chat:** `CHAT-BRK-QA-UX-001`
**Assigned:** 2026-05-28
**Status:** Assigned

## Context

The owner reports that the menu and language interface logic is broken again:

- old-looking `RU / EN` language controls appear somewhere;
- the site is planned for many languages, so the interface must not look like a two-language switcher;
- it is unclear whether the system-language hint works;
- the language UI must follow the current site model, not the old compact toggle.

## Scope

Audit the language and menu UI on the local MVP.

Required pages:

- `index.html`
- `journal.html`
- `services/yacht-management.html`
- `services/iyt-training.html`
- `services/skipper-service.html`
- `services/sailing-tours.html`
- `services/yacht-acceptance-delivery.html`
- `services/yacht-registration.html`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`

Required device modes:

- desktop;
- tablet;
- mobile.

Required visual modes:

- normal public site mode;
- NavDesk day mode;
- NavDesk night mode.

## Checks

1. Find every visible language UI surface in header, menu modal, settings blocks and hints.
2. Confirm whether old `RU`, `EN`, `RU/EN`, `lang-switch`, or two-button selector UI appears.
3. Confirm whether the current model shows language versions in a way suitable for many languages.
4. Confirm whether the hint appears once, explains system-language selection, and tells where to change language.
5. Confirm whether dismissing the hint works and whether it returns only when intended.
6. Confirm whether selected language state is visible and understandable.
7. Confirm whether menu behavior is consistent across public pages and NavDesk pages.
8. Record concrete selectors/files likely responsible, but do not edit code.

## Output

Write the report:

```text
docs/brkovic_ltd_project_office/reports/language-menu-qa-2026-05-28.md
```

The report must include:

- verdict: pass/fail;
- affected pages;
- screenshots if useful;
- exact visible text that is wrong;
- acceptance criteria for frontend correction;
- recommended frontend ownership and likely files.

## Hard Rules

- Do not fix the frontend in this QA task.
- Do not redesign the menu.
- Do not change production, FTP, backend, or secrets.
- Do not rewrite the owner's Russian copy.
- Preserve NavDesk disclaimer and day/night behavior.
