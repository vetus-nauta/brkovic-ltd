# Batch 002 Brief: Marina / Harbour Arrival Basics

Date: 2026-05-27

## Decision

Batch 002 is the next Captain Ether content-growth batch after Batch 001.

Batch 001 is live and production-smoke accepted. Batch 002 should turn core
radio procedure into routine, calm yacht harbour use before Captain Ether moves
into navigation reports, safety broadcasts, urgency, or distress.

## Target File

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
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
marina_harbour
```

## Modules

Use these modules:

- `arrival_call`
- `berth_request`
- `approach_instructions`
- `fuel_water_power`
- `mooring_alongside`
- `departure_basic`

## Content Mix

Target count:

```text
50 items
```

Type mix:

- `10` word items;
- `14` short_expression items;
- `26` phrase items.

Level mix:

- beginner: `18`
- intermediate: `27`
- advanced: `5`

## Content Areas

Include routine yacht harbour material around:

- arrival call;
- berth request;
- fuel berth request;
- water request;
- shore power request;
- fenders and lines;
- port side to / starboard side to;
- proceed to berth;
- stand by outside;
- approach instructions;
- alongside;
- departure request.

## Keep Out

Do not include:

- distress, Mayday, Pan-Pan, SAR, abandon ship;
- fire, flooding, collision damage, man overboard, medical assistance;
- VTS reporting points, pilotage, tugs, commercial traffic authority language;
- complex anchoring commands or local harbour bylaws;
- broad synonym sets for dock/quay/pier/berth without Sea Speak Linguist review.

## Quality Rules

Follow the Batch 001 JSON shape.

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

- `berth / birth`;
- `berth / dock / quay / pier / slip`;
- `moor / berth / anchor`;
- `line / rope`;
- `fender / finder`;
- `port side to / starboard side to`;
- `ahead / astern / alongside / abeam`;
- `stand by outside / wait out / do not answer`;
- `proceed / enter / approach / go ahead`;
- `request berth` versus informal `need a berth`.

## Pedagogical Shape

The batch should progress from harbour words to short requests and then to
longer radio phrases.

Keep the tone routine and practical. The player should feel they are learning
how to call a marina, request a berth, arrange fuel/water/power, and depart
calmly.

## Output

Content Producer should return one copy-ready technical card for the
Director-Engineer chat with:

- batch JSON path;
- counts by type, level, branch, and module;
- risky accepted variants;
- proposed should-accept and should-reject examples;
- dangerous minimal pairs;
- open questions for Sea Speak Linguist;
- confirmation that forbidden files were not changed.
