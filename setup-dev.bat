@echo off
echo ========================================
echo    AutoReach Local Development Setup
echo ========================================
echo.

echo Step 1: Checking prerequisites...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.9+ from https://python.org
    echo    Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python found: 
python --version
echo ✅ Node.js found: 
node --version
echo.

echo Step 2: Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from template
) else (
    echo ✅ .env file already exists
)
echo.

echo Step 3: Setting up Python backend...
cd backend

REM Create virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✅ Python dependencies installed successfully
cd ..
echo.

echo Step 4: Setting up React frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo ✅ Node.js dependencies installed successfully
cd ..
echo.

echo ========================================
echo    Setup Complete! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your API keys:
echo    - Get Twitter OAuth credentials from developer.twitter.com
echo    - Get OpenAI API key from platform.openai.com
echo    - Set up Render PostgreSQL database
echo.
echo 2. Start the development servers:
echo    - Backend: run start-backend.bat
echo    - Frontend: run start-frontend.bat
echo.
echo 3. Visit http://localhost:3000 to see your app!
echo.
pause
