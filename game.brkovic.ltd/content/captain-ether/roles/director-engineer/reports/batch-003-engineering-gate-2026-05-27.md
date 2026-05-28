# Technical Card: Batch 003 Engineering Gate

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Inputs

Content Producer report:

```text
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
```

Sea Speak Linguist report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
```

Batch file:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

## Decision

Sea Speak Linguist completed Batch 003 review and made one content-side safety
patch: bare `090` and `090 degrees` were removed from
`phrase_nav_course_090_001`. Course reports now require the `course` frame.

Director-Engineer accepts this as a content-side fix. No matcher/API/policy
change is needed for Batch 003 before QA.

Batch 003 is routed to QA acceptance before merge.

## Changed Files

- `content/captain-ether/roles/qa/tasks/batch-003-acceptance-qa-2026-05-27.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/director-engineer/reports/batch-003-engineering-gate-2026-05-27.md`

The linguist task changed:

- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md`

No playable content, matcher, API, UI, policy, routing, auth, registry, Nav Desk,
Watch Officer, deploy config, private config, `.netrc`, SMTP, cookies, login
codes, player identity, or secrets were changed by this gate.

## Accepted Linguist Decisions

- Bare `090` is accepted only for the heading-style numeric item.
- Course reports must keep the `course` frame.
- `E.T.A.` through `e t a` remains accepted for the ETA word item.
- `UTC`, `Zulu`, and `Z` remain accepted item-locally for exact ETA values.
- Local time remains wrong for ETA reports.
- Compact position reports remain accepted when position, direction, and
  reference are exact.
- `waypoint` remains wrong for `reporting point` items.
- `range` remains wrong for `distance`.
- `decimal` remains strict; `point` and `dot` remain wrong.
- `kts` remains accepted for `knots`.
- `readback` remains accepted for `read back`, while `say again` and `read back`
  stay semantically separate.

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
- should_reject checks: `151`;
- dangerous must_accept checks: `36`;
- dangerous must_reject checks: `53`.

Known warnings:

- `6` existing starter duplicate-normalization warnings remain from old starter
  items.
- No Batch 003 failure was reported.

## Next Step

Assign QA acceptance before merge:

```text
content/captain-ether/roles/qa/tasks/batch-003-acceptance-qa-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md
```
