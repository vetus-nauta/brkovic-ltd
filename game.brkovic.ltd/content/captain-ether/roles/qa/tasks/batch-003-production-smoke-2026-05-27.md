# QA Task: Batch 003 Production Smoke After Merge

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
content/captain-ether/roles/director-engineer/reports/batch-003-merge-2026-05-27.md
docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

Then read:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

## Functional Duty

QA tests and reports only.

QA verifies that merged Batch 003 content is live and playable on production.
QA does not edit content, code, policy, deploy, router, auth, or UI.

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
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP settings, cookies, session values,
login codes, player email, or secrets.

## Exact Task

Run production smoke after Batch 003 merge.

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
5. Start enough watches to confirm Batch 003 items are reachable.
   Record observed Batch 003 `item_id` values from network responses.
6. Confirm player-facing question payload does not expose:
   - `target_text`;
   - `accepted_answers`;
   - `qa_notes`.
7. Run targeted matcher checks through the available authenticated Captain Ether
   answer path. Use no secrets in the report.

Required targeted checks:

| item_id | should pass | should stay wrong |
| --- | --- | --- |
| `phrase_nav_course_090_001` | `course 090 degrees` | `090`; `090 degrees`; `course 90 degrees` |
| `phrase_nav_heading_090_001` | `090` | `90` |
| `phrase_nav_eta_1400_001` | `ETA 1400Z` | `ETA 1500Z`; `ETA 1400 local` |
| `phrase_nav_eta_update_1500_001` | `ETA update 1500Z` | `ETA 1500 UTC` |
| `phrase_nav_position_east_reporting_point_001` | `position east of reporting point alpha` | `position east of waypoint alpha`; `position west of reporting point alpha` |
| `phrase_nav_distance_decimal_one_five_001` | `distance is one decimal five nautical miles to the reporting point` | `distance is one point five nautical miles to the reporting point` |
| `phrase_nav_speed_six_knots_001` | `6 kts` | `six nautical miles` |
| `phrase_nav_read_back_position_001` | `readback my position` | `say again my position` |
| `phrase_nav_say_again_position_001` | `say again position` | `read back your position` |

## Expected Output

Return one copy-ready technical card for the Director-Engineer chat with:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- PASS/FAIL by block;
- production target and test time;
- observed Batch 003 item IDs;
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
- Batch 003 items are observed in live watches;
- required targeted matcher checks pass;
- player-facing payload does not expose answer data or QA metadata.
