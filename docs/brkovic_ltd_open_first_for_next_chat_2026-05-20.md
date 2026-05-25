# BRKOVIC.LTD - открыть первым для нового чата

Это короткая вводная речь для другого чата на другом компьютере. Ее нужно открыть первой, а уже потом читать полный хендофф.

## Скажи новому чату вот это

```text
Мы продолжаем основной проект brkovic-ltd. Работать со мной по-русски.

Это не новый проект и не экспериментальная зона. Главный репозиторий:
git@github.com:vetus-nauta/brkovic-ltd.git

Рабочая ветка для продолжения:
handoff-2026-05-20-full

Сначала сделай:
git clone git@github.com:vetus-nauta/brkovic-ltd.git
cd brkovic-ltd
git fetch origin
git switch -c handoff-2026-05-20-full origin/handoff-2026-05-20-full
git status --short --branch

После этого прочитай:
docs/brkovic_ltd_full_handoff_2026-05-20.md
docs/brkovic_ltd_project_knowledge.md
docs/brkovic_ltd_journal_audit_2026-05-25.md
docs/brkovic_ltd_backend_ftp_access_notes_2026-05-25.md

Google Doc полного хендоффа:
https://docs.google.com/document/d/1l6TPumghgU22fcQPsuCo6kZX__JFpMiLno2LVXibzlM

Локальный сервер:
php -S 0.0.0.0:18090 -t .

Локальные адреса:
http://127.0.0.1:18090/
http://127.0.0.1:18090/services/skipper-service.html
http://127.0.0.1:18090/services/iyt-training.html
http://127.0.0.1:18090/services/sailing-tours.html
http://127.0.0.1:18090/services/yacht-acceptance-delivery.html
http://127.0.0.1:18090/services/yacht-registration.html
http://127.0.0.1:18090/journal.html
http://127.0.0.1:18090/navdesk.html
http://127.0.0.1:18090/services/yacht-management.html
http://127.0.0.1:18090/admin-mnr.html

Важно:
- Не трогать Revoyacht/yacht-flex-demo как основной проект.
- Не делать git reset, git checkout --, git clean.
- Не откатывать чужие изменения.
- Не мержить origin/main вслепую: origin/main ушел вперед по Captain Fin.
- Не пушить напрямую в main.
- FTP на этом Linux-ПК уже настроен локально вне Git через `~/.netrc`.
- FTP не нужен для обычной локальной верстки, но нужен для боевого сайта, backend-а журнала и сверки серверных файлов.
- Секреты FTP/DB не искать в Git и не коммитить.
- Backend судового журнала найден на сервере в `/journal-backend`; локальный read-only snapshot лежит в `/home/alexey/.local/share/brkovic-ltd/ftp-snapshot/journal-backend`.
- Для backend-а создана локальная working copy: `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`.
- В этой working copy есть коммиты multipage/translation schema и collection API; DB migration и backend deploy на production выполнены 2026-05-25.

Смысл проекта:
brkovic-ltd - сайт и рабочая система вокруг яхтенных услуг. Это не сухой корпоративный шаблон. На главной, в yacht management, IYT и следующих страницах развивается традиция персонажей: не фотографический двойник владельца, а художественный персонаж, отдаленно напоминающий автора и подходящий по смыслу страницы.

Текущий фокус:
1. Привести остальные страницы услуг к общему поведению, освоенному на `services/yacht-acceptance-delivery.html` и `services/yacht-registration.html`.
2. Для новых и обрабатываемых страниц применять мобильную технику из `docs/brkovic_ltd_project_knowledge.md`: короткий обзор, вертикальные раскрывающиеся смысловые блоки, компактные инструменты без длинной портянки.
3. Переосмыслить главную страницу исходя из содержания сервисных страниц: погода, вероятно, лишняя; карточки услуг надо очистить от мусора, сделать информативнее и выровнять сетку.
4. Карточку `Yacht Management` на главной не оставлять тяжелой синей и на всю ширину; привести к общему ритму. Остальные карточки стилизовать по принципу IYT: неброский тематический оттенок / знак / тень, без пестроты.
5. Пока не трогать `journal.html` и `navdesk.html`. Судовой журнал и штурманский стол приводить в порядок отдельным спринтом.
6. Русский текст и маркетинговые формулировки сначала обсуждать смыслово. Владелец проекта сам автор основного русского голоса.

Важно по судовому журналу:
- В frontend-репозитории backend журнала не лежит, но на боевом сервере он есть: `/journal-backend`.
- Это NestJS + Prisma + PostgreSQL.
- Production backend уже получил модели `JournalCollection`, `JournalCollectionPage`, `JournalTranslation`, `JournalMediaTranslation`, общий `collectionId` для комментариев/лайков/share, `Post.sortOrder` и `Post.sourceLanguage`.
- Публичный `/api/public/journal/collections` возвращает `200` и пока пустой массив.
- Публичные маршруты like / unlike / like-status для обычных записей подключены и проверены.
- Админский `/api/admin/journal-collections` существует; без авторизации возвращает `401`, это нормально.
- Боевой `admin-posts.html` уже выложен с блоком "Многостраничные записи" и cache-bust `20260525-journal-multipage-01`.
- Прямой PostgreSQL с локального ПК не открыт; база доступна backend-у на сервере через localhost.

Недавние важные изменения:
- Судовой журнал синхронизирован с боевым снимком, добавлены заметки №2 и групповая №3 из двух частей, исправлен порядок и планшетный выезд группового поста.
- Морские туры получили hero с гротом и акцент на недельные маршруты: Черногория, Хорватия, Италия.
- Приемка и доставка получили hero, деловой текст и калькулятор топлива / работы шкипера с Distance Tools maritime API через локальный proxy.
- Регистрация яхт перефокусирована на Черногорию, получила новый hero у кормы моторной яхты и мобильные раскрываемые блоки.

Особенно помнить про антиспам:
в момент атаки правки могли применяться на боевом сервере через FTP. Перед любой новой выкладкой нужно сверить боевые файлы forms/send.php, js/form.js, forms/.htaccess и forms/config.php. Реальный forms/config.php не заменять примером.
```

## Что это за документ

Это не замена полному хендоффу. Это входная дверь: быстрый текст, который можно дать новому чату, чтобы он не начал с неправильной ветки, не полез в FTP без необходимости и не потерял смысловую линию сайта.

Полный документ:

```text
docs/brkovic_ltd_full_handoff_2026-05-20.md
```

Google Doc полного хендоффа:

```text
https://docs.google.com/document/d/1l6TPumghgU22fcQPsuCo6kZX__JFpMiLno2LVXibzlM
```

## Где должна лежать копия на Google Drive

Проектная папка найдена как:

```text
02-BRKOVIC-LTD
https://drive.google.com/drive/folders/18ldyNyKKXeGLNA7kE5_ABEkkH0KpNPuU
```

Если документ на Drive окажется создан не внутри папки, его можно просто переместить в `02-BRKOVIC-LTD`. Главное, чтобы новый чат сначала открыл именно этот короткий `open first`, а затем полный хендофф.
