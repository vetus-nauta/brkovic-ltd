# TASK-CE-0001 Curriculum Architect Review

Date: 2026-05-27
Role: Director Ether / Captain Ether
Reviewed report:
`content/captain-ether/roles/curriculum-architect/reports/beta-1-1-branch-aware-watch-architecture-2026-05-27.md`

## Decision

Accepted as planning PASS.

No runtime, API, UI, content-data, QA-gate, production, router, registry, auth,
or deploy change is approved by this review.

## Accepted Controls

- Keep Beta 1.0 Mixed Watch as the public default.
- Preserve current watch lengths: beginner `12`, intermediate `16`, advanced
  `20`.
- Preserve current order: `word -> short_expression -> phrase`.
- Treat branch-aware watches as a future additive mode only.
- Do not expose a public branch selector yet.
- Use branch/module data first for internal planning, QA sampling, and future
  architecture design.

## Readiness Decision

Ready for future hidden/internal selector-contract planning only:

- `core_radio`
- `marina_harbour`
- `navigation_reports`

Partial only:

- `safety_securite`

Not ready for public branch selection:

- `traffic_collision`
- `urgency_panpan`
- `distress_mayday`
- `onboard_operations`
- `vts_port_control`
- `review_minimal_pairs`
- unbranched legacy starter items

## Next Safe Task

Assign Director-Engineer a report-only selector contract task for Beta 1.1.

The task should define the future additive `start-watch` request/selection
contract without implementation, including:

- default mixed behavior when no mode/branch/module is sent;
- focused branch and future module parameters;
- underfilled-pool behavior;
- branch/level exposure rules;
- QA smoke cases required before any UI selector is exposed.

## Scope Preserved

- `starter.json` not changed.
- batch JSON not changed.
- matcher/API/runtime not changed.
- UI not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.

## Checks

Tests: not run; documentation-only Director review.
