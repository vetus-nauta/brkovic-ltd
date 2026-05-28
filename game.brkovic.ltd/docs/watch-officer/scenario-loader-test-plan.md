# Watch Officer Scenario Loader Test Plan

**Status:** Draft for Engine and QA review  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0020`  
**Scope:** `game.brkovic.ltd/prototypes/watch-officer-godot/`

## Purpose

This document defines the Godot-side loader test plan for:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json
```

The test plan is for scenario loading and validation only. It does not authorize gameplay implementation, playable scenes, runtime simulation, public routing, Captain Ether changes, Nav Desk changes, auth changes, production config changes, or final maritime training claims.

All maritime content remains draft technical scenario data. `rule_review_status: "draft"` must be visible to QA/dev tooling and must not be presented as final training content.

## Test Target

Scenario file:

```text
res://data/scenarios/safe-water-crossing-target.json
```

Schema file:

```text
res://data/schemas/scenario.schema.json
```

Godot-side loader under future implementation:

```text
res://scripts/core/scenario_loader.gd
```

The loader test should run before any scenario enters runtime simulation.

## Loader Responsibilities

The loader must:

1. Resolve the scenario path deterministically.
2. Read JSON bytes from the expected file.
3. Parse JSON into a dictionary.
4. Validate required fields before runtime objects are created.
5. Reject invalid data with deterministic, QA-readable errors.
6. Return a typed/normalized scenario data object only after all load-blocking checks pass.

The loader must not:

- spawn vessels;
- build playable scenes;
- run movement or CPA calculations;
- infer maritime truth beyond data validation;
- change UI/HUD state;
- convert draft maritime assumptions into final training claims.

## Positive Load Test

### `test_load_safe_water_crossing_target_ok`

Expected result: pass.

Checks:

- Scenario file exists at `res://data/scenarios/safe-water-crossing-target.json`.
- JSON parses without error.
- Top-level required fields exist before runtime:
  - `schema_version`
  - `scenario_id`
  - `scenario_version`
  - `rule_review_status`
  - `training_claim_status`
  - `iala_region`
  - `ownship`
  - `target_vessels`
  - `marks`
  - `geometry`
  - `encounter`
  - `cpa_tcpa`
  - `vts`
  - `replay`
- `scenario_id == "safe-water-crossing-target"`.
- `iala_region == "A"`.
- `rule_review_status == "draft"`.
- `training_claim_status == "draft_not_final_training_content"`.
- `vts.enabled == false`.
- `vts.prompts` exists and is empty.
- Exactly one `ownship` object exists.
- `ownship.type == "motor_yacht"`.
- Exactly one `target_vessels` item exists.
- Target vessel:
  - `type == "power_driven"`
  - `behaviour == "constant_course_speed"`
  - `crossing_from == "starboard"`
  - AIS vector horizon exists and is positive.
- Region A lateral marks:
  - exactly one port lateral mark;
  - port mark has `iala_region == "A"` and `colour == "red"`;
  - exactly one starboard lateral mark;
  - starboard mark has `iala_region == "A"` and `colour == "green"`.
- Geometry:
  - `safe_corridor_polygon` exists and has at least 3 points;
  - `shallow_zone_polygons` exists and has at least 1 polygon;
  - each shallow polygon has at least 3 points;
  - `caution_buffers.safe_corridor_edge_m` exists;
  - `caution_buffers.shallow_warning_m` exists;
  - `finish_gate` exists and has 2 points.
- CPA/TCPA:
  - qualitative states are exactly `safe`, `caution`, `danger`, `immediate`;
  - `numeric_debug_required == true`;
  - thresholds are present and positive;
  - threshold ordering is coherent for scenario risk evaluation:
    `safe_cpa_m > caution_cpa_m > danger_cpa_m > immediate_cpa_m`.
- Replay metadata:
  - `seed` exists and is an integer;
  - `fixed_tick_hz` exists and is a positive integer;
  - `input_log_required == true`;
  - `event_log_required == true`;
  - `event_timing_tolerance_ticks == 1`.

## Negative Loader Tests

Each negative test should mutate a copy of the scenario dictionary in memory. Do not edit the source JSON file.

Expected result for every negative test: load fails before runtime and returns one deterministic error.

| Test id | Mutation | Expected error code |
| --- | --- | --- |
| `missing_file` | Load a non-existent scenario path. | `SCENARIO_FILE_NOT_FOUND` |
| `invalid_json` | Load malformed JSON fixture. | `SCENARIO_JSON_PARSE_ERROR` |
| `missing_iala_region` | Remove `iala_region`. | `SCENARIO_FIELD_REQUIRED` |
| `wrong_iala_region_b` | Set `iala_region` to `"B"`. | `SCENARIO_IALA_REGION_UNSUPPORTED` |
| `wrong_iala_region_lowercase` | Set `iala_region` to `"a"`. | `SCENARIO_IALA_REGION_UNSUPPORTED` |
| `missing_rule_review_status` | Remove `rule_review_status`. | `SCENARIO_FIELD_REQUIRED` |
| `wrong_rule_review_status` | Set `rule_review_status` to `"final"`. | `SCENARIO_RULE_REVIEW_STATUS_INVALID` |
| `vts_enabled` | Set `vts.enabled` to `true`. | `SCENARIO_VTS_MUST_BE_DISABLED` |
| `vts_prompt_present` | Add one item to `vts.prompts`. | `SCENARIO_VTS_PROMPTS_NOT_ALLOWED` |
| `zero_targets` | Set `target_vessels` to `[]`. | `SCENARIO_TARGET_COUNT_INVALID` |
| `two_targets` | Add a second target vessel. | `SCENARIO_TARGET_COUNT_INVALID` |
| `target_not_starboard` | Set `target_vessels[0].crossing_from` to `"port"`. | `SCENARIO_TARGET_CROSSING_SIDE_INVALID` |
| `missing_port_lateral` | Remove the port lateral mark. | `SCENARIO_LATERAL_PAIR_INVALID` |
| `missing_starboard_lateral` | Remove the starboard lateral mark. | `SCENARIO_LATERAL_PAIR_INVALID` |
| `mark_wrong_region` | Set a mark `iala_region` to `"B"`. | `SCENARIO_MARK_REGION_INVALID` |
| `missing_safe_corridor` | Remove `geometry.safe_corridor_polygon`. | `SCENARIO_GEOMETRY_REQUIRED` |
| `missing_shallow_zones` | Remove `geometry.shallow_zone_polygons`. | `SCENARIO_GEOMETRY_REQUIRED` |
| `empty_shallow_zones` | Set `shallow_zone_polygons` to `[]`. | `SCENARIO_GEOMETRY_REQUIRED` |
| `missing_caution_buffers` | Remove `geometry.caution_buffers`. | `SCENARIO_GEOMETRY_REQUIRED` |
| `missing_replay_seed` | Remove `replay.seed`. | `SCENARIO_REPLAY_METADATA_REQUIRED` |
| `missing_fixed_tick` | Remove `replay.fixed_tick_hz`. | `SCENARIO_REPLAY_METADATA_REQUIRED` |
| `wrong_tolerance` | Set `event_timing_tolerance_ticks` to `2`. | `SCENARIO_REPLAY_TOLERANCE_INVALID` |
| `input_log_not_required` | Set `input_log_required` to `false`. | `SCENARIO_REPLAY_METADATA_REQUIRED` |
| `event_log_not_required` | Set `event_log_required` to `false`. | `SCENARIO_REPLAY_METADATA_REQUIRED` |

## Error Contract

Loader errors must be deterministic and QA-readable.

Recommended error object:

```text
ScenarioLoadError:
  code: string
  message_key: string
  scenario_path: string
  json_path: string
  expected: Variant
  actual: Variant
  blocking: true
```

Rules:

- Error code must be stable across runs.
- Error order must be deterministic.
- Report the first blocking error by default.
- Debug mode may include all validation errors, sorted by JSON path.
- `json_path` should use a stable path format, for example `$.target_vessels[0].crossing_from`.
- Messages should use text keys, not hard-coded final training prose.
- Errors must not claim maritime content is approved or official.

Example:

```text
code: SCENARIO_IALA_REGION_UNSUPPORTED
message_key: loader.error.iala_region_unsupported
scenario_path: res://data/scenarios/safe-water-crossing-target.json
json_path: $.iala_region
expected: "A"
actual: "B"
blocking: true
```

## Suggested Godot Test Harness

Use a lightweight Godot test scene or script runner only after implementation is approved. No playable scene is required.

Suggested future files:

```text
res://tests/scenario_loader/test_safe_water_crossing_target.gd
res://tests/fixtures/scenarios/
```

The test runner should:

1. Load the canonical scenario from `res://data/scenarios/safe-water-crossing-target.json`.
2. Assert the positive load contract.
3. Deep-copy the parsed dictionary for each negative mutation.
4. Run loader validation against the mutated dictionary.
5. Assert exact error `code` and `json_path`.
6. Assert no runtime objects are created after validation failure.

## Acceptance Criteria

The loader test plan is satisfied when:

- The canonical scenario loads successfully.
- Required fields are validated before runtime.
- Missing or non-`"A"` `iala_region` is rejected.
- `rule_review_status == "draft"` is accepted but flagged as non-final training content.
- VTS enabled or VTS prompt data is rejected for scenario 1.
- Target count other than one is rejected.
- Target crossing side other than `starboard` is rejected.
- Missing Region A port/starboard lateral pair is rejected.
- Missing safe corridor, shallow zones, or caution buffers is rejected.
- Missing replay seed, fixed tick, input log requirement, event log requirement, or 1-tick tolerance is rejected.
- All failures produce stable QA-readable error objects.

## Out Of Scope

- Gameplay movement.
- CPA/TCPA numeric calculation.
- Warning pipeline runtime.
- AIS vector rendering.
- Playable scenes.
- UI/HUD rendering.
- Public route changes.
- Captain Ether.
- Nav Desk.
- Auth.
- Production config.
- Final maritime training approval.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0020 can move to For Review after this plan is accepted.

The loader test plan keeps the next Engine step narrow: validate `safe-water-crossing-target.json` before runtime, enforce `iala_region: "A"`, draft status, VTS disabled, one starboard-crossing power-driven target, Region A lateral pair, safe/shallow geometry, replay metadata, and deterministic QA-readable loader errors.
