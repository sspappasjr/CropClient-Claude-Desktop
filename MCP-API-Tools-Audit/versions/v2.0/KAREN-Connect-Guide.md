# How to Connect Karen (Anthropic Claude) — Guide for George
## Date: 3.5.2026

---

## What This Is
Karen = Claude (Anthropic). She replaces Lilly (OpenAI) as the AI assistant.
Steve already has a Max Pro account with credits. Key is ready.

---

## Step 1 — Get the API Key
- Go to console.anthropic.com
- Steve's account is already set up with credits
- Copy the API key (starts with `sk-ant-...`)
- Paste it into the API Key input on the harness prompt panel

---

## Step 2 — Tool Definitions (Almost Free)
The 15 tools in APIServer2.0.js already have `name`, `description`, and `inputSchema`.
Karen's API takes the EXACT same JSON Schema format — just rename the field:

| APIServer2.0.js | Karen's API |
|----------------|-------------|
| `inputSchema`  | `input_schema` |

That's the only change. Same names, same descriptions, same properties, same required arrays.

---

## Step 3 — How Karen Talks (vs Lilly)

### Sending a prompt:
**Lilly (OpenAI):**
```
POST https://api.openai.com/v1/chat/completions
Header: Authorization: Bearer sk-...
Body: { model: "gpt-4o", messages: [...], tools: [...] }
```

**Karen (Anthropic):**
```
POST https://api.anthropic.com/v1/messages
Headers: x-api-key: sk-ant-..., anthropic-version: 2023-06-01
Body: { model: "claude-sonnet-4-20250514", system: "...", messages: [...], tools: [...], max_tokens: 1024 }
```

Key differences:
- Karen takes `system` as a top-level string, NOT inside messages
- Karen requires `max_tokens` in every request
- Karen uses `x-api-key` header, not `Authorization: Bearer`

### Reading the response:

**Lilly says "call a tool":**
```json
{ "tool_calls": [{ "id": "call_123", "function": { "name": "get_token", "arguments": "{\"username\":\"steve\"}" } }] }
```

**Karen says "call a tool":**
```json
{ "content": [{ "type": "tool_use", "id": "toolu_123", "name": "get_token", "input": { "username": "steve" } }] }
```

Note: Karen gives `input` as an object. Lilly gives `arguments` as a string you have to JSON.parse.

### Sending tool results back:

**Lilly:**
```json
{ "role": "tool", "tool_call_id": "call_123", "content": "{...result...}" }
```

**Karen:**
```json
{ "role": "user", "content": [{ "type": "tool_result", "tool_use_id": "toolu_123", "content": "{...result...}" }] }
```

---

## Step 4 — Model Choice

For testing, use `claude-sonnet-4-20250514` — fast and cheap.
For production, use `claude-opus-4-6` — smartest, best at tool chaining.
The preset radio button switches between them.

---

## The Chain Karen Learns

Grower asks: "Show me irrigation for my ranch"

Karen calls:
1. `get_token` (username, password) → gets auth token
2. `get_ranches` () → gets list of ranches
3. `get_plantings` (ranchGuid) → gets plantings for chosen ranch
4. `get_irrigation_details` (plantingId) → gets irrigation records

Karen answers: "Here are 5 irrigation events for Ranch 1, Strawberries planting..."

Same chain as buttons. Same server. Different door.

---

## The Rules
- APIServer2.0.js is the source of truth. Always.
- No code without Steve's GOFORIT.
- Karen knows her own API — don't web search it, ask her.
