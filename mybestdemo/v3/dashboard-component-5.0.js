// ============================================================
// dashboard-component.js — DASHBOARD_COMPONENT (CRUD + init)
// Extracted from CropClient-Dashboard.html / CropClient-Water-Science.html
// so both apps load ONE copy instead of two inline duplicates that drift.
// Same role/boundary as que 3.4.1's "DASHBOARD_COMPONENT id:dashboard-crud"
// fence — loaded via <script src> same as IRRIGATION_COMPONENT/mcp-engine.
// ============================================================

// ========================================
// FENCE: vDOM — hardcoded, independent of vIRR
// Same shape as vIRR. Only DOM_receive() may write vDOM.*
// ========================================

let vDOM = {
    originalRecords: [
        { id: 7, eventId: 4123147, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 0, mgrHours: 0, appliedHours: 0, interval: "0 days", scheduledDate: "05/01/26", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 8, eventId: 4126601, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 2.8, mgrHours: 0.3, appliedHours: 0.3, interval: "0 days", scheduledDate: "05/05/26", irrigationMethod: "Sprinkler", recommendedInches: "0.85", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 9, eventId: 4126611, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 0.5, mgrHours: 1.3, appliedHours: 1.3, interval: "0.9 days", scheduledDate: "05/06/26", irrigationMethod: "Sprinkler", recommendedInches: "0.14", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 10, eventId: 4126613, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 1.1, mgrHours: 2, appliedHours: 2, interval: "1.3 days", scheduledDate: "05/07/26", irrigationMethod: "Sprinkler", recommendedInches: "0.33", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 11, eventId: 4126615, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 2.9, mgrHours: 0.7, appliedHours: 0.7, interval: "0.6 days", scheduledDate: "05/10/26", irrigationMethod: "Sprinkler", recommendedInches: "0.87", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 12, eventId: 4126621, ranch: "Steve Ranch 1", planting: "Planting 1A", hours: 1.5, mgrHours: 0.8, appliedHours: 0.8, interval: "0.6 days", scheduledDate: "05/11/26", irrigationMethod: "Sprinkler", recommendedInches: "0.45", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 64196, status: 0 },
        { id: 1, eventId: 3705175, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0, mgrHours: 10.2, appliedHours: 11.2, interval: "0 days", scheduledDate: "12/22/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 2, eventId: 4123163, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.6, mgrHours: 1.1, appliedHours: 2.1, interval: "0 days", scheduledDate: "12/26/25", irrigationMethod: "Sprinkler", recommendedInches: "0.18", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 3, eventId: 4123891, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.2, mgrHours: 0.3, appliedHours: 3.3, interval: "2.8 days", scheduledDate: "12/27/25", irrigationMethod: "Sprinkler", recommendedInches: "0.06", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 4, eventId: 4123893, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.6, mgrHours: 0.5, appliedHours: 1.5, interval: "2.1 days", scheduledDate: "12/30/25", irrigationMethod: "Sprinkler", recommendedInches: "0.18", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 5, eventId: 4126605, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.3, mgrHours: 0.8, appliedHours: 0.8, interval: "2.1 days", scheduledDate: "01/01/26", irrigationMethod: "Sprinkler", recommendedInches: "0.09", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 6, eventId: 4126607, ranch: "Steve Ranch 1", planting: "Planting 1B", hours: 0.4, mgrHours: 0.9, appliedHours: 0.9, interval: "2.8 days", scheduledDate: "01/03/26", irrigationMethod: "Sprinkler", recommendedInches: "0.12", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 16150, plantingId: 57571, status: 0 },
        { id: 13, eventId: 4123815, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0, mgrHours: 0, appliedHours: 0, interval: "0 days", scheduledDate: "12/20/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 14, eventId: 4123895, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.8, mgrHours: 2.2, appliedHours: 2.5, interval: "-1.0 days", scheduledDate: "12/25/25", irrigationMethod: "Sprinkler", recommendedInches: "0.23", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 15, eventId: 4123899, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 1.2, mgrHours: 3, appliedHours: 4, interval: "5.2 days", scheduledDate: "12/30/25", irrigationMethod: "Sprinkler", recommendedInches: "0.35", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 16, eventId: 4123901, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.8, mgrHours: 4.7, appliedHours: 4.5, interval: "3.4 days", scheduledDate: "01/03/26", irrigationMethod: "Sprinkler", recommendedInches: "0.25", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 17, eventId: 4126237, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.7, mgrHours: 16, appliedHours: 19.3, interval: "3.9 days", scheduledDate: "01/06/26", irrigationMethod: "Sprinkler", recommendedInches: "0.21", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 18, eventId: 4126283, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.9, mgrHours: 16.1, appliedHours: 0, interval: "3.4 days", scheduledDate: "01/10/26", irrigationMethod: "Sprinkler", recommendedInches: "0.26", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 19, eventId: 4126285, ranch: "Steve Ranch 2", planting: "Planting 2A", hours: 0.5, mgrHours: 16.2, appliedHours: 0, interval: "4.3 days", scheduledDate: "01/13/26", irrigationMethod: "Sprinkler", recommendedInches: "0.16", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64198, status: 0 },
        { id: 20, eventId: 4123905, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0, mgrHours: 1.3, appliedHours: 4, interval: "0 days", scheduledDate: "12/19/25", irrigationMethod: "Sprinkler", recommendedInches: "0", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 23, eventId: 4123917, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0.8, mgrHours: 1.5, appliedHours: 2.1, interval: "-1.0 days", scheduledDate: "12/24/25", irrigationMethod: "Sprinkler", recommendedInches: "0.23", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 21, eventId: 4123907, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 0.9, mgrHours: 1, appliedHours: 1.2, interval: "30.9 days", scheduledDate: "12/28/25", irrigationMethod: "Sprinkler", recommendedInches: "0.26", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 22, eventId: 4123909, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 1.5, mgrHours: 1.9, appliedHours: 2.9, interval: "21.4 days", scheduledDate: "01/04/26", irrigationMethod: "Sprinkler", recommendedInches: "0.44", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 24, eventId: 4126269, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 3.6, mgrHours: 2, appliedHours: 0, interval: "22.5 days", scheduledDate: "01/25/26", irrigationMethod: "Sprinkler", recommendedInches: "1.09", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 25, eventId: 4126271, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 6.4, mgrHours: 2.1, appliedHours: 0, interval: "30.4 days", scheduledDate: "02/17/26", irrigationMethod: "Sprinkler", recommendedInches: "1.91", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 },
        { id: 26, eventId: 4126275, ranch: "Steve Ranch 2", planting: "Planting 2B", hours: 13.4, mgrHours: 2.2, appliedHours: 2.3, interval: "21.3 days", scheduledDate: "03/19/26", irrigationMethod: "Sprinkler", recommendedInches: "4.01", lastUpdatedDate: "7/20/2026, 5:41:25 PM", updatedBy: "CropManage API", isNew: false, isOriginal: true, isUpdated: false, ranchId: 17150, plantingId: 64199, status: 0 }
    ],
    displayRecords: [],
    SelectedRecord: null,
    SelectedRanch: null,
    SelectedPlanting: null,
    Result: { TokenName: null, Success: null, Record: null, Error: null, Value: null, Message: null }
};

// Only DOM_receive() may write vDOM.* — whole vIRR object crosses in, JSON copy.
function DOM_receive(irrState) {
    // SelectedRecord is its own field — every token already set it directly before crossing
    // (reset_table: first record, read_meter: the record it found). Captured here, before
    // renderTable() runs, because renderTable()'s auto-select calls selectRecord(), which
    // itself now writes vDOM.SelectedRecord — that write must not clobber what the token
    // actually asked for.
    const targetSelected = irrState.SelectedRecord || irrState.displayRecords[0] || null;

    // Whole object crosses in, already a JSON copy from the call site — taking it directly
    // creates no live link back to vIRR.
    vDOM = irrState;

    // vDOM is the only thing that renders. Sync the page's working data from vDOM's own
    // state so renderTable()/selectRecord() (untouched) draw from what just crossed the fence,
    // and Create/Meter/Update (untouched this pass) keep operating on fresh data afterward.
    irrigationData  = JSON.parse(JSON.stringify(vDOM.originalRecords));
    displayRecords  = JSON.parse(JSON.stringify(vDOM.displayRecords));
    selectedRecord  = null; // renderTable() auto-selects the first record when null; overridden below if needed

    renderTable();

    if (targetSelected && targetSelected.id !== displayRecords[0].id) {
        selectRecord(targetSelected.id);
    }

    // Token-specific UI step: read_meter clears + focuses Water Applied for entry.
    if (vDOM.Result.TokenName === 'read_meter') {
        document.getElementById('formWaterApplied').value = '';
        document.getElementById('formWaterApplied').focus();
    }

    showResult(vDOM.Result.Message);

    // vDOM pushes its WHOLE state back to vIRR — resync
    IRR_receive(JSON.parse(JSON.stringify(vDOM)));
}

// ========================================
// UTILITY FUNCTIONS
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

function showResult(message) {
    logToChat(message, 'M');

    const formMsg = document.getElementById('formMessage');
    if (formMsg) {
        formMsg.textContent = message.split('\n')[0]; // first line only, stays compact
        formMsg.style.color = (message.includes('❌') || message.startsWith('ERROR')) ? '#c62828' : '#2e7d32';
    }
}

function setDataSourceLabel(text) {
    const el = document.getElementById('dataSourceLabel');
    if (el) el.textContent = text;
}

// ========================================
// NEW: PROMPT BUTTON HELPER
// ========================================

function setPromptAndSend(promptText) {
    document.getElementById('promptInput').value = promptText;
    sendPrompt();
}

// ========================================
// TOOL SELECTION
// ========================================

function selectToolFromGrid(toolName) {
    const descriptions = {
        'reset': 'Refresh the Irrigation Table to Original - Reloads all 12 irrigation records and resets any filters\n\nGet back to a clean slate instantly!',
        'create': 'Create next irrigation for the selected field and calculate water budget - Automatically calculates the next irrigation date based on interval\n\nField workers get instant water budget calculations!',
        'meter': 'Read water meter for the selected planting and prepare for water applied entry - Selects the most recent record and clears the water applied field for new entry\n\nCapture real usage data on-site where the work happens!',
        'update': 'After Read Meter has selected the correct irrigation it is READY to enter the water meter hours. Update will store the water applied entry - Saves manager hours and water applied values\n\nChanges saved to working memory!'
    };

    const prompts = {
        'reset': 'Reset table to show all irrigation records',
        'create': 'Create next irrigation for the selected field and calculate water budget',
        'meter': 'Read water meter for the selected planting and prepare for water applied entry',
        'update': 'Update water applied for selected record'
    };

    // Highlight selected row
    const rows = document.querySelectorAll('#toolsTableBody tr');
    rows.forEach(row => {
        row.style.background = '';
    });
    event.target.closest('tr').style.background = '#C8E6C9';

    // Show description
    const descDiv = document.getElementById('toolDescription');
    descDiv.style.whiteSpace = 'pre-line'; // Respect \n line breaks
    descDiv.textContent = descriptions[toolName] || '';

    // Set prompt text
    document.getElementById('promptInput').value = prompts[toolName] || '';
}

// ========================================
// SEND PROMPT (MAIN ROUTER)
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

    // Route based on prompt keywords
    if (prompt.includes('reset') || prompt.includes('refresh') || prompt.includes('show all')) {
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
        showResult('❌ Unknown command. Try: reset, create next, read meter, or update');
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

// ========================================
// READ (LOAD TABLE)
// ========================================

function read() {
    displayRecords = JSON.parse(JSON.stringify(irrigationData));
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    displayRecords.forEach(record => {
        const row = tbody.insertRow();
        row.dataset.recordId = record.id;
        row.onclick = () => {
            selectRecord(record.id);
            showResult(`Record ${record.id} selected`);
        };

        row.insertCell(0).textContent = record.ranch;
        row.insertCell(1).textContent = record.planting;
        row.insertCell(2).textContent = record.scheduledDate;
        row.insertCell(3).textContent = record.hours;
        row.insertCell(4).textContent = record.interval;
        row.insertCell(5).textContent = record.mgrHours;
        row.insertCell(6).textContent = record.appliedHours;
    });

    // Update record count and queue count (status === -1 means "queued, not yet synced")
    document.getElementById('recordCount').textContent = displayRecords.length;
    document.getElementById('queueCount').textContent = displayRecords.filter(r => r.status === -1).length;

    // Auto-select first record
    if (displayRecords.length > 0 && !selectedRecord) {
        selectRecord(displayRecords[0].id);
    }
}

function selectRecord(recordId) {
    selectedRecord = displayRecords.find(r => r.id === recordId);

    if (!selectedRecord) return;

    // Highlight row
    document.querySelectorAll('#tableBody tr').forEach(row => {
        if (parseInt(row.dataset.recordId) === recordId) {
            row.classList.add('selected');
            // Scroll selected row into view
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            row.classList.remove('selected');
        }
    });

    // Populate form
    document.getElementById('formDate').value = selectedRecord.scheduledDate;
    document.getElementById('formInterval').value = selectedRecord.interval + ' days';
    document.getElementById('formRecommendation').value = selectedRecord.hours;
    // Update the big green display
    const bigDisplay = document.getElementById('formRecommendationBig');
    if (bigDisplay) {
        bigDisplay.textContent = selectedRecord.hours || '-';
    }
    document.getElementById('formManagerHours').value = selectedRecord.mgrHours;
    document.getElementById('formWaterApplied').value = selectedRecord.appliedHours;

    // A manual row click is a selection change same as a token's — vDOM.SelectedRecord
    // is what tokens read, so it has to be current here too, not just after a token runs.
    vDOM.SelectedRecord   = selectedRecord;
    vDOM.SelectedRanch    = selectedRecord.ranch;
    vDOM.SelectedPlanting = selectedRecord.planting;
    IRR_receive(JSON.parse(JSON.stringify(vDOM)));
}

// ========================================
// INITIALIZATION
// ========================================

window.onload = function() {
    // Sync CURRENT_TARGET from the dropdown's actual value BEFORE loading
    // anything — matches Crop-Client-MCP-Audit-Que.src3.4.1.html's onload.
    // Previously CURRENT_TARGET only came from its hardcoded 'let' literal,
    // never from the DOM, so it could silently disagree with what #envSelect
    // shows on screen.
    const sel = document.getElementById('envSelect');
    const mode = (sel && sel.value) || 'local';
    setEnvMode(mode);

    // Startup runs through the fence too, so vIRR/vDOM are authoritative
    // from first paint — not just after a manual Reset click. Tries steve.json
    // (live CropManage-sourced demo data) first, falls back to the normal
    // seeded reset if it's not there.
    loadOnStartup();
};
