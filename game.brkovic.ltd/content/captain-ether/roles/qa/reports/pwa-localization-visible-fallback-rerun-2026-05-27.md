# PWA Localization Visible Fallback Rerun

Дата: 2026-05-27  
Роль: QA / Captain Ether  
Режим: локальный rerun, report-only

## Статус

PASS FOR STATIC / NEEDS FULL BROWSER QA LATER

После фикса visible English fallback для `it`, `es`, `sr` структурная i18n
проверка проходит. Ранее найденные home/game-card fallback-ключи закрыты в
`public/assets/app.js`.

## Проверки

PASS:

- `node --check public/assets/app.js`
- `node --check public/service-worker.js`
- `node --check content/captain-ether/tools/check-pwa-i18n.mjs`
- `node content/captain-ether/tools/check-pwa-i18n.mjs`
- manifest JSON parse

Результат:

```text
PWA i18n ok: 7 locales, 144 UI keys, 4 games, 15 detection cases.
manifest ok
```

## Rerun Notes

Локальный CDP rerun был выполнен для:

- `it-IT`
- `es-ES`
- `hr-HR`

`it-IT` и `es-ES` прошли без найденных прежних English fallback-лейблов.

Для `hr-HR` автоматическая проверка по строке `PLATFORM` дала ложное
срабатывание, потому что локализованное `Platforma` при CSS uppercase
отображается как `PLATFORMA` и содержит подстроку `PLATFORM`. Это не English
fallback. В `public/assets/app.js` для `sr` задан явный перевод:

```text
home.platform = Platforma
```

## Остаточные риски

- Это не заменяет полноценный screenshot/browser QA по всем локалям после
  следующей серии UI-изменений.
- PHP/auth/API flow не проверялся, потому что PHP недоступен локально.
- Production/deploy checks не выполнялись.

## Handoff For Director Ether

Visible fallback defect from previous browser smoke is treated as resolved for
the touched home/game-card labels. Next localization QA should run after the
next UI/content change batch or before production deploy.
