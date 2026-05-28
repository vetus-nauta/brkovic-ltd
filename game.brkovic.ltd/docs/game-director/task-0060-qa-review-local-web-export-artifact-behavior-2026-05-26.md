# TASK-0060 - QA Review Local Web Export Artifact Behavior

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/export-readiness-review.md`

## Task

Review TASK-0059 from QA side.

Confirm whether the local Web export artifacts behave correctly when served locally before any public integration, web embedding, or production deployment.

This task may run a local-only static server pointed at:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

It must not modify `public/`, `game.brkovic.ltd/public/`, game hub routing, Captain Ether, Nav Desk, auth, production config, or deploy anything.

## Check Specifically

- all prior headless tests from TASK-0059 are documented as passed;
- exported artifacts exist under `exports/web-local/`;
- required artifact classes exist:
  - `index.html`;
  - `index.js`;
  - `index.wasm`;
  - `index.pck`;
- no generated Godot export artifacts exist under `public/` or `game.brkovic.ltd/public/`;
- local static server can serve the exported `index.html`;
- browser can load the Godot Web build locally;
- canvas is non-empty after load;
- keyboard focus and controls work at least for start/reset or one movement input;
- HUD remains readable in browser;
- draft/non-final wording remains visible;
- VTS remains disabled/inactive;
- local restart/reset remains deterministic enough for QA;
- no final maritime training claim appears;
- public integration remains blocked until Game Director assigns a separate task.

## Suggested Local Server

Use any local-only static server that binds to localhost, for example:

```bash
python3 -m http.server 8765 --directory game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local
```

If Python is unavailable, use another local-only static server and document the exact command.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-artifact-review.md
```

The review must state one of:

- `approved-for-game-director-public-integration-decision`
- `changes-required`
- `blocked`

If changes are required, list only blocking changes.

Record:

- local server command;
- browser/smoke method used;
- pass/fail result;
- screenshots path if screenshots are produced;
- confirmation that public paths, hub routing, Captain Ether, Nav Desk, auth, and production config remain untouched.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not implement public web embedding.
- Do not modify `public/`.
- Do not modify `game.brkovic.ltd/public/`.
- Do not modify game hub routing.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
- Do not move exported artifacts into public paths.
