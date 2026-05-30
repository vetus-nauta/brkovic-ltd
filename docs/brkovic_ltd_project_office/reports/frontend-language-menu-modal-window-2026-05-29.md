# Frontend Report: Language Menu Modal Window and Per-Language Variants (BRK-MVP-FE-020)

**Task ID:** `BRK-MVP-FE-020`
**Date:** 2026-05-29
**Owner:** `CHAT-BRK-FE-IMPL-001`
**Scope:** menu restructuring on all pages to keep only “Language” as a menu item and open per-language picker modal.

## Что проверено

- In scope implementation is present in `js/main.js`:
  - общий модальный `siteMenuModal` содержит навигацию и отдельный пункт `Site language`;
  - добавлен отдельный `siteLanguagePickerModal` для выбора версии языков;
  - поведение закрытия унифицировано через `[data-management-modal-close]`:
    - клик по закрытию/хвосту/кнопке;
    - `Escape` закрывает любой открытый модальный слой;
  - для обоих модалей используется единый метод `setupSiteMenuLanguageControls` и `setupSiteMenuLanguageControls(picker)`;
  - удалены/прогнано `removeLegacyLanguageControls` для неиспользуемых старых RU/EN переключателей.
- Поддержка целевых языков обновлена в `js/language.js`:
  - `de`, `it`, `es`, `sr`, `zh` теперь доступны (`isAvailable: true`) для меню выбора.
- В `admin-posts` для административного контура синхронизирован cache-busting (`admin-posts.html?v=20260529...`).
- Наличие визуальных классов и стилизации: `site-menu-language-current`, `site-menu-language__list`, `site-menu-language-modal` в `css/main.css`.

## Быстрая техническая верификация

- Проверки синтаксиса:
  - `node --check js/main.js` ✅
  - `node --check js/language.js` ✅
- Никаких деструктивных блоков в `git diff` по этим файлам не найдено (локальные правки консистентны).

## Статус

- Кодовая реализация задачи считается реализованной на уровне фронтовой логики.
- Для полного закрытия задачи в `Task Registry` нужен визуально-поведенческий QA на:
  - desktop/tablet/mobile,
  - normal/day/night,
  - проверка, что системный инициализационный hint/подсказка отображается ожидаемо.

## Риск

- У задачи есть зависимость от проверки поведения модалки в runtime (backdrop, фокусировка, касание на мобильных), которую в этом отчете нельзя считать полной без прогонов браузерного smoke.

## Следующий шаг

1. Закрыть `BRK-MVP-QAUX-012` визуально-функциональным прогонам.
2. После PASS обновить статус `BRK-MVP-FE-020` в реестре.
