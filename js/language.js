(function () {
  const STORAGE_KEY = "brkovic_language";
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const defaultLang = navigator.language && navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";

  async function loadTranslations(lang) {
    const langUrl = new URL(`../lang/${lang}.json?v=20260515-02`, scriptUrl);
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
    document.querySelectorAll(".lang-switch__btn").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === lang);
    });
  }

  async function setLanguage(lang) {
    const translations = await loadTranslations(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(translations);
    updateLanguageButtons(lang);
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang, translations } }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const queryLang = new URLSearchParams(window.location.search).get("lang");
    const lang = queryLang === "ru" || queryLang === "en" ? queryLang : (saved || defaultLang);
    document.querySelectorAll(".lang-switch__btn").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
    setLanguage(lang);
  });
})();
