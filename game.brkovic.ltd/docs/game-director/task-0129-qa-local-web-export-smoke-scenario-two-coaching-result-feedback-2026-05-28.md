# TASK-0129 - QA Local Web Export Smoke Scenario 2 Coaching + Result Feedback

**Chat ID:** CHAT-QA-001  
**Department:** Maritime QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-28  
**Status:** Pending Local Export  

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-two-coaching-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-coaching-result-feedback-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`

## Task

After `TASK-0128` exists, run local browser smoke against the prototype-local Web export:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Required Checks

Confirm:

- export files exist;
- local HTTP serving works with required Web runtime headers;
- browser loads non-empty Godot canvas;
- selector defaults to Scenario 1;
- Scenario 2 is selectable;
- Scenario 2 briefing shows `Region A / VTS inactive`;
- Scenario 2 running coaching can show `Early starboard alteration made.`;
- draft/non-final wording remains visible;
- no forbidden final/certified/official/legal/COLREGS-compliant claims appear in reviewed browser states;
- no `public/`, deploy, route, or registry scope was changed.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-review.md
```

Status must be one of:

```text
approved
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not edit export artifacts.
- Do not edit `public/`.
- Do not deploy.
- Do not use FTP.
- Do not touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS expansion, Region B, or final maritime training claims.

## Required Chat Reply

```text
TASK-0129 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-review.md
Tests:
- <browser_smoke>: passed, 0 failed
Scope preserved:
- code, public files, deploy, Captain Ether, Nav Desk, auth, VTS, Region B, final training claims not touched.
Next expected: Game Director staged public candidate decision.
```
