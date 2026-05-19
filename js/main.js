(function () {
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
    applyContactLinks();
    setupCvTriggers();
    setupServiceRequestFromUrl();
  });
})();
