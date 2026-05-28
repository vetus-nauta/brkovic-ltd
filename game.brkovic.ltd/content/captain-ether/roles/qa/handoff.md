# QA Handoff

## Activation

Use only after Director-Engineer names the exact target and test type.

## Current Pending QA

TASK-CE-0016 API smoke fixture acceptance:

- task file:
  `content/captain-ether/roles/qa/tasks/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md`
- required report file:
  `content/captain-ether/roles/qa/reports/task-ce-0016-api-smoke-fixture-acceptance-qa-2026-05-27.md`
- mode:
  report-only
- target:
  `content/captain-ether/tools/smoke-start-watch-api.php`
- required focus:
  local API/session mutation fixture coverage, storage restore behavior,
  payload privacy, and command reproducibility.
- expected baseline:
  PHP lint PASS, API smoke `PASS captain-ether-api-smoke checks=180`,
  Captain Ether validator PASS with known `WARN (9)`.

Batch 004 production smoke rerun is complete and accepted by Director-Engineer.

## Last QA

Batch 004 production smoke rerun:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`
- mode:
  report-only
- target:
  `https://game.brkovic.ltd/games/captain-ether`
- required focus:
  production route/login, watch lengths `12/16/20`, progressive order,
  Batch 004 reachability, payload privacy, and Safety / Securite targeted
  matcher checks.
- result:
  `PASS`
- decision report:
  `content/captain-ether/roles/director-engineer/reports/batch-004-production-smoke-accepted-2026-05-27.md`
- Platform Auth one-off access decision:
  `game.brkovic.ltd/docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`

Do not include account identifiers, codes, cookies, sessions, CSRF values, SMTP
details, `.netrc`, private config, player email, player identity data, or other
secrets in reports.

## Previous QA

Batch 004 production smoke after merge, first attempt:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`
- mode:
  report-only
- target:
  `https://game.brkovic.ltd/games/captain-ether`
- result:
  `NEEDS DIRECTOR DECISION / PLATFORM AUTH ACCESS BLOCK`
- confirmed:
  route HTTP `200`, unauthenticated Captain Ether API `401`, production
  request-code HTTP `200`, no `dev_code` exposed, no secrets written.
- blocked:
  login/intended route, watches `12/16/20`, progressive order, Batch 004
  reachability, payload privacy, and targeted Safety / Securite matcher checks.

Batch 004 acceptance before merge:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-004-acceptance-qa-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md`
- mode:
  report-only
- target:
  `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- required focus:
  Safety / Securite dangerous pairs, especially `Securite / Sécurité / security`,
  `Securite / Pan-Pan / Mayday`, `safety / urgency / distress`,
  `warning / advice / information`, `advice / advise`,
  `restricted visibility / poor visibility / reduced visibility`,
  `obstruction / obstacle`, `hazard / danger`, `read back / say again`, and
  exact channel, time, bearing, distance, unit, direction, location, and
  reporting-point values.
- result:
  `PASS`

Batch 003 production smoke rerun:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`
- mode:
  report-only
- target:
  `https://game.brkovic.ltd/games/captain-ether`
- required focus:
  production route/login, watch lengths `12/16/20`, progressive order,
  Batch 003 reachability, payload privacy, and navigation-report targeted
  matcher checks.
- result:
  `PASS`
- decision report:
  `content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-accepted-2026-05-27.md`
- Platform Auth task:
  `game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md`
- Platform Auth decision:
  `game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`

Do not include account identifiers, codes, cookies, sessions, CSRF values, SMTP
details, `.netrc`, private config, player email, player identity data, or other
secrets in the report.

## Earlier QA

Batch 003 production smoke after merge, first attempt:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`
- mode:
  report-only
- target:
  `https://game.brkovic.ltd/games/captain-ether`
- result:
  `AUTH BLOCK ASSIGNED TO PLATFORM AUTH TASK-0065`

Batch 003 acceptance before merge:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-003-acceptance-qa-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md`
- mode:
  report-only
- target:
  `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- required focus:
  navigation-report dangerous pairs, especially `heading/course/bearing`,
  `090/90`, ETA values, units, decimal wording, and `say again/read back`.
- result:
  `PASS`

Batch 002 production smoke after merge:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-002-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-002-production-smoke-2026-05-27.md`
- mode:
  report-only
- target:
  `https://game.brkovic.ltd/games/captain-ether`
- result:
  `PASS`

Batch 002 acceptance QA before merge:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-002-acceptance-qa-2026-05-27.md`
- report file:
  `content/captain-ether/roles/qa/reports/batch-002-acceptance-qa-2026-05-27.md`
- result:
  `PASS`

Batch 001 production smoke:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-001-production-smoke-2026-05-27.md`
- report file:
  `content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md`
- result:
  `PASS`

Batch 001 acceptance QA before merge:

- task file:
  `content/captain-ether/roles/qa/tasks/batch-001-acceptance-qa-2026-05-27.md`
- report file:
  `content/captain-ether/qa-batch-001-acceptance-2026-05-27.md`
- result:
  `PASS`

## Report Shape

Return one copy-ready technical card:

- PASS/FAIL by block;
- failures with reproduction steps;
- severity;
- owner route;
- confirmation of report-only mode.
