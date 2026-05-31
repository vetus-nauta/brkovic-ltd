(function () {
  const SITE_ORIGIN = 'https://brkovic.ltd';
  const BRAND = 'VETUS NAUTA - Brkovic';
  const COPYRIGHT = '© BRKOVIC / VETUS NAUTA. All rights reserved.';
  const GA4_MEASUREMENT_ID = 'G-22MEK9BBFV';
  const CLARITY_PROJECT_ID = 'wzpd0d4a1d';
  const LANGS = ['en', 'ru', 'de', 'it', 'es', 'sr', 'zh'];
  const NON_DEFAULT_LANGS = LANGS.filter((lang) => lang !== 'en');

  const PAGES = {
    '/': {
      path: '/',
      title: 'BRKOVIC - Personal Yacht Expertise, Deliveries & Deck Log',
      description: 'VETUS NAUTA - Brkovic: practical yacht management, skipper service, yacht registration, private sea tours and maritime notes from Montenegro and the Adriatic.',
      image: '/images/hero/brkovic-ocean-winner-hero.jpg',
      type: 'website',
      schema: 'home',
    },
    '/index.html': {
      path: '/',
      title: 'BRKOVIC - Personal Yacht Expertise, Deliveries & Deck Log',
      description: 'VETUS NAUTA - Brkovic: practical yacht management, skipper service, yacht registration, private sea tours and maritime notes from Montenegro and the Adriatic.',
      image: '/images/hero/brkovic-ocean-winner-hero.jpg',
      type: 'website',
      schema: 'home',
    },
    '/journal.html': {
      path: '/journal.html',
      title: 'VETUS NAUTA - Brkovic | Deck Log',
      description: 'Deck log, maritime notes, routes, photos and sea experience by VETUS NAUTA - Brkovic.',
      image: '/images/hero/brkovic-ocean-winner-hero.jpg',
      type: 'article',
      schema: 'journal',
    },
    '/navdesk.html': {
      path: '/navdesk.html',
      title: 'VETUS NAUTA - Brkovic | Nav Desk',
      description: 'Practical Nav Desk tools for passage planning, fuel, ETA, tides, VHF, watch log and route calculations.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Nav Desk',
    },
    '/ship-cashbox/index.html': {
      path: '/ship-cashbox/index.html',
      title: 'VETUS NAUTA - Brkovic | Ship Cashbox',
      description: 'Shared ship cashbox for crew expenses, contributions, sync, and final settlement.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Ship Cashbox',
    },
    '/navdesk-route.html': {
      path: '/navdesk-route.html',
      title: 'VETUS NAUTA - Brkovic | Great Circle and Rhumb Line',
      description: 'Great circle, rhumb line, true course and intermediate coordinate calculator for passage planning.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Great Circle and Rhumb Line Calculator',
    },
    '/navdesk-tides.html': {
      path: '/navdesk-tides.html',
      title: 'VETUS NAUTA - Brkovic | Tides and Passage Window',
      description: 'Tide, depth, draft and under-keel clearance planning tool for preliminary passage-window calculations.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Tides and Passage Window',
    },
    '/navdesk-ukv.html': {
      path: '/navdesk-ukv.html',
      title: 'VETUS NAUTA - Brkovic | VHF and Message Templates',
      description: 'VHF radio spelling, vessel profile and working message templates for maritime communication.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'VHF and Message Templates',
    },
    '/navdesk-watch.html': {
      path: '/navdesk-watch.html',
      title: 'VETUS NAUTA - Brkovic | Watch Log',
      description: 'Watch schedule, current watch and working passage notes for small yacht crews.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Watch Log',
    },
    '/navdesk-english.html': {
      path: '/navdesk-english.html',
      title: 'VETUS NAUTA - Brkovic | Maritime English',
      description: 'Maritime English learning section for practical yacht communication.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'tool',
      toolName: 'Maritime English',
    },
    '/services/yacht-management.html': {
      path: '/services/yacht-management.html',
      title: 'Yacht Management in Montenegro and the Adriatic - BRKOVIC',
      description: 'Operational yacht management in Montenegro and the Adriatic: supervision, contractors, guest readiness, estimates and owner-readable reporting.',
      image: '/images/services/yacht-management-hero.jpg',
      type: 'website',
      schema: 'service',
      serviceName: 'Yacht Management',
    },
    '/services/iyt-training.html': {
      path: '/services/iyt-training.html',
      title: 'IYT Training in Montenegro - BRKOVIC Partner School Network',
      description: 'Future skipper preparation through IYT training partners in Montenegro, with practical navigation and on-water training routes.',
      image: '/images/services/iyt-navigation-saloon-hero.png',
      type: 'website',
      schema: 'service',
      serviceName: 'IYT Training',
    },
    '/services/skipper-service.html': {
      path: '/services/skipper-service.html',
      title: 'Skipper Service in Montenegro and the Adriatic - BRKOVIC',
      description: 'Professional skipper service for private yacht trips, owner support, passages and calm practical command on the Adriatic.',
      image: '/images/services/skipper-service-captain-ron-hero-final.png',
      type: 'website',
      schema: 'service',
      serviceName: 'Skipper Service',
    },
    '/services/sailing-tours.html': {
      path: '/services/sailing-tours.html',
      title: 'Private Sea Tours in Montenegro, Croatia and Italy - BRKOVIC',
      description: 'Private sea routes for a day, a week or longer in Montenegro, Croatia and Italy with a skipper and live passage planning.',
      image: '/images/services/sailing-tours-grotto-hero.png',
      type: 'website',
      schema: 'service',
      serviceName: 'Private Sea Tours',
    },
    '/services/yacht-acceptance-delivery.html': {
      path: '/services/yacht-acceptance-delivery.html',
      title: 'Yacht Acceptance and Delivery - BRKOVIC',
      description: 'Independent yacht handover, condition check, preparation notes and delivery passage support from start point to destination.',
      image: '/images/services/yacht-acceptance-delivery-hero.png',
      type: 'website',
      schema: 'service',
      serviceName: 'Yacht Acceptance and Delivery',
    },
    '/services/yacht-registration.html': {
      path: '/services/yacht-registration.html',
      title: 'Yacht Registration Support in Montenegro - BRKOVIC',
      description: 'Montenegro yacht registration support: documents, survey coordination, required maintenance and communication with authorities.',
      image: '/images/services/yacht-registration-hero.png',
      type: 'website',
      schema: 'service',
      serviceName: 'Yacht Registration',
    },
    '/copyright.html': {
      path: '/copyright.html',
      title: 'Copyright and Use of Materials - BRKOVIC',
      description: 'Copyright notice for VETUS NAUTA - Brkovic: texts, photographs, routes, tools and site materials are protected by copyright.',
      image: '/brand/logo-header-inline-light.png',
      type: 'website',
      schema: 'creativeWork',
    },
  };

  function absolute(path) {
    return new URL(path, SITE_ORIGIN).href;
  }

  function normalizePath() {
    const path = window.location.pathname || '/';
    if (path === '/index.html') return '/index.html';
    return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  }

  function pageConfig() {
    const path = normalizePath();
    return PAGES[path] || PAGES[path.replace(/\/$/, '')] || null;
  }

  function currentLanguage() {
    const api = window.BRKOVIC_LANGUAGE;
    if (api && typeof api.getCurrentLang === 'function') return api.getCurrentLang();
    return (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
  }

  function canonicalUrl(page, lang = currentLanguage()) {
    const url = new URL(page.path || '/', SITE_ORIGIN);
    if (lang && lang !== 'en') url.searchParams.set('lang', lang);
    return url.href;
  }

  function alternateUrl(page, lang) {
    return canonicalUrl(page, lang);
  }

  function ensureMeta(selector, create) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = create();
      document.head.appendChild(node);
    }
    return node;
  }

  function setMetaName(name, content) {
    const node = ensureMeta(`meta[name="${name}"]`, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      return meta;
    });
    node.setAttribute('content', content);
  }

  function setMetaProperty(property, content) {
    const node = ensureMeta(`meta[property="${property}"]`, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      return meta;
    });
    node.setAttribute('content', content);
  }

  function setLink(rel, href, attrs = {}) {
    const attrSelector = Object.entries(attrs)
      .map(([key, value]) => `[${key}="${String(value).replace(/"/g, '\\"')}"]`)
      .join('');
    const node = ensureMeta(`link[rel="${rel}"]${attrSelector}`, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', rel);
      Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
      return link;
    });
    node.setAttribute('href', href);
  }

  function baseGraph(page, url, title, description, image) {
    const organizationId = absolute('/#organization');
    const websiteId = absolute('/#website');
    const graph = [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: BRAND,
        url: absolute('/'),
        logo: absolute('/brand/logo-header-inline-light.png'),
        sameAs: ['https://instagram.com/uskipper'],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: BRAND,
        url: absolute('/'),
        publisher: { '@id': organizationId },
        inLanguage: LANGS,
        copyrightHolder: { '@id': organizationId },
        copyrightNotice: COPYRIGHT,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        image,
        isPartOf: { '@id': websiteId },
        publisher: { '@id': organizationId },
        copyrightHolder: { '@id': organizationId },
        copyrightNotice: COPYRIGHT,
        inLanguage: currentLanguage(),
      },
    ];

    if (page.schema === 'service') {
      graph.push({
        '@type': 'Service',
        '@id': `${url}#service`,
        name: page.serviceName || title,
        description,
        provider: { '@id': organizationId },
        areaServed: ['Montenegro', 'Croatia', 'Italy', 'Adriatic Sea'],
        serviceType: page.serviceName || 'Yacht service',
        url,
      });
    }

    if (page.schema === 'tool') {
      graph.push({
        '@type': 'WebApplication',
        '@id': `${url}#tool`,
        name: page.toolName || title,
        description,
        url,
        applicationCategory: 'NavigationApplication',
        operatingSystem: 'Any',
        publisher: { '@id': organizationId },
      });
    }

    if (page.schema === 'journal') {
      graph.push({
        '@type': 'Blog',
        '@id': `${url}#journal`,
        name: title,
        description,
        url,
        publisher: { '@id': organizationId },
        copyrightHolder: { '@id': organizationId },
        copyrightNotice: COPYRIGHT,
      });
    }

    if (page.schema === 'creativeWork') {
      graph.push({
        '@type': 'CreativeWork',
        '@id': `${url}#rights`,
        name: title,
        description,
        url,
        author: { '@id': organizationId },
        publisher: { '@id': organizationId },
        copyrightHolder: { '@id': organizationId },
        copyrightNotice: COPYRIGHT,
        license: url,
        inLanguage: currentLanguage(),
      });
    }

    if (page.path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: BRAND,
            item: absolute('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title.replace(/\s+-\s+BRKOVIC.*$/i, ''),
            item: url,
          },
        ],
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function updateJsonLd(page, url, title, description, image) {
    const node = ensureMeta('script[type="application/ld+json"][data-seo-jsonld]', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoJsonld = 'true';
      return script;
    });
    node.textContent = JSON.stringify(baseGraph(page, url, title, description, image));
  }

  function updateSeo() {
    const page = pageConfig();
    if (!page) return;

    const lang = currentLanguage();
    const title = document.title || page.title;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || page.description;
    const url = canonicalUrl(page, lang);
    const image = absolute(page.image);

    setLink('canonical', url);
    setLink('alternate', alternateUrl(page, 'en'), { hreflang: 'en' });
    setLink('alternate', alternateUrl(page, 'en'), { hreflang: 'x-default' });
    NON_DEFAULT_LANGS.forEach((code) => setLink('alternate', alternateUrl(page, code), { hreflang: code }));

    setMetaName('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMetaName('author', BRAND);
    setMetaName('copyright', COPYRIGHT);
    setMetaName('rights', COPYRIGHT);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', image);
    setMetaProperty('og:type', page.type || 'website');
    setMetaProperty('og:site_name', BRAND);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', image);
    setMetaProperty('og:locale', lang === 'en' ? 'en_US' : lang);
    updateJsonLd(page, url, title, description, image);
  }

  function installAnalytics() {
    if (!GA4_MEASUREMENT_ID || document.documentElement.dataset.ga4Installed === 'true') return;
    if (!['brkovic.ltd', 'www.brkovic.ltd'].includes(window.location.hostname)) return;
    document.documentElement.dataset.ga4Installed = 'true';

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: true,
    });

    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
      document.head.appendChild(script);
    }
  }

  function installClarity() {
    if (!CLARITY_PROJECT_ID || document.documentElement.dataset.clarityInstalled === 'true') return;
    if (!['brkovic.ltd', 'www.brkovic.ltd'].includes(window.location.hostname)) return;
    document.documentElement.dataset.clarityInstalled = 'true';

    window.clarity = window.clarity || function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    if (!document.querySelector(`script[src*="clarity.ms/tag/${CLARITY_PROJECT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_PROJECT_ID)}`;
      document.head.appendChild(script);
    }
  }

  function contentAlternateUrl(input, lang) {
    const url = new URL(input.url || window.location.href, SITE_ORIGIN);
    if (lang === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    return url.href;
  }

  function setContentMetadata(input = {}) {
    const title = String(input.title || document.title || BRAND).trim();
    const description = String(input.description || document.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim();
    const image = absolute(input.image || '/images/hero/brkovic-ocean-winner-hero.jpg');
    const url = new URL(input.url || window.location.href, SITE_ORIGIN).href;
    const lang = currentLanguage();
    const schemaType = input.schemaType || 'Article';
    const organizationId = absolute('/#organization');

    document.title = title;
    if (description) setMetaName('description', description);
    setLink('canonical', url);
    setLink('alternate', contentAlternateUrl(input, 'en'), { hreflang: 'en' });
    setLink('alternate', contentAlternateUrl(input, 'en'), { hreflang: 'x-default' });
    NON_DEFAULT_LANGS.forEach((code) => setLink('alternate', contentAlternateUrl(input, code), { hreflang: code }));
    setMetaProperty('og:type', input.ogType || 'article');
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', image);
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', image);

    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': organizationId,
          name: BRAND,
          url: absolute('/'),
          logo: absolute('/brand/logo-header-inline-light.png'),
          sameAs: ['https://instagram.com/uskipper'],
        },
        {
          '@type': schemaType,
          '@id': `${url}#content`,
          headline: title,
          name: title,
          description,
          url,
          image,
          author: {
            '@type': 'Organization',
            name: input.author || BRAND,
          },
          publisher: { '@id': organizationId },
          datePublished: input.datePublished || undefined,
          dateModified: input.dateModified || input.datePublished || undefined,
          inLanguage: lang,
          copyrightHolder: { '@id': organizationId },
          copyrightNotice: COPYRIGHT,
          isAccessibleForFree: true,
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: BRAND, item: absolute('/') },
            { '@type': 'ListItem', position: 2, name: 'Deck Log', item: absolute('/journal.html') },
            { '@type': 'ListItem', position: 3, name: title, item: url },
          ],
        },
      ],
    };

    const node = ensureMeta('script[type="application/ld+json"][data-seo-jsonld]', () => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoJsonld = 'true';
      return script;
    });
    node.textContent = JSON.stringify(graph);
  }

  function installCopyAttribution() {
    if (document.documentElement.dataset.seoCopyAttribution === 'true') return;
    document.documentElement.dataset.seoCopyAttribution = 'true';
    document.addEventListener('copy', (event) => {
      const selection = window.getSelection();
      const copied = String(selection || '').trim();
      if (copied.length < 100) return;
      const anchor = selection && selection.anchorNode
        ? (selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection.anchorNode.parentElement)
        : null;
      if (!anchor || anchor.closest('input, textarea, [contenteditable="true"], .journal-post')) return;
      event.clipboardData.setData('text/plain', `${copied}\n\nSource: ${window.location.href}\n${COPYRIGHT}`);
      event.preventDefault();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateSeo();
    installAnalytics();
    installClarity();
    installCopyAttribution();
  });
  document.addEventListener('languageChanged', () => window.setTimeout(updateSeo, 0));
  window.BRKOVIC_SEO = { update: updateSeo, setContentMetadata };
})();
