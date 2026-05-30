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
        <section class="site-menu-account" data-tool-account-panel hidden></section>
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
    ensureToolAccountButton(actions);

    const modal = buildSiteMenuModal();
    const picker = buildSiteMenuPickerModal();

    setupSiteMenuLanguageControls(picker);
    setupSiteMenuLanguageControls(modal);
    setupSiteMenuDismissal(picker);
    setupSiteMenuDismissal(modal);
    syncToolAccountUi();
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
      instagramFooterLink: c.instagramUrl,
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
  const TOOL_AUTH_PROXY_PATH = '/admin-api-proxy.php';
  let toolAuthStatusPromise = null;

  function buildToolAuthApiUrl(route) {
    return `${TOOL_AUTH_PROXY_PATH}?path=${encodeURIComponent(route)}`;
  }

  async function toolAuthFetch(route, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const body = options.body === undefined && method === 'POST' ? '{}' : options.body;
    const sanitizeRaw = (value) => String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();

    const response = await fetch(buildToolAuthApiUrl(route), {
      credentials: 'include',
      method,
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      body,
    });

    const raw = await response.text();
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const isHtmlResponse = contentType.includes('text/html') || /^\s*</.test(raw);
    if (isHtmlResponse) {
      const htmlLower = sanitizeRaw(raw).toLowerCase();
      const isFirewallBlock = htmlLower.includes('firewall') && htmlLower.includes('blocking your connection');
      const isCaptcha = htmlLower.includes('recaptcha') || htmlLower.includes('unblock');
      const isCloudHostBlock = isFirewallBlock || htmlLower.includes('unauthorized access') || htmlLower.includes('contact server owner');
      const message = isCloudHostBlock
        ? 'Запрос заблокирован защитой хостинга (cloud web-server). Проверьте доступ к домену и/или пройдите капчу.'
        : (isFirewallBlock || isCaptcha
          ? 'Запрос заблокирован веб-паролем провайдера. Нужно пройти проверку и повторить запрос.'
          : 'Сервис авторизации недоступен в этом канале сейчас.');
      const error = new Error(message);
      error.payload = {
        error: {
          code: 'HTTP_NON_JSON',
          message,
        },
      };
      error.status = response.status;
      error.retryAfter = response.headers.get('Retry-After') || null;
      error.name = 'ToolAuthError';
      throw error;
    }

    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch (error) {
      payload = null;
    }

    if (!response.ok || !payload || payload.success === false) {
      const message = payload?.error?.message || payload?.message || raw || response.statusText;
      const retryAfterHeader = response.headers.get('Retry-After');
      const error = new Error(String(message || 'Auth request failed'));
      error.payload = payload;
      error.status = response.status;
      error.retryAfter = retryAfterHeader || null;
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
      const existing = readToolAuthCache();
      const expiresAt = Date.now() + TOOL_AUTH_CACHE_TTL_MS;
      localStorage.setItem(
        TOOL_AUTH_CACHE_KEY,
        JSON.stringify({
          ...(existing || {}),
          ...data,
          authenticated: Boolean(data?.authenticated),
          email: data?.email || null,
          displayName: data?.displayName || existing?.displayName || null,
          avatarUrl: data?.avatarUrl || existing?.avatarUrl || null,
          authProvider: data?.authProvider || existing?.authProvider || 'email',
          sessionExpiresAt: data?.sessionExpiresAt || existing?.sessionExpiresAt || null,
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

  function toolAccountInitial(profile) {
    const source = String(profile?.displayName || profile?.email || 'B').trim();
    return (source[0] || 'B').toUpperCase();
  }

  function toolAccountProviderLabel(profile) {
    const provider = String(profile?.authProvider || '').toLowerCase();
    if (provider === 'google') return 'Google';
    if (provider === 'email') return 'Email-код';
    return provider || 'Аккаунт';
  }

  function ensureToolAccountButton(actions) {
    if (!actions || document.getElementById('toolAccountButton')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'toolAccountButton';
    button.className = 'tool-account-button';
    button.hidden = true;
    button.setAttribute('aria-label', 'Аккаунт');
    button.innerHTML = '<span class="tool-account-button__avatar" data-tool-account-avatar>B</span>';
    actions.insertBefore(button, actions.firstChild);
    button.addEventListener('click', () => {
      const modal = buildToolAccountModal();
      openSiteMenu(modal);
    });
  }

  function renderToolAccountAvatar(container, profile) {
    if (!container) return;
    const avatarUrl = String(profile?.avatarUrl || '').trim();
    if (avatarUrl) {
      container.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="" referrerpolicy="no-referrer" />`;
      return;
    }
    container.innerHTML = `<span>${escapeHtml(toolAccountInitial(profile))}</span>`;
  }

  function renderToolAccountPanel(profile, root = document) {
    const panel = root.querySelector?.('[data-tool-account-panel]');
    if (!panel) return;
    const isAuthenticated = Boolean(profile?.authenticated);
    panel.hidden = !isAuthenticated;
    if (!isAuthenticated) {
      panel.innerHTML = '';
      return;
    }

    const displayName = profile.displayName || profile.email || 'Brkovic account';
    const email = profile.email || '';
    panel.innerHTML = `
      <div class="site-menu-account__head">
        <span class="site-menu-account__avatar" data-tool-account-avatar></span>
        <div>
          <p class="site-menu-account__label">Аккаунт</p>
          <strong>${escapeHtml(displayName)}</strong>
          ${email ? `<span>${escapeHtml(email)}</span>` : ''}
        </div>
      </div>
      <div class="site-menu-account__meta">
        <span>${escapeHtml(toolAccountProviderLabel(profile))}</span>
        <span>Доступ к инструментам</span>
      </div>
      <button type="button" class="btn btn--secondary btn--full" data-tool-account-logout>Выйти</button>
    `;
    renderToolAccountAvatar(panel.querySelector('[data-tool-account-avatar]'), profile);
    const logout = panel.querySelector('[data-tool-account-logout]');
    if (logout) {
      logout.addEventListener('click', async () => {
        logout.disabled = true;
        logout.textContent = 'Выходим...';
        await toolAuthFetch('/api/auth/user/logout', { method: 'POST' }).catch(() => null);
        clearToolAuthCache();
        syncToolAccountUi(null);
        const openModal = document.querySelector('.management-modal.is-open');
        if (openModal) closeSiteMenu(openModal);
      }, { once: true });
    }
  }

  function buildToolAccountModal() {
    const existing = document.getElementById('toolAccountModal');
    const markup = `
      <div class="management-modal__backdrop" data-management-modal-close></div>
      <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="toolAccountTitle">
        <div class="management-modal__header">
          <div>
            <p class="section-heading__eyebrow">Brkovic.ltd</p>
            <h3 id="toolAccountTitle">Аккаунт</h3>
          </div>
          <button type="button" class="management-modal__close" data-management-modal-close aria-label="Закрыть">×</button>
        </div>
        <section class="site-menu-account site-menu-account--modal" data-tool-account-panel></section>
      </div>
    `;

    if (existing) {
      existing.innerHTML = markup;
      setupSiteMenuDismissal(existing);
      renderToolAccountPanel(readToolAuthCache(), existing);
      return existing;
    }

    const modal = document.createElement('div');
    modal.className = 'management-modal site-menu-modal tool-account-modal';
    modal.id = 'toolAccountModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = markup;
    document.body.appendChild(modal);
    setupSiteMenuDismissal(modal);
    renderToolAccountPanel(readToolAuthCache(), modal);
    return modal;
  }

  function syncAuthenticatedContactEmail(profile = readToolAuthCache()) {
    const email = normalizeEmail(profile?.email || '');
    if (!profile?.authenticated || !email) return;

    document.querySelectorAll('form input[type="email"][name="email"]').forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      if (String(input.value || '').trim()) return;
      input.value = email;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function syncToolAccountUi(profile = undefined) {
    const cached = profile === undefined ? readToolAuthCache() : profile;
    const isAuthenticated = Boolean(cached?.authenticated);
    const button = document.getElementById('toolAccountButton');
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.classList.toggle('topbar--tool-account-active', isAuthenticated);
    if (button) {
      button.hidden = !isAuthenticated;
      if (isAuthenticated) {
        button.setAttribute('aria-label', `Аккаунт ${cached.email || ''}`.trim());
        renderToolAccountAvatar(button.querySelector('[data-tool-account-avatar]'), cached);
      }
    }
    renderToolAccountPanel(cached);
    syncAuthenticatedContactEmail(cached);
  }

  async function fetchToolAuthStatus() {
    if (toolAuthStatusPromise) {
      return toolAuthStatusPromise;
    }

    toolAuthStatusPromise = (async () => {
      const payload = await toolAuthFetch('/api/auth/user/me');
      const data = payload && payload.data ? payload.data : null;
      if (data && data.authenticated) {
        writeToolAuthCache(data);
        syncToolAccountUi(readToolAuthCache());
        return data;
      }

      const cached = readToolAuthCache();
      if (cached && cached.authenticated) {
        syncToolAccountUi(cached);
        return cached;
      }

      clearToolAuthCache();
      syncToolAccountUi(null);
      return null;
    })();

    try {
      return await toolAuthStatusPromise;
    } finally {
      toolAuthStatusPromise = null;
    }
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isFallbackAuthError(errorMessage, error) {
    const message = String(errorMessage || error?.message || '').toLowerCase();
    return message.includes('ssl')
      || message.includes('certificate')
      || message.includes('firewall')
      || message.includes('blocked')
      || message.includes('unblock')
      || message.includes('cannot get')
      || message.includes('cannot post')
      || message.includes('404')
      || message.includes('not found')
      || message.includes('failed to')
      || message.includes('rate limit')
      || message.includes('too many')
      || message.includes('network')
      || message.includes('fetch');
  }

  function parseRetryAfterSeconds(rawValue) {
    if (rawValue === null || rawValue === undefined) return null;
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      return rawValue > 0 ? Math.ceil(rawValue) : 0;
    }
    const parsed = Number(String(rawValue).trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.ceil(parsed);
    }

    const timestamp = Date.parse(String(rawValue));
    if (Number.isFinite(timestamp)) {
      const delta = Math.ceil((timestamp - Date.now()) / 1000);
      return delta > 0 ? delta : 1;
    }

    return null;
  }

  function extractRateLimitWaitSeconds(error) {
    return (
      parseRetryAfterSeconds(error?.retryAfter)
      || parseRetryAfterSeconds(error?.payload?.meta?.retryAfter)
      || parseRetryAfterSeconds(error?.payload?.meta?.retryAfterSeconds)
      || parseRetryAfterSeconds(error?.payload?.retryAfter)
      || parseRetryAfterSeconds(error?.payload?.retryAfterSeconds)
      || parseRetryAfterSeconds(error?.payload?.data?.retryAfter)
      || parseRetryAfterSeconds(error?.payload?.data?.retryAfterSeconds)
    );
  }

  function isRateLimitError(errorMessage, error) {
    const message = String(errorMessage || error?.message || '').toLowerCase();
    const status = Number(error?.status || 0);
    return status === 429
      || message.includes('rate limit')
      || message.includes('rate-limited')
      || message.includes('too many')
      || message.includes('rate-limiting')
      || message.includes('слишком много')
    || message.includes('лимит')
    || message.includes('огранич');
  }

  function extractAuthErrorCode(error) {
    return (
      error?.payload?.error?.code
      || error?.payload?.data?.error?.code
      || error?.payload?.meta?.code
      || null
    );
  }

  function normalizeAuthErrorMessage(error, fallback) {
    const directCode = extractAuthErrorCode(error);
    const rawCode = error?.payload?.error?.code || error?.code;
    const message = String(
      error?.payload?.error?.message
      || error?.payload?.data?.error?.message
      || error?.message
      || fallback
      || 'Ошибка.',
    );
    const normalizedMessage = message.toLowerCase();
    if (normalizedMessage.includes('ssl') || normalizedMessage.includes('certificate')) {
      return 'Сейчас сервис проверки недоступен из-за ошибки безопасного соединения с сервером. Попробуйте позже.';
    }
    if (rawCode === 'HTTP_NON_JSON') {
      return message;
    }
    if (normalizedMessage.includes('firewall') || normalizedMessage.includes('blocked')) {
      return 'Сейчас серверная защита блокирует ваши запросы. Проверьте доступ к домену в браузере и повторите попытку позже.';
    }

    if (directCode === 'CODE_EXPIRED') {
      return 'Код уже просрочен или неактивен. Запросите новый и проверьте почту через 1–2 минуты.';
    }

    if (directCode === 'NO_ACTIVE_CODE' || /no active code request/i.test(message)) {
      return 'Для этого email нет активного запроса кода. Сначала запросите новый код.';
    }

    return message;
  }

  function toolAuthStatusText() {
    return {
      title: 'Доступ к инструментам',
      intro: 'Для работы с калькуляторами, NavDesk и обучающими играми нужен быстрый вход.',
      google: 'Продолжить с Google',
      emailPlaceholder: 'ваш email',
      request: 'Выслать код',
      verify: 'Подтвердить',
      resend: 'Отправить повторно',
      close: 'Позже',
      codeHint: 'Введите 6-значный код из письма.',
      codeRequestSent: 'Код отправлен',
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
      const opener = document.activeElement;
      const openerToRestore = opener instanceof HTMLElement ? opener : null;
      const existing = document.getElementById(TOOL_AUTH_PROMPT_ID);
      if (existing) {
        existing.remove();
      }
      const modal = document.createElement('div');

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
        <p class="tool-auth-prompt__note">Откройте доступ к рабочим инструментам Brkovic.ltd.</p>
        <button type="button" class="btn btn--secondary" id="toolAuthGoogle" disabled>${escapeHtml(messages.google)}</button>
        <div class="tool-auth-prompt__label">
          <label for="toolAuthEmail">${escapeHtml('Email')}</label>
          <input id="toolAuthEmail" class="tool-auth-prompt__input" type="email" autocomplete="email" inputmode="email" placeholder="${escapeHtml(messages.emailPlaceholder)}" />
        </div>
        <div class="tool-auth-prompt__actions">
          <button type="button" class="btn btn--primary" id="toolAuthRequestCode">${escapeHtml(messages.request)}</button>
        </div>
        <p id="toolAuthStatus" data-tool-auth-status role="status" class="tool-auth-prompt__status" aria-live="polite"></p>
        <div class="tool-auth-prompt__label">
          <label for="toolAuthCode">${escapeHtml(messages.codeHint)}</label>
          <input id="toolAuthCode" class="tool-auth-prompt__input" type="text" maxlength="6" placeholder="000000" inputmode="numeric" pattern="[0-9]{6}" />
        </div>
        <div class="tool-auth-prompt__actions">
          <button type="button" class="btn btn--primary btn--full" id="toolAuthVerify">${escapeHtml(messages.verify)}</button>
        </div>
          </div>
        </div>
      `;

      const restoreFocus = () => {
        if (openerToRestore && openerToRestore.isConnected && typeof openerToRestore.focus === 'function') {
          openerToRestore.focus();
        }
      };

      document.body.appendChild(modal);

      const statusEl = modal.querySelector('[data-tool-auth-status]');
      const requestBtn = modal.querySelector('#toolAuthRequestCode');
      const verifyBtn = modal.querySelector('#toolAuthVerify');
      const googleBtn = modal.querySelector('#toolAuthGoogle');
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
        restoreFocus();
        resolve(result === null ? { authenticated: false } : result);
      };

      const setStatus = (message) => {
        if (!statusEl) return;
        const text = String(message || '');
        statusEl.textContent = text;
        const lower = text.toLowerCase();
        const isSuccess = /(успеш|выполнен|отправлен|код отправлен|запрос принят|код принят)/.test(lower);
        const isError = /(ошиб|невер|недоступ|непол|проср|not found|invalid|не найден|не уда|expired|код недейств|служба .* недоступ|слишком много|rate limit|too many|лимит|огранич)/.test(lower);
        statusEl.classList.remove('is-success', 'is-error');
        if (isSuccess) {
          statusEl.classList.add('is-success');
        } else if (isError) {
          statusEl.classList.add('is-error');
        }
      };

      const setButtonBusy = (button, busy, label) => {
        if (!button) return;
        if (!button.dataset.idleLabel) {
          button.dataset.idleLabel = button.textContent || '';
        }
        button.disabled = Boolean(busy);
        button.setAttribute('aria-busy', busy ? 'true' : 'false');
        button.textContent = busy ? label : button.dataset.idleLabel;
      };

      const getDebugCode = (payload) => {
        if (!payload || typeof payload !== 'object') return '';
        const candidates = [
          payload?.data?.debugCode,
          payload?.data?.debug?.code,
          payload?.data?.data?.debugCode,
          payload?.debugCode,
          payload?.data?.code,
          payload?.code,
          payload?.data?.data?.code,
          payload?.data?.otp,
          payload?.otp,
          payload?.token,
          payload?.data?.token,
          payload?.data?.data?.otp,
        ];
        for (const value of candidates) {
          if (typeof value === 'string' && /^\d{6}$/.test(value)) {
            return value;
          }
        }
        return '';
      };

      const parseCooldownSeconds = (payload, fallback = 55) => {
        const candidate =
          payload?.data?.ttlSeconds
          || payload?.data?.data?.ttlSeconds
          || payload?.ttlSeconds
          || payload?.data?.meta?.ttlSeconds
          || payload?.meta?.ttlSeconds;
        const parsed = Number(candidate);
        if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
        return Math.min(Math.max(Math.floor(parsed), 20), 55);
      };

      const extractRequestError = (error) => {
        if (error?.payload && typeof error.payload === 'object') {
          return (
            error.payload?.error?.message
            || error.payload?.message
            || error.payload?.data?.message
            || error.payload?.data?.error?.message
          );
        }

        return null;
      };

      let cooldownTimer = null;
      let cooldownLeft = 0;
      let requestPending = false;
      let verifyPending = false;

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

      const startCooldown = (seconds = 55) => {
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownLeft = parseCooldownSeconds({}, seconds);
        requestBtn && (requestBtn.disabled = true);
        tickCooldown();
      };

      const tryRequestCode = async () => {
        if (!requestBtn || requestBtn.disabled || requestPending) return;
        requestPending = true;
        setButtonBusy(requestBtn, true, 'Отправляем...');
        try {
          const email = normalizeEmail(emailInput?.value);
          if (!email) {
            setStatus('Введите email.');
            setButtonBusy(requestBtn, false);
            requestPending = false;
            return;
          }
          localStorage.setItem('brkovic_tool_auth_email', email);
          setStatus('Отправляем код...');
          const payload = await toolAuthFetch('/api/auth/user/request-code', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });
          const requested = payload?.success !== false && (
            payload?.data?.requested === true
            || payload?.data?.data?.requested === true
            || payload?.requested === true
            || payload?.data?.status === 'requested'
          );
          const messageRequested = requested ? messages.codeRequestSent : 'Запрос принят к обработке.';
          const debugCode = getDebugCode(payload);
          const statusHint = 'Если код не пришел — повторите через 60 сек.';
          if (debugCode) {
            setStatus(`${messages.codeRequestSent}: ${debugCode}`);
          } else {
            setStatus(`${messageRequested} ${statusHint}`);
          }
          if (codeInput) codeInput.focus();
          requestPending = false;
          startCooldown(parseCooldownSeconds(payload, 55));
        } catch (error) {
          requestPending = false;
          const retryAfterSeconds = extractRateLimitWaitSeconds(error);
          if (isRateLimitError(error?.message, error)) {
            const wait = retryAfterSeconds || 60;
            const statusMessage = `Слишком много запросов. Попробуйте снова через ${wait} сек.`;
            setStatus(statusMessage);
            startCooldown(wait);
            return;
          }
          const fallback = isFallbackAuthError(error?.message, error)
            ? 'Сейчас сервис проверки недоступен. Повторите попытку через минуту.'
            : (error?.message || messages.genericError);
          const extracted = extractRequestError(error) || fallback;
          setStatus(extracted);
          setButtonBusy(requestBtn, false);
          if (cooldownTimer) {
            clearTimeout(cooldownTimer);
            cooldownTimer = null;
            cooldownLeft = 0;
          }
          if (requestBtn) {
            requestBtn.textContent = messages.request;
          }
        }
      };

      const googleStartUrl = () => {
        const returnTo = `${window.location.pathname || '/'}${window.location.search || ''}${window.location.hash || ''}`;
        const route = `/api/auth/user/google/start?returnTo=${encodeURIComponent(returnTo)}`;
        if (window.location.hostname === 'brkovic.ltd') return route;
        return `https://brkovic.ltd${route}`;
      };

      const onGoogleMessage = (event) => {
        if (event.origin !== 'https://brkovic.ltd') return;
        const message = event.data || {};
        if (message.type !== 'brkovic-tool-auth-google' || !message.payload) return;
        writeToolAuthCache({
          authenticated: true,
          email: message.payload.email || null,
          displayName: message.payload.displayName || null,
          avatarUrl: message.payload.avatarUrl || null,
          authProvider: message.payload.authProvider || 'google',
          sessionExpiresAt: message.payload.sessionExpiresAt,
        });
        syncToolAccountUi(readToolAuthCache());
        setStatus(messages.success);
        close({ authenticated: true, profile: message.payload });
      };

      const tryGoogle = () => {
        if (!googleBtn) return;
        if (googleBtn.disabled) {
          setStatus('Google-вход ещё не подключён на сервере.');
          return;
        }
        const popup = window.open(
          googleStartUrl(),
          'brkovicGoogleAuth',
          'popup=yes,width=520,height=680,menubar=no,toolbar=no,location=yes,status=no',
        );
        if (!popup) {
          setStatus('Разрешите всплывающее окно для входа через Google.');
          return;
        }
        setStatus('Откройте Google и подтвердите вход.');
        popup.focus();
      };

      const syncGoogleButton = async () => {
        if (!googleBtn) return;
        googleBtn.disabled = true;
        googleBtn.setAttribute('aria-busy', 'true');
        try {
          const payload = await toolAuthFetch('/api/auth/user/google/status');
          const configured = Boolean(payload?.data?.configured || payload?.data?.data?.configured);
          googleBtn.disabled = !configured;
          googleBtn.title = configured ? '' : 'Google-вход ещё не подключён на сервере.';
        } catch (error) {
          googleBtn.disabled = true;
          googleBtn.title = 'Google-вход сейчас недоступен.';
        } finally {
          googleBtn.setAttribute('aria-busy', 'false');
        }
      };

      const tryVerify = async () => {
        if (verifyPending) return;
        verifyPending = true;
        setButtonBusy(verifyBtn, true, 'Проверяем...');
        try {
          const email = normalizeEmail(emailInput?.value);
          const code = String(codeInput?.value || '').replace(/\D/g, '').trim();
          if (!email || code.length !== 6) {
            setStatus('Введите email и 6-значный код.');
            setButtonBusy(verifyBtn, false);
            verifyPending = false;
            return;
          }
          setStatus('Проверяем код...');
          const payload = await toolAuthFetch('/api/auth/user/verify-code', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
          });
          const verified = payload && payload.data ? payload.data : null;
          if (!verified || verified.authenticated === false) {
            setStatus(messages.wrongCode);
            setButtonBusy(verifyBtn, false);
            verifyPending = false;
            return;
          }
          writeToolAuthCache({
            authenticated: true,
            email: verified.email || email,
            displayName: verified.displayName || null,
            avatarUrl: verified.avatarUrl || null,
            authProvider: verified.authProvider || 'email',
            sessionExpiresAt: verified.sessionExpiresAt,
          });
          syncToolAccountUi(readToolAuthCache());
          setStatus(messages.success);
          close({ authenticated: true, profile: verified });
        } catch (error) {
          verifyPending = false;
          setButtonBusy(verifyBtn, false);
          if (isRateLimitError(error?.message, error)) {
            const wait = extractRateLimitWaitSeconds(error) || 60;
            setStatus(`Слишком много запросов. Попробуйте снова через ${wait} сек.`);
            startCooldown(wait);
            return;
          }
          const normalized = normalizeAuthErrorMessage(error, messages.wrongCode);
          setStatus(normalized);
        }
      };

      if (requestBtn) requestBtn.addEventListener('click', tryRequestCode, { once: false });
      if (verifyBtn) verifyBtn.addEventListener('click', tryVerify, { once: false });
      if (googleBtn) googleBtn.addEventListener('click', tryGoogle, { once: false });
      window.addEventListener('message', onGoogleMessage, { once: false });
      syncGoogleButton();
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
        window.removeEventListener('message', onGoogleMessage);
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

  function isGameLink(target) {
    if (!target || target.tagName !== 'A') return false;
    const href = target.getAttribute('href');
    if (!href) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.hostname === 'game.brkovic.ltd';
    } catch (error) {
      return false;
    }
  }

  function gameReturnPath(target) {
    const fallback = '/';
    if (!target || target.tagName !== 'A') return fallback;
    try {
      const url = new URL(target.getAttribute('href') || fallback, window.location.href);
      if (url.hostname !== 'game.brkovic.ltd') return fallback;
      const path = `${url.pathname || '/'}${url.search || ''}${url.hash || ''}`;
      return path.startsWith('/') && !path.startsWith('//') ? path : fallback;
    } catch (error) {
      return fallback;
    }
  }

  async function resolveGameAuthHref(target) {
    const directHref = target?.getAttribute?.('href') || 'https://game.brkovic.ltd/';
    const returnTo = gameReturnPath(target);

    try {
      const payload = await toolAuthFetch(`/api/auth/user/ecosystem-token?returnTo=${encodeURIComponent(returnTo)}`);
      const data = payload?.data || payload || {};
      if (typeof data.loginUrl === 'string' && data.loginUrl) return data.loginUrl;
      if (typeof data.url === 'string' && data.url) return data.url;
      if (typeof data.token === 'string' && data.token) {
        const loginUrl = new URL('https://game.brkovic.ltd/api/auth/ecosystem-login.php');
        loginUrl.searchParams.set('token', data.token);
        return loginUrl.toString();
      }
    } catch (error) {
      throw new Error('Не удалось подготовить единый вход в обучающие игры. Попробуйте ещё раз.');
    }

    throw new Error('Сервер не вернул ссылку единого входа в обучающие игры.');
  }

  function isToolActionCandidate(target) {
    if (!target) return false;
    if (target.closest('[data-tool-auth-action]')) {
      return true;
    }
    if (isGameLink(target)) {
      return true;
    }
    if (target.closest('#deliveryCalc, #management-calculator')) {
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
    if (!document.querySelector('.navdesk-page, #deliveryCalc, #management-calculator, a[href*="game.brkovic.ltd"]')) return;

    const protectedSelector = [
      '.navdesk-page button[id]',
      '.navdesk-page .navdesk-tool-card',
      '.navdesk-page a[href^="navdesk-"]',
      '#deliveryCalc button',
      '#management-calculator button',
      'a[href*="game.brkovic.ltd"]',
      '[data-tool-auth-action]',
    ].join(', ');

    document.addEventListener('click', async (event) => {
      const target = event.target.closest(protectedSelector);
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
          const href = isGameLink(target)
            ? await resolveGameAuthHref(target)
            : target.getAttribute('href');
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
        } else if (typeof window.alert === 'function') {
          window.alert(fallback);
        }
      }
    }, { capture: true });

    document.addEventListener('focusin', async (event) => {
      const target = event.target.closest?.('#deliveryCalc input, #deliveryCalc select, #deliveryCalc textarea, #management-calculator input, #management-calculator select, #management-calculator textarea');
      if (!target || !isToolActionCandidate(target)) return;
      if (target.dataset && target.dataset.toolAuthFocusReplay === '1') {
        delete target.dataset.toolAuthFocusReplay;
        return;
      }

      const cached = readToolAuthCache();
      if (cached && cached.authenticated) return;

      target.blur();
      try {
        const allowed = await ensureToolAccess();
        if (!allowed || !target.isConnected) return;
        target.dataset.toolAuthFocusReplay = '1';
        setTimeout(() => target.focus(), 10);
      } catch (error) {}
    }, { capture: true });
  }

  window.ensureToolAccess = ensureToolAccess;
  window.openToolAuthPrompt = openToolAuthPrompt;

  document.addEventListener('DOMContentLoaded', () => {
    setupSiteMenu();
    fetchToolAuthStatus().catch(() => syncToolAccountUi(readToolAuthCache()));
    applyContactLinks();
    setupCvTriggers();
    setupServiceRequestFromUrl();
    setupMobileCollapsibles();
    bindToolActionAuthGate();
  });
})();
