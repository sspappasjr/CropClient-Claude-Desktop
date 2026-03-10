// ============================================================
// IRRIGATION-COMPONENT v1.0
// Pure MCP tokens for irrigation domain operations
// ============================================================
// Purpose: Standalone component for irrigation CRUD + persistence
// - NO DOM dependencies (pure functions)
// - Stateless: all state passed in, results returned
// - MCP-ready: all functions follow input/output contract
// - Handlers wire to Dashboard UI (renderTable, selectRecord, showResult)
// ============================================================

// ========================================
// UTILITIES
// ========================================

function parseEventDate(dateStr) {
    const parts = dateStr.split('/');
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt('20' + parts[2]);
    return new Date(year, month, day);
}

function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
}

// ========================================
// PURE FUNCTIONS - IRRIGATION CRUD
// ========================================

// CRUD #1: Create next irrigation event
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

    sameFieldRecords.sort((a, b) => {
        const dateA = parseEventDate(a.scheduledDate);
        const dateB = parseEventDate(b.scheduledDate);
        return dateA - dateB;
    });

    const lastRecord = sameFieldRecords[sameFieldRecords.length - 1];

    const currentDate = parseEventDate(lastRecord.scheduledDate);
    const nextDate = new Date(currentDate);
    const intervalDays = parseFloat(lastRecord.interval) || 1;
    const roundedInterval = Math.round(intervalDays);

    nextDate.setDate(nextDate.getDate() + roundedInterval);
    const nextDateStr = formatDate(nextDate);

    const tinyAdjust = (Math.random() * 0.2 + 0.1);
    const newRecHours = Math.max(0.1, parseFloat((lastRecord.hours + tinyAdjust).toFixed(1)));
    const newMgrHours = parseFloat((lastRecord.mgrHours + 0.1).toFixed(1));

    const maxId = Math.max(...records.map(r => r.id));

    const newRecord = {
        id: maxId + 1,
        ranch: lastRecord.ranch,
        planting: lastRecord.planting,
        hours: newRecHours,
        mgrHours: newMgrHours,
        appliedHours: 0,
        interval: lastRecord.interval,
        scheduledDate: nextDateStr,
        irrigationMethod: lastRecord.irrigationMethod,
        recommendedInches: lastRecord.recommendedInches,
        lastUpdatedDate: new Date().toLocaleString(),
        updatedBy: "CropClient System",
        isNew: true,
        isOriginal: false,
        isUpdated: false,
        ranchId: lastRecord.ranchId,
        plantingId: lastRecord.plantingId,
        status: -1
    };

    records.push(newRecord);

    // Clear isNew flag on all OTHER records
    records.forEach(r => {
        if (r.id !== newRecord.id) {
            r.isNew = false;
        }
    });

    return {
        returnCode: 0,
        statusMessage: `✅ Created Next Irrigation\n\nRanch: ${newRecord.ranch}\nPlanting: ${newRecord.planting}\nPrevious Date: ${lastRecord.scheduledDate}\nInterval: ${roundedInterval} days\nNext Date: ${nextDateStr}\nWater Budget: ${newRecHours} hours\nManager Hours: ${newMgrHours}`,
        data: newRecord
    };
}

// CRUD #2: Reset table to source data
function resetTable(sourceData, targetRecords, dataSourceFlag) {
    if (dataSourceFlag === 'api') {
        // Data came from API - need apiDetailData passed in
        if (!sourceData || sourceData.length === 0) {
            return { returnCode: -1, statusMessage: '⚠️ No API data stored - please refresh from CropManage first' };
        }
    } else {
        // Data came from JSON default
        if (!sourceData || !Array.isArray(sourceData)) {
            return { returnCode: -1, statusMessage: 'Source data array required' };
        }
    }

    targetRecords.length = 0;
    sourceData.forEach(record => {
        targetRecords.push(JSON.parse(JSON.stringify(record)));
    });

    return {
        returnCode: 0,
        statusMessage: `✅ Reset Complete\n\nLoaded: ${targetRecords.length} irrigation records\nAll data refreshed to initial state\nReady for new operations`,
        data: { count: targetRecords.length }
    };
}

// CRUD #3: Read meter - find last record for ranch/planting
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

    matchingRecords.sort((a, b) => {
        const dateA = parseEventDate(a.scheduledDate);
        const dateB = parseEventDate(b.scheduledDate);
        return dateA - dateB;
    });

    const lastRecord = matchingRecords[matchingRecords.length - 1];

    return {
        returnCode: 0,
        statusMessage: `✅ Ready for Meter Reading\n\nRanch: ${lastRecord.ranch}\nPlanting: ${lastRecord.planting}\nDate: ${lastRecord.scheduledDate}\nCurrent Water Applied: ${lastRecord.appliedHours}\n\n→ Enter actual meter reading in Water Applied field`,
        data: lastRecord
    };
}

// CRUD #4: Update record with new values
function updateRecord(recordId, patch, records) {
    if (!recordId) {
        return { returnCode: -1, statusMessage: 'ERROR: No record selected. Click a row first.' };
    }

    const newDate = patch.scheduledDate;
    const newInterval = patch.interval;
    const newManagerHours = parseFloat(patch.mgrHours);
    const newWaterApplied = parseFloat(patch.appliedHours);

    if (isNaN(newManagerHours) || isNaN(newWaterApplied)) {
        return { returnCode: -2, statusMessage: 'ERROR: Please enter valid numbers for Manager Hours and Water Applied.' };
    }

    const recordToUpdate = records.find(r => r.id === recordId);

    if (!recordToUpdate) {
        return { returnCode: -3, statusMessage: `Record ${recordId} not found` };
    }

    recordToUpdate.scheduledDate = newDate;
    recordToUpdate.interval = newInterval;
    recordToUpdate.mgrHours = newManagerHours;
    recordToUpdate.appliedHours = newWaterApplied;
    recordToUpdate.lastUpdatedDate = new Date().toLocaleString();
    recordToUpdate.updatedBy = "Field Worker";
    recordToUpdate.isUpdated = true;
    recordToUpdate.status = -1;

    return {
        returnCode: 0,
        statusMessage: `✅ Record Updated Successfully\n\nRanch: ${recordToUpdate.ranch}\nPlanting: ${recordToUpdate.planting}\nDate: ${recordToUpdate.scheduledDate}\nInterval: ${recordToUpdate.interval}\nManager Hours: ${newManagerHours}\nWater Applied: ${newWaterApplied}\n\nChanges saved to working memory!`,
        data: recordToUpdate
    };
}

// JSON #1: Save displayRecords to JSON format
function saveDisplay(records) {
    if (!records || !Array.isArray(records)) {
        return { returnCode: -1, statusMessage: 'Records array required' };
    }

    return {
        returnCode: 0,
        statusMessage: `Ready to save ${records.length} records`,
        data: JSON.parse(JSON.stringify(records))
    };
}

// JSON #2: Load displayRecords from JSON format
function retrieveDisplay(jsonData, targetRecords) {
    if (!jsonData || !Array.isArray(jsonData)) {
        return { returnCode: -1, statusMessage: 'JSON data array required' };
    }

    targetRecords.length = 0;
    jsonData.forEach(record => targetRecords.push(record));

    return {
        returnCode: 0,
        statusMessage: `Loaded ${targetRecords.length} records from storage`,
        data: { count: targetRecords.length }
    };
}

// ========================================
// MCP TOOLS REGISTRY
// Each tool has: name, description, inputSchema, handler
// Handlers call pure functions, then UI refresh
// ========================================

const mcpTools = {
    create_next_irrigation: {
        name: "create_next_irrigation",
        description: "Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.",
        inputSchema: {
            type: "object",
            properties: {
                ranch: { type: "string", description: "Ranch name or number" },
                planting: { type: "string", description: "Planting name" }
            },
            required: []
        },
        handler: function(params = {}) {
            let targetRanch = params.ranch || (selectedRecord ? selectedRecord.ranch : null);
            let targetPlanting = params.planting || (selectedRecord ? selectedRecord.planting : null);

            // If ranch/planting provided, find and select a matching record first
            if (targetRanch && targetPlanting) {
                const matchingRecord = displayRecords.find(r =>
                    r.ranch === targetRanch && r.planting === targetPlanting
                );
                if (matchingRecord) {
                    selectRecord(matchingRecord.id);
                } else {
                    showResult(`ERROR: No records found for Ranch ${targetRanch} Planting ${targetPlanting}`);
                    return { success: false, error: 'No matching records' };
                }
            }

            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return { success: false, error: 'No record selected' };
            }

            // Call pure function from IRRIGATION_COMPONENT
            const result = testCreateNext(selectedRecord.ranch, selectedRecord.planting, displayRecords);

            // UI refresh - DASHBOARD handles this
            if (result.returnCode === 0) {
                renderTable();
                selectRecord(result.data.id);
            }
            showResult(result.statusMessage);

            return { success: result.returnCode === 0, data: result.data };
        }
    },
    reset_table: {
        name: "reset_table",
        description: "Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data (Grid 4). When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: function() {
            // Turn off wait queue filter
            waitQueueFilter = false;

            // Determine source data based on dataSource flag
            const sourceData = (dataSource === 'api') ? apiDetailData : originalData;

            // Call pure function from IRRIGATION_COMPONENT
            const result = resetTable(sourceData, displayRecords, dataSource);

            // UI refresh - DASHBOARD handles this
            if (result.returnCode === 0) {
                selectedRecord = null;
                renderTable();
            }
            showResult(result.statusMessage);

            return { success: result.returnCode === 0, data: result.data };
        }
    },
    read_meter: {
        name: "read_meter",
        description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.",
        inputSchema: {
            type: "object",
            properties: {
                ranch: { type: "string", description: "Ranch name or number" },
                planting: { type: "string", description: "Planting name" }
            },
            required: []
        },
        handler: function(params = {}) {
            let targetRanch = params.ranch || (selectedRecord ? selectedRecord.ranch : null);
            let targetPlanting = params.planting || (selectedRecord ? selectedRecord.planting : null);

            // If ranch/planting provided, find and select a matching record first
            if (targetRanch && targetPlanting) {
                const matchingRecord = displayRecords.find(r =>
                    r.ranch === targetRanch && r.planting === targetPlanting
                );
                if (matchingRecord) {
                    selectRecord(matchingRecord.id);
                } else {
                    showResult(`ERROR: No records found for Ranch ${targetRanch} Planting ${targetPlanting}`);
                    return { success: false, error: 'No matching records' };
                }
            }

            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return { success: false, error: 'No record selected' };
            }

            // Call pure function from IRRIGATION_COMPONENT
            const result = testReadMeter(selectedRecord.ranch, selectedRecord.planting, displayRecords);

            // UI refresh - DASHBOARD handles this
            if (result.returnCode === 0) {
                selectRecord(result.data.id);
                document.getElementById('formWaterApplied').value = '';
                document.getElementById('formWaterApplied').focus();
            }
            showResult(result.statusMessage);

            return { success: result.returnCode === 0, data: result.data };
        }
    },
    update_record: {
        name: "update_record",
        description: "Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage. Changes are saved to working memory.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: function() {
            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return { success: false, error: 'No record selected' };
            }

            // Get values from DOM (UI layer reads DOM)
            const patch = {
                scheduledDate: document.getElementById('formDate').value,
                interval: document.getElementById('formInterval').value,
                mgrHours: document.getElementById('formManagerHours').value,
                appliedHours: document.getElementById('formWaterApplied').value
            };

            // Call pure function from IRRIGATION_COMPONENT
            const result = updateRecord(selectedRecord.id, patch, displayRecords);

            // UI refresh - DASHBOARD handles this
            if (result.returnCode === 0) {
                renderTable();
                selectRecord(selectedRecord.id);
            }
            showResult(result.statusMessage);

            return { success: result.returnCode === 0, data: result.data };
        }
    },
    save_display: {
        name: "save_display",
        description: "Saves current displayRecords to JSON format for persistence. Returns the data ready to be written to storage.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: function() {
            const result = saveDisplay(displayRecords);
            showResult(result.statusMessage);
            return { success: result.returnCode === 0, data: result.data };
        }
    },
    retrieve_display: {
        name: "retrieve_display",
        description: "Loads displayRecords from JSON data. Replaces current working data with provided JSON.",
        inputSchema: {
            type: "object",
            properties: {
                jsonData: { type: "array", description: "Array of irrigation records to load" }
            },
            required: ["jsonData"]
        },
        handler: function(params = {}) {
            if (!params.jsonData) {
                showResult('ERROR: jsonData parameter required');
                return { success: false, error: 'jsonData required' };
            }
            const result = retrieveDisplay(params.jsonData, displayRecords);
            if (result.returnCode === 0) {
                selectedRecord = null;
                renderTable();
            }
            showResult(result.statusMessage);
            return { success: result.returnCode === 0, data: result.data };
        }
    }
};

// ========================================
// MCP TOOL CALLER
// ========================================

function callTool(toolName, params = {}) {
    const tool = mcpTools[toolName];
    if (!tool) {
        logToChat(`❌ Tool not found: ${toolName}`, 'M');
        return { success: false, error: `Tool not found: ${toolName}` };
    }

    logToChat(`🔧 ${tool.description}`, 'M');
    return tool.handler(params);
}
