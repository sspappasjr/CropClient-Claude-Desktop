// ============================================================
// CLIENT-AI-COMPONENT v2.2
// ============================================================
// The whole package. One component, one integration.
// Engines, prompts, JSON, CRUD, and what comes next.
//
// Sources:
//   mcp-engine  — v2.1 (George) — URL → Staging → Send, hits /tools/:toolName
//   ai-engine   — v2.1 (George + Karen) — Lilly/Karen provider switch
//   JSON tokens — from APIServer2.0.js
//========================================================//   
 //                    all code in this section is to be deleted             ...
//                                     steve (coach)  
//            -----------------------------------------------------------------------
                 all tokens and its related script "crud ..."  is trash 
//            ----------------------------------------------------------------------
//      CRUD        — from Audit-Q-v1.1 dashboard-crud component
               -----------------------------------------------------------------------
              ------------ and do not need place holders here .....................
//      Save/Restore — placeholder (APIServer 2.1) 
//       SQLite      — placeholder (future data layer)
=================================================
// Rule: APIServer2.0.js is the source of truth. Always.
// Updated: 3.5.2026
// ============================================================


// ============================================================
// MCP-ENGINE v2.1 — Token side (talks to server)
// Source: mcp-engine.js (George v2.1)
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


// ============================================================
// AI-ENGINE v2.1 — Prompt side (talks to Lilly or Karen)
// Source: ai-engine.js (George v2.1 + Karen provider support)
// ============================================================

// @@@ BEGIN ai-engine @@@

// --- ai-engine-url ---
// The AI endpoint URL. One place, one truth.
// Pick your provider: 'lilly' (OpenAI) or 'karen' (Anthropic)
function aiEngineURL(provider) {
    const providers = {
        lilly: {
            name: 'Lilly (OpenAI)',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o',
            apiKey: 'YOUR-OPENAI-KEY-HERE',
            authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
            systemInMessages: true   // OpenAI: system goes inside messages array
        },
        karen: {
            name: 'Karen (Anthropic)',
            endpoint: 'https://api.anthropic.com/v1/messages',
            model: 'claude-sonnet-4-20250514',
            apiKey: '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',
            authHeader: (key) => ({
                'x-api-key': key,
                'anthropic-version': '2023-06-01'
            }),
            systemInMessages: false  // Anthropic: system is a top-level field
        }
    };
    return providers[provider] || providers.lilly;
}


// --- ai-engine-send ---
// Send grower's question + tool list to AI provider
// Provider-aware: handles OpenAI and Anthropic request shapes
async function aiEngineSend(userMessage, conversationHistory, toolDefinitions, apiKey, provider) {
    const url = aiEngineURL(provider);

    const systemPrompt = 'You are a CropManage assistant for growers. ' +
                         'You help with irrigation records and water budgets. ' +
                         'Always call get_token first before any API calls. ' +
                         'Keep answers short — field workers dont have time.';

    let body;

    if (provider === 'karen') {
        // Anthropic: system is top-level, messages exclude system role
        // tool definitions use input_schema (not inputSchema)
        const karenTools = toolDefinitions.map(t => ({
            name: t.function ? t.function.name : t.name,
            description: t.function ? t.function.description : t.description,
            input_schema: t.function ? t.function.parameters : (t.input_schema || t.inputSchema || {})
        }));

        const messages = [...conversationHistory];
        if (userMessage) messages.push({ role: 'user', content: userMessage });

        body = {
            model: url.model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
            tools: karenTools
        };
    } else {
        // OpenAI: system inside messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
        ];
        if (userMessage) messages.push({ role: 'user', content: userMessage });

        body = {
            model: url.model,
            messages: messages,
            tools: toolDefinitions,
            tool_choice: 'auto'
        };
    }

    const response = await fetch(url.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...url.authHeader(apiKey)
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (provider === 'karen') {
        return data;                    // Anthropic returns top-level { content: [...] }
    }
    return data.choices[0].message;    // OpenAI returns choices[0].message
}


// --- ai-engine-reader ---
// Read AI response — answer or tool call?
// Handles both Lilly (OpenAI) and Karen (Anthropic) response shapes
function aiEngineReader(aiMessage, provider) {
    if (provider === 'karen') {
        // Anthropic: content[] with type "tool_use" or type "text"
        const content = aiMessage.content || [];
        const toolUses = content.filter(b => b.type === 'tool_use');

        if (toolUses.length > 0) {
            return {
                type: 'tool_call',
                calls: toolUses.map(t => ({
                    id: t.id,
                    toolName: t.name,
                    params: t.input   // already an object — no JSON.parse needed
                }))
            };
        }

        const textBlock = content.find(b => b.type === 'text');
        return {
            type: 'text',
            content: textBlock ? textBlock.text : ''
        };
    }

    // OpenAI (Lilly): tool_calls[].function.name
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        return {
            type: 'tool_call',
            calls: aiMessage.tool_calls.map(call => ({
                id: call.id,
                toolName: call.function.name,
                params: JSON.parse(call.function.arguments)  // OpenAI sends a string
            }))
        };
    }

    return {
        type: 'text',
        content: aiMessage.content
    };
}


// --- ai-engine-router ---
// Call the right tool via mcp-engine, send result back to AI
// Loops until AI gives a final text answer
// Provider-aware: Karen tool results use a different message format
async function aiEngineRouter(userMessage, toolDefinitions, apiKey, provider, serverTarget) {
    const conversationHistory = [];
    let maxLoops = 10;

    let aiMessage = await aiEngineSend(userMessage, conversationHistory, toolDefinitions, apiKey, provider);

    while (maxLoops > 0) {
        const parsed = aiEngineReader(aiMessage, provider);

        if (parsed.type === 'text') {
            return { answer: parsed.content, history: conversationHistory };
        }

        conversationHistory.push(
            provider === 'karen'
                ? { role: 'assistant', content: aiMessage.content }
                : aiMessage
        );

        for (const call of parsed.calls) {
            const staged = mcpEngineStaging(serverTarget || 'local', call.toolName, call.params);
            const result = await mcpEngineSend(staged);

            if (provider === 'karen') {
                // Anthropic: tool result goes back as a user message with tool_result block
                conversationHistory.push({
                    role: 'user',
                    content: [{
                        type: 'tool_result',
                        tool_use_id: call.id,
                        content: JSON.stringify(result)
                    }]
                });
            } else {
                // OpenAI: tool result is its own role
                conversationHistory.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify(result)
                });
            }
        }

        aiMessage = await aiEngineSend('', conversationHistory, toolDefinitions, apiKey, provider);
        maxLoops--;
    }

    return {
        answer: 'Reached maximum steps. Please try a simpler request.',
        history: conversationHistory
    };
}

// @@@ END ai-engine @@@


// ============================================================
// JSON TOKENS — 7 tools + data_operation
// Source: APIServer2.0.js (source of truth)
// These are server-side tokens called via mcpEngineSend.
// Loaders prepare the staging for each tool.
// Note: mcpEngineStaging takes (target, toolName, params)
// ============================================================

function loadJsonWrite(target, filepath, data)          { return mcpEngineStaging(target, 'json_write', { filepath, data }); }
function loadJsonRead(target, filepath)                 { return mcpEngineStaging(target, 'json_read', { filepath }); }
function loadJsonUpdate(target, filepath, updates)      { return mcpEngineStaging(target, 'json_update', { filepath, updates }); }
function loadJsonDelete(target, filepath)               { return mcpEngineStaging(target, 'json_delete', { filepath }); }
function loadJsonList(target, directory)                { return mcpEngineStaging(target, 'json_list', { directory: directory || '.' }); }
function loadJsonExists(target, filepath)               { return mcpEngineStaging(target, 'json_exists', { filepath }); }
function loadDataOperation(target, action, table, data) { return mcpEngineStaging(target, 'data_operation', { action, table, data }); }

//================DELETE ALL THIS  "CRUD" TRASH   per COACH ===============
// ========================================================
// CRUD — 5 grower workflow operations on S3 grid data
// Source: CropClient-MCP-API-Tools-Audit-Q-v1.1.html
//         @@@@ DASHBOARD_COMPONENT id:dashboard-crud @@@@
// Note: target param added for server selection
// ============================================================

function crudCreate(target, table, record)          { return loadDataOperation(target, 'write', table, record); }
function crudReset(target, table)                   { return loadDataOperation(target, 'read', table); }
function crudApply(target, table, recordId, values) { return loadDataOperation(target, 'update', table, { id: recordId, ...values }); }
function crudUpdate(target, table, data)            { return loadDataOperation(target, 'update', table, data); }
function crudDelete(target, table, recordId)        { return loadDataOperation(target, 'delete', table, { id: recordId }); }


// ============================================================
// SAVE / RESTORE — placeholder (APIServer 2.1)
// ============================================================

// TODO: Save and Restore tokens — planned for APIServer 2.1
// May be handled differently with SQLite


// ============================================================
// SQLITE — placeholder (future data layer)
// ============================================================

// TODO: SQLite integration — same CRUD operations, real database
// One component, same 5 operations, any database. Storage is pluggable.


// ============================================================
// IRRIGATION_COMPONENT v1.1 — Pure client-side CRUD
// Source: CropClient-MCP-API-Tools-Audit-Q-v1.6
//         @@@@ IRRIGATION_COMPONENT v1.1 id:irrigation-mcp @@@@
// Pure in-memory operations on displayRecords array.
// NO DOM — params in, { returnCode, statusMessage, data } out.
// Works with currentGridData / selectedRow from harness state.
// ============================================================

// @@@ BEGIN irrigation-crud @@@

// --- date helpers ---
function parseEventDate(dateStr) {
    if (!dateStr || dateStr === '-') return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        return new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
    }
    return new Date(dateStr);
}

function formatDate(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = String(date.getFullYear()).slice(-2);
    return `${m}/${d}/${y}`;
}

// --- irrigationCreateNext ---
// Creates next irrigation event for selected ranch/planting
// params: ranch, planting, records (array)
// returns: { returnCode, statusMessage, data }
function irrigationCreateNext(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const sameField = records.filter(r => r.ranch === ranch && r.planting === planting);
    if (sameField.length === 0) {
        return { returnCode: -2, statusMessage: `No records found for Ranch ${ranch} Planting ${planting}` };
    }
    sameField.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
    const last = sameField[sameField.length - 1];
    const nextDate = new Date(parseEventDate(last.scheduledDate));
    const intervalDays = Math.round(parseFloat(last.interval) || 1);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const tinyAdjust = parseFloat((Math.random() * 0.2 + 0.1).toFixed(1));
    const newRecord = {
        id: Math.max(...records.map(r => r.id)) + 1,
        ranch: last.ranch,
        planting: last.planting,
        hours: parseFloat((last.hours + tinyAdjust).toFixed(1)),
        mgrHours: parseFloat((last.mgrHours + 0.1).toFixed(1)),
        appliedHours: 0,
        interval: last.interval,
        scheduledDate: formatDate(nextDate),
        irrigationMethod: last.irrigationMethod,
        recommendedInches: last.recommendedInches,
        lastUpdatedDate: new Date().toLocaleString(),
        updatedBy: 'CropClient System',
        isNew: true, isOriginal: false, isUpdated: false,
        ranchId: last.ranchId, plantingId: last.plantingId,
        status: -1
    };
    records.forEach(r => { r.isNew = false; });
    records.push(newRecord);
    return {
        returnCode: 0,
        statusMessage: `✅ Created Next\nRanch: ${newRecord.ranch} Planting: ${newRecord.planting}\nDate: ${newRecord.scheduledDate} (interval: ${intervalDays}d)\nBudget: ${newRecord.hours}hrs`,
        data: newRecord
    };
}

// --- irrigationResetTable ---
// Resets records array to source data
// params: sourceData (array), targetRecords (array)
// returns: { returnCode, statusMessage, data }
function irrigationResetTable(sourceData, targetRecords) {
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
        return { returnCode: -1, statusMessage: '⚠️ No source data — run get_irrigation_details first' };
    }
    targetRecords.length = 0;
    sourceData.forEach(r => targetRecords.push(JSON.parse(JSON.stringify(r))));
    return {
        returnCode: 0,
        statusMessage: `✅ Reset Complete — ${targetRecords.length} records restored`,
        data: { count: targetRecords.length }
    };
}

// --- irrigationReadMeter ---
// Finds last record for ranch/planting — ready for meter reading
// params: ranch, planting, records (array)
// returns: { returnCode, statusMessage, data }
function irrigationReadMeter(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const matching = records.filter(r => r.ranch === ranch && r.planting === planting);
    if (matching.length === 0) {
        return { returnCode: -2, statusMessage: `No records found for Ranch ${ranch} Planting ${planting}` };
    }
    matching.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
    const last = matching[matching.length - 1];
    return {
        returnCode: 0,
        statusMessage: `✅ Ready for Meter Reading\nRanch: ${last.ranch} Planting: ${last.planting}\nDate: ${last.scheduledDate}\nCurrent Applied: ${last.appliedHours}\n→ Enter actual meter reading in Applied field`,
        data: last
    };
}

// --- irrigationUpdateRecord ---
// Updates record in array with patch values
// params: recordId, patch { scheduledDate, interval, mgrHours, appliedHours }, records (array)
// returns: { returnCode, statusMessage, data }
function irrigationUpdateRecord(recordId, patch, records) {
    if (!recordId) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const rec = records.find(r => r.id === recordId);
    if (!rec) {
        return { returnCode: -3, statusMessage: `Record ${recordId} not found` };
    }
    const newMgr     = parseFloat(patch.mgrHours);
    const newApplied = parseFloat(patch.appliedHours);
    if (isNaN(newMgr) || isNaN(newApplied)) {
        return { returnCode: -2, statusMessage: 'ERROR: Invalid numbers for mgrHours or appliedHours' };
    }
    if (patch.scheduledDate) rec.scheduledDate = patch.scheduledDate;
    if (patch.interval)      rec.interval      = patch.interval;
    rec.mgrHours         = newMgr;
    rec.appliedHours     = newApplied;
    rec.lastUpdatedDate  = new Date().toLocaleString();
    rec.updatedBy        = 'Field Worker';
    rec.isUpdated        = true;
    rec.status           = -1;
    return {
        returnCode: 0,
        statusMessage: `✅ Record Updated\nRanch: ${rec.ranch} Planting: ${rec.planting}\nDate: ${rec.scheduledDate}\nMgrHrs: ${newMgr}  Applied: ${newApplied}`,
        data: rec
    };
}

// @@@ END irrigation-crud @@@
