# Content Producer Report: Batch 006 English-Native Sea Speak Pilot

Дата: 2026-05-27
Роль: Content Producer / Captain Ether
Режим: draft content only

## Статус

PASS FOR LINGUIST REVIEW.

Создан internal draft Batch 006 JSON для English-native Sea Speak pilot по
принятому Director decision.

Batch status:

```json
"draft_internal"
```

Playable merge не выполнялся. `REV-001` to `REV-005` исключены из первого pilot
и не присутствуют в batch JSON.

## Измененные файлы

- `content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`
- `content/captain-ether/roles/content-producer/reports/batch-006-english-native-seaspeak-pilot-card-2026-05-27.md`

## Примененные Director / Linguist Decisions

- `EN-B006-MAR-009`: reject приведен к точному `enter harbour`, без editorial text.
- `EN-B006-MAR-010`: target установлен как `I am departing berth now.`
- `EN-B006-NAV-005`: target установлен как `My course is to waypoint Alpha.`
- `EN-B006-NAV-005`: reject заменен на `my course is to waypoint Bravo`.
- `EN-B006-NAV-007`: reject заменен на `two cables north of your position`.
- `EN-B006-REV-001` to `EN-B006-REV-005`: не включены.

## Metadata Contract

Каждый item содержит:

- `learner_stream`: `english_native`
- `source_language`: `en`
- `source_register`: `ordinary_english`, `unsafe_natural_english`, или `natural_maritime_english`
- `target_language`: `en`
- `target_register`: `sea_speak_smcp`

Natural English `source_text` не добавлен в `accepted_answers`. Для QA он
зафиксирован в `qa_notes.should_reject` как natural-prompt-as-answer reject.

## Counts By Branch

| Branch | Count |
| --- | ---: |
| `core_radio` | 15 |
| `marina_harbour` | 10 |
| `navigation_reports` | 10 |
| `review_minimal_pairs` | 0 |

Total: `35`.

## Counts By Module

| Module | Count |
| --- | ---: |
| `acknowledgement` | 3 |
| `approach` | 2 |
| `berth_request` | 2 |
| `clarification` | 2 |
| `departure` | 1 |
| `eta_reports` | 1 |
| `fuel_water_power` | 3 |
| `heading_course` | 4 |
| `message_markers` | 2 |
| `mooring` | 2 |
| `navigation_readback` | 1 |
| `opening_closing` | 2 |
| `position_reporting` | 2 |
| `radio_procedure` | 4 |
| `readback_correction` | 2 |
| `speed_distance` | 2 |

## Counts By Level

| Level | Count |
| --- | ---: |
| `beginner` | 19 |
| `intermediate` | 16 |
| `advanced` | 0 |

## Counts By Type

| Type | Count |
| --- | ---: |
| `phrase` | 19 |
| `short_expression` | 16 |
| `word` | 0 |

## QA Notes Coverage

Every item includes:

- `qa_notes.should_accept`
- `qa_notes.should_reject`
- `qa_notes.dangerous_minimal_pairs`
- `qa_notes.linguist_note`
- `qa_notes.localization_note`

Proposed should-accept examples are limited to canonical target, punctuation,
and capitalization normalization. No ordinary English paraphrase was added to
`accepted_answers`.

## Risks

Content risks:

- English-native learners may perceive natural prompts such as `Yes.`, `No.`,
  `What did you say?`, `Turn left.`, `Turn right`, `Tie the ropes`, or
  `Put out the bumpers` as acceptable English answers; QA must keep them wrong.
- High-risk maritime boundaries remain strict: `say again/repeat`,
  `roger/affirmative`, `over/out`, `stand by/wait out`, `go ahead/proceed`,
  `berth/birth`, `line/rope`, `fender/bumper`, `port/starboard`,
  `heading/course/bearing`, `knots/nautical miles/cables`, `UTC/local`, and
  exact channel/time/direction values.
- Numeric shorthand such as `channel 12`, `90 degrees`, `1400 local`, and wrong
  ETA/channel values must not be fuzzed by matcher behavior.

Localization risks:

- UI locale and learner stream must stay separate; `locale === en` must not
  auto-select this English-native stream.
- Unsupported UI locales may fall back to English UI, but that fallback must
  not change learner stream or accepted answer policy.
- Source and target are both English, so UI copy must avoid implying that
  ordinary English source prompts are accepted answers.

Implementation risks:

- This batch introduces English-native source metadata that is draft content
  only until Director-Engineer approves storage/playable integration.
- No matcher/API/runtime/UI behavior has been changed, so future QA fixture
  results may require Director-owned implementation work.

## Handoff For Sea Speak Linguist

- Review the actual JSON file, not only the previous planning table.
- Confirm item-local `accepted_answers` remain safe as canonical-only target
  answers.
- Re-check applied revisions for `EN-B006-MAR-009`, `EN-B006-MAR-010`,
  `EN-B006-NAV-005`, and `EN-B006-NAV-007`.
- Confirm dangerous minimal pairs and natural-prompt-as-answer rejects are
  sufficient for QA fixture design.

## Handoff For QA

- Build fixture matrix from 35 items only; do not include `REV-*` as playable
  pilot content.
- Minimum matrix: 35 canonical target accepts, punctuation/case normalization
  accepts, 35 natural-prompt-as-answer rejects, all item-local must-stay-wrong
  rejects, and dangerous minimal-pair rejects.
- Add strict checks for channels, headings, ETA, distance units, direction,
  reference point, message markers, and UI locale / learner stream separation.
- Verify source prompt is never copied into accepted answers by any future
  generation, migration, or fixture seeding step.

## Handoff For Director Ether

Batch 006 internal JSON draft is ready for Sea Speak Linguist review and QA
fixture planning. It remains hidden/internal and must not be merged into
`starter.json` without a separate Director-Engineer integration decision.

Next expected gates:

1. Sea Speak Linguist reviews the actual Batch 006 JSON.
2. QA prepares or reviews fixture matrix against the actual JSON.
3. Director-Engineer decides storage/playable integration and any matcher/API
   changes, if needed.

## Scope Preserved

Confirmed untouched by this task:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- existing batch files
- runtime/API/UI files
- matcher
- router
- registry
- auth/platform
- Watch Officer
- Nav Desk
- production config
- deploy/FTP
- private config
- sessions, CSRF, cookies
- player email, player identity
- secrets

## Verification

Performed local JSON/content checks:

- `jq empty` passed for batch JSON.
- item count is `35`.
- branch counts are `15 / 10 / 10` for CORE / MAR / NAV.
- `REV` item count is `0`.
- required item fields and required `qa_notes` fields are present for every item.
- all items use `learner_stream=english_native`, `source_language=en`,
  `target_language=en`, and `target_register=sea_speak_smcp`.
- no item has `source_text` inside `accepted_answers`.
- each item has canonical `target_text` inside `accepted_answers`.

Runtime tests were not run; this is content draft work only.
