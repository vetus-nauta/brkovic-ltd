(function () {
  const IS_LOCAL = ['brkovic-local.local', '127.0.0.1', 'localhost'].includes(window.location.hostname);
  const API_ORIGIN = IS_LOCAL ? 'https://brkovic.ltd' : '';
  const API_BASE = IS_LOCAL ? '/admin-api-proxy.php?path=' : '/api';
  const STORAGE_TRANSLATIONS = 'brkovic_admin_translations_v1';
  const TRANSLATE_CHUNK_LIMIT = 450;

  let isLoggedIn = false;
  let currentPostId = '';
  let postsCache = [];
  let slugTouched = false;
  let currentMediaItems = [];
  let showArchivedMode = 'active';
  let groupsCache = [];
  let groupSelect = null;
  let groupOrderInput = null;

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
  const generateEnBtn = document.getElementById('generateEnBtn');
  const slugInput = document.getElementById('slug');
  const titleRuInput = document.getElementById('titleRu');

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
  function setLoggedInUI(loggedIn) {
    isLoggedIn = loggedIn;
    if (loginForm) loginForm.style.display = loggedIn ? 'none' : '';
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
  function getTranslationsCache() { return readJson(STORAGE_TRANSLATIONS, {}); }
  function saveTranslationsCache(value) { writeJson(STORAGE_TRANSLATIONS, value); }

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

  async function translateFree(text, targetLang) {
    const normalized = (text || '').trim();
    if (!normalized) return '';
    const cacheKey = `${targetLang}::${normalized}`;
    const cache = getTranslationsCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const attempts = [
      () => fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(normalized)}&langpair=ru|${targetLang}`)
        .then((r) => r.ok ? r.json() : Promise.reject()).then((data) => data?.responseData?.translatedText || ''),
      () => fetch('https://libretranslate.de/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: normalized, source: 'ru', target: targetLang, format: 'text' })
      }).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => data?.translatedText || ''),
      () => fetch('https://translate.argosopentech.com/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: normalized, source: 'ru', target: targetLang, format: 'text' })
      }).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => data?.translatedText || '')
    ];

    for (const attempt of attempts) {
      try {
        const result = (await attempt()).trim();
        if (result) {
          cache[cacheKey] = result;
          saveTranslationsCache(cache);
          return result;
        }
      } catch {}
    }
    return normalized;
  }

  function splitTextIntoChunks(text, limit = TRANSLATE_CHUNK_LIMIT) {
    const input = (text || '').trim();
    if (!input) return [];
    const paragraphs = input.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const chunks = [];

    function splitLongParagraph(paragraph) {
      const sentences = paragraph.match(/[^.!?\n]+[.!?\n]?/g) || [paragraph];
      const localChunks = [];
      let current = '';

      for (const sentenceRaw of sentences) {
        const sentence = sentenceRaw.trim();
        if (!sentence) continue;

        if (!current) {
          if (sentence.length <= limit) current = sentence;
          else {
            const words = sentence.split(/\s+/);
            let part = '';
            for (const word of words) {
              const candidate = part ? `${part} ${word}` : word;
              if (candidate.length <= limit) part = candidate;
              else { if (part) localChunks.push(part); part = word; }
            }
            if (part) localChunks.push(part);
            current = '';
          }
          continue;
        }

        const candidate = `${current} ${sentence}`;
        if (candidate.length <= limit) current = candidate;
        else {
          localChunks.push(current);
          if (sentence.length <= limit) current = sentence;
          else {
            const words = sentence.split(/\s+/);
            let part = '';
            for (const word of words) {
              const nextCandidate = part ? `${part} ${word}` : word;
              if (nextCandidate.length <= limit) part = nextCandidate;
              else { if (part) localChunks.push(part); part = word; }
            }
            current = part;
          }
        }
      }

      if (current) localChunks.push(current);
      return localChunks;
    }

    for (const paragraph of paragraphs) {
      if (paragraph.length <= limit) chunks.push(paragraph);
      else chunks.push(...splitLongParagraph(paragraph));
    }
    return chunks;
  }

  async function translateLongText(text, targetLang, progressLabel) {
    const normalized = (text || '').trim();
    if (!normalized) return '';
    const chunks = splitTextIntoChunks(normalized, TRANSLATE_CHUNK_LIMIT);
    if (!chunks.length) return '';

    const translated = [];
    for (let i = 0; i < chunks.length; i += 1) {
      setStatus(`${progressLabel}: часть ${i + 1} из ${chunks.length}...`);
      translated.push(await translateFree(chunks[i], targetLang));
    }
    return translated.join('\n\n');
  }

  async function generateEnglishFields() {
    const titleRu = document.getElementById('titleRu').value.trim();
    const excerptRu = document.getElementById('excerptRu').value.trim();
    const contentRu = document.getElementById('contentRu').value.trim();
    const seoTitleRu = document.getElementById('seoTitleRu').value.trim();
    const seoDescriptionRu = document.getElementById('seoDescriptionRu').value.trim();

    if (!titleRu && !excerptRu && !contentRu && !seoTitleRu && !seoDescriptionRu) {
      throw new Error('Сначала заполните русские поля.');
    }

    if (titleRu) {
      setStatus('Переводим заголовок...');
      document.getElementById('titleEn').value = await translateFree(titleRu, 'en');
    }
    if (excerptRu) {
      setStatus('Переводим краткое описание...');
      document.getElementById('excerptEn').value = await translateLongText(excerptRu, 'en', 'Переводим краткое описание');
    }
    if (contentRu) {
      setStatus('Переводим основной текст...');
      document.getElementById('contentEn').value = await translateLongText(contentRu, 'en', 'Переводим основной текст');
    }
    if (seoTitleRu) {
      setStatus('Переводим SEO Title...');
      document.getElementById('seoTitleEn').value = await translateFree(seoTitleRu, 'en');
    }
    if (seoDescriptionRu) {
      setStatus('Переводим SEO Description...');
      document.getElementById('seoDescriptionEn').value = await translateLongText(seoDescriptionRu, 'en', 'Переводим SEO Description');
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
    if (!res.ok) throw new Error(data?.error?.message || 'Ошибка запроса');
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
  async function createGroup(payload) {
    return api('/admin/journal-groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function getPost(id) { return api(`/admin/posts/${encodeURIComponent(id)}`); }
  async function createPost(payload) {
    return api('/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async function updatePost(id, payload) {
    return api(`/admin/posts/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

    if (openPublicLink) {
      openPublicLink.href = post?.slug ? `journal.html?slug=${encodeURIComponent(post.slug)}` : 'journal.html';
    }

    renderMediaList(post?.media || []);
    renderPostsList(postsCache);
  }

  function clearFormForNewPost() {
    currentPostId = '';
    slugTouched = false;
    currentMediaItems = [];
    form.reset();
    document.getElementById('postId').value = '';
    document.getElementById('status').value = 'DRAFT';
    document.getElementById('isPinned').value = 'false';
    document.getElementById('allowComments').value = 'true';
    document.getElementById('allowLikes').value = 'true';
    document.getElementById('publishedAt').value = '';
    document.getElementById('slug').value = '';
    ensureGroupControls();
    renderGroupControls('');
    if (groupSelect) groupSelect.value = '';
    if (groupOrderInput) groupOrderInput.value = '0';
    mediaListNode.innerHTML = '<div class="admin-post-meta">Сначала сохраните пост, потом загружайте медиа.</div>';
    openPublicLink.href = 'journal.html';
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
      setLoggedInUI(true);
      setStatus('Вход выполнен. Загружаем посты...');
      await refreshGroups();
      postsCache = await listPosts();
      updateArchiveButtonLabel();
      renderPostsList(postsCache);
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

  slugInput?.addEventListener('input', () => { slugTouched = true; });

  titleRuInput?.addEventListener('input', (event) => {
    if (!slugTouched || !slugInput.value.trim()) {
      slugInput.value = slugify(event.target.value);
    }
  });

  generateEnBtn?.addEventListener('click', async () => {
    try {
      setStatus('Генерируем английскую версию...');
      generateEnBtn.disabled = true;
      await generateEnglishFields();
      setStatus('Поля EN сгенерированы из RU.');
    } catch (error) {
      setStatus(error.message || 'Не удалось сгенерировать EN.');
    } finally {
      generateEnBtn.disabled = false;
    }
  });

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
      clearFormForNewPost();
      setStatus('Вы уже вошли. Можно работать с постами.');
    }
  })();
})();
