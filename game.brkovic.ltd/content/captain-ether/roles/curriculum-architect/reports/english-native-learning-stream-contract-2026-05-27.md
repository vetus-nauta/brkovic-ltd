# Curriculum Architect Report: контракт English-native learning stream

Дата: 2026-05-27
Роль: Curriculum Architect / Captain Ether
Режим: report-only

## Результат

PASS как curriculum-контракт для будущего English-native learning stream.

NEEDS DIRECTOR DECISION перед любыми изменениями schema, matcher, API, UI,
batch JSON, `starter.json`, router, registry, production, deploy, auth или
локализационной реализации.

FAIL: нет. Curriculum-блокера не найдено, если English-native stream будет
отдельным learner-source stream, а не UI-переводом текущих русских prompts.

## Прочитанная база

Прочитаны:

- `README.md`
- `docs/captain-ether-repository-sync-rule.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/curriculum-architect/handoff.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/starter.json`

Read-only проверка корпуса на 2026-05-27:

- текущий playable `starter.json`: `255` items;
- языковая форма: `255` items имеют `ru -> en`;
- ветки в playable corpus: `core_radio` 50, `marina_harbour` 50,
  `navigation_reports` 50, `safety_securite` 40, `urgency_panpan` 25,
  плюс 40 legacy starter items без branch;
- типы: `word` 50, `short_expression` 69, `phrase` 136;
- уровни: `beginner` 88, `intermediate` 118, `advanced` 49.

Вывод: текущий playable corpus является русским learner-source курсом, который
тренирует English Sea Speak output. Для English-native learners он не подходит
как есть.

## Контракт потока

English-native learning должен учить не переводу, а переходу:

```text
ordinary English / unsafe natural English -> controlled Sea Speak / SMCP-style English
```

Нельзя показывать англоязычным ученикам русские prompts. Нельзя считать, что
UI language меняет learner source language.

Будущая реализация должна явно различать:

| Понятие | Значение | Пример |
| --- | --- | --- |
| UI language | Язык интерфейса, кнопок, shell feedback, non-content help. | `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`, fallback `en`. |
| learner source language | Язык prompt, из которого ученик формирует ответ. | `en` для English-native stream, `ru` для текущего stream. |
| learner source register | Стиль и риск source prompt. | ordinary English, vague English, unsafe natural English. |
| target language | Язык ответа. | `en`. |
| target register | Требуемая maritime form. | Sea Speak / SMCP-style controlled English. |

Director decision нужен по способу кодирования register: отдельные поля
metadata или новый item-type convention. Curriculum recommendation:
использовать `source_language: "en"` и `target_language: "en"` для
English-native items, а register хранить отдельно перед production scaling.

## Как учить англичан Sea Speak

English-native stream должен учить standardization, disambiguation и risk
reduction.

Базовый exercise pattern:

| Source prompt style | Задача ученика | Target answer |
| --- | --- | --- |
| ordinary English | Перевести обычную фразу в radio-safe form. | "Please say again." / "Say again." |
| vague English | Заменить бытовую формулировку controlled procedure. | "Request berth." |
| unsafe natural English | Исправить фразу, которая меняет maritime meaning. | "Say again" вместо "repeat". |
| ambiguous English | Выбрать точный Sea Speak term. | "port side" vs "starboard side"; "heading" vs "course". |
| over-fluent English | Сжать до standard radio phrase. | "My position is..." |

Рекомендуемая sequence:

1. Recognition: обычный English prompt -> standard Sea Speak expression.
2. Controlled production: standard answer с hints.
3. Contrast: unsafe lookalikes -> safe form.
4. Minimal-pair review: отдельные high-risk contrasts.
5. Scenario turns: короткие contextual radio turns.

Примеры для будущего Content Producer draft:

| Source English | Target Sea Speak | Must stay wrong |
| --- | --- | --- |
| "Can you repeat that?" | "Say again." | "Repeat." |
| "Yes." | "Affirmative." | "Roger" если item спрашивает yes/confirmation. |
| "I heard you." | "Roger." | "Affirmative" если item спрашивает receipt only. |
| "Turn right." | "Alter course to starboard." | "Alter course to port." |
| "I need a place to park the boat." | "Request berth." | "Request birth", broad "dock" если item тренирует berth. |
| "Go to channel 12." | "Switch to channel one two." | "Channel one three", changed digits. |

## Item types и source_language

Текущие `word`, `short_expression`, `phrase` полезны, но их недостаточно, чтобы
чисто выразить English-native pedagogy.

Рекомендуемые curriculum item families:

| Item family | Source language | Назначение |
| --- | --- | --- |
| `word` | `en` | Ordinary English term -> precise nautical term, например "left side of the boat" -> "port side". |
| `short_expression` | `en` | Natural short utterance -> procedure expression, например "say it again" -> "say again". |
| `phrase` | `en` | Natural full sentence -> radio phrase, например "I will go behind you" -> "I will pass astern of you." |
| `natural_to_seaspeak` | `en` | Явная конверсия ordinary English в controlled Sea Speak. |
| `unsafe_to_safe` | `en` | Замена unsafe natural English на approved form. |
| `minimal_pair_contrast` | `en` | Тренировка dangerous distinctions без расширения accepted answers. |
| `scenario_turn` | `en` | Contextual radio turn: source is plain-English intent, target is Sea Speak. |

Рекомендуемый metadata contract для Director decision:

```json
{
  "source_language": "en",
  "source_register": "natural_english",
  "target_language": "en",
  "target_register": "sea_speak_smcp",
  "learner_stream": "english_native"
}
```

Не использовать `source_language: "en-native"` как language code. Если нужен
learner stream, он должен быть отдельным полем, не заменой `source_language`.

## Первый English-native MVP

Рекомендуемый MVP: 30-40 items, сначала internal/QA, не public default.

Лучшие ветки для старта:

| Branch | Readiness | Почему |
| --- | --- | --- |
| `core_radio` | PASS для первого MVP planning. | Максимальная польза: natural English -> procedure words; dangerous pairs уже описаны. |
| `marina_harbour` | PASS как второй MVP slice. | Бытовой English часто vague, но operational risk управляем, если berth/fuel/water/power остаются item-specific. |
| `navigation_reports` | PASS with caution. | Нужен для heading/course/speed/ETA precision, но numbers и bearings требуют строгой regression. |

Не начинать MVP с:

- `distress_mayday`: слишком high-stakes для проверки stream mechanics;
- `urgency_panpan`: только после доказанного conversion pattern;
- `traffic_collision`: dense semantics, высокий риск over-accept;
- `safety_securite`: полезно, но `Securite/security/safety` contrasts требуют
  зрелого minimal-pair handling;
- `review_minimal_pairs`: должно поддерживать MVP, а не быть единственной
  первой веткой.

Подходящие modules:

| Branch | Modules |
| --- | --- |
| `core_radio` | `radio_procedure`, `clarification`, `acknowledgement`, `message_markers`, `readback_correction`, `opening_closing` |
| `marina_harbour` | `berth_request`, `fuel_water_power`, `approach`, `mooring`, `departure` |
| `navigation_reports` | `position_reporting`, `heading_course`, `speed_distance`, `eta_reports`, `navigation_readback` |

Рекомендуемый first MVP mix:

- 15 `core_radio` items;
- 10 `marina_harbour` items;
- 10 `navigation_reports` items;
- 5 `minimal_pair_contrast` items как embedded review;
- только beginner/intermediate, если Director не одобрит advanced pilot.

## Как не сломать accepted/rejected/dangerous pairs

Главный риск English-native items: wrong answer может быть fluently grammatical
English. Matcher не должен награждать fluency, если maritime meaning изменился.

Curriculum rules для будущих batches:

- Каждый English-native item должен иметь `accepted_answers`, ограниченные
  target Sea Speak meaning.
- Каждый risky item должен иметь proposed `should_reject` examples для QA.
- Natural English source text нельзя auto-add как accepted answer.
- Unsafe natural English должен быть source prompt или reject example, но не
  target variant.
- Dangerous pairs должны оставаться language-gated by item and learner stream.
- Typo tolerance остается conservative для numbers, channels, headings, ETA,
  port/starboard, over/out, Securite/Pan-Pan/Mayday и short nautical terms.

Pairs, которые требуют immediate regression coverage:

- `say again / repeat`
- `roger / affirmative / correct`
- `affirmative / negative`
- `over / out / wait out`
- `port / starboard`
- `heading / course / bearing`
- `090 / 90`
- `1400 / 1500`
- `channel 12 / channel 13 / channel 16`
- `berth / birth / dock / quay / pier / slip`
- `line / rope`
- `fender / finder / bumper`
- `water / fuel / shore power`

Sea Speak Linguist gate обязателен перед merge accepted-answer set.
QA gate обязателен до того, как stream станет playable.

## Что делать с текущими RU->EN items

Не заменять и не мутировать текущие `ru -> en` items ради English-native
learners.

Рекомендуемое handling:

- Сохранить текущие RU-source items как Russian learner-source stream.
- Сохранить их accepted/rejected behavior.
- Не переводить `source_text` in place на English.
- Не выводить English-native items mechanically из Russian prompts.
- Использовать текущие `target_text` только как seed candidates после того,
  как Content Producer и Sea Speak Linguist создадут English source prompt и
  reject set.
- Legacy unbranched items не трогать до отдельной Director-approved
  branch/module backfill task.

Safe reuse:

- `target_text` и выбранные accepted variants могут информировать
  English-native targets.
- Dangerous-pair decisions из `answer-policy.md` и
  `accept-reject-qa-pairs.json` нужно перенести в English-native QA design.

Unsafe reuse:

- Russian `source_text` нельзя показывать English-native learners.
- Broad accepted variants нельзя расширять только потому, что English source
  prompt звучит natural.
- Current item ids нельзя reuse для других prompts; нужны новые ids или
  stream-specific convention после Director decision.

## QA smoke matrix для будущей реализации

Эта matrix для будущего QA task. В этом report-only задании она не выполнялась.

| Block | Smoke case | Expected result |
| --- | --- | --- |
| UI language fallback | Unsupported browser language opens app. | UI starts in English; learner stream does not silently change. |
| UI language switch | UI set to `ru`, `de`, `it`, `es`, `sr`, or `zh`. | Interface copy changes; Sea Speak target remains English. |
| English-native prompt | Start English-native MVP watch. | Prompt is English natural/unsafe source, not Russian. |
| Russian stream prompt | Start existing Russian-source watch. | Prompt remains Russian source, target remains English. |
| Source/target labels | Inspect item metadata used by watch. | UI language, source language, and target language are distinguishable. |
| Accepted answer | Source "Can you say that again?" answer "say again". | Accepted. |
| Unsafe reject | Same item answer "repeat". | Rejected where policy requires `say again`. |
| Meaning reject | "Turn right" item answer "alter course to port". | Rejected. |
| Number reject | Channel/ETA/heading item answer changes digits. | Rejected. |
| Natural source not accepted | Player repeats natural prompt verbatim. | Rejected unless explicitly also Sea Speak for that item. |
| Dangerous pair regression | Run existing accept/reject pairs plus English-native additions. | No pair flips. |
| Mixed watch isolation | Existing RU-source mixed watch after English-native content exists. | Existing answers and prompts unchanged. |
| Mobile text length | Long localized UI with English source prompt. | No overlap; Sea Speak answer/hints remain readable. |

Minimum future QA languages:

- UI `en` with learner source `en`;
- UI `ru` with learner source `en`;
- UI `de` or `zh` with learner source `en` для long/compact UI stress;
- UI `en` with learner source `ru` для regression текущего stream.

## Localization impact

Localization является gate, а не display detail.

Обязательные различия:

- UI localization переводит buttons, labels, feedback shell и non-content help.
- Learner source prompt выбирается stream, не UI language.
- Sea Speak target остается English и не локализуется в German, Italian,
  Spanish, Serbian, Chinese или Russian.
- Russian UI user может позже выбрать English-native stream, если продукт это
  разрешит; browser-English user может использовать Russian-source learning,
  если явно выбрал его.
- Unsupported UI language fallback to English не должен означать
  `source_language: "en"`, если learner stream не English-native.

Player-facing wording risk:

- Label "English" ambiguous. Future UI должен различать "Interface language:
  English", "Prompt language: English" и "Target: Sea Speak English".
- Если появится selector wording, нужен UX/HUD и Localization Architect review
  до public exposure.

## Handoff для Director Ether

Нужны решения:

1. Approve/reject отдельный `english_native` learner stream как content
   contract.
2. Решить, добавлять ли source/target register metadata до первого batch, или
   первый batch может использовать item-type naming only.
3. Назначить Content Producer draft на 30-40 items только после выбора metadata
   convention.
4. Назначить Sea Speak Linguist pre-review dangerous pairs и must-stay-wrong
   examples перед integration.
5. Назначить QA smoke matrix до public exposure.

Рекомендуемое Director decision:

```text
Approve English-native stream planning.
Do not implement runtime/UI yet.
Start with a report-only batch brief for core_radio English-native MVP.
```

## Handoff для Content Producer

После отдельного assignment подготовить отдельный English-native batch. Не
редактировать `starter.json`.

Draft constraints:

- `source_language: "en"`;
- `target_language: "en"`;
- source prompt: ordinary, vague или unsafe natural English;
- target: Sea Speak / SMCP-style controlled English;
- include branch and module;
- accepted answers only for target Sea Speak meaning;
- proposed should-reject examples for every risky item;
- dangerous minimal pairs explicit;
- без distress, Mayday, SAR и dense collision-avoidance, пока stream mechanics
  не пройдут QA.

Suggested first batch name после Director approval:

```text
batch-english-native-001-core-radio-basics.json
```

Suggested first content split:

| Type family | Count |
| --- | ---: |
| `natural_to_seaspeak` / `short_expression` | 12 |
| `unsafe_to_safe` | 8 |
| `phrase` | 12 |
| `minimal_pair_contrast` | 4-6 |

Producer notes должны включать:

- accepted answer candidates;
- must-stay-wrong natural English;
- почему wrong phrase unsafe или non-standard;
- нужен ли Sea Speak Linguist review.

## Проверки

- Прочитаны required assignment files.
- Выполнен read-only corpus count для `starter.json`.
- Выполнен read-only batch shape check для existing batch files.
- Создан только этот assigned report file.
- Не редактировались runtime, API, UI, matcher, `starter.json`, batches,
  router, registry, auth, production config, deploy state, secrets, cookies,
  sessions, CSRF values, login codes, player email или player identity data.
