# Task 0005 - Language Interface Step 1

**Task ID:** `BRK-MVP-LOC-005`  
**Owner Chat:** `CHAT-BRK-LOC-001`  
**Status:** Assigned  
**Created:** 2026-05-28

## Assignment

Prepare a report-only localization check for the current language interface.

This task is not translation generation and not redesign.

## Scope

Read:

```text
docs/brkovic_ltd_project_knowledge.md
docs/brkovic_ltd_project_office/director-reports/2026-05-28-language-interface-sprint.md
docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md
js/language.js
js/main.js
lang/ru.json
lang/en.json
services/yacht-management.html
navdesk*.html
journal.html
```

Write only:

```text
docs/brkovic_ltd_project_office/reports/localization-language-interface-step1-2026-05-28.md
```

No product code edits.

## Required Questions

- Are the visible names for `en`, `ru`, `de`, `it`, `es`, `sr`, `zh` acceptable for a roadmap menu?
- Which codes are final and which are placeholders?
- Is "Primary / Основной" clear for English without confusing users?
- Is "Coming / Готовится" clear and not misleading?
- Does the system-language hint correctly explain automatic selection and where to change it?
- What are the exact risks for regional `srb/mne/hr` and Mandarin before SEO/URL decisions?
- What strings/surfaces must be prepared before adding actual `de/it/es/sr/zh` language files?

## Required Output

```text
docs/brkovic_ltd_project_office/reports/localization-language-interface-step1-2026-05-28.md
```

Include findings, recommended wording, blockers, and second-layer tasks for localization. Do not generate translations.
