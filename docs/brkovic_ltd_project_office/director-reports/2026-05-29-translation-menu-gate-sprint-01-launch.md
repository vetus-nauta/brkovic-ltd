# Офицерский запуск спринта: 2026-05-29 — BRK Translation/Menu Gate Sprint 01

**Owner:** `CHAT-BRK-DIRECTOR-001`
**Запуск:** 2026-05-29 (локальный статус из отчётов и smoke-сценариев)
**Задача:** довести до green в блоке `BRK-MVP-BEIMPL-005 / BRK-MVP-BEIMPL-006` + `BRK-MVP-FE-020` + `BRK-MVP-QAUX-012`.

## Что уже доказано и что блокирует

1. `language.js` уже держит целевой язык-рецепт (`en,de,it,es,sr,zh`) и backend endpoints доступны с анонимным 401 + авторизованным 200/201.
2. FE-работа по модальному языковому блоку уже частично активна (`FE-020` стартован), но нужно официально закрыть функциональный чек как единый флоу.
3. Основной блокер: провайдеры переводов на проде пока живут в `stub` (`provider.configured=false`, `providerMode="stub"`, `liveGenerationAvailable=false`) при успешных generate.

## Пороговый gate (DoD этого спринта)

### Backend gate
- `BRK-MVP-BEIMPL-005` — backend переводы на live-mode по post/collection generate endpoints.
- `BRK-MVP-BEIMPL-006` — hardening: наблюдаемость, idempotency, rate/error handling.
- Признак успеха для 5 языков не только по статусу 200/201, но и по provider metadata.

### Frontend gate
- `BRK-MVP-FE-020` — единый языковой модал + per-language variants (если FE правки уже реализованы частично, задача продолжает до полного PASS).

### QA gate
- `BRK-MVP-QAUX-012` — свежий контроль языкового меню после FE-020 на desktop/tablet/mobile и режимах `normal/day/night`.

## Раздача сабагентам (запуск в фоне)

### 1) Backend (владелец: `CHAT-BRK-BE-IMPL-001`)
- Task IDs: `BRK-MVP-BEIMPL-005`, `BRK-MVP-BEIMPL-006`.
- Отчёты: уже существующие `backend-engineer-live-journal-translation-provider-2026-05-29.md`,
  `backend-engineer-journal-translation-production-hardening-2026-05-29.md`, `backend-engineer-translation-readiness-gate-2026-05-29.md`.
- Обновить с новым статусом и приложить свежий фрагмент smoke с provider metadata.

### 2) Frontend/NavDesk (владелец: `CHAT-BRK-FE-IMPL-001`)
- Task ID: `BRK-MVP-FE-020`.
- Текущий чек: довести языковое окно до «один activator + modal + закрытие Esc/overlay + корректные метки языка».
- Отчёт: `frontend-language-menu-modal-window-2026-05-29.md`.

### 3) QA/UX (владелец: `CHAT-BRK-QA-UX-001`)
- New Task ID: `BRK-MVP-QAUX-012`.
- Отчёт: `language-menu-qa-2026-05-29.md`.
- Ревальюировать именно после `BRK-MVP-FE-020` и зафиксировать PASS/FAIL с точными страницами/вьюпортами.

## Непосредственный контроль (director watcher)

- **Backend** — ожидаю новый статус в report chain о переходе провайдера с `stub` на `live`.
- **Frontend** — ожидаю отчёт FE-020 или промежуточный статус о блокерах.
- **QA** — ожидаю QAUX-012 с PASS/FAIL и перечнем не закрытых страниц/состояний.

## Допущения

- Не делаем production-деплой на этом этапе.
- Не меняем UX-смысл страниц вне описанного фокуса.
- Не запускаем новые языки/seo-фазы до получения green backend provider metadata.

## Решение директора о запуске

Спринт переведён в **active execution mode**. До подтверждения трёх gate-блоков проект не закрывается в release gate.

## Таймер/ожидание статусов

- 60–90 минут: ожидание первичного отчёта FE-020.
- 90–180 минут: первичная QAUX-012 (режимы + страницы).
- После каждого получения отчёта: сверка против DoD и обновление `task-registry.md`.
