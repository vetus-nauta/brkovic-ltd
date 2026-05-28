# NavDesk Main Cards Handoff - 2026-05-28

## Scope

- Ownership: `navdesk.html`, `css/navdesk.css`.
- Backend/API/production/FTP не трогались.
- Route print, UKV tokens, tides и watch JS не менялись.

## Что принято

- В рабочем дереве уже был MVP-патч главной NavDesk: новый блок `navdesk-dashboard`, карточки инструментов, compact layout для старых быстрых функций и day/night skin.
- Порядок карточек сохранен от простых к более тяжелым задачам:
  1. УКВ и шаблоны сообщений
  2. Приливы и окно прохода
  3. Ортодромия и локсодромия
  4. Вахтенный журнал
  5. Обучающие игры
- Текущий патч выглядит безопасным для MVP-полировки; радикальный редизайн не требуется.

## Что изменено

- Обновлен cache-bust `css/navdesk.css` в `navdesk.html` до `20260528-navdesk-main-cards-01`.
- CSS карточек не переписывался: сетка и day/night overrides оставлены как в принятом патче.

## Проверки

- `git diff --check -- navdesk.html css/navdesk.css` - pass.
- Chrome headless/CDP smoke без Playwright:
  - desktop `1440x1000`, day/night: 5 карточек, строки `3/2`, горизонтального overflow нет.
  - tablet `900x1000`, day/night: строки `2/2/1`, горизонтального overflow нет.
  - mobile `390x900`, day/night: 1 колонка, горизонтального overflow нет.
  - NavDesk disclaimer/consent не был скрыт или изменен; в smoke localStorage использовался только чтобы не перекрывать проверку модалкой.
- Контрольные скриншоты сохранены локально:
  - `/tmp/brkovic-navdesk-main-desktop-day.png`
  - `/tmp/brkovic-navdesk-main-desktop-night.png`
  - `/tmp/brkovic-navdesk-main-tablet-day.png`
  - `/tmp/brkovic-navdesk-main-tablet-night.png`
  - `/tmp/brkovic-navdesk-main-mobile-day.png`
  - `/tmp/brkovic-navdesk-main-mobile-night.png`

## Риски

- `css/navdesk.css` содержит много исторических и соседних правок в текущем diff. В этой задаче они не нормализовались, чтобы не задеть route print, UKV, tides и watch.
- Если владелец захочет другой смысловой порядок карточек, это лучше решать отдельным директорским UX-решением; текущий порядок уже согласован с предыдущим отчетом MVP-полировки.
