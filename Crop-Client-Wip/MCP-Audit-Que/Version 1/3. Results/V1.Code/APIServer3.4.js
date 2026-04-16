/**
 * APIServer3.4.js — CropManage MCP Server
 * Source: 2. Src= (truth copy) | Deploy: crop-client-services/api-server/
 * Run: node APIServer3.4.js | Port: 3101
 *
 * Changes v3.3 → v3.4:
 *   - Ready for api-component-3.0.1 getToken() fix (local/online IF check)
 *   - get_token tool live and ready for MCP calls from client
 */

const readline = require('readline');
const express = require('express');
const cors = require('cors');

class MCPServer {
    constructor() {
        this.tools = new Map();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }

    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }

    async handleRequest(request) {
        const { id, method, params } = request;

        try {
            switch (method) {
                case 'initialize':
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            protocolVersion: '2024-11-05',
                            serverInfo: {
                                name: 'cropclient-api-mcp-server',
                                version: '3.4'
                            },
                            capabilities: {
                                tools: {}
                            }
                        }
                    };

                case 'tools/list':
                    const toolsList = Array.from(this.tools.values()).map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    }));
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: { tools: toolsList }
                    };

                case 'tools/call':
                    const toolName = params.name;
                    const tool = this.tools.get(toolName);

                    if (!tool) {
                        throw new Error(`Tool not found: ${toolName}`);
                    }

                    const result = await tool.handler(params.arguments || {});

                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2)
                                }
                            ]
                        }
                    };

                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    start() {
        this.rl.on('line', async (line) => {
            if (!line.trim()) return;

            try {
                const request = JSON.parse(line);
                const response = await this.handleRequest(request);
                console.log(JSON.stringify(response));
            } catch (error) {
                console.log(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: 'Parse error: ' + error.message
                    }
                }));
            }
        });

        process.stderr.write('APIServer3.3 started - stdio mode\n');
    }
}

// Create server instance
const server = new MCPServer();

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// Injected from: 2. Src=/api-component-3.3.js
// Version: 3.0 — getMcpBase clean, getEventRecommendation fixed
// ========================================

const https = require('https');

// getMcpBase — returns the server's own base URL (always live on the server)
// Parity with api-component-3.0.js — server is always local/online, never offline
function getMcpBase() {
    return `http://localhost:${process.env.PORT || 3101}`;
}

// mcpCall — calls a registered tool handler directly by name (no HTTP hop needed)
// Parity with api-component-3.0.js mcpCall — same interface, server-side execution
async function mcpCall(toolName, args = {}) {
    const tool = [...apiServiceTools, ...jsonFileTools].find(t => t.name === toolName);
    if (!tool) throw new Error(`mcpCall: tool not found: ${toolName}`);
    return await tool.handler(args);
}

// API Configuration
const API_BASE_URL = 'api.dev.cropmanage.ucanr.edu';
const API_VERSION = 'v2';
const API_VERSION_V3 = 'v3';

// API Authentication
let apiToken = null;

// Grid Data
let ranchData = null;
let lotsData = null;
let plantingsData = null;

// Selection State
let selectedRanchId = 0;
let selectedRanchGuid = '';
let selectedRanchName = '';
let selectedPlantingId = '';
let selectedPlantingName = '';
let selectedEventId = '';

// Source Flags
let dataSource = 'json';
let apiDetailData = [];

// HTTP Request Helper
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        req.on('error', (error) => { reject(error); });
        if (postData) { req.write(postData); }
        req.end();
    });
}

// Get CropManage Authentication Token
async function getToken(username, password) {
    const postData = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const options = {
        hostname: API_BASE_URL,
        path: '/Token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    try {
        const response = await makeRequest(options, postData);
        if (response.statusCode === 200) {
            apiToken = response.data.access_token;
            return { success: true, token: apiToken, message: 'Token acquired successfully' };
        }
        return { success: false, message: `Token request failed: ${response.statusCode}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Get All Ranches
async function getRanches() {
    if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches.json`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiToken}` }
    };
    try {
        const response = await makeRequest(options);
        if (response.statusCode === 200) {
            ranchData = response.data;
            return { success: true, ranches: ranchData, count: ranchData.length };
        }
        return { success: false, message: `Ranches request failed: ${response.statusCode}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Get Plantings for Ranch
async function getPlantingsByRanch(ranchGuid) {
    if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
    if (!ranchGuid) return { success: false, message: 'Ranch GUID required' };
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches/${ranchGuid}/plantings.json`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiToken}` }
    };
    try {
        const response = await makeRequest(options);
        if (response.statusCode === 200) {
            plantingsData = response.data;
            return { success: true, plantings: plantingsData, count: plantingsData.length };
        }
        return { success: false, message: `Plantings request failed: ${response.statusCode}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Get Irrigation Event Details for Planting
async function getIrrigationDetails(plantingId) {
    if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
    if (!plantingId) return { success: false, message: 'Planting ID required' };
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/plantings/${plantingId}/irrigation-events/details.json`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiToken}` }
    };
    try {
        const response = await makeRequest(options);
        if (response.statusCode === 200) {
            return { success: true, events: response.data, count: response.data.length };
        } else if (response.statusCode === 404) {
            return { success: true, events: [], count: 0, message: 'No irrigation events found' };
        }
        return { success: false, message: `Irrigation details request failed: ${response.statusCode}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Transform API Events to DisplayRecords Format
function transformToDisplayRecords(events) {
    return events.map((event, index) => {
        let scheduledDate = '-';
        if (event.EventDate) {
            const dateObj = new Date(event.EventDate);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const year = String(dateObj.getFullYear()).slice(-2);
            scheduledDate = `${month}/${day}/${year}`;
        }
        const recInch = parseFloat(event.RecommendedIrrigationAmount) || 0;
        const hours = event.RecommendedIrrigationTime || (recInch > 0 ? parseFloat((recInch / 0.3).toFixed(1)) : 0);
        const appliedInch = parseFloat(event.WaterApplied) || 0;
        const appliedHours = appliedInch > 0 ? parseFloat((appliedInch / 0.3).toFixed(1)) : 0;
        const intervalDays = event.RecommendedInterval ? parseFloat(event.RecommendedInterval).toFixed(1) : '0';
        let irrigationMethod = 'Sprinkler';
        if (event.IrrigationMethodId === 2) irrigationMethod = 'Drip';
        else if (event.IrrigationMethodId === 3) irrigationMethod = 'Micro-Sprinkler';
        return {
            id: index + 1,
            eventId: event.Id,
            ranch: event.RanchName || selectedRanchName || '-',
            planting: event.PlantingName || selectedPlantingName || '-',
            hours,
            mgrHours: event.ManagerAmountRecommendationHours || 0,
            appliedHours,
            interval: intervalDays + ' days',
            scheduledDate,
            irrigationMethod,
            recommendedInches: event.RecommendedIrrigationAmount || '0',
            lastUpdatedDate: new Date().toLocaleString(),
            updatedBy: 'CropManage API',
            isNew: false, isOriginal: true, isUpdated: false,
            ranchId: event.RanchId || selectedRanchId || 0,
            plantingId: event.PlantingId || selectedPlantingId || 0,
            status: 0
        };
    });
}

// Fetch full recommendation for a single event by ID
async function fetchEventRecommendation(eventId) {
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/irrigation-events/${eventId}.json`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiToken}` }
    };
    try {
        const response = await makeRequest(options);
        if (response.statusCode === 200) return response.data;
    } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error.message);
    }
    return null;
}

// Load Events into DisplayRecords (with full recommendations)
async function loadIntoDisplayRecords(args) {
    const plantingId = args.plantingId || selectedPlantingId;
    if (!plantingId) return { success: false, message: 'Planting ID required' };

    const result = await getIrrigationDetails(plantingId);
    if (!result.success) return result;

    const enrichedEvents = [];
    for (const event of result.events) {
        const fullEvent = await fetchEventRecommendation(event.Id);
        if (fullEvent) {
            fullEvent.RanchName = event.RanchName || selectedRanchName;
            fullEvent.PlantingName = event.PlantingName || selectedPlantingName;
            fullEvent.RanchId = event.RanchId;
            fullEvent.PlantingId = event.PlantingId;
            enrichedEvents.push(fullEvent);
        } else {
            enrichedEvents.push(event);
        }
    }

    const displayRecords = transformToDisplayRecords(enrichedEvents);
    apiDetailData = displayRecords;
    dataSource = 'api';

    return {
        success: true,
        displayRecords,
        count: displayRecords.length,
        message: `Loaded ${displayRecords.length} irrigation records (with recommendations)`
    };
}

function parseDisplayDateForServer(dateStr) {
    if (!dateStr) return null;
    const s = String(dateStr).trim();
    const parts = s.split(/[\/\-]/);
    if (parts.length < 3) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
}

async function postNewIrrigation(args) {
    if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
    const plantingId = parseInt(args.plantingId, 10);
    if (!plantingId || isNaN(plantingId)) return { success: false, message: 'plantingId required' };

    const payload = {
        eventdate: args.eventdate,
        irrigationmethodid: args.irrigationmethodid != null ? Number(args.irrigationmethodid) : 1,
        manageramountrecommendation: parseFloat(args.manageramountrecommendation) || 0,
        manageramountrecommendationhours: parseFloat(args.manageramountrecommendationhours) || 0,
        waterapplied: parseFloat(args.waterapplied) || 0,
        waterappliedhours: parseFloat(args.waterappliedhours) || 0
    };
    const postData = JSON.stringify(payload);
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION_V3}/plantings/${plantingId}/irrigation-events.json`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    try {
        const response = await makeRequest(options, postData);
        if (response.statusCode === 200 || response.statusCode === 201) {
            const id = response.data && (response.data.Id || response.data.id);
            return { success: true, eventId: id, id, message: 'Irrigation event posted successfully' };
        }
        const detail = typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data || '');
        return { success: false, message: `POST failed: ${response.statusCode}`, detail };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// UPDATE Existing Irrigation Event (same body as api-component browser PUT)
async function updateIrrigationEvent(args) {
    if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
    const eventId = args.eventId;
    if (!eventId) return { success: false, message: 'eventId required' };

    const mgrHours = parseFloat(args.mgrHours) || 0;
    const appliedHours = parseFloat(args.appliedHours) || 0;
    const managerInches = parseFloat((mgrHours * 0.3).toFixed(2));
    const appliedInches = parseFloat((appliedHours * 0.3).toFixed(2));
    const eventDateMDY = args.eventDateMDY || args.EventDate;
    if (!eventDateMDY) return { success: false, message: 'eventDateMDY required' };

    const putPayload = {
        EventDate: eventDateMDY,
        IrrigationMethodId: args.irrigationMethodId != null ? args.irrigationMethodId : 1,
        WaterApplied: appliedInches,
        WaterAppliedHours: appliedHours,
        ManagerAmountRecommendation: managerInches,
        ManagerAmountRecommendationHours: mgrHours
    };
    const postData = JSON.stringify(putPayload);
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION_V3}/irrigation-events/${eventId}.json`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    try {
        const response = await makeRequest(options, postData);
        if (response.statusCode === 200) return { success: true, message: 'Irrigation event updated successfully' };
        const detail = typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data || '');
        return { success: false, message: `UPDATE failed: ${response.statusCode}`, detail };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Batch Process Queue
async function batchPostQueue(records) {
    const results = [];
    for (const record of records) {
        if (record.eventId) {
            const d = parseDisplayDateForServer(record.scheduledDate);
            const apiDateMDY = d
                ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
                : '';
            results.push({
                record,
                result: await updateIrrigationEvent({
                    eventId: String(record.eventId),
                    eventDateMDY: apiDateMDY,
                    mgrHours: record.mgrHours,
                    appliedHours: record.appliedHours,
                    irrigationMethodId: 1
                }),
                action: 'UPDATE'
            });
        } else {
            const pid = parseInt(record.plantingId, 10);
            const d = parseDisplayDateForServer(record.scheduledDate);
            const apiDate = d
                ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                : '';
            results.push({
                record,
                result: await postNewIrrigation({
                    plantingId: String(pid),
                    eventdate: apiDate,
                    irrigationmethodid: 1,
                    manageramountrecommendation: parseFloat(record.mgrHours) || 0,
                    manageramountrecommendationhours: parseFloat(record.mgrHours) || 0,
                    waterapplied: parseFloat(record.appliedHours) || 0,
                    waterappliedhours: parseFloat(record.appliedHours) || 0
                }),
                action: 'POST'
            });
        }
    }
    const successCount = results.filter(r => r.result.success).length;
    const failCount = results.length - successCount;
    return {
        success: failCount === 0,
        results,
        summary: `Processed ${results.length} records: ${successCount} succeeded, ${failCount} failed`
    };
}

// ========================================
// MCP TOOLS REGISTRY
// ========================================
const apiServiceTools = [
    {
        name: "get_token",
        description: "Authenticate with CropManage API and obtain access token.",
        inputSchema: {
            type: "object",
            properties: {
                username: { type: "string" },
                password: { type: "string" }
            },
            required: ["username", "password"]
        },
        handler: async (args) => await getToken(args.username, args.password)
    },
    {
        name: "set_token",
        description: "Store the CropManage API token server-side. Called by client immediately after browser login. Required before any CropManage API tool call in local/online mode.",
        inputSchema: {
            type: "object",
            properties: {
                token: { type: "string", description: "CropManage Bearer token" }
            },
            required: ["token"]
        },
        handler: async (args) => {
            if (!args.token) return { success: false, message: 'token required' };
            apiToken = args.token;
            return { success: true, message: 'Token stored on server' };
        }
    },
    {
        name: "get_ranches",
        description: "Fetch all ranches from CropManage API.",
        inputSchema: { type: "object", properties: {}, required: [] },
        handler: async () => await getRanches()
    },
    {
        name: "get_plantings",
        description: "Fetch all plantings for a specific ranch.",
        inputSchema: {
            type: "object",
            properties: {
                ranchGuid: { type: "string", description: "Ranch external GUID" }
            },
            required: ["ranchGuid"]
        },
        handler: async (args) => {
            if (args.ranchGuid) {
                selectedRanchGuid = args.ranchGuid;
                if (ranchData) {
                    const ranch = ranchData.find(r => r.Ranch_External_GUID === args.ranchGuid);
                    if (ranch) selectedRanchName = ranch.Name;
                }
            }
            return await getPlantingsByRanch(selectedRanchGuid);
        }
    },
    {
        name: "get_irrigation_details",
        description: "Fetch irrigation events, enrich with recommendations, return displayRecords. Accepts single plantingId OR plantings array.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: { type: "string" },
                plantings: { type: "array", items: { type: "object" } }
            },
            required: []
        },
        handler: async (args) => {
            let plantingList = [];
            if (args.plantings && Array.isArray(args.plantings) && args.plantings.length > 0) {
                plantingList = args.plantings.map(p => ({
                    plantingId: String(p.selectedPlantingID || p.plantingId),
                    plantingName: p.selectedPlanting || p.plantingName || '',
                    ranchName: p.selectedRanch || p.ranchName || '',
                    ranchId: p.selectedRanchID || p.ranchId || 0
                }));
            } else if (args.plantingId) {
                let pName = '';
                if (plantingsData) {
                    const planting = plantingsData.find(p => String(p.Id) === String(args.plantingId));
                    if (planting) pName = planting.Name;
                }
                plantingList = [{ plantingId: String(args.plantingId), plantingName: pName, ranchName: selectedRanchName, ranchId: selectedRanchId }];
            } else {
                return { success: false, message: 'plantingId or plantings array required' };
            }

            // Step 1 — get raw events for each planting
            let allEvents = [];
            for (const entry of plantingList) {
                selectedPlantingId = entry.plantingId;
                selectedPlantingName = entry.plantingName;
                if (entry.ranchName) selectedRanchName = entry.ranchName;
                if (entry.ranchId) selectedRanchId = entry.ranchId;
                const result = await getIrrigationDetails(entry.plantingId);
                if (result.success && Array.isArray(result.events)) {
                    result.events.forEach(e => {
                        e.RanchName = entry.ranchName || selectedRanchName;
                        e.PlantingName = entry.plantingName || selectedPlantingName;
                        e.RanchId = entry.ranchId || selectedRanchId;
                        e.PlantingId = entry.plantingId || selectedPlantingId;
                    });
                    allEvents = allEvents.concat(result.events);
                }
            }

            // Step 2 — enrichment loop: get_event_recommendation per event (mirrors api-component populateIrrigationDetailsGrid)
            for (const event of allEvents) {
                const rec = await fetchEventRecommendation(event.Id);
                if (rec) {
                    event.RecommendedIrrigationAmount      = rec.RecommendedIrrigationAmount;
                    event.RecommendedIrrigationTime        = rec.RecommendationSummary?.RecommendedIrrigationTime;
                    event.ManagerAmountRecommendation      = rec.ManagerAmountRecommendation;
                    event.ManagerAmountRecommendationHours = rec.ManagerAmountRecommendationHours;
                    event.RecommendedInterval              = rec.RecommendedInterval;
                    event.IrrigationMethodId               = rec.IrrigationMethodId;
                    event.WaterApplied                     = rec.WaterApplied;
                }
            }

            // Return enriched raw events — client handles loadIntoDisplayRecords and render
            return {
                success: true,
                events: allEvents,
                count: allEvents.length,
                message: `Loaded and enriched ${allEvents.length} irrigation events from ${plantingList.length} planting(s)`
            };
        }
    },
    {
        name: "load_into_displayRecords",
        description: "Fetch irrigation events and transform to displayRecords format.",
        inputSchema: {
            type: "object",
            properties: { plantingId: { type: "string" } },
            required: []
        },
        handler: async (args) => await loadIntoDisplayRecords(args)
    },
    {
        name: "post_new_irrigation",
        description: "POST a new irrigation event to CropManage (v3 plantings/.../irrigation-events.json, server-side).",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: { type: "string" },
                eventdate: { type: "string", description: "YYYY-MM-DD" },
                irrigationmethodid: { type: "number" },
                manageramountrecommendation: { type: "number" },
                manageramountrecommendationhours: { type: "number" },
                waterapplied: { type: "number" },
                waterappliedhours: { type: "number" }
            },
            required: ["plantingId", "eventdate"]
        },
        handler: async (args) => await postNewIrrigation(args)
    },
    {
        name: "update_irrigation",
        description: "Update an existing irrigation event in CropManage (v3 PUT, server-side).",
        inputSchema: {
            type: "object",
            properties: {
                eventId: { type: "string" },
                eventDateMDY: { type: "string", description: "M/D/YYYY for CropManage" },
                appliedHours: { type: "number" },
                mgrHours: { type: "number" },
                irrigationMethodId: { type: "number" }
            },
            required: ["eventId", "eventDateMDY"]
        },
        handler: async (args) => await updateIrrigationEvent(args)
    },
    {
        name: "batch_post_queue",
        description: "Process all pending irrigation records.",
        inputSchema: {
            type: "object",
            properties: { records: { type: "array" } },
            required: ["records"]
        },
        handler: async (args) => await batchPostQueue(args.records)
    },
    // *** v3.2 GOLD TOKEN — get_event_recommendation ***
    {
        name: "get_event_recommendation",
        description: "Fetch full recommendation for a single irrigation event by event ID. Returns enriched event data with RecommendedIrrigationAmount, ManagerAmountRecommendationHours, RecommendedInterval, and RecommendationSummary.",
        inputSchema: {
            type: "object",
            properties: {
                eventId: { type: "string", description: "CropManage irrigation event ID" }
            },
            required: ["eventId"]
        },
        handler: async (args) => {
            if (!apiToken) return { success: false, message: 'No token available. Call get_token first.' };
            if (!args.eventId) return { success: false, message: 'eventId required' };
            const options = {
                hostname: API_BASE_URL,
                path: `/${API_VERSION}/irrigation-events/${args.eventId}.json`,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiToken}` }
            };
            try {
                const response = await makeRequest(options);
                if (response.statusCode === 200) return { success: true, event: response.data };
                return { success: false, message: `Event fetch failed: ${response.statusCode}` };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }
    }
    // *** END GOLD TOKEN ***
];

// ========================================
// @@@@ MCP TOOLS: JSON FILE SERVICES v1.2 @@@@
// ========================================

const jsonFileTools = [
  {
    name: "json_write",
    description: "Write a JSON file on the MCP server.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" }, data: {} },
      required: ["filepath", "data"]
    },
    handler: async (args) => {
      const result = await writeJSON(args.filepath, args.data);
      return { success: true, message: `Wrote ${args.filepath}`, ...result };
    }
  },
  {
    name: "json_read",
    description: "Read a JSON file from the MCP server.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const exists = await fileExists(args.filepath);
      if (!exists) return { success: false, filepath: args.filepath, fileNotFound: true, message: "File not found" };
      const data = await readJSON(args.filepath);
      return { success: true, filepath: args.filepath, data };
    }
  },
  {
    name: "json_update",
    description: "Update a JSON file by shallow-merging.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" }, updates: {} },
      required: ["filepath", "updates"]
    },
    handler: async (args) => {
      await updateJSON(args.filepath, args.updates);
      return { success: true, message: `Updated ${args.filepath}` };
    }
  },
  {
    name: "json_delete",
    description: "Delete a JSON file.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const result = await deleteJSON(args.filepath);
      return { success: true, ...result };
    }
  },
  {
    name: "json_list",
    description: "List JSON files in a directory.",
    inputSchema: {
      type: "object",
      properties: { directory: { type: "string", default: "." } },
      required: []
    },
    handler: async (args) => {
      const dir = args.directory || ".";
      const files = await listJSONFiles(dir);
      return { success: true, directory: dir, files };
    }
  },
  {
    name: "json_exists",
    description: "Check whether a JSON file exists.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const exists = await fileExists(args.filepath);
      return { success: true, filepath: args.filepath, exists };
    }
  },
  {
    name: "data_operation",
    description: "Generic JSON table operation using {action, table, data}.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "read | write | update | delete" },
        table: { type: "string" },
        data: {}
      },
      required: ["action", "table"]
    },
    handler: async (args) => await handleDataOperation(args.action, args.table, args.data)
  }
];

// Register all tools
apiServiceTools.forEach(tool => server.registerTool(tool));
jsonFileTools.forEach(tool => server.registerTool(tool));

// ========================================
// HTTP BRIDGE (Express + CORS)
// ========================================

const app = express();
const PORT = process.env.PORT || 3101;

app.use(cors());
app.use(express.json());

// ========================================
// @@@@ JSON FILE SERVICES (SERVER-SIDE) v1.2 @@@@
// ========================================

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_DIR = process.env.CROPCLIENT_DATA_DIR
  ? path.resolve(process.env.CROPCLIENT_DATA_DIR)
  : path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try { await fsp.mkdir(DATA_DIR, { recursive: true }); } catch (_) {}
}

function sanitizeRelPath(p) {
  if (typeof p !== 'string' || !p.trim()) throw new Error("filepath must be a non-empty string");
  const rel = p.replace(/\\/g, '/').replace(/^\/+/, '');
  if (rel.includes('..')) throw new Error("Invalid filepath: '..' is not allowed");
  return rel;
}

function resolveDataPath(relPath) {
  const rel = sanitizeRelPath(relPath);
  const full = path.resolve(DATA_DIR, rel);
  const base = path.resolve(DATA_DIR);
  if (!full.startsWith(base)) throw new Error("Invalid filepath (outside data directory)");
  return full;
}

async function fileExists(relPath) {
  const full = resolveDataPath(relPath);
  try { await fsp.access(full, fs.constants.F_OK); return true; } catch { return false; }
}

async function readJSON(relPath) {
  const full = resolveDataPath(relPath);
  const raw = await fsp.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

async function writeJSON(relPath, data) {
  const full = resolveDataPath(relPath);
  await ensureDataDir();
  const dir = path.dirname(full);
  await fsp.mkdir(dir, { recursive: true });
  const jsonText = JSON.stringify(data, null, 2);
  await fsp.writeFile(full, jsonText, 'utf-8');
  return { filepath: relPath, bytes: Buffer.byteLength(jsonText, 'utf-8') };
}

function shallowMerge(target, updates) {
  if (target && typeof target === 'object' && !Array.isArray(target) &&
      updates && typeof updates === 'object' && !Array.isArray(updates)) {
    return { ...target, ...updates };
  }
  return updates;
}

async function updateJSON(relPath, updates) {
  const exists = await fileExists(relPath);
  if (!exists) throw new Error(`File not found: ${relPath}`);
  const current = await readJSON(relPath);
  const merged = shallowMerge(current, updates);
  await writeJSON(relPath, merged);
  return { filepath: relPath };
}

async function deleteJSON(relPath) {
  const full = resolveDataPath(relPath);
  const exists = await fileExists(relPath);
  if (!exists) return { filepath: relPath, deleted: false };
  await fsp.unlink(full);
  return { filepath: relPath, deleted: true };
}

async function listJSONFiles(relDir = '.') {
  await ensureDataDir();
  const rel = sanitizeRelPath(relDir === '.' ? '' : relDir);
  const fullDir = resolveDataPath(rel || '');
  const entries = await fsp.readdir(fullDir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map(e => (rel ? `${rel}/${e.name}` : e.name));
}

async function handleDataOperation(action, table, data) {
  if (!table || typeof table !== 'string') return { success: false, error: "table is required" };
  const filename = `${table}.json`;
  try {
    if (action === 'read') {
      const exists = await fileExists(filename);
      if (!exists) return { success: false, error: `Table '${table}' not found.`, table, fileNotFound: true };
      const result = await readJSON(filename);
      return { success: true, data: result, table };
    }
    if (action === 'write') {
      await writeJSON(filename, data);
      return { success: true, message: `${filename} written successfully`, table };
    }
    if (action === 'update') {
      const exists = await fileExists(filename);
      if (!exists) return { success: false, error: `Table '${table}' not found.`, table, fileNotFound: true };
      await updateJSON(filename, data);
      return { success: true, message: `${filename} updated successfully`, table };
    }
    if (action === 'delete') {
      const result = await deleteJSON(filename);
      return { success: true, ...result, table };
    }
    return { success: false, error: `Unknown action '${action}'.`, table };
  } catch (error) {
    return { success: false, error: error.message, table };
  }
}

// Health check
app.get('/ping', (req, res) => {
    res.json({
        status: 'alive',
        server: 'CropClient APIServer3.3',
        mode: 'standalone',
        timestamp: new Date().toISOString(),
        tools: apiServiceTools.length + jsonFileTools.length
    });
});

// List tools — include inputSchema so clients (mcp-engine-4.0, AI) can validate all 17
app.get('/tools', (req, res) => {
    const toolList = [...apiServiceTools, ...jsonFileTools].map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
    }));
    res.json({ tools: toolList });
});

// Call a tool
app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    try {
        const tool = [...apiServiceTools, ...jsonFileTools].find(t => t.name === toolName);
        if (!tool) return res.status(404).json({ success: false, error: `Tool not found: ${toolName}` });
        const result = await tool.handler(args);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`APIServer3.3 running on port ${PORT}`);
    console.log(`Tools available: ${apiServiceTools.length + jsonFileTools.length}`);
});

// Start stdio MCP server (standalone only)
if (!process.env.IISNODE_VERSION) {
    server.start();
}
