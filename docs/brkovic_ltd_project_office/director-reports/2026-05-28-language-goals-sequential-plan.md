# Language Goals Sequential Plan - 2026-05-28

**Owner:** `CHAT-BRK-DIRECTOR-001`  
**Status:** active plan  
**Rule:** no redesign; no public target languages before content, URL, SEO and QA gates.

## Director Summary

The language goal is bigger than a language menu. The site needs a controlled multilingual pipeline:

1. keep English as the primary public baseline;
2. keep Russian as the active interface language and the owner's journal authoring language;
3. prepare `de`, `it`, `es`, `srb/mne/hr` and Mandarin as target languages;
4. translate UI, content, SEO and journal records through separate gates;
5. never let AI freely rewrite safety, radio, navigation, legal, price or owner-voice material.

Current frontend may show planned languages, but only `en` and `ru` are active. Planned languages stay disabled until real language files, URLs, SEO metadata and review exist.

## Operating Order

### Step 0 - Baseline And Guardrails

**Status:** done / in review  
**Output:**

- `docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/localization-page-readiness-step2-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/navdesk-maritime-glossary-2026-05-28.md`

Rules locked:

- English primary.
- Russian active and journal authoring source.
- Target languages: `de`, `it`, `es`, `srb/mne/hr`, Mandarin.
- No `hreflang` before real URLs.
- No target-language switch before translated files and QA.

### Step 1 - I18N Diagnostic Gate

**Status:** implemented / for review  
**Output:**

- `tools/i18n-diagnostics.mjs`
- `docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md`

Purpose:

- scan public HTML, services and all NavDesk pages;
- scan known JavaScript-generated UI translation references;
- verify active dictionaries `lang/en.json` and `lang/ru.json`;
- catch missing keys, dictionary drift and broken page shell before any new language work;
- treat static-unused keys as review signals, not deletion instructions, because many are used by generated JS.

Gate:

```bash
node tools/i18n-diagnostics.mjs
```

Every future frontend i18n step must keep this green.

### Step 2 - Static Public Shell Completion

**Status:** next  
**Owner:** Frontend engineer + Localization architect  
**Scope:** HTML/static shell only.

Small tasks:

1. inspect static-unused keys and mark which are JS-used vs obsolete;
2. key remaining low-risk static placeholders and labels;
3. add no new visible copy;
4. keep service hero alt and journal media alt out of scope unless owner approves exact meaning.

Exit criteria:

- diagnostics stays green;
- no CSS/layout changes;
- no owner voice rewritten.

### Step 3 - JavaScript-Generated UI Inventory

**Status:** next after Step 2  
**Owner:** Frontend engineer  
**Scope:** inventory first, implementation second.

Small tasks:

1. inventory generated UI strings in `js/main.js`, `js/form.js`, `js/journal.js`, `js/navdesk.js`, `js/management.js`, `js/delivery-calculator.js`;
2. classify each string: UI / owner voice / safety-critical / document / radio / commercial;
3. move only safe UI statuses first;
4. leave print/PDF, radio, safety and commercial text locked until module-specific review.

Exit criteria:

- generated safe statuses use `window.BRKOVIC_LANGUAGE.t(...)` or an equivalent existing helper;
- no radio output, disclaimer, formulas or documents are changed by this step.

### Step 4 - NavDesk Common Shell

**Status:** planned  
**Owner:** Frontend engineer + Localization architect + QA/UX  
**Scope:** common NavDesk shell, not the tools' calculations.

Small tasks:

1. shared buttons and labels;
2. disclaimer access behavior remains one common NavDesk warning;
3. day/night labels and accessibility;
4. tool cards and hub descriptions already approved as current UI, no redesign.

Exit criteria:

- day/night works in both languages;
- no white flash/regression introduced;
- desktop/tablet/mobile smoke.

### Step 5 - NavDesk Tool Modules, One By One

**Status:** planned  
**Order:**

1. abbreviations / small helper tools;
2. tides UI labels and non-safety statuses;
3. route UI labels and non-safety statuses;
4. watch log UI labels, excluding signed-watch document copy;
5. UKV UI labels, excluding generated radio-output;
6. Maritime English UI shell.

Locked for later:

- print/PDF documents;
- UKV emergency/radio output;
- tide/depth formulas;
- signed watch and rest-control warnings;
- GPS/notification warnings.

### Step 6 - Print/PDF And Safety Documents

**Status:** planned  
**Owner:** Frontend + Localization + QA/UX + owner approval  
**Scope:** documents only after tool UI is stable.

Small tasks:

1. A4/landscape templates per tool;
2. protected segments for formulas, coordinates, units and radio phrases;
3. bilingual `en/ru` document review;
4. only then prepare target-language drafts.

### Step 7 - Journal Language Desk Backend

**Status:** planned, depends on backend access/work copy  
**Owner:** Backend implementation + Localization + SEO  
**Scope:** admin/API/database, not frontend-only.

Small tasks:

1. Russian authoring remains default in admin;
2. translation rows/entities, not more `titleDe/titleIt/...` fields;
3. OpenAI server-side action from owner account;
4. SEO title/description/slug/alt per language;
5. review/publish state per language;
6. no automatic overwrite of owner Russian text.

### Step 8 - Target Language File Generation

**Status:** blocked until Steps 2-7 gates  
**Owner:** Localization + SEO + Frontend  
**Languages:** `de`, `it`, `es`, `srb/mne/hr`, Mandarin.

Small tasks:

1. create locked glossary per module;
2. generate draft files only from approved source strings;
3. QA overflow and mobile layout;
4. keep planned languages disabled until files pass diagnostics and smoke.

### Step 9 - URL, SEO, Sitemap, Hreflang

**Status:** blocked until real approved language pages exist  
**Owner:** SEO Integration Director + Release steward.

Small tasks:

1. decide URL model;
2. canonical rules;
3. per-page metadata;
4. schema where useful;
5. sitemap and robots;
6. `hreflang` only after real crawlable URLs.

## Immediate Next Three Tasks

1. `BRK-MVP-FE-015` - I18N diagnostics gate: implemented now, keep green.
2. `BRK-MVP-LOC-008` - Static-unused key classification: JS-used / obsolete / content-risk.
3. `BRK-MVP-FE-016` - First safe JS-generated UI migration: only low-risk statuses, no NavDesk safety/radio/print.

## Stop Rules

Stop and ask owner before changing:

- Russian owner voice;
- service positioning and promises;
- journal entry text;
- SEO public claims;
- NavDesk disclaimer;
- radio/emergency output;
- formulas, coordinates, units;
- print/PDF document wording;
- language URL/public availability.
