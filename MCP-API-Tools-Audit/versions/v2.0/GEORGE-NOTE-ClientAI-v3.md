# George — Client-AI-Component Plan v3
## Updated: 3.5.2026 — Code Review of mcp-engine

---

## What This Is
We extracted your mcp-engine into its own file (`mcp-engine.js`) and found the modules don't chain together. Here's what needs fixing.

---

## Issues Found

**1. Staging output goes nowhere**
`mcpEngineStaging` returns `{toolName, params}` but `mcpEngineSend` takes `(serverUrl, toolName, params)` as separate arguments. Nobody unpacks the staging object. It's dead code.

**2. URL is disconnected**
`mcpEngineUrl` returns a server URL but `mcpEngineSend` expects `serverUrl` passed in directly. Nothing connects URL to Send.

**3. No error handling in Send**
`JSON.parse(data.result.content[0].text)` crashes if the server returns an error or unexpected format. No try/catch, no network failure handling.

---

## Suggested Fix

Make the 3 modules chain: **URL → Staging → Send**

```js
// URL picks the server (renamed from "presets" — it's just the URL)
const serverUrl = mcpEngineUrl('production');

// Staging prepares the call AND includes the server
function mcpEngineStaging(target, toolName, params) {
    return {
        serverUrl: mcpEngineUrl(target),
        toolName: toolName,
        params: params || {}
    };
}

// Send takes a staged object — not loose args
// NOTE: Uses HTTP bridge route /tools/:toolName (plain JSON in, plain JSON out)
//       NOT /mcp (that's stdio JSON-RPC — different protocol, different wrapper)
async function mcpEngineSend(staged) {
    try {
        const response = await fetch(staged.serverUrl + '/tools/' + staged.toolName, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(staged.params)
        });

        const data = await response.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
}
```

Usage becomes: `mcpEngineSend(mcpEngineStaging('production', 'get_token', {user: 'steve'}))`

---

## AI-Engine Issues — Provider Lock-in

The ai-engine is hardcoded to OpenAI (Lilly). We're adding Karen (Anthropic Claude) as a provider option. Two modules need a provider parameter:

**ai-engine-send** — endpoint, auth header, model, and request shape are all OpenAI-specific.

**ai-engine-reader** — parses OpenAI's `tool_calls[].function.name` format. Karen returns `content[]` blocks with `type: "tool_use"`. Different envelope, same data.

**ai-engine-router** — no change needed. Loop logic is provider-agnostic.

### Suggested Fix: ai-engine-presets (new module)

```js
// ai-engine-presets — pick your AI provider
function aiEnginePresets(provider) {
    const providers = {
        lilly: {
            name: 'Lilly (OpenAI)',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o',
            authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
            systemInMessages: true  // OpenAI puts system in messages array
        },
        karen: {
            name: 'Karen (Anthropic)',
            endpoint: 'https://api.anthropic.com/v1/messages',
            model: 'claude-opus-4-6',
            authHeader: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
            systemInMessages: false  // Anthropic uses top-level system field
        }
    };
    return providers[provider] || providers.karen;
}
```

**UI:** Radio button in the prompt panel — "Ask Lilly" / "Ask Karen" — sets which provider preset is active. Same panel, same button, just picks the dialect.

**Reader adapts by provider:**
```js
function aiEngineReader(aiMessage, provider) {
    if (provider === 'karen') {
        // Anthropic: content[] with type "tool_use" or type "text"
        const toolUses = (aiMessage.content || []).filter(b => b.type === 'tool_use');
        if (toolUses.length > 0) {
            return {
                type: 'tool_call',
                calls: toolUses.map(t => ({ id: t.id, toolName: t.name, params: t.input }))
            };
        }
        const textBlock = (aiMessage.content || []).find(b => b.type === 'text');
        return { type: 'text', content: textBlock ? textBlock.text : '' };
    }
    // OpenAI (Lilly): tool_calls[].function.name
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        return {
            type: 'tool_call',
            calls: aiMessage.tool_calls.map(c => ({
                id: c.id, toolName: c.function.name, params: JSON.parse(c.function.arguments)
            }))
        };
    }
    return { type: 'text', content: aiMessage.content };
}
```

---

## Karen's Learning Tool — What She Needs

Karen (Claude) needs a **tool definitions file** — the list of all 22 tools with:
- Tool name (must match APIServer2.0.js exactly)
- Description (what it does, when to use it)
- Parameters (name, type, required)
- Example response shape

This is the `toolDefinitions` array that gets passed with every prompt. It's Karen's training data. George + Karen build this together from APIServer2.0.js — the source of truth.

George already knows the tools. Karen learns by reading the definitions and practicing prompt-to-token flows.

**Simple start:** Extract the 22 tool names + params from APIServer2.0.js into a `tool-definitions.json` file in AIToolKit. Karen reads it, knows what to call.

---

## The Rule
APIServer2.0.js is the source of truth. Always.
No code without Steve's GOFORIT.
