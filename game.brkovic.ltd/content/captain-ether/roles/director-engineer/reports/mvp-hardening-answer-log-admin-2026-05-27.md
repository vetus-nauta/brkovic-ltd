# Technical Card: MVP Hardening / Answer Log Admin Review

Status: PASS
Date: 2026-05-27
Role: Director-Engineer / Captain Ether

## Decision

Captain Ether MVP-hardening now adds an admin-only answer-log review surface.

This is not a new content batch. It is a production-use feedback loop so future
accepted-answer changes can come from real player friction instead of guessing.

## Changed Files

- `public/api/captain-ether/_answer-logging.php`
- `public/api/captain-ether/answer-log.php`
- `public/assets/app.js`
- `public/assets/app.css`
- `public/service-worker.js`
- `content/captain-ether/answer-log-policy.md`
- `content/captain-ether/roles/director-engineer/reports/mvp-hardening-answer-log-admin-2026-05-27.md`

## What Changed

API:

- `GET /api/captain-ether/answer-log.php` remains admin-only.
- The endpoint now returns `review_groups` in addition to raw `entries`.
- Review groups are grouped by `item_id`.
- Each group includes item, prompt, target text, counts, top observed answers,
  matcher types, and review flags.

UI:

- Admin users now see a `Журнал ответов` button in the hub and Captain Ether
  level-select screen.
- The view shows log counts, grouped review cards, top observed answers per
  item, and a latest-entries table.
- The UI does not display `player_hash`, player email, session, cookie, CSRF, or
  any identity value.

Cache:

- Service worker cache was bumped to `brkovic-games-shell-v6`.

## Security / Privacy

No public player feature was added.

Answer-log access remains admin-only through:

```text
GET /api/captain-ether/answer-log.php
```

The admin UI uses the existing authenticated API path and hides identity fields.

No login code, cookies, sessions, CSRF values, player email, player identity
data, SMTP details, `.netrc`, private config, or secrets were written.

## Verification

Local checks:

```text
php -l public/api/captain-ether/_answer-logging.php
php -l public/api/captain-ether/answer-log.php
node --check public/assets/app.js
php content/captain-ether/tools/validate-captain-ether.php
```

Result: `PASS`.

Grouping smoke:

```text
captain_answer_log_review_groups(...)
```

Result:

```text
groups: 2
first: phrase_eta_001
flags: possible_missing_variant
```

Local route/assets smoke:

- `/games/captain-ether`: HTTP `200`;
- `/assets/app.js`: contains `renderAnswerLog`;
- `/assets/app.css`: contains answer-log styles;
- `/service-worker.js`: cache `brkovic-games-shell-v6`.

Production deploy:

- changed API/assets/docs were uploaded and hash-checked;
- `/games/captain-ether`: HTTP `200`;
- unauthenticated `/api/captain-ether/answer-log.php`: HTTP `401`;
- production service worker serves `brkovic-games-shell-v6`.

## Not Touched

- Captain Ether content JSON;
- matcher logic;
- Watch Officer;
- Nav Desk;
- router/registry;
- auth implementation;
- production config;
- private config, `.netrc`, SMTP, login codes, cookies, sessions, CSRF values,
  player email, or identity data.

## Next Step

After a little real use, assign Answer Log Analyst:

```text
content/captain-ether/roles/answer-log-analyst/
```

Task shape:

```text
Review /api/captain-ether/answer-log.php review_groups and produce a report of:
- safe accepted-answer candidates;
- must-stay-wrong answers;
- unclear prompts/hints;
- items that need Sea Speak Linguist review.
```
