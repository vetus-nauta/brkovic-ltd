# Scenario 2 Head-On Port-to-Port UI/HUD Spec

**Task:** `TASK-0095`  
**Owner Chat:** `CHAT-UX-001 / UI/UX HUD Designer`  
**Date:** `2026-05-27`  
**Scenario:** `Head-On Port-to-Port Drill`  
**Status:** `ready-for-game-director-review`  
**Scope:** Documentation only. No code, scenario data, schema, scenes, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims changed.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`
- `game.brkovic.ltd/docs/watch-officer/audio-direction-sound-design-spec.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`

## UI Goal

Scenario 2 UI/HUD should teach one narrow draft practice pattern:

```text
Recognize head-on risk, alter starboard early, and create a port-to-port pass.
```

The interface must remain calm, readable, and display-only over Engine-owned state. It must not compute encounter class, CPA/TCPA, warning severity, result status, or maritime rule correctness.

## Briefing Screen

Required briefing title:

```text
Head-On Port-to-Port Drill
```

Required briefing body:

```text
Draft training scenario. One power-driven target is approaching on a reciprocal or nearly reciprocal course. Recommended action in this scenario: alter starboard early and create a port-to-port pass.
```

Required limitation text:

```text
Draft training scenario - not final maritime instruction.
```

Briefing layout:

- concise title;
- one short scenario paragraph;
- three compact objective chips;
- persistent draft/non-final status chip;
- launch control consistent with Scenario 1;
- no legal rule numbers;
- no numeric thresholds;
- no claim of official or certified training.

Suggested objective chips:

```text
Head-on risk
Alter starboard early
Port-to-port pass
```

## Live Coaching Cue Set

Player mode may show one primary cue plus up to two chips.

Primary cue candidates:

```text
Head-on risk. Alter starboard early.
Monitor the closing target.
Make a clear starboard alteration.
CPA caution. Increase separation.
Late alteration. Act now.
Port alteration increased risk in this scenario.
CPA danger. Avoid collision.
Port-to-port pass achieved.
```

Cue wording must stay scenario-specific. Avoid universal rule claims.

## Chip Set

Allowed chips:

```text
Head-on
CPA safe
CPA caution
CPA danger
CPA immediate
Port-to-port
Late action
Draft training
```

Do not show:

- numeric CPA/TCPA;
- heading threshold values;
- classifier confidence;
- legal rule numbers;
- raw geometry values;
- replay seed/tolerance;
- `COLREGS compliant`;
- `legally correct`;
- `official`.

## Priority Rules

Priority order:

1. Terminal result state.
2. Collision / immediate CPA.
3. CPA danger.
4. Risk-increasing port alteration.
5. Late or unclear action.
6. CPA caution.
7. Port-to-port achieved.
8. Opening / monitoring cue.
9. Draft/non-final status chip.

The UI must render priority from Engine state. UI must not infer or reorder maritime severity from geometry.

## Head-On And Port-To-Port Display

The player-facing HUD may display:

```text
Head-on risk
Port-to-port
CPA caution
Alter starboard early
```

The HUD must not display:

```text
universal head-on threshold
required manoeuvre in real navigation
COLREGS-compliant
legally correct
```

The port-to-port pass indicator should appear only after Engine exports a pass relationship or result state. UI must not infer it from screen position alone.

## Warning Display

Warning display must follow the visual comfort spec:

- no aggressive flashing;
- no full-screen red wash;
- no panic animation;
- no thin warning lines;
- warning states must use color plus text/chip/shape;
- caution uses amber or muted warm emphasis;
- danger may use controlled red-orange or warm red;
- immediate risk may use stronger emphasis but must remain readable.

Warning copy:

| Engine state | Player cue |
| --- | --- |
| `late_action` | `Late alteration. Act now.` |
| `risk_increasing_port_alteration` | `Port alteration increased risk in this scenario.` |
| `cpa_caution` | `CPA caution. Increase separation.` |
| `cpa_danger` | `CPA danger. Avoid collision.` |
| `port_to_port_achieved` | `Port-to-port pass achieved.` |

## Result Feedback

Result screen should use calm captain-note style.

Recommended positive reasons:

```text
Early starboard alteration made.
Port-to-port pass achieved.
CPA state recovered in this scenario.
```

Recommended correction reasons:

```text
Alteration was late or unclear.
Port alteration increased risk in this scenario.
Near miss recorded.
Collision recorded.
Simple-channel safe water was not maintained.
```

Result labels:

- `Attempt complete`
- `Needs correction`
- `Unsafe manoeuvre recorded`
- `Captain note`

Avoid:

- `failed watch`;
- `legal failure`;
- `COLREGS fail`;
- `certified pass`;
- `safe to navigate`.

## Visual Comfort Requirements

Use the TASK-0091 direction:

- soft professional maritime simulator;
- low-glare maritime palette;
- broad readable vectors and boundaries;
- no needle-thin primary lines;
- no cartoon vessel styling;
- no dense chart clutter;
- no aggressive flashing;
- stable HUD placement;
- readable 1280x720 desktop and mobile browser layouts.

Ownship, target, and vectors must remain visible under the cue rail. Cue rail must not cover the target vector, ownship lower third, or active warning geometry.

## Audio Hook Notes

TASK-0092 audio direction is an input only. Scenario 2 UI/HUD may expose future event names for audio hooks, but no audio implementation is approved by this spec.

Possible future hooks:

```text
scenario2_head_on_opening
scenario2_starboard_action_confirmed
scenario2_port_alteration_warning
scenario2_cpa_danger
scenario2_port_to_port_success
scenario2_result_needs_correction
```

Critical information must remain visible without audio.

## Desktop And Mobile Requirements

Desktop:

- cue rail in upper-left or upper-center, clear of the forward target;
- compact chips below or beside primary cue;
- result feedback readable without scrolling at 1280x720;
- no debug data in player mode.

Mobile:

- cue rail no more than two short text rows plus chips;
- chips may wrap to one compact row;
- touch controls must not cover ownship or result notes;
- text must not overlap target vector or warning geometry.

## Expected Engine State Fields

UI expects Engine to export display-ready fields:

```text
scenario_id
scenario_title
rule_review_status
training_claim_status
encounter_class
encounter_status
player_role_status
cpa_state
warning_level
primary_cue_key
status_chip_keys
port_to_port_status
first_starboard_alteration_status
port_alteration_risk_status
scenario_result_status
scenario_result_reasons
vts_active
debug_visible
```

UI must not compute these fields.

## QA UI/HUD Acceptance Checklist

- Briefing clearly states draft/non-final training status.
- Opening cue appears before player action.
- Player mode shows one primary cue and no more than two chips.
- UI never exposes numeric CPA/TCPA or classifier thresholds.
- UI never displays legal rule numbers in player mode.
- UI renders `Head-on risk` and `Port-to-port` only from Engine state.
- Late action and port alteration warnings are visually distinct.
- VTS popup is absent.
- Draft/non-final wording remains visible in briefing, active attempt, and result.
- Forbidden final/certified/official/COLREGS-compliant claims are absent.
- Desktop and mobile layouts preserve ownship, target vector, and warning readability.

## Report For Game Director

Scenario 2 UI/HUD is ready for Engine planning alignment and QA review. It requires Engine-owned state for head-on class, starboard action status, port-alteration risk, port-to-port pass status, warning level, and result reasons. No UI-side maritime computation is approved.
