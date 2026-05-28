# TASK-0064 - QA Watch Officer Production Smoke Review

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
- `game.brkovic.ltd/docs/game-director/watch-officer-production-deploy-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-watch-officer-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-review.md`
- `game.brkovic.ltd/content/game-registry.json`
- `game.brkovic.ltd/public/assets/app.js`

## Task

Run an independent QA public production smoke review for the deployed Watch Officer prototype/draft build.

QA must verify production behavior from public URLs, not from the local staged server.

This task is a QA review only. Do not deploy, upload, change production config, or edit product code.

## Production Targets

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
https://game.brkovic.ltd/games/captain-ether
```

## Check Specifically

- `/games/watch-officer` returns HTTP 200 and remains the brief route;
- the Watch Officer brief route links to `/play/watch-officer/`;
- `/play/watch-officer/` returns HTTP 200 and loads the Godot Web build;
- these files return HTTP 200:
  - `/play/watch-officer/index.html`;
  - `/play/watch-officer/index.js`;
  - `/play/watch-officer/index.wasm`;
  - `/play/watch-officer/index.pck`;
  - `/play/watch-officer/index.worker.js`;
  - `/play/watch-officer/index.audio.worklet.js`;
- production responses include:
  - `Cross-Origin-Opener-Policy: same-origin`;
  - `Cross-Origin-Embedder-Policy: require-corp`;
  - `Cross-Origin-Resource-Policy: same-origin`;
- `.wasm` is served as `application/wasm`;
- `.pck` is served as `application/octet-stream`;
- browser smoke renders a non-empty canvas;
- Space start and R reset work;
- draft/non-final wording remains visible;
- VTS remains inactive;
- no final, official, certified, or COLREGS-compliant training claim appears;
- `/games/captain-ether` still returns HTTP 200 and remains separate.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md
```

The review must state one of:

- `approved-public-prototype-live`
- `changes-required`
- `blocked`

Record:

- public URL checks;
- header and MIME results;
- browser smoke method;
- pass/fail result;
- screenshot paths if screenshots are produced;
- confirmation that QA did not deploy, edit code, touch Captain Ether, Nav Desk, auth, or production config.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not edit production config.
- Do not edit product code.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth.
- Do not remove draft/non-final wording.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
