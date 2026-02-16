/**
 * APIService Component - CropManage API Integration
 * Purpose: CropManage API sync service - connects Dashboard to live API
 * Handles authentication, ranch/planting/irrigation data fetch, POST/UPDATE operations
 * Optional - Dashboard works offline without this
 * 
 * @id api-sync
 * @version 1.0
 */

const https = require('https');

// Component Metadata
const COMPONENT_ID = "api-sync";
const COMPONENT_VERSION = "1.0";

// ========================================
// VARIABLES - API Configuration
// ========================================
const API_BASE_URL = 'api.dev.cropmanage.ucanr.edu';
const API_VERSION = 'v2';
const API_VERSION_V3 = 'v3';

// ========================================
// VARIABLES - API Authentication
// ========================================
let apiToken = null;

// ========================================
// VARIABLES - Grid Data (Ranches, Plantings, Lots)
// ========================================
let ranchData = null;
let lotsData = null;
let plantingsData = null;

// ========================================
// VARIABLES - Selection State
// ========================================
let selectedRanchId = 0;
let selectedRanchGuid = '';
let selectedRanchName = '';
let selectedPlantingId = '';
let selectedPlantingName = '';
let selectedEventId = '';

// ========================================
// VARIABLES - Source Flags (for Dashboard Reset)
// ========================================
let dataSource = 'json';  // 'json' = default data, 'api' = loaded from CropManage API
let apiDetailData = [];   // Stores Grid 4 (api detail) data

// ========================================
// VARIABLES - User Preferences
// ========================================
const defaultRanchName = 'Ranch 1';

// ========================================
// FUNCTIONS - HTTP Request Helper
// ========================================

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

// ========================================
// FUNCTIONS - API Authentication
// ========================================

async function getToken(username, password) {
    const postData = JSON.stringify({
        grant_type: 'password',
        username: username,
        password: password
    });
    
    const options = {
        hostname: API_BASE_URL,
        path: '/Token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    try {
        const response = await makeRequest(options, postData);
        
        if (response.statusCode === 200 && response.data.access_token) {
            apiToken = response.data.access_token;
            return {
                success: true,
                token: apiToken,
                expires: response.data.expires_in
            };
        }
        
        return {
            success: false,
            error: 'Authentication failed',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// FUNCTIONS - Data Fetching
// ========================================

async function getRanches() {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            ranchData = response.data;
            return {
                success: true,
                ranches: response.data,
                count: response.data.length
            };
        }
        
        return {
            success: false,
            error: 'Failed to fetch ranches',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function getPlantingsByRanch(ranchGuid) {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/ranches/${ranchGuid}/plantings.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            plantingsData = response.data;
            return {
                success: true,
                plantings: response.data,
                count: response.data.length
            };
        }
        
        return {
            success: false,
            error: 'Failed to fetch plantings',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function getIrrigationDetails(plantingId) {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const options = {
        hostname: API_BASE_URL,
        path: `/${API_VERSION}/plantings/${plantingId}/irrigation-events/details.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            // Store as apiDetailData for Dashboard reset
            apiDetailData = response.data;
            dataSource = 'api';
            
            return {
                success: true,
                irrigations: response.data,
                count: response.data.length
            };
        }
        
        return {
            success: false,
            error: 'Failed to fetch irrigation details',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// FUNCTIONS - POST/UPDATE Operations
// ========================================

async function postNewIrrigation(payload) {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const postData = JSON.stringify(payload);
    
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
                result: response.data
            };
        }
        
        return {
            success: false,
            error: 'Failed to post irrigation event',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function updateIrrigationEvent(eventId, payload) {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const postData = JSON.stringify(payload);
    
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
                result: response.data
            };
        }
        
        return {
            success: false,
            error: 'Failed to update irrigation event',
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// FUNCTIONS - Batch Processing
// ========================================

async function batchPostQueue(records) {
    if (!apiToken) {
        return {
            success: false,
            error: 'Not authenticated. Call getToken first.'
        };
    }
    
    const results = {
        total: records.length,
        posted: 0,
        updated: 0,
        failed: 0,
        errors: []
    };
    
    for (const record of records) {
        if (record.status !== -1) {
            continue; // Skip records not marked for sync
        }
        
        try {
            if (record.eventId) {
                // Has eventId = UPDATE existing record
                const result = await updateIrrigationEvent(record.eventId, {
                    scheduledDate: record.scheduledDate,
                    appliedHours: record.appliedHours,
                    mgrHours: record.mgrHours
                });
                
                if (result.success) {
                    results.updated++;
                } else {
                    results.failed++;
                    results.errors.push({
                        record: record.id,
                        error: result.error
                    });
                }
            } else {
                // No eventId = POST new record
                const result = await postNewIrrigation({
                    plantingId: record.plantingId,
                    scheduledDate: record.scheduledDate,
                    appliedHours: record.appliedHours,
                    mgrHours: record.mgrHours,
                    irrigationMethod: record.irrigationMethod
                });
                
                if (result.success) {
                    results.posted++;
                } else {
                    results.failed++;
                    results.errors.push({
                        record: record.id,
                        error: result.error
                    });
                }
            }
        } catch (error) {
            results.failed++;
            results.errors.push({
                record: record.id,
                error: error.message
            });
        }
    }
    
    return {
        success: results.failed === 0,
        results: results
    };
}

// ========================================
// MCP TOOLS REGISTRY - Export for Server
// ========================================

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
        description: "Fetch irrigation event details for a specific planting. Includes all recommendations. Updates Dashboard data source to 'api' mode.",
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
        name: "post_irrigation",
        description: "Create a new irrigation event in CropManage.",
        inputSchema: {
            type: "object",
            properties: {
                plantingId: {
                    type: "string",
                    description: "Planting ID"
                },
                scheduledDate: {
                    type: "string",
                    description: "Scheduled date (MM/DD/YY format)"
                },
                appliedHours: {
                    type: "number",
                    description: "Water applied in hours"
                },
                mgrHours: {
                    type: "number",
                    description: "Manager recommended hours"
                },
                irrigationMethod: {
                    type: "string",
                    description: "Irrigation method (Drip, Sprinkler, etc.)"
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
                scheduledDate: {
                    type: "string",
                    description: "Scheduled date (MM/DD/YY format)"
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
        description: "Process all pending irrigation records (status=-1). Automatically POSTs new records and UPDATEs existing records based on presence of eventId.",
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
// MODULE EXPORTS
// ========================================

module.exports = {
    tools: apiServiceTools,
    // Export state accessors for testing/debugging
    getState: () => ({
        apiToken,
        ranchData,
        plantingsData,
        selectedRanchGuid,
        selectedPlantingId,
        dataSource
    }),
    setSelection: (ranchGuid, plantingId) => {
        if (ranchGuid) selectedRanchGuid = ranchGuid;
        if (plantingId) selectedPlantingId = plantingId;
    }
};
