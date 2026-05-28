# TASK-0049 - Runtime Step Orchestrator Foundation

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
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-result-evaluation-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-result-evaluation-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-warning-escalation-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/minimal-runtime-planning-skeleton.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a headless runtime step orchestrator foundation for deterministic tests.

This slice may call already implemented modules in the approved fixed-tick order and export one runtime snapshot after a step. It must not create playable scenes, render UI, add new maritime logic, add new movement rules, add event semantics, implement restart flow, or present final maritime training claims.

## Allowed Work

- Add a small orchestrator module under `scripts/runtime/` or `scripts/core/`.
- Add one headless test under `tests/runtime/`.
- Wire already implemented modules only:
  - fixed tick state;
  - ownship kinematic integrator;
  - target kinematic integrator;
  - range/bearing updater;
  - scenario-1 encounter classifier;
  - CPA/TCPA numeric debug solver;
  - safe-water geometry monitor;
  - warning escalation pipeline;
  - scenario result evaluator;
  - runtime snapshot exporter, if compatible.
- Run all existing headless tests plus the new orchestrator test.
- Create a concise implementation report.

## Required Fixed-Tick Order

The orchestrator must preserve this order:

1. Apply queued input records for the tick, if provided.
2. Update ownship using the existing ownship integrator.
3. Update target using the existing target integrator.
4. Update target range/bearing/relative side.
5. Classify scenario-1 encounter.
6. Solve CPA/TCPA debug state.
7. Evaluate safe-water geometry.
8. Build warning queue.
9. Evaluate scenario result.
10. Export runtime snapshot.

## Required Behaviour

- Accept validated scenario data and a runtime state dictionary.
- Accept tick-indexed input records, including an empty input list.
- Return a new runtime state or snapshot without mutating the caller's source dictionaries unexpectedly.
- Advance exactly one deterministic fixed tick.
- Preserve scenario 1 assumptions: IALA Region A, VTS disabled, one target from starboard.
- Keep UI/HUD as display-only output; do not add UI code.
- Keep result evaluation limited to the already approved evaluator.
- Keep collision as an explicit external flag only; do not compute collision geometry here.

## Required Assertions

- orchestrator advances exactly one tick;
- update order is deterministic and QA-readable;
- no-input baseline produces a snapshot with ownship, target, encounter, CPA/TCPA, safe-water, warnings, result, VTS inactive, and QA/debug fields;
- repeated calls from the same initial state and same inputs produce the same snapshot;
- source scenario data is not mutated;
- source input records are not mutated;
- result remains non-terminal for the baseline first step;
- warnings are produced only from the existing warning pipeline;
- CPA/TCPA is produced only from the existing debug solver;
- safe-water state is produced only from the existing geometry monitor;
- no event semantics, restart flow, playable scene, UI, public route, Captain Ether, Nav Desk, auth, production config, or final maritime training claim is introduced.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/runtime-step-orchestrator-foundation-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that playable scenes, UI, public routes, Captain Ether, Nav Desk, auth, and production config remain unopened.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not create playable scenes.
- Do not implement UI rendering.
- Do not implement restart flow.
- Do not add event semantics.
- Do not add new maritime rule logic.
- Do not add new movement rules.
- Do not compute collision geometry.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
