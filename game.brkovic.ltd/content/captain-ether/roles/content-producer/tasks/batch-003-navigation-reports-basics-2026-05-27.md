# Content Producer Task: Batch 003 Navigation Reports Basics

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
content/captain-ether/batch-003-navigation-reports-basics-brief.md
content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
```

Use prior batches only as JSON-shape references:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
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
content/captain-ether/batches/batch-003-navigation-reports-basics.json
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
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
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Batch ID:

```text
batch-003-navigation-reports-basics
```

Branch:

```text
navigation_reports
```

Target count:

```text
50 items
```

Modules:

- `position_reports`
- `heading_course`
- `speed_distance`
- `eta_reports`
- `reporting_points`
- `navigation_readback`

Type mix:

- `8` word items;
- `12` short_expression items;
- `30` phrase items.

Level mix:

- beginner: `12`
- intermediate: `30`
- advanced: `8`

## Required Content Areas

Include routine yacht navigation reporting:

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

## QA Notes Required

Every risky item should include:

- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- `qa_notes.dangerous_minimal_pairs`;
- `qa_notes.linguist_note`, if useful.

Prepare top-level `dangerous_minimal_pairs` for risks such as:

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

## Required Validation

Before reporting PASS, run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Report the command result in the technical card.

## Stop Conditions

Stop and report to Director-Engineer if:

- a needed synonym may change maritime meaning;
- a proposed answer needs matcher changes;
- a policy update seems needed;
- the batch cannot meet the requested counts without unsafe filler;
- the validator reports failures you cannot fix inside allowed files;
- you need to touch any forbidden file.

## Expected Output

Create or update the assigned report:

```text
content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md
```

The report must be one copy-ready technical card for the Director-Engineer chat
and include:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- validator command result;
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

Batch 003 is ready for Sea Speak Linguist review only if:

- JSON is valid;
- exactly `50` items exist;
- target type and level counts are met;
- every item has branch/module and required fields;
- risky items include QA notes;
- validator command has no failures;
- forbidden files were not changed.
