# Language Sprint 03 — Phase 02 Live Auth Smoke (2026-05-29)

**Task family:** `BRK-MVP-LOC-011` + `BRK-MVP-BE-005`

## Что делали в этом проходе

Запуск:

```bash
JOURNAL_TEST_POST_ID=11718191-e852-4db4-84fe-02b09e6ab717 \
JOURNAL_TEST_COLLECTION_ID=11111111-1111-1111-1111-111111111111 \
BRK_ADMIN_EMAIL=site@brkovic.ltd \
BRK_ADMIN_PASSWORD=*** \
./tools/journal-admin-translation-smoke.sh --skip-auth
```

Т.к. это dry-run без auth (`--skip-auth`), сценарий выполнил только Stage 1.

## Результат

- Stage 1 (аноним): все 4 новых endpoints на `POST`/`GET` по локализации корректно возвращают `401`, значит прокси/маршрутизация на API присутствуют.
- Stage 2: login выполнен в режиме `--skip-auth` не запускался (как и ожидается в этой конфигурации), скрипт завершился корректно.
- Stage 3 и Stage 4 **не запускались** из-за режима без авторизации.

### Обновление (повторный запуск, 2026-05-29 18:56)

Команда:

```bash
JOURNAL_SMOKE_TRIGGER_GENERATION=1 \
JOURNAL_SMOKE_LANGS=\"en,de,it,es,sr,zh\" \
JOURNAL_TEST_POST_ID=11718191-e852-4db4-84fe-02b09e6ab717 \
JOURNAL_TEST_COLLECTION_ID=ddfd23e6-1cad-4341-a5fe-cd2467213229 \
BRK_ADMIN_EMAIL=vetus.nauta@gmail.com \
BRK_ADMIN_PASSWORD=*** \
./tools/journal-admin-translation-smoke.sh
```

Итог:

- Stage 1: OK.
- Stage 2: login OK (`201`).
- Stage 3: авторизованный список/создание переводов для post + collection — OK (`200`, `201`).
- Stage 4 (многоязычный smoke): OK (`201`), но в ответах backend видно `provider.configured: false`, `providerMode: "stub"`, `liveGenerationAvailable: false` (т.е. endpoint существует и обрабатывает запрос, но живой AI-провайдер не включен).

Вывод: для **технической доступности** endpointов переводов статус = PASS. Для **реального production-контента** нужен отдельный backend-step по включению live AI провайдера.

## Пробный запуск в полном режиме (без `--skip-auth`)

Команда с теми же ID и попыткой логина через redacted FTP-style credentials дала `401`, т.е. эти credentials не подходят к API `/api/auth/login`.

## Блокеры для следующего шага

1. Включить backend live-провайдер для реальных переводов (`providerMode=live`).
2. Показать production endpoint `/api/health/translation` для быстрой диагностики режима провайдера.
3. После включения live повторно прогнать Stage 4 с теми же ID и логином:

```bash
JOURNAL_SMOKE_TRIGGER_GENERATION=1 \
JOURNAL_SMOKE_LANGS="en,de,it,es,sr,zh" \
JOURNAL_TEST_POST_ID=<real-post-id> \
JOURNAL_TEST_COLLECTION_ID=<real-collection-id> \
BRK_ADMIN_EMAIL=<email> BRK_ADMIN_PASSWORD=<password> \
./tools/journal-admin-translation-smoke.sh
```

## Вывод по этапу

Текущий спринтный этап сейчас считается `Ready for backend-live`:
переходы и авторизация на проде проходят, stage4 по маршрутам и статусам проходит,
дальше блокирует только конфигурация провайдера (`stub` вместо `live`).

### Короткая сводка от повторной проверки (19:14 CEST)

Повторный запуск с `BRK_ADMIN_EMAIL=vetus.nauta@gmail.com` и `BRK_ADMIN_PASSWORD` (на уровне чата) дал:
- Stage 1 = OK,
- Stage 2 login = `201`,
- Stage 3 и Stage 4 = `201` для поста и коллекции,
- Ответ API по-прежнему: `provider.configured=false`, `providerMode="stub"`, `liveGenerationAvailable=false`.
