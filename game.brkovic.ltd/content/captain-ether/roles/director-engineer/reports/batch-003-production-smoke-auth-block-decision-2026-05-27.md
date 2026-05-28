# Technical Card: Batch 003 Production Smoke Auth Block Decision

Status: NEEDS PLATFORM/AUTH DECISION  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Input

QA report:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

## Director Decision

This is not a proven Batch 003 content, matcher, API, or runtime failure.

Batch 003 remains:

- merged into playable `starter.json`;
- deployed;
- locally validated with full regression `PASS`.

Production smoke remains open because QA cannot complete the authenticated part
without an approved production test login path.

Do not add or expose `dev_code` in production.

Do not change Captain Ether content, matcher, API, UI, router, registry, Nav
Desk, Watch Officer, or auth from this workstream to bypass login.

## QA Result Accepted

QA successfully checked:

- route opens: HTTP `200`;
- Captain Ether route is visible;
- unauthenticated `/api/auth/me.php` returns `user=null`;
- unauthenticated Captain Ether API calls correctly return `401 Login required`.

QA could not check:

- post-login route retention;
- watches `12/16/20`;
- progressive order;
- Batch 003 live reachability;
- player-facing payload privacy;
- targeted navigation matcher checks.

Reason:

- production does not expose `dev_code`;
- QA had no accessible one-time login code;
- one mailbox request returned `500 Could not send login code`;
- another request returned `200 Code sent`, but the code was not accessible to
  QA.

## Required Platform/Auth Decision

Provide one approved production QA login method:

Game Director accepted this as a Platform/Auth task:

```text
game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md
```

Platform Auth decision:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

Decision status:

```text
approved-production-qa-login-method
```

1. Preferred: a dedicated production QA mailbox/test account whose one-time
   codes are accessible to QA through an approved private channel.
2. Acceptable one-off: Director provides a single production login code/session
   to QA through a private channel, not in reports or repo files.
3. Platform alternative: add a controlled internal QA login facility outside
   Captain Ether, reviewed as a platform/auth task.

Security rule:

- no login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`
  contents, private config, or player identity data may be printed in reports.

## Game Director / Platform Auth Report

```text
Captain Ether Batch 003 production smoke is blocked by production auth access,
not by a proven game/content/runtime failure.

Route and auth guard are healthy:
- /games/captain-ether returns 200 and route is visible.
- /api/auth/me.php unauthenticated returns user=null.
- unauthenticated Captain Ether API correctly returns 401 Login required.

Blocked checks:
- post-login intended route;
- watches 12/16/20;
- progressive order;
- Batch 003 reachability;
- payload privacy;
- targeted navigation matcher checks.

Assigned Platform/Auth task:
game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md

Decision needed from Platform/Auth:
provide an approved production QA login path/test mailbox/code channel.

Do not expose dev_code in production. Do not solve this inside Captain Ether
content/API. After QA receives approved login access, rerun:
content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

## Next Step

After approved production QA login access exists, rerun the existing QA task:

```text
content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

After Platform Auth approval, Batch 003 production smoke status is:

```text
QA RERUN PENDING
```
