# QA Task: Batch 004 Acceptance Before Merge

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
content/captain-ether/batch-004-safety-securite-warnings-brief.md
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
content/captain-ether/roles/director-engineer/reports/batch-004-engineering-gate-2026-05-27.md
```

Then read the tested files:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-004-safety-securite-warnings.json
public/api/captain-ether/_answer-matching.php
content/captain-ether/tools/validate-captain-ether.php
```

## Functional Duty

QA tests and reports only.

QA verifies whether Batch 004 is safe for Director-Engineer merge into playable
Captain Ether content. QA does not decide content, linguistics, matcher policy,
runtime behavior, deploy, UI, routing, registry, Nav Desk, Watch Officer, or
auth.

## Mode

Report-only.

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-004-safety-securite-warnings.json
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
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Check:

1. JSON is valid.
2. Batch has exactly `40` items.
3. Type counts are:
   - `6` word
   - `10` short_expression
   - `24` phrase
4. Level counts are:
   - `8` beginner
   - `24` intermediate
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
13. Required Safety / Securite spot checks pass:
    - `expr_safety_securite_signal_001`: `Sécurité` passes.
    - `expr_safety_securite_signal_001`: `security` is wrong.
    - `phrase_safety_securite_three_times_001`: `security security security` is wrong.
    - `phrase_safety_securite_three_times_001`: `pan pan pan pan pan pan` is wrong.
    - `phrase_safety_securite_three_times_001`: `mayday mayday mayday` is wrong.
    - `expr_safety_safety_warning_001`: `urgency warning` is wrong.
    - `expr_safety_safety_warning_001`: `distress warning` is wrong.
    - `expr_safety_weather_warning_001`: `wind warning` is wrong.
    - `expr_safety_restricted_visibility_001`: `reduced visibility` is wrong.
    - `phrase_safety_restricted_visibility_marina_approach_001`: `reduced visibility in the marina approach` is wrong.
    - `phrase_safety_restricted_visibility_channel_until_1400_001`: `navigation warning reduced visibility in the approach channel until 1400 utc` is wrong.
    - `word_safety_obstruction_001`: `obstacle` is wrong.
    - `expr_safety_obstruction_reported_001`: `obstacle reported` is wrong.
    - `phrase_safety_obstruction_reporting_point_alpha_001`: `obstacle near reporting point alpha` is wrong.
    - `phrase_safety_hazard_bearing_distance_001`: `hazard bearing 090 distance 2 cables` passes.
    - `phrase_safety_hazard_bearing_distance_001`: `hazard bearing 90 distance two cables` is wrong.
    - `phrase_safety_hazard_bearing_distance_001`: `hazard bearing 090 distance two nautical miles` is wrong.
    - `phrase_safety_navigation_warning_channel_16_001`: `securite navigation warning on channel 16` passes.
    - `phrase_safety_navigation_warning_channel_16_001`: `securite navigation warning on channel 12` is wrong.
    - `phrase_safety_information_valid_until_1400_001`: `safety information valid until 1400Z` passes.
    - `phrase_safety_information_valid_until_1400_001`: `safety information valid until 1500 utc` is wrong.
    - `phrase_safety_read_back_warning_channel_time_001`: `readback safety warning channel 16 1400 UTC` passes.
    - `phrase_safety_read_back_warning_channel_time_001`: `say again safety warning channel one six one four zero zero utc` is wrong.
    - `phrase_safety_keep_listening_watch_until_1500_001`: `keep a listening watch until one five zero zero utc` passes.
    - `phrase_safety_keep_listening_watch_until_1500_001`: `stand by until 1500 utc` is wrong.

Run or independently reproduce the validator check:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

The current Director-Engineer baseline is:

- Batch 004 items: `40`;
- grammar patterns: `24`;
- dangerous minimal-pair groups: `12`;
- target_text checks: `40`;
- should_accept checks: `99`;
- should_reject checks: `123`;
- danger_must_accept checks: `33`;
- danger_must_reject checks: `64`.

## Expected Output

Create or update:

```text
content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md
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

Batch 004 is ready for Director-Engineer merge only if:

- all required checks pass;
- no matcher leaks remain;
- no ID/schema problems exist;
- no existing starter regression breaks;
- Safety / Securite dangerous pairs stay protected.
