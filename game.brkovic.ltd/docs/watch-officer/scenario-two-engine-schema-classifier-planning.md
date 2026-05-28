# Scenario 2 Engine Schema / Classifier Planning

**Task:** `TASK-0096`  
**Owner Chat:** `CHAT-ENGINE-001 / Engine / Godot Architect`  
**Date:** `2026-05-27`  
**Scenario:** `Head-On Port-to-Port Drill`  
**Status:** `ready-for-game-director-review`  
**Scope:** Documentation planning only. No code, scenario JSON, schema, scenes, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims changed.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/runtime-step-orchestrator-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-encounter-classifier-report.md`
- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-result-evaluation-foundation-report.md`

## Planning Goal

Add Scenario 2 support without weakening Scenario 1 validation.

Scenario 2 is:

```text
Head-On Port-to-Port Drill
```

It remains one ownship, one power-driven target, deterministic target motion, IALA Region A only, no VTS, no Region B, and `rule_review_status: "draft"` until expert approval is separately recorded.

## Current Scenario-1-Specific Constraints

Current prototype assumptions that must be generalized narrowly:

| Area | Current state | Scenario 2 need |
| --- | --- | --- |
| Scenario id | `safe-water-crossing-target` only | Allow `head-on-port-to-port` |
| Encounter class | Scenario 1 crossing classifier | Add `head_on` path |
| Target relation | `crossing_from: "starboard"` | Conditional by encounter class |
| Player role | `give_way` crossing language | Head-on status without crossing role wording |
| Marks | Region A lateral pair required | Scenario-specific mark/geometry requirements |
| Geometry | Safe corridor / shallow zones / caution buffers | Open-water bounds or broad simple channel |
| Result reasons | Crossing/safe-water reasons | Head-on action/pass relationship reasons |
| Replay/test names | Scenario 1 fixture names | Scenario 2 fixture namespace |

## Narrow Schema Generalization

Do not make the schema fully generic yet. Use an MVP enum/conditional model.

Recommended additions:

```json
{
  "scenario_id": "head-on-port-to-port",
  "scenario_version": "0.1.0",
  "iala_region": "A",
  "rule_review_status": "draft",
  "training_claim_status": "draft_not_final_training_content",
  "encounter": {
    "expected_initial_class": "head_on",
    "expected_player_role": "head_on_alter_starboard",
    "classifier_thresholds": {
      "relative_heading_tolerance_deg": 15,
      "bearing_ahead_tolerance_deg": 10
    }
  }
}
```

Threshold values above are placeholders for scenario-local planning only. They must stay hidden from player mode and remain debug/training values until separately reviewed.

Schema pattern:

- keep `scenario_id` as an approved enum;
- keep `iala_region` required and exactly `"A"`;
- keep `rule_review_status` required;
- make encounter-class-specific fields conditional;
- preserve Scenario 1 lateral-pair validation when `scenario_id` is `safe-water-crossing-target`;
- require Scenario 2 head-on fields only when `scenario_id` is `head-on-port-to-port`.

## Proposed Scenario 2 Data Contract

Minimum planned scenario fields:

```text
scenario_id
scenario_version
title_key
briefing_key
iala_region
rule_review_status
training_claim_status
environment
ownship
target_vessels[1]
encounter
geometry
scoring
warnings
result_feedback
replay
qa_debug
```

Target vessel:

```text
id: target_01
type: power_driven
behaviour: constant_course_speed
heading_relation: reciprocal_or_nearly_reciprocal
autonomous_avoidance: false
```

Encounter:

```text
expected_initial_class: head_on
expected_player_role: head_on_alter_starboard
desired_pass_relationship: port_to_port
```

Scoring:

```text
expected_action: early_starboard_alteration
success_requires:
- early_starboard_alteration
- port_to_port_pass_achieved
- safe_or_recovered_cpa
- no_collision
```

## Head-On Classifier Planning

Add a scenario-routed classifier path. Do not replace Scenario 1 classifier behavior.

Classifier inputs:

- ownship heading;
- target heading;
- target bearing true;
- target relative bearing;
- range;
- CPA/TCPA qualitative state;
- scenario-local thresholds.

Classifier outputs:

```text
encounter_class: head_on
encounter_status: opening | developing | action_window | late | resolved | failed
player_role_status: head_on_alter_starboard
classifier_debug: hidden from player mode
```

Classifier boundaries:

- deterministic;
- scenario-local;
- not a maritime authority;
- no universal threshold claims;
- no UI-side classification.

## Port-To-Port Pass Detection

Planned signal:

```text
port_to_port_status: pending | achieved | missed | failed
```

Possible detection inputs:

- relative side over time;
- closest point positions;
- target track relative to ownship track;
- pass side at or after CPA;
- collision/near-miss state.

Acceptance:

- achieved only when separation remains acceptable and the pass relationship matches the scenario goal;
- missed or failed if player crosses ahead unsafely, creates immediate CPA/collision risk, or never produces clear pass geometry.

## Early Starboard Alteration Event

Planned event:

```text
early_starboard_alteration_detected
```

Inputs:

- first meaningful heading change direction;
- heading delta magnitude;
- tick/time of first action;
- action window from scenario data;
- CPA trend after action.

Planned status:

```text
first_starboard_alteration_status:
  none | early_clear | late_clear | unclear | overcorrected
```

Minimum heading delta remains a scenario-local threshold and must not appear in player mode.

## Risk-Increasing Port Alteration Event

Planned event:

```text
risk_increasing_port_alteration
```

Severity should be graded:

```text
moderate | serious | critical
```

Inputs:

- timing;
- range;
- CPA/TCPA state;
- CPA trend after action;
- recoverability;
- collision/near-miss state.

Close-range port alteration that worsens CPA may be critical. Earlier recoverable port alteration should not automatically be terminal.

## CPA/TCPA Integration

Reuse existing CPA/TCPA debug solver as the numeric source.

Player-facing state remains qualitative:

```text
safe
caution
danger
immediate
```

Numeric values stay QA/debug only.

Scenario 2 may need scenario-local thresholds for:

- caution CPA;
- danger CPA;
- immediate CPA;
- action-window timing;
- pass-distance threshold.

These must be documented as scenario-local training/debug values.

## Warning And Result State Changes

New planned warning keys:

```text
head_on_opening
make_starboard_alteration
late_head_on_action
risk_increasing_port_alteration
port_to_port_achieved
```

New planned result reasons:

```text
early_starboard_alteration_made
port_to_port_pass_achieved
cpa_state_recovered
alteration_late_or_unclear
port_alteration_increased_risk
near_miss_recorded
collision_recorded
safe_water_not_maintained
```

Result evaluator should stay scenario-routed so Scenario 1 reasons are not affected.

## Runtime Snapshot Fields For UI/HUD

Add or confirm exported fields:

```text
scenario_id
scenario_title
rule_review_status
training_claim_status
encounter_class
encounter_status
player_role_status
cpa_state
warning_level
primary_cue_key
status_chip_keys
port_to_port_status
first_starboard_alteration_status
port_alteration_risk_status
scenario_result_status
scenario_result_reasons
vts_active
debug_visible
```

UI/HUD must render these fields without maritime computation.

## Replay Fixture Plan

Create deterministic fixtures in the future implementation task:

```text
scenario2_clean_success
scenario2_late_but_recoverable
scenario2_port_alteration_risk
scenario2_no_action_failure
scenario2_collision_or_immediate_cpa
scenario2_reset_clears_state
```

Each fixture should capture:

- fixed tick rate;
- seed;
- input log;
- event log;
- CPA/TCPA debug values;
- first action tick;
- pass relationship;
- result reasons;
- +/- 1 fixed tick tolerance where timing is asserted.

## Test Plan

Future tests:

- schema accepts Scenario 1 unchanged;
- schema accepts Scenario 2 draft contract;
- schema rejects missing/non-`"A"` `iala_region`;
- schema rejects crossing-only fields required for head-on;
- loader preserves `rule_review_status: "draft"`;
- head-on classifier returns `head_on` for reciprocal geometry;
- off-bow doubt stays scenario-local and deterministic;
- early starboard alteration event logs once;
- late starboard alteration logs warning;
- port alteration risk severity grades by CPA/range;
- port-to-port pass status resolves correctly;
- result evaluator returns Scenario 2 reasons;
- UI snapshot contains display-ready fields;
- reset clears stale Scenario 2 state;
- Scenario 1 regression remains passing.

## Likely Future Files To Change

Potential implementation write set:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/data/schemas/scenario.schema.json
game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/head-on-port-to-port.json
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/core/scenario_loader.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/scenario_one_encounter_classifier.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/scenario_result_evaluator.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/warning_escalation_pipeline.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/runtime_step_orchestrator.gd
game.brkovic.ltd/prototypes/watch-officer-godot/scripts/runtime/runtime_snapshot_exporter.gd
game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/
game.brkovic.ltd/prototypes/watch-officer-godot/tests/scenario_loader/
```

Preferred implementation approach:

- first split or wrap classifier routing instead of overloading `scenario_one_encounter_classifier.gd`;
- keep Scenario 1 test names and fixtures intact;
- add Scenario 2 tests before playable scene routing;
- avoid export/public/deploy until local headless tests pass.

## Stop Conditions

Stop implementation planning and return to Game Director if:

- Scenario 1 validation would be weakened;
- `iala_region: "A"` is no longer enforced;
- VTS becomes required;
- Region B becomes required;
- UI needs to compute maritime logic;
- thresholds must be exposed to player mode;
- a final/certified/COLREGS-compliant claim is requested;
- more than one target vessel becomes necessary;
- schema generalization becomes broad and unreviewable;
- narrow-channel rules become part of the scenario.

## Report For Game Director

Scenario 2 can proceed to a narrow Engine implementation slice after UI/HUD spec alignment. Recommended first implementation slice: schema/data generalization plus Scenario 2 loader validation, with no playable scene changes. Second slice: head-on classifier and event logging. Third slice: warning/result integration and snapshot export.
