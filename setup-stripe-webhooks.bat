@echo off
echo ========================================
echo MORTALS Dashboard - Stripe CLI Setup
echo ========================================
echo.

echo Step 1: Verifying Stripe CLI installation...
stripe --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Stripe CLI not found!
    echo Please install it first: winget install stripe.stripe-cli
    echo Then restart this script.
    pause
    exit /b 1
)
echo Stripe CLI found!
echo.

echo Step 2: Login to Stripe...
echo This will open your browser to authorize the CLI.
echo Make sure to use the same Stripe account as your test mode keys.
echo.
pause
stripe login
if errorlevel 1 (
    echo Login failed. Please try again.
    pause
    exit /b 1
)
echo.

echo Step 3: Getting webhook signing secret...
echo.
echo IMPORTANT: Copy the webhook signing secret (whsec_...) that appears below
echo           and add it to server\.env as STRIPE_WEBHOOK_SECRET
echo.
echo The format in your .env should be:
echo STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
echo.
pause

echo Starting webhook listener...
echo This will forward webhooks to http://localhost:3001/api/billing/webhook
echo.
echo Leave this window open while testing!
echo.

stripe listen --forward-to http://localhost:3001/api/billing/webhook

pause
