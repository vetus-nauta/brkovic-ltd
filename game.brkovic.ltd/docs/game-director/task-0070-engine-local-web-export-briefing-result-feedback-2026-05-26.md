# TASK-0070 - Engine Local Web Export: Briefing + Result Feedback Pack

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Prototype Path

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-briefing-result-feedback-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg`

## Task

Create a new local-only Godot Web export for the QA-approved `Briefing + Result Feedback Pack`.

This task updates only the prototype export artifacts under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

It must not copy artifacts to `public/`, deploy, upload by FTP, or touch production files.

## Required Work

- Run the focused briefing/result feedback test.
- Run the full headless regression.
- Run Godot Web export using existing preset:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --export-release "Web Local" exports/web-local/index.html
```

- Confirm required export artifacts exist:
  - `index.html`;
  - `index.js`;
  - `index.wasm`;
  - `index.pck`;
  - `index.worker.js`;
  - `index.audio.worklet.js`.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-briefing-result-feedback-report.md
```

The report must state one of:

- `local-web-export-created`
- `changes-required`
- `blocked`

Record:

- Godot version;
- exact commands run;
- pass/fail summaries;
- generated artifact list;
- confirmation that export artifacts remain prototype-local;
- confirmation that `public/`, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state were not touched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0070 done.
Report: game.brkovic.ltd/docs/watch-officer/local-web-export-briefing-result-feedback-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state not touched.
Next expected: QA local web export smoke for briefing/result feedback
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not modify `game.brkovic.ltd/public/`.
- Do not modify production files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
