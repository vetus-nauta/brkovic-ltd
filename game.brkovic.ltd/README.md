# game.brkovic.ltd

Standalone maritime learning game platform for `https://game.brkovic.ltd`.

First game:

- `captain_ether` — `Капитан — Эфир`, a Sea Speak / maritime radio communication trainer.

Second product in pre-production:

- `watch_officer` — `Watch Officer`, a short-session maritime decision simulator for watchkeeping, buoyage, COLREGS, AIS and VHF/VTS decisions.

The main `brkovic.ltd` / Nav Desk project should only link to this app.

## Current Handoff

For a fresh Codex/ChatGPT session, start with:

```text
docs/new-chat-handoff-2026-05-26.md
```

## Local Run

```bash
php -S 127.0.0.1:18110 -t public
```

Open:

- `http://127.0.0.1:18110/`

In local mode the email login endpoint returns the 6-digit code in the JSON response for development.

Do not deploy the app without `private/config.php` in production mode. If the app falls back to `private/config.example.php`, local development codes are returned by the API.

## Ecosystem Login

The future primary account should live on `brkovic.ltd`. The game app already has a disabled SSO endpoint:

```text
/api/auth/ecosystem-login.php
```

When the main site registration is implemented, enable signed ecosystem login with a shared secret outside Git. Details: `docs/ecosystem-auth-plan.md`.

## Production Setup

1. Point the `game.brkovic.ltd` subdomain document root to:

```text
game.brkovic.ltd/public
```

2. Copy:

```text
private/config.example.php -> private/config.php
```

3. Set:

- `app_env` to `production`
- `mail_from`
- `mail_from_name`
- `admin_emails`

4. Make the `storage` directory writable by the web user.

5. Verify DNS before launch:

```bash
curl -I https://game.brkovic.ltd
```

At the time this scaffold was created, `game.brkovic.ltd` did not resolve yet, so the hosting/DNS subdomain step still has to be completed in the hosting panel.

## Architecture

This first MVP uses a small server-side JSON store so the platform can run on ordinary PHP hosting without introducing a framework. The data shape is intentionally separated into platform and Captain Ether files so it can be migrated to MySQL later without rewriting the player UI.

The public root is a game selection hub. Individual games use app routes such as:

- `/games/captain-ether`
- `/games/watch-officer`

Only `captain_ether` is playable now. `watch_officer` is registered as a pre-production product card and should not receive gameplay code before the Game Director/project-office stage is approved.

Planned migration targets:

- platform users, sessions, login codes
- game registry
- Captain Ether knowledge items, sessions, answers, weak points
- groups, crews, competitions, results
