# English-Native Stream Localization Policy

Дата: 2026-05-27
Роль: Localization Architect / Captain Ether
Режим: report-only decision prep

## Статус

NEEDS DIRECTOR DECISION

Локализационный слой PWA уже имеет детерминированный UI locale fallback, но
появление English-native learner stream нельзя принимать через автоматическую
привязку к языку интерфейса. Нужна отдельная продуктовая политика выбора
learner stream: RU-source и English-native являются учебными потоками, а не
вариантами UI.

Input gap: два файла из задания не найдены в рабочем дереве и выше по
`/home/alexey/GitHub/Revoyacht/brkovic-ltd`:

- `content/captain-ether/roles/director-engineer/reports/english-native-learning-stream-intake-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/english-native-batch-006-pilot-director-intake-2026-05-27.md`

Из-за отсутствия этих intake-отчетов этот report не подтверждает содержание
English-native stream. Вывод ниже ограничен localization policy и stream
selection contract.

## Текущее Поведение UI Locale

Текущий `public/assets/app.js` поддерживает UI locales:

```text
en, ru, de, it, es, sr, zh
```

Runtime behavior:

- `SUPPORTED_LOCALES = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh']`.
- Locale определяется по `navigator.languages`, затем `navigator.language`.
- `normalizeLocale()` мапит:
  - `zh* -> zh`;
  - `sr*`, `hr*`, `bs*`, `me* -> sr`;
  - `en* -> en`;
  - `ru* -> ru`;
  - `de* -> de`;
  - `it* -> it`;
  - `es* -> es`.
- Если ни один системный язык не поддержан, `detectLocale()` возвращает `en`.
- `document.documentElement.lang` выставляется из i18n-ключа `locale`;
  для `sr` сохраняется `sr-Latn`.
- Видимая напоминалка говорит, что язык интерфейса следует системным
  настройкам, а неподдержанные языки стартуют на English.
- UI-строки идут через `I18N`; English является root fallback.
- Карточки игр идут через `GAME_COPY[locale]`, затем `GAME_COPY.en`, затем
  registry fields `field_locale`, `field_en`, `field_ru`.
- Старт Captain Ether сейчас передает в API только `level`:
  `body: JSON.stringify({ level })`. Learner stream в UI не выбирается.

## Почему UI Locale Не Должен Выбирать Learner Stream

UI locale отвечает за интерфейсные строки, доступность, форматирование и
fallback. Learner stream отвечает за язык исходного prompt, curriculum scope,
meaning gates, hints, accepted/rejected answer semantics и progress records.
Это разные оси продукта.

Автоматическая привязка опасна по следующим причинам:

- Английский интерфейс может использовать не English-native learner: например
  пользователь с английской ОС может быть русскоязычным учеником или QA.
- Русский интерфейс не всегда означает, что нужен RU-source stream: пользователь
  может хотеть English-native stream для повторения SMCP/Sea Speak без перевода
  с русского.
- Unsupported system language fallback в `en` не означает English-native
  learning. Например `fr-FR -> en` должен получить English UI, но не должен
  молча попасть в English-native curriculum.
- Shared `sr/hr/me/bs -> sr` является UI-компромиссом для балканской латиницы,
  а не учебным источником Serbian/Croatian/Montenegrin.
- `zh -> zh` пока Mandarin UI, не Mandarin-source Captain Ether content.
- Sea Speak target остается контролируемым английским; source prompt language
  должен проходить Curriculum Architect и Sea Speak Linguist, а не UI i18n.
- Автоматический выбор stream по locale смешает аналитику, прогресс, Lost Oars,
  answer logs и QA triage между разными учебными задачами.

## Рекомендуемый Default Для Unsupported System Language

UI policy:

- Неподдержанный системный язык всегда стартует в `en`.
- Missing UI key внутри поддержанной локали падает в `I18N.en`, не в `ru`.
- Missing registry localized field падает в English field / English game copy,
  затем только при отсутствии English - в `*_ru`.
- UI reminder должен остаться видимым на home/login/level surfaces.

Learner stream policy:

- Unsupported system language `-> en` не выбирает English-native stream.
- Если stream еще не выбран, продукт должен использовать отдельный stream
  default: enrollment, route, explicit selector или Director-approved legacy
  default.
- Если Director требует временный default без selector, рекомендованный
  безопасный fallback: сохранять текущий legacy RU-source stream на существующем
  Captain Ether route и запускать English-native только через отдельный
  explicit route/flag/selector. Это не ломает существующих учеников.

## Рекомендуемая Политика Stream Selection

Нужны две независимые настройки:

- `ui_locale`: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- `learner_stream`: минимум `ru_source` и `english_native`.

Рекомендованная модель:

1. UI locale определяется автоматически по системе и не пишет stream.
2. На первом входе в Captain Ether при отсутствии выбранного stream показывать
   явный выбор учебного потока.
3. После выбора сохранять stream в progress/profile storage отдельно от locale.
4. Existing users с прогрессом текущего RU-source потока продолжают RU-source,
   пока сами не выберут English-native.
5. English-native pilot можно открыть через явный dedicated entry point,
   campaign flag или selector option, но не через `locale === 'en'`.
6. Answer logs, Lost Oars, watch summaries и future scoring должны хранить
   stream id, чтобы QA не смешивал RU-source errors с English-native errors.
7. Если Director не готов к selector, оставить существующий Captain Ether route
   как RU-source legacy default и открыть English-native только отдельным
   Director-approved task/route/parameter.

Decision needed:

- Будет ли первый публичный English-native доступ через selector, dedicated
  route, feature flag или отдельную admin/pilot настройку?
- Что является default для нового игрока без progress: explicit selection
  screen или legacy RU-source на текущем route?
- Нужно ли хранить stream per user глобально, per watch, или per Captain Ether
  progress record? Рекомендация: per watch plus last-selected stream in profile.

## Localization QA Cases Для Будущей Реализации

Общие cases:

- `en-US`: English UI, stream не auto-selected; first-run selector или Director
  default видим и понятен.
- `ru-RU`: Russian UI, legacy RU-source не ломается; English-native доступен
  только явным выбором.
- `de-DE`, `it-IT`, `es-ES`: локальный UI, learner stream остается отдельным
  выбором; нет смешения с German/Italian/Spanish source content.
- `hr-HR`, `sr-Latn-RS`, `me-ME`, `bs-BA`: UI normalizes to `sr`; stream не
  становится Balkan-source.
- `zh-CN`, `zh-SG`, `zh-TW`: UI normalizes to `zh`; stream не становится
  Mandarin-source; script/fallback behavior фиксируется отдельно.
- `fr-FR`: UI starts in English; stream не выбирается как English-native.
- Empty/blocked `navigator.languages`: UI starts in English; stream default
  follows product policy, not locale.

Flow cases:

- First login without prior progress: selector/default behavior deterministic.
- Existing user with RU-source progress: still lands in RU-source after UI
  locale changes.
- Existing user who selects English-native: next session restores
  English-native even on Russian UI.
- Switching UI system language does not switch learner stream.
- Starting a watch sends stream id only after Director-approved UI/API contract.
- Watch prompt, hint, result, Lost Oars, summary and answer-log records display
  or retain stream identity for QA.
- Mobile smoke checks confirm long stream labels fit in `en`, `ru`, `de`, `it`,
  `es`, `sr`, `zh`.

## Риски

English UI:

- Риск: `en` locale может быть ошибочно принят за English-native learner.
- Mitigation: selector/default policy must explicitly say "Interface language"
  vs "Practice stream".

Russian UI:

- Риск: текущий RU-source поток выглядит как единственный продуктовый режим,
  и English-native может быть скрыт для русскоязычного игрока.
- Mitigation: если English-native публичен, он должен быть доступен через
  явный stream selector независимо от UI.

Serbian/Croatian/Montenegrin mapping:

- Риск: `sr/hr/bs/me -> sr` является общим Latin UI, но может быть неверно
  воспринят как source-language promise.
- Mitigation: не создавать Balkan-source expectation без отдельного curriculum
  stream; label should say UI language only.

Mandarin `zh`:

- Риск: общий `zh` сейчас UI-level Mandarin/Simplified-style baseline; это не
  Mandarin-source training и не Traditional Chinese policy.
- Mitigation: keep learner stream separate; decide `zh-Hant` later if needed.

Fallback `en`:

- Риск: unsupported locale fallback to English could silently enroll users into
  English-native stream and corrupt product analytics.
- Mitigation: unsupported UI fallback must leave learner stream unset or use
  Director-approved product default unrelated to locale.

## Проверки

Выполнено:

- Прочитаны role protocol, office rules, Localization Architect rules/handoff,
  current Captain Ether handoff, existing localization implementation reports.
- Проверен `public/assets/app.js` locale detection, UI fallback, game copy
  fallback и Captain Ether watch start payload.
- Проверено отсутствие указанных English-native Director Engineer intake
  reports через `find` по `content/captain-ether` и
  `/home/alexey/GitHub/Revoyacht/brkovic-ltd`.

Не выполнялось:

- Runtime/API/UI edits.
- Browser QA.
- API smoke.
- Проверка содержания English-native stream, потому что intake reports
  отсутствуют.

## Scope

Report-only. Не изменялись:

- runtime/API/UI;
- starter.json, batches, matcher;
- router, registry, auth/platform;
- Watch Officer, Nav Desk;
- production config, deploy/FTP;
- secrets, cookies, sessions, CSRF, player email, player identity.

## Handoff For Director Ether

NEEDS DIRECTOR DECISION: English-native stream нельзя подключать через
`locale === 'en'`. UI locale уже поддерживает `en`, `ru`, `de`, `it`, `es`,
`sr`, `zh` и fallback `en`, но learner stream должен быть отдельной осью:
`ru_source` vs `english_native`.

Рекомендация: существующий Captain Ether route сохранить как legacy RU-source
до отдельного решения; English-native открыть через явный stream selector,
dedicated pilot route или feature flag. При первой публичной реализации хранить
stream id отдельно от UI locale и писать stream id в watch/progress/log context,
чтобы QA, Lost Oars и будущий scoring не смешивали разные учебные потоки.

Changed files in this role task:

- `content/captain-ether/roles/localization-architect/reports/english-native-stream-localization-policy-2026-05-27.md`
