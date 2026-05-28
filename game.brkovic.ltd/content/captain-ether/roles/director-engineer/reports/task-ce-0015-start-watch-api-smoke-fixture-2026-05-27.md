# TASK-CE-0015 Start Watch API Smoke Fixture

Date: 2026-05-27
Role: Director Engineer
Status: DONE

## Scope

Implemented a local-only API smoke fixture for Captain Ether Start Watch / Watch flow validation.

Changed:
- `content/captain-ether/tools/smoke-start-watch-api.php`

Not changed:
- Watch Officer
- Nav Desk
- router/registry
- auth/platform
- Game Director docs
- production config
- deploy/FTP
- secrets

## Result

The previous QA blocker was the missing executable API-session mutation smoke. The new tool starts a local PHP built-in server, seeds a temporary local admin test session, runs the Captain Ether API through HTTP, and restores storage files in `finally`.

The tool checks:
- legacy mixed Start Watch behavior
- explicit `mode=mixed`
- invalid mode errors
- focused branch success cases
- focused branch unavailable cases
- focused module unavailable contract
- weak-item hard cap behavior
- focused branch quota and type-floor behavior
- public payload privacy for Start Watch / submit / lost-oars / answer-log
- submit-answer / finish-watch / progress flow
- lost-oar creation and resolution
- skip-cleanup no-unresolved path

## Commands

```sh
$HOME/.local/php-codex/bin/php -l content/captain-ether/tools/smoke-start-watch-api.php
CAPTAIN_ETHER_PHP=$HOME/.local/php-codex/bin/php $HOME/.local/php-codex/bin/php content/captain-ether/tools/smoke-start-watch-api.php
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

## Verification

PASS:
- `php -l content/captain-ether/tools/smoke-start-watch-api.php`
- `PASS captain-ether-api-smoke checks=180`
- `Captain Ether validation ... PASS`

Known non-blocking validator warnings:
- 9 duplicate `accepted_answers` after normalization remain as WARN only.

## Notes

The smoke fixture does not use production deploy, FTP, external auth, or secret values. It temporarily backs up/restores local storage JSON files and does not print session token or CSRF values.

Next expected:
- Director Ether can mark the branch-filter API mutation blocker closed.
- QA can optionally re-run the new tool as its executable fixture.
