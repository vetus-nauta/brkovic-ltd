# TASK-0079 - Watch Officer Scenario 1 Decision Coaching UX Spec

**Chat ID:** CHAT-UX-001  
**Department:** UI/HUD  
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
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md`

## Task

Create the UX/HUD specification for the Watch Officer `Scenario 1 Decision Coaching Pack`.

This is a spec task only. Do not edit Godot code, public files, production files, Captain Ether, Nav Desk, router/registry, auth, deploy config, or FTP.

## Spec Must Cover

- coaching cue placement and hierarchy during the active attempt;
- maximum number of simultaneous cues;
- cue states for:
  - safe-water corridor / lateral pair reading;
  - crossing target risk;
  - finish/result moment;
- player-facing wording for cues in concise professional style;
- post-attempt feedback reasons using existing Engine-owned warning/result state;
- what must remain hidden from player surface, including numeric CPA/TCPA debug values;
- reset behavior after `R`;
- mobile and desktop readability expectations;
- QA checklist for screenshots/browser smoke;
- explicit draft/non-final training wording.

## UX Boundaries

UI/HUD must remain display-only.

Do not compute:

- encounter class;
- CPA/TCPA;
- safe-water geometry;
- warning escalation;
- scenario result.

UI may only render state exported by Engine.

## Not Approved

Do not add:

- new scenario;
- VTS popup for scenario 1;
- new maritime rule;
- final training claim;
- official/certified/COLREGS-compliant wording;
- Captain Ether changes;
- Nav Desk changes;
- router/registry changes;
- auth changes;
- production deploy.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md
```

The spec must state one of:

- `approved-for-engine-planning`
- `changes-required`
- `blocked`

## Required Chat Reply

Use compressed project style:

```text
TASK-0079 done.
Report: game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md
Tests: not run; documentation-only task.
Scope preserved:
- Godot code, public/, Captain Ether, Nav Desk, router/registry, auth, production config, deploy state, and FTP not touched.
Next expected: Game Director review / Engine implementation task
```
