(function () {
  const IS_LOCAL = ['brkovic-local.local', '127.0.0.1', 'localhost'].includes(window.location.hostname);
  const API_BASE = IS_LOCAL ? '/admin-api-proxy.php?path=' : '/api';
  let currentStatus = 'PENDING';
  let isLoggedIn = false;

  const statusNode = document.getElementById('adminStatus');
  const listNode = document.getElementById('adminCommentsList');
  const loginForm = document.getElementById('adminLoginForm');
  const refreshBtn = document.getElementById('adminRefreshBtn');

  function setStatus(text) {
    if (statusNode) statusNode.textContent = text || '';
  }

  function setLoggedInUI(loggedIn) {
    isLoggedIn = loggedIn;
    if (loginForm) {
      loginForm.style.display = loggedIn ? 'none' : '';
    }
  }

  function escapeHtml(text) {
    return (text || '').replace(/[&<>"]/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[m]));
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  function getFilterLabel(status) {
    if (status === 'PENDING') return 'на модерации';
    if (status === 'APPROVED') return 'одобренных';
    if (status === 'REJECTED') return 'отклонённых';
    return 'всех';
  }

  function getStatusLabel(status) {
    if (status === 'PENDING') return 'НА МОДЕРАЦИИ';
    if (status === 'APPROVED') return 'ОДОБРЕН';
    if (status === 'REJECTED') return 'ОТКЛОНЁН';
    return status || '';
  }

  function renderActions(item) {
    if (item.status === 'APPROVED') {
      return `
        <button class="btn btn--secondary" type="button" data-action="reject" data-id="${escapeHtml(item.id)}">
          Отклонить
        </button>
      `;
    }

    if (item.status === 'REJECTED') {
      return `
        <button class="btn btn--secondary" type="button" data-action="approve" data-id="${escapeHtml(item.id)}">
          Одобрить
        </button>
      `;
    }

    return `
      <button class="btn btn--secondary" type="button" data-action="approve" data-id="${escapeHtml(item.id)}">
        Одобрить
      </button>
      <button class="btn btn--secondary" type="button" data-action="reject" data-id="${escapeHtml(item.id)}">
        Отклонить
      </button>
    `;
  }

  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Ошибка запроса');
    }

    return data?.data?.data || data?.data || data;
  }

  async function login(email, password) {
    return api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async function checkSession() {
    try {
      const data = await api('/auth/me', { method: 'GET' });
      return !!data?.authenticated;
    } catch {
      return false;
    }
  }

  async function fetchComments(status = '') {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return api(`/admin/comments${query}`, {
      method: 'GET',
    });
  }

  async function approveComment(id) {
    return api(`/admin/comments/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
      body: '{}',
    });
  }

  async function rejectComment(id) {
    return api(`/admin/comments/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: '{}',
    });
  }

  function renderComments(items) {
    if (!listNode) return;

    if (!items.length) {
      listNode.innerHTML = `<div class="admin-empty">Нет комментариев для фильтра: ${escapeHtml(getFilterLabel(currentStatus))}.</div>`;
      return;
    }

    listNode.innerHTML = items.map((item) => `
      <article class="admin-comment-card">
        <div class="admin-comment-head">
          <div>
            <h3>${escapeHtml(item.authorName || 'Гость')}</h3>
            <div class="admin-comment-meta">
              <div>Email: ${escapeHtml(item.authorEmail || '—')}</div>
              <div>Пост: <a href="journal.html?slug=${encodeURIComponent(item.post?.slug || '')}" target="_blank" rel="noopener">${escapeHtml(item.post?.titleRu || item.post?.titleEn || item.post?.slug || 'Открыть пост')}</a></div>
              <div>Slug: ${escapeHtml(item.post?.slug || '—')}</div>
              <div>Создан: ${escapeHtml(formatDate(item.createdAt))}</div>
            </div>
          </div>
          <div>
            <span class="admin-comment-status-pill status-${escapeHtml(item.status)}">${escapeHtml(getStatusLabel(item.status))}</span>
          </div>
        </div>

        <div class="admin-comment-content">${escapeHtml(item.content || '')}</div>

        <div class="admin-comment-actions">
          ${renderActions(item)}
        </div>
      </article>
    `).join('');

    bindActions();
  }

  function bindActions() {
    document.querySelectorAll('[data-action="approve"]').forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!id) return;
        setStatus('Одобряем комментарий...');
        try {
          await approveComment(id);
          await loadComments();
          setStatus(`Комментарий одобрен. Сейчас показано: ${getFilterLabel(currentStatus)}.`);
        } catch (error) {
          setStatus(error.message || 'Не удалось одобрить комментарий.');
        }
      };
    });

    document.querySelectorAll('[data-action="reject"]').forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!id) return;
        setStatus('Отклоняем комментарий...');
        try {
          await rejectComment(id);
          await loadComments();
          setStatus(`Комментарий отклонён. Сейчас показано: ${getFilterLabel(currentStatus)}.`);
        } catch (error) {
          setStatus(error.message || 'Не удалось отклонить комментарий.');
        }
      };
    });
  }

  async function loadComments() {
    if (!isLoggedIn) {
      setStatus('Сначала войдите.');
      return;
    }

    setStatus(`Загрузка: ${getFilterLabel(currentStatus)}...`);

    try {
      const items = await fetchComments(currentStatus);
      renderComments(items);
      setStatus(`Вы вошли. Загружено ${items.length} ${getFilterLabel(currentStatus)} комментариев.`);
    } catch (error) {
      if (listNode) {
        listNode.innerHTML = `<div class="admin-empty">Не удалось загрузить комментарии.</div>`;
      }
      setStatus(error.message || 'Не удалось загрузить комментарии.');
    }
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminEmail')?.value?.trim();
    const password = document.getElementById('adminPassword')?.value || '';

    if (!email || !password) return;

    setStatus('Входим...');

    try {
      await login(email, password);
      setLoggedInUI(true);
      currentStatus = 'PENDING';

      document.querySelectorAll('.admin-filter').forEach((item) => {
        item.classList.toggle('is-active', item.dataset.status === 'PENDING');
      });

      setStatus('Вход выполнен.');
      await loadComments();
    } catch (error) {
      setStatus(error.message || 'Ошибка входа.');
    }
  });

  refreshBtn?.addEventListener('click', () => {
    loadComments();
  });

  document.querySelectorAll('.admin-filter').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.status === currentStatus);

    button.addEventListener('click', async () => {
      currentStatus = button.dataset.status || '';
      document.querySelectorAll('.admin-filter').forEach((item) => {
        item.classList.toggle('is-active', item === button);
      });

      if (isLoggedIn) {
        await loadComments();
      }
    });
  });

  (async () => {
    const loggedIn = await checkSession();
    setLoggedInUI(loggedIn);
    if (loggedIn) {
      setStatus('Сессия активна.');
      await loadComments();
    }
  })();
})();
