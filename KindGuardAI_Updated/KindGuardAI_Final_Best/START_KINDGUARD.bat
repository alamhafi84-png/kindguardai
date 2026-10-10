@echo off
setlocal
cd /d "%~dp0"
title KindGuard AI

set "PY=python"
where python >nul 2>nul || set "PY=py"
where %PY% >nul 2>nul
if errorlevel 1 (
  echo Python is not installed.
  echo Install Python 3.11 or newer from python.org ^(tick "Add python.exe to PATH"^) and run this file again.
  pause
  exit /b 1
)

if not exist "backend\.env" (
  copy /Y "backend\.env.example" "backend\.env" >nul
  echo.
  echo Created backend\.env
  echo Paste your Gemini API key after GEMINI_API_KEY=  then save and close Notepad.
  start /wait notepad "backend\.env"
)

findstr /C:"PASTE_YOUR_GEMINI_API_KEY_HERE" "backend\.env" >nul 2>nul
if not errorlevel 1 (
  echo.
  echo The API key in backend\.env has not been set yet.
  echo KindGuard will still open, but AI features need the key. Add it, save, and run this file again.
  echo.
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo Creating Python environment...
  %PY% -m venv "backend\.venv"
)
echo Installing requirements ^(first run takes a minute^)...
"backend\.venv\Scripts\python.exe" -m pip install -q -r "backend\requirements.txt"
if errorlevel 1 (
  echo Could not install requirements. Check your internet connection and try again.
  pause
  exit /b 1
)

start "KindGuard Backend" cmd /k ""backend\.venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000/"
echo.
echo KindGuard is running at http://127.0.0.1:8000/
echo Keep the backend window open while using the app.
