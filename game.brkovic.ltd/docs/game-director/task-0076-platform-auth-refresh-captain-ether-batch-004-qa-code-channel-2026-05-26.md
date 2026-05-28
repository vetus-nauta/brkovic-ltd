# TASK-0076 - Platform Auth Refresh Captain Ether Batch 004 QA Code Channel

**Chat ID:** CHAT-PLATFORM-AUTH-001  
**Department:** Platform Auth  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Approved

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-platform-auth-onboarding.md`
- `game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`
- `game.brkovic.ltd/content/captain-ether/roles/director-engineer/reports/platform-auth-batch-004-production-qa-code-channel-request-2026-05-27.md`
- `game.brkovic.ltd/content/captain-ether/roles/director-engineer/reports/batch-004-production-smoke-auth-block-decision-2026-05-27.md`
- `game.brkovic.ltd/content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`
- `game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`

## Task

Restore or replace the approved private production QA code channel for Captain Ether Batch 004 production smoke.

This is a Platform Auth access task. It is not Captain Ether content/API work.

## Confirmed Situation

Captain Ether Batch 004 production smoke is blocked by production QA login access.

Confirmed by QA:

- production route opens HTTP 200;
- unauthenticated Captain Ether API returns 401;
- production request-code returns HTTP 200;
- production request-code does not expose `dev_code`;
- approved private code channel currently returns `auth_failed` before QA can retrieve the one-time code.

## Required Decision / Action

Provide one approved way for QA to complete production login:

1. refresh/fix the existing approved private QA code channel;
2. or provide one-off approved private production QA code/session;
3. or replace the channel with another controlled reusable QA login method owned by Platform Auth.

The output must state:

- chosen method;
- who may use it;
- whether it is one-off or reusable;
- whether Captain Ether QA may rerun Batch 004 production smoke;
- confirmation that no secrets may be written into reports, repo files, screenshots, logs, or chat output.

## Explicit Non-Solutions

Do not:

- expose `dev_code` in production;
- put login codes in repo files, reports, screenshots, logs, or chat;
- print cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, or other secrets;
- solve this by changing Captain Ether content, matcher, API, UI, router, registry, Nav Desk, Watch Officer, or deploy state;
- change auth implementation unless a separate reviewed implementation task explicitly approves it.

## Required Output

Create:

```text
game.brkovic.ltd/docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md
```

The decision must state one of:

- `approved-qa-code-channel-restored`
- `approved-one-off-private-qa-access`
- `changes-required`
- `blocked`

If approved, instruct Captain Ether QA to rerun:

```text
game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md
```

## Required Chat Reply

Use compressed project style:

```text
TASK-0076 done.
Report: game.brkovic.ltd/docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md
Tests: not run; access decision task.
Scope preserved:
- Captain Ether content/API, Watch Officer, Nav Desk, router/registry, auth implementation, production config, deploy/FTP not touched.
Next expected: Captain Ether QA rerun Batch 004 production smoke
```

## Boundaries

- Do not expose secrets.
- Do not write credentials to files.
- Do not modify Captain Ether content/API.
- Do not modify Watch Officer.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth implementation unless a separate task approves it.
- Do not modify production config.
- Do not deploy.
