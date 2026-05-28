# QA Technical Card: Batch 003 Acceptance Before Merge

Status: PASS  
Date: 2026-05-27  
Role: QA / Captain Ether  
Mode: report-only  
Target batch: `content/captain-ether/batches/batch-003-navigation-reports-basics.json`

## Decision

Batch 003 acceptance before merge passed.

No Batch 003 schema, ID, matcher, dangerous-pair, navigation spot-check, or
starter-regression blocker was found.

QA created/updated only this report:

`content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md`

Forbidden files were not edited by QA.

## Inputs Read

- `content/captain-ether/roles/qa/tasks/batch-003-acceptance-qa-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/batch-003-navigation-reports-basics-brief.md`
- `content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/batch-003-engineering-gate-2026-05-27.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `public/api/captain-ether/_answer-matching.php`
- `content/captain-ether/tools/validate-captain-ether.php`

## PASS / FAIL By Block

| Block | Result | Notes |
| --- | --- | --- |
| Report-only scope | PASS | Only this QA report was created/updated. |
| JSON parse | PASS | Batch JSON loaded successfully. |
| Batch counts | PASS | `50` items, `27` grammar patterns, `10` dangerous minimal-pair groups. |
| Type counts | PASS | `8` word, `12` short_expression, `30` phrase. |
| Level counts | PASS | `12` beginner, `30` intermediate, `8` advanced. |
| Required item fields | PASS | Required fields and hints present. |
| QA notes | PASS | Every item has non-empty `should_accept`, `should_reject`, and `dangerous_minimal_pairs`. |
| Item IDs | PASS | Batch item IDs are unique and do not duplicate starter item IDs. |
| Grammar pattern IDs | PASS | Batch pattern IDs are unique and do not duplicate starter pattern IDs. |
| `target_text` matcher | PASS | `50/50` target texts accepted. |
| `should_accept` matcher | PASS | `131/131` accepted. |
| `should_reject` matcher | PASS | `151/151` rejected. |
| Dangerous minimal pairs | PASS | `36/36` must_accept accepted, `53/53` must_reject rejected. |
| Starter regression | PASS | Existing starter QA still passes: `140` target, `401` accept, `435` reject. |
| Starter dangerous pairs | PASS | Existing starter dangerous pairs still pass: `60` must_accept, `98` must_reject. |
| Navigation spot checks | PASS | Heading/course/bearing, `090/90`, ETA, units, decimal, say again/read back all matched expected behavior. |
| Forbidden files | PASS | QA did not edit starter, QA pairs, batch JSON, answer policy, matcher/API/UI/assets, deploy, auth, private config, or secrets. |

## Required Validator

Command:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Result: PASS.

Observed validator summary:

- Starter items: `140`
- Starter grammar patterns: `61`
- Starter regression QA items: `140`
- Starter target_text checks: `140`
- Starter should_accept checks: `401`
- Starter should_reject checks: `435`
- Starter dangerous minimal-pair groups: `27`
- Starter danger must_accept checks: `60`
- Starter danger must_reject checks: `98`
- Batch items: `50`
- Batch grammar patterns: `27`
- Batch dangerous minimal-pair groups: `10`
- Batch status: `draft`
- Batch target_text checks: `50`
- Batch should_accept checks: `131`
- Batch should_reject checks: `151`
- Batch danger must_accept checks: `36`
- Batch danger must_reject checks: `53`

Validator warnings:

- `6` existing `starter_schema` duplicate-normalization warnings were observed
  on old starter items.
- No Batch 003 warning or failure was observed.

## Independent QA Harness

Independent matcher/schema harness result: PASS.

Observed counts:

| Metric | Value |
| --- | ---: |
| Batch items | 50 |
| Grammar patterns | 27 |
| Dangerous minimal-pair groups | 10 |
| `target_text` checks | 50 |
| `should_accept` checks | 131 |
| `should_reject` checks | 151 |
| Dangerous `must_accept` checks | 36 |
| Dangerous `must_reject` checks | 53 |

Type counts:

| Type | Count |
| --- | ---: |
| `word` | 8 |
| `short_expression` | 12 |
| `phrase` | 30 |

Level counts:

| Level | Count |
| --- | ---: |
| `beginner` | 12 |
| `intermediate` | 30 |
| `advanced` | 8 |

Module counts:

| Module | Count |
| --- | ---: |
| `position_reports` | 9 |
| `heading_course` | 12 |
| `speed_distance` | 8 |
| `eta_reports` | 6 |
| `reporting_points` | 5 |
| `navigation_readback` | 10 |

## Observed Batch 003 Item IDs

- `word_nav_position_001`
- `word_nav_heading_001`
- `word_nav_course_001`
- `word_nav_bearing_001`
- `word_nav_speed_001`
- `word_nav_distance_001`
- `word_nav_eta_001`
- `word_nav_reporting_point_001`
- `expr_nav_my_position_001`
- `expr_nav_my_heading_001`
- `expr_nav_my_course_001`
- `expr_nav_speed_five_knots_001`
- `expr_nav_eta_1400_utc_001`
- `expr_nav_abeam_reporting_point_001`
- `expr_nav_bearing_zero_nine_zero_001`
- `expr_nav_course_zero_nine_zero_001`
- `expr_nav_distance_two_miles_001`
- `expr_nav_distance_two_cables_001`
- `expr_nav_read_back_position_001`
- `expr_nav_say_again_position_001`
- `phrase_nav_position_north_marina_001`
- `phrase_nav_position_south_breakwater_001`
- `phrase_nav_position_east_reporting_point_001`
- `phrase_nav_passing_reporting_point_alpha_001`
- `phrase_nav_abeam_reporting_point_bravo_001`
- `phrase_nav_heading_090_001`
- `phrase_nav_course_090_001`
- `phrase_nav_heading_080_001`
- `phrase_nav_bearing_to_marina_270_001`
- `phrase_nav_course_speed_090_five_knots_001`
- `phrase_nav_speed_six_knots_001`
- `phrase_nav_distance_three_miles_001`
- `phrase_nav_distance_decimal_one_five_001`
- `phrase_nav_eta_1400_001`
- `phrase_nav_eta_update_1500_001`
- `phrase_nav_eta_reporting_point_alpha_001`
- `phrase_nav_report_at_point_alpha_001`
- `phrase_nav_read_back_position_001`
- `phrase_nav_say_again_position_001`
- `phrase_nav_correction_heading_080_001`
- `phrase_nav_correction_eta_1500_001`
- `phrase_nav_position_port_side_channel_001`
- `phrase_nav_position_starboard_side_channel_001`
- `phrase_nav_position_west_point_distance_001`
- `phrase_nav_read_back_course_speed_001`
- `phrase_nav_read_back_eta_position_001`
- `phrase_nav_correction_position_north_001`
- `phrase_nav_correction_course_090_speed_5_001`
- `phrase_nav_update_eta_due_speed_001`
- `phrase_nav_report_position_course_speed_001`

## Navigation Spot Checks

| Item | Answer | Expected | Observed | Match |
| --- | --- | --- | --- | --- |
| `phrase_nav_course_090_001` | `course 090 degrees` | correct | correct | `exact` |
| `phrase_nav_course_090_001` | `090` | wrong | wrong | `wrong` |
| `phrase_nav_course_090_001` | `090 degrees` | wrong | wrong | `wrong` |
| `phrase_nav_course_090_001` | `course 90 degrees` | wrong | wrong | `wrong` |
| `phrase_nav_heading_090_001` | `090` | correct | correct | `exact` |
| `phrase_nav_heading_090_001` | `90` | wrong | wrong | `wrong` |
| `phrase_nav_eta_1400_001` | `ETA 1400Z` | correct | correct | `exact` |
| `phrase_nav_eta_1400_001` | `ETA 1500Z` | wrong | wrong | `wrong` |
| `phrase_nav_eta_1400_001` | `ETA 1400 local` | wrong | wrong | `wrong` |
| `phrase_nav_eta_update_1500_001` | `ETA update 1500Z` | correct | correct | `exact` |
| `phrase_nav_eta_update_1500_001` | `ETA 1500 UTC` | wrong | wrong | `wrong` |
| `phrase_nav_position_east_reporting_point_001` | `position east of reporting point alpha` | correct | correct | `exact` |
| `phrase_nav_position_east_reporting_point_001` | `position east of waypoint alpha` | wrong | wrong | `wrong` |
| `phrase_nav_position_east_reporting_point_001` | `position west of reporting point alpha` | wrong | wrong | `wrong` |
| `phrase_nav_distance_decimal_one_five_001` | `distance is one point five nautical miles to the reporting point` | wrong | wrong | `wrong` |
| `phrase_nav_speed_six_knots_001` | `6 kts` | correct | correct | `exact` |
| `phrase_nav_speed_six_knots_001` | `six nautical miles` | wrong | wrong | `wrong` |
| `phrase_nav_read_back_position_001` | `readback my position` | correct | correct | `exact` |
| `phrase_nav_read_back_position_001` | `say again my position` | wrong | wrong | `wrong` |
| `phrase_nav_say_again_position_001` | `say again position` | correct | correct | `exact` |
| `phrase_nav_say_again_position_001` | `read back your position` | wrong | wrong | `wrong` |

## Findings

No Batch 003 acceptance findings.

Existing non-blocking observation:

- Validator still reports `6` existing starter duplicate-normalization warnings
  from old starter items.
- Severity: Low / non-blocking for Batch 003.
- Owner route if cleanup is desired: Captain Ether core.
- Reproduction: run the required validator command above and inspect the WARN
  section.

## Severity And Owner Route

| Item | Severity | Owner route | Status |
| --- | --- | --- | --- |
| Batch 003 blockers | None | None | PASS |
| Existing starter duplicate-normalization warnings | Low / non-blocking | Captain Ether core backlog | Observed, not a Batch 003 blocker |
| Merge gate | None | Director-Engineer | Ready for merge decision |

## Scope Confirmation

QA report-only mode was respected.

Forbidden files were not edited by QA:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `content/captain-ether/answer-policy.md`
- `public/api/captain-ether/*`
- `public/assets/*`
- matcher/API/UI files
- deploy, router, auth, private config, SMTP, cookies, login codes, player
  identity, or secrets

`git diff -- ... --stat` for forbidden paths returned empty before report
creation.

## Copy-Ready Card For Director-Engineer

```md
## QA / Captain Ether - Batch 003 Acceptance Before Merge

**Status:** PASS  
**Report:** `content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md`  
**Mode:** report-only

Batch 003 acceptance passed before merge.

Validated:
- schema/counts/IDs: PASS;
- `50` items, `27` grammar patterns, `10` dangerous minimal-pair groups;
- type mix: `8` word / `12` short_expression / `30` phrase;
- level mix: `12` beginner / `30` intermediate / `8` advanced;
- all required fields, hints, and QA notes present;
- batch item IDs and grammar pattern IDs are unique and do not duplicate starter IDs;
- `target_text`: `50/50` accepted;
- `should_accept`: `131/131` accepted;
- `should_reject`: `151/151` rejected;
- dangerous pairs: `36/36` must_accept accepted, `53/53` must_reject rejected;
- starter regression: PASS (`140` target, `401` accept, `435` reject; dangerous `60/98`);
- navigation spot checks: PASS for heading/course/bearing, `090/90`, ETA values, units, decimal, say again/read back.

Observed key item checks:
- `phrase_nav_course_090_001`: `course 090 degrees` correct; `090`, `090 degrees`, `course 90 degrees` wrong.
- `phrase_nav_heading_090_001`: `090` correct; `90` wrong.
- `phrase_nav_eta_1400_001`: `ETA 1400Z` correct; `ETA 1500Z`, `ETA 1400 local` wrong.
- `phrase_nav_eta_update_1500_001`: `ETA update 1500Z` correct; `ETA 1500 UTC` wrong.
- `phrase_nav_position_east_reporting_point_001`: reporting point/east correct; waypoint/west wrong.
- `phrase_nav_distance_decimal_one_five_001`: `point` decimal form wrong.
- `phrase_nav_speed_six_knots_001`: `6 kts` correct; `six nautical miles` wrong.
- `phrase_nav_read_back_position_001` and `phrase_nav_say_again_position_001`: read back / say again boundary protected.

Required validator:
`php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json`

Result: PASS.

Non-blocking observation:
- Validator still shows `6` existing starter duplicate-normalization warnings.
- Severity: Low / non-blocking for Batch 003.
- Owner route if cleanup is desired: Captain Ether core.

No Batch 003 bugs found.  
Forbidden files were not edited by QA.  
Only the QA report `.md` was created/updated.
```
