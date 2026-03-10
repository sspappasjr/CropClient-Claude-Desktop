# Napkin v1 — Make CRUD Tokens MCP Ready
Date: 3.7.2026

## Purpose
Extract 5 CRUD irrigation tokens from v1.6 harness into irrigation-component.js — token logic, tools registry, and tool caller — ready for MCP injection.
Then wire them through the MCP engine so they run online through api.cropclient.com — same as the API chain. Demo ready.

## Source
CropClient-MCP-API-Tools-Audit-Q-v1.6.html (v1.6-restructure/)

## Three Code Boundaries to Extract

### 1. Token Logic (v1.6 ~lines 771–1014)
Between `@@@@ IRRIGATION_COMPONENT v1.1` markers.
Pure functions — params in, `{ returnCode, statusMessage, data }` out. No DOM.

- parseEventDate, formatDate (date helpers)
- testCreateNext (ranch, planting, records)
- resetTable (sourceData, targetRecords, dataSourceFlag)
- testReadMeter (ranch, planting, records)
- updateRecord (recordId, patch, records)
- saveDisplay (records)
- retrieveDisplay (jsonData, targetRecords)

### 2. MCP Tools Registry (v1.6 ~lines 1047–1248)
`const mcpTools = { ... }` — 6 tool definitions with name, description, inputSchema, and handler.
Handlers bridge the UI to the pure token functions:
- create_next_irrigation → testCreateNext
- reset_table → resetTable
- read_meter → testReadMeter
- update_record → updateRecord
- save_display → saveDisplay
- retrieve_display → retrieveDisplay

Each handler: reads UI state → calls pure function → refreshes UI → returns result.

### 3. MCP Tool Caller (v1.6 ~lines 1251–1263)
`function callTool(toolName, params)` — looks up tool in registry, logs it, calls handler.

## Wire Through Both Engines

### MCP Engine
After the CRUD tokens work standalone, route them through:
  mcpEngineStaging(target, toolName, params) → mcpEngineSend(staged)

Same URL preset pattern as the API chain (local/production).
CRUD tools become real MCP tools hitting api.cropclient.com — not just local functions.
This is what makes the demo real.

### AI Engine
Include the AI engine (Karen/Lilly) in the component — it's part of the toolkit.
Don't wire AI assist until after it works in test-apiserver. That's our process:
build it in the harness first, prove it works, then use it.

## Target File
v2.0-apiupdate/TestHarness/AIToolKit/irrigation-component.js

## Steps
1. Extract pure token functions into irrigation-component.js
2. Extract tools registry and tool caller
3. Create test-apiserver1.8.html from v1.6 — it has the CRUD buttons
4. Wire irrigation-component.js into v1.8 — replace inline code with component
5. Test v1.8 — same CRUD buttons must still work
6. Wire CRUD tools through mcp-engine with URL preset
7. Test online through api.cropclient.com — demo ready

## Rules
- NO DOM in the token logic. DOM stays in the handler/harness.
- Every pure function: params in → { returnCode, statusMessage, data } out.
- returnCode 0 = success, negative = error.
- Same function names as every harness since day one.
- Build it in the harness. It goes nowhere until it works.
- One step at a time. GOFORIT required before code.
