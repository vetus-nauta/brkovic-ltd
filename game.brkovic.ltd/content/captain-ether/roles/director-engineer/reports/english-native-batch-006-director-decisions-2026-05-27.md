# Director Engineer Report: English-native Batch 006 Director Decisions

Дата: 2026-05-27
Роль: Director Engineer / Captain Ether
Режим: decision and dispatch

## Решение

Status: PASS FOR NEXT IMPLEMENTATION STEP.

Director decisions приняты для следующей локальной workstream-ступени.
Разрешается подготовить Batch 006 JSON draft и report-only follow-up reviews.
Не разрешается merge в `starter.json`, public UI, production deploy, auth,
router/registry или Watch Officer/Nav Desk work.

## Принятые Product Decisions

1. Первый English-native pilot: `35` items.
2. `EN-B006-REV-001` to `EN-B006-REV-005` исключить из первого playable pilot.
3. `REV-*` оставить как QA / second-phase minimal-pair review material.
4. English-native доступность: internal-only / hidden QA до отдельного release
   решения.
5. Текущий Captain Ether route остается legacy `ru_source` default.
6. English-native не включать автоматически через `locale === 'en'`.
7. Unsupported system language продолжает давать UI fallback `en`, но не
   выбирает English-native learner stream.

## Принятый Schema Direction

Batch 006 items должны использовать отдельные поля:

```json
{
  "learner_stream": "english_native",
  "source_language": "en",
  "source_register": "ordinary_english",
  "target_language": "en",
  "target_register": "sea_speak_smcp"
}
```

Допустимые `source_register` values для draft:

- `ordinary_english`;
- `unsafe_natural_english`;
- `natural_maritime_english`.

Не использовать `en-native` как language code.

## Принятые Content Revisions

Content Producer должен применить Sea Speak Linguist правки:

- `EN-B006-MAR-009`: reject должен быть точным `enter harbour`, без editorial
  text.
- `EN-B006-MAR-010`: target должен быть `I am departing berth now.`
- `EN-B006-NAV-005`: target должен быть `My course is to waypoint Alpha.`
- `EN-B006-NAV-005`: reject `course Bravo` заменить на
  `my course is to waypoint Bravo`.
- `EN-B006-NAV-007`: reject `two cable north` заменить на
  `two cables north of your position`.

## Batch File Contract

Разрешенный batch path для следующей роли:

```text
content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json
```

Batch status должен быть:

```json
"status": "draft_internal"
```

Batch не должен быть добавлен в `starter.json`.

Each item must include:

- `id`;
- `type`;
- `level`;
- `difficulty_score`;
- `topic`;
- `branch`;
- `module`;
- `learner_stream`;
- `source_language`;
- `source_register`;
- `source_text`;
- `target_language`;
- `target_register`;
- `target_text`;
- `accepted_answers`;
- `hint_beginner`;
- `hint_intermediate`;
- `hint_advanced`;
- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- `qa_notes.dangerous_minimal_pairs`;
- `qa_notes.linguist_note`;
- `qa_notes.localization_note`.

Natural English source prompt must not be copied into `accepted_answers`.

## QA Fixture Direction

QA fixture implementation is not assigned yet. QA may prepare report-only
matrix details after the batch file exists and Linguist review completes.

Minimum accepted matrix direction remains:

- 35 canonical target accepts;
- 70 normalization accepts;
- 35 natural-prompt-as-answer rejects;
- all item-local must-stay-wrong rejects;
- localization/session/privacy checks before any playable integration.

## Localization Decision

Accepted from Localization Architect:

- UI locale and learner stream are separate product axes.
- UI locales remain `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- `sr/hr/bs/me -> sr` is UI mapping only.
- `zh -> zh` is UI mapping only.
- `fr-FR` or unsupported locale -> English UI fallback only.
- Existing users with RU-source progress remain RU-source unless they
  explicitly select another stream after future selector work.

Future selector/defaulting work must be explicitly assigned.

## Dispatched Roles

Next roles:

1. Content Producer: create Batch 006 JSON draft and content report.
2. UX/HUD Designer: prepare stream selector UX policy report, no UI code.
3. Gamification Designer: prepare English-native progression/review pacing
   report, no runtime code.

After Content Producer finishes:

4. Sea Speak Linguist reviews the actual Batch 006 JSON file.
5. QA prepares fixture matrix review for the actual Batch 006 JSON file.

## Scope Preserved

- `starter.json` not changed by this decision.
- Runtime/API not changed.
- UI not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer and Nav Desk not changed.
- production config and deploy/FTP not touched.
- private config, sessions, CSRF, cookies, player email, player identity and
  secrets not touched.

## Copy-Ready Handoff For Director Ether

Decision accepted: proceed with a 35-item internal-only English-native Batch
006 draft. Exclude `REV-*` from first pilot. Keep current Captain Ether route as
legacy `ru_source`; English-native must not be selected by `locale === 'en'`.
Use explicit `learner_stream=english_native`, `source_language=en`, register
fields and `target_register=sea_speak_smcp`.

Next expected: Content Producer creates
`content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`;
Sea Speak Linguist and QA review after that. No deploy or playable merge is
approved.
