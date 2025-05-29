@echo off
echo ========================================
echo    AutoReach Render Deployment Helper
echo ========================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Please run this script from the AutoReach project root directory
    pause
    exit /b 1
)

if not exist backend (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

if not exist frontend (
    echo ❌ Frontend directory not found
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

echo 📋 Checking deployment requirements...

REM Check backend requirements
if not exist backend\requirements.txt (
    echo ❌ backend\requirements.txt not found
    pause
    exit /b 1
)

REM Check frontend package.json
if not exist frontend\package.json (
    echo ❌ frontend\package.json not found
    pause
    exit /b 1
)

REM Check for .env.example
if not exist .env.example (
    echo ❌ .env.example not found
    pause
    exit /b 1
)

echo ✅ All required files found
echo.

echo 🔧 Updating configurations for production...

REM Add Node.js engine to frontend package.json if not present
cd frontend
findstr /C:"engines" package.json >nul
if %errorlevel% neq 0 (
    echo Adding Node.js engine specification...
    npm pkg set engines.node=">=18.0.0"
)
cd ..

echo ✅ Frontend configuration updated
echo.

echo 🎉 Deployment preparation complete!
echo.
echo Next steps:
echo 1. Review the files in infrastructure\render\
echo 2. Follow the deployment guide in infrastructure\render\README.md
echo 3. Use the checklist in infrastructure\render\DEPLOYMENT_CHECKLIST.md
echo.
echo Files available:
echo - infrastructure\render\render.yaml (Blueprint for one-click deploy)
echo - infrastructure\render\README.md (Comprehensive deployment guide)
echo - infrastructure\render\backend-deploy.md (Backend-specific instructions)
echo - infrastructure\render\DEPLOYMENT_CHECKLIST.md (Step-by-step checklist)
echo.
echo 🚀 Ready to deploy to Render!
echo.
echo Would you like to open the deployment guide? (y/n)
set /p choice="Enter your choice: "

if /i "%choice%"=="y" (
    start infrastructure\render\README.md
)

pause
