# PLAN: Create Large Prompt Code for AI Engine
# Version 1 — 4. Next folder
# Date: 2026-03-29

## WHAT THIS IS
Design the master system prompt that Kit (initAI / Tool 0) sends to the AI engine
on page load. This is the three-part envelope that briefs the AI with everything
it needs to understand the CropClient platform.

## THE THREE-PART ENVELOPE

### Part 1: Master System Prompt
- Who you are: George, CropClient AI assistant
- What you do: help field workers manage irrigation schedules
- How you work: natural language commands → MCP tool calls → displayRecords → grid
- Rules: all calls through mcpEngineSend, no bare fetch, no direct fallback
- Tone: friendly field worker language, not developer speak

### Part 2: MCP Tool Schemas (all registered tools)
The AI needs to know every tool it can call:
1. get_token — authenticate with CropManage
2. get_ranches — fetch all ranches
3. get_plantings — fetch plantings for ranch (by GUID)
4. get_irrigation_details — fetch irrigation events + recommendations → displayRecords
5. get_event_recommendation — fetch single event recommendation (NEW)
6. load_into_displayRecords — transform events to grid format
7. post_new_irrigation — POST new irrigation event
8. update_irrigation — UPDATE existing irrigation event
9. batch_post_queue — process all pending records
10. json_write — write JSON file on server
11. json_read — read JSON file from server
12. json_update — update JSON file (shallow merge)
13. json_delete — delete JSON file
14. json_list — list JSON files in directory
15. json_exists — check if JSON file exists
16. data_operation — generic JSON table CRUD

Each schema includes: name, description, inputSchema (properties, types, required)

### Part 3: Client Context Block
- Current ranch selection (name, ID, GUID)
- Current planting selection (name, ID)
- Current displayRecords count
- Current data source (json or api)
- Current connection mode (local, online, offline)
- Server URL (localhost:3101 or api.cropclient.com)
- Token status (has token or not)

## WHERE IT LIVES
- prompts.json in Support folder (Crop-Client-AI-Assist/Support/prompts.json)
- Two records already exist: OnLoad-Token-DropDowns and All-Irrigations
- Add new record: Kit-System-Prompt (the master envelope)
- Created the SAME WAY the other two prompts were created — same JSON record format
- Same structure: id, name, description, prompt text, placeholders
- It's an ADD to prompts.json, not a replacement

## HOW IT FIRES
- initAI() runs on page load (after token + ranches + plantings loaded)
- Reads Kit-System-Prompt from prompts.json
- Replaces placeholders with current context (ranch name, planting ID, etc.)
- Sends to AI provider (Claude via Karen, or OpenAI via Lilly)
- AI is now briefed and ready to take natural language commands

## DESIGN PRINCIPLES
- Prompt is DATA not CODE — stored in prompts.json, editable without deploy
- Context block updates each session — AI always knows current state
- Tool schemas are the source of truth — AI can only call what's registered
- Component factory pattern — swap prompts.json for any vertical (clinical, inventory)
- KISS — one prompt, three parts, clear separation

## DEPENDENCIES
- APIServer2.5.2.js with all 16 tools registered
- mcp-engine.js loaded on client
- ai-engine2.5.js with initAI() and aiState
- prompts.json in Support folder

## NEXT STEPS
1. Write the master system prompt text
2. Write the 16 tool schemas in JSON format
3. Write the context block template with placeholders
4. Combine into prompts.json record format
5. Test with Kit — does the AI respond to natural language correctly?
6. Test with both providers (Claude and OpenAI)
