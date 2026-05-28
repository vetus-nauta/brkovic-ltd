# Backend Admin Translation Routes Activation Report

**Date:** 2026-05-28
**Task:** `BRK-MVP-BE-005`
**Owner:** `CHAT-BRK-DIRECTOR-001` / `CHAT-BRK-BACKEND-001`
**Scope:** Frontend-compatibility check and route availability

## Что проверено

1. До фикса: все target routes возвращали `404` вида `Cannot POST/GET .../translations...`.

2. Фикс: backend обновлён в `/journal-backend` (включены endpoints translations в admin-модулях) и принудительно перезапущен через:

   - touch `journal-backend/tmp/restart.txt`

3. Повторная проверка на live (2026-05-28 21:28 UTC):
   - `POST /api/admin/posts/<id>/translations/generate` -> **401 (Authentication required)**
   - `GET /api/admin/posts/<id>/translations` -> **401 (Authentication required)**
   - `POST /api/admin/journal-collections/<id>/translations/generate` -> **401 (Authentication required)**
   - `GET /api/admin/journal-collections/<id>/translations` -> **401 (Authentication required)**

   Это означает, что route уже зарегистрированы на уровне API и теперь доступны только после авторизации.

5. Причина проблемы не в статусе публикации поста (DRAFT/PUBLISHED), а в отсутствии серверных маршрутов/контракта.

6. На стороне фронта (локально) уже подготовлен корректный UX-маркер:
   - 404/`Cannot POST ...` помечает AI-роут как недоступный,
   - кнопки AI-генерации становятся disabled,
   - статус отображается красным с диагностикой.

   В продолжение: добавлен локальный smoke-скрипт `tools/journal-admin-translation-smoke.sh`,
   который фиксит 401 на 4 endpoint’ах без сессии и включает сценарий авторизованного smoke
   (с фиктивными ID) после логина.

## What backend must expose

### Обязательные маршруты

- `POST /api/admin/posts/:id/translations/generate`
- `GET  /api/admin/posts/:id/translations`
- `POST /api/admin/journal-collections/:id/translations/generate`
- `GET  /api/admin/journal-collections/:id/translations`

### Формат ответа (минимальный)

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

С ошибкой по языку:

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
      { "language": "de", "status": "DRAFT" },
      { "language": "sr", "status": "NEEDS_REVIEW" }
    ]
  }
}
```

## Required generate request body

UI currently sends:

- `sourceLanguage` (default `ru`)
- `targetLanguages`
- `includeSeo` (default true)
- `includeMedia` (default true)

Backend may ignore extra fields, но должен принять их без ошибки.

## Acceptance criteria

После включения backend:

- кнопка AI в админке журнала больше не показывает статус "Backend API не поддерживает...";
- кнопки AI-генерации активны;
- зелёный статус возможен только после успешного ответа с валидным `items`;
- ошибки по языку остаются предупреждающе/ошибочно отображаться именно для этого языка.

## Follow-up

После реализации этого backend-таска требуется:

- повторный smoke на live:
  - `POST /api/admin/posts/:id/translations/generate`
  - `GET /api/admin/posts/:id/translations`
  - те же для `/admin/journal-collections/:id/...`

  Для этих проверок нужен валидный админ-контекст (иначе ожидается 401).

Ссылка на frontend evidence: `admin-posts.js` + `admin-posts.html` (локальная версия).
