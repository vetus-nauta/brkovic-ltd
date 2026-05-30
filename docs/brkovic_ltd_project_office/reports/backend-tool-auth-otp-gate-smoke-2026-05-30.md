# Backend auth OTP: код-доставка и TTL (проверка 2026-05-30)

## Дата
2026-05-30

## Что проверено

Запросы на живой API:

```bash
EMAIL=navdesk-test-$(date +%s)@example.com
curl -i -X POST https://brkovic.ltd/api/auth/user/request-code -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'"}'
curl -i -X POST https://brkovic.ltd/api/auth/user/verify-code -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'","code":"123456"}'
curl -i -X POST https://brkovic.ltd/api/auth/user/verify-code -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'","code":"000000"}'
```

Дополнительно проверен `request-code` на уже нагруженном адресе:

```bash
EMAIL=vetus.nauta@gmail.com
curl -i -X POST https://brkovic.ltd/api/auth/user/request-code -H 'Content-Type: application/json' -d '{"email":"'$EMAIL'"}'
```

## Наблюдаемое поведение

- Новый адрес:
  - `POST /api/auth/user/request-code` → `201`, `{"requested":true,"ttlSeconds":600,"provider":"email"}`.
- Сразу после этого:
  - `POST /api/auth/user/verify-code` → `401 CODE_EXPIRED`, даже с другим случайным 6-значным кодом.
- На уже часто используемом адресе:
  - `POST /api/auth/user/request-code` → `429 REQUEST_THROTTLED` («Too many code requests from this email»).

## Вывод

Почти наверняка две проблемы:

1. Проверка срока жизни кода в `verify-code` срабатывает некорректно (критичный blocker);
2. Повторяемость запросов и лимитирование пока перекрывают рабочий цикл, поэтому пользователь получает ощущение «письмо не приходит».

## Почему это критично для UX

- Пользователь не может пройти авторизацию для инструментов NavDesk;
- Без доставляемого/видимого кода невозможно продолжать локальный workflow;
- После локального `201` и мгновенного `CODE_EXPIRED` любой визуальный UX-этаж теряет смысл.

## Дальнейшее действие

Запущена задача:
- `BRK-MVP-BE-010` — `docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0010-tool-auth-code-delivery-and-ttl.md`

Следующий шаг: backend implementer проводит разбор БД-логов OTP (`ToolUserCode`) и проверку конвейера доставки.

## 2026-05-30 — локальная правка (backend copy)

### Что уже исправлено в рабочей копии backend

- Исправил расчёт TTL в `verify-code`: `parseDbTimestamp()` больше не делает искусственный сдвиг `Date` через `getTimezoneOffset`.
- Это устраняет эффект «`CODE_EXPIRED` сразу после запроса» на серверах с локальной timezone +2/+3.

### Что осталось для закрытия `greenlight`

- Деплой изменений в production и повторный smoke на живом `/api/auth/user/request-code` + `/verify-code`.
- Подтверждение фактической доставки письма (или, если провайдер пока не доступен, получение корректного диагностического `EMAIL_NOT_CONFIGURED`).
- После деплоя обновить статус `BRK-MVP-BE-010` и снять `Fail` по языковой блокировке/OTP.
