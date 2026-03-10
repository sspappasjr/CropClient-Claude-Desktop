@echo off
echo ============================================
echo   CropClient API Server v2.0 - Server Deploy
echo   Run this ON the server (184.168.20.205)
echo ============================================
echo.

cd /d C:\Crop-Client-Services\api-server

echo Step 1: Git pull from GitHub...
git pull
if %errorlevel% neq 0 (
    echo ERROR: git pull failed!
    pause
    exit /b 1
)
echo Git pull complete.
echo.

echo Step 2: Restarting IIS...
iisreset
if %errorlevel% neq 0 (
    echo ERROR: iisreset failed!
    pause
    exit /b 1
)
echo IIS restarted.
echo.

echo ============================================
echo   DEPLOY COMPLETE - v2.0 is LIVE
echo   Test at: https://api.cropclient.com
echo ============================================
pause
