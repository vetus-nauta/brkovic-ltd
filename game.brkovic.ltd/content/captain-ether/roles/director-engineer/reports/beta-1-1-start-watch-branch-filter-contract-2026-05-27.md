# Beta 1.1 Start-Watch Branch Filter Contract

Date: 2026-05-27
Role: Director Ether / Captain Ether
Task: TASK-CE-0002
Revision: TASK-CE-0004 after QA review TASK-CE-0003
Mode: report-only

## Status

PASS as a revised future implementation contract.

QA re-review is required before any runtime, API, UI, content-data, QA-gate, or
production change is assigned.

This contract must preserve the Beta 1.0 public baseline:

- beginner watch length: `12`
- intermediate watch length: `16`
- advanced watch length: `20`
- final order: `word -> short_expression -> phrase`
- default public watch mode: mixed universal watch

## Inputs Reviewed

- `content/captain-ether/roles/curriculum-architect/reports/beta-1-1-branch-aware-watch-architecture-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0001-curriculum-architect-review-2026-05-27.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/starter.json`
- `public/api/captain-ether/start-watch.php`
- `content/captain-ether/roles/qa/reports/beta-1-1-start-watch-branch-filter-contract-qa-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0003-qa-contract-review-accepted-2026-05-27.md`

## Proposed Request Fields

Future `POST /api/captain-ether/start-watch.php` may accept these additive
fields:

```json
{
  "level": "beginner",
  "mode": "mixed",
  "branch": null,
  "module": null
}
```

Allowed `mode` values:

- `mixed`
- `focused_branch`
- `focused_module`

Allowed `branch` values must come from `content/captain-ether/branch-taxonomy.md`.

Allowed `module` values must come from item metadata inside the selected branch.

Invalid values should not silently create a new mode, branch, or module.

Invalid `mode` must return a controlled error and must not fall back to mixed.

## Default Behavior

If `mode`, `branch`, and `module` are absent, behavior must be exactly the
current Beta 1.0 behavior:

- read `level`;
- filter content by current level eligibility;
- include unresolved weak items within the current quota logic;
- select up to the current watch length;
- sort selected items progressively;
- return the same response shape.

No existing caller should need to send new fields.

If `mode` is absent but `branch` or `module` is present, the implementation
should ignore `branch` and `module` and behave as `mixed`. This preserves
backward compatibility and avoids accidental hidden branch activation.

This is the only case where stray filters are ignored. Once `mode` is present,
invalid mode/filter combinations must return controlled errors or unavailable
responses as defined below.

## Mixed Mode

`mode: "mixed"` is the universal watch.

Rules:

- ignore `branch`;
- ignore `module`;
- include branched and unbranched eligible items;
- preserve current weak-item quota;
- preserve current type quota and progressive sorting;
- preserve current watch lengths.

This is the public default until a separate Director decision approves branch
UI exposure.

`mode: "mixed"` must ignore both `branch` and `module`, including valid-looking
values. Mixed mode should not expose branch/module metadata in the player-facing
question payload.

## Focused Branch Mode

`mode: "focused_branch"` requires a valid `branch`.

Missing or unknown `branch` must return a controlled invalid-filter error. It
must not create a watch session, mutate progress, create Lost Oars, create
answer-log entries, or return a mixed watch.

Recommended future split:

| Level | Watch length | Focus branch quota | Review quota |
| --- | ---: | ---: | ---: |
| beginner | 12 | 9-10 | 2-3 |
| intermediate | 16 | 12-13 | 3-4 |
| advanced | 20 | 15-16 | 4-5 |

Selection order should be:

1. eligible unresolved weak items from selected branch;
2. eligible fresh/review items from selected branch;
3. eligible unresolved weak items from any branch;
4. high-risk core radio or minimal-pair maintenance items;
5. ordinary mixed review if quota remains.

The final selected watch must still be sorted by item type after selection:

```text
word -> short_expression -> phrase
```

Focused branch mode should not include unrelated ordinary items just to satisfy
the focus quota. If the branch cannot safely fill the watch, use the
underfilled-pool policy below.

For the first hidden/internal implementation, branch/module values must remain
internal selection filters. They must not appear in player-facing question
payloads unless a later UI/API payload decision explicitly approves them.

## Focused Module Mode

`mode: "focused_module"` requires both:

- valid `branch`;
- valid `module` inside that branch.

This mode should remain hidden until later. It should not be exposed in public
UI before module-specific thresholds and QA smoke exist.

For the first branch-filter implementation, `focused_module` is unavailable even
when module metadata exists. It must return a controlled unavailable response
for missing branch, missing module, invalid module, or below-threshold module,
with no session/progress/log mutation.

Minimum recommended module exposure threshold:

- at least `24` items in the module;
- at least `8` phrase items;
- at least `4` short-expression items;
- at least `2` word items where relevant;
- at least `2x` the shortest watch length if beginner can select it.

Focused module selection should keep a smaller mixed review quota, but never
increase watch length.

## Underfilled-Pool Behavior

Options:

1. Hard reject: return a clear API error when a focused branch/module cannot
   fill a safe watch.
2. Silent fallback: convert the request to mixed mode.
3. Explicit fallback metadata: return a mixed watch with response metadata
   explaining that the focus was unavailable.

Recommendation:

Use hard reject for any future direct/API/internal focused request until UI
exposure rules are implemented.

Suggested error shape:

```json
{
  "ok": false,
  "error": "branch_watch_unavailable",
  "reason": "Focused watch pool is below threshold",
  "required_mode": "mixed"
}
```

Rationale:

- silent fallback makes QA ambiguous;
- explicit fallback can confuse player-facing UI unless designed;
- hard reject is safest for hidden/internal branch QA;
- public UI should hide unavailable branches before a request is sent.

Later, after UI states are designed, a Director decision may allow controlled
fallback metadata for player-facing use.

Hard reject mutation rule:

- no watch session is created;
- `progress.last_level` is not changed;
- no Lost Oars are created or resolved;
- no answer-log entry is created;
- no player-visible review artifact is created;
- error response must not echo unsafe raw input, player identity, session, CSRF,
  accepted answers, QA notes, or debug fields.

## Branch And Level Exposure Rules

Do not expose a public branch selector unless the branch has:

- at least `60` total items;
- at least `24` beginner-eligible items;
- at least `32` beginner+intermediate eligible items;
- at least `40` advanced-eligible items;
- at least `6` words;
- at least `10` short expressions;
- at least `20` phrases;
- at least `3` modules with regression coverage;
- all branch items have `branch` and `module`;
- branch-specific QA smoke passes for beginner, intermediate, and advanced.

Current planning readiness:

- internal contract planning only: `core_radio`, `marina_harbour`,
  `navigation_reports`;
- partial only: `safety_securite`;
- not ready: all other branches and unbranched legacy starter items.

Hidden/internal first-implementation expected fixtures:

| Branch | Beginner | Intermediate | Advanced | Notes |
| --- | --- | --- | --- | --- |
| `core_radio` | success | success | success | Primary success fixture for all levels. |
| `marina_harbour` | success | success | success | Hidden QA only; not public UI-ready. |
| `navigation_reports` | reject | success | success | Beginner rejects: beginner pool has no phrases and cannot meet the type floor. |
| `safety_securite` | reject | success | success | Beginner rejects as underfilled for safe focus. |
| `traffic_collision` | reject | reject | reject | No current content pool. |
| `urgency_panpan` | reject | reject | reject | No current content pool. |
| `distress_mayday` | reject | reject | reject | No current content pool. |
| `onboard_operations` | reject | reject | reject | No current content pool. |
| `vts_port_control` | reject | reject | reject | No current content pool. |
| `review_minimal_pairs` | reject | reject | reject | No current content pool. |

These fixtures are for hidden/internal API QA only. They do not approve public
branch UI exposure.

Branch/level combinations should be hidden if they cannot meet the type floor:

| Level | Watch length | Word target | Short-expression target | Phrase remainder |
| --- | ---: | ---: | ---: | ---: |
| beginner | 12 | 3 | 3 | 6 |
| intermediate | 16 | 4 | 5 | 7 |
| advanced | 20 | 6 | 6 | 8 |

## Required QA Smoke Before Implementation Approval

The QA 32-case smoke matrix from TASK-CE-0003 is accepted as the minimum future
local QA gate for the first implementation review.

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

Production smoke remains a separate Game Director decision and is not implied
by local QA approval.

## Later Implementation Touch Points

A later implementation task would likely touch:

- `public/api/captain-ether/start-watch.php`
- `content/captain-ether/tools/validate-captain-ether.php`
- `content/captain-ether/accept-reject-qa-pairs.json` if new branch samples are
  added
- `content/captain-ether/starter.json` only if metadata backfill is explicitly
  assigned
- `public/assets/app.js` only after a separate UI selector task
- `public/assets/app.css` only after a separate UI selector task
- `public/service-worker.js` only if UI assets change and cache bump is needed

Files that should not be touched by the selector contract implementation:

- router/registry unless a separate Game Director platform task grants it;
- auth/platform;
- Watch Officer;
- Nav Desk;
- production config;
- deploy/FTP state.

## Risks And Blockers

Risks:

- focused pools can amplify dangerous minimal-pair collisions;
- silent fallback could hide broken branch selection;
- shallow branches can cause repetition fatigue;
- unbranched legacy items could disappear from focused modes without a backfill
  decision;
- branch UI can make Captain Ether feel like a course catalog if exposed too
  early.

Blockers before implementation:

- QA re-review of this revised contract;
- decision whether to backfill branch/module metadata for the 40 unbranched
  legacy starter items before any public UI;
- future implementation task must define local fixture setup for weak-heavy and
  mutation-safety smoke cases.

## Next Role Command For Director Ether

Recommended next step:

Assign QA a report-only re-review of this revised contract before
implementation. QA should verify that TASK-CE-0003 findings are resolved and
that the success/reject fixture table is testable.

No implementation should start until QA has re-reviewed this revised contract
and Director Ether has accepted the re-review.

## Scope Preserved

- runtime/API not changed.
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

Tests: not run; documentation-only task.
