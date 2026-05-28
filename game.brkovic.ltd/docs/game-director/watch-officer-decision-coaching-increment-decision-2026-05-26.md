# Watch Officer Decision Coaching Increment Decision

**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for UX specification  
**Product:** Watch Officer  

## Decision

The next Watch Officer prototype increment is:

```text
Scenario 1 Decision Coaching Pack
```

This increment improves the existing `Safe Water, Crossing Target` scenario by making the player's decision process clearer during the attempt and more useful in the post-attempt report.

## Reason

Watch Officer already has:

- public production prototype;
- deterministic Scenario 1 runtime;
- safe-water, CPA/TCPA, warnings, result evaluation;
- briefing and result feedback;
- production QA smoke approval.

The next product gap is not a new scenario, VTS, routing, auth, or deploy mechanics. The current priority is making the first playable loop feel like a compact training drill: the player should understand what is being watched, when risk is increasing, and why the result was acceptable or unsafe.

## Approved Scope

The pack may specify and later implement:

- concise in-run coaching cues driven by Engine-owned state;
- visible decision moments for safe-water corridor, crossing target, and finish/result;
- improved HUD wording for risk state without numeric CPA/TCPA in the player surface;
- post-attempt reason list tied to existing warning/result state;
- reset behavior preserving briefing and coaching state;
- QA checks for player-facing wording, visibility, and no final-training claims.

## Not Approved

This decision does not approve:

- new maritime rules;
- new scenario;
- VTS activation;
- Captain Ether changes;
- Nav Desk changes;
- router/registry changes;
- auth changes;
- production deploy;
- final maritime training claims;
- official, certified, or COLREGS-compliant wording.

## Required Sequence

1. UI/HUD creates the UX spec for the coaching cues and report wording.
2. Engine implements only after Game Director accepts the spec.
3. QA reviews locally before any export/deploy decision.

## Output Expected Next

```text
game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md
```

## Related Files

- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md`
