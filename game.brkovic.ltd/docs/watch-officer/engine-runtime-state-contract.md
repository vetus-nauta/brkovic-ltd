# Watch Officer Engine Runtime State Contract

**Status:** Draft contract for Engine, UI/HUD, and QA review  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0024`  
**Scenario:** `safe-water-crossing-target`

## Purpose

This document defines the Engine runtime state contract for Watch Officer scenario 1.

It is a contract document only. It does not implement gameplay, create playable scenes, change the scenario loader, change public routes, modify Captain Ether, Nav Desk, auth, production config, or make final maritime training claims.

All maritime logic remains draft scenario training logic until reviewed and approved. Runtime and UI may expose `rule_review_status: "draft"` and `training_claim_status: "draft_not_final_training_content"`, but must not present the scenario as official, certified, or final maritime instruction.

## Current Verification Gate

The scenario loader implementation exists and has local JSON/schema validation, but the Godot headless loader test has not passed in this environment because the Godot CLI is unavailable.

Blocking command:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Current blocker:

```text
Godot 4.2+ CLI is not installed or not available in PATH.
```

Until that headless loader test passes, the runtime state below is a design contract only. It must not be treated as implemented gameplay.

## Sources Reviewed

- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-test-plan.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/core/scenario_loader.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json`

## Loader Output Contract

The current loader contract is:

```text
ScenarioLoader.load_scenario(path) -> Dictionary
ScenarioLoader.validate_scenario(data, path) -> Dictionary
ScenarioLoader.last_error -> Dictionary
```

On success, the loader returns a deep copy of validated scenario data.

On failure, the loader returns an empty dictionary and sets `last_error`:

```text
code: string
message_key: string
scenario_path: string
json_path: string
expected: Variant
actual: Variant
blocking: true
```

Runtime must not start if loader output is empty or `last_error` is not empty.

## Loaded Scenario Data Consumed By Runtime

Runtime may consume only scenario data that has passed loader validation.

### Identity And Review

| Field | Runtime use |
| --- | --- |
| `schema_version` | Compatibility guard for scenario parsing. |
| `scenario_id` | Run identity, replay identity, event log identity. |
| `scenario_version` | Replay compatibility and QA bug reports. |
| `title_key` | Export to UI/HUD as static display key. |
| `briefing_key` | Export to UI/HUD as static display key. |
| `rule_review_status` | Export to UI/HUD/QA; must remain `draft` for scenario 1. |
| `training_claim_status` | Export to UI/HUD/QA; blocks final training claims. |
| `iala_region` | Must be `"A"`; exported as scenario context. |

### World And Camera

| Field | Runtime use |
| --- | --- |
| `world.units` | Interpret positions and distances as meters. |
| `world.origin` | Reference for world coordinates. |
| `world.heading_reference` | Interpret headings as degrees true. |
| `world.bounds` | QA/debug boundary and optional camera clamp. |
| `camera.mode` | Must be `heading_up`. |
| `camera.ownship_screen_anchor` | Lower-third camera anchor target. |
| `camera.forward_view_ratio` | Forward framing target for HUD readability. |
| `camera.zoom_min`, `camera.zoom_max` | Camera zoom guardrails, not gameplay difficulty. |

### Ownship Configuration

| Field | Runtime use |
| --- | --- |
| `ownship.id` | Runtime entity id. |
| `ownship.type` | Must remain `motor_yacht`; exported to UI/debug. |
| `ownship.spawn_position` | Initial runtime position at tick 0. |
| `ownship.spawn_heading_deg` | Initial runtime heading at tick 0. |
| `ownship.collision_radius_m` | Vessel collision checks and warning rings. |
| `ownship.grounding_radius_m` | Shallow/grounding geometry checks. |
| `ownship.speed_levels` | Discrete movement speeds. |
| `ownship.initial_speed_level` | Initial movement state. |
| `ownship.turn_rate_deg_per_sec` | Speed-dependent heading change limits. |
| `ownship.speed_step_time_sec` | Deterministic speed transition timing. |

### Target Vessel Configuration

Scenario 1 contains exactly one target vessel.

| Field | Runtime use |
| --- | --- |
| `target_vessels[0].id` | Runtime target id and AIS label anchor. |
| `target_vessels[0].type` | Must be `power_driven`; exported for QA/debug. |
| `target_vessels[0].spawn_position` | Target initial position at tick 0. |
| `target_vessels[0].spawn_heading_deg` | Target initial heading at tick 0. |
| `target_vessels[0].speed_mps` | Constant target speed. |
| `target_vessels[0].collision_radius_m` | Collision checks. |
| `target_vessels[0].behaviour` | Must be `constant_course_speed`. |
| `target_vessels[0].crossing_from` | Must be `starboard`; supports initial role validation. |
| `target_vessels[0].ais.label` | UI/HUD label. |
| `target_vessels[0].ais.vector_horizon_sec` | AIS vector projection horizon. |

### Marks And Geometry

| Field | Runtime use |
| --- | --- |
| `marks` | Export Region A lateral pair to UI; Engine uses ids for QA anchors only. |
| `geometry.safe_corridor_polygon` | Engine truth for intended navigable corridor. |
| `geometry.shallow_zone_polygons` | Engine truth for shallow risk/grounding state. |
| `geometry.danger_polygons` | Empty in scenario 1; no hard danger polygon runtime logic should be required for scenario 1. |
| `geometry.caution_buffers.safe_corridor_edge_m` | Corridor edge caution threshold. |
| `geometry.caution_buffers.shallow_warning_m` | Shallow approach warning threshold. |
| `geometry.caution_buffers.danger_warning_m` | Zero in scenario 1. |
| `geometry.finish_gate` | Success boundary, subject to result checks. |

Marks are visual evidence. Geometry is Engine truth. Runtime must not infer safe water from mark colour alone.

### Encounter, CPA/TCPA, VTS, Scoring, Replay

| Field | Runtime use |
| --- | --- |
| `encounter.expected_initial_class` | QA check for initial classifier output. |
| `encounter.expected_player_role` | QA check for initial player role. |
| `encounter.classifier_thresholds` | Scenario-local draft classifier thresholds. |
| `cpa_tcpa.qualitative_states` | Allowed risk states: `safe`, `caution`, `danger`, `immediate`. |
| `cpa_tcpa.*_cpa_m` | Scenario-local draft thresholds for Engine CPA state. |
| `cpa_tcpa.horizon_sec` | CPA calculation horizon. |
| `cpa_tcpa.active_tcpa_max_sec` | Active TCPA window for warning decisions. |
| `cpa_tcpa.numeric_debug_required` | Requires numeric CPA/TCPA in logs/debug. |
| `vts.enabled` | Must be `false`; runtime VTS state remains inactive. |
| `vts.prompts` | Must be empty in scenario 1. |
| `scoring.success_requires` | Result guardrails. |
| `scoring.reference_track` | QA/debug reference only, not autopilot. |
| `scoring.expected_action_windows` | QA/debug timing windows for draft scenario assumptions. |
| `replay.seed` | Deterministic run seed. |
| `replay.fixed_tick_hz` | Fixed simulation tick rate. |
| `replay.event_timing_tolerance_ticks` | QA replay tolerance, fixed at 1 tick. |
| `replay.input_log_required` | Requires input log support. |
| `replay.event_log_required` | Requires event log support. |

## Engine-Owned Runtime State

Engine owns all rule-facing, risk-facing, and result-facing runtime state.

### Root Runtime State

```text
runtime:
  run_id: string
  engine_version: string
  tick: int
  time_sec: float
  fixed_tick_hz: int
  scenario_state: preload | load_failed | loaded | running | paused_debug | complete
  scenario_result: ScenarioResult
  draft_training: true
```

### Ownship Runtime State

```text
ownship:
  id: "ownship"
  position_m: [float, float]
  heading_deg: float
  speed_level: stop | slow | cruise | fast
  speed_mps: float
  turn_state: port | starboard | none
  turn_rate_deg_per_sec: float
  speed_transition_state: stable | accelerating | decelerating
  projected_vector_end_m: [float, float]
  collision_radius_m: float
  grounding_radius_m: float
  grounding_state: clear | warning | grounded
  recent_track_m: [[float, float]]
```

### Target Runtime State

```text
target:
  id: string
  position_m: [float, float]
  heading_deg: float
  speed_mps: float
  collision_radius_m: float
  behaviour: constant_course_speed
  range_m: float
  bearing_true_deg: float
  relative_bearing_deg: float
  relative_side: port | starboard | ahead | astern | ambiguous
  vector_horizon_sec: float
  vector_end_position_m: [float, float]
  visible: bool
```

### Encounter Runtime State

```text
encounter:
  class: crossing | head_on | overtaking | none | ambiguous
  player_role: give_way | stand_on | overtaking | overtaken | caution | none
  confidence: float
  expected_initial_class: crossing
  expected_player_role: give_way
  initial_match: bool
  draft_training_logic: true
```

The classifier output is a scenario assumption for prototype validation, not a final COLREGS training claim.

### CPA/TCPA Runtime State

```text
cpa_tcpa:
  state: safe | caution | danger | immediate
  previous_state: safe | caution | danger | immediate
  cpa_m_debug: float
  tcpa_sec_debug: float
  active: bool
  threshold_set_id: safe-water-crossing-target:0.1.0
  closest_point_ownship_m: [float, float]
  closest_point_target_m: [float, float]
  changed_tick: int
```

Numeric CPA/TCPA fields are required for QA/debug logs even if player HUD remains qualitative.

### Geometry Runtime State

```text
safe_water:
  state: in_corridor | corridor_buffer | shallow_buffer | shallow | grounded
  previous_state: in_corridor | corridor_buffer | shallow_buffer | shallow | grounded
  active_zone_id: string
  nearest_boundary_m_debug: float
  safe_corridor_inside: bool
  shallow_zone_inside: bool
  finish_gate_crossed: bool
```

Scenario 1 has no active hard danger polygon. `danger` and `danger_buffer` are reserved for later scenarios or QA-approved controlled fixtures.

### VTS Runtime State

Scenario 1 VTS state is fixed inactive:

```text
vts:
  enabled: false
  state: inactive
  prompt_id: ""
  options: []
  remaining_sec: 0.0
  selected_option_id: ""
  result: none
  blocks_scenario_completion: false
```

Runtime must not create a VTS prompt for scenario 1.

## Engine Export To UI/HUD

UI/HUD receives exported state only. UI/HUD must not compute or override encounter class, player role, CPA/TCPA state, warning severity, or scenario result.

### Static Scenario Export

```text
scenario_static:
  scenario_id
  scenario_version
  title_key
  briefing_key
  rule_review_status
  training_claim_status
  iala_region
  world.units
  camera.mode
  camera.ownship_screen_anchor
  camera.forward_view_ratio
  marks[]
  geometry.safe_corridor_polygon
  geometry.shallow_zone_polygons
  geometry.danger_polygons
  geometry.caution_buffers
  geometry.finish_gate
  vts.enabled
```

### Runtime Snapshot Export

```text
runtime_snapshot:
  tick
  time_sec
  scenario_state
  scenario_result
  draft_training
  camera:
    mode
    ownship_anchor_target
    ownship_anchor_actual_debug
    forward_view_ratio
    north_angle_deg
  ownship:
    position_m
    heading_deg
    speed_level
    speed_mps
    turn_state
    turn_rate_deg_per_sec
    projected_vector_end_m
    collision_radius_m
    grounding_state
    recent_track_m
  target:
    id
    position_m
    heading_deg
    speed_mps
    range_m
    bearing_true_deg
    relative_bearing_deg
    relative_side
    vector_end_position_m
    visible
  encounter:
    class
    player_role
    confidence
    draft_training_logic
  cpa_tcpa:
    state
    cpa_m_debug
    tcpa_sec_debug
    active
  safe_water:
    state
    active_zone_id
    nearest_boundary_m_debug
    finish_gate_crossed
  warnings:
    primary_warning
    secondary_warnings
  vts:
    enabled
    state
    prompt_id
    options
    remaining_sec
    selected_option_id
    result
  qa:
    replay_recording
    seed
    fixed_tick_hz
    event_timing_tolerance_ticks
    validation_errors
```

UI may hide QA/debug fields in player-facing mode, but Engine must keep them available for QA builds.

## Warning State Model

### Severity

```text
safe
caution
danger
immediate
```

`safe` is a baseline state and should not normally appear as a warning item. Warning queue items start at `caution`.

### Sources

```text
geometry
cpa_tcpa
encounter
movement
vts
result
loader
qa
```

### Priority Order

1. `result` collision or grounding.
2. `cpa_tcpa` immediate or danger.
3. `geometry` shallow or leaving safe corridor.
4. `movement` late/unclear action or unsafe speed.
5. `encounter` role/action mismatch.
6. `vts` reserved for later scenarios; inactive in scenario 1.
7. `qa` or `loader` debug-only blocking state.

### Warning Item

```text
warning:
  id: string
  state: active | cleared
  severity: caution | danger | immediate
  priority: int
  text_key: string
  source: geometry | cpa_tcpa | encounter | movement | vts | result | loader | qa
  related_entity_id: string
  spatial_anchor_m: [float, float] | null
  started_tick: int
  updated_tick: int
  cleared_tick: int | null
  debug_payload: Dictionary
```

Warning text keys must remain concise and non-authoritative while scenario content is draft. Examples:

```text
warning.cpa_risk
warning.shallow_water
warning.leaving_safe_water
warning.late_alteration
warning.collision
warning.grounding
```

## Scenario Result State Model

### Result States

```text
not_started
load_blocked
ready
running
success
warning_outcome
unsafe_manoeuvre
near_miss
grounding
collision
restart_requested
restart_ready
```

### Result Rules For Scenario 1

`success` requires:

- safe corridor maintained or recovered according to scenario scoring;
- no grounding;
- no collision;
- CPA state safe or recovered before finish;
- finish gate crossed;
- no critical warning active at finish;
- VTS ignored for scoring because `vts.enabled == false`.

Failure or serious result states:

| State | Trigger summary |
| --- | --- |
| `grounding` | Ownship grounding radius enters grounding condition in shallow geometry. |
| `collision` | Ownship and target collision radii overlap. |
| `near_miss` | CPA/TCPA reaches serious threshold without collision. |
| `unsafe_manoeuvre` | Draft scenario action window or role expectation is seriously violated. |
| `warning_outcome` | Scenario completes with non-critical warnings that require captain note. |
| `load_blocked` | Loader failed or validation error exists before runtime. |

These are prototype result classifications, not final maritime assessment labels.

## Replay And Event Log Contract

Every event must include:

```text
run_id: string
scenario_id: string
scenario_version: string
engine_version: string
seed: int
fixed_tick_hz: int
tick: int
time_sec: float
type: string
payload: Dictionary
```

Event ordering must be stable for the same seed, fixed tick rate, scenario version, and input log.

### Required Event Names

| Event name | Required payload |
| --- | --- |
| `scenario_load_started` | `scenario_path` |
| `scenario_loaded` | `iala_region`, `rule_review_status`, `training_claim_status`, `target_count`, `mark_count`, `vts_enabled` |
| `scenario_load_failed` | loader error object: `code`, `message_key`, `json_path`, `expected`, `actual`, `blocking` |
| `runtime_initialized` | `ownship_spawn`, `ownship_heading_deg`, `target_spawn`, `target_heading_deg`, `fixed_tick_hz` |
| `fixed_tick_started` | `tick`, `time_sec` |
| `input_recorded` | `input_type`, `input_value`, `input_source` |
| `ownship_state_changed` | `position_m`, `heading_deg`, `speed_level`, `turn_state` |
| `target_state_sampled` | `target_id`, `position_m`, `heading_deg`, `speed_mps`, `vector_end_position_m` |
| `encounter_state_changed` | `from_class`, `to_class`, `from_role`, `to_role`, `confidence` |
| `encounter_initial_mismatch` | `expected_initial_class`, `actual_class`, `expected_player_role`, `actual_player_role` |
| `cpa_state_changed` | `from_state`, `to_state`, `cpa_m`, `tcpa_sec`, `active` |
| `geometry_state_changed` | `from_state`, `to_state`, `active_zone_id`, `nearest_boundary_m`, `grounding_radius_m` |
| `warning_raised` | warning item |
| `warning_updated` | warning item |
| `warning_cleared` | warning item |
| `scenario_result_changed` | `from_result`, `to_result`, `reason`, `active_warning_ids` |
| `finish_gate_crossed` | `ownship_position_m`, `scenario_result_candidate` |
| `replay_recording_started` | `seed`, `fixed_tick_hz`, `event_timing_tolerance_ticks` |
| `replay_input_log_finalized` | `input_count`, `last_input_tick` |
| `event_log_finalized` | `event_count`, `final_result` |

VTS events are not required for scenario 1 because VTS is disabled. When VTS is enabled in a later scenario, add:

```text
vts_prompt_opened
vts_answer_recorded
vts_timed_out
vts_result_changed
```

## Deterministic Fixed-Tick Assumptions

Scenario 1 runtime must use:

```text
fixed_tick_hz = scenario.replay.fixed_tick_hz
seed = scenario.replay.seed
event_timing_tolerance_ticks = 1
```

Rules:

- Tick 0 is the first post-load initialized state.
- Runtime logic advances only on fixed ticks.
- Rendering may interpolate, but cannot change simulation truth.
- Input is sampled into tick-indexed commands before simulation update.
- Update order per tick must be stable:
  1. apply queued input;
  2. update ownship movement;
  3. update target movement;
  4. evaluate geometry;
  5. classify encounter;
  6. solve CPA/TCPA;
  7. update warnings;
  8. update scenario result;
  9. emit snapshot and log events.
- No random traffic, weather, current, wind, hidden drift, or autonomous target avoidance is allowed in scenario 1.
- Any use of randomness must be derived from the scenario seed and logged. Scenario 1 should not need randomness.
- Replays are accepted only if scenario id/version, engine version compatibility, seed, fixed tick rate, final result, and key event timing match within 1 tick.

## Out Of Scope Until Godot Headless Loader Test Passes

The following must remain out of scope until the Godot headless loader test passes:

- Gameplay movement implementation.
- Runtime scene creation.
- Playable scenes.
- CPA/TCPA solver implementation.
- Encounter classifier implementation.
- Warning pipeline implementation.
- Scenario result implementation.
- Replay recorder/player implementation.
- HUD bridge implementation.
- Visual mark rendering.
- Camera implementation.
- Mobile controls.
- VTS runtime behaviour beyond fixed inactive state for scenario 1.
- Public route, hub, or deploy changes.
- Captain Ether changes.
- Nav Desk changes.
- Auth changes.
- Production config changes.
- Final maritime training claims.

## Blocking Contract Issues

No blocking loader contract issue was found during this document pass.

Known blocker remains environmental:

```text
Godot 4.2+ CLI is not installed or not available in PATH.
```

## Report For Project Lead

TASK-0024 can move to For Review after this contract is accepted.

The next safe Engine step is still to run the Godot headless loader test. After it passes, runtime work can start from this contract without changing the approved boundaries: Engine owns encounter class, player role, CPA/TCPA state, warnings, scenario result, replay logs, and deterministic fixed-tick state; UI/HUD renders exported state only.
