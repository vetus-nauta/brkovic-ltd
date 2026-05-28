# TASK-CE-0014 Office Problem Routing Dispatch

Date: 2026-05-27
Role: Director Ether / Captain Ether
Mode: director dispatch

## Status

DONE for office routing and first background pass.

Overall result: implementation gate PASS. The full API mutation fixture was
added later under TASK-CE-0015.

## Problem Routing

Current five active problems are routed as follows:

| Problem | Owner role | Task | Mode | Expected output |
| --- | --- | --- | --- | --- |
| QA 32-case branch-filter smoke after PHP unblock | `qa/` | TASK-CE-0011 | report-only | QA PASS/FAIL/BLOCKED matrix report |
| Reproducible validation environment and gate commands | `validation-steward/` | TASK-CE-0010 | report-only | command gate card |
| `navigation_reports` beginner reject and type-floor policy | `curriculum-architect/` | TASK-CE-0012 | report-only | curriculum decision review |
| 9 duplicate-normalization validator warnings | `sea-speak-linguist/` | TASK-CE-0013 | report-only | linguistic cleanup triage |
| Dirty/untracked worktree and protected-scope discipline | `director-engineer/` | TASK-CE-0014 | director control | short control report |

## New Role Created

Created first new office role:

- folder: `content/captain-ether/roles/validation-steward/`
- function: local validation environment, reproducible gates, validator triage,
  QA smoke preparation;
- discipline: report-only by default; does not replace QA; does not touch
  runtime/API/content/matcher/UI without a separate Director task.

New role files:

- `content/captain-ether/roles/validation-steward/rules.md`
- `content/captain-ether/roles/validation-steward/handoff.md`
- `content/captain-ether/roles/validation-steward/tasks/README.md`
- `content/captain-ether/roles/validation-steward/reports/README.md`

Updated office files:

- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`

## Background Tasks Assigned

### TASK-CE-0010 Validation Steward

Report path:

```text
content/captain-ether/roles/validation-steward/reports/task-ce-0010-branch-filter-validation-gate-2026-05-27.md
```

Purpose:

- exact validation commands;
- expected fixture table;
- local PHP environment note;
- remaining warnings;
- PASS/BLOCKED criteria for QA;
- prevention notes for future environment blockers.

Result:

- DONE.
- Report created.
- PHP CLI, lint, validator, and 30 branch/level static fixture expectations:
  PASS.

### TASK-CE-0011 QA

Report path:

```text
content/captain-ether/roles/qa/reports/task-ce-0011-branch-filter-post-blocker-qa-2026-05-27.md
```

Purpose:

- post-blocker QA review;
- accepted 32-case matrix status;
- identify cases that need auth/session fixtures rather than inventing PASS.

Result:

- DONE.
- Report created.
- PHP lint: PASS.
- Captain Ether validator: PASS with known `WARN (9)`.
- Node JSON/static/payload/mutation-order/branch fixture checks: PASS.
- Full 32-case API session mutation smoke: superseded by TASK-CE-0015 local
  API smoke fixture.

### TASK-CE-0012 Curriculum Architect

Report path:

```text
content/captain-ether/roles/curriculum-architect/reports/task-ce-0012-navigation-reports-beginner-type-floor-review-2026-05-27.md
```

Purpose:

- decide whether `navigation_reports` beginner should remain reject;
- define future content targets if beginner success is desired;
- keep type-floor/game-learning balance clear.

Result:

- DONE.
- Report created.
- Documentation-only review.

### TASK-CE-0013 Sea Speak Linguist

Report path:

```text
content/captain-ether/roles/sea-speak-linguist/reports/task-ce-0013-duplicate-normalization-warning-triage-2026-05-27.md
```

Purpose:

- triage 9 duplicate-normalization warnings;
- separate harmless duplicates from cleanup candidates;
- protect Sea Speak meaning and dangerous pairs.

Result:

- DONE.
- Report created.
- Validator rerun: PASS with expected `WARN (9)`.

## Current Validation Baseline

Local PHP CLI:

```text
$HOME/.local/php-codex/bin/php
```

Latest Director check:

```text
$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php
```

Result:

```text
No syntax errors detected in public/api/captain-ether/start-watch.php
```

Validator:

```text
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Result:

```text
PASS
```

Known remaining validator warnings:

- 9 duplicate `accepted_answers` after normalization.

## Director Interpretation

What is now handled:

- missing-PHP blocker is solved for this local shell;
- branch-filter static blockers from TASK-CE-0007 are fixed;
- validator FAIL caused by `word_urgency_assistance_001` is fixed;
- role ownership for each active problem is explicit;
- new `validation-steward/` role is created and ready.
- local API/session mutation fixture exists:
  `content/captain-ether/tools/smoke-start-watch-api.php`.

What is not yet complete:

- duplicate-normalization warnings are triaged but not cleaned;
- `navigation_reports` beginner remains reject unless future content fills the
  phrase/type-floor gap;
- production smoke/deploy is not approved and was not attempted.

## Scope Preserved

- Watch Officer not changed.
- Nav Desk not changed.
- router/registry not changed.
- auth/platform not changed.
- Game Director docs not changed.
- production config not changed.
- deploy/FTP state not touched.
- secrets and private config not touched.

## Next Expected

Recommended next Director commands:

1. Assign QA to re-run/accept TASK-CE-0015 local API smoke fixture if a
   separate QA sign-off is required.
2. Assign Content Producer or Sea Speak Linguist a cleanup task for the 9
   duplicate-normalization warnings, if Director wants a zero-warning validator.
3. Keep `navigation_reports` beginner focused watch hidden/reject until
   Curriculum Architect content targets are accepted.
