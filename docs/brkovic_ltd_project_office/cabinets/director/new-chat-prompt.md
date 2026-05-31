# BRKOVIC.LTD Director Handoff For New Chat

**Updated:** 2026-06-01
**Project:** `brkovic.ltd`
**Local root:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**Branch:** `handoff-2026-05-20-full`
**Role:** Director of BRKOVIC.LTD MVP

This is the first file for the next Director chat.

## Latest June 1 Handoff

Read this current handoff before continuing production work:

```text
docs/brkovic_ltd_project_office/director-reports/2026-06-01-project-handoff-and-release.md
```

It records the June 1 live upload, Ship Cashbox fixes, game promo/auth fixes, current deployment discipline, and the next-chat operating notes. It intentionally contains no secrets.

## Start Exactly Here

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Then read:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/workstreams.md
```

## Non-Negotiable Director Rule

**Director is not the coder.**

The Director:

- reads reports;
- assigns tasks;
- names owners;
- protects scope;
- opens and closes release gates;
- asks for proof;
- updates office files;
- decides what is approved, blocked, or next.

The Director does not personally drift into implementation unless the owner explicitly asks for an emergency direct fix. If implementation is needed, assign it to the correct cabinet:

- frontend: `docs/brkovic_ltd_project_office/cabinets/frontend-engineer/`
- backend: `docs/brkovic_ltd_project_office/cabinets/backend-engineer/`
- localization: `docs/brkovic_ltd_project_office/cabinets/localization-architect/`
- QA/UX: `docs/brkovic_ltd_project_office/cabinets/qa-ux/`
- SEO Director: `docs/brkovic_ltd_project_office/cabinets/seo-integration-director/`
- release/deploy: `docs/brkovic_ltd_project_office/cabinets/deploy/`

When using subagents, keep them under watcher control. Record and close them through:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-28-agent-control-log.md
```

## Scope Discipline

Current phase is MVP stabilization and controlled release, not redesign.

- Do not run `git reset`, `git checkout --`, or `git clean`.
- Do not revert dirty work made by the owner or earlier chats.
- Do not expose secrets, credentials, cookies, local config, API keys, database details, or FTP data in reports.
- Do not rewrite the owner's Russian voice without meaning approval.
- Do not redesign pages by initiative.
- Do not deploy production by implication.
- Do not mix `Revoyacht/yacht-flex-demo` into this project.
- Do not treat `game.brkovic.ltd` as the main project. It is related only through auth/game ecosystem rules.

## Current High-Level Product State

The local and live MVP have moved beyond the old static-only site.

Main areas now active:

- public service pages;
- `journal.html` public ship journal;
- `admin-posts.html` and `admin-comments.html` for journal/admin workflow;
- NavDesk hub and tool pages;
- tool-auth gate for protected actions;
- language interface roadmap;
- server-side AI translation/admin direction;
- office/cabinet workflow for Director-led work.

## Latest Work Included In This Git Sync

### 1. Public Tool Authentication

Shared tool access was added for protected actions:

- email 6-digit code flow;
- Google sign-in flow;
- account chip/avatar in the topbar after auth;
- protected actions prompt for access before work begins;
- registered user's email can autofill contact/email fields;
- protected game entry must reuse main-site auth and not ask for a second login.

Important files:

```text
js/main.js
admin-api-proxy.php
game.brkovic.ltd/docs/ecosystem-auth-plan.md
game.brkovic.ltd/docs/ecosystem-auth-guardrail.md
game.brkovic.ltd/docs/new-chat-handoff-2026-05-26.md
```

Important rule for games:

```text
brkovic.ltd is the identity entry point.
If the user enters a game from the main site after tool-auth, the game must not ask for a second login.
```

### 2. Journal Auth, Likes, Comments

Journal likes and comments are now intended for authenticated users only.

Work done:

- likes/comments call shared auth gate;
- repeated anonymous like inflation was addressed;
- comment form no longer needs an email field;
- auth profile can supply identity;
- public journal API proxy path was opened locally where needed;
- live backend was smoke-tested for auth-required journal reactions earlier in the sprint.

Important files:

```text
js/journal.js
admin-api-proxy.php
docs/brkovic_ltd_project_office/reports/journal-auth-reader-polish-2026-05-30.md
```

### 3. Journal Reader / Multi-Page Book UX

The multi-page journal collection reader was reworked toward an iBooks-like model without changing admin data contracts.

Work done:

- collection reader remains driven by backend/admin data;
- no ID/API/content ownership model was intentionally changed;
- book pages scroll horizontally through the existing reader mechanics;
- cover page, chapter list, read buttons and page progress are part of the reader;
- rights, likes, comments and share now live inside the bottom of the book instead of floating as a forgotten footer;
- journal footer and header are aligned to the same content frame;
- Instagram was removed from the top header globally but left where appropriate in the journal footer;
- `journal.html`, `css/journal.css`, and `js/journal.js` were deployed to live during this sprint.

Important files:

```text
journal.html
css/journal.css
js/journal.js
css/main.css
```

Live note:

```text
https://brkovic.ltd/journal.html
https://brkovic.ltd/journal.html?collection=chelovecheskoe-i-morskoe
```

### 4. Service Page Paths On Live

During deploy verification, `/services/...` URLs on production returned `404` because the live FTP root had service pages in root but no `services/` directory.

Action taken:

- created `/public_html/services/` on live;
- uploaded current service HTML files there;
- root-level service copies still exist on live as legacy copies.

Important implication:

- Do not delete either location blindly until the release/deploy cabinet audits URL strategy.
- Website links should keep using `/services/...`.

### 5. Language / Localization Direction

The old `RU/EN` mental model is not the target model.

Target model from owner/handoffs:

```text
EN primary
RU additional
DE
IT
ES
SR / MNE / HR regional Serbian/Croatian/Montenegrin direction
ZH Mandarin
```

Work done:

- language menu moved toward modal language selection;
- legacy visible `RU/EN` switcher direction was rejected;
- system-language selection hint remains required;
- OpenAI/admin translation work must be server-side only;
- language roadmap reports and task files are in office.

Important files:

```text
js/language.js
js/admin-posts.js
admin-posts.html
tools/journal-admin-translation-smoke.sh
docs/brkovic_ltd_project_office/cabinets/localization-architect/
docs/brkovic_ltd_project_office/reports/language-roadmap-sprint-03-2026-05-29.md
docs/brkovic_ltd_project_office/reports/journal-language-sprint-2026-05-29-checklist.md
```

### 6. OpenAI / AI Translation Admin Boundary

OpenAI work is a server-side admin workflow.

Rules:

- no OpenAI key in browser JS;
- no OpenAI key in Git;
- no OpenAI key in reports;
- admin sends canonical Russian source to backend;
- backend creates translation/SEO drafts for target languages;
- owner reviews before publish.

Important files:

```text
docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0005-enable-live-journal-translation-provider.md
docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0006-journal-translation-production-hardening.md
docs/brkovic_ltd_project_office/reports/backend-engineer-live-journal-translation-provider-2026-05-29.md
docs/brkovic_ltd_project_office/reports/backend-engineer-journal-translation-production-hardening-2026-05-29.md
```

### 7. NavDesk Current Rule

NavDesk has special rules different from normal site sections:

- keep disclaimer behavior;
- keep day/night skin;
- do not lose tool state on refresh;
- tool actions may require auth;
- continue working by small functional sprints, not redesign.

Known main areas:

```text
navdesk.html
navdesk-watch.html
navdesk-tides.html
navdesk-route.html
navdesk-ukv.html
navdesk-english.html
css/navdesk.css
js/main.js
```

Related reports:

```text
docs/brkovic_ltd_project_office/reports/navdesk-tides-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-api-2026-05-27.md
docs/brkovic_ltd_project_office/reports/navdesk-tides-weekly-graph-frontend-2026-05-27.md
docs/brkovic_ltd_project_office/reports/navdesk-watch-localization-first-fixes-2026-05-27.md
docs/brkovic_ltd_project_office/reports/navdesk-frontend-polish-sprint-2026-05-27.md
```

### 8. SEO Office

SEO is now Director-level, not just language cleanup.

Use:

```text
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/new-chat-prompt.md
```

SEO Director owns:

- page intent;
- live search readiness;
- schema;
- sitemap/robots;
- hreflang after real language URLs exist;
- per-page SEO agents for home, services, journal, NavDesk pages and Maritime English.

### 9. Production / FTP / Backend Reality

Do not write secrets into Git.

Current reality:

- FTP access exists on this Linux machine outside Git;
- production static frontend files have been deployed during this sprint;
- live journal backend exists on production API, not as a full backend source tree in this frontend repo;
- local `admin-api-proxy.php` bridges allowed calls to live API where needed;
- database access should be treated as server-side/backend territory, not direct local mutation.

Important old notes:

```text
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
```

### 10. Ship Cashbox Current State

`Ship Cashbox` is now an implemented Nav Desk tool and should not be rethought from zero in the next chat.

Current technical state:

- tool root:
  - `ship-cashbox/index.html`
  - `ship-cashbox/assets/app.js`
  - `ship-cashbox/assets/app.css`
  - `ship-cashbox/api/index.php`
  - `ship-cashbox/sw.js`
- entry card exists in `navdesk.html`;
- page is already under the accepted Nav Desk tool shell;
- stale post-login runtime was fixed through `ship-cashbox` service-worker/cache changes;
- participant + treasurer notebooks, sync, archive/reopen, print/PDF, receipt attachments and light PDF scan are already implemented;
- financial model was reworked to a single user-facing flow:
  - participants may spend personally;
  - participants may hand money to the treasurer at any moment;
  - treasurer may then spend from physically held group money;
  - settlement auto-resolves between direct transfers and treasurer-mediated payout/top-up behavior.

Do not restart this feature as a redesign task by default.

Read before assigning more work:

```text
docs/brkovic_ltd_project_office/reports/frontend-ship-cashbox-delivery-2026-05-31.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-ship-cashbox-review-handoff.md
```

Current review expectation:

- Frontend Manager checks shell/runtime/page-discipline fit;
- QA Director / QA-UX reruns browser/device and financial scenarios;
- SEO Director checks copy/metadata honesty and no accidental surface drift.

## Current Office Map

Start with:

```text
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/workstreams.md
docs/brkovic_ltd_project_office/task-registry.md
```

Important cabinets:

```text
docs/brkovic_ltd_project_office/cabinets/director/
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/
docs/brkovic_ltd_project_office/cabinets/backend-engineer/
docs/brkovic_ltd_project_office/cabinets/localization-architect/
docs/brkovic_ltd_project_office/cabinets/qa-ux/
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/
docs/brkovic_ltd_project_office/cabinets/deploy/
docs/brkovic_ltd_project_office/cabinets/production-qa/
```

Reports live in:

```text
docs/brkovic_ltd_project_office/reports/
docs/brkovic_ltd_project_office/director-reports/
```

## Next Director Checklist

1. Run `git status --short --branch`.
2. Confirm latest GitHub commit is present locally.
3. Read this file and the mandatory office files.
4. Check whether owner wants local work, live deploy, or office coordination.
5. Do not code by default. Assign the right cabinet.
6. If a direct emergency fix is requested, make the smallest scoped patch and record it.
7. Keep production deploys explicit: exact files, backup, smoke, report.
8. Keep language goals broader than RU/EN.
9. Keep OpenAI server-side.
10. Keep journal admin/data contracts intact unless backend/admin task says otherwise.

## Suggested First Message For New Director Chat

```text
Я директор BRKOVIC.LTD MVP, не кодер. Сначала читаю office discipline, task registry, workstreams and this handoff. Затем сверяю git status and current owner request. Реализацию отдаю профильным кабинетам, сам закрываю решения, контроль, отчеты and gates.
```
