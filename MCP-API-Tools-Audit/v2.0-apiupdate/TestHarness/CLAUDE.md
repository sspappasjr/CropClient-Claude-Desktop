# CropClient MCP API Tools Audit — CLAUDE.md
Updated: 3.6.2026


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

current version:  
C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v2.0-apiupdate\TestHarness
 harness app is             Test-Apiserver1.7.4.html


## What Is Next .... for George 
Move the bottom Prompt / AI / Ask button to the S1 section (top left on page)
make it the BOTTOM of just that top left sectioin ONLY .. carefully,.
it make more sense to be the tool that reponds to the buttons/token functions in S1 Section

lets tell what the plan is George.  
lets be very careful to keep the mcp tools working while plan for the aI


## What Is Done
- **test-apiserver1.7.4.html** — current working TEST harness
  - Chain fires on load, grid fills, AI prompt bar built, CRUD mini bar wired

---

## The Chain (proven)
Online → get_token → get_ranches → get_plantings → grid fills
      → get_irrigation_details → eventId → update_irrigation

---
---

## API Keys varified but not working in the harness app yet.
- **KarenKey** (Anthropic) — verified 3.5.2026 — see karen-install-test-plan.md
- **LillyKey** (OpenAI) — paste into ai-engine.js → lilly.apiKey

---

## Design Principles
- Selected record drives the right side. Always.
- The harness is the reference implementation. Engine never changes.
- KISS. One step at a time. Keep the working version working.

---

## Rules
- APIServer2.0.js — READ ONLY for AI. Never touch. Ever.
  Deploy path: source > bat > Alpha > git push > server pull > iisreset
- URL always uppercase in function/variable names that carry a URL.
- NO code without Steve's GOFORIT. Tell the plan first, wait for the signal.
- ONE small change at a time. Dot notation for file versions (1.7.4 not 174).
- Bash tools run on Linux — cannot access Windows paths directly.
- Daily napkins carry the history. CLAUDE.md carries the now.

---

## File Locations
- Harness:              v2.0-apiupdate/TestHarness/test-apiserver1.7.4.html
- Component:            v2.0-apiupdate/TestHarness/AIToolKit/Client-AI-Component.js
- Irrigation Component: v2.0-apiupdate/TestHarness/AIToolKit/irrigation-component.js  ← TO BE CREATED
- MCP Engine:           v2.0-apiupdate/TestHarness/AIToolKit/mcp-engine.js
- AI Engine:            v2.0-apiupdate/TestHarness/AIToolKit/ai-engine.js
- Napkin v4:            v2.0-apiupdate/TestHarness/.MyDailyNapkin.clientAI.v4.0.txt
- Server SOURCE:        C:\AICode\crop-client-services\api-server\APIServer2.0.js
- Saved data:           C:\AICode\crop-client-services\api-server\data\

---

## Deploy Path
source > bat > Alpha > git push > Server git pull > iisreset
web.config + web(version).config must always stay in sync
