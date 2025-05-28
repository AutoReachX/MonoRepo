@echo off
echo ========================================
echo    AutoReach Quick Start
echo ========================================
echo.

REM Check if setup has been run
if not exist backend\venv (
    echo ❌ Backend not set up yet!
    echo Please run setup-dev.bat first
    pause
    exit /b 1
)

if not exist frontend\node_modules (
    echo ❌ Frontend not set up yet!
    echo Please run setup-dev.bat first
    pause
    exit /b 1
)

if not exist .env (
    echo ❌ Environment file not found!
    echo Please run setup-dev.bat first
    pause
    exit /b 1
)

echo ✅ All dependencies are installed
echo.

echo Choose what to start:
echo 1. Backend only (API server)
echo 2. Frontend only (React app)
echo 3. Both (recommended)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto exit
goto invalid

:backend
echo Starting backend server...
start "AutoReach Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
echo ✅ Backend started at http://localhost:8000
echo ✅ API docs available at http://localhost:8000/docs
goto end

:frontend
echo Starting frontend server...
start "AutoReach Frontend" cmd /k "cd frontend && npm start"
echo ✅ Frontend will start at http://localhost:3000
goto end

:both
echo Starting both servers...
start "AutoReach Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
timeout /t 3 /nobreak >nul
start "AutoReach Frontend" cmd /k "cd frontend && npm start"
echo ✅ Backend started at http://localhost:8000
echo ✅ Frontend will start at http://localhost:3000
echo ✅ API docs available at http://localhost:8000/docs
goto end

:invalid
echo Invalid choice. Please try again.
pause
goto quick-start

:exit
echo Goodbye!
goto end

:end
echo.
echo Development servers are starting...
echo Check the opened terminal windows for status.
pause
