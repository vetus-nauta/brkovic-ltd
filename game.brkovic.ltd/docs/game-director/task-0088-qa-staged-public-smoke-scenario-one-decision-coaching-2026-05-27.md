# TASK-0088 - QA Staged Public Smoke: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Approved

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-staged-public-decision-2026-05-27.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-scenario-one-decision-coaching-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`

## Task

Run QA staged public candidate smoke for the Watch Officer `Scenario 1 Decision Coaching Pack`.

Use the local repository staged public candidate path:

```text
game.brkovic.ltd/public/play/watch-officer/
```

This is a local QA smoke task only. Do not deploy, upload by FTP, touch production server files, or edit code.

## Check Specifically

- required staged public artifacts exist;
- `.import` files are not present under `public/play/watch-officer/`;
- `.htaccess` preserves COOP/COEP/CORP and MIME handling;
- `/games/watch-officer` remains the hub/brief route;
- `/play/watch-officer/` remains the build route;
- local staged public HTTP/header smoke passes;
- browser loads a non-empty canvas;
- ready state shows briefing;
- Space starts the attempt and hides briefing;
- opening lateral-pair cue is visible in staged public browser flow:

```text
Read the lateral pair. Stay in the marked corridor.
```

- opening cue remains observable during early-running hold window;
- later running can progress to target monitoring cue;
- cue count does not exceed `1` primary cue + `2` chips;
- player-facing surfaces do not show numeric CPA/TCPA or debug fields;
- VTS remains disabled/inactive and no VTS popup appears;
- R reset returns to ready/briefing and clears coaching;
- draft/non-final wording remains visible;
- forbidden final-training claims are absent;
- Captain Ether route remains separate and available if feasible.

## Screenshots

Produce screenshots if feasible:

- Watch Officer brief route;
- ready/briefing;
- immediate after Space with opening cue;
- early-running hold window with opening cue;
- later running target monitoring cue;
- after reset;
- Captain Ether route check if feasible.

If screenshots are not feasible, state why.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md
```

The review must state one of:

- `approved-for-production-deploy-decision`
- `changes-required`
- `blocked`

Record:

- local staged public server/browser method;
- artifact checks;
- header/MIME checks;
- browser smoke checks;
- screenshot paths if produced;
- confirmation that QA did not deploy, upload by FTP, touch production files, edit code, or touch Captain Ether/Nav Desk/router/auth config.

## Required Chat Reply

Use compressed project style:

```text
TASK-0088 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md
Status: <approved-for-production-deploy-decision / changes-required / blocked>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, production files, and FTP not touched.
Next expected: Game Director production deploy decision or changes-required owner
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not touch production server files.
- Do not edit product code.
- Do not touch Captain Ether implementation.
- Do not touch Nav Desk.
- Do not touch router or registry.
- Do not touch auth.
- Do not touch production config.
- Do not add VTS to scenario 1.
- Do not add a new scenario.
- Do not add final maritime training claims.
