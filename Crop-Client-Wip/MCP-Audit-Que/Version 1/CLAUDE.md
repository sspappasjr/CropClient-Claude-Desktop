# MCP-Audit-Que Version 1 — CLAUDE.md
# Updated: 2026-04-14

## STATUS: v4.0 Complete MCP Server — RELEASED

All files versioned as matched set. Committed and pushed to GitHub main.

---

## Active src= Files (Version 1 / 2. Src=)

| File | Role |
|------|------|
| `mcp-engine-4.0.js` | MCP transport — mcpEngineCallTool, mcpEngineRegisterTool, mcpStaging |
| `irrigation-component-4.0.js` | 7 local CRUD tools — registers into mcp-engine on load |
| `api-component-4.0.js` | CropManage API tools (token, ranches, plantings, post, update) |
| `APIServer4.0.js` | Node server — port 3101, 22 tools (API:10, JSON:7, Irrigation:5) |
| `json-component-4.0.js` | Source reference only — NOT required by server (backup/docs) |

## Active HTML Files (Version 1)

| File | Purpose |
|------|---------|
| `Crop-Client-MCP-Audit-Que-4.0.html` | Audit Que app |
| `CropClient-MCP-Water-Tools-Demo-4.0.html` | Water Tools demo |

---

## Architecture

- **mcp-engine** is the single entry point — `mcpEngineCallTool(toolName, params)`
- **Routing**: server tools → mcpStaging (network); irrigation CRUD → local handler
- **Registration**: irrigation-component registers its 7 tools into mcp-engine on load
- **APIServer** also has all 22 tools registered server-side for online mode
- **The chain**: CRUD modifies JSON grid → marks status:-1 → AI reviews → post pushes to API

## Tool Counts

- API tools: 10
- JSON tools: 7
- Irrigation tools: 5
- **Total: 22**

---

## Load Order (HTML src=)

1. `mcp-engine-4.0.js` — must load first
2. `irrigation-component-4.0.js` — registers into mcp-engine
3. `api-component-4.0.js` — CropManage API tools

---

## Rules

- All 4.0 files are a matched set — version together
- One change at a time — no code without Steve approval
- irrigation CRUD is JSON-only (in-browser grid, not server)
- json-component-4.0.js is source backup — do NOT add require() to server

---

## History

Old versions archived in `2. Src=/History/`:
- APIServer3.3.js, 3.4.1.js, 3.4.2.js
- api-component-3.4.js, 3.4.1.js, 3.4.2.js
- irrigation-component-3.0.js
