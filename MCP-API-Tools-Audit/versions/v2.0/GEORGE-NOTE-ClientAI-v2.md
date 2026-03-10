# George — Client-AI-Component Plan v2
## Updated: 3.5.2026 — George + Steve session

---

## What This Is
The Client-AI-Component takes over and extends the existing tools.
Same tokens, same server, same fetch. Nothing breaks — it wraps what works.

---

## What You Have (keep it — do not touch)
- test-apiserver v1.7.2 is the gold standard cockpit harness
- All 15 tool buttons, SEND, grid, log, Save/Restore — untouched
- JsonCrudAPI.js stays untouched
- 3 clientAI modules (presets, staging, send) are the foundation
- ai-engine.js is ready in AIToolKit

---

## What's Being Added — Step 1 (Wire + Verify)

### New file: test-apiserver1.7.3.html

Three things added to v1.7.2 — nothing removed:

**1. Embed ai-engine functions inline in the script block**
- `aiEngineSend` — sends prompt + tool list to OpenAI
- `aiEngineReader` — reads response: answer or tool call?
- `aiEngineRouter` — loops tool calls back through mcp-engine until final answer
- No file import. Self-contained in the HTML. KISS.

**2. Add `sendCustomCallDirect(toolName, params)`**
- Same fetch logic as existing `sendCustomCall()`
- Takes parameters directly — no DOM reads
- Returns the result object for the router to use
- The router calls THIS, not the UI version

**3. Add AI Prompt Panel — bottom of the top-left quad**
- Clearly separated from existing buttons with a section label
- OpenAI API Key input (password type)
- Prompt textarea
- ASK LILLY button
- Results flow into the SAME message log and data grid — no new layout

---

## What "It Worked" Looks Like on the Desktop

Grower types: *"Show me the ranches for steve"*
Clicks **ASK LILLY**

**Message Log shows:**
```
→ Lilly thinking...
→ Lilly calling: get_token
✅ get_token: SUCCESS
→ Lilly calling: get_ranches
✅ get_ranches: SUCCESS
✅ Lilly: "Here are your ranches: [ranch name]..."
```

**Data Grid populates** with ranch data — exactly as if you'd clicked the buttons manually.

That is the proof. Prompt in → tokens called → data on screen.

---

## Watch Out For (same rules, now clearer)

1. **Don't replace `sendCustomCall()`** — `sendCustomCallDirect()` is a parallel function, not a replacement
2. **Router calls `sendCustomCallDirect`** — UI buttons still call `sendCustomCall` — two doors, same room
3. **Tool definitions must match APIServer2.0.js** — tool names in the AI tool list must be exact
4. **get_token always first** — the AI system prompt instructs this; same as manual flow
5. **CRUD buttons still work** — untouched, unchanged, always

---

## Step 2 — After Step 1 Passes (do not start until Steve says go)

Wire the full prompt-to-token loop for ALL 22 tools:
- 8 API tokens
- 7 JSON tokens
- 2 Save/Restore (APIServer 2.1)
- 5 CRUD operations

Prove the loop works for a real grower workflow:
*"Show me irrigation records for my Lompoc ranch"*
→ get_token → get_ranches → get_plantings → get_irrigation_details → plain English answer

---

## Component Contents (when done — future)
- mcp-engine (3 modules) — presets, staging, send
- ai-engine (3 modules) — send, reader, router
- 7 JSON tokens from APIServer2.0.js
- 2 Save/Restore (APIServer 2.1)
- 5 CRUD (Create, Read/Reset, Apply, Update, Delete)
- All under one name: **Client-AI-Component**

---

## Files in AIToolKit
- **Client-AI-Component.js** — the whole package (mcp-engine + ai-engine + JSON + CRUD + placeholders)
- **ai-engine.js** — standalone ai-engine prompt modules
- **JsonCrudAPI.js** — JSON CRUD source (untouched)
- **GEORGE-NOTE-ClientAI.md** — original plan
- **GEORGE-NOTE-ClientAI-v2.md** — this file (updated plan)

---

## The Rules
- APIServer2.0.js is the source of truth. Always.
- No code without Steve's GOFORIT.
- One step at a time. Step 1 must pass before Step 2 begins.
- KISS — embed, don't import. Add, don't replace.
