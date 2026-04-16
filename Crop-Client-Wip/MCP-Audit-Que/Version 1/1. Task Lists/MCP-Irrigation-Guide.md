# MCP Irrigation Guide
## The Complete Reference for MCP-Engine 4.0 + Irrigation Component Architecture

**Date:** 2026-04-11  
**Authors:** Steve (Coach), Mac (Spec), George (Implementation)  
**Status:** Master Reference Document

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [The MCP Initialization Sequence](#the-mcp-initialization-sequence)
3. [Function Reference](#function-reference)
4. [Irrigation Component Integration](#irrigation-component-integration)
5. [Complete Flow Examples](#complete-flow-examples)
6. [Migration Guide](#migration-guide)

---

## Architecture Overview

### The Three-Layer Model

```
┌─────────────────────────────────────────────┐
│         APPLICATION LAYER                    │
│  (HTML Harness, UI, User Interactions)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      IRRIGATION-COMPONENT LAYER              │
│  (Staging, Button Handlers, CRUD Logic)     │
│  - Builds params objects                     │
│  - Handles click events                      │
│  - Manages UI state                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         MCP-ENGINE LAYER                     │
│  (Authentication, Tool Registry, Transport)  │
│  - Authenticates with server                 │
│  - Loads tool definitions                    │
│  - Validates parameters                      │
│  - Sends JSON-RPC 2.0 requests              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         API SERVER                           │
│  (Node.js, Tool Handlers, CropManage Proxy) │
└─────────────────────────────────────────────┘
```

### Key Principles

1. **mcp-engine owns the transport layer** - authentication, tool registry, JSON-RPC communication
2. **irrigation-component owns the staging layer** - builds parameter objects, handles UI events
3. **HTML harness owns the application layer** - initialization, page structure, user workflow
4. **NO scattered callTool functions** - ONE engine handles all MCP communication
5. **Tool definitions come from server** - not hardcoded, loaded dynamically at logon

---

## The MCP Initialization Sequence

### Phase 1: Authentication (First Token Call)

**CRITICAL**: The very first action is to authenticate with **embedded default credentials** to gain access to the CropManage system.

```javascript
window.onload = async function() {
    // This call uses YOUR embedded credentials to get system access
    await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');
    // Now authenticated and armed...
};
```

**What happens internally:**
1. POST credentials to `/auth/login`
2. Receive authentication token
3. Store token in `MCP_ENGINE.token`
4. Token grants access to all subsequent tool calls

### Phase 2: Tool Registry Load

Immediately after authentication, `mcpEngineLogon()` automatically calls `mcpEngineLoadTools()`:

```javascript
// Called automatically by mcpEngineLogon()
async function mcpEngineLoadTools() {
    // Fetch complete tool registry from server
    const response = await fetch(`${MCP_ENGINE.serverUrl}/tools`, {
        headers: { 'Authorization': `Bearer ${MCP_ENGINE.token}` }
    });
    
    const tools = await response.json();
    
    // Store in engine
    MCP_ENGINE.tools = {
        "data_operation": {
            name: "data_operation",
            description: "Generic JSON table operation using {action, table, data}.",
            inputSchema: {
                type: "object",
                properties: {
                    action: { type: "string" },
                    table: { type: "string" },
                    data: {}
                },
                required: ["action", "table"]
            }
        },
        "get_irrigation_details": { ... },
        "get_token": { ... },
        "get_ranches": { ... },
        "get_plantings": { ... },
        // ... all 17 tools loaded
    };
}
```

### Phase 3: User Context Load

After tools are loaded, `mcpEngineLogon()` calls `mcpEngineLoadInit()`:

```javascript
// Called automatically by mcpEngineLogon()
async function mcpEngineLoadInit() {
    // Load user-specific data and prompts
    const response = await fetch(`${MCP_ENGINE.serverUrl}/init`, {
        headers: { 'Authorization': `Bearer ${MCP_ENGINE.token}` }
    });
    
    const initData = await response.json();
    
    // Store in engine
    MCP_ENGINE.userData = {
        ranches: initData.ranches,
        plantings: initData.plantings,
        preferences: initData.preferences
    };
    
    MCP_ENGINE.prompts = {
        OnLoad: initData.prompts.OnLoad,
        AllIrrigations: initData.prompts.AllIrrigations
    };
}
```

### Complete Initialization Timeline

```
window.onload fires
  ↓
mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101')
  ↓
  ├─> Authenticate → get token → store in MCP_ENGINE.token
  │
  ├─> mcpEngineLoadTools() → fetch tool registry → store in MCP_ENGINE.tools
  │
  └─> mcpEngineLoadInit() → fetch user data/prompts → store in MCP_ENGINE.userData
  ↓
Returns: { success: true, toolCount: 17, user: {...} }
  ↓
ENGINE IS NOW ARMED
  ↓
App can call mcpEngineSend() for any tool
```

---

## Function Reference

### 1. mcpEngineLogon(username, password, serverUrl)

**Purpose:** Master initialization function - authenticates and loads everything

**When to call:** 
- `window.onload` (app startup with embedded credentials)
- Server dropdown change (switch between local/production)
- AI provider change (reload with new context)

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | YES | User's login email (default: "stevep@sspnet.com") |
| password | string | YES | User's password (embedded in app) |
| serverUrl | string | YES | "http://localhost:3101" or "https://api.cropclient.com" |

**Returns:**
```javascript
{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIs...",
    toolCount: 17,
    user: {
        username: "stevep@sspnet.com",
        role: "admin"
    },
    serverUrl: "http://localhost:3101"
}
```

**Internal Flow:**
1. Authenticate with server
2. Store token
3. Call `mcpEngineLoadTools()`
4. Call `mcpEngineLoadInit()`
5. Return success + metadata

---

### 2. mcpEngineLoadTools()

**Purpose:** Fetch complete tool registry from APIServer

**When to call:**
- Called automatically by `mcpEngineLogon()`
- Can be called manually to refresh tools (after server deploy)

**Parameters:** None (uses current serverUrl + token)

**Side Effects:** Populates `MCP_ENGINE.tools` with complete registry

**Returns:**
```javascript
{
    success: true,
    count: 17,
    tools: {
        "data_operation": { name, description, inputSchema },
        "get_irrigation_details": { name, description, inputSchema },
        // ... all tools
    }
}
```

---

### 3. mcpEngineLoadInit()

**Purpose:** Load user-specific context and master prompts

**When to call:**
- Called automatically by `mcpEngineLogon()`
- Can be called manually to refresh user data

**Parameters:** None (uses current serverUrl + token)

**Side Effects:** Populates `MCP_ENGINE.userData` and `MCP_ENGINE.prompts`

**Returns:**
```javascript
{
    success: true,
    userData: {
        username: "stevep@sspnet.com",
        role: "admin",
        preferences: { defaultMode: "local", defaultTable: "steve" }
    },
    prompts: [
        "Show me all irrigation records for Ranch 1",
        "What plantings need water today?"
    ]
}
```

---

### 4. mcpEngineGetAvailableTools()

**Purpose:** Read-only access to loaded tool registry

**When to call:** Anytime after logon - for UI dropdowns, validation, display

**Parameters:** None

**Returns:** Complete tools object or `null` if not loaded

```javascript
const tools = mcpEngineGetAvailableTools();
// Returns:
{
    "data_operation": { name, description, inputSchema },
    "get_irrigation_details": { name, description, inputSchema },
    // ... all loaded tools
}

// Use for dropdown population:
Object.keys(tools).forEach(name => {
    dropdown.add(new Option(tools[name].description, name));
});
```

---

### 5. mcpEngineSend(toolName, params)

**Purpose:** Validate, stage, and send tool calls - THE WORKHORSE

**When to call:** Any button click, data fetch, CRUD operation

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| toolName | string | YES | Must exist in loaded tool registry |
| params | object | NO | Validated against tool's inputSchema |

**What it does:**
1. Validate `toolName` exists in `MCP_ENGINE.tools`
2. Validate `params` against tool's `inputSchema`
3. Build JSON-RPC 2.0 payload
4. POST to server
5. Return result

**Returns:** (varies by tool)

**Example - data_operation READ:**
```javascript
const result = await mcpEngineSend('data_operation', {
    action: 'read',
    table: 'steve'
});

// Returns:
{
    success: true,
    filepath: "steve.json",
    data: [
        { id: 1, ranch: "1", planting: "1A", hours: 1.3, ... },
        { id: 2, ranch: "1", planting: "1A", hours: 1.2, ... }
    ]
}
```

**Example - get_irrigation_details:**
```javascript
const result = await mcpEngineSend('get_irrigation_details', {
    plantingId: '456'
});

// Returns:
{
    success: true,
    data: [
        { irrigationId: 101, scheduledDate: "10/14/24", hours: 1.3, ... }
    ]
}
```

**Validation Failures (caught before server call):**
```javascript
// Missing required param:
const result = await mcpEngineSend('data_operation', {});
// Returns: { success: false, error: "Missing required param: action" }

// Tool not found:
const result = await mcpEngineSend('fake_tool', {});
// Returns: { success: false, error: "Tool not found: fake_tool" }
```

---

## Irrigation Component Integration

### The Staging Pattern

**irrigation-component** owns the staging layer - it builds parameter objects and hands them to `mcpEngineSend()`.

### Button Click Pattern

Each button click follows the same pattern:
1. User clicks button
2. Click handler in irrigation-component builds params object
3. Handler calls `mcpEngineSend(toolName, stagedParams)`
4. Result updates UI

### Example: Ranch Click → Get Plantings

```javascript
// In irrigation-component
function handleRanchClick(ranchId) {
    // 1. Stage the parameters
    const stagedParams = {
        ranchId: ranchId
    };
    
    // 2. Send via mcp-engine
    const result = await mcpEngineSend('get_plantings', stagedParams);
    
    // 3. Handle result
    if (result.success) {
        populatePlantingDropdown(result.data);
    } else {
        console.error('Failed to load plantings:', result.error);
    }
}
```

### Example: Planting Click → Get Irrigation Details

```javascript
// In irrigation-component
function handlePlantingClick(plantingId) {
    // 1. Stage
    const stagedParams = {
        plantingId: plantingId
    };
    
    // 2. Send
    const result = await mcpEngineSend('get_irrigation_details', stagedParams);
    
    // 3. Handle
    if (result.success) {
        fillGrid(result.data);
    }
}
```

### Example: Create Button → Create Next Irrigation

```javascript
// In irrigation-component
function handleCreateClick() {
    // 1. Stage - gather form data
    const stagedParams = {
        ranchId: selectedRanchId,
        plantingId: selectedPlantingId,
        scheduledDate: dateInput.value,
        hours: parseFloat(hoursInput.value)
    };
    
    // 2. Send
    const result = await mcpEngineSend('create_next_irrigation', stagedParams);
    
    // 3. Handle
    if (result.success) {
        refreshGrid();
        showSuccessMessage('Irrigation created');
    }
}
```

### Example: Update Button → Update Record

```javascript
// In irrigation-component
function handleUpdateClick(recordId) {
    // 1. Stage - get edited values
    const stagedParams = {
        id: recordId,
        action: 'update',
        table: 'steve',
        data: {
            hours: parseFloat(editedHours),
            appliedHours: parseFloat(editedApplied),
            notes: editedNotes
        }
    };
    
    // 2. Send
    const result = await mcpEngineSend('data_operation', stagedParams);
    
    // 3. Handle
    if (result.success) {
        refreshGrid();
        showSuccessMessage('Record updated');
    }
}
```

### The Irrigation Tool Chain

irrigation-component orchestrates a multi-step workflow using sequential tool calls:

```javascript
// Complete irrigation workflow
async function loadIrrigationWorkflow() {
    // Step 1: Get token (if needed)
    const tokenResult = await mcpEngineSend('get_token', {});
    
    // Step 2: Get ranches
    const ranchResult = await mcpEngineSend('get_ranches', {});
    if (ranchResult.success) {
        populateRanchDropdown(ranchResult.data);
    }
    
    // Step 3: User selects ranch → get plantings
    // (handled by click event)
    
    // Step 4: User selects planting → get irrigation details
    // (handled by click event)
}
```

---

## Complete Flow Examples

### Water Tools - Full Startup Flow

```javascript
window.onload = async function() {
    // 1. Initialize mcp-engine with embedded credentials
    const loginResult = await mcpEngineLogon(
        'stevep@sspnet.com', 
        'password', 
        'http://localhost:3101'
    );
    
    if (!loginResult.success) {
        alert('Failed to initialize: ' + loginResult.error);
        return;
    }
    
    console.log(`Engine armed - ${loginResult.toolCount} tools loaded`);
    
    // 2. Load steve.json using data_operation tool
    const dataResult = await mcpEngineSend('data_operation', {
        action: 'read',
        table: 'steve'
    });
    
    if (dataResult.success) {
        irrigationData = dataResult.data;
        read(); // Render grid
    } else {
        alert('Failed to load data: ' + dataResult.error);
    }
};
```

### Audit Que - Full Startup Flow

```javascript
window.onload = async function() {
    // 1. Initialize engine
    await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');
    
    // 2. Load irrigation.json
    const result = await mcpEngineSend('data_operation', {
        action: 'read',
        table: 'irrigation'
    });
    
    if (result.success) {
        irrigationData = result.data;
        read();
    }
};
```

### Server Switch Flow

```javascript
// User changes dropdown: Local ↔ Production
serverDropdown.addEventListener('change', async (e) => {
    const serverUrl = e.target.value === 'local'
        ? 'http://localhost:3101'
        : 'https://api.cropclient.com';
    
    // Re-initialize with new server
    await mcpEngineLogon('stevep@sspnet.com', 'password', serverUrl);
    
    // Tools and user data reloaded from new server
    console.log('Switched to', serverUrl);
    
    // Reload current data from new server
    const result = await mcpEngineSend('data_operation', {
        action: 'read',
        table: 'steve'
    });
    
    if (result.success) {
        irrigationData = result.data;
        read();
    }
});
```

### AI Provider Change Flow

```javascript
// User switches AI provider: Claude ↔ OpenAI
aiDropdown.addEventListener('change', async (e) => {
    const aiProvider = e.target.value; // 'claude' or 'openai'
    
    // Reload tools with new AI context
    await mcpEngineLoadTools();
    await mcpEngineLoadInit();
    
    console.log('AI provider changed to', aiProvider);
    // New prompts and context loaded
});
```

---

## Migration Guide

### Before (Old Pattern - Scattered callTool)

```javascript
// ❌ OLD - callTool scattered across files

// In irrigation-component:
async function callTool(toolName, params) {
    const response = await fetch(`${serverUrl}/tools/${toolName}`, {
        method: 'POST',
        body: JSON.stringify(params)
    });
    return await response.json();
}

// In HTML:
window.onload = async function() {
    // Direct fetch - no validation
    const result = await callTool('data_operation', {
        action: 'read',
        table: 'steve'
    });
    irrigationData = result.data;
    read();
};
```

**Problems:**
- No tool registry - can't validate
- No authentication flow
- callTool duplicated in multiple files
- No parameter validation
- Not using JSON-RPC 2.0 standard

### After (New Pattern - MCP-Engine 4.0)

```javascript
// ✅ NEW - Single engine, proper MCP flow

// window.onload - initialize engine once
window.onload = async function() {
    // Initialize with embedded credentials
    await mcpEngineLogon('stevep@sspnet.com', 'password', 'http://localhost:3101');
    // Tools loaded, validated, ready
    
    // Use mcpEngineSend - validated against registry
    const result = await mcpEngineSend('data_operation', {
        action: 'read',
        table: 'steve'
    });
    
    if (result.success) {
        irrigationData = result.data;
        read();
    }
};

// irrigation-component - no callTool, just staging
function handleRanchClick(ranchId) {
    const result = await mcpEngineSend('get_plantings', { ranchId });
    if (result.success) {
        populatePlantingDropdown(result.data);
    }
}
```

**Benefits:**
- ✅ Tool registry loaded from server
- ✅ Parameter validation before sending
- ✅ Proper authentication flow
- ✅ JSON-RPC 2.0 compliant
- ✅ ONE engine - no duplication
- ✅ Clear separation of concerns

---

## Reload Triggers

**When to reload tools:**

1. **User logs on** → `mcpEngineLogon()` auto-loads tools
2. **Server changes** → call `mcpEngineLogon()` with new serverUrl
3. **AI provider changes** → call `mcpEngineLoadTools()` + `mcpEngineLoadInit()`
4. **After server deployment** → call `mcpEngineLoadTools()` to get updated tools

**When NOT to reload:**
- Button clicks (use existing registry)
- Data saves (use existing registry)
- Grid refreshes (use existing registry)

---

## Critical Rules

### ✅ DO:
- Call `mcpEngineLogon()` ONCE at window.onload with embedded credentials
- Let irrigation-component stage parameters
- Use `mcpEngineSend()` for ALL tool calls
- Reload tools when server/AI changes
- Validate all params against tool schemas

### ❌ DON'T:
- Create multiple `callTool` functions
- Hardcode tool definitions
- Skip authentication
- Send tool calls without validation
- Bypass the engine for "simple" calls

---

## File Organization

```
Version 1/
├─ 2. Src=/
│  ├─ mcp-engine-4.0.js          ← Complete MCP client
│  ├─ irrigation-component-3.1.js ← Staging layer
│  └─ dashboard-component-x.x.js  ← UI rendering
├─ Crop-Client-MCP-Audit-Que-1.2-with3src.html  ← Harness
└─ 1. Task Lists/
   └─ MCP-Irrigation-Guide.md     ← This document
```

---

## Quick Reference Card

```javascript
// INITIALIZATION (once per app load)
await mcpEngineLogon('user', 'pass', 'http://localhost:3101');

// GET TOOLS (read-only registry)
const tools = mcpEngineGetAvailableTools();

// SEND TOOL CALL (validated + staged + sent)
const result = await mcpEngineSend('tool_name', { param1, param2 });

// RELOAD (server/AI change)
await mcpEngineLoadTools();
await mcpEngineLoadInit();
```

---

## Conclusion

MCP-Engine 4.0 transforms the irrigation workflow from scattered, unvalidated tool calls into a **proper MCP-compliant architecture** where:

- **Authentication is first** (embedded credentials grant system access)
- **Tools are loaded from server** (dynamic, not hardcoded)
- **Validation happens before sending** (catch errors early)
- **One engine handles all communication** (no duplication)
- **Staging happens in irrigation-component** (separation of concerns)

This architecture is **extensible, maintainable, and aligned with MCP best practices**.

---

**End of Guide**
