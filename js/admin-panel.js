(function () {
  const auth = window.BRKOVIC_ADMIN_AUTH;
  const form = document.getElementById('adminHubLoginForm');
  const status = document.getElementById('adminHubStatus');
  const sections = document.getElementById('adminHubSections');

  function setStatus(text, tone = 'info') {
    if (!status) return;
    status.textContent = text || '';
    status.dataset.tone = tone;
  }

  function setReady(isReady) {
    if (form) form.hidden = isReady;
    if (sections) sections.classList.toggle('is-locked', !isReady);
    sections?.querySelectorAll('a').forEach((link) => {
      link.setAttribute('aria-disabled', isReady ? 'false' : 'true');
      link.tabIndex = isReady ? 0 : -1;
    });
  }

  async function init() {
    setReady(false);
    setStatus('Проверяем сессию...');
    const loggedIn = await auth.checkSession();
    setReady(loggedIn);
    setStatus(loggedIn ? 'Общая авторизация активна. Выберите раздел.' : 'Общая авторизация владельца не найдена.', loggedIn ? 'success' : 'info');
  }

  sections?.addEventListener('click', (event) => {
    const link = event.target.closest('a[aria-disabled="true"]');
    if (!link) return;
    event.preventDefault();
    setStatus('Нет активной общей авторизации владельца.', 'warning');
  });

  if (!auth) {
    setStatus('Модуль авторизации не загружен.', 'error');
    setReady(false);
    return;
  }

  init();
})();
