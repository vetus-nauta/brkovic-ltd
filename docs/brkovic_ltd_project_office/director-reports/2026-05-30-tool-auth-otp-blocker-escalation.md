# 2026-05-30 — Tool Auth OTP Blocker Escalation

**Цель:** зафиксировать blocker для быстрого входа в инструменты NavDesk.

## Что случилось

- Frontend modal и маршруты `/api/auth/user/*` уже используются.
- На живой API `POST /api/auth/user/request-code` возвращает `201`.
- Сразу после запроса `POST /api/auth/user/verify-code` возвращает `401 CODE_EXPIRED`.
- Пользовательский вывод выглядит как «письма не приходят».

## Что это блокирует

- Защита/авторизация в NavDesk для не‑админов не может быть завершена.
- Личный рабочий процесс на мобильных/десктопах с email-code не запускается.
- Преждевременный deploy невозможен по смыслу, даже при зелёном FE.

## Что сделано

- Открыта задача backend:
  - `BRK-MVP-BE-010` (`CHAT-BRK-BE-IMPL-001`);
  - артефакт: `cabinets/backend-engineer/task-0010-tool-auth-code-delivery-and-ttl.md`
- Обновлены:
  - `docs/brkovic_ltd_project_office/task-registry.md`
  - `docs/brkovic_ltd_project_office/workstreams.md`
- Подготовлен отчёт наблюдения:
  - `docs/brkovic_ltd_project_office/reports/backend-tool-auth-otp-gate-smoke-2026-05-30.md`

## Правило для дальнейшей очереди

Ни один UI-спринт не закрывает релизный блок, пока не закрыт `BRK-MVP-BE-010`:
- `CODE_EXPIRED` не должен возникать для только что запрошенного кода;
- должен быть доказуемый путь доставки/получения кода для пользователя;
- после этого запуск `BRK-MVP-QAUX-014`.
