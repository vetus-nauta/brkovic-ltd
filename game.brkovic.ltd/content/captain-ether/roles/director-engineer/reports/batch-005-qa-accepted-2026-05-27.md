# Batch 005 QA Accepted

Date: 2026-05-27
Role: Director-Engineer / Captain Ether

## Status

QA ACCEPTED.

Batch 005 `Urgency / Pan-Pan Equipment And Assistance Basics` is accepted for
local merge into playable Captain Ether content and regression source.

## Accepted Inputs

- Content Producer draft:
  `content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md`
- Sea Speak Linguist review:
  `content/captain-ether/roles/sea-speak-linguist/reports/batch-005-urgency-panpan-risk-review-2026-05-27.md`
- Engineering gate:
  `content/captain-ether/roles/director-engineer/reports/batch-005-engineering-gate-2026-05-27.md`
- QA acceptance:
  `content/captain-ether/roles/qa/reports/batch-005-urgency-panpan-acceptance-qa-2026-05-27.md`

## Decision

Proceed with local merge only.

No production deploy, FTP upload, public production smoke, router/registry,
auth/platform, Watch Officer, Nav Desk, Game Director docs, or production
config change is approved.

## Merge Requirements

- Add `25` Batch 005 items to `content/captain-ether/starter.json`.
- Do not copy item `qa_notes` into playable runtime items.
- Add Batch 005 item accept/reject examples to
  `content/captain-ether/accept-reject-qa-pairs.json`.
- Add Batch 005 dangerous minimal-pair groups to
  `content/captain-ether/accept-reject-qa-pairs.json`.
- Mark the batch file status as `merged`.
- Run available local JSON/structure checks.
- Note that PHP validator is currently unavailable in this shell and must be
  run later where PHP is on `PATH`.

## Scope Preserved

- Runtime/API not changed.
- UI not changed.
- Matcher not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- Production config and deploy/FTP not touched.
- Secrets and player identity not touched.
