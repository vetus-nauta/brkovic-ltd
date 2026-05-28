# Batch 003 Brief: Navigation Reports Basics

Date: 2026-05-27

## Decision

Batch 003 is the next Captain Ether content-growth batch after Batch 002.

Batch 001 and Batch 002 are live and production-smoke accepted. Batch 003 should
teach routine position, heading/course, speed, distance, ETA, and reporting-point
language without moving into collision avoidance, safety broadcasts, urgency, or
distress.

## Target File

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Do not merge directly into `starter.json`.

## Role Scope

Content Producer scope is narrow:

- create or update only the assigned batch JSON;
- create or update only the assigned content-producer report;
- do not edit `starter.json`;
- do not edit `accept-reject-qa-pairs.json`;
- do not edit `accepted-answer-dictionary.md`;
- do not edit `answer-policy.md`;
- do not edit matcher/API/UI files;
- do not deploy.

If a policy, matcher, runtime, or UX issue appears, report it to the
Director-Engineer.

## Branch

```text
navigation_reports
```

## Modules

Use these modules:

- `position_reports`
- `heading_course`
- `speed_distance`
- `eta_reports`
- `reporting_points`
- `navigation_readback`

## Content Mix

Target count:

```text
50 items
```

Type mix:

- `8` word items;
- `12` short_expression items;
- `30` phrase items.

Level mix:

- beginner: `12`
- intermediate: `30`
- advanced: `8`

## Content Areas

Include routine yacht navigation reporting around:

- position;
- heading;
- course;
- bearing;
- speed;
- distance;
- ETA;
- waypoint / reporting point;
- position report;
- course and speed report;
- ETA update;
- navigation readback and correction.

## Keep Out

Do not include:

- CPA/TCPA calculations;
- risk-of-collision phrases;
- collision-avoidance intentions;
- restricted visibility;
- safety warnings;
- Pan-Pan, Mayday, SAR, distress, urgency;
- multi-leg voyage reporting chains;
- broad acceptance of local time, vague bearings, or non-radio numeric formats
  without Sea Speak Linguist review.

## Quality Rules

Follow the Batch 001 / Batch 002 JSON shape.

Top-level batch fields should include:

- `version`;
- `batch_id`;
- `status`;
- `date`;
- `branch`;
- `scope`;
- `items`;
- `grammar_patterns`;
- `dangerous_minimal_pairs`;
- `producer_notes` or similar review notes.

Each item must include:

- stable `id`;
- `type`;
- `level`;
- `difficulty_score`;
- `topic`;
- `branch`;
- `module`;
- `source_language`;
- `source_text`;
- `target_language`;
- `target_text`;
- `accepted_answers`;
- `hint_beginner`;
- `hint_intermediate`;
- `hint_advanced`.

Risky items should include `qa_notes`:

- `should_accept`;
- `should_reject`;
- `dangerous_minimal_pairs`;
- `linguist_note`, if useful.

## Dangerous Minimal-Pair Risks

Prepare explicit accept/reject examples for risks such as:

- `heading / course / bearing`;
- `position / destination / waypoint / reporting point`;
- `ETA 1400 / ETA 1500`;
- `1400 UTC / 1400Z / one four zero zero UTC`;
- `090 / 90`;
- `knots / nautical miles / cables`;
- `decimal / point / dot`;
- `north / south / east / west`;
- `port / starboard` inside navigation phrases;
- `say again position / read back position`.

## Pedagogical Shape

The batch should progress from navigation words to short report frames and then
to complete radio phrases.

Use Batch 001 spelling/number discipline as a prerequisite. Keep numeric density
late in the watch and make each item train one number family at a time.

## Required Validation

Before reporting PASS, run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

If the command finds a matcher/policy issue, report it to Director-Engineer
instead of changing matcher/API.

## Output

Content Producer should return one copy-ready technical card for the
Director-Engineer chat with:

- batch JSON path;
- validator command result;
- counts by type, level, branch, and module;
- risky accepted variants;
- proposed should-accept and should-reject examples;
- dangerous minimal pairs;
- open questions for Sea Speak Linguist;
- confirmation that forbidden files were not changed.
