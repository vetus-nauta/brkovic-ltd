# TASK-0084 - Engine Fix: Opening Cue Visibility And Local Export Rerun

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
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
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md`

## Task

Fix the exported-browser visibility issue for the Scenario 1 opening lateral-pair cue, then rerun the prototype-local Web export.

This is a narrow local Engine/export task. Do not copy to `public/`, deploy, touch production files, use FTP, or modify Captain Ether/Nav Desk/router/auth.

## Blocking QA Finding

TASK-0083 failed this check:

```text
local_web_export_opening_lateral_pair_cue_browser_smoke: 0 passed, 1 failed
```

Expected cue:

```text
Read the lateral pair. Stay in the marked corridor.
```

Observed after Space in exported browser build:

```text
Monitor the crossing target. CPA safe | Draft training.
```

QA observed that immediate and CPU-throttled screenshots had already advanced past the opening cue.

## Required Fix

Make the opening lateral-pair cue visible long enough in the exported browser build for normal player and QA smoke observation.

Acceptance target:

- after Start/Space, opening cue remains visible during an early-running window;
- suggested minimum: first `1-2` seconds or first `20-40` fixed ticks;
- a higher-priority Engine warning/result cue may still override it;
- cue count remains capped to `1` primary cue + `2` chips;
- reset with `R` clears the hold state and returns to ready/briefing;
- no numeric CPA/TCPA or debug fields appear in player-facing surfaces;
- VTS remains disabled/inactive.

## Required Local Export Rerun

After the fix:

- run the focused decision coaching test;
- run full headless regression;
- rerun local Web export only to:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Do not perform staged public update.

## Likely Files

Likely files may include:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/playable_greybox_controller.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/ui/hud_snapshot_binder.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_one_decision_coaching_pack.gd
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md
```

Keep changes narrow.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md
```

The report must state one of:

- `passed`
- `changes-required`
- `blocked`

Record:

- files changed;
- fix approach;
- tests run and pass/fail summaries;
- export command/method;
- generated artifact check;
- confirmation that `public/`, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, production files, and FTP were not touched.

## Required Chat Reply

Use compressed project style:

```text
TASK-0084 done.
Report: game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, production files, and FTP not touched.
Next expected: QA rerun local Web export smoke for opening cue visibility
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
