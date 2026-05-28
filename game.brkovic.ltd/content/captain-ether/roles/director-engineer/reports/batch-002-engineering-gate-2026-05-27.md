# Technical Card: Batch 002 Engineering Gate

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Inputs

Content Producer report:

```text
content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md
```

Sea Speak Linguist report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md
```

Batch file:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

## Decision

Sea Speak Linguist confirmed that `berth / birth` and `fender / finder(s)` are
must-stay-wrong dangerous pairs.

Director-Engineer accepted the finding as a runtime matcher issue and fixed it
in the typo layer.

## Changed Files

- `public/api/captain-ether/_answer-matching.php`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/roles/director-engineer/reports/batch-002-engineering-gate-2026-05-27.md`

Other handoff/task files may reference this gate, but playable content was not
merged.

## Runtime Fix

Added forbidden typo protection for:

- `berth / birth`;
- `fender / finder`;
- `fenders / finders`.

This keeps minor typo help active while preventing dangerous marina-word
lookalikes from being accepted as spelling.

## Validation

Local validation passed:

- PHP lint for `_answer-matching.php`: PASS.
- Batch 002 JSON parse: PASS.
- Batch 002 item count: `50`.
- Batch 002 item QA:
  - `134` should-accept examples pass;
  - `165` should-reject examples stay wrong.
- Batch 002 dangerous pairs:
  - `24` must-accept examples pass;
  - `49` must-reject examples stay wrong.
- Existing starter regression:
  - `90` items;
  - `267` should-accept examples pass;
  - `270` should-reject examples stay wrong;
  - `15` dangerous minimal-pair groups pass.

## Scope Confirmation

Not merged:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`

Not touched:

- router;
- registry;
- Nav Desk;
- Watch Officer;
- auth/platform files;
- Captain Ether UI;
- private config, `.netrc`, SMTP, cookies, login codes, or secrets.

## Next Step

Assign QA acceptance before merge:

```text
content/captain-ether/roles/qa/tasks/batch-002-acceptance-qa-2026-05-27.md
```
