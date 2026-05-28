# TASK-0089 - Controlled Production Deploy: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-PLATFORM-DEPLOY-001  
**Department:** Platform Deployment Officer  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Passed

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-platform-deploy-onboarding.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-production-deploy-decision-2026-05-27.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-scenario-one-decision-coaching-report.md`

## Task

Deploy the approved Watch Officer `Scenario 1 Decision Coaching Pack` staged public candidate to production.

This is a controlled production deployment of Watch Officer prototype/draft build artifacts only.

## Approved Upload Scope

Upload only files from:

```text
game.brkovic.ltd/public/play/watch-officer/
```

to the matching production path for:

```text
https://game.brkovic.ltd/play/watch-officer/
```

Approved files:

```text
.htaccess
index.apple-touch-icon.png
index.audio.worklet.js
index.html
index.icon.png
index.js
index.pck
index.png
index.wasm
index.worker.js
```

Do not upload `.import` files.

## Required Before Upload

- Confirm production document root for `game.brkovic.ltd`.
- Do not guess remote paths.
- Backup every remote file that will be overwritten.
- Do not store FTP credentials in repository files, docs, logs, screenshots, or chat output.
- Do not upload unrelated local changes.

## Required Production Verification

Verify after upload:

- `https://game.brkovic.ltd/games/watch-officer` opens the brief route;
- brief route links to `/play/watch-officer/`;
- `https://game.brkovic.ltd/play/watch-officer/` opens the Godot Web build;
- these files return HTTP `200`:
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
- ready state shows briefing;
- Space starts attempt and hides briefing;
- opening lateral-pair cue is visible:

```text
Read the lateral pair. Stay in the marked corridor.
```

- opening cue remains visible during early-running hold window;
- later running progresses to target monitoring cue;
- R reset returns to ready with briefing visible and coaching cleared;
- VTS remains inactive;
- no VTS popup appears;
- no final, official, certified, or COLREGS-compliant training claim appears;
- `https://game.brkovic.ltd/games/captain-ether` still opens Captain Ether.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md
```

The report must state one of:

- `production-prototype-updated`
- `changes-required`
- `blocked`

Record:

- remote target path without credentials;
- exact files uploaded;
- backup method used;
- public URL checks;
- header and MIME results;
- browser smoke result;
- Captain Ether route check;
- confirmation that Nav Desk, auth, router/registry, unrelated production config, unrelated files, and FTP secrets remain untouched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0089 done.
Report: game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- Captain Ether, Nav Desk, router/registry, auth, unrelated production config, and unrelated files not touched.
Next expected: QA public production smoke
```

## Boundaries

- Do not deploy unrelated files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not touch auth.
- Do not change unrelated production config.
- Do not store credentials.
- Do not upload `.import` files.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not remove draft/non-final wording.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
