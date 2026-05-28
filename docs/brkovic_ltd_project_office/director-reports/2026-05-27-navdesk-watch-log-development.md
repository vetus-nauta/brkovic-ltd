# NavDesk Watch Log Development Report - 2026-05-27

## Scope

Раздел: `navdesk-watch.html`, `css/navdesk.css`, `js/navdesk.js`.

Нельзя ломать:
- общий NavDesk disclaimer: `navdeskAcceptedVersion`, `navdeskAcceptedAt`, TTL около 14 дней;
- day/night layer: `navdesk_watch_theme_v1`, `body.navdesk-theme-day/night`, кнопки `data-navdesk-theme`;
- существующий локальный ключ вахтенного журнала: `navdesk_watch_log_state_v1`.

## Roles

- Project Director: архитектура среза, риски, порядок внедрения.
- Maritime/Product: сущности рейса, экипажа, смен, записей и подписей.
- UX/Mobile: компактная рабочая раскладка, мобильный ритм без раздутых карточек.
- Offline/GPS: сохранение, GPS, напоминания, ограничения браузера.
- Print/Document: печатный лист как рабочий документ, не как снимок UI.

## Findings

- Старый авто-расчет стартовал с даты в `00:00`, без отдельного времени старта.
- Ручные смены не были полноценной сохраненной моделью и могли теряться после reload.
- Печать частично читала DOM, поэтому документ зависел от текущего отображения.
- GPS и напоминания отсутствовали как функции.
- Подписанная смена существовала только как пустая колонка в печати, данных подписи не было.

## Implemented First Slice

- Добавлены поля `Переход / маршрут` и `Время старта`.
- Авто-расписание теперь считает от даты и времени старта.
- Длительность перехода считает не только целые сутки, но и дополнительные часы: `Суток` + `Часов`.
- Ручные смены сериализуются и сохраняются в `localStorage` вместе с текущим state.
- Добавлен публичный snapshot расписания `window.navdeskWatchSchedule` для печати, записей, напоминаний и подписи.
- Добавлена GPS-кнопка и optional `AUTO` режим через browser geolocation.
- При `AUTO` режиме часовая GPS-отметка добавляется локально один раз в час при наличии свежей позиции.
- Добавлено напоминание за 15 минут до следующей смены: browser notification при разрешении, экранный fallback всегда.
- Добавлена локальная подпись смены с snapshot и контрольным hash.
- Печатный лист получил маршрут, точное время старта, UTC-колонку, GPS accuracy и блок подписанных смен.
- Watch UI уплотнен page-scoped CSS-слоем, не затрагивая другие инструменты NavDesk.

## Implemented Print And Signature Fix

- Верхние действия разведены: `Вахты A4` и отдельный `Лист записей`.
- `Лист записей` печатает только фактические записи вахтенного, взятые из локальных записей смены.
- `Вахты A4` и `PDF` печатают расписание вахт по дням, затем отдельной страницей подписанные смены и контроль отдыха.
- Расписание в печатном документе больше не режется `slice(0, 24)`: выводится весь сохраненный snapshot.
- Подписанные смены в документе расширены до локального лимита `80`, без прежнего ограничения на 12 строк.
- Кнопка `Подписать смену` теперь умеет работать от сохраненного `scheduleSnapshot`, даже если расписание не отрисовано в DOM после reload.
- Для подписи добавлен локальный статус рядом с кнопкой, чтобы действие не выглядело потерянным.
- Добавлена спокойная подсветка `is-night-solo` для ночей без подвахтенного и внутренний маркер `is-pre-dawn-watch` для окна 00:00-04:00 без видимой подписи в интерфейсе.
- Экранное расписание сделано более линейным: смены идут вертикальным списком, без карточечной россыпи по колонкам.
- На mobile верхние рабочие кнопки возвращены в две колонки, чтобы не превращались в длинную вертикальную пачку.

## Implemented Screen Order Fix

- Рабочая зона вахтенного поднята выше настройки: сначала текущая вахта, быстрая запись, подпись смены и лента.
- Настройка перехода, экипажа, ручных смен, расписание и контроль отдыха перенесены ниже рабочей зоны.
- Убраны положительные `tabindex` из блока настройки, чтобы клавиатурная навигация не уводила фокус вниз раньше основной работы.
- Для блока настройки добавлен верхний отступ после рабочей зоны.
- Cache-buster страницы обновлен до `20260527-watch-visual-02`.

## Latest QA

- `node --check js/navdesk.js` - passed.
- `git diff --check -- navdesk-watch.html js/navdesk.js css/navdesk.css` - passed.
- Local HTTP: `http://127.0.0.1:18090/navdesk-watch.html?v=20260527-watch-visual-02` returns `200`.
- Browser smoke:
  - schedule generated for `0 суток / 8 часов`;
  - one entry saved;
  - one shift signed locally;
  - `Вахты A4` and `Лист записей` open different print documents;
  - watch document contains schedule and page break before signatures/rest;
  - entries document contains the entries sheet and does not contain signatures block.
- Order smoke:
  - working grid is above setup panel;
  - schedule generation, entry save, signing and print actions still work after moving the setup block.
- Reload smoke:
  - signing works after reload from stored `scheduleSnapshot`.
- Viewport smoke:
  - desktop `1440x1100`, tablet `820x1180`, mobile `390x1200`;
  - no horizontal overflow;
  - day/night switch remains visible.
- Terminology correction:
  - Russian slang meaning checked against maritime references: the Russian "собака" is treated as 00:00-04:00, not English 16:00-20:00 `dog watch`;
  - visible wording is not shown in the interface or print document;
  - visual marker remains internal as `is-pre-dawn-watch`.

## Consequences

- Это не юридическая электронная подпись. Это локальная фиксация смены на устройстве с hash snapshot.
- Browser notifications не гарантируют будильник, если вкладка закрыта или устройство усыплено.
- GPS работает только при разрешении пользователя и в secure context/localhost; на боевом сайте нужен HTTPS.
- `localStorage` подходит для MVP, но для длинных рейсов и вложений нужен следующий слой: export/import JSON и затем IndexedDB.

## Next Slice

1. Export/import JSON для аварийной офлайн-страховки.
2. IndexedDB-модель `voyage -> shifts -> entries -> signatures`.
3. Отдельная печатная модель по сменам и часам, с пустыми hourly rows.
4. Wake Lock opt-in для вахты на планшете.
5. Более точные типы записей: navigation, weather, traffic, sail/engine, safety, handover.

## References

- GOV.UK MSN 1877: minimum rest 10 hours in 24 hours and 77 hours in 7 days: https://www.gov.uk/government/publications/msn-1877-m-maritime-labour-convention-2006-hours-of-work-and-entitlement-to-leave/msn-1877-m-amendment-2-mlc-2006-hours-of-work-and-entitlement-to-leave-application-of-the-hours-of-work-regulations-2018
- MDN Geolocation API: secure context and explicit permission for `getCurrentPosition()` / `watchPosition()`: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- MDN Notifications API: permission is required and should be requested from user gesture: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- MDN Screen Wake Lock API: useful later, but released when document becomes inactive and may need reacquire on `visibilitychange`: https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API
- W3C WCAG 2.2 target size: pointer targets at least 24 x 24 CSS px or spacing exception: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
