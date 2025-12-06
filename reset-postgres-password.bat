@echo off
echo ========================================
echo PostgreSQL Password Reset Guide
echo ========================================
echo.

echo Step 1: Stop PostgreSQL Service
echo --------------------------------
net stop postgresql-x64-17
if errorlevel 1 (
    echo ERROR: Failed to stop service. You may need to run as Administrator.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)
echo Service stopped successfully.
echo.

echo Step 2: Edit pg_hba.conf to allow passwordless login
echo -----------------------------------------------------
echo Opening PostgreSQL data directory...
echo.
echo You need to edit: C:\Program Files\PostgreSQL\17\data\pg_hba.conf
echo.
echo Find lines that look like:
echo   host    all             all             127.0.0.1/32            scram-sha-256
echo   host    all             all             ::1/128                 scram-sha-256
echo.
echo Change "scram-sha-256" to "trust" on these lines
echo Save the file
echo.
pause

echo Step 3: Start PostgreSQL Service
echo ---------------------------------
net start postgresql-x64-17
if errorlevel 1 (
    echo ERROR: Failed to start service.
    pause
    exit /b 1
)
echo Service started successfully.
echo.

echo Step 4: Connect and Change Password
echo ------------------------------------
echo Now you can connect without a password and set a new one.
echo.
set /p NEWPASS="Enter your new PostgreSQL password: "
echo.

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD '%NEWPASS%';"
if errorlevel 1 (
    echo ERROR: Failed to change password.
    pause
    exit /b 1
)
echo Password changed successfully!
echo.

echo Step 5: Revert pg_hba.conf changes
echo -----------------------------------
echo Now change "trust" back to "scram-sha-256" in pg_hba.conf
echo Then restart PostgreSQL service
echo.
pause

net stop postgresql-x64-17
net start postgresql-x64-17

echo.
echo ========================================
echo Password reset complete!
echo ========================================
echo Your new PostgreSQL password is: %NEWPASS%
echo Please save this password securely.
echo.
pause
