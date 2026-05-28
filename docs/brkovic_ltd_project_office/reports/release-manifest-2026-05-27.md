# BRKOVIC.LTD MVP Release Manifest

**Task ID:** `BRK-MVP-REL-001`
**Chat ID:** `CHAT-BRK-RELEASE-001`
**Role:** Release Steward
**Date:** 2026-05-27
**Working directory:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**Phase:** MVP stabilization, not redesign
**Status:** Manifest prepared for Director gate review. This is not deploy approval.

## Source Documents Read

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `docs/brkovic_ltd_project_office/README.md`
- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md`
- `docs/brkovic_ltd_project_office/chat-registry.md`
- `docs/brkovic_ltd_project_office/task-registry.md`
- `docs/brkovic_ltd_project_office/cabinets/release-steward/README.md`
- `docs/brkovic_ltd_project_office/cabinets/release-steward/task-0001-role-intake.md`
- supporting public repository maps: `README.md`, `REPOSITORY_MAP.md`, `PATHS_QUICK.md`
- supporting NavDesk audit: `docs/brkovic_ltd_navdesk_audit_2026-05-25.md`

## Local Git State

Initial command was run as required:

```bash
git status --short --branch
```

Observed state:

- branch: `handoff-2026-05-20-full...origin/handoff-2026-05-20-full [ahead 10]`
- worktree is dirty;
- modified tracked files include core site pages, CSS, JS, language JSON, service pages, tide API, project docs, and tools;
- untracked main-site release-relevant files include `api/delivery-distance.php`, `js/delivery-calculator.js`, `images/services/yacht-registration-hero.png`, and split NavDesk pages;
- `game.brkovic.ltd/` is untracked in this repository state and is excluded from the main `brkovic.ltd` package by Director rule;
- ignored/private files exist locally by name, including `api/delivery-distance.config.php` and `game.brkovic.ltd/private/config.php`; contents were not copied into this report.

Release risk: the deploy candidate is not a clean committed tree. Director should either approve this exact local dirty candidate or require a commit/tag/staged package before deploy.

## Release Scope

Main package: local `brkovic.ltd` MVP only.

Included product areas:

- public site root pages;
- service pages;
- journal public surface;
- NavDesk public surface and split tool pages;
- public static assets;
- public CSS/JS/language bundles;
- forms endpoint and protection file;
- local PHP API endpoints required by NavDesk and management tooling;
- admin pages/endpoints only as gated MVP admin surfaces after Backend/Admin review.

Explicitly not included:

- `game.brkovic.ltd/`;
- production FTP state;
- backend server private directories;
- secrets, live configs, sessions, logs, locks, local test outputs;
- redesign/interface changes.

## Files And Folders To Upload

Upload paths are relative to the production document root for `brkovic.ltd`.

### Public Root

- `.htaccess` after backup and config review;
- `404.html`;
- `index.html`;
- `index.php`;
- `journal.html`;
- `navdesk.html`;
- `navdesk-watch.html`;
- `navdesk-tides.html`;
- `navdesk-route.html`;
- `navdesk-ukv.html`;
- `navdesk-english.html`;
- `robots.txt`;
- `sitemap.xml`;
- `site.webmanifest`;
- `.well-known/pki-validation/D3FB85B2331D07314F87E42F9307E161.txt` only if this validation file is still required on production. Do not delete other remote `.well-known/` files.

### Service Pages

- `services/iyt-training.html`;
- `services/sailing-tours.html`;
- `services/skipper-service.html`;
- `services/yacht-acceptance-delivery.html`;
- `services/yacht-management.html`;
- `services/yacht-registration.html`.

### Static Assets

- `brand/`;
- `favicons/`;
- `images/hero/`;
- `images/icons/`;
- `images/services/`.

Important untracked asset required by current pages:

- `images/services/yacht-registration-hero.png`.

### CSS

- `css/variables.css`;
- `css/main.css`;
- `css/responsive.css`;
- `css/journal.css`;
- `css/journal-single.css`;
- `css/navdesk.css`;
- `css/admin-comments.css`;
- `css/admin-management.css`;
- `css/admin-posts.css`.

### JavaScript

- `js/config.js`;
- `js/form.js`;
- `js/language.js`;
- `js/main.js`;
- `js/weather.js`;
- `js/journal.js`;
- `js/management.js`;
- `js/navdesk.js`;
- `js/delivery-calculator.js`;
- `js/admin-comments.js`;
- `js/admin-management.js`;
- `js/admin-posts.js`.

Important untracked JS required by current Yacht Management / delivery calculation flow:

- `js/delivery-calculator.js`.

### Language Files

- `lang/en.json`;
- `lang/ru.json`.

### Public Data

These files are part of current local public/admin behavior but require production backup before overwrite:

- `data/journal-public.json`;
- `data/journal-gps.json`;
- `data/journal-gps-version.json`;
- `data/management-pricing.json`.

Special rule: do not blindly overwrite live-edited production data. If production has fresher admin/journal content, deploy must merge or preserve production data.

### Forms

- `forms/.htaccess`;
- `forms/send.php`.

Do not upload `forms/config.php`, form logs, or rate-limit state.

### API And Admin Surfaces

Upload only after Backend/Admin gate confirms the server boundary:

- `api/tides/search.php`;
- `api/tides/forecast.php`;
- `api/tides/window.php`;
- `api/delivery-distance.php`;
- `admin-api-proxy.php`;
- `management-admin-api.php`;
- `admin-comments.html`;
- `admin-management.html`;
- `admin-mnr.html`;
- `admin-posts.html`.

Special rule for `api/.htaccess`: it contains Passenger configuration for `/api` and should be treated as production/server config. Back it up and overwrite only if Backend/Admin explicitly confirms the local file is the intended production config.

### Legacy Redirect Stubs

These may be uploaded only if Director confirms the current ops migration redirects should remain in the main site package:

- `ops-login.html`;
- `ops/index.html`;
- `admin/ops/index.php`.

They are not active product surfaces for this MVP and should not be used to reopen ops/admin scope.

## Files And Folders To Exclude

Exclude from the main `brkovic.ltd` release package:

- `.git/`;
- `.gitignore`;
- `AGENTS.md`;
- `PROJECT_RULES.md`;
- `README.md`;
- `README.txt`;
- `PATHS_QUICK.md`;
- `REPOSITORY_MAP.md`;
- `docs/` except a separately approved public document;
- `docs/brkovic_ltd_project_office/`;
- `game.brkovic.ltd/`;
- `test-results/`;
- `tools/`;
- `forms/config.example.php`;
- `forms/config.php`;
- `forms/smtp-error.log`;
- `forms/form-security.log`;
- `forms/form-rate-limit.json`;
- `forms/form-rate-limit.lock`;
- `api/delivery-distance.config.example.php`;
- `api/delivery-distance.config.php`;
- `data/management-projects.json`;
- `error_log`;
- `.ftpquota`;
- `.listing`;
- any `*.bak`, `*.bak*`, `*.bad*`, `*.broken*`, `*.readonly.bak`;
- local experimental folders listed in `.gitignore`: `public_html_nested/`, `revoyacht/`, `yacht-flex-demo/`;
- root duplicate legacy files `navdesk.css` and `navdesk.js` unless a separate check proves production still references them.

`docs/cv.pdf` was found in the repository, but no current public page/sitemap reference was observed during this manifest pass. Treat it as excluded unless Director explicitly marks it as public release content.

## Production Files Requiring Backup Before Overwrite

Back up before any overwrite:

- root routing/config: `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `.well-known/`;
- root pages: `index.html`, `index.php`, `404.html`, `journal.html`, `navdesk*.html`, admin HTML pages;
- service pages under `services/`;
- all CSS under `css/`;
- all JS under `js/`;
- all language files under `lang/`;
- all public asset folders: `brand/`, `favicons/`, `images/`;
- form runtime files to be replaced: `forms/.htaccess`, `forms/send.php`;
- API/admin runtime files: `api/tides/*.php`, `api/delivery-distance.php`, `admin-api-proxy.php`, `management-admin-api.php`;
- `api/.htaccess` separately, because it may be environment-specific Passenger configuration;
- public data files: `data/journal-public.json`, `data/journal-gps.json`, `data/journal-gps-version.json`, `data/management-pricing.json`;
- any production-only `data/management-projects.json`, if present, must be backed up and preserved.

Backup should be a timestamped remote snapshot or download of the exact target paths before upload. Do not use mirror-delete mode.

## Private Or Server-Only Files That Must Not Be Overwritten

Do not upload, overwrite, print, or replace:

- `forms/config.php`;
- `api/delivery-distance.config.php`;
- `/home/brkovic/private/distance-tools.php`;
- `/home/brkovic/private/worldtides.php`;
- production SMTP settings;
- FTP credentials;
- cookies, sessions, CSRF values, login codes, `.netrc`, API tokens, billing tokens, database credentials;
- `forms/smtp-error.log`;
- `forms/form-security.log`;
- `forms/form-rate-limit.json`;
- `forms/form-rate-limit.lock`;
- production `data/management-projects.json`;
- production journal/backend data not represented by a Director-approved migration;
- `game.brkovic.ltd/private/config.php`;
- `game.brkovic.ltd/storage/*`;
- `game.brkovic.ltd/prototypes/watch-officer-godot/exports/*`.

Server-only config note:

- `api/delivery-distance.php` searches for `/home/brkovic/private/distance-tools.php` first and then local `api/delivery-distance.config.php`. Production should use the private path or an existing server-only config. The local ignored config must not be uploaded.
- Tide window/forecast endpoints depend on `/home/brkovic/private/worldtides.php` in production. Without it, production requests should be expected to fail rather than use local mock behavior.

## Unknowns And Blockers

- Worktree is not clean. The release package must be approved against this exact local state or frozen into a commit/tag before deploy.
- No FTP/production inspection was performed by this role. Remote-only files and fresher live data are unknown.
- `api/.htaccess` contains production Passenger config for `/api`; overwrite requires Backend/Admin confirmation.
- `data/management-pricing.json`, `data/journal-public.json`, and journal GPS data may be live-edited or backend-generated on production. Backup/merge decision is required before overwrite.
- `data/management-projects.json` is ignored and may exist only on production. It must be preserved.
- `api/delivery-distance.php` is untracked and depends on a private Distance Tools billing token. Backend/Admin must confirm production config exists before enabling this endpoint publicly.
- `api/tides/forecast.php` and `api/tides/window.php` depend on a private WorldTides config on production. Backend/Admin must confirm config exists before treating tide auto-mode as release-ready.
- `navdesk.html` links to `https://game.brkovic.ltd/`; game platform availability is separate and `game.brkovic.ltd/` is not part of this main-site package.
- `navdesk.css` and `navdesk.js` at repository root are old duplicate files according to the NavDesk audit. Do not delete remote copies until production references are checked, but do not include them in the main upload candidate.
- `sitemap.xml` currently lists the home page, service pages, and `journal.html`; NavDesk pages are not listed. This is for SEO/I18N gate review, not a Release Steward interface or content change.

## Recommended Deploy Order

1. Director approves exact deploy scope after Release, QA/UX, SEO/I18N, and Backend/Admin reports.
2. Deploy Officer creates a timestamped production backup of all target paths and any production-only data/config paths listed above.
3. Confirm no mirror-delete mode will be used. Unknown remote files, `.well-known/`, private config, logs, sessions, and production-only data must be preserved.
4. Upload static assets first: `brand/`, `favicons/`, `images/`.
5. Upload CSS, JS, and language files: `css/`, `js/`, `lang/`.
6. Upload service pages and public root HTML/PHP pages, excluding admin/API until backend gate is clear.
7. Upload NavDesk pages and required NavDesk endpoints only after confirming `api/tides/*` and private WorldTides config readiness.
8. Upload form endpoint files: `forms/send.php`, `forms/.htaccess`; preserve `forms/config.php` and runtime logs/state.
9. Upload gated API/admin files only after Backend/Admin approval: `api/tides/*`, `api/delivery-distance.php`, `admin-api-proxy.php`, `management-admin-api.php`, admin HTML/CSS/JS.
10. Handle `api/.htaccess` last and only if confirmed; otherwise preserve production version.
11. Upload `.htaccess`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` after route/config review.
12. Run post-deploy Production QA smoke only after Director opens the production QA gate.

## Checks Performed

- `git status --short --branch`;
- required office/game-director document reads;
- repository file inventory with `find`;
- tracked/untracked/ignored inventory with `git ls-files`, `git ls-files --others --exclude-standard`, `git ls-files --others --ignored --exclude-standard`, and `git status --short --ignored`;
- changed-file inventory with `git diff --name-only`;
- reference scan with `rg` for NavDesk split pages, API endpoints, delivery calculator, admin surfaces, assets, sitemap/robots references;
- safe reads of public configs/examples and server routing files: `.htaccess`, `api/.htaccess`, `forms/.htaccess`, `forms/config.example.php`, `api/delivery-distance.config.example.php`;
- no tests or production checks were run; documentation-only task.

## Scope Preserved

- Product code not edited.
- Interface/design not changed.
- Production, FTP, backend server, and secrets not touched.
- `game.brkovic.ltd/` not included in the main `brkovic.ltd` deploy package.
- No `git reset`, `git checkout --`, or `git clean` was run.
