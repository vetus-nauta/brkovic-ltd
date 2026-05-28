# Watch Officer Production Deploy Decision

**Decision ID:** GD-20260526-07  
**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for controlled production deploy task

## Decision

Approve a controlled production deployment task for the Watch Officer staged public candidate.

This approval is limited to publishing the already verified prototype/draft candidate so it can be opened from the production `game.brkovic.ltd` platform.

Expected production routes:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
```

## Not Approved

This is not approval for:

- final maritime training content;
- official or certified training claims;
- broad production refactor;
- auth changes;
- Captain Ether changes;
- Nav Desk changes;
- deployment of unrelated files;
- deletion of existing production content outside the approved Watch Officer paths.

## Approved Production Scope

Deploy only the staged candidate produced by TASK-0061 and approved by TASK-0062:

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js
game.brkovic.ltd/public/play/watch-officer/
```

The deploy task may upload:

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

## Required Public Verification

After upload, verify:

- `/games/watch-officer` opens the product brief route;
- the product brief links to `/play/watch-officer/`;
- `/play/watch-officer/` serves the Godot Web build;
- `/play/watch-officer/index.html`, `.wasm`, `.pck`, worker, and worklet return HTTP 200;
- `Cross-Origin-Opener-Policy: same-origin` is present for `/play/watch-officer/`;
- `Cross-Origin-Embedder-Policy: require-corp` is present for `/play/watch-officer/`;
- `Cross-Origin-Resource-Policy: same-origin` is present for `/play/watch-officer/`;
- `.wasm` is served as `application/wasm`;
- `.pck` is served as `application/octet-stream`;
- browser smoke renders a non-empty canvas;
- Space start and R reset still work;
- draft/non-final wording remains visible;
- VTS remains inactive;
- Captain Ether remains available at `/games/captain-ether`.

## Stop Conditions

Stop and report `blocked` or `changes-required` if:

- production server does not apply COOP/COEP/CORP headers;
- `.wasm` or `.pck` MIME handling is wrong;
- Godot Web build fails to render on the production domain;
- `/games/watch-officer` is replaced by the raw Godot route;
- Captain Ether route breaks;
- final maritime training wording appears;
- deploy requires changing auth, Nav Desk, or unrelated production config.

## Credential Rule

Do not store FTP credentials in the repository, docs, screenshots, logs, or reports.

Use credentials only at runtime in the deployment tool/session.

## Source Basis

- `game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-review.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-public-integration-decision-2026-05-26.md`
