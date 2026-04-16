# MCP-Audit-Que

## What Is This
CropClient MCP engine audit and fix project. Every API call from the client to CropManage
must go through the MCP integrated pair: client → mcpEngineSend → server → makeRequest → CropManage.
if statement when MCP else fallback to direct fallback. recommends are missing token 

## Current State
- Version 1 client (1.2.html): all bare fetch replaced with mcpEngineSend ✅
- Version 1 client: all direct fallbacks removed ✅
- Server (APIServer3.0.js): needs get_event_recommendation tool added
- Research task active: verifying CropManage API metadata before building tool

## Architecture
```
CLIENT (browser)                SERVER (Node.js)              CROPMANAGE (UC Davis)
  |                               |                               |
  |-- mcpEngineSend ------------->|                               |
  |   (tool name + params)        |-- makeRequest --------------->|
  |                               |   (hostname + path + auth)    |
  |                               |<-- response ------------------|
  |<-- { displayRecords } --------|                               |
  |                               |                               |
  |-- renderTable()               |                               |
```

## Folder Structure
```
MCP-Audit-Que/
├── CLAUDE.md              ← project context for AI sessions
├── README.md              ← this file
└── Version 1/
    ├── 1. Task Lists/
    │   ├── History/       ← completed tasks
    │   ├── Plan/          ← approved plans with before/after code
    │   └── Research-*.txt ← active research tasks
    ├── 2. Src=/
    │   ├── APIServer3.0.js           ← harness server (editable)
    │   ├── api-component-2.0.js      ← inline APISERVICE block
    │   ├── irrigation-component-2.0.js
    │   ├── mcp-engine.js
    │   └── Inserts/                  ← injectable code blocks
    ├── 3. Results/        ← test outputs, screenshots
    ├── 4. Next/           ← future planning docs
    ├── Crop-Client-MCP-Audit-Que-1.1.html
    └── Crop-Client-MCP-Audit-Que-1.2.html
```

## Workflow
Task → Plan → Approval (GOFORIT) → Code → Test → Results

## Related Projects
- Test-ApiServer (sibling in Crop-Client-Wip) — Mac's 1.93 harness for tool testing
- api.cropclient.com — deployed server (READ ONLY, APIServer2.5.js)
- api-component.js — deployed metadata list (crop-client-services/api-server/)
