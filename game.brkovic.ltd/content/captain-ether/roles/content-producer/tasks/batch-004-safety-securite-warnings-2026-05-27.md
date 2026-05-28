# Content Producer Task: Batch 004 Safety / Securite Warnings

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
content/captain-ether/batch-004-safety-securite-warnings-brief.md
content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-accepted-2026-05-27.md
```

Use prior batches only as JSON-shape references:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
content/captain-ether/batches/batch-002-marina-harbour-basics.json
content/captain-ether/batches/batch-003-navigation-reports-basics.json
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
content/captain-ether/batches/batch-004-safety-securite-warnings.json
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
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
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Batch ID:

```text
batch-004-safety-securite-warnings
```

Branch:

```text
safety_securite
```

Target count:

```text
40 items
```

Modules:

- `safety_signal`
- `navigation_warning`
- `weather_sea_state`
- `restricted_visibility`
- `hazard_reporting`
- `safety_readback`

Type mix:

- `6` word items;
- `10` short_expression items;
- `24` phrase items.

Level mix:

- beginner: `8`
- intermediate: `24`
- advanced: `8`

## Required Content Areas

Include calm safety-information radio language:

- Securite/Sécurité signal;
- safety warning;
- navigation warning;
- weather warning;
- sea state;
- restricted visibility;
- hazard / obstruction reporting;
- keeping a listening watch;
- simple acknowledgement/readback of safety information.

## Keep Out

Do not include:

- Pan-Pan expansion;
- Mayday expansion;
- SAR relay;
- abandon ship;
- fire;
- flooding;
- collision damage;
- man overboard;
- medical assistance;
- urgency or distress requests;
- legal-status phrases such as not under command or restricted manoeuvrability;
- heavy VTS/port-control/commercial traffic instructions;
- collision-avoidance intentions;
- CPA/TCPA;
- ordinary English `security` as a substitute for `Securite` or `Sécurité`.

## QA Notes Required

Every risky item should include:

- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- `qa_notes.dangerous_minimal_pairs`;
- `qa_notes.linguist_note`, if useful.

Prepare top-level `dangerous_minimal_pairs` for risks such as:

- `Securite / Sécurité / security`;
- `Securite / Pan-Pan / Mayday`;
- `safety / urgency / distress`;
- `warning / advice / information`;
- `advice / advise`;
- `restricted visibility / poor visibility / visibility good`;
- `navigation warning / weather warning`;
- `hazard / obstruction / danger`;
- `wind / sea state / visibility`;
- `read back / say again`;
- exact positions, channels, times, bearings, distances, and directions inside
  safety-warning phrases.

## Required Validation

Before reporting PASS, run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Report the command result in the technical card.

## Stop Conditions

Stop and report to Director-Engineer if:

- a needed synonym may change maritime meaning;
- a proposed answer needs matcher changes;
- a policy update seems needed;
- the batch starts drifting into Pan-Pan, Mayday, SAR, distress, or urgency;
- the batch cannot meet the requested counts without unsafe filler;
- the validator reports failures you cannot fix inside allowed files;
- you need to touch any forbidden file.

## Expected Output

Create or update the assigned report:

```text
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
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

Batch 004 is ready for Sea Speak Linguist review only if:

- JSON is valid;
- exactly `40` items exist;
- target type and level counts are met;
- every item has branch/module and required fields;
- risky items include QA notes;
- validator command has no failures;
- no Pan-Pan, Mayday, urgency, or distress expansion is included;
- forbidden files were not changed.
