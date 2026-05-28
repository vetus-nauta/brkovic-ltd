# Director Engineer Report: English-native learning stream intake

Дата: 2026-05-27
Роль: Director Engineer / Captain Ether
Режим: report-only, planning intake

## Решение

Status: PASS FOR PLANNING.

Status перед implementation: NEEDS DIRECTOR DECISION.

English-native Sea Speak learning stream можно продолжать как отдельное
планирование curriculum/content. Реализацию schema, matcher, API, UI, batch
JSON, `starter.json`, router/registry, production или deploy пока не начинать.

## Принятые отчеты ролей

Приняты как входные planning reports:

- `content/captain-ether/roles/curriculum-architect/reports/english-native-learning-stream-contract-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-sea-speak-guardrails-2026-05-27.md`

Оба отчета сходятся в главном: English-native learners не должны получать
русские prompts, но ordinary English не должен становиться свободным
accepted-answer слоем.

## Текущее состояние корпуса

Текущий playable corpus остается русским learner-source курсом:

- `255` items в `starter.json`;
- все проверенные items имеют форму `ru -> en`;
- это тренирует English Sea Speak output из русского source prompt;
- это не является English-native учебным потоком.

Вывод: English-native stream должен быть отдельным learner-source stream, а не
переводом интерфейса и не расширением accepted answers.

## Принятый учебный принцип

Будущая модель для англоязычных учеников:

```text
ordinary English / unsafe natural English -> controlled Sea Speak / SMCP-style English
```

Разрешено:

- показывать natural English как source prompt;
- учить преобразование бытовой английской фразы в стандартную Sea Speak форму;
- использовать UI localization независимо от learner source language.

Запрещено до отдельного решения:

- автоматически принимать natural English prompt как answer;
- расширять accepted answers обычными английскими paraphrases;
- смешивать `source_language`, UI language и learner stream;
- ослаблять dangerous pairs для English-native learners.

## Минимальный metadata contract для будущего решения

Рекомендуемый direction для Director decision:

```json
{
  "source_language": "en",
  "source_register": "natural_english",
  "target_language": "en",
  "target_register": "sea_speak_smcp",
  "learner_stream": "english_native"
}
```

Не использовать `en-native` как language code. Если нужен learner stream, он
должен быть отдельным полем.

## Первые ветки для будущего MVP

Рекомендуемый первый internal/QA pilot:

- `core_radio`: 15 items;
- `marina_harbour`: 10 items;
- `navigation_reports`: 10 items;
- embedded minimal-pair review: 5 items;
- уровни: beginner/intermediate.

Не начинать первый pilot с `distress_mayday`, `urgency_panpan`,
`traffic_collision` или полного `safety_securite`, пока stream mechanics и QA
reject behavior не доказаны на менее рискованных ветках.

## Guardrails, принятые для QA и content

Эти пары должны оставаться строгими:

- `say again / repeat`;
- `roger / affirmative / correct / yes`;
- `affirmative / negative`;
- `over / out / over and out`;
- `port / starboard / left / right`;
- `heading / course / bearing`;
- channel, time, ETA, heading, bearing, unit and count values;
- `berth / birth / dock / pier / slip`;
- `line / rope`;
- `fender / bumper / finder`;
- `restricted visibility / poor visibility`;
- `Securite / security / Pan-Pan / Mayday`.

Каждый future English-native item должен иметь:

- canonical Sea Speak target;
- item-local accepted answers only;
- at least one should-reject case that repeats or paraphrases the natural
  prompt unsafely;
- Sea Speak Linguist review before accepted-answer merge;
- QA fixture coverage before playable release.

## Localization impact

Поддерживаемые UI languages остаются:

- `en`;
- `ru`;
- `de`;
- `it`;
- `es`;
- `sr` для `srb/mne/hr`;
- `zh`.

UI language не равен learner source language. Пользователь с английским UI
может быть в English-native stream, а пользователь с русским UI может быть в
RU->EN stream. Это требует явного stream selection или Director-approved
defaulting rules в будущей задаче.

## Требуются Director decisions перед implementation

Перед кодом или data changes нужно решить:

- English-native items живут в отдельных batches/modules или как alternate
  source-prompt layer над существующими targets.
- Какие поля metadata утверждаются для `source_language`, `source_register`,
  `target_language`, `target_register`, `learner_stream`.
- Можно ли хранить explicitly unsafe source prompts во внутренних данных без
  player-facing unsafe labels.
- Как QA fixtures кодируют `english_native_source_prompt` отдельно от
  `should_accept` и `should_reject`.
- Когда English-native stream становится selectable/playable: internal-only,
  hidden QA, или public MVP.

## Следующая безопасная задача

Следующий report-only шаг:

1. Content Producer drafts English-native Batch 006 pilot contract на 30-40
   items без изменения playable data.
2. Sea Speak Linguist reviews targets, must-stay-wrong answers and dangerous
   pairs.
3. QA designs fixture matrix for English-native source prompts.
4. Director Engineer prepares implementation contract only after Director
   acceptance.

## Scope preserved

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
- secrets, sessions, CSRF, cookies, player email and player identity not
  touched.

## Checks

Tests to run after this report is added:

- syntax/static PWA checks;
- i18n static checker;
- manifest JSON parse;
- forbidden tracked-file grep before push.
