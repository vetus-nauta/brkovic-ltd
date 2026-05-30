# Backend Google Tool Auth Setup - 2026-05-30

## Scope

Add Google as a premium quick sign-in method for protected Brkovic tools without replacing the working email-code fallback.

Button copy rule:

```text
Продолжить с Google
```

Do not call this "регистрация через Google" in UI. Google is a continuation/sign-in method for the same Brkovic tool account.

## Implemented

- Main auth modal uses the label `Продолжить с Google`.
- Google button is disabled until backend confirms Google OAuth is configured.
- Backend routes deployed on live journal backend:

```text
GET /api/auth/user/google/status
GET /api/auth/user/google/start
GET /api/auth/user/google/callback
```

- Google callback creates the same `ship_journal_tool_user` session cookie used by:
  - NavDesk protected tools;
  - yacht management calculator;
  - yacht delivery calculator;
  - ecosystem SSO bridge to `game.brkovic.ltd`.
- Email-code login remains available as fallback.

## Current live status

Smoke:

```text
GET https://brkovic.ltd/api/auth/user/google/status
```

Result:

```json
{ "success": true, "data": { "configured": false } }
```

This is expected until Google OAuth credentials are added to live backend `.env`.

## Required Google OAuth settings

Create OAuth Web application credentials in Google Cloud for:

```text
Authorized JavaScript origin:
https://brkovic.ltd

Authorized redirect URI:
https://brkovic.ltd/api/auth/user/google/callback
```

Then add the credentials only to server `.env`, never to Git or frontend:

```text
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://brkovic.ltd/api/auth/user/google/callback
```

After restart, `/api/auth/user/google/status` should return `configured:true`.
