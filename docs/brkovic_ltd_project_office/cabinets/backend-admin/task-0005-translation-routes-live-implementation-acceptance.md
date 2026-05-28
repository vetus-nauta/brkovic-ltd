# Backend Task

**Date:** 2026-05-28
**Owner:** `CHAT-BRK-DIRECTOR-001`
**Assigned to:** `CHAT-BRK-BACKEND-001`
**Task ID:** `BRK-MVP-BE-005`
**Task type:** Backend route activation / admin API

## Что нужно сделать (обязательно)

Включить/реализовать админские роуты для локализации публикаций и многостраничных записей судового журнала.

### Роуты

1. `POST /api/admin/posts/:id/translations/generate`
2. `GET  /api/admin/posts/:id/translations`
3. `POST /api/admin/journal-collections/:id/translations/generate`
4. `GET  /api/admin/journal-collections/:id/translations`

### Ожидаемый request body (UI уже отправляет)

```json
{
  "sourceLanguage": "ru",
  "targetLanguages": ["en", "de", "it", "es", "sr", "zh"],
  "includeSeo": true,
  "includeMedia": true
}
```

Backend может игнорировать флаги при необходимости, но должен принять структуру без валидационной ошибки.

### Ожидаемые ответы

`POST .../generate`:

```json
{
  "success": true,
  "data": {
    "items": [
      { "language": "en", "status": "DRAFT", "skipped": false }
    ]
  }
}
```

По языку с ошибкой:

```json
{
  "success": true,
  "data": {
    "items": [
      { "language": "zh", "status": "FAILED", "error": "No source text" }
    ]
  }
}
```

`GET .../translations`:

```json
{
  "success": true,
  "data": {
    "translations": [
      { "language": "en", "status": "PUBLISHED" },
      { "language": "de", "status": "NEEDS_REVIEW" },
      { "language": "it", "status": "DRAFT" }
    ]
  }
}
```

## Текущая диагностика (чтобы понимать проблему)

На live сейчас все 4 endpoint'а отдают 404 (`Cannot POST/GET .../translations...`).

## Принцип приёмки

- Маршруты доступны в admin-контексте (требуют авторизации как `/api/admin/*`).
- Успешные ответы возвращают валидный JSON.
- Статусы: `DRAFT`, `NEEDS_REVIEW`, `PUBLISHED`, `FAILED`, `MISSING`.
- После включения UI в `admin-posts.html` должен снять блокировку кнопок AI.

## Быстрый smoke (локально/из CLI)

```bash
curl -X POST "https://brkovic.ltd/api/admin/posts/<POST_ID>/translations/generate" \
  -H 'Content-Type: application/json' \
  -d '{"sourceLanguage":"ru","targetLanguages":["en","de"],"includeSeo":true,"includeMedia":true}'

curl -X GET "https://brkovic.ltd/api/admin/posts/<POST_ID>/translations" \
  -H 'Accept: application/json'

curl -X POST "https://brkovic.ltd/api/admin/journal-collections/<COLLECTION_ID>/translations/generate" \
  -H 'Content-Type: application/json' \
  -d '{"sourceLanguage":"ru","targetLanguages":["en","de"],"includeSeo":true,"includeMedia":true}'

curl -X GET "https://brkovic.ltd/api/admin/journal-collections/<COLLECTION_ID>/translations" \
  -H 'Accept: application/json'
```

(Требуется авторизация в admin с сессией.)
