# CropClient Claude Desktop Workspace

## Project Lead
Steve Pappas — Solution Architect, CEO, Designer. His word is final on all features, design, and priorities.

## Roles
- **Steve Pappas**: CEO, project lead, designer, all feature decisions
- **Claude Code (Opus)**: Lead programmer — builds what Steve specs
- **Claude Desktop**: UAT tester, analyst

## Rules
- NO code changes without Steve's approval
- NO stripping, removing, or restructuring without discussion first
- Present recommendations to Steve — he decides
- ONE small change at a time, per focused session
- DO NOT show code in chat — confirm what was done in plain English
- Use simple, concise language
- Version snapshots before making changes
- Surgical edits (str_replace) over full file regeneration
- Always use RELATIVE paths from pages/ folder where applicable

## Repository Overview

This is the **CropClient Claude Desktop** workspace — a multi-component agricultural technology platform. Three main projects live here:

| Folder | Purpose |
|--------|---------|
| `Crop-Client-Github-Butler/` | Browser-based GitHub repo manager |
| `MCP-API-Tools-Audit/` | MCP + HTTP API server infrastructure and tool extraction |
| `Page-Factory/` | Modular page builder with marker-preserving injection |

## Technology Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript — no frameworks, self-contained HTML files
- **Backend**: Node.js with Express, CORS, readline (for MCP stdio)
- **Protocol**: MCP (Model Context Protocol) v2024-11-05, JSON-RPC 2.0
- **APIs**: GitHub REST API, CropManage API (v2/v3)
- **Auth**: GitHub Personal Access Tokens via sessionStorage (never hardcoded)
- **Storage**: JSON files → MongoDB → SQL Server (evolution plan)

## Project Details

### Crop-Client-Github-Butler
GitHub Butler — a menu-driven browser UI for managing GitHub repos. Single self-contained HTML file.

**Key files:**
- `CropClient-Github-Butler.html` — active v1.1 app (login, browse repos, view files, create repos)
- `butler-commands.json` — MCP command schema (contract between Butler UI and Claude Code skills)
- `github-processes.md` — documented git operation tokens (INIT, CONFIG, STAGE, COMMIT, PUSH, etc.)
- `OurCropClientState.md` — comprehensive project state, architecture, and data structures
- `HOW-TO-USE-BUTLER.txt` — end-user guide
- `v1.0/`, `v1.1/`, `more/`, `zips/` — version snapshots and archives

**Current state (v1.1):** Login/Logout with PAT, real repo listing, file/folder browsing, file viewer, create repos. Grid/List toggle and Pull/Push/Sync not yet wired.

### MCP-API-Tools-Audit
Core infrastructure for MCP tool integration and API bridging.

**Key files:**
- `APIServer.js` — Main MCP stdio + HTTP bridge server (port 3101). 8 API integration tools for auth, fetch, POST, UPDATE, batch ops
- `api-component.js` — Clean API service (JSON + API calls only, NO DOM code). CropManage API integration
- `dashboard-component.js` — Portable irrigation dashboard with MCP tool registry. Three modes: Airplane (local), Local (port 3100), Server (production)
- `README-API-COMPONENT.md` — Architecture guide for component extraction/injection
- `NAPKIN_MCP_Execute_Mechanics.txt` — Technical notes on /mcp/execute flow
- `v1.1-restructure/` through `v1.4-restructure/` — evolution versions with task lists
- `Versioning/` — historical snapshots (v1–v4) with README docs

**Architecture pattern:** API logic is cleanly separated from DOM/UI code. Components are extracted, then injected into target pages via the MCP tool registry.

### Page-Factory
Modular page builder with marker-preserving component injection.

**Key files:**
- `PageBuilder-Skills.html` — main builder app (template loader, component upload, marker detection, injection engine, preview iframe)
- `CropClient-Live-Chat.html` — main template shell
- `CropClient-Live-Chat-S1.html` through `S4.html` — section components (Tool Center, Chat Log, Data Grid, Detail Form)
- `CropClient-Live-Chat-Script.html` — working MCP tools (testCreateNext, testReadMeter, etc.)
- `VALIDATOR-CODE-PLAN.md` — comprehensive validation system blueprint (pre/post injection)
- `DailyNapkin.md` — session notes and architecture discoveries
- `DailyStatus.md` — progress reports

**Key pattern — Marker-Preserving Injection:**
Components are wrapped with `<!-- @@@@@@ BEGIN: X @@@@@@ -->` / `<!-- @@@@@@ END: X @@@@@@ -->` markers. First injection wraps content; re-injection replaces content while keeping markers intact. This enables infinite re-injection capability.

**Allware Architecture:** 2x2 grid quadrants — Tool Control Center, AI Chat Log, Data Grid, Detail Form.

## Key Architectural Patterns

1. **Marker-Preserving Injection** — Components wrapped with BEGIN/END markers for infinite re-injection
2. **Component Separation** — API logic extracted from UI/DOM code into pure service modules
3. **MCP Tool Registry** — Routes commands to correct server (dashboard vs API server)
4. **Field Replace Algorithm** — Proprietary case-insensitive placeholder substitution ({ranch}, {planting}, etc.)
5. **Dual Storage Strategy** — JSON files → MongoDB → SQL Server migration path
6. **Single-File Apps** — Butler and PageBuilder are self-contained HTML files with zero external dependencies

## Development Workflow

1. **Before changes**: Create a version snapshot
2. **Making changes**: One small change at a time, surgical edits only
3. **After changes**: Confirm what was done in plain English (no code display)
4. **Git tokens**: Use documented processes from `github-processes.md` (INIT, GITIGNORE, CONFIG, STAGE, COMMIT, CREATE-REPO, ADD-REMOTE, PUSH)
5. **Testing**: Verify in browser for HTML apps; verify MCP tool calls for server components

## File Conventions

- HTML apps are **self-contained** — all CSS/JS inline, no external dependencies
- Documentation lives alongside code in each project folder
- Version snapshots go in numbered subdirectories (v1.0/, v1.1/, etc.)
- WIP and experimental work goes in `WIP/` folders
- Archives go in `zips/` folders
- Napkin/notes files capture design thinking and session discoveries

## Environment

- **Dev root**: `C:\AICode\` (Steve's machine)
- **Repos at**: `C:\AICode\{repo-name}`
- **This workspace**: `C:\AICode\CropClient-Claude-Desktop`
- **GitHub user**: sspappasjr
- **Production domain**: crop-client-services.com

## .gitignore
```
node_modules/
.env
*.log
nul
```
