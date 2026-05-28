# Captain Ether Batch 004 Production QA Code Channel Decision

**Task:** TASK-0076  
**Chat ID:** CHAT-PLATFORM-AUTH-001  
**Date:** 2026-05-26  
**Owner:** Platform Auth  
**Status:** approved-one-off-private-qa-access

## Decision

Approve a one-off private production QA access handoff for Captain Ether Batch 004 production smoke.

The existing reusable QA mailbox/code-channel method remains the preferred long-term path from:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

For this Batch 004 blocker, QA may proceed using a single fresh production login code or already-authenticated production QA session provided by Game Director / Platform Auth through an approved private channel.

No secret value is recorded in this report.

## Reason

QA confirmed:

- production route opens HTTP `200`;
- unauthenticated Captain Ether API returns `401`;
- production request-code returns HTTP `200`;
- production request-code does not expose `dev_code`;
- authenticated smoke is blocked because the approved private mailbox/code channel returns `auth_failed` before QA can retrieve the one-time production code.

This is an access-channel failure, not a proven Captain Ether content, matcher, API, UI, route, deploy, or runtime failure.

## Authorized Use

This one-off access may be used only by:

- the assigned Captain Ether QA operator running Batch 004 production smoke;
- Game Director / Platform Auth for issuing, handing off, rotating, or revoking the access.

It is not approved for general gameplay, content production, developer convenience, broad regression outside the assigned Batch 004 production smoke task, or bypassing normal production auth controls.

## Reuse

This decision is one-off for the Batch 004 production smoke rerun.

The one-time code or session must not be reused after the assigned smoke task completes. Future production smoke work should use the reusable QA mailbox/code-channel method after that channel is restored or replaced by a separate Platform Auth decision.

## Private Handoff

Game Director / Platform Auth must provide the one-off production QA code or session to the assigned QA operator through an approved private channel outside repository files, reports, screenshots, logs, and chat output.

The handoff may describe the access procedure, but it must not record secret values in project artifacts.

## QA Rerun

Captain Ether QA may rerun Batch 004 production smoke after receiving the one-off private access:

```text
game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```

QA must continue to omit all secret values from the QA report, screenshots, logs, repository files, and chat output.

## Explicitly Not Approved

The following remain not approved:

- exposing `dev_code` in production;
- writing login codes in repository files, reports, screenshots, logs, or chat;
- printing cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, or other secrets;
- changing Captain Ether content, matcher, API, UI, batches, route behavior, or player payloads to bypass login;
- changing Watch Officer, Nav Desk, router, registry, deploy state, auth implementation, or production config for this blocker;
- implementing a new auth facility without a separate reviewed Platform Auth implementation task.

## Scope Preserved

This decision approves only the one-off private access handoff.

No Captain Ether content/API files, Watch Officer files, Nav Desk files, router files, registry files, auth implementation files, production config files, or deploy/FTP state are approved for modification by this task.

