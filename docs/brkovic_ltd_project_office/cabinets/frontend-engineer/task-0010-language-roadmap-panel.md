# Task 0010 - Language Roadmap Panel

**Task ID:** `BRK-MVP-FE-010`
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`
**Status:** For Review
**Created:** 2026-05-28

## Assignment

Bring the site menu language panel into line with the owner-approved many-language model.

## Requirements

- Do not restore the old compact `RU/EN` switch.
- Show the full target language roadmap in the menu.
- Keep only languages with real frontend language files selectable.
- Mark future languages as planned/coming, not broken buttons.
- English is the primary public site language.
- Russian remains available and remains the canonical authoring language for Ship Journal workflow.
- Do not add `hreflang`, language URLs, backend changes or generated translations in this task.

## Target Roadmap

```text
en - English, primary, available
ru - Russian, available
de - German, planned
it - Italian, planned
es - Spanish, planned
sr - Serbian/Montenegrin/Croatian regional placeholder, planned
zh - Mandarin/Chinese placeholder, planned
```

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/frontend-language-roadmap-panel-2026-05-28.md
```

Include changed files, validation commands and browser smoke result.
