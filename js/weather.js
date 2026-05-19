(function () {
  async function fetchWeather() {
    const config = window.BRKOVIC_CONFIG?.weather;
    if (!config) return;
    const weatherStatus = document.getElementById("weatherStatus");
    const weatherLocation = document.getElementById("weatherLocation");
    const weatherUpdated = document.getElementById("weatherUpdated");
    const weatherAir = document.getElementById("weatherAir");
    const weatherWater = document.getElementById("weatherWater");
    const weatherWind = document.getElementById("weatherWind");
    const weatherPrecip = document.getElementById("weatherPrecip");
    weatherLocation.textContent = config.label;
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${config.latitude}&longitude=${config.longitude}&current=temperature_2m,wind_speed_10m,precipitation&timezone=auto`;
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${config.latitude}&longitude=${config.longitude}&hourly=sea_surface_temperature&timezone=auto`;
      const [weatherResponse, marineResponse] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);
      if (!weatherResponse.ok || !marineResponse.ok) throw new Error("Weather request failed");
      const weatherData = await weatherResponse.json();
      const marineData = await marineResponse.json();
      const current = weatherData.current || {};
      const waterSeries = marineData.hourly?.sea_surface_temperature || [];
      const waterTemp = waterSeries.length ? waterSeries[0] : null;
      weatherAir.textContent = current.temperature_2m !== undefined ? `${Math.round(current.temperature_2m)}°C` : "—";
      weatherWater.textContent = waterTemp !== null ? `${Math.round(waterTemp)}°C` : "—";
      weatherWind.textContent = current.wind_speed_10m !== undefined ? `${Math.round(current.wind_speed_10m)} km/h` : "—";
      weatherPrecip.textContent = current.precipitation !== undefined ? `${current.precipitation} mm` : "—";
      const updated = current.time ? new Date(current.time) : new Date();
      weatherUpdated.textContent = updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      weatherStatus.textContent = "Live data loaded";
    } catch (error) {
      weatherStatus.textContent = "Unable to load live weather right now.";
    }
  }
  document.addEventListener("DOMContentLoaded", fetchWeather);
})();