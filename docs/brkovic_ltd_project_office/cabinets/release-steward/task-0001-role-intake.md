# Chat Assignment

**Chat ID:** `CHAT-BRK-RELEASE-001`
**Department:** Release Steward
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-REL-001`
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
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/cabinets/release-steward/README.md
```

## Task

Understand your Release Steward role and create a safe release manifest for the local BRKOVIC.LTD MVP candidate.

The manifest must list:

- files and folders to upload;
- files and folders to exclude;
- production files that require backup before overwrite;
- private/server-only files that must not be overwritten;
- unknowns and blockers;
- recommended deploy order.

MVP stabilization rule:

- do not propose interface rebuilds in the release manifest;
- treat NavDesk unfinished functions as the only known pre-release functional completion zone unless Director assigns more.

## Required Output

Write the full report to:

```text
docs/brkovic_ltd_project_office/reports/release-manifest-2026-05-27.md
```

## Boundaries

- Documentation-only task.
- Do not edit product code.
- Do not deploy.
- Do not print secrets.
- Do not touch FTP or production.
- Do not include `game.brkovic.ltd/` in the main site deploy package unless Director later assigns it explicitly.

## Required Short Chat Reply

```text
BRK-MVP-REL-001 done.
Report: docs/brkovic_ltd_project_office/reports/release-manifest-2026-05-27.md
Tests: not run; documentation-only task.
Scope preserved:
- product code, FTP, production, secrets, game.brkovic.ltd runtime data not touched.
Next expected: Director gate review.
```
