# MCP-Audit-Que Version 1 and Water Tools
# Updated: 2026-04-13

## ✅ Completed:
- Audit Que and Water Tools both updated to mcp-engine-4.0.js
- api-component-3.4.1.js live with IF/ELSE MCP vs direct API pattern
- APIServer3.4.1.js running on port 3101
- Local mode works: onload, token, ranch, planting, get-irrigations, post, update
- Water Tools onload: steve.json populates grid
- CRUD works in both apps

---

## 📁 Active src= Files (Version 1 / 2. Src=)
- mcp-engine-4.0.js          — generic MCP transport, mcpStaging(), mcpEngineSend()
- irrigation-component-3.0.js —create 4.0 version  local in-browser CRUD dispatcher (irrigationHarnessDispatch use mcp engine names)
- api-component-3.4.1.js     — CropManage API tools (MCP or direct per mode)
- APIServer3.4.1.js           — Node server on port 3101

## 📄 Active HTML Files (Version 1)
- Crop-Client-MCP-Audit-Que.3.4with3src.html  — Audit Que app
- CropClient-MCP-Water-Tools-Demo-V1-3src.html — Water Tools app

---

## 🔧 CURRENT PLAN — 5 Tasks (see PLAN-Water-Tools-3src-Modular.md for detail)

1. Water Tools — Save button (writes to JSON + sets lastSavedSnapshot)
2. Water Tools — Restore button (reads from JSON → displayRecords → renderTable)
3. Water Tools — Reset button (restores from lastSavedSnapshot in-memory, no file read)
4. Audit Que   — All Ranches / All Plantings click: token not handled, needs same path as Refresh button
5. Audit Que   — All click in ranch/planting grid only fires on change, not loading all records unconditionally

---

## ⏭️ NEXT PLAN — irrigation-component proper install (do NOT mix with current plan)

Separate planning session required before any work begins.

### What was discovered:
- irrigation-component-3.0.js is loaded via src= in both apps but its CRUD
  functions are not being called — both apps have their own duplicate local CRUD.
- irrigationHarnessDispatch() = component's local in-browser tool router (no network)
  Different from mcpStaging() which routes to APIServer (network).
- Name "irrigationHarnessDispatch" is confusing — sounds like test scaffolding.
  Rename decision needed before wiring work begins.
- Two dispatchers, two worlds (two-world rule):
    mcpStaging()                → mcp-engine → APIServer (server tools, network)
    irrigationHarnessDispatch() → irrigation-component → in-memory CRUD (browser)
- irrigation-component will be updated to 3.4 to match mcp-engine versioning pattern
  so the two are clearly paired and meant for each other.

### Plan items for NEXT session:
1. Decide rename for irrigationHarnessDispatch
2. Update irrigation-component to v3.4
3. Map every duplicate local function vs component equivalent in both apps
4. Wire CRUD buttons → component dispatcher
5. Comment out (never delete) local duplicates with explanation
6. Add lastSavedSnapshot pattern into component save handler
7. Verify no double-rendering or conflicts

### Rule: never delete working code — comment out dups with explanation of why.

---

## 📋 Session Notes — 2026-04-13
- Read all 4 active src= files and both HTML apps in full
- Confirmed Audit Que: All Ranches/Plantings click only fires on change (not unconditional load)
- Confirmed Audit Que: token not passed through to get_irrigation_details on All click
- Confirmed Refresh button works correctly — All click needs same token path
- Confirmed Water Tools: no Save/Restore buttons exist yet
- Confirmed Water Tools: Reset goes back to hardcoded originalData (wrong — needs snapshot)
- Decision: irrigation-component wiring is a separate NEXT plan
- No code changed this session — planning only
