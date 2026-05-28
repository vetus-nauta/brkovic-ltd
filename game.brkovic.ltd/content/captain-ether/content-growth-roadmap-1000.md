# Captain Ether Content Growth Roadmap

Date: 2026-05-26

## Goal

Grow Captain Ether from the current starter set to `1000+` Sea Speak words, short expressions, and radio phrases without losing trust in the checker.

This is a content-production program, not a one-shot JSON expansion.

## Current Baseline

Current playable content:

- `40` items.
- `20` grammar patterns.
- `2` scenarios.
- `7` word items.
- `11` short-expression items.
- `22` phrase items.

Current quality system:

- `accepted-answer-dictionary.md`
- `accept-reject-qa-pairs.json`
- `answer-policy.md`
- `answer-log-policy.md`
- `branch-taxonomy.md`
- conservative matcher with dangerous minimal pairs protected.

## Target Shape

The first `1000` items should be balanced enough to train real maritime language:

| Band | Target Count | Notes |
|---|---:|---|
| Core nautical words | 180 | vessel parts, directions, manoeuvring, weather, harbour, emergency nouns |
| Short radio expressions | 220 | procedure words, acknowledgements, requests, instructions, corrections |
| Standard radio phrases | 400 | position, traffic, marina, VTS, safety, urgency, distress, routine calls |
| Scenario turns | 150 | multi-step exchanges, readbacks, clarification, escalation |
| Review/minimal-pair drills | 50 | high-risk contrasts such as port/starboard, over/out, 1400/1500 |

Target total: `1000`.

Stretch goal after that: `1500-2000` items with route/voyage contexts, marina operations, weather, pilotage, SAR, emergency repair, and regional port communication.

## Content Levels

Keep levels pedagogical, not merely longer:

- `beginner`: recognition and safe production of core Sea Speak.
- `intermediate`: working yacht radio traffic and marina/VTS operations.
- `advanced`: safety, urgency, distress, restricted visibility, collision avoidance, equipment failures, multi-turn exchanges.

Approximate first-1000 distribution:

- beginner: `300`
- intermediate: `420`
- advanced: `280`

## Topic Map

Use these topic buckets as production lanes:

- vessel parts and geometry
- relative position and direction
- manoeuvring and course alteration
- speed, heading, bearing, ETA, distance
- radio procedure words
- station calls and vessel identification
- readback and correction
- clarification and repetition
- marina approach and berth requests
- anchoring and mooring
- fuel, water, shore power, services
- VTS and traffic information
- collision avoidance intentions
- overtaking, crossing, passing arrangements
- restricted visibility
- lights, shapes, sound signals
- weather and sea state
- navigation warnings
- pilotage and port control
- equipment status
- engine and steering failure
- flooding, fire, grounding
- man overboard
- medical assistance
- Pan-Pan urgency
- Securite safety
- Mayday distress
- not under command / restricted manoeuvrability
- SAR and relay calls
- multi-turn scenario exchanges

## Branch Model

Captain Ether should grow as a branching corpus:

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

Use `branch-taxonomy.md` as the canonical branch map.

The `1000+` goal is a corpus goal. It is not one huge advanced level.

Future batch items should include draft `branch` and `module` fields for organization. The runtime does not need to use them until Captain Ether Core adds branch-aware watch selection.

## Production Batch Size

Work in small batches:

- `50` items per batch for normal content.
- `25` items per batch for emergency/distress/legal-status content.
- `10-15` items per batch for dangerous minimal-pair drills.

Do not add a batch unless it also includes:

- accepted answer variants;
- reject/minimal-pair examples for risky items;
- at least one grammar pattern or scenario link when relevant;
- local JSON validation;
- matcher regression.

## Batch Pipeline

Each batch should move through these steps:

1. Content Producer drafts items in a separate file, not directly into `starter.json`.
2. Sea Speak Linguist reviews accepted answers and must-stay-wrong examples.
3. Captain Ether Core integrates the batch into playable content.
4. QA adds or updates `accept-reject-qa-pairs.json`.
5. Local regression passes.
6. Production deploy and smoke check.
7. Answer logs are watched for real disputes.

## Proposed File Strategy

Keep `starter.json` as the currently playable bundle for now.

For growth, create batch files under:

```text
content/captain-ether/batches/
```

Suggested names:

```text
batch-001-radio-procedure.json
batch-002-vessel-parts-directions.json
batch-003-marina-approach.json
batch-004-navigation-reports.json
batch-005-collision-avoidance.json
```

Only merge a batch into `starter.json` after QA.

Future technical step: add a build/validation script that composes approved batches into the playable content file.

## Quality Gates

Every batch must pass:

- unique `id` values;
- valid `level`, `type`, `topic`;
- non-empty `source_text`, `target_text`, `accepted_answers`;
- target text accepted by matcher;
- all `should_accept` examples pass;
- all `should_reject` examples fail;
- no new dangerous minimal-pair leak;
- beginner/intermediate/advanced watch selection still reaches current-level items.

## Ownership

Captain Ether Core owns:

- schema discipline;
- integration;
- matcher safety;
- watch selection;
- answer-log workflow;
- production deploy.

Sea Speak Linguist owns:

- canonical phrase decisions;
- accepted variants;
- must-stay-wrong examples;
- terminology precision;
- dangerous minimal pairs.

UX/HUD owns:

- whether large content volume still feels playable;
- fatigue signals;
- progress and review UI;
- Lost Oars presentation.

QA owns:

- route/login/watch smoke;
- matcher regression sampling;
- mobile pass;
- answer-log privacy checks;
- batch acceptance reports.

## First Milestones

### M1: 100 Items

Goal: prove the batch pipeline.

Add roughly:

- `20` vessel/direction words;
- `20` radio procedure expressions;
- `40` marina/navigation working phrases;
- `20` accept/reject QA pairs and scenario turns.

### M2: 250 Items

Goal: make beginner and intermediate feel varied.

Add:

- marina arrival/departure;
- fuel/water/berth services;
- VTS traffic information;
- position/course/speed/ETA variants;
- readback/correction drills.

### M3: 500 Items

Goal: support real training sessions without repetition fatigue.

Add:

- collision avoidance;
- restricted visibility;
- weather and warnings;
- equipment status;
- multi-turn scenarios.

### M4: 1000 Items

Goal: broad Captain Ether training corpus.

Add:

- urgency/distress/SAR;
- not under command / restricted manoeuvrability;
- emergency repair;
- medical assistance;
- scenario chains;
- minimal-pair drills.

## Immediate Next Step

Create `batch-001-radio-procedure.json` with about `50` items:

- procedure words;
- acknowledgements;
- repetition/clarification;
- readback/correction;
- closing/opening exchanges.

Do not edit matcher first. Let the batch expose what variants are needed, then send it through Sea Speak Linguist.

Use `batch-001-radio-procedure-brief.md` as the assignment for the content producer.
