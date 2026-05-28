# Technical Card: Batch 004 Engineering Gate

Status: PASS
Date: 2026-05-27
Role: Director-Engineer / Captain Ether

## Inputs

Content Producer report:

```text
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
```

Sea Speak Linguist report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
```

Batch file:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

## Decision

Sea Speak Linguist completed Batch 004 review and made content-side tightening
only. The batch stays in the safety-information branch, not urgency or distress.

Director-Engineer accepts the review result:

- `Securite` and `Sécurité` are accepted safety-signal forms.
- Ordinary English `security` stays wrong.
- `Pan-Pan` and `Mayday` remain reject-only examples in Batch 004.
- `safety`, `urgency`, and `distress` stay separate.
- `warning`, `advice`, and `information` stay separate.
- noun `advice` stays protected from verb-form `advise`.
- `UTC`, `Zulu`, and `Z` are accepted item-locally only when the exact safety
  time is preserved.
- `restricted visibility` stays strict; `poor visibility`, `reduced visibility`,
  and `visibility good` stay wrong.
- `navigation warning` and `weather warning` stay separate.
- `wind warning` stays wrong for `weather warning`.
- `hazard` stays strict against broad `danger`.
- `obstruction` stays strict against `obstacle`; a top-level
  `obstruction / obstacle` dangerous pair was added.
- compact `readback` remains accepted for `read back` items.
- `say again` and `repeat` stay wrong for `read back`.
- `keep a listening watch` is accepted with `keep listening watch`.
- broad `keep watch` and `stand by` stay wrong for listening-watch items.
- exact channel, time, bearing, distance, unit, direction, location, and
  reporting-point values remain protected.

No matcher/API/policy/runtime change is needed before QA.

Batch 004 is routed to QA acceptance before merge.

## Changed Files

This Director-Engineer gate adds or updates:

- `content/captain-ether/roles/qa/tasks/batch-004-acceptance-qa-2026-05-27.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/director-engineer/reports/batch-004-engineering-gate-2026-05-27.md`

The Sea Speak Linguist task changed:

- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`

No playable `starter.json` merge, regression update, matcher, API, UI, policy,
routing, auth, registry, Nav Desk, Watch Officer, deploy config, private config,
`.netrc`, SMTP, cookies, login codes, player identity, or secrets were changed by
this gate.

## Validation

Director-Engineer reran:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Result: `PASS`.

Batch summary:

- items: `40`;
- grammar patterns: `24`;
- dangerous minimal-pair groups: `12`;
- type mix: `6` word, `10` short_expression, `24` phrase;
- level mix: `8` beginner, `24` intermediate, `8` advanced;
- target_text checks: `40`;
- should_accept checks: `99`;
- should_reject checks: `123`;
- dangerous must_accept checks: `33`;
- dangerous must_reject checks: `64`.

Known warnings:

- `6` existing starter duplicate-normalization warnings remain from old starter
  items.
- No Batch 004 failure was reported.

## Next Step

Assign QA acceptance before merge:

```text
content/captain-ether/roles/qa/tasks/batch-004-acceptance-qa-2026-05-27.md
```

Expected report:

```text
content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md
```
