# Task 0003 - Journal Translation Work Order

**Chat ID:** `CHAT-BRK-LOC-001`
**Department:** Localization Architect
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-28
**Task ID:** `BRK-MVP-LOC-003`
**Status:** Assigned / background / report-first

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
docs/brkovic_ltd_project_office/task-registry.md
docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md
docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md
docs/brkovic_ltd_project_office/reports/seo-i18n-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
docs/brkovic_ltd_project_knowledge.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
data/journal-public.json
js/journal.js
js/admin-posts.js
lang/ru.json
lang/en.json
```

## Task

Prepare the localization work order for translating the Ship Journal entries into all approved project languages and placing the result into the correct future data model.

This task starts the localization workflow; it must not write translations into production, FTP, the live API, or the production database.

## Non-Negotiable Rules

- Russian journal content is the canonical source and must not be rewritten.
- The owner writes Russian title, excerpt, body, media, GPS/geotag, Russian alt and captions first.
- Generated translations are drafts until owner review/approval.
- Do not add hardcoded fields such as `titleFr`, `titleDe`, `altIt`, etc.
- The correct scalable destination is `JournalTranslation` / `JournalMediaTranslation` or a compatible entity/language row model.
- Existing RU/EN legacy fields are compatibility fields only.
- Do not use, read, print, copy, or commit OpenAI API keys.
- Do not call production API, FTP, or database.

## Questions To Answer

1. What journal entries exist in `data/journal-public.json`?
2. Which language versions already exist in the snapshot?
3. Which target languages are explicitly approved in project docs?
4. If the target language list is not explicitly found, report this as a Director/owner decision instead of inventing a final list.
5. For each entry, what fields must be translated:
   - title;
   - excerpt;
   - content/body;
   - SEO title;
   - SEO description;
   - share excerpt;
   - localized slug only if approved by SEO/I18N;
   - media alt;
   - media caption;
   - collection/multipage cover title/description if present.
6. What source revision/hash inputs are needed to detect stale translations?
7. What status workflow should each language row use?
8. What is the safe order of implementation between Localization, SEO/I18N, Backend/Admin and Frontend/Admin?

## Expected Output

Write a report to:

```text
docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md
```

Required sections:

- summary;
- files scanned;
- current journal entry inventory;
- current RU/EN status;
- approved target-language findings;
- blocker if target language list is not explicit;
- per-entry translation field checklist;
- media alt/caption checklist;
- SEO fields per language;
- proper destination model;
- admin workflow and approval status model;
- safe local draft package format, if useful;
- backend/frontend dependencies;
- owner decisions required;
- production/database/FTP untouched confirmation.

## Optional Draft Package

If a non-production draft structure is useful, propose its shape in the report. Do not create large generated translation JSON yet unless the Director explicitly approves the target language list and draft-file destination.

## Required Short Chat Reply

```text
BRK-MVP-LOC-003 ready for Director review.
Report: docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md
Scope preserved:
- Russian source text not rewritten.
- product code, backend, FTP, production database, live API, secrets not touched.
- No generated translation was published.
Decision needed: approved target language list and first implementation slice.
```
