# BRK-MVP-FE-012. I18N Surface Step 2

Дата: 2026-05-28  
Роль: Frontend/NavDesk Engineer  
Режим: отчетная задача, без изменений product code

## 1. Резюме

Фронтенд уже имеет рабочий базовый i18n-слой для `en` и `ru`: `js/language.js`, `lang/en.json`, `lang/ru.json`, атрибуты `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-description`, меню языка и подсказка о выборе языка по системе.

Главная проблема не в видимой языковой панели, а в трех больших зонах:

- JS-generated интерфейс: `js/navdesk.js`, `js/journal.js`, `js/delivery-calculator.js`, `js/management.js`.
- Print/PDF/share документы: вахтенный журнал, маршрут, приливы, УКВ, management print.
- Доменные и safety-тексты NavDesk: дисклеймер, приливы, маршрут, УКВ, вахты, GPS, уведомления, локальное хранение.

Текущая языковая модель проекта: primary public language `en`; активный дополнительный `ru`; planned/roadmap: `de`, `it`, `es`, `sr` как временный frontend-код для Serbian/Montenegrin/Croatian, `zh` для Mandarin. `fr` не входит в текущую модель.

Вывод: переносить все строки сразу в `lang/*.json` нельзя. Нужна поэтапная миграция: сначала безопасные интерфейсные оболочки и accessibility-атрибуты, затем generated statuses, затем отдельные NavDesk-инструменты, затем print/PDF, затем journal/backend/SEO.

## 2. Методика проверки

Проверены frontend-файлы:

- HTML: `index.html`, `journal.html`, `404.html`, `services/*.html`, `navdesk.html`, `navdesk-watch.html`, `navdesk-tides.html`, `navdesk-route.html`, `navdesk-ukv.html`, `navdesk-english.html`, admin pages.
- JS: `js/language.js`, `js/main.js`, `js/journal.js`, `js/navdesk.js`, `js/form.js`, `js/delivery-calculator.js`, `js/management.js`, `js/admin-posts.js`, `js/admin-comments.js`, `js/admin-management.js`.
- JSON: `lang/en.json`, `lang/ru.json`, `data/journal-public.json`, `data/management-pricing.json`.

Исключено из анализа как внешнее/нерелизное для этой задачи: `game.brkovic.ltd/**`.

Ориентировочная статическая картина:

- `index.html`: около 97 `data-i18n`-поверхностей, основная оболочка уже ключевана.
- `services/*.html`: в целом ключеваны, но остаются `aria-label`, meta/accessibility и отдельные placeholders.
- `journal.html`: около 20 `data-i18n`, но логика журнала в `js/journal.js` имеет много RU/EN ternary-строк.
- `navdesk.html`: много `data-i18n`, но часть контента и быстрых функций еще смешана с hardcoded текстом.
- `navdesk-watch.html`: только базовый footer/disclaimer ключеван; сам инструмент почти весь hardcoded Russian.
- `js/navdesk.js`: самая большая i18n-поверхность, включая статусы, safety-тексты, GPS, reminders, print/share.

## 3. Уже заведено через data-i18n / lang JSON

### 3.1. Центральный язык

Файл: `js/language.js`

Уже есть:

- `LANGUAGE_OPTIONS`: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- `SUPPORTED_LANGS`: только доступные языки, сейчас `en` и `ru`.
- `data-i18n`: текстовые узлы.
- `data-i18n-placeholder`: placeholder.
- `data-i18n-title` и `data-i18n-description` на уровне `<html>` для document title и meta description.
- `window.BRKOVIC_LANGUAGE_OPTIONS`, `window.BRKOVIC_LANGUAGE`.
- подсказка `language_hint_text` / `language_hint_close`.

Ограничение: `applyTranslations()` сейчас не обрабатывает `data-i18n-aria-label`, `data-i18n-title` на элементах, `data-i18n-alt`. Это хорошая безопасная следующая точка расширения, но не в рамках текущего отчета.

### 3.2. Меню сайта и языковая панель

Файлы: `js/main.js`, `js/language.js`, `lang/en.json`, `lang/ru.json`

Уже есть:

- `site_menu_button`
- `site_menu_title`
- `site_menu_home`
- `site_menu_services`
- `site_menu_journal`
- `site_menu_navdesk`
- `site_menu_contact`
- `site_menu_language`
- `site_menu_language_versions`
- `site_menu_language_primary`
- `site_menu_language_available`
- `site_menu_language_planned`
- `site_menu_language_roadmap`
- `site_menu_note`
- `language_hint_text`
- `language_hint_close`

Это правильная модель: planned languages показываются как roadmap, но не должны грузить несуществующие `lang/*.json`.

### 3.3. Главная и услуги

Файлы: `index.html`, `services/*.html`

Основные публичные тексты и карточки уже в значительной степени заведены через `data-i18n`. Это можно считать базовой рабочей зоной.

Остатки:

- `aria-label` на brand/home, Instagram, footer map, mobile dock.
- Некоторые meta title/description не везде полностью переведены через root `data-i18n-*`.
- Service/contact generated messages в `js/main.js` и калькуляторе доставки.

### 3.4. NavDesk hub и часть инструментов

Файлы: `navdesk.html`, `navdesk-tides.html`, `navdesk-route.html`, `navdesk-ukv.html`, `navdesk-english.html`

Уже много `data-i18n` в:

- карточках NavDesk hub;
- приливах;
- маршруте;
- УКВ;
- footer;
- общем NavDesk disclaimer modal.

Важно: disclaimer уже ключеван и должен оставаться общим предупреждением при входе в NavDesk/инструменты. Его нельзя распылять по инструментам без отдельного решения.

## 4. Hardcoded safe to key later

Эта группа безопасна для будущей миграции в `lang/en.json` и `lang/ru.json`, потому что не меняет авторский голос, смысл услуги или навигационную безопасность.

### 4.1. Accessibility labels

Примеры:

- `index.html`: `aria-label="VETUS NAUTA - Brkovic home"`, `aria-label="Instagram"`, `aria-label="Quick actions"`, footer nav labels.
- `journal.html`: `aria-label="Practical tools"`, `aria-label="Open Nav Desk"`, `aria-label="Journal filters"`, footer nav labels.
- `navdesk-*.html`: brand home, Instagram, `aria-label="Screen mode"`, day/night button `aria-label` / `title`.
- `js/main.js`: `aria-label="Close"`, `aria-label="Site sections"` generated in modal.

Предложение: добавить поддержку `data-i18n-aria-label`, `data-i18n-title`, `data-i18n-alt` в `js/language.js`, затем ключевать только такие атрибуты. Это минимальная и безопасная правка будущего спринта.

### 4.2. Простые UI-команды

Кандидаты:

- `Назад к штурманскому столу`
- `Судовой журнал`
- `Открыть`
- `Закрыть`
- `Сохранить`
- `Печать / PDF`
- `Поделиться`
- `Копировать`
- `Сбросить`
- `Найти`

Часть этих строк уже есть в JSON, часть остается hardcoded на отдельных страницах или в JS.

### 4.3. Placeholder-строки формы

Кандидаты:

- placeholder в route search;
- placeholder в tide place;
- placeholders в watch form;
- service form placeholders, если где-то остались неключеванные.

Оговорка: примеры координат, `Kotor - Bar`, `testboat 17`, `NW 12 kn`, `Mayday`, `Pan-Pan`, `Sécurité` не надо автоматически переводить как обычный текст. Это рабочие примеры/термины.

### 4.4. 404 page

Файл: `404.html`

Сейчас это отдельная маленькая hardcoded English page без подключения языкового слоя. Можно ключевать в низком приоритете после MVP, либо оставить как техническую страницу до SEO-спринта.

## 5. Hardcoded risky / owner voice

Эту группу нельзя переносить механически без владельца, локализатора или SEO.

### 5.1. Русский авторский и маркетинговый голос

Файлы:

- `index.html`
- `services/*.html`
- `journal.html`
- `data/journal-public.json`
- backend journal payload

На сайте уже есть авторский стиль. Переводить или переписывать публичные формулировки без смыслового согласования нельзя. Для future languages нужен workflow: русский canonical source -> approved translation -> SEO adaptation -> QA.

### 5.2. Journal content

Файлы:

- `js/journal.js`
- `data/journal-public.json`
- live API `/api/public/journal`
- admin flow `admin-posts.html` / `js/admin-posts.js`

Посты, группы и многостраничные записи являются контентом владельца, а не интерфейсом. Их нельзя мигрировать только frontend-ключами.

Отдельный риск: в `js/journal.js` есть public-side `translateFree()` с MyMemory/LibreTranslate/Argos OpenTech fallback. В `js/admin-posts.js` есть похожая логика. Это не соответствует целевой модели с OpenAI API через контролируемый server-side/admin workflow. Перед расширением языков нужна backend/localization задача.

### 5.3. Service/contact generated text

Файл: `js/main.js`

Пример: CV request auto message:

- Russian: просьба направить CV.
- English: request to send CV and overview.

Это не просто кнопка, а клиентское сообщение от посетителя. Нужен owner/localization approval.

### 5.4. Yacht management and delivery commercial logic

Файлы:

- `js/management.js`
- `data/management-pricing.json`
- `js/delivery-calculator.js`

Здесь смешаны UI, расчет, коммерческие описания, печать/документ. Переносить нужно отдельным спринтом по management/delivery, с проверкой смыслов и документов.

### 5.5. UKV / radio / Seaspeak

Файлы:

- `navdesk-ukv.html`
- `js/navdesk.js`

Радиообмен нельзя локализовать как обычную страницу. Команды, spelling, distress/urgency/safety formats и рабочие фразы часто должны оставаться на английском как морская практика. Локализовать можно интерфейс и пояснения, но не ломать сам стандартный radio output.

## 6. Generated technical strings

Эта группа формируется JS-кодом и сейчас часто обходит `lang/*.json`.

### 6.1. Journal UI

Файл: `js/journal.js`

Найдено:

- `getLang()` и множественные `getLang() === 'ru' ? ... : ...`.
- Заголовки single/collection mode: `Многостраничная запись`, `Запись судового журнала`, `Заметки с морей`.
- Back link: `← Назад в журнал`.
- Read more / collapse.
- Comment status: отправка, ожидает модерации, failed.
- Copy attribution rights notice.
- Public-side auto-translation fallback.

Решение будущего спринта: сперва перенести только интерфейсные статусы в JSON; контент и перевод постов оставить backend/localization.

### 6.2. NavDesk common dict

Файл: `js/navdesk.js`

В начале файла есть internal `dict` на `ru/en` для части расчетов:

- basic calc statuses;
- tides search/status;
- weekly graph labels;
- route statuses.

Это лучше, чем полностью hardcoded строки, но это не общий `lang/*.json`. Плюс `getLang()` ограничен `ru/en`, а fallback сейчас `ru`. Для текущей модели primary public `en` это надо пересмотреть в отдельной implementation-задаче.

### 6.3. NavDesk watch

Файлы:

- `navdesk-watch.html`
- `js/navdesk.js`

Самая большая hardcoded зона:

- текущая вахта;
- старший/состав;
- reminders;
- GPS statuses/errors;
- localStorage statuses;
- save/sign shift;
- schedule statuses;
- rest control;
- share text.

Это technical UI, но safety-adjacent. Нужен отдельный glossary и QA на desktop/tablet/mobile, day/night.

### 6.4. Route

Файлы:

- `navdesk-route.html`
- `js/navdesk.js`

Основная форма частично ключевана, но generated output/print содержит hardcoded labels и safety text:

- route print title/subtitle;
- headers for great circle/rhumb line;
- generated date;
- route points table;
- navigation disclaimer.

### 6.5. Tides

Файлы:

- `navdesk-tides.html`
- `js/navdesk.js`

Много строк уже в internal dict, но не в JSON. Важно отдельно учесть:

- search suggestions/statuses;
- manual input statuses;
- weekly graph labels;
- safe/below/required depth;
- source/local demo source;
- print/PDF strings.

### 6.6. Delivery calculator

Файл: `js/delivery-calculator.js`

Есть hardcoded RU/EN summaries:

- duration labels;
- speed/distance hints;
- fuel amount;
- crew/team text.

Безопаснее вынести в JSON после проверки коммерческого текста и единиц измерения.

### 6.7. Management

Файл: `js/management.js`

Есть локальная функция `t(key, fallback)` и работа с `titleRu/titleEn`. Но print preview и отдельные generated labels остаются hardcoded/binary. Отдельная задача по management document i18n.

### 6.8. Admin pages

Файлы:

- `admin-posts.html`, `js/admin-posts.js`
- `admin-comments.html`, `js/admin-comments.js`
- `admin-management.html`, `js/admin-management.js`
- `admin-mnr.html`

Админка сейчас русская, и это соответствует замыслу: владелец пишет journal/admin source на русском. Не включать admin UI в публичный MVP i18n-спринт без отдельного решения.

## 7. NavDesk safety strings

Эта группа должна идти через отдельный safety/localization approval.

### 7.1. Disclaimer

Файлы:

- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- `lang/en.json`
- `lang/ru.json`

Текст `navdesk_modal_title`, `navdesk_modal_text`, `navdesk_modal_accept` уже в i18n. Его нельзя ломать. Дисклеймер должен оставаться общим предупреждением NavDesk и не превращаться в случайные отдельные предупреждения внутри инструментов без решения директора.

### 7.2. Day/night mode

Файлы:

- `navdesk-*.html`
- `js/navdesk.js`
- `css/navdesk.css`

Day/night mode является отличием NavDesk от остального сайта. Его нельзя убирать, переносить или визуально переосмыслять в i18n-спринте.

Можно позже ключевать только accessibility:

- `aria-label="Screen mode"`
- `aria-label="Дневной режим"`
- `aria-label="Ночной режим"`
- `title="Дневной режим"`
- `title="Ночной режим"`

### 7.3. Tides safety

Термины, требующие glossary:

- tide / tidal window;
- safe passage window;
- available depth;
- charted depth;
- draft;
- under keel clearance / UKC;
- sufficient / below setting;
- manual mode;
- local demo data.

Нельзя допустить, чтобы перевод менял смысл расчетов по глубине.

### 7.4. Route safety

Термины:

- great circle / orthodromic route;
- rhumb line / loxodromic route;
- true course;
- initial/final course;
- route points;
- navigation calculation is auxiliary.

Печатный маршрут должен сохранять safety disclaimer.

### 7.5. Watch safety

Термины:

- watch;
- shift;
- watchkeeper;
- captain;
- first mate;
- rest control;
- signed watch;
- hourly GPS mark;
- reminder before watch.

Отдельно: внутренний термин "собачья вахта" не должен становиться видимой интерфейсной подписью. Можно только нативно подсвечивать соответствующие предрассветные/ночные периоды без сленговой метки.

### 7.6. UKV safety

Термины:

- Mayday;
- Pan-Pan;
- Sécurité;
- VTS;
- marina call;
- coast station;
- radio spelling;
- callsign.

Стандартные радио-формулы и spelling output должны проходить морскую/языковую проверку. Перевод интерфейса не должен переводить сам рабочий radio format, если по практике он должен звучать на английском.

## 8. Print/PDF/share strings

Эта группа критична, потому что пользователь получает документ, а не просто экран.

### 8.1. Watch print

Файл: `js/navdesk.js`

Hardcoded:

- `Лист вахтенных записей`
- `Расписание вахт`
- `Подписанные смены`
- `Контроль отдыха`
- table headers: дата/время, UTC, старший, позиция, курс, скорость, ветер/море, запись, подпись.
- `Сформирован`
- `Формат`
- `Вахтенный журнал`
- `Для PDF выберите сохранение в PDF в окне печати.`
- share title/text/statuses.

Также print document сейчас создается как `<html lang="ru">`. Для future languages нужен параметр языка документа.

### 8.2. Route print/PDF

Файл: `js/navdesk.js`

Hardcoded:

- route report title/subtitle;
- generated date;
- labels for orthodromy/loxodromy;
- points table;
- safety note.

Нужно делать отдельной задачей: route output должен быть не только переведен, но и профессионально понятен.

### 8.3. Tides weekly graph print/PDF

Файл: `js/navdesk.js`

Часть строк есть в internal dict, но не в `lang/*.json`:

- weekly graph title;
- print title;
- safe/below labels;
- source;
- formulas.

После переноса нужен QA на A4 landscape/portrait и day/night.

### 8.4. UKV quick sheet print

Файл: `js/navdesk.js`

Есть общий print shell с default footer:

- `Vetus Nauta`
- `Have a good watch Captain!`

Плюс UKV quick sheet формируется как отдельный рабочий документ. Нужна отдельная задача с морским glossary.

### 8.5. Management print

Файл: `js/management.js`

Print preview/document содержит generated strings и binary RU/EN логику. Это не NavDesk, но входит в frontend i18n-surface.

## 9. Legacy / dead-code risk

Есть корневой файл `navdesk.js` рядом с `js/navdesk.js`.

Проверка подключений показала, что текущие NavDesk HTML используют `js/navdesk.js`:

- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-ukv.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-english.html`

Корневой `navdesk.js` содержит старую логику `lang-switch__btn` и небольшие словари. На runtime он, похоже, не используется, но перед удалением нужна отдельная cleanup-задача и проверка production package, чтобы не сломать старые ссылки/кэш.

## 10. Safe migration order

### Step A. Translation engine extension

Отдельная FE-задача:

- добавить поддержку `data-i18n-aria-label`;
- добавить поддержку `data-i18n-title` на элементах без конфликта с root `data-i18n-title`;
- добавить поддержку `data-i18n-alt`;
- не менять визуал;
- проверить меню, header, footer, NavDesk day/night.

Риск низкий.

### Step B. Shell/accessibility keys

Ключевать:

- header aria labels;
- footer nav aria labels;
- site menu generated aria labels;
- NavDesk theme switch aria/title;
- 404 page, если SEO разрешит.

Риск низкий.

### Step C. Public UI commands and statuses

Ключевать:

- generic buttons;
- simple statuses;
- placeholders;
- "Back to..." links;
- empty states.

Начать с `en/ru` only. Planned languages остаются disabled until complete JSON exists.

Риск средний: нужно не затронуть owner voice.

### Step D. NavDesk per-tool migration

Делить строго по инструментам:

1. Tides: search/status/weekly graph labels.
2. Route: form/output statuses, route result labels.
3. UKV: interface labels only; radio output after glossary.
4. Watch: отдельный большой спринт с GPS/localStorage/notifications/print/share.
5. Nav abbreviations and Maritime English: отдельные content/product задачи.

Риск высокий без QA, потому что это функциональные инструменты.

### Step E. Print/PDF/share layer

Сделать единый helper для print documents:

- document language;
- title/subtitle;
- generated/date/format labels;
- footer labels;
- A4 layout text;
- safety notes.

Каждый print/PDF документ проверять отдельно: desktop, tablet, mobile trigger, actual print preview/A4.

Риск высокий.

### Step F. Journal interface before journal content

Сначала:

- read more/back/comment statuses/copy attribution;
- empty states;
- filters/labels.

Потом только через backend/localization:

- post translations;
- group/multipage translations;
- media alt translations;
- SEO title/description per entry;
- OpenAI admin workflow.

Риск высокий, потому что журнал является авторским контентом.

### Step G. Planned languages unlock

Не включать `de`, `it`, `es`, `sr`, `zh` как активные языки до выполнения:

- full `lang/*.json`;
- URL/canonical/hreflang strategy;
- localized meta/schema;
- QA pass;
- fallback decision for missing keys;
- content translation workflow.

## 11. Areas requiring backend / SEO / localization before implementation

### Backend required

- Journal translations: source Russian post -> translated title/text/excerpt/media alt/SEO fields.
- Admin OpenAI integration: server-side only, no key in frontend.
- Multipage journal translation structure and ordering.
- Forms backend: accept full language code beyond current binary `ru/en`.
- Possible localized URLs/API response fields.

### SEO required

- URL model for languages: paths, subfolders, query, or another strategy.
- `hreflang` and canonical.
- sitemap/robots.
- per-page title/description.
- schema for services, journal, NavDesk tools.
- noindex/index decisions for tools, print pages, admin pages.

### Localization required

- NavDesk maritime glossary.
- Watch terminology.
- Tides/depth/UKC terms.
- Route orthodromy/loxodromy terms.
- UKV/Seaspeak/radio output rules.
- Owner voice policy for service/journal marketing.
- Chinese naming: interface can use `zh`, but strategic label is Mandarin.

### QA required

- day/night mode in every NavDesk page.
- common NavDesk disclaimer behavior.
- language menu with roadmap languages disabled.
- no accidental legacy `RU/EN` switchers.
- print/PDF on A4.
- mobile/tablet/desktop.
- accessibility labels after i18n attributes are added.

## 12. Recommended immediate next tasks

1. FE-013: Add attribute i18n support for `aria-label`, `title`, `alt`; key only shell/accessibility strings. No visual redesign.
2. FE-014: Move generic generated UI strings from `js/main.js`, `js/form.js`, low-risk parts of `js/journal.js` into `lang/en.json` and `lang/ru.json`.
3. NAV-FE-015: Tides i18n extraction from internal `dict` into shared language JSON, with no behavior change.
4. NAV-FE-016: Route i18n extraction for visible output and print/PDF labels, with print QA.
5. NAV-FE-017: Watch glossary and i18n plan before code implementation; include GPS/localStorage/reminder/print/share.
6. LOC-007: Maritime glossary for NavDesk and UKV.
7. BACK-OPENAI-001: Journal/admin language desk design; remove/replace public-side free translation flow only after backend path exists.
8. SEO-DIR: Language URL/hreflang/canonical strategy before enabling planned languages.

## 13. Final decision for this step

Не начинать массовый перевод интерфейса прямо сейчас.

Правильный следующий frontend move: расширить i18n engine под атрибуты и ключевать безопасную оболочку. Затем переносить generated strings инструмент за инструментом, начиная с низкорисковых статусов и заканчивая NavDesk watch/print/journal content только после glossary, backend и SEO решений.

Product code в рамках BRK-MVP-FE-012 не изменялся.

Файл отчета: `docs/brkovic_ltd_project_office/reports/frontend-i18n-surface-step2-2026-05-28.md`
