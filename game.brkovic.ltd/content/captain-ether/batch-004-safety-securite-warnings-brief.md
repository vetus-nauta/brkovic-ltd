# Batch 004 Brief: Safety / Securite Warnings

Date: 2026-05-27

## Decision

Batch 004 is the next Captain Ether content-growth batch after Batch 003.

Batch 001, Batch 002, and Batch 003 are live and production-smoke accepted.
Batch 004 should introduce calm safety broadcasts, Securite/Sécurité, navigation
warnings, weather/sea-state warnings, restricted visibility, hazard reporting,
and safety readback.

This is a safety-information branch, not an urgency or distress branch.

## Target File

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
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
safety_securite
```

## Modules

Use these modules:

- `safety_signal`
- `navigation_warning`
- `weather_sea_state`
- `restricted_visibility`
- `hazard_reporting`
- `safety_readback`

## Content Mix

Target count:

```text
40 items
```

This batch is smaller than a normal `50` item batch because safety signal
language carries heavier linguist and QA risk per item.

Type mix:

- `6` word items;
- `10` short_expression items;
- `24` phrase items.

Level mix:

- beginner: `8`
- intermediate: `24`
- advanced: `8`

## Content Areas

Include calm safety-information radio language around:

- Securite/Sécurité as a safety signal;
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

The old starter already contains isolated Pan-Pan and Mayday signal items. Do
not use them as permission to expand urgency or distress in Batch 004.

## Quality Rules

Follow the Batch 001 / Batch 002 / Batch 003 JSON shape.

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

## Pedagogical Shape

The batch should progress from safety words to short safety-message frames and
then to complete calm safety broadcasts.

Keep the tone instructional and measured:

- safety information, not emergency drama;
- concrete hazards and weather, not rescue operations;
- clear radio framing, not long scenario chains.

Use advanced items only for longer safety-warning phrases, not for distress
actions.

## Required Validation

Before reporting PASS, run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
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
