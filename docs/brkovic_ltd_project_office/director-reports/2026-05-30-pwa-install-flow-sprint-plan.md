# 2026-05-30 - PWA Install Flow Sprint Plan

**Owner:** `CHAT-BRK-DIRECTOR-001`
**Status:** Assigned plan

## Director Assessment

The Drive specification is usable and approved as a product direction for the main `brkovic.ltd` site.

Current repo check found:

- main public site already has PWA-like manifest/icon assets;
- public HTML does not consistently link the manifest;
- main public site does not have a main-site service worker;
- `game.brkovic.ltd` has a separate PWA shell and must not be mixed into this task;
- shared menu and modal code already exists in `js/main.js`, which is the preferred integration point.

Core rule: install flow must be gentle, removable, and non-repetitive. It must not show a large modal by default, must not repeat on every reload, and must keep a menu item that opens the modal manually.

## Sprint 1 - Stabilize Current Release Gates

**Goal:** close blockers already ahead of PWA work.

Steps:

1. `BRK-MVP-BE-010` - Backend fixes email-code delivery and TTL consistency.
2. `BRK-MVP-QAUX-014` - QA reruns OTP smoke after `BE-010`.
3. `BRK-MVP-QAUX-013` - QA completes public tool-auth gate smoke.
4. Director reviews auth reports and keeps production deploy closed unless green.

Logical ending: tool auth is either green for MVP release or explicitly blocked with one backend owner.

## Sprint 2 - PWA Install Hint And Modal

**Goal:** implement the approved PWA install flow without redesign.

Steps:

5. `BRK-MVP-FE-022` - Frontend implements the PWA hint, modal, menu item, platform logic, and non-repeating reminder policy.
6. `BRK-MVP-QAUX-015` - QA validates PWA flow across desktop/tablet/mobile and conflict surfaces.

Logical ending: PWA install flow is approved locally/staged or returned to FE with exact QA failures.

## Sprint 3 - Controlled Release Package

**Goal:** prepare an exact release package only after Sprint 1 and Sprint 2 are green.

Steps:

7. Release Steward updates safe release manifest with PWA files and exclusions.
8. Deploy Officer receives exact upload scope only after Director approval.
9. Production QA runs post-deploy smoke for auth, language menu, PWA hint/modal, journal, NavDesk, and key service pages.
10. Director writes final gate decision.

Logical ending: production is either verified or rollback/fix owner is assigned with a narrow scope.

## Active Task Links

- `docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0022-pwa-install-reminder-flow.md`
- `docs/brkovic_ltd_project_office/cabinets/qa-ux/task-0015-pwa-install-reminder-smoke.md`

## Secrets Note

FTP, SQL database, and MongoDB access were acknowledged for operational use in this chat context, but credentials must not be written to repository files, reports, logs, screenshots, or worker prompts.
