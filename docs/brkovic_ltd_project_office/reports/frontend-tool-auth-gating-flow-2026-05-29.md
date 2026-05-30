# BRK-MVP-FE-021 — Tool access gating flow

**Date:** 2026-05-29
**Owner:** `CHAT-BRK-FE-IMPL-001`
**Status:** For Review
**Task:** `docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0021-tool-auth-gating-flow.md`

## Техническое намерение

- Не закрываем публичный контент.
- Перед запуском tool-flow показываем единый auth modal (Google + 6-значный код).
- Закрытие модалки через Esc и клик по фону.

## Интеграционный контракт

FE использует backend endpoints из `BRK-MVP-BE-007`:
- `/auth/user/request-code`
- `/auth/user/verify-code`
- `/auth/user/me`
- `/auth/user/logout`

## Текущий статус

Реализация интегрирована в `js/main.js` (все NavDesk entry-пункты и основные действия):

- добавлен единый modal-процесс `ensureToolAccess()` + `openToolAuthPrompt()`;
- добавлена устойчивость к сбоям статуса (`/auth/user/me`) и API-ошибкам;
- действия на tool-карточках/кнопках теперь требуются к авторизации (через общий модальный flow);
- при временной недоступности tool-endpoint показывается понятный fallback-текст внутри модалки;
- сохранён принцип: публичный контент остаётся открытым.

Окончательное закрытие QA ожидает развертывания backend endpoints `BE-007` в live и подтверждённого production smoke.

## План реализации

1. Добавить shared `ensureToolAccess()`.
2. Добавить универсальный auth modal для всех tool-entry точек.
3. Поднять флаг сессии в `sessionStorage`/локальном состоянии для уменьшения повторных промптов.
4. Протестировать на NavDesk hub + одной инструментальной странице.

## Примечания

- Дизайн-слой не меняем; только функциональная прослойка.
