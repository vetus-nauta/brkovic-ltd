# QA Report: Captain Ether Batch 004 Acceptance Before Merge

## Copy-ready technical card для Director-Engineer

```md
Чат: QA / Captain Ether
Задача: Batch 004 Acceptance Before Merge
Статус: PASS

Проверено:
- Batch 004 schema/counts/IDs: PASS
- target_text: 40/40 PASS
- should_accept: 99/99 PASS
- should_reject: 123/123 PASS
- dangerous minimal pairs: 12 групп, 33 must_accept PASS, 64 must_reject PASS
- starter regression: 190 target_text, 532 accept, 586 reject, 37 dangerous groups, 96 must_accept, 151 must_reject PASS
- targeted Safety/Securite matcher checks: PASS

Ключевой фокус:
- Securite / Sécurité принимаются как safety signal; ordinary security rejected.
- Pan-Pan / Mayday rejected для safety/securite content.
- safety / urgency / distress не смешиваются.
- warning / advice / information, advice / advise, restricted/reduced visibility, obstruction/obstacle, hazard/danger, read back/say again защищены.
- Точные channel/time/bearing/distance/unit/direction/location/reporting-point значения защищены.

Findings: blocking findings нет.
Наблюдение: валидатор по-прежнему показывает 6 старых WARN по duplicate accepted_answers в starter_schema; не связано с Batch 004 и не блокирует merge.

Report-only подтверждение: QA не редактировал content JSON, matcher/API/UI, policy, starter, regression, router/auth/Nav Desk/Watch Officer. Tracked diff по forbidden paths пустой; единственная write-операция QA в этом run — создание report:
content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md
```

## Scope

- Режим: report-only.
- Проверяемый batch: `content/captain-ether/batches/batch-004-safety-securite-warnings.json`.
- Разрешённый выходной файл: `content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md`.
- Код, content JSON, policy, matcher/API/UI, starter, regression, router/auth/Nav Desk/Watch Officer не менялись. Tracked diff по forbidden paths пустой; единственная write-операция QA в этом run — создание report.

## Inputs read

- `content/captain-ether/roles/qa/tasks/batch-004-acceptance-qa-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/batch-004-safety-securite-warnings-brief.md`
- `content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/batch-004-engineering-gate-2026-05-27.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `public/api/captain-ether/_answer-matching.php`
- `content/captain-ether/tools/validate-captain-ether.php`

## Result by block

| Блок | Статус | Факт |
|---|---:|---|
| Batch 004 schema/counts | PASS | 40 items, 24 grammar patterns, 12 dangerous groups |
| Type counts | PASS | 6 word, 10 short_expression, 24 phrase |
| Level counts | PASS | 8 beginner, 24 intermediate, 8 advanced |
| Module distribution | PASS | safety_signal 5, navigation_warning 5, weather_sea_state 7, restricted_visibility 5, hazard_reporting 8, safety_readback 10 |
| IDs uniqueness | PASS | Batch item IDs unique; grammar pattern IDs unique; no duplicate IDs against starter |
| target_text matcher | PASS | 40/40 |
| should_accept | PASS | 99/99 |
| should_reject | PASS | 123/123 |
| dangerous minimal pairs | PASS | 12 groups; 33 must_accept; 64 must_reject |
| starter regression | PASS | 190 target_text; 532 accept; 586 reject; 37 dangerous groups; 96 must_accept; 151 must_reject |
| Safety/Securite targeted checks | PASS | All targeted checks match expected accept/reject |
| Forbidden files | PASS | QA did not edit forbidden files; tracked diff for forbidden paths is empty; only report file was written by QA |

## Validator

Command:

```bash
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Observed:

```text
Batch:
  items: 40
  grammar_patterns: 24
  dangerous_pairs: 12
  status: draft
  target_text: 40
  should_accept: 99
  should_reject: 123
  danger_must_accept: 33
  danger_must_reject: 64

Regression:
  qa_items: 190
  target_text: 190
  should_accept: 532
  should_reject: 586
  dangerous_pairs: 37
  danger_must_accept: 96
  danger_must_reject: 151

PASS
```

Validator warnings:

| Severity | Owner | Наблюдение |
|---|---|---|
| Low | Captain Ether core backlog | 6 старых `starter_schema` WARN по duplicate `accepted_answers` after normalization: `phrase_pan_pan_001`, `phrase_core_radio_check_over_001`, `phrase_core_correction_channel_one_three_001`, `phrase_core_question_underway_001`, `phrase_core_answer_affirmative_001`, `phrase_core_answer_negative_001`. Не связано с Batch 004 и не блокирует merge. |

## Independent matcher harness

Локальный targeted harness использовал production matcher helper `captain_match_answer` и starter items для regression cases.

```text
status: PASS
batch:
  items: 40
  grammar_patterns: 24
  dangerous_pairs: 12
  target_text: 40
  should_accept: 99
  should_reject: 123
  danger_must_accept: 33
  danger_must_reject: 64
starter_regression:
  target_text: 190
  qa_items: 190
  should_accept: 532
  should_reject: 586
  dangerous_pairs: 37
  danger_must_accept: 96
  danger_must_reject: 151
fail_counts:
  batch_target: 0
  batch_accept: 0
  batch_reject: 0
  batch_danger: 0
  starter_target: 0
  starter_accept: 0
  starter_reject: 0
  starter_danger: 0
```

## Observed Batch 004 item IDs

```text
word_safety_safety_001
word_safety_warning_001
word_safety_hazard_001
word_safety_visibility_001
word_safety_weather_001
word_safety_obstruction_001
expr_safety_securite_signal_001
expr_safety_safety_warning_001
expr_safety_navigation_warning_001
expr_safety_weather_warning_001
expr_safety_restricted_visibility_001
expr_safety_sea_state_001
expr_safety_keep_listening_watch_001
expr_safety_hazard_reported_001
expr_safety_obstruction_reported_001
expr_safety_read_back_warning_001
phrase_safety_securite_three_times_001
phrase_safety_navigation_warning_channel_16_001
phrase_safety_weather_warning_north_wind_001
phrase_safety_sea_state_moderate_001
phrase_safety_restricted_visibility_marina_approach_001
phrase_safety_obstruction_reporting_point_alpha_001
phrase_safety_hazard_two_cables_north_001
phrase_safety_navigation_warning_obstruction_channel_001
phrase_safety_weather_warning_sea_state_rough_001
phrase_safety_keep_listening_watch_channel_16_001
phrase_safety_read_back_navigation_warning_001
phrase_safety_information_received_001
phrase_safety_advice_received_001
phrase_safety_information_valid_until_1400_001
phrase_safety_obstruction_east_breakwater_001
phrase_safety_visibility_less_two_miles_001
phrase_safety_securite_nav_obstruction_alpha_001
phrase_safety_weather_warning_wind_sea_001
phrase_safety_restricted_visibility_channel_until_1400_001
phrase_safety_hazard_bearing_distance_001
phrase_safety_read_back_warning_channel_time_001
phrase_safety_correction_obstruction_east_001
phrase_safety_keep_listening_watch_until_1500_001
phrase_safety_warning_read_back_complete_001
```

## Targeted matcher checks

| Item | Answer | Expected | Actual | Match type |
|---|---|---:|---:|---|
| `expr_safety_securite_signal_001` | `Sécurité` | correct | correct | exact |
| `expr_safety_securite_signal_001` | `security` | wrong | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `security security security` | wrong | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `pan pan pan pan pan pan` | wrong | wrong | wrong |
| `phrase_safety_securite_three_times_001` | `mayday mayday mayday` | wrong | wrong | wrong |
| `expr_safety_safety_warning_001` | `urgency warning` | wrong | wrong | wrong |
| `expr_safety_safety_warning_001` | `distress warning` | wrong | wrong | wrong |
| `expr_safety_weather_warning_001` | `wind warning` | wrong | wrong | wrong |
| `expr_safety_restricted_visibility_001` | `reduced visibility` | wrong | wrong | wrong |
| `phrase_safety_restricted_visibility_marina_approach_001` | `reduced visibility in the marina approach` | wrong | wrong | wrong |
| `phrase_safety_restricted_visibility_channel_until_1400_001` | `navigation warning reduced visibility in the approach channel until 1400 utc` | wrong | wrong | wrong |
| `word_safety_obstruction_001` | `obstacle` | wrong | wrong | wrong |
| `expr_safety_obstruction_reported_001` | `obstacle reported` | wrong | wrong | wrong |
| `phrase_safety_obstruction_reporting_point_alpha_001` | `obstacle near reporting point alpha` | wrong | wrong | wrong |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance 2 cables` | correct | correct | exact |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 90 distance two cables` | wrong | wrong | wrong |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance two nautical miles` | wrong | wrong | wrong |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 16` | correct | correct | exact |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 12` | wrong | wrong | wrong |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1400Z` | correct | correct | exact |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1500 utc` | wrong | wrong | wrong |
| `phrase_safety_read_back_warning_channel_time_001` | `readback safety warning channel 16 1400 UTC` | correct | correct | exact |
| `phrase_safety_read_back_warning_channel_time_001` | `say again safety warning channel one six one four zero zero utc` | wrong | wrong | wrong |
| `phrase_safety_keep_listening_watch_until_1500_001` | `keep a listening watch until one five zero zero utc` | correct | correct | exact |
| `phrase_safety_keep_listening_watch_until_1500_001` | `stand by until 1500 utc` | wrong | wrong | wrong |

## Findings

No blocking findings.

| Severity | Owner | Status | Details |
|---|---|---|---|
| Low | Captain Ether core backlog | Existing / non-blocking | 6 старых validator WARN по duplicate `accepted_answers` in `starter_schema`; Batch 004 acceptance не затронут. |

## Final QA decision

PASS for Batch 004 Acceptance Before Merge.
