# Captain Ether Light Progression Card

Task ID: TASK-CE-OFFICE-GAME-0001  
Role: Gamification Designer  
Date: 2026-05-27  
Mode: Report-only  
Result: PASS

## Proposed Mechanic

Add a report-only progression model called Branch Mastery Signals.

The model should treat each Captain Ether branch as a calm learning area with
light status labels, not as a pass/fail ladder. The player sees that a branch is
being practised, becoming familiar, or ready for review. The purpose is to make
the large future corpus feel navigable while preserving the current short-watch
loop.

Suggested branch states:

- New Waters: branch has started but has too little evidence for judgement.
- Getting Familiar: the player has seen a small spread of items in the branch.
- Holding Watch: recent answers show stable understanding across short watches.
- Review Soon: older mistakes or skipped items should be revisited calmly.

Avoid labels such as failed, weak, locked, demoted, streak broken, or rank lost.
The state should describe practice needs, not learner worth.

## Learning Purpose

Branch Mastery Signals should help Captain Ether scale from the current compact
starter experience toward the `1000+` item roadmap without turning the game into
a grind.

The model supports:

- short watches by summarizing branch progress between watches instead of adding
  longer sessions;
- branch-aware confidence by showing where practice has happened;
- safer review by sending mistakes into Lost Oars rather than penalizing the
  player;
- replay motivation through variety, not pressure;
- Sea Speak precision by treating dangerous minimal pairs as high-value review,
  not as generic incorrect answers.

The design should work with all branch-taxonomy lanes:

- `core_radio`
- `marina_harbour`
- `navigation_reports`
- `traffic_collision`
- `safety_securite`
- `urgency_panpan`
- `distress_mayday`
- `onboard_operations`
- `vts_port_control`
- `review_minimal_pairs`

## Short-Watch Pacing

Progression should stay subordinate to watch completion.

The existing watch lengths remain the pacing anchor:

- beginner: `12` calls;
- intermediate: `16` calls;
- advanced: `20` calls.

The branch card should not ask the player to continue beyond the current watch.
After a watch, it can suggest one quiet next step:

- continue this branch;
- take a mixed watch;
- review Lost Oars;
- return later.

No daily streaks, countdown timers, energy meters, or loss counters should be
used. These mechanics are likely to pressure learners into speed and repetition,
which conflicts with maritime precision.

## Lost Oars Compatibility

Lost Oars should remain the preferred review loop.

Branch progression should read Lost Oars as useful evidence:

- wrong answers create review material;
- skipped items can become review material if the current product policy allows;
- accepted spelling slips should not create Lost Oars;
- accepted Sea Speak variants should reinforce the branch rather than appear as
  mistakes.

The branch card should not shame a player for having Lost Oars. Recommended
language direction:

- "A few phrases are ready for review."
- "This branch has useful Lost Oars to revisit."
- "Hold this watch steady with a short review."

Avoid:

- "You failed this branch."
- "You lost mastery."
- "Too many wrong answers."

## Review Loops

Use review loops that fit short sessions:

1. Watch loop: normal short watch gives branch evidence.
2. Lost Oars loop: missed phrases are replayed calmly.
3. Minimal-pair loop: high-risk contrasts are revisited only when they are
   relevant to the branch or recent errors.
4. Freshness loop: older branch practice can become Review Soon without erasing
   prior progress.

The strongest review signal should come from repeated safe production across
different item types, not from one perfect watch. Words, short expressions, and
longer phrases should all count, because the answer policy already frames the
watch as a rising radio watch.

## Data Needed

Director-Engineer would need to decide whether future implementation should use
only existing watch/session data or add explicit branch-progress storage.

Useful non-sensitive signals:

- branch ID;
- module ID when available;
- level;
- item type;
- latest result category: exact, accepted variant, spelling reminder, wrong,
  skipped, hint if policy allows;
- Lost Oar presence;
- recent exposure count;
- recent correct count;
- oldest unresolved Lost Oar age.

Do not store or display player email or identity data in progression reports.
Any future storage must follow existing answer-log privacy practice.

## Risks

- Overpressure risk: mastery language can make a soft learning tool feel like an
  exam. Mitigation: use neutral state labels and no failure state.
- Grind risk: branch completion percentages can push players into long repeated
  sessions. Mitigation: use qualitative states rather than visible completion
  bars until Director-Engineer explicitly approves otherwise.
- False-confidence risk: one short watch can be too little evidence for true
  maritime competence. Mitigation: require spread across item types and repeated
  short watches before showing Holding Watch.
- Safety-language risk: dangerous minimal pairs must not be treated as cosmetic
  errors. Mitigation: route them to review and keep Sea Speak Linguist ownership
  of meaning.
- Lost Oars tone risk: repeated review can feel punitive if framed badly.
  Mitigation: present Lost Oars as phrases ready to revisit, never as debt.
- Content-volume risk: early branches may have too few items for meaningful
  states. Mitigation: show New Waters until enough branch coverage exists.

## Implementation Owner Route

This report does not propose implementation code.

Future owner route if Director Ether accepts the model:

- Curriculum Architect: confirm branch/module thresholds and branch readiness.
- UX/HUD Designer: propose player-facing placement and wording.
- Director-Engineer: decide data model, runtime integration, and storage.
- Sea Speak Linguist: review any branch wording that implies Sea Speak meaning
  or dangerous-pair handling.
- QA: verify flow, privacy, regression, and tone.

## QA Checks Needed

When implementation is later assigned, QA should verify:

- short-watch lengths remain `12`, `16`, and `20`;
- branch signals do not appear during a watch in a way that distracts from the
  current call;
- wrong answers create calm review prompts, not punitive copy;
- accepted spelling slips do not create Lost Oars;
- accepted variants reinforce progress without implying exact wording was wrong;
- dangerous minimal pairs remain protected by matcher regression;
- Lost Oars review does not overwrite branch progress incorrectly;
- stale branch practice can become Review Soon without erasing previous work;
- no player email or identity data is stored or displayed by progression;
- mobile summary, watch, and Lost Oars screens do not overflow or crowd text;
- branch names and labels remain understandable without long explanations;
- no runtime, router, registry, auth, production config, deploy, or secret scope
  is touched unless a separate task grants it.

## Copy-Ready Director Handoff

PASS. Recommend Branch Mastery Signals as a light, non-punitive progression
card for Captain Ether. It should use qualitative branch states, preserve
short-watch pacing, treat Lost Oars as calm review, avoid streaks and failure
language, and require future Director-Engineer ownership before any runtime or
storage work. Main review gates are Curriculum Architect thresholds, UX/HUD
wording, Sea Speak Linguist safety language, and QA checks for privacy, pacing,
Lost Oars behavior, and dangerous minimal pairs.

Files changed:

- `content/captain-ether/roles/gamification-designer/reports/office-background-light-progression-2026-05-27.md`

Scope preserved:

- runtime/API/UI/content data not touched;
- `starter.json`, batches, matcher, router, registry, auth/platform not touched;
- Watch Officer, Nav Desk, Game Director docs not touched;
- production config, deploy/FTP, secrets not touched.
