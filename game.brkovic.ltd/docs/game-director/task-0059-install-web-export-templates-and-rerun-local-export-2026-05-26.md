# TASK-0059 - Install Web Export Templates And Rerun Local Export

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md`
- `game.brkovic.ltd/docs/watch-officer/export-readiness-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg`
- `game.brkovic.ltd/prototypes/watch-officer-godot/README.md`

## Task

Install or make available Godot Web export templates matching:

```text
4.2.2.stable.official.15073afe3
```

Then rerun the local-only Watch Officer Web export task.

This task may install local Godot export templates and may create local generated export artifacts only under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

It must not modify `public/`, game hub routing, Captain Ether, Nav Desk, auth, production config, or deploy anything.

## Required Template Check

Verify the expected local template directory:

```text
/home/alexey/.local/share/godot/export_templates/4.2.2.stable/
```

If using another valid Godot template path, document it exactly.

Required template files must support Web export for Godot `4.2.2.stable`.

If templates cannot be installed or verified, stop and report:

```text
blocked-missing-web-templates
```

Do not fake export success.

## Required Export Setup

Confirm existing setup:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

Confirm ignore policy includes:

```text
/game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

## Required Verification Before Export

Run:

```bash
godot --version
test -f game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

Run the full current headless regression suite before export:

```text
scenario_loader_test
runtime_bootstrap_test
fixed_tick_input_log_test
ownship_kinematic_integrator_test
target_kinematic_integrator_test
range_bearing_relative_side_test
scenario_one_encounter_classifier_test
cpa_tcpa_numeric_debug_solver_test
safe_water_geometry_monitor_test
warning_escalation_foundation_test
scenario_result_evaluator_test
runtime_step_orchestrator_test
playable_greybox_scene_pack_test
hud_binding_readability_pack_test
local_play_loop_polish_pack_test
```

## Local Export

If templates and regression pass, run local export only:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --export-release "Web Local" exports/web-local/index.html
```

If Godot requires a different relative output path, keep the generated files inside:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Required Post-Export Checks

If export runs:

- confirm exported `.html`, `.js`, `.wasm`, and `.pck`/data artifacts exist under `exports/web-local/`;
- confirm no generated export files exist under `public/` or `game.brkovic.ltd/public/`;
- do not run a public server;
- do not deploy;
- do not embed in game hub.

## Required Output

Create or update:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md
```

The report must state one of:

- `local-web-export-created`
- `blocked-missing-web-templates`
- `export-failed`

Record:

- template install method or verified template path;
- Godot version;
- exact commands used;
- regression pass/fail output;
- export pass/fail output;
- generated artifact paths if export succeeded;
- confirmation that `public/`, `game.brkovic.ltd/public/`, game hub routing, Captain Ether, Nav Desk, auth, and production config remain untouched.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not deploy to production.
- Do not implement public web embedding.
- Do not modify `public/`.
- Do not modify `game.brkovic.ltd/public/`.
- Do not modify game hub routing.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
- Do not move exported artifacts into public paths.
