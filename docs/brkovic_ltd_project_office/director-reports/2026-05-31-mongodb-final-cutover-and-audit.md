# MongoDB Final Cutover And Function Audit

**Date:** `2026-05-31`  
**Project:** `brkovic.ltd`  
**Status:** `MongoDB is live primary for journal backend`

## Director Decision

MongoDB Atlas is now the active production data backend for `/journal-backend`.

The migration was completed only after the real production outbound IP was added to Atlas Network Access:

- `162.0.217.98/32`

PostgreSQL is kept as rollback source during the first production window, but live backend reads/writes are now routed to MongoDB.

## Final PostgreSQL Snapshot

A fresh production PostgreSQL export was taken after the Atlas allowlist correction.

Local private export:

- `~/.local/share/brkovic-ltd/ops/postgres-export-20260531T165300Z-final-after-atlas-ip.json`

Temporary PHP runner:

- uploaded once to `public_html`;
- called once over HTTPS;
- deleted after export;
- deletion verified by `HTTP 404`.

Export counts:

| Table | Rows |
| --- | ---: |
| `Admin` | 1 |
| `AdminSession` | 0 |
| `ToolUser` | 41 |
| `ToolUserCode` | 84 |
| `ToolUserSession` | 8 |
| `JournalGroup` | 2 |
| `Post` | 13 |
| `JournalCollection` | 1 |
| `JournalCollectionPage` | 4 |
| `JournalTranslation` | 30 |
| `Media` | 12 |
| `JournalMediaTranslation` | 24 |
| `Comment` | 2 |
| `Like` | 7 |
| `Share` | 0 |

Note: `ToolUserSession` had increased from `7` to `8`, so the earlier pre-gate snapshot was stale. The final Mongo load used this fresh export.

## Mongo Load

Load script:

- `~/.local/share/brkovic-ltd/ops/load-postgres-export-to-mongo.js`

Target:

- Atlas project: `brkovic.ltd`
- Cluster: `brkovic-prod`
- Database: `brkovic_prod`

Mongo counts after load matched the final PostgreSQL export exactly.

## Production Switch

Production `.env` was updated without printing secrets:

- `DATA_BACKEND=mongodb`
- `MONGODB_DB=brkovic_prod`
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS=10000`

Existing production secrets and `DATABASE_URL` were preserved for rollback.

Restart was triggered through:

- `/journal-backend/tmp/restart.txt`

## Production Health

Final health result:

```json
{
  "status": "ok",
  "database": "ok",
  "databaseProvider": "mongodb",
  "databaseError": null
}
```

This confirms the previous Atlas TLS/network gate is resolved.

## Function Audit

Passed checks:

| Area | Result |
| --- | --- |
| Public journal list | `200`, `4` published posts |
| Public collection list | `200`, `1` collection, `4` pages |
| Public like write path | `POST 201`, then `DELETE 200`; count returned to baseline |
| Admin unauth guard | `401` |
| Admin login | `201`, authenticated |
| Admin `/auth/me` | `200`, authenticated |
| Admin posts | `200`, `13` rows |
| Admin groups | `200`, `2` rows |
| Admin collections | `200`, `1` row |
| Admin comments | `200`, `2` rows |
| Post translations list | `200`, `6` translations for sampled post |
| Collection translations list | `200`, `6` translations for sampled collection |
| Mongo parity check | all exported collections matched expected counts |

## Current Boundaries

Migration is complete for the journal backend data path.

The following are not treated as migration blockers:

- live frontend image/rendering complaints;
- NavDesk per-tool behavior;
- admin visual layout issues;
- response-envelope cleanup;
- SEO/admin panel polish.

Those belong to separate frontend/QA stabilization after the database switch is stable.

## Rollback

Rollback remains simple during the first Mongo window:

1. Restore production `.env` from the private backup created before final switch.
2. Set `DATA_BACKEND=postgresql`.
3. Restart `/journal-backend` through `tmp/restart.txt`.

Private rollback env backup:

- stored under `~/.local/share/brkovic-ltd/ops/`
- file mode set to `600`
- not committed to Git.

## Director Close

Database migration has crossed the main gate:

- final PostgreSQL snapshot taken;
- MongoDB load completed;
- counts verified;
- production backend switched;
- health confirms MongoDB primary;
- public/admin core paths pass smoke.

Next work should be handled as post-cutover QA and frontend alignment, not as database migration.
