# Director-Engineer Handoff

## Beta 1.0 Transfer

The next director chat is named Director Ether.

First-read handoff:

```text
content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md
```

Use it before making new Captain Ether decisions. It freezes the Beta 1.0
baseline, role folder map, closed gates, validation commands, deployment
warnings, and recommended Beta 1.1 architectural direction.

## Activation

Always active in the main Captain Ether engineering chat.

## Current Authority

Full Captain Ether ownership inside:

- `content/captain-ether/`
- `public/api/captain-ether/`

Captain Ether UI changes are allowed only when explicitly needed.

## Current State

Batch 001, Batch 002, Batch 003, and Batch 004 are merged into playable
`starter.json`.

Local playable corpus:

- `230` playable items;
- `112` grammar patterns;
- `2` scenarios.

Regression corpus:

- `230` QA item entries;
- `631` should-accept examples;
- `709` should-reject examples;
- `49` dangerous minimal-pair groups.

Latest local validation passed:

- full matcher regression;
- Batch 004 Safety / Securite dangerous-pair checks;
- beginner/intermediate/advanced watch-selection smoke;
- progressive order: `word -> short_expression -> phrase`.

## Closed Gates

Batch 001:

- acceptance QA: `content/captain-ether/qa-batch-001-acceptance-2026-05-27.md`;
- production smoke: `content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md`;
- status: live, playable, production-smoke accepted.

Batch 002:

- Content Producer report:
  `content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md`;
- Sea Speak Linguist report:
  `content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md`;
- engineering gate:
  `content/captain-ether/roles/director-engineer/reports/batch-002-engineering-gate-2026-05-27.md`;
- acceptance QA:
  `content/captain-ether/roles/qa/reports/batch-002-acceptance-qa-2026-05-27.md`;
- merge report:
  `content/captain-ether/roles/director-engineer/reports/batch-002-merge-2026-05-27.md`;
- status: live, playable, production-smoke accepted.
- production deploy: uploaded and hash-checked;
- route smoke: `https://game.brkovic.ltd/games/captain-ether` returned HTTP `200`.
- production smoke:
  `content/captain-ether/roles/qa/reports/batch-002-production-smoke-2026-05-27.md`;
- production smoke result: `PASS`.

Batch 003:

- Content Producer report:
  `content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md`;
- Sea Speak Linguist report:
  `content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md`;
- engineering gate:
  `content/captain-ether/roles/director-engineer/reports/batch-003-engineering-gate-2026-05-27.md`;
- acceptance QA:
  `content/captain-ether/roles/qa/reports/batch-003-acceptance-qa-2026-05-27.md`;
- merge report:
  `content/captain-ether/roles/director-engineer/reports/batch-003-merge-2026-05-27.md`;
- production smoke:
  `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`;
- production smoke accepted:
  `content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-accepted-2026-05-27.md`;
- auth-block decision:
  `content/captain-ether/roles/director-engineer/reports/batch-003-production-smoke-auth-block-decision-2026-05-27.md`;
- outbound Platform/Auth request:
  `content/captain-ether/roles/director-engineer/reports/platform-auth-production-qa-login-request-2026-05-27.md`;
- batch file:
  `content/captain-ether/batches/batch-003-navigation-reports-basics.json`;
- status: live, playable, production-smoke accepted.
- Platform Auth task:
  `game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md`.
- Platform Auth decision:
  `game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`.
- TASK-0065 result accepted:
  `content/captain-ether/roles/director-engineer/reports/platform-auth-task-0065-result-accepted-2026-05-27.md`.

Batch 004:

- Content Producer report:
  `content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md`;
- Sea Speak Linguist report:
  `content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md`;
- engineering gate:
  `content/captain-ether/roles/director-engineer/reports/batch-004-engineering-gate-2026-05-27.md`;
- acceptance QA:
  `content/captain-ether/roles/qa/reports/batch-004-acceptance-qa-2026-05-27.md`;
- merge report:
  `content/captain-ether/roles/director-engineer/reports/batch-004-merge-2026-05-27.md`;
- production smoke task:
  `content/captain-ether/roles/qa/tasks/batch-004-production-smoke-2026-05-27.md`;
- production smoke report:
  `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`;
- production smoke auth-block decision:
  `content/captain-ether/roles/director-engineer/reports/batch-004-production-smoke-auth-block-decision-2026-05-27.md`;
- Platform Auth one-off access decision:
  `game.brkovic.ltd/docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`;
- outbound Platform/Auth request:
  `content/captain-ether/roles/director-engineer/reports/platform-auth-batch-004-production-qa-code-channel-request-2026-05-27.md`;
- production smoke accepted:
  `content/captain-ether/roles/director-engineer/reports/batch-004-production-smoke-accepted-2026-05-27.md`;
- Game Director closure accepted:
  `content/captain-ether/roles/director-engineer/reports/task-0078-game-director-closure-accepted-2026-05-27.md`;
- batch file:
  `content/captain-ether/batches/batch-004-safety-securite-warnings.json`;
- status: live, playable, production-smoke accepted, Game Director closed.

## MVP Readiness

MVP readiness analysis:

```text
content/captain-ether/roles/director-engineer/reports/mvp-readiness-analysis-2026-05-27.md
```

Decision:

```text
Controlled/public-beta training MVP is viable after Batch 002.
```

The role pipeline is not circular while each gate answers a different question.
After Batch 002, switch from pipeline-proof mode to MVP-hardening mode.

Validation command:

```text
php content/captain-ether/tools/validate-captain-ether.php
```

Implementation report:

```text
content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md
```

Current validation result: `PASS`.

MVP hardening completed:

- answer-log admin review report:
  `content/captain-ether/roles/director-engineer/reports/mvp-hardening-answer-log-admin-2026-05-27.md`;
- admin-only answer log endpoint now returns `review_groups`;
- admin UI has a compact `Журнал ответов` view;
- service worker cache: `brkovic-games-shell-v6`;
- status: deployed and production smoke checked for route, asset hashes, and
  unauthenticated admin endpoint guard.

## Current Role Assignment

None.

## Next Recommended Task

Make the next management choice:

- assign a new content-growth batch;
- or run an MVP-hardening pass based on production use and answer logs.
- after enough real entries exist, assign Answer Log Analyst to summarize
  `review_groups` for Sea Speak Linguist.

Game Director's stated next work direction is Watch Officer. That is outside
Captain Ether scope unless a new Captain Ether task is explicitly assigned.

## Report Shape

Return one copy-ready technical card:

- decision made;
- files changed;
- checks passed;
- deploy status;
- next role command.
