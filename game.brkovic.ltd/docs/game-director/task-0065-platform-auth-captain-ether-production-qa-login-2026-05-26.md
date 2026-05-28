# TASK-0065 - Platform Auth Decision For Captain Ether Production QA Login

**Chat ID:** CHAT-PLATFORM-AUTH-001  
**Department:** Platform Auth  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

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
- `game.brkovic.ltd/docs/ecosystem-auth-plan.md`
- `game.brkovic.ltd/content/captain-ether/roles/director-engineer/reports/platform-auth-production-qa-login-request-2026-05-27.md`
- `game.brkovic.ltd/content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-auth-block-decision-2026-05-27.md`
- `game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`

## Task

Resolve the Captain Ether Batch 003 production smoke blocker by providing an approved production QA login method.

This is a Platform Auth decision task. It is not Captain Ether content/API work.

## Required Decision

Choose and document one approved production QA login path:

1. Preferred: dedicated production QA mailbox/test account whose one-time login codes are accessible to QA through an approved private channel.
2. One-off: Game Director provides QA a single production login code/session through a private channel.
3. Platform-owned solution: controlled internal production QA login facility, reviewed and implemented outside Captain Ether.

The decision must state:

- chosen QA login method;
- who may use it;
- whether it is one-off or reusable;
- how QA receives access, described without secret values;
- confirmation that no secrets may be written into reports, repo files, screenshots, logs, or chat output;
- confirmation that Captain Ether content/API, Watch Officer, Nav Desk, router, registry, and production config remain untouched unless a separate task explicitly approves changes.

## Explicit Non-Solutions

Do not:

- expose `dev_code` in production;
- write login codes in repo files or reports;
- print cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, or other secrets;
- solve this by changing Captain Ether content, matcher, API, UI, router, registry, Nav Desk, or Watch Officer;
- change auth implementation unless a separate reviewed implementation task is created.

## Required Output

Create:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

The decision must state one of:

- `approved-production-qa-login-method`
- `changes-required`
- `blocked`

If approved, tell Captain Ether QA to rerun:

```text
game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not expose secrets.
- Do not write credentials to files.
- Do not modify Captain Ether content/API.
- Do not modify Watch Officer.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify production config unless a separate implementation task explicitly approves it.
