# Watch Officer Engine / Godot Prototype Report

**Status:** Draft for Game Director, UI/HUD, Gameplay, and QA review  
**Owner Chat:** Engine / Godot Architect - Watch Officer  
**Date:** 2026-05-26  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`  
**Related task:** `TASK-0007`

## Purpose

This report defines the proposed Godot prototype architecture for the Watch Officer MVP.

It is an architecture and runtime data contract only. It does not create playable Watch Officer code, Godot files, API endpoints, platform routes, production config, Captain Ether changes, Nav Desk changes, or authentication changes.

The prototype must prove one compact heading-up maritime decision scenario before any broader simulation work is approved.

## Prototype Position

The MVP Engine should optimize for deterministic, readable scenario logic rather than physical realism.

Required prototype traits:

1. Scenario-based, not open-world.
2. Top-down heading-up camera.
3. Ownship anchored in the lower third.
4. One player motor yacht.
5. One target vessel.
6. IALA Region A only.
7. Explicit safe-water, shallow, and danger geometry.
8. Qualitative CPA/TCPA states.
9. Deterministic replay/logging for QA.
10. Runtime state export for UI/HUD without asking UI to decide maritime rules.

The Engine may use simplified mathematics, but every rule-facing output must be deterministic, inspectable, and backed by scenario data.

## Proposed Godot Project Structure

After prototype approval, create the Godot project outside the public web runtime and outside Captain Ether.

Recommended future location:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/
```

Recommended structure:

```text
watch-officer-godot/
  project.godot
  README.md
  addons/
  assets/
    vessels/
    marks/
    water/
    ui/
  data/
    scenarios/
      safe-water-crossing-target.json
    schemas/
      scenario.schema.json
  scenes/
    boot/
      PrototypeBoot.tscn
    game/
      ScenarioRunner.tscn
      World2D.tscn
      Ownship.tscn
      TargetVessel.tscn
      Mark.tscn
      ZoneOverlay.tscn
      FinishGate.tscn
    camera/
      HeadingUpCamera.tscn
    ui/
      HudBridge.tscn
      DebugOverlay.tscn
      ReplayPanel.tscn
  scripts/
    core/
      scenario_loader.gd
      fixed_tick_clock.gd
      event_bus.gd
    sim/
      movement_model.gd
      encounter_classifier.gd
      cpa_solver.gd
      warning_pipeline.gd
      geometry_monitor.gd
      target_ai.gd
    runtime/
      runtime_snapshot.gd
      replay_recorder.gd
      replay_player.gd
      qa_log_writer.gd
    ui_bridge/
      hud_state_exporter.gd
  tests/
    unit/
    replay/
  exports/
```

Notes:

- `data/scenarios/` contains scenario truth and must be reviewed by Gameplay/Maritime and QA before educational use.
- `scenes/` contains reusable runtime nodes, not scenario-specific business logic.
- `scripts/sim/` owns movement, geometry, encounter classification, CPA/TCPA, and warnings.
- `scripts/ui_bridge/` exports Engine state to HUD. UI/HUD renders state but does not classify rules.
- `tests/replay/` stores deterministic regression inputs and expected event timelines.

## Scene Structure

Recommended root scene:

```text
PrototypeBoot
  ScenarioRunner
    FixedTickClock
    ScenarioLoader
    EventBus
    ReplayRecorder
    ReplayPlayer
    QAConsoleLog
    World2D
      ZoneLayer
        SafeCorridorPolygon
        ShallowZonePolygons
        DangerPolygons
        CautionBuffers
        FinishGate
      MarkLayer
        Mark instances
      VesselLayer
        Ownship
        TargetVessel
      TrackLayer
        OwnshipTrack
        TargetVector
        OwnshipVector
    HeadingUpCamera
    HudBridge
    DebugOverlay
```

### Responsibilities

| Scene/node | Responsibility |
| --- | --- |
| `PrototypeBoot` | Development entry point, scenario selection, replay selection. |
| `ScenarioRunner` | Loads scenario data, owns scenario lifecycle, emits result state. |
| `FixedTickClock` | Runs deterministic simulation ticks, recommended 10-20 Hz for gameplay logic. |
| `World2D` | Owns world-space nodes and geometry. |
| `Ownship` | Applies player input through the movement model. |
| `TargetVessel` | Moves on deterministic route/behaviour data. |
| `HeadingUpCamera` | Keeps ownship lower-third and rotates/framing world heading-up. |
| `GeometryMonitor` | Tests ownship against corridor, shallow, danger, buffers, and finish gate. |
| `EncounterClassifier` | Produces crossing/head-on/overtaking/none/ambiguous and player role. |
| `CPASolver` | Computes qualitative CPA/TCPA state and optional QA numeric values. |
| `WarningPipeline` | Merges geometry, CPA, movement, and VTS events into prioritized warnings. |
| `HudBridge` | Publishes stable runtime snapshots for UI/HUD. |
| `ReplayRecorder/ReplayPlayer` | Records and replays deterministic input/event logs. |

## Scenario Data Model

Scenario files should be JSON for easy review, diffing, validation, and future web tooling. The Engine must reject an MVP scenario that omits `iala_region` or sets it to anything other than `"A"`.

Minimum scenario shape:

```json
{
  "schema_version": 1,
  "scenario_id": "safe-water-crossing-target",
  "scenario_version": "0.1.0",
  "title_key": "scenario.safe_water_crossing_target.title",
  "briefing_key": "scenario.safe_water_crossing_target.briefing",
  "rule_review_status": "draft",
  "iala_region": "A",
  "mode": {
    "daylight": true,
    "weather": "calm",
    "visibility": "good"
  },
  "world": {
    "units": "meters",
    "origin": [0, 0],
    "heading_reference": "degrees_true",
    "bounds": [[-250, -150], [250, 650]]
  },
  "camera": {
    "mode": "heading_up",
    "ownship_screen_anchor": [0.5, 0.70],
    "forward_view_ratio": 0.65,
    "zoom_min": 0.85,
    "zoom_max": 1.15
  },
  "ownship": {
    "spawn_position": [0, 0],
    "spawn_heading_deg": 0,
    "collision_radius_m": 6,
    "grounding_radius_m": 5,
    "speed_levels": [
      { "id": "stop", "speed_mps": 0.0 },
      { "id": "slow", "speed_mps": 2.5 },
      { "id": "cruise", "speed_mps": 5.0 },
      { "id": "fast", "speed_mps": 7.0 }
    ],
    "initial_speed_level": "slow",
    "turn_rate_deg_per_sec": {
      "slow": 8,
      "cruise": 6,
      "fast": 4
    },
    "speed_step_time_sec": 1.5
  },
  "target_vessels": [
    {
      "id": "target_01",
      "type": "power_driven",
      "spawn_position": [160, 280],
      "spawn_heading_deg": 270,
      "speed_mps": 4.2,
      "collision_radius_m": 8,
      "behaviour": "constant_course_speed",
      "ais": {
        "label": "TGT 01",
        "vector_horizon_sec": 90
      }
    }
  ],
  "marks": [
    {
      "id": "mark_01",
      "type": "safe_water",
      "position": [0, 180],
      "visual_variant": "region_a_day",
      "label_key": "mark.safe_water.01"
    }
  ],
  "geometry": {
    "safe_corridor_polygon": [[-45, -40], [45, -40], [55, 520], [-55, 520]],
    "shallow_zone_polygons": [
      [[-250, -40], [-55, -40], [-65, 520], [-250, 520]]
    ],
    "danger_polygons": [
      [[70, 160], [140, 170], [145, 250], [75, 240]]
    ],
    "caution_buffers": {
      "safe_corridor_edge_m": 8,
      "shallow_warning_m": 12,
      "danger_warning_m": 18
    },
    "finish_gate": [[-45, 500], [45, 500]]
  },
  "encounter": {
    "expected_initial_class": "crossing",
    "expected_player_role": "give_way",
    "classifier_thresholds": {
      "head_on_relative_heading_deg": 15,
      "crossing_min_bearing_deg": 15,
      "crossing_max_bearing_deg": 112.5,
      "overtaking_abaft_beam_deg": 112.5,
      "ambiguous_margin_deg": 5
    }
  },
  "cpa_tcpa": {
    "horizon_sec": 180,
    "safe_cpa_m": 80,
    "caution_cpa_m": 55,
    "danger_cpa_m": 35,
    "immediate_cpa_m": 20,
    "active_tcpa_max_sec": 150
  },
  "vts_prompts": [
    {
      "id": "vts_intention_01",
      "trigger": { "type": "time_sec", "value": 45 },
      "prompt_key": "vts.safe_water_crossing.intention",
      "timeout_sec": 20,
      "options": [
        {
          "id": "reduce_speed_pass_astern",
          "label_key": "vts.answer.reduce_speed_pass_astern",
          "result": "accepted"
        },
        {
          "id": "maintain_cross_ahead",
          "label_key": "vts.answer.maintain_cross_ahead",
          "result": "unsafe_intent"
        }
      ]
    }
  ],
  "scoring": {
    "reference_track": [[0, 0], [0, 160], [-15, 260], [0, 500]],
    "expected_action_windows": [
      {
        "id": "give_way_action",
        "start_sec": 20,
        "end_sec": 75,
        "preferred_actions": ["speed_down", "course_adjustment_to_pass_astern_if_safe_water_permits"]
      }
    ]
  },
  "replay": {
    "seed": 1001,
    "fixed_tick_hz": 20
  }
}
```

### Required Validation

Engine scenario loading must validate:

- `schema_version` exists and is supported.
- `scenario_id` and `scenario_version` exist.
- `rule_review_status` exists.
- `iala_region` exists and equals `"A"` for MVP.
- Exactly one ownship exists.
- MVP scenarios contain zero or one target vessel; first scenario must contain one.
- Geometry exists for safe corridor, shallow zones, danger zones, caution buffers, and finish gate.
- Marks and geometry do not share data ownership: marks are visual cues; geometry is Engine truth.
- CPA/TCPA thresholds are ordered from safe to immediate.
- Replay seed and fixed tick rate exist.

## Heading-Up Camera

The prototype camera should use heading-up as the default and only playable mode.

Implementation model:

1. Keep ownship in world coordinates.
2. Rotate the camera container or world view so ownship heading points toward screen top.
3. Anchor ownship at the configured screen position, recommended `[0.5, 0.70]`.
4. Bias visible world space forward so the player sees the next mark, target vector, and safe-water decision area.
5. Keep labels and HUD text screen-aligned, not world-rotated.

Recommended MVP constraints:

| Camera parameter | Prototype value |
| --- | --- |
| Ownship anchor | 50% viewport width, 68-72% viewport height |
| Forward view | About 65% of vertical space ahead of ownship |
| Astern view | About 15% of vertical space behind ownship |
| Rotation smoothing | Small, deterministic smoothing or none in replay mode |
| Zoom | Narrow scenario-defined range only |
| North cue | Small HUD indicator exported from Engine or computed by UI from heading |

Replay mode should be able to disable camera smoothing so QA screenshots are frame-stable.

## Ownship Lower-Third Placement

Ownship placement is a camera contract, not a sprite layout detail.

The Engine should expose:

- `ownship.screen_anchor_target`: configured lower-third anchor.
- `ownship.screen_anchor_actual`: current camera-projected normalized position for QA/debug.
- `camera.forward_view_ratio`.
- `camera.mode: "heading_up"`.

QA should fail the prototype if ownship drifts above midpoint during normal play, or if VTS/control overlays cover the ownship bow, heading line, projected vector, or warning ring.

## Movement Model

The MVP movement model should be deterministic and intentionally simple.

### Ownship State

Runtime ownship state:

```text
position_m: Vector2
heading_deg: float
speed_level: stop | slow | cruise | fast
speed_mps: float
turn_command: port | starboard | none
turn_rate_deg_per_sec: float
speed_transition_state: stable | accelerating | decelerating
track_points: recent world positions
```

### Control Inputs

Supported prototype inputs:

| Input | Engine action |
| --- | --- |
| `turn_port_pressed` | Apply turn rate to port while held. |
| `turn_starboard_pressed` | Apply turn rate to starboard while held. |
| `turn_port_tap` | Optional small heading step if UI chooses tap-to-step. |
| `turn_starboard_tap` | Optional small heading step if UI chooses tap-to-step. |
| `speed_up` | Step up one speed level. |
| `speed_down` | Step down one speed level. |
| `vts_answer(option_id)` | Submit VTS answer event. |
| `restart_checkpoint` | Reset from deterministic checkpoint. |

### Tick Update

At each fixed tick:

1. Read input command for the tick.
2. Update speed level transitions.
3. Resolve turn rate from current speed level.
4. Integrate heading.
5. Integrate position from heading and speed.
6. Update target vessel position.
7. Run geometry checks.
8. Run encounter classifier.
9. Run CPA/TCPA solver.
10. Run warning pipeline.
11. Export runtime snapshot.
12. Append replay/log event if state changed meaningfully.

No full hydrodynamics, wind, current, prop walk, drift, engine failures, or sailing physics should be included in MVP.

## Safe Corridor, Shallow, And Danger Geometry

The Engine should treat explicit polygons as authoritative.

| Geometry | Engine meaning | Expected consequence |
| --- | --- | --- |
| `safe_corridor_polygon` | Intended navigable water for the drill. | Outside corridor may be caution, unsafe, or fail depending on adjacent zone. |
| `shallow_zone_polygons` | Recoverable or grounding risk area. | Warning on buffer/entry, grounding if threshold/radius condition is met. |
| `danger_polygons` | Hard danger or near-hard failure area. | Danger/immediate state, fail if ownship radius intersects hard polygon. |
| `caution_buffers` | Early warning distances around corridor/shallow/danger. | Caution or danger warning before failure. |
| `finish_gate` | Scenario completion boundary. | Success only if no active critical failure and required encounter conditions are met. |

Recommended collision tests:

- Use ownship `grounding_radius_m` for shallow/danger intersection.
- Use ownship `collision_radius_m` for vessel collision checks.
- Use point-in-polygon for basic corridor state, and radius/polygon distance for buffer warnings.
- Store every zone hit as structured state, not only as text.

Runtime safe-water state:

```text
safe_water_state:
  in_corridor
  corridor_buffer
  shallow_buffer
  shallow
  danger_buffer
  danger
  grounded
```

## One Target Vessel

The MVP Engine should support one target vessel and avoid generic traffic systems.

Target vessel MVP behaviour:

- Power-driven vessel only.
- Constant course and speed by default.
- Optional deterministic route segment list later, still no random traffic.
- No autonomous avoidance unless Game Director explicitly approves it for later scenarios.
- Collision radius and AIS vector defined by scenario data.

Runtime target state:

```text
target.id
target.position_m
target.heading_deg
target.speed_mps
target.collision_radius_m
target.bearing_from_ownship_deg
target.relative_side
target.range_m
target.vector_horizon_sec
target.vector_end_position_m
target.visible
```

For the first scenario, the target should cross ahead from starboard so the player role is clear and QA can script success and failure replays.

## AIS Vector Data

The Engine should compute vector endpoints and risk state; UI should render them.

Required AIS-style runtime fields:

```text
ais_target:
  id
  label
  position_m
  heading_deg
  speed_mps
  range_m
  bearing_true_deg
  relative_bearing_deg
  relative_side: port | starboard | ahead | astern | ambiguous
  vector_horizon_sec
  vector_end_position_m
  cpa_tcpa_state
  cpa_m_debug
  tcpa_sec_debug
```

Numeric CPA/TCPA should be available in debug/QA logs even if the player HUD only shows qualitative states.

## CPA/TCPA Qualitative States

The Engine should compute CPA/TCPA from relative motion using constant-velocity assumptions over a scenario-defined horizon.

Required states:

| State | Meaning |
| --- | --- |
| `safe` | CPA is outside scenario caution threshold, or TCPA is not relevant. |
| `caution` | CPA is trending toward an unsafe value but remains recoverable. |
| `danger` | CPA is below scenario danger threshold within active TCPA window. |
| `immediate` | CPA/collision geometry is critical or collision is imminent/unrecoverable. |

Recommended solver outputs:

```text
cpa_tcpa:
  state: safe | caution | danger | immediate
  cpa_m_debug: float
  tcpa_sec_debug: float
  active: bool
  threshold_set_id: string
  closest_point_ownship_m: Vector2
  closest_point_target_m: Vector2
```

Rules:

- TCPA behind ownship/target or outside `active_tcpa_max_sec` should usually be `safe` unless current separation is already critical.
- Thresholds are scenario training values, not universal legal limits.
- The solver must emit deterministic state transitions for replay comparison.

## Encounter Classification

The Engine should classify the active encounter and player role from scenario thresholds, then expose the result to UI/HUD and QA.

Supported MVP classes:

```text
crossing
head_on
overtaking
none
ambiguous
```

Supported MVP roles:

```text
give_way
stand_on
overtaking
overtaken
caution
none
```

The first scenario should start as:

```json
{
  "encounter_class": "crossing",
  "player_role": "give_way"
}
```

If classifier output differs from scenario `expected_initial_class` at start, the Engine should write a QA error event and block the scenario from approval.

## Warning State Pipeline

The Engine should emit a single prioritized warning queue from multiple inputs.

Inputs:

- Geometry state.
- CPA/TCPA state.
- Encounter role/action timing.
- Movement behaviour, such as late alteration or excessive speed.
- VTS prompt state.
- Collision/grounding/result state.

Pipeline stages:

1. Collect raw signals.
2. Normalize each signal into severity: `safe`, `caution`, `danger`, `immediate`.
3. Attach spatial anchor where relevant: ownship, target, mark, zone, finish gate.
4. Deduplicate repeated signals.
5. Apply priority ordering.
6. Export primary warning plus secondary warnings.
7. Log state transitions with tick/time.

Recommended priority:

1. Collision or grounding.
2. CPA immediate/danger.
3. Danger polygon or shallow/danger geometry.
4. Leaving safe corridor.
5. VTS timeout/unsafe intent.
6. Late or unclear manoeuvre.
7. Minor safe-water or mark proximity caution.

Runtime warning item:

```text
warning:
  id
  severity: caution | danger | immediate
  priority
  text_key
  source: geometry | cpa_tcpa | encounter | movement | vts | result
  related_entity_id
  spatial_anchor_m
  started_tick
  updated_tick
```

UI/HUD should display text keys and severity. It should not invent maritime interpretation from raw positions.

## VTS Popup Runtime Data

VTS is a compact scenario pressure element, not a full Captain Ether radio trainer.

The Engine should own:

- Prompt trigger.
- Prompt active/inactive state.
- Timeout.
- Selected answer.
- Result mapping.
- Whether declared intention conflicts with actual manoeuvre.

Runtime VTS state:

```text
vts:
  prompt_id
  state: inactive | active | answered | accepted | unclear | unsafe_intent | timed_out
  caller_key
  prompt_key
  options:
    - option_id
      label_key
      enabled
  opened_tick
  remaining_sec
  selected_option_id
  result
  blocks_scenario_completion: bool
```

If VTS is enabled in the first scenario, it should trigger only after the player has had time to read the safe water and target geometry.

## Deterministic Replay And Logging For QA

Determinism is a prototype requirement, not a later testing convenience.

### Fixed Tick

Use a fixed gameplay tick with scenario-defined `fixed_tick_hz`, recommended 20 Hz. Rendering may run independently, but movement, collision, CPA/TCPA, warnings, and VTS timers must advance on fixed ticks.

### Input Log

Replay input log shape:

```json
{
  "scenario_id": "safe-water-crossing-target",
  "scenario_version": "0.1.0",
  "engine_version": "prototype-0.1",
  "seed": 1001,
  "fixed_tick_hz": 20,
  "inputs": [
    { "tick": 24, "type": "speed_up" },
    { "tick": 210, "type": "turn_port_pressed" },
    { "tick": 260, "type": "turn_port_released" },
    { "tick": 520, "type": "vts_answer", "option_id": "reduce_speed_pass_astern" }
  ]
}
```

### Event Log

QA event log shape:

```json
{
  "scenario_id": "safe-water-crossing-target",
  "run_id": "local-qa-0001",
  "events": [
    {
      "tick": 0,
      "time_sec": 0.0,
      "type": "scenario_loaded",
      "data": { "iala_region": "A", "rule_review_status": "draft" }
    },
    {
      "tick": 410,
      "time_sec": 20.5,
      "type": "cpa_state_changed",
      "data": { "from": "safe", "to": "caution", "cpa_m": 54.2, "tcpa_sec": 72.0 }
    }
  ]
}
```

### Replay Acceptance

A replay should be considered valid only if:

- Scenario id/version match.
- Engine version is compatible.
- Seed matches.
- Fixed tick rate matches.
- Final result state matches expected.
- Key warning transitions occur within an allowed tick tolerance.

QA should keep at least five replay fixtures for the first scenario:

- Clean success.
- Minor safe-water correction.
- Moderate late give-way action.
- Serious CPA/near-miss risk.
- Critical grounding or collision.

## Engine Output To UI/HUD

The Engine should export snapshots at fixed tick or render-frame cadence. The UI/HUD should consume snapshots and render them without changing simulation truth.

Required static scenario data:

- Scenario id, title key, version, review status.
- `iala_region: "A"`.
- Briefing/objective keys.
- Camera mode and lower-third anchor.
- Mark list with type, position, visual variant, topmark/label keys.
- Safe corridor, shallow, danger, caution buffer, and finish gate display geometry.
- VTS prompt definitions and answer options.

Required runtime snapshot:

```text
runtime_snapshot:
  tick
  time_sec
  scenario_state: loading | running | success | warning_outcome | unsafe_manoeuvre | near_miss | grounding | collision | restart
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
    turn_rate_deg_per_sec
    turn_state
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
  cpa_tcpa:
    state
    cpa_m_debug
    tcpa_sec_debug
  safe_water:
    state
    active_zone_id
    nearest_boundary_m_debug
  warnings:
    primary_warning
    secondary_warnings
  vts:
    prompt_state
    prompt_id
    options
    remaining_sec
    selected_option_id
    result
  qa:
    replay_recording
    rule_review_status
    validation_errors
```

UI/HUD should not compute:

- IALA validity.
- Encounter class.
- Player role.
- CPA/TCPA state.
- Warning severity.
- Scenario outcome.

## QA Validation Checklist

QA should verify the prototype at three levels: scenario data, deterministic simulation, and HUD contract.

### Scenario Data

- Every scenario has `iala_region: "A"`.
- Non-`"A"` or missing `iala_region` fails loading in MVP builds.
- `rule_review_status` exists and draft scenarios are visibly not final training content in QA/debug contexts.
- Safe corridor, shallow, danger, caution buffer, and finish gate geometry exist.
- Marks agree with geometry and do not imply a different safe side.
- First scenario contains exactly one target vessel.
- Target vessel is deterministic and non-random.

### Camera And Placement

- Heading-up mode is active by default.
- Ownship stays in lower third during normal play.
- Forward view remains prioritized after turns.
- Labels remain screen-readable and do not rotate with world geometry.
- Camera smoothing does not break replay screenshot comparison.
- North cue/heading context remains available without dominating the HUD.

### Movement

- Heading changes match configured turn rates per speed level.
- Speed levels step deterministically.
- Movement is identical across replay runs with the same input log.
- No hidden hydrodynamics, current, wind, or random drift affects the scenario.
- Stop/slow/cruise/fast behaviour matches scenario data.

### Geometry And Consequences

- Safe corridor state changes at expected boundaries.
- Shallow buffer, shallow, danger buffer, danger, grounding, and hard fail states trigger at expected locations.
- Collision radius and grounding radius are applied consistently.
- Finish gate cannot produce success after an active critical failure.

### Target, AIS, And CPA/TCPA

- Target vessel position, heading, speed, and vector match scenario data.
- AIS vector length corresponds to speed and vector horizon.
- Relative side and bearing are stable and explainable.
- CPA/TCPA qualitative states match scripted reference runs.
- Numeric CPA/TCPA debug values are logged for QA.

### Warnings

- Warning priority is stable when multiple risks overlap.
- Primary warning never hides the underlying cause in the HUD contract.
- Collision/grounding outrank all other warnings.
- CPA danger outranks minor corridor cautions.
- Warning transitions are logged with tick/time.

### VTS

- VTS prompt triggers only at the scenario-defined moment.
- VTS state transitions are deterministic.
- Answer result matches scenario data.
- Timeout logs correctly.
- Unsafe intention can be compared against actual manoeuvre if the scenario requires it.
- VTS does not create Captain Ether scope creep.

### Replay And Logs

- Clean success replay produces the same final result on repeated runs.
- Minor/moderate/serious/critical replay fixtures produce expected event timelines.
- Logs include scenario id/version, engine version, seed, fixed tick rate, input events, warning transitions, and final result.
- QA can attach one input log and one event log to a bug report and reproduce the issue locally.

## Open Decisions For Game Director

1. Confirm future Godot prototype location. Engine recommends `game.brkovic.ltd/prototypes/watch-officer-godot/`.
2. Confirm whether the first scenario uses a safe-water mark, Region A lateral pair, or both. Engine can support either, but QA should validate one primary lesson first.
3. Confirm whether player HUD shows only qualitative CPA/TCPA or also compact numeric values. Engine recommends qualitative player HUD with numeric QA/debug values.
4. Confirm whether VTS runs without pausing. Engine recommends no pause for MVP unless UI/HUD testing proves the popup is unreadable.
5. Confirm whether target vessel remains constant course/speed in all MVP scenarios. Engine recommends yes for prototype determinism.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0007 can move from Backlog to For Review after this report is accepted.

Engine recommends a small Godot 2D prototype with explicit scenario JSON, mandatory `iala_region: "A"`, heading-up camera, ownship lower-third anchor, deterministic fixed-tick movement, one target vessel, explicit safe/shallow/danger geometry, qualitative CPA/TCPA, prioritized warning pipeline, compact VTS runtime state, and replay/logging as a first-class QA requirement.

No problems outside the Engine / Godot zone were found. The main dependency is approval of the prototype plan before any real Godot project files or playable Watch Officer code are created.
