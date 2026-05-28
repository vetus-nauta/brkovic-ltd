(function () {
  const STORAGE_KEY = "brkovic_language";
  const HINT_KEY = "brkovic_language_hint_dismissed";
  const HINT_VERSION = "2026-05-28-language-access";
  const SUPPORTED_LANGS = ["ru", "en"];
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  let currentLang = "";

  function normalizeLang(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const code = raw.split("-")[0];
    return SUPPORTED_LANGS.includes(code) ? code : "";
  }

  function systemLang() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ""];
    return normalizeLang(languages[0]) === "ru" ? "ru" : "en";
  }

  function getQueryLang() {
    return normalizeLang(new URLSearchParams(window.location.search).get("lang"));
  }

  function getSavedLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return "";
    }
  }

  function protectFromBrowserTranslate() {
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.add("notranslate");
    if (document.body) {
      document.body.setAttribute("translate", "no");
      document.body.classList.add("notranslate");
    }
    if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
      const meta = document.createElement("meta");
      meta.name = "google";
      meta.content = "notranslate";
      document.head.appendChild(meta);
    }
  }

  async function loadTranslations(lang) {
    const langUrl = new URL(`../lang/${lang}.json?v=20260528-language-access-01`, scriptUrl);
    const response = await fetch(langUrl.href, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load language file");
    return response.json();
  }

  function applyTranslations(translations) {
    document.documentElement.lang = translations.meta_lang || "en";
    const titleKey = document.documentElement.getAttribute("data-i18n-title");
    const descriptionKey = document.documentElement.getAttribute("data-i18n-description");
    document.title = (titleKey && translations[titleKey]) || translations.meta_title || document.title;
    if (descriptionKey && translations[descriptionKey]) {
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", translations[descriptionKey]);
    }
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) element.textContent = translations[key];
    });
    window.__BRKOVIC_TRANSLATIONS = translations;
    document.querySelectorAll("[data-i18n-option]").forEach((element) => {
      const key = element.getAttribute("data-i18n-option");
      if (translations[key]) element.textContent = translations[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (translations[key]) element.setAttribute("placeholder", translations[key]);
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll(".lang-switch__btn, .site-menu-language__option[data-lang]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === lang);
      button.setAttribute("aria-pressed", button.dataset.lang === lang ? "true" : "false");
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function hintDismissed() {
    try {
      return localStorage.getItem(HINT_KEY) === HINT_VERSION;
    } catch (error) {
      return false;
    }
  }

  function dismissLanguageHint() {
    const hint = document.querySelector(".language-hint");
    if (hint) hint.remove();
    try {
      localStorage.setItem(HINT_KEY, HINT_VERSION);
    } catch (error) {}
  }

  function translatedText(key, fallback) {
    return (window.__BRKOVIC_TRANSLATIONS && window.__BRKOVIC_TRANSLATIONS[key]) || fallback || key;
  }

  function insertLanguageHint(hint) {
    const headerCard = document.querySelector(".navdesk-header-card");
    const topbar = headerCard ? headerCard.querySelector(".topbar") : document.querySelector(".topbar");
    if (topbar && topbar.parentNode) {
      topbar.insertAdjacentElement("afterend", hint);
      return;
    }
    const shell = document.querySelector(".site-shell");
    if (shell) {
      shell.prepend(hint);
      return;
    }
    document.body.prepend(hint);
  }

  function showLanguageHint(source) {
    document.querySelectorAll(".language-hint").forEach((hint) => hint.remove());
    if (source !== "system" || hintDismissed() || !document.body) return;

    const hint = document.createElement("div");
    hint.className = "language-hint";
    hint.setAttribute("role", "status");
    hint.setAttribute("aria-live", "polite");
    hint.innerHTML = `
      <span data-i18n="language_hint_text">${escapeHtml(translatedText("language_hint_text", "Language was selected from your system settings. You can change it in the menu under Language versions."))}</span>
      <button type="button" data-i18n="language_hint_close">${escapeHtml(translatedText("language_hint_close", "OK"))}</button>
    `;
    hint.querySelector("button").addEventListener("click", dismissLanguageHint);
    insertLanguageHint(hint);
  }

  async function setLanguage(lang, options = {}) {
    const nextLang = normalizeLang(lang) || "en";
    const source = options.source || "manual";
    const translations = await loadTranslations(nextLang);
    if (options.persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, nextLang);
      } catch (error) {}
    }
    applyTranslations(translations);
    currentLang = nextLang;
    updateLanguageButtons(nextLang);
    document.documentElement.dataset.languageSource = source;
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: nextLang, source, translations } }));
    if (source === "manual") dismissLanguageHint();
    else showLanguageHint(source);
  }

  function initialLanguage() {
    const queryLang = getQueryLang();
    if (queryLang) return { lang: queryLang, source: "query", persist: true };
    const savedLang = getSavedLang();
    if (savedLang) return { lang: savedLang, source: "saved", persist: true };
    return { lang: systemLang(), source: "system", persist: false };
  }

  document.addEventListener("DOMContentLoaded", () => {
    protectFromBrowserTranslate();
    document.querySelectorAll(".lang-switch__btn").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang, { source: "manual", persist: true }));
    });
    const selected = initialLanguage();
    setLanguage(selected.lang, selected);
  });

  window.BRKOVIC_LANGUAGE = {
    supported: SUPPORTED_LANGS.slice(),
    getSystemLang: systemLang,
    getCurrentLang: () => currentLang || normalizeLang(document.documentElement.lang) || "en",
    setLanguage: (lang) => setLanguage(lang, { source: "manual", persist: true }),
  };
})();
