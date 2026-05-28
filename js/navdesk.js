(function setupNavdeskSharedConsent() {
  const CONSENT_KEY = 'navdeskAcceptedVersion';
  const CONSENT_AT_KEY = 'navdeskAcceptedAt';
  const CONSENT_VERSION = '2026-04-20';
  const CONSENT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

  const readConsent = () => {
    try {
      const acceptedVersion = localStorage.getItem(CONSENT_KEY);
      if (acceptedVersion !== CONSENT_VERSION) return false;

      const acceptedAt = Number(localStorage.getItem(CONSENT_AT_KEY));
      if (!Number.isFinite(acceptedAt) || acceptedAt <= 0) {
        localStorage.setItem(CONSENT_AT_KEY, String(Date.now()));
        return true;
      }

      return Date.now() - acceptedAt < CONSENT_TTL_MS;
    } catch (e) {
      return false;
    }
  };

  const writeConsent = () => {
    try {
      localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
      localStorage.setItem(CONSENT_AT_KEY, String(Date.now()));
    } catch (e) {}
  };

  window.initNavdeskConsent = () => {
    if (window.__navdeskConsentInitialized) return;

    const navdeskModal = document.getElementById('navdeskModal');
    const navdeskModalAccept = document.getElementById('navdeskModalAccept');
    const siteShell = document.querySelector('.site-shell');
    if (!navdeskModal || !navdeskModalAccept) return;

    window.__navdeskConsentInitialized = true;

    if (siteShell && navdeskModal.parentElement !== siteShell) {
      siteShell.appendChild(navdeskModal);
    }

    const openNavdeskModal = () => {
      navdeskModal.classList.add('is-open');
      navdeskModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('navdesk-locked');
    };

    const closeNavdeskModal = () => {
      navdeskModal.classList.remove('is-open');
      navdeskModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('navdesk-locked');
    };

    navdeskModalAccept.addEventListener('click', () => {
      writeConsent();
      closeNavdeskModal();
    });

    if (!readConsent()) {
      openNavdeskModal();
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initNavdeskConsent === 'function') {
    window.initNavdeskConsent();
  }
});

document.addEventListener('DOMContentLoaded', () => {
(function initNavDesk() {
  const speedEl = document.getElementById('calcSpeed');
  const distanceEl = document.getElementById('calcDistance');
  const daysEl = document.getElementById('calcDays');
  const hoursEl = document.getElementById('calcHours');
  const minutesEl = document.getElementById('calcMinutes');
  const fuelHourEl = document.getElementById('calcFuelHour');
  const fuelTotalEl = document.getElementById('calcFuelTotal');
  const reserveEl = document.getElementById('calcReserve');
  const fuelTotalReserveEl = document.getElementById('calcFuelTotalReserve');
  const runBtn = document.getElementById('calcRun');
  const resetBtn = document.getElementById('calcReset');
  const copyBtn = document.getElementById('calcCopy');
  const statusEl = document.getElementById('calcStatus');
  const summaryEl = document.getElementById('calcSummary');

  const tideRunBtn = document.getElementById('tideRun');
  const tidePlaceInput = document.getElementById('tidePlace');
  const tideSuggestions = document.getElementById('tideSuggestions');
  const tideWindowCard = document.getElementById('tideWindowCard');
  const tideRequiredDepth = document.getElementById('tideRequiredDepth');
  const tideMinDepth = document.getElementById('tideMinDepth');
  const tideMaxDepth = document.getElementById('tideMaxDepth');
  const tideModeAuto = document.getElementById('tideModeAuto');
  const tideModeManual = document.getElementById('tideModeManual');
  const tideManualFields = document.getElementById('tideManualFields');
  const tideManualLwTime = document.getElementById('tideManualLwTime');
  const tideManualLwLevel = document.getElementById('tideManualLwLevel');
  const tideManualHwTime = document.getElementById('tideManualHwTime');
  const tideManualHwLevel = document.getElementById('tideManualHwLevel');
  const tideNextHigh = document.getElementById('tideNextHigh');
  const tideNextLow = document.getElementById('tideNextLow');
  const tideTrend = document.getElementById('tideTrend');
  const tideStation = document.getElementById('tideStation');
  const tideNextHighRow = tideNextHigh ? tideNextHigh.closest('p') : null;
  const tideNextLowRow = tideNextLow ? tideNextLow.closest('p') : null;
  const tideSafeWindow = document.getElementById('tideSafeWindow');
  const tideWindowStatus = document.getElementById('tideWindowStatus');
  const tidePlaceholder = document.getElementById('tidePlaceholder');
  const tideTableBody = document.getElementById('tideTableBody');
  const tideWeeklyReport = document.getElementById('tideWeeklyReport');
  const tideWeeklyPrintTitle = document.getElementById('tideWeeklyPrintTitle');
  const tideWeeklyEyebrow = document.getElementById('tideWeeklyEyebrow');
  const tideWeeklyTitle = document.getElementById('tideWeeklyTitle');
  const tideWeeklyMeta = document.getElementById('tideWeeklyMeta');
  const tideWeeklyPrint = document.getElementById('tideWeeklyPrint');
  const tideWeeklySettings = document.getElementById('tideWeeklySettings');
  const tideWeeklySummary = document.getElementById('tideWeeklySummary');
  const tideWeeklySvg = document.getElementById('tideWeeklySvg');
  const tideWeeklyLegend = document.getElementById('tideWeeklyLegend');
  const tideWeeklySource = document.getElementById('tideWeeklySource');

  const allFields = [
    speedEl, distanceEl, daysEl, hoursEl, minutesEl,
    fuelHourEl, fuelTotalEl, reserveEl, fuelTotalReserveEl
  ].filter(Boolean);

  const fuelCalculatorReady = !!(
    speedEl &&
    distanceEl &&
    daysEl &&
    hoursEl &&
    minutesEl &&
    fuelHourEl &&
    fuelTotalEl &&
    reserveEl &&
    fuelTotalReserveEl &&
    runBtn &&
    resetBtn &&
    copyBtn &&
    statusEl &&
    summaryEl
  );

  const getLang = () => {
    const activeBtn = document.querySelector('.lang-switch__btn.is-active');
    const activeLang = activeBtn?.dataset?.lang;
    if (activeLang === 'ru' || activeLang === 'en') return activeLang;
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang === 'ru' || htmlLang === 'en') return htmlLang;
    return 'ru';
  };

  const dict = {
    ru: {
      idle: 'Введите любые известные значения.',
      notEnough: 'Недостаточно данных для расчёта.',
      done: 'Расчёт выполнен.',
      invalid: 'Проверьте значения.',
      copyDone: 'Итог скопирован.',
      copyEmpty: 'Сначала выполните расчёт.',
      time: 'Время',
      days: 'сут',
      hours: 'ч',
      minutes: 'мин',
      distance: 'Дистанция',
      fuel: 'Топливо',
      withReserve: 'С резервом',
      tideWindow: 'Введите глубину, осадку и запас под килем.',
      tideWindowStatusIdle: 'Ожидает расчёта.',
      tideNoData: 'Данные прилива пока не загружены.',
      tidePlaceholder: 'Выберите место и дату, чтобы загрузить события прилива.',
      navdesk_tides_manual_station: 'Ручной ввод',
      navdesk_tides_manual_active: 'Ручной режим',
      navdesk_tides_manual_table: 'В ручном режиме таблица событий не используется.',
      navdesk_tides_loading: 'Загрузка данных прилива...',
      navdesk_tides_no_results: 'Место не найдено.',
      navdesk_tides_error: 'Не удалось получить данные прилива.',
      navdesk_tides_searching: 'Ищем место...',
      navdesk_tides_search_error: 'Не удалось загрузить варианты. Попробуйте еще раз или используйте ручной ввод.',
      navdesk_tides_search_fallback: 'Внешний поиск недоступен, показаны локальные варианты.',
      navdesk_tides_query_too_short: 'Введите минимум 2 символа.',
      navdesk_tides_select_place: 'Выберите место из списка.',
      navdesk_tides_select_ambiguous: 'Найдено несколько вариантов. Выберите нужное место из списка.',
      navdesk_weekly_eyebrow: 'Неделя',
      navdesk_weekly_title: 'Недельный график прилива и глубины',
      navdesk_weekly_print_title: 'VETUS NAUTA - Brkovic / NavDesk Tides',
      navdesk_weekly_print: 'Печать / PDF',
      navdesk_weekly_loading: 'Загружаем недельный график...',
      navdesk_weekly_error: 'Не удалось загрузить недельный график.',
      navdesk_weekly_no_data: 'Недостаточно данных для недельного графика.',
      navdesk_weekly_generated: 'Сформировано',
      navdesk_weekly_available: 'Доступная глубина',
      navdesk_weekly_required: 'Требуемая глубина',
      navdesk_weekly_safe: 'Достаточно',
      navdesk_weekly_below: 'Ниже настройки',
      navdesk_weekly_markers: 'HW/LW',
      navdesk_weekly_charted: 'Глубина на карте',
      navdesk_weekly_draft: 'Осадка',
      navdesk_weekly_ukc: 'UKC',
      navdesk_weekly_formula: 'Формула',
      navdesk_weekly_formula_text: 'доступная глубина = глубина на карте + прилив',
      navdesk_weekly_required_formula: 'требуемая = осадка + UKC',
      navdesk_weekly_minmax: 'Мин/макс доступной глубины за неделю',
      navdesk_weekly_windows: 'Интервалы по текущим настройкам',
      navdesk_weekly_no_windows: 'Интервалы с достаточной глубиной не найдены.',
      navdesk_weekly_more_windows: 'ещё',
      navdesk_weekly_source: 'Источник',
      navdesk_weekly_local_source: 'локальные демо-данные',
      navdesk_window_status_loading: 'Загружаем данные.',
      navdesk_route_mode_gc: 'Ортодромия',
      navdesk_route_mode_rl: 'Локсодромия',
      navdesk_route_error: 'Проверьте координаты.',
      navdesk_route_same_points: 'Старт и финиш совпадают. Укажите разные точки.',
      navdesk_route_print_need_results: 'Сначала рассчитайте маршрут.',
      navdesk_route_table_empty: 'Точки маршрута ещё не рассчитаны.',
      navdesk_route_status_idle: 'Введите координаты и рассчитайте маршрут.'
    },
    en: {
      idle: 'Enter any known values.',
      notEnough: 'Not enough data for calculation.',
      done: 'Calculation complete.',
      invalid: 'Check the values.',
      copyDone: 'Summary copied.',
      copyEmpty: 'Run a calculation first.',
      time: 'Time',
      days: 'd',
      hours: 'h',
      minutes: 'min',
      distance: 'Distance',
      fuel: 'Fuel',
      withReserve: 'With reserve',
      tideWindow: 'Enter depth, draft and under keel clearance.',
      tideWindowStatusIdle: 'Waiting for calculation.',
      tideNoData: 'No tide data loaded yet.',
      tidePlaceholder: 'Select a place and date to load tide events.',
      navdesk_tides_manual_station: 'Manual input',
      navdesk_tides_manual_active: 'Manual mode',
      navdesk_tides_manual_table: 'The event table is not used in manual mode.',
      navdesk_tides_loading: 'Loading tide data...',
      navdesk_tides_no_results: 'Place not found.',
      navdesk_tides_error: 'Could not load tide data.',
      navdesk_tides_searching: 'Searching for place...',
      navdesk_tides_search_error: 'Could not load suggestions. Try again or use manual input.',
      navdesk_tides_search_fallback: 'External search is unavailable; showing local matches.',
      navdesk_tides_query_too_short: 'Enter at least 2 characters.',
      navdesk_tides_select_place: 'Select a place from the list.',
      navdesk_tides_select_ambiguous: 'Several places were found. Select the right place from the list.',
      navdesk_weekly_eyebrow: 'Week',
      navdesk_weekly_title: 'Weekly tide and depth window',
      navdesk_weekly_print_title: 'VETUS NAUTA - Brkovic / NavDesk Tides',
      navdesk_weekly_print: 'Print / PDF',
      navdesk_weekly_loading: 'Loading weekly graph...',
      navdesk_weekly_error: 'Could not load weekly graph.',
      navdesk_weekly_no_data: 'Not enough data for the weekly graph.',
      navdesk_weekly_generated: 'Generated',
      navdesk_weekly_available: 'Available depth',
      navdesk_weekly_required: 'Required depth',
      navdesk_weekly_safe: 'Sufficient',
      navdesk_weekly_below: 'Below setting',
      navdesk_weekly_markers: 'HW/LW',
      navdesk_weekly_charted: 'Charted depth',
      navdesk_weekly_draft: 'Draft',
      navdesk_weekly_ukc: 'UKC',
      navdesk_weekly_formula: 'Formula',
      navdesk_weekly_formula_text: 'available depth = charted depth + tide',
      navdesk_weekly_required_formula: 'required = draft + UKC',
      navdesk_weekly_minmax: 'Weekly min/max available depth',
      navdesk_weekly_windows: 'Intervals by current settings',
      navdesk_weekly_no_windows: 'No sufficient-depth intervals found.',
      navdesk_weekly_more_windows: 'more',
      navdesk_weekly_source: 'Source',
      navdesk_weekly_local_source: 'local demo data',
      navdesk_window_status_loading: 'Loading data.',
      navdesk_route_mode_gc: 'Great circle',
      navdesk_route_mode_rl: 'Rhumb line',
      navdesk_route_error: 'Check the coordinates.',
      navdesk_route_same_points: 'Start and finish are the same. Set different points.',
      navdesk_route_print_need_results: 'Calculate the route first.',
      navdesk_route_table_empty: 'Route points have not been calculated yet.',
      navdesk_route_status_idle: 'Enter coordinates and calculate the route.'
    }
  };

  const navdeskSmallCalcAliases = {
    idle: 'journal_calc_status_idle',
    notEnough: 'journal_calc_status_not_enough',
    done: 'journal_calc_status_done',
    invalid: 'journal_calc_status_invalid',
    copyDone: 'journal_calc_copy_done',
    copyEmpty: 'journal_calc_copy_empty',
    time: 'journal_calc_summary_time',
    days: 'journal_calc_summary_days',
    hours: 'journal_calc_summary_hours',
    minutes: 'journal_calc_summary_minutes',
    distance: 'journal_calc_summary_distance',
    fuel: 'journal_calc_summary_fuel',
    withReserve: 'journal_calc_summary_with_reserve',
    tideWindow: 'navdesk_window_intro',
    tideWindowStatusIdle: 'navdesk_window_status_idle',
    tideNoData: 'navdesk_table_empty',
    tidePlaceholder: 'navdesk_tides_placeholder'
  };

  const t = (key) => {
    const alias = navdeskSmallCalcAliases[key] || key;
    try {
      if (typeof window.t === 'function') {
        const value = window.t(alias);
        if (value && value !== alias) return value;
      }
      const translations = window.__BRKOVIC_TRANSLATIONS || {};
      if (translations[alias]) return translations[alias];
    } catch (e) {}
    return dict[getLang()][key] || dict[getLang()][alias] || '';
  };
  const tUi = (key, fallback = '') => {
    try {
      if (typeof window.t === 'function') {
        const value = window.t(key, fallback);
        if (value && value !== key) return value;
      }
    } catch (e) {}
    return fallback || t(key);
  };

const setWindowCardState = (state) => {
    if (!tideWindowCard) return;
    tideWindowCard.classList.remove('is-idle', 'is-passable', 'is-not-passable', 'is-loading');
    tideWindowCard.classList.add(state || 'is-idle');
  };

  const isManualTideMode = () => !!(tideModeManual && tideModeManual.checked);

  const clearTideMeta = () => {
    if (tideNextHigh) tideNextHigh.textContent = '—';
    if (tideNextLow) tideNextLow.textContent = '—';
    if (tideTrend) tideTrend.textContent = '—';
    if (tideStation) tideStation.textContent = '—';
  };

  const clearTideWeekly = () => {
    if (tideWeeklyReport) tideWeeklyReport.hidden = true;
    if (tideWeeklyMeta) tideWeeklyMeta.textContent = '—';
    if (tideWeeklySettings) tideWeeklySettings.textContent = '';
    if (tideWeeklySummary) tideWeeklySummary.textContent = '';
    if (tideWeeklySvg) tideWeeklySvg.replaceChildren();
    if (tideWeeklyLegend) tideWeeklyLegend.textContent = '';
    if (tideWeeklySource) tideWeeklySource.textContent = '—';
  };

  const setManualTideUiState = () => {
    clearTideMeta();
    clearTideWeekly();
    if (tideStation) tideStation.textContent = t('navdesk_tides_manual_station');
    if (tideTrend) tideTrend.textContent = t('navdesk_tides_manual_active');
    if (tidePlaceholder) {
      tidePlaceholder.style.display = '';
      tidePlaceholder.textContent = t('navdesk_tides_manual_table');
    }
    renderTableMessage(t('navdesk_tides_manual_table'), 'is-idle');
  };

  const updateTideModeUi = () => {
    const manual = isManualTideMode();

    if (tideManualFields) tideManualFields.hidden = !manual;

    if (tideNextHighRow) tideNextHighRow.hidden = manual;
    if (tideNextLowRow) tideNextLowRow.hidden = manual;

    if (tidePlaceInput) {
      tidePlaceInput.disabled = manual;
      tidePlaceInput.setAttribute('aria-disabled', manual ? 'true' : 'false');
    }

    if (tideSuggestions && manual) {
      tideSuggestions.hidden = true;
      tideSuggestions.innerHTML = '';
    }

    if (manual) {
      setManualTideUiState();
    } else if (tidePlaceholder) {
      tidePlaceholder.style.display = '';
      tidePlaceholder.textContent = t('tidePlaceholder');
      renderTableMessage(t('tideNoData'), 'is-idle');
      clearTideMeta();
    }
  };

  const TIDE_PLACE_MIN_QUERY = 2;
  const TIDE_PLACE_DEBOUNCE_MS = 300;
  let tidePlaceSearchTimer = null;
  let tidePlaceSearchSeq = 0;
  let tideSelectedPlace = null;
  let tideLastSearch = { query: '', results: [], status: '' };
  let tideActiveSuggestionIndex = -1;

  const normalizeTidePlace = (item = {}) => ({
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    region: item.region ? String(item.region) : '',
    country: item.country ? String(item.country) : '',
    lat: item.lat ?? '',
    lon: item.lon ?? '',
    source: item.source ? String(item.source) : '',
    timezone: item.timezone ? String(item.timezone) : ''
  });

  const hasTideCoordinates = (place) => (
    place &&
    String(place.lat ?? '').trim() !== '' &&
    String(place.lon ?? '').trim() !== ''
  );

  const clearSelectedTidePlace = () => {
    tideSelectedPlace = null;
    if (!tidePlaceInput) return;
    ['id', 'name', 'lat', 'lon', 'source', 'timezone', 'region', 'country', 'selected'].forEach((key) => {
      delete tidePlaceInput.dataset[key];
    });
  };

  const storeSelectedTidePlace = (item) => {
    const place = normalizeTidePlace(item);
    tideSelectedPlace = place;
    if (!tidePlaceInput) return place;

    tidePlaceInput.value = place.name;
    tidePlaceInput.dataset.id = place.id;
    tidePlaceInput.dataset.name = place.name;
    tidePlaceInput.dataset.lat = String(place.lat ?? '');
    tidePlaceInput.dataset.lon = String(place.lon ?? '');
    tidePlaceInput.dataset.source = place.source;
    tidePlaceInput.dataset.timezone = place.timezone;
    tidePlaceInput.dataset.region = place.region;
    tidePlaceInput.dataset.country = place.country;
    tidePlaceInput.dataset.selected = '1';
    return place;
  };

  const getStoredTidePlace = () => {
    if (!tidePlaceInput || tidePlaceInput.dataset.selected !== '1') return null;
    const place = normalizeTidePlace(tidePlaceInput.dataset);
    const currentText = tidePlaceInput.value.trim();
    if (!place.name || currentText !== place.name || !hasTideCoordinates(place)) return null;
    return place;
  };

  const formatTidePlaceDetail = (item) => {
    const parts = [item.region, item.country].filter(Boolean);
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    const coord = Number.isFinite(lat) && Number.isFinite(lon)
      ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      : '';
    if (item.source) parts.push(item.source);
    if (coord) parts.push(coord);
    return parts.join(' • ');
  };

  const renderSuggestionState = (message, state = 'idle') => {
    if (!tideSuggestions) return;
    tideSuggestions.innerHTML = '';
    tideActiveSuggestionIndex = -1;
    if (tidePlaceInput) tidePlaceInput.removeAttribute('aria-activedescendant');

    const row = document.createElement('div');
    row.className = `navdesk-suggestion-state is-${state}`;
    row.setAttribute('role', 'status');
    row.textContent = message;
    tideSuggestions.appendChild(row);
    tideSuggestions.hidden = false;
  };

  const renderSuggestions = (items = [], options = {}) => {
    if (!tideSuggestions) return;
    const normalizedItems = items.map(normalizeTidePlace).filter((item) => item.name);
    if (!normalizedItems.length && !options.message) {
      tideSuggestions.hidden = true;
      tideSuggestions.innerHTML = '';
      tideActiveSuggestionIndex = -1;
      return;
    }

    tideSuggestions.innerHTML = '';
    tideActiveSuggestionIndex = -1;
    if (tidePlaceInput) tidePlaceInput.removeAttribute('aria-activedescendant');

    const suggestionMessage = options.message || (normalizedItems.length ? tUi('navdesk_tides_suggestion_hint') : '');
    if (suggestionMessage) {
      const row = document.createElement('div');
      row.className = `navdesk-suggestion-state is-${options.state || 'idle'}`;
      row.setAttribute('role', 'status');
      row.textContent = suggestionMessage;
      tideSuggestions.appendChild(row);
    }

    normalizedItems.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'navdesk-suggestion';
      button.id = `tideSuggestion-${index}`;
      button.setAttribute('role', 'option');
      button.dataset.name = item.name || '';
      button.dataset.id = item.id || '';
      button.dataset.lat = item.lat ?? '';
      button.dataset.lon = item.lon ?? '';
      button.dataset.source = item.source || '';
      button.dataset.timezone = item.timezone || '';
      button.dataset.region = item.region || '';
      button.dataset.country = item.country || '';

      const label = document.createElement('span');
      label.className = 'navdesk-suggestion__label';
      label.textContent = [item.name, item.region, item.country].filter(Boolean).join(', ') || item.name;
      button.appendChild(label);

      const detailText = formatTidePlaceDetail(item);
      if (detailText) {
        const detail = document.createElement('span');
        detail.className = 'navdesk-suggestion__detail';
        detail.textContent = detailText;
        button.appendChild(detail);
      }

      tideSuggestions.appendChild(button);
    });
    tideSuggestions.hidden = false;
  };

  const hideSuggestions = () => {
    if (!tideSuggestions) return;
    tideSuggestions.hidden = true;
    tideActiveSuggestionIndex = -1;
    if (tidePlaceInput) tidePlaceInput.removeAttribute('aria-activedescendant');
  };

  const syncTideUiLabels = () => {
    if (tideTrend) tideTrend.setAttribute('aria-label', tUi('navdesk_tides_trend_label', 'Trend'));
    if (tideSuggestions) tideSuggestions.setAttribute('aria-label', tUi('navdesk_tides_suggestion_hint', 'Select a place from the list.'));
  };
  syncTideUiLabels();
  document.addEventListener('languageChanged', syncTideUiLabels);

  const getSuggestionButtons = () => (
    tideSuggestions ? Array.from(tideSuggestions.querySelectorAll('.navdesk-suggestion')) : []
  );

  const setActiveSuggestion = (index) => {
    const buttons = getSuggestionButtons();
    if (!buttons.length || !tidePlaceInput) return;

    const nextIndex = ((index % buttons.length) + buttons.length) % buttons.length;
    buttons.forEach((button, buttonIndex) => {
      button.classList.toggle('is-active', buttonIndex === nextIndex);
    });

    tideActiveSuggestionIndex = nextIndex;
    tidePlaceInput.setAttribute('aria-activedescendant', buttons[nextIndex].id);
    buttons[nextIndex].scrollIntoView({ block: 'nearest' });
  };

  const selectTideSuggestionButton = (button) => {
    if (!button || !tidePlaceInput) return null;
    tidePlaceSearchSeq += 1;
    if (tidePlaceSearchTimer) {
      clearTimeout(tidePlaceSearchTimer);
      tidePlaceSearchTimer = null;
    }
    const selected = storeSelectedTidePlace({
      id: button.dataset.id,
      name: button.dataset.name,
      region: button.dataset.region,
      country: button.dataset.country,
      lat: button.dataset.lat,
      lon: button.dataset.lon,
      source: button.dataset.source,
      timezone: button.dataset.timezone
    });
    hideSuggestions();
    return selected;
  };

  const renderTableMessage = (message, cssClass = 'is-loading') => {
    if (!tideTableBody) return;
    tideTableBody.innerHTML = '';

    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const state = document.createElement('div');
    cell.colSpan = 3;
    state.className = `navdesk-state ${cssClass}`;
    state.textContent = message;
    cell.appendChild(state);
    row.appendChild(cell);
    tideTableBody.appendChild(row);
  };


  const readNum = (el) => {
    const v = String(el.value || '').trim().replace(',', '.');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const writeNum = (el, value, digits = 1) => {
    if (!Number.isFinite(value)) return;
    el.value = Number(value.toFixed(digits)).toString();
  };

  const lockField = (el) => {
    el.readOnly = true;
    el.classList.add('is-calculated');
    el.dataset.calculated = '1';
  };

  const unlockField = (el) => {
    el.readOnly = false;
    el.classList.remove('is-calculated');
    delete el.dataset.calculated;
  };

  const unlockCalculatedFields = () => allFields.forEach(unlockField);

  const markUserInput = (el) => {
    if (String(el.value || '').trim() !== '') el.dataset.userInput = '1';
    else delete el.dataset.userInput;
  };

  const clearUserFlags = () => allFields.forEach((el) => delete el.dataset.userInput);

  const getTimeHours = () => {
    const d = readNum(daysEl) ?? 0;
    const h = readNum(hoursEl) ?? 0;
    const m = readNum(minutesEl) ?? 0;
    if (d === 0 && h === 0 && m === 0) return null;
    if (d < 0 || h < 0 || m < 0) return null;
    return d * 24 + h + (m / 60);
  };

  const setTimeFieldsFromHours = (timeHours) => {
    if (!Number.isFinite(timeHours) || timeHours < 0) return;
    const totalMinutes = Math.round(timeHours * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const restMinutes = totalMinutes - days * 24 * 60;
    const hours = Math.floor(restMinutes / 60);
    const minutes = restMinutes - hours * 60;

    if (!daysEl.dataset.userInput) { daysEl.value = String(days); lockField(daysEl); }
    if (!hoursEl.dataset.userInput) { hoursEl.value = String(hours); lockField(hoursEl); }
    if (!minutesEl.dataset.userInput) { minutesEl.value = String(minutes); lockField(minutesEl); }
  };

  const writeCalculated = (el, value, digits = 1) => {
    if (el.dataset.userInput) return;
    writeNum(el, value, digits);
    lockField(el);
  };

  const buildSummary = ({ days = 0, hours = 0, minutes = 0, distance = null, fuel = null, fuelReserve = null } = {}) => {
    const parts = [];
    parts.push(`${t('time')}: ${days} ${t('days')} ${hours} ${t('hours')} ${minutes} ${t('minutes')}`);
    if (distance !== null) parts.push(`${t('distance')}: ${distance} nm`);
    if (fuel !== null) parts.push(`${t('fuel')}: ${fuel} l`);
    if (fuelReserve !== null) parts.push(`${t('withReserve')}: ${fuelReserve} l`);
    return parts.join(' • ');
  };

  const hasAnyValue = () => allFields.some((el) => String(el.value || '').trim() !== '');

  const runCalculation = () => {
    unlockCalculatedFields();

    let speed = readNum(speedEl);
    let distance = readNum(distanceEl);
    let time = getTimeHours();
    let fuelHour = readNum(fuelHourEl);
    let fuelTotal = readNum(fuelTotalEl);
    let reserve = readNum(reserveEl);
    let fuelTotalReserve = readNum(fuelTotalReserveEl);

    if (!hasAnyValue()) {
      statusEl.textContent = t('idle');
      summaryEl.textContent = '';
      return;
    }

    const invalid = [speed, distance, time, fuelHour, fuelTotal, reserve, fuelTotalReserve].some((v) => v !== null && v < 0);
    if (invalid) {
      statusEl.textContent = t('invalid');
      summaryEl.textContent = '';
      return;
    }

    let changed = false;
    let timeDerived = false;

    if (speed !== null && distance !== null && time === null && speed > 0) {
      time = distance / speed;
      changed = true;
      timeDerived = true;
    }

    if (speed !== null && time !== null && distance === null) {
      distance = speed * time;
      changed = true;
    }

    if (distance !== null && time !== null && speed === null && time > 0) {
      speed = distance / time;
      changed = true;
    }

    if (fuelHour !== null && time !== null && fuelTotal === null) {
      fuelTotal = fuelHour * time;
      changed = true;
    }

    if (fuelTotal !== null && time !== null && fuelHour === null && time > 0) {
      fuelHour = fuelTotal / time;
      changed = true;
    }

    if (fuelTotal !== null && reserve !== null && fuelTotalReserve === null) {
      fuelTotalReserve = fuelTotal * (1 + reserve / 100);
      changed = true;
    }

    if (speed !== null && !speedEl.dataset.userInput) writeCalculated(speedEl, speed, 1);
    if (distance !== null && !distanceEl.dataset.userInput) writeCalculated(distanceEl, distance, 1);
    if (timeDerived) setTimeFieldsFromHours(time);
    if (fuelHour !== null && !fuelHourEl.dataset.userInput) writeCalculated(fuelHourEl, fuelHour, 1);
    if (fuelTotal !== null && !fuelTotalEl.dataset.userInput) writeCalculated(fuelTotalEl, fuelTotal, 1);
    if (reserve !== null && !reserveEl.dataset.userInput) writeCalculated(reserveEl, reserve, 0);
    if (fuelTotalReserve !== null && !fuelTotalReserveEl.dataset.userInput) writeCalculated(fuelTotalReserveEl, fuelTotalReserve, 1);

    statusEl.textContent = changed ? t('done') : t('notEnough');

    const summaryDays = readNum(daysEl) ?? 0;
    const summaryHours = readNum(hoursEl) ?? 0;
    const summaryMinutes = readNum(minutesEl) ?? 0;
    const summaryDistance = readNum(distanceEl);
    const summaryFuel = readNum(fuelTotalEl);
    const summaryFuelReserve = readNum(fuelTotalReserveEl);

    summaryEl.textContent = buildSummary({
      days: summaryDays,
      hours: summaryHours,
      minutes: summaryMinutes,
      distance: summaryDistance,
      fuel: summaryFuel,
      fuelReserve: summaryFuelReserve
    });
  };

  const resetCalculation = () => {
    allFields.forEach((el) => {
      el.value = '';
      unlockField(el);
    });
    clearUserFlags();
    statusEl.textContent = t('idle');
    summaryEl.textContent = '';
  };

  if (fuelCalculatorReady) {
    allFields.forEach((el) => {
      el.addEventListener('input', () => {
        unlockCalculatedFields();
        markUserInput(el);
        statusEl.textContent = t('idle');
        summaryEl.textContent = '';
      });

      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          runCalculation();
        }
      });
    });

    runBtn.addEventListener('click', runCalculation);
    resetBtn.addEventListener('click', resetCalculation);
    copyBtn.addEventListener('click', async () => {
      const textToCopy = String(summaryEl.textContent || '').trim();
      if (!textToCopy) {
        statusEl.textContent = t('copyEmpty');
        return;
      }
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        }
        statusEl.textContent = t('copyDone');
      } catch {
        statusEl.textContent = t('copyEmpty');
      }
    });
  }

  const serverApi = {
    async searchTidesPlace(query) {
      const params = new URLSearchParams({
        q: String(query || ''),
        lang: getLang()
      });
      const url = `/api/tides/search.php?${params.toString()}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`search failed: ${res.status}`);
      return res.json();
    },

    async fetchTidesForecast({ lat, lon, date, units, place }) {
      const params = new URLSearchParams({
        lat: String(lat ?? ''),
        lon: String(lon ?? ''),
        date: String(date ?? ''),
        units: String(units ?? 'm'),
        place: String(place ?? ''),
        lang: getLang(),
      });
      const res = await fetch(`/api/tides/forecast.php?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`forecast failed: ${res.status}`);
      return res.json();
    },

    async fetchWeeklyTides({ lat, lon, date, units, place, charted_depth, draft, ukc }) {
      const params = new URLSearchParams({
        lat: String(lat ?? ''),
        lon: String(lon ?? ''),
        date: String(date ?? ''),
        days: '7',
        units: String(units ?? 'm'),
        place: String(place ?? ''),
        charted_depth: String(charted_depth ?? ''),
        draft: String(draft ?? ''),
        ukc: String(ukc ?? '0'),
        lang: getLang(),
      });
      const res = await fetch(`/api/tides/weekly.php?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`weekly failed: ${res.status}`);
      return res.json();
    },

    async fetchSafeWindow({ lat, lon, date, units, charted_depth, draft, ukc }) {
      const res = await fetch('/api/tides/window.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          lat, lon, date, units, charted_depth, draft, ukc, lang: getLang()
        })
      });
      if (!res.ok) throw new Error(`window failed: ${res.status}`);
      return res.json();
    }
  };

  const renderForecast = (forecast) => {
    if (!forecast?.ok) return;

    const selectedDate = forecast.request?.date || '';
    const nextHigh = forecast.summary?.next_high || null;
    const nextLow = forecast.summary?.next_low || null;

    const formatEventLabel = (eventData) => {
      if (!eventData) return '—';
      const day = eventData.day_label ? `${eventData.day_label}, ` : '';
      return `${day}${eventData.time || '—'}`;
    };

    tideNextHigh.textContent = formatEventLabel(nextHigh);
    tideNextLow.textContent = formatEventLabel(nextLow);
    tideTrend.textContent = forecast.summary?.now_state || '—';
    tideStation.textContent = `${forecast.location?.station_label || forecast.location?.name || '—'} • ${forecast.source || 'demo'}`;

    if (tidePlaceholder) {
      tidePlaceholder.style.display = 'none';
    }

    const rows = Array.isArray(forecast.events)
      ? forecast.events.filter((row) => !selectedDate || row.date === selectedDate)
      : [];

    if (!tideTableBody) return;
    tideTableBody.innerHTML = '';

    if (!rows.length) {
      renderTableMessage(t('tideNoData'), 'is-idle');
      return;
    }

    rows.forEach((eventRow) => {
      const row = document.createElement('tr');
      [eventRow.time, eventRow.label, `${eventRow.height} ${eventRow.units}`].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = String(value ?? '—');
        row.appendChild(cell);
      });
      tideTableBody.appendChild(row);
    });
  };

  const renderWindow = (windowData) => {
    if (!windowData?.ok || !windowData.result) return;

    const result = windowData.result;
    const status = result.status || 'idle';
    const units = result.units || 'm';

    setWindowCardState(
      status === 'passable'
        ? 'is-passable'
        : status === 'not_passable'
          ? 'is-not-passable'
          : 'is-idle'
    );

    if (tideWindowStatus) {
      tideWindowStatus.textContent = result.status_label || t('tideWindowStatusIdle');
    }

    const message = result.message
      || (
        result.window_start && result.window_end
          ? `${result.window_start}–${result.window_end}`
          : t('tideWindow')
      );

    if (tideSafeWindow) {
      tideSafeWindow.textContent = message;
    }

    if (tideRequiredDepth) {
      tideRequiredDepth.textContent = result.required_depth != null ? `${result.required_depth} ${units}` : '—';
    }

    if (tideMinDepth) {
      tideMinDepth.textContent = result.min_available_depth != null ? `${result.min_available_depth} ${units}` : '—';
    }

    if (tideMaxDepth) {
      tideMaxDepth.textContent = result.max_available_depth != null ? `${result.max_available_depth} ${units}` : '—';
    }
  };

  const formatDepthValue = (value, units, digits = 1) => (
    Number.isFinite(Number(value)) ? `${Number(value).toFixed(digits)} ${units}` : '—'
  );

  const formatTideDate = (dateValue, options = {}) => {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(dateValue || '—');
    const locale = getLang() === 'ru' ? 'ru-RU' : 'en-GB';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      ...options
    }).format(date);
  };

  const formatTideDateTime = (dateValue, timeValue) => {
    const dateLabel = formatTideDate(dateValue);
    return `${dateLabel} ${timeValue || '—'}`;
  };

  const setWeeklyLoading = () => {
    if (!tideWeeklyReport) return;
    tideWeeklyReport.hidden = false;
    if (tideWeeklyEyebrow) tideWeeklyEyebrow.textContent = t('navdesk_weekly_eyebrow');
    if (tideWeeklyTitle) tideWeeklyTitle.textContent = t('navdesk_weekly_title');
    if (tideWeeklyPrintTitle) tideWeeklyPrintTitle.textContent = t('navdesk_weekly_print_title');
    if (tideWeeklyPrint) tideWeeklyPrint.textContent = t('navdesk_weekly_print');
    if (tideWeeklyMeta) tideWeeklyMeta.textContent = t('navdesk_weekly_loading');
    if (tideWeeklySettings) tideWeeklySettings.textContent = '';
    if (tideWeeklySummary) tideWeeklySummary.textContent = '';
    if (tideWeeklySvg) tideWeeklySvg.replaceChildren();
    if (tideWeeklyLegend) tideWeeklyLegend.textContent = '';
    if (tideWeeklySource) tideWeeklySource.textContent = '';
  };

  const renderWeeklyError = (message) => {
    if (!tideWeeklyReport) return;
    tideWeeklyReport.hidden = false;
    if (tideWeeklyEyebrow) tideWeeklyEyebrow.textContent = t('navdesk_weekly_eyebrow');
    if (tideWeeklyTitle) tideWeeklyTitle.textContent = t('navdesk_weekly_title');
    if (tideWeeklyPrintTitle) tideWeeklyPrintTitle.textContent = t('navdesk_weekly_print_title');
    if (tideWeeklyPrint) tideWeeklyPrint.textContent = t('navdesk_weekly_print');
    if (tideWeeklyMeta) tideWeeklyMeta.textContent = message || t('navdesk_weekly_error');
    if (tideWeeklySettings) tideWeeklySettings.textContent = '';
    if (tideWeeklySummary) tideWeeklySummary.textContent = '';
    if (tideWeeklySvg) tideWeeklySvg.replaceChildren();
    if (tideWeeklyLegend) tideWeeklyLegend.textContent = '';
    if (tideWeeklySource) tideWeeklySource.textContent = '';
  };

  const addWeeklyChip = (root, label, value) => {
    const item = document.createElement('span');
    item.className = 'navdesk-weekly__chip';

    const strong = document.createElement('strong');
    strong.textContent = label;
    item.appendChild(strong);
    item.appendChild(document.createTextNode(`: ${value}`));
    root.appendChild(item);
  };

  const renderWeeklyLegend = () => {
    if (!tideWeeklyLegend) return;
    tideWeeklyLegend.replaceChildren();
    [
      ['is-available', t('navdesk_weekly_available')],
      ['is-required', t('navdesk_weekly_required')],
      ['is-safe', t('navdesk_weekly_safe')],
      ['is-below', t('navdesk_weekly_below')],
      ['is-marker', t('navdesk_weekly_markers')]
    ].forEach(([cssClass, label]) => {
      const item = document.createElement('span');
      item.className = `navdesk-weekly__legend-item ${cssClass}`;
      const mark = document.createElement('span');
      mark.className = 'navdesk-weekly__legend-mark';
      item.appendChild(mark);
      item.appendChild(document.createTextNode(label));
      tideWeeklyLegend.appendChild(item);
    });
  };

  const renderWeeklySummary = (weekly) => {
    if (!tideWeeklySummary) return;
    tideWeeklySummary.replaceChildren();

    const units = weekly.settings?.units || weekly.request?.units || 'm';
    const series = Array.isArray(weekly.series) ? weekly.series : [];
    const availableValues = series
      .map((point) => Number(point.available_depth))
      .filter(Number.isFinite);
    const minAvailable = availableValues.length ? Math.min(...availableValues) : null;
    const maxAvailable = availableValues.length ? Math.max(...availableValues) : null;

    const minMax = document.createElement('p');
    minMax.textContent = `${t('navdesk_weekly_minmax')}: ${formatDepthValue(minAvailable, units, 2)} / ${formatDepthValue(maxAvailable, units, 2)}`;
    tideWeeklySummary.appendChild(minMax);

    const windows = Array.isArray(weekly.safe_windows) ? weekly.safe_windows : [];
    const windowsLine = document.createElement('p');
    const shown = windows.slice(0, 3).map((item) => (
      `${formatTideDateTime(item.date_start, item.start_time)}–${formatTideDateTime(item.date_end, item.end_time)}`
    ));
    if (shown.length) {
      const extra = windows.length > shown.length
        ? `, +${windows.length - shown.length} ${t('navdesk_weekly_more_windows')}`
        : '';
      windowsLine.textContent = `${t('navdesk_weekly_windows')}: ${shown.join('; ')}${extra}`;
    } else {
      windowsLine.textContent = `${t('navdesk_weekly_windows')}: ${t('navdesk_weekly_no_windows')}`;
    }
    tideWeeklySummary.appendChild(windowsLine);
  };

  const renderWeeklySource = (weekly) => {
    if (!tideWeeklySource) return;
    const sourceText = weekly.source === 'local-mock'
      ? t('navdesk_weekly_local_source')
      : (weekly.source || 'WorldTides');
    const location = weekly.location || {};
    const provider = weekly.provider || {};
    const lat = Number(location.lat ?? weekly.request?.lat);
    const lon = Number(location.lon ?? weekly.request?.lon);
    const coords = Number.isFinite(lat) && Number.isFinite(lon)
      ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      : '';
    const station = location.station_label || provider.station || location.name || '';
    const generated = new Date().toLocaleString(getLang() === 'ru' ? 'ru-RU' : 'en-GB');
    const parts = [
      `${t('navdesk_weekly_source')}: ${sourceText}`,
      station ? `Station: ${station}` : '',
      coords ? `Coordinates: ${coords}` : '',
      provider.datum ? `Datum: ${provider.datum}` : '',
      `${t('navdesk_weekly_generated')}: ${generated}`
    ].filter(Boolean);
    tideWeeklySource.textContent = parts.join(' | ');
  };

  const svgEl = (name, attrs = {}, text = '') => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, String(value));
    });
    if (text) node.textContent = text;
    return node;
  };

  const renderWeeklySvg = (weekly) => {
    if (!tideWeeklySvg) return;
    tideWeeklySvg.replaceChildren();

    const series = Array.isArray(weekly.series) ? weekly.series : [];
    if (series.length < 2) return;

    const width = 1120;
    const height = 360;
    const margin = { top: 26, right: 22, bottom: 58, left: 58 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const units = weekly.settings?.units || weekly.request?.units || 'm';
    const required = Number(weekly.settings?.required_depth ?? 0);
    const charted = Number(weekly.settings?.charted_depth ?? 0);

    const points = series
      .map((point) => ({
        ...point,
        ts: Date.parse(point.iso),
        available: Number(point.available_depth),
        tide: Number(point.tide_height),
        safe: !!point.safe
      }))
      .filter((point) => Number.isFinite(point.ts) && Number.isFinite(point.available));

    if (points.length < 2) return;

    const minTs = points[0].ts;
    const maxTs = points[points.length - 1].ts;
    const values = points.map((point) => point.available).concat(Number.isFinite(required) ? [required] : []);
    const minValueRaw = Math.min(...values);
    const maxValueRaw = Math.max(...values);
    const valuePad = Math.max((maxValueRaw - minValueRaw) * 0.18, units === 'ft' ? 0.6 : 0.2);
    const minValue = minValueRaw - valuePad;
    const maxValue = maxValueRaw + valuePad;

    const xScale = (ts) => margin.left + ((ts - minTs) / Math.max(maxTs - minTs, 1)) * plotWidth;
    const yScale = (value) => margin.top + ((maxValue - value) / Math.max(maxValue - minValue, 0.1)) * plotHeight;

    tideWeeklySvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    tideWeeklySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    tideWeeklySvg.setAttribute('aria-label', t('navdesk_weekly_title'));

    const background = svgEl('rect', {
      x: 0,
      y: 0,
      width,
      height,
      class: 'navdesk-weekly-svg__paper'
    });
    tideWeeklySvg.appendChild(background);

    let runStart = 0;
    for (let i = 1; i <= points.length; i += 1) {
      const runEnded = i === points.length || points[i].safe !== points[runStart].safe;
      if (!runEnded) continue;
      const from = xScale(points[runStart].ts);
      const to = xScale(points[Math.min(i, points.length - 1)].ts);
      tideWeeklySvg.appendChild(svgEl('rect', {
        x: from,
        y: margin.top,
        width: Math.max(to - from, 1),
        height: plotHeight,
        class: points[runStart].safe ? 'navdesk-weekly-svg__safe-band' : 'navdesk-weekly-svg__below-band'
      }));
      runStart = i;
    }

    for (let i = 0; i <= 4; i += 1) {
      const value = minValue + ((maxValue - minValue) * i / 4);
      const y = yScale(value);
      tideWeeklySvg.appendChild(svgEl('line', {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: 'navdesk-weekly-svg__grid'
      }));
      tideWeeklySvg.appendChild(svgEl('text', {
        x: margin.left - 10,
        y: y + 4,
        class: 'navdesk-weekly-svg__axis',
        'text-anchor': 'end'
      }, `${value.toFixed(1)} ${units}`));
    }

    const seenDates = new Set();
    points.forEach((point) => {
      if (seenDates.has(point.date)) return;
      seenDates.add(point.date);
      const x = xScale(point.ts);
      tideWeeklySvg.appendChild(svgEl('line', {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: height - margin.bottom,
        class: 'navdesk-weekly-svg__day'
      }));
      tideWeeklySvg.appendChild(svgEl('text', {
        x: x + 5,
        y: height - 28,
        class: 'navdesk-weekly-svg__date'
      }, formatTideDate(point.date)));
    });

    if (Number.isFinite(required)) {
      const y = yScale(required);
      tideWeeklySvg.appendChild(svgEl('line', {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: 'navdesk-weekly-svg__required'
      }));
      tideWeeklySvg.appendChild(svgEl('text', {
        x: width - margin.right - 6,
        y: y - 8,
        class: 'navdesk-weekly-svg__required-label',
        'text-anchor': 'end'
      }, `${t('navdesk_weekly_required')} ${required.toFixed(1)} ${units}`));
    }

    const availablePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.ts).toFixed(2)} ${yScale(point.available).toFixed(2)}`)
      .join(' ');
    tideWeeklySvg.appendChild(svgEl('path', {
      d: availablePath,
      class: 'navdesk-weekly-svg__available'
    }));

    const events = Array.isArray(weekly.events) ? weekly.events : [];
    events.slice(0, 36).forEach((eventData, index) => {
      const ts = Date.parse(eventData.iso);
      const tideHeight = Number(eventData.tide_height ?? eventData.height);
      if (!Number.isFinite(ts) || !Number.isFinite(tideHeight) || ts < minTs || ts > maxTs) return;
      const x = xScale(ts);
      const y = yScale(charted + tideHeight);
      const isHigh = eventData.type === 'high';
      const label = `${isHigh ? 'HW' : 'LW'} ${tideHeight.toFixed(1)} ${units}`;
      tideWeeklySvg.appendChild(svgEl('circle', {
        cx: x,
        cy: y,
        r: 4,
        class: isHigh ? 'navdesk-weekly-svg__marker is-high' : 'navdesk-weekly-svg__marker is-low'
      }));
      tideWeeklySvg.appendChild(svgEl('text', {
        x: x + 6,
        y: y + (index % 2 === 0 ? -8 : 16),
        class: 'navdesk-weekly-svg__marker-label'
      }, label));
    });

    tideWeeklySvg.appendChild(svgEl('text', {
      x: margin.left,
      y: 18,
      class: 'navdesk-weekly-svg__caption'
    }, `${t('navdesk_weekly_available')} (${units})`));
  };

  const renderWeeklyGraph = (weekly) => {
    if (!tideWeeklyReport) return;
    const series = Array.isArray(weekly?.series) ? weekly.series : [];
    if (!weekly?.ok || series.length < 2) {
      renderWeeklyError(t('navdesk_weekly_no_data'));
      return;
    }

    const units = weekly.settings?.units || weekly.request?.units || 'm';
    const first = series[0];
    const last = series[series.length - 1];
    const place = weekly.location?.name || weekly.request?.place || '—';
    const station = weekly.location?.station_label || weekly.provider?.station || '';
    const lat = Number(weekly.location?.lat ?? weekly.request?.lat);
    const lon = Number(weekly.location?.lon ?? weekly.request?.lon);
    const coords = Number.isFinite(lat) && Number.isFinite(lon) ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : '';
    const range = first?.date && last?.date ? `${formatTideDate(first.date)}–${formatTideDate(last.date)}` : '—';

    tideWeeklyReport.hidden = false;
    if (tideWeeklyEyebrow) tideWeeklyEyebrow.textContent = t('navdesk_weekly_eyebrow');
    if (tideWeeklyTitle) tideWeeklyTitle.textContent = t('navdesk_weekly_title');
    if (tideWeeklyPrintTitle) tideWeeklyPrintTitle.textContent = t('navdesk_weekly_print_title');
    if (tideWeeklyPrint) tideWeeklyPrint.textContent = t('navdesk_weekly_print');
    if (tideWeeklyMeta) {
      tideWeeklyMeta.textContent = [place, station, coords, range, units].filter(Boolean).join(' | ');
    }

    if (tideWeeklySettings) {
      tideWeeklySettings.replaceChildren();
      addWeeklyChip(tideWeeklySettings, t('navdesk_weekly_charted'), formatDepthValue(weekly.settings?.charted_depth, units));
      addWeeklyChip(tideWeeklySettings, t('navdesk_weekly_draft'), formatDepthValue(weekly.settings?.draft, units));
      addWeeklyChip(tideWeeklySettings, t('navdesk_weekly_ukc'), formatDepthValue(weekly.settings?.ukc, units));
      addWeeklyChip(tideWeeklySettings, t('navdesk_weekly_required'), formatDepthValue(weekly.settings?.required_depth, units));
      addWeeklyChip(tideWeeklySettings, t('navdesk_weekly_formula'), `${t('navdesk_weekly_formula_text')}; ${t('navdesk_weekly_required_formula')}`);
    }

    renderWeeklySummary(weekly);
    renderWeeklySvg(weekly);
    renderWeeklyLegend();
    renderWeeklySource(weekly);
  };

  const parseClockToMinutes = (value) => {
    const v = String(value || '').trim();
    if (!/^\d{2}:\d{2}$/.test(v)) return null;
    const [hh, mm] = v.split(':').map(Number);
    return hh * 60 + mm;
  };

  const formatClock = (totalMinutes) => {
    const day = 24 * 60;
    let total = Number(totalMinutes);
    if (!Number.isFinite(total)) return '—';
    total = ((Math.round(total) % day) + day) % day;
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const interpolateClock = (fromMinutes, toMinutes, fraction) => {
    let end = toMinutes;
    if (end <= fromMinutes) end += 24 * 60;
    const point = fromMinutes + (end - fromMinutes) * fraction;
    return formatClock(point);
  };

  const manualDateWithMinutes = (baseDate, minutes, dayOffset = 0) => {
    const dt = new Date(baseDate);
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + dayOffset);
    dt.setMinutes(minutes);
    return dt;
  };

  const buildManualTideEvents = (lwTime, hwTime, lwLevel, hwLevel) => {
    const now = new Date();
    const events = [];

    for (let offset = -1; offset <= 2; offset += 1) {
      events.push({
        kind: 'LW',
        level: lwLevel,
        date: manualDateWithMinutes(now, lwTime, offset),
        timeText: formatClock(lwTime)
      });
      events.push({
        kind: 'HW',
        level: hwLevel,
        date: manualDateWithMinutes(now, hwTime, offset),
        timeText: formatClock(hwTime)
      });
    }

    return events.sort((a, b) => a.date - b.date);
  };

  const getManualTideMeta = ({ lwTime, hwTime, lwLevel, hwLevel, units }) => {
    const events = buildManualTideEvents(lwTime, hwTime, lwLevel, hwLevel);
    const now = new Date();

    const nextHigh = events.find((event) => event.kind === 'HW' && event.date > now) || null;
    const nextLow = events.find((event) => event.kind === 'LW' && event.date > now) || null;

    let prevEvent = null;
    let nextEvent = null;

    for (let i = 0; i < events.length; i += 1) {
      if (events[i].date <= now) prevEvent = events[i];
      if (events[i].date > now) {
        nextEvent = events[i];
        break;
      }
    }

    let trendText = '—';

    if (prevEvent && nextEvent && nextEvent.date > prevEvent.date && prevEvent.level !== nextEvent.level) {
      const fraction = (now.getTime() - prevEvent.date.getTime()) / (nextEvent.date.getTime() - prevEvent.date.getTime());
      const clamped = Math.max(0, Math.min(1, fraction));
      const currentLevel = prevEvent.level + (nextEvent.level - prevEvent.level) * clamped;

      const lang = getLang();
      const rising = nextEvent.level > prevEvent.level;
      const nextPointLabel = nextEvent.kind === 'HW' ? 'HW' : 'LW';

      if (lang === 'ru') {
        trendText = `${rising ? 'Подъём' : 'Спад'} · ~${currentLevel.toFixed(1)} ${units} · к ${nextPointLabel} ${nextEvent.timeText}`;
      } else {
        trendText = `${rising ? 'Rising' : 'Falling'} · ~${currentLevel.toFixed(1)} ${units} · to ${nextPointLabel} ${nextEvent.timeText}`;
      }
    }

    return {
      nextHighText: nextHigh ? nextHigh.timeText : '—',
      nextLowText: nextLow ? nextLow.timeText : '—',
      trendText
    };
  };

  const renderManualWindow = () => {
    const chartedDepthEl = document.getElementById('tideChartedDepth');
    const draftEl = document.getElementById('tideDraft');
    const ukcEl = document.getElementById('tideUkc');
    const units = document.getElementById('tideUnits')?.value || 'm';

    const chartedDepth = readNum(chartedDepthEl);
    const draft = readNum(draftEl);
    const ukc = readNum(ukcEl) ?? 0;

    const lwLevel = readNum(tideManualLwLevel);
    const hwLevel = readNum(tideManualHwLevel);
    const lwTimeStr = tideManualLwTime?.value || '';
    const hwTimeStr = tideManualHwTime?.value || '';
    const lwTime = parseClockToMinutes(lwTimeStr);
    const hwTime = parseClockToMinutes(hwTimeStr);

    const lang = getLang();

    const manualText = {
      ru: {
        invalidStatus: 'Ручной расчёт: проверьте данные',
        invalidMessage: 'Заполните глубину на карте, осадку, LW/HW уровни и время LW/HW.',
        passableStatus: 'Ручной расчёт: проход возможен',
        blockedStatus: 'Ручной расчёт: проход невозможен',
        allInterval: (lowLabel, lowTimeTxt, highLabel, highTimeTxt) =>
          `Глубины достаточно на всём введённом интервале от ${lowLabel} ${lowTimeTxt} до ${highLabel} ${highTimeTxt}. Время указано в local time искомого места.`,
        risingWindow: (crossTime, peakLabel, peakTimeTxt) =>
          `Ориентировочно проход возможен после ${crossTime}; максимум воды у ${peakLabel} в ${peakTimeTxt}. Время указано в local time искомого места.`,
        notEnough: (peakLabel, peakTimeTxt) =>
          `Даже в максимум воды у ${peakLabel} в ${peakTimeTxt} глубины недостаточно. Время указано в local time искомого места.`,
        lowLabel: 'LW',
        highLabel: 'HW'
      },
      en: {
        invalidStatus: 'Manual calculation: check the data',
        invalidMessage: 'Enter charted depth, draft, LW/HW levels, and LW/HW times.',
        passableStatus: 'Manual calculation: passage possible',
        blockedStatus: 'Manual calculation: passage not possible',
        allInterval: (lowLabel, lowTimeTxt, highLabel, highTimeTxt) =>
          `Depth is sufficient for the full entered interval from ${lowLabel} ${lowTimeTxt} to ${highLabel} ${highTimeTxt}. Time is shown in the local time of the selected place.`,
        risingWindow: (crossTime, peakLabel, peakTimeTxt) =>
          `Estimated passage possible after ${crossTime}; maximum water at ${peakLabel} ${peakTimeTxt}. Time is shown in the local time of the selected place.`,
        notEnough: (peakLabel, peakTimeTxt) =>
          `Even at maximum water at ${peakLabel} ${peakTimeTxt}, the depth is insufficient. Time is shown in the local time of the selected place.`,
        lowLabel: 'LW',
        highLabel: 'HW'
      }
    }[lang] || {
      invalidStatus: 'Manual calculation: check the data',
      invalidMessage: 'Enter charted depth, draft, LW/HW levels, and LW/HW times.',
      passableStatus: 'Manual calculation: passage possible',
      blockedStatus: 'Manual calculation: passage not possible',
      allInterval: (a, b, c, d) => `Depth is sufficient for the full entered interval from ${a} ${b} to ${c} ${d}.`,
      risingWindow: (a, b, c) => `Estimated passage possible after ${a}; maximum water at ${b} ${c}.`,
      notEnough: (a, b) => `Even at maximum water at ${a} ${b}, the depth is insufficient.`,
      lowLabel: 'LW',
      highLabel: 'HW'
    };

    const invalid =
      chartedDepth === null ||
      draft === null ||
      lwLevel === null ||
      hwLevel === null ||
      lwTime === null ||
      hwTime === null;

    if (invalid) {
      setWindowCardState('is-idle');
      if (tideWindowStatus) tideWindowStatus.textContent = manualText.invalidStatus;
      if (tideSafeWindow) tideSafeWindow.textContent = manualText.invalidMessage;
      if (tideRequiredDepth) tideRequiredDepth.textContent = draft !== null ? `${(draft + ukc).toFixed(1)} ${units}` : '—';
      if (tideMinDepth) tideMinDepth.textContent = '—';
      if (tideMaxDepth) tideMaxDepth.textContent = '—';
      setManualTideUiState();
      return;
    }

    const requiredDepth = draft + ukc;
    const minLevel = Math.min(lwLevel, hwLevel);
    const maxLevel = Math.max(lwLevel, hwLevel);
    const minAvailableDepth = chartedDepth + minLevel;
    const maxAvailableDepth = chartedDepth + maxLevel;

    const lowPoint =
      lwLevel <= hwLevel
        ? { label: manualText.lowLabel, time: lwTime, timeText: lwTimeStr, level: lwLevel }
        : { label: manualText.highLabel, time: hwTime, timeText: hwTimeStr, level: hwLevel };

    const highPoint =
      lwLevel > hwLevel
        ? { label: manualText.lowLabel, time: lwTime, timeText: lwTimeStr, level: lwLevel }
        : { label: manualText.highLabel, time: hwTime, timeText: hwTimeStr, level: hwLevel };

    if (tideRequiredDepth) tideRequiredDepth.textContent = `${requiredDepth.toFixed(1)} ${units}`;
    if (tideMinDepth) tideMinDepth.textContent = `${minAvailableDepth.toFixed(1)} ${units}`;
    if (tideMaxDepth) tideMaxDepth.textContent = `${maxAvailableDepth.toFixed(1)} ${units}`;

    setManualTideUiState();

    const manualMeta = getManualTideMeta({
      lwTime,
      hwTime,
      lwLevel,
      hwLevel,
      units
    });

    if (tideTrend) tideTrend.textContent = manualMeta.trendText;
    if (tideStation) tideStation.textContent = t('navdesk_tides_manual_station');

    if (requiredDepth <= minAvailableDepth) {
      setWindowCardState('is-passable');
      if (tideWindowStatus) tideWindowStatus.textContent = manualText.passableStatus;
      if (tideSafeWindow) tideSafeWindow.textContent = manualText.allInterval(
        lowPoint.label,
        lowPoint.timeText,
        highPoint.label,
        highPoint.timeText
      );
      return;
    }

    if (requiredDepth > maxAvailableDepth) {
      setWindowCardState('is-not-passable');
      if (tideWindowStatus) tideWindowStatus.textContent = manualText.blockedStatus;
      if (tideSafeWindow) tideSafeWindow.textContent = manualText.notEnough(
        highPoint.label,
        highPoint.timeText
      );
      return;
    }

    const requiredTideLevel = requiredDepth - chartedDepth;
    const fraction = (requiredTideLevel - lowPoint.level) / (highPoint.level - lowPoint.level);
    const crossingTime = interpolateClock(lowPoint.time, highPoint.time, fraction);

    setWindowCardState('is-passable');
    if (tideWindowStatus) tideWindowStatus.textContent = manualText.passableStatus;
    if (tideSafeWindow) {
      tideSafeWindow.textContent = manualText.risingWindow(
        crossingTime,
        highPoint.label,
        highPoint.timeText
      );
    }
  };

  if (tideModeAuto) tideModeAuto.addEventListener('change', updateTideModeUi);
  if (tideModeManual) tideModeManual.addEventListener('change', updateTideModeUi);
  updateTideModeUi();

  if (tidePlaceInput && tideSuggestions) {
    tidePlaceInput.setAttribute('aria-autocomplete', 'list');
    tidePlaceInput.setAttribute('aria-controls', 'tideSuggestions');
    tideSuggestions.setAttribute('role', 'listbox');

    tidePlaceInput.addEventListener('input', () => {
      if (isManualTideMode()) return;
      const q = tidePlaceInput.value.trim();
      tidePlaceSearchSeq += 1;

      if (tideSelectedPlace && q !== tideSelectedPlace.name) {
        clearSelectedTidePlace();
      }

      if (tidePlaceSearchTimer) {
        clearTimeout(tidePlaceSearchTimer);
        tidePlaceSearchTimer = null;
      }

      tideLastSearch = { query: q, results: [], status: '' };

      if (!q) {
        hideSuggestions();
        return;
      }

      if (q.length < TIDE_PLACE_MIN_QUERY) {
        renderSuggestionState(t('navdesk_tides_query_too_short'), 'idle');
        return;
      }

      const searchSeq = tidePlaceSearchSeq;
      renderSuggestionState(t('navdesk_tides_searching'), 'loading');
      tidePlaceSearchTimer = setTimeout(async () => {
        try {
          const search = await serverApi.searchTidesPlace(q);
          if (searchSeq !== tidePlaceSearchSeq) return;
          const results = Array.isArray(search.results) ? search.results.map(normalizeTidePlace) : [];
          tideLastSearch = { query: q, results, status: search.status || '' };

          if (!results.length) {
            renderSuggestionState(t('navdesk_tides_no_results'), search.status === 'fallback' ? 'fallback' : 'empty');
            return;
          }

          renderSuggestions(results, search.status === 'fallback'
            ? { message: t('navdesk_tides_search_fallback'), state: 'fallback' }
            : {});
        } catch (error) {
          if (searchSeq !== tidePlaceSearchSeq) return;
          console.error('NavDesk tide place search error:', error);
          tideLastSearch = { query: q, results: [], status: 'error' };
          renderSuggestionState(t('navdesk_tides_search_error'), 'error');
        }
      }, TIDE_PLACE_DEBOUNCE_MS);
    });

    tidePlaceInput.addEventListener('keydown', (event) => {
      if (tideSuggestions.hidden) return;
      const buttons = getSuggestionButtons();

      if (event.key === 'ArrowDown' && buttons.length) {
        event.preventDefault();
        setActiveSuggestion(tideActiveSuggestionIndex + 1);
        return;
      }

      if (event.key === 'ArrowUp' && buttons.length) {
        event.preventDefault();
        setActiveSuggestion(tideActiveSuggestionIndex - 1);
        return;
      }

      if (event.key === 'Enter' && tideActiveSuggestionIndex >= 0 && buttons[tideActiveSuggestionIndex]) {
        event.preventDefault();
        selectTideSuggestionButton(buttons[tideActiveSuggestionIndex]);
        return;
      }

      if (event.key === 'Escape') {
        hideSuggestions();
      }
    });

    tideSuggestions.addEventListener('click', (event) => {
      const btn = event.target.closest('.navdesk-suggestion');
      if (!btn) return;

      selectTideSuggestionButton(btn);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.navdesk-place-field')) {
        hideSuggestions();
      }
    });
  }

  if (tideRunBtn) {
    tideRunBtn.addEventListener('click', async () => {
      clearTideWeekly();

      if (isManualTideMode()) {
        renderManualWindow();
        return;
      }

      const place = tidePlaceInput?.value?.trim() || '';
      const date = document.getElementById('tideDate')?.value || new Date().toISOString().slice(0, 10);
      const units = document.getElementById('tideUnits')?.value || 'm';
      const charted_depth = document.getElementById('tideChartedDepth')?.value || '';
      const draft = document.getElementById('tideDraft')?.value || '';
      const ukc = document.getElementById('tideUkc')?.value || '';

      try {
        const selectedFromInput = getStoredTidePlace();
        let selected = selectedFromInput;

        if (!selected) {
          if (place.length < TIDE_PLACE_MIN_QUERY) {
            clearTideMeta();
            setWindowCardState('is-idle');
            if (tideWindowStatus) tideWindowStatus.textContent = t('tideWindowStatusIdle');
            if (tideSafeWindow) tideSafeWindow.textContent = place ? t('navdesk_tides_query_too_short') : t('navdesk_tides_select_place');
            if (tidePlaceholder) {
              tidePlaceholder.style.display = '';
              tidePlaceholder.textContent = t('navdesk_tides_select_place');
            }
            renderTableMessage(t('navdesk_tides_select_place'), 'is-idle');
            if (place) renderSuggestionState(t('navdesk_tides_query_too_short'), 'idle');
            else hideSuggestions();
            return;
          }

          setWindowCardState('is-loading');
          if (tideWindowStatus) tideWindowStatus.textContent = t('navdesk_window_status_loading') || t('tideWindowStatusIdle');
          if (tideSafeWindow) tideSafeWindow.textContent = t('navdesk_tides_searching') || t('tideWindow');
          renderTableMessage(t('navdesk_tides_searching'), 'is-loading');

          const canReuseSearch =
            tideLastSearch.query === place &&
            Array.isArray(tideLastSearch.results) &&
            (tideLastSearch.status === 'ok' || tideLastSearch.status === 'fallback');

          const search = canReuseSearch
            ? { results: tideLastSearch.results, status: tideLastSearch.status }
            : await serverApi.searchTidesPlace(place);

          const searchResults = Array.isArray(search.results)
            ? search.results.map(normalizeTidePlace).filter(hasTideCoordinates)
            : [];
          tideLastSearch = { query: place, results: searchResults, status: search.status || '' };

          if (!searchResults.length) {
            clearTideMeta();
            setWindowCardState('is-idle');
            if (tideWindowStatus) tideWindowStatus.textContent = t('tideWindowStatusIdle');
            if (tideSafeWindow) tideSafeWindow.textContent = t('navdesk_tides_no_results');
            if (tidePlaceholder) {
              tidePlaceholder.style.display = '';
              tidePlaceholder.textContent = t('navdesk_tides_no_results');
            }
            renderTableMessage(t('navdesk_tides_no_results'), 'is-error');
            renderSuggestionState(t('navdesk_tides_no_results'), search.status === 'fallback' ? 'fallback' : 'empty');
            return;
          }

          if (searchResults.length > 1) {
            clearTideMeta();
            setWindowCardState('is-idle');
            if (tideWindowStatus) tideWindowStatus.textContent = t('tideWindowStatusIdle');
            if (tideSafeWindow) tideSafeWindow.textContent = t('navdesk_tides_select_ambiguous');
            if (tidePlaceholder) {
              tidePlaceholder.style.display = '';
              tidePlaceholder.textContent = t('navdesk_tides_select_ambiguous');
            }
            renderTableMessage(t('navdesk_tides_select_ambiguous'), 'is-idle');
            renderSuggestions(searchResults, {
              message: search.status === 'fallback'
                ? t('navdesk_tides_search_fallback')
                : t('navdesk_tides_select_ambiguous'),
              state: search.status === 'fallback' ? 'fallback' : 'idle'
            });
            return;
          }

          selected = storeSelectedTidePlace(searchResults[0]);
          hideSuggestions();
        }

        if (!hasTideCoordinates(selected)) {
          clearSelectedTidePlace();
          clearTideMeta();
          setWindowCardState('is-idle');
          if (tideWindowStatus) tideWindowStatus.textContent = t('tideWindowStatusIdle');
          if (tideSafeWindow) tideSafeWindow.textContent = t('navdesk_tides_select_place');
          renderTableMessage(t('navdesk_tides_select_place'), 'is-idle');
          return;
        }

        setWindowCardState('is-loading');
        if (tideWindowStatus) tideWindowStatus.textContent = t('navdesk_window_status_loading') || t('tideWindowStatusIdle');
        tideSafeWindow.textContent = t('navdesk_tides_loading') || t('tideWindow');
        renderTableMessage(t('navdesk_tides_loading'), 'is-loading');
        setWeeklyLoading();

        const forecast = await serverApi.fetchTidesForecast({
          lat: selected.lat,
          lon: selected.lon,
          date,
          units,
          place: selected.name
        });

        renderForecast(forecast);

        const normalizedUkc = String(ukc).trim() === '' ? '0' : ukc;
        const weeklyDepth = String(charted_depth).trim() === '' ? '0' : charted_depth;
        const weeklyDraft = String(draft).trim() === '' ? '0' : draft;

        const hasWindowInputs =
          String(charted_depth).trim() !== '' &&
          String(draft).trim() !== '';

        if (hasWindowInputs) {
          const windowData = await serverApi.fetchSafeWindow({
            lat: selected.lat,
            lon: selected.lon,
            date,
            units,
            charted_depth,
            draft,
            ukc: normalizedUkc
          });
          renderWindow(windowData);
        } else {
          setWindowCardState('is-idle');
          if (tideWindowStatus) tideWindowStatus.textContent = t('tideWindowStatusIdle');
          tideSafeWindow.textContent = t('tideWindow');
        }

        try {
          const weekly = await serverApi.fetchWeeklyTides({
            lat: selected.lat,
            lon: selected.lon,
            date,
            units,
            place: selected.name,
            charted_depth: weeklyDepth,
            draft: weeklyDraft,
            ukc: normalizedUkc
          });
          renderWeeklyGraph(weekly);
        } catch (weeklyError) {
          console.error('NavDesk tide weekly graph error:', weeklyError);
          renderWeeklyError(t('navdesk_weekly_error'));
        }
      } catch (error) {
        console.error('NavDesk tide demo error:', error);
        tideNextHigh.textContent = '—';
        tideNextLow.textContent = '—';
        tideTrend.textContent = '—';
        tideStation.textContent = '—';
        clearTideWeekly();
        setWindowCardState('is-not-passable');
        if (tideWindowStatus) tideWindowStatus.textContent = t('navdesk_tides_error');
        tideSafeWindow.textContent = t('navdesk_tides_error');
        if (tidePlaceholder) {
          tidePlaceholder.style.display = '';
          tidePlaceholder.textContent = t('navdesk_tides_error');
        }
        renderTableMessage(t('navdesk_tides_error'), 'is-error');
      }
    });
  }

  if (tideWeeklyPrint) {
    tideWeeklyPrint.addEventListener('click', () => {
      if (!tideWeeklyReport || tideWeeklyReport.hidden) return;
      document.body.classList.add('navdesk-tides-printing');
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove('navdesk-tides-printing');
      }, 1200);
    });
  }

  window.addEventListener('afterprint', () => {
    document.body.classList.remove('navdesk-tides-printing');
  });



  const routeRoot = document.getElementById('routeCalc');

  if (routeRoot) {
    const routeCoordFormat = routeRoot.querySelector('#routeCoordFormat');
    const routeMarineBlocks = Array.from(routeRoot.querySelectorAll('.navdesk-route__marine'));
    const routeDecimalBlocks = Array.from(routeRoot.querySelectorAll('.navdesk-route__decimal'));

    const routeStepNm = routeRoot.querySelector('#routeStepNm');

    const routeLoadAtlantic =
      routeRoot.querySelector('#routeLoadAtlantic') ||
      Array.from(routeRoot.querySelectorAll('button')).find((btn) => /Las\s*Palmas/i.test(btn.textContent || ''));

    const routeLoadPacific =
      routeRoot.querySelector('#routeLoadPacific') ||
      Array.from(routeRoot.querySelectorAll('button')).find((btn) => /Panama|Nuku\s*Hiva/i.test(btn.textContent || ''));

    const routeCalcRun =
      routeRoot.querySelector('#routeCalcRun') ||
      routeRoot.querySelector('#routeCalcOrthodrome') ||
      routeRoot.querySelector('button.btn--primary');

    const routeReset =
      routeRoot.querySelector('#routeReset') ||
      routeRoot.querySelector('#routeCalcReset') ||
      Array.from(routeRoot.querySelectorAll('button')).find((btn) => /Сброс|Reset/i.test(btn.textContent || ''));
    const routePrintPdf = routeRoot.querySelector('#routePrintPdf');

    const routeStatus = routeRoot.querySelector('#routeStatus') || routeRoot.querySelector('.navdesk-calc__status');
    const routeResults = routeRoot.querySelector('#routeResults') || routeRoot.querySelector('#routeResult') || routeRoot.querySelector('.navdesk-route__results, .navdesk-route__result');
    const routeTableBody = routeRoot.querySelector('#routeTableBody') || routeRoot.querySelector('tbody');
    const routeOrthoDistanceEl = routeRoot.querySelector('#routeOrthoDistance');
    const routeOrthoInitialEl = routeRoot.querySelector('#routeOrthoInitial');
    const routeOrthoFinalEl = routeRoot.querySelector('#routeOrthoFinal');
    const routeRhumbDistanceEl = routeRoot.querySelector('#routeRhumbDistance');
    const routeRhumbCourseEl = routeRoot.querySelector('#routeRhumbCourse');

    const summaryCards = Array.from(routeRoot.querySelectorAll('.navdesk-route__summary-card'));
    const gcCard = summaryCards[0] || null;
    const rlCard = summaryCards[1] || null;

    const deg2rad = (deg) => deg * Math.PI / 180;
    const rad2deg = (rad) => rad * 180 / Math.PI;
    const normalizeCourse = (deg) => ((deg % 360) + 360) % 360;
    const earthRadiusNm = 3440.065;
    let lastRouteReport = null;

    const formatNm = (value) => `${value.toFixed(1)} nm`;
    const formatCourse = (value) => `${normalizeCourse(value).toFixed(1)}°T`;
    const escapeRouteHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const padLatDeg = (value) => String(Math.round(value)).padStart(2, '0');
    const padLonDeg = (value) => String(Math.round(value)).padStart(3, '0');
    const formatMinutes = (value) => Number(value).toFixed(1);

    const formatMarineLat = (lat) => {
      const hem = lat >= 0 ? 'N' : 'S';
      const abs = Math.abs(lat);
      const deg = Math.floor(abs);
      const min = (abs - deg) * 60;
      return `${padLatDeg(deg)}° ${formatMinutes(min)}' ${hem}`;
    };

    const formatMarineLon = (lon) => {
      const hem = lon >= 0 ? 'E' : 'W';
      const abs = Math.abs(lon);
      const deg = Math.floor(abs);
      const min = (abs - deg) * 60;
      return `${padLonDeg(deg)}° ${formatMinutes(min)}' ${hem}`;
    };

    const readNum = (id) => {
      const el = routeRoot.querySelector(`#${id}`);
      const v = Number(String(el?.value || '').trim().replace(',', '.'));
      return Number.isFinite(v) ? v : null;
    };

    const getMarineCoord = (degId, minId, hemId, isLat) => {
      const deg = readNum(degId);
      const min = readNum(minId);
      const hem = routeRoot.querySelector(`#${hemId}`)?.value || (isLat ? 'N' : 'E');

      if (deg === null || min === null) return null;
      if (deg < 0 || min < 0 || min >= 60) return null;
      if (isLat && deg > 90) return null;
      if (!isLat && deg > 180) return null;

      const sign = (hem === 'S' || hem === 'W') ? -1 : 1;
      return sign * (deg + min / 60);
    };

    const getDecimalCoord = (id, isLat) => {
      const value = readNum(id);
      if (value === null) return null;
      if (isLat && (value < -90 || value > 90)) return null;
      if (!isLat && (value < -180 || value > 180)) return null;
      return value;
    };

    const getRoutePoints = () => {
      const format = routeCoordFormat?.value || 'marine';

      if (format === 'decimal') {
        const fromLat = getDecimalCoord('routeFromLatDecimal', true);
        const fromLon = getDecimalCoord('routeFromLonDecimal', false);
        const toLat = getDecimalCoord('routeToLatDecimal', true);
        const toLon = getDecimalCoord('routeToLonDecimal', false);
        if ([fromLat, fromLon, toLat, toLon].some((v) => v === null)) return null;
        return { fromLat, fromLon, toLat, toLon };
      }

      const fromLat = getMarineCoord('routeFromLatDeg', 'routeFromLatMin', 'routeFromLatHem', true);
      const fromLon = getMarineCoord('routeFromLonDeg', 'routeFromLonMin', 'routeFromLonHem', false);
      const toLat = getMarineCoord('routeToLatDeg', 'routeToLatMin', 'routeToLatHem', true);
      const toLon = getMarineCoord('routeToLonDeg', 'routeToLonMin', 'routeToLonHem', false);
      if ([fromLat, fromLon, toLat, toLon].some((v) => v === null)) return null;
      return { fromLat, fromLon, toLat, toLon };
    };

    const greatCircleDistanceNm = (lat1, lon1, lat2, lon2) => {
      const φ1 = deg2rad(lat1);
      const φ2 = deg2rad(lat2);
      const Δφ = deg2rad(lat2 - lat1);
      const Δλ = deg2rad(lon2 - lon1);
      const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadiusNm * c;
    };

    const greatCircleInitialCourse = (lat1, lon1, lat2, lon2) => {
      const φ1 = deg2rad(lat1);
      const φ2 = deg2rad(lat2);
      const λ1 = deg2rad(lon1);
      const λ2 = deg2rad(lon2);
      const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
      return normalizeCourse(rad2deg(Math.atan2(y, x)));
    };

    const rhumbDistanceCourse = (lat1, lon1, lat2, lon2) => {
      const φ1 = deg2rad(lat1);
      const φ2 = deg2rad(lat2);
      let Δλ = deg2rad(lon2 - lon1);
      const Δφ = φ2 - φ1;

      if (Math.abs(Δλ) > Math.PI) {
        Δλ = Δλ > 0 ? -(2 * Math.PI - Δλ) : (2 * Math.PI + Δλ);
      }

      const Δψ = Math.log(Math.tan(Math.PI / 4 + φ2 / 2) / Math.tan(Math.PI / 4 + φ1 / 2));
      const q = Math.abs(Δψ) > 1e-12 ? Δφ / Δψ : Math.cos(φ1);
      const dist = Math.sqrt(Δφ * Δφ + q * q * Δλ * Δλ) * earthRadiusNm;
      const bearing = normalizeCourse(rad2deg(Math.atan2(Δλ, Δψ)));
      return { distance: dist, course: bearing };
    };

    const interpolateGC = (lat1, lon1, lat2, lon2, fraction) => {
      const φ1 = deg2rad(lat1), λ1 = deg2rad(lon1);
      const φ2 = deg2rad(lat2), λ2 = deg2rad(lon2);
      const d = greatCircleDistanceNm(lat1, lon1, lat2, lon2) / earthRadiusNm;

      if (d === 0) return { lat: lat1, lon: lon1 };

      const A = Math.sin((1 - fraction) * d) / Math.sin(d);
      const B = Math.sin(fraction * d) / Math.sin(d);

      const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
      const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
      const z = A * Math.sin(φ1) + B * Math.sin(φ2);

      const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
      const λi = Math.atan2(y, x);

      return { lat: rad2deg(φi), lon: rad2deg(λi) };
    };

    const setCardValue = (card, labelPattern, value) => {
      if (!card) return;
      const p = Array.from(card.querySelectorAll('p')).find((node) => labelPattern.test(node.textContent || ''));
      if (!p) return;

      const valueSpan = p.querySelector('span[id]');
      if (valueSpan) {
        valueSpan.textContent = value;
        return;
      }

      const strong = p.querySelector('strong');
      if (strong) {
        p.innerHTML = `${strong.outerHTML} ${value}`;
      } else {
        const label = (p.textContent || '').split(':')[0] || '';
        p.textContent = `${label}: ${value}`;
      }
    };

    const renderRouteTable = (rows) => {
      if (!routeTableBody) return;

      if (!rows.length) {
        routeTableBody.innerHTML = `<tr><td colspan="5">${t('navdesk_route_table_empty')}</td></tr>`;
        return;
      }

      routeTableBody.innerHTML = rows.map((row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${formatMarineLat(row.lat)}</td>
          <td>${formatMarineLon(row.lon)}</td>
          <td>${row.course != null ? formatCourse(row.course) : '—'}</td>
          <td>${row.distance != null ? formatNm(row.distance) : '—'}</td>
        </tr>
      `).join('');
    };

    const setRoutePrintReady = (ready) => {
      if (routePrintPdf) routePrintPdf.disabled = !ready;
    };

    const clearRouteSummary = () => {
      if (routeOrthoDistanceEl) routeOrthoDistanceEl.textContent = '—';
      if (routeOrthoInitialEl) routeOrthoInitialEl.textContent = '—';
      if (routeOrthoFinalEl) routeOrthoFinalEl.textContent = '—';
      if (routeRhumbDistanceEl) routeRhumbDistanceEl.textContent = '—';
      if (routeRhumbCourseEl) routeRhumbCourseEl.textContent = '—';

      setCardValue(gcCard, /Расстояние|Distance/i, '—');
      setCardValue(gcCard, /Начальный|Initial/i, '—');
      setCardValue(gcCard, /Конечный|Final/i, '—');
      setCardValue(rlCard, /Расстояние|Distance/i, '—');
      setCardValue(rlCard, /Constant|курс|course/i, '—');
    };

    const buildRoutePrintBody = (report) => {
      const generated = new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const rowsHtml = report.rows.map((row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeRouteHtml(formatMarineLat(row.lat))}</td>
          <td>${escapeRouteHtml(formatMarineLon(row.lon))}</td>
          <td>${escapeRouteHtml(row.course != null ? formatCourse(row.course) : '—')}</td>
          <td>${escapeRouteHtml(row.distance != null ? formatNm(row.distance) : '—')}</td>
        </tr>
      `).join('');

      return `
        <style>
          .header { gap:10px; padding-bottom:5px; }
          .logo { width:172px; }
          .title { font-size:21px; }
          .subtitle { margin-top:2px; font-size:9.6px; max-width:118mm; }
          .motto { padding-top:3px; font-size:10px; }
          .route-print-top { display:grid; grid-template-columns:1.15fr 1fr 1fr; gap:5px; margin-top:6px; }
          .route-print-summary { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:5px; }
          .route-print-top .block,
          .route-print-summary .block { padding:5px 6px; }
          .route-print-top .block h2,
          .route-print-summary .block h2,
          .route-print-table-block h2 { margin-bottom:3px; font-size:10.2px; }
          .route-print-table-block { break-inside:auto; page-break-inside:auto; padding:5px 6px; }
          .route-print-table { width:100%; border-collapse:collapse; table-layout:fixed; margin-top:4px; font-size:7.7px; line-height:1.08; }
          .route-print-table th, .route-print-table td { border:1px solid rgba(16,36,58,.16); padding:1.7px 3px; text-align:left; vertical-align:top; }
          .route-print-table th { background:#f4f0e7; color:#10243a; font-size:7.2px; text-transform:uppercase; letter-spacing:.04em; }
          .route-print-table tr { break-inside:avoid; page-break-inside:avoid; }
          .route-print-note { margin:4px 0 0; font-size:7.6px; color:rgba(16,36,58,.66); }
          .footer { margin-top:5px; padding-top:4px; }
          @media print { .route-print-top { grid-template-columns:1.15fr 1fr 1fr; } }
        </style>
        <section class="route-print-top">
          <div class="block">
            <h2>Расчет маршрута</h2>
            <div class="meta">
              <div><span class="label">Дата расчета</span><span class="value">${escapeRouteHtml(generated)}</span></div>
              <div><span class="label">Шаг точек</span><span class="value">${escapeRouteHtml(formatNm(report.stepNm))}</span></div>
            </div>
          </div>
          <div class="block">
            <h2>From</h2>
            <div class="meta">
              <div><span class="label">Широта</span><span class="value">${escapeRouteHtml(formatMarineLat(report.fromLat))}</span></div>
              <div><span class="label">Долгота</span><span class="value">${escapeRouteHtml(formatMarineLon(report.fromLon))}</span></div>
            </div>
          </div>
          <div class="block">
            <h2>To</h2>
            <div class="meta">
              <div><span class="label">Широта</span><span class="value">${escapeRouteHtml(formatMarineLat(report.toLat))}</span></div>
              <div><span class="label">Долгота</span><span class="value">${escapeRouteHtml(formatMarineLon(report.toLon))}</span></div>
            </div>
          </div>
        </section>
        <section class="route-print-summary">
          <div class="block">
            <h2>Ортодромия</h2>
            <div class="meta">
              <div><span class="label">Расстояние</span><span class="value">${escapeRouteHtml(formatNm(report.gcDistance))}</span></div>
              <div><span class="label">Начальный курс</span><span class="value">${escapeRouteHtml(formatCourse(report.gcInitial))}</span></div>
              <div><span class="label">Конечный курс</span><span class="value">${escapeRouteHtml(formatCourse(report.gcFinal))}</span></div>
            </div>
          </div>
          <div class="block">
            <h2>Локсодромия</h2>
            <div class="meta">
              <div><span class="label">Расстояние</span><span class="value">${escapeRouteHtml(formatNm(report.rhumbDistance))}</span></div>
              <div><span class="label">Постоянный курс</span><span class="value">${escapeRouteHtml(formatCourse(report.rhumbCourse))}</span></div>
            </div>
          </div>
        </section>
        <section class="flow">
          <div class="block route-print-table-block">
            <h2>Точки ортодромии</h2>
            <table class="route-print-table">
              <thead>
                <tr>
                  <th>Точка</th>
                  <th>Широта</th>
                  <th>Долгота</th>
                  <th>Истинный курс</th>
                  <th>От старта, nm</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <p class="route-print-note">Навигационный расчет является вспомогательным и требует проверки по актуальным картам, погоде и Notices to Mariners.</p>
          </div>
        </section>`;
    };

    const printRouteReport = () => {
      if (!lastRouteReport || !lastRouteReport.rows?.length) {
        if (routeStatus) routeStatus.textContent = t('navdesk_route_print_need_results');
        return;
      }

      const printer = window.NavDeskPrint;
      if (!printer?.printFromHtml) {
        window.print();
        return;
      }

      printer.printFromHtml({
        title: 'NavDesk Route',
        subtitle: 'Ортодромия / локсодромия, курсы и точки маршрута.',
        bodyHtml: buildRoutePrintBody(lastRouteReport),
        pageSize: 'A4 landscape',
        footerLeft: 'Vetus Nauta - Brkovic',
        footerRight: 'NavDesk Route'
      });
    };

    const calculateRoute = () => {
      const points = getRoutePoints();
      if (!points) {
        if (routeStatus) routeStatus.textContent = t('navdesk_route_error');
        if (routeResults) routeResults.hidden = false;
        lastRouteReport = null;
        setRoutePrintReady(false);
        clearRouteSummary();
        renderRouteTable([]);
        return;
      }

      const { fromLat, fromLon, toLat, toLon } = points;

      const gcDistance = greatCircleDistanceNm(fromLat, fromLon, toLat, toLon);
      if (gcDistance < 0.01) {
        if (routeStatus) routeStatus.textContent = t('navdesk_route_same_points');
        if (routeResults) routeResults.hidden = false;
        lastRouteReport = null;
        setRoutePrintReady(false);
        clearRouteSummary();
        renderRouteTable([]);
        return;
      }

      const gcInitial = greatCircleInitialCourse(fromLat, fromLon, toLat, toLon);
      const gcFinal = normalizeCourse(greatCircleInitialCourse(toLat, toLon, fromLat, fromLon) + 180);
      const rl = rhumbDistanceCourse(fromLat, fromLon, toLat, toLon);

      const stepNm = Math.max(10, Number(routeStepNm?.value || 120));
      const legs = Math.max(1, Math.ceil(gcDistance / stepNm));

      const rows = Array.from({ length: legs + 1 }, (_, i) => {
        const f = i / legs;
        const point = interpolateGC(fromLat, fromLon, toLat, toLon, f);
        let course = null;
        if (i < legs) {
          const nextPoint = interpolateGC(fromLat, fromLon, toLat, toLon, Math.min(1, (i + 1) / legs));
          course = greatCircleInitialCourse(point.lat, point.lon, nextPoint.lat, nextPoint.lon);
        }
        return {
          lat: point.lat,
          lon: point.lon,
          course,
          distance: gcDistance * f
        };
      });

      if (routeOrthoDistanceEl) routeOrthoDistanceEl.textContent = formatNm(gcDistance);
      if (routeOrthoInitialEl) routeOrthoInitialEl.textContent = formatCourse(gcInitial);
      if (routeOrthoFinalEl) routeOrthoFinalEl.textContent = formatCourse(gcFinal);
      if (routeRhumbDistanceEl) routeRhumbDistanceEl.textContent = formatNm(rl.distance);
      if (routeRhumbCourseEl) routeRhumbCourseEl.textContent = formatCourse(rl.course);

      setCardValue(gcCard, /Расстояние|Distance/i, formatNm(gcDistance));
      setCardValue(gcCard, /Начальный|Initial/i, formatCourse(gcInitial));
      setCardValue(gcCard, /Конечный|Final/i, formatCourse(gcFinal));
      setCardValue(rlCard, /Расстояние|Distance/i, formatNm(rl.distance));
      setCardValue(rlCard, /Constant|курс|course/i, formatCourse(rl.course));

      if (routeStatus) routeStatus.textContent = `${t('navdesk_route_mode_gc')} / ${t('navdesk_route_mode_rl')}`;
      if (routeResults) routeResults.hidden = false;
      renderRouteTable(rows);
      lastRouteReport = {
        fromLat,
        fromLon,
        toLat,
        toLon,
        stepNm,
        gcDistance,
        gcInitial,
        gcFinal,
        rhumbDistance: rl.distance,
        rhumbCourse: rl.course,
        rows
      };
      setRoutePrintReady(true);
    };

    const resetRoute = () => {
      [
        'routeFromLatDeg','routeFromLatMin','routeFromLonDeg','routeFromLonMin',
        'routeToLatDeg','routeToLatMin','routeToLonDeg','routeToLonMin',
        'routeFromLatDecimal','routeFromLonDecimal','routeToLatDecimal','routeToLonDecimal'
      ].forEach((id) => {
        const el = routeRoot.querySelector(`#${id}`);
        if (el) el.value = '';
      });

      ['routeFromLatHem','routeToLatHem'].forEach((id) => {
        const el = routeRoot.querySelector(`#${id}`);
        if (el) el.value = 'N';
      });

      ['routeFromLonHem','routeToLonHem'].forEach((id) => {
        const el = routeRoot.querySelector(`#${id}`);
        if (el) el.value = 'W';
      });

      if (routeCoordFormat) routeCoordFormat.value = 'marine';
      routeMarineBlocks.forEach((el) => { el.hidden = false; });
      routeDecimalBlocks.forEach((el) => { el.hidden = true; });
      if (routeStepNm) routeStepNm.value = '120';

      if (routeStatus) routeStatus.textContent = t('navdesk_route_status_idle');
      if (routeResults) routeResults.hidden = false;
      lastRouteReport = null;
      setRoutePrintReady(false);
      clearRouteSummary();
      renderRouteTable([]);
    };

    const loadAtlanticDemo = () => {
      if (routeCoordFormat) routeCoordFormat.value = 'marine';
      routeMarineBlocks.forEach((el) => { el.hidden = false; });
      routeDecimalBlocks.forEach((el) => { el.hidden = true; });

      routeRoot.querySelector('#routeFromLatDeg').value = '28';
      routeRoot.querySelector('#routeFromLatMin').value = '7.7';
      routeRoot.querySelector('#routeFromLatHem').value = 'N';
      routeRoot.querySelector('#routeFromLonDeg').value = '015';
      routeRoot.querySelector('#routeFromLonMin').value = '25.8';
      routeRoot.querySelector('#routeFromLonHem').value = 'W';

      routeRoot.querySelector('#routeToLatDeg').value = '14';
      routeRoot.querySelector('#routeToLatMin').value = '4.0';
      routeRoot.querySelector('#routeToLatHem').value = 'N';
      routeRoot.querySelector('#routeToLonDeg').value = '060';
      routeRoot.querySelector('#routeToLonMin').value = '57.0';
      routeRoot.querySelector('#routeToLonHem').value = 'W';

      if (routeStepNm) routeStepNm.value = '120';
    };

    const loadPacificDemo = () => {
      if (routeCoordFormat) routeCoordFormat.value = 'marine';
      routeMarineBlocks.forEach((el) => { el.hidden = false; });
      routeDecimalBlocks.forEach((el) => { el.hidden = true; });

      routeRoot.querySelector('#routeFromLatDeg').value = '08';
      routeRoot.querySelector('#routeFromLatMin').value = '57.0';
      routeRoot.querySelector('#routeFromLatHem').value = 'N';
      routeRoot.querySelector('#routeFromLonDeg').value = '079';
      routeRoot.querySelector('#routeFromLonMin').value = '33.0';
      routeRoot.querySelector('#routeFromLonHem').value = 'W';

      routeRoot.querySelector('#routeToLatDeg').value = '08';
      routeRoot.querySelector('#routeToLatMin').value = '54.0';
      routeRoot.querySelector('#routeToLatHem').value = 'S';
      routeRoot.querySelector('#routeToLonDeg').value = '140';
      routeRoot.querySelector('#routeToLonMin').value = '06.0';
      routeRoot.querySelector('#routeToLonHem').value = 'W';

      if (routeStepNm) routeStepNm.value = '180';
    };

    if (routeCoordFormat) {
      routeCoordFormat.addEventListener('change', () => {
        const isMarine = routeCoordFormat.value === 'marine';
        routeMarineBlocks.forEach((el) => { el.hidden = !isMarine; });
        routeDecimalBlocks.forEach((el) => { el.hidden = isMarine; });
      });
    }

    if (routeLoadAtlantic) routeLoadAtlantic.addEventListener('click', loadAtlanticDemo);
  if (routeLoadPacific) routeLoadPacific.addEventListener('click', loadPacificDemo);
    if (routeCalcRun) routeCalcRun.addEventListener('click', calculateRoute);
    if (routeReset) routeReset.addEventListener('click', resetRoute);
    if (routePrintPdf) routePrintPdf.addEventListener('click', printRouteReport);

    if (routeResults) routeResults.hidden = false;
    setRoutePrintReady(false);
    clearRouteSummary();
    renderRouteTable([]);
  }


  const initCollapsibleCard = (shellId, toggleId, bodyId, pinId) => {
    const shell = document.getElementById(shellId);
    const toggle = document.getElementById(toggleId);
    const body = document.getElementById(bodyId);
    const pin = document.getElementById(pinId);
    if (!shell || !toggle || !body) return;

    const storageKey = `navdeskCardState:${shellId}`;
    const forceOpen = shell.hasAttribute('data-navdesk-force-open');

    const saveState = (state) => {
      try {
        localStorage.setItem(storageKey, state);
      } catch (e) {}
    };

    const openCard = (save = true) => {
      shell.classList.remove('is-collapsed');
      shell.classList.add('is-open');
      body.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (save) saveState(shell.classList.contains('is-pinned') ? 'pinned' : 'open');
    };

    const closeCard = (save = true) => {
      if (shell.classList.contains('is-pinned')) return;
      shell.classList.remove('is-open');
      shell.classList.add('is-collapsed');
      body.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (save) saveState('closed');
    };

    const setPinned = (value, save = true) => {
      if (!pin) return;
      shell.classList.toggle('is-pinned', value);
      pin.setAttribute('aria-pressed', value ? 'true' : 'false');
      if (value) {
        openCard(false);
        if (save) saveState('pinned');
      } else if (save) {
        saveState(shell.classList.contains('is-open') ? 'open' : 'closed');
      }
    };

    if (forceOpen) {
      openCard(false);
      if (pin) pin.setAttribute('aria-pressed', 'false');
    } else {
      closeCard(false);

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'pinned') {
          setPinned(true, false);
        } else if (saved === 'open') {
          openCard(false);
        } else {
          closeCard(false);
        }
      } catch (e) {
        closeCard(false);
      }
    }

    toggle.addEventListener('click', () => {
      if (forceOpen) {
        openCard(false);
        return;
      }
      const isOpen = shell.classList.contains('is-open');
      if (isOpen) {
        closeCard();
      } else {
        openCard();
      }
    });

    if (pin) {
      pin.addEventListener('click', () => {
        if (forceOpen) {
          openCard(false);
          pin.setAttribute('aria-pressed', 'false');
          return;
        }
        const pinned = shell.classList.contains('is-pinned');
        setPinned(!pinned);
      });
    }
  };

  initCollapsibleCard('navdesk-passages-card', 'navdesk_passage_toggle', 'navdesk_passage_body', 'navdesk_passage_pin');
  initCollapsibleCard('navdesk-tides-card', 'navdesk_tides_toggle', 'navdesk_tides_body', 'navdesk_tides_pin');
  initCollapsibleCard('navdesk-route-card', 'navdesk_route_toggle', 'navdesk_route_body', 'navdesk_route_pin');
  initCollapsibleCard('navdesk-ukv-card', 'navdesk_ukv_toggle', 'navdesk_ukv_body', 'navdesk_ukv_pin');

  const ukvSpellingInput = document.getElementById('ukvSpellingInput');
  const ukvSpellingRun = document.getElementById('ukvSpellingRun');
  const ukvSpellingCopy = document.getElementById('ukvSpellingCopy');
  const ukvSpellingStatus = document.getElementById('ukvSpellingStatus');
  const ukvSpellingResult = document.getElementById('ukvSpellingResult');
  if (ukvSpellingResult) {
    ukvSpellingResult.textContent = '';
  }


  const spellingMap = {
    A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
    F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
    K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
    P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
    U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee',
    Z: 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
    '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
  };

  const convertUkvSpelling = (input) => {
    const groups = String(input || '')
      .trim()
      .toUpperCase()
      .split(/\s+/)
      .filter(Boolean);

    return groups.map((group) => {
      const parts = [];
      for (const ch of group) {
        if (spellingMap[ch]) {
          parts.push(spellingMap[ch]);
        } else if (/[A-Z0-9]/.test(ch)) {
          parts.push(ch);
        } else if (ch === '-' || ch === '/' || ch === '.') {
          parts.push(ch);
        }
      }
      return parts.join(' ');
    }).join(' / ');
  };

  const runUkvSpelling = async (copyAfter = false) => {
    if (!ukvSpellingInput || !ukvSpellingResult || !ukvSpellingStatus) return;

    const raw = String(ukvSpellingInput.value || '').trim();
    if (!raw) {
      ukvSpellingResult.textContent = '';
      ukvSpellingStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_spelling_status_empty') : '') || 'Enter a word, call sign, or number first.';
      return;
    }

    const converted = convertUkvSpelling(raw);
    ukvSpellingResult.innerHTML = toFlagSpellingHtml(raw);
    ukvSpellingResult.dataset.copyText = converted;
    ukvSpellingStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_spelling_status_done') : '') || 'Conversion complete.';

    if (copyAfter && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(converted);
        ukvSpellingStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_spelling_status_copied') : '') || 'Result copied.';
      } catch (e) {}
    }
  };

  if (ukvSpellingRun) {
    ukvSpellingRun.addEventListener('click', () => runUkvSpelling(false));
  }

  if (ukvSpellingCopy) {
    ukvSpellingCopy.addEventListener('click', () => runUkvSpelling(true));
  }

  if (ukvSpellingInput) {
    ukvSpellingInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runUkvSpelling(false);
      }
    });
  }

  const ukvProfileFields = {
    vesselType: document.getElementById('ukvVesselType'),
    vesselName: document.getElementById('ukvVesselName'),
    registration: document.getElementById('ukvRegistration'),
    callSign: document.getElementById('ukvCallSign'),
    mmsi: document.getElementById('ukvMmsi'),
    imo: document.getElementById('ukvImo'),
    departurePort: document.getElementById('ukvDeparturePort'),
    arrivalPort: document.getElementById('ukvArrivalPort'),
    length: document.getElementById('ukvLength'),
    beam: document.getElementById('ukvBeam'),
    passengers: document.getElementById('ukvPassengers'),
    crew: document.getElementById('ukvCrew')
  };

  const ukvSpellTargets = {
    vesselName: document.getElementById('ukvSpellVesselName'),
    callSign: document.getElementById('ukvSpellCallSign'),
    departurePort: document.getElementById('ukvSpellDeparturePort'),
    arrivalPort: document.getElementById('ukvSpellArrivalPort')
  };

  const ukvProfileApply = document.getElementById('ukvProfileApply');
  const ukvProfileSave = document.getElementById('ukvProfileSave');
  const ukvProfileReset = document.getElementById('ukvProfileReset');
  const ukvProfileEdit = document.getElementById('ukvProfileEdit');
  const ukvProfileStatus = document.getElementById('ukvProfileStatus');
  const ukvProfileSummary = document.getElementById('ukvProfileSummary');
  const ukvProfileSummaryLine = document.getElementById('ukvProfileSummaryLine');
  const ukvProfileSummaryName = document.getElementById('ukvProfileSummaryName');
  const ukvProfileSummaryNameSpell = document.getElementById('ukvProfileSummaryNameSpell');
  const ukvProfileSummaryCall = document.getElementById('ukvProfileSummaryCall');
  const ukvProfileSummaryCallSpell = document.getElementById('ukvProfileSummaryCallSpell');
  const ukvVesselCard = document.querySelector('.navdesk-ukv-vessel');

  const ukvScenarioToggles = Array.from(document.querySelectorAll('.navdesk-ukv-scenario__toggle'));

  const UKV_PROFILE_STORAGE_KEY = 'navdesk_ukv_profile_v1';
  const UKV_PROFILE_COLLAPSED_KEY = 'navdesk_ukv_profile_collapsed_v2';

  const ukvDemoProfile = {
    vesselType: 'sailing yacht',
    vesselName: 'Aurora',
    registration: '4O-AX-27',
    callSign: '4OAX27',
    mmsi: '278000123',
    imo: '',
    departurePort: 'Kotor',
    arrivalPort: 'Dubrovnik',
    length: '14.2',
    beam: '4.3',
    passengers: '4',
    crew: '2'
  };

  const escapeUkvHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const toPlainSpelling = (value) => {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return '—';
    const parts = [];
    for (const ch of raw) {
      if (spellingMap[ch]) parts.push(spellingMap[ch]);
      else if (ch === ' ') parts.push('/');
    }
    return parts.join(' ') || '—';
  };

  const toFlagSpellingHtml = (value) => {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return '<span class="navdesk-ukv-flagspelling__empty">—</span>';

    const items = [];

    for (const ch of raw) {
      if (spellingMap[ch]) {
        const word = spellingMap[ch];
        const type = /[0-9]/.test(ch) ? 'digit' : 'letter';
        items.push(`<span class="navdesk-ukv-flagchip navdesk-ukv-flagchip--${type}" data-flag="${escapeUkvHtml(ch)}"><span class="navdesk-ukv-flagchip__flag">${escapeUkvHtml(ch)}</span><span class="navdesk-ukv-flagchip__word">${escapeUkvHtml(word)}</span></span>`);
      } else if (ch === ' ') {
        items.push('<span class="navdesk-ukv-flagspelling__sep">/</span>');
      } else if (ch === '-' || ch === '/' || ch === '.') {
        items.push(`<span class="navdesk-ukv-flagspelling__sep">${escapeUkvHtml(ch)}</span>`);
      }
    }

    return items.join('') || '<span class="navdesk-ukv-flagspelling__empty">—</span>';
  };

  const fillUkvProfile = (profile) => {
    Object.entries(ukvProfileFields).forEach(([key, el]) => {
      if (!el) return;
      el.value = profile[key] ?? '';
    });
  };

  const readUkvProfile = () => {
    const out = {};
    Object.entries(ukvProfileFields).forEach(([key, el]) => {
      out[key] = String(el?.value || '').trim() || ukvDemoProfile[key] || '';
    });
    return out;
  };

  const refreshUkvSpelllines = () => {
    const data = readUkvProfile();
    if (ukvSpellTargets.vesselName) ukvSpellTargets.vesselName.textContent = toPlainSpelling(data.vesselName);
    if (ukvSpellTargets.callSign) ukvSpellTargets.callSign.textContent = toPlainSpelling(data.callSign);
    if (ukvSpellTargets.departurePort) ukvSpellTargets.departurePort.textContent = toPlainSpelling(data.departurePort);
    if (ukvSpellTargets.arrivalPort) ukvSpellTargets.arrivalPort.textContent = toPlainSpelling(data.arrivalPort);
  };

  const refreshUkvProfileSummary = () => {
    const data = readUkvProfile();
    const summaryLine = [
      data.vesselName || 'Aurora',
      data.callSign || '4OAX27',
      [data.departurePort || 'Kotor', data.arrivalPort || 'Dubrovnik'].join(' → ')
    ].join(' · ');

    if (ukvProfileSummaryLine) ukvProfileSummaryLine.textContent = summaryLine;
    if (ukvProfileSummaryName) ukvProfileSummaryName.textContent = data.vesselName || 'Aurora';
    if (ukvProfileSummaryNameSpell) ukvProfileSummaryNameSpell.textContent = toPlainSpelling(data.vesselName || 'Aurora');
    if (ukvProfileSummaryCall) ukvProfileSummaryCall.textContent = data.callSign || '4OAX27';
    if (ukvProfileSummaryCallSpell) ukvProfileSummaryCallSpell.textContent = toPlainSpelling(data.callSign || '4OAX27');
  };

  const setUkvProfileCollapsed = (collapsed, save = true) => {
    if (!ukvVesselCard) return;
    ukvVesselCard.classList.toggle('is-collapsed', !!collapsed);
    if (ukvProfileSummary) ukvProfileSummary.hidden = !collapsed;
    if (!save) return;
    try {
      localStorage.setItem(UKV_PROFILE_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch (e) {}
  };

  const saveUkvProfileToStorage = () => {
    try {
      localStorage.setItem(UKV_PROFILE_STORAGE_KEY, JSON.stringify(readUkvProfile()));
    } catch (e) {}
  };

  const loadUkvProfileFromStorage = () => {
    try {
      const raw = localStorage.getItem(UKV_PROFILE_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  const shouldCollapseUkvProfileByDefault = () => {
    const standalonePage = !!document.querySelector('.navdesk-ukv-page');
    const mobileViewport = window.matchMedia?.('(max-width: 720px)').matches;
    return standalonePage && mobileViewport;
  };

  if (Object.values(ukvProfileFields).some(Boolean)) {
    const storedProfile = loadUkvProfileFromStorage();
    fillUkvProfile(storedProfile || ukvDemoProfile);
    refreshUkvSpelllines();
    refreshUkvProfileSummary();
    try {
      const storedCollapsedState = localStorage.getItem(UKV_PROFILE_COLLAPSED_KEY);
      const collapsed = storedCollapsedState === null
        ? shouldCollapseUkvProfileByDefault()
        : storedCollapsedState === '1';
      setUkvProfileCollapsed(collapsed, storedCollapsedState !== null);
    } catch (e) {
      setUkvProfileCollapsed(shouldCollapseUkvProfileByDefault(), false);
    }
  }

  Object.values(ukvProfileFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      refreshUkvSpelllines();
      refreshUkvProfileSummary();
    });
  });

  if (ukvProfileApply) {
    ukvProfileApply.addEventListener('click', () => {
      refreshUkvSpelllines();
      refreshUkvProfileSummary();
      if (ukvProfileStatus) {
        ukvProfileStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_profile_status_done') : '') || 'Vessel profile updated.';
      }
    });
  }

  if (ukvProfileSave) {
    ukvProfileSave.addEventListener('click', () => {
      refreshUkvSpelllines();
      refreshUkvProfileSummary();
      saveUkvProfileToStorage();
      setUkvProfileCollapsed(true);
      if (ukvProfileStatus) {
        ukvProfileStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_profile_status_saved') : '') || 'Vessel profile saved.';
      }
    });
  }

  if (ukvProfileEdit) {
    ukvProfileEdit.addEventListener('click', () => {
      setUkvProfileCollapsed(false);
    });
  }

  if (ukvProfileReset) {
    ukvProfileReset.addEventListener('click', () => {
      fillUkvProfile(ukvDemoProfile);
      refreshUkvSpelllines();
      refreshUkvProfileSummary();
      try {
        localStorage.removeItem(UKV_PROFILE_STORAGE_KEY);
        localStorage.removeItem(UKV_PROFILE_COLLAPSED_KEY);
      } catch (e) {}
      setUkvProfileCollapsed(false);
      if (ukvProfileStatus) {
        ukvProfileStatus.textContent = (typeof window.t === 'function' ? window.t('navdesk_ukv_profile_status_done') : '') || 'Vessel profile updated.';
      }
    });
  }

  ukvScenarioToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const body = targetId ? document.getElementById(targetId) : null;
      if (!body) return;
      body.hidden = !body.hidden;
    });
  });

  const ukvMarinaOutputs = {
    call: document.getElementById('ukvMarinaCallOutput'),
    berth: document.getElementById('ukvMarinaBerthOutput'),
    reservation: document.getElementById('ukvMarinaReservationOutput'),
    service: document.getElementById('ukvMarinaServiceOutput')
  };

  const ukvMarinaCopyButtons = {
    call: document.getElementById('ukvMarinaCallCopy'),
    berth: document.getElementById('ukvMarinaBerthCopy'),
    reservation: document.getElementById('ukvMarinaReservationCopy'),
    service: document.getElementById('ukvMarinaServiceCopy')
  };

  const buildUkvMarinaTemplates = () => {
    const d = readUkvProfile();
    const vesselType = d.vesselType || 'sailing yacht';
    const vesselName = d.vesselName || 'Aurora';
    const departurePort = d.departurePort || 'Kotor';
    const arrivalPort = d.arrivalPort || 'Dubrovnik';
    const length = d.length || '14.2';
    const beam = d.beam || '4.3';
    const passengers = d.passengers || '4';
    const crew = d.crew || '2';
    const persons = Number(passengers || 0) + Number(crew || 0) || `${passengers} plus ${crew}`;

    return {
      call:
`Dubrovnik Marina, Dubrovnik Marina, Dubrovnik Marina.
This is ${vesselType} ${vesselName}, ${vesselName}, ${vesselName}.
Inbound from ${departurePort}, requesting permission to enter and berthing instructions.
Over.`,

      berth:
`Dubrovnik Marina, this is ${vesselType} ${vesselName}.
Requesting an available berth.
Vessel length ${length} metres, beam ${beam} metres, ${persons} persons on board.
Over.`,

      reservation:
`Dubrovnik Marina, this is ${vesselType} ${vesselName}.
We have a reservation and are now approaching from ${departurePort}.
Requesting berth assignment on arrival.
Over.`,

      service:
`Dubrovnik Marina, this is ${vesselType} ${vesselName}, berthed and requesting services.
Requesting fuel, water and shore power connection if available.
Over.`
    };
  };

  const renderUkvMarinaTemplates = () => {
    const templates = buildUkvMarinaTemplates();
    if (ukvMarinaOutputs.call) ukvMarinaOutputs.call.textContent = templates.call;
    if (ukvMarinaOutputs.berth) ukvMarinaOutputs.berth.textContent = templates.berth;
    if (ukvMarinaOutputs.reservation) ukvMarinaOutputs.reservation.textContent = templates.reservation;
    if (ukvMarinaOutputs.service) ukvMarinaOutputs.service.textContent = templates.service;
  };

  renderUkvMarinaTemplates();

  if (ukvProfileApply) {
    ukvProfileApply.addEventListener('click', () => {
      renderUkvMarinaTemplates();
    });
  }

  if (ukvProfileReset) {
    ukvProfileReset.addEventListener('click', () => {
      renderUkvMarinaTemplates();
    });
  }

  Object.values(ukvProfileFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderUkvMarinaTemplates);
  });

  Object.entries(ukvMarinaCopyButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const node = ukvMarinaOutputs[key];
      const text = String(node?.textContent || '').trim();
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch (e) {}
    });
  });

  const pad2 = (v) => String(Math.round(Number(v) || 0)).padStart(2, '0');
  const pad3 = (v) => String(Math.round(Number(v) || 0)).padStart(3, '0');
  const fmt1 = (v) => Number(v || 0).toFixed(1);

  const formatUkvCoordinates = (d) => {
    const latDeg = d.latDeg || '00';
    const latMin = d.latMin || '00.0';
    const latHem = d.latHem || 'N';
    const lonDeg = d.lonDeg || '000';
    const lonMin = d.lonMin || '00.0';
    const lonHem = d.lonHem || 'E';
    return `lat ${pad2(latDeg)}° ${fmt1(latMin)}' ${latHem}, lon ${pad3(lonDeg)}° ${fmt1(lonMin)}' ${lonHem}`;
  };

  const ukvVtsOutputs = {
    initial: document.getElementById('ukvVtsInitialOutput'),
    position: document.getElementById('ukvVtsPositionOutput'),
    entry: document.getElementById('ukvVtsEntryOutput'),
    traffic: document.getElementById('ukvVtsTrafficOutput')
  };

  const ukvVtsCopyButtons = {
    initial: document.getElementById('ukvVtsInitialCopy'),
    position: document.getElementById('ukvVtsPositionCopy'),
    entry: document.getElementById('ukvVtsEntryCopy'),
    traffic: document.getElementById('ukvVtsTrafficCopy')
  };

  ukvProfileFields.latDeg = document.getElementById('ukvLatDeg');
  ukvProfileFields.latMin = document.getElementById('ukvLatMin');
  ukvProfileFields.latHem = document.getElementById('ukvLatHem');
  ukvProfileFields.lonDeg = document.getElementById('ukvLonDeg');
  ukvProfileFields.lonMin = document.getElementById('ukvLonMin');
  ukvProfileFields.lonHem = document.getElementById('ukvLonHem');
  ukvProfileFields.course = document.getElementById('ukvCourse');
  ukvProfileFields.speed = document.getElementById('ukvSpeed');
  ukvProfileFields.intention = document.getElementById('ukvIntention');
  ukvProfileFields.distressNature = document.getElementById('ukvDistressNature');
  ukvProfileFields.assistanceRequired = document.getElementById('ukvAssistanceRequired');
  ukvProfileFields.additionalInfo = document.getElementById('ukvAdditionalInfo');

  ukvDemoProfile.latDeg = '42';
  ukvDemoProfile.latMin = '25.4';
  ukvDemoProfile.latHem = 'N';
  ukvDemoProfile.lonDeg = '018';
  ukvDemoProfile.lonMin = '41.2';
  ukvDemoProfile.lonHem = 'E';
  ukvDemoProfile.course = '135';
  ukvDemoProfile.speed = '6.2';
  ukvDemoProfile.intention = 'Entering traffic area and proceeding to pilot station';
  ukvDemoProfile.distressNature = 'Taking on water after collision';
  ukvDemoProfile.assistanceRequired = 'Immediate assistance and possible evacuation';
  ukvDemoProfile.additionalInfo = 'Vessel drifting to the south-east';

  const buildUkvVtsTemplates = () => {
    const d = readUkvProfile();
    const vesselType = d.vesselType || 'sailing yacht';
    const vesselName = d.vesselName || 'Aurora';
    const callSign = d.callSign || '4OAX27';
    const coordText = formatUkvCoordinates(d);
    const course = d.course || '000';
    const speed = d.speed || '0.0';
    const intention = d.intention || 'Entering traffic area and proceeding to pilot station';
    const departurePort = d.departurePort || 'Kotor';
    const arrivalPort = d.arrivalPort || 'Dubrovnik';

    return {
      initial:
`Dubrovnik VTS, Dubrovnik VTS, Dubrovnik VTS.
This is ${vesselType} ${vesselName}, call sign ${callSign}.
Inbound from ${departurePort} to ${arrivalPort}.
Over.`,

      position:
`Dubrovnik VTS, this is ${vesselType} ${vesselName}.
My position is ${coordText}.
Course ${course} degrees true, speed ${speed} knots.
Over.`,

      entry:
`Dubrovnik VTS, this is ${vesselType} ${vesselName}.
Entering traffic area.
Present position ${coordText}.
Intention: ${intention}.
Over.`,

      traffic:
`Dubrovnik VTS, this is ${vesselType} ${vesselName}.
Request traffic information and passing instructions.
Present position ${coordText}.
Course ${course} degrees true, speed ${speed} knots.
Over.`
    };
  };

  const renderUkvVtsTemplates = () => {
    const templates = buildUkvVtsTemplates();
    if (ukvVtsOutputs.initial) ukvVtsOutputs.initial.textContent = templates.initial;
    if (ukvVtsOutputs.position) ukvVtsOutputs.position.textContent = templates.position;
    if (ukvVtsOutputs.entry) ukvVtsOutputs.entry.textContent = templates.entry;
    if (ukvVtsOutputs.traffic) ukvVtsOutputs.traffic.textContent = templates.traffic;
  };

  renderUkvVtsTemplates();

  if (ukvProfileApply) {
    ukvProfileApply.addEventListener('click', () => {
      renderUkvVtsTemplates();
    });
  }

  if (ukvProfileReset) {
    ukvProfileReset.addEventListener('click', () => {
      renderUkvVtsTemplates();
    });
  }

  Object.values(ukvProfileFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderUkvVtsTemplates);
    el.addEventListener('change', renderUkvVtsTemplates);
  });

  Object.entries(ukvVtsCopyButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const node = ukvVtsOutputs[key];
      const text = String(node?.textContent || '').trim();
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch (e) {}
    });
  });

  const ukvCoastOutputs = {
    general: document.getElementById('ukvCoastGeneralOutput'),
    portinfo: document.getElementById('ukvCoastPortInfoOutput'),
    assist: document.getElementById('ukvCoastAssistOutput'),
    relay: document.getElementById('ukvCoastRelayOutput')
  };

  const ukvCoastCopyButtons = {
    general: document.getElementById('ukvCoastGeneralCopy'),
    portinfo: document.getElementById('ukvCoastPortInfoCopy'),
    assist: document.getElementById('ukvCoastAssistCopy'),
    relay: document.getElementById('ukvCoastRelayCopy')
  };

  const buildUkvCoastTemplates = () => {
    const d = readUkvProfile();
    const vesselType = d.vesselType || 'sailing yacht';
    const vesselName = d.vesselName || 'Aurora';
    const callSign = d.callSign || '4OAX27';
    const coordText = formatUkvCoordinates(d);
    const departurePort = d.departurePort || 'Kotor';
    const arrivalPort = d.arrivalPort || 'Dubrovnik';
    const intention = d.intention || 'requesting local information';

    return {
      general:
`Dubrovnik Coast Radio, Dubrovnik Coast Radio, Dubrovnik Coast Radio.
This is ${vesselType} ${vesselName}, call sign ${callSign}.
Position ${coordText}.
Requesting contact and further instructions.
Over.`,

      portinfo:
`Dubrovnik Coast Radio, this is ${vesselType} ${vesselName}.
Requesting latest port information for ${arrivalPort}.
Present position ${coordText}.
Inbound from ${departurePort}.
Over.`,

      assist:
`Dubrovnik Coast Radio, this is ${vesselType} ${vesselName}.
Requesting practical assistance.
Present position ${coordText}.
My intention is ${intention}.
Over.`,

      relay:
`Dubrovnik Coast Radio, this is ${vesselType} ${vesselName}.
Requesting connection or relay to harbour authorities / marina office.
Present position ${coordText}.
Over.`
    };
  };

  const renderUkvCoastTemplates = () => {
    const templates = buildUkvCoastTemplates();
    if (ukvCoastOutputs.general) ukvCoastOutputs.general.textContent = templates.general;
    if (ukvCoastOutputs.portinfo) ukvCoastOutputs.portinfo.textContent = templates.portinfo;
    if (ukvCoastOutputs.assist) ukvCoastOutputs.assist.textContent = templates.assist;
    if (ukvCoastOutputs.relay) ukvCoastOutputs.relay.textContent = templates.relay;
  };

  renderUkvCoastTemplates();

  if (ukvProfileApply) {
    ukvProfileApply.addEventListener('click', () => {
      renderUkvCoastTemplates();
    });
  }

  if (ukvProfileReset) {
    ukvProfileReset.addEventListener('click', () => {
      renderUkvCoastTemplates();
    });
  }

  Object.values(ukvProfileFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderUkvCoastTemplates);
    el.addEventListener('change', renderUkvCoastTemplates);
  });

  Object.entries(ukvCoastCopyButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const node = ukvCoastOutputs[key];
      const text = String(node?.textContent || '').trim();
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch (e) {}
    });
  });

  const ukvEmergencyOutputs = {
    distressCall: document.getElementById('ukvDistressCallOutput'),
    distressRelay: document.getElementById('ukvDistressRelayOutput'),
    distressAssist: document.getElementById('ukvDistressAssistOutput'),
    urgencyMedical: document.getElementById('ukvUrgencyMedicalOutput'),
    urgencyPropulsion: document.getElementById('ukvUrgencyPropulsionOutput'),
    safetyNavWarn: document.getElementById('ukvSafetyNavWarnOutput'),
    safetyWeather: document.getElementById('ukvSafetyWeatherOutput')
  };

  const ukvEmergencyCopyButtons = {
    distressCall: document.getElementById('ukvDistressCallCopy'),
    distressRelay: document.getElementById('ukvDistressRelayCopy'),
    distressAssist: document.getElementById('ukvDistressAssistCopy'),
    urgencyMedical: document.getElementById('ukvUrgencyMedicalCopy'),
    urgencyPropulsion: document.getElementById('ukvUrgencyPropulsionCopy'),
    safetyNavWarn: document.getElementById('ukvSafetyNavWarnCopy'),
    safetyWeather: document.getElementById('ukvSafetyWeatherCopy')
  };

  const ukvRelayFields = {
    vesselName: document.getElementById('ukvRelayVesselName'),
    callSign: document.getElementById('ukvRelayCallSign'),
    position: document.getElementById('ukvRelayPosition')
  };

  const ukvDistressMeta = {
    vesselName: document.getElementById('ukvDistressVesselName'),
    vesselNameSpell: document.getElementById('ukvDistressVesselNameSpell'),
    callSign: document.getElementById('ukvDistressCallSign'),
    callSignSpell: document.getElementById('ukvDistressCallSignSpell'),
    relayVesselName: document.getElementById('ukvRelayVesselNameView'),
    relayVesselNameSpell: document.getElementById('ukvRelayVesselNameSpell'),
    relayCallSign: document.getElementById('ukvRelayCallSignView'),
    relayCallSignSpell: document.getElementById('ukvRelayCallSignSpell')
  };

  const relayDefaults = {
    vesselName: 'Sea Breeze',
    callSign: '9HA1234',
    position: "lat 42° 25.4' N, lon 018° 41.2' E"
  };

  const buildUkvEmergencyTemplates = () => {
    const d = readUkvProfile();
    const vesselName = d.vesselName || 'Aurora';
    const callSign = d.callSign || '4OAX27';
    const mmsi = d.mmsi || '278000123';
    const coordText = formatUkvCoordinates(d);
    const persons = Number(d.passengers || 0) + Number(d.crew || 0) || `${d.passengers || 0} plus ${d.crew || 0}`;
    const intention = d.intention || 'awaiting assistance';
    const distressNature = d.distressNature || 'Taking on water after collision';
    const assistanceRequired = d.assistanceRequired || 'Immediate assistance and possible evacuation';
    const additionalInfo = d.additionalInfo || 'Vessel drifting to the south-east';

    const relayVesselName = String(ukvRelayFields.vesselName?.value || '').trim() || relayDefaults.vesselName;
    const relayCallSign = String(ukvRelayFields.callSign?.value || '').trim() || relayDefaults.callSign;
    const relayPosition = String(ukvRelayFields.position?.value || '').trim() || relayDefaults.position;

    return {
      distressCall:
`Mayday, Mayday, Mayday.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}, ${vesselName}, ${vesselName}.
Call sign ${callSign}, MMSI ${mmsi}.
Position ${coordText}.
Nature of distress: ${distressNature}.
Assistance required: ${assistanceRequired}.
${persons} persons on board.
Additional information: ${additionalInfo}.
Over.`,

      distressRelay:
`Mayday Relay, Mayday Relay, Mayday Relay.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}, call sign ${callSign}.
Relaying distress traffic for vessel ${relayVesselName}, call sign ${relayCallSign}.
Reported position ${relayPosition}.
Nature of distress: ${distressNature}.
Assistance required: ${assistanceRequired}.
Over.`,

      distressAssist:
`Mayday.
Sailing yacht ${vesselName}.
Position ${coordText}.
Nature of distress: ${distressNature}.
Assistance required: ${assistanceRequired}.
${persons} persons on board.
Additional information: ${additionalInfo}.
Over.`,

      urgencyMedical:
`Pan-Pan, Pan-Pan, Pan-Pan.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}, call sign ${callSign}.
Position ${coordText}.
Request urgent medical advice / assistance.
${persons} persons on board.
Over.`,

      urgencyPropulsion:
`Pan-Pan, Pan-Pan, Pan-Pan.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}, call sign ${callSign}.
Position ${coordText}.
Loss of propulsion / restricted manoeuvrability.
Request urgent assistance or traffic clearance.
Over.`,

      safetyNavWarn:
`Sécurité, Sécurité, Sécurité.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}.
Navigational warning in position ${coordText}.
Vessels are advised to navigate with caution.
Out.`,

      safetyWeather:
`Sécurité, Sécurité, Sécurité.
All stations, all stations, all stations.
This is sailing yacht ${vesselName}.
Weather or local hazard warning for vessels in the area near ${coordText}.
Navigate with caution.
Out.`
    };
  };

  const renderUkvEmergencyTemplates = () => {
    const templates = buildUkvEmergencyTemplates();
    if (ukvEmergencyOutputs.distressCall) ukvEmergencyOutputs.distressCall.textContent = templates.distressCall;
    if (ukvEmergencyOutputs.distressRelay) ukvEmergencyOutputs.distressRelay.textContent = templates.distressRelay;
    if (ukvEmergencyOutputs.distressAssist) ukvEmergencyOutputs.distressAssist.textContent = templates.distressAssist;
    if (ukvEmergencyOutputs.urgencyMedical) ukvEmergencyOutputs.urgencyMedical.textContent = templates.urgencyMedical;
    if (ukvEmergencyOutputs.urgencyPropulsion) ukvEmergencyOutputs.urgencyPropulsion.textContent = templates.urgencyPropulsion;
    if (ukvEmergencyOutputs.safetyNavWarn) ukvEmergencyOutputs.safetyNavWarn.textContent = templates.safetyNavWarn;
    if (ukvEmergencyOutputs.safetyWeather) ukvEmergencyOutputs.safetyWeather.textContent = templates.safetyWeather;

    const d = readUkvProfile();
    if (ukvDistressMeta.vesselName) ukvDistressMeta.vesselName.textContent = d.vesselName || 'Aurora';
    if (ukvDistressMeta.vesselNameSpell) ukvDistressMeta.vesselNameSpell.textContent = toPlainSpelling(d.vesselName || 'Aurora');
    if (ukvDistressMeta.callSign) ukvDistressMeta.callSign.textContent = d.callSign || '4OAX27';
    if (ukvDistressMeta.callSignSpell) ukvDistressMeta.callSignSpell.textContent = toPlainSpelling(d.callSign || '4OAX27');

    const relayName = String(ukvRelayFields.vesselName?.value || '').trim() || relayDefaults.vesselName;
    const relayCall = String(ukvRelayFields.callSign?.value || '').trim() || relayDefaults.callSign;
    if (ukvDistressMeta.relayVesselName) ukvDistressMeta.relayVesselName.textContent = relayName;
    if (ukvDistressMeta.relayVesselNameSpell) ukvDistressMeta.relayVesselNameSpell.textContent = toPlainSpelling(relayName);
    if (ukvDistressMeta.relayCallSign) ukvDistressMeta.relayCallSign.textContent = relayCall;
    if (ukvDistressMeta.relayCallSignSpell) ukvDistressMeta.relayCallSignSpell.textContent = toPlainSpelling(relayCall);
  };

  renderUkvEmergencyTemplates();

  if (ukvProfileApply) {
    ukvProfileApply.addEventListener('click', () => {
      renderUkvEmergencyTemplates();
    });
  }

  if (ukvProfileReset) {
    ukvProfileReset.addEventListener('click', () => {
      Object.values(ukvRelayFields).forEach((el, i) => {
        if (!el) return;
      });
      if (ukvRelayFields.vesselName) ukvRelayFields.vesselName.value = relayDefaults.vesselName;
      if (ukvRelayFields.callSign) ukvRelayFields.callSign.value = relayDefaults.callSign;
      if (ukvRelayFields.position) ukvRelayFields.position.value = relayDefaults.position;
      renderUkvEmergencyTemplates();
    });
  }

  Object.values(ukvProfileFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderUkvEmergencyTemplates);
    el.addEventListener('change', renderUkvEmergencyTemplates);
  });

  Object.values(ukvRelayFields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderUkvEmergencyTemplates);
    el.addEventListener('change', renderUkvEmergencyTemplates);
  });

  const ukvPhraseMenus = {
    intention: document.getElementById('ukvIntentionMenu'),
    distressNature: document.getElementById('ukvDistressNatureMenu'),
    assistanceRequired: document.getElementById('ukvAssistanceRequiredMenu'),
    additionalInfo: document.getElementById('ukvAdditionalInfoMenu')
  };

  const ukvPhraseInputs = {
    intention: document.getElementById('ukvIntention'),
    distressNature: document.getElementById('ukvDistressNature'),
    assistanceRequired: document.getElementById('ukvAssistanceRequired'),
    additionalInfo: document.getElementById('ukvAdditionalInfo')
  };

  const ukvPhraseCatalog = {
    intention: [
      { value: 'Entering traffic area and proceeding to pilot station', ru: 'вхожу в район контроля и следую к лоцманской станции' },
      { value: 'Requesting permission to enter harbour', ru: 'запрашиваю разрешение на вход в порт' },
      { value: 'Proceeding to marina entrance', ru: 'следую ко входу в марину' },
      { value: 'Awaiting berthing instructions', ru: 'ожидаю указаний по швартовке' },
      { value: 'Proceeding to anchorage', ru: 'следую на якорную стоянку' },
      { value: 'Remaining on standby', ru: 'остаюсь в ожидании' },
      { value: 'Drifting with limited control', ru: 'дрейфую с ограниченным контролем' },
      { value: 'Returning to port', ru: 'возвращаюсь в порт' },
      { value: 'Proceeding at reduced speed', ru: 'следую сниженным ходом' },
      { value: 'Standing by on channel one six', ru: 'нахожусь на ожидании на шестнадцатом канале' }
    ],
    distressNature: [
      { value: 'Taking on water', ru: 'поступает вода', traffic: 'mayday' },
      { value: 'Fire on board', ru: 'пожар на борту', traffic: 'mayday' },
      { value: 'Collision with severe damage', ru: 'столкновение с тяжёлыми повреждениями', traffic: 'mayday' },
      { value: 'Flooding after collision', ru: 'затопление после столкновения', traffic: 'mayday' },
      { value: 'Person overboard in immediate danger', ru: 'человек за бортом в непосредственной опасности', traffic: 'mayday' },
      { value: 'Engine room fire', ru: 'пожар в машинном отделении', traffic: 'mayday' },
      { value: 'Risk of sinking', ru: 'угроза затопления', traffic: 'mayday' },
      { value: 'Grounded and taking water', ru: 'село на мель и поступает вода', traffic: 'mayday' },

      { value: 'Loss of propulsion', ru: 'потеря хода', traffic: 'panpan' },
      { value: 'Loss of steering', ru: 'потеря управления', traffic: 'panpan' },
      { value: 'Grounded', ru: 'село на мель', traffic: 'panpan' },
      { value: 'Medical emergency on board', ru: 'медицинская неотложная ситуация на борту', traffic: 'panpan' },
      { value: 'Vessel disabled and drifting', ru: 'судно обездвижено и дрейфует', traffic: 'panpan' },
      { value: 'Restricted manoeuvrability', ru: 'ограниченная управляемость', traffic: 'panpan' }
    ],
    assistanceRequired: [
      { value: 'Immediate assistance required', ru: 'требуется немедленная помощь', traffic: 'mayday' },
      { value: 'Immediate evacuation required', ru: 'требуется немедленная эвакуация', traffic: 'mayday' },
      { value: 'Firefighting assistance required', ru: 'требуется помощь в тушении пожара', traffic: 'mayday' },
      { value: 'Pumping assistance required', ru: 'требуется откачка воды', traffic: 'mayday' },
      { value: 'Rescue of persons required', ru: 'требуется спасение людей', traffic: 'mayday' },
      { value: 'Search and rescue assistance required', ru: 'требуется поисково-спасательная помощь', traffic: 'mayday' },

      { value: 'Medical assistance required', ru: 'требуется медицинская помощь', traffic: 'panpan' },
      { value: 'Towage required', ru: 'требуется буксировка', traffic: 'panpan' },
      { value: 'Stand by and assist', ru: 'прошу оставаться рядом и быть готовыми помочь', traffic: 'panpan' },
      { value: 'Urgent advice required', ru: 'требуется срочная консультация', traffic: 'panpan' },
      { value: 'Traffic clearance required', ru: 'требуется расчистка движения', traffic: 'panpan' },
      { value: 'Escort requested', ru: 'запрашивается сопровождение', traffic: 'panpan' }
    ],
    additionalInfo: [
      { value: 'Vessel drifting to the south-east', ru: 'судно дрейфует к юго-востоку' },
      { value: 'Two persons injured', ru: 'двое пострадавших' },
      { value: 'All persons wearing lifejackets', ru: 'все люди в спасательных жилетах' },
      { value: 'Preparing life raft', ru: 'готовим спасательный плот' },
      { value: 'Engine disabled', ru: 'двигатель не работает' },
      { value: 'Water ingress increasing', ru: 'поступление воды усиливается' },
      { value: 'Fire not under control', ru: 'пожар не под контролем' },
      { value: 'Vessel aground but stable', ru: 'судно на мели, но устойчиво' },
      { value: 'Request communication on channel one six', ru: 'прошу связь на шестнадцатом канале' },
      { value: 'Weather deteriorating', ru: 'погода ухудшается' },
      { value: 'Visibility restricted', ru: 'ограниченная видимость' },
      { value: 'Awaiting immediate response', ru: 'ожидаем немедленного ответа' }
    ]
  };

  const getUkvUiLang = () => {
    try {
      if (typeof getLang === 'function') {
        const v = String(getLang() || '').trim().toLowerCase();
        if (v === 'ru' || v === 'en') return v;
      }
    } catch (e) {}

    const activeToggle =
      document.querySelector('.lang-switch [aria-pressed="true"]') ||
      document.querySelector('.lang-switch .is-active') ||
      document.querySelector('.lang-toggle [aria-pressed="true"]') ||
      document.querySelector('.lang-toggle .is-active');

    const activeText = String(activeToggle?.textContent || '').trim().toLowerCase();
    if (activeText === 'ru' || activeText === 'en') return activeText;

    const docLang = String(document.documentElement.getAttribute('lang') || '').trim().toLowerCase();
    if (docLang.startsWith('ru')) return 'ru';
    if (docLang.startsWith('en')) return 'en';

    return 'en';
  };

  const tUkvUi = (key, fallback = '') => {
    try {
      if (typeof window.t === 'function') {
        const value = window.t(key, fallback);
        if (value && value !== key) return value;
      }
    } catch (e) {}
    return fallback || key;
  };

  const getUkvTrafficLabel = (traffic) => {
    if (traffic === 'mayday') return 'Mayday';
    if (traffic === 'panpan') return 'Pan-Pan';
    return '';
  };

  const getUkvSuggestionLabel = (item) => {
    const lang = getUkvUiLang();
    const trafficTag = item.traffic ? `${getUkvTrafficLabel(item.traffic)} — ` : '';
    if (lang === 'ru') {
      return `${trafficTag}${item.value} (${item.ru})`;
    }
    return `${trafficTag}${item.value}`;
  };

  const closeAllUkvPhraseMenus = () => {
    Object.values(ukvPhraseMenus).forEach((menu) => {
      if (menu) menu.hidden = true;
    });
  };

  const fillUkvPhraseMenu = (fieldKey) => {
    const menu = ukvPhraseMenus[fieldKey];
    const input = ukvPhraseInputs[fieldKey];
    const items = ukvPhraseCatalog[fieldKey] || [];
    if (!menu || !input) return;

    menu.innerHTML = items.map((item) => {
      const label = getUkvSuggestionLabel(item).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const value = String(item.value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<button type="button" class="navdesk-smart-pick__item" data-pick-value="${value}" data-pick-field="${fieldKey}">${label}</button>`;
    }).join('');
  };

  const renderUkvPhraseMenus = () => {
    fillUkvPhraseMenu('intention');
    fillUkvPhraseMenu('distressNature');
    fillUkvPhraseMenu('assistanceRequired');
    fillUkvPhraseMenu('additionalInfo');
  };

  const syncUkvPickHints = () => {
    const hint = tUkvUi('navdesk_ukv_phrase_pick_hint', 'You can choose a ready-made phrase from the list or edit it manually.');
    document.querySelectorAll('[data-pick-toggle]').forEach((btn) => {
      btn.setAttribute('title', hint);
    });
  };

  renderUkvPhraseMenus();
  syncUkvPickHints();
  document.addEventListener('languageChanged', syncUkvPickHints);

  document.querySelectorAll('[data-pick-toggle]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = btn.getAttribute('data-pick-toggle');
      const menu = key ? ukvPhraseMenus[key] : null;
      if (!menu) return;
      const willOpen = menu.hidden;
      closeAllUkvPhraseMenus();
      menu.hidden = !willOpen;
    });
  });

  Object.entries(ukvPhraseMenus).forEach(([key, menu]) => {
    if (!menu) return;
    menu.addEventListener('click', (event) => {
      const btn = event.target.closest('.navdesk-smart-pick__item');
      if (!btn) return;
      const value = btn.getAttribute('data-pick-value') || '';
      const input = ukvPhraseInputs[key];
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      menu.hidden = true;
    });
  });

  Object.entries(ukvPhraseInputs).forEach(([key, input]) => {
    if (!input) return;
    input.addEventListener('focus', () => {
      closeAllUkvPhraseMenus();
      const menu = ukvPhraseMenus[key];
      if (menu) menu.hidden = false;
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.navdesk-smart-pick')) {
      closeAllUkvPhraseMenus();
    }
  });

  document.addEventListener('languageChanged', () => {
    try { renderUkvPhraseMenus(); } catch (e) {}
  });

  if (ukvRelayFields.vesselName && !ukvRelayFields.vesselName.value) ukvRelayFields.vesselName.value = relayDefaults.vesselName;
  if (ukvRelayFields.callSign && !ukvRelayFields.callSign.value) ukvRelayFields.callSign.value = relayDefaults.callSign;
  if (ukvRelayFields.position && !ukvRelayFields.position.value) ukvRelayFields.position.value = relayDefaults.position;
  renderUkvEmergencyTemplates();

  Object.entries(ukvEmergencyCopyButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const node = ukvEmergencyOutputs[key];
      const text = String(node?.textContent || '').trim();
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch (e) {}
    });
  });

  const navdeskPrintRoot = document.getElementById('navdeskPrintRoot');
  const ukvPrintSheet = document.getElementById('ukvPrintSheet');
  const NAVDESK_PRINT_LOGO_SRC = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAA9SgAwAEAAAAAQAAARgAAAAA/8AAEQgBGAPUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgMDBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAPv/aAAwDAQACEQMRAD8A/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Q/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//R/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPnv4reJvHPwvlbx9pJGseGhtW/02UYkgY/KJ4JhkhT8oZWDKDyMbiV7L4c/Fvwb8T7Iz+G7oi6iAM1pMAk8WfVckEZ/iUsvvnivQ7u0tL+1msbyJbi3uEaOSOQBkdHBDKyngggkEHgivyn+KvgXWPgf8Q1n8P3EtraSk3OmXKFg6ICQ0Jfu0ZO1hk7lKlh8xFfO47EVcJL2y1h1PRw9ONX3NmfrLxnGKOx4r5e+BX7Qdr8Rmi8L+IQtt4hRCVYDbFdqgyxQdpAMlkHHVl4yq/UOcA5r18PXhXpqpTehyVKcqcuWSHUUUV1mIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//S/fyiiigAooooAKKKKAEGK8L+LH7SXwR+Bl7Y6f8AFbxVb+HZ9SR5LdZ45n8xIyAxBjjc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NRvkU8iytG/cow9JbgBlOesRHevm+F8LPGYqWImvidv8z0M5rrDUORdPzPx0u72+1O6m1LVJmnvr2R57iRvvPNMxkkYn1ZmJNVlAI/Gnt2w3P8qYMEcflX9PpaWPwltt3Y4D+lNkXgYpwHpzyKRz0Pf+lWT0EjwOvtUmCen4fWmoeOeuadxjg96A6ETAHj8qkSZraKW4jYrJCBKpB53J8wP5jNI/sf61DIm+3uE9YnwD67TUy2sC3uf1j6TqMOraVZ6pB/qryGOZf92RQw/Q1pV578KrpL74XeEL6IYW40fT5FHTAe3Qjr9a9Cr8KkrNn7KndIKKKKQwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9H9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKAPwd/4K3/BdNI8TeEv2gNHtwkWtAaBq5XaoNxGrTWErADczMgljZicBUjX0r8eBnHTniv69v2jvhDZfHn4I+LvhVdbUm1uycWcrkqsF9ARNaSkrkhUnRGbHJUEdDX8iE1tfWcs1hqtu1pqNpK9vdQSLteGeFiskbqeVKspBB6V9HgavNBwZ4uMp2kpIgJwPeut8C+Nta+Gni/RfiF4YbGseGr2DULUNu2O8D72ifaQxSVcxsAeVYjvXJtx0605CoHvnIPXmvUlFSTTPOjJxd0f2Z+BPGmh/EbwVoXj3wvKZ9J8RWVvf2rHAbyrlBIoYAnDAHDD+FgQelfCf7UnxCHiTxSng/TZt+naET5m08PenKv0OD5SnaM4KsZBXyt/wT5/aksfCXwK8U/CG/uTJr3hiaa70CJkYobO/YMylgu0CC6aR2DMCyuFXJBA9k+D/AIAu/it48jtL7fNp1swutSnYsS8e7OwsDnfM2VzuDY3MOVNfjfEE6jmsBS+KX9f8E/QstUXH6zPZfmfXf7OXhHT/AIe/DW48deIZUspNViN9PLKQiQWESs8ZZiSANu6Vm44YA/dr8Lfj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DnrxXkTfsp/Bxjn+z7oHsRe3HH/j9RN+yl8JwQY49QjI6YvZDj6biela3xT+KnH7/wDgGf7rpJ/d/wAE9Vm+Fnw0uARN4U0ps/8ATlCP5KK566+Avwfum3P4Yt4z6RNJCPyjZRXLxfs2+FLSSKTSvEHiHTvKyQLbVJowS2Mk9eeK9B8P/Dm38P3Ud0Nf1vUDF91L3UJJ0P8AvKcBv+BZrRUVN2qUl/XyI52vhkcXc/s0fBqcHZokkDHOGjvLkYz7GUr+YrjLn9kL4cSZ+zalqtue22SAgf8AfUBJ/E19W4Ipc57U5ZfhZfFTQLEVV9o+Kpv2ONNWbztP8V3UJU5Rnt1d1PruVo+foBXZab8IPjT4ZBPh/wCKUt0MDEV/ZmdOOg3SyylR/ugGvqLOO2aXB71nHLMNTd4Rt6N/5lSxVSXxO547ozfHeykA16Pw9qcI4zBLdWkh9yWjlUn2AFer2klzLAr3UHkSkfMgcOAfZgBkfgPpVrGe+KXI7mvRpw5epyt+Q6iiitiQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//W/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//X/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Q/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z';

  const getPrintLang = () => document.documentElement.lang === 'ru' ? 'ru' : 'en';

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatPrintMultiline = (value) => escapeHtml(value).replace(/\n/g, '<br>');

  const getPrintCopy = () => {
    const lang = getPrintLang();
    return lang === 'ru'
      ? {
          title: 'Radio Quick Sheet',
          subtitle: 'Краткая печатная памятка для радиостанции с основными данными судна и базовыми шаблонами связи.',
          vesselData: 'Данные судна',
          spelling: 'Спеллинг',
          order: 'Порядок вызова',
          routine: 'Рабочие шаблоны',
          emergency: 'Срочность и бедствие',
          vesselType: 'Тип яхты',
          vesselName: 'Название яхты',
          callSign: 'Call sign',
          mmsi: 'MMSI',
          departurePort: 'Порт выхода',
          arrivalPort: 'Порт захода',
          lengthBeam: 'Длина / ширина',
          persons: 'Пассажиры / экипаж',
          vesselNameSpelling: 'Spelling названия',
          callSignSpelling: 'Spelling call sign',
          departureSpelling: 'Spelling порта выхода',
          arrivalSpelling: 'Spelling порта захода',
          calledStation: 'Кого вызываете',
          callingVessel: 'Кто вызывает',
          positionContext: 'Позиция или контекст',
          request: 'Запрос или намерение',
          extraDetails: 'Дополнительные сведения',
          closing: 'Завершение передачи',
          marinaEntry: 'Marina entry',
          berthRequest: 'Berth request',
          vtsInitial: 'VTS initial',
          coastCall: 'Coast station call',
          mayday: 'MAYDAY',
          maydayRelay: 'MAYDAY RELAY',
          panpan: 'PAN-PAN',
          securite: 'SÉCURITÉ',
          footerLeft: 'Vetus Nauta — Brkovic',
          footerRight: 'Have a good watch Captain!',
          over: 'over / standing by'
        }
      : {
          title: 'Radio Quick Sheet',
          subtitle: 'Compact bridge-side reference with vessel identity, spelling and core radio templates.',
          vesselData: 'Vessel data',
          spelling: 'Spelling',
          order: 'Call structure',
          routine: 'Routine templates',
          emergency: 'Urgency and distress',
          vesselType: 'Vessel type',
          vesselName: 'Vessel name',
          callSign: 'Call sign',
          mmsi: 'MMSI',
          departurePort: 'Departure port',
          arrivalPort: 'Arrival port',
          lengthBeam: 'Length / beam',
          persons: 'Passengers / crew',
          vesselNameSpelling: 'Vessel name spelling',
          callSignSpelling: 'Call sign spelling',
          departureSpelling: 'Departure port spelling',
          arrivalSpelling: 'Arrival port spelling',
          calledStation: 'Called station',
          callingVessel: 'Calling vessel',
          positionContext: 'Position or context',
          request: 'Request or intention',
          extraDetails: 'Extra details',
          closing: 'Transmission end',
          marinaEntry: 'Marina entry',
          berthRequest: 'Berth request',
          vtsInitial: 'VTS initial',
          coastCall: 'Coast station call',
          mayday: 'MAYDAY',
          maydayRelay: 'MAYDAY RELAY',
          panpan: 'PAN-PAN',
          securite: 'SÉCURITÉ',
          footerLeft: 'Vetus Nauta — Brkovic',
          footerRight: 'Have a good watch Captain!',
          over: 'over / standing by'
        };
  };

  const buildStandalonePrintDocument = ({ title = '', subtitle = '', bodyHtml = '', footerLeft = 'Vetus Nauta', footerRight = 'Have a good watch Captain!', pageSize = 'A4 portrait' } = {}) => {
    const safePageSize = pageSize === 'A4 landscape' ? 'A4 landscape' : 'A4 portrait';
    return `<!doctype html>
<html lang="${getPrintLang()}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  @page { size: ${safePageSize}; margin: 9mm; }
  html, body { margin: 0; padding: 0; background: #fff; color: #10243a; font-family: Inter, Arial, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 100%; box-sizing: border-box; }
  .header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding-bottom:8px; border-bottom:1px solid rgba(16,36,58,.16); }
  .brand-wrap { display:flex; align-items:flex-start; gap:12px; min-width:0; flex:1; }
  .logo { width: 210px; max-width: 100%; height: auto; display:block; }
  .titles { min-width:0; flex:1; padding-top:2px; }
  .eyebrow { margin:0 0 3px; font-size:8.6px; letter-spacing:.16em; text-transform:uppercase; color:rgba(16,36,58,.6); }
  .title { margin:0; font-size:25px; line-height:1; font-family: 'Cormorant Garamond', Georgia, serif; font-weight:700; }
  .subtitle { margin:3px 0 0; font-size:10.8px; line-height:1.3; color:rgba(16,36,58,.82); max-width:100mm; }
  .motto { margin:0; font-size:11.8px; line-height:1.3; font-style:italic; color:rgba(16,36,58,.85); white-space:nowrap; padding-top:6px; }
  .top-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
  .flow { display:block; margin-top:8px; }
  .flow > .block + .block { margin-top:8px; }
  .block { border:1px solid rgba(16,36,58,.14); border-radius:9px; padding:7px 8px; break-inside: avoid; page-break-inside: avoid; }
  .block h2 { margin:0 0 5px; font-size:11.8px; line-height:1.2; font-weight:800; }
  .meta { display:grid; grid-template-columns: 1fr 1fr; gap:3px 8px; }
  .meta div { font-size:10.4px; line-height:1.28; }
  .label { color:rgba(16,36,58,.6); display:block; font-size:9.2px; text-transform:uppercase; letter-spacing:.08em; margin-bottom:1px; }
  .value { font-weight:600; }
  .spell p, .list p, .template { margin:0 0 2px; font-size:11.1px; line-height:1.3; }
  .template-title { font-size:9.6px; text-transform:uppercase; letter-spacing:.08em; color:rgba(16,36,58,.62); margin:0 0 2px; }
  .template { padding:4px 5px; border:1px solid rgba(16,36,58,.1); border-radius:7px; background:#fbfbf8; }
  .order-list { display:grid; gap:2px; }
  .order-item { display:grid; grid-template-columns:14px 1fr; gap:6px; font-size:10.4px; line-height:1.28; padding:3px 0; border-bottom:1px solid rgba(16,36,58,.08); }
  .order-item:last-child { border-bottom:0; }
  .two-up { display:block; }
  .two-up > div + div { margin-top:6px; }
  .footer { margin-top:8px; padding-top:6px; border-top:1px solid rgba(16,36,58,.16); display:flex; justify-content:space-between; gap:12px; font-size:8.6px; color:rgba(16,36,58,.68); }
  /* hard override for 2-up print cards */
  .section-title { margin:0 0 5px; font-size:11.8px; line-height:1.2; font-weight:800; }
  .card-grid {
    display:grid !important;
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
    gap:8px !important;
    align-items:start;
  }
  .card-grid > .block {
    width:auto !important;
    min-width:0 !important;
    margin:0 !important;
  }
  .card-grid .template {
    min-height:0 !important;
  }
  @media print { .sheet { width: auto; } }
</style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <div class="brand-wrap">
        <img class="logo" src="${NAVDESK_PRINT_LOGO_SRC}" alt="Vetus Nauta — Brkovic">
        <div class="titles">
          <p class="eyebrow">Vetus Nauta</p>
          <h1 class="title">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
        </div>
      </div>
      <p class="motto">Have a good watch Captain!</p>
    </header>
    ${bodyHtml}
    <footer class="footer"><span>${escapeHtml(footerLeft)}</span><span>${escapeHtml(footerRight)}</span></footer>
  </main>
<script>
window.addEventListener('load', () => { setTimeout(() => window.print(), 120); });
window.addEventListener('afterprint', () => { setTimeout(() => window.close(), 120); });
</script>
</body>
</html>`;
  };

  const openNavdeskPrintWindow = (docHtml) => {
    const html = String(docHtml || '').trim();
    if (!html) return false;

    const win = window.open('', '_blank', 'width=980,height=1320');
    if (!win) return false;

    try {
      win.document.open();
      win.document.write(html);
      win.document.close();
      try { win.focus(); } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  };

  const buildNavdeskPrintShell = ({ title = '', subtitle = '', bodyHtml = '', footerLeft = 'Vetus Nauta', footerRight = 'Have a good watch Captain!' } = {}) => {
    return buildStandalonePrintDocument({ title, subtitle, bodyHtml, footerLeft, footerRight });
  };

  const mountNavdeskPrintHtml = (html) => {
    if (!navdeskPrintRoot) return;
    navdeskPrintRoot.innerHTML = html || '';
    navdeskPrintRoot.hidden = !html;
  };

  const clearNavdeskPrintHtml = () => {
    if (!navdeskPrintRoot) return;
    navdeskPrintRoot.innerHTML = '';
    navdeskPrintRoot.hidden = true;
  };

  const triggerNavdeskPrint = () => {
    if (!navdeskPrintRoot || navdeskPrintRoot.hidden) return;
    const html = navdeskPrintRoot.innerHTML;
    if (!html) return;
    openNavdeskPrintWindow(html);
  };

  const printFromHtml = ({ title = '', subtitle = '', bodyHtml = '', pageSize = 'A4 portrait', footerLeft, footerRight } = {}) => {
    const docHtml = buildStandalonePrintDocument({ title, subtitle, bodyHtml, pageSize, footerLeft, footerRight });
    openNavdeskPrintWindow(docHtml);
  };

  const buildRadioQuickSheetHtml = () => {
    const copy = getPrintCopy();
    const d = readUkvProfile();
    const marina = buildUkvMarinaTemplates();
    const vts = buildUkvVtsTemplates();
    const coast = buildUkvCoastTemplates();
    const emergency = buildUkvEmergencyTemplates();
    const persons = `${d.passengers || '4'} / ${d.crew || '2'}`;
    const bodyHtml = `
      <section class="top-row">
        <div class="block">
          <h2>${copy.vesselData}</h2>
          <div class="meta">
            <div><span class="label">${copy.vesselType}</span><span class="value">${escapeHtml(d.vesselType || 'sailing yacht')}</span></div>
            <div><span class="label">${copy.vesselName}</span><span class="value">${escapeHtml(d.vesselName || 'Aurora')}</span></div>
            <div><span class="label">${copy.callSign}</span><span class="value">${escapeHtml(d.callSign || '4OAX27')}</span></div>
            <div><span class="label">${copy.mmsi}</span><span class="value">${escapeHtml(d.mmsi || '278000123')}</span></div>
            <div><span class="label">${copy.departurePort}</span><span class="value">${escapeHtml(d.departurePort || 'Kotor')}</span></div>
            <div><span class="label">${copy.arrivalPort}</span><span class="value">${escapeHtml(d.arrivalPort || 'Dubrovnik')}</span></div>
            <div><span class="label">${copy.lengthBeam}</span><span class="value">${escapeHtml((d.length || '14.2') + ' m / ' + (d.beam || '4.3') + ' m')}</span></div>
            <div><span class="label">${copy.persons}</span><span class="value">${escapeHtml(persons)}</span></div>
          </div>
        </div>

        <div class="block spell">
          <h2>${copy.spelling}</h2>
          <p><span class="label">${copy.vesselNameSpelling}</span><span class="value">${escapeHtml(toPlainSpelling(d.vesselName || 'Aurora'))}</span></p>
          <p><span class="label">${copy.callSignSpelling}</span><span class="value">${escapeHtml(toPlainSpelling(d.callSign || '4OAX27'))}</span></p>
          <p><span class="label">${copy.departureSpelling} — ${escapeHtml(d.departurePort || 'Kotor')}</span><span class="value">${escapeHtml(toPlainSpelling(d.departurePort || 'Kotor'))}</span></p>
          <p><span class="label">${copy.arrivalSpelling} — ${escapeHtml(d.arrivalPort || 'Dubrovnik')}</span><span class="value">${escapeHtml(toPlainSpelling(d.arrivalPort || 'Dubrovnik'))}</span></p>
        </div>
      </section>

      <section class="flow">
        <h2 class="section-title">${copy.routine}</h2>
        <div class="card-grid">
          <div class="block list">
            <p class="template-title">${copy.marinaEntry}</p>
            <div class="template">${formatPrintMultiline(marina.call)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.berthRequest}</p>
            <div class="template">${formatPrintMultiline(marina.berth)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.vtsInitial}</p>
            <div class="template">${formatPrintMultiline(vts.initial)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.coastCall}</p>
            <div class="template">${formatPrintMultiline(coast.general)}</div>
          </div>
        </div>

        <h2 class="section-title">${copy.emergency}</h2>
        <div class="card-grid">
          <div class="block list">
            <p class="template-title">${copy.mayday}</p>
            <div class="template">${formatPrintMultiline(emergency.distressCall)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.maydayRelay}</p>
            <div class="template">${formatPrintMultiline(emergency.distressRelay)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.panpan}</p>
            <div class="template">${formatPrintMultiline(emergency.urgencyMedical)}</div>
          </div>
          <div class="block list">
            <p class="template-title">${copy.securite}</p>
            <div class="template">${formatPrintMultiline(emergency.safetyNavWarn)}</div>
          </div>
        </div>
      </section>`;

    return buildStandalonePrintDocument({
      title: copy.title,
      subtitle: copy.subtitle,
      bodyHtml,
      footerLeft: copy.footerLeft,
      footerRight: copy.footerRight
    });
  };

  const printRadioQuickSheet = () => {
    openNavdeskPrintWindow(buildRadioQuickSheetHtml());
  };

  if (ukvPrintSheet) {
    ukvPrintSheet.addEventListener('click', () => {
      printRadioQuickSheet();
    });
  };

  window.NavDeskPrint = {
    buildNavdeskPrintShell,
    mountNavdeskPrintHtml,
    clearNavdeskPrintHtml,
    triggerNavdeskPrint,
    printFromHtml,
    printRadioQuickSheet
  };

  window.addEventListener('afterprint', () => {
    clearNavdeskPrintHtml();
  });

  if (typeof window.initNavdeskConsent === 'function') {
    window.initNavdeskConsent();
  }
})();

});


document.addEventListener('DOMContentLoaded', () => {
  const tideModeAuto = document.getElementById('tideModeAuto');
  const tideModeManual = document.getElementById('tideModeManual');
  const tideNextHigh = document.getElementById('tideNextHigh');
  const tideNextLow = document.getElementById('tideNextLow');
  const tideNextHighRow = tideNextHigh ? tideNextHigh.closest('p') : null;
  const tideNextLowRow = tideNextLow ? tideNextLow.closest('p') : null;

  const applyManualModeVisibility = () => {
    const manual = !!(tideModeManual && tideModeManual.checked);
    if (tideNextHighRow) tideNextHighRow.hidden = manual;
    if (tideNextLowRow) tideNextLowRow.hidden = manual;
  };

  if (tideModeAuto) tideModeAuto.addEventListener('change', applyManualModeVisibility);
  if (tideModeManual) tideModeManual.addEventListener('change', applyManualModeVisibility);
  applyManualModeVisibility();

  const localEl = document.getElementById('navdeskLocalTime');
  const utcEl = document.getElementById('navdeskUtcTime');
  const formatTime = (date, timeZone) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(date);
  const renderClock = () => {
    const now = new Date();
    if (localEl) localEl.textContent = formatTime(now);
    if (utcEl) utcEl.textContent = formatTime(now, 'UTC');
  };
  renderClock();
  setInterval(renderClock, 30000);
});

document.addEventListener('DOMContentLoaded', () => {
  const q = (id) => document.getElementById(id);

  const routeMode = q('routeMode');

  const fromInput = q('routeFromPlaceSearch');
  const fromBtn = q('routeFromPlaceSearchBtn');
  const fromDropdown = q('routeFromPlaceDropdown');
  const fromResult = q('routeFromPlaceResult');

  const toInput = q('routeToPlaceSearch');
  const toBtn = q('routeToPlaceSearchBtn');
  const toDropdown = q('routeToPlaceDropdown');
  const toResult = q('routeToPlaceResult');

  if (!fromInput || !fromBtn || !fromDropdown || !fromResult || !toInput || !toBtn || !toDropdown || !toResult) return;

  const tSafe = (key, fallback) => {
    try {
      if (typeof window.t === 'function') {
        const v = window.t(key);
        if (v && v !== key) return v;
      }
    } catch (e) {}
    return fallback;
  };

  const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const isDecimalMode = () => {
    const mode = String(routeMode?.value || 'marine').toLowerCase();
    return mode === 'decimal';
  };

  const toMarineParts = (value, isLat) => {
    const abs = Math.abs(Number(value) || 0);
    const deg = Math.floor(abs);
    const min = (abs - deg) * 60;
    const hem = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return {
      deg: String(deg).padStart(isLat ? 2 : 3, '0'),
      min: min.toFixed(3),
      hem
    };
  };

  const formatMarine = (lat, lon) => {
    const a = toMarineParts(lat, true);
    const b = toMarineParts(lon, false);
    return `${a.deg}° ${a.min}' ${a.hem} / ${b.deg}° ${b.min}' ${b.hem}`;
  };

  const formatDecimal = (lat, lon) => {
    return `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`;
  };

  const formatActive = (lat, lon) => isDecimalMode() ? formatDecimal(lat, lon) : formatMarine(lat, lon);

  const setResult = (node, text = '', mode = '') => {
    node.textContent = text;
    node.classList.remove('is-ok', 'is-error');
    if (mode) node.classList.add(mode);
  };

  const selectedResultText = (selected) => {
    if (!selected) return '';
    const prefix = tSafe('navdesk_route_search_result_prefix', 'Coordinates');
    return `${selected.name} · ${prefix}: ${formatActive(selected.lat, selected.lon)}`;
  };

  const setRoutePoint = (prefix, lat, lon) => {
    const latM = toMarineParts(lat, true);
    const lonM = toMarineParts(lon, false);

    const setVal = (id, val) => {
      const el = q(id);
      if (el) el.value = val;
    };

    setVal(`${prefix}LatDeg`, latM.deg);
    setVal(`${prefix}LatMin`, latM.min);
    setVal(`${prefix}LatHem`, latM.hem);
    setVal(`${prefix}LonDeg`, lonM.deg);
    setVal(`${prefix}LonMin`, lonM.min);
    setVal(`${prefix}LonHem`, lonM.hem);

    setVal(`${prefix}LatDecimal`, Number(lat).toFixed(6));
    setVal(`${prefix}LonDecimal`, Number(lon).toFixed(6));

    ['input', 'change'].forEach((evtName) => {
      [
        `${prefix}LatDeg`, `${prefix}LatMin`, `${prefix}LatHem`,
        `${prefix}LonDeg`, `${prefix}LonMin`, `${prefix}LonHem`,
        `${prefix}LatDecimal`, `${prefix}LonDecimal`
      ].forEach((id) => {
        const el = q(id);
        if (el) el.dispatchEvent(new Event(evtName, { bubbles: true }));
      });
    });
  };

  const state = {
    from: { items: [], activeIndex: -1, selected: null, timer: null },
    to: { items: [], activeIndex: -1, selected: null, timer: null }
  };

  const shortName = (item) => {
    const raw = String(item.display_name || '').split(',').map(v => v.trim()).filter(Boolean);
    return raw.slice(0, 2).join(', ') || item.name || 'Unknown place';
  };

  const highlightMatch = (text, query) => {
    const safeText = esc(text);
    const q = String(query || '').trim();
    if (q.length < 2) return safeText;
    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safeText.replace(new RegExp(`(${safeQ})`, 'ig'), '<mark>$1</mark>');
    } catch (e) {
      return safeText;
    }
  };

  const closeDropdown = (dropdown, st) => {
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    st.items = [];
    st.activeIndex = -1;
  };

  const renderDropdown = (dropdown, items, st, query = '') => {
    if (!items.length) {
      dropdown.innerHTML = `<button type="button" class="navdesk-route-inline-search__option"><span class="navdesk-route-inline-search__option-name">${esc(tSafe('navdesk_route_search_status_change_query', 'Change the query'))}</span></button>`;
      dropdown.hidden = false;
      st.items = [];
      st.activeIndex = -1;
      return;
    }

    dropdown.innerHTML = items.map((item, idx) => `
      <button type="button" class="navdesk-route-inline-search__option${idx === st.activeIndex ? ' is-active' : ''}" data-index="${idx}">
        <span class="navdesk-route-inline-search__option-name"><span class="navdesk-route-inline-search__pin" aria-hidden="true">📍</span>${highlightMatch(shortName(item), query)}</span>
        <span class="navdesk-route-inline-search__option-meta">${esc(formatActive(Number(item.lat), Number(item.lon)))}</span>
      </button>
    `).join('');

    dropdown.hidden = false;
  };

  const fetchMatches = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const applySelection = (kind, item) => {
    const st = state[kind];
    const input = kind === 'from' ? fromInput : toInput;
    const dropdown = kind === 'from' ? fromDropdown : toDropdown;
    const result = kind === 'from' ? fromResult : toResult;
    const prefix = kind === 'from' ? 'routeFrom' : 'routeTo';

    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    st.selected = { name: shortName(item), lat, lon };
    input.value = st.selected.name;
    setRoutePoint(prefix, lat, lon);
    setResult(result, `${tSafe('navdesk_route_search_status_inserted_short', 'Coordinates inserted')}: ${selectedResultText(st.selected)}`, 'is-ok');
    closeDropdown(dropdown, st);
  };

  const runLookup = async (kind, immediate = false) => {
    const input = kind === 'from' ? fromInput : toInput;
    const dropdown = kind === 'from' ? fromDropdown : toDropdown;
    const result = kind === 'from' ? fromResult : toResult;
    const st = state[kind];
    const query = String(input.value || '').trim();

    if (!query) {
      closeDropdown(dropdown, st);
      setResult(result, tSafe('navdesk_route_search_status_idle_inline', 'Enter a place'));
      return;
    }

    setResult(result, tSafe('navdesk_route_search_status_searching', 'Searching…'));

    try {
      const items = await fetchMatches(query);
      st.items = items;
      st.activeIndex = items.length ? 0 : -1;
      renderDropdown(dropdown, items, st, query);

      if (immediate && items.length) {
        applySelection(kind, items[0]);
      } else if (!items.length) {
        setResult(result, tSafe('navdesk_route_search_status_change_query', 'Change the query'), 'is-error');
      } else {
        setResult(result, '');
      }
    } catch (e) {
      closeDropdown(dropdown, st);
      setResult(result, tSafe('navdesk_route_search_status_change_query', 'Change the query'), 'is-error');
    }
  };

  const wire = (kind, input, btn, dropdown, result) => {
    const st = state[kind];

    input.addEventListener('input', () => {
      st.selected = null;
      setResult(result, '');
      if (st.timer) clearTimeout(st.timer);

      const value = String(input.value || '').trim();
      if (!value) {
        closeDropdown(dropdown, st);
        return;
      }

      st.timer = setTimeout(() => runLookup(kind, false), 320);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!st.items.length) return;
        st.activeIndex = (st.activeIndex + 1) % st.items.length;
        renderDropdown(dropdown, st.items, st, input.value);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!st.items.length) return;
        st.activeIndex = (st.activeIndex - 1 + st.items.length) % st.items.length;
        renderDropdown(dropdown, st.items, st, input.value);
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (!dropdown.hidden && st.items.length && st.activeIndex >= 0) {
          applySelection(kind, st.items[st.activeIndex]);
        } else {
          runLookup(kind, true);
        }
      }

      if (e.key === 'Escape') {
        closeDropdown(dropdown, st);
      }
    });

    btn.addEventListener('click', () => runLookup(kind, true));

    dropdown.addEventListener('click', (e) => {
      const option = e.target.closest('[data-index]');
      if (!option) return;
      const idx = Number(option.getAttribute('data-index'));
      if (!Number.isInteger(idx) || !st.items[idx]) return;
      applySelection(kind, st.items[idx]);
    });
  };

  wire('from', fromInput, fromBtn, fromDropdown, fromResult);
  wire('to', toInput, toBtn, toDropdown, toResult);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navdesk-route-inline-search__searchbox')) {
      closeDropdown(fromDropdown, state.from);
      closeDropdown(toDropdown, state.to);
    }
  });

  const refreshSelectedResults = () => {
    ['from', 'to'].forEach((kind) => {
      const st = state[kind];
      const result = kind === 'from' ? fromResult : toResult;
      if (st.selected) {
        setResult(result, selectedResultText(st.selected), 'is-ok');
      }
    });
  };

  if (routeMode) routeMode.addEventListener('change', refreshSelectedResults);
  document.addEventListener('languageChanged', refreshSelectedResults);
});

/* === Nav Abbrev card 20260424-13 === */
document.addEventListener('DOMContentLoaded', () => {
  const shell = document.getElementById('navdesk-abbrev-card');
  const toggle = document.getElementById('navdesk_abbrev_toggle');
  const body = document.getElementById('navdesk_abbrev_body');
  const pin = document.getElementById('navdesk_abbrev_pin');

  if (shell && toggle && body) {
    const key = 'navdeskCardState:navdesk-abbrev-card';

    const open = (save = true) => {
      shell.classList.remove('is-collapsed');
      shell.classList.add('is-open');
      body.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      /* Nav Abbrev: do not persist open state */
    };

    const close = (save = true) => {
      if (shell.classList.contains('is-pinned')) return;
      shell.classList.remove('is-open');
      shell.classList.add('is-collapsed');
      body.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      /* Nav Abbrev: do not persist closed state */
    };

    const setPinned = (value, save = true) => {
      shell.classList.toggle('is-pinned', !!value);
      if (pin) pin.setAttribute('aria-pressed', value ? 'true' : 'false');
      if (value) open(false);
      /* Nav Abbrev: do not persist pinned state */
    };

    try {
      localStorage.removeItem(key);
    } catch (e) {}
    close(false);

    toggle.addEventListener('click', () => shell.classList.contains('is-open') ? close() : open());
    if (pin) pin.addEventListener('click', () => setPinned(!shell.classList.contains('is-pinned')));
  }

  const root = document.getElementById('navdeskAbbrev');
  const input = document.getElementById('navdeskAbbrevInput');
  const results = document.getElementById('navdeskAbbrevResults');
  const tabs = Array.from(document.querySelectorAll('[data-abbrev-scope]'));
  const quick = document.getElementById('navdeskAbbrevQuick');

  if (!root || !input || !results) return;

  const getUiLang = () => {
    const active = document.querySelector('.lang-switch__btn.is-active');
    const lang = active?.dataset?.lang || document.documentElement.getAttribute('lang') || 'ru';
    return String(lang).toLowerCase().startsWith('en') ? 'en' : 'ru';
  };

  let activeScope = 'chart';

  const data = [
    {
        "code": "AIS",
        "full": "Automatic Identification System",
        "ru": "Автоматическая идентификационная система",
        "hintRu": "Помогает понять, кто рядом, куда он идёт и насколько это может быть опасно.",
        "hintEn": "Shows who is nearby, where they are going, and whether they may become a risk.",
        "ruDef": "Система обмена данными между судами и берегом: идентификация, позиция, курс, скорость и дополнительные сведения.",
        "enDef": "A vessel data system broadcasting identity, position, course, speed and other information.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "CPA",
        "full": "Closest Point of Approach",
        "ru": "Минимальная дистанция сближения",
        "hintRu": "Главная цифра риска: насколько близко цель пройдёт от вашего судна.",
        "hintEn": "The key collision-risk distance: how close the target will pass your vessel.",
        "ruDef": "Расчётная минимальная дистанция между вашим судном и выбранной целью при текущих курсах и скоростях.",
        "enDef": "The predicted closest distance between own vessel and a selected target.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "TCPA",
        "full": "Time to Closest Point of Approach",
        "ru": "Время до минимального сближения",
        "hintRu": "Показывает, сколько времени осталось до самой близкой точки сближения.",
        "hintEn": "Shows how much time remains before the closest approach.",
        "ruDef": "Расчётное время до достижения CPA при текущем движении.",
        "enDef": "The predicted time remaining before CPA is reached.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "COG",
        "full": "Course Over Ground",
        "ru": "Курс относительно грунта",
        "hintRu": "Показывает, куда судно реально движется, а не куда смотрит нос.",
        "hintEn": "Shows where the vessel is actually moving, not just where the bow points.",
        "ruDef": "Фактическое направление движения судна относительно поверхности Земли.",
        "enDef": "The actual direction of movement over ground.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "SOG",
        "full": "Speed Over Ground",
        "ru": "Скорость относительно грунта",
        "hintRu": "Показывает реальную скорость продвижения по земле с учётом течения.",
        "hintEn": "Shows real progress over ground, including current effects.",
        "ruDef": "Скорость судна относительно грунта, получаемая от GPS/GNSS.",
        "enDef": "The vessel speed over ground, usually from GPS/GNSS.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "HDG",
        "full": "Heading",
        "ru": "Курс носа судна",
        "hintRu": "Показывает, куда направлен нос; течение может нести судно в другую сторону.",
        "hintEn": "Shows where the bow points; current may move the vessel elsewhere.",
        "ruDef": "Направление диаметральной плоскости судна, обычно по компасу.",
        "enDef": "The direction in which the vessel’s bow is pointing.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "BRG",
        "full": "Bearing",
        "ru": "Пеленг",
        "hintRu": "Направление на объект, цель или путевую точку.",
        "hintEn": "Direction from you to an object, target or waypoint.",
        "ruDef": "Угловое направление от одной точки к другой, обычно в градусах.",
        "enDef": "The angular direction from one point to another, usually in degrees.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "RNG",
        "full": "Range",
        "ru": "Дальность",
        "hintRu": "Показывает расстояние до цели, берега или выбранной точки.",
        "hintEn": "Shows distance to a target, coast or selected point.",
        "ruDef": "Измеренная или рассчитанная дистанция до объекта.",
        "enDef": "Measured or calculated distance to an object.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "MOB",
        "full": "Man Overboard",
        "ru": "Человек за бортом",
        "hintRu": "Кнопка, которую нажимают сразу: она фиксирует место падения человека.",
        "hintEn": "Immediate emergency mark for a person overboard position.",
        "ruDef": "Аварийная функция для отметки позиции человека за бортом.",
        "enDef": "Emergency function marking a man-overboard position.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "ETA",
        "full": "Estimated Time of Arrival",
        "ru": "Ожидаемое время прибытия",
        "hintRu": "Помогает понять, когда вы придёте при текущей скорости и маршруте.",
        "hintEn": "Shows when you are expected to arrive at current speed and route.",
        "ruDef": "Расчётное время прибытия в выбранную точку или порт.",
        "enDef": "Predicted arrival time at a waypoint or destination.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "UTC",
        "full": "Coordinated Universal Time",
        "ru": "Всемирное координированное время",
        "hintRu": "Общее время для судового журнала, связи, прогноза и навигации.",
        "hintEn": "Common time reference for logbook, radio, forecasts and navigation.",
        "ruDef": "Международная шкала времени, используемая как стандарт в море.",
        "enDef": "The standard international reference time.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "LAT",
        "full": "Latitude",
        "ru": "Широта",
        "hintRu": "Север-юг вашей позиции.",
        "hintEn": "The north-south part of your position.",
        "ruDef": "Географическая координата, показывающая положение к северу или югу от экватора.",
        "enDef": "Geographic coordinate north or south of the equator.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "LON",
        "full": "Longitude",
        "ru": "Долгота",
        "hintRu": "Восток-запад вашей позиции.",
        "hintEn": "The east-west part of your position.",
        "ruDef": "Географическая координата, показывающая положение к востоку или западу от Гринвича.",
        "enDef": "Geographic coordinate east or west of Greenwich.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "POS",
        "full": "Position",
        "ru": "Позиция",
        "hintRu": "Где находится судно или выбранная точка.",
        "hintEn": "Where the vessel or selected point is.",
        "ruDef": "Координаты текущего или заданного места.",
        "enDef": "Coordinates of the current or selected location.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "WPT",
        "full": "Waypoint",
        "ru": "Путевая точка",
        "hintRu": "Точка, к которой ведёт маршрут или автопилот.",
        "hintEn": "The point your route or autopilot is navigating toward.",
        "ruDef": "Сохранённая навигационная точка, используемая в маршруте.",
        "enDef": "A stored navigation point used in a route.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "RTE",
        "full": "Route",
        "ru": "Маршрут",
        "hintRu": "Цепочка точек, по которой планируется переход.",
        "hintEn": "A chain of waypoints forming the planned passage.",
        "ruDef": "Последовательность путевых точек для навигации.",
        "enDef": "A sequence of waypoints used for navigation.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "TRK",
        "full": "Track",
        "ru": "Трек / путь",
        "hintRu": "Линия, которую судно реально прошло.",
        "hintEn": "The line the vessel actually followed.",
        "ruDef": "Фактический путь судна относительно грунта.",
        "enDef": "The actual path of the vessel over ground.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "XTE",
        "full": "Cross Track Error",
        "ru": "Боковое отклонение от маршрута",
        "hintRu": "Показывает, насколько вы ушли в сторону от линии пути.",
        "hintEn": "Shows how far you are off the planned route line.",
        "ruDef": "Перпендикулярное расстояние от текущей позиции до запланированной линии маршрута.",
        "enDef": "Perpendicular distance from current position to planned track.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "VMG",
        "full": "Velocity Made Good",
        "ru": "Полезная скорость на цель",
        "hintRu": "Показывает, насколько эффективно вы приближаетесь к нужной точке.",
        "hintEn": "Shows how effectively you are moving toward the target.",
        "ruDef": "Составляющая скорости в направлении выбранной цели или ориентира.",
        "enDef": "Speed component made good toward a selected target or reference.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "BTW",
        "full": "Bearing To Waypoint",
        "ru": "Пеленг на путевую точку",
        "hintRu": "Куда направляться на выбранную точку.",
        "hintEn": "The direction to steer toward the selected waypoint.",
        "ruDef": "Пеленг от текущей позиции на активную путевую точку.",
        "enDef": "Bearing from current position to the active waypoint.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DTW",
        "full": "Distance To Waypoint",
        "ru": "Расстояние до путевой точки",
        "hintRu": "Сколько осталось до активной точки.",
        "hintEn": "How far remains to the active waypoint.",
        "ruDef": "Дистанция от текущей позиции до выбранной путевой точки.",
        "enDef": "Distance from current position to the selected waypoint.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "TTG",
        "full": "Time To Go",
        "ru": "Оставшееся время",
        "hintRu": "Сколько идти до точки при текущей скорости.",
        "hintEn": "Time remaining to the waypoint at current speed.",
        "ruDef": "Расчётное время до достижения активной точки или цели.",
        "enDef": "Estimated time remaining to the active waypoint or destination.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ROT",
        "full": "Rate Of Turn",
        "ru": "Скорость поворота",
        "hintRu": "Показывает, насколько быстро судно меняет курс.",
        "hintEn": "Shows how fast the vessel is turning.",
        "ruDef": "Угловая скорость изменения курса судна.",
        "enDef": "Angular rate of change of vessel heading.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "CSE",
        "full": "Course",
        "ru": "Курс",
        "hintRu": "Заданное или отображаемое направление движения.",
        "hintEn": "The selected or displayed navigation direction.",
        "ruDef": "Навигационное направление, используемое для следования маршруту.",
        "enDef": "Navigation direction used for steering or route following.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "SPD",
        "full": "Speed",
        "ru": "Скорость",
        "hintRu": "Общее поле скорости, контекст зависит от прибора.",
        "hintEn": "General speed value; context depends on the instrument.",
        "ruDef": "Обозначение скорости судна или цели.",
        "enDef": "General speed indication for vessel or target.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "DST",
        "full": "Distance",
        "ru": "Дистанция",
        "hintRu": "Расстояние между точками, до цели или до маршрута.",
        "hintEn": "Distance between points, to a target, or along a route.",
        "ruDef": "Измеренное или рассчитанное расстояние.",
        "enDef": "Measured or calculated distance.",
        "scope": [
            "chart",
            "radar"
        ]
    },
    {
        "code": "DEPTH",
        "full": "Depth",
        "ru": "Глубина",
        "hintRu": "Ключевая величина безопасности под килем.",
        "hintEn": "Key safety value for under-keel clearance.",
        "ruDef": "Глубина воды по эхолоту или карте.",
        "enDef": "Water depth from sounder or chart data.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DPT",
        "full": "Depth",
        "ru": "Глубина",
        "hintRu": "Короткое обозначение глубины в данных прибора.",
        "hintEn": "Short depth field from instrument data.",
        "ruDef": "Навигационное значение глубины, часто из NMEA.",
        "enDef": "Depth value, often carried in NMEA data.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "TWA",
        "full": "True Wind Angle",
        "ru": "Истинный угол ветра",
        "hintRu": "Показывает угол реального ветра относительно судна.",
        "hintEn": "Shows true wind angle relative to the vessel.",
        "ruDef": "Угол истинного ветра относительно диаметральной плоскости судна.",
        "enDef": "True wind angle relative to the vessel.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "TWS",
        "full": "True Wind Speed",
        "ru": "Истинная скорость ветра",
        "hintRu": "Скорость ветра без влияния собственного движения судна.",
        "hintEn": "Wind speed after removing the vessel’s own motion.",
        "ruDef": "Скорость истинного ветра.",
        "enDef": "True wind speed.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "AWS",
        "full": "Apparent Wind Speed",
        "ru": "Вымпельная скорость ветра",
        "hintRu": "То, что фактически чувствуют паруса и экипаж.",
        "hintEn": "The wind the sails and crew actually feel.",
        "ruDef": "Скорость кажущегося ветра на движущемся судне.",
        "enDef": "Apparent wind speed on a moving vessel.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "GPS",
        "full": "Global Positioning System",
        "ru": "GPS",
        "hintRu": "Источник позиции, но его точность надо оценивать.",
        "hintEn": "Position source, but accuracy still needs checking.",
        "ruDef": "Спутниковая система определения координат.",
        "enDef": "Satellite positioning system.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "GNSS",
        "full": "Global Navigation Satellite System",
        "ru": "Глобальная спутниковая навигация",
        "hintRu": "Общее имя для GPS, Galileo, GLONASS, BeiDou и других систем.",
        "hintEn": "Umbrella term for GPS, Galileo, GLONASS, BeiDou and others.",
        "ruDef": "Совокупность спутниковых систем позиционирования.",
        "enDef": "General term for satellite navigation systems.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DOP",
        "full": "Dilution of Precision",
        "ru": "Понижение точности",
        "hintRu": "Чем хуже геометрия спутников, тем меньше доверия к позиции.",
        "hintEn": "Poor satellite geometry means less trust in position.",
        "ruDef": "Показатель влияния расположения спутников на точность координат.",
        "enDef": "Indicator of satellite geometry effect on position accuracy.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "HDOP",
        "full": "Horizontal Dilution of Precision",
        "ru": "Горизонтальная точность",
        "hintRu": "Показывает качество широты и долготы.",
        "hintEn": "Shows the quality of latitude and longitude fix.",
        "ruDef": "Показатель точности горизонтального спутникового позиционирования.",
        "enDef": "Horizontal satellite positioning quality indicator.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "VDOP",
        "full": "Vertical Dilution of Precision",
        "ru": "Вертикальная точность",
        "hintRu": "Показывает качество высоты; на яхте обычно вторично.",
        "hintEn": "Shows height quality; usually secondary for small craft navigation.",
        "ruDef": "Показатель точности вертикального спутникового позиционирования.",
        "enDef": "Vertical satellite positioning quality indicator.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DGPS",
        "full": "Differential GPS",
        "ru": "Дифференциальный GPS",
        "hintRu": "Уточняет позицию за счёт поправок.",
        "hintEn": "Improves position using correction data.",
        "ruDef": "GPS-позиционирование с дифференциальными поправками.",
        "enDef": "GPS positioning with differential corrections.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "WAAS",
        "full": "Wide Area Augmentation System",
        "ru": "Система уточнения GPS",
        "hintRu": "Повышает точность спутниковой позиции в зоне покрытия.",
        "hintEn": "Improves satellite position accuracy where available.",
        "ruDef": "Спутниковая система коррекции GPS.",
        "enDef": "Satellite augmentation system for GPS correction.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "SBAS",
        "full": "Satellite Based Augmentation System",
        "ru": "Спутниковая система коррекции",
        "hintRu": "Общий класс систем поправок для GNSS.",
        "hintEn": "General class of GNSS correction systems.",
        "ruDef": "Спутниковая система повышения точности и контроля GNSS.",
        "enDef": "Satellite system improving GNSS accuracy and integrity.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ENC",
        "full": "Electronic Navigational Chart",
        "ru": "Электронная навигационная карта",
        "hintRu": "Официальная векторная карта, не просто картинка.",
        "hintEn": "Official vector chart, not just a picture.",
        "ruDef": "Стандартизированная электронная карта для навигации.",
        "enDef": "Standardized electronic chart for navigation.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ECDIS",
        "full": "Electronic Chart Display and Information System",
        "ru": "ECDIS",
        "hintRu": "Профессиональная система, которая может заменить бумажные карты при соблюдении требований.",
        "hintEn": "Certified ship system that may replace paper charts under requirements.",
        "ruDef": "Сертифицированная система отображения электронных карт и навигационной информации.",
        "enDef": "Certified electronic chart display and information system.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ECS",
        "full": "Electronic Chart System",
        "ru": "Электронная картографическая система",
        "hintRu": "Похожа на ECDIS, но не всегда имеет его юридический статус.",
        "hintEn": "Chart system similar to ECDIS but not always legally equivalent.",
        "ruDef": "Электронная картографическая система без обязательной сертификации ECDIS.",
        "enDef": "Electronic chart system not necessarily ECDIS certified.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DR",
        "full": "Dead Reckoning",
        "ru": "Счисление пути",
        "hintRu": "Позиция по курсу, скорости и времени, когда GPS не главный источник.",
        "hintEn": "Position estimate from course, speed and time when GPS is not enough.",
        "ruDef": "Метод оценки позиции по предыдущей позиции, курсу, скорости и времени.",
        "enDef": "Position estimate from previous position, course, speed and time.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "CTS",
        "full": "Course To Steer",
        "ru": "Курс для удержания пути",
        "hintRu": "Курс, которым надо рулить, чтобы компенсировать снос.",
        "hintEn": "Steering course needed to compensate set and drift.",
        "ruDef": "Расчётный курс управления с учётом течения, ветра или дрейфа.",
        "enDef": "Calculated steering course allowing for current, wind or leeway.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "SET",
        "full": "Set",
        "ru": "Направление течения",
        "hintRu": "Куда несёт воду и судно.",
        "hintEn": "Direction in which the current carries you.",
        "ruDef": "Направление, в котором движется течение.",
        "enDef": "Direction toward which current flows.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DRIFT",
        "full": "Drift",
        "ru": "Скорость течения",
        "hintRu": "Насколько быстро течение сносит судно.",
        "hintEn": "How fast current moves the vessel sideways or along track.",
        "ruDef": "Скорость течения.",
        "enDef": "Speed of current.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "CMG",
        "full": "Course Made Good",
        "ru": "Фактически достигнутый курс",
        "hintRu": "Реальный курс между двумя позициями.",
        "hintEn": "The course actually achieved between positions.",
        "ruDef": "Курс, фактически получившийся относительно грунта.",
        "enDef": "Actual course achieved over ground.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "SMG",
        "full": "Speed Made Good",
        "ru": "Фактически достигнутая скорость",
        "hintRu": "Реальная скорость продвижения к цели.",
        "hintEn": "The speed actually achieved toward the objective.",
        "ruDef": "Скорость, фактически получившаяся в направлении маршрута или цели.",
        "enDef": "Actual speed achieved toward a route or destination.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "TIDE",
        "full": "Tide",
        "ru": "Прилив / отлив",
        "hintRu": "Меняет глубину, течение и безопасное окно прохода.",
        "hintEn": "Changes depth, current and safe-passage window.",
        "ruDef": "Периодическое изменение уровня моря.",
        "enDef": "Periodic rise and fall of sea level.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "HW",
        "full": "High Water",
        "ru": "Полная вода",
        "hintRu": "Момент максимального уровня воды.",
        "hintEn": "Time or level of maximum water height.",
        "ruDef": "Наибольший уровень прилива в данном цикле.",
        "enDef": "Highest tide level in a cycle.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "LW",
        "full": "Low Water",
        "ru": "Малая вода",
        "hintRu": "Момент минимального уровня воды.",
        "hintEn": "Time or level of minimum water height.",
        "ruDef": "Наименьший уровень прилива в данном цикле.",
        "enDef": "Lowest tide level in a cycle.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "UKC",
        "full": "Under Keel Clearance",
        "ru": "Запас под килем",
        "hintRu": "Сколько реально остаётся воды между килем и дном.",
        "hintEn": "The real water margin between keel and seabed.",
        "ruDef": "Вертикальное расстояние между нижней точкой киля и грунтом.",
        "enDef": "Vertical clearance between keel and seabed.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DRAUGHT",
        "full": "Draught",
        "ru": "Осадка",
        "hintRu": "Сколько судно уходит под воду.",
        "hintEn": "How deep the vessel sits in the water.",
        "ruDef": "Расстояние от ватерлинии до нижней точки киля.",
        "enDef": "Distance from waterline to the lowest point of the keel.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "DEP",
        "full": "Departure",
        "ru": "Пункт выхода",
        "hintRu": "Откуда начинается расчёт маршрута.",
        "hintEn": "Start point of the route calculation.",
        "ruDef": "Начальная точка маршрута.",
        "enDef": "Starting point of a route.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ARR",
        "full": "Arrival",
        "ru": "Пункт прибытия",
        "hintRu": "Куда ведёт маршрут.",
        "hintEn": "Destination point of the route.",
        "ruDef": "Конечная точка маршрута.",
        "enDef": "Final point of a route.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "LEG",
        "full": "Route Leg",
        "ru": "Участок маршрута",
        "hintRu": "Один отрезок между двумя точками.",
        "hintEn": "One segment between two route points.",
        "ruDef": "Часть маршрута между соседними путевыми точками.",
        "enDef": "Part of a route between adjacent waypoints.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "GOTO",
        "full": "Go To",
        "ru": "Идти к точке",
        "hintRu": "Быстрый прямой переход на выбранную точку.",
        "hintEn": "Direct navigation to a selected point.",
        "ruDef": "Функция прямой навигации к выбранной точке.",
        "enDef": "Function for direct navigation to a selected point.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "MARK",
        "full": "Mark",
        "ru": "Метка",
        "hintRu": "Сохранить важное место прямо сейчас.",
        "hintEn": "Save an important position immediately.",
        "ruDef": "Пользовательская отметка на карте.",
        "enDef": "User-created mark on the chart.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "NAV",
        "full": "Navigation",
        "ru": "Навигация",
        "hintRu": "Режим, где прибор ведёт к точке или по маршруту.",
        "hintEn": "Mode where the instrument guides to a waypoint or route.",
        "ruDef": "Общий навигационный режим или набор навигационных данных.",
        "enDef": "General navigation mode or navigation data.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ALM",
        "full": "Alarm",
        "ru": "Тревога",
        "hintRu": "Сигнал, который нельзя машинально закрывать.",
        "hintEn": "A warning that should not be dismissed automatically.",
        "ruDef": "Предупреждение прибора о заданном событии или опасности.",
        "enDef": "Instrument warning for a configured event or hazard.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ANCH",
        "full": "Anchor",
        "ru": "Якорь",
        "hintRu": "Контроль стоянки и дрейфа на якоре.",
        "hintEn": "Helps monitor anchoring and dragging.",
        "ruDef": "Якорная функция или тревога выхода из зоны.",
        "enDef": "Anchor function or anchor drag alarm.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "MAP",
        "full": "Map",
        "ru": "Карта",
        "hintRu": "Картографический экран прибора.",
        "hintEn": "Chart display screen.",
        "ruDef": "Режим отображения карты.",
        "enDef": "Map or chart display mode.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "SCALE",
        "full": "Chart Scale",
        "ru": "Масштаб карты",
        "hintRu": "Определяет, сколько деталей вы видите и чему можно доверять.",
        "hintEn": "Controls detail level and how the chart should be read.",
        "ruDef": "Масштаб отображения карты.",
        "enDef": "Scale of the chart display.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "ZOOM",
        "full": "Zoom",
        "ru": "Масштабирование",
        "hintRu": "Приближает или отдаляет карту, но не меняет точность данных.",
        "hintEn": "Changes display view, not underlying data accuracy.",
        "ruDef": "Изменение масштаба отображения.",
        "enDef": "Display magnification adjustment.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "POI",
        "full": "Point Of Interest",
        "ru": "Интересующая точка",
        "hintRu": "Марина, буй, сервис или объект на карте.",
        "hintEn": "Marina, buoy, service or chart object.",
        "ruDef": "Объект интереса на картографическом дисплее.",
        "enDef": "Point of interest on chart display.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "NMEA",
        "full": "National Marine Electronics Association",
        "ru": "NMEA",
        "hintRu": "Язык, на котором приборы обмениваются данными.",
        "hintEn": "The language marine instruments use to exchange data.",
        "ruDef": "Стандарт обмена данными морской электроники.",
        "enDef": "Marine electronics data communication standard.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "RMB",
        "full": "Recommended Minimum Navigation Information B",
        "ru": "NMEA RMB",
        "hintRu": "Данные ведения к путевой точке.",
        "hintEn": "Waypoint navigation data sentence.",
        "ruDef": "NMEA-сообщение с информацией о маршруте и активной точке.",
        "enDef": "NMEA sentence carrying waypoint navigation information.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "RMC",
        "full": "Recommended Minimum Navigation Information C",
        "ru": "NMEA RMC",
        "hintRu": "Минимальный набор: позиция, курс, скорость и время.",
        "hintEn": "Core position, course, speed and time sentence.",
        "ruDef": "NMEA-сообщение с координатами, временем, COG и SOG.",
        "enDef": "NMEA sentence containing position, time, COG and SOG.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "GLL",
        "full": "Geographic Position Latitude Longitude",
        "ru": "NMEA GLL",
        "hintRu": "Координаты широты и долготы.",
        "hintEn": "Latitude and longitude sentence.",
        "ruDef": "NMEA-сообщение с географической позицией.",
        "enDef": "NMEA sentence containing geographic position.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "VTG",
        "full": "Course Over Ground and Ground Speed",
        "ru": "NMEA VTG",
        "hintRu": "Курс и скорость по грунту.",
        "hintEn": "Course and speed over ground sentence.",
        "ruDef": "NMEA-сообщение с COG и SOG.",
        "enDef": "NMEA sentence containing COG and SOG.",
        "scope": [
            "chart"
        ]
    },
    {
        "code": "EBL",
        "full": "Electronic Bearing Line",
        "ru": "Электронная линия пеленга",
        "hintRu": "Быстро снять пеленг на цель или ориентир с экрана радара.",
        "hintEn": "Quickly take a bearing to a target or reference.",
        "ruDef": "Электронная линия радара для измерения направления на объект.",
        "enDef": "Electronic radar line for measuring bearing to an object.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "VRM",
        "full": "Variable Range Marker",
        "ru": "Подвижный маркер дальности",
        "hintRu": "Быстро измерить дистанцию до цели, берега или опасности.",
        "hintEn": "Quickly measure range to a target, coast or hazard.",
        "ruDef": "Подвижное кольцо радара для измерения дальности.",
        "enDef": "Movable radar range ring used to measure distance.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "ARPA",
        "full": "Automatic Radar Plotting Aid",
        "ru": "Автоматическая радиолокационная прокладка",
        "hintRu": "Не просто отметка: система ведёт цель и оценивает риск сближения.",
        "hintEn": "Not just an echo: the system tracks target movement and collision risk.",
        "ruDef": "Функция радара для автоматического сопровождения целей и расчёта CPA/TCPA.",
        "enDef": "Radar function automatically tracking targets and calculating CPA/TCPA.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "MARPA",
        "full": "Mini Automatic Radar Plotting Aid",
        "ru": "Упрощённое сопровождение целей",
        "hintRu": "Похоже на ARPA, но обычно проще и зависит от качества датчиков.",
        "hintEn": "ARPA-like tracking, usually simpler and sensor-dependent.",
        "ruDef": "Упрощённая функция сопровождения целей на маломерных радарах.",
        "enDef": "Simplified target tracking function on small craft radars.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TT",
        "full": "Tracked Target",
        "ru": "Сопровождаемая цель",
        "hintRu": "Цель уже взята в расчёт системой.",
        "hintEn": "The system is already calculating this target.",
        "ruDef": "Радарная или AIS-цель, которую система сопровождает.",
        "enDef": "Radar or AIS target being tracked by the system.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TGT",
        "full": "Target",
        "ru": "Цель",
        "hintRu": "Обнаруженный контакт, который требует оценки.",
        "hintEn": "A detected contact that may need assessment.",
        "ruDef": "Отметка или контакт на экране радара.",
        "enDef": "A radar echo or contact shown on the display.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TLL",
        "full": "Target Latitude Longitude",
        "ru": "Координаты цели",
        "hintRu": "Передать или сохранить координаты выбранной цели.",
        "hintEn": "Send or store the selected target’s coordinates.",
        "ruDef": "Функция передачи широты и долготы цели.",
        "enDef": "Function or message carrying target latitude and longitude.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "RM",
        "full": "Relative Motion",
        "ru": "Относительное движение",
        "hintRu": "Показывает, как цели движутся относительно вашего судна.",
        "hintEn": "Shows how targets move relative to your vessel.",
        "ruDef": "Режим отображения движения целей относительно собственного судна.",
        "enDef": "Radar display mode showing motion relative to own vessel.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TM",
        "full": "True Motion",
        "ru": "Истинное движение",
        "hintRu": "Показывает движение целей относительно земли.",
        "hintEn": "Shows target movement over ground.",
        "ruDef": "Режим радара с отображением истинного движения.",
        "enDef": "Radar mode showing true motion over ground.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "RCPA",
        "full": "Radar Closest Point of Approach",
        "ru": "Радарный CPA",
        "hintRu": "CPA, рассчитанный по радарному сопровождению.",
        "hintEn": "CPA calculated from radar tracking.",
        "ruDef": "Минимальная дистанция сближения по данным радара.",
        "enDef": "Closest point of approach calculated from radar target data.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "GAIN",
        "full": "Receiver Gain",
        "ru": "Усиление приёмника",
        "hintRu": "Слишком мало — потеряешь цель; слишком много — утонешь в шуме.",
        "hintEn": "Too low loses targets; too high floods the screen with noise.",
        "ruDef": "Регулировка чувствительности приёмника радара.",
        "enDef": "Radar receiver sensitivity control.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "SEA",
        "full": "Sea Clutter",
        "ru": "Помехи от волн",
        "hintRu": "Убирает ближнюю засветку, но может спрятать малые цели.",
        "hintEn": "Reduces wave clutter, but can hide small targets.",
        "ruDef": "Помехи на радаре от отражения волн.",
        "enDef": "Radar returns caused by sea waves.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "RAIN",
        "full": "Rain Clutter",
        "ru": "Помехи от дождя",
        "hintRu": "Помогает видеть цели в осадках, но требует осторожной настройки.",
        "hintEn": "Helps in precipitation, but needs careful adjustment.",
        "ruDef": "Помехи радара от дождя или осадков.",
        "enDef": "Radar returns caused by rain or precipitation.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "STC",
        "full": "Sensitivity Time Control",
        "ru": "Подавление ближних помех",
        "hintRu": "Настройка ближней зоны радара против засветки от моря.",
        "hintEn": "Controls close-range sea clutter.",
        "ruDef": "Регулировка, уменьшающая чувствительность на малых дистанциях.",
        "enDef": "Control reducing close-range sensitivity to suppress sea clutter.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "FTC",
        "full": "Fast Time Constant",
        "ru": "Подавление дождевых помех",
        "hintRu": "Ослабляет широкую засветку дождя.",
        "hintEn": "Reduces broad rain clutter.",
        "ruDef": "Радарная обработка для уменьшения дождевых помех.",
        "enDef": "Radar processing used to reduce rain clutter.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "GUARD",
        "full": "Guard Zone",
        "ru": "Охранная зона",
        "hintRu": "Радар сам предупреждает, если цель входит в заданную область.",
        "hintEn": "Radar warns when a target enters a defined area.",
        "ruDef": "Зона тревоги на радаре для обнаружения входящих целей.",
        "enDef": "Radar alarm zone for detecting targets entering a set area.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TRAILS",
        "full": "Target Trails",
        "ru": "Следы целей",
        "hintRu": "Сразу показывает, куда двигались цели.",
        "hintEn": "Shows where targets have been moving.",
        "ruDef": "Отображение предыдущих положений целей.",
        "enDef": "Display of previous target positions.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "HU",
        "full": "Head Up",
        "ru": "Нос вверх",
        "hintRu": "Экран ориентирован по носу судна: удобно рулить, хуже для общей картины.",
        "hintEn": "Display follows the bow; useful for steering but weaker for overview.",
        "ruDef": "Режим ориентации радара, где верх экрана соответствует курсу носа.",
        "enDef": "Radar orientation with own heading at the top.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "NU",
        "full": "North Up",
        "ru": "Север вверх",
        "hintRu": "Экран совпадает с картой: удобно для навигационной картины.",
        "hintEn": "Display matches chart orientation for navigation overview.",
        "ruDef": "Режим ориентации радара, где верх экрана соответствует северу.",
        "enDef": "Radar orientation with north at the top.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "CU",
        "full": "Course Up",
        "ru": "Курс вверх",
        "hintRu": "Экран ориентирован по выбранному курсу.",
        "hintEn": "Display is oriented to selected course.",
        "ruDef": "Режим, где верх экрана соответствует заданному курсу.",
        "enDef": "Radar orientation with selected course at the top.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "RR",
        "full": "Range Rings",
        "ru": "Кольца дальности",
        "hintRu": "Быстрая грубая оценка расстояний на экране.",
        "hintEn": "Quick rough range estimation on screen.",
        "ruDef": "Концентрические кольца дальности на радаре.",
        "enDef": "Concentric radar range rings.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "TX",
        "full": "Transmit",
        "ru": "Передача",
        "hintRu": "Радар излучает — антенна работает в эфир.",
        "hintEn": "Radar is transmitting; antenna is radiating.",
        "ruDef": "Состояние радара, при котором передатчик активен.",
        "enDef": "Radar state where transmitter is active.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "STBY",
        "full": "Standby",
        "ru": "Ожидание",
        "hintRu": "Радар включён, но не излучает.",
        "hintEn": "Radar powered but not transmitting.",
        "ruDef": "Режим ожидания без передачи радиолокационного импульса.",
        "enDef": "Standby mode without radar transmission.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "IR",
        "full": "Interference Rejection",
        "ru": "Подавление взаимных помех",
        "hintRu": "Уменьшает помехи от других радаров.",
        "hintEn": "Reduces interference from other radars.",
        "ruDef": "Обработка сигнала для снижения радарных взаимных помех.",
        "enDef": "Signal processing reducing radar-to-radar interference.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "PI",
        "full": "Parallel Index",
        "ru": "Параллельный индекс",
        "hintRu": "Полезно для проводки вдоль берега, фарватера или опасности.",
        "hintEn": "Useful for pilotage along coast, channel or danger line.",
        "ruDef": "Параллельная контрольная линия на экране радара.",
        "enDef": "Parallel reference line on radar display.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "OFFC",
        "full": "Off Centre",
        "ru": "Смещение центра",
        "hintRu": "Даёт больше обзора впереди по ходу движения.",
        "hintEn": "Gives more display range ahead of the vessel.",
        "ruDef": "Смещение собственного судна от центра экрана.",
        "enDef": "Moves own ship away from display center.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "AZI",
        "full": "Azimuth",
        "ru": "Азимут",
        "hintRu": "Угловое направление на цель.",
        "hintEn": "Angular direction to a target.",
        "ruDef": "Горизонтальный угол направления на объект.",
        "enDef": "Horizontal angular direction to an object.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "EAV",
        "full": "Echo Average",
        "ru": "Усреднение эхосигнала",
        "hintRu": "Сглаживает шум, но может замедлить реакцию изображения.",
        "hintEn": "Smooths noise but may slow display response.",
        "ruDef": "Обработка радара, усредняющая отражения.",
        "enDef": "Radar processing that averages echoes.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "BEAM",
        "full": "Beam Width",
        "ru": "Ширина луча",
        "hintRu": "Влияет на способность разделять близкие цели.",
        "hintEn": "Affects ability to separate close targets.",
        "ruDef": "Угловая ширина луча радара.",
        "enDef": "Angular width of the radar beam.",
        "scope": [
            "radar"
        ]
    },
    {
        "code": "SART",
        "full": "Search and Rescue Transponder",
        "ru": "Аварийный радиолокационный ответчик",
        "hintRu": "Сигнал бедствия, который радар может увидеть как характерную отметку.",
        "hintEn": "Emergency beacon that radar can detect as a distinctive pattern.",
        "ruDef": "Аварийный ответчик поиска и спасания, обнаруживаемый радаром.",
        "enDef": "Search and rescue transponder detectable by radar.",
        "scope": [
            "radar"
        ]
    }
];

  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const scopeLabel = (scope, lang) => {
    if (scope === 'chart') return lang === 'ru' ? 'Плоттер' : 'Chart';
    if (scope === 'radar') return lang === 'ru' ? 'Радар' : 'Radar';
    return scope;
  };

  const render = () => {
    const lang = getUiLang();
    const q = String(input.value || '').trim().toUpperCase();

    if (!q) {
      results.innerHTML = `<div class="navdesk-abbrev__empty">${lang === 'ru' ? 'Введите сокращение или нажмите один из быстрых примеров.' : 'Type an abbreviation or use one of the quick examples.'}</div>`;
      return;
    }

    const searchAliases = {
      TWA: 'ветер ветра wind true apparent angle угол парус',
      TWS: 'ветер ветра wind true speed скорость парус',
      AWS: 'ветер ветра wind apparent speed вымпельный парус',
      TIDE: 'вода воды water tide прилив отлив уровень течение',
      HW: 'вода воды water tide high полная вода прилив уровень',
      LW: 'вода воды water tide low малая вода отлив уровень',
      UKC: 'вода воды water depth глубина киль запас под килем',
      DEPTH: 'вода воды water depth глубина',
      DPT: 'вода воды water depth глубина',
      SET: 'вода воды water current течение снос направление',
      DRIFT: 'вода воды water current течение снос скорость',
      SEA: 'вода воды море волна волны sea clutter',
      RAIN: 'вода дождь осадки rain clutter'
    };

    const visible = data.filter((item) => item.scope.includes(activeScope));
    const matches = visible
      .filter((item) => {
        const blob = [
          item.code,
          item.full,
          item.ru,
          item.hintRu,
          item.ruDef,
          item.hintEn,
          item.enDef,
          searchAliases[item.code] || ''
        ].join(' ').toUpperCase();

        return blob.includes(q);
      })
      .sort((a, b) => {
        const rank = (item) => {
          if (item.code === q) return 0;
          if (item.code.startsWith(q)) return 1;
          if (item.full.toUpperCase().startsWith(q)) return 2;
          if (item.ru.toUpperCase().startsWith(q)) return 3;
          return 4;
        };
        return rank(a) - rank(b) || a.code.localeCompare(b.code);
      });

    if (!matches.length) {
      results.innerHTML = `<div class="navdesk-abbrev__empty">${lang === 'ru' ? 'Сокращение пока не найдено. Попробуйте другую вкладку или уточните запрос.' : 'No abbreviation found. Try another tab or refine the query.'}</div>`;
      return;
    }

    results.innerHTML = matches.map((item) => {
      const badges = item.scope.map((scope) => `<span class="navdesk-abbrev-card__badge">${esc(scopeLabel(scope, lang))}</span>`).join('');
      return `
        <article class="navdesk-abbrev-card">
          <div class="navdesk-abbrev-card__top">
            <h3 class="navdesk-abbrev-card__code">${esc(item.code)}</h3>
            <div class="navdesk-abbrev-card__badges">${badges}</div>
          </div>
          <p class="navdesk-abbrev-card__full">${esc(item.full)}</p>
          ${lang === 'ru' ? `<p class="navdesk-abbrev-card__ru">${esc(item.ru)}</p>` : ''}
          <p class="navdesk-abbrev-card__hint"><span>${lang === 'ru' ? 'Смысл' : 'Meaning'}:</span> ${esc(lang === 'ru' ? (item.hintRu || item.ruDef) : (item.hintEn || item.enDef))}</p>
          <p class="navdesk-abbrev-card__def">${esc(lang === 'ru' ? item.ruDef : item.enDef)}</p>
        </article>
      `;
    }).join('');
  };

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase();
    render();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      render();
    }
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeScope = tab.getAttribute('data-abbrev-scope') || 'chart';
      tabs.forEach((btn) => btn.classList.toggle('is-active', btn === tab));
      render();
    });
  });

  if (quick) {
    quick.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-abbrev-example]');
      if (!btn) return;

      const code = btn.getAttribute('data-abbrev-example') || '';
      const item = data.find((entry) => entry.code === code);

      if (item && !item.scope.includes(activeScope)) {
        activeScope = item.scope.includes('chart') ? 'chart' : item.scope[0];
        tabs.forEach((tab) => {
          tab.classList.toggle('is-active', tab.getAttribute('data-abbrev-scope') === activeScope);
        });
      }

      input.value = code;
      render();
    });
  }

  document.addEventListener('languageChanged', render);
  render();
});

/* === Nav Desk day/night watch mode 20260425-27 === */
document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('[data-navdesk-theme]'));
  const key = 'navdesk_watch_theme_v1';

  const applyTheme = (theme) => {
    const mode = theme === 'night' ? 'night' : 'day';
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    root.classList.toggle('navdesk-boot-night', mode === 'night');
    root.classList.toggle('navdesk-boot-day', mode === 'day');
    root.style.colorScheme = mode === 'night' ? 'dark' : 'light';
    document.body.classList.toggle('navdesk-theme-night', mode === 'night');
    document.body.classList.toggle('navdesk-theme-day', mode === 'day');
    if (themeMeta) themeMeta.setAttribute('content', mode === 'night' ? '#071014' : '#10243a');

    buttons.forEach((button) => {
      const active = button.dataset.navdeskTheme === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try {
      localStorage.setItem(key, mode);
    } catch (e) {}
  };

  let saved = 'day';
  try {
    saved = localStorage.getItem(key) || 'day';
  } catch (e) {}

  applyTheme(saved);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.navdeskTheme);
    });
  });
});


/* === Watch planner consolidated logic 20260425-44 === */
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('navdesk-watch-card');
  const body = document.getElementById('navdesk_watch_body');
  const openBtn = document.getElementById('navdesk_watch_open');
  const closeBtn = document.getElementById('navdesk_watch_close');
  const pinBtn = document.getElementById('navdesk_watch_pin');
  const currentTime = document.getElementById('watchCurrentTime');

  if (card && body && openBtn && closeBtn) {
    const closedActions = openBtn.closest('.navdesk-watch-actions--closed');
    const forceOpen = !!document.querySelector('.navdesk-watch-page');

    const setOpen = (open) => {
      card.classList.toggle('is-collapsed', !open);
      card.classList.toggle('is-open', open);
      body.hidden = !open;
      if (closedActions) closedActions.hidden = open;
    };

    openBtn.addEventListener('click', () => setOpen(true));

    closeBtn.addEventListener('click', () => {
      if (forceOpen) return;
      if (card.classList.contains('is-pinned')) return;
      setOpen(false);
    });

    if (pinBtn) {
      pinBtn.addEventListener('click', () => {
        const pinned = !card.classList.contains('is-pinned');
        card.classList.toggle('is-pinned', pinned);
        pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      });
    }

    const tick = () => {
      if (currentTime) {
        currentTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    };

    tick();
    setInterval(tick, 30000);
    setOpen(forceOpen);
  }

  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const utcOffset = document.getElementById('watchUtcOffset');
  const captain = document.getElementById('watchCaptain');
  const mate = document.getElementById('watchFirstMate');
  const scheduleMode = document.getElementById('watchScheduleMode');
  const keeperMode = document.getElementById('watchKeeperMode');
  const keeperFrom = document.getElementById('watchKeeperFrom');
  const keeperTo = document.getElementById('watchKeeperTo');
  const type = document.getElementById('watchType');
  const crew = document.getElementById('watchCrewInput');
  const apply = document.getElementById('watchSetupApply');
  const summary = document.getElementById('watchSetupSummary');
  const schedulePreview = document.getElementById('watchSchedulePreview');
  const restReport = document.getElementById('watchRestReport');
  const leader = document.getElementById('watchLeader');
  const crewOut = document.getElementById('watchCrew');

  if (!start || !days || !utcOffset || !captain || !mate || !scheduleMode || !keeperMode || !keeperFrom || !keeperTo || !type || !crew || !apply || !summary || !schedulePreview || !restReport) return;

  if (!start.value) start.value = new Date().toISOString().slice(0, 10);

  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);
  const hoursBetween = (a, b) => Math.max(0, (b - a) / 3600000);

  const parseOffsetMinutes = (value) => {
    const m = String(value || '+00:00').trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    return sign * (Number(m[2]) * 60 + Number(m[3] || 0));
  };

  const localToUtc = (date) => new Date(date.getTime() - parseOffsetMinutes(utcOffset.value) * 60000);

  const fmt = (date) => date.toLocaleString([], { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const fmtDay = (date) => date.toLocaleDateString([], { day:'2-digit', month:'2-digit', year:'numeric' });

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([captain.value, mate.value, ...String(crew.value || '').split(',')]);

  const timeToMin = (v) => {
    const [h, m] = String(v || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const shiftNeedsKeeper = (from, to) => {
    if (keeperMode.value === 'yes') return true;
    if (keeperMode.value === 'no') return false;

    const a = timeToMin(keeperFrom.value);
    const b = timeToMin(keeperTo.value);

    for (let t = from.getTime(); t < to.getTime(); t += 15 * 60000) {
      const d = new Date(t);
      const mins = d.getHours() * 60 + d.getMinutes();
      const inside = a <= b ? (mins >= a && mins < b) : (mins >= a || mins < b);
      if (inside) return true;
    }

    return false;
  };

  const recommendPlan = (n, keeperValue, forced) => {
    const canHaveKeeper = keeperValue !== 'no';

    if (forced && forced !== 'recommended') {
      const hours = forced === '2x2' ? 2 : forced === '3x3' ? 3 : forced === '6x6' ? 6 : 4;
      return {
        type: forced,
        hours,
        label: forced.replace('x', ' / '),
        warning: forced === '2x2' ? '2/2 — короткий или аварийный режим.' : ''
      };
    }

    if (canHaveKeeper) {
      if (n < 3) return { type:'manual', hours:4, label:'Ручной / конфликт', warning:'Для старшего и подвахтенного нужно минимум 3 человека.' };
      if (n === 3) return { type:'3x3', hours:3, label:'3 / 3 rotating pairs', warning:'Жёлтый режим: отдых рваный.' };
      if (n === 4) return { type:'4x4', hours:4, label:'4 / 4 fixed pairs', warning:'' };
      if (n === 5) return { type:'4x4-floating', hours:4, label:'4 / 4 floating reserve', warning:'' };
      return { type:'4x8', hours:4, label:'4 / 8 three pairs', warning:'' };
    }

    if (n < 2) return { type:'manual', hours:4, label:'Ручной / конфликт', warning:'Для расписания нужен минимум 2 человека.' };
    if (n === 2) return { type:'4x4', hours:4, label:'4 / 4 одиночная ротация', warning:'Одиночная вахта повышает риск усталости.' };
    if (n === 3) return { type:'3x6-solo', hours:3, label:'3 / 6 одиночная ротация', warning:'Одиночная вахта: контролируйте усталость.' };
    return { type:'4h-solo', hours:4, label:'4h одиночная ротация', warning:'Одиночная вахта.' };
  };

  const buildSchedule = (people, startDate, totalDays, plan) => {
    const shifts = [];
    const totalHours = totalDays * 24;
    const step = plan.hours || 4;

    for (let hour = 0, i = 0; hour < totalHours; hour += step, i++) {
      const from = addHours(startDate, hour);
      const to = addHours(startDate, Math.min(hour + step, totalHours));
      const needsKeeper = shiftNeedsKeeper(from, to);
      const lead = people[i % people.length];
      const keep = needsKeeper ? people[(i + 1) % people.length] : '';

      shifts.push({
        from,
        to,
        leader: lead,
        keepers: needsKeeper && keep && keep !== lead ? [keep] : [],
        needsKeeper
      });
    }

    return shifts;
  };

  const isWorking = (shift, person) => shift.leader === person || (shift.keepers || []).includes(person);

  const calculateRest = (people, shifts, startDate, totalDays) => {
    const end = addHours(startDate, totalDays * 24);

    return people.map(person => {
      let work = 0;
      shifts.forEach(s => { if (isWorking(s, person)) work += hoursBetween(s.from, s.to); });

      let worst24 = 24;
      for (let t = startDate.getTime(); t < end.getTime(); t += 3600000) {
        const ws = new Date(t);
        const we = addHours(ws, 24);
        let workWindow = 0;

        shifts.forEach(s => {
          if (!isWorking(s, person)) return;
          const os = Math.max(s.from.getTime(), ws.getTime());
          const oe = Math.min(s.to.getTime(), we.getTime());
          if (oe > os) workWindow += (oe - os) / 3600000;
        });

        worst24 = Math.min(worst24, 24 - workWindow);
      }

      let longest = 0;
      let cursor = startDate.getTime();

      shifts.filter(s => isWorking(s, person)).sort((a,b)=>a.from-b.from).forEach(s => {
        longest = Math.max(longest, (s.from.getTime() - cursor) / 3600000);
        cursor = Math.max(cursor, s.to.getTime());
      });

      longest = Math.max(longest, (end.getTime() - cursor) / 3600000);

      const total = totalDays * 24;
      const rest = Math.max(0, total - work);
      let status = 'ok';
      let label = 'OK';
      const notes = [];

      if (worst24 < 10) {
        status = 'bad';
        label = 'Нарушение';
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      } else if (worst24 < 11) {
        status = 'warn';
        label = 'Близко к лимиту';
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      } else {
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      }

      if (longest < 6) {
        status = 'bad';
        label = 'Нарушение';
        notes.push('нет непрерывного отдыха 6ч');
      }

      if (totalDays >= 7 && rest < 77) {
        status = 'bad';
        label = 'Нарушение';
        notes.push('отдых за 7 суток меньше 77ч');
      }

      return { person, work, rest, worst24, longest, status, label, notes };
    });
  };

  const renderSchedule = (shifts, plan, mode='day') => {
    const groups = {};
    shifts.forEach(s => {
      const key = fmtDay(s.from);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const keys = Object.keys(groups);
    const shownKeys = mode === 'all' ? keys : keys.slice(0, 1);

    schedulePreview.hidden = false;
    schedulePreview.innerHTML = `
      <div class="navdesk-watch-schedule__head">
        <h4>Расписание вахт</h4>
        <p>${esc(plan.label)} · всего смен: ${shifts.length} · UTC offset ${esc(utcOffset.value)}</p>
      </div>
      <div class="navdesk-watch-display-controls">
        <button type="button" class="${mode === 'day' ? 'is-active' : ''}" data-watch-view="day">Первые сутки</button>
        <button type="button" class="${mode === 'all' ? 'is-active' : ''}" data-watch-view="all">Показать все</button>
      </div>
      ${shownKeys.map(day => `
        <div class="navdesk-watch-day">
          <h5>${esc(day)}</h5>
          <div class="navdesk-watch-shifts">
            ${groups[day].map(s => `
              <article class="navdesk-watch-shift">
                <time>${esc(fmt(s.from))} — ${esc(fmt(s.to))} LT</time>
                <p class="navdesk-watch-shift__utc">UTC ${esc(fmt(localToUtc(s.from)))} — ${esc(fmt(localToUtc(s.to)))}</p>
                <p><strong>Старший:</strong> ${esc(s.leader || '—')}</p>
                <p><strong>Подвахтенный:</strong> ${esc(s.keepers.join(', ') || 'нет')}</p>
              </article>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    schedulePreview.querySelectorAll('[data-watch-view]').forEach(btn => {
      btn.addEventListener('click', () => renderSchedule(shifts, plan, btn.dataset.watchView));
    });
  };

  const renderRest = (report) => {
    restReport.hidden = false;
    restReport.innerHTML = `
      <div class="navdesk-watch-rest__head">
        <h4>Расчёт отдыха</h4>
        <p>10 часов отдыха за скользящие 24 часа и один непрерывный отдых не меньше 6 часов.</p>
      </div>
      <div class="navdesk-watch-rest-list">
        ${report.map(item => `
          <article class="navdesk-watch-rest-card is-${esc(item.status)}">
            <strong>${esc(item.person)} · ${esc(item.label)}</strong>
            <p>Работа: ${item.work.toFixed(1)}ч · Отдых: ${item.rest.toFixed(1)}ч</p>
            <p>${esc(item.notes.join(' · '))}</p>
          </article>
        `).join('')}
      </div>
    `;
  };

  apply.addEventListener('click', () => {
    const people = getPeople();
    const totalDays = Math.max(1, Math.min(30, Number(days.value || 1)));
    days.value = totalDays;

    if (!people.length) {
      summary.textContent = 'Добавьте капитана, первого помощника или экипаж.';
      schedulePreview.hidden = true;
      restReport.hidden = true;
      return;
    }

    const startDate = new Date(`${start.value || new Date().toISOString().slice(0,10)}T00:00:00`);
    const plan = recommendPlan(people.length, keeperMode.value, type.value);

    if (scheduleMode.value === 'manual') {
      summary.innerHTML = `<strong>Ручной режим:</strong> ${esc(start.value)}, ${totalDays} дн. · людей: ${people.length}. Расчёт отдыха для ручных смен добавим следующим этапом.`;
      schedulePreview.hidden = false;
      schedulePreview.innerHTML = '<div class="navdesk-watch-setup-note">Ручная таблица смен будет добавлена следующим этапом.</div>';
      restReport.hidden = true;
      return;
    }

    const shifts = buildSchedule(people, startDate, totalDays, plan);
    const rest = calculateRest(people, shifts, startDate, totalDays);

    if (leader) leader.textContent = shifts[0]?.leader || 'Не назначен';
    if (crewOut) crewOut.textContent = shifts[0]?.keepers?.length ? shifts[0].keepers.join(', ') : 'Подвахтенный не назначен';

    const keeperText = keeperMode.value === 'yes' ? 'всегда' : keeperMode.value === 'no' ? 'нет' : `${keeperFrom.value}–${keeperTo.value}`;
    summary.innerHTML = `<strong>Журнал:</strong> ${esc(start.value)}, ${totalDays} дн. · <strong>Людей:</strong> ${people.length} · <strong>Режим:</strong> ${esc(plan.label)} · <strong>Подвахтенный:</strong> ${esc(keeperText)} · <strong>UTC:</strong> ${esc(utcOffset.value)}${plan.warning ? `<br><strong>Внимание:</strong> ${esc(plan.warning)}` : ''}`;

    renderSchedule(shifts, plan, 'day');
    renderRest(rest);
  });
});

/* === Watch live status overlay 20260425-45 === */
document.addEventListener('DOMContentLoaded', () => {
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const captain = document.getElementById('watchCaptain');
  const mate = document.getElementById('watchFirstMate');
  const crew = document.getElementById('watchCrewInput');
  const keeperMode = document.getElementById('watchKeeperMode');
  const keeperFrom = document.getElementById('watchKeeperFrom');
  const keeperTo = document.getElementById('watchKeeperTo');
  const type = document.getElementById('watchType');
  const apply = document.getElementById('watchSetupApply');
  const currentPanel = document.querySelector('.navdesk-watch-panel--current');
  const leader = document.getElementById('watchLeader');
  const crewOut = document.getElementById('watchCrew');

  if (!start || !days || !captain || !mate || !crew || !keeperMode || !keeperFrom || !keeperTo || !type || !apply || !currentPanel) return;

  let liveTimer = null;
  let liveShifts = [];

  const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([captain.value, mate.value, ...String(crew.value || '').split(',')]);

  const timeToMin = (v) => {
    const [h, m] = String(v || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const shiftNeedsKeeper = (from, to) => {
    if (keeperMode.value === 'yes') return true;
    if (keeperMode.value === 'no') return false;

    const a = timeToMin(keeperFrom.value);
    const b = timeToMin(keeperTo.value);

    for (let t = from.getTime(); t < to.getTime(); t += 15 * 60000) {
      const d = new Date(t);
      const mins = d.getHours() * 60 + d.getMinutes();
      const inside = a <= b ? (mins >= a && mins < b) : (mins >= a || mins < b);
      if (inside) return true;
    }

    return false;
  };

  const planHours = () => {
    const forced = type.value;
    if (forced === '2x2') return 2;
    if (forced === '3x3') return 3;
    if (forced === '6x6') return 6;
    return 4;
  };

  const buildShifts = () => {
    const people = getPeople();
    const totalDays = Math.max(1, Math.min(30, Number(days.value || 1)));
    const startDate = new Date(`${start.value || new Date().toISOString().slice(0, 10)}T00:00:00`);
    const step = planHours();
    const totalHours = totalDays * 24;
    const shifts = [];

    if (!people.length) return [];

    for (let hour = 0, i = 0; hour < totalHours; hour += step, i++) {
      const from = addHours(startDate, hour);
      const to = addHours(startDate, Math.min(hour + step, totalHours));
      const needsKeeper = shiftNeedsKeeper(from, to);
      const lead = people[i % people.length];
      const keep = needsKeeper ? people[(i + 1) % people.length] : '';

      shifts.push({
        from,
        to,
        leader: lead,
        keepers: needsKeeper && keep && keep !== lead ? [keep] : []
      });
    }

    return shifts;
  };

  const fmtTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fmtLeft = (ms) => {
    const total = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}ч ${String(m).padStart(2, '0')}м`;
  };

  const ensureLiveBox = () => {
    let box = document.getElementById('watchLiveStatus');
    if (!box) {
      box = document.createElement('div');
      box.id = 'watchLiveStatus';
      box.className = 'navdesk-watch-live';
      currentPanel.appendChild(box);
    }
    return box;
  };

  const renderLive = () => {
    const box = ensureLiveBox();

    if (!liveShifts.length) {
      box.className = 'navdesk-watch-live is-waiting';
      box.innerHTML = '<p class="navdesk-watch-live__status">Расписание ещё не сформировано</p>';
      return;
    }

    const now = new Date();
    const current = liveShifts.find(s => now >= s.from && now < s.to);
    const next = liveShifts.find(s => s.from > now);

    if (current) {
      box.className = 'navdesk-watch-live is-active';

      if (leader) leader.textContent = current.leader || 'Не назначен';
      if (crewOut) crewOut.textContent = current.keepers.length ? current.keepers.join(', ') : 'Подвахтенный не назначен';

      box.innerHTML = `
        <p class="navdesk-watch-live__status">Смена идёт сейчас</p>
        <p><strong>Вахта:</strong> ${fmtTime(current.from)}–${fmtTime(current.to)}</p>
        <p><strong>До смены:</strong> ${fmtLeft(current.to - now)}</p>
        <p><strong>Следующая:</strong> ${next ? `${fmtTime(next.from)}–${fmtTime(next.to)}, ${next.leader}${next.keepers.length ? ' + ' + next.keepers.join(', ') : ''}` : 'нет'}</p>
      `;
      return;
    }

    if (next) {
      box.className = 'navdesk-watch-live is-waiting';
      box.innerHTML = `
        <p class="navdesk-watch-live__status">Ожидает начала первой смены</p>
        <p><strong>Первая смена:</strong> ${fmtTime(next.from)}–${fmtTime(next.to)}</p>
        <p><strong>До начала:</strong> ${fmtLeft(next.from - now)}</p>
      `;
      return;
    }

    box.className = 'navdesk-watch-live is-ended';
    box.innerHTML = '<p class="navdesk-watch-live__status">Период журнала завершён</p>';
  };

  apply.addEventListener('click', () => {
    liveShifts = buildShifts();
    renderLive();

    if (liveTimer) clearInterval(liveTimer);
    liveTimer = setInterval(renderLive, 30000);
  });
});

/* === Live Watch central renderer 20260425-46 === */
document.addEventListener('DOMContentLoaded', () => {
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const captain = document.getElementById('watchCaptain');
  const mate = document.getElementById('watchFirstMate');
  const crew = document.getElementById('watchCrewInput');
  const keeperMode = document.getElementById('watchKeeperMode');
  const keeperFrom = document.getElementById('watchKeeperFrom');
  const keeperTo = document.getElementById('watchKeeperTo');
  const type = document.getElementById('watchType');
  const apply = document.getElementById('watchSetupApply');
  const grid = document.querySelector('.navdesk-watch-grid');
  const leader = document.getElementById('watchLeader');
  const crewOut = document.getElementById('watchCrew');

  if (!start || !days || !captain || !mate || !crew || !keeperMode || !keeperFrom || !keeperTo || !type || !apply || !grid) return;

  let liveTimer = null;
  let liveShifts = [];

  const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([captain.value, mate.value, ...String(crew.value || '').split(',')]);

  const timeToMin = (v) => {
    const [h, m] = String(v || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const shiftNeedsKeeper = (from, to) => {
    if (keeperMode.value === 'yes') return true;
    if (keeperMode.value === 'no') return false;

    const a = timeToMin(keeperFrom.value);
    const b = timeToMin(keeperTo.value);

    for (let t = from.getTime(); t < to.getTime(); t += 15 * 60000) {
      const d = new Date(t);
      const mins = d.getHours() * 60 + d.getMinutes();
      const inside = a <= b ? (mins >= a && mins < b) : (mins >= a || mins < b);
      if (inside) return true;
    }

    return false;
  };

  const planHours = () => {
    const forced = type.value;
    if (forced === '2x2') return 2;
    if (forced === '3x3') return 3;
    if (forced === '6x6') return 6;
    return 4;
  };

  const buildShifts = () => {
    const people = getPeople();
    const totalDays = Math.max(1, Math.min(30, Number(days.value || 1)));
    const startDate = new Date(`${start.value || new Date().toISOString().slice(0, 10)}T00:00:00`);
    const step = planHours();
    const totalHours = totalDays * 24;
    const shifts = [];

    if (!people.length) return [];

    for (let hour = 0, i = 0; hour < totalHours; hour += step, i++) {
      const from = addHours(startDate, hour);
      const to = addHours(startDate, Math.min(hour + step, totalHours));
      const needsKeeper = shiftNeedsKeeper(from, to);
      const lead = people[i % people.length];
      const keep = needsKeeper ? people[(i + 1) % people.length] : '';

      shifts.push({
        from,
        to,
        leader: lead,
        keepers: needsKeeper && keep && keep !== lead ? [keep] : []
      });
    }

    return shifts;
  };

  const fmtTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fmtLeft = (ms) => {
    const total = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}ч ${String(m).padStart(2, '0')}м`;
  };

  const ensureCentralLiveBox = () => {
    let box = document.getElementById('watchLiveStatusCentral');
    if (!box) {
      box = document.createElement('section');
      box.id = 'watchLiveStatusCentral';
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      grid.insertBefore(box, grid.firstElementChild);
    }
    return box;
  };

  const renderLive = () => {
    const box = ensureCentralLiveBox();

    if (!liveShifts.length) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ожидает расписания</p>
          <h3 class="navdesk-watch-live__title">Текущая вахта не сформирована</h3>
          <div class="navdesk-watch-live__meta">
            <p>Задайте экипаж и нажмите “Сформировать”.</p>
          </div>
        </div>
        <div class="navdesk-watch-live__timer">
          <span>Статус</span>
          <strong>—</strong>
        </div>
      `;
      return;
    }

    const now = new Date();
    const current = liveShifts.find(s => now >= s.from && now < s.to);
    const next = liveShifts.find(s => s.from > now);

    if (current) {
      if (leader) leader.textContent = current.leader || 'Не назначен';
      if (crewOut) crewOut.textContent = current.keepers.length ? current.keepers.join(', ') : 'Подвахтенный не назначен';

      box.className = 'navdesk-watch-live navdesk-watch-live--central is-active';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Смена идёт сейчас</p>
          <h3 class="navdesk-watch-live__title">${current.leader}${current.keepers.length ? ' + ' + current.keepers.join(', ') : ''}</h3>
          <div class="navdesk-watch-live__meta">
            <p><strong>Вахта:</strong> ${fmtTime(current.from)}–${fmtTime(current.to)}</p>
            <p><strong>Следующая:</strong> ${next ? `${fmtTime(next.from)}–${fmtTime(next.to)}, ${next.leader}${next.keepers.length ? ' + ' + next.keepers.join(', ') : ''}` : 'нет'}</p>
          </div>
        </div>
        <div class="navdesk-watch-live__timer">
          <span>До смены</span>
          <strong>${fmtLeft(current.to - now)}</strong>
        </div>
      `;
      return;
    }

    if (next) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ожидает начала смены</p>
          <h3 class="navdesk-watch-live__title">${next.leader}${next.keepers.length ? ' + ' + next.keepers.join(', ') : ''}</h3>
          <div class="navdesk-watch-live__meta">
            <p><strong>Первая смена:</strong> ${fmtTime(next.from)}–${fmtTime(next.to)}</p>
          </div>
        </div>
        <div class="navdesk-watch-live__timer">
          <span>До начала</span>
          <strong>${fmtLeft(next.from - now)}</strong>
        </div>
      `;
      return;
    }

    box.className = 'navdesk-watch-live navdesk-watch-live--central is-ended';
    box.innerHTML = `
      <div>
        <p class="navdesk-watch-live__status">Период завершён</p>
        <h3 class="navdesk-watch-live__title">Расписание вахт закончено</h3>
      </div>
      <div class="navdesk-watch-live__timer">
        <span>Статус</span>
        <strong>END</strong>
      </div>
    `;
  };

  apply.addEventListener('click', () => {
    liveShifts = buildShifts();
    renderLive();

    if (liveTimer) clearInterval(liveTimer);
    liveTimer = setInterval(renderLive, 30000);
  });
});

/* === Watch setup autofocus / blind fill 20260425-48 === */
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('navdesk_watch_open');
  const startDate = document.getElementById('watchStartDate');
	  const formIds = [
	    'watchVoyageRoute',
	    'watchStartDate',
	    'watchStartTime',
	    'watchDays',
	    'watchHours',
	    'watchUtcOffset',
    'watchScheduleMode',
    'watchType',
    'watchCaptain',
    'watchFirstMate',
    'watchCrewInput',
    'watchKeeperMode',
    'watchKeeperFrom',
    'watchKeeperTo',
    'watchSetupApply'
  ];

  const focusStart = () => {
    if (!startDate) return;
    setTimeout(() => {
      startDate.focus({ preventScroll: false });
      startDate.select?.();
    }, 180);
  };

  if (openBtn) {
    openBtn.addEventListener('click', focusStart);
  }

  formIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      const tag = el.tagName.toLowerCase();
      if (tag === 'textarea') return;

      event.preventDefault();

      const nextId = formIds[index + 1];
      const next = nextId ? document.getElementById(nextId) : null;

      if (next) {
        next.focus();
        next.select?.();
      } else if (typeof el.click === 'function') {
        el.click();
      }
    });
  });
});

/* === Manual watch editor 20260425-49 === */
document.addEventListener('DOMContentLoaded', () => {
  const scheduleMode = document.getElementById('watchScheduleMode');
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const captain = document.getElementById('watchCaptain');
  const mate = document.getElementById('watchFirstMate');
  const crew = document.getElementById('watchCrewInput');
  const apply = document.getElementById('watchSetupApply');
  const manualEditor = document.getElementById('watchManualEditor');
  const manualFrom = document.getElementById('watchManualFrom');
  const manualTo = document.getElementById('watchManualTo');
  const manualLeader = document.getElementById('watchManualLeader');
  const manualKeeper = document.getElementById('watchManualKeeper');
  const manualAdd = document.getElementById('watchManualAdd');
  const manualList = document.getElementById('watchManualList');
  const schedulePreview = document.getElementById('watchSchedulePreview');
  const restReport = document.getElementById('watchRestReport');

  if (!scheduleMode || !start || !days || !captain || !mate || !crew || !manualEditor || !manualFrom || !manualTo || !manualLeader || !manualKeeper || !manualAdd || !manualList) return;

  let manualShifts = [];

  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([captain.value, mate.value, ...String(crew.value || '').split(',')]);

  const fmt = (date) => date.toLocaleString([], {
    month:'2-digit',
    day:'2-digit',
    hour:'2-digit',
    minute:'2-digit'
  });

  const setManualDefaults = () => {
    const base = start.value || new Date().toISOString().slice(0, 10);
    if (!manualFrom.value) manualFrom.value = `${base}T00:00`;
    if (!manualTo.value) manualTo.value = `${base}T04:00`;
  };

  const fillPeopleSelects = () => {
    const people = getPeople();

    const optionsLeader = people.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
    const optionsKeeper = `<option value="">Нет</option>` + people.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');

    manualLeader.innerHTML = optionsLeader || '<option value="">Нет экипажа</option>';
    manualKeeper.innerHTML = optionsKeeper;
  };

  const renderManualList = () => {
    if (!manualShifts.length) {
      manualList.innerHTML = '<div class="navdesk-watch-setup-note">Ручные смены ещё не добавлены.</div>';
      return;
    }

    manualList.innerHTML = manualShifts
      .sort((a,b) => a.from - b.from)
      .map((shift, index) => `
        <article class="navdesk-watch-manual__item">
          <div>
            <p><strong>${esc(fmt(shift.from))} — ${esc(fmt(shift.to))}</strong></p>
            <p>Старший: ${esc(shift.leader || '—')} · Подвахтенный: ${esc(shift.keepers.join(', ') || 'нет')}</p>
          </div>
          <button type="button" class="navdesk-watch-manual__remove" data-manual-remove="${index}">Удалить</button>
        </article>
      `).join('');

    manualList.querySelectorAll('[data-manual-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.manualRemove);
        manualShifts.splice(idx, 1);
        renderManualList();
      });
    });
  };

  const toggleManual = () => {
    const manual = scheduleMode.value === 'manual';
    manualEditor.hidden = !manual;

    if (manual) {
      fillPeopleSelects();
      setManualDefaults();
      renderManualList();
      if (schedulePreview) schedulePreview.hidden = true;
      if (restReport) restReport.hidden = true;
    }
  };

  scheduleMode.addEventListener('change', toggleManual);
  [captain, mate, crew].forEach(el => el.addEventListener('input', fillPeopleSelects));

  manualAdd.addEventListener('click', () => {
    const from = new Date(manualFrom.value);
    const to = new Date(manualTo.value);
    const leader = manualLeader.value;
    const keeper = manualKeeper.value;

    if (!manualFrom.value || !manualTo.value || !leader || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      manualList.innerHTML = '<div class="navdesk-watch-setup-note">Проверьте время начала, время конца и старшего вахты.</div>';
      return;
    }

    manualShifts.push({
      from,
      to,
      leader,
      keepers: keeper && keeper !== leader ? [keeper] : []
    });

    manualFrom.value = to.toISOString().slice(0, 16);
    manualTo.value = addHours(to, 4).toISOString().slice(0, 16);

    renderManualList();
  });

  if (apply) {
    apply.addEventListener('click', () => {
      toggleManual();

      if (scheduleMode.value !== 'manual') return;

      if (!manualShifts.length) {
        manualList.innerHTML = '<div class="navdesk-watch-setup-note">Ручной режим выбран. Добавьте хотя бы одну смену.</div>';
      }
    });
  }

  toggleManual();
});

/* === Manual watch working mode 20260425-50 === */
document.addEventListener('DOMContentLoaded', () => {
  const scheduleMode = document.getElementById('watchScheduleMode');
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const utcOffset = document.getElementById('watchUtcOffset');
  const captain = document.getElementById('watchCaptain');
  const mate = document.getElementById('watchFirstMate');
  const crew = document.getElementById('watchCrewInput');
  const apply = document.getElementById('watchSetupApply');
  const manualFrom = document.getElementById('watchManualFrom');
  const manualTo = document.getElementById('watchManualTo');
  const manualLeader = document.getElementById('watchManualLeader');
  const manualKeeper = document.getElementById('watchManualKeeper');
  const manualAdd = document.getElementById('watchManualAdd');
  const schedulePreview = document.getElementById('watchSchedulePreview');
  const restReport = document.getElementById('watchRestReport');
  const summary = document.getElementById('watchSetupSummary');
  const leaderOut = document.getElementById('watchLeader');
  const crewOut = document.getElementById('watchCrew');

  if (!scheduleMode || !start || !days || !utcOffset || !captain || !mate || !crew || !apply || !manualFrom || !manualTo || !manualLeader || !manualKeeper || !manualAdd || !schedulePreview || !restReport || !summary) return;

  let manualShiftsWorking = [];
  let manualLiveTimer = null;

  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);
  const hoursBetween = (a, b) => Math.max(0, (b - a) / 3600000);

  const parseOffsetMinutes = (value) => {
    const m = String(value || '+00:00').trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    return sign * (Number(m[2]) * 60 + Number(m[3] || 0));
  };

  const localToUtc = (date) => new Date(date.getTime() - parseOffsetMinutes(utcOffset.value) * 60000);

  const fmt = (date) => date.toLocaleString([], { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const fmtTime = (date) => date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const fmtDay = (date) => date.toLocaleDateString([], { day:'2-digit', month:'2-digit', year:'numeric' });

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([captain.value, mate.value, ...String(crew.value || '').split(',')]);

  const normalizeManual = () => {
    manualShiftsWorking = manualShiftsWorking
      .filter(s => s && s.from instanceof Date && s.to instanceof Date && !Number.isNaN(s.from) && !Number.isNaN(s.to) && s.to > s.from && s.leader)
      .sort((a,b) => a.from - b.from);
  };

  manualAdd.addEventListener('click', () => {
    if (scheduleMode.value !== 'manual') return;

    const from = new Date(manualFrom.value);
    const to = new Date(manualTo.value);
    const lead = manualLeader.value;
    const keep = manualKeeper.value;

    if (!manualFrom.value || !manualTo.value || !lead || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) return;

    manualShiftsWorking.push({
      from,
      to,
      leader: lead,
      keepers: keep && keep !== lead ? [keep] : []
    });

    normalizeManual();
  }, true);

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-manual-remove]');
    if (!btn || scheduleMode.value !== 'manual') return;

    normalizeManual();
    const idx = Number(btn.dataset.manualRemove);
    if (!Number.isNaN(idx)) {
      manualShiftsWorking.splice(idx, 1);
    }
  }, true);

  const isWorking = (shift, person) => shift.leader === person || (shift.keepers || []).includes(person);

  const calculateRestManual = (people, shifts, startDate, totalDays) => {
    const endDate = addHours(startDate, totalDays * 24);

    return people.map(person => {
      let work = 0;

      shifts.forEach(s => {
        if (!isWorking(s, person)) return;
        const os = Math.max(s.from.getTime(), startDate.getTime());
        const oe = Math.min(s.to.getTime(), endDate.getTime());
        if (oe > os) work += (oe - os) / 3600000;
      });

      let worst24 = 24;

      for (let t = startDate.getTime(); t < endDate.getTime(); t += 3600000) {
        const ws = new Date(t);
        const we = addHours(ws, 24);
        let workWindow = 0;

        shifts.forEach(s => {
          if (!isWorking(s, person)) return;
          const os = Math.max(s.from.getTime(), ws.getTime());
          const oe = Math.min(s.to.getTime(), we.getTime());
          if (oe > os) workWindow += (oe - os) / 3600000;
        });

        worst24 = Math.min(worst24, 24 - workWindow);
      }

      let longest = 0;
      let cursor = startDate.getTime();

      shifts
        .filter(s => isWorking(s, person))
        .sort((a,b) => a.from - b.from)
        .forEach(s => {
          const os = Math.max(s.from.getTime(), startDate.getTime());
          const oe = Math.min(s.to.getTime(), endDate.getTime());
          if (oe <= startDate.getTime() || os >= endDate.getTime()) return;
          longest = Math.max(longest, (os - cursor) / 3600000);
          cursor = Math.max(cursor, oe);
        });

      longest = Math.max(longest, (endDate.getTime() - cursor) / 3600000);

      const total = totalDays * 24;
      const rest = Math.max(0, total - work);
      let status = 'ok';
      let label = 'OK';
      const notes = [];

      if (worst24 < 10) {
        status = 'bad';
        label = 'FAIL';
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      } else if (worst24 < 11) {
        status = 'warn';
        label = 'WARNING';
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      } else {
        notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);
      }

      if (longest < 6) {
        status = 'bad';
        label = 'FAIL';
        notes.push('нет непрерывного отдыха 6ч');
      }

      if (totalDays >= 7 && rest < 77) {
        status = 'bad';
        label = 'FAIL';
        notes.push('отдых за 7 суток меньше 77ч');
      }

      return { person, work, rest, worst24, longest, status, label, notes };
    });
  };

  const renderManualSchedule = (shifts, mode='day') => {
    const groups = {};
    shifts.forEach(s => {
      const key = fmtDay(s.from);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const keys = Object.keys(groups);
    const shownKeys = mode === 'all' ? keys : keys.slice(0, 1);

    schedulePreview.hidden = false;
    schedulePreview.innerHTML = `
      <div class="navdesk-watch-schedule__head">
        <h4>Ручное расписание вахт</h4>
        <p>ручной режим · всего смен: ${shifts.length} · UTC offset ${esc(utcOffset.value)}</p>
      </div>
      <div class="navdesk-watch-display-controls">
        <button type="button" class="${mode === 'day' ? 'is-active' : ''}" data-manual-view="day">Первые сутки</button>
        <button type="button" class="${mode === 'all' ? 'is-active' : ''}" data-manual-view="all">Показать все</button>
      </div>
      ${shownKeys.map(day => `
        <div class="navdesk-watch-day">
          <h5>${esc(day)}</h5>
          <div class="navdesk-watch-shifts">
            ${groups[day].map(s => `
              <article class="navdesk-watch-shift">
                <time>${esc(fmt(s.from))} — ${esc(fmt(s.to))} LT</time>
                <p class="navdesk-watch-shift__utc">UTC ${esc(fmt(localToUtc(s.from)))} — ${esc(fmt(localToUtc(s.to)))}</p>
                <p><strong>Старший:</strong> ${esc(s.leader || '—')}</p>
                <p><strong>Подвахтенный:</strong> ${esc(s.keepers.join(', ') || 'нет')}</p>
              </article>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    schedulePreview.querySelectorAll('[data-manual-view]').forEach(btn => {
      btn.addEventListener('click', () => renderManualSchedule(shifts, btn.dataset.manualView));
    });
  };

  const renderManualRest = (report) => {
    restReport.hidden = false;
    restReport.innerHTML = `
      <div class="navdesk-watch-rest__head">
        <h4>Расчёт отдыха</h4>
        <p>Ручной режим: проверка по добавленным сменам.</p>
      </div>
      <div class="navdesk-watch-rest-list">
        ${report.map(item => `
          <article class="navdesk-watch-rest-card is-${esc(item.status)}">
            <strong>${esc(item.person)} · ${esc(item.label)}</strong>
            <p>Работа: ${item.work.toFixed(1)}ч · Отдых: ${item.rest.toFixed(1)}ч</p>
            <p>${esc(item.notes.join(' · '))}</p>
          </article>
        `).join('')}
      </div>
    `;
  };

  const fmtLeft = (ms) => {
    const total = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}ч ${String(m).padStart(2, '0')}м`;
  };

  const ensureLiveBox = () => {
    let box = document.getElementById('watchLiveStatusCentral');
    const grid = document.querySelector('.navdesk-watch-grid');
    if (!box && grid) {
      box = document.createElement('section');
      box.id = 'watchLiveStatusCentral';
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      grid.insertBefore(box, grid.firstElementChild);
    }
    return box;
  };

  const renderManualLive = () => {
    const box = ensureLiveBox();
    if (!box) return;

    normalizeManual();

    if (!manualShiftsWorking.length) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ручной режим</p>
          <h3 class="navdesk-watch-live__title">Смены ещё не добавлены</h3>
          <div class="navdesk-watch-live__meta"><p>Добавьте смену и нажмите “Сформировать”.</p></div>
        </div>
        <div class="navdesk-watch-live__timer"><span>Статус</span><strong>—</strong></div>
      `;
      return;
    }

    const now = new Date();
    const current = manualShiftsWorking.find(s => now >= s.from && now < s.to);
    const next = manualShiftsWorking.find(s => s.from > now);

    if (current) {
      if (leaderOut) leaderOut.textContent = current.leader || 'Не назначен';
      if (crewOut) crewOut.textContent = current.keepers.length ? current.keepers.join(', ') : 'Подвахтенный не назначен';

      box.className = 'navdesk-watch-live navdesk-watch-live--central is-active';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Смена идёт сейчас</p>
          <h3 class="navdesk-watch-live__title">${esc(current.leader)}${current.keepers.length ? ' + ' + esc(current.keepers.join(', ')) : ''}</h3>
          <div class="navdesk-watch-live__meta">
            <p><strong>Вахта:</strong> ${esc(fmtTime(current.from))}–${esc(fmtTime(current.to))}</p>
            <p><strong>Следующая:</strong> ${next ? `${esc(fmtTime(next.from))}–${esc(fmtTime(next.to))}, ${esc(next.leader)}${next.keepers.length ? ' + ' + esc(next.keepers.join(', ')) : ''}` : 'нет'}</p>
          </div>
        </div>
        <div class="navdesk-watch-live__timer"><span>До смены</span><strong>${esc(fmtLeft(current.to - now))}</strong></div>
      `;
      return;
    }

    if (next) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ожидает ручной смены</p>
          <h3 class="navdesk-watch-live__title">${esc(next.leader)}${next.keepers.length ? ' + ' + esc(next.keepers.join(', ')) : ''}</h3>
          <div class="navdesk-watch-live__meta"><p><strong>Начало:</strong> ${esc(fmt(next.from))}</p></div>
        </div>
        <div class="navdesk-watch-live__timer"><span>До начала</span><strong>${esc(fmtLeft(next.from - now))}</strong></div>
      `;
      return;
    }

    box.className = 'navdesk-watch-live navdesk-watch-live--central is-ended';
    box.innerHTML = `
      <div>
        <p class="navdesk-watch-live__status">Ручной период завершён</p>
        <h3 class="navdesk-watch-live__title">Активных смен больше нет</h3>
      </div>
      <div class="navdesk-watch-live__timer"><span>Статус</span><strong>END</strong></div>
    `;
  };

  apply.addEventListener('click', () => {
    if (scheduleMode.value !== 'manual') return;

    normalizeManual();

    if (!manualShiftsWorking.length) {
      schedulePreview.hidden = true;
      restReport.hidden = true;
      summary.innerHTML = '<strong>Ручной режим:</strong> добавьте хотя бы одну смену.';
      renderManualLive();
      return;
    }

    const people = getPeople();
    const totalDays = Math.max(1, Math.min(30, Number(days.value || 1)));
    const startDate = new Date(`${start.value || new Date().toISOString().slice(0,10)}T00:00:00`);

    summary.innerHTML = `<strong>Ручной режим:</strong> ${esc(start.value)}, ${totalDays} дн. · <strong>Людей:</strong> ${people.length} · <strong>Смен:</strong> ${manualShiftsWorking.length} · <strong>UTC:</strong> ${esc(utcOffset.value)}`;

    renderManualSchedule(manualShiftsWorking, 'day');
    renderManualRest(calculateRestManual(people, manualShiftsWorking, startDate, totalDays));
    renderManualLive();

    if (manualLiveTimer) clearInterval(manualLiveTimer);
    manualLiveTimer = setInterval(renderManualLive, 30000);
  });
});

/* === Manual watch cleanup + validation 20260425-51 === */
document.addEventListener('DOMContentLoaded', () => {
  const scheduleMode = document.getElementById('watchScheduleMode');
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');
  const manualList = document.getElementById('watchManualList');
  const manualAdd = document.getElementById('watchManualAdd');
  const apply = document.getElementById('watchSetupApply');

  if (!scheduleMode || !start || !days || !manualList || !manualAdd || !apply) return;

  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);

  const parseShiftItems = () => {
    const items = [...manualList.querySelectorAll('.navdesk-watch-manual__item')];

    return items.map((item, index) => {
      const strong = item.querySelector('strong')?.textContent || '';
      const match = strong.match(/(.+?)\s+—\s+(.+)/);
      const from = match ? new Date(match[1]) : null;
      const to = match ? new Date(match[2]) : null;

      return { item, index, from, to };
    }).filter(s => s.from && s.to && !Number.isNaN(s.from.getTime()) && !Number.isNaN(s.to.getTime()));
  };

  const validateManualVisual = () => {
    if (scheduleMode.value !== 'manual') return;

    const oldAlerts = manualList.querySelector('.navdesk-watch-manual-alerts');
    if (oldAlerts) oldAlerts.remove();

    const shifts = parseShiftItems().sort((a,b) => a.from - b.from);

    manualList.querySelectorAll('.navdesk-watch-manual__item').forEach(item => {
      item.classList.remove('has-warning', 'has-error');
    });

    const alerts = [];

    if (!shifts.length) return;

    const periodStart = new Date(`${start.value || new Date().toISOString().slice(0, 10)}T00:00:00`);
    const periodEnd = addHours(periodStart, Math.max(1, Math.min(30, Number(days.value || 1))) * 24);

    if (shifts[0].from > periodStart) {
      alerts.push({
        type: 'warning',
        text: `Есть дыра до первой смены: с ${periodStart.toLocaleString()} до ${shifts[0].from.toLocaleString()}.`
      });
      shifts[0].item.classList.add('has-warning');
    }

    for (let i = 0; i < shifts.length - 1; i++) {
      const current = shifts[i];
      const next = shifts[i + 1];

      if (current.to > next.from) {
        current.item.classList.add('has-error');
        next.item.classList.add('has-error');
        alerts.push({
          type: 'error',
          text: `Пересечение смен: ${current.from.toLocaleString()}–${current.to.toLocaleString()} и ${next.from.toLocaleString()}–${next.to.toLocaleString()}.`
        });
      }

      if (current.to < next.from) {
        current.item.classList.add('has-warning');
        next.item.classList.add('has-warning');
        alerts.push({
          type: 'warning',
          text: `Дыра между сменами: с ${current.to.toLocaleString()} до ${next.from.toLocaleString()}.`
        });
      }
    }

    const last = shifts[shifts.length - 1];
    if (last.to < periodEnd) {
      last.item.classList.add('has-warning');
      alerts.push({
        type: 'warning',
        text: `Есть дыра после последней смены: с ${last.to.toLocaleString()} до ${periodEnd.toLocaleString()}.`
      });
    }

    if (alerts.length) {
      const box = document.createElement('div');
      box.className = 'navdesk-watch-manual-alerts';
      box.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="navdesk-watch-manual-alert is-${esc(alert.type)}">${esc(alert.text)}</div>
      `).join('');
      manualList.appendChild(box);
    }
  };

  manualAdd.addEventListener('click', () => {
    setTimeout(validateManualVisual, 80);
  });

  apply.addEventListener('click', () => {
    setTimeout(validateManualVisual, 120);
  });

  manualList.addEventListener('click', () => {
    setTimeout(validateManualVisual, 80);
  });
});

/* === Manual validation hard fix 20260425-52 === */
document.addEventListener('DOMContentLoaded', () => {
  const scheduleMode = document.getElementById('watchScheduleMode');
  const manualList = document.getElementById('watchManualList');
  const manualAdd = document.getElementById('watchManualAdd');
  const apply = document.getElementById('watchSetupApply');
  const start = document.getElementById('watchStartDate');
  const days = document.getElementById('watchDays');

  if (!scheduleMode || !manualList || !manualAdd || !apply || !start || !days) return;

  const esc = (v) => String(v ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');

  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);

  const parseHumanManualDate = (text) => {
    const m = String(text || '').match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
    if (!m) return null;
    return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`);
  };

  const stampManualItems = () => {
    manualList.querySelectorAll('.navdesk-watch-manual__item').forEach(item => {
      if (item.dataset.from && item.dataset.to) return;

      const strong = item.querySelector('strong')?.textContent || '';
      const parts = strong.split('—').map(v => v.trim());
      if (parts.length < 2) return;

      const from = parseHumanManualDate(parts[0]);
      const to = parseHumanManualDate(parts[1]);

      if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
        item.dataset.from = from.toISOString();
        item.dataset.to = to.toISOString();
      }
    });
  };

  const parseShiftItems = () => {
    stampManualItems();

    return [...manualList.querySelectorAll('.navdesk-watch-manual__item')]
      .map((item, index) => {
        const from = item.dataset.from ? new Date(item.dataset.from) : null;
        const to = item.dataset.to ? new Date(item.dataset.to) : null;
        return { item, index, from, to };
      })
      .filter(s => s.from && s.to && !Number.isNaN(s.from.getTime()) && !Number.isNaN(s.to.getTime()))
      .sort((a, b) => a.from - b.from);
  };

  const clearAlerts = () => {
    manualList.querySelectorAll('.navdesk-watch-manual-alerts').forEach(el => el.remove());
    manualList.querySelectorAll('.navdesk-watch-manual__item').forEach(item => {
      item.classList.remove('has-warning', 'has-error');
    });
  };

  const validate = () => {
    if (scheduleMode.value !== 'manual') return;

    clearAlerts();

    const shifts = parseShiftItems();
    if (!shifts.length) return;

    const alerts = [];
    const periodStart = new Date(`${start.value || new Date().toISOString().slice(0, 10)}T00:00:00`);
    const periodEnd = addHours(periodStart, Math.max(1, Math.min(30, Number(days.value || 1))) * 24);

    if (shifts[0].from > periodStart) {
      shifts[0].item.classList.add('has-warning');
      alerts.push({
        type: 'warning',
        text: `Дыра до первой смены: ${periodStart.toLocaleString()} — ${shifts[0].from.toLocaleString()}`
      });
    }

    for (let i = 0; i < shifts.length - 1; i++) {
      const current = shifts[i];
      const next = shifts[i + 1];

      if (current.to > next.from) {
        current.item.classList.add('has-error');
        next.item.classList.add('has-error');
        alerts.push({
          type: 'error',
          text: `Пересечение смен: ${current.from.toLocaleString()}–${current.to.toLocaleString()} и ${next.from.toLocaleString()}–${next.to.toLocaleString()}`
        });
      } else if (current.to < next.from) {
        current.item.classList.add('has-warning');
        next.item.classList.add('has-warning');
        alerts.push({
          type: 'warning',
          text: `Дыра между сменами: ${current.to.toLocaleString()} — ${next.from.toLocaleString()}`
        });
      }
    }

    const last = shifts[shifts.length - 1];
    if (last.to < periodEnd) {
      last.item.classList.add('has-warning');
      alerts.push({
        type: 'warning',
        text: `Дыра после последней смены: ${last.to.toLocaleString()} — ${periodEnd.toLocaleString()}`
      });
    }

    if (alerts.length) {
      const box = document.createElement('div');
      box.className = 'navdesk-watch-manual-alerts';
      box.innerHTML = alerts.slice(0, 8).map(alert => `
        <div class="navdesk-watch-manual-alert is-${esc(alert.type)}">${esc(alert.text)}</div>
      `).join('');
      manualList.appendChild(box);
    }
  };

  const scheduleValidate = () => setTimeout(validate, 180);

  manualAdd.addEventListener('click', scheduleValidate);
  apply.addEventListener('click', scheduleValidate);
  manualList.addEventListener('click', scheduleValidate);
  scheduleMode.addEventListener('change', scheduleValidate);
  start.addEventListener('change', scheduleValidate);
  days.addEventListener('input', scheduleValidate);
});

/* === Watch manual/live hard reset 20260425-53 === */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

	  const ids = {
	    mode: 'watchScheduleMode',
	    route: 'watchVoyageRoute',
	    start: 'watchStartDate',
	    startTime: 'watchStartTime',
	    days: 'watchDays',
	    hours: 'watchHours',
	    utc: 'watchUtcOffset',
    captain: 'watchCaptain',
    mate: 'watchFirstMate',
    crew: 'watchCrewInput',
    keeperMode: 'watchKeeperMode',
    keeperFrom: 'watchKeeperFrom',
    keeperTo: 'watchKeeperTo',
    type: 'watchType',
    apply: 'watchSetupApply',
    summary: 'watchSetupSummary',
    schedule: 'watchSchedulePreview',
    rest: 'watchRestReport',
    manualEditor: 'watchManualEditor',
    manualFrom: 'watchManualFrom',
    manualTo: 'watchManualTo',
    manualLeader: 'watchManualLeader',
    manualKeeper: 'watchManualKeeper',
    manualAdd: 'watchManualAdd',
    manualList: 'watchManualList',
    leaderOut: 'watchLeader',
    crewOut: 'watchCrew'
  };

  const el = {};
  Object.entries(ids).forEach(([key, id]) => el[key] = $(id));

	  if (!el.mode || !el.start || !el.startTime || !el.days || !el.hours || !el.utc || !el.captain || !el.mate || !el.crew || !el.apply || !el.summary || !el.schedule || !el.rest) return;

  // Снимаем старые обработчики с ключевых кнопок, не ломая внешний вид.
  const replaceNode = (node) => {
    if (!node || !node.parentNode) return node;
    const clone = node.cloneNode(true);
    node.parentNode.replaceChild(clone, node);
    return clone;
  };

  el.apply = replaceNode(el.apply);
  el.manualAdd = replaceNode(el.manualAdd);

  const esc = (v) => String(v ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');

	  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);
	  const hoursBetween = (a, b) => Math.max(0, (b - a) / 3600000);
	  const pad2 = (value) => String(value).padStart(2, '0');

	  const fmt = (d) => d.toLocaleString([], { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
	  const fmtTime = (d) => d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
	  const fmtDay = (d) => d.toLocaleDateString([], { day:'2-digit', month:'2-digit', year:'numeric' });
	  const toInputDateTime = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const parseOffsetMinutes = (value) => {
    const m = String(value || '+00:00').trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!m) return 0;
    return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  };

  const localToUtc = (date) => new Date(date.getTime() - parseOffsetMinutes(el.utc.value) * 60000);

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const getPeople = () => uniq([el.captain.value, el.mate.value, ...String(el.crew.value || '').split(',')]);

  const timeToMin = (v) => {
    const [h, m] = String(v || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const shiftNeedsKeeper = (from, to) => {
    if (!el.keeperMode) return false;
    if (el.keeperMode.value === 'yes') return true;
    if (el.keeperMode.value === 'no') return false;

    const a = timeToMin(el.keeperFrom?.value || '00:01');
    const b = timeToMin(el.keeperTo?.value || '06:00');

    for (let t = from.getTime(); t < to.getTime(); t += 15 * 60000) {
      const d = new Date(t);
      const mins = d.getHours() * 60 + d.getMinutes();
      const inside = a <= b ? (mins >= a && mins < b) : (mins >= a || mins < b);
      if (inside) return true;
    }
    return false;
  };

  const planHours = () => {
    const forced = el.type?.value || 'recommended';
    if (forced === '2x2') return 2;
    if (forced === '3x3') return 3;
    if (forced === '6x6') return 6;
    return 4;
  };

	  const normalizedStartTime = () => (/^\d{2}:\d{2}$/.test(el.startTime?.value || '') ? el.startTime.value : '00:00');
	  const periodStart = () => new Date(`${el.start.value || new Date().toISOString().slice(0,10)}T${normalizedStartTime()}:00`);
	  const periodStartLabel = () => `${el.start.value || new Date().toISOString().slice(0,10)} ${normalizedStartTime()}`;
	  const totalDays = () => Math.max(0, Math.min(30, Number(el.days.value || 0)));
	  const extraHours = () => Math.max(0, Math.min(23, Number(el.hours.value || 0)));
	  const periodHours = () => Math.max(1, totalDays() * 24 + extraHours());
	  const periodLabel = () => {
	    const daysValue = totalDays();
	    const hoursValue = extraHours();
	    const parts = [];
	    if (daysValue) parts.push(`${daysValue} дн.`);
	    if (hoursValue) parts.push(`${hoursValue} ч`);
	    return parts.join(' ') || '1 ч';
	  };
	  const syncDurationFields = () => {
	    const daysValue = totalDays();
	    const hoursValue = daysValue === 0 && extraHours() === 0 ? 1 : extraHours();
	    el.days.value = String(daysValue);
	    el.hours.value = String(hoursValue);
	  };
	  const periodEnd = () => addHours(periodStart(), periodHours());

  const buildAutoShifts = () => {
    const people = getPeople();
    const shifts = [];
    if (!people.length) return shifts;

    const step = planHours();
    const start = periodStart();
	    const totalHours = periodHours();

    for (let hour = 0, i = 0; hour < totalHours; hour += step, i++) {
      const from = addHours(start, hour);
      const to = addHours(start, Math.min(hour + step, totalHours));
      const needsKeeper = shiftNeedsKeeper(from, to);
      const lead = people[i % people.length];
      const keep = needsKeeper ? people[(i + 1) % people.length] : '';

	      shifts.push({
	        id: `auto-${from.getTime()}-${i}`,
	        from,
	        to,
        leader: lead,
        keepers: needsKeeper && keep && keep !== lead ? [keep] : [],
        source: 'auto'
      });
    }
    return shifts;
  };

	  let manualShifts = [];
	  const STORE_KEY = 'navdesk_watch_log_state_v1';

	  const readStoredState = () => {
	    try {
	      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
	      return parsed && typeof parsed === 'object' ? parsed : {};
	    } catch (error) {
	      return {};
	    }
	  };

	  const storedState = readStoredState();

	  const hydrateStoredFields = () => {
	    const saved = storedState.fields || {};
	    const map = {
	      route: el.route,
	      start: el.start,
	      startTime: el.startTime,
	      days: el.days,
	      hours: el.hours,
	      utc: el.utc,
	      mode: el.mode,
	      type: el.type,
	      captain: el.captain,
	      mate: el.mate,
	      crew: el.crew,
	      keeperMode: el.keeperMode,
	      keeperFrom: el.keeperFrom,
	      keeperTo: el.keeperTo
	    };

	    Object.entries(map).forEach(([key, node]) => {
	      if (node && saved[key] != null) node.value = saved[key];
	    });
	  };

	  const serializeShift = (s) => ({
	    id: s.id || `${s.source || 'shift'}-${s.from?.getTime?.() || Date.now()}`,
	    from: s.from instanceof Date ? s.from.toISOString() : '',
	    to: s.to instanceof Date ? s.to.toISOString() : '',
	    leader: s.leader || '',
	    keepers: Array.isArray(s.keepers) ? s.keepers.slice(0, 3) : [],
	    source: s.source || ''
	  });

	  const hydrateStoredManualShifts = () => {
	    if (!Array.isArray(storedState.manualShifts)) return;
	    manualShifts = storedState.manualShifts.map((s, index) => {
	      const from = new Date(s.from);
	      const to = new Date(s.to);
	      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || !s.leader) return null;
	      return {
	        id: s.id || `manual-${from.getTime()}-${index}`,
	        from,
	        to,
	        leader: s.leader,
	        keepers: Array.isArray(s.keepers) ? s.keepers.filter(Boolean).slice(0, 3) : [],
	        source: 'manual'
	      };
	    }).filter(Boolean);
	  };

	  const exposeManualState = () => {
	    window.navdeskWatchGetManualShifts = () => manualShifts.map(serializeShift);
	  };

  const normalizeManual = () => {
    manualShifts = manualShifts
      .filter(s => s && s.from instanceof Date && s.to instanceof Date && s.to > s.from && s.leader)
      .sort((a,b) => a.from - b.from);
  };

  const fillManualPeople = () => {
    if (!el.manualLeader || !el.manualKeeper) return;
    const people = getPeople();

    el.manualLeader.innerHTML = people.length
      ? people.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')
      : '<option value="">Нет экипажа</option>';

    el.manualKeeper.innerHTML = '<option value="">Нет</option>' +
      people.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
  };

	  const setManualDefaults = () => {
	    if (!el.manualFrom || !el.manualTo) return;
	    const base = periodStart();
	    if (!el.manualFrom.value) el.manualFrom.value = toInputDateTime(base);
	    if (!el.manualTo.value) el.manualTo.value = toInputDateTime(addHours(base, planHours()));
	  };

  const validateManual = () => {
    normalizeManual();

    const alerts = [];
    const errorIndexes = new Set();
    const warnIndexes = new Set();

    if (!manualShifts.length) return { alerts, errorIndexes, warnIndexes, hasError: false };

    const ps = periodStart();
    const pe = periodEnd();

    if (manualShifts[0].from > ps) {
      warnIndexes.add(0);
      alerts.push({ type:'warning', text:`Дыра до первой смены: ${ps.toLocaleString()} — ${manualShifts[0].from.toLocaleString()}` });
    }

    for (let i = 0; i < manualShifts.length - 1; i++) {
      const a = manualShifts[i];
      const b = manualShifts[i + 1];

      if (a.to > b.from) {
        errorIndexes.add(i);
        errorIndexes.add(i + 1);
        alerts.push({ type:'error', text:`Пересечение смен: ${a.from.toLocaleString()}–${a.to.toLocaleString()} и ${b.from.toLocaleString()}–${b.to.toLocaleString()}` });
      } else if (a.to < b.from) {
        warnIndexes.add(i);
        warnIndexes.add(i + 1);
        alerts.push({ type:'warning', text:`Дыра между сменами: ${a.to.toLocaleString()} — ${b.from.toLocaleString()}` });
      }
    }

    const lastIndex = manualShifts.length - 1;
    if (manualShifts[lastIndex].to < pe) {
      warnIndexes.add(lastIndex);
      alerts.push({ type:'warning', text:`Дыра после последней смены: ${manualShifts[lastIndex].to.toLocaleString()} — ${pe.toLocaleString()}` });
    }

    return { alerts, errorIndexes, warnIndexes, hasError: errorIndexes.size > 0 };
  };

  const renderManualList = () => {
    if (!el.manualList) return;
    normalizeManual();
    const validation = validateManual();

    if (!manualShifts.length) {
      el.manualList.innerHTML = '<div class="navdesk-watch-setup-note">Ручные смены ещё не добавлены.</div>';
      return;
    }

    el.manualList.innerHTML = manualShifts.map((s, i) => {
      const state = validation.errorIndexes.has(i) ? 'has-error' : validation.warnIndexes.has(i) ? 'has-warning' : '';
	      return `
	        <article class="navdesk-watch-manual__item ${state}" data-from="${esc(s.from.toISOString())}" data-to="${esc(s.to.toISOString())}" data-shift-id="${esc(s.id || '')}">
	          <div>
            <p><strong>${esc(fmt(s.from))} — ${esc(fmt(s.to))}</strong></p>
            <p>Старший: ${esc(s.leader)} · Подвахтенный: ${esc(s.keepers.join(', ') || 'нет')}</p>
          </div>
          <button type="button" class="navdesk-watch-manual__remove" data-manual-hard-remove="${i}">Удалить</button>
        </article>
      `;
    }).join('') + (
      validation.alerts.length
        ? `<div class="navdesk-watch-manual-alerts">${validation.alerts.slice(0, 8).map(a => `<div class="navdesk-watch-manual-alert is-${esc(a.type)}">${esc(a.text)}</div>`).join('')}</div>`
        : ''
    );
  };

  const calculateRest = (people, shifts) => {
    const ps = periodStart();
    const pe = periodEnd();

    return people.map(person => {
      let work = 0;

      shifts.forEach(s => {
        if (s.leader !== person && !(s.keepers || []).includes(person)) return;
        const os = Math.max(s.from.getTime(), ps.getTime());
        const oe = Math.min(s.to.getTime(), pe.getTime());
        if (oe > os) work += (oe - os) / 3600000;
      });

      let worst24 = 24;
      for (let t = ps.getTime(); t < pe.getTime(); t += 3600000) {
        const ws = new Date(t);
        const we = addHours(ws, 24);
        let workWindow = 0;

        shifts.forEach(s => {
          if (s.leader !== person && !(s.keepers || []).includes(person)) return;
          const os = Math.max(s.from.getTime(), ws.getTime());
          const oe = Math.min(s.to.getTime(), we.getTime());
          if (oe > os) workWindow += (oe - os) / 3600000;
        });

        worst24 = Math.min(worst24, 24 - workWindow);
      }

	      const rest = Math.max(0, periodHours() - work);
      let status = 'ok';
      let label = 'OK';
      const notes = [];

      if (worst24 < 10) {
        status = 'bad';
        label = 'FAIL';
      } else if (worst24 < 11) {
        status = 'warn';
        label = 'WARNING';
      }

      notes.push(`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`);

      return { person, work, rest, status, label, notes };
    });
  };

  const renderSchedule = (shifts, label, mode='day') => {
    const groups = {};
    shifts.forEach(s => {
      const key = fmtDay(s.from);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const keys = Object.keys(groups);
    const shown = mode === 'all' ? keys : keys.slice(0, 1);

    el.schedule.hidden = false;
    el.schedule.innerHTML = `
      <div class="navdesk-watch-schedule__head">
        <h4>${esc(label)}</h4>
        <p>всего смен: ${shifts.length} · UTC offset ${esc(el.utc.value)}</p>
      </div>
      <div class="navdesk-watch-display-controls">
        <button type="button" class="${mode === 'day' ? 'is-active' : ''}" data-unified-view="day">Первые сутки</button>
        <button type="button" class="${mode === 'all' ? 'is-active' : ''}" data-unified-view="all">Показать все</button>
      </div>
      ${shown.map(day => `
        <div class="navdesk-watch-day">
          <h5>${esc(day)}</h5>
          <div class="navdesk-watch-shifts">
	            ${groups[day].map(s => `
	              <article class="navdesk-watch-shift" data-shift-id="${esc(s.id || '')}" data-from="${esc(s.from.toISOString())}" data-to="${esc(s.to.toISOString())}" data-source="${esc(s.source || '')}">
		                <time>${esc(fmt(s.from))} — ${esc(fmt(s.to))} LT</time>
                <p class="navdesk-watch-shift__utc">UTC ${esc(fmt(localToUtc(s.from)))} — ${esc(fmt(localToUtc(s.to)))}</p>
                <p><strong>Старший:</strong> ${esc(s.leader || '—')}</p>
                <p><strong>Подвахтенный:</strong> ${esc((s.keepers || []).join(', ') || 'нет')}</p>
              </article>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    el.schedule.querySelectorAll('[data-unified-view]').forEach(btn => {
      btn.addEventListener('click', () => renderSchedule(shifts, label, btn.dataset.unifiedView));
    });
  };

  const renderRest = (report) => {
    el.rest.hidden = false;
    el.rest.innerHTML = `
      <div class="navdesk-watch-rest__head">
        <h4>Расчёт отдыха</h4>
        <p>Проверка по текущему расписанию.</p>
      </div>
      <div class="navdesk-watch-rest-list">
        ${report.map(r => `
          <article class="navdesk-watch-rest-card is-${esc(r.status)}">
            <strong>${esc(r.person)} · ${esc(r.label)}</strong>
            <p>Работа: ${r.work.toFixed(1)}ч · Отдых: ${r.rest.toFixed(1)}ч</p>
            <p>${esc(r.notes.join(' · '))}</p>
          </article>
        `).join('')}
      </div>
    `;
  };

  const ensureCentralLive = () => {
    let box = document.getElementById('watchLiveStatusCentral');
    const grid = document.querySelector('.navdesk-watch-grid');
    if (!box && grid) {
      box = document.createElement('section');
      box.id = 'watchLiveStatusCentral';
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      grid.insertBefore(box, grid.firstElementChild);
    }
    return box;
  };

  const fmtLeft = (ms) => {
    const total = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}ч ${String(m).padStart(2,'0')}м`;
  };

  let activeShifts = [];
  let activeHasError = false;
  let liveTimer = null;

	  const renderLive = () => {
    const box = ensureCentralLive();
    if (!box) return;

    if (activeHasError) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-error';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ошибка расписания</p>
          <h3 class="navdesk-watch-live__title">Есть пересечение смен</h3>
          <div class="navdesk-watch-live__meta"><p>Исправьте ручное расписание перед использованием live watch.</p></div>
        </div>
        <div class="navdesk-watch-live__timer"><span>Статус</span><strong>FAIL</strong></div>
      `;
      return;
    }

    if (!activeShifts.length) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ожидает расписания</p>
          <h3 class="navdesk-watch-live__title">Смены не сформированы</h3>
        </div>
        <div class="navdesk-watch-live__timer"><span>Статус</span><strong>—</strong></div>
      `;
      return;
    }

    const now = new Date();
    const current = activeShifts.find(s => now >= s.from && now < s.to);
    const next = activeShifts.find(s => s.from > now);

    if (current) {
      if (el.leaderOut) el.leaderOut.textContent = current.leader || 'Не назначен';
      if (el.crewOut) el.crewOut.textContent = current.keepers.length ? current.keepers.join(', ') : 'Подвахтенный не назначен';

      box.className = 'navdesk-watch-live navdesk-watch-live--central is-active';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Смена идёт сейчас</p>
          <h3 class="navdesk-watch-live__title">${esc(current.leader)}${current.keepers.length ? ' + ' + esc(current.keepers.join(', ')) : ''}</h3>
          <div class="navdesk-watch-live__meta">
            <p><strong>Вахта:</strong> ${esc(fmtTime(current.from))}–${esc(fmtTime(current.to))}</p>
            <p><strong>Следующая:</strong> ${next ? `${esc(fmtTime(next.from))}–${esc(fmtTime(next.to))}, ${esc(next.leader)}${next.keepers.length ? ' + ' + esc(next.keepers.join(', ')) : ''}` : 'нет'}</p>
          </div>
        </div>
        <div class="navdesk-watch-live__timer"><span>До смены</span><strong>${esc(fmtLeft(current.to - now))}</strong></div>
      `;
      return;
    }

    if (next) {
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      box.innerHTML = `
        <div>
          <p class="navdesk-watch-live__status">Ожидает смены</p>
          <h3 class="navdesk-watch-live__title">${esc(next.leader)}${next.keepers.length ? ' + ' + esc(next.keepers.join(', ')) : ''}</h3>
          <div class="navdesk-watch-live__meta"><p><strong>Начало:</strong> ${esc(fmt(next.from))}</p></div>
        </div>
        <div class="navdesk-watch-live__timer"><span>До начала</span><strong>${esc(fmtLeft(next.from - now))}</strong></div>
      `;
      return;
    }

    box.className = 'navdesk-watch-live navdesk-watch-live--central is-ended';
    box.innerHTML = `
      <div>
        <p class="navdesk-watch-live__status">Период завершён</p>
        <h3 class="navdesk-watch-live__title">Активных смен больше нет</h3>
      </div>
      <div class="navdesk-watch-live__timer"><span>Статус</span><strong>END</strong></div>
    `;
	  };

	  const publishSchedule = () => {
	    window.navdeskWatchSchedule = activeShifts.map(serializeShift);
	    window.dispatchEvent(new CustomEvent('navdesk:watch-schedule', {
	      detail: {
	        hasError: activeHasError,
	        shifts: window.navdeskWatchSchedule
	      }
	    }));
	  };

	  const applySchedule = () => {
	    syncDurationFields();
	    fillManualPeople();
	    const people = getPeople();

    if (el.mode.value === 'manual') {
      normalizeManual();
      renderManualList();
      const validation = validateManual();

      activeShifts = manualShifts.slice();
      activeHasError = validation.hasError;

	      el.summary.innerHTML = `<strong>Ручной режим:</strong> ${esc(periodStartLabel())}, ${esc(periodLabel())} · <strong>Людей:</strong> ${people.length} · <strong>Смен:</strong> ${manualShifts.length} · <strong>UTC:</strong> ${esc(el.utc.value)}${el.route?.value ? ` · <strong>Переход:</strong> ${esc(el.route.value)}` : ''}`;

      if (manualShifts.length) {
        renderSchedule(manualShifts, 'Ручное расписание вахт', 'day');
        renderRest(calculateRest(people, manualShifts));
      } else {
        el.schedule.hidden = true;
        el.rest.hidden = true;
      }

	      renderLive();
	      publishSchedule();
	      if (liveTimer) clearInterval(liveTimer);
	      liveTimer = setInterval(renderLive, 30000);
	      return;
    }

    const shifts = buildAutoShifts();
    activeShifts = shifts;
    activeHasError = false;

	    el.summary.innerHTML = `<strong>Авто режим:</strong> ${esc(periodStartLabel())}, ${esc(periodLabel())} · <strong>Людей:</strong> ${people.length} · <strong>Смен:</strong> ${shifts.length} · <strong>UTC:</strong> ${esc(el.utc.value)}${el.route?.value ? ` · <strong>Переход:</strong> ${esc(el.route.value)}` : ''}`;

    renderSchedule(shifts, 'Расписание вахт', 'day');
	    renderRest(calculateRest(people, shifts));
	    renderLive();
	    publishSchedule();

	    if (liveTimer) clearInterval(liveTimer);
	    liveTimer = setInterval(renderLive, 30000);
  };

  const syncManualVisibility = () => {
    if (el.manualEditor) el.manualEditor.hidden = el.mode.value !== 'manual';
    fillManualPeople();
    setManualDefaults();
    if (el.mode.value === 'manual') renderManualList();
  };

  if (el.manualAdd) {
    el.manualAdd.addEventListener('click', () => {
      if (el.mode.value !== 'manual') return;

      const from = new Date(el.manualFrom.value);
      const to = new Date(el.manualTo.value);
      const lead = el.manualLeader.value;
      const keep = el.manualKeeper.value;

      if (!el.manualFrom.value || !el.manualTo.value || !lead || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
        renderManualList();
        return;
      }

	      manualShifts.push({
	        id: `manual-${from.getTime()}-${Date.now()}`,
	        from,
        to,
        leader: lead,
        keepers: keep && keep !== lead ? [keep] : [],
        source: 'manual'
      });

	      normalizeManual();
	      el.manualFrom.value = toInputDateTime(to);
	      el.manualTo.value = toInputDateTime(addHours(to, planHours()));
	      renderManualList();
	      exposeManualState();
	    });
	  }

  if (el.manualList) {
    el.manualList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-manual-hard-remove]');
      if (!btn) return;
      const idx = Number(btn.dataset.manualHardRemove);
      if (!Number.isNaN(idx)) {
	        manualShifts.splice(idx, 1);
	        renderManualList();
	        exposeManualState();
	        applySchedule();
	      }
	    });
	  }

	  el.mode.addEventListener('change', syncManualVisibility);
	  [el.captain, el.mate, el.crew].forEach(input => input.addEventListener('input', fillManualPeople));
	  el.apply.addEventListener('click', applySchedule);

	  hydrateStoredFields();
	  hydrateStoredManualShifts();
	  exposeManualState();
	  syncManualVisibility();
	  if (getPeople().length || manualShifts.length) applySchedule();
	});

/* === Manual period logic fix 20260425-54 === */
document.addEventListener('DOMContentLoaded', () => {
  const mode = document.getElementById('watchScheduleMode');
  const apply = document.getElementById('watchSetupApply');

  if (!mode || !apply) return;

  const $ = (id) => document.getElementById(id);

	  const el = {
	    start: $('watchStartDate'),
	    startTime: $('watchStartTime'),
	    days: $('watchDays'),
	    hours: $('watchHours'),
	    utc: $('watchUtcOffset'),
    captain: $('watchCaptain'),
    mate: $('watchFirstMate'),
    crew: $('watchCrewInput'),
    summary: $('watchSetupSummary'),
    schedule: $('watchSchedulePreview'),
    rest: $('watchRestReport'),
    manualList: $('watchManualList'),
    leaderOut: $('watchLeader'),
    crewOut: $('watchCrew')
  };

  if (!el.summary || !el.schedule || !el.rest || !el.manualList) return;

  const esc = (v) => String(v ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');

  const addHours = (d, h) => new Date(d.getTime() + h * 3600000);
  const hoursBetween = (a, b) => Math.max(0, (b - a) / 3600000);

  const fmt = (d) => d.toLocaleString([], { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const fmtTime = (d) => d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const fmtDay = (d) => d.toLocaleDateString([], { day:'2-digit', month:'2-digit', year:'numeric' });

  const parseOffsetMinutes = (value) => {
    const m = String(value || '+00:00').trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!m) return 0;
    return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  };

  const localToUtc = (date) => new Date(date.getTime() - parseOffsetMinutes(el.utc?.value || '+00:00') * 60000);

  const uniq = (items) => {
    const seen = new Set();
    return items.map(x => String(x || '').trim()).filter(x => {
      const k = x.toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

	  const getPeople = () => uniq([
	    el.captain?.value,
	    el.mate?.value,
	    ...String(el.crew?.value || '').split(',')
	  ]);

	  const normalizedStartTime = () => (/^\d{2}:\d{2}$/.test(el.startTime?.value || '') ? el.startTime.value : '00:00');
	  const totalDays = () => Math.max(0, Math.min(30, Number(el.days?.value || 0)));
	  const extraHours = () => Math.max(0, Math.min(23, Number(el.hours?.value || 0)));
	  const periodHours = () => Math.max(1, totalDays() * 24 + extraHours());
	  const periodLabel = () => {
	    const daysValue = totalDays();
	    const hoursValue = extraHours();
	    const parts = [];
	    if (daysValue) parts.push(`${daysValue} дн.`);
	    if (hoursValue) parts.push(`${hoursValue} ч`);
	    return parts.join(' ') || '1 ч';
	  };
	  const declaredPeriod = () => {
	    const startDate = new Date(`${el.start?.value || new Date().toISOString().slice(0,10)}T${normalizedStartTime()}:00`);
	    return {
	      start: startDate,
	      end: addHours(startDate, periodHours()),
	      hours: periodHours()
	    };
	  };

	  const parseManualTextDate = (text) => {
    const year = (el.start?.value || new Date().toISOString().slice(0,10)).slice(0,4);
    const m = String(text || '').match(/(\d{2})\.(\d{2})(?:\.(\d{4}))?,?\s+(\d{2}):(\d{2})/);
    if (!m) return null;
    const y = m[3] || year;
    return new Date(`${y}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`);
  };

  const readManualShifts = () => {
    return [...el.manualList.querySelectorAll('.navdesk-watch-manual__item')]
      .map((item, index) => {
        const strong = item.querySelector('strong')?.textContent || '';
        const parts = strong.split('—').map(v => v.trim());
        if (parts.length < 2) return null;

        const from = item.dataset.from ? new Date(item.dataset.from) : parseManualTextDate(parts[0]);
        const to = item.dataset.to ? new Date(item.dataset.to) : parseManualTextDate(parts[1]);
        const detail = item.querySelector('p:nth-child(2)')?.textContent || '';
        const leader = (detail.match(/Старший:\s*([^·]+)/)?.[1] || '').trim();
        const keeperRaw = (detail.match(/Подвахтенный:\s*(.+)$/)?.[1] || '').trim();
        const keepers = keeperRaw && keeperRaw !== 'нет' ? [keeperRaw] : [];

        if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || !leader) return null;

        item.dataset.from = from.toISOString();
        item.dataset.to = to.toISOString();

	        return { item, index, id: item.dataset.shiftId || `manual-dom-${from.getTime()}-${index}`, from, to, leader, keepers };
      })
      .filter(Boolean)
      .sort((a,b) => a.from - b.from);
  };

	  const validateManual = (shifts, period = declaredPeriod()) => {
    const alerts = [];
    const errorItems = new Set();
    const warnItems = new Set();

    shifts.forEach(s => {
      s.item.classList.remove('has-warning', 'has-error');
    });

	    if (shifts.length && shifts[0].from > period.start) {
	      warnItems.add(shifts[0].item);
	      alerts.push({
	        type: 'warning',
	        text: `Дыра до первой смены: ${period.start.toLocaleString()} — ${shifts[0].from.toLocaleString()}`
	      });
	    }

	    for (let i = 0; i < shifts.length - 1; i++) {
      const a = shifts[i];
      const b = shifts[i + 1];

      if (a.to > b.from) {
        errorItems.add(a.item);
        errorItems.add(b.item);
        alerts.push({
          type: 'error',
          text: `Пересечение смен: ${a.from.toLocaleString()}–${a.to.toLocaleString()} и ${b.from.toLocaleString()}–${b.to.toLocaleString()}`
        });
      } else if (a.to < b.from) {
        warnItems.add(a.item);
        warnItems.add(b.item);
        alerts.push({
          type: 'warning',
          text: `Дыра между сменами: ${a.to.toLocaleString()} — ${b.from.toLocaleString()}`
        });
      }
    }

		    if (shifts.length) {
		      const last = shifts[shifts.length - 1];
		      if (last.to < period.end) {
		        warnItems.add(last.item);
		        alerts.push({
		          type: 'warning',
		          text: `Дыра после последней смены: ${last.to.toLocaleString()} — ${period.end.toLocaleString()}`
		        });
		      }
		    }

	    shifts.forEach((s) => {
	      if (s.from < period.start || s.to > period.end) {
	        warnItems.add(s.item);
	        alerts.push({
	          type: 'warning',
	          text: `Смена выходит за заявленный период перехода: ${s.from.toLocaleString()} — ${s.to.toLocaleString()}`
	        });
	      }
	    });

		    errorItems.forEach(item => item.classList.add('has-error'));
    warnItems.forEach(item => {
      if (!item.classList.contains('has-error')) item.classList.add('has-warning');
    });

    el.manualList.querySelectorAll('.navdesk-watch-manual-alerts').forEach(n => n.remove());

    if (alerts.length) {
      const box = document.createElement('div');
      box.className = 'navdesk-watch-manual-alerts';
      box.innerHTML = alerts.slice(0, 8).map(a => `
        <div class="navdesk-watch-manual-alert is-${esc(a.type)}">${esc(a.text)}</div>
      `).join('');
      el.manualList.appendChild(box);
    }

    return {
      alerts,
      hasError: alerts.some(a => a.type === 'error')
    };
  };

  const manualPeriod = (shifts) => {
    const first = shifts[0].from;
    const last = shifts[shifts.length - 1].to;
    const totalHours = Math.max(1, hoursBetween(first, last));
    return {
      start: first,
      end: last,
      hours: totalHours,
      daysLabel: Math.ceil(totalHours / 24)
    };
  };

  const calculateRest = (people, shifts, period) => {
    return people.map(person => {
      let work = 0;

      shifts.forEach(s => {
        if (s.leader !== person && !(s.keepers || []).includes(person)) return;
        const os = Math.max(s.from.getTime(), period.start.getTime());
        const oe = Math.min(s.to.getTime(), period.end.getTime());
        if (oe > os) work += (oe - os) / 3600000;
      });

      let worst24 = 24;
      for (let t = period.start.getTime(); t < period.end.getTime(); t += 3600000) {
        const ws = new Date(t);
        const we = addHours(ws, 24);
        let workWindow = 0;

        shifts.forEach(s => {
          if (s.leader !== person && !(s.keepers || []).includes(person)) return;
          const os = Math.max(s.from.getTime(), ws.getTime());
          const oe = Math.min(s.to.getTime(), we.getTime());
          if (oe > os) workWindow += (oe - os) / 3600000;
        });

        worst24 = Math.min(worst24, 24 - workWindow);
      }

      const rest = Math.max(0, period.hours - work);
      let status = 'ok';
      let label = 'OK';

      if (worst24 < 10) {
        status = 'bad';
        label = 'FAIL';
      } else if (worst24 < 11) {
        status = 'warn';
        label = 'WARNING';
      }

      return {
        person,
        work,
        rest,
        status,
        label,
        notes: [`минимальный отдых за 24ч: ${worst24.toFixed(1)}ч`]
      };
    });
  };

  const renderSchedule = (shifts, view='day') => {
    const groups = {};
    shifts.forEach(s => {
      const key = fmtDay(s.from);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const keys = Object.keys(groups);
    const shown = view === 'all' ? keys : keys.slice(0, 1);

    el.schedule.hidden = false;
    el.schedule.innerHTML = `
      <div class="navdesk-watch-schedule__head">
        <h4>Ручное расписание вахт</h4>
        <p>период по ручным сменам · всего смен: ${shifts.length} · UTC offset ${esc(el.utc?.value || '+00:00')}</p>
      </div>
      <div class="navdesk-watch-display-controls">
        <button type="button" class="${view === 'day' ? 'is-active' : ''}" data-manual54-view="day">Первые сутки</button>
        <button type="button" class="${view === 'all' ? 'is-active' : ''}" data-manual54-view="all">Показать все</button>
      </div>
      ${shown.map(day => `
        <div class="navdesk-watch-day">
          <h5>${esc(day)}</h5>
          <div class="navdesk-watch-shifts">
            ${groups[day].map(s => `
	              <article class="navdesk-watch-shift" data-shift-id="${esc(s.id || '')}" data-from="${esc(s.from.toISOString())}" data-to="${esc(s.to.toISOString())}" data-source="manual">
	                <time>${esc(fmt(s.from))} — ${esc(fmt(s.to))} LT</time>
                <p class="navdesk-watch-shift__utc">UTC ${esc(fmt(localToUtc(s.from)))} — ${esc(fmt(localToUtc(s.to)))}</p>
                <p><strong>Старший:</strong> ${esc(s.leader)}</p>
                <p><strong>Подвахтенный:</strong> ${esc((s.keepers || []).join(', ') || 'нет')}</p>
              </article>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    el.schedule.querySelectorAll('[data-manual54-view]').forEach(btn => {
      btn.addEventListener('click', () => renderSchedule(shifts, btn.dataset.manual54View));
    });
  };

  const renderRest = (report) => {
    el.rest.hidden = false;
    el.rest.innerHTML = `
      <div class="navdesk-watch-rest__head">
        <h4>Расчёт отдыха</h4>
        <p>Ручной режим: период считается от первой смены до последней.</p>
      </div>
      <div class="navdesk-watch-rest-list">
        ${report.map(r => `
          <article class="navdesk-watch-rest-card is-${esc(r.status)}">
            <strong>${esc(r.person)} · ${esc(r.label)}</strong>
            <p>Работа: ${r.work.toFixed(1)}ч · Отдых: ${r.rest.toFixed(1)}ч</p>
            <p>${esc(r.notes.join(' · '))}</p>
          </article>
        `).join('')}
      </div>
    `;
  };

  const ensureLive = () => {
    let box = document.getElementById('watchLiveStatusCentral');
    const grid = document.querySelector('.navdesk-watch-grid');
    if (!box && grid) {
      box = document.createElement('section');
      box.id = 'watchLiveStatusCentral';
      box.className = 'navdesk-watch-live navdesk-watch-live--central is-waiting';
      grid.insertBefore(box, grid.firstElementChild);
    }
    return box;
  };

  const renderFailLive = () => {
    const box = ensureLive();
    if (!box) return;
    box.className = 'navdesk-watch-live navdesk-watch-live--central is-error';
    box.innerHTML = `
      <div>
        <p class="navdesk-watch-live__status">Ошибка расписания</p>
        <h3 class="navdesk-watch-live__title">Есть пересечение смен</h3>
        <div class="navdesk-watch-live__meta"><p>Исправьте ручное расписание перед использованием live watch.</p></div>
      </div>
      <div class="navdesk-watch-live__timer"><span>Статус</span><strong>FAIL</strong></div>
    `;
  };

  const applyManual54 = () => {
    if (mode.value !== 'manual') return;

    const shifts = readManualShifts();
    const validation = validateManual(shifts);

    if (!shifts.length) {
      el.summary.innerHTML = '<strong>Ручной режим:</strong> добавьте хотя бы одну смену.';
      el.schedule.hidden = true;
      el.rest.hidden = true;
      return;
    }

	    const period = declaredPeriod();
	    const people = getPeople();

	    el.summary.innerHTML = `
	      <strong>Ручной режим:</strong>
	      ${esc(fmt(period.start))} — ${esc(fmt(period.end))} (${esc(periodLabel())}) ·
      <strong>Смен:</strong> ${shifts.length} ·
      <strong>Людей:</strong> ${people.length} ·
      <strong>UTC:</strong> ${esc(el.utc?.value || '+00:00')}
    `;

    renderSchedule(shifts, 'day');
    renderRest(calculateRest(people, shifts, period));

    if (validation.hasError) {
      renderFailLive();
    }
  };

  apply.addEventListener('click', applyManual54);
});

/* === Watch log actions and local draft 20260525-01 === */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const timeline = $('watchTimeline');
  const entrySave = $('watchEntrySave');
  const quickEntry = $('watchQuickEntry');

  if (!timeline || !entrySave) return;

  const STORE_KEY = 'navdesk_watch_log_state_v1';
  const ENTRY_LIMIT = 200;

	  const fields = {
	    route: $('watchVoyageRoute'),
	    start: $('watchStartDate'),
	    startTime: $('watchStartTime'),
	    days: $('watchDays'),
	    hours: $('watchHours'),
	    utc: $('watchUtcOffset'),
    mode: $('watchScheduleMode'),
    type: $('watchType'),
    captain: $('watchCaptain'),
    mate: $('watchFirstMate'),
    crew: $('watchCrewInput'),
    keeperMode: $('watchKeeperMode'),
    keeperFrom: $('watchKeeperFrom'),
    keeperTo: $('watchKeeperTo')
  };

  const entry = {
    course: $('watchEntryCourse'),
    speed: $('watchEntrySpeed'),
    position: $('watchEntryPosition'),
    weather: $('watchEntryWeather'),
    text: $('watchEntryText')
  };

  const actions = document.querySelector('.navdesk-watch-actions--open');
	  const saveButtons = [$('navdesk_watch_save'), $('navdesk_watch_save_closed')].filter(Boolean);
	  const printBtn = $('navdesk_watch_print');
	  const entriesPrintBtn = $('navdesk_watch_entries_print');
	  const pdfBtn = $('navdesk_watch_pdf');
	  const shareBtn = $('navdesk_watch_share');
	  const gpsBtn = $('watchEntryGps');
	  const gpsAutoBtn = $('watchEntryGpsAuto');
	  const gpsStatus = $('watchGpsStatus');
	  const reminderToggle = $('watchReminderToggle');
	  const reminderStatus = $('watchReminderStatus');
	  const signBtn = $('watchSignCurrent');
	  const signedList = $('watchSignedWatches');
	  const summary = $('watchSetupSummary');
  const schedule = $('watchSchedulePreview');
  const rest = $('watchRestReport');
  const currentTime = $('watchCurrentTime');
  const leaderOut = $('watchLeader');
  const crewOut = $('watchCrew');

	  let entries = [];
	  let signedWatches = [];
	  let restoredScheduleSnapshot = [];
	  let lastGps = null;
	  let gpsAuto = false;
	  let gpsWatchId = null;
	  let lastHourlyPositionKey = '';
	  let reminderState = {
	    enabled: false,
	    lastNotifiedShiftId: ''
	  };
	  let saveTimer = null;

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const plain = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

  const stamp = (date = new Date()) => date.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const ensureStatus = () => {
    let status = $('watchEntryStatus');
    if (status) return status;

    status = document.createElement('div');
    status.id = 'watchEntryStatus';
    status.className = 'navdesk-watch-status';
    status.setAttribute('role', 'status');

    if (actions) {
      actions.appendChild(status);
    } else if (timeline.parentNode) {
      timeline.parentNode.insertBefore(status, timeline);
    }

    return status;
  };

  const setStatus = (text) => {
    const status = ensureStatus();
    status.textContent = text || '';
  };

	  const setSignStatus = (text) => {
	    if (!signBtn) return;
	    let status = $('watchSignStatus');
	    if (!status) {
	      status = document.createElement('p');
	      status.id = 'watchSignStatus';
	      status.className = 'navdesk-watch-mini-status navdesk-watch-sign-status';
	      status.setAttribute('role', 'status');
	      signBtn.closest('.navdesk-watch-current__actions')?.insertAdjacentElement('afterend', status);
	    }
	    status.textContent = text || '';
	  };

  const readFields = () => Object.fromEntries(
    Object.entries(fields).map(([key, node]) => [key, node ? node.value : ''])
  );

  const writeFields = (values = {}) => {
    Object.entries(fields).forEach(([key, node]) => {
      if (!node || values[key] == null) return;
      node.value = values[key];
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

	  const readEntryDraft = () => Object.fromEntries(
	    Object.entries(entry).map(([key, node]) => [key, node ? node.value.trim() : ''])
	  );

	  const pad2 = (value) => String(value).padStart(2, '0');

	  const localHourKey = (date = new Date()) => (
	    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}`
	  );

	  const utcStamp = (value) => {
	    const date = new Date(value);
	    if (Number.isNaN(date.getTime())) return '-';
	    return date.toISOString().slice(0, 16).replace('T', ' ');
	  };

	  const normalizeScheduleShift = (shift) => {
	    const from = new Date(shift?.from);
	    const to = new Date(shift?.to);
	    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) return null;
	    return {
	      id: shift.id || `shift-${from.getTime()}`,
	      from,
	      to,
	      leader: plain(shift.leader || ''),
	      keepers: Array.isArray(shift.keepers) ? shift.keepers.map(plain).filter(Boolean) : [],
	      source: shift.source || ''
	    };
	  };

	  const shiftOverlapsDailyWindow = (from, to, startMinutes, endMinutes) => {
	    const start = new Date(from);
	    const end = new Date(to);
	    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return false;

	    const day = new Date(start);
	    day.setHours(0, 0, 0, 0);

	    while (day < end) {
	      const windowStart = new Date(day);
	      windowStart.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

	      const windowEnd = new Date(day);
	      windowEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

	      if (start < windowEnd && end > windowStart) return true;
	      day.setDate(day.getDate() + 1);
	    }

	    return false;
	  };

	  const shiftTouchesNight = (shift) => (
	    shiftOverlapsDailyWindow(shift.from, shift.to, 0, 6 * 60) ||
	    shiftOverlapsDailyWindow(shift.from, shift.to, 22 * 60, 24 * 60)
	  );

	  const shiftTouchesPreDawnWatch = (shift) => (
	    shiftOverlapsDailyWindow(shift.from, shift.to, 0, 4 * 60)
	  );

	  const shiftFlagLabels = (shift) => {
	    const labels = [];
	    if (shiftTouchesNight(shift) && !(shift.keepers || []).length) {
	      labels.push('Ночь без подвахты');
	    }
	    return labels;
	  };

	  const shiftFlagClasses = (shift) => {
	    const classes = [];
	    if (shiftTouchesNight(shift) && !(shift.keepers || []).length) classes.push('is-night-solo');
	    if (shiftTouchesPreDawnWatch(shift)) classes.push('is-pre-dawn-watch');
	    return classes.join(' ');
	  };

	  const readDomSchedule = () => Array.from(document.querySelectorAll('#watchSchedulePreview .navdesk-watch-shift'))
	    .map((shift, index) => {
	      const from = shift.dataset.from ? new Date(shift.dataset.from) : null;
	      const to = shift.dataset.to ? new Date(shift.dataset.to) : null;
	      const paragraphs = Array.from(shift.querySelectorAll('p')).map((node) => plain(node.textContent));
	      const leader = paragraphs.find((text) => text.startsWith('Старший:'))?.replace('Старший:', '').trim() || '';
	      const keeper = paragraphs.find((text) => text.startsWith('Подвахтенный:'))?.replace('Подвахтенный:', '').trim() || '';

	      if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;

	      return {
	        id: shift.dataset.shiftId || `dom-${from.getTime()}-${index}`,
	        from: from.toISOString(),
	        to: to.toISOString(),
	        leader,
	        keepers: keeper && keeper !== 'нет' ? [keeper] : [],
	        source: shift.dataset.source || 'dom'
	      };
	    })
	    .filter(Boolean);

	  const readScheduleSnapshot = () => {
	    const publicSchedule = Array.isArray(window.navdeskWatchSchedule) ? window.navdeskWatchSchedule : [];
	    const domSchedule = readDomSchedule();
	    const storedSchedule = restoredScheduleSnapshot.length
	      ? restoredScheduleSnapshot
	      : (Array.isArray(readState().scheduleSnapshot) ? readState().scheduleSnapshot : []);
	    const source = publicSchedule.length ? publicSchedule : (domSchedule.length ? domSchedule : storedSchedule);
	    return source
	      .map(normalizeScheduleShift)
	      .filter(Boolean)
	      .sort((a, b) => a.from - b.from);
	  };

	  const findShiftFor = (date = new Date()) => {
	    const shifts = readScheduleSnapshot();
	    return shifts.find((shift) => date >= shift.from && date < shift.to) || null;
	  };

	  const findNextShift = (date = new Date()) => (
	    readScheduleSnapshot().find((shift) => shift.from > date) || null
	  );

	  const findLastShift = (date = new Date()) => {
	    const shifts = readScheduleSnapshot().filter((shift) => shift.to <= date);
	    return shifts[shifts.length - 1] || null;
	  };

	  const serializeScheduleSnapshot = () => readScheduleSnapshot().map((shift) => ({
	    id: shift.id,
	    from: shift.from.toISOString(),
	    to: shift.to.toISOString(),
	    leader: shift.leader,
	    keepers: shift.keepers,
	    source: shift.source
	  }));

  const readState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

	  const writeState = () => {
	    const payload = {
	      version: 2,
	      updatedAt: new Date().toISOString(),
	      fields: readFields(),
	      draft: readEntryDraft(),
	      entries: entries.slice(0, ENTRY_LIMIT),
	      manualShifts: typeof window.navdeskWatchGetManualShifts === 'function'
	        ? window.navdeskWatchGetManualShifts()
	        : [],
	      scheduleSnapshot: serializeScheduleSnapshot(),
	      signedWatches: signedWatches.slice(0, 80),
	      gps: {
	        auto: gpsAuto,
	        last: lastGps,
	        lastHourlyPositionKey
	      },
	      reminder: reminderState
	    };

	    restoredScheduleSnapshot = payload.scheduleSnapshot;

    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      return false;
	    }
	  };

	  const scheduleSave = () => {
	    if (saveTimer) clearTimeout(saveTimer);
	    saveTimer = setTimeout(() => {
	      writeState();
	    }, 350);
	  };

	  const renderTimeline = () => {
    if (!entries.length) {
      timeline.innerHTML = '<article><time>-</time><p>Журнал готов к первой записи.</p></article>';
      return;
    }

    timeline.innerHTML = entries.slice(0, ENTRY_LIMIT).map((item) => {
	      const meta = [
	        item.type === 'hourly-gps' ? 'Часовая GPS отметка' : '',
	        item.course ? `Курс ${item.course}` : '',
	        item.speed ? `Скорость ${item.speed}` : '',
	        item.position ? `Позиция ${item.position}` : '',
	        item.weather ? item.weather : '',
	        item.gps?.accuracy ? `GPS ±${Math.round(item.gps.accuracy)} м` : ''
	      ].filter(Boolean);

      return `
        <article class="navdesk-watch-entry" data-watch-entry="${esc(item.id)}">
          <time datetime="${esc(item.createdAt)}">${esc(stamp(new Date(item.createdAt)))} · Старший: ${esc(item.leader || 'не назначен')}</time>
          <p>${esc(item.text || 'Без текстовой заметки.')}</p>
          ${meta.length ? `<div class="navdesk-watch-entry__meta">${meta.map(value => `<span>${esc(value)}</span>`).join('')}</div>` : ''}
        </article>
      `;
	    }).join('');
	  };

	  const renderSignedWatches = () => {
	    if (!signedList) return;

	    if (!signedWatches.length) {
	      signedList.hidden = true;
	      signedList.innerHTML = '';
	      return;
	    }

	    signedList.hidden = false;
	    signedList.innerHTML = `
	      <p class="navdesk-watch-signed__title">Подписанные смены</p>
	      ${signedWatches.slice(0, 4).map((item) => `
	        <article>
	          <time>${esc(stamp(new Date(item.signedAt)))}</time>
	          <span>${esc(item.leader || 'Смена')} · ${esc(item.shiftLabel || '')}</span>
	        </article>
	      `).join('')}
	    `;
	  };

	  const decorateScheduleFlags = () => {
	    const shiftCards = Array.from(document.querySelectorAll('#watchSchedulePreview .navdesk-watch-shift'));
	    shiftCards.forEach((card) => {
	      const paragraphs = Array.from(card.querySelectorAll('p')).map((node) => plain(node.textContent));
	      const keeper = paragraphs.find((text) => text.startsWith('Подвахтенный:'))?.replace('Подвахтенный:', '').trim() || '';
	      const shift = normalizeScheduleShift({
	        id: card.dataset.shiftId || '',
	        from: card.dataset.from || '',
	        to: card.dataset.to || '',
	        keepers: keeper && keeper !== 'нет' ? [keeper] : [],
	        source: card.dataset.source || ''
	      });

	      const previous = card.querySelector('.navdesk-watch-shift__badges');
	      if (previous) previous.remove();

	      card.classList.remove('is-night-solo', 'is-pre-dawn-watch');
	      if (!shift) return;

	      const classes = shiftFlagClasses(shift).split(' ').filter(Boolean);
	      classes.forEach((className) => card.classList.add(className));

	      const labels = shiftFlagLabels(shift);
	      if (!labels.length) return;

	      card.insertAdjacentHTML('beforeend', `
	        <div class="navdesk-watch-shift__badges">
	          ${labels.map((label) => `<span>${esc(label)}</span>`).join('')}
	        </div>
	      `);
	    });
	  };

  const restoreState = () => {
    const state = readState();
    if (state.fields) writeFields(state.fields);

	    restoredScheduleSnapshot = Array.isArray(state.scheduleSnapshot)
	      ? state.scheduleSnapshot.filter((item) => item && item.from && item.to)
	      : [];

	    entries = Array.isArray(state.entries)
	      ? state.entries.filter((item) => item && item.createdAt).slice(0, ENTRY_LIMIT)
	      : [];

	    signedWatches = Array.isArray(state.signedWatches)
	      ? state.signedWatches.filter((item) => item && item.signedAt).slice(0, 80)
	      : [];

	    lastGps = state.gps?.last || null;
	    lastHourlyPositionKey = state.gps?.lastHourlyPositionKey || '';
	    reminderState = {
	      enabled: !!state.reminder?.enabled,
	      lastNotifiedShiftId: state.reminder?.lastNotifiedShiftId || ''
	    };

	    if (state.draft) {
	      Object.entries(entry).forEach(([key, node]) => {
	        if (node && state.draft[key] != null) node.value = state.draft[key];
	      });
	    }

	    if (reminderToggle) reminderToggle.checked = reminderState.enabled;

	    renderTimeline();
	    renderSignedWatches();
	    decorateScheduleFlags();
	  };

	  const collectEntry = () => {
	    const draft = readEntryDraft();
	    const hasText = Object.values(draft).some(Boolean);
	    if (!hasText) return null;
	    const now = new Date();
	    const shift = findShiftFor(now);

	    return {
	      id: `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`,
	      createdAt: now.toISOString(),
	      type: 'manual',
	      shiftId: shift?.id || '',
	      watchTime: plain(currentTime?.textContent || ''),
	      leader: plain(leaderOut?.textContent || ''),
	      crew: plain(crewOut?.textContent || ''),
	      gps: lastGps && draft.position === lastGps.label ? lastGps : null,
	      ...draft
	    };
	  };

  const saveDraft = (message = 'Черновик вахтенного журнала сохранен на этом устройстве.') => {
    const ok = writeState();
    setStatus(ok ? message : 'Не удалось сохранить черновик в localStorage.');
    return ok;
  };

  const focusEntry = () => {
    const target = entry.text || entry.position || entry.course;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => target?.focus({ preventScroll: true }), 260);
  };

  const clearTextAfterSave = () => {
    if (entry.text) entry.text.value = '';
    entry.text?.focus({ preventScroll: true });
  };

	  const addEntry = () => {
	    const item = collectEntry();
	    if (!item) {
      setStatus('Запись пустая: добавьте курс, позицию, ветер или текст.');
      focusEntry();
      return;
    }

    entries.unshift(item);
    entries = entries.slice(0, ENTRY_LIMIT);
    renderTimeline();
	    clearTextAfterSave();
	    saveDraft('Запись добавлена в локальный вахтенный журнал.');
	  };

	  const formatCoordinate = (value, positive, negative, width) => {
	    const hemisphere = value >= 0 ? positive : negative;
	    const absolute = Math.abs(value);
	    const degrees = Math.floor(absolute);
	    const minutes = (absolute - degrees) * 60;
	    return `${String(degrees).padStart(width, '0')}°${minutes.toFixed(3)}'${hemisphere}`;
	  };

	  const formatGpsLabel = (coords) => (
	    `${formatCoordinate(coords.latitude, 'N', 'S', 2)} ${formatCoordinate(coords.longitude, 'E', 'W', 3)}`
	  );

	  const setGpsStatus = (text) => {
	    if (gpsStatus) gpsStatus.textContent = text;
	  };

	  const applyGpsPosition = (position, source = 'geolocation') => {
	    const coords = position.coords;
	    const label = formatGpsLabel(coords);
	    lastGps = {
	      source,
	      label,
	      lat: Number(coords.latitude.toFixed(7)),
	      lon: Number(coords.longitude.toFixed(7)),
	      accuracy: Number.isFinite(coords.accuracy) ? Math.round(coords.accuracy) : null,
	      at: new Date(position.timestamp || Date.now()).toISOString()
	    };

	    if (entry.position) entry.position.value = label;
	    setGpsStatus(`GPS позиция обновлена: ${label}${lastGps.accuracy ? `, точность около ${lastGps.accuracy} м` : ''}.`);
	    scheduleSave();
	    maybeCreateHourlyGpsEntry();
	  };

	  const gpsErrorText = (error) => {
	    if (error?.code === 1) return 'Доступ к геопозиции запрещен. Позицию можно ввести вручную.';
	    if (error?.code === 2) return 'Устройство не смогло определить позицию.';
	    if (error?.code === 3) return 'GPS не ответил вовремя.';
	    return 'GPS недоступен в этом браузере.';
	  };

	  const requestGpsPosition = () => {
	    if (!navigator.geolocation) {
	      setGpsStatus('GPS недоступен в этом браузере. Позицию можно ввести вручную.');
	      return;
	    }

	    setGpsStatus('Запрашиваю позицию устройства...');
	    navigator.geolocation.getCurrentPosition(
	      (position) => applyGpsPosition(position),
	      (error) => setGpsStatus(gpsErrorText(error)),
	      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
	    );
	  };

	  function maybeCreateHourlyGpsEntry() {
	    if (!gpsAuto || !lastGps || !lastGps.label) return;

	    const now = new Date();
	    const key = localHourKey(now);
	    if (lastHourlyPositionKey === key) return;

	    const age = now.getTime() - new Date(lastGps.at).getTime();
	    if (age > 20 * 60000) return;

	    const shift = findShiftFor(now);
	    const item = {
	      id: `watch-gps-${Date.now()}-${Math.random().toString(16).slice(2)}`,
	      createdAt: now.toISOString(),
	      type: 'hourly-gps',
	      shiftId: shift?.id || '',
	      watchTime: plain(currentTime?.textContent || ''),
	      leader: plain(leaderOut?.textContent || shift?.leader || ''),
	      crew: plain(crewOut?.textContent || shift?.keepers?.join(', ') || ''),
	      course: entry.course?.value.trim() || '',
	      speed: entry.speed?.value.trim() || '',
	      position: lastGps.label,
	      weather: entry.weather?.value.trim() || '',
	      text: 'Часовая GPS отметка.',
	      gps: lastGps
	    };

	    entries.unshift(item);
	    entries = entries.slice(0, ENTRY_LIMIT);
	    lastHourlyPositionKey = key;
	    renderTimeline();
	    saveDraft('Часовая GPS отметка добавлена в локальный журнал.');
	  }

	  const setGpsAuto = (enabled) => {
	    gpsAuto = !!enabled;
	    if (gpsAutoBtn) {
	      gpsAutoBtn.classList.toggle('is-active', gpsAuto);
	      gpsAutoBtn.setAttribute('aria-pressed', gpsAuto ? 'true' : 'false');
	    }

	    if (!gpsAuto) {
	      if (gpsWatchId != null && navigator.geolocation?.clearWatch) {
	        navigator.geolocation.clearWatch(gpsWatchId);
	      }
	      gpsWatchId = null;
	      setGpsStatus('GPS авто выключен. Позиция вводится вручную или кнопкой GPS.');
	      scheduleSave();
	      return;
	    }

	    if (!navigator.geolocation) {
	      gpsAuto = false;
	      setGpsStatus('GPS авто недоступен в этом браузере.');
	      return;
	    }

	    setGpsStatus('GPS авто включен. Часовые отметки будут добавляться локально.');
	    requestGpsPosition();
	    gpsWatchId = navigator.geolocation.watchPosition(
	      (position) => applyGpsPosition(position),
	      (error) => setGpsStatus(gpsErrorText(error)),
	      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
	    );
	    scheduleSave();
	  };

	  const updateReminderStatus = (text) => {
	    if (reminderStatus) reminderStatus.textContent = text;
	  };

	  const requestNotificationPermission = async () => {
	    if (!('Notification' in window)) return 'unsupported';
	    if (Notification.permission !== 'default') return Notification.permission;
	    try {
	      return await Notification.requestPermission();
	    } catch (error) {
	      return Notification.permission;
	    }
	  };

	  const showWatchReminder = (shift) => {
	    const title = 'Вахта через 15 минут';
	    const body = `${shift.leader || 'Смена'}${shift.keepers.length ? ` + ${shift.keepers.join(', ')}` : ''}, начало ${stamp(shift.from)}`;

	    try {
	      if ('Notification' in window && Notification.permission === 'granted') {
	        new Notification(title, { body });
	      }
	    } catch (error) {}

	    setStatus(`${title}: ${body}`);
	  };

	  const checkWatchReminder = () => {
	    if (!reminderState.enabled) {
	      updateReminderStatus('Напоминание выключено.');
	      return;
	    }

	    const next = findNextShift();
	    if (!next) {
	      updateReminderStatus('Следующих смен в сформированном расписании нет.');
	      return;
	    }

	    const ms = next.from - new Date();
	    const minutes = Math.max(0, Math.ceil(ms / 60000));
	    updateReminderStatus(`Следующая смена: ${stamp(next.from)}, осталось ${minutes} мин.`);

	    if (ms <= 15 * 60000 && ms > 0 && reminderState.lastNotifiedShiftId !== next.id) {
	      reminderState.lastNotifiedShiftId = next.id;
	      showWatchReminder(next);
	      writeState();
	    }
	  };

	  const hashText = (text) => {
	    let hash = 5381;
	    for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
	    return (hash >>> 0).toString(16).padStart(8, '0');
	  };

	  const signCurrentWatch = () => {
	    const now = new Date();
	    const shift = findShiftFor(now) || findLastShift(now);

	    if (!shift) {
	      const message = 'Сначала сформируйте расписание, затем подпишите текущую или последнюю смену.';
	      setSignStatus(message);
	      setStatus(message);
	      return;
	    }

	    const shiftEntries = entries.filter((item) => {
	      const entryDate = new Date(item.createdAt);
	      return item.shiftId === shift.id || (entryDate >= shift.from && entryDate < shift.to);
	    });

	    const snapshot = {
	      fields: readFields(),
	      shift: {
	        id: shift.id,
	        from: shift.from.toISOString(),
	        to: shift.to.toISOString(),
	        leader: shift.leader,
	        keepers: shift.keepers
	      },
	      entries: shiftEntries,
	      signedAt: now.toISOString()
	    };

	    const signed = {
	      id: `signed-${shift.id}-${Date.now()}`,
	      signedAt: now.toISOString(),
	      signedBy: plain(leaderOut?.textContent || shift.leader || ''),
	      leader: shift.leader,
	      shiftLabel: `${stamp(shift.from)} - ${stamp(shift.to)}`,
	      entriesCount: shiftEntries.length,
	      snapshotHash: hashText(JSON.stringify(snapshot)),
	      snapshot
	    };

	    signedWatches.unshift(signed);
	    signedWatches = signedWatches.slice(0, 80);
	    renderSignedWatches();
	    setSignStatus(`Смена подписана. Хеш: ${signed.snapshotHash}.`);
	    saveDraft(`Смена подписана локально. Контрольный хеш: ${signed.snapshotHash}.`);
	  };

  const formatCellText = (value) => esc(plain(value)).replace(/\n/g, '<br>');

  const formatPrintDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modeLabel = (value) => {
    if (value === 'manual') return 'Ручной';
    if (value === 'auto') return 'Авто';
    return value || '-';
  };

	  const typeLabel = (value) => {
    const labels = {
      recommended: 'Рекомендовать',
      '3x3': '3 / 3',
      '4x4': '4 / 4',
      '4x8': '4 / 8',
      '6x6': '6 / 6',
      '2x2': '2 / 2'
    };
	    return labels[value] || value || '-';
	  };

	  const durationLabel = (fieldsValue = readFields()) => {
	    const daysValue = Math.max(0, Math.min(30, Number(fieldsValue.days || 0)));
	    const hoursValue = Math.max(0, Math.min(23, Number(fieldsValue.hours || 0)));
	    const parts = [];
	    if (daysValue) parts.push(`${daysValue} дн.`);
	    if (hoursValue) parts.push(`${hoursValue} ч`);
	    return parts.join(' ') || '1 ч';
	  };

  const buildJournalRows = () => {
    const sortedEntries = entries
      .slice(0, ENTRY_LIMIT)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

	    const rows = sortedEntries.map((item, index) => `
	      <tr>
	        <td class="num">${index + 1}</td>
	        <td class="date">${esc(formatPrintDateTime(item.createdAt))}</td>
	        <td class="date">${esc(utcStamp(item.createdAt))}</td>
	        <td>${formatCellText(item.leader || '-')}</td>
	        <td>${formatCellText(item.position || '-')}</td>
	        <td class="narrow">${formatCellText(item.course || '-')}</td>
	        <td class="narrow">${formatCellText(item.speed || '-')}</td>
	        <td>${formatCellText(item.weather || '-')}</td>
	        <td class="logtext">${formatCellText(item.text || 'Без текстовой заметки.')}${item.gps?.accuracy ? `<br><small>GPS ±${esc(item.gps.accuracy)} м</small>` : ''}</td>
	        <td class="signature"></td>
	      </tr>
	    `);

    const blankRows = Math.max(6, 14 - rows.length);
    for (let i = 0; i < blankRows; i++) {
      rows.push(`
        <tr class="blank-row">
          <td class="num">${sortedEntries.length + i + 1}</td>
		          <td></td>
		          <td></td>
		          <td></td>
		          <td></td>
		          <td class="narrow"></td>
	          <td class="narrow"></td>
	          <td></td>
          <td class="logtext"></td>
          <td class="signature"></td>
        </tr>
      `);
    }

    return rows.join('');
  };

	  const formatPrintDate = (value) => {
	    const date = new Date(value);
	    if (Number.isNaN(date.getTime())) return '-';
	    return date.toLocaleDateString([], {
	      weekday: 'short',
	      year: 'numeric',
	      month: '2-digit',
	      day: '2-digit'
	    });
	  };

	  const formatPrintTime = (value) => {
	    const date = new Date(value);
	    if (Number.isNaN(date.getTime())) return '-';
	    return date.toLocaleTimeString([], {
	      hour: '2-digit',
	      minute: '2-digit'
	    });
	  };

	  const groupScheduleByDay = () => {
	    const groups = {};
	    readScheduleSnapshot().forEach((shift) => {
	      const key = formatPrintDate(shift.from);
	      if (!groups[key]) groups[key] = [];
	      groups[key].push(shift);
	    });
	    return groups;
	  };

	  const buildScheduleDaySections = () => {
	    const groups = groupScheduleByDay();
	    const days = Object.keys(groups);

	    if (!days.length) {
	      return '<section class="watch-day"><p class="empty-line">Расписание не сформировано.</p></section>';
	    }

	    return days.map((day) => `
	      <section class="watch-day">
	        <div class="section-title">
	          <h2>${esc(day)}</h2>
	          <span>${groups[day].length} смен</span>
	        </div>
	        <table class="watch-table">
	          <thead>
	            <tr>
	              <th class="num">№</th>
	              <th class="time">LT</th>
	              <th class="time">UTC</th>
	              <th>Старший</th>
	              <th>Подвахтенный</th>
	              <th>Отметка</th>
	              <th>Подпись</th>
	            </tr>
	          </thead>
	          <tbody>
	            ${groups[day].map((shift, index) => {
	              const flags = shiftFlagLabels(shift);
	              return `
	                <tr class="${esc(shiftFlagClasses(shift))}">
	                  <td class="num">${index + 1}</td>
	                  <td>${formatCellText(`${formatPrintTime(shift.from)}\n${formatPrintTime(shift.to)}`)}</td>
	                  <td>${formatCellText(`${utcStamp(shift.from)}\n${utcStamp(shift.to)}`)}</td>
	                  <td>${formatCellText(shift.leader || '-')}</td>
	                  <td>${formatCellText(shift.keepers.join(', ') || 'нет')}</td>
	                  <td>${flags.length ? `<span class="flag-list">${flags.map((flag) => `<span>${esc(flag)}</span>`).join('')}</span>` : ''}</td>
	                  <td></td>
	                </tr>
	              `;
	            }).join('')}
	          </tbody>
	        </table>
	      </section>
	    `).join('');
	  };

	  const buildRestRows = () => {
    const cards = Array.from(document.querySelectorAll('#watchRestReport .navdesk-watch-rest-card')).slice(0, 12);

    if (!cards.length) {
      return '<tr><td colspan="3">Расчет отдыха не сформирован.</td></tr>';
    }

    return cards.map((card) => {
      const title = plain(card.querySelector('strong')?.textContent || '');
      const details = Array.from(card.querySelectorAll('p')).map((node) => plain(node.textContent));
      return `
        <tr>
          <td>${formatCellText(title || '-')}</td>
          <td>${formatCellText(details[0] || '-')}</td>
          <td>${formatCellText(details[1] || '-')}</td>
        </tr>
      `;
	    }).join('');
	  };

	  const buildSignedRows = () => {
	    if (!signedWatches.length) {
	      return '<tr><td colspan="5">Подписанных смен пока нет.</td></tr>';
	    }

		    return signedWatches.slice(0, 80).map((item, index) => `
		      <tr>
		        <td class="num">${index + 1}</td>
	        <td>${formatCellText(item.shiftLabel || '-')}</td>
	        <td>${formatCellText(item.signedBy || item.leader || '-')}</td>
	        <td>${formatCellText(item.entriesCount ?? 0)}</td>
	        <td>${formatCellText(item.snapshotHash || '-')}</td>
	      </tr>
	    `).join('');
	  };

	  const buildVoyageStrip = () => {
		    const fieldValues = readFields();
		    const current = [
	      ['Переход / маршрут', fieldValues.route],
	      ['Старт LT', [fieldValues.start, fieldValues.startTime].filter(Boolean).join(' ')],
	      ['Длительность', durationLabel(fieldValues)],
	      ['UTC offset', fieldValues.utc],
      ['Режим', modeLabel(fieldValues.mode)],
      ['Тип вахты', typeLabel(fieldValues.type)],
      ['Капитан', fieldValues.captain],
      ['Первый помощник', fieldValues.mate],
      ['Экипаж', fieldValues.crew],
      ['Текущая вахта', plain(leaderOut?.textContent || '')],
	      ['Состав', plain(crewOut?.textContent || '')]
	    ].filter(([, value]) => value);

	    return `
	      <section class="voyage-strip">
	        ${current.map(([label, value]) => `
	          <div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>
	        `).join('')}
	      </section>
	      ${summary ? `<p class="summary-line">${esc(plain(summary.textContent))}</p>` : ''}
	    `;
	  };

	  const buildEntriesPrintBody = () => {
	    return `
	      ${buildVoyageStrip()}
	      <section class="ledger">
		        <div class="section-title">
		          <h2>Лист вахтенных записей</h2>
		          <span>записи вахтенного</span>
		        </div>
		        <table class="journal-table">
	          <colgroup>
	            <col style="width:4%">
	            <col style="width:11%">
	            <col style="width:10%">
	            <col style="width:9%">
	            <col style="width:13%">
	            <col style="width:6%">
	            <col style="width:6%">
	            <col style="width:11%">
	            <col style="width:23%">
	            <col style="width:7%">
	          </colgroup>
	          <thead>
	            <tr>
	              <th class="num">№</th>
	              <th>Дата / время LT</th>
	              <th>UTC</th>
	              <th>Старший</th>
	              <th>Позиция</th>
	              <th>Курс</th>
              <th>Скорость</th>
              <th>Ветер / море</th>
              <th>Запись</th>
              <th>Подпись</th>
            </tr>
          </thead>
          <tbody>${buildJournalRows()}</tbody>
	        </table>
	      </section>
	    `;
	  };

	  const buildWatchPrintBody = () => {
	    return `
	      ${buildVoyageStrip()}
	      <section class="ledger watch-ledger">
	        <div class="section-title">
	          <h2>Расписание вахт</h2>
	          <span>линейно по суткам</span>
	        </div>
	        ${buildScheduleDaySections()}
	      </section>
	      <section class="appendix-grid">
	        <div class="appendix">
	          <div class="section-title">
		            <h2>Подписанные смены</h2>
		            <span>локальные снимки</span>
		          </div>
	          <table class="mini-table">
	            <thead><tr><th>№</th><th>Смена</th><th>Подписал</th><th>Записей</th><th>Хеш</th></tr></thead>
	            <tbody>${buildSignedRows()}</tbody>
		          </table>
		        </div>
		        <div class="appendix">
		          <div class="section-title">
            <h2>Контроль отдыха</h2>
            <span>по текущему расчету</span>
          </div>
          <table class="mini-table">
            <thead><tr><th>Член экипажа</th><th>Работа / отдых</th><th>Комментарий</th></tr></thead>
            <tbody>${buildRestRows()}</tbody>
          </table>
	        </div>
	      </section>
	    `;
	  };

	  const buildPrintDocument = ({
	    title = 'Вахтенный журнал',
	    formatLabel = 'watch schedule',
	    pageSize = 'A4 portrait',
	    bodyClass = 'is-portrait',
	    bodyHtml = buildWatchPrintBody()
	  } = {}) => {
	    const logo = new URL('brand/logo-header-inline-light.png', window.location.href).href;
	    return `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)}</title>
<style>
  @page { size: ${pageSize}; margin: 9mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #10243a; }
  body { font: 9.6px/1.32 Inter, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body.is-portrait { font-size: 9.8px; }
  header { display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start; border-bottom: 2px solid #10243a; padding-bottom: 6px; margin-bottom: 7px; }
  img { width: 158px; height: auto; display: block; }
  h1 { margin: 0; font: 700 22px/1.05 Georgia, serif; letter-spacing: .01em; }
  h2, p { margin: 0; }
  .subtitle { margin-bottom: 2px; color: rgba(16,36,58,.66); font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; }
  .print-meta { display: flex; gap: 12px; margin-top: 4px; color: rgba(16,36,58,.72); font-size: 8.8px; }
  .voyage-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-left: 1px solid #10243a; border-top: 1px solid #10243a; margin-bottom: 0; }
  .is-landscape .voyage-strip { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .voyage-strip div { min-height: 31px; padding: 4px 6px; border-right: 1px solid rgba(16,36,58,.42); border-bottom: 1px solid rgba(16,36,58,.42); }
  .voyage-strip span { display: block; margin-bottom: 2px; color: rgba(16,36,58,.58); font-size: 7.6px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
  .voyage-strip strong { display: block; color: #10243a; font-size: 10px; line-height: 1.18; }
  .summary-line { padding: 5px 6px; border: 1px solid #10243a; border-top: 0; margin-bottom: 7px; font-weight: 700; color: rgba(16,36,58,.78); }
  .section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 0 0 4px; }
  .section-title h2 { font-size: 12px; line-height: 1.1; text-transform: uppercase; letter-spacing: .08em; }
  .section-title span { color: rgba(16,36,58,.58); font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	  th, td { border: 1px solid #10243a; padding: 3px 4px; vertical-align: top; overflow-wrap: anywhere; }
	  th { background: #e8edf2; font-size: 7.8px; line-height: 1.15; text-transform: uppercase; letter-spacing: .06em; text-align: left; }
	  td { min-height: 26px; font-size: 8.8px; }
	  small { color: rgba(16,36,58,.62); font-size: 7.5px; }
  .empty-line { padding: 8px; border: 1px solid #10243a; font-weight: 700; }
  .journal-table .num { width: 4%; text-align: center; }
  .journal-table .signature { text-align: center; }
  .journal-table tbody tr { height: 28px; }
  .journal-table tbody tr.blank-row { height: 24px; }
  .ledger { margin-bottom: 7px; }
  .watch-day { margin-bottom: 7px; break-inside: avoid; page-break-inside: avoid; }
  .watch-table .num { width: 5%; text-align: center; }
  .watch-table .time { width: 16%; }
  .watch-table tbody tr { height: 27px; }
  .watch-table tr.is-night-solo td { background: #f6f0e5; }
  .watch-table tr.is-pre-dawn-watch td { box-shadow: inset 3px 0 0 #8a6a35; }
  .flag-list { display: flex; flex-wrap: wrap; gap: 2px; }
  .flag-list span { display: inline-block; border: 1px solid rgba(16,36,58,.34); border-radius: 999px; padding: 1px 4px; font-size: 7.2px; font-weight: 800; white-space: nowrap; }
	  .appendix-grid { display: grid; grid-template-columns: 1fr; gap: 8px; break-before: page; page-break-before: always; }
  .is-landscape .appendix-grid { break-before: auto; page-break-before: auto; }
  .mini-table th, .mini-table td { font-size: 8px; padding: 3px 4px; }
  .mini-table th { background: #f2f5f7; }
  footer { display: flex; justify-content: space-between; border-top: 1px solid rgba(16,36,58,.30); padding-top: 5px; margin-top: 7px; color: rgba(16,36,58,.64); font-size: 8px; }
</style>
</head>
<body class="${esc(bodyClass)}">
  <header>
    <div>
      <p class="subtitle">Vetus Nauta - Brkovic</p>
      <h1>${esc(title)}</h1>
      <div class="print-meta">
        <span>Сформирован: ${esc(stamp())}</span>
        <span>Формат: ${esc(formatLabel)}</span>
      </div>
    </div>
    <img src="${esc(logo)}" alt="Vetus Nauta - Brkovic">
  </header>
  ${bodyHtml}
  <footer><span>Vetus Nauta - Brkovic</span><span>Have a good watch Captain!</span></footer>
  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 120));
  </script>
</body>
</html>`;
	  };

  const openPrint = (message, options = {}) => {
    saveDraft('');
    const win = window.open('', '_blank', 'width=1320,height=980');
    if (!win) {
      setStatus('Браузер заблокировал окно печати.');
      return;
    }
    win.document.open();
    win.document.write(buildPrintDocument(options));
    win.document.close();
    try { win.focus(); } catch (error) {}
    setStatus(message);
  };

  const buildShareText = () => {
	    const fieldValues = readFields();
	    const lines = [
	      'Вахтенный журнал',
	      `Переход: ${fieldValues.route || '-'}`,
	      `Старт: ${[fieldValues.start, fieldValues.startTime].filter(Boolean).join(' ') || '-'}`,
	      `Длительность: ${durationLabel(fieldValues)}`,
	      `UTC: ${fieldValues.utc || '-'}`,
	      `Капитан: ${fieldValues.captain || '-'}`,
      `Текущая вахта: ${plain(leaderOut?.textContent || '-')}`,
      `Состав: ${plain(crewOut?.textContent || '-')}`,
      ''
    ];

    entries.slice(0, 12).forEach((item) => {
      lines.push(`${stamp(new Date(item.createdAt))}: ${item.text || 'Без текстовой заметки.'}`);
      const meta = [
        item.course ? `курс ${item.course}` : '',
        item.speed ? `скорость ${item.speed}` : '',
        item.position ? `позиция ${item.position}` : '',
        item.weather ? item.weather : ''
      ].filter(Boolean).join(', ');
      if (meta) lines.push(`  ${meta}`);
    });

    return lines.join('\n').trim();
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {}

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-999px';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (error) {
      ok = false;
    }
    textarea.remove();
    return ok;
  };

  saveButtons.forEach((button) => {
    button.addEventListener('click', () => saveDraft());
  });

	  quickEntry?.addEventListener('click', () => {
	    saveDraft('');
	    focusEntry();
	    setStatus('Форма быстрой записи готова.');
	  });

	  entrySave.addEventListener('click', addEntry);
	  gpsBtn?.addEventListener('click', requestGpsPosition);
	  gpsAutoBtn?.addEventListener('click', () => setGpsAuto(!gpsAuto));
	  signBtn?.addEventListener('click', signCurrentWatch);

	  reminderToggle?.addEventListener('change', async () => {
	    reminderState.enabled = reminderToggle.checked;
	    if (reminderState.enabled) {
	      const permission = await requestNotificationPermission();
	      updateReminderStatus(permission === 'denied'
	        ? 'Браузерные уведомления запрещены, но экранное напоминание останется.'
	        : 'Напоминание включено.');
	    } else {
	      updateReminderStatus('Напоминание выключено.');
	    }
	    checkWatchReminder();
	    saveDraft('');
	  });

	  window.addEventListener('navdesk:watch-schedule', () => {
	    decorateScheduleFlags();
	    checkWatchReminder();
	    scheduleSave();
	  });

	  schedule?.addEventListener('click', (event) => {
	    if (!event.target.closest('[data-unified-view], [data-manual54-view]')) return;
	    setTimeout(decorateScheduleFlags, 0);
	  });

  printBtn?.addEventListener('click', () => {
    openPrint('A4 документ вахт подготовлен.', {
      title: 'Вахтенный журнал',
      formatLabel: 'watch schedule / signatures / rest control',
      pageSize: 'A4 portrait',
      bodyClass: 'is-portrait',
      bodyHtml: buildWatchPrintBody()
    });
  });

  entriesPrintBtn?.addEventListener('click', () => {
    openPrint('Лист вахтенных записей подготовлен отдельно.', {
      title: 'Лист вахтенных записей',
      formatLabel: 'watch entries sheet',
      pageSize: 'A4 landscape',
      bodyClass: 'is-landscape',
      bodyHtml: buildEntriesPrintBody()
    });
  });

  pdfBtn?.addEventListener('click', () => {
    openPrint('Для PDF выберите сохранение в PDF в окне печати.', {
      title: 'Вахтенный журнал',
      formatLabel: 'watch schedule / signatures / rest control',
      pageSize: 'A4 portrait',
      bodyClass: 'is-portrait',
      bodyHtml: buildWatchPrintBody()
    });
  });

  shareBtn?.addEventListener('click', async () => {
    saveDraft('');
    const text = buildShareText();

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Вахтенный журнал', text });
        setStatus('Данные переданы в системное меню.');
        return;
      }
    } catch (error) {}

    const ok = await copyText(text);
    setStatus(ok ? 'Текст вахтенного журнала скопирован.' : 'Не удалось скопировать текст.');
  });

	  Object.values(entry).forEach((node) => {
	    node?.addEventListener('input', () => {
	      if (node === entry.position) lastGps = null;
	      scheduleSave();
	    });
	  });

	  Object.values(fields).forEach((node) => {
	    node?.addEventListener('input', scheduleSave);
	    node?.addEventListener('change', scheduleSave);
	  });

	  setInterval(() => {
	    checkWatchReminder();
	    maybeCreateHourlyGpsEntry();
	  }, 60000);

	  window.addEventListener('pagehide', () => writeState());
	  document.addEventListener('visibilitychange', () => {
	    if (document.visibilityState === 'hidden') writeState();
	  });

	  restoreState();
	  checkWatchReminder();
	});
