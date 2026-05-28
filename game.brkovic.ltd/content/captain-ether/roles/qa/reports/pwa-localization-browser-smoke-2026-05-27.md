# PWA Localization Browser Smoke

Дата: 2026-05-27  
Роль: QA / Captain Ether  
Режим: report-only, локальный browser/mobile smoke с моками API

## Статус

PASS FOR REQUESTED BROWSER SMOKE / NEEDS DIRECTOR DECISION FOR VISIBLE ENGLISH FALLBACK

Запрошенный browser smoke для `home` и unauthenticated `login` прошел:
рендер есть, `document.documentElement.lang` выставляется ожидаемо, language
reminder присутствует, на `en/de/it/es/hr/zh/fr` не найдено русских UI-строк,
мобильный viewport `390x844` не дал горизонтального overflow.

Отдельный продуктовый риск: в `it`, `es`, `hr` на home видны отдельные English
fallback UI-лейблы (`PLATFORM`, `Available`, `In work`, `Watches`, `Oars`,
`Prototype card`). Это не нарушает заданную проверку на отсутствие русских
строк, но требует решения Director-Engineer / Localization Architect: допустим
ли English fallback на первом слое или нужно закрыть эти видимые ключи до gate.

## Подход и команды

PHP локально недоступен, поэтому browser smoke выполнен через временный inline
Node static server, без записи временных скриптов в репозиторий.

Моки:

- `/api/auth/me.php` -> `{ ok: true, user: null, csrf: null }`
- `/api/games/registry.php` -> безопасный локальный registry из 4 карточек
- `/api/captain-ether/progress.php` -> нулевой progress, фактически не нужен
  без user

Использованный браузер:

- `/home/alexey/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell`

Ключевые команды:

```sh
node <<'NODE'
# inline static server для public/ и безопасных API mocks
NODE
```

```sh
node <<'NODE'
# CDP smoke:
# - Page.addScriptToEvaluateOnNewDocument переопределяет navigator.language/languages
# - Emulation.setDeviceMetricsOverride задает desktop/mobile viewport
# - проверяются / и /games/captain-ether
NODE
```

Важно: пробный запуск через `--lang=en-US --dump-dom` был отброшен, потому что
headless shell в этом окружении все равно взял системную `ru` локаль. Для
достоверного smoke использован CDP override до загрузки PWA.

## Результаты по локалям

Desktop viewport: `1280x900`.  
Mobile viewport: `390x844`.

| System language | Expected UI | `document.lang` | Home | Login | Reminder | Russian UI leak outside ru | Mobile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `en-US` | `en` | `en` | PASS | PASS | PASS | PASS, не найдено | PASS |
| `ru-RU` | `ru` | `ru` | PASS | PASS | PASS | N/A, русский ожидаем | Not run |
| `de-DE` | `de` | `de` | PASS | PASS | PASS | PASS, не найдено | Not run |
| `it-IT` | `it` | `it` | PASS with English fallback risk | PASS | PASS | PASS, не найдено | Not run |
| `es-ES` | `es` | `es` | PASS with English fallback risk | PASS | PASS | PASS, не найдено | Not run |
| `hr-HR` | `sr` UI | `sr-Latn` | PASS with English fallback risk | PASS | PASS | PASS, не найдено | PASS |
| `zh-CN` | `zh` | `zh` | PASS | PASS | PASS | PASS, не найдено | PASS |
| `fr-FR` | fallback `en` | `en` | PASS | PASS | PASS | PASS, не найдено | PASS |

Проверенные login H1:

- `en-US`: `Captain Ether is waiting for watch`
- `ru-RU`: `Капитан — Эфир ждёт вахту`
- `de-DE`: `Captain Ether wartet auf die Wache`
- `it-IT`: `Captain Ether aspetta la guardia`
- `es-ES`: `Captain Ether espera la guardia`
- `hr-HR`: `Captain Ether čeka stražu`
- `zh-CN`: `Captain Ether 正在等待值班`
- `fr-FR`: `Captain Ether is waiting for watch`

Mobile overflow:

- `en-US`: `scrollWidth=390`, `clientWidth=390`
- `hr-HR`: `scrollWidth=390`, `clientWidth=390`
- `zh-CN`: `scrollWidth=390`, `clientWidth=390`
- `fr-FR`: `scrollWidth=390`, `clientWidth=390`

## PASS

- `home` рендерится для всех проверенных системных языков.
- `/games/captain-ether` без user рендерит локализованный login для всех
  проверенных системных языков.
- `document.documentElement.lang`:
  - `en-US -> en`
  - `ru-RU -> ru`
  - `de-DE -> de`
  - `it-IT -> it`
  - `es-ES -> es`
  - `hr-HR -> sr-Latn`
  - `zh-CN -> zh`
  - `fr-FR -> en`
- Language reminder присутствует на home и login.
- На `en/de/it/es/hr/zh/fr` в проверенном `#app` не найдено кириллических
  русских UI-строк.
- Unsupported `fr-FR` стартует на English fallback.
- Mobile smoke `390x844` для `en-US`, `hr-HR`, `zh-CN`, `fr-FR` не выявил
  горизонтального overflow.

## NEEDS DIRECTOR DECISION

Severity: Medium, localization completeness / product polish.

На `it-IT`, `es-ES`, `hr-HR` home частично использует English fallback в
видимых UI-лейблах. Примеры из browser smoke:

- `it-IT`: `PLATFORM`, `Available`, `In work`, `Watches`, `Oars`,
  `Prototype card`
- `es-ES`: `PLATFORM`, `Available`, `In work`, `Watches`, `Prototype card`
- `hr-HR`: `PLATFORM`, `Available`, `In work`, `Watches`, `Oars`,
  `Prototype card`

Owner route: Director-Engineer / Localization Architect. QA не меняет i18n
словарь. Решение нужно по критерию gate: оставить English fallback как MVP или
добавить явные переводы для видимых home/login ключей.

## FAIL

FAIL не найден в разрешенном scope.

## Не покрыто

- Реальный PHP/API/auth flow не проверялся: PHP недоступен локально, а задача
  запрещает auth/platform scope.
- Production/deploy не проверялись и не разрешены этой задачей.
- Watch runtime, matcher, starter, batches, answer dictionaries, registry data
  и router не проверялись и не изменялись.
- Визуальные screenshots не сохранялись, чтобы не плодить артефакты вне
  разрешенного report path; smoke снят через CDP DOM/viewport assertions.

## Риски

- CDP override проверяет поведение PWA при заданных `navigator.language` /
  `navigator.languages`, но не является полноценным системным e2e запуском ОС
  с разными языками.
- `home` содержит training/source references на английском в disclaimer list.
  Они не считались UI leak, потому что это source/reference content.
- Captain Ether учебный prompt content остается отдельным RU source -> English
  Sea Speak workstream; этот smoke покрывает UI shell/home/login.

## Следующий gate

Director-Engineer decision:

1. Accept current browser smoke as PASS for first-layer PWA localization.
2. Decide whether visible English fallback in `it/es/hr` blocks the localization
   gate or is acceptable for MVP.
3. If fallback is not acceptable, route i18n key completion to
   Director-Engineer / Localization Architect, then ask QA for rerun of this
   browser smoke.

Измененные файлы: только этот QA report.
