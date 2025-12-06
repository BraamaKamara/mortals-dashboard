@echo off
echo ========================================
echo MORTALS Dashboard - Start All Services
echo ========================================
echo.

echo This will start:
echo 1. Backend server (port 3001)
echo 2. Frontend dev server (port 3000)
echo 3. Stripe webhook forwarder
echo.

REM Check if Stripe CLI is installed
stripe --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Stripe CLI not found!
    echo Webhooks will not work. Install with: winget install stripe.stripe-cli
    echo.
    echo Press any key to continue without webhooks...
    pause
    goto :start_without_stripe
)

REM Check if logged in to Stripe
stripe config --list >nul 2>&1
if errorlevel 1 (
    echo WARNING: Not logged in to Stripe CLI
    echo Run 'stripe login' first or webhooks won't work
    echo.
    echo Press any key to continue without webhooks...
    pause
    goto :start_without_stripe
)

echo Starting Backend Server...
start "MORTALS Backend" cmd /k "cd /d %~dp0\server && npm start"
timeout /t 2 /nobreak >nul

echo Starting Frontend Server...
start "MORTALS Frontend" cmd /k "cd /d %~dp0 && npm start"
timeout /t 2 /nobreak >nul

echo Starting Stripe Webhook Forwarder...
echo REMEMBER: Copy the webhook signing secret and update server\.env
echo.
start "MORTALS Webhooks" cmd /k "stripe listen --forward-to http://localhost:3001/api/billing/webhook"

echo.
echo ========================================
echo All services started!
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo Webhooks: Check the Stripe terminal window
echo.
echo Close all terminal windows to stop services.
echo ========================================
pause
exit

:start_without_stripe
echo Starting Backend Server...
start "MORTALS Backend" cmd /k "cd /d %~dp0\server && npm start"
timeout /t 2 /nobreak >nul

echo Starting Frontend Server...
start "MORTALS Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ========================================
echo Services started (without webhooks)
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo To enable webhooks:
echo 1. Install: winget install stripe.stripe-cli
echo 2. Login: stripe login
echo 3. Run setup-stripe-webhooks.bat
echo ========================================
pause
