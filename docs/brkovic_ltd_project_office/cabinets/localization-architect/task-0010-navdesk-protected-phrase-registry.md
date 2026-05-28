# Task 0010 - NavDesk Protected Phrase Registry

**Task ID:** `BRK-MVP-LOC-010`  
**Owner chat:** `CHAT-BRK-LOC-001`  
**Assigned:** 2026-05-28  
**Status:** Assigned

## Goal

Create a protected phrase registry for NavDesk before any larger NavDesk i18n migration.

This registry tells Frontend what may be moved as UI and what must stay locked until specialist / owner / SEO / print QA review.

## Required Areas

- common NavDesk shell and disclaimer;
- tides and safe passage window;
- route / orthodrome / loxodrome;
- watch log, signed watches, rest control and GPS;
- UKV / VHF / radio spelling / emergency templates;
- Maritime English page.

## Required Buckets

- freely extractable UI;
- standard maritime term;
- protected segment;
- safety-critical sentence;
- print/PDF document phrase;
- owner/editorial voice;
- future AI-protected segment.

## Hard Rules

- Do not enable `de`, `it`, `es`, `sr`, `zh`.
- Do not translate target languages yet.
- Do not rewrite NavDesk disclaimer.
- Do not translate generated radio output.
- Do not change formulas, thresholds or document text.
- Do not expose "dog watch" as visible UI wording.

## Output

```text
docs/brkovic_ltd_project_office/reports/navdesk-protected-phrase-registry-2026-05-28.md
```
