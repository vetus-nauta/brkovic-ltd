# Journal Localization Work Order - 2026-05-28

**Task:** `BRK-MVP-LOC-003`
**Chat ID:** `CHAT-BRK-LOC-001`
**Role:** Localization Architect
**Status:** ready for Director review
**Scope:** documentation-only work order for future Ship Journal translations

## Summary

The current Ship Journal public snapshot is a RU/EN legacy compatibility layer:

- `data/journal-public.json` contains 4 published journal entries.
- Every entry has `titleRu/titleEn`, `excerptRu/excerptEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn`, and `seoDescriptionRu/seoDescriptionEn`.
- Every entry has 1 media item.
- Media has only `altRu/altEn` fields in the snapshot; there are no caption fields.
- 3 of 4 media items have both RU and EN alt text; 1 media item has no RU or EN alt text.
- `js/language.js` supports only `ru` and `en`, hardcoded as `["ru", "en"]`.
- `lang/ru.json` and `lang/en.json` are the current public interface language files.

I did not find an explicit approved list of all future project target languages in the required project documents. Therefore no final target-language list is invented here. This is a Director/owner blocker before any translation generation package is created.

Correct future destination remains `JournalTranslation` and `JournalMediaTranslation`, or a compatible entity/language row model. Do not add fields such as `titleFr`, `titleDe`, `altIt`, etc.

## Files Scanned

Mandatory operating and office sources:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `docs/brkovic_ltd_project_office/README.md`
- `docs/brkovic_ltd_project_office/office-discipline.md`
- `docs/brkovic_ltd_project_office/chat-registry.md`
- `docs/brkovic_ltd_project_office/task-registry.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/README.md`
- `docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0003-journal-translation-work-order.md`

Required reports and knowledge sources:

- `docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/seo-i18n-audit-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md`
- `docs/brkovic_ltd_project_knowledge.md`
- `docs/brkovic_ltd_journal_audit_2026-05-25.md`

Journal/frontend/language sources:

- `data/journal-public.json`
- `js/journal.js`
- `js/admin-posts.js`
- `js/language.js`
- `lang/ru.json`
- `lang/en.json`

Diagnostics used:

- `git status --short --branch`
- `rg` searches for approved/target language lists in project docs
- `node` JSON parse inventory for `data/journal-public.json`
- `node` key summary for `lang/ru.json` and `lang/en.json`
- read-only `sed`/`rg` inspection of journal/admin language paths

## Current Journal Entry Inventory

| id | slug | status | titleRu | titleEn | excerpt | content | media count | media alt/caption status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `11718191-e852-4db4-84fe-02b09e6ab717` | `uvazhenie-k-moryu` | `PUBLISHED` | `Море не терпит лишнего` | `The Sea Does Not Tolerate Excess` | RU yes, EN yes | RU yes, EN yes | 1 | media `23a921e5-b093-4431-81dd-54f9bd492bc0`: alt RU yes, alt EN yes, caption fields absent |
| `9afd0cd1-d55d-440a-b39f-623847d8fd7f` | `nikto-ne-vladeet-morem` | `PUBLISHED` | `Никто не владеет морем` | `Nobody Owns the Sea` | RU yes, EN yes | RU yes, EN yes | 1 | media `376b48c4-1b4b-4f36-b62f-167a63bec459`: alt RU yes, alt EN yes, caption fields absent |
| `edf204bf-ee53-4b04-972a-b36dd2dee14a` | `More-ne-lyubit-spektakl` | `PUBLISHED` | `Море не любит спектакль` | `The Sea Does Not Like Performance` | RU yes, EN yes | RU yes, EN yes | 1 | media `dedbb639-c7c1-414f-9b64-8dba15fd0a82`: alt RU no, alt EN no, caption fields absent |
| `438c2da7-d1e6-4a16-bb77-429e82ffd10f` | `more-ne-lyubit-spektakl-part2` | `PUBLISHED` | `Море не любит спектакль. Часть 2` | `The Sea Does Not Like Performance. Part 2` | RU yes, EN yes | RU yes, EN yes | 1 | media `a45fe69a-f628-491f-8090-fb0eb85cc039`: alt RU yes, alt EN yes, caption fields absent |

Additional structure found in the snapshot:

- `uvazhenie-k-moryu` belongs to group `sea-talk`; group `titleRu` is `sea-talk`, `titleEn` is null.
- `More-ne-lyubit-spektakl` and `more-ne-lyubit-spektakl-part2` belong to group `sea-roles`; group titles are RU `Роли в море` and EN `Sea roles`.
- No collection/multipage collection payload is present in `data/journal-public.json`; current collection support is a future/live API shape, not represented in this local snapshot.

## Current RU/EN Status

Current implemented public language fact:

- Public UI language switch supports `ru` and `en` only.
- `lang/ru.json` and `lang/en.json` each contain 803 keys; both include 73 `journal*` keys.
- Journal public data exposes RU/EN legacy content fields directly.
- `js/journal.js` normalizes public entries into `{ ru, en }` objects for title, excerpt, text, group title/description, and media captions.
- `js/journal.js` derives media caption from `altRu/altEn`; the snapshot does not provide separate caption fields.
- `js/journal.js` and `js/admin-posts.js` contain browser-side free translation helpers for EN draft-era convenience.
- `js/admin-posts.js` currently saves legacy RU/EN fields and media `altRu/altEn`.

Current language versions already in the snapshot:

- RU exists for all 4 entries: title, excerpt, content, SEO title, SEO description.
- EN exists for all 4 entries: title, excerpt, content, SEO title, SEO description.
- Media EN alt exists for 3 of 4 media items.
- Media RU alt exists for 3 of 4 media items.
- Media captions do not exist as separate fields.
- `shareExcerpt` does not exist in the snapshot.
- No translation status, owner approval status, source revision hash, glossary version, model, or generation metadata exists in the snapshot.

## Approved Target-Language Findings

I found current implemented public languages: `ru` and `en`.

I did not find an explicit project document that says "all approved project languages are: ..." or gives a final ordered target-language list for future journal translation.

Relevant project-document findings:

- Localization inventory asks: "Which languages are planned after RU/EN, and in what priority order?"
- AI multilingual architecture uses "target language multi-select" and "many target languages", but does not name a final approved list.
- Backend/Admin audit describes target language list input for a future server-side endpoint, but does not approve the list.
- Project knowledge states that the journal will become multilingual through AI drafts, but does not name the languages.

## Blocker

**Blocker:** approved target-language list is missing.

Director/owner must approve:

- target language codes;
- human-readable language names;
- priority/order for first generation;
- whether current EN is considered approved, legacy, needs review, or to be regenerated;
- whether any language is public/indexable at launch or only internal draft.

Until this is decided:

- do not generate translation JSON;
- do not create bulk draft package files;
- do not add language-specific fields to frontend/admin code;
- do not publish or index any generated translation;
- do not choose localized slugs.

## Per-Entry Translation Field Checklist

Every journal post language row needs these fields:

- `title`
- `excerpt`
- `content`
- `seoTitle`
- `seoDescription`
- `shareExcerpt`
- `localizedSlug` only if SEO/I18N approves localized slugs and URL strategy
- `translationStatus`
- `seoStatus`
- `indexingAllowed`
- `sourceLanguage`
- `sourceRevisionHash`
- audit fields: `promptRulesVersion`, `glossaryVersion`, `model`, `generatedAt`, `reviewedAt`, `approvedAt`, `approvedBy`, `lastError`

Per current entry:

| slug | title | excerpt | content | SEO title/description | share excerpt | localized slug | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `uvazhenie-k-moryu` | translate per target language | translate per target language | translate per target language | translate per target language | create per target language | blocked until SEO/I18N approve | Group `sea-talk` also needs owner decision if group metadata becomes public language content. |
| `nikto-ne-vladeet-morem` | translate per target language | translate per target language | translate per target language | translate per target language | create per target language | blocked until SEO/I18N approve | Single post in snapshot. |
| `More-ne-lyubit-spektakl` | translate per target language | translate per target language | translate per target language | translate per target language | create per target language | blocked until SEO/I18N approve | Media alt missing in RU/EN source, owner should supply Russian alt first. |
| `more-ne-lyubit-spektakl-part2` | translate per target language | translate per target language | translate per target language | translate per target language | create per target language | blocked until SEO/I18N approve | Part of `sea-roles` group. |

For future collections/multipage entries:

- use the same `JournalTranslation` row model for collection cover title/excerpt/content or description;
- include cover media alt/caption via `JournalMediaTranslation`;
- preserve page order, media order, comments/likes/share ownership, and parent collection slug;
- do not translate collection/page structure by creating language-specific duplicate entities unless Backend/Admin explicitly designs that migration.

## Media Alt/Caption Checklist

Media translations must be stored per media/language, not as `altFr`, `captionDe`, etc.

| post slug | media id | source media status | required before generation | future per-language fields |
| --- | --- | --- | --- | --- |
| `uvazhenie-k-moryu` | `23a921e5-b093-4431-81dd-54f9bd492bc0` | alt RU yes, alt EN yes, captions absent | Owner confirms RU alt/caption source, or accepts current RU alt as caption source. | `alt`, `caption`, `translationStatus`, `sourceRevisionHash` |
| `nikto-ne-vladeet-morem` | `376b48c4-1b4b-4f36-b62f-167a63bec459` | alt RU yes, alt EN yes, captions absent | Owner confirms RU alt/caption source, or accepts current RU alt as caption source. | `alt`, `caption`, `translationStatus`, `sourceRevisionHash` |
| `More-ne-lyubit-spektakl` | `dedbb639-c7c1-414f-9b64-8dba15fd0a82` | alt RU no, alt EN no, captions absent | Owner must add canonical Russian alt and optional caption before translation. | `alt`, `caption`, `translationStatus`, `sourceRevisionHash` |
| `more-ne-lyubit-spektakl-part2` | `a45fe69a-f628-491f-8090-fb0eb85cc039` | alt RU yes, alt EN yes, captions absent | Owner confirms RU alt/caption source, or accepts current RU alt as caption source. | `alt`, `caption`, `translationStatus`, `sourceRevisionHash` |

Rules:

- preserve media order;
- do not invent visual facts not present in media/source metadata;
- captions are editorial text and may differ from accessibility alt;
- if a source caption does not exist, do not silently use generated caption as approved source;
- media translation retry must be possible without overwriting approved post body translations.

## SEO Fields Per Language

Each language version needs its own SEO/editorial metadata:

- `seoTitle`
- `seoDescription`
- `shareExcerpt`
- `seoStatus`: `missing`, `needs_review`, `approved`
- `indexingAllowed`
- OG/Twitter title/description/share image alt when public URL strategy exists
- localized slug only after SEO/I18N approves URL and canonical/hreflang strategy

SEO/I18N constraints from existing reports:

- current client-side language switch is not sufficient for real multilingual SEO;
- crawlable language-specific URLs or static/server-rendered exports are required before hreflang;
- do not add hreflang until language URLs are stable;
- sitemap should include only approved/indexable language URLs;
- generated SEO fields must not be keyword-stuffed or auto-published.

## Proper Destination Model

Use `JournalTranslation` or a compatible entity/language row model for post and collection text.

Minimum shape:

```text
JournalTranslation
- id
- entityType: post | collection
- entityId, or postId/collectionId
- language
- sourceLanguage
- sourceRevisionHash
- title
- excerpt
- content
- seoTitle
- seoDescription
- shareExcerpt
- localizedSlug, only if approved by SEO/I18N
- translationStatus
- seoStatus
- indexingAllowed
- promptRulesVersion
- glossaryVersion
- model
- generatedAt
- reviewedAt
- approvedAt
- approvedBy
- publishedAt
- lastError
```

Use `JournalMediaTranslation` or a compatible media/language row model for media language fields.

Minimum shape:

```text
JournalMediaTranslation
- id
- mediaId
- language
- sourceRevisionHash
- alt
- caption
- translationStatus
- promptRulesVersion
- glossaryVersion
- model
- generatedAt
- reviewedAt
- approvedAt
- approvedBy
- lastError
```

Compatibility rule:

- keep existing `titleRu/titleEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn`, `altRu/altEn` only as MVP compatibility fields during migration;
- future many-language work writes and reads translation rows;
- never add `titleFr/titleDe/titleIt/...` or media equivalents.

## Source Revision Hash Inputs

`sourceRevisionHash` should be computed server-side from a normalized canonical source payload. `updatedAt` alone is not enough.

For a post, include:

- source entity id and slug;
- `sourceLanguage`, expected `ru`;
- `titleRu`;
- `excerptRu`;
- `contentRu`;
- `seoTitleRu`;
- `seoDescriptionRu`;
- source share excerpt if owner later adds one;
- media ids, file paths, sort order, type;
- Russian media alt and caption source;
- group/collection relationship if it changes public meaning;
- collection page order if the post is part of a multipage entity;
- prompt-relevant structure markers, but not comments/likes counts.

For a collection/multipage parent, include:

- collection id and slug;
- cover title/excerpt/content/description;
- cover media id;
- page ids and page order;
- source language;
- Russian cover media alt/caption;
- SEO RU fields when present.

When the hash changes:

- `generated` or `needs_review` rows become `stale` or require regeneration;
- `approved` and `published` rows are flagged `stale`, not overwritten automatically;
- the admin UI must show which fields/languages are stale;
- retry must be per language and per field group where possible.

## Admin Workflow And Approval Status Model

Required status workflow:

```text
missing -> generated -> needs_review -> approved -> published
```

Additional transitions:

```text
generated -> failed
needs_review -> generated, if owner requests regeneration
approved -> stale, when sourceRevisionHash changes
published -> stale, when sourceRevisionHash changes
failed -> generated, after retry
published -> approved, if unpublished but retained as approved text
```

Status definitions:

- `missing`: no row exists for this entity/language.
- `generated`: machine draft exists and passed structural validation.
- `needs_review`: draft is ready for owner/human review.
- `approved`: owner approved the language row, but it is not necessarily public.
- `published`: public/API/indexable only if SEO gate also allows it.
- `stale`: canonical source hash changed after generation/approval/publication.
- `failed`: generation, validation, or persistence failed; store `lastError`.

Owner approval rules:

- Russian source remains canonical and is not rewritten.
- Generated translations never auto-publish.
- Owner can approve, request regeneration, manually edit, publish, unpublish.
- Approved text must not be overwritten by regeneration unless owner explicitly chooses overwrite.
- Browser-side free translation helpers must not be treated as final workflow for private/unpublished content.
- OpenAI/API keys stay server-side only and are never printed, committed, or exposed to browser JS.

Current backend/admin status gap:

- Reports say current backend storage direction has `JournalTranslation` and `JournalMediaTranslation`.
- Backend/Admin audit says current `TranslationStatus` supports `MISSING`, `DRAFT`, `NEEDS_REVIEW`, `PUBLISHED`.
- The required workflow needs either enum expansion or a compatibility mapping for `generated`, `approved`, `stale`, and `failed`.
- Translation editing/generation admin endpoints are not yet implemented in the checked route layer.

## Safe Local Draft Package Format

Do not create this package until Director/owner approves target languages and destination.

Recommended future non-production package root:

```text
docs/brkovic_ltd_project_office/drafts/journal-localization/<YYYY-MM-DD>-<package-id>/
```

Recommended shape:

```text
manifest.json
sources/posts/<post-id>.source.json
sources/media/<media-id>.source.json
drafts/<language>/posts/<post-id>.draft.json
drafts/<language>/media/<media-id>.draft.json
review-log.md
```

`manifest.json` should contain:

```json
{
  "taskId": "BRK-MVP-LOC-003",
  "sourceSnapshot": "data/journal-public.json",
  "sourceLanguage": "ru",
  "targetLanguages": [],
  "status": "blocked_until_target_languages_approved",
  "destinationModel": "JournalTranslation/JournalMediaTranslation",
  "containsPublishedTranslations": false
}
```

Draft files should contain structure only after approval:

- entity id and slug;
- target language;
- `sourceRevisionHash`;
- generated fields;
- media order references;
- generation metadata;
- status `generated` or `needs_review`;
- no production credentials;
- no OpenAI key;
- no auto-publish flag.

This task intentionally did not create the package and did not generate translations.

## Backend/Frontend Dependencies

Localization:

- Own approved target language inventory once Director/owner decides it.
- Own field checklist for text, media, SEO-adjacent copy, glossary and forbidden literal translations.
- Confirm per-language review rules and whether current EN is legacy-approved or needs review.

SEO/I18N:

- Decide URL strategy before localized slugs or hreflang.
- Approve whether localized slugs are allowed.
- Define SEO status gate, canonical/hreflang/sitemap rules, and indexing rules.
- Approve per-language `seoTitle`, `seoDescription`, `shareExcerpt`, OG/Twitter behavior.

Backend/Admin:

- Confirm current production/local backend schema and enum gaps without touching production.
- Validate that translation rows and media translation rows are the official destination.
- Define admin route requirements, auth/session boundary, and server-side AI boundary.
- Confirm legacy RU/EN compatibility read/write rules during migration.

Backend Engineer:

- Implement schema additions for `sourceRevisionHash`, audit metadata, `approved`, `stale`, `failed`, reviewer fields, and SEO status if missing.
- Implement authenticated server-side generation/import endpoints.
- Validate target language codes and structured output before DB writes.
- Ensure retries are per language and cannot overwrite approved text by default.
- Keep OpenAI key server-side only.

Frontend/Admin:

- Replace fixed EN mental model with a language desk UI.
- Keep Russian fast-entry editor first.
- Show per-language statuses: missing, generated, needs review, approved, published, stale, failed.
- Provide per-language editors for title, excerpt, content, SEO fields, share excerpt, and media alt/caption.
- Add preview/diff, approve, regenerate, publish/unpublish actions.
- Do not call OpenAI or final translation services directly from browser JS.

## Owner Decisions Required

1. Approve target language list and priority order.
2. Decide whether current EN is approved, legacy, needs review, or should be regenerated through the future workflow.
3. Decide whether `shareExcerpt` is owner-written in RU first or generated from excerpt with review.
4. Decide whether media captions are distinct from alt text, and add missing Russian alt/caption for `More-ne-lyubit-spektakl`.
5. Ask SEO/I18N to approve or reject localized slugs before any slug generation.
6. Decide whether group metadata such as `sea-talk` and `sea-roles` is a public translation surface or should be replaced by collection/multipage parent metadata.
7. Approve the status vocabulary and whether backend enum expansion is required.
8. Approve the first implementation slice: status readback, manual translation rows, server-side generation, or draft package only.
9. Approve a future draft package destination before any generated translation files are written.

## Production/Database/FTP Untouched Confirmation

Scope preserved:

- Russian source text was not rewritten.
- No generated translations were created.
- No production API was called.
- FTP was not touched.
- Database was not touched.
- Product code was not edited.
- `data/journal-public.json` was not edited.
- `lang/ru.json` and `lang/en.json` were not edited.
- Backend was not edited.
- Secrets, OpenAI keys, cookies, sessions, database credentials, SMTP credentials, FTP credentials and private configs were not read into this report or printed.

Only this report was created:

```text
docs/brkovic_ltd_project_office/reports/journal-localization-work-order-2026-05-28.md
```

## Next Expected

Director/owner review:

- approve the target language list;
- decide how to treat existing EN content;
- assign SEO/I18N URL/slug decision;
- assign Backend/Admin and Backend Engineer to confirm/implement the first safe translation-row slice.
