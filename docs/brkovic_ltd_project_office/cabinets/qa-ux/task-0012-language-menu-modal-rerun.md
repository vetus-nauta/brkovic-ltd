# Task 0012 - Language Menu Modal Re-Check

**Task ID:** `BRK-MVP-QAUX-012`
**Owner chat:** `CHAT-BRK-QA-UX-001`
**Assigned:** 2026-05-29
**Status:** In Progress

## Context

Earlier QA (`BRK-MVP-QAUX-006`) fixed the menu fail status, but code model has continued to evolve after language menu modal work (FE-020 in progress). The previous PASS/FAIL mix must be refreshed against one consistent behavior.

We need a single fresh pass covering:
- public site main menu language entry;
- modal opening on desktop/tablet/mobile;
- modal close mechanics (Esc + overlay);
- all visible language list options and current language indicator;
- system-language hint semantics.

## Scope

Public pages with menus and public language surfaces:
- index.html
- journal.html
- services/yacht-management.html
- services/iyt-training.html
- services/skipper-service.html
- services/sailing-tours.html
- services/yacht-acceptance-delivery.html
- services/yacht-registration.html
- navdesk.html
- navdesk-watch.html
- navdesk-tides.html
- navdesk-route.html
- navdesk-ukv.html
- navdesk-english.html

Required modes:
- desktop
- tablet
- mobile

Required model mode coverage:
- normal site mode
- NavDesk day
- NavDesk night

## Checks

1. Only one language activator appears in menu/chrome header action area.
2. Language panel opens via modal.
3. Modal closes via overlay tap/click and Esc key.
4. Current language is clearly marked and visible after switching.
5. No visible old `RU/EN` switch or duplicate legacy selectors.
6. Hint copy about automatic system language + manual change location is present and actionable.

## Required Output

`docs/brkovic_ltd_project_office/reports/language-menu-qa-2026-05-29.md`

## Acceptance Criteria

- Verdict: PASS only if all items in Checks pass on all required pages and modes.
- If FAIL: exact selector and reproducer for each failure.
- Do not edit production/backend/frontend code.
- Do not restart design.

## Notes

`BRK-MVP-FE-020` must remain the implementation owner for all frontend adjustments; QA only validates and reports.
