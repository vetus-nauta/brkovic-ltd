# Watch Officer Visual Comfort / Art Direction Spec

**Task:** `TASK-0091`  
**Owner Chat:** `CHAT-VISUAL-001 / Visual Comfort / Art Direction Lead`  
**Date:** `2026-05-27`  
**Status:** `first-spec`  
**Scope:** Documentation only. This spec defines visual direction and acceptance rules; it does not change code, assets, scenes, public files, production files, scenario data, or maritime logic.

## Source Context

Reviewed source documents:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/README.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/rules.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/onboarding.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/handoff.md`
- `game.brkovic.ltd/docs/roles/visual-comfort-art-direction/first-brief.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/scope-boundaries.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`
- `game.brkovic.ltd/docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md`

Current product constraints:

- Watch Officer is a short-session maritime decision simulator.
- Current public prototype is draft/non-final maritime training content.
- Current playable scope is Scenario 1: `Safe Water, Crossing Target`.
- IALA Region A only.
- VTS disabled/inactive for Scenario 1.
- UI/HUD must remain display-only over Engine-owned state.
- No final, official, certified, legally correct, or COLREGS-compliant claim is approved.

## Target Visual Identity

Watch Officer visual direction is:

```text
soft professional maritime simulator
```

The target identity should feel calm, adult, maritime, focused, and credible for short decision-practice sessions. It should be simpler and more legible than a full bridge simulator, softer than a CAD/chart tool, and more serious than a casual toy game.

The player should immediately read:

- ownship position and heading;
- the forward safe-water corridor;
- shallow/danger pressure;
- the crossing target and its vector;
- one current coaching cue;
- the draft/non-final training status.

The visual system should support calm pressure. Risk should be visible and increasingly hard to ignore, but it should not punish the player with glare, panic motion, or arcade effects.

## Prohibited Styles

Do not use or recommend:

- cartoon boats, cute faces, character-driven vessels, toy proportions, or cozy miniature diorama styling;
- harsh engineering/CAD styling as the player-facing primary layer;
- dense nautical-chart clutter, dense grids, tiny chart labels, or full ECDIS imitation;
- thin needle-like primary lines for vectors, corridors, paths, or warning geometry;
- pure-white primary geometry on dark water when it creates glare;
- neon arcade colors as the default state language;
- aggressive flashing, strobe warnings, rapid blinking loops, or alarm-panel behavior;
- decorative fantasy effects, magical glows, bokeh/orb backgrounds, unrelated atmospheric particles, or dramatic vignette effects;
- high-contrast red as ordinary caution;
- visual systems that rely on color alone;
- text overlays that sit on top of world-critical vessel, vector, mark, or corridor information;
- cockpit, aircraft, combat, racing, or radar-night-mode styling unless separately assigned and reviewed.

## Palette Direction

The palette should be low-glare, maritime, and readable in day-mode calm weather.

Recommended palette roles:

| Role | Direction | Notes |
| --- | --- | --- |
| Open water | muted blue-green / deep teal | Soft base with subtle depth variation; avoid flat black or saturated blue. |
| Safe water | calmer blue-green lift | Visible corridor or area cue without neon fill. |
| Corridor boundary | desaturated cyan, seafoam, or soft light blue | Clear but broad enough to avoid CAD thinness. |
| Shallow water | muted sand, ochre, or warm grey-green | Warm shift should imply caution without looking like beach/toy terrain. |
| Danger / immediate risk | controlled red-orange or warm red | Reserved for danger/immediate states, not routine caution. |
| Caution | amber / muted yellow-orange | Use before red; pair with shape/width/text. |
| Ownship | off-white hull marker with cool shadow/accent | Clear primary object; not pure white glare. |
| Target vessel / AIS | cool blue, muted violet-blue, or slate-cyan | Distinct from ownship and danger states. |
| Marks | Region A recognition colors, softened | Preserve red/green meaning, avoid candy saturation. |
| HUD surface | translucent dark blue-grey or charcoal-green | Quiet panels; enough contrast for text. |
| HUD text | soft off-white / light grey | Avoid pure white when large or persistent. |

Palette rules:

- Use saturation sparingly. The most saturated colors should belong to marks and true risk states.
- Keep water as the dominant field but avoid a one-note blue/slate interface.
- Danger must contrast with safe water and shallow treatment, but it must not flash or flood the screen by default.
- Draft/non-final chips should be legible but visually secondary.
- QA/debug overlays may use sharper diagnostic colors if needed, but player mode should remain soft and professional.

## Line Weight And Geometry Rules

Primary player-facing geometry must be visually substantial.

Minimum guidance:

- Primary corridor boundaries, route cues, AIS vectors, and danger boundaries: normally `2-3px` minimum at desktop 1x scale.
- Mobile primary lines: visually equivalent to at least `3px` where the viewport compresses detail.
- Secondary helper lines: may be lighter, but should not become needle-thin or flicker under motion.
- Debug-only lines may be thinner if hidden from normal player mode.

Geometry rules:

- Use rounded joins and caps for player-facing vectors, boundaries, and cue rails where practical.
- Prefer simple, stable silhouettes over detailed drawings.
- Avoid dense micro-ticks, tiny arrows, and ruler-like engineering marks in player mode.
- Use width, opacity, pattern, label, and shape in addition to color for state changes.
- Keep boundaries softly integrated with the water surface; they should guide, not dominate.
- Do not obscure ownship lower-third readability with corridor graphics or HUD panels.

## Water, Safe-Water, Shallow, And Danger Treatment

Water should be calm and spatially readable. It may have subtle depth, mild tonal gradients, or low-frequency texture, but it should not contain busy waves behind text or small vessels.

Safe water:

- Show the safe corridor as a readable navigational area, not as a neon lane.
- Use a soft fill, wide boundary, or gentle edge treatment that remains visible during motion.
- Safe-water indication should be clear enough for a new player to understand the intended corridor within the first seconds of Scenario 1.
- The safe corridor must not imply a finalized legal rule claim; it is a scenario teaching surface driven by approved Engine/scenario state.

Shallow water:

- Use muted warm treatment: sand/ochre/warm grey-green, low-to-medium opacity.
- Give shallow zones a distinct edge or pattern, not color alone.
- Shallow buffer/caution should be visible before the vessel reaches unsafe water.
- Avoid beach-like cartoon styling, bright yellow paint, or decorative sand texture.

Danger:

- Danger zones and immediate-risk states should escalate from caution rather than appear as constant red threat.
- Use controlled red-orange or warm red, paired with thicker boundary, icon/chip, or stronger label.
- Avoid full-screen red washes, heavy flashing, and panic overlays.
- Terminal states may use stronger visual emphasis, but result feedback must remain professional and readable.

## Vessel, Mark, AIS, And Vector Treatment

Ownship:

- Ownship must be the strongest world object after active danger cues.
- Use a compact, adult maritime silhouette: simplified motor-yacht or arrow-vessel form, not a toy boat.
- Maintain clear heading orientation at all times.
- Ownship should sit comfortably in the lower third and must not be hidden by controls, cue rail, or result text.

Traffic vessel:

- Traffic vessels should use a distinct but quieter treatment than ownship.
- Keep silhouette simple enough to read at mobile size.
- Avoid character-like personality, toy scale, or decorative wake as the main identifier.

Marks:

- Marks should be large, recognizable, and stable under motion.
- Region A lateral colors may be used, but must be softened enough to avoid toy/candy appearance.
- Use shape and placement with color; do not depend on color alone.
- Scenario 1 should prioritize the Region A lateral pair. Safe water mark, cardinal marks, and isolated danger mark remain deferred unless separately assigned.

AIS/vector:

- AIS target vector must be clear, smooth, and non-needle-like.
- Use `2-3px` minimum visual weight and rounded ends/arrowheads where practical.
- Vector opacity should be strong enough to read against water but not stronger than terminal danger cues.
- CPA/TCPA player display remains qualitative. Do not expose numeric CPA/TCPA, thresholds, raw geometry, or classifier internals on player-facing surfaces.
- Vector changes should be smoothed enough to avoid twitching between simulation ticks.

## Decision Coaching Rail Comfort Rules

The decision coaching rail is a compact guidance surface, not a tutorial modal.

Rules:

- Maximum player-mode content remains `1 primary cue + 2 chips`.
- Desktop placement: upper-left under the scenario/status strip unless future layout review approves a better location.
- Mobile portrait placement: top band below the status line, no taller than two short text rows.
- Mobile landscape placement: upper-left or upper-center, outside steering/speed controls and clear of ownship.
- Primary cue should fit one line when possible and two lines maximum.
- Chips should be short, stable, and visually secondary.
- No stacked paragraphs, multiple coaching cards, or modal coaching during live control.
- Cue rail must not cover ownship, target vector, corridor boundary, shallow edge, or active warning geometry.
- Cue transitions should be smooth and non-jarring; no animated cue spam.
- Opening lateral-pair cue must remain readable long enough for browser/export play flow.
- Reset with `R` must clear stale danger/result coaching and return to ready/briefing state.

Comfort tone:

- Coaching should feel like a calm watch officer prompt.
- Use measured wording: `caution`, `danger`, `recover`, `increase separation`.
- Avoid arcade language, blame language, or alarm-panel wording.
- Preserve visible draft/non-final training wording where required.

## HUD Readability Rules

HUD should be compact, professional, and secondary to the water view.

Rules:

- Use stable HUD positions; no layout shift when cue text changes.
- Keep instrument labels concise and legible at 1280x720 and mobile browser sizes.
- HUD panels may use translucent dark maritime surfaces, but should not create heavy card stacks.
- Avoid covering the lower-third ownship area or the forward corridor.
- Player surfaces must hide numeric CPA/TCPA, thresholds, encounter confidence, debug closest points, replay seed/tolerance, raw geometry distances, and legal rule numbers.
- QA/debug mode may expose diagnostic values if already available, but it should be visually separated from player surfaces.
- Draft/non-final training status must remain visible in briefing, active attempt when not otherwise visible, result feedback, and QA/debug overlay.
- Result feedback should read like a calm captain note, not a game-over screen.
- Use icons or chips only where they improve recognition. Do not create decorative badges.

Text rules:

- Do not use tiny labels over water as the primary teaching layer.
- Avoid all-caps blocks except short chips if needed.
- Maintain enough contrast without pure-white glare.
- Keep line length short on mobile and avoid horizontal scrolling.

## Motion Comfort Rules

Required motion qualities:

- interpolation between simulation ticks;
- camera damping;
- smooth vessel rotation;
- smooth AIS/vector updates;
- stable HUD positions;
- non-jarring warning and cue transitions.

Avoid:

- camera shake by default;
- sudden zooms;
- uncontrolled camera movement;
- fast pulses;
- blinking loops;
- large animated backgrounds behind text;
- twitchy vector snapping;
- rapid flashing warning fills.

Escalation motion:

- Normal state should be nearly still except vessel/world movement.
- Caution may use a gentle emphasis change: slightly stronger line, chip, or slow opacity transition.
- Danger may use stronger width/color/label contrast.
- Immediate risk may use a short, controlled emphasis pulse if necessary, but not a repeating aggressive flash.
- Any repeated motion should be reducible or avoidable in future accessibility settings.

## Desktop And Mobile Criteria

Desktop minimum visual acceptance at `1280x720`:

- Ownship heading is readable in the lower third.
- Safe corridor and shallow/danger relationship are readable without zoom.
- Crossing target and AIS vector are readable during motion.
- Coaching rail does not cover critical water/traffic information.
- Primary cue is one line where possible, two lines maximum.
- Result feedback is readable without horizontal scrolling.
- Draft/non-final wording remains visible.

Mobile portrait:

- Coaching rail is a top band, not a center modal.
- Primary cue wraps to no more than two short lines.
- Touch controls remain clear and do not cover ownship or the main vector.
- Primary vessel, mark, and vector lines remain visually substantial.
- Debug numeric fields are absent in player mode.

Mobile landscape:

- Ownship lower-third placement remains clear.
- Steering/speed controls do not overlap the coaching rail.
- Target vector and safe corridor remain visible.
- Result feedback does not require horizontal scrolling.

All viewports:

- No incoherent overlap between text, HUD, controls, vessels, marks, and vectors.
- No visible cue spam.
- No aggressive flashing.
- No VTS popup in Scenario 1.

## Accessibility And Perception Criteria

Accessibility and perception rules:

- Do not rely on color alone for safe, caution, danger, AIS, or mark meaning.
- Pair color with shape, line width, pattern, icon/chip, or label.
- Preserve sufficient contrast while avoiding harsh glare.
- Ensure touch targets are comfortably large on mobile.
- Keep persistent motion low and avoid repeated motion that cannot be paused or reduced.
- Avoid attention overload: one main decision cue at a time.
- Use softened but distinct red/green treatment for IALA Region A lateral marks; provide shape/position support.
- Keep text away from busy moving water.
- Avoid small, low-contrast text over the world layer.
- Do not imply final maritime instruction or legal correctness through visual authority, seal-like badges, or official-looking certification marks.

Perception target:

- A first-time player should understand where the safe corridor is, where ownship is going, where the crossing target is moving, and what one action area deserves attention within a few seconds of starting Scenario 1.

## QA Visual Acceptance Checklist

Use this checklist for future visual passes, local exports, staged public candidates, and production smoke when visual changes are in scope.

Identity:

- [ ] Overall impression matches `soft professional maritime simulator`.
- [ ] Visuals are calm, adult, and maritime.
- [ ] Visuals are not cartoon, toy-like, arcade, fantasy, CAD-heavy, or full-chart clutter.

World readability:

- [ ] Ownship is readable in the lower third.
- [ ] Heading orientation is clear.
- [ ] Region A lateral pair is recognizable and softened, not candy-like.
- [ ] Safe-water corridor is visible without neon styling.
- [ ] Shallow treatment is warm and visible without cartoon terrain.
- [ ] Danger treatment is distinct and escalated without aggressive flashing.
- [ ] Crossing target and AIS vector remain readable under motion.
- [ ] Primary lines are not needle-thin.

HUD/coaching:

- [ ] Coaching rail shows no more than one primary cue plus two chips.
- [ ] Coaching rail does not cover ownship, target, vector, safe corridor, or shallow/danger boundary.
- [ ] Draft/non-final wording is visible where required.
- [ ] Player surface hides numeric CPA/TCPA and debug maritime internals.
- [ ] Reset clears stale coaching/result cues.
- [ ] VTS remains disabled/inactive in Scenario 1.

Motion:

- [ ] Camera movement is damped and stable.
- [ ] Vessel rotation is smooth.
- [ ] Vector updates are smooth and not twitchy.
- [ ] Warning transitions are readable and non-jarring.
- [ ] No default camera shake, rapid blinking, strobe, or fast pulse is present.

Desktop/mobile:

- [ ] Desktop `1280x720` is readable.
- [ ] Mobile portrait keeps cue rail, controls, ownship, and vector clear.
- [ ] Mobile landscape keeps controls and cue rail separated.
- [ ] Text does not overlap critical world visuals.
- [ ] Result feedback needs no horizontal scrolling.

Accessibility/perception:

- [ ] Critical states use color plus at least one additional cue.
- [ ] Contrast is sufficient without pure-white glare.
- [ ] Touch targets are comfortably sized on mobile.
- [ ] Repeated motion is absent or mild enough not to distract.
- [ ] No final/official/certified/COLREGS-compliant maritime training claim appears.

Scope:

- [ ] No code, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, scenario data, or maritime logic were changed unless separately assigned.

## UI/HUD Handoff Notes

For UI/HUD:

- Treat this document as visual direction, not permission to compute maritime state.
- Render only Engine-owned state, warning keys, result fields, and approved static scenario facts.
- Keep the coaching rail compact and stable.
- Preserve the current cue hierarchy and player-mode cap of one primary cue plus two chips.
- Keep draft/non-final wording visible.
- Keep debug data out of player-facing surfaces.
- Use soft maritime HUD surfaces with restrained contrast.
- Do not introduce official/certified training visual language.
- Any future redesign should be checked against desktop `1280x720`, mobile portrait, and mobile landscape before export/deploy gates.

## Engine Handoff Notes

For Engine:

- This spec does not redefine safe-water geometry, CPA/TCPA, warning escalation, encounter classification, scenario result, VTS, IALA interpretation, or legal rule correctness.
- Continue exporting display-ready qualitative states for UI/HUD rather than requiring UI/HUD to infer geometry.
- Provide stable state transitions that UI can animate smoothly.
- Keep vectors and vessel transforms stable enough for interpolation and non-twitchy rendering.
- If future visual work needs extra state such as caution buffer visibility, recommended display severity, or vector confidence, Engine should own the state and expose it explicitly.
- Scenario 1 remains IALA Region A only, VTS disabled/inactive, and draft/non-final.

## Boundary Confirmation

This report is documentation only. It does not approve implementation, export, deploy, production change, new scenario creation, VTS activation, maritime logic changes, final training claims, or legal correctness.
