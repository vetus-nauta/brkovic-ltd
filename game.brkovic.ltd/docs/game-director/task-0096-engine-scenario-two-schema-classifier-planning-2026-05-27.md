# TASK-0096 - Engine Scenario 2 Schema / Classifier Planning

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
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`
- `game.brkovic.ltd/docs/watch-officer/runtime-step-orchestrator-foundation-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-encounter-classifier-report.md`
- `game.brkovic.ltd/docs/watch-officer/cpa-tcpa-numeric-debug-solver-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-result-evaluation-foundation-report.md`

## Task

Create an Engine planning report for adding Scenario 2 `Head-On Port-to-Port Drill`.

Documentation only. Do not implement code or edit scenario/schema files.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md
```

The report must define:

- current Scenario-1-specific constraints;
- proposed narrow schema generalization;
- proposed Scenario 2 data contract;
- head-on classifier planning boundaries;
- port-to-port pass detection planning;
- early starboard alteration event planning;
- risk-increasing port alteration event planning;
- CPA/TCPA integration assumptions;
- warning/result state changes needed;
- runtime snapshot fields for UI/HUD;
- replay fixture plan;
- test plan;
- files likely to change in a future implementation task;
- explicit stop conditions.

## Required Boundaries

Keep:

- Scenario 1 validation intact;
- Scenario 2 as one ownship and one power-driven target;
- thresholds scenario-local and debug/training only;
- `rule_review_status: "draft"` unless expert approval is separately recorded;
- IALA Region A only;
- VTS out of scope;
- no Region B;
- no final maritime training claim.

## Required Chat Reply

Use compressed project style:

```text
TASK-0096 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-two-engine-schema-classifier-planning.md
Tests: not run; documentation-only planning task.
Scope preserved:
- No code, scenario data, schema, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims touched.
Next expected: Game Director review, then implementation task split.
```

## Boundaries

- Documentation only.
- Do not edit code.
- Do not edit scenario JSON.
- Do not edit schema.
- Do not edit scenes.
- Do not edit assets.
- Do not run export.
- Do not deploy.
- Do not use FTP.
- Do not edit `public/`.
- Do not edit production files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not touch auth.
- Do not change production config.
- Do not activate VTS.
- Do not add Region B.
- Do not present Watch Officer as official, certified, COLREGS-compliant, legally correct, or final maritime training content.
