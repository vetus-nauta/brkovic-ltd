# Scenario Schema Validation

**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Task:** `TASK-0019`  
**Status:** Passed

## Files Validated

```text
game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json
game.brkovic.ltd/prototypes/watch-officer-godot/data/schemas/scenario.schema.json
```

## JSON Schema Validation

Command:

```bash
npx --yes ajv-cli@5 validate \
  -s game.brkovic.ltd/prototypes/watch-officer-godot/data/schemas/scenario.schema.json \
  -d game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json \
  --spec=draft2020
```

Result:

```text
safe-water-crossing-target.json valid
```

## Contract Checks

Direct Node contract checks passed:

- `iala_region` is `"A"`.
- `rule_review_status` is `"draft"`.
- VTS is disabled and has zero prompts.
- Exactly one target vessel exists.
- Target vessel crosses from starboard.
- One Region A port lateral mark exists.
- One Region A starboard lateral mark exists.
- Safe corridor exists.
- Shallow zones exist.
- No hard danger polygons exist.
- CPA/TCPA qualitative states are `safe`, `caution`, `danger`, `immediate`.
- Numeric CPA/TCPA debug values are required.
- Replay timing tolerance is `1` fixed tick.
- Input and event logs are required.

## Notes

The validation did not create gameplay logic, Godot scenes, public routes, API endpoints, Captain Ether changes, Nav Desk changes, auth changes, or production config changes.

NPM printed local config/deprecation warnings during one-off `npx` execution; the schema validation still completed successfully.

## Next Step

Create a loader-test planning task before any playable prototype implementation.
