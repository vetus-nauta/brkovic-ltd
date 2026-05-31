# Silent admin link gate

Date: 2026-05-31T18:08:49Z

## Decision

Public admin links should behave silently:

- unauthorized visitor: click has no visible reaction;
- authenticated non-owner: click has no visible reaction;
- authenticated owner session for `sailor040381@gmail.com` or `vetus.nauta@gmail.com`: admin page opens.

No public modal, no public hint, no visible redirect to login.

## Implementation

- Added a silent admin-link guard in `js/main.js`.
- The guard intercepts same-origin links to `admin*.html`.
- Access is checked against both auth surfaces:
  - `/auth/me`
  - `/api/auth/user/me`
- Allowed emails:
  - `sailor040381@gmail.com`
  - `vetus.nauta@gmail.com`
- Existing target behavior is preserved. If the link had `target="_blank"`, the allowed admin page still opens in a new tab/window.
- Cache-busted public pages to load `js/main.js?v=20260531-admin-gate-01`.

## Local Verification

- Local PHP server: `http://127.0.0.1:18133`
- `node --check js/main.js`: passed.
- `git diff --check`: passed for edited frontend files.
- Local `/admin-api-proxy.php?path=%2Fauth%2Fme`: returned JSON and unauthenticated state.
- Headless click probes:
  - denied state: `opened=false`
  - allowed mocked owner state: `opened=http://127.0.0.1:18132/admin.html`

## Production Verification

- Deployed:
  - `js/main.js`
  - public HTML pages that reference `main.js`
- Production checksum verification against local files: 0 mismatches.
- HTTP 200 smoke:
  - `journal.html`
  - `services/yacht-management.html`
  - `index.html`
  - `navdesk.html`
- Live headless probe:
  - denied state: `opened=false`
  - allowed mocked owner state: `opened=https://brkovic.ltd/admin.html`
- Temporary probe files removed from production and confirmed 404.

## Result

The local version is the reference and the production version now matches it for this change. Public admin links are silent for everyone except the two allowed owner emails with an active session.

## Hotfix: Direct Production Session Check

Date: 2026-05-31T18:18:59Z

After live use, the admin link still had no reaction for an allowed owner session because the first guard implementation checked the PHP proxy session before the direct production API session. The production browser session is held by `/api`, so the guard now checks direct API routes first:

- `/api/auth/me`
- `/api/auth/user/me`

The PHP proxy remains only as fallback. Also, allowed admin navigation now opens in the current tab instead of delayed `window.open`, because browsers may block async `_blank` navigation after an access check.

Verification:

- `node --check js/main.js`: passed.
- `git diff --check -- js/main.js`: passed.
- Production `js/main.js` checksum matches local.
- Live allowed probe navigated to real `Admin Panel` page.
- Live `admin.html` smoke shows the login form/status without JS errors.
- Temporary live probe was removed and returns `404`.

## Password Login Removal

Date: 2026-05-31T19:08:20Z

The public/admin UI still contained the old password login forms after the shared owner authorization started working. This was removed from the visible admin surface.

Changed:

- removed password login forms from:
  - `admin.html`
  - `admin-posts.html`
  - `admin-comments.html`
  - `admin-management.html`
  - `admin-mnr.html`
  - `admin-seo.html`
- added `js/admin-auth.js` to admin section pages that previously used their own password form only;
- updated admin section scripts to use `window.BRKOVIC_ADMIN_AUTH.checkSession()` first;
- `js/admin-auth.js` now accepts only the shared owner session for:
  - `sailor040381@gmail.com`
  - `vetus.nauta@gmail.com`

Verification:

- `node --check` passed for:
  - `js/admin-auth.js`
  - `js/admin-panel.js`
  - `js/admin-posts.js`
  - `js/admin-comments.js`
  - `js/admin-management.js`
  - `js/admin-seo.js`
- `git diff --check` passed for the edited admin files.
- Local admin pages returned HTTP 200.
- Production admin files match local: 0 mismatches.
- Production admin pages returned HTTP 200.
- Production HTML check found no visible password-login markers in admin pages.
- Browser smoke found no `Uncaught`, `TypeError`, `ReferenceError`, `SyntaxError`, or network `ERR_` markers after removing the forms.

Note: SEO identifier fields still use `type="password"` intentionally for masked tokens and are unrelated to login.
