# Task 0008 - Language Interactive Smoke

**Task ID:** `BRK-MVP-QAUX-008`
**Owner chat:** `CHAT-BRK-QA-UX-001`
**Assigned:** 2026-05-28
**Status:** For Review

## Context

`BRK-MVP-QAUX-007` passed the headless DOM smoke for the first safe NavDesk JavaScript i18n migration, but left interactive gaps:

- system-language hint dismissal;
- NavDesk night-mode persistence;
- route place-search dynamic EN/RU status after user action.

This task closes those gaps with an interactive local Chrome DevTools Protocol smoke.

## Scope

Local pages:

- `index.html`
- `navdesk.html?lang=en`
- `navdesk-route.html?lang=en`
- `navdesk-route.html?lang=ru`

## Checks

1. With a fresh browser profile and no `?lang`, the language hint appears when language is selected from the system.
2. The hint text explains system-language selection and where to change it.
3. Clicking the hint close button removes it.
4. Hint dismissal persists via the current `HINT_VERSION`.
5. NavDesk night mode can be selected and survives page reload through `localStorage`.
6. Route search can insert mocked Kotor coordinates.
7. Route search dynamic status is translated in English.
8. Route search dynamic status is translated in Russian.

## Output

Write the report:

```text
docs/brkovic_ltd_project_office/reports/language-interactive-smoke-2026-05-28.md
```

## Hard Rules

- Do not redesign the language panel or NavDesk.
- Do not enable future languages.
- Do not call production APIs unnecessarily.
- Do not change production, FTP, backend, or secrets.
- Preserve NavDesk disclaimer and day/night behavior.
