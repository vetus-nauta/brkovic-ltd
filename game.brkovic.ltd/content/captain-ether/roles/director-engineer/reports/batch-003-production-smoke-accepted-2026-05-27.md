# Technical Card: Batch 003 Production Smoke Accepted

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Input

QA report:

```text
content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

## Decision

Batch 003 production smoke rerun is accepted.

Batch 003 is now closed as:

- merged into playable `starter.json`;
- deployed;
- production route/login verified;
- live watches verified;
- production-smoke accepted.

## QA Result

QA result: `PASS`.

Verified on production:

- route opens: HTTP `200`;
- login/intended route works through the approved private QA login path;
- watch lengths are correct:
  - beginner: `12`;
  - intermediate: `16`;
  - advanced: `20`;
- progressive order is preserved:

```text
word -> short_expression -> phrase
```

- Batch 003 reachability: `20` unique Batch 003 item IDs observed live;
- payload privacy: `112` question payloads checked, no `target_text`,
  `accepted_answers`, or `qa_notes`;
- targeted navigation matcher checks: `22/22` pass;
- QA report-only mode was respected;
- no secrets were written.

## Final Batch 003 State

Local playable corpus:

- `190` playable items;
- `88` grammar patterns;
- `2` scenarios.

Regression corpus:

- `190` QA item entries;
- `532` should-accept examples;
- `586` should-reject examples;
- `37` dangerous minimal-pair groups.

Batch 003 branch:

```text
navigation_reports
```

Batch 003 status:

```text
live / playable / production-smoke accepted
```

## Auth Block Resolution

Previous production-smoke blocker was resolved by Platform Auth `TASK-0065`:

```text
game.brkovic.ltd/docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md
```

Decision:

```text
game.brkovic.ltd/docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md
```

No Captain Ether content/API/auth workaround was made.

## Not Touched

- Captain Ether content after merge;
- matcher/API files;
- UI files;
- router;
- registry;
- Nav Desk;
- Watch Officer;
- auth/platform files;
- production config;
- private config, `.netrc`, SMTP, cookies, login codes, player email, player
  identity, or secrets.

## Next Step

Captain Ether can now move to the next content-growth assignment after any
separate Game Director QA output is reviewed.

Likely next content-growth batch:

```text
Batch 004: safety / Securite warnings
```
