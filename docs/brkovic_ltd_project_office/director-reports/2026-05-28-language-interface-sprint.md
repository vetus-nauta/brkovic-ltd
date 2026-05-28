# Language Interface Sprint - 2026-05-28

**Owner:** `CHAT-BRK-DIRECTOR-001`  
**Status:** Active  
**Scope:** local MVP language interface and localization foundation  
**Production:** no deploy, no FTP, no backend writes

## Goal

Bring the site language layer out of the accidental `RU/EN` mindset and into the approved project model without redesign:

- primary public language: English;
- available additional language: Russian;
- planned languages: German, Italian, Spanish, regional Serbian/Montenegrin/Croatian, Mandarin;
- Russian remains the canonical authoring language for Ship Journal admin workflow;
- planned languages are visible as roadmap but not clickable until content/storage/SEO gates exist.

## Sprint Guardrails

- No redesign is implied or allowed.
- Do not recompose pages, invent new visual direction, or restyle beyond small fixes needed for readable/working states.
- Treat UI work here as interface consistency, functional correctness, accessibility and responsive bug fixing only.
- Do not rewrite Russian owner voice.
- Do not publish or generate translations in production.
- Do not add `hreflang` until crawlable language URLs exist.
- Do not make planned languages clickable before real language files/content exist.
- Do not touch FTP, production backend, database, OpenAI keys, or secrets.
- Preserve NavDesk disclaimer and day/night mode.
- Preserve site menu navigation and service/admin links.

## Layer 1 - Interface Foundation

### Frontend

Task: `BRK-MVP-FE-011`  
Output: `docs/brkovic_ltd_project_office/reports/frontend-language-roadmap-interface-step1-2026-05-28.md`

Check and, if needed, minimally patch:

- generated site menu language panel;
- static `services/yacht-management.html` menu behavior;
- desktop/tablet/mobile layout;
- NavDesk day/night visual states;
- no visible compact `RU/EN`;
- `en/ru` selectable, planned languages disabled;
- no attempts to load missing `de/it/es/sr/zh` JSON files.

### Localization

Task: `BRK-MVP-LOC-005`  
Output: `docs/brkovic_ltd_project_office/reports/localization-language-interface-step1-2026-05-28.md`

Report-only:

- approved language names in menu;
- codes that are final vs placeholders;
- wording for "primary", "current", "coming";
- system-language hint copy;
- risks for `srb/mne/hr` and Mandarin before URL/SEO decisions;
- surfaces that must be updated before adding real files for `de/it/es/sr/zh`.

## Layer 2 - Prepared, Not Started Until Layer 1 Returns

### Frontend

Task: `BRK-MVP-FE-012`  
Purpose: expand i18n readiness beyond the menu by finding hardcoded interface strings and proposing/implementing only safe structured-key moves approved by Director.

### Localization

Task: `BRK-MVP-LOC-006`  
Purpose: page-by-page localization readiness plan for public pages, NavDesk tools, journal/admin and print/PDF outputs.

Layer 2 starts only after the Director inspects Layer 1 reports and decides whether any blocking fixes are needed.

## Director Watch

All spawned agents must be recorded in:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-28-agent-control-log.md
```

The Director performs status checks and closes agents after inspecting their reports.
