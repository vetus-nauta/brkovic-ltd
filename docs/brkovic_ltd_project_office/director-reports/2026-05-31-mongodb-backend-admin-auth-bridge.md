# MongoDB Backend Admin/Auth Bridge

**Date:** 2026-05-31  
**Owner:** Director / Backend implementation control  
**Working copy:** `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`  
**Mode:** local implementation and smoke only. Production cutover is not opened.

## Scope

This sprint extended the MongoDB backend bridge beyond public journal reads into the operational admin surface:

- admin posts CRUD/order;
- admin journal groups CRUD;
- admin comments moderation;
- admin post and collection translations draft patch/list/generation storage path;
- admin multipage collections CRUD/page replacement/cover media reference;
- admin post media metadata/reorder/delete;
- admin login and `/auth/me`;
- public tool-user email-code auth: request, verify, `/auth/user/me`, logout.

The existing Prisma/PostgreSQL path remains in place as fallback. Mongo behavior is activated only with:

```bash
DATA_BACKEND=mongodb
```

## Files Changed In Backend Working Copy

- `src/modules/posts/posts.service.ts`
- `src/modules/admin/groups/admin-journal-groups.service.ts`
- `src/modules/admin/comments/admin-comments.service.ts`
- `src/modules/admin/translations/admin-translations.service.ts`
- `src/modules/admin/collections/admin-journal-collections.service.ts`
- `src/modules/admin/media/admin-media.controller.ts`
- `src/modules/auth/auth.service.ts`

Also relies on the Mongo bridge from the previous sprint:

- `src/mongo/mongo.service.ts`
- `src/mongo/mongo.module.ts`
- `src/modules/public/mongo-public-journal.service.ts`

## Verification

Build:

```bash
npm run build
```

Result: passed.

Local backend started in Mongo mode on port `3017` with Atlas env from local protected config.

Smoke checks passed:

1. `GET /api/health`
   - `databaseProvider: mongodb`
   - `database: ok`

2. Admin posts/groups/comments/translations smoke:
   - signed admin cookie generated locally;
   - `GET /api/admin/posts`;
   - `GET /api/admin/journal-groups`;
   - `GET /api/admin/comments`;
   - create temporary journal group;
   - patch temporary group;
   - create temporary post;
   - get/patch temporary post;
   - patch temporary post translation;
   - list temporary post translations;
   - patch post order;
   - cleanup temporary post/group/translations.

3. Admin login smoke:
   - temporary admin inserted into Mongo with generated password hash;
   - `POST /api/auth/login`;
   - admin cookie received;
   - `GET /api/auth/me`;
   - `lastLoginAt` updated;
   - cleanup temporary admin.

4. Collections/media smoke:
   - temporary post created;
   - temporary media inserted;
   - media metadata patch via API;
   - media reorder via API;
   - temporary multipage collection created with page and cover media;
   - collection patch;
   - page replacement;
   - collection translation patch;
   - collection list includes temporary collection;
   - media delete via API;
   - cleanup temporary collection/pages/translations/post/media.

5. Tool-user auth smoke:
   - temporary user email;
   - `POST /api/auth/user/request-code`;
   - dev `debugCode` received;
   - `POST /api/auth/user/verify-code`;
   - tool-user cookie received;
   - `GET /api/auth/user/me`;
   - `POST /api/auth/user/logout`;
   - session revoked;
   - cleanup temporary tool user/code/session.

Final Mongo counts after all smokes matched the pre-smoke baseline:

```json
{
  "admins": 1,
  "toolUsers": 41,
  "toolUserCodes": 84,
  "toolUserSessions": 7,
  "posts": 13,
  "journalGroups": 2,
  "journalCollections": 1,
  "journalCollectionPages": 4,
  "journalTranslations": 30,
  "media": 12,
  "journalMediaTranslations": 24,
  "comments": 2,
  "likes": 7
}
```

## Cutover Gate

Do not switch production yet just because local Mongo-mode passes.

Required next gate:

1. Prepare a narrow deploy package from this backend working copy.
2. Review unrelated dirty changes before packaging; the backend worktree contains older modified files from previous streams.
3. Run production-like staging smoke with real HTTPS cookies.
4. Confirm OpenAI live generation env in production; local health currently reports translation provider mode from local env.
5. Confirm backup/rollback:
   - PostgreSQL remains source of rollback during the first cutover window.
   - Mongo Atlas snapshot/export must be captured before enabling production writes.
6. Only then set `DATA_BACKEND=mongodb` on production.

## Director Decision

MongoDB is now technically usable as the active backend for journal public reads, admin journal content, admin localization drafts, multipage collections, media metadata, admin login, and tool-user auth.

Production status: **For Review, not deployed.**
