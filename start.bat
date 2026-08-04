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

echo.
echo Starting HANDYLAND system server for Smart TVs...
echo Local Address: http://localhost:5173/
echo.

start http://localhost:5173/
call npm run dev -- --host

pause
