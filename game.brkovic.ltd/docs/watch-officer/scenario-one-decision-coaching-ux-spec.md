# TASK-0079 - Scenario 1 Decision Coaching UX Spec

**Status:** approved-for-engine-planning  
**Owner Chat:** CHAT-UX-001 / UI/HUD  
**Date:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`  
**Output:** `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`

## Scope

Define the Watch Officer Scenario 1 Decision Coaching Pack:

- active-attempt coaching cue hierarchy;
- cue placement and maximum simultaneous cues;
- cue wording for safe-water, crossing-target, and finish/result moments;
- post-attempt feedback reasons tied to existing Engine-owned warning/result state;
- hidden player-surface data;
- reset behavior after `R`;
- desktop/mobile readability expectations;
- QA screenshot and browser smoke checklist.

Documentation only. No Godot code, public files, production files, Captain Ether, Nav Desk, router/registry, auth, deploy config, FTP, new scenario, VTS, or new maritime rule is in scope.

## Sources Reviewed

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-briefing-result-feedback-review.md`

## UX Decision

Approved for Engine planning.

Decision coaching must be display-only. UI/HUD may render Engine-exported state, warning text keys, and result fields. UI/HUD must not compute encounter class, CPA/TCPA, safe-water geometry, warning escalation, scenario result, or maritime rule correctness.

## Active Attempt Cue Model

Use one compact coaching rail during `running`.

Recommended placement:

- Desktop: upper-left under the scenario/status strip.
- Mobile portrait: top band below status line, no taller than two short text rows.
- Mobile landscape: upper-left or upper-center, clear of ownship lower third and steering controls.

Cue hierarchy:

1. Primary cue: one active decision message.
2. Risk chip: one concise CPA/safe-water state chip if relevant.
3. Draft chip: small persistent `Draft training` label, only if not already visible in the HUD.

Maximum simultaneous cues:

- Player mode: 1 primary cue + 2 chips.
- QA/debug mode: player cues + optional debug row.
- Never show stacked paragraphs, multiple coaching cards, or modal coaching during live control.

The coaching rail should disappear or reduce to chips when no decision cue is active.

## Cue State Inputs

UI reads existing Engine-owned state:

- `scenario_state`
- `scenario_result`
- `draft_training`
- `rule_review_status`
- `training_claim_status`
- `iala_region`
- `safe_water.state`
- `cpa_tcpa.state`
- `warnings.primary_warning`
- `warnings.secondary_warnings`
- `vts.enabled`
- `vts.state`
- `finish_gate_crossed`

UI may render static scenario facts from loaded scenario data:

- scenario title;
- Region A lateral pair;
- VTS disabled;
- target vessel visible/AIS vector if already exported to HUD.

## Safe-Water / Lateral Pair Cues

Purpose: help the player understand that the lateral pair and corridor are the first decision, without teaching a new rule or computing safe water.

Cue triggers must be driven by Engine state or simple attempt phase, not UI geometry inference.

| Engine/input state | Primary cue | Chip |
| --- | --- | --- |
| Attempt just started and no active warning | `Read the lateral pair. Stay in the marked corridor.` | `IALA A` |
| `safe_water.state == in_corridor` and no stronger cue | `Hold the corridor.` | `Safe water` |
| `safe_water.state == corridor_buffer` | `Correct early. You are near the corridor edge.` | `Corridor caution` |
| `safe_water.state == shallow_buffer` | `Shallow water ahead. Turn back into safe water.` | `Shallow caution` |
| `safe_water.state == shallow` | `Unsafe water. Recover immediately.` | `Shallow water` |
| `safe_water.state == grounded` | Result cue takes priority. | `Grounded` |

Do not display Region A/B comparison or side-passing legal instruction in the coaching rail.

## Crossing Target Risk Cues

Purpose: make the target-risk moment readable without exposing numeric CPA/TCPA or doing UI-side encounter logic.

Cue triggers must use Engine `cpa_tcpa.state`, warning queue, and existing target visibility/vector state.

| Engine/input state | Primary cue | Chip |
| --- | --- | --- |
| Target visible, CPA safe, no stronger safe-water cue | `Monitor the crossing target.` | `CPA safe` |
| `cpa_tcpa.state == caution` | `CPA caution. Make your intention clear early.` | `CPA caution` |
| `cpa_tcpa.state == danger` | `CPA danger. Increase separation now.` | `CPA danger` |
| `cpa_tcpa.state == immediate` | `Immediate CPA risk. Avoid collision.` | `CPA immediate` |
| `scenario_result == near_miss` | Result cue takes priority. | `Near miss` |
| `scenario_result == collision` | Result cue takes priority. | `Collision` |

Player mode must not show:

- numeric CPA;
- numeric TCPA;
- classifier thresholds;
- encounter confidence;
- debug closest-point coordinates;
- legal rule numbers.

## Finish / Result Moment Cues

Purpose: make the end of the attempt understandable while preserving Engine ownership of success/failure.

| Engine/input state | Primary cue | Chip |
| --- | --- | --- |
| `finish_gate_crossed == true` and result not terminal yet | `Finish crossed. Awaiting result.` | `Finish` |
| `scenario_result == success` | `Attempt complete. Review the captain note.` | `Acceptable watch` |
| `scenario_result == warning_outcome` | `Attempt complete with warnings. Review corrections.` | `Needs correction` |
| `scenario_result == unsafe_manoeuvre` | `Unsafe manoeuvre recorded. Review the warning summary.` | `Needs correction` |
| `scenario_result == near_miss` | `Near miss recorded. Review CPA risk.` | `Needs correction` |
| `scenario_result == grounding` | `Grounding recorded. Restart from ready state.` | `Unsafe watch` |
| `scenario_result == collision` | `Collision recorded. Restart from ready state.` | `Unsafe watch` |
| `scenario_result == load_blocked` | `Scenario load blocked. QA review required.` | `Blocked` |

The result screen remains the detailed post-attempt surface. In-run finish cues should be short.

## Cue Priority

When multiple states are active, use this display priority:

1. Terminal result cue.
2. Engine primary warning with `immediate`.
3. CPA/TCPA `immediate` or `danger`.
4. Safe-water `grounded`, `shallow`, or `shallow_buffer`.
5. Engine primary warning with `danger` or `caution`.
6. CPA/TCPA `caution`.
7. Safe-water `corridor_buffer`.
8. Opening lateral-pair cue.
9. Passive target monitoring cue.

UI may choose which text to show based on Engine state and this priority table. UI must not create a new severity state.

## Post-Attempt Feedback Reasons

Enhance the existing result feedback with a short reason list. Reasons must come from Engine result and warning state only.

Player-facing reason list:

- Show up to three reasons.
- Use Engine warning priority order.
- Use scenario result as the first reason when terminal failure occurs.
- If no warnings exist for `success`, show `Safe corridor maintained` and `CPA recovered or safe` only if these are provided by Engine/result fields or accepted static result labels for `success`.

Recommended reason labels:

| Engine source | Reason label |
| --- | --- |
| `scenario_result == success` | `Scenario completed without grounding or collision.` |
| `scenario_result == warning_outcome` | `Completed with active warnings.` |
| `scenario_result == unsafe_manoeuvre` | `Unsafe manoeuvre recorded.` |
| `scenario_result == near_miss` | `CPA risk became excessive.` |
| `scenario_result == grounding` | `Grounding recorded.` |
| `scenario_result == collision` | `Collision recorded.` |
| `warning.cpa_risk` | `CPA risk increased.` |
| `warning.shallow_water` | `Shallow-water risk increased.` |
| `warning.leaving_safe_water` | `Safe-water corridor was not maintained.` |
| `warning.late_alteration` | `Manoeuvre was late or unclear.` |

Do not claim final maritime correctness. Use `captain note`, `scenario assumption`, or `draft training` wording where needed.

## Hidden From Player Surface

Keep these hidden in normal player mode:

- numeric CPA/TCPA values;
- CPA/TCPA threshold values;
- encounter classifier confidence;
- expected action windows;
- debug closest-point positions;
- replay seed and tick tolerance;
- warning `debug_payload`;
- raw geometry distances;
- loader validation internals;
- legal rule numbers;
- final/official/certified training claims.

QA/debug mode may expose these fields if already available.

## Reset Behavior After `R`

After `R` reset:

- attempt returns to `ready`;
- briefing is visible again;
- active coaching rail is cleared;
- warning-derived cue text is cleared;
- result feedback is hidden;
- scenario tick/time return to reset state as Engine currently defines;
- first running cue after next Start is the opening lateral-pair cue;
- VTS remains disabled/inactive.

UI must not preserve stale danger/result cue text after reset.

## Draft / Non-Final Wording

Required player-visible wording:

```text
Draft training scenario - not final maritime instruction.
```

Where visible:

- briefing screen;
- active attempt as compact label if not already present in HUD;
- result feedback screen;
- QA/debug overlay with `rule_review_status`, `training_claim_status`, and `draft_training`.

Do not display official, certified, final training, final maritime instruction, or similar claims.

## Mobile And Desktop Readability

Desktop:

- cue rail must not cover target vector, ownship, lower-third vessel, or warnings;
- primary cue should fit in one line when possible, two lines maximum;
- result feedback reason list should remain readable at 1280x720.

Mobile portrait:

- cue rail is a top band, not a center modal;
- text wraps to two short lines maximum;
- touch controls remain clear;
- no numeric debug fields in player mode.

Mobile landscape:

- cue rail stays outside steering and speed controls;
- target vector and corridor remain visible;
- result screen does not require horizontal scrolling.

All modes:

- no more than 1 primary cue + 2 chips;
- no animated cue spam;
- no layout shift when cue text changes;
- no VTS popup in scenario 1.

## QA Screenshot And Browser Smoke Checklist

Screenshots:

- Ready state with briefing visible.
- Running state with opening lateral-pair cue.
- Running state with safe corridor / safe CPA cue.
- Running state with corridor or shallow caution cue, if fixture can trigger it.
- Running state with CPA caution/danger cue, if fixture can trigger it.
- Terminal success/result feedback with reason list, if fixture can trigger it.
- Terminal unsafe/result feedback with reason list, if fixture can trigger it.
- Reset after `R`, showing briefing visible and coaching cleared.
- Mobile portrait running cue.
- Mobile landscape running cue.

Browser smoke:

- `/play/watch-officer/` loads and canvas remains non-empty.
- Ready state still shows briefing.
- Space starts the attempt and hides briefing.
- Opening coaching cue appears during running.
- Cue count never exceeds 1 primary cue + 2 chips.
- Player surface does not show numeric CPA/TCPA.
- VTS remains false/inactive and no VTS popup appears.
- Result feedback uses Engine result/warning state only.
- `R` clears coaching and returns to ready/briefing state.
- Draft/non-final wording remains visible.
- Forbidden final-training claims are absent.
- Captain Ether route remains separate.
- Router/registry, Nav Desk, auth, production config, deploy state, and FTP are untouched by this task.

## Blocking Changes

None.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0079 result: **approved-for-engine-planning**.

The Scenario 1 Decision Coaching Pack can move to Game Director review and then an Engine implementation task. UI/HUD must stay display-only, use Engine-owned safe-water/CPA/warning/result state, keep VTS disabled for scenario 1, hide numeric CPA/TCPA in player mode, and preserve draft/non-final training wording.
