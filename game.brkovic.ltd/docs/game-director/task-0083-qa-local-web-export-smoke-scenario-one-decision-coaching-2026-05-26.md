# TASK-0083 - QA Local Web Export Smoke: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Changes-required

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`

## Task

Run QA local browser smoke for the exported Watch Officer `Scenario 1 Decision Coaching Pack`.

Use only the local export in:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

This is a local QA smoke task only. Do not copy to `public/`, deploy, touch production files, use FTP, or modify code.

## Check Specifically

- required Web export artifacts exist;
- local static server can serve the export;
- `.wasm` and `.pck` MIME are acceptable for local smoke;
- browser loads a non-empty canvas;
- ready state still shows briefing;
- Space starts the attempt and hides briefing;
- running state shows the opening decision coaching cue;
- cue count does not exceed `1` primary cue + `2` chips;
- player-facing surfaces do not show numeric CPA/TCPA or debug fields;
- VTS remains disabled/inactive and no VTS popup appears;
- R reset returns to ready/briefing and clears coaching;
- draft/non-final wording remains visible;
- forbidden final-training claims are absent.

## Screenshots

Produce screenshots if feasible:

- ready/briefing;
- running with opening coaching cue;
- after reset;
- any visible coaching/result state available in normal browser flow.

If screenshots are not feasible, state why.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md
```

The review must state one of:

- `approved-for-staged-public-candidate`
- `changes-required`
- `blocked`

Record:

- local server/browser method;
- artifact checks;
- browser smoke checks;
- screenshots if produced;
- confirmation that QA did not touch public/export source beyond reading, production, Captain Ether, Nav Desk, router/registry, auth, deploy state, or FTP.

## Required Chat Reply

Use compressed project style:

```text
TASK-0083 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md
Status: <approved-for-staged-public-candidate / changes-required / blocked>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP not touched.
Next expected: Game Director staged public candidate decision or changes-required owner
```

## Boundaries

- Do not copy to `public/`.
- Do not deploy.
- Do not use FTP.
- Do not touch production server files.
- Do not touch Captain Ether.
- Do not touch Nav Desk.
- Do not touch router or registry.
- Do not touch auth.
- Do not touch production config.
- Do not add VTS to scenario 1.
- Do not add a new scenario.
- Do not add final maritime training claims.
