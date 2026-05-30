# Backend auth code flow: immediate CODE_EXPIRED/No active request

## Дата
2026-05-29

## Проверка
```bash
EMAIL="check$(date +%s)@example.com"
curl -sS -H 'Content-Type: application/json' -d '{"email":"'"$EMAIL"'"}' https://brkovic.ltd/api/auth/user/request-code
curl -sS -H 'Content-Type: application/json' -d '{"email":"'"$EMAIL"'","code":"123456"}' https://brkovic.ltd/api/auth/user/verify-code
curl -sS -H 'Content-Type: application/json' -d '{"email":"'"$EMAIL"'","code":"111111"}' https://brkovic.ltd/api/auth/user/verify-code
```

## Наблюдаемое поведение
- `POST /api/auth/user/request-code` возвращает:
  `201` + `{"success":true,"data":{"success":true,"data":{"requested":true,"ttlSeconds":600,"provider":"email"}}}`
- Сразу после этого первый `verify-code` возвращает `401 CODE_EXPIRED`.
- Следующий `verify-code` для того же email возвращает `No active code request found`.

## Вывод
Механика выдачи/проверки кода на backend ломается на валидации — код считается просроченным/неактивным почти сразу после запроса. Это объясняет, почему для пользователя выглядит как «письма не приходят».

## Предложение по фиксу BE
1. Проверить хранение `expiresAt`/`createdAt` и единицы времени (секунды vs миллисекунды).
2. Проверить выборку активного code-record: по email+code+status+expiry.
3. При `request-code` временно возвращать debug-код в non-prod/стабовом окружении (чтобы отладка шла без почты).
4. Вернуть `request-code` и `verify-code` в консистентные error-коды.
