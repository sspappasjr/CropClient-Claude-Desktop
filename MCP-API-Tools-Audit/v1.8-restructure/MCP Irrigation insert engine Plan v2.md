# MCP Irrigation insert engine Plan v2
Date: 3.7.2026

##  The first thing to know: 

the URL have never worked properly in the audit series.

steve (coach)  
we are going to use the new ai and mcp engines.
  they were inserted into test-apiserver and worked perfectly
   folder is 

C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v1.8-restructure
mcp-engine.js
ai-engine.js

these two files have been tested in test-apiserver 
they work quite well so use them exclusively for the URL , Prompting, Sending functions the offer. 
we have noticed a variable that is used in the Audit.1.8 app called CC_State 

be sure and set that variable to the drop down choice that mcp-engine will be set to.
   there will be one of online,offline, and local 
   this will save a lot of rewriting coding that works. 

lets do this work  withour new created audit 
 v1.8 restructure/CropClient-MCP-API-Tools-Audit-Q-v1.8.html
  
please insert these two files ai and mcp engine
and make sure the mcp-engine ui and onload code uses them

also let again make sure the irrigation-component obeys all the mcp rules
then export it into thiesfolder as the irrigation-component.1.1.js 

there are a lot of places where

GOOD LUCK

---

## George's Execution Plan (v1.8.1) — 3.8.2026

### Step 1: Copy v1.8 → v1.8.1
- CropClient-MCP-API-Tools-Audit-Q-v1.8.html → CropClient-MCP-API-Tools-Audit-Q-v1.8.1.html
- Update title to v1.8.1

### Step 2: Inject mcp-engine.js inline (@@@ markers)
- Insert as `@@@ BEGIN mcp-engine @@@` script block
- Between IRRIGATION_COMPONENT and DASHBOARD_COMPONENT
- No src= — inline injection, harness pattern

### Step 3: Inject ai-engine.js inline (@@@ markers)
- Insert as `@@@ BEGIN ai-engine @@@` script block
- Right after mcp-engine block
- No src= — inline injection, harness pattern

### Step 4: Rewire mcpCall() to use engine functions
- mcpCall() uses mcpEngineStaging() + mcpEngineSend() instead of raw fetch
- getMcpBase() uses mcpEngineURL() for URL resolution
- syncUrlDisplay() uses mcpEngineURL() to show current URL

### Step 5: Dropdown maps to engine URL functions
- **Online** → mcpEngineURL('production') → https://api.cropclient.com
- **Local** → mcpEngineURL('local') → http://localhost:3101
- **Offline** → CC_STATE.mode = 'offline' — direct CropManage API calls, no MCP server
- CC_STATE.mode set from dropdown on change and on load
- Engine owns the URLs — single source of truth

### Step 6: Export irrigation-component.1.1.js
- Extract IRRIGATION_COMPONENT section to standalone file
- Save to v1.8-restructure/irrigation-component.1.1.js

### Step 7: Test
- Harness loads, grid fills, chain fires
- Dropdown switches URLs correctly
- CRUD buttons work
- AI prompt bar functional

