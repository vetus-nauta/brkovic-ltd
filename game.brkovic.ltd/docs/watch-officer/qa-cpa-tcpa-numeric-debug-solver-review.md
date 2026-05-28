# Watch Officer QA Review: CPA/TCPA Numeric Debug Solver

**Status:** approved-for-next-engine-slice  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0042`  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`

## Purpose

This report reviews `TASK-0041` from the QA side.

It confirms whether the CPA/TCPA numeric debug solver is acceptable before warning escalation, result evaluation, safe-water geometry checks, playable scenes, or UI implementation.

This report does not implement runtime code, gameplay, playable scenes, UI, Engine code changes, public routes, Captain Ether, hub routing, Nav Desk, auth, production config, or final maritime training content.

## Sources Reviewed

- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-encounter-classifier-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Verification Run

QA reran the documented headless tests locally with Godot `4.2.2.stable.official.15073afe3`.

Prior tests:

```text
scenario_loader_test: 82 passed, 0 failed
runtime_bootstrap_test: 27 passed, 0 failed
fixed_tick_input_log_test: 24 passed, 0 failed
ownship_kinematic_integrator_test: 19 passed, 0 failed
target_kinematic_integrator_test: 18 passed, 0 failed
range_bearing_relative_side_test: 23 passed, 0 failed
scenario_one_encounter_classifier_test: 16 passed, 0 failed
```

CPA/TCPA numeric debug solver test:

```bash
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_cpa_tcpa_numeric_debug_solver.gd
```

Result:

```text
cpa_tcpa_numeric_debug_solver_test: 21 passed, 0 failed
```

## QA Decision

The CPA/TCPA numeric debug solver is approved for the next Engine slice.

This approval is limited to deterministic Engine-side CPA/TCPA debug calculation, closest-point calculation, active-window evaluation, and mapping to scenario-local qualitative states. It does not approve warning escalation, result evaluation, safe-water geometry checks, playable scenes, UI rendering, or final maritime training claims.

## Contract Checks

| Check | QA result |
| --- | --- |
| All prior headless tests pass | Passed. Loader, bootstrap, fixed tick/input log, ownship, target, range/bearing, and scenario-1 classifier tests all passed locally. |
| CPA/TCPA numeric debug solver test passed with 21 passed, 0 failed | Passed. Confirmed by local headless run. |
| Solver returns numeric `cpa_m_debug` | Passed. Test confirms numeric CPA debug output. |
| Solver returns numeric `tcpa_sec_debug` | Passed. Test confirms numeric TCPA debug output. |
| Closest point positions are deterministic | Passed. Test confirms deterministic closest ownship and target points. |
| Qualitative state is one of scenario states | Passed. Test confirms output state is one of scenario `cpa_tcpa.qualitative_states`. |
| `active` respects TCPA active window | Passed. Test confirms active state inside the scenario active TCPA window. |
| Repeated calls with same inputs return same output | Passed. Test confirms deterministic repeat output. |
| Previous state and changed tick are preserved when provided | Passed. Test confirms `previous_state` and `changed_tick` preservation. |
| Warnings remain unchanged | Passed. Test confirms warnings are unchanged. |
| Scenario result remains `ready` | Passed. Test confirms result is unchanged and remains `ready`. |
| Safe-water geometry state remains unchanged | Passed. Test confirms safe-water geometry state is unchanged. |
| Encounter class remains existing scenario-1 draft output | Passed. Test confirms encounter remains `crossing` and role remains `give_way`. |
| No warning or result event is emitted | Passed. Test confirms no warning/result event is emitted by this slice. |
| Out-of-scope boundaries preserved | Passed. Report and tests do not imply warning escalation, result evaluation, safe-water geometry checks, playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, or production config work. |

## Blocking Changes

None.

## QA Conditions For Next Engine Slice

- Treat CPA/TCPA values and qualitative state as scenario-local draft technical logic, not final maritime training content.
- Do not emit warnings, result changes, or evaluation labels from this solver without a separate warning/result slice.
- Preserve deterministic output for identical inputs, including closest points and active-window behaviour.
- Keep CPA/TCPA thresholds documented as scenario training parameters, not universal legal distances.
- Keep UI display-only: UI may render exported CPA/TCPA state later but must not compute or override it.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0042 result: **approved-for-next-engine-slice**.

QA confirms `TASK-0041` is acceptable as a deterministic CPA/TCPA numeric debug solver. It returns numeric CPA/TCPA values, deterministic closest points, active-window state, scenario-local qualitative state, and preserves previous state/tick fields while leaving warnings, scenario result, safe-water state, and encounter output unchanged.

No blocking changes are required. The approval does not extend to warning escalation, result evaluation, safe-water geometry checks, playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, production config, or final maritime training content.
