# Task 0022 - Vetus Nauta PWA Install Reminder Flow

**Task ID:** `BRK-MVP-FE-022`
**Owner:** `CHAT-BRK-FE-IMPL-001`
**Status:** `Ready`
**Date:** `2026-05-30`

## Goal

Implement the approved Vetus Nauta PWA install flow without redesigning the site:

- no large install modal on first load;
- show a compact install hint only after user interest;
- open the approved install modal from the hint and from a persistent menu item;
- use the browser PWA install prompt where available;
- show iOS/Android/desktop instructions where the system prompt is unavailable.
- use honest offline wording: do not promise that fresh tide/place/search/API-backed calculations work offline.

## Source

Google Drive file reviewed by Director:

```text
Vetus Nauta - PWA Install Hint Banner + Install Modal
Drive file id: 14bDkmWTkKXwxIaOnlCoy9UFVMAwIVa5i
```

Do not paste secrets or credentials into the report.

## Required Behavior

1. Do not show the large PWA modal automatically on first page load.
2. Show a compact hint only when all are true:
   - page is not already running as standalone/PWA;
   - user has not dismissed the hint recently;
   - user has shown interest by scroll/time/return visit.
3. Automatic reminder must not repeat on every reload or every app launch.
4. Recurring reminder policy:
   - store state in localStorage under a namespaced key;
   - track distinct visit days, not raw page reloads;
   - after dismissal, suppress for 7 days;
   - after successful install, suppress for 365 days;
   - if the user returns intermittently, for example 3 distinct visit days in a 7-day window, allow a new gentle reminder.
5. Always add a menu item that opens the same PWA install modal manually, even when automatic reminder is suppressed.
6. Keep this removable:
   - one shared JS module/block;
   - one CSS section or file;
   - one injected/shared modal path;
   - no hard dependency on backend state.

## Approved Copy Adjustment

Use human wording, not technical API language.

Primary modal lead:

```text
Добавьте Vetus Nauta на главный экран.
Справочники и ручные расчёты можно открыть даже без устойчивой связи. Сложные расчёты вроде приливов, поиска мест и подготовки перехода лучше выполнить заранее, пока есть интернет.
```

Benefit replacing the old broad offline promise:

```text
Часть данных доступна без связи
```

Small footer copy:

```text
Для свежих данных по приливам, поиску мест и онлайн-проверкам нужен интернет. Сохранённые страницы и ручные расчёты остаются под рукой.
```

## Implementation Notes

Likely files:

```text
js/main.js
css/main.css
site.webmanifest
favicons/site.webmanifest
index.html
journal.html
services/*.html
navdesk*.html
```

Current local finding:

- `site.webmanifest` and `favicons/site.webmanifest` exist.
- main public pages have theme/apple icon metadata but do not consistently expose a manifest link.
- main public site does not currently have a main-site service worker; `game.brkovic.ltd` has its own PWA shell and must not be mixed into this task.

Prefer shared site-menu/modal patterns already in `js/main.js`.

## Boundaries

Allowed:

- shared site menu/modal code for brkovic.ltd pages;
- PWA install hint/modal JS and CSS;
- manifest link/meta wiring for main public pages;
- minimal service-worker registration only if it is required for installability and scoped to main site release files.

Forbidden:

- no production deploy;
- no FTP changes;
- no database changes;
- no auth route changes;
- no redesign of NavDesk, journal, language menu, or service pages;
- no changes inside `game.brkovic.ltd` unless Director assigns a separate game PWA task;
- no new logo or decorative marine icon set;
- no dark/luxury/App Store/SaaS visual treatment.

## Acceptance Checks

- Fresh browser: no large modal on first paint.
- Hint appears after scroll >= 35% or 45 seconds active viewing.
- Hint close suppresses automatic reminder for 7 days.
- Simulated 3 distinct visit days in one week allows a reminder again.
- Installed/standalone display mode shows no automatic hint/modal.
- Menu item opens modal manually even when auto-reminder is suppressed.
- Android/Chrome/Edge use `beforeinstallprompt` when available.
- iPhone/iPad show Share -> Add to Home Screen instructions.
- Desktop text is appropriate for Windows/macOS browser behavior.
- Existing auth modal, language modal, NavDesk terms modal, journal comments, and yacht-management disclaimer still behave normally.

## Deliverable

Report:

```text
docs/brkovic_ltd_project_office/reports/frontend-pwa-install-reminder-flow-2026-05-30.md
```

Required short reply:

```text
BRK-MVP-FE-022 done.
Report: docs/brkovic_ltd_project_office/reports/frontend-pwa-install-reminder-flow-2026-05-30.md
Tests:
- <checks run>
Scope preserved:
- auth/backend/database/FTP/game PWA not touched.
Next expected: QAUX-015 PWA install reminder smoke.
```
