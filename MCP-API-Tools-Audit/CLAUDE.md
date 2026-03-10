# MCP-API-Tools-Audit — CLAUDE.md

## What This Is
MCP + HTTP bridge server for CropManage irrigation APIs. Exposes agricultural data tools via both MCP (for Claude Desktop) and REST endpoints (for browser/testing).

## Project Lead
Steve Pappas — all feature decisions go through him.

## Rules
- NO code changes without Steve's approval
- ONE small change at a time
- Surgical edits only (str_replace over full rewrites)
- Version snapshot before making changes
- Confirm changes in plain English — no code dumps in chat

## Architecture (3 Files)

| File | What It Does |
|------|-------------|
| `APIServer.js` | Main server (port 3101). MCP stdio + Express HTTP. 8 CropManage API tools |
| `api-component.js` | Pure API logic — no DOM, no UI. Works in browser AND Node.js |
| `dashboard-component.js` | Dashboard CRUD tools (create, read, update, reset). Routes commands via MCP registry |

## Tech Stack
- **Runtime**: Node.js with Express
- **Protocol**: MCP v2024-11-05, JSON-RPC 2.0
- **API**: CropManage REST API (v2/v3), OAuth token auth
- **Frontend**: Vanilla HTML/CSS/JS — no frameworks
- **Storage**: JSON files (evolving to MongoDB → SQL Server)

## The 8 API Tools (APIServer.js)
1. `get_token` — authenticate with username/password
2. `get_ranches` — fetch all ranches
3. `get_plantings` — fetch plantings for a ranch
4. `get_irrigation_details` — fetch irrigation events
5. `load_into_displayRecords` — fetch + transform for grid display
6. `post_new_irrigation` — POST new irrigation event
7. `update_irrigation` — PUT existing irrigation event
8. `batch_post_queue` — process all pending records (status=-1)

## The 4 Dashboard Tools (dashboard-component.js)
1. `create_next_irrigation` — calculate next event from last record's interval
2. `reset_table` — reload from API cache or default JSON
3. `read_meter` — prep form for field worker water readings
4. `update_record` — save form values, mark status=-1 for sync

## 3 Operating Modes
- **Airplane** — local only, no servers
- **Local** — dashboard on :3100, API on :3101
- **Server** — production at crop-client-services.com

## Key Patterns
- **Dual Access**: Every tool works via MCP (Claude Desktop) AND HTTP (`/tools/{name}`)
- **No DOM in API code**: Tools return JSON; UI renders it separately
- **Status Queue**: Records with `status: -1` = pending sync. `batch_post_queue` processes them
- **Tool Registry**: Routes commands to correct server (dashboard vs API)
- **Component Extraction**: API logic extracted from UI via `@@@@ markers @@@@`

## HTTP Endpoints
```
GET  /ping              → health check
GET  /tools             → list all tools
POST /tools/{toolName}  → call a tool with JSON args
```

## Data Flow
```
Auth → get_token
Read → get_ranches → get_plantings → get_irrigation_details
Transform → load_into_displayRecords (API format → grid format)
Edit → create/read/update via dashboard tools (local)
Sync → batch_post_queue (push status=-1 records to CropManage)
```

## Version History
- `v1.1` — component cleanup, marker boundaries defined
- `v1.2` — JSON persistence tools added (json_write, json_read, etc.)
- `v1.3` — environment modes (local/online/offline)
- `v1.4` — production deployment prep, "Big Banana Test"
- `versions/v1-v4` — historical snapshots

## Development Workflow
1. Snapshot current version
2. Make one small surgical edit
3. Test (browser for UI, tool calls for server)
4. Confirm what changed in plain English
5. Commit with clear message
