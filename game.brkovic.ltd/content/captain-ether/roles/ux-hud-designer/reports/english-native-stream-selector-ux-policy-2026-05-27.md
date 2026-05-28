# UX/HUD Report: English-Native Stream Selector Policy

Дата: 2026-05-27
Роль: UX/HUD Designer / Captain Ether
Режим: report-only UX policy

## Статус

PASS

UX policy готова для Director Ether. UI-код, runtime/API, контент, matcher,
router/registry, auth/platform, Watch Officer, Nav Desk, production config,
deploy/FTP и приватные данные не изменялись.

## Контекст

Director Engineer уже принял базовое решение:

- текущий Captain Ether route остается legacy `ru_source` default;
- English-native не включается автоматически через `locale === 'en'`;
- unsupported system language дает только English UI fallback, не
  English-native stream;
- English-native pilot остается internal-only / hidden QA до отдельного
  release решения;
- future selector/defaulting work должно быть назначено отдельно.

Localization Architect подтвердил главный UX contract: `ui_locale` и
`learner_stream` являются независимыми осями продукта.

Текущий `public/assets/app.js` соответствует этой границе: UI locale
детектируется из системы, поддерживает `en`, `ru`, `de`, `it`, `es`, `sr`,
`zh`, а старт Captain Ether watch сейчас отправляет только `level`, без
`learner_stream`.

## Recommended First Selector UX

Рекомендация: оставить legacy RU-source default как первый безопасный UX,
а English-native pilot показывать только как явный opt-in.

Не рекомендуется делать mandatory selector для всех существующих игроков на
первом шаге. Это создаст лишнее трение в уже работающем коротком flow:
login -> level select -> watch. Для текущих пользователей с RU-source
progress правильнее сохранить привычный вход и добавить видимый, но
неавтоматический выбор потока только после Director-approved implementation
task.

Первый selector UX:

- existing user с RU-source progress: открывается прежний RU-source level
  select;
- new user без stream selection: по Director decision либо legacy RU-source
  preselected, либо компактный first-run chooser; UX recommendation для
  ближайшей реализации - legacy preselected;
- English-native pilot: отдельная explicit option/card/control, помеченная как
  pilot/internal until release;
- `locale === 'en'` не выбирает pilot;
- смена языка системы или UI не меняет stream;
- выбранный stream должен быть заметен на level select и watch summary, но не
  должен перегружать watch HUD.

Минимальная визуальная модель будущей реализации: компактный блок "Practice
stream" над level cards. Внутри две равноправные options, но legacy RU-source
выбран по умолчанию до отдельного Director release decision. English-native
option не должна выглядеть как язык интерфейса.

## Copy Model Labels

Это concept-level copy model, не финальная таблица переводов. Финальные строки
должны пройти i18n review и длину на mobile.

Canonical English fallback:

- selector label: `Practice stream`
- legacy option: `Russian prompts to Sea Speak`
- pilot option: `English prompts to Sea Speak`
- pilot badge: `Pilot`
- helper: `Interface language does not change the practice stream.`
- switch warning: `Your current progress stays with its stream.`

RU concept:

- label meaning: `Учебный поток`
- legacy option meaning: `Русские подсказки -> Sea Speak`
- pilot option meaning: `Английские подсказки -> Sea Speak`
- helper meaning: `Язык интерфейса не меняет учебный поток.`

DE concept:

- use a short equivalent of "practice stream";
- legacy option should mean "Russian prompts to Sea Speak";
- pilot option should mean "English prompts to Sea Speak";
- keep `Sea Speak` and `Pilot` unchanged if translation creates length or
  meaning risk.

IT concept:

- use a short equivalent of "practice stream";
- do not translate `Sea Speak`;
- avoid wording that sounds like selecting Italian-source training.

ES concept:

- use a short equivalent of "practice stream";
- distinguish "interface language" from "practice stream";
- avoid "English language" wording that could imply UI locale selection.

SR concept:

- use Latin-script Serbian UI style already used by the app;
- do not imply Serbian/Croatian/Montenegrin source-language content;
- keep stream labels short because Balkan UI strings can expand.

ZH concept:

- label should mean "practice/training stream", not "language";
- do not imply Mandarin-source Captain Ether content;
- keep `Sea Speak` as a product/target term unless Localization Architect
  decides otherwise.

## Mobile Risks And Long-Text Constraints

Main mobile risk: selector text competes with the already compact Captain Ether
level select and short-watch positioning. The selector must not push the first
level action below the initial mobile viewport more than necessary.

Constraints for implementation:

- use two short option titles plus one concise helper line;
- avoid paragraph-length descriptions inside option cards;
- keep option controls stable in height across locales;
- allow labels to wrap to two lines without horizontal overflow;
- avoid all-caps labels for translated strings;
- do not place stream selector inside the watch question card;
- on watch screen, show at most a small stream chip if Director wants stream
  visibility there;
- long German, Russian, Serbian and Spanish strings need explicit mobile smoke;
- Chinese labels may be visually compact but must still distinguish UI locale
  from learner stream.

## State Model

Required product model:

```text
ui_locale: en | ru | de | it | es | sr | zh
learner_stream: ru_source | english_native
```

UX rule: `ui_locale` changes interface copy only. `learner_stream` chooses
source prompt, hints, progress scope, Lost Oars scope, answer-log grouping and
future scoring context.

Recommended state behavior:

- store last-selected `learner_stream` separately from UI locale;
- preserve existing RU-source progress as `ru_source`;
- attach stream id to new watch records once API contract exists;
- attach stream id to Lost Oars and answer-log records before public pilot;
- do not infer stream from `navigator.language`, `document.lang`, registry
  localization fields or UI copy.

## Privacy, Session And Progress Risks

Risks:

- mixing English-native and RU-source attempts in the same progress record
  corrupts learning history;
- answer logs without stream id make QA triage ambiguous;
- Lost Oars without stream id may show a prompt from the wrong source stream;
- shared-session devices can expose previous stream preference to the next user
  if stream is stored outside authenticated progress/profile state;
- player email, identity, session, CSRF and cookies must not be shown in stream
  selector copy, logs or reports;
- local/dev code messages must remain auth-only and unrelated to selector UX.

UX requirements:

- stream switching must be explicit and reversible;
- switching stream must not delete or overwrite existing progress;
- warning copy should say progress stays with its stream, not expose internal
  storage details;
- no player identity or email should be shown in selector UI on mobile watch
  surfaces.

## Future UI Implementation Must Test

Locale and selector behavior:

- `en-US`: English UI, legacy RU-source remains default unless user explicitly
  selects English-native;
- `ru-RU`: Russian UI, existing RU-source flow unchanged;
- `de-DE`, `it-IT`, `es-ES`: localized UI, no German/Italian/Spanish learner
  stream implied;
- `hr-HR`, `sr-Latn-RS`, `me-ME`, `bs-BA`: UI maps to `sr`, stream remains
  separate;
- `zh-CN`, `zh-SG`, `zh-TW`: UI maps to `zh`, no Mandarin-source stream
  implied;
- `fr-FR` or blocked `navigator.languages`: English UI fallback, no automatic
  English-native enrollment.

Flow behavior:

- existing RU-source user opens Captain Ether and reaches level select without
  forced stream interruption;
- first-run selector/default is deterministic after Director decision;
- selected English-native stream survives reload and next session;
- changing OS/browser language does not change selected stream;
- starting watch sends stream id only through Director-approved API contract;
- summary, Lost Oars and answer-log views do not mix streams.

Mobile and layout:

- no horizontal overflow at common mobile widths;
- stream option labels wrap cleanly in all supported UI locales;
- first level start action remains reachable without excessive scroll;
- watch HUD remains focused on prompt, answer field and calm feedback;
- stream badge/chip, if present, does not crowd progress or question text.

Privacy/session:

- no email, CSRF, cookies, session ids or player identity appear in selector
  markup, logs, reports or screenshots;
- shared-device logout/login does not reuse another user's stream state;
- answer logs retain stream context without exposing identity.

## Scope And Checks

Checked:

- role protocol, role README, UX/HUD rules and handoff;
- office manifest and current Captain Ether handoff;
- Director Engineer English-native Batch 006 decisions;
- Localization Architect English-native stream policy;
- `public/assets/app.js` locale detection, i18n fallback, level select and
  watch start payload.

Not performed:

- UI/runtime/API edits;
- browser QA;
- API smoke;
- production deploy;
- translation finalization.

## Copy-Ready Handoff For Director Ether

PASS: UX/HUD recommends the first learner stream selector preserve the current
Captain Ether route as legacy `ru_source` default and expose
`english_native` only through explicit opt-in pilot UI after a separate
implementation task. Do not select English-native from `locale === 'en'`.

Future implementation should model `ui_locale` and `learner_stream` as separate
state, keep existing RU-source progress untouched, attach stream id to watch /
progress / Lost Oars / answer-log context before public pilot, and mobile-smoke
all selector labels in `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.

Changed files in this role task:

- `content/captain-ether/roles/ux-hud-designer/reports/english-native-stream-selector-ux-policy-2026-05-27.md`
