# PWA Localization Implementation

Дата: 2026-05-27  
Роль: Director-Engineer  
Режим: локальная реализация, без deploy/production checks

## Статус

PASS FOR LOCAL STATIC CHECKS / NEEDS BROWSER QA

Первый слой локализации PWA реализован локально. Интерфейс теперь определяет
язык по `navigator.languages` / `navigator.language`, нормализует его в
поддерживаемый набор и при неподдержанном системном языке стартует с English.

Дополнительно локализация закреплена как постоянный gate для следующих задач:
каждый UI/content/API ход должен указывать локализационный эффект или `N/A`.

## Поддерживаемые языковые группы

Всего: 7.

| Продуктовый ярлык | Runtime key | Алиасы |
| --- | --- | --- |
| `eng` | `en` | `en`, `en-*` |
| `ru` | `ru` | `ru`, `ru-*` |
| `de` | `de` | `de`, `de-*` |
| `it` | `it` | `it`, `it-*` |
| `esp` | `es` | `es`, `es-*` |
| `srb/mne/hr` | `sr` | `sr`, `sr-*`, `hr`, `hr-*`, `bs`, `bs-*`, `me`, `me-*` |
| `mandarin zh` | `zh` | `zh`, `zh-*` |

Fallback: `en`.

## Что изменено

- `public/assets/app.js`
  - добавлен словарь UI `I18N`;
  - добавлена карта локализованных карточек игр `GAME_COPY`;
  - добавлен `detectLocale()` с fallback на `en`;
  - выставляется `document.documentElement.lang`;
  - локализованы основные зоны PWA: профиль, home/hub, game cards, login,
    level select, watch HUD, result, summary, Lost Oars, answer-log admin UI,
    route-not-found и disclaimer;
  - добавлена компактная напоминалка, что язык интерфейса следует системным
    настройкам, а неподдержанные языки стартуют на English.
- `content/captain-ether/tools/check-pwa-i18n.mjs`
  - добавлена локальная структурная проверка i18n: поддерживаемые локали,
    покрытие UI-ключей и карточек игр.
- `public/assets/app.css`
  - добавлен стиль `.language-reminder` и мобильная адаптация.
- `public/index.html`
  - HTML baseline переведен на `lang="en"`;
  - meta description переведен на English baseline;
  - старый русский login template удален, login теперь рендерится из JS
    локализованно.
- `public/manifest.webmanifest`
  - description переведен на English baseline.
- `public/service-worker.js`
  - cache bump: `brkovic-games-shell-v7`.
- `content/captain-ether/roles/localization-architect/`
  - создана новая должность локализации с правилами, handoff, tasks/reports.
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/role-command-protocol.md`
  - офис обновлен: добавлен `localization-architect`;
  - добавлен обязательный Localization Gate для дальнейших задач.

## Проверки

PASS:

- `node --check public/assets/app.js`
- `node --check public/service-worker.js`
- `node --check content/captain-ether/tools/check-pwa-i18n.mjs`
- `node content/captain-ether/tools/check-pwa-i18n.mjs`
- `node -e "JSON.parse(require('fs').readFileSync('public/manifest.webmanifest','utf8'))"`

Последний результат i18n-check:

```text
PWA i18n ok: 7 locales, 144 UI keys, 4 games, 15 detection cases.
```

Not run:

- PHP/API checks: `php` недоступен в локальном окружении.
- Browser/mobile visual QA: не запускался в этом проходе.
- Production/deploy checks: запрещены без отдельной задачи.

## Остаточные риски

- Переводы `de/it/es/sr/zh` для части редких admin/QA строк используют English
  fallback, если ключ не переопределен. Это допустимо для первого слоя, но QA
  должен пройти smoke по всем локалям.
- Captain Ether training content остается RU source prompt -> English Sea Speak
  answer. Это не баг UI-локализации, но для англичан и других языков нужен
  отдельный Curriculum Architect + Sea Speak Linguist workstream по исходным
  prompts, если продукт хочет не только UI, но и обучение из родного языка.
- Mandarin сейчас реализован как общий `zh` / Simplified-style UI. Traditional
  Chinese нужно решать отдельным продуктовым решением, если потребуется.
- Shared `srb/mne/hr` реализован латиницей через `sr`; это MVP-решение для
  единого балканского UI.

## Handoff For Director Ether

PWA теперь имеет 7 языковых групп интерфейса и English fallback по системному
языку. Следующий gate: QA browser smoke по `en`, `ru`, `de`, `it`, `es`,
`sr/hr/me`, `zh`, плюс unsupported locale вроде `fr-FR -> en`.

Отдельно рекомендую открыть следующий продуктовый поток: native-source learning
для англичан и других языков. Сейчас UI локализован, но сами учебные prompts
Captain Ether остаются русскими с ответом на English Sea Speak.
