# TASK-0095 - UI/HUD Scenario 2 Head-On Port-to-Port Spec

**Chat ID:** CHAT-UX-001  
**Department:** UI/UX HUD Designer  
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
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/watch-officer/audio-direction-sound-design-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`

## Task

Create the Scenario 2 UI/HUD spec for:

```text
Head-On Port-to-Port Drill
```

Documentation only. Do not edit code, assets, scenes, public files, production files, scenario data, or runtime logic.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md
```

The report must define:

- briefing screen wording and layout requirements;
- player-facing draft/non-final wording;
- live coaching cue set;
- allowed chips and priority rules;
- head-on / port-to-port state display rules;
- warning display rules for late action, CPA danger, and risk-increasing port alteration;
- result feedback wording;
- hidden debug/player-surface boundaries;
- visual comfort requirements from TASK-0091;
- audio hook notes from TASK-0092 if relevant, without implementing audio;
- desktop/mobile readability requirements;
- QA UI/HUD acceptance checklist;
- Engine state fields UI expects to receive.

## Required Boundaries

Keep:

- one primary cue plus up to two chips;
- UI display-only over Engine-owned state;
- no numeric CPA/TCPA in player mode;
- no classifier thresholds in player mode;
- no legal rule numbers in player mode;
- no final, official, certified, legally correct, or COLREGS-compliant training claims;
- no VTS popup for Scenario 2.

## Required Chat Reply

Use compressed project style:

```text
TASK-0095 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md
Tests: not run; documentation-only task.
Scope preserved:
- No code, scenario data, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims touched.
Next expected: Game Director review, then Engine implementation planning or QA review.
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
