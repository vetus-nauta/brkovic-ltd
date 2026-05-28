# Sea Speak Linguist Task: Batch 002 Marina / Harbour Risk Review

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
content/captain-ether/batch-002-marina-harbour-basics-brief.md
content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md
```

Then review:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Use these only as context, not as files to edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/batch-001-radio-procedure.json
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
content/captain-ether/batches/batch-002-marina-harbour-basics.json
content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/answer-policy.md
content/captain-ether/role-command-protocol.md
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP, cookies, login codes, player
identity, or secrets.

## Exact Task

Review all `50` Batch 002 items:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

For each item, check:

- canonical `target_text`;
- `accepted_answers`;
- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- item-level dangerous minimal-pair notes;
- whether source prompt and target answer preserve calm routine marina/harbour
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

1. Should `request fresh water` be accepted for `request water`, and should
   `request water` be accepted for `Request fresh water.`?
2. Should `fenders ready` and `lines ready` remain accepted as equivalents for
   `prepare fenders` and `prepare lines`?
3. Should `request departure`, `request departure permission`, and `request
   permission to depart` be treated as item-local variants?
4. Should `dock`, `quay`, `pier`, or `slip` ever be accepted item-locally for
   berth items, or should they remain rejected across Batch 002?
5. Should `bumper` ever be accepted for `fender`, or should `fender` stay
   strict?
6. Should berth identifiers accept compact forms such as `B12`, or should Batch
   002 keep only spoken-form `Bravo one two` until matcher QA reviews
   alphanumeric formats?
7. Is `Depart when the fairway is clear.` appropriate for routine marina scope,
   or too close to authority/traffic-control language?

## Mandatory Dangerous-Pair Decisions

Give explicit accept/reject decisions for:

- `berth / birth`;
- `berth / dock / quay / pier / slip`;
- `moor / berth / anchor`;
- `line / rope`;
- `fender / finder`;
- `fender / bumper`;
- `port side to / starboard side to`;
- `ahead / astern / alongside / abeam`;
- `stand by outside / wait out / do not answer`;
- `proceed / enter / approach / go ahead`;
- `request berth / need a berth`;
- `water / fuel / shore power`;
- `arrival / departure`.

## Known Matcher Findings To Classify

Director-Engineer ran the current matcher against the draft batch before this
review.

Current matcher accepts these `should_reject` examples as `spelling`:

| item_id | answer | expected |
| --- | --- | --- |
| `word_marina_berth_001` | `birth` | wrong |
| `word_marina_fender_001` | `finder` | wrong |
| `expr_marina_request_berth_001` | `request birth` | wrong |
| `expr_marina_prepare_fenders_001` | `prepare finders` | wrong |
| `phrase_marina_prepare_fenders_port_001` | `prepare finders on port side` | wrong |

Do not fix matcher/API.

In your report, classify whether these must stay wrong. If yes, mark them as
runtime matcher risks for Director-Engineer.

## Validation Required

After any content-side patch:

- JSON must parse;
- item count must remain `50`;
- type counts must remain `10` word, `14` short_expression, `26` phrase;
- level counts must remain `18` beginner, `27` intermediate, `5` advanced;
- every item must keep `branch` and `module`;
- every item must keep required fields and hints.

If you run matcher checks, report the results, but do not change matcher/API.

## Expected Output

Create or update:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md
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

Batch 002 is ready for engineering/QA gate only if:

- unsafe variants are removed or clearly marked as must-stay-wrong;
- item-local safe variants are deliberate;
- dangerous minimal-pair decisions are explicit;
- known matcher findings are classified;
- no forbidden files were changed.
