# TASK-0117 - QA Local Web Export Scenario Selector Smoke

**Chat ID:** CHAT-QA-001  
**Department:** Maritime QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-selector-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-selector-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`

## Task

Run local browser smoke against the prototype-local Web export for the Scenario 1 / Scenario 2 selector build.

## Required Checks

Confirm:

- local export artifacts exist;
- local static server can serve `index.html`, `.js`, `.wasm`, `.pck`, worker/worklet files;
- browser loads a non-empty Godot canvas;
- selector is visible on fresh load;
- fresh load defaults to Scenario 1;
- Scenario 2 can be selected in browser;
- starting an attempt hides selector;
- reset returns selector and preserves selected Scenario 2;
- Scenario 1 can be selected again after Scenario 2;
- draft/non-final and Region A/VTS inactive wording remains visible;
- no forbidden final/certified/legal/COLREGS-compliant claims are visible;
- no deploy/public route/registry work is performed.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-selector-review.md
```

Status must be one of:

```text
approved-for-staged-public-candidate-decision
changes-required
blocked
```

## Boundaries

- Do not edit code.
- Do not deploy.
- Do not edit `public/`.
- Do not touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
- Stop any temporary local server before finishing.
