# QA Task: Batch 001 Production Smoke After Merge

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
content/captain-ether/engineer-report-batch-001-merge-2026-05-27.md
```

Then read:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
```

## Functional Duty

QA tests and reports only.

QA verifies that the merged Batch 001 content is live and playable on production.
QA does not edit content, code, policy, deploy, router, auth, or UI.

## Production Target

```text
https://game.brkovic.ltd/games/captain-ether
```

## Allowed Files

Report-only by default.

If a report file is needed, QA may create or update only:

```text
content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP settings, or secrets.

Do not print login codes, private config, SMTP data, cookies, session values, or
player email in the report.

## Exact Task

Run production smoke after Batch 001 merge.

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
5. Start enough watches to confirm Batch 001 items are reachable.
   Record observed Batch 001 `item_id` values from network responses.
6. Confirm player-facing question payload does not expose:
   - `target_text`;
   - `accepted_answers`;
   - `qa_notes`.
7. Run targeted matcher checks through the available authenticated Captain Ether
   answer path. Use no secrets in the report.

Required targeted checks:

| item_id | should pass | should stay wrong |
| --- | --- | --- |
| `word_core_advice_marker_001` | `advice` | `advise` |
| `expr_core_say_again_all_001` | `say again all` | `repeat all` |
| `phrase_core_radio_check_over_001` | `radio check over` | `radio check over and out` |
| `phrase_core_switch_channel_one_two_001` | `switch to channel one two` | `switch to channel one three` |

## Expected Output

Return:

- PASS/FAIL by block;
- production target and test time;
- observed Batch 001 item IDs;
- failures with reproduction steps;
- severity;
- owner route:
  - Director-Engineer for runtime/deploy/regression;
  - Content Producer for item typo/structure;
  - Sea Speak Linguist for meaning dispute;
  - QA follow-up for unclear reproduction;
- confirmation that QA was report-only and no forbidden files were changed.

## Success Criteria

Production smoke passes only if:

- route and login flow work;
- all watch lengths are correct;
- progressive order is preserved;
- at least several Batch 001 items are observed in live watches;
- required targeted matcher checks pass;
- player-facing payload does not expose answer data or QA metadata.
