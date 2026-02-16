# CropClient API Server Component Guide

## Overview

This document describes how to extract the APISERVICE_COMPONENT from the CropClient app and inject it into APIServer.js so it functions properly in both browser and MCP environments.

---

## Core Principle

**APISERVICE_COMPONENT = JSON + CropManage API calls ONLY**

- No DOM calls
- No grid IDs  
- No chat logs
- No UI logic

The calling component (Dashboard UI - top left) handles all rendering using JSON data returned by APISERVICE.

---

## Key Facts

| Fact | Detail |
|------|--------|
| Node.js Version | v22.21.0 |
| Native `fetch()` | ✅ Supported - same API code works in browser and Node.js |
| DOM Code | Move to Dashboard UI - does NOT belong in APISERVICE |
| Source of Truth | App HTML: `CropClient-MCP-API-Tools-Audit-Q.html` |
| Component Markers | `<!-- @@@@ APISERVICE_COMPONENT id:api-sync @@@@ -->` |
| Task List | See `CropClient-API-Component-TASKS.md` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SOURCE OF TRUTH                         │
│         CropClient-MCP-API-Tools-Audit-Q.html               │
│                                                             │
│   <!-- @@@@ APISERVICE_COMPONENT id:api-sync @@@@ -->       │
│   ... all API functions ...                                 │
│   <!-- @@@@ APISERVICE_COMPONENT id:api-sync @@@@ -->       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ EXTRACT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   api-component.js                          │
│                                                             │
│   Core logic extracted from app                             │
│   fetch() works as-is (Node 22+)                            │
│   DOM calls use adapters                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ INJECT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APIServer.js                            │
│                                                             │
│   MCP server that exposes tools to Claude Desktop           │
│   Imports api-component.js                                  │
│   Registers tools for MCP protocol                          │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations

| File | Path | Purpose |
|------|------|---------|
| App (Source) | `C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\CropClient-MCP-API-Tools-Audit-Q.html` | Source of truth |
| Component | `C:\AICode\crop-client-services\api-server\api-component.js` | Extracted API logic |
| Server | `C:\AICode\crop-client-services\api-server\APIServer.js` | MCP server |

---

## Extraction Process

Once all DOM/UI functions are moved to Dashboard UI (see TASKS file), the **WHOLE APISERVICE_COMPONENT** will be extracted to api-component.js.

No partial extraction. Clean the component first, then extract completely.

### Step 1: Locate Component in App

Find the markers in the app HTML:
```html
<!-- @@@@ APISERVICE_COMPONENT id:api-sync @@@@ -->
<script>
  // All code between these markers is the component
</script>
<!-- @@@@ APISERVICE_COMPONENT id:api-sync @@@@ -->
```

### Step 2: Extract Code Between Markers

Copy everything between the `@@@@ APISERVICE_COMPONENT @@@@` markers.

### Step 3: Identify Code Categories

| Category | Action | Example |
|----------|--------|---------|
| Variables | Keep in APISERVICE | `let apiToken = null;` |
| API Functions (`fetch`) | Keep in APISERVICE | `await fetch(url, {...})` |
| Logic Functions | Keep in APISERVICE | loops, transforms, calculations |
| DOM Functions | Move to Dashboard UI | `document.getElementById()` |
| UI Functions | Move to Dashboard UI | `logToChat()`, `populateGrid()` |

### Step 4: Move DOM/UI to Dashboard Component

DOM and UI code belongs in the calling component (Dashboard UI), not APISERVICE.

**Before (mixed - WRONG):**
```javascript
// In APISERVICE
async function getRanches() {
    const response = await fetch(url, {...});
    const data = await response.json();
    ranchData = data;
    populateRanchesGrid(data);  // ❌ DOM - wrong place
    logToChat('✅ Loaded', 'M');  // ❌ UI - wrong place
}
```

**After (separated - CORRECT):**
```javascript
// In APISERVICE - pure data
async function getRanches() {
    const response = await fetch(url, {...});
    const data = await response.json();
    ranchData = data;
    return {
        success: true,
        ranches: data,
        count: data.length
    };
}

// In Dashboard UI - handles rendering
async function onGetRanchesClick() {
    const result = await getRanches();
    if (result.success) {
        populateRanchesGrid(result.ranches);
        logToChat('✅ Loaded ' + result.count + ' ranches', 'M');
    }
}
```

### Step 5: Complete Task List

See `CropClient-API-Component-TASKS.md` for full list of DOM/UI functions to move.

Work ONE AT A TIME. Test app after each change. Get approval before next task.

---

## Injection into APIServer.js

### Step 1: Import Component

```javascript
// APIServer.js
const apiComponent = require('./api-component.js');
```

### Step 2: Register MCP Tools

```javascript
// Map component functions to MCP tools
const tools = [
    {
        name: "refresh_irrigations",
        description: "Refresh irrigation details for selected ranch/planting. Handles ALL selections with loops.",
        inputSchema: {
            type: "object",
            properties: {
                ranchId: { type: "string" },
                plantingId: { type: "string" }
            }
        },
        handler: async (args) => {
            return await apiComponent.refreshSelectedIrrigations(args.ranchId, args.plantingId);
        }
    },
    // ... more tools
];
```

### Step 3: Return Data

APISERVICE functions return JSON data. The Dashboard UI handles rendering.

```javascript
// In api-component.js - clean, no UI
async function refreshSelectedIrrigations(ranchId, plantingId) {
    // ... all the API/logic ...
    
    // Return data only
    return {
        success: true,
        count: allEvents.length,
        records: displayRecords
    };
}

// In Dashboard UI (app) - handles rendering
async function onRefreshButtonClick() {
    const result = await refreshSelectedIrrigations(selectedRanchId, selectedPlantingId);
    if (result.success) {
        populateIrrigationDetailsGridDEFAULT(result.records);
        logToChat(`✅ Loaded ${result.count} irrigations`, 'M');
    }
}
```

---

## Testing

### Test in Browser
1. Open app HTML in browser
2. Click "Refresh Selected Irrigations" button
3. Should see 29 records with full data

### Test in MCP
1. Start APIServer.js
2. Call `refresh_irrigations` tool in Claude Desktop
3. Should return 29 records with full data

### Expected Result (Both)
| Field | Value |
|-------|-------|
| Total Records | 29 |
| Ranch Names | Steve Ranch 1, Steve Ranch 2 |
| Hours | Populated (not 0) |
| Intervals | Populated (not "0 days") |

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `fetch is not defined` | Old Node.js | Upgrade to Node 18+ |
| `document is not defined` | DOM call still in APISERVICE | Move to Dashboard UI (see TASKS) |
| 7 records instead of 29 | Missing loop logic | Ensure refreshSelectedIrrigations has all 3 scenarios |
| Hours showing 0 | Missing second API call | Ensure fetchAllRecommendations is called |
| Names showing "-" | Context not added | Check `event.RanchName = ranch.Name` in loops |

---

## Summary

1. **Source of Truth**: App HTML with `@@@@ APISERVICE_COMPONENT @@@@` markers
2. **fetch() Works**: Node 22 has native fetch - no conversion needed
3. **DOM Goes Away**: Move all DOM/UI to Dashboard UI component
4. **Clean APISERVICE**: Pure JSON + API calls only
5. **Same Code**: Once clean, WHOLE component extracts to api-component.js
6. **App Works**: Button click → Dashboard UI calls APISERVICE → renders result
7. **MCP Works**: Tool call → api-component.js → returns JSON to Claude

---

## Next Steps

1. Complete TASKS one at a time (see TASKS file)
2. Test app after each change
3. Verify button still works with 29 records
4. Once all tasks complete, extract WHOLE APISERVICE to api-component.js
5. Test in MCP - should get same 29 records

---

## Related Files

| File | Purpose |
|------|---------|
| `CropClient-API-Component-TASKS.md` | Task list for cleanup |
| `README-API-COMPONENT.md` | This document |

---

*Last Updated: January 24, 2026*
*CropClient MCP API Server v1.0*
