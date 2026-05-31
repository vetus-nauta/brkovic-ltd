# BRKOVIC.LTD Project Handoff And Release Note - 2026-06-01

**Project:** `brkovic-ltd`
**Local root:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**Branch:** `handoff-2026-05-20-full`
**Live site:** `https://brkovic.ltd/`
**Status:** June 1 work uploaded to live and prepared for GitHub sync.

This note is for WebStorm / the next chat. It contains project state and operational context only. It does not contain passwords, tokens, database credentials, FTP credentials, or private connection strings.

## Start Of Next Chat

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Then read:

```text
docs/brkovic_ltd_project_office/cabinets/director/new-chat-prompt.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/workstreams.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-ship-cashbox-full-audit.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-navdesk-live-style-runtime-reconciliation.md
```

## Live Upload Done

The latest Ship Cashbox package was uploaded directly to production via the configured local FTP access.

Uploaded public files:

```text
ship-cashbox/index.html
ship-cashbox/assets/app.js
ship-cashbox/assets/app.css
ship-cashbox/sw.js
lang/ru.json
lang/en.json
lang/de.json
lang/it.json
lang/es.json
lang/sr.json
lang/zh.json
```

Runtime data was not uploaded:

```text
ship-cashbox/storage/index.json
ship-cashbox/storage/sessions/**/*.json
ship-cashbox/storage/.ship-cashbox-secret
ship-cashbox/storage/exports/*
```

The `.gitignore` protects the cashbox runtime files and keeps only safe placeholders/config guards.

## Ship Cashbox Fixes

Root issues found:

- the treasurer could not enter `Given to treasurer` for a participant before that participant's first sign-in;
- saving a disabled contribution field could push `0` back into the session;
- the `Crew and contributions` workspace could remain visually stale after save;
- invite action was too hidden;
- leaving the cashbox used direct navigation instead of a controlled exit.

Implemented:

- participant contribution fields are editable by the treasurer before first sign-in;
- saving a roster preserves manually entered contribution amounts;
- workspace modals can preserve and refresh their current window after state updates;
- a direct `Invite` action is visible in the treasurer workspace;
- `BRKOVIC.LTD`, `Nav Desk`, and header brand exits open a confirmation modal;
- exit modal explains that data is saved and tied to the current authenticated session/email;
- app cache/version bumped to `20260601-cashbox-audit-01`;
- service worker cache bumped to `ship-cashbox-shell-v20260601-01`;
- multilingual keys added for `ru/en/de/it/es/sr/zh`.

Validation performed:

```text
node --check ship-cashbox/assets/app.js
php -l ship-cashbox/api/index.php
JSON parse check for ru/en/de/it/es/sr/zh
Local Chrome smoke: invite -> enter contribution -> save -> invite link appears -> exit modal opens
Local API smoke: create -> save -> notebook -> confirm settlement -> boot archive contains closed cashbox
Live smoke: production index references 20260601-cashbox-audit-01 and exit modal opens in browser
```

After local tests, cashbox storage was restored to its pre-test state.

## Game Promo / Auth Context

Game promo work is in the same branch:

- `Captain Ether` promo card was added first in the Nav Desk game promo modal;
- the whole card links to `https://game.brkovic.ltd/games/captain-ether`;
- game link behavior was corrected so anonymous users get the main-site auth prompt and authenticated users should be passed through with ecosystem auth;
- live SSO endpoint was smoke-tested with a signed token during this chat; do not expose signing secrets in docs or commits.

Important files:

```text
navdesk.html
css/navdesk.css
js/main.js
admin-api-proxy.php
images/promo/game-captain-ether-preview.webp
pwa-service-worker.js
```

## Admin / SEO / PWA Context

Current repo also contains June admin/SEO work:

- `admin.html` section selector;
- `admin-seo.html` and `admin-seo-api.php`;
- `admin-auth.js`, `admin-panel.js`, `admin-seo.js`;
- SEO identifier fields with masked reveal behavior;
- Google, Bing/Yandex, Clarity and sitemap workflows documented in office reports;
- PWA install reminder flow and language/menu polish.

These files are part of the current project direction and should not be treated as random untracked noise.

## MongoDB Context

MongoDB Atlas project and cluster were created earlier in this working sequence. MongoDB migration is not fully completed as a final primary cutover in this repo note.

Current direction:

- keep MongoDB credentials outside Git;
- do not commit connection strings;
- do not overwrite production backend config blindly;
- use office reports from 2026-05-31 for the next database step.

Relevant reports:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-31-mongodb-atlas-bootstrap-and-initial-load.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-mongodb-backend-public-bridge.md
docs/brkovic_ltd_project_office/director-reports/2026-05-31-mongodb-final-cutover-and-audit.md
```

## Deployment Discipline

- Local source is the reference during polish.
- Production upload must be targeted; do not use mirror-delete mode.
- Do not upload local storage, cookies, sessions, `.env`, `private/config.php`, or runtime exports.
- Do not commit secrets.
- `game.brkovic.ltd` is related but separate; do not mix its full deployment with main-site changes unless explicitly requested.

## Next Recommended Checks

1. On live, manually test Ship Cashbox on mobile:
   - create/open active cashbox;
   - open `Crew and contributions`;
   - invite participant;
   - enter contribution before participant sign-in;
   - save;
   - reload;
   - confirm contribution and invite link remain.
2. Test participant invite link on a separate browser profile.
3. Confirm final settlement moves the cashbox into archive and archive remains after reload.
4. If stable, continue UX polish of Ship Cashbox mobile layout and copy.
