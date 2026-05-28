# Director Engineer Report: English-Native Hidden Stream Integration Contract

Дата: 2026-05-27
Роль: Director Engineer / Captain Ether
Режим: report-only integration contract

## Status

PASS FOR NEXT-SPRINT CONTRACT.

NEEDS DIRECTOR DECISION только если next sprint хочет публичный selector,
production deploy, router/registry route, Watch Officer/Nav Desk coupling или
merge Batch 006 в `starter.json`. Для hidden/internal pilot это не требуется.

FAIL: нет.

## Current Inspection Summary

Текущая реализация не имеет `learner_stream`:

- `public/assets/app.js` отправляет `start-watch` только как
  `JSON.stringify({ level })`.
- `start-watch.php` читает общий `captain_content()` и выбирает items только по
  `level`, `mode`, `branch`.
- `watch_sessions` хранит `level`, `status`, `questions`, но не stream.
- `submit-answer.php` восстанавливает item через общий `captain_items_by_id()`.
- `finish-watch.php`, `progress.php`, `lost-oars.php`,
  `resolve-lost-oar.php` и `answer-log.php` считают progress / Lost Oars /
  logs без stream scope.
- UI locale уже отделен от content: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`
  детектируются из системы, unsupported locale падает в English UI.

Вывод: English-native pilot нельзя подключать простым добавлением Batch 006 в
общий content pool. Без stream scope он смешает RU-source progress, Lost Oars и
answer-log evidence.

## Proposed Implementation Scope

Минимальная реализация для next sprint: hidden/internal API-first stream,
без публичного selector и без изменения route/registry.

Изменить только:

- `public/api/captain-ether/start-watch.php`
- `public/api/captain-ether/submit-answer.php`
- `public/api/captain-ether/finish-watch.php`
- `public/api/captain-ether/progress.php`
- `public/api/captain-ether/lost-oars.php`
- `public/api/captain-ether/resolve-lost-oar.php`
- `public/api/captain-ether/answer-log.php`
- `public/api/captain-ether/_answer-logging.php`
- `public/api/captain-ether/_learner-streams.php` (new helper)
- `content/captain-ether/tools/smoke-start-watch-api.php`
- `content/captain-ether/tools/validate-captain-ether.php`
- `public/assets/app.js` only for hidden/internal flag plumbing, not selector

Read-only implementation input:

- `content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`

Do not change:

- runtime data files by hand;
- `starter.json`;
- batch JSON;
- matcher policy;
- router/registry;
- auth/platform;
- Watch Officer;
- Nav Desk;
- production config;
- deploy/FTP;
- private config;
- sessions, CSRF, cookies;
- player email / identity handling;
- secrets.

## Stream Selection Contract

Canonical streams:

```text
ru_source
english_native
```

Default:

- missing `learner_stream` means `ru_source`;
- existing Captain Ether route remains legacy `ru_source`;
- `locale === "en"` must never select `english_native`;
- unsupported system language fallback to English UI must never select
  `english_native`.

Hidden/internal selection:

- API accepts explicit `learner_stream: "english_native"` only on
  `start-watch`.
- Server must reject `english_native` for non-internal users with `403` and no
  storage mutation. Recommended internal gate: existing `admin` role only,
  because no auth/platform work is allowed.
- `public/assets/app.js` may read a hidden query flag such as
  `?ce_stream=english_native`, but only send it when `state.user.role ===
  "admin"`. No visible selector, no public copy, no registry route.
- Direct API smoke may post `learner_stream` without UI.
- `submit-answer` and `finish-watch` must derive stream from the stored
  `watch_id`, not from client input.
- `lost-oars`, `resolve-lost-oar`, `progress`, and `answer-log` may accept a
  query/body stream filter for internal QA, defaulting to `ru_source`.

## Batch Loading Decision

For hidden/internal pilot: load Batch 006 from its separate batch JSON.

Do not merge into `starter.json` in this sprint.

Reason:

- accepted Batch 006 status is `draft_internal`;
- public playable corpus remains RU-source legacy;
- hidden pilot needs stream isolation before public readiness;
- separate load lets QA prove stream separation without content-data churn.

Implementation rule:

- `ru_source` uses current `captain_content()` / `captain_items_by_id()`.
- `english_native` uses
  `content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`
  through `_learner-streams.php`.
- helper must validate expected `batch_id`, `status: draft_internal`, item
  `learner_stream: english_native`, `source_language: en`, `target_language:
  en`.
- helper must strip `qa_notes`, `accepted_answers`, internal notes, branch/module
  if payload is player-facing.

Later merge into `starter.json` requires a separate Director task after hidden
pilot QA acceptance.

## API Payload Contract

### `start-watch.php`

Request:

```json
{
  "level": "beginner|intermediate|advanced",
  "mode": "mixed|focused_branch|focused_module",
  "branch": "core_radio",
  "learner_stream": "ru_source|english_native"
}
```

Rules:

- `learner_stream` optional; default `ru_source`.
- `english_native` supports `mixed` first. Focused branch can be enabled only if
  the stream pool satisfies thresholds; otherwise return current style
  `branch_watch_unavailable`.
- invalid stream: `400 invalid_learner_stream`, no mutation.
- non-internal English-native request: `403 learner_stream_unavailable`, no
  mutation.
- response includes `watch.learner_stream` and sanitized current question.
- response must not expose `accepted_answers`, `qa_notes`, reject reasons,
  fixture dimensions, `user_id`, email, token, CSRF, branch/module internals.

### `submit-answer.php`

Request remains:

```json
{
  "watch_id": "watch_x",
  "index": 0,
  "answer": "Say again.",
  "used_hint": false,
  "skipped": false
}
```

Rules:

- stream comes from stored watch session.
- item lookup must use `watch.learner_stream + question.item_id`.
- wrong/skip/hint updates weak points in the same stream only.
- clean/spelling resolves weak point in the same stream only.
- `_answer_log` must include non-sensitive `learner_stream`.
- response may include `learner_stream`, but no hidden item fields.

### `finish-watch.php`

Request remains:

```json
{ "watch_id": "watch_x" }
```

Rules:

- stream comes from stored watch session.
- summary unresolved Lost Oars count is stream-scoped.
- progress history is written under that stream only.
- response summary includes `learner_stream` for QA/internal visibility.

### `progress.php`

Request:

```text
GET /api/captain-ether/progress.php
GET /api/captain-ether/progress.php?learner_stream=english_native
```

Rules:

- omitted stream returns legacy `ru_source` shape.
- response includes `progress.learner_stream`.
- `completed_watches`, `last_level`, `skip_cleanup_count`,
  `unresolved_lost_oars`, `history` are scoped to the requested stream.
- no player identity or session values.

### `lost-oars.php`

Request:

```text
GET /api/captain-ether/lost-oars.php
GET /api/captain-ether/lost-oars.php?learner_stream=english_native
```

Rules:

- omitted stream returns legacy `ru_source`.
- list only unresolved weak points from requested stream.
- each entry may include `learner_stream` for QA, plus existing prompt, target,
  hint, reason/count fields.
- no cross-stream Lost Oars.

### `resolve-lost-oar.php`

Request:

```json
{
  "item_id": "EN-B006-CORE-001",
  "answer": "Say again.",
  "learner_stream": "english_native"
}
```

Rules:

- omitted stream means `ru_source`.
- item lookup and weak-point resolution are stream-scoped.
- answer-log event includes `learner_stream`.
- response includes `remaining` for that stream only.

### `answer-log.php`

Request:

```text
GET /api/captain-ether/answer-log.php?limit=80&group_limit=16&answer_limit=5
GET /api/captain-ether/answer-log.php?learner_stream=english_native
```

Rules:

- admin-only guard remains.
- omitted `learner_stream` may return all streams for admin, but summary filters
  must report the active filter.
- entries and review groups include `learner_stream`.
- grouping key must be stream + item id, not item id alone.
- payload must stay identity-free: no email, user id, token, CSRF, cookies,
  session id, login code or private config data.

## Storage And Progress Scope

Watch sessions:

- add `learner_stream` to each watch session at creation;
- all subsequent watch APIs trust stored session stream.

Progress:

- preserve existing `progress` storage as legacy `ru_source`.
- store English-native progress separately, recommended storage namespace:
  `captain_ether_stream_progress`.
- key by `user_id -> learner_stream`.
- history entries include `watch_id`, `learner_stream`, `summary`,
  `finished_at`.

Lost Oars / weak points:

- preserve existing `weak_points` storage as legacy `ru_source`.
- store English-native weak points separately, recommended storage namespace:
  `captain_ether_stream_weak_points`.
- key by `user_id -> learner_stream -> item_id`.
- never let `ru_source` unresolved items appear in English-native review, or
  English-native natural-English mistakes appear in RU-source review.

Answer logs:

- add `learner_stream` to sanitized log entries.
- review group key must include stream.
- filters must allow QA to isolate English-native natural-English wrong answers.
- accepted answers are not expanded from logs automatically.

## Privacy And Session Constraints

- No stream state in cookies.
- No stream state in CSRF.
- No player email or identity in stream payloads, reports, logs or screenshots.
- Hidden query flag must not persist across users on shared devices unless it is
  admin-only and session-local.
- Do not write session ids, auth tokens, login codes, SMTP data, `.netrc`,
  private config values or secrets to reports or logs.
- Client-provided `learner_stream` must not override stored watch stream after a
  watch starts.
- Error payloads must stay generic and mutation-free.

## Localization Impact

Localization impact: medium.

Rules:

- UI locale and learner stream remain independent.
- supported UI locales remain `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- unsupported locale fallback remains English UI only.
- no public selector copy in this sprint.
- if hidden UI flag is used, no visible new copy is required.
- current watch instruction says "Translate into English Sea Speak"; for
  English-native hidden QA this is acceptable only as internal pilot wording.
  Before public release, UX/HUD and Localization Architect must approve stream
  wording such as "Use the Sea Speak form".
- Sea Speak/SMCP target phrases are never translated by UI localization.
- source prompt must never be copied into `accepted_answers`.

## QA Smoke Required Before Implementation Acceptance

Environment gates:

- `php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-006-english-native-seaspeak-pilot.json`
- `php content/captain-ether/tools/smoke-start-watch-api.php`

Current local shell note: PHP was not available during this report-only task
(`php: command not found`), so these checks were not run here.

Required smoke cases:

- default `start-watch` without `learner_stream` still returns `ru_source`
  behavior for beginner/intermediate/advanced.
- `locale=en-US` and unsupported `fr-FR -> en` UI do not send or select
  `english_native`.
- hidden `?ce_stream=english_native` is ignored for non-admin users.
- admin hidden flag or direct API can start `english_native`.
- invalid stream returns `400` with no storage mutation.
- non-internal English-native request returns `403` with no storage mutation.
- English-native 12/16/20 watches select only Batch 006 ordinary items and no
  `REV-*` items.
- English-native advanced/20-call watch is treated as internal coverage/review,
  not proof of advanced mastery.
- canonical answer accepts: e.g. `Say again.` for `EN-B006-CORE-001`.
- source prompt rejects: e.g. `What did you say?` remains wrong.
- dangerous natural English rejects remain wrong: `repeat`, `yes`, `no`,
  `left`, `right`, `dock`, `rope`, `bumper` where covered by Batch 006.
- wrong English-native answer creates English-native Lost Oar only.
- RU-source wrong answer does not appear in English-native Lost Oars.
- English-native Lost Oar resolution does not resolve RU-source weak point.
- `finish-watch` writes history only under the active stream.
- `progress.php?learner_stream=english_native` reports English-native history
  and Lost Oars only.
- `answer-log.php?learner_stream=english_native` returns English-native review
  groups only and includes no identity fields.
- all public payload privacy checks continue to reject `accepted_answers`,
  `qa_notes`, email, user id, token, CSRF, cookies and session ids.

## Explicit Non-Goals

- no public selector;
- no production deploy;
- no Watch Officer;
- no Nav Desk;
- no router change;
- no registry change;
- no `starter.json` merge;
- no batch JSON edit;
- no matcher expansion;
- no auth/platform change;
- no private config change;
- no session/cookie/CSRF redesign;
- no player email or identity exposure;
- no deploy/FTP work.

## Checks Performed

Read:

- role protocol and Director Engineer role rules/handoff;
- Batch 006 Director acceptance;
- Localization Architect stream policy;
- UX/HUD stream selector policy;
- Gamification progression policy;
- Batch 006 JSON;
- listed API endpoints, smoke tool, validator and `public/assets/app.js`.

Not performed:

- runtime/API/UI edits;
- production deploy;
- browser QA;
- PHP validation, because `php` is not installed in this shell.

## Copy-Ready Handoff For Director Ether

PASS: hidden/internal English-native stream integration can proceed next sprint
as API-first, stream-scoped work. Keep current Captain Ether route and default
as `ru_source`. Do not select English-native from `locale === "en"` or
unsupported-locale English fallback.

Use explicit `learner_stream=english_native` only through internal/admin
payload or hidden admin query flag. Load Batch 006 from its separate
`draft_internal` batch JSON; do not merge it into `starter.json` before a
separate Director merge task. Store stream on watch sessions, scope progress,
Lost Oars and answer logs by stream, and keep all payloads free of
`accepted_answers`, `qa_notes`, identity, session, CSRF, cookie and secret data.

Implementation may touch only the scoped Captain Ether API/helper/tool/UI files
listed in this report. No public selector, no production deploy, no Watch
Officer, no Nav Desk, no router/registry, no auth/platform.

## Changed Files

- `content/captain-ether/roles/director-engineer/reports/english-native-hidden-stream-integration-contract-2026-05-27.md`
