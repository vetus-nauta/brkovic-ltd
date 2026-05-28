# QA Report: Batch 001 Production Smoke After Merge

Date: 2026-05-27  
Role: QA / Captain Ether  
Mode: report-only  
Production target: `https://game.brkovic.ltd/games/captain-ether`  
Test time: `2026-05-26T16:01Z` / `2026-05-26T18:01+02:00`

## Result

PASS.

Batch 001 is live and playable on production from QA smoke perspective.

## Scope

Task file:

```text
content/captain-ether/roles/qa/tasks/batch-001-production-smoke-2026-05-27.md
```

QA verified only production behavior after Batch 001 merge. QA did not edit content, code, policy, deploy, router, auth, UI, private config, SMTP, cookies, sessions, or secrets.

## Checks

| Block | Result | Observed |
| --- | --- | --- |
| Route opens | PASS | `GET /games/captain-ether` returned HTTP `200`; Captain Ether route was visible. |
| Login / intended route | PASS | Login was required and completed; after login the user stayed on `/games/captain-ether`, not the hub. |
| Beginner watch | PASS | `12` questions. |
| Intermediate watch | PASS | `16` questions. |
| Advanced watch | PASS | `20` questions. |
| Progressive order | PASS | All tested watches preserved `word -> short_expression -> phrase`. |
| Batch 001 reachability | PASS | `23` Batch 001 item IDs observed in live watch responses. |
| Player-facing payload privacy | PASS | `48` question payloads checked; no `target_text`, `accepted_answers`, or `qa_notes` exposed. |
| Targeted matcher checks | PASS | All required pass/wrong checks behaved as expected. |

## Observed Batch 001 Item IDs

- `expr_core_do_not_answer_001`
- `expr_core_i_spell_001`
- `expr_core_resume_communication_001`
- `expr_core_say_again_all_001`
- `expr_core_say_again_all_before_001`
- `expr_core_wait_out_001`
- `phrase_core_answer_affirmative_001`
- `phrase_core_correction_eta_1500_001`
- `phrase_core_do_not_answer_until_called_001`
- `phrase_core_question_underway_001`
- `phrase_core_radio_check_over_001`
- `phrase_core_read_loud_clear_001`
- `phrase_core_request_read_back_001`
- `phrase_core_resume_communication_now_001`
- `phrase_core_spell_call_sign_001`
- `phrase_core_stand_by_channel_one_six_001`
- `phrase_core_wait_out_call_again_001`
- `word_core_answer_marker_001`
- `word_core_correction_marker_001`
- `word_core_decimal_001`
- `word_core_instruction_marker_001`
- `word_core_niner_001`
- `word_core_question_marker_001`

## Watch Runs

| Run | Level | Total | Order | Batch 001 items observed |
| --- | --- | --- | --- | --- |
| 1 | beginner | `12` | PASS | `word_core_answer_marker_001`, `word_core_question_marker_001`, `word_core_instruction_marker_001`, `phrase_core_radio_check_over_001`, `phrase_core_read_loud_clear_001` |
| 2 | intermediate | `16` | PASS | `word_core_answer_marker_001`, `word_core_decimal_001`, `word_core_niner_001`, `expr_core_resume_communication_001`, `expr_core_i_spell_001`, `expr_core_do_not_answer_001`, `expr_core_say_again_all_before_001`, `phrase_core_answer_affirmative_001`, `phrase_core_request_read_back_001`, `phrase_core_question_underway_001`, `phrase_core_stand_by_channel_one_six_001` |
| 3 | advanced | `20` | PASS | `word_core_answer_marker_001`, `word_core_instruction_marker_001`, `word_core_correction_marker_001`, `expr_core_wait_out_001`, `expr_core_say_again_all_001`, `phrase_core_resume_communication_now_001`, `phrase_core_spell_call_sign_001`, `phrase_core_do_not_answer_until_called_001`, `phrase_core_wait_out_call_again_001`, `phrase_core_correction_eta_1500_001` |

## Targeted Matcher Checks

| Item ID | Should pass | Observed | Should stay wrong | Observed |
| --- | --- | --- | --- | --- |
| `word_core_advice_marker_001` | `advice` | PASS, `match_type=exact` | `advise` | PASS, `match_type=wrong` |
| `expr_core_say_again_all_001` | `say again all` | PASS, `match_type=exact` | `repeat all` | PASS, `match_type=wrong` |
| `phrase_core_radio_check_over_001` | `radio check over` | PASS, `match_type=exact` | `radio check over and out` | PASS, `match_type=wrong` |
| `phrase_core_switch_channel_one_two_001` | `switch to channel one two` | PASS, `match_type=exact` | `switch to channel one three` | PASS, `match_type=wrong` |

## Failures

No failures.

## Severity / Owner Routing

No findings to route.

- Director-Engineer: production smoke PASS.
- Content Producer: no item typo or structure finding.
- Sea Speak Linguist: no meaning or accepted/rejected variant dispute found.
- QA follow-up: not needed.

## Report-Only Confirmation

QA was report-only.

Changed file:

- `content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md`

Forbidden files were not edited:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `public/api/captain-ether/`
- `public/assets/`

No login codes, cookies, session values, player email, private config, SMTP data, `.netrc`, or secrets are included in this report.
