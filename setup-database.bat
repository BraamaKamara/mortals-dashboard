@echo off
echo ========================================
echo MORTALS Dashboard - Database Setup
echo ========================================
echo.

echo This script will help you set up PostgreSQL for multi-user support.
echo.
echo Prerequisites:
echo 1. PostgreSQL must be installed (we're installing it now)
echo 2. PostgreSQL service should be running
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if errorlevel 1 (
    echo PostgreSQL not found in PATH.
    echo.
    echo Please complete the PostgreSQL installation, then:
    echo 1. Note the password you set during installation
    echo 2. Re-run this script
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

echo ========================================
echo Step 1: Create Database
echo ========================================
echo.
echo You'll need the postgres user password you set during installation.
echo.
set /p PGPASSWORD="Enter your PostgreSQL password: "
echo.

echo Creating database 'mortals_dashboard'...
psql -U postgres -c "CREATE DATABASE mortals_dashboard;" 2>nul

if errorlevel 1 (
    echo Database might already exist or connection failed.
    echo Checking if database exists...
    psql -U postgres -c "\l" | findstr mortals_dashboard >nul
    if errorlevel 1 (
        echo.
        echo ERROR: Could not create or find database.
        echo Please check your PostgreSQL installation and password.
        pause
        exit /b 1
    ) else (
        echo Database already exists - OK!
    )
) else (
    echo Database created successfully!
)

echo.
echo ========================================
echo Step 2: Update .env file
echo ========================================
echo.
echo Please manually update server\.env with your database password:
echo.
echo DATABASE_URL=postgresql://postgres:%PGPASSWORD%@localhost:5432/mortals_dashboard
echo.
echo Or generate a secure JWT secret:
echo JWT_SECRET=your-secure-random-string-here
echo.
pause

echo.
echo ========================================
echo Step 3: Initialize Database Tables
echo ========================================
echo.
echo Running database initialization script...
cd /d "%~dp0\server"
node init-db.js

if errorlevel 1 (
    echo.
    echo ERROR: Database initialization failed.
    echo Please check your .env configuration.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your database is ready for multi-user support.
echo.
echo Next steps:
echo 1. Make sure DATABASE_URL is set in server\.env
echo 2. Set a secure JWT_SECRET in server\.env
echo 3. Restart your backend server
echo.
pause
