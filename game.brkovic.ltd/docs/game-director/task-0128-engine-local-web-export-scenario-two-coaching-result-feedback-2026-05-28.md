# TASK-0128 - Engine Local Web Export Scenario 2 Coaching + Result Feedback

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-28  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-qa-fix-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-implementation-report.md`

## Task

Create a prototype-local Godot Web export for the QA-approved Scenario 2 Coaching + Result Feedback Pack.

## Required Work

1. Run focused pre-export local Godot tests.
2. Export using the existing Godot Web preset:

```text
Web Local
```

3. Keep generated export artifacts inside:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

4. Verify expected local export files exist.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-two-coaching-result-feedback-report.md
```

Status must be one of:

```text
passed
changes-required
blocked
```

## Boundaries

- Do not edit source gameplay code unless export is blocked by a narrow export-only defect and Game Director accepts it.
- Do not edit `public/`.
- Do not copy artifacts into staged public candidate.
- Do not deploy.
- Do not use FTP.
- Do not touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS expansion, Region B, or final maritime training claims.

## Required Chat Reply

```text
TASK-0128 done.
Report: game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-two-coaching-result-feedback-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public files, deploy, Captain Ether, Nav Desk, auth, VTS, Region B, final training claims not touched.
Next expected: QA local Web export smoke.
```
