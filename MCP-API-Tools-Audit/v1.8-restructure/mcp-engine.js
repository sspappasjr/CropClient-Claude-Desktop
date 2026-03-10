// ============================================================
// MCP-ENGINE v2.1 — Token side (talks to server)
// Source: Client-AI-Component.js (George)
// Updated: 3.5.2026 — Fixed chain: URL → Staging → Send
// Fix 1: Staging now captures serverUrl via mcpEngineURL
// Fix 2: Send takes a single staged object (not loose args)
// Fix 3: Send has try/catch error handling
// ============================================================

// @@@ BEGIN mcp-engine @@@

// --- mcp-engine-url ---
// The server URL. One place, one truth.
function mcpEngineURL(target) {
    const servers = {
        local: 'http://localhost:3101',
        production: 'https://api.cropclient.com'
    };
    return servers[target] || servers.local;
}


// --- mcp-engine-staging ---
// Prepare tool name + params for sending
// Captures serverUrl so Send doesn't need loose args
function mcpEngineStaging(target, toolName, params) {
    return {
        serverUrl: mcpEngineURL(target),
        toolName: toolName,
        params: params || {}
    };
}


// --- mcp-engine-send ---
// POST to server, get result back
// Takes a staged object — not loose args
// Hits /tools/:toolName with plain args — matches APIServer2.0 HTTP bridge
// Usage: mcpEngineSend(mcpEngineStaging('production', 'get_token', { username, password }))
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

// @@@ END mcp-engine @@@
