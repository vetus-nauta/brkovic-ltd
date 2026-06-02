# Ship Cashbox Sprint 02 Handoff - 2026-06-03

**Project:** `brkovic.ltd`
**Source repo:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**WebStorm/local mirror:** `/home/alexey/WebstormProjects/brkovic-ltd`
**Branch:** `handoff-2026-05-20-full`
**Local check target:** `http://127.0.0.1:18090/ship-cashbox/index.html?welcome=1&reload=20260603-cashbox-solo-mode-22`

This handoff contains no secrets, passwords, SMTP credentials, MongoDB URIs, invite tokens, or uploaded receipt images.

## Start Here In The Next Chat

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
git log -1 --oneline --decorate
```

Then read:

```text
docs/brkovic_ltd_project_office/director-reports/2026-06-03-ship-cashbox-sprint-02-handoff.md
docs/ship-cashbox-product-map-sprint-01.md
docs/ship-cashbox-solo-mode-sprint-02.md
AGENTS.md
PROJECT_RULES.md
```

## Source Of Truth

Use the GitHub/source copy first:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Mirror changed files to the WebStorm/local browser copy before asking for visual review:

```text
/home/alexey/WebstormProjects/brkovic-ltd
```

Do not create a third localhost copy, mock server, Python stub, or alternate Apache target. The user's local browser etalon is the existing WebStorm/local site.

## Current Runtime Versions

```text
Ship Cashbox shell: 20260603-cashbox-solo-mode-22
Service worker cache: ship-cashbox-shell-v20260603-59
API version: 2026.06.03-ship-cashbox-solo-mode-02
```

If the browser looks stale, assume service worker/browser cache first:

```text
Hard refresh.
If needed, unregister /ship-cashbox/ service worker.
Clear site data for 127.0.0.1.
Reopen the URL with reload=20260603-cashbox-solo-mode-22.
```

## What Was Completed

### Sprint 01 Product Map

Ship Cashbox is locked as four entry scenarios:

- personal journal;
- crew ship cashbox;
- quick equalizer;
- group invitation by six-digit code.

The lock is documented in:

```text
docs/ship-cashbox-product-map-sprint-01.md
```

### Sprint 02 Solo Mode Completion

Personal journal is now a first-class mode, not a group cashbox with different labels.

Implemented behavior:

- start personal card includes opening balance: `Сколько денег было`;
- personal creation sends `opening_balance` to backend;
- plus-sign lines are income, normal numeric lines are expenses;
- personal report shows income, expenses, balance, and records;
- personal settings show only title, currency, opening balance;
- personal menu says `Журнал` / `Меню журнала`, not group/cashbox wording;
- personal footer says expenses;
- personal archive opens as a personal report, not settlement/team archive;
- group mode, invite, attachments, settlement, autosave, physical save, and quick equalizer were kept intact.

The lock is documented in:

```text
docs/ship-cashbox-solo-mode-sprint-02.md
```

## Important Implementation Files

```text
ship-cashbox/assets/app.js
ship-cashbox/assets/app.css
ship-cashbox/api/index.php
ship-cashbox/sw.js
ship-cashbox/index.html
ship-cashbox/cache-reset.html
lang/*.json
```

Welcome images now exist as product assets:

```text
ship-cashbox/assets/welcome-journal.webp
ship-cashbox/assets/welcome-crew.webp
ship-cashbox/assets/welcome-calculator.webp
```

OCR/scan deterministic foundation exists here:

```text
ship-cashbox/assets/scan-engine.js
docs/ship-cashbox-ocr-release-plan.md
```

## Runtime Uploads Rule

Uploaded receipt/proof files under:

```text
ship-cashbox/attachments/
```

are runtime user files and must not be committed. Only `.gitkeep` is tracked. This prevents real checks/photos from going to GitHub.

## Local Verification Already Run

Static/source checks:

```text
node --check ship-cashbox/assets/app.js - ok
node --check ship-cashbox/sw.js - ok
lang/*.json parse - ok
git diff --check - ok
```

`php -l` was not available in this shell (`php: command not found`), so backend was verified through HTTP.

HTTP smoke on `127.0.0.1:18090`:

```text
/ship-cashbox/index.html?welcome=1&reload=20260603-cashbox-solo-mode-22 -> 200
/ship-cashbox/assets/app.js?v=20260603-cashbox-solo-mode-22 -> 200
/ship-cashbox/assets/app.css?v=20260603-cashbox-solo-mode-22 -> 200
/ship-cashbox/sw.js?reload=20260603-cashbox-solo-mode-22 -> 200
/ship-cashbox/api/?action=me -> 200, version 2026.06.03-ship-cashbox-solo-mode-02
verify-invite-code with 000000 -> controlled 404, not runtime failure
```

## Do Not Break

Preserve these areas exactly unless a specific bug requires a targeted fix:

- fast notebook typing;
- autosave;
- physical save button;
- committed `✓` notebook rows;
- attachment/proof links;
- group invite code and legacy token compatibility;
- settlement and who-owes-whom in group mode;
- quick equalizer as no-auth local calculator;
- WebStorm mirror workflow;
- cache-bust discipline.

## Suggested Next Big Task

Sprint 03 should be visual/product polish after Sprint 02, not another backend rewrite.

Recommended scope:

- compact mobile-first operational screen;
- clearer personal/group mode state in header;
- final pass on welcome screen proportions and cards;
- browser cache-reset affordance if stale UI keeps confusing review;
- no change to notebook persistence mechanics unless a reproducible bug appears.
