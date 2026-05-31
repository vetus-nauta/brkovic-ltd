(function () {
  const IS_LOCAL = ['brkovic-local.local', '127.0.0.1', 'localhost'].includes(window.location.hostname);
  const API_BASE = IS_LOCAL ? '/admin-api-proxy.php?path=' : '/api';
  const OWNER_EMAILS = new Set(['sailor040381@gmail.com', 'vetus.nauta@gmail.com']);

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function unwrap(payload) {
    let value = payload;
    for (let i = 0; i < 3; i += 1) {
      if (!value || typeof value !== 'object') return value;
      if (value.data && typeof value.data === 'object') {
        value = value.data;
        continue;
      }
      break;
    }
    return value;
  }

  function sessionFromPayload(payload) {
    const data = unwrap(payload);
    const email = normalizeEmail(data?.email || data?.user?.email || payload?.email || payload?.user?.email || '');
    const authenticated = data?.authenticated === true || data?.user?.authenticated === true || payload?.authenticated === true;
    return {
      authenticated,
      email,
      owner: authenticated && OWNER_EMAILS.has(email),
      raw: payload,
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || `Ошибка запроса (${response.status})`);
      error.status = response.status;
      error.body = data;
      throw error;
    }
    return data?.data?.data || data?.data || data;
  }

  async function directRequest(path) {
    const route = String(path || '').startsWith('/api/')
      ? String(path || '')
      : `/api${String(path || '').startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(route, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error?.message || `Ошибка запроса (${response.status})`);
      error.status = response.status;
      error.body = data;
      throw error;
    }
    return data?.data?.data || data?.data || data;
  }

  function login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  function logout() {
    return request('/auth/logout', { method: 'POST', body: '{}' });
  }

  async function checkSession() {
    const routes = ['/auth/me', '/auth/user/me'];
    for (const route of routes) {
      const probes = [
        () => directRequest(route),
        () => request(route, { method: 'GET' }),
      ];
      for (const probe of probes) {
        try {
          const session = sessionFromPayload(await probe());
          if (session.owner) return true;
        } catch {}
      }
    }
    return false;
  }

  window.BRKOVIC_ADMIN_AUTH = {
    API_BASE,
    request,
    login,
    logout,
    checkSession,
    sessionFromPayload,
  };
})();
