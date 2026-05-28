# Watch Officer Decision Coaching Production Deploy Decision

**Decision ID:** GD-20260527-36  
**Date:** 2026-05-27  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for controlled production deploy task  
**Product:** Watch Officer

## Decision

Approve controlled production deployment of the Watch Officer `Scenario 1 Decision Coaching Pack`.

This approval is limited to uploading the QA-approved staged public candidate artifacts from:

```text
game.brkovic.ltd/public/play/watch-officer/
```

to the matching production path for:

```text
https://game.brkovic.ltd/play/watch-officer/
```

## Reason

TASK-0088 QA staged public smoke approved the candidate for production deploy decision.

QA verified:

- required staged artifacts;
- `.import` exclusion;
- `.htaccess` header/MIME rules;
- route preservation;
- HTTP artifacts;
- non-empty browser canvas;
- ready briefing;
- Space start;
- opening lateral-pair cue immediate and hold-window visibility;
- later target monitoring cue;
- reset behavior;
- no forbidden final-training claims;
- Captain Ether route separation.

## Approved Upload Scope

Upload only:

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

from:

```text
game.brkovic.ltd/public/play/watch-officer/
```

Do not upload `.import` files.

## Not Approved

This decision does not approve:

- uploading unrelated files;
- changing Captain Ether;
- changing Nav Desk;
- changing router/registry;
- changing auth;
- changing unrelated production config;
- changing production outside `/play/watch-officer/`;
- adding VTS to scenario 1;
- adding a new scenario;
- adding final, official, certified, or COLREGS-compliant training claims.

## Required Production Verification

After upload verify:

- `https://game.brkovic.ltd/games/watch-officer` opens the brief route;
- `https://game.brkovic.ltd/play/watch-officer/` opens the Godot Web build;
- required files return HTTP `200`;
- COOP/COEP/CORP headers are present;
- `.wasm` MIME is `application/wasm`;
- `.pck` MIME is `application/octet-stream`;
- browser canvas is non-empty;
- ready briefing appears;
- opening lateral-pair cue appears after Space:

```text
Read the lateral pair. Stay in the marked corridor.
```

- opening cue remains visible during early-running hold window;
- later target monitoring cue appears;
- R reset returns to ready/briefing;
- VTS remains inactive and no VTS popup appears;
- forbidden final-training claims are absent;
- `https://game.brkovic.ltd/games/captain-ether` remains separate and available.

## Source Basis

- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-scenario-one-decision-coaching-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`
