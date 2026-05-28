# TASK-0047 - Scenario Result Evaluation Foundation

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/qa-warning-escalation-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/warning-escalation-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-safe-water-geometry-monitor-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a scenario result evaluation foundation for deterministic headless tests.

This slice may read already computed `safe_water`, `cpa_tcpa`, `warnings`, and explicit external result flags. It must not compute collision geometry, move vessels, compute safe-water geometry, solve CPA/TCPA, create playable scenes, render UI, or present final maritime training claims.

## Allowed Work

- Add a small scenario result evaluator under `scripts/sim/`.
- Add one headless test under `tests/runtime/`.
- Evaluate result state from already-computed runtime inputs only.
- Preserve previous result if no terminal condition has occurred.
- Run all existing headless tests plus the new scenario result evaluator test.
- Create a concise implementation report.

## Result States In Scope

Allowed output states for this slice:

- `ready`
- `running`
- `success`
- `warning_outcome`
- `near_miss`
- `grounding`
- `collision`

Out of scope for this slice:

- `load_blocked`
- `unsafe_manoeuvre`
- `restart_requested`
- `restart_ready`

## Required Behaviour

Inputs may include:

```text
safe_water.state
safe_water.finish_gate_crossed
cpa_tcpa.state
cpa_tcpa.active
warnings.primary_warning
warnings.secondary_warnings
external_flags.collision_detected
previous_result
tick
```

Required mapping:

- If `external_flags.collision_detected == true`, result becomes `collision`.
- If `safe_water.state == "grounded"`, result becomes `grounding`.
- If active CPA/TCPA is `immediate`, result becomes `near_miss`.
- If finish gate is not crossed and no terminal condition exists, result remains `running` or previous non-terminal state.
- If finish gate is crossed with no active warnings and CPA/TCPA is safe or inactive, result becomes `success`.
- If finish gate is crossed with only caution warnings active, result becomes `warning_outcome`.
- If finish gate is crossed with danger or immediate warnings active, result must not become `success`; choose the matching serious state if available, otherwise remain `warning_outcome`.
- Terminal result states must be sticky: `success`, `warning_outcome`, `near_miss`, `grounding`, and `collision` do not downgrade on later calls.

## Required Assertions

- baseline running state remains non-terminal before finish gate;
- finish gate crossed with safe state returns `success`;
- finish gate crossed with caution warning returns `warning_outcome`;
- finish gate crossed with danger CPA warning does not return `success`;
- active CPA/TCPA immediate returns `near_miss`;
- grounded safe-water state returns `grounding`;
- explicit collision flag returns `collision`;
- terminal result states are sticky and do not downgrade;
- result output includes `state`, `previous_state`, `changed_tick`, `reason`, `active_warning_ids`, and `debug_payload`;
- evaluator does not mutate `safe_water`, `cpa_tcpa`, `warnings`, ownship, or target;
- no event semantics are opened in this slice;
- no collision geometry, movement, safe-water geometry computation, CPA/TCPA computation, playable scene, UI, public route, Captain Ether, Nav Desk, auth, or production config work is included.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-result-evaluation-foundation-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, and production config remain unopened.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not implement collision geometry checks.
- Do not implement movement.
- Do not compute safe-water geometry in this slice.
- Do not compute CPA/TCPA in this slice.
- Do not implement restart flow.
- Do not implement action-window or unsafe-manoeuvre evaluation.
- Do not create playable scenes.
- Do not implement UI rendering.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
