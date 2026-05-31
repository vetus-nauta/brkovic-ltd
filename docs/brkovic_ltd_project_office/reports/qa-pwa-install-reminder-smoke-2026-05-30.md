# QA Report - PWA Install Reminder Smoke

**Task ID:** BRK-MVP-QAUX-015  
**Date:** 2026-05-30  
**Owner:** BRKOVIC.LTD QA worker  
**Status:** PASS

## Scope

Local/staged public-page smoke only. Product code, backend, database, FTP, and production deploy were not touched.

Pages checked:

- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-watch.html`
- `services/yacht-management.html`
- `services/iyt-training.html`

Viewports checked:

- Desktop: 1440 x 900
- Tablet: 820 x 1180
- Mobile: 390 x 844
- Platform-copy spot checks: Playwright `iPhone 13` and `Pixel 5`

## Method

- Served the site locally with `python3 -m http.server 4173`.
- Tested at `http://127.0.0.1:4173/`.
- Used Playwright Chromium via the local `npx playwright` installation.
- Playwright was present, but its expected Chromium binary was missing initially. Ran `npx playwright install chromium`, then executed the browser smoke.
- No screenshots were required; assertions were DOM/state based.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Fresh first paint: no large PWA modal | PASS | `#pwaInstallModal` absent/not visible on desktop, tablet, mobile first paint. |
| Scroll >=35% shows compact hint when eligible | PASS | `#pwaInstallHint.is-visible` appeared after scroll on desktop, tablet, mobile; no large modal auto-opened. |
| Closing hint suppresses immediate repeat across reload | PASS | Close wrote future `dismissedUntil` under `brkovic_pwa_install_state_v1`; hint stayed suppressed after reload and scroll. |
| Seed 3 distinct visit days allows reminder again | PASS | Seeded 3 visit days in 7-day window with no dismissal/install suppression; hint appeared after reload. |
| Site menu opens modal while auto reminder suppressed | PASS | With future `dismissedUntil`, scroll did not show hint; menu item opened `#pwaInstallModal`. |
| Escape/overlay/close/continue close modal cleanly | PASS | All close paths hid modal and cleared `management-modal-open` when no modal remained. |
| Standalone/PWA simulation suppresses automatic UI | PASS | Simulated `(display-mode: standalone)` plus `navigator.standalone`; automatic hint/modal stayed hidden. |
| Honest offline copy visible | PASS | Modal includes internet caveat for fresh tide/place/online checks and notes saved pages/manual calculations remain available. |
| iOS/iPad and Android copy | PASS | iOS path showed Share -> Add to Home Screen instructions; Android path showed install/add-to-home-screen instructions. |
| Auth/language/disclaimer/journal regression sweep | PASS | PWA modal did not overlap first paint; menu/language modal remained reachable; NavDesk disclaimer and yacht-management disclaimer were present; journal read path did not reopen PWA UI. |

## Notes

- `navdesk.html` and `navdesk-watch.html` correctly open the NavDesk terms modal first. The smoke verified that path, accepted it, then tested the PWA menu flow behind it.
- The browser `beforeinstallprompt` system prompt itself was not forced; Chromium fallback/manual instruction behavior was verified, and menu access remains available.

## Verdict

PASS. The install reminder flow is non-repetitive, manually reachable from the site menu, removable through all tested close controls, suppressed in standalone simulation, and visually/behaviorally compatible with the checked auth, language, disclaimer, and journal paths.
