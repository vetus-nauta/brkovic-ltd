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
const SHELL_VERSION = "20260602-cashbox-debt-pdf-01";
const SHELL_REFRESH_KEY = "ship_cashbox_shell_refresh_v1";
const SHELL_PURGE_KEY = "ship_cashbox_shell_purge_v1";
const PARTICIPANT_CACHE_PREFIX = "ship_cashbox_participant_cache_v1_";
const PARTICIPANT_DRAFT_PREFIX = "ship_cashbox_participant_draft_v1_";
const PARTICIPANT_SLOT_PREFIX = "ship_cashbox_participant_slot_v1_";
const TREASURER_DRAFT_PREFIX = "ship_cashbox_treasurer_draft_v1_";
const API_TIMEOUT_MS = 18000;
const AUTH_TIMEOUT_MS = 12000;
const UPLOAD_TIMEOUT_MS = 90000;
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
let notebookFocusTimer = 0;
let viewerRefreshTimer = 0;
let viewerCheckPromise = null;

function isModalOpen(id) {
  const modal = $(id);
  return Boolean(modal && !modal.hidden);
}

function anyModalOpen() {
  const appMenu = $("cashboxAppMenuModal");
  const isAppMenuOpen = Boolean(appMenu?.classList.contains("is-open"));
  return isModalOpen("qrModal") || isModalOpen("attachmentSheet") || isModalOpen("workspaceModal") || isModalOpen("cashboxExitModal") || isAppMenuOpen;
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

function updateViewportVars() {
  const viewport = window.visualViewport;
  const height = Math.max(320, Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0));
  const offsetTop = Math.round(viewport?.offsetTop || 0);
  const keyboardOffset = Math.max(0, Math.round((window.innerHeight || height) - height - offsetTop));
  document.documentElement.style.setProperty("--cashbox-vvh", `${height}px`);
  document.documentElement.style.setProperty("--cashbox-keyboard-offset", `${keyboardOffset}px`);
  document.body.classList.toggle("shipcashbox-keyboard-active", keyboardOffset > 80);
}

function scheduleFocusedNotebookIntoView(target) {
  window.clearTimeout(notebookFocusTimer);
  notebookFocusTimer = window.setTimeout(() => {
    if (!(target instanceof HTMLElement) || document.activeElement !== target) return;
    target.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, 260);
}

function bindMobileKeyboardViewport() {
  updateViewportVars();
  window.visualViewport?.addEventListener("resize", updateViewportVars);
  window.visualViewport?.addEventListener("scroll", updateViewportVars);
  window.addEventListener("resize", updateViewportVars);
  document.addEventListener("pointerdown", (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains("shipcashbox-notebook-textarea")) return;
    document.body.classList.remove("shipcashbox-notebook-focused");
    updateViewportVars();
  }, { passive: true });
  document.addEventListener("focusin", (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("shipcashbox-notebook-textarea")) return;
    document.body.classList.add("shipcashbox-notebook-focused");
    updateViewportVars();
    scheduleFocusedNotebookIntoView(event.target);
  });
  document.addEventListener("focusout", (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("shipcashbox-notebook-textarea")) return;
    document.body.classList.remove("shipcashbox-notebook-focused");
    updateViewportVars();
  });
}

function bindNotebookKeyboardTarget(textarea) {
  if (!(textarea instanceof HTMLElement)) return;
  const activateNotebookKeyboardMode = () => {
    document.body.classList.add("shipcashbox-notebook-focused");
    updateViewportVars();
    scheduleFocusedNotebookIntoView(textarea);
  };
  textarea.addEventListener("pointerdown", activateNotebookKeyboardMode, { passive: true });
  textarea.addEventListener("touchstart", activateNotebookKeyboardMode, { passive: true });
  textarea.addEventListener("mousedown", activateNotebookKeyboardMode);
  textarea.addEventListener("focus", activateNotebookKeyboardMode);
  textarea.addEventListener("blur", () => {
    document.body.classList.remove("shipcashbox-notebook-focused");
    updateViewportVars();
  });
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

function tx(key, fallback = "") {
  return currentTranslations()[key] || fallback || key;
}

function txf(key, fallback = "", replacements = {}) {
  let text = tx(key, fallback);
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

function moneyRound(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
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

function hasActiveGroup() {
  const session = activeSession();
  return Boolean(session && session.status === "active");
}

function groupWindowForViewer() {
  if (!hasActiveGroup()) return "menu";
  if (state.viewer === "treasurer") return "team";
  if (state.viewer === "participant") return "participant-settlement";
  return "menu";
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

function participantDisplayName(participant, fallback = "") {
  const name = String(participant?.display_name || "").trim();
  if (name) return name;
  const email = String(participant?.email || "").trim();
  if (email) return email;
  return fallback;
}

function currentViewerDisplayLabel() {
  if (state.viewer === "treasurer") {
    const session = state.boot?.session;
    const treasurer = (session?.participants || []).find((participant) => participant.id === session?.treasurer_participant_id);
    return participantDisplayName(treasurer, t("viewerTreasurer"));
  }
  if (state.viewer === "participant") {
    return participantDisplayName(state.participant?.participant, t("viewerParticipant"));
  }
  return t("viewerGuest");
}

function syncAppModeClasses() {
  const active = hasActiveGroup();
  document.body.classList.toggle("shipcashbox-has-active-group", active);
  document.body.classList.toggle("shipcashbox-viewer-treasurer", state.viewer === "treasurer");
  document.body.classList.toggle("shipcashbox-viewer-participant", state.viewer === "participant");
  document.body.classList.toggle("shipcashbox-viewer-guest", state.viewer === "guest");
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

function readToolAuthProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("brkovic_tool_auth_session_v1") || "null");
    return profile && typeof profile === "object" ? profile : null;
  } catch (error) {
    return null;
  }
}

function clearToolAuthProfile() {
  try {
    localStorage.removeItem("brkovic_tool_auth_session_v1");
  } catch (error) {}
}

function toolAccountInitial(profile) {
  const source = String(profile?.displayName || profile?.email || "B").trim();
  return (source[0] || "B").toUpperCase();
}

function languageOptions() {
  const api = window.BRKOVIC_LANGUAGE;
  const raw = api && typeof api.getLanguageOptions === "function"
    ? api.getLanguageOptions()
    : window.BRKOVIC_LANGUAGE_OPTIONS;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      code: String(item?.code || "").trim().toLowerCase(),
      name: String(item?.name || item?.label || "").trim(),
      isAvailable: item?.isAvailable !== false,
    }))
    .filter((item) => item.code && item.name);
}

function languageName(code) {
  const normalized = normalizeToolLang(code) || state.lang;
  return languageOptions().find((item) => item.code === normalized)?.name || normalized.toUpperCase();
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
  @page { size: A4 landscape; margin: 7mm; }
  html, body { margin: 0; padding: 0; background: #fff; color: #10243a; font-family: Inter, Arial, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 100%; min-height: 196mm; box-sizing: border-box; display:flex; flex-direction:column; }
  .print-body { flex: 1 1 auto; }
  .header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding-bottom:5px; border-bottom:1px solid rgba(16,36,58,.13); }
  .brand { min-width:0; flex:1; }
  .titles { min-width:0; flex:1; }
  .eyebrow { margin:0 0 2px; font-size:7px; letter-spacing:.16em; text-transform:uppercase; color:rgba(16,36,58,.56); }
  .title { margin:0; font-size:16px; line-height:1.04; font-weight:900; letter-spacing:-.018em; }
  .subtitle { margin:2px 0 0; font-size:8px; line-height:1.25; color:rgba(16,36,58,.7); max-width:170mm; }
  .motto { margin:0; padding-top:3px; font-size:8.5px; line-height:1.25; font-style:italic; color:rgba(16,36,58,.7); white-space:nowrap; }
  .summary-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:7px; margin-top:7px; }
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
  .fill--personal { background:#d38a2c; }
  .fill--cashbox { background:#7856a5; }
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
  .debt-board { margin-top:7px; padding:7px; border:1px solid rgba(16,36,58,.14); border-radius:12px; background:linear-gradient(135deg, rgba(255,255,255,.96), rgba(246,248,251,.92)); box-shadow:0 6px 18px rgba(14,33,62,.045); break-inside:avoid; page-break-inside:avoid; }
  .debt-hero { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .debt-hero h2 { margin:0; font-size:17px; line-height:1.02; font-weight:900; letter-spacing:-.022em; color:#071b36; }
  .debt-hero p { margin:2px 0 0; color:#5e6b80; font-size:8.5px; line-height:1.2; }
  .debt-top-button { flex:0 0 auto; border:1px solid rgba(16,36,58,.14); background:#fff; border-radius:9px; padding:5px 10px; font-size:8.5px; line-height:1.1; font-weight:900; color:#08213f; box-shadow:0 3px 10px rgba(14,33,62,.045); }
  .debt-summary { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px; margin-top:7px; }
  .debt-summary-card { border:1px solid rgba(16,36,58,.13); border-radius:9px; background:#fff; padding:6px 7px; display:grid; grid-template-columns:19px 1fr auto; gap:5px; align-items:center; break-inside:avoid; page-break-inside:avoid; }
  .debt-summary-card b { font-size:8.8px; line-height:1.12; }
  .debt-summary-card small { display:block; margin-top:1px; font-size:7.2px; line-height:1.16; color:rgba(16,36,58,.62); }
  .debt-summary-card strong { font-size:10.4px; line-height:1.1; }
  .debt-summary-card--info { grid-template-columns:19px 1fr; }
  .debt-round { width:18px; height:18px; border-radius:50%; display:inline-grid; place-items:center; font-size:8.3px; font-weight:950; background:#eef1f5; color:#10243a; }
  .debt-summary-card--bad .debt-round { background:#fff0f0; color:#e21b1b; }
  .debt-summary-card--good .debt-round { background:#e9f8ef; color:#149557; }
  .debt-summary-card--info .debt-round { background:#eef5ff; color:#1764e8; }
  .debt-summary-card--bad strong { color:#b93a31; }
  .debt-summary-card--good strong { color:#2f7557; }
  .debt-matrix-block { margin-top:7px; border:1px solid rgba(16,36,58,.13); border-radius:9px; overflow:hidden; background:#fff; break-inside:avoid; page-break-inside:avoid; }
  .debt-matrix { width:100%; border-collapse:collapse; table-layout:fixed; font-size:7.2px; }
  .debt-matrix th, .debt-matrix td { border-right:1px solid rgba(16,36,58,.1); border-bottom:1px solid rgba(16,36,58,.1); padding:3px 2.5px; vertical-align:middle; text-align:center; height:20px; }
  .debt-matrix th { background:#f7f8f4; font-weight:800; color:rgba(16,36,58,.76); }
  .debt-matrix th:first-child, .debt-matrix td:first-child { text-align:left; width:24mm; }
  .debt-person { display:flex; align-items:center; gap:3px; min-width:0; }
  .debt-person span:last-child { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .debt-avatar { flex:0 0 auto; width:13px; height:13px; border-radius:50%; display:inline-grid; place-items:center; font-size:5.4px; font-weight:900; color:#10243a; background:#dfe8f5; }
  .debt-avatar--0 { background:#dfe5ff; }
  .debt-avatar--1 { background:#e0f0ef; }
  .debt-avatar--2 { background:#ffe6ba; }
  .debt-avatar--3 { background:#e8e2ff; }
  .debt-avatar--4 { background:#d9f1f4; }
  .debt-avatar--5 { background:#f5dddf; }
  .debt-avatar--6 { background:#e8edda; }
  .debt-avatar--7 { background:#e6e0d7; }
  .debt-chip { display:inline-block; padding:2px 4px; border-radius:6px; background:#fff0ee; color:#b93a31; font-weight:900; white-space:nowrap; }
  .debt-empty { color:rgba(16,36,58,.35); }
  .debt-total { font-weight:900; }
  .debt-total--bad { color:#b93a31; }
  .debt-total--good { color:#2f7557; }
  .debt-total small { display:block; margin-top:1px; font-size:5.8px; line-height:1.02; color:rgba(16,36,58,.58); }
  .debt-total-row th, .debt-total-row td { background:#fbfbf8; font-weight:900; }
  .debt-transfers { margin-top:7px; border:1px solid rgba(16,36,58,.13); border-radius:9px; background:#fbfbf8; padding:7px; break-inside:avoid; page-break-inside:avoid; }
  .debt-transfers h2 { margin:0 0 5px; font-size:10.4px; }
  .debt-transfer-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px; }
  .debt-transfer { display:grid; grid-template-columns:1fr auto 1fr; gap:4px; align-items:center; border:1px solid rgba(16,36,58,.1); border-radius:7px; background:#fff; padding:5px; min-height:28px; }
  .debt-transfer b { font-size:7.4px; line-height:1.1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .debt-transfer em { font-style:normal; font-weight:900; color:rgba(16,36,58,.55); }
  .debt-transfer strong { grid-column:1/-1; color:#b93a31; font-size:8.8px; line-height:1.05; }
  .debt-transfer-note { border:1px solid rgba(47,117,87,.18); border-radius:7px; background:#edf8f2; color:#255d47; padding:5px 6px; font-size:7.5px; line-height:1.2; font-weight:800; }
  .footer { margin-top:auto; padding-top:5px; border-top:1px solid rgba(16,36,58,.14); display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:7.2px; line-height:1.25; color:rgba(16,36,58,.68); }
  .footer-brand { display:flex; align-items:center; gap:8px; min-width:0; }
  .footer-logo { width:92px; height:auto; display:block; }
  .footer-copy { display:grid; gap:1px; min-width:0; }
  .footer-copy strong { font-size:7.8px; color:rgba(16,36,58,.82); }
  .footer-copy span { max-width:165mm; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .footer-date { white-space:nowrap; }
</style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <div class="brand">
        <div class="titles">
          <p class="eyebrow">Vetus Nauta</p>
          <h1 class="title">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
      </div>
      <p class="motto">Have a good watch Captain!</p>
    </header>
    <div class="print-body">${bodyHtml}</div>
    <footer class="footer">
      <div class="footer-brand">
        <img class="footer-logo" src="${PRINT_LOGO_SRC}" alt="Vetus Nauta — Brkovic">
        <div class="footer-copy">
          <strong>Vetus Nauta — Brkovic</strong>
          <span>${escapeHtml(subtitle || title)}</span>
        </div>
      </div>
      <span class="footer-date">${escapeHtml(formatDateTime(new Date().toISOString()))}</span>
    </footer>
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

function clearTreasurerDraft(sessionId) {
  state.treasurerDraft = "";
  if (!sessionId) return;
  try {
    localStorage.removeItem(treasurerDraftKey(sessionId));
  } catch (error) {}
}

async function api(action, options = {}) {
  const [name, query = ""] = String(action).split(/(?=&)/, 2);
  const { timeoutMs = API_TIMEOUT_MS, ...fetchOptions } = options;
  const response = await fetchWithTimeout(`${API_BASE}${encodeURIComponent(name)}${query}`, {
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...fetchOptions,
  }, timeoutMs);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(t("requestTimeout"));
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

async function adminProxyApi(path, options = {}) {
  const { timeoutMs = UPLOAD_TIMEOUT_MS, ...fetchOptions } = options;
  const response = await fetchWithTimeout(`${ADMIN_API_BASE}${path}`, {
    credentials: "same-origin",
    ...fetchOptions,
    headers: { ...(fetchOptions.headers || {}) },
  }, timeoutMs);
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

async function purgeLegacyShellCaches() {
  if (localStorage.getItem(SHELL_PURGE_KEY) === SHELL_VERSION) return;
  await clearShipCashboxCaches();
  try {
    localStorage.setItem(SHELL_PURGE_KEY, SHELL_VERSION);
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

function setButtonBusy(button, busy, busyText = "") {
  if (!(button instanceof HTMLButtonElement)) return;
  if (!button.dataset.idleText) button.dataset.idleText = button.textContent || "";
  button.disabled = Boolean(busy);
  button.setAttribute("aria-busy", busy ? "true" : "false");
  button.classList.toggle("is-busy", Boolean(busy));
  button.textContent = busy ? (busyText || t("autosaveSaving")) : button.dataset.idleText;
}

async function runButtonAction(button, busyText, action) {
  if (!(button instanceof HTMLButtonElement) || button.disabled) return;
  setButtonBusy(button, true, busyText);
  try {
    await action();
  } finally {
    setButtonBusy(button, false);
  }
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
  document.querySelectorAll("[data-cashbox-theme]").forEach((button) => {
    const active = button.dataset.cashboxTheme === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function isStandalonePwa() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function resolvedAppUrl(href) {
  return new URL(href || "../navdesk.html", window.location.href).toString();
}

function isNavDeskHref(href) {
  try {
    return new URL(href || "../navdesk.html", window.location.href).pathname.endsWith("/navdesk.html");
  } catch (error) {
    return false;
  }
}

function sameOriginOpener() {
  try {
    if (!window.opener || window.opener.closed) return null;
    if (window.opener.location.origin !== window.location.origin) return null;
    return window.opener;
  } catch (error) {
    return null;
  }
}

function returnToNavDesk(href = "../navdesk.html") {
  const url = resolvedAppUrl(href);
  const opener = sameOriginOpener();
  if (opener) {
    try {
      if (!opener.location.pathname.endsWith("/navdesk.html")) {
        opener.location.href = url;
      }
      opener.focus();
    } catch (error) {
      window.location.href = url;
      return;
    }
    window.close();
    if (!window.closed) {
      window.location.href = url;
    }
    return;
  }
  const navdeskWindow = window.open(url, "brkovic_navdesk", "noopener");
  if (!navdeskWindow) {
    window.location.href = url;
  }
}

function updateTopbarText() {
  document.documentElement.lang = state.lang;
  if ($("appbarTitle")) $("appbarTitle").textContent = t("heroTitle");
  if ($("cashboxAppMenuButtonText")) $("cashboxAppMenuButtonText").textContent = t("cashboxAppMenuButton");
  if ($("cashboxMobileMenuButtonText")) $("cashboxMobileMenuButtonText").textContent = t("cashboxAppMenuButton");
  if ($("cashboxAppMenuEyebrow")) $("cashboxAppMenuEyebrow").textContent = t("heroTitle");
  if ($("cashboxAppMenuTitle")) $("cashboxAppMenuTitle").textContent = t("workspaceMenuTitle");
  if ($("cashboxMenuNavdesk")) $("cashboxMenuNavdesk").textContent = t("cashboxMenuNavdesk");
  if ($("cashboxMenuWorkspace")) $("cashboxMenuWorkspace").textContent = t("workspaceMenuTitle");
  if ($("cashboxMenuGroupText")) $("cashboxMenuGroupText").textContent = t("cashboxMenuGroup");
  if ($("cashboxMenuInstall")) $("cashboxMenuInstall").textContent = t("pwa_install_menu");
  if ($("cashboxLanguageKicker")) $("cashboxLanguageKicker").textContent = t("cashboxMenuLanguage");
  if ($("cashboxLanguageTitle")) $("cashboxLanguageTitle").textContent = t("site_menu_language_title");
  if ($("cashboxLanguageNowLabel")) $("cashboxLanguageNowLabel").textContent = t("site_menu_language_current_label");
  if ($("cashboxThemeLabel")) $("cashboxThemeLabel").textContent = t("cashboxMenuTheme");
  if ($("heroEyebrow")) $("heroEyebrow").textContent = t("heroEyebrow");
  if ($("heroTitle")) $("heroTitle").textContent = t("heroTitle");
  if ($("heroIntro")) $("heroIntro").textContent = t("heroIntro");
  if ($("heroDescription")) $("heroDescription").textContent = t("heroDescription");
  if ($("mobileMastheadTitle")) $("mobileMastheadTitle").textContent = t("heroTitle");
  if ($("openMainSiteNew")) $("openMainSiteNew").textContent = t("backToMainSite");
  if ($("backToMainSite")) $("backToMainSite").textContent = t("backToMainSite");
  if ($("backToNavDesk")) $("backToNavDesk").textContent = t("backToNavDesk");
  if ($("cashboxExitStayButton")) $("cashboxExitStayButton").textContent = t("cashboxExitStay");
  if ($("cashboxExitConfirmButton")) $("cashboxExitConfirmButton").textContent = t("cashboxExitConfirm");
  if ($("onlineStatus")) $("onlineStatus").textContent = navigator.onLine ? t("online") : t("offline");
  if ($("viewerBadge")) $("viewerBadge").textContent = currentViewerDisplayLabel();
  if ($("footerText")) $("footerText").textContent = t("footerText");
  if ($("currentYear")) $("currentYear").textContent = new Date().getFullYear();
  document.title = t("pageTitle");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("pageDescription"));
  document.querySelectorAll(".lang-switch__btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
  });
  renderAppMenuLanguage();
  renderAppMenuAccount();
  renderAppMenuGroup();
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

function renderNotebookFooter({ label, value, actionHtml = "", statusId = "", statusText = "" }) {
  return `
    <div class="shipcashbox-notebook-footer">
      <div class="shipcashbox-notebook-footer__actions">${actionHtml}</div>
      ${statusId || statusText ? `<p class="shipcashbox-notebook-footer__status" ${statusId ? `id="${escapeHtml(statusId)}"` : ""}>${escapeHtml(statusText)}</p>` : ""}
      <div class="shipcashbox-notebook-footer__metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </div>
  `;
}

function notebookBatchTotal(batch) {
  return Number(batch?.total_expenses || 0);
}

function renderNotebookBatches(batches = [], currency = "EUR", owner = "participant") {
  if (!Array.isArray(batches) || !batches.length) return "";
  return `
    <div class="shipcashbox-submitted-records" aria-label="${escapeHtml(t("submittedRecordsTitle"))}">
      <div class="shipcashbox-submitted-records__head">
        <strong>${escapeHtml(t("submittedRecordsTitle"))}</strong>
        <span>${escapeHtml(tt("submittedRecordsCount", { count: batches.length }))}</span>
      </div>
      <div class="shipcashbox-submitted-records__grid">
        ${batches.slice().reverse().map((batch) => `
          <article class="shipcashbox-submitted-record">
            <button class="shipcashbox-submitted-record__button restore-notebook-batch-btn" type="button" data-owner="${escapeHtml(owner)}" data-batch-id="${escapeHtml(batch.id)}" title="${escapeHtml(t("restoreNotebookBatchHelp"))}" aria-label="${escapeHtml(t("restoreNotebookBatchHelp"))}">
              <span>
                <strong>${escapeHtml(t("submittedRecord"))}</strong>
                <small>${escapeHtml(formatDateTime(batch.submitted_at))}</small>
              </span>
              <span class="shipcashbox-submitted-record__sum">${escapeHtml(money(notebookBatchTotal(batch), currency))}</span>
            </button>
          </article>
        `).join("")}
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
        <div class="shipcashbox-actions">
          <button class="btn btn--primary" type="button" id="guestSiteLoginButton">${escapeHtml(t("site_menu_login"))}</button>
        </div>
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

  $("guestSiteLoginButton")?.addEventListener("click", async () => {
    try {
      if (typeof window.ensureToolAccess === "function") {
        await window.ensureToolAccess({ requireLive: true });
      } else if (typeof window.openToolAuthPrompt === "function") {
        await window.openToolAuthPrompt();
      }
      await checkViewer();
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

function renderAppMenuLanguage() {
  const list = $("cashboxLanguageList");
  if (!list) return;
  const options = languageOptions();
  $("cashboxLanguageCurrent") && ($("cashboxLanguageCurrent").textContent = languageName(state.lang));
  list.innerHTML = options.map((option) => {
    const active = option.code === state.lang;
    return `
      <button type="button" class="site-menu-language__option${active ? " is-active" : ""}${option.isAvailable ? "" : " is-unavailable"}" data-cashbox-lang="${escapeHtml(option.code)}" aria-pressed="${active ? "true" : "false"}"${option.isAvailable ? "" : " aria-disabled=\"true\" disabled"}>
        <span class="site-menu-language__name">${escapeHtml(option.name)}</span>
        <span class="site-menu-language__current">${escapeHtml(t("site_menu_language_current"))}</span>
        <span class="site-menu-language__pending">${escapeHtml(t("site_menu_language_pending"))}</span>
      </button>
    `;
  }).join("");
}

function renderAppMenuAccount() {
  const panel = $("cashboxAccountPanel");
  if (!panel) return;
  const profile = readToolAuthProfile();
  const isAuthenticated = Boolean(profile?.authenticated);
  if (!isAuthenticated) {
    panel.innerHTML = `
      <div class="site-menu-account__head">
        <span class="site-menu-account__avatar"><span>?</span></span>
        <div>
          <p class="site-menu-account__label">${escapeHtml(t("cashboxMenuAccount"))}</p>
          <strong>${escapeHtml(t("site_menu_login"))}</strong>
          <span>${escapeHtml(t("cashboxMenuAccountText"))}</span>
        </div>
      </div>
      <button type="button" class="btn btn--primary btn--full" id="cashboxAccountAction">${escapeHtml(t("site_menu_login"))}</button>
    `;
    return;
  }
  const displayName = profile.displayName || profile.email || "Brkovic account";
  const provider = String(profile.authProvider || "account").toUpperCase();
  panel.innerHTML = `
    <div class="site-menu-account__head">
      <span class="site-menu-account__avatar">${profile.avatarUrl ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="" referrerpolicy="no-referrer">` : `<span>${escapeHtml(toolAccountInitial(profile))}</span>`}</span>
      <div>
        <p class="site-menu-account__label">${escapeHtml(t("cashboxMenuAccount"))}</p>
        <strong>${escapeHtml(displayName)}</strong>
        ${profile.email ? `<span>${escapeHtml(profile.email)}</span>` : ""}
      </div>
    </div>
    <div class="site-menu-account__meta"><span>${escapeHtml(provider)}</span><span>${escapeHtml(t("cashboxMenuAccount"))}</span></div>
    <button type="button" class="btn btn--secondary btn--full" id="cashboxAccountAction">${escapeHtml(t("site_menu_logout"))}</button>
  `;
}

function renderAppMenuGroup() {
  const dot = $("cashboxMenuGroupDot");
  const button = $("cashboxMenuGroup");
  if (!dot || !button) return;
  dot.hidden = !hasActiveGroup();
  button.classList.toggle("has-active-group", hasActiveGroup());
}

function openAppMenu() {
  const modal = $("cashboxAppMenuModal");
  if (!modal) return;
  renderAppMenuLanguage();
  renderAppMenuAccount();
  renderAppMenuGroup();
  applyTheme();
  lockModalScroll();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeAppMenu() {
  const modal = $("cashboxAppMenuModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  unlockModalScroll();
}

async function handleAppAccountAction() {
  const profile = readToolAuthProfile();
  if (!profile?.authenticated) {
    closeAppMenu();
    if (typeof window.ensureToolAccess === "function") {
      await window.ensureToolAccess({ requireLive: true }).catch(() => null);
    } else if (typeof window.openToolAuthPrompt === "function") {
      await window.openToolAuthPrompt().catch(() => null);
    }
    await checkViewer();
    return;
  }
  await fetch("/api/auth/user/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
  await api("logout", { method: "POST", body: "{}" }).catch(() => null);
  clearToolAuthProfile();
  closeAppMenu();
  await checkViewer();
}

async function handleAppInstallAction() {
  closeAppMenu();
  if (isStandalonePwa()) {
    setFlash(t("installTitle"));
    return;
  }
  if (!state.installPrompt) {
    setFlash(installInstructionText());
    return;
  }
  state.installPrompt.prompt();
  await state.installPrompt.userChoice.catch(() => null);
  state.installPrompt = null;
  localStorage.setItem(DISMISSED_INSTALL_KEY, "1");
  render();
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

async function saveTreasurerNotebook({ preserveFocus = false, silent = false, submit = false } = {}) {
  if (!state.boot?.session) return null;
  window.clearTimeout(state.treasurerAutosaveTimer);
  state.treasurerAutosaveTimer = null;
  const draft = normalizedText(state.treasurerDraft || "");
  if (submit && !draft.trim()) {
    setFlash(t("emptyNotebookSubmit"), true);
    return null;
  }
  setNotebookMeta("treasurerSaveMeta", t("autosaveSaving"));
  try {
    const payload = await api("save-treasurer-notebook", {
      method: "POST",
      body: JSON.stringify({
        id: state.boot.session.id,
        notebook_text: draft,
        submit,
      }),
    });
    state.boot = payload;
    saveCache(BOOT_CACHE_KEY, payload);
    localStorage.setItem(ENGAGED_KEY, "1");
    const treasurer = (payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id);
    state.treasurerDraft = normalizedText(treasurer?.notebook_text || "");
    try {
      localStorage.setItem(treasurerDraftKey(payload.session?.id), state.treasurerDraft);
    } catch (error) {}
    if (preserveFocus && !submit) {
      preserveSelection("treasurerNotebook", () => render({ preserveWorkspace: true }));
    } else {
      render({ preserveWorkspace: true });
    }
    if (!silent) setFlash(t(submit ? "notebookSubmitted" : "saved"));
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
  const footerAction = viewing.is_self && !viewing.read_only
    ? `
        <button class="btn btn--secondary notebook-keep-focus" type="button" id="participantSaveButton" title="${escapeHtml(t("saveNotebookHelp"))}" aria-label="${escapeHtml(t("saveNotebookHelp"))}">${escapeHtml(t("saveNotebook"))}</button>
        <button class="btn btn--primary notebook-keep-focus" type="button" id="participantSyncButton" title="${escapeHtml(t("syncNowHelp"))}" aria-label="${escapeHtml(t("syncNowHelp"))}">${escapeHtml(t("syncNow"))}</button>
      `
    : (viewing.is_self ? "" : `<a class="btn btn--secondary" href="?invite=${encodeURIComponent(participant.invite_token)}">${escapeHtml(t("backToMyNotebook"))}</a>`);
  $("participantView").innerHTML = `
    <section class="shipcashbox-card shipcashbox-card--sticky shipcashbox-card--notebook">
      <div class="shipcashbox-card__head shipcashbox-workhead">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(session.title)}</p>
          <h2 class="shipcashbox-work-title">${escapeHtml(t("participantNotebookTitle"))}</h2>
        </div>
        <div class="shipcashbox-inline-actions">
          <button class="btn btn--secondary" type="button" id="openWorkspaceMenuButton" title="${escapeHtml(t("workspaceMenuHelp"))}" aria-label="${escapeHtml(t("workspaceMenuHelp"))}">${escapeHtml(t("workspaceMenuAction"))}</button>
        </div>
      </div>
      ${!viewing.is_self ? `<p class="shipcashbox-note">${escapeHtml(t("currentView"))}: ${escapeHtml(viewing.display_name)}</p>` : ""}
      <div class="shipcashbox-notebook-shell">
        <textarea id="participantNotebook" class="shipcashbox-notebook-textarea" placeholder="${escapeHtml(t("notebookPlaceholder"))}" aria-label="${escapeHtml(t("participantNotebookTitle"))}" ${readOnly ? "readonly" : ""}>${escapeHtml(viewing.is_self ? state.participantDraft : (viewing.notebook_text || ""))}</textarea>
        ${renderNotebookLockOverlay()}
      </div>
      ${renderNotebookBatches(viewing.notebook_batches || [], session.currency, viewing.is_self ? "participant" : "readonly")}
      ${readOnly && viewing.is_self && !state.editorLocked ? `<p class="shipcashbox-note">${escapeHtml(t("participantReadonly"))}</p>` : ""}
      ${readOnly && !viewing.is_self ? `<p class="shipcashbox-note">${escapeHtml(t("readonlyParticipantView"))}</p>` : ""}
      ${renderNotebookFooter({
        label: t("spentFooterLabel"),
        value: money(viewing.expenses, session.currency),
        actionHtml: footerAction,
        statusId: "participantSyncMeta",
        statusText: viewing.is_self ? syncMeta : t("viewingReadonly"),
      })}
    </section>
  `;

  $("participantNotebook")?.addEventListener("input", () => {
    if (!viewing.is_self) return;
    saveParticipantDraft($("participantNotebook").value);
    $("participantSyncMeta").textContent = participantSyncSummary();
  });
  $("participantSaveButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("autosaveSaving"), () => syncParticipant("manual", { submit: false }))
      .catch((error) => setFlash(error.message || t("loadFailed")));
  });
  $("participantSyncButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("submitNotebookBusy"), () => syncParticipant("manual", { submit: true }))
      .catch((error) => setFlash(error.message || t("loadFailed")));
  });
  bindRestoreNotebookButtons();
  $("openWorkspaceMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  bindNotebookKeyboardTarget($("participantNotebook"));
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
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("participantEmailLabel"))}</span>
          <input type="email" class="participant-email-input" value="${escapeHtml(participant.email || "")}" ${participant.role === "treasurer" ? "disabled" : ""}>
        </label>
        <label class="shipcashbox-field shipcashbox-field--compact">
          <span>${escapeHtml(t("cashboxContributionLabel"))}</span>
          <input type="text" class="participant-contribution-input" inputmode="decimal" value="${escapeHtml(String(participant.cashbox_contribution ?? 0))}">
        </label>
      </div>
      <div class="shipcashbox-participant-row__stats">
        <span class="shipcashbox-pill participant-auth-pill">${escapeHtml(participant.authorized_at ? `${t("authConfirmed")}: ${formatDateTime(participant.authorized_at)}` : t("authPending"))}</span>
        ${participant.role !== "treasurer" ? `<span class="shipcashbox-pill">${escapeHtml(participant.invite_sent_at ? `${t("inviteEmailSentAt")}: ${formatDateTime(participant.invite_sent_at)}` : t("inviteEmailNotSent"))}</span>` : ""}
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
        ${participant.role !== "treasurer" ? `<button class="btn btn--primary send-invite-email-btn" type="button" data-participant-id="${escapeHtml(participant.id)}" title="${escapeHtml(t("sendInviteEmailHelp"))}" aria-label="${escapeHtml(t("sendInviteEmailHelp"))}">${escapeHtml(t("sendInviteEmail"))}</button>` : ""}
        ${participant.role !== "treasurer" ? `<button class="btn btn--secondary copy-invite-btn" type="button" data-link="${escapeHtml(participant.invite_link)}" title="${escapeHtml(t("copyInviteHelp"))}" aria-label="${escapeHtml(t("copyInviteHelp"))}">${escapeHtml(t("copyInvite"))}</button>` : ""}
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
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("participantEmailLabel"))}</span>
          <input type="email" class="participant-email-input" value="">
        </label>
        <label class="shipcashbox-field shipcashbox-field--compact">
          <span>${escapeHtml(t("cashboxContributionLabel"))}</span>
          <input type="text" class="participant-contribution-input" inputmode="decimal" value="0">
        </label>
      </div>
      <div class="shipcashbox-participant-row__stats">
        <span class="shipcashbox-pill participant-auth-pill">${escapeHtml(t("authPending"))}</span>
        <span class="shipcashbox-pill">${escapeHtml(t("inviteLinkPending"))}</span>
      </div>
      <div class="shipcashbox-inline-actions shipcashbox-inline-actions--participant">
        <button class="btn btn--secondary remove-participant-btn" type="button">${escapeHtml(t("removeParticipant"))}</button>
      </div>
      <p class="shipcashbox-note shipcashbox-participant-row__hint">${escapeHtml(t("participantDraftPending"))}</p>
    </div>
  `;
}

function renderSummaryCards(participants, currency) {
  return participants.map((participant) => {
    const cashboxExpenses = participantCashboxExpenses(participant);
    const expenseRows = [
      { label: t("contributionShort"), value: money(participant.contributions, currency) },
      { label: t("personalExpenseShort"), value: money(participantPersonalExpenses(participant), currency) },
      ...(cashboxExpenses > 0 ? [{ label: t("cashboxExpenseShort"), value: money(cashboxExpenses, currency) }] : []),
      { label: t("balanceShort"), value: money(participant.balance, currency, true), tone: "balance" },
    ];
    return `
      <article class="shipcashbox-summary-card">
        <div class="shipcashbox-card__row">
          <strong>${escapeHtml(participant.display_name)}</strong>
          <span class="shipcashbox-pill">${escapeHtml(participant.role === "treasurer" ? t("treasurerTag") : t("participantTag"))}</span>
        </div>
        <div class="shipcashbox-balance-rows">
          ${expenseRows.map((row) => `
            <div class="shipcashbox-balance-row${row.tone ? ` shipcashbox-balance-row--${escapeHtml(row.tone)}` : ""}">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.value)}</strong>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function participantPersonalExpenses(participant) {
  if (Object.prototype.hasOwnProperty.call(participant || {}, "personal_expenses")) {
    return Number(participant.personal_expenses || 0);
  }
  return Number(participant?.cashbox_expenses || 0) > 0 ? 0 : Number(participant?.expenses || 0);
}

function participantCashboxExpenses(participant) {
  return Number(participant?.cashbox_expenses || 0);
}

function chartMetricDefinitions(participants = []) {
  const hasCashboxExpenses = participants.some((participant) => participantCashboxExpenses(participant) > 0);
  const metrics = [
    { key: "contributions", label: t("summaryContributions"), tone: "contribution", signed: false, value: (participant) => Number(participant.contributions || 0) },
  ];
  if (hasCashboxExpenses) {
    metrics.push(
      { key: "personal_expenses", label: t("personalExpenseShort"), tone: "personal", signed: false, value: participantPersonalExpenses },
      { key: "cashbox_expenses", label: t("cashboxExpenseShort"), tone: "cashbox", signed: false, value: participantCashboxExpenses }
    );
  } else {
    metrics.push({ key: "expenses", label: t("summaryExpenses"), tone: "expense", signed: false, value: (participant) => Number(participant.expenses || 0) });
  }
  metrics.push({ key: "balance", label: t("balanceShort"), tone: "balance", signed: true, value: (participant) => Number(participant.balance || 0) });
  return metrics;
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
  const metrics = chartMetricDefinitions(participants);
  const maxValue = Math.max(1, ...participants.flatMap((participant) => metrics.map((metric) => Math.abs(Number(metric.value(participant) || 0)))));
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
              const value = Number(metric.value(participant) || 0);
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

function participantInitials(name, index = 0) {
  const normalized = String(name || "").replace(/[^\p{L}\p{N}\s@._-]/gu, " ").trim();
  if (!normalized) return String(index + 1).padStart(2, "0");
  const emailPrefix = normalized.includes("@") ? normalized.split("@")[0] : normalized;
  const parts = emailPrefix.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0] || ""}${parts[1][0] || ""}` : String(parts[0] || "").slice(0, 2);
  return letters.toUpperCase();
}

function buildDebtMatrix(session) {
  const participants = (session.participants || []).filter((participant) => participant.active !== false);
  const lines = session.settlement_preview?.lines || [];
  const currency = session.currency || "EUR";
  const participantById = new Map(participants.map((participant) => [participant.id, participant]));
  const fallbackParticipant = (id, name) => ({
    id: id || name,
    display_name: name || id || "-",
    active: true,
  });
  const ordered = [...participants];
  const knownIds = new Set(ordered.map((participant) => participant.id));

  lines.forEach((line) => {
    if (line.from_participant_id && !knownIds.has(line.from_participant_id)) {
      const participant = fallbackParticipant(line.from_participant_id, line.from_display_name);
      ordered.push(participant);
      participantById.set(participant.id, participant);
      knownIds.add(participant.id);
    }
    if (line.to_participant_id && !knownIds.has(line.to_participant_id)) {
      const participant = fallbackParticipant(line.to_participant_id, line.to_display_name);
      ordered.push(participant);
      participantById.set(participant.id, participant);
      knownIds.add(participant.id);
    }
  });

  const matrix = new Map();
  const outgoing = new Map();
  const incoming = new Map();
  const transferLines = [];

  const addAmount = (map, id, amount) => {
    map.set(id, moneyRound((Number(map.get(id)) || 0) + amount));
  };

  lines.forEach((line) => {
    const amount = moneyRound(Number(line.amount || 0));
    const fromId = line.from_participant_id || line.from_display_name || "";
    const toId = line.to_participant_id || line.to_display_name || "";
    if (!fromId || !toId || amount <= 0) return;
    const key = `${fromId}__${toId}`;
    matrix.set(key, moneyRound((Number(matrix.get(key)) || 0) + amount));
    addAmount(outgoing, fromId, amount);
    addAmount(incoming, toId, amount);
    transferLines.push({
      fromId,
      toId,
      fromName: line.from_display_name || participantById.get(fromId)?.display_name || fromId,
      toName: line.to_display_name || participantById.get(toId)?.display_name || toId,
      amount,
      kind: line.kind || "participant_transfer",
    });
  });

  const totalOutgoing = moneyRound(Array.from(outgoing.values()).reduce((sum, value) => sum + Number(value || 0), 0));
  const totalIncoming = moneyRound(Array.from(incoming.values()).reduce((sum, value) => sum + Number(value || 0), 0));
  const neutralCount = ordered.filter((participant) => !(outgoing.get(participant.id) > 0.009) && !(incoming.get(participant.id) > 0.009)).length;

  return {
    participants: ordered,
    matrix,
    outgoing,
    incoming,
    transferLines,
    currency,
    totalOutgoing,
    totalIncoming,
    debtorCount: Array.from(outgoing.values()).filter((value) => Number(value || 0) > 0.009).length,
    creditorCount: Array.from(incoming.values()).filter((value) => Number(value || 0) > 0.009).length,
    neutralCount,
  };
}

function renderDebtPerson(participant, index) {
  return `
    <span class="debt-person">
      <span class="debt-avatar debt-avatar--${index % 8}">${escapeHtml(participantInitials(participant.display_name, index))}</span>
      <span>${escapeHtml(participant.display_name || "-")}</span>
    </span>
  `;
}

function renderDebtMatrixTable(session) {
  const data = buildDebtMatrix(session);
  if (!data.participants.length) {
    return `<div class="empty">${escapeHtml(t("emptyLines"))}</div>`;
  }

  const participantIndex = new Map(data.participants.map((participant, index) => [participant.id, index]));
  const participantHeadCells = data.participants.map((participant, index) => `
    <th>${renderDebtPerson(participant, index)}</th>
  `).join("");
  const bodyRows = data.participants.map((debtor, rowIndex) => {
    const cells = data.participants.map((creditor) => {
      if (debtor.id === creditor.id) return `<td class="debt-empty">-</td>`;
      const amount = Number(data.matrix.get(`${debtor.id}__${creditor.id}`) || 0);
      return amount > 0.009
        ? `<td><span class="debt-chip">${escapeHtml(money(amount, data.currency))}</span></td>`
        : `<td class="debt-empty">-</td>`;
    }).join("");
    const outgoing = Number(data.outgoing.get(debtor.id) || 0);
    const incoming = Number(data.incoming.get(debtor.id) || 0);
    const balance = moneyRound(incoming - outgoing);
    const totalClass = balance < -0.009 ? "debt-total--bad" : balance > 0.009 ? "debt-total--good" : "";
    const totalLabel = balance < -0.009
      ? tx("debtMatrixOwes", "должен")
      : balance > 0.009
        ? tx("debtMatrixReceives", "получит")
        : tx("debtMatrixSettled", "закрыто");
    return `
      <tr>
        <th>${renderDebtPerson(debtor, rowIndex)}</th>
        ${cells}
        <td class="debt-total ${totalClass}">${escapeHtml(money(Math.abs(balance), data.currency))}<small>${escapeHtml(totalLabel)}</small></td>
      </tr>
    `;
  }).join("");
  const totalsRow = data.participants.map((participant) => {
    const amount = Number(data.incoming.get(participant.id) || 0);
    return `<td class="${amount > 0.009 ? "debt-total--good" : "debt-empty"}">${escapeHtml(amount > 0.009 ? money(amount, data.currency) : "-")}</td>`;
  }).join("");

  return `
    <section class="debt-matrix-block">
      <table class="debt-matrix" aria-label="${escapeHtml(tx("debtMatrixTitle", "Кто кому должен"))}">
        <thead>
          <tr>
            <th>${escapeHtml(tx("debtMatrixDebtor", "Должник"))}</th>
            ${participantHeadCells}
            <th>${escapeHtml(tx("debtMatrixResult", "Итог"))}</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
          <tr class="debt-total-row">
            <th>${escapeHtml(tx("debtMatrixTotalReceives", "Итого получит"))}</th>
            ${totalsRow}
            <td class="debt-total debt-total--good">${escapeHtml(money(data.totalIncoming, data.currency))}<small>${escapeHtml(tx("debtMatrixTransfers", "переводы"))}</small></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

function renderDebtTransferGrid(session) {
  const data = buildDebtMatrix(session);
  if (!data.transferLines.length) {
    return `<div class="debt-transfer-note">${escapeHtml(tx("noTransfers", "Переводы не требуются."))}</div>`;
  }

  return `
    <section class="debt-transfers">
      <h2>${escapeHtml(tx("debtMatrixFinalTransfers", "Итоговые расчеты"))} <span>(${escapeHtml(String(data.transferLines.length))})</span></h2>
      <div class="debt-transfer-grid">
        ${data.transferLines.map((line) => `
          <article class="debt-transfer">
            <b>${escapeHtml(line.fromName)}</b>
            <em>→</em>
            <b>${escapeHtml(line.toName)}</b>
            <strong>${escapeHtml(money(line.amount, data.currency))}</strong>
          </article>
        `).join("")}
        <aside class="debt-transfer-note">${escapeHtml(tx("debtMatrixCloseNote", "После этих переводов расчеты группы будут закрыты."))}</aside>
      </div>
    </section>
  `;
}

function buildDebtMatrixPrintHtml(session) {
  const data = buildDebtMatrix(session);
  const bodyHtml = `
    <section class="debt-board">
      <header class="debt-hero">
        <div>
          <h2>${escapeHtml(tx("debtMatrixTitle", "Кто кому должен"))}</h2>
          <p>${escapeHtml(txf("debtMatrixParticipantsCount", "{count} участников", { count: data.participants.length }))}</p>
        </div>
        <div class="debt-top-button">${escapeHtml(t("settlementTitle"))}</div>
      </header>
      <section class="debt-summary" aria-label="${escapeHtml(tx("debtMatrixSummary", "Сводка расчета"))}">
        <article class="debt-summary-card debt-summary-card--bad">
          <span class="debt-round">↘</span>
          <div><b>${escapeHtml(tx("debtMatrixNeedPay", "Нужно доплатить"))}</b><small>${escapeHtml(txf("debtMatrixParticipantsCount", "{count} участников", { count: data.debtorCount }))}</small></div>
          <strong>${escapeHtml(money(data.totalOutgoing, data.currency))}</strong>
        </article>
        <article class="debt-summary-card debt-summary-card--good">
          <span class="debt-round">↗</span>
          <div><b>${escapeHtml(tx("debtMatrixNeedReceive", "Нужно вернуть"))}</b><small>${escapeHtml(txf("debtMatrixParticipantsCount", "{count} участников", { count: data.creditorCount }))}</small></div>
          <strong>${escapeHtml(money(data.totalIncoming, data.currency))}</strong>
        </article>
        <article class="debt-summary-card">
          <span class="debt-round">=</span>
          <div><b>${escapeHtml(tx("debtMatrixAllOk", "Все в порядке"))}</b><small>${escapeHtml(txf("debtMatrixParticipantsCount", "{count} участников", { count: data.neutralCount }))}</small></div>
          <strong>${escapeHtml(money(0, data.currency))}</strong>
        </article>
        <article class="debt-summary-card debt-summary-card--info">
          <span class="debt-round">i</span>
          <div><b>${escapeHtml(tx("debtMatrixHowWorks", "Как это работает"))}</b><small>${escapeHtml(tx("debtMatrixHowWorksText", "Минимизируем количество переводов. Каждый платит только тем, кому должен."))}</small></div>
        </article>
      </section>
      ${renderDebtMatrixTable(session)}
      ${renderDebtTransferGrid(session)}
    </section>
  `;

  return buildCashboxPrintDocument({
    title: `${session.title || tx("navdesk_tool_cashbox_title", "Ship Cashbox")} / ${tx("debtMatrixTitle", "Кто кому должен")}`,
    subtitle: tx("debtMatrixSubtitle", "Альбомная таблица финального расчета для печати или сохранения в PDF."),
    bodyHtml,
  });
}

function renderArchiveRows(archive = [], canReopen = false) {
  if (!archive.length) {
    return `<div class="shipcashbox-empty">${escapeHtml(t("archiveEmpty"))}</div>`;
  }
  return archive.map((item) => `
    <article class="shipcashbox-archive__row shipcashbox-archive__row--selectable">
      <div class="shipcashbox-card__row">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="shipcashbox-archive__status">${escapeHtml(t("archiveStatus"))}</span>
      </div>
      <div class="shipcashbox-archive__meta">${escapeHtml(t("archivedOn"))}: ${escapeHtml(item.closed_at || "")}</div>
      <div class="shipcashbox-archive__meta">${escapeHtml(`${item.participants} · ${money(item.cashbox_balance, item.currency, true)}`)}</div>
      <button class="shipcashbox-archive__cover open-archive-session-btn" type="button" data-id="${escapeHtml(item.id)}" data-can-reopen="${canReopen ? "1" : "0"}" title="${escapeHtml(t("openArchiveSnapshot"))}" aria-label="${escapeHtml(t("openArchiveSnapshot"))}"></button>
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
    if (!state.boot?.session) {
      return `
        <div class="shipcashbox-window-menu">
          ${renderWindowMenuButton("archive", t("archiveTitle"), t("workspaceArchiveText"))}
          ${renderWindowMenuButton("service", t("workspaceServiceTitle"), t("workspaceServiceText"))}
        </div>
      `;
    }
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
        <div class="shipcashbox-window-actions">
          <button class="shipcashbox-window-button print-settlement-pdf-btn" type="button">
            <strong>${escapeHtml(tx("debtMatrixPdfButton", "Сохранить PDF"))}</strong>
            <span>${escapeHtml(tx("debtMatrixPdfText", "Альбомная таблица финального расчета"))}</span>
          </button>
          ${renderWindowMenuButton("log-diagram", t("logDiagram"), t("logDiagramText"))}
          ${renderWindowMenuButton("log-tree", t("logTreeTitle"), t("logText"))}
        </div>
      </section>
    </div>
  `;
}

function renderTreasurerDiagramWindow(session) {
  const participants = session.participants || [];
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("logTitle"))}</p>
          <h2>${escapeHtml(t("logDiagram"))}</h2>
        </div>
      </div>
      <p class="shipcashbox-note">${escapeHtml(t("logDiagramText"))}</p>
      ${renderExpenseDiagram(participants, session.currency)}
    </section>
  `;
}

function renderTreasurerLogTreeWindow(session) {
  const participants = session.participants || [];
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-card__head">
        <div>
          <p class="section-heading__eyebrow">${escapeHtml(t("logTitle"))}</p>
          <h2>${escapeHtml(t("logTreeTitle"))}</h2>
        </div>
        <div class="shipcashbox-share-actions">
          <button class="btn btn--secondary" type="button" id="shareLogButton" title="${escapeHtml(t("shareLogHelp"))}" aria-label="${escapeHtml(t("shareLogHelp"))}">${escapeHtml(t("shareLog"))}</button>
          <button class="btn btn--secondary" type="button" id="printLogButton" title="${escapeHtml(t("printLogHelp"))}" aria-label="${escapeHtml(t("printLogHelp"))}">${escapeHtml(t("printLog"))}</button>
        </div>
      </div>
      <p class="shipcashbox-note">${escapeHtml(t("logText"))}</p>
      <div class="shipcashbox-log">${renderLogGroups(participants)}</div>
    </section>
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
  const invitedCount = (session.participants || []).filter((participant) => participant.role !== "treasurer" && participant.invite_sent_at).length;
  return `
    <section class="shipcashbox-card shipcashbox-card--window">
      <div class="shipcashbox-teambar">
        <div class="shipcashbox-teambar__copy">
          <p class="section-heading__eyebrow">${escapeHtml(t("cashboxFlowTitle"))}</p>
          <p class="shipcashbox-note">${escapeHtml(t("teamContributionsText"))}</p>
          <div class="shipcashbox-metrics shipcashbox-metrics--compact shipcashbox-metrics--team">
            <div class="shipcashbox-metric"><span>${escapeHtml(t("participantsTitle"))}</span><strong>${escapeHtml(String((session.participants || []).length))}</strong></div>
            <div class="shipcashbox-metric"><span>${escapeHtml(t("inviteEmailSentAt"))}</span><strong>${escapeHtml(String(invitedCount))}</strong></div>
            <div class="shipcashbox-metric"><span>${escapeHtml(t("authConfirmed"))}</span><strong>${escapeHtml(String(activeCount))}</strong></div>
          </div>
        </div>
        <div class="shipcashbox-actions shipcashbox-actions--team">
          <button class="btn btn--secondary" type="button" id="addParticipantButton" title="${escapeHtml(t("addParticipantHelp"))}" aria-label="${escapeHtml(t("addParticipantHelp"))}">${escapeHtml(t("inviteParticipant"))}</button>
          <button class="btn btn--primary" type="button" id="saveSessionButton" title="${escapeHtml(t("saveSessionHelp"))}" aria-label="${escapeHtml(t("saveSessionHelp"))}">${escapeHtml(t("saveSession"))}</button>
        </div>
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
      <div class="shipcashbox-participants" id="participantsEditor">${renderParticipantRows(session.participants || [])}</div>
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
        <button class="btn btn--secondary print-settlement-pdf-btn" type="button" title="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}" aria-label="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}">${escapeHtml(tx("debtMatrixPdfButton", "Сохранить PDF"))}</button>
        <button class="btn btn--primary" type="button" id="confirmSettlementButton" title="${escapeHtml(t("settleNowHelp"))}" aria-label="${escapeHtml(t("settleNowHelp"))}">${escapeHtml(t("settleNow"))}</button>
      </div>
    </section>
  `;
}

function renderArchiveDetailWindow(session) {
  const participants = session.participants || [];
  const totals = session.totals || {};
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window shipcashbox-card--archive-detail">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("archiveStatus"))}</p>
            <h2>${escapeHtml(session.title || t("archiveSnapshotTitle"))}</h2>
            <p class="shipcashbox-note">${escapeHtml(t("archivedOn"))}: ${escapeHtml(session.closed_at || "")}</p>
          </div>
        </div>
        <div class="shipcashbox-metrics shipcashbox-metrics--compact">
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryCash"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryExpenses"))}</span><strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryContributions"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryShare"))}</span><strong>${escapeHtml(money(totals.share, session.currency))}</strong></div>
        </div>
        <div class="shipcashbox-actions">
          ${renderExports(session.exports || [])}
          <button class="btn btn--secondary print-archive-settlement-pdf-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}" aria-label="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}">${escapeHtml(tx("debtMatrixPdfButton", "Сохранить PDF"))}</button>
          <button class="btn btn--primary reopen-session-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(t("reopenCashboxHelp"))}" aria-label="${escapeHtml(t("reopenCashboxHelp"))}">${escapeHtml(t("reopenCashbox"))}</button>
          <button class="btn btn--secondary delete-archive-session-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(t("deleteArchiveHelp"))}" aria-label="${escapeHtml(t("deleteArchiveHelp"))}">${escapeHtml(t("deleteArchive"))}</button>
        </div>
      </section>
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("settlementTitle"))}</p>
            <h2>${escapeHtml(t("settlementTitle"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-lines">${renderSettlementLines(session.settlement_preview?.lines || [], session.currency)}</div>
        <div class="shipcashbox-actions">
          <button class="btn btn--secondary print-archive-settlement-pdf-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}" aria-label="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}">${escapeHtml(tx("debtMatrixPdfButton", "Сохранить PDF"))}</button>
        </div>
      </section>
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
            <h2>${escapeHtml(t("logTreeTitle"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-log">${renderLogGroups(participants)}</div>
      </section>
    </div>
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

  if (state.viewer === "treasurer" && state.boot && windowName === "archive") {
    return {
      eyebrow: t("archiveTitle"),
      title: t("archiveTitle"),
      body: `<section class="shipcashbox-card shipcashbox-card--window"><div class="shipcashbox-archive">${renderArchiveRows(state.boot.archive || [], false)}</div></section>`,
    };
  }

  if (state.viewer === "treasurer" && windowName === "service") {
    return {
      eyebrow: t("workspaceServiceTitle"),
      title: t("workspaceServiceTitle"),
      body: renderServiceWindow(),
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
    if (windowName === "log-diagram") {
      return {
        eyebrow: t("logTitle"),
        title: t("logDiagram"),
        body: renderTreasurerDiagramWindow(session),
      };
    }
    if (windowName === "log-tree") {
      return {
        eyebrow: t("logTitle"),
        title: t("logTreeTitle"),
        body: renderTreasurerLogTreeWindow(session),
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
        <section class="shipcashbox-card shipcashbox-card--start">
          <div class="shipcashbox-card__head">
            <div>
              <p class="section-heading__eyebrow">${escapeHtml(t("sessionCardEyebrow"))}</p>
              <h2>${escapeHtml(t("noActiveCashbox"))}</h2>
            </div>
          </div>
          <p class="shipcashbox-note">${escapeHtml(t("noActiveCashboxText"))}</p>
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("groupNameLabel"))}</span>
            <input type="text" id="newSessionTitleInput" value="" placeholder="${escapeHtml(t("groupNamePlaceholder"))}">
          </label>
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
  const notebookText = normalizedText(state.treasurerDraft);
  const totals = session.totals || {};
  const readOnly = session.status !== "active" || state.editorLocked;
  const attachmentAction = session.status === "active"
    ? `<button class="btn btn--secondary" type="button" id="attachReceiptButton" title="${escapeHtml(t("attachPhotoHelp"))}" aria-label="${escapeHtml(t("attachPhotoHelp"))}">${escapeHtml(t("attachPhoto"))}</button>`
    : "";
  const notebookAction = session.status === "active"
    ? `
        <button class="btn btn--secondary notebook-keep-focus" type="button" id="treasurerSaveButton" title="${escapeHtml(t("saveNotebookHelp"))}" aria-label="${escapeHtml(t("saveNotebookHelp"))}">${escapeHtml(t("saveNotebook"))}</button>
        <button class="btn btn--primary notebook-keep-focus" type="button" id="treasurerSubmitNotebookButton" title="${escapeHtml(t("submitNotebookHelp"))}" aria-label="${escapeHtml(t("submitNotebookHelp"))}">${escapeHtml(t("submitNotebook"))}</button>
        ${attachmentAction}
      `
    : "";
  $("treasurerView").innerHTML = `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--sticky shipcashbox-card--notebook">
        <div class="shipcashbox-card__head shipcashbox-workhead">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(session.title)}</p>
            <h2 class="shipcashbox-work-title">${escapeHtml(t("treasurerNotebookTitle"))}</h2>
          </div>
          <div class="shipcashbox-inline-actions">
            <button class="btn btn--secondary" type="button" id="openWorkspaceMenuButton" title="${escapeHtml(t("workspaceMenuHelp"))}" aria-label="${escapeHtml(t("workspaceMenuHelp"))}">${escapeHtml(t("workspaceMenuAction"))}</button>
          </div>
        </div>
        <div class="shipcashbox-notebook-shell">
          <textarea id="treasurerNotebook" class="shipcashbox-notebook-textarea" placeholder="${escapeHtml(t("notebookPlaceholder"))}" aria-label="${escapeHtml(t("treasurerNotebookTitle"))}" ${readOnly ? "readonly" : ""}>${escapeHtml(notebookText)}</textarea>
          ${renderNotebookLockOverlay()}
        </div>
        ${renderNotebookBatches(treasurer?.notebook_batches || [], session.currency, "treasurer")}
        <div class="shipcashbox-stack">
          <div class="shipcashbox-card__row">
            <strong>${escapeHtml(t("photosTitle"))}</strong>
          </div>
          ${renderTreasurerAttachments(session)}
        </div>
        ${session.status !== "active" && !state.editorLocked ? `<p class="shipcashbox-note">${escapeHtml(t("participantReadonly"))}</p>` : ""}
        ${renderNotebookFooter({
          label: t("spentFooterLabel"),
          value: money(treasurer?.expenses || 0, session.currency),
          actionHtml: notebookAction,
          statusId: "treasurerSaveMeta",
          statusText: treasurerNotebookSummary(),
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
      email: row.querySelector(".participant-email-input")?.value.trim() || "",
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
    email: participant.email || "",
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

async function sendParticipantInvite(participantId) {
  const row = document.querySelector(`.shipcashbox-participant-row[data-participant-id="${CSS.escape(participantId)}"]`);
  const email = row?.querySelector(".participant-email-input")?.value.trim() || "";
  if (!email) {
    setFlash(t("inviteEmailMissing"), true);
    return null;
  }
  const payload = await api("send-invite", {
    method: "POST",
    body: JSON.stringify({
      id: state.boot.session.id,
      participant_id: participantId,
      email,
    }),
  });
  state.boot = payload;
  state.treasurerDraft = normalizedText((payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id)?.notebook_text || "");
  saveCache(BOOT_CACHE_KEY, payload);
  render({ preserveWorkspace: true });
  setFlash(t("inviteEmailSent"));
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

async function openArchiveSession(id) {
  if (!id || !$("workspaceModalBody")) return;
  const previousTitle = $("workspaceModalTitle")?.textContent || "";
  const previousBody = $("workspaceModalBody").innerHTML;
  if ($("workspaceModalEyebrow")) $("workspaceModalEyebrow").textContent = t("archiveTitle");
  if ($("workspaceModalTitle")) $("workspaceModalTitle").textContent = t("archiveSnapshotTitle");
  $("workspaceModalBody").innerHTML = `<section class="shipcashbox-card shipcashbox-card--window"><p class="shipcashbox-empty">${escapeHtml(t("loading"))}</p></section>`;
  try {
    const payload = await api(`archive-session&id=${encodeURIComponent(id)}`);
    if (!payload.session) throw new Error(t("archiveEmpty"));
    $("workspaceModal").dataset.window = "archive-detail";
    $("workspaceModalBody").innerHTML = renderArchiveDetailWindow(payload.session);
    bindWorkspaceModalUi();
  } catch (error) {
    if ($("workspaceModalTitle")) $("workspaceModalTitle").textContent = previousTitle;
    $("workspaceModalBody").innerHTML = previousBody;
    bindWorkspaceModalUi();
    setFlash(error.message || t("loadFailed"), true);
  }
}

async function restoreNotebookBatch(owner, batchId) {
  if (!batchId || owner === "readonly") return null;
  if (owner === "treasurer") {
    const payload = await api("restore-treasurer-batch", {
      method: "POST",
      body: JSON.stringify({
        id: state.boot?.session?.id,
        batch_id: batchId,
      }),
    });
    state.boot = payload;
    const treasurer = (payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id);
    state.treasurerDraft = normalizedText(treasurer?.notebook_text || "");
    try {
      localStorage.setItem(treasurerDraftKey(payload.session?.id), state.treasurerDraft);
    } catch (error) {}
    saveCache(BOOT_CACHE_KEY, payload);
    render({ preserveWorkspace: true });
    setFlash(t("submittedRecordRestored"));
    return payload;
  }

  const participant = state.participant?.participant;
  if (!participant?.invite_token) return null;
  const payload = await api("participant-restore-batch", {
    method: "POST",
    body: JSON.stringify({
      token: participant.invite_token,
      batch_id: batchId,
    }),
  });
  state.participant = payload;
  state.participantDraft = normalizedText(payload.participant?.notebook_text || "");
  try {
    localStorage.setItem(participantDraftKey(participant.invite_token), state.participantDraft);
  } catch (error) {}
  saveCache(`${PARTICIPANT_CACHE_PREFIX}${participant.invite_token}`, payload);
  render();
  setFlash(t("submittedRecordRestored"));
  return payload;
}

function bindRestoreNotebookButtons() {
  document.querySelectorAll(".restore-notebook-batch-btn").forEach((button) => {
    button.addEventListener("click", () => {
      restoreNotebookBatch(button.dataset.owner || "", button.dataset.batchId || "")
        .catch((error) => setFlash(error.message || t("loadFailed"), true));
    });
  });
}

function bindTreasurerUi() {
  $("createSessionButton")?.addEventListener("click", async () => {
    try {
      const payload = await api("create-session", {
        method: "POST",
        body: JSON.stringify({
          title: $("newSessionTitleInput")?.value.trim() || "",
        }),
      });
      state.boot = payload;
      clearTreasurerDraft(payload.session?.id);
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
  $("treasurerSaveButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("autosaveSaving"), () => saveTreasurerNotebook({ preserveFocus: false, silent: false }))
      .catch((error) => setFlash(error.message || t("loadFailed"), true));
  });
  $("treasurerSubmitNotebookButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("submitNotebookBusy"), () => saveTreasurerNotebook({ preserveFocus: false, silent: false, submit: true }))
      .catch((error) => setFlash(error.message || t("loadFailed"), true));
  });
  $("addParticipantButton")?.addEventListener("click", () => addParticipantDraftRow());
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
  bindNotebookKeyboardTarget($("treasurerNotebook"));
  $("unlockNotebookButton")?.addEventListener("click", unlockNotebookEditor);
  bindRestoreNotebookButtons();
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
  document.querySelectorAll(".delete-archive-session-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm(t("deleteArchiveConfirm"))) return;
      try {
        const payload = await api("delete-archive-session", {
          method: "POST",
          body: JSON.stringify({ id: button.dataset.id }),
        });
        state.boot = payload;
        saveCache(BOOT_CACHE_KEY, payload);
        openWorkspaceModal("archive");
        setFlash(t("archiveDeleted"));
      } catch (error) {
        setFlash(error.message || t("loadFailed"), true);
      }
    });
  });
  document.querySelectorAll(".open-archive-session-btn").forEach((button) => {
    button.addEventListener("click", () => {
      openWorkspaceModal("archive");
      window.requestAnimationFrame(() => openArchiveSession(button.dataset.id || ""));
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
    button.onclick = async () => {
      const row = button.closest(".shipcashbox-participant-row");
      if (!row || row.dataset.isTreasurer === "1") return;
      const wasDraft = row.classList.contains("shipcashbox-participant-row--draft");
      const hadData = Boolean(
        row.querySelector(".participant-name-input")?.value.trim()
        || row.querySelector(".participant-email-input")?.value.trim()
        || Number.parseFloat((row.querySelector(".participant-contribution-input")?.value || "0").replace(",", "."))
      );
      row.remove();
      refreshParticipantEditorUi();
      if ((wasDraft && !hadData) || !$("participantsEditor")) {
        setFlash(t("participantRemoved"));
        return;
      }
      try {
        await saveSessionMeta({}, { silent: true });
        setFlash(t("participantRemoved"));
      } catch (error) {
        render({ preserveWorkspace: true });
        setFlash(error.message || t("loadFailed"), true);
      }
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
  document.querySelectorAll(".send-invite-email-btn").forEach((button) => {
    button.onclick = () => sendParticipantInvite(button.dataset.participantId || "").catch((error) => setFlash(error.message || t("loadFailed"), true));
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
    const emailInput = row.querySelector(".participant-email-input");
    if (emailInput) emailInput.disabled = role === "treasurer";
  });
}

function addParticipantDraftRow({ focus = true } = {}) {
  const editor = $("participantsEditor");
  if (!editor) return null;
  const emptyDraft = Array.from(editor.querySelectorAll(".shipcashbox-participant-row--draft")).find((row) => {
    const name = row.querySelector(".participant-name-input")?.value.trim() || "";
    const contribution = row.querySelector(".participant-contribution-input")?.value.trim() || "0";
    const email = row.querySelector(".participant-email-input")?.value.trim() || "";
    return name === "" && email === "" && (contribution === "" || contribution === "0");
  });
  const row = emptyDraft || (() => {
    const tempId = `draft-${Date.now()}`;
    editor.insertAdjacentHTML("beforeend", renderParticipantDraftRow(tempId));
    return Array.from(editor.querySelectorAll(".shipcashbox-participant-row")).find((item) => item.dataset.participantId === tempId);
  })();
  bindParticipantRowActions();
  if (focus) {
    window.requestAnimationFrame(() => {
      row?.scrollIntoView({ block: "center", behavior: "smooth" });
      row?.querySelector(".participant-name-input")?.focus({ preventScroll: true });
    });
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
  $("workspaceModal").classList.toggle("shipcashbox-modal--workscreen", windowName !== "menu");
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
  $("workspaceModal").classList.remove("shipcashbox-modal--workscreen");
  $("workspaceModalBody").innerHTML = "";
  unlockModalScroll();
}

let pendingExitHref = "";

function openExitModal(href) {
  const modal = $("cashboxExitModal");
  if (!modal) {
    if (isNavDeskHref(href)) {
      returnToNavDesk(href);
      return;
    }
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
  if (isNavDeskHref(href)) {
    returnToNavDesk(href);
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
  document.querySelectorAll(".print-settlement-pdf-btn").forEach((button) => {
    button.addEventListener("click", () => printSettlementPdf());
  });
  document.querySelectorAll(".print-archive-settlement-pdf-btn").forEach((button) => {
    button.addEventListener("click", () => printArchiveSettlementPdf(button.dataset.id || ""));
  });
  $("saveSessionButton") && ($("saveSessionButton").onclick = () => saveSessionMeta().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("addParticipantButton") && ($("addParticipantButton").onclick = () => addParticipantDraftRow());
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
  document.querySelectorAll(".delete-archive-session-btn").forEach((button) => {
    button.onclick = async () => {
      if (!window.confirm(t("deleteArchiveConfirm"))) return;
      try {
        const payload = await api("delete-archive-session", {
          method: "POST",
          body: JSON.stringify({ id: button.dataset.id }),
        });
        state.boot = payload;
        saveCache(BOOT_CACHE_KEY, payload);
        openWorkspaceModal("archive");
        setFlash(t("archiveDeleted"));
      } catch (error) {
        setFlash(error.message || t("loadFailed"), true);
      }
    };
  });
  document.querySelectorAll(".open-archive-session-btn").forEach((button) => {
    button.onclick = () => openArchiveSession(button.dataset.id || "");
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

function printSettlementPdf(session = state.boot?.session) {
  if (!session) {
    setFlash(t("loadFailed"), true);
    return;
  }
  const docHtml = buildDebtMatrixPrintHtml(session);
  if (!docHtml || openCashboxPrintWindow(docHtml)) return;
  setFlash(t("printOpenFailed"), true);
}

async function printArchiveSettlementPdf(id) {
  const archiveId = String(id || "").trim();
  if (!archiveId) {
    printSettlementPdf();
    return;
  }
  try {
    const payload = await api(`archive-session&id=${encodeURIComponent(archiveId)}`);
    if (!payload.session) throw new Error(t("archiveEmpty"));
    printSettlementPdf(payload.session);
  } catch (error) {
    setFlash(error.message || t("loadFailed"), true);
  }
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

async function syncParticipant(syncSource = "manual", { silent = false, submit = false } = {}) {
  const participant = state.participant?.participant;
  if (!participant || participant.read_only) return null;
  const notebookText = normalizedText(state.participantDraft || participant.notebook_text || "");
  if (submit && !notebookText.trim()) {
    setFlash(t("emptyNotebookSubmit"), true);
    return null;
  }
  const response = await api("participant-save", {
    method: "POST",
    body: JSON.stringify({
      token: participant.invite_token,
      notebook_text: notebookText,
      sync_source: syncSource,
      submit,
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
  if (!silent) setFlash(t(response.sync_result === "submitted" ? "notebookSubmitted" : "saved"));
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
  if (viewerCheckPromise) return viewerCheckPromise;
  viewerCheckPromise = checkViewerNow();
  try {
    return await viewerCheckPromise;
  } finally {
    viewerCheckPromise = null;
  }
}

async function checkViewerNow() {
  state.inviteToken = new URLSearchParams(window.location.search).get("invite") || "";
  if (state.inviteToken) {
    await loadParticipant(state.inviteToken);
    return;
  }

  try {
    const me = await api("me", { timeoutMs: AUTH_TIMEOUT_MS });
    if (me.authenticated) {
      await loadTreasurerBoot();
      return;
    }
  } catch (error) {}

  const cachedProfile = readToolAuthProfile();
  if (cachedProfile?.authenticated && typeof window.fetchToolAuthStatus === "function") {
    try {
      const liveProfile = await withTimeout(
        window.fetchToolAuthStatus({ allowCachedFallback: false }),
        AUTH_TIMEOUT_MS,
        t("requestTimeout")
      );
      if (liveProfile?.authenticated) {
        const me = await api("me", { timeoutMs: AUTH_TIMEOUT_MS });
        if (me.authenticated) {
          await loadTreasurerBoot();
          return;
        }
      }
    } catch (error) {}
  }

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

function withTimeout(promise, timeoutMs, message) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message || t("requestTimeout"))), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

function scheduleViewerCheck() {
  window.clearTimeout(viewerRefreshTimer);
  viewerRefreshTimer = window.setTimeout(() => {
    checkViewer().catch((error) => setFlash(error.message || t("loadFailed"), true));
  }, 120);
}

function render(options = {}) {
  const shouldPreserveWorkspace = options.preserveWorkspace && isModalOpen("workspaceModal");
  const preservedWorkspaceWindow = shouldPreserveWorkspace ? ($("workspaceModal")?.dataset.window || "menu") : "";
  const preservedWorkspaceScroll = shouldPreserveWorkspace ? ($("workspaceModalBody")?.scrollTop || 0) : 0;
  applyTheme();
  syncAppModeClasses();
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
  syncAppModeClasses();
  updateTopbarText();
  if (shouldPreserveWorkspace) {
    window.requestAnimationFrame(() => {
      openWorkspaceModal(preservedWorkspaceWindow, { scrollTop: preservedWorkspaceScroll });
    });
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type !== "SHIP_CASHBOX_SW_ACTIVATED") return;
    if (localStorage.getItem(SHELL_REFRESH_KEY) === event.data.cache) return;
    localStorage.setItem(SHELL_REFRESH_KEY, event.data.cache || SHELL_VERSION);
    window.location.reload();
  });
  navigator.serviceWorker.register("./sw.js").then((registration) => {
    registration.update().catch(() => {});
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
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
    document.body.classList.remove("shipcashbox-notebook-focused");
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
  if (target instanceof HTMLElement && target.dataset.closeAppMenu === "1") {
    closeAppMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeHelpPopovers();
    closeAppMenu();
  }
});

document.addEventListener("brkovicToolAuthChanged", () => {
  scheduleViewerCheck();
});

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("#cashboxAppMenuButton, #cashboxMobileMenuButton").forEach((button) => {
    button.addEventListener("click", openAppMenu);
  });
  $("cashboxMenuWorkspace")?.addEventListener("click", () => {
    closeAppMenu();
    openWorkspaceModal("menu");
  });
  $("cashboxMenuGroup")?.addEventListener("click", () => {
    closeAppMenu();
    openWorkspaceModal(groupWindowForViewer());
  });
  $("cashboxMenuNavdesk")?.addEventListener("click", (event) => {
    event.preventDefault();
    closeAppMenu();
    openExitModal($("cashboxMenuNavdesk")?.getAttribute("href") || "../navdesk.html");
  });
  $("cashboxMenuInstall")?.addEventListener("click", () => {
    handleAppInstallAction().catch((error) => setFlash(error.message || t("loadFailed"), true));
  });
  $("cashboxLanguageList")?.addEventListener("click", async (event) => {
    const button = event.target.closest?.("[data-cashbox-lang]");
    if (!button || button.disabled) return;
    const api = window.BRKOVIC_LANGUAGE;
    if (!api || typeof api.setLanguage !== "function") return;
    button.disabled = true;
    try {
      await api.setLanguage(button.dataset.cashboxLang);
      syncLanguageState(button.dataset.cashboxLang);
      updateTopbarText();
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector(".shipcashbox-app-menu__theme")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-cashbox-theme]");
    if (!button) return;
    localStorage.setItem(THEME_KEY, button.dataset.cashboxTheme === "night" ? "night" : "day");
    applyTheme();
  });
  $("cashboxAccountPanel")?.addEventListener("click", (event) => {
    if (!event.target.closest?.("#cashboxAccountAction")) return;
    handleAppAccountAction().catch((error) => setFlash(error.message || t("loadFailed"), true));
  });
  $("workspaceModalMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  document.querySelector(".topbar .brand")?.addEventListener("click", (event) => {
    event.preventDefault();
    openExitModal(event.currentTarget?.getAttribute("href") || "../index.html#hero");
  });
  $("backToMainSite")?.addEventListener("click", (event) => {
    if (event.currentTarget?.getAttribute("target") === "_blank") return;
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
  bindMobileKeyboardViewport();
  initLanguage();
  await waitForSiteTranslations();
  await purgeLegacyShellCaches();
  registerServiceWorker();
  await checkViewer();
});
