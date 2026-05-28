# Technical Card: Captain Ether MVP Readiness Analysis

Status: PASS WITH MVP-HARDENING RECOMMENDATION  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Current Product State

Captain Ether is live and playable at:

```text
https://game.brkovic.ltd/games/captain-ether
```

Production-smoke accepted content:

- Batch 001: core radio procedure.
- Batch 002: marina / harbour basics.

Playable corpus:

- `140` items.
- `61` grammar patterns.
- `2` scenarios.
- `401` should-accept regression examples.
- `435` should-reject regression examples.
- `27` dangerous minimal-pair groups.

Live flow verified:

- route opens;
- login and intended route return to Captain Ether;
- watches are `12` / `16` / `20`;
- watch order stays `word -> short_expression -> phrase`;
- Batch 001 and Batch 002 items are reachable on production;
- player payload does not expose `target_text`, `accepted_answers`, or
  `qa_notes`;
- targeted matcher checks pass.

## MVP Judgment

Captain Ether is at training MVP quality for a controlled/public-beta launch.

It is not yet a broad Sea Speak course, but it is a coherent playable MVP:

- player can log in;
- player can start short watches;
- player gets progressive radio prompts;
- player answer checking is useful but conservative;
- obvious dangerous minimal pairs are protected;
- wrong/spelling/variant behavior has regression coverage;
- Lost Oars and progress exist;
- production smoke has passed after real content growth.

The product now has enough useful content for the first learning loop:

```text
Core radio procedure -> marina/harbour routine use -> review mistakes
```

## Are We Walking In Circles?

No, the current pipeline is not circular. It is a gated ladder:

1. Content Producer drafts the batch.
2. Sea Speak Linguist reviews meaning and dangerous variants.
3. Director-Engineer fixes runtime/matcher issues and integrates.
4. QA acceptance checks the batch before merge.
5. Director-Engineer merges and deploys.
6. QA production smoke confirms live behavior.

Each gate answers a different question:

- Content Producer: is there usable content?
- Linguist: is the Sea Speak meaning correct?
- Engineer: does runtime behavior match the policy?
- QA acceptance: is the batch safe to merge?
- Deploy/hash-check: are the intended files really on production?
- Production smoke: does the live product work for the player?

That said, the proof phase is now complete. Repeating the full ceremony at the
same depth forever would become circular.

## New Operating Mode

After Batch 002 production-smoke PASS, Captain Ether should switch from
pipeline-proof mode to MVP-hardening mode.

Keep the pipeline, but reduce needless loops:

- One Content Producer pass per batch.
- One Sea Speak Linguist pass per batch.
- One Director-Engineer runtime/integration gate.
- One QA acceptance before merge.
- One production smoke after deploy.
- Reopen an earlier role only on `FAIL` or `NEEDS DIRECTOR DECISION`.

Do not re-review a batch just because the next role has completed successfully.

## What Blocks A Strong MVP

No critical blocker remains for a controlled MVP.

High-value hardening items before wider release:

1. Add automated validation scripts for batch + regression checks.
2. Add a small in-game branch signal or filter once branches matter to players.
3. Add a compact admin/QA view for real answer logs.
4. Confirm mobile comfort after several completed watches, not only individual
   screens.
5. Decide how much content is enough for "first release": current `140` is MVP;
   `230` after Batch 003/004 is stronger.

## Recommended MVP Scope

MVP content scope:

- Core Radio.
- Marina / Harbour.
- Lost Oars review.
- Conservative matcher.
- Email login and progress.
- Answer-log collection for disputed answers.

MVP should not yet promise:

- full Sea Speak coverage;
- Mayday/Pan-Pan mastery;
- VTS/port-control authority training;
- branch-specific course mode;
- scenario-heavy simulator behavior.

## Next Technical Step

Completed.

Automated validation command:

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Implementation report:

```text
content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md
```

This turns repeated manual checking into one command and prevents the role
process from becoming circular.

Next: assign Batch 003 navigation reports to Content Producer.

## Current Decision

Batch 002 production smoke is accepted.

QA report:

```text
content/captain-ether/roles/qa/reports/batch-002-production-smoke-2026-05-27.md
```

Result: `PASS`.

Next recommended Director-Engineer task:

```text
Assign Batch 003 navigation reports to Content Producer.
```
