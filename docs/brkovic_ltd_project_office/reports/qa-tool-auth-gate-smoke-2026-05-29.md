# BRK-MVP-QAUX-013 — Tool auth gate smoke

**Date:** 2026-05-29  
**Owner:** `CHAT-BRK-QA-UX-001`  
**Status:** In Review  
**Task:** `docs/brkovic_ltd_project_office/cabinets/qa-ux/task-0013-tool-auth-gate-smoke.md`

## Цель

Проверить, что public-читка не блокируется, а действия в инструментах корректно требуют авторизации.

## Smoke-сценарий (один прогон после интеграции)

1. Открыть public read flow (home/services/journal) — проверка отсутствия принудительного логина.  
2. NavDesk hub: клик по tool-card -> auth modal.  
3. Esc и клик по backdrop закрывают modal.  
4. Email flow: запрос кода и верификация продолжают инструмент только после подтверждения.  
5. Повторный вход в сессии не должен пинговать авторизацию каждый раз.  
6. Проверить desktop/tablet/mobile.

## Результат текущего smoke (попытка v1)

FE-часть включена и структура готова к одному прогону, но `BE-007` пока блокирует сценарий:

- `GET https://brkovic.ltd/api/auth/user/me` → `404` (json: `Cannot GET /api/auth/user/me`)
- `POST https://brkovic.ltd/api/auth/user/request-code` → `404` (json: `Cannot POST /api/auth/user/request-code`)
- `POST https://brkovic.ltd/api/auth/user/verify-code` → `404` (json: `Cannot POST /api/auth/user/verify-code`)
- `POST https://brkovic.ltd/api/auth/user/logout` → `403` (cloud-webserver page access denied)
- `http://127.0.0.1/admin-api-proxy.php?path=/auth/user/*` (локально через прокси) → `404` на `me/request-code/verify-code` (прокси-профиль разрешает маршрут, но backend на live не отдаёт эти handlers).

Вывод: smoke остается в статусе blocked до полного включения backend-роутов.

Следующий шаг: после live-подтверждения `BE-007` выполнить один короткий прогон:
- desktop / tablet / mobile  
- modal open → Esc/backdrop close  
- request-code + verify + повторный проход в сессии.

## Актуальный локальный recheck (2026-05-29 22:09 CEST)

- **Инструмент:** `tools/tool-auth-gate-smoke.sh`
- **Команда:** `./tools/tool-auth-gate-smoke.sh`
- **Режим:** remote host `/api` без `TOOL_AUTH_TEST_EMAIL` (без request-code verify)

Результат:
- `GET /api/auth/user/me` → **404**
- `POST /api/auth/user/logout` → **403** (webserver-level response)

Статус остаётся:
- `BRK-MVP-QAUX-013` — `In Review / Blocked by backend`
- Ожидаемый проход на всех режимах после подключения `BE-007` (real endpoints `/auth/user/*` + tool route guards).

## Быстрый мониторинг readiness

Добавлен инструмент `tools/wait-for-tool-auth-backend.sh` для фонового ожидания подъема маршрутов:

```bash
TOOL_AUTH_MAX_ATTEMPTS=10 TOOL_AUTH_INTERVAL_SECONDS=60 tools/wait-for-tool-auth-backend.sh
```

Команда пишет в `/tmp/tool-auth-backend-watch.log`.

Актуальный однопроходный запуск (сейчас) показывает:
- `/auth/user/me` → 404
- `/auth/user/request-code` → 404
- `/auth/user/verify-code` → 404
- `/auth/user/logout` → 404 (POST)
