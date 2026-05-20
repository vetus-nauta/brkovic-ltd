(function () {
  const state = {
    type: 'motor',
    length: '15-20',
    crew: 'none',
  };

  const CORE_MONTHLY_KEYS = ['boatWatch', 'technicalWatch', 'ownerRep'];
  const MONTHLY_ADDON_KEYS = [
    'batteryPower',
    'machineryStart',
    'ventilationHumidity',
    'sailingRigSupervision',
  ];
  const ONE_TIME_KEYS = [
    'guestArrival',
    'deepInteriorCleaning',
    'exteriorDetailing',
    'seasonLaunch',
    'winterization',
    'emergencyVisit',
    'yardPeriod',
    'safetyReview',
    'tenderToys',
    'provisioningConcierge',
  ];

  const DEFAULT_PRICING = {
    currency: 'EUR',
    typeData: {
      motor: { label: 'ym_type_motor', factor: 1 },
      sailing: { label: 'ym_type_sailing', factor: 1.1 },
      motorCat: { label: 'ym_type_motor_cat', factor: 1.25 },
      sailingCat: { label: 'ym_type_sailing_cat', factor: 1.35 },
    },
    lengthData: {
      under15: { label: '<15m', base: 1670, factor: .85 },
      '15-20': { label: '15-20m', base: 1960, factor: 1 },
      '20-25': { label: '20-25m', base: 2310, factor: 1.18 },
      '25-30': { label: '25-30m', base: 2700, factor: 1.38 },
      '30-35': { label: '30-35m', base: 3180, factor: 1.62 },
      '35-40': { label: '35-40m', base: 3720, factor: 1.9 },
      '40plus': { label: '40m+', base: 0, factor: 0, individual: true },
    },
    crewData: {
      none: { label: 'ym_crew_none', factor: 1, note: 'ym_crew_note_none' },
      skeleton: { label: 'ym_crew_skeleton', factor: .8, note: 'ym_crew_note_skeleton' },
      fullNoCaptain: { label: 'ym_crew_full_no_captain', factor: .55, note: 'ym_crew_note_full_no_captain' },
      fullCaptain: { label: 'ym_crew_full_captain', factor: .35, note: 'ym_crew_note_full_captain' },
    },
    monthlyServices: {
      boatWatch: { label: 'ym_card_boat_title', price: 520, reduction: 'physical', enabled: true },
      technicalWatch: { label: 'ym_card_technical_title', price: 680, reduction: 'partial', enabled: true },
      ownerRep: { label: 'ym_card_owner_title', price: 760, reduction: 'management', enabled: true },
      batteryPower: { label: 'ym_monthly_battery_title', description: 'ym_monthly_battery_desc', price: 0, reduction: 'partial', enabled: true },
      machineryStart: { label: 'ym_monthly_machinery_title', description: 'ym_monthly_machinery_desc', price: 0, reduction: 'partial', enabled: true },
      ventilationHumidity: { label: 'ym_monthly_ventilation_title', description: 'ym_monthly_ventilation_desc', price: 0, reduction: 'physical', enabled: true },
      sailingRigSupervision: { label: 'ym_monthly_rig_title', description: 'ym_monthly_rig_desc', price: 0, reduction: 'partial', enabled: true, sailingOnly: true },
    },
    sailingServices: {},
    oneTimeServices: {
      guestArrival: { label: 'ym_one_guest', description: 'ym_one_guest_desc', price: 0, enabled: true, allowQuantity: true },
      deepInteriorCleaning: { label: 'ym_one_deep_interior', description: 'ym_one_deep_interior_desc', price: 0, enabled: true, allowQuantity: true },
      exteriorDetailing: { label: 'ym_one_detailing', description: 'ym_one_detailing_desc', price: 0, enabled: true, allowQuantity: true },
      seasonLaunch: { label: 'ym_one_launch', description: 'ym_one_launch_desc', price: 0, enabled: true, allowQuantity: true },
      winterization: { label: 'ym_one_winter', description: 'ym_one_winter_desc', price: 0, enabled: true, allowQuantity: true },
      emergencyVisit: { label: 'ym_one_emergency', description: 'ym_one_emergency_desc', price: 0, enabled: true, allowQuantity: true },
      yardPeriod: { label: 'ym_one_yard', description: 'ym_one_yard_desc', price: 0, enabled: true, allowQuantity: true },
      safetyReview: { label: 'ym_one_safety_review', description: 'ym_one_safety_review_desc', price: 0, enabled: true, allowQuantity: true },
      tenderToys: { label: 'ym_one_tender_toys', description: 'ym_one_tender_toys_desc', price: 0, enabled: true, allowQuantity: true },
      provisioningConcierge: { label: 'ym_one_provisioning', description: 'ym_one_provisioning_desc', price: 0, enabled: true, allowQuantity: true },
    },
    range: {
      monthlyLow: .86,
      monthlyHigh: 1.18,
      oneTimeLow: .85,
      oneTimeHigh: 1.2,
    },
  };

  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const PRICING_URL = new URL('../data/management-pricing.json?v=20260519-01', scriptUrl).href;
  const MANAGEMENT_API_URL = new URL('../management-admin-api.php', scriptUrl).href;

  let pricing = normalizePricing(DEFAULT_PRICING);
  let typeData = pricing.typeData;
  let lengthData = pricing.lengthData;
  let crewData = pricing.crewData;
  let monthlyServices = pricing.monthlyServices;
  let sailingServices = pricing.sailingServices;
  let oneTimeServices = pricing.oneTimeServices;

  let translations = window.__BRKOVIC_TRANSLATIONS || {};

  function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function toNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"]/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    }[m]));
  }

  function mergeGroup(defaultGroup, remoteGroup) {
    const result = {};
    Object.keys(defaultGroup || {}).forEach((key) => {
      result[key] = { ...defaultGroup[key], ...(isPlainObject(remoteGroup?.[key]) ? remoteGroup[key] : {}) };
    });
    Object.keys(remoteGroup || {}).forEach((key) => {
      if (!result[key] && isPlainObject(remoteGroup[key])) result[key] = remoteGroup[key];
    });
    return result;
  }

  function normalizePricing(input) {
    const remote = isPlainObject(input) ? input : {};
    const base = DEFAULT_PRICING;
    const normalized = {
      ...base,
      ...remote,
      typeData: mergeGroup(base.typeData, remote.typeData),
      lengthData: mergeGroup(base.lengthData, remote.lengthData),
      crewData: mergeGroup(base.crewData, remote.crewData),
      monthlyServices: mergeGroup(base.monthlyServices, remote.monthlyServices),
      sailingServices: mergeGroup(base.sailingServices, remote.sailingServices),
      oneTimeServices: mergeGroup(base.oneTimeServices, remote.oneTimeServices),
      range: { ...base.range, ...(isPlainObject(remote.range) ? remote.range : {}) },
    };

    Object.values(normalized.typeData).forEach((item) => { item.factor = toNumber(item.factor, 1); });
    Object.values(normalized.lengthData).forEach((item) => {
      item.base = toNumber(item.base, 0);
      item.factor = toNumber(item.factor, 1);
    });
    Object.values(normalized.crewData).forEach((item) => { item.factor = toNumber(item.factor, 1); });
    [normalized.monthlyServices, normalized.sailingServices, normalized.oneTimeServices].forEach((group) => {
      Object.values(group).forEach((item) => { item.price = toNumber(item.price, 0); });
    });
    Object.keys(normalized.range).forEach((key) => {
      normalized.range[key] = toNumber(normalized.range[key], base.range[key]);
    });

    return normalized;
  }

  function applyPricing(nextPricing) {
    pricing = normalizePricing(nextPricing);
    typeData = pricing.typeData;
    lengthData = pricing.lengthData;
    crewData = pricing.crewData;
    monthlyServices = pricing.monthlyServices;
    sailingServices = pricing.sailingServices;
    oneTimeServices = pricing.oneTimeServices;
  }

  async function loadPricing() {
    try {
      const response = await fetch(PRICING_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Pricing file unavailable');
      applyPricing(await response.json());
      render();
    } catch (error) {
      applyPricing(DEFAULT_PRICING);
    }
  }

  function t(key, fallback) {
    return translations[key] || fallback || key;
  }

  function euro(value) {
    return new Intl.NumberFormat(document.documentElement.lang === 'ru' ? 'ru-RU' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(value)));
  }

  function euroRange(low, high) {
    const lang = document.documentElement.lang === 'ru' ? 'ru-RU' : 'en-GB';
    const formatNumber = (value) => new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));
    const lowText = formatNumber(low);
    const highText = formatNumber(high);
    return lang === 'ru-RU' ? `${lowText}-${highText}€` : `€${lowText}-${highText}`;
  }

  function roundPrice(value) {
    return Math.round(toNumber(value, 0) / 10) * 10;
  }

  function selectedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
  }

  function isSailingType() {
    return state.type === 'sailing' || state.type === 'sailingCat';
  }

  function serviceAvailable(item) {
    if (!item || item.enabled === false) return false;
    if (item.publicVisible === false || item.adminOnly === true) return false;
    return !item.sailingOnly || isSailingType();
  }

  function orderedServiceEntries(source, order) {
    const seen = new Set();
    const entries = [];

    (order || []).forEach((key, index) => {
      if (!source[key]) return;
      entries.push([key, source[key], index]);
      seen.add(key);
    });

    Object.entries(source || {}).forEach(([key, item]) => {
      if (!seen.has(key)) entries.push([key, item, Number.MAX_SAFE_INTEGER]);
    });

    return entries
      .sort((a, b) => {
        const orderA = Number.isFinite(Number(a[1]?.order)) ? Number(a[1].order) : a[2];
        const orderB = Number.isFinite(Number(b[1]?.order)) ? Number(b[1].order) : b[2];
        return orderA - orderB;
      })
      .map(([key, item]) => [key, item])
      .filter(([, item]) => serviceAvailable(item));
  }

  function monthlyAddOnEntries() {
    return orderedServiceEntries(monthlyServices, MONTHLY_ADDON_KEYS)
      .filter(([key]) => !CORE_MONTHLY_KEYS.includes(key));
  }

  function serviceTitle(item, key) {
    const lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
    const localized = lang === 'ru' ? item.titleRu : item.titleEn;
    return localized || item.title || t(item.label, key);
  }

  function serviceDescription(item) {
    const lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
    const localized = lang === 'ru' ? item.descriptionRu : item.descriptionEn;
    return localized || item.descriptionText || t(item.description, '');
  }

  function baseSelected() {
    const input = document.getElementById('managementBaseToggle');
    return input ? input.checked : true;
  }

  function selectedOneTimeDetails() {
    return Array.from(document.querySelectorAll('[data-management-onetime-row]')).map((row) => {
      const checkbox = row.querySelector('input[name="onetime"]');
      if (!checkbox?.checked) return null;
      const key = checkbox.value;
      const quantity = Math.max(1, Math.round(toNumber(row.querySelector('[data-onetime-quantity]')?.value, 1)));
      return { key, quantity };
    }).filter(Boolean);
  }

  function renderDynamicChoices() {
    const monthlyNode = document.getElementById('managementMonthlyAddons');
    const oneTimeNode = document.getElementById('managementOneTimeServices');
    const selectedMonthly = new Set(selectedValues('monthly'));
    const selectedOneTime = new Set(selectedOneTimeDetails().map((item) => item.key));
    const oneTimeQuantities = new Map(Array.from(document.querySelectorAll('[data-management-onetime-row]')).map((row) => {
      const key = row.querySelector('input[name="onetime"]')?.value || '';
      const quantity = Math.max(1, Math.round(toNumber(row.querySelector('[data-onetime-quantity]')?.value, 1)));
      return [key, quantity];
    }));

    if (monthlyNode) {
      const rows = monthlyAddOnEntries().map(([key, item]) => `
        <label class="management-service-line">
          <input type="checkbox" name="monthly" value="${key}" ${selectedMonthly.has(key) ? 'checked' : ''} />
          <span>
            <strong>${serviceTitle(item, key)}</strong>
            <small>${serviceDescription(item)}</small>
          </span>
        </label>
      `);
      monthlyNode.innerHTML = rows.length ? rows.join('') : `<p class="management-empty-note">${t('ym_empty_monthly_addons', 'No monthly add-ons are active.')}</p>`;
    }

    if (oneTimeNode) {
      const rows = orderedServiceEntries(oneTimeServices, ONE_TIME_KEYS).map(([key, item]) => {
        const quantity = oneTimeQuantities.get(key) || Math.max(1, Math.round(toNumber(item.quantityDefault, 1)));
        const checked = selectedOneTime.has(key);
        return `
          <label class="management-service-line management-service-line--quantity" data-management-onetime-row>
            <input type="checkbox" name="onetime" value="${key}" ${checked ? 'checked' : ''} />
            <span>
              <strong>${serviceTitle(item, key)}</strong>
              <small>${serviceDescription(item)}</small>
            </span>
            <span class="management-quantity-control">
              <span>${t('ym_quantity_label', 'Qty')}</span>
              <input type="number" min="1" step="1" value="${quantity}" data-onetime-quantity aria-label="${t('ym_quantity_label', 'Qty')}" />
            </span>
          </label>
        `;
      });
      oneTimeNode.innerHTML = rows.length ? rows.join('') : `<p class="management-empty-note">${t('ym_empty_onetime', 'No one-time services are active.')}</p>`;
    }
  }

  function coreMonthlyLabels() {
    return CORE_MONTHLY_KEYS
      .map((key) => monthlyServices[key])
      .filter(Boolean)
      .map((item) => t(item.label));
  }

  function serviceCrewFactor(service) {
    const crew = state.crew;
    const crewItem = crewData[crew] || crewData.none;
    if (service.reduction === 'management') {
      return crew === 'fullCaptain' ? .85 : crew === 'fullNoCaptain' ? .9 : crew === 'skeleton' ? .95 : 1;
    }
    if (service.reduction === 'partial') {
      return crewItem.factor + ((1 - crewItem.factor) * .45);
    }
    return crewItem.factor;
  }

  function baseCrewFactor() {
    const coreServices = CORE_MONTHLY_KEYS.map((key) => monthlyServices[key]).filter(Boolean);
    const total = coreServices.reduce((sum, service) => sum + toNumber(service.price, 0), 0);
    if (!total) return 1;
    const adjusted = coreServices.reduce((sum, service) => (
      sum + (toNumber(service.price, 0) * serviceCrewFactor(service))
    ), 0);
    return adjusted / total;
  }

  function calculate() {
    const length = lengthData[state.length] || lengthData['15-20'];
    const type = typeData[state.type] || typeData.motor;
    const isIndividual = state.length === '40plus' || length.individual;
    const baseIncluded = baseSelected();
    const monthlySelected = selectedValues('monthly');
    const oneTimeDetails = selectedOneTimeDetails();

    if (isIndividual) {
      return { isIndividual, baseIncluded, monthlySelected, oneTimeDetails };
    }

    const baseMonthly = baseIncluded ? roundPrice(length.base * type.factor * baseCrewFactor()) : 0;
    let monthlyAddOns = 0;
    monthlySelected.forEach((key) => {
      const service = monthlyServices[key];
      if (serviceAvailable(service)) monthlyAddOns += roundPrice(service.price * length.factor * type.factor * serviceCrewFactor(service));
    });
    const monthly = baseMonthly + monthlyAddOns;

    let oneTime = 0;
    oneTimeDetails.forEach(({ key, quantity }) => {
      const service = oneTimeServices[key];
      if (serviceAvailable(service)) oneTime += roundPrice(service.price * length.factor * type.factor) * quantity;
    });

    return {
      isIndividual,
      baseMonthlyLow: baseMonthly * pricing.range.monthlyLow,
      baseMonthlyHigh: baseMonthly * pricing.range.monthlyHigh,
      monthlyAddOnsLow: monthlyAddOns * pricing.range.monthlyLow,
      monthlyAddOnsHigh: monthlyAddOns * pricing.range.monthlyHigh,
      monthlyLow: monthly * pricing.range.monthlyLow,
      monthlyHigh: monthly * pricing.range.monthlyHigh,
      oneTimeLow: oneTime ? oneTime * pricing.range.oneTimeLow : 0,
      oneTimeHigh: oneTime ? oneTime * pricing.range.oneTimeHigh : 0,
      monthlySelected,
      oneTimeDetails,
      baseIncluded,
    };
  }

  function serviceLabels(keys, source) {
    return keys.map((key) => source[key]).filter((item) => item && item.enabled !== false).map((item) => t(item.label));
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function updateSailingVisibility() {
    const step = document.getElementById('sailingOperationsStep');
    if (!step) return;
    const visible = state.type === 'sailing' || state.type === 'sailingCat';
    step.hidden = !visible;
    if (!visible) {
      step.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
    }
  }

  function render() {
    renderDynamicChoices();
    updateSailingVisibility();
    const result = calculate();
    const summary = document.getElementById('managementSummary');
    const type = typeData[state.type] || typeData.motor;
    const crew = crewData[state.crew] || crewData.none;
    const length = lengthData[state.length] || lengthData['15-20'];
    const typeLabel = t(type.label);
    const crewLabel = t(crew.label);
    const lengthLabel = length.label;

    if (result.isIndividual) {
      setText('managementBaseMonthlyRange', t('ym_result_individual_short', 'On request'));
      setText('managementAddOnMonthlyRange', t('ym_result_individual_short', 'On request'));
      setText('managementMonthlyRange', t('ym_result_individual', 'Individual agreement'));
      setText('managementOneTimeRange', t('ym_result_individual_short', 'On request'));
    } else {
      setText('managementBaseMonthlyRange', euroRange(result.baseMonthlyLow, result.baseMonthlyHigh));
      setText('managementAddOnMonthlyRange', result.monthlyAddOnsHigh ? euroRange(result.monthlyAddOnsLow, result.monthlyAddOnsHigh) : euro(0));
      setText('managementMonthlyRange', euroRange(result.monthlyLow, result.monthlyHigh));
      setText('managementOneTimeRange', result.oneTimeHigh ? euroRange(result.oneTimeLow, result.oneTimeHigh) : euro(0));
    }

    if (summary) {
      const monthlyLabels = serviceLabels(result.monthlySelected, monthlyServices);
      const baseLabels = coreMonthlyLabels();
      const baseSummary = result.baseIncluded
        ? baseLabels.join(', ')
        : t('ym_summary_base_off', 'not selected');
      const oneTimeLabels = result.oneTimeDetails
        .map(({ key, quantity }) => {
          const service = oneTimeServices[key];
          return serviceAvailable(service) ? `${serviceTitle(service, key)} × ${quantity}` : '';
        })
        .filter(Boolean);
      const items = [
        `${typeLabel}, ${lengthLabel}`,
        `${t('ym_summary_crew', 'Crew')}: ${crewLabel}`,
        `${t('ym_summary_base', 'Base')}: ${baseSummary}`,
        `${t('ym_summary_monthly', 'Monthly')}: ${monthlyLabels.length ? monthlyLabels.join(', ') : t('ym_summary_none', 'not selected')}`,
      ];
      if (oneTimeLabels.length) items.push(`${t('ym_summary_onetime', 'One-time')}: ${oneTimeLabels.join(', ')}`);
      summary.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
    }

    const note = document.getElementById('managementCrewNote');
    if (note) note.textContent = t(crew.note);
  }

  function buildRequestMessage() {
    const result = calculate();
    const summary = Array.from(document.querySelectorAll('#managementSummary li')).map((li) => `- ${li.textContent}`).join('\n');
    const monthly = document.getElementById('managementMonthlyRange')?.textContent || '';
    const oneTime = document.getElementById('managementOneTimeRange')?.textContent || '';
    const lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
    if (lang === 'ru') {
      return `Здравствуйте. Прошу подготовить индивидуальное предложение по яхт менеджменту.\n\nПредварительный расчет:\nМесячное сопровождение: ${monthly}\nРазовые услуги: ${oneTime}\n\nВыбранные параметры:\n${summary}\n\nКомментарий по яхте: `;
    }
    return `Hello. Please prepare an individual yacht management proposal.\n\nPreliminary estimate:\nMonthly management: ${monthly}\nOne-time services: ${oneTime}\n\nSelected scope:\n${summary}\n\nYacht details / comments: `;
  }

  function sendRequest() {
    const message = document.getElementById('messageField');
    const contact = document.getElementById('contact');
    closeOpenManagementModals();
    if (message) message.value = buildRequestMessage();
    if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function printEstimate() {
    closeOpenManagementModals();
    render();
    const amounts = draftAmounts();
    const number = makePublicDocumentNumber('VN-EST-DEMO');
    printDemoHtml(publicDocumentHtml('estimate', number, amounts));
  }

  function setDemoStatus(text) {
    const node = document.getElementById('managementDemoStatus');
    if (node) node.textContent = text || '';
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function compactNumber(value) {
    return String(value || '').replace(/[^0-9A-Za-z]/g, '').slice(-6).padStart(3, '0');
  }

  function makePublicDocumentNumber(prefix) {
    return `${prefix}-${todayISO().replace(/-/g, '')}-${compactNumber(Date.now().toString(36))}`;
  }

  function currentLang() {
    return document.documentElement.lang === 'ru' ? 'ru' : 'en';
  }

  function invoiceDefaults() {
    return pricing.invoiceDefaults || {};
  }

  function companyLogoUrl() {
    const logo = invoiceDefaults().logoUrl || 'brand/logo-vetus-nauta-night-clean.png';
    if (/^(https?:)?\/\//i.test(logo) || logo.startsWith('data:')) return logo;
    if (logo.startsWith('/')) return new URL(logo, window.location.origin).href;
    return new URL(`../${logo.replace(/^\.?\//, '')}`, scriptUrl).href;
  }

  function printLogoUrl() {
    return new URL('../brand/icon-mark-light.png', scriptUrl).href;
  }

  function companyInfo() {
    const invoice = invoiceDefaults();
    return {
      name: invoice.companyName || 'VETUS NAUTA / BRKOVIC',
      address: invoice.address || '85320, Obala BB, Tivat, Porto Montenegro',
      email: invoice.email || 'vetus.nauta@gmail.com',
      phone: invoice.phone || '+38268255550',
    };
  }

  function displayDate() {
    return new Intl.DateTimeFormat(currentLang() === 'ru' ? 'ru-RU' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  function baseMonthlyDescription(lang) {
    if (lang === 'ru') {
      return 'Регулярный контроль яхты у причала, технический контроль основных систем, представление интересов владельца и спокойная операционная координация.';
    }
    return 'Recurring yacht control alongside, technical watch of main systems, owner representation and calm operational coordination.';
  }

  function draftAmounts() {
    const length = lengthData[state.length] || lengthData['15-20'];
    const type = typeData[state.type] || typeData.motor;
    const individual = state.length === '40plus' || length.individual;
    if (individual) {
      return {
        individual: true,
        baseMonthly: 0,
        monthlyAddOns: [],
        oneTimeServices: [],
        monthlyTotal: 0,
        oneTimeTotal: 0,
      };
    }

    const baseMonthly = baseSelected() ? roundPrice(length.base * type.factor * baseCrewFactor()) : 0;
    const monthlyAddOns = selectedValues('monthly').map((key) => {
      const service = monthlyServices[key];
      if (!serviceAvailable(service)) return null;
      return {
        key,
        title: serviceTitle(service, key),
        description: serviceDescription(service),
        quantity: 1,
        unitPrice: roundPrice(service.price * length.factor * type.factor * serviceCrewFactor(service)),
        price: roundPrice(service.price * length.factor * type.factor * serviceCrewFactor(service)),
      };
    }).filter(Boolean);
    const oneTimeServicesSelected = selectedOneTimeDetails().map(({ key, quantity }) => {
      const service = oneTimeServices[key];
      if (!serviceAvailable(service)) return null;
      const unitPrice = roundPrice(service.price * length.factor * type.factor);
      return {
        key,
        title: serviceTitle(service, key),
        description: serviceDescription(service),
        quantity,
        unitPrice,
        price: unitPrice * quantity,
      };
    }).filter(Boolean);
    const monthlyAddOnsTotal = monthlyAddOns.reduce((sum, item) => sum + item.price, 0);
    const oneTimeTotal = oneTimeServicesSelected.reduce((sum, item) => sum + item.price, 0);
    return {
      individual: false,
      baseMonthly,
      monthlyAddOns,
      oneTimeServices: oneTimeServicesSelected,
      monthlyTotal: baseMonthly + monthlyAddOnsTotal,
      oneTimeTotal,
    };
  }

  function publicDocumentTitle(kind, lang) {
    if (kind === 'monthlyProforma') return lang === 'ru' ? 'Профактура месячных услуг' : 'Monthly Services Proforma';
    if (kind === 'oneTimeProforma') return lang === 'ru' ? 'Профактура разовых услуг' : 'One-time Services Proforma';
    return lang === 'ru' ? 'Предварительный расчет' : 'Preliminary Estimate';
  }

  function publicDocumentMode(kind) {
    if (kind === 'monthlyProforma') return 'monthly';
    if (kind === 'oneTimeProforma') return 'oneTime';
    return 'all';
  }

  function publicMonthlyRows(amounts, lang) {
    return [
      baseSelected() ? {
        title: lang === 'ru' ? 'База месяца: контроль, технический контроль, представление владельца' : 'Monthly base: yacht watch, technical control, owner representation',
        description: baseMonthlyDescription(lang),
        quantity: lang === 'ru' ? '1 мес.' : '1 month',
        unitPrice: amounts.baseMonthly,
        price: amounts.baseMonthly,
      } : null,
      ...amounts.monthlyAddOns.map((item) => ({
        title: item.title,
        description: item.description,
        quantity: lang === 'ru' ? '1 мес.' : '1 month',
        unitPrice: item.unitPrice || item.price,
        price: item.price,
      })),
    ].filter(Boolean);
  }

  function publicOneTimeRows(amounts) {
    return amounts.oneTimeServices.map((item) => ({
      title: item.title,
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: item.unitPrice,
      price: item.price,
    }));
  }

  function publicMoney(value, amounts) {
    return amounts.individual ? t('ym_result_individual_short', 'On request') : euro(value);
  }

  function publicSectionHtml(title, note, rows, total, emptyText, amounts) {
    return `
      <section class="public-doc-section">
        <div class="public-doc-section__head">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(note)}</p>
          </div>
          <strong>${escapeHtml(publicMoney(total, amounts))}</strong>
        </div>
        <table class="public-doc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${escapeHtml(currentLang() === 'ru' ? 'Услуга и содержание' : 'Service and scope')}</th>
              <th>${escapeHtml(currentLang() === 'ru' ? 'Кол-во' : 'Qty')}</th>
              <th>${escapeHtml(currentLang() === 'ru' ? 'Net / ед.' : 'Net / unit')}</th>
              <th>${escapeHtml(currentLang() === 'ru' ? 'Net без НДС' : 'Net excl. VAT')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td class="public-doc-item">
                  <strong>${escapeHtml(item.title)}</strong>
                  ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ''}
                </td>
                <td>${escapeHtml(item.quantity)}</td>
                <td>${escapeHtml(publicMoney(item.unitPrice, amounts))}</td>
                <td>${escapeHtml(publicMoney(item.price, amounts))}</td>
              </tr>
            `).join('') : `<tr class="public-doc-empty"><td colspan="5">${escapeHtml(emptyText)}</td></tr>`}
          </tbody>
        </table>
      </section>
    `;
  }

  function publicDocumentHtml(kind, number, amounts) {
    const lang = currentLang();
    const title = publicDocumentTitle(kind, lang);
    const mode = publicDocumentMode(kind);
    const type = typeData[state.type] || typeData.motor;
    const crew = crewData[state.crew] || crewData.none;
    const length = lengthData[state.length] || lengthData['15-20'];
    const company = companyInfo();
    const monthlyRows = publicMonthlyRows(amounts, lang);
    const oneTimeRows = publicOneTimeRows(amounts);
    const showMonthly = mode === 'all' || mode === 'monthly';
    const showOneTime = mode === 'all' || mode === 'oneTime';
    const total = (showMonthly ? amounts.monthlyTotal : 0) + (showOneTime ? amounts.oneTimeTotal : 0);
    const summary = Array.from(document.querySelectorAll('#managementSummary li')).map((li) => li.textContent).join(' · ');
    const monthlyRange = document.getElementById('managementMonthlyRange')?.textContent || '';
    const oneTimeRange = document.getElementById('managementOneTimeRange')?.textContent || '';
    const monthlyNote = lang === 'ru'
      ? 'Регулярные позиции, рассчитанные как месячный net без НДС.'
      : 'Recurring items calculated as monthly net, VAT excluded.';
    const oneTimeNote = lang === 'ru'
      ? 'Событийные работы, рассчитанные по выбранному количеству, net без НДС.'
      : 'Event-based works calculated by selected quantity, net, VAT excluded.';

    return `
      <article class="public-demo-document proforma-document">
        <header class="public-doc-header">
          <div class="public-doc-intro">
            <div class="public-doc-company-card">
              <div class="public-doc-logo-card">
                <img src="${escapeHtml(printLogoUrl())}" alt="${escapeHtml(company.name)}" />
              </div>
              <div class="public-doc-company">
                <strong>${escapeHtml(company.name)}</strong>
                <span>${escapeHtml(company.address)}</span>
                <span>${escapeHtml(company.email)} · ${escapeHtml(company.phone)}</span>
                <span>${escapeHtml(lang === 'ru' ? 'Документ' : 'Document')}: ${escapeHtml(number)}</span>
                <span>${escapeHtml(lang === 'ru' ? 'Дата' : 'Date')}: ${escapeHtml(displayDate())}</span>
              </div>
            </div>
            <div class="public-doc-title-card">
              <p>Yacht management</p>
              <h1>${escapeHtml(title)}</h1>
              <span>${escapeHtml(lang === 'ru' ? 'Net расчет без НДС' : 'Net estimate, VAT excluded')}</span>
            </div>
          </div>
        </header>

        <section class="public-doc-scope">
          <div>
            <span>${escapeHtml(lang === 'ru' ? 'Яхта' : 'Yacht')}</span>
            <strong>${escapeHtml(type ? t(type.label) : '')}, ${escapeHtml(length.label || state.length)}</strong>
          </div>
          <div>
            <span>${escapeHtml(t('ym_summary_crew', 'Crew'))}</span>
            <strong>${escapeHtml(t(crew.label))}</strong>
          </div>
          <div>
            <span>${escapeHtml(lang === 'ru' ? 'Месячный диапазон net' : 'Monthly net range')}</span>
            <strong>${escapeHtml(monthlyRange)}</strong>
          </div>
          <div>
            <span>${escapeHtml(lang === 'ru' ? 'Разовые услуги net' : 'One-time services net')}</span>
            <strong>${escapeHtml(oneTimeRange)}</strong>
          </div>
        </section>

        ${summary ? `<p class="public-doc-summary">${escapeHtml(summary)}</p>` : ''}

        ${showMonthly ? publicSectionHtml(
          lang === 'ru' ? 'Месячное сопровождение' : 'Monthly management',
          monthlyNote,
          monthlyRows,
          amounts.monthlyTotal,
          lang === 'ru' ? 'Месячные позиции не выбраны.' : 'No monthly items selected.',
          amounts,
        ) : ''}

        ${showOneTime ? publicSectionHtml(
          lang === 'ru' ? 'Разовые услуги' : 'One-time services',
          oneTimeNote,
          oneTimeRows,
          amounts.oneTimeTotal,
          lang === 'ru' ? 'Разовые позиции не выбраны.' : 'No one-time items selected.',
          amounts,
        ) : ''}

        <footer class="public-doc-footer">
          <div>
            <span>${escapeHtml(lang === 'ru' ? 'Итого выбранных позиций' : 'Selected net total')}</span>
            <strong>${escapeHtml(publicMoney(total, amounts))}</strong>
            <small>${escapeHtml(lang === 'ru' ? 'Все цены указаны без НДС.' : 'All prices are shown excluding VAT.')}</small>
          </div>
          <p>${escapeHtml(t('ym_disclaimer', ''))}</p>
        </footer>
      </article>
    `;
  }

  function demoDocumentHtml(kind, number, amounts) {
    return publicDocumentHtml(kind, number, amounts);
  }

  function publicPrintPageHtml(html) {
    const lang = currentLang();
    return `<!DOCTYPE html>
	      <html lang="${document.documentElement.lang}">
	      <head>
	        <meta charset="UTF-8" />
	        <title>Yacht management print</title>
	        <style>
	          @page { size: A4; margin: 10mm 14mm 10mm 10mm; }
	          * { box-sizing: border-box; }
	          html, body { margin: 0; background: #fff; }
	          body { color: #10243a; font-family: Arial, sans-serif; font-size: 9.8pt; }
	          .print-window-toolbar {
	            position: sticky;
	            top: 0;
	            z-index: 5;
	            display: flex;
	            justify-content: flex-end;
	            gap: 8px;
	            padding: 10px 12px;
	            background: rgba(255,255,255,.96);
	            border-bottom: 1px solid rgba(16,36,58,.12);
	          }
	          .print-window-toolbar button {
	            min-height: 38px;
	            padding: 0 14px;
	            border: 1px solid rgba(16,36,58,.18);
	            border-radius: 8px;
	            background: #fff;
	            color: #10243a;
	            font: 700 13px Arial, sans-serif;
	            cursor: pointer;
	          }
	          .print-window-toolbar button:first-child {
	            border-color: #10243a;
	            background: #10243a;
	            color: #fff;
	          }
          .print-page { padding: 10mm 12mm 10mm 10mm; }
          .public-demo-document { display: grid; gap: 11px; width: 100%; }
          .public-doc-header {
            padding-bottom: 4mm;
            border-bottom: 1px solid rgba(16,36,58,.22);
          }
          .public-doc-intro {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(54mm, .48fr);
            gap: 3mm;
            min-width: 0;
          }
          .public-doc-company-card,
          .public-doc-title-card {
            min-width: 0;
            min-height: 26mm;
            padding: 3mm;
            border: 1px solid rgba(16,36,58,.14);
            border-radius: 3mm;
            background: #f8fafc;
          }
          .public-doc-company-card {
            display: grid;
            grid-template-columns: 24mm minmax(0, 1fr);
            gap: 3mm;
            align-items: center;
          }
          .public-doc-logo-card {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .public-doc-logo-card img {
            width: 22mm;
            height: 22mm;
            object-fit: contain;
            object-position: center;
            display: block;
            filter: grayscale(1) contrast(1.45) brightness(.58);
          }
          .public-doc-title-card {
            display: grid;
            align-content: center;
            gap: 1.5mm;
          }
          .public-doc-company span,
          .public-doc-scope span,
          .public-doc-footer span,
          .public-doc-footer small {
            display: block;
            color: #647386;
            line-height: 1.35;
          }
          .public-doc-title-card p {
            margin: 0;
            color: #10243a;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .public-doc-title-card span {
            color: #647386;
            font-size: 8pt;
            line-height: 1.25;
          }
          h1 {
            margin: 0;
            color: #10243a;
            font-size: 18pt;
            line-height: 1.08;
          }
          .public-doc-company {
            display: grid;
            gap: 1.2mm;
            text-align: left;
            font-size: 8pt;
          }
          .public-doc-company strong {
            color: #10243a;
            font-size: 10pt;
            line-height: 1.15;
            text-transform: uppercase;
          }
          .public-doc-scope {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1.6mm;
          }
          .public-doc-scope > div {
            min-width: 0;
            padding: 2.4mm;
            border: 1px solid rgba(16,36,58,.12);
            border-radius: 3mm;
            background: #f8fafc;
          }
          .public-doc-scope strong {
            display: block;
            margin-top: 1mm;
            color: #10243a;
            font-size: 9.4pt;
            line-height: 1.25;
          }
          .public-doc-summary {
            margin: 0;
            padding: 2.4mm 3mm;
            border-left: 1.2mm solid rgba(193,164,99,.42);
            background: #fbfaf6;
            color: #43566a;
            line-height: 1.42;
          }
          .public-doc-section {
            display: grid;
            gap: 2mm;
            break-inside: avoid;
          }
          .public-doc-section__head {
            display: flex;
            justify-content: space-between;
            gap: 5mm;
            align-items: end;
          }
          h2 {
            margin: 0 0 1mm;
            color: #10243a;
            font-size: 11.4pt;
            letter-spacing: 0;
          }
          .public-doc-section__head p {
            margin: 0;
            color: #647386;
            line-height: 1.35;
          }
          .public-doc-section__head strong {
            white-space: nowrap;
            color: #10243a;
            font-size: 11.2pt;
          }
          .public-doc-table {
            width: calc(100% - 2mm);
            border-collapse: collapse;
            table-layout: fixed;
            margin-right: 2mm;
          }
          .public-doc-table thead { display: table-header-group; }
          .public-doc-table tr { break-inside: avoid; }
          .public-doc-table th,
          .public-doc-table td {
            padding: 2mm 2.2mm;
            border: 1px solid rgba(16,36,58,.14);
            text-align: left;
            vertical-align: top;
          }
          .public-doc-table th {
            background: #10243a;
            color: #fff;
            font-size: 7.1pt;
            font-weight: 700;
            text-transform: uppercase;
          }
          .public-doc-table th:nth-child(1),
          .public-doc-table td:nth-child(1) { width: 7mm; text-align: center; }
          .public-doc-table th:nth-child(3),
          .public-doc-table td:nth-child(3) { width: 15mm; text-align: center; }
          .public-doc-table th:nth-child(4),
          .public-doc-table th:nth-child(5),
          .public-doc-table td:nth-child(4),
          .public-doc-table td:nth-child(5) { width: 21mm; text-align: right; white-space: nowrap; }
          .public-doc-item strong {
            display: block;
            color: #10243a;
            line-height: 1.25;
          }
          .public-doc-item span {
            display: block;
            margin-top: 1mm;
            color: #647386;
            line-height: 1.35;
          }
          .public-doc-empty td {
            color: #647386;
            text-align: center !important;
          }
          .public-doc-footer {
            display: grid;
            grid-template-columns: minmax(40mm, auto) minmax(0, 1fr);
            gap: 5mm;
            align-items: start;
            margin-top: 2mm;
            padding-top: 4mm;
            border-top: 1px solid rgba(16,36,58,.22);
          }
          .public-doc-footer strong {
            display: block;
            margin: 1mm 0;
            color: #10243a;
            font-size: 15pt;
          }
          .public-doc-footer p {
            margin: 0;
            color: #647386;
            line-height: 1.42;
          }
	          @media print {
	            .print-window-toolbar { display: none !important; }
	            .print-page { padding: 0; }
	          }
	          @media (max-width: 760px) {
	            .public-doc-footer { grid-template-columns: 1fr; }
	            .public-doc-intro { grid-template-columns: 1fr; }
	            .public-doc-company-card { grid-template-columns: 22mm minmax(0, 1fr); }
	            .public-doc-company { text-align: left; }
	            .public-doc-scope { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	          }
	        </style>
	      </head>
	      <body>
	        <div class="print-window-toolbar">
	          <button type="button" onclick="window.print()">${escapeHtml(lang === 'ru' ? 'Печать' : 'Print')}</button>
	          <button type="button" onclick="window.close()">${escapeHtml(lang === 'ru' ? 'Закрыть' : 'Close')}</button>
	        </div>
	        <main class="print-page">${html}</main>
	        <script>
	          window.addEventListener('load', function () {
	            window.setTimeout(function () {
	              window.focus();
	              window.print();
	            }, 650);
	          });
	        </script>
	      </body>
	      </html>`;
  }

  function closeTopLevelPrintSheet() {
    document.getElementById('managementPrintSheet')?.remove();
    document.getElementById('managementPrintSheetStyles')?.remove();
    document.documentElement.classList.remove('is-management-printing');
  }

  function showTopLevelPrintSheet(pageHtml) {
    closeTopLevelPrintSheet();

    const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
    const style = document.createElement('style');
    style.id = 'managementPrintSheetStyles';
    style.textContent = `${Array.from(parsed.querySelectorAll('style')).map((node) => node.textContent || '').join('\n')}
      @media screen {
        #managementPrintSheet {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          overflow: auto;
          padding: 18px;
          background: #e7ebf0;
        }
        #managementPrintSheet .print-page {
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto 18px;
          background: #fff;
          box-shadow: 0 18px 48px rgba(16,36,58,.18);
        }
      }
      @media print {
        html.is-management-printing,
        html.is-management-printing body {
          background: #fff !important;
        }
        html.is-management-printing body > :not(#managementPrintSheet) {
          display: none !important;
        }
        #managementPrintSheet {
          display: block !important;
          position: static !important;
          inset: auto !important;
          overflow: visible !important;
          padding: 0 !important;
          background: #fff !important;
        }
      }
    `;

    const sheet = document.createElement('section');
    sheet.id = 'managementPrintSheet';
    sheet.setAttribute('aria-label', 'Yacht management print preview');
    sheet.innerHTML = parsed.body.innerHTML;
    document.head.appendChild(style);
    document.body.appendChild(sheet);
    document.documentElement.classList.add('is-management-printing');

    const [printButton, closeButton] = sheet.querySelectorAll('.print-window-toolbar button');
    if (printButton) printButton.onclick = () => window.print();
    if (closeButton) closeButton.onclick = closeTopLevelPrintSheet;

    window.addEventListener('afterprint', closeTopLevelPrintSheet, { once: true });
    window.setTimeout(() => {
      window.focus();
      window.print();
    }, 250);
  }

  function printDemoHtml(html) {
    const pageHtml = publicPrintPageHtml(html);
    showTopLevelPrintSheet(pageHtml);
  }

  function buildPublicDraftProject(kind, number, amounts) {
    const type = typeData[state.type] || typeData.motor;
    const crew = crewData[state.crew] || crewData.none;
    const length = lengthData[state.length] || lengthData['15-20'];
    const documentNumbers = {
      project: makePublicDocumentNumber('VN-YM-DEMO'),
      monthlyProforma: kind === 'monthlyProforma' ? number : '',
      oneTimeProforma: kind === 'oneTimeProforma' ? number : '',
    };
    return {
      status: 'public-demo',
      source: 'public-demo',
      projectNumber: documentNumbers.project,
      title: kind === 'monthlyProforma' ? 'Public demo monthly proforma' : 'Public demo one-time proforma',
      client: { name: 'Public page demo' },
      yacht: {
        name: `${t(type.label)} ${length.label || state.length}`,
        typeKey: state.type,
        typeLabel: t(type.label),
        lengthKey: state.length,
        lengthLabel: length.label || state.length,
        crewKey: state.crew,
        crewLabel: t(crew.label),
      },
      selections: {
        includeBase: baseSelected(),
        monthlyServices: amounts.monthlyAddOns,
        oneTimeServices: amounts.oneTimeServices,
      },
      amounts: {
        monthlyBase: amounts.baseMonthly,
        monthlyAddOnsTotal: amounts.monthlyAddOns.reduce((sum, item) => sum + item.price, 0),
        monthlyTotal: amounts.monthlyTotal,
        oneTimeTotal: amounts.oneTimeTotal,
      },
      documentNumbers,
      notes: 'Saved from the public yacht management calculator as a draft demo document.',
      pricingSnapshot: {
        version: pricing.version || 1,
        updatedAt: pricing.updatedAt || '',
      },
    };
  }

  async function savePublicDraft(kind, number, html, amounts) {
    const response = await fetch(`${MANAGEMENT_API_URL}?projects=1`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'issueDocument',
        documentType: kind,
        documentHtml: html,
        project: buildPublicDraftProject(kind, number, amounts),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      throw new Error(data?.error?.message || 'Draft was not saved');
    }
    return data.data;
  }

  async function createDemoProforma(kind) {
    closeOpenManagementModals();
    render();
    const amounts = draftAmounts();
    const prefix = kind === 'monthlyProforma' ? 'VN-PF-M-DEMO' : 'VN-PF-O-DEMO';
    const number = makePublicDocumentNumber(prefix);
    const html = demoDocumentHtml(kind, number, amounts);
    printDemoHtml(html);
    setDemoStatus(t(kind === 'monthlyProforma' ? 'ym_demo_status_monthly' : 'ym_demo_status_onetime', 'Preparing document...'));
    try {
      await savePublicDraft(kind, number, html, amounts);
      setDemoStatus(t('ym_demo_status_saved', 'Draft saved to admin projects.'));
    } catch (error) {
      setDemoStatus(`${t('ym_demo_status_printed', 'Document is ready for print/PDF.')} ${error.message || ''}`.trim());
    }
  }

  function bindChoices() {
    document.querySelectorAll('[data-management-group]').forEach((group) => {
      const key = group.dataset.managementGroup;
      group.querySelectorAll('.management-choice').forEach((button) => {
        button.addEventListener('click', () => {
          state[key] = button.dataset.value;
          group.querySelectorAll('.management-choice').forEach((item) => item.classList.toggle('is-selected', item === button));
          render();
        });
      });
    });
    const form = document.getElementById('managementCalcForm');
    form?.addEventListener('change', render);
    form?.addEventListener('input', (event) => {
      if (event.target?.matches?.('[data-onetime-quantity]')) render();
    });
  }

  function focusFirstModalControl(modal) {
    const target = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (target && typeof target.focus === 'function') {
      setTimeout(() => target.focus(), 30);
    }
  }

  function openManagementModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    closeOpenManagementModals();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('management-modal-open');
    focusFirstModalControl(modal);
  }

  function closeManagementModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.management-modal.is-open')) {
      document.body.classList.remove('management-modal-open');
    }
  }

  function closeOpenManagementModals() {
    document.querySelectorAll('.management-modal.is-open').forEach((modal) => {
      if (modal.id === 'managementDisclaimerModal') return;
      closeManagementModal(modal);
    });
  }

  function closeManagementDisclaimerModal() {
    closeManagementModal(document.getElementById('managementDisclaimerModal'));
  }

  function ensureManagementDisclaimer() {
    const key = 'managementDisclaimerAcceptedVersion';
    const version = '2026-05-19';
    try {
      if (localStorage.getItem(key) === version) return;
    } catch (error) {}

    openManagementModal('managementDisclaimerModal');
    document.getElementById('managementDisclaimerAccept')?.addEventListener('click', () => {
      try {
        localStorage.setItem(key, version);
      } catch (error) {}
      closeManagementDisclaimerModal();
    }, { once: true });
  }

  function bindManagementModals() {
    const triggers = [
      ['managementConfigOpenBtn', 'managementConfigModal'],
      ['managementDocsOpenBtn', 'managementDocsModal'],
      ['managementInfoOpenBtn', 'managementInfoModal'],
    ];

    triggers.forEach(([triggerId, modalId]) => {
      document.getElementById(triggerId)?.addEventListener('click', () => openManagementModal(modalId));
    });

    document.querySelectorAll('.management-modal').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        const closeControl = event.target.closest?.('[data-management-modal-close]');
        if (closeControl && modal.contains(closeControl)) {
          closeManagementModal(modal);
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      const disclaimerOpen = document.getElementById('managementDisclaimerModal')?.classList.contains('is-open');
      if (event.key === 'Escape' && !disclaimerOpen) closeOpenManagementModals();
    });
  }

  document.addEventListener('languageChanged', (event) => {
    translations = event.detail.translations || {};
    render();
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindChoices();
    bindManagementModals();
    ensureManagementDisclaimer();
    document.getElementById('managementRequestBtn')?.addEventListener('click', sendRequest);
    document.getElementById('managementPrintBtn')?.addEventListener('click', printEstimate);
    document.getElementById('managementPdfBtn')?.addEventListener('click', printEstimate);
    document.getElementById('managementMonthlyProformaBtn')?.addEventListener('click', () => createDemoProforma('monthlyProforma'));
    document.getElementById('managementOneTimeProformaBtn')?.addEventListener('click', () => createDemoProforma('oneTimeProforma'));
    render();
    loadPricing();
  });
})();
