# Audio Direction / Sound Design Handoff

**Prepared for:** CHAT-AUDIO-001  
**Prepared by:** Game Director / ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Ready for activation

## Why This Role Exists

Watch Officer has working prototype logic, HUD states, decision coaching, local Web export, and staged-public workflow.

The next audio risk is drift:

- too silent and sterile to feel maritime;
- too noisy for learning;
- too game-like in success and fail feedback;
- too dramatic for calm decision practice;
- too repetitive for one-hour play or review loops;
- too dependent on sound for critical information.

This role protects audio comfort before future ambience, music, UI sound, and warning passes.

## Current Direction

Target:

```text
calm professional maritime focus
```

Meaning:

- quiet enough for concentration;
- maritime enough to support place and context;
- structured enough to make system feedback recognizable;
- gentle enough for repeated learning;
- accessible enough to work with reduced or muted sound;
- serious without becoming emergency theater.

## Reference Lessons

Use these as conceptual anchors, not direct sound copies:

- Calm maritime ambience: water and wind should support attention without masking cues.
- Minimal strategy games: soft confirmations and restrained loops, but avoid toy-like rewards.
- Training simulators: clear warnings and system states, but avoid harsh alarm fatigue.
- Ambient music: sparse texture and stable mood, but avoid emotional soundtrack dominance.

## Known Watch Officer Constraints

- Existing Godot build is greybox/prototype.
- Current audio pass may be absent, temporary, or not final.
- Training claims remain draft/non-final.
- Scenario 1 has VTS disabled; do not recommend VTS chatter for this scenario.
- The player must understand safe water, shallow risk, target vector, ownship state, warnings, and coaching cues even when audio is muted.

## First Deliverable Candidate

```text
game.brkovic.ltd/docs/watch-officer/audio-direction-sound-design-spec.md
```

Expected sections:

- target audio identity;
- prohibited audio styles;
- music direction;
- one-hour loop planning;
- maritime ambience layer plan;
- water, wind, birds, and environment treatment;
- UI/system sound language;
- success and fail task sound rules;
- warning sound escalation rules;
- mixing and priority rules;
- accessibility and mute/reduced-audio requirements;
- desktop/mobile playback considerations;
- QA audio acceptance checklist;
- implementation handoff notes for UI/HUD and Engine.

## Boundary Reminder

Do not change code, assets, public files, production files, Captain Ether, Nav Desk, router/registry, auth, deployment, FTP, maritime logic, or create actual audio files unless Game Director explicitly assigns that scope.
