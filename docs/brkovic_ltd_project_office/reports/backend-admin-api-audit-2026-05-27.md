# Backend/Admin/API Audit - 2026-05-27

**Task:** `BRK-MVP-BE-001`
**Chat:** `CHAT-BRK-BACKEND-001`
**Status:** for Director review
**Scope:** local backend/admin/API boundary audit before MVP upload. No product code, FTP, production backend, database, live secrets, or interface files were changed.

## Source documents read

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `docs/brkovic_ltd_project_office/README.md`
- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md`
- `docs/brkovic_ltd_project_office/chat-registry.md`
- `docs/brkovic_ltd_project_office/task-registry.md`
- `docs/brkovic_ltd_project_office/cabinets/backend-admin/README.md`
- `docs/brkovic_ltd_project_office/cabinets/backend-admin/task-0001-role-intake.md`
- `docs/brkovic_ltd_project_office/cabinets/seo-i18n/task-0002-ai-multilingual-admin-architecture.md`
- `docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md`
- `docs/brkovic_ltd_journal_audit_2026-05-25.md`
- `docs/brkovic_ltd_navdesk_audit_2026-05-25.md`

Additional local context read for release boundary alignment:

- `docs/brkovic_ltd_project_office/reports/release-manifest-2026-05-27.md`
- local journal backend working copy at `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`, schema/routes only; no `.env`, no DB connection, no FTP.

## Git state at intake

Command run first from `/home/alexey/GitHub/Revoyacht/brkovic-ltd`:

```bash
git status --short --branch
```

Result summary: branch `handoff-2026-05-20-full...origin/handoff-2026-05-20-full`, ahead by 10 commits, with many pre-existing modified and untracked files. This report is the only file written by this task.

## Checks run

### PHP syntax

Passed:

- `php -l admin-api-proxy.php`
- `php -l management-admin-api.php`
- `php -l forms/send.php`
- `php -l forms/config.example.php`
- `php -l api/delivery-distance.php`
- `php -l api/delivery-distance.config.example.php`
- `php -l api/delivery-distance.config.php`
- `php -l api/tides/search.php`
- `php -l api/tides/forecast.php`
- `php -l api/tides/window.php`
- `php -l admin/ops/index.php`

Skipped by design:

- `php -l forms/config.php` could not run because `forms/config.php` is not present locally. This matches the server-only/ignored config rule. Production must already have this file or receive it through a private server config workflow, never by replacing it from Git.

### JavaScript syntax

Passed:

- `node --check js/admin-posts.js`
- `node --check js/admin-comments.js`
- `node --check js/admin-management.js`
- `node --check js/journal.js`
- `node --check js/navdesk.js`
- `node --check js/delivery-calculator.js`
- `node --check js/form.js`
- `node --check js/management.js`

### Journal backend schema/build checks

Run in local backend working copy only:

- `DATABASE_URL=<dummy local validation URL> npx prisma validate` - passed.
- `npm run build` - passed.
- Backend working copy remained clean after build.

### Local API smoke checks

Temporary PHP built-in server on `127.0.0.1:18128`; no production mutation and no valid secret-backed provider calls:

- `GET /api/tides/search.php?q=Kotor` - `200`, `ok`, one matching result.
- `GET /api/tides/forecast.php?...Kotor...` - `200`, `ok`, `source=local-mock`.
- `POST /api/tides/window.php` with local JSON - `200`, `ok`, `source=local-mock`.
- `GET /api/delivery-distance.php` - `405`, expected method boundary.
- `POST /api/delivery-distance.php` with invalid JSON - `400`, expected parser boundary.
- `GET /management-admin-api.php?diagnostics=1` - `200`, local authenticated diagnostics.
- `GET /admin-api-proxy.php?path=/admin/not-allowed` - `403`, expected whitelist rejection.
- `GET /forms/send.php` - `405`, expected method boundary.

Tool note: `jq` is not installed on this machine; JSON readback was done with PHP CLI.

## Findings

### 1. Overall MVP backend/admin status

No syntax blockers were found in the checked PHP and JS backend/admin-facing files. Local negative smoke tests confirm expected method and route rejection for form, delivery API, and admin proxy boundaries.

Release gate still needs server-side confirmation of private runtime files on production. The local repository intentionally cannot prove live SMTP, WorldTides, Distance Tools, production data freshness, or journal DB state without a separate deploy/production audit task.

### 2. Contact form and server-only config

Relevant files:

- `forms/send.php`
- `forms/.htaccess`
- `forms/config.example.php`
- runtime-only `forms/config.php`

The form endpoint is POST-only, checks same-site origin/referer, uses honeypot fields, age/token checks, length limits, service allowlist, spam pattern checks, and rate limiting. Runtime state/log files are written under `forms/` and are ignored/protected:

- `forms/smtp-error.log`
- `forms/form-security.log`
- `forms/form-rate-limit.json`
- `forms/form-rate-limit.lock`

`forms/.htaccess` denies direct access to `config.php` and these runtime files. This boundary is correct for MVP.

Important gate note: `forms/config.php` is not in the local repo and must not be uploaded from Git or replaced with `forms/config.example.php`. Production must preserve its existing SMTP/recipient configuration. If production lacks it, form submissions will fail with a configured error instead of sending mail.

Risk note: the form token salt exists in both `js/form.js` and `forms/send.php`; treat it as an anti-bot friction layer, not as a secret security token. The stronger boundary is same-site check, rate limiting, validation, and private SMTP config.

### 3. `admin-api-proxy.php` allowed routes

Allowed route patterns currently include:

- `/auth/login`, `/auth/logout`, `/auth/me`
- `/admin/posts` and nested post/media/reorder paths
- `/admin/journal-groups`
- `/admin/journal-collections`
- `/admin/comments`
- `/admin/gps/rebuild`

The proxy rejects empty paths, paths without leading `/`, CR/LF, path traversal, and routes outside the allowlist. Local smoke confirmed `/admin/not-allowed` returns `403`.

Boundary note: production admin JS uses `/api` directly; local admin JS uses `/admin-api-proxy.php?path=` for local preview. If this proxy is uploaded to production, it is still a functioning same-origin proxy to `https://brkovic.ltd/api` for the allowlisted routes. That is not an immediate syntax blocker, but the deploy gate should decide whether production needs the file or whether it is only a local helper.

Security note: the proxy stores only the `ship_journal_admin` cookie pair in the PHP session and does not print cookie contents. Do not log or expose this session value.

### 4. Journal API assumptions

Frontend assumptions found in `js/journal.js`:

- public index: `/api/public/journal`
- public collection index/detail: `/api/public/journal/collections`, `/api/public/journal/collections/:slug`
- post comments/likes: `/api/public/journal/:slug/comments`, `/like`, `/like-status`
- collection comments/likes: `/api/public/journal/collections/:slug/comments`, `/like`, `/like-status`
- local preview may load `data/journal-public.json` for the index, but still attempts live collection/like endpoints with graceful fallback.

Admin assumptions found in `js/admin-posts.js`:

- posts: `/admin/posts`
- groups: `/admin/journal-groups`
- collections: `/admin/journal-collections`
- media: `/admin/posts/:id/media...`
- GPS rebuild: `/admin/gps/rebuild`

Local backend working copy confirms these route families exist for collections and like-status after the 2026-05-25 backend work. `npx prisma validate` and `npm run build` passed.

Remaining API caveat: translation rows exist in schema, but admin translation editing/generation endpoints are not implemented in the checked backend routes. Current admin still saves legacy RU/EN fields for posts and limited RU collection fields.

### 5. Journal translation schema and many-language readiness

Backend schema is scalable beyond RU/EN at the storage layer:

- `JournalTranslation` stores one row per `postId + language` or `collectionId + language`.
- `JournalMediaTranslation` stores one row per `mediaId + language`.
- `TranslationStatus` supports `MISSING`, `DRAFT`, `NEEDS_REVIEW`, `PUBLISHED`.
- `sourceLanguage` exists on `Post`, `JournalCollection`, and `JournalTranslation`.
- Unique indexes are per entity/language, not per hard-coded language column.

This is the correct direction for many languages. It avoids `titleFr/titleDe/titleIt/...` column growth.

Compatibility caveat: legacy fields still exist (`titleRu`, `titleEn`, `contentRu`, `contentEn`, `seoTitleRu`, `seoTitleEn`, media `altRu`, `altEn`). This is acceptable during MVP compatibility, but future multilingual admin must write/read translation rows as the source of non-RU language versions.

Audit metadata gap for future AI: current translation schema does not yet store source revision/hash, prompt/rules version, model name, generation time, failure details, or reviewer/approval metadata. Those should be added before a production AI language desk is used as an editorial workflow.

### 6. Current browser-side translation helpers

`js/admin-posts.js` and `js/journal.js` contain free browser-side translation helpers that call external public translation services. They do not expose OpenAI keys, but they can send draft text to third-party translation endpoints from the browser.

For MVP, treat this as draft-era convenience only. It must not become the final AI multilingual architecture, and it should not be used for private/sensitive unpublished material unless the owner explicitly accepts that data flow.

### 7. OpenAI keys and prompt rules boundary

Search in the main repo and local journal backend working copy found no OpenAI key usage or committed OpenAI prompt implementation in the checked code. That is good for the current MVP gate.

Required future boundary:

- OpenAI API key server-side only: env/private config on server, never browser JS, never Git, never report.
- Prompt/rules files may be versioned in repo only if they contain no secrets.
- Browser/admin should call a backend endpoint with canonical RU revision, target languages, glossary/rules version, and explicit action.
- Backend should return structured drafts and audit metadata.
- Generated translations default to draft/needs-review and must not auto-publish or overwrite approved text without explicit owner action.

## BRK-MVP-LANGAI-001 backend consultation

Backend recommendation: the future AI language section must be server-side and translation-row based.

Minimum backend shape:

- `POST /api/admin/journal-ai/translations/generate`
- input: entity type (`post` or `collection`), entity id, source revision/hash, source language (`ru`), target language list, prompt/rules version, glossary version, optional force/regenerate flags.
- output: per-language draft fields for title, excerpt, content, SEO title, SEO description, media alt/caption, status, errors, source hash, model name, prompt/rules version, generated timestamp.
- no direct OpenAI calls from `admin-posts.js`.
- no OpenAI key, provider token, or sensitive prompt data in browser JS.
- retries must be per language, not all-or-nothing.
- approved translations must require explicit owner action before becoming public/indexable.

Data model recommendation:

- Keep Russian post/collection as canonical fast-entry source.
- Use `JournalTranslation` for all non-RU post/collection language versions.
- Use `JournalMediaTranslation` for all non-RU media alt/caption.
- Keep legacy RU/EN columns only as compatibility fields until frontend/admin migration is complete.
- Add AI audit columns/table before production AI use:
  - `sourceRevisionHash`
  - `promptRulesVersion`
  - `glossaryVersion`
  - `model`
  - `generatedAt`
  - `generationStatus`
  - `failureReason`
  - `reviewedAt`
  - `approvedAt`
  - `approvedBy`

SEO recommendation:

- Per-language public URLs or static exports are required for real multilingual indexing.
- Client-only language switching is not enough for final SEO.
- Each translation row should carry SEO title, SEO description, share excerpt/status, and indexing allowed state.
- Hreflang/canonical strategy should be decided before allowing non-RU language pages into indexing.

Release-safe MVP step:

- Do not block MVP on full AI translation UI.
- Preserve current RU-first admin and existing RU/EN compatibility.
- Add no OpenAI browser code.
- After MVP, implement server-side AI endpoint and translation-row admin workflow behind authenticated admin only.

## Management admin API

Relevant files:

- `management-admin-api.php`
- `js/admin-management.js`
- `js/management.js`
- `admin-management.html`
- `admin-mnr.html`
- `data/management-pricing.json`
- runtime/ignored `data/management-projects.json`

The API is file-based:

- reads/writes `data/management-pricing.json`;
- creates/updates `data/management-projects.json` for project drafts/documents;
- local requests from `127.0.0.1`, `localhost`, or `brkovic-local.local` bypass auth for development;
- non-local requests require the PHP session marker set after journal admin login flow.

Local diagnostics smoke returned `200` in local mode. No write smoke was run.

Deployment caution:

- `data/management-pricing.json` is tracked but may be live-edited on production. Backup/merge before overwrite.
- `data/management-projects.json` is ignored and may exist only on production. Preserve it; do not upload an empty local replacement.
- `management-admin-api.php` has no explicit origin/CSRF check. For MVP this is partially mitigated by same-origin/session requirement and JSON API usage, but before broader production admin use it should get an origin/CSRF boundary similar in spirit to the contact form.
- Public `js/management.js` attempts to save demo project drafts to `management-admin-api.php?projects=1`; on production this should fail for normal visitors without admin session and is caught by the frontend. This is acceptable if the print/PDF fallback remains the expected public behavior.

## NavDesk tide APIs

Relevant files:

- `api/tides/search.php`
- `api/tides/forecast.php`
- `api/tides/window.php`
- `js/navdesk.js`
- `navdesk-tides.html`
- `navdesk.html`

Syntax checks passed. Local smoke passed:

- search returned `200`;
- forecast returned `source=local-mock`;
- window returned `source=local-mock`.

Production boundary:

- `forecast.php` and `window.php` require `/home/brkovic/private/worldtides.php` for real production data.
- If that private config is missing or has a placeholder key, production returns `500`.
- Local mock fallback is intentionally limited to local preview hosts and must not be treated as live tide data.
- Do not upload or overwrite `/home/brkovic/private/worldtides.php`.

MVP gate implication: NavDesk tide auto-mode is release-ready only if production private WorldTides config exists and is preserved. Manual tide mode can still function without provider config.

## Delivery distance API

Relevant files:

- `api/delivery-distance.php`
- `api/delivery-distance.config.example.php`
- ignored local `api/delivery-distance.config.php`
- production private `/home/brkovic/private/distance-tools.php`
- `js/delivery-calculator.js`

Syntax checks passed. Safe local smoke confirmed:

- GET is rejected with `405`;
- invalid JSON POST is rejected with `400`.

No valid provider POST was run because it would use a billing token/provider call.

Production boundary:

- `api/delivery-distance.php` looks for `/home/brkovic/private/distance-tools.php` first, then local `api/delivery-distance.config.php`.
- `api/delivery-distance.config.php` is ignored and must not be uploaded from local Git.
- Production should use the private server path or preserve an existing server-only config.
- Without a real key, valid calculation requests return `500`.

MVP gate implication: delivery distance API is structurally ready, but public release needs deploy-time confirmation of the private Distance Tools config or a graceful product decision that provider-backed distance is unavailable.

## Files that must not be overwritten on production

Do not upload, replace, print, or normalize from local repo:

- `forms/config.php`
- `forms/smtp-error.log`
- `forms/form-security.log`
- `forms/form-rate-limit.json`
- `forms/form-rate-limit.lock`
- `api/delivery-distance.config.php`
- `/home/brkovic/private/distance-tools.php`
- `/home/brkovic/private/worldtides.php`
- production SMTP settings
- FTP credentials, `.netrc`, cookies, sessions, CSRF values, login codes, API keys, billing tokens, DB credentials
- production `data/management-projects.json`
- production-generated or live-edited `data/management-pricing.json`
- production-generated or fresher journal snapshots/GPS files: `data/journal-public.json`, `data/journal-gps.json`, `data/journal-gps-version.json`
- production journal backend `/journal-backend`
- production PostgreSQL database
- uploads, logs, session files
- `game.brkovic.ltd/private/config.php`
- `game.brkovic.ltd/storage/*`

Special caution:

- `api/.htaccess` contains CloudLinux Passenger config pointing `/api` to `/home/brkovic/journal-backend`. Back up production before overwrite and overwrite only if Director/Backend/Admin explicitly confirms the local file is the intended production config.
- Root `.htaccess` has duplicated ops redirect block. This is not a backend syntax blocker, but production overwrite still requires backup.

## Blockers and risks for Director gate

MVP gate risks to confirm before deploy:

1. Production `forms/config.php` must exist and be preserved.
2. Production WorldTides config must exist if NavDesk tide auto-mode is expected to work live.
3. Production Distance Tools config must exist if delivery distance calculation is expected to work live.
4. Production `data/management-projects.json`, if present, must be backed up/preserved.
5. Production `data/management-pricing.json` and journal data snapshots must not be blindly overwritten if production has fresher data.
6. Decide whether `admin-api-proxy.php` belongs in production upload or should remain local-helper only.
7. Future AI language desk must not reuse browser-side free translation as architecture.

Not a blocker for MVP but recommended soon:

- Add CSRF/origin protection to `management-admin-api.php` before serious production admin use.
- Add server-side translation endpoints and AI audit metadata before AI multilingual workflow goes live.
- Move non-RU admin editing from hard-coded EN fields to translation rows.

## Files changed

- Created `docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md`.

No product code, UI, backend code, production files, FTP files, DB, or secrets were changed.

## Scope preserved

- Product code not edited.
- Interface/design not changed.
- FTP and production not accessed.
- Live journal backend and database not touched.
- Secrets/private config contents not printed.
- Separate SEO/I18N report file `docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md` not touched.

## Next expected

Director gate review, then release/deploy owner should verify production-only configs and data preservation rules before any upload.
