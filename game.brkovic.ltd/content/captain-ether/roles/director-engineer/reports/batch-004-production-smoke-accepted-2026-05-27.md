# Technical Card: Batch 004 Production Smoke Accepted

Status: PASS
Date: 2026-05-27
Role: Director-Engineer / Captain Ether

## Input

QA report:

```text
content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md
```

Production target:

```text
https://game.brkovic.ltd/games/captain-ether
```

## Decision

Batch 004 production smoke rerun is accepted.

Batch 004 is now closed as:

- merged into playable `starter.json`;
- deployed;
- production route/login verified;
- live watches verified;
- production-smoke accepted.

## QA Result

QA result: `PASS`.

Verified on production:

- route opens: HTTP `200`;
- auth guard works: unauthenticated Captain Ether API returns `401`;
- login/intended route works through one-off private production QA access;
- watch lengths are correct:
  - beginner: `12`;
  - intermediate: `16`;
  - advanced: `20`;
- progressive order is preserved:

```text
word -> short_expression -> phrase
```

- Batch 004 reachability: `24` unique Batch 004 item IDs observed live;
- payload privacy: `284` question payloads checked, no `target_text`,
  `accepted_answers`, or `qa_notes`;
- targeted Safety / Securite matcher checks: `31/31` pass;
- QA report-only mode was respected;
- no secrets were written.

## Final Batch 004 State

Local playable corpus:

- `230` playable items;
- `112` grammar patterns;
- `2` scenarios.

Regression corpus:

- `230` QA item entries;
- `631` should-accept examples;
- `709` should-reject examples;
- `49` dangerous minimal-pair groups.

Batch 004 branch:

```text
safety_securite
```

Batch 004 status:

```text
live / playable / production-smoke accepted
```

## Auth Block Resolution

Previous production-smoke blocker was resolved by one-off Platform Auth access:

```text
game.brkovic.ltd/docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md
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

Captain Ether can now move to the next management choice:

- assign a new content-growth batch;
- or run an MVP-hardening pass based on production use and answer logs.
