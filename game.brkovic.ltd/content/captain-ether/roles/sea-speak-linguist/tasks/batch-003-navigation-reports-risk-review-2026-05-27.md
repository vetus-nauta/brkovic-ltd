# Sea Speak Linguist Task: Batch 003 Navigation Reports Risk Review

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
content/captain-ether/batch-003-navigation-reports-basics-brief.md
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
```

Then review:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Use these only as context, not as files to edit:

```text
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
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
content/captain-ether/batches/batch-003-navigation-reports-basics.json
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
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

Review all `50` Batch 003 items:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

For each item, check:

- canonical `target_text`;
- `accepted_answers`;
- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- item-level dangerous minimal-pair notes;
- whether source prompt and target answer preserve routine yacht navigation
  reporting meaning.

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

1. Should bare `090` be accepted for course reports, or only when the prompt
   asks for a heading-style numeric value?
2. Should `E.T.A.` through explicit `e t a` remain accepted for the single-word
   ETA item?
3. Should `Zulu` and `Z` remain accepted item-locally for ETA reports, or
   should only `UTC` be trained in Batch 003?
4. Should compact forms such as `position east of reporting point Alpha` remain
   accepted, or should full `My position is...` be required?
5. Should `waypoint` remain rejected for all `reporting point` items in this
   beginner/intermediate batch?
6. Should `range` ever be accepted for `distance`, or should `distance` stay
   strict?
7. Should `point` or `dot` remain rejected for decimal navigation reports under
   Batch 001 strictness?

## Mandatory Risky-Variant Decisions

Give explicit accept/reject decisions for:

- `position` as a variant for `my position`;
- `heading` as a variant for `my heading`;
- `course` as a variant for `my course`;
- `kts` as a variant for `knots`;
- `readback` as a compact variant for `read back`;
- punctuation-cleaned ETA forms such as `ETA update 1500Z`;
- spoken-digit and compact numeric forms in ETA, course, bearing, and distance
  items.

## Mandatory Dangerous-Pair Decisions

Give explicit accept/reject decisions for:

- `heading / course / bearing`;
- `position / destination / waypoint / reporting point`;
- `ETA 1400 / ETA 1500`;
- `1400 UTC / 1400Z / one four zero zero UTC`;
- `090 / 90`;
- `knots / nautical miles / cables`;
- `decimal / point / dot`;
- `north / south / east / west`;
- `port / starboard` inside navigation phrases;
- `say again position / read back position`.

## Known Matcher Status

Director-Engineer ran the current validator against the draft batch before this
assignment.

Current result:

```text
PASS
```

Batch 003 matcher checks currently show no batch failures. If your review finds
a case that needs matcher/API behavior, do not edit matcher/API. Mark it as a
runtime matcher risk for Director-Engineer.

## Validation Required

After any content-side patch:

- JSON must parse;
- item count must remain `50`;
- type counts must remain `8` word, `12` short_expression, `30` phrase;
- level counts must remain `12` beginner, `30` intermediate, `8` advanced;
- every item must keep `branch` and `module`;
- every item must keep required fields and hints.

Run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Report the result. Do not change matcher/API.

## Expected Output

Create or update:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
```

The report must be one copy-ready technical card for the Director-Engineer chat
and include:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- changed files;
- counts after review;
- accepted answer decisions;
- must-stay-wrong examples;
- dangerous minimal-pair decisions;
- answers to the seven mandatory review questions;
- matcher/runtime risks for Director-Engineer;
- open questions, if any;
- validation performed;
- confirmation that forbidden files were not changed.

## Success Criteria

Batch 003 is ready for engineering/QA gate only if:

- unsafe variants are removed or clearly marked as must-stay-wrong;
- item-local safe variants are deliberate;
- dangerous minimal-pair decisions are explicit;
- numeric and unit boundaries are explicit;
- no forbidden files were changed.
