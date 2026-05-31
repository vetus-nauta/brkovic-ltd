# MongoDB Atlas Bootstrap And Initial Load

**Date:** `2026-05-31`  
**Project:** `brkovic.ltd`  
**Cluster:** `brkovic-prod`  
**Database:** `brkovic_prod`  
**Status:** `MongoDB prepared and loaded; production backend is not switched yet.`

## Director Decision

MongoDB Atlas is now prepared as the next central data platform for the site, but it is not yet the live primary database for production traffic.

The correct migration path is:

1. Keep PostgreSQL as the active source of truth until backend switch-over is implemented and tested.
2. Use MongoDB as the migration target and future primary store.
3. Switch production only after backend code, environment configuration, rollback plan and live smoke checks are ready.

This avoids a silent split-brain state where writes continue to PostgreSQL while reads are tested against MongoDB.

## Atlas Setup

Completed:

- Atlas project created: `brkovic.ltd`.
- Free cluster created: `brkovic-prod`.
- Region: `AWS / Frankfurt (eu-central-1)`.
- Database user created: `vetusnauta_db_user`.
- Local workstation config file created:
  - `~/.config/brkovic-ltd/mongodb.env`
  - file mode: `600`
- Target database confirmed:
  - `brkovic_prod`

Network access:

- local workstation IP was added by Atlas security quickstart;
- production server IP `162.0.217.114/32` was added by the owner.

## Connectivity Checks

Local workstation:

- MongoDB driver connection: passed.
- Authenticated user: `vetusnauta_db_user`.
- Target database: `brkovic_prod`.

Production server network:

- Temporary HTTPS runner was uploaded, executed and deleted.
- DNS SRV lookup for Atlas returned 3 shard hosts.
- TCP to Atlas shard hosts on `27017`: passed.
- PHP `ssl://` stream check failed, but this is not treated as a Node driver failure. It only shows PHP stream TLS is not a reliable proof for MongoDB driver behavior.
- All temporary runner URLs verified deleted with `404`.

## MongoDB Collections Created

Created with indexes:

- `admins`
- `adminSessions`
- `toolUsers`
- `toolUserCodes`
- `toolUserSessions`
- `journalGroups`
- `posts`
- `journalCollections`
- `journalCollectionPages`
- `journalTranslations`
- `media`
- `journalMediaTranslations`
- `comments`
- `likes`
- `shares`
- `shipCashboxSessions`
- `shipCashboxExports`
- `seoSettings`
- `appSettings`
- `auditEvents`
- `migrationRuns`

Index correction applied:

- nullable unique PostgreSQL constraints were translated to MongoDB partial unique indexes for:
  - `journalTranslations.postId + language`
  - `journalTranslations.collectionId + language`
  - `likes.postId + visitorKey`
  - `likes.collectionId + visitorKey`

## PostgreSQL Export

Source:

- database: `brkovic_journal`
- access pattern: one-time read-only export runner on production host
- runner uploaded over FTP, called once over HTTPS, then deleted
- local export path:
  - `~/.local/share/brkovic-ltd/ops/postgres-export-20260531T134347Z.json`

Temporary runner cleanup:

- export runner: `404`
- network runners: `404`

## Initial Data Load Result

PostgreSQL rows loaded into MongoDB with repeatable upsert by legacy `id`.

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

Control samples:

- published posts in MongoDB: 4;
- collection in MongoDB: `chelovecheskoe-i-morskoe`;
- translations by language:
  - `de`: 5
  - `en`: 5
  - `es`: 5
  - `it`: 5
  - `sr`: 5
  - `zh`: 5

## Not Yet Done

MongoDB is not yet the active primary database for the live site.

Still required:

1. Backend storage adapter or backend rewrite from Prisma/PostgreSQL to MongoDB.
2. Production `.env` update with `MONGODB_URI` and `MONGODB_DB`.
3. Node driver installation on the production backend.
4. Read-path parity tests:
   - public journal list;
   - collection page;
   - admin posts;
   - translations;
   - comments;
   - likes.
5. Write-path parity tests:
   - create post;
   - generate translations;
   - save translations;
   - approve/comment moderation;
   - like/comment public auth flow.
6. Final sync from PostgreSQL immediately before switch-over.
7. Rollback decision:
   - keep PostgreSQL frozen as rollback snapshot for the first production window.

## Director Close

MongoDB Atlas is ready as a migration target and future primary database.

Do not declare production switched until backend code is explicitly moved from PostgreSQL/Prisma reads and writes to MongoDB and a final sync is completed.
