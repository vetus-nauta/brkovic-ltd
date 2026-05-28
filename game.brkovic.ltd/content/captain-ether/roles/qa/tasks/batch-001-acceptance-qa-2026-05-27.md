# QA Task: Batch 001 Acceptance Before Merge

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
content/captain-ether/batch-001-radio-procedure-brief.md
```

Then read the tested files:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
public/api/captain-ether/_answer-matching.php
```

## Functional Duty

QA tests and reports only.

QA must verify whether Batch 001 is safe to merge into playable Captain Ether
content. QA does not decide content, linguistics, matcher policy, runtime
behavior, deploy, or merge.

## Allowed Files

Report-only by default.

If a file is needed, QA may create or update only:

```text
content/captain-ether/qa-batch-001-acceptance-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
content/captain-ether/answer-policy.md
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP settings, or secrets.

## Exact Task

Run an acceptance QA pass for:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

Check:

1. JSON is valid.
2. Batch has exactly `50` items.
3. Type counts are:
   - `15` word
   - `15` short_expression
   - `20` phrase
4. Level counts are:
   - `25` beginner
   - `18` intermediate
   - `7` advanced
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
6. Item IDs do not duplicate each other or existing `starter.json` item IDs.
7. All `target_text` values pass current matcher.
8. All `qa_notes.should_accept` examples pass current matcher.
9. All `qa_notes.should_reject` examples stay wrong.
10. All dangerous minimal pairs in the batch pass.
11. Existing starter regression still passes.
12. Specific check:
    - `word_core_advice_marker_001` with `advice` must pass.
    - `word_core_advice_marker_001` with `advise` must be wrong.

## Expected Output

Return:

- PASS/FAIL by block;
- failures with exact `item_id`, answer, expected behavior, actual behavior;
- severity;
- owner route:
  - Director-Engineer for matcher/runtime/regression;
  - Content Producer for item structure/content typo;
  - Sea Speak Linguist for meaning or accepted/rejected variant dispute;
  - QA follow-up for unclear reproduction;
- confirmation that QA was report-only and no forbidden files were changed.

## Success Criteria

Batch 001 is ready for Director-Engineer merge only if:

- all required checks pass;
- no matcher leaks remain;
- no ID/schema problems exist;
- no existing starter regression breaks.
