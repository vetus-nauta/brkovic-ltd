# Content Producer Task: Batch 002 Marina / Harbour Basics

Date: 2026-05-27

## Role

Content Producer / Captain Ether.

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Mandatory First Read

Before work, read:

```text
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/content-producer/rules.md
content/captain-ether/roles/content-producer/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/batch-002-marina-harbour-basics-brief.md
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
```

Use Batch 001 only as a JSON-shape reference:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

## Functional Duty

Draft assigned content only.

Content Producer does not decide runtime behavior, matcher policy, accepted
variant policy, QA regression, merge, deploy, UI, routing, or auth behavior.

## Mode

Content draft with narrow file edits.

## Allowed Files

You may create or update only:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/answer-policy.md
content/captain-ether/role-command-protocol.md
content/captain-ether/roles/ except the assigned report file
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP, cookies, login codes, player
identity, or secrets.

## Exact Task

Draft:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Batch ID:

```text
batch-002-marina-harbour-basics
```

Branch:

```text
marina_harbour
```

Target count:

```text
50 items
```

Modules:

- `arrival_call`
- `berth_request`
- `approach_instructions`
- `fuel_water_power`
- `mooring_alongside`
- `departure_basic`

Type mix:

- `10` word items;
- `14` short_expression items;
- `26` phrase items.

Level mix:

- beginner: `18`
- intermediate: `27`
- advanced: `5`

## Required Content Areas

Include routine yacht harbour material:

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

## QA Notes Required

Every risky item should include:

- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- `qa_notes.dangerous_minimal_pairs`;
- `qa_notes.linguist_note`, if useful.

Prepare top-level `dangerous_minimal_pairs` for risks such as:

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

## Stop Conditions

Stop and report to Director-Engineer if:

- a needed synonym may change maritime meaning;
- a proposed answer needs matcher changes;
- a policy update seems needed;
- the batch cannot meet the requested counts without unsafe filler;
- you need to touch any forbidden file.

## Expected Output

Create or update the assigned report:

```text
content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md
```

The report must be one copy-ready technical card for the Director-Engineer chat
and include:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- batch JSON path;
- changed files;
- counts by type, level, branch, and module;
- risky accepted variants;
- should-accept and should-reject examples;
- dangerous minimal pairs;
- open questions for Sea Speak Linguist;
- any matcher/policy risks;
- confirmation that forbidden files were not changed.

## Success Criteria

Batch 002 is ready for Sea Speak Linguist review only if:

- JSON is valid;
- exactly `50` items exist;
- target type and level counts are met;
- every item has branch/module and required fields;
- risky items include QA notes;
- forbidden files were not changed.
