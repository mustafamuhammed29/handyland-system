@echo off
title HANDYLAND Digital Signage System
cls
echo ===================================================
echo     HANDYLAND - Digital Signage System Startup
echo ===================================================
echo.
echo Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js first.
    pause
    exit /b
)

echo Checking dependencies...
if not exist node_modules (
    echo Installing npm packages...
    call npm install
)

cls
echo ===================================================
echo     HANDYLAND - Digital Signage System
echo ===================================================
echo 1. Start Local Server only (for local testing)
echo 2. Update Live Website only (Upload to internet)
echo 3. Update Live Website AND Start Local Server
echo ===================================================
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto deploy

:start_local
echo.
echo Starting HANDYLAND system server for Smart TVs...
echo Local Address: http://localhost:5173/
echo.
start http://localhost:5173/
call npm run dev -- --host
goto end

:deploy
echo.
echo ===================================================
echo Updating Live Website (Deploying to GitHub Pages)
echo ===================================================
echo 1. Saving changes...
call git add .
call git commit -m "update: manual update via start script"
echo 2. Uploading code to GitHub...
call git push origin main
echo 3. Publishing to Live Website...
call npm run deploy
echo ===================================================
echo Live Website Updated Successfully!
echo ===================================================
if "%choice%"=="3" goto start_local
pause
goto end

:end
