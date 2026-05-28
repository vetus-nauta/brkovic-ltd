# QA Report: English-Native Hidden Stream Integration Contract Review

Дата: 2026-05-27
Роль: QA / Captain Ether
Режим: report-only QA review перед runtime implementation

## Status

NEEDS DIRECTOR DECISION.

Контракт в основном тестируемый и достаточно конкретный для hidden/internal
API-first реализации, но перед назначением runtime implementation нужно
зафиксировать два QA-значимых решения:

- `answer-log.php` default без `learner_stream`: контракт говорит, что omitted
  stream "may return all streams for admin", тогда как остальные read endpoints
  default to `ru_source`; для smoke это должно быть не `may`, а один
  ожидаемый результат.
- `player_hash` в admin answer-log payload: текущий answer-log использует
  pseudonymous player hash. Контракт требует identity-free payload и запрещает
  player identity/session leakage, но не говорит явно, допустим ли `player_hash`
  как admin-only QA correlation field.

FAIL: нет.

## Scope And Files Read

Проверка выполнена в report-only режиме. Runtime/API/UI/tools/content data не
менялись.

Прочитаны назначенные role/protocol/policy/report files, Batch 006 acceptance,
Batch 006 QA matrix, Localization Architect stream policy, а также read-only
API/tool files для оценки тестируемости:

- `public/api/captain-ether/start-watch.php`
- `public/api/captain-ether/submit-answer.php`
- `public/api/captain-ether/finish-watch.php`
- `public/api/captain-ether/progress.php`
- `public/api/captain-ether/lost-oars.php`
- `public/api/captain-ether/resolve-lost-oar.php`
- `public/api/captain-ether/answer-log.php`
- `public/api/captain-ether/_answer-logging.php`
- `content/captain-ether/tools/smoke-start-watch-api.php`

Для функции storage / visible question / weak points были точечно просмотрены
релевантные helper signatures в `private/bootstrap.php`; private config,
secrets, sessions contents, cookies, CSRF values, player email values and
identity data не читались и не записывались в отчет.

## Contract Testability Before Implementation

PASS with decision notes.

Контракт тестируем до implementation как acceptance contract: есть явные
request/response expectations, default behavior, no-mutation errors, stream
source of truth, storage namespace expectations and privacy forbidden fields.

До runtime implementation фактическое поведение не должно проходить эти новые
stream cases, потому что текущий код не имеет `learner_stream`. Это не blocker:
QA может использовать контракт для будущего smoke fixture и ожидать FAIL до
implementation / PASS после implementation.

Требуется Director decision по двум нестрогим пунктам выше, иначе future smoke
будет иметь неоднозначные expected values.

## Default `ru_source` Coverage

PASS.

Контракт достаточно покрывает legacy default:

- missing `learner_stream` means `ru_source`;
- текущий Captain Ether route остается `ru_source`;
- `locale === "en"` не выбирает `english_native`;
- unsupported locale fallback to English UI не выбирает `english_native`;
- `progress`, `lost-oars`, `resolve-lost-oar` default to `ru_source`;
- legacy storage `progress` / `weak_points` сохраняется как `ru_source`;
- direct watch APIs derive stream from stored watch after start.

Decision note: для `answer-log.php` omitted stream должен быть выбран явно:
либо legacy-style `ru_source`, либо admin-only `all`. Оба варианта тестируемы,
но текущая формулировка "may return all streams" недостаточно строгая для QA.

## English-Native Admin/Internal Gate Coverage

PASS with one required smoke addition.

Контракт правильно требует:

- explicit `learner_stream: "english_native"` only on `start-watch`;
- existing `admin` role as internal gate without auth/platform changes;
- non-internal request returns `403 learner_stream_unavailable`;
- rejected request has no storage mutation;
- UI hidden flag sends stream only when `state.user.role === "admin"`;
- direct API smoke may post stream for admin.

Missing smoke detail: future API smoke must seed both `admin` and `player`
fixtures, or support role override, so `403` is actually proven. Current
`smoke-start-watch-api.php` seeds only an admin user.

## Storage / Progress / Lost Oars / Answer-Log Stream Scoping

PASS.

Контракт testable:

- watch session stores `learner_stream` at creation;
- `submit-answer` and `finish-watch` use stored watch stream, not client input;
- wrong/hint/skip creates weak point only in active stream;
- clean/spelling resolves weak point only in active stream;
- `progress.php?learner_stream=english_native` reports only that stream;
- `lost-oars.php?learner_stream=english_native` lists only that stream;
- `resolve-lost-oar.php` lookup/resolution is stream-scoped;
- finish history is written under active stream only;
- answer-log entries include `learner_stream`;
- answer-log grouping key includes `stream + item_id`.

Current implementation confirms why this is necessary: existing `progress`,
`weak_points`, item lookup and answer-log grouping are global per user/item and
would mix streams without the proposed storage scope.

## Privacy / Session Payload Checks

NEEDS DIRECTOR DECISION.

Sufficiently covered:

- no stream state in cookies;
- no stream state in CSRF;
- client-provided stream cannot override stored watch stream after start;
- no `accepted_answers`, `qa_notes`, internal reject reasons, token, CSRF,
  cookies, session id, login code, email or raw user id in player payloads;
- rejected invalid/forbidden stream requests must be mutation-free and generic.

Decision needed:

- decide whether admin answer-log may continue exposing `player_hash`, or
  whether stream implementation must remove/suppress it to satisfy
  "identity-free" strictly.
- once decided, add `player_hash` either to the allowed admin-only fields list
  or to the smoke forbidden-key list.

QA recommendation: player-facing payloads must never include `player_hash`.
For admin answer-log, Director should explicitly choose policy before
implementation, because current logs already contain that key.

## Missing QA Cases Or Blockers

Blockers:

- No FAIL blocker.
- Director decision required for `answer-log` omitted-stream behavior.
- Director decision required for `player_hash` policy in admin answer-log.

Missing QA cases to add to future smoke:

- seed non-admin player and verify `english_native` start returns `403` with no
  mutation;
- verify invalid stream returns `400 invalid_learner_stream` with no mutation;
- verify client-supplied stream on `submit-answer` / `finish-watch` is ignored;
- verify `watch_sessions` stores `learner_stream` and no cookie/CSRF value
  stores stream;
- verify `answer-log` default behavior exactly as Director decides;
- verify `answer-log` review grouping does not merge same `item_id` across
  streams;
- verify `player_hash` expectation exactly as Director decides;
- verify hidden UI flag is ignored for non-admin and unsupported locale fallback
  does not send `english_native`;
- verify Batch 006 source prompt rejects and dangerous natural-English rejects
  remain wrong in runtime.

## Exact Recommended Future Smoke Matrix

Environment gates:

1. `php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`
2. `php content/captain-ether/tools/smoke-start-watch-api.php`

Baseline / default:

1. `POST start-watch { "level": "beginner" }` returns `watch.learner_stream = "ru_source"`, total `12`, only legacy starter item IDs.
2. Same for `intermediate` total `16` and `advanced` total `20`.
3. `locale=en-US` UI smoke does not send `english_native`.
4. unsupported `fr-FR -> en` UI smoke does not send `english_native`.
5. Existing RU-source progress and Lost Oars remain visible through omitted-stream endpoints.

Stream validation / gate:

1. `learner_stream="bad"` returns `400 invalid_learner_stream`; storage counts unchanged.
2. non-admin `learner_stream="english_native"` returns `403 learner_stream_unavailable`; storage counts unchanged.
3. admin `learner_stream="english_native"` starts watch successfully.
4. hidden `?ce_stream=english_native` is ignored for non-admin UI session.
5. hidden `?ce_stream=english_native` sends stream only for admin UI session.

English-native content selection:

1. beginner English-native watch selects only Batch 006 `english_native` items.
2. intermediate English-native watch selects only Batch 006 `english_native` items.
3. advanced English-native watch is allowed only as internal coverage/review and selects no `REV-*` items.
4. focused branch unsupported pool returns `branch_watch_unavailable` without mutation.
5. response current/next question contains no `accepted_answers`, `qa_notes`, branch/module internals, raw user id, email, token, CSRF, cookie or session id.

Answer behavior:

1. Canonical accept: `EN-B006-CORE-001` answer `Say again.` passes.
2. Source prompt reject: `What did you say?` remains wrong.
3. Dangerous rejects remain wrong where covered: `repeat`, `yes`, `no`, `left`, `right`, `dock`, `rope`, `bumper`.
4. `submit-answer` with extra client `learner_stream` opposite to stored watch does not switch lookup or storage scope.
5. Wrong English-native answer creates English-native Lost Oar only.
6. Clean/spelling English-native answer resolves English-native Lost Oar only.

Progress / Lost Oars / finish:

1. RU-source wrong answer does not appear in `lost-oars.php?learner_stream=english_native`.
2. English-native wrong answer does not appear in omitted `lost-oars.php` legacy `ru_source`.
3. `resolve-lost-oar.php` omitted stream resolves only `ru_source`.
4. `resolve-lost-oar.php` with `english_native` resolves only English-native.
5. `finish-watch` writes history with `learner_stream` under active stream only.
6. `progress.php` omitted stream returns legacy `ru_source`.
7. `progress.php?learner_stream=english_native` returns English-native history and Lost Oars only.

Answer-log:

1. English-native wrong/hint/skip/spelling events include `learner_stream`.
2. `answer-log.php?learner_stream=english_native` returns only English-native entries/groups.
3. same `item_id` in different streams is grouped separately by `stream + item_id`.
4. omitted `learner_stream` behavior matches Director decision exactly.
5. payload privacy forbids `accepted_answers`, `qa_notes`, raw user id, email, token, CSRF, cookie, session id, login code, private config values and secrets.
6. `player_hash` is either explicitly allowed for admin answer-log or explicitly forbidden, per Director decision.

Storage restore / mutation safety:

1. Smoke tool backs up and restores all touched storage names, including new stream progress/weak-point namespaces.
2. Rejected invalid/forbidden stream requests leave `watch_sessions`, legacy `progress`, legacy `weak_points`, stream progress, stream weak points and `captain_answer_logs` unchanged.
3. No stream value is written to session records, CSRF records or cookie payloads.

## May Implementation Be Assigned After Director Acceptance?

Yes, after Director accepts this QA review and resolves the two decision notes.

Implementation may be assigned to Director Engineer for the scoped hidden/internal
stream support only. QA does not approve public selector, playable merge,
production deploy, router/registry changes, Watch Officer/Nav Desk coupling,
auth/platform changes, matcher expansion or `starter.json` merge.

## Copy-Ready Handoff For Director Ether

NEEDS DIRECTOR DECISION: QA accepts the hidden/internal English-native stream
contract as testable for next implementation, but asks Director to pin two
expected behaviors before runtime work: `answer-log.php` omitted stream must be
either `ru_source` or admin-only `all`, and `player_hash` must be explicitly
allowed or forbidden in admin answer-log payloads.

After those choices, implementation may proceed as hidden/admin API-first work:
default remains `ru_source`, UI locale never selects `english_native`, Batch 006
stays separate from `starter.json`, stream is stored on watch sessions, and
progress / Lost Oars / answer-log must be stream-scoped with mutation-free
errors and strict privacy checks.

## Changed Files

- `content/captain-ether/roles/qa/reports/english-native-hidden-stream-integration-contract-qa-review-2026-05-27.md`
