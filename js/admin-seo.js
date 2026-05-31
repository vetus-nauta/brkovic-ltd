(function () {
  const auth = window.BRKOVIC_ADMIN_AUTH;
  const SETTINGS_KEY = 'brkovic_admin_seo_settings_v1';
  const SEO_API = '/admin-seo-api.php?action=';
  const LANGS = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh'];
  const PAGES = [
    { path: '/', label: 'Главная', type: 'home' },
    { path: '/journal.html', label: 'Судовой журнал', type: 'journal' },
    { path: '/navdesk.html', label: 'Штурманский стол', type: 'tool' },
    { path: '/ship-cashbox/index.html', label: 'Судовая касса', type: 'tool' },
    { path: '/navdesk-route.html', label: 'Ортодромия и локсодромия', type: 'tool' },
    { path: '/navdesk-tides.html', label: 'Приливы и окно прохода', type: 'tool' },
    { path: '/navdesk-ukv.html', label: 'УКВ и шаблоны', type: 'tool' },
    { path: '/navdesk-watch.html', label: 'Вахтенный журнал', type: 'tool' },
    { path: '/navdesk-english.html', label: 'Maritime English', type: 'tool' },
    { path: '/services/yacht-management.html', label: 'Yacht Management', type: 'service' },
    { path: '/services/iyt-training.html', label: 'IYT Training', type: 'service' },
    { path: '/services/skipper-service.html', label: 'Skipper Service', type: 'service' },
    { path: '/services/sailing-tours.html', label: 'Sailing Tours', type: 'service' },
    { path: '/services/yacht-acceptance-delivery.html', label: 'Acceptance & Delivery', type: 'service' },
    { path: '/services/yacht-registration.html', label: 'Yacht Registration', type: 'service' },
    { path: '/copyright.html', label: 'Авторские права', type: 'legal' },
  ];
  const SETTING_IDS = [
    'gscVerificationHost',
    'gscVerificationValue',
    'ga4MeasurementId',
    'gtmContainerId',
    'bingVerification',
    'yandexVerification',
    'clarityId',
    'metaPixelId',
    'indexNowKey',
  ];

  const form = document.getElementById('seoLoginForm');
  const workspace = document.getElementById('seoWorkspace');
  const status = document.getElementById('seoStatus');
  const pageList = document.getElementById('seoPageList');
  const details = document.getElementById('seoDetails');
  const log = document.getElementById('seoConsoleLog');
  const summaryCards = document.getElementById('seoSummaryCards');
  const aiPrompt = document.getElementById('seoAiPrompt');
  let pageResults = [];
  let currentFilter = 'all';
  let selectedPath = '/';

  function setStatus(text, tone = 'info') {
    if (!status) return;
    status.textContent = text || '';
    status.dataset.tone = tone;
  }

  function line(text, tone = 'info') {
    if (!log) return;
    const row = document.createElement('div');
    row.className = `seo-console-line seo-console-line--${tone}`;
    row.textContent = `[${new Date().toLocaleTimeString('ru-RU')}] ${text}`;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function clearLog() {
    if (log) log.innerHTML = '';
  }

  function abs(path) {
    return new URL(path, window.location.origin).href;
  }

  function pageFetchPath(path) {
    return path === '/' ? '/index.html' : path;
  }

  async function seoApi(action, options = {}) {
    const response = await fetch(`${SEO_API}${encodeURIComponent(action)}`, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      const message = data?.error?.message || `SEO API: HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.body = data;
      throw error;
    }
    return data?.data || data;
  }

  function toneFor(issues) {
    if (issues.some((issue) => issue.level === 'error')) return 'error';
    if (issues.some((issue) => issue.level === 'warning')) return 'warning';
    return 'ok';
  }

  function metaContent(doc, selector) {
    return doc.querySelector(selector)?.getAttribute('content')?.trim() || '';
  }

  function linkHref(doc, selector) {
    return doc.querySelector(selector)?.getAttribute('href')?.trim() || '';
  }

  function parseJsonLd(doc) {
    return Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
      .map((node) => {
        try {
          return JSON.parse(node.textContent || '{}');
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  async function fetchText(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  }

  async function auditPageInBrowser(page) {
    const html = await fetchText(pageFetchPath(page.path));
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const title = (doc.querySelector('title')?.textContent || '').trim();
    const description = metaContent(doc, 'meta[name="description"]');
    const robots = metaContent(doc, 'meta[name="robots"]');
    const canonical = linkHref(doc, 'link[rel="canonical"]');
    const ogTitle = metaContent(doc, 'meta[property="og:title"]');
    const ogDescription = metaContent(doc, 'meta[property="og:description"]');
    const ogImage = metaContent(doc, 'meta[property="og:image"]');
    const twitterTitle = metaContent(doc, 'meta[name="twitter:title"]');
    const seoScript = !!doc.querySelector('script[src*="js/seo.js"]');
    const jsonLd = parseJsonLd(doc);
    const hreflangs = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]')).map((node) => node.getAttribute('hreflang'));
    const issues = [];

    if (!title) issues.push({ level: 'error', text: 'Нет title.' });
    else if (title.length > 75) issues.push({ level: 'warning', text: `Title длинный: ${title.length} символов.` });
    if (!description) issues.push({ level: 'error', text: 'Нет meta description.' });
    else if (description.length > 175) issues.push({ level: 'warning', text: `Description длинный: ${description.length} символов.` });
    if (!canonical) issues.push({ level: 'error', text: 'Нет canonical.' });
    if (robots.toLowerCase().includes('noindex')) issues.push({ level: 'error', text: 'Страница закрыта noindex.' });
    if (!robots) issues.push({ level: 'warning', text: 'Нет robots meta.' });
    if (!ogTitle || !ogDescription || !ogImage) issues.push({ level: 'warning', text: 'Open Graph заполнен не полностью.' });
    if (!twitterTitle) issues.push({ level: 'warning', text: 'Twitter Card заполнен не полностью.' });
    if (!seoScript) issues.push({ level: 'warning', text: 'Не подключен js/seo.js.' });
    if (!jsonLd.length) issues.push({ level: 'warning', text: 'Нет JSON-LD.' });
    if (!LANGS.every((lang) => hreflangs.includes(lang)) || !hreflangs.includes('x-default')) {
      issues.push({ level: 'warning', text: 'Hreflang покрытие неполное.' });
    }
    if (page.path !== '/copyright.html' && !html.includes('copyright.html')) {
      issues.push({ level: 'warning', text: 'В футере не найдена ссылка на авторские права.' });
    }

    return {
      ...page,
      title,
      description,
      canonical,
      robots,
      hreflangs,
      jsonLdCount: jsonLd.length,
      ogTitle,
      ogDescription,
      ogImage,
      issues,
      tone: toneFor(issues),
    };
  }

  function renderSummary(extra = {}) {
    const total = pageResults.length;
    const errors = pageResults.filter((item) => item.tone === 'error').length;
    const warnings = pageResults.filter((item) => item.tone === 'warning').length;
    const ok = pageResults.filter((item) => item.tone === 'ok').length;
    const cards = [
      { label: 'Готово', value: ok, tone: ok ? 'ok' : 'idle' },
      { label: 'Нужно проверить', value: warnings, tone: warnings ? 'warning' : 'idle' },
      { label: 'Ошибки', value: errors, tone: errors ? 'error' : 'idle' },
      { label: extra.sitemap ? 'Sitemap URL' : 'Страниц', value: extra.sitemap || total, tone: 'idle' },
    ];
    summaryCards.innerHTML = cards.map((card) => `
      <article class="admin-status-card admin-status-card--${card.tone}">
        <strong>${card.value}</strong>
        <span>${card.label}</span>
      </article>
    `).join('');
  }

  function filteredResults() {
    if (currentFilter === 'all') return pageResults;
    return pageResults.filter((item) => item.tone === currentFilter);
  }

  function renderPages() {
    const results = filteredResults();
    pageList.innerHTML = results.map((item) => `
      <button type="button" class="seo-page-item${item.path === selectedPath ? ' is-active' : ''}" data-path="${item.path}" data-tone="${item.tone || 'idle'}">
        <strong>${item.label}</strong>
        <span>${item.path}</span>
        <span>${item.issues?.length ? `${item.issues.length} замеч.` : 'готово'}</span>
      </button>
    `).join('') || '<div class="admin-post-meta">Нет страниц под выбранный фильтр.</div>';
    renderDetails(pageResults.find((item) => item.path === selectedPath) || pageResults[0]);
  }

  function renderDetails(item) {
    if (!item) {
      details.innerHTML = '<div class="admin-post-meta">Запустите серверный аудит сайта.</div>';
      return;
    }
    selectedPath = item.path;
    const issues = Array.isArray(item.issues) ? item.issues : [];
    const issueHtml = issues.length
      ? issues.map((issue) => `<div class="seo-detail-row"><strong>${issue.level === 'error' ? 'Ошибка' : 'Проверить'}</strong><span>${issue.text}</span></div>`).join('')
      : '<div class="seo-detail-row"><strong>Статус</strong><span>Критических замечаний нет.</span></div>';

    details.innerHTML = `
      <div class="seo-detail-row"><strong>URL</strong><span>${item.path}</span></div>
      <div class="seo-detail-row"><strong>Title</strong><span>${item.title || 'нет'}</span></div>
      <div class="seo-detail-row"><strong>Description</strong><span>${item.description || 'нет'}</span></div>
      <div class="seo-detail-row"><strong>Canonical</strong><span>${item.canonical || 'нет'}</span></div>
      <div class="seo-detail-row"><strong>Hreflang</strong><span>${item.hreflangs?.join(', ') || 'нет'}</span></div>
      <div class="seo-detail-row"><strong>JSON-LD</strong><span>${item.jsonLdCount || 0} блок(ов)</span></div>
      ${issueHtml}
    `;
  }

  function fillSettings(settings = {}) {
    SETTING_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = settings[id] || '';
        applySecretState(input, false);
      }
    });
  }

  function collectSettings() {
    const data = {};
    SETTING_IDS.forEach((id) => {
      data[id] = document.getElementById(id)?.value.trim() || '';
    });
    return data;
  }

  function applySecretState(input, revealed) {
    const hasValue = input.value.trim() !== '';
    input.type = revealed ? 'text' : 'password';
    input.classList.toggle('is-secret-filled', hasValue);
    input.classList.toggle('is-secret-revealed', revealed);
    input.closest('.seo-secret-control')?.classList.toggle('is-revealed', revealed);
    input.closest('.seo-secret-control')?.classList.toggle('has-value', hasValue);
  }

  function installSecretControls() {
    SETTING_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.closest('.seo-secret-control')) return;
      input.autocomplete = 'off';
      input.spellcheck = false;

      const wrapper = document.createElement('span');
      wrapper.className = 'seo-secret-control';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'seo-secret-reveal';
      button.setAttribute('aria-label', 'Удерживать, чтобы показать идентификатор');
      button.setAttribute('data-admin-tooltip', 'Удерживать: показать. Отпустить: скрыть.');
      wrapper.appendChild(button);

      const reveal = (event) => {
        event.preventDefault();
        applySecretState(input, true);
      };
      const hide = () => applySecretState(input, false);

      button.addEventListener('pointerdown', reveal);
      button.addEventListener('pointerup', hide);
      button.addEventListener('pointercancel', hide);
      button.addEventListener('pointerleave', hide);
      button.addEventListener('blur', hide);
      button.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.key === 'Enter') reveal(event);
      });
      button.addEventListener('keyup', hide);
      input.addEventListener('input', () => applySecretState(input, false));
      applySecretState(input, false);
    });
  }

  async function loadSettings() {
    try {
      const data = await seoApi('settings');
      fillSettings(data.settings || {});
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings || {}));
      line('settings: серверная карта идентификаторов загружена', 'ok');
    } catch (error) {
      let data = {};
      try {
        data = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      } catch {
        data = {};
      }
      fillSettings(data);
      line(`settings: сервер недоступен, открыт локальный fallback (${error.message})`, 'warn');
    }
  }

  async function saveSettings() {
    const data = collectSettings();
    try {
      const result = await seoApi('settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      fillSettings(result.settings || data);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(result.settings || data));
      line('settings: карта идентификаторов сохранена на сервере', 'ok');
      setStatus('SEO-настройки сохранены на сервере.', 'success');
    } catch (error) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      line(`settings: сервер не принял сохранение, fallback в браузере (${error.message})`, 'warn');
      setStatus('Сохранено локально. Серверное сохранение недоступно.', 'error');
    }
  }

  function renderServerAudit(data) {
    pageResults = Array.isArray(data.pages) ? data.pages : [];
    renderSummary({ sitemap: data.sitemap?.urls || 0 });
    renderPages();
    line(`audit:server страниц ${data.summary?.total ?? pageResults.length}, готово ${data.summary?.ok ?? 0}, проверить ${data.summary?.warning ?? 0}, ошибок ${data.summary?.error ?? 0}`, 'info');
    line(`audit:sitemap URL ${data.sitemap?.urls ?? 0}, hreflang ${data.sitemap?.hreflangLinks ?? 0}`, data.sitemap?.ok ? 'ok' : 'warn');
    line(`audit:robots sitemap ${data.robots?.hasSitemap ? 'есть' : 'нет'}, admin/API закрыты ${data.robots?.blocksAdmin ? 'да' : 'проверить'}`, data.robots?.ok ? 'ok' : 'warn');
    if (data.searchConsole?.configured) {
      line(`search-console: TXT ${data.searchConsole.host || '@'} ${data.searchConsole.dnsFound ? 'найден в DNS' : 'сохранен, но DNS не подтвердил'}`, data.searchConsole.dnsFound ? 'ok' : 'warn');
    }
    if (data.analytics?.configured) {
      line(`analytics: GA4 ${data.analytics.ga4MeasurementId} ${data.analytics.connected ? 'подключен' : 'сохранен, но не подключен'}`, data.analytics.connected ? 'ok' : 'warn');
    }
    if (data.analytics?.clarityConfigured) {
      line(`clarity: Microsoft Clarity ${data.analytics.clarityConnected ? 'подключен' : 'сохранен, но не подключен'}`, data.analytics.clarityConnected ? 'ok' : 'warn');
    }
  }

  async function runServerAudit() {
    clearLog();
    setStatus('Сервер проверяет сайт...');
    try {
      const data = await seoApi('audit');
      renderServerAudit(data);
      setStatus('Серверный аудит завершен.', 'success');
    } catch (error) {
      line(`server:audit ${error.message}`, 'error');
      setStatus('Серверный аудит недоступен. Запускаю браузерный fallback.', 'error');
      await runBrowserPageAudit();
    }
  }

  async function runBrowserPageAudit() {
    line('audit:browser fallback старт', 'info');
    const results = [];
    for (const page of PAGES) {
      try {
        const result = await auditPageInBrowser(page);
        results.push(result);
        line(`${result.tone === 'ok' ? 'OK' : result.tone.toUpperCase()} ${page.path} — ${result.issues.length || 'без'} замечаний`, result.tone === 'ok' ? 'ok' : result.tone === 'error' ? 'error' : 'warn');
      } catch (error) {
        results.push({ ...page, issues: [{ level: 'error', text: error.message }], tone: 'error' });
        line(`ERROR ${page.path} — ${error.message}`, 'error');
      }
    }
    pageResults = results;
    renderSummary();
    renderPages();
  }

  async function runSitemapAudit() {
    clearLog();
    try {
      const data = await seoApi('audit');
      line(`sitemap: URL ${data.sitemap?.urls ?? 0}`, data.sitemap?.ok ? 'ok' : 'warn');
      line(`sitemap: copyright.html ${data.sitemap?.copyrightFound ? 'есть' : 'нет'}`, data.sitemap?.copyrightFound ? 'ok' : 'error');
      line(`sitemap: hreflang-ссылки ${data.sitemap?.hreflangLinks ?? 0}`, data.sitemap?.hreflangLinks ? 'ok' : 'warn');
    } catch (error) {
      line(`sitemap: ${error.message}`, 'error');
    }
  }

  async function runRobotsAudit() {
    clearLog();
    try {
      const data = await seoApi('audit');
      line(`robots: sitemap directive ${data.robots?.hasSitemap ? 'есть' : 'нет'}`, data.robots?.hasSitemap ? 'ok' : 'error');
      line(`robots: admin/API закрыты ${data.robots?.blocksAdmin ? 'да' : 'проверить'}`, data.robots?.blocksAdmin ? 'ok' : 'warn');
    } catch (error) {
      line(`robots: ${error.message}`, 'error');
    }
  }

  function prepareSitemapBuild() {
    const urls = PAGES.map((item) => abs(item.path));
    line('sitemap-map: публичная карта URL для контроля', 'info');
    urls.forEach((url) => line(url, 'info'));
    line('Серверный аудит уже читает реальный sitemap.xml. Автоперезапись карты будет отдельной whitelist-командой после следующего этапа.', 'warn');
  }

  async function createIndexNowKey() {
    setStatus('Создаем IndexNow key-файл...');
    try {
      const data = await seoApi('indexnow-key', {
        method: 'POST',
        body: JSON.stringify({ force: false }),
      });
      const input = document.getElementById('indexNowKey');
      if (input) input.value = data.key || '';
      line(`indexnow:key создан/проверен: ${data.keyLocation}`, 'ok');
      setStatus('IndexNow key-файл готов.', 'success');
      await saveSettings();
    } catch (error) {
      line(`indexnow:key ${error.message}`, 'error');
      setStatus('Не удалось создать IndexNow key.', 'error');
    }
  }

  async function submitIndexNow() {
    const urls = pageResults.length ? pageResults.map((item) => abs(item.path)) : PAGES.map((item) => abs(item.path));
    setStatus('Отправляем URL через IndexNow...');
    try {
      const data = await seoApi('indexnow-submit', {
        method: 'POST',
        body: JSON.stringify({ urlList: urls }),
      });
      line(`indexnow: HTTP ${data.status}, URL отправлено ${data.submittedUrls?.length || 0}`, data.accepted ? 'ok' : 'warn');
      if (data.response) line(`indexnow: ${data.response}`, 'info');
      if (data.curlError) line(`indexnow: ${data.curlError}`, 'warn');
      setStatus(data.accepted ? 'IndexNow принял URL.' : 'IndexNow ответил неуспешным статусом.', data.accepted ? 'success' : 'error');
    } catch (error) {
      line(`indexnow: ${error.message}`, 'error');
      setStatus('IndexNow отправка не выполнена.', 'error');
    }
  }

  function prepareAiTask() {
    const item = pageResults.find((result) => result.path === selectedPath) || pageResults[0] || PAGES[0];
    const prompt = [
      'Роль: SEO-редактор VETUS NAUTA - Brkovic.',
      'Задача: сделать литературный SEO-аудит страницы без автопубликации.',
      `URL: ${abs(item.path)}`,
      `Тип: ${item.type || 'page'}`,
      `Текущий title: ${item.title || 'не проверено'}`,
      `Текущий description: ${item.description || 'не проверено'}`,
      'Языки: en, ru, de, it, es, sr, zh.',
      'Нужно вернуть: короткий диагноз, новый title/description для каждого языка, список внутренних ссылок, риск переспама, рекомендации по H1/H2.',
      'Дисциплина: не менять сайт автоматически; сначала черновик, затем ручное принятие.',
    ].join('\n');
    aiPrompt.value = prompt;
    line(`ai:task подготовлено ТЗ для ${item.path}`, 'ok');
  }

  async function requestAiDraft() {
    prepareAiTask();
    const item = pageResults.find((result) => result.path === selectedPath) || pageResults[0] || PAGES[0];
    setStatus('AI готовит SEO-черновик...');
    try {
      const data = await seoApi('ai-draft', {
        method: 'POST',
        body: JSON.stringify({
          path: item.path,
          prompt: aiPrompt.value || '',
        }),
      });
      if (data.available === false) {
        line(`ai: ${data.message}`, 'warn');
        setStatus('AI-ядро готово, ключ OpenAI не найден на сервере.', 'error');
        return;
      }
      if (data.ok === false) {
        line(`ai: ${data.message || 'OpenAI вернул ошибку'} HTTP ${data.status || ''}`, 'error');
        if (data.response) line(data.response, 'warn');
        setStatus('AI-черновик не получен.', 'error');
        return;
      }
      aiPrompt.value = data.draft || 'AI вернул пустой черновик.';
      line(`ai:draft готов через ${data.model || 'OpenAI Responses API'}`, 'ok');
      setStatus('AI-черновик готов. Автопубликация выключена.', 'success');
    } catch (error) {
      line(`ai:draft ${error.message}`, 'error');
      setStatus('AI-черновик не получен.', 'error');
    }
  }

  async function initAuth() {
    if (!auth) {
      setStatus('Модуль авторизации не загружен.', 'error');
      return;
    }
    setStatus('Проверяем сессию...');
    const loggedIn = await auth.checkSession();
    if (form) form.hidden = loggedIn;
    workspace.hidden = !loggedIn;
    setStatus(loggedIn ? 'SEO Admin открыт.' : 'Общая авторизация владельца не найдена.', loggedIn ? 'success' : 'info');
    if (loggedIn) {
      pageResults = PAGES.map((page) => ({ ...page, issues: [], tone: 'idle' }));
      renderSummary();
      renderPages();
      await loadSettings();
      line('SEO Console готова. Рабочая машина включена: серверный аудит, IndexNow, AI-черновик.', 'info');
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('seoEmail')?.value.trim();
    const password = document.getElementById('seoPassword')?.value || '';
    if (!email || !password) return;
    setStatus('Входим...');
    try {
      await auth.login(email, password);
      await initAuth();
    } catch (error) {
      setStatus(error.message || 'Не удалось войти.', 'error');
    }
  });

  document.getElementById('saveSeoSettingsBtn')?.addEventListener('click', saveSettings);
  document.getElementById('runFullAuditBtn')?.addEventListener('click', runServerAudit);
  document.getElementById('runSitemapAuditBtn')?.addEventListener('click', runSitemapAudit);
  document.getElementById('runRobotsAuditBtn')?.addEventListener('click', runRobotsAudit);
  document.getElementById('refreshSeoPagesBtn')?.addEventListener('click', runServerAudit);
  document.getElementById('prepareSitemapBuildBtn')?.addEventListener('click', prepareSitemapBuild);
  document.getElementById('prepareIndexNowBtn')?.addEventListener('click', createIndexNowKey);
  document.getElementById('submitIndexNowBtn')?.addEventListener('click', submitIndexNow);
  document.getElementById('prepareAiTaskBtn')?.addEventListener('click', requestAiDraft);
  document.getElementById('copyAiPromptBtn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt.value || '');
      line('ai:prompt скопирован', 'ok');
    } catch {
      line('ai:prompt не удалось скопировать автоматически', 'warn');
    }
  });

  document.querySelectorAll('[data-seo-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.seoFilter || 'all';
      document.querySelectorAll('[data-seo-filter]').forEach((node) => node.classList.toggle('is-active', node === button));
      renderPages();
    });
  });

  pageList?.addEventListener('click', (event) => {
    const button = event.target.closest('.seo-page-item');
    if (!button) return;
    selectedPath = button.dataset.path || selectedPath;
    pageList.querySelectorAll('.seo-page-item').forEach((node) => node.classList.toggle('is-active', node === button));
    renderDetails(pageResults.find((item) => item.path === selectedPath));
  });

  installSecretControls();
  initAuth();
})();
