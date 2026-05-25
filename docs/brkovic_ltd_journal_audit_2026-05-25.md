# Brkovic LTD Journal Audit — 2026-05-25

## Scope

Аудит проведен для спринта по `journal.html` и `admin-posts.html`: многоязычность, многостраничные записи, порядок записей, RU-first админка и обложка многостраничной записи.

Код не менялся. Это инвентаризация текущего состояния и план безопасной доработки.

## Sources Checked

- Текущий frontend/admin репозиторий: `/home/alexey/GitHub/Revoyacht/brkovic-ltd`.
- Runtime-зеркало: `/home/alexey/Sites/brkovic-local`.
- Git branches/history текущего репозитория.
- Публичный live API: `https://brkovic.ltd/api/public/journal`.
- Live admin API только по статусам без авторизации.

Первичный локальный поиск не нашел FTP-профили, `.netrc`, `lftp`, FileZilla-конфиги и локальные `ftp-*` копии в домашней папке. После того как владелец проекта предоставил доступ 2026-05-25, этот Linux-ПК настроен на постоянный FTP-доступ через локальный `~/.netrc` с правами `600`.

В текущем frontend-репозитории backend журнала не лежит: есть только `admin-api-proxy.php`, который проксирует запросы на `https://brkovic.ltd/api`.

Backend журнала найден на боевом сервере по FTP:

- remote: `/journal-backend`
- local read-only snapshot: `/home/alexey/.local/share/brkovic-ltd/ftp-snapshot/journal-backend`
- stack: NestJS + Prisma + PostgreSQL
- schema: `/journal-backend/prisma/schema.prisma`

Секреты, `.env`, cookies, uploads, logs и `node_modules` в локальный snapshot не копировались.

## Current Frontend/Admin Shape

Main files:

- `journal.html`
- `js/journal.js`
- `css/journal.css`
- `css/journal-single.css`
- `admin-posts.html`
- `js/admin-posts.js`
- `css/admin-posts.css`
- `data/journal-public.json`
- `admin-api-proxy.php`

Current admin endpoints used by `js/admin-posts.js`:

- `GET /admin/posts`
- `POST /admin/posts`
- `GET /admin/posts/:id`
- `PATCH /admin/posts/:id`
- `GET /admin/journal-groups`
- `POST /admin/journal-groups`
- `POST /admin/posts/:id/media`
- `PATCH /admin/posts/:id/media/:mediaId`
- `DELETE /admin/posts/:id/media/:mediaId`
- `PATCH /admin/posts/:id/media/reorder/sort`
- `POST /admin/gps/rebuild`

Live admin endpoints return `401` without session, as expected.

Current public API fields:

- `id`
- `slug`
- `titleRu`
- `titleEn`
- `excerptRu`
- `excerptEn`
- `contentRu`
- `contentEn`
- `status`
- `publishedAt`
- `createdAt`
- `updatedAt`
- `allowComments`
- `allowLikes`
- `isPinned`
- `seoTitleRu`
- `seoTitleEn`
- `seoDescriptionRu`
- `seoDescriptionEn`
- `media`
- `comments`
- `commentsCount`
- `likesCount`
- `groupId`
- `groupOrder`
- `group`

Current live public journal has 4 published posts. One existing group, `Роли в море`, contains two parts. `GET /api/public/journal-collections` currently returns `404`, so collection/multipage API does not exist yet.

Live health check:

- `GET https://brkovic.ltd/api/health` returns `service: ship-journal-backend`, `status: ok`, `database: ok`.

Direct PostgreSQL access from this local PC to the server `5432` port timed out. This matches the server-side `localhost` database model: database work should go through backend code/migrations on the host, not by assuming the database is directly reachable from the workstation.

## Findings

1. Admin content model is hard-coded for RU/EN.

   Current form fields are `titleRu/titleEn`, `excerptRu/excerptEn`, `contentRu/contentEn`, `seoTitleRu/seoTitleEn`, `seoDescriptionRu/seoDescriptionEn`. This will not scale to many languages.

2. Russian is already the practical source language, but the UI does not support that workflow.

   The admin requires the author to see both RU and EN fields during normal entry creation. For writing at sea, the default editor should be RU-first and fast.

3. Free browser-side EN generation exists, but should not be treated as final editorial workflow.

   `js/admin-posts.js` has `generateEnglishFields()` using free translation endpoints. It is useful as a rough helper, but not as the final brand voice or SEO workflow.

4. `admin-posts.html` has malformed media form markup.

   The media upload block contains duplicated closing form tags:

   ```html
   </form></form>
   ```

   This should be corrected early, before expanding the admin UI.

5. Current groups are post wrappers, not true parent entries.

   Public rendering first creates individual post cards with their own actions/comments, then wraps grouped cards into a carousel. That means each part still owns its own like/comment/share block.

6. Multipage post needs a real parent object.

   Hiding duplicate action blocks in CSS would not solve ownership. Likes, comments, share URL, SEO and cover must belong to the parent multipage entry.

7. Ordering is only partially modeled.

   Existing fields:

   - `isPinned`
   - `groupOrder`
   - `group.sortOrder`
   - `media.sortOrder`

   Current public sorting is mainly chronological and group-aware. It does not yet provide a full top-level manual order, and live group parts currently both have `groupOrder: 0`.

8. SEO is currently weak for dynamic journal entries.

   `journal.html` has a generic static title/description. Individual entries are rendered by JS. For real multilingual SEO, the backend should eventually provide crawlable per-language entry URLs or static exports.

9. Public like-status check currently returns `404` for the tested live slug.

   The frontend catches failures and falls back to counts. Backend source confirms `PublicLikesService` exists, but no public controller route currently wires `like`, `unlike` or `like-status` endpoints. This is a real backend gap, not just a proxy issue.

10. Backend schema is currently legacy RU/EN and post-centric.

   Prisma models currently include `Admin`, `AdminSession`, `JournalGroup`, `Post`, `Media`, `Comment`, `Like` and `Share`. There are no `JournalCollection`, `JournalTranslation`, `JournalMediaTranslation` or multipage/page-order models yet.

## Recommended Data Model

Keep posts as atomic content units, then add parent collections.

### journal_posts

Existing posts remain valid. Add only compatibility fields if needed:

- `sortOrder` nullable
- `sourceLanguage`, default `ru`
- `translationStatus` optional summary field, or derive from translations table

### journal_collections

New parent entity.

Fields:

- `id`
- `type`: `multipage`
- `slug`
- `status`
- `publishedAt`
- `createdAt`
- `updatedAt`
- `isPinned`
- `sortOrder`
- `authorLine`, default `Vetus Naut - Brkovic`
- `coverMediaId`
- `allowComments`
- `allowLikes`

The first page of a multipage post should be a cover block on this parent entity, not a normal chapter. Public UI can still present it as the first screen.

### journal_collection_pages

Connects existing or new posts to a multipage parent.

Fields:

- `id`
- `collectionId`
- `postId`
- `pageOrder`
- `createdAt`
- unique constraint on `collectionId + postId`

### journal_translations

Language slots for posts and collections.

Fields:

- `id`
- `entityType`: `post` or `collection`
- `entityId`
- `language`
- `title`
- `excerpt`
- `content`
- `seoTitle`
- `seoDescription`
- `status`: `missing`, `draft`, `needs_review`, `published`
- `sourceLanguage`
- `updatedAt`

During migration, legacy `titleRu/titleEn` fields can remain and be mirrored into/from this table.

### journal_media_translations

Language slots for media alt/caption.

Fields:

- `id`
- `mediaId`
- `language`
- `alt`
- `caption`
- `status`
- `updatedAt`

## Required API Additions

Admin:

- `GET /admin/journal-collections`
- `POST /admin/journal-collections`
- `GET /admin/journal-collections/:id`
- `PATCH /admin/journal-collections/:id`
- `DELETE /admin/journal-collections/:id`
- `POST /admin/journal-collections/:id/pages`
- `PATCH /admin/journal-collections/:id/pages/reorder`
- `DELETE /admin/journal-collections/:id/pages/:pageId`
- `PATCH /admin/posts/reorder`
- `PATCH /admin/journal-groups/:id/posts/reorder`
- `PATCH /admin/posts/:id/translations/:language`
- `PATCH /admin/journal-collections/:id/translations/:language`
- `PATCH /admin/media/:id/translations/:language`

Public:

- `GET /public/journal`
- `GET /public/journal/:slug`
- `GET /public/journal/collections/:slug`
- `POST /public/journal/collections/:slug/comments`
- `POST /public/journal/collections/:slug/like`
- `DELETE /public/journal/collections/:slug/like`
- `GET /public/journal/collections/:slug/like-status`

The public index should be able to return mixed timeline items: single posts, old groups and multipage collections.

## Admin UX Plan

Default mode: fast RU entry.

Visible first:

- `Заголовок RU`
- `Краткое описание RU`
- `Текст RU`
- `Фото`
- `Alt RU`
- `Опубликовать сейчас`
- `Сохранить черновик`

Collapsed advanced blocks:

- service fields: slug, status, date, pin, comments, likes
- translations
- SEO
- groups
- multipage
- order
- media metadata

For sea workflow:

- sticky save/publish bar
- local autosave draft
- automatic slug from Russian title
- clear badges: `нужен перевод`, `нужен SEO`, `нет alt`, `нет фото`
- large touch-friendly upload/GPS controls

## Multipage Cover Page

The multipage parent should include a cover tab in admin:

- cover title
- author line: `Vetus Naut - Brkovic`
- short description
- cover image
- SEO
- publish settings

No final Russian marketing/editorial copy should be generated without owner approval. The admin can provide fields and a neutral placeholder state.

## Safe Implementation Order

1. Get backend repository or production backend copy.
2. Backup database tables for posts, groups, media, comments and likes.
3. Fix small frontend/admin defects first, especially malformed media form markup.
4. Add backend migrations for collections and translations without removing legacy RU/EN columns.
5. Add compatibility layer in API responses:
   - keep `titleRu/titleEn` for current frontend
   - add `translations` object for new frontend
6. Update admin to RU-first while keeping existing fields.
7. Add collection/multipage admin UI.
8. Add public multipage renderer with one shared engagement block.
9. Add reorder endpoints and UI controls.
10. Migrate or clone one existing group into a test multipage collection.
11. Verify old singles, old groups, comments, likes, media, GPS and language switching.
12. Only after that, plan real SEO URL strategy for multilingual journal pages.

## Backend Access Needed

Backend source is now available as a read-only FTP snapshot and as a local working copy:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Local backend commits already prepared, not deployed:

- `b6a428d Add journal collection and translation schema`
- `0438128 Add journal collection API draft`

The local draft includes schema/API support for multipage collections, shared collection comments/likes, and manual post ordering. It also includes:

```text
prisma/manual-migrations/20260525_journal_collections_translations.sql
```

To apply database/API changes safely on production, the next requirement is still a controlled edit/deploy workflow for `/journal-backend`:

- make a backup of `/journal-backend` and relevant database tables before migrations;
- decide whether edits are done directly on server source or through a local backend working copy;
- deploy built `dist` only after TypeScript build and Prisma migration checks;
- do not edit live backend files blindly from the frontend repo.

Without a controlled deploy/migration path, frontend can be prepared for the new shape, but production persistence for multipage records and true many-language slots should wait.
