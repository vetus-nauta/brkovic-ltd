# TASK-CE-0007 Start-Watch Branch Filter Implementation QA

Date: 2026-05-27
Role: QA / Captain Ether
Mode: local report-only QA
Target: TASK-CE-0006 start-watch branch-filter implementation

## Status

BLOCKED.

The local QA gate cannot be completed because PHP is not available in this
shell. The required syntax check, Captain Ether validator, and 32-case
branch-filter smoke matrix all depend on executing PHP code.

## Required Checks

### PHP syntax check

Command:

```text
php -l public/api/captain-ether/start-watch.php
```

Output:

```text
/bin/sh: line 1: php: command not found
```

Result: BLOCKED.

### Captain Ether validator

Command:

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Output:

```text
/bin/sh: line 1: php: command not found
```

Result: BLOCKED.

### 32-case branch-filter smoke matrix

Result: BLOCKED.

Blocker command:

```text
php -l public/api/captain-ether/start-watch.php
```

Blocker output:

```text
/bin/sh: line 1: php: command not found
```

Reason: the local smoke matrix must execute `public/api/captain-ether/start-watch.php`
and related Captain Ether PHP API behavior. Without PHP in the local shell, QA
cannot start or directly execute the endpoint, cannot validate session/progress
mutation behavior, and cannot confirm compatibility with submit, finish,
progress, Lost Oars, or answer-log flows.

Blocked matrix coverage:

| IDs | Area | Status |
| --- | --- | --- |
| 1-8 | mixed baseline, ignore behavior, legacy eligibility, weak quota | BLOCKED |
| 9-18 | invalid mode, focused branch required/invalid/success/order/membership/weak priority/cross-branch/underfilled mutation | BLOCKED |
| 19-22 | hidden focused-module unavailable behavior | BLOCKED |
| 23-24 | successful payload privacy and error privacy | BLOCKED |
| 25-29 | submit, finish, progress, Lost Oars, answer-log compatibility | BLOCKED |
| 30-31 | branch matcher samples and dangerous pairs | BLOCKED |
| 32 | Captain Ether validation/regression command | BLOCKED |

## Findings

Severity: BLOCKER.

Finding: TASK-CE-0006 cannot be accepted by QA in this environment because the
required local PHP runtime is unavailable.

Reproduction:

1. Run `php -l public/api/captain-ether/start-watch.php`.
2. Run `php content/captain-ether/tools/validate-captain-ether.php`.

Expected:

- PHP syntax check returns success for `start-watch.php`.
- Captain Ether validator runs and reports current validation status.
- QA can execute the 32-case branch-filter smoke matrix against the local PHP
  API behavior.

Actual:

- Both PHP commands fail with `/bin/sh: line 1: php: command not found`.
- The smoke matrix is not runnable locally.

Owner route: Director Ether / environment owner to provide a local shell with PHP
available, then QA rerun TASK-CE-0007.

## Report-Only Confirmation

Changed files:

- `content/captain-ether/roles/qa/reports/task-ce-0007-start-watch-branch-filter-implementation-qa-2026-05-27.md`

Scope preserved:

- runtime/API/UI/content data not edited;
- `public/api/captain-ether/start-watch.php` not edited;
- `starter.json`, batches, matcher, router, registry, auth/platform not edited;
- Watch Officer, Nav Desk, Game Director docs not edited;
- production config, deploy/FTP state, secrets, cookies, sessions, CSRF, player
  email, and player identity not touched.

## Next Expected

Director Ether review, then rerun QA in an environment where PHP is available.
