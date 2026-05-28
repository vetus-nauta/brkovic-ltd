# Sea Speak Linguist Report: Batch 003 Navigation Reports Risk Review

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Mode: linguistic review with content-side patch allowed for assigned batch only

## Task Result

PASS for linguistic/content review.

Batch 003 is ready for Director-Engineer engineering gate. No Batch 003 runtime
matcher leaks were found by the assigned validator or targeted risky-pair spot
checks.

## Changed Files

- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md`

No starter, regression, matcher/API/UI, policy, deploy, router/auth, Nav Desk,
Watch Officer, private config, or platform files were edited by this task.

## Counts After Review

Total items: `50`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 8 |
| `short_expression` | 12 |
| `phrase` | 30 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 12 |
| `intermediate` | 30 |
| `advanced` | 8 |

By branch:

| Branch | Count |
| --- | ---: |
| `navigation_reports` | 50 |

Supporting structures:

- grammar patterns: `27`
- top-level dangerous minimal-pair groups: `10`

## Content-Side Patch

Unsafe accepted variants removed:

- Removed bare `090` and bare `090 degrees` from
  `phrase_nav_course_090_001.accepted_answers`.

Risk tests strengthened:

- Added `090` to `phrase_nav_course_090_001.qa_notes.should_reject`.
- Updated the top-level `090 / 90` dangerous-pair group so
  `phrase_nav_course_090_001` must accept `course 090 degrees`, not bare `090`,
  and must reject bare `090`.

Reason: `090` alone is safe only in heading-style numeric drills. In course
reports it is too ambiguous across heading/course/bearing, so the answer must
keep the `course` frame.

Notes clarified:

- `range` stays wrong for `distance`.
- `position` without `my` is accepted item-locally for `my position`.
- Compact `position east of reporting point Alpha` is accepted; `waypoint`
  remains wrong.
- Producer note now records reviewed risky variants instead of open questions.

## Accepted Answer Decisions

Approved item-local variants:

- `position` for `my position` in the short expression item.
- `heading` for `my heading` and `course` for `my course` in short expression
  items.
- Compact position reports such as `position east of reporting point Alpha`.
- `kts` for `knots` in speed items.
- `readback` compact spelling for `read back` items.
- `ETA`, `eta`, `E.T.A.`, and explicit `e t a` for the single ETA word item.
- `UTC`, `Zulu`, and `Z` forms for ETA items when the time value is exact.
- Exact compact numeric forms such as `1400 UTC`, `1400Z`, `1430 UTC`, `1500Z`,
  `course 090`, `bearing 090`, `6 kts`, and `1 decimal 5`.

Rejected variants that must stay wrong:

- `course` for `heading`, `heading` for `course`, and either of them for
  `bearing`.
- Bare `090` for `phrase_nav_course_090_001`.
- `90`, `80`, or `course 90 degrees` for three-digit radio navigation values.
- `waypoint` for `reporting point`.
- `destination` for current-position reports.
- `range` for `distance`.
- Plain `miles` for `nautical miles`.
- `knots`, `nautical miles`, and `cables` as substitutes for each other.
- `point` or `dot` for trained `decimal`.
- `local time` for UTC/Zulu/Z ETA reports.
- `1500` for `1400`, `1400` for `1500`, and `1400` for `1430`.
- `read back` where the item asks `say again`, and `say again` where the item
  asks `read back`.

## Mandatory Review Questions

1. Should bare `090` be accepted for course reports, or only heading-style
   numeric prompts?

   Decision: reject bare `090` for course reports. Keep it heading-local only.
   Course answers must include the course frame, for example `course 090
   degrees`.

2. Should `E.T.A.` through explicit `e t a` remain accepted for the single-word
   ETA item?

   Decision: yes. Dotted acronym punctuation does not change the Sea Speak
   meaning.

3. Should `Zulu` and `Z` remain accepted item-locally for ETA reports, or only
   UTC?

   Decision: yes, keep `UTC`, `Zulu`, and `Z` item-locally for ETA reports when
   the time value is exact. Reject local time.

4. Should compact forms like `position east of reporting point Alpha` remain
   accepted or require full `My position is...`?

   Decision: accept compact position forms item-locally when `position`,
   direction, and reference are all exact.

5. Should `waypoint` remain rejected for all `reporting point` items?

   Decision: yes. `Waypoint` and `reporting point` are related navigation
   concepts but are not interchangeable in this batch.

6. Should `range` ever be accepted for `distance`, or should distance stay
   strict?

   Decision: keep `distance` strict. Reject `range` across Batch 003.

7. Should `point` or `dot` remain rejected for decimal navigation reports under
   Batch 001 strictness?

   Decision: yes. Batch 003 keeps trained `decimal`; reject `point` and `dot`.

## Dangerous Minimal-Pair Decisions

| Pair | Decision |
| --- | --- |
| `heading / course / bearing` | Keep separate. Similar navigation terms are not synonyms. |
| `position / destination / waypoint / reporting point` | Keep current position, destination, waypoint, and reporting point separate. |
| `ETA 1400 / ETA 1500` | Digits must not fuzz-match or be substituted. |
| `1400 UTC / 1400Z / one four zero zero UTC` | All three are accepted for exact UTC ETA items; local time is wrong. |
| `090 / 90` | Three-digit radio form is protected. Bare `090` stays heading-local; bare `90` stays wrong. |
| `knots / nautical miles / cables` | Speed and distance units must not substitute for each other. |
| `decimal / point / dot` | Keep trained `decimal`; reject `point` and `dot`. |
| `north / south / east / west` | Cardinal directions are operationally different and must remain strict. |
| `port / starboard inside navigation phrases` | Keep strict and do not collapse to left/right. |
| `say again position / read back position` | `Say again` requests retransmission; `read back` confirms information. Keep separate. |

## Matcher / Runtime Findings For Director-Engineer

No new matcher/API changes are requested for Batch 003.

The assigned validator passed after the content-side patch. Targeted spot checks
also confirmed the most important risky boundaries:

| Item | Answer | Expected | Observed |
| --- | --- | --- | --- |
| `phrase_nav_course_090_001` | `090` | wrong | wrong |
| `phrase_nav_course_090_001` | `course 090 degrees` | accepted | accepted |
| `phrase_nav_course_090_001` | `course 90 degrees` | wrong | wrong |
| `phrase_nav_heading_090_001` | `090` | accepted | accepted |
| `phrase_nav_heading_090_001` | `90` | wrong | wrong |
| `phrase_nav_eta_1400_001` | `ETA 1400Z` | accepted | accepted |
| `phrase_nav_eta_1400_001` | `ETA 1500Z` | wrong | wrong |
| `phrase_nav_eta_update_1500_001` | `ETA update 1500Z` | accepted | accepted |
| `phrase_nav_eta_update_1500_001` | `ETA 1500 UTC` | wrong | wrong |
| `phrase_nav_position_east_reporting_point_001` | `position east of reporting point alpha` | accepted | accepted |
| `phrase_nav_position_east_reporting_point_001` | `position east of waypoint alpha` | wrong | wrong |
| `phrase_nav_distance_decimal_one_five_001` | `distance is one point five nautical miles to the reporting point` | wrong | wrong |
| `phrase_nav_speed_six_knots_001` | `6 kts` | accepted | accepted |
| `phrase_nav_speed_six_knots_001` | `six nautical miles` | wrong | wrong |
| `phrase_nav_read_back_position_001` | `readback my position` | accepted | accepted |
| `phrase_nav_read_back_position_001` | `say again my position` | wrong | wrong |
| `phrase_nav_say_again_position_001` | `say again position` | accepted | accepted |
| `phrase_nav_say_again_position_001` | `read back your position` | wrong | wrong |

## Open Questions

None for Sea Speak content.

## Validation Performed

Required validator:

`php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json`

Result: PASS.

Validator batch summary:

- items: `50`
- grammar patterns: `27`
- dangerous pairs: `10`
- status: `draft`
- target_text checks: `50`
- should_accept checks: `131`
- should_reject checks: `151`
- danger_must_accept checks: `36`
- danger_must_reject checks: `53`

Warnings:

- `6` existing `starter_schema` duplicate-normalization warnings were reported
  by the validator.
- No Batch 003 warnings or failures were reported.

Additional checks:

- JSON parse/count check: PASS.
- Targeted risky-pair matcher spot checks: PASS.
- Trailing-whitespace scan for the assigned batch/report files: PASS.

## Copy-Ready Director-Engineer Card

Task result: PASS for Sea Speak Linguist content review of Batch 003 Navigation
Reports.

Changed files:

- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md`

Main content decisions:

- Removed unsafe bare `090` and `090 degrees` from
  `phrase_nav_course_090_001`; course reports now require the `course` frame.
- Bare `090` remains accepted only for the heading-style numeric item.
- `E.T.A.` via `e t a` remains accepted for the ETA word item.
- `UTC`, `Zulu`, and `Z` remain accepted item-locally for exact ETA values;
  local time remains wrong.
- Compact position reports like `position east of reporting point Alpha` remain
  accepted when position, direction, and reference are exact.
- `waypoint` remains rejected for all `reporting point` items.
- `range` remains rejected for `distance`.
- `decimal` remains strict; `point` and `dot` stay wrong.
- `kts` remains accepted for `knots`.
- `readback` remains accepted for `read back` items, but `read back` and
  `say again` stay semantically separate.

Dangerous pairs confirmed protected:

- `heading / course / bearing`
- `position / destination / waypoint / reporting point`
- `ETA 1400 / ETA 1500`
- `1400 UTC / 1400Z / one four zero zero UTC`
- `090 / 90`
- `knots / nautical miles / cables`
- `decimal / point / dot`
- `north / south / east / west`
- `port / starboard`
- `say again position / read back position`

Validation:

- Required validator command: PASS.
- Batch summary after review: `50` items, `8` word, `12` short_expression,
  `30` phrase; `12` beginner, `30` intermediate, `8` advanced; `27` grammar
  patterns; `10` dangerous-pair groups.
- Batch matcher checks: `131` should-accept, `151` should-reject, `36`
  danger_must_accept, `53` danger_must_reject.
- No Batch 003 matcher leaks found.
- Only existing validator warnings are unrelated starter duplicate-normalization
  warnings.

Forbidden files:

- No edits to starter, regression, matcher/API/UI, policy, deploy, router/auth,
  Nav Desk, Watch Officer, private config, or platform files.
