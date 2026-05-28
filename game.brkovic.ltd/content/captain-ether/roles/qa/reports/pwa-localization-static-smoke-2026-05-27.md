# PWA Localization Static Smoke

Дата: 2026-05-27  
Роль: QA / Captain Ether  
Режим: report-only, локальная статическая проверка

## Статус

PASS FOR STATIC SMOKE / NEEDS BROWSER QA

Структурная проверка локализации PWA проходит. Поддерживаемые локали,
покрытие UI-ключей, карточки игр и системное определение языка проверены
локальным Node smoke без запуска production/deploy.

## Проверенные языки

Поддерживаемый набор:

- `en`
- `ru`
- `de`
- `it`
- `es`
- `sr`
- `zh`

Проверенная detection-матрица:

| System language | Expected runtime locale | Expected `document.lang` |
| --- | --- | --- |
| `en-US` | `en` | `en` |
| `en-GB` | `en` | `en` |
| `ru-RU` | `ru` | `ru` |
| `de-DE` | `de` | `de` |
| `it-IT` | `it` | `it` |
| `es-ES` | `es` | `es` |
| `es-MX` | `es` | `es` |
| `sr-Latn-RS` | `sr` | `sr-Latn` |
| `sr-RS` | `sr` | `sr-Latn` |
| `hr-HR` | `sr` | `sr-Latn` |
| `me-ME` | `sr` | `sr-Latn` |
| `zh-CN` | `zh` | `zh` |
| `zh-TW` | `zh` | `zh` |
| `fr-FR` | `en` | `en` |
| empty language API | `en` | `en` |

## Проверки

PASS:

- `node --check public/assets/app.js`
- `node --check public/service-worker.js`
- `node --check content/captain-ether/tools/check-pwa-i18n.mjs`
- `node content/captain-ether/tools/check-pwa-i18n.mjs`
- manifest JSON parse

Последний результат:

```text
PWA i18n ok: 7 locales, 144 UI keys, 4 games, 15 detection cases.
manifest ok
```

## Что покрыто

- Все 7 runtime-локалей существуют.
- Все 144 базовых UI-ключа присутствуют во всех runtime-локалях.
- Все 4 game cards имеют обязательные локализованные поля.
- Unsupported system language стартует в English.
- `srb/mne/hr` route покрыт через общий `sr-Latn` UI.
- `zh` route покрыт как общий Mandarin/Simplified-style MVP.
- English остается root fallback.

## Что не покрыто

- Browser visual QA не запускался.
- Mobile text-length QA не запускался.
- Реальный auth/API flow не запускался, потому что PHP недоступен локально.
- Production/deploy checks не запускались и не разрешены этим smoke.

## Локализационный риск

PASS для интерфейсного слоя. Но Captain Ether training content пока остается
RU source prompt -> English Sea Speak answer. Это отдельный curriculum/content
вопрос, не блокер UI localization smoke.

## Handoff For Director Ether

Static localization gate проходит. Следующий шаг: browser/mobile QA по
локалям `en`, `ru`, `de`, `it`, `es`, `sr/hr/me`, `zh` и unsupported `fr-FR`.
После browser QA можно двигать следующий продуктовый поток: native-source
обучение для англичан и других языков.
