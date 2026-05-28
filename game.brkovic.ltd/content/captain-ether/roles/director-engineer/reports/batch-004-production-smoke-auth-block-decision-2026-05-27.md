# Technical Card: Batch 004 Production Smoke Auth Block Decision

Status: NEEDS PLATFORM/AUTH DECISION
Date: 2026-05-27
Role: Director-Engineer / Captain Ether

## Input

QA report:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

## Director Decision

This is not a proven Batch 004 content, matcher, API, UI, route, or deploy
failure.

Batch 004 remains:

- merged into playable `starter.json`;
- deployed;
- locally validated with full regression `PASS`.

Production smoke remains open because QA cannot complete the authenticated part
while the approved private QA code channel is failing authentication.

Do not add or expose `dev_code` in production.

Do not change Captain Ether content, matcher, API, UI, router, registry, Nav
Desk, Watch Officer, or auth from this workstream to bypass login.

## QA Result Accepted

QA successfully checked:

- route opens: HTTP `200`;
- Captain Ether route is visible;
- unauthenticated Captain Ether API calls correctly return `401`;
- production request-code path returns HTTP `200`;
- production request-code does not expose `dev_code`;
- no secret value was written into the report or chat.

QA could not check:

- post-login intended route;
- watches `12/16/20`;
- progressive order;
- Batch 004 live reachability;
- player-facing payload privacy;
- targeted Safety / Securite matcher checks.

Reason:

- approved production QA login method exists;
- production code request succeeds;
- the currently available approved private mailbox/code channel fails
  authentication before QA can retrieve the one-time code.

## Required Platform/Auth Decision

Refresh or replace the approved private production QA code channel.

The existing Platform Auth decision remains the correct ownership route:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

Needed outcome:

1. restore the private channel so QA can retrieve the production one-time code;
2. or provide a one-off production QA code/session through an approved private
   channel;
3. or assign a Platform Auth task to replace the channel with a controlled
   reusable QA login method.

Security rule:

- no login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`
  contents, private config, player email, or player identity data may be
  printed in reports, repo files, or chat.

## Game Director / Platform Auth Report

```text
Captain Ether Batch 004 production smoke is blocked by the approved private QA
code channel, not by a proven game/content/runtime failure.

Confirmed:
- /games/captain-ether returns HTTP 200 and Captain Ether is visible.
- unauthenticated Captain Ether API returns 401.
- production request-code returns HTTP 200.
- production request-code does not expose dev_code.
- no secrets were written into QA report/chat.

Blocked until production QA login can complete:
- post-login intended route;
- watches 12/16/20;
- progressive order word -> short_expression -> phrase;
- Batch 004 reachability;
- payload privacy;
- targeted Safety/Securite matcher checks.

Finding:
Approved private mailbox/code channel currently fails authentication before QA
can retrieve the one-time code.

Decision needed from Platform Auth:
refresh/fix the approved private QA code channel, or provide a one-off approved
private production QA code/session.

Do not expose dev_code in production.
Do not put codes, cookies, sessions, CSRF, SMTP, .netrc, private config, player
email, or identity data into reports or repo files.
Do not solve this inside Captain Ether content/API.

After access is restored, rerun:
content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```

## Next Step

After approved production QA login access works again, rerun the existing QA
task:

```text
content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

Current Batch 004 production smoke status:

```text
QA RERUN PENDING AFTER PLATFORM AUTH ACCESS RESTORE
```
