# PWA Localization Visible Fallback Fix

Дата: 2026-05-27  
Роль: Localization implementation worker / Captain Ether  
Режим: edits allowed в узком scope

## Статус

DONE / READY FOR QA BROWSER RERUN

Закрыт visible English fallback, который QA browser smoke нашел на home/game-card
уровне для `it`, `es`, `sr`.

## Изменено

Файл:

- `public/assets/app.js`

В `LOCALE_OVERRIDES.it`, `LOCALE_OVERRIDES.es`, `LOCALE_OVERRIDES.sr`
добавлены явные переводы видимых UI-ключей home/game-card:

- `status.soon`
- `action.prototypeCard`
- `action.projectCard`
- `home.eyebrow`
- `home.platform`
- `home.active`
- `home.planned`
- `home.watches`
- `home.oars`
- `home.management`
- `home.managementCopy`
- `disclaimer.eyebrow`

English root fallback сохранен. Sea Speak content и `GAME_COPY` / registry data
не изменялись.

## Закрытые fallback из QA smoke

Для `it-IT`, `es-ES`, `hr-HR -> sr-Latn` больше не должны появляться как
fallback-лейблы:

- `PLATFORM`
- `Available`
- `In work`
- `Watches`
- `Oars`
- `Prototype card`

Также закрыты соседние видимые home labels, чтобы первый слой home не зависел
от English fallback для указанных локалей.

## Проверки

Выполнено:

```sh
node --check public/assets/app.js
```

PASS.

```sh
node content/captain-ether/tools/check-pwa-i18n.mjs
```

PASS: `PWA i18n ok: 7 locales, 144 UI keys, 4 games, 15 detection cases.`

## Scope

Не изменялось:

- runtime/API;
- matcher;
- starter/batches/answer dictionaries;
- router/registry data;
- auth/platform;
- Watch Officer;
- Nav Desk;
- production config/deploy/FTP;
- secrets/cookies/sessions/CSRF/player email/identity.

## Осталось

Нужен QA browser smoke rerun для home/login на `it-IT`, `es-ES`,
`hr-HR -> sr-Latn`, чтобы подтвердить отсутствие видимых English fallback в DOM
и отсутствие mobile overflow после новых переводов.
