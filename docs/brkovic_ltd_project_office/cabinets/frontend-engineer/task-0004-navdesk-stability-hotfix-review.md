# Task 0004 - NavDesk Stability Hotfix Review

**Task ID:** `BRK-MVP-FE-004`
**Owner chat:** `CHAT-BRK-FE-IMPL-001`
**Assigned:** 2026-05-27
**Status:** Assigned
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-frontend-stability-hotfix-review-2026-05-27.md`

## Context

Owner request: разгрузить основной директорский чат. Основная задача фронта сейчас - NavDesk MVP без редизайна. Интерфейс не переделывать, только баги и стабилизация.

Рабочий проект:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## First Read

Before work, read:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/README.md
docs/brkovic_ltd_project_office/task-registry.md
```

Then start with:

```bash
git status --short --branch
```

## Strict Rules

- Work in Russian in the report.
- Do not deploy and do not touch FTP/production.
- Do not read, print, copy, or paste secrets.
- Do not revert other people's changes.
- Do not use `git reset`, `git checkout --`, or `git clean`.
- Preserve the shared NavDesk disclaimer behavior.
- Preserve NavDesk day/night behavior.
- Do not redesign. Fix only clear frontend bugs from this task.
- If a change is risky or taste-based, report it instead of changing it.

## Scope

Check the latest NavDesk changes in:

```text
navdesk.html
navdesk-tides.html
navdesk-watch.html
navdesk-route.html
navdesk-ukv.html
navdesk-english.html
css/navdesk.css
js/navdesk.js
```

Allowed write scope if an obvious bug is found:

```text
navdesk.html
navdesk-tides.html
navdesk-watch.html
navdesk-route.html
navdesk-ukv.html
navdesk-english.html
css/navdesk.css
js/navdesk.js
docs/brkovic_ltd_project_office/reports/navdesk-frontend-stability-hotfix-review-2026-05-27.md
```

## Required Checks

1. No white flash on refresh or page transitions between NavDesk pages in night mode.
2. Day/night switch is persisted and does not visually feel like a link to another page.
3. On `navdesk-tides.html`, the select arrow does not repeat or multiply.
4. On `navdesk-tides.html`, numeric spinners/arrows are not broken.
5. Weekly tides print/PDF remains A4 landscape and does not overflow page margins.
6. Desktop/tablet/mobile behavior stays stable in compact areas.

## Verification

Run at minimum:

```bash
node --check js/navdesk.js
git diff --check -- navdesk.html navdesk-tides.html navdesk-watch.html navdesk-route.html navdesk-ukv.html navdesk-english.html css/navdesk.css js/navdesk.js docs/brkovic_ltd_project_office/reports/navdesk-frontend-stability-hotfix-review-2026-05-27.md
```

Browser/device smoke:

- desktop around `1440x1000`;
- tablet around `768x1024`;
- mobile around `390x844`;
- day and night;
- direct refresh on each NavDesk page;
- navigation between NavDesk pages;
- `navdesk-tides.html` weekly graph print/PDF.

## Report

Create:

```text
docs/brkovic_ltd_project_office/reports/navdesk-frontend-stability-hotfix-review-2026-05-27.md
```

Report must include:

- what was checked;
- what was fixed;
- touched files;
- verification commands and browser/device checks;
- remaining risks or items requiring Director/owner decision.
