@echo off
REM =====================================================================
REM api-deploy1.6.bat — Deploy Manifest for v1.6
REM =====================================================================
REM This batch file IS the deploy record for v1.6.
REM It copies specific files from v1.6-restructure to alpha AND pre-test.
REM Each version folder has its own api-deploy bat
REM so you always know what was deployed from which version.
REM
REM Source:  C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v1.6-restructure\
REM Alpha:   C:\AICode\crop-client-services\
REM PreTest: C:\Crop-Client-Services\
REM
REM =====================================================================
REM  COMPLETE v1.6 RELEASE — All Files in This Folder
REM =====================================================================
REM
REM  DEPLOYED (copied by this bat):
REM  ---------------------------------------------------------------
REM  Source File                          → Deploy Target
REM  ---------------------------------------------------------------
REM  APIServer1.6.js                     → api-server/
REM  api-component1.6.js                 → api-server/
REM  web1.6.config                       → api-server/web.config
REM  package.json                        → api-server/
REM  SERVER-INSTALL-GUIDE1.6.txt            → tools/SERVER-INSTALL-GUIDE.txt
REM  QUICK_START1.6.txt                  → tools/QUICK_START.txt
REM  Test-apiserver1.4..html             → tools/
REM  CropClient-MCP-API-Tools-Audit-Q-v1.6.html → pages/
REM
REM  NOT DEPLOYED (reference/history only):
REM  ---------------------------------------------------------------
REM  APIServer1.3.js                     — previous version (reference)
REM  web1.3.config                       — previous version (reference)
REM  QUICK_START.txt                     — previous version (reference)
REM  Test-apiserver1.3.html              — previous version (reference)
REM  MCP_Test_Harness.html               — dev test harness
REM  CropManage-Dashboard-v1.5-Design.md — design doc
REM  MAC-NOTE-v1.6-session-status.md     — session notes
REM  .MyDailyLog.Today.txt               — team daily log
REM  api-deploy1.6.bat                   — this file
REM
REM =====================================================================

set SOURCE=C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v1.6-restructure
set ALPHA=C:\AICode\crop-client-services\api-server
set ALPHA_TOOLS=C:\AICode\crop-client-services\tools
set ALPHA_PAGES=C:\AICode\crop-client-services\pages
set PRETEST=C:\Crop-Client-Services\api-server
set PRETEST_TOOLS=C:\Crop-Client-Services\tools
set PRETEST_PAGES=C:\Crop-Client-Services\Pages

echo.
echo ========================================
echo  v1.6 Deploy to Alpha + Pre-Test
echo ========================================
echo.
echo Source:  %SOURCE%
echo Alpha:   %ALPHA%
echo PreTest: %PRETEST%
echo.

REM --- APIServer1.6.js ---
copy /Y "%SOURCE%\APIServer1.6.js" "%ALPHA%\APIServer1.6.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] APIServer1.6.js -^> alpha ) else ( echo [FAIL] APIServer1.6.js alpha )
copy /Y "%SOURCE%\APIServer1.6.js" "%PRETEST%\APIServer1.6.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] APIServer1.6.js -^> pre-test ) else ( echo [FAIL] APIServer1.6.js pre-test )

REM --- api-component1.6.js ---
copy /Y "%SOURCE%\api-component1.6.js" "%ALPHA%\api-component1.6.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] api-component1.6.js -^> alpha ) else ( echo [FAIL] api-component1.6.js alpha )
copy /Y "%SOURCE%\api-component1.6.js" "%PRETEST%\api-component1.6.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] api-component1.6.js -^> pre-test ) else ( echo [FAIL] api-component1.6.js pre-test )

REM --- web1.6.config → web.config + web1.6.config (versioned copy) ---
copy /Y "%SOURCE%\web1.6.config" "%ALPHA%\web.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web1.6.config -^> alpha\web.config ) else ( echo [FAIL] web.config alpha )
copy /Y "%SOURCE%\web1.6.config" "%ALPHA%\web1.6.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web1.6.config -^> alpha\web1.6.config ) else ( echo [FAIL] web1.6.config alpha )
copy /Y "%SOURCE%\web1.6.config" "%PRETEST%\web.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web1.6.config -^> pre-test\web.config ) else ( echo [FAIL] web.config pre-test )
copy /Y "%SOURCE%\web1.6.config" "%PRETEST%\web1.6.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web1.6.config -^> pre-test\web1.6.config ) else ( echo [FAIL] web1.6.config pre-test )

REM --- package.json ---
copy /Y "%SOURCE%\package.json" "%ALPHA%\package.json"
if %ERRORLEVEL% EQU 0 ( echo [OK] package.json -^> alpha ) else ( echo [FAIL] package.json alpha )
copy /Y "%SOURCE%\package.json" "%PRETEST%\package.json"
if %ERRORLEVEL% EQU 0 ( echo [OK] package.json -^> pre-test ) else ( echo [FAIL] package.json pre-test )

REM --- SERVER-INSTALL-GUIDE1.6.txt → tools/SERVER-INSTALL-GUIDE.txt + versioned copy ---
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE1.6.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE1.6.txt -^> alpha\tools\SERVER-INSTALL-GUIDE.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE alpha )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE1.6.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE1.6.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE1.6.txt -^> alpha\tools\SERVER-INSTALL-GUIDE1.6.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE1.6 alpha )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE1.6.txt" "%PRETEST_TOOLS%\SERVER-INSTALL-GUIDE.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE1.6.txt -^> pre-test\tools\SERVER-INSTALL-GUIDE.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE pre-test )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE1.6.txt" "%PRETEST_TOOLS%\SERVER-INSTALL-GUIDE1.6.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE1.6.txt -^> pre-test\tools\SERVER-INSTALL-GUIDE1.6.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE1.6 pre-test )

REM --- QUICK_START1.6.txt → tools/QUICK_START.txt + versioned copy ---
copy /Y "%SOURCE%\QUICK_START1.6.txt" "%ALPHA_TOOLS%\QUICK_START.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START1.6.txt -^> alpha\tools\QUICK_START.txt ) else ( echo [FAIL] QUICK_START alpha )
copy /Y "%SOURCE%\QUICK_START1.6.txt" "%ALPHA_TOOLS%\QUICK_START1.6.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START1.6.txt -^> alpha\tools\QUICK_START1.6.txt ) else ( echo [FAIL] QUICK_START1.6 alpha )
copy /Y "%SOURCE%\QUICK_START1.6.txt" "%PRETEST_TOOLS%\QUICK_START.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START1.6.txt -^> pre-test\tools\QUICK_START.txt ) else ( echo [FAIL] QUICK_START pre-test )
copy /Y "%SOURCE%\QUICK_START1.6.txt" "%PRETEST_TOOLS%\QUICK_START1.6.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START1.6.txt -^> pre-test\tools\QUICK_START1.6.txt ) else ( echo [FAIL] QUICK_START1.6 pre-test )

REM --- Test-apiserver1.4..html → tools/ ---
copy /Y "%SOURCE%\Test-apiserver1.4..html" "%ALPHA_TOOLS%\Test-apiserver1.4..html"
if %ERRORLEVEL% EQU 0 ( echo [OK] Test-apiserver1.4..html -^> alpha\tools ) else ( echo [FAIL] Test-apiserver1.4 alpha )
copy /Y "%SOURCE%\Test-apiserver1.4..html" "%PRETEST_TOOLS%\Test-apiserver1.4..html"
if %ERRORLEVEL% EQU 0 ( echo [OK] Test-apiserver1.4..html -^> pre-test\tools ) else ( echo [FAIL] Test-apiserver1.4 pre-test )

REM --- CropClient-MCP-API-Tools-Audit-Q-v1.6.html → pages/ ---
copy /Y "%SOURCE%\CropClient-MCP-API-Tools-Audit-Q-v1.6.html" "%ALPHA_PAGES%\CropClient-MCP-API-Tools-Audit-Q-v1.6.html"
if %ERRORLEVEL% EQU 0 ( echo [OK] Audit-v1.6.html -^> alpha\pages ) else ( echo [FAIL] Audit-v1.6 alpha )
copy /Y "%SOURCE%\CropClient-MCP-API-Tools-Audit-Q-v1.6.html" "%PRETEST_PAGES%\CropClient-MCP-API-Tools-Audit-Q-v1.6.html"
if %ERRORLEVEL% EQU 0 ( echo [OK] Audit-v1.6.html -^> pre-test\Pages ) else ( echo [FAIL] Audit-v1.6 pre-test )

echo.
echo ========================================
echo  Deploy complete. Alpha + Pre-Test updated.
echo  Next: test locally, then push to GitHub.
echo ========================================
echo.
pause
