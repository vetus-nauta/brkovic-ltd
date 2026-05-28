# Localization Surface Inventory - 2026-05-27

**Task:** `BRK-MVP-LOC-001`
**Owner chat:** `CHAT-BRK-LOC-001`
**Role:** Localization Architect
**Status:** ready for Director/owner review
**Scope:** documentation-only inventory of language surfaces in local BRKOVIC.LTD MVP

## Summary

The MVP already has a useful RU/EN client-side localization base:

- `lang/ru.json` and `lang/en.json` both have 803 scalar keys.
- Key parity is clean: 0 keys missing in either RU or EN.
- HTML uses 599 unique `data-i18n*` keys, and all checked references exist in both JSON files.
- Public service pages are mostly key-based for visible copy and page titles/descriptions.

The main localization risk is not key count. The risk is that the product still has many language surfaces outside the JSON system:

- admin pages are Russian-only and hardcoded;
- NavDesk separated pages contain large hardcoded Russian/mixed RU/EN surfaces;
- `js/navdesk.js`, `js/journal.js`, `js/admin-posts.js`, `js/admin-comments.js`, `js/management.js`, `js/admin-management.js` generate visible strings, statuses, print/PDF documents, share text, notifications and fallbacks directly in JavaScript;
- `aria-label`, `title`, `alt`, `placeholder`, meta descriptions and print labels are only partially localized;
- public journal/admin workflow still carries legacy RU/EN fields, while the project direction requires many-language translation rows and AI-assisted drafts;
- maritime terms need locale-specific decisions, not literal translation.

This is not an MVP upload blocker by itself, but it is a release-quality warning: before adding many languages, localization must be normalized by surface type and by ownership.

## Files Scanned

Required source documents read:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `docs/brkovic_ltd_project_office/README.md`
- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/chat-registry.md`
- `docs/brkovic_ltd_project_office/task-registry.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0001-language-surface-inventory.md`
- `docs/brkovic_ltd_project_office/cabinets/seo-i18n/task-0002-ai-multilingual-admin-architecture.md`
- `docs/brkovic_ltd_project_knowledge.md`
- `docs/brkovic_ltd_full_handoff_2026-05-20.md`
- `lang/ru.json`
- `lang/en.json`

Additional local files inspected read-only:

- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- `services/*.html`
- `admin-posts.html`
- `admin-comments.html`
- `admin-management.html`
- `admin-mnr.html`
- `404.html`
- `ops-login.html`
- `ops/index.html`
- `tools/device-preview.html`
- `game.brkovic.ltd/public/index.html`
- `game.brkovic.ltd/public/play/watch-officer/index.html`
- `js/language.js`
- `js/main.js`
- `js/form.js`
- `js/journal.js`
- `js/navdesk.js`
- `js/admin-posts.js`
- `js/admin-comments.js`
- `js/management.js`
- `js/admin-management.js`
- `js/delivery-calculator.js`
- `data/journal-public.json`
- `admin-api-proxy.php`
- `docs/brkovic_ltd_project_office/reports/seo-i18n-audit-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md`
- `docs/brkovic_ltd_navdesk_audit_2026-05-25.md`
- `docs/brkovic_ltd_journal_audit_2026-05-25.md`
- `docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md`

## Diagnostics Run

- `git status --short --branch`
- `rg --files -g '*.html' -g 'js/*.js' -g 'lang/*.json' -g 'data/*.json'`
- `rg -n "data-i18n|placeholder=|aria-label=|title=|alt=|meta name=\"description\"|og:|twitter:" -g '*.html'`
- `rg -n "navigator.share|clipboard|Notification|window.print|PDF|Поделиться|Печать" js/*.js *.html services/*.html`
- `rg -n "titleEn|contentEn|excerptEn|seoTitleEn|seoDescriptionEn|translation|lang|collection" admin-posts.html js/admin-posts.js js/journal.js data/journal-public.json`
- `node` JSON parse and key comparison for `lang/ru.json` and `lang/en.json`
- `node` HTML `data-i18n*` reference inventory
- `node` placeholder / aria-label / title / alt inventory
- `node` JS translation key scan for `t("...")` references
- `node` rough JS hardcoded Cyrillic inventory by file

## Language Infrastructure Findings

### `lang/*.json`

`lang/ru.json`:

- scalar keys: 803
- empty values: 4
- empty keys:
  - `hero_highlight_1_title`
  - `hero_highlight_2_title`
  - `navdesk_route_search_placeholder_empty`
  - `navdesk_route_search_result_empty`

`lang/en.json`:

- scalar keys: 803
- empty values: 4
- empty keys are the same as RU.

Key parity:

- missing in EN: 0
- missing in RU: 0
- identical values: 47

The identical values are mostly acceptable brand terms, abbreviations, placeholders, route names and radio/navigation words, but they still need glossary review before many-language expansion.

Key buckets by prefix in `ru.json`:

- `ym`: 183
- `navdesk_ukv`: 138
- `service_page`: 87
- `journal`: 73
- `navdesk_route`: 54
- `delivery`: 41
- `navdesk`: 38
- `navdesk_tides`: 33

Conclusion: the JSON layer has grown organically but is usable. It should be split later by domain or at least governed by naming rules, because one flat 803-key file will become difficult with many languages.

### `js/language.js`

Current behavior:

- supported languages are hardcoded to `["ru", "en"]`;
- initial language comes from `?lang=`, localStorage, or browser language;
- browser translation is blocked through `translate="no"`, `notranslate`, and Google notranslate meta;
- `data-i18n`, `data-i18n-option`, and `data-i18n-placeholder` are applied;
- `document.title` and meta description can be applied through `data-i18n-title` / `data-i18n-description`.

Gaps:

- no support for `data-i18n-aria-label`, `data-i18n-title-attr`, `data-i18n-alt`;
- Open Graph/Twitter metadata are not handled;
- language list is not data-driven;
- fallback is silent when a key is missing;
- missing JS `t()` keys can still appear because not all runtime strings are in JSON.

### HTML Pages With Language Layer

Pages using `language.js` and `data-i18n*`:

- `index.html`
- `journal.html`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- all six public service pages

HTML `data-i18n*` references:

- `data-i18n`: 1078
- `data-i18n-option`: 10
- `data-i18n-title`: 12
- `data-i18n-description`: 6
- `data-i18n-placeholder`: 38
- unique keys used in HTML: 599
- missing keys in RU/EN JSON: 0

Pages without the public language layer:

- `404.html`
- `admin-posts.html`
- `admin-comments.html`
- `admin-management.html`
- `admin-mnr.html`
- `tools/device-preview.html`
- `ops-login.html`
- `ops/index.html`
- `game.brkovic.ltd/public/*`

This is acceptable for admin/local tools in MVP, but admin strings are still localization surfaces because future multilingual journal work lives there.

## Hardcoded Visible UI Text

### Public Pages

`index.html`:

- strong key coverage for hero, services, destinations, contact form and footer;
- hardcoded language-neutral items remain: `EN`, `RU`, `IYT`, `Sail Skill`, messenger names, brand/copyright lines;
- `aria-label` values are hardcoded in English.

Service pages:

- visible service copy is mostly key-based;
- hero image `alt` values are hardcoded English;
- mobile dock messenger labels are partly hardcoded;
- footer map labels are key-based, but `aria-label` values are English hardcoded.

`journal.html`:

- shell/footer/filter labels are key-based;
- detail entries and collections are rendered by `js/journal.js`;
- admin links (`admin-post`, `admin-comment`) are hardcoded and should remain protected/admin-aware, not accidentally localized into public CTA copy.

`404.html`:

- English-only static page;
- no `language.js`, no `data-i18n`;
- acceptable as a small MVP utility page, but should be localized if public 404 quality matters.

### Admin Pages

`admin-posts.html`:

- Russian-only UI by design today;
- all labels, buttons, statuses and collection editor copy are hardcoded;
- advanced area contains fixed RU/EN fields:
  - `titleRu`, `titleEn`
  - `excerptRu`, `excerptEn`
  - `contentRu`, `contentEn`
  - `seoTitleRu`, `seoTitleEn`
  - `seoDescriptionRu`, `seoDescriptionEn`
- media editor has `Alt RU` and `Alt EN`;
- multipage collection editor is RU-first but not many-language capable in UI.

`admin-comments.html`:

- Russian-only moderation labels/statuses;
- public-language impact is indirect through comment state and status messages.

`admin-management.html` and `admin-mnr.html`:

- Russian-only operational admin;
- many contract/proforma fields and placeholders are hardcoded;
- this is outside the journal language desk, but generated documents are customer-facing and should have their own localization model later.

## Generated JS Text

Runtime strings are a major localization surface.

Rough hardcoded Cyrillic inventory by JS file:

- `js/navdesk.js`: 17985 Cyrillic characters
- `js/admin-management.js`: 8176
- `js/admin-posts.js`: 2521
- `js/management.js`: 741
- `js/journal.js`: 736
- `js/admin-comments.js`: 471
- `js/delivery-calculator.js`: 306
- `js/main.js`: 57

Important generated-string areas:

- status messages;
- validation errors;
- empty states;
- buttons added by JS;
- summary labels;
- live watch state;
- GPS status;
- reminder/notification status;
- share text;
- print/PDF document text;
- copied text attribution;
- prompt/confirm dialogs in admin;
- generated HTML fragments.

### JS `t()` Key Gaps

Unique JS `t(...)` / i18n-like references found: 89. Missing from both `ru.json` and `en.json`: 23.

Notable missing keys:

- `journal_comment_email`
- `journal_group_eyebrow`
- `journal_load_error`
- `journal_loading`
- `journal_read_less`
- `journal_read_more`
- `copyDone`
- `copyEmpty`
- `time`
- `days`
- `hours`
- `minutes`
- `distance`
- `fuel`
- `withReserve`
- `done`
- `notEnough`
- `invalid`
- `idle`
- `tideNoData`
- `tidePlaceholder`
- `tideWindow`
- `tideWindowStatusIdle`

Some of these are currently served by local dictionaries inside `js/navdesk.js`, but they are still outside the shared JSON rule. The next implementation pass should decide whether NavDesk keeps module-local dictionaries or moves these into `lang/*.json` under stable prefixes.

## Hidden / Accessibility Text

### Placeholders

HTML placeholders found:

- `navdesk.html`: 65 placeholders, 18 with `data-i18n-placeholder`
- `navdesk-ukv.html`: 38 placeholders, 16 with `data-i18n-placeholder`
- `navdesk-route.html`: 16 placeholders, 2 with `data-i18n-placeholder`
- `navdesk-watch.html`: 10 placeholders, 0 with `data-i18n-placeholder`
- `navdesk-tides.html`: 1 placeholder, 0 with `data-i18n-placeholder`
- admin pages: hardcoded Russian placeholders
- delivery calculator: 4 placeholders, 2 localized

Risk:

- placeholders often include user guidance, not just examples;
- mixed language placeholders like `Kotor - Bar, night passage`, `NW 12 kn, sea slight`, `Porto Montenegro, Tivat...` may be acceptable nautical shorthand, but should be glossary-controlled.

### ARIA Labels

`aria-label` is mostly hardcoded:

- topbars: `Language switcher`, `Instagram`, `VETUS NAUTA - Brkovic home`;
- footer nav: `Services`, `Leisure and practical tools`;
- NavDesk: `Screen mode`, `Дневной режим`, `Ночной режим`;
- admin: `Разделы админки`, `Закрыть`, `Группы услуг`;
- journal: `Practical tools`, `Open Nav Desk`, `Journal filters`.

Risk:

- screen reader language can mismatch the active UI language;
- day/night labels are Russian even when page starts as English;
- current `language.js` cannot localize `aria-label`.

### Title Attributes

Only notable public `title` attributes are NavDesk theme buttons:

- `Дневной режим`
- `Ночной режим`

These should become icon-first but localized for accessibility. The visible UI can stay icon-only; the hidden labels must follow current locale.

### Alt Text

Static images have alt attributes, but they are hardcoded:

- logo alt: brand text;
- main hero photo alt;
- service hero image alt values in English;
- Yacht Management hero alt.

Journal media already carries `altRu` / `altEn` in data and admin, but future languages must move to media translation rows instead of adding `altFr`, `altDe`, etc.

## Meta / SEO-Adjacent Text

This overlaps with SEO/I18N, so this report only marks localization surfaces.

Findings:

- Service pages use `data-i18n-title` and `data-i18n-description`, and have canonicals.
- NavDesk pages use `data-i18n-title`, but their meta descriptions are static and often mixed RU/EN.
- `index.html` has static title/description and no `data-i18n-title` / `data-i18n-description`.
- `journal.html` has static generic title/description; detailed entries are JS-rendered.
- No checked public page has OG/Twitter metadata.
- No checked public page has hreflang.
- No checked public page has JSON-LD.

Localization consequence:

- For user-facing i18n, current client switch can work.
- For real multilingual SEO, each language needs crawlable URLs/static exports/server-rendering and localized metadata. Client-only switching is not enough.

## Print / PDF / Share / Notification Text

### NavDesk Watch Log

`js/navdesk.js` generates:

- A4 watch schedule document;
- separate watch entries sheet;
- print button statuses;
- PDF instruction status;
- share payload text;
- localStorage save messages;
- GPS messages;
- reminder and browser Notification text;
- signed watch rows;
- rest control rows.

Current print/share labels are Russian/mixed:

- `Вахтенный журнал`
- `Лист вахтенных записей`
- `Переход / маршрут`
- `Старт LT`
- `Длительность`
- `UTC offset`
- `Режим`
- `Тип вахты`
- `Капитан`
- `Первый помощник`
- `Экипаж`
- `Подписанные смены`
- `Контроль отдыха`
- footer: `Have a good watch Captain!`

These are product outputs, not internal UI. They need localized templates, not ad hoc string replacement.

### Yacht Management Documents

`js/management.js` and `js/admin-management.js` generate customer-facing proforma/contract-like documents. Some strings choose RU/EN by `currentLang()`, but many admin-generated contract/proforma phrases are hardcoded in Russian or English. This should be a separate document-localization phase.

### Journal Share / Copy

`js/journal.js` uses:

- `navigator.share`;
- clipboard fallback;
- copied-text attribution;
- rights notice;
- comment form placeholders;
- like/comment/share labels.

Some keys exist (`journal_share`, `journal_shared`, `journal_copy_source`, `journal_copy_rights`, `journal_rights_notice`), but others rely on fallback strings and missing keys such as `journal_comment_email`.

## NavDesk Special Localization Rules

NavDesk must remain a special surface:

- day/night switch is icon-driven and should stay compact;
- the hidden labels for sun/moon must localize;
- disclaimer must remain localized and must preserve TTL behavior;
- `body.navdesk-theme-night` / `body.navdesk-theme-day` must not be treated as language modes;
- NavDesk print/PDF documents are localized outputs;
- maritime terms must be locale-specific.

### Day/Night

Current visible control is icon-based, which is good for space and cross-language use. Hidden text is hardcoded:

- `Screen mode`
- `Дневной режим`
- `Ночной режим`

Needed:

- keys for theme group aria-label;
- keys for day/night aria-label and title;
- avoid visible text expansion in header.

### Disclaimer

The modal text is already key-based:

- `navdesk_modal_title`
- `navdesk_modal_text`
- `navdesk_modal_accept`

The TTL logic lives in `js/navdesk.js` and must remain intact. Translation fixes must not change consent storage semantics.

### Watch Terminology

Recent correction preserved the important rule:

- Russian slang "собака" / pre-dawn watch should not be blindly mapped to English `dog watch`;
- English `dog watch` often means 16:00-20:00 split watch;
- visible UI should not show slang labels unless owner approves;
- internal marker can stay neutral, e.g. `is-pre-dawn-watch`.

Current visible label found in `js/navdesk.js`:

- `Ночь без подвахты`

This needs owner approval before becoming a permanent term. The pre-dawn highlight can remain visual-only.

## Journal / Admin AI Localization Workflow Surfaces

Canonical workflow confirmed from project knowledge and AI architecture report:

1. Owner writes canonical Russian content in admin:
   - title;
   - short description/excerpt;
   - body;
   - photos/media;
   - GPS/geotag metadata;
   - Russian alt/captions;
   - status/publish settings.
2. AI language desk creates structured target-language drafts later.
3. AI output preserves:
   - post/collection structure;
   - media order;
   - captions and alt;
   - SEO fields;
   - slugs/URL decisions where approved;
   - publication state;
   - comments/likes/share associations.
4. Generated language versions default to draft/needs-review.
5. No generated translation publishes itself automatically.
6. Owner review/approval is required.

Current surfaces:

- `admin-posts.html` has Russian canonical fields plus fixed EN fields.
- `js/admin-posts.js` uses legacy RU/EN payload fields.
- `js/admin-posts.js` has browser-side free translation helper using MyMemory, LibreTranslate and Argos OpenTech. This is draft-era only.
- `data/journal-public.json` contains `titleRu/titleEn`, `excerptRu/excerptEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn`, `seoDescriptionRu/seoDescriptionEn`, media `altRu/altEn`.
- `js/journal.js` normalizes public content into `{ ru, en }` fields and has free browser-side fallback translation for missing English.
- Backend reports indicate production schema now has `JournalTranslation` and `JournalMediaTranslation`, but admin translation editing/generation endpoints are a later layer.

Architecture warning:

- Do not add `titleFr`, `titleDe`, `titleIt`, etc.
- Do not keep multiplying per-language fields in admin.
- Do not use browser-side translation services for private/unpublished owner drafts as the final workflow.
- Use translation rows with per-language status, source revision/hash, prompt rules version, glossary version and audit metadata.

### OpenAI Pro / API Implementation Note

Owner has a Pro version of ChatGPT/OpenAI, but project architecture must not confuse:

- a ChatGPT Pro subscription used interactively by the owner;
- an OpenAI API key used by server-side application code.

For admin automation, the safe implementation is:

- OpenAI key stored server-side only;
- no OpenAI key in browser JavaScript;
- no OpenAI key in Git, reports, screenshots or logs;
- admin browser calls the project backend;
- backend performs authenticated generation requests;
- prompt/rules/glossary versions are stored without secrets;
- generated text remains draft/needs-review until approved.

Decision question for Director/Backend:

- Will the AI language desk use OpenAI API billing through a server-side key, or will the owner continue using ChatGPT Pro manually until API integration is approved?

## Glossary Candidates For Owner Approval

These are candidate terms, not final copy.

| Concept | Russian candidate | English candidate | Note |
| --- | --- | --- | --- |
| watch | вахта | watch | Context-sensitive: duty period, not only "look". |
| watchkeeper | вахтенный | watchkeeper / officer of the watch | Use role based on vessel context. |
| under-watch | подвахтенный | assisting watchkeeper / secondary watch | Needs owner decision; literal "under-watch" is not natural English. |
| watch log | вахтенный журнал | watch log | NavDesk tool/document. |
| ship's log | судовой журнал | ship's log / deck log | Public journal brand currently uses Deck Log. |
| journal entry | запись | journal entry / note | Public style decision needed. |
| post group | группа записей | series / group | Current journal uses groups and collections; distinguish from multipage entry. |
| multipage entry | многостраничная запись | multi-page entry / collection | UI term needs final owner voice. |
| cover | обложка | cover | For multipage journal. |
| chapter | глава | chapter | For book-like journal view. |
| route | маршрут | route | Service/NavDesk context. |
| passage | переход | passage | Better for sea passage than generic route. |
| local time | местное время / LT | local time / LT | Keep LT abbreviation in tables if glossary-approved. |
| UTC offset | смещение UTC | UTC offset | Usually not translated deeply. |
| GPS position | GPS-позиция / позиция | GPS position / position | GPS can remain Latin. |
| course | курс | course / heading | Need distinguish course over ground vs heading later. |
| speed | скорость | speed | Later specify SOG/STW where needed. |
| tide | прилив / уровень воды | tide | In Russian "прилив" may not cover level/window nuance. |
| ebb | отлив | ebb / low water context | Needs context. |
| VHF | УКВ | VHF | Russian interface can use "УКВ"; English should not show UKV. |
| Mayday | Mayday | Mayday | International phrase, do not translate. |
| Pan-Pan | Pan-Pan | Pan-Pan | International phrase, do not translate. |
| Securite | Securite / Sécurité | Securite / Sécurité | Decide spelling with/without accent per UI constraints. |
| pre-dawn watch window | предрассветная ночная вахта / окно 00:00-04:00 | pre-dawn watch window | Do not show slang by default. |
| Russian "собака" | "собака" as internal/slang note only | not equivalent to dog watch | Avoid visible literal label unless owner approves. |
| English dog watch | not Russian "собака" | dog watch, 16:00-20:00 split watch | Locale-specific term; do not map blindly. |
| night without under-watch | ночь без подвахты | night watch without assistant | Needs owner wording approval. |
| radio sheet | radio sheet / лист радиообмена | radio sheet | Mixed phrase currently visible. |

## Owner Decision Questions

1. Which languages are planned after RU/EN, and in what priority order?
2. Is Russian always the canonical source for all public pages, or only for journal/admin content?
3. Should the public default static HTML remain English-first, or should final release become Russian-first with client switch?
4. What is the final public term for `Судовой журнал`: `Deck Log`, `Ship's Log`, `Journal`, or a branded term?
5. Should `Nav Desk` remain as English brand term in all languages, or become `Штурманский стол` in Russian UI and `Nav Desk` in English UI?
6. Should slang/internal watch markers ever be visible to users, or only represented by neutral highlighting?
7. What final Russian label should be used for "night without assisting watchkeeper": `Ночь без подвахты`, `ночная вахта без подвахтенного`, or another owner wording?
8. Should admin pages remain Russian-only because the owner works there, or should helper/admin status UI also become multilingual?
9. Should service page image alt text be translated per language or kept in English for all locales until SEO phase?
10. For many-language journal SEO, what URL strategy is desired: `/ru/...`, `/en/...`, query language, static exports, or server-rendered localized routes?
11. Should OpenAI automation use a server-side OpenAI API key, or remain manual via ChatGPT Pro until backend/API budget and secrets policy are approved?
12. What approval statuses should exist before a language version becomes public/indexable?

## Recommended Implementation Phases

### Phase 1 - Localization Surface Safety Pass

Goal: no interface redesign, no copy rewrite.

- Add support in `js/language.js` for:
  - `data-i18n-aria-label`;
  - `data-i18n-title-attr`;
  - `data-i18n-alt`;
  - maybe `data-i18n-meta-property` later for OG/Twitter.
- Add keys only for hardcoded accessibility labels and placeholders.
- Keep visible owner copy unchanged.
- Localize NavDesk day/night hidden labels while keeping icon UI.
- Add missing JS keys that are already referenced through `t()`.

### Phase 2 - NavDesk Runtime Text Registry

Goal: stabilize the most active tool area.

- Move NavDesk watch log statuses, print labels, share text, GPS messages, reminder messages and table headers into a controlled dictionary.
- Keep a module namespace, e.g. `navdesk_watch_*`.
- Make print/PDF templates locale-aware.
- Preserve disclaimer TTL and day/night behavior.
- Use glossary-approved maritime terms only.

### Phase 3 - Journal/Admin Language Desk Design

Goal: prepare many-language workflow without breaking current RU/EN MVP.

- Keep Russian fast-entry UI first.
- Replace "fixed EN duplicate" mental model with language-version table UI.
- Add per-language statuses: missing, generated, needs review, approved, published/stale/failed.
- Preserve legacy RU/EN fields during transition.
- Use backend translation rows, not `titleFr/titleDe/...`.
- No OpenAI key in browser.

### Phase 4 - SEO/Crawlable Language URLs

Goal: real multilingual indexing.

- Decide URL strategy.
- Generate localized title/description/OG/Twitter/hreflang/canonical per language.
- Make journal entries and multipage collections crawlable by language.
- Do not rely only on client-side JSON switching for SEO.

### Phase 5 - Glossary Governance

Goal: prevent terminology drift across many languages.

- Create `docs/.../glossary` or a structured JSON/MD glossary.
- Store term, locale, context, approved owner wording, forbidden literal translations.
- Use the glossary in AI prompts and human review.

## Priority Findings

1. **Good foundation:** RU/EN JSON parity is clean, and public service pages mostly use keys.
2. **Highest localization debt:** `js/navdesk.js` generates too much user-facing text outside JSON.
3. **Highest workflow risk:** admin journal still exposes fixed RU/EN fields and browser-side translation helper, while real plan requires many-language server-side AI workflow.
4. **Accessibility gap:** `aria-label`, `title`, `alt` and many placeholders are not localizable through the current language engine.
5. **Terminology risk:** maritime terms such as watch/dog watch/under-watch/VHF/Mayday/Pan-Pan/Securite must be approved per locale.
6. **SEO boundary:** Localization can improve user UI now, but real multilingual SEO needs crawlable language URLs and localized metadata.

## No-Code-Change Confirmation

This task created only this report:

```text
docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md
```

Preserved:

- product code not edited;
- `lang/ru.json` and `lang/en.json` not edited;
- Russian author voice not rewritten;
- SEO metadata not changed;
- production, FTP, backend, database and secrets not touched.
