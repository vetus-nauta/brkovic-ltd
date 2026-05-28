# QA Task: Batch 003 Acceptance Before Merge

Date: 2026-05-27

## Role

QA / Captain Ether.

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Mandatory First Read

Before testing, read:

```text
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/qa/rules.md
content/captain-ether/roles/qa/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/batch-003-navigation-reports-basics-brief.md
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
content/captain-ether/roles/director-engineer/reports/batch-003-engineering-gate-2026-05-27.md
```

Then read the tested files:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
public/api/captain-ether/_answer-matching.php
content/captain-ether/tools/validate-captain-ether.php
```

## Functional Duty

QA tests and reports only.

QA verifies whether Batch 003 is safe for Director-Engineer merge into playable
Captain Ether content. QA does not decide content, linguistics, matcher policy,
runtime behavior, deploy, UI, routing, or auth.

## Mode

Report-only.

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
content/captain-ether/answer-policy.md
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP, cookies, login codes, player
identity, or secrets.

## Exact Task

Run acceptance QA for:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Check:

1. JSON is valid.
2. Batch has exactly `50` items.
3. Type counts are:
   - `8` word
   - `12` short_expression
   - `30` phrase
4. Level counts are:
   - `12` beginner
   - `30` intermediate
   - `8` advanced
5. Every item has:
   - `id`
   - `type`
   - `level`
   - `difficulty_score`
   - `topic`
   - `branch`
   - `module`
   - `source_language`
   - `source_text`
   - `target_language`
   - `target_text`
   - `accepted_answers`
   - hints
   - `qa_notes.should_accept`
   - `qa_notes.should_reject`
   - `qa_notes.dangerous_minimal_pairs`
6. Item IDs do not duplicate each other or existing `starter.json` item IDs.
7. Grammar pattern IDs do not duplicate existing `starter.json` pattern IDs.
8. All `target_text` values pass current matcher.
9. All `qa_notes.should_accept` examples pass current matcher.
10. All `qa_notes.should_reject` examples stay wrong.
11. All top-level dangerous minimal pairs pass.
12. Existing starter regression still passes.
13. Required navigation-report spot checks pass:
    - `phrase_nav_course_090_001`: `course 090 degrees` passes.
    - `phrase_nav_course_090_001`: `090` is wrong.
    - `phrase_nav_course_090_001`: `090 degrees` is wrong.
    - `phrase_nav_course_090_001`: `course 90 degrees` is wrong.
    - `phrase_nav_heading_090_001`: `090` passes.
    - `phrase_nav_heading_090_001`: `90` is wrong.
    - `phrase_nav_eta_1400_001`: `ETA 1400Z` passes.
    - `phrase_nav_eta_1400_001`: `ETA 1500Z` is wrong.
    - `phrase_nav_eta_1400_001`: `ETA 1400 local` is wrong.
    - `phrase_nav_eta_update_1500_001`: `ETA update 1500Z` passes.
    - `phrase_nav_eta_update_1500_001`: `ETA 1500 UTC` is wrong.
    - `phrase_nav_position_east_reporting_point_001`: `position east of reporting point alpha` passes.
    - `phrase_nav_position_east_reporting_point_001`: `position east of waypoint alpha` is wrong.
    - `phrase_nav_position_east_reporting_point_001`: `position west of reporting point alpha` is wrong.
    - `phrase_nav_distance_decimal_one_five_001`: `distance is one point five nautical miles to the reporting point` is wrong.
    - `phrase_nav_speed_six_knots_001`: `6 kts` passes.
    - `phrase_nav_speed_six_knots_001`: `six nautical miles` is wrong.
    - `phrase_nav_read_back_position_001`: `readback my position` passes.
    - `phrase_nav_read_back_position_001`: `say again my position` is wrong.
    - `phrase_nav_say_again_position_001`: `say again position` passes.
    - `phrase_nav_say_again_position_001`: `read back your position` is wrong.

Run or independently reproduce the validator check:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

The current Director-Engineer baseline is:

- Batch 003 items: `50`;
- grammar patterns: `27`;
- dangerous minimal-pair groups: `10`;
- target_text checks: `50`;
- should_accept checks: `131`;
- should_reject checks: `151`;
- danger_must_accept checks: `36`;
- danger_must_reject checks: `53`.

## Expected Output

Create or update:

```text
content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md
```

Return one copy-ready technical card for the Director-Engineer chat with:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- PASS/FAIL by block;
- failures with exact `item_id`, answer, expected behavior, actual behavior;
- severity;
- owner route:
  - Director-Engineer for matcher/runtime/regression;
  - Content Producer for item structure/content typo;
  - Sea Speak Linguist for meaning or variant dispute;
  - QA follow-up for unclear reproduction;
- confirmation that QA was report-only and no forbidden files were changed.

## Success Criteria

Batch 003 is ready for Director-Engineer merge only if:

- all required checks pass;
- no matcher leaks remain;
- no ID/schema problems exist;
- no existing starter regression breaks;
- navigation-report dangerous pairs stay protected.
