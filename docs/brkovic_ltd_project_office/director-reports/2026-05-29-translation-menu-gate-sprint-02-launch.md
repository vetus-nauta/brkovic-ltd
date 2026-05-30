# Офицерский запуск спринта: 2026-05-29 — BRK Translation/Menu Gate Sprint 02

**Owner:** `CHAT-BRK-DIRECTOR-001`
**Запуск:** 2026-05-29 21:55 CEST
**Задачи:** `BRK-MVP-BEIMPL-005`, `BRK-MVP-BEIMPL-006`, `BRK-MVP-FE-020`, `BRK-MVP-QAUX-012`

## Что это за спринт

Фокус на закрытии gate для:
- живых backend endpoint-ов переводов (`BEIMPL-005`),
- production hardening перевода и устойчивого поведения (`BEIMPL-006`),
- модального языкового меню (`FE-020`),
- финальной QA проверки после FE-изменений (`QAUX-012`).

## Gate (критический путь)

1. **Backend Provider gate**
   - `provider.configured === true`
   - `providerMode === "live"` (или эквивалент live-сигнал)
   - `liveGenerationAvailable === true`
   на `POST /admin/posts/:id/translations/generate` и `POST /admin/journal-collections/:id/translations/generate`.

2. **Frontend gate**
   - только один активатор языка в меню,
   - модальное окно языка открывается/закрывается по Esc и клику вне модального окна,
   - корректный перечень языков и метка текущего.

3. **QA gate**
- `BRK-MVP-QAUX-012` с проверками на desktop / tablet / mobile в normal / day / night.

## Запуск спринта

- `BRK-MVP-BEIMPL-005` и `BRK-MVP-BEIMPL-006`: верификация и перевод провайдерной схемы с live-mode.
- `BRK-MVP-FE-020`: завершена на уровне frontend логики и статуса.
- `BRK-MVP-QAUX-012`: перезапуск полной проверки после FE-починки.

## Текущее состояние

На момент запуска спринта:
- авторизационные и route checks по endpoints подтверждены,
- `POST /translations/generate` для поста и collection возвращает `200/201`,
- `provider` на бою по-прежнему в `stub`,
- `/api/health/translation` возвращает 404 на production,
- FE-отчёт приложен (`reports/frontend-language-menu-modal-window-2026-05-29.md`).
- QA-закрытие `BRK-MVP-QAUX-012` пока требует browser smoke (desktop/tablet/mobile, normal/day/night), итоговый отчёт в процессе.

## Дальше

Director продолжает контролировать слияние результатов в `task-registry.md` и `agent-control-log.md` после каждого отчетного артефакта.
