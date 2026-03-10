# CropClient MCP API Tools Audit — CLAUDE.md
Updated: 3.9.2026

## Team
- **Steve (Coach)** — CEO / Architect / Designer. His word is final.
- **George** — AI / Developer / Analyst.
- **Mac** — Project Lead
- **Gus** — Best Buddy Genius / Local LLM
- **Lilly** — AI Assistant (OpenAI gpt-4o) — production provider
- **Karen** — AI Assistant (Anthropic claude-sonnet-4-20250514) — alternate provider

---

## What This App Is
MCP API Tools Audit — harness app to test CropClient's APIServer tokens.
CropManage API serves the grower community with irrigation and water budget data
from UC Agriculture. Server is live at api.cropclient.com.
15 tools active: 8 CropManage API + 7 JSON file tools.

## What Is Next — Rebuild from Truth
APIServer2.0.js is the source of truth. The APISERVICE_COMPONENT got disconnected from the server when a previous AI session rewrote it to call CropManage directly instead of going through the server's tools. We rebuild it from the truth, test in the harness, then export forward.

See plan: `.claude/plans/fuzzy-hugging-meerkat.md`

---

## The Chain (proven)
Online → get_token → get_ranches → get_plantings → grid fills
      → get_irrigation_details → eventId → update_irrigation

## Design Principles
- Selected record drives the right side. Always.
- The harness is the reference implementation. Engine never changes.
- KISS. One step at a time. Keep the working version working.

## Rules
- APIServer2.0.js — READ ONLY for AI. Never touch. Ever.
- NO code without Steve's GOFORIT. Tell the plan first, wait for the signal.
- ONE small change at a time. Dot notation for file versions (1.7.4 not 174).
- @@@@ = components, @@@ = sub-components inside a component
- Daily napkins carry the history. CLAUDE.md carries the now.

## File Locations
- Audit v1.8.2:         v1.8-restructure/CropClient-MCP-API-Tools-Audit-Q-v1.8.2.html
- Irrigation Component: v1.8-restructure/irrigation-component.1.1.js
- MCP Engine (source):  v1.8-restructure/mcp-engine.js
- AI Engine (source):   v1.8-restructure/ai-engine.js
- Server SOURCE:        C:\AICode\crop-client-services\api-server\APIServer2.0.js
- Saved data:           C:\AICode\crop-client-services\api-server\data\

## Deploy Path
source > bat > Alpha > git push > Server git pull > iisreset
web.config + web(version).config must always stay in sync
