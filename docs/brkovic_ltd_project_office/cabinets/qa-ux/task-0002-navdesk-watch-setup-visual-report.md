# Chat Assignment

**Chat ID:** `CHAT-BRK-QA-UX-001`
**Department:** QA/UX Inspector / UX Visual Review
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-QAUX-002`
**Status:** Ready / report-only

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Source Documents

Read first:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
navdesk-watch.html
css/navdesk.css
js/navdesk.js
```

## Task

Check the lower watch setup card on `navdesk-watch.html`.

The owner flagged the block `Настройка вахт / Переход, экипаж и вахты`: fields looked scattered, the `Сформировать` button floated on the right, and fields with different logic were falling into one grid. A first local CSS/HTML fix may already be in progress by the Director. Do not edit files.

## Report Must Cover

- optimal professional ordering and grouping of fields for a watch-log setup interface;
- what belongs in one compact row and what should be separated into groups;
- best placement of `Сформировать` on desktop, tablet, and mobile;
- risks that must not be broken: day/night, disclaimer, current field IDs, JS schedule logic, localStorage, manual shifts;
- recommended precise CSS/HTML changes after the Director's first fix.

## Output

Short report in chat or, if working as a project-office task, write:

```text
docs/brkovic_ltd_project_office/reports/navdesk-watch-setup-visual-review-2026-05-27.md
```

## Boundaries

- Report-only.
- Do not edit files.
- Do not redesign the whole NavDesk.
- Do not alter day/night or disclaimer.
- Do not touch production, FTP, backend, database, or secrets.
