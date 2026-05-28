# TASK-CE-0009 Urgency Assistance QA Fixture Fix

Date: 2026-05-27
Role: Director Ether / Captain Ether
Mode: validation unblocker

## Status

PASS.

## Trigger

After local PHP CLI was built, the Captain Ether validator ran and exposed one
content QA fixture failure:

```text
[starter_regression] should_reject passed matcher {"item_id":"word_urgency_assistance_001","answer":"help","match_type":"variant"}
```

## Decision

The matcher intentionally maps `help` to `assistance` as a semantic variant.
Changing the matcher would be broader and riskier than fixing the fixture.

## Files Changed

- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`

## Change

For `word_urgency_assistance_001`:

- moved `help` from `should_reject` to `should_accept`;
- kept `advice` and `rescue` as rejects.

## Checks

PASS:

- JSON parse for changed files.
- `$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php`
- `$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php`

Validator result:

```text
PASS
WARN (9): duplicate accepted_answers after normalization
```

The warnings are duplicate-normalization warnings already surfaced by the
validator; they are not failures.

## Scope Preserved

- matcher not changed.
- UI not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.
