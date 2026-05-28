# Watch Officer UI/HUD Runtime State Review

**Status:** approved-for-hud-binding-plan  
**Owner Chat:** Lead UI/HUD Designer - Watch Officer  
**Date:** 2026-05-26  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`  
**Related task:** `TASK-0025`

## Purpose

This report reviews `engine-runtime-state-contract.md` from the UI/HUD side.

The review question is narrow: does exported Engine state provide enough data for the MVP HUD to render scenario 1 without computing maritime logic in UI?

Conclusion: yes. The contract is sufficient for a HUD binding plan. UI/HUD can render heading-up camera state, ownship lower-third placement, lateral-pair marks, safe/shallow/corridor state, target AIS vector, qualitative CPA/TCPA state, warning stack, inactive VTS state, and QA/debug overlays from exported Engine state.

No blocking changes are required.

## Sources Reviewed

- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Review Summary

Engine correctly owns all rule-facing and risk-facing state:

- encounter class;
- player role;
- CPA/TCPA qualitative state;
- warning severity and priority;
- safe-water runtime state;
- scenario result;
- draft/non-final training status.

UI/HUD can remain a renderer of exported state. It does not need to classify COLREGS encounters, infer give-way/stand-on role, calculate CPA/TCPA, decide warning severity, or determine scenario success/failure.

## Contract Coverage

| Area | UI/HUD need | Contract status | Review |
| --- | --- | --- | --- |
| Heading-up camera | Camera mode, lower-third anchor, forward view ratio, north indicator support | Covered by `camera.mode`, `ownship_anchor_target`, `ownship_anchor_actual_debug`, `forward_view_ratio`, `north_angle_deg` | Sufficient. UI can bind camera and QA can inspect anchor drift. |
| Ownship lower third | Ownship world state, heading, speed, turn state, projected vector, collision/grounding ring inputs | Covered by `ownship` runtime fields plus camera anchor fields | Sufficient. UI renders screen placement from camera export and ownship state. |
| Target AIS/vector | Target position, heading, speed, range/bearing, relative side, vector end, visible flag | Covered by `target` runtime fields and static AIS label/vector horizon input | Sufficient. UI does not need to compute target vector. |
| Safe/shallow/corridor | Static polygons plus runtime state and active zone | Covered by static geometry export and `safe_water.state`, `active_zone_id`, `nearest_boundary_m_debug`, `finish_gate_crossed` | Sufficient for player HUD and QA overlays. |
| CPA/TCPA | Qualitative player state plus numeric QA/debug values | Covered by `cpa_tcpa.state`, `cpa_m_debug`, `tcpa_sec_debug`, `active` | Sufficient. Player mode can hide numeric values. |
| Warning queue | Primary/secondary warnings, severity, source, priority, spatial anchor, text keys | Covered by warning model and `warnings.primary_warning`, `warnings.secondary_warnings` | Sufficient. Priority model matches MVP needs for scenario 1. |
| VTS inactive state | Scenario 1 must not show a VTS popup | Covered by static `vts.enabled: false` and runtime `vts.state: inactive` with empty prompt/options | Sufficient. UI can keep popup slot dormant. |
| Draft/non-final status | UI must not present final training claims | Covered by `rule_review_status`, `training_claim_status`, and `draft_training` | Sufficient. UI can show draft status in QA/training-claim surfaces. |
| QA/debug mode | Fields UI may hide in player mode but expose in QA builds | Covered by camera actual anchor debug, CPA/TCPA numeric debug, nearest boundary debug, replay fields, seed, fixed tick, validation errors | Sufficient for UI QA overlay planning. |

## HUD Binding Decision

UI/HUD binding may proceed on this contract with these assumptions:

1. `scenario_static` is loaded before HUD initialization.
2. `runtime_snapshot` is treated as the only live source for HUD state.
3. UI never overrides Engine state for encounter, role, CPA/TCPA, warnings, VTS, safe-water state, or result.
4. Player mode shows qualitative maritime/risk state only.
5. QA mode may expose debug numeric fields, replay fields, validation errors, and camera anchor diagnostics.
6. Draft/non-final training status remains visible wherever the build presents training claims or QA/debug review surfaces.

## Player Mode Fields

Player-facing HUD can use:

- `scenario_static.title_key`
- `scenario_static.briefing_key`
- `scenario_static.iala_region`
- `scenario_static.camera.mode`
- `scenario_static.camera.ownship_screen_anchor`
- `scenario_static.camera.forward_view_ratio`
- `scenario_static.marks[]`
- `scenario_static.geometry.safe_corridor_polygon`
- `scenario_static.geometry.shallow_zone_polygons`
- `scenario_static.geometry.caution_buffers`
- `runtime_snapshot.camera.north_angle_deg`
- `runtime_snapshot.ownship.position_m`
- `runtime_snapshot.ownship.heading_deg`
- `runtime_snapshot.ownship.speed_level`
- `runtime_snapshot.ownship.turn_state`
- `runtime_snapshot.ownship.projected_vector_end_m`
- `runtime_snapshot.ownship.collision_radius_m`
- `runtime_snapshot.ownship.grounding_state`
- `runtime_snapshot.ownship.recent_track_m`
- `runtime_snapshot.target.position_m`
- `runtime_snapshot.target.heading_deg`
- `runtime_snapshot.target.range_m`
- `runtime_snapshot.target.relative_side`
- `runtime_snapshot.target.vector_end_position_m`
- `runtime_snapshot.target.visible`
- `runtime_snapshot.cpa_tcpa.state`
- `runtime_snapshot.safe_water.state`
- `runtime_snapshot.warnings.primary_warning`
- `runtime_snapshot.warnings.secondary_warnings`
- `runtime_snapshot.vts.enabled`
- `runtime_snapshot.vts.state`
- `runtime_snapshot.scenario_result`

For scenario 1, `runtime_snapshot.vts.enabled == false` and `runtime_snapshot.vts.state == inactive` should suppress the VTS popup completely.

## QA Mode Fields

QA/debug HUD can additionally expose:

- `scenario_static.rule_review_status`
- `scenario_static.training_claim_status`
- `runtime_snapshot.draft_training`
- `runtime_snapshot.camera.ownship_anchor_actual_debug`
- `runtime_snapshot.runtime.tick`
- `runtime_snapshot.runtime.time_sec`
- `runtime_snapshot.cpa_tcpa.cpa_m_debug`
- `runtime_snapshot.cpa_tcpa.tcpa_sec_debug`
- `runtime_snapshot.safe_water.nearest_boundary_m_debug`
- warning `debug_payload`
- `runtime_snapshot.qa.replay_recording`
- `runtime_snapshot.qa.seed`
- `runtime_snapshot.qa.fixed_tick_hz`
- `runtime_snapshot.qa.event_timing_tolerance_ticks`
- `runtime_snapshot.qa.validation_errors`

These fields should remain hidden in normal player mode unless a dedicated QA/debug overlay is active.

## Blocking Changes

None.

## Non-Blocking Notes

- The warning priority model is acceptable for scenario 1 because VTS is inactive. When VTS becomes active in a later scenario, UI/HUD should re-check whether VTS timeout or unsafe-intent warnings need higher priority than generic encounter/movement warnings.
- Scenario 1 has no hard danger polygon. UI should still keep the static `geometry.danger_polygons` binding tolerant of an empty array so later scenarios do not require a HUD contract rewrite.
- UI should treat numeric CPA/TCPA values as QA/debug data and keep the player-facing HUD qualitative, matching the Game Director decision pack.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0025 review result: **approved-for-hud-binding-plan**.

The Engine Runtime State Contract exports enough state for MVP HUD binding without UI-side maritime logic. No blocking contract changes are required before the HUD binding plan. UI/HUD should consume Engine-provided encounter, role, CPA/TCPA, warning, VTS, safe-water, and result states as read-only display data.
