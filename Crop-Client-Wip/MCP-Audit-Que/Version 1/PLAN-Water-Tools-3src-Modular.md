# PLAN — Water Tools & Audit Que: 5 Tasks
# Version 1 / 2. Src= folder
# Updated: 2026-04-13
# Active files:
#   CropClient-MCP-Water-Tools-Demo-V1-3src.html
#   Crop-Client-MCP-Audit-Que.3.4with3src.html
#   2. Src=/api-component-3.4.1.js   ← DO NOT MODIFY (server-deployed)
#   2. Src=/APIServer3.4.1.js         ← DO NOT MODIFY (server-deployed)
#   2. Src=/mcp-engine-4.0.js         ← DO NOT MODIFY
#   2. Src=/irrigation-component-3.0.js ← reserved for NEXT plan

## RULES:
## - Never delete working code. Comment out with explanation.
## - Never overwrite a versioned file — write to new version number.
## - No code changes without explicit GOFORIT from Coach.
## - ALL tool calls go through mcpStaging() or mcpCall() — NO direct fetch to API.
## - Only exception: get_irrigation_details direct fetch in offline mode
##   (same pattern as api-component-3.4.1.js already uses).

========================================================================
## TASK 1 — Water Tools: Save Button
========================================================================

### What is broken:
Water Tools has no Save button. CRUD edits are lost when page reloads.

### Where to change:
CropClient-MCP-Water-Tools-Demo-V1-3src.html only.

### What to add:

1. New variable at top of script (below displayRecords declaration):
   let lastSavedSnapshot = null;

2. New Save button in the CRUD button row (alongside Create/Reset/Meter/Update).
   Style: match existing crud-btn pattern, use purple like Audit Que Save button.

3. Save handler — uses mcpStaging() exclusively:
   async function saveDisplay() {
       const result = await mcpStaging('data_operation', {
           action: 'write',
           table: 'steve',
           data: displayRecords
       });
       if (result && result.success !== false) {
           lastSavedSnapshot = JSON.parse(JSON.stringify(displayRecords));
           showResult('✅ Saved ' + displayRecords.length + ' records');
       } else {
           showResult('❌ Save failed: ' + (result.error || 'unknown'));
       }
   }

### Note:
mcpStaging() is from mcp-engine-4.0.js — already loaded via src= before the script block.
No direct fetch. No getMcpBase(). mcpStaging handles transport.

========================================================================
## TASK 2 — Water Tools: Restore Button
========================================================================

### What is broken:
Water Tools has no Restore button. No way to reload committed data from JSON.

### Where to change:
CropClient-MCP-Water-Tools-Demo-V1-3src.html only.

### What to add:

1. New Restore button in CRUD button row (alongside Save and other buttons).
   Style: teal/green, match existing crud-btn pattern.

2. Restore handler — uses mcpStaging() exclusively:
   async function restoreDisplay() {
       const result = await mcpStaging('data_operation', {
           action: 'read',
           table: 'steve'
       });
       const rows = (result && Array.isArray(result.data)) ? result.data : [];
       if (rows.length === 0) {
           showResult('⚠️ No saved data found — save first');
           return;
       }
       displayRecords = JSON.parse(JSON.stringify(rows));
       lastSavedSnapshot = JSON.parse(JSON.stringify(rows)); // keep snapshot in sync
       selectedRecord = null;
       renderTable();
       showResult('✅ Restored ' + rows.length + ' records');
   }

### Note:
Restore also refreshes lastSavedSnapshot so Reset stays in sync after a Restore.

========================================================================
## TASK 3 — Water Tools: Reset Button (fix existing)
========================================================================

### What is broken:
Current resetTable() resets to hardcoded originalData (12 demo records baked
into the HTML). Reset must restore from lastSavedSnapshot — user's last Save.

### Where to change:
CropClient-MCP-Water-Tools-Demo-V1-3src.html only.

### What to do:

1. Find existing resetTable() function.
   Comment out the body with explanation — do NOT delete:
   // COMMENTED OUT 2026-04-13:
   // Was resetting to hardcoded originalData (demo data).
   // Reset must restore from lastSavedSnapshot (user's last Save or Restore).
   // lastSavedSnapshot is set by saveDisplay() and restoreDisplay().

2. New resetTable() body:
   function resetTable() {
       if (!lastSavedSnapshot || lastSavedSnapshot.length === 0) {
           showResult('⚠️ No save found — use Save first, then Reset restores it');
           return;
       }
       displayRecords = JSON.parse(JSON.stringify(lastSavedSnapshot));
       selectedRecord = null;
       renderTable();
       showResult('✅ Reset to last save (' + displayRecords.length + ' records)');
   }

### Note:
No mcpStaging call here — this is pure in-memory restore. Fast, no network.
lastSavedSnapshot is set by Task 1 (Save) and Task 2 (Restore).

========================================================================
## TASK 4 — Audit Que: All Ranches / All Plantings token fix
========================================================================

### What is broken:
refreshSelectedIrrigations() in api-component-3.4.1.js handles ALL scenarios
correctly — BUT Scenarios 1 and 2 (All Ranches / All Plantings) use direct
fetch instead of mcpCall(). This causes CORS failure in local/online mode.

Scenario 3 (single planting) already calls getIrrigationEventsByPlanting()
which correctly uses mcpCall() with IF/ELSE MCP vs direct fallback. ✅

### Where to change:
api-component-3.4.1.js — refreshSelectedIrrigations() — Scenarios 1 and 2 only.

### IMPORTANT:
api-component-3.4.1.js is server-deployed. Coach deploys manually.
A new version api-component-3.4.2.js must be written — never overwrite 3.4.1.

### What to change in Scenario 1 (ALL ranches, ALL plantings):
Replace direct fetch calls inside the ranch/planting loops with mcpCall():

   // Instead of direct fetch for plantings:
   // const plantingsResponse = await fetch(`...plantings.json`, { headers: ... });
   // const plantings = await plantingsResponse.json();
   // COMMENTED OUT 2026-04-13: direct fetch causes CORS in local/online mode.
   // Now uses mcpCall('get_plantings') same as getPlantingsByRanch().

   const plantingsResp = await mcpCall('get_plantings', {
       ranch_id: ranch.Ranch_External_GUID,
       ranchGuid: ranch.Ranch_External_GUID
   });
   const plantings = Array.isArray(plantingsResp) ? plantingsResp
       : (Array.isArray(plantingsResp?.plantings) ? plantingsResp.plantings
       : (Array.isArray(plantingsResp?.data) ? plantingsResp.data : []));

   // Instead of direct fetch for irrigation events:
   // const eventsResponse = await fetch(`...irrigation-events/details.json`, { headers: ... });
   // COMMENTED OUT 2026-04-13: direct fetch causes CORS in local/online mode.
   // Now uses mcpCall('get_irrigation_details') same as getIrrigationEventsByPlanting().

   const eventsResp = await mcpCall('get_irrigation_details', { plantingId: planting.Id });
   const events = Array.isArray(eventsResp) ? eventsResp
       : (Array.isArray(eventsResp?.events) ? eventsResp.events
       : (Array.isArray(eventsResp?.data) ? eventsResp.data : []));

### What to change in Scenario 2 (Specific ranch, ALL plantings):
Same pattern — replace the direct fetch for irrigation events with mcpCall():

   // Instead of:
   // const eventsResponse = await fetch(`...irrigation-events/details.json`, { headers: ... });
   // COMMENTED OUT 2026-04-13: direct fetch causes CORS in local/online mode.

   const eventsResp = await mcpCall('get_irrigation_details', { plantingId: planting.Id });
   const events = Array.isArray(eventsResp) ? eventsResp
       : (Array.isArray(eventsResp?.events) ? eventsResp.events
       : (Array.isArray(eventsResp?.data) ? eventsResp.data : []));

### Note:
mcpCall() already has offline fallback to direct fetch built in — see api-component-3.4.1.js.
Token is already stored on server from getToken() at logon — no extra set_token needed.
The IF/ELSE MCP vs direct pattern is identical to Scenario 3 which already works.

========================================================================
## TASK 5 — Audit Que: All click fires on change only, not unconditionally
========================================================================

### What is broken:
selectRanch('ALL'...) and selectPlanting('ALL'...) only log a message when
All is clicked — they do NOT automatically load irrigations.
The user must then click "Refresh Selected Irrigations" separately.
Goal: clicking All in ranch/planting grid should load all records immediately,
same as clicking Refresh after selecting All.

### Where to change:
Audit Que HTML (Crop-Client-MCP-Audit-Que.3.4with3src.html) —
selectRanch() and selectPlanting() functions, OR the onclick handlers
in populateRanchesGrid() and populatePlantingsGrid().

Note: selectRanch() and selectPlanting() are defined in api-component-3.4.1.js.
The onclick handlers are built dynamically in populateRanchesGrid() /
populatePlantingsGrid() also in api-component-3.4.1.js.
This means the fix lives in api-component-3.4.2.js (same file as Task 4).

### What to change:======================================================== look here for 4 and 5 task detail ===== coach 
/ SCENARIO 1: ALL Ranches, ALL Plantings
 // SCENARIO 2: Specific Ranch, ALL Plantings

these are in the api-component. then need to work correctly
with the if (base) mcp call else bare fetch. 

i found this it in the api-component itself.
i assume it should be in the apiserver3.4.1 also 

### Note:
After Task 4 fix, refreshSelectedIrrigations() will use mcpCall() correctly
for All scenarios. Task 5 just wires the click to call it automatically.

#### 
/ SCENARIO 1: ALL Ranches, ALL Plantings
          if (selectedRanchId === 'ALL' && selectedPlantingId === 'ALL') {
              console.log('🔄 SCENARIO 1: ALL ranches, ALL plantings');
              logToChat('🔄 Loading ALL irrigations from ALL plantings in ALL ranches...', 'M');
              
              for (const ranch of ranchData) {
                  const plantingsResponse = await fetch(`https://api.dev.cropmanage.ucanr.edu/v2/ranches/${ranch.Ranch_External_GUID}/plantings.json`, {
                      headers: { 'Authorization': `Bearer ${apiToken}` }
                  });
                  const plantings = await plantingsResponse.json();
                  
                  for (const planting of plantings) {
                      const eventsResponse = await fetch(`https://api.dev.cropmanage.ucanr.edu/v2/plantings/${planting.Id}/irrigation-events/details.json`, {
                          headers: { 'Authorization': `Bearer ${apiToken}` }
                      });
                      
                      if (eventsResponse.ok) {
                          const events = await eventsResponse.json();
                          events.forEach(event => {
                              event.RanchName = ranch.Name;
                              event.RanchId = ranch.Id;
                              event.PlantingName = planting.Name;
                              event.PlantingId = planting.Id;
                          });
                          allEvents = allEvents.concat(events);
                      }
                  }
              }
              
              logToChat(`✅ Loaded ${allEvents.length} base irrigation events. Fetching recommendations...`, 'M');
              await fetchAllRecommendations(allEvents);
              logToChat(`✅ All grids populated with ${allEvents.length} irrigations including recommendations`, 'M');
              return;
          }
          
          // SCENARIO 2: Specific Ranch, ALL Plantings
          else if (selectedRanchId !== 'ALL' && selectedPlantingId === 'ALL') {
              console.log('🔄 SCENARIO 2: Specific ranch, ALL plantings');
              logToChat(`🔄 Loading ALL irrigations from ALL plantings in ${selectedRanchName}...`, 'M');
              
              if (!plantingsData || plantingsData.length === 0) {
                  throw new Error('No plantings loaded. Run "Get Plantings" first.');
              }
              
              for (const planting of plantingsData) {
                  const eventsResponse = await fetch(`https://api.dev.cropmanage.ucanr.edu/v2/plantings/${planting.Id}/irrigation-events/details.json`, {
                      headers: { 'Authorization': `Bearer ${apiToken}` }
                  });
                  
                  if (!eventsResponse.ok) continue;
                  
                  const events = await eventsResponse.json();
                  events.forEach(event => {
                      event.RanchName = selectedRanchName;
                      event.RanchId = selectedRanchId;
                      event.PlantingName = planting.Name;
                      event.PlantingId = planting.Id;
                  });
                  allEvents = allEvents.concat(events);
              }
              
              logToChat(`✅ Loaded ${allEvents.length} base irrigation events. Fetching recommendations...`, 'M');
              await fetchAllRecommendations(allEvents);
              logToChat(`✅ All grids populated with ${allEvents.length} irrigations including recommendations`, 'M');
              return;
          }
          

========================================================================
## SEQUENCE
========================================================================

Water Tools (Tasks 1-3) — self-contained, do not touch Audit Que:
  1 → Save (establishes lastSavedSnapshot)
  3 → Reset fix (depends on lastSavedSnapshot from Task 1)
  2 → Restore (completes the trio, syncs snapshot)

Audit Que (Tasks 4-5) — both go into api-component-3.4.2.js:
  4 → mcpCall fix for Scenarios 1 and 2 in refreshSelectedIrrigations()
  5 → Auto-trigger refresh on All click in selectRanch() / selectPlanting()
  Write 3.4.2, Coach deploys to server, test both scenarios.

========================================================================
## FILES NOT TO TOUCH
========================================================================
- api-component-3.4.1.js   — stable, server-deployed. Tasks 4+5 → new 3.4.2
- APIServer3.4.1.js         — no changes needed for this plan
- mcp-engine-4.0.js         — no changes needed for this plan
- irrigation-component-3.0.js — reserved for NEXT plan only
