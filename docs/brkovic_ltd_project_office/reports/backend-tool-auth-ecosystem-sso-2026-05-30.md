# Backend Tool Auth Ecosystem SSO Report - 2026-05-30

## Scope

Connect the main `brkovic.ltd` tool-auth flow with `game.brkovic.ltd` so a user authorized on the main site is not asked for a second required login inside the games.

## Implemented

- Main frontend auth gate now covers:
  - NavDesk tool actions;
  - yacht delivery calculator fields/buttons;
  - yacht management calculator fields/buttons;
  - links to `https://game.brkovic.ltd/`.
- Local proxy allowlist now permits:

```text
/api/auth/user/ecosystem-token
```

- Live journal backend now exposes:

```text
GET /api/auth/user/ecosystem-token?returnTo=/...
```

- The endpoint requires the existing signed tool-auth user session and returns a short-lived signed SSO login URL for `game.brkovic.ltd`.
- Live `game.brkovic.ltd` SSO receiver was enabled with the shared secret in private server config.

## Guardrail

The game project must keep the shared auth bridge:

```text
game.brkovic.ltd/docs/ecosystem-auth-guardrail.md
```

Email-code login inside the game domain remains a fallback for direct visits only. A user entering from `brkovic.ltd` through tool auth should land in the game with an existing game session.

## Smoke

- `https://brkovic.ltd/api/health` returns `200`, database `ok`, translation provider `live`.
- `https://brkovic.ltd/api/auth/user/ecosystem-token?returnTo=/` without user auth returns `401 Tool auth is required`, which confirms the route is live and protected.
- `https://game.brkovic.ltd/api/auth/ecosystem-login.php?token=bad` returns `400 Invalid SSO token`, which confirms the game SSO endpoint is enabled and validating tokens rather than disabled.

## Notes

- Backend source for journal/tool auth still lives on the live server under `/journal-backend`, not inside this frontend repository.
- Before future edits to game auth, read the guardrail and do not convert the ecosystem bridge into per-game required auth.
