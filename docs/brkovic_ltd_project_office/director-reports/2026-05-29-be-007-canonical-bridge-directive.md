# Directive — BRK-MVP-BE-007 Canonical Auth Bridge

**Date:** 2026-05-29
**From:** Director
**To:** `CHAT-BRK-BE-IMPL-001`

## Что нужно сделать прямо сейчас

Мы зафиксировали blocker по auth-flow: frontend (tool-access) ждёт публичный контракт
`/api/auth/user/*`, но на бою доступны только старые `/api/auth/*` для `me/logout`.

Требование без костылей:

1. Поднять/подтвердить в production (live) полный набор:
   - `GET /api/auth/user/me`
   - `POST /api/auth/user/request-code`
   - `POST /api/auth/user/verify-code`
   - `POST /api/auth/user/logout`
2. Реализовать alias-совместимость:
   - `/api/auth/me` -> тот же хендлер, что и `/api/auth/user/me`
   - `/api/auth/logout` -> тот же хендлер, что и `/api/auth/user/logout`
3. Сохранить единый модуль сессий и anti-abuse для всех вариантов (без дублирования логики).

## Когда я считаю задачу закрытой

- `GET /api/auth/user/me` на live возвращает 200 + `{authenticated: ...}`.
- `POST /api/auth/user/request-code` не 404 и возвращает стабильный auth-flow response.
- `POST /api/auth/user/verify-code` валидирует код и возвращает payload.
- `POST /api/auth/user/logout` возвращает успех.
- Алиасы `/api/auth/me` и `/api/auth/logout` возвращают идентичный payload/семантику.
- После этого запускаю 1-й полноценный FE smoke:
  - `tools/wait-for-tool-auth-backend.sh` с маршрутом `/api/auth/user/*`
  - `tools/tool-auth-gate-smoke.sh`

## Отчёт

Пожалуйста, присылай: `task-0009-be007-canonical-route-deployment.md` + короткий лог с curl для 5 точек выше.
