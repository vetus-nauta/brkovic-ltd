# Watch Officer QA / Validation MVP Report

**Status:** Draft for Game Director review  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`  
**Related task:** QA validation input for Watch Officer MVP

## Purpose

This report validates the Watch Officer MVP documentation set from a QA, rule-safety, scenario-data, UI/HUD, and Engine replay perspective.

It does not approve final maritime training content. It does not create or modify playable code, Godot files, API endpoints, routes, auth, production config, Captain Ether, Nav Desk, or game hub behaviour.

## Sources Reviewed

- `PATHS_QUICK.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-maritime-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/ui-hud-mvp-report.md`
- `game.brkovic.ltd/docs/watch-officer/engine-godot-prototype-report.md`
- `game.brkovic.ltd/docs/game-director/workstreams.md`
- `game.brkovic.ltd/docs/game-director/task-registry.md`

## Executive QA Finding

The Gameplay, UI/HUD, and Engine reports are broadly consistent for MVP approval planning:

- Watch Officer is a short, scenario-based, top-down, heading-up maritime decision simulator.
- The first scenario is `Safe Water, Crossing Target`.
- MVP scope is one ownship motor yacht, one traffic vessel, simple channel geometry, day/calm/good visibility, IALA Region A only, compact VTS prompt when enabled, qualitative CPA/TCPA, and calm professional evaluation.
- UI/HUD correctly depends on Engine-provided rule state instead of making maritime decisions from geometry.
- Engine correctly treats scenario JSON, deterministic fixed ticks, replay, and structured logs as QA requirements.
- All reports preserve the rule that unreviewed maritime logic is not final training content.

QA recommendation: proceed to Game Director review with conditions. The MVP is not blocked at documentation level, but the first scenario cannot be approved for prototype implementation until the open decisions in this report are resolved and scenario-data validation criteria are accepted.

## Rule Contradictions And Gaps

### No Critical Cross-Report Contradiction Found

No direct contradiction was found that would make the MVP concept impossible or internally inconsistent.

### Open Rule And Contract Gaps

These are not blockers for the documentation phase, but they become blockers before first scenario approval:

| Area | QA finding | Risk | Required decision |
| --- | --- | --- | --- |
| First scenario mark set | First 5 Minutes allows one safe water mark or lateral mark. Maritime recommends one safe water mark or one pair of Region A lateral marks, and says cardinal/isolated danger should not be added unless marks-over-traffic is the primary lesson. UI and Engine can support multiple mark types. | Scenario may teach too many concepts or create unclear safe-water interpretation. | Game Director must choose one primary mark lesson for scenario 1: safe-water mark, lateral pair, or both. |
| VTS presence | MVP brief says VTS appears in selected scenarios. First 5 Minutes says VTS may ask intention. Maritime recommends one VTS prompt only after enough time to read traffic. UI/Engine ask whether VTS pauses or not. | QA cannot define required screenshots/replays until VTS is required or optional for scenario 1. | Decide whether scenario 1 ships with VTS enabled, and whether it runs without pause. |
| CPA/TCPA commitment | MVP brief says CPA/TCPA warning only if technically cheap/readable. UI and Engine make qualitative CPA/TCPA state central to the first scenario contract. | Prototype expectation may exceed the brief if CPA/TCPA is treated as optional. | For scenario 1, QA recommends CPA/TCPA qualitative state be mandatory for validation, with numeric debug values required in logs. |
| Shallow vs danger geometry | First 5 Minutes says one shallow zone or danger area punishes the wrong side. Engine sample includes safe corridor, shallow zones, danger polygons, and buffers as required geometry. | Scenario may include hidden hard-fail geometry not explained by visible marks. | Define which polygons are active in scenario 1 and how each is explained visually and in evaluation. |
| Stand-on/give-way feedback | Maritime report uses simplified COLREGS behaviour for crossing from starboard, with stand-on/give-way notes still requiring review. | Player feedback could overstate legal training claims. | Scenario 1 should use the simplified role only as draft training logic until maritime reviewer approval. |
| Threshold values | Engine sample proposes CPA and classifier thresholds. Maritime report says these are training values and require verification. | Numeric thresholds could be mistaken for universal maritime rules. | Thresholds must be scenario-local and labelled as design/QA parameters, not legal constants. |
| Final evaluation labels | Product Bible promises professional evaluation. Maritime report requires reviewer approval for labels like correct, unsafe, failed watch, acceptable watch. | Final screen may imply certified instruction before review. | Evaluation copy must stay draft/non-final unless `rule_review_status: "approved"`. |

## `iala_region: "A"` Contract Validation

The `iala_region` contract is consistent across Product/Game Director, Gameplay, UI/HUD, and Engine documents.

QA acceptance contract:

- Every MVP scenario data file must include `iala_region`.
- The only accepted MVP value is exactly `"A"`.
- Missing, empty, lowercase, mixed, array, object, or any value other than `"A"` is a load-blocking validation failure for MVP.
- Region B support, Region A/B comparison teaching, mixed-region mark sets, and runtime region switching are out of MVP scope.
- UI may display Region A context but must not teach Region A vs Region B comparison in MVP.
- Engine must reject non-`"A"` scenario data before simulation starts.
- QA/development builds must expose the rejected reason clearly enough for bug reports.

Minimum negative test set:

```json
{ "iala_region": "B" }
{ "iala_region": "a" }
{ "iala_region": "" }
{ "iala_region": null }
{}
```

All five cases must fail MVP scenario loading.

## Scenario Data Validation Checklist

For each MVP scenario, QA must validate:

- Scenario identity: `schema_version`, `scenario_id`, `scenario_version`, title key, briefing key, author/source metadata if present.
- Review state: `rule_review_status` exists and is one of `draft`, `needs_changes`, or `approved`.
- Training claim state: `draft` and `needs_changes` scenarios are visibly not final training content in QA/debug and any educational claim surface.
- Region: `iala_region` exists and equals `"A"`.
- Mode: day, calm weather, good visibility, no night/radar/restricted-visibility assumptions.
- Ownship: exactly one motor yacht, deterministic spawn position/heading, collision radius, grounding radius, speed levels, initial speed, and turn rates.
- Target vessel: zero or one for MVP generally; exactly one for scenario 1; power-driven; deterministic spawn, heading, speed, collision radius, behaviour, and vector horizon.
- Encounter: expected initial class and role match scenario goal, especially `crossing` and `give_way` for scenario 1 if target crosses from starboard.
- Geometry: `safe_corridor_polygon`, shallow zones, danger zones, caution buffers, and finish gate exist where required.
- Geometry consistency: visible marks and hidden polygons do not imply different safe water.
- Mark inventory: mark type, position, visual variant, topmark where relevant, label key, visibility range, and Region A presentation are defined.
- CPA/TCPA: threshold ordering is coherent, horizon is defined, debug numeric values are available, and values are scenario-local training parameters.
- VTS: prompt id, trigger, timeout, options, result mapping, and completion blocking behaviour are defined if VTS is enabled.
- Scoring: expected action windows, reference track, severity mapping, and final outcome criteria are present.
- Replay: seed, fixed tick rate, input log compatibility, and expected final results exist for regression fixtures.
- Localization: text keys exist for briefing, warnings, VTS, and evaluation; QA should not require final English/Russian copy before rule approval, but missing keys are a scenario-data defect.

## UI/HUD Screenshot Checklist

For each scenario candidate, QA must capture and review:

- Desktop 16:9 at scenario start.
- Desktop 16:9 during first safe-water decision.
- Desktop 16:9 during crossing encounter before player action.
- Desktop 16:9 during CPA caution.
- Desktop 16:9 during CPA danger or immediate using a scripted mistake.
- Desktop 16:9 final evaluation/result screen.
- Mobile portrait at scenario start.
- Mobile portrait during first safe-water decision.
- Mobile portrait with VTS popup open if VTS is enabled.
- Mobile portrait with turn and speed controls visible during warning.
- Mobile landscape at scenario start.
- Mobile landscape with target vector crossing the intended path.
- Mobile landscape during CPA danger or immediate using a scripted mistake.

Screenshot pass criteria:

- Ownship remains in the lower third and never drifts above midpoint during normal play.
- Bow, heading line, projected vector, and warning ring are not covered by controls or VTS.
- Heading-up forward water is visually prioritized.
- Marks are readable at gameplay zoom and match Region A assumptions only.
- Safe corridor, shallow water, caution buffer, and danger area are distinguishable without relying only on colour.
- Target vessel heading and AIS vector are readable over every active water zone.
- Ownship vector and target vector cannot be confused.
- Warning stack shows the highest-priority active risk and does not cover the underlying geometry.
- VTS popup does not hide ownship, target, target vector, active mark, or immediate safe-water edge.
- Mobile controls do not overlap warning text, VTS options, or required route geometry.
- Text fits in likely English and Russian strings without overlap or layout shift.
- Draft/non-final scenario status is visible wherever the build presents training claims.

## Engine Replay And Logging Checklist

Engine validation must prove deterministic, inspectable behaviour:

- Fixed gameplay tick is scenario-defined and logged.
- Rendering may vary, but movement, collision, grounding, CPA/TCPA, warnings, VTS timers, scoring, and result state advance on fixed ticks.
- Replay input log includes scenario id/version, engine version, seed, fixed tick rate, and ordered input events.
- Event log includes run id, scenario id/version, engine version, seed, fixed tick rate, loaded region, review status, warning transitions, CPA/TCPA transitions, geometry state transitions, VTS transitions, collision/grounding/fail/success events, and final result.
- Numeric CPA/TCPA debug values are logged even if player HUD shows only qualitative states.
- Warning events include severity, source, priority, related entity id, spatial anchor if relevant, start tick, update tick, and text key.
- Geometry events include active zone id, state, boundary distance where available, and grounding/collision radius used.
- Encounter events include class, player role, confidence/debug fields, and mismatch errors against expected initial class.
- VTS events include prompt open tick, answer tick, selected option id, result, timeout state, and any declared-intention mismatch.
- Replay acceptance checks scenario id/version, compatible engine version, seed, fixed tick rate, final result, and key event timings within a documented tick tolerance.

Required first-scenario replay fixtures:

- Clean success: safe corridor maintained, early give-way action, safe CPA recovery, acceptable VTS if enabled.
- Minor: small safe-water correction or close mark pass with CPA remaining safe.
- Moderate: late but recoverable give-way action, warning issued, final route recovered.
- Serious: near-miss or CPA danger caused by delayed/unclear action, no collision.
- Critical: grounding, collision, hard danger polygon breach, or unrecoverable CPA immediate.

## First Scenario Approval Criteria

Scenario 1 can be approved for prototype implementation only when all criteria below are true:

- Game Director has approved the primary mark lesson.
- `iala_region: "A"` is present and enforced by validation.
- `rule_review_status` exists and the scenario is either clearly draft/non-final or approved by maritime review.
- Scenario contains one ownship and one deterministic power-driven crossing target.
- Initial encounter classification is `crossing`; player role is `give_way` if the target is from starboard.
- Safe-water geometry, shallow/danger geometry, caution buffers, and finish gate are defined and visually explainable.
- Marks and geometry agree.
- CPA/TCPA qualitative states are produced by Engine and can be compared to replay logs.
- Numeric CPA/TCPA debug data is available to QA.
- Warning priority order is deterministic.
- UI/HUD screenshot set passes desktop, mobile portrait, and mobile landscape review.
- At least five replay fixtures pass with stable final results.
- Evaluation language does not present draft maritime logic as final training content.
- VTS behaviour is explicitly decided if enabled: trigger, pause/no-pause, timeout, answer options, and result mapping.

## First Scenario Blocker Criteria

Scenario 1 must be blocked if any item below is true:

- Missing `iala_region`, or `iala_region` is anything other than `"A"`.
- Scenario teaches or displays Region B, Region A/B comparison, or mixed-region cues.
- Rule review state is missing.
- Draft scenario is presented as final training content.
- UI computes or overrides encounter class, player role, CPA/TCPA state, warning severity, or scenario outcome.
- Engine accepts scenario data with missing required geometry or undefined target behaviour.
- Marks imply a different safe route from the hidden safe corridor or hazard polygons.
- Initial encounter does not match expected `crossing`/player role for scenario 1 and no explicit Game Director exception exists.
- CPA/TCPA state cannot be reproduced from replay logs.
- Replays are nondeterministic with the same seed, tick rate, and input log.
- Collision, grounding, or hard danger breach can still finish as success.
- VTS popup hides the active navigation problem or its result mapping conflicts with scenario data.
- Final evaluation uses unapproved maritime claims as authoritative instruction.
- Any change requires Captain Ether, Nav Desk, auth, production config, public route, API, or real Godot file modifications before prototype approval.

## Maritime Claims Not Final Training Content

The following must remain draft/non-final until reviewed and marked approved by a qualified maritime reviewer:

- IALA Region A mark colours, shapes, topmarks, conventional direction of buoyage, and side-passing wording.
- Safe water mark meaning and any implication about how much surrounding water is safe.
- Cardinal mark topmark/band meaning and safe-side interpretation.
- Isolated danger mark interpretation, hazard radius, and safe passing distance.
- Shallow-water warning vs grounding thresholds.
- COLREGS crossing classifier thresholds, give-way/stand-on feedback, and when stand-on action becomes required.
- Head-on classifier thresholds, port alteration penalties, and use inside a channel.
- Overtaking classifier threshold, finally-past-and-clear condition, and channel/radio exceptions.
- CPA/TCPA warning, near-miss, and fail thresholds.
- Safe speed mapping from game speed levels to real-world stopping/reaction logic.
- VHF/VTS phrase options, whether a prompt is an instruction or intention report, and any radio discipline claim.
- Evaluation labels such as `correct`, `unsafe`, `failed watch`, `acceptable watch`, `professional`, or equivalent translated labels.

QA wording rule: before maritime approval, these may be described as scenario training assumptions, design thresholds, or draft review content, but not as final rule instruction.

## Questions For Game Director

Resolution status: answered for scenario 1 by `docs/game-director/first-scenario-decision-pack-2026-05-26.md`.

1. Should scenario 1 teach safe-water mark, Region A lateral pair, or both?
2. Is VTS enabled in scenario 1, or deferred to a later selected scenario?
3. If VTS is enabled, does it run with no pause, slow time, or pause?
4. Is qualitative CPA/TCPA mandatory for scenario 1 despite the MVP brief saying CPA/TCPA is included only if technically cheap/readable?
5. Should player HUD show only qualitative CPA state, while numeric CPA/TCPA remains QA/debug only?
6. Which geometry is active in scenario 1: shallow zone only, danger zone only, or both with different consequences?
7. What exact first-scenario approval status is acceptable before prototype work: `draft`, `needs_changes`, or only `approved`?
8. Who is the maritime subject-matter reviewer for marking scenario rules approved?
9. What wording should be used in draft builds to prevent final-training-content claims?
10. Should first-scenario success require a VTS accepted answer when VTS is enabled, or should VTS affect only communication score?
11. What tick tolerance should QA accept for replay event timing across local builds?
12. Should `rule_review_status: "approved"` be required before any public-facing Watch Officer demo, even if the prototype route is not yet production content?

## Game Director Resolution For Scenario 1

- Primary mark lesson: one Region A lateral pair.
- VTS: disabled in scenario 1.
- CPA/TCPA: qualitative state mandatory for player HUD; numeric values required in QA/debug logs.
- Geometry: safe corridor, shallow zone, caution buffers; no hard danger polygon unless QA later requires a controlled critical fixture.
- Prototype status: `rule_review_status: "draft"` is allowed only for prototype planning and only with clear non-final training wording.
- Public/final training claims: blocked until maritime review and separate Game Director decision.
- Replay timing tolerance: +/- 1 fixed simulation tick.
- Scenario success: safe corridor maintained, no grounding, no collision, recovered/safe CPA, finish gate passed, no critical warning active at finish.

## Report For ШЕФ ПРОЕКТА Watch Officer

QA found no critical contradiction across Gameplay, UI/HUD, and Engine reports. The main cross-stream risk is not disagreement, but unresolved approval detail: scenario 1 must choose one primary mark lesson, explicitly decide VTS behaviour, make qualitative CPA/TCPA mandatory or optional, and prevent draft maritime logic from appearing as final training content.

No issue outside the QA / Watch Officer docs zone was fixed or modified. If a future implementation requires changes to Captain Ether, game hub routing, Nav Desk, auth, production config, game code, or real Godot files before approval, QA recommends blocking and returning that request to the Game Director.
