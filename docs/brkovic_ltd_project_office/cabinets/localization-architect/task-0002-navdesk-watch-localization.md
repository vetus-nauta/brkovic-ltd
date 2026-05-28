# Chat Assignment

**Chat ID:** `CHAT-BRK-LOC-001`
**Department:** Localization Architect
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-LOC-002`
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
docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md
docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
navdesk-watch.html
js/navdesk.js
css/navdesk.css
lang/ru.json
lang/en.json
```

## Task

Prepare a focused localization report for the NavDesk watch log after the latest interface work. This is not a translation pass and not a product-code task. The goal is to identify every language surface in the watch log that must later follow the shared site localization rules.

## What To Check

- visible labels, buttons, helper text, empty states and status messages in `navdesk-watch.html`;
- JS-generated strings in `js/navdesk.js`: schedule summaries, validation, GPS, reminders, signing, saving, sharing, print/PDF, errors;
- print documents: `Вахты A4`, `Лист записей`, signed watches, rest control, date/time labels, table headings;
- hidden language surfaces: `placeholder`, `aria-label`, `title`, browser notification text and share text;
- day/night switch and disclaimer behavior as NavDesk special cases;
- terminology that must not be translated literally, especially watch log terms and the pre-dawn watch window;
- which strings already belong in `lang/*.json`, which need new keys, and which should stay numeric/technical (`UTC`, `GPS`, `LT`, coordinates).

## OpenAI / AI Translation Boundary

Do not design or implement OpenAI API integration in this task. Record only the localization requirements that the later server-side AI workflow must honor:

- owner writes canonical Russian first;
- AI language output is draft/review-only;
- no OpenAI key in browser, Git, HTML or JS;
- product must use a server-side API boundary when this phase starts.

## Output

Write the report to:

```text
docs/brkovic_ltd_project_office/reports/navdesk-watch-localization-2026-05-27.md
```

Required sections:

- summary;
- files scanned;
- hardcoded visible text;
- generated JS text;
- print/PDF/share/notification text;
- terminology and glossary risks;
- recommended key groups;
- owner decision questions;
- safe implementation phases;
- no-code-change confirmation.

## Boundaries

- Documentation-only.
- Do not edit product code.
- Do not edit `lang/*.json`.
- Do not rewrite Russian author voice.
- Do not touch OpenAI API implementation.
- Do not touch production, FTP, backend, database, or secrets.
