@echo off
echo ========================================
echo MORTALS Dashboard - Start Backend (Multi-User)
echo ========================================
echo.

cd /d "%~dp0\server"

if not exist ".env" (
    echo ERROR: .env file not found!
    pause
    exit /b 1
)

echo Starting multi-user backend server...
echo Server will run on: http://localhost:3001
echo Database: PostgreSQL (mortals_dashboard)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node index.js

pause
