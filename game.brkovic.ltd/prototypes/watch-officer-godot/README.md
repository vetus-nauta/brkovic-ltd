# Watch Officer Godot Prototype

**Status:** Local playable greybox prototype. This is not a public web build, production deployment, final art, or final maritime training content.

This directory contains the local Watch Officer Godot prototype for scenario 1, `safe-water-crossing-target`. It exists outside `public/`, outside Captain Ether, and outside platform routing/auth/config code.

## Boundaries

This prototype includes local greybox runtime, HUD, play loop, headless tests, and export setup preconditions. It does not include public web embedding, deployed builds, API endpoints, public routes, production configuration, Captain Ether changes, Nav Desk changes, or auth changes.

## Maritime Status

All maritime content in this scaffold is draft scenario data for technical validation. It is not final training content and must not be presented as official, certified, or final maritime instruction.

Scenario 1 uses `rule_review_status: "draft"` and `iala_region: "A"` by contract. Missing or non-`"A"` region values must be rejected by future Engine validation.

## Engine / UI Contract

Engine owns:

- encounter class;
- player role;
- CPA/TCPA qualitative state;
- warning severity and priority;
- scenario result;
- deterministic replay and QA logs.

UI/HUD renders exported Engine state only. UI must not compute or override maritime rule state from geometry, vessel positions, or mark visuals.

## Current Files

```text
project.godot
export_presets.cfg
data/scenarios/safe-water-crossing-target.json
data/schemas/scenario.schema.json
scripts/core/scenario_loader.gd
scripts/runtime/playable_greybox_controller.gd
scripts/runtime/runtime_step_orchestrator.gd
scripts/ui/hud_snapshot_binder.gd
tests/scenario_loader/test_safe_water_crossing_target.gd
tests/runtime/
scenes/README.md
scenes/playable_greybox_scene.tscn
scripts/README.md
tests/README.md
```

## Local Launch

```bash
godot --path game.brkovic.ltd/prototypes/watch-officer-godot
```

Main scene:

```text
res://scenes/playable_greybox_scene.tscn
```

Controls:

```text
Space / Enter -> start attempt
A / Left      -> turn port
D / Right     -> turn starboard
Q / Down      -> speed down
E / Up        -> speed up
R             -> reset/restart
```

## Export Setup Status

`export_presets.cfg` may define a local-only Web export target named `Web Local`.

Generated export artifacts must stay under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/
```

Do not move exported artifacts into `public/` or production paths without a separate Game Director approval.

## Next Checks

- Run the full headless regression suite before any export.
- Confirm Godot Web export templates match the local Godot version.
- Confirm the scenario remains draft/non-final in any debug UI.
- Confirm Engine loader rejects missing or non-`"A"` `iala_region`.
- Confirm future replay logs include seed, fixed tick rate, input events, event ticks, and numeric CPA/TCPA debug values.
