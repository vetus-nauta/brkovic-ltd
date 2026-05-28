# Technical Card: Batch 003 Intake To Linguist

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Inputs

Content Producer report:

```text
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
```

Batch file:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

## Decision

Batch 003 is accepted as a content draft and routed to Sea Speak Linguist review
only. It is not ready for merge into `starter.json`.

The next gate must resolve navigation-report language boundaries before QA or
merge:

- `heading / course / bearing`;
- `position / destination / waypoint / reporting point`;
- ETA and UTC/Zulu/Z forms;
- `090 / 90` and spoken-digit numeric forms;
- `knots / nautical miles / cables`;
- `decimal / point / dot`;
- `say again / read back`.

## Changed Files

- `content/captain-ether/roles/sea-speak-linguist/tasks/batch-003-navigation-reports-risk-review-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/director-engineer/reports/batch-003-intake-to-linguist-2026-05-27.md`

No playable content, matcher, API, UI, routing, auth, deploy config, registry,
or Nav Desk files were changed by this intake step.

## Validation

Director-Engineer reran:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Result: `PASS`.

Batch summary:

- items: `50`;
- grammar patterns: `27`;
- dangerous minimal-pair groups: `10`;
- type mix: `8` word, `12` short_expression, `30` phrase;
- level mix: `12` beginner, `30` intermediate, `8` advanced;
- target_text checks: `50`;
- should_accept checks: `131`;
- should_reject checks: `150`;
- dangerous must_accept checks: `36`;
- dangerous must_reject checks: `52`.

Known warnings:

- `6` existing starter duplicate-normalization warnings remain from old starter
  items.
- No Batch 003 failure was reported.

## Next Role Command

Sea Speak Linguist:

```text
content/captain-ether/roles/sea-speak-linguist/tasks/batch-003-navigation-reports-risk-review-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
```

After the linguist report, Director-Engineer decides whether Batch 003 needs
matcher/policy work or can move to QA acceptance.
