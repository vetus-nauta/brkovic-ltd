# Localization Page Readiness Step 2 - 2026-05-28

**Task:** `BRK-MVP-LOC-006`
**Role:** Localization Architect
**Status:** ready for Director/owner review
**Scope:** report-only page readiness map
**Production:** untouched
**Product code:** untouched

## 1. Executive Summary

BRKOVIC.LTD is not ready for mass translation generation yet, but it has a workable foundation.

Current state:

- `en` is the primary public site language.
- `ru` is active and also remains the canonical authoring source for Ship Journal admin workflow.
- `de`, `it`, `es`, regional `srb/mne/hr`, and Mandarin are target languages, not public-ready languages.
- Current frontend availability is only `en/ru`; the roadmap languages must stay non-clickable until content, URL, SEO, backend/admin and review gates exist.
- Public page shells use `lang/en.json` and `lang/ru.json` heavily, but many runtime/generated surfaces are outside structured localization.
- Journal/admin is still legacy RU/EN and must not be expanded by adding `titleDe`, `titleIt`, etc. The correct destination is translation rows.

Primary risk:

The site may look multilingual because the menu has a language roadmap, but the actual product still contains mixed layers:

- structured `data-i18n` page copy;
- hardcoded Russian admin and NavDesk strings;
- hardcoded generated JS messages;
- legacy RU/EN journal content fields;
- print/PDF/share templates that are not yet locale-governed.

The next localization layer should be inventory-to-structure, not translation generation.

## 2. Sources Read

Required sources:

- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-28-language-interface-sprint.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0006-page-readiness-step2.md`
- `docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/localization-language-interface-step1-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md`
- `docs/brkovic_ltd_project_knowledge.md`

Additional read-only context used:

- `docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/seo-i18n-audit-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/frontend-language-roadmap-interface-step1-2026-05-28.md`
- `index.html`
- `services/*.html`
- `journal.html`
- `admin-posts.html`
- `admin-comments.html`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- `js/language.js`
- `js/main.js`
- `js/form.js`
- `js/journal.js`
- `js/admin-posts.js`
- `js/admin-comments.js`
- `js/navdesk.js`
- `js/management.js`
- `js/delivery-calculator.js`
- `lang/en.json`
- `lang/ru.json`
- `data/journal-public.json`

## 3. Diagnostics

Read-only diagnostics run:

- `git status --short --branch`
- `rg --files -g '*.html'`
- `rg --files js -g '*.js'`
- `rg -n "data-i18n|data-i18n-title|data-i18n-description|data-i18n-placeholder"`
- `rg -n "titleRu|titleEn|contentRu|contentEn|seoTitle|seoDescription|altRu|altEn"`
- `rg -n "window.print|navigator.share|PDF|print|share|clipboard|localStorage|GPS|вахт|Прилив|УКВ"`
- rough Cyrillic inventory in JS/HTML

Observed scale:

- Public HTML pages and NavDesk pages use many `data-i18n` keys.
- `js/navdesk.js`, `js/admin-posts.js`, `js/admin-comments.js`, `js/journal.js`, `js/management.js` and `js/delivery-calculator.js` generate visible user text at runtime.
- Rough Cyrillic inventory: about `994` matching lines in the inspected JS set and about `842` matching lines in inspected HTML pages. This is not a defect by itself; it is a warning that language surfaces are broader than `lang/*.json`.

## 4. Global Language Contract

Public language model:

| Code | Role | Current state | Readiness |
| --- | --- | --- | --- |
| `en` | Primary public site language | `lang/en.json` exists and loads | Active, but page-by-page SEO/copy review still needed |
| `ru` | Additional public language and canonical journal authoring source | `lang/ru.json` exists and loads | Active |
| `de` | Target language | Roadmap only | Blocked until full key/content/SEO review |
| `it` | Target language | Roadmap only | Blocked until full key/content/SEO review |
| `es` | Target language | Roadmap only | Blocked until full key/content/SEO review |
| `sr` | Temporary placeholder for `srb/mne/hr` | Roadmap only | Blocked by locale/URL/editorial decision |
| `zh` | Temporary placeholder for Mandarin | Roadmap only | Blocked by script/locale/editorial decision |

Important distinction:

- English is the primary public site language and future SEO-facing baseline.
- Russian is the owner's working source for Ship Journal authoring.
- The Russian journal voice is not to be rewritten by localization tasks.
- AI translation/SEO drafts must be generated server-side, reviewed and approved before publication.

## 5. Page Readiness Map

### 5.1 Home Page

Files:

- `index.html`
- `js/form.js`
- `js/main.js`
- `lang/en.json`
- `lang/ru.json`

Current language/source:

- Static HTML is English-first.
- Most visible public copy is keyed through `data-i18n`.
- Form statuses in `js/form.js` use translation keys with English fallbacks.
- Meta title/description are currently static in the HTML, while global JSON has `meta_title` and related keys.
- Messenger names, brand names and some aria labels are hardcoded and mostly acceptable as brand/platform terms.

What can be translated as UI:

- menu labels;
- CTA labels;
- contact form labels, statuses and fallback email text;
- mobile dock labels;
- footer headings and navigation labels;
- language panel hints.

Owner voice risk:

- High for hero, service positioning, "why BRKOVIC", training, route/destination claims and any text that defines the brand.
- Do not mass-generate replacements for the Russian or English marketing layer without owner/SEO review.

Requires meaning approval:

- hero headline/subtitle/support text;
- service card descriptions;
- "personal expertise" framing;
- claims about local expertise and training;
- destination list and route promise.

Requires SEO/backend/admin decision:

- page-specific canonical/OG/Twitter/schema;
- future crawlable URL strategy for `/en/`, `/ru/`, `/de/`, etc.;
- whether home page copy should be English-origin or owner-Russian-derived for each target language.

Readiness:

- UI shell: high for `en/ru`, partial for future languages.
- SEO localization: not ready.
- Mass translation: not allowed yet.

### 5.2 Service Pages

Files:

- `services/yacht-management.html`
- `services/iyt-training.html`
- `services/skipper-service.html`
- `services/sailing-tours.html`
- `services/yacht-acceptance-delivery.html`
- `services/yacht-registration.html`
- `js/management.js`
- `js/delivery-calculator.js`
- `lang/en.json`
- `lang/ru.json`

Current language/source:

- Service pages are mostly key-based through `data-i18n`.
- Service page titles/descriptions use `data-i18n-title` and `data-i18n-description` on most service pages.
- `yacht-management.html` has the richest structured language layer and a custom calculator/document workflow.
- `yacht-acceptance-delivery.html` has a calculator; generated route/fuel/status text comes from `js/delivery-calculator.js`.
- Hero image `alt` values and many `aria-label` values are hardcoded in English.
- Messenger/platform labels remain hardcoded, which is acceptable if treated as platform names.

What can be translated as UI:

- buttons and navigation;
- mobile dock labels;
- form labels and statuses;
- calculator field labels;
- calculator generic statuses;
- modal headings and close buttons;
- footer and common menu text.

Owner voice risk:

- High for service intros, "what is included", client promises, service boundaries, price/scope language and disclaimers.
- Yacht Management has financial/legal-adjacent text; Delivery and Registration have procedural/authority language.

Requires meaning approval:

- all service positioning;
- price range explanations;
- yacht registration scope;
- IYT/Sail Skill phrasing;
- skipper service tone;
- delivery/acceptance liability and handover language;
- tour promises and geography.

Requires SEO/backend/admin decision:

- service-specific keyword intent per language;
- localized metadata and social preview copy;
- structured data per service;
- whether slugs remain English or become localized;
- lead form values and CRM/admin handling for non-English service names.

Readiness:

- Visible UI: mostly ready for structured key expansion.
- Service copy: requires owner/SEO review before target languages.
- Generated calculators/documents: partial and must be audited separately.

### 5.3 Ship Journal Public

Files:

- `journal.html`
- `js/journal.js`
- `data/journal-public.json`
- `lang/en.json`
- `lang/ru.json`

Current language/source:

- Public shell/footer/filter labels are partly key-based.
- Actual journal entries come from public API/live data or `data/journal-public.json`.
- Local snapshot uses legacy fields: `titleRu/titleEn`, `excerptRu/excerptEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn`, `seoDescriptionRu/seoDescriptionEn`, `altRu/altEn`.
- `js/journal.js` resolves only RU/EN entry text paths.
- There are browser-side free translation fallbacks for missing English content, which must not become the future serious workflow.
- Collection/multipage UI contains many inline RU/EN branches.
- Likes, comments, share/copy, rights notices and comment statuses are runtime-generated surfaces.

What can be translated as UI:

- journal filters;
- back buttons;
- like/comment/share labels;
- comment form labels;
- empty/loading/error statuses;
- rights notice;
- collection navigation controls;
- generic "part/chapter" labels.

Owner voice risk:

- Extremely high for post titles, excerpts, body text and captions.
- Russian journal text is the owner's canonical source and should not be rewritten by localization.
- Existing English fields may be legacy/unchecked; they should not be automatically treated as final approved English.

Requires meaning approval:

- every journal post translation;
- every excerpt/share excerpt;
- media alt vs caption distinction;
- collection cover title/description;
- tone of literary/publicistic text in English and future target languages.

Requires SEO/backend/admin decision:

- `JournalTranslation` and `JournalMediaTranslation` row model as official source;
- per-language status workflow: missing/generated/needs_review/approved/published/stale/failed or approved compatible mapping;
- source revision hash;
- localized slugs only after SEO approval;
- crawlable entry/collection URLs;
- per-language SEO title/description/share excerpt;
- comment/like/share ownership across language variants;
- whether current EN is approved, stale, or should be regenerated.

Readiness:

- Public shell: partial.
- Journal content: blocked until backend/admin translation model and review gates are active.
- Mass translation: not allowed.

### 5.4 Journal Admin Workflow

Files:

- `admin-posts.html`
- `js/admin-posts.js`
- `admin-comments.html`
- `js/admin-comments.js`
- `admin-api-proxy.php` as local bridge, read-only for this task

Current language/source:

- Admin pages are Russian-only and hardcoded.
- This is acceptable for owner workflow: owner writes journal source in Russian.
- The current editor has fixed RU/EN fields and an EN generation button using browser-side free translation APIs.
- Media alt fields are fixed as RU/EN.
- Multipage collection editor is RU-first and does not yet expose a many-language status desk.
- Comments admin is Russian-only moderation UI.

What can be translated as UI:

- Generic admin navigation;
- buttons/statuses/tooltips;
- moderation status names;
- help hints and validation messages.

What should remain Russian-first:

- owner's fast-entry content authoring flow;
- canonical title/excerpt/content fields;
- initial media alt/caption entry;
- Russian SEO source fields if owner writes them first.

Owner voice risk:

- High where admin UI asks owner to write content.
- Do not encourage AI to overwrite source Russian.

Requires meaning approval:

- status names shown to owner;
- language desk wording;
- "SEO draft" vs "approved SEO";
- whether admin itself should remain only Russian or later gain a UI language switch.

Requires SEO/backend/admin decision:

- AI language desk server-side endpoint;
- OpenAI key boundary;
- translation rows and media translation rows;
- draft/review/approve/publish gates;
- per-language SEO fields;
- stale detection after source edits;
- retry behavior per field/language;
- audit trail and model/glossary/prompt versioning.

Readiness:

- Owner Russian authoring: usable MVP.
- Many-language admin: not ready.
- Browser-side free EN translation should be treated as legacy convenience, not the future architecture.

### 5.5 NavDesk Hub

Files:

- `navdesk.html`
- `js/navdesk.js`
- `lang/en.json`
- `lang/ru.json`

Current language/source:

- Hub uses `data-i18n` for many headings, cards and calculator labels.
- Day/night mode and disclaimer are special NavDesk behavior and must not be broken.
- Some former tool surfaces remain in the hub, while large tools also exist as separate pages.
- There are many generated statuses and calculations in `js/navdesk.js`.

What can be translated as UI:

- tool card labels;
- simple hub explanatory text;
- open/close/pin labels;
- calculator labels and statuses;
- time labels;
- common footer/menu.

Owner voice risk:

- Medium for NavDesk positioning;
- high for disclaimers and safety framing;
- high for maritime terminology if translated literally.

Requires meaning approval:

- disclaimer wording;
- safety/liability warnings;
- whether NavDesk is a "professional tool", "reference tool" or "training aid" in each language.

Requires SEO/backend/admin decision:

- whether NavDesk hub is indexable;
- whether tools are indexed separately;
- canonical URLs and schema for tools;
- if language URLs are created, how disclaimers persist across locales.

Readiness:

- UI shell: partial.
- Tool terminology: needs glossary.
- SEO: undecided.

### 5.6 NavDesk Watch Log

Files:

- `navdesk-watch.html`
- `js/navdesk.js`

Current language/source:

- Many visible watch-log labels are hardcoded Russian in HTML and JS.
- Print/PDF/share output is generated in `js/navdesk.js`.
- The page uses localStorage for draft/signature persistence.
- GPS, hourly marks, reminders and status messages are runtime strings.

What can be translated as UI:

- field labels;
- quick entry labels;
- schedule controls;
- buttons;
- statuses;
- reminder messages;
- print table headings.

Owner voice risk:

- Low for simple UI labels;
- high for safety/rest-control explanations and watch methodology.

Requires meaning approval:

- watch types and rest-control terminology;
- night-watch highlighting language;
- reminder wording;
- "signed watch" semantics;
- legal/document-like print wording.

Requires SEO/backend/admin decision:

- probably noindex/utility decision;
- local-storage-only vs future export/storage model;
- PDF language template rules;
- GPS privacy/local-only rule if surfaced in language copy.

Readiness:

- Function-first MVP surface, not localization-ready.
- Needs a dedicated NavDesk glossary and generated-document key map before translation.

### 5.7 NavDesk Tides

Files:

- `navdesk-tides.html`
- `js/navdesk.js`

Current language/source:

- Page has many `data-i18n` labels.
- Hero copy and some metadata are hardcoded Russian.
- Search, tide events, weekly chart, safe window, warnings and print/PDF strings are partly generated in JS.
- Disclaimers exist and must stay visible/accepted according to NavDesk rules.

What can be translated as UI:

- field labels;
- data mode labels;
- result labels;
- table headings;
- search statuses;
- weekly chart headings/legend;
- Print/PDF button labels.

Owner voice risk:

- Medium for explanatory copy;
- high for safety disclaimer and "safe passage" wording.

Requires meaning approval:

- "safe window" wording so it does not sound like guaranteed safety;
- tide/manual data warnings;
- under-keel-clearance terminology per language.

Requires SEO/backend/admin decision:

- whether tide pages are indexable;
- API/result data attribution;
- localized units/date/time formatting;
- print/PDF document language and disclaimer.

Readiness:

- Partial. Good skeleton for labels, but generated status/print strings still need key governance.

### 5.8 NavDesk Route

Files:

- `navdesk-route.html`
- `js/navdesk.js`

Current language/source:

- Many route UI labels use keys.
- Hero/meta and print report strings include hardcoded Russian.
- Generated route print includes calculation date, orthodrome/loxodrome headings, table labels and navigation warning.
- Search statuses are partly key-based.

What can be translated as UI:

- coordinate field labels;
- button/status text;
- route summary labels;
- table headings;
- print/PDF headings.

Owner voice risk:

- Low for simple labels;
- high for navigational warnings and methodology notes.

Requires meaning approval:

- terminology: orthodrome/great circle, loxodrome/rhumb line, true course, route point;
- warning text on print report;
- coordinate format labels per locale.

Requires SEO/backend/admin decision:

- index/noindex;
- canonical URL;
- whether route examples are localized;
- print/PDF language template.

Readiness:

- Partial. UI can be structured, but report generation must be localized as a document template.

### 5.9 NavDesk UKV / VHF

Files:

- `navdesk-ukv.html`
- `js/navdesk.js`

Current language/source:

- This is one of the strongest keyed NavDesk pages.
- It contains English radio phrases by subject matter, not just by UI language.
- It includes radio spelling, vessel profile, routine templates, distress/urgency/safety formats and print radio sheet.
- Smart-pick suggestions and templates have mixed English operational phrases and Russian explanations.

What can be translated as UI:

- interface labels;
- section headings;
- hints;
- statuses;
- copy/print button text;
- explanatory descriptions.

What should not be simply translated:

- official/procedural radio phrases that must remain correct maritime English;
- spelling alphabet terms;
- distress/urgency/safety message format words;
- VTS/marina call structure.

Owner voice risk:

- Medium for UI;
- high for training/explanation text;
- very high for emergency message semantics.

Requires meaning approval:

- whether target-language UI explains English radio phrases in local language while the actual message remains English;
- whether Mandarin/SRB/MNE/HR versions show bilingual explanations;
- glossary for distress/urgency/safety.

Requires SEO/backend/admin decision:

- whether UKV page is an indexable educational asset;
- whether generated radio sheets are saved/exported;
- whether official standards need source citations later.

Readiness:

- UI layer: better than other NavDesk tools.
- Domain correctness: requires a Maritime English/SMCP terminology pass before future languages.

### 5.10 Maritime English Placeholder

Files:

- `navdesk-english.html`

Current language/source:

- Placeholder page in Russian/mixed English.
- It is planned for a future large learning tool.
- It is not content-ready for SEO or translation.

What can be translated as UI:

- only temporary shell labels if the page remains visible.

Owner voice risk:

- High once educational content is created.

Requires meaning approval:

- learning taxonomy;
- voice of exercises;
- Sea Speak / SMCP treatment;
- whether English is the subject language while UI follows user locale.

Requires SEO/backend/admin decision:

- index/noindex until real content exists;
- course/module URL structure;
- content model for exercises and progress;
- language strategy: UI localization vs English-learning content.

Readiness:

- Not ready for translation beyond shell.

### 5.11 Print, PDF, Share And Generated Messages

Files:

- `js/navdesk.js`
- `js/management.js`
- `js/delivery-calculator.js`
- `js/journal.js`
- `js/form.js`

Surfaces:

- Yacht Management estimate/proforma print;
- NavDesk Watch A4 document;
- NavDesk Watch entries sheet;
- NavDesk Route print/PDF report;
- NavDesk Tides weekly print/PDF;
- UKV radio sheet;
- journal share/copy/comment statuses;
- contact form fallback/status text;
- delivery calculator route/fuel statuses.

Current language/source:

- Some strings use `t()` or `tSafe()` keys.
- Many document titles, table headings, notes, warnings and statuses are hardcoded in JS.
- Print windows are generated as HTML templates.
- Share text is created from current page/document state.

What can be translated as UI:

- button labels;
- generic statuses;
- document headings;
- table headings;
- empty states;
- copy/share success/failure states.

What requires document-level localization:

- disclaimers;
- legal/non-binding estimates;
- navigation safety warnings;
- radio message sheet labels;
- watch-log signature/sign-off wording;
- date/time/number/unit formatting.

Requires SEO/backend/admin decision:

- mostly not SEO, but some shared links need OG/Twitter later;
- exported/saved documents may need a document-language field;
- management proforma/admin integration needs backend/admin owner.

Readiness:

- Not ready for target languages until generated templates are mapped and moved to structured localization or template dictionaries.

## 6. Target Language Risks

### German (`de`)

Risks:

- long compound words may break compact UI, buttons and cards;
- formal/informal address must be decided;
- yacht management/legal wording needs careful term choices;
- maritime terms often need domain-specific German, not literal English calques.

Need before generation:

- UI length stress test;
- glossary for service/legal/navigation terms;
- SEO intent review per page.

### Italian (`it`)

Risks:

- Adriatic/local marina language matters;
- registration, authority and service wording can sound too legal or too casual;
- direct translations from English may lose the owner's practical tone.

Need before generation:

- glossary for marina/registration/service terms;
- region-aware SEO phrases;
- review of IYT/training phrasing.

### Spanish (`es`)

Risks:

- Spain vs Latin America terminology;
- nautical terms differ by region;
- "private service" and management copy must not become generic travel marketing.

Need before generation:

- choose target Spanish variant for SEO;
- glossary for nautical/training/service terms;
- decide whether Mediterranean/Adriatic intent is Spain-facing or global Spanish.

### Regional Serbian/Montenegrin/Croatian (`srb/mne/hr`)

Risks:

- current frontend code `sr` is only a placeholder;
- one regional version may be practical for MVP, but SEO and reader trust may suffer if it collapses real differences too aggressively;
- script choice matters: Latin is likely safer for Montenegro/Croatia-facing yacht audience, but must be approved;
- political/local naming sensitivities should be handled calmly.

Need before generation:

- decide one regional version vs separate locale pages;
- choose URL/locale code;
- choose script;
- glossary for local maritime and administrative terms.

### Mandarin / Chinese (`zh`)

Risks:

- current `zh` is only a placeholder;
- Simplified vs Traditional must be decided;
- Chinese UI has no spaces and may require layout checks;
- brand/service terminology may need transliteration rules;
- maritime legal/safety terms require specialist review.

Need before generation:

- decide `zh-CN`, `zh-Hans`, or other route;
- glossary for service names, NavDesk, watch log, safety disclaimers;
- UI layout stress test;
- SEO/URL decision before public indexing.

## 7. Cross-Cutting Readiness Rules

Before adding real `de/it/es/sr/zh` files:

1. Keep `en/ru` as the only selectable languages until complete language files and content gates exist.
2. Do not add `hreflang` until crawlable language URLs exist.
3. Do not add per-language fields such as `titleDe`, `contentIt`, `altZh`.
4. Use row-based translations for journal/admin content.
5. Keep OpenAI server-side only.
6. No generated translation publishes automatically.
7. Russian journal source remains canonical.
8. Generated documents need a separate template localization map.
9. NavDesk disclaimers and day/night behavior are protected.
10. Owner voice and SEO intent are reviewed per page, not by bulk translation.

## 8. Next Layer Tasks

### `BRK-MVP-LOC-007` - Hardcoded Surface Classification

Report-only or small approved key-map task.

Deliverable:

- classify hardcoded strings into:
  - common UI;
  - owner voice;
  - technical terminology;
  - safety/disclaimer;
  - generated document text;
  - admin-only;
  - SEO metadata.

Priority files:

- `js/navdesk.js`
- `js/admin-posts.js`
- `js/journal.js`
- `js/management.js`
- `navdesk-watch.html`
- `navdesk-route.html`
- `navdesk-tides.html`

### `BRK-MVP-LOC-008` - NavDesk Terminology Glossary

Report-only.

Scope:

- watch log;
- tides;
- route;
- UKV/VHF;
- Maritime English.

Output:

- English primary term;
- Russian working term;
- notes for `de/it/es/sr/zh`;
- forbidden literal translations;
- terms needing owner or maritime expert approval.

### `BRK-MVP-LOC-009` - Generated Documents Language Map

Report-only.

Scope:

- Watch A4;
- Watch entries sheet;
- Route PDF;
- Tides weekly graph PDF;
- UKV radio sheet;
- Yacht Management estimate/proforma.

Output:

- template inventory;
- required language keys;
- date/time/number/unit formatting rules;
- disclaimer rules;
- print/PDF language selection behavior.

### `BRK-MVP-LOC-010` - Service Pages Translation Readiness Pack

Report-first, no translations.

Scope:

- six service pages;
- common service vocabulary;
- owner voice checkpoints;
- SEO intent checkpoints;
- image alt and aria label plan.

### `BRK-MVP-LOC-011` - Journal Translation Desk Editorial Rules

Joint with Backend/Admin and SEO.

Scope:

- Russian source rules;
- AI draft boundaries;
- per-language field list;
- media alt/caption separation;
- review/approve/publish statuses;
- stale behavior after source edit.

### `BRK-MVP-FE-012` - I18N Surface Implementation Plan

Frontend task, no redesign.

Expected first implementation slice:

- no visual recomposition;
- add missing attribute localization support where safe, for example aria/title/alt if approved;
- move only low-risk UI/status strings to structured keys;
- do not touch owner voice or long copy without approval.

### `BRK-MVP-SEO-LANG-001` - Language URL And Indexing Policy

SEO Integration Director task.

Scope:

- primary English public strategy;
- URL pattern;
- canonical/hreflang/sitemap;
- index/noindex for NavDesk tools;
- journal entry/collection URLs;
- metadata policy per language.

### `BRK-MVP-BE-LOC-001` - Translation Storage Gate

Backend/Admin task.

Scope:

- confirm/implement translation rows;
- media translation rows;
- language codes;
- statuses;
- OpenAI server-side endpoint boundary;
- no browser-side key exposure;
- no auto-publish.

## 9. Release Impact

This report does not block the visual/local MVP by itself.

It does block:

- mass translation generation;
- public activation of `de/it/es/sr/zh`;
- `hreflang`;
- multilingual journal publication;
- language-specific SEO claims.

Safe MVP position:

- keep the roadmap language panel;
- keep only `en/ru` selectable;
- keep journal admin Russian-first;
- continue NavDesk functional stabilization;
- start next layer as mapping/glossary/template tasks, not translation output.

## 10. Scope Preservation

Confirmed:

- Product code was not edited.
- `lang/*.json` was not edited.
- HTML/CSS/JS were not edited.
- `data/journal-public.json` was not edited.
- Production, FTP and backend were not touched.
- OpenAI key, secrets, sessions, cookies and private configs were not read or printed.
- Russian author text was not rewritten.
- No translations were generated.
- No `hreflang` or public language URLs were added.

Only this report was created:

```text
docs/brkovic_ltd_project_office/reports/localization-page-readiness-step2-2026-05-28.md
```
