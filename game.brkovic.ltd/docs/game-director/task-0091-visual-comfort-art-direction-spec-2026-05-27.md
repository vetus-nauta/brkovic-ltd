# TASK-0091 - Watch Officer Visual Comfort Art Direction Spec

**Chat ID:** CHAT-VISUAL-001  
**Department:** Visual Comfort / Art Direction Lead  
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
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/README.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/rules.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/onboarding.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/handoff.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/first-brief.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md`

## Task

Create the first Watch Officer visual comfort / art direction spec for the current public prototype direction.

This task prepares visual rules before Scenario 2 implementation. It must not change code, assets, exports, public files, production files, or scenario logic.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md
```

The report must define:

- target visual identity;
- prohibited styles;
- palette direction;
- line weight and geometry rules;
- water, safe-water, shallow, danger treatment;
- vessel, mark, AIS/vector treatment;
- decision coaching rail comfort rules;
- HUD readability rules;
- motion comfort rules;
- desktop/mobile readability criteria;
- accessibility and perception criteria;
- QA visual acceptance checklist;
- implementation handoff notes for UI/HUD and Engine.

## Required Direction

Watch Officer visual direction is:

```text
soft professional maritime simulator
```

Required:

- smooth and comfortable for the eye;
- not cartoon;
- not toy-like;
- not harsh engineering/CAD;
- no thin needle-like primary lines;
- no aggressive flashing;
- no decorative fantasy effects;
- readable under motion;
- credible for adult maritime decision practice;
- draft/non-final maritime training wording preserved.

## Required Chat Reply

Use compressed project style:

```text
TASK-0091 done.
Report: game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md
Tests: not run; documentation-only task.
Scope preserved:
- No code, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, scenario data, or maritime logic touched.
Next expected: Game Director review, then UI/HUD or Engine visual pass assignment.
```

## Boundaries

- Documentation only.
- Do not edit code.
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
- Do not create Scenario 2.
- Do not compute or redefine safe-water, CPA/TCPA, warning escalation, encounter classification, scenario result, VTS, or legal rule correctness.
- Keep Scenario 1 only, IALA Region A only, VTS disabled/inactive.
- Do not present Watch Officer as official, certified, COLREGS-compliant, legally correct, or final maritime training content.
