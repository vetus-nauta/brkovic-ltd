# TASK-0085 - QA Rerun: Local Web Export Opening Cue Smoke

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
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`

## Task

Rerun QA local browser smoke for the Watch Officer Scenario 1 Decision Coaching Pack after TASK-0084.

Focus on the previously blocking opening lateral-pair cue visibility issue, then confirm the core local Web smoke checks still pass.

Use only the local export in:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

This is a local QA smoke task only. Do not copy to `public/`, deploy, touch production files, use FTP, or modify code.

## Required Checks

Must verify:

- required Web export artifacts exist;
- local static server can serve the export;
- browser loads a non-empty canvas;
- ready state shows briefing;
- Space starts the attempt and hides briefing;
- opening lateral-pair cue is visible in exported browser flow:

```text
Read the lateral pair. Stay in the marked corridor.
```

- cue remains observable during the early-running hold window;
- cue count does not exceed `1` primary cue + `2` chips;
- later running can progress to normal target monitoring cue;
- player-facing surfaces do not show numeric CPA/TCPA or debug fields;
- VTS remains disabled/inactive and no VTS popup appears;
- R reset returns to ready/briefing and clears coaching;
- draft/non-final wording remains visible;
- forbidden final-training claims are absent.

## Screenshots

Produce screenshots if feasible:

- ready/briefing;
- immediate after Space with opening cue;
- early-running hold window with opening cue;
- later running cue after hold window;
- after reset.

If screenshots are not feasible, state why.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md
```

The review must state one of:

- `approved-for-staged-public-candidate`
- `changes-required`
- `blocked`

Record:

- local server/browser method;
- artifact checks;
- browser smoke checks;
- result of the opening cue rerun;
- screenshots if produced;
- confirmation that QA did not touch public/export source beyond reading, production, Captain Ether, Nav Desk, router/registry, auth, deploy state, or FTP.

## Required Chat Reply

Use compressed project style:

```text
TASK-0085 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md
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
