# QA / Captain Ether - TASK-0066 Batch 003 Production Smoke Rerun

**Статус:** PASS  
**Дата отчёта:** 2026-05-27  
**Фактическое время проверки:** `2026-05-26T19:55Z` / `2026-05-26T21:55+02:00`  
**Роль:** QA / Captain Ether  
**Режим:** report-only  
**Production target:** `https://game.brkovic.ltd/games/captain-ether`  
**Director task:** `docs/game-director/task-0066-captain-ether-qa-rerun-batch-003-production-smoke-2026-05-26.md`  
**Smoke task:** `content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`

## Итог

TASK-0066 rerun passed.

Batch 003 is live and playable on production from QA smoke perspective.

Platform Auth-approved private production QA login access was used for this
rerun. No account identifier, login code, cookie, session, CSRF value, SMTP
detail, `.netrc`, private config value, player email, player identity, or other
secret is included in this report.

## Прочитано Перед Проверкой

- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-0066-captain-ether-qa-rerun-batch-003-production-smoke-2026-05-26.md`
- `docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`
- `content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/batch-003-merge-2026-05-27.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`

## PASS / FAIL По Блокам

| Блок | Результат | Наблюдение |
| --- | --- | --- |
| Route opens | PASS | `GET /games/captain-ether` returned HTTP `200`; Captain Ether route text and app mount were present. |
| Login / intended route | PASS | Approved production QA login completed; post-login route stayed Captain Ether, not hub. |
| Auth guard | PASS | Fresh unauthenticated `POST /api/captain-ether/start-watch.php` returned `401 Login required`. |
| Beginner watch | PASS | Beginner watch total was `12`. |
| Intermediate watch | PASS | Intermediate watch total was `16`. |
| Advanced watch | PASS | Advanced watch total was `20`. |
| Progressive order | PASS | All `8` tested watches preserved `word -> short_expression -> phrase`. |
| Batch 003 reachability | PASS | `22` unique Batch 003 item IDs observed in live watch responses. |
| Player-facing payload privacy | PASS | `132` question payloads checked; no `target_text`, `accepted_answers`, or `qa_notes` exposed. |
| Targeted navigation matcher checks | PASS | `22/22` required pass/wrong checks behaved as expected. |
| Report-only scope | PASS | Only this QA report was created/updated. Forbidden files were not edited by QA. |

## Production Checks Performed

Environment:

- production URL: `https://game.brkovic.ltd/games/captain-ether`;
- route check: HTTPS HTML request;
- authenticated checks: production API with approved private QA login path;
- secrets handling: credential/code/session data used only transiently and not
  written to report, repository, screenshots, or chat output.

Route and auth:

| Check | Observed |
| --- | --- |
| `GET /games/captain-ether` | HTTP `200`, Captain Ether visible |
| unauthenticated `POST /api/captain-ether/start-watch.php` | HTTP `401`, `Login required` |
| production QA login | PASS |
| post-login route retention | PASS, stayed on Captain Ether route |

## Watch Runs

| Run | Level | Total | Order | Payload privacy | Batch 003 IDs observed |
| --- | --- | ---: | --- | --- | --- |
| 1 | beginner | 12 | PASS | PASS | `word_nav_speed_001` |
| 2 | intermediate | 16 | PASS | PASS | `word_nav_reporting_point_001`, `expr_nav_read_back_position_001`, `expr_nav_say_again_position_001` |
| 3 | advanced | 20 | PASS | PASS | `word_nav_distance_001`, `phrase_nav_read_back_eta_position_001` |
| 4 | intermediate | 16 | PASS | PASS | `word_nav_eta_001`, `expr_nav_distance_two_cables_001`, `expr_nav_read_back_position_001`, `expr_nav_distance_two_miles_001`, `phrase_nav_heading_090_001`, `phrase_nav_heading_080_001`, `phrase_nav_position_port_side_channel_001` |
| 5 | advanced | 20 | PASS | PASS | `word_nav_position_001`, `word_nav_speed_001`, `expr_nav_abeam_reporting_point_001`, `expr_nav_eta_1400_utc_001`, `phrase_nav_read_back_course_speed_001`, `phrase_nav_report_position_course_speed_001` |
| 6 | beginner | 12 | PASS | PASS | `expr_nav_abeam_reporting_point_001` |
| 7 | intermediate | 16 | PASS | PASS | `word_nav_reporting_point_001`, `expr_nav_distance_two_cables_001`, `expr_nav_course_zero_nine_zero_001`, `phrase_nav_distance_decimal_one_five_001` |
| 8 | advanced | 20 | PASS | PASS | `word_nav_speed_001`, `expr_nav_speed_five_knots_001`, `expr_nav_say_again_position_001`, `expr_nav_bearing_zero_nine_zero_001`, `phrase_nav_update_eta_due_speed_001` |

## Observed Batch 003 Item IDs

`22` unique Batch 003 item IDs observed from production watch responses:

- `expr_nav_abeam_reporting_point_001`
- `expr_nav_bearing_zero_nine_zero_001`
- `expr_nav_course_zero_nine_zero_001`
- `expr_nav_distance_two_cables_001`
- `expr_nav_distance_two_miles_001`
- `expr_nav_eta_1400_utc_001`
- `expr_nav_read_back_position_001`
- `expr_nav_say_again_position_001`
- `expr_nav_speed_five_knots_001`
- `phrase_nav_distance_decimal_one_five_001`
- `phrase_nav_heading_080_001`
- `phrase_nav_heading_090_001`
- `phrase_nav_position_port_side_channel_001`
- `phrase_nav_read_back_course_speed_001`
- `phrase_nav_read_back_eta_position_001`
- `phrase_nav_report_position_course_speed_001`
- `phrase_nav_update_eta_due_speed_001`
- `word_nav_distance_001`
- `word_nav_eta_001`
- `word_nav_position_001`
- `word_nav_reporting_point_001`
- `word_nav_speed_001`

## Payload Privacy

Checked `132` player-facing question payloads from production `start-watch.php`
and `submit-answer.php` `next` question objects.

Forbidden fields found:

- `target_text`: `0`
- `accepted_answers`: `0`
- `qa_notes`: `0`

Note: answer submission responses can return `target_text` as the standard form
after an answer. This check is limited to player-facing question payloads, as
specified by the task.

## Targeted Navigation Matcher Checks

All targeted checks were executed through the authenticated Captain Ether answer
path on production.

| Item ID | Answer | Expected | Observed | Match |
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
| `phrase_nav_distance_decimal_one_five_001` | `distance is one decimal five nautical miles to the reporting point` | correct | correct | `exact` |
| `phrase_nav_distance_decimal_one_five_001` | `distance is one point five nautical miles to the reporting point` | wrong | wrong | `wrong` |
| `phrase_nav_speed_six_knots_001` | `6 kts` | correct | correct | `exact` |
| `phrase_nav_speed_six_knots_001` | `six nautical miles` | wrong | wrong | `wrong` |
| `phrase_nav_read_back_position_001` | `readback my position` | correct | correct | `exact` |
| `phrase_nav_read_back_position_001` | `say again my position` | wrong | wrong | `wrong` |
| `phrase_nav_say_again_position_001` | `say again position` | correct | correct | `exact` |
| `phrase_nav_say_again_position_001` | `read back your position` | wrong | wrong | `wrong` |

## Failures

No failures.

## Severity / Owner Route

No open findings to route.

- Director-Engineer: TASK-0066 PASS; Batch 003 production smoke can be closed.
- Platform Auth: approved private QA login path worked for this rerun.
- Content Producer: no content structure finding.
- Sea Speak Linguist: no accepted/rejected variant dispute found.
- QA follow-up: not needed.

## Report-Only Confirmation

QA was report-only.

Created/updated file:

- `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`

Forbidden files were not edited:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `public/api/captain-ether/`
- `public/assets/`
- Watch Officer
- Nav Desk
- router/registry
- auth implementation
- production config
- deploy state

`git diff -- ... --stat` for forbidden paths remained empty before the report
update.

No login code, cookie, session, CSRF value, SMTP detail, `.netrc`, private
config, player email, player identity, or other secret is included in this
report.

## Copy-Ready Director-Engineer Card

```md
TASK-0066 done.
Report: game.brkovic.ltd/content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
Tests:
- Route/login: PASS, production route HTTP 200 and post-login stayed on Captain Ether.
- Watches: PASS, beginner 12 / intermediate 16 / advanced 20.
- Progressive order: PASS, all 8 watch runs preserved word -> short_expression -> phrase.
- Batch 003 reachability: PASS, 22 unique Batch 003 item IDs observed live.
- Payload privacy: PASS, 132 question payloads checked, 0 forbidden fields.
- Targeted matcher: PASS, 22/22 navigation checks passed.
Scope preserved:
- Captain Ether content/API, Watch Officer, Nav Desk, router/registry, auth implementation, production config, and deploy state not touched.
- No login code, cookie, session, CSRF value, SMTP detail, .netrc, private config, player email, player identity, or other secret written.
Next expected: close Batch 003 production smoke / Director-Engineer can close TASK-0066.
```
