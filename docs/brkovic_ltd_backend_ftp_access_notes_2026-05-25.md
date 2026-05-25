# BRKOVIC.LTD Backend and FTP Access Notes — 2026-05-25

Этот документ нужен для следующих чатов, чтобы не начинать заново поиск backend-а судового журнала и FTP-доступа.

## Важное правило безопасности

Секреты не хранить в Git:

- не коммитить FTP-логины и пароли;
- не коммитить database credentials;
- не коммитить серверный `.env`;
- не коммитить cookies, session-файлы, uploads и логи;
- не заменять боевой `forms/config.php` примером `forms/config.example.php`.

## FTP На Этом Linux-ПК

FTP-доступ к боевому сайту настроен локально вне репозитория:

```text
/home/alexey/.netrc
```

Права файла:

```text
600
```

Локальные вспомогательные команды:

```bash
brkovic-ftp-ls /
brkovic-ftp-fetch /remote/path /local/path
```

Пример read-only проверки:

```bash
brkovic-ftp-ls /
```

Если `.netrc` отсутствует на другой машине, доступы нужно спросить у владельца проекта или взять из панели хостинга. Не искать их в Git.

## Найденный Backend Судового Журнала

Backend судового журнала есть на боевом сервере:

```text
/journal-backend
```

Это не часть frontend-репозитория `brkovic-ltd`. В текущем Git-проекте лежат frontend, админские страницы, proxy и snapshot данных, а backend живет на сервере.

Стек backend-а:

```text
NestJS + Prisma + PostgreSQL
```

Ключевые серверные пути:

```text
/journal-backend        backend судового журнала
/public_html            боевые публичные файлы сайта
/www                    тот же публичный сайт / alias хостинга
/private                приватные PHP-конфиги и helper-файлы
```

## Локальный Read-Only Snapshot

Для аудита исходников backend-а снята локальная read-only копия:

```text
/home/alexey/.local/share/brkovic-ltd/ftp-snapshot/journal-backend
```

В snapshot намеренно не копировались:

- `.env`;
- cookies;
- uploads;
- logs;
- `node_modules`.

Основные файлы snapshot:

```text
package.json
server.js
src/
dist/
prisma/schema.prisma
```

## Текущая Backend-Картина На Production

До multipage-деплоя 2026-05-25 production Prisma schema была post-centric и RU/EN:

- `Admin`
- `AdminSession`
- `JournalGroup`
- `Post`
- `Media`
- `Comment`
- `Like`
- `Share`

На production до деплоя не было моделей:

- `JournalCollection`;
- `JournalCollectionPage`;
- `JournalTranslation`;
- `JournalMediaTranslation`;
- multipage / collection API.

До деплоя публичный endpoint коллекций отсутствовал:

```text
GET /api/public/journal-collections -> 404
```

До деплоя `PublicLikesService` в production backend-е был, но публичные маршруты для `like`, `unlike` и `like-status` не были подключены контроллером. Поэтому frontend мог получать `404` на:

```text
/api/public/journal/:slug/like-status
```

## Локальная Backend Working Copy

Для безопасной разработки создана отдельная локальная рабочая копия backend-а вне frontend-репозитория:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Это обычный локальный Git-репозиторий. Состояние после backend-деплоя 2026-05-25:

```text
5a22e1a Baseline live journal backend snapshot
cf8bb39 Add local dependency lock and ignores
71fa821 Wire public journal like routes
b6a428d Add journal collection and translation schema
0438128 Add journal collection API draft
7fd2776 Add server Prisma engine targets
```

Что подготовлено в local working copy и выложено на production 2026-05-25:

- Prisma-модели `JournalCollection`, `JournalCollectionPage`, `JournalTranslation`, `JournalMediaTranslation`;
- `Post.sortOrder` и `Post.sourceLanguage`;
- общий `collectionId` для `Comment`, `Like`, `Share`;
- публичные маршруты collection:
  - `GET /api/public/journal/collections`;
  - `GET /api/public/journal/collections/:slug`;
  - `POST /api/public/journal/collections/:slug/comments`;
  - `GET|POST|DELETE /api/public/journal/collections/:slug/like...`;
- админские маршруты:
  - `GET|POST /api/admin/journal-collections`;
  - `GET|PATCH /api/admin/journal-collections/:id`;
  - `PATCH /api/admin/journal-collections/:id/pages`;
  - `PATCH /api/admin/posts/order`;
- ручной SQL-черновик миграции:
  - `prisma/manual-migrations/20260525_journal_collections_translations.sql`.

Проверки в локальной working copy:

```text
DATABASE_URL='postgresql://user:pass@localhost:5432/brkovic_journal' npx prisma validate
npm run build
```

Обе проверки прошли.

## Production Migration And Deploy — 2026-05-25

Production DB migration applied successfully on 2026-05-25 through a temporary random-name PHP runner uploaded to `public_html`, called once over HTTPS, and deleted immediately after execution.

Temporary runner URLs were verified deleted:

```text
php: 404
sql: 404
```

Before the real apply, the same SQL was executed in a dry-run transaction and rolled back:

```text
/home/alexey/.local/share/brkovic-ltd/ops/journal-migration-dry-run-20260525T144042Z.json
```

Real apply result:

```text
/home/alexey/.local/share/brkovic-ltd/ops/journal-migration-apply-20260525T144212Z.json
```

Counts before and after migration were identical:

```text
Admin: 1
JournalGroup: 2
Post: 13
Media: 12
Comment: 2
Like: 2
Share: 0
```

Production now has:

- `JournalCollection`;
- `JournalCollectionPage`;
- `JournalTranslation`;
- `JournalMediaTranslation`;
- `Post.sortOrder`;
- `Post.sourceLanguage`;
- `collectionId` on `Comment`, `Like`, `Share`.

Generated Prisma Client on the server was updated under:

```text
/nodevenv/journal-backend/24/lib/node_modules/.prisma/client
```

Old generated Prisma Client backup:

```text
/home/alexey/.local/share/brkovic-ltd/backups/20260525T144459Z-prisma-client-pre-multipage-deploy
```

Backend files were uploaded to:

```text
/journal-backend
```

Admin frontend files were uploaded to `public_html` after backend deploy:

```text
admin-posts.html
css/admin-posts.css
js/admin-posts.js
admin-api-proxy.php
```

`admin-posts.html` now uses cache-bust version:

```text
20260525-journal-multipage-01
```

Restart was triggered by uploading:

```text
/journal-backend/tmp/restart.txt
```

Post-deploy checks:

```text
GET /api/health -> 200
GET /api/public/journal -> 200, 4 items
GET /api/public/journal/:slug -> 200
GET /api/public/journal/:slug/like-status -> 200
POST /api/public/journal/:slug/like with JSON body -> 201
DELETE /api/public/journal/:slug/like -> 200
GET /api/public/journal/collections -> 200, []
GET /api/admin/journal-collections without auth -> 401
local admin-api-proxy.php path=/admin/journal-collections -> 401 from live API, not 403
```

Note: POST like should be sent with a JSON body / content type. A bare empty POST can be blocked by the host before reaching Node.

## Database

Live health check подтверждает, что backend видит базу:

```bash
curl https://brkovic.ltd/api/health
```

Ожидаемый смысл ответа:

```text
service: ship-journal-backend
status: ok
database: ok
```

Прямой доступ к PostgreSQL с локального ПК на порт `5432` не открыт / тайм-аутится. Это нормально для модели, где PostgreSQL доступен backend-у через `localhost` на сервере.

Значит изменения базы нужно делать через controlled backend/deploy workflow на сервере, а не предполагать прямой локальный доступ к PostgreSQL.

## Перед Любой Backend-Доработкой

Перед изменениями `/journal-backend`:

1. Снять backup серверного `/journal-backend`.
2. Снять backup релевантных таблиц базы.
3. Не править live backend вслепую.
4. Сначала подготовить миграции Prisma и TypeScript-код локально/в отдельной копии.
5. Проверить build.
6. Только потом выкладывать на сервер и перезапускать backend.

## Последний Локальный Backup Перед Multipage-Спринтом

Перед началом изменений по многостраничным записям и языковой архитектуре снят локальный backup вне Git:

```text
/home/alexey/.local/share/brkovic-ltd/backups/20260525T140449Z-journal-pre-multipage
```

Внутри есть:

- `MANIFEST.md`;
- архив backend-а;
- архив критичных live-файлов журнала;
- JSON dump таблиц журнала;
- uploads/journal;
- public API snapshot;
- checksums.

Этот backup содержит приватные локальные копии серверного `.env` и `forms/config.php`, поэтому его нельзя переносить в Git или отправлять в публичные документы.

Для спринта по судовому журналу этот документ читать вместе с:

```text
docs/brkovic_ltd_journal_audit_2026-05-25.md
docs/brkovic_ltd_full_handoff_2026-05-20.md
docs/brkovic_ltd_project_knowledge.md
```
