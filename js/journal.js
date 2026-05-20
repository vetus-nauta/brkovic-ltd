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
  const STORAGE_TRANSLATIONS = 'brkovic_journal_translations_v1';

  let currentFilter = 'all';
  let backendEntries = [];
  let isSingleMode = false;
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

  function getPostNumberBySlug(posts, slug) {
    if (!Array.isArray(posts) || !slug) return null;

    const published = posts
      .filter((item) => item && item.slug && item.date)
      .slice()
      .sort((a, b) => {
        const at = new Date(a.date).getTime();
        const bt = new Date(b.date).getTime();
        if (at !== bt) return at - bt;
        return String(a.slug).localeCompare(String(b.slug));
      });

    const index = published.findIndex((item) => item.slug === slug);
    return index >= 0 ? index + 1 : null;
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

  function normalizeApiPayload(response) {
    const items = response?.data?.data || response?.data || [];
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
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
      media: Array.isArray(item.media) ? item.media.map((m) => {
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
          alt: (caption.ru || caption.en || item.titleRu || item.titleEn || '').trim(),
          caption,
          gpsLatLabel: gps.gpsLatLabel || '',
          gpsLonLabel: gps.gpsLonLabel || '',
          gpsDecimal: gps.gpsDecimal || ''
        };
      }) : [],
      comments: Array.isArray(item.comments) ? item.comments : [],
      commentsCount: item.commentsCount || 0,
      likesCount: item.likesCount || 0,
      isPinned: !!item.isPinned
    }));
  }

  async function fetchBackendEntries() {
    const feed = document.getElementById('journalFeed');
    if (feed) {
      feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_loading', 'Loading entries...'))}</div>`;
    }

    try {
      const res = await fetch(API_BASE, { cache: 'no-store' });
      const data = await res.json();
      backendEntries = normalizeApiPayload(data);
      await hydrateLikeStates();
    } catch {
      backendEntries = [];
      if (feed) {
        feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_load_error', 'Failed to load entries.'))}</div>`;
      }
    }
  }

  async function hydrateLikeStates() {
    const tasks = backendEntries.map(async (entry) => {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(entry.slug)}/like-status`, {
          cache: 'no-store',
          credentials: API_ORIGIN ? 'include' : 'same-origin',
        });
        const data = await res.json();
        const payload = data?.data?.data || data?.data || {};
        likeStateBySlug[entry.slug] = {
          liked: !!payload.liked,
          likesCount: Number(payload.likesCount || 0),
        };
      } catch {
        likeStateBySlug[entry.slug] = {
          liked: false,
          likesCount: entry.likesCount || 0,
        };
      }
    });

    await Promise.all(tasks);
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
    if (layout) layout.classList.toggle('journal-layout--single', singleMode);
    if (side) side.hidden = singleMode;
    if (filters) filters.hidden = singleMode;
    if (back) back.hidden = !singleMode;

    if (title) {
      title.textContent = singleMode
        ? (getLang() === 'ru' ? 'Запись судового журнала' : 'Journal entry')
        : (getLang() === 'ru' ? 'Заметки с морей' : 'Notes from the seas');
    }

    if (eyebrow) {
      eyebrow.textContent = singleMode
        ? (getLang() === 'ru' ? 'Запись' : 'Entry')
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
        ? '\u0417\u0430\u043f\u0438\u0441\u044c \u0441\u0443\u0434\u043e\u0432\u043e\u0433\u043e \u0436\u0443\u0440\u043d\u0430\u043b\u0430'
        : '\u0417\u0430\u043c\u0435\u0442\u043a\u0438 \u0441 \u043c\u043e\u0440\u0435\u0439';
    }

    if (eyebrow) {
      eyebrow.textContent = singleMode
        ? '\u0417\u0430\u043f\u0438\u0441\u044c'
        : '\u0421\u0443\u0434\u043e\u0432\u043e\u0439 \u0436\u0443\u0440\u043d\u0430\u043b';
    }
  }

  function groupDescription(group) {
    if (!group) return '';
    return getLang() === 'ru'
      ? (group.descriptionRu || group.descriptionEn || '')
      : (group.descriptionEn || group.descriptionRu || '');
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
          <div class="journal-group-card__tools">
            <button class="journal-group-card__button journal-group-card__button--top" type="button" data-group-step="-1" aria-label="Previous">\u2039</button>
            <div class="journal-group-card__count">${escapeHtml(String(sortedCards.length))}</div>
            <button class="journal-group-card__button journal-group-card__button--top" type="button" data-group-step="1" aria-label="Next">\u203a</button>
          </div>
        </div>
        <div class="journal-group-card__viewport">
          <div class="journal-group-card__track"></div>
        </div>
        <div class="journal-group-card__nav">
          <button class="journal-group-card__button" type="button" data-group-step="-1" aria-label="Previous">\u2039</button>
          <div class="journal-group-card__dots">
            ${sortedCards.map((_, index) => `<button class="journal-group-card__dot ${index === 0 ? 'is-active' : ''}" type="button" data-group-index="${index}" aria-label="${index + 1}"></button>`).join('')}
          </div>
          <button class="journal-group-card__button" type="button" data-group-step="1" aria-label="Next">\u203a</button>
        </div>
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
    if (!entry) return [];
    return (entry.media || []).filter((item) => item.type === 'image' && item.src);
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

  async function renderFeed(filter = 'all') {
    const feed = document.getElementById('journalFeed');
    if (!feed) return;

    feed.innerHTML = '';
    const isMediaFilter = !isSingleMode && (filter === 'photo' || filter === 'video');
    feed.classList.toggle('journal-feed--media', isMediaFilter);

    const lang = getLang();
    const currentSlug = new URLSearchParams(window.location.search).get('slug');

    const filteredEntries = backendEntries.filter((entry) => {
      if (filter === 'all') return true;
      if (filter === 'photo') return entry.media.some((item) => item.type === 'image');
      if (filter === 'video') return entry.media.some((item) => item.type === 'video');
      return true;
    });

    const entries = isSingleMode && currentSlug
      ? filteredEntries.filter((entry) => entry.slug === currentSlug)
      : filteredEntries;

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
      const resolved = await resolveEntryText(entry, lang);

      const title = lang === 'ru'
        ? (resolved.title.ru || resolved.title.en || '')
        : (resolved.title.en || resolved.title.ru || '');

      const text = lang === 'ru'
        ? (resolved.text.ru || resolved.text.en || '')
        : (resolved.text.en || resolved.text.ru || '');

      const approvedComments = Array.isArray(entry.comments) ? entry.comments : [];
      const likeState = likeStateBySlug[entry.slug] || {
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
              const noteNumber = getPostNumberBySlug(backendEntries, entry.slug);
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
          <form class="journal-comment-form" data-id="${entry.id}" data-slug="${entry.slug}">
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
      const noteNumber = getPostNumberBySlug(backendEntries, entry.slug);
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

      const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
        credentials: API_ORIGIN ? 'include' : 'same-origin',
      });
      const data = await res.json();
      if (sequence !== bootSequence) return;
      const item = data?.data?.data || data?.data;

      if (!item || !item.id) {
        feed.innerHTML = `<div class="journal-empty">${escapeHtml(t('journal_empty', 'Entry not found.'))}</div>`;
        return;
      }

      const detailedEntry = normalizeApiPayload({ data: { data: [item] } })[0];
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

  async function submitComment(slug, payload) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}/comments`, {
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

  async function likePost(slug) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}/like`, {
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

  async function unlikePost(slug) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}/like`, {
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

  function bindFeedActions() {
    document.querySelectorAll('[data-action="like"]').forEach((button) => {
      button.onclick = async () => {
        const slug = button.dataset.slug;
        if (!slug) return;

        button.disabled = true;

        try {
          const current = likeStateBySlug[slug] || { liked: false, likesCount: 0 };
          const result = current.liked
            ? await unlikePost(slug)
            : await likePost(slug);

          likeStateBySlug[slug] = {
            liked: !!result.liked,
            likesCount: Number(result.likesCount || 0),
          };

          if (isSingleMode) {
            const params = new URLSearchParams(window.location.search);
            await renderSinglePost(params.get('slug'));
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
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('slug', slug);

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
            renderSinglePost(params.get('slug'));
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
          await submitComment(slug, {
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
    isSingleMode = !!slug;

    updateSingleModeUI(isSingleMode);
    fixJournalUiLabels(isSingleMode);
    setupFilters();

    if (isSingleMode && slug) {
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
