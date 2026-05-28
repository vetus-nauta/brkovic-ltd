# Language Sprint 02 Launch - 2026-05-28

**Owner:** `CHAT-BRK-DIRECTOR-001`  
**Status:** launched  
**Main rule:** no redesign; move language work through controlled technical layers.

## Purpose

This sprint gathers the small language tasks into one larger delivery package.

The goal is not to "translate the whole site at once". The goal is to build the controlled multilingual foundation:

- keep English as the primary public baseline;
- keep Russian active and preserve the owner's voice;
- keep future languages visible only as planned/disabled versions;
- continue moving safe UI strings into dictionaries;
- keep diagnostics, smoke and role reports green after every layer;
- do not touch URLs, `hreflang`, SEO claims, print/PDF documents or journal content until the proper gates exist.

## Sprint Package

| Workstream | Task | Status | Output |
| --- | --- | --- | --- |
| DIR | `BRK-MVP-DIR-005` Language Sprint 02 launch | For Review | this report |
| FEIMPL | `BRK-MVP-FE-017` Journal safe JS UI i18n layer | For Review | `reports/frontend-journal-safe-js-ui-i18n-layer-2026-05-28.md` |
| LOC | `BRK-MVP-LOC-009` Sprint 02 locked/risk copy map | Assigned | `reports/language-sprint-02-risk-map-2026-05-28.md` |
| QAUX | `BRK-MVP-QAUX-009` Sprint 02 regression smoke | For Review | `reports/language-sprint-02-regression-smoke-2026-05-28.md` |

## Work Order

### 1. Frontend

Continue only with safe UI strings.

Allowed:

- labels;
- buttons;
- aria labels;
- short UI statuses;
- generated helper text that already exists in EN/RU.

Locked:

- owner journal text;
- service positioning;
- SEO public claims;
- NavDesk disclaimers;
- radio/emergency output;
- watch-log signed documents;
- tide/depth formulas;
- print/PDF wording;
- future language activation.

### 2. Localization

Prepare the risk map for remaining strings before they move to dictionaries.

Buckets:

- safe UI;
- owner voice;
- safety/navigation;
- radio/emergency;
- legal/disclaimer;
- commercial/pricing;
- print/PDF document;
- SEO;
- backend/admin language-desk.

### 3. QA/UX

Repeat the gate after every frontend layer:

- `node --check` for touched JS;
- JSON parse for dictionaries;
- `node tools/i18n-diagnostics.mjs --markdown --out docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md`;
- Chrome smoke for touched pages in `?lang=en` and `?lang=ru`;
- no future language becomes clickable.

### 4. SEO Director

Do not add `hreflang` yet.

SEO Director prepares intent, metadata and URL strategy only after real target-language pages exist.

## First Launched Slice

`FE-017` has been started and implemented in this sprint:

- journal safe JS-generated UI labels moved to dictionary keys;
- diagnostics updated to understand template helper `tf(...)`;
- EN/RU journal smoke passed for lightbox and NavDesk card labels.

## Progress Update

Second controlled slice is also in review:

- `LOC-009` risk map completed and marked `For Review`;
- `FE-018` moved a small exact-text delivery calculator UI layer into dictionaries;
- `QAUX-010` smoke passed for journal and delivery page EN/RU shells;
- future target languages remain disabled.

Third controlled slice is in review:

- `LOC-010` created the NavDesk protected phrase registry;
- `FE-019` connected the old NavDesk small-calculator runtime labels to existing dictionary keys through an alias layer;
- `QAUX-011` smoke passed for `navdesk.html?lang=en` and `navdesk.html?lang=ru`;
- NavDesk radio output, formulas, GPS statuses, watch documents, disclaimer and print/PDF wording remain locked.

## Stop Rules

Stop and ask the owner before changing:

- Russian prose in posts or service text;
- public marketing promises;
- SEO titles/descriptions;
- generated radio text;
- navigation warnings and formulas;
- legal/disclaimer wording;
- print/PDF document wording;
- language availability and URL strategy.
