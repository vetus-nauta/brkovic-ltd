# Local Scenario Selector UX Spec

**Task:** `TASK-0112`  
**Owner Chat:** `CHAT-UX-001 / UI-HUD Designer`  
**Date:** `2026-05-27`  
**Status:** `ready-for-game-director-review`  
**Scope:** Documentation only. No code, scenario data, schema, scenes, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, game hub, or final maritime training claims changed.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`
- `game.brkovic.ltd/docs/watch-officer/visual-comfort-art-direction-spec.md`

## UX Goal

Add a calm local scenario selector inside the Watch Officer prototype so the player can choose a draft scenario before starting an attempt:

- Scenario 1: `Safe Water / Crossing Target`
- Scenario 2: `Head-On Port-to-Port Drill`

The selector is a local simulator screen, not a landing page, marketing page, public game hub, route index, or scenario registry. It should feel like choosing the next exercise from an instructor console, then entering the existing briefing/start flow.

## Placement In Flow

Recommended local flow:

```text
Prototype boot -> Scenario selector -> Scenario briefing -> Attempt running -> Result -> Reset/back options
```

The selector appears before the attempt starts and before scenario-specific briefing copy. It should not replace the scenario briefing; it only chooses which briefing/runtime path is loaded next.

The selector may be reachable again from ready/result states through a compact `Back` control. It should not be reachable through a public route, hub tile, global nav, registry listing, or deploy surface in this task.

## Default Selection

Default selected scenario:

```text
Scenario 1 - Safe Water / Crossing Target
```

Reason:

- Scenario 1 remains the default local playable path.
- Existing local play loop and regression expectations depend on Scenario 1 booting as the normal path.
- Scenario 2 is selectable locally but should not silently replace Scenario 1 as the default exercise.

If the player previously selected Scenario 2 during the same local session, reset may preserve that selected local path where already supported by the prototype. A fresh boot should still present Scenario 1 as the default selected card.

## Selector Layout

Use a compact simulator panel over the existing calm maritime UI surface. Avoid hero layouts, marketing copy, oversized art, landing-page composition, or decorative promotional cards.

Recommended desktop layout:

- top status strip with `Watch Officer Prototype` and a draft/non-final chip;
- short title: `Select scenario`;
- two selectable scenario rows or compact cards;
- right-side or lower briefing preview area for the selected scenario;
- bottom action row with `Start`, `Back`, and `Reset` where applicable.

Recommended mobile layout:

- stacked scenario rows;
- selected scenario expands to show the short preview;
- action row remains reachable without covering ownship/world-critical content when returning from an attempt state;
- no horizontal scrolling.

Cards are allowed only as individual selectable items. Do not put cards inside larger decorative cards, and do not turn the selector into a game hub grid.

## Scenario Item Content

Each selectable item should include:

- scenario number;
- short scenario name;
- one-line practice focus;
- availability state;
- draft/non-final chip;
- Region/VTS status line.

Scenario 1 item:

```text
Scenario 1
Safe Water / Crossing Target
Practice maintaining safe water while monitoring a crossing target.
Available
Draft training
Region A / VTS inactive
```

Scenario 2 item:

```text
Scenario 2
Head-On Port-to-Port Drill
Recognize head-on risk, alter starboard early, and create a port-to-port pass.
Available locally
Draft training
Region A / VTS inactive
```

Keep descriptions short and operational. Do not mention legal rule numbers, certification, official training status, COLREGS compliance, public release, deployment, router state, or registry state.

## Draft And Non-Final Status

The selector must make draft status visible without making it visually loud.

Required chip copy:

```text
Draft training
```

Required supporting copy on the selector or preview:

```text
Not final maritime instruction.
```

The chip should be secondary to the selected scenario title. Use low-glare HUD styling consistent with the visual comfort spec: muted dark maritime surface, soft off-white text, and no neon or alarm treatment.

Do not use:

- `official`;
- `certified`;
- `legally correct`;
- `COLREGS-compliant`;
- `final training`;
- `approved navigation procedure`.

## Region And VTS Status

Every available scenario item should show:

```text
Region A / VTS inactive
```

This is a status label, not a filter, feature promise, or world selector. It should not imply Region B support or live VTS integration.

Do not show selectable Region B, VTS modes, operator roles, traffic service controls, or future region tabs in this selector.

## Interaction Model

Selection:

- clicking or tapping a scenario row selects it;
- keyboard focus should move predictably between rows and actions if later implemented;
- selected state should use a clear border, check mark, or filled indicator plus text, not color alone.

Start:

- `Start` opens the selected scenario's existing briefing/start state;
- `Start` should be disabled only if the selected scenario is locked or unavailable;
- starting Scenario 2 must remain local-only and must not imply public route/export/deploy approval.

Back:

- from the selector, `Back` returns to the previous local prototype state if one exists;
- from briefing or result states, `Back to scenarios` returns to this selector and keeps the current selected scenario highlighted.

Reset:

- reset from an active attempt returns the current selected scenario to deterministic ready/briefing state;
- reset must clear stale danger/result coaching and keep draft/non-final status visible;
- reset should not change the selected scenario unless the player explicitly chooses another one.

## Locked And Future Scenarios

Future scenarios may appear only as subdued placeholders if needed for local planning. They must not create a game hub impression.

Locked/future item content:

```text
Scenario 3
Future local drill
Locked
Draft placeholder
Region A / VTS inactive
```

Locked behavior:

- item is not startable;
- `Start` remains disabled when a locked item is selected;
- no preview promises detailed content that is not approved;
- no countdowns, marketing tease, public availability language, or route/deploy language.

Visual treatment:

- lower opacity than available scenarios;
- lock icon or `Locked` chip;
- readable text and focus state if selectable for preview;
- no red/error styling, because locked is not a warning state.

## Not A Game Hub

This selector must remain scoped to the local Watch Officer prototype. It should avoid hub patterns:

- no grid of products or game modes;
- no public navigation;
- no account/auth prompts;
- no featured banners;
- no marketing headlines;
- no external links;
- no Captain Ether, Nav Desk, or global destination tiles;
- no route names, registry IDs, deploy badges, or production status.

Copy should read like simulator controls:

```text
Select scenario
Start selected scenario
Back to scenarios
Reset attempt
```

Avoid copy that reads like a storefront or hub:

```text
Play now
Explore modes
New release
Featured scenario
Coming soon to public
```

## Visual Comfort Requirements

Apply the existing soft professional maritime simulator direction:

- calm, low-glare maritime palette;
- compact HUD surfaces;
- stable placement;
- readable at 1280x720 and mobile browser sizes;
- no aggressive flashing;
- no full-screen red wash;
- no dense chart clutter;
- no toy/card-game styling;
- no decorative orbs, bokeh, or fantasy effects.

Scenario rows/cards should use consistent height and stable selected/locked states so layout does not shift when the player changes selection.

## Acceptance Notes

This spec approves only the local UX direction for a scenario selector. It does not approve code implementation, export, browser release, deploy, public route, registry entry, game hub integration, production integration, VTS, Region B, or final maritime training claims.

Expected QA focus for a future implementation:

- fresh local boot defaults to Scenario 1 selected;
- Scenario 2 can be selected locally before briefing/start;
- draft/non-final chip remains visible;
- each available scenario shows `Region A / VTS inactive`;
- locked/future scenarios cannot start;
- reset preserves the selected scenario path where local runtime already supports it;
- player-facing selector excludes debug data, route/registry/deploy language, legal claims, and public hub patterns.
