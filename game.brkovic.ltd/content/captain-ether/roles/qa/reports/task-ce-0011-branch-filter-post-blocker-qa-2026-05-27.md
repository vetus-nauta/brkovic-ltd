# TASK-CE-0011 Branch Filter Post-Blocker QA

Date: 2026-05-27
Role: QA / Captain Ether
Mode: report-only
Target: Beta 1.1 `start-watch` branch-filter after PHP blocker fix

## Status

PARTIAL PASS / NEEDS FIXTURE.

The post-blocker read-only QA checks pass for PHP syntax, current Captain Ether
validator regression, JSON parse, branch fixture availability, static mutation
ordering, and successful-question payload privacy.

The full 32-case API session mutation smoke is not accepted as PASS in this
report because this QA run did not have a safe non-secret authenticated
POST/CSRF fixture and disposable storage harness. Cases that require actual
`start-watch`, `submit-answer`, `finish-watch`, progress, Lost Oars, or
answer-log mutation are marked `NEEDS FIXTURE` below.

## Scope

Allowed file created:

- `content/captain-ether/roles/qa/reports/task-ce-0011-branch-filter-post-blocker-qa-2026-05-27.md`

Report-only confirmation:

- API/runtime files not edited.
- content JSON and batch JSON not edited.
- matcher, UI, router, registry, auth/platform, production config, deploy/FTP
  state, Watch Officer, Nav Desk, and Game Director docs not edited.
- secrets, cookies, sessions, CSRF values, login codes, SMTP data, player email,
  player identity, private config, and `.netrc` not read into the report.

Localization impact:

- N/A for UI locale smoke: this QA task did not introduce player-facing UI copy.
- API error keys/reasons were reviewed only as internal controlled API behavior;
  no public branch selector or translated UI surface is approved by this report.

## Sources Read

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0008-start-watch-static-review-fixes-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0009-urgency-assistance-qa-fixture-fix-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0006-start-watch-branch-filter-implementation-2026-05-27.md`
- `content/captain-ether/roles/qa/reports/task-ce-0007-start-watch-branch-filter-implementation-qa-2026-05-27.md`
- `public/api/captain-ether/start-watch.php`
- `private/bootstrap.php` limited to non-secret helper definitions needed for
  `visible_question`, storage helper names, and content helper names.

## Environment

- Working directory: `/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd`
- PHP: `$HOME/.local/php-codex/bin/php`, PHP `8.5.6`
- Node: `v24.15.0`
- `rg` was unavailable in this shell; `find` and `grep` were used instead.

Existing unrelated dirty worktree entries were observed outside this report
path. They were not modified.

## Read-Only Checks

### PHP syntax

Command:

```text
$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php
```

Result: PASS.

Output summary:

```text
No syntax errors detected in public/api/captain-ether/start-watch.php
```

### Captain Ether validator

Command:

```text
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Result: PASS with warnings.

Output summary:

```text
items: 255
grammar_patterns: 112
scenarios: 2
qa_items: 255
should_accept: 711
should_reject: 783
dangerous_pairs: 57
danger_must_accept: 157
danger_must_reject: 261
watch_selection bad_runs: 0 for beginner/intermediate/advanced
WARN (9): duplicate accepted_answers after normalization
PASS
```

The 9 warnings are duplicate-normalization warnings already surfaced by the
validator; they are not validation failures.

### JSON parse

Command:

```text
node -e "JSON.parse(...)"
```

Checked:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`

Result: PASS.

### Static branch-filter source checks

Node read-only checks confirmed:

- PHP brace balance is `0` with no negative balance.
- Required branch-filter helper names and controlled error keys are present.
- `invalid_watch_mode`, `focused_module_unavailable`, `missing_branch`,
  `invalid_branch`, and `branch_watch_unavailable` appear before the first
  `storage_mutate(` call.
- Stored question records in `start-watch.php` include only:
  `index`, `item_id`, and `level`.
- No stored question-record keys were found for `target_text`,
  `accepted_answers`, `qa_notes`, `branch`, `module`, `user_id`, `player_hash`,
  session, CSRF, or debug data.
- `visible_question()` returns player-safe display fields and does not expose
  `target_text`, `accepted_answers`, `qa_notes`, branch/module, player identity,
  session, CSRF, or debug fields.

Result: PASS for static review. API response privacy still needs live fixture
confirmation for successful and error responses.

### Branch fixture data check

Node read-only fixture check against `starter.json` covered 10 taxonomy branches
x 3 levels = 30 branch/level combinations.

Result: PASS against the accepted hidden/internal fixture table:

- `core_radio`: beginner/intermediate/advanced success.
- `marina_harbour`: beginner/intermediate/advanced success.
- `navigation_reports`: beginner reject, intermediate/advanced success.
- `safety_securite`: beginner reject, intermediate/advanced success.
- `traffic_collision`, `urgency_panpan`, `distress_mayday`,
  `onboard_operations`, `vts_port_control`, and `review_minimal_pairs`: reject
  for all levels under the current implementation gate.

Note: `urgency_panpan` now has content in `starter.json`, but it is not enabled
by `captain_focused_branch_enabled()` in this implementation. This matches the
current TASK-CE-0008 fixture expectation that all non-approved focused branches
reject.

## 32-Case Matrix Review

Legend:

- `PASS (read-only)`: verified by lint, validator, JSON parse, source review, or
  static fixture analysis.
- `STATIC PASS / NEEDS API FIXTURE`: source/data review passed, but an
  authenticated POST and disposable storage snapshot are still required before
  the case can be accepted as full smoke PASS.
- `NEEDS FIXTURE`: cannot be honestly passed without a safe authenticated API
  session and controlled local storage fixture.

| ID | Area | QA status | Evidence / blocker |
| --- | --- | --- | --- |
| 1 | Mixed baseline beginner | STATIC PASS / NEEDS API FIXTURE | Validator confirms beginner length `12` and progressive order; live `start-watch` response shape not executed. |
| 2 | Mixed baseline intermediate | STATIC PASS / NEEDS API FIXTURE | Validator confirms intermediate length `16` and progressive order; live response shape not executed. |
| 3 | Mixed baseline advanced | STATIC PASS / NEEDS API FIXTURE | Validator confirms advanced length `20` and progressive order; live response shape not executed. |
| 4 | No mode, valid branch | STATIC PASS / NEEDS API FIXTURE | Source defaults absent `mode` to mixed; authenticated POST not executed. |
| 5 | No mode, valid module | STATIC PASS / NEEDS API FIXTURE | Source only activates branch validation in `focused_branch`; authenticated POST not executed. |
| 6 | `mode=mixed`, valid branch/module | STATIC PASS / NEEDS API FIXTURE | Source only uses filters for focused modes; authenticated POST not executed. |
| 7 | Mixed legacy eligibility | STATIC PASS / NEEDS API FIXTURE | Mixed `$items` filter is level-only, so unbranched legacy items remain eligible; repeated live mixed runs not executed. |
| 8 | Mixed weak quota | NEEDS FIXTURE | Requires seeded weak-heavy account and storage diff. |
| 9 | Invalid mode | STATIC PASS / NEEDS API FIXTURE | Controlled `invalid_watch_mode` path appears before storage mutation; live mutation snapshot not executed. |
| 10 | Focused branch missing branch | STATIC PASS / NEEDS API FIXTURE | Controlled `missing_branch` path appears before storage mutation; live mutation snapshot not executed. |
| 11 | Focused branch unknown branch | STATIC PASS / NEEDS API FIXTURE | Controlled `invalid_branch` path appears before storage mutation; live mutation snapshot not executed. |
| 12 | Focused branch success | STATIC PASS / NEEDS API FIXTURE | Data fixture check passes approved success branches/levels; live watch not created. |
| 13 | Focused branch final order | STATIC PASS / NEEDS API FIXTURE | Source sorts selected focused items progressively; live focused watch not executed. |
| 14 | Focused branch membership | STATIC PASS / NEEDS API FIXTURE | Source enforces exact focus quota and cross-branch review fill; live selected IDs not sampled. |
| 15 | Focused branch weak priority | NEEDS FIXTURE | Requires selected-branch weak points seeded in storage. |
| 16 | Cross-branch review weak points | NEEDS FIXTURE | Requires cross-branch weak points seeded in storage. |
| 17 | Underfilled branch | STATIC PASS / NEEDS API FIXTURE | Data fixture check confirms expected rejects; live error response not executed. |
| 18 | Underfilled mutation safety | NEEDS FIXTURE | Requires pre/post `watch_sessions`, `progress`, Lost Oars, and answer-log storage snapshot. |
| 19 | Focused module missing branch | STATIC PASS / NEEDS API FIXTURE | Source returns `focused_module_unavailable` before branch/module-specific validation and before storage mutation; live response not executed. |
| 20 | Focused module missing module | STATIC PASS / NEEDS API FIXTURE | Same static evidence as ID 19; live response not executed. |
| 21 | Focused module invalid module | STATIC PASS / NEEDS API FIXTURE | Same static evidence as ID 19; live response not executed. |
| 22 | Focused module below threshold | STATIC PASS / NEEDS API FIXTURE | Same static evidence as ID 19; live response not executed. |
| 23 | Successful payload privacy | STATIC PASS / NEEDS API FIXTURE | Stored question keys and `visible_question()` are player-safe by static review; live successful payload not captured. |
| 24 | Error privacy | STATIC PASS / NEEDS API FIXTURE | Error paths use controlled keys/reasons and do not echo raw input by static review; live error payload not captured. |
| 25 | Submit compatibility | NEEDS FIXTURE | Requires a real focused success watch session and `submit-answer` API call. |
| 26 | Finish compatibility | NEEDS FIXTURE | Requires a real focused success watch session and `finish-watch` API call. |
| 27 | Progress compatibility | NEEDS FIXTURE | Requires authenticated API run and progress storage snapshot. |
| 28 | Lost Oars compatibility | NEEDS FIXTURE | Requires wrong/skip focused item flow and weak-point storage snapshot. |
| 29 | Answer-log compatibility | NEEDS FIXTURE | Requires wrong/spelling/variant focused item submissions and answer-log storage snapshot. |
| 30 | Matcher branch sample | PASS (read-only) | Validator matcher regression passes for all `255` QA items with `711` accepts and `783` rejects. |
| 31 | Dangerous pairs | PASS (read-only) | Validator dangerous-pair regression passes: `57` groups, `157` must-accept, `261` must-reject. |
| 32 | Regression command | PASS (read-only) | `$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php` returned `PASS`. |

## Findings

No implementation failure was confirmed by read-only QA after the PHP blocker
fix.

Severity: BLOCKER for full QA acceptance.

Finding: the full 32-case branch-filter API smoke remains fixture-blocked, not
implementation-failed. The missing piece is a safe local authenticated API
harness with disposable storage and seeded weak/progress/answer-log states.

Reproduction for the blocker:

1. Attempt to complete cases 8, 15, 16, 18, and 25-29 without using a real or
   fixture authenticated `start-watch` session.
2. These cases require `current_user()`, CSRF-valid POSTs, session IDs, and
   pre/post storage comparisons.

Expected:

- QA can run non-secret local fixture users through `start-watch`,
  `submit-answer`, `finish-watch`, progress, Lost Oars, and answer-log flows.
- The harness snapshots `watch_sessions`, `progress`, `weak_points`, and
  `captain_answer_logs` before and after each case.

Actual:

- This report-only QA run had no safe fixture harness and did not mutate local
  runtime storage.
- Those cases are correctly marked `NEEDS FIXTURE` instead of PASS.

Owner route: Director-Engineer / Validation Steward for fixture automation;
QA follow-up after the harness exists.

## Best-Practice Notes For Future Smoke Automation

- Add a local CLI smoke runner that executes Captain Ether API flows against a
  temporary storage directory, not real local or production storage.
- Use a fixed non-secret test user id and generated CSRF/session fixture inside
  the runner; never print or persist real cookies, codes, or private config.
- Seed weak-point states per case so mixed weak quota, selected-branch weak
  priority, and cross-branch review quota are reproducible.
- Snapshot and diff `watch_sessions`, `progress`, `weak_points`, and
  `captain_answer_logs` for every controlled-error and underfilled case.
- Emit a machine-readable matrix result, for example JSON plus a short Markdown
  summary, so QA does not hand-maintain 32 rows.
- Keep pure selection logic testable separately from HTTP/auth wrappers; use
  endpoint smoke only for request validation, payload privacy, and mutation
  boundaries.
- Keep static guards for player-facing payload keys so `target_text`,
  `accepted_answers`, `qa_notes`, branch/module metadata, identity, session,
  CSRF, and debug data cannot be accidentally added to question payloads.

## Next Expected

Director-Engineer review. If full QA acceptance is required before Beta 1.1
approval, assign Validation Steward or Director-Engineer to provide a safe local
API fixture harness, then rerun QA for the `NEEDS FIXTURE` rows.
