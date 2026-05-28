# Watch Officer QA Review: Engine / UI Runtime Contract

**Status:** approved-for-runtime-planning  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0026`  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`

## Purpose

This report reviews the Engine Runtime State Contract and UI/HUD Runtime State Review from the QA side.

It validates whether QA can test the MVP runtime contract without requiring UI/HUD to compute maritime logic.

This report does not implement gameplay, create playable scenes, change Engine loader/runtime code, implement UI, change public routes, modify Captain Ether, Nav Desk, auth, production config, or approve draft maritime rules as final training content.

## Sources Reviewed

- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-runtime-state-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-loader-implementation-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## QA Decision

The Engine/UI runtime contract is testable for runtime planning.

QA can validate the MVP without UI-side maritime logic because the contract assigns all rule-facing, risk-facing, result-facing, replay, and logging responsibility to Engine, while UI/HUD consumes exported state as read-only display data.

The approval is limited to runtime planning. Runtime implementation remains gated by the known environment blocker in the Engine contract and loader report: the Godot headless loader test has not passed because Godot 4.2+ CLI is not available in the current shell.

## Contract Checks

| Check | QA result |
| --- | --- |
| Engine owns encounter class and player role | Passed. `encounter.class`, `player_role`, expected initial values, confidence, and draft-training flags are Engine-owned. |
| Engine owns CPA/TCPA | Passed. Engine exports qualitative state and numeric QA/debug fields; UI can keep player mode qualitative. |
| Engine owns warnings | Passed. Warning severity, source, priority, text keys, spatial anchors, lifecycle ticks, and debug payload are Engine-owned. |
| Engine owns safe-water state | Passed. `safe_water.state`, active zone, boundary debug, corridor/shallow booleans, and finish gate state are Engine-owned. |
| Engine owns scenario result | Passed. Result states and scenario 1 success/failure rules are defined in the Engine contract. |
| Engine owns replay/event log | Passed. Required event envelope, event names, payloads, fixed tick assumptions, seed, and 1-tick tolerance are defined. |
| UI/HUD is display-only | Passed. UI review explicitly states that `runtime_snapshot` is the only live HUD source and UI must not compute/override rule state. |
| Player-mode and QA/debug fields are separable | Passed. UI review lists player-mode fields separately from QA/debug fields. |
| Draft/non-final status is testable | Passed. `rule_review_status`, `training_claim_status`, and `draft_training` are exported and reviewable. |
| Scenario 1 VTS inactive state is testable | Passed. Static and runtime VTS state require `enabled: false`, `state: inactive`, empty prompt/options, and no popup. |
| No out-of-scope work implied | Passed. Documents preserve boundaries against gameplay, playable scenes, public route, Captain Ether, Nav Desk, auth, production config, and final training claims. |

## Replay And Event Log Sufficiency

QA considers the proposed event names and payloads sufficient for future deterministic QA planning.

Required coverage is present for:

- scenario load start, success, and failure;
- loader error object inspection;
- runtime initialization;
- fixed tick timing;
- input recording;
- ownship and target state sampling;
- encounter state changes and initial mismatch;
- CPA/TCPA state changes with numeric values;
- geometry state changes with boundary and radius debug fields;
- warning raised, updated, and cleared lifecycle;
- scenario result changes;
- finish gate crossing;
- replay recording start and input/event log finalization.

VTS events are correctly deferred because scenario 1 has VTS disabled. The future event names `vts_prompt_opened`, `vts_answer_recorded`, `vts_timed_out`, and `vts_result_changed` are adequate as later-scenario placeholders.

## Blocking Changes

None.

## QA Conditions For Runtime Planning

- Runtime planning must keep Engine as the only owner of encounter, role, CPA/TCPA, warnings, safe-water state, result, replay, and event log truth.
- UI/HUD binding must consume `scenario_static` and `runtime_snapshot` as read-only display state.
- Player mode must hide numeric/debug fields unless a dedicated QA/debug overlay is active.
- Draft/non-final training status must remain visible wherever training claims or QA review surfaces are exposed.
- Scenario 1 must keep VTS inactive: no prompt, no options, no timeout, no scoring effect.
- Runtime implementation must not proceed as verified gameplay until the Godot headless loader test passes.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0026 result: **approved-for-runtime-planning**.

QA found no blocking contradiction in the Engine Runtime State Contract or UI/HUD Runtime State Review. The contract is testable, preserves Engine ownership of maritime/risk/result logic, keeps UI/HUD display-only, separates player and QA/debug fields, exposes draft/non-final status, makes scenario 1 VTS inactivity testable, and provides enough replay/event log structure for deterministic QA planning.

Known blocker remains environmental and pre-runtime: Godot 4.2+ CLI must be available and the headless loader test must pass before runtime implementation can be treated as verified.
