/**
 * WeatherNow – Location-Based Weather Forecast Application
 * Powered by Open-Meteo Geocoding & Forecast APIs (Free, No API key required)
 */

'use strict';

// ==========================================================================
// 1. Application State & Constants
// ==========================================================================
const APP_STATE = {
  currentUnit: 'C',         // 'C' or 'F'
  currentTheme: 'light',    // 'light' or 'dark'
  currentLocation: null,    // { name, region, country, lat, lon, timezone }
  weatherData: null,        // Cached raw forecast JSON from Open-Meteo
  isLoading: false,
  searchDebounceTimer: null
};

// Storage Keys
const STORAGE_KEYS = {
  LAST_LOCATION: 'weathernow_last_location',
  UNIT: 'weathernow_unit',
  THEME: 'weathernow_theme'
};

// API Endpoints
const API = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  FORECAST: 'https://api.open-meteo.com/v1/forecast',
  REVERSE_GEO: 'https://nominatim.openstreetmap.org/reverse'
};

// ==========================================================================
// 2. WMO Weather Code Interpretations & Vector Icons
// ==========================================================================
const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', iconDay: 'sun', iconNight: 'moon', type: 'clear' },
  1: { label: 'Mainly Clear', iconDay: 'sun-cloud', iconNight: 'moon-cloud', type: 'clear' },
  2: { label: 'Partly Cloudy', iconDay: 'sun-cloud', iconNight: 'moon-cloud', type: 'cloudy' },
  3: { label: 'Overcast', iconDay: 'cloud', iconNight: 'cloud', type: 'cloudy' },
  45: { label: 'Foggy', iconDay: 'fog', iconNight: 'fog', type: 'cloudy' },
  48: { label: 'Rime Fog', iconDay: 'fog', iconNight: 'fog', type: 'cloudy' },
  51: { label: 'Light Drizzle', iconDay: 'drizzle', iconNight: 'drizzle', type: 'rainy' },
  53: { label: 'Moderate Drizzle', iconDay: 'drizzle', iconNight: 'drizzle', type: 'rainy' },
  55: { label: 'Dense Drizzle', iconDay: 'rain', iconNight: 'rain', type: 'rainy' },
  56: { label: 'Freezing Drizzle', iconDay: 'snow-rain', iconNight: 'snow-rain', type: 'snowy' },
  57: { label: 'Heavy Freezing Drizzle', iconDay: 'snow-rain', iconNight: 'snow-rain', type: 'snowy' },
  61: { label: 'Slight Rain', iconDay: 'rain', iconNight: 'rain', type: 'rainy' },
  63: { label: 'Moderate Rain', iconDay: 'rain', iconNight: 'rain', type: 'rainy' },
  65: { label: 'Heavy Rain', iconDay: 'heavy-rain', iconNight: 'heavy-rain', type: 'rainy' },
  66: { label: 'Freezing Rain', iconDay: 'snow-rain', iconNight: 'snow-rain', type: 'snowy' },
  67: { label: 'Heavy Freezing Rain', iconDay: 'snow-rain', iconNight: 'snow-rain', type: 'snowy' },
  71: { label: 'Slight Snowfall', iconDay: 'snow', iconNight: 'snow', type: 'snowy' },
  73: { label: 'Moderate Snowfall', iconDay: 'snow', iconNight: 'snow', type: 'snowy' },
  75: { label: 'Heavy Snowfall', iconDay: 'heavy-snow', iconNight: 'heavy-snow', type: 'snowy' },
  77: { label: 'Snow Grains', iconDay: 'snow', iconNight: 'snow', type: 'snowy' },
  80: { label: 'Light Rain Showers', iconDay: 'drizzle', iconNight: 'drizzle', type: 'rainy' },
  81: { label: 'Moderate Rain Showers', iconDay: 'rain', iconNight: 'rain', type: 'rainy' },
  82: { label: 'Violent Rain Showers', iconDay: 'heavy-rain', iconNight: 'heavy-rain', type: 'rainy' },
  85: { label: 'Slight Snow Showers', iconDay: 'snow', iconNight: 'snow', type: 'snowy' },
  86: { label: 'Heavy Snow Showers', iconDay: 'heavy-snow', iconNight: 'heavy-snow', type: 'snowy' },
  95: { label: 'Thunderstorm', iconDay: 'thunderstorm', iconNight: 'thunderstorm', type: 'thunderstorm' },
  96: { label: 'Thunderstorm w/ Slight Hail', iconDay: 'thunderstorm', iconNight: 'thunderstorm', type: 'thunderstorm' },
  99: { label: 'Thunderstorm w/ Heavy Hail', iconDay: 'thunderstorm', iconNight: 'thunderstorm', type: 'thunderstorm' }
};

/**
 * Returns crisp SVG markup for a given icon identifier.
 */
function getSvgWeatherIcon(iconName) {
  switch (iconName) {
    case 'sun':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5" fill="#fef3c7"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`;

    case 'moon':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#e0e7ff"/>
        <circle cx="19" cy="5" r="1" fill="#f59e0b" stroke="none"/>
        <circle cx="16" cy="2" r="0.8" fill="#f59e0b" stroke="none"/>
      </svg>`;

    case 'sun-cloud':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41" stroke="#f59e0b"/>
        <circle cx="9" cy="9" r="4" fill="#fef3c7" stroke="#f59e0b"/>
        <path d="M19 18a4 4 0 0 0-4-4 4.5 4.5 0 0 0-3.3 1.5A3.5 3.5 0 0 0 7 18h12Z" fill="#f1f5f9" stroke="#64748b"/>
      </svg>`;

    case 'moon-cloud':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 4a5 5 0 0 1 4 7" stroke="#6366f1"/>
        <path d="M19 18a4 4 0 0 0-4-4 4.5 4.5 0 0 0-3.3 1.5A3.5 3.5 0 0 0 7 18h12Z" fill="#e2e8f0" stroke="#64748b"/>
      </svg>`;

    case 'cloud':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#f1f5f9"/>
      </svg>`;

    case 'fog':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="9" x2="20" y2="9"/>
        <line x1="2" y1="13" x2="22" y2="13"/>
        <line x1="6" y1="17" x2="18" y2="17"/>
      </svg>`;

    case 'drizzle':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 16H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 16Z" fill="#f1f5f9" stroke="#64748b"/>
        <line x1="8" y1="19" x2="8" y2="21" stroke="#38bdf8"/>
        <line x1="12" y1="19" x2="12" y2="21" stroke="#38bdf8"/>
        <line x1="16" y1="19" x2="16" y2="21" stroke="#38bdf8"/>
      </svg>`;

    case 'rain':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 15H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 15Z" fill="#e2e8f0" stroke="#64748b"/>
        <line x1="8" y1="18" x2="6" y2="22" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="12" y1="18" x2="10" y2="22" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="16" y1="18" x2="14" y2="22" stroke="#2563eb" stroke-width="2.5"/>
      </svg>`;

    case 'heavy-rain':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 14H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 14Z" fill="#cbd5e1" stroke="#475569"/>
        <line x1="7" y1="17" x2="5" y2="22" stroke="#1d4ed8" stroke-width="2.5"/>
        <line x1="11" y1="17" x2="9" y2="22" stroke="#1d4ed8" stroke-width="2.5"/>
        <line x1="15" y1="17" x2="13" y2="22" stroke="#1d4ed8" stroke-width="2.5"/>
        <line x1="19" y1="17" x2="17" y2="22" stroke="#1d4ed8" stroke-width="2.5"/>
      </svg>`;

    case 'snow':
    case 'snow-rain':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 15H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 15Z" fill="#f8fafc" stroke="#94a3b8"/>
        <circle cx="8" cy="19" r="1.5" fill="#38bdf8" stroke="none"/>
        <circle cx="12" cy="20" r="1.5" fill="#38bdf8" stroke="none"/>
        <circle cx="16" cy="19" r="1.5" fill="#38bdf8" stroke="none"/>
      </svg>`;

    case 'heavy-snow':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 14H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 14Z" fill="#e2e8f0" stroke="#64748b"/>
        <circle cx="7" cy="18" r="1.5" fill="#0284c7" stroke="none"/>
        <circle cx="11" cy="21" r="1.5" fill="#0284c7" stroke="none"/>
        <circle cx="15" cy="18" r="1.5" fill="#0284c7" stroke="none"/>
        <circle cx="19" cy="21" r="1.5" fill="#0284c7" stroke="none"/>
      </svg>`;

    case 'thunderstorm':
      return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.5 15H9a6 6 0 1 1 5.75-7.75A4 4 0 1 1 17.5 15Z" fill="#94a3b8" stroke="#334155"/>
        <polygon points="12 15 9 19 13 19 11 23 16 17 12 17 14 15" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
      </svg>`;

    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
      </svg>`;
  }
}

/**
 * Returns weather info (label, SVG, and background category) for a given WMO code and day/night status.
 */
function getWeatherInfo(code, isDay = 1) {
  const defaultInfo = { label: 'Clear Sky', iconDay: 'sun', iconNight: 'moon', type: 'clear' };
  const info = WMO_WEATHER_CODES[code] || defaultInfo;
  const iconName = isDay ? info.iconDay : info.iconNight;

  return {
    label: info.label,
    iconSvg: getSvgWeatherIcon(iconName),
    type: info.type,
    isDay: Boolean(isDay)
  };
}

// ==========================================================================
// 3. Helper Functions: Conversions, Formats, and Compass
// ==========================================================================
/**
 * Converts Celsius to Fahrenheit: °F = (°C * 9/5) + 32
 */
function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Formats a temperature number based on current selected unit (°C or °F).
 */
function formatTemp(celsius, unit = APP_STATE.currentUnit) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = unit === 'F' ? cToF(celsius) : celsius;
  return `${Math.round(val)}°`;
}

/**
 * Converts degrees to 16-point cardinal compass direction.
 */
function getWindDirectionText(degrees) {
  if (degrees === null || degrees === undefined) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Formats wind speed based on unit (km/h for C, mph for F).
 */
function formatWindSpeed(kmh, unit = APP_STATE.currentUnit) {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'F') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Interprets humidity level text.
 */
function getHumidityLevel(rh) {
  if (rh < 30) return 'Dry';
  if (rh <= 60) return 'Comfortable';
  if (rh <= 80) return 'Humid';
  return 'Very Humid';
}

/**
 * Interprets UV Index safety level.
 */
function getUvLevel(uv) {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

/**
 * Formats ISO date string to readable local time and day.
 */
function formatTimeFromIso(isoString, timezone) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined
    }).format(date);
  } catch {
    return isoString.split('T')[1]?.substring(0, 5) || isoString;
  }
}

/**
 * Formats ISO date string into day of week and date (e.g. "Tomorrow, Oct 21").
 */
function formatDailyDate(isoDateStr, index) {
  if (index === 0) return { day: 'Today', date: formatDateShort(isoDateStr) };
  if (index === 1) return { day: 'Tomorrow', date: formatDateShort(isoDateStr) };

  const date = new Date(isoDateStr + 'T00:00:00');
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  return {
    day: dayName,
    date: formatDateShort(isoDateStr)
  };
}

function formatDateShort(isoDateStr) {
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }
  return isoDateStr;
}

// ==========================================================================
// 4. DOM Elements
// ==========================================================================
const DOM = {
  // Theme & Units
  html: document.documentElement,
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIconSun: document.getElementById('themeIconSun'),
  themeIconMoon: document.getElementById('themeIconMoon'),
  unitCelsiusBtn: document.getElementById('unitCelsiusBtn'),
  unitFahrenheitBtn: document.getElementById('unitFahrenheitBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  weatherBg: document.getElementById('weatherBg'),

  // Search
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchSubmitBtn: document.getElementById('searchSubmitBtn'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  searchDropdown: document.getElementById('searchDropdown'),
  geoBtn: document.getElementById('geoBtn'),
  quickCityChips: document.querySelectorAll('.city-chip'),

  // States & Alerts
  alertBanner: document.getElementById('alertBanner'),
  alertMessage: document.getElementById('alertMessage'),
  alertCloseBtn: document.getElementById('alertCloseBtn'),
  loadingState: document.getElementById('loadingState'),
  welcomeState: document.getElementById('welcomeState'),
  weatherDashboard: document.getElementById('weatherDashboard'),

  // Current Weather Hero
  cityName: document.getElementById('cityName'),
  countryBadge: document.getElementById('countryBadge'),
  localDateTime: document.getElementById('localDateTime'),
  lastUpdatedTime: document.getElementById('lastUpdatedTime'),
  currentWeatherIcon: document.getElementById('currentWeatherIcon'),
  currentTemp: document.getElementById('currentTemp'),
  displayUnit: document.getElementById('displayUnit'),
  weatherDescription: document.getElementById('weatherDescription'),
  todayMaxTemp: document.getElementById('todayMaxTemp'),
  todayMinTemp: document.getElementById('todayMinTemp'),
  apparentTemp: document.getElementById('apparentTemp'),

  // Metrics
  humidityVal: document.getElementById('humidityVal'),
  humidityState: document.getElementById('humidityState'),
  humidityBar: document.getElementById('humidityBar'),
  windSpeedVal: document.getElementById('windSpeedVal'),
  windDirectionVal: document.getElementById('windDirectionVal'),
  windCompassIcon: document.getElementById('windCompassIcon'),
  precipProbVal: document.getElementById('precipProbVal'),
  precipProbState: document.getElementById('precipProbState'),
  precipBar: document.getElementById('precipBar'),
  uvIndexVal: document.getElementById('uvIndexVal'),
  uvIndexState: document.getElementById('uvIndexState'),
  sunriseVal: document.getElementById('sunriseVal'),
  sunsetVal: document.getElementById('sunsetVal'),

  // Forecasts
  hourlyContainer: document.getElementById('hourlyContainer'),
  dailyContainer: document.getElementById('dailyContainer'),
  hourlyScrollLeft: document.getElementById('hourlyScrollLeft'),
  hourlyScrollRight: document.getElementById('hourlyScrollRight')
};

// ==========================================================================
// 5. Notifications & UI State Helpers
// ==========================================================================
function showAlert(message, isError = true) {
  DOM.alertMessage.textContent = message;
  DOM.alertBanner.classList.remove('hidden');
  if (isError) {
    DOM.alertBanner.style.borderColor = 'rgba(239, 68, 68, 0.4)';
  }
}

function hideAlert() {
  DOM.alertBanner.classList.add('hidden');
}

function setLoading(isLoading) {
  APP_STATE.isLoading = isLoading;
  if (isLoading) {
    hideAlert();
    DOM.loadingState.classList.remove('hidden');
    DOM.searchSubmitBtn.disabled = true;
    DOM.geoBtn.disabled = true;
  } else {
    DOM.loadingState.classList.add('hidden');
    DOM.searchSubmitBtn.disabled = false;
    DOM.geoBtn.disabled = false;
  }
}

/**
 * Updates the dynamic ambient background based on weather type and daylight.
 */
function updateWeatherBackground(type, isDay) {
  DOM.weatherBg.className = 'weather-bg';
  if (type === 'clear') {
    DOM.weatherBg.classList.add(isDay ? 'bg-clear-day' : 'bg-clear-night');
  } else if (type === 'cloudy') {
    DOM.weatherBg.classList.add('bg-cloudy');
  } else if (type === 'rainy') {
    DOM.weatherBg.classList.add('bg-rainy');
  } else if (type === 'snowy') {
    DOM.weatherBg.classList.add('bg-snowy');
  } else if (type === 'thunderstorm') {
    DOM.weatherBg.classList.add('bg-thunderstorm');
  } else {
    DOM.weatherBg.classList.add('weather-bg-default');
  }
}

// ==========================================================================
// 6. API Services
// ==========================================================================
/**
 * Search locations by name using Open-Meteo Geocoding API.
 */
async function searchLocations(query) {
  const url = `${API.GEOCODING}?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed with status: ${response.status}`);
  }
  const data = await response.json();
  return data.results || [];
}

/**
 * Fetch 7-day forecast and 24-hr hourly data using Open-Meteo Forecast API.
 */
async function fetchWeatherForecast(lat, lon, timezone = 'auto') {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m',
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
    timezone: timezone,
    forecast_days: '7'
  });

  const url = `${API.FORECAST}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather forecast fetch failed with status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Reverse geocode latitude and longitude to get City/Country name using Nominatim.
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `${API.REVERSE_GEO}?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Reverse geocode request failed');
    const data = await response.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || 'My Location';
    const country = addr.country || '';
    const countryCode = addr.country_code ? addr.country_code.toUpperCase() : '';
    const region = addr.state || addr.county || '';

    return {
      name: city,
      region: region,
      country: country,
      country_code: countryCode
    };
  } catch (err) {
    console.warn('Reverse geocoding unavailable, falling back to coordinates:', err);
    return {
      name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      region: '',
      country: 'GPS',
      country_code: 'GPS'
    };
  }
}

// ==========================================================================
// 7. Render Functions
// ==========================================================================
/**
 * Main render coordinator: Takes location info and forecast data and paints the UI.
 */
function renderWeatherDashboard(location, data) {
  if (!data || !data.current) return;

  const current = data.current;
  const daily = data.daily || {};
  const hourly = data.hourly || {};
  const tz = data.timezone || 'UTC';

  // 1. Location Details
  DOM.cityName.textContent = location.name;
  DOM.countryBadge.textContent = location.country_code || location.country || 'GLOBAL';

  // Local date & time formatted in target city's timezone
  try {
    const nowInTz = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
    DOM.localDateTime.textContent = `Local Time: ${nowInTz}`;
  } catch {
    DOM.localDateTime.textContent = `Timezone: ${tz}`;
  }

  // Last updated
  const updateTimeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date());
  DOM.lastUpdatedTime.textContent = `Updated at ${updateTimeStr}`;

  // 2. Weather Condition & Icon
  const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
  DOM.currentWeatherIcon.innerHTML = weatherInfo.iconSvg;
  DOM.weatherDescription.textContent = weatherInfo.label;

  // Background update
  updateWeatherBackground(weatherInfo.type, current.is_day);

  // 3. Temperatures
  updateTemperatureDisplays();

  // 4. Metrics: Humidity
  const humidity = Math.round(current.relative_humidity_2m ?? 0);
  DOM.humidityVal.textContent = `${humidity}%`;
  DOM.humidityState.textContent = getHumidityLevel(humidity);
  DOM.humidityBar.style.width = `${Math.min(100, Math.max(0, humidity))}%`;

  // 5. Metrics: Wind
  const windKmh = current.wind_speed_10m ?? 0;
  DOM.windSpeedVal.textContent = formatWindSpeed(windKmh);
  const windDirDeg = current.wind_direction_10m ?? 0;
  const windCompass = getWindDirectionText(windDirDeg);
  DOM.windDirectionVal.textContent = `${windCompass} (${Math.round(windDirDeg)}°)`;
  DOM.windCompassIcon.style.transform = `rotate(${windDirDeg}deg)`;

  // 6. Metrics: Precipitation Probability
  const precipProb = daily.precipitation_probability_max?.[0] ?? 0;
  DOM.precipProbVal.textContent = `${precipProb}%`;
  DOM.precipProbState.textContent = precipProb > 60 ? 'High probability' : precipProb > 25 ? 'Scattered rain' : 'Low chance of rain';
  DOM.precipBar.style.width = `${Math.min(100, Math.max(0, precipProb))}%`;

  // 7. Metrics: UV Index
  const uvMax = daily.uv_index_max?.[0] ?? 0;
  DOM.uvIndexVal.textContent = uvMax.toFixed(1);
  DOM.uvIndexState.textContent = `${getUvLevel(uvMax)} protection needed`;

  // 8. Sun Times
  if (daily.sunrise?.[0] && daily.sunset?.[0]) {
    DOM.sunriseVal.textContent = formatTimeFromIso(daily.sunrise[0], tz);
    DOM.sunsetVal.textContent = formatTimeFromIso(daily.sunset[0], tz);
  } else {
    DOM.sunriseVal.textContent = '--:--';
    DOM.sunsetVal.textContent = '--:--';
  }

  // 9. Hourly Forecast (Next 24 Hours)
  renderHourlyForecast(hourly, current.time, tz);

  // 10. 7-Day Forecast
  renderDailyForecast(daily);

  // Show dashboard, hide welcome state
  DOM.welcomeState.classList.add('hidden');
  DOM.weatherDashboard.classList.remove('hidden');
}

/**
 * Updates all temperature displays across the page using cached raw data.
 * This runs when data loads AND immediately when the user toggles °C / °F.
 */
function updateTemperatureDisplays() {
  if (!APP_STATE.weatherData) return;
  const data = APP_STATE.weatherData;
  const unit = APP_STATE.currentUnit;

  // Main Current Temp
  const currentTemp = data.current.temperature_2m;
  DOM.currentTemp.textContent = Math.round(unit === 'F' ? cToF(currentTemp) : currentTemp);
  DOM.displayUnit.textContent = `°${unit}`;

  // Apparent Temp
  const apparent = data.current.apparent_temperature;
  DOM.apparentTemp.textContent = formatTemp(apparent, unit);

  // Today High / Low
  const maxTemp = data.daily?.temperature_2m_max?.[0];
  const minTemp = data.daily?.temperature_2m_min?.[0];
  DOM.todayMaxTemp.textContent = formatTemp(maxTemp, unit);
  DOM.todayMinTemp.textContent = formatTemp(minTemp, unit);

  // Wind speed units
  DOM.windSpeedVal.textContent = formatWindSpeed(data.current.wind_speed_10m, unit);

  // Update hourly cards
  const hourlyCards = DOM.hourlyContainer.querySelectorAll('.hourly-card');
  hourlyCards.forEach(card => {
    const rawCelsius = parseFloat(card.dataset.celsius);
    if (!isNaN(rawCelsius)) {
      const tempEl = card.querySelector('.hourly-temp');
      if (tempEl) tempEl.textContent = formatTemp(rawCelsius, unit);
    }
  });

  // Update daily rows
  const dailyRows = DOM.dailyContainer.querySelectorAll('.daily-row');
  dailyRows.forEach(row => {
    const minC = parseFloat(row.dataset.minCelsius);
    const maxC = parseFloat(row.dataset.maxCelsius);
    if (!isNaN(minC) && !isNaN(maxC)) {
      const minEl = row.querySelector('.daily-min-temp');
      const maxEl = row.querySelector('.daily-max-temp');
      if (minEl) minEl.textContent = formatTemp(minC, unit);
      if (maxEl) maxEl.textContent = formatTemp(maxC, unit);
    }
  });
}

/**
 * Renders next 24 hours of hourly data.
 */
function renderHourlyForecast(hourly, currentTimeIso, tz) {
  DOM.hourlyContainer.innerHTML = '';
  if (!hourly || !hourly.time || hourly.time.length === 0) return;

  // Determine starting index: current hour
  let startIndex = 0;
  if (currentTimeIso) {
    const currentHourStr = currentTimeIso.substring(0, 13); // "YYYY-MM-DDTHH"
    const foundIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
    if (foundIndex !== -1) {
      startIndex = foundIndex;
    }
  }

  // Take 24 hours
  const hoursToShow = 24;
  const endIndex = Math.min(startIndex + hoursToShow, hourly.time.length);

  for (let i = startIndex; i < endIndex; i++) {
    const timeIso = hourly.time[i];
    const tempC = hourly.temperature_2m[i];
    const code = hourly.weather_code[i];
    const isDay = hourly.is_day ? hourly.is_day[i] : 1;
    const isCurrent = i === startIndex;

    const timeLabel = isCurrent ? 'Now' : formatTimeFromIso(timeIso, tz);
    const weather = getWeatherInfo(code, isDay);

    const card = document.createElement('div');
    card.className = `hourly-card ${isCurrent ? 'active-hour' : ''}`;
    card.dataset.celsius = tempC;

    card.innerHTML = `
      <span class="hourly-time">${timeLabel}</span>
      <div class="hourly-icon" title="${weather.label}">
        ${weather.iconSvg}
      </div>
      <span class="hourly-temp">${formatTemp(tempC)}</span>
    `;

    DOM.hourlyContainer.appendChild(card);
  }
}

/**
 * Renders 7-day daily forecast rows.
 */
function renderDailyForecast(daily) {
  DOM.dailyContainer.innerHTML = '';
  if (!daily || !daily.time || daily.time.length === 0) return;

  // Compute global min and max across all 7 days for relative bar width
  const allMins = daily.temperature_2m_min.filter(v => v !== null && !isNaN(v));
  const allMaxs = daily.temperature_2m_max.filter(v => v !== null && !isNaN(v));
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempRange = Math.max(1, globalMax - globalMin);

  daily.time.forEach((dateStr, i) => {
    const code = daily.weather_code[i];
    const minC = daily.temperature_2m_min[i];
    const maxC = daily.temperature_2m_max[i];
    const weather = getWeatherInfo(code, 1);
    const dateInfo = formatDailyDate(dateStr, i);

    // Calculate bar percentage
    const leftPct = Math.max(0, ((minC - globalMin) / tempRange) * 100);
    const widthPct = Math.max(10, (((maxC - minC) / tempRange) * 100));

    const row = document.createElement('div');
    row.className = 'daily-row';
    row.dataset.minCelsius = minC;
    row.dataset.maxCelsius = maxC;

    row.innerHTML = `
      <div class="daily-day-info">
        <span class="daily-day-name">${dateInfo.day}</span>
        <span class="daily-date">${dateInfo.date}</span>
      </div>
      <div class="daily-icon" title="${weather.label}">
        ${weather.iconSvg}
      </div>
      <span class="daily-condition-label">${weather.label}</span>
      <span class="daily-min-temp">${formatTemp(minC)}</span>
      <div class="daily-temp-bar-bg" aria-hidden="true">
        <div class="daily-temp-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
      </div>
      <span class="daily-max-temp">${formatTemp(maxC)}</span>
    `;

    DOM.dailyContainer.appendChild(row);
  });
}

// ==========================================================================
// 8. Core Weather Controller: Load & Handle Location
// ==========================================================================
/**
 * Loads weather data for a specified location object and updates UI & storage.
 */
async function loadWeatherForLocation(location) {
  if (!location || location.lat === undefined || location.lon === undefined) return;

  setLoading(true);
  try {
    const weatherData = await fetchWeatherForecast(location.lat, location.lon, location.timezone || 'auto');

    // Update global state
    APP_STATE.currentLocation = location;
    APP_STATE.weatherData = weatherData;

    // Render
    renderWeatherDashboard(location, weatherData);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  } catch (err) {
    console.error('Weather load error:', err);
    showAlert(`Failed to fetch weather data for ${location.name}. Please check your connection and try again.`);
  } finally {
    setLoading(false);
  }
}

// ==========================================================================
// 9. Search Autocomplete & User Input Handlers
// ==========================================================================
/**
 * Renders suggestions into the search dropdown.
 */
function renderSearchSuggestions(results) {
  DOM.searchDropdown.innerHTML = '';
  if (!results || results.length === 0) {
    DOM.searchDropdown.innerHTML = `<div class="dropdown-empty">No matching locations found</div>`;
    DOM.searchDropdown.classList.remove('hidden');
    return;
  }

  results.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.setAttribute('role', 'option');
    div.tabIndex = 0;

    const regionText = [item.admin1, item.country].filter(Boolean).join(', ');

    div.innerHTML = `
      <div class="dropdown-item-main">
        <span class="dropdown-city">${item.name}</span>
        <span class="dropdown-region">${regionText}</span>
      </div>
      <span class="dropdown-country-code">${item.country_code || ''}</span>
    `;

    // Click handler to select
    div.addEventListener('click', () => {
      selectLocationFromItem(item);
    });

    // Keyboard selection with Enter
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        selectLocationFromItem(item);
      }
    });

    DOM.searchDropdown.appendChild(div);
  });

  DOM.searchDropdown.classList.remove('hidden');
}

function selectLocationFromItem(item) {
  const loc = {
    name: item.name,
    region: item.admin1 || '',
    country: item.country || '',
    country_code: item.country_code || '',
    lat: item.latitude,
    lon: item.longitude,
    timezone: item.timezone || 'auto'
  };

  DOM.searchInput.value = `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}`;
  DOM.searchDropdown.classList.add('hidden');
  DOM.clearSearchBtn.classList.remove('hidden');
  loadWeatherForLocation(loc);
}

/**
 * Handle direct search submission (form submit or Enter key).
 */
async function handleSearchSubmit() {
  const query = DOM.searchInput.value.trim();
  if (!query) {
    showAlert('Please enter a city or location name to search.');
    return;
  }

  DOM.searchDropdown.classList.add('hidden');
  setLoading(true);

  try {
    const results = await searchLocations(query);
    if (!results || results.length === 0) {
      showAlert(`No location found matching "${query}". Please check the spelling.`);
      return;
    }

    // Select the first match
    selectLocationFromItem(results[0]);
  } catch (err) {
    console.error('Search error:', err);
    showAlert('Failed to search location. Please check your internet connection.');
  } finally {
    setLoading(false);
  }
}

// Input autocomplete debounce
DOM.searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  DOM.clearSearchBtn.classList.toggle('hidden', query.length === 0);

  clearTimeout(APP_STATE.searchDebounceTimer);
  if (query.length < 2) {
    DOM.searchDropdown.classList.add('hidden');
    return;
  }

  APP_STATE.searchDebounceTimer = setTimeout(async () => {
    try {
      const results = await searchLocations(query);
      renderSearchSuggestions(results);
    } catch (err) {
      console.warn('Debounced geocoding error:', err);
    }
  }, 320);
});

// Clear input button
DOM.clearSearchBtn.addEventListener('click', () => {
  DOM.searchInput.value = '';
  DOM.clearSearchBtn.classList.add('hidden');
  DOM.searchDropdown.classList.add('hidden');
  DOM.searchInput.focus();
});

// Search form submit
DOM.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSearchSubmit();
});

DOM.searchSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  handleSearchSubmit();
});

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
  if (!DOM.searchForm.contains(e.target) && !DOM.searchDropdown.contains(e.target)) {
    DOM.searchDropdown.classList.add('hidden');
  }
});

// Quick city chips
DOM.quickCityChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const city = chip.dataset.city;
    DOM.searchInput.value = city;
    DOM.clearSearchBtn.classList.remove('hidden');
    handleSearchSubmit();
  });
});

// ==========================================================================
// 10. Geolocation ("Use My Location")
// ==========================================================================
DOM.geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showAlert('Geolocation is not supported by your browser.');
    return;
  }

  setLoading(true);
  hideAlert();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        // Reverse geocode to get city name
        const geoInfo = await reverseGeocode(lat, lon);
        const loc = {
          name: geoInfo.name,
          region: geoInfo.region,
          country: geoInfo.country,
          country_code: geoInfo.country_code,
          lat: lat,
          lon: lon,
          timezone: 'auto'
        };

        DOM.searchInput.value = loc.name;
        DOM.clearSearchBtn.classList.remove('hidden');
        await loadWeatherForLocation(loc);
      } catch (err) {
        console.error('GPS Weather load error:', err);
        showAlert('Could not load weather for your coordinates.');
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      setLoading(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showAlert('Location access was denied. Please allow location permissions in your browser settings or search manually.');
          break;
        case error.POSITION_UNAVAILABLE:
          showAlert('Location information is unavailable. Please search for your city.');
          break;
        case error.TIMEOUT:
          showAlert('Location request timed out. Please try again or search manually.');
          break;
        default:
          showAlert('An unknown error occurred while requesting your location.');
          break;
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    }
  );
});

// ==========================================================================
// 11. Refresh Button
// ==========================================================================
DOM.refreshBtn.addEventListener('click', async () => {
  if (!APP_STATE.currentLocation) {
    showAlert('Please select or search for a city first.');
    return;
  }

  DOM.refreshBtn.classList.add('spinning');
  try {
    await loadWeatherForLocation(APP_STATE.currentLocation);
  } finally {
    setTimeout(() => {
      DOM.refreshBtn.classList.remove('spinning');
    }, 600);
  }
});

// ==========================================================================
// 12. Unit Toggle (°C / °F)
// ==========================================================================
function setTemperatureUnit(unit) {
  if (APP_STATE.currentUnit === unit) return;
  APP_STATE.currentUnit = unit;

  DOM.unitCelsiusBtn.classList.toggle('active', unit === 'C');
  DOM.unitCelsiusBtn.setAttribute('aria-pressed', unit === 'C');

  DOM.unitFahrenheitBtn.classList.toggle('active', unit === 'F');
  DOM.unitFahrenheitBtn.setAttribute('aria-pressed', unit === 'F');

  try {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  } catch (e) {
    console.warn('LocalStorage save unit error:', e);
  }

  // Instant update of rendered temperatures without refetching
  updateTemperatureDisplays();
}

DOM.unitCelsiusBtn.addEventListener('click', () => setTemperatureUnit('C'));
DOM.unitFahrenheitBtn.addEventListener('click', () => setTemperatureUnit('F'));

// ==========================================================================
// 13. Theme Toggle (Light / Dark Mode)
// ==========================================================================
function setTheme(theme) {
  APP_STATE.currentTheme = theme;
  DOM.html.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    DOM.themeIconSun.classList.add('hidden');
    DOM.themeIconMoon.classList.remove('hidden');
    DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    DOM.themeIconSun.classList.remove('hidden');
    DOM.themeIconMoon.classList.add('hidden');
    DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  }

  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('LocalStorage save theme error:', e);
  }
}

DOM.themeToggleBtn.addEventListener('click', () => {
  const newTheme = APP_STATE.currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

// ==========================================================================
// 14. Hourly Carousel Scroll Buttons
// ==========================================================================
DOM.hourlyScrollLeft.addEventListener('click', () => {
  DOM.hourlyContainer.scrollBy({ left: -260, behavior: 'smooth' });
});

DOM.hourlyScrollRight.addEventListener('click', () => {
  DOM.hourlyContainer.scrollBy({ left: 260, behavior: 'smooth' });
});

// Alert dismiss
DOM.alertCloseBtn.addEventListener('click', hideAlert);

// ==========================================================================
// 15. Application Initialization
// ==========================================================================
function initializeApp() {
  // 1. Restore Theme preference
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) {
    console.warn('LocalStorage read theme error:', e);
  }
  setTheme(savedTheme);

  // 2. Restore Temperature Unit preference
  let savedUnit = 'C';
  try {
    savedUnit = localStorage.getItem(STORAGE_KEYS.UNIT) || 'C';
  } catch (e) {
    console.warn('LocalStorage read unit error:', e);
  }
  setTemperatureUnit(savedUnit);

  // 3. Restore Last Location or show Welcome Screen
  let savedLocation = null;
  try {
    const rawLoc = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    if (rawLoc) savedLocation = JSON.parse(rawLoc);
  } catch (e) {
    console.warn('LocalStorage read location error:', e);
  }

  if (savedLocation && savedLocation.lat && savedLocation.lon) {
    DOM.searchInput.value = savedLocation.name;
    DOM.clearSearchBtn.classList.remove('hidden');
    loadWeatherForLocation(savedLocation);
  } else {
    // Default welcome state is visible
    DOM.welcomeState.classList.remove('hidden');
    DOM.weatherDashboard.classList.add('hidden');
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
