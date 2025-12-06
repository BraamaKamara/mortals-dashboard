@echo off
echo ========================================
echo MORTALS Dashboard - Backend Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/4] Installing backend dependencies...
cd server
if not exist "package.json" (
    echo ERROR: package.json not found in server folder!
    pause
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/4] Setting up environment file...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✓ Created .env file from template
        echo.
        echo ========================================
        echo IMPORTANT: Configure your email settings
        echo ========================================
        echo.
        echo Edit the .env file in the server folder with:
        echo   1. Your email address
        echo   2. Your email app password
        echo.
        echo For Gmail:
        echo   1. Enable 2FA: https://myaccount.google.com/security
        echo   2. Generate App Password: https://myaccount.google.com/apppasswords
        echo.
        notepad ".env"
    ) else (
        echo ERROR: .env.example not found!
        pause
        exit /b 1
    )
) else (
    echo ✓ .env file already exists
)
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Configure .env with your email credentials
echo 2. Run: npm start (to start backend server)
echo 3. Run: npm start (in main folder for frontend)
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000
echo.
echo For detailed instructions, see: SETUP_EMAIL.md
echo ========================================
echo.
pause
