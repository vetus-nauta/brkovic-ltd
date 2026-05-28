# Office Background Branch Filter Fixture Plan

Date: 2026-05-27
Role: QA / Captain Ether
Task: TASK-CE-OFFICE-QA-0001
Mode: report-only

## Status

PASS as a fixture plan for a future hidden/internal `start-watch` branch-filter
implementation.

This report converts the accepted 32-case smoke matrix into QA fixture needs.
It does not approve implementation, public UI exposure, production smoke,
runtime/API/UI/content-data edits, deploy, FTP, router/registry, auth/platform,
Watch Officer, Nav Desk, Game Director docs, production config, or secrets work.

## Inputs Reviewed

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`

## Fixture Accounts

Use dedicated local QA accounts or isolated local user records. Do not use
production identities. Reports must not include player email, user IDs, login
codes, cookies, sessions, CSRF values, player hashes, or private config values.

| Fixture account | Purpose | Required state before run | Matrix coverage |
| --- | --- | --- | --- |
| `qa_clean_mixed` | Default mixed baseline and ignored-filter checks. | No unresolved weak items; no active watch session; progress snapshot captured. | 1-7, 23, 24, 32 |
| `qa_weak_mixed` | Mixed weak quota preservation. | Weak-heavy state across several eligible items, including more weak items than the current quota can include. | 8 |
| `qa_focus_clean` | Focused branch success lifecycle. | No active watch session; progress snapshot captured; no answer-log delta for run marker. | 12-14, 23, 25-27, 30-32 |
| `qa_focus_branch_weak` | Selected-branch weak priority. | Unresolved weak items inside the selected success branch, above and below the weak quota boundary. | 15 |
| `qa_cross_branch_weak` | Cross-branch review quota. | Weak items in a different branch than the selected success branch; selected branch still has enough fresh items. | 16 |
| `qa_reject_safety` | Underfilled focused branch hard reject. | Progress and answer-log snapshots captured; no active watch session. | 17-18, 24 |
| `qa_invalid_filters` | Invalid mode, missing/unknown branch, and focused-module unavailable checks. | Progress and answer-log snapshots captured; no active watch session. | 9-11, 19-22, 24 |
| `qa_lost_oars_log` | Wrong/skipped focused item, Lost Oars, and answer-log compatibility. | Focused success branch available; answer-log snapshot captured; Lost Oars list initially known. | 28-29 |

If account creation is expensive, one account can cover multiple blocks only
when the implementation test harness can reset watch session, progress,
weak-item, Lost Oars, and answer-log state between cases. Mutation-safety cases
must keep before/after snapshots.

## Weak-Item Setup

The future implementation gate needs deterministic weak-state setup. QA should
not depend on accidental player history.

Required weak fixtures:

| Weak setup | Required data shape | Expected behavior |
| --- | --- | --- |
| Mixed weak-heavy | More unresolved weak items than the mixed watch can include for the selected level. Include varied item types where possible. | Mixed watch total remains `12`, `16`, or `20`; weak items stay capped by current quota; progressive final order remains intact. |
| Selected-branch weak | Unresolved weak items from a success branch such as `core_radio`, `marina_harbour`, or `navigation_reports`. Include enough selected-branch fresh items to fill the watch safely. | Selected-branch weak items are prioritized before fresh selected-branch items without exceeding weak quota or breaking focus/review quota ranges. |
| Cross-branch weak | Unresolved weak items from a branch different from the selected focused branch. | Cross-branch weak items can appear only inside review quota; they must not displace required focused quota. |
| Reject-case snapshots | No special weak items required, but progress, session, Lost Oars, and answer-log state must be snapshotted before invalid/underfilled requests. | Invalid, unavailable, and underfilled requests do not create weak items, resolve weak items, create Lost Oars, or write logs. |

Weak fixture data must never require editing `starter.json`, batch JSON, matcher,
policy, or runtime code as part of QA. If setup needs seed tooling, that belongs
to a future Director-Engineer implementation task.

## Branch/Level Inputs

Use this accepted hidden/internal branch-level matrix as the expected fixture
source. These cases are API QA fixtures only and do not approve public branch UI.

| Branch | Beginner | Intermediate | Advanced | Fixture use |
| --- | --- | --- | --- | --- |
| `core_radio` | success | success | success | Primary all-level success fixture. |
| `marina_harbour` | success | success | success | Secondary all-level success fixture. |
| `navigation_reports` | success | success | success | Success fixture with navigation numeric/minimal-pair risk. |
| `safety_securite` | reject | success | success | Underfilled beginner reject plus safety success checks. |
| `traffic_collision` | reject | reject | reject | Empty/no-current-pool hard reject. |
| `urgency_panpan` | reject | reject | reject | Empty/no-current-pool hard reject. |
| `distress_mayday` | reject | reject | reject | Empty/no-current-pool hard reject. |
| `onboard_operations` | reject | reject | reject | Empty/no-current-pool hard reject. |
| `vts_port_control` | reject | reject | reject | Empty/no-current-pool hard reject. |
| `review_minimal_pairs` | reject | reject | reject | Empty/no-current-pool hard reject. |

Success responses must keep the accepted watch lengths:

| Level | Watch length | Focus branch quota | Review quota | Type floor target |
| --- | ---: | ---: | ---: | --- |
| beginner | 12 | 9-10 | 2-3 | 3 words, 3 short expressions, 6 phrases |
| intermediate | 16 | 12-13 | 3-4 | 4 words, 5 short expressions, 7 phrases |
| advanced | 20 | 15-16 | 4-5 | 6 words, 6 short expressions, 8 phrases |

Final ordering must always be progressive after selection:

```text
word -> short_expression -> phrase
```

Underfilled or unavailable focused requests must hard reject. They must not
return a mixed watch.

## 32-Case Fixture Mapping

| Case IDs | Fixture need | Assertions |
| --- | --- | --- |
| 1-3 | `qa_clean_mixed`, no new fields, levels `beginner`, `intermediate`, `advanced`. | `ok:true`; totals `12/16/20`; current response shape; current level eligibility; progressive order. |
| 4-6 | `qa_clean_mixed`, stray valid `branch` and/or `module` with absent mode or `mode=mixed`. | Behaves as mixed; filters ignored; no player-facing branch/module internals. |
| 7 | `qa_clean_mixed`, repeated mixed runs. | Unbranched legacy items remain eligible in mixed mode. |
| 8 | `qa_weak_mixed`. | Weak quota remains capped; total length unchanged; progressive order remains intact. |
| 9-11 | `qa_invalid_filters`. | Unknown mode, missing branch, and unknown branch return controlled errors; no fallback; no mutation. |
| 12-14 | `qa_focus_clean`, one Director-approved success branch/level, preferably `core_radio` beginner first. | Allowed length only; focus/review quota in range; item membership classifiable; final order progressive. |
| 15 | `qa_focus_branch_weak`. | Selected-branch weak items prioritized within weak quota. |
| 16 | `qa_cross_branch_weak`. | Cross-branch weak items appear only inside review quota. |
| 17-18 | `qa_reject_safety`, `safety_securite` beginner; optionally one empty-pool branch at each level. | `ok:false`; `branch_watch_unavailable`; no mixed fallback; no watch/session/progress/log/Lost Oars mutation. |
| 19-22 | `qa_invalid_filters`, `mode=focused_module` variants. | Missing branch, missing module, invalid module, and below-threshold module return controlled unavailable/error responses with no watch and no mutation. |
| 23 | All success fixtures. | Success payload privacy assertions pass. |
| 24 | All error fixtures. | Error payload privacy assertions pass. |
| 25-27 | `qa_focus_clean`, continue one focused success watch. | `submit-answer`, `finish-watch`, and progress remain compatible with current shapes and privacy rules. |
| 28-29 | `qa_lost_oars_log`, wrong/skipped/spelling/variant on focused item. | Lost Oars lists/resolves expected item; answer-log writes expected kind only; admin grouping remains private. |
| 30-31 | Branch-specific accept/reject samples from `accept-reject-qa-pairs.json`. | Should-accept examples pass; should-reject and dangerous minimal pairs remain wrong, including numeric/signal/channel protections. |
| 32 | Director-Engineer assigned validation/regression command. | Existing Captain Ether regression remains clean. |

## Privacy Assertions

For every successful `start-watch` response, inspect top-level response,
question payloads, stored visible question records returned by follow-up APIs,
and any summary/progress/Lost Oars payload touched during the run.

Must not appear:

- `target_text`
- `accepted_answers`
- raw accepted-answer arrays
- `qa_notes`
- matcher/debug internals
- player email
- player identity fields
- `user_id`
- `player_hash`
- session token
- CSRF value
- cookies
- login codes
- raw branch/module internals in player-facing question payloads unless a later
  Director UI/API payload decision explicitly approves them

For every error response, additionally assert that the response does not echo
unsafe raw input, private account state, session data, accepted answers, QA
notes, stack traces, file paths, or debug payloads.

## Mutation-Safety Checks

Before each invalid, unavailable, or underfilled request, capture local
snapshots through approved local test helpers or read-only API checks:

- active watch/session count or current watch identifier;
- `progress.last_level`;
- `completed_watches`;
- visible progress history count;
- Lost Oars count and item IDs;
- answer-log count or latest safe metadata marker;
- review artifact count, if the implementation creates any local review state.

After each rejected request, assert:

- no watch session was created;
- no returned payload contains a question list;
- `progress.last_level` is unchanged;
- `completed_watches` is unchanged;
- no Lost Oars were created, resolved, or reordered;
- no answer-log entry was created;
- no player-visible review artifact was created;
- no mixed watch fallback occurred;
- error body is controlled and privacy-safe.

After successful focused requests, assert mutation is limited to the existing
compatible lifecycle: start creates a normal watch session, submit advances a
normal question flow, finish writes the normal summary/progress state, and wrong
or skipped answers affect Lost Oars and answer logs only as already allowed by
current Captain Ether behavior.

## Matcher And Dangerous-Pair Samples

Use `accept-reject-qa-pairs.json` as the regression source. The future QA gate
should select branch-relevant samples rather than inventing broad synonyms.

Minimum sample groups:

- `core_radio`: `over/out`, `roger/affirmative`, `affirmative/negative`,
  `read back/say again`, channel and number strictness, `Alfa/Alpha`,
  `advice/advise`.
- `marina_harbour`: `berth/birth`, `berth/dock/quay/pier/slip`,
  `line/rope`, `fender/finder`, `fender/bumper`, `port side to/starboard side
  to`, `water/fuel/shore power`.
- `navigation_reports`: `heading/course/bearing`, `090/90`, `1400/1500`,
  ETA, units, decimal wording, direction and reporting-point values.
- `safety_securite`: `Securite/Sécurité/security`,
  `Securite/Pan-Pan/Mayday`, `safety/urgency/distress`,
  `warning/advice/information`, restricted-visibility and hazard wording.

Expected result:

- every `should_accept` sample passes;
- every `should_reject` sample remains wrong;
- dangerous minimal pairs stay protected;
- branch filtering does not change matcher policy.

## Future QA Execution Notes

- Run this fixture plan locally first. Production smoke requires a separate Game
  Director decision.
- Do not expose branch/module selector UI as part of this fixture plan.
- Do not add or edit content data for QA unless a future Director-Engineer task
  explicitly grants it.
- Treat any missing deterministic seed helper as a Director-Engineer blocker,
  not as permission for QA to edit runtime or data.
- Keep full findings in the assigned QA report. Chat output should remain the
  compressed task format.

## Scope Preserved

- Report-only mode.
- Runtime/API/UI files not changed.
- Content data not changed.
- `starter.json` not changed.
- Batch JSON not changed.
- Matcher not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- Production config and deploy/FTP state not touched.
- Secrets, cookies, sessions, CSRF values, login codes, SMTP details, `.netrc`,
  player email, player identity data, private config, API keys, tokens, and
  passwords not touched or printed.

## Checks

Tests: not run; documentation-only task.

## Copy-Ready Handoff For Director Ether

```text
QA fixture plan for TASK-CE-OFFICE-QA-0001: PASS.
The accepted 32-case branch-filter smoke matrix is converted into fixture needs:
dedicated local QA accounts, deterministic weak-item setups, branch/level
success-reject inputs, success/error privacy assertions, mutation-safety checks,
focused lifecycle compatibility, Lost Oars/answer-log compatibility, and
branch-specific matcher/dangerous-pair samples.
This report does not approve implementation, public UI exposure, production
smoke, deploy/FTP, router/registry/auth/platform, content-data backfill, Watch
Officer, Nav Desk, production config, or secrets work.
```
