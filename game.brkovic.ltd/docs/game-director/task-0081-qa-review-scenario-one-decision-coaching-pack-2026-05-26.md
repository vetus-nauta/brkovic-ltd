# TASK-0081 - QA Review: Scenario 1 Decision Coaching Pack

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Approved

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-implementation-report.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md`

## Task

Review the TASK-0080 local Godot implementation of the Watch Officer `Scenario 1 Decision Coaching Pack`.

This is a QA review task only. Do not export, deploy, copy to `public/`, touch production files, use FTP, or modify code unless recording a report.

## Check Specifically

- coaching rail appears during `running`;
- ready state keeps briefing visible and coaching cleared;
- `R` reset clears coaching, hides result feedback, and returns to briefing;
- cue count never exceeds `1` primary cue + `2` chips;
- opening lateral-pair cue appears after start;
- safe-water cues follow Engine-owned `safe_water.state`;
- crossing-target cues follow Engine-owned `cpa_tcpa.state` / warning/result state;
- result cues follow Engine-owned scenario result state;
- post-attempt reason list is capped and tied to existing result/warning state;
- UI/HUD remains display-only and does not compute encounter class, CPA/TCPA, safe-water geometry, warning escalation, or scenario result;
- player surface does not expose numeric CPA/TCPA, thresholds, encounter confidence, debug closest points, replay seed/tolerance, raw geometry distances, legal rule numbers, or final-training claims;
- VTS remains disabled/inactive and no VTS popup appears;
- no new scenario or new maritime rule is introduced.

## Required Tests

Run the focused test:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/runtime/test_scenario_one_decision_coaching_pack.gd
```

Run full existing headless regression if feasible. If not feasible, explain exactly why.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md
```

The review must state one of:

- `approved-for-local-export-decision`
- `changes-required`
- `blocked`

Record:

- tests run and pass/fail summaries;
- review of cue behavior;
- review of hidden/debug data boundaries;
- review of no final-training claims;
- screenshot paths if produced;
- confirmation that QA did not touch public/export/deploy/production/Captain Ether/Nav Desk/router/auth files.

## Required Chat Reply

Use compressed project style:

```text
TASK-0081 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md
Status: <approved-for-local-export-decision / changes-required / blocked>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, export artifacts, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP not touched.
Next expected: Game Director local export decision or changes-required owner
```

## Boundaries

- Do not export.
- Do not deploy.
- Do not copy to `public/`.
- Do not touch Captain Ether.
- Do not touch Nav Desk.
- Do not touch router or registry.
- Do not touch auth.
- Do not touch production config.
- Do not use FTP.
- Do not add VTS to scenario 1.
- Do not add a new scenario.
- Do not add final maritime training claims.
