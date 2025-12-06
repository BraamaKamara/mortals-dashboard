@echo off
setlocal enabledelayedexpansion

title MORTALS Dashboard - Deployment Setup

echo.
echo ================================================
echo MORTALS Dashboard - Production Deployment Setup
echo ================================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo Install from: https://nodejs.org
    pause
    exit /b 1
)

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not found
    echo Install from: https://git-scm.com
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo ✓ Git is installed
echo.

REM Generate JWT Secret
echo Step 1: Generate JWT Secret
echo ────────────────────────────
for /f "delims=" %%a in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%a
echo.
echo Generated JWT Secret:
echo %JWT_SECRET%
echo.
echo Save this for environment variables!
echo.

REM Instructions
echo Step 2: Before Deploying
echo ────────────────────────
echo.
echo REQUIRED:
echo  1. GitHub repos created (mortals-backend and mortals-dashboard)
echo  2. Neon.tech account with PostgreSQL database
echo  3. Vercel account (free at https://vercel.com)
echo  4. Stripe account (free at https://stripe.com)
echo  5. Gmail app password configured
echo.

echo Step 3: Environment Variables You'll Need
echo ──────────────────────────────────────────
echo.
echo Backend Environment Variables:
echo  - DATABASE_URL (from Neon.tech)
echo  - JWT_SECRET: %JWT_SECRET%
echo  - EMAIL_USER (your Gmail)
echo  - EMAIL_PASSWORD (Gmail app password)
echo  - STRIPE_SECRET_KEY (sk_live_...)
echo  - STRIPE_WEBHOOK_SECRET (whsec_...)
echo  - STRIPE_PRICE_PRO (price_...)
echo.

echo Step 4: Deployment Steps
echo ────────────────────────
echo.
echo 1. BACKEND TO GITHUB:
echo    cd mortals-dashboard\server
echo    git init
echo    git add .
echo    git commit -m "Initial backend commit"
echo    git remote add origin https://github.com/YOUR_USER/mortals-backend.git
echo    git push -u origin main
echo.
echo 2. FRONTEND TO GITHUB:
echo    cd mortals-dashboard
echo    git init
echo    git add .
echo    git commit -m "Initial frontend commit"
echo    git remote add origin https://github.com/YOUR_USER/mortals-dashboard.git
echo    git push -u origin main
echo.
echo 3. DEPLOY TO VERCEL:
echo    Go to https://vercel.com/new
echo    Import mortals-backend repo
echo    Add environment variables
echo    Deploy
echo.
echo    Then import mortals-dashboard repo
echo    Add REACT_APP_API_URL from backend
echo    Deploy
echo.

echo ================================================
echo IMPORTANT: Read PRODUCTION_DEPLOYMENT.md
echo ================================================
echo.
pause
