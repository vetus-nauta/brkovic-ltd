# Director Restart Handoff With Atlas - 2026-06-02

**Project:** `brkovic-ltd`  
**Local root:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`  
**Branch:** `handoff-2026-05-20-full`  
**Current GitHub commit:** `06be263`  
**Live site:** `https://brkovic.ltd/`  
**Primary next task:** Ship Cashbox app-quality refactor.

This is the short first-read file for the next Director chat. It intentionally contains no passwords, API keys, FTP credentials, full MongoDB URIs, mail tokens, cookies, or private connection strings.

## Start Here

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
git log -1 --oneline --decorate
```

Then read, in this order:

```text
docs/brkovic_ltd_project_office/cabinets/director/new-chat-prompt.md
docs/brkovic_ltd_project_office/director-reports/2026-06-02-ship-cashbox-next-director-handoff.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-mongodb-final-cutover-and-audit.md
docs/brkovic_ltd_project_office/director-reports/2026-06-01-project-handoff-and-release.md
```

## Current Repo State

The working branch is expected to be clean and synced:

```text
handoff-2026-05-20-full
origin/handoff-2026-05-20-full
commit 06be263 - ship cashbox debt report and director handoff
```

If `git status` shows new dirty files, inspect before editing. Do not reset or revert without understanding who made the changes.

## Atlas / Database State

MongoDB Atlas is connected and is the live primary backend for the journal backend.

Atlas context:

```text
Atlas project: brkovic.ltd
Cluster: brkovic-prod
Database: brkovic_prod
Production backend flag: DATA_BACKEND=mongodb
Journal backend: /journal-backend
```

Final migration report:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-31-mongodb-final-cutover-and-audit.md
```

That report records:

- final PostgreSQL snapshot;
- Mongo load;
- Atlas Network Access correction;
- production switch;
- health result with `databaseProvider: mongodb`;
- public/admin smoke checks.

Protected local Mongo access notes are outside Git:

```text
/home/alexey/.config/brkovic-ltd/README.md
/home/alexey/.config/brkovic-ltd/mongodb.env
/home/alexey/.config/brkovic-ltd/mongodb-reserve-user.env
```

The director may mention file paths and non-secret labels, but must not print passwords or full MongoDB URIs into chat, reports, commits, screenshots, or worker prompts.

Known non-secret Atlas labels:

```text
Primary DB user label: vetusnauta_db_user
Reserve DB user label: vetusnauta_db_brkovic
```

PostgreSQL remains only as rollback source during the first Mongo production window. Do not switch production back unless there is a verified backend failure and the rollback plan from the final cutover report is followed.

## Live Site State

On 2026-06-02, live Ship Cashbox was corrected after a stale partial deploy:

- live `ship-cashbox/index.html` now references `20260602-cashbox-debt-pdf-01`;
- live `ship-cashbox/sw.js` now uses `ship-cashbox-shell-v20260602-01`;
- live `app.js` and local `app.js` byte size matched at verification time;
- live `app.css` and local `app.css` byte size matched at verification time;
- `ship-cashbox/api/index.php` returned `200`.

If the browser still shows old behavior, suspect service worker/browser cache first:

```text
Hard refresh.
If needed, clear site data for brkovic.ltd or unregister the Ship Cashbox service worker.
```

## Main Product Focus Now

The next task is not database migration. The next task is Ship Cashbox product quality.

The user wants Ship Cashbox to become a light, modern PWA-like app, not a long accounting page.

Target screens:

1. Home / active group state.
2. App menu.
3. Team and contributions.
4. Participant card.
5. Invite participant.
6. Expenses / quick notebook.
7. Final settlement.
8. Archive.
9. PDF / print report.
10. Starter provisioning pack.

Critical rule:

```text
Do not break the quick expense notebook.
Do not rewrite working API, handlers, autosave, attachment, photo, scan, invite, or settlement payload logic unless a specific bug requires it.
```

The reference package from the user is:

```text
https://drive.google.com/file/d/1pRrkQSYVUMdOdFTh_k9FqetGedpE97aI/view
```

It showed the desired direction:

- short screens;
- compact mobile app feeling;
- clear bottom/top app navigation;
- no huge headers;
- no long page pretending to be an app;
- airy group creation and invite flow.

## User Requirements To Preserve

- The treasurer creates a group and is treasurer/admin only inside that group.
- Invited participants are participants inside that group, but can be treasurer in another group.
- Participant sees only own expenses and own group-relevant actions.
- Treasurer sees group overview and final settlement.
- Group mode is inferred from actual behavior:
  - if people give money to treasurer, treasurer-mediated settlement applies;
  - if not, direct personal-expense settlement applies.
- Invite email must clearly say:
  - which group invited the participant;
  - what the participant should do;
  - how to accept;
  - how not to lose the group.
- Final settlement must be its own menu page.
- Archive must not show button piles under every card.
- PDF/print report must work from active settlement and archive.
- Mobile keyboard must not make notebook cursor jump.
- Modal windows must scroll internally; page behind modal must not scroll.
- App menu must include:
  - Ship Cashbox menu,
  - Nav Desk / return,
  - language,
  - day/night,
  - login/logout,
  - PWA install,
  - active group indicator.

## Starter Provisioning Pack

Add after the core app shell is stable.

Purpose: a friendly yacht provisioning checklist, not a complicated pricing engine.

MVP:

- people count: 2 to 10;
- days count;
- editable checklist;
- estimated European baseline prices;
- manual price override;
- optional save as a cashbox expense draft or provisioning note.

Suggested categories:

- water and drinks;
- breakfast;
- simple lunches;
- dinners;
- fruit/snacks;
- cleaning/consumables;
- emergency reserve.

Online prices are not required for MVP. If added later, treat them as optional enrichment because shop availability and markup change.

## Local Run

```bash
php -S 127.0.0.1:18091 -t .
```

Open:

```text
http://127.0.0.1:18091/ship-cashbox/index.html
```

Main files:

```text
ship-cashbox/index.html
ship-cashbox/assets/app.js
ship-cashbox/assets/app.css
ship-cashbox/api/index.php
ship-cashbox/sw.js
lang/ru.json
lang/en.json
lang/de.json
lang/es.json
lang/it.json
lang/sr.json
lang/zh.json
```

Local test group:

```text
ship-cashbox/storage/sessions/2026/cashbox_test_weekly_yacht_local_preview_20260602.json
```

Treat storage data as runtime/test data. Do not upload or commit storage unless explicitly directed.

## Validation Before Any Upload

```bash
node --check ship-cashbox/assets/app.js
node --check ship-cashbox/sw.js
php -l ship-cashbox/api/index.php
node - <<'NODE'
const fs = require('fs');
for (const lang of ['ru','en','de','es','it','sr','zh']) {
  JSON.parse(fs.readFileSync(`lang/${lang}.json`, 'utf8'));
  console.log('ok', lang);
}
NODE
git diff --check
```

Manual smoke:

1. Open local Ship Cashbox.
2. Confirm auth does not hang.
3. Open active/test group.
4. Open team/contributions.
5. Invite participant.
6. Save participant/contribution edits.
7. Type in mobile notebook with keyboard open.
8. Submit/save report.
9. Open final settlement page.
10. Save/print PDF.
11. Open archive report.

## Release Discipline

- Local first.
- Production only after local smoke passes.
- Upload targeted files only.
- Do not use mirror-delete mode.
- Do not upload local storage, `.env`, private configs, cookies, sessions, or exports.
- Do not commit secrets.
- If production differs from local, check service worker and version strings before changing code.

## Next Director Assignment

Assign the next sprint as:

```text
Sprint: Ship Cashbox Compact PWA Refactor
Owner: Frontend Engineer
QA: QA/UX
Backend support: only if invite/auth/API bug appears
Release: deploy only after local smoke
```

Definition of done:

- Ship Cashbox opens as a compact app, not a long web page.
- Menu is clear and app-specific.
- No heavy headers on inner mobile screens.
- Team/invite/settlement/archive are separate understandable screens.
- Participant and treasurer views are clearly different.
- Existing notebook, invite, autosave, settlement, archive, PDF paths still work.
- Live upload is versioned and service-worker-safe.
