const API_BASE = "api/?action=";
const IS_LOCAL = ["brkovic-local.local", "127.0.0.1", "localhost"].includes(window.location.hostname);
const ADMIN_API_ORIGIN = IS_LOCAL ? "https://brkovic.ltd" : "";
const ADMIN_API_BASE = IS_LOCAL ? "/admin-api-proxy.php?path=" : "/api";
const PRINT_LOGO_SRC = new URL("../brand/logo-header-inline-light.png", window.location.href).toString();
const LANGUAGE_KEY = "brkovic_language";
const THEME_KEY = "navdesk_watch_theme_v1";
const ENGAGED_KEY = "ship_cashbox_engaged_v1";
const DISMISSED_INSTALL_KEY = "ship_cashbox_install_dismissed_v1";
const BOOT_CACHE_KEY = "ship_cashbox_boot_cache_v1";
const PARTICIPANT_CACHE_PREFIX = "ship_cashbox_participant_cache_v1_";
const PARTICIPANT_DRAFT_PREFIX = "ship_cashbox_participant_draft_v1_";
const PARTICIPANT_SLOT_PREFIX = "ship_cashbox_participant_slot_v1_";
const TREASURER_DRAFT_PREFIX = "ship_cashbox_treasurer_draft_v1_";
const EDITOR_PAUSE_LOCK_MS = 5 * 60 * 1000;
const SYNC_SLOTS = [
  { hour: 0, minute: 0, label: "00:00" },
  { hour: 7, minute: 0, label: "07:00" },
  { hour: 15, minute: 0, label: "15:00" },
];
const SUPPORTED_TOOL_LANGS = ["en", "ru", "de", "it", "es", "sr", "zh"];
const MONEY_LOCALES = {
  en: "en-US",
  ru: "ru-RU",
  de: "de-DE",
  it: "it-IT",
  es: "es-ES",
  sr: "sr-Latn-RS",
  zh: "zh-CN",
};

const state = {
  lang: "ru",
  viewer: "guest",
  boot: null,
  participant: null,
  inviteToken: "",
  installPrompt: null,
  participantDraft: "",
  participantSyncTimer: null,
  treasurerDraft: "",
  treasurerAutosaveTimer: null,
  editorLocked: false,
  hiddenAt: 0,
};

const $ = (id) => document.getElementById(id);
let modalScrollY = 0;

function isModalOpen(id) {
  const modal = $(id);
  return Boolean(modal && !modal.hidden);
}

function anyModalOpen() {
  return isModalOpen("qrModal") || isModalOpen("attachmentSheet") || isModalOpen("workspaceModal") || isModalOpen("cashboxExitModal");
}

function lockModalScroll() {
  if (document.body.classList.contains("shipcashbox-modal-open")) return;
  modalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("shipcashbox-modal-open");
  document.body.classList.add("shipcashbox-modal-open");
  document.body.style.top = `-${modalScrollY}px`;
}

function unlockModalScroll() {
  if (anyModalOpen() || !document.body.classList.contains("shipcashbox-modal-open")) return;
  document.documentElement.classList.remove("shipcashbox-modal-open");
  document.body.classList.remove("shipcashbox-modal-open");
  document.body.style.top = "";
  window.scrollTo(0, modalScrollY);
  modalScrollY = 0;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function currentTranslations() {
  return window.__BRKOVIC_TRANSLATIONS || {};
}

function t(key) {
  return currentTranslations()[key] || key;
}

function tt(key, replacements = {}) {
  let text = t(key);
  Object.entries(replacements).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value ?? ""));
  });
  return text;
}

function normalizeToolLang(value) {
  const code = String(value || "").trim().toLowerCase().split("-")[0];
  return SUPPORTED_TOOL_LANGS.includes(code) ? code : "";
}

function savedToolLang() {
  try {
    return normalizeToolLang(localStorage.getItem(LANGUAGE_KEY));
  } catch (error) {
    return "";
  }
}

function syncLanguageState(lang) {
  state.lang = normalizeToolLang(lang)
    || normalizeToolLang(document.documentElement.lang)
    || savedToolLang()
    || "en";
}

function money(value, currency = "EUR", signed = false) {
  const number = Number(value || 0);
  const formatted = new Intl.NumberFormat(MONEY_LOCALES[state.lang] || "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(number));
  const prefix = signed ? (number > 0 ? "+" : number < 0 ? "-" : "") : "";
  return `${prefix}${currency} ${formatted}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function normalizedText(text) {
  return String(text || "").replace(/\r/g, "");
}

function hashText(text) {
  const input = normalizedText(text);
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash >>>= 0;
  }
  return hash.toString(16);
}

function participantDraftKey(token) {
  return `${PARTICIPANT_DRAFT_PREFIX}${token}`;
}

function participantSlotKey(token, slotId) {
  return `${PARTICIPANT_SLOT_PREFIX}${token}_${slotId}`;
}

function treasurerDraftKey(sessionId) {
  return `${TREASURER_DRAFT_PREFIX}${sessionId}`;
}

function activeSession() {
  return state.viewer === "treasurer" ? state.boot?.session : state.participant?.session;
}

function currentParticipantPayload() {
  if (state.viewer === "participant") {
    const participant = state.participant?.participant;
    if (!participant) return null;
    return participant.viewing || participant;
  }
  if (state.viewer === "treasurer") {
    const session = state.boot?.session;
    if (!session) return null;
    return (session.participants || []).find((participant) => participant.id === session.treasurer_participant_id) || null;
  }
  return null;
}

function notebookCanLock() {
  const session = activeSession();
  if (!session || session.status !== "active") return false;
  if (state.viewer === "treasurer") return true;
  const participant = state.participant?.participant;
  const viewing = participant?.viewing || participant;
  return !!(participant && viewing?.is_self && !participant.read_only);
}

function lockNotebookEditor() {
  if (!notebookCanLock()) return;
  state.editorLocked = true;
}

function unlockNotebookEditor() {
  state.editorLocked = false;
  state.hiddenAt = 0;
  render();
  const targetId = state.viewer === "treasurer" ? "treasurerNotebook" : "participantNotebook";
  const field = $(targetId);
  if (field instanceof HTMLTextAreaElement) {
    window.requestAnimationFrame(() => field.focus({ preventScroll: true }));
  }
}

function resetEditorLock() {
  state.editorLocked = false;
  state.hiddenAt = 0;
}

function toolShareUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  return url.toString();
}

function readToolAuthEmail() {
  try {
    const profile = JSON.parse(localStorage.getItem("brkovic_tool_auth_session_v1") || "null");
    return String(profile?.email || "").trim();
  } catch (error) {
    return "";
  }
}

function openCashboxPrintWindow(docHtml) {
  const html = String(docHtml || "").trim();
  if (!html) return false;

  const printWindow = window.open("", "_blank", "width=1320,height=920");
  if (!printWindow) return false;

  try {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    try {
      printWindow.focus();
    } catch (error) {}
    return true;
  } catch (error) {
    return false;
  }
}

function buildCashboxPrintDocument({ title = "", subtitle = "", bodyHtml = "" } = {}) {
  return `<!doctype html>
<html lang="${escapeHtml(state.lang)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  html, body { margin: 0; padding: 0; background: #fff; color: #10243a; font-family: Inter, Arial, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 100%; box-sizing: border-box; }
  .header { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding-bottom:10px; border-bottom:1px solid rgba(16,36,58,.16); }
  .brand { display:flex; align-items:flex-start; gap:14px; min-width:0; flex:1; }
  .logo { width: 220px; height: auto; display:block; }
  .titles { min-width:0; flex:1; padding-top:2px; }
  .eyebrow { margin:0 0 3px; font-size:8.6px; letter-spacing:.16em; text-transform:uppercase; color:rgba(16,36,58,.6); }
  .title { margin:0; font-size:25px; line-height:1.04; font-family: 'Cormorant Garamond', Georgia, serif; font-weight:700; }
  .subtitle { margin:4px 0 0; font-size:10.8px; line-height:1.35; color:rgba(16,36,58,.82); max-width:145mm; }
  .motto { margin:0; padding-top:8px; font-size:11.6px; line-height:1.3; font-style:italic; color:rgba(16,36,58,.85); white-space:nowrap; }
  .summary-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px; margin-top:10px; }
  .summary-card, .block, .tree-group { border:1px solid rgba(16,36,58,.14); border-radius:10px; background:#fbfbf8; break-inside:avoid; page-break-inside:avoid; }
  .summary-card { padding:9px 10px; display:grid; gap:4px; }
  .summary-card span { font-size:9.2px; text-transform:uppercase; letter-spacing:.08em; color:rgba(16,36,58,.6); }
  .summary-card strong { font-size:14px; }
  .block { margin-top:10px; padding:10px; }
  .block h2 { margin:0; font-size:12.8px; line-height:1.2; }
  .block p { margin:4px 0 0; font-size:10.4px; line-height:1.35; color:rgba(16,36,58,.78); }
  .chart { display:grid; gap:9px; margin-top:10px; }
  .chart-row { display:grid; grid-template-columns:140px minmax(0, 1fr); gap:10px; align-items:start; padding:8px 0; border-bottom:1px solid rgba(16,36,58,.08); }
  .chart-row:last-child { border-bottom:0; padding-bottom:0; }
  .chart-name { font-size:11px; line-height:1.25; font-weight:700; }
  .chart-metrics { display:grid; gap:7px; }
  .chart-metric { display:grid; gap:4px; }
  .chart-meta { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:9.6px; line-height:1.2; }
  .chart-meta span { color:rgba(16,36,58,.64); text-transform:uppercase; letter-spacing:.06em; }
  .track { height:8px; border-radius:999px; background:rgba(16,36,58,.08); overflow:hidden; }
  .fill { display:block; height:100%; border-radius:999px; }
  .fill--contribution { background:#2f6ea8; }
  .fill--expense { background:#d38a2c; }
  .fill--positive { background:#2e7d5a; }
  .fill--negative { background:#b85b3f; }
  .fill--neutral { background:#7c8b99; }
  .tree-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px; margin-top:10px; }
  .tree-group { padding:9px 10px; display:grid; gap:8px; }
  .tree-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .tree-head strong { font-size:11px; line-height:1.2; }
  .tree-pill { display:inline-flex; align-items:center; justify-content:center; min-height:22px; padding:0 8px; border-radius:999px; background:rgba(16,36,58,.06); font-size:9px; color:rgba(16,36,58,.72); }
  .tree-entries { display:grid; gap:6px; }
  .tree-entry { display:grid; gap:2px; padding:7px 8px; border-radius:8px; background:#fff; border:1px solid rgba(16,36,58,.08); }
  .tree-entry strong { font-size:10px; line-height:1.28; }
  .tree-entry span { font-size:8.8px; text-transform:uppercase; letter-spacing:.06em; color:rgba(16,36,58,.62); }
  .empty { font-size:10px; color:rgba(16,36,58,.62); }
  .footer { margin-top:10px; padding-top:6px; border-top:1px solid rgba(16,36,58,.16); display:flex; justify-content:space-between; gap:12px; font-size:8.6px; color:rgba(16,36,58,.68); }
</style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <div class="brand">
        <img class="logo" src="${PRINT_LOGO_SRC}" alt="Vetus Nauta — Brkovic">
        <div class="titles">
          <p class="eyebrow">Vetus Nauta</p>
          <h1 class="title">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
      </div>
      <p class="motto">Have a good watch Captain!</p>
    </header>
    ${bodyHtml}
    <footer class="footer"><span>Vetus Nauta — Brkovic</span><span>${escapeHtml(formatDateTime(new Date().toISOString()))}</span></footer>
  </main>
  <script>
  window.addEventListener("load", () => { setTimeout(() => window.print(), 120); });
  window.addEventListener("afterprint", () => { setTimeout(() => window.close(), 120); });
  </script>
</body>
</html>`;
}

function formatDateTime(value) {
  if (!value) return t("syncNever");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(state.lang === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function syncSourceLabel(source) {
  return source === "scheduled" ? t("syncSourceScheduled") : t("syncSourceManual");
}

function participantHasUnsyncedChanges() {
  const token = state.participant?.participant?.invite_token;
  if (!token) return false;
  const serverHash = state.participant?.participant?.notebook_hash || hashText(state.participant?.participant?.notebook_text || "");
  return hashText(state.participantDraft || "") !== serverHash;
}

function loadParticipantDraft(token, serverText, readOnly = false) {
  if (readOnly) {
    try {
      localStorage.removeItem(participantDraftKey(token));
    } catch (error) {}
    return normalizedText(serverText);
  }
  const draft = localStorage.getItem(participantDraftKey(token));
  return draft == null ? normalizedText(serverText) : normalizedText(draft);
}

function saveParticipantDraft(text) {
  const token = state.participant?.participant?.invite_token;
  if (!token) return;
  state.participantDraft = normalizedText(text);
  try {
    localStorage.setItem(participantDraftKey(token), state.participantDraft);
  } catch (error) {}
}

function loadTreasurerDraft(sessionId, serverText) {
  if (!sessionId) return normalizedText(serverText);
  const draft = localStorage.getItem(treasurerDraftKey(sessionId));
  return draft == null ? normalizedText(serverText) : normalizedText(draft);
}

function saveTreasurerDraft(text) {
  const sessionId = state.boot?.session?.id;
  if (!sessionId) return;
  state.treasurerDraft = normalizedText(text);
  try {
    localStorage.setItem(treasurerDraftKey(sessionId), state.treasurerDraft);
  } catch (error) {}
}

async function api(action, options = {}) {
  const [name, query = ""] = String(action).split(/(?=&)/, 2);
  const response = await fetch(`${API_BASE}${encodeURIComponent(name)}${query}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function adminProxyApi(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    credentials: "same-origin",
    ...options,
    headers: { ...(options.headers || {}) },
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || `HTTP ${response.status}`);
  }
  return data?.data?.data || data?.data || data;
}

function resolveAdminAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${ADMIN_API_ORIGIN}${path}`;
}

function attachmentFileName(path) {
  const raw = String(path || "").split("/").pop() || "";
  try {
    return decodeURIComponent(raw);
  } catch (error) {
    return raw;
  }
}

function isPdfAttachment(item) {
  const mimeType = String(item?.mime_type || "").toLowerCase();
  const filePath = String(item?.file_path || "").toLowerCase();
  return mimeType.includes("pdf") || filePath.endsWith(".pdf");
}

function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {}
}

function loadCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    return null;
  }
}

async function clearShipCashboxCaches() {
  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("ship-cashbox-shell-")).map((key) => caches.delete(key)));
  } catch (error) {}
}

function setFlash(message = "", persist = false) {
  const box = $("flashMessage");
  if (!message) {
    box.hidden = true;
    box.textContent = "";
    return;
  }
  box.hidden = false;
  box.textContent = message;
  if (!persist) {
    window.clearTimeout(setFlash._timer);
    setFlash._timer = window.setTimeout(() => {
      if ($("flashMessage").textContent === message) setFlash("");
    }, 3200);
  }
}

function setNotebookMeta(id, message) {
  const box = $(id);
  if (box) box.textContent = message;
}

function preserveSelection(id, callback) {
  const field = $(id);
  if (!(field instanceof HTMLTextAreaElement)) {
    callback();
    return;
  }
  const wasFocused = document.activeElement === field;
  const selectionStart = field.selectionStart;
  const selectionEnd = field.selectionEnd;
  const scrollTop = field.scrollTop;
  callback();
  if (!wasFocused) return;
  const next = $(id);
  if (!(next instanceof HTMLTextAreaElement)) return;
  next.focus({ preventScroll: true });
  next.selectionStart = selectionStart;
  next.selectionEnd = selectionEnd;
  next.scrollTop = scrollTop;
}

function applyTheme() {
  const mode = localStorage.getItem(THEME_KEY) === "night" ? "night" : "day";
  document.body.classList.toggle("navdesk-theme-night", mode === "night");
  document.body.classList.toggle("navdesk-theme-day", mode !== "night");
}

function updateTopbarText() {
  document.documentElement.lang = state.lang;
  if ($("heroEyebrow")) $("heroEyebrow").textContent = t("heroEyebrow");
  if ($("heroTitle")) $("heroTitle").textContent = t("heroTitle");
  if ($("heroIntro")) $("heroIntro").textContent = t("heroIntro");
  if ($("heroDescription")) $("heroDescription").textContent = t("heroDescription");
  if ($("mobileMastheadTitle")) $("mobileMastheadTitle").textContent = t("heroTitle");
  if ($("backToMainSite")) $("backToMainSite").textContent = t("backToMainSite");
  if ($("backToNavDesk")) $("backToNavDesk").textContent = t("backToNavDesk");
  if ($("cashboxExitStayButton")) $("cashboxExitStayButton").textContent = t("cashboxExitStay");
  if ($("cashboxExitConfirmButton")) $("cashboxExitConfirmButton").textContent = t("cashboxExitConfirm");
  if ($("onlineStatus")) $("onlineStatus").textContent = navigator.onLine ? t("online") : t("offline");
  const viewerKey = state.viewer === "treasurer" ? "viewerTreasurer" : state.viewer === "participant" ? "viewerParticipant" : "viewerGuest";
  if ($("viewerBadge")) $("viewerBadge").textContent = t(viewerKey);
  if ($("footerText")) $("footerText").textContent = t("footerText");
  if ($("currentYear")) $("currentYear").textContent = new Date().getFullYear();
  document.title = t("pageTitle");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("pageDescription"));
  document.querySelectorAll(".lang-switch__btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
  });
}

function installInstructionText() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return t("installIos");
  return t("installDesktop");
}

function renderInstallBox() {
  const engaged = localStorage.getItem(ENGAGED_KEY) === "1";
  const dismissed = localStorage.getItem(DISMISSED_INSTALL_KEY) === "1";
  if (!engaged || dismissed) return "";
  const action = state.installPrompt ? `<button class="btn btn--primary" type="button" id="installAppBtn">${t("installAction")}</button>` : "";
  return `
    <section class="shipcashbox-install" id="installHintBox">
      <div>
        <strong>${escapeHtml(t("installTitle"))}</strong>
        <p class="shipcashbox-note">${escapeHtml(t("installText"))}</p>
        <p class="shipcashbox-note">${escapeHtml(installInstructionText())}</p>
      </div>
      <div class="shipcashbox-actions">
        ${action}
        <button class="btn btn--secondary" type="button" id="dismissInstallBtn">${escapeHtml(t("installDismiss"))}</button>
      </div>
    </section>
  `;
}

function renderInfoHint(textKey) {
  const helpText = escapeHtml(t(textKey));
  return `
    <span class="shipcashbox-help" data-help-root>
      <button class="shipcashbox-info-hint" type="button" data-help-trigger aria-expanded="false" aria-label="${helpText}" title="${helpText}">?</button>
      <span class="shipcashbox-help-popover" role="tooltip" hidden>${helpText}</span>
    </span>
  `;
}

function renderTitleWithHint(labelKey, hintKey = "") {
  return `
    <span class="shipcashbox-titleline">
      <span>${escapeHtml(t(labelKey))}</span>
      ${hintKey ? renderInfoHint(hintKey) : ""}
    </span>
  `;
}

function renderMetricPill(label, value) {
  return `
    <span class="shipcashbox-pill shipcashbox-pill--metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </span>
  `;
}

function renderNotebookFooter({ label, value, actionHtml = "" }) {
  return `
    <div class="shipcashbox-notebook-footer">
      <div class="shipcashbox-notebook-footer__actions">${actionHtml}</div>
      <div class="shipcashbox-notebook-footer__metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </div>
  `;
}

function renderNotebookLockOverlay() {
  if (!state.editorLocked || !notebookCanLock()) return "";
  return `
    <div class="shipcashbox-lock" role="status" aria-live="polite">
      <div class="shipcashbox-lock__card">
        <button class="shipcashbox-lock__button" type="button" id="unlockNotebookButton" title="${escapeHtml(t("unlockNotebook"))}" aria-label="${escapeHtml(t("unlockNotebook"))}">✎</button>
        <strong>${escapeHtml(t("lockTitle"))}</strong>
        <p>${escapeHtml(t("lockText"))}</p>
      </div>
    </div>
  `;
}

function renderExports(exports = []) {
  if (!exports.length) return "";
  const grouped = Object.fromEntries(exports.map((item) => [item.type, item.file_path]));
  return `
    <div class="shipcashbox-share-actions">
      ${grouped.settlement_pdf ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.settlement_pdf)}" target="_blank" rel="noopener">${escapeHtml(t("exportSettlementPdf"))}</a>` : ""}
      ${grouped.settlement_txt ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.settlement_txt)}" target="_blank" rel="noopener">${escapeHtml(t("exportSettlementTxt"))}</a>` : ""}
      ${grouped.expense_log_pdf ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.expense_log_pdf)}" target="_blank" rel="noopener">${escapeHtml(t("exportLogPdf"))}</a>` : ""}
      ${grouped.expense_log_txt ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.expense_log_txt)}" target="_blank" rel="noopener">${escapeHtml(t("exportLogTxt"))}</a>` : ""}
    </div>
  `;
}

function renderGuest() {
  $("guestView").innerHTML = `
    <div class="shipcashbox-grid">
      <section class="shipcashbox-card">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("viewerTreasurer"))}</p>
            <h2>${escapeHtml(t("guestTreasurerTitle"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(t("guestTreasurerText"))}</p>
        <form class="shipcashbox-form" id="loginForm">
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("guestEmail"))}</span>
            <input type="email" id="loginEmail" autocomplete="username">
          </label>
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("guestPassword"))}</span>
            <input type="password" id="loginPassword" autocomplete="current-password">
          </label>
          <div class="shipcashbox-actions">
            <button class="btn btn--primary" type="submit">${escapeHtml(t("guestLogin"))}</button>
          </div>
        </form>
      </section>

      <section class="shipcashbox-card">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("viewerParticipant"))}</p>
            <h2>${escapeHtml(t("guestParticipantTitle"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(t("guestParticipantText"))}</p>
        <form class="shipcashbox-form" id="inviteForm">
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("guestToken"))}</span>
            <input type="text" id="inviteTokenField" value="${escapeHtml(state.inviteToken || "")}">
          </label>
          <div class="shipcashbox-actions">
            <button class="btn btn--primary" type="submit">${escapeHtml(t("guestOpen"))}</button>
          </div>
        </form>
        <p class="shipcashbox-note">${escapeHtml(t("guestLocalHint"))}</p>
      </section>
    </div>
  `;

  const loginForm = $("loginForm");
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("login", {
        method: "POST",
        body: JSON.stringify({
          email: $("loginEmail").value.trim(),
          password: $("loginPassword").value,
        }),
      });
      await clearShipCashboxCaches();
      window.location.replace(window.location.pathname);
    } catch (error) {
      setFlash(error.message || t("loginFailed"));
    }
  });

  $("inviteForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = $("inviteTokenField").value.trim();
    if (!token) {
      setFlash(t("tokenRequired"));
      return;
    }
    state.inviteToken = token;
    await loadParticipant(token);
  });
}

function participantStatusLabel(status) {
  return status === "closed" ? t("archiveStatus") : t("statusActive");
}

function participantSyncSummary() {
  const participant = state.participant?.participant;
  if (!participant) return "";
  const lastSync = participant.last_synced_at ? `${t("syncLast")}: ${formatDateTime(participant.last_synced_at)} (${syncSourceLabel(participant.last_sync_source)})` : t("syncNever");
  if (participant.read_only) return lastSync;
  return participantHasUnsyncedChanges() ? `${t("syncPending")} ${lastSync}` : lastSync;
}

function treasurerNotebookSummary() {
  const session = state.boot?.session;
  if (!session) return "";
  const treasurer = (session.participants || []).find((participant) => participant.id === session.treasurer_participant_id);
  const savedText = normalizedText(treasurer?.notebook_text || "");
  if (normalizedText(state.treasurerDraft || "") !== savedText) {
    return t("autosavePending");
  }
  return session.updated_at ? `${t("autosaveSaved")}: ${formatDateTime(session.updated_at)}` : t("autosaveReady");
}

async function saveTreasurerNotebook({ preserveFocus = false, silent = false } = {}) {
  if (!state.boot?.session) return null;
  window.clearTimeout(state.treasurerAutosaveTimer);
  state.treasurerAutosaveTimer = null;
  const draft = normalizedText(state.treasurerDraft || "");
  setNotebookMeta("treasurerSaveMeta", t("autosaveSaving"));
  try {
    const payload = await api("save-treasurer-notebook", {
      method: "POST",
      body: JSON.stringify({
        id: state.boot.session.id,
        notebook_text: draft,
      }),
    });
    state.boot = payload;
    saveCache(BOOT_CACHE_KEY, payload);
    localStorage.setItem(ENGAGED_KEY, "1");
    const treasurer = (payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id);
    state.treasurerDraft = normalizedText(treasurer?.notebook_text || draft);
    try {
      localStorage.setItem(treasurerDraftKey(payload.session?.id), state.treasurerDraft);
    } catch (error) {}
    preserveSelection("treasurerNotebook", () => render({ preserveWorkspace: true }));
    if (!silent) setFlash(t("saved"));
    return payload;
  } catch (error) {
    setNotebookMeta("treasurerSaveMeta", error.message || t("loadFailed"));
    if (!silent) setFlash(error.message || t("loadFailed"), true);
    throw error;
  }
}

function scheduleTreasurerAutosave() {
  window.clearTimeout(state.treasurerAutosaveTimer);
  state.treasurerAutosaveTimer = window.setTimeout(() => {
    saveTreasurerNotebook({ preserveFocus: true, silent: true }).catch(() => {});
  }, 900);
}

function renderParticipantSettlementLines(settlementLines, participant, currency) {
  if (!settlementLines.length) {
    return `<div class="shipcashbox-empty">${escapeHtml(t("noTransfers"))}</div>`;
  }
  return settlementLines.map((line) => {
    const isPayer = line.from_participant_id === participant.id;
    const counterpart = isPayer ? line.to_display_name : line.from_display_name;
    const title = line.kind === "cashbox_payout"
      ? (isPayer ? tt("treasurerReturnsTo", { name: counterpart }) : t("youReceiveFromTreasurer"))
      : line.kind === "cashbox_topup"
        ? (isPayer ? t("youAddToTreasurer") : tt("participantAddsToTreasurer", { name: counterpart }))
        : (isPayer ? tt("participantTransferTo", { name: counterpart }) : tt("participantReceiveFrom", { name: counterpart }));
    return `
      <div class="shipcashbox-line">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <div class="shipcashbox-line__participants">${escapeHtml(line.kind === "cashbox_payout" ? t("settlementCashboxPayout") : line.kind === "cashbox_topup" ? t("settlementCashboxTopup") : t("settlementText"))}</div>
        </div>
        <strong>${escapeHtml(money(line.amount, currency))}</strong>
      </div>
    `;
  }).join("");
}

function renderParticipant() {
  const payload = state.participant;
  if (!payload) return;
  const { session, participant } = payload;
  const viewing = participant.viewing || participant;
  const readOnly = !!viewing.read_only || (viewing.is_self && state.editorLocked);
  const syncMeta = participantSyncSummary();
  const headerMetric = renderMetricPill(t("contributionShort"), money(viewing.contributions, session.currency));
  const footerAction = viewing.is_self && !viewing.read_only
    ? `<button class="btn btn--secondary" type="button" id="participantSyncButton" title="${escapeHtml(t("syncNowHelp"))}" aria-label="${escapeHtml(t("syncNowHelp"))}">${escapeHtml(t("syncNow"))}</button>`
    : (viewing.is_self ? "" : `<a class="btn btn--secondary" href="?invite=${encodeURIComponent(participant.invite_token)}">${escapeHtml(t("backToMyNotebook"))}</a>`);
  $("participantView").innerHTML = `
    <section class="shipcashbox-card shipcashbox-card--sticky shipcashbox-card--notebook">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(session.title)}</p>
          <h2>${renderTitleWithHint("participantNotebookTitle", "notebookHelp")}</h2>
          <p class="shipcashbox-note">${escapeHtml(t("notebookAutosaveLabel"))}</p>
        </div>
        <div class="shipcashbox-inline-actions">
          ${headerMetric}
          <button class="btn btn--secondary" type="button" id="openWorkspaceMenuButton" title="${escapeHtml(t("workspaceMenuHelp"))}" aria-label="${escapeHtml(t("workspaceMenuHelp"))}">${escapeHtml(t("workspaceMenuAction"))}</button>
        </div>
      </div>
      ${viewing.is_self ? `<p class="shipcashbox-note" id="participantSyncMeta">${escapeHtml(syncMeta)}</p>` : `<p class="shipcashbox-note">${escapeHtml(t("currentView"))}: ${escapeHtml(viewing.display_name)}. ${escapeHtml(t("viewingReadonly"))}</p>`}
      <div class="shipcashbox-notebook-shell">
        <textarea id="participantNotebook" class="shipcashbox-notebook-textarea" placeholder="${escapeHtml(t("notebookPlaceholder"))}" aria-label="${escapeHtml(t("participantNotebookTitle"))}" ${readOnly ? "readonly" : ""}>${escapeHtml(viewing.is_self ? (state.participantDraft || participant.notebook_text || "") : (viewing.notebook_text || ""))}</textarea>
        ${renderNotebookLockOverlay()}
      </div>
      ${readOnly && viewing.is_self && !state.editorLocked ? `<p class="shipcashbox-note">${escapeHtml(t("participantReadonly"))}</p>` : ""}
      ${readOnly && !viewing.is_self ? `<p class="shipcashbox-note">${escapeHtml(t("readonlyParticipantView"))}</p>` : ""}
      ${renderNotebookFooter({
        label: t("spentFooterLabel"),
        value: money(viewing.expenses, session.currency),
        actionHtml: footerAction,
      })}
    </section>
  `;

  $("participantNotebook")?.addEventListener("input", () => {
    if (!viewing.is_self) return;
    saveParticipantDraft($("participantNotebook").value);
    $("participantSyncMeta").textContent = participantSyncSummary();
  });
  $("participantSyncButton")?.addEventListener("click", () => syncParticipant("manual").catch((error) => setFlash(error.message || t("loadFailed"))));
  $("openWorkspaceMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  $("unlockNotebookButton")?.addEventListener("click", unlockNotebookEditor);
}

function renderParticipantRows(participants) {
  const treasurerId = state.boot?.session?.treasurer_participant_id || participants.find((participant) => participant.role === "treasurer")?.id || "";
  return participants.map((participant) => `
    <div class="shipcashbox-participant-row" data-participant-id="${escapeHtml(participant.id)}" data-participant-role="${escapeHtml(participant.role)}" data-authorized="${participant.authorized_at ? "1" : "0"}" data-is-treasurer="${participant.id === treasurerId ? "1" : "0"}">
      <div class="shipcashbox-participant-row__top shipcashbox-participant-row__top--editor">
        <label class="shipcashbox-field">
          <span>${escapeHtml(participant.id === treasurerId ? t("treasurerSelfLabel") : t("participantNameLabel"))}</span>
          <input type="text" class="participant-name-input" value="${escapeHtml(participant.display_name)}">
        </label>
        <label class="shipcashbox-field shipcashbox-field--compact">
          <span>${escapeHtml(t("cashboxContributionLabel"))}</span>
          <input type="text" class="participant-contribution-input" inputmode="decimal" value="${escapeHtml(String(participant.cashbox_contribution ?? 0))}">
        </label>
      </div>
      <div class="shipcashbox-participant-row__stats">
        <span class="shipcashbox-pill participant-auth-pill">${escapeHtml(participant.authorized_at ? `${t("authConfirmed")}: ${formatDateTime(participant.authorized_at)}` : t("authPending"))}</span>
        <span class="shipcashbox-pill">${escapeHtml(`${t("summaryExpenses")}: ${money(participant.expenses, state.boot.session.currency)}`)}</span>
        <span class="shipcashbox-pill">${escapeHtml(participant.last_synced_at ? `${t("syncLast")}: ${formatDateTime(participant.last_synced_at)}` : t("syncNever"))}</span>
      </div>
      <div class="shipcashbox-inline-actions shipcashbox-inline-actions--participant">
        <label class="shipcashbox-choice shipcashbox-choice--split ${participant.role === "treasurer" ? "" : "is-hidden"}">
          <input type="checkbox" class="split-inclusion-input" ${participant.included_in_split ? "checked" : ""}>
          <span>${escapeHtml(t("includeInSettlement"))}</span>
        </label>
        ${participants.length > 1 && participant.role !== "treasurer" ? `<button class="btn btn--secondary remove-participant-btn" type="button">${escapeHtml(t("removeParticipant"))}</button>` : ""}
      </div>
      ${participant.role !== "treasurer" && !participant.authorized_at ? `<p class="shipcashbox-note shipcashbox-participant-row__hint">${escapeHtml(t("participantChainPending"))}</p>` : ""}
      <div class="shipcashbox-share-actions">
        ${participant.role !== "treasurer" ? `<button class="btn btn--secondary copy-invite-btn" type="button" data-link="${escapeHtml(participant.invite_link)}" title="${escapeHtml(t("copyInviteHelp"))}" aria-label="${escapeHtml(t("copyInviteHelp"))}">${escapeHtml(t("copyInvite"))}</button>` : ""}
        ${participant.role !== "treasurer" ? `<button class="btn btn--secondary share-invite-btn" type="button" data-link="${escapeHtml(participant.invite_link)}" data-name="${escapeHtml(participant.display_name)}" title="${escapeHtml(t("shareInviteHelp"))}" aria-label="${escapeHtml(t("shareInviteHelp"))}">${escapeHtml(t("shareInvite"))}</button>` : ""}
        ${participant.role !== "treasurer" ? `<button class="btn btn--secondary qr-invite-btn" type="button" data-link="${escapeHtml(participant.invite_link)}" data-name="${escapeHtml(participant.display_name)}" title="${escapeHtml(t("qrInviteHelp"))}" aria-label="${escapeHtml(t("qrInviteHelp"))}">${escapeHtml(t("qrInvite"))}</button>` : ""}
      </div>
    </div>
  `).join("");
}

function renderParticipantDraftRow(tempId) {
  return `
    <div class="shipcashbox-participant-row shipcashbox-participant-row--draft" data-participant-id="${escapeHtml(tempId)}" data-participant-role="participant" data-authorized="0" data-is-treasurer="0">
      <div class="shipcashbox-participant-row__top shipcashbox-participant-row__top--editor">
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("participantNameLabel"))}</span>
          <input type="text" class="participant-name-input" value="">
        </label>
        <label class="shipcashbox-field shipcashbox-field--compact">
          <span>${escapeHtml(t("cashboxContributionLabel"))}</span>
          <input type="text" class="participant-contribution-input" inputmode="decimal" value="0">
        </label>
      </div>
      <div class="shipcashbox-participant-row__stats">
        <span class="shipcashbox-pill participant-auth-pill">${escapeHtml(t("authPending"))}</span>
        <span class="shipcashbox-pill">${escapeHtml(`${t("summaryExpenses")}: ${money(0, state.boot?.session?.currency || "EUR")}`)}</span>
        <span class="shipcashbox-pill">${escapeHtml(t("inviteLinkPending"))}</span>
        <span class="shipcashbox-pill">${escapeHtml(t("syncNever"))}</span>
      </div>
      <div class="shipcashbox-inline-actions shipcashbox-inline-actions--participant">
        <button class="btn btn--secondary remove-participant-btn" type="button">${escapeHtml(t("removeParticipant"))}</button>
      </div>
      <p class="shipcashbox-note shipcashbox-participant-row__hint">${escapeHtml(t("participantDraftPending"))}</p>
    </div>
  `;
}

function renderSummaryCards(participants, currency) {
  return participants.map((participant) => `
    <article class="shipcashbox-summary-card">
      <div class="shipcashbox-card__row">
        <strong>${escapeHtml(participant.display_name)}</strong>
        <span class="shipcashbox-pill">${escapeHtml(participant.role === "treasurer" ? t("treasurerTag") : t("participantTag"))}</span>
      </div>
      <div class="shipcashbox-summary-grid">
        <div><span class="shipcashbox-note">${escapeHtml(t("contributionShort"))}</span><strong>${escapeHtml(money(participant.contributions, currency))}</strong></div>
        <div><span class="shipcashbox-note">${escapeHtml(t("expenseShort"))}</span><strong>${escapeHtml(money(participant.expenses, currency))}</strong></div>
        <div><span class="shipcashbox-note">${escapeHtml(t("balanceShort"))}</span><strong>${escapeHtml(money(participant.balance, currency, true))}</strong></div>
      </div>
    </article>
  `).join("");
}

function chartMetricDefinitions() {
  return [
    { key: "contributions", label: t("summaryContributions"), tone: "contribution", signed: false },
    { key: "expenses", label: t("summaryExpenses"), tone: "expense", signed: false },
    { key: "balance", label: t("balanceShort"), tone: "balance", signed: true },
  ];
}

function chartMetricTone(metric, value) {
  if (metric.key !== "balance") return metric.tone;
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function chartMetricWidth(value, maxValue) {
  const absolute = Math.abs(Number(value || 0));
  if (!absolute) return 0;
  return Math.max(6, Math.min(100, (absolute / maxValue) * 100));
}

function buildExpenseChartModel(participants = []) {
  const metrics = chartMetricDefinitions();
  const maxValue = Math.max(1, ...participants.flatMap((participant) => metrics.map((metric) => Math.abs(Number(participant[metric.key] || 0)))));
  return { metrics, maxValue };
}

function renderExpenseDiagram(participants, currency, { print = false } = {}) {
  if (!participants.length) {
    return `<div class="${print ? "empty" : "shipcashbox-empty"}">${escapeHtml(t("emptyLines"))}</div>`;
  }

  const { metrics, maxValue } = buildExpenseChartModel(participants);
  const rowClass = print ? "chart-row" : "shipcashbox-chart__row";
  const nameClass = print ? "chart-name" : "shipcashbox-chart__name";
  const metricsClass = print ? "chart-metrics" : "shipcashbox-chart__metrics";
  const metricClass = print ? "chart-metric" : "shipcashbox-chart__metric";
  const metaClass = print ? "chart-meta" : "shipcashbox-chart__meta";
  const trackClass = print ? "track" : "shipcashbox-chart__track";
  const fillClass = print ? "fill" : "shipcashbox-chart__fill";
  const rootClass = print ? "chart" : "shipcashbox-chart";

  return `
    <div class="${rootClass}">
      ${participants.map((participant) => `
        <div class="${rowClass}">
          <div class="${nameClass}">${escapeHtml(participant.display_name)}</div>
          <div class="${metricsClass}">
            ${metrics.map((metric) => {
              const value = Number(participant[metric.key] || 0);
              const tone = chartMetricTone(metric, value);
              return `
                <div class="${metricClass}">
                  <div class="${metaClass}">
                    <span>${escapeHtml(metric.label)}</span>
                    <strong>${escapeHtml(money(value, currency, metric.signed))}</strong>
                  </div>
                  <div class="${trackClass}">
                    <span class="${fillClass} ${fillClass}--${tone}" style="width:${chartMetricWidth(value, maxValue).toFixed(2)}%"></span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderLogGroups(participants) {
  return participants.map((participant) => `
    <article class="shipcashbox-log__group">
      <div class="shipcashbox-card__row">
        <strong>${escapeHtml(participant.display_name)}</strong>
        <span class="shipcashbox-pill">${escapeHtml(`${participant.entries.length} ${t("rowsCount")}`)}</span>
      </div>
      <div class="shipcashbox-log__entries">
        ${participant.entries.length ? participant.entries.map((entry) => `
          <div class="shipcashbox-entry">
            <strong>${escapeHtml(entry.raw_text || entry.note)}</strong>
            <div class="shipcashbox-entry__meta">${escapeHtml(entry.entry_kind)}</div>
          </div>
        `).join("") : `<div class="shipcashbox-empty">${escapeHtml(t("emptyLines"))}</div>`}
      </div>
    </article>
  `).join("");
}

function renderPrintLogGroups(participants) {
  return participants.map((participant) => `
    <article class="tree-group">
      <div class="tree-head">
        <strong>${escapeHtml(participant.display_name)}</strong>
        <span class="tree-pill">${escapeHtml(`${participant.entries.length} ${t("rowsCount")}`)}</span>
      </div>
      <div class="tree-entries">
        ${participant.entries.length ? participant.entries.map((entry) => `
          <div class="tree-entry">
            <strong>${escapeHtml(entry.raw_text || entry.note)}</strong>
            <span>${escapeHtml(entry.entry_kind)}</span>
          </div>
        `).join("") : `<div class="empty">${escapeHtml(t("emptyLines"))}</div>`}
      </div>
    </article>
  `).join("");
}

function renderSettlementLines(lines, currency) {
  if (!lines.length) {
    return `<div class="shipcashbox-empty">${escapeHtml(t("noTransfers"))}</div>`;
  }
  return lines.map((line) => {
    const title = line.kind === "cashbox_payout"
      ? tt("treasurerReturnsTo", { name: line.to_display_name })
      : line.kind === "cashbox_topup"
        ? tt("participantAddsToTreasurer", { name: line.from_display_name })
        : tt("participantTransferLine", { from: line.from_display_name, to: line.to_display_name });
    return `
      <div class="shipcashbox-line">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <div class="shipcashbox-line__participants">${escapeHtml(line.kind === "cashbox_payout" ? t("settlementCashboxPayout") : line.kind === "cashbox_topup" ? t("settlementCashboxTopup") : t("settlementText"))}</div>
        </div>
        <strong>${escapeHtml(money(line.amount, currency))}</strong>
      </div>
    `;
  }).join("");
}

function renderArchiveRows(archive = [], canReopen = false) {
  if (!archive.length) {
    return `<div class="shipcashbox-empty">${escapeHtml(t("archiveEmpty"))}</div>`;
  }
  return archive.map((item) => `
    <article class="shipcashbox-archive__row">
      <div class="shipcashbox-card__row">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="shipcashbox-archive__status">${escapeHtml(t("archiveStatus"))}</span>
      </div>
      <div class="shipcashbox-archive__meta">${escapeHtml(t("archivedOn"))}: ${escapeHtml(item.closed_at || "")}</div>
      <div class="shipcashbox-archive__meta">${escapeHtml(`${item.participants} · ${money(item.cashbox_balance, item.currency, true)}`)}</div>
      ${renderExports(item.exports)}
      ${canReopen ? `<div class="shipcashbox-actions"><button class="btn btn--secondary reopen-session-btn" type="button" data-id="${escapeHtml(item.id)}" title="${escapeHtml(t("reopenCashboxHelp"))}" aria-label="${escapeHtml(t("reopenCashboxHelp"))}">${escapeHtml(t("reopenCashbox"))}</button></div>` : ""}
    </article>
  `).join("");
}

function renderCrewDirectory(directory = []) {
  return `
    <div class="shipcashbox-summary">
      ${directory.map((item) => `
        <article class="shipcashbox-summary-card">
          <div class="shipcashbox-card__row">
            <strong>${escapeHtml(item.display_name)}</strong>
            <span class="shipcashbox-pill">${escapeHtml(item.role === "treasurer" ? t("treasurerTag") : t("participantTag"))}</span>
          </div>
          <div class="shipcashbox-actions">
            <a class="btn btn--secondary" href="${escapeHtml(item.read_link)}">${escapeHtml(item.is_self ? t("backToMyNotebook") : t("openReadonly"))}</a>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderWindowMenuButton(windowName, label, note = "") {
  return `
    <button class="shipcashbox-window-link" type="button" data-workspace-window="${escapeHtml(windowName)}" title="${escapeHtml(note || label)}" aria-label="${escapeHtml(note || label)}">
      <strong>${escapeHtml(label)}</strong>
      ${note ? `<span>${escapeHtml(note)}</span>` : ""}
    </button>
  `;
}

function renderWorkspaceMenu() {
  if (state.viewer === "treasurer") {
    return `
      <div class="shipcashbox-window-menu">
        ${renderWindowMenuButton("snapshot", t("summaryTitle"), t("workspaceSnapshotText"))}
        ${renderWindowMenuButton("team", t("participantsTitle"), t("workspaceTeamText"))}
        ${renderWindowMenuButton("settlement", t("settlementTitle"), t("workspaceSettlementText"))}
        ${renderWindowMenuButton("reports", t("workspaceReportsTitle"), t("workspaceReportsText"))}
        ${renderWindowMenuButton("archive", t("archiveTitle"), t("workspaceArchiveText"))}
        ${renderWindowMenuButton("service", t("workspaceServiceTitle"), t("workspaceServiceText"))}
      </div>
    `;
  }

  if (state.viewer === "participant") {
    return `
      <div class="shipcashbox-window-menu">
        ${renderWindowMenuButton("participant-settlement", t("settlementTitle"), t("workspaceParticipantSettlementText"))}
        ${renderWindowMenuButton("crew", t("crewNotebooks"), t("workspaceCrewText"))}
        ${renderWindowMenuButton("service", t("workspaceServiceTitle"), t("workspaceServiceText"))}
      </div>
    `;
  }

  return "";
}

function renderTreasurerReportsWindow(session) {
  const participants = session.participants || [];
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("participantOverviewTitle"))}</p>
            <h2>${escapeHtml(t("participantOverviewTitle"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-summary">${renderSummaryCards(participants, session.currency)}</div>
      </section>
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("logTitle"))}</p>
            <h2>${escapeHtml(t("logTitle"))}</h2>
          </div>
          <div class="shipcashbox-share-actions">
            <button class="btn btn--secondary" type="button" id="shareLogButton" title="${escapeHtml(t("shareLogHelp"))}" aria-label="${escapeHtml(t("shareLogHelp"))}">${escapeHtml(t("shareLog"))}</button>
            <button class="btn btn--secondary" type="button" id="printLogButton" title="${escapeHtml(t("printLogHelp"))}" aria-label="${escapeHtml(t("printLogHelp"))}">${escapeHtml(t("printLog"))}</button>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(t("logText"))}</p>
        <div class="shipcashbox-stack">
          <div>
            <strong>${escapeHtml(t("logDiagram"))}</strong>
            <p class="shipcashbox-note">${escapeHtml(t("logDiagramText"))}</p>
          </div>
          ${renderExpenseDiagram(participants, session.currency)}
          <div>
            <strong>${escapeHtml(t("logTreeTitle"))}</strong>
          </div>
          <div class="shipcashbox-log">${renderLogGroups(participants)}</div>
        </div>
      </section>
    </div>
  `;
}

function renderTreasurerSnapshotWindow(session) {
  const totals = session.totals || {};
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("summaryTitle"))}</p>
          <h2>${escapeHtml(t("summaryTitle"))}</h2>
        </div>
      </div>
      <div class="shipcashbox-metrics">
        <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryCash"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
        <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryContributions"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
        <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryExpenses"))}</span><strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong></div>
        <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryShare"))}</span><strong>${escapeHtml(money(totals.share, session.currency))}</strong></div>
      </div>
    </section>
  `;
}

function renderTreasurerTeamWindow(session) {
  const activeCount = (session.participants || []).filter((participant) => participant.authorized_at).length;
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("participantsTitle"))}</p>
          <h2>${renderTitleWithHint("participantsTitle", "participantsHelp")}</h2>
        </div>
      </div>
      <p class="shipcashbox-note">${escapeHtml(t("teamContributionsText"))}</p>
      <div class="shipcashbox-metrics shipcashbox-metrics--compact">
        <div class="shipcashbox-metric"><span>${escapeHtml(t("participantsTitle"))}</span><strong>${escapeHtml(String((session.participants || []).length))}</strong></div>
        <div class="shipcashbox-metric"><span>${escapeHtml(t("authConfirmed"))}</span><strong>${escapeHtml(String(activeCount))}</strong></div>
      </div>
      <div class="shipcashbox-form__grid">
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("sessionTitle"))}</span>
          <input type="text" id="sessionTitleInput" value="${escapeHtml(session.title)}">
        </label>
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("sessionCurrency"))}</span>
          <input type="text" id="sessionCurrencyInput" value="${escapeHtml(session.currency)}" maxlength="6">
        </label>
      </div>
      <div class="shipcashbox-actions shipcashbox-actions--lead">
        <button class="btn btn--primary" type="button" id="addParticipantButtonTop" title="${escapeHtml(t("addParticipantHelp"))}" aria-label="${escapeHtml(t("addParticipantHelp"))}">${escapeHtml(t("inviteParticipant"))}</button>
      </div>
      <div class="shipcashbox-participants" id="participantsEditor">${renderParticipantRows(session.participants || [])}</div>
      <div class="shipcashbox-actions">
        <button class="btn btn--primary" type="button" id="saveSessionButton" title="${escapeHtml(t("saveSessionHelp"))}" aria-label="${escapeHtml(t("saveSessionHelp"))}">${escapeHtml(t("saveSession"))}</button>
        <button class="btn btn--secondary" type="button" id="addParticipantButton" title="${escapeHtml(t("addParticipantHelp"))}" aria-label="${escapeHtml(t("addParticipantHelp"))}">${escapeHtml(t("inviteParticipant"))}</button>
      </div>
    </section>
  `;
}

function renderTreasurerSettlementWindow(session) {
  const settlementText = session.settlement_preview?.mode === "cashbox"
    ? t("settlementCashboxText")
    : t("settlementText");
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("settlementTitle"))}</p>
          <h2>${renderTitleWithHint("settlementTitle", "settlementHelp")}</h2>
        </div>
      </div>
      <p class="shipcashbox-note">${escapeHtml(settlementText)}</p>
      <div class="shipcashbox-lines">${renderSettlementLines(session.settlement_preview?.lines || [], session.currency)}</div>
      <div class="shipcashbox-actions">
        <button class="btn btn--primary" type="button" id="confirmSettlementButton" title="${escapeHtml(t("settleNowHelp"))}" aria-label="${escapeHtml(t("settleNowHelp"))}">${escapeHtml(t("settleNow"))}</button>
      </div>
    </section>
  `;
}

function renderParticipantSettlementWindow() {
  const payload = state.participant;
  if (!payload) return "";
  const { session, participant } = payload;
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("participantSettlement"))}</p>
          <h2>${renderTitleWithHint("settlementTitle", "settlementHelp")}</h2>
        </div>
      </div>
      <p class="shipcashbox-note">${escapeHtml(t("settlementText"))}</p>
      <div class="shipcashbox-lines">${renderParticipantSettlementLines(participant.settlement_lines || [], participant, session.currency)}</div>
    </section>
  `;
}

function renderServiceWindow() {
  const installBox = renderInstallBox();
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("guideEyebrow"))}</p>
            <h2>${escapeHtml(t("guideTitle"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-guide">
          <p>${escapeHtml(t("guideStep1"))}</p>
          <p>${escapeHtml(t("guideStep2"))}</p>
          <p>${escapeHtml(t("guideStep3"))}</p>
          <p>${escapeHtml(t("guideStep4"))}</p>
        </div>
      </section>
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("shareTool"))}</p>
            <h2>${escapeHtml(t("workspaceServiceTitle"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(t("workspaceServiceText"))}</p>
        <div class="shipcashbox-actions">
          <button class="btn btn--primary" type="button" id="workspaceShareToolButton" title="${escapeHtml(t("shareToolHelp"))}" aria-label="${escapeHtml(t("shareToolHelp"))}">${escapeHtml(t("shareTool"))}</button>
        </div>
      </section>
      ${installBox ? installBox : `<section class="shipcashbox-card shipcashbox-card--window"><p class="shipcashbox-empty">${escapeHtml(t("workspaceServiceEmpty"))}</p></section>`}
    </div>
  `;
}

function renderTreasurerAttachments(session) {
  const items = Array.isArray(session.attachments) ? session.attachments : [];
  const canEdit = session.status === "active";
  if (!items.length) {
    return `<p class="shipcashbox-note">${escapeHtml(t("photosEmpty"))}</p>`;
  }

  return `
    <div class="shipcashbox-attachments">
      ${items.map((item) => {
        const href = escapeHtml(resolveAdminAssetUrl(item.file_path));
        const label = escapeHtml(item.alt || attachmentFileName(item.file_path) || t("photosTitle"));
        const fileName = escapeHtml(attachmentFileName(item.file_path));
        const pdf = isPdfAttachment(item);
        return `
          <article class="shipcashbox-attachment">
            ${pdf ? `
              <a class="shipcashbox-attachment__media shipcashbox-attachment__media--document" href="${href}" target="_blank" rel="noopener">
                <span class="shipcashbox-attachment__badge">PDF</span>
                <strong>${escapeHtml(t("attachmentPdfLabel"))}</strong>
                <span>${fileName}</span>
              </a>
            ` : `
              <a class="shipcashbox-attachment__media" href="${href}" target="_blank" rel="noopener">
                <img src="${href}" alt="${label}">
              </a>
            `}
            <div class="shipcashbox-attachment__actions">
              <a class="btn btn--secondary" href="${href}" target="_blank" rel="noopener">${escapeHtml(t("openPhoto"))}</a>
              ${canEdit ? `<button class="btn btn--secondary delete-attachment-btn" type="button" data-attachment-id="${escapeHtml(item.id)}" title="${escapeHtml(t("removePhotoHelp"))}" aria-label="${escapeHtml(t("removePhotoHelp"))}">${escapeHtml(t("removePhoto"))}</button>` : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function workspaceWindowPayload(windowName) {
  if (windowName === "menu") {
    return {
      eyebrow: t("workspaceMenuEyebrow"),
      title: t("workspaceMenuTitle"),
      body: renderWorkspaceMenu(),
    };
  }

  if (state.viewer === "treasurer" && state.boot?.session) {
    const { session, archive } = state.boot;
    if (windowName === "snapshot") {
      return {
        eyebrow: t("summaryTitle"),
        title: t("summaryTitle"),
        body: renderTreasurerSnapshotWindow(session),
      };
    }
    if (windowName === "team") {
      return {
        eyebrow: t("participantsTitle"),
        title: t("participantsTitle"),
        body: renderTreasurerTeamWindow(session),
      };
    }
    if (windowName === "settlement") {
      return {
        eyebrow: t("settlementTitle"),
        title: t("settlementTitle"),
        body: renderTreasurerSettlementWindow(session),
      };
    }
    if (windowName === "reports") {
      return {
        eyebrow: t("workspaceReportsTitle"),
        title: t("workspaceReportsTitle"),
        body: renderTreasurerReportsWindow(session),
      };
    }
    if (windowName === "archive") {
      return {
        eyebrow: t("archiveTitle"),
        title: t("archiveTitle"),
        body: `<section class="shipcashbox-card shipcashbox-card--window"><div class="shipcashbox-archive">${renderArchiveRows(archive, false)}</div></section>`,
      };
    }
    if (windowName === "service") {
      return {
        eyebrow: t("workspaceServiceTitle"),
        title: t("workspaceServiceTitle"),
        body: renderServiceWindow(),
      };
    }
  }

  if (state.viewer === "participant" && state.participant) {
    const { participant } = state.participant;
    if (windowName === "participant-settlement") {
      return {
        eyebrow: t("settlementTitle"),
        title: t("settlementTitle"),
        body: renderParticipantSettlementWindow(),
      };
    }
    if (windowName === "crew") {
      return {
        eyebrow: t("crewNotebooks"),
        title: t("crewNotebooks"),
        body: renderCrewDirectory(participant.directory || []),
      };
    }
    if (windowName === "service") {
      return {
        eyebrow: t("workspaceServiceTitle"),
        title: t("workspaceServiceTitle"),
        body: renderServiceWindow(),
      };
    }
  }

  return null;
}

function renderTreasurer() {
  const { session, archive } = state.boot;
  if (!session) {
    $("treasurerView").innerHTML = `
      <div class="shipcashbox-grid">
        <section class="shipcashbox-card">
          <div class="shipcashbox-card__head">
            <div>
              <p class="section-heading__eyebrow">${escapeHtml(t("sessionCardEyebrow"))}</p>
              <h2>${escapeHtml(t("noActiveCashbox"))}</h2>
            </div>
          </div>
          <p class="shipcashbox-note">${escapeHtml(t("noActiveCashboxText"))}</p>
          <div class="shipcashbox-actions">
            <button class="btn btn--primary" type="button" id="createSessionButton">${escapeHtml(t("createCashbox"))}</button>
            <button class="btn btn--secondary" type="button" id="shareToolButton">${escapeHtml(t("shareTool"))}</button>
          </div>
        </section>

        <section class="shipcashbox-card">
          <div class="shipcashbox-card__head">
            <div>
              <p class="section-heading__eyebrow">${escapeHtml(t("archiveTitle"))}</p>
              <h2>${escapeHtml(t("archiveTitle"))}</h2>
            </div>
          </div>
          <div class="shipcashbox-archive">${renderArchiveRows(archive, true)}</div>
        </section>

        ${renderInstallBox()}
      </div>
    `;
    bindTreasurerUi();
    bindInstallUi();
    return;
  }

  const participants = session.participants || [];
  const treasurer = participants.find((participant) => participant.id === session.treasurer_participant_id) || participants[0];
  const notebookText = normalizedText(state.treasurerDraft || treasurer?.notebook_text || "");
  const totals = session.totals || {};
  const readOnly = session.status !== "active" || state.editorLocked;
  const attachmentAction = session.status === "active"
    ? `<button class="btn btn--secondary" type="button" id="attachReceiptButton" title="${escapeHtml(t("attachPhotoHelp"))}" aria-label="${escapeHtml(t("attachPhotoHelp"))}">${escapeHtml(t("attachPhoto"))}</button>`
    : "";
  $("treasurerView").innerHTML = `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--sticky shipcashbox-card--notebook">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(session.title)}</p>
            <h2>${renderTitleWithHint("treasurerNotebookTitle", "notebookHelp")}</h2>
            <p class="shipcashbox-note">${escapeHtml(t("notebookAutosaveLabel"))}</p>
          </div>
          <div class="shipcashbox-inline-actions">
            ${renderMetricPill(t("contributionShort"), money(treasurer?.contributions || 0, session.currency))}
            <button class="btn btn--primary" type="button" id="quickInviteParticipantButton" title="${escapeHtml(t("addParticipantHelp"))}" aria-label="${escapeHtml(t("addParticipantHelp"))}">${escapeHtml(t("inviteParticipantShort"))}</button>
            <button class="btn btn--secondary" type="button" id="openWorkspaceMenuButton" title="${escapeHtml(t("workspaceMenuHelp"))}" aria-label="${escapeHtml(t("workspaceMenuHelp"))}">${escapeHtml(t("workspaceMenuAction"))}</button>
          </div>
        </div>
        <div class="shipcashbox-metrics shipcashbox-metrics--compact">
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryContributions"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("syncBalanceLabel"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
        </div>
        <div class="shipcashbox-notebook-shell">
          <textarea id="treasurerNotebook" class="shipcashbox-notebook-textarea" placeholder="${escapeHtml(t("notebookPlaceholder"))}" aria-label="${escapeHtml(t("treasurerNotebookTitle"))}" ${readOnly ? "readonly" : ""}>${escapeHtml(notebookText)}</textarea>
          ${renderNotebookLockOverlay()}
        </div>
        <div class="shipcashbox-stack">
          <div class="shipcashbox-card__row">
            <strong>${escapeHtml(t("photosTitle"))}</strong>
          </div>
          ${renderTreasurerAttachments(session)}
        </div>
        <p class="shipcashbox-note" id="treasurerSaveMeta">${escapeHtml(treasurerNotebookSummary())}</p>
        ${session.status !== "active" && !state.editorLocked ? `<p class="shipcashbox-note">${escapeHtml(t("participantReadonly"))}</p>` : ""}
        ${renderNotebookFooter({
          label: t("spentFooterLabel"),
          value: money(treasurer?.expenses || 0, session.currency),
          actionHtml: attachmentAction,
        })}
      </section>
    </div>
  `;

  bindTreasurerUi();
}

function collectParticipantDrafts() {
  return Array.from(document.querySelectorAll(".shipcashbox-participant-row")).map((row) => {
    const isTreasurer = row.dataset.participantRole === "treasurer" || row.dataset.isTreasurer === "1";
    const included = row.querySelector(".split-inclusion-input")?.checked ?? true;
    const contributionInput = row.querySelector(".participant-contribution-input");
    return {
      id: row.dataset.participantId,
      role: isTreasurer ? "treasurer" : "participant",
      display_name: row.querySelector(".participant-name-input").value.trim() || (isTreasurer ? "Treasurer" : "Crew member"),
      active: true,
      included_in_split: isTreasurer ? included : true,
      cashbox_contribution: contributionInput ? (contributionInput.value.trim() || "0") : "0",
    };
  });
}

function participantsPayloadFromState() {
  return Array.from(state.boot?.session?.participants || []).map((participant) => ({
    id: participant.id,
    role: participant.role,
    display_name: participant.display_name,
    active: participant.active,
    included_in_split: participant.included_in_split,
    cashbox_contribution: participant.cashbox_contribution,
  }));
}

async function saveSessionMeta(extra = {}, options = {}) {
  const participants = $("participantsEditor") ? collectParticipantDrafts() : participantsPayloadFromState();
  const treasurerParticipantId = state.boot?.session?.treasurer_participant_id || participants[0]?.id || "";
  const payload = await api("save-session", {
    method: "POST",
    body: JSON.stringify({
      id: state.boot.session.id,
      title: $("sessionTitleInput")?.value.trim() || state.boot.session.title,
      currency: $("sessionCurrencyInput")?.value.trim() || state.boot.session.currency || "EUR",
      treasurer_expense_mode: "auto",
      treasurer_participant_id: treasurerParticipantId,
      participants,
      attachment_post_id: extra.attachment_post_id ?? state.boot.session.attachment_post_id ?? null,
      attachments: extra.attachments ?? state.boot.session.attachments ?? [],
    }),
  });
  state.boot = payload;
  state.treasurerDraft = normalizedText((payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id)?.notebook_text || "");
  saveCache(BOOT_CACHE_KEY, payload);
  localStorage.setItem(ENGAGED_KEY, "1");
  render({ preserveWorkspace: true });
  if (!options.silent) setFlash(t("saved"));
  return payload;
}

function mapCashboxAttachment(item) {
  return {
    id: item.id,
    file_path: item.filePath || item.file_path || "",
    type: item.type || "IMAGE",
    alt: item.altRu || item.alt || "",
    mime_type: item.mimeType || item.mime_type || "",
    created_at: item.createdAt || item.created_at || new Date().toISOString(),
  };
}

async function fetchCashboxMediaPost(postId) {
  return adminProxyApi(`/admin/posts/${encodeURIComponent(postId)}`, { method: "GET" });
}

async function ensureCashboxMediaPost() {
  if (!state.boot?.session) throw new Error(t("loadFailed"));
  const existingId = state.boot.session.attachment_post_id;
  if (existingId) return existingId;
  const session = state.boot.session;
  const slugBase = slugify(`${session.title}-${session.id}`) || session.id;
  const post = await adminProxyApi("/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: `ship-cashbox-${slugBase}`.slice(0, 96),
      titleRu: `Ship Cashbox / ${session.title}`,
      excerptRu: `Receipt media container for ${session.id}`,
      contentRu: `Technical media container for Ship Cashbox session ${session.id}.`,
      status: "DRAFT",
      allowComments: false,
      allowLikes: false,
      isPinned: false,
    }),
  });
  await saveSessionMeta({ attachment_post_id: post.id }, { silent: true });
  return post.id;
}

async function refreshCashboxAttachments(postId) {
  const post = await fetchCashboxMediaPost(postId);
  const attachments = Array.isArray(post.media) ? post.media.map(mapCashboxAttachment) : [];
  await saveSessionMeta({ attachment_post_id: post.id, attachments }, { silent: true });
}

function openAttachmentSheet() {
  const modal = $("attachmentSheet");
  if (!modal) return;
  lockModalScroll();
  modal.hidden = false;
}

function closeAttachmentSheet() {
  const modal = $("attachmentSheet");
  if (!modal) return;
  modal.hidden = true;
  unlockModalScroll();
}

function asciiBytes(text) {
  return new TextEncoder().encode(String(text || ""));
}

function joinBytes(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

async function rasterizeImageForPdf(file, options = {}) {
  const maxLongSide = options.maxLongSide || 1800;
  const quality = options.quality || 0.72;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(t("scanPdfFailed")));
      img.src = objectUrl;
    });
    const sourceWidth = image.naturalWidth || image.width || 1;
    const sourceHeight = image.naturalHeight || image.height || 1;
    const scale = Math.min(1, maxLongSide / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error(t("scanPdfFailed"));
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const jpegBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error(t("scanPdfFailed")));
      }, "image/jpeg", quality);
    });
    return {
      width,
      height,
      jpegBytes: new Uint8Array(await jpegBlob.arrayBuffer()),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildLightPdfFromImage({ jpegBytes, width, height }) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 24;
  const scale = Math.min((pageWidth - margin * 2) / width, (pageHeight - margin * 2) / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const offsetX = (pageWidth - drawWidth) / 2;
  const offsetY = (pageHeight - drawHeight) / 2;
  const content = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const contentBytes = asciiBytes(content);
  const objects = [
    asciiBytes("<< /Type /Catalog /Pages 2 0 R >>"),
    asciiBytes("<< /Type /Pages /Count 1 /Kids [3 0 R] >>"),
    asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`),
    joinBytes([
      asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      asciiBytes("endstream"),
    ]),
    joinBytes([
      asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      asciiBytes("\nendstream"),
    ]),
  ];

  const chunks = [joinBytes([asciiBytes("%PDF-1.4\n%"), new Uint8Array([226, 227, 207, 211]), asciiBytes("\n")])];
  const offsets = [0];
  let length = chunks[0].length;

  objects.forEach((objectBytes, index) => {
    offsets.push(length);
    const objectChunk = joinBytes([
      asciiBytes(`${index + 1} 0 obj\n`),
      objectBytes,
      asciiBytes("\nendobj\n"),
    ]);
    chunks.push(objectChunk);
    length += objectChunk.length;
  });

  const xrefOffset = length;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  offsets.slice(1).forEach((offset) => {
    xrefLines.push(`${String(offset).padStart(10, "0")} 00000 n `);
  });
  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(asciiBytes(`${xrefLines.join("\n")}\n${trailer}`));
  return joinBytes(chunks);
}

async function createLightPdfFile(file) {
  const rasterized = await rasterizeImageForPdf(file);
  const baseName = slugify(String(file.name || "").replace(/\.[^.]+$/, "")) || "receipt-scan";
  const pdfBytes = buildLightPdfFromImage(rasterized);
  return new File([pdfBytes], `${baseName}.pdf`, { type: "application/pdf" });
}

async function handleCashboxAttachmentFile(file, mode = "gallery") {
  if (!file) return;
  let uploadFile = file;
  if (mode === "scan") {
    setNotebookMeta("treasurerSaveMeta", t("scanPdfPreparing"));
    uploadFile = await createLightPdfFile(file);
  } else {
    setNotebookMeta("treasurerSaveMeta", t("uploadingPhoto"));
  }
  await uploadCashboxAttachment(uploadFile);
}

function bindAttachmentSheetUi() {
  $("attachmentGalleryButton")?.addEventListener("click", () => $("cashboxAttachmentGalleryInput")?.click());
  $("attachmentCameraButton")?.addEventListener("click", () => $("cashboxAttachmentCameraInput")?.click());
  $("attachmentScanButton")?.addEventListener("click", () => $("cashboxAttachmentScanInput")?.click());

  const bindInput = (id, mode) => {
    $(id)?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      closeAttachmentSheet();
      try {
        await handleCashboxAttachmentFile(file, mode);
        setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
        setFlash(t("photoAttached"));
      } catch (error) {
        setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
        setFlash(error.message || t(mode === "scan" ? "scanPdfFailed" : "uploadPhotoFailed"), true);
      }
    });
  };

  bindInput("cashboxAttachmentGalleryInput", "gallery");
  bindInput("cashboxAttachmentCameraInput", "camera");
  bindInput("cashboxAttachmentScanInput", "scan");
}

async function uploadCashboxAttachment(file) {
  const postId = await ensureCashboxMediaPost();
  const formData = new FormData();
  formData.append("file", file);
  await adminProxyApi(`/admin/posts/${encodeURIComponent(postId)}/media`, {
    method: "POST",
    body: formData,
  });
  await refreshCashboxAttachments(postId);
}

async function deleteCashboxAttachment(attachmentId) {
  const postId = state.boot?.session?.attachment_post_id;
  if (!postId || !attachmentId) return;
  await adminProxyApi(`/admin/posts/${encodeURIComponent(postId)}/media/${encodeURIComponent(attachmentId)}`, {
    method: "DELETE",
  });
  await refreshCashboxAttachments(postId);
}

function bindTreasurerUi() {
  $("createSessionButton")?.addEventListener("click", async () => {
    try {
      const payload = await api("create-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      state.boot = payload;
      saveCache(BOOT_CACHE_KEY, payload);
      render();
    } catch (error) {
      setFlash(error.message || t("loadFailed"));
    }
  });
  $("saveSessionButton")?.addEventListener("click", () => saveSessionMeta().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("shareToolButton")?.addEventListener("click", () => shareToolLink().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("openWorkspaceMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  $("quickInviteParticipantButton")?.addEventListener("click", openTeamInviteDraft);
  $("attachReceiptButton")?.addEventListener("click", openAttachmentSheet);
  $("addParticipantButton")?.addEventListener("click", () => addParticipantDraftRow());
  $("addParticipantButtonTop")?.addEventListener("click", () => addParticipantDraftRow());
  $("treasurerNotebook")?.addEventListener("input", () => {
    saveTreasurerDraft($("treasurerNotebook").value);
    setNotebookMeta("treasurerSaveMeta", t("autosavePending"));
    scheduleTreasurerAutosave();
  });
  $("treasurerNotebook")?.addEventListener("blur", () => {
    if (state.editorLocked) return;
    if (normalizedText(state.treasurerDraft || "") === normalizedText((state.boot?.session?.participants || []).find((participant) => participant.id === state.boot?.session?.treasurer_participant_id)?.notebook_text || "")) {
      setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
      return;
    }
    saveTreasurerNotebook({ preserveFocus: false, silent: true }).catch(() => {});
  });
  $("unlockNotebookButton")?.addEventListener("click", unlockNotebookEditor);
  document.querySelectorAll(".delete-attachment-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm(t("removePhotoConfirm"))) return;
      try {
        setNotebookMeta("treasurerSaveMeta", t("removingPhoto"));
        await deleteCashboxAttachment(button.dataset.attachmentId || "");
        setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
        setFlash(t("photoRemoved"));
      } catch (error) {
        setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
        setFlash(error.message || t("deletePhotoFailed"), true);
      }
    });
  });
  $("confirmSettlementButton")?.addEventListener("click", async () => {
    if (!window.confirm(t("confirmSettlement"))) return;
    try {
      const payload = await api("confirm-settlement", {
        method: "POST",
        body: JSON.stringify({ id: state.boot.session.id }),
      });
      state.boot = payload.active;
      saveCache(BOOT_CACHE_KEY, payload.active);
      localStorage.setItem(ENGAGED_KEY, "1");
      render();
      setFlash(t("sessionClosed"), true);
    } catch (error) {
      setFlash(error.message || t("loadFailed"), true);
    }
  });
  document.querySelectorAll(".reopen-session-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const payload = await api("reopen-session", {
          method: "POST",
          body: JSON.stringify({ id: button.dataset.id }),
        });
        state.boot = payload;
        saveCache(BOOT_CACHE_KEY, payload);
        render();
      } catch (error) {
        setFlash(error.message || t("activeCashboxExists"));
      }
    });
  });
  bindParticipantRowActions();
}

function bindParticipantRowActions() {
  refreshParticipantEditorUi();
  document.querySelectorAll(".split-inclusion-input").forEach((input) => {
    input.onchange = () => {
      refreshParticipantEditorUi();
    };
  });
  document.querySelectorAll(".remove-participant-btn").forEach((button) => {
    button.onclick = () => {
      button.closest(".shipcashbox-participant-row")?.remove();
      refreshParticipantEditorUi();
    };
  });
  document.querySelectorAll(".copy-invite-btn").forEach((button) => {
    button.onclick = async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.link || "");
        setFlash(t("copied"));
      } catch (error) {
        setFlash(button.dataset.link || "", true);
      }
    };
  });
  document.querySelectorAll(".share-invite-btn").forEach((button) => {
    button.onclick = async () => {
      const url = button.dataset.link || "";
      if (!navigator.share) {
        try {
          await navigator.clipboard.writeText(url);
          setFlash(t("copied"));
        } catch (error) {
          setFlash(url, true);
        }
        return;
      }
      try {
        await navigator.share({
          title: `${t("heroTitle")} - ${button.dataset.name || ""}`,
          text: t("heroIntro"),
          url,
        });
      } catch (error) {}
    };
  });
  document.querySelectorAll(".qr-invite-btn").forEach((button) => {
    button.onclick = () => openQrModal(button.dataset.name || "", button.dataset.link || "");
  });
}

function refreshParticipantEditorUi() {
  document.querySelectorAll(".shipcashbox-participant-row").forEach((row) => {
    const isTreasurer = row.dataset.participantRole === "treasurer" || row.dataset.isTreasurer === "1";
    const role = isTreasurer ? "treasurer" : "participant";
    row.dataset.participantRole = role;
    const label = row.querySelector(".shipcashbox-field span");
    if (label) label.textContent = role === "treasurer" ? t("treasurerSelfLabel") : t("participantNameLabel");
    const splitChoice = row.querySelector(".shipcashbox-choice--split");
    if (splitChoice) splitChoice.classList.toggle("is-hidden", role !== "treasurer");
    const splitInput = row.querySelector(".split-inclusion-input");
    if (splitInput && role !== "treasurer") {
      splitInput.checked = true;
    }
    const contributionInput = row.querySelector(".participant-contribution-input");
    const isAuthorized = row.dataset.authorized === "1";
    if (contributionInput) {
      contributionInput.disabled = false;
      contributionInput.title = role !== "treasurer" && !isAuthorized ? t("contributionPendingStillEditable") : "";
    }
    const removeBtn = row.querySelector(".remove-participant-btn");
    if (removeBtn) removeBtn.hidden = role === "treasurer";
  });
}

function addParticipantDraftRow({ focus = true } = {}) {
  const editor = $("participantsEditor");
  if (!editor) return null;
  const emptyDraft = Array.from(editor.querySelectorAll(".shipcashbox-participant-row--draft")).find((row) => {
    const name = row.querySelector(".participant-name-input")?.value.trim() || "";
    const contribution = row.querySelector(".participant-contribution-input")?.value.trim() || "0";
    return name === "" && (contribution === "" || contribution === "0");
  });
  const row = emptyDraft || (() => {
    const tempId = `draft-${Date.now()}`;
    editor.insertAdjacentHTML("beforeend", renderParticipantDraftRow(tempId));
    return Array.from(editor.querySelectorAll(".shipcashbox-participant-row")).find((item) => item.dataset.participantId === tempId);
  })();
  bindParticipantRowActions();
  if (focus) {
    window.requestAnimationFrame(() => row?.querySelector(".participant-name-input")?.focus({ preventScroll: true }));
  }
  return row;
}

function openTeamInviteDraft() {
  openWorkspaceModal("team");
  window.requestAnimationFrame(() => {
    addParticipantDraftRow();
    setFlash(t("inviteParticipantDraftReady"));
  });
}

function openQrModal(name, link) {
  lockModalScroll();
  $("qrModal").hidden = false;
  $("qrModalTitle").textContent = `${t("qrTitle")} ${name ? `- ${name}` : ""}`;
  $("qrModalEyebrow").textContent = t("qrEyebrow");
  $("qrCloseButton").textContent = t("close");
  $("qrModalLink").textContent = link;
  $("qrModalImage").src = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(link)}`;
}

function closeQrModal() {
  $("qrModal").hidden = true;
  $("qrModalImage").removeAttribute("src");
  unlockModalScroll();
}

function openWorkspaceModal(windowName = "menu", options = {}) {
  const payload = workspaceWindowPayload(windowName);
  if (!payload) return;
  lockModalScroll();
  $("workspaceModal").hidden = false;
  $("workspaceModal").dataset.window = windowName;
  $("workspaceModalMenuButton").textContent = t("workspaceMenuAction");
  $("workspaceCloseButton").textContent = t("close");
  $("workspaceModalEyebrow").textContent = payload.eyebrow;
  $("workspaceModalTitle").textContent = payload.title;
  $("workspaceModalBody").innerHTML = payload.body;
  $("workspaceModalBody").scrollTop = Number(options.scrollTop || 0);
  $("workspaceModalMenuButton").hidden = windowName === "menu";
  bindWorkspaceModalUi();
  bindInstallUi();
}

function closeWorkspaceModal() {
  $("workspaceModal").hidden = true;
  $("workspaceModal").dataset.window = "";
  $("workspaceModalBody").innerHTML = "";
  unlockModalScroll();
}

let pendingExitHref = "";

function openExitModal(href) {
  const modal = $("cashboxExitModal");
  if (!modal) {
    window.location.href = href;
    return;
  }
  pendingExitHref = href || "../index.html#hero";
  const email = readToolAuthEmail();
  $("cashboxExitEyebrow").textContent = t("cashboxExitEyebrow");
  $("cashboxExitTitle").textContent = t("cashboxExitTitle");
  $("cashboxExitText").textContent = t("cashboxExitText");
  $("cashboxExitAccount").textContent = tt("cashboxExitAccount", { email: email || t("cashboxExitCurrentSession") });
  $("cashboxExitStayButton").textContent = t("cashboxExitStay");
  $("cashboxExitConfirmButton").textContent = t("cashboxExitConfirm");
  lockModalScroll();
  modal.hidden = false;
}

function closeExitModal() {
  const modal = $("cashboxExitModal");
  if (!modal) return;
  modal.hidden = true;
  pendingExitHref = "";
  unlockModalScroll();
}

async function confirmCashboxExit() {
  const href = pendingExitHref || "../index.html#hero";
  try {
    if (state.viewer === "treasurer" && state.boot?.session) {
      const serverText = normalizedText((state.boot.session.participants || []).find((participant) => participant.id === state.boot.session.treasurer_participant_id)?.notebook_text || "");
      if (normalizedText(state.treasurerDraft || "") !== serverText) {
        await saveTreasurerNotebook({ preserveFocus: false, silent: true });
      }
    } else if (state.viewer === "participant" && participantHasUnsyncedChanges()) {
      await syncParticipant("manual", { silent: true });
    }
  } catch (error) {
    setFlash(error.message || t("loadFailed"), true);
    return;
  }
  window.location.href = href;
}

function closeHelpPopovers() {
  document.querySelectorAll("[data-help-root].is-open").forEach((root) => {
    root.classList.remove("is-open");
    const trigger = root.querySelector("[data-help-trigger]");
    const popover = root.querySelector(".shipcashbox-help-popover");
    if (trigger instanceof HTMLElement) trigger.setAttribute("aria-expanded", "false");
    if (popover instanceof HTMLElement) popover.hidden = true;
  });
}

function toggleHelpPopover(trigger) {
  if (!(trigger instanceof HTMLElement)) return;
  const root = trigger.closest("[data-help-root]");
  if (!(root instanceof HTMLElement)) return;
  const popover = root.querySelector(".shipcashbox-help-popover");
  if (!(popover instanceof HTMLElement)) return;
  const willOpen = !root.classList.contains("is-open");
  closeHelpPopovers();
  if (!willOpen) return;
  root.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  popover.hidden = false;
}

function bindWorkspaceModalUi() {
  $("workspaceShareToolButton")?.addEventListener("click", () => shareToolLink().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("shareLogButton")?.addEventListener("click", () => shareExpenseLog().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("printLogButton")?.addEventListener("click", printExpenseLog);
  $("saveSessionButton") && ($("saveSessionButton").onclick = () => saveSessionMeta().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("addParticipantButton") && ($("addParticipantButton").onclick = () => addParticipantDraftRow());
  $("addParticipantButtonTop") && ($("addParticipantButtonTop").onclick = () => addParticipantDraftRow());
  $("confirmSettlementButton") && ($("confirmSettlementButton").onclick = async () => {
    if (!window.confirm(t("confirmSettlement"))) return;
    try {
      const payload = await api("confirm-settlement", {
        method: "POST",
        body: JSON.stringify({ id: state.boot.session.id }),
      });
      state.boot = payload.active;
      saveCache(BOOT_CACHE_KEY, payload.active);
      localStorage.setItem(ENGAGED_KEY, "1");
      render();
      setFlash(t("sessionClosed"), true);
    } catch (error) {
      setFlash(error.message || t("loadFailed"), true);
    }
  });
  document.querySelectorAll(".reopen-session-btn").forEach((button) => {
    button.onclick = async () => {
      try {
        const payload = await api("reopen-session", {
          method: "POST",
          body: JSON.stringify({ id: button.dataset.id }),
        });
        state.boot = payload;
        saveCache(BOOT_CACHE_KEY, payload);
        render();
      } catch (error) {
        setFlash(error.message || t("activeCashboxExists"));
      }
    };
  });
  if ($("participantsEditor")) {
    bindParticipantRowActions();
  }
  document.querySelectorAll("[data-workspace-window]").forEach((button) => {
    button.addEventListener("click", () => openWorkspaceModal(button.dataset.workspaceWindow || "menu"));
  });
}

async function shareOrCopy({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (error) {}
  }

  const fallback = [text, url].filter(Boolean).join("\n");
  try {
    await navigator.clipboard.writeText(fallback);
    setFlash(t("copied"));
    return true;
  } catch (error) {
    setFlash(fallback, true);
    return false;
  }
}

async function shareToolLink() {
  await shareOrCopy({
    title: t("heroTitle"),
    text: t("shareToolText"),
    url: toolShareUrl(),
  });
}

function buildExpenseLogShareText() {
  if (!state.boot?.session) return "";
  const { session } = state.boot;
  const totals = session.totals || {};
  const lines = [
    `Vetus Nauta / ${t("heroTitle")}`,
    session.title,
    `${t("summaryCash")}: ${money(totals.cashbox_balance, session.currency, true)}`,
    `${t("summaryExpenses")}: ${money(totals.total_expenses, session.currency)}`,
    "",
    t("logTitle"),
  ];

  (session.participants || []).forEach((participant) => {
    lines.push("");
    lines.push(participant.display_name);
    if (!(participant.entries || []).length) {
      lines.push(`- ${t("emptyLines")}`);
      return;
    }
    participant.entries.forEach((entry) => {
      lines.push(entry.raw_text || entry.note || "");
    });
  });

  return lines.join("\n");
}

async function shareExpenseLog() {
  const text = buildExpenseLogShareText();
  if (!text) return;
  await shareOrCopy({
    title: `${t("heroTitle")} - ${t("logTitle")}`,
    text,
    url: "",
  });
  setFlash(t("shareLogDone"));
}

function buildExpenseLogPrintHtml() {
  if (!state.boot?.session) return "";

  const { session } = state.boot;
  const totals = session.totals || {};
  const participants = session.participants || [];
  const bodyHtml = `
    <section class="summary-grid">
      <div class="summary-card"><span>${escapeHtml(t("summaryCash"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
      <div class="summary-card"><span>${escapeHtml(t("summaryContributions"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
      <div class="summary-card"><span>${escapeHtml(t("summaryExpenses"))}</span><strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong></div>
      <div class="summary-card"><span>${escapeHtml(t("summaryShare"))}</span><strong>${escapeHtml(money(totals.share, session.currency))}</strong></div>
    </section>
    <section class="block">
      <h2>${escapeHtml(t("logDiagram"))}</h2>
      <p>${escapeHtml(t("logDiagramText"))}</p>
      ${renderExpenseDiagram(participants, session.currency, { print: true })}
    </section>
    <section class="block">
      <h2>${escapeHtml(t("logTreeTitle"))}</h2>
      <p>${escapeHtml(t("logText"))}</p>
      <div class="tree-grid">${renderPrintLogGroups(participants)}</div>
    </section>
  `;

  return buildCashboxPrintDocument({
    title: `${session.title} / ${t("logTitle")}`,
    subtitle: `${t("logText")} ${t("logDiagramText")}`,
    bodyHtml,
  });
}

function printExpenseLog() {
  const docHtml = buildExpenseLogPrintHtml();
  if (!docHtml || openCashboxPrintWindow(docHtml)) return;
  setFlash(t("printOpenFailed"), true);
}

function stopTreasurerAutosave() {
  if (state.treasurerAutosaveTimer) {
    window.clearTimeout(state.treasurerAutosaveTimer);
    state.treasurerAutosaveTimer = null;
  }
}

function stopParticipantSchedule() {
  if (state.participantSyncTimer) {
    window.clearInterval(state.participantSyncTimer);
    state.participantSyncTimer = null;
  }
}

function currentScheduleSlotId(date = new Date()) {
  const slot = SYNC_SLOTS.find((item) => item.hour === date.getHours() && Math.abs(item.minute - date.getMinutes()) <= 1);
  if (!slot) return null;
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return `${dateKey}_${slot.label}`;
}

async function syncParticipant(syncSource = "manual", { silent = false } = {}) {
  const participant = state.participant?.participant;
  if (!participant || participant.read_only) return null;
  const notebookText = normalizedText(state.participantDraft || participant.notebook_text || "");
  const response = await api("participant-save", {
    method: "POST",
    body: JSON.stringify({
      token: participant.invite_token,
      notebook_text: notebookText,
      sync_source: syncSource,
    }),
  });

  if (response.sync_result === "noop") {
    state.participant = response;
    state.participantDraft = notebookText;
    saveCache(`${PARTICIPANT_CACHE_PREFIX}${participant.invite_token}`, response);
    if (!silent) setFlash(t("syncNoChanges"));
    render();
    return response;
  }

  state.participant = response;
  state.participantDraft = normalizedText(response.participant.notebook_text || "");
  try {
    localStorage.setItem(participantDraftKey(participant.invite_token), state.participantDraft);
  } catch (error) {}
  saveCache(`${PARTICIPANT_CACHE_PREFIX}${participant.invite_token}`, response);
  localStorage.setItem(ENGAGED_KEY, "1");
  render();
  if (!silent) setFlash(t("saved"));
  return response;
}

function maybeRunScheduledParticipantSync() {
  const participant = state.participant?.participant;
  if (!participant || participant.read_only) return;
  const slotId = currentScheduleSlotId(new Date());
  if (!slotId) return;
  const slotKey = participantSlotKey(participant.invite_token, slotId);
  if (localStorage.getItem(slotKey)) return;
  localStorage.setItem(slotKey, new Date().toISOString());
  if (!participantHasUnsyncedChanges()) return;
  if (!navigator.onLine) return;
  syncParticipant("scheduled", { silent: true }).catch(() => {});
}

function startParticipantSchedule() {
  stopParticipantSchedule();
  const participant = state.participant?.participant;
  if (!participant || participant.read_only) return;
  maybeRunScheduledParticipantSync();
  state.participantSyncTimer = window.setInterval(maybeRunScheduledParticipantSync, 30000);
}

function bindInstallUi() {
  $("dismissInstallBtn")?.addEventListener("click", () => {
    localStorage.setItem(DISMISSED_INSTALL_KEY, "1");
    render();
  });
  $("installAppBtn")?.addEventListener("click", async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice.catch(() => null);
    state.installPrompt = null;
    localStorage.setItem(DISMISSED_INSTALL_KEY, "1");
    render();
  });
}

async function loadTreasurerBoot() {
  stopParticipantSchedule();
  stopTreasurerAutosave();
  resetEditorLock();
  state.viewer = "treasurer";
  state.participant = null;
  state.participantDraft = "";
  try {
    const payload = await api("boot");
    state.boot = payload;
    state.treasurerDraft = loadTreasurerDraft(payload.session?.id, (payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id)?.notebook_text || "");
    saveCache(BOOT_CACHE_KEY, payload);
    render();
  } catch (error) {
    const cached = loadCache(BOOT_CACHE_KEY);
    if (cached) {
      state.boot = cached;
      state.treasurerDraft = loadTreasurerDraft(cached.session?.id, (cached.session?.participants || []).find((participant) => participant.id === cached.session?.treasurer_participant_id)?.notebook_text || "");
      render();
      setFlash(t("offlineCache"), true);
      return;
    }
    state.boot = null;
    state.treasurerDraft = "";
    state.viewer = "guest";
    render();
    setFlash(error.message || t("loadFailed"), true);
  }
}

async function loadParticipant(token) {
  stopParticipantSchedule();
  stopTreasurerAutosave();
  resetEditorLock();
  state.viewer = "participant";
  state.boot = null;
  state.treasurerDraft = "";
  try {
    const payload = await api(`participant&token=${encodeURIComponent(token)}`);
    state.participant = payload;
    state.participantDraft = loadParticipantDraft(token, payload.participant.notebook_text, payload.participant.read_only);
    saveCache(`${PARTICIPANT_CACHE_PREFIX}${token}`, payload);
    render();
    startParticipantSchedule();
  } catch (error) {
    const cached = loadCache(`${PARTICIPANT_CACHE_PREFIX}${token}`);
    if (cached) {
      state.participant = cached;
      state.participantDraft = loadParticipantDraft(token, cached.participant.notebook_text, cached.participant.read_only);
      render();
      startParticipantSchedule();
      setFlash(t("offlineCache"), true);
      return;
    }
    state.viewer = "guest";
    state.participant = null;
    render();
    setFlash(error.message || t("noParticipant"), true);
  }
}

async function checkViewer() {
  state.inviteToken = new URLSearchParams(window.location.search).get("invite") || "";
  if (state.inviteToken) {
    await loadParticipant(state.inviteToken);
    return;
  }

  try {
    const me = await api("me");
    if (me.authenticated) {
      await loadTreasurerBoot();
      return;
    }
  } catch (error) {}

  stopParticipantSchedule();
  stopTreasurerAutosave();
  resetEditorLock();
  state.viewer = "guest";
  state.boot = null;
  state.participant = null;
  state.participantDraft = "";
  state.treasurerDraft = "";
  render();
}

function render(options = {}) {
  const shouldPreserveWorkspace = options.preserveWorkspace && isModalOpen("workspaceModal");
  const preservedWorkspaceWindow = shouldPreserveWorkspace ? ($("workspaceModal")?.dataset.window || "menu") : "";
  const preservedWorkspaceScroll = shouldPreserveWorkspace ? ($("workspaceModalBody")?.scrollTop || 0) : 0;
  applyTheme();
  updateTopbarText();
  if (!shouldPreserveWorkspace) {
    closeWorkspaceModal();
  }
  if (!notebookCanLock()) {
    state.editorLocked = false;
  }
  $("guestView").hidden = state.viewer !== "guest";
  $("treasurerView").hidden = state.viewer !== "treasurer";
  $("participantView").hidden = state.viewer !== "participant";

  if (state.viewer === "treasurer") {
    stopParticipantSchedule();
    renderTreasurer();
  } else if (state.viewer === "participant") {
    stopTreasurerAutosave();
    renderParticipant();
  } else {
    stopParticipantSchedule();
    stopTreasurerAutosave();
    renderGuest();
  }
  if (shouldPreserveWorkspace) {
    window.requestAnimationFrame(() => {
      openWorkspaceModal(preservedWorkspaceWindow, { scrollTop: preservedWorkspaceScroll });
    });
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").then((registration) => {
    registration.update().catch(() => {});
  }).catch(() => {});
}

function initLanguage() {
  syncLanguageState(localStorage.getItem(LANGUAGE_KEY));
  document.addEventListener("languageChanged", (event) => {
    syncLanguageState(event.detail?.lang);
    render();
  });
}

function waitForSiteTranslations() {
  if (currentTranslations().heroTitle) {
    syncLanguageState(localStorage.getItem(LANGUAGE_KEY));
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const onLanguage = (event) => {
      syncLanguageState(event.detail?.lang);
      document.removeEventListener("languageChanged", onLanguage);
      resolve();
    };
    document.addEventListener("languageChanged", onLanguage);
    window.setTimeout(() => {
      document.removeEventListener("languageChanged", onLanguage);
      syncLanguageState(localStorage.getItem(LANGUAGE_KEY));
      resolve();
    }, 1200);
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  render();
});

window.addEventListener("online", () => {
  render();
  maybeRunScheduledParticipantSync();
});
window.addEventListener("offline", () => render());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    state.hiddenAt = Date.now();
    return;
  }
  if (!state.hiddenAt) return;
  if ((Date.now() - state.hiddenAt) >= EDITOR_PAUSE_LOCK_MS) {
    lockNotebookEditor();
  }
  state.hiddenAt = 0;
  render();
});
window.addEventListener("pagehide", () => {
  state.hiddenAt = Date.now();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement) {
    const trigger = target.closest("[data-help-trigger]");
    if (trigger instanceof HTMLElement) {
      event.preventDefault();
      event.stopPropagation();
      toggleHelpPopover(trigger);
      return;
    }
    if (!target.closest("[data-help-root]")) {
      closeHelpPopovers();
    }
  }
  if (target instanceof HTMLElement && target.dataset.closeQr === "1") {
    closeQrModal();
  }
  if (target instanceof HTMLElement && target.dataset.closeAttachment === "1") {
    closeAttachmentSheet();
  }
  if (target instanceof HTMLElement && target.dataset.closeWorkspace === "1") {
    closeWorkspaceModal();
  }
  if (target instanceof HTMLElement && target.dataset.closeExit === "1") {
    closeExitModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeHelpPopovers();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  $("workspaceModalMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  document.querySelector(".topbar .brand")?.addEventListener("click", (event) => {
    event.preventDefault();
    openExitModal(event.currentTarget?.getAttribute("href") || "../index.html#hero");
  });
  $("backToMainSite")?.addEventListener("click", (event) => {
    event.preventDefault();
    openExitModal($("backToMainSite")?.getAttribute("href") || "../index.html#hero");
  });
  $("backToNavDesk")?.addEventListener("click", (event) => {
    event.preventDefault();
    openExitModal($("backToNavDesk")?.getAttribute("href") || "../navdesk.html");
  });
  $("cashboxExitStayButton")?.addEventListener("click", closeExitModal);
  $("cashboxExitConfirmButton")?.addEventListener("click", () => {
    confirmCashboxExit().catch((error) => setFlash(error.message || t("loadFailed"), true));
  });
  bindAttachmentSheetUi();
  initLanguage();
  await waitForSiteTranslations();
  registerServiceWorker();
  await checkViewer();
});
