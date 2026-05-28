# game.brkovic.ltd — Development and Implementation Plan

## Canonical Path

Use:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Do not use the deprecated staging path:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

## Product Decision

Build `game.brkovic.ltd` as a separate lightweight maritime game platform. Do not embed game logic into `brkovic.ltd` Nav Desk. The main site gets only an integration card linking to the subdomain.

## MVP Scope

1. Platform foundation
   - PWA shell
   - app-like entry page
   - game registry with three cards
   - email + 6-digit code login
   - persistent session
   - logout
   - shared admin placeholder

2. Captain Ether watch loop
   - level select: beginner, intermediate, advanced
   - 40-question watch
   - words, short expressions, phrases
   - hint scoring: clean 1, hint 0.5, wrong/skip 0
   - result screen

2.1. Ecosystem identity
   - `brkovic.ltd` is the future primary account system
   - `game.brkovic.ltd` must accept signed ecosystem login tokens
   - local email-code login remains a fallback until the main account system exists
   - no second manual registration should be required inside the game app

3. Lost Oars and Hangar
   - wrong, skipped, and hint-based answers become weak cards
   - unresolved weak cards persist
   - user may continue twice with reduced reward
   - third skipped cleanup forces Hangar
   - Hangar resolves weak cards

4. Next increments
   - grammar/radio construction mode with 20 exercises
   - progress screen
   - admin users/groups/crews/competitions/results
   - competition leaderboards
   - larger structured knowledge import

## Deployment Plan

1. Create hosting subdomain `game.brkovic.ltd`.
2. Set document root to `game.brkovic.ltd/public`.
3. Upload app files outside the main `brkovic-ltd` document root.
4. Create `private/config.php` from `private/config.example.php`.
5. Make `storage` writable.
6. Confirm DNS resolves. Current check on 2026-05-25:

```text
curl: (6) Could not resolve host: game.brkovic.ltd
```

7. Verify:
   - `/` returns app shell
   - `/manifest.webmanifest` returns PWA manifest
   - `/api/games/registry.php` returns registry JSON
   - email code request works
   - login creates persistent session
   - watch start, answer, finish, Lost Oars, Hangar work
8. Update Nav Desk card on `brkovic.ltd` to link to `https://game.brkovic.ltd`.

## Audit Before Release

Use `11_codex_audit.md` from the handoff pack after each patch. For the current MVP, expected status is:

- Architecture: PASS for subdomain separation, WARNING until production DNS/hosting is configured.
- Entry/game hub: PASS.
- Authentication: PASS for code/session, WARNING until production mail/rate policy is live-tested.
- Shared admin: WARNING, placeholder only.
- Captain Ether loop: PASS for core watch.
- Scoring: PASS for server-side MVP scoring.
- Lost Oars/Hangar: PASS.
- Knowledge core: WARNING, structured starter seed exists but not full-scale content yet.
- Grammar trainer: WARNING, planned next.
- Competitions: WARNING, planned after progress.
- UI/UX: PASS for mobile-first shell, review on devices before release.
