# TASK-0077 - QA Production Smoke: Briefing + Result Feedback Pack

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Approved

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Production Targets

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
https://game.brkovic.ltd/games/captain-ether
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-briefing-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-briefing-result-feedback-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md`

## Task

Run independent QA public production smoke for the deployed Watch Officer `Briefing + Result Feedback Pack`.

QA must verify production behavior from public URLs. Do not deploy, upload, edit code, touch production config, or copy files.

## Check Specifically

- `https://game.brkovic.ltd/games/watch-officer` returns HTTP 200 and remains the hub/brief route;
- brief route links to `/play/watch-officer/`;
- `https://game.brkovic.ltd/play/watch-officer/` returns HTTP 200 and loads the Godot Web build;
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
- briefing includes objective, situation, controls, IALA Region A, VTS disabled, and draft/non-final wording;
- Space starts attempt and hides briefing;
- R reset returns to ready with briefing visible;
- VTS remains inactive;
- no VTS popup appears;
- no final, official, certified, or COLREGS-compliant training claim appears;
- `https://game.brkovic.ltd/games/captain-ether` remains separate and available.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md
```

The review must state one of:

- `approved-production-prototype-updated`
- `changes-required`
- `blocked`

Record:

- public URL checks;
- header and MIME checks;
- browser smoke method;
- pass/fail summaries;
- screenshot paths if produced;
- confirmation that QA did not deploy, edit code, touch Captain Ether, Nav Desk, router/registry, auth, production config, or deploy state.

## Required Chat Reply

Use compressed project style:

```text
TASK-0077 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- Captain Ether, Nav Desk, router/registry, auth, production config, deploy/FTP not touched.
Next expected: Game Director close production update or changes-required owner
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not touch production server files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth.
- Do not modify production config.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
