# Director Ether Beta 1.0 Handoff

Date label: 2026-05-27
Product: Captain Ether / Kapitan Efir
Recipient chat: Director Ether

This is the single first-read handoff for the next Captain Ether director chat.
It freezes the current public beta baseline and points to every role folder,
policy file, QA gate, and next architectural choice.

## Copy-Ready Intro For New Chat

```text
Chat: Director Ether / Captain Ether Beta 1.0

Working directory:
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd

Main project root:
/home/alexey/GitHub/Revoyacht/brkovic-ltd

First read:
docs/game-director/mandatory-chat-operating-rules.md
docs/game-director/chat-reporting-rules.md
docs/game-director/task-registry.md
docs/game-director/workstreams.md
docs/game-director/decision-log.md
content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/director-engineer/handoff.md
content/captain-ether/roles/README.md
content/captain-ether/role-command-protocol.md
content/captain-ether/answer-policy.md
content/captain-ether/answer-log-policy.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/content-growth-roadmap-1000.md

Concept / initial TZ:
Google Drive: Интернет-проекты / 02-BRKOVIC-LTD / sea-speak

Live product:
https://game.brkovic.ltd/games/captain-ether

Status:
Captain Ether is fixed as Beta 1.0: 230 playable items, Batches 001-004 live,
production QA PASS, answer-log admin review deployed, watch lengths 12/16/20,
progressive order word -> short_expression -> phrase.

Do not touch:
Watch Officer, Nav Desk, router, registry, auth/platform, Game Director docs,
production config, FTP/deploy state, private config, .netrc, SMTP, login codes,
cookies, sessions, CSRF, player email, or player identity unless explicitly
assigned by the human or Game Director.
```

## Authority And Boundaries

Director Ether is the successor to the Captain Ether Director-Engineer role.
It is not the global Game Director and does not own Watch Officer, Nav Desk,
platform auth, hub routing, or the game registry.

Default Captain Ether ownership:

- `content/captain-ether/`
- `public/api/captain-ether/`

Captain Ether UI files may be changed only when a Captain Ether task explicitly
requires UI work:

- `public/assets/app.js`
- `public/assets/app.css`
- `public/service-worker.js`

Report out-of-scope findings instead of fixing them directly.

## Mandatory Game Director Operating Rules

Director Ether and all Captain Ether role chats must also obey the shared
`game.brkovic.ltd` operating layer:

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`

Repository files are the source of truth. Chat is only dispatch, status, or
clarification. If chat history and repository files disagree, read the files
and report the conflict instead of guessing.

No Captain Ether chat should decide product direction or change files without
a defined role, task, allowed scope, forbidden scope, and report path. Worker
and role chats must write full findings to the assigned report file, not paste
long reports into chat.

Required chat completion is the compressed `TASK-XXXX done` or
`TASK-XXXX blocked` format from `chat-reporting-rules.md`. If no test was
required, state: `Tests: not run; documentation-only task.`

Never write or print secrets: login codes, cookies, sessions, CSRF values,
SMTP details, `.netrc`, private config, player email, player identity data,
FTP credentials, API keys, tokens, or passwords.

Production deploy, FTP, production server changes, auth access decisions, and
production config changes require a separate Game Director task. QA approval
allows the next Game Director decision; it is not deploy approval.

## Beta 1.0 Baseline

Captain Ether Beta 1.0 is a controlled public-beta training MVP.

Live route:

```text
https://game.brkovic.ltd/games/captain-ether
```

Game hub:

```text
https://game.brkovic.ltd/
```

Playable corpus:

- `230` playable items.
- `112` grammar patterns.
- `2` scenarios.
- Batches 001-004 merged into `content/captain-ether/starter.json`.
- Watch lengths: beginner `12`, intermediate `16`, advanced `20`.
- Watch order: `word -> short_expression -> phrase`.
- Target branches currently represented:
  - core radio procedure;
  - marina / harbour basics;
  - navigation reports;
  - safety / Securite warnings.

Regression corpus:

- `content/captain-ether/accept-reject-qa-pairs.json`
- `230` QA item entries.
- `631` should-accept examples.
- `709` should-reject examples.
- `49` dangerous minimal-pair groups.
- `129` danger must-accept examples.
- `215` danger must-reject examples.

Current validation result: `PASS`.

Known non-blocking validator warnings:

- six old duplicate-normalization warnings in legacy starter items;
- these are tracked as non-blocking and are not related to Batches 001-004.

## Closed Production Gates

Batch 001:

- live and playable;
- production smoke accepted;
- early corpus foundation for radio procedure.

Batch 002:

- branch: `marina_harbour`;
- live and playable;
- production smoke PASS;
- report:
  `content/captain-ether/roles/qa/reports/batch-002-production-smoke-2026-05-27.md`.

Batch 003:

- branch: `navigation_reports`;
- live and playable;
- production smoke PASS after approved private QA login path;
- report:
  `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`.

Batch 004:

- branch: `safety_securite`;
- live and playable;
- production smoke PASS;
- Game Director closure accepted for TASK-0078;
- report:
  `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`;
- closure:
  `content/captain-ether/roles/director-engineer/reports/task-0078-game-director-closure-accepted-2026-05-27.md`.

MVP hardening:

- admin-only answer-log review deployed;
- endpoint returns compact `review_groups`;
- admin UI shows `Журнал ответов`;
- player identity is not shown in the UI;
- service worker cache: `brkovic-games-shell-v6`;
- report:
  `content/captain-ether/roles/director-engineer/reports/mvp-hardening-answer-log-admin-2026-05-27.md`.

## Core Architecture

Runtime player loop:

1. Player opens `/games/captain-ether`.
2. Auth guard keeps intended route after login.
3. Player chooses beginner, intermediate, or advanced watch.
4. `start-watch.php` selects a short progressive watch.
5. UI asks one prompt at a time.
6. `submit-answer.php` evaluates the answer through `_answer-matching.php`.
7. Correct, accepted variant, and spelling feedback are soft and pedagogical.
8. Wrong or skipped items can enter Lost Oars / calm review.
9. `finish-watch.php` returns a short summary.
10. Real disputed answers are logged for admin review and future linguist work.

Content layers:

- playable source:
  `content/captain-ether/starter.json`;
- batch drafts:
  `content/captain-ether/batches/`;
- regression source:
  `content/captain-ether/accept-reject-qa-pairs.json`;
- linguistic reference:
  `content/captain-ether/accepted-answer-dictionary.md`;
- policy:
  `content/captain-ether/answer-policy.md`;
- answer-log policy:
  `content/captain-ether/answer-log-policy.md`;
- branch model:
  `content/captain-ether/branch-taxonomy.md`;
- growth roadmap:
  `content/captain-ether/content-growth-roadmap-1000.md`.

Runtime API:

- `public/api/captain-ether/start-watch.php`
- `public/api/captain-ether/submit-answer.php`
- `public/api/captain-ether/finish-watch.php`
- `public/api/captain-ether/lost-oars.php`
- `public/api/captain-ether/resolve-lost-oar.php`
- `public/api/captain-ether/skip-cleanup.php`
- `public/api/captain-ether/progress.php`
- `public/api/captain-ether/answer-log.php`
- `public/api/captain-ether/_answer-matching.php`
- `public/api/captain-ether/_answer-logging.php`

UI:

- `public/assets/app.js`
- `public/assets/app.css`
- `public/service-worker.js`

## Answer Policy

Pedagogical rule:

Minor spelling, punctuation, capitalization, spacing, and small grammar slips
should not make a clearly correct Sea Speak answer wrong.

Strict safety rule:

Typos and aliases must not change maritime meaning. Numeric tokens, channels,
headings, ETA values, bearings, distances, units, protected radio signals, and
dangerous minimal pairs must stay exact.

Matcher order:

1. Exact accepted answer.
2. Accepted Sea Speak variant or synonym.
3. Conservative spelling typo.
4. Wrong answer.

Examples of protected pairs:

- `port / starboard`
- `over / out`
- `roger / affirmative`
- `advice / advise`
- `berth / birth`
- `fender / finder`
- `heading / course / bearing`
- `090 / 90`
- `1400 / 1500`
- `Securite / security`
- `Pan-Pan / Mayday / Securite`
- `warning / advice / information`
- `obstruction / obstacle`

## Role System

Every role chat must read:

1. `content/captain-ether/role-command-protocol.md`
2. `content/captain-ether/captain-ether-handoff-2026-05-26.md`
3. `content/captain-ether/roles/README.md`
4. its own `rules.md`
5. its own `handoff.md`

Active roles:

- Director-Engineer / Director Ether:
  `content/captain-ether/roles/director-engineer/`
- Content Producer:
  `content/captain-ether/roles/content-producer/`
- Sea Speak Linguist:
  `content/captain-ether/roles/sea-speak-linguist/`
- QA:
  `content/captain-ether/roles/qa/`

Dormant roles prepared for later activation:

- Curriculum Architect:
  `content/captain-ether/roles/curriculum-architect/`
- Scenario Designer:
  `content/captain-ether/roles/scenario-designer/`
- UX/HUD Designer:
  `content/captain-ether/roles/ux-hud-designer/`
- Gamification Designer:
  `content/captain-ether/roles/gamification-designer/`
- Answer Log Analyst:
  `content/captain-ether/roles/answer-log-analyst/`

The rule for role freedom is narrow by design:

- roles do only the assigned job;
- roles read their rules first;
- roles produce one copy-ready technical card;
- Director Ether owns integration, policy, merges, runtime, and deployment.

## How To Activate Employee Chats

Content Producer command shape:

```text
Chat: Content Producer / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/content-producer/rules.md
content/captain-ether/roles/content-producer/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/branch-taxonomy.md

Task:
Draft only the assigned batch file and a report in your role folder.
Do not edit starter.json, matcher/API/UI, policy, router, registry, auth,
Nav Desk, Watch Officer, or deploy state.
```

Sea Speak Linguist command shape:

```text
Chat: Sea Speak Linguist / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/sea-speak-linguist/rules.md
content/captain-ether/roles/sea-speak-linguist/handoff.md
content/captain-ether/sea-speak-linguist-brief.md
content/captain-ether/answer-policy.md

Task:
Review only the assigned batch or answer-log findings for Sea Speak meaning,
accepted variants, must-stay-wrong examples, and dangerous minimal pairs.
Do not edit matcher/API/UI or merge playable content unless explicitly allowed.
```

QA command shape:

```text
Chat: QA / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/qa/rules.md
content/captain-ether/roles/qa/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/accept-reject-qa-pairs.json

Task:
Run the assigned local or production QA pass and write one report under
content/captain-ether/roles/qa/reports/.
Report-only unless explicitly told otherwise.
Do not write secrets, login codes, cookies, sessions, CSRF, SMTP details,
private config, .netrc, player email, or player identity.
```

Answer Log Analyst command shape:

```text
Chat: Answer Log Analyst / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/answer-log-analyst/rules.md
content/captain-ether/roles/answer-log-analyst/handoff.md
content/captain-ether/answer-log-policy.md
content/captain-ether/answer-policy.md

Task:
Analyze admin answer-log review groups only. Produce disputed-answer clusters,
possible accepted variants, possible reject rules, and questions for Sea Speak
Linguist. Do not edit matcher/API/UI/content and do not expose player identity.
```

## Validation

Primary validation command:

```bash
php content/captain-ether/tools/validate-captain-ether.php
```

Useful syntax checks:

```bash
php -l public/api/captain-ether/_answer-matching.php
php -l public/api/captain-ether/_answer-logging.php
php -l public/api/captain-ether/answer-log.php
node --check public/assets/app.js
```

Production smoke should check only what the task asks for. For a batch smoke,
QA usually checks:

- route opens;
- login/intended route;
- watch lengths `12/16/20`;
- progressive order;
- batch item reachability;
- payload privacy;
- targeted matcher examples.

Do not expose production login codes or private QA channel details.

## Deployment Notes

Production is live. Treat deploys as deliberate actions, not default cleanup.

When deployment is explicitly assigned, use the existing FTP/hash-check pattern
without printing secrets:

```bash
curl --netrc --ftp-pasv --ftp-create-dirs -sS -T "$file" "ftp://162.0.217.114/game.brkovic.ltd/$file" >/dev/null
local_hash=$(sha256sum "$file" | awk '{print $1}')
remote_hash=$(curl --netrc --ftp-pasv -sS "ftp://162.0.217.114/game.brkovic.ltd/$file" | sha256sum | awk '{print $1}')
test "$local_hash" = "$remote_hash"
```

Never print or store:

- FTP credentials;
- `.netrc`;
- `private/config.php`;
- SMTP details;
- login codes;
- cookies;
- sessions;
- CSRF values;
- player email;
- player identity data.

## Current Product Shape

Beta 1.0 is good enough for controlled public use because it has:

- short watches, not a 40-question fatigue loop;
- progressive question order;
- forgiving spelling/variant policy without unsafe meaning collapse;
- Lost Oars as calm review, not punishment;
- admin-only answer-log review;
- production QA passes for Batches 001-004;
- role folders and gated workflow for future growth.

It is not final maritime training approval. Avoid marketing it as formal
certification, emergency instruction, or full SMCP coverage.

## Next Architectural Direction

The next product step should not be "more random items" by default.
The stronger direction is branch-aware training:

1. Keep the current universal watch as the default.
2. Add a branch/module selection layer when enough content exists per branch.
3. Let users choose focused watches:
   - Radio procedure;
   - Marina / harbour;
   - Navigation reports;
   - Safety / Securite;
   - later: traffic / collision avoidance;
   - later: urgency / Pan-Pan;
   - later: distress / Mayday;
   - later: onboard / engine / inboard / deck operations.
4. Keep mixed review watches for retention.
5. Feed real disputed answers into Answer Log Analyst, then Linguist, then
   Director Ether, then QA.

Practical next choices for Director Ether:

- Option A: activate Answer Log Analyst after enough real answer logs exist.
- Option B: assign Curriculum Architect to plan Beta 1.1 branch-aware watches.
- Option C: assign Content Producer Batch 005 only if the product needs more
  corpus before a branch-aware UI pass.
- Option D: pause Captain Ether and let Game Director focus Watch Officer.

Recommended Captain Ether choice:

```text
Assign Curriculum Architect: Beta 1.1 branch-aware watch architecture.
Goal: decide UI/API/content requirements for choosing focused watches without
breaking the current universal 12/16/20 short-watch loop.
```

## Do Not Lose These Decisions

- Minor grammar mistakes should remind, not punish.
- Synonyms are accepted only when Sea Speak meaning is exact.
- Short watches matter; do not return to long 40-question first sessions.
- Watch order should move from word to short expression to longer phrase.
- Dangerous minimal pairs are product safety, not QA decoration.
- Role chats are intentionally narrow; Director Ether owns project logic.
- Answer logs are for improving pedagogy, not exposing players.
- Platform/auth/router issues go to Game Director or Platform Auth, not to
  Captain Ether role chats.
