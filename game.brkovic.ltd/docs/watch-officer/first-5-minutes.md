# Watch Officer First 5 Minutes

**Status:** Draft  
**Owner:** Game Director  
**Date:** 2026-05-26
**Decision pack:** `docs/game-director/first-scenario-decision-pack-2026-05-26.md`

## Purpose

This document defines the first playable experience. All departments should optimize toward this before expanding scope.

## Scenario Working Title

Safe Water, Crossing Target

## Player Setup

The player controls a motor yacht in day mode, calm weather, heading-up view.

The vessel is placed in the lower third of the screen. Ahead is a simple channel with visible marks and one traffic vessel crossing the intended path.

## Player Objective

Proceed through the safe-water corridor without leaving safe water, grounding, or creating an unsafe encounter with the traffic vessel.

## Situation

- IALA Region A only.
- One Region A lateral pair establishes the channel corridor.
- One shallow zone punishes the wrong side.
- One traffic vessel crosses ahead.
- AIS shows the traffic target vector.
- VTS is disabled in scenario 1.

## Player Decisions

1. Identify safe water from marks.
2. Adjust heading to stay in the correct corridor.
3. Adjust speed or course to avoid unsafe CPA with the crossing vessel.

## Success

The player passes the channel and maintains a safe encounter geometry.

## Warnings

- Late alteration.
- Passing too close to a mark or shallow zone.
- Excessive CPA risk.

## Failure

- Grounding.
- Collision.
- Leaving safe water in a critical way.

## Evaluation Tone

The evaluation should read like a calm captain report:

- What was read correctly.
- What was late or unsafe.
- What should be done next time.
- Whether the watch is acceptable, needs correction, or failed.

## Department Notes

Gameplay must define verified mark and encounter rules.

UI/UX must keep the forward view clear.

Engine must make vessel movement readable before making it physically detailed.

QA must flag any rule that is uncertain or educationally unsafe.

## Scenario 1 Constraints

- Primary mark lesson: Region A lateral pair.
- Deferred mark lessons: safe water mark, cardinal marks, isolated danger mark.
- VTS: disabled.
- CPA/TCPA: qualitative player HUD, numeric QA/debug logs.
- Geometry: safe corridor, shallow zone, caution buffers.
- Review state: draft allowed for prototype only with clear non-final training wording.
