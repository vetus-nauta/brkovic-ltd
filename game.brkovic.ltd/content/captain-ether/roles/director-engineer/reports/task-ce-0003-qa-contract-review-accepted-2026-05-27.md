# TASK-CE-0003 QA Contract Review Accepted

Date: 2026-05-27
Role: Director Ether / Captain Ether
Reviewed report:
`content/captain-ether/roles/qa/reports/beta-1-1-start-watch-branch-filter-contract-qa-review-2026-05-27.md`

## Decision

QA review accepted.

Status remains NEEDS DIRECTOR DECISION before runtime/API/UI/content
implementation starts.

No implementation is approved by this review.

## Accepted QA Requirements

The future branch-filter implementation must use the QA report's 32-case smoke
matrix as the minimum local QA gate.

The implementation contract must be tightened before coding around:

- default mixed compatibility for all three levels;
- explicit invalid mode behavior;
- explicit focused_branch success/reject fixtures;
- focused_module hidden/unavailable behavior;
- hard reject mutation safety;
- payload and error privacy;
- Lost Oars, finish-watch, progress, and answer-log compatibility;
- branch matcher and dangerous-pair samples.

## Director Decisions For Next Contract Revision

- Underfilled focused pools should hard reject for the first hidden/internal
  implementation.
- Invalid `mode` should return a controlled error, not fall back to mixed.
- Absent `mode` with stray `branch` or `module` should preserve current mixed
  behavior.
- `mode: mixed` should ignore `branch` and `module`.
- `focused_module` should remain unavailable until a later Director task.
- Branch/module values should stay out of player-facing question payloads until
  a separate UI/API payload decision approves them.

## Next Safe Task

Director Ether should revise the Beta 1.1 start-watch branch-filter contract
report to incorporate QA's required decisions and 32-case QA matrix.

After that, QA should review the revised contract before any runtime/API work.

## Scope Preserved

- runtime/API not changed.
- UI not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.

## Checks

Tests: not run; documentation-only Director review.
