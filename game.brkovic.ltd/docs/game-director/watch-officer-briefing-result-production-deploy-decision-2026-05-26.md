# Watch Officer Briefing + Result Feedback Production Deploy Decision

**Decision ID:** GD-20260526-20  
**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for controlled production deploy task  
**Product:** Watch Officer

## Decision

Approve controlled production deployment of the Watch Officer `Briefing + Result Feedback Pack`.

This approval is limited to replacing the Watch Officer Godot Web build artifacts on production with the QA-approved staged public candidate.

Expected production routes remain:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

## Approved Upload Scope

Upload only:

```text
game.brkovic.ltd/public/play/watch-officer/.htaccess
game.brkovic.ltd/public/play/watch-officer/index.apple-touch-icon.png
game.brkovic.ltd/public/play/watch-officer/index.audio.worklet.js
game.brkovic.ltd/public/play/watch-officer/index.html
game.brkovic.ltd/public/play/watch-officer/index.icon.png
game.brkovic.ltd/public/play/watch-officer/index.js
game.brkovic.ltd/public/play/watch-officer/index.pck
game.brkovic.ltd/public/play/watch-officer/index.png
game.brkovic.ltd/public/play/watch-officer/index.wasm
game.brkovic.ltd/public/play/watch-officer/index.worker.js
```

## Not Approved

Do not upload or modify:

- `game.brkovic.ltd/content/game-registry.json`;
- `game.brkovic.ltd/public/assets/app.js`;
- Captain Ether files;
- Nav Desk files;
- auth files;
- production config outside the approved Watch Officer path;
- unrelated public files;
- `.import` metadata files.

This is not final maritime training approval.

## Required Production Verification

After upload, verify:

- `https://game.brkovic.ltd/games/watch-officer` remains the hub/brief route;
- the brief route links to `/play/watch-officer/`;
- `https://game.brkovic.ltd/play/watch-officer/` loads the Godot Web build;
- required files return HTTP 200:
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
- ready state shows briefing;
- Space starts attempt and hides briefing;
- R reset returns to ready with briefing visible;
- VTS remains inactive;
- no VTS popup appears;
- no final, official, certified, or COLREGS-compliant training claim appears;
- `https://game.brkovic.ltd/games/captain-ether` remains separate and available.

## Stop Conditions

Stop and report `blocked` or `changes-required` if:

- production document root is unclear;
- backup cannot be made for overwritten files;
- upload would require changing unrelated production config;
- COOP/COEP/CORP headers are missing after upload;
- `.wasm` or `.pck` MIME handling is wrong after upload;
- production browser smoke fails;
- `/games/watch-officer` is replaced by raw Godot route;
- Captain Ether route breaks;
- Watch Officer loses prototype/draft wording;
- any final maritime training claim appears.

## Credential Rule

Do not store FTP credentials in repository files, reports, screenshots, logs, or chat output.

Use credentials only at runtime in the deployment tool/session.

## Source Basis

- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-briefing-result-feedback-review.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-briefing-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-artifact-handoff-briefing-result-feedback-report.md`
