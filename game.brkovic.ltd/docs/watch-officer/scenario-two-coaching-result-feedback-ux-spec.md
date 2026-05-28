# Scenario 2 Coaching + Result Feedback UX Spec

**Task:** `TASK-0123`  
**Owner Chat:** `CHAT-UX-001 / UI/UX HUD`  
**Date:** `2026-05-28`  
**Scenario:** `head-on-port-to-port`  
**Status:** `ready-for-engine`  
**Output:** `game.brkovic.ltd/docs/watch-officer/scenario-two-coaching-result-feedback-ux-spec.md`

## Scope

Define the next Watch Officer prototype UX increment for Scenario 2 only:

- Scenario 2 briefing behavior;
- Scenario 2 live coaching cues during the attempt;
- Scenario 2 result feedback after completion or terminal outcome;
- reset/back behavior for Scenario 2 state;
- QA acceptance checks for a future Engine implementation task.

Documentation only. No Godot code, scenes, scripts, tests, scenario data, public files, export artifacts, production deploy, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS expansion, Region B, or final maritime training claims are in scope.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/task-registry.md`
- `game.brkovic.ltd/docs/game-director/workstreams.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-playable-scene-slice-report.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-selector-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-production-scenario-selector-review.md`

## UX Decision

Scenario 2 may receive its own coaching and result feedback pack after the player selects `Scenario 2 - Head-On Port-to-Port Drill`.

The pack must remain display-only over Engine-owned state. UI/HUD may map Engine-exported scenario keys, warning keys, result status, and reason keys to player-facing text. UI/HUD must not compute head-on classification, first starboard alteration status, port alteration risk, port-to-port pass status, CPA/TCPA state, warning severity, scenario result, or maritime correctness.

The prototype remains a draft/non-final training prototype. Player-facing surfaces must keep this visible and must not claim official, certified, legally correct, COLREGS-compliant, or final maritime training status.

## Scenario 1 Preservation

This increment must not alter Scenario 1 behavior.

- Fresh boot/default selector state remains `Scenario 1 - Safe Water / Crossing Target`.
- Scenario 1 briefing, active coaching, result feedback, reset behavior, VTS inactive state, and public prototype route behavior remain as already approved.
- Selecting Scenario 2 only changes the active local scenario path and Scenario 2-specific player copy after the player starts that scenario.
- Returning to the selector must allow Scenario 1 to be reselected without stale Scenario 2 coaching, warning, or result copy.

## Player Flow

Recommended flow:

```text
Scenario selector -> Scenario 2 briefing -> Scenario 2 running coaching -> Scenario 2 result feedback -> Restart or Back to scenarios
```

The selector remains a local prototype selector, not a hub route, registry, product navigation, or deployment surface.

## Scenario 2 Briefing

Show before the attempt starts while Scenario 2 is selected and the runtime is in `ready`.

Required title:

```text
Head-On Port-to-Port Drill
```

Required draft line:

```text
Draft training scenario - not final maritime instruction.
```

Recommended briefing copy:

```text
Objective
Recognize the head-on risk, alter starboard early, and create a port-to-port pass.

Situation
One power-driven target is approaching on a reciprocal or nearly reciprocal course. Region A / VTS inactive. This is a controlled draft practice scenario.

Watch
Monitor the closing target. Make an early, clear starboard alteration. Avoid late action, port alteration that increases risk, collision, near miss, grounding, and unsafe water.

Controls
Turn port/starboard. Step speed down/up. Start when ready.
```

Briefing chips:

```text
Head-on risk
Alter starboard early
Port-to-port pass
Draft training
```

Do not show legal rule numbers, numeric thresholds, universal head-on definitions, final training claims, or debug values.

## Live Coaching Model

During `running`, show one compact coaching rail:

- one primary cue;
- up to two chips;
- no modal coaching;
- no stacked paragraphs;
- no numeric CPA/TCPA in player mode;
- no cue spam or layout shift when copy changes.

The draft/non-final status must remain visible as `Draft training` if it is not already visible elsewhere in the HUD.

## Coaching Cue Mapping

UI may display only the highest-priority applicable cue from Engine-exported state.

| Engine/input state | Primary cue | Chip candidates |
| --- | --- | --- |
| Opening/running, no stronger warning | `Head-on risk. Alter starboard early.` | `Head-on`, `Draft training` |
| Target closing, no stronger warning | `Monitor the closing target.` | `Head-on`, `Draft training` |
| `first_starboard_alteration_status == early` | `Early starboard alteration made.` | `Starboard early`, `Draft training` |
| `first_starboard_alteration_status == late` | `Late alteration. Act now.` | `Late action`, `Draft training` |
| `port_alteration_risk_status == risk_increasing` | `Port alteration increased risk in this scenario.` | `Port risk`, `Draft training` |
| `cpa_state == caution` | `CPA caution. Increase separation.` | `CPA caution`, `Draft training` |
| `cpa_state == danger` | `CPA danger. Avoid collision.` | `CPA danger`, `Draft training` |
| `cpa_state == immediate` | `Immediate CPA risk. Avoid collision.` | `CPA immediate`, `Draft training` |
| `port_to_port_status == achieved` and no stronger warning | `Port-to-port pass achieved.` | `Port-to-port`, `Draft training` |
| Terminal result | `Attempt complete. Review the captain note.` | Result category chip |

Allowed player chips:

```text
Head-on
Starboard early
Port-to-port
Late action
Port risk
CPA safe
CPA caution
CPA danger
CPA immediate
Draft training
```

## Cue Priority

Use this display priority when several states are active:

1. Terminal result.
2. Collision, near miss, grounding, or immediate CPA.
3. CPA danger.
4. Risk-increasing port alteration.
5. Late or unclear starboard action.
6. CPA caution.
7. Port-to-port achieved.
8. Early starboard confirmation.
9. Opening head-on risk cue.
10. Passive monitoring cue.

The UI must use Engine state and approved keys for priority. It must not infer severity from geometry, heading, or screen position.

## Result Feedback

Show when Scenario 2 reaches completed or terminal result state. Keep the panel calm and report-like.

Result hierarchy:

1. result category headline;
2. draft/non-final line;
3. scenario result value from Engine;
4. captain note summary;
5. up to three reason rows from Engine result/warning/reason keys;
6. restart and back-to-scenarios actions.

Display categories:

| Engine result/status | Player-facing headline |
| --- | --- |
| `success` or approved positive completion | `Attempt complete` |
| `warning_outcome`, `unsafe_manoeuvre`, `near_miss` | `Needs correction` |
| `collision`, `grounding`, `load_blocked` | `Unsafe manoeuvre recorded` |
| `ready`, `running`, `restart_requested`, `restart_ready`, `not_started` | Do not show final result screen. |

Required draft line:

```text
Draft training scenario - captain note, not final maritime instruction.
```

Recommended positive captain note:

```text
You recognized the head-on risk, made a clear starboard alteration, and produced a port-to-port pass in this draft scenario.
```

Recommended correction captain note:

```text
The attempt needs correction. Review the scenario reasons before restarting.
```

Recommended unsafe captain note:

```text
The attempt ended in an unsafe outcome for this draft scenario. Restart from ready state and correct the manoeuvre earlier.
```

## Result Reason Labels

Reason rows must come from Engine-owned result reason keys or warning keys. Show up to three, preserving Engine priority.

| Engine reason/warning | Player-facing label |
| --- | --- |
| `head_on_recognized` | `Head-on risk recognized.` |
| `early_starboard_alteration` | `Early starboard alteration made.` |
| `port_to_port_pass_achieved` | `Port-to-port pass achieved.` |
| `cpa_recovered` | `CPA state recovered in this scenario.` |
| `late_or_unclear_action` | `Alteration was late or unclear.` |
| `risk_increasing_port_alteration` | `Port alteration increased risk in this scenario.` |
| `near_miss` | `Near miss recorded.` |
| `collision` | `Collision recorded.` |
| `grounding` | `Grounding recorded.` |
| `unsafe_water` | `Simple-channel safe water was not maintained.` |

Do not show raw event ids, thresholds, replay seed, tick tolerance, classifier confidence, legal rule numbers, or numeric CPA/TCPA in player mode.

## Reset And Back Behavior

After `R` or Restart:

- Scenario 2 returns to ready/briefing state for the active selected path;
- active coaching rail is cleared;
- warning-derived and result-derived text is cleared;
- stale port-to-port, port-risk, late-action, and CPA chips are removed;
- draft/non-final wording remains visible on the briefing;
- Scenario 2 remains selected unless the player explicitly chooses another scenario.

Back to scenarios:

- returns to the selector;
- keeps the last selected scenario highlighted where local selector behavior already supports that;
- does not change the fresh-boot default of Scenario 1;
- must not carry Scenario 2 result/coaching copy into Scenario 1.

## Visual And Layout Requirements

Desktop:

- coaching rail in upper-left or upper-center, clear of target vector and ownship lower third;
- primary cue fits one line when possible, two lines maximum;
- result feedback readable at 1280x720 without horizontal scrolling.

Mobile:

- cue rail no taller than two short text rows plus compact chips;
- touch controls remain clear;
- result panel avoids horizontal scrolling;
- text must not cover ownship, target vector, or active warning geometry.

Visual tone must remain low-glare, professional, and stable. No aggressive flashing, full-screen red wash, panic animation, dense chart clutter, or toy/game-hub styling.

## QA Acceptance Checklist

- Fresh boot still defaults to Scenario 1 selected.
- Scenario 2 can be selected and starts with Scenario 2 briefing copy.
- Scenario 2 briefing shows draft/non-final wording and `Region A / VTS inactive`.
- Running Scenario 2 shows no more than one primary cue plus two chips.
- Opening head-on cue is visible before stronger warning/result cues.
- Starboard, late-action, port-risk, CPA, and port-to-port cues appear only from Engine-exported state.
- Player mode hides numeric CPA/TCPA, thresholds, classifier confidence, legal rule numbers, and debug data.
- Result feedback uses Engine result and reason keys only.
- Restart clears stale Scenario 2 coaching/result state and returns to ready briefing.
- Back to scenarios allows Scenario 1 reselect and does not alter Scenario 1 behavior.
- Draft/non-final wording remains visible in briefing, active attempt, and result.
- Forbidden official/certified/legal/COLREGS-compliant/final-training claims are absent.
- No hub route, registry, public deploy, VTS expansion, Region B, Captain Ether, Nav Desk, auth, production config, FTP, code, scene, script, test, public file, or export artifact change is introduced by this spec.

## Report For Game Director

Scenario 2 Coaching + Result Feedback Pack is ready for Game Director review and a future Engine implementation task. The spec keeps Scenario 2 display-only over Engine state, preserves Scenario 1 as the default and unchanged scenario, and keeps the prototype visibly draft/non-final.
