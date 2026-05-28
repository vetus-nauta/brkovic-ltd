# TASK-CE-0016 API Smoke Fixture Acceptance QA

Дата: 2026-05-27  
Роль: QA / Captain Ether  
Режим: report-only  
Результат: PASS

## Техническая карточка для Director-Engineer

TASK-CE-0016 принят как PASS. Новый локальный smoke-fixture
`content/captain-ether/tools/smoke-start-watch-api.php` достаточен, чтобы
закрыть предыдущий API/session mutation blocker из TASK-CE-0011.

## Scope

Изменен только разрешенный файл:

- `content/captain-ether/roles/qa/reports/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md`

Report-only подтверждение:

- runtime/API/UI/content data не изменялись;
- `starter.json`, `accept-reject-qa-pairs.json`, batches, tools, `public/api`,
  `public/assets`, `docs/game-director`, router, registry, Nav Desk, Watch
  Officer, auth/platform, production config, deploy/FTP и private config не
  изменялись;
- `.netrc`, SMTP, cookies, login codes, player identity, API keys, tokens,
  passwords и другие secrets не читались в отчет и не записывались.

В родительском worktree до начала QA уже были многочисленные чужие изменения;
они не трогались.

## Sources Read

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0015-start-watch-api-smoke-fixture-2026-05-27.md`
- `content/captain-ether/roles/qa/reports/task-ce-0011-branch-filter-post-blocker-qa-2026-05-27.md`
- `content/captain-ether/tools/smoke-start-watch-api.php`
- `content/captain-ether/tools/validate-captain-ether.php`
- `public/api/captain-ether/start-watch.php`
- `public/api/captain-ether/submit-answer.php`
- `public/api/captain-ether/finish-watch.php`
- `public/api/captain-ether/progress.php`
- `public/api/captain-ether/lost-oars.php`
- `public/api/captain-ether/resolve-lost-oar.php`
- `public/api/captain-ether/answer-log.php`
- `public/api/captain-ether/skip-cleanup.php`

## Environment

- Working directory:
  `/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd`
- PHP CLI:
  `$HOME/.local/php-codex/bin/php`
- Target:
  `content/captain-ether/tools/smoke-start-watch-api.php`

## Command Results

### PHP lint

Command:

```text
$HOME/.local/php-codex/bin/php -l content/captain-ether/tools/smoke-start-watch-api.php
```

Result: PASS.

Exact output:

```text
No syntax errors detected in content/captain-ether/tools/smoke-start-watch-api.php
```

### API smoke fixture

Command:

```text
CAPTAIN_ETHER_PHP=$HOME/.local/php-codex/bin/php $HOME/.local/php-codex/bin/php content/captain-ether/tools/smoke-start-watch-api.php
```

Result: PASS.

Exact output:

```text
PASS captain-ether-api-smoke checks=180
```

### Captain Ether validator

Command:

```text
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Result: PASS with known non-blocking warnings.

Exact output summary:

```text
Captain Ether validation
Root: /home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd

Starter:
  items: 255
  grammar_patterns: 112
  scenarios: 2
  type_counts: {"phrase":136,"short_expression":69,"word":50}
  level_counts: {"advanced":49,"beginner":88,"intermediate":118}
  branch_counts: {"(missing)":40,"core_radio":50,"marina_harbour":50,"navigation_reports":50,"safety_securite":40,"urgency_panpan":25}
  module_counts: {"(missing)":40,"acknowledgement":2,"approach_instructions":10,"arrival_call":2,"berth_request":5,"departure_basic":6,"equipment_failure":5,"eta_reports":6,"fuel_water_power":11,"hazard_reporting":8,"heading_course":12,"medical_assistance":4,"message_markers":9,"mooring_alongside":16,"navigation_readback":10,"navigation_warning":5,"opening_closing":10,"position_and_intentions":5,"position_reports":9,"procedure_words":4,"readback_correction":8,"repetition_clarification":4,"reporting_points":5,"restricted_visibility":5,"safety_readback":10,"safety_signal":5,"speed_distance":8,"spelling_numbers":9,"station_calls":4,"towing_assistance":3,"urgency_readback":4,"urgency_signal":4,"weather_sea_state":7}

Regression:
  qa_items: 255
  target_text: 255
  should_accept: 711
  should_reject: 783
  dangerous_pairs: 57
  danger_must_accept: 157
  danger_must_reject: 261

Watch selection:
  beginner: {"allowed":88,"runs":30,"length":12,"bad_runs":0,"reached":82}
  intermediate: {"allowed":206,"runs":30,"length":16,"bad_runs":0,"reached":112}
  advanced: {"allowed":255,"runs":30,"length":20,"bad_runs":0,"reached":160}

WARN (9)
PASS
```

Known warnings:

- `WARN (9)` duplicate `accepted_answers` after normalization.
- Warnings are validator warnings only; no validation failure was reported.

## Acceptance Blocks

| Block | Result | Evidence |
| --- | --- | --- |
| Local-only execution | PASS | Fixture uses local PHP built-in server on `127.0.0.1`, seeded local storage, and no FTP/deploy/remote server path. |
| No production/auth/platform changes required | PASS | Fixture seeds a local synthetic admin session and calls local HTTP endpoints; no platform auth or production config edit needed. |
| Secret/privacy output | PASS | Smoke output is only `PASS captain-ether-api-smoke checks=180`; no session token, CSRF value, cookie, email, private config, player identity, API key, token, or password printed. |
| Storage backup/restore | PASS | `users`, `sessions`, `progress`, `watch_sessions`, and `weak_points` storage hashes matched before and after the smoke run; `captain_answer_logs` was absent before and absent after. Source review confirms backup before seeding and restore in `finally`. |
| Real HTTP API path | PASS | Fixture starts `php -S 127.0.0.1:<random> -t public` and exercises `/api/captain-ether/*.php` endpoints through HTTP requests. |
| Legacy mixed Start Watch behavior | PASS | Covered by `mixed beginner default`, `mixed intermediate`, `mixed advanced`, legacy branch/module ignored, and unbranched eligibility checks. |
| Explicit `mode=mixed` | PASS | Covered by `explicit mixed ignores focus fields`. |
| Invalid mode errors | PASS | Covered by `invalid mode` status/error/mutation-free/privacy checks. |
| Focused branch success cases | PASS | Covered for `core_radio`, `marina_harbour`, `navigation_reports`, and `safety_securite` across available levels. |
| Focused branch unavailable cases | PASS | Covered for unavailable beginner navigation, unavailable traffic collision, and urgency below threshold. |
| Focused module unavailable contract | PASS | Covered for missing branch, missing module, invalid module, and valid-looking unavailable module. |
| Weak-item hard cap behavior | PASS | Covered for mixed weak hard cap and focused weak hard cap. |
| Focused branch quota and type-floor behavior | PASS | Covered by focused `focus quota`, `type floor`, and review quota checks. |
| Public payload privacy | PASS | Covered for Start Watch success/error, submit next payload, lost-oars, and answer-log payloads. |
| Submit / finish / progress flow | PASS | Covered by real focused watch, correct answer submission, full completion, finish summary, and progress completion check. |
| Lost-oar creation and resolution | PASS | Covered by wrong answer creation, lost-oars GET, resolve-lost-oar POST, and correct resolution check. |
| Skip-cleanup no-unresolved path | PASS | Covered by POST to `skip-cleanup.php` after resolution with `force_hangar=false`. |
| Validator regression | PASS | Validator returned `PASS` with only known `WARN (9)`. |
| Localization impact | PASS / N/A | QA task adds no player-facing UI copy. API messages were not changed by QA; no locale smoke required for this report-only acceptance. |

## Failures

No failures found.

Severity: none.

Reproduction steps: N/A.

Expected vs actual: expected all three commands to pass and fixture to preserve
privacy/storage boundaries; actual matches expected.

## Owner Route

- Director-Engineer: may accept TASK-CE-0016 and close the previous API/session
  mutation blocker.
- QA follow-up: not required unless Director-Engineer changes fixture scope or
  adds new API/session cases.
- Sea Speak Linguist / Content Producer: not required; no content or matcher
  meaning issue was discovered.

## Next Expected

Director-Engineer acceptance. From QA perspective, the API smoke fixture passes
locally, validator still passes, no private values were printed or written, local
storage restoration is confirmed, and no fixture coverage blocker remains.
