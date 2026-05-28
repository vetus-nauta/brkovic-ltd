const APP_VERSION = '2026.05.28-captain-fin-015';
const PUBLIC_WEB_APP_URL = 'https://brkovic.ltd/captain-fin/';
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1x9m41AUYPocx7H0UezF_lZnFvzWO54zQ?usp=sharing';
const $ = (id) => document.getElementById(id);
const money = (n) => Number(n || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let reports = [];
let selectedId = null;
let saveTimer = null;
let isSaving = false;
let isHydrating = false;
let isComposing = false;
let savePromise = null;
let lastSavedSnapshot = '';
let signedEntriesApplied = false;
let selectRequestToken = 0;
let saveRequestToken = 0;

function isMobileLayout() {
  return window.matchMedia('(max-width: 920px)').matches;
}

function historyStateEquals(next) {
  const current = window.history.state || null;
  if (!current && !next) return true;
  if (!current || !next) return false;
  return JSON.stringify(current) === JSON.stringify(next);
}

function syncHistoryState(state, replace = false) {
  if (!window.history || !window.history.pushState) return;
  if (historyStateEquals(state)) return;
  if (replace) {
    history.replaceState(state, '', window.location.pathname);
    return;
  }
  history.pushState(state, '', window.location.pathname);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function api(action, options = {}) {
  const parts = String(action).split('&');
  const name = parts.shift();
  const query = parts.join('&');
  const url = `api/?action=${encodeURIComponent(name)}${query ? `&${query}` : ''}`;
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

async function downloadFile(url, fallbackName = 'captain-fin.xlsx') {
  const absoluteUrl = new URL(url, window.location.href).toString();
  const res = await fetch(absoluteUrl, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Excel не скачался: ${res.status}`);
  const blob = await res.blob();
  if (!blob.size) throw new Error('Excel сформировался пустым файлом');
  const filename = (res.headers.get('Content-Disposition') || '').match(/filename="?([^"]+)"?/i)?.[1] || fallbackName;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
}

function blankReport({ fromHistory = false } = {}) {
  clearTimeout(saveTimer);
  isHydrating = true;
  selectedId = null;
  $('reportDate').value = today();
  $('openingBalance').value = '';
  $('notes').value = '';
  $('submitted').checked = false;
  $('entries').innerHTML = '';
  signedEntriesApplied = false;
  renderAttachments([]);
  addEntry('income');
  showEditor({ fromHistory });
  isHydrating = false;
  updateAll();
  lastSavedSnapshot = currentSnapshot();
  markClean();
  renderList();
}

function escapeAttr(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function addEntry(type = 'income', entry = {}, source = 'manual') {
  const row = document.createElement('div');
  row.className = 'entry';
  row.innerHTML = `
    <select class="type">
      <option value="income">Приход</option>
      <option value="expense">Расход</option>
      <option value="upcoming">Будущий расход</option>
    </select>
    <input class="description" placeholder="Описание" value="${escapeAttr(entry.description || '')}">
    <input class="amount" type="number" step="0.01" placeholder="0.00" value="${entry.amount ?? ''}">
    <input class="entryDate" type="date" value="${entry.entry_date || ''}">
    <button class="danger remove" title="Удалить">×</button>
  `;
  row.querySelector('.type').value = entry.type || type;
  row.querySelectorAll('input,select').forEach((el) => el.addEventListener('input', (event) => handleEditorInput(event.target)));
  if (source !== 'auto') signedEntriesApplied = false;
  row.querySelector('.remove').addEventListener('click', () => {
    signedEntriesApplied = false;
    row.remove();
    handleEditorInput();
  });
  $('entries').appendChild(row);
  updateAll();
}

function collectReport() {
  const entries = [...$('entries').querySelectorAll('.entry')].map((row) => ({
    type: row.querySelector('.type').value,
    description: row.querySelector('.description').value.trim(),
    amount: Number(row.querySelector('.amount').value || 0),
    entry_date: row.querySelector('.entryDate').value
  })).filter((entry) => entry.description || entry.amount || entry.entry_date);
  return {
    id: selectedId,
    report_date: $('reportDate').value || today(),
    opening_balance: Number($('openingBalance').value || 0),
    notes: $('notes').value,
    submitted: $('submitted').checked,
    entries
  };
}

function currentSnapshot() {
  return JSON.stringify(collectReport());
}

function renderAttachments(items = []) {
  if (!$('attachmentsList')) return;
  if (!items.length) {
    $('attachmentsList').innerHTML = '<div class="empty-list">Вложений пока нет.</div>';
    return;
  }
  $('attachmentsList').innerHTML = items.map((item) => `
    <div class="attachment-item">
      <div class="attachment-meta">
        <strong>${escapeAttr(item.name)}</strong>
        <span>${Math.ceil(Number(item.size || 0) / 1024)} KB</span>
        ${item.relative_path || item.path ? `<small>${escapeAttr(item.relative_path || item.path)}</small>` : ''}
      </div>
      <div class="attachment-actions">
        <a class="attachment-btn" href="${escapeAttr(item.open_url || item.url)}" target="_blank" rel="noopener">Открыть</a>
        <a class="attachment-btn" href="${escapeAttr(item.download_url || item.url)}" target="_blank" rel="noopener">Скачать</a>
      </div>
    </div>
  `).join('');
}

function compute(report = collectReport()) {
  const income = report.entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const expense = report.entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const upcoming = report.entries.filter((e) => e.type === 'upcoming').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const current = Number(report.opening_balance || 0) + income - expense;
  return { income, expense, upcoming, current, future: current - upcoming };
}

function updateAll() {
  const c = compute();
  $('metrics').innerHTML = [
    ['Пришло', c.income],
    ['Ушло', c.expense],
    ['Остаток', c.current],
    ['Предстоящие', c.upcoming],
    ['Будущий остаток', c.future]
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${money(value)}</strong></div>`).join('');
  const title = $('notes').value.trim().split('\n').find(Boolean) || $('reportDate').value || 'Новая запись';
  $('editorTitle').textContent = title.slice(0, 48);
}

function parseSignedItems(text) {
  const parts = String(text || '').replace(/\r/g, '\n').replace(/;/g, '\n')
    .split(/\n|,(?=\s*[+-]\s*\d)/g).map((part) => part.trim()).filter(Boolean);
  const re = /^([+-])\s*((?:\d{1,3}(?:[ .]\d{3})+|\d+)(?:[,.]\d+)?)\s*(.*)$/;
  const items = [];
  for (const part of parts) {
    const match = part.match(re);
    if (!match) continue;
    const amount = Math.abs(Number(match[2].replace(/\s/g, '').replace(/(?<=\d)\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    items.push({
      type: match[1] === '+' ? 'income' : 'expense',
      amount,
      description: (match[3] || '').trim(),
      entry_date: $('reportDate').value || today()
    });
  }
  return items;
}

function isSignedLikeSavedReport(reportEntries, signedItems) {
  if (!Array.isArray(reportEntries) || !Array.isArray(signedItems)) return false;
  if (!signedItems.length || reportEntries.length !== signedItems.length) return false;
  for (let i = 0; i < signedItems.length; i += 1) {
    const row = reportEntries[i] ?? {};
    const item = signedItems[i];
    if ((row.type || '') !== item.type) return false;
    if (Math.abs((Number(row.amount || 0) - Number(item.amount || 0))) > 0.0001) return false;
    if (String(row.description || '').trim() !== String(item.description || '').trim()) return false;
    if (String(row.entry_date || '').trim() !== String(item.entry_date || '').trim()) return false;
  }
  return true;
}

function syncSignedEntries({ force = false } = {}) {
  const items = parseSignedItems($('notes').value);
  if (!items.length) {
    if (signedEntriesApplied) {
      $('entries').innerHTML = '';
      addEntry('income');
      signedEntriesApplied = false;
      updateAll();
      if (force) setStatus('Signed-строки удалены из заметок: таблица очищена.');
      return true;
    }
    if (force) setStatus('Не нашел суммы со знаком + или -.');
    return false;
  }
  $('entries').innerHTML = '';
  items.forEach((item) => addEntry(item.type, item, 'auto'));
  signedEntriesApplied = true;
  updateAll();
  if (force) setStatus(`Обновлено строк: ${items.length}.`);
  return true;
}

function importSignedInput() {
  const changed = syncSignedEntries({ force: true });
  if (changed) handleEditorInput();
}

function renderList() {
  const q = $('search').value.toLowerCase().trim();
  const list = reports.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
  if (!list.length) {
    $('reportList').innerHTML = '<div class="empty-list">Нет записей. Нажмите +, чтобы начать новый отчет.</div>';
    return;
  }
  $('reportList').innerHTML = list.map((r) => {
    const c = r.computed || {};
    const active = r.id === selectedId ? 'active' : '';
    const submitted = r.submitted ? 'submitted' : '';
    return `<div class="report-item ${active} ${submitted}" data-id="${escapeAttr(r.id)}">
      <strong>${escapeAttr(r.report_date)}${r.submitted ? ' · сдано' : ''}</strong>
      <span>${escapeAttr((r.notes || '').slice(0, 72) || 'Без заметок')}</span>
      <span>остаток ${money(c.current)} / будущий ${money(c.future)}</span>
      <button class="soft report-delete" type="button" data-delete="${escapeAttr(r.id)}">Удалить</button>
    </div>`;
  }).join('');
  document.querySelectorAll('.report-item').forEach((item) => {
    item.addEventListener('click', () => selectReport(item.dataset.id));
  });
  document.querySelectorAll('.report-delete').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.dataset.delete;
      if (id) {
        deleteReport(id).catch((error) => setStatus(error.message));
      }
    });
  });
}

async function loadReports() {
  reports = await api('reports');
  renderList();
  const current = reports.find((report) => !report.submitted) || null;
  if (current) await selectReport(current.id);
  else blankReport();
}

async function selectReport(id, { fromHistory = false } = {}) {
  clearTimeout(saveTimer);
  const token = ++selectRequestToken;
  isHydrating = true;
  const report = await api(`report&id=${encodeURIComponent(id)}`);
  if (token !== selectRequestToken) {
    isHydrating = false;
    return;
  }
  selectedId = report.id;
  $('reportDate').value = report.report_date;
  $('openingBalance').value = report.opening_balance;
  $('notes').value = report.notes || '';
  $('submitted').checked = Boolean(report.submitted);
  $('entries').innerHTML = '';
  const reportLooksAutoSigned = isSignedLikeSavedReport(report.entries, parseSignedItems($('notes').value));
  signedEntriesApplied = reportLooksAutoSigned;
  renderAttachments(report.attachments || []);
  report.entries.forEach((entry) => addEntry(entry.type, entry, 'manual'));
  if (!report.entries.length) addEntry('income', {}, 'manual');
  showEditor({ fromHistory });
  isHydrating = false;
  updateAll();
  lastSavedSnapshot = currentSnapshot();
  markClean();
  renderList();
  if (!fromHistory && isMobileLayout()) {
    syncHistoryState({ view: 'editor', id: selectedId }, history.state && history.state.view === 'editor');
  }
}

async function saveReport({ refreshEditor = false } = {}) {
  if (isSaving) return savePromise;
  isSaving = true;
  const saveToken = ++saveRequestToken;
  const saveTargetId = selectedId;
  $('saveState').textContent = 'Сохранение...';
  savePromise = (async () => {
    const payload = collectReport();
    const sentSnapshot = JSON.stringify(payload);
    const saved = await api('save', { method: 'POST', body: JSON.stringify(payload) });
    if (saveToken !== saveRequestToken) return;
    if (selectedId !== saveTargetId) {
      reports = await api('reports');
      renderList();
      return;
    }
    selectedId = saved.id;
    reports = await api('reports');
    if (saveToken !== saveRequestToken) return;
    if (refreshEditor) {
      await selectReport(saved.id, { fromHistory: true });
      setStatus('Сохранено.');
      return;
    }
    renderList();
    if (currentSnapshot() === sentSnapshot) {
      lastSavedSnapshot = sentSnapshot;
      markClean();
      setStatus('Сохранено.');
    } else {
      $('saveState').textContent = 'Есть изменения';
      scheduleAutosave();
    }
  })();
  try {
    await savePromise;
  } catch (error) {
    $('saveState').textContent = 'Ошибка';
    throw error;
  } finally {
    isSaving = false;
    savePromise = null;
  }
}

function markClean() {
  clearTimeout(saveTimer);
  lastSavedSnapshot = currentSnapshot();
  $('saveState').textContent = 'Сохранено';
}

function handleEditorInput(source = null) {
  if (isHydrating || isComposing) return;
  if (source && source.id === 'notes') {
    syncSignedEntries();
  } else if (source && source.closest('.entry')) {
    signedEntriesApplied = false;
  }
  updateAll();
  scheduleAutosave();
}

function scheduleAutosave() {
  if (!$('appShell') || $('appShell').classList.contains('hidden')) return;
  if (!$('appShell').classList.contains('mobile-editor') && window.matchMedia('(max-width: 920px)').matches) return;
  clearTimeout(saveTimer);
  $('saveState').textContent = 'Есть изменения';
  const delay = document.activeElement === $('notes') ? 2600 : 1400;
  saveTimer = setTimeout(() => saveReport().catch((error) => setStatus(error.message)), delay);
}

async function saveAndShowList() {
  if (!saveAndShowList.running) {
    saveAndShowList.running = true;
    const backButton = $('backToList');
    if (backButton) backButton.disabled = true;
    try {
      clearTimeout(saveTimer);
      if (currentSnapshot() !== lastSavedSnapshot) await saveReport();
      showList();
    } finally {
      saveAndShowList.running = false;
      if (backButton) backButton.disabled = false;
    }
    return;
  }
  clearTimeout(saveTimer);
  setStatus('Подождите, идёт переход.');
}

function showList({ fromHistory = false } = {}) {
  $('appShell').classList.add('mobile-list');
  $('appShell').classList.remove('mobile-editor');
  if (isMobileLayout() && !fromHistory) {
    syncHistoryState({ view: 'list' }, history.state && history.state.view === 'editor');
  }
}

function showEditor({ fromHistory = false } = {}) {
  $('appShell').classList.add('mobile-editor');
  $('appShell').classList.remove('mobile-list');
  if (isMobileLayout() && !fromHistory && selectedId) {
    syncHistoryState({ view: 'editor', id: selectedId }, history.state && history.state.view === 'editor');
  } else if (isMobileLayout() && !fromHistory) {
    syncHistoryState({ view: 'editor' }, history.state && history.state.view === 'editor');
  }
}

async function deleteReport(reportId = null) {
  const targetId = reportId || selectedId;
  if (!targetId) {
    setStatus('Нет выбранного отчета для удаления.');
    return;
  }
  if (!confirm('Удалить отчет в архив удаленных?')) return;
  if (!confirm('Подтвердите еще раз. Запись исчезнет из списка, но останется в архиве удаленных.')) return;
  const previousId = selectedId;
  const deletingActive = previousId === targetId;
  await api(`delete&id=${encodeURIComponent(targetId)}`, { method: 'POST', body: '{}' });
  reports = await api('reports');
  selectedId = null;
  if (deletingActive || !previousId) {
    const next = reports.find((report) => !report.submitted) || reports[0];
    if (next) {
      await selectReport(next.id, { fromHistory: true });
    } else {
      blankReport({ fromHistory: true });
    }
    setStatus('Перемещено в архив удаленных.');
    return;
  }
  const keepTarget = reports.find((report) => report.id === previousId);
  if (keepTarget) {
    await selectReport(previousId, { fromHistory: true });
    setStatus('Перемещено в архив удаленных.');
    return;
  }
  const fallback = reports.find((report) => !report.submitted) || reports[0];
  if (fallback) {
    await selectReport(fallback.id, { fromHistory: true });
  } else {
    blankReport({ fromHistory: true });
  }
  setStatus('Перемещено в архив удаленных.');
}

async function uploadAttachment() {
  if (!$('attachmentInput').files.length) return;
  if (!selectedId || currentSnapshot() !== lastSavedSnapshot) await saveReport();
  const data = new FormData();
  data.append('attachment', $('attachmentInput').files[0]);
  const res = await fetch(`api/?action=upload&id=${encodeURIComponent(selectedId)}`, {
    method: 'POST',
    credentials: 'same-origin',
    body: data
  });
  const payload = await res.json();
  if (!res.ok || payload.error) throw new Error(payload.error || `Ошибка ${res.status}`);
  $('attachmentInput').value = '';
  renderAttachments(payload.attachments || []);
  const lastSaved = payload.attachments && payload.attachments.length ? payload.attachments[payload.attachments.length - 1] : null;
  if (lastSaved && (lastSaved.relative_path || lastSaved.path)) {
    setStatus(`Вложение сохранено: ${lastSaved.relative_path || lastSaved.path}`);
    return;
  }
  setStatus('Вложение сохранено на сервере.');
}

async function openArchive() {
  const archived = await api('archived');
  if (!archived.length) return setStatus('Архив удаленных пуст.');
  const preview = archived.slice(0, 24).map((r, index) => {
    const note = (r.notes || '').slice(0, 48) || 'Без заметок';
    const current = money(r.computed?.current || 0);
    return `${index + 1}) ${r.report_date} · ${current} · ${note} · id:${r.id}`;
  }).join('\n');
  const request = prompt(`Архив удаленных: выберите № или вставьте id (Enter — просто закрыть).\n\n${preview}`);
  if (!request) return;
  const selected = request.trim();
  if (!selected) return;
  const asNumber = Number(selected);
  const foundByNumber = Number.isFinite(asNumber) && Number.isInteger(asNumber)
    ? archived[asNumber - 1]
    : null;
  const found = (foundByNumber && archived.includes(foundByNumber)) ? foundByNumber : archived.find((record) => record.id === selected);
  if (!found) {
    setStatus('Не нашел запись в архиве по этому номеру/id.');
    return;
  }
  if (!confirm(`Восстановить карточку ${found.report_date} (${found.id}) обратно в рабочие отчеты?`)) return;
  await api(`restore&id=${encodeURIComponent(found.id)}`, { method: 'POST', body: '{}' });
  await loadReports();
  setStatus('Карточка восстановлена из архива.');
}

async function showStorageInfo() {
  const info = await api('storage-info');
  alert(`Пути хранения на сервере:\n\nЗаписи: ${info.reports}\nУдаленные: ${info.deleted_archive}\nВложения: ${info.attachments}\nExcel: ${info.exports}\n\nКорень: ${info.server_root}\nGoogle Drive: ${info.drive_url}`);
}

async function runSummary() {
  const from = $('summaryFrom').value;
  const to = $('summaryTo').value;
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const summary = await api(`summary${params.toString() ? '&' + params.toString() : ''}`);
  const t = summary.totals;
  $('summaryResult').innerHTML = `
    <strong>${t.count} сданных отчетов</strong><br>
    Было: ${money(t.opening)}<br>
    Приход: ${money(t.income)}<br>
    Расход: ${money(t.expense)}<br>
    Стало: ${money(t.current)}<br>
    Будет: ${money(t.future)}
  `;
}

async function exportExcel() {
  clearTimeout(saveTimer);
  if (!selectedId || currentSnapshot() !== lastSavedSnapshot) await saveReport();
  const result = await api('export', { method: 'POST', body: JSON.stringify({ id: selectedId }) });
  if (result.url) await downloadFile(result.url, `captain-fin-${$('reportDate').value || today()}.xlsx`);
  if (result.path) setStatus(`Excel сформирован: ${result.path}`);
  else setStatus('Excel сформирован и отправлен на скачивание.');
}

function openShareSheet() {
  $('shareUrlText').textContent = PUBLIC_WEB_APP_URL;
  $('shareSheet').classList.remove('hidden');
  $('shareSheet').setAttribute('aria-hidden', 'false');
}

function closeShareSheet() {
  $('shareSheet').classList.add('hidden');
  $('shareSheet').setAttribute('aria-hidden', 'true');
}

async function copyPublicLink() {
  await navigator.clipboard.writeText(PUBLIC_WEB_APP_URL);
  closeShareSheet();
  setStatus('Реальная ссылка на web app скопирована.');
}

function openShareTarget(target) {
  const encodedUrl = encodeURIComponent(PUBLIC_WEB_APP_URL);
  const encodedText = encodeURIComponent('Captain Fin');
  const targets = {
    mail: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    drive: DRIVE_FOLDER_URL
  };
  window.open(targets[target], '_blank', 'noopener,noreferrer');
}

function setStatus(text) {
  $('status').textContent = text;
  $('loginStatus').textContent = text;
  setTimeout(() => {
    if ($('status').textContent === text) $('status').textContent = '';
    if ($('loginStatus').textContent === text) $('loginStatus').textContent = '';
  }, 6500);
}

async function checkAuth() {
  $('versionBadge').textContent = APP_VERSION;
  const me = await api('me');
  if (me.authenticated) {
    $('guestScreen').classList.add('hidden');
    $('appShell').classList.remove('hidden');
    if (isMobileLayout()) syncHistoryState({ view: 'list' }, true);
    await loadReports();
  } else {
    $('guestScreen').classList.remove('hidden');
    $('appShell').classList.add('hidden');
  }
}

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('login', {
      method: 'POST',
      body: JSON.stringify({ email: $('loginEmail').value.trim(), password: $('loginPassword').value })
    });
    await checkAuth();
  } catch (error) {
    setStatus(error.message);
  }
});

document.addEventListener('input', (event) => {
  if (['reportDate', 'openingBalance', 'notes', 'submitted'].includes(event.target.id)) handleEditorInput(event.target);
});
document.addEventListener('compositionstart', () => { isComposing = true; });
document.addEventListener('compositionend', () => {
  isComposing = false;
  handleEditorInput(document.activeElement);
});
document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
  addEntry(button.dataset.add);
  handleEditorInput();
}));
$('newReport').addEventListener('click', blankReport);
$('saveReport').addEventListener('click', () => saveReport().catch((error) => setStatus(error.message)));
$('backToList').addEventListener('click', () => saveAndShowList().catch((error) => setStatus(error.message)));
$('deleteReport').addEventListener('click', () => deleteReport().catch((error) => setStatus(error.message)));
$('exportExcel').addEventListener('click', () => exportExcel().catch((error) => setStatus(error.message)));
$('attachmentInput').addEventListener('change', () => uploadAttachment().catch((error) => setStatus(error.message)));
$('importSigned').addEventListener('click', importSignedInput);
$('shareWebApp').addEventListener('click', openShareSheet);
$('syncLocal').addEventListener('click', () => copyPublicLink().catch((error) => setStatus(error.message)));
$('archiveOpen').addEventListener('click', () => openArchive().catch((error) => setStatus(error.message)));
$('storageInfo').addEventListener('click', () => showStorageInfo().catch((error) => setStatus(error.message)));
$('summaryOpen').addEventListener('click', () => $('summaryBox').classList.toggle('hidden'));
$('summaryRun').addEventListener('click', () => runSummary().catch((error) => setStatus(error.message)));
$('closeShare').addEventListener('click', closeShareSheet);
$('closeShareBackdrop').addEventListener('click', closeShareSheet);
$('copyPublicLink').addEventListener('click', () => copyPublicLink().catch((error) => setStatus(error.message)));
$('shareMail').addEventListener('click', () => openShareTarget('mail'));
$('shareWhatsApp').addEventListener('click', () => openShareTarget('whatsapp'));
$('shareTelegram').addEventListener('click', () => openShareTarget('telegram'));
$('shareDrive').addEventListener('click', () => openShareTarget('drive'));
$('search').addEventListener('input', renderList);
window.addEventListener('popstate', (event) => {
  const state = event.state || {};
  if (!state.view) return;
  if (state.view === 'list') {
    showList({ fromHistory: true });
    return;
  }
  if (state.view === 'editor') {
    if (state.id) {
      selectReport(state.id, { fromHistory: true }).catch((error) => setStatus(error.message));
      return;
    }
    blankReport({ fromHistory: true });
  }
});

checkAuth().catch((error) => setStatus(error.message));
