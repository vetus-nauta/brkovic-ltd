# Curriculum Report: Next Three Captain Ether Batches

Date: 2026-05-27
Role: Curriculum Architect / Captain Ether
Mode: report-only

## Result

PASS.

Batch 001 is live and production-smoke accepted. The next curriculum step should
extend the player-visible corpus through routine, low-drama yacht radio work
before adding heavier safety, urgency, or distress material.

Recommended sequence:

1. `batch-002-marina-harbour-basics` - Marina / Harbour Arrival Basics.
2. `batch-003-navigation-reports-basics` - Navigation Reports: Position, Course, Speed, ETA.
3. `batch-004-safety-securite-warnings` - Safety / Securite: Weather And Navigation Warnings.

This adds a planned `140` playable items, growing Captain Ether from `90` to
about `230` items after QA and merge.

## Baseline Read

Mandatory files read:

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/curriculum-architect/handoff.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/engineer-report-batch-001-merge-2026-05-27.md`
- `content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md`

Useful supporting files also checked:

- `content/captain-ether/batch-001-radio-procedure-brief.md`
- `content/captain-ether/batch-001-linguist-risk-review-2026-05-27.md`
- `content/captain-ether/sea-speak-linguist-brief.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/roles/content-producer/rules.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`

Current live baseline:

- `90` playable items.
- `39` grammar patterns.
- `2` scenarios.
- Type mix: `22` words, `26` short expressions, `42` phrases.
- Level mix: `46` beginner, `28` intermediate, `16` advanced.
- Branch metadata: `50` `core_radio` items from Batch 001; the original `40`
  starter items do not yet have `branch/module`.
- QA regression: `267` should-accept examples, `270` should-reject examples,
  `15` dangerous minimal-pair groups.
- Watch lengths remain beginner `12`, intermediate `16`, advanced `20`.
- Watch order remains `word -> short_expression -> phrase`.

## Batch 002

ID:

```text
batch-002-marina-harbour-basics
```

Human name:

```text
Marina / Harbour Arrival Basics
```

Recommended batch file:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Branch:

```text
marina_harbour
```

Suggested modules:

- `arrival_call`
- `berth_request`
- `approach_instructions`
- `fuel_water_power`
- `mooring_alongside`
- `departure_basic`

Target count:

```text
50 items
```

Suggested type mix:

| Type | Count | Notes |
| --- | ---: | --- |
| words | 10 | Berth, fuel berth, water, shore power, mooring, fender, line, alongside, approach, departure. |
| short expressions | 14 | Request berth, requesting fuel, stand by outside, proceed to berth, port side to, starboard side to. |
| phrases | 26 | Routine arrival, berth, fuel/water/power, mooring and departure phrases. Include `2` phrase-level scenario-linked turns if useful. |

Do not introduce a new runtime item type for scenario turns unless
Director-Engineer approves it. Scenario material can be drafted as phrase items
with clear `module` and report notes.

Suggested level mix:

| Level | Count |
| --- | ---: |
| beginner | 18 |
| intermediate | 27 |
| advanced | 5 |

Pedagogical progression:

- Start with harbour nouns and spatial words that make later instructions
  understandable.
- Move to short requests and permissions.
- End with calm radio phrases: arrival call, berth request, fuel berth request,
  shore power request, simple departure request.
- Keep advanced items limited to denser harbour instructions, not emergency or
  port-control authority language.

What stays out:

- VTS reporting points, pilotage, tugs, commercial traffic authority language.
- Distress, Pan-Pan, Mayday, fire, flooding, man overboard.
- Complex anchoring commands and local harbour bylaws.
- Broad synonym sets for dock/quay/pier/berth until Sea Speak Linguist decides
  item-local acceptance.

Why this should be first:

- It turns Batch 001 procedure language into practical yacht use immediately.
- It is player-visible and useful without raising distress or heavy safety load.
- It exercises station calls, requests, readback, channel discipline, and
  opening/closing while staying lower-risk than navigation numbers or safety
  signals.
- It prepares the vocabulary needed for later navigation and safety batches.

## Batch 003

ID:

```text
batch-003-navigation-reports-basics
```

Human name:

```text
Navigation Reports: Position, Course, Speed, ETA
```

Recommended batch file:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Branch:

```text
navigation_reports
```

Suggested modules:

- `position_reports`
- `heading_course`
- `speed_distance`
- `eta_reports`
- `reporting_points`
- `navigation_readback`

Target count:

```text
50 items
```

Suggested type mix:

| Type | Count | Notes |
| --- | ---: | --- |
| words | 8 | Position, heading, course, bearing, speed, distance, ETA, waypoint/reporting point. |
| short expressions | 12 | My position, my heading, making five knots, ETA one four zero zero, abeam waypoint. |
| phrases | 30 | Position reports, course/speed reports, ETA updates, readback/correction phrases. Include `4` phrase-level scenario-linked turns if useful. |

Suggested level mix:

| Level | Count |
| --- | ---: |
| beginner | 12 |
| intermediate | 30 |
| advanced | 8 |

Pedagogical progression:

- Use Batch 001 spelling/number discipline as a prerequisite.
- Begin with single navigation concepts.
- Add short report frames.
- End with complete position, course, speed, and ETA transmissions.
- Put numeric density late in the watch and keep each item focused on one
  number family at a time.

What stays out:

- CPA/TCPA and risk-of-collision calculations.
- Restricted visibility, safety warnings, Pan-Pan, Mayday.
- Multi-leg voyage reporting chains.
- Broad acceptance of local time, vague bearings, or non-radio numeric formats
  without linguist review.

## Batch 004

ID:

```text
batch-004-safety-securite-warnings
```

Human name:

```text
Safety / Securite: Weather And Navigation Warnings
```

Recommended batch file:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Branch:

```text
safety_securite
```

Suggested modules:

- `safety_signal`
- `navigation_warning`
- `weather_sea_state`
- `restricted_visibility`
- `hazard_reporting`
- `safety_readback`

Target count:

```text
40 items
```

This is smaller than a normal `50` item batch because it is the first safety
branch expansion and should carry heavier linguist and QA review per item.

Suggested type mix:

| Type | Count | Notes |
| --- | ---: | --- |
| words | 6 | Safety, warning, hazard, visibility, weather, obstruction. |
| short expressions | 10 | Securite, navigation warning, restricted visibility, dangerous obstruction, keep listening watch. |
| phrases | 24 | Calm safety broadcasts, weather/sea-state warnings, hazard position reports, simple acknowledgement/readback. Include `4` phrase-level scenario-linked turns if useful. |

Suggested level mix:

| Level | Count |
| --- | ---: |
| beginner | 8 |
| intermediate | 24 |
| advanced | 8 |

Pedagogical progression:

- Treat Securite as a safety-information branch, not an emergency branch.
- Start with the safety signal and warning nouns.
- Add short safety-message frames.
- End with complete but calm navigation-warning and weather-warning phrases.
- Use advanced items only for longer warnings, not for distress actions.

What stays out:

- Pan-Pan, Mayday, SAR relay, abandon ship, fire, flooding, collision damage,
  man overboard, medical assistance.
- Legal-status phrases such as not under command or restricted manoeuvrability.
- Heavy port-control or commercial traffic instructions.
- Ordinary English `security` as a substitute for `Securite`.

## Progression Across The Three Batches

Batch 002 should make core radio procedure useful in routine harbour situations.
Batch 003 should add measured navigation reporting once players have more
working phrase confidence. Batch 004 should introduce safety broadcasts only
after the player has station calls, requests, readback/correction, harbour
context, and navigation-report basics.

Fatigue controls:

- Preserve short watch lengths: beginner `12`, intermediate `16`, advanced `20`.
- Preserve watch order: `word -> short_expression -> phrase`.
- Keep each batch mostly beginner/intermediate, with only a small advanced tail.
- Avoid long scenario chains in these three batches.
- Cap dense numeric phrases in any one watch; do not make Batch 003 feel like a
  numbers exam.
- Keep Batch 004 smaller and calmer than a normal batch.
- Add branch/module metadata to every new item, but do not require branch-aware
  runtime selection yet.

Early-batch exclusions:

- No heavy distress/MAYDAY expansion yet.
- No Pan-Pan urgency expansion yet.
- No SAR relay, abandon ship, fire, flooding, medical assistance, or man
  overboard expansions yet.
- No CPA/TCPA or complex collision-avoidance branch yet.
- No broad ordinary-English synonym policy.
- No matcher relaxation for channel numbers, headings, times, distances, safety
  signals, or short nautical terms.

## Sea Speak Linguist Risks

Global review priorities:

- Keep operational contrasts strict: `over/out`, `roger/affirmative/correct`,
  `read back/say again`, `affirmative/negative`, `Securite/security`.
- Keep numeric tokens strict: channels, ETA, headings, distances, speeds,
  bearings.
- Review every proposed synonym item-locally; do not create broad synonym
  leakage.
- Require explicit must-stay-wrong examples for every dangerous pair.

Batch 002 risks for Sea Speak Linguist:

- `berth / birth`.
- `berth / dock / quay / pier / slip` and which are safe item-local variants.
- `moor / berth / anchor`.
- `line / rope`.
- `fender / finder`.
- `port side to / starboard side to`.
- `ahead / astern / alongside / abeam`.
- `stand by outside / wait out / do not answer`.
- `proceed / enter / approach / go ahead`.
- `request berth` versus informal `need a berth`.

Batch 003 risks for Sea Speak Linguist:

- `heading / course / bearing`.
- `position / destination / waypoint / reporting point`.
- `ETA` formats: `1400 UTC`, `1400Z`, `one four zero zero UTC`; keep `1500`
  wrong when target is `1400`.
- `090 / 90` and other heading forms.
- `knots / knot / nautical miles / cables`.
- `north / south / east / west` and typo risk in short direction words.
- `decimal / point / dot`.
- `port / starboard` inside navigation report phrases.
- `say again position / read back position`.

Batch 004 risks for Sea Speak Linguist:

- `Securite / Sécurité / security`.
- `safety / urgency / distress`.
- `Securite / Pan-Pan / Mayday`.
- `warning / advice / information`, including `advice / advise`.
- `restricted visibility / poor visibility / visibility good`.
- `hazard / obstruction / danger`.
- Weather wording such as `gale`, `strong wind`, `sea state`, and whether any
  common variants are safe.
- Safety broadcast closing language: avoid collapsing `over`, `out`, and
  `wait out`.

## QA Implications

For each batch acceptance QA:

- Validate unique IDs and required schema fields.
- Confirm every new item has `branch` and `module`.
- Confirm target texts pass the matcher.
- Confirm every `qa_notes.should_accept` example passes.
- Confirm every `qa_notes.should_reject` example stays wrong.
- Add new dangerous minimal-pair groups before merge.
- Run full starter regression after merge.
- Run watch-selection smoke for beginner, intermediate, and advanced.
- Confirm watch order remains `word -> short_expression -> phrase`.
- Confirm short watch lengths remain `12` / `16` / `20`.
- Confirm player-facing payload does not expose `target_text`,
  `accepted_answers`, or `qa_notes`.

Additional QA focus by batch:

- Batch 002: harbour synonyms, side-to instructions, berth/fuel/water/power
  request phrases, and no leakage between `stand by`, `wait out`, and `go ahead`.
- Batch 003: numeric strictness for headings, times, distances, speeds, and
  channel/reporting-point phrases.
- Batch 004: safety signal strictness, especially `Securite` versus `security`,
  and no accidental acceptance of Pan-Pan or Mayday language.

## Recommended Content Producer Assignment

Assign Content Producer to draft Batch 002 first.

Suggested assignment text:

```text
Role: Content Producer / Captain Ether

Working directory:
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd

Task:
Draft content/captain-ether/batches/batch-002-marina-harbour-basics.json.

Mode:
Content draft only.

Allowed files:
content/captain-ether/batches/batch-002-marina-harbour-basics.json
content/captain-ether/roles/content-producer/reports/<assigned-report>.md if needed

Forbidden files:
content/captain-ether/starter.json
content/captain-ether/accepted-answer-dictionary.md
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/answer-policy.md
public/api/captain-ether/
public/assets/
router, registry, Nav Desk, Watch Officer, auth/platform files, deploy state, secrets

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/content-producer/rules.md
content/captain-ether/roles/content-producer/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md

Batch target:
50 items in branch marina_harbour.

Modules:
arrival_call
berth_request
approach_instructions
fuel_water_power
mooring_alongside
departure_basic

Type mix:
10 words
14 short_expression
26 phrase

Level mix:
18 beginner
27 intermediate
5 advanced

Output:
Batch JSON, counts by type/level/branch/module, risky accepted variants,
should-accept and should-reject examples, dangerous minimal pairs, open
questions for Sea Speak Linguist, and confirmation that forbidden files were not
changed.
```

## Director-Engineer Notes

- No runtime or matcher change is recommended before Batch 002 drafting.
- Let Batch 002 expose concrete variants, then route to Sea Speak Linguist.
- Do not ask Content Producer to edit `starter.json` or QA regression files.
- A standalone vessel-parts batch is not the best immediate next step; fold the
  most useful harbour words and direction words into Batch 002 and Batch 003 so
  the player gets practical radio context.

## Report-Only Confirmation

Full report file:

- `content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md`

Director-Engineer summary card:

- `content/captain-ether/roles/director-engineer/reports/curriculum-next-three-batches-card-2026-05-27.md`

Forbidden files were not edited:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/`
- `content/captain-ether/answer-policy.md`
- `public/api/captain-ether/`
- `public/assets/`
- router, registry, Nav Desk, Watch Officer, auth/platform files, deploy state,
  private config, `.netrc`, SMTP, or secrets.
