# Engineer Report: Batch 001 Merge

Date: 2026-05-27

## Result

Batch 001 is merged into playable Captain Ether content.

## Merge Gate

QA report:

```text
content/captain-ether/qa-batch-001-acceptance-2026-05-27.md
```

Result: `PASS`.

## Changed Content

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/roles/qa/handoff.md`

## Final Local State

- Playable items: `90`
- Grammar patterns: `39`
- Scenarios: `2`
- Regression QA items: `90`
- Should-accept examples: `267`
- Should-reject examples: `270`
- Dangerous minimal-pair groups: `15`

## Merge Notes

- `50` Batch 001 items were added to `starter.json`.
- `19` Batch 001 grammar patterns were added to `starter.json`.
- Batch item `qa_notes` were converted into `accept-reject-qa-pairs.json`.
- Batch item `qa_notes` were not copied into playable runtime items.
- `batch-001-radio-procedure.json` is now marked `merged`.

## Verification

Local matcher regression passed:

- all `target_text` values pass;
- all `267` should-accept examples pass;
- all `270` should-reject examples stay wrong;
- all `15` dangerous minimal-pair groups pass;
- `word_core_advice_marker_001`: `advice` passes, `advise` is wrong.

Watch-selection smoke passed for:

- beginner: `12` questions;
- intermediate: `16` questions;
- advanced: `20` questions.

All smoke runs preserved progressive order:

```text
word -> short_expression -> phrase
```

Production deploy:

- uploaded changed Captain Ether content and role docs;
- hash-check passed for `26` files;
- `https://game.brkovic.ltd/games/captain-ether` returned HTTP `200`.

Production QA smoke:

```text
content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md
```

Result: `PASS`.

QA confirmed:

- production route/login works;
- watches are `12` / `16` / `20`;
- progressive order is preserved;
- `23` Batch 001 item IDs were observed live;
- player-facing payload did not expose `target_text`, `accepted_answers`, or
  `qa_notes`;
- targeted matcher checks passed.

## Final Status

Batch 001 is live, playable, and production-smoke accepted.

Next role assignment:

```text
content/captain-ether/roles/curriculum-architect/tasks/next-three-batches-plan-2026-05-27.md
```

## Not Touched

- router;
- registry;
- Nav Desk;
- Watch Officer;
- auth/platform files;
- Captain Ether UI;
- private config, `.netrc`, SMTP, or secrets.
