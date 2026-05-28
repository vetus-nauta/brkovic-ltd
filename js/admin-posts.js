(function () {
  const IS_LOCAL = ['brkovic-local.local', '127.0.0.1', 'localhost'].includes(window.location.hostname);
  const API_ORIGIN = IS_LOCAL ? 'https://brkovic.ltd' : '';
  const API_BASE = IS_LOCAL ? '/admin-api-proxy.php?path=' : '/api';
  const STORAGE_ADVANCED_OPEN = 'brkovic_admin_posts_advanced_open_v1';
  const COLLECTION_AUTHOR_DEFAULT = 'Vetus Nauta - Brkovic';

  let isLoggedIn = false;
  let currentPostId = '';
  let postsCache = [];
  let slugTouched = false;
  let currentMediaItems = [];
  let showArchivedMode = 'active';
  let groupsCache = [];
  let groupSelect = null;
  let groupOrderInput = null;
  let collectionsCache = [];
  let postTranslationRows = [];
  let collectionTranslationRows = [];
  let currentCollectionId = '';
  let collectionSlugTouched = false;
  let isAiGenerationRouteEnabled = true;

  const statusNode = document.getElementById('adminPostsStatus');
  const postsListNode = document.getElementById('adminPostsList');
  const form = document.getElementById('postEditorForm');
  const loginForm = document.getElementById('adminPostsLoginForm');
  const refreshBtn = document.getElementById('refreshPostsBtn');
  const rebuildGpsBtn = document.getElementById('rebuildGpsBtn');
  const createBtn = document.getElementById('createPostBtn');
  const mediaForm = document.getElementById('mediaUploadForm');
  const mediaStatusNode = document.getElementById('mediaUploadStatus');
  const mediaListNode = document.getElementById('mediaList');
  const openPublicLink = document.getElementById('openPublicPostLink');
  const generateAiPostTranslationsBtn = document.getElementById('generateAiPostTranslationsBtn');
  const generateAiPostMissingTranslationsBtn = document.getElementById('generateAiPostMissingTranslationsBtn');
  const postAiTranslationStatus = document.getElementById('postAiTranslationStatus');
  const refreshPostAiTranslationStatusBtn = document.getElementById('refreshPostAiTranslationStatusBtn');
  const postIncludeSeoInput = document.getElementById('postTranslationIncludeSeo');
  const postIncludeMediaInput = document.getElementById('postTranslationIncludeMedia');
  const slugInput = document.getElementById('slug');
  const titleRuInput = document.getElementById('titleRu');
  const advancedToggleBtn = document.getElementById('toggleAdvancedFields');
  const advancedFieldsSummary = document.getElementById('advancedFieldsSummary');
  const collectionsStatusNode = document.getElementById('journalCollectionsStatus');
  const collectionsListNode = document.getElementById('journalCollectionsList');
  const collectionForm = document.getElementById('collectionEditorForm');
  const collectionPagesPicker = document.getElementById('collectionPagesPicker');
  const refreshCollectionsBtn = document.getElementById('refreshCollectionsBtn');
  const newCollectionBtn = document.getElementById('newCollectionBtn');
  const collectionTitleRuInput = document.getElementById('collectionTitleRu');
  const collectionSlugInput = document.getElementById('collectionSlug');
  const saveCollectionBtn = document.getElementById('saveCollectionBtn');
  const openPublicCollectionLink = document.getElementById('openPublicCollectionLink');
  const generateAiCollectionTranslationsBtn = document.getElementById('generateAiCollectionTranslationsBtn');
  const generateAiMissingCollectionTranslationsBtn = document.getElementById('generateAiMissingCollectionTranslationsBtn');
  const collectionAiTranslationStatus = document.getElementById('collectionAiTranslationStatus');
  const refreshCollectionAiTranslationStatusBtn = document.getElementById('refreshCollectionAiTranslationStatusBtn');
  const collectionIncludeSeoInput = document.getElementById('collectionTranslationIncludeSeo');
  const collectionIncludeMediaInput = document.getElementById('collectionTranslationIncludeMedia');

  let archiveToggleBtn = document.getElementById('toggleArchiveBtn');

  function ensureArchiveToggleButton() {
    if (archiveToggleBtn) return;
    const toolbar = document.querySelector('.admin-posts-toolbar') || createBtn?.parentElement;
    if (!toolbar) return;

    archiveToggleBtn = document.createElement('button');
    archiveToggleBtn.type = 'button';
    archiveToggleBtn.id = 'toggleArchiveBtn';
    archiveToggleBtn.className = 'btn btn--secondary';
    archiveToggleBtn.addEventListener('click', () => {
      showArchivedMode = showArchivedMode === 'active' ? 'archived' : 'active';
      updateArchiveButtonLabel();
      renderPostsList(postsCache);
      setStatus(showArchivedMode === 'archived' ? 'Показан только архив.' : 'Показаны активные посты.');
    });

    toolbar.appendChild(archiveToggleBtn);
    updateArchiveButtonLabel();
  }

  function updateArchiveButtonLabel() {
    if (!archiveToggleBtn) return;
    archiveToggleBtn.textContent = showArchivedMode === 'archived' ? 'К активным' : 'Архив';
  }

  function setStatus(text) { if (statusNode) statusNode.textContent = text || ''; }
  function setMediaStatus(text) { if (mediaStatusNode) mediaStatusNode.textContent = text || ''; }
  function setCollectionsStatus(text, reveal = false) {
    if (!collectionsStatusNode) return;
    collectionsStatusNode.textContent = text || '';
    if (reveal && text) {
      collectionsStatusNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  function setTranslationStatusNode(node, text, tone = 'info') {
    if (!node) return;

    node.classList.remove(
      'translation-status--success',
      'translation-status--warning',
      'translation-status--error',
      'translation-status--info',
    );

    if (!text) {
      node.textContent = '';
      return;
    }

    const toneClass = `translation-status--${tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : tone === 'success' ? 'success' : 'info'}`;
    node.classList.add(toneClass);

    const icon = tone === 'success' ? '✅ '
      : tone === 'warning' ? '⚠️ '
      : tone === 'error' ? '❌ '
      : 'ℹ️ ';
    node.textContent = `${icon}${text || ''}`;
  }
  function setAiGenerationUnavailableStatus(message) {
    const text = message
      || 'Backend API сейчас не поддерживает AI-генерацию локализаций. Ожидает backend-интеграции.';

    isAiGenerationRouteEnabled = false;
    setPostTranslationStatus(text, 'error');
    setCollectionTranslationStatus(text, 'error');
    updateTranslationStatusButtonStates();
  }
  function isAiGenerationRouteError(error) {
    const message = String(error?.message || '').toLowerCase();
    const status = Number(error?.status || 0);
    return status === 404
      || message.includes('cannot get /api/admin/posts/')
      || message.includes('cannot get /api/admin/journal-collections/')
      || message.includes('cannot post /api/admin/posts/')
      || message.includes('cannot post /api/admin/journal-collections/')
      || message.includes('cannot post /api/admin/journal-ai/translations/generate');
  }
  function setPostTranslationStatus(text, tone = 'info') {
    setTranslationStatusNode(postAiTranslationStatus, text, tone);
  }
  function setCollectionTranslationStatus(text, tone = 'info') {
    setTranslationStatusNode(collectionAiTranslationStatus, text, tone);
  }
  function updateTranslationStatusButtonStates() {
    const disabledByBackend = !isAiGenerationRouteEnabled;
    if (refreshPostAiTranslationStatusBtn) {
      refreshPostAiTranslationStatusBtn.disabled = !isLoggedIn || !currentPostId;
    }
    if (generateAiPostMissingTranslationsBtn) {
      generateAiPostMissingTranslationsBtn.disabled = !isLoggedIn || !currentPostId || disabledByBackend;
      if (generateAiPostTranslationsBtn) {
        generateAiPostTranslationsBtn.disabled = !isLoggedIn || !currentPostId || disabledByBackend;
      }
    }
    if (refreshCollectionAiTranslationStatusBtn) {
      refreshCollectionAiTranslationStatusBtn.disabled = !isLoggedIn || !currentCollectionId;
    }
    if (generateAiMissingCollectionTranslationsBtn) {
      generateAiMissingCollectionTranslationsBtn.disabled = !isLoggedIn || !currentCollectionId || disabledByBackend;
      if (generateAiCollectionTranslationsBtn) {
        generateAiCollectionTranslationsBtn.disabled = !isLoggedIn || !currentCollectionId || disabledByBackend;
      }
    }
  }
  function mapTranslationStatus(status) {
    const normalized = (status || 'DRAFT').toUpperCase();
    if (normalized === 'NEEDS_REVIEW') return 'на проверке';
    if (normalized === 'PUBLISHED') return 'опубликован';
    if (normalized === 'DRAFT') return 'черновик';
    if (normalized === 'MISSING') return 'нет локализации';
    if (normalized === 'FAILED') return 'ошибка';
    return normalized.toLowerCase();
  }

  function normalizeStatusValue(status) {
    return (status || 'DRAFT').toString().trim().toUpperCase();
  }

  function translationRowTone(translations) {
    if (!Array.isArray(translations) || !translations.length) {
      return 'info';
    }

    const hasFailed = translations.some((item) => normalizeStatusValue(item?.status) === 'FAILED');
    const hasMissing = translations.some((item) => {
      const status = normalizeStatusValue(item?.status);
      return status === 'MISSING';
    });

    if (hasFailed) return 'error';
    if (hasMissing) return 'warning';
    return 'success';
  }

  function translationGenerationTone(items) {
    if (!Array.isArray(items) || !items.length) {
      return 'warning';
    }

    const hasFailed = items.some((item) => item?.status && normalizeStatusValue(item.status) === 'FAILED');
    const hasError = items.some((item) => item?.error);
    if (hasError || hasFailed) return 'error';

    const allSkipped = items.every((item) => item?.skipped);
    if (allSkipped) return 'warning';
    return 'success';
  }

  function normalizeLanguage(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function getTargetLanguagesFromSelection(scopeName) {
    return collectCheckedLanguages(scopeName);
  }

  function getExistingTranslationMap(existingTranslations) {
    const byLanguage = new Map();
    if (!Array.isArray(existingTranslations)) return byLanguage;

    existingTranslations.forEach((translation) => {
      const lang = normalizeLanguage(translation?.language);
      if (!lang) return;
      byLanguage.set(lang, translation?.status || 'DRAFT');
    });
    return byLanguage;
  }

  function buildTranslationStatusSummary(translations) {
    if (!Array.isArray(translations) || !translations.length) {
      return 'Локализации пока не создавались.';
    }

    const parts = translations
      .map((item) => `${item.language?.trim() || '—'}:${mapTranslationStatus(item.status)}`)
      .filter((line) => line && line !== '—:нет локализации')
      .sort((a, b) => a.localeCompare(b));

    if (!parts.length) {
      return 'Локализации пока не создавались.';
    }

    const publishedCount = translations.filter((item) => (item?.status || '').toUpperCase() === 'PUBLISHED').length;
    const draftCount = translations.filter((item) => (item?.status || '').toUpperCase() === 'DRAFT').length;
    const reviewCount = translations.filter((item) => (item?.status || '').toUpperCase() === 'NEEDS_REVIEW').length;
    const failedCount = translations.filter((item) => (item?.status || '').toUpperCase() === 'FAILED').length;

    const totals = [];
    if (publishedCount) totals.push(`опубликовано ${publishedCount}`);
    if (reviewCount) totals.push(`на проверке ${reviewCount}`);
    if (draftCount) totals.push(`черновики ${draftCount}`);
    if (failedCount) totals.push(`ошибки ${failedCount}`);
    const total = totals.length ? ` (${totals.join(', ')})` : '';

    return `Локализации${total}: ${parts.join(', ')}`;
  }

  function filterLanguagesForMissingOnly(selectedLanguages, existingTranslations = []) {
    const selected = Array.isArray(selectedLanguages)
      ? selectedLanguages
      : getTargetLanguagesFromSelection(selectedLanguages);
    if (!Array.isArray(existingTranslations) || !existingTranslations.length) return selected;

    const statusByLanguage = getExistingTranslationMap(existingTranslations);
    return selected.filter((language) => {
      const normalized = normalizeLanguage(language);
      return statusByLanguage.get(normalized)?.toUpperCase() !== 'PUBLISHED';
    });
  }

  function setCollectionSaving(isSaving) {
    if (!saveCollectionBtn) return;
    saveCollectionBtn.disabled = isSaving;
    saveCollectionBtn.textContent = isSaving ? 'Сохраняем...' : 'Сохранить многостраничную запись';
  }
  function setLoggedInUI(loggedIn) {
    isLoggedIn = loggedIn;
    if (loginForm) loginForm.style.display = loggedIn ? 'none' : '';
    updateTranslationStatusButtonStates();
  }

  function advancedValuesFromForm() {
    return [
      'titleEn',
      'excerptEn',
      'contentEn',
      'seoTitleRu',
      'seoTitleEn',
      'seoDescriptionRu',
      'seoDescriptionEn',
    ].some((id) => (document.getElementById(id)?.value || '').trim());
  }

  function advancedValuesFromPost(post) {
    return !!(
      post?.titleEn ||
      post?.excerptEn ||
      post?.contentEn ||
      post?.seoTitleRu ||
      post?.seoTitleEn ||
      post?.seoDescriptionRu ||
      post?.seoDescriptionEn
    );
  }

  function updateAdvancedFieldsSummary(hasValues = advancedValuesFromForm()) {
    if (!advancedFieldsSummary) return;
    const isOpen = form?.classList.contains('is-advanced-open');
    if (isOpen) {
      advancedFieldsSummary.textContent = 'Открыто: переводы и SEO доступны для редактирования.';
      return;
    }
    advancedFieldsSummary.textContent = hasValues
      ? 'Свернуто: переводы/SEO уже есть, данные сохранятся.'
      : 'Свернуто: можно писать и публиковать только по-русски.';
  }

  function setAdvancedFieldsExpanded(expanded, persist = true, hasValues = advancedValuesFromForm()) {
    if (!form) return;
    form.classList.toggle('is-advanced-open', expanded);
    form.classList.toggle('is-advanced-collapsed', !expanded);
    if (advancedToggleBtn) {
      advancedToggleBtn.textContent = expanded ? 'Свернуть переводы и SEO' : 'Переводы и SEO';
      advancedToggleBtn.setAttribute('aria-expanded', String(expanded));
    }
    if (persist) writeJson(STORAGE_ADVANCED_OPEN, expanded);
    updateAdvancedFieldsSummary(hasValues);
  }

  function escapeHtml(text) {
    return (text || '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  }

  function resolveApiAssetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}${path}`;
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }
  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function translitRuToLatin(value) {
    const map = { а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'ts', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya' };
    return (value || '').toLowerCase().split('').map((char) => map[char] !== undefined ? map[char] : char).join('');
  }

  function slugify(value) {
    return translitRuToLatin(value || '')
      .toLowerCase().trim().replace(/['"`]/g, '').replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  function toDatetimeLocal(value) {
    if (!value) return '';
    try {
      const d = new Date(value);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ''; }
  }
  function fromDatetimeLocal(value) { return value ? new Date(value).toISOString() : null; }

  function getStatusLabel(status) {
    if (status === 'DRAFT') return 'ЧЕРНОВИК';
    if (status === 'PUBLISHED') return 'ОПУБЛИКОВАН';
    if (status === 'ARCHIVED') return 'АРХИВ';
    return status || '';
  }

  function collectCheckedLanguages(scopeName) {
    return Array.from(document.querySelectorAll(`input[name="${scopeName}"]`))
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value.toLowerCase().trim())
      .filter((value, index, all) => value && all.indexOf(value) === index);
  }

  function collectAiTranslationPayload(scopeName, includeSeoCheckbox, includeMediaCheckbox) {
    const targetLanguages = collectCheckedLanguages(scopeName);
    return {
      sourceLanguage: 'ru',
      targetLanguages,
      includeMedia: includeMediaCheckbox?.checked !== false,
      includeSeo: includeSeoCheckbox?.checked !== false,
    };
  }

  function summarizeTranslationResult(items = []) {
    if (!Array.isArray(items) || !items.length) {
      return 'Нет языков для генерации или изменений не применено.';
    }
    const lines = items.map((item) => {
      if (item?.skipped) {
        return `${item.language}: пропущен (${item.reason || 'не применено'})`;
      }
      return `${item.language}: ${item.status || 'обновлено'}`;
    });
    return `Результат: ${lines.join(', ')}`;
  }

  function summarizeAndTone(items = []) {
    const text = summarizeTranslationResult(items);
    return {
      text,
      tone: translationGenerationTone(items),
    };
  }

  function setBusy(btn, busy, text) {
    if (!btn) return;
    btn.disabled = busy;
    if (text) {
      btn.dataset.originalText = text;
    }
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.textContent || '';
    }
    if (busy) {
      btn.textContent = 'Обрабатываем...';
    } else {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: { ...(options.headers || {}) },
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
    if (!res.ok) {
      const error = new Error(data?.error?.message || `Ошибка запроса (${res.status})`);
      error.status = res.status;
      error.path = path;
      error.body = data;
      throw error;
    }
    return data?.data?.data || data?.data || data;
  }

  async function login(email, password) {
    return api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  async function listPosts() { return api('/admin/posts'); }
  async function listGroups() { return api('/admin/journal-groups'); }
  async function listCollections() { return api('/admin/journal-collections'); }
  async function listPostTranslations(id) { return api(`/admin/posts/${encodeURIComponent(id)}/translations`); }
  async function listCollectionTranslations(id) { return api(`/admin/journal-collections/${encodeURIComponent(id)}/translations`); }
  async function generatePostTranslations(id, payload) {
    return api(`/admin/posts/${encodeURIComponent(id)}/translations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  async function generateCollectionTranslations(id, payload) {
    return api(`/admin/journal-collections/${encodeURIComponent(id)}/translations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  async function createGroup(payload) {
    return api('/admin/journal-groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function getPost(id) { return api(`/admin/posts/${encodeURIComponent(id)}`); }
  async function getCollection(id) { return api(`/admin/journal-collections/${encodeURIComponent(id)}`); }
  async function createPost(payload) {
    return api('/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function createCollection(payload) {
    return api('/admin/journal-collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function updatePost(id, payload) {
    return api(`/admin/posts/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function updateCollection(id, payload) {
    return api(`/admin/journal-collections/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function rebuildGps() {
    return api('/admin/gps/rebuild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  }

  async function uploadMedia(postId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return api(`/admin/posts/${encodeURIComponent(postId)}/media`, { method: 'POST', body: formData });
  }
  async function deleteMedia(postId, mediaId) {
    return api(`/admin/posts/${encodeURIComponent(postId)}/media/${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
  }
  async function updateMediaMeta(postId, mediaId, payload) {
    return api(`/admin/posts/${encodeURIComponent(postId)}/media/${encodeURIComponent(mediaId)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
  }
  async function reorderMedia(postId, mediaIds) {
    return api(`/admin/posts/${encodeURIComponent(postId)}/media/reorder/sort`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaIds }),
    });
  }

  function moveMediaItem(mediaId, direction) {
    const items = [...currentMediaItems];
    const index = items.findIndex((item) => item.id === mediaId);
    if (index === -1) return null;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return null;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    return items;
  }

  function getVisiblePosts(items) {
    return items.filter((item) => {
      if (showArchivedMode === 'archived') return item.status === 'ARCHIVED';
      return item.status !== 'ARCHIVED';
    });
  }


  function ensureGroupControls() {
    groupSelect = document.getElementById('groupId');
    groupOrderInput = document.getElementById('groupOrder');

    if (!groupSelect) {
      const grid = document.querySelector('.post-editor-grid');
      if (grid) {
        grid.insertAdjacentHTML('beforeend', `
          <label>
            <span>Группа записей</span>
            <select id="groupId">
              <option value="">Без группы</option>
            </select>
          </label>
          <label>
            <span>Порядок в группе</span>
            <input type="number" id="groupOrder" min="0" step="1" value="0" />
          </label>
        `);
      }
      groupSelect = document.getElementById('groupId');
      groupOrderInput = document.getElementById('groupOrder');
    }

    const toolbar = document.querySelector('.admin-posts-toolbar');
    if (toolbar && !document.getElementById('createGroupBtn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'createGroupBtn';
      btn.className = 'btn btn--secondary';
      btn.textContent = 'Новая группа';
      btn.onclick = promptCreateGroup;
      toolbar.appendChild(btn);
    }
  }

  function renderGroupControls(selectedId) {
    ensureGroupControls();
    if (!groupSelect) return;

    const current = selectedId !== undefined ? selectedId : groupSelect.value;
    const options = ['<option value="">Без группы</option>'].concat(groupsCache.map((group) => {
      const label = group.titleRu || group.titleEn || group.slug;
      const count = Number(group.postsCount || group._count?.posts || 0);
      return `<option value="${escapeHtml(group.id)}">${escapeHtml(label)}${count ? ` (${count})` : ''}</option>`;
    }));

    groupSelect.innerHTML = options.join('');
    groupSelect.value = current || '';
  }

  async function refreshGroups() {
    ensureGroupControls();
    groupsCache = await listGroups();
    renderGroupControls();
  }

  async function promptCreateGroup() {
    if (!isLoggedIn) return;

    const titleRu = window.prompt('Название группы RU');
    if (!titleRu || !titleRu.trim()) return;

    const titleEn = window.prompt('Название группы EN (можно оставить пустым)') || '';
    const slug = slugify(titleEn || titleRu) || `group-${Date.now()}`;

    try {
      setStatus('Создаём группу записей...');
      const group = await createGroup({
        titleRu: titleRu.trim(),
        titleEn: titleEn.trim() || undefined,
        slug,
        status: 'PUBLISHED',
        sortOrder: groupsCache.length,
      });
      await refreshGroups();
      if (groupSelect) groupSelect.value = group.id;
      setStatus('Группа создана. Теперь можно сохранить пост в этой группе.');
    } catch (error) {
      setStatus(error.message || 'Не удалось создать группу.');
    }
  }
  function renderPostsList(items) {
    const visibleItems = getVisiblePosts(items);

    if (!visibleItems.length) {
      postsListNode.innerHTML = `<div class="admin-post-meta">${showArchivedMode === 'archived' ? 'В архиве пока пусто.' : 'Активных постов пока нет.'}</div>`;
      return;
    }

    postsListNode.innerHTML = visibleItems.map((item) => `
      <article class="admin-post-item ${item.id === currentPostId ? 'is-active' : ''}" data-post-id="${escapeHtml(item.id)}">
        <h3>${escapeHtml(item.titleRu || item.titleEn || item.slug)}</h3>
        <div class="admin-post-meta">
          <div>Статус: ${escapeHtml(getStatusLabel(item.status))}</div>
          <div>Slug: ${escapeHtml(item.slug)}</div>
          <div>Медиа: ${escapeHtml(String(item.mediaCount || item._count?.media || 0))}</div>
          <div>Комментарии: ${escapeHtml(String(item.commentsCount || item._count?.comments || 0))}</div>
          <div>Лайки: ${escapeHtml(String(item.likesCount || item._count?.likes || 0))}</div>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.admin-post-item').forEach((node) => {
      node.addEventListener('click', async () => {
        const id = node.dataset.postId;
        if (!id) return;
        await loadPost(id);
      });
    });
  }

  function getPostTitle(post) {
    return post?.titleRu || post?.titleEn || post?.slug || 'Без названия';
  }

  function getCollectionSelectedPages(pages = []) {
    return pages
      .map((page, index) => ({
        postId: page?.post?.id || page?.postId || '',
        pageOrder: Number.isFinite(Number(page?.pageOrder)) ? Number(page.pageOrder) : index,
      }))
      .filter((page) => page.postId);
  }

  async function refreshPostTranslationStatus(postId) {
    if (!postId || !isLoggedIn) {
      postTranslationRows = [];
      setPostTranslationStatus('', 'info');
      return [];
    }

    try {
      const payload = await listPostTranslations(postId);
      const translations = Array.isArray(payload?.translations) ? payload.translations : [];
      postTranslationRows = translations;
      setPostTranslationStatus(
        buildTranslationStatusSummary(translations),
        translationRowTone(translations),
      );
      return translations;
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      postTranslationRows = [];
      setPostTranslationStatus('Не удалось загрузить статусы локализаций.', 'error');
      return [];
    }
  }

  async function refreshCollectionTranslationStatus(collectionId) {
    if (!collectionId || !isLoggedIn) {
      collectionTranslationRows = [];
      setCollectionTranslationStatus('', 'info');
      return [];
    }

    try {
      const payload = await listCollectionTranslations(collectionId);
      const translations = Array.isArray(payload?.translations) ? payload.translations : [];
      collectionTranslationRows = translations;
      setCollectionTranslationStatus(
        buildTranslationStatusSummary(translations),
        translationRowTone(translations),
      );
      return translations;
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      collectionTranslationRows = [];
      setCollectionTranslationStatus('Не удалось загрузить статусы локализаций.', 'error');
      return [];
    }
  }

  function collectCollectionPages() {
    if (!collectionPagesPicker) return [];

    return Array.from(collectionPagesPicker.querySelectorAll('[data-collection-page-post]'))
      .filter((checkbox) => checkbox.checked)
      .map((checkbox, index) => {
        const postId = checkbox.dataset.collectionPagePost;
        const orderInput = Array.from(collectionPagesPicker.querySelectorAll('[data-collection-page-order]'))
          .find((input) => input.dataset.collectionPageOrder === postId);
        const pageOrder = Number(orderInput?.value);
        return {
          postId,
          pageOrder: Number.isFinite(pageOrder) ? Math.trunc(pageOrder) : index,
        };
      })
      .filter((page) => page.postId);
  }

  function renderCollectionPagesPicker(selectedPages = collectCollectionPages()) {
    if (!collectionPagesPicker) return;

    const selected = new Map(getCollectionSelectedPages(selectedPages).map((page) => [page.postId, page.pageOrder]));
    const items = postsCache.filter((post) => post.status !== 'ARCHIVED');

    if (!items.length) {
      collectionPagesPicker.innerHTML = '<div class="admin-post-meta">Сначала создайте обычные посты-страницы.</div>';
      return;
    }

    collectionPagesPicker.innerHTML = items.map((post, index) => {
      const checked = selected.has(post.id);
      const order = checked ? selected.get(post.id) : index;
      return `
        <label class="collection-page-row">
          <input type="checkbox" data-collection-page-post="${escapeHtml(post.id)}" ${checked ? 'checked' : ''} />
          <span>
            <span class="collection-page-title">${escapeHtml(getPostTitle(post))}</span>
            <span class="admin-post-meta">Slug: ${escapeHtml(post.slug || '')} · ${escapeHtml(getStatusLabel(post.status))}</span>
          </span>
          <input type="number" data-collection-page-order="${escapeHtml(post.id)}" min="0" step="1" value="${escapeHtml(String(order))}" aria-label="Порядок страницы" />
        </label>
      `;
    }).join('');
  }

  function renderCollectionsList(items = collectionsCache) {
    if (!collectionsListNode) return;

    if (!items.length) {
      collectionsListNode.innerHTML = '<div class="admin-post-meta">Многостраничных записей пока нет. Нажмите «Новая обложка» и соберите материал из существующих постов-страниц.</div>';
      return;
    }

    collectionsListNode.innerHTML = items.map((item) => `
      <article class="journal-collection-item ${item.id === currentCollectionId ? 'is-active' : ''}" data-collection-id="${escapeHtml(item.id)}">
        <h3>${escapeHtml(item.titleRu || item.titleEn || item.slug)}</h3>
        <div class="admin-post-meta">
          <div>Статус: ${escapeHtml(getStatusLabel(item.status))}</div>
          <div>Slug: ${escapeHtml(item.slug || '')}</div>
          <div>Страницы: ${escapeHtml(String(item.pagesCount || item.pages?.length || 0))}</div>
          <div>Комментарии: ${escapeHtml(String(item.commentsCount || 0))}</div>
          <div>Лайки: ${escapeHtml(String(item.likesCount || 0))}</div>
        </div>
      </article>
    `).join('');

    collectionsListNode.querySelectorAll('.journal-collection-item').forEach((node) => {
      node.addEventListener('click', async () => {
        const id = node.dataset.collectionId;
        if (!id) return;
        await loadCollection(id);
      });
    });
  }

  function fillCollectionForm(collection) {
    currentCollectionId = collection?.id || '';
    collectionSlugTouched = true;

    document.getElementById('collectionId').value = collection?.id || '';
    document.getElementById('collectionTitleRu').value = collection?.titleRu || '';
    document.getElementById('collectionSlug').value = collection?.slug || '';
    document.getElementById('collectionStatus').value = collection?.status || 'DRAFT';
    document.getElementById('collectionPublishedAt').value = toDatetimeLocal(collection?.publishedAt);
    document.getElementById('collectionPinned').value = String(!!collection?.isPinned);
    document.getElementById('collectionAuthorLine').value = collection?.authorLine || COLLECTION_AUTHOR_DEFAULT;
    document.getElementById('collectionExcerptRu').value = collection?.excerptRu || '';
    document.getElementById('collectionCoverMediaId').value = collection?.coverMedia?.id || collection?.coverMediaId || '';

    renderCollectionPagesPicker(collection?.pages || []);
    renderCollectionsList();

    if (openPublicCollectionLink) {
      openPublicCollectionLink.href = collection?.slug
        ? `journal.html?collection=${encodeURIComponent(collection.slug)}`
        : 'journal.html';
    }
    void refreshCollectionTranslationStatus(collection?.id);
    updateTranslationStatusButtonStates();
  }

  function clearCollectionForm() {
    currentCollectionId = '';
    collectionSlugTouched = false;
    collectionTranslationRows = [];
    collectionForm?.reset();
    document.getElementById('collectionId').value = '';
    document.getElementById('collectionStatus').value = 'DRAFT';
    document.getElementById('collectionPinned').value = 'false';
    document.getElementById('collectionPublishedAt').value = '';
    document.getElementById('collectionSlug').value = '';
    document.getElementById('collectionAuthorLine').value = COLLECTION_AUTHOR_DEFAULT;
    renderCollectionPagesPicker([]);
    renderCollectionsList();
    setCollectionTranslationStatus('');
    updateTranslationStatusButtonStates();
    if (openPublicCollectionLink) openPublicCollectionLink.href = 'journal.html';
  }

  function collectCollectionPayload() {
    return {
      titleRu: document.getElementById('collectionTitleRu').value.trim(),
      slug: document.getElementById('collectionSlug').value.trim(),
      excerptRu: document.getElementById('collectionExcerptRu').value.trim() || undefined,
      status: document.getElementById('collectionStatus').value,
      publishedAt: fromDatetimeLocal(document.getElementById('collectionPublishedAt').value),
      isPinned: document.getElementById('collectionPinned').value === 'true',
      authorLine: document.getElementById('collectionAuthorLine').value.trim() || COLLECTION_AUTHOR_DEFAULT,
      coverMediaId: document.getElementById('collectionCoverMediaId').value.trim() || null,
      sourceLanguage: 'ru',
      allowComments: true,
      allowLikes: true,
      pages: collectCollectionPages(),
    };
  }

  async function refreshCollections(selectCollectionId, options = {}) {
    if (!isLoggedIn || !collectionsListNode) return;

    try {
      collectionsCache = await listCollections();
      renderCollectionsList(collectionsCache);
      if (selectCollectionId) await loadCollection(selectCollectionId);
      else if (currentCollectionId) await loadCollection(currentCollectionId);
      else clearCollectionForm();
      setCollectionsStatus(collectionsCache.length ? 'Многостраничные записи загружены.' : 'Многостраничных записей пока нет.');
    } catch (error) {
      collectionsCache = [];
      if (collectionsListNode) {
        collectionsListNode.innerHTML = '<div class="admin-post-meta">Не удалось загрузить многостраничные записи. Проверьте вход в админку и нажмите «Обновить».</div>';
      }
      renderCollectionPagesPicker();
      setCollectionsStatus(options.silent
        ? 'Многостраничные записи временно не загрузились.'
        : (error.message || 'Не удалось загрузить многостраничные записи.'));
    }
  }

  async function loadCollection(id) {
    if (!isLoggedIn) return;

    try {
      setCollectionsStatus('Загружаем многостраничную запись...');
      const collection = await getCollection(id);
      fillCollectionForm(collection);
      setCollectionsStatus('Многостраничная запись загружена.');
    } catch (error) {
      setCollectionsStatus(error.message || 'Не удалось загрузить многостраничную запись.');
    }
  }

  function renderMediaList(media) {
    if (!mediaListNode) return;

    currentMediaItems = Array.isArray(media)
      ? [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [];

    if (!currentMediaItems.length) {
      mediaListNode.innerHTML = '<div class="admin-post-meta">Медиа пока нет.</div>';
      return;
    }

    mediaListNode.innerHTML = currentMediaItems.map((item, index) => `
      <div class="media-item">
        <div><strong>${escapeHtml(item.type)}</strong></div>
        <div class="admin-post-meta"><strong>ID:</strong> ${escapeHtml(item.id || '')}</div>
        <div class="admin-post-meta"><strong>Порядок:</strong> ${escapeHtml(String(item.sortOrder ?? '—'))}</div>
        <div class="admin-post-meta"><strong>Путь:</strong> ${escapeHtml(item.filePath || '')}</div>

        <label style="margin-top:10px; display:block;">
          <span>Alt RU</span>
          <input type="text" data-media-alt-ru="${escapeHtml(item.id)}" value="${escapeHtml(item.altRu || '')}" />
        </label>

        <label style="margin-top:10px; display:block;">
          <span>Alt EN</span>
          <input type="text" data-media-alt-en="${escapeHtml(item.id)}" value="${escapeHtml(item.altEn || '')}" />
        </label>

        <div class="post-editor-actions" style="margin-top:10px;">
          <button class="btn btn--secondary" type="button" data-move-media="${escapeHtml(item.id)}" data-direction="up" ${index === 0 ? 'disabled' : ''}>↑ Вверх</button>
          <button class="btn btn--secondary" type="button" data-move-media="${escapeHtml(item.id)}" data-direction="down" ${index === currentMediaItems.length - 1 ? 'disabled' : ''}>↓ Вниз</button>
          <button class="btn btn--secondary" type="button" data-save-media-alt="${escapeHtml(item.id)}">Сохранить alt</button>
          <button class="btn btn--secondary" type="button" data-delete-media="${escapeHtml(item.id)}">Удалить</button>
          <a class="btn btn--secondary" href="${escapeHtml(resolveApiAssetUrl(item.filePath) || '#')}" target="_blank" rel="noopener">Открыть файл</a>
        </div>

        ${item.type === 'VIDEO'
          ? `<video src="${escapeHtml(resolveApiAssetUrl(item.filePath))}" controls playsinline></video>`
          : `<img src="${escapeHtml(resolveApiAssetUrl(item.filePath))}" alt="${escapeHtml(item.altRu || item.altEn || '')}" />`}
      </div>
    `).join('');

    document.querySelectorAll('[data-move-media]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mediaId = btn.dataset.moveMedia;
        const direction = btn.dataset.direction;
        if (!mediaId || !direction || !currentPostId) return;

        const moved = moveMediaItem(mediaId, direction);
        if (!moved) return;

        try {
          setMediaStatus('Меняем порядок медиа...');
          await reorderMedia(currentPostId, moved.map((item) => item.id));
          await refreshPosts(currentPostId);
          setMediaStatus('Порядок медиа обновлён.');
        } catch (error) {
          setMediaStatus(error.message || 'Не удалось изменить порядок медиа.');
        }
      });
    });

    document.querySelectorAll('[data-save-media-alt]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mediaId = btn.dataset.saveMediaAlt;
        if (!mediaId || !currentPostId) return;

        const altRu = document.querySelector(`[data-media-alt-ru="${mediaId}"]`)?.value || '';
        const altEn = document.querySelector(`[data-media-alt-en="${mediaId}"]`)?.value || '';

        try {
          setMediaStatus('Сохраняем alt...');
          await updateMediaMeta(currentPostId, mediaId, { altRu, altEn });
          await refreshPosts(currentPostId);
          setMediaStatus('Alt сохранён.');
        } catch (error) {
          setMediaStatus(error.message || 'Не удалось сохранить alt.');
        }
      });
    });

    document.querySelectorAll('[data-delete-media]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mediaId = btn.dataset.deleteMedia;
        if (!mediaId || !currentPostId) return;

        const ok = window.confirm('Удалить этот медиафайл?');
        if (!ok) return;

        try {
          setMediaStatus('Удаляем медиа...');
          await deleteMedia(currentPostId, mediaId);
          await refreshPosts(currentPostId);
          setMediaStatus('Медиа удалено.');
        } catch (error) {
          setMediaStatus(error.message || 'Не удалось удалить медиа.');
        }
      });
    });
  }

  function fillForm(post) {
    currentPostId = post?.id || '';
    slugTouched = true;

    document.getElementById('postId').value = post?.id || '';
    document.getElementById('slug').value = post?.slug || '';
    document.getElementById('status').value = post?.status || 'DRAFT';
    document.getElementById('publishedAt').value = toDatetimeLocal(post?.publishedAt);
    document.getElementById('isPinned').value = String(!!post?.isPinned);
    renderGroupControls(post?.groupId || '');
    if (groupSelect) groupSelect.value = post?.groupId || '';
    if (groupOrderInput) groupOrderInput.value = String(post?.groupOrder ?? 0);
    document.getElementById('allowComments').value = String(post?.allowComments !== false);
    document.getElementById('allowLikes').value = String(post?.allowLikes !== false);
    document.getElementById('titleRu').value = post?.titleRu || '';
    document.getElementById('titleEn').value = post?.titleEn || '';
    document.getElementById('excerptRu').value = post?.excerptRu || '';
    document.getElementById('excerptEn').value = post?.excerptEn || '';
    document.getElementById('contentRu').value = post?.contentRu || '';
    document.getElementById('contentEn').value = post?.contentEn || '';
    document.getElementById('seoTitleRu').value = post?.seoTitleRu || '';
    document.getElementById('seoTitleEn').value = post?.seoTitleEn || '';
    document.getElementById('seoDescriptionRu').value = post?.seoDescriptionRu || '';
    document.getElementById('seoDescriptionEn').value = post?.seoDescriptionEn || '';
    setAdvancedFieldsExpanded(!!readJson(STORAGE_ADVANCED_OPEN, false), false, advancedValuesFromPost(post));

    if (openPublicLink) {
      openPublicLink.href = post?.slug ? `journal.html?slug=${encodeURIComponent(post.slug)}` : 'journal.html';
    }

    renderMediaList(post?.media || []);
    void refreshPostTranslationStatus(post?.id);
    updateTranslationStatusButtonStates();
    renderPostsList(postsCache);
  }

  function clearFormForNewPost() {
    currentPostId = '';
    slugTouched = false;
    currentMediaItems = [];
    postTranslationRows = [];
    form.reset();
    document.getElementById('postId').value = '';
    document.getElementById('status').value = 'DRAFT';
    document.getElementById('isPinned').value = 'false';
    document.getElementById('allowComments').value = 'true';
    document.getElementById('allowLikes').value = 'true';
    document.getElementById('publishedAt').value = '';
    document.getElementById('slug').value = '';
    setAdvancedFieldsExpanded(false, false, false);
    ensureGroupControls();
    renderGroupControls('');
    if (groupSelect) groupSelect.value = '';
    if (groupOrderInput) groupOrderInput.value = '0';
    mediaListNode.innerHTML = '<div class="admin-post-meta">Сначала сохраните пост, потом загружайте медиа.</div>';
    openPublicLink.href = 'journal.html';
    setPostTranslationStatus('');
    updateTranslationStatusButtonStates();
    renderPostsList(postsCache);
  }

  function collectPayload() {
    return {
      slug: document.getElementById('slug').value.trim(),
      titleRu: document.getElementById('titleRu').value.trim(),
      titleEn: document.getElementById('titleEn').value.trim() || undefined,
      excerptRu: document.getElementById('excerptRu').value.trim() || undefined,
      excerptEn: document.getElementById('excerptEn').value.trim() || undefined,
      contentRu: document.getElementById('contentRu').value.trim(),
      contentEn: document.getElementById('contentEn').value.trim() || undefined,
      status: document.getElementById('status').value,
      publishedAt: fromDatetimeLocal(document.getElementById('publishedAt').value),
      allowComments: document.getElementById('allowComments').value === 'true',
      allowLikes: document.getElementById('allowLikes').value === 'true',
      isPinned: document.getElementById('isPinned').value === 'true',
      groupId: document.getElementById('groupId')?.value || null,
      groupOrder: Number(document.getElementById('groupOrder')?.value || 0),
      seoTitleRu: document.getElementById('seoTitleRu').value.trim() || undefined,
      seoTitleEn: document.getElementById('seoTitleEn').value.trim() || undefined,
      seoDescriptionRu: document.getElementById('seoDescriptionRu').value.trim() || undefined,
      seoDescriptionEn: document.getElementById('seoDescriptionEn').value.trim() || undefined,
    };
  }

  async function refreshPosts(selectPostId) {
    postsCache = await listPosts();
    updateArchiveButtonLabel();
    renderPostsList(postsCache);
    renderCollectionPagesPicker();
    if (selectPostId) await loadPost(selectPostId);
    else if (currentPostId) await loadPost(currentPostId);
  }

  async function loadPost(id) {
    setStatus('Загрузка поста...');
    const post = await getPost(id);
    fillForm(post);
    setStatus('Пост загружен.');
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('adminPostsEmail').value.trim();
    const password = document.getElementById('adminPostsPassword').value;
    if (!email || !password) return;

    setStatus('Входим...');
    try {
      await login(email, password);
      isAiGenerationRouteEnabled = true;
      setLoggedInUI(true);
      setStatus('Вход выполнен. Загружаем посты...');
      await refreshGroups();
      postsCache = await listPosts();
      updateArchiveButtonLabel();
      renderPostsList(postsCache);
      await refreshCollections(null, { silent: true });
      if (currentPostId) {
        void refreshPostTranslationStatus(currentPostId);
      }
      if (currentCollectionId) {
        void refreshCollectionTranslationStatus(currentCollectionId);
      }
      clearFormForNewPost();
      setStatus('Вы вошли. Можно работать с постами.');
    } catch (error) {
      setStatus(error.message || 'Ошибка входа.');
    }
  });

  refreshBtn?.addEventListener('click', async () => {
    if (!isLoggedIn) return;
    setStatus('Обновляем посты...');
    try {
      await refreshPosts();
      await refreshCollections(null, { silent: true });
      setStatus('Посты обновлены.');
    } catch (error) {
      setStatus(error.message || 'Не удалось обновить посты.');
    }
  });

  rebuildGpsBtn?.addEventListener('click', async () => {
    if (!isLoggedIn) return;
    setStatus('Обновляем GPS-координаты...');
    rebuildGpsBtn.disabled = true;
    try {
      const result = await rebuildGps();
      const details = (result.stdout || '').trim();
      setStatus(details ? `GPS обновлён. ${details}` : 'GPS обновлён.');
    } catch (error) {
      setStatus(error.message || 'Не удалось обновить GPS.');
    } finally {
      rebuildGpsBtn.disabled = false;
    }
  });

  createBtn?.addEventListener('click', () => {
    clearFormForNewPost();
    setStatus('Форма нового поста готова.');
  });

  newCollectionBtn?.addEventListener('click', () => {
    if (!isLoggedIn) {
      setCollectionsStatus('Сначала войдите в админку, затем создайте обложку.', true);
      return;
    }
    clearCollectionForm();
    setCollectionsStatus('Форма готова: заполните название обложки RU и нажмите «Сохранить многостраничную запись». Страницы можно добавить сразу или позже.', true);
    collectionTitleRuInput?.focus();
  });

  refreshCollectionsBtn?.addEventListener('click', async () => {
    if (!isLoggedIn) return;
    setCollectionsStatus('Обновляем многостраничные записи...');
    await refreshCollections();
  });

  slugInput?.addEventListener('input', () => { slugTouched = true; });
  collectionSlugInput?.addEventListener('input', () => { collectionSlugTouched = true; });

  titleRuInput?.addEventListener('input', (event) => {
    if (!slugTouched || !slugInput.value.trim()) {
      slugInput.value = slugify(event.target.value);
    }
  });

  collectionTitleRuInput?.addEventListener('input', (event) => {
    if (!collectionSlugTouched || !collectionSlugInput.value.trim()) {
      collectionSlugInput.value = slugify(event.target.value);
    }
  });

  advancedToggleBtn?.addEventListener('click', () => {
    const next = !form?.classList.contains('is-advanced-open');
    setAdvancedFieldsExpanded(next);
  });

  generateAiPostTranslationsBtn?.addEventListener('click', async () => {
    if (!currentPostId) {
      setStatus('Сначала откройте или создайте пост.');
      return;
    }

    const payload = collectAiTranslationPayload(
      'postTranslationLanguage',
      postIncludeSeoInput,
      postIncludeMediaInput,
    );

    if (!payload.targetLanguages.length) {
      setStatus('Выберите хотя бы один язык.');
      setPostTranslationStatus('Не выбраны языки.', 'warning');
      return;
    }

    try {
      setBusy(generateAiPostTranslationsBtn, true, generateAiPostTranslationsBtn.textContent);
      setPostTranslationStatus('Инициируем AI-перевод...', 'info');
      const response = await generatePostTranslations(currentPostId, payload);
      const { text, tone } = summarizeAndTone(response?.items || []);
      setPostTranslationStatus(text, tone);
      setStatus(`AI-перевод на пост завершен. ${text}`);
      await refreshPostTranslationStatus(currentPostId);
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      setPostTranslationStatus(error.message || 'Не удалось сгенерировать локализации.', 'error');
      setStatus(error.message || 'Не удалось сгенерировать локализации.');
    } finally {
      setBusy(generateAiPostTranslationsBtn, false);
    }
  });

  refreshPostAiTranslationStatusBtn?.addEventListener('click', async () => {
    if (!currentPostId) {
      setPostTranslationStatus('Сначала откройте пост.');
      return;
    }

    try {
      setBusy(refreshPostAiTranslationStatusBtn, true, refreshPostAiTranslationStatusBtn.textContent);
      setPostTranslationStatus('Проверяем локализации...', 'info');
      await refreshPostTranslationStatus(currentPostId);
    } catch (error) {
      setPostTranslationStatus(error.message || 'Не удалось обновить статусы локализаций.', 'error');
    } finally {
      setBusy(refreshPostAiTranslationStatusBtn, false);
    }
  });

  generateAiCollectionTranslationsBtn?.addEventListener('click', async () => {
    if (!currentCollectionId) {
      setCollectionsStatus('Сначала откройте или сохраните многостраничную запись.');
      return;
    }

    const payload = collectAiTranslationPayload(
      'collectionTranslationLanguage',
      collectionIncludeSeoInput,
      collectionIncludeMediaInput,
    );

    if (!payload.targetLanguages.length) {
      setCollectionTranslationStatus('Не выбраны языки.', 'warning');
      setCollectionsStatus('Не выбраны языки.');
      return;
    }

    try {
      setBusy(generateAiCollectionTranslationsBtn, true, generateAiCollectionTranslationsBtn.textContent);
      setCollectionTranslationStatus('Инициируем AI-перевод...', 'info');
      const response = await generateCollectionTranslations(currentCollectionId, payload);
      const { text, tone } = summarizeAndTone(response?.items || []);
      setCollectionTranslationStatus(text, tone);
      setCollectionsStatus(`AI-перевод на многoстраничную запись завершен. ${text}`, true);
      await refreshCollectionTranslationStatus(currentCollectionId);
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      setCollectionTranslationStatus(error.message || 'Не удалось сгенерировать локализации.', 'error');
      setCollectionsStatus(error.message || 'Не удалось сгенерировать локализации.', true);
    } finally {
      setBusy(generateAiCollectionTranslationsBtn, false);
    }
  });

  refreshCollectionAiTranslationStatusBtn?.addEventListener('click', async () => {
    if (!currentCollectionId) {
      setCollectionTranslationStatus('Сначала откройте многостраничную запись.');
      return;
    }

    try {
      setBusy(refreshCollectionAiTranslationStatusBtn, true, refreshCollectionAiTranslationStatusBtn.textContent);
      setCollectionTranslationStatus('Проверяем локализации...', 'info');
      await refreshCollectionTranslationStatus(currentCollectionId);
    } catch (error) {
      setCollectionTranslationStatus(error.message || 'Не удалось обновить статусы локализаций.', 'error');
    } finally {
      setBusy(refreshCollectionAiTranslationStatusBtn, false);
    }
  });

  generateAiPostMissingTranslationsBtn?.addEventListener('click', async () => {
    if (!currentPostId) {
      setPostTranslationStatus('Сначала откройте пост.');
      setStatus('Сначала откройте пост.');
      return;
    }

    try {
      const translations = postTranslationRows?.length ? postTranslationRows : await refreshPostTranslationStatus(currentPostId);
      const selectedLanguages = getTargetLanguagesFromSelection('postTranslationLanguage');
      const targetLanguages = filterLanguagesForMissingOnly(selectedLanguages, translations);

      if (!targetLanguages.length) {
        const message = 'Нет языков для генерации: выбранные уже переведены и опубликованы.';
        setPostTranslationStatus(message, 'warning');
        setStatus(message);
        return;
      }

      const payload = collectAiTranslationPayload(
        'postTranslationLanguage',
        postIncludeSeoInput,
        postIncludeMediaInput,
      );
      payload.targetLanguages = targetLanguages;

      setBusy(generateAiPostMissingTranslationsBtn, true, generateAiPostMissingTranslationsBtn.textContent);
      setPostTranslationStatus('Инициируем AI-перевод для отсутствующих языков...', 'info');
      const response = await generatePostTranslations(currentPostId, payload);
      const { text, tone } = summarizeAndTone(response?.items || []);
      setPostTranslationStatus(text, tone);
      setStatus(`AI-перевод для отсутствующих языков запущен. ${text}`);
      await refreshPostTranslationStatus(currentPostId);
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      setPostTranslationStatus(error.message || 'Не удалось сгенерировать локализации.', 'error');
      setStatus(error.message || 'Не удалось сгенерировать локализации.');
    } finally {
      setBusy(generateAiPostMissingTranslationsBtn, false);
    }
  });

  generateAiMissingCollectionTranslationsBtn?.addEventListener('click', async () => {
    if (!currentCollectionId) {
      setCollectionTranslationStatus('Сначала откройте многостраничную запись.');
      setCollectionsStatus('Сначала откройте многостраничную запись.');
      return;
    }

    try {
      const translations = collectionTranslationRows?.length
        ? collectionTranslationRows
        : await refreshCollectionTranslationStatus(currentCollectionId);
      const selectedLanguages = getTargetLanguagesFromSelection('collectionTranslationLanguage');
      const targetLanguages = filterLanguagesForMissingOnly(selectedLanguages, translations);

      if (!targetLanguages.length) {
        const message = 'Нет языков для генерации: выбранные уже переведены и опубликованы.';
        setCollectionTranslationStatus(message, 'warning');
        setCollectionsStatus(message, true);
        return;
      }

      const payload = collectAiTranslationPayload(
        'collectionTranslationLanguage',
        collectionIncludeSeoInput,
        collectionIncludeMediaInput,
      );
      payload.targetLanguages = targetLanguages;

      setBusy(generateAiMissingCollectionTranslationsBtn, true, generateAiMissingCollectionTranslationsBtn.textContent);
      setCollectionTranslationStatus('Инициируем AI-перевод для отсутствующих языков...', 'info');
      const response = await generateCollectionTranslations(currentCollectionId, payload);
      const { text, tone } = summarizeAndTone(response?.items || []);
      setCollectionTranslationStatus(text, tone);
      setCollectionsStatus(`AI-перевод для отсутствующих языков запущен. ${text}`, true);
      await refreshCollectionTranslationStatus(currentCollectionId);
    } catch (error) {
      if (isAiGenerationRouteError(error)) {
        setAiGenerationUnavailableStatus();
      }
      setCollectionTranslationStatus(error.message || 'Не удалось сгенерировать локализации.', 'error');
      setCollectionsStatus(error.message || 'Не удалось сгенерировать локализации.', true);
    } finally {
      setBusy(generateAiMissingCollectionTranslationsBtn, false);
    }
  });

  document.querySelectorAll('.admin-advanced-field input, .admin-advanced-field textarea').forEach((input) => {
    input.addEventListener('input', () => updateAdvancedFieldsSummary());
  });

  setAdvancedFieldsExpanded(!!readJson(STORAGE_ADVANCED_OPEN, false), false);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isLoggedIn) return;
    const payload = collectPayload();

    if (!payload.slug || !payload.titleRu || !payload.contentRu) {
      setStatus('Обязательные поля: Slug, Заголовок RU и Текст RU.');
      return;
    }

    try {
      if (currentPostId) {
        setStatus('Сохраняем пост...');
        const updated = await updatePost(currentPostId, payload);
        await refreshPosts(updated.id);
        setStatus(updated.status === 'ARCHIVED' ? 'Пост отправлен в архив.' : 'Пост обновлён.');
      } else {
        setStatus('Создаём пост...');
        const created = await createPost(payload);
        await refreshPosts(created.id);
        setStatus('Пост создан.');
      }
    } catch (error) {
      setStatus(error.message || 'Не удалось сохранить пост.');
    }
  });

  collectionForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      setCollectionsStatus('Сессия админки не активна. Войдите снова и повторите сохранение.', true);
      return;
    }

    const payload = collectCollectionPayload();

    if (!payload.titleRu) {
      setCollectionsStatus('Заполните название обложки RU. Slug можно оставить пустым, он создастся из названия.', true);
      collectionTitleRuInput?.focus();
      return;
    }

    if (!payload.slug) {
      payload.slug = slugify(payload.titleRu) || `journal-book-${Date.now()}`;
      if (collectionSlugInput) collectionSlugInput.value = payload.slug;
    }

    try {
      setCollectionSaving(true);
      if (currentCollectionId) {
        setCollectionsStatus('Сохраняем многостраничную запись...', true);
        const updated = await updateCollection(currentCollectionId, payload);
        await refreshCollections(updated.id);
        setCollectionsStatus('Многостраничная запись обновлена.', true);
      } else {
        setCollectionsStatus('Создаём многостраничную запись...', true);
        const created = await createCollection(payload);
        await refreshCollections(created.id);
        setCollectionsStatus('Многостраничная запись создана.', true);
      }
    } catch (error) {
      setCollectionsStatus(error.message || 'Не удалось сохранить многостраничную запись.', true);
    } finally {
      setCollectionSaving(false);
    }
  });

  mediaForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isLoggedIn || !currentPostId) {
      setMediaStatus('Сначала сохраните или откройте пост.');
      return;
    }

    const fileInput = document.getElementById('mediaFile');
    const file = fileInput.files?.[0];
    if (!file) {
      setMediaStatus('Сначала выберите файл.');
      return;
    }

    try {
      setMediaStatus('Загружаем медиа...');
      await uploadMedia(currentPostId, file);
      await refreshPosts(currentPostId);
      fileInput.value = '';
      setMediaStatus('Медиа загружено.');
    } catch (error) {
      setMediaStatus(error.message || 'Не удалось загрузить медиа.');
    }
  });

  ensureArchiveToggleButton();

  (async () => {
    const loggedIn = await checkSession();
    setLoggedInUI(loggedIn);
    ensureArchiveToggleButton();
    if (loggedIn) {
      setStatus('Сессия активна. Загружаем посты...');
      await refreshGroups();
      postsCache = await listPosts();
      updateArchiveButtonLabel();
      renderPostsList(postsCache);
      await refreshCollections(null, { silent: true });
      clearFormForNewPost();
      setStatus('Вы уже вошли. Можно работать с постами.');
    }
  })();
})();
