# NavDesk Frontend Polish Sprint - 2026-05-27

**Role:** Frontend Engineer
**Director task:** `BRK-MVP-FE-005`
**Scope:** local NavDesk MVP polish, no backend/API, no production/FTP.

## Что проверено

- `navdesk-ukv.html` в ночном режиме: radio-spelling result, spell tokens, переносы, компактность.
- `navdesk.html` в ночном режиме: карточки инструментов, порядок восприятия, desktop/tablet/mobile.
- Общий NavDesk day/night boot не менялся.
- Общий NavDesk disclaimer не менялся.

## Что исправлено

- Radio-spelling chips в ночном режиме получили темный приборный фон, мягкую рамку и читаемый цвет текста; белые плашки слов больше не выбиваются из ночной темы.
- Контейнер результата radio-spelling стал темным и спокойным, без ощущения вставленного светлого документа.
- Карточки главной NavDesk уплотнены: меньше высота, меньше визуальный шум, мягкая боковая метка вместо тяжелой декоративности.
- Порядок карточек на главной выстроен от более простых к более сложным задачам:
  1. УКВ и шаблоны сообщений
  2. Приливы и окно прохода
  3. Ортодромия и локсодромия
  4. Вахтенный журнал
  5. Обучающие игры
- На мобильной версии карточки главной строго в одну колонку; поздний CSS override на 2 колонки был исправлен.
- Версия `css/navdesk.css` на NavDesk-страницах поднята до `20260527-navdesk-mvp-polish-01`, чтобы не держался старый кеш.

## Измененные файлы

```text
css/navdesk.css
navdesk.html
navdesk-ukv.html
navdesk-tides.html
navdesk-route.html
navdesk-watch.html
navdesk-english.html
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/task-0005-navdesk-frontend-polish-sprint.md
docs/brkovic_ltd_project_office/reports/navdesk-frontend-polish-sprint-2026-05-27.md
```

## Проверка

Команды:

```bash
node --check js/navdesk.js
git diff --check -- css/navdesk.css navdesk.html navdesk-ukv.html navdesk-tides.html navdesk-route.html navdesk-watch.html navdesk-english.html
```

Browser smoke через локальный Chrome/CDP:

- `navdesk.html`, night mode, desktop `1440x1000`: overflow `0`, карточки 5 колонок.
- `navdesk.html`, night mode, tablet `768x1024`: overflow `0`, карточки 2 колонки.
- `navdesk.html`, night mode, mobile `390x844`: overflow `0`, карточки 1 колонка.
- `navdesk-ukv.html`, night mode, desktop/tablet/mobile: overflow `0`, `radio-spelling` создает 10 chips для `testboat 17`, chips и result используют темный фон.

Локальные скриншоты проверки:

```text
/tmp/brkovic-navdesk-main-night.png
/tmp/brkovic-navdesk-main-night-mobile.png
/tmp/brkovic-navdesk-ukv-night-accepted.png
```

## Осталось как риск / на решение владельца

- Общий CSS NavDesk содержит много исторических ночных overrides. В этой задаче они не переписывались, чтобы не открыть редизайн и не сломать рабочие инструменты.
- Если владелец захочет еще более строгую иерархию главной NavDesk, следующий шаг лучше делать как отдельное UX-решение: группировать инструменты по категориям или оставить плоскую сетку MVP.
