(function () {
  const LOCAL_HOSTS = ['brkovic-local.local', '127.0.0.1', 'localhost'];
  const IS_LOCAL = LOCAL_HOSTS.includes(window.location.hostname);
  const ADMIN_BUILD = '20260519-04';
  const API_BASE = IS_LOCAL ? '/admin-api-proxy.php?path=' : '/api';
  const MANAGEMENT_API = '/management-admin-api.php';

  let isLoggedIn = false;
  let pricing = null;
  let currentServiceTab = 'oneTimeServices';
  let lengthAnchorKey = '15-20';
  let selectedContractTypeKey = 'motor';
  let selectedContractLengthKey = '15-20';
  let selectedContractCrewKey = 'none';
  let isSyncingLengthBases = false;
  let popupZIndex = 80;
  let popupDragState = null;

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

  const statusNode = document.getElementById('adminManagementStatus');
  const diagnosticsNode = document.getElementById('adminManagementDiagnostics');
  const loginForm = document.getElementById('adminManagementLoginForm');
  const saveBtn = document.getElementById('savePricingBtn');
  const saveModelBtn = document.getElementById('saveServiceModelBtn');
  const reloadBtn = document.getElementById('reloadPricingBtn');
  const contractForm = document.getElementById('contractBuilderForm');
  const printContractBtn = document.getElementById('printContractBtn');
  const servicePricingNode = document.getElementById('servicePricingFields');
  const monthlyAddOnPricingNode = document.getElementById('monthlyAddOnPricingFields');
  const managementPanel = document.querySelector('.management-admin-panel');

  const groupOrder = {
    typeData: ['motor', 'sailing', 'motorCat', 'sailingCat'],
    lengthData: ['under15', '15-20', '20-25', '25-30', '30-35', '35-40', '40plus'],
    crewData: ['none', 'skeleton', 'fullNoCaptain', 'fullCaptain'],
    monthlyServices: [...CORE_MONTHLY_KEYS, ...MONTHLY_ADDON_KEYS],
    sailingServices: [],
    oneTimeServices: ONE_TIME_KEYS,
  };

  const rangeOrder = ['monthlyLow', 'monthlyHigh', 'oneTimeLow', 'oneTimeHigh'];

  const labelFallbacks = {
    ym_type_motor: 'Моторная яхта',
    ym_type_sailing: 'Парусная яхта',
    ym_type_motor_cat: 'Моторный катамаран',
    ym_type_sailing_cat: 'Парусный катамаран',
    ym_crew_none: 'Без экипажа',
    ym_crew_skeleton: 'Минимальный экипаж',
    ym_crew_full_no_captain: 'Полный экипаж без капитана',
    ym_crew_full_captain: 'Полный экипаж с капитаном',
    ym_card_boat_title: 'Контроль яхты у причала',
    ym_card_technical_title: 'Технический контроль',
    ym_card_owner_title: 'Представление судовладельца',
    ym_monthly_battery_title: 'Оперативные работы',
    ym_monthly_machinery_title: 'Финансы',
    ym_monthly_ventilation_title: 'Административная деятельность',
    ym_monthly_rig_title: 'Контроль рангоута и палубного оборудования',
    ym_one_guest: 'Подготовка к приходу гостей',
    ym_one_deep_interior: 'Глубокая уборка интерьера',
    ym_one_detailing: 'Детейлинг экстерьера',
    ym_one_launch: 'Запуск сезона',
    ym_one_winter: 'Консервация на зиму',
    ym_one_emergency: 'Срочный визит',
    ym_one_yard: 'Верфь / ремонтный период',
    ym_one_safety_review: 'Обзор средств безопасности',
    ym_one_tender_toys: 'Подготовка тендера и водных игрушек',
    ym_one_provisioning: 'Провизия и concierge support',
  };

  const rangeLabels = {
    monthlyLow: ['Месяц: нижняя граница', 'умножает итоговую месячную сумму'],
    monthlyHigh: ['Месяц: верхняя граница', 'умножает итоговую месячную сумму'],
    oneTimeLow: ['Разово: нижняя граница', 'умножает итог разовых работ'],
    oneTimeHigh: ['Разово: верхняя граница', 'умножает итог разовых работ'],
  };

  const reductionLabels = {
    physical: 'Физическая работа',
    partial: 'Частично зависит от экипажа',
    management: 'Управленческая услуга',
    none: 'Не учитывать экипаж',
  };

  const serviceGroupLabels = {
    monthlyServices: 'Доп. месячные',
    sailingServices: 'Парусные',
    oneTimeServices: 'Разовые',
  };

  const coreBaseTitle = 'База: контроль яхты у причала + технический контроль + представление судовладельца';

  const code128Patterns = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
  ];

  function setStatus(text) {
    if (statusNode) statusNode.textContent = text || '';
  }

  function yesNo(value) {
    return value ? 'да' : 'нет';
  }

  function setDiagnostics(data, error = '') {
    if (!diagnosticsNode) return;
    if (!data && !error) {
      diagnosticsNode.hidden = true;
      diagnosticsNode.innerHTML = '';
      return;
    }

    if (error) {
      diagnosticsNode.hidden = false;
      diagnosticsNode.classList.add('has-error');
      diagnosticsNode.innerHTML = `<strong>Диагностика:</strong> ${escapeHtml(error)}`;
      return;
    }

    diagnosticsNode.classList.toggle('has-error', !data?.dataDir?.writable || !data?.pricingFile?.writable);
    diagnosticsNode.hidden = false;
    diagnosticsNode.innerHTML = `
      <strong>Диагностика админки</strong>
      <span>Режим: ${data.mode === 'local' ? 'локальный' : 'боевой'}</span>
      <span>Доступ: ${yesNo(data.authenticated)}</span>
      <span>Папка data: ${yesNo(data.dataDir?.writable)}${data.dataDir?.perms ? ` (${escapeHtml(data.dataDir.perms)})` : ''}</span>
      <span>Файл цен: ${yesNo(data.pricingFile?.writable)}${data.pricingFile?.perms ? ` (${escapeHtml(data.pricingFile.perms)})` : ''}</span>
      <span>Версия админки: ${ADMIN_BUILD}</span>
      <span>Host: ${escapeHtml(data.host || '')}</span>
    `;
  }

  function setLoggedInUI(loggedIn) {
    isLoggedIn = loggedIn;
    if (loginForm) loginForm.style.display = loggedIn ? 'none' : '';
    document.querySelector('.management-admin-panel')?.classList.toggle('is-disabled', !loggedIn);
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"]/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    }[m]));
  }

  function labelFor(item, key) {
    return item?.titleRu || item?.title || labelFallbacks[item?.label] || item?.label || key;
  }

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clampPercent(value, fallback = 0) {
    return Math.min(100, Math.max(0, toNumber(value, fallback)));
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(toNumber(value, 0));
  }

  function roundPrice(value) {
    return Math.round(toNumber(value, 0) / 10) * 10;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function compactNumber(value) {
    return String(value || '').replace(/[^0-9A-Za-z]/g, '').slice(-6).padStart(3, '0');
  }

  function makeProformaNumber() {
    const date = todayISO().replace(/-/g, '');
    const stamp = compactNumber(Date.now().toString(36));
    return `VN-PF-${date}-${stamp}`;
  }

  function invoiceDefaults() {
    return {
      companyName: 'VETUS NAUTA / BRKOVIC',
      address: '85320, Obala BB, Tivat, Porto Montenegro',
      email: 'vetus.nauta@gmail.com',
      phone: '+38268255550',
      logoUrl: 'brand/logo-vetus-nauta-night-clean.png',
      electronicBaseUrl: 'https://brkovic.ltd/docs/proforma',
      discountPercent: 0,
      vatPercent: 21,
      paymentNote: 'Все суммы указаны как нетто. НДС добавляется по ставке, указанной в профактуре.',
      ...(pricing?.invoiceDefaults || {}),
    };
  }

  function defaultLegalSections() {
    return [
      {
        title: '1. Стороны, предмет и статус документа',
        articles: [
          {
            title: '1.1. Стороны договора',
            body: 'Исполнитель: {provider}. Клиент: {client}. Договор относится к яхте {yacht}, находящейся/обслуживаемой в локации {location}, если стороны письменно не согласовали иную локацию.',
          },
          {
            title: '1.2. Предмет услуг',
            body: 'Исполнитель организует и/или выполняет услуги яхт-менеджмента, технического сопровождения, координации подрядчиков, подготовки яхты и сопутствующей операционной поддержки в пределах выбранного перечня услуг: {services}.',
          },
          {
            title: '1.3. Предварительный расчет',
            body: '{estimateClause} Настоящая профактура и договорный черновик отражают выбранную конфигурацию услуг и используются для согласования бюджета до подписания финальной редакции договора.',
          },
        ],
      },
      {
        title: '2. Период обслуживания и доступ к яхте',
        articles: [
          {
            title: '2.1. Период',
            body: 'Период обслуживания: {period}. Расчетный множитель периода: {periodMonths}. Если период изменяется, суммы договора пересчитываются автоматически по актуальной конфигурации услуг.',
          },
          {
            title: '2.2. Доступ и полномочия',
            body: 'Клиент обеспечивает Исполнителю разумный доступ на борт, к технической документации, контактам марины и подрядчиков. Исполнитель действует в пределах поручений Клиента и не принимает на себя полномочия владельца, капитана или страховщика, если это отдельно не закреплено письменно.',
          },
          {
            title: '2.3. Подрядчики и счета третьих лиц',
            body: 'Работы третьих лиц, запасные части, сборы марины, топливо, портовые, таможенные, страховые и иные обязательные платежи не входят в цену услуг Исполнителя, если прямо не включены в выбранную позицию.',
          },
        ],
      },
      {
        title: '3. Цена, НДС, дисконт и порядок оплаты',
        articles: [
          {
            title: '3.1. Стоимость услуг',
            body: 'Месячные услуги за период: {monthlyPeriodNet}. Разовые услуги: {oneTimeNet}. Нетто до дисконта: {netBeforeDiscount}. Дисконт: {discountPercent}% ({discountAmount}). База НДС после дисконта: {taxableNet}. НДС {vatPercent}%: {vatAmount}. Итого к оплате: {totalGross}.',
          },
          {
            title: '3.2. Порядок оплаты',
            body: '{paymentTerms} Если иное не согласовано письменно, услуги начинаются после подтверждения профактуры и оплаты согласованного счета.',
          },
          {
            title: '3.3. Валюта и банковские расходы',
            body: 'Все суммы указаны в EUR. Банковские комиссии, комиссии платежных систем и расходы корреспондентских банков оплачиваются Клиентом сверх суммы счета, если банк удерживает их из платежа.',
          },
        ],
      },
      {
        title: '4. Объем ответственности и исключения',
        articles: [
          {
            title: '4.1. Исключения из цены',
            body: '{exclusions}',
          },
          {
            title: '4.2. Ограничение ответственности',
            body: 'Исполнитель отвечает за разумную профессиональную организацию согласованных услуг. Исполнитель не несет ответственность за скрытые дефекты яхты, действия марины, верфи, поставщиков, экипажа, государственных органов, погодные условия, страховые решения и обстоятельства вне разумного контроля Исполнителя.',
          },
          {
            title: '4.3. Срочные расходы',
            body: 'Если для сохранности яхты требуется срочное действие, Исполнитель вправе запросить оперативное подтверждение расходов у Клиента. Без подтверждения Клиента Исполнитель не обязан финансировать третьих лиц за собственный счет.',
          },
        ],
      },
      {
        title: '5. Документы, отчетность и юридические условия',
        articles: [
          {
            title: '5.1. Отчетность',
            body: 'По согласованным позициям Исполнитель предоставляет Клиенту рабочие комментарии, фото, счета подрядчиков и/или краткие технические отчеты в разумном объеме, соответствующем выбранному пакету услуг.',
          },
          {
            title: '5.2. Электронная версия',
            body: 'Электронная версия профактуры хранится по адресу: {electronicUrl}. Штрихкод в документе предназначен для быстрой проверки электронной версии.',
          },
          {
            title: '5.3. Применимое право и споры',
            body: 'Применимое право и юрисдикция: {jurisdiction}. Стороны стремятся урегулировать спор путем переговоров до обращения в компетентный суд или согласованный арбитраж.',
          },
        ],
      },
    ];
  }

  function legalSections() {
    const sections = pricing?.contractLegalSections;
    if (!Array.isArray(sections) || !sections.length) return defaultLegalSections();
    return sections.map((section) => ({
      title: String(section?.title || '').trim(),
      articles: Array.isArray(section?.articles)
        ? section.articles.map((article) => ({
          title: String(article?.title || '').trim(),
          body: String(article?.body || '').trim(),
        })).filter((article) => article.title || article.body)
        : [],
    })).filter((section) => section.title || section.articles.length);
  }

  function currentContractDefaults() {
    const defaults = { ...(pricing?.contractDefaults || {}) };
    document.querySelectorAll('[data-contract-default]').forEach((input) => {
      defaults[input.dataset.contractDefault] = input.value.trim();
    });
    return defaults;
  }

  function currentInvoiceDefaults() {
    const defaults = invoiceDefaults();
    document.querySelectorAll('[data-invoice-default]').forEach((input) => {
      defaults[input.dataset.invoiceDefault] = input.type === 'number' ? toNumber(input.value, 0) : input.value.trim();
    });
    return defaults;
  }

  function currentLegalSections() {
    const rows = Array.from(document.querySelectorAll('#contractLegalFields [data-legal-section]')).map((section) => {
      const title = section.querySelector('[data-legal-section-title]')?.value?.trim() || '';
      const articles = Array.from(section.querySelectorAll('[data-legal-article]')).map((article) => ({
        title: article.querySelector('[data-legal-article-title]')?.value?.trim() || '',
        body: article.querySelector('[data-legal-article-body]')?.value?.trim() || '',
      })).filter((article) => article.title || article.body);
      return { title, articles };
    }).filter((section) => section.title || section.articles.length);
    return rows.length ? rows : legalSections();
  }

  function normalizeDocumentUrl(baseUrl, number) {
    const cleanBase = String(baseUrl || 'https://brkovic.ltd/docs/proforma').replace(/\/+$/, '');
    const slug = String(number || makeProformaNumber()).trim().replace(/[^0-9A-Za-z._-]+/g, '-');
    return `${cleanBase}/${slug}.pdf`;
  }

  function logoUrl(src) {
    try {
      return new URL(src || 'brand/logo-vetus-nauta-night-clean.png', window.location.href).href;
    } catch {
      return 'brand/logo-vetus-nauta-night-clean.png';
    }
  }

  function setBuilderDefaults() {
    const defaults = invoiceDefaults();
    const numberInput = document.getElementById('proformaNumber');
    const dateInput = document.getElementById('proformaDate');
    const discountInput = document.getElementById('contractDiscountPercent');
    const vatInput = document.getElementById('contractVatPercent');

    if (numberInput && !numberInput.value) numberInput.value = makeProformaNumber();
    if (dateInput && !dateInput.value) dateInput.value = todayISO();
    if (discountInput && !discountInput.value) discountInput.value = defaults.discountPercent ?? 0;
    if (vatInput && !vatInput.value) vatInput.value = defaults.vatPercent ?? 21;
  }

  function selectorValue(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function dataInput(group, key, field) {
    return document.querySelector(`[data-group="${selectorValue(group)}"][data-key="${selectorValue(key)}"][data-field="${selectorValue(field)}"]`);
  }

  function readPricingNumber(group, key, field, fallback = 0) {
    const input = dataInput(group, key, field);
    return toNumber(input?.value, pricing?.[group]?.[key]?.[field] ?? fallback);
  }

  function isCoreMonthlyKey(key) {
    return CORE_MONTHLY_KEYS.includes(key);
  }

  function isSailingContractType(typeKey = selectedContractType()) {
    return typeKey === 'sailing' || typeKey === 'sailingCat';
  }

  function serviceAvailableForType(item, typeKey = selectedContractType()) {
    if (!item || item.enabled === false) return false;
    return !item.sailingOnly || isSailingContractType(typeKey);
  }

  function monthlyAddOnEntries(typeKey = selectedContractType(), options = {}) {
    return orderedEntries('monthlyServices')
      .filter(([key]) => !isCoreMonthlyKey(key))
      .filter(([, item]) => {
        if (!options.includeDisabled && item?.enabled === false) return false;
        if (!options.includeSailingUnavailable && item?.sailingOnly && !isSailingContractType(typeKey)) return false;
        return !!item;
      });
  }

  function baseForLength(lengthKey) {
    const length = pricing?.lengthData?.[lengthKey];
    if (!length || length.individual) return null;
    return readPricingNumber('lengthData', lengthKey, 'base', length.base ?? 0);
  }

  function crewReductionFactor(service, crewKey = selectedContractCrew()) {
    const crewItem = pricing?.crewData?.[crewKey] || pricing?.crewData?.none || { factor: 1 };
    const crewFactor = toNumber(crewItem.factor, 1);
    if (service?.reduction === 'management') {
      return crewKey === 'fullCaptain' ? .85 : crewKey === 'fullNoCaptain' ? .9 : crewKey === 'skeleton' ? .95 : 1;
    }
    if (service?.reduction === 'partial') {
      return crewFactor + ((1 - crewFactor) * .45);
    }
    if (service?.reduction === 'physical') {
      return crewFactor;
    }
    return 1;
  }

  function coreBaseCrewFactor(crewKey = selectedContractCrew()) {
    const coreServices = CORE_MONTHLY_KEYS
      .map((key) => pricing?.monthlyServices?.[key])
      .filter(Boolean);
    const total = coreServices.reduce((sum, service) => sum + toNumber(service.price, 0), 0);
    if (!total) return 1;
    const adjusted = coreServices.reduce((sum, service) => (
      sum + (toNumber(service.price, 0) * crewReductionFactor(service, crewKey))
    ), 0);
    return adjusted / total;
  }

  function syncPricingFromField(input) {
    const group = input?.dataset?.group;
    const key = input?.dataset?.key;
    const field = input?.dataset?.field;
    if (!pricing || !group || !key || !field || group === 'range') return;
    pricing[group] = pricing[group] || {};
    pricing[group][key] = pricing[group][key] || {};
    if (input.type === 'checkbox') pricing[group][key][field] = input.checked;
    else if (input.type === 'number') pricing[group][key][field] = toNumber(input.value, pricing[group][key][field]);
    else pricing[group][key][field] = input.value;
  }

  function estimateMonthlyPrice(typeKey, lengthKey, crewKey = selectedContractCrew()) {
    const length = pricing?.lengthData?.[lengthKey];
    const type = pricing?.typeData?.[typeKey];
    if (!length || !type || length.individual) return null;
    const base = baseForLength(lengthKey);
    const typeFactor = readPricingNumber('typeData', typeKey, 'factor', type.factor ?? 1);
    return roundPrice(base * typeFactor * coreBaseCrewFactor(crewKey));
  }

  function estimateMonthlyAddOnUnit(item, context = oneTimeFactorContext()) {
    if (!pricing || context.isIndividual || !item) return null;
    return roundPrice(toNumber(item.price, 0) * context.typeFactor * context.lengthFactor * crewReductionFactor(item, context.crewKey));
  }

  function estimateEnabledMonthlyAddOnsTotal(context = oneTimeFactorContext()) {
    return monthlyAddOnEntries(context.typeKey).reduce((sum, [, item]) => {
      const amount = estimateMonthlyAddOnUnit(item, context);
      return sum + toNumber(amount, 0);
    }, 0);
  }

  function selectedMonthlyScopeTotal(context = oneTimeFactorContext()) {
    return selectedScopeDetails().reduce((sum, item) => {
      if (item.group !== 'monthlyServices') return sum;
      const source = pricing?.monthlyServices?.[item.key] || item;
      const amount = estimateMonthlyAddOnUnit(source, context);
      return sum + toNumber(amount, 0);
    }, 0);
  }

  function oneTimeFactorContext() {
    const typeKey = selectedContractType();
    const lengthKey = selectedContractLength();
    const crewKey = selectedContractCrew();
    const type = pricing?.typeData?.[typeKey];
    const length = pricing?.lengthData?.[lengthKey];
    const crew = pricing?.crewData?.[crewKey];
    const typeFactor = readPricingNumber('typeData', typeKey, 'factor', type?.factor ?? 1);
    const lengthFactor = readPricingNumber('lengthData', lengthKey, 'factor', length?.factor ?? 1);
    const baseCrewFactor = coreBaseCrewFactor(crewKey);
    return {
      typeKey,
      lengthKey,
      crewKey,
      typeLabel: labelFor(type, typeKey),
      lengthLabel: length?.label || lengthKey,
      crewLabel: labelFor(crew, crewKey),
      typeFactor,
      lengthFactor,
      baseCrewFactor,
      isIndividual: !!length?.individual || lengthFactor <= 0,
    };
  }

  function estimateOneTimePrice(basePrice, context = oneTimeFactorContext()) {
    if (!pricing || context.isIndividual) return null;
    return roundPrice(toNumber(basePrice, 0) * context.typeFactor * context.lengthFactor);
  }

  function selectedContractType() {
    const selectValue = document.getElementById('contractTypeSelect')?.value;
    const candidate = selectValue || selectedContractTypeKey || groupOrder.typeData[0];
    if (pricing?.typeData?.[candidate]) return candidate;
    return orderedEntries('typeData')[0]?.[0] || groupOrder.typeData[0];
  }

  function selectedContractLength() {
    const selectValue = document.getElementById('contractLengthSelect')?.value;
    const candidate = selectValue || selectedContractLengthKey || lengthAnchorKey || '15-20';
    if (pricing?.lengthData?.[candidate]) return candidate;
    return orderedEntries('lengthData')[0]?.[0] || '15-20';
  }

  function selectedContractCrew() {
    const selectValue = document.getElementById('contractCrewSelect')?.value;
    const candidate = selectValue || selectedContractCrewKey || 'none';
    if (pricing?.crewData?.[candidate]) return candidate;
    return orderedEntries('crewData')[0]?.[0] || 'none';
  }

  function contractBaseIncluded() {
    const toggle = document.getElementById('contractBaseToggle');
    return toggle ? toggle.checked : true;
  }

  function updateAutoMonthlyPrice(force = false) {
    if (!pricing) return;
    const toggle = document.getElementById('contractAutoPriceToggle');
    const monthlyInput = document.getElementById('contractMonthlyPrice');
    const note = document.getElementById('contractAutoPriceNote');
    const typeKey = selectedContractType();
    const lengthKey = selectedContractLength();
    const crewKey = selectedContractCrew();
    const price = estimateMonthlyPrice(typeKey, lengthKey, crewKey);
    const typeLabel = labelFor(pricing.typeData?.[typeKey], typeKey);
    const lengthLabel = pricing.lengthData?.[lengthKey]?.label || lengthKey;
    const crewLabel = labelFor(pricing.crewData?.[crewKey], crewKey);
    const includeBase = contractBaseIncluded();

    if (price === null) {
      if (note) note.textContent = 'Для этой длины установлен индивидуальный расчет. Введите цену вручную.';
      updateContractBuilderSummary();
      return;
    }

    if (monthlyInput && (force || toggle?.checked)) monthlyInput.value = includeBase ? price : 0;
    if (note) {
      const base = baseForLength(lengthKey) || 0;
      const typeFactor = readPricingNumber('typeData', typeKey, 'factor', 1);
      if (!includeBase) {
        note.textContent = 'База месяца выключена. Ежемесячные допы и разовые услуги останутся отдельными строками профактуры.';
      } else {
        note.textContent = `Авторасчет базы: ${lengthLabel} ${formatMoney(base)} × ${typeLabel} ${typeFactor} × экипаж ${crewLabel} ${coreBaseCrewFactor(crewKey).toFixed(2)} = ${formatMoney(price)} нетто/мес. Допы добавляются отдельными строками.`;
      }
    }
    updateContractBuilderSummary();
  }

  function updateLengthAnchorClass() {
    document.querySelectorAll('.pricing-row--length').forEach((row) => {
      row.classList.toggle('is-anchor', row.dataset.lengthKey === lengthAnchorKey);
    });
  }

  function updateLengthAutoPreview() {
    const node = document.getElementById('lengthAutoCalcPreview');
    if (!node || !pricing) return;
    const anchor = pricing.lengthData?.[lengthAnchorKey];
    const anchorLabel = anchor?.label || lengthAnchorKey;
    const typeKey = selectedContractType();
    const crewKey = selectedContractCrew();
    const typeLabel = labelFor(pricing.typeData?.[typeKey], typeKey);
    const crewLabel = labelFor(pricing.crewData?.[crewKey], crewKey);
    const rows = orderedEntries('lengthData').map(([key, item]) => {
      if (item.individual) {
        return `<span><strong>${escapeHtml(item.label || key)}</strong><small>индивидуально</small></span>`;
      }
      const price = estimateMonthlyPrice(typeKey, key, crewKey);
      return `<span><strong>${escapeHtml(item.label || key)}</strong><small>${price === null ? 'индивидуально' : formatMoney(price)}</small></span>`;
    }).join('');
    node.innerHTML = `
      <p><strong>База месяца:</strong> начальный минимум по выбранной длине. Это отдельная цифра в настройках, допы считаются отдельными строками.</p>
      <div>${rows}</div>
      <p>Превью выше показывает месячную нетто-цену для типа: ${escapeHtml(typeLabel)}, экипаж: ${escapeHtml(crewLabel)}.</p>
    `;
    updateLengthAnchorClass();
  }

  function syncLengthBases(anchorKey) {
    if (!pricing || isSyncingLengthBases) return;
    const anchorInput = dataInput('lengthData', anchorKey, 'base');
    const anchorFactorInput = dataInput('lengthData', anchorKey, 'factor');
    const anchorBase = toNumber(anchorInput?.value, pricing.lengthData?.[anchorKey]?.base ?? 0);
    const anchorFactor = toNumber(anchorFactorInput?.value, pricing.lengthData?.[anchorKey]?.factor ?? 1);
    if (!anchorInput || !anchorFactor || anchorFactor <= 0) return;

    lengthAnchorKey = anchorKey;
    const unitBase = anchorBase / anchorFactor;
    isSyncingLengthBases = true;
    orderedEntries('lengthData').forEach(([key, item]) => {
      const baseInput = dataInput('lengthData', key, 'base');
      const factorInput = dataInput('lengthData', key, 'factor');
      const factor = toNumber(factorInput?.value, item.factor ?? 1);
      if (pricing.lengthData?.[key]) pricing.lengthData[key].factor = factor;
      if (!baseInput || item.individual || factor <= 0) return;
      const nextBase = key === anchorKey ? anchorBase : roundPrice(unitBase * factor);
      baseInput.value = nextBase;
      if (pricing.lengthData?.[key]) pricing.lengthData[key].base = nextBase;
    });
    isSyncingLengthBases = false;
    updateLengthAutoPreview();
    updateAutoMonthlyPrice(true);
    updateAutoOneTimePrice(true);
  }

  function orderedEntries(groupKey) {
    const group = pricing?.[groupKey] || {};
    const seen = new Set();
    const entries = [];

    (groupOrder[groupKey] || []).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(group, key)) {
        entries.push([key, group[key], index]);
        seen.add(key);
      }
    });

    Object.entries(group).forEach(([key, item]) => {
      if (!seen.has(key)) entries.push([key, item, Number.MAX_SAFE_INTEGER]);
    });

    return entries
      .sort((a, b) => {
        const orderA = Number.isFinite(Number(a[1]?.order)) ? Number(a[1].order) : a[2];
        const orderB = Number.isFinite(Number(b[1]?.order)) ? Number(b[1].order) : b[2];
        return orderA - orderB;
      })
      .map(([key, item]) => [key, item]);
  }

  function makeServiceKey(group) {
    const prefix = group === 'monthlyServices' ? 'monthlyCustom' : 'oneTimeCustom';
    let key = `${prefix}${Date.now().toString(36)}`;
    let index = 1;
    while (pricing?.[group]?.[key]) {
      key = `${prefix}${Date.now().toString(36)}${index}`;
      index += 1;
    }
    return key;
  }

  function nextServiceOrder(group) {
    const entries = orderedEntries(group);
    const max = entries.reduce((value, [, item], index) => {
      const order = Number.isFinite(Number(item?.order)) ? Number(item.order) : ((index + 1) * 10);
      return Math.max(value, order);
    }, 0);
    return max + 10;
  }

  function addService(group, openAfterAdd = '') {
    if (!pricing || !['monthlyServices', 'oneTimeServices'].includes(group)) return;
    pricing = collectPricing();
    const key = makeServiceKey(group);
    const isMonthly = group === 'monthlyServices';
    pricing[group] = pricing[group] || {};
    pricing[group][key] = {
      titleRu: isMonthly ? 'Новая месячная услуга' : 'Новая разовая услуга',
      titleEn: isMonthly ? 'New monthly service' : 'New one-time service',
      descriptionRu: '',
      descriptionEn: '',
      price: 0,
      reduction: isMonthly ? 'partial' : 'none',
      enabled: true,
      sailingOnly: false,
      publicVisible: true,
      adminOnly: false,
      allowQuantity: !isMonthly,
      quantityDefault: 1,
      order: nextServiceOrder(group),
    };
    renderAll();
    if (openAfterAdd || isMonthly) openPricingPopup(openAfterAdd || 'monthlyAddOnPricingPopup');
    setStatus(`${isMonthly ? 'Месячная' : 'Разовая'} услуга добавлена. Заполните название, описание и цену, затем сохраните модель.`);
  }

  function removeService(group, key) {
    if (!pricing || !pricing[group]?.[key]) return;
    if (group === 'monthlyServices' && isCoreMonthlyKey(key)) {
      setStatus('Базовые услуги месяца не удаляются: они входят в одну строку базы.');
      return;
    }
    const title = labelFor(pricing[group][key], key);
    if (!window.confirm(`Удалить услугу "${title}" из модели? После этого нажмите "Сохранить", чтобы зафиксировать удаление.`)) {
      return;
    }
    pricing = collectPricing();
    delete pricing[group][key];
    renderAll();
    if (group === 'monthlyServices') openPricingPopup('monthlyAddOnPricingPopup');
    setStatus(`Услуга "${title}" удалена из текущей модели. Нажмите "Сохранить", чтобы записать изменения в JSON.`);
  }

  function rowTitle(key, title, hint = '') {
    return `
      <div class="pricing-field pricing-field--name">
        <span>Позиция</span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(hint || `код: ${key}`)}</small>
      </div>
    `;
  }

  function fieldMarkup(group, key, field, label, value, options = {}) {
    const type = options.type || 'number';
    const step = options.step || '0.01';
    const min = options.min ?? '0';
    const numberAttrs = type === 'number' ? ` step="${escapeHtml(step)}" min="${escapeHtml(min)}" inputmode="decimal"` : '';
    const readonlyAttr = options.readonly ? ' readonly' : '';

    return `
      <label class="pricing-field">
        <span>${escapeHtml(label)}</span>
        <input type="${escapeHtml(type)}" data-group="${escapeHtml(group)}" data-key="${escapeHtml(key)}" data-field="${escapeHtml(field)}" value="${escapeHtml(value)}"${numberAttrs}${readonlyAttr} />
      </label>
    `;
  }

  function textareaMarkup(group, key, field, label, value, rows = 2) {
    return `
      <label class="pricing-field pricing-field--wide">
        <span>${escapeHtml(label)}</span>
        <textarea data-group="${escapeHtml(group)}" data-key="${escapeHtml(key)}" data-field="${escapeHtml(field)}" rows="${escapeHtml(rows)}">${escapeHtml(value ?? '')}</textarea>
      </label>
    `;
  }

  function visibilityMarkup(group, key, item) {
    return `
      <label class="pricing-field pricing-field--toggle">
        <span>Публично</span>
        <input type="checkbox" data-group="${escapeHtml(group)}" data-key="${escapeHtml(key)}" data-field="publicVisible" ${item.publicVisible === false || item.adminOnly === true ? '' : 'checked'} />
        <strong>${item.publicVisible === false || item.adminOnly === true ? 'скрыто' : 'видно'}</strong>
      </label>
    `;
  }

  function deleteServiceMarkup(group, key) {
    if (group === 'monthlyServices' && isCoreMonthlyKey(key)) return '';
    return `
      <div class="pricing-field pricing-field--actions">
        <span>Действия</span>
        <button class="btn btn--danger" type="button" data-remove-service="${escapeHtml(group)}" data-service-key="${escapeHtml(key)}">Удалить</button>
      </div>
    `;
  }

  function serviceTextFields(group, key, item) {
    return `
      ${fieldMarkup(group, key, 'titleRu', 'Название RU', item.titleRu || item.title || labelFor(item, key), { type: 'text' })}
      ${fieldMarkup(group, key, 'titleEn', 'Название EN', item.titleEn || '', { type: 'text' })}
      ${textareaMarkup(group, key, 'descriptionRu', 'Описание RU', item.descriptionRu || item.descriptionText || '', 2)}
      ${textareaMarkup(group, key, 'descriptionEn', 'Описание EN', item.descriptionEn || '', 2)}
      ${fieldMarkup(group, key, 'order', 'Порядок', item.order ?? 100, { step: '1' })}
    `;
  }

  function renderTypeFields() {
    const node = document.getElementById('typePricingFields');
    if (!node) return;
    node.innerHTML = orderedEntries('typeData').map(([key, item]) => `
      <div class="pricing-row pricing-row--type">
        ${rowTitle(key, labelFor(item, key), `коэффициент типа: ${key}`)}
        ${fieldMarkup('typeData', key, 'factor', 'Коэффициент', item.factor ?? 1)}
      </div>
    `).join('');
  }

  function renderLengthFields() {
    const node = document.getElementById('lengthPricingFields');
    if (!node) return;
    node.innerHTML = `<div class="length-core-note"><strong>База месяца</strong><span>Начальный минимум по длине. Меняйте цифру базы или коэффициент длины: остальные диапазоны выравниваются по коэффициентам.</span></div>${orderedEntries('lengthData').map(([key, item]) => `
      <div class="pricing-row pricing-row--length" data-length-key="${escapeHtml(key)}">
        ${rowTitle(key, item.label || key, item.individual ? 'индивидуальный расчет, база не выводится' : `диапазон длины: ${key}`)}
        ${fieldMarkup('lengthData', key, 'base', 'База, EUR', item.base ?? 0, { step: '10' })}
        ${fieldMarkup('lengthData', key, 'factor', 'Коэффициент длины', item.factor ?? 1)}
      </div>
    `).join('')}<div class="length-auto-calc" id="lengthAutoCalcPreview"></div>`;
  }

  function renderCrewFields() {
    const node = document.getElementById('crewPricingFields');
    if (!node) return;
    node.innerHTML = orderedEntries('crewData').map(([key, item]) => `
      <div class="pricing-row pricing-row--crew">
        ${rowTitle(key, labelFor(item, key), 'снижает долю физической работы')}
        ${fieldMarkup('crewData', key, 'factor', 'Коэффициент экипажа', item.factor ?? 1)}
      </div>
    `).join('');
  }

  function renderRangeFields() {
    const node = document.getElementById('rangePricingFields');
    if (!node) return;
    node.innerHTML = rangeOrder.map((key) => {
      const [title, hint] = rangeLabels[key] || [key, ''];
      return `
        <div class="pricing-row pricing-row--range">
          ${rowTitle(key, title, hint)}
          ${fieldMarkup('range', 'range', key, 'Коэффициент диапазона', pricing.range?.[key] ?? 1)}
        </div>
      `;
    }).join('');
  }

  function reductionMarkup(group, key, item) {
    if (group !== 'monthlyServices') {
      return `
        <div class="pricing-field pricing-field--readonly">
          <span>Учет экипажа</span>
          <strong>не применяется</strong>
        </div>
      `;
    }

    return `
      <label class="pricing-field">
        <span>Учет экипажа</span>
        <select data-group="${escapeHtml(group)}" data-key="${escapeHtml(key)}" data-field="reduction">
          ${Object.entries(reductionLabels).map(([value, label]) => `<option value="${value}" ${item.reduction === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
        </select>
      </label>
    `;
  }

  function sailingOnlyMarkup(group, key, item) {
    return `
      <label class="pricing-field pricing-field--toggle">
        <span>Только парусные</span>
        <input type="checkbox" data-group="${escapeHtml(group)}" data-key="${escapeHtml(key)}" data-field="sailingOnly" ${item.sailingOnly ? 'checked' : ''} />
        <strong>${item.sailingOnly ? 'да' : 'нет'}</strong>
      </label>
    `;
  }

  function renderMonthlyAddOnPricingFields() {
    const node = document.getElementById('monthlyAddOnPricingFields');
    if (!node) return;
    const entries = monthlyAddOnEntries(selectedContractType(), { includeDisabled: true, includeSailingUnavailable: true });
    node.innerHTML = `<div class="length-core-note"><strong>Дополнительные месячные</strong><span>Базовые контроль яхты у причала, технический контроль и представление судовладельца здесь не редактируются. Ниже только допы поверх базы; цены сейчас могут быть нулевыми, коэффициенты остаются рабочими.</span></div>${entries.map(([key, item]) => `
      <div class="pricing-row pricing-row--service pricing-row--monthly-addon">
        ${rowTitle(key, labelFor(item, key), item.sailingOnly ? 'показывается только для парусных яхт' : 'доп. месячная услуга')}
        ${serviceTextFields('monthlyServices', key, item)}
        ${fieldMarkup('monthlyServices', key, 'price', 'Цена, EUR', item.price ?? 0, { step: '10' })}
        ${reductionMarkup('monthlyServices', key, item)}
        ${sailingOnlyMarkup('monthlyServices', key, item)}
        ${visibilityMarkup('monthlyServices', key, item)}
        <label class="pricing-field pricing-field--toggle">
          <span>Статус</span>
          <input type="checkbox" data-group="monthlyServices" data-key="${escapeHtml(key)}" data-field="enabled" ${item.enabled !== false ? 'checked' : ''} />
          <strong>включено</strong>
        </label>
        ${deleteServiceMarkup('monthlyServices', key)}
      </div>
    `).join('')}`;
  }

  function renderServiceFields() {
    const node = document.getElementById('servicePricingFields');
    if (!node) return;
    const entries = orderedEntries(currentServiceTab).filter(([key]) => !(currentServiceTab === 'monthlyServices' && isCoreMonthlyKey(key)));
    const baseNote = currentServiceTab === 'monthlyServices'
      ? `<div class="length-core-note"><strong>Начальная база</strong><span>${escapeHtml(coreBaseTitle)} задается в карточке «Длина» как база месяца. Ниже — только допы поверх базы.</span></div>`
      : '';
    node.innerHTML = `${baseNote}${entries.map(([key, item]) => {
      return `
      <div class="pricing-row pricing-row--service">
        ${rowTitle(key, labelFor(item, key), `${serviceGroupLabels[currentServiceTab]} услуги`)}
        ${serviceTextFields(currentServiceTab, key, item)}
        ${fieldMarkup(currentServiceTab, key, 'price', 'Цена, EUR', item.price ?? 0, { step: '10' })}
        ${reductionMarkup(currentServiceTab, key, item)}
        ${sailingOnlyMarkup(currentServiceTab, key, item)}
        ${visibilityMarkup(currentServiceTab, key, item)}
        ${currentServiceTab === 'oneTimeServices' ? fieldMarkup(currentServiceTab, key, 'quantityDefault', 'Кол-во по умолчанию', item.quantityDefault ?? 1, { step: '1', min: '1' }) : ''}
        <label class="pricing-field pricing-field--toggle">
          <span>Статус</span>
          <input type="checkbox" data-group="${escapeHtml(currentServiceTab)}" data-key="${escapeHtml(key)}" data-field="enabled" ${item.enabled !== false ? 'checked' : ''} />
          <strong>включено</strong>
        </label>
        ${deleteServiceMarkup(currentServiceTab, key)}
      </div>
    `;
    }).join('')}`;
  }

  function renderContractDefaults() {
    const node = document.getElementById('contractDefaultFields');
    if (!node) return;
    const defaults = pricing.contractDefaults || {};
    const fields = [
      ['provider', 'Исполнитель'],
      ['jurisdiction', 'Юрисдикция'],
      ['paymentTerms', 'Условия оплаты'],
      ['estimateClause', 'Оговорка о предварительном расчете'],
      ['exclusions', 'Что не входит в стоимость'],
    ];
    node.innerHTML = fields.map(([key, label]) => `
      <label class="contract-default-field">
        <span>${escapeHtml(label)}</span>
        <textarea data-contract-default="${escapeHtml(key)}" rows="${key === 'provider' || key === 'jurisdiction' ? 1 : 3}">${escapeHtml(defaults[key] || '')}</textarea>
      </label>
    `).join('');
  }

  function invoiceFieldMarkup(key, label, value, options = {}) {
    const type = options.type || 'text';
    const rows = options.rows || 1;
    if (type === 'textarea') {
      return `
        <label class="contract-default-field">
          <span>${escapeHtml(label)}</span>
        <textarea data-invoice-default="${escapeHtml(key)}" rows="${escapeHtml(rows)}">${escapeHtml(value ?? '')}</textarea>
        </label>
      `;
    }

    return `
      <label class="contract-default-field">
        <span>${escapeHtml(label)}</span>
        <input type="${escapeHtml(type)}" data-invoice-default="${escapeHtml(key)}" value="${escapeHtml(value ?? '')}" ${type === 'number' ? 'min="0" max="100" step="0.1"' : ''} />
      </label>
    `;
  }

  function renderInvoiceDefaults() {
    const node = document.getElementById('invoiceDefaultFields');
    if (!node) return;
    const defaults = invoiceDefaults();
    node.innerHTML = [
      invoiceFieldMarkup('companyName', 'Название компании', defaults.companyName),
      invoiceFieldMarkup('address', 'Адрес', defaults.address),
      invoiceFieldMarkup('email', 'Email', defaults.email, { type: 'email' }),
      invoiceFieldMarkup('phone', 'Телефон', defaults.phone),
      invoiceFieldMarkup('logoUrl', 'Лого для PDF', defaults.logoUrl),
      invoiceFieldMarkup('electronicBaseUrl', 'Папка электронных профактур', defaults.electronicBaseUrl),
      invoiceFieldMarkup('discountPercent', 'Дисконт по умолчанию, %', defaults.discountPercent, { type: 'number' }),
      invoiceFieldMarkup('vatPercent', 'НДС по умолчанию, %', defaults.vatPercent, { type: 'number' }),
      invoiceFieldMarkup('paymentNote', 'Примечание к оплате', defaults.paymentNote, { type: 'textarea', rows: 3 }),
    ].join('');
  }

  function renderContractLegalSections() {
    const node = document.getElementById('contractLegalFields');
    if (!node) return;
    node.innerHTML = `${legalSections().map((section, sectionIndex) => `
      <article class="contract-legal-section" data-legal-section="${sectionIndex}">
        <label class="contract-legal-section-title">
          <span>Раздел</span>
          <input type="text" data-legal-section-title value="${escapeHtml(section.title)}" />
        </label>
        <div class="contract-legal-articles">
          ${(section.articles || []).map((article, articleIndex) => `
            <label class="contract-legal-article" data-legal-article="${articleIndex}">
              <span>Статья</span>
              <input type="text" data-legal-article-title value="${escapeHtml(article.title)}" />
              <span>Текст статьи</span>
              <textarea data-legal-article-body rows="5">${escapeHtml(article.body)}</textarea>
            </label>
          `).join('')}
        </div>
      </article>
    `).join('')}
    <p class="contract-legal-hint">Доступные подстановки: {client}, {yacht}, {period}, {services}, {monthlyPeriodNet}, {oneTimeNet}, {netBeforeDiscount}, {taxableNet}, {vatAmount}, {totalGross}, {electronicUrl}.</p>`;
  }

  function renderContractScope() {
    const node = document.getElementById('contractScopeFields');
    if (!node) return;
    const items = [];
    monthlyAddOnEntries().forEach(([key, item]) => {
      const groupLabel = 'Доп. месячные';
      const title = `${groupLabel}: ${labelFor(item, key)}`;
      items.push(`
        <label class="contract-scope-item">
          <input type="checkbox" value="${escapeHtml(title)}" data-scope-group="monthlyServices" data-scope-key="${escapeHtml(key)}" data-scope-title="${escapeHtml(labelFor(item, key))}" data-scope-category="${escapeHtml(groupLabel)}" data-scope-price="${escapeHtml(item.price ?? 0)}" checked />
          <span>${escapeHtml(title)}</span>
        </label>
      `);
    });
    node.innerHTML = items.length ? items.join('') : '<p class="contract-empty-note">Дополнительные месячные услуги не активны для выбранного типа яхты.</p>';
  }

  function renderContractOneTimeFields() {
    const node = document.getElementById('contractOneTimeFields');
    if (!node) return;
    const rows = orderedEntries('oneTimeServices')
      .filter(([, item]) => item.enabled !== false)
      .map(([key, item]) => `
        <article class="contract-one-time-item" data-one-time-key="${escapeHtml(key)}">
          <label class="contract-one-time-check">
            <input type="checkbox" data-one-time-enabled />
            <span data-one-time-title>${escapeHtml(labelFor(item, key))}</span>
          </label>
          <label>
            <span>База, EUR</span>
            <input type="number" min="0" step="10" data-one-time-price value="${escapeHtml(item.price ?? 0)}" />
          </label>
          <label>
            <span>Кол-во</span>
            <input type="number" min="1" step="1" data-one-time-quantity value="${escapeHtml(item.quantityDefault ?? 1)}" />
          </label>
          <div class="contract-one-time-result" data-one-time-result>
            <span>Итог с коэффициентами</span>
            <strong>—</strong>
            <small>Выберите тип и длину</small>
          </div>
          <label class="contract-one-time-note">
            <span>Комментарий</span>
            <input type="text" data-one-time-note placeholder="детали для профактуры" />
          </label>
        </article>
      `);
    node.innerHTML = rows.length ? rows.join('') : '<p class="contract-empty-note">Разовые сервисы пока отключены в прайсе.</p>';
  }

  function renderContractSelectors() {
    const typeSelect = document.getElementById('contractTypeSelect');
    const lengthSelect = document.getElementById('contractLengthSelect');
    const crewSelect = document.getElementById('contractCrewSelect');
    if (!typeSelect || !lengthSelect || !crewSelect || !pricing) return;

    const previousType = selectedContractTypeKey || typeSelect.value || 'motor';
    const previousLength = selectedContractLengthKey || lengthSelect.value || lengthAnchorKey || '15-20';
    const previousCrew = selectedContractCrewKey || crewSelect.value || 'none';
    typeSelect.innerHTML = orderedEntries('typeData').map(([key, item]) => `
      <option value="${escapeHtml(key)}">${escapeHtml(labelFor(item, key))}</option>
    `).join('');
    lengthSelect.innerHTML = orderedEntries('lengthData').map(([key, item]) => `
      <option value="${escapeHtml(key)}">${escapeHtml(item.label || key)}${item.individual ? ' - индивидуально' : ''}</option>
    `).join('');
    crewSelect.innerHTML = orderedEntries('crewData').map(([key, item]) => `
      <option value="${escapeHtml(key)}">${escapeHtml(labelFor(item, key))}</option>
    `).join('');

    selectedContractTypeKey = pricing.typeData?.[previousType] ? previousType : (pricing.typeData?.motor ? 'motor' : orderedEntries('typeData')[0]?.[0]);
    selectedContractLengthKey = pricing.lengthData?.[previousLength] ? previousLength : (pricing.lengthData?.['15-20'] ? '15-20' : orderedEntries('lengthData')[0]?.[0]);
    selectedContractCrewKey = pricing.crewData?.[previousCrew] ? previousCrew : (pricing.crewData?.none ? 'none' : orderedEntries('crewData')[0]?.[0]);
    typeSelect.value = selectedContractTypeKey || '';
    lengthSelect.value = selectedContractLengthKey || '';
    crewSelect.value = selectedContractCrewKey || '';
  }

  function renderAll() {
    renderTypeFields();
    renderLengthFields();
    renderCrewFields();
    renderRangeFields();
    renderMonthlyAddOnPricingFields();
    renderServiceFields();
    renderContractDefaults();
    renderInvoiceDefaults();
    renderContractLegalSections();
    renderContractSelectors();
    renderContractScope();
    renderContractOneTimeFields();
    setBuilderDefaults();
    updateLengthAutoPreview();
    updateAutoMonthlyPrice();
    updateAutoOneTimePrice();
    updatePricingPopupSummaries();
    updateContractBuilderSummary();
  }

	  function collectPricing() {
	    const next = JSON.parse(JSON.stringify(pricing));
	    document.querySelectorAll('[data-group][data-key][data-field]').forEach((input) => {
      const group = input.dataset.group;
      const key = input.dataset.key;
      const field = input.dataset.field;
      if (!group || !key || !field) return;
      if (group === 'range') {
        next.range = next.range || {};
        next.range[field] = toNumber(input.value, next.range[field]);
        return;
      }
      next[group] = next[group] || {};
      next[group][key] = next[group][key] || {};
      if (input.type === 'checkbox') next[group][key][field] = input.checked;
	      else if (input.type === 'number') next[group][key][field] = toNumber(input.value, next[group][key][field]);
	      else next[group][key][field] = input.value;
	    });

	    document.querySelectorAll('#contractOneTimeFields [data-one-time-key]').forEach((row) => {
	      const key = row.dataset.oneTimeKey;
	      if (!key || !next.oneTimeServices?.[key]) return;
	      const priceInput = row.querySelector('[data-one-time-price]');
	      if (priceInput) {
	        next.oneTimeServices[key].price = toNumber(priceInput.value, next.oneTimeServices[key].price || 0);
	      }
	    });
	
	    document.querySelectorAll('[data-contract-default]').forEach((input) => {
      const key = input.dataset.contractDefault;
      next.contractDefaults = next.contractDefaults || {};
      next.contractDefaults[key] = input.value.trim();
    });

    document.querySelectorAll('[data-invoice-default]').forEach((input) => {
      const key = input.dataset.invoiceDefault;
      next.invoiceDefaults = next.invoiceDefaults || {};
      next.invoiceDefaults[key] = input.type === 'number' ? toNumber(input.value, 0) : input.value.trim();
    });

    const legalRows = Array.from(document.querySelectorAll('#contractLegalFields [data-legal-section]')).map((section) => {
      const title = section.querySelector('[data-legal-section-title]')?.value?.trim() || '';
      const articles = Array.from(section.querySelectorAll('[data-legal-article]')).map((article) => ({
        title: article.querySelector('[data-legal-article-title]')?.value?.trim() || '',
        body: article.querySelector('[data-legal-article-body]')?.value?.trim() || '',
      })).filter((article) => article.title || article.body);
      return { title, articles };
    }).filter((section) => section.title || section.articles.length);
    next.contractLegalSections = legalRows.length ? legalRows : defaultLegalSections();

    return next;
  }

  async function authApi(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Ошибка авторизации');
    return data?.data?.data || data?.data || data;
  }

  async function managementApi(options = {}) {
    const query = options.query ? `?${options.query}` : '';
    const { query: _query, ...fetchOptions } = options;
    const res = await fetch(`${MANAGEMENT_API}${query}`, {
      credentials: 'same-origin',
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error?.message || 'Ошибка API менеджмента');
    }
    return data?.data || data;
  }

  async function loadDiagnostics() {
    try {
      const data = await managementApi({ method: 'GET', query: 'diagnostics=1' });
      setDiagnostics(data);
      return data;
    } catch (error) {
      setDiagnostics(null, error.message || 'не удалось получить состояние прав');
      return null;
    }
  }

  async function login(email, password) {
    return authApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async function checkSession() {
    try {
      const data = await authApi('/auth/me', { method: 'GET' });
      return !!data?.authenticated;
    } catch {
      return false;
    }
  }

  async function loadPricing() {
    setStatus('Загружаю настройки менеджмента...');
    pricing = await managementApi({ method: 'GET' });
    renderAll();
    await loadDiagnostics();
    setStatus(`Настройки загружены. Последнее обновление: ${pricing.updatedAt || 'нет данных'}.`);
  }

  async function savePricing() {
    if (!isLoggedIn) {
      setStatus('Сначала войдите в админку или откройте локальную версию через 127.0.0.1.');
      return;
    }
    if (!pricing) {
      setStatus('Настройки еще не загружены. Нажмите «Перезагрузить» и попробуйте снова.');
      return;
    }
    const next = collectPricing();
    await loadDiagnostics();
    setStatus('Сохраняю формулу и шаблон договора...');
    pricing = await managementApi({
      method: 'PUT',
      body: JSON.stringify(next),
    });
    renderAll();
    setStatus('Сохранено. Публичный калькулятор уже читает обновленные данные.');
  }

  function selectedScopeDetails() {
    return Array.from(document.querySelectorAll('#contractScopeFields input:checked')).map((input) => ({
      group: input.dataset.scopeGroup || '',
      key: input.dataset.scopeKey || '',
      category: input.dataset.scopeCategory || '',
      title: input.dataset.scopeTitle || input.value,
      price: toNumber(input.dataset.scopePrice, 0),
    }));
  }

  function selectedOneTimeDetails() {
    const context = oneTimeFactorContext();
    return Array.from(document.querySelectorAll('#contractOneTimeFields .contract-one-time-item')).map((row) => {
      const enabled = row.querySelector('[data-one-time-enabled]')?.checked;
      if (!enabled) return null;
      const title = row.querySelector('[data-one-time-title]')?.textContent?.trim() || '';
      const basePrice = toNumber(row.querySelector('[data-one-time-price]')?.value, 0);
      const quantity = Math.max(1, Math.round(toNumber(row.querySelector('[data-one-time-quantity]')?.value, 1)));
      const unitPrice = estimateOneTimePrice(basePrice, context);
      const price = unitPrice === null ? null : unitPrice * quantity;
      const note = row.querySelector('[data-one-time-note]')?.value?.trim() || '';
      return {
        group: 'oneTimeServices',
        key: row.dataset.oneTimeKey || '',
        category: 'Разовые',
        title,
        basePrice,
        quantity,
        unitPrice: unitPrice === null ? basePrice : unitPrice,
        price: price === null ? basePrice : price,
        factorText: price === null
          ? `ручная цена: ${context.lengthLabel}`
          : `база ${formatMoney(basePrice)} × тип ${context.typeFactor} × длина ${context.lengthFactor} × ${quantity}`,
        note,
      };
    }).filter(Boolean);
  }

  function refreshOneTimeLinePreviews() {
    if (!pricing) return;
    const context = oneTimeFactorContext();
    document.querySelectorAll('#contractOneTimeFields .contract-one-time-item').forEach((row) => {
      const basePrice = toNumber(row.querySelector('[data-one-time-price]')?.value, 0);
      const quantity = Math.max(1, Math.round(toNumber(row.querySelector('[data-one-time-quantity]')?.value, 1)));
      const unitAmount = estimateOneTimePrice(basePrice, context);
      const amount = unitAmount === null ? null : unitAmount * quantity;
      const result = row.querySelector('[data-one-time-result]');
      if (!result) return;
      if (amount === null) {
        result.innerHTML = `
          <span>Итог с коэффициентами</span>
          <strong>Индивидуально</strong>
          <small>${escapeHtml(context.lengthLabel)} требует ручной цены</small>
        `;
        return;
      }
      result.innerHTML = `
        <span>Итог с коэффициентами</span>
        <strong>${formatMoney(amount)}</strong>
        <small>${escapeHtml(context.typeLabel)} ${context.typeFactor} × ${escapeHtml(context.lengthLabel)} ${context.lengthFactor} × ${quantity}</small>
      `;
    });
  }

  function updateAutoOneTimePrice(force = false) {
    const toggle = document.getElementById('contractAutoOneTimeToggle');
    const input = document.getElementById('contractOneTimePrice');
    if (!input) return;
    refreshOneTimeLinePreviews();
    if ((toggle && !toggle.checked) || (!force && document.activeElement === input)) {
      updatePricingPopupSummaries();
      updateContractBuilderSummary();
      return;
    }
    const total = selectedOneTimeDetails().reduce((sum, item) => sum + toNumber(item.price, 0), 0);
    const rounded = Math.round(total * 100) / 100;
    input.value = Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2));
    updatePricingPopupSummaries();
    updateContractBuilderSummary();
  }

  function updatePricingPopupSummaries() {
    if (!pricing) return;
    const typeNode = document.getElementById('typePricingSummary');
    const lengthNode = document.getElementById('lengthPricingSummary');
    const monthlyAddOnNode = document.getElementById('monthlyAddOnPricingSummary');
    const monthlyTotalNode = document.getElementById('monthlyTotalSummary');
    const oneTimeNode = document.getElementById('contractOneTimeSummary');
    const typeKey = selectedContractType();
    const lengthKey = selectedContractLength();
    const crewKey = selectedContractCrew();
    const type = pricing.typeData?.[typeKey];
    const length = pricing.lengthData?.[lengthKey];
    const crew = pricing.crewData?.[crewKey];
    const typeCount = orderedEntries('typeData').length;
    const lengthCount = orderedEntries('lengthData').length;
    const context = oneTimeFactorContext();
    const selectedOneTime = selectedOneTimeDetails();
    const oneTimeTotal = selectedOneTime.reduce((sum, item) => sum + toNumber(item.price, 0), 0);
    const baseMonthly = estimateMonthlyPrice(typeKey, lengthKey, crewKey);
    const enabledMonthlyAddOns = monthlyAddOnEntries(typeKey);
    const monthlyAddOnsTotal = estimateEnabledMonthlyAddOnsTotal(context);

    if (typeNode) {
      typeNode.innerHTML = `${typeCount} позиции. Текущий расчет: <strong>${escapeHtml(labelFor(type, typeKey))}</strong> × ${escapeHtml(context.typeFactor)}.`;
    }
    if (lengthNode) {
      const base = baseForLength(lengthKey);
      lengthNode.innerHTML = `${lengthCount} диапазонов. Сейчас: <strong>${escapeHtml(length?.label || lengthKey)}</strong>, база ${base === null ? 'индивидуально' : formatMoney(base)}, коэффициент ${escapeHtml(context.lengthFactor)}, экипаж <strong>${escapeHtml(labelFor(crew, crewKey))}</strong>${baseMonthly === null ? ', индивидуально.' : `, минимум ${formatMoney(baseMonthly)}.`}`;
    }
    if (monthlyAddOnNode) {
      monthlyAddOnNode.innerHTML = enabledMonthlyAddOns.length
        ? `Активно: <strong>${enabledMonthlyAddOns.length}</strong>. Все цены допов сейчас: <strong>${formatMoney(monthlyAddOnsTotal)}</strong> нетто/мес. Формула: цена × тип ${escapeHtml(context.typeFactor)} × длина ${escapeHtml(context.lengthFactor)} × экипаж.`
        : 'Дополнительные месячные услуги не активны для выбранного типа яхты.';
    }
    if (monthlyTotalNode) {
      const total = toNumber(baseMonthly, 0) + monthlyAddOnsTotal;
      monthlyTotalNode.innerHTML = `База: <strong>${baseMonthly === null ? 'индивидуально' : formatMoney(baseMonthly)}</strong>. Доп. месячные: <strong>${formatMoney(monthlyAddOnsTotal)}</strong>. Итого при включенных допах: <strong>${formatMoney(total)}</strong> нетто/мес.`;
    }
    if (oneTimeNode) {
      oneTimeNode.innerHTML = selectedOneTime.length
        ? `Выбрано: <strong>${selectedOneTime.length}</strong>. Итог разовых услуг: <strong>${formatMoney(oneTimeTotal)}</strong>. Формула: база × тип ${escapeHtml(context.typeFactor)} × длина ${escapeHtml(context.lengthFactor)}.`
        : `Разовые услуги не выбраны. Формула для позиций: база × тип ${escapeHtml(context.typeFactor)} × длина ${escapeHtml(context.lengthFactor)}.`;
    }
  }

  function updateContractBuilderSummary() {
    if (!pricing) return;
    const node = document.getElementById('contractBuilderSummary');
    if (!node) return;
    const typeKey = selectedContractType();
    const lengthKey = selectedContractLength();
    const crewKey = selectedContractCrew();
    const type = pricing.typeData?.[typeKey];
    const length = pricing.lengthData?.[lengthKey];
    const crew = pricing.crewData?.[crewKey];
    const monthly = contractBaseIncluded()
      ? toNumber(document.getElementById('contractMonthlyPrice')?.value, estimateMonthlyPrice(typeKey, lengthKey, crewKey) || 0)
      : 0;
    const context = oneTimeFactorContext();
    const selectedAddOns = selectedMonthlyScopeTotal(context);
    const monthlyTotal = monthly + selectedAddOns;
    const oneTime = toNumber(document.getElementById('contractOneTimePrice')?.value, 0);
    const periodStart = document.getElementById('contractStart')?.value || 'дата начала';
    const periodEnd = document.getElementById('contractEnd')?.value || 'дата окончания';
    const baseText = contractBaseIncluded() ? 'база включена' : 'база выключена';
    node.innerHTML = `Выбрано: <strong>${escapeHtml(labelFor(type, typeKey))}</strong>, <strong>${escapeHtml(length?.label || lengthKey)}</strong>, экипаж: <strong>${escapeHtml(labelFor(crew, crewKey))}</strong>. База: <strong>${formatMoney(monthly)}</strong> (${baseText}), допы: <strong>${formatMoney(selectedAddOns)}</strong>, месяц итого: <strong>${formatMoney(monthlyTotal)}</strong>, разово: <strong>${formatMoney(oneTime)}</strong>. Период: ${escapeHtml(periodStart)} - ${escapeHtml(periodEnd)}.`;
  }

  function setContractBuilderOpen(isOpen) {
    const shell = document.getElementById('contractBuilderShell');
    const button = document.getElementById('toggleContractBuilderBtn');
    if (!shell || !button) return;
    shell.hidden = !isOpen;
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    button.textContent = isOpen ? 'Скрыть договор' : 'Открыть договор';
    updateContractBuilderSummary();
  }

  function scopeList(items) {
    if (!items.length) return '<span class="proforma-muted">Не выбрано</span>';
    return `<ul>${items.map((item) => {
      const note = item.note ? ` - ${item.note}` : '';
      const factors = item.factorText ? ` (${item.factorText})` : '';
      const price = item.group === 'oneTimeServices' && item.price > 0 ? ` <span class="proforma-line-price">${formatMoney(item.price)}</span>` : '';
      return `<li>${escapeHtml(item.category)}: ${escapeHtml(item.title + note + factors)}${price}</li>`;
    }).join('')}</ul>`;
  }

  function code128Svg(value) {
    const text = String(value || '').replace(/[^\x20-\x7E]/g, '');
    const codes = [104];
    Array.from(text || 'BRKOVIC').forEach((char) => {
      codes.push(char.charCodeAt(0) - 32);
    });

    let checksum = codes[0];
    for (let index = 1; index < codes.length; index += 1) checksum += codes[index] * index;
    codes.push(checksum % 103, 106);

    let x = 10;
    const height = 54;
    const bars = [];
    codes.forEach((code) => {
      const pattern = code128Patterns[code] || '';
      Array.from(pattern).forEach((digit, index) => {
        const width = Number(digit);
        if (index % 2 === 0) {
          bars.push(`<rect x="${x}" y="0" width="${width}" height="${height}" />`);
        }
        x += width;
      });
    });
    const totalWidth = x + 10;
    return `<svg class="proforma-barcode" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="Штрихкод электронной профактуры" xmlns="http://www.w3.org/2000/svg"><rect width="${totalWidth}" height="${height}" fill="#fff" />${bars.join('')}</svg>`;
  }

  function parseLocalDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function periodInfo(start, end) {
    const startDate = parseLocalDate(start);
    const endDate = parseLocalDate(end);
    if (!startDate || !endDate || endDate < startDate) {
      return { multiplier: 1, label: '1 мес.', note: 'Период уточняется вручную' };
    }

    const rawMonths = ((endDate.getFullYear() - startDate.getFullYear()) * 12) + (endDate.getMonth() - startDate.getMonth()) + 1;
    const alignedFullMonths = startDate.getDate() === 1 && endDate.getDate() === daysInMonth(endDate.getFullYear(), endDate.getMonth());
    if (alignedFullMonths) {
      return { multiplier: rawMonths, label: `${rawMonths} мес.`, note: 'Полные календарные месяцы периода' };
    }

    const days = Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
    const multiplier = Math.max(0.03, Math.round((days / 30.4375) * 100) / 100);
    return { multiplier, label: `${multiplier} мес.`, note: `${days} дней / средний календарный месяц` };
  }

  function serviceLineAmount(item, group, context) {
    const basePrice = toNumber(item.price, 0);
    const crewFactor = group === 'monthlyServices' ? crewReductionFactor(item, context.crewKey) : 1;
    const crewText = group === 'monthlyServices' ? ` × экипаж ${crewFactor.toFixed(2)}` : '';
    return {
      unitNet: roundPrice(basePrice * context.typeFactor * context.lengthFactor * crewFactor),
      calculation: `база ${formatMoney(basePrice)} × тип ${context.typeFactor} × длина ${context.lengthFactor}${crewText}`,
    };
  }

  function proformaDetailRow(item, index, vatPercent) {
    const vat = item.net * (vatPercent / 100);
    const gross = item.net + vat;
    return `
      <tr>
        <td>${String(index).padStart(2, '0')}</td>
        <td>
          <span class="proforma-position">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.category)}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</small>
          </span>
        </td>
        <td><span class="proforma-calc">${escapeHtml(item.calculation || '')}</span></td>
        <td>${escapeHtml(item.quantityLabel)}</td>
        <td class="proforma-money">${formatMoney(item.net)}</td>
        <td class="proforma-money">${formatMoney(vat)}</td>
        <td class="proforma-money">${formatMoney(gross)}</td>
      </tr>
    `;
  }

  function proformaLine(label, descriptionHtml, period, amount) {
    return `
      <tr>
        <td>${escapeHtml(label)}</td>
        <td>${descriptionHtml}</td>
        <td>${escapeHtml(period)}</td>
        <td class="proforma-money">${formatMoney(amount)}</td>
      </tr>
    `;
  }

  function proformaTotals(net, discountPercent, vatPercent) {
    const discount = net * (discountPercent / 100);
    const taxable = Math.max(0, net - discount);
    const vat = taxable * (vatPercent / 100);
    const total = taxable + vat;
    return { net, discount, taxable, vat, total };
  }

  function applyContractTokens(text, tokens) {
    return String(text || '').replace(/\{([A-Za-z0-9]+)\}/g, (match, key) => (
      Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : match
    ));
  }

  function legalParagraph(text, tokens) {
    return escapeHtml(applyContractTokens(text, tokens)).replace(/\n/g, '<br />');
  }

  function renderLegalSectionsHtml(tokens) {
    const sections = currentLegalSections();
    if (!sections.length) return '';
    return `
      <section class="proforma-legal">
        <h3>Юридические условия договора</h3>
        ${sections.map((section) => `
          <article class="proforma-legal-section">
            <h4>${escapeHtml(applyContractTokens(section.title, tokens))}</h4>
            ${(section.articles || []).map((article) => `
              <div class="proforma-legal-article">
                <strong>${escapeHtml(applyContractTokens(article.title, tokens))}</strong>
                <p>${legalParagraph(article.body, tokens)}</p>
              </div>
            `).join('')}
          </article>
        `).join('')}
      </section>
    `;
  }

  function generateContractHtml() {
    const defaults = currentContractDefaults();
    const invoice = currentInvoiceDefaults();
    const number = document.getElementById('proformaNumber')?.value.trim() || makeProformaNumber();
    const date = document.getElementById('proformaDate')?.value || todayISO();
    const client = document.getElementById('contractClient')?.value.trim() || '[клиент]';
    const yacht = document.getElementById('contractYacht')?.value.trim() || '[яхта]';
    const location = document.getElementById('contractLocation')?.value.trim() || '[марина / локация]';
    const start = document.getElementById('contractStart')?.value || '[дата начала]';
    const end = document.getElementById('contractEnd')?.value || '[дата окончания]';
    const includeBase = contractBaseIncluded();
    const monthly = includeBase ? toNumber(document.getElementById('contractMonthlyPrice')?.value, 0) : 0;
    const autoOneTime = document.getElementById('contractAutoOneTimeToggle')?.checked;
    if (autoOneTime) updateAutoOneTimePrice(true);
    const selectedOneTime = selectedOneTimeDetails();
    const selectedOneTimeTotal = selectedOneTime.reduce((sum, item) => sum + toNumber(item.price, 0), 0);
    const oneTime = autoOneTime ? selectedOneTimeTotal : toNumber(document.getElementById('contractOneTimePrice')?.value, 0);
    const discountPercent = clampPercent(document.getElementById('contractDiscountPercent')?.value, invoice.discountPercent || 0);
    const vatPercent = clampPercent(document.getElementById('contractVatPercent')?.value, invoice.vatPercent ?? 21);
    const notes = document.getElementById('contractNotes')?.value.trim();
    const scope = selectedScopeDetails();
    const monthlyScope = scope.filter((item) => item.group === 'monthlyServices');
    const oneTimeScope = selectedOneTime.length ? selectedOneTime : (oneTime > 0 ? [{
      group: 'oneTimeServices',
      category: 'Разовые',
      title: 'Разовые услуги по согласованному перечню',
      price: oneTime,
    }] : []);
    const period = `${start} - ${end}`;
    const periodMeta = periodInfo(start, end);
    const electronicUrl = normalizeDocumentUrl(invoice.electronicBaseUrl, number);
    const context = oneTimeFactorContext();
    const baseLengthNet = baseForLength(context.lengthKey) || monthly;
    const lineItems = [];

    if (includeBase && monthly > 0) {
      lineItems.push({
        category: 'Ежемесячные',
        title: 'База месяца: контроль яхты у причала, технический контроль, представление судовладельца',
        calculation: `база ${formatMoney(baseLengthNet)} × тип ${context.typeFactor} × экипаж ${context.baseCrewFactor.toFixed(2)} = ${formatMoney(monthly)} × ${periodMeta.label}`,
        quantityLabel: periodMeta.label,
        net: monthly * periodMeta.multiplier,
        bucket: 'monthly',
      });
    }

    monthlyScope.forEach((item) => {
      const source = pricing?.[item.group]?.[item.key] || item;
      const priced = serviceLineAmount(source, item.group, context);
      lineItems.push({
        category: item.category,
        title: item.title,
        calculation: `${priced.calculation} × ${periodMeta.label}`,
        quantityLabel: periodMeta.label,
        net: priced.unitNet * periodMeta.multiplier,
        bucket: 'monthly',
      });
    });

    oneTimeScope.forEach((item) => {
      const base = toNumber(item.basePrice ?? item.price, 0);
      lineItems.push({
        category: item.category || 'Разовые',
        title: item.title,
        note: item.note || '',
        calculation: item.factorText || `разовая цена ${formatMoney(base)}`,
        quantityLabel: `${toNumber(item.quantity, 1)} раз`,
        net: toNumber(item.price, 0),
        bucket: 'oneTime',
      });
    });

    if (!lineItems.length) {
      lineItems.push({
        category: 'Расчет',
        title: 'Услуги не выбраны',
        calculation: 'Заполните конструктор профактуры',
        quantityLabel: '-',
        net: 0,
        bucket: 'manual',
      });
    }

    const monthlyPeriodNet = lineItems.filter((item) => item.bucket === 'monthly').reduce((sum, item) => sum + item.net, 0);
    const oneTimeNet = lineItems.filter((item) => item.bucket === 'oneTime').reduce((sum, item) => sum + item.net, 0);
    const netBeforeDiscount = lineItems.reduce((sum, item) => sum + item.net, 0);
    const totals = proformaTotals(netBeforeDiscount, discountPercent, vatPercent);
    const rows = lineItems.map((item, index) => proformaDetailRow(item, index + 1, vatPercent)).join('');
    const servicesText = lineItems
      .filter((item) => item.net > 0 || item.category !== 'Расчет')
      .map((item) => `${item.category}: ${item.title}`)
      .join('; ') || 'услуги не выбраны';
    const contractTokens = {
      provider: invoice.companyName || defaults.provider || 'VETUS NAUTA / BRKOVIC',
      client,
      yacht,
      location,
      period,
      periodMonths: periodMeta.label,
      services: servicesText,
      monthlyPeriodNet: formatMoney(monthlyPeriodNet),
      oneTimeNet: formatMoney(oneTimeNet),
      netBeforeDiscount: formatMoney(netBeforeDiscount),
      discountPercent: String(discountPercent),
      discountAmount: formatMoney(totals.discount),
      taxableNet: formatMoney(totals.taxable),
      vatPercent: String(vatPercent),
      vatAmount: formatMoney(totals.vat),
      totalGross: formatMoney(totals.total),
      paymentTerms: defaults.paymentTerms || '',
      estimateClause: defaults.estimateClause || '',
      exclusions: defaults.exclusions || '',
      jurisdiction: defaults.jurisdiction || 'Черногория',
      electronicUrl,
      proformaNumber: number,
      date,
    };

    return `
      <article class="proforma-document">
        <header class="proforma-hero">
          <div class="proforma-brand">
            <img src="${escapeHtml(logoUrl(invoice.logoUrl))}" alt="${escapeHtml(invoice.companyName)}" />
            <div>
              <p class="proforma-kicker">Yacht Management</p>
              <h2>Proforma Invoice</h2>
            </div>
          </div>
          <div class="proforma-meta">
            <strong>${escapeHtml(number)}</strong>
            <span>Дата: ${escapeHtml(date)}</span>
            <span>Валюта: EUR</span>
          </div>
        </header>

        <section class="proforma-parties">
          <div>
            <h3>Исполнитель</h3>
            <p><strong>${escapeHtml(invoice.companyName || defaults.provider || 'VETUS NAUTA / BRKOVIC')}</strong></p>
            <p>${escapeHtml(invoice.address || '')}</p>
            <p>${escapeHtml(invoice.email || '')}</p>
            <p>${escapeHtml(invoice.phone || '')}</p>
          </div>
          <div>
            <h3>Клиент / яхта</h3>
            <p><strong>${escapeHtml(client)}</strong></p>
            <p>${escapeHtml(yacht)}</p>
            <p>${escapeHtml(location)}</p>
            <p>Экипаж: ${escapeHtml(context.crewLabel)}</p>
            <p>Период обслуживания: ${escapeHtml(period)}</p>
          </div>
        </section>

        <section class="proforma-texture-band">
          <span>Private yacht operations</span>
          <strong>net pricing + VAT</strong>
        </section>

        <table class="proforma-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Позиция</th>
              <th>Расчет</th>
              <th>Кол-во</th>
              <th>Нетто</th>
              <th>НДС</th>
              <th>С НДС</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <section class="proforma-summary">
          <div class="proforma-notes">
            <h3>Условия</h3>
            <div class="proforma-period-summary">
              <div><span>Период</span><strong>${escapeHtml(period)} · ${escapeHtml(periodMeta.label)}</strong></div>
              <div><span>Месячные услуги за период</span><strong>${formatMoney(monthlyPeriodNet)}</strong></div>
              <div><span>Разовые услуги</span><strong>${formatMoney(oneTimeNet)}</strong></div>
              <div><span>Нетто до дисконта</span><strong>${formatMoney(netBeforeDiscount)}</strong></div>
            </div>
            <p>${escapeHtml(invoice.paymentNote || '')}</p>
            <p>${escapeHtml(defaults.paymentTerms || '')}</p>
            <p>${escapeHtml(periodMeta.note)}</p>
            <p>${escapeHtml(defaults.estimateClause || '')}</p>
            ${notes ? `<p><strong>Особые условия:</strong> ${escapeHtml(notes).replace(/\n/g, '<br />')}</p>` : ''}
          </div>
          <div class="proforma-total-box">
            <div><span>Нетто до дисконта</span><strong>${formatMoney(totals.net)}</strong></div>
            <div><span>Дисконт ${discountPercent}%</span><strong>-${formatMoney(totals.discount)}</strong></div>
            <div><span>Нетто после дисконта / база НДС</span><strong>${formatMoney(totals.taxable)}</strong></div>
            <div><span>НДС ${vatPercent}%</span><strong>${formatMoney(totals.vat)}</strong></div>
            <div class="proforma-grand-total"><span>Итого</span><strong>${formatMoney(totals.total)}</strong></div>
          </div>
        </section>

        ${renderLegalSectionsHtml(contractTokens)}

        <footer class="proforma-footer">
          <div>
            <h3>Электронная версия профактуры</h3>
            <p>${escapeHtml(electronicUrl)}</p>
            ${code128Svg(electronicUrl)}
          </div>
          <div>
            <h3>Юрисдикция</h3>
            <p>${escapeHtml(defaults.jurisdiction || 'Черногория')}</p>
            <p>${escapeHtml(defaults.exclusions || '')}</p>
          </div>
        </footer>
      </article>
    `;
  }

  function printProformaHtml(html) {
    if (!html || !html.includes('proforma-document')) {
      setStatus('Сначала соберите профактуру.');
      return;
    }

    const oldFrame = document.getElementById('proformaPrintFrame');
    if (oldFrame) oldFrame.remove();

    const frame = document.createElement('iframe');
    frame.id = 'proformaPrintFrame';
    frame.title = 'Печать профактуры';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);
    let didPrint = false;
    const runPrint = () => {
      if (didPrint) return;
      didPrint = true;
      window.setTimeout(() => {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      }, 350);
    };
    frame.onload = runPrint;

    const cssHref = new URL('css/admin-management.css?v=20260516-10', window.location.href).href;
    const variablesHref = new URL('css/variables.css', window.location.href).href;
    const mainHref = new URL('css/main.css', window.location.href).href;
    const doc = frame.contentDocument || frame.contentWindow.document;

    doc.open();
    doc.write(`<!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>Профактура</title>
        <link rel="stylesheet" href="${variablesHref}" />
        <link rel="stylesheet" href="${mainHref}" />
        <link rel="stylesheet" href="${cssHref}" />
        <style>
          html, body { margin: 0; background: #fff; }
          body { padding: 0; }
          .contract-print-area { margin: 0; padding: 0; border: 0; background: #fff; }
        </style>
      </head>
      <body>
        <article class="contract-preview contract-print-area">${html}</article>
      </body>
      </html>`);
    doc.close();

    window.setTimeout(runPrint, 900);
  }

  function bindTabs() {
    document.querySelectorAll('.service-price-tab').forEach((button) => {
      button.addEventListener('click', () => {
        currentServiceTab = button.dataset.priceTab || 'monthlyServices';
        document.querySelectorAll('.service-price-tab').forEach((item) => item.classList.toggle('is-active', item === button));
        renderServiceFields();
      });
    });
  }

  function handlePricingInput(event) {
    const input = event.target;
    if (!pricing || !input?.dataset?.group) return;

    const group = input.dataset.group;
    const key = input.dataset.key;
    const field = input.dataset.field;
    if (!key || !field) return;

    if (group === 'range') {
      pricing.range = pricing.range || {};
      pricing.range[field] = toNumber(input.value, pricing.range[field]);
      updateLengthAutoPreview();
      return;
    }

    syncPricingFromField(input);

    if (group === 'lengthData' && field === 'base') {
      syncLengthBases(key);
      return;
    }

    if (group === 'lengthData' && field === 'factor') {
      syncLengthBases(lengthAnchorKey);
      updateAutoOneTimePrice(true);
      return;
    }

    if (group === 'typeData' && field === 'factor') {
      updateLengthAutoPreview();
      updateAutoMonthlyPrice(true);
      updateAutoOneTimePrice(true);
    }

    if (group === 'crewData' && field === 'factor') {
      updateLengthAutoPreview();
      updateAutoMonthlyPrice(true);
    }

    if (group === 'monthlyServices') {
      updatePricingPopupSummaries();
      updateContractBuilderSummary();
    }

    if (group === 'oneTimeServices') {
      updateAutoOneTimePrice(true);
    }

  }

  function moveContractToBottom() {
    const contract = document.querySelector('.pricing-card--contract');
    const services = document.querySelector('.pricing-card--services');
    if (contract && services && services.nextElementSibling !== contract) {
      services.after(contract);
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function bringPopupToFront(popup) {
    if (!popup) return;
    popupZIndex += 1;
    popup.style.zIndex = String(popupZIndex);
  }

  function positionPopupCard(popup) {
    const card = popup?.querySelector('.pricing-popup__card');
    if (!popup || !card || card.dataset.positioned === 'true') return;
    const openIndex = Array.from(document.querySelectorAll('.pricing-popup:not([hidden])')).indexOf(popup);
    const rect = card.getBoundingClientRect();
    const left = clamp((window.innerWidth - rect.width) / 2 + (openIndex * 26), 12, Math.max(12, window.innerWidth - rect.width - 12));
    const top = clamp(72 + (openIndex * 22), 12, Math.max(12, window.innerHeight - Math.min(rect.height, window.innerHeight - 24) - 12));
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.transform = 'none';
    card.dataset.positioned = 'true';
  }

  function openPricingPopup(id) {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.hidden = false;
    bringPopupToFront(popup);
    window.requestAnimationFrame(() => {
      positionPopupCard(popup);
      popup.querySelector('input, select, textarea, button:not(.pricing-popup__shade)')?.focus();
    });
  }

  function closePricingPopup(popup) {
    if (!popup) return;
    popup.hidden = true;
  }

  function bindPricingPopups() {
    document.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-remove-service]');
      if (removeButton) {
        event.preventDefault();
        removeService(removeButton.dataset.removeService, removeButton.dataset.serviceKey);
        return;
      }

      const addButton = event.target.closest('[data-add-service]');
      if (addButton) {
        event.preventDefault();
        addService(addButton.dataset.addService, addButton.dataset.openAfterAdd || '');
        return;
      }

      const openButton = event.target.closest('[data-popup-open]');
      if (openButton) {
        event.preventDefault();
        openPricingPopup(openButton.dataset.popupOpen);
        return;
      }

      const closeButton = event.target.closest('[data-popup-close]');
      if (closeButton) {
        event.preventDefault();
        closePricingPopup(closeButton.closest('.pricing-popup'));
      }
    });

    document.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('.pricing-popup__card');
      if (card) bringPopupToFront(card.closest('.pricing-popup'));

      const head = event.target.closest('.pricing-popup__head');
      if (!head || event.target.closest('button, input, select, textarea, a')) return;
      const dragCard = head.closest('.pricing-popup__card');
      const popup = head.closest('.pricing-popup');
      if (!dragCard || !popup) return;
      const rect = dragCard.getBoundingClientRect();
      popupDragState = {
        card: dragCard,
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      dragCard.classList.add('is-dragging');
      dragCard.style.transform = 'none';
      dragCard.setPointerCapture?.(event.pointerId);
      bringPopupToFront(popup);
      event.preventDefault();
    });

    document.addEventListener('pointermove', (event) => {
      if (!popupDragState || popupDragState.pointerId !== event.pointerId) return;
      const { card, offsetX, offsetY } = popupDragState;
      const rect = card.getBoundingClientRect();
      const left = clamp(event.clientX - offsetX, 8, Math.max(8, window.innerWidth - rect.width - 8));
      const top = clamp(event.clientY - offsetY, 8, Math.max(8, window.innerHeight - 48));
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
    });

    document.addEventListener('pointerup', (event) => {
      if (!popupDragState || popupDragState.pointerId !== event.pointerId) return;
      popupDragState.card.classList.remove('is-dragging');
      popupDragState.card.releasePointerCapture?.(event.pointerId);
      popupDragState = null;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closePricingPopup(document.querySelector('.pricing-popup:not([hidden])'));
    });
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('adminManagementEmail')?.value.trim();
    const password = document.getElementById('adminManagementPassword')?.value || '';
    if (!email || !password) return;

    setStatus('Выполняю вход...');
    try {
      await login(email, password);
      setLoggedInUI(true);
      await loadPricing();
    } catch (error) {
      setStatus(error.message || 'Не удалось войти.');
    }
  });

  saveBtn?.addEventListener('click', async () => {
    try {
      await savePricing();
    } catch (error) {
      setStatus(error.message || 'Не удалось сохранить настройки.');
    }
  });

  saveModelBtn?.addEventListener('click', async () => {
    try {
      await savePricing();
      setStatus('Текущая модель услуг сохранена. Публичный калькулятор читает этот же JSON.');
    } catch (error) {
      setStatus(error.message || 'Не удалось сохранить модель услуг.');
    }
  });

  reloadBtn?.addEventListener('click', async () => {
    if (!isLoggedIn) return;
    try {
      await loadPricing();
    } catch (error) {
      setStatus(error.message || 'Не удалось загрузить настройки.');
    }
  });

  contractForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const preview = document.getElementById('contractPreview');
    if (preview) preview.innerHTML = generateContractHtml();
  });

  servicePricingNode?.addEventListener('change', (event) => {
    const input = event.target;
    if (!pricing || input?.dataset?.field !== 'enabled') return;
    pricing = collectPricing();
    renderContractScope();
    renderContractOneTimeFields();
    updateAutoOneTimePrice(true);
  });

  monthlyAddOnPricingNode?.addEventListener('change', (event) => {
    const input = event.target;
    if (!pricing || !input?.dataset?.field) return;
    pricing = collectPricing();
    renderContractScope();
    updatePricingPopupSummaries();
    updateContractBuilderSummary();
  });

  managementPanel?.addEventListener('input', handlePricingInput);
  managementPanel?.addEventListener('change', handlePricingInput);

  managementPanel?.addEventListener('input', (event) => {
    if (event.target?.closest?.('#contractOneTimeFields')) updateAutoOneTimePrice(true);
    if (event.target?.closest?.('#contractBuilderForm')) updateContractBuilderSummary();
  });

  managementPanel?.addEventListener('change', (event) => {
    if (event.target?.closest?.('#contractOneTimeFields') || event.target?.id === 'contractAutoOneTimeToggle') {
      updateAutoOneTimePrice(true);
    }
    if (event.target?.closest?.('#contractScopeFields')) {
      updateContractBuilderSummary();
    }
  });

  document.getElementById('contractTypeSelect')?.addEventListener('change', (event) => {
    selectedContractTypeKey = event.target.value;
    renderContractScope();
    updateLengthAutoPreview();
    updateAutoMonthlyPrice(true);
    updateAutoOneTimePrice(true);
  });

  document.getElementById('contractLengthSelect')?.addEventListener('change', (event) => {
    selectedContractLengthKey = event.target.value;
    updateAutoMonthlyPrice(true);
    updateAutoOneTimePrice(true);
  });

  document.getElementById('contractCrewSelect')?.addEventListener('change', (event) => {
    selectedContractCrewKey = event.target.value;
    updateLengthAutoPreview();
    updateAutoMonthlyPrice(true);
    updateAutoOneTimePrice(true);
  });

  document.getElementById('contractAutoPriceToggle')?.addEventListener('change', () => {
    updateAutoMonthlyPrice(true);
  });

  document.getElementById('contractBaseToggle')?.addEventListener('change', () => {
    updateAutoMonthlyPrice(true);
  });

  document.getElementById('toggleContractBuilderBtn')?.addEventListener('click', () => {
    const shell = document.getElementById('contractBuilderShell');
    setContractBuilderOpen(!!shell?.hidden);
  });

  printContractBtn?.addEventListener('click', () => {
    const preview = document.getElementById('contractPreview');
    const html = generateContractHtml();
    if (preview) preview.innerHTML = html;
    printProformaHtml(html);
  });

  moveContractToBottom();
  bindPricingPopups();
  bindTabs();

  (async () => {
    if (IS_LOCAL) {
      setLoggedInUI(true);
      try {
        await loadPricing();
        setStatus('Локальный режим: цены сохраняются прямо в data/management-pricing.json.');
      } catch (error) {
        setLoggedInUI(false);
        setStatus(error.message || 'Не удалось загрузить локальные настройки.');
      }
      return;
    }

    const loggedIn = await checkSession();
    if (loggedIn) {
      setLoggedInUI(true);
      try {
        await loadPricing();
      } catch (error) {
        setStatus(error.message || 'Не удалось загрузить настройки.');
      }
    } else {
      setLoggedInUI(false);
      setStatus('Войдите тем же логином, что используется для постов и комментариев.');
    }
  })();
})();
