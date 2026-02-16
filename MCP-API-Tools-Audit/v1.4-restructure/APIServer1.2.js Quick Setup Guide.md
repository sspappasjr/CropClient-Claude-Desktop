# APIServer1.2.js Quick Setup Guide

**Get the MCP server running in 5 minutes**
--
## 1. VERIFY NODE.JS
```cmd
node --version
```
If not installed: Download from https://nodejs.org/
---
## 2. GO TO PROJECT FOLDER
```cmd
cd C:\AICode\crop-client-services\api-server
``
---
## 3. INSTALL DEPENDENCIES
```cmd
npm install express cors
---
## 4. START SERVER (MANUAL)
```cmd
node APIServer1.2.js`
You'll see:
```
✅ API MCP Server running on http://localhost:3101
📋 Tools available: 15
```
**Press Ctrl+C to stop**
---
## 5. TEST IT
Open browser: **http://localhost:3101/ping**
Or open **test-apiserver.html** in browser.
---

## 6. AUTO-RESTART (OPTIONAL - For Production)

Install PM2:
```cmd
npm install -g pm2
```
Start service:
```cmd
pm2 start APIServer1.2.js --name APIService
pm2 save
```
Manage service:
```cmd
pm2 restart APIService
pm2 stop APIService
pm2 logs APIService
```
---

## 7. FIREWALL (If Needed)
```cmd
netsh advfirewall firewall add rule name="APIService Port 3101" dir=in action=allow protocol=TCP localport=3101
```
---
## TROUBLESHOOTING

**Port already in use?**
```cmd
netstat -ano | findstr :3101
taskkill /PID [number] /F
```
**Can't connect?**
- Check firewall
- Server must be running
- Use correct URL: http://localhost:3101

---

**Files:**
- Server: `APIServer1.2.js`
- Tester: `test-apiserver.html`
- Data: `C:\AICode\crop-client-services\api-server\data\`

**Service Name:** APIService  
**Port:** 3101  
**Tools:** 15 (8 API + 7 JSON)
