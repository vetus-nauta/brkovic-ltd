# MongoDB Production Cutover Attempt And Network Gate

**Date:** `2026-05-31`  
**Project:** `brkovic.ltd`  
**Status:** `Code deployed; MongoDB cutover gated by Atlas Network Access / production TLS. Live site restored to PostgreSQL.`

## What Was Completed

- Built a clean backend cutover package from the live production snapshot, not from the dirty local working copy.
- Preserved the live auth surface, including Google auth and ecosystem token routes.
- Added MongoDB runtime bridge for:
  - public journal reads, comments and likes;
  - admin posts, groups, comments, media metadata and collections;
  - post and collection translation drafts;
  - admin login and tool-user auth.
- Installed the MongoDB Node runtime dependencies into the CloudLinux Node environment.
- Deployed the clean backend package to `/journal-backend`.
- Ran production canary with PostgreSQL still active:
  - `GET /api/health` returned `databaseProvider: postgresql`;
  - public journal returned `200`;
  - unauthenticated admin endpoint returned `401`.

## Local Mongo Acceptance

Local Mongo-mode smoke passed before production switch:

- backend build passed;
- health returned `databaseProvider: mongodb`;
- public journal list/detail worked;
- public like/comment write path worked and temporary data was cleaned;
- admin login worked with a temporary admin;
- admin posts, groups, comments and collections routes worked;
- temporary group/post/translation were created and cleaned;
- tool-user email-code auth worked in development smoke;
- Mongo collection counts returned to baseline after cleanup.

Baseline after cleanup:

| Collection | Count |
| --- | ---: |
| `admins` | 1 |
| `toolUsers` | 41 |
| `toolUserCodes` | 84 |
| `toolUserSessions` | 7 |
| `posts` | 13 |
| `journalGroups` | 2 |
| `journalTranslations` | 30 |
| `comments` | 2 |
| `likes` | 7 |

## Final PostgreSQL Sync

Immediately before production cutover attempt, a one-time PostgreSQL export runner was uploaded, called once, and deleted.

Export:

- `~/.local/share/brkovic-ltd/ops/postgres-export-20260531T153548Z-final-before-mongo.json`

Runner cleanup:

- temporary export runner returned deleted status after use.

Final sync result:

| Source table | Mongo collection | Rows |
| --- | --- | ---: |
| `Admin` | `admins` | 1 |
| `AdminSession` | `adminSessions` | 0 |
| `ToolUser` | `toolUsers` | 41 |
| `ToolUserCode` | `toolUserCodes` | 84 |
| `ToolUserSession` | `toolUserSessions` | 7 |
| `JournalGroup` | `journalGroups` | 2 |
| `Post` | `posts` | 13 |
| `JournalCollection` | `journalCollections` | 1 |
| `JournalCollectionPage` | `journalCollectionPages` | 4 |
| `JournalTranslation` | `journalTranslations` | 30 |
| `Media` | `media` | 12 |
| `JournalMediaTranslation` | `journalMediaTranslations` | 24 |
| `Comment` | `comments` | 2 |
| `Like` | `likes` | 7 |
| `Share` | `shares` | 0 |

## Production Cutover Blocker

After setting `DATA_BACKEND=mongodb`, production backend started in Mongo mode, but MongoDB driver could not complete TLS handshake with Atlas:

- provider detected: `mongodb`;
- error class: `MongoServerSelectionError`;
- error type: TLS alert during handshake.

Diagnostics:

- local workstation connects to Atlas successfully;
- production host can open TCP to all three Atlas shard hosts on `27017`;
- production outgoing IP reported by server-side check is:
  - `162.0.217.98`
- previously known/expected Atlas allowlist entry was not this outgoing IP.

Director interpretation:

- the backend code and Mongo data are ready;
- the live server is blocked at Atlas network/TLS access, not at application logic;
- production must not stay in Mongo mode until Atlas accepts the real outgoing IP.

## Protective Rollback

To keep the live site healthy, production `.env` was returned to:

- `DATA_BACKEND=postgresql`

Post-rollback checks:

- `GET https://brkovic.ltd/api/health` returned `200`;
- health returned `databaseProvider: postgresql`;
- public journal returned `200`;
- unauthenticated admin route returned `401`.

The deployed backend code and MongoDB data remain in place. Only the active provider flag is back on PostgreSQL.

## Required Atlas Action

In MongoDB Atlas, add this exact IP to **Network Access**:

- `162.0.217.98/32`

Suggested label:

- `brkovic.ltd production outbound`

After Atlas marks the entry active, switch production by setting:

- `DATA_BACKEND=mongodb`

Then restart `/journal-backend` and run:

1. `GET /api/health` must show `databaseProvider: mongodb` and `database: ok`.
2. `GET /api/public/journal` must return published posts.
3. `GET /api/public/journal/collections` must return the multipage collection.
4. Admin login and admin posts list must work.
5. Translation generate/save must be smoke-tested.

## Current Decision

MongoDB migration is technically prepared but not live-primary yet.

The live site is intentionally protected on PostgreSQL until Atlas Network Access includes the real production outbound IP.
