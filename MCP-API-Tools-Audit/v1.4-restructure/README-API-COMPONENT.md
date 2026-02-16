# CropClient API Server Component Guide (v1.2)

## Overview

This guide describes how the **CropClient Dashboard** (browser) and **APIServer1.2** (Node/MCP) share the same rules:

- **Dashboard owns UI + lifecycle** (onload, buttons, rendering)
- **APISERVICE / Server tools return JSON only** (no DOM)

It also documents how to **install and run APIServer1.2.js**, including the new **server-side JSON save/retrieve tools**.

---

## Core Principle

**APISERVICE / MCP Tools = JSON + API calls ONLY**

- No DOM calls (`document`, `window`, `innerHTML`, etc.)
- No UI logic
- No HTML / `<script>` blocks
- Inputs are explicit; outputs are JSON

The calling component (Dashboard UI) handles all rendering using JSON returned by tools.

---

## What’s New in v1.2

APIServer1.2 now includes **JSON File Services** (server-side persistence):

- Write/read/update/delete JSON files under a single data directory
- Safe pathing (no `..` traversal, no writing outside the data directory)
- Works both via:
  - MCP tools (`json_write`, `json_read`, …)
  - Optional HTTP endpoints (`/api/json/*`)

This is intended as your first “shared truth store” for dashboards when you want server persistence.

---

## File Locations (example)

| File | Purpose |
|------|---------|
| `CropClient-MCP-API-Tools-Audit-Q-v1.2.html` | Browser app (Dashboard) |
| `api-component1.2.js` | Stateless API helper (browser + server) |
| `APIServer1.2.js` | MCP server + HTTP bridge (Port 3101) |
| `data/` (folder) | Server JSON persistence directory (default) |

> You can override the data folder with the `CROPCLIENT_DATA_DIR` environment variable.

---

## Install & Run (APIServer1.2.js)

### Prerequisites

- Node.js: **v22.21.0** (or any Node that supports your dependencies)
- NPM installed

### 1) Create a server folder (recommended)

Example:
```
crop-client-services/
  api-server/
    APIServer1.2.js
    api-component1.2.js   (optional, if you use it)
    package.json
```

### 2) Install dependencies

From the folder that contains `APIServer1.2.js`:

```
npm init -y
npm install express cors
```

> `https` and `readline` are built into Node and do not need installation.

### 3) Run the server

Default (writes JSON files to `./data`):
```
node APIServer1.2.js
```

Optional: set a custom JSON data directory:

- Windows PowerShell:
```
$env:CROPCLIENT_DATA_DIR="C:\AICode\cropclient-data"
node APIServer1.2.js
```

- macOS/Linux:
```
export CROPCLIENT_DATA_DIR="$HOME/cropclient-data"
node APIServer1.2.js
```

### 4) Verify server is running (HTTP)

- Health check:
```
GET http://localhost:3101/ping
```

- List tools:
```
GET http://localhost:3101/tools
```

---

## Existing CropManage Tools (APIServer1.2)

These are already present in `APIServer1.2.js`:

- `get_token` (username/password → token stored server-side)
- `get_ranches`
- `get_plantings` (requires `ranchGuid`)
- `get_irrigation_details` (requires `plantingId`)
- `load_into_displayRecords` (optional `plantingId`, returns displayRecords)
- `post_new_irrigation`
- `update_irrigation`
- `batch_post_queue`

---

## New JSON Save/Retrieve Tools (Server-side)

### MCP Tool Names

- `json_write({ filepath, data })`
- `json_read({ filepath })`
- `json_update({ filepath, updates })`
- `json_delete({ filepath })`
- `json_list({ directory })`
- `json_exists({ filepath })`
- `data_operation({ action, table, data })` → maps to `<table>.json`

### Where files are stored

All JSON writes are sandboxed under:

- Default: `./data/`
- Override: `CROPCLIENT_DATA_DIR`

Example:

- `json_write({ filepath: "irrigation.json", data: {...} })`
  writes to:
  - `./data/irrigation.json` (or `CROPCLIENT_DATA_DIR/irrigation.json`)

### HTTP endpoints (optional)

If you want to test without MCP, APIServer1.2 also exposes:

- `POST /api/json/write` body: `{ filepath, data }`
- `GET  /api/json/read?filepath=irrigation.json`
- `PATCH /api/json/update` body: `{ filepath, updates }`
- `DELETE /api/json/delete?filepath=irrigation.json`
- `GET /api/json/list?directory=.`
- `GET /api/json/exists?filepath=irrigation.json`
- `POST /api/json/data-operation` body: `{ action, table, data }`

---

## Recommended Workflow (v1.2)

### Browser (Dashboard)

1. Dashboard gets token / calls API as needed.
2. Dashboard renders grids/forms.
3. Dashboard may save “truth” locally (localStorage) or call server JSON tools when you want central persistence.

### Server (APIServer1.2)

1. Runs CropManage API tools (heavy lifting).
2. Runs JSON File Services for persistence when you enable it.

---

## Troubleshooting

| Problem | Cause | Fix |
|--------|-------|-----|
| `Cannot find module 'express'` | deps not installed | `npm install express cors` |
| Port 3101 in use | another process using it | stop other process or change `PORT` in `APIServer1.2.js` |
| JSON save says “outside data directory” | unsafe path | use relative paths like `irrigation.json` or `tables/users.json` (no `..`) |
| `No token available` | token not acquired | call `get_token` first |
| MCP tool not found | wrong name | check `GET /tools` output |

---

## Notes on “Component Extraction”

You can still use marker-based extraction (`@@@@ ... @@@@`) for change control.

**Important:** anything injected into `APIServer1.2.js` must be **pure Node JS** (no `<script>`).

---

*Last Updated: February 5, 2026*
*CropClient MCP API Server v1.2*
