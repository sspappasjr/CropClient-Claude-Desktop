// ============================================================
// IRRIGATION-COMPONENT v1.2
// ============================================================
// Pure MCP tokens for irrigation domain operations.
// NO DOM — params in, { returnCode, statusMessage, data } out.
// Injectable via @@@ markers into any harness or component.
//
// Token Logic (7 pure functions):
//   parseEventDate, formatDate (date helpers)
//   testCreateNext, resetTable, testReadMeter, updateRecord (4 CRUD)
//   saveDisplay, retrieveDisplay (2 JSON persistence)
//
// Tools Registry:
//   irrigationToolDefinitions — 6 MCP tool schemas
//
// Tool Caller:
//   callIrrigationTool(toolName, context) — maps tool name to pure function
//
// Source: CropClient-MCP-API-Tools-Audit-Q-v1.6.html
// Updated: 3.7.2026
// ============================================================

// @@@ BEGIN irrigation-component @@@

// ----------------------------------------
// DATE HELPERS
// ----------------------------------------
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


// ----------------------------------------
// CRUD TOKEN #1: testCreateNext
// Creates next irrigation event for selected ranch/planting
// params: ranch (string), planting (string), records (array)
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
function testCreateNext(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }

    const sameFieldRecords = records.filter(r =>
        r.ranch === ranch && r.planting === planting
    );

    if (sameFieldRecords.length === 0) {
        return { returnCode: -2, statusMessage: `No records found for Ranch ${ranch} Planting ${planting}` };
    }

    sameFieldRecords.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));

    const lastRecord   = sameFieldRecords[sameFieldRecords.length - 1];
    const nextDate     = new Date(parseEventDate(lastRecord.scheduledDate));
    const intervalDays = Math.round(parseFloat(lastRecord.interval) || 1);
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const tinyAdjust = parseFloat((Math.random() * 0.2 + 0.1).toFixed(1));
    const newRecHours = parseFloat((lastRecord.hours + tinyAdjust).toFixed(1));
    const newMgrHours = parseFloat((lastRecord.mgrHours + 0.1).toFixed(1));
    const maxId       = Math.max(...records.map(r => r.id));

    const newRecord = {
        id:                maxId + 1,
        ranch:             lastRecord.ranch,
        planting:          lastRecord.planting,
        hours:             newRecHours,
        mgrHours:          newMgrHours,
        appliedHours:      0,
        interval:          lastRecord.interval,
        scheduledDate:     formatDate(nextDate),
        irrigationMethod:  lastRecord.irrigationMethod,
        recommendedInches: lastRecord.recommendedInches,
        lastUpdatedDate:   new Date().toLocaleString(),
        updatedBy:         'CropClient System',
        isNew:             true,
        isOriginal:        false,
        isUpdated:         false,
        ranchId:           lastRecord.ranchId,
        plantingId:        lastRecord.plantingId,
        status:            -1
    };

    records.forEach(r => { if (r.id !== newRecord.id) r.isNew = false; });
    records.push(newRecord);

    return {
        returnCode:    0,
        statusMessage: `✅ Created Next Irrigation\n\nRanch: ${newRecord.ranch}\nPlanting: ${newRecord.planting}\nPrevious Date: ${lastRecord.scheduledDate}\nInterval: ${intervalDays} days\nNext Date: ${newRecord.scheduledDate}\nWater Budget: ${newRecHours} hours\nManager Hours: ${newMgrHours}`,
        data:          newRecord
    };
}


// ----------------------------------------
// CRUD TOKEN #2: resetTable
// Resets working records array to source data
// params: sourceData (array), targetRecords (array), dataSourceFlag (string: 'api'|'json')
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
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
        returnCode:    0,
        statusMessage: `✅ Reset Complete\n\nLoaded: ${targetRecords.length} irrigation records\nAll data refreshed to initial state\nReady for new operations`,
        data:          { count: targetRecords.length }
    };
}


// ----------------------------------------
// CRUD TOKEN #3: testReadMeter
// Finds last record for ranch/planting — ready for meter reading
// params: ranch (string), planting (string), records (array)
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
function testReadMeter(ranch, planting, records) {
    if (!ranch || !planting) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }

    const matchingRecords = records.filter(r =>
        r.ranch === ranch && r.planting === planting
    );

    if (matchingRecords.length === 0) {
        return { returnCode: -2, statusMessage: `❌ No records found for Ranch ${ranch} Planting ${planting}` };
    }

    matchingRecords.sort((a, b) => parseEventDate(a.scheduledDate) - parseEventDate(b.scheduledDate));
    const lastRecord = matchingRecords[matchingRecords.length - 1];

    return {
        returnCode:    0,
        statusMessage: `✅ Ready for Meter Reading\n\nRanch: ${lastRecord.ranch}\nPlanting: ${lastRecord.planting}\nDate: ${lastRecord.scheduledDate}\nCurrent Water Applied: ${lastRecord.appliedHours}\n\n→ Enter actual meter reading in Water Applied field`,
        data:          lastRecord
    };
}


// ----------------------------------------
// CRUD TOKEN #4: updateRecord
// Updates record in array with patch values
// params: recordId, patch { scheduledDate, interval, mgrHours, appliedHours }, records (array)
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
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
        returnCode:    0,
        statusMessage: `✅ Record Updated Successfully\n\nRanch: ${rec.ranch}\nPlanting: ${rec.planting}\nDate: ${rec.scheduledDate}\nInterval: ${rec.interval}\nManager Hours: ${newManagerHours}\nWater Applied: ${newWaterApplied}\n\nChanges saved to working memory!`,
        data:          rec
    };
}


// ----------------------------------------
// JSON TOKEN #1: saveDisplay
// Prepares displayRecords for server-side persistence via mcpEngineSend
// params: records (array)
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
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


// ----------------------------------------
// JSON TOKEN #2: retrieveDisplay
// Loads JSON data into working targetRecords array
// params: jsonData (array), targetRecords (array)
// returns: { returnCode, statusMessage, data }
// ----------------------------------------
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

// ============================================================
// MCP TOOLS REGISTRY
// Tool definitions for MCP/AI registration
// name + description + inputSchema — what the AI engine sees
// ============================================================

const irrigationToolDefinitions = [
    {
        name: "create_next_irrigation",
        description: "Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.",
        inputSchema: {
            type: "object",
            properties: {
                ranch:    { type: "string", description: "Ranch name or number" },
                planting: { type: "string", description: "Planting name" }
            },
            required: []
        }
    },
    {
        name: "reset_table",
        description: "Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data. When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "read_meter",
        description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.",
        inputSchema: {
            type: "object",
            properties: {
                ranch:    { type: "string", description: "Ranch name or number" },
                planting: { type: "string", description: "Planting name" }
            },
            required: []
        }
    },
    {
        name: "update_record",
        description: "Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage. Changes are saved to working memory.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "save_display",
        description: "Saves current displayRecords to JSON format for persistence. Returns the data ready to be written to storage.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "retrieve_display",
        description: "Loads displayRecords from JSON data. Replaces current working data with provided JSON.",
        inputSchema: {
            type: "object",
            properties: {
                jsonData: { type: "array", description: "Array of irrigation records to load" }
            },
            required: ["jsonData"]
        }
    }
];


// ============================================================
// MCP TOOL CALLER
// Maps MCP tool name → pure function call
// context = harness passes in whatever the function needs
// ============================================================

function callIrrigationTool(toolName, context) {
    switch (toolName) {
        case 'create_next_irrigation':
            return testCreateNext(context.ranch, context.planting, context.records);
        case 'reset_table':
            return resetTable(context.sourceData, context.targetRecords, context.dataSourceFlag);
        case 'read_meter':
            return testReadMeter(context.ranch, context.planting, context.records);
        case 'update_record':
            return updateRecord(context.recordId, context.patch, context.records);
        case 'save_display':
            return saveDisplay(context.records);
        case 'retrieve_display':
            return retrieveDisplay(context.jsonData, context.targetRecords);
        default:
            return { returnCode: -99, statusMessage: `Tool not found: ${toolName}`, data: null };
    }
}


// @@@ END irrigation-component @@@
