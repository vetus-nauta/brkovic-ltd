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

  function buildSiteMenuModal(actionsNode) {
    const existing = document.getElementById("siteMenuModal");
    if (existing) return existing;

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
        <div class="site-menu-settings" data-site-menu-settings>
          <span class="site-menu-settings__label" data-i18n="site_menu_language">${escapeHtml(t("site_menu_language", "Language"))}</span>
        </div>
        <p class="site-menu-future" data-i18n="site_menu_future_settings">${escapeHtml(t("site_menu_future_settings", "User settings will live here later."))}</p>
      </div>
    `;

    const settings = modal.querySelector("[data-site-menu-settings]");
    if (settings && actionsNode) {
      Array.from(actionsNode.children).forEach((child) => {
        if (child.classList.contains("site-menu-button")) return;
        settings.appendChild(child);
      });
    }
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

  document.addEventListener('DOMContentLoaded', () => {
    setupSiteMenu();
    applyContactLinks();
    setupCvTriggers();
    setupServiceRequestFromUrl();
  });
})();
