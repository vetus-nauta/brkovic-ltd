const APP_VERSION = '2026.06.01-captain-fin-019';
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
let finDeskState = null;
let finDeskMode = 'owner';
let finDeskGroupId = null;
let finDeskOpenPayouts = new Set();
let finDeskIssueDraft = null;
let finDeskActiveCard = null;

function isMobileLayout() {
  return window.matchMedia('(max-width: 920px)').matches;
}

function updateViewportGeometry() {
  const viewport = window.visualViewport;
  const height = viewport ? viewport.height : window.innerHeight;
  const roundedHeight = Math.max(320, Math.round(height || window.innerHeight || 640));
  document.documentElement.style.setProperty('--app-height', `${roundedHeight}px`);
  document.body.classList.toggle('keyboard-open', isMobileLayout() && window.innerHeight - roundedHeight > 120);
}

function keepFocusedFieldVisible(event) {
  const target = event.target;
  if (!isMobileLayout() || !target.matches('input, textarea, select')) return;
  const scrollTarget = target.closest('.entry') || target;
  const align = target.id === 'notes' ? 'start' : 'center';
  const scroll = (smooth = false) => {
    try {
      scrollTarget.scrollIntoView({ block: align, inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    } catch (_error) {
      scrollTarget.scrollIntoView(align === 'start');
    }
  };
  setTimeout(() => scroll(true), 90);
  setTimeout(() => scroll(false), 330);
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

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function pickPath(source, path) {
  if (!source || typeof source !== 'object') return undefined;
  return String(path).split('.').reduce((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return value[key];
  }, source);
}

function pick(source, paths, fallback = undefined) {
  for (const path of paths) {
    const value = pickPath(source, path);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function asCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const values = Object.values(value);
  return values.every((item) => item && typeof item === 'object') ? values : [];
}

function toFlag(value) {
  if (value === true) return true;
  if (value === false || value === undefined || value === null) return false;
  if (typeof value === 'number') return value > 0;
  const text = String(value).toLowerCase().trim();
  return ['1', 'true', 'yes', 'y', 'done', 'signed', 'confirmed', 'submitted', 'approved'].includes(text);
}

function parseAmount(value) {
  if (typeof value === 'number') return value;
  const normalized = String(value ?? '').replace(/[^\d,.-]/g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function formatCurrency(value, currency = 'EUR') {
  const amount = parseAmount(value);
  if (amount === null) return escapeAttr(firstValue(value, 'Выдача'));
  return `${money(amount)} ${escapeAttr(currency || 'EUR')}`;
}

function formatV2Date(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('ru-RU');
  return String(value).slice(0, 16);
}

function normalizePayout(raw = {}, index = 0) {
  const statusText = String(pick(raw, ['status', 'state', 'signature_status', 'signatureStatus'], '')).toLowerCase();
  const signedFlag = firstValue(
    pick(raw, ['confirmed', 'is_confirmed', 'isConfirmed', 'signed', 'is_signed', 'isSigned', 'signature_confirmed', 'signatureConfirmed']),
    statusText
  );
  const confirmed = toFlag(signedFlag) || /confirmed|signed|approved|done/.test(statusText);
  const id = String(firstValue(
    pick(raw, ['id', 'payout_id', 'payoutId', 'payment_id', 'paymentId']),
    `payout-${index}`
  ));
  const date = firstValue(pick(raw, ['date', 'created_at', 'createdAt', 'issued_at', 'issuedAt', 'paid_at', 'paidAt', 'updated_at', 'updatedAt']), '');
  return {
    id,
    index,
    amount: firstValue(pick(raw, ['amount', 'value', 'sum', 'total']), ''),
    currency: firstValue(pick(raw, ['currency', 'ccy']), 'EUR'),
    date,
    timestamp: Date.parse(date) || 0,
    note: firstValue(pick(raw, ['note', 'description', 'title', 'reason', 'comment']), ''),
    status: confirmed ? 'confirmed' : 'pending',
    raw
  };
}

function normalizePayouts(rawPerson = {}, groupPayouts = [], personId = '') {
  const ownPayouts = asCollection(firstValue(
    pick(rawPerson, ['payouts', 'payments', 'distributions', 'issuances', 'withdrawals', 'issue_statuses', 'issueStatuses']),
    []
  ));
  const linkedPayouts = groupPayouts.filter((payout) => {
    const linkedId = String(firstValue(pick(payout, ['participant_id', 'participantId', 'member_id', 'memberId', 'user_id', 'userId', 'person_id', 'personId']), ''));
    return linkedId && linkedId === String(personId);
  });
  const lastPayout = pick(rawPerson, ['last_payout', 'lastPayout', 'latest_payout', 'latestPayout']);
  const rawPayouts = [lastPayout, ...ownPayouts, ...linkedPayouts].filter(Boolean);
  const normalized = rawPayouts.map((item, index) => normalizePayout(item, index));
  const unique = [];
  const seen = new Set();
  normalized.forEach((payout) => {
    const key = payout.id || `${payout.amount}-${payout.date}-${payout.note}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(payout);
  });
  if (unique.some((payout) => payout.timestamp)) {
    unique.sort((a, b) => b.timestamp - a.timestamp || a.index - b.index);
  }
  return unique;
}

function liveReportSubmitted(rawPerson = {}) {
  const report = firstValue(
    pick(rawPerson, ['live_report', 'liveReport', 'current_report', 'currentReport', 'report']),
    {}
  );
  const reportStatus = String(pick(report, ['status', 'state'], '')).toLowerCase();
  const personStatus = String(pick(rawPerson, ['live_report_status', 'liveReportStatus'], '')).toLowerCase();
  return toFlag(firstValue(
    pick(report, ['submitted', 'is_submitted', 'isSubmitted', 'signed', 'confirmed']),
    pick(rawPerson, ['live_report_submitted', 'liveReportSubmitted', 'submitted_live_report', 'submittedLiveReport'])
  )) || /submitted|signed|confirmed|done/.test(`${reportStatus} ${personStatus}`);
}

function normalizePerson(raw = {}, fallbackRole = 'participant', index = 0, groupPayouts = []) {
  const id = String(firstValue(
    pick(raw, ['id', 'user_id', 'userId', 'participant_id', 'participantId', 'member_id', 'memberId', 'email']),
    `${fallbackRole}-${index}`
  ));
  const role = String(firstValue(pick(raw, ['role', 'type']), fallbackRole));
  const name = String(firstValue(
    pick(raw, ['name', 'display_name', 'displayName', 'full_name', 'fullName', 'title', 'label', 'email']),
    fallbackRole === 'admin' ? 'Администратор' : `Участник ${index + 1}`
  ));
  const email = firstValue(pick(raw, ['email', 'mail']), '');
  const roleMeta = role === 'owner' || role === 'admin' ? 'администратор' : 'участник';
  const meta = firstValue(pick(raw, ['subtitle', 'caption', 'phone', 'note']), email, roleMeta);
  return {
    id,
    role,
    name,
    meta,
    balance: firstValue(pick(raw, ['balance', 'computed', 'summary']), {}),
    liveSubmitted: liveReportSubmitted(raw),
    payouts: normalizePayouts(raw, groupPayouts, id),
    raw
  };
}

function normalizeGroup(raw = {}, index = 0, root = {}) {
  const id = String(firstValue(
    pick(raw, ['id', 'group_id', 'groupId', 'slug', 'key']),
    `group-${index}`
  ));
  const name = String(firstValue(
    pick(raw, ['name', 'title', 'label']),
    `Группа ${index + 1}`
  ));
  const groupPayouts = asCollection(firstValue(
    pick(raw, ['payouts', 'payments', 'distributions', 'issuances']),
    []
  ));
  const adminRaw = firstValue(
    pick(raw, ['admin', 'administrator', 'owner', 'captain', 'manager']),
    pick(root, ['admin', 'owner', 'captain']),
    {}
  );
  const participantsRaw = asCollection(firstValue(
    pick(raw, ['participants', 'members', 'users', 'participant_cards', 'participantCards', 'participants_cards', 'participantsCards']),
    []
  ));
  const admin = normalizePerson(adminRaw, 'admin', 0, groupPayouts);
  const participants = participantsRaw
    .map((person, personIndex) => normalizePerson(person, 'participant', personIndex, groupPayouts))
    .filter((person) => person.id !== admin.id || person.role !== 'admin');
  const currency = firstValue(pick(raw, ['currency', 'ccy']), pick(root, ['currency', 'ccy']), 'EUR');
  return { id, name, admin, participants, currency, raw };
}

function normalizeV2State(raw = {}) {
  const root = firstValue(raw.state, raw.data, raw.payload, raw);
  if (!root || typeof root !== 'object') return { groups: [], activeGroupId: '', viewer: {}, raw };
  let groupsRaw = asCollection(firstValue(
    pick(root, ['groups', 'active_groups', 'activeGroups', 'available_groups', 'availableGroups']),
    []
  ));
  const activeGroup = firstValue(
    pick(root, ['active_group', 'activeGroup', 'current_group', 'currentGroup', 'group']),
    null
  );
  if (activeGroup && typeof activeGroup === 'object') groupsRaw = [activeGroup, ...groupsRaw];
  if (!groupsRaw.length && (
    pick(root, ['participants', 'members', 'users']) ||
    pick(root, ['admin', 'owner', 'captain'])
  )) {
    groupsRaw = [root];
  }
  const groups = groupsRaw.map((group, index) => normalizeGroup(group, index, root));
  const uniqueGroups = [];
  const seen = new Set();
  groups.forEach((group) => {
    if (seen.has(group.id)) return;
    seen.add(group.id);
    uniqueGroups.push(group);
  });
  const activeGroupId = String(firstValue(
    pick(root, ['active_group_id', 'activeGroupId', 'current_group_id', 'currentGroupId', 'group_id', 'groupId']),
    pick(root, ['selected_group_id', 'selectedGroupId']),
    uniqueGroups[0]?.id || ''
  ));
  return {
    groups: uniqueGroups,
    activeGroupId,
    viewer: firstValue(pick(root, ['viewer', 'me', 'user']), {}),
    raw
  };
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

function activeFinDeskGroup() {
  if (!finDeskState || !finDeskState.groups.length) return null;
  return finDeskState.groups.find((group) => group.id === finDeskGroupId)
    || finDeskState.groups.find((group) => group.id === finDeskState.activeGroupId)
    || finDeskState.groups[0];
}

function currentFinDeskSessionId(group = activeFinDeskGroup()) {
  return firstValue(
    pick(group?.raw || {}, ['session_id', 'sessionId', 'selected_session_id', 'selectedSessionId']),
    pick(finDeskState?.raw || {}, ['selected_session_id', 'selectedSessionId'])
  );
}

function findFinDeskParticipant(participantId) {
  const group = activeFinDeskGroup();
  return (group?.participants || []).find((person) => person.id === participantId) || null;
}

function newClientOperationId() {
  const randomPart = window.crypto?.getRandomValues
    ? Array.from(window.crypto.getRandomValues(new Uint32Array(2))).map((value) => value.toString(16)).join('')
    : Math.random().toString(16).slice(2);
  return `issue-${Date.now()}-${randomPart}`;
}

function balanceCurrent(person = {}) {
  return firstValue(pick(person.balance || {}, ['current', 'current_amount']), 0);
}

function balanceCurrency(person = {}, fallback = 'EUR') {
  return firstValue(pick(person.balance || {}, ['currency', 'ccy']), fallback);
}

function formatPersonBalance(person = {}, fallbackCurrency = 'EUR') {
  return formatCurrency(balanceCurrent(person), balanceCurrency(person, fallbackCurrency));
}

function groupParticipantsBalance(group = {}) {
  return (group.participants || []).reduce((sum, person) => {
    const current = parseAmount(balanceCurrent(person));
    return sum + (current === null ? 0 : current);
  }, 0);
}

function renderFinDeskCardMarkers(person = {}) {
  const markers = [];
  const latest = (person.payouts || [])[0] || null;
  if (person.liveSubmitted) markers.push('<span class="fd-card-dot orange" title="Отчет сдан"></span>');
  if (latest?.status === 'pending') markers.push('<span class="fd-card-dot red" title="Ожидает подпись"></span>');
  if (latest?.status === 'confirmed') markers.push('<span class="fd-card-dot green" title="Подписано"></span>');
  return markers.length ? `<span class="fd-card-dots">${markers.join('')}</span>` : '';
}

function renderLiveMarker(person) {
  return person.liveSubmitted ? '<span class="fd-live-marker">Отчет сдан</span>' : '';
}

function renderBalanceLine(person) {
  const balance = person.balance || {};
  const current = firstValue(pick(balance, ['current', 'current_amount']), null);
  const pendingIn = firstValue(pick(balance, ['pending_in', 'pendingIn']), null);
  const pendingOut = firstValue(pick(balance, ['pending_out', 'pendingOut']), null);
  const parts = [];
  if (current !== null) parts.push(`на руках ${formatCurrency(current, firstValue(balance.currency, 'EUR'))}`);
  if (pendingIn !== null && Number(pendingIn || 0) > 0) parts.push(`ждет подписи +${formatCurrency(pendingIn, firstValue(balance.currency, 'EUR'))}`);
  if (pendingOut !== null && Number(pendingOut || 0) > 0) parts.push(`выдано к подписи ${formatCurrency(pendingOut, firstValue(balance.currency, 'EUR'))}`);
  return parts.length ? `<div class="fd-balance-line">${parts.map(escapeAttr).join(' · ')}</div>` : '';
}

function renderPayoutHistory(payouts = []) {
  return payouts.slice(0, 5).map((payout) => `
    <div class="fd-history-row">
      <strong>${formatCurrency(payout.amount, payout.currency)}</strong>
      <span>${escapeAttr(formatV2Date(payout.date) || payout.note || payout.status)}</span>
    </div>
  `).join('');
}

function renderPayoutBlock(person) {
  const payouts = person.payouts || [];
  if (!payouts.length) {
    return '<div class="fd-payout fd-payout-empty">Выдач нет</div>';
  }
  const latest = payouts[0];
  const statusClass = latest.status === 'confirmed' ? 'confirmed' : 'pending';
  const statusLabel = statusClass === 'confirmed' ? 'подписано' : 'ждет подписи';
  const isOpen = finDeskOpenPayouts.has(person.id);
  const canExpand = payouts.length > 1;
  const canSign = finDeskMode === 'participant' && !['owner', 'admin'].includes(String(person.role));
  let action = '<button class="fd-payout-action confirmed" type="button" disabled>Подписано</button>';
  if (statusClass !== 'confirmed') {
    action = canSign
      ? `<button class="fd-payout-action pending" type="button" data-fd-payout-action="${escapeAttr(latest.id)}">Подписать получение</button>`
      : '<span class="fd-payout-wait">Ожидает подпись участника</span>';
  }
  const toggle = canExpand
    ? `<button class="fd-payout-toggle" type="button" data-fd-payout-toggle="${escapeAttr(person.id)}" aria-expanded="${isOpen ? 'true' : 'false'}" title="Последние 5">${isOpen ? '⌃' : '⌄'}</button>`
    : '';
  return `
    <div class="fd-payout">
      <div class="fd-payout-current">
        <div class="fd-payout-line">
          <span class="fd-payout-amount">${formatCurrency(latest.amount, latest.currency)}</span>
          <span class="fd-payout-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="fd-payout-line">
          <span class="fd-payout-note">${escapeAttr(latest.note || 'Последняя выдача')}</span>
          <span class="fd-payout-date">${escapeAttr(formatV2Date(latest.date))}</span>
        </div>
        <div class="fd-payout-actions">
          ${action}
          ${toggle}
        </div>
      </div>
      ${isOpen && canExpand ? `<div class="fd-payout-history">${renderPayoutHistory(payouts)}</div>` : ''}
    </div>
  `;
}

function renderFinDeskCard(person, type, group) {
  const label = type === 'admin' ? 'Администратор' : person.name;
  return `
    <button class="fd-person-button ${type === 'admin' ? 'admin' : 'participant'}" type="button" data-fd-open-card="${type}" data-fd-open-person="${escapeAttr(person.id)}">
      <span class="fd-card-name">${escapeAttr(label)}</span>
      <span class="fd-card-balance">Остаток ${formatPersonBalance(person, group.currency)}</span>
      ${renderFinDeskCardMarkers(person)}
    </button>
  `;
}

function renderFinDeskBoard(group) {
  const cards = [];
  if (finDeskMode === 'owner') cards.push(renderFinDeskCard(group.admin, 'admin', group));
  (group.participants || []).forEach((person) => cards.push(renderFinDeskCard(person, 'participant', group)));
  return cards.length ? cards.join('') : '<div class="empty-list">В этой активной группе пока нет доступных участников.</div>';
}

function reportFromPerson(person = {}) {
  return firstValue(pick(person.raw || {}, ['report', 'live_report', 'liveReport', 'current_report', 'currentReport']), {});
}

function renderLiveReportPanel(person = {}, title = 'Отчет из быстрых записей') {
  const report = reportFromPerson(person);
  const entries = asCollection(report.entries);
  const computed = report.computed || {};
  const hasReport = entries.length || person.liveSubmitted || report.notes;
  if (!hasReport) {
    return `
      <section class="fd-work-panel">
        <h3>${escapeAttr(title)}</h3>
        <div class="fd-work-empty">Отчет еще не сдан.</div>
      </section>
    `;
  }
  return `
    <section class="fd-work-panel">
      <h3>${escapeAttr(title)}</h3>
      <div class="fd-report-state ${person.liveSubmitted ? 'submitted' : ''}">${person.liveSubmitted ? 'Сдан' : 'В работе'}</div>
      <div class="fd-report-metrics">
        <span>Приход ${formatCurrency(computed.income ?? 0, balanceCurrency(person))}</span>
        <span>Расход ${formatCurrency(computed.expense ?? 0, balanceCurrency(person))}</span>
        <strong>Остаток ${formatCurrency(computed.current ?? balanceCurrent(person), balanceCurrency(person))}</strong>
      </div>
      ${report.notes ? `<p class="fd-report-note">${escapeAttr(String(report.notes).slice(0, 180))}</p>` : ''}
    </section>
  `;
}

function renderAdminChildrenPanel(group) {
  const submitted = (group.participants || []).filter((person) => person.liveSubmitted);
  if (!submitted.length) {
    return `
      <section class="fd-work-panel">
        <h3>Отчеты сотрудников</h3>
        <div class="fd-work-empty">Сданных отчетов пока нет.</div>
      </section>
    `;
  }
  return `
    <section class="fd-work-panel">
      <h3>Отчеты сотрудников</h3>
      <div class="fd-child-list">
        ${submitted.map((person) => `
          <button class="fd-child-report" type="button" data-fd-open-card="participant" data-fd-open-person="${escapeAttr(person.id)}">
            <span>${escapeAttr(person.name)}</span>
            <strong>${formatPersonBalance(person, group.currency)}</strong>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function activeFinDeskPerson(group) {
  if (!finDeskActiveCard) return null;
  if (finDeskActiveCard.type === 'admin') return group.admin;
  return (group.participants || []).find((person) => person.id === finDeskActiveCard.id) || null;
}

function renderFinDeskCardView(group) {
  const person = activeFinDeskPerson(group);
  if (!person) return '';
  const isAdmin = finDeskActiveCard.type === 'admin';
  const title = isAdmin ? 'Администратор' : person.name;
  const issueAction = !isAdmin && finDeskMode === 'owner'
    ? `<button type="button" data-fd-issue="${escapeAttr(person.id)}">Выдать деньги</button>`
    : '';
  const finalizeAction = isAdmin && finDeskMode === 'owner'
    ? '<button type="button" id="fdFinalizeSession">Создать и утвердить общий отчет</button>'
    : '';
  const payoutPanel = !isAdmin
    ? `<section class="fd-work-panel"><h3>Выдачи</h3>${renderPayoutBlock(person)}</section>`
    : '';
  const childrenPanel = isAdmin && finDeskMode === 'owner' ? renderAdminChildrenPanel(group) : '';
  return `
    <div class="fd-workspace">
      <header class="fd-work-head">
        <button class="soft" type="button" id="fdBackToBoard">Назад</button>
        <div>
          <strong>${escapeAttr(title)}</strong>
          <span>${formatPersonBalance(person, group.currency)}</span>
        </div>
        ${renderFinDeskCardMarkers(person)}
      </header>
      <div class="fd-work-actions">
        ${issueAction}
        ${finalizeAction}
      </div>
      <div class="fd-work-grid">
        ${renderLiveReportPanel(person, isAdmin ? 'Мой отчет' : 'Отчет сотрудника')}
        ${payoutPanel}
        ${childrenPanel}
      </div>
    </div>
  `;
}

async function confirmFinDeskPayout(issueId) {
  const result = await api('v2_confirm_issue', {
    method: 'POST',
    body: JSON.stringify({ issue_id: issueId })
  });
  finDeskState = normalizeV2State(result.state || result);
  renderFinDesk();
  setFinDeskStatus('Выдача подписана.');
}

async function issueFinDeskMoney(participantId) {
  const sessionId = currentFinDeskSessionId();
  if (!sessionId) {
    setFinDeskStatus('Активная сессия не найдена.');
    return;
  }
  const participant = findFinDeskParticipant(participantId);
  finDeskIssueDraft = {
    sessionId,
    participantId,
    clientOperationId: newClientOperationId()
  };
  $('fdIssueParticipantName').textContent = participant?.name || 'Участник';
  $('fdIssueAmount').value = '';
  $('fdIssueDescription').value = '';
  $('fdIssueSubmit').disabled = false;
  $('fdIssueSheet').classList.remove('hidden');
  $('fdIssueSheet').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('fdIssueAmount').focus(), 60);
}

function closeFinDeskIssueDialog() {
  finDeskIssueDraft = null;
  $('fdIssueSheet').classList.add('hidden');
  $('fdIssueSheet').setAttribute('aria-hidden', 'true');
  $('fdIssueSubmit').disabled = false;
}

async function submitFinDeskIssueDialog() {
  if (!finDeskIssueDraft) return;
  const amount = $('fdIssueAmount').value.trim();
  if (!amount) {
    $('fdIssueAmount').focus();
    setFinDeskStatus('Введите сумму выдачи.');
    return;
  }
  $('fdIssueSubmit').disabled = true;
  const description = $('fdIssueDescription').value.trim();
  let result;
  try {
    result = await api('v2_issue_money', {
      method: 'POST',
      body: JSON.stringify({
        session_id: finDeskIssueDraft.sessionId,
        participant_id: finDeskIssueDraft.participantId,
        amount,
        description,
        client_operation_id: finDeskIssueDraft.clientOperationId
      })
    });
  } catch (error) {
    $('fdIssueSubmit').disabled = false;
    throw error;
  }
  finDeskState = normalizeV2State(result.state || result);
  closeFinDeskIssueDialog();
  renderFinDesk();
  setFinDeskStatus('Выдача создана. Участник должен подписать.');
}

async function finalizeFinDeskSession() {
  const sessionId = currentFinDeskSessionId();
  if (!sessionId) return setFinDeskStatus('Активная сессия не найдена.');
  if (!confirm('Создать общий отчет и закрыть активную сессию?')) return;
  const result = await api('v2_finalize_session', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId })
  });
  finDeskState = normalizeV2State(result.state || result);
  renderFinDesk();
  setFinDeskStatus('Общий отчет создан, сессия закрыта.');
}

function bindFinDeskCards() {
  document.querySelectorAll('[data-fd-open-card]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      finDeskActiveCard = {
        type: button.dataset.fdOpenCard || 'participant',
        id: button.dataset.fdOpenPerson || ''
      };
      renderFinDesk();
    });
  });
  const backButton = $('fdBackToBoard');
  if (backButton) backButton.addEventListener('click', () => {
    finDeskActiveCard = null;
    renderFinDesk();
  });
  document.querySelectorAll('[data-fd-payout-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const personId = button.dataset.fdPayoutToggle;
      if (finDeskOpenPayouts.has(personId)) finDeskOpenPayouts.delete(personId);
      else finDeskOpenPayouts.add(personId);
      renderFinDesk();
    });
  });
  document.querySelectorAll('[data-fd-payout-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (finDeskMode !== 'participant') {
        setFinDeskStatus('Ждет подписи участника.');
        return;
      }
      confirmFinDeskPayout(button.dataset.fdPayoutAction).catch((error) => setFinDeskStatus(error.message));
    });
  });
  document.querySelectorAll('[data-fd-issue]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      issueFinDeskMoney(button.dataset.fdIssue).catch((error) => setFinDeskStatus(error.message));
    });
  });
  const finalizeButton = $('fdFinalizeSession');
  if (finalizeButton) finalizeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    finalizeFinDeskSession().catch((error) => setFinDeskStatus(error.message));
  });
}

function renderFinDesk() {
  if (!$('finDeskScreen')) return;
  const group = activeFinDeskGroup();
  const groups = finDeskState?.groups || [];
  $('fdGroupSelect').innerHTML = groups.length
    ? groups.map((item) => `<option value="${escapeAttr(item.id)}">${escapeAttr(item.name)}</option>`).join('')
    : '<option value="">Нет активной группы</option>';
  $('fdGroupSelect').disabled = groups.length < 2;
  if (group) {
    finDeskGroupId = group.id;
    $('fdGroupSelect').value = group.id;
    $('finDeskTitle').textContent = group.name;
    $('fdGroupMeta').textContent = `Админ ${formatPersonBalance(group.admin, group.currency)} · сотрудники ${formatCurrency(groupParticipantsBalance(group), group.currency)}`;
    if (finDeskActiveCard && !activeFinDeskPerson(group)) finDeskActiveCard = null;
    $('finDeskScreen').classList.toggle('card-open', Boolean(finDeskActiveCard));
    $('fdCardBoard').innerHTML = renderFinDeskBoard(group);
    $('fdCardView').innerHTML = finDeskActiveCard ? renderFinDeskCardView(group) : '';
    $('fdCardView').classList.toggle('hidden', !finDeskActiveCard);
  } else {
    $('finDeskTitle').textContent = 'Активная группа';
    $('fdGroupMeta').textContent = 'Данные группы не найдены';
    finDeskActiveCard = null;
    $('finDeskScreen').classList.remove('card-open');
    $('fdCardBoard').innerHTML = '<div class="empty-list">Активная группа не найдена.</div>';
    $('fdCardView').innerHTML = '';
    $('fdCardView').classList.add('hidden');
  }
  if ($('fdDetails')) $('fdDetails').classList.toggle('hidden', finDeskMode !== 'owner' || Boolean(finDeskActiveCard));
  document.querySelectorAll('[data-fd-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.fdMode === finDeskMode);
  });
  bindFinDeskCards();
}

function showFinDesk() {
  $('finDeskScreen').classList.remove('hidden');
  $('appShell').classList.add('findesk-active');
}

function showLegacyScreen() {
  $('appShell').classList.remove('findesk-active');
  $('finDeskScreen').classList.add('hidden');
}

async function loadFinDeskState() {
  const data = await api('v2_state');
  finDeskState = normalizeV2State(data);
  const viewerMode = String(firstValue(pick(finDeskState.viewer, ['mode', 'role']), '')).toLowerCase();
  const savedMode = window.localStorage ? window.localStorage.getItem('captain-fin-v2-mode') : '';
  if (['owner', 'participant'].includes(savedMode)) finDeskMode = savedMode;
  if (['owner', 'participant'].includes(viewerMode)) finDeskMode = viewerMode;
  const activeId = finDeskState.activeGroupId;
  if (!finDeskGroupId || !finDeskState.groups.some((group) => group.id === finDeskGroupId)) {
    finDeskGroupId = activeId || finDeskState.groups[0]?.id || '';
  }
  renderFinDesk();
  showFinDesk();
  setFinDeskStatus(finDeskState.groups.length ? '' : 'Активная группа не найдена.');
  return finDeskState;
}

async function showLegacyFallback(message = '') {
  showLegacyScreen();
  await loadReports();
  if (message) setStatus(message);
}

async function bootAuthenticatedApp() {
  try {
    await loadFinDeskState();
  } catch (error) {
    await showLegacyFallback(`Доска недоступна, открыт старый экран. ${error.message}`);
  }
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

function setFinDeskStatus(text) {
  if (!$('fdStatus')) return;
  $('fdStatus').textContent = text || '';
}

function setStatus(text) {
  $('status').textContent = text;
  $('loginStatus').textContent = text;
  if ($('fdStatus')) $('fdStatus').textContent = text;
  setTimeout(() => {
    if ($('status').textContent === text) $('status').textContent = '';
    if ($('loginStatus').textContent === text) $('loginStatus').textContent = '';
    if ($('fdStatus') && $('fdStatus').textContent === text) $('fdStatus').textContent = '';
  }, 6500);
}

async function checkAuth() {
  $('versionBadge').textContent = APP_VERSION;
  const me = await api('me');
  if (me.authenticated) {
    $('guestScreen').classList.add('hidden');
    $('appShell').classList.remove('hidden');
    if (isMobileLayout()) syncHistoryState({ view: 'list' }, true);
    await bootAuthenticatedApp();
  } else {
    $('guestScreen').classList.remove('hidden');
    $('appShell').classList.add('hidden');
    $('appShell').classList.remove('findesk-active');
    $('finDeskScreen').classList.add('hidden');
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
$('fdRefresh').addEventListener('click', () => loadFinDeskState().catch((error) => showLegacyFallback(`Доска недоступна, открыт старый экран. ${error.message}`).catch((fallbackError) => setStatus(fallbackError.message))));
$('fdIssueForm').addEventListener('submit', (event) => {
  event.preventDefault();
  submitFinDeskIssueDialog().catch((error) => setFinDeskStatus(error.message));
});
$('fdIssueCancel').addEventListener('click', closeFinDeskIssueDialog);
$('fdIssueBackdrop').addEventListener('click', closeFinDeskIssueDialog);
$('fdGroupSelect').addEventListener('change', () => {
  finDeskGroupId = $('fdGroupSelect').value;
  finDeskOpenPayouts = new Set();
  finDeskActiveCard = null;
  renderFinDesk();
});
document.querySelectorAll('[data-fd-mode]').forEach((button) => {
  button.addEventListener('click', async () => {
    finDeskMode = button.dataset.fdMode || 'owner';
    finDeskActiveCard = null;
    if (window.localStorage) window.localStorage.setItem('captain-fin-v2-mode', finDeskMode);
    renderFinDesk();
    try {
      const result = await api('v2_switch_mode', {
        method: 'POST',
        body: JSON.stringify({ mode: finDeskMode })
      });
      finDeskState = normalizeV2State(result.state || result);
      renderFinDesk();
      setFinDeskStatus(finDeskMode === 'owner' ? 'Режим владельца.' : 'Режим участника.');
    } catch (error) {
      setFinDeskStatus(`Режим сохранен локально. Сервер: ${error.message}`);
    }
  });
});
$('fdOpenLegacy').addEventListener('click', () => {
  showLegacyScreen();
  if (!reports.length && !selectedId) {
    loadReports().catch((error) => setStatus(error.message));
    return;
  }
  renderList();
  setStatus('Открыт старый экран отчетов.');
});
$('fdOpenArchive').addEventListener('click', () => openArchive().catch((error) => setStatus(error.message)));
$('fdOpenStorage').addEventListener('click', () => showStorageInfo().catch((error) => setStatus(error.message)));
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
window.addEventListener('resize', updateViewportGeometry);
window.addEventListener('orientationchange', () => setTimeout(updateViewportGeometry, 240));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateViewportGeometry);
  window.visualViewport.addEventListener('scroll', updateViewportGeometry);
}
document.addEventListener('focusin', keepFocusedFieldVisible);
document.addEventListener('focusout', () => setTimeout(updateViewportGeometry, 120));
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

updateViewportGeometry();
checkAuth().catch((error) => setStatus(error.message));
