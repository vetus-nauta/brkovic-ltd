# Task 0010 — Tool Auth Email Code Delivery & TTL Consistency

**Task ID:** `BRK-MVP-BE-010`
**Owner:** `CHAT-BRK-BE-IMPL-001`
**Status:** `Ready`
**Date:** `2026-05-30`
**Depends on:** task-0008-public-user-tool-auth-gateway, task-0009-be007-canonical-route-deployment

## Goal

Устранить блокер с авторизацией по email для NavDesk:
- письмо с кодом не доходит до пользователя;
- код считается просроченным почти сразу после запроса;
- после 429/локов невозможно попасть в рабочий цикл запроса-кода.

## Обнаруженный симптом (публичная проверка 2026-05-30)

```bash
curl -i -X POST https://brkovic.ltd/api/auth/user/request-code -H 'Content-Type: application/json' -d '{"email":"test@example.com"}'
curl -i -X POST https://brkovic.ltd/api/auth/user/verify-code -H 'Content-Type: application/json' -d '{"email":"test@example.com","code":"123456"}'
```

- `request-code` возвращает `201` и `ttlSeconds:600`;
- следующий `verify-code` для того же e-mail немедленно возвращает `401 CODE_EXPIRED`;
- для часто используемого адреса возвращается `429 REQUEST_THROTTLED`;
- для пользователя это выглядит как «письмо не пришло».

## Что проверить и поправить в backend

1. Отдельная диагностика цепочки:
   - запись/чтение последнего `ToolUserCode` (`requestedAt`, `expiresAt`, `consumedAt`, `codeHash`);
   - консистентность сравнения `expiresAt <= now`;
   - единицы времени и timezone.
2. Подтвердить, что `request-code` не пишет сразу код в состояние `consumedAt`;
3. Подтвердить, что в production `codeHash` вычисляется и верифицируется строго по одному алгоритму.
4. Реализовать/проверить факт отправки code-email в бою (SMTP/почтовый провайдер или queue-пайплайн). В текущей кодовой базе `ToolUser`/`ToolUserCode` не содержит явного email-провайдера, это отдельная проверка.
5. Добавить безопасный эксплуатационный debug-сервис для админа (не открытый пользователю):
   - временный `debugCode` только при `NODE_ENV!==production` или в административном контексте;
   - отдельный QA-скрипт для чтения последнего кода из DB на staging.
6. Проверить антифрод:
   - `REQUEST_THROTTLED` для частых запросов,
   - `CODE_LOCKED`/`cooldownUntil`,
   - корректная очистка старых записей.

## Acceptance criteria (hard)

- `[ ]` Для нового почтового адреса после `request-code` сразу `verify-code` с правильным кодом не дает `CODE_EXPIRED`.
- `[ ]` При неверном коде возвращается `401 Invalid verification code` (не `CODE_EXPIRED`).
- `[ ]` Письмо реально доходит до пользователя; есть proof из логов отправки или явный тестовый endpoint в безопасном режиме.
- `[ ]` `REQUEST_THROTTLED` срабатывает только по описанной политике (не блокирует корректный первый запрос).
- `[ ]` Код не становится просроченным/сразу же `consumed` без фактической проверки.
- `[ ]` Нет изменения публичного контракта FE/JS (только backend/почтовый слой + диагностика).

## Предпочтительный порядок выполнения

1. Разобрать текущие логи/таблицы `ToolUserCode` + воспроизвести на одном request-id с timestamp.
2. Исправить TTL и/или selection logic (если ошибка в проверке срока жизни/выборе последней записи).
3. Подключить/включить доставку email-кода в боевой канал.
4. Прогонить smoke (локально и на бою):
   - `tools/wait-for-tool-auth-backend.sh`
   - `tools/tool-auth-gate-smoke.sh`
5. Передать QA/FE результат и закрыть `BRK-MVP-BE-010` только после greenline.

## Notes

- Не трогать `admin`-flow и существующий UI, пока не закрыт блокер.
- Файл-артефакт должен дублировать диагностику в:
  - `reports/backend-tool-auth-otp-gate-smoke-2026-05-30.md` (после выполнения).
