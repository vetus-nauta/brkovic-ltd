# Language Sprint 03 — Phase 01 Execution (2026-05-29)

**Task family:** `BRK-MVP-LOC-011` + `BRK-MVP-BE-005` follow-up
**Owner:** `CHAT-BRK-SEO-I18N-001` + `CHAT-BRK-BACKEND-001` + `CHAT-BRK-FE-IMPL-001`
**Mode:** Local frontend safety / admin workflow recovery

## Что включили в спринт (3 пункта)

1. **Стабилизировали состояние кнопок AI локализации в админке**
   - В `js/admin-posts.js` добавлен явный возврат в рабочий режим маршрутов AI после успешного вызова:
     - `generatePostTranslations`
     - `generateCollectionTranslations`
     - `listPostTranslations`
     - `listCollectionTranslations`
   - Убрали «залипание» `Backend не поддерживает` после одного временного сбоя и сделали восстановление статуса по успешному ответу.
   - Расширен детектор route-ошибок на HTTP `405` как дополнительный маркер неготового маршрута.

2. **Подготовили локальный smoke-контур для генерации по локалям**
   - В `tools/journal-admin-translation-smoke.sh` добавлен опциональный этап `TRIGGER_SMOKE`.
   - Добавлены параметры:
     - `JOURNAL_SMOKE_TRIGGER_GENERATION` (`0/1`, по умолчанию `0`)
     - `JOURNAL_SMOKE_LANGS` (по умолчанию `en,de,it,es,sr,zh`)
   - Стейдж 4 теперь может запускать проверку `POST` на множественных целевых языках для поста и коллекции.

3. **Синхронизировали кэш-бастер админки**
   - `admin-posts.html` обновлён до `v=20260529-ai-route-recovery-01` для корректной подгрузки правок JS после локального деплоя.

## Результат сборки/проверок

- `admin-posts.html`, `js/admin-posts.js`, `tools/journal-admin-translation-smoke.sh` изменены.
- Проверки синтаксиса:
  - `node --check js/admin-posts.js` — ожидается пройти (рекомендуется прогнать локально после завершения правок).
- Смоук в безопасном режиме без генерации поведения теперь поддерживает те же 4 базовых endpoint-а и не выполняет записи без явного флага.

## Следующий шаг (3-й пункт спринта продолжается)

- После выдачи реальных `BRK_TEST_POST_ID` и `BRK_TEST_COLLECTION_ID` и включения `JOURNAL_SMOKE_TRIGGER_GENERATION=1` — выполнить Stage 4 и зафиксировать live-ответы для:
  - `POST /admin/posts/:id/translations/generate` (языковой список: `en,de,it,es,sr,zh`)
  - `POST /admin/journal-collections/:id/translations/generate`
