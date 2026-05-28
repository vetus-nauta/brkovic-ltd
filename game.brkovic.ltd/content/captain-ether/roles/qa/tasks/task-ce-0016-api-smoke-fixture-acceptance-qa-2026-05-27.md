# QA Task: TASK-CE-0016 API Smoke Fixture Acceptance

Date: 2026-05-27

## Role

QA / Captain Ether.

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Mandatory First Read

Before testing, read:

```text
docs/game-director/mandatory-chat-operating-rules.md
docs/game-director/chat-reporting-rules.md
docs/game-director/task-registry.md
docs/game-director/workstreams.md
docs/game-director/decision-log.md
content/captain-ether/role-command-protocol.md
content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/qa/rules.md
content/captain-ether/roles/qa/handoff.md
content/captain-ether/roles/director-engineer/reports/task-ce-0015-start-watch-api-smoke-fixture-2026-05-27.md
content/captain-ether/roles/qa/reports/task-ce-0011-branch-filter-post-blocker-qa-2026-05-27.md
```

Then read the tested files:

```text
content/captain-ether/tools/smoke-start-watch-api.php
content/captain-ether/tools/validate-captain-ether.php
public/api/captain-ether/start-watch.php
public/api/captain-ether/submit-answer.php
public/api/captain-ether/finish-watch.php
public/api/captain-ether/progress.php
public/api/captain-ether/lost-oars.php
public/api/captain-ether/resolve-lost-oar.php
public/api/captain-ether/answer-log.php
```

## Functional Duty

QA tests and reports only.

QA verifies whether the new local API smoke fixture is sufficient to close the
previous API/session mutation blocker for the Captain Ether Beta 1.1
Start Watch branch-filter work.

QA does not fix content, runtime, API, UI, matcher, policy, deploy, router,
registry, Nav Desk, Watch Officer, auth/platform, production config, or secrets.

## Mode

Report-only.

## Allowed Files

You may create or update only:

```text
content/captain-ether/roles/qa/reports/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/
content/captain-ether/tools/
public/api/captain-ether/
public/assets/
docs/game-director/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
production config, deploy state, private config, `.netrc`, SMTP, cookies,
login codes, player identity, FTP credentials, API keys, tokens, passwords, or
other secrets.

## Exact Task

Run acceptance QA for:

```text
content/captain-ether/tools/smoke-start-watch-api.php
```

Verify:

1. The tool is local-only and does not require production deploy, FTP, remote
   server access, or auth/platform changes.
2. The tool does not print session tokens, CSRF values, cookies, emails,
   private config, or secrets.
3. The tool backs up and restores local storage JSON files.
4. The tool exercises the real Captain Ether HTTP API path through the PHP
   built-in server.
5. The tool covers:
   - legacy mixed Start Watch behavior;
   - explicit `mode=mixed`;
   - invalid mode errors;
   - focused branch success cases;
   - focused branch unavailable cases;
   - focused module unavailable contract;
   - weak-item hard cap behavior;
   - focused branch quota and type-floor behavior;
   - public payload privacy;
   - submit-answer / finish-watch / progress flow;
   - lost-oar creation and resolution;
   - skip-cleanup no-unresolved path.
6. Re-run the exact commands below and record PASS/FAIL.

## Commands

Use the local PHP CLI built during Director work:

```sh
$HOME/.local/php-codex/bin/php -l content/captain-ether/tools/smoke-start-watch-api.php
CAPTAIN_ETHER_PHP=$HOME/.local/php-codex/bin/php $HOME/.local/php-codex/bin/php content/captain-ether/tools/smoke-start-watch-api.php
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Expected current baseline:

```text
No syntax errors detected in content/captain-ether/tools/smoke-start-watch-api.php
PASS captain-ether-api-smoke checks=180
Captain Ether validation ... PASS
```

Known non-blocking validator warnings:

```text
WARN (9) duplicate accepted_answers after normalization
```

## Expected Output

Create or update:

```text
content/captain-ether/roles/qa/reports/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md
```

Return one copy-ready technical card for the Director-Engineer chat with:

- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- PASS/FAIL by block;
- exact command results;
- failures with reproduction steps;
- severity;
- owner route:
  - Director-Engineer for runtime/tool/API issue;
  - QA follow-up for fixture coverage ambiguity;
  - Sea Speak Linguist or Content Producer only if a content/matcher meaning
    issue is discovered;
- confirmation that QA was report-only and no forbidden files were changed.

## Success Criteria

TASK-CE-0016 can mark the previous API/session mutation blocker closed only if:

- the API smoke tool passes locally;
- validator still passes;
- no private values are printed or written to reports;
- storage restoration behavior is confirmed by review or observation;
- QA finds no blocker in the fixture coverage.
