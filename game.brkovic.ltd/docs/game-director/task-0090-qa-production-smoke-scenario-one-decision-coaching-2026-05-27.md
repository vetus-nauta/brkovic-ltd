# TASK-0090 - QA Production Smoke: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-QA-001  
**Department:** Maritime QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-production-deploy-decision-2026-05-27.md`

## Task

Run independent public production QA smoke for the deployed Watch Officer `Scenario 1 Decision Coaching Pack`.

Production targets:

```text
https://game.brkovic.ltd/games/watch-officer
https://game.brkovic.ltd/play/watch-officer/
https://game.brkovic.ltd/games/captain-ether
```

This is verification only. Do not deploy, upload by FTP, edit production files, or change repository product code.

## Required Checks

Verify:

- `https://game.brkovic.ltd/games/watch-officer` returns HTTP `200`;
- `https://game.brkovic.ltd/play/watch-officer/` returns HTTP `200`;
- required Watch Officer Web artifacts return HTTP `200`;
- `.wasm` is served as `application/wasm`;
- `.pck` is served as `application/octet-stream`;
- COOP/COEP/CORP headers are present for the Watch Officer Web route and artifacts where applicable;
- browser smoke renders a non-empty canvas;
- ready state shows briefing;
- Space starts attempt and hides briefing;
- opening lateral-pair cue is visible immediately:

```text
Read the lateral pair. Stay in the marked corridor.
```

- opening cue remains visible during early-running hold window;
- later running progresses to target monitoring cue;
- R reset returns to ready with briefing visible and coaching cleared;
- VTS remains inactive;
- no VTS popup appears;
- draft/non-final wording remains visible;
- no final, official, certified, legally correct, or COLREGS-compliant training claim appears;
- `https://game.brkovic.ltd/games/captain-ether` still opens separately.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-review.md
```

The report must state one of:

- `approved-production-prototype-updated`
- `changes-required`
- `blocked`

Record:

- public URL checks;
- header and MIME checks;
- browser smoke result;
- cue visibility result;
- VTS inactive result;
- forbidden final-claim scan result;
- Captain Ether route separation check;
- screenshot paths if screenshots are produced.

## Required Chat Reply

Use compressed project style:

```text
TASK-0090 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-production-scenario-one-decision-coaching-review.md
Status: <approved-production-prototype-updated|changes-required|blocked>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- No deploy, no FTP, no production file edits, no product code edits, no Captain Ether implementation changes, no Nav Desk changes, no router/registry changes, no auth changes, no production config changes.
Next expected: Game Director production prototype status decision
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not edit production files.
- Do not edit product code.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not touch auth.
- Do not change production config.
- Do not store credentials, cookies, sessions, CSRF, SMTP, `.netrc`, private config, player email, player identity, or other secrets.
- Do not present Watch Officer as official, certified, COLREGS-compliant, legally correct, or final maritime training content.
