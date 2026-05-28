# QA Task: Batch 002 Production Smoke After Merge

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
content/captain-ether/roles/director-engineer/reports/batch-002-merge-2026-05-27.md
```

Then read:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

## Functional Duty

QA tests and reports only.

QA verifies that merged Batch 002 content is live and playable on production.
QA does not edit content, code, policy, deploy, router, auth, or UI.

## Production Target

```text
https://game.brkovic.ltd/games/captain-ether
```

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/batch-002-production-smoke-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP settings, cookies, session values,
login codes, player email, or secrets.

## Exact Task

Run production smoke after Batch 002 merge.

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
5. Start enough watches to confirm Batch 002 items are reachable.
   Record observed Batch 002 `item_id` values from network responses.
6. Confirm player-facing question payload does not expose:
   - `target_text`;
   - `accepted_answers`;
   - `qa_notes`.
7. Run targeted matcher checks through the available authenticated Captain Ether
   answer path. Use no secrets in the report.

Required targeted checks:

| item_id | should pass | should stay wrong |
| --- | --- | --- |
| `word_marina_berth_001` | `berth` | `birth` |
| `expr_marina_request_berth_001` | `request berth` | `request birth` |
| `word_marina_fender_001` | `fender` | `finder` |
| `expr_marina_prepare_fenders_001` | `prepare fenders` | `prepare finders` |
| `phrase_marina_prepare_fenders_port_001` | `prepare fenders on port side` | `prepare finders on port side` |

## Expected Output

Return one copy-ready technical card for the Director-Engineer chat with:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- PASS/FAIL by block;
- production target and test time;
- observed Batch 002 item IDs;
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
- Batch 002 items are observed in live watches;
- required targeted matcher checks pass;
- player-facing payload does not expose answer data or QA metadata.
