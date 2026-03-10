// ============================================================
// CLIENT-AI-COMPONENT v1.0
// ============================================================
// The whole package. One component, one integration.
// Clean, injectable, viable for all uses.
//
// Modules:
//   mcp-engine          — v2.1 — URL → Staging → Send
//   ai-engine           — v2.1 — Lilly (OpenAI) + Karen (Anthropic)
//   JSON tokens         — 7 loaders, server-side tools via mcpEngineSend
//   irrigation-component — v1.1 — injected from irrigation-component.js
//
// Rule: APIServer2.0.js is the source of truth. Always.
// Updated: 3.6.2026
// Ready for injection into APIServer2.1
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
        local:      'http://localhost:3101',
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
        toolName:  toolName,
        params:    params || {}
    };
}

// --- mcp-engine-send ---
// POST to server, get result back
// Takes a staged object — not loose args
// Hits /tools/:toolName — matches APIServer2.0 HTTP bridge
// Usage: mcpEngineSend(mcpEngineStaging('production', 'get_token', { username, password }))
async function mcpEngineSend(staged) {
    try {
        const response = await fetch(staged.serverUrl + '/tools/' + staged.toolName, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(staged.params)
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
            name:             'Lilly (OpenAI)',
            endpoint:         'https://api.openai.com/v1/chat/completions',
            model:            'gpt-4o',
            apiKey:           'YOUR-OPENAI-KEY-HERE',
            authHeader:       (key) => ({ 'Authorization': 'Bearer ' + key }),
            systemInMessages: true   // OpenAI: system goes inside messages array
        },
        karen: {
            name:             'Karen (Anthropic)',
            endpoint:         'https://api.anthropic.com/v1/messages',
            model:            'claude-sonnet-4-20250514',
            apiKey:           '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',
            authHeader:       (key) => ({
                'x-api-key':          key,
                'anthropic-version':  '2023-06-01'
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
        const karenTools = toolDefinitions.map(t => ({
            name:         t.function ? t.function.name        : t.name,
            description:  t.function ? t.function.description : t.description,
            input_schema: t.function ? t.function.parameters  : (t.input_schema || t.inputSchema || {})
        }));
        const messages = [...conversationHistory];
        if (userMessage) messages.push({ role: 'user', content: userMessage });
        body = {
            model:      url.model,
            max_tokens: 1024,
            system:     systemPrompt,
            messages:   messages,
            tools:      karenTools
        };
    } else {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
        ];
        if (userMessage) messages.push({ role: 'user', content: userMessage });
        body = {
            model:       url.model,
            messages:    messages,
            tools:       toolDefinitions,
            tool_choice: 'auto'
        };
    }

    const response = await fetch(url.endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...url.authHeader(apiKey) },
        body:    JSON.stringify(body)
    });
    const data = await response.json();

    if (provider === 'karen') return data;               // Anthropic: top-level { content: [...] }
    return data.choices[0].message;                      // OpenAI: choices[0].message
}

// --- ai-engine-reader ---
// Read AI response — answer or tool call?
// Handles both Lilly (OpenAI) and Karen (Anthropic) response shapes
function aiEngineReader(aiMessage, provider) {
    if (provider === 'karen') {
        const content  = aiMessage.content || [];
        const toolUses = content.filter(b => b.type === 'tool_use');
        if (toolUses.length > 0) {
            return {
                type:  'tool_call',
                calls: toolUses.map(t => ({
                    id:       t.id,
                    toolName: t.name,
                    params:   t.input   // already an object
                }))
            };
        }
        const textBlock = content.find(b => b.type === 'text');
        return { type: 'text', content: textBlock ? textBlock.text : '' };
    }

    // OpenAI (Lilly)
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        return {
            type:  'tool_call',
            calls: aiMessage.tool_calls.map(call => ({
                id:       call.id,
                toolName: call.function.name,
                params:   JSON.parse(call.function.arguments)  // OpenAI sends a string
            }))
        };
    }
    return { type: 'text', content: aiMessage.content };
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
                conversationHistory.push({
                    role:    'user',
                    content: [{
                        type:        'tool_result',
                        tool_use_id: call.id,
                        content:     JSON.stringify(result)
                    }]
                });
            } else {
                conversationHistory.push({
                    role:         'tool',
                    tool_call_id: call.id,
                    content:      JSON.stringify(result)
                });
            }
        }

        aiMessage = await aiEngineSend('', conversationHistory, toolDefinitions, apiKey, provider);
        maxLoops--;
    }

    return {
        answer:  'Reached maximum steps. Please try a simpler request.',
        history: conversationHistory
    };
}

// @@@ END ai-engine @@@


// ============================================================
// JSON TOKENS — 7 server-side tool loaders
// Source: APIServer2.0.js (source of truth)
// Each returns a staged object ready for mcpEngineSend
// ============================================================

function loadJsonWrite(target, filepath, data)          { return mcpEngineStaging(target, 'json_write',      { filepath, data }); }
function loadJsonRead(target, filepath)                 { return mcpEngineStaging(target, 'json_read',       { filepath }); }
function loadJsonUpdate(target, filepath, updates)      { return mcpEngineStaging(target, 'json_update',     { filepath, updates }); }
function loadJsonDelete(target, filepath)               { return mcpEngineStaging(target, 'json_delete',     { filepath }); }
function loadJsonList(target, directory)                { return mcpEngineStaging(target, 'json_list',       { directory: directory || '.' }); }
function loadJsonExists(target, filepath)               { return mcpEngineStaging(target, 'json_exists',     { filepath }); }
function loadDataOperation(target, action, table, data) { return mcpEngineStaging(target, 'data_operation',  { action, table, data }); }


// ============================================================
// IRRIGATION_COMPONENT v1.1
// Injected from: AIToolKit/irrigation-component.js
// Pure MCP tokens — NO DOM — params in, { returnCode, statusMessage, data } out
// 4 CRUD tokens:  testCreateNext, resetTable, testReadMeter, updateRecord
// 2 JSON tokens:  saveDisplay, retrieveDisplay
// ============================================================

// @@@ BEGIN irrigation-component @@@

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

function testCreateNext(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const sameFieldRecords = records.filter(r => r.ranch === ranch && r.planting === planting);
    if (sameFieldRecords.length === 0) {
        return { returnCode: -2, statusMessage: `No records found for Ranch ${ranch} Planting ${planting}` };
    }
    sameFieldRecords.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
    const lastRecord   = sameFieldRecords[sameFieldRecords.length - 1];
    const nextDate     = new Date(parseEventDate(lastRecord.scheduledDate));
    const intervalDays = Math.round(parseFloat(lastRecord.interval) || 1);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const tinyAdjust  = parseFloat((Math.random() * 0.2 + 0.1).toFixed(1));
    const newRecHours = parseFloat((lastRecord.hours + tinyAdjust).toFixed(1));
    const newMgrHours = parseFloat((lastRecord.mgrHours + 0.1).toFixed(1));
    const maxId       = Math.max(...records.map(r => r.id));
    const newRecord = {
        id: maxId + 1, ranch: lastRecord.ranch, planting: lastRecord.planting,
        hours: newRecHours, mgrHours: newMgrHours, appliedHours: 0,
        interval: lastRecord.interval, scheduledDate: formatDate(nextDate),
        irrigationMethod: lastRecord.irrigationMethod, recommendedInches: lastRecord.recommendedInches,
        lastUpdatedDate: new Date().toLocaleString(), updatedBy: 'CropClient System',
        isNew: true, isOriginal: false, isUpdated: false,
        ranchId: lastRecord.ranchId, plantingId: lastRecord.plantingId, status: -1
    };
    records.forEach(r => { if (r.id !== newRecord.id) r.isNew = false; });
    records.push(newRecord);
    return {
        returnCode: 0,
        statusMessage: `✅ Created Next Irrigation\n\nRanch: ${newRecord.ranch}\nPlanting: ${newRecord.planting}\nPrevious Date: ${lastRecord.scheduledDate}\nInterval: ${intervalDays} days\nNext Date: ${newRecord.scheduledDate}\nWater Budget: ${newRecHours} hours\nManager Hours: ${newMgrHours}`,
        data: newRecord
    };
}

function resetTable(sourceData, targetRecords, dataSourceFlag) {
    if (dataSourceFlag === 'api') {
        if (!sourceData || sourceData.length === 0) {
            return { returnCode: -1, statusMessage: '⚠️ No API data stored — please refresh from CropManage first' };
        }
    } else {
        if (!sourceData || !Array.isArray(sourceData)) {
            return { returnCode: -1, statusMessage: 'Source data array required' };
        }
    }
    targetRecords.length = 0;
    sourceData.forEach(r => targetRecords.push(JSON.parse(JSON.stringify(r))));
    return {
        returnCode: 0,
        statusMessage: `✅ Reset Complete\n\nLoaded: ${targetRecords.length} irrigation records\nAll data refreshed to initial state\nReady for new operations`,
        data: { count: targetRecords.length }
    };
}

function testReadMeter(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const matchingRecords = records.filter(r => r.ranch === ranch && r.planting === planting);
    if (matchingRecords.length === 0) {
        return { returnCode: -2, statusMessage: `❌ No records found for Ranch ${ranch} Planting ${planting}` };
    }
    matchingRecords.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
    const lastRecord = matchingRecords[matchingRecords.length - 1];
    return {
        returnCode: 0,
        statusMessage: `✅ Ready for Meter Reading\n\nRanch: ${lastRecord.ranch}\nPlanting: ${lastRecord.planting}\nDate: ${lastRecord.scheduledDate}\nCurrent Water Applied: ${lastRecord.appliedHours}\n\n→ Enter actual meter reading in Water Applied field`,
        data: lastRecord
    };
}

function updateRecord(recordId, patch, records) {
    if (!recordId) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }
    const newManagerHours = parseFloat(patch.mgrHours);
    const newWaterApplied = parseFloat(patch.appliedHours);
    if (isNaN(newManagerHours) || isNaN(newWaterApplied)) {
        return { returnCode: -2, statusMessage: 'ERROR: Please enter valid numbers for Manager Hours and Water Applied.' };
    }
    const rec = records.find(r => r.id === recordId);
    if (!rec) {
        return { returnCode: -3, statusMessage: `Record ${recordId} not found` };
    }
    if (patch.scheduledDate) rec.scheduledDate = patch.scheduledDate;
    if (patch.interval)      rec.interval      = patch.interval;
    rec.mgrHours        = newManagerHours;
    rec.appliedHours    = newWaterApplied;
    rec.lastUpdatedDate = new Date().toLocaleString();
    rec.updatedBy       = 'Field Worker';
    rec.isUpdated       = true;
    rec.status          = -1;
    return {
        returnCode: 0,
        statusMessage: `✅ Record Updated Successfully\n\nRanch: ${rec.ranch}\nPlanting: ${rec.planting}\nDate: ${rec.scheduledDate}\nInterval: ${rec.interval}\nManager Hours: ${newManagerHours}\nWater Applied: ${newWaterApplied}\n\nChanges saved to working memory!`,
        data: rec
    };
}

function saveDisplay(records) {
    if (!records || !Array.isArray(records)) {
        return { returnCode: -1, statusMessage: 'Records array required' };
    }
    return {
        returnCode:    0,
        statusMessage: `Ready to save ${records.length} records`,
        data:          JSON.parse(JSON.stringify(records))
    };
}

function retrieveDisplay(jsonData, targetRecords) {
    if (!jsonData || !Array.isArray(jsonData)) {
        return { returnCode: -1, statusMessage: 'JSON data array required' };
    }
    targetRecords.length = 0;
    jsonData.forEach(r => targetRecords.push(r));
    return {
        returnCode:    0,
        statusMessage: `Loaded ${targetRecords.length} records from storage`,
        data:          { count: targetRecords.length }
    };
}

// @@@ END irrigation-component @@@
