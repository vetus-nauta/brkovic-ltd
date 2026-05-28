# QA Task: Batch 002 Acceptance Before Merge

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
content/captain-ether/batch-002-marina-harbour-basics-brief.md
content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md
content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md
content/captain-ether/roles/director-engineer/reports/batch-002-engineering-gate-2026-05-27.md
```

Then read the tested files:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
public/api/captain-ether/_answer-matching.php
```

## Functional Duty

QA tests and reports only.

QA verifies whether Batch 002 is safe for Director-Engineer merge into playable
Captain Ether content. QA does not decide content, linguistics, matcher policy,
runtime behavior, deploy, UI, routing, or auth.

## Mode

Report-only.

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/batch-002-acceptance-qa-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
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
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Check:

1. JSON is valid.
2. Batch has exactly `50` items.
3. Type counts are:
   - `10` word
   - `14` short_expression
   - `26` phrase
4. Level counts are:
   - `18` beginner
   - `27` intermediate
   - `5` advanced
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
13. Specific runtime checks:
    - `word_marina_berth_001`: `berth` passes, `birth` is wrong.
    - `expr_marina_request_berth_001`: `request berth` passes, `request birth` is wrong.
    - `word_marina_fender_001`: `fender` passes, `finder` is wrong.
    - `expr_marina_prepare_fenders_001`: `prepare fenders` passes, `prepare finders` is wrong.
    - `phrase_marina_prepare_fenders_port_001`: `prepare fenders on port side` passes, `prepare finders on port side` is wrong.

## Expected Output

Create or update:

```text
content/captain-ether/roles/qa/reports/batch-002-acceptance-qa-2026-05-27.md
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

Batch 002 is ready for Director-Engineer merge only if:

- all required checks pass;
- no matcher leaks remain;
- no ID/schema problems exist;
- no existing starter regression breaks;
- specific `berth/birth` and `fender/finder(s)` checks pass.
