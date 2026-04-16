# MCP-Audit-Que — CLAUDE.md

## Water Tools Demo → 3src Modular Pattern

### STATUS: IN PROGRESS - STEP 2 COMPLETE

**Goal:** Modularize Water Tools Demo using 3src pattern (mcp-engine, api-component, irrigation-component)

**Approach:** Keep working format. Add markers + one src= link at a time.

**Active File:** `CropClient-MCP-Water-Tools-Demo-V1-3src.html` (Version 1 root)  
**Plan:** See `PLAN-Water-Tools-3src-Modular.md`

---

## Version 1: Fix get_token for Local/Online Mode

### STATUS: ACTIVE TASK

**Server:** APIServer3.4 (17 tools, port 3101, local mode)
**Focus:** Fix `getToken()` in api-component-3.0.1.js
**Active File:** Crop-Client-MCP-Audit-Que-1.2-with3src.html

### CURRENT TASK: get_token Local/Online Mode Check

**Problem:**
- `getToken()` in api-component-3.0.1 ALWAYS calls direct CropManage API (CORS)
- Missing: IF statement to check if local/online mode → call MCP instead

**Solution:**
- Add IF `base = getMcpBase()` at top of getToken()
  - IF base exists → call `mcpCall('get_token', {username, password})`
  - ELSE (offline) → call direct CORS API
- get_token tool already registered in APIServer3.3 (line 460)

**Change Location:**
- File: `Version 1\2. Src=\api-component-3.0.1.js`
- Function: `getToken()` line ~512

### What Lives in 2. Src=
| File | Status |
|------|--------|
| mcp-engine-3.0.js | DONE |
| api-component-3.0.2.js | **LIVE** — getToken() IF check added |
| api-component-3.0.1.js | Reference (before fix) |
| APIServer3.4.js | **LIVE** — 17 tools, get_token registered |

### Team
- Steve — approval (GOFORIT)
- Mac — developer/architect

### Rules
- No code without GOFORIT
- One change at a time
- api-component-2.0.js READ ONLY
- APIServer3.3 is running source of truth
