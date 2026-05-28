# Отчет Content Producer: English-native Batch 006 Pilot Draft

Дата: 2026-05-27
Роль: Content Producer / Captain Ether
Режим: report-only draft

## Статус

PASS FOR DRAFT.

NEEDS DIRECTOR DECISION BEFORE IMPLEMENTATION: перед любым изменением schema,
matcher, API, UI, batch JSON, `starter.json`, router, registry, production,
deploy, auth/platform или QA fixtures.

FAIL: нет. Draft-блокера не найдено при условии, что Batch 006 остается
report-only planning artifact и не становится playable data без Director
decision, Sea Speak Linguist review и QA gate.

## Прочитанная база

Прочитаны обязательные документы:

- `content/captain-ether/roles/content-producer/rules.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/answer-policy.md`

Прочитаны planning reports:

- `content/captain-ether/roles/curriculum-architect/reports/english-native-learning-stream-contract-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-sea-speak-guardrails-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/english-native-learning-stream-intake-2026-05-27.md`

## Цель Batch 006 English-native Pilot

Batch 006 должен проверить учебную модель:

```text
ordinary English / unsafe natural English -> controlled Sea Speak / SMCP-style English
```

Цель pilot - не перевод интерфейса и не расширение accepted answers обычными
английскими paraphrases. Цель - обучить англоязычного ученика заменять
естественные, слишком свободные или потенциально опасные английские фразы на
стандартные Sea Speak ответы.

Предлагаемый MVP scope:

- всего proposed items: `40`;
- `core_radio`: `15`;
- `marina_harbour`: `10`;
- `navigation_reports`: `10`;
- embedded minimal-pair review: `5`;
- уровни: только beginner/intermediate;
- target language: English Sea Speak / SMCP-style phraseology;
- learner source language: English natural prompt.

Не предлагается отдельный production branch `review_minimal_pairs` для первого
pilot. Embedded review items ниже сохраняют operational branch и используют
module `minimal_pair_review`, пока Director не утвердит отдельную taxonomy.

## Proposed items: core_radio

| Proposed ID | Branch | Module | Level | Source English natural prompt | Target Sea Speak answer | Must-reject examples |
| --- | --- | --- | --- | --- | --- | --- |
| EN-B006-CORE-001 | `core_radio` | `clarification` | beginner | `What did you say?` | `Say again.` | `repeat`; `please repeat`; `what did you say` |
| EN-B006-CORE-002 | `core_radio` | `clarification` | beginner | `What did you say about my position?` | `Say again your position.` | `repeat your position`; `say again my position`; `what is my position` |
| EN-B006-CORE-003 | `core_radio` | `acknowledgement` | beginner | `I heard your message.` | `Roger.` | `affirmative`; `yes`; `got it`; `copy` |
| EN-B006-CORE-004 | `core_radio` | `acknowledgement` | beginner | `Yes.` | `Affirmative.` | `yes`; `roger`; `correct`; `OK` |
| EN-B006-CORE-005 | `core_radio` | `acknowledgement` | beginner | `No.` | `Negative.` | `no`; `not roger`; `wrong`; `negative roger` |
| EN-B006-CORE-006 | `core_radio` | `opening_closing` | beginner | `I have finished my turn and expect your reply.` | `Over.` | `out`; `over and out`; `go ahead`; `roger` |
| EN-B006-CORE-007 | `core_radio` | `opening_closing` | beginner | `The conversation is finished.` | `Out.` | `over`; `over and out`; `finished`; `roger out` |
| EN-B006-CORE-008 | `core_radio` | `radio_procedure` | beginner | `Can you wait?` | `Stand by.` | `wait`; `hold on`; `wait out`; `do not answer` |
| EN-B006-CORE-009 | `core_radio` | `radio_procedure` | intermediate | `Stop answering for now.` | `Wait out.` | `stand by`; `wait`; `hold on`; `out` |
| EN-B006-CORE-010 | `core_radio` | `radio_procedure` | intermediate | `You can speak now.` | `Go ahead.` | `proceed`; `enter`; `continue`; `over` |
| EN-B006-CORE-011 | `core_radio` | `readback_correction` | intermediate | `Tell me the channel back.` | `Read back channel one two.` | `say again channel one two`; `read back channel one three`; `channel 12 please` |
| EN-B006-CORE-012 | `core_radio` | `radio_procedure` | intermediate | `Move the radio to channel twelve.` | `Switch to channel one two.` | `switch to channel one three`; `go to channel 12`; `channel one six`; `change to twelve` |
| EN-B006-CORE-013 | `core_radio` | `message_markers` | intermediate | `I need permission to enter.` | `Request permission to enter.` | `I need permission`; `question permission to enter`; `answer permission to enter` |
| EN-B006-CORE-014 | `core_radio` | `message_markers` | intermediate | `I am asking for your ETA.` | `Question. What is your ETA?` | `what is your ETA`; `request what is your ETA`; `answer ETA` |
| EN-B006-CORE-015 | `core_radio` | `readback_correction` | intermediate | `That is wrong. The channel is twelve.` | `Correction. Channel one two.` | `wrong channel twelve`; `correction channel one three`; `channel 12` |

## Proposed items: marina_harbour

| Proposed ID | Branch | Module | Level | Source English natural prompt | Target Sea Speak answer | Must-reject examples |
| --- | --- | --- | --- | --- | --- | --- |
| EN-B006-MAR-001 | `marina_harbour` | `berth_request` | beginner | `I need a place in the marina tonight.` | `Request berth for tonight.` | `need a berth tonight`; `request birth for tonight`; `request slip for tonight`; `request dock` |
| EN-B006-MAR-002 | `marina_harbour` | `berth_request` | beginner | `Can I park the boat at berth Bravo one two?` | `Request berth Bravo one two.` | `request berth B12`; `request birth Bravo one two`; `park at berth Bravo one two` |
| EN-B006-MAR-003 | `marina_harbour` | `fuel_water_power` | beginner | `I need fuel.` | `Request fuel.` | `need fuel`; `request water`; `request shore power`; `fuel please` |
| EN-B006-MAR-004 | `marina_harbour` | `fuel_water_power` | beginner | `I need fresh water.` | `Request fresh water.` | `need water`; `request fuel`; `request shore power`; `request water fuel` |
| EN-B006-MAR-005 | `marina_harbour` | `fuel_water_power` | beginner | `I need to plug in at the dock.` | `Request shore power.` | `request power`; `request fuel`; `request fresh water`; `plug in` |
| EN-B006-MAR-006 | `marina_harbour` | `mooring` | beginner | `Put out the bumpers.` | `Prepare fenders.` | `prepare bumpers`; `prepare finders`; `put out bumpers`; `prepare lines` |
| EN-B006-MAR-007 | `marina_harbour` | `mooring` | beginner | `Tie the ropes.` | `Prepare lines.` | `prepare ropes`; `tie ropes`; `prepare fenders`; `make fast ropes` |
| EN-B006-MAR-008 | `marina_harbour` | `approach` | intermediate | `Wait outside the marina.` | `Stand by outside the marina.` | `wait out`; `wait outside`; `do not answer outside`; `enter marina` |
| EN-B006-MAR-009 | `marina_harbour` | `approach` | intermediate | `Come into the harbour now.` | `Proceed into harbour.` | `go ahead`; `approach harbour`; `enter harbour` without item-local approval; `proceed out of harbour` |
| EN-B006-MAR-010 | `marina_harbour` | `departure` | intermediate | `I am leaving the berth now.` | `Departing berth now.` | `arrival berth now`; `leaving dock`; `departing birth now`; `request berth now` |

## Proposed items: navigation_reports

| Proposed ID | Branch | Module | Level | Source English natural prompt | Target Sea Speak answer | Must-reject examples |
| --- | --- | --- | --- | --- | --- | --- |
| EN-B006-NAV-001 | `navigation_reports` | `heading_course` | beginner | `Turn right to avoid me.` | `I am altering course to starboard.` | `turn right`; `alter course to port`; `I am turning right`; `starboard side to` |
| EN-B006-NAV-002 | `navigation_reports` | `heading_course` | beginner | `Turn left.` | `I am altering course to port.` | `turn left`; `alter course to starboard`; `I am going left`; `port side to` |
| EN-B006-NAV-003 | `navigation_reports` | `position_reporting` | beginner | `I am north of the marina.` | `My position is north of the marina.` | `I am at marina`; `position south of the marina`; `my course is north`; `north marina` |
| EN-B006-NAV-004 | `navigation_reports` | `heading_course` | intermediate | `I am steering east.` | `My heading is zero nine zero degrees.` | `my course is east`; `heading 90 degrees`; `bearing zero nine zero`; `east` |
| EN-B006-NAV-005 | `navigation_reports` | `heading_course` | intermediate | `I am going to waypoint Alpha.` | `My course is waypoint Alpha.` | `my heading is waypoint Alpha`; `bearing waypoint Alpha`; `going to Alpha`; `course Bravo` |
| EN-B006-NAV-006 | `navigation_reports` | `speed_distance` | beginner | `I am doing six knots.` | `My speed is six knots.` | `six nautical miles`; `speed six cables`; `doing six`; `my distance is six knots` |
| EN-B006-NAV-007 | `navigation_reports` | `speed_distance` | intermediate | `The buoy is two cables north of me.` | `Buoy two cables north of my position.` | `two nautical miles`; `two cables south`; `buoy north`; `two cable north` |
| EN-B006-NAV-008 | `navigation_reports` | `eta_reports` | intermediate | `I will arrive at two pm UTC.` | `ETA harbour one four zero zero UTC.` | `ETA harbour 1500 UTC`; `ETA harbour 1400 local`; `two pm`; `ETA marina 1400 UTC` |
| EN-B006-NAV-009 | `navigation_reports` | `navigation_readback` | intermediate | `Say my heading back to me: zero nine zero.` | `Read back heading zero nine zero degrees.` | `say again heading zero nine zero`; `read back heading 90 degrees`; `read back bearing zero nine zero`; `heading east` |
| EN-B006-NAV-010 | `navigation_reports` | `position_reporting` | intermediate | `I passed behind your vessel.` | `I passed astern of your vessel.` | `I passed behind`; `I passed ahead of your vessel`; `I passed abeam`; `astern side` |

## Proposed items: embedded minimal-pair review

| Proposed ID | Branch | Module | Level | Source English natural prompt | Target Sea Speak answer | Must-reject examples |
| --- | --- | --- | --- | --- | --- | --- |
| EN-B006-REV-001 | `core_radio` | `minimal_pair_review` | intermediate | `You heard the message only. Do not say yes.` | `Roger.` | `affirmative`; `yes`; `correct`; `copy` |
| EN-B006-REV-002 | `core_radio` | `minimal_pair_review` | intermediate | `You are confirming yes, not just receipt.` | `Affirmative.` | `roger`; `yes`; `correct`; `received` |
| EN-B006-REV-003 | `core_radio` | `minimal_pair_review` | intermediate | `Ask them to say the message again. Do not use repeat.` | `Say again.` | `repeat`; `please repeat`; `read back`; `say again please repeat` |
| EN-B006-REV-004 | `marina_harbour` | `minimal_pair_review` | intermediate | `Ask for a marina place, not a dock, pier, slip, or birth.` | `Request berth.` | `request birth`; `request dock`; `request pier`; `request slip`; `need a berth` |
| EN-B006-REV-005 | `navigation_reports` | `minimal_pair_review` | intermediate | `Report east as a bearing value, not a heading or course.` | `Bearing zero nine zero degrees.` | `bearing 90 degrees`; `heading zero nine zero degrees`; `course east`; `east` |

## Localization impact

UI language must remain independent from learner source language.

For this pilot:

- UI locale can be `en`, `ru`, `de`, `it`, `es`, `sr`, `zh` or fallback `en`;
- learner source language for these proposed items is `en`;
- learner source register is natural/ordinary/unsafe English;
- target language remains `en`;
- target register remains Sea Speak / SMCP-style controlled English.

English UI must not imply that natural English source prompts are acceptable
answers. Russian UI must not imply that this pilot belongs to the existing
Russian-source stream. Future implementation needs explicit stream selection or
Director-approved defaulting rules.

## Риски

Риски content:

- fluent ordinary English may look correct to English-native learners while
  changing maritime meaning;
- source prompt text must not be copied into `accepted_answers`;
- `repeat`, `yes`, `no`, `got it`, `copy`, `left`, `right`, `rope`, `bumper`,
  `dock`, `pier`, `slip`, `poor visibility`, and numeric shorthand must remain
  item-specific rejects unless Sea Speak Linguist explicitly approves a target
  variant;
- numbers, channels, headings, bearings, ETA, distance units, port/starboard,
  over/out, read back/say again, and berth/birth require strict QA coverage.

Риски implementation:

- current playable corpus is `ru -> en`; this report must not be merged into
  `starter.json` or batch JSON without a Director implementation contract;
- metadata fields such as `source_register`, `target_register`, and
  `learner_stream` are still not approved production schema;
- matcher must not globally add natural English synonyms for English-native
  learners.

## Handoff

Sea Speak Linguist:

- проверить каждую target phrase на Sea Speak / SMCP-style приемлемость;
- решить, нужны ли item-local accepted variants для отдельных targets;
- подтвердить все must-reject examples, особенно `repeat`, `roger/affirmative`,
  `berth/birth`, `line/rope`, `fender/bumper` и heading/course/bearing.

QA:

- проектировать future fixture matrix только после Director approval;
- включить минимум один natural-prompt-as-answer reject для каждого item;
- покрыть dangerous pairs и numeric changes для channels, headings, bearings,
  ETA, distance и units;
- проверить, что UI locale не переключает learner stream или target language.

Director Engineer:

- решить, живут ли English-native items в отдельных batches/modules или как
  alternate source-prompt layer;
- утвердить metadata contract до implementation;
- определить доступность: internal-only, hidden QA или public MVP;
- готовить implementation plan только после Linguist и QA gates.

## Copy-ready handoff для Director Ether

Status: PASS FOR DRAFT, report-only. Batch 006 English-native pilot предложен
как 40 items: 15 `core_radio`, 10 `marina_harbour`, 10
`navigation_reports`, 5 embedded minimal-pair review items. Модель:
`natural English -> Sea Speak`, не UI translation и не accepted-answer
expansion.

Director decision required before implementation: утвердить stream model,
metadata fields, storage shape, QA fixture shape и release visibility.
Запрещенные зоны не тронуты: runtime/API/UI/playable data, `starter.json`,
batches, matcher, router, registry, auth/platform, Watch Officer, Nav Desk,
production config, deploy/FTP, secrets, cookies, sessions, CSRF, player email
и player identity.

Следующий маршрут: Sea Speak Linguist review targets и must-reject examples,
затем QA fixture design, затем Director Engineer implementation contract.

## Измененные файлы

- `content/captain-ether/roles/content-producer/reports/english-native-batch-006-pilot-draft-2026-05-27.md`

Другие файлы намеренно не изменялись.

## Проверка

Runtime-тесты не запускались; это report-only content draft.
