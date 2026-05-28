# Scenario Designer Report: Office Background Scenario Backlog

Date: 2026-05-27
Task ID: TASK-CE-OFFICE-SCEN-0001
Role: Scenario Designer / Captain Ether
Mode: report-only

## Task Result

PASS.

Created a small future scenario backlog card for Director Ether review. No
runtime, API, UI, content data, matcher, router, registry, auth, deploy,
production config, or policy files were changed.

## Files Changed

- `content/captain-ether/roles/scenario-designer/reports/office-background-scenario-backlog-2026-05-27.md`

## Baseline Read

Required files read before writing this report:

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/scenario-designer/rules.md`
- `content/captain-ether/roles/scenario-designer/handoff.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/answer-policy.md`

## Backlog Summary

These are scenario concepts only. They are not approved content drafts and
should not be merged into `starter.json` or any batch until Director Ether
assigns drafting work.

| Concept | Branch | Learner level | Draft size | Primary review before drafting |
| --- | --- | --- | ---: | --- |
| Harbour Departure With Fuel Stop | `marina_harbour` | beginner | 8 turns | Curriculum Architect, Sea Speak Linguist, QA |
| Position Report Before Reporting Point | `navigation_reports` | intermediate | 9 turns | Curriculum Architect, Sea Speak Linguist, QA |
| Restricted Visibility Safety Broadcast | `safety_securite` | intermediate | 10 turns | Curriculum Architect, Sea Speak Linguist, QA |

## Concept 1: Harbour Departure With Fuel Stop

Branch:

```text
marina_harbour
```

Learner level:

```text
beginner
```

Scenario objective:

Train a calm routine departure sequence from berth to fuel berth, then harbour
exit. The scenario should recycle station calls, request language, berth
direction, fuel request, departure clearance, and acknowledgement without
introducing VTS authority or emergency material.

Suggested 8-turn outline:

| Turn | Situation | Learner target |
| ---: | --- | --- |
| 1 | Yacht calls marina before departure. | `Marina Control, Aurora, request departure.` |
| 2 | Marina asks yacht to stand by. | `Aurora standing by.` |
| 3 | Marina clears yacht to leave berth slowly. | `Proceeding from berth.` |
| 4 | Yacht requests fuel berth. | `Request fuel berth.` |
| 5 | Marina assigns port side to at fuel berth. | `Port side to fuel berth.` |
| 6 | Yacht confirms fuel complete and requests departure. | `Fuel complete, request departure.` |
| 7 | Marina clears yacht to proceed to harbour exit. | `Proceeding to harbour exit.` |
| 8 | Yacht closes the routine exchange. | `Thank you, Aurora out.` |

Risky language boundaries:

- `berth` must not accept `birth`.
- `fuel`, `water`, and `shore power` must not substitute for each other.
- `port side to` and `starboard side to` must remain opposite berthing
  instructions.
- `stand by`, `wait out`, and `do not answer` must not collapse.
- `proceed`, `enter`, `approach`, and radio `go ahead` should stay
  item-specific.
- Compact berth codes such as `B12` should stay out until explicitly designed.

Roles that must review before content drafting:

- Curriculum Architect: confirm this fits beginner sequencing and does not
  duplicate existing marina/harbour batch coverage too closely.
- Sea Speak Linguist: approve accepted-answer candidates, reject examples, and
  dangerous minimal pairs.
- QA: confirm the proposed turns are testable as short watch items and identify
  required regression pairs.
- Director-Engineer: approve whether this becomes a batch, scenario-linked
  phrase set, or later branch-watch material.

## Concept 2: Position Report Before Reporting Point

Branch:

```text
navigation_reports
```

Learner level:

```text
intermediate
```

Scenario objective:

Train one compact navigation report sequence with position, course, speed, ETA,
and reporting point language. The scenario should keep numeric load controlled
and require exact values in answer tests.

Suggested 9-turn outline:

| Turn | Situation | Learner target |
| ---: | --- | --- |
| 1 | Yacht calls Coast Radio with a routine position report. | `Coast Radio, Aurora, position report.` |
| 2 | Yacht gives position relative to a point. | `My position is abeam North Point.` |
| 3 | Yacht states course. | `Course zero nine zero.` |
| 4 | Yacht states speed. | `Making five knots.` |
| 5 | Yacht gives ETA to the next reporting point. | `ETA South Buoy one four zero zero UTC.` |
| 6 | Coast Radio asks for readback of ETA. | `Read back ETA one four zero zero UTC.` |
| 7 | Yacht corrects a mistaken time. | `Correction, ETA one four zero zero UTC.` |
| 8 | Coast Radio confirms received. | `Position report received.` |
| 9 | Yacht closes the exchange. | `Aurora out.` |

Risky language boundaries:

- Numeric tokens must stay exact: `090` must not accept `90` unless a specific
  item has been reviewed for that form.
- ETA values must stay exact: `1400` must not accept `1500`.
- `UTC`, `Zulu`, and `Z` should be item-local decisions, not global aliases.
- `course`, `heading`, and `bearing` must not collapse into one accepted term.
- `position`, `destination`, `waypoint`, and `reporting point` must remain
  distinct where the item trains one concept.
- `read back`, `say again`, and `repeat` must remain separate procedure
  concepts.

Roles that must review before content drafting:

- Curriculum Architect: confirm this should follow routine harbour scenarios
  and set the right numeric density for intermediate learners.
- Sea Speak Linguist: approve exact navigation wording, spoken-number forms,
  and accepted time variants.
- QA: define regression cases for wrong course, speed, ETA, and reporting-point
  substitutions.
- Director-Engineer: decide whether branch-aware watch selection should exist
  before scenario-linked navigation turns are added.

## Concept 3: Restricted Visibility Safety Broadcast

Branch:

```text
safety_securite
```

Learner level:

```text
intermediate
```

Scenario objective:

Train a safety-information exchange around restricted visibility without
crossing into urgency or distress. The scenario should reinforce `Securite`,
warning type, location, channel, listening watch, and receipt language.

Suggested 10-turn outline:

| Turn | Situation | Learner target |
| ---: | --- | --- |
| 1 | Coast Radio opens a safety broadcast. | `Securite Securite Securite.` |
| 2 | Coast Radio identifies the message type. | `Navigation warning.` |
| 3 | Coast Radio states the condition. | `Restricted visibility reported.` |
| 4 | Coast Radio states the area. | `Restricted visibility near North Point.` |
| 5 | Coast Radio gives channel instruction. | `Keep listening watch on channel one six.` |
| 6 | Yacht acknowledges safety information. | `Safety information received.` |
| 7 | Yacht asks for warning repetition with correct phrase. | `Say again warning.` |
| 8 | Coast Radio repeats the location. | `Restricted visibility near North Point.` |
| 9 | Yacht reads back the location. | `Read back North Point.` |
| 10 | Yacht closes after confirmation. | `Aurora out.` |

Risky language boundaries:

- `Securite` and `Sécurité` may be accepted only if Linguist confirms the item;
  ordinary English `security` must stay wrong.
- `Securite`, `Pan-Pan`, and `Mayday` must remain separate signals.
- `safety`, `urgency`, and `distress` must not substitute for each other.
- `restricted visibility` should not automatically accept `poor visibility`,
  `reduced visibility`, or `visibility good`.
- `navigation warning`, `weather warning`, and generic `warning` need
  item-local boundaries.
- Channel numbers must stay exact: `channel 16` must not accept `channel 12`
  or `channel 13`.
- `say again warning` and `read back warning` train different actions and must
  not collapse.

Roles that must review before content drafting:

- Curriculum Architect: confirm safety scenario placement after core radio and
  before urgency/distress material.
- Sea Speak Linguist: approve safety-signal spelling, warning terminology, and
  accepted/rejected visibility variants.
- QA: define regression cases for `security`, Pan-Pan, Mayday, wrong channels,
  wrong warning type, and visibility substitutions.
- Director-Engineer: approve whether this scenario can reuse Batch 004
  safety vocabulary or should wait for a dedicated scenario batch.

## General Drafting Constraints

Any future content-drafting task based on this backlog should:

- stay within one branch per scenario unless Director-Engineer approves a mixed
  branch;
- keep the watch short and progressive from simple calls to longer turns;
- include explicit `should_accept`, `should_reject`, and dangerous minimal-pair
  examples before integration;
- avoid broad synonym expansion without Sea Speak Linguist review;
- preserve numeric, channel, heading, ETA, signal, and direction precision;
- keep distress and urgency scenarios out of beginner content;
- avoid production/runtime assumptions until Director-Engineer assigns that
  scope.

## Open Questions For Director Ether

- Should the first scenario-drafting task start with the beginner
  `marina_harbour` concept, matching the Scenario Designer handoff note about a
  harbour departure scenario?
- Should scenarios remain phrase-level content for now, or should a dedicated
  scenario schema be considered later by Director-Engineer?
- Should review order be Curriculum Architect first, then Sea Speak Linguist,
  then QA, before any Director-Engineer merge decision?

## Copy-Ready Handoff

Scenario Designer recommends using `Harbour Departure With Fuel Stop` as the
first small scenario-drafting candidate because it is routine, low-risk,
beginner-friendly, and builds directly on existing core radio and
marina/harbour material. Route to Curriculum Architect before drafting, then to
Sea Speak Linguist for language boundaries, then QA for regression planning.
