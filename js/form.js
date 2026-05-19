(function () {
  let currentTranslations = {};

  function t(key, fallback) {
    return currentTranslations[key] || fallback;
  }

  function clearStatus(status) {
    status.textContent = "";
    status.classList.remove("is-success", "is-error");
  }

  function setStatus(status, type, text) {
    status.textContent = text;
    status.classList.remove("is-success", "is-error");
    status.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function buildFallbackMailto(formData) {
    const cfg = window.BRKOVIC_CONFIG || {};
    const recipient = cfg.email || "vetus.nauta@gmail.com";
    const subject = t("form_subject", "Request from BRKOVIC website");
    const lines = [
      `${t("form_name", "Name")}: ${formData.get("name") || ""}`,
      `${t("form_email", "Email")}: ${formData.get("email") || ""}`,
      `${t("form_phone", "Phone / Messenger")}: ${formData.get("phone") || ""}`,
      `${t("form_service", "Service")}: ${formData.get("service") || ""}`,
      "",
      `${t("form_message", "Message")}:`,
      `${formData.get("message") || ""}`,
    ];
    return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  function syncLanguageField() {
    const langInput = document.getElementById("contactLang");
    if (langInput) {
      langInput.value = document.documentElement.lang === "ru" ? "ru" : "en";
    }
  }

  document.addEventListener("languageChanged", (event) => {
    currentTranslations = event.detail.translations || {};
    syncLanguageField();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    const fallback = document.getElementById("formFallback");
    const fallbackLink = document.getElementById("formFallbackLink");
    const serviceSelect = document.getElementById("serviceSelect");
    const requestType = document.getElementById("requestType");
    if (!form || !status) return;

    syncLanguageField();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearStatus(status);
      if (fallback) fallback.hidden = true;
      syncLanguageField();

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const service = String(formData.get("service") || "");
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (requestType && serviceSelect) {
        requestType.value = service === "CV Request" ? "cv" : "general";
        formData.set("request_type", requestType.value);
      }

      if (!name || !email || !message) {
        setStatus(status, "error", t("form_error_required", "Please fill in the required fields."));
        return;
      }
      if (!emailIsValid) {
        setStatus(status, "error", t("form_error_email", "Please enter a valid email address."));
        return;
      }

      setStatus(status, "success", t("form_sending", "Sending..."));

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { "X-Requested-With": "XMLHttpRequest" }
        });

        let result = {};
        try {
          result = await response.json();
        } catch (jsonError) {
          result = {};
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || t("form_error_server", "The form is not sending from the site right now. Open your email app and send the message directly."));
        }

        form.reset();
        if (serviceSelect) serviceSelect.selectedIndex = 0;
        if (requestType) requestType.value = 'general';
        syncLanguageField();
        setStatus(status, "success", result.message || t("form_success", "Your request has been sent."));
      } catch (error) {
        setStatus(status, "error", error.message || t("form_error_server", "The form is not sending from the site right now. Open your email app and send the message directly."));
        if (fallback && fallbackLink) {
          fallbackLink.href = buildFallbackMailto(formData);
          fallback.hidden = false;
        }
      }
    });
  });
})();
