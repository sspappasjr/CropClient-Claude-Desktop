// ============================================================
// MCP-ENGINE v3.0 — Token side (talks to server)
// Updated: 2026-04-06
// Changes v2.1 → v3.0:
//   - DEFAULT_MODE = 'local' (testing phase default)
//   - mcpServers const: offline explicit null, production removed
//   - CC_STATE removed — mcp-engine owns mcpMode + mcpServerUrl only
//   - api-component reads mcpServerUrl via getMcpBase()
//   - onload + listener: engine updates its own vars on dropdown change
//   - mcpEngineURL reads mcpServers const — one truth
// ============================================================

// @@@ BEGIN mcp-engine @@@

// --- mcp-engine defaults ---
const DEFAULT_MODE = 'local';

const mcpServers = {
    local:   'http://localhost:3101',
    online:  'https://api.cropclient.com',
    offline: null
};

// mcp-engine internal variables — set from const
// These are the single source of truth for mode and server URL
// api-component reads these via getMcpBase() — never touch CC_STATE here
let mcpMode      = DEFAULT_MODE;
let mcpServerUrl = mcpServers[DEFAULT_MODE];


// --- mcp-engine-init ---
// Called on DOMContentLoaded and on every dropdown change
function mcpEngineInit(mode) {
    mcpMode      = mode || DEFAULT_MODE;
    mcpServerUrl = mcpServers[mcpMode] !== undefined ? mcpServers[mcpMode] : null;
    console.log(`🔗 MCP-ENGINE | mode: ${mcpMode} | url: ${mcpServerUrl}`);
}


// --- mcp-engine-url ---
function mcpEngineURL(mode) {
    return mcpServers[mode] !== undefined ? mcpServers[mode] : null;
}


// --- mcp-engine-staging ---
function mcpEngineStaging(mode, toolName, params) {
    return {
        serverUrl: mcpEngineURL(mode),
        toolName:  toolName,
        params:    params || {}
    };
}


// --- mcp-engine-send ---
async function mcpEngineSend(staged) {
    if (!staged.serverUrl) {
        return { success: false, error: 'offline — no server' };
    }
    try {
        const response = await fetch(staged.serverUrl + '/tools/' + staged.toolName, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(staged.params)
        });
        return await response.json();
    } catch (err) {
        return { success: false, error: err.message };
    }
}


// --- mcp-engine-listener ---
// Wires dropdown on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    mcpEngineInit(DEFAULT_MODE);

    const dropdown = document.getElementById('envSelect');
    if (dropdown) {
        dropdown.value = DEFAULT_MODE;

        dropdown.addEventListener('change', function () {
            mcpEngineInit(this.value);
        });
    }
});

// @@@ END mcp-engine @@@
