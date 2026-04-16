// ============================================================================
// mcp-engine-4.0.js
// Complete MCP Client Engine
// 
// Purpose: Self-sufficient MCP transport layer that handles:
//   - Authentication (when server exposes /auth/login) OR HTTP bridge (APIServer3.x: /ping + /tools + POST /tools/:name)
//   - Tool registry loading from server
//   - Generic staging: mcpEnginePrepare() — validate params vs registry (all tools, present/future)
//   - mcpStaging() — preferred public name: prepare + send for any server tool (all 17 on APIServer3.4)
//   - Tool execution: mcpEngineSend() — same as mcpStaging (implementation)
//
// CORS / why local MCP first (test runs):
//   The browser only calls same-origin or CORS-allowed hosts. CropManage (e.g. api.dev.cropmanage…)
//   is reached from Node inside APIServer — not from the tab — so no browser CORS to CropManage.
//   If the page called dev CropManage directly with fetch(), you’d need a CORS browser extension.
//   Flow: mcpEngineLogon(local:3101) → tools + get_token run on the server → self-contained without that addon.
//
// ORDER — MCP first: each page calls mcpEngineLogon(url) in window.onload (start simple), then mcpStaging / send.
//
// Author: George (Claude Code)
// Date: 2026-04-11
// Reference: MCP-Irrigation-Guide.md
// ============================================================================

// ========================================
// MCP_ENGINE State Object
// ========================================
const MCP_ENGINE = {
    serverUrl: null,
    token: null,
    userId: null,
    tools: {},           // Tool registry loaded from server
    userData: {},        // User context and preferences
    prompts: [],         // Master prompts
    clientTools: {},     // Local tool registry (offline handlers registered by components)
    requestId: 1,        // JSON-RPC request counter
    /** 'bridge' = APIServer3.x HTTP (POST /tools/:toolName). 'jsonrpc' = POST /mcp JSON-RPC */
    transport: 'bridge'
};

// Bare globals — api-component getMcpBase() returns `mcpServerUrl` (same as mcp-engine-3.0 let binding).
// window.mcpServerUrl alone does not define that identifier; other scripts would throw ReferenceError.
var mcpServerUrl = null;
var mcpMode = 'local';

/**
 * APIServer3.4 exposes GET /ping + /tools and POST /tools/:toolName — no /auth/login or /mcp.
 */
async function mcpEngineDetectTransport(serverUrl) {
    try {
        const r = await fetch(`${serverUrl}/ping`, { method: 'GET' });
        if (!r.ok) return 'jsonrpc';
        const j = await r.json();
        if (j && j.status === 'alive') return 'bridge';
    } catch (_) { /* fall through */ }
    return 'jsonrpc';
}

/**
 * Publish MCP base URL for legacy harness scripts (getMcpBase reads bare mcpServerUrl).
 */
function mcpEnginePublishHarnessUrl() {
    mcpServerUrl = MCP_ENGINE.serverUrl || null;
    window.mcpServerUrl = mcpServerUrl;
}

/**
 * Clear engine state + harness globals (e.g. env = offline).
 */
function mcpEngineHarnessOffline() {
    MCP_ENGINE.serverUrl = null;
    MCP_ENGINE.token = null;
    MCP_ENGINE.tools = {};
    MCP_ENGINE.transport = 'bridge';
    mcpServerUrl = null;
    window.mcpServerUrl = null;
    mcpMode = 'offline';
}

// ========================================
// MCP_STAGING — canonical 17 tools (APIServer3.4: apiServiceTools + jsonFileTools)
// Keep in sync with 2. Src=/APIServer3.4.js registry order / names.
// ========================================
const MCP_STAGING_STANDARD_TOOL_NAMES = [
    'get_token',
    'set_token',
    'get_ranches',
    'get_plantings',
    'get_irrigation_details',
    'load_into_displayRecords',
    'post_new_irrigation',
    'update_irrigation',
    'batch_post_queue',
    'get_event_recommendation',
    'json_write',
    'json_read',
    'json_update',
    'json_delete',
    'json_list',
    'json_exists',
    'data_operation'
];

/**
 * After mcpEngineLogon: confirm every standard tool is in the loaded registry (ready to test).
 * @returns {{ success: boolean, missing: string[], extra: string[], count: number, standardCount: number }}
 */
function mcpStagingVerifyRegistry() {
    const loaded = Object.keys(MCP_ENGINE.tools);
    const missing = MCP_STAGING_STANDARD_TOOL_NAMES.filter((n) => !MCP_ENGINE.tools[n]);
    const extra = loaded.filter((n) => !MCP_STAGING_STANDARD_TOOL_NAMES.includes(n));
    return {
        success: missing.length === 0,
        missing,
        extra,
        count: loaded.length,
        standardCount: MCP_STAGING_STANDARD_TOOL_NAMES.length
    };
}

/**
 * Validate only (no network) — same as mcpEnginePrepare; use before send in tests/UI.
 */
function mcpStagingPrepareOnly(toolName, params = {}) {
    return mcpEnginePrepare(toolName, params);
}

/**
 * Preferred entry for server MCP tools: schema check + POST (bridge or JSON-RPC).
 * UI/clicks supply params; this is NOT irrigation-component's dashboard callTool alias.
 */
async function mcpStaging(toolName, params = {}) {
    return mcpEngineSend(toolName, params);
}

// ========================================
// FUNCTION 1: mcpEngineLogon
// Master initialization - authenticates and loads everything
// ========================================
/**
 * Initialize MCP engine with authentication and tool/data loading.
 * Uses hardcoded embedded credentials for get_token on the server (CropManage is server-side from APIServer).
 *
 * Default local URL keeps the browser on localhost MCP only — avoids direct browser → dev CropManage (CORS).
 *
 * @param {string} serverUrl - MCP server (default http://localhost:3101 for APIServer3.4 bridge)
 * @returns {Promise<Object>} { success, token, toolCount, user, serverUrl }
 */
async function mcpEngineLogon(serverUrl = 'http://localhost:3101') {
    // -------------------------------------------------------------------------
    // BY DESIGN — do not remove: single embedded operator for this vertical.
    // Only this user may access CropManage via APIServer; get_token must run
    // first (bridge) so server-side apiToken is set before API tools work.
    // -------------------------------------------------------------------------
    const username = 'stevep@sspnet.com';
    // Intentional — same embedded credentials as api-component (get_token / direct Token path)
    const password = 'gosteve1!';

    try {
        const normalizedUrl = String(serverUrl || 'http://localhost:3101').replace(/\/+$/, '');
        if (
            MCP_ENGINE.serverUrl === normalizedUrl &&
            Object.keys(MCP_ENGINE.tools).length > 0
        ) {
            mcpEnginePublishHarnessUrl();
            return {
                success: true,
                token: MCP_ENGINE.token,
                toolCount: Object.keys(MCP_ENGINE.tools).length,
                user: { username: MCP_ENGINE.userId },
                serverUrl: MCP_ENGINE.serverUrl,
                transport: MCP_ENGINE.transport,
                reused: true
            };
        }

        console.log(`[MCP-Engine] Initializing with server: ${normalizedUrl}`);

        MCP_ENGINE.serverUrl = normalizedUrl;
        MCP_ENGINE.transport = await mcpEngineDetectTransport(normalizedUrl);
        console.log(`[MCP-Engine] Transport: ${MCP_ENGINE.transport}`);

        if (MCP_ENGINE.transport === 'bridge') {
            MCP_ENGINE.token = null;
            MCP_ENGINE.userId = username;

            const toolsResult = await mcpEngineLoadTools();
            if (!toolsResult.success) {
                throw new Error(`Failed to load tools: ${toolsResult.error}`);
            }
            console.log(`[MCP-Engine] Tool registry loaded - ${toolsResult.count} tools available`);

            // Prime CropManage session on APIServer (required for get_ranches, etc.)
            const tokenRes = await mcpEngineSend('get_token', { username, password });
            if (!tokenRes || tokenRes.success === false) {
                console.warn(
                    '[MCP-Engine] get_token at logon did not succeed — CropManage API tools may fail until token is acquired:',
                    tokenRes && (tokenRes.message || tokenRes.error)
                );
            } else {
                console.log('[MCP-Engine] get_token completed at logon (embedded user)');
            }

            const initResult = await mcpEngineLoadInit();
            if (!initResult.success) {
                console.warn(`[MCP-Engine] Warning: init skipped or empty - ${initResult.error || ''}`);
            } else {
                console.log(`[MCP-Engine] User context loaded`);
            }

            console.log(`[MCP-Engine] ✅ ARMED (bridge) - ${toolsResult.count} tools`);
            mcpEnginePublishHarnessUrl();
            const u = String(MCP_ENGINE.serverUrl || '');
            mcpMode = u.includes('localhost') || u.includes('127.0.0.1') ? 'local' : 'online';
            return {
                success: true,
                token: null,
                toolCount: toolsResult.count,
                user: { username: MCP_ENGINE.userId, role: 'bridge' },
                serverUrl: MCP_ENGINE.serverUrl,
                transport: 'bridge'
            };
        }

        // --- JSON-RPC style server: /auth/login + Bearer + /mcp ---
        const authResponse = await fetch(`${normalizedUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!authResponse.ok) {
            throw new Error(`Authentication failed: ${authResponse.statusText}`);
        }

        const authData = await authResponse.json();

        if (!authData.success || !authData.token) {
            throw new Error(authData.error || 'Authentication failed: no token received');
        }

        MCP_ENGINE.token = authData.token;
        MCP_ENGINE.userId = authData.userId || username;

        console.log(`[MCP-Engine] Authentication successful - User: ${MCP_ENGINE.userId}`);

        const toolsResult = await mcpEngineLoadTools();
        if (!toolsResult.success) {
            throw new Error(`Failed to load tools: ${toolsResult.error}`);
        }

        console.log(`[MCP-Engine] Tool registry loaded - ${toolsResult.count} tools available`);

        const initResult = await mcpEngineLoadInit();
        if (!initResult.success) {
            console.warn(`[MCP-Engine] Warning: Failed to load user data - ${initResult.error}`);
        } else {
            console.log(`[MCP-Engine] User context loaded`);
        }

        console.log(`[MCP-Engine] ✅ ARMED AND READY - ${toolsResult.count} tools available`);

        mcpEnginePublishHarnessUrl();
        mcpMode = 'online';
        return {
            success: true,
            token: MCP_ENGINE.token,
            toolCount: toolsResult.count,
            user: {
                username: MCP_ENGINE.userId,
                role: authData.role || 'user'
            },
            serverUrl: MCP_ENGINE.serverUrl,
            transport: 'jsonrpc'
        };
    } catch (error) {
        console.error('[MCP-Engine] Logon failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// FUNCTION 2: mcpEngineLoadTools
// Fetch complete tool registry from server
// ========================================
/**
 * Load tool definitions from server
 * Called automatically by mcpEngineLogon, or manually to refresh
 * 
 * @returns {Promise<Object>} { success, count, tools }
 */
async function mcpEngineLoadTools() {
    try {
        console.log(`[MCP-Engine] Loading tool registry from ${MCP_ENGINE.serverUrl}`);

        const headers = { 'Content-Type': 'application/json' };
        if (MCP_ENGINE.transport !== 'bridge' && MCP_ENGINE.token) {
            headers['Authorization'] = `Bearer ${MCP_ENGINE.token}`;
        }

        const response = await fetch(`${MCP_ENGINE.serverUrl}/tools`, {
            method: 'GET',
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch tools: ${response.statusText}`);
        }
        
        const toolsData = await response.json();
        
        // toolsData should be an array of tool definitions
        // Convert to object keyed by tool name for fast lookup
        MCP_ENGINE.tools = {};
        
        if (Array.isArray(toolsData)) {
            toolsData.forEach(tool => {
                MCP_ENGINE.tools[tool.name] = {
                    name: tool.name,
                    description: tool.description || '',
                    inputSchema: tool.inputSchema
                };
            });
        } else if (toolsData.tools && Array.isArray(toolsData.tools)) {
            // Handle { tools: [...] } format
            toolsData.tools.forEach(tool => {
                MCP_ENGINE.tools[tool.name] = {
                    name: tool.name,
                    description: tool.description || '',
                    inputSchema: tool.inputSchema
                };
            });
        } else {
            throw new Error('Invalid tools response format');
        }
        
        const toolCount = Object.keys(MCP_ENGINE.tools).length;
        console.log(`[MCP-Engine] Loaded ${toolCount} tools:`, Object.keys(MCP_ENGINE.tools));
        
        return {
            success: true,
            count: toolCount,
            tools: MCP_ENGINE.tools
        };
        
    } catch (error) {
        console.error('[MCP-Engine] Failed to load tools:', error);
        return {
            success: false,
            error: error.message,
            count: 0,
            tools: {}
        };
    }
}

// ========================================
// FUNCTION 3: mcpEngineLoadInit
// Load user context and master prompts
// ========================================
/**
 * Load user-specific data and prompts from server
 * Called automatically by mcpEngineLogon, or manually to refresh
 * 
 * @returns {Promise<Object>} { success, userData, prompts }
 */
async function mcpEngineLoadInit() {
    try {
        // APIServer3.x HTTP bridge does not implement GET /init — avoid 404 noise in Network tab
        if (MCP_ENGINE.transport === 'bridge') {
            MCP_ENGINE.userData = {};
            MCP_ENGINE.prompts = [];
            console.log('[MCP-Engine] Init skipped (bridge — no /init on APIServer3.4)');
            return { success: true, userData: {}, prompts: [], skipped: true, reason: 'bridge' };
        }

        console.log(`[MCP-Engine] Loading user context from ${MCP_ENGINE.serverUrl}`);

        const headers = { 'Content-Type': 'application/json' };
        if (MCP_ENGINE.token) {
            headers['Authorization'] = `Bearer ${MCP_ENGINE.token}`;
        }

        const response = await fetch(`${MCP_ENGINE.serverUrl}/init`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch init data: ${response.statusText}`);
        }
        
        const initData = await response.json();
        
        // Store user data and prompts
        MCP_ENGINE.userData = initData.userData || {};
        MCP_ENGINE.prompts = initData.prompts || [];
        
        console.log(`[MCP-Engine] User context loaded for ${MCP_ENGINE.userId}`);
        
        return {
            success: true,
            userData: MCP_ENGINE.userData,
            prompts: MCP_ENGINE.prompts
        };
        
    } catch (error) {
        console.error('[MCP-Engine] Failed to load init data:', error);
        return {
            success: false,
            error: error.message,
            userData: {},
            prompts: []
        };
    }
}

// ========================================
// FUNCTION 4: mcpEngineGetAvailableTools
// Read-only access to tool registry
// ========================================
/**
 * Get the loaded tool registry
 * Returns copy to prevent external modification
 * 
 * @returns {Object|null} Tools object or null if not loaded
 */
function mcpEngineGetAvailableTools() {
    if (Object.keys(MCP_ENGINE.tools).length === 0) {
        console.warn('[MCP-Engine] Tool registry not loaded - call mcpEngineLogon first');
        return null;
    }
    
    // Return copy to prevent modification
    return JSON.parse(JSON.stringify(MCP_ENGINE.tools));
}

// ========================================
// FUNCTION 5: mcpEnginePrepare
// Generic staging — validate tool + params against server registry (no network)
// ========================================
/**
 * Stage a tool call: resolve tool from registry, validate required params from inputSchema.
 * Same logic for every tool the server advertises — UI supplies params at click time.
 *
 * @param {string} toolName - Must exist in loaded tool registry
 * @param {Object} params - Arguments (validated against tool inputSchema.required)
 * @returns {{ success: true, toolName: string, params: Object } | { success: false, error: string, ... }}
 */
function mcpEnginePrepare(toolName, params = {}) {
    if (!MCP_ENGINE.tools[toolName]) {
        return {
            success: false,
            error: `Tool not found: ${toolName}`,
            availableTools: Object.keys(MCP_ENGINE.tools)
        };
    }

    const tool = MCP_ENGINE.tools[toolName];

    if (tool.inputSchema && Array.isArray(tool.inputSchema.required)) {
        const missing = tool.inputSchema.required.filter((req) => !(req in params));
        if (missing.length > 0) {
            return {
                success: false,
                error: `Missing required parameters: ${missing.join(', ')}`,
                tool: toolName,
                required: tool.inputSchema.required
            };
        }
    }

    return {
        success: true,
        toolName,
        params: { ...params }
    };
}

// ========================================
// FUNCTION 6: mcpEngineSend
// Prepare then send (JSON-RPC to server)
// ========================================
/**
 * Execute a tool call: mcpEnginePrepare, then POST JSON-RPC to server
 *
 * @param {string} toolName - Must exist in loaded tool registry
 * @param {Object} params - Tool parameters (validated against inputSchema)
 * @returns {Promise<Object>} Tool execution result
 */
async function mcpEngineSend(toolName, params = {}) {
    try {
        if (!MCP_ENGINE.serverUrl || Object.keys(MCP_ENGINE.tools).length === 0) {
            const err =
                'MCP not armed — call mcpEngineLogon(serverUrl) from page onload first.';
            console.warn('[MCP-Engine]', err);
            return { success: false, error: err };
        }

        const prepared = mcpEnginePrepare(toolName, params);
        if (!prepared.success) {
            return prepared;
        }

        const staged = prepared.params;

        console.log(`[MCP-Engine] Sending tool call: ${toolName}`, staged);

        // --- APIServer3.x HTTP bridge: POST /tools/:toolName, body = arguments (mcp-engine-3.0 parity) ---
        if (MCP_ENGINE.transport === 'bridge') {
            const response = await fetch(
                `${MCP_ENGINE.serverUrl}/tools/${encodeURIComponent(prepared.toolName)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(staged)
                }
            );
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || response.statusText || `HTTP ${response.status}`,
                    tool: toolName
                };
            }
            console.log(`[MCP-Engine] Tool call successful (bridge): ${toolName}`);
            return result;
        }

        // --- JSON-RPC: POST /mcp ---
        const payload = {
            jsonrpc: "2.0",
            id: MCP_ENGINE.requestId++,
            method: "tools/call",
            params: {
                name: prepared.toolName,
                arguments: staged
            }
        };

        const mcpHeaders = { 'Content-Type': 'application/json' };
        if (MCP_ENGINE.token) {
            mcpHeaders['Authorization'] = `Bearer ${MCP_ENGINE.token}`;
        }
        const response = await fetch(`${MCP_ENGINE.serverUrl}/mcp`, {
            method: 'POST',
            headers: mcpHeaders,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
            console.error(`[MCP-Engine] Tool call error:`, result.error);
            return {
                success: false,
                error: result.error.message || 'Tool execution failed',
                code: result.error.code
            };
        }

        console.log(`[MCP-Engine] Tool call successful: ${toolName}`);

        return {
            success: true,
            ...result.result
        };
        
    } catch (error) {
        console.error(`[MCP-Engine] Send failed for ${toolName}:`, error);
        return {
            success: false,
            error: error.message,
            tool: toolName
        };
    }
}

// ========================================
// LEGACY COMPATIBILITY (deprecated)
// ========================================
/**
 * @deprecated Old 3-arg signature (mode, toolName, params). Use mcpStaging(toolName, params).
 */
function mcpEngineStaging(mode, toolName, params) {
    console.warn('[MCP-Engine] mcpEngineStaging(mode,...) is deprecated — use mcpStaging(toolName, params)');
    return mcpStaging(toolName, params);
}

/**
 * @deprecated Use mcpEngineLogon() to set server
 */
function mcpEngineURL(mode) {
    console.warn('[MCP-Engine] mcpEngineURL is deprecated - server set by mcpEngineLogon()');
    return MCP_ENGINE.serverUrl;
}

/**
 * @deprecated Prefer mcpEngineLogon(url). Sync shim: offline clears harness URL; local/online sets window.mcpServerUrl only (no tool load).
 */
function mcpEngineInit(mode) {
    const m = (mode || 'local').toLowerCase();
    if (m === 'offline') {
        mcpEngineHarnessOffline();
        return null;
    }
    mcpMode = m;
    mcpServerUrl = m === 'local' ? 'http://localhost:3101' : 'https://api.cropclient.com';
    window.mcpServerUrl = mcpServerUrl;
    return mcpServerUrl;
}

// ========================================
// FUNCTION 7: mcpEngineRegisterTool
// Register a local tool handler (offline / in-browser)
// Called by components (e.g. irrigation-component) on load
// ========================================
/**
 * Register a local tool with mcp-engine.
 * Registered tools are available to mcpEngineCallTool when offline
 * or when the tool is not in the server registry.
 *
 * @param {string} name - Tool name (must match server tool name for offline fallback)
 * @param {Object} schema - inputSchema definition
 * @param {Function} handler - function(params) → { returnCode, statusMessage, data }
 */
function mcpEngineRegisterTool(name, schema, handler) {
    MCP_ENGINE.clientTools[name] = { name, schema, handler };
    console.log(`[MCP-Engine] Registered local tool: ${name}`);
}

// ========================================
// FUNCTION 8: mcpEngineCallTool
// Single entry point for ALL tool calls — server or local
// Routes based on mcpMode and tool availability
// ========================================
/**
 * Call any tool by name. One entry point — mcp-engine decides the path.
 *
 * Routing:
 *   online / local + tool in server registry → mcpStaging (server call)
 *   offline OR tool not on server            → clientTools local handler
 *   not found anywhere                       → error
 *
 * @param {string} toolName - Tool to call
 * @param {Object} params - Parameters to pass
 * @returns {Promise<Object>} Tool result
 */
async function mcpEngineCallTool(toolName, params = {}) {
    const onServer = !!MCP_ENGINE.tools[toolName];
    const onClient = !!MCP_ENGINE.clientTools[toolName];

    // Online/local mode and tool exists on server → server call
    if (mcpMode !== 'offline' && onServer) {
        return mcpStaging(toolName, params);
    }

    // Offline or tool only registered locally → local handler
    if (onClient) {
        console.log(`[MCP-Engine] callTool local: ${toolName}`);
        return MCP_ENGINE.clientTools[toolName].handler(params);
    }

    const err = `Tool not found: ${toolName} (mode: ${mcpMode}, server: ${onServer}, local: ${onClient})`;
    console.warn('[MCP-Engine]', err);
    return { success: false, error: err };
}

// ========================================
// Export for debugging
// ========================================
window.MCP_ENGINE = MCP_ENGINE;
window.MCP_STAGING_STANDARD_TOOL_NAMES = MCP_STAGING_STANDARD_TOOL_NAMES;

console.log('[MCP-Engine] 4.0 loaded — call mcpEngineLogon from page onload; then mcpStaging');
