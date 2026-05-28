# TASK-0104 - Engine Scenario 2 Runtime State Export Contract / Orchestrator Integration Plan

**Chat ID:** CHAT-ENGINE-001
**Department:** Engine / Godot Architect
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer
**Date:** 2026-05-27
**Status:** Assigned

## Working Directory

```text
/home/alexey/WebstormProjects/watch-officer
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-port-to-port-pass-early-starboard-event-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-port-to-port-pass-early-starboard-event-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-classifier-event-log-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`

## Task

Create the Scenario 2 runtime state export contract and orchestrator integration plan.

This is a planning/contract task only.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md
```

## Required Content

Cover:

- Scenario 2 Engine-owned runtime state fields.
- Classifier state export.
- Early starboard alteration state export.
- Port-to-port pass state export.
- Event log names and payload boundaries.
- Snapshot fields for UI/HUD display-only binding.
- Orchestrator update order.
- Stop conditions against premature playable scene/UI/export work.
- QA acceptance criteria for the next implementation slice.

## Tests

Not required; documentation-only task.

## Boundaries

- Do not edit implementation code.
- Do not implement UI/HUD.
- Do not implement playable Scenario 2.
- Do not change result evaluation.
- Do not change warning escalation.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.
