# 🌤️ WeatherNow – Location-Based Weather Forecast Website

A complete, modern, responsive, location-based weather dashboard built with **HTML5, CSS3, and Vanilla JavaScript** powered by the free public **Open-Meteo API** (no API key required).

![WeatherNow Preview](https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Live Demo

- **Live URL**: [https://kedarahamsikamaturi-web.github.io/Weather-Now/](https://kedarahamsikamaturi-web.github.io/Weather-Now/)
- **Repository**: [https://github.com/kedarahamsikamaturi-web/Weather-Now](https://github.com/kedarahamsikamaturi-web/Weather-Now)

---

## ✨ Features

### 1. 🎨 Modern User Interface
- **Clean Aesthetic**: Blue, white, and light-gradient themes with glassmorphic cards (`backdrop-filter: blur()`).
- **Dynamic Weather Backgrounds**: The background subtly transitions according to the current weather condition (Clear Day, Clear Night, Clouds, Rain, Snow, Thunderstorm).
- **Fully Responsive**: Optimized for desktop monitors, laptops, tablets, and smartphones with mobile-first breakpoints.
- **Micro-Interactions**: Smooth hover effects, loading spinners, and temperature conversion transitions.

### 2. 🔍 Smart Location Search
- **Worldwide Search**: Search for any city, state, or country worldwide.
- **Instant Autocomplete Suggestions**: Debounced live search dropdown showing city name, administrative region/state, and country code.
- **Multi-Result Selection**: Pick from matching locations when multiple cities share the same name (e.g., London, UK vs. London, Canada).
- **Keyboard Friendly**: Press **Enter** to search or select from the dropdown.
- **Popular City Chips**: One-click quick search for global cities (London, New York, Tokyo, Paris, Sydney, Dubai).

### 3. 🌡️ Real-Time Current Weather
- **Temperature Display**: Live temperature in **Celsius (°C)** with instant toggle to **Fahrenheit (°F)**.
- **Condition Description & Vector Icons**: Accurate WMO weather interpretation codes mapped to SVG weather icons.
- **Key Weather Details**:
  - **Feels Like**: Apparent temperature accounting for humidity and wind chill.
  - **Humidity**: Relative humidity percentage with a visual status bar ("Dry", "Comfortable", "Humid").
  - **Wind Speed & Direction**: Real-time wind speed with a dynamic rotating compass needle (N, NE, E, etc.).
  - **Precipitation Probability**: Max probability of rain/snow for today.
  - **UV Index**: Daily maximum UV index with health safety rating.
  - **Sunrise & Sunset**: Local sunrise and sunset timings.
- **Timezone-Aware Local Time**: Shows the actual local time of the selected city using `Intl.DateTimeFormat`.
- **Today's High / Low**: Daily maximum and minimum temperatures.

### 4. ⏱️ 24-Hour Hourly Forecast
- Next 24 hours of forecast data starting from the current local hour.
- Interactive horizontally scrollable cards with desktop navigation arrows and mobile touch swiping.
- Displays hour, weather condition icon, and temperature.

### 5. 📅 7-Day Daily Forecast
- Comprehensive 7-day outlook.
- Displays day name ("Today", "Tomorrow", "Wed", etc.), formatted date, weather icon, condition description, and min/max temperatures.
- **Visual Temperature Range Bar**: Gradient bar depicting each day's temperature range relative to the week's highs and lows.

### 6. 📍 "Use My Location" (GPS)
- One-click geolocation using the browser's native `navigator.geolocation` API.
- Explicit user consent check (never tracks or accesses location without permission).
- Reverse geocoding via OpenStreetMap Nominatim with graceful coordinate fallback.
- Full error handling for permission denial, timeout, or location unavailability.

### 7. ⚙️ Additional Conveniences
- **°C / °F Toggle**: Seamless conversion between Celsius and Fahrenheit without redundant API requests.
- **Light & Dark Mode**: Built-in dark mode toggle, respecting user system preferences and manually toggleable.
- **Refresh Button**: Quickly refresh weather data with a spinning animation.
- **Offline / Local Storage**: Automatically remembers your last searched city, temperature unit, and theme preference.
- **Default Welcome Screen**: Helpful onboarding screen with feature cards when no city is selected.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic web structure, accessible ARIA attributes, search forms |
| **CSS3** | Flexbox, CSS Grid, CSS Custom Properties (variables), Glassmorphism, animations |
| **Vanilla JavaScript (ES6+)** | Asynchronous `fetch()` API calls, DOM manipulation, Geolocation, LocalStorage |
| **Open-Meteo Geocoding API** | Free location search and coordinates resolver |
| **Open-Meteo Forecast API** | Free, open-source weather forecast API (no API key required) |
| **Nominatim API** | Reverse geocoding for coordinates to city names |
| **Git & GitHub** | Version control and code repository hosting |
| **GitHub Pages** | Free static site deployment |

---

## 📂 Project Structure

```text
WeatherNow/
├── index.html        # Main HTML structure, semantic layout, and accessible markup
├── style.css         # Responsive styling, CSS variables, glassmorphic effects, animations
├── script.js         # Application logic, Open-Meteo API integration, event handlers, storage
└── README.md         # Comprehensive project documentation and guides
```

---

## 🌐 API Reference

This application uses the free, open-source **Open-Meteo API**:

1. **Geocoding API**:
   ```http
   GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=8&language=en&format=json
   ```
2. **Forecast API**:
   ```http
   GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=7
   ```
3. Official Documentation: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)

---

## 💻 How to Run Locally

You do not need to install complex build tools or run npm scripts. Follow any of the simple options below:

### Option 1: Direct Browser Opening (Quickest)
1. Open your file explorer and navigate to the `WeatherNow` folder.
2. Double-click `index.html` to open it in your default web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Using Python's Built-in Server (Recommended)
1. Open PowerShell, Terminal, or Command Prompt.
2. Navigate to the project directory:
   ```bash
   cd "WeatherNow"
   ```
3. Start a local server:
   ```bash
   python -m http.server 8080
   ```
4. Open your browser and visit: `http://localhost:8080`

### Option 3: Using VS Code Live Server
1. Open the `WeatherNow` folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

## 📦 Step-by-Step GitHub Setup Guide

Follow these steps to initialize a Git repository and push your project to GitHub:

### Step 1: Open Terminal in the Project Directory
```bash
cd "WeatherNow"
```

### Step 2: Initialize Git
```bash
git init
```

### Step 3: Stage and Commit the Files
```bash
git add .
git commit -m "Initial commit: Complete WeatherNow application"
```

### Step 4: Create a New Repository on GitHub
1. Go to [GitHub](https://github.com/) and sign in.
2. Click the **+** icon in the top-right corner and select **New repository**.
3. Name your repository (e.g., `weathernow` or `weather-forecast-app`).
4. Keep the repository **Public**.
5. Leave **"Add a README file"**, **.gitignore**, and **license** unchecked (since you already have them locally).
6. Click **Create repository**.

### Step 5: Link Local Repo to GitHub and Push
Copy the commands shown on GitHub or run the following (replace `<your-username>` and `<repo-name>` with your actual details):
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

---

## 🚀 How to Publish on GitHub Pages

Host your website online for free with GitHub Pages:

1. Open your repository on **GitHub.com**.
2. Go to the **Settings** tab (located on the top navigation bar).
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Choose `main` from the dropdown, and leave the folder as `/ (root)`.
5. Click **Save**.
6. Wait 1 to 2 minutes. Refresh the page until a green banner appears:
   > *"Your site is live at https://&lt;your-username&gt;.github.io/&lt;repo-name&gt;/"*
7. Click the link to view your live weather website from anywhere in the world!

---

## 🌦️ WMO Weather Code Mapping Reference

| WMO Code | Meaning | Condition Classification |
| :--- | :--- | :--- |
| `0` | Clear sky | Clear |
| `1, 2, 3` | Mainly clear, partly cloudy, overcast | Clouds |
| `45, 48` | Fog and depositing rime fog | Fog |
| `51, 53, 55` | Drizzle (Light, Moderate, Dense) | Rain |
| `56, 57` | Freezing Drizzle | Winter Precipitation |
| `61, 63, 65` | Rain (Slight, Moderate, Heavy) | Rain |
| `66, 67` | Freezing Rain | Winter Precipitation |
| `71, 73, 75` | Snow fall (Slight, Moderate, Heavy) | Snow |
| `77` | Snow grains | Snow |
| `80, 81, 82` | Rain showers (Slight, Moderate, Violent) | Rain Showers |
| `85, 86` | Snow showers | Snow Showers |
| `95, 96, 99` | Thunderstorm (with/without hail) | Thunderstorm |

---

## 📄 License & Attribution

- **Weather Data**: Powered by the [Open-Meteo API](https://open-meteo.com/). Free for educational and open-source projects.
- **Geocoding**: Powered by [Open-Meteo Geocoding](https://geocoding-api.open-meteo.com/) and [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/).
- **Icons**: Custom embedded SVG vectors.
- **License**: MIT License – Feel free to use and modify for your personal portfolio and learning projects.
