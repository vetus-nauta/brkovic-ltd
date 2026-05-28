# TASK-CE-0016 QA API Smoke Fixture Acceptance Dispatch

Date: 2026-05-27
Role: Director Engineer
Status: DISPATCHED

## Scope

Issued QA report-only acceptance task for the local Captain Ether API smoke
fixture created in TASK-CE-0015.

Changed:
- `content/captain-ether/roles/qa/tasks/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md`
- `content/captain-ether/roles/qa/handoff.md`

Not changed:
- Captain Ether content data
- matcher/API/runtime behavior
- UI
- Watch Officer
- Nav Desk
- router/registry
- auth/platform
- Game Director docs
- production config
- deploy/FTP
- secrets

## QA Assignment

QA must accept or reject:

```text
content/captain-ether/tools/smoke-start-watch-api.php
```

Required QA report:

```text
content/captain-ether/roles/qa/reports/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md
```

QA mode: report-only.

## Director Verification Before Dispatch

Commands run:

```sh
$HOME/.local/php-codex/bin/php -l content/captain-ether/tools/smoke-start-watch-api.php
CAPTAIN_ETHER_PHP=$HOME/.local/php-codex/bin/php $HOME/.local/php-codex/bin/php content/captain-ether/tools/smoke-start-watch-api.php
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Results:

- PHP lint: PASS
- API smoke: `PASS captain-ether-api-smoke checks=180`
- Captain Ether validator: PASS with known `WARN (9)`

## Next Expected

QA chat should execute TASK-CE-0016 and return:

```text
TASK-CE-0016 done
```

or

```text
TASK-CE-0016 blocked
```

with the report path.
