import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://brkovic.ltd';
const LANGS = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh'];
const LOCALIZED_LANGS = LANGS.filter((lang) => lang !== 'en');
const TODAY = new Date().toISOString().slice(0, 10);

const PAGES = [
  { source: 'index.html', route: '/', priority: '1.0', changefreq: 'weekly', schema: 'home', image: '/images/hero/brkovic-ocean-winner-hero.jpg' },
  { source: 'journal.html', route: '/journal.html', priority: '0.8', changefreq: 'weekly', schema: 'journal', image: '/images/hero/brkovic-ocean-winner-hero.jpg' },
  { source: 'navdesk.html', route: '/navdesk.html', priority: '0.8', changefreq: 'weekly', schema: 'tool', toolName: 'Nav Desk', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-instruments.html', route: '/navdesk-instruments.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'Nav Desk Location Plotter', image: '/images/navdesk/weather-watch-green.jpg' },
  { source: 'ship-cashbox/index.html', route: '/ship-cashbox/index.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'Ship Cashbox', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-route.html', route: '/navdesk-route.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'Great Circle and Rhumb Line Calculator', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-tides.html', route: '/navdesk-tides.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'Tides and Passage Window', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-ukv.html', route: '/navdesk-ukv.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'VHF and Message Templates', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-watch.html', route: '/navdesk-watch.html', priority: '0.7', changefreq: 'monthly', schema: 'tool', toolName: 'Watch Log', image: '/brand/logo-header-inline-light.png' },
  { source: 'navdesk-english.html', route: '/navdesk-english.html', priority: '0.5', changefreq: 'monthly', schema: 'tool', toolName: 'Maritime English', image: '/brand/logo-header-inline-light.png' },
  { source: 'services/yacht-management.html', route: '/services/yacht-management.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'Yacht Management', image: '/images/services/yacht-management-hero.jpg' },
  { source: 'services/iyt-training.html', route: '/services/iyt-training.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'IYT Training', image: '/images/services/iyt-navigation-saloon-hero.png' },
  { source: 'services/skipper-service.html', route: '/services/skipper-service.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'Skipper Service', image: '/images/services/skipper-service-captain-ron-hero-final.png' },
  { source: 'services/sailing-tours.html', route: '/services/sailing-tours.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'Private Sea Tours', image: '/images/services/sailing-tours-grotto-hero.png' },
  { source: 'services/yacht-acceptance-delivery.html', route: '/services/yacht-acceptance-delivery.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'Yacht Acceptance and Delivery', image: '/images/services/yacht-acceptance-delivery-hero.png' },
  { source: 'services/yacht-registration.html', route: '/services/yacht-registration.html', priority: '0.9', changefreq: 'monthly', schema: 'service', serviceName: 'Yacht Registration', image: '/images/services/yacht-registration-hero.png' },
  { source: 'copyright.html', route: '/copyright.html', priority: '0.5', changefreq: 'yearly', schema: 'creativeWork', image: '/brand/logo-header-inline-light.png' },
];

const translations = Object.fromEntries(LANGS.map((lang) => [
  lang,
  JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', `${lang}.json`), 'utf8')),
]));

const NAVDESK_INSTRUMENTS_SCHEMA = {
  en: {
    alternateName: 'Location Plotter',
    browserRequirements: 'Requires browser geolocation permission for live GPS data.',
    featureList: ['GPS position', 'COG and SOG', 'Weather, wind and wave', 'Sea temperature', 'Local time and UTC', 'Two-day weather watch'],
  },
  ru: {
    alternateName: 'Плоттер локации',
    browserRequirements: 'Для live GPS-данных требуется разрешение браузера на геолокацию.',
    featureList: ['GPS-позиция', 'COG и SOG', 'Погода, ветер и волна', 'Температура воды', 'Местное время и UTC', 'Погодное внимание на два дня'],
  },
  de: {
    alternateName: 'Positionsplotter',
    browserRequirements: 'Für Live-GPS-Daten ist die Geolocation-Freigabe des Browsers erforderlich.',
    featureList: ['GPS-Position', 'COG und SOG', 'Wetter, Wind und Welle', 'Wassertemperatur', 'Ortszeit und UTC', 'Zwei-Tage-Wetterwache'],
  },
  it: {
    alternateName: 'Plotter di posizione',
    browserRequirements: 'Per i dati GPS live serve il permesso di geolocalizzazione del browser.',
    featureList: ['Posizione GPS', 'COG e SOG', 'Meteo, vento e onda', 'Temperatura del mare', 'Ora locale e UTC', 'Controllo meteo a due giorni'],
  },
  es: {
    alternateName: 'Plotter de ubicación',
    browserRequirements: 'Para datos GPS en vivo se requiere permiso de geolocalización del navegador.',
    featureList: ['Posición GPS', 'COG y SOG', 'Meteorología y viento', 'Temperatura del mar', 'Hora local y UTC', 'Vigilancia meteorológica de dos días'],
  },
  sr: {
    alternateName: 'Ploter lokacije',
    browserRequirements: 'Za live GPS podatke potrebna je dozvola browsera za geolokaciju.',
    featureList: ['GPS pozicija', 'COG i SOG', 'Vreme, vetar i talas', 'Temperatura mora', 'Lokalno vreme i UTC', 'Dvodnevno vremensko upozorenje'],
  },
  zh: {
    alternateName: '位置绘图器',
    browserRequirements: '实时 GPS 数据需要浏览器地理位置权限。',
    featureList: ['GPS 位置', 'COG 和 SOG', '天气、风和海浪', '海水温度', '当地时间和 UTC', '未来两天天气关注'],
  },
};

const STATIC_TEXT_FALLBACKS = {
  'Авто': 'Auto',
  'Быстрая запись': 'Quick entry',
  'Вахты A4': 'Watches A4',
  'Вернуться к NavDesk': 'Back to NavDesk',
  'Ветер / море': 'Wind / sea',
  'Время старта': 'Start time',
  'Время:': 'Time:',
  'Всегда': 'Always',
  'Готовим три практические игры для яхтсменов и курсантов: Captain Ether для радиосвязи, прохождение по правилам и STCW-тренировку RADAR/ARPA.': 'Three practical games are being prepared for sailors and cadets: Captain Ether for radio communication, rules-of-the-road practice, and STCW RADAR/ARPA training.',
  'Группа': 'Group',
  'Дата начала': 'Start date',
  'Дата старта': 'Start date',
  'Дневной режим': 'Day mode',
  'Дней': 'Days',
  'Добавить смену': 'Add watch',
  'Добавьте смены вручную. Отдых и live watch будут считаться по этим сменам.': 'Add watch periods manually. Rest and live watch will follow these periods.',
  'Журнал готов к первой записи.': 'The log is ready for the first entry.',
  'Задайте дату, состав экипажа, режим и тип вахты. Все участвуют в расписании.': 'Set the date, crew, mode and watch type. Everyone is included in the schedule.',
  'Закрепить': 'Pin',
  'Закреплено': 'Pinned',
  'Закрыть': 'Close',
  'Закрыть промо обучающих игр': 'Close training games promo',
  'Close промо обучающих игр': 'Close training games promo',
  'Записать': 'Add entry',
  'Запись': 'Entry',
  'Имя / фамилия': 'Name / surname',
  'Капитан': 'Captain',
  'Капитан Эфир': 'Captain Ether',
  'Captain Эфир': 'Captain Ether',
  'Конец': 'End',
  'COLREGs и IALA': 'COLREGs and IALA',
  'Короткие двуязычные карточки по правилам, знакам и навигационным ситуациям.': 'Short bilingual cards for rules, marks and navigation situations.',
  'Курс': 'Course',
  'Лента': 'Feed',
  'Лист записей': 'Entry sheet',
  'Меню': 'Menu',
  'Меню кассы': 'Cashbox menu',
  'Menu кассы': 'Cashbox menu',
  'Морские игровые тренажёры': 'Maritime training games',
  'Наполнение будем делать отдельным этапом после стабилизации главной страницы штурманского стола и выноса рабочих инструментов.': 'Content will be added in a separate stage after the main Nav Desk page and working tools are stabilized.',
  'Напоминание выключено.': 'Reminder is off.',
  'Напомнить за 15 минут': 'Remind 15 minutes before',
  'Настройка вахт': 'Watch setup',
  'Начало': 'Start',
  'Не задан': 'Not set',
  'Не назначен': 'Not assigned',
  'Неделя': 'Week',
  'Нет': 'No',
  'Ночной режим': 'Night mode',
  'Обстановка и счисление': 'Situation and dead reckoning',
  'Обстановка, трафик, действия, замечания...': 'Situation, traffic, actions, remarks...',
  'Основной экипаж': 'Main crew',
  'Открыть': 'Open',
  'Открыть игру Капитан Эфир': 'Open Captain Ether game',
  'Open игру Captain Эфир': 'Open Captain Ether game',
  'Первый помощник': 'First mate',
  'Перейти на game.brkovic.ltd': 'Go to game.brkovic.ltd',
  'Переход': 'Passage',
  'Переход / маршрут': 'Passage / route',
  'Переход, экипаж и вахты': 'Passage, crew and watches',
  'Passage / маршрут': 'Passage / route',
  'Passage, экипаж и вахты': 'Passage, crew and watches',
  'Печать': 'Print',
  'Печать / PDF': 'Print / PDF',
  'Планируемая дата запуска': 'Planned launch date',
  'Промо игры Captain Ether по морской радиосвязи': 'Captain Ether maritime radio game promo',
  'Промо игры по правилам расхождения, трафику и УКВ': 'Rules-of-the-road, traffic and VHF game promo',
  'Промо STCW игры по RADAR и ARPA': 'STCW RADAR and ARPA game promo',
  'По времени': 'By time',
  'Подвахта до': 'Standby until',
  'Подвахта с': 'Standby from',
  'Подвахтенный': 'Standby watch',
  'Поделиться': 'Share',
  'Подписать смену': 'Sign watch',
  'Позиция': 'Position',
  'Позиция вводится вручную или берется с устройства.': 'Position is entered manually or taken from the device.',
  'Position вводится вручную или берется с устройства.': 'Position is entered manually or taken from the device.',
  'Последние записи': 'Latest entries',
  'Практика морских радиопереговоров: вызов, ответ, рабочий канал, краткость фраз и спокойная дисциплина связи на вахте.': 'Maritime radio practice: call, reply, working channel, short phrases and calm watch discipline.',
  'Практические фразы': 'Practical phrases',
  'Прохождение по правилам': 'Rules-of-the-road passage',
  'Режим': 'Mode',
  'Режим и подвахта': 'Mode and standby',
  'Mode и подвахта': 'Mode and standby',
  'Рекомендовать': 'Recommend',
  'Ручное расписание': 'Manual schedule',
  'Ручной': 'Manual',
  'Сделать запись': 'Make entry',
  'Сейчас': 'Now',
  'Ситуации сближения судов, приоритеты, огни, знаки, безопасное решение и короткая радиосвязь без лишней болтовни.': 'Vessel encounter situations, priorities, lights, marks, safe decisions and concise radio communication.',
  'Скорость': 'Speed',
  'Следующий этап': 'Next stage',
  'Состав:': 'Crew:',
  'Сохранить': 'Save',
  'Старший': 'Leader',
  'Старший:': 'Leader:',
  'Страница подготовлена под обучалку': 'The learning page is prepared',
  'Судовая касса': 'Ship Cashbox',
  'Суток': 'Days',
  'Сформировать': 'Build',
  'Текущая вахта': 'Current watch',
  'Тема': 'Theme',
  'Тип вахты': 'Watch type',
  'Тренировка RADAR/ARPA': 'RADAR/ARPA training',
  'УКВ и radio exchange': 'VHF and radio exchange',
  'Установить приложение': 'Install app',
  'Формулировки для перехода, захода в марину, связи с берегом и описания обстановки.': 'Phrases for passage, marina entry, shore communication and situation reports.',
  'Цели, векторы, CPA/TCPA, оценка риска столкновения и дисциплина решений на мостике в формате тренажёра.': 'Targets, vectors, CPA/TCPA, collision-risk assessment and bridge decision discipline in simulator format.',
  'Часов': 'Hours',
  'Через запятую: Иванов, Петров, Alex': 'Comma-separated: Ivanov, Petrov, Alex',
  'Шаблоны вызовов, spelling, marina, VTS, distress, urgency и safety.': 'Call templates, spelling, marina, VTS, distress, urgency and safety.',
  'Экипаж': 'Crew',
  'Язык': 'Language',
  'Языковые версии': 'Language versions',
  'Languageовые версии': 'Language versions',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absolute(pathname) {
  return new URL(pathname, SITE).href;
}

function routePath(route, lang) {
  if (lang === 'en') return route === '/' ? '/' : route;
  if (route === '/') return `/${lang}/`;
  return `/${lang}${route}`;
}

function routeUrl(route, lang) {
  return absolute(routePath(route, lang));
}

function outputFile(page, lang) {
  if (lang === 'en') return path.join(ROOT, page.source);
  const localizedPath = routePath(page.route, lang);
  if (localizedPath.endsWith('/')) return path.join(ROOT, localizedPath, 'index.html');
  return path.join(ROOT, localizedPath);
}

function attrValue(attrs, name) {
  const pattern = new RegExp(`${name}="([^"]*)"`, 'i');
  return attrs.match(pattern)?.[1] || '';
}

function setAttr(attrs, name, value) {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`\\s${name}="[^"]*"`, 'i');
  if (pattern.test(attrs)) return attrs.replace(pattern, ` ${name}="${escaped}"`);
  return `${attrs} ${name}="${escaped}"`;
}

function translateTextNodes(html, dict) {
  return html.replace(/<([a-zA-Z][\w:-]*)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, key) => {
    if (!Object.prototype.hasOwnProperty.call(dict, key)) return match;
    return `<${tag}${attrs}>${escapeHtml(dict[key])}</${tag}>`;
  }).replace(/<([a-zA-Z][\w:-]*)([^>]*\sdata-i18n-option="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, key) => {
    if (!Object.prototype.hasOwnProperty.call(dict, key)) return match;
    return `<${tag}${attrs}>${escapeHtml(dict[key])}</${tag}>`;
  });
}

function translateAttributes(html, dict) {
  const attrMap = {
    'data-i18n-placeholder': 'placeholder',
    'data-i18n-aria-label': 'aria-label',
    'data-i18n-title': 'title',
    'data-i18n-alt': 'alt',
  };
  for (const [dataAttr, targetAttr] of Object.entries(attrMap)) {
    const pattern = new RegExp(`<([a-zA-Z][\\w:-]*)([^>]*\\s${dataAttr}="([^"]+)"[^>]*)>`, 'g');
    html = html.replace(pattern, (match, tag, attrs, key) => {
      if (tag.toLowerCase() === 'html') return match;
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return match;
      return `<${tag}${setAttr(attrs, targetAttr, dict[key])}>`;
    });
  }
  return html;
}

function applyStaticTextFallbacks(html, lang) {
  if (lang === 'ru') return html;
  const entries = Object.entries(STATIC_TEXT_FALLBACKS).sort((a, b) => b[0].length - a[0].length);
  for (const [source, replacement] of entries) {
    html = html.split(source).join(replacement);
  }
  return html;
}

function setMetaName(html, name, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'i');
  const tag = `<meta name="${name}" content="${escaped}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setMetaProperty(html, property, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+property="${property}"[^>]*>`, 'i');
  const tag = `<meta property="${property}" content="${escaped}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function localeFor(lang) {
  return {
    en: 'en_US',
    ru: 'ru_RU',
    de: 'de_DE',
    it: 'it_IT',
    es: 'es_ES',
    sr: 'sr_RS',
    zh: 'zh_CN',
  }[lang] || lang;
}

function localizedTitle(html, dict, page) {
  const htmlAttrs = html.match(/<html\b([^>]*)>/i)?.[1] || '';
  const key = attrValue(htmlAttrs, 'data-i18n-title');
  const original = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  return (key && dict[key]) || (page.route === '/' ? dict.meta_title : original);
}

function localizedDescription(html, dict, page) {
  const htmlAttrs = html.match(/<html\b([^>]*)>/i)?.[1] || '';
  const key = attrValue(htmlAttrs, 'data-i18n-description');
  const original = (html.match(/<meta\s+name="description"[^>]*content="([^"]*)"/i)?.[1] || '').trim();
  return (key && dict[key]) || (page.route === '/' ? dict.meta_description : original);
}

function jsonLd(page, lang, title, description) {
  const url = routeUrl(page.route, lang);
  const orgId = absolute('/#organization');
  const websiteId = absolute('/#website');
  const graph = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: 'VETUS NAUTA - Brkovic',
      url: absolute('/'),
      logo: absolute('/brand/logo-header-inline-light.png'),
      sameAs: ['https://instagram.com/uskipper'],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: 'VETUS NAUTA - Brkovic',
      url: absolute('/'),
      publisher: { '@id': orgId },
      inLanguage: LANGS,
      copyrightHolder: { '@id': orgId },
      copyrightNotice: '© BRKOVIC / VETUS NAUTA. All rights reserved.',
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      image: absolute(page.image),
      isPartOf: { '@id': websiteId },
      ...(page.route === '/navdesk-instruments.html' ? { about: { '@id': `${url}#tool` } } : {}),
      publisher: { '@id': orgId },
      copyrightHolder: { '@id': orgId },
      copyrightNotice: '© BRKOVIC / VETUS NAUTA. All rights reserved.',
      inLanguage: lang,
    },
  ];
  if (page.schema === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.serviceName || title,
      description,
      provider: { '@id': orgId },
      areaServed: ['Montenegro', 'Croatia', 'Italy', 'Adriatic Sea'],
      serviceType: page.serviceName || 'Yacht service',
      url,
    });
  }
  if (page.schema === 'tool') {
    const instrumentSchema = page.route === '/navdesk-instruments.html'
      ? NAVDESK_INSTRUMENTS_SCHEMA[lang] || NAVDESK_INSTRUMENTS_SCHEMA.en
      : null;
    graph.push({
      '@type': 'WebApplication',
      '@id': `${url}#tool`,
      name: page.toolName || title,
      description,
      url,
      applicationCategory: 'NavigationApplication',
      operatingSystem: 'Any',
      publisher: { '@id': orgId },
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      ...(instrumentSchema || {}),
    });
  }
  if (page.schema === 'journal') {
    graph.push({
      '@type': 'Blog',
      '@id': `${url}#journal`,
      name: title,
      description,
      url,
      publisher: { '@id': orgId },
    });
  }
  if (page.schema === 'creativeWork') {
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${url}#rights`,
      name: title,
      description,
      url,
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      copyrightHolder: { '@id': orgId },
      copyrightNotice: '© BRKOVIC / VETUS NAUTA. All rights reserved.',
      license: url,
      inLanguage: lang,
    });
  }
  if (page.route !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'VETUS NAUTA - Brkovic', item: absolute('/') },
        { '@type': 'ListItem', position: 2, name: title.replace(/\s+[—-]\s+BRKOVIC.*$/i, ''), item: url },
      ],
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function alternateLinks(page) {
  return [
    `<link rel="canonical" href="${routeUrl(page.route, 'en')}" data-seo-canonical-base />`,
    `<link rel="alternate" hreflang="x-default" href="${routeUrl(page.route, 'en')}" />`,
    ...LANGS.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${routeUrl(page.route, lang)}" />`),
  ].join('\n  ');
}

function pageLinks(page, lang) {
  return [
    `<link rel="canonical" href="${routeUrl(page.route, lang)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${routeUrl(page.route, 'en')}" />`,
    ...LANGS.map((code) => `<link rel="alternate" hreflang="${code}" href="${routeUrl(page.route, code)}" />`),
  ].join('\n  ');
}

function updateHead(html, page, lang, title, description) {
  html = html.replace(/<html\b([^>]*)>/i, (match, attrs) => {
    attrs = attrs.replace(/\stitle="[^"]*"/i, '');
    attrs = setAttr(attrs, 'lang', lang);
    attrs = setAttr(attrs, 'data-static-lang', lang);
    return `<html${attrs}>`;
  });
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setMetaName(html, 'description', description);
  html = setMetaName(html, 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  html = setMetaName(html, 'author', 'VETUS NAUTA - Brkovic');
  html = setMetaName(html, 'copyright', '© BRKOVIC / VETUS NAUTA. All rights reserved.');
  html = setMetaName(html, 'rights', '© BRKOVIC / VETUS NAUTA. All rights reserved.');
  html = setMetaName(html, 'twitter:card', 'summary_large_image');
  html = setMetaName(html, 'twitter:title', title);
  html = setMetaName(html, 'twitter:description', description);
  html = setMetaName(html, 'twitter:image', absolute(page.image));
  html = setMetaProperty(html, 'og:type', page.schema === 'journal' ? 'article' : 'website');
  html = setMetaProperty(html, 'og:site_name', 'VETUS NAUTA - Brkovic');
  html = setMetaProperty(html, 'og:title', title);
  html = setMetaProperty(html, 'og:description', description);
  html = setMetaProperty(html, 'og:url', routeUrl(page.route, lang));
  html = setMetaProperty(html, 'og:image', absolute(page.image));
  html = setMetaProperty(html, 'og:locale', localeFor(lang));
  html = html.replace(/\s*<link\s+rel="canonical"[^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<link\s+rel="alternate"[^>]*hreflang="[^"]+"[^>]*>\s*/gi, '\n');
  const links = lang === 'en' ? alternateLinks(page) : pageLinks(page, lang);
  html = html.replace(/(<meta\s+name="description"[^>]*>\s*)/i, `$1\n  ${links}\n`);
  const schema = `<script type="application/ld+json" data-seo-jsonld>${jsonLd(page, lang, title, description)}</script>`;
  if (/<script\s+type="application\/ld\+json"[^>]*data-seo-jsonld[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script\s+type="application\/ld\+json"[^>]*data-seo-jsonld[^>]*>[\s\S]*?<\/script>/i, schema);
  } else {
    html = html.replace('</head>', `  ${schema}\n</head>`);
  }
  return html;
}

function rewriteGeneratedAssetUrls(html, page) {
  const resourcePrefixes = ['css/', 'js/', 'images/', 'brand/', 'favicons/', 'lang/', 'api/'];
  const localAssetBase = page.source.startsWith('ship-cashbox/') ? '/ship-cashbox/' : '/';
  return html.replace(/\b(href|src)="([^"]+)"/g, (match, attr, raw) => {
    if (/^(https?:|mailto:|tel:|#|data:|\/)/i.test(raw)) return match;
    const clean = raw.replace(/^(\.\.\/)+/, '');
    if (page.source.startsWith('ship-cashbox/') && clean.startsWith('assets/')) {
      return `${attr}="${localAssetBase}${clean}"`;
    }
    if (page.source.startsWith('ship-cashbox/') && clean === 'manifest.webmanifest') {
      return `${attr}="/ship-cashbox/manifest.webmanifest"`;
    }
    if (resourcePrefixes.some((prefix) => clean.startsWith(prefix))) {
      return `${attr}="/${clean}"`;
    }
    return match;
  });
}

function renderPage(page, lang) {
  const dict = translations[lang];
  let html = fs.readFileSync(path.join(ROOT, page.source), 'utf8');
  const title = localizedTitle(html, dict, page);
  const description = localizedDescription(html, dict, page);
  html = translateTextNodes(html, dict);
  html = translateAttributes(html, dict);
  html = applyStaticTextFallbacks(html, lang);
  html = updateHead(html, page, lang, title, description);
  if (lang !== 'en') html = rewriteGeneratedAssetUrls(html, page);
  return html;
}

function writePage(page, lang) {
  const file = outputFile(page, lang);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(page, lang));
}

function journalEntries() {
  const file = path.join(ROOT, 'data/journal-public.json');
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const urls = [];
  for (const item of data.posts || []) {
    if (item.slug) urls.push({ route: `/journal.html?slug=${encodeURIComponent(item.slug)}`, priority: '0.7', changefreq: 'weekly', lastmod: (item.updatedAt || item.publishedAt || TODAY).slice(0, 10) });
  }
  for (const group of data.groups || []) {
    if (group.slug) urls.push({ route: `/journal.html?collection=${encodeURIComponent(group.slug)}`, priority: '0.7', changefreq: 'weekly', lastmod: (group.updatedAt || TODAY).slice(0, 10) });
  }
  return urls;
}

function urlForSitemap(route, lang) {
  const [pathname, query = ''] = route.split('?');
  const localizedPath = routePath(pathname, lang);
  return absolute(query ? `${localizedPath}?${query}` : localizedPath);
}

function sitemapUrlBlock(item, locLang = 'en') {
  const loc = urlForSitemap(item.route, locLang);
  const defaultLoc = urlForSitemap(item.route, 'en');
  const alternates = [
    `<xhtml:link rel="alternate" hreflang="x-default" href="${defaultLoc}" />`,
    ...LANGS.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${urlForSitemap(item.route, lang)}" />`),
  ].map((line) => `    ${line}`).join('\n');
  return `  <url>
    <loc>${loc}</loc>
${alternates}
    <lastmod>${item.lastmod || TODAY}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
}

function writeSitemap() {
  const items = [
    ...PAGES.map((page) => ({ route: page.route, priority: page.priority, changefreq: page.changefreq, lastmod: TODAY })),
    ...journalEntries(),
  ];
  const body = items.flatMap((item) => LANGS.map((lang) => sitemapUrlBlock(item, lang))).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

for (const page of PAGES) {
  writePage(page, 'en');
  for (const lang of LOCALIZED_LANGS) {
    writePage(page, lang);
  }
}
writeSitemap();

console.log(`Generated ${PAGES.length * LANGS.length} page files and sitemap.xml`);
