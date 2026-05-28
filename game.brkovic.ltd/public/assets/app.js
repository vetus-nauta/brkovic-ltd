const state = {
  user: null,
  csrf: null,
  registry: [],
  progress: null,
  watch: null,
  currentQuestion: null,
  usedHint: false,
  lastResult: null,
};

const SUPPORTED_LOCALES = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh'];

const I18N = {
  en: {
    'profile.login': 'Log in',
    'profile.logout': 'Log out',
    'status.active': 'Available',
    'status.prototype': 'Prototype / draft',
    'status.preproduction': 'In design',
    'status.planned': 'Planned',
    'status.soon': 'Soon',
    'action.open': 'Open',
    'action.prototypeCard': 'Prototype card',
    'action.projectCard': 'Project card',
    'action.details': 'Details',
    'language.eyebrow': 'Language',
    'language.reminder': 'Interface language follows your system settings. Unsupported languages start in English.',
    'home.eyebrow': 'Game hub',
    'home.copy': 'Choose a maritime trainer: radio exchange, watch decisions, and future sailing and vessel modules live in one game domain.',
    'home.openCaptain': 'Open Captain Ether',
    'home.lostOars': 'Revise phrases',
    'home.answerLog': 'Answer log',
    'home.platform': 'Platform',
    'home.active': 'Available',
    'home.planned': 'In work',
    'home.watches': 'Watches',
    'home.oars': 'Oars',
    'home.gamesTitle': 'Maritime games',
    'home.management': 'Management',
    'home.managementCopy': 'A shared base for users, groups, crews, competitions, and results. The game scenario stays separate.',
    'disclaimer.eyebrow': 'Disclaimer',
    'disclaimer.title': 'Training simulator, not navigation instruction',
    'disclaimer.copy1': 'Captain Ether is a game-based trainer for maritime English and radio exchange. It helps practise wording, but does not replace official documents, training, licensing, vessel procedures, master instructions, or flag-state requirements.',
    'disclaimer.copy2': 'Phrase, topic, and term structure is guided by:',
    'disclaimer.copy3': 'Content is adapted for training and yacht practice; before real radio exchange and navigation decisions, use current official publications and local rules for the sailing area.',
    'disclaimer.copy4': 'The account model is planned as one ecosystem: a future brkovic.ltd user should enter game.brkovic.ltd through shared signed login without a second registration. The email code here remains a temporary fallback login method until the shared account is launched.',
    'notFound.eyebrow': 'Route not found',
    'notFound.title': 'This game is not in the registry',
    'notFound.copy': 'Path {path} does not match entry_route in the game registry.',
    'nav.games': 'Game selection',
    'brief.watchOfficerCopy': 'Watch Officer is currently open as a staged prototype candidate: draft/non-final training content, not navigation instruction and not final training.',
    'brief.status': 'Status',
    'brief.route': 'Route',
    'brief.prototype': 'Prototype',
    'brief.openGame': 'Open game',
    'brief.launchPrototype': 'Open staged prototype',
    'level.beginner': 'Beginner',
    'level.intermediate': 'Intermediate',
    'level.advanced': 'Advanced',
    'type.word': 'Word',
    'type.short_expression': 'Short phrase',
    'type.phrase': 'Radio phrase',
    'lostReason.wrong': 'for revision',
    'lostReason.skip': 'skipped',
    'lostReason.hint': 'after hint',
    'auth.eyebrow': 'Login',
    'auth.title': 'Captain Ether is waiting for watch',
    'auth.copy': 'Log in by email to save watches, hints, and Lost Oars.',
    'auth.email': 'Email',
    'auth.getCode': 'Get code',
    'auth.codeLabel': '6-digit code',
    'auth.submit': 'Log in',
    'auth.requesting': 'Warming up the radio...',
    'auth.localCode': 'Local code: {code}',
    'auth.sent': 'Code sent by email.',
    'auth.verifying': 'Checking call sign...',
    'levels.eyebrow': 'Captain Ether',
    'levels.title': 'Choose a watch',
    'levels.copy': 'Short radio watches: no exam noise, from simple words to working phrases.',
    'levels.start': 'Start watch',
    'levelCopy.beginnerTitle': 'Short watch',
    'levelCopy.beginnerText': '12 calls: words, short phrases, and first replies on air.',
    'levelCopy.intermediateTitle': 'Working radio',
    'levelCopy.intermediateText': '16 calls: marina, course, speed, VTS, and clarifications.',
    'levelCopy.advancedTitle': 'Mixed watch',
    'levelCopy.advancedText': '20 calls: denser situations, quieter hints.',
    'status.loadingRadio': 'Warming up the radio...',
    'watch.eyebrow': 'Short watch',
    'watch.progressLabel': 'Watch progress {index} of {total}',
    'watch.finalCall': 'Final call',
    'watch.remaining': 'After this {count}',
    'watch.instruction': 'Translate into English Sea Speak',
    'watch.previous': 'Previous answer',
    'watch.answerLabel': 'Your answer',
    'watch.answer': 'Answer',
    'watch.hint': 'Hint',
    'watch.skip': 'Skip',
    'watch.noHint': 'No hints. The radio is honest.',
    'watch.hintLabel': 'Hint',
    'watch.side': 'Watch',
    'watch.level': 'Level',
    'watch.type': 'Type',
    'watch.topic': 'Topic',
    'watch.exitHub': 'Exit to hub',
    'result.standardAccepted': 'Accepted, here is the standard form',
    'result.standardForm': 'Standard form',
    'summary.eyebrow': 'Watch closed',
    'summary.title': 'Watch closed calmly',
    'summary.clean': 'Clean',
    'summary.hint': 'With hint',
    'summary.revision': 'To revise',
    'summary.score': 'Score',
    'summary.continue': 'Continue',
    'lost.title': 'Calm revision',
    'lost.hasItems': 'Not a penalty: fix a few phrases and return to watch.',
    'lost.empty': 'All calm: nothing to revise right now.',
    'lost.answerAria': 'Revision answer',
    'lost.check': 'Check',
    'lost.home': 'Hub',
    'lost.newWatch': 'New watch',
    'lost.review': 'Revision',
    'lost.hint': 'Hint',
    'empty.none': 'none',
    'log.wrong': 'wrong',
    'log.skip': 'skip',
    'log.hint': 'hint',
    'log.spelling': 'spelling',
    'log.variant': 'variant',
    'log.accepted_variant': 'accepted variant',
    'flag.possible_missing_variant': 'check variant',
    'flag.prompt_or_hint_friction': 'check hint',
    'flag.accepted_variant_review': 'to dictionary',
    'flag.common_spelling_review': 'common typo',
    'flag.repeated_pattern': 'repeats',
    'date.none': 'no date',
    'answerLog.adminRequired': 'Admin role required.',
    'answerLog.loading': 'Collecting answer log...',
    'answerLog.title': 'Answer log',
    'answerLog.stored': 'Stored',
    'answerLog.filtered': 'Filtered',
    'answerLog.groups': 'Groups',
    'answerLog.updated': 'Updated',
    'answerLog.kinds': 'Kinds',
    'answerLog.refresh': 'Refresh',
    'answerLog.back': 'To watches',
    'answerLog.noGroups': 'No disputed answers yet.',
    'answerLog.latest': 'Latest entries',
    'answerLog.rawTitle': 'Raw events without identity',
    'answerLog.time': 'Time',
    'answerLog.kind': 'Kind',
    'answerLog.answer': 'Answer',
    'answerLog.standard': 'Standard',
    'answerLog.records': '{count} records',
    'answerLog.noPrompt': 'No prompt',
    'answerLog.noAnswers': 'No answers.',
    'answerLog.empty': '[empty]',
    'answerLog.noEntries': 'No entries.',
    'locale': 'en-US',
  },
};

const GAME_COPY = {
  en: {
    captain_ether: {
      title: 'Captain Ether',
      description: 'Maritime radio exchange training game.',
      hub_note: 'Active Nav Desk game for Sea Speak, VHF, and working radio phrases.',
      stage: 'Available',
    },
    watch_officer: {
      title: 'Watch Officer',
      description: 'Local 2D greybox prototype for watchkeeping decisions: safe water, one crossing traffic scenario, AIS vector, and draft outcome scoring.',
      hub_note: 'Staged web candidate: prototype/draft, not final training content and not navigation instruction.',
      stage: 'Prototype / draft',
    },
    wind_rider: {
      title: 'Wind Rider',
      description: 'Sails, wind, sail physics, and helm control.',
      stage: 'Planned',
    },
    mystic_boatswain: {
      title: 'Mystic Boatswain',
      description: 'Names of parts, spaces, equipment, and fittings on yachts and ships.',
      stage: 'Planned',
    },
  },
  ru: {
    captain_ether: {
      title: 'Капитан — Эфир',
      description: 'Морская игра-тренажёр радиообмена.',
      hub_note: 'Активная игра Nav Desk для Sea Speak, УКВ и рабочих фраз радиообмена.',
      stage: 'Доступно',
    },
    watch_officer: {
      title: 'Watch Officer',
      description: 'Локальный 2D greybox-прототип решений вахтенного помощника: безопасная вода, один встречный сценарий трафика, AIS-вектор и черновая оценка результата.',
      hub_note: 'Стадированный Web-кандидат: prototype/draft, не финальный учебный продукт и не навигационная инструкция.',
      stage: 'Прототип / draft',
    },
    wind_rider: {
      title: 'Оседлавший ветер',
      description: 'Паруса, ветер, физика паруса и управление.',
      stage: 'Запланировано',
    },
    mystic_boatswain: {
      title: 'Мистический боцман',
      description: 'Названия частей, помещений, оборудования и узлов яхт и кораблей.',
      stage: 'Запланировано',
    },
  },
  de: {
    captain_ether: { title: 'Captain Ether', description: 'Maritimes Funkverkehr-Trainingsspiel.', hub_note: 'Aktives Nav-Desk-Spiel für Sea Speak, UKW und Arbeitsphrasen im Funk.', stage: 'Verfügbar' },
    watch_officer: { title: 'Watch Officer', description: 'Lokaler 2D-Greybox-Prototyp für Wachentscheidungen: sicheres Wasser, eine Verkehrssituation, AIS-Vektor und Entwurfswertung.', hub_note: 'Gestaffelter Web-Kandidat: Prototyp/Draft, kein finales Training und keine Navigationsanweisung.', stage: 'Prototyp / Draft' },
    wind_rider: { title: 'Wind Rider', description: 'Segel, Wind, Segelphysik und Steuerung.', stage: 'Geplant' },
    mystic_boatswain: { title: 'Mystic Boatswain', description: 'Namen von Teilen, Räumen, Ausrüstung und Beschlägen auf Yachten und Schiffen.', stage: 'Geplant' },
  },
  it: {
    captain_ether: { title: 'Captain Ether', description: 'Gioco di training per comunicazioni radio marittime.', hub_note: 'Gioco Nav Desk attivo per Sea Speak, VHF e frasi operative radio.', stage: 'Disponibile' },
    watch_officer: { title: 'Watch Officer', description: 'Prototipo greybox 2D locale per decisioni di guardia: acqua sicura, uno scenario traffico, vettore AIS e valutazione bozza.', hub_note: 'Candidato web staged: prototipo/draft, non contenuto formativo finale e non istruzione di navigazione.', stage: 'Prototipo / draft' },
    wind_rider: { title: 'Wind Rider', description: 'Vele, vento, fisica della vela e governo.', stage: 'Pianificato' },
    mystic_boatswain: { title: 'Mystic Boatswain', description: 'Nomi di parti, locali, attrezzature e accessori di yacht e navi.', stage: 'Pianificato' },
  },
  es: {
    captain_ether: { title: 'Captain Ether', description: 'Juego de entrenamiento de comunicación radio marítima.', hub_note: 'Juego activo de Nav Desk para Sea Speak, VHF y frases operativas de radio.', stage: 'Disponible' },
    watch_officer: { title: 'Watch Officer', description: 'Prototipo greybox 2D local para decisiones de guardia: agua segura, un escenario de tráfico, vector AIS y evaluación borrador.', hub_note: 'Candidato web staged: prototipo/borrador, no contenido final de entrenamiento ni instrucción de navegación.', stage: 'Prototipo / borrador' },
    wind_rider: { title: 'Wind Rider', description: 'Velas, viento, física de vela y gobierno.', stage: 'Planificado' },
    mystic_boatswain: { title: 'Mystic Boatswain', description: 'Nombres de partes, espacios, equipos y herrajes de yates y buques.', stage: 'Planificado' },
  },
  sr: {
    captain_ether: { title: 'Captain Ether', description: 'Pomorska igra za trening radio-komunikacije.', hub_note: 'Aktivna Nav Desk igra za Sea Speak, VHF i radne radio fraze.', stage: 'Dostupno' },
    watch_officer: { title: 'Watch Officer', description: 'Lokalni 2D greybox prototip odluka na straži: sigurna voda, jedan scenario saobraćaja, AIS vektor i nacrt ocene.', hub_note: 'Staged web kandidat: prototip/draft, nije finalni trening i nije navigaciona instrukcija.', stage: 'Prototip / draft' },
    wind_rider: { title: 'Wind Rider', description: 'Jedra, vetar, fizika jedra i upravljanje.', stage: 'Planirano' },
    mystic_boatswain: { title: 'Mystic Boatswain', description: 'Nazivi delova, prostora, opreme i okova na jahtama i brodovima.', stage: 'Planirano' },
  },
  zh: {
    captain_ether: { title: 'Captain Ether', description: '海事无线电通信训练游戏。', hub_note: '用于 Sea Speak、VHF 和工作无线电短语的 Nav Desk 活跃游戏。', stage: '可用' },
    watch_officer: { title: 'Watch Officer', description: '值班决策的本地 2D greybox 原型：安全水域、一个会遇交通场景、AIS 向量和草稿评分。', hub_note: '分阶段 Web 候选：原型/草稿，不是最终训练内容，也不是航行指令。', stage: '原型 / 草稿' },
    wind_rider: { title: 'Wind Rider', description: '帆、风、帆的物理和操控。', stage: '已计划' },
    mystic_boatswain: { title: 'Mystic Boatswain', description: '游艇和船舶的部件、舱室、设备和属具名称。', stage: '已计划' },
  },
};

I18N.ru = {
  ...I18N.en,
  'profile.login': 'Войти',
  'profile.logout': 'Выйти',
  'status.active': 'Доступно',
  'status.prototype': 'Прототип / draft',
  'status.preproduction': 'Проектируется',
  'status.planned': 'Запланировано',
  'status.soon': 'Скоро',
  'action.open': 'Открыть',
  'action.prototypeCard': 'Карточка прототипа',
  'action.projectCard': 'Карточка проекта',
  'action.details': 'Подробнее',
  'language.eyebrow': 'Язык',
  'language.reminder': 'Язык интерфейса следует системным настройкам. Если системный язык не поддержан, старт будет на English.',
  'home.eyebrow': 'Игровой хаб',
  'home.copy': 'Выберите морской тренажёр: радиообмен, решения вахтенного, будущие парусные и судовые модули живут в одном игровом домене.',
  'home.openCaptain': 'Открыть Капитан — Эфир',
  'home.lostOars': 'Доработать фразы',
  'home.answerLog': 'Журнал ответов',
  'home.platform': 'Платформа',
  'home.active': 'Доступно',
  'home.planned': 'В работе',
  'home.watches': 'Вахты',
  'home.oars': 'Вёсла',
  'home.gamesTitle': 'Морские игры',
  'home.management': 'Управление',
  'home.managementCopy': 'Общая основа для пользователей, групп, экипажей, соревнований и результатов. Игровой сценарий остаётся отдельным.',
  'disclaimer.eyebrow': 'Дисклеймер',
  'disclaimer.title': 'Учебный тренажёр, не навигационная инструкция',
  'disclaimer.copy1': '«Капитан — Эфир» сделан как игровой тренажёр морского английского и радиообмена. Он помогает отрабатывать формулировки, но не заменяет официальные документы, подготовку, лицензирование, судовые процедуры, указания капитана и требования администрации флага.',
  'disclaimer.copy2': 'При проектировании структуры фраз, тем и терминов программа ориентируется на:',
  'disclaimer.copy3': 'Контент адаптирован для обучения и яхтенной практики; перед реальным радиообменом и навигационными решениями нужно использовать актуальные официальные издания и локальные правила района плавания.',
  'disclaimer.copy4': 'Аккаунтная модель заложена как единая экосистема: будущий пользователь brkovic.ltd должен входить в game.brkovic.ltd через общий подписанный вход без второй регистрации. Email-код здесь остаётся временным fallback-способом входа до запуска общего аккаунта.',
  'notFound.eyebrow': 'Маршрут не найден',
  'notFound.title': 'Такой игры нет в реестре',
  'notFound.copy': 'Путь {path} не совпадает с entry_route в игровом реестре.',
  'nav.games': 'К выбору игр',
  'brief.watchOfficerCopy': 'Watch Officer сейчас открыт как staged prototype candidate: draft/non-final training content, не навигационная инструкция и не финальное обучение.',
  'brief.status': 'Статус',
  'brief.route': 'Маршрут',
  'brief.prototype': 'Прототип',
  'brief.openGame': 'Открыть игру',
  'brief.launchPrototype': 'Открыть staged prototype',
  'level.beginner': 'Новичок',
  'level.intermediate': 'Средний',
  'level.advanced': 'Продвинутый',
  'type.word': 'Слово',
  'type.short_expression': 'Короткая фраза',
  'type.phrase': 'Радиофраза',
  'lostReason.wrong': 'на доработку',
  'lostReason.skip': 'пропущено',
  'lostReason.hint': 'после подсказки',
  'auth.eyebrow': 'Вход',
  'auth.title': 'Капитан — Эфир ждёт вахту',
  'auth.copy': 'Войдите по email, чтобы сохранять вахты, подсказки и потерянные вёсла.',
  'auth.getCode': 'Получить код',
  'auth.codeLabel': '6-значный код',
  'auth.submit': 'Войти',
  'auth.requesting': 'Эфир прогревается...',
  'auth.localCode': 'Локальный код: {code}',
  'auth.sent': 'Код отправлен на email.',
  'auth.verifying': 'Проверяем позывной...',
  'levels.eyebrow': 'Капитан — Эфир',
  'levels.title': 'Выберите вахту',
  'levels.copy': 'Короткие радио-вахты: без экзаменационного шума, от простых слов к рабочим фразам.',
  'levels.start': 'Начать вахту',
  'levelCopy.beginnerTitle': 'Короткая вахта',
  'levelCopy.beginnerText': '12 вызовов: слова, короткие фразы и первые ответы в эфире.',
  'levelCopy.intermediateTitle': 'Рабочая связь',
  'levelCopy.intermediateText': '16 вызовов: марина, курс, скорость, VTS и уточнения.',
  'levelCopy.advancedTitle': 'Смешанная вахта',
  'levelCopy.advancedText': '20 вызовов: ситуации плотнее, подсказки скромнее.',
  'status.loadingRadio': 'Эфир прогревается...',
  'watch.eyebrow': 'Короткая вахта',
  'watch.progressLabel': 'Прогресс вахты {index} из {total}',
  'watch.finalCall': 'Финальный вызов',
  'watch.remaining': 'После этого {count}',
  'watch.instruction': 'Переведите на английский Sea Speak',
  'watch.previous': 'Предыдущий ответ',
  'watch.answerLabel': 'Ваш ответ',
  'watch.answer': 'Ответить',
  'watch.hint': 'Подсказка',
  'watch.skip': 'Пропустить',
  'watch.noHint': 'Подсказок нет. Эфир честный.',
  'watch.hintLabel': 'Подсказка',
  'watch.side': 'Вахта',
  'watch.level': 'Уровень',
  'watch.type': 'Тип',
  'watch.topic': 'Тема',
  'watch.exitHub': 'Выйти в хаб',
  'result.standardAccepted': 'Засчитано, вот стандартная форма',
  'result.standardForm': 'Стандартная форма',
  'summary.eyebrow': 'Вахта закрыта',
  'summary.title': 'Вахта закрыта спокойно',
  'summary.clean': 'Чисто',
  'summary.hint': 'С подсказкой',
  'summary.revision': 'На доработку',
  'summary.score': 'Счёт',
  'summary.continue': 'Продолжить',
  'lost.title': 'Спокойная доработка',
  'lost.hasItems': 'Не штраф: закрепим пару фраз и вернёмся на вахту.',
  'lost.empty': 'Всё спокойно: сейчас нечего дорабатывать.',
  'lost.answerAria': 'Ответ для доработки',
  'lost.check': 'Проверить',
  'lost.home': 'В хаб',
  'lost.newWatch': 'Новая вахта',
  'lost.review': 'Доработка',
  'lost.hint': 'Подсказка',
  'empty.none': 'нет',
  'log.wrong': 'ошибка',
  'log.skip': 'пропуск',
  'log.hint': 'подсказка',
  'log.spelling': 'написание',
  'log.variant': 'вариант',
  'log.accepted_variant': 'принятый вариант',
  'flag.possible_missing_variant': 'проверить вариант',
  'flag.prompt_or_hint_friction': 'проверить подсказку',
  'flag.accepted_variant_review': 'в словарь',
  'flag.common_spelling_review': 'частая опечатка',
  'flag.repeated_pattern': 'повторяется',
  'date.none': 'нет даты',
  'answerLog.adminRequired': 'Admin role required.',
  'answerLog.loading': 'Собираем журнал ответов...',
  'answerLog.title': 'Журнал ответов',
  'answerLog.stored': 'В хранилище',
  'answerLog.filtered': 'Отфильтровано',
  'answerLog.groups': 'Групп',
  'answerLog.updated': 'Обновлено',
  'answerLog.kinds': 'Типы',
  'answerLog.refresh': 'Обновить',
  'answerLog.back': 'К вахтам',
  'answerLog.noGroups': 'Пока нет спорных ответов.',
  'answerLog.latest': 'Последние записи',
  'answerLog.rawTitle': 'Сырые события без identity',
  'answerLog.time': 'Время',
  'answerLog.kind': 'Тип',
  'answerLog.answer': 'Ответ',
  'answerLog.standard': 'Стандарт',
  'answerLog.records': '{count} записей',
  'answerLog.noPrompt': 'Без prompt',
  'answerLog.noAnswers': 'Нет ответов.',
  'answerLog.empty': '[пусто]',
  'answerLog.noEntries': 'Нет записей.',
  'locale': 'ru-RU',
};

const LOCALE_OVERRIDES = {
  de: {
    'profile.login': 'Einloggen', 'profile.logout': 'Ausloggen', 'status.active': 'Verfügbar', 'status.prototype': 'Prototyp / Draft', 'status.preproduction': 'In Planung', 'status.planned': 'Geplant', 'status.soon': 'Bald', 'action.open': 'Öffnen', 'action.prototypeCard': 'Prototypkarte', 'action.projectCard': 'Projektkarte', 'action.details': 'Details',
    'language.eyebrow': 'Sprache', 'language.reminder': 'Die Oberfläche folgt den Systemeinstellungen. Nicht unterstützte Sprachen starten auf Englisch.',
    'home.copy': 'Wähle einen maritimen Trainer: Funkverkehr, Wachentscheidungen und künftige Segel- und Schiffsmodule in einer Game-Domain.', 'home.openCaptain': 'Captain Ether öffnen', 'home.lostOars': 'Phrasen üben', 'home.answerLog': 'Antwortprotokoll', 'home.platform': 'Plattform', 'home.active': 'Verfügbar', 'home.planned': 'In Arbeit', 'home.watches': 'Wachen', 'home.oars': 'Ruder', 'home.gamesTitle': 'Maritime Spiele', 'home.management': 'Verwaltung',
    'disclaimer.title': 'Trainingssimulator, keine Navigationsanweisung', 'notFound.title': 'Dieses Spiel ist nicht im Register', 'nav.games': 'Zur Spielauswahl',
    'level.beginner': 'Anfänger', 'level.intermediate': 'Mittel', 'level.advanced': 'Fortgeschritten', 'type.word': 'Wort', 'type.short_expression': 'Kurze Phrase', 'type.phrase': 'Funkphrase',
    'auth.eyebrow': 'Login', 'auth.title': 'Captain Ether wartet auf die Wache', 'auth.copy': 'Melde dich per E-Mail an, um Wachen, Hinweise und Lost Oars zu speichern.', 'auth.getCode': 'Code erhalten', 'auth.codeLabel': '6-stelliger Code', 'auth.submit': 'Einloggen', 'auth.requesting': 'Funk wird vorbereitet...', 'auth.localCode': 'Lokaler Code: {code}', 'auth.sent': 'Code per E-Mail gesendet.', 'auth.verifying': 'Rufzeichen wird geprüft...',
    'levels.title': 'Wache wählen', 'levels.copy': 'Kurze Funkwachen: ohne Prüfungsrauschen, von einfachen Wörtern zu Arbeitsphrasen.', 'levels.start': 'Wache starten', 'levelCopy.beginnerTitle': 'Kurze Wache', 'levelCopy.intermediateTitle': 'Arbeitsfunk', 'levelCopy.advancedTitle': 'Gemischte Wache',
    'status.loadingRadio': 'Funk wird vorbereitet...', 'watch.instruction': 'In englisches Sea Speak übersetzen', 'watch.previous': 'Vorherige Antwort', 'watch.answerLabel': 'Deine Antwort', 'watch.answer': 'Antworten', 'watch.hint': 'Hinweis', 'watch.skip': 'Überspringen', 'watch.level': 'Level', 'watch.type': 'Typ', 'watch.topic': 'Thema', 'watch.exitHub': 'Zum Hub',
    'result.standardAccepted': 'Akzeptiert, hier ist die Standardform', 'result.standardForm': 'Standardform', 'summary.title': 'Wache ruhig geschlossen', 'summary.clean': 'Sauber', 'summary.hint': 'Mit Hinweis', 'summary.revision': 'Zu üben', 'summary.score': 'Punktzahl', 'summary.continue': 'Weiter',
    'lost.title': 'Ruhige Übung', 'lost.hasItems': 'Keine Strafe: ein paar Phrasen festigen und zurück zur Wache.', 'lost.empty': 'Alles ruhig: gerade nichts zu üben.', 'lost.check': 'Prüfen', 'lost.home': 'Hub', 'lost.newWatch': 'Neue Wache',
    'answerLog.title': 'Antwortprotokoll', 'answerLog.loading': 'Antwortprotokoll wird gesammelt...', 'answerLog.refresh': 'Aktualisieren', 'answerLog.back': 'Zu den Wachen', 'locale': 'de-DE',
  },
  it: {
    'profile.login': 'Accedi', 'profile.logout': 'Esci', 'status.active': 'Disponibile', 'status.prototype': 'Prototipo / draft', 'status.preproduction': 'In progettazione', 'status.planned': 'Pianificato', 'status.soon': 'Presto', 'action.open': 'Apri', 'action.prototypeCard': 'Scheda prototipo', 'action.projectCard': 'Scheda progetto', 'action.details': 'Dettagli',
    'language.eyebrow': 'Lingua', 'language.reminder': 'La lingua dell’interfaccia segue le impostazioni di sistema. Le lingue non supportate partono in inglese.',
    'home.eyebrow': 'Hub giochi', 'home.copy': 'Scegli un trainer marittimo: radio, decisioni di guardia e futuri moduli vela e nave in un unico dominio.', 'home.openCaptain': 'Apri Captain Ether', 'home.lostOars': 'Ripassa frasi', 'home.answerLog': 'Registro risposte', 'home.platform': 'Piattaforma', 'home.active': 'Disponibili', 'home.planned': 'In lavorazione', 'home.watches': 'Guardie', 'home.oars': 'Remi', 'home.gamesTitle': 'Giochi marittimi', 'home.management': 'Gestione', 'home.managementCopy': 'Una base condivisa per utenti, gruppi, equipaggi, competizioni e risultati. Lo scenario di gioco resta separato.',
    'disclaimer.eyebrow': 'Avvertenza',
    'auth.title': 'Captain Ether aspetta la guardia', 'auth.copy': 'Accedi con email per salvare guardie, suggerimenti e Lost Oars.', 'auth.getCode': 'Ricevi codice', 'auth.submit': 'Accedi', 'auth.requesting': 'Radio in preparazione...', 'auth.sent': 'Codice inviato via email.', 'auth.verifying': 'Controllo nominativo...',
    'levels.title': 'Scegli una guardia', 'levels.start': 'Inizia guardia', 'watch.instruction': 'Traduci in Sea Speak inglese', 'watch.answerLabel': 'La tua risposta', 'watch.answer': 'Rispondi', 'watch.hint': 'Suggerimento', 'watch.skip': 'Salta', 'watch.exitHub': 'Esci al hub',
    'result.standardAccepted': 'Accettato, ecco la forma standard', 'result.standardForm': 'Forma standard', 'summary.title': 'Guardia chiusa con calma', 'summary.continue': 'Continua', 'lost.title': 'Ripasso calmo', 'lost.empty': 'Tutto tranquillo: niente da ripassare ora.', 'lost.check': 'Controlla', 'locale': 'it-IT',
  },
  es: {
    'profile.login': 'Entrar', 'profile.logout': 'Salir', 'status.active': 'Disponible', 'status.prototype': 'Prototipo / borrador', 'status.preproduction': 'En diseño', 'status.planned': 'Planificado', 'status.soon': 'Próximamente', 'action.open': 'Abrir', 'action.prototypeCard': 'Ficha de prototipo', 'action.projectCard': 'Ficha de proyecto', 'action.details': 'Detalles',
    'language.eyebrow': 'Idioma', 'language.reminder': 'El idioma de la interfaz sigue la configuración del sistema. Los idiomas no compatibles inician en inglés.',
    'home.eyebrow': 'Hub de juegos', 'home.copy': 'Elige un entrenador marítimo: radio, decisiones de guardia y futuros módulos de vela y buque en un solo dominio.', 'home.openCaptain': 'Abrir Captain Ether', 'home.lostOars': 'Repasar frases', 'home.answerLog': 'Registro de respuestas', 'home.platform': 'Plataforma', 'home.active': 'Disponibles', 'home.planned': 'En curso', 'home.watches': 'Guardias', 'home.oars': 'Remos', 'home.gamesTitle': 'Juegos marítimos', 'home.management': 'Gestión', 'home.managementCopy': 'Una base compartida para usuarios, grupos, tripulaciones, competiciones y resultados. El escenario de juego queda separado.',
    'disclaimer.eyebrow': 'Aviso',
    'auth.title': 'Captain Ether espera la guardia', 'auth.copy': 'Entra con email para guardar guardias, pistas y Lost Oars.', 'auth.getCode': 'Obtener código', 'auth.submit': 'Entrar', 'auth.requesting': 'Preparando radio...', 'auth.sent': 'Código enviado por email.', 'auth.verifying': 'Comprobando indicativo...',
    'levels.title': 'Elige una guardia', 'levels.start': 'Iniciar guardia', 'watch.instruction': 'Traduce al Sea Speak inglés', 'watch.answerLabel': 'Tu respuesta', 'watch.answer': 'Responder', 'watch.hint': 'Pista', 'watch.skip': 'Saltar', 'watch.exitHub': 'Salir al hub',
    'result.standardAccepted': 'Aceptado, esta es la forma estándar', 'result.standardForm': 'Forma estándar', 'summary.title': 'Guardia cerrada con calma', 'summary.continue': 'Continuar', 'lost.title': 'Repaso tranquilo', 'lost.empty': 'Todo tranquilo: nada que repasar ahora.', 'lost.check': 'Comprobar', 'locale': 'es-ES',
  },
  sr: {
    'profile.login': 'Prijava', 'profile.logout': 'Odjava', 'status.active': 'Dostupno', 'status.prototype': 'Prototip / draft', 'status.preproduction': 'U projektovanju', 'status.planned': 'Planirano', 'status.soon': 'Uskoro', 'action.open': 'Otvori', 'action.prototypeCard': 'Kartica prototipa', 'action.projectCard': 'Kartica projekta', 'action.details': 'Detalji',
    'language.eyebrow': 'Jezik', 'language.reminder': 'Jezik interfejsa prati sistemska podešavanja. Nepodržani jezici startuju na engleskom.',
    'home.eyebrow': 'Hub igara', 'home.copy': 'Izaberi pomorski trening: radio-vezu, odluke na straži i buduće jedriličarske i brodske module u jednom domenu.', 'home.openCaptain': 'Otvori Captain Ether', 'home.lostOars': 'Doradi fraze', 'home.answerLog': 'Dnevnik odgovora', 'home.platform': 'Platforma', 'home.active': 'Dostupno', 'home.planned': 'U radu', 'home.watches': 'Straže', 'home.oars': 'Vesla', 'home.gamesTitle': 'Pomorske igre', 'home.management': 'Upravljanje', 'home.managementCopy': 'Zajednička osnova za korisnike, grupe, posade, takmičenja i rezultate. Scenario igre ostaje odvojen.',
    'disclaimer.eyebrow': 'Napomena',
    'auth.title': 'Captain Ether čeka stražu', 'auth.copy': 'Prijavi se emailom da sačuvaš straže, pomoći i Lost Oars.', 'auth.getCode': 'Dobij kod', 'auth.submit': 'Prijava', 'auth.requesting': 'Radio se priprema...', 'auth.sent': 'Kod je poslat emailom.', 'auth.verifying': 'Proveravamo pozivni znak...',
    'levels.title': 'Izaberi stražu', 'levels.start': 'Počni stražu', 'watch.instruction': 'Prevedi na engleski Sea Speak', 'watch.answerLabel': 'Tvoj odgovor', 'watch.answer': 'Odgovori', 'watch.hint': 'Pomoć', 'watch.skip': 'Preskoči', 'watch.exitHub': 'Izlaz u hub',
    'result.standardAccepted': 'Prihvaćeno, ovo je standardna forma', 'result.standardForm': 'Standardna forma', 'summary.title': 'Straža mirno zatvorena', 'summary.continue': 'Nastavi', 'lost.title': 'Mirna dorada', 'lost.empty': 'Sve mirno: sada nema šta da se doradi.', 'lost.check': 'Proveri', 'locale': 'sr-Latn',
  },
  zh: {
    'profile.login': '登录', 'profile.logout': '退出', 'status.active': '可用', 'status.prototype': '原型 / 草稿', 'status.preproduction': '设计中', 'status.planned': '已计划', 'status.soon': '即将推出', 'action.open': '打开', 'action.prototypeCard': '原型卡片', 'action.projectCard': '项目卡片', 'action.details': '详情',
    'language.eyebrow': '语言', 'language.reminder': '界面语言跟随系统设置。不支持的语言会以 English 启动。',
    'home.copy': '选择海事训练器：无线电通信、值班决策以及未来的帆船和船舶模块都在同一游戏域中。', 'home.openCaptain': '打开 Captain Ether', 'home.lostOars': '复习短语', 'home.answerLog': '答案日志', 'home.platform': '平台', 'home.active': '可用', 'home.planned': '进行中', 'home.watches': '值班', 'home.oars': '桨', 'home.gamesTitle': '海事游戏',
    'auth.title': 'Captain Ether 正在等待值班', 'auth.copy': '使用 email 登录以保存值班、提示和 Lost Oars。', 'auth.getCode': '获取代码', 'auth.codeLabel': '6 位代码', 'auth.submit': '登录', 'auth.requesting': '无线电预热中...', 'auth.sent': '代码已发送到 email。', 'auth.verifying': '正在检查呼号...',
    'levels.title': '选择值班', 'levels.start': '开始值班', 'watch.instruction': '翻译成英语 Sea Speak', 'watch.answerLabel': '你的答案', 'watch.answer': '回答', 'watch.hint': '提示', 'watch.skip': '跳过', 'watch.exitHub': '返回 hub',
    'result.standardAccepted': '已接受，这是标准形式', 'result.standardForm': '标准形式', 'summary.title': '值班已平稳结束', 'summary.continue': '继续', 'lost.title': '平稳复习', 'lost.empty': '一切正常：现在没有需要复习的内容。', 'lost.check': '检查', 'locale': 'zh-CN',
  },
};

Object.entries(LOCALE_OVERRIDES).forEach(([locale, values]) => {
  I18N[locale] = { ...I18N.en, ...values };
});

function normalizeLocale(value) {
  const code = String(value || '').toLowerCase().replace(/_/g, '-');
  if (code.startsWith('zh')) return 'zh';
  if (code.startsWith('sr') || code.startsWith('hr') || code.startsWith('bs') || code.startsWith('me')) return 'sr';
  if (code.startsWith('en')) return 'en';
  if (code.startsWith('ru')) return 'ru';
  if (code.startsWith('de')) return 'de';
  if (code.startsWith('it')) return 'it';
  if (code.startsWith('es')) return 'es';
  return null;
}

function detectLocale() {
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale && SUPPORTED_LOCALES.includes(locale)) return locale;
  }
  return 'en';
}

const locale = detectLocale();
document.documentElement.lang = t('locale').split('-').slice(0, locale === 'sr' ? 2 : 1).join('-');

function t(key) {
  return I18N[locale]?.[key] ?? I18N.en[key] ?? key;
}

function tf(key, values = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

function localizeShellMetadata() {
  document.title = locale === 'ru' ? 'Brkovic Maritime Games' : 'Brkovic Maritime Games';
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('home.copy'));
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Brkovic Games');
}

localizeShellMetadata();

function languageReminderMarkup() {
  return html`
    <aside class="language-reminder" aria-label="${escapeHtml(t('language.eyebrow'))}">
      <strong>${escapeHtml(t('language.eyebrow'))}</strong>
      <span>${escapeHtml(t('language.reminder'))}</span>
    </aside>
  `;
}

const app = document.querySelector('#app');
const profileArea = document.querySelector('#profileArea');

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(state.csrf ? { 'X-CSRF-Token': state.csrf } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

function html(strings, ...values) {
  return strings.reduce((result, chunk, index) => result + chunk + (values[index] ?? ''), '');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function renderProfile() {
  if (!state.user) {
    profileArea.innerHTML = `<button class="button ghost" id="loginTopButton">${escapeHtml(t('profile.login'))}</button>`;
    document.querySelector('#loginTopButton')?.addEventListener('click', renderLogin);
    return;
  }

  profileArea.innerHTML = html`
    <span class="profile-chip">${escapeHtml(state.user.email)}</span>
    <button class="button ghost" id="logoutButton">${escapeHtml(t('profile.logout'))}</button>
  `;
  document.querySelector('#logoutButton')?.addEventListener('click', async () => {
    await api('/api/auth/logout.php', { method: 'POST', body: '{}' });
    state.user = null;
    state.csrf = null;
    renderProfile();
    renderLogin();
  });
}

function isAdmin() {
  return state.user?.role === 'admin';
}

async function ensureRegistry() {
  if (state.registry.length) return state.registry;
  const data = await api('/api/games/registry.php');
  state.registry = data.registry.games || [];
  return state.registry;
}

function gameStatusCopy(game) {
  if (game.status === 'active') {
    return { label: localGameField(game, 'stage') || t('status.active'), className: '', action: t('action.open') };
  }
  if (game.status === 'prototype') {
    return { label: localGameField(game, 'stage') || t('status.prototype'), className: 'planned', action: t('action.prototypeCard') };
  }
  if (game.status === 'preproduction') {
    return { label: localGameField(game, 'stage') || t('status.preproduction'), className: 'planned', action: t('action.projectCard') };
  }
  return { label: localGameField(game, 'stage') || t(`status.${game.status}`) || t('status.soon'), className: 'planned', action: t('action.details') };
}

function localGameField(game, field) {
  return GAME_COPY[locale]?.[game.slug]?.[field]
    || GAME_COPY.en?.[game.slug]?.[field]
    || game[`${field}_${locale}`]
    || game[`${field}_en`]
    || game[`${field}_ru`]
    || '';
}

function gameCard(game) {
  const status = gameStatusCopy(game);
  const planned = game.status !== 'active';
  return html`
    <article class="game-card ${planned ? 'is-planned' : ''}">
      <span class="status-pill ${status.className}">${escapeHtml(status.label)}</span>
      <div>
        <strong>${escapeHtml(localGameField(game, 'title'))}</strong>
        <p class="muted">${escapeHtml(localGameField(game, 'description'))}</p>
        ${localGameField(game, 'hub_note') ? `<small class="game-note">${escapeHtml(localGameField(game, 'hub_note'))}</small>` : ''}
      </div>
      <button class="button ${planned ? '' : 'primary'}" data-game="${escapeHtml(game.slug)}">
        ${escapeHtml(status.action)}
      </button>
    </article>
  `;
}

async function loadProgress() {
  if (!state.user) return null;
  const data = await api('/api/captain-ether/progress.php');
  state.progress = data.progress;
  return state.progress;
}

async function renderHome() {
  await ensureRegistry();
  if (state.user) {
    await loadProgress().catch(() => null);
  }
  const activeGames = state.registry.filter((game) => game.status === 'active').length;
  const plannedGames = state.registry.length - activeGames;

  app.innerHTML = html`
    ${languageReminderMarkup()}
    <section class="hero-grid">
      <div class="panel">
        <p class="eyebrow">${escapeHtml(t('home.eyebrow'))}</p>
        <h1 class="hero-title">Maritime Games</h1>
        <p class="muted">${escapeHtml(t('home.copy'))}</p>
        <div class="actions">
          <button class="button primary" id="startWatchButton">${escapeHtml(t('home.openCaptain'))}</button>
          <button class="button amber" id="lostOarsButton">${escapeHtml(t('home.lostOars'))}</button>
          ${isAdmin() ? `<button class="button" id="answerLogButton">${escapeHtml(t('home.answerLog'))}</button>` : ''}
        </div>
      </div>
      <aside class="panel">
        <p class="eyebrow">${escapeHtml(t('home.platform'))}</p>
        <div class="stat-grid">
          <div class="stat-card"><small>${escapeHtml(t('home.active'))}</small><strong>${activeGames}</strong></div>
          <div class="stat-card"><small>${escapeHtml(t('home.planned'))}</small><strong>${plannedGames}</strong></div>
          <div class="stat-card"><small>${escapeHtml(t('home.watches'))}</small><strong>${state.progress?.completed_watches ?? 0}</strong></div>
          <div class="stat-card"><small>${escapeHtml(t('home.oars'))}</small><strong>${state.progress?.unresolved_lost_oars ?? 0}</strong></div>
        </div>
      </aside>
    </section>

    <section class="panel">
      <div class="section-head">
        <p class="eyebrow">${escapeHtml(t('home.eyebrow'))}</p>
        <h2>${escapeHtml(t('home.gamesTitle'))}</h2>
      </div>
      <div class="game-grid">
        ${state.registry.map(gameCard).join('')}
      </div>
    </section>

    <section class="panel">
      <p class="eyebrow">${escapeHtml(t('home.management'))}</p>
      <p class="admin-note muted">${escapeHtml(t('home.managementCopy'))}</p>
    </section>

    <section class="panel disclaimer-panel">
      <p class="eyebrow">${escapeHtml(t('disclaimer.eyebrow'))}</p>
      <h2>${escapeHtml(t('disclaimer.title'))}</h2>
      <p class="muted">${escapeHtml(t('disclaimer.copy1'))}</p>
      <p class="muted">${escapeHtml(t('disclaimer.copy2'))}</p>
      <ul class="source-list">
        <li>IMO Standard Marine Communication Phrases, Resolution A.918(22).</li>
        <li>STCW Convention and STCW Code requirements for understanding and using SMCP where applicable.</li>
        <li>COLREG 1972 — Convention on the International Regulations for Preventing Collisions at Sea.</li>
        <li>ITU Radio Regulations, ITU Maritime Manual and ITU-R M.1171 radiotelephony procedures.</li>
        <li>International Code of Signals and International Radiotelephony Spelling Alphabet.</li>
        <li>IALA Maritime Buoyage System and IHO Hydrographic Dictionary S-32 for navigation terminology references.</li>
      </ul>
      <p class="muted">${escapeHtml(t('disclaimer.copy3'))}</p>
      <p class="muted">${escapeHtml(t('disclaimer.copy4'))}</p>
    </section>
  `;

  document.querySelector('#startWatchButton')?.addEventListener('click', () => openGame('captain_ether'));
  document.querySelector('#lostOarsButton')?.addEventListener('click', () => {
    if (!state.user) renderLogin();
    else renderLostOars();
  });
  document.querySelector('#answerLogButton')?.addEventListener('click', renderAnswerLog);
  document.querySelectorAll('[data-game]')?.forEach((button) => {
    button.addEventListener('click', () => openGame(button.dataset.game));
  });
}

function routeSlugFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const match = state.registry.find((game) => game.entry_route === path);
  return match?.slug || null;
}

function gameFromCurrentPath() {
  const slug = routeSlugFromPath();
  return slug ? state.registry.find((game) => game.slug === slug) : null;
}

async function renderCurrentRoute() {
  await ensureRegistry();
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/index.html') {
    await renderHome();
    return;
  }

  const game = gameFromCurrentPath();
  if (game) {
    renderGameRoute(game);
    return;
  }

  renderNotFoundRoute(path);
}

function navigateHome() {
  window.history.pushState({}, '', '/');
  renderHome();
}

function openGame(slug) {
  const game = state.registry.find((item) => item.slug === slug);
  if (!game) return;
  window.history.pushState({}, '', game.entry_route || '/');
  renderGameRoute(game);
}

function renderGameRoute(game) {
  if (game.slug === 'captain_ether') {
    if (!state.user) {
      renderLogin();
      return;
    }
    renderLevelSelect();
    return;
  }
  renderGameBrief(game);
}

function renderNotFoundRoute(path) {
  app.innerHTML = html`
    ${languageReminderMarkup()}
    <section class="panel product-brief">
      <p class="eyebrow">${escapeHtml(t('notFound.eyebrow'))}</p>
      <h1>${escapeHtml(t('notFound.title'))}</h1>
      <p class="muted">${tf('notFound.copy', { path: `<strong>${escapeHtml(path)}</strong>` })}</p>
      <div class="actions">
        <button class="button primary" id="notFoundHomeButton">${escapeHtml(t('nav.games'))}</button>
      </div>
    </section>
  `;
  document.querySelector('#notFoundHomeButton')?.addEventListener('click', navigateHome);
}

function renderGameBrief(game) {
  const status = gameStatusCopy(game);
  const isWatchOfficer = game.slug === 'watch_officer';
  const launchRoute = game.launch_route || '';
  app.innerHTML = html`
    ${languageReminderMarkup()}
    <section class="panel product-brief">
      <p class="eyebrow">${escapeHtml(status.label)}</p>
      <h1>${escapeHtml(localGameField(game, 'title'))}</h1>
      <p class="muted">${escapeHtml(localGameField(game, 'description'))}</p>
      ${localGameField(game, 'hub_note') ? `<p class="muted">${escapeHtml(localGameField(game, 'hub_note'))}</p>` : ''}
      ${isWatchOfficer ? html`
        <p class="muted">${escapeHtml(t('brief.watchOfficerCopy'))}</p>
      ` : ''}
      <div class="stat-grid product-brief__meta">
        <div class="stat-card"><small>${escapeHtml(t('brief.status'))}</small><strong>${escapeHtml(status.label)}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('brief.route'))}</small><strong>${escapeHtml(game.entry_route || '/')}</strong></div>
        ${launchRoute ? `<div class="stat-card"><small>${escapeHtml(t('brief.prototype'))}</small><strong>${escapeHtml(launchRoute)}</strong></div>` : ''}
      </div>
      <div class="actions">
        <button class="button" id="briefHomeButton">${escapeHtml(t('nav.games'))}</button>
        ${game.status === 'active' ? `<button class="button primary" id="briefOpenButton">${escapeHtml(t('brief.openGame'))}</button>` : ''}
        ${launchRoute ? `<button class="button primary" id="briefLaunchPrototypeButton">${escapeHtml(t('brief.launchPrototype'))}</button>` : ''}
      </div>
    </section>
  `;
  document.querySelector('#briefHomeButton')?.addEventListener('click', navigateHome);
  document.querySelector('#briefOpenButton')?.addEventListener('click', () => renderGameRoute(game));
  document.querySelector('#briefLaunchPrototypeButton')?.addEventListener('click', () => {
    window.location.href = launchRoute;
  });
}

function levelLabel(level) {
  return t(`level.${level}`) || t('level.beginner');
}

function questionTypeLabel(type) {
  return t(`type.${type}`) || t('type.phrase');
}

function lostReasonLabel(reason) {
  return t(`lostReason.${reason}`) || t('lostReason.wrong');
}

function renderLogin() {
  app.innerHTML = html`
    ${languageReminderMarkup()}
    <section class="panel auth-panel">
      <div>
        <p class="eyebrow">${escapeHtml(t('auth.eyebrow'))}</p>
        <h1>${escapeHtml(t('auth.title'))}</h1>
        <p class="muted">${escapeHtml(t('auth.copy'))}</p>
      </div>
      <form class="auth-form" id="loginForm">
        <label>
          <span>${escapeHtml(t('auth.email'))}</span>
          <input type="email" name="email" autocomplete="email" required placeholder="name@example.com" />
        </label>
        <button class="button primary" type="submit">${escapeHtml(t('auth.getCode'))}</button>
      </form>
      <form class="auth-form is-hidden" id="codeForm">
        <label>
          <span>${escapeHtml(t('auth.codeLabel'))}</span>
          <input type="text" name="code" inputmode="numeric" maxlength="6" required placeholder="000000" />
        </label>
        <button class="button primary" type="submit">${escapeHtml(t('auth.submit'))}</button>
      </form>
      <p class="status-line" id="authStatus"></p>
    </section>
  `;
  let email = '';
  const loginForm = document.querySelector('#loginForm');
  const codeForm = document.querySelector('#codeForm');
  const status = document.querySelector('#authStatus');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    email = new FormData(loginForm).get('email');
    status.textContent = t('auth.requesting');
    try {
      const data = await api('/api/auth/request-code.php', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      loginForm.classList.add('is-hidden');
      codeForm.classList.remove('is-hidden');
      codeForm.querySelector('input')?.focus();
      status.textContent = data.dev_code
        ? tf('auth.localCode', { code: data.dev_code })
        : t('auth.sent');
    } catch (error) {
      status.textContent = error.message;
    }
  });

  codeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = new FormData(codeForm).get('code');
    status.textContent = t('auth.verifying');
    try {
      const data = await api('/api/auth/verify-code.php', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      state.user = data.user;
      state.csrf = data.csrf;
      renderProfile();
      await renderCurrentRoute();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function renderLevelSelect() {
  app.innerHTML = html`
    ${languageReminderMarkup()}
    <section class="panel captain-levels">
      <p class="eyebrow">${escapeHtml(t('levels.eyebrow'))}</p>
      <h1>${escapeHtml(t('levels.title'))}</h1>
      <p class="muted">${escapeHtml(t('levels.copy'))}</p>
      <div class="game-grid">
        ${['beginner', 'intermediate', 'advanced'].map((level) => html`
          <article class="game-card">
            <span class="status-pill">${levelLabel(level)}</span>
            <strong>${levelCopy(level).title}</strong>
            <p class="muted">${levelCopy(level).text}</p>
            <button class="button primary" data-level="${level}">${escapeHtml(t('levels.start'))}</button>
          </article>
        `).join('')}
      </div>
      ${isAdmin() ? `<div class="actions"><button class="button" id="answerLogLevelButton">${escapeHtml(t('home.answerLog'))}</button></div>` : ''}
    </section>
  `;
  document.querySelectorAll('[data-level]').forEach((button) => {
    button.addEventListener('click', () => startWatch(button.dataset.level));
  });
  document.querySelector('#answerLogLevelButton')?.addEventListener('click', renderAnswerLog);
}

function levelCopy(level) {
  return {
    beginner: { title: t('levelCopy.beginnerTitle'), text: t('levelCopy.beginnerText') },
    intermediate: { title: t('levelCopy.intermediateTitle'), text: t('levelCopy.intermediateText') },
    advanced: { title: t('levelCopy.advancedTitle'), text: t('levelCopy.advancedText') },
  }[level];
}

async function startWatch(level) {
  app.innerHTML = `<section class="panel"><p class="status-line">${escapeHtml(t('status.loadingRadio'))}</p></section>`;
  const data = await api('/api/captain-ether/start-watch.php', {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
  state.watch = data.watch;
  state.currentQuestion = data.watch.current;
  state.usedHint = false;
  state.lastResult = null;
  renderWatch();
}

function renderWatch() {
  const q = state.currentQuestion;
  const progress = Math.round((q.index / state.watch.total) * 100);
  const remainingAfterThis = state.watch.total - q.index - 1;
  app.innerHTML = html`
    <section class="watch-layout captain-watch">
      <div class="panel question-card">
        <header class="watch-hud">
          <div>
            <p class="eyebrow">${escapeHtml(t('watch.eyebrow'))}</p>
            <strong>${q.index + 1} / ${state.watch.total}</strong>
          </div>
          <div class="watch-progress" aria-label="${escapeHtml(tf('watch.progressLabel', { index: q.index, total: state.watch.total }))}">
            <span>${remainingAfterThis === 0 ? escapeHtml(t('watch.finalCall')) : escapeHtml(tf('watch.remaining', { count: remainingAfterThis }))}</span>
            <div class="progress-line" style="--progress:${progress}%"><span></span></div>
          </div>
        </header>

        <section class="question-stage" aria-labelledby="questionPrompt">
          <div class="question-meta">
            <span>${escapeHtml(t('watch.instruction'))}</span>
            <small>${questionTypeLabel(q.type)} · ${escapeHtml(q.topic)}</small>
          </div>
          <p class="question-prompt" id="questionPrompt">${escapeHtml(q.prompt)}</p>
        </section>

        <div id="resultBox" class="result-box result-box--previous ${resultClass(state.lastResult)} ${state.lastResult ? '' : 'is-hidden'}">
          ${state.lastResult ? resultMarkup(state.lastResult, t('watch.previous')) : ''}
        </div>

        <form class="answer-form" id="answerForm">
          <label class="answer-field" for="answerInput">
            <span>${escapeHtml(t('watch.answerLabel'))}</span>
            <input id="answerInput" autocomplete="off" placeholder="English radio phrase" />
          </label>
          <button class="button primary" id="answerButton" type="submit">${escapeHtml(t('watch.answer'))}</button>
        </form>
        <div class="watch-tools">
          <button class="button" id="hintButton" type="button">${escapeHtml(t('watch.hint'))}</button>
          <button class="button ghost" id="skipButton" type="button">${escapeHtml(t('watch.skip'))}</button>
        </div>
        <div id="hintBox" class="result-box result-box--hint is-hidden">
          <span class="result-box__label">${escapeHtml(t('watch.hintLabel'))}</span>
          <p>${escapeHtml(q.hint || t('watch.noHint'))}</p>
        </div>
      </div>
      <aside class="panel watch-side">
        <p class="eyebrow">${escapeHtml(t('watch.side'))}</p>
        <div class="watch-side__grid">
          <div><small>${escapeHtml(t('watch.level'))}</small><strong>${levelLabel(q.level)}</strong></div>
          <div><small>${escapeHtml(t('watch.type'))}</small><strong>${questionTypeLabel(q.type)}</strong></div>
          <div><small>${escapeHtml(t('watch.topic'))}</small><strong>${escapeHtml(q.topic)}</strong></div>
        </div>
        <button class="button ghost" id="backHomeButton">${escapeHtml(t('watch.exitHub'))}</button>
      </aside>
    </section>
  `;

  document.querySelector('#answerInput')?.focus();
  document.querySelector('#hintButton')?.addEventListener('click', () => {
    state.usedHint = true;
    document.querySelector('#hintBox')?.classList.remove('is-hidden');
  });
  document.querySelector('#answerForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnswer(false);
  });
  document.querySelector('#skipButton')?.addEventListener('click', () => submitAnswer(true));
  document.querySelector('#backHomeButton')?.addEventListener('click', navigateHome);
}

function resultClass(result) {
  if (!result) return '';
  if (result.correct && ['spelling', 'variant'].includes(result.match_type)) return 'is-soft-correct';
  return result.correct ? 'is-correct' : 'is-wrong';
}

function resultTitle(result) {
  if (result.correct && ['spelling', 'variant'].includes(result.match_type)) {
    return t('result.standardAccepted');
  }
  return result.message;
}

function resultMarkup(result, label = null) {
  return html`
    ${label ? `<span class="result-box__label">${escapeHtml(label)}</span>` : ''}
    <strong>${escapeHtml(resultTitle(result))}</strong>
    <p><span>${escapeHtml(t('result.standardForm'))}</span>${escapeHtml(result.target_text)}</p>
  `;
}

async function submitAnswer(skipped) {
  const input = document.querySelector('#answerInput');
  const data = await api('/api/captain-ether/submit-answer.php', {
    method: 'POST',
    body: JSON.stringify({
      watch_id: state.watch.id,
      index: state.currentQuestion.index,
      answer: skipped ? '' : input.value,
      used_hint: state.usedHint,
      skipped,
    }),
  });

  state.lastResult = data;
  if (data.done) {
    await finishWatch();
    return;
  }
  state.currentQuestion = data.next;
  state.usedHint = false;
  renderWatch();
}

async function finishWatch() {
  const data = await api('/api/captain-ether/finish-watch.php', {
    method: 'POST',
    body: JSON.stringify({ watch_id: state.watch.id }),
  });
  const s = data.summary;
  app.innerHTML = html`
    <section class="panel watch-summary">
      <p class="eyebrow">${escapeHtml(t('summary.eyebrow'))}</p>
      <h1>${escapeHtml(t('summary.title'))}</h1>
      <div class="stat-grid">
        <div class="stat-card"><small>${escapeHtml(t('summary.clean'))}</small><strong>${s.clean}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('summary.hint'))}</small><strong>${s.hint}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('summary.revision'))}</small><strong>${s.unresolved_lost_oars}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('summary.score'))}</small><strong>${s.final_score}</strong></div>
      </div>
      <div class="actions">
        <button class="button amber" id="collectButton">${escapeHtml(t('home.lostOars'))}</button>
        <button class="button" id="continueButton">${escapeHtml(t('summary.continue'))}</button>
      </div>
      <p class="status-line" id="summaryStatus"></p>
    </section>
  `;
  document.querySelector('#collectButton')?.addEventListener('click', renderLostOars);
  document.querySelector('#continueButton')?.addEventListener('click', async () => {
    const status = document.querySelector('#summaryStatus');
    const skip = await api('/api/captain-ether/skip-cleanup.php', { method: 'POST', body: '{}' });
    status.textContent = skip.message;
    if (skip.force_hangar) {
      setTimeout(renderLostOars, 800);
    } else {
      await loadProgress();
    }
  });
}

async function renderLostOars() {
  const data = await api('/api/captain-ether/lost-oars.php');
  const items = data.lost_oars || [];
  app.innerHTML = html`
    <section class="panel lost-oars-panel">
      <p class="eyebrow">Lost Oars</p>
      <h1>${escapeHtml(t('lost.title'))}</h1>
      <p class="muted">${items.length ? escapeHtml(t('lost.hasItems')) : escapeHtml(t('lost.empty'))}</p>
      <div class="lost-list">
        ${items.map((item) => html`
          <article class="lost-item" data-lost="${escapeHtml(item.item_id)}">
            <strong>${escapeHtml(item.prompt)}</strong>
            <small class="muted">${questionTypeLabel(item.type)} · ${escapeHtml(item.topic)} · ${lostReasonLabel(item.reason)}</small>
            <div class="answer-row lost-answer-row">
              <input placeholder="English radio phrase" aria-label="${escapeHtml(t('lost.answerAria'))}" />
              <button class="button primary">${escapeHtml(t('lost.check'))}</button>
            </div>
            <button class="button ghost" data-hint>${escapeHtml(t('lost.hint'))}</button>
            <div class="result-box result-box--hint is-hidden">
              <span class="result-box__label">${escapeHtml(t('watch.hintLabel'))}</span>
              <p>${escapeHtml(item.hint)}</p>
            </div>
          </article>
        `).join('')}
      </div>
      <div class="actions">
        <button class="button" id="homeFromHangar">${escapeHtml(t('lost.home'))}</button>
        <button class="button primary" id="newWatchFromHangar">${escapeHtml(t('lost.newWatch'))}</button>
      </div>
    </section>
  `;

  document.querySelectorAll('[data-lost]').forEach((card) => {
    card.querySelector('[data-hint]')?.addEventListener('click', () => {
      card.querySelector('.result-box')?.classList.remove('is-hidden');
    });
    card.querySelector('.button.primary')?.addEventListener('click', async () => {
      const input = card.querySelector('input');
      const resultBox = card.querySelector('.result-box');
      const data = await api('/api/captain-ether/resolve-lost-oar.php', {
        method: 'POST',
        body: JSON.stringify({ item_id: card.dataset.lost, answer: input.value }),
      });
      resultBox.classList.remove('is-hidden');
      resultBox.classList.remove('is-correct', 'is-wrong', 'is-soft-correct');
      resultBox.classList.add(resultClass(data));
      resultBox.innerHTML = resultMarkup(data, t('lost.review'));
      if (data.correct) {
        card.remove();
        const remainingCards = document.querySelectorAll('[data-lost]');
        if (remainingCards.length === 0) {
          document.querySelector('.lost-list').innerHTML = `<p class="muted">${escapeHtml(t('lost.empty'))}</p>`;
          document.querySelector('.lost-oars-panel > .muted').textContent = t('lost.empty');
        }
      }
    });
  });

  document.querySelector('#homeFromHangar')?.addEventListener('click', navigateHome);
  document.querySelector('#newWatchFromHangar')?.addEventListener('click', renderLevelSelect);
}

function countMapMarkup(map) {
  const entries = Object.entries(map || {});
  if (!entries.length) return `<span class="muted">${escapeHtml(t('empty.none'))}</span>`;
  return entries.map(([key, value]) => html`
    <span class="mini-pill">${escapeHtml(key)} ${escapeHtml(value)}</span>
  `).join('');
}

function logKindLabel(kind) {
  return t(`log.${kind}`) || kind || 'unknown';
}

function reviewFlagLabel(flag) {
  return t(`flag.${flag}`) || flag;
}

function compactDate(value) {
  if (!value) return t('date.none');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(t('locale'), {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function answerLogGroupCard(group) {
  return html`
    <article class="answer-log-card">
      <header class="answer-log-card__head">
        <div>
          <small class="muted">${escapeHtml(group.item_id)}</small>
          <strong>${escapeHtml(group.prompt || t('answerLog.noPrompt'))}</strong>
        </div>
        <span class="status-pill">${escapeHtml(tf('answerLog.records', { count: group.total }))}</span>
      </header>
      <p class="answer-log-target">${escapeHtml(group.target_text || '')}</p>
      <div class="answer-log-meta">
        <div>${countMapMarkup(group.by_kind)}</div>
        <div>${(group.review_flags || []).map((flag) => `<span class="mini-pill amber">${escapeHtml(reviewFlagLabel(flag))}</span>`).join('')}</div>
      </div>
      <div class="answer-log-answers">
        ${(group.top_answers || []).map((answer) => html`
          <div class="answer-log-answer">
            <span>${escapeHtml(answer.answer || t('answerLog.empty'))}</span>
            <small>${escapeHtml(answer.total)} · ${countMapMarkup(Object.fromEntries(Object.entries(answer.by_kind || {}).map(([kind, value]) => [logKindLabel(kind), value])))}</small>
          </div>
        `).join('') || `<p class="muted">${escapeHtml(t('answerLog.noAnswers'))}</p>`}
      </div>
    </article>
  `;
}

function answerLogEntryRow(entry) {
  return html`
    <tr>
      <td>${escapeHtml(compactDate(entry.observed_at))}</td>
      <td><code>${escapeHtml(entry.item_id)}</code></td>
      <td>${escapeHtml(logKindLabel(entry.log_kind))}</td>
      <td>${escapeHtml(entry.answer || t('answerLog.empty'))}</td>
      <td>${escapeHtml(entry.target_text || '')}</td>
    </tr>
  `;
}

async function renderAnswerLog() {
  if (!isAdmin()) {
    app.innerHTML = `<section class="panel"><p class="status-line">${escapeHtml(t('answerLog.adminRequired'))}</p></section>`;
    return;
  }

  app.innerHTML = `<section class="panel"><p class="status-line">${escapeHtml(t('answerLog.loading'))}</p></section>`;
  const data = await api('/api/captain-ether/answer-log.php?limit=80&group_limit=16&answer_limit=5');
  const summary = data.summary || {};
  const groups = data.review_groups || [];
  const entries = data.entries || [];

  app.innerHTML = html`
    <section class="panel answer-log-panel">
      <div class="section-head">
        <p class="eyebrow">Captain Ether QA</p>
        <h1>${escapeHtml(t('answerLog.title'))}</h1>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><small>${escapeHtml(t('answerLog.stored'))}</small><strong>${summary.stored_entries ?? 0}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('answerLog.filtered'))}</small><strong>${summary.filtered_entries ?? 0}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('answerLog.groups'))}</small><strong>${groups.length}</strong></div>
        <div class="stat-card"><small>${escapeHtml(t('answerLog.updated'))}</small><strong>${escapeHtml(compactDate(summary.updated_at))}</strong></div>
      </div>
      <div class="answer-log-summary">
        <div>
          <small class="muted">${escapeHtml(t('answerLog.kinds'))}</small>
          <div class="pill-row">${countMapMarkup(Object.fromEntries(Object.entries(summary.by_kind || {}).map(([kind, value]) => [logKindLabel(kind), value])))}</div>
        </div>
        <div>
          <small class="muted">Matcher</small>
          <div class="pill-row">${countMapMarkup(summary.by_match_type)}</div>
        </div>
      </div>
      <div class="actions">
        <button class="button primary" id="answerLogRefreshButton">${escapeHtml(t('answerLog.refresh'))}</button>
        <button class="button" id="answerLogBackButton">${escapeHtml(t('answerLog.back'))}</button>
      </div>
    </section>

    <section class="answer-log-grid">
      ${groups.map(answerLogGroupCard).join('') || `<article class="panel"><p class="muted">${escapeHtml(t('answerLog.noGroups'))}</p></article>`}
    </section>

    <section class="panel answer-log-table-panel">
      <div class="section-head">
        <p class="eyebrow">${escapeHtml(t('answerLog.latest'))}</p>
        <h2>${escapeHtml(t('answerLog.rawTitle'))}</h2>
      </div>
      <div class="answer-log-table-wrap">
        <table class="answer-log-table">
          <thead>
            <tr>
              <th>${escapeHtml(t('answerLog.time'))}</th>
              <th>Item</th>
              <th>${escapeHtml(t('answerLog.kind'))}</th>
              <th>${escapeHtml(t('answerLog.answer'))}</th>
              <th>${escapeHtml(t('answerLog.standard'))}</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(answerLogEntryRow).join('') || `<tr><td colspan="5">${escapeHtml(t('answerLog.noEntries'))}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.querySelector('#answerLogRefreshButton')?.addEventListener('click', renderAnswerLog);
  document.querySelector('#answerLogBackButton')?.addEventListener('click', renderLevelSelect);
}

async function boot() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
  const me = await api('/api/auth/me.php');
  state.user = me.user;
  state.csrf = me.csrf;
  renderProfile();
  await renderCurrentRoute();
}

window.addEventListener('popstate', async () => {
  await renderCurrentRoute();
});

boot().catch((error) => {
  app.innerHTML = `<section class="panel"><p class="status-line">${escapeHtml(error.message)}</p></section>`;
});
