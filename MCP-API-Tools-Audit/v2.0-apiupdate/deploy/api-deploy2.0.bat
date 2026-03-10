@echo off
REM =====================================================================
REM api-deploy2.0.bat — Deploy Manifest for v2.0
REM =====================================================================
REM This batch file IS the deploy record for v2.0.
REM It copies specific files from this deploy folder to ALPHA ONLY.
REM Pre-test and server get files from GitHub (git pull).
REM Each version folder has its own api-deploy bat
REM so you always know what was deployed from which version.
REM
REM Source:  This folder (deploy/)
REM Alpha:   C:\AICode\crop-client-services\
REM
REM Pipeline: deploy/ → alpha → GitHub → pre-test/server
REM
REM =====================================================================
REM  COMPLETE v2.0 RELEASE — All Files in This Folder
REM =====================================================================
REM
REM  DEPLOYED (copied by this bat to alpha):
REM  ---------------------------------------------------------------
REM  Source File                          → Deploy Target
REM  ---------------------------------------------------------------
REM  APIServer2.0.js                     → api-server/
REM  api-component2.0.js                 → api-server/
REM  web.config                           → api-server/web.config + web2.0.config (paired)
REM  server-deploy2.0.bat               → tools/ (so server gets it via git push)
REM  SERVER-INSTALL-GUIDE2.0.txt         → tools/SERVER-INSTALL-GUIDE.txt
REM  QUICK_START2.0.txt                  → tools/QUICK_START.txt
REM  MCP_Test_Harnessv2.0.html           → tools/
REM
REM  NOT DEPLOYED (deploy tools / reference):
REM  ---------------------------------------------------------------
REM  api-deploy2.0.bat                   — this file (runs on dev machine)
REM  web.config                          — production IIS config (paired with web2.0.config — always identical)
REM  DEPLOY-INSTRUCTIONS-v2.0.txt        — deploy instructions
REM  butler-skill-tools.html             — Butler UI tool
REM
REM =====================================================================

set SOURCE=%~dp0
set ALPHA=C:\AICode\crop-client-services\api-server
set ALPHA_TOOLS=C:\AICode\crop-client-services\tools
set ALPHA_PAGES=C:\AICode\crop-client-services\pages

echo.
echo ========================================
echo  v2.0 Deploy to Alpha
echo ========================================
echo.
echo Source:  %SOURCE%
echo Alpha:   %ALPHA%
echo.

REM --- APIServer2.0.js ---
copy /Y "%SOURCE%\APIServer2.0.js" "%ALPHA%\APIServer2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] APIServer2.0.js -^> alpha ) else ( echo [FAIL] APIServer2.0.js alpha )

REM --- api-component2.0.js ---
copy /Y "%SOURCE%\api-component2.0.js" "%ALPHA%\api-component2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] api-component2.0.js -^> alpha ) else ( echo [FAIL] api-component2.0.js alpha )

REM --- web.config → web.config + web2.0.config (paired — always identical) ---
copy /Y "%SOURCE%\web.config" "%ALPHA%\web.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web.config -^> alpha\web.config ) else ( echo [FAIL] web.config alpha )
copy /Y "%SOURCE%\web.config" "%ALPHA%\web2.0.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web.config -^> alpha\web2.0.config ) else ( echo [FAIL] web2.0.config alpha )

REM --- server-deploy2.0.bat → tools/ (so server gets it via git push) ---
copy /Y "%SOURCE%\server-deploy2.0.bat" "%ALPHA_TOOLS%\server-deploy2.0.bat"
if %ERRORLEVEL% EQU 0 ( echo [OK] server-deploy2.0.bat -^> alpha\tools ) else ( echo [FAIL] server-deploy2.0.bat alpha )

REM --- SERVER-INSTALL-GUIDE2.0.txt → tools/SERVER-INSTALL-GUIDE.txt + versioned copy ---
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> alpha\tools\SERVER-INSTALL-GUIDE.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE alpha )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> alpha\tools\SERVER-INSTALL-GUIDE2.0.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE2.0 alpha )

REM --- QUICK_START2.0.txt → tools/QUICK_START.txt + versioned copy ---
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%ALPHA_TOOLS%\QUICK_START.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> alpha\tools\QUICK_START.txt ) else ( echo [FAIL] QUICK_START alpha )
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%ALPHA_TOOLS%\QUICK_START2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> alpha\tools\QUICK_START2.0.txt ) else ( echo [FAIL] QUICK_START2.0 alpha )

REM --- MCP_Test_Harnessv2.0.html → tools/ ---
copy /Y "%SOURCE%\MCP_Test_Harnessv2.0.html" "%ALPHA_TOOLS%\MCP_Test_Harnessv2.0.html"
if %ERRORLEVEL% EQU 0 ( echo [OK] MCP_Test_Harnessv2.0.html -^> alpha\tools ) else ( echo [FAIL] MCP_Test_Harness alpha )

REM --- CropClient-MCP-API-Tools-Audit-Q-v2.0.html → pages/ ---
REM NOTE: This file does not exist yet. Uncomment when v2.0 audit app is created.
REM copy /Y "%SOURCE%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html" "%ALPHA_PAGES%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html"
REM if %ERRORLEVEL% EQU 0 ( echo [OK] Audit-v2.0.html -^> alpha\pages ) else ( echo [FAIL] Audit-v2.0 alpha )

echo.
echo ========================================
echo  Deploy complete. Alpha updated.
echo  Next: git push alpha to GitHub,
echo        then git pull into pre-test.
echo ========================================
echo.
pause
