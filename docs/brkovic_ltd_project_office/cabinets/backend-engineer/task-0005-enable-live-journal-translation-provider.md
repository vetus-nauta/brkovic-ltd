# Task 0005 - Enable Live Journal Translation Provider

**Task ID:** `BRK-MVP-BEIMPL-005`
**Owner chat:** `CHAT-BRK-BE-IMPL-001`
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** `2026-05-29`
**Status:** `In Progress`
**Target completion:** `2026-05-30`

## Context

Админские эндпоинты перевода в проде уже доступны и отвечают (т.е. backend цепочка работает),
но текущий провайдер находится в stub-режиме. Нужен вывод в продакшен live-mode.

Прошлая проверка:
- `POST /api/admin/posts/:id/translations/generate` — 201
- `POST /api/admin/journal-collections/:id/translations/generate` — 201
- Ответы указывали: `provider.configured: false`, `providerMode: "stub"`, `liveGenerationAvailable: false`.

## Operating Boundaries

- Работа только с backend-репозиторием журнала:
  - `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`
- Не изменять frontend вручную (кроме документации в репозитории brkovic-ltd).
- Без деплоя.
- Без подключения/правок production FTP/DB.
- Без чтения/логирования/публикации секретов.

## Source Documents

- `docs/brkovic_ltd_project_office/cabinets/backend-engineer/README.md`
- `docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/backend-admin-translation-route-activation-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/openai-language-desk-implementation-notes-2026-05-27.md`
- `docs/brkovic_ltd_project_office/reports/backend-engineer-openai-language-desk-local-skeleton-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/openai-live-key-health-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/language-sprint-03-phase-02-live-auth-smoke-2026-05-29.md`

## Task

Поднять backend-составляющую переводов журнала в live-mode:

1. Проверить конфиг и bootstrap провайдера на backend (переменные окружения/внутренние флаги).
2. Настроить корректную инициализацию OpenAI-провайдера с `OPENAI_API_KEY` (и безопасным fallback только для local dev).
3. Обновить поведение endpoint'ов:
   - `POST /api/admin/posts/:id/translations/generate`
   - `GET /api/admin/posts/:id/translations`
   - `PATCH /api/admin/posts/:id/translations/:language`
   - `POST /api/admin/journal-collections/:id/translations/generate`
   - `GET /api/admin/journal-collections/:id/translations`
   - `PATCH /api/admin/journal-collections/:id/translations/:language`
4. Добавить/подправить health-индикатор, чтобы админка могла различать live/stub.
5. Убедиться, что endpoint для языков `en,de,it,es,sr,zh` действительно возвращает сгенерированные черновики, когда configured.

## Acceptance Checks

- `POST /api/admin/posts/:id/translations/generate` возвращает `provider.configured: true` и `providerMode: "live"` (или эквивалентный live-сигнал).
- Аналогично для `journal-collections`.
- Генерации для тестовых языков дают непустой `title`/`excerpt`/`content`.
- Флаги/ответы не раскрывают секреты и не ломают анонимный 401 для админ-маршрутов.
- Локальный dry-run и build проходят после изменения.

## Deliverable

Отчет:
`docs/brkovic_ltd_project_office/reports/backend-engineer-live-journal-translation-provider-2026-05-29.md`

## Required Commands

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
npm run build
```

После сборки backend-инженер делает короткий smoke-репорт по живому ответу прод-эндпоинтов через уже утвержденный локальный прокси/токен.

## Execution checkpoint (2026-05-29)

- Smoke on live passed route availability and auth checks for posts/collections translation endpoints.
- Provider remains `stub` (`configured=false`, `providerMode="stub"`) in both generate responses.
- Production currently does not serve `/api/health/translation`; health checks cannot confirm translation availability from this endpoint yet.
- Backend artifact used on prod has not fully absorbed the latest local hardening branch.

## Next Step

После выполнения этой задачи запускается hardening:
- `BRK-MVP-BEIMPL-006` (переход от включения live → production-ready стабильность).

## Current Live Smoke Evidence (2026-05-29)

- `BRK_ADMIN_EMAIL=vetus.nauta@gmail.com`, `JOURNAL_SMOKE_TRIGGER_GENERATION=1`,
  `JOURNAL_SMOKE_LANGS="en,de,it,es,sr,zh"`,
  `JOURNAL_TEST_POST_ID=11718191-e852-4db4-84fe-02b09e6ab717`,
  `JOURNAL_TEST_COLLECTION_ID=ddfd23e6-1cad-4341-a5fe-cd2467213229`.
- Auth smoke и route smoke подтвердились (401 anon, login 201, авторизованный list/post/generate для post и collection — `200/201`).
- `provider.configured=false`, `providerMode="stub"` остается на этапах generate.
- Нужное условие для завершения: переключить provider в live и убедиться, что метаданные становятся `true/live`.
