# NavDesk Tool Page Build Handoff

**Project:** BRKOVIC.LTD / VETUS NAUTA
**Scope:** сборка и оформление новых страниц инструментов внутри NavDesk
**Audience:** новый чат Frontend/NavDesk Engineer, QA/UX, Director
**Created:** 2026-05-31
**Status:** handoff for implementation discipline

## First Rule

Это не задача на редизайн всего сайта. Это точная инструкция, как собирать новую страницу инструмента NavDesk в уже принятой системе сайта.

Директор не кодер. Новый чат обязан сначала принять дисциплину офиса, затем работать только в рамках выданной роли и задачи.

Перед работой:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Обязательно прочитать:

```text
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/cabinets/frontend-engineer/README.md
docs/brkovic_ltd_navdesk_audit_2026-05-25.md
docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
docs/brkovic_ltd_project_office/reports/navdesk-language-layer-smoke-2026-05-28.md
```

## Existing NavDesk Pages

Рабочая структура уже разнесена по страницам:

- `navdesk.html` - главный пульт штурманского стола.
- `navdesk-watch.html` - вахтенный журнал.
- `navdesk-tides.html` - приливы, графики, окно прохода.
- `navdesk-route.html` - ортодромия, локсодромия, точки маршрута.
- `navdesk-ukv.html` - УКВ, radio spelling, шаблоны связи.
- `navdesk-english.html` - заготовка под Maritime English.

Новые страницы инструментов должны повторять эту систему, а не изобретать отдельную страницу со своим хедером, футером и режимом экрана.

## Files To Reuse

HTML-образцы:

- Лучший базовый каркас: `navdesk-route.html`.
- Для компактной заготовки: `navdesk-english.html`.
- Для сложного инструмента с формами и таблицами: `navdesk-watch.html` или `navdesk-tides.html`.

Общие стили:

```text
css/variables.css
css/main.css
css/responsive.css
css/navdesk.css
```

Общие скрипты:

```text
js/language.js
js/seo.js
js/main.js
js/navdesk.js
```

Не использовать корневые старые дубли:

```text
navdesk.css
navdesk.js
```

Они есть как исторические хвосты и не являются рабочими подключениями новых страниц.

## Required Page Skeleton

Каждая страница инструмента должна иметь:

1. SEO/head baseline как у существующих `navdesk-*.html`.
2. ранний boot-script режима день/ночь до подключения CSS;
3. `body` с классом `navdesk-theme-day` или `navdesk-theme-night`;
4. общий `site-shell`;
5. общий хедер `navdesk-header-card > header.topbar`;
6. `main.navdesk-page.navdesk-tool-page.<tool-page-class>`;
7. hero-блок инструмента;
8. рабочую карточку/область инструмента;
9. общий footer `footer.footer.footer--site`;
10. общий disclaimer modal;
11. подключение `language.js`, `seo.js`, `main.js`, `navdesk.js`.

Минимальный порядок внизу страницы:

```html
<script src="js/language.js?v=..."></script>
<script src="js/seo.js?v=..."></script>
<script src="js/main.js?v=..."></script>
<script src="js/navdesk.js?v=..."></script>
```

Если инструмент имеет отдельный JS, он подключается после общего слоя, если ему нужны уже созданные общие события; либо до `navdesk.js`, если `navdesk.js` должен подхватить его DOM. Выбор фиксировать в отчете.

## Header

Хедер NavDesk отличается от обычных страниц сайта, потому что в нем живет переключатель day/night.

Сохранять структуру:

```html
<div class="navdesk-header-card">
  <header class="topbar">
    <a href="index.html#hero" class="brand brand--image" aria-label="VETUS NAUTA - Brkovic home" data-i18n-aria-label="a11y_brand_home">
      <span class="brand__picture brand__picture--home">
        <img src="brand/logo-header-inline-light.png" alt="VETUS NAUTA - Brkovic" class="brand__logo-image brand__logo-image--desktop navdesk-logo" />
        <img src="brand/logo-header-mobile.png" alt="VETUS NAUTA - Brkovic" class="brand__logo-image brand__logo-image--mobile navdesk-logo navdesk-logo--mobile" />
      </span>
    </a>
    <div class="topbar__actions">
      <div class="navdesk-header-theme navdesk-theme-compact" id="navdesk-theme-card">
        <div class="navdesk-theme-switch" role="group" aria-label="Screen mode" data-i18n-aria-label="a11y_screen_mode">
          <button type="button" class="navdesk-theme-switch__btn is-active" data-navdesk-theme="day" aria-label="Дневной режим" title="Дневной режим" data-i18n-aria-label="a11y_day_mode" data-i18n-title="a11y_day_mode">☀</button>
          <button type="button" class="navdesk-theme-switch__btn" data-navdesk-theme="night" aria-label="Ночной режим" title="Ночной режим" data-i18n-aria-label="a11y_night_mode" data-i18n-title="a11y_night_mode">☾</button>
        </div>
      </div>
    </div>
  </header>
</div>
```

Instagram в верхний хедер NavDesk не возвращать. Социальные ссылки живут в footer/информационном блоке, если назначены владельцем.

Логотип ведет на главную: `index.html#hero`.

Меню сайта не вставлять руками в HTML. Его собирает `js/main.js` как общий modal/menu слой. Если нужен пункт меню, менять общую логику только через отдельную задачу фронта.

## Day/Night Mode

NavDesk обязан сохранять режим day/night на всех страницах инструментов.

Ключ состояния:

```text
localStorage: navdesk_watch_theme_v1
```

Допустимые значения:

```text
day
night
```

Поведение:

- режим применяется до загрузки CSS через inline boot-script в `<head>`;
- `window.__NAVDESK_BOOT_THEME` получает `day` или `night`;
- `html` получает `navdesk-boot-day` или `navdesk-boot-night`;
- `body` получает `navdesk-theme-day` или `navdesk-theme-night`;
- переключатель в хедере меняет общий режим для всех NavDesk страниц;
- при переходе между страницами и hard refresh режим не должен мигать белым экраном;
- дневной и ночной хедер должны быть одинаковой геометрии, отличаться только цветовым скином;
- дневной логотип остается дневным.

Запрещено:

- делать отдельный переключатель внутри карточки инструмента;
- писать словами "день/ночь", если хватает символов солнца и месяца;
- хранить второй несовместимый ключ темы;
- ломать ночной режим ради дневного.

## Disclaimer

Общий NavDesk disclaimer обязателен на главной и на страницах инструментов.

Сохранять смысл:

- инструмент дает справочную информацию и предварительные расчеты;
- расчеты не являются единственным основанием для навигационных решений;
- ответственность за проверку данных остается на пользователе/шкипере.

Disclaimer показывается в начале работы и после принятия не должен постоянно мешать одному пользователю. Логика TTL описана в `docs/brkovic_ltd_navdesk_audit_2026-05-25.md`.

Нельзя:

- удалять disclaimer;
- переносить его в незаметный футер;
- делать разные тексты disclaimer на разных инструментах без отдельного юридического решения;
- ломать открытие инструментов, если disclaimer DOM отсутствует на какой-то старой странице.

## Main Layout

Основной принцип: страница инструмента должна ощущаться как рабочий прибор, а не как лендинг.

Структура:

```html
<main class="navdesk-page navdesk-tool-page navdesk-<tool>-page">
  <section class="section navdesk-hero section--paper">...</section>
  <section class="navdesk-<tool>-section">
    <div class="section--paper navdesk-card navdesk-<tool>-card">
      ...
    </div>
  </section>
</main>
```

Hero:

- короткий заголовок;
- 1-2 строки объяснения назначения;
- кнопка назад к `navdesk.html`;
- при необходимости вторая кнопка к связанному разделу;
- без маркетинговой простыни;
- без декоративных лишних карточек.

Центр:

- крупный инструмент получает одну основную рабочую область;
- не вкладывать карточку в карточку без необходимости;
- панели внутри инструмента должны иметь понятную последовательность: настройка -> действие -> результат -> экспорт/печать;
- кнопки группировать по смыслу;
- печать/PDF отделять от рабочих кнопок ввода;
- на desktop использовать компактную сетку, но не дробить важную форму на хаотичные поля;
- на tablet уменьшать плотность и сохранять порядок;
- на mobile использовать короткие секции, раскрываемые блоки и линейный порядок.

Footer:

- использовать общий `footer.footer.footer--site`;
- не удалять админ-ссылки, если они присутствуют в текущем footer-шаблоне;
- footer должен быть аккуратной картой сайта;
- ширина footer должна визуально совпадать с общей сеткой страницы;
- не позволять footer тянуться за случайной шириной центральной карточки.

## Tool Cards And Controls

Использовать существующие классы и визуальную систему:

- `section--paper`
- `navdesk-card`
- `navdesk-card-shell`
- `section-heading section-heading--editorial`
- `btn btn--primary`
- `btn btn--secondary`
- `navdesk-card-toolbar`
- `navdesk-card-pin`

Для новых больших блоков сначала искать похожий паттерн в:

- `navdesk-watch.html` для расписаний, лент, журналов, подписей;
- `navdesk-tides.html` для графика, настроек осадки/UKC, печати;
- `navdesk-route.html` для координат, таблиц и результатов расчета;
- `navdesk-ukv.html` для словарей, шаблонов, карточек фраз.

Запрещено:

- добавлять новый визуальный язык без причины;
- делать раздутые карточки с большим воздухом;
- плодить оттенки и случайные фоны;
- прятать основную функцию ниже длинного объяснения;
- ломать `id`, на которые завязан `js/navdesk.js`.

## Menu Source

Общее меню сайта собирается в `js/main.js`.

Текущая модель:

- в верхнем хедере есть кнопка меню;
- внутри меню есть пункт языка;
- язык открывается отдельной модалкой;
- старый RU/EN switcher не возвращать.

Если новая страница не показывает меню:

1. проверить, подключен ли `js/main.js`;
2. проверить наличие `.topbar`;
3. проверить, нет ли дублирующего старого menu markup;
4. проверить консоль браузера;
5. не чинить это локальным меню внутри страницы.

## Localization

Целевая языковая модель сайта:

- `en` - primary/default;
- `ru`;
- `de`;
- `it`;
- `es`;
- `sr` - общий SRB/MNE/HR/BIH вектор;
- `zh` - Mandarin.

Языковой слой:

```text
js/language.js
lang/en.json
lang/ru.json
lang/de.json
lang/it.json
lang/es.json
lang/sr.json
lang/zh.json
```

Каждый видимый HTML-текст новой страницы должен иметь ключ:

- `data-i18n` для текста;
- `data-i18n-placeholder` для placeholder;
- `data-i18n-aria-label` для aria-label;
- `data-i18n-title` для title attribute;
- `data-i18n-alt` для alt.

Для страницы:

- `<html lang="en" translate="no" class="notranslate" data-i18n-title="..." data-i18n-description="...">`;
- meta description через `data-i18n-description`;
- не включать browser auto-translate;
- не возвращать Google Translate widget;
- language hint должен объяснять, что язык выбран по языку системы и меняется в меню.

Новые ключи именовать доменно:

```text
navdesk_<tool>_<meaning>
```

Примеры:

```text
navdesk_english_title
navdesk_tides_print
navdesk_route_search_btn
navdesk_watch_entries_print
```

Если строка генерируется в `js/navdesk.js`, она тоже должна пройти через существующий i18n helper или быть вынесена в план локализации. Не оставлять новые hardcoded Russian/English строки без отчета.

## SEO Baseline

Каждая новая страница инструмента получает SEO baseline по образцу `navdesk-route.html`:

- canonical;
- hreflang для `x-default`, `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`;
- robots;
- author/copyright;
- OG/Twitter;
- JSON-LD `WebPage`;
- `inLanguage`: `["en","ru","de","it","es","sr","zh"]`.

SEO-тексты не выдумывать в одиночку. Если нужна новая формулировка, направить к SEO Director и владельцу.

## Responsive Rules

Проверять минимум:

- desktop: 1366x768 или шире;
- tablet: около 820x1180;
- mobile: около 390x844.

Desktop:

- хедер, центр и footer должны быть в одной визуальной сетке;
- рабочая область не шире хедера случайно;
- таблицы и графики не выходят за края;
- важные кнопки видны без охоты по странице.

Tablet:

- сетка не должна превращаться в тесную шахматку;
- формы сохраняют порядок;
- переключатель day/night в хедере не конфликтует с меню.

Mobile:

- без длинной простыни, если блок можно свернуть;
- основные действия сверху;
- вводы достаточно крупные для пальца;
- таблицы превращаются в читаемый scroll/stack;
- footer не давит основной инструмент.

## Auth Boundary

Некоторые действия инструментов защищены быстрым входом:

- сохранение данных;
- печать;
- PDF/export;
- share, если там есть сохраненные данные;
- переходы в обучающие игры;
- калькуляторы, если владелец назначил их protected.

Не писать собственную авторизацию внутри страницы инструмента. Использовать общий tool auth слой из `js/main.js` и backend routes через `admin-api-proxy.php` только в рамках отдельной backend/frontend задачи.

Важно для игр: авторизация на `brkovic.ltd` должна быть совместима с будущим `game.brkovic.ltd`, чтобы игры не просили повторный вход. См.:

```text
game.brkovic.ltd/docs/ecosystem-auth-plan.md
game.brkovic.ltd/docs/ecosystem-auth-guardrail.md
```

## Print And PDF

Если инструмент имеет печать/PDF:

- отдельный print layout должен быть полезен человеку, а не техническим dump;
- для таблиц заранее выбрать A4 portrait или landscape;
- не выходить за поля;
- не печатать лишние кнопки, меню, хедер сайта;
- для графиков показывать пользовательские настройки, которые влияют на вывод;
- для NavDesk расчётов указывать дисклеймер/пометку предварительного расчета.

## Safe Implementation Order

Для нового инструмента:

1. Скопировать каркас ближайшей `navdesk-*.html`.
2. Переименовать page class, title, meta, canonical, hreflang URL.
3. Оставить общий хедер, day/night boot, footer, disclaimer и scripts без самодеятельности.
4. Вставить только рабочий центр инструмента.
5. Сохранить `id`, если логика уже есть в `js/navdesk.js`.
6. Добавить недостающие i18n keys во все `lang/*.json`.
7. Добавить минимальные стили в `css/navdesk.css`, используя текущие переменные и классы.
8. Проверить desktop/tablet/mobile, day/night, menu, language modal, disclaimer.
9. Записать отчет в `docs/brkovic_ltd_project_office/reports/`.

## Verification Commands

Минимум:

```bash
node --check js/navdesk.js js/main.js js/language.js
php -l admin-api-proxy.php
```

Если затронуты приливы:

```bash
php -l api/tides/search.php
php -l api/tides/forecast.php
php -l api/tides/window.php
```

Если добавлены i18n ключи:

```bash
node tools/i18n-diagnostics.mjs
```

Если запущен локальный сервер:

```bash
php -S 127.0.0.1:18090 -t .
```

Открывать:

```text
http://127.0.0.1:18090/navdesk.html
http://127.0.0.1:18090/navdesk-<tool>.html
```

## Acceptance Checklist

- Хедер совпадает с NavDesk стилем.
- Day/night работает и сохраняется между страницами.
- Нет белой вспышки при refresh.
- Дисклеймер есть и не сломан.
- Меню открывается из общей кнопки.
- Язык открывается модалкой из меню, не старым RU/EN переключателем.
- Все 7 языков доступны в модели: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- Desktop/tablet/mobile читаемы.
- Footer стоит в общей сетке и не живет отдельно.
- Нет карточек внутри карточек без функционального смысла.
- Нет новых hardcoded строк без i18n-плана.
- Функции инструмента не потеряны при переносе фасада.
- Print/PDF не печатает мусор.
- Отчет создан в офисной папке.

## Report Template

```text
TASK-ID done.
Page: navdesk-<tool>.html
Touched:
- <files>
Verified:
- desktop day/night
- tablet day/night
- mobile day/night
- menu
- language modal
- disclaimer
- tool functions
- print/PDF if applicable
Tests:
- <commands>
Risks:
- <remaining known risks>
Next:
- <next owner/action>
```
