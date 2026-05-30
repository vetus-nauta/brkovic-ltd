# game.brkovic.ltd ecosystem auth guardrail

Project rule for all game chats and future game builds:

`brkovic.ltd` is the identity entry point for the Brkovic ecosystem. A user who has passed the main site tool-auth gate must not be asked to register or log in again when entering `game.brkovic.ltd`.

## Required flow

1. Main site checks/opens the shared tool-auth modal before sending the user to a game.
2. Main site requests a short-lived signed ecosystem token from its backend.
3. Main site sends the user to:

```text
https://game.brkovic.ltd/api/auth/ecosystem-login.php?token=...
```

4. `game.brkovic.ltd` verifies the token, creates its own local game session cookie, then redirects the user to the intended game route.
5. Individual games read the existing game session and must not show a second auth prompt for the same user.

## Do not break

- Do not replace this with copied passwords, copied user tables, or a shared plain cookie.
- Do not make each game implement its own required login before checking the existing game session.
- Do not remove `public/api/auth/ecosystem-login.php`.
- Email-code login inside `game.brkovic.ltd` is only a fallback for direct game-domain visits while the ecosystem token is unavailable.
- Future games must use the same game session created by `ecosystem-login.php`.

## Related files

```text
game.brkovic.ltd/docs/ecosystem-auth-plan.md
game.brkovic.ltd/public/api/auth/ecosystem-login.php
game.brkovic.ltd/private/config.php
js/main.js
admin-api-proxy.php
```

## Current integration point

Main-site protected links to `https://game.brkovic.ltd/` are handled by `js/main.js`. After successful auth, the frontend tries to request:

```text
/api/auth/user/ecosystem-token?returnTo=/...
```

The backend response should include either:

```json
{ "success": true, "data": { "loginUrl": "https://game.brkovic.ltd/api/auth/ecosystem-login.php?token=..." } }
```

or:

```json
{ "success": true, "data": { "token": "..." } }
```

The token must be short-lived and signed with the same secret configured in the game private config.
