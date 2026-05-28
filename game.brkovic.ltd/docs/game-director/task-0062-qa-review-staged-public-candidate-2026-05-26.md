# TASK-0062 - QA Review Watch Officer Staged Public Candidate

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
- `game.brkovic.ltd/docs/game-director/watch-officer-public-integration-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-artifact-review.md`
- `game.brkovic.ltd/content/game-registry.json`
- `game.brkovic.ltd/public/assets/app.js`
- `game.brkovic.ltd/public/play/watch-officer/.htaccess`

## Task

Review the TASK-0061 staged public integration candidate from QA side.

Confirm whether the local repository candidate is ready for Game Director production deployment decision.

This task may run local-only static/browser checks against:

```text
game.brkovic.ltd/public/
```

It must not deploy, upload by FTP, modify production server config, or change product code unless QA creates a separate changes-required report.

## Check Specifically

- `game.brkovic.ltd/public/play/watch-officer/` contains required Godot Web artifacts:
  - `index.html`;
  - `index.js`;
  - `index.wasm`;
  - `index.pck`;
  - `index.worker.js`;
- path-local `.htaccess` declares required COOP/COEP/CORP headers;
- `.wasm` and `.pck` MIME handling is defined or verified by local server smoke;
- local server can serve `/play/watch-officer/index.html`;
- local browser can load the staged candidate path;
- canvas is non-empty after load;
- keyboard smoke still passes for Space start and R reset, or QA documents equivalent visible controls;
- `/games/watch-officer` remains a hub/brief route, not the raw Godot export;
- the brief route links to `/play/watch-officer/`;
- registry marks Watch Officer as prototype/draft, not final training;
- no final maritime training claim appears;
- Captain Ether route still remains stable;
- Nav Desk, auth, FTP/deploy, and production config remain untouched.

## Required Verification

Run a local static/header smoke from `game.brkovic.ltd/public/`.

Document exact command used.

Browser smoke should use the staged path:

```text
http://127.0.0.1:<port>/play/watch-officer/
```

If the local static server cannot apply `.htaccess`, QA must use a local server that injects the same path-local headers and document that limitation clearly.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-review.md
```

The review must state one of:

- `approved-for-game-director-production-deploy-decision`
- `changes-required`
- `blocked`

Record:

- local server command;
- header smoke result;
- browser smoke method;
- pass/fail result;
- screenshots path if screenshots are produced;
- confirmation that `/games/watch-officer` remains brief route;
- confirmation that `/play/watch-officer/` loads the candidate;
- confirmation that Captain Ether, Nav Desk, auth, FTP/deploy, and production config remain untouched.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not upload by FTP.
- Do not modify production server config.
- Do not modify Captain Ether gameplay or APIs.
- Do not modify Nav Desk.
- Do not touch auth.
- Do not remove draft/non-final wording.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
