# Watch Officer MVP Brief

**Status:** Draft for Game Director review  
**Owner:** Game Director  
**Date:** 2026-05-26

## MVP Goal

Prove that a compact top-down heading-up maritime scenario can teach safe decision-making through visual navigation, traffic interpretation, and concise feedback.

## MVP Session

- 5-7 minutes maximum.
- One scenario per session.
- One player vessel.
- One clear objective.
- One to three decisions.
- One professional evaluation at the end.

## MVP World

- Day mode only.
- Calm weather.
- Open water plus one simple channel.
- No open world.
- No large map.

## MVP Vessel

- Motor yacht only.
- Heading control.
- Simple speed levels.
- Turn-rate abstraction.
- No full hydrodynamics.
- No sailing physics.

## MVP Navigation

Include only:

- IALA Region A only.
- Cardinal marks.
- Lateral marks.
- Isolated danger mark.
- Safe water mark.
- Shallow zones.

All mark logic must be reviewed before final educational use.

Every scenario must declare `iala_region: "A"` in its scenario data. Region B is deferred until after MVP.

For scenario 1, use one Region A lateral pair as the primary mark lesson. Safe water mark, cardinal marks, and isolated danger mark are deferred to follow-up scenarios.

## MVP Traffic

Include:

- One traffic vessel per scenario.
- Crossing.
- Head-on.
- Overtaking.
- Qualitative CPA/TCPA state is mandatory for scenario 1. Numeric CPA/TCPA values are required in QA/debug logs.

Do not add random dense traffic.

## MVP Communication

Include:

- One simple VHF/VTS popup prompt in selected scenarios.
- Multiple choice or phrase constructor first.
- Typed responses later.

Captain Ether remains the deep radio trainer. Watch Officer uses radio only as situational pressure.

Scenario 1 has VTS disabled. VTS starts in a later selected scenario after the navigation/traffic loop is readable.

## MVP UI

- Heading-up as default.
- Player vessel in lower third.
- Forward view prioritized.
- Compact instruments.
- AIS target vector display.
- Mobile-first readability.

## MVP Consequences

Use graded consequences:

- Warning.
- Unsafe manoeuvre.
- Near miss / excessive CPA risk.
- Grounding.
- Collision.
- Checkpoint restart.

Avoid noisy arcade failure language.

## MVP Exclusions

Do not include:

- Multiplayer.
- Full 3D.
- Full hydrodynamics.
- Sailing physics.
- Radar.
- Complex night mode.
- Large map editor.
- Economy.
- Characters.
- Combat.
- Engine failures.
- Distress system.
- Complex TSS.
- Full VTS simulation.
