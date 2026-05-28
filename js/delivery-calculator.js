(function () {
  const root = document.getElementById("deliveryCalc");
  if (!root) return;

  const SPEED_BY_TYPE = {
    sail: 6,
    motor: 12
  };
  const SKIPPER_WORK_EUR_PER_NM = {
    "12-15": 3.5,
    "15-20": 4,
    "20-25": 4.5,
    "25-30": 4.5,
    "30-40": 5.5,
    "40plus": 7
  };
  const FUEL_BURN_LH = {
    sail: {
      "12-15": 6,
      "15-20": 10,
      "20-25": 18,
      "25-30": 30,
      "30-40": 55,
      "40plus": 90
    },
    motor: {
      "12-15": 65,
      "15-20": 160,
      "20-25": 260,
      "25-30": 380,
      "30-40": 600,
      "40plus": 900
    }
  };

  const els = {
    grid: root.querySelector(".delivery-calc__grid"),
    type: document.getElementById("deliveryVesselType"),
    length: document.getElementById("deliveryLengthBand"),
    start: document.getElementById("deliveryStartPoint"),
    finish: document.getElementById("deliveryFinishPoint"),
    distance: document.getElementById("deliveryDistanceNm"),
    fuelPrice: document.getElementById("deliveryFuelPrice"),
    fuelBurn: document.getElementById("deliveryFuelBurn"),
    fuelCost: document.getElementById("deliveryFuelCost"),
    fuelLiters: document.getElementById("deliveryFuelLiters"),
    workCost: document.getElementById("deliveryWorkCost"),
    summary: document.getElementById("deliveryCalcSummary"),
    speedFact: document.getElementById("deliveryCalcSpeedFact"),
    crewFact: document.getElementById("deliveryCalcCrewFact"),
    lookupBtn: document.getElementById("deliveryDistanceLookupBtn"),
    lookupStatus: document.getElementById("deliveryDistanceStatus"),
    advancedToggle: document.getElementById("deliveryAdvancedToggle"),
    locationSuggestions: document.getElementById("deliveryLocationSuggestions")
  };
  const locationOptions = Array.from(els.locationSuggestions?.options || [])
    .map((option) => option.value.trim())
    .filter(Boolean);

  function lang() {
    return document.documentElement.lang === "ru" ? "ru" : "en";
  }

  function numberValue(el) {
    const normalized = String(el?.value || "").replace(",", ".");
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
  }

  function money(value) {
    const locale = lang() === "ru" ? "ru-RU" : "en-GB";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(Math.max(0, value || 0));
  }

  function oneDecimal(value) {
    const locale = lang() === "ru" ? "ru-RU" : "en-GB";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(Math.max(0, value || 0));
  }

  function tr(key, fallback) {
    return (window.__BRKOVIC_TRANSLATIONS && window.__BRKOVIC_TRANSLATIONS[key]) || fallback;
  }

  function normalizeSearch(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function locationMatches(query) {
    const normalizedQuery = normalizeSearch(query).trim();
    if (normalizedQuery.length < 2) return [];

    return locationOptions
      .map((value) => {
        const normalizedValue = normalizeSearch(value);
        let score = Number.POSITIVE_INFINITY;
        if (normalizedValue.startsWith(normalizedQuery)) score = 0;
        else if (normalizedValue.includes(`, ${normalizedQuery}`)) score = 1;
        else if (normalizedValue.includes(` ${normalizedQuery}`)) score = 2;
        else if (normalizedValue.includes(normalizedQuery)) score = 3;
        return { value, score };
      })
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => a.score - b.score || a.value.localeCompare(b.value))
      .slice(0, 7)
      .map((item) => item.value);
  }

  function setupLocationAutocomplete(input) {
    if (!input || !locationOptions.length) return;

    const list = document.createElement("ul");
    const listId = `${input.id}Suggestions`;
    let matches = [];
    let activeIndex = -1;

    list.id = listId;
    list.className = "delivery-location-suggest";
    list.setAttribute("role", "listbox");
    input.parentElement?.appendChild(list);
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-expanded", "false");

    function setActive(index) {
      activeIndex = index;
      Array.from(list.querySelectorAll("button")).forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === activeIndex);
      });
    }

    function closeList() {
      matches = [];
      activeIndex = -1;
      list.classList.remove("is-open");
      list.textContent = "";
      input.setAttribute("aria-expanded", "false");
    }

    function choose(index) {
      const value = matches[index];
      if (!value) return;
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      closeList();
      input.focus();
    }

    function renderList() {
      matches = locationMatches(input.value);
      activeIndex = -1;
      list.textContent = "";

      if (!matches.length) {
        closeList();
        return;
      }

      matches.forEach((value, index) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = value;
        button.setAttribute("role", "option");
        button.addEventListener("mousedown", (event) => event.preventDefault());
        button.addEventListener("mouseenter", () => setActive(index));
        button.addEventListener("click", () => choose(index));
        item.appendChild(button);
        list.appendChild(item);
      });

      list.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("input", renderList);
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) renderList();
    });
    input.addEventListener("blur", () => {
      window.setTimeout(closeList, 120);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeList();
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
        return;
      }

      if (!list.classList.contains("is-open")) {
        renderList();
      }
      if (!matches.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((activeIndex + 1) % matches.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((activeIndex - 1 + matches.length) % matches.length);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        choose(activeIndex);
      }
    });
  }

  function setupAdvancedToggle() {
    if (!els.grid || !els.advancedToggle) return;

    els.advancedToggle.addEventListener("click", () => {
      const nextState = !els.grid.classList.contains("is-advanced-open");
      els.grid.classList.toggle("is-advanced-open", nextState);
      els.advancedToggle.setAttribute("aria-expanded", String(nextState));
    });
  }

  function setLookupStatus(text, state) {
    if (!els.lookupStatus) return;
    els.lookupStatus.textContent = text;
    els.lookupStatus.classList.toggle("is-ok", state === "ok");
    els.lookupStatus.classList.toggle("is-error", state === "error");
  }

  function selectedType() {
    return els.type?.value === "motor" ? "motor" : "sail";
  }

  function selectedLength() {
    return FUEL_BURN_LH[selectedType()][els.length?.value] ? els.length.value : "12-15";
  }

  function presetFuelBurn() {
    const type = selectedType();
    const length = selectedLength();
    return FUEL_BURN_LH[type][length];
  }

  function skipperWorkRate() {
    return SKIPPER_WORK_EUR_PER_NM[selectedLength()] || 4.5;
  }

  function applyFuelPreset() {
    if (els.fuelBurn) els.fuelBurn.value = String(presetFuelBurn());
  }

  function routePrefix() {
    const start = (els.start?.value || "").trim();
    const finish = (els.finish?.value || "").trim();
    if (start && finish) return `${start} -> ${finish} · `;
    if (start) return `${start} · `;
    if (finish) return `${finish} · `;
    return "";
  }

  function crewText(lengthBand) {
    const isRu = lang() === "ru";
    if (lengthBand === "12-15") {
      return isRu
        ? "Экипаж: обычно шкипер; второй человек по задаче, погоде и маршруту."
        : "Crew: usually skipper only; second crew member by task, weather and route.";
    }
    if (lengthBand === "15-20") {
      return isRu
        ? "Экипаж: ближе к 18 м deckhand / mate лучше закладывать заранее."
        : "Crew: closer to 18 m, a deckhand / mate should be planned in advance.";
    }
    if (lengthBand === "20-25") {
      return isRu
        ? "Экипаж: deckhand / mate желателен; около 23-24 м обычно становится условием доставки."
        : "Crew: deckhand / mate is recommended; around 23-24 m it usually becomes a delivery condition.";
    }
    return isRu
      ? "Экипаж: второй член экипажа и дальнейший состав по документам, страховой, менеджерской компании и маршруту."
      : "Crew: second crew member and further manning depend on papers, insurer, manager and route.";
  }

  function update() {
    const type = selectedType();
    const length = selectedLength();
    const distance = numberValue(els.distance);
    const fuelPrice = numberValue(els.fuelPrice);
    const fuelBurn = numberValue(els.fuelBurn) || presetFuelBurn();
    const speed = SPEED_BY_TYPE[type];
    const hours = speed > 0 ? distance / speed : 0;
    const fuelLiters = hours * fuelBurn;
    const fuelCost = fuelLiters * fuelPrice;
    const workCost = distance * skipperWorkRate();
    const isRu = lang() === "ru";

    if (els.fuelCost) els.fuelCost.textContent = money(fuelCost);
    if (els.fuelLiters) els.fuelLiters.textContent = `${oneDecimal(fuelLiters)} L`;
    if (els.workCost) els.workCost.textContent = money(workCost);
    if (els.speedFact) {
      els.speedFact.textContent = isRu
        ? `Скорость в расчете: ${speed} уз.`
        : `Calculation speed: ${speed} kn`;
    }
    if (els.crewFact) els.crewFact.textContent = crewText(length);

    if (els.summary) {
      if (!distance) {
        els.summary.textContent = isRu
          ? "Укажите морскую дистанцию, чтобы увидеть расчет."
          : "Enter sea distance to see the estimate.";
      } else {
        const time = isRu ? `${oneDecimal(hours)} ч` : `${oneDecimal(hours)} h`;
        const fuel = isRu
          ? `около ${oneDecimal(fuelLiters)} л топлива`
          : `about ${oneDecimal(fuelLiters)} L fuel`;
        els.summary.textContent = `${routePrefix()}${oneDecimal(distance)} NM · ${time} · ${fuel}`;
      }
    }
  }

  async function requestSeaDistance() {
    const from = (els.start?.value || "").trim();
    const to = (els.finish?.value || "").trim();

    if (from.length < 2 || to.length < 2) {
      setLookupStatus(
        tr("delivery_calc_route_status_missing", "Enter both start and finish points."),
        "error"
      );
      return;
    }

    if (els.lookupBtn) {
      els.lookupBtn.disabled = true;
      els.lookupBtn.textContent = tr("delivery_calc_route_button_loading", "Calculating...");
    }
    setLookupStatus(tr("delivery_calc_route_status_loading", "Requesting sea distance..."), "");

    try {
      const response = await fetch("../api/delivery-distance.php", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ from, to })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok || !Number.isFinite(Number(data.distance_nm))) {
        throw new Error(data.provider_message || data.error || "Distance request failed");
      }

      const distanceNm = Math.max(0, Number(data.distance_nm));
      if (els.distance) {
        els.distance.value = distanceNm.toFixed(1);
        els.distance.dispatchEvent(new Event("input", { bubbles: true }));
        els.distance.dispatchEvent(new Event("change", { bubbles: true }));
        els.distance.classList.remove("is-api-filled");
        window.requestAnimationFrame(() => {
          els.distance.classList.add("is-api-filled");
          window.setTimeout(() => els.distance.classList.remove("is-api-filled"), 1800);
        });
      }
      update();
      setLookupStatus(
        tr("delivery_calc_route_status_done", "Sea distance loaded.") + ` ${oneDecimal(distanceNm)} NM.`,
        "ok"
      );
    } catch (error) {
      setLookupStatus(
        tr("delivery_calc_route_status_error", "Sea distance is not available now. Enter NM manually."),
        "error"
      );
    } finally {
      if (els.lookupBtn) {
        els.lookupBtn.disabled = false;
        els.lookupBtn.textContent = tr("delivery_calc_route_button", "Calculate");
      }
    }
  }

  els.type?.addEventListener("change", () => {
    applyFuelPreset();
    update();
  });
  els.length?.addEventListener("change", () => {
    applyFuelPreset();
    update();
  });
  [els.start, els.finish, els.distance, els.fuelPrice, els.fuelBurn].forEach((el) => {
    el?.addEventListener("input", update);
  });
  [els.start, els.finish].forEach(setupLocationAutocomplete);
  setupAdvancedToggle();
  els.lookupBtn?.addEventListener("click", requestSeaDistance);

  document.addEventListener("languageChanged", () => {
    update();
    setLookupStatus(
      tr("delivery_calc_route_status_idle", "Enter the place in English. If the route is not found, type NM manually."),
      ""
    );
  });
  applyFuelPreset();
  update();
})();
