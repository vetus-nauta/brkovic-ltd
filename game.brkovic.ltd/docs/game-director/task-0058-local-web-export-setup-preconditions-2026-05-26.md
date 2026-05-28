# TASK-0058 - Local Web Export Setup Preconditions

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
- `game.brkovic.ltd/docs/watch-officer/export-readiness-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/README.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/project.godot`

## Task

Prepare local-only Godot Web export setup for the Watch Officer prototype.

This task may create export setup files and run a local Web export only inside the prototype directory. It must not modify `public/`, game hub routing, Captain Ether, Nav Desk, auth, production config, or deploy anything.

## Allowed Work

- Verify Godot version and Web export template availability for `4.2.2.stable.official.15073afe3`.
- If Web export templates are missing, report a blocker with exact missing path/version. Do not fake export success.
- Add a minimal Web export preset:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

- Add generated export output path to ignore policy:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

- Update stale prototype README wording so it no longer says the project is scaffold-only.
- Run the full headless regression suite before export.
- If and only if export presets and Web templates are valid, run a local Web export to:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

- Verify generated export artifacts exist only under `exports/web-local/`.
- Create a concise implementation report.

## Required Verification

Before export:

```bash
godot --version
test -f game.brkovic.ltd/prototypes/watch-officer-godot/export_presets.cfg
```

Run all current headless tests:

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

After export, if export runs:

- confirm exported files exist under `exports/web-local/`;
- confirm no generated export files exist in `public/` or `game.brkovic.ltd/public/`;
- confirm project still launches locally from `res://scenes/playable_greybox_scene.tscn`;
- do not deploy, embed, or publish the exported build.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/local-web-export-setup-report.md
```

The report must state one of:

- `local-web-export-created`
- `blocked-missing-web-templates`
- `changes-required`

Record:

- files changed or added;
- Godot version;
- Web template status;
- export preset status;
- ignore policy status;
- exact commands used;
- pass/fail output;
- generated artifact paths if export ran;
- confirmation that `public/`, game hub routing, Captain Ether, Nav Desk, auth, and production config remain untouched.

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
