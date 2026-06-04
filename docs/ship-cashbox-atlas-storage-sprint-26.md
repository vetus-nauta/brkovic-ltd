# Ship Cashbox Atlas Storage Sprint 26

Date: 2026-06-04

## Current Verified Local State

Local Ship Cashbox API is now running against MongoDB Atlas.

Verified health:

```json
{
  "provider": "mongodb",
  "mongodb": {
    "requested": true,
    "extensionLoaded": true,
    "uriConfigured": true,
    "dbConfigured": true,
    "database": "brkovic_ship_cashbox",
    "sessionsCollection": "shipCashboxSessions",
    "indexCollection": "shipCashboxIndex"
  }
}
```

Atlas verification:

```text
mongosh ping returned { ok: 1 }
```

Collections:

```text
shipCashboxSessions
shipCashboxIndex
```

Migration result:

```json
{
  "sessionsFound": 5,
  "sessionsWritten": 5,
  "indexMigrated": true
}
```

Smoke result after Mongo switch:

```text
SMOKE_OK http://127.0.0.1:18090 20260604-cashbox-ready-trash-24
```

Important local runtime note:

```text
The PHP built-in server on 127.0.0.1:18090 must be restarted after installing php-mongodb.
```

The old process was:

```text
php -S 127.0.0.1:18090 -t .
```

Start local runtime from the source copy:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
php -S 127.0.0.1:18090 -t .
```

Private env file, not committed:

```text
ship-cashbox/storage/.ship-cashbox.env
```

The same private env file is installed locally in both paired project copies:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/ship-cashbox/storage/.ship-cashbox.env
/home/alexey/WebstormProjects/brkovic-ltd/ship-cashbox/storage/.ship-cashbox.env
```

Both files are local secrets and must remain ignored by Git.

WebStorm datasource:

```text
name: cashbox-navdesk
uuid: 1a3ffefe-c55f-4e2c-98e8-eaeaade13f09
url: mongodb+srv://brkovic-prod.l4hsxov.mongodb.net/brkovic_ship_cashbox
user: brkovic_ship_cashbox_app
secret-storage: master_key
```

Do not commit `.idea/dataSources.xml`; it is local WebStorm state and may contain unrelated existing secrets.

## Decision

Ship Cashbox keeps JSON storage as the local/default development mode, but the API now supports MongoDB Atlas as production storage.

The frontend contract is unchanged. Existing endpoints continue to call the same PHP API:

- `boot`
- `create-session`
- `save-session`
- `save-treasurer-notebook`
- `participant-save`
- archive, trash, invite, rotation and settlement endpoints

## Storage Modes

Default local mode:

```text
SHIP_CASHBOX_STORAGE=json
```

Production Atlas mode:

```text
SHIP_CASHBOX_STORAGE=mongodb
SHIP_CASHBOX_MONGODB_URI=<mongodb+srv uri>
SHIP_CASHBOX_MONGODB_DB=<database>
SHIP_CASHBOX_MONGODB_COLLECTION_PREFIX=shipCashbox
```

The generic `MONGODB_URI` and `MONGODB_DB` are also accepted as fallback values, but Ship Cashbox-specific env names are preferred.

## Local/Server Private Env File

The PHP API also loads a private env file if it exists:

```text
ship-cashbox/storage/.ship-cashbox.env
```

This file is ignored by git.

Generate it without putting the password into shell history:

```bash
ship-cashbox/scripts/configure-mongodb-storage.sh
```

The script writes:

```text
SHIP_CASHBOX_STORAGE=mongodb
SHIP_CASHBOX_MONGODB_URI=mongodb+srv://...
SHIP_CASHBOX_MONGODB_DB=brkovic_ship_cashbox
SHIP_CASHBOX_MONGODB_COLLECTION_PREFIX=shipCashbox
```

## Collections

With default prefix:

```text
shipCashboxSessions
shipCashboxIndex
```

## Health Check

Authenticated endpoint:

```text
GET /ship-cashbox/api/?action=storage-health
```

Expected JSON mode locally:

```json
{
  "storage": {
    "provider": "json",
    "mongodb": {
      "requested": false
    }
  }
}
```

Expected production Mongo mode:

```json
{
  "storage": {
    "provider": "mongodb",
    "mongodb": {
      "requested": true,
      "extensionLoaded": true,
      "uriConfigured": true,
      "dbConfigured": true
    }
  }
}
```

## Migration

After production env is configured and `storage-health` shows Mongo ready:

```text
POST /ship-cashbox/api/?action=migrate-storage
```

The migration copies existing JSON sessions into MongoDB without changing session `updated_at`.

## Safety

- JSON remains default, so local work is not broken.
- Mongo mode fails closed if the PHP MongoDB extension, URI, or database is missing.
- The migration endpoint requires authentication and POST.
- Secrets are not returned by `storage-health`.
