# Task 0006 - Production Hardening: Journal Translation Operations

**Task ID:** `BRK-MVP-BEIMPL-006`
**Owner chat:** `CHAT-BRK-BE-IMPL-001`
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** `2026-05-29`
**Status:** `In Progress`
**Target completion:** `2026-06-02`

## Цель

Сделать backend-часть многоязычных переводов судового журнала production-grade: управляемая, наблюдаемая и безопасная.
Это не только «включить OpenAI», а закрыть поведение после live-включения: health, стабильность, idempotency, диагностика и контроль ошибок.

## Контекст

После `BRK-MVP-BEIMPL-005` endpointы уже работают, но провайдер переводов сейчас может работать как `stub`.
Нужно:
1) гарантированно понимать состояние провайдера,
2) не терять и не ломать данные при генерации,
3) иметь контролируемый путь обработки ошибок и статусностей.

### Старт задачи

01. Зафиксировать текущий статус (stub/live) до и после hardening.
02. Применить изменения по списку ниже.
03. Передать отчёт с конкретными метриками готовности и блокерами.

Минимальные старт-команды:

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
git status --short --branch
npm run build
```

## Обязательная зона работ (backend)

Работа только в:

- `/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src`
- `/home/alexey/.local/share/brkovic-ltd/work/journal-backend/prisma`
- `/home/alexey/.local/share/brkovic-ltd/work/journal-backend/package.json` (если потребуется)
- отчёты в: `docs/brkovic_ltd_project_office/reports/**`

## Scope (конкретика)

### 1) Provider observability и health
- Добавить endpoint (или расширить текущий), который явно показывает:
  - configured (наличие валидного ключа/настроек),
  - providerMode (`live|stub|disabled`),
  - model,
  - lastError,
  - lastSuccessfulCheck,
  - feature flags translation endpoint (posts/collections).
- Не раскрывать secrets в ответах.

### 2) Idempotent и управляемая генерация
- Для `POST .../translations/generate` добавить явный контракт:
  - `?force=true` — принудительный перегенерировать,
  - default поведение: вернуть уже существующий draft если есть и данные не требуют перегенерации,
  - при наличии свежей рукописной `PUBLISHED` версии не перезаписывать.
- Логировать структуру ошибки в контролируемом формате (код, язык, сущность, причина).

### 3) Ограничения и валидации
- Валидировать список языков строго:
  - `en`, `de`, `it`, `es`, `sr`, `zh`.
- Верифицировать корректность контракта перевода:
  - `title`, `excerpt`, `content`, `seoTitle`, `seoDescription` обязательны не пустые,
  - `media[]` корректные `mediaId` по существующим медиа-элементам.
- Добавить понятный ответ при непрошедшей валидации (без 200 с пустыми полями).

### 4) Нагрузка/стойкость
- Добавить rate limiting (минимальный): ограничение на количество генераций на пользователя/интервал.
- Защитить от дублей: один и тот же запуск не должен массово дублироваться при повторном нажатии.
- Опционально: очередь/лок (на уровне транзакции/lock в БД/redis no-op) как безопасный MVP.

### 5) Диагностика и инцидентная устойчивость
- Возврат ошибок с машиночитаемыми кодами:
  - `MISSING_KEY`, `PROVIDER_UNAVAILABLE`, `PROMPT_REJECTED`, `VALIDATION_FAILED`, `PARTIAL_MEDIA_MISMATCH`.
- Для 4xx/5xx не отдавать HTML/трассировки, только JSON.

### 6) Отдельный технический отчёт и smoke
- Добавить или обновить backend smoke script для:
  - проверки режима провайдера,
  - live generate для `posts` и `journal-collections`,
  - проверки статусов/поведения по `force` и повторным вызовам.

## Current execution state (2026-05-29)

- Local hardening branch in `/home/alexey/.local/share/brkovic-ltd/work/journal-backend` is built and runnable.
- Route-level availability for post/collection translation admin endpoints and health path is present in code.
- Production smoke confirms endpoints are reachable but still on old deployed artifact (no `/health/translation`, provider stub).
- Next engineering action remains: align deployment artifact with local hardening branch and set production provider mode to live.

## Обязательные команды после изменений

```bash
cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend
npm run build
DATABASE_URL='postgresql://user:pass@localhost:5432/db?schema=public' npx prisma validate
```

Если возможно локально:
- smoke-сценарий для generate/get/patch post и collection.

## Required Output

- Отчёт:
  `docs/brkovic_ltd_project_office/reports/backend-engineer-journal-translation-production-hardening-2026-05-29.md`

## Риски

- Разный статус перевода между `stub` и `live` на staging/prod.
- Ограничения OpenAI-квот на burst-запросы.
- Отсутствие `mediaId` консистентности между UI и backend.
- Возможные расхождения в ответах старых клиентов после изменения режима.

## Границы

- Нет деплоя.
- Нет подключения к боевому DB/FTP без отдельного deployment/ops задания.
- Нет frontend-редизайна и изменения роутов.
- Без печатных/логов секретов.
