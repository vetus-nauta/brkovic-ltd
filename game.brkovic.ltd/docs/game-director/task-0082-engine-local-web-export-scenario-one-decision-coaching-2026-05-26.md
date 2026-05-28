# TASK-0082 - Engine Local Web Export: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Passed

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-local-export-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md`

## Task

Create a prototype-local Godot Web export for the Watch Officer `Scenario 1 Decision Coaching Pack`.

This is a local export task only. Do not copy to `public/`, deploy, touch production files, use FTP, or modify Captain Ether/Nav Desk/router/auth.

## Approved Output Path

Export only to:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Required Checks

Before export:

- run full headless regression;
- confirm TASK-0081 is `approved-for-local-export-decision`;
- confirm no public/production copy is being performed.

After export:

- confirm required Web artifacts exist;
- confirm `.wasm`, `.pck`, `.js`, `.html`, worker, audio worklet, and icon artifacts are present as expected;
- confirm no `.import` files are part of any public handoff;
- do not perform staged public update.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md
```

The report must state one of:

- `passed`
- `changes-required`
- `blocked`

Record:

- Godot version;
- export command/method;
- files generated;
- tests run and pass/fail summaries;
- confirmation that `public/`, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP were not touched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0082 done.
Report: game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP not touched.
Next expected: QA local Web export smoke for Scenario 1 decision coaching
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
