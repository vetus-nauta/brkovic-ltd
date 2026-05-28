# QA Report: English-Native Batch 006 Pilot Matrix Review

Дата: 2026-05-27
Роль: QA / Captain Ether
Режим: report-only fixture/matrix design review

## Status

Overall: NEEDS DIRECTOR DECISION.

PASS:

- QA может подготовить future fixture matrix по draft Content Producer и Sea
  Speak Linguist review без доступа к runtime и без изменения playable data.
- Лингвистический review дает достаточную базу для QA dimensions: targets,
  must-stay-wrong examples, dangerous pairs, localization risks и matcher
  guardrails.
- FAIL-блокеров в report-only design review не найдено.

NEEDS DIRECTOR DECISION:

- утвердить English-native stream storage/schema до implementation;
- решить, первый playable pilot содержит 35 ordinary English-native items или
  также 5 embedded `minimal_pair_review` items;
- утвердить revised targets/rejects из linguist review до создания batch JSON,
  fixtures, matcher/API/UI changes или production work.

FAIL:

- нет.

## Scope Confirmation

Прочитаны заданные файлы:

- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/roles/content-producer/reports/english-native-batch-006-pilot-draft-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-batch-006-pilot-linguist-review-2026-05-27.md`

Также прочитаны role-control files, требуемые QA rules:

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`

Target: report-only review of English-native Batch 006 pilot draft and
linguist review.

Runtime target: N/A. Playable Batch 006 data does not exist yet and must not be
created by QA.

Privacy: no secrets, cookies, sessions, CSRF, login codes, player email, player
identity, SMTP, `.netrc`, or private config were read or written.

## Can QA Test This Pilot Now?

QA can test this pilot only as report-only fixture/matrix design from the draft
and linguist review.

QA cannot run acceptance QA, production smoke, watch-flow QA, matcher
regression, Lost Oars checks, answer-log checks, progress checks, or
finish-watch checks for Batch 006 until Director approves implementation and
there is an assigned playable target or fixture file.

## Recommended QA Matrix

Recommended first-pilot item set: 35 items.

Include:

- `EN-B006-CORE-001` to `EN-B006-CORE-015`;
- `EN-B006-MAR-001` to `EN-B006-MAR-010`;
- `EN-B006-NAV-001` to `EN-B006-NAV-010`.

Apply linguist changes before fixture implementation:

- `EN-B006-MAR-009`: replace editorial reject fragment with exact reject
  `enter harbour`;
- `EN-B006-MAR-010`: target must be `I am departing berth now.`;
- `EN-B006-NAV-005`: target must be `My course is to waypoint Alpha.`;
- `EN-B006-NAV-005`: replace reject `course Bravo` with
  `my course is to waypoint Bravo`;
- `EN-B006-NAV-007`: replace reject `two cable north` with
  `two cables north of your position`.

Exclude from first-pilot playable matrix unless Director explicitly keeps a
review block:

- `EN-B006-REV-001` to `EN-B006-REV-005`.

If Director keeps those 5 review items, tag them as review/checkpoint content,
not ordinary English-native source-prompt content. QA matrix then becomes 40
items, but the 5 review items need separate `minimal_pair_review` coverage and
must not be used to prove the ordinary English source prompt model.

Minimum fixture assertions for the recommended 35-item matrix:

| Dimension | Count | Requirement |
| --- | ---: | --- |
| canonical target accepts | 35 | one exact accepted Sea Speak target per item |
| normalization accepts | 70 | at least two per item: capitalization and punctuation/spacing only |
| natural prompt rejects | 35 | exact source prompt as answer must fail for every item |
| must-stay-wrong rejects | 139 | all draft rejects after linguist revisions |
| total minimum assertions | 279 | before optional locale/session/privacy flow checks |

If Director keeps 5 review items, add at minimum:

| Dimension | Count | Requirement |
| --- | ---: | --- |
| canonical target accepts | 5 | exact review target per item |
| normalization accepts | 10 | capitalization and punctuation/spacing only |
| natural prompt rejects | 5 | meta source prompt as answer must fail |
| must-stay-wrong rejects | 21 | all review rejects from linguist report |
| added assertions | 41 | total minimum becomes 320 |

Recommended fixture fields:

- `id`
- `learner_stream: english_native`
- `source_language: en`
- `source_register: ordinary_english`
- `target_language: en`
- `target_register: sea_speak`
- `branch`
- `module`
- `level`
- `source_prompt`
- `target_text`
- `answer`
- `expected: accept|reject`
- `dimension`
- `dangerous_pair`
- `linguist_status`
- `notes`

## Required Accept / Reject Dimensions

Accept dimensions:

- exact target text;
- capitalization-only variant;
- punctuation/spacing-only variant;
- item-local approved numeric rendering only if Director/Linguist explicitly
  allows it for that item.

Reject dimensions:

- source prompt copied as answer;
- natural English paraphrase copied from the learner source register;
- wrong procedure word;
- wrong message marker or missing required marker;
- dangerous minimal-pair substitution;
- changed numeric token;
- changed channel;
- changed heading/course/bearing value or label;
- changed ETA time or UTC/local marker;
- changed distance/speed unit;
- changed direction or side;
- wrong location/object, including harbour/marina/berth/waypoint changes;
- correct phrase plus dangerous extra phrase, e.g. `say again please repeat`;
- typo lookalike that changes maritime meaning, e.g. `birth`, `finder`,
  `advise`.

## Dangerous Pair Coverage

Required Batch 006 dangerous-pair groups:

- `say again` / `repeat`;
- `roger` / `affirmative` / `correct` / `yes`;
- `negative` / `no` / `wrong`;
- `over` / `out` / `over and out`;
- `stand by` / `wait out` / `wait` / `do not answer`;
- `go ahead` / `proceed` / `enter` / `continue`;
- `read back` / `say again`;
- `channel one two` / `channel one three` / `channel one six`;
- marker present / marker missing for `Question`, `Request`, `Correction`;
- `berth` / `birth` / `dock` / `pier` / `slip`;
- `line` / `rope`;
- `fender` / `bumper` / `finder`;
- `fuel` / `fresh water` / `shore power`;
- `port` / `starboard` / `left` / `right`;
- `heading` / `course` / `bearing`;
- `zero nine zero` / `90`;
- `knots` / `nautical miles` / `cables`;
- `north` / `south`;
- `astern` / `ahead` / `abeam`;
- `harbour` / `marina` where the target object is exact;
- `UTC` / `local`;
- `1400` / `1500`.

Existing `accept-reject-qa-pairs.json` also protects adjacent families that
must not regress when Batch 006 is implemented: `Securite / Pan-Pan / Mayday`,
`safety / urgency / distress`, `warning / advice / information`, `restricted
visibility / poor visibility`, `obstruction / obstacle`, `hazard / danger`,
and exact safety channels/times/bearings/distances/directions/locations.

## Localization / Session / Privacy Checks

Localization checks required for future implementation:

- UI locale set can be `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`, and unsupported
  system language fallback remains `en`;
- UI locale must not change `source_language=en`, target language, accepted
  answers, reject policy, item ordering, or stream;
- English UI must not imply ordinary English source prompts are acceptable
  answers;
- Russian UI must not imply the pilot belongs to the existing Russian-source
  stream;
- Sea Speak terms, channels, UTC/Zulu times, headings, bearings, units, call
  signs, vessel names, `port/starboard`, `over/out`, `roger/affirmative`,
  `negative`, `read back/say again`, `Securite`, `Pan-Pan`, and `Mayday` remain
  stable across UI languages.

Session/privacy checks required for future implementation:

- unauthenticated API behavior remains `401` where applicable;
- player-facing payload must not expose `target_text`, `accepted_answers`,
  `qa_notes`, fixture dimensions, internal branch/module notes, or reject
  reasons;
- no answer-log, API response, UI, report, screenshot, or test output contains
  player email, player identity, session IDs, cookies, CSRF, login codes, SMTP,
  `.netrc`, secrets, or private config;
- answer-log entries keep compact hashed identity only, as current policy
  requires.

## Runtime Risk Areas For Future QA

Matcher:

- highest risk is accidentally adding global ordinary English synonyms for
  English-native learners;
- source prompt text must never be copied into `accepted_answers`;
- typo matching must not fuzz numerics, channels, headings, bearings, ETA,
  UTC/local, units, side/direction terms, or short nautical terms;
- digit rendering must be item-local, not global.

Dangerous pairs:

- all listed minimal pairs need must-accept and must-reject regression rows;
- reject rows must include correct phrase plus dangerous extra phrase where the
  draft/linguist review names one.

Answer-log:

- wrong English-native natural answers may become valuable disputed-answer
  evidence, but logs must not be used to auto-expand accepted answers;
- answer-log UI must group by item without showing player identity;
- clean canonical exact answers should remain unlogged.

Progress:

- beginner/intermediate/advanced watch lengths must remain `12/16/20`;
- watch order must remain progressive: words, short expressions, longer
  phrases;
- English-native stream must not mix unpredictably with existing Russian-source
  items unless Director approves stream/defaulting behavior.

Lost Oars:

- wrong natural English answer should create a Lost Oar when appropriate;
- accepted capitalization/punctuation variants should not create Lost Oars;
- resolving a Lost Oar should remove it from visible review immediately;
- Lost Oars UI must not expose accepted answers or internal reject rationale.

Finish-watch:

- summary must count Batch 006 answers consistently;
- no raw matcher reason, internal fixture dimension, accepted-answer list, or
  private player data should appear;
- stream/module labels must not become confusing player-facing copy unless
  localized through the UI layer.

## Missing Cases / Blockers

Blockers before implementation QA:

- no Director-approved English-native storage/schema contract;
- no decision on 35-item pilot versus 40-item pilot with review items;
- no approved playable target, batch JSON, fixture file, or API target for QA
  execution;
- no approved stream selection/defaulting behavior;
- no implementation contract for whether `source_register`,
  `target_register`, and `learner_stream` are production fields.

Missing fixture cases to add when implementation starts:

- one exact natural-prompt-as-answer reject for every item;
- item-local digit-rendering decisions for `channel 12`, `1400`, `090`, and
  related forms;
- "right target plus dangerous extra words" rejects for all relevant items;
- cross-locale smoke for English UI and Russian UI at minimum;
- answer-log privacy smoke for a wrong English-native natural answer;
- Lost Oars correction smoke;
- finish-watch summary privacy smoke.

## Future Implementation Assignment

Future implementation may be assigned only after Director acceptance of:

- 35-item first pilot or 40-item pilot with explicit review/checkpoint content;
- revised target/reject texts from Sea Speak Linguist;
- stream/schema/storage model;
- fixture shape;
- release visibility: internal-only, hidden QA, or public MVP;
- QA acceptance target and permitted files.

Until then, QA route remains report-only and must not change runtime/API/UI,
playable data, `starter.json`, batches, matcher, router, registry, auth,
platform, Watch Officer, Nav Desk, production config, deploy/FTP, secrets,
cookies, sessions, CSRF, player email, or player identity.

## Copy-Ready Handoff For Director Ether

Status: NEEDS DIRECTOR DECISION, report-only. QA can design the English-native
Batch 006 fixture matrix from the Content Producer draft plus Sea Speak
Linguist review, but cannot run acceptance/runtime QA until Director approves a
playable target or fixture file.

Recommended QA matrix: 35 first-pilot items: `CORE-001..015`,
`MAR-001..010`, `NAV-001..010`, with the linguist revisions applied. Exclude
`REV-001..005` unless Director explicitly keeps them as
`minimal_pair_review`/checkpoint content. Minimum first-pilot fixture assertions:
279 for 35 items; if Director keeps all 5 review items, add 41 assertions for a
minimum total of 320.

Director decisions needed before implementation: approve English-native
stream/schema/storage, decide 35 vs 40 items, accept the two target revisions
and two reject revisions, approve fixture shape, and set release visibility.
Future implementation may be assigned after that acceptance. No FAIL found in
QA matrix design review.

## Changed Files

- `content/captain-ether/roles/qa/reports/english-native-batch-006-pilot-qa-matrix-review-2026-05-27.md`

No other files were changed.

## Verification

Runtime tests were not run. This task was report-only fixture/matrix design
review from draft and linguist reports.
