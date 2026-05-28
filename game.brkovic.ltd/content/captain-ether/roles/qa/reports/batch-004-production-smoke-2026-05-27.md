# QA / Captain Ether: TASK-0078 Batch 004 Production Smoke Rerun

## Copy-ready technical card для Director-Engineer

```md
Чат: QA / Captain Ether
Задача: TASK-0078 / Batch 004 Production Smoke Rerun
Статус: PASS

Production target:
https://game.brkovic.ltd/games/captain-ether

Фактическое время проверки:
2026-05-26T21:13:57Z / 2026-05-26T23:13:57+02:00

Проверено:
- Route opens: PASS, GET /games/captain-ether returned HTTP 200 and Captain Ether route was visible.
- Auth guard: PASS, unauthenticated POST /api/captain-ether/start-watch.php returned HTTP 401.
- Login / intended route: PASS, one-off private production QA access worked; post-login route stayed Captain Ether, not hub.
- Watches: PASS, beginner 12 / intermediate 16 / advanced 20.
- Progressive order: PASS, all 17 watch runs preserved word -> short_expression -> phrase.
- Batch 004 reachability: PASS, 24 unique Batch 004 item IDs observed in live production watch responses.
- Payload privacy: PASS, 284 player-facing question payloads checked; 0 target_text / accepted_answers / qa_notes exposed.
- Targeted Safety/Securite matcher checks: PASS, 31/31 through authenticated production answer path.

Observed Batch 004 item IDs:
expr_safety_hazard_reported_001
expr_safety_keep_listening_watch_001
expr_safety_navigation_warning_001
expr_safety_obstruction_reported_001
expr_safety_read_back_warning_001
expr_safety_restricted_visibility_001
expr_safety_sea_state_001
expr_safety_securite_signal_001
phrase_safety_hazard_bearing_distance_001
phrase_safety_hazard_two_cables_north_001
phrase_safety_keep_listening_watch_until_1500_001
phrase_safety_navigation_warning_channel_16_001
phrase_safety_obstruction_east_breakwater_001
phrase_safety_obstruction_reporting_point_alpha_001
phrase_safety_read_back_warning_channel_time_001
phrase_safety_restricted_visibility_channel_until_1400_001
phrase_safety_sea_state_moderate_001
phrase_safety_securite_nav_obstruction_alpha_001
phrase_safety_securite_three_times_001
phrase_safety_warning_read_back_complete_001
word_safety_hazard_001
word_safety_obstruction_001
word_safety_safety_001
word_safety_visibility_001

Failures: none.
Severity / owner route: no open findings.

Report-only:
- QA did not edit Captain Ether content/API, Watch Officer, Nav Desk, router/registry, auth implementation, production config, deploy state, or FTP.
- No login code, cookie, session, CSRF value, SMTP detail, .netrc, private config, player email, player identity data, or other secret is included.
- Updated only:
  content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

## Scope

- Роль: QA / Captain Ether.
- Режим: QA rerun only, report-only.
- Assignment: `docs/game-director/task-0078-captain-ether-qa-rerun-batch-004-production-smoke-2026-05-26.md`.
- Production target: `https://game.brkovic.ltd/games/captain-ether`.
- Code-channel decision: `docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`.
- Smoke task: `content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`.
- Output file: `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`.
- Фактическое время проверки: `2026-05-26T21:13:57Z` / `2026-05-26T23:13:57+02:00`.

## Inputs read

- `docs/game-director/task-0078-captain-ether-qa-rerun-batch-004-production-smoke-2026-05-26.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`
- `content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/batch-004-merge-2026-05-27.md`
- `docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `public/api/captain-ether/start-watch.php`
- `public/api/captain-ether/submit-answer.php`
- `public/api/captain-ether/resolve-lost-oar.php`

## Environment

- Production HTTPS API checks with authenticated one-off private QA access.
- No browser screenshots.
- Secret handling: one-time access was used transiently only. No code, cookie, session, CSRF value, SMTP detail, `.netrc`, private config, player email, player identity data, or other secret is written here.

## PASS / FAIL by block

| Блок | Результат | Наблюдение |
| --- | --- | --- |
| Route opens | PASS | `GET /games/captain-ether` returned HTTP `200`; Captain Ether route visible. |
| Auth guard | PASS | Fresh unauthenticated `POST /api/captain-ether/start-watch.php` returned HTTP `401`. |
| Login / intended route | PASS | Approved one-off private production QA access completed; authenticated `GET /games/captain-ether` stayed on Captain Ether route. |
| Beginner watch length | PASS | Beginner watch total `12` in every beginner run. |
| Intermediate watch length | PASS | Intermediate watch total `16` in every intermediate run. |
| Advanced watch length | PASS | Advanced watch total `20` in every advanced run. |
| Progressive order | PASS | All 17 watch runs preserved `word -> short_expression -> phrase`. |
| Batch 004 reachability | PASS | 24 unique Batch 004 item IDs observed in live production watch responses. |
| Payload privacy | PASS | 284 player-facing question payloads checked; `target_text`, `accepted_answers`, `qa_notes` exposed 0 times. |
| Targeted Safety/Securite matcher checks | PASS | 31/31 authenticated checks matched expected correct/wrong behavior. |
| Report-only scope | PASS | Only this QA report was updated. Forbidden files were not edited by QA. |

## Watch runs

| Run | Level | Total | Questions seen | Order | Payload privacy | Batch 004 IDs observed |
| --- | --- | ---: | ---: | --- | --- | --- |
| 1 | beginner | 12 | 12 | PASS | PASS | none |
| 2 | intermediate | 16 | 16 | PASS | PASS | `word_safety_obstruction_001`, `expr_safety_sea_state_001`, `expr_safety_keep_listening_watch_001`, `phrase_safety_securite_three_times_001`, `phrase_safety_hazard_two_cables_north_001` |
| 3 | advanced | 20 | 20 | PASS | PASS | `word_safety_hazard_001`, `phrase_safety_read_back_warning_channel_time_001` |
| 4 | beginner | 12 | 12 | PASS | PASS | none |
| 5 | intermediate | 16 | 16 | PASS | PASS | `expr_safety_obstruction_reported_001`, `expr_safety_read_back_warning_001`, `phrase_safety_obstruction_reporting_point_alpha_001` |
| 6 | advanced | 20 | 20 | PASS | PASS | `phrase_safety_warning_read_back_complete_001` |
| 7 | intermediate | 16 | 16 | PASS | PASS | `word_safety_obstruction_001`, `expr_safety_restricted_visibility_001`, `expr_safety_keep_listening_watch_001`, `expr_safety_read_back_warning_001`, `phrase_safety_sea_state_moderate_001`, `phrase_safety_obstruction_east_breakwater_001` |
| 8 | advanced | 20 | 20 | PASS | PASS | `expr_safety_navigation_warning_001`, `phrase_safety_hazard_bearing_distance_001`, `phrase_safety_keep_listening_watch_until_1500_001` |
| 9 | beginner | 12 | 12 | PASS | PASS | none |
| 10 | intermediate | 16 | 16 | PASS | PASS | none |
| 11 | advanced | 20 | 20 | PASS | PASS | `expr_safety_securite_signal_001`, `expr_safety_obstruction_reported_001`, `phrase_safety_keep_listening_watch_until_1500_001`, `phrase_safety_read_back_warning_channel_time_001` |
| 12 | intermediate | 16 | 16 | PASS | PASS | `word_safety_obstruction_001`, `expr_safety_hazard_reported_001`, `phrase_safety_navigation_warning_channel_16_001` |
| 13 | advanced | 20 | 20 | PASS | PASS | `expr_safety_navigation_warning_001`, `phrase_safety_hazard_bearing_distance_001`, `phrase_safety_read_back_warning_channel_time_001`, `phrase_safety_securite_nav_obstruction_alpha_001` |
| 14 | beginner | 12 | 12 | PASS | PASS | none |
| 15 | advanced | 20 | 20 | PASS | PASS | `word_safety_visibility_001`, `expr_safety_hazard_reported_001`, `phrase_safety_keep_listening_watch_until_1500_001`, `phrase_safety_read_back_warning_channel_time_001` |
| 16 | intermediate | 16 | 16 | PASS | PASS | `word_safety_obstruction_001`, `expr_safety_hazard_reported_001`, `phrase_safety_obstruction_reporting_point_alpha_001` |
| 17 | advanced | 20 | 20 | PASS | PASS | `word_safety_safety_001`, `expr_safety_read_back_warning_001`, `phrase_safety_hazard_bearing_distance_001`, `phrase_safety_keep_listening_watch_until_1500_001`, `phrase_safety_restricted_visibility_channel_until_1400_001` |

## Observed Batch 004 item IDs

24 unique Batch 004 item IDs observed from production watch responses:

```text
expr_safety_hazard_reported_001
expr_safety_keep_listening_watch_001
expr_safety_navigation_warning_001
expr_safety_obstruction_reported_001
expr_safety_read_back_warning_001
expr_safety_restricted_visibility_001
expr_safety_sea_state_001
expr_safety_securite_signal_001
phrase_safety_hazard_bearing_distance_001
phrase_safety_hazard_two_cables_north_001
phrase_safety_keep_listening_watch_until_1500_001
phrase_safety_navigation_warning_channel_16_001
phrase_safety_obstruction_east_breakwater_001
phrase_safety_obstruction_reporting_point_alpha_001
phrase_safety_read_back_warning_channel_time_001
phrase_safety_restricted_visibility_channel_until_1400_001
phrase_safety_sea_state_moderate_001
phrase_safety_securite_nav_obstruction_alpha_001
phrase_safety_securite_three_times_001
phrase_safety_warning_read_back_complete_001
word_safety_hazard_001
word_safety_obstruction_001
word_safety_safety_001
word_safety_visibility_001
```

## Payload privacy

Checked player-facing question payloads from production `start-watch.php` and `submit-answer.php` `next` question objects.

| Field | Exposures |
| --- | ---: |
| `target_text` | 0 |
| `accepted_answers` | 0 |
| `qa_notes` | 0 |

Question payloads checked: `284`.

Note: answer submission responses can include `target_text` as post-answer standard-form feedback. This privacy check is limited to player-facing question payloads, as assigned.

## Targeted Safety/Securite matcher checks

All targeted checks were executed through the authenticated production answer path.

| Item ID | Answer | Expected | Observed | Match |
| --- | --- | --- | --- | --- |
| `expr_safety_securite_signal_001` | `Sécurité` | correct | correct | `exact` |
| `expr_safety_securite_signal_001` | `security` | wrong | wrong | `wrong` |
| `phrase_safety_securite_three_times_001` | `Sécurité Sécurité Sécurité` | correct | correct | `exact` |
| `phrase_safety_securite_three_times_001` | `security security security` | wrong | wrong | `wrong` |
| `phrase_safety_securite_three_times_001` | `pan pan pan pan pan pan` | wrong | wrong | `wrong` |
| `phrase_safety_securite_three_times_001` | `mayday mayday mayday` | wrong | wrong | `wrong` |
| `expr_safety_safety_warning_001` | `safety warning` | correct | correct | `exact` |
| `expr_safety_safety_warning_001` | `urgency warning` | wrong | wrong | `wrong` |
| `expr_safety_safety_warning_001` | `distress warning` | wrong | wrong | `wrong` |
| `expr_safety_weather_warning_001` | `weather warning` | correct | correct | `exact` |
| `expr_safety_weather_warning_001` | `wind warning` | wrong | wrong | `wrong` |
| `expr_safety_restricted_visibility_001` | `restricted visibility` | correct | correct | `exact` |
| `expr_safety_restricted_visibility_001` | `reduced visibility` | wrong | wrong | `wrong` |
| `expr_safety_restricted_visibility_001` | `poor visibility` | wrong | wrong | `wrong` |
| `word_safety_obstruction_001` | `obstruction` | correct | correct | `exact` |
| `word_safety_obstruction_001` | `obstacle` | wrong | wrong | `wrong` |
| `expr_safety_obstruction_reported_001` | `obstruction reported` | correct | correct | `exact` |
| `expr_safety_obstruction_reported_001` | `obstacle reported` | wrong | wrong | `wrong` |
| `phrase_safety_obstruction_reporting_point_alpha_001` | `obstruction near reporting point alpha` | correct | correct | `exact` |
| `phrase_safety_obstruction_reporting_point_alpha_001` | `obstacle near reporting point alpha` | wrong | wrong | `wrong` |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance 2 cables` | correct | correct | `exact` |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 90 distance two cables` | wrong | wrong | `wrong` |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance two nautical miles` | wrong | wrong | `wrong` |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 16` | correct | correct | `exact` |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 12` | wrong | wrong | `wrong` |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1400Z` | correct | correct | `exact` |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1500 utc` | wrong | wrong | `wrong` |
| `phrase_safety_read_back_warning_channel_time_001` | `readback safety warning channel 16 1400 UTC` | correct | correct | `exact` |
| `phrase_safety_read_back_warning_channel_time_001` | `say again safety warning channel one six one four zero zero utc` | wrong | wrong | `wrong` |
| `phrase_safety_keep_listening_watch_until_1500_001` | `keep a listening watch until one five zero zero utc` | correct | correct | `exact` |
| `phrase_safety_keep_listening_watch_until_1500_001` | `stand by until 1500 utc` | wrong | wrong | `wrong` |

## Failures

No failures.

## Severity / owner route

No open findings to route.

- Director-Engineer: TASK-0078 / Batch 004 production smoke rerun PASS.
- Platform Auth: one-off private QA access worked for this rerun.
- Content Producer: no content finding.
- Sea Speak Linguist: no accepted/rejected variant dispute found.
- QA follow-up: not needed.

## Report-only confirmation

QA did not edit:

- Captain Ether content JSON
- Captain Ether API/matcher/UI
- Watch Officer
- Nav Desk
- router/registry
- auth implementation
- production config
- deploy state
- FTP

Updated file:

- `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`

No login code, cookie, session, CSRF value, SMTP detail, `.netrc`, private config value, player email, player identity data, or other secret is included in this report.

`git diff` for forbidden repo paths was checked after the report update and remained empty.

## Final QA decision

TASK-0078 PASS.
