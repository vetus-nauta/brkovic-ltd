# QA Report: Batch 001 Acceptance Before Merge

Date: 2026-05-27  
Role: QA / Captain Ether  
Mode: report-only  
Target batch: `content/captain-ether/batches/batch-001-radio-procedure.json`

## Result

PASS.

Batch 001 is ready for Director-Engineer merge into `starter.json` from QA acceptance perspective.

## Files Read

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/batch-001-radio-procedure-brief.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `public/api/captain-ether/_answer-matching.php`

## Checks

| Block | Result | Details |
| --- | --- | --- |
| JSON validity | PASS | Batch JSON parsed successfully. |
| Batch item count | PASS | `50` items. |
| Type counts | PASS | `15` word, `15` short_expression, `20` phrase. |
| Level counts | PASS | `25` beginner, `18` intermediate, `7` advanced. |
| Required fields and hints | PASS | Required fields and hint fields present. |
| IDs | PASS | `50` unique batch IDs; no duplicate with existing `starter.json` item IDs. |
| Batch target_text matcher | PASS | `50 / 50` target texts passed current matcher. |
| Batch should_accept | PASS | `147 / 147` examples passed current matcher. |
| Batch should_reject | PASS | `150 / 150` examples stayed wrong. |
| Batch dangerous minimal pairs | PASS | `9` groups; `16` must_accept and `26` must_reject checks passed. |
| Existing starter regression | PASS | `40` starter QA items; `120` should_accept and `120` should_reject checks passed. |
| Specific advice/advise check | PASS | `advice` passed as exact; `advise` stayed wrong. |

## Failure List

No failures.

## Specific Required Check

Item: `word_core_advice_marker_001`

| Answer | Expected | Actual |
| --- | --- | --- |
| `advice` | correct | correct, `match_type=exact` |
| `advise` | wrong | wrong, `match_type=wrong` |

## Severity / Owner Routing

No findings to route.

If this report is used as merge gate, routing is:

- Director-Engineer: PASS for merge decision.
- Content Producer: no schema/count/content typo finding.
- Sea Speak Linguist: no accepted/rejected variant dispute found by QA.
- QA follow-up: not needed.

## Report-Only Confirmation

QA was report-only.

Changed file:

- `content/captain-ether/qa-batch-001-acceptance-2026-05-27.md`

Forbidden files were not edited:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `content/captain-ether/answer-policy.md`
- `public/api/captain-ether/`
- `public/assets/`

No router, registry, Nav Desk, Watch Officer, auth/platform, deploy, private config, `.netrc`, SMTP settings, or secrets were touched.
