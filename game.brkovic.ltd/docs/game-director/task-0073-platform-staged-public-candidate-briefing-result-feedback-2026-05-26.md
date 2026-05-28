# TASK-0073 - Platform Staged Public Candidate Update: Briefing + Result Feedback Pack

**Chat ID:** CHAT-PLATFORM-001  
**Department:** Platform / Local Integration  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Pending TASK-0072

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-briefing-result-staged-public-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-artifact-handoff-briefing-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md`

## Task

Update the local staged public candidate for Watch Officer using the Engine-approved artifact handoff from TASK-0072.

This is a Platform/local integration task. Do not deploy, upload by FTP, or touch the production server.

## Source And Destination

Copy approved artifacts from:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

to:

```text
game.brkovic.ltd/public/play/watch-officer/
```

## Required Work

- Copy only the files approved in the TASK-0072 handoff.
- Preserve the existing path-local `.htaccess` for COOP/COEP/CORP and MIME handling.
- Do not copy `.import` metadata files into `public/play/watch-officer/`.
- Confirm required staged public artifacts exist:
  - `.htaccess`;
  - `index.html`;
  - `index.js`;
  - `index.wasm`;
  - `index.pck`;
  - `index.worker.js`;
  - `index.audio.worklet.js`.
- Confirm Godot artifacts remain isolated to `public/play/watch-officer/`.
- Confirm `/games/watch-officer` remains the hub/brief route and `/play/watch-officer/` remains the build route.

## Required Verification

Run:

```bash
test -f game.brkovic.ltd/public/play/watch-officer/.htaccess
test -f game.brkovic.ltd/public/play/watch-officer/index.html
test -f game.brkovic.ltd/public/play/watch-officer/index.js
test -f game.brkovic.ltd/public/play/watch-officer/index.wasm
test -f game.brkovic.ltd/public/play/watch-officer/index.pck
test -f game.brkovic.ltd/public/play/watch-officer/index.worker.js
test -f game.brkovic.ltd/public/play/watch-officer/index.audio.worklet.js
```

Also verify:

- no `.import` files are present under `public/play/watch-officer/`;
- no final, official, certified, or COLREGS-compliant training claim appears in staged candidate files;
- Captain Ether, Nav Desk, auth, production config, and deploy state remain untouched.

Run a local static/header smoke if feasible and document the command.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/staged-public-briefing-result-feedback-report.md
```

The report must state one of:

- `staged-public-candidate-updated`
- `changes-required`
- `blocked`

Record:

- files copied;
- source and destination;
- whether `.htaccess` was preserved;
- exact checks run;
- pass/fail summaries;
- confirmation that this was not deployed;
- confirmation that Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state remain untouched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0073 done.
Report: game.brkovic.ltd/docs/watch-officer/staged-public-briefing-result-feedback-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- Captain Ether, Nav Desk, router/registry, auth, production config, deploy/FTP not touched.
Next expected: QA staged public candidate smoke
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not touch production server.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify auth.
- Do not modify production config.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
