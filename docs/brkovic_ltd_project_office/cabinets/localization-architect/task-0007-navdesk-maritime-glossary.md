# Task 0007 - NavDesk Maritime Glossary

**Task ID:** `BRK-MVP-LOC-007`  
**Owner Chat:** `CHAT-BRK-LOC-001`  
**Status:** For Review  
**Created:** 2026-05-28

## Assignment

Prepare a report-only maritime glossary and localization rule set for NavDesk.

This is not redesign, not translation generation, and not product code work.

## Scope

Read:

```text
docs/brkovic_ltd_project_office/reports/frontend-i18n-surface-step2-2026-05-28.md
docs/brkovic_ltd_project_office/reports/localization-page-readiness-step2-2026-05-28.md
docs/brkovic_ltd_project_knowledge.md
navdesk.html
navdesk-watch.html
navdesk-tides.html
navdesk-route.html
navdesk-ukv.html
navdesk-english.html
js/navdesk.js
lang/ru.json
lang/en.json
```

Write only:

```text
docs/brkovic_ltd_project_office/reports/navdesk-maritime-glossary-2026-05-28.md
```

## Required Content

Create a glossary/rule map for:

- NavDesk common shell and disclaimer;
- watch log / signed watch / rest control / reminder wording;
- tides / safe window / depth / draft / UKC;
- route planning / orthodrome / loxodrome / ETA / fuel;
- UKV/VHF / radio spelling / Mayday / Pan-Pan / Securite / Seaspeak;
- Maritime English learning page terms.

For each group:

- English term;
- Russian working term;
- notes for `de`, `it`, `es`;
- warning for `srb/mne/hr` and Mandarin if direct translation is risky;
- whether term is UI, maritime standard, safety-critical, or owner-voice.

## Guardrails

- Do not rewrite product text.
- Do not generate final translations for `de/it/es/sr/zh`.
- Do not localize emergency/radio outputs blindly.
- Do not touch production, FTP, backend, data, secrets or OpenAI key.
- Do not add `hreflang`.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/navdesk-maritime-glossary-2026-05-28.md
```

Include glossary, risk notes, and recommended next implementation tasks.
