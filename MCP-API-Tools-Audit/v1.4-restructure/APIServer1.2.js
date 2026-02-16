/**
 * API MCP Server - CropManage Integration (Port 3101)
 * Combines MCP stdio protocol + HTTP bridge in one process
 * Port: 3101 (HTTP), stdio (MCP)
 * Tools: 8 API integration tools (authentication, fetch, POST, UPDATE, batch)
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
                                version: '1.0.0'
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

        process.stderr.write('API MCP Server started - 7 tools ready\n');
    }
}

// Create server instance
const server = new MCPServer();

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// ========================================

/**
 * APIService Component - CropManage API Integration
 * @version 1.0.0
 * @injected true
 */

const https = require('https');

// API Configuration
const API_BASE_URL = 'api.dev.cropmanage.ucanr.edu';
const API_VERSION = 'v2';
const API_VERSION_V3 = 'v3';

// API Authentication
let apiToken = null;

// Grid Data (Ranches, Plantings, Lots)
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

// User Preferences
const defaultRanchName = 'Ranch 1';

// HTTP Request Helper
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
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
            return {
                success: true,
                token: apiToken,
                message: 'Token acquired successfully'
            };
        } else {
            return {
                success: false,
                message: `Token request failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Get All Ranches
async function getRanches() {
    if (!apiToken) {
        return {
            success: false,
            message: 'No token available. Call get_token first.'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            ranchData = response.data;
            return {
                success: true,
                ranches: ranchData,
                count: ranchData.length
            };
        } else {
            return {
                success: false,
                message: `Ranches request failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Get Plantings for Selected Ranch
async function getPlantingsByRanch(ranchGuid) {
    if (!apiToken) {
        return {
            success: false,
            message: 'No token available. Call get_token first.'
        };
    }
    
    if (!ranchGuid) {
        return {
            success: false,
            message: 'Ranch GUID required'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches/${ranchGuid}/plantings.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            plantingsData = response.data;
            return {
                success: true,
                plantings: plantingsData,
                count: plantingsData.length
            };
        } else {
            return {
                success: false,
                message: `Plantings request failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Get Irrigation Event Details for Planting
async function getIrrigationDetails(plantingId) {
    if (!apiToken) {
        return {
            success: false,
            message: 'No token available. Call get_token first.'
        };
    }
    
    if (!plantingId) {
        return {
            success: false,
            message: 'Planting ID required'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/plantings/${plantingId}/irrigation-events/details.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            const events = response.data;
            return {
                success: true,
                events: events,
                count: events.length
            };
        } else if (response.statusCode === 404) {
            return {
                success: true,
                events: [],
                count: 0,
                message: 'No irrigation events found'
            };
        } else {
            return {
                success: false,
                message: `Irrigation details request failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Transform API Events to DisplayRecords Format
function transformToDisplayRecords(events) {
    return events.map((event, index) => {
        // Format date
        let scheduledDate = '-';
        if (event.EventDate) {
            const dateObj = new Date(event.EventDate);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const year = String(dateObj.getFullYear()).slice(-2);
            scheduledDate = `${month}/${day}/${year}`;
        }
        
        // Calculate hours from inches
        const recInch = parseFloat(event.RecommendedIrrigationAmount) || 0;
        const hours = event.RecommendedIrrigationTime || (recInch > 0 ? parseFloat((recInch / 0.3).toFixed(1)) : 0);
        
        const appliedInch = parseFloat(event.WaterApplied) || 0;
        const appliedHours = appliedInch > 0 ? parseFloat((appliedInch / 0.3).toFixed(1)) : 0;
        
        const intervalDays = event.RecommendedInterval ? parseFloat(event.RecommendedInterval).toFixed(1) : '0';
        const interval = intervalDays + ' days';
        
        let irrigationMethod = 'Sprinkler';
        if (event.IrrigationMethodId === 2) irrigationMethod = 'Drip';
        else if (event.IrrigationMethodId === 3) irrigationMethod = 'Micro-Sprinkler';
        
        return {
            id: index + 1,
            eventId: event.Id,
            ranch: event.RanchName || selectedRanchName || '-',
            planting: event.PlantingName || selectedPlantingName || '-',
            hours: hours,
            mgrHours: event.ManagerAmountRecommendationHours || 0,
            appliedHours: appliedHours,
            interval: interval,
            scheduledDate: scheduledDate,
            irrigationMethod: irrigationMethod,
            recommendedInches: event.RecommendedIrrigationAmount || '0',
            lastUpdatedDate: new Date().toLocaleString(),
            updatedBy: 'CropManage API',
            isNew: false,
            isOriginal: true,
            isUpdated: false,
            ranchId: event.RanchId || selectedRanchId || 0,
            plantingId: event.PlantingId || selectedPlantingId || 0,
            status: 0
        };
    });
}

// Load Events into DisplayRecords
async function loadIntoDisplayRecords(args) {
    const plantingId = args.plantingId || selectedPlantingId;
    
    if (!plantingId) {
        return {
            success: false,
            message: 'Planting ID required'
        };
    }
    
    // Fetch irrigation details
    const result = await getIrrigationDetails(plantingId);
    
    if (!result.success) {
        return result;
    }
    
    // Transform to display format
    const displayRecords = transformToDisplayRecords(result.events);
    
    // Store for reset functionality
    apiDetailData = displayRecords;
    dataSource = 'api';
    
    return {
        success: true,
        displayRecords: displayRecords,
        count: displayRecords.length,
        message: `Loaded ${displayRecords.length} irrigation records`
    };
}

// POST New Irrigation to CropManage
async function postNewIrrigation(args) {
    if (!apiToken) {
        return {
            success: false,
            message: 'No token available. Call get_token first.'
        };
    }
    
    const postData = JSON.stringify({
        PlantingId: args.plantingId,
        EventDate: args.scheduledDate,
        RecommendedIrrigationAmount: args.recommendedInches,
        WaterApplied: args.appliedHours * 0.3,
        IrrigationMethodId: args.irrigationMethod === 'Drip' ? 2 : 1
    });
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION_V3}/irrigation-events.json`,
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
            return {
                success: true,
                eventId: response.data.Id,
                message: 'Irrigation event posted successfully'
            };
        } else {
            return {
                success: false,
                message: `POST failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// UPDATE Existing Irrigation Event
async function updateIrrigationEvent(eventId, args) {
    if (!apiToken) {
        return {
            success: false,
            message: 'No token available. Call get_token first.'
        };
    }
    
    const postData = JSON.stringify({
        WaterApplied: args.appliedHours ? args.appliedHours * 0.3 : undefined,
        ManagerAmountRecommendationHours: args.mgrHours
    });
    
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
        
        if (response.statusCode === 200) {
            return {
                success: true,
                message: 'Irrigation event updated successfully'
            };
        } else {
            return {
                success: false,
                message: `UPDATE failed: ${response.statusCode}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Batch Process Queue (POST new, UPDATE existing)
async function batchPostQueue(records) {
    const results = [];
    
    for (const record of records) {
        if (record.eventId) {
            // Has eventId - UPDATE existing
            const result = await updateIrrigationEvent(record.eventId, record);
            results.push({ record, result, action: 'UPDATE' });
        } else {
            // No eventId - POST new
            const result = await postNewIrrigation(record);
            results.push({ record, result, action: 'POST' });
        }
    }
    
    const successCount = results.filter(r => r.result.success).length;
    const failCount = results.length - successCount;
    
    return {
        success: failCount === 0,
        results: results,
        summary: `Processed ${results.length} records: ${successCount} succeeded, ${failCount} failed`
    };
}

// MCP Tools Registry
const apiServiceTools = [
    {
        name: "get_token",
        description: "Authenticate with CropManage API and obtain access token. Required before any other API calls.",
        inputSchema: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "CropManage username"
                },
                password: {
                    type: "string",
                    description: "CropManage password"
                }
            },
            required: ["username", "password"]
        },
        handler: async (args) => {
            return await getToken(args.username, args.password);
        }
    },
    {
        name: "get_ranches",
        description: "Fetch all ranches from CropManage API. Requires authentication token.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: async (args) => {
            return await getRanches();
        }
    },
    {
        name: "get_plantings",
        description: "Fetch all plantings for a specific ranch. Requires authentication token and ranch GUID.",
        inputSchema: {
            type: "object",
            properties: {
                ranchGuid: {
                    type: "string",
                    description: "Ranch external GUID from CropManage"
                }
            },
            required: ["ranchGuid"]
        },
        handler: async (args) => {
            if (args.ranchGuid) {
                selectedRanchGuid = args.ranchGuid;
            }
            return await getPlantingsByRanch(selectedRanchGuid);
        }
    },
    {
        name: "get_irrigation_details",
        description: "Fetch irrigation event details for a specific planting. Includes all recommendations.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: {
                    type: "string",
                    description: "Planting ID from CropManage"
                }
            },
            required: ["plantingId"]
        },
        handler: async (args) => {
            if (args.plantingId) {
                selectedPlantingId = args.plantingId;
            }
            return await getIrrigationDetails(selectedPlantingId);
        }
    },
    {
        name: "load_into_displayRecords",
        description: "Fetch irrigation events and transform to displayRecords JSON format for dashboard. Updates data source to 'api' mode.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: {
                    type: "string",
                    description: "Planting ID from CropManage"
                }
            },
            required: []
        },
        handler: async (args) => {
            return await loadIntoDisplayRecords(args);
        }
    },
    {
        name: "post_new_irrigation",
        description: "POST a new irrigation event to CropManage.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: {
                    type: "string",
                    description: "Planting ID"
                },
                scheduledDate: {
                    type: "string",
                    description: "Event date (MM/DD/YY)"
                },
                recommendedInches: {
                    type: "number",
                    description: "Recommended irrigation in inches"
                },
                appliedHours: {
                    type: "number",
                    description: "Water applied in hours"
                },
                irrigationMethod: {
                    type: "string",
                    description: "Drip or Sprinkler"
                }
            },
            required: ["plantingId", "scheduledDate"]
        },
        handler: async (args) => {
            return await postNewIrrigation(args);
        }
    },
    {
        name: "update_irrigation",
        description: "Update an existing irrigation event in CropManage.",
        inputSchema: {
            type: "object",
            properties: {
                eventId: {
                    type: "string",
                    description: "CropManage event ID"
                },
                appliedHours: {
                    type: "number",
                    description: "Water applied in hours"
                },
                mgrHours: {
                    type: "number",
                    description: "Manager recommended hours"
                }
            },
            required: ["eventId"]
        },
        handler: async (args) => {
            return await updateIrrigationEvent(args.eventId, args);
        }
    },
    {
        name: "batch_post_queue",
        description: "Process all pending irrigation records (status=-1). Automatically POSTs new records and UPDATEs existing records.",
        inputSchema: {
            type: "object",
            properties: {
                records: {
                    type: "array",
                    description: "Array of irrigation records to process"
                }
            },
            required: ["records"]
        },
        handler: async (args) => {
            return await batchPostQueue(args.records);
        }
    }
];


// ========================================
// @@@@ MCP TOOLS: JSON FILE SERVICES v1.2 @@@@
// Note: These tools persist to server filesystem under DATA_DIR.
// ========================================

const jsonFileTools = [
  {
    name: "json_write",
    description: "Write (create/overwrite) a JSON file on the MCP server under the data directory.",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "Relative path under data dir, e.g. 'irrigation.json' or 'tables/users.json'" },
        data: { description: "Any JSON-serializable object/array" }
      },
      required: ["filepath", "data"]
    },
    handler: async (args) => {
      const result = await writeJSON(args.filepath, args.data);
      return { success: true, message: `Wrote ${args.filepath}`, ...result };
    }
  },
  {
    name: "json_read",
    description: "Read a JSON file from the MCP server data directory.",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "Relative path under data dir, e.g. 'irrigation.json'" }
      },
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
    description: "Update a JSON file by shallow-merging an object into the existing JSON (objects merge; arrays replace).",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string" },
        updates: { description: "Updates to merge into existing JSON" }
      },
      required: ["filepath", "updates"]
    },
    handler: async (args) => {
      await updateJSON(args.filepath, args.updates);
      return { success: true, message: `Updated ${args.filepath}`, filepath: args.filepath };
    }
  },
  {
    name: "json_delete",
    description: "Delete a JSON file from the MCP server data directory.",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string" }
      },
      required: ["filepath"]
    },
    handler: async (args) => {
      const result = await deleteJSON(args.filepath);
      return { success: true, ...result };
    }
  },
  {
    name: "json_list",
    description: "List JSON files in a directory under the MCP server data directory.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string", description: "Relative directory under data dir (default '.')", default: "." }
      },
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
    description: "Check whether a JSON file exists in the MCP server data directory.",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string" }
      },
      required: ["filepath"]
    },
    handler: async (args) => {
      const exists = await fileExists(args.filepath);
      return { success: true, filepath: args.filepath, exists };
    }
  },
  {
    name: "data_operation",
    description: "Generic JSON table operation using {action, table, data}. Persists to <table>.json in server data dir.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "read | write | update | delete" },
        table: { type: "string", description: "Logical table name (maps to <table>.json)" },
        data: { description: "Payload for write/update" }
      },
      required: ["action", "table"]
    },
    handler: async (args) => {
      return await handleDataOperation(args.action, args.table, args.data);
    }
  }
];

// Register all API tools with MCP server
apiServiceTools.forEach(tool => {
    server.registerTool(tool);
});

// Register JSON file service tools
jsonFileTools.forEach(tool => {
    server.registerTool(tool);
});

// ========================================
// HTTP BRIDGE (Express + CORS)
// ========================================

const app = express();
const PORT = 3101;

app.use(cors());
app.use(express.json());

// ----------------------------------------
// HTTP JSON CRUD endpoints (optional)
// Base: /api/json/*
// ----------------------------------------

// WRITE
app.post('/api/json/write', async (req, res) => {
  try {
    const { filepath, data } = req.body;
    if (!filepath) return res.status(400).json({ success: false, error: 'filepath is required' });
    const result = await writeJSON(filepath, data);
    res.json({ success: true, message: `Wrote ${filepath}`, ...result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// READ (use query param to avoid path encoding issues)
app.get('/api/json/read', async (req, res) => {
  try {
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json({ success: false, error: 'filepath is required' });
    const exists = await fileExists(filepath);
    if (!exists) return res.status(404).json({ success: false, fileNotFound: true, filepath });
    const data = await readJSON(filepath);
    res.json({ success: true, filepath, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// UPDATE
app.patch('/api/json/update', async (req, res) => {
  try {
    const { filepath, updates } = req.body;
    if (!filepath) return res.status(400).json({ success: false, error: 'filepath is required' });
    await updateJSON(filepath, updates);
    res.json({ success: true, message: `Updated ${filepath}`, filepath });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE
app.delete('/api/json/delete', async (req, res) => {
  try {
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json({ success: false, error: 'filepath is required' });
    const result = await deleteJSON(filepath);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// LIST
app.get('/api/json/list', async (req, res) => {
  try {
    const directory = req.query.directory || '.';
    const files = await listJSONFiles(directory);
    res.json({ success: true, directory, files });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// EXISTS
app.get('/api/json/exists', async (req, res) => {
  try {
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json({ success: false, error: 'filepath is required' });
    const exists = await fileExists(filepath);
    res.json({ success: true, filepath, exists });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DATA-OP
app.post('/api/json/data-operation', async (req, res) => {
  try {
    const { action, table, data } = req.body;
    const result = await handleDataOperation(action, table, data);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});




// ========================================
// @@@@ JSON FILE SERVICES (SERVER-SIDE) v1.2 @@@@
// Provides MCP tools + HTTP endpoints for JSON persistence.
// - Uses server filesystem (NOT browser file picker)
// - All paths are sandboxed to DATA_DIR
// ========================================

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_DIR = process.env.CROPCLIENT_DATA_DIR
  ? path.resolve(process.env.CROPCLIENT_DATA_DIR)
  : path.join(process.cwd(), 'data'); // default ./data next to where server is started

async function ensureDataDir() {
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
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
  try {
    await fsp.access(full, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
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

// Generic DATA_OPERATION handler (table -> table.json)
async function handleDataOperation(action, table, data) {
  if (!table || typeof table !== 'string') {
    return { success: false, error: "table is required" };
  }
  const filename = `${table}.json`;

  try {
    if (action === 'read') {
      const exists = await fileExists(filename);
      if (!exists) {
        return { success: false, error: `Table '${table}' not found.`, table, fileNotFound: true };
      }
      const result = await readJSON(filename);
      return { success: true, data: result, table };
    }

    if (action === 'write') {
      await writeJSON(filename, data);
      return { success: true, message: `${filename} written successfully`, table };
    }

    if (action === 'update') {
      const exists = await fileExists(filename);
      if (!exists) {
        return { success: false, error: `Table '${table}' not found. Cannot update non-existent file.`, table, fileNotFound: true };
      }
      await updateJSON(filename, data);
      return { success: true, message: `${filename} updated successfully`, table };
    }

    if (action === 'delete') {
      const result = await deleteJSON(filename);
      return { success: true, ...result, table };
    }

    return { success: false, error: `Unknown action '${action}'. Use read|write|update|delete`, table };
  } catch (error) {
    return { success: false, error: error.message, table };
  }
}

// Health check
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'alive',
        server: 'CropClient API MCP',
        timestamp: new Date().toISOString(),
        tools: apiServiceTools.length + jsonFileTools.length
    });
});

// List tools
app.get('/tools', (req, res) => {
    const toolList = [...apiServiceTools, ...jsonFileTools].map(t => ({
        name: t.name,
        description: t.description
    }));
    res.json({ tools: toolList });
});

// Call a tool
app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    
    try {
        const tool = [...apiServiceTools, ...jsonFileTools].find(t => t.name === toolName);
        
        if (!tool) {
            return res.status(404).json({
                success: false,
                error: `Tool not found: ${toolName}`
            });
        }
        
        const result = await tool.handler(args);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`✅ API MCP Server running on http://localhost:${PORT}`);
    console.log(`📋 Tools available: ${apiServiceTools.length + jsonFileTools.length}`);
    apiServiceTools.forEach(t => {
        console.log(`   - ${t.name}`);
    });
});

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// ========================================

// Start stdio server
server.start();
