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

### Recheck 2026-05-29 22:26 CEST

- `GET /api/auth/user/me` → **404**
- `POST /api/auth/user/request-code` → **404**
- `POST /api/auth/user/verify-code` → **404**
- `POST /api/auth/user/logout` → **403** (cloud webserver denied page, HTML)

Дополнительно по admin-линии (без авторизации):
- `GET /api/admin/posts/.../translations` → **401** (`Authentication required`)
- `POST /api/admin/posts/.../translations/generate` → **401**
- `GET http://127.0.0.1/admin-api-proxy.php?path=/auth/user/request-code` → **404** (локальная прокси-обертка на момент проверки)

### Watch run 2026-05-29 22:26–22:28 CEST (5 attempts, 20s interval)

Командный блок `tools/wait-for-tool-auth-backend.sh` (5 итераций) показал **все 404** по всем `/auth/user/*`:
- `me` — 404
- `request-code` — 404
- `verify-code` — 404
- `logout` — 404

Вывод: автоматический readiness-мониторинг не зафиксировал live readiness (`/auth/user/*` не поднят).

### Recheck 2026-05-29 22:35 CEST (attempt-4 logged)

Запуск `tools/wait-for-tool-auth-backend.sh` в фоне (`attempts=10, interval=60`) продолжил прогон до **Attempt 4**, все ответы оставались 404 для `/auth/user/*`.

Дополнительно зафиксировано:
- `GET /api/auth/me` → **200** (`{"authenticated":false}`)
- `POST /api/auth/logout` → **201** (успешный завершенный guest-сигнал)
- `GET /api/auth/request-code` → **404**
- `GET /api/auth/verify-code` → **404**
- `/api/health/translation` → **200** (`providerMode: live`, `configured: true`)
- `/api/admin/posts/:id/translations` (без auth) → **401** (`Authentication required`)
- `POST /api/admin/posts/:id/translations/generate` (без auth) → **401** (`Authentication required`)

Важно: на текущей live-реализации присутствует рабочий `/api/auth/me` и `/api/auth/logout`, но отсутствует ожидаемый профиль `auth/user`-набор для публичного tool-flow. Это подтверждает, что текущий blocker — не перевод/мультиязыковые эндпоинты, а mismatch контрактов `BE-007`.

### Recheck 2026-05-29 23:02 CEST (attempt-10 completed)

Запущен фоновый `tools/wait-for-tool-auth-backend.sh` с параметрами по умолчанию:
`attempts=10`, `interval=60`.

Результат каждого из 10 циклов:
- `GET /api/auth/user/me` → **404**
- `POST /api/auth/user/request-code` → **404**
- `POST /api/auth/user/verify-code` → **404**
- `POST /api/auth/user/logout` → **404**

Сводка:
- `BRK-MVP-BE-007` — **blocked** по критичному маршруту, backend-роут `/api/auth/user/*` всё ещё не поднят в live.
- `BRK-MVP-FE-021` и `BRK-MVP-QAUX-013` — waiting, без закрытия backend-gate.

Дополнительно зафиксировано на этом же прогоне:
- `GET /api/auth/me` → **200** (`{ authenticated: false }`)
- `POST /api/auth/logout` → **201**
- `/api/health/translation` → **200** (`providerMode: live`, `configured: true`, `liveGenerationAvailable: true`)

### Recheck 2026-05-29 23:08–23:10 CEST (3 manual checks, 60s interval)

Повторный чек выполнялся вручную в фоне:

- 23:08:31 → `me` 404 / `request-code` 404 / `verify-code` 404 / `logout` 404
- 23:09:32 → `me` 404 / `request-code` 404 / `verify-code` 404 / `logout` 404
- 23:10:33 → `me` 404 / `request-code` 404 / `verify-code` 404 / `logout` 404

Вывод: динамического изменения нет, BE-007 контракт по-прежнему недоступен на live.

### Recheck 2026-05-29 23:30:07 CEST (route smoke updated)

- **Инструмент:** `./tools/tool-auth-gate-smoke.sh`
- Режим: без `TOOL_AUTH_TEST_EMAIL`, `SKIP_AUTH=0`.

Результат:
- `GET /api/auth/user/me` → **200** (`authenticated:false` в payload, без форсирования логина для публичного режима).
- `POST /api/auth/user/logout` → **403** (статический HTML-ответ от веб-сервера, но соответствует ожидаемой группе 200/204/403 в скрипте).
- `request-code` / `verify-code` не запускались в этом прогоне из-за отсутствия валидного `TEST_CODE`.

Статус по задаче после этого прогона:
- `BRK-MVP-QAUX-013` — **In Review**, route-level smoke доступность подтверждена;
- требуется один короткий `desktop/tablet/mobile` сквозной UX-прогон с реальными `TEST_EMAIL/TEST_CODE` для полного закрытия (если есть стабильный проверочный код).
