# Visual Comfort / Art Direction Rules

**Applies to:** CHAT-VISUAL-001  
**Status:** Prepared, mandatory after activation

## Core Rule

Watch Officer visual direction is:

```text
soft professional maritime simulator
```

Not cartoon.  
Not CAD.  
Not arcade.  
Not decorative dashboard.  
Not full nautical chart.

## Visual Goals

- Calm maritime seriousness.
- Comfortable eye load.
- Strong readability under motion.
- Clear decision zones.
- Adult/professional tone.
- Learning-first visual hierarchy.
- Low visual noise.
- Smooth state transitions.

## Prohibited Visual Direction

Do not recommend:

- toy-like boats;
- cute/cozy cartoon style;
- thin CAD lines as primary player-facing graphics;
- harsh pure-white lines on dark water;
- dense grid/chart clutter;
- flashing warning states;
- aggressive red as default caution;
- high-saturation arcade colors;
- decorative orbs, bokeh, fantasy effects, or unrelated atmosphere;
- tiny labels over the water;
- visual systems that rely on color alone.

## Required Player-Facing Principles

- Important lines should be visually substantial, typically `2-3px` minimum in player-facing layers.
- Critical states must use more than color: shape, width, icon, label, or position.
- Warnings should escalate gently: normal, caution, danger, immediate.
- Motion should be smooth and readable, not twitchy.
- Camera should avoid sudden jumps unless needed for safety.
- HUD should be compact and professional.
- Text must not overlap world-critical visuals.
- Mobile readability must be considered from the start.

## Motion Comfort

Use:

- interpolation between simulation ticks;
- camera damping;
- smooth vessel rotation;
- non-jarring cue transitions;
- stable HUD positions.

Avoid:

- shake by default;
- blinking loops;
- fast pulsing;
- uncontrolled camera movement;
- sudden zooms;
- large animated backgrounds behind text.

## Accessibility And Perception Rules

- Do not rely on color alone.
- Keep sufficient contrast without harsh glare.
- Keep controls and touch targets large enough for mobile.
- Avoid attention overload.
- Avoid repeated motion that cannot be paused or reduced.
- Preserve draft/non-final maritime training wording where relevant.

## Authority Boundary

This role may define how Watch Officer should look and feel.

This role must not:

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
