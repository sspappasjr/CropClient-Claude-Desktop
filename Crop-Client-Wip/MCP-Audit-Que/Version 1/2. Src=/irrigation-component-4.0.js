// ================================================================
// IRRIGATION_COMPONENT v4.0
// Paired with mcp-engine-4.0.js
// ================================================================
// Purpose: Pure MCP tokens for irrigation domain operations
// - NO DOM usage in pure functions - all work with in-memory JSON data
// - Accepts parameters directly (stateless for MCP extraction)
// - Returns { returnCode, statusMessage, data } for all operations
// - Registers all 7 tools into mcp-engine via mcpEngineRegisterTool on load
//
// CRUD Tools (4):
//   1. create_next_irrigation - Create next irrigation event
//   2. reset_table            - Reset displayRecords to original/API data
//   3. read_meter             - Prepare record for meter reading
//   4. update_record          - Update record by ID
//
// JSON Tools (2):
//   1. save_display           - Save displayRecords to JSON file
//   2. retrieve_display       - Load displayRecords from JSON file
//
// Filter Tool (1):
//   1. filter_irrigation      - Filter records by ranch and/or planting
//
// Load order in HTML:
//   <script src="mcp-engine-4.0.js"></script>
//   <script src="irrigation-component-4.0.js"></script>
// ================================================================

// ----------------------------------------
// FILTER TOOL: filterDisplay
// Filters records by ranch and/or planting
// PURE: params in, result out, no DOM
// ----------------------------------------
function filterDisplay(ranch, planting, records) {
    if (!records || !Array.isArray(records)) {
        return { returnCode: -1, statusMessage: 'Records array required' };
    }

    let filtered = records;

    // Filter by ranch if provided
    if (ranch && ranch.trim() !== '') {
        filtered = filtered.filter(r => r.ranch === ranch);
    }

    // Further filter by planting if provided
    if (planting && planting.trim() !== '') {
        filtered = filtered.filter(r => r.planting === planting);
    }

    return {
        returnCode: 0,
        statusMessage: `Filtered: ${filtered.length} records${ranch ? ` for Ranch ${ranch}` : ''}${planting ? ` / Planting ${planting}` : ''}`,
        data: filtered
    };
}

// ----------------------------------------
// CRUD TOOL #1: testCreateNext
// Creates next irrigation event for selected ranch/planting
// PURE: params in, result out, no DOM
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

// ----------------------------------------
// CRUD TOOL #2: resetTable
// Resets displayRecords to source data
// PURE: params in, result out, no DOM
// ----------------------------------------
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

// ----------------------------------------
// CRUD TOOL #3: testReadMeter
// Finds last record for ranch/planting for meter reading
// PURE: params in, result out, no DOM
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

// ----------------------------------------
// CRUD TOOL #4: updateRecord
// Updates record with new values
// PURE: params in, result out, no DOM
// ----------------------------------------
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

// ----------------------------------------
// JSON TOOL #1: saveDisplay
// Saves displayRecords to JSON (for MCP persistence)
// ----------------------------------------
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

// ----------------------------------------
// JSON TOOL #2: retrieveDisplay
// Loads displayRecords from JSON (for MCP persistence)
// ----------------------------------------
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
// Handlers call pure functions above, then do UI refresh
// (renderTable, selectRecord, showResult are dashboard functions)
// ========================================

        const mcpTools = {
            filter_irrigation: {
                name: "filter_irrigation",
                description: "Filter irrigation records by ranch and/or planting. Returns matching records from the current dataset.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ranch: { type: "string", description: "Ranch name to filter by (optional)" },
                        planting: { type: "string", description: "Planting name to filter by (optional)" }
                    },
                    required: []
                },
                handler: function(params = {}) {
                    const result = filterDisplay(params.ranch, params.planting, displayRecords);

                    activeFilterRanch = params.ranch || null;
                    activeFilterPlanting = params.planting || null;

                    reapplyFilter();
                    showResult(result.statusMessage);
                    return { success: result.returnCode === 0, data: result.data };
                }
            },
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

                    const result = testCreateNext(selectedRecord.ranch, selectedRecord.planting, displayRecords);

                    if (result.returnCode === 0) {
                        renderTable();
                        selectRecord(result.data.id);
                        reapplyFilter();
                    }
                    showResult(result.statusMessage);
                    return { success: result.returnCode === 0, data: result.data };
                }
            },
            reset_table: {
                name: "reset_table",
                description: "Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data. When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    waitQueueFilter = false;
                    activeFilterRanch = null;
                    activeFilterPlanting = null;

                    const sourceData = (dataSource === 'api') ? apiDetailData : originalData;
                    const result = resetTable(sourceData, displayRecords, dataSource);

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
                description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting and focuses the Water Applied field for data entry.",
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

                    const result = testReadMeter(selectedRecord.ranch, selectedRecord.planting, displayRecords);

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
                description: "Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage.",
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

                    const patch = {
                        scheduledDate: document.getElementById('formDate').value,
                        interval: document.getElementById('formInterval').value,
                        mgrHours: document.getElementById('formManagerHours').value,
                        appliedHours: document.getElementById('formWaterApplied').value
                    };

                    const result = updateRecord(selectedRecord.id, patch, displayRecords);

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
                description: "Saves current displayRecords to JSON file for persistence.",
                inputSchema: {
                    type: "object",
                    properties: {
                        fileName: { type: "string", description: "File/table name to save to (optional, uses default)" }
                    },
                    required: []
                },
                handler: async function(params = {}) {
                    const table = params.fileName || saveFileName;
                    const result = saveDisplay(displayRecords);
                    if (result.returnCode !== 0) {
                        showResult(result.statusMessage);
                        return { success: false };
                    }
                    try {
                        const base = getDirectMcpBase();
                        await fetch(base + '/tools/data_operation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'write', table: table, data: result.data })
                        });
                        showResult(`✅ Saved ${result.data.length} records to ${table}`);
                        return { success: true, data: result.data };
                    } catch (e) {
                        showResult('❌ Save failed: ' + e.message);
                        return { success: false, error: e.message };
                    }
                }
            },
            retrieve_display: {
                name: "retrieve_display",
                description: "Loads displayRecords from JSON file.",
                inputSchema: {
                    type: "object",
                    properties: {
                        fileName: { type: "string", description: "File/table name to load from (optional, uses default)" }
                    },
                    required: []
                },
                handler: async function(params = {}) {
                    const table = params.fileName || saveFileName;
                    try {
                        const base = getDirectMcpBase();
                        const res = await fetch(base + '/tools/data_operation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'read', table: table })
                        });
                        const json = await res.json();
                        const rows = Array.isArray(json.data) ? json.data : [];
                        if (rows.length === 0) {
                            showResult('ℹ️ No saved data found — using demo data');
                            return { success: false };
                        }
                        const result = retrieveDisplay(rows, displayRecords);
                        if (result.returnCode === 0) {
                            originalData = JSON.parse(JSON.stringify(displayRecords));
                            selectedRecord = null;
                            renderTable();
                        }
                        showResult(`✅ Restored ${rows.length} records from ${table}`);
                        return { success: true, data: { count: rows.length } };
                    } catch (e) {
                        showResult('ℹ️ No saved data — using demo data');
                        return { success: false, error: e.message };
                    }
                }
            }
        };

// ========================================
// VARIABLES - JSON Save/Restore
// ========================================

        let saveFileName = 'irrigation';  // Default — changes on login

// ========================================
// FUNCTIONS - Re-apply active filter after grid redraws
// ========================================

        let activeFilterRanch = null;
        let activeFilterPlanting = null;

        function reapplyFilter() {
            if (!activeFilterRanch && !activeFilterPlanting) return;
            const tbody = document.getElementById('tableBody');
            if (!tbody) return;
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const rowRanch = row.cells[0] ? row.cells[0].textContent : '';
                const rowPlanting = row.cells[1] ? row.cells[1].textContent : '';
                let show = true;
                if (activeFilterRanch && rowRanch !== activeFilterRanch) show = false;
                if (activeFilterPlanting && rowPlanting !== activeFilterPlanting) show = false;
                row.style.display = show ? '' : 'none';
            });
        }

// ========================================
// LISTENERS - Ranch/Planting grid clicks filter irrigation grid
// ========================================

        document.getElementById('ranchesGrid').addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (!row) return;
            const name = row.textContent.trim();
            if (name === 'All Ranches') {
                mcpEngineCallTool('filter_irrigation', {});
            } else {
                mcpEngineCallTool('filter_irrigation', { ranch: name });
            }
        });

        document.getElementById('plantingsGrid').addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (!row) return;
            const name = row.textContent.trim();
            if (name === 'All Plantings') {
                mcpEngineCallTool('filter_irrigation', {});
            } else {
                mcpEngineCallTool('filter_irrigation', { planting: name, ranch: selectedRanchName || '' });
            }
        });

// ========================================
// REGISTER - Wire all irrigation tools into mcp-engine
// Runs once on script load — mcp-engine-4.0 must be loaded first
// ========================================
        if (typeof mcpEngineRegisterTool === 'function') {
            Object.values(mcpTools).forEach(function(tool) {
                mcpEngineRegisterTool(tool.name, tool.inputSchema, tool.handler);
            });
            console.log('[Irrigation-Component 4.0] Registered ' + Object.keys(mcpTools).length + ' tools into mcp-engine');
        } else {
            console.warn('[Irrigation-Component 4.0] mcpEngineRegisterTool not found — load mcp-engine-4.0 before irrigation-component-4.0');
        }
