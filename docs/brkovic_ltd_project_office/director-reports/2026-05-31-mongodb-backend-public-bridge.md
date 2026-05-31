# MongoDB Backend Public Bridge

**Date:** `2026-05-31`  
**Backend working copy:** `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`  
**Status:** `Local bridge complete; production cutover not executed.`

## Director Summary

The backend now has a MongoDB data layer for the public journal surface, enabled only by feature flag:

```text
DATA_BACKEND=mongodb
```

Without this flag, the backend remains PostgreSQL/Prisma.

This is the correct intermediate step before making MongoDB primary: it lets us run Mongo-backed public reads and public write actions without forcing the entire admin system across in one risky deploy.

## Implemented

In the backend working copy:

- Added `mongodb` Node driver dependency.
- Added global Mongo module:
  - `src/mongo/mongo.module.ts`
  - `src/mongo/mongo.service.ts`
- Added Mongo-backed public journal service:
  - `src/modules/public/mongo-public-journal.service.ts`
- Added feature-flag routing in:
  - `src/modules/public/journal/public-journal.controller.ts`
- Added Mongo health support:
  - `src/modules/health/health.service.ts`
  - `src/modules/health/health.module.ts`
- Updated Prisma service so it does not connect to PostgreSQL during Mongo mode:
  - `src/prisma/prisma.service.ts`
- Updated local env example:
  - `DATA_BACKEND`
  - `MONGODB_URI`
  - `MONGODB_DB`

## Covered In Mongo Mode

Public reads:

- `GET /api/health`
- `GET /api/public/journal`
- `GET /api/public/journal/feed`
- `GET /api/public/journal/:slug`
- `GET /api/public/journal/collections`
- `GET /api/public/journal/collections/:slug`

Public writes:

- `POST /api/public/journal/:slug/comments`
- `GET /api/public/journal/:slug/like-status`
- `POST /api/public/journal/:slug/like`
- `DELETE /api/public/journal/:slug/like`
- `POST /api/public/journal/collections/:slug/comments`
- `GET /api/public/journal/collections/:slug/like-status`
- `POST /api/public/journal/collections/:slug/like`
- `DELETE /api/public/journal/collections/:slug/like`

## Local Smoke

Backend started locally with:

```text
DATA_BACKEND=mongodb
PORT=3017
```

Results:

- `GET /api/health` returned `databaseProvider: mongodb`.
- `GET /api/public/journal` returned 4 published posts.
- `GET /api/public/journal/collections` returned 1 collection with 4 pages.
- `GET /api/public/journal/uvazhenie-k-moryu` returned media, translations and counts.
- `GET /api/public/journal/collections/chelovecheskoe-i-morskoe` returned 4 pages and language data.
- Like/unlike smoke passed with no net leftover likes.
- Comment smoke passed and cleanup restored MongoDB comment count.

Post-smoke counts:

```text
comments: 2
likes: 7
```

## Production Cutover Decision

Production was not switched.

Reasons:

- Admin post management still uses Prisma/PostgreSQL.
- Admin comments still use Prisma/PostgreSQL.
- Admin media upload/reorder still uses Prisma/PostgreSQL.
- Admin translations still use Prisma/PostgreSQL.
- Existing backend working copy contains other uncommitted sprint changes; deploying all of it as one package would mix scopes.

## Next Sprint

Required before declaring MongoDB primary:

1. Add Mongo-backed admin post list/get/create/update/order.
2. Add Mongo-backed journal group admin.
3. Add Mongo-backed admin comments moderation.
4. Add Mongo-backed translation list/generate/save.
5. Add Mongo-backed media metadata operations while keeping file uploads on disk.
6. Run final PostgreSQL-to-Mongo sync immediately before production switch.
7. Deploy with:
   - `DATA_BACKEND=mongodb`
   - `MONGODB_URI`
   - `MONGODB_DB`
8. Run live smoke for public, admin, translations, comments, likes and journal rendering.

## Director Close

MongoDB can now serve the public journal layer locally through a controlled flag.

Do not switch production to MongoDB as primary until admin write paths are moved or explicitly frozen during cutover.
