# Curriculum Architect Report: Office Background Next Curriculum Card

Date: 2026-05-27
Task: TASK-CE-OFFICE-CA-0001
Role: Curriculum Architect / Captain Ether
Mode: report-only

## Result

PASS as a curriculum work card.

This report recommends the next three useful Captain Ether curriculum tasks
after Beta 1.1 branch-filter planning. It does not approve runtime, API, UI,
content-data, matcher, router, registry, auth, production, deploy, or policy
changes.

## Baseline

Files read:

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/curriculum-architect/handoff.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/answer-policy.md`
- existing Curriculum Architect reports for next batches and Beta 1.1
  branch-aware watch architecture

Read-only current corpus check:

- total playable items: `230`
- levels: `84` beginner, `109` intermediate, `37` advanced
- types: `46` words, `62` short expressions, `122` phrases
- branches: `50` core radio, `50` marina/harbour, `50` navigation reports,
  `40` safety/Securite, `40` unbranched legacy starter items

The Beta 1.1 branch-filter plan should remain a planning artifact until
Director-Engineer defines an additive selector contract and QA has branch smoke
cases. Mixed Watch should remain the public default.

## Next Three Curriculum Tasks

### 1. Legacy Starter Branch/Module Backfill Card

Recommended owner:

- Curriculum Architect for a report-only mapping card.
- Director-Engineer for any later approved content-data patch.
- Sea Speak Linguist only for terms whose branch/module placement changes
  meaning or accepted-answer risk.

Purpose:

Map the `40` unbranched legacy starter items to canonical `branch` and `module`
values before branch filters become public-facing. This prevents Mixed Watch
from being the only place where legacy items appear and avoids accidental
curriculum gaps when focused branches are piloted.

Priority:

1. `core_radio` legacy procedure, calls, spelling, and acknowledgement items.
2. `navigation_reports` legacy ETA, position, course, heading, and number
   items.
3. `safety_securite` legacy safety-signal or warning items.
4. Any item that does not clearly fit should stay flagged for Director-Engineer
   decision instead of being forced into a branch.

Required output for the next card:

- one row per legacy item id;
- proposed `branch`;
- proposed `module`;
- confidence: high, medium, or needs decision;
- whether Sea Speak Linguist review is required;
- whether any accepted-answer or dangerous-pair regression may need review.

Readiness blockers:

- Curriculum cannot edit `starter.json` in this role.
- Some legacy items may not match the new module naming cleanly.
- If a legacy item carries broad answer variants, branch placement may create
  a new focused-watch minimal-pair risk.

### 2. Batch 005 Traffic / Collision Basics Brief

Recommended owner:

- Curriculum Architect for the batch brief if Director Ether wants another
  report-only planning step.
- Content Producer for the actual draft batch.
- Sea Speak Linguist for accepted/rejected variants and dangerous pairs.
- QA for regression and branch-specific smoke after integration.

Purpose:

Open the next high-value branch after routine harbour, navigation, and safety
basics. The branch should start calmly with traffic information and intentions,
not with dense CPA/TCPA calculation or emergency collision damage.

Recommended branch:

```text
traffic_collision
```

Recommended modules:

- `traffic_information`
- `passing_arrangements`
- `crossing_situation`
- `overtaking_basic`
- `alter_course_speed`
- `keep_clear`

Recommended target:

- `40` items, not `50`, because collision-avoidance language is semantically
  dense and should carry heavier review per item.

Recommended mix:

| Type | Count |
| --- | ---: |
| words | 6 |
| short expressions | 10 |
| phrases | 24 |

Recommended level mix:

| Level | Count |
| --- | ---: |
| beginner | 8 |
| intermediate | 24 |
| advanced | 8 |

Must stay out of Batch 005:

- distress, collision damage, flooding, fire, abandon ship, SAR;
- legal-status drills such as not under command or restricted manoeuvrability;
- full CPA/TCPA interpretation unless a separate advanced batch is approved;
- broad synonyms for course, heading, bearing, pass, cross, overtake, and keep
  clear.

Readiness blockers:

- `traffic_collision` currently has no playable branch pool.
- Phrase distinctions can become dangerous if matcher variants are widened.
- The branch will need explicit reject examples for port/starboard,
  ahead/astern, crossing/overtaking, alter course/reduce speed, and keep
  clear/proceed.

### 3. Branch-Selector QA Readiness Matrix

Recommended owner:

- QA for the readiness matrix and smoke cases.
- Curriculum Architect for thresholds and branch/module interpretation.
- UX/HUD Designer for public selector wording and fatigue presentation after
  QA marks branches eligible.
- Director-Engineer for any runtime/API selector implementation.

Purpose:

Convert the Beta 1.1 branch-filter plan into a gate checklist before any public
selector is exposed. This should be a report-only QA/curriculum matrix first,
not implementation.

Recommended matrix rows:

- `mixed`
- `core_radio`
- `marina_harbour`
- `navigation_reports`
- `safety_securite`
- `traffic_collision` after Batch 005, if approved and merged

Recommended checks per row:

- total items;
- beginner-eligible count;
- beginner+intermediate eligible count;
- advanced-eligible count;
- word, short-expression, and phrase counts;
- module count;
- branch/module metadata completeness;
- dangerous minimal-pair coverage;
- beginner/intermediate/advanced start-watch smoke status;
- repetition-fatigue risk;
- public selector status: hidden, internal pilot, or public-ready.

Readiness blockers:

- No branch should be public while `40` legacy items remain unbranched.
- `core_radio`, `marina_harbour`, and `navigation_reports` are close to
  internal-pilot readiness, but still below the recommended `60` item public
  branch threshold.
- `safety_securite` has only `40` items and a small beginner pool, so it should
  remain hidden/internal only.
- `traffic_collision`, `urgency_panpan`, `distress_mayday`,
  `onboard_operations`, `vts_port_control`, and `review_minimal_pairs` are not
  public-selector candidates yet.

## Branch And Module Priorities

Immediate priority:

1. Keep `mixed` as the public default.
2. Backfill branch/module metadata for legacy starter items.
3. Prepare `core_radio`, `marina_harbour`, and `navigation_reports` for hidden
   branch-filter smoke.

Near-term content priority:

1. Add `traffic_collision` basics after the routine radio branches.
2. Add beginner buffer to `safety_securite` before public branch exposure.
3. Keep `urgency_panpan` and `distress_mayday` later, after traffic and safety
   have stronger scaffolding.

Module discipline:

- New modules should be small enough to support focused review later.
- Do not create public module selection until a module has enough items for
  multiple short watches.
- Module names should describe training function, not UI labels.

## Director Decision Points

Director Ether / Director-Engineer should decide:

1. Whether the next Curriculum Architect assignment is the legacy
   branch/module backfill card or the Batch 005 traffic/collision brief.
2. Whether Beta 1.1 branch-filter work remains report-only until the QA
   readiness matrix exists.
3. Whether the public selector threshold from the Beta 1.1 architecture report
   remains accepted: `60` total items, `24` beginner-eligible,
   `32` beginner+intermediate eligible, `40` advanced-eligible, minimum type
   floors, three modules, metadata completeness, and branch-specific QA smoke.

## Copy-Ready Next Assignments

Recommended first assignment:

```text
Owner: Curriculum Architect
Mode: report-only
Task: Map the 40 unbranched legacy Captain Ether starter items to proposed
branch/module metadata. Do not edit starter.json or content data. Output one
decision row per item with confidence and owner route for any uncertainty.
```

Recommended second assignment:

```text
Owner: Content Producer
Mode: draft batch only, if Director-Engineer allows a batch file
Task: Draft Batch 005 Traffic / Collision Basics using the approved Curriculum
Architect brief. Include accepted answers, must-stay-wrong examples, branch,
module, level, type, and dangerous-pair notes for Sea Speak Linguist review.
```

Recommended third assignment:

```text
Owner: QA
Mode: report-only
Task: Create the branch-selector QA readiness matrix for Mixed Watch, Core
Radio, Marina / Harbour, Navigation Reports, Safety / Securite, and any newly
merged branch. Include item-count thresholds, metadata completeness, dangerous
minimal-pair coverage, and start-watch smoke cases per level.
```

## Scope

Report-only. Changed file:

- `content/captain-ether/roles/curriculum-architect/reports/office-background-next-curriculum-2026-05-27.md`

Not touched:

- runtime/API/UI/content data
- `starter.json`
- batch JSON
- matcher
- router/registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP
- secrets or private config
