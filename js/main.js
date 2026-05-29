(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function t(key, fallback) {
    return (window.__BRKOVIC_TRANSLATIONS && window.__BRKOVIC_TRANSLATIONS[key]) || fallback || key;
  }

  function getLanguageOptions() {
    const api = window.BRKOVIC_LANGUAGE;
    const options = api && typeof api.getLanguageOptions === "function"
      ? api.getLanguageOptions()
      : window.BRKOVIC_LANGUAGE_OPTIONS;
    if (!Array.isArray(options)) return [];
    return options
      .map((option) => ({
        code: String(option?.code || "").trim().toLowerCase(),
        name: String(option?.name || "").trim(),
        isDefault: option?.isDefault === true,
        isPrimary: option?.isPrimary === true,
        isAvailable: option?.isAvailable !== false
      }))
      .filter((option) => option.code && option.name);
  }

  function defaultLanguageCode() {
    const options = getLanguageOptions();
    return options.find((option) => option.isDefault && option.isAvailable)?.code
      || options.find((option) => option.isAvailable)?.code
      || options[0]?.code
      || "";
  }

  function normalizeLanguage(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const code = raw.split("-")[0];
    return getLanguageOptions().some((option) => option.code === code && option.isAvailable) ? code : "";
  }

  function removeLegacyLanguageControls(root = document) {
    root.querySelectorAll(".lang-switch, .language-switch").forEach((node) => {
      node.remove();
    });
  }

  function currentLanguage() {
    const api = window.BRKOVIC_LANGUAGE;
    if (api && typeof api.getCurrentLang === "function") return api.getCurrentLang();
    return normalizeLanguage(document.documentElement.lang) || defaultLanguageCode();
  }

  function languageOptionName(lang) {
    const code = normalizeLanguage(lang) || defaultLanguageCode();
    return getLanguageOptions().find((option) => option.code === code)?.name || code.toUpperCase();
  }

  function syncSiteMenuLanguageState(root = document, lang = currentLanguage()) {
    const activeLang = normalizeLanguage(lang) || defaultLanguageCode();
    root.querySelectorAll(".site-menu-language__option[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === activeLang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    root.querySelectorAll("[data-site-menu-current-language]").forEach((node) => {
      node.textContent = languageOptionName(activeLang);
    });
  }

  function setupSiteMenuLanguageControls(modal) {
    if (!modal || modal.dataset.languageControlsBound === "true") return;
    modal.dataset.languageControlsBound = "true";

    modal.addEventListener("click", async (event) => {
      const button = event.target.closest?.(".site-menu-language__option[data-lang]");
      if (!button || !modal.contains(button)) return;
      if (button.disabled || button.classList.contains("is-unavailable")) return;
      const api = window.BRKOVIC_LANGUAGE;
      if (!api || typeof api.setLanguage !== "function") return;
      button.disabled = true;
      try {
        await api.setLanguage(button.dataset.lang);
        syncSiteMenuLanguageState(modal, button.dataset.lang);
      } catch (error) {
        syncSiteMenuLanguageState(modal);
      } finally {
        button.disabled = false;
      }
    });

    document.addEventListener("languageChanged", (event) => {
      syncSiteMenuLanguageState(modal, event.detail?.lang);
    });
    syncSiteMenuLanguageState(modal);
  }

  function setupSiteMenuDismissal(modal) {
    if (!modal || modal.dataset.siteMenuDismissBound === "true") return;
    modal.dataset.siteMenuDismissBound = "true";
    modal.addEventListener("click", (event) => {
      const closeControl = event.target.closest?.("[data-management-modal-close]");
      if (closeControl && modal.contains(closeControl)) {
        closeSiteMenu(modal);
      }
    });
  }

  function languageIconMarkup() {
    return `
      <span class="site-menu-language__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M3 12h18"></path>
          <path d="M12 3a14 14 0 0 1 0 18"></path>
          <path d="M12 3a14 14 0 0 0 0 18"></path>
        </svg>
      </span>
    `;
  }

  function buildLanguageOptionButtons() {
    return getLanguageOptions().map((option) => `
      <button type="button" class="site-menu-language__option${option.isAvailable ? "" : " is-unavailable"}${option.isPrimary ? " is-primary" : ""}" data-lang="${escapeHtml(option.code)}" aria-pressed="false"${option.isAvailable ? "" : " aria-disabled=\"true\" disabled"}>
        <span class="site-menu-language__name">${escapeHtml(option.name)}</span>
        <span class="site-menu-language__current" data-i18n="site_menu_language_current">${escapeHtml(t("site_menu_language_current", "Current"))}</span>
        <span class="site-menu-language__primary" data-i18n="site_menu_language_primary">${escapeHtml(t("site_menu_language_primary", "Primary"))}</span>
        <span class="site-menu-language__pending" data-i18n="site_menu_language_pending">${escapeHtml(t("site_menu_language_pending", "Coming"))}</span>
      </button>
    `).join("");
  }

  function buildSiteMenuLanguageSection() {
    const languageButtons = buildLanguageOptionButtons();
    if (!languageButtons) return "";
    return `
      <section class="site-menu-language" aria-labelledby="siteMenuLanguageTitle">
        <div class="site-menu-language__head">
          ${languageIconMarkup()}
          <div>
            <p class="site-menu-language__kicker" data-i18n="site_menu_language">${escapeHtml(t("site_menu_language", "Site language"))}</p>
            <h4 id="siteMenuLanguageTitle" data-i18n="site_menu_language_title">${escapeHtml(t("site_menu_language_title", "Language versions"))}</h4>
          </div>
        </div>
        <p class="site-menu-language__status">
          <span data-i18n="site_menu_language_current_label">${escapeHtml(t("site_menu_language_current_label", "Now"))}</span>
          <strong data-site-menu-current-language>${escapeHtml(languageOptionName(currentLanguage()))}</strong>
        </p>
        <p class="site-menu-language__note" data-i18n="site_menu_language_note">${escapeHtml(t("site_menu_language_note", "English is the primary version. Other language versions will be enabled as translations are prepared."))}</p>
        <div class="site-menu-language__list" role="list">
          ${languageButtons}
        </div>
      </section>
    `;
  }

  function buildSiteMenuModalMarkup() {
    return `
      <div class="management-modal__backdrop" data-management-modal-close></div>
      <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="siteMenuTitle">
        <div class="management-modal__header">
          <div>
            <p class="section-heading__eyebrow" data-i18n="site_menu_eyebrow">${escapeHtml(t("site_menu_eyebrow", "Page controls"))}</p>
            <h3 id="siteMenuTitle" data-i18n="site_menu_title">${escapeHtml(t("site_menu_title", "Menu and settings"))}</h3>
          </div>
          <button type="button" class="management-modal__close" data-management-modal-close aria-label="${escapeHtml(t("a11y_close", "Close"))}">×</button>
        </div>
        <nav class="management-modal-nav" aria-label="${escapeHtml(t("site_menu_language", "Site language"))}">
          <a href="/index.html#hero" data-management-modal-close data-i18n="site_menu_home">${escapeHtml(t("site_menu_home", "Home"))}</a>
          <a href="/index.html#services" data-management-modal-close data-i18n="site_menu_services">${escapeHtml(t("site_menu_services", "Services"))}</a>
          <a href="/journal.html" data-management-modal-close data-i18n="site_menu_journal">${escapeHtml(t("site_menu_journal", "Deck Log"))}</a>
          <a href="/navdesk.html" data-management-modal-close data-i18n="site_menu_navdesk">${escapeHtml(t("site_menu_navdesk", "Nav Desk"))}</a>
          <a href="/index.html#contact" data-management-modal-close data-i18n="site_menu_contact">${escapeHtml(t("site_menu_contact", "Contact"))}</a>
          <a href="#" data-open-language-picker>
            <span>${escapeHtml(t("site_menu_language", "Site language"))}</span>
            <span class="site-menu-language-current" aria-hidden="true" data-site-menu-current-language>${escapeHtml(languageOptionName(currentLanguage()))}</span>
          </a>
        </nav>
      </div>
    `;
  }

  function ensureSiteMenuLanguageSection(modal) {
    if (!modal) return;
    modal.querySelectorAll(".site-menu-language").forEach((section) => section.remove());
    const markup = buildSiteMenuLanguageSection();
    if (!markup) return;
    const anchor = modal.querySelector(".site-menu-settings");
    if (anchor) {
      anchor.insertAdjacentHTML("beforebegin", markup);
      return;
    }
    const dialog = modal.querySelector(".management-modal__dialog");
    if (dialog) dialog.insertAdjacentHTML("beforeend", markup);
  }

  function buildSiteMenuPickerModal() {
    const existing = document.getElementById("siteLanguagePickerModal");
    if (existing) {
      existing.className = "management-modal site-menu-modal site-menu-language-modal";
      existing.setAttribute("aria-hidden", "true");
      existing.innerHTML = `
        <div class="management-modal__backdrop" data-management-modal-close></div>
        <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="siteLanguagePickerTitle">
          <div class="management-modal__header">
            <div>
              <p class="section-heading__eyebrow" data-i18n="site_menu_language">${escapeHtml(t("site_menu_language", "Site language"))}</p>
              <h3 id="siteLanguagePickerTitle" data-i18n="site_menu_language_title">${escapeHtml(t("site_menu_language_title", "Language versions"))}</h3>
            </div>
            <button type="button" class="management-modal__close" data-management-modal-close aria-label="${escapeHtml(t("a11y_close", "Close"))}">×</button>
          </div>
          <div class="site-menu-language"></div>
        </div>
      `;
      ensureSiteMenuLanguageSection(existing);
      setupSiteMenuLanguageControls(existing);
      return existing;
    }

    const picker = document.createElement("div");
    picker.className = "management-modal site-menu-modal site-menu-language-modal";
    picker.id = "siteLanguagePickerModal";
    picker.setAttribute("aria-hidden", "true");
    picker.innerHTML = `
      <div class="management-modal__backdrop" data-management-modal-close></div>
      <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="siteLanguagePickerTitle">
        <div class="management-modal__header">
          <div>
            <p class="section-heading__eyebrow" data-i18n="site_menu_language">${escapeHtml(t("site_menu_language", "Site language"))}</p>
            <h3 id="siteLanguagePickerTitle" data-i18n="site_menu_language_title">${escapeHtml(t("site_menu_language_title", "Language versions"))}</h3>
          </div>
          <button type="button" class="management-modal__close" data-management-modal-close aria-label="${escapeHtml(t("a11y_close", "Close"))}">×</button>
        </div>
        <div class="site-menu-language"></div>
      </div>
    `;
    document.body.appendChild(picker);
    ensureSiteMenuLanguageSection(picker);
    setupSiteMenuLanguageControls(picker);
    return picker;
  }

  function buildSiteMenuModal() {
    const existing = document.getElementById("siteMenuModal");
    if (existing) {
      existing.className = "management-modal site-menu-modal";
      existing.setAttribute("aria-hidden", "true");
      existing.innerHTML = buildSiteMenuModalMarkup();
      return existing;
    }

    const modal = document.createElement("div");
    modal.className = "management-modal site-menu-modal";
    modal.id = "siteMenuModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = buildSiteMenuModalMarkup();

    removeLegacyLanguageControls(modal);
    document.body.appendChild(modal);
    return modal;
  }

  function openSiteMenu(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("management-modal-open");
    const focusTarget = modal.querySelector("button, [href], input, select, textarea");
    if (focusTarget) setTimeout(() => focusTarget.focus(), 20);
  }

  function closeSiteMenu(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".management-modal.is-open")) {
      document.body.classList.remove("management-modal-open");
    }
  }

  function setupSiteMenu() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    let actions = topbar.querySelector(".topbar__actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "topbar__actions";
      topbar.appendChild(actions);
    }
    removeLegacyLanguageControls(document);

    let button = document.getElementById("siteMenuButton");
    if (!button) {
      button = document.createElement("button");
      button.className = "site-menu-button";
      button.type = "button";
      button.id = "siteMenuButton";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", "siteMenuModal");
      button.innerHTML = `
        <span class="site-menu-button__icon" aria-hidden="true"><span></span><span></span><span></span></span>
        <span data-i18n="site_menu_button">${escapeHtml(t("site_menu_button", "Menu"))}</span>
      `;
      actions.appendChild(button);
    }
    topbar.classList.add("topbar--site-menu");

    const modal = buildSiteMenuModal();
    const picker = buildSiteMenuPickerModal();

    setupSiteMenuLanguageControls(picker);
    setupSiteMenuLanguageControls(modal);
    setupSiteMenuDismissal(picker);
    setupSiteMenuDismissal(modal);
    if (!modal || button.dataset.siteMenuBound === "true") return;
    button.dataset.siteMenuBound = "true";

    const open = () => openSiteMenu(modal);
    button.addEventListener("click", open);
    const dockMenuButton = document.getElementById("managementDockMenuButton");
    if (dockMenuButton && dockMenuButton.dataset.siteMenuBound !== "true") {
      dockMenuButton.dataset.siteMenuBound = "true";
      dockMenuButton.addEventListener("click", open);
    }
    modal.addEventListener("click", (event) => {
      const closeControl = event.target.closest?.("[data-management-modal-close]");
      if (closeControl && modal.contains(closeControl)) closeSiteMenu(modal);
      const languageTrigger = event.target.closest?.("[data-open-language-picker]");
      if (languageTrigger && modal.contains(languageTrigger)) {
        event.preventDefault();
        closeSiteMenu(modal);
        openSiteMenu(picker);
      }
    });
    modal.querySelectorAll("a[data-management-modal-close]").forEach((link) => {
      link.addEventListener("click", () => closeSiteMenu(modal));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const openModal = document.querySelector(".management-modal.is-open");
      if (openModal) closeSiteMenu(openModal);
    });
  }

  function applyContactLinks() {
    const c = window.BRKOVIC_CONFIG;
    if (!c) return;
    const map = {
      instagramTopLink: c.instagramUrl,
      instagramLink: c.instagramUrl,
      whatsappLink: c.whatsappUrl,
      telegramLink: c.telegramUrl,
      viberLink: c.viberUrl,
      imoLink: c.imoUrl,
      callLink: `tel:${c.phoneRaw}`,
      dockWhatsapp: c.whatsappUrl,
      dockTelegram: c.telegramUrl,
      dockCall: `tel:${c.phoneRaw}`
    };
    Object.entries(map).forEach(([id, href]) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('href', href);
    });
    const year = document.getElementById('currentYear');
    if (year) year.textContent = new Date().getFullYear();
  }

  function setupCvTriggers() {
    const triggers = document.querySelectorAll('.js-cv-trigger');
    const serviceSelect = document.getElementById('serviceSelect');
    const messageField = document.getElementById('messageField');
    const requestType = document.getElementById('requestType');
    const contact = document.getElementById('contact');
    if (!triggers.length || !serviceSelect || !contact) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        serviceSelect.value = 'CV Request';
        if (requestType) requestType.value = 'cv';
        if (messageField && !messageField.value.trim()) {
          const lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
          messageField.value = lang === 'ru'
            ? 'Здравствуйте. Прошу направить CV и краткую информацию по опыту работы.'
            : 'Hello. Please send your CV and a short overview of your experience.';
        }
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstInput = contact.querySelector('input[name="name"]');
        if (firstInput) setTimeout(() => firstInput.focus(), 450);
      });
    });

    serviceSelect.addEventListener('change', () => {
      if (requestType) requestType.value = serviceSelect.value === 'CV Request' ? 'cv' : 'general';
    });
  }

  function setupServiceRequestFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get('service');
    if (!requestedService) return;

    const serviceSelect = document.getElementById('serviceSelect');
    const requestType = document.getElementById('requestType');
    const contact = document.getElementById('contact');
    if (!serviceSelect || !contact) return;

    const option = Array.from(serviceSelect.options).find((item) => item.value === requestedService);
    if (option) {
      serviceSelect.value = requestedService;
      if (requestType) requestType.value = 'general';
    }

    if (window.location.hash === '#contact') {
      setTimeout(() => contact.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    }
  }

  function setupMobileCollapsibles() {
    const collapsibles = Array.from(document.querySelectorAll("[data-mobile-collapsible]"));
    if (!collapsibles.length || !window.matchMedia) return;

    const mobileQuery = window.matchMedia("(max-width: 720px)");
    const sync = () => {
      collapsibles.forEach((item) => {
        if (mobileQuery.matches) item.removeAttribute("open");
        else item.setAttribute("open", "");
      });
    };

    sync();
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", sync);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(sync);
    }
  }

  const TOOL_AUTH_CACHE_KEY = 'brkovic_tool_auth_session_v1';
  const TOOL_AUTH_PROMPT_ID = 'toolAuthPromptModal';
  const TOOL_AUTH_CACHE_TTL_MS = 30 * 60 * 1000;

  function isLocalBackendHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local');
  }

  function buildToolAuthApiUrl(route) {
    if (isLocalBackendHost(window.location.hostname)) {
      return `/admin-api-proxy.php?path=${encodeURIComponent(route)}`;
    }
    return route;
  }

  async function toolAuthFetch(route, options = {}) {
    const response = await fetch(buildToolAuthApiUrl(route), {
      credentials: 'include',
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      body: options.body || undefined,
    });

    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch (error) {
      payload = null;
    }

    if (!response.ok || !payload || payload.success === false) {
      const message = payload?.error?.message || payload?.message || raw || response.statusText;
      const error = new Error(String(message || 'Auth request failed'));
      error.name = 'ToolAuthError';
      throw error;
    }

    return payload;
  }

  function readToolAuthCache() {
    try {
      const raw = localStorage.getItem(TOOL_AUTH_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (Date.now() > Number(parsed.expiresAt || 0)) {
        localStorage.removeItem(TOOL_AUTH_CACHE_KEY);
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeToolAuthCache(data) {
    try {
      const expiresAt = Date.now() + TOOL_AUTH_CACHE_TTL_MS;
      localStorage.setItem(
        TOOL_AUTH_CACHE_KEY,
        JSON.stringify({
          ...data,
          authenticated: Boolean(data?.authenticated),
          email: data?.email || null,
          expiresAt,
        }),
      );
    } catch (error) {}
  }

  function clearToolAuthCache() {
    try {
      localStorage.removeItem(TOOL_AUTH_CACHE_KEY);
    } catch (error) {}
  }

  async function fetchToolAuthStatus() {
    const payload = await toolAuthFetch('/api/auth/user/me');
    const data = payload && payload.data ? payload.data : null;
    if (data && data.authenticated) {
      writeToolAuthCache(data);
      return data;
    }

    clearToolAuthCache();
    return null;
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isFallbackAuthError(errorMessage, error) {
    const message = String(errorMessage || error?.message || '').toLowerCase();
    return message.includes('cannot get')
      || message.includes('cannot post')
      || message.includes('404')
      || message.includes('not found')
      || message.includes('failed to')
      || message.includes('network')
      || message.includes('fetch');
  }

  function toolAuthStatusText() {
    return {
      title: 'Доступ к инструментам',
      intro: 'Для сохранения данных, печати и экспорта на NavDesk нужен быстрый вход.',
      google: 'Google вход (скоро)',
      emailPlaceholder: 'ваш email',
      request: 'Выслать код',
      verify: 'Подтвердить',
      resend: 'Отправить повторно',
      close: 'Позже',
      codeHint: 'Введите 6-значный код из письма.',
      codeRequestSent: 'Код отправлен. Проверьте почту.',
      codeResentIn: 'Можно запросить повторно через',
      wrongCode: 'Неверный код. Проверьте число и попробуйте снова.',
      genericError: 'Не удалось выполнить вход. Проверьте интернет и повторите.',
      success: 'Вход выполнен',
      closeAria: 'Закрыть окно авторизации',
    };
  }

  async function openToolAuthPrompt() {
    return new Promise((resolve) => {
      const messages = toolAuthStatusText();
      const existing = document.getElementById(TOOL_AUTH_PROMPT_ID);
      const modal = existing || document.createElement('div');

      modal.id = TOOL_AUTH_PROMPT_ID;
      modal.className = 'management-modal site-menu-modal';
      modal.setAttribute('aria-hidden', 'false');
      modal.innerHTML = `
        <div class="management-modal__backdrop" data-tool-auth-close></div>
        <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="toolAuthPromptTitle">
          <div class="management-modal__header">
            <div>
              <h3 id="toolAuthPromptTitle">${escapeHtml(messages.title)}</h3>
              <p>${escapeHtml(messages.intro)}</p>
            </div>
            <button type="button" class="management-modal__close" data-tool-auth-close aria-label="${escapeHtml(messages.closeAria)}">×</button>
          </div>
      <div class="tool-auth-prompt__body">
        <button type="button" class="btn btn--secondary" disabled>${escapeHtml(messages.google)}</button>
        <label class="site-form__field" for="toolAuthEmail" style="margin-top:10px;display:block;">
          <span>Сейчас доступны Email-код и локальная проверка.</span>
          <input id="toolAuthEmail" type="email" autocomplete="email" inputmode="email" placeholder="${escapeHtml(messages.emailPlaceholder)}" />
            </label>
            <button type="button" class="btn btn--primary" id="toolAuthRequestCode" style="margin-top:8px;">${escapeHtml(messages.request)}</button>
            <p id="toolAuthStatus" data-tool-auth-status role="status" style="margin-top:8px;min-height:1.1em;"></p>
            <label class="site-form__field" for="toolAuthCode" style="margin-top:10px;display:block;">
              <span>${escapeHtml(messages.codeHint)}</span>
              <input id="toolAuthCode" type="text" maxlength="6" placeholder="000000" inputmode="numeric" pattern="[0-9]{6}" />
            </label>
            <button type="button" class="btn btn--primary" id="toolAuthVerify" style="margin-top:8px;">${escapeHtml(messages.verify)}</button>
          </div>
        </div>
      `;

      if (!existing) {
        document.body.appendChild(modal);
      }

      const statusEl = modal.querySelector('[data-tool-auth-status]');
      const requestBtn = modal.querySelector('#toolAuthRequestCode');
      const verifyBtn = modal.querySelector('#toolAuthVerify');
      const emailInput = modal.querySelector('#toolAuthEmail');
      const codeInput = modal.querySelector('#toolAuthCode');
      const closeButtons = modal.querySelectorAll('[data-tool-auth-close]');
      const close = (result = null) => {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('is-open');
        modal.dispatchEvent(new Event('closeToolAuthPrompt'));
        if (!document.querySelector('.management-modal.is-open')) {
          document.body.classList.remove('management-modal-open');
        }
        resolve(result === null ? { authenticated: false } : result);
      };

      const setStatus = (message) => {
        if (statusEl) statusEl.textContent = message;
      };

      let cooldownTimer = null;
      let cooldownLeft = 0;

      const setRequestState = (enabled) => {
        if (requestBtn) requestBtn.disabled = !enabled;
      };

      const tickCooldown = () => {
        if (cooldownLeft <= 0) {
          if (requestBtn) {
            requestBtn.disabled = false;
            requestBtn.textContent = messages.request;
          }
          return;
        }
        cooldownLeft -= 1;
        if (requestBtn) requestBtn.textContent = `${messages.resend} (${cooldownLeft}s)`;
        cooldownTimer = setTimeout(tickCooldown, 1000);
      };

      const startCooldown = () => {
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownLeft = 55;
        requestBtn && (requestBtn.disabled = true);
        tickCooldown();
      };

      const tryRequestCode = async () => {
        try {
          const email = normalizeEmail(emailInput?.value);
          if (!email) {
            setStatus('Введите email.');
            return;
          }
          localStorage.setItem('brkovic_tool_auth_email', email);
          setStatus(messages.codeRequestSent);
          const payload = await toolAuthFetch('/api/auth/user/request-code', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });
          const debugCode = payload?.data?.debugCode;
          if (debugCode) {
            setStatus(`${messages.codeRequestSent} Код: ${debugCode}`);
          } else {
            setStatus(messages.codeRequestSent);
          }
          if (codeInput) codeInput.focus();
          startCooldown();
        } catch (error) {
          const fallback = isFallbackAuthError(error?.message, error)
            ? 'Сейчас сервис проверки еще не включен на текущем сервере.'
            : (error?.message || messages.genericError);
          setStatus(fallback);
        }
      };

      const tryVerify = async () => {
        try {
          const email = normalizeEmail(emailInput?.value);
          const code = String(codeInput?.value || '').replace(/\D/g, '').trim();
          if (!email || code.length !== 6) {
            setStatus('Введите email и 6-значный код.');
            return;
          }
          const payload = await toolAuthFetch('/api/auth/user/verify-code', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
          });
          const verified = payload && payload.data ? payload.data : null;
          if (!verified || verified.authenticated === false) {
            setStatus(messages.wrongCode);
            return;
          }
          writeToolAuthCache({
            authenticated: true,
            email: verified.email || email,
            displayName: verified.displayName || null,
            authProvider: verified.authProvider || 'email',
            sessionExpiresAt: verified.sessionExpiresAt,
          });
          setStatus(messages.success);
          close({ authenticated: true, profile: verified });
        } catch (error) {
          setStatus(error?.message || messages.wrongCode);
        }
      };

      if (requestBtn) requestBtn.addEventListener('click', tryRequestCode, { once: false });
      if (verifyBtn) verifyBtn.addEventListener('click', tryVerify, { once: false });
      closeButtons.forEach((button) => button.addEventListener('click', close, { once: false }));
      modal.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        close();
      }, { once: false });

      modal.classList.add('is-open');
      document.body.classList.add('management-modal-open');
      if (emailInput) {
        emailInput.value = normalizeEmail(localStorage.getItem('brkovic_tool_auth_email') || '');
        emailInput.focus();
      }

      const cleanup = () => {
        if (cooldownTimer) clearTimeout(cooldownTimer);
      };

      modal.addEventListener('remove', cleanup, { once: true });
      modal.addEventListener('closeToolAuthPrompt', cleanup, { once: true });
    });
  }

  async function ensureToolAccess() {
    const cached = readToolAuthCache();
    if (cached && cached.authenticated) {
      return true;
    }

    const status = await fetchToolAuthStatus().catch(() => null);
    if (status && status.authenticated) {
      return true;
    }

    const result = await openToolAuthPrompt();
    if (result && result.authenticated) {
      return true;
    }

    return false;
  }

  function isToolActionCandidate(target) {
    if (!target) return false;
    if (target.closest('[data-tool-auth-action]')) {
      return true;
    }
    const id = String(target.id || '').toLowerCase();

    if (!id) {
      return Boolean(target.closest('.navdesk-tool-card'));
    }

    if (/_(pin|toggle)$/.test(id)) return false;
    if (target.closest('.navdesk-hero__actions')) return false;
    if (target.id === 'navdeskModalAccept') return false;
    return /(save|print|pdf|share|copy|entry|gps|sign|apply|add|run|load|calc|schedule|manual|watch|entries|reset|export|watch)/i.test(id);
  }

  function bindToolActionAuthGate() {
    if (!document.querySelector('.navdesk-page')) return;

    document.addEventListener('click', async (event) => {
      const target = event.target.closest('.navdesk-page button[id], .navdesk-page .navdesk-tool-card, .navdesk-page a[href^="navdesk-"]');
      if (!target) return;
      if (target.dataset && target.dataset.toolAuthReplay === '1') {
        delete target.dataset.toolAuthReplay;
        return;
      }
      if (!isToolActionCandidate(target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        const allowed = await ensureToolAccess();
        if (!allowed) return;

        target.dataset.toolAuthReplay = '1';
        if (target.tagName === 'A') {
          const href = target.getAttribute('href');
          if (href) window.location.href = href;
          return;
        }
        setTimeout(() => target.click(), 10);
      } catch (error) {
        const status = error?.message || 'Не удалось проверить авторизацию.';
        const fallback = isFallbackAuthError(status, error)
          ? 'Сервис авторизации для инструментов пока недоступен.'
          : status;
        const existingPrompt = document.getElementById(TOOL_AUTH_PROMPT_ID);
        if (existingPrompt) {
          const statusEl = existingPrompt.querySelector('[data-tool-auth-status]');
          if (statusEl) statusEl.textContent = fallback;
        }
      }
    }, { capture: true });
  }

  window.ensureToolAccess = ensureToolAccess;
  window.openToolAuthPrompt = openToolAuthPrompt;

  document.addEventListener('DOMContentLoaded', () => {
    setupSiteMenu();
    applyContactLinks();
    setupCvTriggers();
    setupServiceRequestFromUrl();
    setupMobileCollapsibles();
    bindToolActionAuthGate();
  });
})();
