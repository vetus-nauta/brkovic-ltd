# QA Report: Batch 006 English-Native Sea Speak Pilot Fixture Matrix

Дата: 2026-05-27
Роль: QA / Captain Ether
Режим: report-only actual JSON QA fixture/matrix review после Sea Speak Linguist PASS

## Status

PASS.

Actual Batch 006 JSON fixture-ready для следующего Director-Engineer
acceptance gate. Матрица может быть построена из actual JSON без content-side
правок.

Это не является playable merge, production deploy, runtime/API/UI, matcher,
router, registry, auth/platform или Watch Officer/Nav Desk approval.

## Target

Проверенный batch:

```text
content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json
```

Batch status:

```json
"draft_internal"
```

Playable integration не выполнена. `starter.json` не проверялся как изменяемый
target и не менялся.

## Exact QA Matrix Counts From Actual JSON

Метод счета:

- canonical accepts: `target_text` присутствует в `accepted_answers`;
- normalization accepts: строки `qa_notes.should_accept`, кроме точного
  canonical `target_text`;
- natural-prompt-as-answer rejects: `source_text` присутствует в
  `qa_notes.should_reject`;
- should_reject rows: все строки `qa_notes.should_reject`;
- total minimum assertions: все `qa_notes.should_accept` плюс все
  `qa_notes.should_reject`.

| Matrix block | Count | QA result |
| --- | ---: | --- |
| Items | 35 | PASS |
| Canonical accepts | 35 | PASS |
| Normalization accepts | 70 | PASS |
| `qa_notes.should_accept` rows total | 105 | PASS |
| Natural-prompt-as-answer rejects | 35 | PASS |
| `qa_notes.should_reject` rows total | 167 | PASS |
| Total minimum assertions | 272 | PASS |
| `source_text` inside `accepted_answers` | 0 | PASS |
| Missing required item or `qa_notes` fields | 0 | PASS |

Important counting note: the 35 natural-prompt-as-answer rejects are included
inside the 167 `should_reject` rows. The minimum assertion total is therefore
`105 + 167 = 272`, not `105 + 167 + 35`.

## Metadata Checks

PASS.

| Field / property | Actual result |
| --- | --- |
| Item count | 35 |
| Duplicate IDs | 0 |
| `learner_stream` | all `english_native` |
| `source_language` | all `en` |
| `target_language` | all `en` |
| `target_register` | all `sea_speak_smcp` |
| Allowed `source_register` values only | PASS |
| `REV-*` items present | 0 |

Branch counts:

| Branch | Count |
| --- | ---: |
| `core_radio` | 15 |
| `marina_harbour` | 10 |
| `navigation_reports` | 10 |

Source register counts:

| Source register | Count |
| --- | ---: |
| `ordinary_english` | 19 |
| `unsafe_natural_english` | 10 |
| `natural_maritime_english` | 6 |

## Dangerous-Pair Coverage By Group

PASS.

Actual JSON contains 64 dangerous-pair occurrences across 59 unique group
labels.

| Branch group | Occurrences | Unique group labels | QA result |
| --- | ---: | ---: | --- |
| `core_radio` | 19 | 18 | PASS |
| `marina_harbour` | 19 | 19 | PASS |
| `navigation_reports` | 26 | 23 | PASS |
| Total | 64 | 59 | PASS |

### `core_radio`

- `Question / Request / Answer markers` - 1
- `Question marker present / no marker` - 1
- `Request / Question / Answer markers` - 1
- `affirmative / roger / correct / yes` - 1
- `channel one two / channel one three` - 2
- `channel one two / channel one three / channel one six` - 1
- `correction marker present / no marker` - 1
- `go ahead / proceed / enter / over` - 1
- `negative / affirmative / no / wrong` - 1
- `out / over / over and out` - 1
- `over / out / over and out` - 1
- `read back / say again` - 1
- `roger / affirmative / correct / yes` - 1
- `say again / repeat` - 1
- `say again position / read back position` - 1
- `stand by / wait out / wait / do not answer` - 1
- `wait out / stand by / out` - 1
- `your position / my position` - 1

### `marina_harbour`

- `Bravo one two / B12` - 1
- `berth / birth` - 1
- `berth / birth / dock` - 1
- `berth / birth / dock / pier / slip` - 1
- `departure / arrival` - 1
- `fender / bumper / finder` - 1
- `fenders / lines` - 1
- `fresh water / fuel / shore power` - 1
- `fuel / fresh water / shore power` - 1
- `into harbour / out of harbour` - 1
- `line / rope` - 1
- `lines / fenders` - 1
- `outside / enter` - 1
- `proceed / enter / approach / go ahead` - 1
- `request berth / need a berth` - 1
- `request fuel / need fuel` - 1
- `shore power / fuel / fresh water` - 1
- `shore power / power` - 1
- `stand by outside / wait out / do not answer` - 1

### `navigation_reports`

- `1400 / 1500` - 1
- `UTC / local` - 1
- `altering course / berthing side` - 2
- `astern / ahead / abeam` - 1
- `astern / behind` - 1
- `cables / nautical miles` - 1
- `course / heading / bearing` - 1
- `east / zero nine zero` - 1
- `harbour / marina` - 1
- `heading / bearing` - 1
- `heading / course / bearing` - 1
- `knots / nautical miles / cables` - 1
- `left / port` - 1
- `my position / your position` - 1
- `north / south` - 2
- `port / starboard` - 1
- `position / course` - 1
- `read back / say again` - 1
- `right / starboard` - 1
- `speed / distance` - 1
- `starboard / port` - 1
- `waypoint Alpha / waypoint Bravo` - 1
- `zero nine zero / 90` - 2

## Fixture Readiness

PASS.

Actual batch is ready to seed a QA fixture/matrix with:

- 35 canonical target accepts;
- 70 normalization accepts from case/punctuation rows;
- 167 reject rows, including 35 natural source prompts as answers;
- dangerous-pair rejects by branch group;
- metadata assertions for English-native stream separation.

No blocker was found in the actual JSON for fixture construction.

## Missing Cases Or Blockers

No blocker for fixture readiness.

No missing required field, duplicate ID, missing canonical target, accepted
source prompt, missing source-prompt reject, or invalid approved metadata value
was found.

QA follow-up should be assigned separately if Director-Engineer wants the matrix
materialized into `accept-reject-qa-pairs.json` or a runtime smoke fixture,
because this task's allowed file is report-only and does not allow edits to
fixture JSON, matcher, API, starter content, or runtime files.

## Future Runtime Integration Risks

These are not blockers for this QA matrix report, but must be covered before
playable integration.

Localization:

- UI locale and learner stream must remain separate axes.
- `locale === "en"` must not auto-select `english_native`.
- Unsupported locale fallback to English UI must not change learner stream.
- Source prompt localization must not translate or soften the Sea Speak target
  meaning.
- English UI copy must not imply ordinary English prompts such as `Yes.`,
  `No.`, `Turn left.`, `Turn right.`, `Tie the ropes`, or `Put out the bumpers`
  are accepted answers.

Session:

- Future stream selection must be stored explicitly and must not be inferred
  from UI locale, browser language, or existing session language.
- Existing RU-source Captain Ether sessions must not be silently migrated into
  the English-native stream.
- API payloads must not expose internal branch/module/session implementation
  details as player-facing copy.

Privacy:

- No player email, player identity, cookies, CSRF, session values, login codes,
  private config, SMTP data, tokens, or secrets should be added to QA reports,
  logs, fixture output, or player payloads.
- Wrong-answer logs for English-native prompts must avoid storing account
  identifiers in content QA artifacts.

Progress:

- Progress, mastery, Lost Oars, review queues, and finish summaries must be
  stream-scoped.
- Existing RU-source progress must not be mixed with English-native progress.
- If the future selector allows stream changes, progress display must make the
  active stream deterministic without exposing internal IDs to the player.

Lost Oars:

- Natural English source prompts submitted as answers should remain wrong and
  may create Lost Oars only under the same rules as other wrong answers.
- Lost Oars copy must reinforce the Sea Speak target form, not teach that the
  ordinary source prompt is a near-miss accepted variant.
- Dangerous minimal pairs must not be accepted through Lost Oars resolution or
  spelling tolerance.

Finish-watch:

- Finish-watch summaries must report English-native results without merging
  them into legacy RU-source watch history.
- Summary payloads must not leak raw internal reason codes, batch internals, or
  private identity/session data.
- Future watch length/order checks should confirm the internal pilot remains
  hidden until a separate release decision.

## Owner Route

- QA matrix report: PASS, QA complete for this assigned file.
- Content changes: none requested.
- Linguistic changes: none requested; Sea Speak Linguist PASS stands.
- Runtime/API/UI/matcher integration: Director-Engineer only.
- Playable merge, production deploy, auth/platform, router/registry, Watch
  Officer, Nav Desk: out of scope for this QA task.

## May Director Engineer Assign Integration Contract?

Yes, after Director-Engineer accepts this QA report.

Recommended next contract should be explicit and separate, for example:

- whether to materialize Batch 006 assertions into
  `accept-reject-qa-pairs.json` or a separate hidden fixture;
- how `english_native` stream is selected and session-scoped;
- how starter/playable content is integrated while keeping the current
  `ru_source` route behavior stable;
- which local validation and smoke commands are mandatory before any production
  gate.

## Verification Performed

Commands/checks performed locally:

- JSON parse via `jq empty`: PASS.
- Python JSON matrix count over actual batch file: PASS.
- Required item and `qa_notes` field scan: PASS.
- Metadata value scan: PASS.
- `source_text` not in `accepted_answers`: PASS.
- canonical `target_text` in `accepted_answers`: PASS.
- source prompt present in `qa_notes.should_reject`: PASS for all 35 items.

Runtime/API/UI/browser tests were not run because this task is an actual JSON
fixture/matrix review and the forbidden scope excludes runtime/API/UI/matcher
changes.

## Scope Preserved

Report-only mode confirmed.

Changed only:

```text
content/captain-ether/roles/qa/reports/batch-006-english-native-seaspeak-pilot-qa-matrix-2026-05-27.md
```

Not changed:

- batch JSON;
- `starter.json`;
- `accept-reject-qa-pairs.json`;
- runtime/API/UI;
- matcher;
- router;
- registry;
- auth/platform;
- Watch Officer;
- Nav Desk;
- production config;
- deploy/FTP;
- private config;
- sessions, CSRF, cookies;
- player email;
- player identity;
- secrets.

## Copy-Ready Handoff For Director Ether

QA PASS for actual Batch 006 JSON fixture/matrix review after Sea Speak
Linguist PASS. Actual batch is fixture-ready in `draft_internal`: 35 canonical
accepts, 70 normalization accepts, 35 natural-prompt-as-answer rejects inside
167 total `should_reject` rows, and 272 total minimum assertions. Dangerous-pair
coverage is present across `core_radio`, `marina_harbour`, and
`navigation_reports`. No JSON blocker, missing required field, accepted source
prompt, missing canonical target, or invalid metadata value was found.
Director-Engineer may assign a separate integration contract after accepting
this report; playable merge, matcher/API/UI/runtime, stream selector, session
scope, progress, Lost Oars, finish-watch, privacy, and production gates remain
separate Director-owned work.
