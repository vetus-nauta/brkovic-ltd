# Task 0005: NavDesk Functional And Print Audit

**Owner:** QA / UX
**Assigned:** 2026-05-27
**Status:** Assigned
**Director task:** `BRK-MVP-QAUX-005`

## Objective

Audit the remaining NavDesk tools for MVP readiness, with special attention to route calculations and print/PDF output.

## Required Work

1. Review `navdesk-route.html`, especially orthodrome and loxodrome workflows.
2. Check whether route outputs, tables, courses, and coordinates are understandable and printable.
3. Review print/PDF behavior for route and tides outputs.
4. Smoke-test `navdesk-watch.html`, `navdesk-tides.html`, `navdesk-ukv.html`, and `navdesk-english.html`.
5. Check desktop, tablet, and mobile risks.

## Report Format

Findings first, ordered by severity.

For each finding include:

- file/page;
- scenario;
- actual behavior;
- expected MVP behavior;
- recommended fix.

## Do Not Do

- Do not redesign UI.
- Do not change production.
- Do not touch secrets.
- Do not remove day/night or shared disclaimer behavior.

## Output

Write a report to:

`reports/navdesk-functional-print-audit-2026-05-27.md`
