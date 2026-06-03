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
const SHELL_VERSION = "20260603-cashbox-entry-final-order-01";
const SHELL_PURGE_KEY = "ship_cashbox_shell_purge_v1";
const LAST_MODE_KEY = "ship_cashbox_last_explicit_mode_v1";
const EQUALIZER_DRAFT_KEY = "ship_cashbox_equalizer_draft_v1";
const EQUALIZER_HISTORY_KEY = "ship_cashbox_equalizer_history_v1";
const PARTICIPANT_CACHE_PREFIX = "ship_cashbox_participant_cache_v1_";
const PARTICIPANT_DRAFT_PREFIX = "ship_cashbox_participant_draft_v1_";
const PARTICIPANT_SLOT_PREFIX = "ship_cashbox_participant_slot_v1_";
const TREASURER_DRAFT_PREFIX = "ship_cashbox_treasurer_draft_v1_";
const NOTEBOOK_COMMIT_PREFIX = "ship_cashbox_notebook_commits_v1_";
const SCAN_INSERT_PREFIX = "ship_cashbox_scan_insert_v1_";
const RECEIPT_DONE_PREFIX = "ship_cashbox_receipt_done_v1_";
const API_TIMEOUT_MS = 18000;
const AUTH_TIMEOUT_MS = 12000;
const UPLOAD_TIMEOUT_MS = 90000;
const OCR_TIMEOUT_MS = 12000;
const OCR_STATUS_CACHE_MS = 5 * 60 * 1000;
const SCAN_AUTOFILL_DETAILS = false;
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
  participantSaveInFlight: false,
  participantSavePromise: null,
  participantSaveQueued: null,
  treasurerDraft: "",
  treasurerAutosaveTimer: null,
  treasurerSaveInFlight: false,
  treasurerSavePromise: null,
  treasurerSaveQueued: null,
  equalizerLastResult: null,
  scanReview: null,
  scanReviewObjectUrl: "",
  scanReviewZoom: { scale: 1, x: 0, y: 0, pointers: new Map(), lastDistance: 0, dragX: 0, dragY: 0 },
  scanReviewQueue: [],
  scanReviewQueueTotal: 0,
  scanReviewQueueActive: false,
  scanReviewQueueDone: [],
  scanOcrStatus: null,
  scanOcrStatusCheckedAt: 0,
  notebookAssistantSuppressedUntil: {},
  editorLocked: false,
  hiddenAt: 0,
};

const $ = (id) => document.getElementById(id);
let modalScrollY = 0;
let modalBodyPaddingRight = "";
let notebookFocusTimer = 0;
let notebookBlurTimer = 0;
let viewportFrame = 0;
let viewerRefreshTimer = 0;
let viewerCheckPromise = null;

function isModalOpen(id) {
  const modal = $(id);
  return Boolean(modal && !modal.hidden);
}

function anyModalOpen() {
  const appMenu = $("cashboxAppMenuModal");
  const isAppMenuOpen = Boolean(appMenu?.classList.contains("is-open"));
  return isModalOpen("qrModal") || isModalOpen("attachmentSheet") || isModalOpen("scanReviewModal") || isModalOpen("workspaceModal") || isModalOpen("cashboxExitModal") || isAppMenuOpen;
}

function lockModalScroll() {
  if (document.body.classList.contains("shipcashbox-modal-open")) return;
  modalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  modalBodyPaddingRight = document.body.style.paddingRight || "";
  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  document.documentElement.classList.add("shipcashbox-modal-open");
  document.body.classList.add("shipcashbox-modal-open");
  document.body.style.top = `-${modalScrollY}px`;
}

function unlockModalScroll() {
  if (anyModalOpen() || !document.body.classList.contains("shipcashbox-modal-open")) return;
  document.documentElement.classList.remove("shipcashbox-modal-open");
  document.body.classList.remove("shipcashbox-modal-open");
  document.body.style.top = "";
  document.body.style.paddingRight = modalBodyPaddingRight;
  window.scrollTo(0, modalScrollY);
  modalScrollY = 0;
  modalBodyPaddingRight = "";
}

function isNotebookTextarea(target) {
  return target instanceof HTMLElement && target.classList.contains("shipcashbox-notebook-textarea");
}

function setNotebookFocusMode(active) {
  window.clearTimeout(notebookBlurTimer);
  if (document.body) {
    document.body.classList.toggle("shipcashbox-notebook-focused", Boolean(active));
  }
  updateViewportVars();
}

function scheduleNotebookFocusRelease() {
  window.clearTimeout(notebookBlurTimer);
  notebookBlurTimer = window.setTimeout(() => {
    if (isNotebookTextarea(document.activeElement)) return;
    document.body.classList.remove("shipcashbox-notebook-focused");
    updateViewportVars();
  }, 180);
}

function syncViewportVars() {
  viewportFrame = 0;
  const viewport = window.visualViewport;
  const height = Math.max(320, Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0));
  const offsetTop = Math.round(viewport?.offsetTop || 0);
  const keyboardOffset = Math.max(0, Math.round((window.innerHeight || height) - height - offsetTop));
  document.documentElement.style.setProperty("--cashbox-vvh", `${height}px`);
  document.documentElement.style.setProperty("--cashbox-keyboard-offset", `${keyboardOffset}px`);
  document.body.classList.toggle("shipcashbox-keyboard-active", keyboardOffset > 80);
}

function updateViewportVars() {
  if (viewportFrame) return;
  viewportFrame = window.requestAnimationFrame(syncViewportVars);
}

function scheduleFocusedNotebookIntoView(target) {
  window.clearTimeout(notebookFocusTimer);
  // Keep focus stable. Browser scrollIntoView was causing a visible first-click jump on desktop.
  updateViewportVars();
}

function bindMobileKeyboardViewport() {
  updateViewportVars();
  window.visualViewport?.addEventListener("resize", updateViewportVars);
  window.visualViewport?.addEventListener("scroll", updateViewportVars);
  window.addEventListener("resize", updateViewportVars);
  document.addEventListener("focusin", (event) => {
    if (!isNotebookTextarea(event.target)) return;
    setNotebookFocusMode(true);
    scheduleFocusedNotebookIntoView(event.target);
  });
  document.addEventListener("focusout", (event) => {
    if (!isNotebookTextarea(event.target)) return;
    scheduleNotebookFocusRelease();
  });
}

function bindNotebookKeyboardTarget(textarea) {
  if (!(textarea instanceof HTMLElement)) return;
  const activateNotebookKeyboardMode = () => {
    setNotebookFocusMode(true);
    scheduleFocusedNotebookIntoView(textarea);
  };
  textarea.addEventListener("pointerdown", activateNotebookKeyboardMode, { passive: true });
  textarea.addEventListener("touchstart", activateNotebookKeyboardMode, { passive: true });
  textarea.addEventListener("mousedown", activateNotebookKeyboardMode);
  textarea.addEventListener("focus", activateNotebookKeyboardMode);
  textarea.addEventListener("blur", () => {
    scheduleNotebookFocusRelease();
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

function confirmByWord(messageKey, fallback, wordKey, fallbackWord) {
  const word = tx(wordKey, fallbackWord);
  const message = txf(messageKey, fallback, { word });
  const value = window.prompt(message, "");
  return String(value || "").trim().toUpperCase() === String(word || "").trim().toUpperCase();
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

function notebookCommitKey(ownerKey) {
  return `${NOTEBOOK_COMMIT_PREFIX}${ownerKey}`;
}

function scanInsertKey(sessionId) {
  return `${SCAN_INSERT_PREFIX}${sessionId || "local"}`;
}

function receiptDoneKey(sessionId = state.boot?.session?.id) {
  return `${RECEIPT_DONE_PREFIX}${sessionId || "local"}`;
}

function loadReceiptDoneMap(sessionId = state.boot?.session?.id) {
  try {
    const parsed = JSON.parse(localStorage.getItem(receiptDoneKey(sessionId)) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveReceiptDoneMap(map, sessionId = state.boot?.session?.id) {
  try {
    localStorage.setItem(receiptDoneKey(sessionId), JSON.stringify(map || {}));
  } catch (error) {}
}

function purgeReceiptDoneForProof(attachmentId = "", attachmentPath = "") {
  const map = loadReceiptDoneMap();
  let changed = false;
  Object.keys(map).forEach((key) => {
    const item = map[key];
    const sameId = attachmentId && String(item?.attachment_id || "") === attachmentId;
    const samePath = attachmentPath && String(item?.attachment_path || "") === attachmentPath;
    if (!sameId && !samePath) return;
    delete map[key];
    changed = true;
  });
  if (changed) saveReceiptDoneMap(map);
}

function receiptFileName(file) {
  return String(file?.name || "receipt-photo").trim() || "receipt-photo";
}

function isReceiptImageFile(file) {
  const type = String(file?.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  return /\.(?:jpe?g|png|webp|gif|heic|heif)$/i.test(receiptFileName(file));
}

function receiptFileId(file) {
  return hashText([
    state.boot?.session?.id || "local",
    receiptFileName(file),
    file?.size || 0,
    file?.lastModified || 0,
  ].join("|"));
}

function currentNotebookOwnerKey() {
  if (state.viewer === "treasurer") {
    const session = state.boot?.session;
    if (!session?.id) return "";
    return `treasurer_${session.id}_${session.treasurer_participant_id || "owner"}`;
  }
  if (state.viewer === "participant") {
    const token = state.participant?.participant?.invite_token;
    return token ? `participant_${token}` : "";
  }
  return "";
}

function loadNotebookCommits(ownerKey = currentNotebookOwnerKey()) {
  if (!ownerKey) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(notebookCommitKey(ownerKey)) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveNotebookCommits(commits, ownerKey = currentNotebookOwnerKey()) {
  if (!ownerKey) return;
  try {
    localStorage.setItem(notebookCommitKey(ownerKey), JSON.stringify(commits || {}));
  } catch (error) {}
}

function stripNotebookCommitMarker(rawLine) {
  return String(rawLine || "").replace(/^\s*[✓✔]\s*/u, "").trim();
}

function markNotebookLineCommitted(rawLine) {
  const clean = stripNotebookCommitMarker(rawLine);
  return clean ? `✓ ${clean}` : String(rawLine || "");
}

function notebookLineHash(rawLine) {
  return hashText(stripNotebookCommitMarker(rawLine).replace(/\s+/g, " "));
}

function parseNotebookExpenseLine(rawLine) {
  const raw = stripNotebookCommitMarker(rawLine);
  const match = raw.match(/^([+-])?\s*(€)?\s*(\d+(?:[.,]\d+)?)\s+(.+)$/u);
  if (!match) return null;
  const amount = moneyRound(Math.abs(Number(String(match[3] || "0").replace(",", "."))));
  const note = String(match[4] || "").trim();
  if (!amount || !note) return null;
  return { amount, note, raw };
}

function textareaLineInfo(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return null;
  const value = textarea.value || "";
  const cursor = textarea.selectionStart ?? value.length;
  const start = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const nextBreak = value.indexOf("\n", cursor);
  const end = nextBreak === -1 ? value.length : nextBreak;
  const raw = value.slice(start, end);
  const lineIndex = value.slice(0, start).split("\n").length - 1;
  return { value, cursor, start, end, raw, lineIndex };
}

function activeSession() {
  return state.viewer === "treasurer" ? state.boot?.session : state.participant?.session;
}

function hasActiveGroup() {
  const session = activeSession();
  return Boolean(session && session.status === "active");
}

function isPersonalSession(session = activeSession()) {
  return String(session?.session_mode || "") === "personal";
}

function groupWindowForViewer() {
  if (!hasActiveGroup()) return "menu";
  if (isPersonalSession()) return "reports";
  if (state.viewer === "treasurer") return "team";
  if (state.viewer === "participant") return "participant-settlement";
  return "menu";
}

function workspaceMenuTitleLabel() {
  return isPersonalSession() ? tx("personalWorkspaceMenuTitle", "Меню журнала") : t("workspaceMenuTitle");
}

function workspaceMenuActionLabel() {
  return isPersonalSession() ? tx("personalWorkspaceMenuAction", "Меню журнала") : t("workspaceMenuAction");
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
    if (isPersonalSession(session)) return tx("personalModeBadge", "Личный режим");
    return participantDisplayName(treasurer, t("viewerTreasurer"));
  }
  if (state.viewer === "participant") {
    return participantDisplayName(state.participant?.participant, t("viewerParticipant"));
  }
  return t("viewerGuest");
}

function currentModeLabel() {
  if (!hasActiveGroup()) return tx("modeStartLabel", "Старт");
  if (isPersonalSession()) return tx("modePersonalLabel", "Личный");
  if (state.viewer === "participant") return tx("modeParticipantLabel", "Участник");
  return tx("modeGroupLabel", "Команда");
}

function syncAppModeClasses() {
  const active = hasActiveGroup();
  document.body.classList.toggle("shipcashbox-has-active-group", active);
  document.body.classList.toggle("shipcashbox-session-personal", isPersonalSession());
  document.body.classList.toggle("shipcashbox-viewer-treasurer", state.viewer === "treasurer");
  document.body.classList.toggle("shipcashbox-viewer-participant", state.viewer === "participant");
  document.body.classList.toggle("shipcashbox-viewer-guest", state.viewer === "guest");
}

function syncChromeVisibility() {
  const guest = state.viewer === "guest";
  if ($("cashboxGuestTopbar")) $("cashboxGuestTopbar").hidden = !guest;
  if ($("cashboxWorkspaceAppbar")) $("cashboxWorkspaceAppbar").hidden = guest;
  if ($("cashboxMobileMasthead")) $("cashboxMobileMasthead").hidden = guest;
  if ($("cashboxSiteHero")) $("cashboxSiteHero").hidden = true;
}

function isWelcomePreview() {
  const params = new URLSearchParams(window.location.search);
  return params.get("welcome") === "1" || params.get("entry") === "1";
}

function normalizeEntryMode(mode) {
  return mode === "personal" ? "personal" : mode === "group" ? "group" : "";
}

function lastExplicitMode() {
  try {
    return normalizeEntryMode(localStorage.getItem(LAST_MODE_KEY) || "");
  } catch (error) {
    return "";
  }
}

function rememberExplicitMode(mode) {
  const normalized = normalizeEntryMode(mode);
  if (!normalized) return;
  try {
    localStorage.setItem(LAST_MODE_KEY, normalized);
  } catch (error) {}
}

function clearWelcomePreviewUrl() {
  if (!isWelcomePreview()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("welcome");
  url.searchParams.delete("entry");
  url.searchParams.set("reload", SHELL_VERSION);
  window.history.replaceState({}, "", url.toString());
}

function openStartScreen() {
  const url = new URL(window.location.href);
  url.searchParams.delete("invite");
  url.searchParams.delete("inviteCode");
  url.searchParams.delete("entry");
  url.searchParams.delete("tool");
  url.searchParams.set("welcome", "1");
  url.searchParams.set("reload", SHELL_VERSION);
  window.location.assign(url.toString());
}

function isEqualizerToolOpen() {
  const params = new URLSearchParams(window.location.search);
  return isWelcomePreview() && params.get("tool") === "equalizer";
}

function openEqualizerTool() {
  const url = new URL(window.location.href);
  url.searchParams.delete("invite");
  url.searchParams.delete("inviteCode");
  url.searchParams.delete("entry");
  url.searchParams.set("welcome", "1");
  url.searchParams.set("tool", "equalizer");
  url.searchParams.set("reload", SHELL_VERSION);
  window.history.pushState({}, "", url.toString());
  state.viewer = "guest";
  render();
}

function closeEqualizerTool() {
  const url = new URL(window.location.href);
  url.searchParams.delete("tool");
  url.searchParams.set("welcome", "1");
  url.searchParams.set("reload", SHELL_VERSION);
  window.history.pushState({}, "", url.toString());
  state.equalizerLastResult = null;
  render();
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

async function apiForm(action, formData, options = {}) {
  const [name, query = ""] = String(action).split(/(?=&)/, 2);
  const { timeoutMs = UPLOAD_TIMEOUT_MS, ...fetchOptions } = options;
  const response = await fetchWithTimeout(`${API_BASE}${encodeURIComponent(name)}${query}`, {
    credentials: "same-origin",
    cache: "no-store",
    method: "POST",
    body: formData,
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
  if (String(path).startsWith("/ship-cashbox/")) return `${window.location.origin}${path}`;
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

async function resetShipCashboxShell() {
  await clearShipCashboxCaches();
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations
        .filter((registration) => registration.scope.includes("/ship-cashbox/"))
        .map((registration) => registration.unregister()));
    } catch (error) {}
  }
  try {
    localStorage.removeItem(SHELL_PURGE_KEY);
  } catch (error) {}
}

function reloadWithCurrentShell() {
  const url = new URL(window.location.href);
  url.searchParams.set("reload", SHELL_VERSION);
  url.searchParams.set("cache-reset", String(Date.now()));
  window.location.replace(url.toString());
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
  if ($("cashboxStartButtonText")) $("cashboxStartButtonText").textContent = tx("cashboxStartButton", "Старт");
  if ($("cashboxMobileStartButtonText")) $("cashboxMobileStartButtonText").textContent = tx("cashboxStartButton", "Старт");
  if ($("cashboxMenuStart")) $("cashboxMenuStart").textContent = tx("cashboxStartButton", "Старт");
  if ($("workspaceStartButton")) $("workspaceStartButton").textContent = tx("cashboxStartButton", "Старт");
  if ($("cashboxGuestMenuButtonText")) $("cashboxGuestMenuButtonText").textContent = t("cashboxAppMenuButton");
  if ($("cashboxAppMenuButtonText")) $("cashboxAppMenuButtonText").textContent = t("cashboxAppMenuButton");
  if ($("cashboxMobileMenuButtonText")) $("cashboxMobileMenuButtonText").textContent = t("cashboxAppMenuButton");
  if ($("cashboxAppMenuEyebrow")) $("cashboxAppMenuEyebrow").textContent = t("heroTitle");
  if ($("cashboxAppMenuTitle")) $("cashboxAppMenuTitle").textContent = workspaceMenuTitleLabel();
  if ($("cashboxMenuNavdesk")) $("cashboxMenuNavdesk").textContent = t("cashboxMenuNavdesk");
  if ($("cashboxMenuWorkspace")) $("cashboxMenuWorkspace").textContent = workspaceMenuTitleLabel();
  if ($("cashboxMenuGroupText")) $("cashboxMenuGroupText").textContent = isPersonalSession() ? tx("cashboxMenuPersonal", "Журнал") : t("cashboxMenuGroup");
  if ($("cashboxMenuInstall")) $("cashboxMenuInstall").textContent = t("pwa_install_menu");
  if ($("cashboxMenuRefresh")) $("cashboxMenuRefresh").textContent = tx("cacheResetAction", "Обновить приложение");
  if ($("cashboxLanguageKicker")) $("cashboxLanguageKicker").textContent = t("cashboxMenuLanguage");
  if ($("cashboxLanguageTitle")) $("cashboxLanguageTitle").textContent = t("site_menu_language_title");
  if ($("cashboxLanguageNowLabel")) $("cashboxLanguageNowLabel").textContent = t("site_menu_language_current_label");
  if ($("cashboxThemeLabel")) $("cashboxThemeLabel").textContent = t("cashboxMenuTheme");
  if ($("heroEyebrow")) $("heroEyebrow").textContent = t("heroEyebrow");
  if ($("heroTitle")) $("heroTitle").textContent = t("heroTitle");
  if ($("heroIntro")) $("heroIntro").textContent = t("heroIntro");
  if ($("heroDescription")) $("heroDescription").textContent = t("heroDescription");
  if ($("mobileMastheadTitle")) $("mobileMastheadTitle").textContent = t("heroTitle");
  document.querySelectorAll("[data-cashbox-mode-chip]").forEach((chip) => {
    chip.textContent = currentModeLabel();
    chip.title = tx("modeChipHelp", "Текущий режим журнала");
  });
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

function renderNotebookAssistant(id, currency = "EUR", readOnly = false) {
  if (readOnly) return "";
  return `
    <div class="shipcashbox-line-assistant" id="${escapeHtml(id)}Assistant" hidden>
      <div class="shipcashbox-line-assistant__copy">
        <span class="shipcashbox-line-assistant__eyebrow" id="${escapeHtml(id)}AssistantState">${escapeHtml(t("lineAssistantReady"))}</span>
        <strong id="${escapeHtml(id)}AssistantPreview"></strong>
      </div>
      <button class="shipcashbox-line-assistant__button" type="button" id="${escapeHtml(id)}CommitButton" data-currency="${escapeHtml(currency)}">${escapeHtml(t("lineCommitAction"))}</button>
      <a class="shipcashbox-line-assistant__button shipcashbox-line-assistant__proof" id="${escapeHtml(id)}ProofLink" href="#" target="_blank" rel="noopener" hidden>${escapeHtml(t("lineProofAction"))}</a>
    </div>
  `;
}

function currentAttachmentByProof(commit) {
  const attachmentId = String(commit?.attachment_id || "");
  const proofPath = String(commit?.attachment_path || "");
  return (state.boot?.session?.attachments || []).find((attachment) => (
    (attachmentId && String(attachment?.id || "") === attachmentId)
    || (proofPath && String(attachment?.file_path || "") === proofPath)
  )) || null;
}

function renderNotebookProofRail(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const rail = $(`${textarea.id}ProofRail`);
  if (!rail) return;
  const commits = loadNotebookCommits(currentNotebookOwnerKey());
  const style = window.getComputedStyle(textarea);
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  const lineHeight = Number.parseFloat(style.lineHeight) || (fontSize * 1.55);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  const currency = state.boot?.session?.currency || state.participant?.session?.currency || "EUR";
  const visibleTop = -lineHeight;
  const visibleBottom = textarea.clientHeight - paddingBottom + lineHeight;
  const anchors = String(textarea.value || "").split("\n").map((rawLine, lineIndex) => {
    const parsed = parseNotebookExpenseLine(rawLine);
    if (!parsed) return "";
    const lineHash = notebookLineHash(parsed.raw);
    const commit = commits[lineHash];
    const proofPath = String(commit?.attachment_path || "");
    const attachment = currentAttachmentByProof(commit);
    if (!proofPath || !attachment) return "";
    const top = paddingTop + (lineIndex * lineHeight) - textarea.scrollTop + Math.max(0, (lineHeight - 24) / 2);
    if (top < visibleTop || top > visibleBottom) return "";
    const label = `${money(commit.amount || parsed.amount, currency)} · ${commit.note || parsed.note}`;
    return `
      <span class="shipcashbox-notebook-proof-clip" style="top:${Math.round(top)}px" tabindex="0" title="${escapeHtml(label)}" aria-label="${escapeHtml(`${t("lineProofAction")}: ${label}`)}">
        <span class="shipcashbox-notebook-proof-clip__icon" aria-hidden="true">📎</span>
        <span class="shipcashbox-notebook-proof-menu">
          <a href="${escapeHtml(resolveAdminAssetUrl(proofPath))}" target="_blank" rel="noopener">${escapeHtml(t("lineProofAction"))}</a>
          <button type="button" data-proof-delete="1" data-line-hash="${escapeHtml(lineHash)}" data-scan-id="${escapeHtml(commit?.scan_id || "")}" data-attachment-id="${escapeHtml(attachment.id || "")}" data-attachment-path="${escapeHtml(attachment.file_path || proofPath)}">${escapeHtml(t("removePhoto"))}</button>
        </span>
      </span>
    `;
  }).join("");
  rail.innerHTML = anchors;
  rail.hidden = !anchors;
}

function syncNotebookDraftFromTextarea(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  if (textarea.id === "treasurerNotebook") {
    saveTreasurerDraft(textarea.value);
    setNotebookMeta("treasurerSaveMeta", t("autosavePending"));
    scheduleTreasurerAutosave();
  } else if (textarea.id === "participantNotebook") {
    saveParticipantDraft(textarea.value);
    setNotebookMeta("participantSyncMeta", participantSyncSummary());
  }
}

function clearStaleNotebookCommitMarker(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return false;
  const info = textareaLineInfo(textarea);
  if (!info || !/^\s*[✓✔]\s*/u.test(info.raw)) return false;
  const cleanLine = info.raw.replace(/^\s*[✓✔]\s*/u, "");
  const parsed = parseNotebookExpenseLine(cleanLine);
  const commits = loadNotebookCommits(currentNotebookOwnerKey());
  if (parsed && commits[notebookLineHash(cleanLine)]) return false;

  const prefixMatch = info.raw.match(/^\s*[✓✔]\s*/u);
  const removedLength = prefixMatch ? prefixMatch[0].length : 0;
  const nextValue = `${info.value.slice(0, info.start)}${cleanLine}${info.value.slice(info.end)}`;
  const cursor = textarea.selectionStart ?? info.cursor;
  const nextCursor = cursor > info.start ? Math.max(info.start, cursor - removedLength) : cursor;
  textarea.value = nextValue;
  textarea.selectionStart = nextCursor;
  textarea.selectionEnd = nextCursor;
  syncNotebookDraftFromTextarea(textarea);
  return true;
}

function hideNotebookAssistant(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const assistant = $(`${textarea.id}Assistant`);
  if (!assistant) return;
  assistant.hidden = true;
  assistant.setAttribute("aria-hidden", "true");
  assistant.classList.remove("is-committed", "is-flashing", "is-idle");
}

function suppressNotebookAssistant(idOrTextarea, durationMs = 1800) {
  const id = idOrTextarea instanceof HTMLTextAreaElement ? idOrTextarea.id : String(idOrTextarea || "");
  if (!id) return;
  state.notebookAssistantSuppressedUntil[id] = Date.now() + durationMs;
  hideNotebookAssistant($(id));
}

function isNotebookAssistantSuppressed(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return false;
  const until = Number(state.notebookAssistantSuppressedUntil?.[textarea.id] || 0);
  if (!until) return false;
  if (Date.now() <= until) return true;
  delete state.notebookAssistantSuppressedUntil[textarea.id];
  return false;
}

function updateNotebookAssistant(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const assistant = $(`${textarea.id}Assistant`);
  const preview = $(`${textarea.id}AssistantPreview`);
  const stateLabel = $(`${textarea.id}AssistantState`);
  const button = $(`${textarea.id}CommitButton`);
  const proofLink = $(`${textarea.id}ProofLink`);
  if (!assistant || !preview || !stateLabel || !(button instanceof HTMLButtonElement)) return;

  if (isNotebookAssistantSuppressed(textarea)) {
    hideNotebookAssistant(textarea);
    renderNotebookProofRail(textarea);
    return;
  }

  clearStaleNotebookCommitMarker(textarea);
  const info = textareaLineInfo(textarea);
  const parsed = parseNotebookExpenseLine(info?.raw || "");
  if (!parsed) {
    const reserveSpace = document.activeElement === textarea;
    assistant.hidden = !reserveSpace;
    assistant.setAttribute("aria-hidden", reserveSpace ? "true" : "false");
    assistant.classList.remove("is-committed", "is-flashing");
    assistant.classList.toggle("is-idle", reserveSpace);
    preview.textContent = "\u00a0";
    stateLabel.textContent = t("lineAssistantReady");
    button.disabled = true;
    if (proofLink instanceof HTMLAnchorElement) {
      proofLink.hidden = true;
      proofLink.removeAttribute("href");
    }
    return;
  }

  const ownerKey = currentNotebookOwnerKey();
  const commits = loadNotebookCommits(ownerKey);
  const lineHash = notebookLineHash(parsed.raw);
  const commit = commits[lineHash] || null;
  const committed = Boolean(commit);
  const proofPath = String(commit?.attachment_path || "");
  const proofAttachment = currentAttachmentByProof(commit);
  const currency = button.dataset.currency || "EUR";
  assistant.hidden = false;
  assistant.setAttribute("aria-hidden", "false");
  assistant.dataset.lineHash = lineHash;
  assistant.dataset.rawLine = parsed.raw;
  assistant.dataset.lineStart = String(info.start);
  assistant.dataset.lineEnd = String(info.end);
  assistant.classList.remove("is-idle");
  assistant.classList.toggle("is-committed", committed);
  preview.textContent = `${money(parsed.amount, currency)} · ${parsed.note}`;
  stateLabel.textContent = committed ? t("lineCommittedState") : t("lineAssistantReady");
  button.textContent = committed ? t("lineCommittedAction") : t("lineCommitAction");
  button.disabled = false;
  if (proofLink instanceof HTMLAnchorElement) {
    proofLink.hidden = !(committed && proofPath && proofAttachment);
    if (committed && proofPath && proofAttachment) {
      proofLink.href = resolveAdminAssetUrl(proofPath);
    } else {
      proofLink.removeAttribute("href");
    }
  }
  renderNotebookProofRail(textarea);
}

function commitCurrentNotebookLine(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return false;
  const info = textareaLineInfo(textarea);
  const parsed = parseNotebookExpenseLine(info?.raw || "");
  if (!parsed) return false;
  const ownerKey = currentNotebookOwnerKey();
  if (!ownerKey) return false;
  const lineHash = notebookLineHash(parsed.raw);
  const commits = loadNotebookCommits(ownerKey);
  const previousCommit = commits[lineHash] || {};
  commits[lineHash] = {
    ...previousCommit,
    amount: parsed.amount,
    note: parsed.note,
    raw: parsed.raw,
    committed_at: new Date().toISOString(),
  };
  saveNotebookCommits(commits, ownerKey);
  if (info && !/^\s*[✓✔]\s*/u.test(info.raw)) {
    const markedLine = markNotebookLineCommitted(info.raw);
    const nextValue = `${info.value.slice(0, info.start)}${markedLine}${info.value.slice(info.end)}`;
    const nextCursor = info.start + markedLine.length;
    textarea.value = nextValue;
    textarea.selectionStart = nextCursor;
    textarea.selectionEnd = nextCursor;
    syncNotebookDraftFromTextarea(textarea);
  }
  updateNotebookAssistant(textarea);
  const assistant = $(`${textarea.id}Assistant`);
  assistant?.classList.add("is-flashing");
  window.setTimeout(() => assistant?.classList.remove("is-flashing"), 520);
  setNotebookMeta(textarea.id === "treasurerNotebook" ? "treasurerSaveMeta" : "participantSyncMeta", t("lineCommittedToast"));
  textarea.focus({ preventScroll: true });
  return true;
}

function clearNotebookProofCommit(attachmentId = "", attachmentPath = "", lineHash = "") {
  const ownerKey = currentNotebookOwnerKey();
  if (!ownerKey) return;
  const commits = loadNotebookCommits(ownerKey);
  let changed = false;
  if (lineHash && commits[lineHash]) {
    commits[lineHash] = {
      ...commits[lineHash],
      attachment_id: "",
      attachment_path: "",
      attachment_name: "",
    };
    saveNotebookCommits(commits, ownerKey);
    return;
  }
  Object.keys(commits).forEach((key) => {
    const commit = commits[key];
    const sameId = attachmentId && String(commit?.attachment_id || "") === attachmentId;
    const samePath = attachmentPath && String(commit?.attachment_path || "") === attachmentPath;
    if (!sameId && !samePath) return;
    commits[key] = {
      ...commit,
      attachment_id: "",
      attachment_path: "",
      attachment_name: "",
    };
    changed = true;
  });
  if (changed) saveNotebookCommits(commits, ownerKey);
}

async function deleteNotebookProofAttachment(attachmentId = "", attachmentPath = "", lineHash = "", scanId = "", textarea = $("treasurerNotebook")) {
  attachmentId = String(attachmentId || "");
  attachmentPath = String(attachmentPath || "");
  scanId = String(scanId || "");
  if (!attachmentId && !attachmentPath) return;
  if (!window.confirm(t("removePhotoConfirm"))) return;
  try {
    const statusId = textarea instanceof HTMLTextAreaElement && textarea.id === "participantNotebook" ? "participantSyncMeta" : "treasurerSaveMeta";
    setNotebookMeta(statusId, t("removingPhoto"));
    await deleteCashboxAttachment(attachmentId, { renderAfter: false });
    clearNotebookProofCommit(attachmentId, attachmentPath, lineHash);
    purgeReceiptDoneForProof(attachmentId, attachmentPath);
    forgetScanInserted(scanId);
    render({ preserveWorkspace: true });
    setNotebookMeta(statusId, treasurerNotebookSummary());
    setFlash(t("photoRemoved"));
  } catch (error) {
    const statusId = textarea instanceof HTMLTextAreaElement && textarea.id === "participantNotebook" ? "participantSyncMeta" : "treasurerSaveMeta";
    setNotebookMeta(statusId, treasurerNotebookSummary());
    setFlash(error.message || t("deletePhotoFailed"), true);
  }
}

function bindNotebookAssistant(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const update = () => updateNotebookAssistant(textarea);
  textarea.addEventListener("input", update);
  textarea.addEventListener("keyup", update);
  textarea.addEventListener("click", update);
  textarea.addEventListener("select", update);
  textarea.addEventListener("focus", update);
  textarea.addEventListener("blur", () => {
    window.setTimeout(update, 200);
  });
  textarea.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const parsed = parseNotebookExpenseLine(textareaLineInfo(textarea)?.raw || "");
    if (!parsed) return;
    commitCurrentNotebookLine(textarea);
  });
  $(`${textarea.id}CommitButton`)?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });
  $(`${textarea.id}CommitButton`)?.addEventListener("click", () => {
    commitCurrentNotebookLine(textarea);
  });
  update();
}

function bindNotebookProofRail(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const update = () => renderNotebookProofRail(textarea);
  const rail = $(`${textarea.id}ProofRail`);
  rail?.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-proof-delete]") : null;
    if (!(button instanceof HTMLElement)) return;
    event.preventDefault();
    event.stopPropagation();
    deleteNotebookProofAttachment(button.dataset.attachmentId || "", button.dataset.attachmentPath || "", button.dataset.lineHash || "", button.dataset.scanId || "", textarea);
  });
  textarea.addEventListener("input", update);
  textarea.addEventListener("scroll", update);
  textarea.addEventListener("keyup", update);
  textarea.addEventListener("click", update);
  textarea.addEventListener("focus", update);
  window.addEventListener("resize", update);
  window.visualViewport?.addEventListener("resize", update);
  update();
}

function bindNotebookKeepFocus(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  document.querySelectorAll(".notebook-keep-focus").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      if (document.activeElement === textarea) event.preventDefault();
    });
  });
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

function renderExports(exports = [], options = {}) {
  if (!exports.length) return "";
  const grouped = Object.fromEntries(exports.map((item) => [item.type, item.file_path]));
  const settlementPdfLabel = options.personal ? tx("personalExportReportPdf", "Отчет PDF") : t("exportSettlementPdf");
  const settlementTxtLabel = options.personal ? tx("personalExportReportTxt", "Отчет TXT") : t("exportSettlementTxt");
  return `
    <div class="shipcashbox-share-actions">
      ${grouped.settlement_pdf ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.settlement_pdf)}" target="_blank" rel="noopener">${escapeHtml(settlementPdfLabel)}</a>` : ""}
      ${grouped.settlement_txt ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.settlement_txt)}" target="_blank" rel="noopener">${escapeHtml(settlementTxtLabel)}</a>` : ""}
      ${grouped.expense_log_pdf ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.expense_log_pdf)}" target="_blank" rel="noopener">${escapeHtml(t("exportLogPdf"))}</a>` : ""}
      ${grouped.expense_log_txt ? `<a class="btn btn--secondary" href="${escapeHtml(grouped.expense_log_txt)}" target="_blank" rel="noopener">${escapeHtml(t("exportLogTxt"))}</a>` : ""}
    </div>
  `;
}

function parseEqualizerInput(text) {
  const entries = new Map();
  const errors = [];
  String(text || "").split(/\n+/).forEach((line, index) => {
    const raw = line.replace(/^[\s\-•*]+/u, "").trim();
    if (!raw) return;
    const match = raw.match(/^(.+?)\s+([+-]?(?:\d[\d\s]*(?:[.,]\d{1,2})?|\d*[.,]\d{1,2}))\s*(?:eur|€)?$/i);
    if (!match) {
      errors.push(`${index + 1}: ${raw}`);
      return;
    }
    const name = match[1].replace(/\s+/g, " ").trim();
    const amount = moneyRound(Number.parseFloat(match[2].replace(/\s+/g, "").replace(",", ".")));
    if (!name || !Number.isFinite(amount) || amount < 0) {
      errors.push(`${index + 1}: ${raw}`);
      return;
    }
    const key = name.toLowerCase();
    const previous = entries.get(key) || { name, amount: 0 };
    previous.amount = moneyRound(previous.amount + amount);
    entries.set(key, previous);
  });
  return { entries: Array.from(entries.values()), errors };
}

function buildEqualizerSettlement(entries) {
  const people = entries.slice(0, 40);
  const total = moneyRound(people.reduce((sum, person) => sum + Number(person.amount || 0), 0));
  const share = people.length ? moneyRound(total / people.length) : 0;
  const debtors = [];
  const creditors = [];
  people.forEach((person) => {
    const balance = moneyRound(Number(person.amount || 0) - share);
    const item = { ...person, balance };
    if (balance < -0.009) debtors.push({ ...item, due: moneyRound(Math.abs(balance)) });
    if (balance > 0.009) creditors.push({ ...item, due: moneyRound(balance) });
  });
  debtors.sort((a, b) => b.due - a.due);
  creditors.sort((a, b) => b.due - a.due);

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = moneyRound(Math.min(debtor.due, creditor.due));
    if (amount > 0.009) {
      transfers.push({ fromName: debtor.name, toName: creditor.name, amount });
    }
    debtor.due = moneyRound(debtor.due - amount);
    creditor.due = moneyRound(creditor.due - amount);
    if (debtor.due <= 0.009) debtorIndex += 1;
    if (creditor.due <= 0.009) creditorIndex += 1;
  }

  return { people, total, share, transfers };
}

function renderEqualizerResult(settlement, currency = "EUR") {
  if (!settlement.people.length) return "";
  const peopleHtml = settlement.people.map((person, index) => {
    const balance = Number(person.balance || 0);
    const tone = balance > 0.009 ? "positive" : balance < -0.009 ? "negative" : "neutral";
    return `
      <div class="shipcashbox-equalizer-person shipcashbox-equalizer-person--${tone}">
        <span><i class="debt-avatar debt-avatar--${index % 8}">${escapeHtml(participantInitials(person.name, index))}</i>${escapeHtml(person.name)}</span>
        <strong>${escapeHtml(money(person.amount, currency))}</strong>
        <em>${escapeHtml(money(balance, currency, true))}</em>
      </div>
    `;
  }).join("");
  const transfersHtml = settlement.transfers.length
    ? settlement.transfers.map((line) => `
      <article class="shipcashbox-equalizer-transfer">
        <b>${escapeHtml(line.fromName)}</b>
        <span aria-hidden="true">→</span>
        <b>${escapeHtml(line.toName)}</b>
        <strong>${escapeHtml(money(line.amount, currency))}</strong>
      </article>
    `).join("")
    : `<div class="shipcashbox-equalizer-empty">${escapeHtml(t("noTransfers"))}</div>`;
  return `
    <div class="shipcashbox-equalizer-result">
      <div class="shipcashbox-equalizer-summary">
        <span><b>${escapeHtml(String(settlement.people.length))}</b>${escapeHtml(tx("equalizerPeople", "людей"))}</span>
        <span><b>${escapeHtml(money(settlement.total, currency))}</b>${escapeHtml(tx("equalizerTotal", "всего"))}</span>
        <span><b>${escapeHtml(money(settlement.share, currency))}</b>${escapeHtml(tx("equalizerShare", "доля"))}</span>
      </div>
      <div class="shipcashbox-equalizer-grid">
        <section>
          <h3>${escapeHtml(tx("equalizerFinalTransfers", "Финальные переводы"))}</h3>
          <div class="shipcashbox-equalizer-transfers">${transfersHtml}</div>
        </section>
        <section>
          <h3>${escapeHtml(tx("equalizerBalances", "Баланс участников"))}</h3>
          <div class="shipcashbox-equalizer-people">${peopleHtml}</div>
        </section>
      </div>
    </div>
  `;
}

function loadEqualizerDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(EQUALIZER_DRAFT_KEY) || "{}");
    return {
      currency: String(draft.currency || "EUR").trim().toUpperCase().slice(0, 6) || "EUR",
      input: String(draft.input || ""),
    };
  } catch (error) {
    return { currency: "EUR", input: "" };
  }
}

function saveEqualizerDraft(input = "", currency = "EUR") {
  try {
    localStorage.setItem(EQUALIZER_DRAFT_KEY, JSON.stringify({
      input: String(input || ""),
      currency: String(currency || "EUR").trim().toUpperCase().slice(0, 6) || "EUR",
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {}
}

function loadEqualizerHistory() {
  try {
    const items = JSON.parse(localStorage.getItem(EQUALIZER_HISTORY_KEY) || "[]");
    return Array.isArray(items) ? items.filter((item) => item && typeof item === "object").slice(0, 12) : [];
  } catch (error) {
    return [];
  }
}

function saveEqualizerHistory(items = []) {
  try {
    localStorage.setItem(EQUALIZER_HISTORY_KEY, JSON.stringify(items.slice(0, 12)));
  } catch (error) {}
}

function renderEqualizerHistory() {
  const items = loadEqualizerHistory();
  if (!items.length) {
    return `<div class="shipcashbox-equalizer-empty">${escapeHtml(tx("equalizerNoSaved", "Сохраненных расчетов пока нет."))}</div>`;
  }
  return `
    <div class="shipcashbox-equalizer-history">
      ${items.map((item) => `
        <article class="shipcashbox-equalizer-saved">
          <div class="shipcashbox-equalizer-saved__head">
            <div>
              <strong>${escapeHtml(item.title || tx("equalizerSavedFallback", "Расчет"))}</strong>
              <span>${escapeHtml(formatDateTime(item.savedAt || ""))}</span>
            </div>
            <div>
              <b>${escapeHtml(money(item.total || 0, item.currency || "EUR"))}</b>
              <span>${escapeHtml(tx("equalizerShare", "доля"))}: ${escapeHtml(money(item.share || 0, item.currency || "EUR"))}</span>
            </div>
          </div>
          <div class="shipcashbox-equalizer-saved__transfers">
            ${(item.transfers || []).length
              ? item.transfers.map((line) => `<span>${escapeHtml(line.fromName || "-")} → ${escapeHtml(line.toName || "-")} <b>${escapeHtml(money(line.amount || 0, item.currency || "EUR"))}</b></span>`).join("")
              : `<span>${escapeHtml(t("noTransfers"))}</span>`}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function refreshEqualizerHistory() {
  const target = $("equalizerHistory");
  if (target) target.innerHTML = renderEqualizerHistory();
}

function calculateGuestEqualizer() {
  const input = $("equalizerInput");
  const output = $("equalizerResult");
  const currency = String($("equalizerCurrency")?.value || "EUR").trim().toUpperCase().slice(0, 6) || "EUR";
  if (!(input instanceof HTMLTextAreaElement) || !output) return null;
  saveEqualizerDraft(input.value, currency);
  const parsed = parseEqualizerInput(input.value);
  state.equalizerLastResult = null;
  if (parsed.errors.length) {
    output.innerHTML = `<div class="shipcashbox-equalizer-error">${escapeHtml(tx("equalizerParseError", "Не понял строки"))}: ${escapeHtml(parsed.errors.slice(0, 3).join("; "))}</div>`;
    return null;
  }
  if (parsed.entries.length < 2) {
    output.innerHTML = `<div class="shipcashbox-equalizer-error">${escapeHtml(tx("equalizerNeedTwo", "Нужно минимум два человека."))}</div>`;
    return null;
  }
  if (parsed.entries.length > 40) {
    output.innerHTML = `<div class="shipcashbox-equalizer-error">${escapeHtml(tx("equalizerMaxPeople", "Максимум 40 человек."))}</div>`;
    return null;
  }
  const settlement = buildEqualizerSettlement(parsed.entries);
  state.equalizerLastResult = {
    input: input.value,
    currency,
    settlement,
  };
  output.innerHTML = renderEqualizerResult(settlement, currency);
  return state.equalizerLastResult;
}

function saveCurrentEqualizerResult() {
  const current = state.equalizerLastResult || calculateGuestEqualizer();
  if (!current?.settlement?.people?.length) return;
  const title = (current.settlement.people || []).slice(0, 3).map((person) => person.name).join(", ");
  const item = {
    id: `equalizer-${Date.now()}`,
    title: title || tx("equalizerSavedFallback", "Расчет"),
    savedAt: new Date().toISOString(),
    input: current.input,
    currency: current.currency,
    total: current.settlement.total,
    share: current.settlement.share,
    people: current.settlement.people,
    transfers: current.settlement.transfers,
  };
  saveEqualizerHistory([item, ...loadEqualizerHistory()]);
  refreshEqualizerHistory();
  setFlash(tx("equalizerSaved", "Расчет сохранен на этом устройстве."));
}

function renderEqualizerTool() {
  const draft = loadEqualizerDraft();
  const inputValue = draft.input || "Лех 200\nВоа 467\nКатя 600";
  $("guestView").innerHTML = `
    <div class="shipcashbox-entry-screen shipcashbox-equalizer-page">
      <section class="shipcashbox-entry-hero shipcashbox-entry-hero--compact">
        <div class="shipcashbox-entry-hero__copy">
          <p>${escapeHtml(tx("equalizerKicker", "Быстрый расчет"))}</p>
          <h2>${escapeHtml(tx("equalizerPageTitle", "Быстрый финансовый расчет"))}</h2>
          <span>${escapeHtml(tx("equalizerPageText", "Отдельный расчет без создания журнала: внесите людей и суммы, получите финальные переводы и сохраните результат на этом устройстве."))}</span>
        </div>
        <button class="btn btn--secondary" type="button" id="equalizerBackButton">${escapeHtml(tx("equalizerBackToStart", "На старт"))}</button>
      </section>

      <section class="shipcashbox-equalizer-board">
        <div class="shipcashbox-equalizer-board__input">
          <div class="shipcashbox-card__head">
            <div>
              <p class="section-heading__eyebrow">${escapeHtml(tx("equalizerKicker", "Быстрый расчет"))}</p>
              <h2>${escapeHtml(tx("equalizerTitle", "Посчитать вручную"))}</h2>
            </div>
          </div>
          <div class="shipcashbox-equalizer">
            <label class="shipcashbox-field shipcashbox-field--compact">
              <span>${escapeHtml(t("sessionCurrency"))}</span>
              <input type="text" id="equalizerCurrency" value="${escapeHtml(draft.currency || "EUR")}" maxlength="6">
            </label>
            <label class="shipcashbox-field">
              <span>${escapeHtml(tx("equalizerInputLabel", "Кто сколько оплатил"))}</span>
              <textarea id="equalizerInput" rows="7" spellcheck="false">${escapeHtml(inputValue)}</textarea>
            </label>
            <div class="shipcashbox-actions">
              <button class="btn btn--primary" type="button" id="equalizerCalculateButton">${escapeHtml(tx("equalizerAction", "Посчитать переводы"))}</button>
              <button class="btn btn--secondary" type="button" id="equalizerSaveButton">${escapeHtml(tx("equalizerSaveAction", "Сохранить расчет"))}</button>
            </div>
            <p class="shipcashbox-note">${escapeHtml(tx("equalizerSaveText", "Сохранение локальное: расчет останется на этом устройстве и не создаст групповую кассу."))}</p>
          </div>
        </div>
        <div class="shipcashbox-equalizer-board__result">
          <div id="equalizerResult" class="shipcashbox-equalizer-output" aria-live="polite"></div>
          <section>
            <div class="shipcashbox-card__head">
              <div>
                <p class="section-heading__eyebrow">${escapeHtml(tx("equalizerSavedKicker", "Сохранено"))}</p>
                <h2>${escapeHtml(tx("equalizerSavedTitle", "Последние расчеты"))}</h2>
              </div>
            </div>
            <div id="equalizerHistory">${renderEqualizerHistory()}</div>
          </section>
        </div>
      </section>
    </div>
  `;

  $("equalizerBackButton")?.addEventListener("click", closeEqualizerTool);
  $("equalizerCalculateButton")?.addEventListener("click", calculateGuestEqualizer);
  $("equalizerSaveButton")?.addEventListener("click", saveCurrentEqualizerResult);
  $("equalizerInput")?.addEventListener("input", () => {
    const output = $("equalizerResult");
    if (output) output.innerHTML = "";
    state.equalizerLastResult = null;
    saveEqualizerDraft($("equalizerInput")?.value || "", $("equalizerCurrency")?.value || "EUR");
  });
  $("equalizerCurrency")?.addEventListener("input", () => {
    state.equalizerLastResult = null;
    saveEqualizerDraft($("equalizerInput")?.value || "", $("equalizerCurrency")?.value || "EUR");
  });
}

function renderEntryHeroText() {
  let text = escapeHtml(tx("entryText", "Деньги исчезают тихо. + получил-сохрани, - потратил-запиши!"));
  text = text.replace(/(^|[\s(])\+(?=\s)/, '$1<span class="shipcashbox-entry-sign shipcashbox-entry-sign--plus">+</span>');
  text = text.replace(/([,.!]\s*)-(?=\s)/, '$1<span class="shipcashbox-entry-sign shipcashbox-entry-sign--minus">-</span>');
  return text;
}

async function hasCashboxOwnerAccess() {
  try {
    const me = await api("me", { timeoutMs: AUTH_TIMEOUT_MS });
    return Boolean(me?.authenticated);
  } catch (error) {
    return false;
  }
}

async function ensureCashboxOwnerAccess() {
  if (await hasCashboxOwnerAccess()) return true;

  if (typeof window.ensureToolAccess === "function") {
    const allowed = await window.ensureToolAccess({ requireLive: !IS_LOCAL });
    if (!allowed) return false;
  } else if (typeof window.openToolAuthPrompt === "function") {
    const result = await window.openToolAuthPrompt();
    if (!result?.authenticated) return false;
  }

  return await hasCashboxOwnerAccess();
}

async function startEntryMode(mode = "group") {
  clearWelcomePreviewUrl();
  const sessionMode = mode === "personal" ? "personal" : "group";
  rememberExplicitMode(sessionMode);
  const hasAccess = await ensureCashboxOwnerAccess();
  if (!hasAccess) {
    setFlash(tx("authRequired", "Нужно войти, чтобы открыть журнал."), true);
    return;
  }

  const boot = await api(`boot&mode=${encodeURIComponent(sessionMode)}`);
  if (boot.session) {
    state.viewer = "treasurer";
    state.boot = boot;
    state.treasurerDraft = loadTreasurerDraft(
      boot.session?.id,
      (boot.session?.participants || []).find((participant) => participant.id === boot.session?.treasurer_participant_id)?.notebook_text || ""
    );
    saveCache(BOOT_CACHE_KEY, boot);
    render();
    return;
  }

  const payload = await api("create-session", {
    method: "POST",
    body: JSON.stringify({
      mode: sessionMode,
      title: sessionMode === "personal" ? tx("personalDefaultTitle", "Личный журнал расходов") : tx("groupDefaultTitle", "Судовая касса"),
      opening_balance: sessionMode === "personal" ? "0" : 0,
    }),
  });
  state.viewer = "treasurer";
  state.boot = payload;
  clearTreasurerDraft(payload.session?.id);
  saveCache(BOOT_CACHE_KEY, payload);
  localStorage.setItem(ENGAGED_KEY, "1");
  render();
}

function renderGuest() {
  if (isEqualizerToolOpen()) {
    renderEqualizerTool();
    return;
  }
  $("guestView").innerHTML = `
    <div class="shipcashbox-entry-screen">
      <section class="shipcashbox-entry-hero">
        <div class="shipcashbox-entry-hero__copy">
          <p>${escapeHtml(tx("entryEyebrow", "VETUS NAUTA"))}</p>
          <h2>${escapeHtml(tx("entryTitle", "Судовой журнал расходов"))}</h2>
          <span>${renderEntryHeroText()}</span>
        </div>
      </section>

      <div class="shipcashbox-entry-grid">
        <section class="shipcashbox-entry-card shipcashbox-entry-card--journal">
          <div class="shipcashbox-entry-card__media" aria-hidden="true">
            <img src="/ship-cashbox/assets/welcome-journal.webp" alt="" loading="eager" decoding="async">
          </div>
          <div class="shipcashbox-entry-card__copy">
            <h2>${escapeHtml(tx("entryPersonalTitle", "Личный учет"))}</h2>
            <p>${escapeHtml(tx("entryPersonalText", "Личный журнал: приходы со знаком плюс, расходы обычными строками, сохраненные записи и простой отчет."))}</p>
            <button class="btn btn--primary" type="button" data-entry-start="personal">${escapeHtml(tx("entryPersonalAction", "К учету"))}</button>
          </div>
        </section>

        <section class="shipcashbox-entry-card shipcashbox-entry-card--crew">
          <div class="shipcashbox-entry-card__copy">
            <h2>${escapeHtml(tx("entryCrewTitle", "Команда"))}</h2>
            <p>${escapeHtml(tx("entryCrewText", "Общий блокнот, взносы и финальное выравнивание команды."))}</p>
            <button class="btn btn--primary" type="button" data-entry-start="group">${escapeHtml(tx("entryCrewAction", "К кассе"))}</button>
          </div>
          <div class="shipcashbox-entry-card__media" aria-hidden="true">
            <img src="/ship-cashbox/assets/welcome-crew.webp" alt="" loading="eager" decoding="async">
          </div>
        </section>

        <section class="shipcashbox-entry-card shipcashbox-entry-card--equalizer">
          <div class="shipcashbox-entry-card__copy">
            <h2>${escapeHtml(tx("equalizerTitle", "Посчитать вручную"))}</h2>
            <p>${escapeHtml(tx("equalizerText", "Быстрый расчет для команды: кто внес больше, кто должен доплатить, без создания журнала."))}</p>
            <button class="btn btn--primary" type="button" id="openEqualizerToolButton">${escapeHtml(tx("equalizerOpenAction", "Открыть расчет"))}</button>
            <p class="shipcashbox-note">${escapeHtml(tx("equalizerCardNote", "Отдельная страница: ввод, итоговые переводы и локальное сохранение результата."))}</p>
          </div>
          <div class="shipcashbox-entry-card__media" aria-hidden="true">
            <img src="/ship-cashbox/assets/welcome-calculator.webp" alt="" loading="eager" decoding="async">
          </div>
        </section>
      </div>

      <form class="shipcashbox-entry-invite" id="inviteForm">
        <div class="shipcashbox-entry-invite__copy">
          <strong>${escapeHtml(tx("entryInviteCardTitle", "Приглашение в группу"))}</strong>
          <span>${escapeHtml(tx("entryInviteCardText", "Введите код из письма казначея, чтобы открыть свою роль участника в этой группе."))}</span>
        </div>
        <label class="shipcashbox-field">
          <span>${escapeHtml(t("guestToken"))}</span>
          <input type="text" id="inviteTokenField" value="${escapeHtml(state.inviteToken || "")}" inputmode="numeric" autocomplete="one-time-code" placeholder="000000">
        </label>
        <button class="btn btn--secondary" type="submit">${escapeHtml(t("guestOpen"))}</button>
        <div class="shipcashbox-entry-rights">${escapeHtml(tx("entryCopyright", "© Vetus Nauta / Brkovic. All rights reserved."))}</div>
      </form>
    </div>
  `;

  document.querySelectorAll("[data-entry-start]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await startEntryMode(button.dataset.entryStart || "group");
    } catch (error) {
      setFlash(error.message || t("loginFailed"));
    }
  }));

  $("inviteForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = $("inviteTokenField").value.trim();
    if (!token) {
      setFlash(t("tokenRequired"));
      return;
    }
    state.inviteToken = token;
    try {
      if (/^\d{6}$/.test(token.replace(/\D+/g, ""))) {
        await verifyInviteCode(token);
      } else {
        await loadParticipant(token);
      }
    } catch (error) {
      state.viewer = "guest";
      state.participant = null;
      render();
      setFlash(error.message || t("noParticipant"), true);
    }
  });

  $("openEqualizerToolButton")?.addEventListener("click", openEqualizerTool);
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

async function handleAppRefreshAction() {
  closeAppMenu();
  setFlash(tx("cacheResetWorking", "Обновляем приложение и очищаем старый кэш..."), true);
  await resetShipCashboxShell();
  reloadWithCurrentShell();
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

function mergeTreasurerSaveOptions(current, incoming) {
  const next = incoming || {};
  if (!current) return { ...next };
  return {
    preserveFocus: Boolean(current.preserveFocus || next.preserveFocus),
    silent: Boolean(current.silent && next.silent),
    submit: Boolean(current.submit || next.submit),
  };
}

async function performTreasurerNotebookSave({ preserveFocus = false, silent = false, submit = false } = {}) {
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
    const serverDraft = normalizedText(treasurer?.notebook_text || "");
    const localDraftChangedDuringSave = !submit && normalizedText(state.treasurerDraft || "") !== draft;
    state.treasurerDraft = localDraftChangedDuringSave ? normalizedText(state.treasurerDraft || "") : serverDraft;
    try {
      localStorage.setItem(treasurerDraftKey(payload.session?.id), state.treasurerDraft);
    } catch (error) {}
    const keepMounted = preserveFocus && !submit && document.activeElement instanceof HTMLTextAreaElement && document.activeElement.id === "treasurerNotebook";
    if (keepMounted) {
      setNotebookMeta("treasurerSaveMeta", treasurerNotebookSummary());
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

async function saveTreasurerNotebook(options = {}) {
  window.clearTimeout(state.treasurerAutosaveTimer);
  state.treasurerAutosaveTimer = null;
  if (state.treasurerSaveInFlight) {
    state.treasurerSaveQueued = mergeTreasurerSaveOptions(state.treasurerSaveQueued, options);
    return state.treasurerSavePromise;
  }

  state.treasurerSaveInFlight = true;
  state.treasurerSavePromise = (async () => {
    let currentOptions = options;
    let lastPayload = null;
    try {
      do {
        state.treasurerSaveQueued = null;
        lastPayload = await performTreasurerNotebookSave(currentOptions);
        currentOptions = state.treasurerSaveQueued;
      } while (currentOptions);
      return lastPayload;
    } finally {
      state.treasurerSaveInFlight = false;
      state.treasurerSavePromise = null;
      state.treasurerSaveQueued = null;
    }
  })();
  return state.treasurerSavePromise;
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
        <button class="btn btn--secondary shipcashbox-notebook-action shipcashbox-notebook-action--save notebook-keep-focus" type="button" id="participantSaveButton" title="${escapeHtml(t("saveNotebookHelp"))}" aria-label="${escapeHtml(t("saveNotebookHelp"))}">${escapeHtml(t("saveNotebook"))}</button>
        <button class="btn btn--primary shipcashbox-notebook-action shipcashbox-notebook-action--submit notebook-keep-focus" type="button" id="participantSyncButton" title="${escapeHtml(t("syncNowHelp"))}" aria-label="${escapeHtml(t("syncNowHelp"))}">${escapeHtml(t("syncNow"))}</button>
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
        ${renderNotebookAssistant("participantNotebook", session.currency, readOnly || !viewing.is_self)}
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
    runButtonAction(event.currentTarget, t("autosaveSaving"), () => syncParticipant("manual", { submit: false, preserveFocus: true }))
      .catch((error) => setFlash(error.message || t("loadFailed")));
  });
  $("participantSyncButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("submitNotebookBusy"), () => syncParticipant("manual", { submit: true }))
      .catch((error) => setFlash(error.message || t("loadFailed")));
  });
  bindRestoreNotebookButtons();
  $("openWorkspaceMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  bindNotebookKeyboardTarget($("participantNotebook"));
  bindNotebookAssistant($("participantNotebook"));
  bindNotebookKeepFocus($("participantNotebook"));
  $("unlockNotebookButton")?.addEventListener("click", unlockNotebookEditor);
}

function renderParticipantRows(participants) {
  const treasurerId = state.boot?.session?.treasurer_participant_id || participants.find((participant) => participant.role === "treasurer")?.id || "";
  return participants.filter((participant) => participant.active !== false).map((participant) => `
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

function transferTone(line) {
  if (line.kind === "cashbox_payout") return "positive";
  if (line.kind === "cashbox_topup") return "warning";
  return "neutral";
}

function renderSettlementFlow(session, { compact = false } = {}) {
  const data = buildDebtMatrix(session);
  const lines = data.transferLines;
  const maxAmount = Math.max(1, ...lines.map((line) => Number(line.amount || 0)));
  if (!lines.length) {
    return `
      <section class="shipcashbox-settlement-flow shipcashbox-settlement-flow--empty">
        <div class="shipcashbox-settlement-flow__empty">
          <strong>${escapeHtml(tx("debtMatrixAllOk", "Все в порядке"))}</strong>
          <span>${escapeHtml(t("noTransfers"))}</span>
        </div>
      </section>
    `;
  }

  const visibleLines = compact ? lines.slice(0, 3) : lines;
  const remaining = Math.max(0, lines.length - visibleLines.length);

  return `
    <section class="shipcashbox-settlement-flow${compact ? " shipcashbox-settlement-flow--compact" : ""}" aria-label="${escapeHtml(tx("debtMatrixTitle", "Кто кому должен"))}">
      ${visibleLines.map((line) => {
        const width = Math.max(14, Math.min(100, (Number(line.amount || 0) / maxAmount) * 100));
        const tone = transferTone(line);
        return `
          <article class="shipcashbox-settlement-flow__row shipcashbox-settlement-flow__row--${escapeHtml(tone)}">
            <div class="shipcashbox-settlement-flow__people">
              <strong>${escapeHtml(line.fromName)}</strong>
              <span aria-hidden="true">→</span>
              <strong>${escapeHtml(line.toName)}</strong>
            </div>
            <div class="shipcashbox-settlement-flow__amount">
              <span style="width:${width.toFixed(2)}%"></span>
              <b>${escapeHtml(money(line.amount, data.currency))}</b>
            </div>
          </article>
        `;
      }).join("")}
      ${remaining ? `<button class="shipcashbox-settlement-flow__more" type="button" data-workspace-window="settlement">+${escapeHtml(String(remaining))}</button>` : ""}
    </section>
  `;
}

function settlementParticipantPreview(session, selectedId = "") {
  const data = buildDebtMatrix(session);
  const treasurerId = session.treasurer_participant_id || "";
  const participants = data.participants.filter((participant) => participant.active !== false && participant.id !== treasurerId);
  const preferred = selectedId && participants.find((participant) => participant.id === selectedId)
    ? selectedId
    : (participants.find((participant) => Number(data.outgoing.get(participant.id) || 0) > 0.009 || Number(data.incoming.get(participant.id) || 0) > 0.009)?.id || participants[0]?.id || "");
  const participant = participants.find((item) => item.id === preferred) || null;
  const lines = participant
    ? data.transferLines.filter((line) => line.fromId === participant.id || line.toId === participant.id)
    : [];
  const outgoing = participant ? Number(data.outgoing.get(participant.id) || 0) : 0;
  const incoming = participant ? Number(data.incoming.get(participant.id) || 0) : 0;
  const net = moneyRound(incoming - outgoing);
  return { data, participants, participant, selectedId: preferred, lines, outgoing, incoming, net };
}

function renderSettlementSummaryCards(session) {
  const totals = session.totals || {};
  const data = buildDebtMatrix(session);
  return `
    <div class="shipcashbox-settlement-summary" aria-label="${escapeHtml(tx("debtMatrixSummary", "Сводка расчета"))}">
      <article>
        <span>${escapeHtml(t("summaryExpenses"))}</span>
        <strong>${escapeHtml(money(totals.total_expenses || 0, session.currency))}</strong>
      </article>
      <article>
        <span>${escapeHtml(t("summaryShare"))}</span>
        <strong>${escapeHtml(money(totals.share || 0, session.currency))}</strong>
      </article>
      <article>
        <span>${escapeHtml(t("summaryCash"))}</span>
        <strong>${escapeHtml(money(totals.cashbox_balance || 0, session.currency, true))}</strong>
      </article>
      <article>
        <span>${escapeHtml(tx("settlementTransfersCount", "Переводы"))}</span>
        <strong>${escapeHtml(String(data.transferLines.length))}</strong>
      </article>
    </div>
  `;
}

function buildCloseAudit(session) {
  const participants = (session.participants || []).filter((participant) => participant.active !== false);
  const lines = session.settlement_preview?.lines || [];
  const periods = Array.isArray(session.treasurer_periods) ? session.treasurer_periods : [];
  const signedOff = Array.isArray(session.participant_settlements) ? session.participant_settlements : [];
  const missingEmail = participants.filter((participant) => !String(participant.email || "").trim());
  const openTextOwners = participants.filter((participant) => String(participant.notebook_text || "").trim() !== "");
  const treasurerId = session.treasurer_participant_id || "";
  const treasurer = participants.find((participant) => participant.id === treasurerId) || null;
  const serverTreasurerText = normalizedText(treasurer?.notebook_text || "");
  const localTreasurerDraft = normalizedText(state.treasurerDraft || serverTreasurerText);
  const hasUnsavedLocalTreasurerDraft = localTreasurerDraft !== serverTreasurerText;
  const emailReady = participants.length - missingEmail.length;
  const exportCount = 4;
  const warnings = [];

  if (missingEmail.length) {
    warnings.push(txf("closeAuditMissingEmail", "Без email: {names}", { names: missingEmail.map((participant) => participant.display_name || "-").join(", ") }));
  }
  if (hasUnsavedLocalTreasurerDraft) {
    warnings.push(tx("closeAuditLocalDraft", "Есть локальный черновик казначея, который еще не синхронизирован с сервером."));
  }
  if (!participants.length) {
    warnings.push(tx("closeAuditNoCrew", "Нет активного экипажа для закрытия."));
  }

  return {
    status: warnings.length ? "warning" : "ready",
    warnings,
    participants,
    missingEmail,
    draftOwners,
    emailReady,
    exportCount,
    transferCount: lines.length,
    signedOffCount: signedOff.length,
    periodCount: Math.max(1, periods.length || 1),
    openTextCount: openTextOwners.length,
    hasUnsavedLocalTreasurerDraft,
  };
}

function renderCloseAudit(session) {
  const audit = buildCloseAudit(session);
  const ready = audit.status === "ready";
  const warningItems = audit.warnings.length
    ? audit.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")
    : `<li>${escapeHtml(tx("closeAuditNoWarnings", "Критичных предупреждений нет."))}</li>`;
  return `
    <section class="shipcashbox-close-audit shipcashbox-close-audit--${ready ? "ready" : "warning"}">
      <div class="shipcashbox-close-audit__head">
        <div>
          <span>${escapeHtml(tx("closeAuditEyebrow", "Перед закрытием"))}</span>
          <strong>${escapeHtml(tx("closeAuditTitle", "Проверка кассы"))}</strong>
        </div>
        <b>${escapeHtml(ready ? tx("closeAuditReady", "Можно закрывать") : tx("closeAuditWarning", "Есть предупреждения"))}</b>
      </div>
      <div class="shipcashbox-close-audit__grid">
        <article><span>${escapeHtml(tx("closeAuditEmails", "Email"))}</span><strong>${escapeHtml(`${audit.emailReady}/${audit.participants.length}`)}</strong></article>
        <article><span>${escapeHtml(tx("closeAuditTransfers", "Переводы"))}</span><strong>${escapeHtml(String(audit.transferCount))}</strong></article>
        <article><span>${escapeHtml(tx("closeAuditExports", "Файлы"))}</span><strong>${escapeHtml(String(audit.exportCount))}</strong></article>
        <article><span>${escapeHtml(tx("closeAuditPeriods", "Периоды"))}</span><strong>${escapeHtml(String(audit.periodCount))}</strong></article>
        <article><span>${escapeHtml(tx("closeAuditSignedOff", "Списаны"))}</span><strong>${escapeHtml(String(audit.signedOffCount))}</strong></article>
        <article><span>${escapeHtml(tx("closeAuditOpenTextCount", "Открытые"))}</span><strong>${escapeHtml(String(audit.openTextCount))}</strong></article>
      </div>
      <ul class="shipcashbox-close-audit__warnings">${warningItems}</ul>
      <p>${escapeHtml(tx("closeAuditAfterClose", "После закрытия архив и письма создаются автоматически, а следующая касса откроется пустой."))}</p>
    </section>
  `;
}

function renderSingleParticipantSettlementResult(session, selectedId = "") {
  const preview = settlementParticipantPreview(session, selectedId);
  if (!preview.participants.length || !preview.participant) {
    return `<div class="shipcashbox-empty">${escapeHtml(t("emptyLines"))}</div>`;
  }

  const netTone = preview.net < -0.009 ? "negative" : preview.net > 0.009 ? "positive" : "neutral";
  const netLabel = preview.net < -0.009
    ? tx("singleSettlementOwes", "Он должен")
    : preview.net > 0.009
      ? tx("singleSettlementReceives", "Ему должны")
      : tx("singleSettlementEven", "Закрыт ровно");
  const linesHtml = preview.lines.length
    ? preview.lines.map((line) => {
      const role = line.fromId === preview.participant.id ? tx("singleSettlementPays", "платит") : tx("singleSettlementGets", "получает");
      const counterparty = line.fromId === preview.participant.id ? line.toName : line.fromName;
      return `
        <article class="shipcashbox-single-settlement__line">
          <span>${escapeHtml(role)}</span>
          <strong>${escapeHtml(counterparty)}</strong>
          <b>${escapeHtml(money(line.amount, preview.data.currency))}</b>
        </article>
      `;
    }).join("")
    : `<div class="shipcashbox-single-settlement__empty">${escapeHtml(tx("singleSettlementNoLines", "По текущему расчету этому участнику ничего переводить не нужно."))}</div>`;

  return `
    <div class="shipcashbox-single-settlement__result" data-single-settlement-result>
      <div class="shipcashbox-single-settlement__totals">
        <article>
          <span>${escapeHtml(tx("singleSettlementPaysTotal", "Должен отдать"))}</span>
          <strong>${escapeHtml(money(preview.outgoing, preview.data.currency))}</strong>
        </article>
        <article>
          <span>${escapeHtml(tx("singleSettlementGetsTotal", "Должен получить"))}</span>
          <strong>${escapeHtml(money(preview.incoming, preview.data.currency))}</strong>
        </article>
        <article class="shipcashbox-single-settlement__net shipcashbox-single-settlement__net--${netTone}">
          <span>${escapeHtml(netLabel)}</span>
          <strong>${escapeHtml(money(Math.abs(preview.net), preview.data.currency))}</strong>
        </article>
      </div>
      <div class="shipcashbox-single-settlement__lines">${linesHtml}</div>
    </div>
  `;
}

function renderSingleParticipantSettlementCard(session) {
  const preview = settlementParticipantPreview(session);
  if (!preview.participants.length) {
    return `
      <section class="shipcashbox-single-settlement shipcashbox-single-settlement--locked">
        <div class="shipcashbox-single-settlement__head">
          <div>
            <strong>${escapeHtml(tx("singleSettlementTitle", "Рассчитать члена экипажа"))}</strong>
            <span>${escapeHtml(tx("singleSettlementNoCandidate", "Нет активного члена экипажа для списания. Казначей не выводится через эту кнопку."))}</span>
          </div>
          <button class="btn btn--secondary" type="button" disabled>${escapeHtml(tx("singleSettlementLockedAction", "Недоступно"))}</button>
        </div>
      </section>
    `;
  }
  const options = preview.participants.map((participant) => `
    <option value="${escapeHtml(participant.id)}"${participant.id === preview.selectedId ? " selected" : ""}>${escapeHtml(participant.display_name || "-")}</option>
  `).join("");
  return `
    <section class="shipcashbox-single-settlement">
      <div class="shipcashbox-single-settlement__head">
        <div>
          <strong>${escapeHtml(tx("singleSettlementTitle", "Рассчитать члена экипажа"))}</strong>
          <span>${escapeHtml(tx("singleSettlementText", "Если человек сходит раньше, рассчитайте его отдельно и продолжайте кассу без него."))}</span>
        </div>
        <label class="shipcashbox-field shipcashbox-single-settlement__select">
          <span>${escapeHtml(tx("singleSettlementParticipant", "Член экипажа"))}</span>
          <select data-single-settlement-select>
            ${options}
          </select>
        </label>
      </div>
      ${renderSingleParticipantSettlementResult(session, preview.selectedId)}
      <div class="shipcashbox-single-settlement__actions">
        <p class="shipcashbox-note">${escapeHtml(tx("singleSettlementDraftNote", "После подтверждения человек будет исключен из будущих расчетов, а здесь останется запись его расчета."))}</p>
        <button class="btn btn--primary settle-participant-btn" type="button" data-participant-id="${escapeHtml(preview.selectedId)}">${escapeHtml(tx("singleSettlementRemoveAction", "Рассчитать и списать"))}</button>
      </div>
    </section>
  `;
}

function renderParticipantSettlementEvents(session) {
  const events = Array.isArray(session.participant_settlements) ? session.participant_settlements : [];
  const periods = Array.isArray(session.treasurer_periods) ? session.treasurer_periods : [];
  const participantById = new Map((session.participants || []).map((participant) => [participant.id, participant]));
  const timeline = [
    ...periods.map((period) => ({
      at: period.started_at || "",
      name: participantById.get(period.treasurer_participant_id)?.display_name || period.treasurer_participant_id || "-",
      text: period.reason === "treasurer_rotation"
        ? tx("crewRotationTimelineTreasurer", "Принял казну")
        : tx("crewRotationTimelineStarted", "Открыл кассу"),
    })),
    ...events.map((event) => {
      const net = Number(event.net || 0);
      const netLabel = net < -0.009
        ? tx("singleSettlementOwes", "Он должен")
        : net > 0.009
          ? tx("singleSettlementReceives", "Ему должны")
          : tx("singleSettlementEven", "Закрыт ровно");
      return {
        at: event.settled_at || "",
        name: event.display_name || "-",
        text: `${netLabel} ${money(Math.abs(net), event.currency || session.currency)}`,
      };
    }),
  ].filter((item) => item.at || item.name).sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  if (!timeline.length) return "";
  return `
    <section class="shipcashbox-settlement-events">
      <strong>${escapeHtml(tx("crewRotationTimelineTitle", "Лента ротации"))}</strong>
      <div class="shipcashbox-settlement-events__list">
        ${timeline.map((event) => `
            <article class="shipcashbox-settlement-event">
              <div>
                <b>${escapeHtml(event.name || "-")}</b>
                <span>${escapeHtml(formatDateTime(event.at || ""))}</span>
              </div>
              <strong>${escapeHtml(event.text || "")}</strong>
            </article>
          `).join("")}
      </div>
    </section>
  `;
}

function renderTreasurerRotationCard(session) {
  const treasurerId = session.treasurer_participant_id || "";
  const currentTreasurer = (session.participants || []).find((participant) => participant.id === treasurerId) || null;
  const candidates = (session.participants || []).filter((participant) => participant.active !== false && participant.id !== treasurerId);
  const totals = session.totals || {};
  const hasFinancialActivity = Number(totals.total_contributions || 0) > 0.009
    || Number(totals.total_expenses || 0) > 0.009
    || (Array.isArray(session.participant_settlements) && session.participant_settlements.length > 0);
  const periodCount = Array.isArray(session.treasurer_periods) ? session.treasurer_periods.length : 1;
  if (!candidates.length) {
    return `
      <section class="shipcashbox-rotation-card">
        <div>
          <strong>${escapeHtml(tx("crewRotationTreasurerTitle", "Передать казну"))}</strong>
          <span>${escapeHtml(tx("crewRotationNoTreasurerCandidate", "Добавьте еще одного члена экипажа, чтобы передать роль казначея."))}</span>
        </div>
      </section>
    `;
  }
  return `
    <section class="shipcashbox-rotation-card">
      <div class="shipcashbox-rotation-card__head">
        <div>
          <strong>${escapeHtml(tx("crewRotationTreasurerTitle", "Передать казну"))}</strong>
          <span>${escapeHtml(txf("crewRotationTreasurerText", "Сейчас казну ведет {name}. После передачи старый казначей остается членом экипажа.", { name: currentTreasurer?.display_name || t("treasurerTag") }))}</span>
        </div>
        <label class="shipcashbox-field shipcashbox-single-settlement__select">
          <span>${escapeHtml(tx("crewRotationNewTreasurer", "Новый казначей"))}</span>
          <select id="crewRotationTreasurerSelect">
            ${candidates.map((participant) => `<option value="${escapeHtml(participant.id)}">${escapeHtml(participant.display_name || "-")}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="shipcashbox-single-settlement__actions">
        <p class="shipcashbox-note">${escapeHtml(hasFinancialActivity
          ? tx("crewRotationTreasurerPeriodNote", "Передача закроет текущий период казначея и откроет новый. Старые расходы останутся в своем периоде.")
          : tx("crewRotationTreasurerNote", "Это меняет роль в активной кассе, но не закрывает расчеты старого казначея."))} ${escapeHtml(txf("crewRotationPeriodsCount", "Периодов: {count}", { count: periodCount }))}</p>
        <button class="btn btn--primary" type="button" id="rotateTreasurerButton">${escapeHtml(tx("crewRotationTreasurerAction", "Передать казну"))}</button>
      </div>
    </section>
  `;
}

function renderCrewRotationWindow(session) {
  return `
    <div class="shipcashbox-settlement-board shipcashbox-rotation-board">
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("crewRotationEyebrow", "Экипаж"))}</p>
            <h2>${escapeHtml(tx("crewRotationTitle", "Ротация экипажа"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(tx("crewRotationText", "Рабочий раздел для ухода, прихода и смены роли без закрытия всей судовой кассы."))}</p>
      </section>
      ${renderSingleParticipantSettlementCard(session)}
      ${renderTreasurerRotationCard(session)}
      <section class="shipcashbox-rotation-card">
        <div class="shipcashbox-rotation-card__head">
          <div>
            <strong>${escapeHtml(tx("crewRotationAddTitle", "Принять члена экипажа"))}</strong>
            <span>${escapeHtml(tx("crewRotationAddText", "Новый человек добавляется через командный состав и дальше участвует в текущей кассе."))}</span>
          </div>
          <button class="btn btn--secondary" type="button" id="crewRotationAddButton">${escapeHtml(tx("crewRotationAddAction", "Добавить в экипаж"))}</button>
        </div>
      </section>
      ${renderParticipantSettlementEvents(session)}
    </div>
  `;
}

function renderCashboxCommandDeck(session, treasurer) {
  const totals = session.totals || {};
  const participants = session.participants || [];
  const personal = isPersonalSession(session);
  const activeParticipants = participants.filter((participant) => participant.active !== false);
  const activeCount = activeParticipants.length;
  const syncedCount = activeParticipants.filter((participant) => participant.authorized_at || participant.role === "treasurer").length;
  const transferCount = (session.settlement_preview?.lines || []).length;
  const cashboxBalance = Number(totals.cashbox_balance || 0);
  const balanceTone = cashboxBalance < -0.009 ? "negative" : cashboxBalance > 0.009 ? "positive" : "neutral";
  if (personal) {
    const recordCount = (treasurer?.entries || []).filter((entry) => entry.entry_kind === "expense" || entry.entry_kind === "contribution").length;
    return `
      <section class="shipcashbox-personal-quiet" aria-label="${escapeHtml(tx("personalSummaryTitle", "Личный отчет"))}">
        <div class="shipcashbox-personal-quiet__balance shipcashbox-personal-quiet__balance--${balanceTone}">
          <div>
            <span>${escapeHtml(tx("personalBalanceLabel", "Остаток"))}</span>
            <strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong>
          </div>
          <p>${escapeHtml(tx("autosaveLocal", "Записи сохраняются локально сразу, как в заметках."))}</p>
        </div>
        <div class="shipcashbox-personal-quiet__stats">
          <span>
            <span>${escapeHtml(tx("personalIncomeLabel", "Приходы"))}</span>
            <strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong>
          </span>
          <span>
            <span>${escapeHtml(t("summaryExpenses"))}</span>
            <strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong>
          </span>
          <span>
            <span>${escapeHtml(tx("personalRecordsLabel", "Записи"))}</span>
            <strong>${escapeHtml(String(recordCount))}</strong>
          </span>
          <span>
            <span>${escapeHtml(tx("modePersonalLabel", "Личный"))}</span>
            <strong>${escapeHtml(session.currency || "EUR")}</strong>
          </span>
        </div>
      </section>
    `;
  }
  const participantChips = activeParticipants.slice(0, 7).map((participant, index) => `
    <span class="shipcashbox-command-avatar" title="${escapeHtml(participant.display_name || "")}">
      <span class="debt-avatar debt-avatar--${index % 8}">${escapeHtml(participantInitials(participant.display_name, index))}</span>
      <b>${escapeHtml(participant.display_name || "-")}</b>
    </span>
  `).join("");
  const extraParticipants = Math.max(0, activeParticipants.length - 7);

  return `
    <section class="shipcashbox-command-deck" aria-label="${escapeHtml(t("summaryTitle"))}">
      <div class="shipcashbox-command-deck__hero shipcashbox-command-deck__hero--${balanceTone}">
        <div>
          <p>${escapeHtml(session.title || t("summaryTitle"))}</p>
          <strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong>
          <span>${escapeHtml(t("summaryCash"))}</span>
        </div>
        <button class="shipcashbox-command-deck__primary" type="button" data-workspace-window="settlement">
          <b>${escapeHtml(String(transferCount))}</b>
          <span>${escapeHtml(t("settlementTitle"))}</span>
        </button>
      </div>
      <div class="shipcashbox-command-metrics">
        <button type="button" data-workspace-window="snapshot">
          <span>${escapeHtml(t("summaryExpenses"))}</span>
          <strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong>
        </button>
        <button type="button" data-workspace-window="snapshot">
          <span>${escapeHtml(t("summaryShare"))}</span>
          <strong>${escapeHtml(money(totals.share, session.currency))}</strong>
        </button>
        <button type="button" data-workspace-window="team">
          <span>${escapeHtml(t("participantsTitle"))}</span>
          <strong>${escapeHtml(`${syncedCount}/${activeCount || participants.length}`)}</strong>
        </button>
        <button type="button" data-workspace-window="reports">
          <span>${escapeHtml(t("summaryContributions"))}</span>
          <strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong>
        </button>
      </div>
      <div class="shipcashbox-command-strip">
        <div class="shipcashbox-command-strip__crew">
          ${participantChips}
          ${extraParticipants ? `<span class="shipcashbox-command-avatar shipcashbox-command-avatar--more">+${escapeHtml(String(extraParticipants))}</span>` : ""}
        </div>
        <div class="shipcashbox-command-strip__spent">
          <span>${escapeHtml(t("spentFooterLabel"))}</span>
          <strong>${escapeHtml(money(treasurer?.expenses || 0, session.currency))}</strong>
        </div>
      </div>
    </section>
  `;
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
  return archive.map((item) => {
    const personal = item.session_mode === "personal";
    const meta = personal
      ? `${tx("personalArchiveMeta", "Личный журнал")} · ${money(item.cashbox_balance, item.currency, true)}`
      : `${item.participants} · ${money(item.cashbox_balance, item.currency, true)}`;
    return `
      <article class="shipcashbox-archive__row shipcashbox-archive__row--selectable">
        <div class="shipcashbox-card__row">
          <strong>${escapeHtml(item.title)}</strong>
          <span class="shipcashbox-archive__status">${escapeHtml(personal ? tx("personalArchiveStatus", "Закрыт") : t("archiveStatus"))}</span>
        </div>
        <div class="shipcashbox-archive__meta">${escapeHtml(t("archivedOn"))}: ${escapeHtml(item.closed_at || "")}</div>
        <div class="shipcashbox-archive__meta">${escapeHtml(meta)}</div>
        <button class="shipcashbox-archive__cover open-archive-session-btn" type="button" data-id="${escapeHtml(item.id)}" data-can-reopen="${canReopen ? "1" : "0"}" title="${escapeHtml(t("openArchiveSnapshot"))}" aria-label="${escapeHtml(t("openArchiveSnapshot"))}"></button>
      </article>
    `;
  }).join("");
}

function archiveRowsForCurrentMode(archive = []) {
  if (state.viewer !== "treasurer" || !state.boot?.session) return archive;
  const personal = isPersonalSession(state.boot.session);
  return archive.filter((item) => (item.session_mode === "personal") === personal);
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
    if (isPersonalSession(state.boot.session)) {
      return `
        <div class="shipcashbox-window-menu">
          ${renderWindowMenuButton("snapshot", tx("personalSummaryTitle", "Личный отчет"), tx("personalSnapshotText", "Остаток, приходы, расходы и число записей."))}
          ${renderWindowMenuButton("reports", tx("personalReportAction", "Отчет"), tx("personalReportText", "Приходы, расходы, остаток и список записей."))}
          ${renderWindowMenuButton("team", tx("personalSettingsLabel", "Настройки"), tx("personalSettingsText", "Название, валюта и начальный остаток личного журнала."))}
          ${renderWindowMenuButton("archive", tx("personalArchiveTitle", "Архив личного журнала"), tx("personalArchiveText", "Закрытые личные журналы и сохраненные отчеты."))}
          ${renderWindowMenuButton("service", tx("personalServiceTitle", "Сервис журнала"), tx("personalServiceText", "Ссылка, установка и обновление приложения."))}
        </div>
      `;
    }
    return `
      <div class="shipcashbox-window-menu">
        ${renderWindowMenuButton("snapshot", t("summaryTitle"), t("workspaceSnapshotText"))}
        ${renderWindowMenuButton("team", t("participantsTitle"), t("workspaceTeamText"))}
        ${renderWindowMenuButton("crew-rotation", tx("crewRotationTitle", "Ротация экипажа"), tx("crewRotationMenuText", "Уход, приход и смена казначея без закрытия всей кассы."))}
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
  if (isPersonalSession(session)) {
    return renderPersonalReportsWindow(session);
  }
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

function renderPersonalReportsWindow(session) {
  const treasurer = (session.participants || []).find((participant) => participant.id === session.treasurer_participant_id) || (session.participants || [])[0] || {};
  const totals = session.totals || {};
  const entries = (treasurer.entries || []).filter((entry) => entry.entry_kind === "expense" || entry.entry_kind === "contribution");
  const rows = entries.length ? entries.map((entry) => {
    const income = entry.entry_kind === "contribution";
    return `
      <div class="shipcashbox-personal-report-row shipcashbox-personal-report-row--${income ? "income" : "expense"}">
        <span>${escapeHtml(entry.note || entry.raw_text || "-")}</span>
        <strong>${escapeHtml(money(Math.abs(Number(entry.amount || 0)), session.currency, income))}</strong>
      </div>
    `;
  }).join("") : `<p class="shipcashbox-note">${escapeHtml(tx("personalReportEmpty", "Пока нет сохраненных приходов или расходов."))}</p>`;
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("personalSummaryTitle", "Личный отчет"))}</p>
            <h2>${escapeHtml(tx("personalReportTitle", "Приходы и расходы"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-metrics shipcashbox-metrics--compact">
          <div class="shipcashbox-metric"><span>${escapeHtml(tx("personalIncomeLabel", "Приходы"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryExpenses"))}</span><strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(tx("personalBalanceLabel", "Остаток"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
        </div>
        <div class="shipcashbox-personal-report">${rows}</div>
        <p class="shipcashbox-note">${escapeHtml(tx("personalReportHint", "Пишите приходы со знаком плюс: +500 аванс. Расходы можно писать обычной строкой: 40 топливо."))}</p>
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
  if (isPersonalSession(session)) {
    const totals = session.totals || {};
    const treasurer = (session.participants || []).find((participant) => participant.id === session.treasurer_participant_id) || (session.participants || [])[0] || {};
    const recordCount = (treasurer.entries || []).filter((entry) => entry.entry_kind === "expense" || entry.entry_kind === "contribution").length;
    return `
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("personalSummaryTitle", "Личный отчет"))}</p>
            <h2>${escapeHtml(tx("personalSummaryTitle", "Личный отчет"))}</h2>
          </div>
        </div>
        <div class="shipcashbox-metrics">
          <div class="shipcashbox-metric"><span>${escapeHtml(tx("personalBalanceLabel", "Остаток"))}</span><strong>${escapeHtml(money(totals.cashbox_balance, session.currency, true))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(tx("personalIncomeLabel", "Приходы"))}</span><strong>${escapeHtml(money(totals.total_contributions, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(t("summaryExpenses"))}</span><strong>${escapeHtml(money(totals.total_expenses, session.currency))}</strong></div>
          <div class="shipcashbox-metric"><span>${escapeHtml(tx("personalRecordsLabel", "Записи"))}</span><strong>${escapeHtml(String(recordCount))}</strong></div>
        </div>
      </section>
    `;
  }
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
  if (isPersonalSession(session)) {
    const treasurer = (session.participants || []).find((participant) => participant.id === session.treasurer_participant_id) || (session.participants || [])[0] || {};
    return `
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("personalSettingsLabel", "Настройки"))}</p>
            <h2>${escapeHtml(tx("personalSettingsTitle", "Личный журнал"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(tx("personalSettingsText", "Название, валюта и начальный остаток личного журнала."))}</p>
        <div class="shipcashbox-form__grid">
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("sessionTitle"))}</span>
            <input type="text" id="sessionTitleInput" value="${escapeHtml(session.title)}">
          </label>
          <label class="shipcashbox-field">
            <span>${escapeHtml(t("sessionCurrency"))}</span>
            <input type="text" id="sessionCurrencyInput" value="${escapeHtml(session.currency)}" maxlength="6">
          </label>
          <label class="shipcashbox-field">
            <span>${escapeHtml(tx("personalOpeningBalance", "Сколько денег было"))}</span>
            <input type="text" id="personalOpeningBalanceInput" value="${escapeHtml(String(treasurer.cashbox_contribution ?? 0))}" inputmode="decimal">
          </label>
        </div>
        <div class="shipcashbox-actions shipcashbox-actions--team">
          <button class="btn btn--primary" type="button" id="saveSessionButton" title="${escapeHtml(tx("personalSaveJournalHelp", "Сохранить название, валюту и начальный остаток."))}" aria-label="${escapeHtml(tx("personalSaveJournalHelp", "Сохранить название, валюту и начальный остаток."))}">${escapeHtml(tx("personalSaveJournal", "Сохранить журнал"))}</button>
        </div>
      </section>
    `;
  }
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
      <div class="shipcashbox-settlement-board">
        ${renderSettlementSummaryCards(session)}
        ${renderSettlementFlow(session)}
        ${renderCloseAudit(session)}
      </div>
      <div class="shipcashbox-actions">
        <button class="btn btn--secondary" type="button" data-workspace-window="crew-rotation">${escapeHtml(tx("crewRotationSettlementAction", "Рассчитать члена экипажа"))}</button>
        <button class="btn btn--secondary print-settlement-pdf-btn" type="button" title="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}" aria-label="${escapeHtml(tx("debtMatrixPdfHelp", "Открыть альбомный отчет для печати или сохранения в PDF."))}">${escapeHtml(tx("debtMatrixPdfButton", "Сохранить PDF"))}</button>
        <button class="btn btn--primary" type="button" id="confirmSettlementButton" title="${escapeHtml(t("settleNowHelp"))}" aria-label="${escapeHtml(t("settleNowHelp"))}">${escapeHtml(t("settleNow"))}</button>
      </div>
    </section>
  `;
}

function renderPersonalArchiveDetailWindow(session) {
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window shipcashbox-card--archive-detail">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("personalArchiveStatus", "Закрыт"))}</p>
            <h2>${escapeHtml(session.title || tx("personalArchiveTitle", "Архив личного журнала"))}</h2>
            <p class="shipcashbox-note">${escapeHtml(t("archivedOn"))}: ${escapeHtml(session.closed_at || "")}</p>
          </div>
        </div>
        <div class="shipcashbox-actions">
          ${renderExports(session.exports || [], { personal: true })}
          <button class="btn btn--primary reopen-session-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(tx("personalReopenJournalHelp", "Снова открыть личный журнал, чтобы внести забытые записи."))}" aria-label="${escapeHtml(tx("personalReopenJournalHelp", "Снова открыть личный журнал, чтобы внести забытые записи."))}">${escapeHtml(tx("personalReopenJournal", "Открыть журнал"))}</button>
          <button class="btn btn--secondary delete-archive-session-btn" type="button" data-id="${escapeHtml(session.id)}" title="${escapeHtml(t("deleteArchiveHelp"))}" aria-label="${escapeHtml(t("deleteArchiveHelp"))}">${escapeHtml(t("deleteArchive"))}</button>
        </div>
      </section>
      ${renderPersonalReportsWindow(session)}
    </div>
  `;
}

function renderArchiveDetailWindow(session) {
  if (isPersonalSession(session)) {
    return renderPersonalArchiveDetailWindow(session);
  }
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
  const personal = isPersonalSession();
  const guideEyebrow = personal ? tx("personalGuideEyebrow", "Личный журнал") : t("guideEyebrow");
  const guideTitle = personal ? tx("personalGuideTitle", "Как вести личные расходы") : t("guideTitle");
  const guideSteps = personal
    ? ["personalGuideStep1", "personalGuideStep2", "personalGuideStep3", "personalGuideStep4"].map((key) => tx(key, ""))
    : [t("guideStep1"), t("guideStep2"), t("guideStep3"), t("guideStep4")];
  const serviceTitle = personal ? tx("personalServiceTitle", "Сервис журнала") : t("workspaceServiceTitle");
  const serviceText = personal ? tx("personalServiceText", "Ссылка, установка и обновление приложения.") : t("workspaceServiceText");
  return `
    <div class="shipcashbox-stack">
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(guideEyebrow)}</p>
            <h2>${escapeHtml(guideTitle)}</h2>
          </div>
        </div>
        <div class="shipcashbox-guide">
          ${guideSteps.map((step) => `<p>${escapeHtml(step)}</p>`).join("")}
        </div>
      </section>
      <section class="shipcashbox-card shipcashbox-card--window">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(t("shareTool"))}</p>
            <h2>${escapeHtml(serviceTitle)}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(serviceText)}</p>
        <div class="shipcashbox-actions">
          <button class="btn btn--primary" type="button" id="workspaceShareToolButton" title="${escapeHtml(personal ? tx("personalShareToolHelp", "Отправить ссылку на этот инструмент.") : t("shareToolHelp"))}" aria-label="${escapeHtml(personal ? tx("personalShareToolHelp", "Отправить ссылку на этот инструмент.") : t("shareToolHelp"))}">${escapeHtml(t("shareTool"))}</button>
        </div>
      </section>
      <section class="shipcashbox-card shipcashbox-card--window shipcashbox-card--service-reset">
        <div class="shipcashbox-card__head">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(tx("cacheResetEyebrow", "Версия"))}</p>
            <h2>${escapeHtml(tx("cacheResetTitle", "Обновить приложение"))}</h2>
          </div>
        </div>
        <p class="shipcashbox-note">${escapeHtml(txf("cacheResetText", "Если экран выглядит старым, очистите кэш приложения и откройте текущую сборку {version}. Записи и черновики не удаляются.", { version: SHELL_VERSION }))}</p>
        <div class="shipcashbox-actions">
          <button class="btn btn--secondary" type="button" id="workspaceCacheResetButton">${escapeHtml(tx("cacheResetAction", "Обновить приложение"))}</button>
        </div>
      </section>
      ${installBox ? installBox : `<section class="shipcashbox-card shipcashbox-card--window"><p class="shipcashbox-empty">${escapeHtml(t("workspaceServiceEmpty"))}</p></section>`}
    </div>
  `;
}

function receiptLinkLabel(commit, item, currency = "EUR") {
  if (commit?.amount && commit?.note) {
    return `${money(commit.amount, currency)} · ${commit.note} · ${t("lineProofAction")}`;
  }
  return `${item.alt || attachmentFileName(item.file_path) || t("photosTitle")} · ${t("lineProofAction")}`;
}

function renderTreasurerAttachments(session, currency = "EUR") {
  const items = Array.isArray(session.attachments) ? session.attachments : [];
  const canEdit = session.status === "active";
  if (!items.length) return "";
  const ownerKey = `treasurer_${session.id}_${session.treasurer_participant_id || "owner"}`;
  const commits = Object.values(loadNotebookCommits(ownerKey));
  const commitsByPath = commits.reduce((map, commit) => {
    const path = String(commit?.attachment_path || "");
    if (path) map[path] = commit;
    return map;
  }, {});

  return `
    <div class="shipcashbox-receipt-links">
      ${items.map((item) => {
        const href = escapeHtml(resolveAdminAssetUrl(item.file_path));
        const commit = commitsByPath[item.file_path] || null;
        const label = escapeHtml(receiptLinkLabel(commit, item, currency));
        const fileName = escapeHtml(attachmentFileName(item.file_path));
        return `
          <article class="shipcashbox-receipt-link-row">
            <a class="shipcashbox-receipt-link ${commit ? "is-accounted" : ""}" href="${href}" target="_blank" rel="noopener" title="${fileName}">
              <span class="shipcashbox-receipt-link__text">${commit ? "✓ " : ""}${label}</span>
            </a>
            ${canEdit ? `<button class="shipcashbox-receipt-link__delete delete-attachment-btn" type="button" data-attachment-id="${escapeHtml(item.id)}" title="${escapeHtml(t("removePhotoHelp"))}" aria-label="${escapeHtml(t("removePhotoHelp"))}">×</button>` : ""}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function workspaceWindowPayload(windowName) {
  if (windowName === "menu") {
    return {
      eyebrow: isPersonalSession() ? tx("personalModeBadge", "Личный режим") : t("workspaceMenuEyebrow"),
      title: workspaceMenuTitleLabel(),
      body: renderWorkspaceMenu(),
    };
  }

  if (state.viewer === "treasurer" && state.boot && windowName === "archive") {
    const personal = isPersonalSession(state.boot.session);
    return {
      eyebrow: personal ? tx("personalArchiveTitle", "Архив личного журнала") : t("archiveTitle"),
      title: personal ? tx("personalArchiveTitle", "Архив личного журнала") : t("archiveTitle"),
      body: `<section class="shipcashbox-card shipcashbox-card--window"><div class="shipcashbox-archive">${renderArchiveRows(archiveRowsForCurrentMode(state.boot.archive || []), false)}</div></section>`,
    };
  }

  if (state.viewer === "treasurer" && windowName === "service") {
    const personal = isPersonalSession();
    return {
      eyebrow: personal ? tx("personalServiceTitle", "Сервис журнала") : t("workspaceServiceTitle"),
      title: personal ? tx("personalServiceTitle", "Сервис журнала") : t("workspaceServiceTitle"),
      body: renderServiceWindow(),
    };
  }

  if (state.viewer === "treasurer" && state.boot?.session) {
    const { session, archive } = state.boot;
    const personal = isPersonalSession(session);
    if (windowName === "snapshot") {
      return {
        eyebrow: personal ? tx("personalSummaryTitle", "Личный отчет") : t("summaryTitle"),
        title: personal ? tx("personalSummaryTitle", "Личный отчет") : t("summaryTitle"),
        body: renderTreasurerSnapshotWindow(session),
      };
    }
    if (windowName === "team") {
      return {
        eyebrow: personal ? tx("personalSettingsLabel", "Настройки") : t("participantsTitle"),
        title: personal ? tx("personalSettingsTitle", "Личный журнал") : t("participantsTitle"),
        body: renderTreasurerTeamWindow(session),
      };
    }
    if (!personal && windowName === "crew-rotation") {
      return {
        eyebrow: tx("crewRotationEyebrow", "Экипаж"),
        title: tx("crewRotationTitle", "Ротация экипажа"),
        body: renderCrewRotationWindow(session),
      };
    }
    if (personal && ["settlement", "log-diagram", "log-tree"].includes(windowName)) {
      return {
        eyebrow: tx("personalSummaryTitle", "Личный отчет"),
        title: tx("personalReportTitle", "Приходы и расходы"),
        body: renderPersonalReportsWindow(session),
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
        eyebrow: personal ? tx("personalSummaryTitle", "Личный отчет") : t("workspaceReportsTitle"),
        title: personal ? tx("personalReportTitle", "Приходы и расходы") : t("workspaceReportsTitle"),
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
          <label class="shipcashbox-field">
            <span>${escapeHtml(tx("personalOpeningBalance", "Сколько денег было"))}</span>
            <input type="text" id="newSessionOpeningInput" value="" inputmode="decimal" placeholder="0">
          </label>
          <div class="shipcashbox-actions">
            <button class="btn btn--primary" type="button" id="createSessionButton" data-create-session-mode="group">${escapeHtml(t("createCashbox"))}</button>
            <button class="btn btn--secondary" type="button" id="createPersonalSessionButton" data-create-session-mode="personal">${escapeHtml(tx("createPersonalJournal", "Создать личный журнал"))}</button>
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
  const personal = isPersonalSession(session);
  const notebookText = normalizedText(state.treasurerDraft);
  const totals = session.totals || {};
  const readOnly = session.status !== "active" || state.editorLocked;
  const attachmentAction = session.status === "active"
    ? `<button class="btn btn--secondary shipcashbox-notebook-action shipcashbox-notebook-action--attach" type="button" id="attachReceiptButton" title="${escapeHtml(t("attachPhoto"))}" aria-label="${escapeHtml(t("attachPhoto"))}"><span aria-hidden="true">📎</span><span class="shipcashbox-sr-only">${escapeHtml(t("attachPhoto"))}</span></button>`
    : "";
  const notebookAction = session.status === "active"
    ? `
        <button class="btn btn--secondary shipcashbox-notebook-action shipcashbox-notebook-action--save notebook-keep-focus" type="button" id="treasurerSaveButton" title="${escapeHtml(t("saveNotebookHelp"))}" aria-label="${escapeHtml(t("saveNotebookHelp"))}">${escapeHtml(t("saveNotebook"))}</button>
        <button class="btn btn--primary shipcashbox-notebook-action shipcashbox-notebook-action--submit notebook-keep-focus" type="button" id="treasurerSubmitNotebookButton" title="${escapeHtml(t("submitNotebookHelp"))}" aria-label="${escapeHtml(t("submitNotebookHelp"))}">${escapeHtml(t("submitNotebook"))}</button>
        ${attachmentAction}
      `
    : "";
  $("treasurerView").innerHTML = `
    <div class="shipcashbox-stack">
      ${renderCashboxCommandDeck(session, treasurer)}
      <section class="shipcashbox-card shipcashbox-card--sticky shipcashbox-card--notebook">
        <div class="shipcashbox-card__head shipcashbox-workhead">
          <div>
            <p class="section-heading__eyebrow">${escapeHtml(session.title)}</p>
            <h2 class="shipcashbox-work-title">${escapeHtml(personal ? tx("personalNotebookTitle", "Личный блокнот") : t("treasurerNotebookTitle"))}</h2>
          </div>
          <div class="shipcashbox-inline-actions">
            <button class="btn btn--secondary" type="button" id="openWorkspaceMenuButton" title="${escapeHtml(personal ? tx("personalWorkspaceMenuHelp", "Открывает отчет, настройки, архив и сервис личного журнала.") : t("workspaceMenuHelp"))}" aria-label="${escapeHtml(personal ? tx("personalWorkspaceMenuHelp", "Открывает отчет, настройки, архив и сервис личного журнала.") : t("workspaceMenuHelp"))}">${escapeHtml(workspaceMenuActionLabel())}</button>
          </div>
        </div>
        <div class="shipcashbox-notebook-shell">
          <textarea id="treasurerNotebook" class="shipcashbox-notebook-textarea" placeholder="${escapeHtml(personal ? tx("personalNotebookPlaceholder", "+500 аванс / 40 топливо / 15 кофе") : t("notebookPlaceholder"))}" aria-label="${escapeHtml(personal ? tx("personalNotebookTitle", "Личный блокнот") : t("treasurerNotebookTitle"))}" ${readOnly ? "readonly" : ""}>${escapeHtml(notebookText)}</textarea>
          <div class="shipcashbox-notebook-proof-rail" id="treasurerNotebookProofRail" aria-label="${escapeHtml(t("lineProofAction"))}" hidden></div>
          ${renderNotebookLockOverlay()}
          ${renderNotebookAssistant("treasurerNotebook", session.currency, readOnly)}
        </div>
        ${renderNotebookBatches(treasurer?.notebook_batches || [], session.currency, "treasurer")}
        ${session.status !== "active" && !state.editorLocked ? `<p class="shipcashbox-note">${escapeHtml(t("participantReadonly"))}</p>` : ""}
        ${renderNotebookFooter({
          label: personal ? tx("personalSpentFooterLabel", "Расходы") : t("spentFooterLabel"),
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
  const personal = isPersonalSession(state.boot?.session);
  const participants = personal
    ? participantsPayloadFromState().slice(0, 1).map((participant) => ({
        ...participant,
        role: "treasurer",
        display_name: participant.display_name || tx("personalModeBadge", "Личный режим"),
        included_in_split: true,
        cashbox_contribution: $("personalOpeningBalanceInput")?.value.trim() || participant.cashbox_contribution || "0",
      }))
    : ($("participantsEditor") ? collectParticipantDrafts() : participantsPayloadFromState());
  const treasurerParticipantId = state.boot?.session?.treasurer_participant_id || participants[0]?.id || "";
  const previousSession = state.boot?.session;
  const previousTreasurer = (previousSession?.participants || []).find((participant) => participant.id === previousSession?.treasurer_participant_id);
  const previousServerDraft = normalizedText(previousTreasurer?.notebook_text || "");
  const previousLocalDraft = normalizedText(state.treasurerDraft || "");
  const payload = await api("save-session", {
    method: "POST",
    body: JSON.stringify({
      id: state.boot.session.id,
      title: $("sessionTitleInput")?.value.trim() || state.boot.session.title,
      currency: $("sessionCurrencyInput")?.value.trim() || state.boot.session.currency || "EUR",
      treasurer_expense_mode: personal ? "cashbox" : "auto",
      treasurer_participant_id: treasurerParticipantId,
      participants,
      attachment_post_id: extra.attachment_post_id ?? state.boot.session.attachment_post_id ?? null,
      attachments: extra.attachments ?? state.boot.session.attachments ?? [],
    }),
  });
  state.boot = payload;
  const serverDraft = normalizedText((payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id)?.notebook_text || "");
  const preserveLocalDraft = previousLocalDraft !== previousServerDraft;
  state.treasurerDraft = preserveLocalDraft ? previousLocalDraft : serverDraft;
  try {
    localStorage.setItem(treasurerDraftKey(payload.session?.id), state.treasurerDraft);
  } catch (error) {}
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
  return attachments;
}

function openAttachmentSheet() {
  const modal = $("attachmentSheet");
  if (!modal) return;
  modal.hidden = false;
  lockModalScroll();
}

function closeAttachmentSheet(options = {}) {
  const modal = $("attachmentSheet");
  if (!modal) return;
  modal.hidden = true;
  if (!options?.keepScrollLock) {
    unlockModalScroll();
  }
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

async function createLightReceiptImageFile(file) {
  const rasterized = await rasterizeImageForPdf(file, { maxLongSide: 1800, quality: 0.74 });
  const baseName = slugify(String(file.name || "").replace(/\.[^.]+$/, "")) || "receipt-photo";
  const blob = new Blob([rasterized.jpegBytes], { type: "image/jpeg" });
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: file?.lastModified || Date.now(),
  });
}

function todayInputValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function normalizeScanAmount(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return String(moneyRound(amount)).replace(/\.00$/, "");
}

function scanEngineApi() {
  return window.ShipCashboxScanEngine && typeof window.ShipCashboxScanEngine.pickScanSuggestions === "function"
    ? window.ShipCashboxScanEngine
    : null;
}

async function fetchScanOcrStatus({ force = false } = {}) {
  const now = Date.now();
  if (!force && state.scanOcrStatus && (now - state.scanOcrStatusCheckedAt) < OCR_STATUS_CACHE_MS) {
    return state.scanOcrStatus;
  }
  try {
    const payload = await api("scan-ocr-status", { timeoutMs: OCR_TIMEOUT_MS });
    state.scanOcrStatus = payload.ocr || { available: false, provider: "none", mode: "manual" };
  } catch (error) {
    state.scanOcrStatus = { available: false, provider: "none", mode: "manual", error: error.message || "OCR unavailable" };
  }
  state.scanOcrStatusCheckedAt = now;
  return state.scanOcrStatus;
}

async function requestScanOcrCandidates(scanReview) {
  if (!scanReview?.id) return null;
  const status = await fetchScanOcrStatus();
  if (!status?.available) return { available: false, provider: status?.provider || "none", text: "", lines: [] };
  try {
    const payload = await api("scan-ocr", {
      method: "POST",
      timeoutMs: OCR_TIMEOUT_MS,
      body: JSON.stringify({
        scan_id: scanReview.id,
        attachment_path: scanReview.attachment?.file_path || "",
        amount_only: true,
      }),
    });
    return payload.ocr || null;
  } catch (error) {
    return { available: false, provider: status.provider || "tesseract-server", text: "", lines: [], error: error.message || "OCR unavailable" };
  }
}

function mergeScanSuggestions(primary = {}, secondary = {}) {
  const mergeByValue = (left = [], right = []) => {
    const seen = new Set();
    return [...left, ...right].filter((candidate) => {
      const key = String(candidate?.value || candidate?.raw || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  return {
    amounts: mergeByValue(primary.amounts || [], secondary.amounts || []).slice(0, 5),
    dates: mergeByValue(primary.dates || [], secondary.dates || []).slice(0, 5),
    description: primary.description || secondary.description || "",
    source: primary.source || secondary.source || "mixed",
  };
}

function suggestionsFromOcrPayload(ocrPayload) {
  const engine = scanEngineApi();
  if (!engine || !ocrPayload) return { amounts: [], dates: [], description: "", source: "ocr" };
  const sourceLines = Array.isArray(ocrPayload.lines) ? ocrPayload.lines : [];
  const sourceText = String(ocrPayload.text || "");
  const textOnlyLines = sourceText
    .split(/\r?\n/)
    .map((text) => ({ text: text.replace(/\s+/g, " ").trim() }))
    .filter((line) => line.text);
  const source = sourceLines.length ? sourceLines.concat(textOnlyLines) : sourceText;
  if (!source || (Array.isArray(source) && !source.length)) return { amounts: [], dates: [], description: "", source: "ocr" };
  const suggestions = engine.pickScanSuggestions(source, {
    dayFirst: true,
    maxAmounts: 5,
    maxDates: 5,
    minAmountScore: 25,
    minDateScore: 25,
  });
  return {
    amounts: Array.isArray(suggestions.amounts) ? suggestions.amounts : [],
    dates: SCAN_AUTOFILL_DETAILS && Array.isArray(suggestions.dates) ? suggestions.dates : [],
    description: SCAN_AUTOFILL_DETAILS ? buildOcrDescriptionHint(ocrPayload) : "",
    source: "ocr",
  };
}

function scanOcrLineTexts(ocrPayload) {
  if (Array.isArray(ocrPayload?.lines) && ocrPayload.lines.length) {
    return ocrPayload.lines
      .map((line) => String(line?.text || "").replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }
  return String(ocrPayload?.text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function cleanOcrDescriptionLine(line) {
  return String(line || "")
    .replace(/[|_]+/g, " ")
    .replace(/[^\p{L}\p{N}\s.'’&/:%+-]/gu, " ")
    .replace(/\s+\d+[.,]\d{1,2}\s*[A-ZА-Я]?\s*$/iu, (match) => match.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function isWeakOcrDescriptionLine(line) {
  const text = String(line || "").toLowerCase();
  if (text.length < 4) return true;
  if (!/[a-zа-яčćđšž]/i.test(text)) return true;
  if ((text.match(/[a-zа-яčćđšž]/gi) || []).length < 3) return true;
  if (/(ukupno|total|gotovina|cash|uplaceno|pla[cć]eno|kusur|change|osnovica|porez|pdv|tax|stopa|datum|vrijeme|vreme|fiskal|racun|ra[cč]un|broj|operator|operater|iter|pib|jib|oib|enu|qr|http|www)/i.test(text)) return true;
  if (/^\d+[\s.,:/-]*$/.test(text)) return true;
  return false;
}

function ocrLineLooksLikeReceiptTotal(line) {
  return /(ukupno|total|za\s+pla[cć]anje|gotovina|cash|uplaceno|pla[cć]eno|kusur|change|vrsta\s+poreza|osnovica|stopa|porez|pdv|tax|fiskalni\s+bon|fiskal)/i.test(String(line || ""));
}

function ocrLineLooksLikeItem(line) {
  const text = String(line || "");
  if (isWeakOcrDescriptionLine(text)) return false;
  if (/(smart\s+trade|arsenal|pib|tivat|kotor|operator|operater|iter|datum|racun|ra[cč]un|fiskal|total|gotovina)/i.test(text)) return false;
  const letterCount = (text.match(/[a-zа-яčćđšž]/gi) || []).length;
  const hasProductKeyword = /(folija|kre[pb]|traka|navlaka|krznena|polir|sundjer|sun[dđ]er|usb|kesa|maskirna|spray|sprej|gelcoat|kist|pasta|teak|clean|polish|marina|diesel|fuel|bread|water|coffee|market)/i.test(text);
  const hasMeasure = /\b\d+(?:[.,]\d+)?\s*(?:x|kom|mm|cm|m|my|ml|l|kg|g|pcs|pc)\b/i.test(text);
  const hasPriceTail = /\d+[.,]\d{1,2}\s*[a-zа-я]?\s*$/i.test(text);
  const hasUpperReceiptShape = /[A-ZČĆĐŠŽ]{2,}/.test(text) && /\d/.test(text);
  return letterCount >= 5 && (hasProductKeyword || hasMeasure || hasPriceTail || hasUpperReceiptShape);
}

function scoreOcrItemLine(line) {
  const text = String(line || "");
  let score = 0;
  const letterCount = (text.match(/[a-zа-яčćđšž]/gi) || []).length;
  const wordCount = (text.match(/[\p{L}]{3,}/gu) || []).length;
  if (/(folija|kre[pb]|traka|navlaka|krznena|polir|sundjer|sun[dđ]er|usb|kesa|maskirna|spray|sprej|gelcoat|kist|pasta|teak|clean|polish)/i.test(text)) score += 40;
  if (/\b\d+(?:[.,]\d+)?\s*(?:x|kom|mm|cm|m|my|ml|l|kg|g|pcs|pc)\b/i.test(text)) score += 16;
  if (/\d+[.,]\d{1,2}\s*[a-zа-я]?\s*$/i.test(text)) score += 12;
  if (wordCount >= 2) score += 12;
  if (wordCount >= 3) score += 8;
  score += Math.min(letterCount, 24);
  if (letterCount < 8) score -= 20;
  return score;
}

function normalizeOcrItemDescription(line) {
  return String(line || "")
    .replace(/\b\d+[.,]\d{1,2}\s*[A-ZА-Я]?\s*$/iu, "")
    .replace(/\b\d+[.,]\d{1,2}\s*$/u, "")
    .replace(/\s+\d+\)?\s*$/u, "")
    .replace(/\b(?:kom|pcs|pc)\b/gi, "")
    .replace(/\s+[xX]\s+/g, " x ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildOcrDescriptionHint(ocrPayload) {
  const lines = scanOcrLineTexts(ocrPayload).map(cleanOcrDescriptionLine).filter(Boolean);
  const totalIndex = lines.findIndex(ocrLineLooksLikeReceiptTotal);
  const upperBound = totalIndex > 0 ? totalIndex : lines.length;
  const itemLines = lines
    .slice(0, upperBound)
    .map((line, index) => ({ line, index }))
    .filter((item) => item.index >= 4 && ocrLineLooksLikeItem(item.line))
    .map((item) => ({ line: normalizeOcrItemDescription(item.line), score: scoreOcrItemLine(item.line), index: item.index }))
    .filter((item) => item.line && !isWeakOcrDescriptionLine(item.line))
    .filter((item) => item.score >= 18)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.line)
    .filter((line) => line && !isWeakOcrDescriptionLine(line));
  if (itemLines.length) {
    return itemLines.slice(0, 5).join(" / ").replace(/\s+/g, " ").trim().slice(0, 180);
  }
  const fallback = lines.find((line, index) => index > 3 && !isWeakOcrDescriptionLine(line));
  return String(fallback || "").slice(0, 96);
}

function scanReviewSourceText(sourceFile) {
  const fileName = String(sourceFile?.name || "").replace(/\.[^.]+$/, "");
  return fileName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scanReviewDescriptionHint(sourceFile, suggestions = {}) {
  const source = scanReviewSourceText(sourceFile);
  if (!source) return "";
  let text = source
    .replace(/\b\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\b/g, " ")
    .replace(/\b\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}\b/g, " ")
    .replace(/(?:EUR|EURO|USD|GBP|RSD|DIN|HRK|BAM|CHF|JPY|CNY|RUB|€|\$|£|¥)/gi, " ");
  (suggestions.amounts || []).slice(0, 3).forEach((candidate) => {
    text = text.replace(String(candidate.raw || ""), " ");
  });
  return text
    .replace(/\b(?:receipt|scan|photo|img|image|invoice|racun|bill|cashbox)\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function buildInitialScanSuggestions(sourceFile) {
  const engine = scanEngineApi();
  if (!engine) return { amounts: [], dates: [], description: "", source: "none" };
  const text = scanReviewSourceText(sourceFile);
  if (!text) return { amounts: [], dates: [], description: "", source: "none" };
  const suggestions = engine.pickScanSuggestions(text, {
    dayFirst: true,
    maxAmounts: 3,
    maxDates: 3,
    minAmountScore: 30,
    minDateScore: 30,
  });
  return {
    amounts: Array.isArray(suggestions.amounts) ? suggestions.amounts : [],
    dates: SCAN_AUTOFILL_DETAILS && Array.isArray(suggestions.dates) ? suggestions.dates : [],
    description: SCAN_AUTOFILL_DETAILS ? scanReviewDescriptionHint(sourceFile, suggestions) : "",
    source: "filename",
  };
}

function renderScanReviewCandidates(suggestions = {}) {
  const box = $("scanReviewCandidates");
  if (!box) return;
  const amounts = Array.isArray(suggestions.amounts) ? suggestions.amounts.slice(0, 3) : [];
  const dates = Array.isArray(suggestions.dates) ? suggestions.dates.slice(0, 3) : [];
  const description = String(suggestions.description || "").trim();
  if (!amounts.length && !dates.length && !description) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }

  const amountHtml = amounts.length ? `
    <div class="shipcashbox-scan-review__candidate-group">
      <strong>${escapeHtml(t("scanReviewCandidateAmount"))}</strong>
      <div class="shipcashbox-scan-review__candidate-list">
        ${amounts.map((candidate) => `<button type="button" class="shipcashbox-scan-review__candidate" data-scan-candidate-field="amount" data-value="${escapeHtml(String(candidate.value))}" title="${escapeHtml((candidate.reasonCodes || []).join(", "))}">${escapeHtml(String(candidate.raw || candidate.value))}</button>`).join("")}
      </div>
    </div>
  ` : "";
  const dateHtml = dates.length ? `
    <div class="shipcashbox-scan-review__candidate-group">
      <strong>${escapeHtml(t("scanReviewCandidateDate"))}</strong>
      <div class="shipcashbox-scan-review__candidate-list">
        ${dates.map((candidate) => `<button type="button" class="shipcashbox-scan-review__candidate" data-scan-candidate-field="date" data-value="${escapeHtml(String(candidate.value))}" title="${escapeHtml((candidate.reasonCodes || []).join(", "))}">${escapeHtml(String(candidate.raw || candidate.value))}</button>`).join("")}
      </div>
    </div>
  ` : "";
  const descriptionHtml = description ? `
    <div class="shipcashbox-scan-review__candidate-group">
      <strong>${escapeHtml(t("scanReviewCandidateDescription"))}</strong>
      <div class="shipcashbox-scan-review__candidate-list">
        <button type="button" class="shipcashbox-scan-review__candidate" data-scan-candidate-field="description" data-value="${escapeHtml(description)}">${escapeHtml(description)}</button>
      </div>
    </div>
  ` : "";

  box.innerHTML = `${amountHtml}${dateHtml}${descriptionHtml}`;
  box.hidden = false;
}

async function enrichScanReviewWithOcr(scanId) {
  if (!scanId || state.scanReview?.id !== scanId) return;
  setScanReviewStatus(t("scanOcrChecking"));
  const ocrPayload = await requestScanOcrCandidates(state.scanReview);
  if (!ocrPayload || state.scanReview?.id !== scanId || state.scanReview.inserted) return;
  if (!ocrPayload.available && !ocrPayload.text && !(ocrPayload.lines || []).length) {
    setScanReviewStatus(t("scanOcrManualFallback"));
    return;
  }
  const nextSuggestions = mergeScanSuggestions(suggestionsFromOcrPayload(ocrPayload), state.scanReview.suggestions || {});
  state.scanReview.suggestions = nextSuggestions;
  renderScanReviewCandidates(nextSuggestions);
  const amount = $("scanReviewAmount");
  const date = $("scanReviewDate");
  const description = $("scanReviewDescription");
  state.scanReview.applyingAutoFill = true;
  if (amount instanceof HTMLInputElement && !state.scanReview.userEdited?.amount && nextSuggestions.amounts?.[0]?.value) {
    amount.value = String(nextSuggestions.amounts[0].value);
  }
  if (SCAN_AUTOFILL_DETAILS && date instanceof HTMLInputElement && !state.scanReview.userEdited?.date && nextSuggestions.dates?.[0]?.value) {
    date.value = String(nextSuggestions.dates[0].value);
  }
  if (SCAN_AUTOFILL_DETAILS && description instanceof HTMLInputElement && !state.scanReview.userEdited?.description && nextSuggestions.description) {
    description.value = nextSuggestions.description;
  }
  state.scanReview.applyingAutoFill = false;
  updateScanReviewInsertState();
  setScanReviewStatus(t(nextSuggestions.amounts?.length ? "scanOcrCandidatesReady" : "scanOcrManualFallback"));
}

function applyScanReviewCandidate(button) {
  if (!(button instanceof HTMLElement)) return;
  const field = button.dataset.scanCandidateField || "";
  const value = button.dataset.value || "";
  const target = field === "amount"
    ? $("scanReviewAmount")
    : field === "date"
      ? $("scanReviewDate")
      : field === "description"
        ? $("scanReviewDescription")
        : null;
  if (!(target instanceof HTMLInputElement)) return;
  if (state.scanReview?.userEdited && field) {
    state.scanReview.userEdited[field] = true;
  }
  target.value = value;
  updateScanReviewInsertState();
  target.focus({ preventScroll: true });
}

function scanInsertedIds(sessionId = state.boot?.session?.id) {
  try {
    const parsed = JSON.parse(localStorage.getItem(scanInsertKey(sessionId)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function rememberScanInserted(scanId, sessionId = state.boot?.session?.id) {
  if (!scanId) return;
  const ids = scanInsertedIds(sessionId);
  if (!ids.includes(scanId)) ids.push(scanId);
  try {
    localStorage.setItem(scanInsertKey(sessionId), JSON.stringify(ids.slice(-80)));
  } catch (error) {}
}

function forgetScanInserted(scanId, sessionId = state.boot?.session?.id) {
  if (!scanId) return;
  const ids = scanInsertedIds(sessionId).filter((id) => id !== scanId);
  try {
    localStorage.setItem(scanInsertKey(sessionId), JSON.stringify(ids));
  } catch (error) {}
}

function rememberReceiptDone(review, rawLine, attachment) {
  const id = review?.file_id || review?.id || "";
  if (!id) return null;
  const item = {
    id,
    name: review?.file_name || attachment?.alt || attachmentFileName(attachment?.file_path || "") || t("receiptQueueUnnamed"),
    raw: rawLine || "",
    attachment_id: attachment?.id || "",
    attachment_path: attachment?.file_path || "",
    scan_id: review?.id || review?.scan_id || "",
    committed_at: new Date().toISOString(),
  };
  const map = loadReceiptDoneMap();
  map[id] = item;
  saveReceiptDoneMap(map);
  state.scanReviewQueueDone = [...(state.scanReviewQueueDone || []).filter((entry) => entry?.id !== id), item];
  renderScanReviewQueueState();
  return item;
}

function closeScanReviewModal(options = {}) {
  const advanceQueue = Boolean(options?.advanceQueue);
  const modal = $("scanReviewModal");
  if (!modal) return;
  modal.hidden = true;
  if (state.scanReviewObjectUrl) {
    URL.revokeObjectURL(state.scanReviewObjectUrl);
  }
  state.scanReviewObjectUrl = "";
  state.scanReview = null;
  if (!advanceQueue) {
    state.scanReviewQueue = [];
    state.scanReviewQueueTotal = 0;
    state.scanReviewQueueActive = false;
    state.scanReviewQueueDone = [];
  }
  unlockModalScroll();
  if (state.viewer === "treasurer" && state.boot?.session) {
    render();
  }
}

function setScanReviewStatus(message = "", isError = false) {
  const status = $("scanReviewStatus");
  if (!status) return;
  const prefix = scanReviewQueuePrefix();
  status.textContent = prefix && message ? `${prefix} ${message}` : (message || prefix);
  status.classList.toggle("is-error", Boolean(isError));
}

function scanReviewQueuePrefix() {
  if (!state.scanReviewQueueActive || state.scanReviewQueueTotal <= 1) return "";
  const remaining = Array.isArray(state.scanReviewQueue) ? state.scanReviewQueue.length : 0;
  const current = Math.max(1, state.scanReviewQueueTotal - remaining);
  return `${current}/${state.scanReviewQueueTotal}.`;
}

function renderScanReviewQueueState() {
  const box = $("scanReviewQueueState");
  if (!box) return;
  const done = Array.isArray(state.scanReviewQueueDone) ? state.scanReviewQueueDone : [];
  if (!state.scanReviewQueueActive || state.scanReviewQueueTotal <= 1) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  const remaining = Array.isArray(state.scanReviewQueue) ? state.scanReviewQueue.length : 0;
  const current = Math.max(1, state.scanReviewQueueTotal - remaining);
  const chips = done.slice(-12).map((item) => `
    <span class="shipcashbox-scan-review__queue-chip" title="${escapeHtml(item.name || "")}">
      <span aria-hidden="true">✓</span>${escapeHtml(item.name || t("receiptQueueUnnamed"))}
    </span>
  `).join("");
  box.innerHTML = `
    <div class="shipcashbox-scan-review__queue-line">
      <strong>${escapeHtml(t("receiptQueueProgress"))}: ${current}/${state.scanReviewQueueTotal}</strong>
      ${done.length ? `<span>${escapeHtml(t("receiptQueueDone"))}: ${done.length}</span>` : ""}
    </div>
    ${chips ? `<div class="shipcashbox-scan-review__queue-chips">${chips}</div>` : ""}
  `;
  box.hidden = false;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampScanReviewPan() {
  const zoom = state.scanReviewZoom;
  const viewport = $("scanReviewViewport");
  if (!viewport || zoom.scale <= 1) {
    zoom.x = 0;
    zoom.y = 0;
    return;
  }
  const maxX = (viewport.clientWidth * (zoom.scale - 1)) / 2;
  const maxY = (viewport.clientHeight * (zoom.scale - 1)) / 2;
  zoom.x = clampNumber(zoom.x, -maxX, maxX);
  zoom.y = clampNumber(zoom.y, -maxY, maxY);
}

function applyScanReviewZoom() {
  const preview = $("scanReviewPreview");
  if (!(preview instanceof HTMLImageElement)) return;
  clampScanReviewPan();
  const zoom = state.scanReviewZoom;
  preview.style.setProperty("--scan-zoom", String(zoom.scale));
  preview.style.setProperty("--scan-pan-x", `${Math.round(zoom.x)}px`);
  preview.style.setProperty("--scan-pan-y", `${Math.round(zoom.y)}px`);
  const resetButton = $("scanZoomResetButton");
  if (resetButton) resetButton.textContent = `${Math.round(zoom.scale * 100)}%`;
}

function setScanReviewZoom(scale, center = true) {
  const zoom = state.scanReviewZoom;
  zoom.scale = clampNumber(Number(scale) || 1, 1, 5);
  if (center || zoom.scale <= 1) {
    zoom.x = 0;
    zoom.y = 0;
  }
  applyScanReviewZoom();
}

function resetScanReviewZoom() {
  state.scanReviewZoom = { scale: 1, x: 0, y: 0, pointers: new Map(), lastDistance: 0, dragX: 0, dragY: 0 };
  $("scanReviewPreview")?.classList.remove("is-dragging");
  applyScanReviewZoom();
}

function pointerDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function bindScanReviewZoom() {
  const viewport = $("scanReviewViewport");
  const preview = $("scanReviewPreview");
  if (!viewport || !(preview instanceof HTMLImageElement)) return;

  $("scanZoomInButton")?.addEventListener("click", () => setScanReviewZoom(state.scanReviewZoom.scale + 0.5, false));
  $("scanZoomOutButton")?.addEventListener("click", () => setScanReviewZoom(state.scanReviewZoom.scale - 0.5, false));
  $("scanZoomResetButton")?.addEventListener("click", resetScanReviewZoom);

  viewport.addEventListener("wheel", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest(".shipcashbox-scan-review__zoom")) return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.25 : -0.25;
    setScanReviewZoom(state.scanReviewZoom.scale + delta, false);
  }, { passive: false });

  viewport.addEventListener("dblclick", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest(".shipcashbox-scan-review__zoom")) return;
    event.preventDefault();
    setScanReviewZoom(state.scanReviewZoom.scale < 2.5 ? 3 : 1, false);
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest(".shipcashbox-scan-review__zoom")) return;
    event.preventDefault();
    viewport.setPointerCapture?.(event.pointerId);
    const zoom = state.scanReviewZoom;
    zoom.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    preview.classList.add("is-dragging");
    if (zoom.pointers.size === 1) {
      zoom.dragX = event.clientX;
      zoom.dragY = event.clientY;
    } else if (zoom.pointers.size === 2) {
      const points = [...zoom.pointers.values()];
      zoom.lastDistance = pointerDistance(points[0], points[1]);
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    const zoom = state.scanReviewZoom;
    if (!zoom.pointers.has(event.pointerId)) return;
    event.preventDefault();
    zoom.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (zoom.pointers.size >= 2) {
      const points = [...zoom.pointers.values()];
      const distance = pointerDistance(points[0], points[1]);
      if (zoom.lastDistance > 0) {
        zoom.scale = clampNumber(zoom.scale * (distance / zoom.lastDistance), 1, 5);
      }
      zoom.lastDistance = distance;
      applyScanReviewZoom();
      return;
    }
    if (zoom.scale <= 1) return;
    zoom.x += event.clientX - zoom.dragX;
    zoom.y += event.clientY - zoom.dragY;
    zoom.dragX = event.clientX;
    zoom.dragY = event.clientY;
    applyScanReviewZoom();
  });

  const finishPointer = (event) => {
    const zoom = state.scanReviewZoom;
    zoom.pointers.delete(event.pointerId);
    zoom.lastDistance = 0;
    if (zoom.pointers.size === 0) {
      preview.classList.remove("is-dragging");
    }
  };
  viewport.addEventListener("pointerup", finishPointer);
  viewport.addEventListener("pointercancel", finishPointer);
  viewport.addEventListener("lostpointercapture", finishPointer);
}

function setScanReviewInsertEnabled(enabled) {
  const button = $("scanReviewInsertButton");
  if (!(button instanceof HTMLButtonElement)) return;
  if (state.scanReview?.inserted) {
    button.disabled = false;
    button.textContent = t("scanReviewInserted");
    return;
  }
  button.disabled = !enabled;
  button.textContent = t("scanReviewInsert");
}

function scanReviewHasCompleteDraft() {
  return Boolean(
    state.scanReview?.proofStatus === "saved"
    && state.scanReview?.attachment?.file_path
    && normalizeScanAmount($("scanReviewAmount")?.value || "")
    && String($("scanReviewDescription")?.value || "").trim()
  );
}

function updateScanReviewInsertState() {
  setScanReviewInsertEnabled(scanReviewHasCompleteDraft());
}

function markScanReviewProofSaved(scanId, attachment) {
  if (!scanId || state.scanReview?.id !== scanId) return;
  if (!attachment?.file_path) {
    markScanReviewProofFailed(scanId, t("uploadPhotoFailed"));
    return;
  }
  state.scanReview.attachment = attachment || null;
  state.scanReview.proofStatus = "saved";
  const pdfName = $("scanReviewPdfName");
  if (pdfName && attachment?.file_path) pdfName.textContent = attachmentFileName(attachment.file_path) || pdfName.textContent;
  updateScanReviewInsertState();
  renderScanReviewQueueState();
  setScanReviewStatus(t("scanProofSaved"));
}

function markScanReviewProofFailed(scanId, message = "") {
  if (!scanId || state.scanReview?.id !== scanId) return;
  state.scanReview.proofStatus = "failed";
  setScanReviewInsertEnabled(false);
  setScanReviewStatus(message || t("scanProofFailed"), true);
}

function openScanReviewModal({ sourceFile, pdfFile, attachment, proofStatus = "saved" } = {}) {
  const modal = $("scanReviewModal");
  if (!modal || !sourceFile || !state.boot?.session) return;
  if (state.scanReviewObjectUrl) URL.revokeObjectURL(state.scanReviewObjectUrl);
  state.scanReviewObjectUrl = URL.createObjectURL(sourceFile);
  const scanId = receiptFileId(sourceFile);
  const doneMap = loadReceiptDoneMap();
  const doneProofPath = String(doneMap[scanId]?.attachment_path || "");
  const attachmentPaths = new Set((state.boot?.session?.attachments || []).map((item) => String(item?.file_path || "")).filter(Boolean));
  state.scanReview = {
    id: scanId,
    file_id: scanId,
    file_name: receiptFileName(sourceFile),
    attachment,
    proofStatus,
    suggestions: buildInitialScanSuggestions(sourceFile),
    userEdited: { amount: false, date: false, description: false },
    applyingAutoFill: false,
    inserted: Boolean(doneProofPath && attachmentPaths.has(doneProofPath)),
  };
  const preview = $("scanReviewPreview");
  if (preview) preview.src = state.scanReviewObjectUrl;
  resetScanReviewZoom();
  const pdfName = $("scanReviewPdfName");
  if (pdfName) pdfName.textContent = pdfFile?.name || attachmentFileName(attachment?.file_path) || t("attachmentPdfLabel");
  const amount = $("scanReviewAmount");
  const date = $("scanReviewDate");
  const description = $("scanReviewDescription");
  if (amount) amount.value = "";
  if (date) date.value = "";
  if (description) description.value = "";
  renderScanReviewCandidates(state.scanReview.suggestions);
  updateScanReviewInsertState();
  renderScanReviewQueueState();
  setScanReviewStatus(t(proofStatus === "saving" ? "scanProofSaving" : "scanReviewReady"));
  lockModalScroll();
  modal.hidden = false;
  window.setTimeout(() => amount?.focus({ preventScroll: true }), 120);
  return scanId;
}

function buildScanNotebookLine({ amount, date, description }) {
  const parts = [];
  if (date) parts.push(date);
  parts.push(description || t("scanReviewDefaultDescription"));
  return `${amount} ${parts.join(" ")}`.trim();
}

function appendScanLineToTreasurerNotebook(rawLine, scanId, attachment = null) {
  const textarea = $("treasurerNotebook");
  const currentDraft = textarea instanceof HTMLTextAreaElement ? textarea.value : state.treasurerDraft;
  const cleanDraft = normalizedText(currentDraft || "");
  const markedLine = markNotebookLineCommitted(rawLine);
  const nextDraft = cleanDraft ? `${cleanDraft}\n${markedLine}` : markedLine;
  state.treasurerDraft = nextDraft;
  saveTreasurerDraft(nextDraft);
  const parsed = parseNotebookExpenseLine(rawLine);
  const ownerKey = currentNotebookOwnerKey();
  if (parsed && ownerKey) {
    const commits = loadNotebookCommits(ownerKey);
    commits[notebookLineHash(parsed.raw)] = {
      amount: parsed.amount,
      note: parsed.note,
      raw: parsed.raw,
      source: "scan",
      scan_id: scanId,
      attachment_id: attachment?.id || "",
      attachment_path: attachment?.file_path || "",
      attachment_name: attachment?.alt || attachmentFileName(attachment?.file_path || ""),
      committed_at: new Date().toISOString(),
    };
    saveNotebookCommits(commits, ownerKey);
  }
  if (textarea instanceof HTMLTextAreaElement) {
    textarea.value = nextDraft;
    textarea.selectionStart = nextDraft.length;
    textarea.selectionEnd = nextDraft.length;
    suppressNotebookAssistant(textarea);
    renderNotebookProofRail(textarea);
  }
  setNotebookMeta("treasurerSaveMeta", t("scanReviewInsertedStatus"));
  scheduleTreasurerAutosave();
}

function insertScanDraftToNotebook() {
  if (!state.scanReview?.id) return;
  if (state.scanReview.inserted) {
    setScanReviewStatus(t("receiptQueueAllDone"));
    setFlash(t("receiptQueueAllDone"));
    return;
  }
  if (state.scanReview.proofStatus !== "saved") {
    setScanReviewStatus(t(state.scanReview.proofStatus === "saving" ? "scanReviewWaitProof" : "scanProofFailed"), true);
    return;
  }
  if (!state.scanReview.attachment?.file_path) {
    setScanReviewStatus(t("scanReviewWaitProof"), true);
    return;
  }
  const amount = normalizeScanAmount($("scanReviewAmount")?.value || "");
  const date = String($("scanReviewDate")?.value || "").trim();
  const description = String($("scanReviewDescription")?.value || "").trim();
  if (!amount || !description) {
    setScanReviewStatus(t("scanReviewValidation"), true);
    return;
  }
  const rawLine = buildScanNotebookLine({ amount, date, description });
  appendScanLineToTreasurerNotebook(rawLine, state.scanReview.id, state.scanReview.attachment);
  rememberReceiptDone(state.scanReview, rawLine, state.scanReview.attachment);
  rememberScanInserted(state.scanReview.id);
  state.scanReview.inserted = true;
  advanceScanReviewQueue();
}

function advanceScanReviewQueue() {
  const hasNext = state.scanReviewQueueActive && Array.isArray(state.scanReviewQueue) && state.scanReviewQueue.length > 0;
  if (!hasNext) suppressNotebookAssistant("treasurerNotebook");
  closeScanReviewModal({ advanceQueue: hasNext });
  if (hasNext) {
    window.setTimeout(openNextReceiptFromQueue, 120);
  } else {
    state.scanReviewQueue = [];
    state.scanReviewQueueTotal = 0;
    state.scanReviewQueueActive = false;
    suppressNotebookAssistant("treasurerNotebook");
  }
}

function skipScanReviewItem() {
  if (!state.scanReview?.id) return;
  setScanReviewStatus(t("scanReviewSkipped"));
  window.setTimeout(advanceScanReviewQueue, 160);
}

function startReceiptReviewQueue(files) {
  const doneMap = loadReceiptDoneMap();
  const attachmentPaths = new Set(
    (state.boot?.session?.attachments || [])
      .map((attachment) => String(attachment?.file_path || ""))
      .filter(Boolean)
  );
  const hasStoredProof = (item) => {
    const done = doneMap[item.id];
    if (!done) return false;
    const proofPath = String(done.attachment_path || "");
    return Boolean(proofPath && attachmentPaths.has(proofPath));
  };
  const allItems = Array.from(files || [])
    .filter(isReceiptImageFile)
    .map((file) => ({ file, id: receiptFileId(file), name: receiptFileName(file) }));
  if (!allItems.length) {
    setFlash(t("uploadPhotoFailed"), true);
    setNotebookMeta("treasurerSaveMeta", t("uploadPhotoFailed"));
    closeAttachmentSheet();
    return;
  }
  const alreadyDone = allItems
    .filter(hasStoredProof)
    .map((item) => ({ ...doneMap[item.id], id: item.id, name: doneMap[item.id]?.name || item.name }));
  const items = allItems.filter((item) => !hasStoredProof(item));
  if (!items.length) {
    if (allItems.length) {
      setFlash(t("receiptQueueAllDone"));
      setNotebookMeta("treasurerSaveMeta", t("receiptQueueAllDone"));
    }
    closeAttachmentSheet();
    return;
  }
  state.scanReviewQueue = items;
  state.scanReviewQueueTotal = allItems.length;
  state.scanReviewQueueActive = true;
  state.scanReviewQueueDone = alreadyDone;
  closeAttachmentSheet({ keepScrollLock: true });
  openNextReceiptFromQueue();
}

async function openNextReceiptFromQueue() {
  if (!state.scanReviewQueueActive || !state.scanReviewQueue.length) {
    advanceScanReviewQueue();
    return;
  }
  const item = state.scanReviewQueue.shift();
  if (!item?.file) {
    openNextReceiptFromQueue();
    return;
  }
  const file = item.file;
  setNotebookMeta("treasurerSaveMeta", t("receiptPhotoPreparing"));
  const scanId = openScanReviewModal({ sourceFile: file, pdfFile: file, attachment: null, proofStatus: "saving" });
  try {
    let uploadFile = file;
    try {
      uploadFile = await createLightReceiptImageFile(file);
    } catch (error) {
      uploadFile = file;
    }
    setNotebookMeta("treasurerSaveMeta", t("uploadingPhoto"));
    const attachment = await uploadCashboxAttachment(uploadFile);
    markScanReviewProofSaved(scanId, attachment);
  } catch (error) {
    markScanReviewProofFailed(scanId, error.message || t("uploadPhotoFailed"));
  }
}

async function handleCashboxAttachmentFile(file, mode = "gallery") {
  if (!file) return;
  let uploadFile = file;
  let sourceFile = file;
  if (mode === "scan") {
    setNotebookMeta("treasurerSaveMeta", t("scanPdfPreparing"));
    uploadFile = await createLightPdfFile(file);
    const scanId = openScanReviewModal({ sourceFile, pdfFile: uploadFile, attachment: null, proofStatus: "saving" });
    try {
      const attachment = await uploadCashboxAttachment(uploadFile);
      markScanReviewProofSaved(scanId, attachment);
      return { scan: true, attachment };
    } catch (error) {
      markScanReviewProofFailed(scanId, error.message || t("scanProofFailed"));
      throw error;
    }
  } else {
    setNotebookMeta("treasurerSaveMeta", t("uploadingPhoto"));
  }
  const attachment = await uploadCashboxAttachment(uploadFile);
  return { scan: false, attachment };
}

function bindAttachmentSheetUi() {
  bindScanReviewZoom();
  $("attachmentGalleryButton")?.addEventListener("click", () => $("cashboxAttachmentGalleryInput")?.click());
  $("attachmentCameraButton")?.addEventListener("click", () => $("cashboxAttachmentCameraInput")?.click());
  $("scanReviewInsertButton")?.addEventListener("click", insertScanDraftToNotebook);
  $("scanReviewCancelButton")?.addEventListener("click", skipScanReviewItem);
  [
    ["scanReviewAmount", "amount"],
    ["scanReviewDate", "date"],
    ["scanReviewDescription", "description"],
  ].forEach(([id, field]) => {
    $(id)?.addEventListener("input", () => {
      if (state.scanReview?.userEdited && !state.scanReview.applyingAutoFill) {
        state.scanReview.userEdited[field] = true;
      }
      updateScanReviewInsertState();
    });
  });
  $("scanReviewCandidates")?.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-scan-candidate-field]") : null;
    if (button) applyScanReviewCandidate(button);
  });

  const bindInput = (id, mode) => {
    $(id)?.addEventListener("change", async (event) => {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (!files.length) return;
      startReceiptReviewQueue(files);
    });
  };

  bindInput("cashboxAttachmentGalleryInput", "gallery");
  bindInput("cashboxAttachmentCameraInput", "camera");
}

async function uploadCashboxAttachment(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", state.boot?.session?.id || "");
  formData.append("session_mode", state.boot?.session?.session_mode || "");
  const payload = await apiForm("upload-attachment", formData);
  state.boot = payload;
  saveCache(BOOT_CACHE_KEY, payload);
  const attachment = payload.attachment || payload.session?.attachments?.[payload.session.attachments.length - 1] || null;
  if (!attachment?.file_path) {
    throw new Error(t("uploadPhotoFailed"));
  }
  return attachment;
}

async function deleteCashboxAttachment(attachmentId, options = {}) {
  if (!attachmentId) return;
  const payload = await api("delete-attachment", {
    method: "POST",
    body: JSON.stringify({
      attachment_id: attachmentId,
      session_id: state.boot?.session?.id || "",
      session_mode: state.boot?.session?.session_mode || "",
    }),
  });
  state.boot = payload;
  saveCache(BOOT_CACHE_KEY, payload);
  if (options?.renderAfter !== false) {
    render({ preserveWorkspace: true });
  }
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
  document.querySelectorAll("[data-create-session-mode]").forEach((button) => button.addEventListener("click", async () => {
    try {
      const mode = button.dataset.createSessionMode === "personal" ? "personal" : "group";
      const payload = await api("create-session", {
        method: "POST",
        body: JSON.stringify({
          mode,
          title: $("newSessionTitleInput")?.value.trim() || (mode === "personal" ? tx("personalDefaultTitle", "Личный журнал расходов") : ""),
          opening_balance: $("newSessionOpeningInput")?.value.trim() || "0",
        }),
      });
      state.boot = payload;
      clearTreasurerDraft(payload.session?.id);
      saveCache(BOOT_CACHE_KEY, payload);
      render();
    } catch (error) {
      setFlash(error.message || t("loadFailed"));
    }
  }));
  $("saveSessionButton")?.addEventListener("click", () => saveSessionMeta().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("shareToolButton")?.addEventListener("click", () => shareToolLink().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("openWorkspaceMenuButton")?.addEventListener("click", () => openWorkspaceModal("menu"));
  document.querySelectorAll("#treasurerView [data-workspace-window]").forEach((button) => {
    button.addEventListener("click", () => openWorkspaceModal(button.dataset.workspaceWindow || "menu"));
  });
  $("quickInviteParticipantButton")?.addEventListener("click", openTeamInviteDraft);
  $("attachReceiptButton")?.addEventListener("click", openAttachmentSheet);
  $("treasurerSaveButton")?.addEventListener("click", (event) => {
    runButtonAction(event.currentTarget, t("autosaveSaving"), () => saveTreasurerNotebook({ preserveFocus: true, silent: false }))
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
  bindNotebookAssistant($("treasurerNotebook"));
  bindNotebookProofRail($("treasurerNotebook"));
  bindNotebookKeepFocus($("treasurerNotebook"));
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
    if (!confirmByWord("confirmSettlementByWord", "Чтобы закрыть кассу, введите {word}. Архив и письма будут созданы автоматически.", "confirmSettlementWord", "ЗАКРЫТЬ")) return;
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
      if (!confirmByWord("reopenArchiveByWord", "Чтобы восстановить архив, введите {word}. Текущая активная касса должна быть закрыта.", "reopenArchiveWord", "ВОССТАНОВИТЬ")) return;
      try {
        const payload = await api("reopen-session", {
          method: "POST",
          body: JSON.stringify({
            id: button.dataset.id,
            mode: state.boot?.session?.session_mode || "",
          }),
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
      if (!confirmByWord("deleteArchiveByWord", "Чтобы удалить карточку архива, введите {word}. На сервере она будет храниться еще 10 дней.", "deleteArchiveWord", "УДАЛИТЬ")) return;
      try {
        const payload = await api("delete-archive-session", {
          method: "POST",
          body: JSON.stringify({
            id: button.dataset.id,
            mode: state.boot?.session?.session_mode || "",
            current_session_id: state.boot?.session?.id || "",
          }),
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
  $("workspaceModalMenuButton").textContent = workspaceMenuActionLabel();
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
  $("workspaceCacheResetButton")?.addEventListener("click", () => handleAppRefreshAction().catch((error) => setFlash(error.message || t("loadFailed"), true)));
  $("shareLogButton")?.addEventListener("click", () => shareExpenseLog().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("printLogButton")?.addEventListener("click", printExpenseLog);
  document.querySelectorAll(".print-settlement-pdf-btn").forEach((button) => {
    button.addEventListener("click", () => printSettlementPdf());
  });
  document.querySelectorAll(".print-archive-settlement-pdf-btn").forEach((button) => {
    button.addEventListener("click", () => printArchiveSettlementPdf(button.dataset.id || ""));
  });
  document.querySelectorAll("[data-single-settlement-select]").forEach((select) => {
    select.addEventListener("change", () => {
      const card = select.closest(".shipcashbox-single-settlement");
      const result = card?.querySelector("[data-single-settlement-result]");
      if (!result || !state.boot?.session) return;
      result.outerHTML = renderSingleParticipantSettlementResult(state.boot.session, select.value || "");
      const action = card?.querySelector(".settle-participant-btn");
      if (action) action.dataset.participantId = select.value || "";
    });
  });
  document.querySelectorAll(".settle-participant-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.busy === "1") return;
      const participantId = button.dataset.participantId || "";
      const participantName = state.boot?.session?.participants?.find((participant) => participant.id === participantId)?.display_name || "";
      if (!participantId) return;
      if (!window.confirm(txf("singleSettlementRemoveConfirm", "Рассчитать {name} и вывести из будущего учета?", { name: participantName || tx("singleSettlementParticipant", "Участник") }))) return;
      try {
        button.dataset.busy = "1";
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.textContent = tx("singleSettlementProcessing", "Списываю...");
        const payload = await api("settle-participant", {
          method: "POST",
          body: JSON.stringify({ id: state.boot.session.id, participant_id: participantId }),
        });
        state.boot = payload;
        saveCache(BOOT_CACHE_KEY, payload);
        localStorage.setItem(ENGAGED_KEY, "1");
        render({ preserveWorkspace: true });
        openWorkspaceModal("crew-rotation");
        setFlash(tx("singleSettlementRemoved", "Член экипажа рассчитан и списан из будущего учета."));
      } catch (error) {
        setFlash(error.message || t("loadFailed"), true);
      } finally {
        delete button.dataset.busy;
        button.disabled = false;
        button.setAttribute("aria-busy", "false");
        button.textContent = tx("singleSettlementRemoveAction", "Рассчитать и списать");
      }
    });
  });
  $("rotateTreasurerButton")?.addEventListener("click", async () => {
    const button = $("rotateTreasurerButton");
    if (!button || button.disabled || button.dataset.busy === "1") return;
    const select = $("crewRotationTreasurerSelect");
    const participantId = select?.value || "";
    const participantName = state.boot?.session?.participants?.find((participant) => participant.id === participantId)?.display_name || "";
    if (!participantId) return;
    if (!window.confirm(txf("crewRotationTreasurerConfirm", "Передать казну: {name}?", { name: participantName || tx("crewRotationNewTreasurer", "Новый казначей") }))) return;
    try {
      button.dataset.busy = "1";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.textContent = tx("crewRotationTreasurerProcessing", "Передаю...");
      const payload = await api("rotate-treasurer", {
        method: "POST",
        body: JSON.stringify({ id: state.boot.session.id, participant_id: participantId }),
      });
      state.boot = payload;
      saveCache(BOOT_CACHE_KEY, payload);
      localStorage.setItem(ENGAGED_KEY, "1");
      render({ preserveWorkspace: true });
      openWorkspaceModal("crew-rotation");
      setFlash(tx("crewRotationTreasurerDone", "Казна передана новому казначею."));
    } catch (error) {
      setFlash(error.message || t("loadFailed"), true);
    } finally {
      delete button.dataset.busy;
      button.disabled = false;
      button.setAttribute("aria-busy", "false");
      button.textContent = tx("crewRotationTreasurerAction", "Передать казну");
    }
  });
  $("crewRotationAddButton")?.addEventListener("click", () => {
    openWorkspaceModal("team");
    window.setTimeout(() => addParticipantDraftRow(), 80);
  });
  $("saveSessionButton") && ($("saveSessionButton").onclick = () => saveSessionMeta().catch((error) => setFlash(error.message || t("loadFailed"))));
  $("addParticipantButton") && ($("addParticipantButton").onclick = () => addParticipantDraftRow());
  $("confirmSettlementButton") && ($("confirmSettlementButton").onclick = async () => {
    if (!confirmByWord("confirmSettlementByWord", "Чтобы закрыть кассу, введите {word}. Архив и письма будут созданы автоматически.", "confirmSettlementWord", "ЗАКРЫТЬ")) return;
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
      if (!confirmByWord("reopenArchiveByWord", "Чтобы восстановить архив, введите {word}. Текущая активная касса должна быть закрыта.", "reopenArchiveWord", "ВОССТАНОВИТЬ")) return;
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
      if (!confirmByWord("deleteArchiveByWord", "Чтобы удалить карточку архива, введите {word}. На сервере она будет храниться еще 10 дней.", "deleteArchiveWord", "УДАЛИТЬ")) return;
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

function mergeParticipantSaveOptions(current, incoming) {
  const next = incoming || {};
  if (!current) return { ...next };
  return {
    syncSource: current.syncSource === "manual" || next.syncSource === "manual" ? "manual" : (next.syncSource || current.syncSource || "manual"),
    silent: Boolean(current.silent && next.silent),
    submit: Boolean(current.submit || next.submit),
    preserveFocus: Boolean(current.preserveFocus || next.preserveFocus),
  };
}

async function performParticipantSync(syncSource = "manual", { silent = false, submit = false, preserveFocus = false } = {}) {
  const participant = state.participant?.participant;
  if (!participant || participant.read_only) return null;
  const notebookText = normalizedText(state.participantDraft || participant.notebook_text || "");
  if (submit && !notebookText.trim()) {
    setFlash(t("emptyNotebookSubmit"), true);
    return null;
  }
  const keepMounted = !submit && preserveFocus && document.activeElement instanceof HTMLTextAreaElement && document.activeElement.id === "participantNotebook";
  const response = await api("participant-save", {
    method: "POST",
    body: JSON.stringify({
      token: participant.invite_token,
      notebook_text: notebookText,
      sync_source: syncSource,
      submit,
    }),
  });

  const localDraftChangedDuringSync = !submit && normalizedText(state.participantDraft || "") !== notebookText;
  if (response.sync_result === "noop") {
    state.participant = response;
    state.participantDraft = localDraftChangedDuringSync ? normalizedText(state.participantDraft || "") : notebookText;
    try {
      localStorage.setItem(participantDraftKey(participant.invite_token), state.participantDraft);
    } catch (error) {}
    saveCache(`${PARTICIPANT_CACHE_PREFIX}${participant.invite_token}`, response);
    if (!silent) setFlash(t("syncNoChanges"));
    if (keepMounted) {
      setNotebookMeta("participantSyncMeta", participantSyncSummary());
    } else {
      render();
    }
    return response;
  }

  state.participant = response;
  const serverDraft = normalizedText(response.participant.notebook_text || "");
  state.participantDraft = localDraftChangedDuringSync ? normalizedText(state.participantDraft || "") : serverDraft;
  try {
    localStorage.setItem(participantDraftKey(participant.invite_token), state.participantDraft);
  } catch (error) {}
  saveCache(`${PARTICIPANT_CACHE_PREFIX}${participant.invite_token}`, response);
  localStorage.setItem(ENGAGED_KEY, "1");
  if (keepMounted) {
    setNotebookMeta("participantSyncMeta", participantSyncSummary());
  } else {
    render();
  }
  if (!silent) setFlash(t(response.sync_result === "submitted" ? "notebookSubmitted" : "saved"));
  return response;
}

async function syncParticipant(syncSource = "manual", { silent = false, submit = false, preserveFocus = false } = {}) {
  const options = { syncSource, silent, submit, preserveFocus };
  if (state.participantSaveInFlight) {
    state.participantSaveQueued = mergeParticipantSaveOptions(state.participantSaveQueued, options);
    return state.participantSavePromise;
  }

  state.participantSaveInFlight = true;
  state.participantSavePromise = (async () => {
    let currentOptions = options;
    let lastPayload = null;
    try {
      do {
        state.participantSaveQueued = null;
        lastPayload = await performParticipantSync(currentOptions.syncSource || "manual", currentOptions);
        currentOptions = state.participantSaveQueued;
      } while (currentOptions);
      return lastPayload;
    } finally {
      state.participantSaveInFlight = false;
      state.participantSavePromise = null;
      state.participantSaveQueued = null;
    }
  })();
  return state.participantSavePromise;
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

function applyTreasurerBootPayload(payload) {
  state.viewer = "treasurer";
  state.participant = null;
  state.participantDraft = "";
  state.boot = payload;
  state.treasurerDraft = loadTreasurerDraft(
    payload.session?.id,
    (payload.session?.participants || []).find((participant) => participant.id === payload.session?.treasurer_participant_id)?.notebook_text || ""
  );
  saveCache(BOOT_CACHE_KEY, payload);
  render();
}

function renderStartChoice(message = "") {
  state.viewer = "guest";
  state.boot = null;
  state.participant = null;
  state.participantDraft = "";
  state.treasurerDraft = "";
  render();
  if (message) setFlash(message);
}

async function loadTreasurerBoot(mode = "") {
  stopParticipantSchedule();
  stopTreasurerAutosave();
  resetEditorLock();
  const preferredMode = normalizeEntryMode(mode) || lastExplicitMode();
  try {
    if (preferredMode) {
      const payload = await api(`boot&mode=${encodeURIComponent(preferredMode)}`);
      if (payload.session) {
        applyTreasurerBootPayload(payload);
        return;
      }
      renderStartChoice(tx("entryChooseWorkspace", "Выберите, с чем работаете сейчас."));
      return;
    }

    const results = await Promise.allSettled([
      api("boot&mode=personal"),
      api("boot&mode=group"),
    ]);
    const fulfilled = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    const activePayloads = fulfilled.filter((payload) => payload.session);

    if (activePayloads.length === 1) {
      applyTreasurerBootPayload(activePayloads[0]);
      return;
    }

    if (!fulfilled.length) {
      throw results.find((result) => result.status === "rejected")?.reason || new Error(t("loadFailed"));
    }

    renderStartChoice(activePayloads.length > 1 ? tx("entryChooseWorkspace", "Выберите, с чем работаете сейчас.") : "");
  } catch (error) {
    const cached = loadCache(BOOT_CACHE_KEY);
    if (cached) {
      applyTreasurerBootPayload(cached);
      setFlash(t("offlineCache"), true);
      return;
    }
    renderStartChoice();
    setFlash(error.message || t("loadFailed"), true);
  }
}

async function loadParticipant(token) {
  clearWelcomePreviewUrl();
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

async function verifyInviteCode(code) {
  clearWelcomePreviewUrl();
  const cleanCode = String(code || "").replace(/\D+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) {
    throw new Error(tx("inviteCodeInvalid", "Введите 6 цифр кода приглашения"));
  }
  stopParticipantSchedule();
  stopTreasurerAutosave();
  resetEditorLock();
  state.viewer = "participant";
  state.boot = null;
  state.treasurerDraft = "";
  const payload = await api("verify-invite-code", {
    method: "POST",
    body: JSON.stringify({ code: cleanCode }),
  });
  const token = payload.participant?.invite_token || cleanCode;
  state.inviteToken = cleanCode;
  state.participant = payload;
  state.participantDraft = loadParticipantDraft(token, payload.participant.notebook_text, payload.participant.read_only);
  saveCache(`${PARTICIPANT_CACHE_PREFIX}${token}`, payload);
  render();
  startParticipantSchedule();
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
  if (isWelcomePreview()) {
    stopParticipantSchedule();
    stopTreasurerAutosave();
    resetEditorLock();
    state.viewer = "guest";
    state.boot = null;
    state.participant = null;
    state.participantDraft = "";
    state.treasurerDraft = "";
    render();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const inviteCode = params.get("inviteCode") || "";
  if (inviteCode) {
    state.inviteToken = inviteCode.replace(/\D+/g, "").slice(0, 6);
    await verifyInviteCode(inviteCode);
    return;
  }

  state.inviteToken = params.get("invite") || "";
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
  syncChromeVisibility();
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
  syncChromeVisibility();
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
    try {
      localStorage.setItem(SHELL_PURGE_KEY, SHELL_VERSION);
    } catch (error) {}
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
  if (target instanceof HTMLElement && target.dataset.closeScanReview === "1") {
    closeScanReviewModal();
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
    closeScanReviewModal();
  }
});

document.addEventListener("brkovicToolAuthChanged", () => {
  scheduleViewerCheck();
});

document.addEventListener("DOMContentLoaded", async () => {
  syncChromeVisibility();
  document.querySelectorAll("#cashboxGuestMenuButton, #cashboxAppMenuButton, #cashboxMobileMenuButton").forEach((button) => {
    button.addEventListener("click", openAppMenu);
  });
  document.querySelectorAll("#cashboxStartButton, #cashboxMobileStartButton").forEach((button) => {
    button.addEventListener("click", openStartScreen);
  });
  $("cashboxMenuStart")?.addEventListener("click", () => {
    closeAppMenu();
    openStartScreen();
  });
  $("workspaceStartButton")?.addEventListener("click", openStartScreen);
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
  $("cashboxMenuRefresh")?.addEventListener("click", () => {
    handleAppRefreshAction().catch((error) => setFlash(error.message || t("loadFailed"), true));
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
  document.addEventListener("click", (event) => {
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
