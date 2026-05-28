# Watch Officer QA Review: Target Kinematic Integrator

**Status:** approved-for-next-engine-slice  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0036`  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`

## Purpose

This report reviews `TASK-0035` from the QA side.

It confirms whether the target-only constant-course kinematic integrator is acceptable before geometry checks, CPA/TCPA solving, warning escalation, result evaluation, playable scenes, or UI implementation.

This report does not implement runtime code, gameplay, playable scenes, UI, Engine code changes, public routes, Captain Ether, hub routing, Nav Desk, auth, production config, or final maritime training content.

## Sources Reviewed

- `game.brkovic.ltd/docs/watch-officer/target-kinematic-integrator-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-ownship-kinematic-integrator-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## Verification Run

QA reran the documented headless tests locally with Godot `4.2.2.stable.official.15073afe3`.

Loader test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

Result:

```text
scenario_loader_test: 82 passed, 0 failed
```

Runtime bootstrap test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_runtime_bootstrap_state.gd
```

Result:

```text
runtime_bootstrap_test: 27 passed, 0 failed
```

Fixed tick and input log test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_fixed_tick_input_log.gd
```

Result:

```text
fixed_tick_input_log_test: 24 passed, 0 failed
```

Ownship kinematic integrator test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_ownship_kinematic_integrator.gd
```

Result:

```text
ownship_kinematic_integrator_test: 19 passed, 0 failed
```

Target kinematic integrator test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_target_kinematic_integrator.gd
```

Result:

```text
target_kinematic_integrator_test: 18 passed, 0 failed
```

## QA Decision

The target-only constant-course kinematic integrator is approved for the next Engine slice.

This approval is limited to deterministic target state integration and AIS vector endpoint projection. It does not approve geometry evaluation, CPA/TCPA solving, range/bearing calculation beyond bootstrap defaults, warning escalation, result evaluation, playable scenes, UI rendering, or final maritime training claims.

## Contract Checks

| Check | QA result |
| --- | --- |
| Loader test passed with 82 passed, 0 failed | Passed. Confirmed by local headless run. |
| Runtime bootstrap test passed with 27 passed, 0 failed | Passed. Confirmed by local headless run. |
| Fixed tick/input log test passed with 24 passed, 0 failed | Passed. Confirmed by local headless run. |
| Ownship kinematic integrator test passed with 19 passed, 0 failed | Passed. Confirmed by local headless run. |
| Target kinematic integrator test passed with 18 passed, 0 failed | Passed. Confirmed by local headless run. |
| Target starts at scenario spawn position `[150, 260]` | Passed. Test confirms scenario spawn position. |
| Target heading remains `270` | Passed. Test confirms heading starts and remains `270`. |
| Target speed remains `4.2` | Passed. Test confirms speed starts and remains `4.2`. |
| Target advances deterministically on heading `270` | Passed. Test confirms deterministic movement in the scenario negative X direction. |
| AIS vector endpoint is deterministic | Passed. Test confirms projected endpoint is deterministic from current target state and vector horizon. |
| Ownship position remains unchanged | Passed. Test confirms no ownship movement in this slice. |
| Scenario result remains `ready` | Passed. Test confirms result state remains unchanged. |
| Warnings remain unchanged | Passed. Test confirms warning state and `warnings.primary_warning` remain unchanged/null. |
| CPA/TCPA remains bootstrap-only and unchanged | Passed. Test confirms no CPA/TCPA state change and bootstrap `safe` remains only a default. |
| Range/bearing remain bootstrap defaults | Passed. Test confirms no range/bearing calculation is introduced in this slice. |
| Out-of-scope boundaries preserved | Passed. Report and tests do not imply geometry checks, CPA solver, warning escalation, result evaluation, playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, or production config work. |

## Blocking Changes

None.

## QA Conditions For Next Engine Slice

- Keep this target integrator limited to `constant_course_speed` until separate target behaviour work is assigned.
- Treat AIS vector endpoint as a visual/runtime projection only, not CPA/TCPA or encounter-risk logic.
- Do not compute range, bearing, CPA/TCPA, geometry state, warnings, or scenario result from target movement until the corresponding Engine slice is assigned and reviewed.
- Preserve deterministic fixed-tick behaviour and repeatable target movement for the same scenario data.
- Keep draft/non-final maritime status intact; target movement and AIS projection must not be described as final training content.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0036 result: **approved-for-next-engine-slice**.

QA confirms `TASK-0035` is acceptable as a target-only deterministic constant-course integration slice. It proves the target starts at `[150, 260]`, keeps heading `270`, keeps speed `4.2`, advances deterministically, and exports a deterministic AIS vector endpoint without changing ownship, result, warnings, CPA/TCPA bootstrap state, or range/bearing defaults.

No blocking changes are required. The approval does not extend to geometry checks, CPA/TCPA solver, warning escalation, result evaluation, playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, production config, or final maritime training content.
