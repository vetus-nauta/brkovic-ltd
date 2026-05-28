# Chat Assignment

**Chat ID:** `CHAT-BRK-QA-UX-001`
**Department:** QA/UX Inspector
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-QAUX-001`
**Status:** Assigned

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Source Documents

Read first:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md
docs/brkovic_ltd_project_office/cabinets/qa-ux/README.md
docs/brkovic_ltd_project_office/director-reports/2026-05-27-office-setup.md
docs/brkovic_ltd_project_knowledge.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
```

## Task

Understand your QA/UX role and run a local MVP smoke audit.

Check:

- responsive layout: desktop, tablet, mobile;
- main page clarity and service card rhythm;
- all service pages;
- journal page and multipage collection display if available;
- NavDesk main page and tool pages;
- day/night NavDesk behavior;
- disclaimer behavior;
- contact links and form visible states;
- broken links, obvious console errors, and visible layout breakage.

MVP stabilization rule:

- do not redesign the interface;
- do not edit product code;
- propose UX/interface corrections only as approval-needed items;
- mark whether each issue is "MVP blocker", "risk", or "post-release";
- functional completion before release starts only in NavDesk tools/functions unless Director assigns another task.

## Required Output

Write the full report to:

```text
docs/brkovic_ltd_project_office/reports/local-qa-ux-smoke-2026-05-27.md
```

## Boundaries

- Do not edit product code.
- Do not deploy.
- Do not rewrite copy.
- Do not touch secrets or private configs.
- Do not judge production 404 for pages not yet deployed as a local MVP blocker.

## Required Short Chat Reply

```text
BRK-MVP-QAUX-001 done.
Report: docs/brkovic_ltd_project_office/reports/local-qa-ux-smoke-2026-05-27.md
Tests:
- <list checks run>: <N> passed, 0 failed
Scope preserved:
- product code, copy, SEO files, backend, FTP, production, secrets not touched.
Next expected: Director gate review.
```
