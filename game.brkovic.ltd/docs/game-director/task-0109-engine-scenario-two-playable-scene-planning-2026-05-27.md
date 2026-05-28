# TASK-0109 - Engine Scenario 2 Playable Scene Planning

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
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-two-ui-hud-binding-foundation-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-ui-hud-binding-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-runtime-state-export-orchestrator-integration-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`

## Task

Create a narrow Engine planning report for local Scenario 2 playable-scene integration.

The plan must define the smallest implementation slice that can make Scenario 2 playable locally inside the Godot prototype after QA-approved Engine state export and HUD binding.

## Required Coverage

Cover:

- scenario loading / scenario path selection boundary;
- whether to reuse the existing playable greybox scene or create a separate scene wrapper;
- controller integration plan;
- HUD binding reuse plan;
- deterministic test plan;
- Scenario 1 regression guard;
- browser/export/deploy/public exclusion;
- stop conditions before export or production work.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-planning.md
```

## Boundaries

- Documentation only.
- Do not implement playable Scenario 2 code in this task.
- Do not export.
- Do not deploy.
- Do not edit `public/`.
- Do not touch Captain Ether, Nav Desk, router/registry, auth, production config, FTP, VTS, Region B, or final maritime training claims.
