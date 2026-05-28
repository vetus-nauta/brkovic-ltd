# Captain Ether Handoff

Date: 2026-05-26

## Beta 1.0 Director Handoff

Use this as the first-read transfer file for the next director chat:

```text
content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md
```

It freezes the Captain Ether Beta 1.0 baseline and lists the role folders,
closed QA gates, architecture, validation commands, and next management choices.

## Scope

Captain Ether owns only:

- `content/captain-ether/`
- `public/api/captain-ether/`

Do not change router, registry, Nav Desk, Watch Officer, auth, or platform files from this workstream.

## Current State

Captain Ether is live at:

```text
https://game.brkovic.ltd/games/captain-ether
```

The game hub remains:

```text
https://game.brkovic.ltd/
```

Content state:

- `230` Captain Ether items.
- `112` grammar patterns.
- `2` scenarios.
- All items have `accepted_answers`.
- First watches are shorter: beginner `12`, intermediate `16`, advanced `20`.
- Watch order is progressive: words, short expressions, longer phrases.

## Answer Policy

Minor spelling, punctuation, capitalization, spacing, and small grammar slips should not make a clearly correct Sea Speak answer wrong.

The matcher order is:

1. Exact accepted answer.
2. Accepted Sea Speak variant or synonym.
3. Conservative spelling typo.
4. Wrong answer.

The typo layer must stay conservative. It must not fuzz numeric tokens, channel numbers, headings, ETA digits, protected radio signals, or short nautical terms where one missing letter changes meaning.

## Source Files

- `starter.json`: playable Captain Ether content and accepted answers.
- `accepted-answer-dictionary.md`: linguistic decisions for each item.
- `accept-reject-qa-pairs.json`: regression source for accept/reject behavior.
- `answer-log-policy.md`: policy for collecting real disputed player answers.
- `answer-policy.md`: pedagogical and matcher policy.
- `branch-taxonomy.md`: branch model for the long-term Captain Ether corpus.
- `batch-001-radio-procedure-brief.md`: assignment brief for the first content-growth batch.
- `content-growth-roadmap-1000.md`: roadmap for scaling Captain Ether to `1000+` items.
- `role-command-protocol.md`: narrow role boundaries for Director-Engineer, Content Producer, Sea Speak Linguist, and QA.
- `roles/`: per-position rules and handoff folders for active and dormant Captain Ether roles.
- `sea-speak-linguist-brief.md`: role definition for future linguistic review.
- `_answer-matching.php`: runtime matcher logic.
- `_answer-logging.php`: runtime logging helper for disputed answers.
- `answer-log.php`: admin-only API endpoint for reviewing answer logs.
- `start-watch.php`: watch length and progressive item ordering.
- `submit-answer.php`, `resolve-lost-oar.php`, `finish-watch.php`: runtime answer handling and summaries.

## Regression Status

`accept-reject-qa-pairs.json` covers:

- `230` items.
- `631` should-accept examples.
- `709` should-reject examples.
- `49` dangerous minimal pair groups.

Dangerous minimal pairs:

- `port / starboard`
- `stern / astern`
- `over / out`
- `roger / affirmative`
- `channel 72 / channel 71`
- `090 / 90`
- `1400 / 1500`
- `say again / repeat`
- `roger / affirmative / correct`
- `affirmative / negative`
- `read back / say again`
- `channel 12 / channel 13 / channel 16`
- `1500 / 1400`
- `Alfa / Alpha`
- `advice / advise`
- `berth / birth`
- `berth / dock / quay / pier / slip`
- `moor / berth / anchor`
- `line / rope`
- `fender / finder`
- `fender / bumper`
- `port side to / starboard side to`
- `ahead / astern / alongside / abeam`
- `stand by outside / wait out / do not answer`
- `proceed / enter / approach / go ahead`
- `request berth / need a berth`
- `water / fuel / shore power`
- `arrival / departure`
- `heading / course / bearing`
- `position / destination / waypoint / reporting point`
- `1400 UTC / 1400Z / one four zero zero UTC`
- `knots / nautical miles / cables`
- `decimal / point / dot`
- `north / south / east / west`
- `port / starboard inside navigation phrases`
- `say again position / read back position`
- `Securite / Sécurité / security`
- `Securite / Pan-Pan / Mayday`
- `safety / urgency / distress`
- `warning / advice / information`
- `restricted visibility / poor visibility / reduced visibility / visibility good`
- `obstruction / obstacle`
- `navigation warning / weather warning`
- `hazard / obstruction / danger`
- `wind / sea state / visibility`
- `listening watch / stand by / keep watch`
- `exact safety channels, times, bearings, distances, directions, and locations`

Current matcher findings: `0`.

Resolved matcher findings:

- `security security security` no longer passes as `Securite`.
- `1500Z` no longer passes as `1400Z`.
- `advise` no longer passes as `advice`.
- `birth` no longer passes as `berth`.
- `finder` / `finders` no longer pass as `fender` / `fenders`.

## Production Verification

Production files were uploaded and hash-checked against local source for the matcher, content, answer policy, and QA files.

Live API checks confirmed:

- `1400Z` is accepted.
- `1500Z` is wrong.
- `Sécurité Sécurité Sécurité` is accepted.
- `security security security` is wrong.
- `starbord` is accepted as a spelling reminder for `starboard`.

## UX/HUD Pass

Captain Ether UX/HUD was reviewed and deployed after the answer-policy work.

Changed files:

- `public/assets/app.js`
- `public/assets/app.css`
- `public/service-worker.js`

The service worker cache name was bumped to `brkovic-games-shell-v4` so the updated UI assets are refreshed for users.

Accepted UX changes:

- The watch screen now puts the question first as the main visual anchor.
- The HUD shows a compact short-watch status and progress.
- Previous-answer feedback sits below the current question.
- Spelling and variant feedback is soft: accepted, then standard form.
- Beginner/intermediate/advanced are presented as 12/16/20-call watches.
- Summary wording is calmer.
- Lost Oars is presented as quiet phrase revision, not punishment.
- Mobile Captain watch/summary/Lost Oars states use a non-sticky compact header and hide the profile email.

Local mobile smoke confirmed:

- Captain watch screen visible at mobile width.
- Question prompt visible.
- Profile email hidden in the game state.
- Header position is static.
- Horizontal overflow is `0`.
- A spelling answer shows accepted feedback and the standard form.

HTTPS production checks confirmed:

- `/assets/app.js`, `/assets/app.css`, and `/service-worker.js` are served with the deployed hashes.
- `/games/captain-ether` returns `200`.
- Existing authenticated API session remains valid.

## Answer Logs

Captain Ether now keeps a small QA log for real disputed answers.

Logged kinds:

- `wrong`
- `skip`
- `hint`
- `spelling`
- `variant`
- `accepted_variant`

Clean canonical exact answers are not logged.

Runtime storage:

```text
storage/captain_answer_logs.json
```

Admin-only endpoint:

```text
GET /api/captain-ether/answer-log.php
```

Optional filters:

```text
?limit=100
?kind=wrong
?item_id=phrase_eta_001
```

The log stores a short `player_hash`, not player email. Use it only for Captain Ether QA and Sea Speak review.

Production smoke confirmed:

- `1500Z` for `phrase_eta_001` logs as `wrong`.
- The latest answer-log entry includes `item_id`, `answer`, `correct`, `match_type`, `log_kind`, and `player_hash`.
- Player email is not present in the log entry.
- The endpoint returns `401` without an authenticated session.

MVP hardening added an admin-only answer-log review surface:

- endpoint returns compact `review_groups` grouped by `item_id`;
- admin UI shows `Журнал ответов` for users with role `admin`;
- grouped UI hides `player_hash` and does not display player identity fields;
- service worker cache bumped to `brkovic-games-shell-v6`;
- report:
  `roles/director-engineer/reports/mvp-hardening-answer-log-admin-2026-05-27.md`.

## QA Smoke Follow-up

QA report:

```text
content/captain-ether/qa-smoke-captain-ether-2026-05-26.md
```

Resolved findings:

- Lost Oars resolved cards are removed from the visible list immediately after a successful correction.
- Intermediate watch selection no longer uses deterministic sorted pools for selection. It now prefers current-level items while keeping the final watch order progressive.
- Weak items are capped inside regular watches so an account with many unresolved weak points does not block current-level material.

Local verification:

- Lost Oars mobile smoke: one visible card before correction, zero visible cards after correction, horizontal overflow `0`.
- Intermediate selection smoke: `8` runs, each with `16` questions, `8` intermediate items, monotonic type order, and all `10` intermediate items reached across the run set.
- Weak-heavy intermediate smoke: `16` questions, `8` beginner items, `8` intermediate items, monotonic type order.

Production QA retest:

- Lost Oars immediate removal: `PASS`.
- Intermediate item reachability: `PASS`.
- QA ran `3` intermediate watches.
- Each watch had `16` questions.
- Type order stayed `word -> short_expression -> phrase`.
- Required intermediate items were found across runs:
  - `expr_switch_channel_001`
  - `phrase_eta_001`
  - `phrase_my_heading_001`
  - `phrase_my_speed_001`
  - `phrase_will_pass_astern_001`
- No remaining reproduction steps.

## Role Protocol

Captain Ether now uses narrow roles:

- Director-Engineer owns project logic, runtime, policy, integration, and deploy.
- Content Producer drafts assigned batch files only.
- Sea Speak Linguist reviews Sea Speak meaning and reports matcher risks.
- QA tests and reports only.

Use `role-command-protocol.md` and `roles/` for assignments.

Active role folders:

- `roles/director-engineer/`
- `roles/content-producer/`
- `roles/sea-speak-linguist/`
- `roles/qa/`

Dormant role folders, prepared for later activation:

- `roles/curriculum-architect/`
- `roles/scenario-designer/`
- `roles/ux-hud-designer/`
- `roles/gamification-designer/`
- `roles/answer-log-analyst/`

Roles do not self-expand scope. Policy/runtime changes require Director-Engineer acceptance.

## Batch 001 Engineering Follow-up

Content Producer and Sea Speak Linguist completed a risk review for:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

Batch status:

- `50` items.
- `15` word items.
- `15` short-expression items.
- `20` phrase items.
- levels: `25` beginner, `18` intermediate, `7` advanced.
- dangerous minimal pairs: `9`.
- status: merged into `starter.json`.

Engineering finding accepted:

- `word_core_advice_marker_001` with answer `advise` was accepted as spelling for `advice`.
- This is wrong because `advice` is the message-marker noun and `advise` is a verb.

Runtime fix:

- `_answer-matching.php` now protects `advice / advise` as a forbidden typo pair.

Local validation after the fix:

- Batch 001 QA: `50` items, `147` accept examples, `150` reject examples, `0` failures.
- Batch 001 dangerous minimal pairs: `16` must-accept checks, `26` must-reject checks, `0` failures.
- Starter QA regression: `40` items, `0` failures.
- `advice` is accepted.
- `advise` is wrong.

QA acceptance before merge:

- Report: `content/captain-ether/qa-batch-001-acceptance-2026-05-27.md`.
- Result: `PASS`.
- QA was report-only and found no failures.

Merge result:

- `50` Batch 001 items merged into `starter.json`.
- `19` Batch 001 grammar patterns merged into `starter.json`.
- Batch item QA notes were moved into `accept-reject-qa-pairs.json`.
- Batch `qa_notes` were not copied into playable runtime items.
- Combined local matcher regression after merge: `90` items, `267` should-accept examples, `270` should-reject examples, `15` dangerous minimal-pair groups, `0` failures.
- Watch-selection smoke on the larger corpus passed for beginner, intermediate, and advanced.

Production QA smoke:

- Report: `content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md`.
- Result: `PASS`.
- Production route/login works.
- Watch lengths are `12` / `16` / `20`.
- Progressive order stayed `word -> short_expression -> phrase`.
- QA observed `23` Batch 001 item IDs live.
- Player-facing payload did not expose `target_text`, `accepted_answers`, or `qa_notes`.
- Targeted matcher checks passed.

## Next Work

Do not expand synonyms blindly.

Long-term content goal: grow Captain Ether to `1000+` Sea Speak words, short expressions, radio phrases, and scenario turns. Use `content-growth-roadmap-1000.md` as the production plan.

The `1000+` target is a corpus goal, not one huge advanced level. The corpus should branch into:

- `core_radio`
- `marina_harbour`
- `navigation_reports`
- `traffic_collision`
- `safety_securite`
- `urgency_panpan`
- `distress_mayday`
- `onboard_operations`
- `vts_port_control`
- `review_minimal_pairs`

Use `branch-taxonomy.md` as the canonical branch map.

Next Captain Ether language work should come from real player answer logs:

- collect answers marked wrong;
- group by item;
- send only disputed examples to the Sea Speak linguist;
- add accepted variants only when maritime meaning stays exact;
- add reject cases whenever a new minimal pair appears.

Next content-production step:

- keep Batch 001 and Batch 002 closed unless QA or production smoke finds a regression;
- Batch 002 is merged into `starter.json` and deployed;
- Batch 003 is merged into `starter.json`, deployed, and production-smoke accepted;
- Batch 004 is merged into `starter.json`, deployed, production-smoke accepted,
  and closed by Game Director as TASK-0078;
- Game Director accepted the auth blocker and assigned Platform Auth `TASK-0065`:
  `game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md`;
- Platform Auth approved the production QA login method:
  `game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`;
- merge report: `roles/director-engineer/reports/batch-002-merge-2026-05-27.md`;
- Batch 003 merge report: `roles/director-engineer/reports/batch-003-merge-2026-05-27.md`;
- production smoke report: `roles/qa/reports/batch-002-production-smoke-2026-05-27.md`;
- Batch 003 production smoke report:
  `roles/qa/reports/batch-003-production-smoke-2026-05-27.md`;
- Batch 003 production smoke accepted:
  `roles/director-engineer/reports/batch-003-production-smoke-accepted-2026-05-27.md`;
- Batch 003 auth-block decision:
  `roles/director-engineer/reports/batch-003-production-smoke-auth-block-decision-2026-05-27.md`;
- outbound Platform/Auth request:
  `roles/director-engineer/reports/platform-auth-production-qa-login-request-2026-05-27.md`;
- Platform Auth TASK-0065 result accepted:
  `roles/director-engineer/reports/platform-auth-task-0065-result-accepted-2026-05-27.md`;
- MVP readiness report: `roles/director-engineer/reports/mvp-readiness-analysis-2026-05-27.md`;
- validation command: `php content/captain-ether/tools/validate-captain-ether.php`;
- validation command report: `roles/director-engineer/reports/validation-command-2026-05-27.md`;
- TASK-0066 is approved/PASS from Game Director; no Captain Ether blocker remains;
- Batch 004 brief:
  `batch-004-safety-securite-warnings-brief.md`;
- Batch 004 target file:
  `batches/batch-004-safety-securite-warnings.json`;
- Batch 004 assignment report:
  `roles/director-engineer/reports/batch-004-assignment-to-content-producer-2026-05-27.md`;
- Batch 004 producer report:
  `roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md`;
- Batch 004 intake report:
  `roles/director-engineer/reports/batch-004-intake-to-linguist-2026-05-27.md`;
- Batch 004 linguist report:
  `roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`;
- Batch 004 engineering gate:
  `roles/director-engineer/reports/batch-004-engineering-gate-2026-05-27.md`;
- Batch 004 acceptance QA:
  `roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md`;
- Batch 004 merge report:
  `roles/director-engineer/reports/batch-004-merge-2026-05-27.md`;
- Batch 004 production smoke report:
  `roles/qa/reports/batch-004-production-smoke-2026-05-27.md`;
- Batch 004 production smoke auth-block decision:
  `roles/director-engineer/reports/batch-004-production-smoke-auth-block-decision-2026-05-27.md`;
- outbound Platform/Auth request:
  `roles/director-engineer/reports/platform-auth-batch-004-production-qa-code-channel-request-2026-05-27.md`;
- Platform Auth one-off access decision:
  `docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`;
- Batch 004 production smoke accepted:
  `roles/director-engineer/reports/batch-004-production-smoke-accepted-2026-05-27.md`;
- TASK-0078 Game Director closure accepted:
  `roles/director-engineer/reports/task-0078-game-director-closure-accepted-2026-05-27.md`;
- active Captain Ether assignment:
  none;
- next management choice:
  assign a new content-growth batch or run MVP-hardening based on production use
  and answer logs;
- MVP hardening answer-log admin view:
  `roles/director-engineer/reports/mvp-hardening-answer-log-admin-2026-05-27.md`;
- Game Director's stated next work direction is Watch Officer, outside Captain
  Ether scope unless a new Captain Ether task is explicitly assigned;
- Batch 003 is closed unless production smoke or separate Game Director QA
  output finds a new Captain Ether issue;
- all new batches must go through Content Producer, Sea Speak Linguist, QA, then Director-Engineer merge.
