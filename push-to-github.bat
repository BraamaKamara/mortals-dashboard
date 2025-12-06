@echo off
REM MORTALS Dashboard - Automated GitHub Push Script
REM This script will push both backend and frontend to GitHub

setlocal enabledelayedexpansion

echo.
echo ===============================================
echo MORTALS Dashboard - GitHub Push Helper
echo ===============================================
echo.

REM Define paths
set BACKEND_PATH=c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server
set FRONTEND_PATH=c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard
set GITHUB_USER=BraamaKamara

echo.
echo Before proceeding, make sure you:
echo 1. Created repository: https://github.com/new - mortals-backend (PUBLIC)
echo 2. Created repository: https://github.com/new - mortals-dashboard (PUBLIC)
echo 3. Have your GitHub Personal Access Token ready
echo    (Get it at: https://github.com/settings/tokens/new)
echo.
echo Press any key to continue...
pause >nul

echo.
echo ===============================================
echo PUSHING BACKEND...
echo ===============================================
echo.

cd /d "%BACKEND_PATH%"
echo Current directory: %cd%
echo.
echo Running: git push -u origin main
echo.
echo When prompted for password, paste your Personal Access Token (not your password)
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR: Backend push failed!
    echo Make sure:
    echo  - You created the mortals-backend repo
    echo  - Repo is PUBLIC
    echo  - You used correct Personal Access Token
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Backend pushed successfully!
echo.
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo PUSHING FRONTEND...
echo ===============================================
echo.

cd /d "%FRONTEND_PATH%"
echo Current directory: %cd%
echo.

REM Check if frontend has git repo
if not exist .git (
    echo Initializing frontend git repo...
    git init
    git add .
    git commit -m "Initial commit - MORTALS Dashboard frontend"
)

echo.
echo Running: git push -u origin main
echo.
git remote add origin https://github.com/%GITHUB_USER%/mortals-dashboard.git 2>nul
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo WARNING: Frontend push had issues
    echo Try running these commands manually:
    echo cd "%FRONTEND_PATH%"
    echo git remote set-url origin https://github.com/%GITHUB_USER%/mortals-dashboard.git
    echo git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo ✓ SUCCESS! Both repos pushed to GitHub!
echo ===============================================
echo.
echo Backend: https://github.com/%GITHUB_USER%/mortals-backend
echo Frontend: https://github.com/%GITHUB_USER%/mortals-dashboard
echo.
echo Next Step: Deploy to Vercel
echo  1. Go to https://vercel.com/new
echo  2. Import mortals-backend repo
echo  3. Add environment variables
echo  4. Deploy
echo.
pause
