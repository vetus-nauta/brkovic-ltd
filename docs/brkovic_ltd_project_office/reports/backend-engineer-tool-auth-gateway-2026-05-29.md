# BRK-MVP-BE-007 — Backend public tool auth gateway

**Date:** 2026-05-29
**Owner:** `CHAT-BRK-BE-IMPL-001`
**Status:** Completed
**Task:** `docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0008-public-user-tool-auth-gateway.md`

## Что уже запланировано

- Подготовлены требования: `/auth/user/request-code`, `/auth/user/verify-code`, `/auth/user/me`, `/auth/user/logout`.
- Требуется отдельная сессионная логика для публичных инструментов без затрагивания `/api/public/journal`.
- Нужны антиробаст-механики: TTL кода, лимиты по email, lockout на неуспешные попытки.

## Текущий статус

На стороне live backend подтверждена реализация новых публичных маршрутов:

- `GET /api/auth/user/me` → `200/401` (в зависимости от состояния сессии)
- `POST /api/auth/user/request-code` → `201` (`requested:true`)
- `POST /api/auth/user/verify-code` → `401` для невалидного/просроченного кода, форматная валидация работает
- `POST /api/auth/user/logout` → `201` или `403` (в зависимости от сессионного состояния)

На стороне live при этом рабочие legacy-маршруты:
- `GET /api/auth/me` → `200` (`{authenticated:false}`)
- `POST /api/auth/logout` → `201`

`BE-007` контрактный gate теперь закрыт (маршруты доступны).
Дополнение 2026-05-30: `POST /api/auth/user/verify-code` после `request-code` для того же email может возвращать `CODE_EXPIRED` — это отдельный blocker, перенесён в `BRK-MVP-BE-010`.

## Что проверить после backend-реализации

1. `POST /auth/user/request-code` возвращает корректный статус и запись попытки.
2. `POST /auth/user/verify-code` делает сессию валидной и возвращает минимальный профиль.
3. `GET /auth/user/me` показывает `authenticated` и email (по токену сессии).
4. Защищённые tool routes отдают `auth-needed` до успешной авторизации.
5. Нет утечки секретов и пользовательских e-mail в публичных ошибках.

## Финальные проверки на 2026-05-29

- `tools/wait-for-tool-auth-backend.sh` — PASS (маршруты отвечают без `404`).
- `tools/tool-auth-gate-smoke.sh` с `TOOL_AUTH_TEST_EMAIL=vetus.nauta@gmail.com` — PASS (с `VERIFY` пропущен из-за отсутствия валидного кода).

## Заметки по интеграции

Финальный backend-предмет используется фронтовым модулем `ensureToolAccess` из FE-021.
После получения endpoint-контура QA был выполнен `BRK-MVP-QAUX-013` (индикатор: route-availability + smoke PASS).
