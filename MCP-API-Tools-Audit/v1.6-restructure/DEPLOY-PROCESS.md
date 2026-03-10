# CropClient API v1.6 — Full Deployment Process

## The Pipeline: Alpha → GitHub → Server

### Step 1: Alpha Deploy (Mac's machine)
- **Script:** `api-deploy1.6.bat`
- **What it does:** Copies all 22 files from v1.6-restructure to alpha path
  - Alpha path: `C:\AICode\crop-client-services\api-server`
- **Run from:** `C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v1.6-restructure`

### Step 2: Pre-Test on Localhost
- **Tool:** `Test-apiserver1.4.html` pointed at localhost
- **What to test:** All 15 tools respond correctly
- **Pass criteria:** Every tool returns valid data, no errors

### Step 3: Git Push to GitHub
- **From:** `C:\AICode\crop-client-services` (alpha repo)
- **Commands:**
  ```
  cd C:\AICode\crop-client-services
  git add .
  git commit -m "v1.6 deploy - [description]"
  git push
  ```
- **GitHub = filing cabinet** — just stores the files for transfer

### Step 4: Server Deploy (Coach runs on 184.168.20.205)
- **Script:** `server-deploy1.6.bat` (copy to server, run there)
- **What it does:**
  1. `cd C:\Crop-Client-Services\api-server`
  2. `git pull` — pulls latest from GitHub
  3. `iisreset` — restarts IIS to load new code
- **Or manually:** RDP to server, open cmd, run the two commands

### Step 5: Live Test on Server
- **Tool:** `Test-apiserver1.4.html` pointed at `http://api.cropclient.com`
- **What to test:** All 15 tools respond correctly on live server
- **Pass criteria:** Same as localhost — every tool works

### Step 6: CORS Check (optional)
- **What:** Open audit app on localhost WITHOUT CORS extension
- **Expected:** Should show CORS warning (confirms server security works)

## Quick Reference
| Step | Who | Script/Command | Where |
|------|-----|---------------|-------|
| 1. Alpha deploy | Mac | `api-deploy1.6.bat` | Mac's machine |
| 2. Pre-test | Mac | Test-apiserver1.4 → localhost | Browser |
| 3. Git push | Mac | `git add/commit/push` | Alpha repo |
| 4. Server deploy | Coach | `server-deploy1.6.bat` | Server 184.168.20.205 |
| 5. Live test | Coach | Test-apiserver1.4 → api.cropclient.com | Browser |
| 6. CORS check | Coach | Audit app, no extension | Browser |

## Server Details
- **Server IP:** 184.168.20.205
- **Server path:** `C:\Crop-Client-Services\api-server`
- **Live URL:** http://api.cropclient.com
- **Port:** 80 (HTTP only, no SSL)
