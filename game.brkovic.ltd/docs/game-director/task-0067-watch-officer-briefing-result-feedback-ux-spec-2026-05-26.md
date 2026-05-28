# TASK-0067 - Watch Officer Briefing + Result Feedback UX Spec

**Chat ID:** CHAT-UX-001  
**Department:** UI/HUD / Player Experience  
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
- `game.brkovic.ltd/docs/game-director/watch-officer-next-prototype-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## Task

Create a UX specification for the next Watch Officer prototype increment:

```text
Briefing + Result Feedback Pack
```

This task intentionally combines two small UX tasks for one role:

1. Pre-start briefing for the current scenario.
2. Result/feedback presentation after attempt completion.

This is documentation/specification only. Do not edit Godot files, public files, routing, registry, auth, Captain Ether, Nav Desk, production config, or deploy state.

## Required Design Scope

Define:

- pre-start briefing hierarchy;
- exact player-facing briefing copy in Russian and/or English if useful;
- what the player must understand before pressing Start;
- result screen/state hierarchy;
- feedback categories for:
  - acceptable watch;
  - needs correction;
  - failed/unsafe;
- how warnings should be summarized;
- how safe-water, CPA/TCPA, and scenario result should be shown without UI computing maritime logic;
- how draft/non-final training wording remains visible but not noisy;
- mobile readability requirements;
- QA acceptance checklist for screenshots and smoke.

## Existing Engine State Boundary

UI must render exported Engine state only.

UI must not compute:

- encounter class;
- safe-water state;
- CPA/TCPA;
- warning escalation;
- scenario result;
- maritime rule correctness.

Use these existing concepts as display inputs:

- scenario id/name;
- `iala_region: "A"`;
- `rule_review_status: "draft"`;
- VTS inactive/disabled;
- safe-water state;
- CPA/TCPA qualitative state;
- active warnings;
- scenario result;
- captain report/result fields.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md
```

The report must state one of:

- `approved-for-engine-implementation-plan`
- `changes-required`
- `blocked`

## Required Chat Reply

Use compressed project style:

```text
TASK-0067 done.
Report: game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md
Tests: not run; documentation-only task.
Scope preserved:
- Godot code, public/, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state not touched.
Next expected: Engine implementation plan / QA review / Game Director decision
```

## Boundaries

- Do not implement code.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add a new maritime rule.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
- Do not modify Captain Ether.
- Do not modify public production files.
- Do not deploy.
