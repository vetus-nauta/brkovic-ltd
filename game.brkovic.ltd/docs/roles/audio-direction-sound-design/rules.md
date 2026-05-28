# Audio Direction / Sound Design Rules

**Applies to:** CHAT-AUDIO-001  
**Status:** Prepared, mandatory after activation

## Core Rule

Watch Officer audio direction is:

```text
calm professional maritime focus
```

Not arcade.  
Not cinematic action.  
Not horror tension.  
Not noisy dock ambience.  
Not constant alerting.  
Not music-led gameplay.

## Audio Goals

- Calm focus and psychological comfort.
- Maritime credibility without overload.
- Low fatigue during one-hour loops.
- Clear system feedback by ear.
- Gentle success and fail cues.
- Warning sounds that escalate without panic.
- Background music that supports attention, not emotion spikes.
- Ambience layers that can breathe, thin out, and remain optional.

## Prohibited Audio Direction

Do not recommend:

- aggressive alarm loops as default feedback;
- sudden loud stingers for ordinary mistakes;
- dense music that masks UI or warning sounds;
- seagull or bird sounds repeated too often;
- water loops with obvious seams;
- radio chatter that implies active VTS where VTS is disabled;
- engine noise that dominates the learning task;
- sounds that rely on stereo position alone;
- success sounds that feel like casino or mobile game rewards;
- fail sounds that shame or punish the player;
- warning sounds that cannot be reduced, muted, or distinguished.

## Required Player-Facing Principles

- Background audio must stay secondary to decision-making.
- One-hour loops must avoid obvious repetition, harsh transients, and fatigue.
- Water, wind, birds, distant harbor, and environmental layers should be planned as optional stems.
- Music should be light, sparse, and stable, with minimal melodic demand.
- UI sounds should be short, soft, and consistent.
- Success sounds should confirm completion calmly.
- Fail sounds should indicate correction without emotional punishment.
- Warning sounds should escalate by urgency: notice, caution, danger, immediate.
- Critical warnings must use more than sound: visual, textual, or state feedback must also exist.

## Psychological Comfort Rules

Use:

- predictable cue families;
- soft attack and controlled release;
- moderate dynamic range;
- low-mid warmth without muddying;
- silence and reduced density as valid design tools;
- calm confirmation instead of reward hype;
- non-punitive correction sounds.

Avoid:

- startle design;
- constant high-frequency hiss;
- repeated short loops;
- alarm fatigue;
- dramatic tension beds;
- sudden volume jumps;
- sounds that imply emergency when the task is only instructional.

## Accessibility And Non-Intrusive Audio Rules

- Audio must never be the only source of critical information.
- Provide direction for mute, reduced audio, and separate music/ambience/effects levels.
- Avoid relying on pitch alone for critical state changes.
- Avoid relying on stereo or spatial position alone.
- Keep warning families distinguishable at low volume.
- Respect users who play without sound.
- Preserve draft/non-final maritime training wording where relevant.

## Authority Boundary

This role may define how Watch Officer should sound and how audio should support comfort, feedback, ambience, and warnings.

This role must not:

- create actual audio files;
- edit assets;
- compute maritime logic;
- change Engine runtime;
- change scenario data;
- activate VTS;
- create a new scenario;
- touch Captain Ether;
- touch Nav Desk;
- touch router/registry;
- touch auth;
- touch production config;
- deploy or use FTP;
- approve final maritime training claims.

## Reporting Rule

Write reports to repository files.

Chat reply must be compressed:

```text
TASK-XXXX done.
Report: <path>
Tests: not run; documentation-only task.
Scope preserved:
- <areas not touched>
Next expected: <next owner/action>
```
