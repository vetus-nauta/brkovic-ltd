# QA Task: Batch 004 Production Smoke After Merge

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
content/captain-ether/roles/director-engineer/reports/batch-004-merge-2026-05-27.md
docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

Then read:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

## Functional Duty

QA tests and reports only.

QA verifies that merged Batch 004 content is live and playable on production.
QA does not edit content, code, policy, deploy, router, registry, Nav Desk,
Watch Officer, auth, or UI.

## Production Target

```text
https://game.brkovic.ltd/games/captain-ether
```

## Approved Production Login Access

Platform Auth approved the production QA login method in:

```text
docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

QA may use only the approved private channel to receive the production QA
account identifier and one-time login code.

Do not include the account identifier, login code, cookies, sessions, CSRF
values, SMTP details, `.netrc`, private config, player email, player identity
data, or other secrets in the report, screenshots, logs, repository files, or
chat output.

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-004-safety-securite-warnings.json
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP settings, cookies, session values,
login codes, player email, or secrets.

## Exact Task

Run production smoke after Batch 004 merge.

Check:

1. Route opens:
   - `https://game.brkovic.ltd/games/captain-ether`
   - expected: HTTP `200` and Captain Ether route visible.
2. Login/intended route still works:
   - if login is required, complete it without printing codes;
   - expected: user returns to Captain Ether, not hub.
3. Start one watch for each level:
   - beginner: `12` questions;
   - intermediate: `16` questions;
   - advanced: `20` questions.
4. Each watch preserves progressive order:
   - `word -> short_expression -> phrase`.
5. Start enough watches to confirm Batch 004 items are reachable.
   Record observed Batch 004 `item_id` values from network responses.
6. Confirm player-facing question payload does not expose:
   - `target_text`;
   - `accepted_answers`;
   - `qa_notes`.
7. Run targeted matcher checks through the available authenticated Captain Ether
   answer path. Use no secrets in the report.

Required targeted checks:

| item_id | should pass | should stay wrong |
| --- | --- | --- |
| `expr_safety_securite_signal_001` | `Sécurité` | `security` |
| `phrase_safety_securite_three_times_001` | `Sécurité Sécurité Sécurité` | `security security security`; `pan pan pan pan pan pan`; `mayday mayday mayday` |
| `expr_safety_safety_warning_001` | `safety warning` | `urgency warning`; `distress warning` |
| `expr_safety_weather_warning_001` | `weather warning` | `wind warning` |
| `expr_safety_restricted_visibility_001` | `restricted visibility` | `reduced visibility`; `poor visibility` |
| `word_safety_obstruction_001` | `obstruction` | `obstacle` |
| `expr_safety_obstruction_reported_001` | `obstruction reported` | `obstacle reported` |
| `phrase_safety_obstruction_reporting_point_alpha_001` | `obstruction near reporting point alpha` | `obstacle near reporting point alpha` |
| `phrase_safety_hazard_bearing_distance_001` | `hazard bearing 090 distance 2 cables` | `hazard bearing 90 distance two cables`; `hazard bearing 090 distance two nautical miles` |
| `phrase_safety_navigation_warning_channel_16_001` | `securite navigation warning on channel 16` | `securite navigation warning on channel 12` |
| `phrase_safety_information_valid_until_1400_001` | `safety information valid until 1400Z` | `safety information valid until 1500 utc` |
| `phrase_safety_read_back_warning_channel_time_001` | `readback safety warning channel 16 1400 UTC` | `say again safety warning channel one six one four zero zero utc` |
| `phrase_safety_keep_listening_watch_until_1500_001` | `keep a listening watch until one five zero zero utc` | `stand by until 1500 utc` |

## Expected Output

Return one copy-ready technical card for the Director-Engineer chat with:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- PASS/FAIL by block;
- production target and test time;
- observed Batch 004 item IDs;
- targeted matcher results;
- failures with reproduction steps;
- severity;
- owner route;
- confirmation that QA was report-only and no forbidden files were changed.

## Success Criteria

Production smoke passes only if:

- route and login flow work;
- all watch lengths are correct;
- progressive order is preserved;
- Batch 004 items are observed in live watches;
- required targeted matcher checks pass;
- player-facing payload does not expose answer data or QA metadata.
