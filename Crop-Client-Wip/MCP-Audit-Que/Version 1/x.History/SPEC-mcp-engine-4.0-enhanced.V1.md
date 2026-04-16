# SPEC: mcp-engine-4.0 — Enhanced Tool Engine

**Date:** 2026-04-10  
**Author:** Mac (Claude Desktop)  
**Coder:** George (Claude Code / Opus)  
**Status:** SPEC — AWAITING STEVE APPROVAL

---

## Goal
Enhance mcp-engine to be the COMPLETE tool layer:
- Load tool definitions from server on login / server change
- Validate + send in one step
- Any app links mcp-engine → gets full MCP capability

NO tool logic in HTML. NO callTool scattered. ONE engine.

---

## Function Narratives & Parameter Definitions

### 1. mcpEngineLogon(username, password, serverUrl)

**What it does:** This is the master startup function. Every app calls this once on load. It authenticates the user with the MCP server, then automatically loads the tool registry and user data. After this completes, the engine is fully ready — any tool can be called.

**When to call:** App startup (window.onload), or when switching servers (dropdown change). Calling it again re-authenticates and refreshes everything.
  
Note============  be sure and call the token first time with my logon embeded to get access to the cropmanage system.  that is required first. 
                                                    ==================  1st token call to logon with embeded user ( me ))  ============= coach


| Param | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | YES | User's login email (e.g. "stevep@sspnet.com") |
| password | string | YES | User's password |
| serverUrl | string | YES | Full server URL (e.g. "http://localhost:3101" or "https://api.cropclient.com") |

**Internally calls:** mcpEngineLoadTools() then mcpEngineLoadInit()

**Result Set:**
```javascript
// Success:
{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIs...",   // auth token stored internally
    toolCount: 17,                         // how many tools loaded
    user: {                                // user context
        username: "stevep@sspnet.com",
        role: "admin"
    },
    serverUrl: "http://localhost:3101"      // confirmed server
}

// Failure:
{
    success: false,
    error: "Authentication failed: invalid credentials"
}
```

---

### 2. mcpEngineLoadTools()

**What it does:** Fetches the complete tool registry from the current server. Every tool the server offers — its name, description, and input schema — gets stored locally. This is what lets the engine validate parameters before sending, and what lets UI dropdowns show available tools.

**When to call:** Called automatically by mcpEngineLogon. Can also be called manually anytime to refresh the tool list (e.g. after a server deploy adds new tools).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| (none) | — | — | Uses current serverUrl from logon |

**Side effect:** Populates internal `mcpToolDefs` registry

**Result Set:**
```javascript
// Success:
{
    success: true,
    count: 17,
    tools: {
        "data_operation": {
            name: "data_operation",
            description: "Generic JSON table operation using {action, table, data}.",
            inputSchema: {
                type: "object",
                properties: {
                    action: { type: "string", description: "read | write | update | delete" },
                    table: { type: "string" },
                    data: {}
                },
                required: ["action", "table"]
            }
        },
        "get_irrigation_details": {
            name: "get_irrigation_details",
            description: "Get irrigation details for a planting.",
            inputSchema: { ... }
        },
        "json_read": { ... },
        "get_token": { ... },
        "get_ranches": { ... }
        // ... all 17 tools
    }
}

// Failure:
{
    success: false,
    error: "Server unreachable: http://localhost:3101/tools"
}
```

---

### 3. mcpEngineLoadInit()

**What it does:** Fetches user-specific initialization data from the server — saved preferences, default prompts, last-used settings. This gives any app instant access to the user's context without each app having to load it separately.

**When to call:** Called automatically by mcpEngineLogon. Can also be called manually to refresh user data.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| (none) | — | — | Uses current serverUrl + token from logon |

**Side effect:** Populates internal user context

**Result Set:**
```javascript
// Success:
{
    success: true,
    userData: {
        username: "stevep@sspnet.com",
        role: "admin",
        lastLogin: "2026-04-10T14:30:00Z",
        preferences: {
            defaultMode: "local",
            defaultTable: "steve"
        }
    },
    prompts: [
        "Show me all irrigation records for Ranch 1",
        "What plantings need water today?",
        "Create next irrigation for selected field"
    ]
}

// Failure:
{
    success: false,
    error: "No user data found for stevep@sspnet.com"
}
```

---

### 4. mcpEngineGetAvailableTools()

**What it does:** Returns the tool registry that was loaded by mcpEngineLoadTools. Read-only — doesn't fetch anything, just returns what's already loaded. Use this to populate dropdowns, show tool descriptions, or check what tools are available before calling them.

**When to call:** Anytime after logon. Typically used to build UI elements.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| (none) | — | — | Returns cached registry |

**Result Set:**
```javascript
// Returns object keyed by tool name:
{
    "data_operation": {
        name: "data_operation",
        description: "Generic JSON table operation using {action, table, data}.",
        inputSchema: { ... }
    },
    "get_irrigation_details": {
        name: "get_irrigation_details",
        description: "Get irrigation details for a planting.",
        inputSchema: { ... }
    },
    "get_token": { ... },
    "get_ranches": { ... },
    "json_read": { ... },
    "json_write": { ... }
    // ... all loaded tools
}

// If called before logon:
null  // or empty {}
```

---

### 5. mcpEngineSend(toolName, params)

**What it does:** The workhorse. Takes a tool name and parameters, validates the params against the tool's schema (from the registry), builds a proper JSON-RPC 2.0 payload, POSTs it to the server, and returns the result. If validation fails, it returns an error WITHOUT sending — catches mistakes before they hit the server.

**When to call:** Any time an app needs to execute a tool. Button clicks, onload data fetch, save operations.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| toolName | string | YES | Name of the MCP tool (e.g. "data_operation", "get_irrigation_details") |
| params | object | NO | Tool arguments — validated against the tool's inputSchema |

**Result Set (varies by tool):**

```javascript
// data_operation READ:
{
    success: true,
    filepath: "steve.json",
    data: [
        { id: 1, ranch: "1", planting: "1A", hours: 1.3, mgrHours: 1.2, appliedHours: 1.15, ... },
        { id: 2, ranch: "1", planting: "1A", hours: 1.2, mgrHours: 1.1, appliedHours: 1.05, ... },
        // ... all records
    ]
}

// data_operation WRITE:
{
    success: true,
    message: "Wrote steve.json"
}

// get_irrigation_details:
{
    success: true,
    data: [
        { irrigationId: 101, plantingId: "456", scheduledDate: "10/14/24", hours: 1.3, ... },
        { irrigationId: 102, plantingId: "456", scheduledDate: "10/16/24", hours: 1.2, ... }
    ]
}

// Validation failure (never hits server):
{
    success: false,
    error: "Missing required param: action",
    tool: "data_operation"
}

// Tool not found:
{
    success: false,
    error: "Tool not found: fake_tool"
}

// Server error:
{
    success: false,
    error: "Server returned 500: Internal Server Error"
}
```

---

## Current State (mcp-engine-3.0)
- `mcpEngineInit(mode)` — sets mode + server URL
- `mcpEngineURL(mode)` — returns server URL
- `mcpEngineStaging(mode, toolName, params)` — builds simple object
- `mcpEngineSend(staged)` — POSTs to server

**Problems:**
- Staging builds a simple fetch object, not JSON-RPC
- No tool definitions loaded — can't validate
- callTool lives in irrigation-component (duplicated across apps)
- No schema validation before send

---

## New State (mcp-engine-4.0) — Steve's Function Breakdown

### Function Registry (5 Functions)

| # | Function | Purpose | Called By |
|---|----------|---------|-----------|
| 1 | `mcpEngineLogon(username, password, serverUrl)` | Master init — authenticates, then calls #2 and #3 | HTML onload |
| 2 | `mcpEngineLoadTools()` | Fetches tool registry from server (callable anytime) | #1 auto, or manual refresh |
| 3 | `mcpEngineLoadInit()` | Fetches user data/prompts from server (callable anytime) | #1 auto, or manual refresh |
| 4 | `mcpEngineGetAvailableTools()` | Returns tool registry (read-only) | UI dropdowns, validation |
| 5 | `mcpEngineSend(toolName, params)` | Enhanced — validates against registry, stages JSON-RPC, sends | Any app button/action |

---

### 1. mcpEngineLogon(username, password, serverUrl)

Master init. Single entry point for any app.

```javascript
await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');

// Internally:
// 1. Authenticates with server → gets token
// 2. Calls mcpEngineLoadTools() → populates tool registry
// 3. Calls mcpEngineLoadInit() → loads user data/prompts
// Engine is now READY — all tools available, user data loaded
```

**On server/mode change (dropdown):**
```javascript
await mcpEngineLogon('stevep@sspnet.com', 'password', 'https://api.cropclient.com');
// Re-authenticates, reloads tools + user data from new server
```

---

### 2. mcpEngineLoadTools()

Fetches tool definitions from server. Callable anytime to refresh.

```
GET {serverUrl}/tools → returns array of tool definitions
```

Stores internally:
```javascript
// After load, registry contains:
{
    "data_operation": {
        name: "data_operation",
        description: "Generic JSON table operation using {action, table, data}.",
        inputSchema: {
            type: "object",
            properties: {
                action: { type: "string", description: "read | write | update | delete" },
                table: { type: "string" },
                data: {}
            },
            required: ["action", "table"]
        }
    },
    "get_irrigation_details": {
        name: "get_irrigation_details",
        description: "Get irrigation details for a planting.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: { type: "string" }
            },
            required: ["plantingId"]
        }
    },
    "json_read": { ... },
    "json_write": { ... },
    "get_token": { ... },
    "get_ranches": { ... },
    // ... all 17 tools loaded automatically
}
```

---

### 3. mcpEngineLoadInit()

Fetches user-specific data and prompts from server. Callable anytime.

```javascript
await mcpEngineLoadInit();
// Loads: user preferences, saved prompts, default settings
// Available to any app that needs user context
```

---

### 4. mcpEngineGetAvailableTools()

Returns the tool registry. Read-only. For UI dropdowns, validation, display.

```javascript
const tools = mcpEngineGetAvailableTools();
// Returns: { "data_operation": {...}, "get_irrigation_details": {...}, ... }

// Populate a dropdown:
Object.keys(tools).forEach(name => {
    dropdown.add(new Option(tools[name].description, name));
});
```

---

### 5. mcpEngineSend(toolName, params) — Enhanced

Validates params against tool registry, builds JSON-RPC, sends to server.

**NO separate staging step.** Send does it all.

#### Example: data_operation — Read steve.json
```javascript
const result = await mcpEngineSend('data_operation', {
    action: 'read',
    table: 'steve'
});

// Internally:
// 1. Looks up 'data_operation' in tool registry
// 2. Validates: action (required) ✅, table (required) ✅
// 3. Builds JSON-RPC:
//    {
//      jsonrpc: "2.0",
//      id: 1,
//      method: "tools/call",
//      params: {
//        name: "data_operation",
//        arguments: { action: "read", table: "steve" }
//      }
//    }
// 4. POSTs to http://localhost:3101/tools/data_operation
// 5. Returns: { success: true, data: [...irrigation records...] }
```

#### Example: get_irrigation_details
```javascript
const result = await mcpEngineSend('get_irrigation_details', {
    plantingId: '456'
});

// Validates plantingId (required) ✅
// Sends to server
// Returns: { success: true, data: [...detail records...] }
```

#### Example: Save data
```javascript
const result = await mcpEngineSend('data_operation', {
    action: 'write',
    table: 'steve',
    data: irrigationData
});
// Returns: { success: true, message: "Wrote steve.json" }
```

#### Validation Errors (caught before sending):
```javascript
const result = await mcpEngineSend('data_operation', {});
// Returns: { success: false, error: "Missing required param: action" }

const result = await mcpEngineSend('fake_tool', {});
// Returns: { success: false, error: "Tool not found: fake_tool" }
```

---

## Full App Flow Examples

### Water Tools — onload
```javascript
window.onload = async function() {
    // 1. Login + load tools + load user data
    await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');

    // 2. Load steve.json
    const result = await mcpEngineSend('data_operation', { action: 'read', table: 'steve' });
    if (result.success) {
        irrigationData = result.data;
        read();
    }
};
```

### Audit Que — onload
```javascript
window.onload = async function() {
    await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');

    const result = await mcpEngineSend('data_operation', { action: 'read', table: 'irrigation' });
    if (result.success) {
        irrigationData = result.data;
        read();
    }
};
```

### Get Irrigation Details — user clicks Send
```javascript
const result = await mcpEngineSend('get_irrigation_details', { plantingId: selectedPlantingId });
if (result.success) {
    // Fill grid
}
```

### Switch Server — dropdown change
```javascript
dropdown.addEventListener('change', async (e) => {
    const serverUrl = e.target.value === 'local'
        ? 'http://localhost:3101'
        : 'https://api.cropclient.com';
    await mcpEngineLogon('stevep@sspnet.com', 'password', serverUrl);
    // Tools reloaded, user data refreshed, ready to go
});
```

---

## File Summary

| File | What Changes |
|------|-------------|
| mcp-engine-4.0.js | NEW — enhanced engine with tool loading + callTool |
| irrigation-component-3.1.js | REMOVE callTool + mcpTools — just tool handlers that register |         .... REMOVE ? NOT YET !!!!!!
    ==========its still need to go thru the harness phase !!! for this task just leave it src= and adjust to support mcp-engine only ======   Coach NOTE 

| Water Tools HTML | onload uses callTool directly |  Call tool or engine send i am confused ===================== Coach NOTE ???
| Audit Que HTML | onload uses callTool directly |     Call tool or engine send i am confused ===================== Coach NOTE   ???

---

## Rules
- callTool defined ONCE in mcp-engine huh ?  ================ what is call tools === specs included here ?????
- Tools loaded from SERVER (not hardcoded)
- Every app links mcp-engine → gets callTool free  ================================================more call tools 
- irrigation-component registers handlers, doesn't own callTool ===============================
- Steve approves before George codes
