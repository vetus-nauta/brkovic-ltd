# Watch Officer MVP Maritime Rules Report

**Status:** Draft for Game Director and maritime review  
**Owner Chat:** Gameplay & Maritime Rules - Watch Officer  
**Date:** 2026-05-26  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`  
**Related task:** `TASK-0005`

## Purpose

This report defines the minimum maritime rule set for the Watch Officer MVP. It is a gameplay and scenario design specification, not a final training authority.

No rule below should be shipped as final educational truth until it has been reviewed by a qualified maritime subject-matter reviewer and marked approved in QA.

## MVP Rule Position

The MVP should teach three practical habits:

1. Read marks to identify safe water before changing course.
2. Recognize simple power-driven vessel encounter geometry early.
3. Make calm, early, visible actions that keep the vessel safe.

The MVP should not teach edge cases, legal exceptions, local bylaws, night recognition, full lights and shapes, restricted visibility, radar plotting, traffic separation schemes, complex narrow-channel law, sailing-vessel priority, fishing vessels, vessels not under command, restricted ability to manoeuvre, towing, pilot vessels, or distress procedures.

## Marks And Safe Water Included In MVP

### Baseline Buoyage Assumption

MVP is fixed as IALA Region A only. Region B is outside MVP scope.

Every MVP scenario data file must still explicitly declare `iala_region: "A"`. Engine and QA must validate that this field exists. This keeps the data model ready for possible Region B support later without expanding the MVP.

The first playable scenario must not teach Region A vs Region B comparison.

### Included Mark Types

| Mark type | MVP use | Player lesson | Required verification |
| --- | --- | --- | --- |
| Lateral marks | Define port and starboard edges of a simple channel. | Stay inside the marked channel and understand the correct side relative to the conventional direction of buoyage. | Region A colour/shape, conventional direction of buoyage, local presentation, and scenario-side wording. |
| Cardinal marks | Mark the safe side of a hazard using north, east, south, or west meaning. | The named side of the mark is the safer side to pass. | Topmark orientation, colour bands, light omission in day mode, and exact safe-side interpretation. |
| Isolated danger mark | Mark one compact hazard with navigable water around it. | Do not pass close to the mark or treat it as a channel edge. | Safe passing distance, hazard radius, chart-note wording, and whether the MVP should show it before or after lateral marks. |
| Safe water mark | Mark mid-channel, channel entrance, landfall, or a confirmation point. | Navigable water is available around the mark; it is not itself a danger mark. | Use cases, visual design, and whether it may be used as a corridor centreline cue in the first scenario. |
| Shallow zone | Engine hazard and visual area, not a buoyage type. | Wrong water has consequences even when the vessel has not hit a visible object. | Depth threshold, grounding trigger, buffer zones, and whether the visual style can be understood without a chart. |

### MVP Safe Water Model

The game should not infer safety from buoy sprites alone. Each scenario needs explicit geometry:

- `safe_corridor_polygon`: the intended navigable corridor.
- `shallow_zone_polygons`: water that should warn, penalize, or ground the player.
- `danger_polygons`: isolated hazards or hard fail areas.
- `mark_positions`: visible cues that must agree with the hidden geometry.
- `recommended_track`: optional instructor/reference path for scoring and QA.

Marks are player-facing evidence. Geometry is the engine truth. QA must verify that the marks and geometry never contradict each other.

## COLREGS Situations Included In MVP

### Shared MVP Conditions

All MVP encounter scenarios should be limited to:

- Day mode.
- Good visibility.
- Vessels in sight of one another.
- One player motor yacht.
- One AI power-driven target vessel.
- No sailing vessels, fishing vessels, towing, restricted ability, not under command, constrained by draft, pilot status, traffic separation scheme, or restricted visibility.
- Clear CPA/TCPA scoring, if technically readable.

The MVP should use COLREGS principles as scenario rules, while clearly marking the content as awaiting maritime review.

### Crossing

**Included:** yes.

MVP scenario: one power-driven target crosses the player vessel's intended path.

Gameplay rule:

- If the target is on the player's starboard side and risk of collision exists, the player is the give-way vessel.
- The correct action is early and substantial enough to keep well clear, preferably by reducing speed, altering course to pass astern when safe water permits, or combining both.
- The player should be penalized for trying to cross close ahead of the stand-on vessel.
- If the target is on the player's port side, the player is normally stand-on in this simplified model, but still has a responsibility to avoid collision if the give-way vessel is not acting.

MVP scoring should reward early safe CPA improvement, not just final survival.

### Head-On

**Included:** yes.

MVP scenario: two power-driven vessels meet on reciprocal or nearly reciprocal courses with collision risk.

Gameplay rule:

- The expected action is an early alteration to starboard so the vessels pass port-to-port.
- The player should be warned for hesitation, repeated small alterations, or unclear motion.
- Altering to port in a developing head-on encounter should usually be serious or critical depending on distance and CPA.

Use this only in open water or a very simple channel until narrow-channel interactions are separately reviewed.

### Overtaking

**Included:** yes, but after crossing/head-on in scenario order.

MVP scenario: either the player overtakes a slower vessel or is overtaken by a faster vessel in a simple safe-water corridor.

Gameplay rule:

- The overtaking vessel keeps clear until finally past and clear.
- If the player is overtaking, the player must create and maintain safe lateral separation without forcing the overtaken vessel or leaving safe water.
- If the player is being overtaken, the player should maintain predictable course and speed unless danger develops.
- Doubt should be treated as overtaking for scoring in the simplified scenario classifier.

Overtaking in narrow channels, sound signals, and radio agreement should be deferred or marked as not final until reviewed.

## Rules Requiring Verification Before Educational Approval

The following items must not be treated as final training truth yet:

| Area | Verification needed |
| --- | --- |
| IALA Region A defaults | Confirm target geography for MVP. Region B toggle is a post-MVP/future-release question. |
| Lateral marks | Confirm colours, shapes, topmarks, conventional direction of buoyage, preferred-channel exclusions, and wording for "leave to port/starboard". |
| Cardinal marks | Confirm topmark orientation, colour bands, safe-side language, and simplified day-mode presentation without light rhythms. |
| Safe water marks | Confirm permitted MVP use as mid-channel/entrance/landfall cue and avoid implying that all surrounding water is safe at any distance. |
| Isolated danger marks | Confirm hazard radius, chart dependency, safe passing distance, and player feedback language. |
| Shallow water | Confirm when an off-track vessel receives warning vs grounding, especially if depth is abstracted. |
| COLREGS crossing | Confirm encounter classifier thresholds, stand-on/give-way feedback, and when stand-on action becomes required. |
| COLREGS head-on | Confirm "nearly reciprocal" angle threshold, port alteration penalties, and handling in a channel. |
| COLREGS overtaking | Confirm 22.5 degrees abaft beam classifier, finally-past-and-clear condition, and channel/radio exceptions. |
| CPA/TCPA | Define game thresholds for warning, near miss, and fail; these are scenario training values, not universal legal distances. |
| Safe speed | Confirm how speed levels map to stopping distance and readable reaction time. |
| VHF/VTS prompt | Confirm phrase options, whether the prompt represents VTS instruction or intention report, and avoid conflicting with Captain Ether scope. |
| Evaluation language | Maritime reviewer must approve any "correct", "unsafe", "failed watch", or "acceptable watch" labels. |

## Player Error Severity

Severity should be assigned from outcome risk, timing, and recoverability. The same action can become more severe when made later or closer to danger.

### Minor

Minor errors are safe but imperfect.

Examples:

- Slightly late course correction while CPA remains safe.
- Briefly entering a visual caution buffer but returning to the corridor.
- Passing closer to a mark than the instructor path but outside the danger buffer.
- Small, readable overcorrection that does not confuse the traffic situation.
- VTS response is imprecise but intention remains safe and understandable.

Consequence: captain-note in evaluation, small score loss, no restart.

### Moderate

Moderate errors create avoidable risk but remain recoverable.

Examples:

- Delayed give-way action that still restores safe CPA.
- Repeated small alterations instead of one clear manoeuvre.
- Unnecessary stand-on manoeuvre that creates ambiguity but no close-quarters situation.
- Entering a shallow-water warning zone without grounding.
- Speed remains too high near a mark, shallow area, or crossing target.
- Wrong or unclear VTS intention that does not cause immediate danger.

Consequence: active warning, meaningful score loss, possible checkpoint note if repeated.

### Serious

Serious errors create near-miss risk, rule-role failure, or major loss of safe water.

Examples:

- Player is give-way vessel and attempts to cross close ahead of the target.
- Late head-on alteration or alteration to port that produces close CPA.
- Overtaking without safe separation or before enough sea room is available.
- Leaving the safe corridor into a danger buffer.
- Ignoring a CPA/TCPA warning until only emergency action remains.
- Maintaining unsafe speed through a constrained channel.
- VTS answer declares an intention that conflicts with the actual manoeuvre.

Consequence: unsafe manoeuvre result, large score loss, near-miss classification, checkpoint restart if the situation cannot be recovered cleanly.

### Critical

Critical errors are failures.

Examples:

- Collision.
- Grounding.
- Entering a hard danger polygon.
- Turning toward the target at close range when risk of collision is already high.
- Persisting into a CPA breach after warnings.
- Wrong-side channel navigation that directly leads into shallow water or an isolated danger.
- Overtaking or crossing action that forces the target vessel into an impossible avoidance state.

Consequence: fail state, calm captain report, checkpoint restart.

## Data Needed By UI

UI needs scenario data that explains what to display without making rule decisions itself:

- Scenario title and short briefing.
- Current buoyage region from `iala_region`; MVP value must be `"A"`.
- Mark list with type, world position, visual variant, topmark, optional label, and visibility range.
- Safe-water visual hints: corridor edges, shallow tint, danger tint, caution buffer state.
- Player heading, speed level, turn-rate state, and track line.
- Target vessel bearing, range, relative side, heading, speed, vector, and AIS-style label.
- Encounter classification: crossing, head-on, overtaking, or none.
- Player role: give-way, stand-on, overtaking, overtaken, or caution.
- CPA/TCPA value or qualitative state: safe, caution, danger, immediate.
- Warning text keys, not hard-coded prose.
- VTS prompt id, answer options, selected answer, timeout state, and result state.
- Final evaluation fields: rule read, manoeuvre timing, safe-water discipline, traffic discipline, communication discipline, outcome.

UI must not show legalistic rule numbers as the primary teaching surface in MVP. It should display professional cues and concise instructor feedback.

## Data Needed By Engine

Engine needs deterministic scenario truth:

- Scenario id, version, author, review status, and source references.
- `iala_region: "A"`; required field for every MVP scenario.
- Coordinate frame, scale, viewport framing hints, and heading-up camera constraints.
- Ownship spawn position, heading, speed levels, turn-rate limits, stopping behaviour, and collision radius.
- Target spawn position, heading, speed, route vector, behaviour type, and collision radius.
- Mark positions, types, buoyage region, and intended safe-side/corridor relationship.
- Safe corridor polygons, shallow polygons, danger polygons, caution buffers, and finish gate.
- Encounter classifier thresholds for crossing, head-on, overtaking, none, and ambiguous.
- CPA/TCPA calculation parameters and warning thresholds.
- Scoring thresholds for minor, moderate, serious, critical.
- Event triggers: warning, unsafe manoeuvre, near miss, grounding, collision, VTS popup, finish, fail, restart.
- Reference solution path or expected action window for QA comparison.
- Replay seed and input log support for deterministic bug reports.

Engine should treat rule status as data. Any scenario with `rule_review_status: draft` must be visibly excluded from final training claims.

## Data Needed By QA

QA needs a validation matrix for each scenario:

- Scenario id and version.
- Rule sources checked.
- Required `iala_region` field present and equal to `"A"`.
- Maritime reviewer status: draft, needs changes, approved.
- Buoyage region and mark inventory.
- Expected safe route and known unsafe routes.
- Expected encounter class at scenario start and at key timestamps.
- Expected player role and correct action window.
- CPA/TCPA expected values for reference playthrough and common mistakes.
- Severity expectations for each scripted mistake.
- Pass/fail criteria for grounding, collision, leaving safe water, and near miss.
- UI screenshot checks for mark readability, heading-up orientation, target vector, warnings, and mobile legibility.
- Regression replay inputs for success, minor, moderate, serious, and critical outcomes.
- Explicit "not final training content" flag until reviewer approval.

## First Scenario Recommendation

For `Safe Water, Crossing Target`, use the smallest rule set that proves the product:

- One safe water mark or one pair of Region A lateral marks.
- One shallow zone outside the correct corridor.
- One crossing target from starboard so the player is clearly give-way.
- One VTS intention prompt only after the player has enough time to read the traffic geometry.
- Scoring for safe-water discipline, early give-way action, CPA recovery, and communication clarity.

Do not add cardinal and isolated danger marks to the first scenario unless the Game Director chooses marks-over-traffic as the primary lesson. They are better introduced in follow-up drills where each mark type can be isolated and evaluated.

## Game Director Decision

Решение: **MVP Watch Officer фиксируем как IALA Region A only**.

Сценарные данные должны явно хранить регион:

```json
{
  "iala_region": "A"
}
```

Region B не входит в MVP. Поддержка Region B остаётся будущим расширением, но Engine и QA должны с самого начала проверять наличие поля `iala_region`, чтобы модель данных не стала тупиком.

## External References Checked

These references were used only to frame the draft. They do not replace project maritime review.

- USCG Navigation Center, Amalgamated Navigation Rules International and U.S. Inland: `https://www.navcen.uscg.gov/navigation-rules-amalgamated`
- IALA Recommendation R1001, The IALA Maritime Buoyage System: `https://www.iala.int/product/r1001/`
- IALA R1001 PDF, Edition 2.0: `https://www.iala.int/content/uploads/2022/05/C75-10.3.7-Revised-Recommendation-R1001-Ed2.0-The-IALA-Maritime-Buoyage-System-June-2022.pdf`

## Report For ШЕФ ПРОЕКТА Watch Officer

Проблем вне зоны Gameplay & Maritime Rules не найдено.

Решение принято: MVP Watch Officer фиксируется как IALA Region A only; Region B не входит в MVP. В данных каждого сценария обязательно поле `iala_region: "A"`, Engine и QA должны валидировать его наличие.
