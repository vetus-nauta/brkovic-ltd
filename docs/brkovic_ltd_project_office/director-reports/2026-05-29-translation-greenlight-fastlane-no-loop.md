# 2026-05-29 — Fastlane для зелёного гринлайта (без вечных проверок)

## Нынешний стоп-факт
- Frontend задачи по языковому меню выполнены по логике (один активатор языка в меню + модалка), фронтовые правки находятся в состоянии финальной валидации.
- Основной блокер: backend жёстко остаётся на `provider.configured=false`, `providerMode="stub"`, `liveGenerationAvailable=false`.
- `/api/health/translation` на бою до сих пор `404`; это подтверждает, что продовый артефакт требует развёртывания/сборки или обновления маршрутов.
- Не запускаем теперь циклические проверки каждую минуту — только **один** целевой контроль после каждого этапа бэкэнда.

## План выхода в зелёный (3 шага)

### Шаг 1. BEIMPL-005 (критичен)
**Цель:** перевести провайдер на live, без правок frontend.

Требования к backend-инженеру (`CHAT-BRK-BE-IMPL-001`):
1. В production-конфиге/переменных выставить:
   - `OPENAI_PROVIDER_MODE=live`
   - `OPENAI_API_KEY=<секрет>`
   - `OPENAI_MODEL` / `OPENAI_CHAT_MODEL` по готовому окружению (если используются).
2. Проверить, что на проде отвечает локально реализованный маршрут диагностики провайдера.
3. Пересобрать и перезапустить сервис API журнала.
4. Отчитаться только фактами в `reports/backend-engineer-live-journal-translation-provider-2026-05-29.md`:
   - `provider.configured=true`
   - `providerMode="live"`
   - `liveGenerationAvailable=true`
   - `POST /admin/posts/.../translations/generate` и `POST /admin/journal-collections/.../translations/generate` возвращают содержательные тексты.

### Шаг 2. BEIMPL-006
**Цель:** production-hardening после live.

Что закрываем:
- idempotency для повторных generate,
- обработка ошибок провайдера,
- единый сигнал состояния в health,
- корректные статусы в журнале задач.

После получения отчёта backend для `...-hardening-2026-05-29.md` переводим обе задачи в `Approved` или `Gate Closed`, если QA допускает.

### Шаг 3. QAUX-012 (ровно один запуск)
После финального подтверждения BEIMPL-005/006:
1. Один browser smoke в 3 вьюхах (desktop/tablet/mobile) на day/night.
2. Проверяем только меню языка и системную подсказку.
3. Если OK — закрываем `BRK-MVP-QAUX-012` и даём релизный статус.

## Единый контрольный чек (после каждого backend-деплоя)
`tools/journal-admin-translation-smoke.sh` запускаем **один раз**, с `JOURNAL_SMOKE_TRIGGER_GENERATION=1` и рабочими `BRK_ADMIN_*`.

Пример:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
export JOURNAL_SMOKE_TRIGGER_GENERATION=1
export JOURNAL_SMOKE_LANGS="en,de,it,es,sr,zh"
export BRK_ADMIN_EMAIL=vetus.nauta@gmail.com
export BRK_ADMIN_PASSWORD='<redacted>'
export JOURNAL_TEST_POST_ID=11718191-e852-4db4-84fe-02b09e6ab717
export JOURNAL_TEST_COLLECTION_ID=ddfd23e6-1cad-4341-a5fe-cd2467213229
tools/journal-admin-translation-smoke.sh
```

Если после этого backend подтверждает live — дальнейших проверок до задачи не делаем, чтобы не выжигать время.
