# Watch Officer UI/HUD MVP Report

**Status:** Draft for Game Director, Engine, and QA review  
**Owner Chat:** Lead UI/HUD Designer - Watch Officer  
**Date:** 2026-05-26  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`  
**Related task:** `TASK-0006`

## Purpose

This report turns the MVP maritime rules report into the first screen UX plan for Watch Officer.

The MVP HUD must make a compact heading-up maritime situation readable before it becomes visually rich. The player should quickly understand safe water, ownship motion, target vessel motion, CPA risk, and any VTS prompt without reading legal rule text during the manoeuvre.

This is a design and data contract report only. It does not approve playable code, Captain Ether changes, Nav Desk changes, routing changes, auth changes, production config changes, or maritime rule finality.

## MVP HUD Position

The first playable screen should feel like a calm professional training display, not an arcade cockpit.

Primary design goals:

1. Keep forward water readable.
2. Keep the player vessel in the lower third.
3. Show target motion early enough for good decisions.
4. Surface risk state without covering the geometry that explains the risk.
5. Make mobile controls possible without hiding marks, shallow water, or traffic.
6. Keep all maritime rule claims behind scenario data and QA review.

The HUD should avoid dense panels, decorative cards, large banners, animated noise, and rule-number teaching during live play.

## First Screen Layout

### View Composition

Use a heading-up top-down playfield as the full screen.

Recommended screen regions:

| Region | Purpose | MVP behaviour |
| --- | --- | --- |
| Center playfield | Safe water, marks, ownship, target vessel, track, vectors | Always visible and never dimmed during normal play. |
| Lower third center | Ownship fixed reference point | Ownship remains near screen center-x and lower y, around 68-72 percent of viewport height. |
| Upper center | Forward decision space | Most safe water and traffic information appears here because heading-up means forward is up. |
| Upper left | Compact scenario/instrument strip | Scenario objective, heading, speed level, optional distance to finish. |
| Upper right | Warning stack | Current safety state, CPA/TCPA state, shallow/danger state. |
| Right side or upper right modal slot | VTS popup | Appears as a compact interrupt that does not cover ownship, target, or immediate corridor. |
| Bottom corners | Mobile controls | Port/starboard turn controls and speed controls with transparent hit zones. |

The first screen should not use a separate minimap in MVP unless QA later proves the heading-up playfield is insufficient. A mini north indicator is enough for orientation.

### Heading-Up Behaviour

Heading-up means ownship heading points toward screen top. The world rotates around ownship, while the camera biases forward.

Required behaviour:

- Ownship is visually stable in the lower third.
- Camera shows more water ahead than astern.
- Target vessel vectors and marks remain anchored to world positions.
- Text labels remain screen-readable and do not rotate with the world.
- A small north indicator or compass tick shows absolute orientation without competing with the main heading-up view.
- Heading changes should feel smooth enough to read, but not so smoothed that the vessel appears to ignore player input.

Recommended camera framing:

- About 65 percent of vertical view ahead of ownship.
- About 20 percent of vertical view abreast of ownship.
- About 15 percent of vertical view astern.
- Dynamic zoom is allowed only within narrow limits; it must not hide a developing CPA risk or the next mark.

## Ownship In Lower Third

Ownship should be the fixed visual anchor for the player.

Display requirements:

- Motor yacht silhouette or icon, centered horizontally.
- Bow direction clearly visible.
- Current heading line extending forward.
- Short recent track or wake line behind ownship.
- Optional projected ownship vector based on current heading and speed.
- Collision or grounding radius should be invisible by default, but available as a warning ring during caution, danger, and immediate states.

Lower-third placement must survive mobile UI:

- Controls may sit below and beside ownship, but must not cover the bow, heading line, target vector, or warning ring.
- On small portrait screens, ownship may move slightly higher, but should still remain below the visual midpoint.
- On landscape mobile, ownship can stay close to 70 percent viewport height because horizontal room is better.

## Safe Water Readability

The player must be able to distinguish safe water, shallow water, and danger at a glance without relying only on colour.

### Water And Zone Language

| Element | Visual role | MVP recommendation |
| --- | --- | --- |
| Safe corridor | Intended navigable water | Subtle clear-water band or edge cues, not a glowing lane. |
| Shallow zone | Recoverable risk area | Muted sand/green tint plus soft hatch or texture. |
| Caution buffer | Early warning around shallow/danger | Thin amber outline or pulse only when relevant. |
| Danger polygon | Hard or near-hard fail area | Stronger red-brown tint plus diagonal hatch. |
| Finish gate | Scenario completion | Simple transverse gate or waypoint marker, only visible when needed. |

The safe corridor must read through motion. Avoid tiny outlines that disappear while the world rotates. Use area contrast, edge contrast, and simple texture differences.

### Warning Progression On Water

Safe-water feedback should escalate in four visible steps:

| State | Water feedback | Player meaning |
| --- | --- | --- |
| Safe | Normal corridor and marks visible | No active safety problem. |
| Caution | Amber edge, short message, optional ownship ring | Correct soon. |
| Danger | Stronger tint, warning stack, ownship ring | Unsafe trend, immediate correction needed. |
| Immediate | Critical tint or brief flash, fail/restart if unrecoverable | Collision, grounding, or unavoidable critical breach. |

Do not tint the whole screen red. The dangerous geometry should remain visible so the player understands the cause.

## IALA Region A Mark Readability

The MVP is fixed to IALA Region A only. UI must display Region A marks clearly and must not include Region B switching, comparison teaching, or mixed-region cues.

### Mark Presentation

| Mark type | UI requirement | Notes |
| --- | --- | --- |
| Lateral mark | Distinct red port and green starboard mark shapes for Region A | Use shape and colour together. Scenario data defines the conventional direction and correct corridor relationship. |
| Cardinal mark | Clear black/yellow banding and topmark orientation | Use only if the scenario has been approved for cardinal teaching. |
| Isolated danger mark | Compact hazard marker with danger association | Do not let players confuse it with a corridor edge. |
| Safe water mark | Red/white safe-water marker cue | Use as a confirmation or entrance cue, not as proof that all surrounding water is safe. |
| Shallow zone | Area overlay, not a buoyage mark | Must be visually separate from mark symbols. |

Mark labels should be sparse:

- Use labels only when needed for tutorial clarity or QA review.
- Labels remain horizontal to the screen.
- Labels should not cover the mark body, safe corridor edge, ownship vector, or target vector.
- On mobile, labels collapse to short tokens or disappear unless the player taps/holds a mark.

### Region A Guardrails

The HUD should receive and display `iala_region: "A"` as scenario context, but it should not teach Region A/B comparison in MVP.

If the Engine sends any region other than `"A"` for an MVP scenario, UI should show a non-training blocked state for QA/development builds rather than silently rendering a possibly wrong lesson.

## Target Vessel And AIS Vector

The MVP has one target vessel per scenario. The target must be readable before it becomes a close-quarters situation.

### Target Display

The target vessel should show:

- Vessel icon with heading direction.
- AIS-style vector showing projected motion.
- Optional ghost tick at short future intervals if readable.
- Small label with target id or short name, range, and CPA state.
- Relative bearing/side state only if provided by Engine.

AIS vector design:

- Vector starts at the target vessel and points along its course over ground.
- Vector length scales by speed and selected time horizon, not by arbitrary drama.
- Use one consistent vector horizon in the first scenario, for example 60-90 seconds, unless Engine/QA chooses a scenario-specific value.
- Vector must stay visible over safe water, shallow water, and danger tints.
- Ownship vector and target vector must be visually distinct.

### CPA/TCPA Display

CPA/TCPA should be shown as a concise risk cue, not a numeric-heavy instrument panel.

Recommended live display:

- `CPA safe`
- `CPA caution`
- `CPA danger`
- `CPA immediate`

Numeric CPA/TCPA can appear in QA/debug builds and possibly in a compact advanced readout later. For MVP player UX, qualitative state is more important than precise decimals.

## Warning States

Warnings should be calm, hierarchical, and spatially connected to the risk.

### State Model

| State | HUD colour role | Sound/animation role | Example triggers |
| --- | --- | --- | --- |
| Safe | Neutral | None | Within safe corridor, CPA acceptable, VTS clear. |
| Caution | Amber | Subtle pulse or icon change | Late turn, entering buffer, CPA trending down. |
| Danger | Red/amber | Stronger persistent warning | Unsafe CPA, wrong side developing, shallow warning zone. |
| Immediate | Red/critical | Short critical alert, then result if applicable | Collision, grounding, hard danger polygon, unrecoverable CPA breach. |

The warning stack should show one primary warning and up to two secondary chips. Too many simultaneous messages will hide the geometry and turn the scenario into text scanning.

Recommended priority:

1. Collision or grounding immediate state.
2. CPA immediate/danger.
3. Leaving safe corridor or entering danger/shallow zone.
4. VTS prompt timeout or wrong intent.
5. Late or unclear manoeuvre.

### Warning Copy

Live warning copy should be short and professional:

- `CPA risk`
- `Shallow water`
- `Leaving safe water`
- `Late alteration`
- `VTS response due`
- `Collision`
- `Grounding`

Use text keys from scenario/runtime data. Do not hard-code final educational language in UI.

## VTS Popup Placement

The VTS popup is a situational pressure element, not the main game.

Placement:

- Desktop: right side, upper-right or mid-right, outside the ownship/target corridor whenever possible.
- Mobile portrait: bottom sheet above controls, no taller than about 35 percent of viewport.
- Mobile landscape: right side panel, narrow and dismiss-safe only after answering if the prompt is mandatory.

Behaviour:

- Appears only after the player has had enough time to read water and traffic geometry.
- Does not pause the scenario unless Game Director later approves pause behaviour.
- Uses multiple choice or phrase chunks for MVP.
- Shows selected answer and timeout/result state.
- If the prompt blocks visibility of a target or mark, it should shift to the alternate side or compact mode.

Popup content should be concise:

- Caller/source, for example `VTS`.
- One prompt line.
- Two to four answer options.
- Timer only when the scenario truly requires time pressure.
- Result state after answer: accepted, unclear, unsafe intent, or timed out.

## Mobile Control Model

Mobile controls must let the player make early, visible, calm manoeuvres without hiding the navigational problem.

### Controls

Recommended MVP control set:

| Control | Placement | Behaviour |
| --- | --- | --- |
| Turn port | Bottom left | Hold for continuous turn or tap for small heading step. |
| Turn starboard | Bottom right | Hold for continuous turn or tap for small heading step. |
| Speed down | Lower left/center | Step through speed levels. |
| Speed up | Lower right/center | Step through speed levels. |
| VTS answer | Popup options | Large enough for thumb selection. |

Speed should use discrete levels, matching the MVP brief:

- Stop or idle if Engine supports it.
- Slow.
- Cruise.
- Fast, only if scenario needs speed management.

The UI should show speed as a level and not as a full throttle simulation.

### Touch Ergonomics

Mobile rules:

- Minimum touch targets should be large enough for thumb use.
- Controls should have transparent or low-opacity backgrounds over water.
- Pressed state must be obvious.
- Controls must not shift layout when warning text changes.
- VTS popup must not steal accidental input from steering controls without visual feedback.
- Portrait and landscape both need QA screenshots.

Keyboard/gamepad controls can be supported later, but the MVP HUD should be designed mobile-first.

## UI Data Required From Engine

UI should display state, not decide maritime rules.

Required scenario/static data:

- Scenario id, title, version, and review status.
- `iala_region`, required as `"A"` for MVP.
- Brief objective and finish condition.
- Coordinate frame and viewport framing hints.
- Mark list with id, type, world position, visual variant, topmark, label key, visibility range, and verified region.
- Safe corridor polygon display data.
- Shallow zone polygons, danger polygons, caution buffers, and finish gate.
- VTS prompt definitions with text keys, answer options, timing, and result mappings.

Required runtime data:

- Ownship position, heading, speed level, turn-rate state, collision radius, grounding state, and recent track.
- Ownship projected vector and vector time horizon if Engine computes it.
- Target vessel position, heading, speed, vector, id/name, range, bearing, relative side, and visibility state.
- Encounter classification: crossing, head-on, overtaking, none, or ambiguous.
- Player role: give-way, stand-on, overtaking, overtaken, caution, or none.
- CPA/TCPA qualitative state: safe, caution, danger, immediate.
- Optional CPA/TCPA numeric values for QA/debug.
- Safe-water state: in corridor, caution buffer, shallow, danger, grounded.
- Warning queue with severity, priority, text key, related entity id, and spatial anchor if available.
- VTS popup state: inactive, active, answered, accepted, unclear, unsafe intent, timed out.
- Scenario result state: running, success, warning outcome, unsafe manoeuvre, near miss, grounding, collision, restart.

UI should not infer whether a crossing target is give-way or stand-on from geometry in MVP. Engine/scenario logic provides that state.

## QA Screenshot And Validation Checks

QA must validate both visual readability and rule-safe presentation.

### Required Screenshot Set

For each approved MVP scenario, capture:

- Desktop 16:9 at scenario start.
- Desktop 16:9 during first required decision.
- Desktop 16:9 during CPA caution.
- Desktop 16:9 during CPA danger or immediate, using a scripted mistake.
- Mobile portrait at scenario start.
- Mobile portrait with VTS popup open.
- Mobile portrait with turn and speed controls visible during warning.
- Mobile landscape at scenario start.
- Mobile landscape with target vector crossing the intended path.
- Final evaluation/result screen if present in the scenario flow.

### Visual Checks

QA should confirm:

- Ownship stays in the lower third and is not covered by controls.
- Heading-up forward water is prioritized.
- Marks are readable at gameplay zoom.
- IALA Region A mark presentation does not mix Region B assumptions.
- Safe water, shallow water, caution buffer, and danger polygons are distinguishable without colour alone.
- Target vessel heading and AIS vector are readable over every water zone.
- Ownship vector and target vector cannot be confused.
- Warning state does not hide the risk geometry.
- VTS popup does not cover ownship, target vessel, target vector, active mark, or immediate safe-water edge.
- Mobile touch controls do not overlap warning text or VTS options.
- Text fits in English and Russian localization candidates where applicable.

### Behaviour Checks

QA should confirm:

- Safe, caution, danger, and immediate states appear at the expected scripted moments.
- Warning priority is stable when multiple risks occur.
- CPA state changes match Engine output and replay logs.
- VTS prompt appears only at the intended trigger.
- VTS answer result matches scenario data.
- UI blocks or flags non-MVP `iala_region` values in QA/development builds.
- Draft maritime scenarios are visibly treated as not final training content where the build exposes educational claims.

## Open Decisions For Game Director

1. Whether the first scenario uses a safe-water mark, a pair of Region A lateral marks, or both.
2. Whether the first scenario includes numeric CPA/TCPA for players or only qualitative CPA state.
3. Whether VTS popup pauses nothing, slows time, or pauses only after a warning. UI recommends no pause for MVP unless testing shows the prompt is unreadable.
4. Whether mobile turn input should be hold-to-turn, tap-to-step, or both. UI recommends both, with hold as primary.
5. Whether the first scenario exposes labels on marks by default or only on tap/hover. UI recommends sparse labels, with QA/debug labels available.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0006 can move from Backlog to For Review after this report is accepted.

UI/HUD recommends the MVP first screen as a full-screen heading-up top-down playfield with ownship fixed in the lower third, forward water prioritized, qualitative CPA warning states, one AIS target vector, IALA Region A only mark rendering, compact VTS popup, and mobile-first controls. Engine must provide rule/classification states; UI should not decide maritime rules from geometry.

No problems outside the UI/HUD zone were found. The main dependency is that Engine and QA must preserve the `iala_region: "A"` contract and provide deterministic warning/CPA state for the HUD.
