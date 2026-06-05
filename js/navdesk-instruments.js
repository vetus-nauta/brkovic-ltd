(function () {
  const WEATHER_CACHE_KEY = "navdesk_instruments_weather_v1";
  const PLACE_CACHE_KEY = "navdesk_instruments_place_v1";
  const WEATHER_REFRESH_MS = 15 * 60 * 1000;
  const PLACE_REFRESH_MS = 30 * 60 * 1000;
  const WEATHER_WATCH_HOURS = 48;
  const WEATHER_SCENARIOS = new Set(["green", "yellow", "yellow-rain", "red", "red-rain", "purple", "purple-rain"]);
  const MIN_MOVE_METERS = 7;
  const MIN_SPEED_KN = 0.25;
  const MAX_ACCURACY_FOR_FALLBACK = 85;
  const WEATHER_ALERT_FRESH_MS = 4 * 60 * 60 * 1000;
  const WEATHER_ALERT_REPEAT_MS = 6 * 60 * 60 * 1000;
  const WEATHER_ALERT_PREF_KEY = "navdesk_instruments_weather_alerts_v1";
  const WEATHER_ALERT_LAST_KEY = "navdesk_instruments_weather_alert_last_v1";
  const AUTH_GRACE_MS = 2 * 60 * 1000;
  const AUTH_CACHE_KEY = "brkovic_tool_auth_session_v1";

  const state = {
    gpsWatchId: null,
    pendingExitUrl: "",
    gpsPaused: false,
    started: false,
    authGraceActive: false,
    authGraceTimer: 0,
    authPrompted: false,
    points: [],
    gps: null,
    weather: null,
    place: null,
    weatherLoading: false,
    placeLoading: false,
    lastWeatherFetchAt: 0,
    timeTimer: 0,
    scenario: "",
  };

  const $ = (id) => document.getElementById(id);

  function t(key, fallback) {
    return (window.__BRKOVIC_TRANSLATIONS && window.__BRKOVIC_TRANSLATIONS[key]) || fallback || key;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function renderWeatherRefreshButton() {
    const button = $("instrumentsRefreshWeather");
    if (!button) return;
    button.disabled = state.weatherLoading;
    button.setAttribute("aria-busy", state.weatherLoading ? "true" : "false");
    button.textContent = state.weatherLoading
      ? t("navdesk_instruments_refresh_weather_loading", "Updating...")
      : t("navdesk_instruments_refresh_weather", "Refresh weather");
  }

  function formatTime(date, options = {}) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: options.seconds ? "2-digit" : undefined,
      hour12: false,
    });
  }

  function formatUtc(date, options = {}) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: options.seconds ? "2-digit" : undefined,
      hour12: false,
      timeZone: "UTC",
    });
  }

  function pad3(value) {
    const number = Math.round(Number(value || 0));
    return String(((number % 360) + 360) % 360).padStart(3, "0");
  }

  function mpsToKn(value) {
    return Number(value || 0) * 1.943844492;
  }

  function kmhToKn(value) {
    return Number(value || 0) * 0.539956803;
  }

  function degToRad(value) {
    return Number(value || 0) * Math.PI / 180;
  }

  function radToDeg(value) {
    return Number(value || 0) * 180 / Math.PI;
  }

  function distanceMeters(a, b) {
    const earth = 6371000;
    const lat1 = degToRad(a.lat);
    const lat2 = degToRad(b.lat);
    const deltaLat = degToRad(b.lat - a.lat);
    const deltaLon = degToRad(b.lon - a.lon);
    const h = Math.sin(deltaLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function bearingDegrees(a, b) {
    const lat1 = degToRad(a.lat);
    const lat2 = degToRad(b.lat);
    const deltaLon = degToRad(b.lon - a.lon);
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    return (radToDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function cardinal(deg) {
    if (!Number.isFinite(Number(deg))) return "—";
    const sectors = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return sectors[Math.round((((Number(deg) % 360) + 360) % 360) / 45) % 8];
  }

  function formatCoordinate(value, axis) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const hemi = axis === "lat"
      ? (number >= 0 ? "N" : "S")
      : (number >= 0 ? "E" : "W");
    const abs = Math.abs(number);
    let deg = Math.floor(abs);
    let minuteTenths = Math.round((abs - deg) * 60 * 10);
    if (minuteTenths >= 600) {
      deg += 1;
      minuteTenths = 0;
    }
    const minuteWhole = Math.floor(minuteTenths / 10);
    const minuteDecimal = minuteTenths % 10;
    const minutes = `${String(minuteWhole).padStart(2, "0")},${minuteDecimal}`;
    return `${String(deg).padStart(axis === "lon" ? 3 : 2, "0")}.${minutes} ${hemi}`;
  }

  function readCache(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  function writeCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function readBool(key) {
    try {
      return localStorage.getItem(key) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeBool(key, value) {
    try {
      localStorage.setItem(key, value ? "1" : "0");
    } catch (error) {}
  }

  function setPill(el, text, mode) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-active", mode === "active");
    el.classList.toggle("is-waiting", mode === "waiting");
    el.classList.toggle("is-error", mode === "error");
  }

  function readAuthProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || "null");
      if (!profile || typeof profile !== "object") return null;
      if (profile.expiresAt && Date.now() > Number(profile.expiresAt)) return null;
      return profile.authenticated ? profile : null;
    } catch (error) {
      return null;
    }
  }

  function hasToolAuth() {
    return Boolean(readAuthProfile()?.authenticated);
  }

  function notificationPermission() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  }

  function weatherAlertsEnabled() {
    return readBool(WEATHER_ALERT_PREF_KEY) || notificationPermission() === "granted";
  }

  function setHidden(id, hidden) {
    const el = $(id);
    if (el) el.hidden = Boolean(hidden);
  }

  function applyScreenTheme(theme) {
    const mode = theme === "night" ? "night" : "day";
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    root.classList.toggle("navdesk-boot-night", mode === "night");
    root.classList.toggle("navdesk-boot-day", mode === "day");
    root.style.colorScheme = mode === "night" ? "dark" : "light";
    document.body.classList.toggle("navdesk-theme-night", mode === "night");
    document.body.classList.toggle("navdesk-theme-day", mode === "day");
    if (themeMeta) themeMeta.setAttribute("content", mode === "night" ? "#071014" : "#10243a");
    document.querySelectorAll("[data-navdesk-theme]").forEach((button) => {
      const active = button.getAttribute("data-navdesk-theme") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try {
      localStorage.setItem("navdesk_watch_theme_v1", mode);
    } catch (error) {}
  }

  function ensureMenuThemeControl() {
    const modal = document.getElementById("siteMenuModal");
    const nav = modal?.querySelector(".management-modal-nav");
    if (!modal || !nav) return;

    let row = modal.querySelector("[data-instruments-menu-theme]");
    if (!row) {
      row = document.createElement("div");
      row.className = "instruments-menu-theme";
      row.setAttribute("data-instruments-menu-theme", "");
      row.setAttribute("role", "group");

      const label = document.createElement("span");
      label.className = "instruments-menu-theme__label";
      label.setAttribute("data-instruments-menu-theme-label", "");

      const controls = document.createElement("span");
      controls.className = "instruments-menu-theme__controls";

      ["day", "night"].forEach((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "instruments-menu-theme__button";
        button.setAttribute("data-navdesk-theme", mode);
        button.setAttribute("aria-pressed", "false");
        button.textContent = mode === "day" ? "☀" : "☾";
        controls.appendChild(button);
      });

      row.append(label, controls);
      const languageTrigger = nav.querySelector("[data-open-language-picker]");
      if (languageTrigger) nav.insertBefore(row, languageTrigger);
      else nav.appendChild(row);
    }

    const label = row.querySelector("[data-instruments-menu-theme-label]");
    if (label) label.textContent = t("a11y_screen_mode", "Screen mode");
    row.querySelectorAll("[data-navdesk-theme]").forEach((button) => {
      const mode = button.getAttribute("data-navdesk-theme");
      const text = mode === "night"
        ? t("a11y_night_mode", "Night mode")
        : t("a11y_day_mode", "Day mode");
      button.setAttribute("aria-label", text);
      button.setAttribute("title", text);
    });
    const saved = (() => {
      try {
        return localStorage.getItem("navdesk_watch_theme_v1") || "day";
      } catch (error) {
        return "day";
      }
    })();
    applyScreenTheme(saved);
    adaptSiteMenuLinks(modal);
  }

  function absoluteUrl(href) {
    try {
      return new URL(href, window.location.origin).href;
    } catch (error) {
      return href || "/";
    }
  }

  function adaptSiteMenuLinks(modal) {
    const nav = modal?.querySelector(".management-modal-nav");
    if (!nav) return;
    nav.querySelectorAll("a[href]").forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const path = (() => {
        try {
          return new URL(rawHref, window.location.origin).pathname;
        } catch (error) {
          return rawHref;
        }
      })();
      if (/\/(?:[a-z]{2}\/)?navdesk\.html$/i.test(path)) {
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.removeAttribute("data-instruments-confirm-exit");
        link.setAttribute("data-instruments-return", "");
        link.setAttribute("data-management-modal-close", "");
        return;
      }
      if (
        /\/(?:[a-z]{2}\/)?(?:index\.html)?$/i.test(path)
        || /\/(?:[a-z]{2}\/)?journal\.html$/i.test(path)
        || rawHref.includes("#services")
        || rawHref.includes("#contact")
      ) {
        link.removeAttribute("data-instruments-return");
        link.removeAttribute("data-management-modal-close");
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
        link.setAttribute("data-instruments-confirm-exit", "site-menu");
      }
    });
  }

  function interpolate(template, values = {}) {
    return String(template || "").replace(/\{([a-z0-9_]+)\}/gi, (match, key) => (
      values[key] === undefined || values[key] === null ? match : String(values[key])
    ));
  }

  function navdeskUrl() {
    const lang = (window.BRKOVIC_LANGUAGE && typeof window.BRKOVIC_LANGUAGE.getCurrentLang === "function")
      ? window.BRKOVIC_LANGUAGE.getCurrentLang()
      : (document.documentElement.lang || "en");
    const prefix = lang && lang !== "en" ? `/${encodeURIComponent(lang)}` : "";
    return `${prefix}/navdesk.html`;
  }

  function isNavdeskEntry() {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("from") === "navdesk") return true;
    try {
      if (!document.referrer) return false;
      const referrer = new URL(document.referrer);
      if (referrer.origin !== window.location.origin) return false;
      return /\/(?:[a-z]{2}\/)?navdesk\.html$/i.test(referrer.pathname);
    } catch (error) {
      return false;
    }
  }

  function refreshAccessUi() {
    const authenticated = hasToolAuth();
    const app = $("instrumentsApp");
    if (app) {
      if (state.authGraceActive && !authenticated) app.setAttribute("data-tool-auth-public", "");
      else app.removeAttribute("data-tool-auth-public");
    }
    setHidden("instrumentsAuthBar", authenticated || !state.authPrompted || !state.started);
    renderWeatherAlertUi(weatherWatchLevel(summarizeForecast(state.weather?.forecast)));
  }

  function weatherText(code) {
    const map = {
      0: ["☼", t("navdesk_instruments_wx_clear", "Clear"), "clear"],
      1: ["☼", t("navdesk_instruments_wx_mainly_clear", "Mainly clear"), "clear"],
      2: ["◐", t("navdesk_instruments_wx_partly_cloudy", "Partly cloudy"), "cloud"],
      3: ["☁", t("navdesk_instruments_wx_cloudy", "Cloudy"), "cloud"],
      45: ["≋", t("navdesk_instruments_wx_fog", "Fog"), "cloud"],
      48: ["≋", t("navdesk_instruments_wx_fog", "Fog"), "cloud"],
      51: ["⋰", t("navdesk_instruments_wx_drizzle", "Drizzle"), "rain"],
      53: ["⋰", t("navdesk_instruments_wx_drizzle", "Drizzle"), "rain"],
      55: ["⋰", t("navdesk_instruments_wx_drizzle", "Drizzle"), "rain"],
      61: ["☂", t("navdesk_instruments_wx_rain", "Rain"), "rain"],
      63: ["☂", t("navdesk_instruments_wx_rain", "Rain"), "rain"],
      65: ["☂", t("navdesk_instruments_wx_heavy_rain", "Heavy rain"), "rain"],
      71: ["✳", t("navdesk_instruments_wx_snow", "Snow"), "rain"],
      73: ["✳", t("navdesk_instruments_wx_snow", "Snow"), "rain"],
      75: ["✳", t("navdesk_instruments_wx_snow", "Snow"), "rain"],
      80: ["☂", t("navdesk_instruments_wx_showers", "Showers"), "rain"],
      81: ["☂", t("navdesk_instruments_wx_showers", "Showers"), "rain"],
      82: ["☂", t("navdesk_instruments_wx_showers", "Showers"), "rain"],
      95: ["ϟ", t("navdesk_instruments_wx_thunder", "Thunderstorm"), "storm"],
      96: ["ϟ", t("navdesk_instruments_wx_thunder", "Thunderstorm"), "storm"],
      99: ["ϟ", t("navdesk_instruments_wx_thunder", "Thunderstorm"), "storm"],
    };
    return map[Number(code)] || ["◌", t("navdesk_instruments_no_data", "No data"), "unknown"];
  }

  function gpsQualityLabel(accuracy) {
    const value = Number(accuracy);
    if (!Number.isFinite(value)) return t("navdesk_instruments_gps_no_accuracy", "GPS accuracy unavailable");
    if (value > 60) return t("navdesk_instruments_gps_low_accuracy", "Low GPS accuracy");
    if (value > 25) return t("navdesk_instruments_gps_medium_accuracy", "Medium GPS accuracy");
    return t("navdesk_instruments_gps_good_accuracy", "Good GPS accuracy");
  }

  function fallbackMotion(point) {
    const points = state.points;
    if (points.length < 2) return {};
    const prev = points[points.length - 2];
    if (!prev || !point) return {};
    if (Number(point.accuracy || 999) > MAX_ACCURACY_FOR_FALLBACK || Number(prev.accuracy || 999) > MAX_ACCURACY_FOR_FALLBACK) return {};
    const distance = distanceMeters(prev, point);
    const seconds = Math.max(0, (point.timestamp - prev.timestamp) / 1000);
    if (seconds < 2 || seconds > 90 || distance < MIN_MOVE_METERS) return { standing: true };
    const speedKn = (distance / seconds) * 1.943844492;
    if (speedKn < MIN_SPEED_KN) return { standing: true };
    return {
      speedKn,
      heading: bearingDegrees(prev, point),
      fallback: true,
    };
  }

  function renderGps() {
    const gps = state.gps;
    if (!gps) {
      setText("instLat", "—");
      setText("instLon", "—");
      setText("instCog", "—");
      setText("instSog", "—");
      setText("instAccuracy", "—");
      setText("instGpsTime", "—");
      return;
    }
    setText("instLat", formatCoordinate(gps.lat, "lat"));
    setText("instLon", formatCoordinate(gps.lon, "lon"));
    setText("instAccuracy", Number.isFinite(gps.accuracy) ? `±${Math.round(gps.accuracy)} m` : "—");
    setText("instGpsTime", formatTime(new Date(gps.timestamp)));

    const cog = Number.isFinite(gps.heading) && !gps.standing ? `${pad3(gps.heading)}°` : "—";
    const sog = Number.isFinite(gps.speedKn) ? `${Math.max(0, gps.speedKn).toFixed(1)} kn` : "—";
    setText("instCog", cog);
    setText("instSog", sog);
    setText("gpsNote", `${gpsQualityLabel(gps.accuracy)} · ${gps.fallback ? t("navdesk_instruments_motion_fallback", "COG/SOG calculated from recent GPS points") : t("navdesk_instruments_source_device", "Source: device GPS")}`);
  }

  function renderWeather() {
    const weather = state.weather;
    if (!weather) {
      setText("instWeatherCondition", t("navdesk_instruments_no_data", "No data"));
      setText("instAir", "—");
      setText("instPressure", "—");
      setText("instWind", "—");
      setText("instWater", "—");
      setText("instWave", "—");
      setText("instWaveDirection", "—");
      setText("instWxTime", "—");
      setText("instWeatherUpdated", "WX —");
      setText("weatherNote", t("navdesk_instruments_weather_idle_short", "WX · waiting"));
      $("instWeatherVisual")?.classList.remove("bridge-weather-visual--clear", "bridge-weather-visual--cloud", "bridge-weather-visual--rain", "bridge-weather-visual--storm");
      $("instWeatherVisual")?.classList.add("bridge-weather-visual--unknown");
      return;
    }
    const [, label, visual] = weatherText(weather.code);
    const weatherVisual = $("instWeatherVisual");
    if (weatherVisual) {
      weatherVisual.className = `bridge-weather-visual bridge-weather-visual--${visual}`;
    }
    setText("instWeatherCondition", label);
    setText("instAir", Number.isFinite(weather.temperature) ? `${Math.round(weather.temperature)}°C` : "—");
    setText("instPressure", Number.isFinite(weather.pressure) ? `${Math.round(weather.pressure)} hPa` : "—");
    const wind = Number.isFinite(weather.windSpeed)
      ? `${weather.windSpeed.toFixed(0)} kn ${Number.isFinite(weather.windDirection) ? `${pad3(weather.windDirection)}° ${cardinal(weather.windDirection)}` : ""}`.trim()
      : "—";
    setText("instWind", wind);
    setText("instWater", Number.isFinite(weather.waterTemperature) ? `${Math.round(weather.waterTemperature)}°C` : "—");
    setText("instWave", Number.isFinite(weather.waveHeight) ? `${weather.waveHeight.toFixed(1)} m` : "—");
    setText("instWaveDirection", Number.isFinite(weather.waveDirection) ? `${pad3(weather.waveDirection)}° ${cardinal(weather.waveDirection)}` : "—");
    const weatherDate = weather.updated ? new Date(weather.updated) : null;
    setText("instWxTime", weatherDate ? formatTime(weatherDate) : "—");
    setText("instWeatherUpdated", weatherDate ? `WX ${formatTime(weatherDate)}` : "WX —");
    setText("weatherNote", `OM · M · ${weather.cached ? t("navdesk_instruments_saved", "saved") : t("navdesk_instruments_recent", "recent")}`);
  }

  function maxPressureDrop(points, hours) {
    const valid = points.filter((item) => Number.isFinite(item.pressure) && Number.isFinite(item.time));
    let maxDrop = 0;
    const windowMs = hours * 60 * 60 * 1000;
    for (let i = 0; i < valid.length; i += 1) {
      for (let j = i + 1; j < valid.length; j += 1) {
        if (valid[j].time - valid[i].time > windowMs) break;
        const drop = valid[i].pressure - valid[j].pressure;
        if (drop > maxDrop) maxDrop = drop;
      }
    }
    return maxDrop;
  }

  function weatherWatchLevel(summary) {
    if (!summary || summary.count < 2) return "unknown";
    const gust = Number(summary.maxGust || 0);
    const rain = Number(summary.maxRain || 0);
    const drop6 = Number(summary.pressureDrop6 || 0);
    const drop12 = Number(summary.pressureDrop12 || 0);
    if (gust >= 40 || ((drop6 >= 10 || drop12 >= 15) && (gust >= 30 || rain >= 70))) return "purple";
    if (gust >= 30 || drop6 >= 6 || drop12 >= 10 || (rain >= 70 && (gust >= 17 || drop6 >= 3 || drop12 >= 5))) return "red";
    if (gust >= 17 || rain > 40 || drop6 >= 3 || drop12 >= 5) return "yellow";
    return "green";
  }

  function hasMarineContext(weather) {
    return Boolean(weather)
      && (
        Number.isFinite(weather.waterTemperature)
        || Number.isFinite(weather.waveHeight)
        || Number.isFinite(weather.waveDirection)
      );
  }

  function gpsAgeMs() {
    return state.gps?.timestamp ? Date.now() - Number(state.gps.timestamp) : Infinity;
  }

  function isFreshGpsForWeatherAlert() {
    return Number.isFinite(gpsAgeMs()) && gpsAgeMs() <= WEATHER_ALERT_FRESH_MS;
  }

  function weatherAlertKey(level) {
    const lat = Number.isFinite(state.gps?.lat) ? state.gps.lat.toFixed(2) : "na";
    const lon = Number.isFinite(state.gps?.lon) ? state.gps.lon.toFixed(2) : "na";
    return `${level}:${lat}:${lon}`;
  }

  function readLastWeatherAlert() {
    const data = readCache(WEATHER_ALERT_LAST_KEY);
    return data && typeof data === "object" ? data : null;
  }

  function canRepeatWeatherAlert(level) {
    const last = readLastWeatherAlert();
    if (!last) return true;
    if (last.key !== weatherAlertKey(level)) return true;
    return Date.now() - Number(last.sentAt || 0) > WEATHER_ALERT_REPEAT_MS;
  }

  function writeLastWeatherAlert(level) {
    writeCache(WEATHER_ALERT_LAST_KEY, {
      key: weatherAlertKey(level),
      sentAt: Date.now(),
    });
  }

  function weatherAlertStatusText(level) {
    if (!hasToolAuth()) return t("navdesk_instruments_alert_auth_required", "Sign in to use weather alerts.");
    if (notificationPermission() === "unsupported") return t("navdesk_instruments_alert_unsupported", "System notifications are not supported here.");
    if (!weatherAlertsEnabled()) return t("navdesk_instruments_alert_ready", "Weather alerts are ready for fresh water-position checks.");
    if (!state.gps) return t("navdesk_instruments_alert_wait_gps", "Alerts are on. Waiting for GPS.");
    if (!isFreshGpsForWeatherAlert()) return t("navdesk_instruments_alert_stale", "Alerts paused: GPS position is older than 4 hours.");
    if (!hasMarineContext(state.weather)) return t("navdesk_instruments_alert_land", "Alerts are on. Waiting for marine data at this point.");
    if (level === "red" || level === "purple") return t("navdesk_instruments_alert_watch", "Alert level detected. Notification will be sent once for this area.");
    return t("navdesk_instruments_alert_active", "Alerts are on. No red weather signal now.");
  }

  function renderWeatherAlertUi(level = "unknown") {
    const bar = $("weatherAlertBar");
    const button = $("weatherAlertButton");
    const status = $("weatherAlertStatus");
    if (!bar || !button || !status) return;
    const authed = hasToolAuth();
    bar.hidden = !authed;
    if (!authed) return;
    status.textContent = weatherAlertStatusText(level);
    const permission = notificationPermission();
    const enabled = weatherAlertsEnabled();
    button.hidden = permission === "unsupported";
    button.disabled = permission === "denied";
    button.textContent = permission === "denied"
      ? t("navdesk_instruments_alert_denied", "Notifications blocked")
      : enabled
        ? t("navdesk_instruments_alert_enabled", "Alerts enabled")
        : t("navdesk_instruments_alert_enable", "Enable alerts");
  }

  async function sendWeatherNotification(level, summary) {
    if (!hasToolAuth() || !weatherAlertsEnabled()) return;
    if (!state.gps || !isFreshGpsForWeatherAlert()) return;
    if (!hasMarineContext(state.weather)) return;
    if (!(level === "red" || level === "purple")) return;
    if (notificationPermission() !== "granted") return;
    if (!canRepeatWeatherAlert(level)) return;

    const title = level === "purple"
      ? t("navdesk_instruments_alert_title_purple", "Severe weather attention")
      : t("navdesk_instruments_alert_title_red", "Weather attention");
    const place = state.place?.label || t("navdesk_instruments_watch_place_default", "current position");
    const body = interpolate(t("navdesk_instruments_alert_body", "Weather around {place} has reached {level} attention for the next 48 hours."), {
      place,
      level: level === "purple"
        ? t("navdesk_instruments_alert_level_purple", "purple")
        : t("navdesk_instruments_alert_level_red", "red"),
    });
    const tag = `navdesk-weather-${weatherAlertKey(level)}`;
    const options = {
      body,
      tag,
      renotify: false,
      icon: "/favicons/android-chrome-192x192.png",
      badge: "/favicons/android-chrome-192x192.png",
      data: { url: localizedPath("navdesk-instruments.html") },
    };

    try {
      if (navigator.serviceWorker?.ready) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
      writeLastWeatherAlert(level);
      setText("weatherAlertStatus", t("navdesk_instruments_alert_sent", "Weather alert sent for this area."));
    } catch (error) {}
  }

  async function enableWeatherAlerts() {
    if (!hasToolAuth()) {
      await requestAuth();
      renderWeatherAlertUi();
      return;
    }
    if (notificationPermission() === "unsupported") {
      renderWeatherAlertUi();
      return;
    }
    if (Notification.permission === "default") {
      await Notification.requestPermission().catch(() => Notification.permission);
    }
    if (Notification.permission === "granted") {
      writeBool(WEATHER_ALERT_PREF_KEY, true);
      setText("weatherAlertStatus", t("navdesk_instruments_alert_enabled_note", "Weather alerts are enabled for fresh water positions."));
    }
    renderWeatherAlertUi(weatherWatchLevel(summarizeForecast(state.weather?.forecast)));
    if (state.weather?.forecast) sendWeatherNotification(weatherWatchLevel(summarizeForecast(state.weather.forecast)), summarizeForecast(state.weather.forecast));
  }

  function summarizeForecast(forecast) {
    const points = Array.isArray(forecast) ? forecast : [];
    const now = Date.now();
    const end = now + WEATHER_WATCH_HOURS * 60 * 60 * 1000;
    const scoped = points
      .map((item) => ({
        time: Date.parse(item.time),
        gust: Number(item.gust),
        rain: Number(item.rain),
        pressure: Number(item.pressure),
      }))
      .filter((item) => Number.isFinite(item.time) && item.time >= now - 60 * 60 * 1000 && item.time <= end);
    if (!scoped.length) return null;
    const maxGust = Math.max(...scoped.map((item) => Number.isFinite(item.gust) ? item.gust : 0));
    const maxRain = Math.max(...scoped.map((item) => Number.isFinite(item.rain) ? item.rain : 0));
    const pressureDrop6 = maxPressureDrop(scoped, 6);
    const pressureDrop12 = maxPressureDrop(scoped, 12);
    return {
      count: scoped.length,
      maxGust,
      maxRain,
      pressureDrop6,
      pressureDrop12,
    };
  }

  function renderWeatherWatch() {
    const watch = $("weatherWatch");
    if (!watch) return;
    const summary = summarizeForecast(state.weather?.forecast);
    const level = weatherWatchLevel(summary);
    const place = state.place?.label || t("navdesk_instruments_watch_place_default", "current position");
    const levelKey = `navdesk_instruments_watch_${level}`;
    const title = t(`${levelKey}_title`, t("navdesk_instruments_watch_wait_title", "Two-day weather outlook"));
    const fallbackText = level === "unknown"
      ? t("navdesk_instruments_watch_wait_text", "The outlook will appear after GPS and weather forecast are available.")
      : "";
    const text = interpolate(t(`${levelKey}_text`, fallbackText), { place });
    const rainVisual = summary && summary.maxRain > 40 ? " weather-watch--rain" : "";
    watch.className = `weather-watch weather-watch--${level}${rainVisual}`;
    setText("weatherWatchTitle", title);
    setText("weatherWatchText", text);
    renderWeatherAlertUi(level);
    if (summary) sendWeatherNotification(level, summary);
    const badges = $("weatherWatchBadges");
    if (!badges) return;
    badges.innerHTML = "";
    if (!summary || level === "unknown") {
      const badge = document.createElement("span");
      badge.className = "weather-watch__badge";
      badge.textContent = t("navdesk_instruments_watch_wait_badge", "Waiting for forecast");
      badges.appendChild(badge);
      return;
    }
    const items = [];
    if (summary.maxGust >= 17) {
      items.push(["wind", "≈", `${t("navdesk_instruments_watch_badge_wind", "Wind")} +${Math.round(summary.maxGust)} kn`]);
    }
    if (summary.maxRain > 40) {
      items.push(["rain", "☔", `${t("navdesk_instruments_watch_badge_rain", "Rain")} ${Math.round(summary.maxRain)}%`]);
    }
    const drop = Math.max(summary.pressureDrop6, summary.pressureDrop12);
    if (drop >= 3) {
      items.push(["pressure", "↘", `${t("navdesk_instruments_watch_badge_pressure", "Pressure")} -${drop.toFixed(0)} hPa`]);
    }
    if (!items.length) {
      items.push(["fair", "☼", t("navdesk_instruments_watch_badge_fair", "No attention triggers")]);
    }
    items.slice(0, 4).forEach(([kind, icon, label]) => {
      const badge = document.createElement("span");
      badge.className = `weather-watch__badge weather-watch__badge--${kind}`;
      badge.innerHTML = `<span aria-hidden="true">${icon}</span>${label}`;
      badges.appendChild(badge);
    });
  }

  function renderPlace() {
    const place = state.place;
    if (!place) {
      setText("instPlace", "—");
      setText("instPlaceSource", t("navdesk_instruments_place_waiting", "Waiting for coordinates"));
      return;
    }
    setText("instPlace", place.label || t("navdesk_instruments_at_sea", "At sea"));
    setText("instPlaceSource", place.source || t("navdesk_instruments_place_source", "Reverse geocoding"));
  }

  function renderTimes() {
    const now = new Date();
    setText("instLocalTime", formatTime(now));
    setText("instUtcTime", formatUtc(now));
  }

  function renderStatus() {
    const gpsEl = $("gpsStatus");
    const weatherEl = $("weatherStatus");
    const updatedEl = $("panelUpdated");
    if (state.gpsPaused) {
      setPill(gpsEl, t("navdesk_instruments_gps_paused", "GPS paused"), "waiting");
    } else if (state.gps) {
      setPill(gpsEl, t("navdesk_instruments_gps_active", "GPS active"), "active");
    } else {
      setPill(gpsEl, t("navdesk_instruments_gps_waiting", "GPS waiting"), "waiting");
    }
    if (state.weatherLoading) {
      setPill(weatherEl, t("navdesk_instruments_wx_loading", "WX loading"), "waiting");
    } else if (state.weather) {
      setPill(weatherEl, t("navdesk_instruments_wx_online", "WX online"), "active");
    } else {
      setPill(weatherEl, t("navdesk_instruments_wx_waiting", "WX waiting"), "waiting");
    }
    const newest = [state.gps?.timestamp, state.weather?.updated].filter(Boolean).sort().pop();
    setPill(updatedEl, newest ? `${t("navdesk_instruments_updated", "Updated")} ${formatTime(new Date(newest))}` : `${t("navdesk_instruments_updated", "Updated")} —`, newest ? "active" : "waiting");
    renderWeatherRefreshButton();
  }

  function scenarioForecast(level) {
    const base = Date.now();
    const settings = {
      green: { gust: 8, rain: 8, pressureStart: 1016, pressureEnd: 1015, code: 0, wind: 7, water: 23 },
      yellow: { gust: 20, rain: 18, pressureStart: 1015, pressureEnd: 1010, code: 2, wind: 15, water: 22 },
      "yellow-rain": { gust: 12, rain: 84, pressureStart: 1015, pressureEnd: 1013, code: 61, wind: 10, water: 22 },
      red: { gust: 33, rain: 20, pressureStart: 1014, pressureEnd: 1005, code: 3, wind: 24, water: 21 },
      "red-rain": { gust: 33, rain: 82, pressureStart: 1014, pressureEnd: 1005, code: 63, wind: 24, water: 21 },
      purple: { gust: 45, rain: 24, pressureStart: 1012, pressureEnd: 996, code: 3, wind: 35, water: 20 },
      "purple-rain": { gust: 45, rain: 100, pressureStart: 1012, pressureEnd: 996, code: 95, wind: 35, water: 20 },
    }[level] || {};
    return Array.from({ length: WEATHER_WATCH_HOURS + 1 }, (_, index) => {
      const ratio = index / WEATHER_WATCH_HOURS;
      const gustSwing = Math.sin(index / 5) * 1.4;
      const rainSwing = Math.max(0, Math.sin((index - 8) / 7) * 8);
      return {
        time: new Date(base + index * 60 * 60 * 1000).toISOString(),
        gust: Math.max(0, Number(settings.gust || 0) + gustSwing),
        rain: Math.min(100, Math.max(0, Number(settings.rain || 0) + rainSwing)),
        pressure: Number(settings.pressureStart || 1015) + (Number(settings.pressureEnd || 1015) - Number(settings.pressureStart || 1015)) * ratio,
      };
    });
  }

  function applyScenarioFromUrl() {
    const params = new URLSearchParams(window.location.search || "");
    const scenario = String(params.get("wxScenario") || "").toLowerCase();
    if (!WEATHER_SCENARIOS.has(scenario)) return false;
    const data = {
      green: { code: 0, temperature: 24, pressure: 1016, windSpeed: 7, windDirection: 205, waterTemperature: 23, waveHeight: 0.3, waveDirection: 210 },
      yellow: { code: 2, temperature: 23, pressure: 1012, windSpeed: 15, windDirection: 218, waterTemperature: 22, waveHeight: 0.7, waveDirection: 220 },
      "yellow-rain": { code: 61, temperature: 22, pressure: 1013, windSpeed: 10, windDirection: 190, waterTemperature: 22, waveHeight: 0.5, waveDirection: 195 },
      red: { code: 3, temperature: 21, pressure: 1007, windSpeed: 24, windDirection: 232, waterTemperature: 21, waveHeight: 1.3, waveDirection: 235 },
      "red-rain": { code: 63, temperature: 21, pressure: 1007, windSpeed: 24, windDirection: 232, waterTemperature: 21, waveHeight: 1.4, waveDirection: 235 },
      purple: { code: 3, temperature: 19, pressure: 998, windSpeed: 35, windDirection: 248, waterTemperature: 20, waveHeight: 2.1, waveDirection: 250 },
      "purple-rain": { code: 95, temperature: 19, pressure: 998, windSpeed: 35, windDirection: 248, waterTemperature: 20, waveHeight: 2.4, waveDirection: 250 },
    }[scenario];
    state.scenario = scenario;
    state.started = true;
    state.gps = {
      lat: 42.4411,
      lon: 18.6962,
      accuracy: 8,
      timestamp: Date.now(),
      speedKn: 0,
      heading: 205,
      standing: true,
    };
    state.place = {
      label: "Tivat, Montenegro",
      source: t("navdesk_instruments_place_source", "Reverse geocoding"),
    };
    state.weather = {
      ...data,
      updated: new Date().toISOString(),
      source: "Open-Meteo",
      forecast: scenarioForecast(scenario),
    };
    return true;
  }

  function renderAll() {
    renderTimes();
    renderGps();
    renderWeather();
    renderPlace();
    renderWeatherWatch();
    renderStatus();
  }

  async function fetchWeather(force = false) {
    if (state.scenario) return;
    if (!state.gps) {
      setText("weatherNote", t("navdesk_instruments_weather_needs_gps_short", "WX · GPS first"));
      return;
    }
    if (state.weatherLoading) return;
    const now = Date.now();
    const cached = readCache(WEATHER_CACHE_KEY);
    const cachedHasForecast = Array.isArray(cached?.weather?.forecast);
    if (!force && cachedHasForecast && cached?.lat && cached?.lon && Math.abs(cached.lat - state.gps.lat) < 0.08 && Math.abs(cached.lon - state.gps.lon) < 0.08 && now - Number(cached.fetchedAt || 0) < WEATHER_REFRESH_MS) {
      state.weather = { ...cached.weather, cached: true };
      renderAll();
      return;
    }
    state.weatherLoading = true;
    setText("weatherNote", t("navdesk_instruments_weather_loading_short", "WX · loading"));
    renderStatus();
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", state.gps.lat.toFixed(6));
      url.searchParams.set("longitude", state.gps.lon.toFixed(6));
      url.searchParams.set("current", "temperature_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m");
      url.searchParams.set("hourly", "wind_gusts_10m,precipitation_probability,surface_pressure");
      url.searchParams.set("wind_speed_unit", "kn");
      url.searchParams.set("forecast_days", "3");
      url.searchParams.set("timezone", "auto");
      const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
      marineUrl.searchParams.set("latitude", state.gps.lat.toFixed(6));
      marineUrl.searchParams.set("longitude", state.gps.lon.toFixed(6));
      marineUrl.searchParams.set("current", "sea_surface_temperature,wave_height,wave_direction");
      marineUrl.searchParams.set("timezone", "auto");
      const [response, marineResponse] = await Promise.all([
        fetch(url.href, { cache: "no-store" }),
        fetch(marineUrl.href, { cache: "no-store" }).catch(() => null),
      ]);
      if (!response.ok) throw new Error("weather");
      const payload = await response.json();
      const marinePayload = marineResponse?.ok ? await marineResponse.json().catch(() => null) : null;
      const current = payload.current || {};
      const hourly = payload.hourly || {};
      const times = Array.isArray(hourly.time) ? hourly.time : [];
      const forecast = times.map((time, index) => ({
        time,
        gust: Number(hourly.wind_gusts_10m?.[index]),
        rain: Number(hourly.precipitation_probability?.[index]),
        pressure: Number(hourly.surface_pressure?.[index]),
      }));
      state.weather = {
        temperature: Number(current.temperature_2m),
        code: Number(current.weather_code),
        pressure: Number(current.surface_pressure),
        windSpeed: Number(current.wind_speed_10m),
        windDirection: Number(current.wind_direction_10m),
        waterTemperature: Number(marinePayload?.current?.sea_surface_temperature),
        waveHeight: Number(marinePayload?.current?.wave_height),
        waveDirection: Number(marinePayload?.current?.wave_direction),
        updated: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
        source: "Open-Meteo",
        forecast,
      };
      writeCache(WEATHER_CACHE_KEY, {
        lat: state.gps.lat,
        lon: state.gps.lon,
        weather: state.weather,
        fetchedAt: now,
      });
    } catch (error) {
      const cachedWeather = cached?.weather;
      if (cachedWeather) {
        state.weather = { ...cachedWeather, cached: true };
        setText("weatherNote", t("navdesk_instruments_weather_saved_error", "WX · saved"));
      } else {
        setText("weatherNote", t("navdesk_instruments_weather_error", "Weather unavailable."));
        setPill($("weatherStatus"), t("navdesk_instruments_wx_error", "WX error"), "error");
      }
    } finally {
      state.weatherLoading = false;
      state.lastWeatherFetchAt = now;
      renderAll();
    }
  }

  async function fetchPlace(force = false) {
    if (state.scenario) return;
    if (!state.gps || state.placeLoading) return;
    const now = Date.now();
    const cached = readCache(PLACE_CACHE_KEY);
    if (!force && cached?.lat && cached?.lon && Math.abs(cached.lat - state.gps.lat) < 0.04 && Math.abs(cached.lon - state.gps.lon) < 0.04 && now - Number(cached.fetchedAt || 0) < PLACE_REFRESH_MS) {
      state.place = cached.place;
      renderAll();
      return;
    }
    state.placeLoading = true;
    try {
      const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
      url.searchParams.set("latitude", state.gps.lat.toFixed(6));
      url.searchParams.set("longitude", state.gps.lon.toFixed(6));
      url.searchParams.set("localityLanguage", "en");
      const response = await fetch(url.href, { cache: "no-store" });
      if (!response.ok) throw new Error("place");
      const payload = await response.json();
      const label = [
        payload.locality || payload.city || payload.principalSubdivision,
        payload.countryName,
      ].filter(Boolean).join(", ");
      state.place = {
        label: label || t("navdesk_instruments_at_sea", "At sea"),
        source: t("navdesk_instruments_place_source", "Reverse geocoding"),
      };
      writeCache(PLACE_CACHE_KEY, {
        lat: state.gps.lat,
        lon: state.gps.lon,
        place: state.place,
        fetchedAt: now,
      });
    } catch (error) {
      if (cached?.place) {
        state.place = cached.place;
      } else {
        state.place = {
          label: t("navdesk_instruments_at_sea", "At sea"),
          source: t("navdesk_instruments_place_unavailable", "Place unavailable"),
        };
      }
    } finally {
      state.placeLoading = false;
      renderAll();
    }
  }

  function handleGps(position) {
    const coords = position.coords || {};
    const point = {
      lat: Number(coords.latitude),
      lon: Number(coords.longitude),
      accuracy: Number(coords.accuracy),
      timestamp: Number(position.timestamp || Date.now()),
    };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return;
    state.points.push(point);
    state.points = state.points.slice(-6);
    const fallback = fallbackMotion(point);
    const rawSpeedKn = Number.isFinite(coords.speed) && coords.speed !== null ? mpsToKn(coords.speed) : null;
    const speedKn = rawSpeedKn !== null && rawSpeedKn >= MIN_SPEED_KN ? rawSpeedKn : fallback.speedKn;
    const heading = Number.isFinite(coords.heading) && coords.heading !== null ? Number(coords.heading) : fallback.heading;
    state.gps = {
      ...point,
      speedKn,
      heading,
      fallback: Boolean(fallback.fallback),
      standing: fallback.standing || (Number.isFinite(speedKn) && speedKn < MIN_SPEED_KN),
    };
    renderAll();
    fetchWeather(false);
    fetchPlace(false);
  }

  function handleGpsError(error) {
    const message = error?.code === 1
      ? t("navdesk_instruments_gps_denied_text", "Geolocation permission denied.")
      : t("navdesk_instruments_gps_unavailable_text", "GPS unavailable.");
    setText("gpsNote", message);
    setPill($("gpsStatus"), error?.code === 1 ? t("navdesk_instruments_gps_denied", "GPS denied") : t("navdesk_instruments_gps_unavailable", "GPS unavailable"), "error");
  }

  function startGps() {
    if (state.scenario) return;
    if (state.gpsWatchId !== null || !navigator.geolocation) return;
    state.gpsPaused = false;
    setText("gpsNote", t("navdesk_instruments_gps_requesting", "Requesting GPS permission."));
    setPill($("gpsStatus"), t("navdesk_instruments_gps_loading", "GPS loading"), "waiting");
    state.gpsWatchId = navigator.geolocation.watchPosition(handleGps, handleGpsError, {
      enableHighAccuracy: true,
      maximumAge: 4000,
      timeout: 16000,
    });
    renderAll();
  }

  function stopGps() {
    if (state.gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(state.gpsWatchId);
    }
    state.gpsWatchId = null;
    state.gpsPaused = true;
    renderAll();
  }

  async function expireAuthGrace() {
    if (!state.authGraceActive || hasToolAuth()) return;
    state.authGraceActive = false;
    state.authPrompted = true;
    if (state.authGraceTimer) {
      window.clearTimeout(state.authGraceTimer);
      state.authGraceTimer = 0;
    }
    refreshAccessUi();
    const allowed = await requestAuth();
    if (!allowed) {
      setText("gpsNote", t("navdesk_instruments_auth_required", "Sign in to continue working with live tools."));
      state.authPrompted = true;
      refreshAccessUi();
    }
  }

  function revealPanel(options = {}) {
    const shouldScroll = options.scroll !== false;
    setHidden("instrumentsLaunch", true);
    setHidden("instrumentsShell", false);
    if (shouldScroll) $("instrumentsShell")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startAuthGrace() {
    if (hasToolAuth() || state.authGraceActive || state.authPrompted) return;
    state.authGraceActive = true;
    if (state.authGraceTimer) window.clearTimeout(state.authGraceTimer);
    state.authGraceTimer = window.setTimeout(expireAuthGrace, AUTH_GRACE_MS);
    refreshAccessUi();
  }

  function openPanel(options = {}) {
    state.started = true;
    revealPanel(options);
    refreshAccessUi();
    startAuthGrace();
    if (!state.scenario) startGps();
  }

  async function requestAuth() {
    if (typeof window.ensureToolAccess !== "function") {
      const trigger = document.querySelector("[data-tool-account-menu]");
      if (trigger instanceof HTMLElement) trigger.click();
      return false;
    }
    const allowed = await window.ensureToolAccess({ requireLive: false }).catch(() => false);
    if (allowed) {
      state.authGraceActive = false;
      state.authPrompted = false;
      if (state.authGraceTimer) {
        window.clearTimeout(state.authGraceTimer);
        state.authGraceTimer = 0;
      }
      refreshAccessUi();
      if (!state.started) {
        openPanel();
      } else if (state.gpsWatchId === null) {
        startGps();
      }
    }
    return allowed;
  }

  function returnToNavDesk() {
    const href = navdeskUrl();
    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }
    window.location.href = href;
  }

  function openExitModal(url) {
    state.pendingExitUrl = absoluteUrl(url);
    const modal = $("instrumentsExitModal");
    if (!modal) {
      window.open(state.pendingExitUrl, "_blank", "noopener");
      state.pendingExitUrl = "";
      return;
    }
    modal.hidden = false;
    document.body.classList.add("instruments-exit-modal-open");
    setTimeout(() => modal.querySelector("button")?.focus(), 20);
  }

  function closeExitModal() {
    const modal = $("instrumentsExitModal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("instruments-exit-modal-open");
    state.pendingExitUrl = "";
  }

  function confirmExitModal() {
    const url = state.pendingExitUrl;
    closeExitModal();
    if (url) window.open(url, "_blank", "noopener");
  }

  async function copyCoordinates() {
    if (!state.gps) return;
    const value = `LAT ${formatCoordinate(state.gps.lat, "lat")}\nLON ${formatCoordinate(state.gps.lon, "lon")}`;
    try {
      await navigator.clipboard.writeText(value);
      setText("gpsNote", t("navdesk_instruments_copied", "Coordinates copied."));
    } catch (error) {
      setText("gpsNote", value);
    }
  }

  function bind() {
    ensureMenuThemeControl();
    $("instrumentsStartButton")?.addEventListener("click", openPanel);
    $("instrumentsAuthButton")?.addEventListener("click", requestAuth);
    document.querySelectorAll("[data-instruments-return]").forEach((button) => {
      button.addEventListener("click", returnToNavDesk);
    });
    document.querySelectorAll("[data-instruments-confirm-exit]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openExitModal(link.getAttribute("href") || "/");
      });
    });
    document.querySelectorAll("[data-instruments-exit-cancel]").forEach((button) => {
      button.addEventListener("click", closeExitModal);
    });
    document.querySelector("[data-instruments-exit-confirm]")?.addEventListener("click", confirmExitModal);
    $("instrumentsCopyCoords")?.addEventListener("click", copyCoordinates);
    $("instrumentsRefreshWeather")?.addEventListener("click", () => fetchWeather(true));
    $("weatherAlertButton")?.addEventListener("click", enableWeatherAlerts);
    $("instrumentsInstallPwa")?.addEventListener("click", () => {
      if (typeof window.openPwaInstallModal === "function") {
        window.openPwaInstallModal("menu");
      } else {
        document.querySelector("[data-open-pwa-install]")?.click();
      }
    });
    $("weatherWatchHelp")?.addEventListener("click", openWeatherWatchModal);
    document.querySelectorAll("[data-weather-watch-close]").forEach((button) => {
      button.addEventListener("click", closeWeatherWatchModal);
    });
    $("instrumentsGpsToggle")?.addEventListener("click", () => {
      if (state.gpsWatchId === null) {
        startGps();
        $("instrumentsGpsToggle").textContent = t("navdesk_instruments_pause_gps", "Pause GPS");
      } else {
        stopGps();
        $("instrumentsGpsToggle").textContent = t("navdesk_instruments_resume_gps", "Resume GPS");
      }
    });
    document.addEventListener("languageChanged", () => {
      ensureMenuThemeControl();
      renderAll();
    });
    document.addEventListener("click", (event) => {
      const themeButton = event.target.closest?.("[data-instruments-menu-theme] [data-navdesk-theme]");
      if (themeButton) {
        event.preventDefault();
        applyScreenTheme(themeButton.getAttribute("data-navdesk-theme"));
        return;
      }
      const returnLink = event.target.closest?.("#siteMenuModal [data-instruments-return]");
      if (returnLink) {
        event.preventDefault();
        returnToNavDesk();
        return;
      }
      const exitLink = event.target.closest?.("#siteMenuModal [data-instruments-confirm-exit]");
      if (exitLink) {
        event.preventDefault();
        openExitModal(exitLink.getAttribute("href") || "/");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeWeatherWatchModal();
        closeExitModal();
      }
    });
    document.addEventListener("brkovicToolAuthChanged", () => {
      if (hasToolAuth()) {
        state.authGraceActive = false;
        state.authPrompted = false;
        if (state.authGraceTimer) {
          window.clearTimeout(state.authGraceTimer);
          state.authGraceTimer = 0;
        }
      }
      refreshAccessUi();
      renderWeatherAlertUi(weatherWatchLevel(summarizeForecast(state.weather?.forecast)));
    });
  }

  function openWeatherWatchModal() {
    const modal = $("weatherWatchModal");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("weather-watch-modal-open");
    setTimeout(() => modal.querySelector("button, [href]")?.focus(), 20);
  }

  function closeWeatherWatchModal() {
    const modal = $("weatherWatchModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("weather-watch-modal-open");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cachedWeather = readCache(WEATHER_CACHE_KEY);
    if (cachedWeather?.weather) state.weather = { ...cachedWeather.weather, cached: true };
    const cachedPlace = readCache(PLACE_CACHE_KEY);
    if (cachedPlace?.place) state.place = cachedPlace.place;
    const scenarioApplied = applyScenarioFromUrl();
    bind();
    renderAll();
    refreshAccessUi();
    state.timeTimer = window.setInterval(renderTimes, 1000);
    if (!state.scenario && !navigator.geolocation) handleGpsError({ code: 2 });
    if (scenarioApplied || isNavdeskEntry()) openPanel({ scroll: false });
  });

  window.addEventListener("pagehide", () => {
    if (state.gpsWatchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(state.gpsWatchId);
    if (state.timeTimer) window.clearInterval(state.timeTimer);
    if (state.authGraceTimer) window.clearTimeout(state.authGraceTimer);
  });
})();
