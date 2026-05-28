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

  function buildSiteMenuModal(actionsNode) {
    const existing = document.getElementById("siteMenuModal");
    if (existing) {
      removeLegacyLanguageControls(existing);
      ensureSiteMenuLanguageSection(existing);
      return existing;
    }

    const modal = document.createElement("div");
    modal.className = "management-modal site-menu-modal";
    modal.id = "siteMenuModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="management-modal__backdrop" data-management-modal-close></div>
      <div class="management-modal__dialog management-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="siteMenuTitle">
        <div class="management-modal__header">
          <div>
            <p class="section-heading__eyebrow" data-i18n="site_menu_eyebrow">${escapeHtml(t("site_menu_eyebrow", "Page controls"))}</p>
            <h3 id="siteMenuTitle" data-i18n="site_menu_title">${escapeHtml(t("site_menu_title", "Menu and settings"))}</h3>
          </div>
          <button type="button" class="management-modal__close" data-management-modal-close aria-label="Close">×</button>
        </div>
        <nav class="management-modal-nav" aria-label="Site sections">
          <a href="/index.html#hero" data-management-modal-close data-i18n="site_menu_home">${escapeHtml(t("site_menu_home", "Home"))}</a>
          <a href="/index.html#services" data-management-modal-close data-i18n="site_menu_services">${escapeHtml(t("site_menu_services", "Services"))}</a>
          <a href="/journal.html" data-management-modal-close data-i18n="site_menu_journal">${escapeHtml(t("site_menu_journal", "Deck Log"))}</a>
          <a href="/navdesk.html" data-management-modal-close data-i18n="site_menu_navdesk">${escapeHtml(t("site_menu_navdesk", "Nav Desk"))}</a>
          <a href="/index.html#contact" data-management-modal-close data-i18n="site_menu_contact">${escapeHtml(t("site_menu_contact", "Contact"))}</a>
        </nav>
      </div>
    `;

    removeLegacyLanguageControls(modal);
    document.body.appendChild(modal);
    ensureSiteMenuLanguageSection(modal);
    setupSiteMenuLanguageControls(modal);
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

    const modal = buildSiteMenuModal(actions);
    setupSiteMenuLanguageControls(modal);
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
    });
    modal.querySelectorAll("a[data-management-modal-close]").forEach((link) => {
      link.addEventListener("click", () => closeSiteMenu(modal));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeSiteMenu(modal);
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

  document.addEventListener('DOMContentLoaded', () => {
    setupSiteMenu();
    applyContactLinks();
    setupCvTriggers();
    setupServiceRequestFromUrl();
    setupMobileCollapsibles();
  });
})();
