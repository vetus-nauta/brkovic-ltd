# TASK-0092 - Watch Officer Audio Direction And Sound Design Spec

**Status:** first-spec-for-game-director-review  
**Owner Chat:** CHAT-AUDIO-001 / Audio Direction / Sound Design Lead  
**Date:** 2026-05-27  
**Project:** Watch Officer / `game.brkovic.ltd`  
**Scenario context:** Scenario 1, `Safe Water, Crossing Target`  

## Scope

This document defines the first audio direction and sound design specification for Watch Officer.

Documentation only. No audio files, code, assets, scenes, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, scenario data, maritime logic, VTS/radio chatter, or Scenario 2 work is included.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/roles/audio-direction-sound-design/README.md`
- `game.brkovic.ltd/docs/roles/audio-direction-sound-design/rules.md`
- `game.brkovic.ltd/docs/roles/audio-direction-sound-design/onboarding.md`
- `game.brkovic.ltd/docs/roles/audio-direction-sound-design/handoff.md`
- `game.brkovic.ltd/docs/roles/audio-direction-sound-design/first-brief.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md`

## Audio Identity

Target identity:

```text
calm professional maritime focus
```

Watch Officer audio should sound like a disciplined training bridge environment, not an entertainment arcade or cinematic emergency sequence. The soundscape should help the player stay oriented, understand system feedback, and remain comfortable during repeated short sessions or longer review loops.

Primary qualities:

- Calm: soft attacks, controlled dynamics, no startle design for ordinary interaction.
- Professional: restrained, consistent, precise, and instructor-like.
- Maritime: water, wind, distant open-air environment, and subtle coastal presence.
- Focused: low-density layers that leave space for decision-making and visual reading.
- Non-intrusive: ambience and music remain secondary to the scenario state and HUD.
- Accessible: all critical information is duplicated visually/textually and remains usable with audio muted.

The player should feel:

- oriented on a calm daylight waterway;
- guided by a professional system;
- corrected without shame;
- warned without panic;
- able to think through safe-water and crossing-target decisions.

## Prohibited Audio Styles

Do not use or recommend:

- arcade reward sounds, coin-like chimes, slot-machine rises, or mobile-game streak cues;
- cinematic action scoring, percussion builds, dramatic brass, trailer impacts, or danger drones;
- horror, suspense, emergency-theater, or disaster-film sound language;
- constant alarm loops as the default way to communicate risk;
- harsh buzzers, punishment stingers, or fail sounds that imply ridicule;
- dense music that competes with warning cues, coaching, or visual scanning;
- obvious short ambience loops with audible repeats or loop clicks;
- high-frequency hiss-heavy water beds that cause fatigue;
- frequent gull cries or bird repeats that become comic, noisy, or distracting;
- engine noise that dominates the learning task;
- radio chatter, VTS chatter, distress traffic, or spoken bridge traffic for Scenario 1;
- sounds that communicate critical state through pitch, stereo position, or spatial movement alone;
- any audio that implies official, final, certified, or legally complete maritime training.

## Psychological Comfort Principles

Audio should reduce cognitive load, not add another task.

Required principles:

- Predictable cue families: similar state changes should sound related across the product.
- Soft onset: ordinary UI and coaching cues should avoid sharp transient attacks.
- Controlled release: sounds should finish cleanly and avoid long tails that mask later cues.
- Moderate dynamic range: no sudden volume jumps between ambience, UI, warnings, and result cues.
- Sparse layering: silence and reduced density are valid design tools.
- Low repetition exposure: common cues must tolerate many repeats without irritation.
- Non-punitive correction: failed-task sounds should indicate that review or recovery is needed, not blame the player.
- Calm urgency: warnings may become more insistent by level, but must not sound panicked.
- Visual redundancy: sound reinforces state; it never carries critical information alone.

Comfort limits:

- Background audio should be comfortable at low volume for at least one hour.
- Any loop or recurring cue that becomes irritating within five minutes fails the direction.
- The soundscape should remain usable for focused work in a quiet room without the player lowering system volume to escape it.

## Background Music Direction

Music is optional support, not the emotional driver.

Direction:

- Light, sparse, and stable.
- Minimal melody; no earworm hooks.
- Slow harmonic movement or subtle tonal pads.
- Warm low-mid support without muddiness.
- Gentle maritime openness rather than dramatic ocean scale.
- No strong beat, chase rhythm, or tension pulse during normal play.
- No heroic, triumphant, tragic, or crisis scoring.

Recommended palette:

- Soft sustained tones.
- Low-volume mallet or bell-like details with rounded attack.
- Muted synthetic or organic textures.
- Occasional airy tonal movement.
- Very restrained bass support.

Music behavior:

- Music should thin out during high-warning states so warning cues and HUD state remain primary.
- Music should not change aggressively when the player fails.
- Success may allow a slight resolving gesture, but not a fanfare.
- Correction/failure may reduce density or resolve downward gently, but not use punishment stingers.

## One-Hour Loop Structure Plan

The future long-form background bed should be planned as a one-hour loop made from stems, not one obvious fixed short loop.

Recommended structure:

| Time range | Function | Density |
| --- | --- | --- |
| 00:00-05:00 | Settling-in bed for briefing and early control | Very low |
| 05:00-15:00 | Stable navigation focus with light maritime movement | Low |
| 15:00-25:00 | Slightly more open water/wind texture, no drama | Low to moderate |
| 25:00-35:00 | Thinned midpoint to reset attention | Very low |
| 35:00-45:00 | Return of subtle tonal/maritime details | Low |
| 45:00-55:00 | Calm late-loop variation, no new emotional peak | Low |
| 55:00-60:00 | Seam-preparation section matching the opening bed | Very low |

Loop rules:

- No obvious beginning or ending gesture.
- No repeated bird call, swell hit, bell tone, or tonal motif that marks time.
- No hard seam, click, phase jump, or sudden ambience reset at loop point.
- Stems should have different cycle lengths where possible so repetition does not align too obviously.
- The first and final five minutes should share compatible texture, loudness, and spectral balance.
- Warning and UI cues must remain audible above the loop at reduced volume.

Suggested stem model:

- `music_bed_base`: stable low-density tonal bed.
- `music_air_detail`: rare soft upper detail, optional.
- `ambience_water_base`: continuous controlled water presence.
- `ambience_wind_base`: low-to-moderate air movement.
- `ambience_birds_rare`: sparse natural birds with long randomized gaps.
- `ambience_distant_environment`: extremely subtle harbor/coast texture, optional.

## Maritime Ambience Layer Plan

Ambience should provide place, scale, and calm. It must not create noise fatigue.

Layer priority:

1. Water base: low, steady, and clean.
2. Wind base: soft movement and open-air presence.
3. Occasional water detail: small lap/swell accents with long variation.
4. Rare birds: natural, distant, and non-loop-obvious.
5. Distant environment: optional low-level coastal/harbor texture, never busy.
6. Music bed: optional layer behind ambience and system cues.

Mixing intent:

- Ambience sits below UI and warning sounds.
- Water and wind should be audible enough to establish maritime presence, but quiet enough that the player can ignore them.
- The spectrum should avoid persistent hiss, whine, or rumble.
- No single environmental element should become the perceived metronome of the session.

State behavior:

- Briefing/ready: slightly lower density, calm orientation.
- Running: stable ambience with no dramatic state scoring.
- Caution/danger/immediate warnings: ambience may subtly thin to improve cue readability.
- Result/review: calm reduced layer that supports captain-note reading.
- Reset: ambience returns to ready density without abrupt cut unless audio is muted.

## Water Treatment

Water should sound calm, close enough to identify the maritime setting, and controlled enough for long listening.

Use:

- Small lapping, broad low-level wash, and gentle hull-side water texture.
- Soft randomized detail with long intervals.
- Low-mid body with reduced harsh upper hiss.
- Multiple variations or procedural/randomized placement for future implementation.

Avoid:

- storm surf, heavy waves, crashing water, or whitewater;
- short obvious two-to-ten-second loops;
- aggressive stereo movement;
- water sounds that mask UI ticks, warning cues, or coaching changes;
- wet slap sounds that imply rough weather or docking contact.

## Wind Treatment

Wind should indicate open air and calm weather, not danger.

Use:

- Light breeze layer with slow movement.
- Rounded high frequencies.
- Low volume relative to water.
- Optional thinning when warnings are active.

Avoid:

- whistling rigging, storm gusts, gale sounds, or panic-building wind rises;
- constant high-frequency hiss;
- strong gust transients that could be mistaken for warnings;
- wind that implies weather conditions beyond the MVP calm-day scenario.

## Birds Treatment

Birds should be rare environmental punctuation.

Use:

- Distant, natural, low-frequency-of-occurrence bird calls.
- Long randomized gaps.
- Low mix level.
- Multiple variants if birds are used at all.

Avoid:

- frequent gull loops;
- loud comic squawks;
- repeated identical calls;
- bird calls during dense warning moments;
- bird presence that distracts from the professional training tone.

## Environmental Treatment

Environmental details should remain subtle and scenario-compatible.

Allowed future layers:

- very distant harbor air;
- soft buoy/mark hardware detail only if rare and quiet;
- distant low-level vessel presence only if it does not imply traffic density beyond the scenario;
- mild open-coast air texture.

Do not add for Scenario 1:

- VTS/radio chatter;
- distress calls;
- busy marina crowd noise;
- dock machinery;
- dense vessel traffic beds;
- foghorns or bells that imply navigation conditions not present in the calm day MVP;
- engine-dominant beds.

## UI And System Sound Language

UI sounds should be short, soft, consistent, and functional.

Core language:

- Soft click/tap for basic confirmation.
- Slightly warmer, rounded tone for accepted action.
- Low, short, non-harsh tone for blocked or unavailable action.
- Quiet state-change cue for Start, Reset, and result panel entry.
- No musical flourish for ordinary UI interaction.

Recommended cue durations:

- Basic UI tap: 40-90 ms.
- Toggle/selection: 80-140 ms.
- State transition: 120-250 ms.
- Result entry: 250-500 ms.
- Warning cue: short lead cue plus optional low-level repeat only for unresolved high urgency.

System consistency:

- Same action category should use the same cue family across desktop and mobile.
- Sounds must remain recognizable at low volume.
- No cue should be so long that it overlaps normal rapid UI use.
- UI audio must be optional and governed by sound settings.

## Success Sound Rules

Success cues confirm calmly. They do not celebrate like a game reward.

Use:

- Soft upward or resolving gesture.
- Short, warm, low-volume confirmation.
- Optional small tonal bloom for result completion.
- Clear separation from warning and correction sounds.

Avoid:

- fanfares;
- score-counting sounds;
- reward jingles;
- applause-like effects;
- bright casino/mobile game timbres;
- loud positive stingers.

Application:

- In-run safe state should not repeatedly play success sounds.
- Final success/result cue may play once when result state is entered.
- Success cue should support the captain-note review, not interrupt it.

## Failed-Task And Correction Sound Rules

Failed-task sounds should guide correction without punishment.

Use:

- Soft downward or neutral resolving gesture.
- Rounded low-mid tone.
- Brief reduction in music/ambience density if needed.
- A clear difference between correctable warning outcome and terminal failure.

Avoid:

- harsh buzzer, klaxon, slap, crash, or sarcastic sound;
- loud negative stingers;
- music-stop shock cuts;
- sounds that imply player ridicule or game-over theatrics;
- failure sounds that mask the written correction.

Application:

- `warning_outcome` / `unsafe_manoeuvre`: calm correction cue.
- `near_miss`: firmer correction cue, still non-punitive.
- `grounding` / `collision`: serious low cue, short and controlled, with visual/text result as primary explanation.

## Warning Sound Escalation

Warning audio must match Engine-owned warning state. Audio must not compute or invent warning severity.

Escalation family:

| Warning level | Audio intent | Behavior |
| --- | --- | --- |
| Notice | Orientation nudge | Single soft cue, no repeat |
| Caution | Attention requested | Slightly firmer cue, no panic |
| Danger | Immediate attention needed | Clearer tone, controlled repeat only if state persists |
| Immediate | Critical action required | Most distinct cue, short repeat allowed, never sound-only |

Design rules:

- Escalation should increase clarity and priority, not emotional panic.
- Levels should be distinguishable at low volume.
- Avoid relying only on pitch height; use envelope, rhythm, tone color, and repetition sparingly.
- Avoid long alarm loops.
- Do not stack multiple warning sounds at once.
- If a higher warning enters while a lower cue is playing, higher priority may interrupt cleanly.
- Warning sounds should duck or thin music/ambience if needed.
- Every warning must be duplicated by HUD/text/state feedback.

Scenario 1 warning mapping should remain conceptual until Engine/UI assignment:

- Safe-water/corridor caution: soft caution cue.
- Shallow-water risk: caution or danger based on Engine state.
- CPA caution/danger/immediate: corresponding Engine-owned warning level.
- Grounding/collision/near miss: terminal result cue, not a repeating alarm loop.

## Mixing And Priority Rules

Priority order:

1. Immediate warning cue.
2. Danger/caution warning cue.
3. Result state cue.
4. UI system cue.
5. Music detail.
6. Ambience detail.
7. Base ambience/music bed.

Mix expectations:

- Warnings and UI cues must read clearly at reduced master volume.
- Music and ambience should duck subtly under warnings if implementation supports it.
- Ambience should not be compressed so aggressively that it becomes fatiguing.
- Avoid low-end rumble that can make laptop/mobile speakers distort.
- Avoid bright sustained energy that becomes harsh on earbuds.
- Keep all cue families below startle level in normal listening conditions.

## Audio Accessibility And Mute/Reduction Rules

Required controls for future implementation planning:

- Master audio mute.
- Separate levels for music, ambience, and UI/effects.
- Reduced audio mode that disables music detail, rare birds, and nonessential environment layers.
- Warning sounds reducible but not dependent on audio alone.
- Persistent setting storage when platform scope allows it.

Accessibility rules:

- Critical information must be duplicated visually/textually.
- No critical state may depend on stereo position, spatialization, pitch recognition, or rhythm recognition alone.
- Warning levels must remain distinguishable through the HUD even when audio is muted.
- Users who play silently must be able to complete Scenario 1.
- Default mix should be comfortable for headphones, laptop speakers, and mobile speakers.
- Provide no autoplay surprise at page load; browser/user gesture rules must be respected.

Reduced audio mode:

- Keeps essential UI and warning cues if effects are enabled.
- Removes music bed or reduces it to near-silence.
- Keeps only minimal water/wind ambience, or disables ambience entirely if requested.
- Disables bird/environment detail.
- Avoids repeated warning audio where visual state already provides persistent warning.

## Desktop, Mobile, And Browser Playback Considerations

Godot Web/browser playback should be treated conservatively.

Desktop:

- Expect headphones, laptop speakers, and muted office environments.
- Avoid low bass dependence and high-frequency fatigue.
- Ensure UI/warning cues stay readable at low browser/system volume.

Mobile:

- Assume small speakers, possible silent mode, and frequent muted play.
- Avoid subtle bass-only cues.
- Avoid stereo-dependent information.
- Keep cues short to prevent overlap with touch interaction.
- Audio settings must not cover or distract from critical HUD controls when implemented.

Browser:

- Audio may be blocked until user interaction.
- Do not require audio during initial page load or briefing.
- Start/resume audio only after player gesture where needed.
- Handle tab backgrounding, pause/resume, and lost audio context gracefully.
- Avoid assuming continuous audio timing is exact in browser builds.
- If audio fails to initialize, the scenario must remain playable and warnings must remain visible.

Export/deploy note:

- This spec does not approve export or production deploy.
- Future implementation must pass QA and Game Director gates before any production update.

## QA Audio Acceptance Checklist

General:

- Audio identity reads as calm professional maritime focus.
- No arcade, cinematic action, horror, emergency-theater, or mobile-game reward language.
- Background music remains secondary to decision-making.
- Ambience is maritime but not noisy or fatiguing.
- No VTS/radio chatter appears in Scenario 1.
- No final/official/certified maritime training implication is introduced.

Loop and ambience:

- One-hour loop plan has no obvious repeated marker sounds.
- Loop seam is inaudible in future audio asset tests.
- Water layer has no harsh hiss or obvious short repeat.
- Wind layer implies calm weather only.
- Birds are rare, varied, quiet, and non-distracting.
- Environment layer does not imply dense harbor, extra traffic, or VTS activity.

UI and feedback:

- UI sounds are short, soft, and consistent.
- Success cue confirms calmly and plays once for final success/result.
- Correction/fail cues are non-punitive.
- Warning levels are distinguishable without panic.
- Warning cues do not stack into alarm fatigue.
- Terminal result cues do not become looping alarms.

Accessibility:

- Scenario remains understandable with all audio muted.
- Critical warnings are visible/textual as well as audible.
- Reduced audio mode removes nonessential layers.
- Music, ambience, and effects can be controlled separately in future settings scope.
- Cues do not rely on pitch, stereo position, or spatialization alone.

Platform:

- Browser autoplay restrictions are respected.
- Audio resumes gracefully after tab focus changes where platform allows it.
- Mobile muted/silent playback does not block scenario completion.
- Laptop/mobile speakers do not distort under default mix.
- No audio failure blocks loading, Start, Reset, warnings, or result review.

## UI/HUD Handoff Notes

UI/HUD should treat audio as support for existing display state.

Handoff requirements:

- Keep all warning, coaching, and result meaning visible/textual.
- Do not expose hidden debug values to the player surface because audio exists.
- Do not add audio-only coaching.
- Do not create new warning severities or result categories for sound.
- Use Engine-owned state for cue selection.
- Maintain Scenario 1 VTS disabled/inactive state; do not add VTS/radio sound controls for Scenario 1.
- Include future settings affordances only after assigned: master mute, music, ambience, effects, reduced audio.
- Keep draft/non-final training wording visible independent of audio.

Potential UI mapping for future implementation:

- Start attempt: quiet state-entry cue after user gesture.
- Reset: short clean reset cue, clears stale warning/result audio state.
- Coaching rail update: no sound for ordinary text changes unless warning level changes.
- Result panel: one calm result cue based on Engine result.
- Audio unavailable/muted: no blocking modal; optional settings indication only if assigned.

## Engine Handoff Notes

Engine should own state and timing. Audio should subscribe to state, not compute maritime meaning.

Handoff requirements:

- Emit or expose stable state changes for Start, Reset, warning severity, result entry, and mute/settings state when assigned.
- Audio playback should be event-driven for UI/result cues and state-driven for ambience/music layers.
- Debounce repeated warning changes to prevent cue spam.
- Higher priority warning cue may interrupt lower priority cue cleanly.
- Clear warning/result audio on reset.
- Keep Scenario 1 VTS disabled; no radio/VTS chatter trigger should exist for this scenario.
- Do not add maritime logic, CPA/TCPA thresholds, safe-water computation, encounter classification, or result evaluation for audio purposes.
- If browser audio context is unavailable, continue scenario normally and leave HUD/text as authority.

Suggested future audio buses:

- `Master`
- `Music`
- `Ambience`
- `Effects_UI`
- `Effects_Warning`

Suggested future event families:

- `ui_confirm`
- `ui_blocked`
- `state_start`
- `state_reset`
- `result_success`
- `result_correction`
- `result_terminal`
- `warning_notice`
- `warning_caution`
- `warning_danger`
- `warning_immediate`

These names are planning labels only. They do not define an implementation contract until Engine accepts or replaces them.

## Blocking Changes

None.

## Report For Game Director

TASK-0092 result: **first-spec-for-game-director-review**.

The Watch Officer audio direction is ready for Game Director review. The spec preserves calm professional maritime focus, keeps Scenario 1 free of VTS/radio chatter, treats audio as non-critical support for HUD/text state, and prepares future Engine/UI work for music, ambience, UI cues, success/correction cues, warning escalation, accessibility, and browser/mobile playback.
