# AI Multilingual Journal Admin Architecture Marker

**Task:** `BRK-MVP-LANGAI-001`
**Primary owner:** `CHAT-BRK-SEO-I18N-001`
**Required consult:** `CHAT-BRK-BACKEND-001`
**Date:** 2026-05-27
**Status:** Architecture marker preserved for Director/backend review
**Phase:** MVP stabilization, not implementation

## Purpose

This report preserves the multilingual journal architecture so it is not lost during MVP release work.

Non-negotiable product direction:

- Russian journal entry in admin is canonical.
- Owner writes Russian title, short description/excerpt, full text, photos, GPS/geotag metadata, Russian alt and captions.
- A future AI language desk creates structured language duplicates through the owner's OpenAI account.
- Generated translations preserve post structure, media order, SEO fields and status workflow.
- Generated translations are not auto-published.
- Owner approves language versions before publication/indexing.
- Do not rewrite the owner's Russian voice without explicit approval.
- Do not scale by adding fixed fields for every language.
- OpenAI keys stay server-side only, never in browser JavaScript and never in Git.

## Sources Read

- `docs/brkovic_ltd_project_office/cabinets/seo-i18n/task-0002-ai-multilingual-admin-architecture.md`
- `docs/brkovic_ltd_project_office/director-reports/2026-05-27-ai-multilingual-admin-marker.md`
- `docs/brkovic_ltd_project_knowledge.md`
- `docs/brkovic_ltd_journal_audit_2026-05-25.md`
- `docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md`
- `admin-posts.html`
- `js/admin-posts.js`
- `admin-api-proxy.php`
- `js/journal.js`
- `lang/ru.json`
- `lang/en.json`

No production, FTP, backend working copy, database or secret file was changed.

## Current Admin/Frontend State

`admin-posts.html`:

- Admin page is Russian and has `noindex,nofollow,noarchive`.
- Normal post editor already starts with RU fields:
  - `titleRu`
  - `excerptRu`
  - `contentRu`
- Advanced section is labeled `Переводы и SEO` and contains hard-coded EN fields:
  - `titleEn`
  - `excerptEn`
  - `contentEn`
  - `seoTitleEn`
  - `seoDescriptionEn`
- RU SEO fields exist:
  - `seoTitleRu`
  - `seoDescriptionRu`
- Media UI supports:
  - upload
  - GPS rebuild action
  - media reorder
  - `Alt RU`
  - `Alt EN`
- Multipage collection area exists and is RU-first:
  - `collectionTitleRu`
  - `collectionExcerptRu`
  - cover media id
  - page selection/order
  - status/publish fields

`js/admin-posts.js`:

- Uses legacy RU/EN post fields in payloads.
- Has `generateEnglishFields()` and `translateFree()` using browser-side free translation endpoints:
  - MyMemory
  - LibreTranslate
  - Argos OpenTech
- Uses localStorage cache for translation helper results.
- Creates slugs from Russian titles through local transliteration.
- Sets `sourceLanguage: 'ru'` for collection payloads.
- Calls admin collection endpoints through `admin-api-proxy.php`.

`js/journal.js`:

- Public journal normalizes backend posts into `{ ru, en }` fields.
- Media captions derive from `altRu` / `altEn`.
- Has free browser-side fallback translation for missing English public text.
- Public entries are JS-rendered, so final multilingual SEO needs crawlable language URLs or static/server-rendered exports.

Current frontend conclusion:

- The admin is already moving toward fast Russian authoring.
- The current EN generation is a draft-era helper only.
- The current hard-coded RU/EN fields must not become the scalable architecture.

## Current Backend/Schema Assumption

From the 2026-05-25 backend access notes:

- Production backend is separate from this frontend repository.
- Backend stack: NestJS + Prisma + PostgreSQL.
- Production now has:
  - `JournalCollection`
  - `JournalCollectionPage`
  - `JournalTranslation`
  - `JournalMediaTranslation`
  - `Post.sortOrder`
  - `Post.sourceLanguage`
  - `collectionId` on engagement tables
- Public collection endpoints exist and currently return an empty collection array when no collections are published.
- Admin collection endpoints exist behind auth.
- True multilingual translation editing endpoints are still a later layer.

Important compatibility note:

- Legacy fields such as `titleRu/titleEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn` may remain for MVP compatibility.
- New architecture should mirror or migrate into translation rows, not add `titleFr`, `titleDe`, `titleIt`, etc.

## Proposed Data Model Delta

Use or extend the existing backend direction:

### JournalTranslation

One row per entity/language.

Recommended fields:

- `id`
- `entityType`: `post` or `collection`
- `entityId`
- `language`
- `sourceLanguage`
- `sourceRevisionHash`
- `title`
- `excerpt`
- `content`
- `seoTitle`
- `seoDescription`
- `shareExcerpt`
- `slug` or `localizedSlug` if localized URLs are approved
- `translationStatus`: `missing`, `generated`, `needs_review`, `approved`, `published`, `failed`, `stale`
- `seoStatus`: `missing`, `needs_review`, `approved`
- `indexingAllowed`: boolean
- `promptRulesVersion`
- `glossaryVersion`
- `model`
- `generatedAt`
- `reviewedAt`
- `approvedAt`
- `publishedAt`
- `lastError`

### JournalMediaTranslation

One row per media/language.

Recommended fields:

- `id`
- `mediaId`
- `language`
- `sourceRevisionHash`
- `alt`
- `caption`
- `translationStatus`
- `promptRulesVersion`
- `glossaryVersion`
- `model`
- `generatedAt`
- `reviewedAt`
- `approvedAt`
- `lastError`

### Source Revision Tracking

Each Russian canonical post/collection should expose a stable source revision/hash based on:

- Russian title
- Russian excerpt
- Russian body
- media ids/order
- Russian alt/captions
- SEO RU fields
- source language
- relevant structure/page order

When source hash changes:

- approved translations become `stale` or `needs_review`;
- language desk shows which languages need regeneration;
- retry for one language must not overwrite other languages.

## Proposed Admin UI Section

Keep the main admin fast and Russian-first.

Primary editor stays first:

- Russian title
- Russian short description/excerpt
- Russian body
- photo upload
- GPS/geotag tools
- Russian alt and captions
- save draft / publish controls

Add a separate AI language desk after or inside advanced area:

- Target language multi-select.
- "Create/update language versions" action.
- Per-language status badges:
  - missing
  - generated
  - needs review
  - approved
  - published
  - failed
  - stale
- Per-language editor:
  - title
  - excerpt
  - content
  - SEO title
  - SEO description
  - share excerpt
  - media alt/caption list in original media order
- Preview and diff:
  - generated vs previous approved revision
  - generated vs current edited draft
- Owner actions:
  - approve language
  - request regenerate
  - edit manually
  - publish language
  - unpublish language
- Safe retry:
  - retry one language only;
  - retry media captions only;
  - retry SEO fields only;
  - never touch approved text unless owner chooses overwrite.

MVP-safe admin rule:

- Do not force owner to fill translation UI while creating the Russian post.
- Translation desk should show clear "not generated yet" state, not block Russian publishing.

## Proposed Backend Endpoints

Admin endpoints, server-side authenticated:

- `GET /api/admin/posts/:id/translations`
- `GET /api/admin/posts/:id/translations/:language`
- `POST /api/admin/posts/:id/translations/generate`
- `PATCH /api/admin/posts/:id/translations/:language`
- `POST /api/admin/posts/:id/translations/:language/approve`
- `POST /api/admin/posts/:id/translations/:language/publish`
- `POST /api/admin/posts/:id/translations/:language/unpublish`
- `POST /api/admin/posts/:id/translations/:language/regenerate`
- `GET /api/admin/journal-collections/:id/translations`
- `POST /api/admin/journal-collections/:id/translations/generate`
- `PATCH /api/admin/journal-collections/:id/translations/:language`
- `POST /api/admin/journal-collections/:id/translations/:language/approve`
- `POST /api/admin/media/:id/translations/:language`
- `PATCH /api/admin/media/:id/translations/:language`

AI/backend endpoints should:

- use server-side OpenAI credentials only;
- read prompt rules/glossary from versioned server-side files/config without secrets;
- persist generation metadata;
- return status per language, not one all-or-nothing result.

Public endpoints after URL strategy:

- `GET /api/public/journal/:slug?lang=xx` as compatibility API.
- Crawlable public page route/static export for each language before indexing.
- Public payload should expose approved/published translations only.
- Draft/generated/needs-review translations must never leak to public API.

## Prompt And Rules Governance

Versioned prompt/rules files should live in repository without secrets.

Prompt governance should include:

- `promptRulesVersion`
- stable glossary version
- brand names and non-translatable terms:
  - BRKOVIC
  - VETUS NAUTA
  - Sail Skill Association
  - yacht/place/person names
  - nautical abbreviations and radio terms
- voice rule:
  - preserve Russian authorial intent;
  - do not "improve" or rewrite canonical Russian;
  - translate meaning, structure and tone without making marketing copy more generic.
- media rule:
  - keep media order;
  - translate alt/captions based on Russian source and visible media context;
  - do not invent facts not present in source/media metadata.
- SEO rule:
  - each language gets localized SEO title/description/share excerpt;
  - do not keyword-stuff;
  - keep factual service/place terms stable.

Audit fields per generated version:

- model name
- generation time
- prompt rules version
- glossary version
- source revision hash
- generation status
- failure message if failed

## SEO And Hreflang Plan

Real multilingual SEO requires crawlable public URLs, not only client-side language switching.

Before indexing translated journal content, Director/backend should decide:

1. URL pattern:
   - `/journal/<slug>/`
   - `/ru/journal/<slug>/`, `/en/journal/<slug>/`, `/de/journal/<slug>/`
   - or static/exported HTML equivalents.
2. Canonical strategy:
   - canonical per language to itself when language page is public;
   - no canonical collapse from all languages to RU if languages are meant to index separately.
3. Hreflang:
   - only add after language URLs are real and stable;
   - include `x-default` if useful.
4. Indexing gate:
   - each translation needs `translationStatus=approved/published`;
   - `seoStatus=approved`;
   - `indexingAllowed=true`.
5. Social metadata:
   - language-specific title/description/share image/alt.
6. Sitemap:
   - include only approved/indexable language URLs.

MVP conclusion:

- Current client-side RU/EN switch is user-facing i18n, not final multilingual SEO.
- Journal language architecture should be built before promising indexed multilingual journal posts.

## Release-Safe MVP Step

For current MVP stabilization:

- Do not remove legacy RU/EN fields.
- Do not remove the existing EN helper unless a separate implementation task approves it.
- Mark free browser-side translation as draft-era helper, not final architecture.
- Keep admin Russian-first.
- Preserve existing public journal behavior.
- Do not introduce OpenAI keys or AI calls in browser JavaScript.
- Do not add language fields per target language.
- Keep `JournalTranslation` / `JournalMediaTranslation` as the official future direction.
- Let Backend/Admin cabinet validate actual backend routes and schema state before implementation.

Safe next implementation slice after Director approval:

1. Backend/Admin confirms current `JournalTranslation` and `JournalMediaTranslation` models and endpoint gaps.
2. Add read-only translation status display in admin without changing publishing behavior.
3. Add server-side AI generation endpoint behind auth using environment-stored OpenAI key.
4. Add one-language draft generation path, default `needs_review`.
5. Add owner approval action.
6. Only then consider public language URLs/hreflang.

## Risks To Preserve

- Browser-side translation services can leak content to third-party translation APIs and do not provide auditability.
- Browser-side OpenAI use would expose keys; forbidden.
- Auto-publishing generated translations can publish incorrect voice, place names, nautical terms or SEO claims.
- Hard-coded fields per language will break once target languages expand beyond RU/EN.
- Rewriting Russian source text during translation generation would violate owner voice rules.
- Client-only language switching can give a false sense of multilingual SEO readiness.

## Files Changed

Only this report file was created.

## Scope Preserved

- Product code not touched.
- Admin UI not changed.
- Backend not changed.
- FTP/production not touched.
- Secrets/API keys/tokens not accessed for use and not written.
- Russian authorial/marketing text not rewritten.
- Existing dirty worktree changes from other chats not reverted.

## Next Expected

Director review, then Backend/Admin consult:

- Confirm backend schema/endpoints currently available.
- Decide whether the first post-MVP implementation slice is translation status readback or server-side AI draft generation.
- Keep this architecture marker active until AI language desk is implemented and owner-approved.
