@echo off
title WeatherNow – Location-Based Weather Forecast
echo ======================================================================
echo                Welcome to WeatherNow!
echo ======================================================================
echo.
echo [1/2] Opening WeatherNow in your default browser...
start "" "%~dp0index.html"
echo.
echo [2/2] Launching completed successfully.
echo.
echo Enjoy real-time, accurate weather forecasts powered by Open-Meteo!
echo Press any key to close this launcher...
pause >nul
