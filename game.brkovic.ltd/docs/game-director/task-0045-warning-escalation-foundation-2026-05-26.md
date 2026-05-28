# TASK-0045 - Warning Escalation Foundation

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
- `game.brkovic.ltd/docs/watch-officer/qa-safe-water-geometry-monitor-review.md`
- `game.brkovic.ltd/docs/watch-officer/safe-water-geometry-monitor-report.md`
- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Task

Implement only a warning escalation foundation for deterministic headless tests.

This slice may read already computed `safe_water` and `cpa_tcpa` runtime states and produce a prioritized warning queue. It must not evaluate scenario result, complete/fail the scenario, move vessels, compute geometry, solve CPA/TCPA, create playable scenes, render UI, or present final maritime training claims.

## Allowed Work

- Add a small warning pipeline module under `scripts/sim/`.
- Add one headless test under `tests/runtime/`.
- Normalize safe-water and CPA/TCPA states into warning items.
- Prioritize warnings using the approved contract:
  1. CPA/TCPA `immediate`;
  2. CPA/TCPA `danger`;
  3. geometry `grounded`;
  4. geometry `shallow`;
  5. geometry `shallow_buffer`;
  6. geometry `corridor_buffer`;
  7. CPA/TCPA `caution`.
- Export `primary_warning` and `secondary_warnings`.
- Preserve deterministic `started_tick`, `updated_tick`, and optional `cleared_tick` fields.
- Emit warning transition events only if the existing event log foundation supports it cleanly.
- Run all existing headless tests plus the new warning pipeline test.
- Create a concise implementation report.

## Required Behaviour

Warning items must follow the contract shape:

```text
id: string
state: active | cleared
severity: caution | danger | immediate
priority: int
text_key: string
source: geometry | cpa_tcpa
related_entity_id: string
spatial_anchor_m: [float, float] | null
started_tick: int
updated_tick: int
cleared_tick: int | null
debug_payload: Dictionary
```

Required mapping:

- `safe_water.state == "corridor_buffer"` -> `warning.leaving_safe_water`, `geometry`, `caution`.
- `safe_water.state == "shallow_buffer"` -> `warning.shallow_water`, `geometry`, `caution`.
- `safe_water.state == "shallow"` -> `warning.shallow_water`, `geometry`, `danger`.
- `safe_water.state == "grounded"` -> `warning.grounding`, `geometry`, `immediate`.
- `cpa_tcpa.active == true` and `state == "caution"` -> `warning.cpa_risk`, `cpa_tcpa`, `caution`.
- `cpa_tcpa.active == true` and `state == "danger"` -> `warning.cpa_risk`, `cpa_tcpa`, `danger`.
- `cpa_tcpa.active == true` and `state == "immediate"` -> `warning.cpa_risk`, `cpa_tcpa`, `immediate`.
- `safe_water.state == "in_corridor"` and CPA/TCPA inactive or safe -> no active warning.

## Required Assertions

- no-warning baseline returns `primary_warning == null` and empty `secondary_warnings`;
- corridor buffer creates a caution leaving-safe-water warning;
- shallow buffer creates a caution shallow-water warning;
- shallow creates a danger shallow-water warning;
- grounded creates an immediate grounding warning without changing scenario result;
- CPA/TCPA caution creates a caution CPA warning only when active;
- CPA/TCPA danger outranks geometry caution;
- CPA/TCPA immediate outranks all non-result warnings;
- duplicate source warnings are deduplicated deterministically;
- repeated calls with same input return same ordered warnings;
- warning output does not mutate `safe_water`, `cpa_tcpa`, ownship, target, or scenario result;
- scenario result remains `ready`;
- no playable scene, UI, public route, Captain Ether, Nav Desk, auth, or production config work is included.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/warning-escalation-foundation-report.md
```

Record:

- files changed or added;
- exact Godot commands used;
- pass/fail output;
- confirmation that result evaluation, scenes, UI, public routes, Captain Ether, Nav Desk, auth, and production config remain unopened.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not implement scenario result success/failure evaluation.
- Do not implement collision checks.
- Do not implement movement.
- Do not compute safe-water geometry in this slice.
- Do not compute CPA/TCPA in this slice.
- Do not create playable scenes.
- Do not implement UI rendering.
- Do not touch `public/`.
- Do not touch Captain Ether.
- Do not touch game hub routing.
- Do not touch Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
