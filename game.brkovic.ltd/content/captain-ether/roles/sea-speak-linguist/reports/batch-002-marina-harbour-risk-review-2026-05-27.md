# Sea Speak Linguist Report: Batch 002 Marina / Harbour Risk Review

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Mode: linguistic review with content-side patch allowed for assigned batch only

## Task Result

PASS for linguistic/content review.

Batch 002 is ready for Director-Engineer engineering gate with runtime matcher
risks listed below. It is not ready for QA/merge until Director-Engineer decides
or fixes the matcher leaks for `berth / birth` and `fender / finder`.

## Changed Files

- `content/captain-ether/batches/batch-002-marina-harbour-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md`

No matcher/API/UI, starter, regression, policy, deploy, router, auth, Nav Desk,
or Watch Officer files were edited by this task.

## Counts After Review

Total items: `50`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 10 |
| `short_expression` | 14 |
| `phrase` | 26 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 18 |
| `intermediate` | 27 |
| `advanced` | 5 |

By branch:

| Branch | Count |
| --- | ---: |
| `marina_harbour` | 50 |

Supporting structures:

- grammar patterns: `22`
- top-level dangerous minimal-pair groups: `12`

## Accepted Answer Decisions

Approved item-local variants:

- `request a berth` for `request berth`.
- `requesting berth` / `requesting a berth` for berth-request phrases.
- `request fresh water` for `request water` in water-service items.
- `request water` for `Request fresh water.` in the routine water-service item.
- `request permission to depart` for `request departure`.
- `request departure permission` and `request departure` for `Request permission to depart.`
- `approach slowly` for `Approach at slow speed.`
- `after fuel` for `After taking fuel, proceed to your berth.`
- optional article forms such as `proceed to the berth`.
- short side-to forms `port side to` and `starboard side to` for side-to berthing phrase items.

Removed unsafe accepted variants:

- `fenders ready` was removed from `expr_marina_prepare_fenders_001.accepted_answers`.
- `lines ready` was removed from `expr_marina_prepare_lines_001.accepted_answers`.
- `bow and stern lines ready` was removed from `phrase_marina_prepare_bow_stern_lines_001.accepted_answers`.

Reason: these are status reports, while the target items are instructions to
prepare equipment.

## Must-Stay-Wrong Examples

These examples must remain wrong across Batch 002 unless Director-Engineer later
assigns a new policy task:

- `birth` for `berth`.
- `request birth` for `request berth`.
- `dock`, `quay`, `pier`, `slip` for berth items.
- `fuel dock`, `fuel pier`, `visitor dock`, `leaving the dock`.
- `moor`, `mooring`, or `anchor` as substitutes for berth items.
- `rope`, `ropes ready`, `prepare ropes` for line items.
- `finder`, `finders`, `prepare finders`, `prepare finders on port side`.
- `bumper`, `bumpers`, `prepare bumpers`.
- `left side to`, `right side to`.
- `starboard side to` for port-side items, and `port side to` for starboard-side items.
- `ahead`, `astern`, `abeam` for `alongside`.
- `wait out`, `do not answer`, or `wait outside` for `stand by outside`.
- `go ahead to berth`, `enter berth`, `approach berth` for `proceed to berth`.
- `need a berth` for formal berth-request drills.
- `request fuel` / `request shore power` for water items.
- `request power` / `request electricity` for shore-power items.
- `arrival` for `departure` and departure wording for arrival items.
- compact berth identifiers such as `B12` for `Bravo one two`.

## Mandatory Review Questions

1. Should `request fresh water` be accepted for `request water`, and should
   `request water` be accepted for `Request fresh water.`?

   Decision: yes, item-local only for water-service items. In routine marina
   context, `water` and `fresh water` preserve the same service meaning. Do not
   extend this to water/fuel/shore-power substitution.

2. Should `fenders ready` and `lines ready` remain accepted as equivalents for
   `prepare fenders` and `prepare lines`?

   Decision: no. They are status reports, not preparation instructions. Removed
   from prepare-command accepted answers and moved to `should_reject`.

3. Should `request departure`, `request departure permission`, and `request
   permission to depart` be treated as item-local variants?

   Decision: yes. These preserve the same routine departure-request meaning.
   They must stay separate from `departing now`, `arrival`, and `enter`.

4. Should `dock`, `quay`, `pier`, or `slip` ever be accepted item-locally for
   berth items, or should they remain rejected across Batch 002?

   Decision: reject across Batch 002. The batch trains `berth` terminology and
   avoids broad harbour synonym sets.

5. Should `bumper` ever be accepted for `fender`, or should `fender` stay strict?

   Decision: `fender` stays strict. `Bumper` is marina slang in some regions but
   not the trained Sea Speak term for this batch.

6. Should berth identifiers accept compact forms such as `B12`, or should Batch
   002 keep only spoken-form `Bravo one two` until matcher QA reviews
   alphanumeric formats?

   Decision: keep only spoken-form `Bravo one two`. `B12` / `B-12` should stay
   wrong until Director-Engineer reviews alphanumeric berth matching.

7. Is `Depart when the fairway is clear.` appropriate for routine marina scope,
   or too close to authority/traffic-control language?

   Decision: acceptable for this advanced routine marina item. It is a
   condition-based departure instruction, not distress, VTS reporting, or
   commercial traffic-control scope.

## Dangerous Minimal-Pair Decisions

| Pair | Decision |
| --- | --- |
| `berth / birth` | `birth` must stay wrong; runtime matcher risk. |
| `berth / dock / quay / pier / slip` | Keep all non-berth harbour terms wrong across Batch 002. |
| `moor / berth / anchor` | Keep separate; related harbour actions are not interchangeable. |
| `line / rope` | Keep `line` strict for mooring-line drills; reject `rope`. |
| `fender / finder` | `finder` must stay wrong; runtime matcher risk. |
| `fender / bumper` | Reject `bumper`; keep trained `fender`. |
| `port side to / starboard side to` | Opposite side-to instructions must never fuzz or translate to left/right. |
| `ahead / astern / alongside / abeam` | Relative-position terms stay distinct from alongside mooring language. |
| `stand by outside / wait out / do not answer` | `stand by outside` is a harbour waiting instruction; reject `wait out` and `do not answer`. |
| `proceed / enter / approach / go ahead` | Movement verbs stay item-specific; `go ahead` is not a movement synonym here. |
| `request berth / need a berth` | Formal `request berth` is trained; informal `need a berth` stays wrong. |
| `water / fuel / shore power` | Marina service types must not substitute for each other. |
| `arrival / departure` | Opposite workflow states; keep strict. |

## Matcher / Runtime Risks For Director-Engineer

Director-Engineer pre-check findings are linguistically confirmed: all listed
answers must stay wrong.

Current matcher still accepts these `should_reject` examples as `spelling`:

| item_id | answer | observed | expected | classification |
| --- | --- | --- | --- | --- |
| `word_marina_berth_001` | `birth` | `spelling` | wrong | runtime matcher leak |
| `expr_marina_request_berth_001` | `request birth` | `spelling` | wrong | runtime matcher leak |
| `word_marina_fender_001` | `finder` | `spelling` | wrong | runtime matcher leak |
| `expr_marina_prepare_fenders_001` | `prepare finders` | `spelling` | wrong | runtime matcher leak |
| `phrase_marina_prepare_fenders_port_001` | `prepare finders on port side` | `spelling` | wrong | runtime matcher leak |

Suggested engineering route:

- protect `berth / birth` as a forbidden typo pair;
- protect `fender / finder` and plural `fenders / finders` as forbidden typo pairs;
- keep this protection in matcher/runtime, not as broader accepted-answer policy.

Additional matcher QA watch point:

- compact berth identifiers such as `B12`, `B-12`, and `berth B12` should remain
  wrong until Director-Engineer explicitly designs alphanumeric berth handling.

## Open Questions

None for Sea Speak content. All seven mandatory review questions were resolved.

Director-Engineer action remains required for the runtime matcher leaks above.

## Validation Performed

Validation commands were run locally after the content-side patch.

Results:

- JSON parse: PASS.
- Item count remains `50`: PASS.
- Type counts remain `10` word, `14` short_expression, `26` phrase: PASS.
- Level counts remain `18` beginner, `27` intermediate, `5` advanced: PASS.
- Branch count remains `50` `marina_harbour`: PASS.
- Grammar patterns: `22`.
- Dangerous minimal-pair groups: `12`.
- Every item keeps required fields: PASS.
- Every item keeps `branch` and `module`: PASS.
- Every item keeps hints: PASS.
- Every item keeps non-empty `accepted_answers`: PASS.
- No duplicate accepted answers after normalization: PASS.
- `target_text` covered by `accepted_answers` after normalization: PASS.
- `git diff --check` for the assigned batch file: PASS.

Matcher checks:

- Item QA examples: `134` should-accept examples checked; all accepted examples pass.
- Item QA examples: `165` should-reject examples checked; `5` fail due to the known runtime matcher leaks above.
- Top-level dangerous pairs: `24` must-accept examples checked; all pass.
- Top-level dangerous pairs: `49` must-reject examples checked; `5` fail due to the same runtime matcher leaks above.

Forbidden-file confirmation:

- No edits were made to `starter.json`, regression files, policy files,
  matcher/API/UI, deploy, router/auth, Nav Desk, Watch Officer, private config,
  or platform files during this task.
- Note: the local repository has pre-existing untracked Captain Ether paths, so
  git status is not a clean proof of this task's write set. The write set for
  this task was limited to the two allowed files listed above.

## Copy-Ready Director-Engineer Card

Task result: PASS for Sea Speak content review; engineering action required
before QA/merge because matcher still accepts `birth` and `finder(s)` as
spelling.

Changed files:

- `content/captain-ether/batches/batch-002-marina-harbour-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md`

Main content decisions:

- `request fresh water` and `request water` are mutually safe only for
  water-service items.
- `fenders ready`, `lines ready`, and `bow and stern lines ready` were removed
  from prepare-command accepted answers because they are status reports.
- `request departure`, `request departure permission`, and `request permission
  to depart` are approved item-local variants.
- `dock`, `quay`, `pier`, `slip`, `rope`, `bumper`, `need a berth`, `left side
  to`, `right side to`, and compact `B12` remain rejected across Batch 002.
- `Depart when the fairway is clear.` is acceptable as a routine advanced marina
  condition.

Runtime matcher risks:

- `birth` currently passes as spelling for `berth`; must stay wrong.
- `request birth` currently passes as spelling for `request berth`; must stay wrong.
- `finder` currently passes as spelling for `fender`; must stay wrong.
- `prepare finders` currently passes as spelling for `prepare fenders`; must stay wrong.
- `prepare finders on port side` currently passes as spelling for `prepare fenders on port side`; must stay wrong.

Recommended engineering fix:

- Add forbidden typo protection for `berth / birth`.
- Add forbidden typo protection for `fender / finder` and plural
  `fenders / finders`.
- Keep compact berth identifiers like `B12` rejected until alphanumeric berth
  matching is intentionally designed and regression-tested.

Validation summary:

- JSON/counts/required fields: PASS.
- Batch item QA: all `134` accept examples pass; `5` reject examples fail only
  because of the known matcher risks.
- Dangerous pairs: all `24` accept examples pass; `5` reject examples fail only
  because of the same matcher risks.
- No forbidden files were edited by this task.
