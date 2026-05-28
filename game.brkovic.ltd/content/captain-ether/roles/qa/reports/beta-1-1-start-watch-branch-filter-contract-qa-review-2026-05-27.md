# Beta 1.1 Start-Watch Branch Filter Contract QA Review

Date: 2026-05-27
Role: QA / Captain Ether
Task: TASK-CE-0003
Mode: report-only

## Status

NEEDS DIRECTOR DECISION before runtime/API/UI/content implementation starts.

The proposed contract is directionally safe and additive, but the proposed QA
smoke list is not fully sufficient as written. It needs a more exact matrix for
default mixed compatibility, unavailable branch/module behavior, no-session
mutation on hard rejects, and payload/session privacy.

No implementation, runtime/API/UI/content-data, matcher, router, registry,
auth, production config, deploy, FTP, or Game Director document change is
approved by this QA review.

## Inputs Reviewed

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`
- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/roles/curriculum-architect/reports/beta-1-1-branch-aware-watch-architecture-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0001-curriculum-architect-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`
- read-only supporting check of current `public/api/captain-ether/start-watch.php`

## Coverage Decision

### Default Mixed Behavior

Not sufficient as written.

The proposed cases cover the right principle: no new fields should preserve
Beta 1.0 mixed watch behavior, and `mixed` should ignore branch filters. Before
implementation starts, QA needs the matrix to explicitly require all three
levels, absent `mode` with stray `branch` and `module`, current response shape,
weak-item quota behavior, watch length, and progressive type order.

Default mixed behavior is the public baseline and should be treated as the
highest-risk regression area.

### Focused Branch

Partially sufficient.

The contract covers valid branch length, progressive order, focus quota, review
quota, invalid branch, weak-item priority, and dangerous-pair sampling. It still
needs Director-level expected outcomes for each current branch/level combination:
which hidden/internal combinations are expected to return a watch, and which are
expected to hard reject.

Without that success/reject table, QA cannot distinguish a correct hard reject
from an implementation that underfills or silently falls back to mixed.

### Focused Module Hidden/Unavailable

Not sufficient as written.

The contract says `focused_module` remains hidden/unavailable, but the proposed
smoke list has only one broad case. QA needs explicit cases for:

- `focused_module` with no `branch`;
- `focused_module` with no `module`;
- invalid module inside a valid branch;
- valid-looking module below threshold;
- hidden/unavailable response does not create a watch session;
- hidden/unavailable response does not mutate progress.

### Underfilled-Pool Hard Reject

Testable, but only after Director confirms deterministic expected fixtures.

QA can test hard reject if the implementation has clear inputs that must reject:

- valid taxonomy branch with no eligible items, such as a future branch with no
  current starter content;
- valid branch/level below focus quota or type floor;
- focused module below threshold.

The future smoke must also assert:

- HTTP/error shape is controlled;
- `ok` is `false`;
- error is `branch_watch_unavailable` or a distinct controlled invalid-filter
  error;
- no mixed watch is returned;
- no watch session is created;
- `progress.last_level` is not changed;
- no answer-log entry is created;
- error body does not echo unsafe raw input or user/session fields.

### Privacy And Session Payload Checks

Partially sufficient.

The proposed check for hidden `target_text`, `accepted_answers`, and `qa_notes`
is necessary but not enough. The matrix should also require absence of:

- player email;
- player identity fields;
- `user_id`;
- `player_hash`;
- session token;
- CSRF value;
- raw accepted-answer arrays;
- internal QA notes;
- raw matcher/debug fields;
- unintended branch/module internals in player-facing question payloads unless
  Director explicitly approves them for UI.

Session compatibility should be checked through the full lifecycle:
`start-watch` -> `submit-answer` -> `finish-watch` -> `progress`, plus Lost
Oars and answer-log behavior for wrong/skipped/spelling/variant answers.

## Missing QA Cases

The future implementation smoke should add these cases before QA approval:

- invalid `mode` returns a controlled error and does not default to mixed;
- `mode` absent with `branch` present behaves exactly as mixed;
- `mode` absent with `module` present behaves exactly as mixed;
- `mode: "mixed"` with both `branch` and `module` ignores both;
- `focused_branch` with missing `branch` returns a controlled error;
- `focused_branch` with valid branch but underfilled level hard rejects;
- hard reject does not create a watch session or mutate progress;
- hard reject does not create Lost Oars, answer-log, or player-visible review
  artifacts;
- focused branch success cases verify item IDs belong to selected branch or to
  the allowed review quota;
- review quota source is classified: selected-branch weak, cross-branch weak,
  high-risk minimal-pair maintenance, or ordinary mixed review;
- `focused_module` hidden/unavailable cases are explicit and mutation-free;
- all success payloads preserve the current player-facing question privacy
  rules;
- all error payloads avoid player identity, session, CSRF, accepted-answer, and
  raw internal debug leakage;
- legacy unbranched items remain eligible in mixed mode;
- existing no-field callers receive the same response shape as Beta 1.0.

## Risks

Lost Oars:
Focused selection can over-prioritize unresolved weak items and make the watch
feel mislabeled. QA must verify weak items stay inside the existing quota and
that hard rejects do not create or resolve Lost Oars.

Finish Watch:
`finish-watch.php` currently depends on stored session question records and
result summaries, not branch metadata. QA must verify focused sessions still
finish with the same summary shape and no missing item references.

Progress:
`start-watch.php` currently updates `last_level`. QA must verify successful
focused starts preserve expected progress behavior, while invalid or
underfilled focused requests do not mutate progress.

Answer Log:
Branch filters should not change answer-log privacy or logging kinds. QA must
verify wrong, skip, hint, spelling, variant, and accepted-variant logs still hide
player identity and do not gain unsafe branch/session fields.

Matcher:
Focused branches concentrate similar phrases and can expose overly broad typo
or synonym behavior. QA must run targeted branch matcher samples and should not
treat branch filtering as a matcher change approval.

Dangerous Pairs:
Navigation and safety branches contain numbers, headings, ETA values, channels,
directions, signals, and warning terms. Branch QA must include dangerous
minimal-pair samples from `accept-reject-qa-pairs.json`, especially
`Securite/security`, `Pan-Pan/Mayday/Securite`, `heading/course/bearing`,
`090/90`, `1400/1500`, `port/starboard`, `advice/advise`, `berth/birth`, and
`fender/finder`.

## Recommended QA Smoke Matrix

Use this as the exact future smoke matrix for the first implementation review.

| ID | Area | Request | Expected |
| --- | --- | --- | --- |
| 1 | Mixed baseline | `level=beginner`, no new fields | `ok:true`, total `12`, same response shape, progressive order. |
| 2 | Mixed baseline | `level=intermediate`, no new fields | `ok:true`, total `16`, beginner+intermediate eligible only, progressive order. |
| 3 | Mixed baseline | `level=advanced`, no new fields | `ok:true`, total `20`, all levels eligible, progressive order. |
| 4 | Mixed ignore | no `mode`, valid `branch` | Behaves as mixed; branch is ignored. |
| 5 | Mixed ignore | no `mode`, valid `module` | Behaves as mixed; module is ignored. |
| 6 | Mixed ignore | `mode=mixed`, valid `branch` and `module` | Behaves as mixed; both filters ignored. |
| 7 | Mixed legacy | mixed watch repeated runs | Unbranched legacy items remain eligible. |
| 8 | Mixed weak quota | weak-heavy account, mixed watch | Weak items stay capped inside current quota; total length unchanged. |
| 9 | Invalid mode | unknown `mode` | Controlled error; no mixed fallback; no session/progress mutation. |
| 10 | Focused branch required | `mode=focused_branch`, missing `branch` | Controlled error; no session/progress mutation. |
| 11 | Focused branch invalid | `mode=focused_branch`, unknown `branch` | Controlled error; no mixed fallback; no session/progress mutation. |
| 12 | Focused branch success | Director-approved branch/level success case | Allowed length only; focus quota in range; review quota in range. |
| 13 | Focused branch order | same success case | Final order is `word -> short_expression -> phrase`. |
| 14 | Focused branch membership | same success case | Focus items belong to selected branch; non-focus items fit review quota. |
| 15 | Focused branch weak priority | selected-branch weak points exist | Selected-branch weak items prioritized without exceeding weak quota. |
| 16 | Cross-branch review | cross-branch weak points exist | Cross-branch weak items appear only inside review quota. |
| 17 | Underfilled branch | valid branch/level below threshold | `ok:false`, `branch_watch_unavailable`, no fallback. |
| 18 | Underfilled mutation | repeat case 17 | No watch session created, `progress.last_level` unchanged, no answer-log entry. |
| 19 | Focused module hidden | `mode=focused_module`, missing `branch` | Controlled unavailable/error response; no mutation. |
| 20 | Focused module hidden | `mode=focused_module`, missing `module` | Controlled unavailable/error response; no mutation. |
| 21 | Focused module hidden | valid branch, invalid module | Controlled unavailable/error response; no mutation. |
| 22 | Focused module hidden | valid-looking below-threshold module | Controlled unavailable response; no watch returned. |
| 23 | Payload privacy | every successful `start-watch` response | No `target_text`, `accepted_answers`, `qa_notes`, player email, `user_id`, `player_hash`, session token, CSRF, or debug fields in question payload. |
| 24 | Error privacy | every error response above | No secrets, player identity, session, CSRF, accepted answers, QA notes, or raw debug payload. |
| 25 | Submit compatibility | answer first question from focused success watch | `submit-answer` works and returns next visible question with current privacy rules. |
| 26 | Finish compatibility | finish focused success watch | Summary shape remains compatible; no branch-specific breakage. |
| 27 | Progress compatibility | after focused success watch | Progress remains readable; `completed_watches`, `last_level`, and history behavior stay compatible. |
| 28 | Lost Oars compatibility | wrong or skipped focused item | Lost Oars can list and resolve the item; no identity leakage. |
| 29 | Answer-log compatibility | wrong/spelling/variant on focused item | Logs expected kind only; admin review remains private and grouped by item. |
| 30 | Matcher branch sample | targeted branch accepts/rejects | Branch-specific should-accept and should-reject samples pass. |
| 31 | Dangerous pairs | branch dangerous-pair sample | Must-accept and must-reject samples pass, with exact numeric/signal/channel protection. |
| 32 | Regression command | validation/regression command assigned by Director-Engineer | Existing Captain Ether regression remains clean. |

## Director Decisions Needed

- Confirm hard reject as the required underfilled-pool behavior for the first
  hidden/internal implementation.
- Define which current branch/level combinations are expected to succeed and
  which are expected to reject during hidden QA.
- Confirm whether branch/module fields may ever appear in player-facing
  question payloads, or must remain internal until a UI task approves them.
- Confirm whether invalid `mode` should be a controlled error instead of
  defaulting to mixed.
- Confirm that `focused_module` must stay unavailable for this implementation
  even if module metadata exists.

## Scope Preserved

- Report-only mode.
- Runtime/API files not changed.
- UI files not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets, cookies, sessions, CSRF, player email, player identity, private
  config, and `.netrc` not touched or printed.

## Checks

Tests: not run; documentation-only QA review.

## Copy-Ready Handoff For Director Ether

```text
QA review for TASK-CE-0003: NEEDS DIRECTOR DECISION.
The Beta 1.1 start-watch branch-filter contract is directionally safe and
additive, but the proposed smoke cases are not sufficient as written. Before
implementation, approve hard-reject behavior, define success/reject
branch-level fixtures, keep focused_module hidden/unavailable, and adopt the
32-case QA smoke matrix in the QA report.
No runtime/API/UI/content data, matcher, router/registry, auth/platform,
Game Director docs, production config, deploy/FTP, or secrets were touched.
```
