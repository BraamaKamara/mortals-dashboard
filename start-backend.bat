@echo off
echo ========================================
echo MORTALS Dashboard - Start Backend Server
echo ========================================
echo.

cd /d "%~dp0\server"

if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run setup-backend.bat first
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run setup-backend.bat first
    pause
    exit /b 1
)

echo Starting email verification service...
echo Server will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm start
