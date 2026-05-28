# TASK-0061 - Watch Officer Staged Public Integration Candidate

**Chat ID:** CHAT-PLATFORM-001 / CHAT-ENGINE-001  
**Department:** Platform + Engine Integration  
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
- `game.brkovic.ltd/docs/game-director/watch-officer-public-integration-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-artifact-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md`
- `game.brkovic.ltd/content/game-registry.json`
- `game.brkovic.ltd/public/assets/app.js`
- `game.brkovic.ltd/public/.htaccess`

## Task

Create a staged public integration candidate for the Watch Officer Godot Web prototype inside the local repository.

This task may touch `game.brkovic.ltd/public/` because this is the explicit staged integration task. It must not deploy to production, upload by FTP, modify Captain Ether gameplay, modify auth, modify Nav Desk, or touch production config.

## Required Work

- Copy verified local Web export artifacts from:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

to:

```text
game.brkovic.ltd/public/play/watch-officer/
```

- Add path-local server/header support for the Godot Web build:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

- Add MIME support if needed for:

```text
.wasm
.pck
```

- Update `game.brkovic.ltd/content/game-registry.json` so Watch Officer is clearly a prototype/draft product, not final production training.
- Update `game.brkovic.ltd/public/assets/app.js` so `/games/watch-officer` shows a product brief with a clear action opening:

```text
/play/watch-officer/
```

- Keep `/games/watch-officer` as the hub/brief route. Do not replace it with the raw Godot build path.
- Preserve draft/non-final wording.
- Run local checks.
- Create a concise implementation report.

## Required Verification

Run at minimum:

```bash
test -f game.brkovic.ltd/public/play/watch-officer/index.html
test -f game.brkovic.ltd/public/play/watch-officer/index.js
test -f game.brkovic.ltd/public/play/watch-officer/index.wasm
test -f game.brkovic.ltd/public/play/watch-officer/index.pck
```

Run a local static/header smoke if feasible and document exact command.

Verify:

- `/games/watch-officer` remains a hub/brief route;
- brief route links to `/play/watch-officer/`;
- Godot artifacts are only under `game.brkovic.ltd/public/play/watch-officer/`;
- Captain Ether routes and APIs are untouched;
- Nav Desk is untouched;
- auth and production config are untouched;
- no final maritime training claims are introduced.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md
```

The report must state one of:

- `staged-public-candidate-created`
- `changes-required`
- `blocked`

Record:

- files changed or added;
- copy source and destination;
- header strategy;
- exact commands used;
- pass/fail output;
- known remaining blockers before production deployment;
- confirmation that FTP/deploy, Captain Ether, Nav Desk, auth, and production config remain untouched.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not upload by FTP.
- Do not modify Captain Ether gameplay.
- Do not modify Captain Ether APIs.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not remove draft/non-final wording.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
