@echo off
echo ========================================
echo    AutoReach Environment Checker
echo ========================================
echo.

echo Checking .env configuration...
echo.

if not exist .env (
    echo ❌ .env file not found!
    echo Please run setup-dev.bat first
    pause
    exit /b 1
)

REM Check for required environment variables
findstr /C:"DATABASE_URL=postgresql://" .env >nul
if %errorlevel% neq 0 (
    echo ❌ DATABASE_URL not configured
    echo Please set up your Render PostgreSQL database
) else (
    echo ✅ DATABASE_URL configured
)

findstr /C:"OPENAI_API_KEY=sk-" .env >nul
if %errorlevel% neq 0 (
    echo ❌ OPENAI_API_KEY not configured
    echo Please get your API key from platform.openai.com
) else (
    echo ✅ OPENAI_API_KEY configured
)

findstr /C:"TWITTER_CLIENT_ID=" .env >nul
if %errorlevel% neq 0 (
    echo ❌ TWITTER_CLIENT_ID not configured
    echo Please get your credentials from developer.twitter.com
) else (
    echo ✅ TWITTER_CLIENT_ID configured
)

findstr /C:"SECRET_KEY=" .env >nul
if %errorlevel% neq 0 (
    echo ❌ SECRET_KEY not configured
) else (
    echo ✅ SECRET_KEY configured
)

echo.
echo Configuration status checked!
echo Edit .env file to update any missing values.
echo.
pause
