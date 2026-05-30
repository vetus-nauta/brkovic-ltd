# Task 0007 — Live Translation Provider Fastlane (Single Shot)

**Task context:** `BRK-MVP-BEIMPL-005` + `BRK-MVP-BEIMPL-006`
**Owner:** `CHAT-BRK-BE-IMPL-001`
**Date:** `2026-05-29`
**Mode:** `single-shot` (no repeated checks loop)

## Goal

Bring journal backend translation provider from `stub` to `live` on production and close hardening requirements with one bounded verification pass.

## Hard constraints

- Не выполнять циклических проверок.
- Никаких изменений frontend.
- Не трогать ftp/db напрямую без отдельного deployment-задачи.
- Не выводить ключи и токены в лог/чат.

## 1) Deploy switch (required state)

В production окружении API установить:

- `OPENAI_PROVIDER_MODE=live`
- `OPENAI_API_KEY=<secret>`
- `OPENAI_MODEL` / `OPENAI_CHAT_MODEL` (по текущей конфигурации проекта)

После этого собрать и перезапустить journal API (или иным согласованным способом деплоя backend).

## 2) One-shot verification (one run only)

Запустить один smoke-проход на бою:

```bash
export JOURNAL_SMOKE_TRIGGER_GENERATION=1
export JOURNAL_SMOKE_LANGS="en,de,it,es,sr,zh"
export BRK_ADMIN_EMAIL=vetus.nauta@gmail.com
export BRK_ADMIN_PASSWORD='(secure password input)'
export JOURNAL_TEST_POST_ID=11718191-e852-4db4-84fe-02b09e6ab717
export JOURNAL_TEST_COLLECTION_ID=ddfd23e6-1cad-4341-a5fe-cd2467213229

cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
tools/journal-admin-translation-smoke.sh
```

Дополнительно в том же проходе:

- `curl -i https://brkovic.ltd/api/health`
- `curl -i https://brkovic.ltd/api/health/translation`
- (по возможности) GET `/api/admin/posts/.../translations` и `/api/admin/journal-collections/.../translations`

## 3) Success criteria (единый DoD)

- Live smoke return для generate:
  - `provider.configured === true`
  - `providerMode === "live"`
  - `liveGenerationAvailable === true`
- Тексты переводов в ответе не пустые (`title`, `excerpt`, `content`).
- `/api/health/translation` отвечает 200 и содержит `translation.health`.
- `/api/health` не деградирует.
- Результат оформить в:
  - `docs/brkovic_ltd_project_office/reports/backend-engineer-live-journal-translation-provider-2026-05-29.md`
  - `docs/brkovic_ltd_project_office/reports/backend-engineer-journal-translation-production-hardening-2026-05-29.md`

## 4) Failure rule

Если хотя бы один из пунктов DoD не выполнен:
- зафиксировать, на каком шаге остановился провайдер (config / startup / route / model),
- не продолжать дополнительный цикл,
- передать короткий отчет в логи и статус "blocked for config fix".

## 5) Post-condition

- После закрытия `BRK-MVP-BEIMPL-005` и `BRK-MVP-BEIMPL-006` запускать `BRK-MVP-QAUX-012` один раз (desktop/tablet/mobile, day/night).
