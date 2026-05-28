# TASK-0063 - Controlled Production Deploy Watch Officer Prototype

**Chat ID:** CHAT-PLATFORM-001  
**Department:** Platform / Deployment  
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
- `game.brkovic.ltd/docs/game-director/watch-officer-production-deploy-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-review.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md`
- `game.brkovic.ltd/content/game-registry.json`
- `game.brkovic.ltd/public/assets/app.js`
- `game.brkovic.ltd/public/play/watch-officer/.htaccess`

## Task

Deploy the approved Watch Officer prototype/draft candidate to production `game.brkovic.ltd`.

This is a controlled production deploy of the already approved staged candidate. It is not final maritime training release approval.

## Approved Upload Scope

Upload only:

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js
game.brkovic.ltd/public/play/watch-officer/
```

The Watch Officer production Godot path must become:

```text
https://game.brkovic.ltd/play/watch-officer/
```

The Watch Officer brief route must remain:

```text
https://game.brkovic.ltd/games/watch-officer
```

## Required Before Upload

- Confirm the production document root for `game.brkovic.ltd`.
- Do not guess remote paths.
- Backup any remote files that will be overwritten.
- Do not store FTP credentials in repository files, docs, logs, screenshots, or reports.
- Do not upload unrelated local changes.

## Required Public Verification After Upload

Verify:

- `https://game.brkovic.ltd/games/watch-officer` opens the brief route;
- brief route links to `/play/watch-officer/`;
- `https://game.brkovic.ltd/play/watch-officer/` opens the Godot Web build;
- these files return HTTP 200:
  - `/play/watch-officer/index.html`;
  - `/play/watch-officer/index.js`;
  - `/play/watch-officer/index.wasm`;
  - `/play/watch-officer/index.pck`;
  - `/play/watch-officer/index.worker.js`;
  - `/play/watch-officer/index.audio.worklet.js`;
- `/play/watch-officer/` responses include:
  - `Cross-Origin-Opener-Policy: same-origin`;
  - `Cross-Origin-Embedder-Policy: require-corp`;
  - `Cross-Origin-Resource-Policy: same-origin`;
- `.wasm` is served as `application/wasm`;
- `.pck` is served as `application/octet-stream`;
- browser smoke renders a non-empty canvas;
- Space start and R reset work;
- draft/non-final wording remains visible;
- VTS remains inactive;
- `https://game.brkovic.ltd/games/captain-ether` still opens Captain Ether;
- Nav Desk, auth, and unrelated production config are untouched.

## Stop Conditions

Stop and report `blocked` or `changes-required` if:

- production document root is unclear;
- upload would require changing unrelated production config;
- COOP/COEP/CORP headers are missing after upload;
- `.wasm` or `.pck` MIME handling is wrong after upload;
- production browser smoke fails;
- Captain Ether route breaks;
- Watch Officer loses prototype/draft wording;
- any final maritime training claim appears.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/production-deploy-watch-officer-report.md
```

The report must state one of:

- `production-prototype-deployed`
- `changes-required`
- `blocked`

Record:

- remote target path, without credentials;
- exact files uploaded;
- backup method used;
- public URL checks;
- header and MIME results;
- browser smoke result;
- Captain Ether route check;
- confirmation that Nav Desk, auth, and unrelated production config remain untouched.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy unrelated files.
- Do not modify Captain Ether gameplay or APIs.
- Do not modify Nav Desk.
- Do not touch auth.
- Do not store credentials.
- Do not remove draft/non-final wording.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
