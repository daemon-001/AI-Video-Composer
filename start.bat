@echo off
echo Starting FFmpeg-AI-Composer...
echo.

REM Start Backend
echo Starting Backend...
start "FFmpeg-AI-Composer Backend" cmd /k "cd /d %~dp0 && call .venv\Scripts\activate.bat && python backend\app.py"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend...
start "FFmpeg-AI-Composer Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Backend: Check the "FFmpeg-AI-Composer Backend" window
echo Frontend: Check the "FFmpeg-AI-Composer Frontend" window
