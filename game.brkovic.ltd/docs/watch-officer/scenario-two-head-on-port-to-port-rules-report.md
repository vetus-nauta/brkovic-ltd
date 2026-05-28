# Scenario 2 Head-On Port-to-Port Rules Decision Pack

**Task:** `TASK-0093`  
**Owner Chat:** `CHAT-GAMEPLAY-001 / Lead Maritime Gameplay Designer`  
**Date:** `2026-05-27`  
**Scenario:** `Head-On Port-to-Port Drill`  
**Status:** draft-for-game-director-review  
**Scope:** Documentation only. No code, scenario JSON, schema, scenes, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, or final maritime training claim changes.

## Source Context

Reviewed source documents:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-scenario-one-production-prototype-status-2026-05-27.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-maritime-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/watch-officer/audio-direction-sound-design-spec.md`

Light prototype inspection for risk review only:

- `game.brkovic.ltd/prototypes/watch-officer-godot/data/scenarios/safe-water-crossing-target.json`
- `game.brkovic.ltd/prototypes/watch-officer-godot/data/schemas/scenario.schema.json`
- `game.brkovic.ltd/prototypes/watch-officer-godot/scripts/sim/scenario_one_encounter_classifier.gd`
- `game.brkovic.ltd/prototypes/watch-officer-godot/tests/runtime/test_scenario_one_encounter_classifier.gd`

## Decision Summary

Scenario 2 should be a narrow traffic-geometry drill: one ownship motor yacht and one power-driven target meet on reciprocal or nearly reciprocal courses in day, calm, good-visibility conditions. The player must recognize the developing head-on situation early, make a clear starboard alteration, and create a port-to-port pass while remaining in open water or a very simple channel.

This decision pack is not final maritime training approval. It defines scenario design assumptions for a future Engine/UI/QA implementation task.

## Learning Objective

The player learns to:

- identify a simple head-on or nearly head-on encounter early from target bearing, relative heading, and closing geometry;
- take one clear, early starboard alteration instead of hesitating or making repeated small ambiguous changes;
- produce a port-to-port pass with increasing separation and no collision, near miss, grounding, or unsafe-water breach;
- understand that this is a draft scenario assumption pending maritime review, not official legal instruction.

## Rule Concept Scope

Included rule concept:

- two power-driven vessels in sight of one another;
- reciprocal or nearly reciprocal courses;
- risk of collision exists or is developing;
- expected player action is early alteration to starboard;
- desired passing relationship is port-to-port;
- open water or a simple channel geometry only.

This scenario should teach the practical recognition/action pattern, not rule-number recall. Player-facing copy may use wording such as `head-on risk`, `alter starboard early`, `increase separation`, and `port-to-port pass`, with persistent draft/non-final wording.

## Fixed Assumptions

- One ownship only.
- One target vessel only.
- Both vessels are power-driven.
- Daylight is true.
- Weather is calm.
- Visibility is good.
- IALA Region A remains the only project region.
- Heading-up camera remains the default.
- Ownship remains a motor yacht with simple heading and speed controls.
- Target behaviour is deterministic constant course and speed.
- VTS is disabled.
- Radar, night, restricted visibility, weather pressure, random traffic, and complex channel rules are absent.
- Scenario `rule_review_status` may be `draft` for prototype planning only if draft/non-final training wording is visible.

## Target Vessel Setup

Recommended target setup:

- `id`: `target_01` or equivalent stable id.
- `type`: `power_driven`.
- `behaviour`: `constant_course_speed`.
- Spawn: forward of ownship, roughly on the intended track centerline or slightly offset so the encounter remains visually reciprocal or nearly reciprocal.
- Heading: approximately reciprocal to ownship starting heading.
- Speed: similar to ownship slow/cruise speed, enough to create closing pressure without forcing emergency action in the first seconds.
- AIS/vector: visible from start, with the existing qualitative CPA/TCPA state and optional numeric debug values for QA only.
- No autonomous avoidance unless separately assigned later.

The target should not cross from starboard as the defining condition. Its relative side may begin near `ahead` or `ambiguous` and should resolve through head-on classification, not crossing-from-starboard logic.

## Ownship Starting Setup

Recommended ownship setup:

- `id`: `ownship`.
- `type`: `motor_yacht`.
- Spawn: lower part of the playfield, aligned toward the target.
- Heading: toward the target on a reciprocal or nearly reciprocal line.
- Initial speed: `slow` or `cruise`; `slow` is preferred if the first implementation needs a generous recognition window.
- Controls: same simple turn and speed model as Scenario 1.
- Camera: heading-up, ownship anchored in the lower third, with enough forward water to see the target and projected vectors.

If a simple channel is used, it must be visually broad enough that an early starboard alteration is feasible without turning the lesson into full narrow-channel training.

## Allowed Player Action

Allowed player controls remain narrow:

- turn starboard;
- turn port;
- hold current course;
- step speed up or down if the current control model already supports it;
- restart/checkpoint if the prototype flow already supports it.

The expected primary action is course alteration to starboard. Speed reduction may be accepted as a supporting action only if it does not replace the need for a clear starboard alteration in the scoring model.

## Expected Correct Behavior

A successful attempt should show:

- early recognition before CPA reaches danger/immediate;
- one clear starboard alteration within the expected action window;
- target moves to ownship port side for the pass geometry, or the logged pass relationship confirms port-to-port;
- CPA improves or remains safe after the alteration;
- no collision or near miss;
- no unsafe-water or grounding event if a simple channel/safe corridor is present;
- finish condition reached with no critical warning active.

Recommended success wording:

```text
Recommended action in this scenario: early starboard alteration and port-to-port pass.
```

Do not use `official`, `certified`, `COLREGS compliant`, `legally correct`, or final-training wording.

## Failure Conditions

Critical failures:

- collision with the target;
- CPA immediate/unrecoverable collision risk;
- alteration to port at close range that worsens CPA or creates an unsafe close-quarters situation;
- no meaningful action until the encounter is unrecoverable;
- grounding or hard danger breach if simple channel geometry is active.

Serious outcomes:

- late starboard alteration that creates CPA danger or near miss but avoids collision;
- repeated small heading changes that do not communicate a clear intention and do not improve CPA in time;
- crossing ahead of the target in a way that defeats the intended port-to-port pass;
- excessive speed maintained into a close-quarters situation if speed is part of scoring.

Moderate/minor outcomes:

- slow recognition with recoverable CPA caution;
- overcorrection to starboard that remains safe but inefficient;
- temporary corridor caution in a simple channel, recovered before danger;
- speed adjustment that is safe but not the primary expected action.

## Warning And Coaching Requirements

Warnings and coaching should be display-only over Engine-owned state. UI must not compute the maritime classification.

Required live cues:

- opening cue: `Head-on risk. Alter starboard early.`
- monitoring cue when safe: `Monitor the closing target.`
- action-window cue: `Make a clear starboard alteration.`
- CPA caution: `CPA caution. Increase separation.`
- late-action cue: `Late alteration. Act now.`
- wrong-way cue: `Port alteration increases risk.`
- danger cue: `CPA danger. Avoid collision.`
- result cue: short captain-note handoff after terminal or finish state.

Priority should follow the established model: terminal result, immediate CPA/collision, danger CPA, wrong-way/late action, safe-water danger if present, caution states, passive opening/monitoring cues.

Maximum player-mode live surface remains one primary cue plus up to two chips. Suggested chips: `Head-on`, `CPA safe/caution/danger/immediate`, `Draft training`, `Port-to-port`.

## Result Feedback Requirements

Result feedback should provide a calm captain-note style summary with up to three reasons from Engine/result state:

- `Early starboard alteration made.`
- `Port-to-port pass achieved.`
- `CPA recovered or remained safe.`
- `Alteration was late or unclear.`
- `Port alteration increased head-on risk.`
- `Near miss recorded.`
- `Collision recorded.`
- `Simple-channel safe water was not maintained.`

The result screen must preserve draft/non-final wording:

```text
Draft training scenario - not final maritime instruction.
```

Result labels should avoid final authority. Prefer `attempt complete`, `needs correction`, `unsafe manoeuvre recorded`, and `captain note` over legalistic final judgment.

## Scenario Data Contract Additions Or Generalizations Needed

Scenario 2 should not force a new broad system. It needs narrow generalization of current Scenario 1 contracts:

- `scenario_id`: schema must allow a second id such as `head-on-port-to-port`, not only `safe-water-crossing-target`.
- `title_key` and `briefing_key`: add Scenario 2 localization keys without changing player-facing final-claim policy.
- `target_vessels`: keep max one target for MVP, but remove required `crossing_from: "starboard"` for head-on scenarios.
- `encounter.expected_initial_class`: allow `head_on`.
- `encounter.expected_player_role`: allow a head-on-specific role/state such as `both_alter_starboard`, `head_on_caution`, or a similarly reviewed value. Avoid reusing `give_way` if it implies crossing-specific behavior.
- `encounter.classifier_thresholds.head_on_relative_heading_deg`: keep scenario-local and reviewed; do not present threshold as universal maritime law.
- `scoring.expected_action_windows`: support `early_starboard_alteration` and optional `maintain_port_to_port_pass`.
- `scoring.success_requires`: support `port_to_port_pass_achieved`, `early_starboard_alteration`, `safe_or_recovered_cpa`, `no_collision`, and optional `safe_corridor_maintained`.
- `warnings`: allow text keys for late head-on action, wrong-way port alteration, and port-to-port pass status.
- `result_feedback`: allow reason keys for head-on recognition, early starboard alteration, port-to-port pass, late/unclear action, and port alteration.
- `replay`: add Scenario 2 fixture names while retaining seed, fixed tick rate, input log, event log, and +/- 1 tick tolerance.

No Region B field expansion is needed. `iala_region` remains required and exactly `"A"` for MVP.

## Current Prototype Assumption Risk Review

Current prototype assumptions are Scenario-1-specific and need narrow generalization before Scenario 2 implementation:

| Area | Current assumption | Scenario 2 risk | Required narrow generalization |
| --- | --- | --- | --- |
| `scenario_id` | Schema const is `safe-water-crossing-target`. | Scenario 2 cannot load under current schema. | Allow an enumerated set of approved scenario ids or scenario-id pattern with per-scenario validation. |
| Target encounter fields | Scenario data and schema require `crossing_from: "starboard"`. | Head-on target is not defined by starboard crossing. | Make crossing-specific fields conditional by encounter class. |
| Crossing-from-starboard assumptions | Classifier returns `crossing` only when expected class is crossing and target relative side is starboard. | Head-on would classify as ambiguous/none. | Add head-on classification path based on reciprocal heading and bearing ahead. |
| Lateral-pair mark assumptions | Schema requires exactly two Region A lateral marks, one red port and one green starboard. | Open-water head-on drill may not need a lateral pair; simple channel may use marks differently. | Make mark requirements scenario-specific while keeping IALA A validation. |
| Loader/schema constraints | Required geometry and mark constraints match Scenario 1. | Scenario 2 open water may need minimal safe area rather than lateral corridor teaching. | Preserve explicit geometry, but allow simple open-water bounds or broad corridor. |
| Classifier naming | `scenario_one_encounter_classifier.gd` is named for Scenario 1. | Scenario 2 work could duplicate or misplace rule logic. | Introduce a generic MVP encounter classifier or a clearly scenario-routed classifier interface. |
| Replay fixture naming | Tests and data are named around Scenario 1. | QA fixtures may be confused or overwrite Scenario 1 expectations. | Add Scenario 2 replay/test fixture names with scenario id/version in logs. |
| Player role | Current expected role is `give_way`. | Head-on is not the same as starboard crossing give-way role in this simplified design. | Add reviewed head-on role/status and HUD copy that avoids crossing role language. |

These are design/architecture implications only. This task does not approve implementation.

## Engine Implications

Future Engine work should:

- support loading Scenario 2 without weakening Scenario 1 validation;
- classify `head_on` deterministically from scenario thresholds and runtime geometry;
- expose player role/status for head-on without using crossing `give_way` copy;
- detect early starboard alteration within a scenario-defined action window;
- detect port alteration during the head-on risk window and escalate by timing/CPA severity;
- detect port-to-port pass achievement as a result/scoring condition;
- keep CPA/TCPA qualitative states and numeric debug logs;
- keep target constant-course/speed unless later assigned;
- keep deterministic replay and event logs with Scenario 2 id/version;
- preserve draft/non-final training status in runtime state.

Engine should not add autonomous traffic systems, VTS, radar, night mode, Region B, full hydrodynamics, or broad narrow-channel law for this scenario.

## UI/HUD Implications

Future UI/HUD work should:

- render `head_on` encounter state and related chips from Engine state only;
- keep one primary coaching cue plus up to two chips;
- show a clear target vector and ownship vector with enough forward space for early recognition;
- support a `port-to-port` result/status chip if Engine provides it;
- add warning copy for late action and wrong-way port alteration;
- keep numeric CPA/TCPA, classifier thresholds, legal rule numbers, and debug internals hidden in player mode;
- preserve visible draft/non-final wording in briefing, active attempt, result, and QA/debug surfaces;
- maintain visual comfort rules: low-glare maritime palette, no full-screen red panic, no aggressive flashing, no clutter over vessels/vectors.

No VTS popup is required for Scenario 2. Any VTS design remains deferred until separately assigned.

## QA Acceptance Checklist

Documentation acceptance:

- Scenario 2 remains one ownship and one power-driven target.
- Encounter is reciprocal or nearly reciprocal.
- Correct expected behavior is early starboard alteration and port-to-port pass.
- IALA Region A remains the only region.
- VTS, Region B, radar/night/weather, random traffic, and full narrow-channel training are out of scope.
- Draft/non-final maritime training limitation is explicit.

Future implementation acceptance:

- Scenario data includes `scenario_id`, version, `rule_review_status`, `training_claim_status`, and `iala_region: "A"`.
- Loader accepts Scenario 2 only after explicit schema/generalization work.
- Initial encounter class logs as `head_on` at scenario start.
- Player role/status does not reuse crossing `give_way` language incorrectly.
- Clean success replay: early starboard alteration, port-to-port pass, CPA safe/recovered, finish success.
- Moderate fixture: late but recoverable starboard alteration with warning and safe final result.
- Serious fixture: delayed/unclear action causing near miss or CPA danger.
- Critical fixture: port alteration or no action causing collision/immediate CPA.
- Reset clears stale head-on coaching/result state.
- Player surface hides numeric CPA/TCPA and classifier thresholds.
- Draft/non-final wording is visible.
- Forbidden final/certified/official/COLREGS-compliant claims are absent.

## Unresolved Maritime-Rule Questions

These require maritime reviewer confirmation before educational approval:

- What exact threshold should define `nearly reciprocal` for the MVP head-on classifier?
- How should the simplified scenario handle a target that appears slightly off the bow but still creates doubt?
- What player-facing wording best describes the expected starboard alteration without overclaiming final legal instruction?
- How severe should an early port alteration be when still far away and CPA remains recoverable?
- What minimum alteration should count as clear/substantial enough for this training drill?
- Should speed reduction alone ever be accepted as a partial recovery in this scenario?
- In a simple channel, how should the drill balance port-to-port expectations with safe-water/channel-edge constraints without teaching full narrow-channel rules?
- What pass-distance/CPA thresholds are acceptable as scenario-local training values?
- Who signs off `rule_review_status: "approved"` for this scenario?

## Explicit Out Of Scope

- Region B.
- Region A/B comparison teaching.
- VTS or radio prompt.
- Random traffic.
- Multiple target vessels.
- Sailing vessels, fishing vessels, towing, vessels not under command, restricted ability to manoeuvre, constrained by draft, pilot vessels, or special-status vessels.
- Radar.
- Night mode.
- Restricted visibility.
- Weather pressure.
- Full narrow-channel training.
- Traffic separation schemes.
- Sound signals.
- Autonomous target avoidance.
- Full hydrodynamics, current, wind drift, prop walk, engine failures, or sailing physics.
- New scenario JSON in this task.
- Schema, code, scene, asset, public, production, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, or production config changes.
- Any final, official, certified, legally correct, COLREGS-compliant, or final maritime training claim.

## Report For Game Director

Scenario 2 is ready for Game Director review as a narrow rules/design pack. The key implementation dependency is not new gameplay breadth; it is controlled generalization of Scenario-1-specific loader/schema/classifier/replay assumptions so `head_on` can coexist with the approved Scenario 1 crossing prototype without weakening its validation.
