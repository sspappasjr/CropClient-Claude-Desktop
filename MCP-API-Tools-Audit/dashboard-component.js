<script>
// Purpose: Portable irrigation dashboard with MCP CRUD tools
// Works with JSON default data (offline) or API-sourced data
// Self-contained - no external dependencies

// ========================================================================================================
// --------------------- NEW FEATURE ADDED TO EXISTING COMPONENT ----------------------------
// ========================================================================================================

// MCP Master Routing - Parse command to tool name
function parseCommandToTool(input) {
    if (input.includes('create next') || input.includes('next irrigation')) return 'create_next_irrigation';
    if (input.includes('reset table') || input.includes('reset')) return 'reset_table';
    if (input.includes('read meter') || input.includes('meter')) return 'read_meter';
    if (input.includes('update record') || input.includes('update')) return 'update_record';
    if (input.includes('get token') || input.includes('token')) return 'get_token';
    if (input.includes('get ranches') || input.includes('ranches')) return 'get_ranches';
    if (input.includes('get plantings') || input.includes('plantings')) return 'get_plantings';
    if (input.includes('get irrigation') || input.includes('irrigation details')) return 'get_irrigation_details';
    if (input.includes('load display') || input.includes('load into')) return 'load_into_displayRecords';
    if (input.includes('post new') || input.includes('post irrigation')) return 'post_new_irrigation';
    if (input.includes('update irrigation')) return 'update_irrigation';
    if (input.includes('batch post') || input.includes('batch queue')) return 'batch_post_queue';
    return null;
}

// MCP Tool Registry - Tracks which server has which tools
const mcpRegistry = {
    dashboard: {
        port: null,
        tools: ['create_next_irrigation', 'reset_table', 'read_meter', 'update_record']
    },
    api: {
        port: 3101,
        tools: ['get_token', 'get_ranches', 'get_plantings', 'get_irrigation_details', 
                'load_into_displayRecords', 'post_new_irrigation', 'update_irrigation', 'batch_post_queue']
    }
};

// Route command to correct tool/server
async function routeCommand(promptText) {
    const mode = document.getElementById('connectionMode') ? document.getElementById('connectionMode').value : 'airplane';
    const input = promptText.toLowerCase();
    
    // Parse command to tool name
    let toolName = parseCommandToTool(input);
    
    if (!toolName) {
        logToChat('❌ Command not recognized', 'M');
        return;
    }
    
    // Find which server has this tool
    let targetServer = null;
    for (const [serverName, config] of Object.entries(mcpRegistry)) {
        if (config.tools.includes(toolName)) {
            targetServer = serverName;
            break;
        }
    }
    
    if (!targetServer) {
        logToChat(`❌ Tool not registered: ${toolName}`, 'M');
        return;
    }
    
    // AIRPLANE MODE - Execute locally only (Dashboard tools)
    if (mode === 'airplane') {
        if (targetServer === 'dashboard') {
            const result = mcpTools[toolName].handler();
            logToChat('Airplane: ' + JSON.stringify(result, null, 2), 'M');
        } else {
            logToChat('Airplane: API tools unavailable', 'M');
        }
        return;
    }
    
    // LOCAL/SERVER MODE - ALL tools route through MCP server
    const url = mode === 'local' 
        ? `http://localhost:3100/mcp/execute`
        : `https://cropclient.com/mcp-dashboard/execute`;
    
    const modeLabel = mode === 'local' ? 'Local' : 'Server';
    
    try {
        logToChat(`${modeLabel}: Sending to ${url}...`, 'M');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptText, toolName })
        });
        const result = await response.json();
        logToChat(`${modeLabel}: ` + JSON.stringify(result, null, 2), 'M');
        
        // SYNC: Fetch updated records from dashboard server after dashboard tool executes
        if (targetServer === 'dashboard') {
            const recordsUrl = mode === 'local' 
                ? 'http://localhost:3100/records'
                : 'https://cropclient.com/mcp-dashboard/records';
            
            try {
                const recordsResponse = await fetch(recordsUrl);
                const recordsData = await recordsResponse.json();
                
                if (recordsData.success && recordsData.records) {
                    // Update local displayRecords with server data
                    displayRecords = recordsData.records;
                    renderTable();
                    
                    // Re-select if there was a selected record
                    if (selectedRecord) {
                        const stillExists = displayRecords.find(r => r.id === selectedRecord.id);
                        if (stillExists) {
                            selectRecord(selectedRecord.id);
                        }
                    }
                    
                    logToChat(`✅ Synced ${recordsData.records.length} records from server`, 'M');
                }
            } catch (syncError) {
                logToChat(`⚠️ Sync warning: ${syncError.message}`, 'M');
            }
        }
    } catch (error) {
        logToChat(`${modeLabel}: Error - ${error.message}`, 'M');
    }
}

// Main send function - Called by Send button
function mcpSend() {
    const chatInput = document.getElementById('chatPromptInput');
    const promptText = chatInput.value.trim();
    
    if (!promptText) return;
    
    // Log the prompt to chat
    logToChat(promptText, 'P');
    chatInput.value = '';
    
    // Route the command
    routeCommand(promptText);
}

// ========================================================================================================
// --------------------- EXISTING CODE HERE NOW --------------------------------------
// ========================================================================================================

// ========================================
// VARIABLES - Grid Storage (Default Data)
// ========================================
        const originalData = [
            { id: 1, ranch: "1", planting: "1A", hours: 1.3, mgrHours: 1.2, appliedHours: 1.15, interval: "1.5 days", scheduledDate: "10/14/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/13/24 14:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 2, ranch: "1", planting: "1A", hours: 1.2, mgrHours: 1.1, appliedHours: 1.05, interval: "1.5 days", scheduledDate: "10/16/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/15/24 09:15", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 3, ranch: "1", planting: "1A", hours: 1.4, mgrHours: 1.3, appliedHours: 0, interval: "1.5 days", scheduledDate: "10/18/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/17/24 11:20", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 4, ranch: "1", planting: "1B", hours: 1.6, mgrHours: 1.4, appliedHours: 0, interval: "1.5 days", scheduledDate: "10/20/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/19/24 08:45", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 5, ranch: "1", planting: "1B", hours: 2.1, mgrHours: 2, appliedHours: 1.95, interval: "2 days", scheduledDate: "10/12/24", irrigationMethod: "Sprinkler", recommendedInches: "0.8", lastUpdatedDate: "10/11/24 16:00", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 6, ranch: "1", planting: "1B", hours: 2.2, mgrHours: 2.1, appliedHours: 0, interval: "2 days", scheduledDate: "10/14/24", irrigationMethod: "Sprinkler", recommendedInches: "0.8", lastUpdatedDate: "10/13/24 10:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 7, ranch: "2", planting: "2A", hours: 1.8, mgrHours: 1.7, appliedHours: 1.65, interval: "1 days", scheduledDate: "10/15/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/14/24 13:20", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 8, ranch: "2", planting: "2A", hours: 1.9, mgrHours: 1.8, appliedHours: 1.75, interval: "1 days", scheduledDate: "10/16/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/15/24 14:45", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 9, ranch: "2", planting: "2A", hours: 2, mgrHours: 1.9, appliedHours: 0, interval: "1 days", scheduledDate: "10/17/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/16/24 09:00", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 10, ranch: "2", planting: "2B", hours: 1.5, mgrHours: 1.4, appliedHours: 1.35, interval: "2 days", scheduledDate: "10/13/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/12/24 15:10", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 11, ranch: "2", planting: "2B", hours: 1.6, mgrHours: 1.5, appliedHours: 0, interval: "2 days", scheduledDate: "10/15/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/14/24 12:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 12, ranch: "2", planting: "2B", hours: 1.7, mgrHours: 1.6, appliedHours: 0, interval: "2 days", scheduledDate: "10/17/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/16/24 11:15", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false }
        ];

// ========================================
// VARIABLES - Working Grid Data
// ========================================
        let irrigationData = JSON.parse(JSON.stringify(originalData));
        let displayRecords = [];
        let selectedRecord = null;

// ========================================
// MCP TOOLS REGISTRY
// ========================================
        
        const mcpTools = {
            create_next_irrigation: {
                name: "create_next_irrigation",
                description: "Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    return testCreateNext();
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
                    resetTable();
                    return { success: true, message: "Table reset complete" };
                }
            },
            read_meter: {
                name: "read_meter",
                description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    testReadMeter();
                    return { success: true, message: "Ready for meter reading" };
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
                    updateRecord();
                    return { success: true, message: "Record updated" };
                }
            }
        };

// ========================================
// FUNCTIONS - MCP Tool Caller
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

// ========================================
// FUNCTIONS - Utilities
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

        /* ========================================
        // TOOL SELECTION FROM GRID - MOVED TO COMPONENT
        // This section has been extracted to CropClient-Agent-Grid.txt component
        // ========================================

        const toolDescriptions = {
            reset: "🔄 RESET TABLE: Refreshes the irrigation data table back to original state. All created records will be removed.",
            create: "➕ CREATE NEXT: Calculates and creates the next irrigation event for the selected ranch/planting based on interval.",
            meter: "📊 READ METER: Prepares the form to enter actual meter reading for the most recent irrigation event.",
            update: "💾 UPDATE RECORD: Saves the Manager Hours and Water Applied values to the selected record."
        };

        const toolPrompts = {
            reset: "Reset table to show all irrigation records",
            create: "Create next irrigation for the selected field",
            meter: "Read meter for the selected planting",
            update: "Update water applied for selected record"
        };

        function selectToolFromGrid(toolId) {
            // Highlight the selected row
            document.querySelectorAll('#toolsTableBody tr').forEach(row => {
                row.style.background = '';
            });
            event.currentTarget.style.background = '#C8E6C9';
            
            // Show description
            document.getElementById('toolDescription').textContent = toolDescriptions[toolId];
            
            // Fill prompt input
            document.getElementById('promptInput').value = toolPrompts[toolId];
        }
        ======================================== */

// ========================================
// FUNCTIONS - Prompt Processing & Chat
// ========================================

        function sendPrompt() {
            const promptInput = document.getElementById('promptInput');
            const prompt = promptInput.value.trim().toLowerCase();
            
            if (!prompt) {
                showResult('❌ Please enter a prompt or select from dropdown');
                return;
            }
            
            // Log to chat with P code
            logToChat(promptInput.value.trim(), 'P');
            
            // Route based on prompt keywords - ALL call MCP tools
            if (prompt.includes('reset') || prompt.includes('refresh') || prompt.includes('show all')) {
                callTool('reset_table');
            }
            else if (prompt.includes('create') && prompt.includes('next')) {
                callTool('create_next_irrigation');
            }
            else if ((prompt.includes('read') && prompt.includes('meter')) || prompt.includes('apply')) {
                callTool('read_meter');
            }
            else if (prompt.includes('update')) {
                callTool('update_record');
            }
            else if (prompt.includes('get') && prompt.includes('token')) {
                getToken();
            }
            else if (prompt.includes('get') && prompt.includes('ranches')) {
                getRanches();
            }
            else if (prompt.includes('get') && prompt.includes('plantings')) {
                if (selectedRanchGuid) {
                    getPlantingsByRanch(selectedRanchGuid);
                } else {
                    showResult('❌ Select a ranch first');
                }
            }
            else if (prompt.includes('refresh') && prompt.includes('irrigation')) {
                refreshSelectedIrrigations();
            }
            else if (prompt.includes('post') && prompt.includes('irrigation')) {
                postRecordToCropManage();
            }
            else if (prompt.includes('update') && prompt.includes('cropmanage')) {
                updateRecordToCropManage();
            }
            else {
                showResult('❌ Unknown command. Try: reset, create next, read meter, update, get token, get ranches, get plantings, refresh irrigation, post irrigation');
            }
        }

        function setPromptAndSend(prompt) {
            document.getElementById('promptInput').value = prompt;
            document.getElementById('chatPromptInput').value = prompt;
            sendPrompt();
        }

        function fillPromptFromTool() {
            const selector = document.getElementById('toolSelector');
            const promptInput = document.getElementById('chatPromptInput');
            
            if (selector.value) {
                promptInput.value = selector.value;
                promptInput.focus();
                selector.value = ''; // Reset dropdown
            }
        }

        function fillChatPromptFromTool() {
            const selector = document.getElementById('dashboardToolSelector');
            const promptInput = document.getElementById('chatPromptInput');
            
            if (selector.value) {
                promptInput.value = selector.value;
                promptInput.focus();
                selector.value = ''; // Reset dropdown
            }
        }

        function sendChatPrompt() {
            const chatInput = document.getElementById('chatPromptInput');
            const prompt = chatInput.value.trim();
            
            if (!prompt) return;
            
            // Copy to main prompt input and send
            document.getElementById('promptInput').value = prompt;
            chatInput.value = '';
            sendPrompt();
        }

        function logToChat(message, type = 'P') {
            const chatLog = document.getElementById('chatLog');
            const timestamp = new Date().toLocaleTimeString();
            
            const entry = document.createElement('div');
            entry.style.marginBottom = '8px';
            entry.style.padding = '8px';
            entry.style.background = 'white';
            entry.style.borderRadius = '4px';
            entry.style.borderLeft = '3px solid ' + (type === 'P' ? '#4caf50' : '#2196F3');
            entry.style.cursor = 'pointer';
            
            const label = type === 'P' ? 'Prompt:' : 'Message:';
            
            // Create header with label on left, time on right
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.marginBottom = '4px';
            header.innerHTML = 
                '<strong style="color: ' + (type === 'P' ? '#2e7d32' : '#1976D2') + ';">' + label + '</strong>' +
                '<span style="color: #666; font-size: 0.85em;">' + timestamp + '</span>';
            
            // Create content area
            const content = document.createElement('div');
            content.style.color = '#333';
            content.style.fontSize = '0.9em';
            
            if (type === 'P') {
                // For prompts, show the text inline
                content.textContent = message;
                
                // Click to put back in prompt field
                entry.onclick = function() {
                    document.getElementById('chatPromptInput').value = message;
                    document.getElementById('chatPromptInput').focus();
                };
            } else {
                // For messages, show truncated with click to expand
                const preview = message.length > 60 ? message.substring(0, 60) + '...' : message;
                content.textContent = preview;
                
                // Click to show full message in popup
                entry.onclick = function() {
                    const popup = document.createElement('div');
                    popup.style.position = 'fixed';
                    popup.style.top = '50%';
                    popup.style.left = '50%';
                    popup.style.transform = 'translate(-50%, -50%)';
                    popup.style.background = 'white';
                    popup.style.border = '3px solid #2196F3';
                    popup.style.borderRadius = '8px';
                    popup.style.padding = '20px';
                    popup.style.maxWidth = '500px';
                    popup.style.maxHeight = '400px';
                    popup.style.overflow = 'visible';
                    popup.style.zIndex = '10000';
                    popup.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
                    
                    popup.innerHTML = 
                        '<div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 2px solid #2196F3; padding-bottom: 10px; align-items: center;">' +
                        '<strong style="color: #1976D2; font-size: 1.1em;">Message</strong>' +
                        '<button onclick="this.parentElement.parentElement.remove()" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">✕ Close</button>' +
                        '</div>' +
                        '<div style="color: #666; margin-bottom: 10px;">' + timestamp + '</div>' +
                        '<div style="text-align: left; white-space: pre-line; line-height: 1.6; color: #333; max-height: 300px; overflow-y: auto;">' + message + '</div>';
                    
                    document.body.appendChild(popup);
                };
            }
            
            entry.appendChild(header);
            entry.appendChild(content);
            chatLog.appendChild(entry);
            chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to bottom
        }

        function showResult(message) {
            logToChat(message, 'M');
        }

// ========================================
// FUNCTIONS - CRUD Operations (Reset, Create, Read, Update)
// ========================================

        function resetTable() {
            // Turn off wait queue filter to avoid black screen
            waitQueueFilter = false;
            
            // Check data source to determine how to reset
            if (dataSource === 'api') {
                // Data came from API - reload from stored Grid 4 (api detail) data
                if (apiDetailData.length > 0) {
                    loadEventsIntoDisplayRecords(apiDetailData);
                    showResult(`✅ Reset Complete - Reloaded from API Detail

Loaded: ${displayRecords.length} irrigation records from Grid 4
All changes discarded, back to API data
Ready for new operations`);
                } else {
                    showResult('⚠️ No API data stored - please refresh from CropManage first');
                }
            } else {
                // Data came from JSON - reset to original default data
                irrigationData = JSON.parse(JSON.stringify(originalData));
                displayRecords = JSON.parse(JSON.stringify(irrigationData));
                selectedRecord = null;
                
                renderTable();
                
                showResult(`✅ Table Reset Complete

Loaded: ${displayRecords.length} original irrigation records
All data refreshed to initial state
Ready for new operations`);
            }
        }

        function read() {
            displayRecords = JSON.parse(JSON.stringify(irrigationData));
            
            // Set data source flag for Reset CRUD
            dataSource = 'json';
            
            // Sort by ranch → planting → date
            displayRecords.sort((a, b) => {
                if (a.ranch < b.ranch) return -1;
                if (a.ranch > b.ranch) return 1;
                if (a.planting < b.planting) return -1;
                if (a.planting > b.planting) return 1;
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            renderTable();
        }

        function renderTable() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            // Sort by ranch, planting, then date
            displayRecords.sort((a, b) => {
                if (a.ranch < b.ranch) return -1;
                if (a.ranch > b.ranch) return 1;
                if (a.planting < b.planting) return -1;
                if (a.planting > b.planting) return 1;
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            // Filter records based on Wait Queue toggle
            const recordsToShow = waitQueueFilter 
                ? displayRecords.filter(r => r.status === -1)
                : displayRecords;
            
            recordsToShow.forEach(record => {
                const row = tbody.insertRow();
                row.dataset.recordId = record.id;
                row.onclick = () => selectRecord(record.id);
                
                if (record.isNew) {
                    row.style.background = '#E3F2FD';
                }
                
                row.insertCell(0).textContent = record.ranch;
                row.insertCell(1).textContent = record.planting;
                row.insertCell(2).textContent = record.scheduledDate;
                row.insertCell(3).textContent = record.hours;
                row.insertCell(4).textContent = record.interval;
                row.insertCell(5).textContent = record.mgrHours;
                row.insertCell(6).textContent = record.appliedHours;
            });
            
            // Update counts
            document.getElementById('recordCount').textContent = recordsToShow.length;
            
            const waitQueueCount = displayRecords.filter(r => r.status === -1).length;
            document.getElementById('waitQueueCount').textContent = waitQueueCount;
            
            // Update toggle color based on filter state
            const waitQueueToggle = document.getElementById('waitQueueToggle');
            if (waitQueueFilter) {
                waitQueueToggle.style.color = '#2196F3';  // Blue when filtering
                waitQueueToggle.style.fontWeight = '600';
            } else {
                waitQueueToggle.style.color = '#666';     // Gray when showing all
                waitQueueToggle.style.fontWeight = 'normal';
            }
            
            // Select first visible record if none selected
            if (recordsToShow.length > 0 && !selectedRecord) {
                selectRecord(recordsToShow[0].id);
            }
        }

        function toggleWaitQueue() {
            // Toggle filter state
            waitQueueFilter = !waitQueueFilter;
            
            // Clear selection to avoid multiple selected rows
            selectedRecord = null;
            
            // Re-render table with new filter
            renderTable();
            
            // Log to chat
            if (waitQueueFilter) {
                logToChat('🔍 Filtered to Records Changed (status=-1)', 'M');
            } else {
                logToChat('📊 Showing all records', 'M');
            }
        }

        function selectRecord(recordId) {
            selectedRecord = displayRecords.find(r => r.id === recordId);
            
            if (!selectedRecord) return;
            
            // Highlight row
            document.querySelectorAll('#tableBody tr').forEach(row => {
                if (parseInt(row.dataset.recordId) === recordId) {
                    row.classList.add('selected');
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    row.classList.remove('selected');
                }
            });
            
            // Populate form
            document.getElementById('formDate').value = selectedRecord.scheduledDate;
            document.getElementById('formInterval').value = selectedRecord.interval;
            document.getElementById('formRecommendation').value = selectedRecord.hours;
            const bigDisplay = document.getElementById('formRecommendationBig');
            if (bigDisplay) {
                bigDisplay.textContent = selectedRecord.hours || '-';
            }
            document.getElementById('formManagerHours').value = selectedRecord.mgrHours;
            document.getElementById('formWaterApplied').value = selectedRecord.appliedHours;
        }

        // ========================================
        // CREATE NEXT IRRIGATION (CORE TOOL #1)
        // ========================================

        function testCreateNext() {
            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }
            
            const sameFieldRecords = displayRecords.filter(r => 
                r.ranch === selectedRecord.ranch && 
                r.planting === selectedRecord.planting
            );
            
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
            
            const maxId = Math.max(...displayRecords.map(r => r.id));
            
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
            
            displayRecords.push(newRecord);
            
            // Clear isNew flag on all OTHER records (only newest shows as new)
            displayRecords.forEach(r => {
                if (r.id !== newRecord.id) {
                    r.isNew = false;
                }
            });
            
            const newRecordId = newRecord.id;
            
            displayRecords.sort((a, b) => {
                if (a.ranch < b.ranch) return -1;
                if (a.ranch > b.ranch) return 1;
                if (a.planting < b.planting) return -1;
                if (a.planting > b.planting) return 1;
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            renderTable();
            selectRecord(newRecordId);
            
            showResult(`✅ MCP TOOL #1: Created Next Irrigation
            
Ranch: ${newRecord.ranch}
Planting: ${newRecord.planting}
Previous Date: ${lastRecord.scheduledDate}
Interval: ${roundedInterval} days
Next Date: ${nextDateStr}
Water Budget: ${newRecHours} hours
Manager Hours: ${newMgrHours}

Field workers get instant water budget calculations!`);
        }

        // ========================================
        // READ METER (CORE TOOL #2)
        // ========================================

        function testReadMeter() {
            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }
            
            const targetRanch = selectedRecord.ranch;
            const targetPlanting = selectedRecord.planting;
            
            const matchingRecords = displayRecords.filter(r => 
                r.ranch === targetRanch && 
                r.planting === targetPlanting
            );
            
            if (matchingRecords.length === 0) {
                showResult(`❌ No records found for Ranch ${targetRanch} Planting ${targetPlanting}`);
                return;
            }
            
            matchingRecords.sort((a, b) => {
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            const lastRecord = matchingRecords[matchingRecords.length - 1];
            
            selectRecord(lastRecord.id);
            
            document.getElementById('formWaterApplied').value = '';
            document.getElementById('formWaterApplied').focus();
            
            showResult(`✅ MCP TOOL #2: Ready for Meter Reading

Ranch: ${lastRecord.ranch}
Planting: ${lastRecord.planting}
Date: ${lastRecord.scheduledDate}
Current Water Applied: ${lastRecord.appliedHours}

→ Enter actual meter reading in Water Applied field

Capture real usage data on-site where the work happens!`);
        }

        // ========================================
        // UPDATE RECORD (SAVE CHANGES)
        // ========================================

        function updateRecord() {
            if (!selectedRecord) {
                showResult('ERROR: No record selected. Click a row first.');
                return;
            }
            
            // SSP 2024-12-28: Added date and interval to updateRecord - user can now edit these fields
            const newDate = document.getElementById('formDate').value;
            const newInterval = document.getElementById('formInterval').value;
            const newManagerHours = parseFloat(document.getElementById('formManagerHours').value);
            const newWaterApplied = parseFloat(document.getElementById('formWaterApplied').value);
            
            if (isNaN(newManagerHours) || isNaN(newWaterApplied)) {
                showResult('ERROR: Please enter valid numbers for Manager Hours and Water Applied.');
                return;
            }
            
            const recordToUpdate = displayRecords.find(r => r.id === selectedRecord.id);
            
            if (recordToUpdate) {
                recordToUpdate.scheduledDate = newDate;
                recordToUpdate.interval = newInterval;
                recordToUpdate.mgrHours = newManagerHours;
                recordToUpdate.appliedHours = newWaterApplied;
                recordToUpdate.lastUpdatedDate = new Date().toLocaleString();
                recordToUpdate.updatedBy = "Field Worker";
                recordToUpdate.isUpdated = true;
                recordToUpdate.status = -1;  // Mark as pending - needs sync to CropManage
                
                renderTable();
                selectRecord(selectedRecord.id);
                
                showResult(`✅ Record Updated Successfully

Ranch: ${recordToUpdate.ranch}
Planting: ${recordToUpdate.planting}
Date: ${recordToUpdate.scheduledDate}
Interval: ${recordToUpdate.interval}
Manager Hours: ${newManagerHours}
Water Applied: ${newWaterApplied}

Changes saved to working memory!`);
            }
        }

        // ========================================
        // INITIALIZATION
        // ========================================

       // window.onload = function() {
       //     read();
       //     showResult('✅ CropClient Water Tools Loaded\n12 irrigation records ready.
       //       \nSelect a record and try the                                                tools above.');
      //  };

</script>
