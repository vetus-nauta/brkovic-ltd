# TASK-0066 - Captain Ether QA Rerun Batch 003 Production Smoke

**Chat ID:** CHAT-CAPTAIN-001 / Captain Ether QA  
**Department:** Captain Ether QA  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`
- `content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`

## Task

Rerun the existing Captain Ether Batch 003 production smoke task after receiving approved production QA login access through the private channel.

This is a QA rerun only. Do not edit Captain Ether content, matcher, API, UI, router, registry, Nav Desk, Watch Officer, auth implementation, production config, or deployment state.

## Access Rule

Use the Platform Auth-approved production QA login method from:

```text
docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

Do not print or store:

- login codes;
- cookies;
- sessions;
- CSRF values;
- SMTP details;
- `.netrc`;
- private config;
- player email;
- player identity data;
- any other secret.

## Required Existing Task

Run:

```text
content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

## Required Output

Update:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

The report must state one of:

- `PASS`
- `FAIL`
- `NEEDS DIRECTOR DECISION`

Record only non-secret evidence:

- route checks;
- login flow result without secret values;
- watch length results;
- progressive order result;
- observed Batch 003 item IDs;
- payload privacy result;
- targeted matcher results;
- failures with reproduction steps if any;
- confirmation that QA was report-only and no forbidden files were changed.

## Required Chat Reply

Use compressed project style:

```text
TASK-0066 done.
Report: game.brkovic.ltd/content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
Tests:
- <summary>
Scope preserved:
- Captain Ether content/API, Watch Officer, Nav Desk, router/registry, auth implementation, production config, and deploy state not touched.
Next expected: <Game Director decision / close Batch 003 / blocker owner>
```

## Boundaries

- Do not expose secrets.
- Do not write credentials to files.
- Do not modify Captain Ether content/API.
- Do not modify Watch Officer.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth implementation.
- Do not modify production config.
- Do not deploy.
