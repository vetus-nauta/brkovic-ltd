# Sea Speak Linguist Report: Batch 006 English-Native Sea Speak Pilot

Дата: 2026-05-27
Роль: Sea Speak Linguist / Captain Ether
Режим: report-only review после Director decision и Content Producer draft

## Status

PASS.

Actual Batch 006 JSON лингвистически готов для следующего Director/QA gate в
статусе `draft_internal`. Новых target, `accepted_answers`, reject или removal
правок не требуется.

Ранее принятые Director правки проверены в actual JSON:

- `EN-B006-MAR-009`: reject содержит точное `enter harbour`.
- `EN-B006-MAR-010`: target содержит `I am departing berth now.`
- `EN-B006-NAV-005`: target содержит `My course is to waypoint Alpha.`
- `EN-B006-NAV-005`: reject содержит `my course is to waypoint Bravo`.
- `EN-B006-NAV-007`: reject содержит `two cables north of your position`.
- `EN-B006-REV-001` to `EN-B006-REV-005` отсутствуют в playable pilot batch.

## Scope / Changed Files

Изменен только разрешенный файл:

- `content/captain-ether/roles/sea-speak-linguist/reports/batch-006-english-native-seaspeak-pilot-linguist-review-2026-05-27.md`

Не изменялись batch JSON, `starter.json`, `accept-reject-qa-pairs.json`,
runtime/API/UI, matcher, router, registry, auth/platform, Watch Officer,
Nav Desk, production config, deploy/FTP, private config, sessions, CSRF,
cookies, player email, player identity или secrets.

## Batch Checks

Проверено:

- JSON валиден: `jq empty` passed.
- Item count: `35`.
- Batch status: `draft_internal`.
- Branch counts: `core_radio=15`, `marina_harbour=10`,
  `navigation_reports=10`.
- `REV-*` item count: `0`.
- Все items используют `learner_stream=english_native`,
  `source_language=en`, `target_language=en`,
  `target_register=sea_speak_smcp`.
- Все `source_register` values входят в Director-approved set:
  `ordinary_english`, `unsafe_natural_english`,
  `natural_maritime_english`.
- Required item fields и required `qa_notes` fields присутствуют у всех 35
  items.
- Каждый canonical `target_text` присутствует в `accepted_answers`.
- Каждый canonical `target_text` присутствует в `qa_notes.should_accept`.
- Все 35 `source_text` присутствуют в `qa_notes.should_reject` как
  natural-prompt-as-answer rejects.

## Source Text Accepted-Answer Check

Confirmed: `source_text` is not an accepted answer for any of the 35 items.

Все `accepted_answers` остаются canonical-only: по одному approved Sea Speak /
SMCP-style answer на item. Это безопасно для первого English-native pilot:
case, punctuation, spacing и small spelling tolerance должны оставаться задачей
conservative matcher/normalization layer, а не расширением ordinary English
paraphrases в batch JSON.

## Item Review

| Item ID | Decision | Target text | Proposed text changes |
| --- | --- | --- | --- |
| `EN-B006-CORE-001` | approved | `Say again.` | None |
| `EN-B006-CORE-002` | approved | `Say again your position.` | None |
| `EN-B006-CORE-003` | approved | `Roger.` | None |
| `EN-B006-CORE-004` | approved | `Affirmative.` | None |
| `EN-B006-CORE-005` | approved | `Negative.` | None |
| `EN-B006-CORE-006` | approved | `Over.` | None |
| `EN-B006-CORE-007` | approved | `Out.` | None |
| `EN-B006-CORE-008` | approved | `Stand by.` | None |
| `EN-B006-CORE-009` | approved | `Wait out.` | None |
| `EN-B006-CORE-010` | approved | `Go ahead.` | None |
| `EN-B006-CORE-011` | approved | `Read back channel one two.` | None |
| `EN-B006-CORE-012` | approved | `Switch to channel one two.` | None |
| `EN-B006-CORE-013` | approved | `Request permission to enter.` | None |
| `EN-B006-CORE-014` | approved | `Question. What is your ETA?` | None |
| `EN-B006-CORE-015` | approved | `Correction. Channel one two.` | None |
| `EN-B006-MAR-001` | approved | `Request berth for tonight.` | None |
| `EN-B006-MAR-002` | approved | `Request berth Bravo one two.` | None |
| `EN-B006-MAR-003` | approved | `Request fuel.` | None |
| `EN-B006-MAR-004` | approved | `Request fresh water.` | None |
| `EN-B006-MAR-005` | approved | `Request shore power.` | None |
| `EN-B006-MAR-006` | approved | `Prepare fenders.` | None |
| `EN-B006-MAR-007` | approved | `Prepare lines.` | None |
| `EN-B006-MAR-008` | approved | `Stand by outside the marina.` | None |
| `EN-B006-MAR-009` | approved | `Proceed into harbour.` | None |
| `EN-B006-MAR-010` | approved | `I am departing berth now.` | None |
| `EN-B006-NAV-001` | approved | `I am altering course to starboard.` | None |
| `EN-B006-NAV-002` | approved | `I am altering course to port.` | None |
| `EN-B006-NAV-003` | approved | `My position is north of the marina.` | None |
| `EN-B006-NAV-004` | approved | `My heading is zero nine zero degrees.` | None |
| `EN-B006-NAV-005` | approved | `My course is to waypoint Alpha.` | None |
| `EN-B006-NAV-006` | approved | `My speed is six knots.` | None |
| `EN-B006-NAV-007` | approved | `Buoy two cables north of my position.` | None |
| `EN-B006-NAV-008` | approved | `ETA harbour one four zero zero UTC.` | None |
| `EN-B006-NAV-009` | approved | `Read back heading zero nine zero degrees.` | None |
| `EN-B006-NAV-010` | approved | `I passed astern of your vessel.` | None |

Decision totals:

- approved: `35`
- needs target revision: `0`
- needs accepted_answers revision: `0`
- needs reject revision: `0`
- remove from pilot: `0`

Exact proposed text changes: none.

## Accepted Answers Decision

Approved accepted-answer model for this actual batch:

- keep one canonical accepted answer per item, equal to `target_text`;
- do not add ordinary English source prompts to `accepted_answers`;
- do not add broad natural-English synonyms such as `repeat`, `yes`, `no`,
  `copy`, `got it`, `wait`, `hold on`, `turn right`, `turn left`, `rope`,
  `bumper`, `dock`, `pier`, or `slip`;
- let QA exercise punctuation/capitalization/spacing normalization separately
  from semantic synonym expansion.

No item needs accepted-answer expansion before QA fixture planning.

## Must-Stay-Wrong / Reject Review

Approved `qa_notes.should_reject` direction:

- all 35 source prompts are rejected as answers;
- item-local ordinary English paraphrases remain wrong when they replace the
  trained Sea Speak target;
- dangerous value changes remain wrong: channel, heading, ETA, unit, direction,
  reference point, service type, and marker changes;
- previous Director reject revisions are correctly represented in actual JSON.

No item needs reject revision.

## Dangerous-Pair And Matcher Risks

Dangerous pairs present in this actual batch are appropriate for QA:

- `say again` / `repeat`
- `say again position` / `read back position`
- `roger` / `affirmative` / `correct` / `yes`
- `affirmative` / `negative`
- `negative` / `no` / `wrong`
- `over` / `out` / `over and out`
- `stand by` / `wait out` / `wait` / `do not answer`
- `go ahead` / `proceed` / `enter` / `over`
- `read back` / `say again`
- `channel one two` / `channel one three` / `channel one six`
- `Question`, `Request`, `Answer`, and `Correction` marker boundaries
- `berth` / `birth` / `dock` / `pier` / `slip`
- `Bravo one two` / `B12`
- `fuel` / `fresh water` / `shore power`
- `fender` / `bumper` / `finder`
- `line` / `rope`
- `port` / `starboard` / `left` / `right`
- `position` / `course`
- `heading` / `course` / `bearing`
- `zero nine zero` / `90`
- `waypoint Alpha` / `waypoint Bravo`
- `knots` / `nautical miles` / `cables`
- `north` / `south`
- `my position` / `your position`
- `1400` / `1500`
- `UTC` / `local`
- `harbour` / `marina`
- `astern` / `ahead` / `abeam` / `behind`

Matcher risks to preserve:

- no global aliases for ordinary English prompts;
- no fuzzy matching for numeric tokens, channel numbers, headings, ETA digits,
  UTC/local markers, distance units, directions, sides, waypoint names, berth
  IDs, or short nautical terms;
- no typo acceptance of `birth` for `berth` or `finder` for `fender`;
- no collapse of `right/left` into `starboard/port`;
- no collapse of `repeat` into `say again`;
- no collapse of `roger`, `affirmative`, `correct`, `yes`, `copy`, and
  `got it`;
- no acceptance of an answer that contains the correct phrase plus a dangerous
  extra phrase, for example `say again please repeat` for a `Say again.`
  target;
- marker words in marker drills must remain semantically required even if
  punctuation is forgiving.

No matcher/API change is requested by this linguist review. These are QA and
Director-Engineer guardrails for future integration.

## QA Fixture Matrix Readiness

QA can build a fixture matrix from this actual batch now.

Minimum matrix from this JSON:

- `35` canonical target accepts from `target_text`;
- normalization accepts for capitalization, punctuation, and spacing, at least
  two per item if QA follows Director's `70` normalization direction;
- `35` natural-prompt-as-answer rejects from `source_text`;
- all item-local `qa_notes.should_reject` rejects;
- dangerous minimal-pair rejects from `qa_notes.dangerous_minimal_pairs`;
- metadata checks for `learner_stream=english_native`,
  `source_language=en`, `target_language=en`,
  `target_register=sea_speak_smcp`;
- route/locale checks confirming English UI fallback does not auto-select this
  learner stream.

QA should not include `REV-*` items in first-pilot fixture rows because they are
not present in actual Batch 006 JSON.

## Localization Impact

Localization impact is controlled but must stay explicit:

- learner source language for this batch is English: `source_language=en`;
- target language is English Sea Speak / SMCP-style phraseology:
  `target_language=en`, `target_register=sea_speak_smcp`;
- UI locale and learner stream must remain separate product axes;
- unsupported UI locale fallback to English UI must not select
  `english_native` stream automatically;
- source prompt localization must not translate or soften Sea Speak target
  meaning;
- English UI copy must avoid implying that ordinary English source prompts are
  acceptable submitted answers;
- no new player-facing UI strings or i18n keys are introduced by this
  report-only review.

## Copy-Ready Handoff For Director Ether

Sea Speak Linguist PASS for actual
`content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`.
All 35 items are approved. No target, accepted_answers, reject, or removal
changes are proposed. Confirmed: `source_text` is not in `accepted_answers` for
any item, canonical `target_text` is accepted for every item, and `REV-*` items
are absent. QA can build the fixture matrix from this actual batch: 35
canonical accepts, normalization accepts, 35 source-prompt rejects,
item-local rejects, dangerous-pair rejects, plus locale/learner-stream
separation checks. No matcher/API/UI/runtime/deploy change is requested.

