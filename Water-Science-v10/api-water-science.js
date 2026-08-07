// ============================================================
// api-water-science.js — vAPI fence (CropManage auth + reference data)
// Pass 2: 4 tokens — get_token, get_ranches, get_plantings, get_irrigation_detail
// Token request/response shapes ported from api-component-3.4.1.js
// (proven), recoded clean in 2-fence discipline. Not derived from the
// old inline S13 ApiComponent (custom/being replaced) — that block
// only supplied the fence technique to mirror, not code to keep.
//
// Fence discipline: only API_receive() may write vAPI.* — whole-object
// JSON crossing, same rule as vIRR/vDOM (MCP-Water-Tools.js /
// DOM-water-objects.html).
//
// Transport: apiCallBase() — offline is a real, direct fetch straight to
// CropManage (matching api-component-3.4.1.js's proven offline path, not
// mock data); local/online route through mcp-engine.js, same as every
// other tool on the page.
//
// Every apiDirectFetch() case returns { success, data } — same field
// name convention as MCP-Water-Tools.js's runToken(), no per-token
// exceptions.
// ============================================================

// @@@@ BEGIN api-water-science @@@@

// ========================================
// FENCE: vAPI — CropManage auth/reference state, independent of vIRR/vDOM.
// Only API_receive() may write vAPI.*
// ========================================

let vAPI = {
    Token: null,
    Ranches: [],            // [{ Id, Ranch_External_GUID, Name }] — get_ranches result
    Plantings: [],          // [{ Id, Name }] — get_plantings result for SelectedRanch
    IrrigationEvents: [],   // raw events for SelectedPlanting — get_irrigation_detail result
    Recommendations: [],    // one entry per event — { eventId, data } or { eventId, error } — get_event_recommendation result, looped
    APIdetail: [],          // 11-field common shape, built from IrrigationEvents — recordID/ranch/planting/scheduledDate/hours/interval/mgrHours/appliedHours/ranchId/plantingId/status
    SelectedRanch: null,    // { Id, Ranch_External_GUID, Name }
    SelectedPlanting: null, // { Id, Name }
    Pending: { toolName: null, params: {} },   // params-about-to-send (preview)
    Result: { TokenName: null, Success: null, Error: null, Message: null }
};

// Only API_receive() may write vAPI.* — callers build a fresh deep copy,
// fold their changes in, and hand the whole object across.
function API_receive(apiState) {
    vAPI = apiState;
    renderApiPanel();
}

// Real credentials, matching api-component-3.4.1.js's getToken() exactly —
// offline mode uses these in a real direct CropManage call, no mock.
const API_DEMO_USER = 'stevep@sspnet.com';
const API_DEMO_PASS = 'gosteve1!';

// ========================================
// TRANSPORT — one shared lane for all tokens. Token functions never touch
// fetch or mcp-engine directly; they only call this. Offline bypasses
// mcp-engine entirely — real, direct CropManage calls, same URLs/shapes
// as api-component-3.4.1.js's proven offline path (not mock data).
// Local/Online still route through mcp-engine, same as every other tool.
// ========================================

const CROPMANAGE_BASE = 'https://api.dev.cropmanage.ucanr.edu';

async function apiCallBase(toolName, params) {
    if (mcpMode === 'offline') {
        return apiDirectFetch(toolName, params);
    }
    const target = mcpMode === 'online' ? 'online' : 'local';
    return mcpEngineSend(mcpEngineStaging(target, toolName, params));
}

// ========================================
// TOKEN SCRIPTS — the two-line spec table, in code. Every token except
// get_token (different auth shape entirely — form-encoded credentials, no
// Bearer header) is just a method + path here. Adding a token after this
// means one line in this table, not a new case in apiDirectFetch.
// ========================================

const TOKEN_SCRIPTS = {
    get_ranches:               { method: 'GET', path: 'v2/ranches.json' },
    get_plantings:              { method: 'GET', path: 'v2/ranches/{ranchGuid}/plantings.json' },
    get_irrigation_detail:       { method: 'GET', path: 'v2/plantings/{plantingId}/irrigation-events/details.json' },
    get_event_recommendation:     { method: 'GET', path: 'v2/irrigation-events/{eventId}.json' }
};

function fillPath(path, params) {
    return path.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key]));
}

async function apiDirectFetch(toolName, params) {
    try {
        if (toolName === 'get_token') {
            const resp = await fetch(`${CROPMANAGE_BASE}/Token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(params.username)}&password=${encodeURIComponent(params.password)}&grant_type=password`
            });
            if (!resp.ok) return { success: false, message: `Token request failed: ${resp.status}` };
            const body = await resp.json();
            if (!body.access_token) return { success: false, message: 'No access_token in response' };
            return { success: true, data: body.access_token };
        }

        const spec = TOKEN_SCRIPTS[toolName];
        if (!spec) return { success: false, message: `apiDirectFetch: unknown token ${toolName}` };

        const resp = await fetch(`${CROPMANAGE_BASE}/${fillPath(spec.path, params)}`, {
            method: spec.method,
            headers: { 'Authorization': `Bearer ${vAPI.Token}` }
        });
        if (!resp.ok) return { success: false, message: `${toolName} request failed: ${resp.status}` };
        return { success: true, data: await resp.json() };
    } catch (err) {
        if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
            return { success: false, message: 'CORS blocked — enable the CORS extension' };
        }
        return { success: false, message: err.message };
    }
}

// ========================================
// PARAMS BUILDER — vAPI.Pending is exactly what Send will send.
// ========================================

function buildParamsForTool(toolName) {
    switch (toolName) {
        case 'get_token':
            return { username: API_DEMO_USER, password: API_DEMO_PASS };
        case 'get_ranches':
            return {};
        case 'get_plantings':
            return { ranchGuid: vAPI.SelectedRanch ? vAPI.SelectedRanch.Ranch_External_GUID : null };
        case 'get_irrigation_detail':
            return { plantingId: vAPI.SelectedPlanting ? vAPI.SelectedPlanting.Id : null };
        case 'get_event_recommendation':
            return { eventId: vAPI.IrrigationEvents[0] ? vAPI.IrrigationEvents[0].Id : null };
        default:
            return {};
    }
}

// vAPI is the only writer of the ranches/plantings table bodies — the
// api-side twin of renderTable(). Row markup matches the existing
// ranchesTableBody/plantingsTableBody elements already in the page.
function renderApiPanel() {
    const rBody = document.getElementById('ranchesTableBody');
    const pBody = document.getElementById('plantingsTableBody');
    if (!rBody || !pBody) return;

    if (!vAPI.Ranches.length) {
        rBody.innerHTML = '<tr><td style="padding: 8px; font-size: 0.8em; color: #999; font-style: italic;">— run Get Ranches —</td></tr>';
    } else {
        rBody.innerHTML = vAPI.Ranches.map(r => {
            const selected = vAPI.SelectedRanch && vAPI.SelectedRanch.Ranch_External_GUID === r.Ranch_External_GUID;
            return `<tr onclick="apiSelectRanch('${r.Ranch_External_GUID}')" style="cursor: pointer; border-bottom: 1px solid #eee;${selected ? ' background: #C8E6C9;' : ''}">`
                 + `<td style="padding: 8px; font-size: 0.85em;">${r.Name}</td></tr>`;
        }).join('');
    }

    if (!vAPI.Plantings.length) {
        pBody.innerHTML = `<tr><td style="padding: 8px; font-size: 0.8em; color: #999; font-style: italic;">${vAPI.SelectedRanch ? '— run Get Plantings —' : '— select a ranch —'}</td></tr>`;
    } else {
        pBody.innerHTML = vAPI.Plantings.map(p => {
            const selected = vAPI.SelectedPlanting && String(vAPI.SelectedPlanting.Id) === String(p.Id);
            return `<tr onclick="apiSelectPlanting('${p.Id}')" style="cursor: pointer; border-bottom: 1px solid #eee;${selected ? ' background: #C8E6C9;' : ''}">`
                 + `<td style="padding: 8px; font-size: 0.85em;">${p.Name}</td></tr>`;
        }).join('');
    }
}

// ========================================
// RANCH → PLANTING DEPENDENCY — lives inside the fence: selecting a ranch
// clears plantings, then reloads them via get_plantings.
// ========================================

async function apiSelectRanch(ranchGuid) {
    const next = JSON.parse(JSON.stringify(vAPI));
    next.SelectedRanch = next.Ranches.find(r => r.Ranch_External_GUID === ranchGuid) || null;
    next.Plantings = [];
    next.SelectedPlanting = null;
    next.Pending = { toolName: 'get_plantings', params: { ranchGuid: ranchGuid || null } };
    API_receive(next);
    if (next.SelectedRanch) await apiGetPlantings();
}

function apiSelectPlanting(plantingId) {
    const next = JSON.parse(JSON.stringify(vAPI));
    next.SelectedPlanting = next.Plantings.find(p => String(p.Id) === String(plantingId)) || null;
    API_receive(next);
}

// ========================================
// GENERIC TOKEN RUNNER — every token funnels through here. Builds params,
// calls apiCallBase(), writes result.data into the named vAPI field, sets
// Pending/Result, crosses the fence via API_receive(). Returns the raw
// result so callers can chain (e.g. Token → Ranches) or auto-select.
// ========================================

// Native field names each token used before the 'data' rename — local/online
// mode still comes back through mcp-engine.js this way. Checking 'data'
// first, falling back to the native name, means the same runApiToken()
// works on offline, local, and online without three separate code paths.
const NATIVE_FIELD = {
    get_token: 'token',
    get_ranches: 'ranches',
    get_plantings: 'plantings',
    get_irrigation_detail: 'events'
};

function extractResultData(toolName, result) {
    if (!result) return undefined;
    if (result.data !== undefined) return result.data;
    const native = NATIVE_FIELD[toolName];
    return native ? result[native] : undefined;
}

async function runApiToken(toolName, resultField) {
    const params = buildParamsForTool(toolName);
    const result = await apiCallBase(toolName, params);
    const next = JSON.parse(JSON.stringify(vAPI));

    // Password masked in Pending for display — never store plaintext in a
    // field that might render to the command log.
    const displayParams = toolName === 'get_token'
        ? { username: params.username, password: '••••••••' }
        : params;
    next.Pending = { toolName, params: displayParams };

    if (result && result.success) {
        const raw = extractResultData(toolName, result);
        next[resultField] = (resultField === 'Token') ? raw : JSON.parse(JSON.stringify(raw || []));
        next.Result = { TokenName: toolName, Success: true, Error: null, Message: `✅ ${describeSuccess(toolName, next)}` };
        console.log(`✅ ${toolName} loaded:`, next[resultField]);
    } else {
        const msg = (result && (result.message || result.error)) || 'unknown error';
        next.Result = { TokenName: toolName, Success: false, Error: msg, Message: `❌ ${toolName} failed: ${msg}` };
        console.error(`❌ ${toolName} failed:`, msg);
    }

    API_receive(next);
    showResult(next.Result.Message);
    return result;
}

// One-line success messages per token — kept separate from runApiToken so
// the generic function doesn't grow a per-token switch of its own logic,
// just its wording.
function describeSuccess(toolName, next) {
    switch (toolName) {
        case 'get_token': return 'Token acquired';
        case 'get_ranches': return `${next.Ranches.length} ranches loaded — pick one below`;
        case 'get_plantings': return `${next.Plantings.length} plantings loaded for ${next.SelectedRanch.Name}`;
        case 'get_irrigation_detail': return `${next.IrrigationEvents.length} irrigation events loaded for ${next.SelectedPlanting.Name}`;
        default: return 'done';
    }
}

// ========================================
// THE 4 TOKEN FUNCTIONS — thin wrappers over runApiToken(). Each keeps only
// its guard clause and its chain/auto-select step; the shared six-step body
// (params → call → Pending → Result → API_receive → showResult) lives once,
// in runApiToken().
// ========================================

async function apiGetToken() {
    await runApiToken('get_token', 'Token');
    // Chain off vAPI itself (written by runApiToken/API_receive), not the
    // raw transport result — local/online's response shape can differ from
    // offline's, but vAPI.Token is always the source of truth once set.
    if (vAPI.Token) await apiGetRanches();
}

async function apiGetRanches() {
    await runApiToken('get_ranches', 'Ranches');
    if (vAPI.Ranches.length) {
        await apiSelectRanch(vAPI.Ranches[0].Ranch_External_GUID);
    }
}

async function apiGetPlantings() {
    if (!vAPI.SelectedRanch) {
        showResult('❌ get_plantings: select a ranch first (run Get Ranches)');
        return;
    }
    await runApiToken('get_plantings', 'Plantings');
}

async function apiGetIrrigationDetail() {
    if (!vAPI.SelectedPlanting) {
        showResult('❌ get_irrigation_detail: select a planting first (run Get Plantings)');
        return;
    }
    await runApiToken('get_irrigation_detail', 'IrrigationEvents');
    if (vAPI.IrrigationEvents.length) await apiGetAllRecommendations();
    if (vAPI.IrrigationEvents.length) buildAndCrossAPIdetail();
}

// Maps the enriched per-event data (vAPI.Recommendations — each entry's
// .data is the full event from get_event_recommendation) into the 11-field
// APIdetail shape. The raw /details.json events (vAPI.IrrigationEvents)
// never carry RecommendedIrrigationTime/ManagerAmountRecommendationHours/
// RecommendedInterval — only the per-event recommendation call does, same
// as the proven server-side transform. Ranch/planting/ids fall back to the
// original event since the recommendation response doesn't always carry
// them either.
function buildAPIdetailFromEvents(events, recommendations) {
    return recommendations
        .filter(r => !r.error && r.data)
        .map(r => {
            const event = r.data;
            const original = events.find(e => e.Id === r.eventId) || {};
            let scheduledDate = '-';
            if (event.EventDate) {
                const d = new Date(event.EventDate);
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const year = String(d.getFullYear()).slice(-2);
                scheduledDate = `${month}/${day}/${year}`;
            }
            const appliedInch = parseFloat(event.WaterApplied) || 0;
            const appliedHours = appliedInch > 0 ? parseFloat((appliedInch / 0.3).toFixed(1)) : 0;
            const intervalDays = event.RecommendedInterval != null ? parseFloat(event.RecommendedInterval).toFixed(1) : '0';
            const recInch = parseFloat(event.RecommendedIrrigationAmount) || 0;
            const hours = event.RecommendedIrrigationTime || (recInch > 0 ? parseFloat((recInch / 0.3).toFixed(1)) : 0);
            return {
                recordID: r.eventId,
                ranch: event.RanchName || original.RanchName || (vAPI.SelectedRanch ? vAPI.SelectedRanch.Name : '-'),
                planting: event.PlantingName || original.PlantingName || (vAPI.SelectedPlanting ? vAPI.SelectedPlanting.Name : '-'),
                scheduledDate,
                hours,
                interval: intervalDays + ' days',
                mgrHours: event.ManagerAmountRecommendationHours || 0,
                appliedHours,
                ranchId: event.RanchId || original.RanchId || (vAPI.SelectedRanch ? vAPI.SelectedRanch.Id : 0),
                plantingId: event.PlantingId || original.PlantingId || (vAPI.SelectedPlanting ? vAPI.SelectedPlanting.Id : 0),
                status: 0
            };
        });
}

// Builds vAPI.APIdetail — the merged, mapped 11-field vAPIstandard shape.
// Same proven mapping logic as before.
function buildAndCrossAPIdetail() {
    const next = JSON.parse(JSON.stringify(vAPI));
    next.APIdetail = buildAPIdetailFromEvents(vAPI.IrrigationEvents, vAPI.Recommendations);
    API_receive(next);
    console.log('✅ APIdetail built:', next.APIdetail);

    // Finish the record here — add the bookkeeping fields DisplayRecords
    // needs — before handing off. IRR_getDisplayRecords only receives an
    // already-finished array; it does no building itself.
    const finished = next.APIdetail.map((rec, index) => ({
        id: index + 1,
        recordID: rec.recordID,
        source: 'api',
        ranch: rec.ranch,
        planting: rec.planting,
        hours: rec.hours,
        mgrHours: rec.mgrHours,
        appliedHours: rec.appliedHours,
        interval: rec.interval,
        scheduledDate: rec.scheduledDate,
        ranchId: rec.ranchId,
        plantingId: rec.plantingId,
        status: rec.status,
        lastUpdatedDate: new Date().toLocaleString(),
        updatedBy: 'CropManage API',
        isNew: false,
        isOriginal: true,
        isUpdated: false
    }));

    if (typeof IRR_getDisplayRecords === 'function') IRR_getDisplayRecords(finished);
}

// Loops get_event_recommendation over every event in vAPI.IrrigationEvents.
// One fence crossing at the end, not one per event — the loop runs entirely
// inside the API side. This is intermediate data feeding buildAndCrossAPIdetail
// next, not the finished grid — vIRR/vDOM don't need it directly.
async function apiGetAllRecommendations() {
    if (!vAPI.IrrigationEvents.length) {
        showResult('❌ get_event_recommendation: no irrigation events loaded (run Get Irrigation Detail first)');
        return;
    }

    const collected = [];
    for (const evt of vAPI.IrrigationEvents) {
        const eventId = evt.Id;
        const result = await apiCallBase('get_event_recommendation', { eventId });
        if (result && result.success) {
            collected.push({ eventId, data: result.data });
        } else {
            collected.push({ eventId, error: (result && (result.message || result.error)) || 'unknown error' });
        }
    }

    const successCount = collected.filter(c => !c.error).length;
    const next = JSON.parse(JSON.stringify(vAPI));
    next.Recommendations = collected;
    next.Pending = { toolName: 'get_event_recommendation', params: { count: vAPI.IrrigationEvents.length } };
    next.Result = {
        TokenName: 'get_event_recommendation',
        Success: successCount > 0,
        Error: successCount === collected.length ? null : `${collected.length - successCount} of ${collected.length} failed`,
        Message: `✅ ${successCount}/${collected.length} recommendations loaded`
    };

    API_receive(next);
    showResult(next.Result.Message);
    console.log('✅ get_event_recommendation loaded:', next.Recommendations);
}

// ========================================
// OVERRIDES — this page only. DOM-water-objects.js's selectToolFromGrid()/
// sendPrompt() know only reset/create/meter/update; redefining them here
// (loaded after) adds the 4 API tokens without touching that shared file.
// Falls through to the same reset/create/meter/update handling so nothing
// already working breaks. post_new_irrigation / update_irrigation are NOT
// wired here — next pass, per the plan.
// ========================================

function selectToolFromGrid(toolName) {
    const descriptions = {
        'get_token': 'POST /Token — Authenticate with CropManage and obtain a Bearer token. Every other API token needs this first.\n\nAuto-continues into Get Ranches → Get Plantings on success.',
        'get_ranches': 'GET /v2/ranches.json — Fetch all ranches for the logged-in user.\n\nRequires: Get Token first.',
        'get_plantings': 'GET /v2/ranches/{ranchGuid}/plantings.json — Fetch plantings for the selected ranch.\n\nRequires: a ranch (auto-selected from Get Ranches, or click one below).',
        'get_irrigation_detail': 'GET /v2/plantings/{plantingId}/irrigation-events/details.json — Fetch irrigation events for the selected planting.\n\nRequires: a planting (auto-selected from Get Plantings, or click one below).',
        'get_event_recommendation': 'GET /v2/irrigation-events/{eventId}.json — Fetch the recommendation for each loaded irrigation event.\n\nRequires: irrigation events (auto-runs after Get Irrigation Detail, once per event).'
    };

    const prompts = {
        'get_token': 'Get CropManage API token',
        'get_ranches': 'Get ranches from CropManage',
        'get_plantings': 'Get plantings for the selected ranch',
        'get_irrigation_detail': 'Get irrigation detail for the selected planting',
        'get_event_recommendation': 'Get recommendation for all loaded irrigation events'
    };

    const rows = document.querySelectorAll('#toolsTableBody tr');
    rows.forEach(row => { row.style.background = ''; });
    event.target.closest('tr').style.background = '#C8E6C9';

    const descDiv = document.getElementById('toolDescription');
    descDiv.style.whiteSpace = 'pre-line';
    descDiv.textContent = descriptions[toolName] || '';

    document.getElementById('promptInput').value = prompts[toolName] || '';
}

function sendPrompt() {
    const promptInput = document.getElementById('promptInput');
    const prompt = promptInput.value.trim().toLowerCase();

    if (!prompt) {
        showResult('❌ Please enter a prompt or select from dropdown');
        return;
    }

    logToChat(promptInput.value.trim(), 'P');

    if (prompt.includes('token')) {
        apiGetToken();
    }
    else if (prompt.includes('ranches')) {
        apiGetRanches();
    }
    else if (prompt.includes('plantings')) {
        apiGetPlantings();
    }
    else if (prompt.includes('get') && prompt.includes('irrigation')) {
        apiGetIrrigationDetail();
    }
    else if (prompt.includes('get') && prompt.includes('recommend')) {
        apiGetAllRecommendations();
    }
    else if (prompt.includes('reset') || prompt.includes('refresh') || prompt.includes('show all')) {
        resetTable();
    }
    else if (prompt.includes('create') && prompt.includes('next')) {
        testCreateNext();
    }
    else if (prompt.includes('read') && prompt.includes('meter')) {
        testReadMeter();
    }
    else if (prompt.includes('update')) {
        updateRecord();
    }
    else {
        showResult('❌ Unknown command. Try: get token, get ranches, get plantings, get irrigation detail, reset, create next, read meter, or update');
    }
}

// ========================================
// STARTUP — auto-fires Token → Ranches → Plantings on page load.
// addEventListener, not window.onload=, so this doesn't overwrite
// DOM-water-objects.html's own window.onload (loadOnStartup()), which
// runs separately for the grid side. Guarded — this file also gets
// require()'d server-side, where there's no document/DOMContentLoaded.
// ========================================

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        apiGetToken();
    });
}

// ========================================
// MCP TOOLS — server-side injection point. Same TOKEN_SCRIPTS/
// apiDirectFetch already proven in the browser; handlers call
// apiDirectFetch directly (no mcpMode branching — the server is never
// "offline", it always goes direct to CropManage). get_token's handler
// stores the token in vAPI so the rest of the tools' Bearer header
// keeps working, same as the browser's chain.
// ========================================

const apiWaterMcpTools = [
    {
        name: 'get_token',
        description: 'Authenticate with CropManage and obtain a Bearer token.',
        inputSchema: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['username', 'password']
        },
        handler: async (args) => {
            const result = await apiDirectFetch('get_token', args);
            if (result.success) vAPI.Token = result.data;
            return result;
        }
    },
    {
        name: 'get_ranches',
        description: 'Fetch all ranches for the authenticated user.',
        inputSchema: { type: 'object', properties: {}, required: [] },
        handler: async () => apiDirectFetch('get_ranches', {})
    },
    {
        name: 'get_plantings',
        description: 'Fetch all plantings for a ranch.',
        inputSchema: {
            type: 'object',
            properties: { ranchGuid: { type: 'string' } },
            required: ['ranchGuid']
        },
        handler: async (args) => apiDirectFetch('get_plantings', args)
    },
    {
        name: 'get_irrigation_detail',
        description: 'Fetch irrigation events for a planting.',
        inputSchema: {
            type: 'object',
            properties: { plantingId: { type: 'string' } },
            required: ['plantingId']
        },
        handler: async (args) => apiDirectFetch('get_irrigation_detail', args)
    },
    {
        name: 'get_event_recommendation',
        description: 'Fetch the full recommendation for a single irrigation event.',
        inputSchema: {
            type: 'object',
            properties: { eventId: { type: 'string' } },
            required: ['eventId']
        },
        handler: async (args) => apiDirectFetch('get_event_recommendation', args)
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = () => apiWaterMcpTools;
}

// @@@@ END api-water-science @@@@
