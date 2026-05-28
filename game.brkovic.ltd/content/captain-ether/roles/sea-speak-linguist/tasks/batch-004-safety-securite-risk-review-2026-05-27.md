# Sea Speak Linguist Task: Batch 004 Safety / Securite Risk Review

Date: 2026-05-27

## Role

Sea Speak Linguist / Captain Ether.

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Mandatory First Read

Before work, read:

```text
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/sea-speak-linguist/rules.md
content/captain-ether/roles/sea-speak-linguist/handoff.md
content/captain-ether/sea-speak-linguist-brief.md
content/captain-ether/answer-policy.md
content/captain-ether/batch-004-safety-securite-warnings-brief.md
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
```

Then review:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Use these only as context, not as files to edit:

```text
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

## Functional Duty

Review Sea Speak meaning and accepted/rejected answer variants.

The linguist decides which variants preserve maritime/radio meaning and which
must stay wrong. The Director-Engineer decides runtime matcher implementation.

## Mode

Linguistic review with content-side patch allowed for the assigned batch only.

## Allowed Files

You may update only:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/answer-policy.md
content/captain-ether/role-command-protocol.md
content/captain-ether/roles/ except the assigned report file
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP, cookies, login codes, player
identity, or secrets.

## Exact Task

Review all `40` Batch 004 items:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

For each item, check:

- canonical `target_text`;
- `accepted_answers`;
- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- item-level dangerous minimal-pair notes;
- whether source prompt and target answer preserve calm safety-information
  meaning.

You may patch the assigned batch JSON only to:

- remove unsafe accepted answers;
- add safe item-local accepted answers;
- move unsafe variants into `should_reject`;
- improve `qa_notes.linguist_note`;
- add or refine dangerous minimal-pair notes;
- adjust content wording when it is a linguistic/content issue.

Do not add broad/global synonym policy.

## Mandatory Review Questions

Resolve these Content Producer open questions:

1. Should accented `Sécurité` remain accepted wherever `Securite` appears?
2. Should `Zulu` and `Z` remain accepted item-locally for safety-information
   times, or should only `UTC` be trained in this batch?
3. Should `obstacle` ever be accepted for `obstruction`, or should the current
   strict rejection stand?
4. Should `danger` ever be accepted for `hazard`, or should `hazard` stay
   strict in this branch?
5. Should `keep a listening watch` remain accepted alongside `keep listening
   watch`?
6. Should compact `readback` remain accepted for `read back`?
7. Should `wind warning` remain rejected for `weather warning`?
8. Should `reduced visibility` remain rejected with `poor visibility` for strict
   `restricted visibility`?
9. Confirm that Pan-Pan and Mayday remain reject-only examples in Batch 004.

## Mandatory Risky-Variant Decisions

Give explicit accept/reject decisions for:

- `Securite` / `Sécurité` / ordinary English `security`;
- `Securite` / `Pan-Pan` / `Mayday`;
- `safety` / `urgency` / `distress`;
- `warning` / `advice` / `information`;
- `advice` / `advise`;
- `restricted visibility` / `poor visibility` / `reduced visibility` /
  `visibility good`;
- `navigation warning` / `weather warning`;
- `hazard` / `obstruction` / `danger`;
- `obstruction` / `obstacle`;
- `wind` / `weather` / `sea state` / `visibility`;
- `read back` / `readback` / `say again`;
- `listening watch` / `stand by` / `keep watch`;
- exact channel, time, bearing, distance, and direction values.

## Mandatory Dangerous-Pair Decisions

Give explicit accept/reject decisions for:

- `Securite / Sécurité / security`;
- `Securite / Pan-Pan / Mayday`;
- `safety / urgency / distress`;
- `warning / advice / information`;
- `advice / advise`;
- `restricted visibility / poor visibility / visibility good`;
- `navigation warning / weather warning`;
- `hazard / obstruction / danger`;
- `obstruction / obstacle`;
- `wind / sea state / visibility`;
- `read back / say again`;
- exact positions, channels, times, bearings, distances, and directions inside
  safety-warning phrases.

## Known Matcher Status

Director-Engineer ran the current validator against the draft batch before this
assignment.

Current result:

```text
PASS
```

Batch 004 matcher checks currently show no batch failures. If your review finds
a case that needs matcher/API behavior, do not edit matcher/API. Mark it as a
runtime matcher risk for Director-Engineer.

## Validation Required

After any content-side patch:

- JSON must parse;
- item count must remain `40`;
- type counts must remain `6` word, `10` short_expression, `24` phrase;
- level counts must remain `8` beginner, `24` intermediate, `8` advanced;
- every item must keep `branch` and `module`;
- every item must keep required fields and hints.

Run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Report the result. Do not change matcher/API.

## Expected Output

Create or update:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
```

The report must be one copy-ready technical card for the Director-Engineer chat
and include:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- changed files;
- counts after review;
- accepted answer decisions;
- must-stay-wrong examples;
- dangerous minimal-pair decisions;
- answers to the nine mandatory review questions;
- matcher/runtime risks for Director-Engineer;
- open questions, if any;
- validation performed;
- confirmation that forbidden files were not changed.

## Success Criteria

Batch 004 is ready for engineering/QA gate only if:

- unsafe variants are removed or clearly marked as must-stay-wrong;
- item-local safe variants are deliberate;
- safety, urgency, and distress boundaries are explicit;
- Securite/Sécurité/security boundaries are explicit;
- numeric and unit boundaries are explicit;
- no forbidden files were changed.
