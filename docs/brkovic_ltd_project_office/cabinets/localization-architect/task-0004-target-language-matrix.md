# Task 0004 - Target Language Matrix

**Task ID:** `BRK-MVP-LOC-004`
**Owner Chat:** `CHAT-BRK-LOC-001`
**Status:** Assigned
**Created:** 2026-05-28

## Assignment

Prepare the project target-language matrix from the latest owner direction and the existing handoff evidence.

## Current Director Rule

The target language model is:

- `en` - English, primary public site language;
- `ru` - Russian, additional public language and canonical authoring language for Ship Journal admin workflow;
- `de` - German;
- `it` - Italian;
- `es` - Spanish;
- `sr` - regional Serbian/Montenegrin/Croatian placeholder code until final locale/URL decision;
- `zh` - Mandarin / Chinese placeholder code until final script/locale decision.

Old handoff notes say current implementation was `ru/en` and future planned was `de/it/fr/sr/zh`. The owner clarified on 2026-05-28 that Spanish replaces the old unapproved French direction, and `srb/mne/hr` must be treated as a regional language direction, not a forgotten edge case.

## Required Output

Write:

```text
docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md
```

The report must include:

- current working frontend language files;
- target languages and priority/order;
- which codes are final and which are placeholders;
- what must happen before a language becomes public/indexable;
- impact on Ship Journal AI translation workflow;
- impact on SEO/hreflang/sitemap;
- risks if frontend, backend and SEO use different language lists.

## Constraints

- Do not generate translations.
- Do not edit production/backend/database.
- Do not add `hreflang` until crawlable language URLs exist.
- Do not turn planned languages into clickable frontend choices until their JSON/content layer exists.
- Do not rewrite Russian owner text.
