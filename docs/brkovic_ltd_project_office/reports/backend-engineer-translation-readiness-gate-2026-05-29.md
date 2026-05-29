# Journal Translation Backend Readiness Gate (Bridge BRK-MVP-BEIMPL-005/006)

**Date:** 2026-05-29  
**Branch:** `handoff-2026-05-20-full`  
**Context:** Language Sprint 03 continuation

## Уровень 1: включение live-провайдера (`BRK-MVP-BEIMPL-005`)

Выполнено/ожидается:

1. `POST /api/admin/posts/:id/translations/generate` доступен и отрабатывает после авторизации.
2. `POST /api/admin/journal-collections/:id/translations/generate` доступен и отрабатывает после авторизации.
3. `provider.configured` становится `true` и `providerMode` становится `live` (или аналог).
4. Для хотя бы одного запроса `de/en/it/es/sr/zh` возвращаются непустые draft-поля.

### Блокеры уровня 1 (состояние на закрытии)

- 401/403 после авторизации (т.е. auth-слой ломается)
- Пустой `title/excerpt/content` без ошибок валидации

### Фактическое состояние на 2026-05-29

- `Auth smoke` пройден: все проверяемые анонимные и авторизованные маршруты отвечают корректно (401/200).
- `provider.configured=true` и `providerMode=live` на обоих путях generate.
- Health диагностика на `/api/health/translation` подтверждает live provider (`configured=true`, `liveGenerationAvailable=true`).

### Актуальные проверки по завершению (2026-05-29 23:29 CEST)

- `GET /api/health/translation` → `configured=true`, `providerMode=live`, `model=gpt-4o-mini`, `liveGenerationAvailable=true`.
- Одношотовый smoke `tools/journal-admin-translation-smoke.sh` с валидными `BRK_ADMIN_*`:
  - anon 401 для всех checked routes
  - auth 200/201 для post+collection endpoints и многозаглавная генерация (`en,de,it,es,sr,zh`)
  - generate payload содержит `provider`-метаданные с live состоянием.

## Уровень 2: production hardening (`BRK-MVP-BEIMPL-006`)

1. Есть endpoint/метод диагностики провайдера (safe health): live/stub/disabled, model, последнее состояние.
2. Поддержан idempotent flow:
   - без `force` не перезаписывает существующий draft;
   - с `force=true` выполняет явную перегенерацию.
3. Языки валидируются на белом списке `en,de,it,es,sr,zh` с стабильным кодом ошибки при invalid.
4. Поддержка машиночитаемых ошибок:
   - `MISSING_KEY`, `PROVIDER_UNAVAILABLE`, `PROVIDER_REJECTED`, `VALIDATION_FAILED`, `PARTIAL_MEDIA_MISMATCH`.
5. Защита от дублей/спама генерации (rate limit/lock).
6. `npm run build` в backend-копии green.

## Что считать готовностью к релизу backend-потока

- UI-скрипт для AI-кнопок больше не показывает "backend не поддерживается".
- Кнопка "Generate" для post/collection:
  - возвращает понятный `items` статус,
  - показывает отдельную ошибку на язык при частичном отказе.
- Backend-админка и логика не регрессируют на статусы/публикации постов.

## Проверочный порядок

1. Auth smoke (чужой пользователь) → 401  
2. Auth smoke (валидный токен) на generate/get для post и collection  
3. Health-показатель провайдера  
4. Язык-матрица + валидирование невалидного языка  
5. idempotency сценарий: без force vs force  
6. Smoke build + summary
