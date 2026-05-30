# Handoff для нового чата: game.brkovic.ltd

Дата handoff: 2026-05-26  
Проект: `game.brkovic.ltd` - отдельная игровая платформа экосистемы `brkovic.ltd`.

## Path migration notice

Canonical source path from 2026-05-26:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Deprecated old staging path:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

If an older document mentions `game-brkovic-ltd`, read it as `brkovic-ltd/game.brkovic.ltd`.

## Как использовать в новом чате

В новом чате можно вставить этот файл целиком и начать с фразы:

```text
Продолжай работу по handoff ниже. Рабочая директория: /home/alexey/GitHub/Revoyacht/brkovic-ltd. Игровой подпроект: game.brkovic.ltd. Не трогай секреты, не откатывай чужие изменения, сначала проверь текущее состояние.
```

## Правило коротких отчетов для должностных чатов

Источник истины - файлы в репозитории, а не длинная переписка.

Перед началом задачи должностный чат должен прочитать:

```text
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
```

Полный отчет, review или implementation note нужно писать в назначенный файл. В чат возвращается только короткий статус: task ID, путь к отчету, результаты тестов, сохраненные границы scope и следующий ожидаемый шаг.

Нельзя вставлять в чат полный отчет, повторять старую историю задач или добавлять размышления ниже блока постановки задачи.

## Где лежит проект

Локальный код нового сайта:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Основной сайт, куда уже добавлена ссылка на игру:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Продовый домен:

```text
https://game.brkovic.ltd/
```

Хостинг: Namecheap cPanel.  
Продовый корень поддомена в cPanel:

```text
/home/brkovic/game.brkovic.ltd/public
```

FTP-путь из текущей машины обычно соответствует:

```text
ftp://162.0.217.114/game.brkovic.ltd/
```

FTP credentials лежат в `~/.netrc`. Не печатать и не переносить секреты в документы.

## Где исходник концепции игры

Концепт и исходный handoff по игре находятся в Google Drive пользователя:

```text
Google Drive folder:
Интернет-проекты / 02-BRKOVIC-LTD / sea-speak

Shared link:
https://drive.google.com/drive/folders/1tzXdW3b4Kg1Nhwjs72jTmFyuVz_li8J6?usp=drive_link
```

Ключевые исходники концепции:

```text
00-Handoff/
brkovic_ltd_sea_speak_handoff_2026-05-25.md

sea-speak/
game_brkovic_full_working_handoff.zip
```

Внутри `game_brkovic_full_working_handoff.zip` были markdown-файлы с порядком чтения:

```text
00_README_ORDER.md
01_product_scope.md
02_architecture.md
03_auth_and_users.md
04_game_registry.md
05_captain_ether_core.md
06_scoring_lost_oars.md
07_content_model.md
08_admin_competitions.md
09_deployment.md
10_next_steps.md
11_codex_audit.md
```

Главный реализованный локальный seed-контент для первой игры:

```text
game.brkovic.ltd/content/captain-ether/starter.json
```

Реестр игр:

```text
game.brkovic.ltd/content/game-registry.json
```

## Продуктовое решение

Игра вынесена в отдельный поддомен `game.brkovic.ltd`, а не встроена в Nav Desk основного сайта.

Основной сайт `brkovic.ltd` должен только вести пользователя на игру. Игровой код, сессии, прогресс и будущая админка живут отдельно.

Первая активная игра:

```text
captain_ether
Капитан - Эфир
Sea Speak / maritime radio communication trainer
```

Запланированные игры в registry:

```text
wind_rider - Оседлавший ветер
mystic_boatswain - Мистический боцман
```

## Что уже сделано

Создан standalone PHP/PWA app без фреймворка:

```text
public/index.html
public/assets/app.css
public/assets/app.js
public/manifest.webmanifest
public/service-worker.js
public/.htaccess
public/api/*
private/bootstrap.php
private/config.example.php
content/*
storage/.gitkeep
```

Реализовано:

- PWA shell.
- Игровой хаб с тремя карточками.
- Первая игра `Капитан - Эфир`.
- Email login через 6-значный код.
- Server-side sessions, cookies, CSRF.
- JSON storage для MVP.
- Watch loop: выбор уровня, вопросы, ответы, подсказки, skip.
- Scoring: чисто, с подсказкой, ошибка, пропуск.
- Lost Oars / Hangar: слабые места сохраняются и закрываются.
- Admin placeholder.
- SSO scaffold для будущего общего аккаунта `brkovic.ltd`.
- Дисклеймер по источникам и учебному характеру программы.
- Стиль обновлен под основной сайт: светлое стекло, navy/accent палитра, логотип Vetus Nauta Brkovic.
- Ссылка из основного Nav Desk на `https://game.brkovic.ltd`.

## Дисклеймер и источники правил

В UI добавлен дисклеймер, что программа является учебным тренажером, а не официальной навигационной или радио-инструкцией.

В дисклеймере указаны ориентиры:

- IMO Standard Marine Communication Phrases, Resolution A.918(22).
- STCW Convention and STCW Code.
- COLREG 1972.
- ITU Radio Regulations, ITU Maritime Manual, ITU-R M.1171.
- International Code of Signals and radiotelephony spelling alphabet.
- IALA Maritime Buoyage System.
- IHO Hydrographic Dictionary S-32.

Файл, где это сейчас рендерится:

```text
public/assets/app.js
```

## Общая регистрация brkovic.ltd и game.brkovic.ltd

Требование пользователя:

```text
Пользователь, зарегистрированный на brkovic.ltd, должен автоматически быть пользователем game.brkovic.ltd. Не должно быть двойной регистрации в одной экосистеме.
```

Обязательное правило для новых игровых чатов:

```text
game.brkovic.ltd/docs/ecosystem-auth-guardrail.md
```

Не отключать SSO-мост и не возвращать обязательную вторую авторизацию внутри игр для пользователя, который пришёл через авторизацию `brkovic.ltd`.

Что уже заложено:

```text
docs/ecosystem-auth-plan.md
public/api/auth/ecosystem-login.php
private/config.example.php
```

Текущий статус:

```php
'ecosystem_sso_enabled' => false
```

Пока основной сайт не имеет полноценной регистрации, игра использует email-code login как fallback. Когда регистрация на `brkovic.ltd` будет готова, нужно включить signed SSO token flow:

```text
brkovic.ltd -> signed short-lived token -> game.brkovic.ltd/api/auth/ecosystem-login.php
```

Не использовать общий пароль или копирование баз между сайтами. `brkovic.ltd` должен стать identity provider, а игра хранит локальный game profile и progress.

## Продовая инфраструктура

Поддомен создан:

```text
game.brkovic.ltd
```

Document root:

```text
/home/brkovic/game.brkovic.ltd/public
```

Namecheap Advanced DNS:

```text
Type: A Record
Host: game
Value: 162.0.217.114
TTL: Automatic
```

SSL:

```text
PositiveSSL for game.brkovic.ltd
Issuer: Sectigo
Valid: 2026-05-25 to 2026-12-09
SAN: DNS:game.brkovic.ltd
```

Important:

```text
Use https://game.brkovic.ltd/
Do not use https://www.game.brkovic.ltd/
```

`www.game.brkovic.ltd` currently has no proper DNS/certificate.

## Production config

Local example config:

```text
private/config.example.php
```

Production config on server:

```text
/home/brkovic/game.brkovic.ltd/private/config.php
```

Local file exists too but is gitignored:

```text
game.brkovic.ltd/private/config.php
```

Known safe facts:

- `app_env` is set to `production` on server.
- SSO is disabled until main account system exists.
- Admin email includes the owner email.
- SMTP is not copied into this app. It reads existing main-site server SMTP config through `smtp_config_path`.

Do not print SMTP password or FTP credentials.

## SMTP and login code

Login code endpoint:

```text
POST /api/auth/request-code.php
```

Verify code endpoint:

```text
POST /api/auth/verify-code.php
```

SMTP sending was implemented in:

```text
private/bootstrap.php
```

It reads existing server mail config from the configured `smtp_config_path`.

Recent bug fixed:

```text
Symptom: after entering correct code, frontend showed "Request failed: 500".
Cause: find_or_create_user() called missing helper clean_text().
Fix: added clean_text() in private/bootstrap.php and uploaded it to production.
```

Important after the fix:

```text
Old code can be unusable because the failed request may have marked it used.
Ask user to request a fresh code and enter the new one.
```

## Local development

Run:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
php -S 127.0.0.1:18110 -t public
```

Open:

```text
http://127.0.0.1:18110/
```

In local mode, email login returns `dev_code` in JSON. In production it must not.

Basic local checks:

```bash
node --check public/assets/app.js
php -l private/bootstrap.php
find public/api -type f -maxdepth 4 -print | sort | xargs -r -n1 php -l
python3 -m json.tool public/manifest.webmanifest >/dev/null
```

## Useful production verification commands

When local DNS/router is stale, force the IP:

```bash
curl -sS --resolve game.brkovic.ltd:443:162.0.217.114 https://game.brkovic.ltd/
curl -sS --resolve game.brkovic.ltd:443:162.0.217.114 https://game.brkovic.ltd/api/auth/me.php
curl -sS --resolve game.brkovic.ltd:443:162.0.217.114 https://game.brkovic.ltd/api/games/registry.php
```

Request code:

```bash
curl -sS --resolve game.brkovic.ltd:443:162.0.217.114 \
  -H 'Content-Type: application/json' \
  -d '{"email":"USER_EMAIL"}' \
  https://game.brkovic.ltd/api/auth/request-code.php
```

Expected production response:

```json
{"ok":true,"message":"Code sent","expires_in_minutes":10}
```

Invalid verify check should return 401, not 500:

```bash
curl -sS --resolve game.brkovic.ltd:443:162.0.217.114 \
  -H 'Content-Type: application/json' \
  -d '{"email":"USER_EMAIL","code":"000000"}' \
  https://game.brkovic.ltd/api/auth/verify-code.php
```

Expected:

```json
{"ok":false,"error":"Code is invalid or expired"}
```

## FTP deployment notes

Existing helper scripts:

```text
/home/alexey/.local/bin/brkovic-ftp-ls
/home/alexey/.local/bin/brkovic-ftp-fetch
```

Manual upload pattern:

```bash
curl --netrc --ftp-pasv --ftp-create-dirs \
  -T local/file.php \
  'ftp://162.0.217.114/game.brkovic.ltd/path/on/server/file.php'
```

Common deploy paths:

```text
public/index.html -> game.brkovic.ltd/public/index.html
public/assets/app.css -> game.brkovic.ltd/public/assets/app.css
public/assets/app.js -> game.brkovic.ltd/public/assets/app.js
public/service-worker.js -> game.brkovic.ltd/public/service-worker.js
public/manifest.webmanifest -> game.brkovic.ltd/public/manifest.webmanifest
private/bootstrap.php -> game.brkovic.ltd/private/bootstrap.php
content/game-registry.json -> game.brkovic.ltd/content/game-registry.json
content/captain-ether/starter.json -> game.brkovic.ltd/content/captain-ether/starter.json
```

## Main-site integration

Main site repo:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Nav Desk file updated locally and live:

```text
brkovic-ltd/navdesk.html
```

Card now links to:

```text
https://game.brkovic.ltd
```

The main site should not import game JS or game state.

## Current known caveats

- User browser may cache old service worker. If old UI appears, hard refresh or clear site data for `game.brkovic.ltd`.
- Local router DNS may lag even when public DNS resolves. Public DNS has resolved `game.brkovic.ltd -> 162.0.217.114`.
- `www.game.brkovic.ltd` is not configured. Use only `game.brkovic.ltd`.
- JSON file storage is fine for MVP, not for heavy concurrent production usage.
- Admin is placeholder only.
- No automated browser E2E tests yet.
- Content seed is small. Full concept pack from Drive still needs staged import.

## Next steps

Immediate:

1. Ask user to request a fresh email code and verify login in Chrome.
2. Confirm `/api/auth/verify-code.php` returns 200 with a real code and creates session.
3. Start first watch from browser.
4. Submit a correct answer, use hint once, skip once, finish watch.
5. Open Lost Oars / Hangar and resolve at least one weak item.
6. Check files created in server `storage`: `users.json`, `sessions.json`, `progress.json`, `weak_points.json`, `watch_sessions.json`.

Short-term product work:

1. Add a progress screen for player history and weak topics.
2. Add better answer matching and phrase alternatives.
3. Import more content from the Drive concept pack.
4. Add grammar/radio construction exercises.
5. Build admin users/groups/crews shell.
6. Add competition/leaderboard model.
7. Add server-side error logging endpoint or structured PHP error log review workflow.
8. Add backup/export for JSON storage.

Ecosystem work:

1. Build registration/login on `brkovic.ltd`.
2. Store primary users there.
3. Add signed SSO token issue endpoint on `brkovic.ltd`.
4. Set a strong shared secret outside Git on both apps.
5. Enable `ecosystem_sso_enabled` in game config.
6. Keep email-code login as fallback until SSO is stable.

Technical migration later:

1. Move JSON storage to MySQL.
2. Add migrations/schema.
3. Add rate-limit persistence by IP/email with expiry.
4. Add Playwright smoke tests for login and watch loop.
5. Add deploy checklist and rollback notes.

## Current status summary

The product is live as a standalone MVP on:

```text
https://game.brkovic.ltd/
```

Server, DNS, SSL, UI, registry, code email request and basic API shell are in place. The latest server-side login bug was fixed in `private/bootstrap.php`. The next chat should start by asking the user to generate a fresh login code and complete a full browser E2E test.
