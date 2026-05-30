# Backend Live Acceptance Callback (for BRK-MVP-BEIMPL-005 / BRK-MVP-BEIMPL-006)

Использовать как единый формат ответа backend-инженера перед закрытием спринта.

## Ответ после деплоя (что прислать)

- **Дата/время (CEST):**
- **Сервер/хост:** `brkovic.ltd`
- **Деплой:** пересобран / перезапущен (`yes/no`)
- **ENV:** `OPENAI_PROVIDER_MODE=live` (`yes/no`)
- **OPENAI key:** применён (`yes/no`, без значения)

## Метрики состояния (обязательно, one-shot)

1. `curl -i https://brkovic.ltd/api/health/translation`
   - статус:
   - body (ключевые поля):

2. `tools/journal-admin-translation-smoke.sh` с:
   - `JOURNAL_SMOKE_TRIGGER_GENERATION=1`
   - `JOURNAL_SMOKE_LANGS="en,de,it,es,sr,zh"`

3. Отчёт по `POST` generate:
   - `provider.configured`
   - `providerMode`
   - `liveGenerationAvailable`
   - `providerError` / `errorCode` (если есть)
   - непустые `title`, `excerpt`, `content` по одному языку из матрицы

4. Отчёт по `Collection` generate:
   - те же поля и критерии

## Критерий PASS для green

- `provider.configured == true`
- `providerMode == "live"`
- `liveGenerationAvailable == true`
- `/api/health/translation` отвечает `200` и содержит раздел `translation.health`
- хотя бы один ответный язык имеет непустой контент в черновом переводе

## Что прислать, если FAIL

- Где зафиксирован стоп:
  - config
  - startup
  - route
  - provider call
- Приложить тело ответа из `generate` и `health`, без секретов.
