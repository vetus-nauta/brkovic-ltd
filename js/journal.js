(function () {
  const LIVE_API_ORIGIN = 'https://brkovic.ltd';
  const hostname = window.location.hostname;
  const isLocalPreviewHost = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname === 'brkovic-local.local'
    || hostname.endsWith('.local')
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
  const API_ORIGIN = isLocalPreviewHost ? LIVE_API_ORIGIN : '';
  const API_BASE = `${API_ORIGIN}/api/public/journal`;
  const LOCAL_JOURNAL_SNAPSHOT = '/data/journal-public.json';
  const STORAGE_TRANSLATIONS = 'brkovic_journal_translations_v1';

  let currentFilter = 'all';
  let backendEntries = [];
  let journalCollections = [];
  let isSingleMode = false;
  let singleModeKind = 'post';
  let likeStateBySlug = {};
  let gpsMetaByPath = {};
  let bootSequence = 0;
  let bootedAfterLanguage = false;
  let lightboxState = {
    images: [],
    index: 0,
  };
let lightboxJustClosedAt = 0;
  function getLang() {
    return document.documentElement.lang === 'ru' ? 'ru' : 'en';
  }

  function getTranslations() {
    return window.__BRKOVIC_TRANSLATIONS || {};
  }

  function t(key, fallback = '') {
    const tr = getTranslations();
    return tr[key] || fallback || key;
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getTranslationsCache() {
    return readJson(STORAGE_TRANSLATIONS, {});
  }

  function saveTranslationsCache(value) {
    writeJson(STORAGE_TRANSLATIONS, value);
  }

  function formatDate(value) {
    const lang = getLang();
    try {
      return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(value));
    } catch {
      return value;
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

  function resolveApiAssetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}${path}`;
  }

  function likeStateKey(kind, slug) {
    return kind === 'collection' ? `collection:${slug}` : slug;
  }

  function entryKind(entry) {
    return entry?.entryType === 'collection' ? 'collection' : 'post';
  }

  function entryTime(entry) {
    const value = new Date(entry?.date || entry?.publishedAt || entry?.createdAt || 0).getTime();
    return Number.isFinite(value) ? value : 0;
  }

  function getGroupedEntryCounts(entries) {
    const counts = new Map();
    (entries || []).forEach((entry) => {
      if (!entry?.groupId || !entry.group) return;
      counts.set(entry.groupId, (counts.get(entry.groupId) || 0) + 1);
    });
    return counts;
  }

  function getTimelineKey(entry, groupCounts = getGroupedEntryCounts(backendEntries)) {
    if (entryKind(entry) === 'collection') {
      return `collection:${entry?.slug || entry?.id || ''}`;
    }

    if (entry?.groupId && entry.group && (groupCounts.get(entry.groupId) || 0) > 1) {
      return `group:${entry.groupId}`;
    }
    return `post:${entry?.slug || entry?.id || ''}`;
  }

  function buildJournalTimeline(entries) {
    const groupCounts = getGroupedEntryCounts(entries);
    const timeline = new Map();

    (entries || []).forEach((entry) => {
      if (!entry?.slug || !entry.date) return;
      const key = getTimelineKey(entry, groupCounts);
      const at = entryTime(entry);
      const tie = String(entry.slug || '');
      const item = timeline.get(key) || {
        key,
        date: at,
        tie,
        slugs: []
      };

      item.date = Math.min(item.date, at);
      item.tie = item.tie.localeCompare(tie) <= 0 ? item.tie : tie;
      item.slugs.push(entry.slug);
      timeline.set(key, item);
    });

    return Array.from(timeline.values()).sort((a, b) => {
      if (a.date !== b.date) return a.date - b.date;
      return a.tie.localeCompare(b.tie);
    });
  }

  function sortEntriesForFeed(entries) {
    const groupCounts = getGroupedEntryCounts(entries);
    const order = new Map(buildJournalTimeline(entries).map((item, index) => [item.key, index]));

    return (entries || []).slice().sort((a, b) => {
      const keyA = getTimelineKey(a, groupCounts);
      const keyB = getTimelineKey(b, groupCounts);
      const topOrder = (order.get(keyA) ?? 0) - (order.get(keyB) ?? 0);
      if (topOrder !== 0) return topOrder;

      if (keyA === keyB && keyA.startsWith('group:')) {
        const groupOrder = Number(a.groupOrder || 0) - Number(b.groupOrder || 0);
        if (groupOrder !== 0) return groupOrder;
      }

      const at = entryTime(a);
      const bt = entryTime(b);
      if (at !== bt) return at - bt;
      return String(a.slug || '').localeCompare(String(b.slug || ''));
    });
  }

  function getPostNumberBySlug(posts, slug) {
    if (!Array.isArray(posts) || !slug) return null;

    const timeline = buildJournalTimeline(posts);
    const index = timeline.findIndex((item) => item.slugs.includes(slug));
    return index >= 0 ? index + 1 : null;
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  }

  async function fetchJournalIndexPayload() {
    if (isLocalPreviewHost) {
      try {
        return await fetchJson(LOCAL_JOURNAL_SNAPSHOT, { cache: 'no-store' });
      } catch {}
    }

    return fetchJson(API_BASE, { cache: 'no-store' });
  }

  async function fetchJournalCollectionsPayload() {
    return fetchJson(`${API_BASE}/collections`, { cache: 'no-store' });
  }

  async function translateFree(text, targetLang) {
    const cacheKey = `${targetLang}::${text}`;
    const cache = getTranslationsCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const attempts = [
      () => fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${targetLang}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((data) => data?.responseData?.translatedText || ''),
      () => fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'ru', target: targetLang, format: 'text' })
      }).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => data?.translatedText || ''),
      () => fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'ru', target: targetLang, format: 'text' })
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

    return text;
  }

  function normalizeMediaItems(media, fallbackTitle = '') {
    if (!Array.isArray(media)) return [];

    return media.map((m) => {
      const src = resolveApiAssetUrl(m.filePath || m.thumbPath || m.posterPath || '');
      const captionRu = String(m.altRu || '').trim();
      const captionEn = String(m.altEn || '').trim();
      const caption = {
        ru: captionRu || captionEn,
        en: captionEn || captionRu
      };
      const gps = gpsMetaByPath[src] || {};
      return {
        id: m.id,
        type: m.type === 'VIDEO' || m.type === 'video' ? 'video' : 'image',
        src,
        poster: resolveApiAssetUrl(m.posterPath || ''),
        alt: (caption.ru || caption.en || fallbackTitle || '').trim(),
        caption,
        gpsLatLabel: gps.gpsLatLabel || '',
        gpsLonLabel: gps.gpsLonLabel || '',
        gpsDecimal: gps.gpsDecimal || ''
      };
    });
  }

  function normalizePostItem(item) {
    return {
      entryType: 'post',
      id: item.id,
      slug: item.slug,
      title: {
        ru: item.titleRu || '',
        en: item.titleEn || ''
      },
      date: item.publishedAt || item.createdAt,
      location: '',
      text: {
        ru: item.contentRu || '',
        en: item.contentEn || ''
      },
      excerpt: {
        ru: item.excerptRu || '',
        en: item.excerptEn || ''
      },
      groupId: item.groupId || '',
      groupOrder: Number(item.groupOrder || 0),
      group: item.group ? {
        id: item.group.id || item.groupId || '',
        slug: item.group.slug || '',
        titleRu: item.group.titleRu || '',
        titleEn: item.group.titleEn || '',
        descriptionRu: item.group.descriptionRu || '',
        descriptionEn: item.group.descriptionEn || '',
        status: item.group.status || '',
        sortOrder: Number(item.group.sortOrder || 0)
      } : null,
      media: normalizeMediaItems(item.media, item.titleRu || item.titleEn || ''),
      comments: Array.isArray(item.comments) ? item.comments : [],
      commentsCount: item.commentsCount || 0,
      likesCount: item.likesCount || 0,
      isPinned: !!item.isPinned
    };
  }

  function normalizeApiPayload(response) {
    const items = response?.data?.data || response?.data || [];
    if (!Array.isArray(items)) return [];
    return items.map(normalizePostItem);
  }

  function normalizeCollectionItem(item) {
    const pages = Array.isArray(item.pages) ? item.pages
      .map((page, index) => ({
        id: page.id || '',
        pageOrder: Number.isFinite(Number(page.pageOrder)) ? Number(page.pageOrder) : index,
        post: page.post ? normalizePostItem(page.post) : null,
      }))
      .filter((page) => page.post?.slug) : [];
    const coverMedia = item.coverMedia
      ? normalizeMediaItems([item.coverMedia], item.titleRu || item.titleEn || '')
      : [];
    const firstPageMedia = pages.find((page) => page.post?.media?.length)?.post?.media?.slice(0, 1) || [];

    return {
      entryType: 'collection',
      id: item.id,
      slug: item.slug,
      title: {
        ru: item.titleRu || '',
        en: item.titleEn || ''
      },
      date: item.publishedAt || item.createdAt,
      excerpt: {
        ru: item.excerptRu || '',
        en: item.excerptEn || ''
      },
      text: {
        ru: '',
        en: ''
      },
      media: coverMedia.length ? coverMedia : firstPageMedia,
      authorLine: item.authorLine || 'Vetus Nauta - Brkovic',
      pages,
      pagesCount: item.pagesCount || pages.length,
      comments: Array.isArray(item.comments) ? item.comments : [],
      commentsCount: item.commentsCount || 0,
      likesCount: item.likesCount || 0,
      isPinned: !!item.isPinned,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : null,
    };
  }

  function normalizeCollectionsPayload(response) {
    const items = response?.data?.data || response?.data || [];
    if (!Array.isArray(items)) return [];
    return items.map(normalizeCollectionItem);
  }

  async function fetchBackendEntries() {
    const feed = document.getElementById('journalFeed');
    if (feed) {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_loading', 'Loading entries...'))}</div>`;
    }

    try {
      const [data, collectionsData] = await Promise.all([
        fetchJournalIndexPayload(),
        fetchJournalCollectionsPayload().catch(() => ({ data: [] })),
      ]);
      backendEntries = normalizeApiPayload(data);
      journalCollections = normalizeCollectionsPayload(collectionsData);
      await hydrateLikeStates();
    } catch {
      backendEntries = [];
      journalCollections = [];
      if (feed) {
        feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_load_error', 'Failed to load entries.'))}</div>`;
      }
    }
  }

  async function hydrateLikeStates() {
    const postTasks = backendEntries.map(async (entry) => {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(entry.slug)}/like-status`, {
          cache: 'no-store',
          credentials: API_ORIGIN ? 'include' : 'same-origin',
        });
        const data = await res.json();
        const payload = data?.data?.data || data?.data || {};
        likeStateBySlug[likeStateKey('post', entry.slug)] = {
          liked: !!payload.liked,
          likesCount: Number(payload.likesCount || 0),
        };
      } catch {
        likeStateBySlug[likeStateKey('post', entry.slug)] = {
          liked: false,
          likesCount: entry.likesCount || 0,
        };
      }
    });

    const collectionTasks = journalCollections.map(async (collection) => {
      try {
        const res = await fetch(`${API_BASE}/collections/${encodeURIComponent(collection.slug)}/like-status`, {
          cache: 'no-store',
          credentials: API_ORIGIN ? 'include' : 'same-origin',
        });
        const data = await res.json();
        const payload = data?.data?.data || data?.data || {};
        likeStateBySlug[likeStateKey('collection', collection.slug)] = {
          liked: !!payload.liked,
          likesCount: Number(payload.likesCount || 0),
        };
      } catch {
        likeStateBySlug[likeStateKey('collection', collection.slug)] = {
          liked: false,
          likesCount: collection.likesCount || 0,
        };
      }
    });

    await Promise.all([...postTasks, ...collectionTasks]);
  }

  async function fetchGpsMeta() {
    try {
      let version = 'gps-static';
      try {
        const versionRes = await fetch('/data/journal-gps-version.json', { cache: 'no-store' });
        if (versionRes.ok) {
          const versionData = await versionRes.json();
          version = versionData?.version || version;
        }
      } catch {}

      const res = await fetch(`/data/journal-gps.json?v=${encodeURIComponent(version)}`, { cache: 'no-store' });
      if (!res.ok) {
        gpsMetaByPath = {};
        return;
      }
      gpsMetaByPath = await res.json();
    } catch {
      gpsMetaByPath = {};
    }
  }

  async function resolveEntryText(entry, lang) {
    const copy = JSON.parse(JSON.stringify(entry));

    if (lang === 'ru') {
      if (!copy.title.ru && copy.title.en) copy.title.ru = copy.title.en;
      if (!copy.text.ru && copy.text.en) copy.text.ru = copy.text.en;
      return copy;
    }

    if (!copy.title.en && copy.title.ru) copy.title.en = await translateFree(copy.title.ru, 'en');
    if (!copy.text.en && copy.text.ru) copy.text.en = await translateFree(copy.text.ru, 'en');

    return copy;
  }

  function mediaCaption(item) {
    const caption = item && item.caption;
    if (!caption) return '';
    if (typeof caption === 'string') return caption.trim();
    return getLang() === 'ru'
      ? String(caption.ru || caption.en || '').trim()
      : String(caption.en || caption.ru || '').trim();
  }

  function mediaAlt(item) {
    return String((item && item.alt) || mediaCaption(item) || '').trim();
  }

  function mediaMarkup(media, entrySlug = '') {
    if (!media || !media.length) return '';

    const wrapClass = 'journal-post__media' + (media.length === 1 ? ' journal-post__media--single' : '');
    let imageIndex = 0;

    return `<div class="${wrapClass}">${media.map((item) => {
      if (item.type === 'video') {
        return `<div class="journal-post__media-item"><video ${item.poster ? `poster="${escapeHtml(item.poster)}"` : ''} src="${escapeHtml(item.src)}" controls playsinline></video></div>`;
      }
      const lightboxIndex = imageIndex;
      imageIndex += 1;
      return `<div class="journal-post__media-item">
        ${item.gpsDecimal ? `<div class="journal-post__geo-map-top"><a class="journal-post__geo-map-link" href="https://www.google.com/maps?q=${encodeURIComponent(item.gpsDecimal)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('journal_open_maps', getLang() === 'ru' ? 'Открыть в Google Maps' : 'Open in Google Maps'))}</a></div>` : ''}
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(mediaAlt(item))}" data-lightbox-index="${lightboxIndex}" data-lightbox-slug="${escapeHtml(entrySlug)}" />
        ${(item.gpsLatLabel || item.gpsLonLabel) ? `
          <div class="journal-post__geo">
            ${item.gpsLatLabel ? `<div class="journal-post__geo-item"><span class="journal-post__geo-pin" aria-hidden="true"></span><span>${escapeHtml(item.gpsLatLabel)}</span></div>` : '<div></div>'}
            ${item.gpsLonLabel ? `<div class="journal-post__geo-item"><span class="journal-post__geo-pin" aria-hidden="true"></span><span>${escapeHtml(item.gpsLonLabel)}</span></div>` : '<div></div>'}
          </div>
        ` : ''}
      </div>`;
    }).join('')}</div>`;
  }

  function textMarkup(text) {
    const raw = String(text || '').trim();
    if (!raw) return '<div class="journal-post__text"></div>';
    const parts = raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const list = parts.length ? parts : [raw];
    return '<div class="journal-post__text">' + list.map((p) => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('') + '</div>';
  }

  function shouldCollapseText(text) {
    const raw = String(text || '').trim();
    if (!raw) return false;
    return raw.split(/\n/).length > 5 || raw.length > 520;
  }

  function readMoreButtonMarkup(text) {
    if (!shouldCollapseText(text)) return '';
    return `<button class="journal-read-more" type="button" data-action="read-more">${escapeHtml(t('journal_read_more', getLang() === 'ru' ? '\u0427\u0438\u0442\u0430\u0442\u044c \u0434\u0430\u043b\u044c\u0448\u0435' : 'Read more'))}</button>`;
  }

  function commentMarkup(comment) {
    const name = comment.authorName || comment.name || 'Guest';
    return `<article class="journal-comment"><strong>${escapeHtml(name)}</strong><p>${escapeHtml(comment.content || comment.text || '')}</p></article>`;
  }

  function updateSingleModeUI(singleMode) {
    const body = document.body;
    const layout = document.querySelector('.journal-layout');
    const side = document.querySelector('.journal-side');
    const filters = document.getElementById('journalFeedFilters');
    const back = document.getElementById('journalSingleBack');
    const title = document.getElementById('journalFeedTitle');
    const eyebrow = document.getElementById('journalFeedEyebrow');

    if (body) body.classList.toggle('journal-page--single', singleMode);
    if (body) body.classList.toggle('journal-page--collection', singleMode && singleModeKind === 'collection');
    if (layout) layout.classList.toggle('journal-layout--single', singleMode);
    if (side) side.hidden = singleMode;
    if (filters) filters.hidden = singleMode;
    if (back) back.hidden = !singleMode;

    if (title) {
      title.textContent = singleMode
        ? (singleModeKind === 'collection'
          ? (getLang() === 'ru' ? 'Многостраничная запись' : 'Multi-page entry')
          : (getLang() === 'ru' ? 'Запись судового журнала' : 'Journal entry'))
        : (getLang() === 'ru' ? 'Заметки с морей' : 'Notes from the seas');
    }

    if (eyebrow) {
      eyebrow.textContent = singleMode
        ? (singleModeKind === 'collection'
          ? (getLang() === 'ru' ? 'Серия' : 'Series')
          : (getLang() === 'ru' ? 'Запись' : 'Entry'))
        : (getLang() === 'ru' ? 'Судовой журнал' : 'Deck Log');
    }

    const backLink = document.querySelector('#journalSingleBack a');
    if (backLink) {
      backLink.textContent = getLang() === 'ru' ? '← Назад в журнал' : '← Back to journal';
    }
  }

  function groupTitle(group) {
    if (!group) return '';
    return getLang() === 'ru'
      ? (group.titleRu || group.titleEn || group.slug || '')
      : (group.titleEn || group.titleRu || group.slug || '');
  }

  function fixJournalUiLabels(singleMode) {
    if (getLang() !== 'ru') return;

    const title = document.getElementById('journalFeedTitle');
    const eyebrow = document.getElementById('journalFeedEyebrow');

    if (title) {
      title.textContent = singleMode
        ? (singleModeKind === 'collection'
          ? '\u041c\u043d\u043e\u0433\u043e\u0441\u0442\u0440\u0430\u043d\u0438\u0447\u043d\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c'
          : '\u0417\u0430\u043f\u0438\u0441\u044c \u0441\u0443\u0434\u043e\u0432\u043e\u0433\u043e \u0436\u0443\u0440\u043d\u0430\u043b\u0430')
        : '\u0417\u0430\u043c\u0435\u0442\u043a\u0438 \u0441 \u043c\u043e\u0440\u0435\u0439';
    }

    if (eyebrow) {
      eyebrow.textContent = singleMode
        ? (singleModeKind === 'collection' ? '\u0421\u0435\u0440\u0438\u044f' : '\u0417\u0430\u043f\u0438\u0441\u044c')
        : '\u0421\u0443\u0434\u043e\u0432\u043e\u0439 \u0436\u0443\u0440\u043d\u0430\u043b';
    }
  }

  function groupDescription(group) {
    if (!group) return '';
    return getLang() === 'ru'
      ? (group.descriptionRu || group.descriptionEn || '')
      : (group.descriptionEn || group.descriptionRu || '');
  }

  function groupNavMarkup(total, position) {
    const isRu = getLang() === 'ru';
    const progress = isRu ? `Часть 1 из ${total}` : `Part 1 of ${total}`;
    const prev = isRu ? 'Начало записи' : 'Start of entry';
    const next = isRu ? 'Продолжить запись: часть 2' : 'Continue entry: part 2';

    return `
      <div class="journal-group-card__nav journal-group-card__nav--${position}" data-group-nav>
        <button class="journal-group-card__button journal-group-card__button--prev" type="button" data-group-step="-1" aria-label="${escapeHtml(prev)}" disabled>
          <span class="journal-group-card__button-icon" aria-hidden="true">\u2039</span>
          <span class="journal-group-card__button-text" data-group-prev-label>${escapeHtml(prev)}</span>
        </button>
        <div class="journal-group-card__progress" data-group-progress>${escapeHtml(progress)}</div>
        <button class="journal-group-card__button journal-group-card__button--next" type="button" data-group-step="1" aria-label="${escapeHtml(next)}">
          <span class="journal-group-card__button-text" data-group-next-label>${escapeHtml(next)}</span>
          <span class="journal-group-card__button-icon" aria-hidden="true">\u203a</span>
        </button>
      </div>
    `;
  }

  function wrapJournalGroups(entries) {
    const feed = document.getElementById('journalFeed');
    if (!feed || isSingleMode) return;

    const groups = new Map();
    entries.forEach((entry) => {
      if (!entry.groupId || !entry.group) return;
      if (!groups.has(entry.groupId)) groups.set(entry.groupId, []);
      groups.get(entry.groupId).push(entry);
    });

    groups.forEach((groupEntries, groupId) => {
      if (groupEntries.length < 2) return;

      const cards = Array.from(feed.querySelectorAll('.journal-post[data-group-id]'))
        .filter((card) => card.dataset.groupId === groupId);
      if (cards.length < 2) return;

      const group = groupEntries[0].group;
      const sortedEntries = groupEntries.slice().sort((a, b) => {
        const order = Number(a.groupOrder || 0) - Number(b.groupOrder || 0);
        if (order !== 0) return order;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      const cardBySlug = new Map(cards.map((card) => [card.dataset.slug, card]));
      const sortedCards = sortedEntries.map((entry) => cardBySlug.get(entry.slug)).filter(Boolean);
      if (sortedCards.length < 2) return;

      const title = groupTitle(group);
      const description = groupDescription(group);
      const firstCard = sortedCards[0];
      const wrapper = document.createElement('article');
      wrapper.className = 'journal-group-card';
      wrapper.dataset.groupId = groupId;

      wrapper.innerHTML = `
        <div class="journal-group-card__head">
          <div>
            <p class="journal-group-card__eyebrow">${escapeHtml(t('journal_group_eyebrow', getLang() === 'ru' ? '\u0421\u0435\u0440\u0438\u044f \u0437\u0430\u043f\u0438\u0441\u0435\u0439' : 'Entry series'))}</p>
            <h3 class="journal-group-card__title">${escapeHtml(title)}</h3>
            ${description ? `<p class="journal-group-card__description">${escapeHtml(description)}</p>` : ''}
          </div>
        </div>
        ${groupNavMarkup(sortedCards.length, 'top')}
        <div class="journal-group-card__viewport">
          <div class="journal-group-card__track"></div>
        </div>
        ${groupNavMarkup(sortedCards.length, 'bottom')}
      `;

      const track = wrapper.querySelector('.journal-group-card__track');
      firstCard.parentNode.insertBefore(wrapper, firstCard);
      sortedCards.forEach((card, index) => {
        card.classList.add('journal-post--group-slide');
        card.dataset.groupSlideIndex = String(index);
        track.appendChild(card);
      });
    });
  }

  function bindGroupCarousels() {
    document.querySelectorAll('.journal-group-card').forEach((card) => {
      const viewport = card.querySelector('.journal-group-card__viewport');
      const track = card.querySelector('.journal-group-card__track');
      const slides = Array.from(card.querySelectorAll('.journal-post--group-slide'));
      const dots = Array.from(card.querySelectorAll('.journal-group-card__dot'));
      if (!track || !slides.length) return;
      const nextButtons = Array.from(card.querySelectorAll('[data-group-step="1"]'));
      const prevButtons = Array.from(card.querySelectorAll('[data-group-step="-1"]'));
      const progressNodes = Array.from(card.querySelectorAll('[data-group-progress]'));
      const prevLabels = Array.from(card.querySelectorAll('[data-group-prev-label]'));
      const nextLabels = Array.from(card.querySelectorAll('[data-group-next-label]'));

      const labelForState = (index) => {
        const total = slides.length;
        const isRu = getLang() === 'ru';
        return {
          progress: isRu ? `Часть ${index + 1} из ${total}` : `Part ${index + 1} of ${total}`,
          prev: index > 0
            ? (isRu ? `К части ${index}` : `Back to part ${index}`)
            : (isRu ? 'Начало записи' : 'Start of entry'),
          next: index < total - 1
            ? (isRu ? `Продолжить запись: часть ${index + 2}` : `Continue entry: part ${index + 2}`)
            : (isRu ? 'Продолжение прочитано' : 'Continuation read')
        };
      };

      const updateControls = (index) => {
        const next = Math.max(0, Math.min(slides.length - 1, index));
        const labels = labelForState(next);

        progressNodes.forEach((node) => { node.textContent = labels.progress; });
        prevLabels.forEach((node) => { node.textContent = labels.prev; });
        nextLabels.forEach((node) => { node.textContent = labels.next; });

        prevButtons.forEach((button) => {
          button.disabled = next <= 0;
          button.setAttribute('aria-label', labels.prev);
        });

        nextButtons.forEach((button) => {
          button.disabled = next >= slides.length - 1;
          button.setAttribute('aria-label', labels.next);
        });
      };

      const currentIndex = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));

      const updateHeight = (index = currentIndex()) => {
        if (!viewport) return;
        const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
        if (!slide) return;
        const height = Math.ceil(slide.getBoundingClientRect().height);
        if (height > 0) viewport.style.height = `${height}px`;
      };

      const setActive = (index) => {
        dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
        updateControls(index);
        updateHeight(index);
      };

      const scrollToIndex = (index) => {
        const next = Math.max(0, Math.min(slides.length - 1, index));
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
        setActive(next);
      };

      card.querySelectorAll('[data-group-step]').forEach((button) => {
        button.onclick = () => {
          const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          scrollToIndex(current + Number(button.dataset.groupStep || 0));
        };
      });

      dots.forEach((dot) => {
        dot.onclick = () => scrollToIndex(Number(dot.dataset.groupIndex || 0));
      });

      if (slides.length > 1 && nextButtons.length) {
        window.requestAnimationFrame(() => {
          nextButtons.forEach((button) => button.classList.add('journal-group-card__button--hint'));
          window.setTimeout(() => {
            nextButtons.forEach((button) => button.classList.remove('journal-group-card__button--hint'));
          }, 3000);
        });
      }

      let scrollTimer = 0;
      track.addEventListener('scroll', () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          const current = currentIndex();
          setActive(current);
        }, 80);
      });

      card.addEventListener('journal-group-height-refresh', () => {
        window.requestAnimationFrame(() => updateHeight());
      });

      window.addEventListener('resize', () => updateHeight());
      slides.forEach((slide) => {
        slide.querySelectorAll('img, video').forEach((media) => {
          media.addEventListener('load', () => updateHeight(), { once: true });
          media.addEventListener('loadedmetadata', () => updateHeight(), { once: true });
        });
      });
      window.requestAnimationFrame(() => updateHeight(0));
    });
  }

  function ensureLightbox() {
    if (document.getElementById('journalLightbox')) return;

    const root = document.createElement('div');
    root.id = 'journalLightbox';
    root.className = 'journal-lightbox';
    root.hidden = true;
    root.innerHTML = `
      <div class="journal-lightbox__backdrop" data-lightbox-close="true"></div>
      <div class="journal-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image viewer">
        <div class="journal-lightbox__topbar">
          <div>
            <div class="journal-lightbox__counter" id="journalLightboxCounter"></div>
            <div class="journal-lightbox__caption" id="journalLightboxCaption"></div>
          </div>
          <button class="journal-lightbox__close" type="button" id="journalLightboxClose" aria-label="Close">×</button>
        </div>
        <div class="journal-lightbox__frame">
          <img class="journal-lightbox__image" id="journalLightboxImage" alt="" />
          <div class="journal-lightbox__controls">
            <button class="journal-lightbox__nav journal-lightbox__nav--prev" type="button" id="journalLightboxPrev" aria-label="Previous">‹</button>
            <button class="journal-lightbox__nav journal-lightbox__nav--next" type="button" id="journalLightboxNext" aria-label="Next">›</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    root.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.lightboxClose === 'true') {
        closeLightbox();
      }
    });

    document.getElementById('journalLightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('journalLightboxPrev')?.addEventListener('click', () => stepLightbox(-1));
    document.getElementById('journalLightboxNext')?.addEventListener('click', () => stepLightbox(1));

    document.addEventListener('keydown', (event) => {
      const lightbox = document.getElementById('journalLightbox');
      if (!lightbox || lightbox.hidden) return;

      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      if (event.key === 'ArrowRight') stepLightbox(1);
    });
  }

  function getImagesForSlug(slug) {
    const entry = backendEntries.find((item) => item.slug === slug);
    if (entry) return (entry.media || []).filter((item) => item.type === 'image' && item.src);

    const collection = journalCollections.find((item) => item.slug === slug);
    if (collection) return (collection.media || []).filter((item) => item.type === 'image' && item.src);

    return [];
  }

  function renderLightbox() {
    const lightbox = document.getElementById('journalLightbox');
    const img = document.getElementById('journalLightboxImage');
    const caption = document.getElementById('journalLightboxCaption');
    const counter = document.getElementById('journalLightboxCounter');
    const prev = document.getElementById('journalLightboxPrev');
    const next = document.getElementById('journalLightboxNext');

    if (!lightbox || !img || !caption || !counter || !prev || !next) return;
    if (!lightboxState.images.length) return;

    const current = lightboxState.images[lightboxState.index];
    img.src = current.src;
    img.alt = mediaAlt(current);
    caption.textContent = mediaCaption(current);
    counter.textContent = `${lightboxState.index + 1} / ${lightboxState.images.length}`;

    const single = lightboxState.images.length <= 1;
    prev.disabled = single || lightboxState.index === 0;
    next.disabled = single || lightboxState.index === lightboxState.images.length - 1;
  }

  function openLightbox(slug, index) {
    ensureLightbox();

    const lightbox = document.getElementById('journalLightbox');
    const images = getImagesForSlug(slug);
    if (!lightbox || !images.length) return;

    lightboxState.images = images;
    lightboxState.index = Math.max(0, Math.min(index, images.length - 1));

    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('journalLightbox');
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxJustClosedAt = Date.now();
  }

  function stepLightbox(direction) {
    if (!lightboxState.images.length) return;
    const nextIndex = lightboxState.index + direction;
    if (nextIndex < 0 || nextIndex >= lightboxState.images.length) return;
    lightboxState.index = nextIndex;
    renderLightbox();
  }

  function imageIndexForEntry(entry, mediaItem) {
    const images = (entry.media || []).filter((item) => item.type === 'image' && item.src);
    const index = images.findIndex((item) => {
      if (item.id && mediaItem.id) return item.id === mediaItem.id;
      return item.src === mediaItem.src;
    });
    return Math.max(0, index);
  }

  async function renderMediaFeed(feed, entries, filter, lang) {
    let renderedCount = 0;
    feed.classList.add('journal-feed--media');

    for (const entry of entries) {
      const resolved = await resolveEntryText(entry, lang);
      const title = lang === 'ru'
        ? (resolved.title.ru || resolved.title.en || '')
        : (resolved.title.en || resolved.title.ru || '');
      const mediaItems = (entry.media || []).filter((item) => {
        if (!item.src) return false;
        return filter === 'video' ? item.type === 'video' : item.type === 'image';
      });

      mediaItems.forEach((item) => {
        const caption = mediaCaption(item);
        const card = document.createElement('article');
        card.className = `journal-media-card journal-media-card--${item.type === 'video' ? 'video' : 'image'}`;
        card.dataset.slug = entry.slug;
        card.innerHTML = `
          <div class="journal-media-card__frame">
            ${item.type === 'video'
              ? `<video ${item.poster ? `poster="${escapeHtml(item.poster)}"` : ''} src="${escapeHtml(item.src)}" controls playsinline></video>`
              : `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(mediaAlt(item))}" data-lightbox-index="${imageIndexForEntry(entry, item)}" data-lightbox-slug="${escapeHtml(entry.slug)}" />`}
          </div>
          ${caption ? `<p class="journal-media-card__caption">${escapeHtml(caption)}</p>` : ''}
          <div class="journal-media-card__source">
            <span>${escapeHtml(title)}</span>
            <time>${escapeHtml(formatDate(entry.date))}</time>
          </div>
        `;
        feed.appendChild(card);
        renderedCount += 1;
      });
    }

    if (!renderedCount) {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_empty', 'No entries yet.'))}</div>`;
    }
  }

  function entryTitle(entry, lang = getLang()) {
    return lang === 'ru'
      ? (entry?.title?.ru || entry?.title?.en || entry?.slug || '')
      : (entry?.title?.en || entry?.title?.ru || entry?.slug || '');
  }

  function entryExcerpt(entry, lang = getLang()) {
    return lang === 'ru'
      ? (entry?.excerpt?.ru || entry?.excerpt?.en || '')
      : (entry?.excerpt?.en || entry?.excerpt?.ru || '');
  }

  function entryText(entry, lang = getLang()) {
    return lang === 'ru'
      ? (entry?.text?.ru || entry?.text?.en || '')
      : (entry?.text?.en || entry?.text?.ru || '');
  }

  function getCollectionPageSlugs(collections = journalCollections) {
    const slugs = new Set();
    collections.forEach((collection) => {
      (collection.pages || []).forEach((page) => {
        if (page.post?.slug) slugs.add(page.post.slug);
      });
    });
    return slugs;
  }

  function buildRootFeedEntries(entries, collections) {
    const collectionPageSlugs = getCollectionPageSlugs(collections);
    const visiblePosts = entries.filter((entry) => !collectionPageSlugs.has(entry.slug));
    return sortEntriesForFeed([...visiblePosts, ...collections]);
  }

  function renderCollectionCoverCard(feed, collection, lang) {
    const title = entryTitle(collection, lang);
    const excerpt = entryExcerpt(collection, lang);
    const pages = collection.pages || [];
    const pageList = pages.slice(0, 6).map((page, index) => {
      const pageTitle = entryTitle(page.post, lang);
      return `<li><span>${escapeHtml(String(index + 1))}</span>${escapeHtml(pageTitle)}</li>`;
    }).join('');

    const card = document.createElement('article');
    card.className = 'journal-post journal-collection-cover';
    card.dataset.slug = collection.slug;
    card.dataset.kind = 'collection';
    card.innerHTML = `
      <div class="journal-post__meta">
        <div>
          <p class="journal-post__eyebrow">${escapeHtml(lang === 'ru' ? 'Многостраничная запись' : 'Multi-page entry')}</p>
          <h3 class="journal-post__title">
            <a href="journal.html?collection=${encodeURIComponent(collection.slug)}">${escapeHtml(title)}</a>
          </h3>
          <p class="journal-collection-cover__author">${escapeHtml(collection.authorLine || 'Vetus Nauta - Brkovic')}</p>
        </div>
        <div class="journal-post__date">${escapeHtml(formatDate(collection.date))}</div>
      </div>
      ${mediaMarkup(collection.media, collection.slug)}
      ${excerpt ? `<p class="journal-collection-cover__excerpt">${escapeHtml(excerpt)}</p>` : ''}
      ${pageList ? `
        <ol class="journal-collection-cover__pages">
          ${pageList}
        </ol>
      ` : ''}
      <div class="journal-post__actions">
        <div class="journal-post__left">
          <span class="journal-collection-cover__count">${escapeHtml(lang === 'ru' ? `Глав: ${collection.pagesCount || pages.length}` : `Chapters: ${collection.pagesCount || pages.length}`)}</span>
        </div>
        <div class="journal-post__right">
          <a class="journal-action journal-collection-cover__open" href="journal.html?collection=${encodeURIComponent(collection.slug)}">
            ${escapeHtml(lang === 'ru' ? 'Открыть главы' : 'Open chapters')}
          </a>
        </div>
      </div>
    `;

    feed.appendChild(card);
  }

  function textUnits(text) {
    const raw = String(text || '').trim();
    if (!raw) return [];

    return raw
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => {
        if (part.length < 680) return [part];
        const sentences = part.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
        if (!sentences || sentences.length <= 1) return [part];

        const units = [];
        let current = '';
        sentences.forEach((sentence) => {
          const clean = sentence.trim();
          if (!clean) return;
          const next = current ? `${current} ${clean}` : clean;
          if (current && next.length > 620) {
            units.push(current);
            current = clean;
          } else {
            current = next;
          }
        });
        if (current) units.push(current);
        return units;
      });
  }

  function preferredBookChunks(text, mediaCount = 0) {
    const length = String(text || '').trim().length;
    const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;
    const target = narrow ? 760 : 1180;
    const imageWeight = Math.max(0, Number(mediaCount || 0)) * (narrow ? 280 : 420);
    return Math.max(1, Math.ceil((length + imageWeight) / target));
  }

  function chunkTextUnits(units, preferredCount) {
    const clean = (units || []).filter(Boolean);
    if (!clean.length) return [[]];

    const count = Math.max(1, Math.min(preferredCount, clean.length));
    const totalLength = clean.reduce((sum, unit) => sum + unit.length, 0);
    const targetLength = Math.max(1, Math.round(totalLength / count));
    const chunks = [];
    let current = [];
    let currentLength = 0;

    clean.forEach((unit, index) => {
      current.push(unit);
      currentLength += unit.length;

      const chunksLeft = count - chunks.length;
      const unitsLeft = clean.length - index - 1;
      if (chunksLeft > 1 && currentLength >= targetLength && unitsLeft >= chunksLeft - 1) {
        chunks.push(current);
        current = [];
        currentLength = 0;
      }
    });

    if (current.length) chunks.push(current);
    return chunks;
  }

  function bookTextMarkup(units) {
    const list = (units || []).filter(Boolean);
    if (!list.length) return '<div class="journal-post__text"></div>';
    return '<div class="journal-post__text">' + list.map((p) => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('') + '</div>';
  }

  function mediaForBookChunk(media, chunkIndex, chunksCount) {
    const items = Array.isArray(media) ? media.filter((item) => item?.src) : [];
    if (!items.length) return [];
    if (chunksCount <= 1) return items;

    return items.filter((_, mediaIndex) => {
      const targetChunk = Math.min(chunksCount - 1, Math.floor((mediaIndex * chunksCount) / items.length));
      return targetChunk === chunkIndex;
    });
  }

  function buildCollectionBookPages(collection, lang) {
    return (collection.pages || []).flatMap((page, chapterIndex) => {
      const post = page.post || {};
      const title = entryTitle(post, lang);
      const text = entryText(post, lang);
      const chunks = chunkTextUnits(textUnits(text), preferredBookChunks(text, post.media?.length || 0));

      return chunks.map((units, partIndex) => ({
        chapterIndex,
        partIndex,
        partTotal: chunks.length,
        title,
        date: post.date,
        slug: post.slug,
        media: mediaForBookChunk(post.media || [], partIndex, chunks.length),
        units,
      }));
    });
  }

  function renderCollectionBookPage(page, index, total, lang) {
    const partLabel = page.partTotal > 1
      ? (lang === 'ru' ? ` · лист ${page.partIndex + 1}/${page.partTotal}` : ` · sheet ${page.partIndex + 1}/${page.partTotal}`)
      : '';
    const progressLabel = lang === 'ru'
      ? `Часть ${page.chapterIndex + 1}${partLabel} · ${index + 2} из ${total + 1}`
      : `Part ${page.chapterIndex + 1}${partLabel} · ${index + 2} of ${total + 1}`;

    return `
      <section class="journal-collection-page" id="chapter-${page.chapterIndex + 1}-${page.partIndex + 1}" data-collection-page data-book-label="${escapeHtml(progressLabel)}">
        <div class="journal-collection-page__head">
          <p class="journal-post__eyebrow">${escapeHtml(lang === 'ru' ? `Часть ${page.chapterIndex + 1}${partLabel}` : `Part ${page.chapterIndex + 1}${partLabel}`)}</p>
          <h4>${escapeHtml(page.title)}</h4>
          ${page.date ? `<time>${escapeHtml(formatDate(page.date))}</time>` : ''}
        </div>
        ${mediaMarkup(page.media || [], page.slug)}
        ${bookTextMarkup(page.units)}
      </section>
    `;
  }

  function renderCollectionDetail(feed, collection, lang) {
    const title = entryTitle(collection, lang);
    const excerpt = entryExcerpt(collection, lang);
    const comments = Array.isArray(collection.comments) ? collection.comments : [];
    const likeState = likeStateBySlug[likeStateKey('collection', collection.slug)] || {
      liked: false,
      likesCount: collection.likesCount || 0,
    };
    const bookPages = buildCollectionBookPages(collection, lang);
    const pagesMarkup = bookPages.map((page, index) => renderCollectionBookPage(page, index, bookPages.length, lang)).join('');
    const pageList = (collection.pages || []).map((page, index) => {
      const pageTitle = entryTitle(page.post, lang);
      return `<li><span>${escapeHtml(String(index + 1))}</span>${escapeHtml(pageTitle)}</li>`;
    }).join('');
    const totalBookPages = bookPages.length + 1;
    const firstProgress = lang === 'ru'
      ? `Обложка · 1 из ${totalBookPages}`
      : `Cover · 1 of ${totalBookPages}`;

    const article = document.createElement('article');
    article.className = 'journal-post journal-post--single journal-collection-single';
    article.dataset.slug = collection.slug;
    article.dataset.kind = 'collection';
    article.innerHTML = `
      <div class="journal-collection-book" data-collection-book>
        <div class="journal-collection-book__nav">
          <button class="journal-collection-book__button" type="button" data-collection-step="-1" disabled>
            <span aria-hidden="true">‹</span>
            ${escapeHtml(lang === 'ru' ? 'Назад' : 'Back')}
          </button>
          <div class="journal-collection-book__progress" data-collection-progress>${escapeHtml(firstProgress)}</div>
          <button class="journal-collection-book__button" type="button" data-collection-step="1">
            ${escapeHtml(lang === 'ru' ? 'Дальше' : 'Next')}
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div class="journal-collection-book__viewport">
          <div class="journal-collection-book__track" data-collection-track>
            <section class="journal-collection-page journal-collection-page--cover" data-collection-page data-book-label="${escapeHtml(firstProgress)}">
              <div class="journal-post__meta">
                <div>
                  <p class="journal-post__eyebrow">${escapeHtml(lang === 'ru' ? 'Многостраничная запись' : 'Multi-page entry')}</p>
                  <h3 class="journal-post__title">${escapeHtml(title)}</h3>
                  <p class="journal-collection-cover__author">${escapeHtml(collection.authorLine || 'Vetus Nauta - Brkovic')}</p>
                </div>
                <div class="journal-post__date">${escapeHtml(formatDate(collection.date))}</div>
              </div>
              ${mediaMarkup(collection.media, collection.slug)}
              ${excerpt ? `<p class="journal-collection-cover__excerpt">${escapeHtml(excerpt)}</p>` : ''}
              <div class="journal-collection-single__meta">
                <span>${escapeHtml(lang === 'ru' ? `Глав: ${collection.pagesCount || collection.pages?.length || 0}` : `Chapters: ${collection.pagesCount || collection.pages?.length || 0}`)}</span>
              </div>
              ${pageList ? `
                <ol class="journal-collection-cover__pages journal-collection-cover__pages--book">
                  ${pageList}
                </ol>
              ` : ''}
            </section>
            ${pagesMarkup || `<section class="journal-collection-page" data-collection-page><div class="journal-empty">${escapeHtml(t('journal_empty', 'No entries yet.'))}</div></section>`}
          </div>
        </div>
      </div>
      <p class="journal-post__rights">${escapeHtml(t('journal_rights_notice', lang === 'ru' ? '© BRKOVIC / VETUS NAUTA. Текст и медиа защищены авторским правом. Использование только с письменного разрешения.' : '© BRKOVIC / VETUS NAUTA. Text and media are protected by copyright. Use only with written permission.'))}</p>
      <div class="journal-post__actions" id="journal-comments-${escapeHtml(collection.slug)}">
        <div class="journal-post__left">
          <button class="journal-action ${likeState.liked ? 'is-liked' : ''}" data-action="like" data-kind="collection" data-id="${escapeHtml(collection.id)}" data-slug="${escapeHtml(collection.slug)}">
            ${escapeHtml(t('journal_like', 'Like'))} · <span>${likeState.likesCount}</span>
          </button>
          <button class="journal-action" data-action="comment-focus" data-kind="collection" data-id="${escapeHtml(collection.id)}">
            ${escapeHtml(t('journal_comment', 'Comment'))} · <span>${comments.length || collection.commentsCount || 0}</span>
          </button>
        </div>
        <div class="journal-post__right">
          <button class="journal-action" data-action="share" data-kind="collection" data-id="${escapeHtml(collection.id)}" data-slug="${escapeHtml(collection.slug)}">
            ${escapeHtml(t('journal_share', 'Share'))}
          </button>
        </div>
      </div>
      <div class="journal-comments">
        <div class="journal-comments__list">${comments.map(commentMarkup).join('') || ''}</div>
        <form class="journal-comment-form" data-kind="collection" data-id="${escapeHtml(collection.id)}" data-slug="${escapeHtml(collection.slug)}">
          <input type="text" name="name" placeholder="${escapeHtml(t('journal_comment_name', 'Name'))}" maxlength="80" required />
          <input type="email" name="email" placeholder="${escapeHtml(t('journal_comment_email', 'Email (необязательно)'))}" maxlength="120" />
          <input type="text" name="text" placeholder="${escapeHtml(t('journal_comment_text', 'Написать комментарий'))}" maxlength="2000" required />
          <button class="btn btn--secondary" type="submit">${escapeHtml(t('journal_comment_submit', 'Send'))}</button>
        </form>
        <div class="journal-comment-status" data-comment-status-for="${escapeHtml(collection.id)}"></div>
      </div>
    `;

    feed.appendChild(article);
  }

  async function renderFeed(filter = 'all') {
    const feed = document.getElementById('journalFeed');
    if (!feed) return;

    feed.innerHTML = '';
    const isMediaFilter = !isSingleMode && (filter === 'photo' || filter === 'video');
    feed.classList.toggle('journal-feed--media', isMediaFilter);

    const lang = getLang();
    const currentSlug = new URLSearchParams(window.location.search).get('slug');

    const sourceEntries = !isSingleMode && filter === 'all'
      ? buildRootFeedEntries(backendEntries, journalCollections)
      : backendEntries;

    const filteredEntries = sourceEntries.filter((entry) => {
      if (filter === 'all') return true;
      if (filter === 'photo') return entry.media.some((item) => item.type === 'image');
      if (filter === 'video') return entry.media.some((item) => item.type === 'video');
      return true;
    });

    const entriesRaw = isSingleMode && currentSlug
      ? filteredEntries.filter((entry) => entry.slug === currentSlug)
      : filteredEntries;
    const entries = isSingleMode ? entriesRaw : sortEntriesForFeed(entriesRaw);

    if (!entries.length) {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_empty', 'No entries yet.'))}</div>`;
      return;
    }

    if (isMediaFilter) {
      await renderMediaFeed(feed, entries, filter, lang);
      bindLightboxTriggers();
      return;
    }

    for (const entry of entries) {
      if (entryKind(entry) === 'collection') {
        renderCollectionCoverCard(feed, entry, lang);
        continue;
      }

      const resolved = await resolveEntryText(entry, lang);

      const title = lang === 'ru'
        ? (resolved.title.ru || resolved.title.en || '')
        : (resolved.title.en || resolved.title.ru || '');

      const text = lang === 'ru'
        ? (resolved.text.ru || resolved.text.en || '')
        : (resolved.text.en || resolved.text.ru || '');

      const approvedComments = Array.isArray(entry.comments) ? entry.comments : [];
      const likeState = likeStateBySlug[likeStateKey('post', entry.slug)] || {
        liked: false,
        likesCount: entry.likesCount || 0,
      };

      const card = document.createElement('article');
      card.className = 'journal-post';
      if (isSingleMode) card.classList.add('journal-post--single');
      card.dataset.slug = entry.slug;
      if (!isSingleMode && entry.groupId && entry.group) {
        card.dataset.groupId = entry.groupId;
        card.dataset.groupOrder = String(entry.groupOrder || 0);
      }

      card.innerHTML = `
        <div class="journal-post__meta">
          <div>
            ${(() => {
              const noteNumber = getPostNumberBySlug(entries, entry.slug);
              return noteNumber
                ? `<div class="journal-note-number"><span>${escapeHtml(getLang() === 'ru' ? 'Заметка' : 'Note')}</span><span class="journal-note-number__value">№ ${noteNumber}</span></div>`
                : `<p class="journal-post__eyebrow">${escapeHtml(t('journal_post_meta', 'Ship log entry'))}</p>`;
            })()}
            <h3 class="journal-post__title">
              ${isSingleMode
                ? escapeHtml(title)
                : `<a href="journal.html?slug=${encodeURIComponent(entry.slug)}">${escapeHtml(title)}</a>`}
            </h3>
          </div>
          <div class="journal-post__date">${escapeHtml(formatDate(entry.date))}</div>
        </div>
        ${mediaMarkup(entry.media, entry.slug)}
        ${textMarkup(text)}
        ${readMoreButtonMarkup(text)}
        <p class="journal-post__rights">${escapeHtml(t('journal_rights_notice', getLang() === 'ru' ? '© BRKOVIC / VETUS NAUTA. Текст и медиа защищены авторским правом. Использование только с письменного разрешения.' : '© BRKOVIC / VETUS NAUTA. Text and media are protected by copyright. Use only with written permission.'))}</p>
        <div class="journal-post__actions">
          <div class="journal-post__left">
            <button class="journal-action ${likeState.liked ? 'is-liked' : ''}" data-action="like" data-id="${entry.id}" data-slug="${entry.slug}">
              ${escapeHtml(t('journal_like', 'Like'))} · <span>${likeState.likesCount}</span>
            </button>
            <button class="journal-action" data-action="comment-focus" data-id="${entry.id}">
              ${escapeHtml(t('journal_comment', 'Comment'))} · <span>${approvedComments.length || entry.commentsCount || 0}</span>
            </button>
          </div>
          <div class="journal-post__right">
            <button class="journal-action" data-action="share" data-id="${entry.id}" data-slug="${entry.slug}">
              ${escapeHtml(t('journal_share', 'Share'))}
            </button>
          </div>
        </div>
        <div class="journal-comments">
          <div class="journal-comments__list">${approvedComments.map(commentMarkup).join('') || ''}</div>
          <form class="journal-comment-form" data-kind="post" data-id="${entry.id}" data-slug="${entry.slug}">
            <input type="text" name="name" placeholder="${escapeHtml(t('journal_comment_name', 'Name'))}" maxlength="80" required />
            <input type="email" name="email" placeholder="${escapeHtml(t('journal_comment_email', 'Email (необязательно)'))}" maxlength="120" />
            <input type="text" name="text" placeholder="${escapeHtml(t('journal_comment_text', 'Написать комментарий'))}" maxlength="2000" required />
            <button class="btn btn--secondary" type="submit">${escapeHtml(t('journal_comment_submit', 'Send'))}</button>
          </form>
          <div class="journal-comment-status" data-comment-status-for="${entry.id}"></div>
          ${lang === 'en' && entry.text.ru && !entry.text.en ? `<div class="journal-translation-note">${escapeHtml(t('journal_translation_note','English text is generated automatically with free translation tools and can be edited later.'))}</div>` : ''}
        </div>
      `;

      const noteLabelNode = card.querySelector('.journal-note-number span:first-child');
      const noteValueNode = card.querySelector('.journal-note-number__value');
      const noteNumber = getPostNumberBySlug(entries, entry.slug);
      if (noteLabelNode) {
        noteLabelNode.textContent = getLang() === 'ru' ? '\u0417\u0430\u043c\u0435\u0442\u043a\u0430' : 'Note';
      }
      if (noteValueNode && noteNumber) {
        noteValueNode.textContent = `\u2116 ${noteNumber}`;
      }

      const rightsNode = card.querySelector('.journal-post__rights');
      if (rightsNode && !getTranslations().journal_rights_notice) {
        rightsNode.textContent = getLang() === 'ru'
          ? '\u00a9 BRKOVIC / VETUS NAUTA. \u0422\u0435\u043a\u0441\u0442 \u0438 \u043c\u0435\u0434\u0438\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u044b \u0430\u0432\u0442\u043e\u0440\u0441\u043a\u0438\u043c \u043f\u0440\u0430\u0432\u043e\u043c. \u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u0441 \u043f\u0438\u0441\u044c\u043c\u0435\u043d\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u044f.'
          : '\u00a9 BRKOVIC / VETUS NAUTA. Text and media are protected by copyright. Use only with written permission.';
      }

      feed.appendChild(card);
    }

    wrapJournalGroups(entries);
    bindFeedActions();
    bindLightboxTriggers();
    bindGroupCarousels();
  }

  async function renderSinglePost(slug, sequence = bootSequence) {
    const feed = document.getElementById('journalFeed');
    if (!feed) return;

    feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_loading', 'Loading entry...'))}</div>`;

    try {
      await fetchBackendEntries();
      if (sequence !== bootSequence) return;

      let detailedEntry = isLocalPreviewHost
        ? backendEntries.find((entry) => entry.slug === slug)
        : null;

      if (!detailedEntry) {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
          credentials: API_ORIGIN ? 'include' : 'same-origin',
        });
        const data = await res.json();
        if (sequence !== bootSequence) return;
        const item = data?.data?.data || data?.data;

        if (item?.id) {
          detailedEntry = normalizeApiPayload({ data: { data: [item] } })[0];
        }
      }

      if (!detailedEntry?.id) {
        feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_empty', 'Entry not found.'))}</div>`;
        return;
      }

      const existingIndex = backendEntries.findIndex((entry) => entry.slug === slug);

      if (existingIndex >= 0) {
        backendEntries[existingIndex] = detailedEntry;
      } else {
        backendEntries.unshift(detailedEntry);
      }

      await hydrateLikeStates();
      if (sequence !== bootSequence) return;
      await renderFeed('all');
    } catch {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_load_error', 'Failed to load entry.'))}</div>`;
    }
  }

  async function renderSingleCollection(slug, sequence = bootSequence) {
    const feed = document.getElementById('journalFeed');
    if (!feed) return;

    feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_loading', 'Loading entry...'))}</div>`;

    try {
      await fetchBackendEntries();
      if (sequence !== bootSequence) return;

      let detailedCollection = journalCollections.find((collection) => collection.slug === slug) || null;

      const res = await fetch(`${API_BASE}/collections/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
        credentials: API_ORIGIN ? 'include' : 'same-origin',
      });
      const data = await res.json();
      if (sequence !== bootSequence) return;
      const item = data?.data?.data || data?.data;

      if (item?.id) {
        detailedCollection = normalizeCollectionItem(item);
      }

      if (!detailedCollection?.id) {
        feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_empty', 'Entry not found.'))}</div>`;
        return;
      }

      const existingIndex = journalCollections.findIndex((collection) => collection.slug === slug);
      if (existingIndex >= 0) {
        journalCollections[existingIndex] = detailedCollection;
      } else {
        journalCollections.unshift(detailedCollection);
      }

      await hydrateLikeStates();
      if (sequence !== bootSequence) return;

      feed.innerHTML = '';
      renderCollectionDetail(feed, detailedCollection, getLang());
      bindFeedActions();
      bindLightboxTriggers();
      bindCollectionBooks();
    } catch {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_load_error', 'Failed to load entry.'))}</div>`;
    }
  }

  async function submitComment(kind, slug, payload) {
    const path = kind === 'collection'
      ? `${API_BASE}/collections/${encodeURIComponent(slug)}/comments`
      : `${API_BASE}/${encodeURIComponent(slug)}/comments`;
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: API_ORIGIN ? 'include' : 'same-origin',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Failed to submit comment');
    }

    return data;
  }

  async function likePost(slug, kind = 'post') {
    const path = kind === 'collection'
      ? `${API_BASE}/collections/${encodeURIComponent(slug)}/like`
      : `${API_BASE}/${encodeURIComponent(slug)}/like`;
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}',
      credentials: API_ORIGIN ? 'include' : 'same-origin',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Failed to like');
    }

    return data?.data?.data || data?.data || {};
  }

  async function unlikePost(slug, kind = 'post') {
    const path = kind === 'collection'
      ? `${API_BASE}/collections/${encodeURIComponent(slug)}/like`
      : `${API_BASE}/${encodeURIComponent(slug)}/like`;
    const res = await fetch(path, {
      method: 'DELETE',
      credentials: API_ORIGIN ? 'include' : 'same-origin',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Failed to unlike');
    }

    return data?.data?.data || data?.data || {};
  }

  function bindLightboxTriggers() {
    const nodes = document.querySelectorAll('.journal-post__media-item img[data-lightbox-index][data-lightbox-slug]');

    nodes.forEach((img) => {
      let startX = 0;
      let startY = 0;
      let moved = false;

      img.ontouchstart = (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
        moved = false;
      };

      img.ontouchmove = (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);
        if (dx > 10 || dy > 10) moved = true;
      };

      img.ontouchend = (event) => {
        if (Date.now() - lightboxJustClosedAt < 500) return;
        if (moved) return;

        event.preventDefault();
        event.stopPropagation();

        const slug = img.dataset.lightboxSlug;
        const index = Number(img.dataset.lightboxIndex || 0);
        if (!slug) return;

        openLightbox(slug, index);
      };

      img.onclick = (event) => {
        if (Date.now() - lightboxJustClosedAt < 500) return;

        event.preventDefault();
        event.stopPropagation();

        const slug = img.dataset.lightboxSlug;
        const index = Number(img.dataset.lightboxIndex || 0);
        if (!slug) return;

        openLightbox(slug, index);
      };
    });
  }

  function bindCollectionBooks() {
    document.querySelectorAll('[data-collection-book]').forEach((book) => {
      const track = book.querySelector('[data-collection-track]');
      const pages = Array.from(book.querySelectorAll('[data-collection-page]'));
      const progress = book.querySelector('[data-collection-progress]');
      const prevButton = book.querySelector('[data-collection-step="-1"]');
      const nextButton = book.querySelector('[data-collection-step="1"]');
      if (!track || !pages.length) return;

      const currentIndex = () => Math.max(0, Math.min(
        pages.length - 1,
        Math.round(track.scrollLeft / Math.max(1, track.clientWidth))
      ));

      const updateHeight = (index = currentIndex()) => {
        const page = pages[Math.max(0, Math.min(pages.length - 1, index))];
        if (!page) return;
        const height = Math.ceil(page.getBoundingClientRect().height);
        if (height > 0) track.style.minHeight = `${height}px`;
      };

      const updateState = (index = currentIndex()) => {
        const next = Math.max(0, Math.min(pages.length - 1, index));
        if (progress) {
          progress.textContent = pages[next]?.dataset.bookLabel || `${next + 1} / ${pages.length}`;
        }
        if (prevButton) prevButton.disabled = next <= 0;
        if (nextButton) nextButton.disabled = next >= pages.length - 1;
        updateHeight(next);
      };

      const goTo = (index) => {
        const next = Math.max(0, Math.min(pages.length - 1, index));
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
        updateState(next);
      };

      book.querySelectorAll('[data-collection-step]').forEach((button) => {
        button.onclick = () => goTo(currentIndex() + Number(button.dataset.collectionStep || 0));
      });

      let scrollTimer = 0;
      track.addEventListener('scroll', () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => updateState(), 80);
      });

      pages.forEach((page) => {
        page.querySelectorAll('img, video').forEach((media) => {
          media.addEventListener('load', () => updateHeight(), { once: true });
          media.addEventListener('loadedmetadata', () => updateHeight(), { once: true });
        });
      });

      window.addEventListener('resize', () => updateState());
      window.requestAnimationFrame(() => updateState(0));
    });
  }

  function bindFeedActions() {
    document.querySelectorAll('[data-action="like"]').forEach((button) => {
      button.onclick = async () => {
        const slug = button.dataset.slug;
        const kind = button.dataset.kind || 'post';
        if (!slug) return;

        button.disabled = true;

        try {
          const current = likeStateBySlug[likeStateKey(kind, slug)] || { liked: false, likesCount: 0 };
          const result = current.liked
            ? await unlikePost(slug, kind)
            : await likePost(slug, kind);

          likeStateBySlug[likeStateKey(kind, slug)] = {
            liked: !!result.liked,
            likesCount: Number(result.likesCount || 0),
          };

          if (isSingleMode) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('collection')) {
              await renderSingleCollection(params.get('collection'));
            } else {
              await renderSinglePost(params.get('slug'));
            }
          } else {
            await renderFeed(currentFilter);
          }
        } catch (error) {
          button.disabled = false;
        }
      };
    });

    document.querySelectorAll('[data-action="comment-focus"]').forEach((button) => {
      button.onclick = () => {
        const form = document.querySelector(`.journal-comment-form[data-id="${button.dataset.id}"] input[name="text"]`);
        if (form) form.focus();
      };
    });

    document.querySelectorAll('[data-action="share"]').forEach((button) => {
      button.onclick = async () => {
        const slug = button.dataset.slug;
        const kind = button.dataset.kind || 'post';
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set(kind === 'collection' ? 'collection' : 'slug', slug);

        if (navigator.share) {
          try {
            await navigator.share({ title: document.title, url: url.toString() });
            return;
          } catch {}
        }

        await navigator.clipboard.writeText(url.toString());
        button.textContent = t('journal_shared', 'Link copied');
        setTimeout(() => {
          if (isSingleMode) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('collection')) {
              renderSingleCollection(params.get('collection'));
            } else {
              renderSinglePost(params.get('slug'));
            }
          } else {
            renderFeed(currentFilter);
          }
        }, 1000);
      };
    });

    document.querySelectorAll('[data-action="read-more"]').forEach((button) => {
      button.onclick = () => {
        const card = button.closest('.journal-post');
        if (!card) return;
        const expanded = card.classList.toggle('journal-post--expanded');
        const groupCard = card.closest('.journal-group-card');
        if (groupCard) {
          groupCard.dispatchEvent(new CustomEvent('journal-group-height-refresh'));
        }
        button.textContent = expanded
          ? t('journal_read_less', getLang() === 'ru' ? '\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c' : 'Collapse')
          : t('journal_read_more', getLang() === 'ru' ? '\u0427\u0438\u0442\u0430\u0442\u044c \u0434\u0430\u043b\u044c\u0448\u0435' : 'Read more');
      };
    });

    document.querySelectorAll('.journal-comment-form').forEach((form) => {
      form.onsubmit = async (event) => {
        event.preventDefault();

        const id = form.dataset.id;
        const slug = form.dataset.slug;
        const kind = form.dataset.kind || 'post';
        const statusNode = document.querySelector(`[data-comment-status-for="${id}"]`);

        const authorName = form.elements.name.value.trim();
        const authorEmail = form.elements.email.value.trim();
        const content = form.elements.text.value.trim();

        if (!authorName || !content || !slug) return;

        if (statusNode) {
          statusNode.textContent = getLang() === 'ru'
            ? 'Отправка комментария...'
            : 'Submitting comment...';
        }

        try {
          await submitComment(kind, slug, {
            authorName,
            authorEmail: authorEmail || undefined,
            content,
          });

          form.reset();

          if (statusNode) {
            statusNode.textContent = getLang() === 'ru'
              ? 'Комментарий отправлен и ожидает модерации.'
              : 'Comment submitted and awaiting moderation.';
          }
        } catch (error) {
          if (statusNode) {
            statusNode.textContent = getLang() === 'ru'
              ? 'Не удалось отправить комментарий.'
              : 'Failed to submit comment.';
          }
        }
      };
    });
  }

  function setupFilters() {
    document.querySelectorAll('.journal-filter').forEach((button) => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter || 'all';
        document.querySelectorAll('.journal-filter').forEach((item) => item.classList.toggle('is-active', item === button));
        renderFeed(currentFilter);
      });
    });
  }

  function installCopyAttribution() {
    document.addEventListener('copy', (event) => {
      const selection = window.getSelection();
      const copied = String(selection || '').trim();
      const anchor = selection && selection.anchorNode ? (selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection.anchorNode.parentElement) : null;
      if (!anchor || !anchor.closest('.journal-post') || copied.length < 120) return;
      event.clipboardData.setData('text/plain', copied + '\n\n' + t('journal_copy_source', 'Source') + ': ' + window.location.href + '\n' + t('journal_copy_rights', '© BRKOVIC / VETUS NAUTA. All rights reserved.'));
      event.preventDefault();
    });
  }

  async function boot() {
    const sequence = ++bootSequence;
    const feed = document.getElementById('journalFeed');
    if (!feed) return;

    ensureLightbox();
    installCopyAttribution();
    await fetchGpsMeta();
    if (sequence !== bootSequence) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const collectionSlug = params.get('collection');
    isSingleMode = !!(slug || collectionSlug);
    singleModeKind = collectionSlug ? 'collection' : 'post';

    updateSingleModeUI(isSingleMode);
    fixJournalUiLabels(isSingleMode);
    setupFilters();

    if (isSingleMode && collectionSlug) {
      await renderSingleCollection(collectionSlug, sequence);
    } else if (isSingleMode && slug) {
      await renderSinglePost(slug, sequence);
    } else {
      await fetchBackendEntries();
      if (sequence !== bootSequence) return;
      await renderFeed(currentFilter);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => {
      if (!bootedAfterLanguage) boot();
    }, 1200);
  });
  document.addEventListener('languageChanged', () => {
    if (!document.getElementById('journalFeed')) return;
    bootedAfterLanguage = true;
    boot();
  });
})();

/* === Journal Nav Desk card polish 20260520 === */
(() => {
  let tapTimer = null;

  function isRu() {
    return document.documentElement.lang === 'ru';
  }

  function polishNavDeskCard() {
    const navCard = document.querySelector('.journal-card--navdesk');
    if (!navCard) return;

    const navEyebrow = navCard.querySelector('.section-heading__eyebrow');
    const navTitle = navCard.querySelector('h2');
    const navIntro = navCard.querySelector('[data-i18n="journal_navdesk_intro"]');

    navCard.classList.remove('journal-top-card-toggle', 'is-open');
    navCard.removeAttribute('role');
    navCard.removeAttribute('tabindex');
    navCard.removeAttribute('aria-expanded');
    navCard.setAttribute('aria-label', isRu() ? 'Открыть штурманский стол' : 'Open Nav Desk');

    if (navEyebrow) navEyebrow.textContent = isRu() ? 'Штурманский стол' : 'Nav Desk';
    if (navTitle) navTitle.textContent = isRu() ? 'Практические инструменты' : 'Practical tools';
    if (navIntro) {
      navIntro.textContent = isRu()
        ? 'Расчёты для перехода, топлива, времени, приливов и навигационного планирования.'
        : 'Calculations for passage, fuel, timing, tides and navigation planning.';
    }
  }

  function bindNavDeskFeedback() {
    const navCard = document.querySelector('.journal-card--navdesk');
    if (!navCard || navCard.dataset.tapFeedbackBound === '1') return;
    navCard.dataset.tapFeedbackBound = '1';

    navCard.addEventListener('pointerdown', (event) => {
      if (event.pointerType && event.pointerType !== 'touch') return;
      navCard.classList.add('is-tap-highlight');
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => {
        navCard.classList.remove('is-tap-highlight');
      }, 1400);
    }, { passive: true });
  }

  function runNavDeskPolish() {
    polishNavDeskCard();
    bindNavDeskFeedback();
    requestAnimationFrame(polishNavDeskCard);
    window.setTimeout(polishNavDeskCard, 240);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runNavDeskPolish);
  } else {
    runNavDeskPolish();
  }

  document.addEventListener('languageChanged', runNavDeskPolish);
})();
