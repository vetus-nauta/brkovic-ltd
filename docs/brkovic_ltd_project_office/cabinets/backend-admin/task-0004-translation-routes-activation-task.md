# Chat Assignment

**Chat ID:** `CHAT-BRK-BACKEND-001`
**Department:** Backend/Admin Integrity
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-28
**Task ID:** `BRK-MVP-BE-005`
**Status:** For Review

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Source Documents

```text
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
admin-posts.html
js/admin-posts.js
admin-api-proxy.php
```

## Task

Включить backend API маршруты для AI-генерации локализаций в админке журнала, которые сейчас отсутствуют на live API.

Подтвердить по факту:

- `POST /api/admin/posts/:id/translations/generate` (ошибка сейчас: `Cannot POST .../translations/generate`)
- `POST /api/admin/journal-collections/:id/translations/generate`
- и, если возможно, `GET` версии списков локализаций для чтения статусов:
  - `GET /api/admin/posts/:id/translations`
  - `GET /api/admin/journal-collections/:id/translations`

## Что нужно сохранить в контракте

Для UI `js/admin-posts.js` сейчас ожидается следующий минимальный контракт:

### 1) Generate

`POST /api/admin/posts/:id/translations/generate`

Payload:

```json
{
  "sourceLanguage": "ru",
  "targetLanguages": ["en", "de", "it", "es", "sr", "zh"],
  "includeSeo": true,
  "includeMedia": true
}
```

Response (`items` can be per-language, partial success supported):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "language": "de",
        "status": "DRAFT",
        "skipped": false,
        "reason": null
      }
    ]
  }
}
```

На ошибку по конкретному языку — отдельный элемент:

```json
{
  "language": "zh",
  "status": "FAILED",
  "error": "No source text for field contentRu"
}
```

Аналогично для `/journal-collections/:id/translations/generate`.

### 2) List

`GET /api/admin/posts/:id/translations`

Response:

```json
{
  "success": true,
  "data": {
    "translations": [
      { "language": "en", "status": "PUBLISHED" },
      { "language": "de", "status": "NEEDS_REVIEW" },
      { "language": "it", "status": "DRAFT" },
      { "language": "es", "status": "MISSING" }
    ]
  }
}
```

Аналогично для коллекций.

## Acceptance for frontend behavior

После внедрения:

- кнопки AI в админке должны перейти в рабочий режим;
- статус должен быть зелёным только при `status: DRAFT|NEEDS_REVIEW|PUBLISHED` в успешном ответе;
- при `status: FAILED` или сетевой/валидационной ошибке статус и кнопки должны оставаться ошибочными/предупреждающими.

## Notes

- Эти маршруты должны быть защищены admin auth/session через существующий механизм.
- Публикация автоматически не выполняется; генерируемый материал не должен становиться public без отдельного шага owner review.
- Это не фронтенд-патч; только backend маршруты и/или реализация в рабочем backend.

