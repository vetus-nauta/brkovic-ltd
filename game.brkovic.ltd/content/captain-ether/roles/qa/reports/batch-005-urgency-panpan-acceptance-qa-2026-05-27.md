# QA Report: Captain Ether Batch 005 Acceptance Before Merge

## Copy-ready technical card for Director-Engineer

```md
Chat: QA / Captain Ether
Task: TASK-CE-PROD-005-QA-0001
Status: PASS

Checked:
- Batch 005 draft counts and structure: PASS
- Required item fields: PASS
- Item IDs unique: PASS
- qa_notes.should_accept coverage: PASS, 79 examples across 25 items
- qa_notes.should_reject coverage: PASS, 75 examples across 25 items
- Dangerous minimal pairs: PASS, 8 groups covering Pan-Pan/Securite/Mayday, urgency/safety/distress, failure type, assistance type, procedure words, and exact values
- Existing regression source reviewed for baseline scope: 230 items, 631 should-accept examples, 709 should-reject examples, 49 dangerous minimal-pair groups

Key risk review:
- Pan-Pan, Securite/security, and Mayday remain separated by expected rejects.
- urgency, safety, distress, and generic emergency remain separated.
- engine failure, steering failure, power failure, engine problem, and rudder failure remain item-specific.
- medical assistance, medical advice, evacuation, rescue, tug, pilot, and tow variants remain item-local.
- stand by, keep listening watch, go ahead, read back, readback, and say again remain procedure-specific.
- Exact channel 16/12, time 1400/1500, harbour/marina, north/south, east/west, nautical miles/cables, position/destination, proceeding/requesting, and one/two person-count values are covered by reject expectations.

Findings: no blocking findings.

Report-only confirmation:
QA did not edit batch/content/API/UI/runtime, starter.json, matcher, router/registry, auth/platform, Watch Officer, Nav Desk, Game Director docs, production config, deploy/FTP, or secrets.
Only this report file was created:
content/captain-ether/roles/qa/reports/batch-005-urgency-panpan-acceptance-qa-2026-05-27.md

Tests: not run; documentation/content QA only. No production checks, runtime matcher checks, API checks, UI checks, or PHP validator run.
Next expected: Director-Engineer acceptance or fix task.
```

## Scope

- Mode: report-only QA acceptance review before merge.
- Batch under review: `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`.
- Allowed output: `content/captain-ether/roles/qa/reports/batch-005-urgency-panpan-acceptance-qa-2026-05-27.md`.
- Forbidden areas preserved: runtime/API/UI/content data, `starter.json`, matcher, router/registry, auth/platform, Watch Officer, Nav Desk, Game Director docs, production config, deploy/FTP, secrets, cookies, sessions, CSRF, player email, and player identity.

## Inputs Read

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-005-urgency-panpan-risk-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/batch-005-engineering-gate-2026-05-27.md`

## Result By Block

| Block | Status | Evidence |
| --- | ---: | --- |
| Batch status | PASS | `status: draft`; not merged into playable content |
| Total items | PASS | `25` |
| Grammar patterns | PASS | `0` |
| Type counts | PASS | `4` word, `7` short_expression, `14` phrase |
| Level counts | PASS | `4` beginner, `9` intermediate, `12` advanced |
| Branch | PASS | All `25` items use `urgency_panpan` |
| Module counts | PASS | urgency_signal `4`, equipment_failure `5`, medical_assistance `4`, towing_assistance `3`, position_and_intentions `5`, urgency_readback `4` |
| Accepted-answer entries | PASS | `47` entries |
| Required fields | PASS | All items include `id`, `type`, `level`, `branch`, `module`, `target_text`, `accepted_answers`, and `qa_notes` |
| Item ID uniqueness | PASS | No duplicate item IDs found in batch |
| Empty accepted answers | PASS | No item has an empty `accepted_answers` list |
| `qa_notes.should_accept` | PASS | Present on all `25` items; `79` examples total |
| `qa_notes.should_reject` | PASS | Present on all `25` items; `75` examples total |
| Dangerous minimal pairs | PASS | `8` groups; all referenced item IDs exist in the batch |
| Baseline regression source | PASS | Existing `accept-reject-qa-pairs.json` remains the pre-merge baseline: `230` items, `631` should-accept, `709` should-reject, `49` dangerous groups |

## Acceptance Coverage Review

`qa_notes.should_accept` coverage is adequate for a pre-merge draft review. It includes canonical targets, capitalization/punctuation variants, approved item-local Pan-Pan forms, exact channel `16` wording, exact ETA `1400` UTC/Z/Zulu variants, numeric `2` where it preserves `two`, `request/require assistance`, `request/require tow` only on the towing request phrase, and `readback` only on the Pan-Pan readback item.

`qa_notes.should_reject` coverage is adequate. It explicitly protects branch and signal confusion, assistance category changes, legal-status substitutions, failure-type substitutions, procedure-word substitutions, exact numeric/time/channel/direction/unit/person-count changes, and destination/report-object/action changes.

## Dangerous Minimal Pairs

| Pair group | Status | QA assessment |
| --- | ---: | --- |
| `Pan-Pan / Securite / Mayday` | PASS | Pan-Pan accepts are item-local; Securite/security and Mayday are reject expectations for urgency items. |
| `urgency / safety / distress` | PASS | Safety, distress, and generic emergency/call substitutions remain wrong by expectation. |
| `engine failure / steering failure / power failure` | PASS | Failure type remains item-specific; engine problem and rudder failure are not silently accepted. |
| `disabled vessel / not under command / restricted manoeuvrability` | PASS | Basic disabled wording is accepted; legal-status phrases remain reject-only. |
| `medical assistance / medical advice / evacuation` | PASS | Assistance, advice, evacuation, and distress-medical framing stay separated. |
| `towing assistance / rescue / tug assistance` | PASS | `request tow` is limited to the request-towing item; rescue, tug, and pilot remain reject-only. |
| `stand by / keep listening watch / go ahead` | PASS | Procedure actions remain separate, including read back versus say again. |
| Exact values | PASS | Channel, time, destination, direction, distance unit, report object, action, and person count are covered by reject examples. |

## Numeric And Exact-Value Review

PASS. The batch carries explicit should-reject coverage for:

- channel `16` versus `12`;
- ETA `1400` versus `1500`;
- `harbour` versus `marina`;
- `north` versus `south`;
- `east` versus `west`;
- `nautical miles` versus `cables`;
- `position` versus `destination`;
- `proceeding` versus `requesting`;
- `reduced power` versus `without power`;
- `one person` versus `two persons`.

This matches the answer policy requirement that typo tolerance must not fuzz numeric tokens, channel numbers, ETA digits, headings, protected radio signals, or short nautical terms where a small change changes meaning.

## Findings

No blocking findings.

| Severity | Owner | Status | Details |
| --- | --- | --- | --- |
| None | Director-Engineer | PASS | Batch 005 is acceptable for Director-Engineer merge/regression decision from QA's report-only pre-merge review. |

## Limits Of This Review

No production checks were run. No runtime matcher, API, UI, PHP validator, or deploy checks were run. This QA pass is a documentation/content acceptance review of the draft batch and supporting reports only.

## Final QA Decision

PASS for Batch 005 Acceptance Before Merge.
