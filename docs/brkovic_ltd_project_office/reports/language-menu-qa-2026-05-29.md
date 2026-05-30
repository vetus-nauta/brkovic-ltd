# QA Report: Language menu and system-language hint rerun (BRK-MVP-QAUX-012)

**Task ID:** `BRK-MVP-QAUX-012`
**Date:** 2026-05-29
**Owner:** `CHAT-BRK-QA-UX-001`
**Status:** `In Progress` (visual smoke not fully executed in this pass)

## Что проверено в этом спринтовом окне

- Route/state sanity for frontend language model:
  - `js/language.js` содержит расширенный список языков:
    - `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`;
  - статус `isAvailable` для `de/it/es/sr/zh` переведён в `true`.
- Modal architecture in `js/main.js`:
  - menu modal и picker modal создаются отдельно;
  - закрытие реализовано через атрибут `data-management-modal-close` + `Escape` на открытом `.management-modal.is-open`.
- Legacy RU/EN hardcoded switcher elements удаляются из DOM (`removeLegacyLanguageControls`) при построении нового меню.
- Быстрые sanity-checks скриптов (`node --check`) для основных модулей прошли:
  - `js/main.js` ✅
  - `js/language.js` ✅
  - `js/admin-posts.js` ✅

## Что не закрыто полностью

- Неразмеченные этапы визуальной проверки:
  - реальный сценарий клика в desktop/tablet/mobile,
  - поведение закрытия на тапе по backdrop и по внешней области,
  - корректность состояния подсказки системного языка в разных режимах.
- Нет новой серии скриншотов/видеопрохождений для версии 2026-05-29, поэтому QA релоад по `language menu` считаем **Partially Blocked** до запуска browser smoke.

## Риски

- Без визуальных и UX прогонов остаются открытыми риски:
  - смещение фокуса/скролл на маленьких экранах,
  - скрытые перекрытия меню на разных режимах темы,
  - неконсистентное поведение закрытия при касании на мобильном.

## Рекомендация

1. Запустить 3-уровневый smoke (desktop/tablet/mobile) после синхронизации фронта:
   - только открыть menu → language picker → закрыть;
   - тап вне диалога/на backdrop;
   - переключение RU/EN/DE/IT/ES/SR/ZH на чистом state и при сохранённом `localStorage`.
2. При PASS обновить `BRK-MVP-QAUX-012` до `For Review`.
