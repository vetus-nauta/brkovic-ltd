# Frontend Tool Account Chip - 2026-05-30

## Scope

Add a compact account affordance after successful public tool auth without redesigning the site header.

## Implemented

- A small round account button appears in the header after successful tool auth.
- Google profile picture is used when available from Google OAuth.
- If no picture is available, the button shows a clean initial.
- The site menu includes an account block with:
  - account label;
  - display name/email;
  - auth provider (`Google` or `Email-код`);
  - protected-tool access note;
  - logout action.
- The account button opens a compact account modal.
- Logout clears the local tool-auth cache and calls `/api/auth/user/logout`.

## Mobile rule

On mobile, when the account button is visible, the top Instagram icon is hidden in the header to keep the logo, account button and menu button on one row. Instagram remains available elsewhere on the site.

## Checks

- `node --check js/main.js` passed.
- Local HTTP smoke:
  - `index.html` -> 200
  - `navdesk.html` -> 200
  - `services/yacht-management.html` -> 200
- Mobile headless screenshots were produced at 390px width:
  - `/tmp/brkovic-mobile-account-smoke/home-mobile.png`
  - `/tmp/brkovic-mobile-account-smoke/navdesk-mobile.png`
  - `/tmp/brkovic-mobile-account-smoke/account-visible-mobile-3.png`

Result: the account button stays in the header row on mobile.
