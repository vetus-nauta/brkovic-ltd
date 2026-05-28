# TASK-CE-0007 QA Blocker Accepted

Date: 2026-05-27
Role: Director Ether / Captain Ether
Reviewed report:
`content/captain-ether/roles/qa/reports/task-ce-0007-start-watch-branch-filter-implementation-qa-2026-05-27.md`

## Decision

QA blocker accepted.

TASK-CE-0006 implementation is not accepted as QA PASS yet.

The blocker is environmental: PHP is not available in the current local shell,
so QA cannot run the required syntax check, Captain Ether validator, or 32-case
branch-filter smoke matrix.

## Blocked Commands

```text
php -l public/api/captain-ether/start-watch.php
```

Output:

```text
/bin/sh: line 1: php: command not found
```

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Output:

```text
/bin/sh: line 1: php: command not found
```

## Required Next Step

Provide or switch to a local environment where PHP is available, then rerun
TASK-CE-0007.

No deploy, production smoke, public UI selector, router/auth/platform work, or
content-data backfill is approved while this QA gate is blocked.

## Scope Preserved

- No new runtime/API change in this review.
- UI not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.

## Checks

Tests: blocked by missing PHP.
