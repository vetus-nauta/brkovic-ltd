# BRKOVIC.LTD full handoff — 2026-05-20

Этот документ нужен, чтобы другой чат на другом компьютере мог быстро продолжить работу по проекту `brkovic-ltd` без потери контекста.

## 1. Главные правила

- Основной проект: `/home/alexey/GitHub/Revoyacht/brkovic-ltd`.
- Не считать основным проектом `/home/alexey/GitHub/Revoyacht/yacht-flex-demo`; это экспериментальная зона.
- В рабочем дереве могут быть грязные изменения. Перед любыми действиями сначала делать:

```bash
git status --short --branch
```

- Не делать `git reset`, `git checkout --`, `git clean` и не откатывать чужие изменения без прямой команды владельца.
- Русский текст и маркетинговые формулировки согласовывать смыслово до внедрения: владелец проекта сам является автором основного русского голоса сайта.
- Не мержить `origin/main` вслепую. Там отдельная линия работ по Captain Fin, и она уже ушла вперед.

## 2. GitHub и ветки

Репозиторий:

```bash
git@github.com:vetus-nauta/brkovic-ltd.git
```

Текущая локальная база перед публикацией этого хендоффа:

```text
main...origin/main [ahead 1, behind 14]
HEAD: cdd43c5 Update 2026-05-19 project handoff
origin/main: eda4aaa Update Captain Fin handoff copy
```

Локальный `main` содержит коммит хендоффа от 2026-05-19, а `origin/main` содержит 14 более новых коммитов по Captain Fin:

- `eda4aaa Update Captain Fin handoff copy`
- `0dd9ee1 Update Captain Fin signed entry sync`
- `aef3b46 Update Captain Fin autosave stability`
- `f8a1f6b Add Captain Fin archive attachments and drive sync`
- `b3a8eca Style Captain Fin Excel report template`
- `229898c Fix Captain Fin Excel download flow`
- `b4f59c2 Fix Captain Fin mobile navigation`
- `ba88b83 Update Captain Fin mobile workflow`
- `ae2d644 Persist Captain Fin login cookie`
- `725bda8 Bump Captain Fin API version marker`
- `f56cf57 Allow Captain Fin API and protect storage`
- `a15dd7d Fix Captain Fin sharing links`
- `69de7f6 Add Captain Fin Drive sync helper`
- `fb1cc8d Add Captain Fin web app`

Для продолжения на другом компьютере использовать ветку полного хендоффа:

```bash
git clone git@github.com:vetus-nauta/brkovic-ltd.git
cd brkovic-ltd
git fetch origin
git switch -c handoff-2026-05-20-full origin/handoff-2026-05-20-full
git status --short --branch
```

Если нужно потом интегрировать это в `origin/main`, сначала изучить разницу:

```bash
git fetch origin
git log --oneline --decorate --left-right --cherry-pick handoff-2026-05-20-full...origin/main
git diff --stat origin/main...handoff-2026-05-20-full
git diff origin/main...handoff-2026-05-20-full
```

Прямой push в `main` не делать.

## 3. Локальный запуск

Из корня проекта:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
php -S 0.0.0.0:18090 -t .
```

Локальные адреса:

- `http://127.0.0.1:18090/`
- `http://127.0.0.1:18090/services/yacht-management.html`
- `http://127.0.0.1:18090/admin-mnr.html`
- `http://127.0.0.1:18090/journal.html`
- `http://127.0.0.1:18090/navdesk.html`
- `http://127.0.0.1:18090/services/iyt-training.html`
- `http://127.0.0.1:18090/services/skipper-service.html`

Для телефона в одной Wi-Fi сети проверить IP:

```bash
hostname -I
```

На 2026-05-20 текущий адрес был:

```text
192.168.1.229
```

Пример:

```text
http://192.168.1.229:18090/
```

## 4. Последний важный backup

Последний зафиксированный полный backup до текущей серии правок:

```text
../backups/brkovic-ltd-full-backup-20260519-231440.tar.gz
```

Рядом должен быть sha256-файл.

## 5. Что изменено в этом снимке

### Антиспам формы

Файлы:

- `forms/send.php`
- `js/form.js`
- `forms/.htaccess`
- `forms/config.example.php`
- `.gitignore`

Суть:

- Добавлена проверка `Origin` / `Referer` по хосту.
- Добавлены honeypot, временной порог отправки, одноразовый фронтовый token и `source_page`.
- Добавлены лимиты по IP, email и глобальной частоте.
- Добавлена базовая фильтрация мусорного контента.
- Добавлен security log.
- Автоответ отключен по умолчанию через `send_auto_reply => false`, чтобы спамеры не использовали форму как отражатель.
- Защищены `config.php`, логи и rate-limit файлы через `forms/.htaccess`.
- Runtime файлы формы добавлены в `.gitignore`.

Важное:

- Реальный `forms/config.php` не коммитится и должен быть настроен на хостинге отдельно.
- Не публиковать наружу `form-security.log`, `smtp-error.log`, `form-rate-limit.json`, `form-rate-limit.lock`.

FTP / боевой хостинг:

- В момент спам-атаки антиспам-правки могли применяться срочно через FTP, поэтому перед любой новой выкладкой обязательно сравнить боевые файлы с веткой `handoff-2026-05-20-full`, а не заливать старую локальную копию поверх сервера.
- Критичные файлы для сверки на FTP:
  - `forms/send.php`
  - `js/form.js`
  - `forms/.htaccess`
  - `forms/config.php`
  - `.gitignore` только для репозитория, на FTP она не защищает сервер сама по себе.
- `forms/config.php` на FTP не заменять примером `forms/config.example.php`. В нем должны остаться реальные SMTP/почтовые настройки.
- Проверить, что `forms/.htaccess` реально работает у текущего хостинга и закрывает доступ к `config.php`, логам и rate-limit файлам.
- Проверить наличие и права на runtime-файлы формы на сервере: `form-security.log`, `smtp-error.log`, `form-rate-limit.json`, `form-rate-limit.lock`. Они могут создаваться уже на боевом сервере и не должны попадать в GitHub.
- После выкладки сделать тестовую отправку формы и посмотреть, что нормальная заявка проходит, а слишком быстрая/пустая/ботовая отправка блокируется.

### Языки, меню и перевод браузером

Файлы:

- `js/language.js`
- `js/main.js`
- `lang/ru.json`
- `lang/en.json`
- публичные HTML-страницы
- `css/main.css`
- `css/responsive.css`

Суть:

- Продолжается стратегия автоопределения русского/английского языка.
- Добавлены/синхронизированы ключи переводов.
- На публичных страницах включена защита от автоматического перевода браузером: `translate="no"`, `notranslate`, meta `google notranslate`.
- Меню приведено к общей логике, добавлен языковой переключатель и место под настройки.

### IYT / Sail Skill

Файлы:

- `services/iyt-training.html`
- `index.html`
- `index.php`
- `css/main.css`
- `css/responsive.css`
- `images/services/iyt-navigation-saloon-hero.png`
- `images/services/iyt-navigation-instructor-hero.png`

Суть:

- Страница переосмыслена как `IYT тренинг-центр в Черногории` и `Sail Skill Association`.
- В текстах избегается школьная терминология вроде "ученик" и "обучение" там, где это может звучать как государственное образование.
- Рабочая формулировка: после прохождения курса участник получает сертификат, соответствующий уровню пройденной программы.
- Главная карточка IYT помечена IYT / Sail Skill и слегка выделена зеленым оттенком.
- Hero заменен на персонажа преподавателя навигации в кают-компании, без использования фотографии владельца.

Смысловая линия:

```text
Задача программы — не сделать из человека "ученика", а помочь будущему шкиперу спокойно и уверенно действовать на борту: понимать море, лодку, экипаж, погоду и свою ответственность.
```

### Судовой журнал

Файлы:

- `journal.html`
- `css/journal.css`
- `js/journal.js`

Суть:

- Хедер пересобран цельной карточкой, ближе к эталону главной страницы.
- Убрана лишняя карточка под хедером.
- Основной блок переименован:
  - первая строка: `Судовой журнал`
  - вторая строка: `Заметки с морей`
- Карточка `Штурманский стол` стала цельной кликабельной карточкой:
  - первая строка: `Штурманский стол`
  - вторая строка: `Практические инструменты`
- Отдельная кнопка внутри карточки убрана.
- Hover / focus реакция сделана на всю карточку.
- На мобильной версии карточка получает краткую подсветку после тапа.
- Лента журнала адаптирована под планшет: фильтры не лезут в заголовок.
- Локальная версия журнала подтягивает записи с боевого API при просмотре с localhost / LAN, чтобы старые записи не казались потерянными.

Обновление 2026-05-24:

- С боевого сайта снят публичный снимок журнала в `data/journal-public.json`. В нем 4 опубликованных записи:
  - `Море не терпит лишнего`
  - `Никто не владеет морем`
  - групповая заметка `Роли в море`, часть 1: `Море не любит спектакль`
  - групповая заметка `Роли в море`, часть 2: `Море не любит спектакль. Часть 2`
- На localhost / LAN журнал сначала берет локальный снимок `data/journal-public.json`, а боевой API остается рабочим источником для лайков, комментариев и fallback.
- Порядок ленты больше не зависит от порядка ответа API. Лента строится хронологически: заметка №1, заметка №2, затем групповая заметка №3.
- Групповая заметка считается одной заметкой в нумерации: обе части показывают `№ 3`, а внутри группы сортируются по `groupOrder`, затем по дате.
- Для вертикального планшета добавлен CSS containment слоя групповых записей. Проверено в Chrome headless на 768×1024: `scrollWidth` равен `clientWidth`, горизонтального выезда за рамку нет.

### Штурманский стол

Файлы:

- `navdesk.html`
- `css/navdesk.css`

Суть:

- Планшетный хедер пересобран отдельной карточкой, чтобы логотип и меню не ломались.
- Учтен ночной режим: используется отдельный ночной логотип.
- Футер в ночном режиме приведен к темной палитре.
- Меню в ночном режиме адаптировано по цветам и состояниям.

### Услуги шкипера

Файлы:

- `services/skipper-service.html`
- `images/services/skipper-service-captain-ron-hero-final.png`
- черновики:
  - `images/services/skipper-service-captain-ron-hero.png`
  - `images/services/skipper-service-captain-ron-hero-v2.png`
  - `images/services/skipper-service-captain-ron-hero-v3.png`
  - `images/services/skipper-service-captain-ron-hero-v4.png`

Суть:

- Для hero подобран шуточный образ наемного шкипера в духе приключенческой морской комедии, но без копирования актера или конкретного кадра фильма.
- Финальная картинка: `skipper-service-captain-ron-hero-final.png`.
- В HTML подключена с cache-busting:

```text
../images/services/skipper-service-captain-ron-hero-final.png?v=20260520-01
```

Черновики пока не удалены, чтобы можно было вернуться к вариантам.

### Футеры и хедеры

Файлы:

- публичные HTML-страницы
- `css/main.css`
- `css/responsive.css`
- `css/journal.css`
- `css/navdesk.css`

Суть:

- Футеры постепенно приведены к карте сайта.
- Ссылки сгруппированы человеческими названиями:
  - услуги
  - досуг и практические инструменты
- На страницах, где есть ссылки в админку, они сохранены. Особенно важно:
  - `journal.html`: ссылки для админ-действий журнала сохранены.
  - `admin-mnr.html` и management-связки не сносить.

### Yacht management / admin

Файлы:

- `services/yacht-management.html`
- `admin-mnr.html`
- `management-admin-api.php`
- `js/management.js`
- `js/admin-management.js`
- `css/admin-management.css`
- `data/management-pricing.json`

Суть:

- Продолжается линия публичного калькулятора, проформ, договоров, сохранения комитентов и документов.
- Печатный публичный шаблон расчета ранее правился: логотип, реквизиты, таблица услуг, правая граница печати.
- Ветка `origin/main` содержит отдельную большую работу по Captain Fin; не смешивать без ревью.

### Инструменты предпросмотра

Файлы:

- `tools/device-preview.html`
- `tools/i18n-diagnostics.mjs`
- `tools/open-mobile-preview.sh`
- `tools/open-tablet-preview.sh`

Суть:

- Добавлены локальные утилиты для просмотра мобильной/планшетной версии и диагностики языковых ключей.

## 6. Что проверено перед хендоффом

Синтаксис PHP:

```bash
php -l index.php
php -l management-admin-api.php
php -l forms/send.php
```

Результат: ошибок синтаксиса нет.

Синтаксис JS:

```bash
node --check js/language.js
node --check js/main.js
node --check js/form.js
node --check js/journal.js
node --check js/management.js
node --check js/admin-management.js
node --check js/navdesk.js
```

Результат: ошибок синтаксиса нет.

i18n:

```bash
node tools/i18n-diagnostics.mjs
```

Результат:

```text
usedKeys: 530
missingInRu: []
missingInEn: []
ruOnly: []
enOnly: []
```

HTTP-проверка локального сервера:

```bash
curl -I http://127.0.0.1:18090/
curl -I http://127.0.0.1:18090/journal.html
curl -I http://127.0.0.1:18090/navdesk.html
curl -I http://127.0.0.1:18090/services/skipper-service.html
curl -I http://127.0.0.1:18090/services/iyt-training.html
curl -I http://127.0.0.1:18090/services/yacht-management.html
curl -I http://127.0.0.1:18090/admin-mnr.html
```

Результат: все перечисленные страницы отдают `200 OK` на локальном PHP-сервере.

## 7. Скриншоты, сделанные во время работы

Часть скриншотов лежит во временной директории текущей машины:

- `/tmp/brkovic-journal-layout-desktop.png`
- `/tmp/brkovic-journal-layout-tablet.png`
- `/tmp/brkovic-journal-layout-mobile.png`
- `/tmp/brkovic-navdesk-tablet-day-after.png`
- `/tmp/brkovic-navdesk-tablet-night-header-after.png`
- `/tmp/brkovic-navdesk-tablet-night-footer-after.png`
- `/tmp/brkovic-navdesk-night-menu-after.png`
- `/tmp/brkovic-navdesk-night-menu-mobile-after.png`
- `/tmp/brkovic-skipper-hero-desktop.png`
- `/tmp/brkovic-skipper-hero-mobile.png`

Они не являются частью репозитория.

## 8. Следующие шаги

1. Не мержить текущий handoff в `origin/main` автоматически. Сначала сравнить с Captain Fin веткой.
2. На странице `services/skipper-service.html` продолжить уже после утвержденного hero: тексты, карточки, воронка.
3. Решить, оставлять ли черновики skipper hero (`v2`, `v3`, `v4`) в репозитории или удалить после финального согласования.
4. Продолжить аккуратное выравнивание футеров и хедеров по всем публичным страницам.
5. Проверить ночной режим `navdesk.html` после будущих изменений меню.
6. Продолжить языковую стратегию: русский/английский сейчас основные, дополнительные языки добавлять после стабилизации структуры.
7. Перед боевой выкладкой формы проверить `forms/config.php` на сервере и убедиться, что `forms/.htaccess` работает на конкретном хостинге.
8. Если нужно открыть PR, установить и авторизовать GitHub CLI:

```bash
gh auth login
```

Сейчас на этой машине `gh` отсутствует.

## 9. Как продолжить разговор в новом чате

Короткий стартовый текст для нового чата:

```text
Мы продолжаем основной проект brkovic-ltd. Работать по-русски.
Код брать из GitHub-ветки handoff-2026-05-20-full репозитория vetus-nauta/brkovic-ltd.
Сначала прочитать docs/brkovic_ltd_full_handoff_2026-05-20.md и сделать git status.
Не трогать yacht-flex-demo как основной проект.
Не делать reset/checkout/clean и не мержить origin/main вслепую: origin/main ушел вперед по Captain Fin.
Локальный сервер: php -S 0.0.0.0:18090 -t .
Главное направление сейчас: продолжить страницу "Услуги шкипера" после утвержденного hero, затем аккуратно продолжать IYT, судовой журнал, штурманский стол, футеры/хедеры, yacht management/admin.
```
