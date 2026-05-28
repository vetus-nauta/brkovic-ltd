# Sea Speak Linguist Report: Batch 004 Safety / Securite Risk Review

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Mode: linguistic review with content-side patch allowed for assigned batch only

## Task Result

PASS for linguistic/content review.

Batch 004 is ready for Director-Engineer engineering/QA gate. No Batch 004
runtime matcher leaks were found by the assigned validator or targeted risky
spot checks.

## Changed Files

- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`

No matcher/API/UI, policy, starter, regression, deploy, router/auth, Nav Desk,
Watch Officer, private config, or platform files were edited by this task.

## Counts After Review

Total items: `40`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 6 |
| `short_expression` | 10 |
| `phrase` | 24 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 8 |
| `intermediate` | 24 |
| `advanced` | 8 |

By branch:

| Branch | Count |
| --- | ---: |
| `safety_securite` | 40 |

By module:

| Module | Count |
| --- | ---: |
| `safety_signal` | 5 |
| `navigation_warning` | 5 |
| `weather_sea_state` | 7 |
| `restricted_visibility` | 5 |
| `hazard_reporting` | 8 |
| `safety_readback` | 10 |

Supporting structures:

- grammar patterns: `24`
- top-level dangerous minimal-pair groups: `12`

## Content-Side Patch

The batch was tightened, not broadly expanded.

Added/strengthened reject coverage:

- Added phrase-level reject examples for `reduced visibility` in restricted
  visibility phrases.
- Added phrase-level reject example `obstacle near reporting point alpha` for
  the obstruction/reporting-point item.
- Added a top-level dangerous-pair group for `obstruction / obstacle`.
- Expanded the top-level restricted-visibility group to explicitly include
  `reduced visibility`.

Clarified linguist notes:

- `obstacle` remains wrong for trained `obstruction`.
- `keep a listening watch` is approved item-locally, while `keep watch` remains
  too broad.
- `UTC`, `Zulu`, and `Z` are approved item-locally for exact safety-information
  times.
- `listening watch` remains distinct from `stand by` and broad `keep watch`.
- Producer notes now record reviewed decisions instead of open review prompts.

No unsafe accepted answers were found that required removal.

## Accepted Answer Decisions

Approved item-local variants:

- `Securite` and accented `Sécurité` for the safety signal.
- `Sécurité Sécurité Sécurité` for the three-times safety signal.
- Exact channel forms such as `channel one six` and `channel 16`.
- Exact safety time forms such as `1400 UTC`, `1400Z`, `one four zero zero
  UTC`, `1500 UTC`, and `1500Z`.
- `UTC`, `Zulu`, and `Z` only inside safety-information time items.
- `readback` compact spelling for `read back` safety-readback items.
- `keep a listening watch` alongside `keep listening watch`.
- Reversed receipt confirmations such as `received safety information` and
  `received safety advice`.
- Exact compact numeric forms such as `bearing 090`, `distance 2 cables`, and
  `visibility less than 2 nautical miles`.

Must-stay-wrong examples:

- Ordinary English `security` for `Securite` / `Sécurité`.
- `security security security` for the safety signal.
- `Pan-Pan`, `pan pan`, `pan pan pan pan pan pan`, `Mayday`, and `mayday mayday
  mayday` in Batch 004 items.
- `urgency warning` and `distress warning` for safety-warning items.
- `advice` or `information` for the word item `warning`.
- `advise` for the noun `advice`.
- `poor visibility`, `reduced visibility`, and `visibility good` for trained
  `restricted visibility`.
- `wind warning` for `weather warning`.
- `navigation warning` for weather-warning items, and `weather warning` for
  navigation-warning items.
- `danger` for `hazard`.
- `hazard` for `obstruction`.
- `obstacle` for `obstruction`.
- `say again` or `repeat` for `read back`.
- `stand by`, `do not answer`, and broad `keep watch` for listening-watch
  items.
- Wrong channels, times, bearings, distances, units, directions, locations, and
  reporting-point names.

## Mandatory Review Questions

1. Should accented `Sécurité` remain accepted wherever `Securite` appears?

   Decision: yes. `Securite` and `Sécurité` are the same safety signal for this
   training context. Ordinary English `security` stays wrong.

2. Should `Zulu` and `Z` remain accepted item-locally for safety-information
   times, or should only `UTC` be trained in this batch?

   Decision: keep `UTC`, `Zulu`, and `Z` item-locally when the exact time is
   preserved. Reject local time and changed time values.

3. Should `obstacle` ever be accepted for `obstruction`, or should the current
   strict rejection stand?

   Decision: reject `obstacle`. It is ordinary English and related, but Batch
   004 trains `obstruction` as the safety-warning report term.

4. Should `danger` ever be accepted for `hazard`, or should `hazard` stay strict
   in this branch?

   Decision: keep `hazard` strict. `Danger` is too broad and changes the trained
   report term.

5. Should `keep a listening watch` remain accepted alongside `keep listening
   watch`?

   Decision: yes. The article does not change the radio meaning. Broad `keep
   watch` remains wrong.

6. Should compact `readback` remain accepted for `read back`?

   Decision: yes, item-locally for read-back items. `Say again` and `repeat`
   remain wrong.

7. Should `wind warning` remain rejected for `weather warning`?

   Decision: yes. Wind can be content inside a weather warning, but `wind
   warning` is not the trained phrase in this batch.

8. Should `reduced visibility` remain rejected with `poor visibility` for strict
   `restricted visibility`?

   Decision: yes. Batch 004 trains `restricted visibility`; `poor visibility`
   and `reduced visibility` remain rejected paraphrases.

9. Confirm that Pan-Pan and Mayday remain reject-only examples in Batch 004.

   Decision: confirmed. Pan-Pan and Mayday are reject-only examples in this
   batch and must not become accepted safety-information variants.

## Dangerous Minimal-Pair Decisions

| Pair | Decision |
| --- | --- |
| `Securite / Sécurité / security` | Accept `Securite` and `Sécurité`; reject ordinary English `security`. |
| `Securite / Pan-Pan / Mayday` | Batch 004 is safety information only; urgency and distress signals stay wrong. |
| `safety / urgency / distress` | Keep safety, urgency, and distress branches separate. |
| `warning / advice / information` | These message-category words carry different operational meaning. |
| `advice / advise` | Accept noun `advice`; reject verb-form lookalike `advise`. |
| `restricted visibility / poor visibility / reduced visibility / visibility good` | Keep trained `restricted visibility`; reject paraphrases and opposite state. |
| `navigation warning / weather warning` | Keep warning categories separate. |
| `hazard / obstruction / danger` | Keep trained report terms strict; reject broad `danger`. |
| `obstruction / obstacle` | Reject `obstacle`; train `obstruction`. |
| `wind / weather / sea state / visibility` | Keep related weather elements distinct. |
| `read back / say again` | `Read back` confirms information; `say again` asks for retransmission. |
| `listening watch / stand by / keep watch` | `Listening watch` is monitoring; `stand by` and broad `keep watch` are not substitutes. |
| exact channel/time/bearing/distance/direction | Numeric and directional values must not fuzz-match or substitute. |

## Matcher / Runtime Findings For Director-Engineer

No matcher/API changes are requested for Batch 004.

The assigned validator passed after the content-side patch. Targeted spot checks
also confirmed the most important risky boundaries:

| Item | Answer | Expected | Observed |
| --- | --- | --- | --- |
| `expr_safety_securite_signal_001` | `Sécurité` | accepted | accepted |
| `expr_safety_securite_signal_001` | `security` | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `security security security` | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `pan pan pan pan pan pan` | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `mayday mayday mayday` | wrong | wrong |
| `expr_safety_safety_warning_001` | `urgency warning` | wrong | wrong |
| `expr_safety_safety_warning_001` | `distress warning` | wrong | wrong |
| `expr_safety_weather_warning_001` | `wind warning` | wrong | wrong |
| `expr_safety_restricted_visibility_001` | `reduced visibility` | wrong | wrong |
| `phrase_safety_restricted_visibility_marina_approach_001` | `reduced visibility in the marina approach` | wrong | wrong |
| `phrase_safety_restricted_visibility_channel_until_1400_001` | `navigation warning reduced visibility in the approach channel until 1400 utc` | wrong | wrong |
| `word_safety_obstruction_001` | `obstacle` | wrong | wrong |
| `expr_safety_obstruction_reported_001` | `obstacle reported` | wrong | wrong |
| `phrase_safety_obstruction_reporting_point_alpha_001` | `obstacle near reporting point alpha` | wrong | wrong |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance 2 cables` | accepted | accepted |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 90 distance two cables` | wrong | wrong |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance two nautical miles` | wrong | wrong |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 16` | accepted | accepted |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 12` | wrong | wrong |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1400Z` | accepted | accepted |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1500 utc` | wrong | wrong |
| `phrase_safety_read_back_warning_channel_time_001` | `readback safety warning channel 16 1400 UTC` | accepted | accepted |
| `phrase_safety_read_back_warning_channel_time_001` | `say again safety warning channel one six one four zero zero utc` | wrong | wrong |
| `phrase_safety_keep_listening_watch_until_1500_001` | `keep a listening watch until one five zero zero utc` | accepted | accepted |
| `phrase_safety_keep_listening_watch_until_1500_001` | `stand by until 1500 utc` | wrong | wrong |

## Open Questions

None for Sea Speak content.

## Validation Performed

Required validator:

`php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json`

Result: PASS.

Validator batch summary:

- items: `40`
- grammar patterns: `24`
- dangerous pairs: `12`
- status: `draft`
- target_text checks: `40`
- should_accept checks: `99`
- should_reject checks: `123`
- danger_must_accept checks: `33`
- danger_must_reject checks: `64`

Warnings:

- `6` existing `starter_schema` duplicate-normalization warnings were reported
  by the validator.
- No Batch 004 warnings or failures were reported.

Additional checks:

- JSON parse/count check: PASS.
- Required type counts remain `6` word, `10` short_expression, `24` phrase:
  PASS.
- Required level counts remain `8` beginner, `24` intermediate, `8` advanced:
  PASS.
- Every item keeps `branch` and `module`: PASS.
- Every item keeps required fields and hints: PASS.
- Targeted risky-pair matcher spot checks: PASS.
- Trailing-whitespace scan for the assigned batch file: PASS.

## Copy-Ready Director-Engineer Card

Task result: PASS for Sea Speak Linguist content review of Batch 004 Safety /
Securite Warnings.

Changed files:

- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`

Main content decisions:

- `Securite` and `Sécurité` are accepted for the safety signal; ordinary English
  `security` stays wrong.
- Pan-Pan and Mayday remain reject-only examples in Batch 004.
- Safety, urgency, and distress boundaries stay strict.
- `warning`, `advice`, and `information` stay separate.
- `advice` noun remains protected from `advise`.
- `UTC`, `Zulu`, and `Z` are accepted item-locally for exact
  safety-information times; local time and changed times stay wrong.
- `restricted visibility` stays strict; `poor visibility`, `reduced visibility`,
  and `visibility good` stay wrong.
- `weather warning` and `navigation warning` stay separate; `wind warning` stays
  wrong for weather-warning drills.
- `hazard` stays strict against broad `danger`.
- `obstruction` stays strict against `obstacle`; an explicit top-level
  `obstruction / obstacle` dangerous-pair group was added.
- `readback` compact spelling remains accepted for `read back`; `say again` and
  `repeat` stay wrong.
- `keep a listening watch` remains accepted for `keep listening watch`; broad
  `keep watch` and `stand by` stay wrong.
- Exact channel, time, bearing, distance, unit, direction, location, and
  reporting-point values are protected.

Validation:

- Required validator command: PASS.
- Batch summary after review: `40` items, `6` word, `10` short_expression, `24`
  phrase; `8` beginner, `24` intermediate, `8` advanced; `24` grammar patterns;
  `12` dangerous-pair groups.
- Batch matcher checks: `99` should-accept, `123` should-reject, `33`
  danger_must_accept, `64` danger_must_reject.
- Targeted spot checks for `security`, Pan-Pan, Mayday, `reduced visibility`,
  `obstacle`, wrong channel/time/bearing/unit, `readback`, and listening-watch
  boundaries: PASS.
- No Batch 004 matcher leaks found.
- Only existing validator warnings are unrelated starter duplicate-normalization
  warnings.

Forbidden files:

- No edits to matcher/API/UI, policy, starter, regression, deploy, router/auth,
  Nav Desk, Watch Officer, private config, or platform files.
