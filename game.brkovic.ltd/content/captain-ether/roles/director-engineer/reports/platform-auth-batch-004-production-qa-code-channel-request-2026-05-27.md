# Outbound Task: Refresh Production QA Code Channel For Batch 004 Smoke

Status: OPEN / PLATFORM AUTH NEEDED
Date: 2026-05-27
From: Director-Engineer / Captain Ether
Owner: Game Director / Platform Auth

## Why This Exists

Captain Ether Batch 004 is merged and deployed, but production smoke cannot be
closed because QA cannot complete production email login.

This is not a proven Captain Ether content, matcher, API, UI, route, deploy, or
runtime bug. It is a production QA access issue owned by Game Director /
Platform Auth.

## Evidence

QA report:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

Director decision:

```text
content/captain-ether/roles/director-engineer/reports/batch-004-production-smoke-auth-block-decision-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

Confirmed production checks:

- route opens with HTTP `200`;
- Captain Ether route is visible;
- unauthenticated Captain Ether API returns `401`;
- production request-code returns HTTP `200`;
- production request-code does not expose `dev_code`.

Blocked checks:

- post-login intended route;
- watch lengths `12/16/20`;
- progressive order `word -> short_expression -> phrase`;
- Batch 004 reachability;
- player-facing payload privacy;
- targeted Safety / Securite matcher checks.

Sanitized blocker:

- the currently available approved private mailbox/code channel fails
  authentication before QA can retrieve the one-time production code.

## Requested Platform/Auth Decision

Provide one approved way for QA to complete production login for smoke tests:

1. restore the existing approved private mailbox/code channel;
2. or provide a one-off production QA code/session through an approved private
   channel;
3. or replace the channel with a controlled reusable QA login method owned by
   Platform Auth.

## Explicit Non-Solutions

Do not:

- expose `dev_code` in production;
- put login codes in repo files, reports, or chat;
- print cookies, sessions, CSRF values, SMTP details, `.netrc`, private config,
  player email, or player identity data;
- solve this by changing Captain Ether content, matcher, API, UI, router,
  registry, Nav Desk, Watch Officer, or deploy state.

## Acceptance Criteria

Platform Auth returns a short decision:

- chosen QA login method;
- who may use it;
- whether it is one-off or reusable;
- confirmation that no secrets should be written into reports, repo files, or
  chat.

No secret value should be included in the decision report.

Captain Ether QA then reruns:

```text
content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```

Expected QA report:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

## Copy-Ready Message For Game Director / Platform Auth

```text
Task owner: Game Director / Platform Auth

Captain Ether Batch 004 production smoke is blocked by the approved private QA
code channel, not by a proven game/content/runtime failure.

Confirmed:
- /games/captain-ether returns HTTP 200.
- unauthenticated Captain Ether API correctly returns 401.
- production request-code returns HTTP 200.
- production request-code does not expose dev_code.

Blocked until approved login access works again:
- post-login intended route;
- watches 12/16/20;
- progressive order word -> short_expression -> phrase;
- Batch 004 reachability;
- payload privacy;
- targeted Safety/Securite matcher checks.

Finding:
The approved private mailbox/code channel currently fails authentication before
QA can retrieve the one-time code.

Decision needed:
Refresh/fix the approved private QA code channel, or provide a one-off approved
private production QA code/session.

Do not expose dev_code in production.
Do not put codes, cookies, sessions, CSRF, SMTP, .netrc, private config, player
email, or identity data into reports or repo files.
Do not solve this inside Captain Ether content/API.

After access is restored, QA reruns:
content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```
