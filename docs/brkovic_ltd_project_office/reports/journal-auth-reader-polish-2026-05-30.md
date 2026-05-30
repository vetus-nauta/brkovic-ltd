# Journal Auth And Reader Polish Sprint - 2026-05-30

## Scope

Implemented a focused three-part sprint for the Deck Log:

1. Auth gate for public journal likes and comments.
2. Reader CTA and collection viewer alignment polish.
3. Footer Instagram placement and smoke QA.

## Frontend

- `journal.html`
  - Added footer Instagram link in the left information card.
  - Bumped journal CSS/JS cache versions to `20260530-journal-auth-01`.
- `js/journal.js`
  - Likes and comments now call the shared public tool auth modal through `window.ensureToolAccess()`.
  - Comment forms no longer expose an email field.
  - Comment submit uses the authenticated profile email from the public tool auth session.
  - Repeated client-side like taps are blocked after a user has liked an item.
  - Collection cards now use a clearer `Read/Читать ›` CTA.
  - Multipage cover and chapter index include duplicate `Read/Читать ›` controls that advance to the first page.
  - Local preview journal API now uses `admin-api-proxy.php?path=/public/journal...`, so localhost can share the same tool-auth proxy session.
- `css/journal.css`
  - Added compact CTA styling and safe collection-viewer alignment overrides at the end of the existing layered CSS.
- `css/main.css`
  - Added compact footer social link styling.
- `js/main.js`
  - Maps `instagramFooterLink` to the configured Instagram URL.
  - Registered users now have their account email inserted automatically into site send forms when the email field is empty.
- `admin-api-proxy.php`
  - Allows `/public/journal...` routes for local preview only.

## Backend

Live journal backend was updated narrowly:

- Public comments require the signed public tool-user session.
- Public likes require the signed public tool-user session.
- Like identity is now derived from the authenticated user email hash, not from anonymous repeated browser cookies.
- Like-status remains public and still returns counts; when signed in, it returns the authenticated user's liked state.

Changed backend files uploaded to live:

- `journal-backend/dist/modules/public/journal/public-journal.controller.js`
- `journal-backend/dist/modules/public/public.module.js`
- `journal-backend/dist/modules/auth/auth.module.js`
- matching `src` files for server-side source reference

Live backup before upload:

- `/tmp/brkovic-live-backup-20260530-journal-auth`

## Verification

- `node --check js/journal.js` - PASS
- `node --check js/main.js` - PASS
- `php -l admin-api-proxy.php` - PASS
- backend `npm run build` in current backend snapshot - PASS
- Local `journal.html` - HTTP 200
- Live `journal.html` includes `20260530-journal-auth-01` assets - PASS
- Live Google auth status - configured true
- Live unauthenticated comment POST to smoke slug - `401 Sign in is required`
- Live unauthenticated like POST with JSON to smoke slug - `401 Sign in is required`
- Local proxy public journal like smoke - `401 Sign in is required`
- Headless browser click on unauthenticated like opens shared auth modal - PASS
- Headless DOM checks:
  - no visible email field in journal comment form
  - collection cover has `Читать ›`
  - chapter index has `Читать ›`
  - footer Instagram resolves to configured Instagram URL

## Notes

- The old anonymous like cookie is left readable for `like-status` fallback, but creating/removing likes now requires public tool auth.
- The change avoids redesigning the journal; all layout work is appended as targeted overrides.
- For registered users, the email from the public account is automatically inserted into website send/request forms.
