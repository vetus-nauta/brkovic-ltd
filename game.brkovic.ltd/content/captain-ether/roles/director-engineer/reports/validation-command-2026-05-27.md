# Technical Card: Captain Ether Validation Command

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Result

Created an automated Captain Ether validation command.

Command:

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Optional batch mode:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

## Changed Files

- `content/captain-ether/tools/validate-captain-ether.php`
- `content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md`

## What It Checks

Starter / playable content:

- JSON parse;
- item, grammar-pattern, and scenario counts;
- type, level, branch, and module counts;
- duplicate item IDs;
- duplicate grammar-pattern IDs;
- required item fields;
- no `qa_notes` in playable `starter.json` items;
- every `target_text` passes the real Captain Ether matcher.

Regression:

- every `should_accept` example passes;
- every `should_reject` example stays wrong;
- every dangerous minimal-pair `must_accept` / `must_reject` check passes;
- QA item IDs exist in `starter.json`.

Watch selection:

- beginner watch length `12`;
- intermediate watch length `16`;
- advanced watch length `20`;
- progressive order stays `word -> short_expression -> phrase`;
- repeated selection smoke runs complete without bad runs.

Optional batch mode:

- validates draft or merged batch JSON;
- requires branch/module and `qa_notes` fields;
- validates batch target text, should-accept, should-reject, and dangerous pairs;
- checks draft batch IDs do not already exist in starter;
- checks merged batch IDs do exist in starter.

## Validation Results

Command:

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Result: `PASS`.

Observed state:

- starter items: `140`;
- grammar patterns: `61`;
- scenarios: `2`;
- QA items: `140`;
- target texts checked: `140`;
- should-accept checked: `401`;
- should-reject checked: `435`;
- dangerous-pair groups: `27`;
- dangerous `must_accept`: `60`;
- dangerous `must_reject`: `98`;
- watch-selection smoke: beginner/intermediate/advanced all `0` bad runs.

Command:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Result: `PASS`.

Batch 002 observed state:

- items: `50`;
- grammar patterns: `22`;
- dangerous-pair groups: `12`;
- status: `merged`;
- should-accept checked: `134`;
- should-reject checked: `165`;
- dangerous `must_accept`: `24`;
- dangerous `must_reject`: `49`.

## Warnings

The command reports existing normalized duplicate `accepted_answers` as warnings,
not failures.

Reason:

- these are older punctuation/case/spacing variants that normalize to the same
  answer;
- they do not break matcher behavior;
- treating them as failures would create cleanup churn unrelated to MVP safety.

Current warning count: `6`.

## Scope Confirmation

The validator reads:

- Captain Ether content JSON;
- the real Captain Ether matcher;
- bootstrap helpers needed by matcher normalization.

The validator does not write content, runtime state, private config, secrets,
cookies, SMTP, `.netrc`, or deploy files.

No router, registry, Nav Desk, Watch Officer, auth, UI, or platform behavior was
changed.

## Next Step

Use this command as the standard Director-Engineer gate before future merges and
before assigning QA acceptance.

Batch 003 can now be assigned to Content Producer.
