# Watch Officer Next Prototype Increment Decision

**Decision ID:** GD-20260526-13  
**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for UX specification task  
**Product:** Watch Officer

## Decision

The next Watch Officer production prototype increment is:

```text
Briefing + Result Feedback Pack
```

This increment combines two small player-facing improvements:

1. Pre-start briefing that tells the player the immediate watch objective.
2. End/result feedback that explains what happened in calm captain-report language.

## Reason

The first public prototype is live and technically verified. The next value is not a new scenario, new maritime rule, auth, or platform work. The next value is making the existing scenario easier to understand before and after play.

This improves player comprehension without expanding maritime risk.

## Product Direction

Keep the first scenario:

```text
Safe Water, Crossing Target
```

Keep current constraints:

- IALA Region A only;
- VTS disabled;
- one Region A lateral pair;
- one crossing target from starboard;
- safe corridor, shallow zone, caution buffers;
- draft/non-final training wording;
- no final maritime training claim.

## Approved Scope For Next Task

The next task is UX/HUD specification only.

It may define:

- briefing screen information hierarchy;
- start-state copy;
- result-state layout;
- feedback categories;
- warning/result wording guidelines;
- mobile readability notes;
- Engine state fields required for display.

It must not implement code.

## Not Approved

Do not add:

- second scenario;
- new mark lesson;
- VTS popup;
- new COLREGS/general maritime classifier;
- final maritime training claims;
- auth changes;
- platform router changes;
- production deploy;
- Captain Ether changes.

## Expected Follow-Up

After UX/HUD produces the spec, Engine may receive one combined implementation task:

```text
Briefing screen + result feedback screen implementation
```

QA then reviews the pack locally before any export or production deployment.
