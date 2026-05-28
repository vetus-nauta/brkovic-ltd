# Language Sprint 02 Risk Map - 2026-05-28

**Task:** `BRK-MVP-LOC-009`  
**Role:** Localization Architect  
**Status:** For Director review  
**Scope:** report-only risk map before the next frontend i18n layer  
**Product code:** untouched by this report  
**Production / FTP / backend / OpenAI:** untouched

## 1. Director Summary

The next language sprint must move by risk class, not by file order.

The site already has a useful `en/ru` dictionary layer, but the remaining language surface is mixed:

- safe interface labels and statuses;
- owner-authored journal and service voice;
- NavDesk safety/navigation terms;
- radio and emergency phrase output;
- disclaimers;
- commercial/pricing documents;
- print/PDF documents;
- SEO metadata and future URL decisions;
- backend/admin language-desk fields.

Important decision:

Do not translate or activate `de`, `it`, `es`, `sr`, `zh` yet. The current public UI remains `en` primary plus `ru` active. Future languages remain planned/disabled until content, URL, SEO, backend/admin and QA gates exist.

## 2. Sources Reviewed

Required product files:

- `js/journal.js`
- `js/navdesk.js`
- `js/management.js`
- `js/delivery-calculator.js`
- `js/main.js`
- `js/form.js`
- active public HTML pages using `data-i18n`

Related reports used:

- `reports/localization-page-readiness-step2-2026-05-28.md`
- `reports/navdesk-maritime-glossary-2026-05-28.md`
- `reports/static-unused-key-classification-2026-05-28.md`
- `reports/journal-localization-work-order-2026-05-28.md`
- `director-reports/2026-05-28-language-sprint-02-launch.md`

Read-only diagnostics:

- Cyrillic/runtime string scan in target JS files.
- `data-i18n` count by active page.
- SEO/admin field scan for `titleRu/titleEn/contentRu/contentEn/seoTitle/seoDescription/altRu/altEn`.
- print/share/GPS/NavDesk safety scan.

Observed rough scale:

- `js/navdesk.js` is the largest remaining runtime language surface by far.
- `js/journal.js` has already had one safe UI layer moved into dictionaries, but some statuses and fallback labels remain.
- `js/management.js` and `js/delivery-calculator.js` contain commercial/pricing helper text and print/document language.
- `js/form.js` is mostly already key-based.
- Static pages have substantial `data-i18n` coverage, but metadata, alt text and generated JS output are not fully governed.

## 3. Risk Buckets

| Bucket | Meaning | Current examples | Action |
| --- | --- | --- | --- |
| Safe UI | Buttons, labels, aria labels, simple loading/empty states | journal lightbox, menu labels, form statuses, non-document helper labels | Frontend may move to dictionary if exact EN/RU text is preserved. |
| Owner voice | Authorial / editorial / brand-positioning prose | journal posts, hero/service positioning, “личная экспертиза” style copy | Locked. Requires owner meaning approval before rewrite or target-language generation. |
| Safety/navigation | Navigation calculations, GPS, tides, route, rest-control warnings | NavDesk route/tides/watch formulas, GPS statuses, rest-control notes | Specialist/localization review before public target languages. Exact UI extraction allowed only after risk check. |
| Radio/emergency | VHF, Mayday, Pan-Pan, Sécurité, distress/urgency/safety templates | `navdesk-ukv.html`, UKV generators in `js/navdesk.js` | Locked phrase registry needed. Do not free-translate generated radio output. |
| Legal/disclaimer | Site/NavDesk/management disclaimers and copyright notices | NavDesk common disclaimer, journal rights notice, management disclaimer | Locked wording. No AI rewrite. |
| Commercial/pricing | Prices, estimate scope, proforma, client request text | Yacht Management calculator/documents, delivery crew assumptions | Exact extraction only; no meaning rewrite without owner/commercial review. |
| Print/PDF document | Any printable record/report | watch log A4, route print, tide graph, management proforma | Treat as document templates. Need print QA and terminology approval. |
| SEO | Titles, descriptions, schema, canonical/hreflang, slugs | HTML meta, journal SEO fields, future localized URLs | SEO Director owns. Do not add `hreflang` yet. |
| Backend/admin language-desk | Translation workflow and journal admin fields | `admin-posts.html`, `titleRu/titleEn`, media `altRu/altEn` | Backend/Admin sprint. Do not add `titleDe`, etc. |

## 4. File-Level Map

### `js/journal.js`

Current state:

- A safe JS UI layer has already been moved to dictionary keys in `FE-017`.
- Journal content remains API/data driven through legacy RU/EN fields.
- The local snapshot still uses `titleRu/titleEn`, `contentRu/contentEn`, `altRu/altEn`.

Safe next candidates:

- comment submitting status;
- small fallback placeholders where dictionary keys already exist;
- aria/status labels if exact text is preserved.

Locked:

- journal post text;
- journal excerpts;
- SEO titles/descriptions;
- media alt/caption content;
- collection/multipage editorial text;
- rights/copyright wording unless exact extraction only.

Decision:

Continue only with safe UI extraction. Journal content translation belongs to the future backend/admin language desk, not frontend JSON patches.

### `js/navdesk.js`

Current state:

- Largest mixed-risk file.
- Contains quick calculator statuses, tides logic, route calculations, UKV/radio generators, watch-log scheduling, GPS, signed-watch storage, print/PDF templates and educational/glossary data.

Safe next candidates:

- pure UI statuses and button-like labels that do not change formulas or document output;
- simple `loading`, `empty`, `copied`, `open/close`, `manual/auto` labels;
- accessibility labels if they are not part of printed/safety output.

Locked:

- NavDesk disclaimer;
- tide formula wording and safe-window conclusions;
- route print note and route report labels;
- watch signed document and rest-control text;
- GPS warnings that affect safety expectations;
- UKV/radio generated output;
- emergency phrase examples;
- hidden technical glossary terms until glossary is approved.

Decision:

Do not run a broad NavDesk i18n sweep. Break into separate sub-sprints:

1. common shell UI;
2. tides UI shell only;
3. route UI shell only;
4. watch UI shell only;
5. UKV UI shell only;
6. print/PDF documents after terminology lock;
7. radio/emergency after phrase registry.

### `js/management.js`

Current state:

- Contains Yacht Management calculator, commercial estimate, request message, proforma/demo documents and print preview.
- Many strings are already key-backed, but print/document and request text still include direct RU/EN branches.

Safe next candidates:

- exact extraction of button labels such as `Print` / `Close`;
- exact extraction of non-document statuses already mirrored in EN/RU.

Locked:

- request message body;
- monthly/one-time proforma wording;
- net/VAT wording;
- selected-scope labels;
- base management description;
- any price/scope/commercial promise.

Decision:

Commercial/document text needs a separate Yacht Management localization review. Do not fold it into the generic UI sprint.

### `js/delivery-calculator.js`

Current state:

- Smaller and easier than NavDesk.
- Contains delivery calculator helper text and crew assumptions.
- It is commercial/service-adjacent, but current EN/RU text already exists in exact parallel.

Safe next candidates:

- exact extraction of calculation speed label;
- exact extraction of empty-distance status;
- exact extraction of fuel summary fragments;
- exact extraction of crew helper text only if wording is preserved exactly.

Locked:

- rates;
- distance/fuel formulas;
- any new service promise or crew obligation;
- route/delivery liability language.

Decision:

Good candidate for the next controlled frontend slice because it is small. Frontend must preserve exact current text and only move it into dictionaries.

### `js/main.js`

Current state:

- Mostly site behavior.
- One Russian CV request message is generated into the contact form.

Safe next candidates:

- exact extraction into dictionary if the owner wants the same behavior by language.

Locked:

- CV request wording is owner/business communication. Do not rewrite.

Decision:

Defer unless doing a contact-form micro-slice.

### `js/form.js`

Current state:

- Mostly already key-based through `t(...)`.
- Mailto fallback uses dictionary keys.

Safe next candidates:

- low priority; use diagnostics only.

Locked:

- server anti-spam and form transport behavior.

Decision:

No immediate frontend work needed.

## 5. Static HTML With `data-i18n`

Read-only count by active page:

| Page | `data-i18n` references | Risk note |
| --- | ---: | --- |
| `index.html` | 92 | Marketing/SEO/owner voice risk despite strong key coverage. |
| `journal.html` | 25 | Shell only; content comes from API/snapshot. |
| `navdesk.html` | 310 | Hub plus legacy embedded NavDesk pieces; do not broad-sweep. |
| `navdesk-watch.html` | 23 | Much watch UI remains hardcoded in HTML/JS; safety/document risk. |
| `navdesk-tides.html` | 66 | Formula/disclaimer/report risk. |
| `navdesk-route.html` | 76 | Route calculations and print/PDF risk. |
| `navdesk-ukv.html` | 186 | Radio/emergency phrase risk. |
| `navdesk-english.html` | 23 | Learning page; English remains lesson object. |
| `services/yacht-management.html` | 150 | Commercial/pricing/document risk. |
| `services/yacht-acceptance-delivery.html` | 39 | Delivery calculator/commercial risk. |
| `services/iyt-training.html` | 18 | Brand/training claims risk. |
| `services/sailing-tours.html` | 16 | Tourism/service promise risk. |
| `services/skipper-service.html` | 16 | Service/legal expectation risk. |
| `services/yacht-registration.html` | 16 | Authority/document process risk. |

Conclusion:

`data-i18n` coverage does not mean translation readiness. It only means the shell can be swapped. Meaning, SEO and safety gates still apply.

## 6. SEO And Future Languages

Current rule remains:

- English is primary public language.
- Russian is active and also the journal authoring source.
- `de`, `it`, `es`, `sr`, `zh` remain planned/disabled.

Do not add:

- `hreflang`;
- localized slugs;
- generated target-language JSON files;
- target-language menu activation;
- sitemap language URLs;
- public indexable translated pages.

SEO Director must approve:

- URL model;
- canonical strategy;
- page intent per language;
- metadata per page/language;
- schema strategy;
- sitemap/robots updates.

## 7. Backend/Admin Language Desk Boundary

Do not expand the legacy journal model with fields like:

- `titleDe`
- `titleIt`
- `titleEs`
- `titleSr`
- `titleZh`

Correct future model remains row-based:

- `JournalTranslation`
- `JournalMediaTranslation`
- translation/review/SEO status per language
- source revision hash
- prompt/glossary/model metadata
- owner approval gates

Frontend may display approved translations later, but admin/backend owns generation, review, storage and publication.

## 8. Next Controlled Work Order

Recommended next sprint slices:

1. `FE-018`: exact-text extraction for the smallest safe frontend layer:
   - leftover journal comment submitting status;
   - delivery calculator helper/status text;
   - no commercial rewrite, no formula change.
2. `QAUX-010`: smoke `journal.html` and `services/yacht-acceptance-delivery.html` in `?lang=en` and `?lang=ru`.
3. `LOC-010`: protected NavDesk phrase registry for route/tides/watch/UKV before any large NavDesk dictionary sweep.
4. `SEODIR`: keep SEO strategy in planning mode until real language URLs exist.

## 9. Stop Rules For Frontend

Frontend must stop and ask before changing:

- Russian owner prose;
- service promises or commercial terms;
- journal content or SEO fields;
- NavDesk disclaimer;
- radio/emergency output;
- tide/depth/route formulas;
- signed watch and rest-control document wording;
- print/PDF document language;
- future language availability.

## 10. Decision

`LOC-009` is complete enough to unblock the next controlled frontend slice.

Approved direction:

- Continue with exact-text UI extraction only.
- Keep future languages disabled.
- Keep NavDesk safety/radio/document layers out of the generic sprint until terminology is locked.
