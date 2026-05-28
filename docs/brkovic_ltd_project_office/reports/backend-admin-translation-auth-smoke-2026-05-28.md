# Admin Translation Auth Smoke — Journal (2026-05-28)

## Что добавлено

- В корне репозитория добавлен скрипт:
  - `tools/journal-admin-translation-smoke.sh`

Скрипт делает пошаговый smoke:
1) анонимный проход (ожидает `401` на 4 endpoint’ах),
2) логин в админку через email+password,
3) проверка доступности endpoint’ов после логина (обычно `404`/`400` для фиктивных ID, но уже с корректной авторизацией и роутингом).

## Текущие наблюдения (без логина)

Команда:

```bash
curl -sS -o /tmp/jp1.json -w '%{http_code}' https://brkovic.ltd/api/admin/posts/<postId>/translations
curl -sS -o /tmp/jp2.json -w '%{http_code}' -X POST https://brkovic.ltd/api/admin/posts/<postId>/translations/generate \
  -H 'Content-Type: application/json' \
  -d '{"sourceLanguage":"ru","targetLanguages":["en"]}'
curl -sS -o /tmp/jc1.json -w '%{http_code}' https://brkovic.ltd/api/admin/journal-collections/<collectionId>/translations
curl -sS -o /tmp/jc2.json -w '%{http_code}' -X POST https://brkovic.ltd/api/admin/journal-collections/<collectionId>/translations/generate \
  -H 'Content-Type: application/json' \
  -d '{"sourceLanguage":"ru","targetLanguages":["en"]}'
```

На `2026-05-28` для test-UUID все 4 ответа — `401 Authentication required`.

Это значит:
- руты существуют и защищены админ-сессией;
- проблема “Cannot POST” не про статус публикации поста/коллекции, а про отсутствие авторизации или неподготовленную admin-сессию в конкретном сценарии.

## Как запустить auth-smoke на живой админке

```bash
BRK_ADMIN_EMAIL=your-admin-email \
BRK_ADMIN_PASSWORD=your-password \
./tools/journal-admin-translation-smoke.sh
```

или через первый аргумент:

```bash
BRK_ADMIN_PASSWORD=your-password ./tools/journal-admin-translation-smoke.sh your-admin-email
```

## Примечание

- Скрипт не вносит изменений в записи (используются фиктивные UUID и проверка доступности endpoint’ов).
