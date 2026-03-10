# George — Client-AI-Component Plan

## What This Is
The Client-AI-Component takes over and extends the existing tools.
Same tokens, same server, same fetch. Nothing breaks — it wraps what works.

## What You Have (keep it)
Your test-apiserver v1.7 is the gold standard.
Your JsonCrudAPI.js stays untouched.
Your 3 clientAI modules (presets, staging, send) are the foundation.

## What's Being Added (on top of yours)
Three ai-engine modules that send prompts instead of button clicks:
- ai-engine-send — sends grower's question + tool list to OpenAI
- ai-engine-reader — reads the response, answer or tool call?
- ai-engine-router — calls YOUR mcp-engine-send, sends result back to AI

ai-engine.js is in AIToolKit next to your JsonCrudAPI.js.

## Watch Out For
1. **Don't replace your fetch engine** — ai-engine-router CALLS it, doesn't replace it
2. **sendCustomCall stays the same** — the router hands it a tool name + params, same as a button click
3. **Tool definitions must match APIServer2.0.js** — if a token name changes on the server, it has to change in the tool list too
4. **get_token always first** — the AI is trained to call get_token before anything else, same as the manual flow
5. **The CRUD buttons still work** — buttons and AI prompts are two doors to the same room

## Component Contents (when done)
- mcp-engine (your 3 modules) — presets, staging, send
- ai-engine (3 new modules) — send, reader, router
- 7 JSON tokens from APIServer2.0.js
- 2 Save/Restore (APIServer 2.1)
- 5 CRUD (Create, Read/Reset, Apply, Update, Delete)
- All under one name: **Client-AI-Component**

## Step 1 — Your First Move
Use ai-engine.js in your test-apiserver v1.7 to practice sending prompts.
The wrapper is ready: **Client-AI-Component.js** in AIToolKit.
Wire it in, test the prompt-to-token loop, prove it works for real.

## Files in AIToolKit
- **Client-AI-Component.js** — the whole package (mcp-engine + ai-engine + JSON + CRUD + placeholders)
- **ai-engine.js** — standalone ai-engine if you want just the prompt modules
- **JsonCrudAPI.js** — your JSON CRUD source (untouched)
- **GEORGE-NOTE-ClientAI.md** — this file

## The Rule
APIServer2.0.js is the source of truth. Always.
