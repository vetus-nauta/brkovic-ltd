# First Scenario Decision Pack

**Date:** 2026-05-26  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Approved for prototype planning  
**Scenario:** `Safe Water, Crossing Target`

## Purpose

This decision pack closes the first set of QA questions before any Watch Officer prototype code or Godot files are created.

The guiding principle is narrow scope: the first scenario should prove one readable navigation-and-traffic loop, not combine every planned system at once.

## Decisions

### 1. Primary Mark Lesson

**Decision:** Scenario 1 uses one Region A lateral pair as the primary mark lesson.

**Allowed:** one red port lateral mark and one green starboard lateral mark defining a simple channel/corridor in IALA Region A.

**Not in scenario 1:** cardinal marks, isolated danger marks, safe water mark as a primary lesson.

**Reason:** A lateral pair teaches corridor discipline clearly and gives Engine/QA a direct way to compare visible marks with `safe_corridor_polygon`.

**Consequence:** Follow-up scenarios can isolate safe water marks, cardinal marks, and isolated danger marks after the first loop is proven.

### 2. VTS In Scenario 1

**Decision:** VTS is deferred from scenario 1.

**Reason:** The first scenario already tests safe-water reading, heading-up control, crossing target awareness, and CPA recovery. Adding VTS would mix radio pressure into the first validation loop and increase QA surface.

**Consequence:** Scenario 1 contains no VTS popup. VTS becomes scenario 2 or later after navigation/traffic readability is validated.

### 3. CPA/TCPA Commitment

**Decision:** Qualitative CPA/TCPA is mandatory for scenario 1.

**Player HUD:** qualitative only: `safe`, `caution`, `danger`, `immediate`.

**QA/debug:** numeric CPA/TCPA values required in logs.

**Reason:** The crossing-target scenario cannot be validated without a consistent encounter-risk signal. Numeric player-facing CPA can wait; QA needs numeric logs now.

**Consequence:** Engine must implement qualitative state and numeric debug logging before scenario 1 can be accepted.

### 4. Geometry

**Decision:** Scenario 1 uses safe corridor + shallow zone + caution buffers. No hard danger polygon in the first scenario unless QA later requires a controlled critical fixture.

**Reason:** Shallow zone is enough to teach wrong-side consequences without introducing extra danger semantics.

**Consequence:** Critical failure fixtures can use grounding/collision. A hard danger polygon can be added in a later mark-specific scenario.

### 5. Prototype Approval Status

**Decision:** Prototype planning may proceed with `rule_review_status: "draft"` only if the build clearly marks content as draft/non-final training content.

**Reason:** Waiting for full maritime review before a technical prototype would slow architecture validation, but the prototype must not claim final training authority.

**Consequence:** Any public-facing demo or production release requires stricter review and a separate Game Director decision.

### 6. Final Training Claims

**Decision:** The prototype must not use authoritative phrases such as `correct rule`, `official`, `certified`, `COLREGS compliant`, or equivalent final-training claims.

**Allowed wording:** `scenario assumption`, `training draft`, `recommended action in this scenario`, `needs review`, `captain note`.

**Reason:** Maritime logic is still draft-reviewed.

**Consequence:** UI, Engine, and QA must treat evaluation copy as non-final until maritime review.

### 7. Replay Timing Tolerance

**Decision:** QA replay event timing tolerance is +/- 1 fixed simulation tick for state transitions in local prototype builds.

**Reason:** This is strict enough to catch nondeterminism while allowing minor implementation differences in event boundary ordering.

**Consequence:** Engine must log fixed tick rate and event ticks.

### 8. Success Criteria

**Decision:** Scenario 1 success requires:

- staying within the safe corridor;
- avoiding grounding;
- avoiding collision;
- producing safe or recovered CPA state;
- passing the finish gate;
- no critical warning active at finish.

**Reason:** This keeps success tied to navigation and traffic decisions only.

**Consequence:** No VTS score is part of scenario 1.

## Scenario 1 Summary

```text
Scenario: Safe Water, Crossing Target
Region: IALA Region A
Marks: one lateral pair
Geometry: safe corridor + shallow zone + caution buffers
Traffic: one power-driven target crossing from starboard
Player role: give-way in simplified draft training logic
VTS: disabled
CPA/TCPA: qualitative HUD, numeric QA/debug logs
Review status: draft allowed for prototype, not final training content
```

## Next Work

1. Engine updates prototype plan assumptions from this decision pack.
2. UI/HUD verifies that scenario 1 without VTS still supports the planned popup slot for later scenarios.
3. QA updates approval criteria around lateral pair, shallow zone, CPA/TCPA, and no-VTS scenario 1.
