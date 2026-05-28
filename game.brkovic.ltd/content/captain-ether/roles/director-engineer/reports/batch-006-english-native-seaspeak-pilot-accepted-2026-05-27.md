# Director Engineer Report: Batch 006 English-Native Sea Speak Pilot Accepted

Дата: 2026-05-27
Роль: Director Engineer / Captain Ether
Режим: acceptance

## Решение

Status: PASS FOR HIDDEN INTEGRATION CONTRACT.

Фактический Batch 006 English-native Sea Speak pilot принят как internal draft
content после Sea Speak Linguist PASS и QA PASS.

Это acceptance не является playable merge, public UI approval, production
deploy, router/registry change или auth/platform change.

## Принятый Batch

Принят файл:

- `content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`

Batch status:

```json
"draft_internal"
```

Состав:

- total items: `35`;
- `core_radio`: `15`;
- `marina_harbour`: `10`;
- `navigation_reports`: `10`;
- `REV-*`: `0`;
- levels: beginner/intermediate only;
- `learner_stream`: `english_native`;
- `source_language`: `en`;
- `target_language`: `en`;
- `target_register`: `sea_speak_smcp`.

## Принятые Gate Reports

Content Producer:

- `content/captain-ether/roles/content-producer/reports/batch-006-english-native-seaspeak-pilot-card-2026-05-27.md`

Sea Speak Linguist:

- `content/captain-ether/roles/sea-speak-linguist/reports/batch-006-english-native-seaspeak-pilot-linguist-review-2026-05-27.md`

QA:

- `content/captain-ether/roles/qa/reports/batch-006-english-native-seaspeak-pilot-qa-matrix-2026-05-27.md`

## Sea Speak Linguist Acceptance

Sea Speak Linguist status: PASS.

Accepted findings:

- all 35 items approved;
- no target revision required;
- no `accepted_answers` revision required;
- no reject revision required;
- no item removal required;
- `source_text` is not accepted answer for any item;
- canonical-only accepted-answer model is approved for first pilot.

## QA Acceptance

QA status: PASS.

Actual fixture-readiness counts:

- canonical accepts: `35`;
- normalization accepts: `70`;
- `qa_notes.should_accept` rows total: `105`;
- natural-prompt-as-answer rejects: `35`;
- `qa_notes.should_reject` rows total: `167`;
- total minimum assertions: `272`;
- dangerous-pair coverage: `64` occurrences / `59` unique groups;
- missing required fields: `0`;
- duplicate IDs: `0`;
- `source_text` inside `accepted_answers`: `0`.

QA confirmed actual Batch 006 JSON is fixture-ready for a future
Director-approved fixture/materialization task.

## Accepted Runtime Guardrails

Future integration must preserve:

- current Captain Ether route default remains `ru_source`;
- `locale === "en"` must not auto-select `english_native`;
- unsupported system language fallback to English UI must not change learner
  stream;
- stream choice must be explicit internal selector, dedicated hidden route, or
  feature flag;
- progress, Lost Oars, answer-log and finish-watch must be stream-scoped;
- public payload must not expose `accepted_answers`, internal reject reasons,
  fixture dimensions, private identity, session values or secrets;
- source prompt must never be copied into `accepted_answers`.

## Next Sprint Decision

Open next sprint:

```text
English-native hidden/internal stream integration contract
```

Allowed next-sprint scope:

- report-only integration contract first;
- local implementation only after the contract identifies exact files and QA
  gates;
- no production deploy;
- no public selector yet;
- no merge into `starter.json` unless a separate Director task explicitly
  approves it.

Expected next roles:

1. Director Engineer: inspect current start-watch/progress/storage flow and
   write hidden integration contract.
2. QA: review integration contract before runtime edits if API/session shape
   changes.
3. Director Engineer: implement hidden/internal stream support only after the
   contract is accepted.
4. QA: run local smoke and stream-separation checks.

## Scope Preserved

- `starter.json` not changed by this acceptance.
- Runtime/API not changed by this acceptance.
- UI not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer and Nav Desk not changed.
- production config and deploy/FTP not touched.
- private config, sessions, CSRF, cookies, player email, player identity and
  secrets not touched.

## Copy-Ready Handoff For Director Ether

Batch 006 English-native internal draft is accepted as PASS for hidden
integration contract. Sea Speak Linguist approved all 35 items. QA marked the
actual JSON fixture-ready with 272 minimum assertions and no source prompt in
accepted answers.

Next sprint approved: hidden/internal stream integration contract. Keep current
route as `ru_source`; do not auto-select English-native by UI locale; do not
deploy; do not public-release selector yet.
