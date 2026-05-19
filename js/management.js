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
      setText('managementBaseMonthlyRange', `${euro(result.baseMonthlyLow)} - ${euro(result.baseMonthlyHigh)}`);
      setText('managementAddOnMonthlyRange', result.monthlyAddOnsHigh ? `${euro(result.monthlyAddOnsLow)} - ${euro(result.monthlyAddOnsHigh)}` : euro(0));
      setText('managementMonthlyRange', `${euro(result.monthlyLow)} - ${euro(result.monthlyHigh)}`);
      setText('managementOneTimeRange', result.oneTimeHigh ? `${euro(result.oneTimeLow)} - ${euro(result.oneTimeHigh)}` : euro(0));
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
    if (message) message.value = buildRequestMessage();
    if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function printEstimate() {
    window.print();
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

  document.addEventListener('languageChanged', (event) => {
    translations = event.detail.translations || {};
    render();
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindChoices();
    document.getElementById('managementRequestBtn')?.addEventListener('click', sendRequest);
    document.getElementById('managementPrintBtn')?.addEventListener('click', printEstimate);
    document.getElementById('managementPdfBtn')?.addEventListener('click', printEstimate);
    render();
    loadPricing();
  });
})();
