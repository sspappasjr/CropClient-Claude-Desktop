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

## Ground Rules
- One step at a time
- Steve approves before each step
- Snapshot before any code changes
- Plain English confirmations only
