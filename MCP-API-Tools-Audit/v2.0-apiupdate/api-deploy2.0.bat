@echo off
REM =====================================================================
REM api-deploy2.0.bat — Deploy Manifest for v2.0
REM =====================================================================
REM This batch file IS the deploy record for v2.0.
REM It copies specific files from v2.0-apiupdate to alpha AND pre-test.
REM Each version folder has its own api-deploy bat
REM so you always know what was deployed from which version.
REM
REM Source:  C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v2.0-apiupdate\
REM Alpha:   C:\AICode\crop-client-services\
REM PreTest: C:\Crop-Client-Services\
REM
REM =====================================================================
REM  COMPLETE v2.0 RELEASE — All Files in This Folder
REM =====================================================================
REM
REM  DEPLOYED (copied by this bat):
REM  ---------------------------------------------------------------
REM  Source File                          → Deploy Target
REM  ---------------------------------------------------------------
REM  APIServer2.0.js                     → api-server/
REM  api-component2.0.js                 → api-server/
REM  web2.0.config                       → api-server/web.config
REM  server-deploy2.0.bat               → tools/ (so server gets it via git push)
REM  SERVER-INSTALL-GUIDE2.0.txt         → tools/SERVER-INSTALL-GUIDE.txt
REM  QUICK_START2.0.txt                  → tools/QUICK_START.txt
REM  MCP_Test_Harnessv2.0.html           → tools/
REM
REM  NOT DEPLOYED (reference/history only):
REM  ---------------------------------------------------------------
REM  APIServer1.6.js                     — previous version (reference)
REM  web1.6.config                       — previous version (reference)
REM  MCP_Test_Harnessv1.6.html           — previous version (reference)
REM  .MyDailyLog.Today.txt               — team daily log
REM  .MyDailyNapkin.Today.txt            — specs napkin
REM  api-deploy2.0.bat                   — this file
REM  PageBuilder-Skills.html             — page builder tool
REM
REM =====================================================================

set SOURCE=C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v2.0-apiupdate
set ALPHA=C:\AICode\crop-client-services\api-server
set ALPHA_TOOLS=C:\AICode\crop-client-services\tools
set ALPHA_PAGES=C:\AICode\crop-client-services\pages
set PRETEST=C:\Crop-Client-Services\api-server
set PRETEST_TOOLS=C:\Crop-Client-Services\tools
set PRETEST_PAGES=C:\Crop-Client-Services\Pages

echo.
echo ========================================
echo  v2.0 Deploy to Alpha + Pre-Test
echo ========================================
echo.
echo Source:  %SOURCE%
echo Alpha:   %ALPHA%
echo PreTest: %PRETEST%
echo.

REM --- APIServer2.0.js ---
copy /Y "%SOURCE%\APIServer2.0.js" "%ALPHA%\APIServer2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] APIServer2.0.js -^> alpha ) else ( echo [FAIL] APIServer2.0.js alpha )
copy /Y "%SOURCE%\APIServer2.0.js" "%PRETEST%\APIServer2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] APIServer2.0.js -^> pre-test ) else ( echo [FAIL] APIServer2.0.js pre-test )

REM --- api-component2.0.js ---
copy /Y "%SOURCE%\api-component2.0.js" "%ALPHA%\api-component2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] api-component2.0.js -^> alpha ) else ( echo [FAIL] api-component2.0.js alpha )
copy /Y "%SOURCE%\api-component2.0.js" "%PRETEST%\api-component2.0.js"
if %ERRORLEVEL% EQU 0 ( echo [OK] api-component2.0.js -^> pre-test ) else ( echo [FAIL] api-component2.0.js pre-test )

REM --- web2.0.config → web.config + web2.0.config (versioned copy) ---
copy /Y "%SOURCE%\web2.0.config" "%ALPHA%\web.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web2.0.config -^> alpha\web.config ) else ( echo [FAIL] web.config alpha )
copy /Y "%SOURCE%\web2.0.config" "%ALPHA%\web2.0.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web2.0.config -^> alpha\web2.0.config ) else ( echo [FAIL] web2.0.config alpha )
copy /Y "%SOURCE%\web2.0.config" "%PRETEST%\web.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web2.0.config -^> pre-test\web.config ) else ( echo [FAIL] web.config pre-test )
copy /Y "%SOURCE%\web2.0.config" "%PRETEST%\web2.0.config"
if %ERRORLEVEL% EQU 0 ( echo [OK] web2.0.config -^> pre-test\web2.0.config ) else ( echo [FAIL] web2.0.config pre-test )

REM --- server-deploy2.0.bat → tools/ (so server gets it via git push) ---
copy /Y "%SOURCE%\server-deploy2.0.bat" "%ALPHA_TOOLS%\server-deploy2.0.bat"
if %ERRORLEVEL% EQU 0 ( echo [OK] server-deploy2.0.bat -^> alpha\tools ) else ( echo [FAIL] server-deploy2.0.bat alpha )
copy /Y "%SOURCE%\server-deploy2.0.bat" "%PRETEST_TOOLS%\server-deploy2.0.bat"
if %ERRORLEVEL% EQU 0 ( echo [OK] server-deploy2.0.bat -^> pre-test\tools ) else ( echo [FAIL] server-deploy2.0.bat pre-test )

REM --- SERVER-INSTALL-GUIDE2.0.txt → tools/SERVER-INSTALL-GUIDE.txt + versioned copy ---
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> alpha\tools\SERVER-INSTALL-GUIDE.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE alpha )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%ALPHA_TOOLS%\SERVER-INSTALL-GUIDE2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> alpha\tools\SERVER-INSTALL-GUIDE2.0.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE2.0 alpha )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%PRETEST_TOOLS%\SERVER-INSTALL-GUIDE.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> pre-test\tools\SERVER-INSTALL-GUIDE.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE pre-test )
copy /Y "%SOURCE%\SERVER-INSTALL-GUIDE2.0.txt" "%PRETEST_TOOLS%\SERVER-INSTALL-GUIDE2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] SERVER-INSTALL-GUIDE2.0.txt -^> pre-test\tools\SERVER-INSTALL-GUIDE2.0.txt ) else ( echo [FAIL] SERVER-INSTALL-GUIDE2.0 pre-test )

REM --- QUICK_START2.0.txt → tools/QUICK_START.txt + versioned copy ---
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%ALPHA_TOOLS%\QUICK_START.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> alpha\tools\QUICK_START.txt ) else ( echo [FAIL] QUICK_START alpha )
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%ALPHA_TOOLS%\QUICK_START2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> alpha\tools\QUICK_START2.0.txt ) else ( echo [FAIL] QUICK_START2.0 alpha )
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%PRETEST_TOOLS%\QUICK_START.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> pre-test\tools\QUICK_START.txt ) else ( echo [FAIL] QUICK_START pre-test )
copy /Y "%SOURCE%\QUICK_START2.0.txt" "%PRETEST_TOOLS%\QUICK_START2.0.txt"
if %ERRORLEVEL% EQU 0 ( echo [OK] QUICK_START2.0.txt -^> pre-test\tools\QUICK_START2.0.txt ) else ( echo [FAIL] QUICK_START2.0 pre-test )

REM --- MCP_Test_Harnessv2.0.html → tools/ ---
copy /Y "%SOURCE%\MCP_Test_Harnessv2.0.html" "%ALPHA_TOOLS%\MCP_Test_Harnessv2.0.html"
if %ERRORLEVEL% EQU 0 ( echo [OK] MCP_Test_Harnessv2.0.html -^> alpha\tools ) else ( echo [FAIL] MCP_Test_Harness alpha )
copy /Y "%SOURCE%\MCP_Test_Harnessv2.0.html" "%PRETEST_TOOLS%\MCP_Test_Harnessv2.0.html"
if %ERRORLEVEL% EQU 0 ( echo [OK] MCP_Test_Harnessv2.0.html -^> pre-test\tools ) else ( echo [FAIL] MCP_Test_Harness pre-test )

REM --- CropClient-MCP-API-Tools-Audit-Q-v2.0.html → pages/ ---
REM NOTE: This file does not exist yet. Uncomment when v2.0 audit app is created.
REM copy /Y "%SOURCE%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html" "%ALPHA_PAGES%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html"
REM if %ERRORLEVEL% EQU 0 ( echo [OK] Audit-v2.0.html -^> alpha\pages ) else ( echo [FAIL] Audit-v2.0 alpha )
REM copy /Y "%SOURCE%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html" "%PRETEST_PAGES%\CropClient-MCP-API-Tools-Audit-Q-v2.0.html"
REM if %ERRORLEVEL% EQU 0 ( echo [OK] Audit-v2.0.html -^> pre-test\Pages ) else ( echo [FAIL] Audit-v2.0 pre-test )

echo.
echo ========================================
echo  Deploy complete. Alpha + Pre-Test updated.
echo  Next: test locally, then push to GitHub.
echo ========================================
echo.
pause
