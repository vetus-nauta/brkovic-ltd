# Director Engineer Report: English-native Batch 006 pilot intake

Дата: 2026-05-27
Роль: Director Engineer / Captain Ether
Режим: report-only intake

## Решение

Status: NEEDS DIRECTOR DECISION BEFORE IMPLEMENTATION.

Batch 006 English-native pilot прошел полный report-only office loop:

- Content Producer подготовил draft;
- Sea Speak Linguist проверил target/reject риски;
- QA подготовил future fixture matrix.

FAIL нет. Implementation пока не назначать: нужны Director decisions по
storage/schema, составу pilot, fixture shape и release visibility.

## Принятые отчеты ролей

Приняты как planning inputs:

- `content/captain-ether/roles/content-producer/reports/english-native-batch-006-pilot-draft-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-batch-006-pilot-linguist-review-2026-05-27.md`
- `content/captain-ether/roles/qa/reports/english-native-batch-006-pilot-qa-matrix-review-2026-05-27.md`

Все три отчета сохраняют главный принцип English-native stream:

```text
ordinary English / unsafe natural English -> controlled Sea Speak / SMCP-style English
```

Natural English source prompt не становится accepted answer.

## Recommended Pilot Shape

Рекомендация Director Engineer: утвердить первый pilot как 35 items.

Включить:

- `EN-B006-CORE-001` to `EN-B006-CORE-015`;
- `EN-B006-MAR-001` to `EN-B006-MAR-010`;
- `EN-B006-NAV-001` to `EN-B006-NAV-010`.

Исключить из первого playable pilot:

- `EN-B006-REV-001` to `EN-B006-REV-005`.

Причина: `REV-*` items полезны для QA/second-phase minimal-pair review, но их
source prompts являются meta-instructions, а не обычными English-native source
prompts. Они не должны доказывать первую модель pilot.

Если Director решит оставить `REV-*`, их нужно маркировать как
`minimal_pair_review` / checkpoint content и тестировать отдельным блоком.

## Required Content Revisions Before Any Batch JSON

Принять правки Sea Speak Linguist:

- `EN-B006-MAR-009`: заменить editorial reject fragment на точный reject
  `enter harbour`;
- `EN-B006-MAR-010`: target должен быть `I am departing berth now.`;
- `EN-B006-NAV-005`: target должен быть `My course is to waypoint Alpha.`;
- `EN-B006-NAV-005`: reject `course Bravo` заменить на
  `my course is to waypoint Bravo`;
- `EN-B006-NAV-007`: reject `two cable north` заменить на
  `two cables north of your position`.

## QA Matrix To Carry Forward

Для 35-item pilot минимальная future fixture matrix:

- 35 canonical target accepts;
- 70 normalization accepts: capitalization and punctuation/spacing only;
- 35 natural-prompt-as-answer rejects;
- 139 must-stay-wrong rejects after linguist revisions;
- minimum total: 279 assertions before optional flow/session/privacy checks.

Если Director оставит 5 review items:

- add 41 assertions;
- minimum total becomes 320;
- test them as review/checkpoint content, not as ordinary source-prompt items.

Future fixture fields should include:

- `learner_stream: english_native`;
- `source_language: en`;
- `source_register`;
- `target_language: en`;
- `target_register`;
- `branch`;
- `module`;
- `level`;
- `source_prompt`;
- `target_text`;
- `answer`;
- `expected`;
- `dimension`;
- `dangerous_pair`;
- `linguist_status`.

## Director Decisions Required

Implementation requires explicit Director acceptance of:

- 35-item first pilot versus 40-item pilot with review/checkpoint content;
- revised target/reject texts above;
- storage/schema model for `learner_stream`, `source_language`,
  `source_register`, `target_language`, `target_register`;
- whether English-native items live in separate batches/modules or alternate
  source-prompt layers;
- fixture shape and permitted QA fixture path;
- stream selection/defaulting behavior;
- release visibility: internal-only, hidden QA, or public MVP.

Until those are accepted, no runtime/API/UI/content data task should start.

## Localization Impact

Localization rule remains unchanged:

- UI languages: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`, unsupported fallback
  to `en`;
- UI locale does not decide learner source language;
- English-native items use `source_language=en` and `target_language=en`;
- Russian UI must not imply these items belong to the existing Russian-source
  stream;
- English UI must not imply ordinary English prompt text is an acceptable
  answer.

Future UI/API work must keep Sea Speak terms, channels, UTC/Zulu times,
headings, bearings, units, call signs, vessel names, `port/starboard`,
`over/out`, `roger/affirmative`, `negative`, `read back/say again`,
`Securite`, `Pan-Pan`, and `Mayday` stable across UI languages.

## Runtime Risk Areas

Matcher:

- do not add global ordinary-English synonyms;
- do not copy source prompts into `accepted_answers`;
- keep numeric/channel/heading/bearing/ETA/unit/side/direction matching strict;
- allow digit rendering only item-locally after approval.

Answer-log:

- wrong English-native natural answers may be useful disputed-answer evidence;
- logs must not auto-expand accepted answers;
- clean canonical exact answers should remain unlogged;
- player identity must remain private.

Progress:

- watch lengths and progressive order must not regress;
- English-native stream must not mix with existing `ru -> en` items unless
  Director approves stream/defaulting behavior.

Lost Oars:

- wrong natural English answers should create Lost Oars when appropriate;
- accepted capitalization/punctuation variants should not;
- Lost Oars UI must not expose accepted answers or internal reject rationale.

Finish-watch:

- summary must count Batch 006 answers consistently;
- no raw matcher reason, fixture dimension, accepted-answer list, session data,
  player email or player identity should appear.

## Next Safe Task

Next safe task after Director acceptance:

1. Content Producer creates a real Batch 006 JSON draft with 35 items and the
   accepted linguist revisions, or prepares a 40-item variant if Director keeps
   review/checkpoint content.
2. Sea Speak Linguist reviews the actual batch file.
3. QA creates fixture file/matrix from the approved shape.
4. Director Engineer implementation begins only after those gates.

If Director has not accepted the decisions above, next work remains report-only.

## Scope Preserved

- runtime/API not changed.
- UI not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed or published.
- Nav Desk not changed.
- production config and deploy/FTP state not touched.
- secrets, cookies, sessions, CSRF, player email and player identity not
  touched.

## Copy-Ready Handoff For Director Ether

Status: NEEDS DIRECTOR DECISION BEFORE IMPLEMENTATION. English-native Batch
006 completed report-only office loop with no FAIL. Recommended first pilot:
35 items (`CORE-001..015`, `MAR-001..010`, `NAV-001..010`). Keep `REV-001..005`
out of first playable pilot unless Director explicitly approves
`minimal_pair_review` checkpoint content.

Required before implementation: accept 35 vs 40 items, approve Sea Speak
Linguist target/reject revisions, approve stream/schema/storage and QA fixture
shape, decide stream selection/defaulting and release visibility.

Next expected: Director Ether decision. No runtime/API/UI/playable data,
`starter.json`, batches, matcher, router/registry, auth/platform, Watch
Officer, Nav Desk, production config, deploy/FTP or secrets changed.

## Verification

Runtime tests: not run; report-only planning intake.
