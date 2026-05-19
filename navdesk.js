(function initNavDesk() {
  const runCalc = document.getElementById('calcRun');
  const resetCalc = document.getElementById('calcReset');
  const copyCalc = document.getElementById('calcCopy');
  const statusEl = document.getElementById('calcStatus');
  const summaryEl = document.getElementById('calcSummary');

  const speedEl = document.getElementById('calcSpeed');
  const distanceEl = document.getElementById('calcDistance');
  const daysEl = document.getElementById('calcDays');
  const hoursEl = document.getElementById('calcHours');
  const minutesEl = document.getElementById('calcMinutes');
  const fuelHourEl = document.getElementById('calcFuelHour');
  const fuelTotalEl = document.getElementById('calcFuelTotal');
  const reserveEl = document.getElementById('calcReserve');
  const fuelReserveEl = document.getElementById('calcFuelTotalReserve');

  const tidePlaceEl = document.getElementById('tidePlace');
  const tideDateEl = document.getElementById('tideDate');
  const tideDraftEl = document.getElementById('tideDraft');
  const tideUkcEl = document.getElementById('tideUkc');
  const tideDepthEl = document.getElementById('tideDepth');
  const tideStatusEl = document.getElementById('tideStatus');
  const tideFetchBtn = document.getElementById('tideFetchBtn');
  const tideWindowBtn = document.getElementById('tideWindowBtn');
  const tideNextHighEl = document.getElementById('tideNextHigh');
  const tideNextLowEl = document.getElementById('tideNextLow');
  const tideTrendEl = document.getElementById('tideTrend');
  const tideStationEl = document.getElementById('tideStation');
  const tideWindowResultEl = document.getElementById('tideWindowResult');
  const tideTableBody = document.querySelector('#tideTable tbody');

  const allFields = [speedEl, distanceEl, daysEl, hoursEl, minutesEl, fuelHourEl, fuelTotalEl, reserveEl, fuelReserveEl].filter(Boolean);
  if (!runCalc || !resetCalc || !copyCalc || !statusEl || !summaryEl) return;

  const getLang = () => document.querySelector('.lang-switch__btn.is-active')?.dataset?.lang || document.documentElement.lang || 'en';
  const dict = {
    ru: {
      idle: 'Введите любые известные значения.',
      notEnough: 'Недостаточно данных для расчёта.',
      done: 'Расчёт выполнен.',
      invalid: 'Проверьте значения.',
      copyDone: 'Итог скопирован.',
      copyEmpty: 'Сначала выполните расчёт.',
      time: 'Время', days: 'сут', hours: 'ч', minutes: 'мин', distance: 'Дистанция', fuel: 'Топливо', withReserve: 'С резервом',
      tideIdle: 'Поиск места для начала.',
      tideShown: 'Демонстрационные данные показаны. Дальше подключается API.',
      tideWindowIdle: 'Введите глубину, осадку и запас под килем.',
      tideWindowDone: 'Безопасное окно прохода: 14:20–17:05',
      rising: 'Прилив', falling: 'Отлив', high: 'Полная вода', low: 'Малая вода'
    },
    en: {
      idle: 'Enter any known values.',
      notEnough: 'Not enough data for calculation.',
      done: 'Calculation complete.',
      invalid: 'Check the values.',
      copyDone: 'Summary copied.',
      copyEmpty: 'Run a calculation first.',
      time: 'Time', days: 'd', hours: 'h', minutes: 'min', distance: 'Distance', fuel: 'Fuel', withReserve: 'With reserve',
      tideIdle: 'Search for a place to begin.',
      tideShown: 'Demo tide data shown. Replace with live API next.',
      tideWindowIdle: 'Enter charted depth, draft and under keel clearance.',
      tideWindowDone: 'Safe passage window: 14:20–17:05',
      rising: 'Rising', falling: 'Falling', high: 'High water', low: 'Low water'
    }
  };
  const t = (key) => (dict[getLang()] || dict.en)[key] || '';

  const readNum = (el) => {
    const v = String(el?.value || '').trim().replace(',', '.');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const writeNum = (el, value, digits = 1) => { if (Number.isFinite(value)) el.value = Number(value.toFixed(digits)).toString(); };
  const lockField = (el) => { el.readOnly = true; el.classList.add('is-calculated'); };
  const unlockField = (el) => { el.readOnly = false; el.classList.remove('is-calculated'); };
  const unlockAll = () => allFields.forEach(unlockField);
  const markUser = (el) => { if (String(el.value || '').trim()) el.dataset.userInput = '1'; else delete el.dataset.userInput; };
  const clearFlags = () => allFields.forEach((el) => delete el.dataset.userInput);
  const writeCalculated = (el, value, digits = 1) => { if (el.dataset.userInput) return; writeNum(el, value, digits); lockField(el); };

  const getTimeHours = () => {
    const d = readNum(daysEl) ?? 0;
    const h = readNum(hoursEl) ?? 0;
    const m = readNum(minutesEl) ?? 0;
    if (d === 0 && h === 0 && m === 0) return null;
    if (d < 0 || h < 0 || m < 0) return null;
    return d * 24 + h + m / 60;
  };

  const setTimeFieldsFromHours = (timeHours) => {
    if (!Number.isFinite(timeHours) || timeHours < 0) return;
    const totalMinutes = Math.round(timeHours * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const afterDays = totalMinutes - days * 24 * 60;
    const hours = Math.floor(afterDays / 60);
    const minutes = afterDays - hours * 60;
    if (!daysEl.dataset.userInput) { daysEl.value = String(days); lockField(daysEl); }
    if (!hoursEl.dataset.userInput) { hoursEl.value = String(hours); lockField(hoursEl); }
    if (!minutesEl.dataset.userInput) { minutesEl.value = String(minutes); lockField(minutesEl); }
  };

  const buildSummary = () => {
    const parts = [];
    parts.push(`${t('time')}: ${readNum(daysEl) ?? 0} ${t('days')} ${readNum(hoursEl) ?? 0} ${t('hours')} ${readNum(minutesEl) ?? 0} ${t('minutes')}`);
    if (readNum(distanceEl) !== null) parts.push(`${t('distance')}: ${readNum(distanceEl)} nm`);
    if (readNum(fuelTotalEl) !== null) parts.push(`${t('fuel')}: ${readNum(fuelTotalEl)} l`);
    if (readNum(fuelReserveEl) !== null) parts.push(`${t('withReserve')}: ${readNum(fuelReserveEl)} l`);
    return parts.join(' • ');
  };

  const runCalculation = () => {
    unlockAll();
    let speed = readNum(speedEl);
    let distance = readNum(distanceEl);
    let time = getTimeHours();
    let fuelHour = readNum(fuelHourEl);
    let fuelTotal = readNum(fuelTotalEl);
    let reserve = readNum(reserveEl);
    let fuelReserve = readNum(fuelReserveEl);

    const hasAny = allFields.some((el) => String(el.value || '').trim() !== '');
    if (!hasAny) { statusEl.textContent = t('idle'); summaryEl.textContent = ''; return; }
    if ([speed, distance, time, fuelHour, fuelTotal, reserve, fuelReserve].some((v) => v !== null && v < 0)) { statusEl.textContent = t('invalid'); summaryEl.textContent = ''; return; }

    let changed = false;
    let timeDerived = false;

    if (speed !== null && distance !== null && time === null && speed > 0) { time = distance / speed; changed = true; timeDerived = true; }
    if (speed !== null && time !== null && distance === null) { distance = speed * time; changed = true; }
    if (distance !== null && time !== null && speed === null && time > 0) { speed = distance / time; changed = true; }
    if (fuelHour !== null && time !== null && fuelTotal === null) { fuelTotal = fuelHour * time; changed = true; }
    if (fuelTotal !== null && time !== null && fuelHour === null && time > 0) { fuelHour = fuelTotal / time; changed = true; }
    if (fuelTotal !== null && reserve !== null && fuelReserve === null) { fuelReserve = fuelTotal * (1 + reserve / 100); changed = true; }
    if (fuelReserve !== null && reserve !== null && fuelTotal === null && (1 + reserve / 100) > 0) { fuelTotal = fuelReserve / (1 + reserve / 100); changed = true; }

    if (speed !== null && !speedEl.dataset.userInput) writeCalculated(speedEl, speed, 1);
    if (distance !== null && !distanceEl.dataset.userInput) writeCalculated(distanceEl, distance, 1);
    if (timeDerived) setTimeFieldsFromHours(time);
    if (fuelHour !== null && !fuelHourEl.dataset.userInput) writeCalculated(fuelHourEl, fuelHour, 1);
    if (fuelTotal !== null && !fuelTotalEl.dataset.userInput) writeCalculated(fuelTotalEl, fuelTotal, 1);
    if (reserve !== null && !reserveEl.dataset.userInput) writeCalculated(reserveEl, reserve, 0);
    if (fuelReserve !== null && !fuelReserveEl.dataset.userInput) writeCalculated(fuelReserveEl, fuelReserve, 1);

    statusEl.textContent = changed || (readNum(speedEl) !== null && readNum(distanceEl) !== null && getTimeHours() !== null) ? t('done') : t('notEnough');
    summaryEl.textContent = buildSummary();
  };

  const resetCalculation = () => {
    allFields.forEach((el) => { el.value = ''; unlockField(el); });
    clearFlags();
    statusEl.textContent = t('idle');
    summaryEl.textContent = '';
  };

  allFields.forEach((el) => {
    el.addEventListener('input', () => { unlockAll(); markUser(el); statusEl.textContent = t('idle'); summaryEl.textContent = ''; });
    el.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); runCalculation(); } });
  });

  runCalc.addEventListener('click', runCalculation);
  resetCalc.addEventListener('click', resetCalculation);
  copyCalc.addEventListener('click', async () => {
    const textToCopy = String(summaryEl.textContent || '').trim();
    if (!textToCopy) { statusEl.textContent = t('copyEmpty'); return; }
    try {
      await navigator.clipboard.writeText(textToCopy);
      statusEl.textContent = t('copyDone');
    } catch {
      statusEl.textContent = t('copyEmpty');
    }
  });

  const fillDemoTides = () => {
    tideStationEl.textContent = tidePlaceEl?.value?.trim() || 'Kotor';
    tideNextHighEl.textContent = '18:40 • 2.9 m';
    tideNextLowEl.textContent = '00:55 • 0.7 m';
    tideTrendEl.textContent = t('rising');
    tideStatusEl.textContent = t('tideShown');
    tideWindowResultEl.textContent = t('tideWindowIdle');
    if (tideTableBody) {
      tideTableBody.innerHTML = `
        <tr><td>06:10</td><td>${t('low')}</td><td>0.6 m</td></tr>
        <tr><td>12:30</td><td>${t('high')}</td><td>2.8 m</td></tr>
        <tr><td>18:40</td><td>${t('high')}</td><td>2.9 m</td></tr>
        <tr><td>00:55</td><td>${t('low')}</td><td>0.7 m</td></tr>
      `;
    }
  };

  tideStatusEl && (tideStatusEl.textContent = t('tideIdle'));
  tideWindowResultEl && (tideWindowResultEl.textContent = t('tideWindowIdle'));
  tideDateEl && !tideDateEl.value && (tideDateEl.value = new Date().toISOString().slice(0, 10));

  tideFetchBtn?.addEventListener('click', fillDemoTides);
  tideWindowBtn?.addEventListener('click', () => {
    const depth = readNum(tideDepthEl);
    const draft = readNum(tideDraftEl);
    const ukc = readNum(tideUkcEl);
    if (depth === null || draft === null || ukc === null) {
      tideWindowResultEl.textContent = t('tideWindowIdle');
      return;
    }
    tideWindowResultEl.textContent = t('tideWindowDone');
  });
})();
