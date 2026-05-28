# Technical Card: Batch 004 Intake To Linguist

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Inputs

Content Producer report:

```text
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
```

Batch file:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

## Decision

Batch 004 is accepted as a content draft and routed to Sea Speak Linguist review
only. It is not ready for merge into `starter.json`.

The next gate must resolve safety-information language boundaries before QA or
merge:

- `Securite / Sécurité / security`;
- `Securite / Pan-Pan / Mayday`;
- `safety / urgency / distress`;
- `warning / advice / information`;
- `advice / advise`;
- `restricted visibility / poor visibility / visibility good`;
- `navigation warning / weather warning`;
- `hazard / obstruction / danger`;
- `wind / sea state / visibility`;
- `read back / say again`;
- exact positions, channels, times, bearings, distances, and directions.

## Changed Files

- `content/captain-ether/roles/sea-speak-linguist/tasks/batch-004-safety-securite-risk-review-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/director-engineer/reports/batch-004-intake-to-linguist-2026-05-27.md`

No playable content, matcher, API, UI, routing, auth, deploy config, registry,
or Nav Desk files were changed by this intake step.

## Validation

Director-Engineer reran:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Result: `PASS`.

Batch summary:

- items: `40`;
- grammar patterns: `24`;
- dangerous minimal-pair groups: `11`;
- type mix: `6` word, `10` short_expression, `24` phrase;
- level mix: `8` beginner, `24` intermediate, `8` advanced;
- branch: `safety_securite`;
- target_text checks: `40`;
- should_accept checks: `99`;
- should_reject checks: `120`;
- dangerous must_accept checks: `30`;
- dangerous must_reject checks: `58`.

Known warnings:

- `6` existing starter duplicate-normalization warnings remain from old starter
  items.
- No Batch 004 failure was reported.

## Next Role Command

Sea Speak Linguist:

```text
content/captain-ether/roles/sea-speak-linguist/tasks/batch-004-safety-securite-risk-review-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
```

After the linguist report, Director-Engineer decides whether Batch 004 needs
matcher/policy work or can move to QA acceptance.
