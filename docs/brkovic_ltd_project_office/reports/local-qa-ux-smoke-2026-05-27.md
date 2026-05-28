# Local QA/UX Smoke Report - BRK-MVP-QAUX-001

**Chat ID:** `CHAT-BRK-QA-UX-001`
**Role:** QA/UX Inspector
**Date:** 2026-05-27
**Working directory:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**Status:** For Director review

## Scope

MVP smoke UX/QA only, without redesign and without extended visual polishing:

- desktop `1440x1000`, tablet `768x1024`, mobile `390x844`;
- main page, all service pages, journal, NavDesk main page and extracted tools;
- day/night behavior, NavDesk disclaimer, forms, contact links, local links, visible breakage, console/page errors.

Preserved boundaries:

- product code not edited;
- copy not rewritten;
- interface not redesigned;
- backend, FTP, production, secrets and private configs not touched;
- production 404 for not-yet-deployed local pages not treated as local MVP blocker;
- valid contact form submit was not executed because local `forms/send.php` can write local security/rate/SMTP logs.

## Sources Read

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `docs/brkovic_ltd_project_office/README.md`
- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md`
- `docs/brkovic_ltd_project_office/chat-registry.md`
- `docs/brkovic_ltd_project_office/task-registry.md`
- `docs/brkovic_ltd_project_office/cabinets/qa-ux/README.md`
- `docs/brkovic_ltd_project_office/cabinets/qa-ux/task-0001-role-intake.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-27-office-setup.md`
- `docs/brkovic_ltd_project_knowledge.md`
- `docs/brkovic_ltd_navdesk_audit_2026-05-25.md`

## Commands And Checks

Start discipline:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Local server:

```bash
php -S 127.0.0.1:18090 -t .
curl -I http://127.0.0.1:18090/index.html
```

Syntax checks:

```bash
node --check js/main.js
node --check js/form.js
node --check js/journal.js
node --check js/navdesk.js
node --check js/delivery-calculator.js
node --check js/management.js
php -l forms/send.php
php -l api/tides/search.php
php -l api/tides/forecast.php
php -l api/tides/window.php
php -l api/delivery-distance.php
php -l admin-api-proxy.php
```

Browser smoke:

- Playwright API from local npm cache, launched with `/usr/bin/google-chrome-stable`.
- 14 local pages x 3 viewports = 42 page loads.
- Collected HTTP status, `console.error`, `pageerror`, failed relevant requests, local 4xx/5xx, horizontal overflow, broken visible images, clipped controls, forms.
- Checked local internal links with browser request context.

## Result Summary

No local MVP blocker found in this smoke.

Passed:

- 42/42 checked page loads returned HTTP 200.
- 0 console errors and 0 page errors in checked browser pass.
- 0 relevant local failed requests.
- 0 local internal link failures.
- 0 horizontal overflow findings on checked desktop/tablet/mobile pages.
- 0 broken visible images in checked pages.
- Main contact form client validation worked for empty required fields and invalid email.
- Contact links were populated from config: phone, WhatsApp, Telegram, Instagram.
- Main contact CTA preselect worked: `?service=Skipper%20Service#contact` selected `Skipper Service`.
- Journal root rendered a multipage collection cover; collection page opened as a book with 25 pages and no mobile overflow.
- NavDesk disclaimer opened on first visit, closed after accept, stayed closed after reload.
- NavDesk day/night switch worked and persisted from `navdesk.html` to `navdesk-ukv.html`.
- NavDesk route, tides manual mode, UKV spelling/profile, watch schedule/entry worked in smoke.
- Delivery calculator worked on mobile after opening advanced parameters.
- Yacht Management first-use disclaimer and calculator modal worked on mobile.

## Findings

### MVP Blockers

None found in local MVP smoke.

### Risks

| ID | Area | Finding | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| QAUX-RISK-001 | Service pages, mobile contact path | Mobile dock markup exists on most service pages but is hidden at `390px`; only home and Yacht Management showed the dock as visible. | `display: none` on `iyt-training`, `skipper-service`, `sailing-tours`, `yacht-acceptance-delivery`, `yacht-registration`; home and management showed `display: grid`. | Requires Director/owner approval. Decide whether hidden service-page mobile dock is intentional. If quick mobile contact is required for MVP, route a small approved CSS correction. |
| QAUX-RISK-002 | NavDesk main | `navdesk.html` says quick functions remain below, but Passage and Abbrev card bodies start collapsed on all checked viewports. Functions work after opening. | `hiddenPassageBody: true`, `hiddenAbbrevBody: true`; calculation and abbreviations passed after opening toggles. | Requires approval if changed. Keep as-is for MVP or approve a small discoverability/content adjustment. |
| QAUX-RISK-003 | Public pages with admin links | Visible admin links are present in public page footer/utility areas. This may be intentional per project notes, but it is a release-gate decision. | `journal.html`: `admin-post`, `admin-comment`; `services/yacht-management.html`: `admin-mnr`. Local links resolve. | Director plus Backend/Admin or Release Steward should confirm upload/public visibility policy. QA/UX did not remove or hide them. |
| QAUX-RISK-004 | Visual QA residual | This was an MVP smoke, not a multi-hour visual polish pass. Pixel-perfect review, screenshot annotation and long-form visual regression were not performed after Director clarification. | Browser smoke covered breakage/overflow/broken images/clipped controls, but not exhaustive visual judgement. | Accept as residual risk for MVP, or assign a later visual polish pass after release gate decisions. |

### Post-Release

| ID | Area | Finding | Recommendation |
| --- | --- | --- | --- |
| QAUX-POST-001 | `navdesk-english.html` | Page is a placeholder for a future marine English learning tool. It loads cleanly and has disclaimer/theme/footer, but it is not a finished tool. | Not an MVP blocker if accepted as planned placeholder. If it should be a shipped tool, assign a separate NavDesk function task. |
| QAUX-POST-002 | Contact form backend path | Real successful submit was intentionally not tested locally to avoid writing local mail/security/rate logs and touching SMTP behavior. Client validation and visible states passed. | Backend/Admin can own server submit verification in its audit. |

## Coverage Details

Pages loaded on desktop/tablet/mobile:

- `/index.html`
- `/services/yacht-management.html`
- `/services/iyt-training.html`
- `/services/skipper-service.html`
- `/services/sailing-tours.html`
- `/services/yacht-acceptance-delivery.html`
- `/services/yacht-registration.html`
- `/journal.html`
- `/navdesk.html`
- `/navdesk-watch.html`
- `/navdesk-tides.html`
- `/navdesk-route.html`
- `/navdesk-ukv.html`
- `/navdesk-english.html`

Additional targeted checks:

- `/journal.html?collection=chelovecheskoe-i-morskoe`
- `/index.html?service=Skipper%20Service#contact`
- Yacht Management disclaimer and calculator modal on mobile
- Delivery calculator advanced mobile state
- NavDesk disclaimer TTL behavior and day/night persistence

## Gate Opinion

Local MVP smoke is acceptable for Director review. I do not see a QA/UX release blocker from the checked local surfaces. Remaining items are decision/risk items rather than automatic redesign tasks.

Scope preserved: product code, copy, SEO files, backend, FTP, production, secrets and private configs were not touched.
