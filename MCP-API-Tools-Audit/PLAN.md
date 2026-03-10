# MCP-API-Tools-Audit — Development Plan

## Current State
- 3 core files working: APIServer.js, api-component.js, dashboard-component.js
- 8 API tools + 4 dashboard tools = 12 total MCP tools
- 3 modes: Airplane, Local, Server
- Versions v1.1 through v1.4 documented and snapshotted

## What's Next (in order)

### Step 1: Get v1.8.2 Folder Pushed
- Mac pushes the v1.8.2-restructure folder to this repo
- Validates all files landed correctly

### Step 2: Review v1.8.2 Changes
- Compare v1.8.2 against v1.4 to understand what changed
- Document any new tools, endpoints, or patterns
- Update CLAUDE.md if architecture shifted

### Step 3: Validate Tool Contracts
- Confirm all 12 tools have matching schemas in both MCP and HTTP
- Check input/output shapes match between api-component.js and APIServer.js
- Flag any mismatches

### Step 4: Test Readiness Check
- Verify APIServer.js starts clean on port 3101
- Confirm /ping, /tools, and /tools/{name} endpoints respond
- Check MCP stdio handshake works

### Step 5: Sync CLAUDE.md with Reality
- After v1.8.2 review, update CLAUDE.md to reflect actual current state
- Add any new tools, modes, or patterns discovered

---

## Phase 2: Implementation Plan (Detailed)

### Step 6: Clean API Component Extraction
**Goal**: api-component.js becomes a pure service module — zero DOM references.
- Every function takes JSON in, returns JSON out
- Remove any leftover `document`, `window`, `logToChat`, `showResult` calls
- One file that works identically in the browser AND inside Node.js on the server
- APIServer.js imports it, the browser page imports it — same code, same behavior
- Test: import in Node.js without errors, import in browser without errors

### Step 7: Dashboard CRUD Tools — Fully Wired
**Goal**: All 4 dashboard tools work end-to-end with the grid UI.

| Tool | What It Does |
|------|-------------|
| `create_next_irrigation` | Calculates next date from last record's interval + manager hours |
| `read_meter` | Finds most recent irrigation for selected ranch/planting, focuses water-applied field for data entry |
| `update_record` | Saves form values back to displayRecords, flags them status=-1 (pending sync) |
| `reset_table` | Reloads from cached API data or default JSON depending on data source |

- Each tool must update the grid display after it runs
- Each tool must return a clear JSON result (success/fail + what changed)

### Step 8: Sync Pipeline — Local Edits Back to CropManage
**Goal**: Field workers edit locally, then sync pending changes to CropManage.
- Every local edit gets marked `status: -1` (pending)
- `batch_post_queue` loops through all -1 records:
  - Record HAS `eventId` → it's an update → PUT to CropManage
  - Record has NO `eventId` → it's new → POST to CropManage
- Results come back with success/fail per record
- Grid reflects what synced and what didn't (visual feedback)
- Failed records stay at status=-1 for retry

### Step 9: Three Modes Locked Down
**Goal**: Each mode works correctly with no cross-contamination.

| Mode | Data Source | Network | Sync |
|------|-----------|---------|------|
| Airplane | Local sample JSON | None | Disabled |
| Local | Dev servers (:3100 dashboard, :3101 API) | LAN | Full pipeline |
| Server | Production (crop-client-services.com) | Internet | Full pipeline |

- Environment dropdown switches between modes
- Token management is separate per mode — browser token doesn't cross into MCP server token
- Airplane: all CRUD tools work, sync button hidden/disabled
- Local/Server: full pipeline including sync

### Step 10: Big Banana Test — End-to-End Validation
**Goal**: Prove the entire chain works start to finish.

**Test sequence:**
1. `get_token` → authenticate
2. `get_ranches` → list ranches
3. Pick a ranch → `get_plantings` → list plantings
4. Pick a planting → `get_irrigation_details` → data loads into grid
5. `create_next_irrigation` → new row appears in grid
6. `read_meter` → form focuses water-applied field
7. Enter meter data → `update_record` → record marked status=-1
8. `batch_post_queue` → pending records POST/PUT to CropManage
9. Verify data landed correctly in CropManage

**Pass criteria**: All 9 steps complete without manual intervention. Data round-trips correctly.

---

## Ground Rules
- One step at a time
- Steve approves before each step
- Snapshot before any code changes
- Plain English confirmations only
