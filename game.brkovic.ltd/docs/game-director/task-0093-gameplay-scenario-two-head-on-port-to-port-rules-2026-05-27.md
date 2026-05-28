# TASK-0093 - Scenario 2 Head-On Port-to-Port Rules Decision Pack

**Chat ID:** CHAT-GAMEPLAY-001  
**Department:** Lead Maritime Gameplay Designer  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-scenario-one-production-prototype-status-2026-05-27.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-maritime-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/game-director/first-scenario-decision-pack-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/watch-officer/audio-direction-sound-design-spec.md`

## Task

Draft the Scenario 2 rules decision pack:

```text
Head-On Port-to-Port Drill
```

Goal:

```text
One power-driven target on reciprocal or nearly reciprocal course. The player must recognize the head-on situation early, alter to starboard, and create a port-to-port pass.
```

This is a rules/design document only. Do not implement code or scenario data.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md
```

The report must define:

- Scenario 2 learning objective;
- rule concept scope;
- fixed assumptions;
- target vessel setup;
- ownship starting setup;
- allowed player action;
- expected correct behavior;
- failure conditions;
- warning and coaching requirements;
- result feedback requirements;
- scenario data contract additions or generalizations needed;
- Engine implications;
- UI/HUD implications;
- QA acceptance checklist;
- unresolved maritime-rule questions;
- explicit out-of-scope list.

## Required Scenario Boundaries

Keep Scenario 2 narrow:

- one ownship;
- one power-driven target;
- reciprocal or nearly reciprocal course;
- early starboard alteration;
- port-to-port pass;
- open water or very simple channel only;
- IALA Region A remains the project scope;
- no Region B;
- no VTS unless separately assigned later;
- no random traffic;
- no radar/night/weather;
- no full narrow-channel training;
- no final maritime training claim.

## Required Risk Review

Call out whether the current prototype assumptions are Scenario-1-specific and need narrow generalization, including:

- `scenario_id`;
- target encounter fields;
- crossing-from-starboard assumptions;
- lateral-pair mark assumptions;
- loader/schema constraints;
- classifier naming;
- replay fixture naming.

## Required Chat Reply

Use compressed project style:

```text
TASK-0093 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md
Tests: not run; documentation-only task.
Scope preserved:
- No code, scenario data, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, or maritime final-claim changes touched.
Next expected: Game Director review, then QA/Maritime review or UI/HUD Scenario 2 spec assignment.
```

## Boundaries

- Documentation only.
- Do not edit code.
- Do not edit scenario JSON.
- Do not edit schema.
- Do not edit scenes.
- Do not edit assets.
- Do not export.
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
