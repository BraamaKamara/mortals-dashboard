@echo off
echo ========================================
echo MORTALS Dashboard - Start Backend with Stripe Webhooks
echo ========================================
echo.

cd /d "%~dp0\server"

if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run setup-backend.bat first
    pause
    exit /b 1
)

echo Starting backend server...
start "MORTALS Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo Starting Stripe webhook forwarding...
echo This will forward Stripe webhooks to http://localhost:3001/api/billing/webhook
echo.
echo IMPORTANT: Copy the webhook signing secret that appears below
echo            and update STRIPE_WEBHOOK_SECRET in server/.env
echo.

stripe listen --forward-to http://localhost:3001/api/billing/webhook

pause
