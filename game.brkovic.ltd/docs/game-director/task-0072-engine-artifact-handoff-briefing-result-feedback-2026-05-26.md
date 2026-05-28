# TASK-0072 - Engine Artifact Handoff: Briefing + Result Feedback Pack

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-briefing-result-staged-public-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-briefing-result-feedback-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-briefing-result-feedback-report.md`

## Task

Prepare an Engine handoff manifest for the QA-approved Web export that Platform will use for the staged public candidate update.

This task is Engine-only. Do not copy artifacts into `public/`, deploy, upload by FTP, or touch production files.

## Required Work

Verify the source export path:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Confirm required artifacts exist:

- `index.html`;
- `index.js`;
- `index.wasm`;
- `index.pck`;
- `index.worker.js`;
- `index.audio.worklet.js`;
- icon/png files if present.

Confirm `.import` metadata files are export-side only and must not be copied into `public/`.

Confirm source export is the TASK-0070 / TASK-0071 approved build for the `Briefing + Result Feedback Pack`.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/staged-public-artifact-handoff-briefing-result-feedback-report.md
```

The report must state one of:

- `artifact-handoff-ready`
- `changes-required`
- `blocked`

Record:

- source export path;
- artifact list and file sizes;
- required artifact checks;
- files Platform should copy;
- files Platform must not copy;
- confirmation that Engine did not touch `public/`, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, or FTP.

## Required Chat Reply

Use compressed project style:

```text
TASK-0072 done.
Report: game.brkovic.ltd/docs/watch-officer/staged-public-artifact-handoff-briefing-result-feedback-report.md
Tests:
- artifact_handoff_check: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, deploy/FTP not touched.
Next expected: Platform staged public candidate update
```

## Boundaries

- Do not copy artifacts to `game.brkovic.ltd/public/`.
- Do not deploy.
- Do not upload by FTP.
- Do not touch production server.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth.
- Do not modify production config.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
