# Backend translation routes checklist (admin journal)

**Date:** 2026-05-28  
**Task:** `BRK-MVP-BE-005`  
**Owner:** `CHAT-BRK-BACKEND-001`

## Что проверить на live после включения маршрутов

Выполнять после логина в admin-сессию или через браузерный сетевой мониторинг с куками авторизации.

### Endpoint 1: Post translate generate
`POST https://brkovic.ltd/api/admin/posts/{postId}/translations/generate`

Ожидаем:
- HTTP 200/201
- JSON-структура:

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

### Endpoint 2: Post translate list
`GET https://brkovic.ltd/api/admin/posts/{postId}/translations`

Ожидаем:
- HTTP 200
- `data.translations` массив языков с `status`.

### Endpoint 3: Collection generate
`POST https://brkovic.ltd/api/admin/journal-collections/{collectionId}/translations/generate`

Ожидаем тот же формат `items`.

### Endpoint 4: Collection list
`GET https://brkovic.ltd/api/admin/journal-collections/{collectionId}/translations`

Ожидаем `data.translations`.

## Актуальные наблюдения (2026-05-28 23:32 UTC)

Без авторизации на live-среде все 4 endpoint-а отвечают `401`, что указывает на корректную защиту сессией админа:

- `POST /api/admin/posts/{postId}/translations/generate` → `401 {\"error\":\"Authentication required\"}`
- `GET  /api/admin/posts/{postId}/translations` → `401`
- `POST /api/admin/journal-collections/{collectionId}/translations/generate` → `401 {\"error\":\"Authentication required\"}`
- `GET  /api/admin/journal-collections/{collectionId}/translations` → `401`

Из этого следует:
- маршрут на уровне API существует;
- следующий шаг — авторизованный smoke (HTTP 200/2xx + ожидаемый JSON).

## Полезный запрос для быстрой проверки структуры запроса

```bash
curl -X POST "https://brkovic.ltd/api/admin/posts/<postId>/translations/generate" \\
  -H "Content-Type: application/json" \\
  -d '{"sourceLanguage":"ru","targetLanguages":["en","de","it","es","sr","zh"],"includeSeo":true,"includeMedia":true}'
```

## Что frontend уже ожидает
- Параметры: `sourceLanguage`, `targetLanguages`, `includeSeo`, `includeMedia`.
- По `FAILED` статусу по конкретному языку — показать отдельную пометку ошибки.
- После включения API кнопки AI в `admin-posts.html` должны стать активными.
- При 404 роутов frontend показывает явный статус, что backend‑маршрут не готов.
