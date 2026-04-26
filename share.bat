@echo off
setlocal enabledelayedexpansion

echo Building frontend for latest changes...
cd /d %~dp0frontend
set "VITE_API_URL="
call npm run build
if errorlevel 1 (
    echo Frontend build failed. Exiting.
    exit /b 1
)

echo.
echo ============================================================== 
echo Starting FFmpeg AI Composer Backend...
echo ============================================================== 
echo.

cd /d %~dp0backend
start "FFmpeg AI Composer Backend" cmd /k "call %~dp0.venv\Scripts\activate.bat && python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 6 seconds for the backend to start...
timeout /t 6 /nobreak >nul

echo.
echo ============================================================== 
echo Exposing AI Composer to the internet via LocalTunnel...
echo Your public link will be shown below (e.g. https://xxxx.loca.lt)
echo Share that link with anyone - it gives full access to your composer!
echo ============================================================== 
echo.

cmd /k "npx localtunnel --port 8000"
