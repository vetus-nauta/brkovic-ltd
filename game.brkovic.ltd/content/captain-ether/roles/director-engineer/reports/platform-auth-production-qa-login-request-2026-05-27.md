# Outbound Task: Production QA Login Path For Captain Ether

Status: RESOLVED BY PLATFORM AUTH / QA RERUN PENDING  
Date: 2026-05-27  
From: Director-Engineer / Captain Ether  
Owner: Game Director / Platform Auth

Assigned Platform/Auth task:

```text
game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md
```

Platform Auth decision:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

## Why This Exists

Captain Ether Batch 003 is merged and deployed, but production smoke cannot be
closed because QA cannot complete production email login.

This is not a proven Captain Ether content, matcher, API, UI, or runtime bug.
It is a production QA access decision owned by Game Director / Platform Auth.

## Evidence

QA report:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

Director decision:

```text
content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-auth-block-decision-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

Current confirmed production checks:

- route opens with HTTP `200`;
- Captain Ether route is visible;
- unauthenticated `/api/auth/me.php` returns `user=null`;
- unauthenticated Captain Ether API returns `401 Login required`.

Blocked checks:

- post-login intended route;
- watch lengths `12/16/20`;
- progressive order `word -> short_expression -> phrase`;
- Batch 003 reachability;
- player-facing payload privacy;
- targeted navigation matcher checks.

## Requested Platform/Auth Decision

Provide one approved way for QA to complete production login for smoke tests.

Game Director accepted this blocker and assigned it to Platform Auth as
`TASK-0065`.

Platform Auth resolved the decision with status:

```text
approved-production-qa-login-method
```

Acceptable options:

1. Preferred: dedicated production QA mailbox/test account whose one-time login
   codes are accessible to QA through an approved private channel.
2. One-off: Director gives QA a single production login code/session through a
   private channel.
3. Platform-owned solution: controlled internal production QA login facility,
   reviewed and implemented outside Captain Ether.

## Explicit Non-Solutions

Do not:

- expose `dev_code` in production;
- put login codes in repo files or reports;
- print cookies, sessions, CSRF values, SMTP details, `.netrc`, private config,
  or player identity data;
- solve this by changing Captain Ether content, matcher, API, UI, router,
  registry, Nav Desk, or Watch Officer.

## Acceptance Criteria

Platform Auth returned a short decision:

- chosen QA login method;
- who may use it;
- whether it is one-off or reusable;
- confirmation that no secrets should be written into reports or repo files.

No secret value should be included in the decision report.

Captain Ether QA now reruns:

```text
content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

Expected QA report:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

## Copy-Ready Message For Game Director / Platform Auth

```text
Task owner: Game Director / Platform Auth

Assigned task:
game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md

Captain Ether Batch 003 production smoke is blocked by production login access,
not by a proven game/content/runtime failure.

Confirmed:
- /games/captain-ether returns HTTP 200.
- /api/auth/me.php unauthenticated returns user=null.
- unauthenticated Captain Ether API correctly returns 401 Login required.

Blocked until approved login access exists:
- post-login intended route;
- watches 12/16/20;
- progressive order word -> short_expression -> phrase;
- Batch 003 reachability;
- payload privacy;
- targeted navigation matcher checks.

Decision needed:
Provide an approved production QA login method/test mailbox/code channel.

Do not expose dev_code in production.
Do not put codes, cookies, sessions, SMTP, .netrc, private config, or player
identity data into reports or repo files.
Do not solve this inside Captain Ether content/API.

After access is approved, QA reruns:
content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```
