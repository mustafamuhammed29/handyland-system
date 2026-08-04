# HANDYLAND Digital Signage System Startup Script
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host "    HANDYLAND - Digital Signage System Startup" -ForegroundColor Gold
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Exit
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Starting HANDYLAND system..." -ForegroundColor Green
Write-Host "Opening http://localhost:5173/ in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/"

npm run dev
