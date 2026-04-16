  // Purpose: CropManage API sync service - connects Dashboard to live API
  // Handles authentication, ranch/planting/irrigation data fetch, POST/UPDATE operations
  // Optional - Dashboard works offline without this
  // Version: 3.4 — populateIrrigationDetailsGrid() DOM gutted, replaced with getEventRecommendation() enrichment loop
  // Source: api-component-3.4.js

  console.log('=======================================================');
  console.log('  api-component-3.4.js — LOADED');
  console.log('  Offline: direct fetch | Local/Online: mcpCall → server');
  console.log('=======================================================');
  
  // ========================================
  // VARIABLES - CC_STATE (API Connection Mode)
  // ========================================
  const CC_STATE = {
      mode:        'online',              // 'local' | 'online' | 'offline'
      localBase:   'http://localhost:3101',
      onlineBase:  'https://api.cropclient.com',
      serverUrl:   'https://api.cropclient.com',
      overrideBase: ''
  };

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
  let selectedRanchId = 0;         // The integer Id
  let selectedRanchGuid = '';      // The Ranch_External_GUID for API calls
  let selectedRanchName = '';
  let selectedPlantingId = '';
  let selectedPlantingName = '';
  let selectedEventId = '';        // For recommendations (individual event call)
  
  // ========================================
  // VARIABLES - Source Flags (for CRUD Reset)
  // ========================================
  let dataSource = 'json';         // 'json' = default data, 'api' = loaded from CropManage API
  let apiDetailData = [];          // Stores Grid 4 (api detail) data for Reset when dataSource='api'
  
  // ========================================
  // VARIABLES - UI Options
  // ========================================
  let waitQueueFilter = false;     // true = showing only status=-1 records
  
  // ========================================
  // VARIABLES - User Preferences
  // ========================================
  const defaultRanchName = 'Ranch 1';  // FOR NOW ONLY - Steve's default
  
  // ========================================
  // VARIABLES - Script Metadata (for dropdown)
  // ========================================
  const scriptMetadata = {
      token: {
          description: "Get CropManage authentication token",
          url: "POST https://api.dev.cropmanage.ucanr.edu/Token"
      },
      ranches: {
          description: "Fetch all ranches (requires token first). Adds 'All Ranches' option.",
          url: "GET https://api.dev.cropmanage.ucanr.edu/v2/ranches.json"
      },
      plantings: {
          description: "Get plantings for selected ranch. Adds 'All Plantings' option.",
          url: "GET https://api.dev.cropmanage.ucanr.edu/v2/ranches/{ranchGuid}/plantings.json"
      },
      irrigation_details: {
          description: "Get irrigation events for selected planting (auto-fetches all recommendations)",
          url: "GET https://api.dev.cropmanage.ucanr.edu/v2/plantings/{plantingId}/irrigation-events/details.json"
      },
      // *** v3.0 NEW TOKEN ***
      get_event_recommendation: {
          description: "Fetch full recommendation for a single irrigation event by event ID. Returns enriched data with RecommendedIrrigationAmount, hours, interval, and RecommendationSummary.",
          url: "GET https://api.dev.cropmanage.ucanr.edu/v2/irrigation-events/{eventId}.json"
      },
      post_irrigation: {
          description: "Batch process all status=-1 records (POST new, UPDATE existing)",
          url: "POST/PUT https://api.dev.cropmanage.ucanr.edu/v3/"
      },
      update_record: {
          description: "Update existing irrigation record in CropManage (requires cropManageId)",
          url: "PUT https://api.dev.cropmanage.ucanr.edu/v3/irrigation-events/{cropManageId}.json"
      }
  };
  
  // ========================================
  // FUNCTIONS - Utilities
  // ========================================

  // getMcpBase — reads mcpServerUrl from mcp-engine (the single source of truth)
  // Returns the server URL if online/local, null if offline
  // Used as truthy gate: if (base) = MCP available, null = offline
  function getMcpBase() {
      return mcpServerUrl || null;
  }

  // mcpCall — moved from dashboard to api-component so all src files can use it
  // Calls a tool on the MCP server. Throws on failure so callers can catch cleanly.
  async function mcpCall(toolName, args = {}) {
      const base = getMcpBase();
      if (!base) {
          const msg = `ℹ️ MCP Offline — would call: /tools/${toolName}  args: ${JSON.stringify(args)}`;
          try { logToChat(msg, 'M'); } catch (_) {}
          return { ok: false, offline: true, tool: toolName, args };
      }
      const url = `${base}/tools/${toolName}`;
      let res;
      try {
          res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(args || {})
          });
      } catch (netErr) {
          if (netErr.message === 'Failed to fetch' || netErr.name === 'TypeError') {
              throw new Error(`CORS blocked — enable the CORS extension for localhost`);
          }
          throw new Error(`Network error reaching ${url} — ${netErr.message}`);
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
          const msg = json?.error || json?.message || `MCP tool failed: ${toolName}`;
          throw new Error(`${msg} (${url})`);
      }
      return json;
  }

  function replacePlaceholders(text) {
      if (!text) return text;
      
      let result = text;
      
      // Replace from global selection variables (ranch/planting clicks)
      if (selectedRanchGuid) result = result.replace(/{ranchGuid}/g, selectedRanchGuid);
      if (selectedPlantingId) result = result.replace(/{plantingId}/g, selectedPlantingId);
      if (selectedEventId) result = result.replace(/{eventId}/g, selectedEventId);
      if (selectedRanchName) result = result.replace(/{ranchName}/g, selectedRanchName);
      if (selectedPlantingName) result = result.replace(/{plantingName}/g, selectedPlantingName);
      
      // Replace from selectedRecord (bottom irrigation grid)
      if (typeof selectedRecord !== 'undefined' && selectedRecord) {
          if (selectedRecord.ranch) result = result.replace(/{ranch}/g, selectedRecord.ranch);
          if (selectedRecord.planting) result = result.replace(/{planting}/g, selectedRecord.planting);
          if (selectedRecord.id) result = result.replace(/{id}/g, selectedRecord.id);
      }
      
      return result;
  }
  
  // ========================================
  // FUNCTIONS - UI Router (Script Dropdown)
  // ========================================
  
  function selectScript() {
      const dropdown = document.getElementById('scriptDropdown');
      const script = dropdown.value;
      const descArea = document.getElementById('scriptDescription');
      const urlField = document.getElementById('scriptUrl');
      
      if (!script) {
          descArea.innerHTML = '<div style="color: #999; font-style: italic;">Select a script to see description...</div>';
          urlField.value = '';
          return;
      }
      
      const meta = scriptMetadata[script];
      descArea.innerHTML = `<strong>${dropdown.options[dropdown.selectedIndex].text}:</strong> ${meta.description}`;
      urlField.value = meta.url;
  }

  function runScript() {
      const script = document.getElementById('scriptDropdown').value;
      if (!script) {
          showResult('❌ Please select a script first');
          return;
      }
      
      // Get Token Script
      if (script === 'token') {
          const descArea = document.getElementById('scriptDescription');
          if (descArea) descArea.innerHTML = '⏳ Getting CropManage token...';
          
          getToken().then(result => {
              if (result.success) {
                  logToChat('✅ SUCCESS: Token acquired', 'M');
                  if (descArea) descArea.innerHTML = '🔐 Get Token: Get CropManage authentication token';
              } else {
                  if (descArea) descArea.innerHTML = result.error;
              }
          });
          return;
      }
      
      // Get Ranches Script
      if (script === 'ranches') {
          const descArea = document.getElementById('scriptDescription');
          if (!apiToken) {
              if (descArea) descArea.innerHTML = '⚠️ No token available. Run "Get Token" first.';
              return;
          }
          if (descArea) descArea.innerHTML = '⏳ Loading ranches...';
          
          getRanches().then(result => {
              if (result.success) {
                  if (descArea) descArea.innerHTML = `✅ SUCCESS: ${result.ranchCount || (result.ranches && result.ranches.length) || 0} ranches loaded`;
              } else {
                  if (descArea) descArea.innerHTML = result.error;
              }
          });
          return;
      }
      
      // Get Plantings Script
      if (script === 'plantings') {
          const descArea = document.getElementById('scriptDescription');
          if (!selectedRanchGuid && selectedRanchId !== 'ALL') {
              if (descArea) descArea.innerHTML = 'ℹ️ To load plantings: Click a ranch in the Ranches grid first';
              return;
          }
          
          if (selectedRanchId === 'ALL') {
              if (descArea) descArea.innerHTML = '⏳ Loading plantings for ALL ranches...';
              loadAllPlantings();
          } else {
              if (descArea) descArea.innerHTML = '⏳ Loading plantings for selected ranch...';
              getPlantingsByRanch(selectedRanchGuid);
          }
          return;
      }
      
      // Get Irrigation Details Script
      if (script === 'irrigation_details') {
          const descArea = document.getElementById('scriptDescription');
          
          if (!selectedRanchId || !selectedPlantingId) {
              if (descArea) descArea.innerHTML = 'ℹ️ Select a ranch and planting first, then click Send';
              return;
          }
          
          if (descArea) descArea.innerHTML = '⏳ Loading irrigation events...';
          refreshSelectedIrrigations();
          return;
      }
      
      // Post Irrigation Script
      if (script === 'post_irrigation') {
          const descArea = document.getElementById('scriptDescription');
          const queuedCount = displayRecords.filter(r => r.status === -1).length;
          if (queuedCount === 0) {
              if (descArea) descArea.innerHTML = 'ℹ️ No records in queue (status=-1)';
              return;
          }
          if (descArea) descArea.innerHTML = `⏳ Processing ${queuedCount} queued records...`;
          batchPostQueue();
          return;
      }
      
      // Update Record Script
      if (script === 'update_record') {
          const descArea = document.getElementById('scriptDescription');
          if (!selectedRecord) {
              if (descArea) descArea.innerHTML = '❌ No record selected in Display Grid. Click a row in the bottom grid first.';
              return;
          }
          if (descArea) descArea.innerHTML = '⏳ Updating record in CropManage...';
          updateRecordToCropManage();
          return;
      }
      
      const descArea = document.getElementById('scriptDescription');
      if (descArea) descArea.innerHTML = `▶️ Script: ${script}`;
  }
  
  // ========================================
  // FUNCTIONS - Grid Population
  // ========================================
  
  function populateRanchesGrid(ranches) {
      const grid = document.getElementById('ranchesGrid');
      if (!ranches || ranches.length === 0) {
          grid.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: var(--small-font);">No ranches</div>';
          return;
      }
      
      let html = '<table style="width: 100%; font-size: var(--small-font); border-collapse: collapse;">';
      html += '<thead><tr style="background: #f5f5f5;"><th style="padding: 4px; text-align: left;">Name</th></tr></thead>';
      html += '<tbody>';
      
      // Add "All" option first
      html += `<tr style="border-bottom: 1px solid #eee; cursor: pointer; background: #e3f2fd;" onclick="selectRanch('ALL', 'ALL', 'All Ranches')">`;
      html += `<td style="padding: 4px; font-weight: 600;">All Ranches</td>`;
      html += '</tr>';
      
      // Add individual ranches
      ranches.forEach(ranch => {
          const ranchId = ranch.Id;  // Integer
          const ranchGuid = ranch.Ranch_External_GUID;  // GUID string for API calls
          
          html += `<tr style="border-bottom: 1px solid #eee; cursor: pointer;" onclick="selectRanch(${ranchId}, '${ranchGuid}', '${ranch.Name.replace(/'/g, "\\'")}')">`;
          html += `<td style="padding: 4px;">${ranch.Name}</td>`;
          html += '</tr>';
      });
      html += '</tbody></table>';
      grid.innerHTML = html;
      
      // Auto-select first ranch if none selected
      if (ranches.length > 0 && !selectedRanchId) {
          const firstRanch = ranches[0];
          selectRanch(firstRanch.Id, firstRanch.Ranch_External_GUID, firstRanch.Name);
      }
  }
  
  function populatePlantingsGrid(plantings) {
      const grid = document.getElementById('plantingsGrid');
      if (!plantings || plantings.length === 0) {
          grid.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: var(--small-font);">No plantings</div>';
          return;
      }
      
      let html = '<table style="width: 100%; font-size: var(--small-font); border-collapse: collapse;">';
      html += '<thead><tr style="background: #f5f5f5;"><th style="padding: 4px; text-align: left;">Name</th></tr></thead>';
      html += '<tbody>';
      
      // ALWAYS add "All Plantings" option first
      html += `<tr style="border-bottom: 1px solid #eee; cursor: pointer; background: #e3f2fd;" onclick="selectPlanting('ALL', 'All Plantings')">`;
      html += `<td style="padding: 4px; font-weight: 600;">All Plantings</td>`;
      html += '</tr>';
      
      // Add individual plantings
      plantings.forEach(planting => {
          html += `<tr style="border-bottom: 1px solid #eee; cursor: pointer;" onclick="selectPlanting('${planting.Id}', '${planting.Name.replace(/'/g, "\\'")}')">`;
          html += `<td style="padding: 4px;">${planting.Name}</td>`;
          html += '</tr>';
      });
      html += '</tbody></table>';
      grid.innerHTML = html;
      
      // Auto-select "All Plantings" by default
      selectPlanting('ALL', 'All Plantings');
  }
  
  function populateRecommendationsGrid(recommendation) {
      console.log('🔍 populateRecommendationsGrid called with:', recommendation);
      const grid = document.getElementById('recommendationsGrid');
      
      if (!recommendation) {
          grid.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: var(--small-font);">Click an event in Grid 4 to see recommendation</div>';
          return;
      }
      
      // Show ONE record - not a table - with ranch/planting context
      let html = '<div style="padding: 8px; font-size: var(--small-font);">';
      html += `<div style="margin-bottom: 4px;"><strong>Ranch:</strong> ${selectedRanchName || '-'}</div>`;
      html += `<div style="margin-bottom: 4px;"><strong>Planting:</strong> ${selectedPlantingName || '-'}</div>`;
      html += `<div style="margin-bottom: 4px;"><strong>Date:</strong> ${recommendation.EventDate || '-'}</div>`;
      html += `<div style="margin-bottom: 4px;"><strong>Rec Amount:</strong> ${recommendation.RecommendedIrrigationAmount || '-'} inches</div>`;
      html += `<div style="margin-bottom: 4px;"><strong>Interval:</strong> ${recommendation.RecommendedInterval || '-'} days</div>`;
      html += `<div style="margin-bottom: 4px;"><strong>Method:</strong> ${recommendation.IrrigationMethod || '-'}</div>`;
      html += '</div>';
      
      grid.innerHTML = html;
      console.log('✅ Grid 3 showing ONE recommendation');
  }
  
  function displayFullRecommendation(eventData) {
      console.log('🔍 displayFullRecommendation called with:', eventData);
      const grid = document.getElementById('recommendationsGrid');
      
      // Extract RecommendationSummary which has the HOURS
      const summary = eventData.RecommendationSummary || {};
      
      // Build a proper table grid
      let html = '<table style="width: 100%; font-size: var(--small-font); border-collapse: collapse;">';
      html += '<thead><tr style="background: #f5f5f5;">';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Date</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Rec Amt</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Rec Hrs</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Mgr Hrs</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Interval</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Method</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      html += '<tr style="border-bottom: 1px solid #eee;">';
      html += `<td style="padding: 4px; border: 1px solid #ddd;">${eventData.EventDate || '-'}</td>`;
      html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${eventData.RecommendedIrrigationAmount || '-'}</td>`;
      html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${summary.RecommendedIrrigationTime || '-'}</td>`;
      html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${summary.ManagerAmountRecommendationHours || '-'}</td>`;
      html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: center;">${eventData.RecommendedInterval || '-'}</td>`;
      html += `<td style="padding: 4px; border: 1px solid #ddd;">${eventData.IrrigationMethod || '-'}</td>`;
      html += '</tr>';
      html += '</tbody></table>';
      
      grid.innerHTML = html;
      console.log('✅ Grid 3 showing FULL recommendation as PROPER GRID with HOURS');
  }
  
  // v3.4 FIXED — DOM removed. Now enriches each event with getEventRecommendation() MCP call.
  // Name kept for harness compatibility. Returns enriched events array.
  async function populateIrrigationDetailsGrid(events) {
      if (!events || events.length === 0) return events;
      for (const event of events) {
          const result = await getEventRecommendation(event.Id);
          if (result.success && result.event) {
              const rec = result.event;
              event.RecommendedIrrigationAmount       = rec.RecommendedIrrigationAmount;
              event.RecommendedIrrigationTime         = rec.RecommendationSummary?.RecommendedIrrigationTime;
              event.ManagerAmountRecommendation       = rec.ManagerAmountRecommendation;
              event.ManagerAmountRecommendationHours  = rec.ManagerAmountRecommendationHours;
              event.RecommendedInterval               = rec.RecommendedInterval;
              event.IrrigationMethodId                = rec.IrrigationMethodId;
              event.WaterApplied                      = rec.WaterApplied;
          }
      }
      console.log('✅ populateIrrigationDetailsGrid: enriched', events.length, 'events via getEventRecommendation');
      return events;
  }
  
  function selectRanch(ranchId, ranchGuid, ranchName) {
      selectedRanchId = ranchId;
      selectedRanchGuid = ranchGuid;
      selectedRanchName = ranchName;
      
      console.log('Ranch selected - ID:', ranchId, 'GUID:', ranchGuid, 'Name:', ranchName);
      
      // Highlight selected ranch using 'selected' class
      const ranchRows = document.querySelectorAll('#ranchesGrid tbody tr');
      ranchRows.forEach(row => {
          row.classList.remove('selected');
          const rowText = row.textContent.trim();
          if ((ranchId === 'ALL' && rowText === 'All Ranches') || 
              (ranchId !== 'ALL' && rowText === ranchName)) {
              row.classList.add('selected');
          }
      });
      
      // If specific ranch selected, load its plantings (but keep All option)
      if (ranchId !== 'ALL') {
          getPlantingsByRanch(ranchGuid);
      }
  }
  
  function selectPlanting(plantingId, plantingName) {
      selectedPlantingId = plantingId;
      selectedPlantingName = plantingName;
      
      console.log('Planting selected:', plantingId, plantingName);
      
      // Highlight selected planting using 'selected' class
      const plantingRows = document.querySelectorAll('#plantingsGrid tbody tr');
      plantingRows.forEach(row => {
          row.classList.remove('selected');
          const rowText = row.textContent.trim();
          if ((plantingId === 'ALL' && rowText === 'All Plantings') || 
              (plantingId !== 'ALL' && rowText === plantingName)) {
              row.classList.add('selected');
          }
      });
      
      if (plantingId === 'ALL') {
          logToChat(`All Plantings selected. Click "Refresh Selected Irrigations" to load all.`, 'M');
      } else {
          logToChat(`Planting selected: ${plantingName}. Click "Refresh Selected Irrigations" to load data.`, 'M');
      }
  }
  
  function selectEvent(eventId, eventData) {
      selectedEventId = eventId;
      console.log('Event selected:', eventId);
      
      // Grid 3 is now auto-populated with all rows
      // This click just stores the selected event ID
      
      logToChat(`Event selected: ${eventData.EventDate}`, 'M');
  }
  
  // ========================================
  // FUNCTIONS - CropManage API Calls
  // ========================================
  
  // Script: Get Token + Ranches
  // Script: Get Token Only
  async function getToken() {
      try {
          const username = 'stevep@sspnet.com';
          const credentials = username;

          const descArea = document.getElementById('scriptDescription');
          if (descArea) descArea.innerHTML = `⏳ Obtaining Token for "${credentials}"...`;

          const base = getMcpBase();

          if (base) {
              // --- Online/Local: route through MCP server (no CORS) ---
              try {
                  const resp = await mcpCall('get_token', { username, password: 'gosteve1!' });
                  if (resp && resp.success && resp.token) {
                      apiToken = resp.token;
                      console.log('✅ Token acquired via MCP');
                      document.getElementById('tokenDisplay').value = apiToken.substring(0, 50) + '...';
                      if (descArea) descArea.innerHTML = `✅ Token obtained for "${credentials}" via MCP`;
                      return { success: true, token: apiToken };
                  }
                  return { success: false, error: `[${base}] get_token: bad response` };
              } catch (e) {
                  return { success: false, error: `[${base}] get_token failed: ${e.message}` };
              }
          }

          // --- Offline: direct fetch ---
          const tokenResponse = await fetch('https://api.dev.cropmanage.ucanr.edu/Token', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: `username=${username}&password=gosteve1!&grant_type=password`
          });

          if (!tokenResponse.ok) {
              throw new Error(`Token request failed: ${tokenResponse.status}`);
          }

          const tokenData = await tokenResponse.json();
          apiToken = tokenData.access_token;

          console.log('✅ Token acquired (offline):', apiToken.substring(0, 20) + '...');
          document.getElementById('tokenDisplay').value = apiToken.substring(0, 50) + '...';
          if (descArea) descArea.innerHTML = `✅ Token obtained for "${credentials}"` ;
          return { success: true, token: apiToken };

      } catch (error) {
          // If token fetch fails, show error in Script Description area
          const errorMessage = '❌ Token not Created for Logon User.';

          // Update Script Description directly
          const descArea = document.getElementById('scriptDescription');
          if (descArea) {
              descArea.innerHTML = errorMessage;
          }

          return {
              success: false,
              error: errorMessage
          };
      }
  }
  
  // Script: Get Ranches (requires token first)
  async function getRanches() {
      try {
          if (!apiToken) {
              throw new Error('No token available. Get token first.');
          }
          
          
          const base = getMcpBase();

          const extractArray = (resp) => {
              if (!resp) return null;
              if (Array.isArray(resp)) return resp;
              if (Array.isArray(resp.ranches)) return resp.ranches;
              if (Array.isArray(resp.data)) return resp.data;
              if (Array.isArray(resp.result)) return resp.result;
              if (resp.content && Array.isArray(resp.content) && resp.content[0] && typeof resp.content[0].text === 'string') {
                  try {
                      const t = resp.content[0].text;
                      const j = JSON.parse(t);
                      if (Array.isArray(j)) return j;
                      if (Array.isArray(j.ranches)) return j.ranches;
                      if (Array.isArray(j.data)) return j.data;
                  } catch (_) {}
              }
              return null;
          };

          if (base) {
              // --- Online/Local: MCP only (token already stored by get_token) ---
              const resp = await mcpCall('get_ranches', {});
              const arr = extractArray(resp);
              if (!Array.isArray(arr)) throw new Error(`MCP get_ranches returned unexpected shape (${base})`);
              ranchData = arr;
              console.log('✅ Ranches loaded via MCP:', ranchData.length, 'ranches');
              populateRanchesGrid(ranchData);
              return { success: true, ranchCount: ranchData.length, source: 'mcp', base };
          }

          // --- Offline: direct CropManage API ---
          logToChat('ℹ️ MCP offline — using direct CropManage API.', 'M');
          const ranchesResponse = await fetch('https://api.dev.cropmanage.ucanr.edu/v2/ranches.json', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${apiToken}` }
          });
          if (!ranchesResponse.ok) throw new Error(`Ranches request failed: ${ranchesResponse.status}`);
          ranchData = await ranchesResponse.json();
          console.log('✅ Ranches loaded:', ranchData.length, 'ranches');
          populateRanchesGrid(ranchData);
          return { success: true, ranches: ranchData };
          
      } catch (error) {
          console.error('❌ Error getting ranches:', error);
          // No chat message - just return error
          return {
              success: false,
              error: error.message
          };
      }
  }
  
  // Script: Get Token + Ranches (legacy - calls both)
  async function getTokenAndRanches() {
      const tokenResult = await getToken();
      if (!tokenResult.success) return tokenResult;
      
      const ranchesResult = await getRanches();
      return ranchesResult;
  }
  // End Script: Get Token + Ranches
  
  // Script: Get Plantings by Ranch
  async function getPlantingsByRanch(ranchGuid) {
      try {
          if (!apiToken) {
              throw new Error('No token available. Run "Get Token + Ranches" first.');
          }
          
          if (!ranchGuid) {
              throw new Error('Ranch GUID required. Select a ranch first.');
          }
          
          
          const base = getMcpBase();

          const extractArray = (resp) => {
              if (!resp) return null;
              if (Array.isArray(resp)) return resp;
              if (Array.isArray(resp.plantings)) return resp.plantings;
              if (Array.isArray(resp.data)) return resp.data;
              if (resp.content && Array.isArray(resp.content) && resp.content[0] && typeof resp.content[0].text === 'string') {
                  try {
                      const j = JSON.parse(resp.content[0].text);
                      if (Array.isArray(j)) return j;
                      if (Array.isArray(j.plantings)) return j.plantings;
                      if (Array.isArray(j.data)) return j.data;
                  } catch (_) {}
              }
              return null;
          };

          if (base) {
              // --- Online/Local: MCP only (token already stored by get_token) ---
              const resp = await mcpCall('get_plantings', { ranch_id: ranchGuid, ranchGuid });
              const arr = extractArray(resp);
              if (!Array.isArray(arr)) throw new Error(`MCP get_plantings returned unexpected shape (${base})`);
              plantingsData = arr;
              console.log('✅ Plantings loaded via MCP:', plantingsData.length, 'plantings');
              populatePlantingsGrid(plantingsData);
              logToChat(`✅ ${plantingsData.length} plantings loaded. Click a planting.`, 'M');
              return { success: true, plantingCount: plantingsData.length, source: 'mcp', base };
          }

          // --- Offline: direct CropManage API ---
          logToChat('ℹ️ MCP offline — using direct CropManage API for plantings.', 'M');
          const url = `https://api.dev.cropmanage.ucanr.edu/v2/ranches/${ranchGuid}/plantings.json`;
          const response = await fetch(url, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${apiToken}` }
          });
          if (!response.ok) throw new Error(`Plantings request failed: ${response.status}`);
          plantingsData = await response.json();
          console.log('✅ Plantings loaded:', plantingsData.length, 'plantings');
          populatePlantingsGrid(plantingsData);
          logToChat(`✅ ${plantingsData.length} plantings loaded. Click a planting.`, 'M');
          return { success: true, plantings: plantingsData };
          
      } catch (error) {
          console.error('❌ Error:', error);
          logToChat(`❌ ${error.message}`, 'M');
          return {
              success: false,
              error: error.message
          };
      }
  }
  // End Script: Get Plantings by Ranch
  
  // Script: Load All Plantings (from all ranches)
  async function loadAllPlantings() {
      try {
          if (!apiToken) {
              throw new Error('No token available. Get token first.');
          }
          
          if (!ranchData || ranchData.length === 0) {
              throw new Error('No ranches loaded. Get ranches first.');
          }
          
          console.log('🔄 Loading plantings from ALL ranches...');
          let allPlantings = [];
          const base = getMcpBase();

          for (const ranch of ranchData) {
              try {
                  if (base) {
                      // Online/Local: MCP only
                      const resp = await mcpCall('get_plantings', { ranch_id: ranch.Ranch_External_GUID, ranchGuid: ranch.Ranch_External_GUID });
                      let plantings = null;
                      if (Array.isArray(resp)) plantings = resp;
                      else if (Array.isArray(resp?.plantings)) plantings = resp.plantings;
                      else if (Array.isArray(resp?.data)) plantings = resp.data;
                      else if (resp?.content?.[0]?.text) { try { const j = JSON.parse(resp.content[0].text); plantings = Array.isArray(j) ? j : (j.plantings || j.data || []); } catch(_){} }
                      if (Array.isArray(plantings)) {
                          plantings.forEach(p => { p.RanchName = ranch.Name; p.RanchId = ranch.Id; });
                          allPlantings = allPlantings.concat(plantings);
                      }
                  } else {
                      // Offline: direct
                      const response = await fetch(`https://api.dev.cropmanage.ucanr.edu/v2/ranches/${ranch.Ranch_External_GUID}/plantings.json`, {
                          headers: { 'Authorization': `Bearer ${apiToken}` }
                      });
                      if (response.ok) {
                          const plantings = await response.json();
                          plantings.forEach(p => { p.RanchName = ranch.Name; p.RanchId = ranch.Id; });
                          allPlantings = allPlantings.concat(plantings);
                      }
                  }
              } catch (e) {
                  console.warn(`⚠️ Failed to load plantings for ${ranch.Name}: ${e.message}`);
              }
          }

          plantingsData = allPlantings;
          console.log('✅ Total plantings loaded:', allPlantings.length);
          populatePlantingsGrid(allPlantings);
          logToChat(`✅ ${allPlantings.length} total plantings loaded from all ranches`, 'M');
          return { success: true, plantings: allPlantings };
          
      } catch (error) {
          console.error('❌ Error loading all plantings:', error);
          logToChat(`❌ ${error.message}`, 'M');
          return {
              success: false,
              error: error.message
          };
      }
  }
  // End Script: Load All Plantings
  
  // Script: Get Irrigation Events by Planting
  async function getIrrigationEventsByPlanting(plantingId) {
      try {
          if (!apiToken) {
              throw new Error('No token available. Run "Get Token + Ranches" first.');
          }
          
          if (!plantingId) {
              throw new Error('Planting ID required. Select a planting first.');
          }
          
          
          const base = getMcpBase();

          const extractData = (resp) => {
              if (!resp) return null;
              if (Array.isArray(resp)) return resp;
              if (resp && typeof resp === 'object') {
                  if (Array.isArray(resp.events)) return resp.events;
                  if (Array.isArray(resp.data)) return resp.data;
                  if (resp.content && Array.isArray(resp.content) && resp.content[0] && typeof resp.content[0].text === 'string') {
                      try { return JSON.parse(resp.content[0].text); } catch (_) {}
                  }
              }
              return resp;
          };

          if (base) {
              // --- Online/Local: try MCP first, fall back to direct API ---
              try {
                  const resp = await mcpCall('get_irrigation_details', { plantingId });
                  const data = extractData(resp);
                  irrigationData = Array.isArray(data) ? data : (Array.isArray(data?.events) ? data.events : (Array.isArray(data?.data) ? data.data : []));
                  console.log('✅ Irrigation details loaded via MCP:', irrigationData.length, 'items');
                  console.log('🔍 selectedRanchName:', selectedRanchName, '| selectedPlantingName:', selectedPlantingName);
                  irrigationData.forEach(e => { e.RanchName = selectedRanchName; e.PlantingName = selectedPlantingName; });
                  console.log('🔍 Plugged names — first event RanchName:', irrigationData[0]?.RanchName, '| PlantingName:', irrigationData[0]?.PlantingName);
                  populateIrrigationDetailsGrid(irrigationData);
                  await fetchAllRecommendations(irrigationData);
                  logToChat(`✅ ${irrigationData.length} irrigation events loaded via MCP. Recommendations populated.`, 'M');
                  return { success: true, events: irrigationData, source: 'mcp', base };
              } catch (e) {
                  logToChat(`ℹ️ MCP get_irrigation_details failed — falling back to direct API. (${e.message})`, 'M');
              }
          } else {
              logToChat('ℹ️ MCP offline — using direct CropManage API for irrigation details.', 'M');
          }

          // --- Fallback: direct CropManage API ---
          const url = `https://api.dev.cropmanage.ucanr.edu/v2/plantings/${plantingId}/irrigation-events/details.json`;
          const response = await fetch(url, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${apiToken}` }
          });

          if (!response.ok) {
              if (response.status === 404) {
                  logToChat(`ℹ️ No irrigation events found for ${selectedPlantingName}`, 'M');
                  return { success: true, events: [], message: 'No events found' };
              }
              throw new Error(`Irrigation events request failed: ${response.status}`);
          }

          const irrigationEventsData = await response.json();
          console.log('✅ Irrigation events loaded:', irrigationEventsData.length, 'events');
          console.log('🔍 selectedRanchName:', selectedRanchName, '| selectedPlantingName:', selectedPlantingName);
          irrigationEventsData.forEach(e => { e.RanchName = selectedRanchName; e.PlantingName = selectedPlantingName; });
          console.log('🔍 Plugged names — first event RanchName:', irrigationEventsData[0]?.RanchName, '| PlantingName:', irrigationEventsData[0]?.PlantingName);
          populateIrrigationDetailsGrid(irrigationEventsData);
          console.log('🔄 Auto-fetching recommendations for all events...');
          await fetchAllRecommendations(irrigationEventsData);
          logToChat(`✅ ${irrigationEventsData.length} irrigation events loaded. Recommendations populated automatically.`, 'M');
          return { success: true, events: irrigationEventsData, message: `${irrigationEventsData.length} events loaded.` };
          
      } catch (error) {
          console.error('❌ Error:', error);
          logToChat(`❌ ${error.message}`, 'M');
          return {
              success: false,
              error: error.message
          };
      }
  }
  // End Script: Get Irrigation Events by Planting
  
  // Script: Get Individual Event (Full Recommendation with HOURS)
  async function getIndividualEvent(eventId) {
      try {
          console.log('📨 Fetching individual event:', eventId);
          
          const url = `https://api.dev.cropmanage.ucanr.edu/v2/irrigation-events/${eventId}.json`;
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${apiToken}`,
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const eventData = await response.json();
          
          console.log('✅ Individual event loaded:', eventData);
          console.log('🔍 RecommendationSummary:', eventData.RecommendationSummary);
          
          // Display in Grid 3 with HOURS data
          displayFullRecommendation(eventData);
          
          // Log to chat
          logToChat(`✅ Full recommendation loaded with HOURS data`, 'M');
          
          return {
              success: true,
              event: eventData
          };
          
      } catch (error) {
          console.error('❌ Error:', error);
          logToChat(`❌ ${error.message}`, 'M');
          return {
              success: false,
              error: error.message
          };
      }
  }
  // End Script: Get Individual Event

  // ========================================
  // Script: get_event_recommendation — v3.0 NEW TOKEN
  // Fetches full recommendation for ONE event by ID.
  // IF online/local: routes through mcpCall (server → makeRequest → CropManage)
  // IF offline: direct fetch with CORS addon required
  // Same pattern as getRanches, getPlantingsByRanch, getIrrigationEventsByPlanting
  // ========================================
  async function getEventRecommendation(eventId) {
      if (!apiToken) {
          return { success: false, error: 'No token available.' };
      }
      if (!eventId) {
          return { success: false, error: 'eventId required.' };
      }

      const base = getMcpBase();

      if (base) {
          // --- Online/Local: MCP route ONLY — no fallback to direct fetch ---
          try {
              const resp = await mcpCall('get_event_recommendation', { eventId: String(eventId) });
              if (resp && resp.success && resp.event) return { success: true, event: resp.event };
              return { success: false, error: `[${base}] MCP get_event_recommendation: bad response for event ${eventId}` };
          } catch (e) {
              return { success: false, error: `[${base}] MCP get_event_recommendation failed: ${e.message}` };
          }
      }

      // --- Offline: direct CropManage API ---
      const url = `https://api.dev.cropmanage.ucanr.edu/v2/irrigation-events/${eventId}.json`;
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
          }
      });
      if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
      const event = await response.json();
      return { success: true, event };
  }
  // End Script: get_event_recommendation

  // ========================================
  // Auto-fetch all recommendations — v3.0
  // NOW calls getEventRecommendation() instead of bare fetch
  // Offline: direct CropManage API via getEventRecommendation fallback
  // Online/Local: routes through MCP server → makeRequest
  // ========================================
  async function fetchAllRecommendations(events) {
      const recommendations = [];
      
      for (const event of events) {
          try {
              const result = await getEventRecommendation(event.Id);

              if (result.success && result.event) {
                  const fullEvent = result.event;

                  // Preserve ranch/planting context from original event
                  fullEvent.RanchName = event.RanchName;
                  fullEvent.PlantingName = event.PlantingName;
                  fullEvent.RanchId = event.RanchId;
                  fullEvent.PlantingId = event.PlantingId;

                  recommendations.push(fullEvent);
                  console.log(`✅ Recommendation loaded for event ${event.Id}`);
              }
          } catch (error) {
              console.error(`❌ Error fetching event ${event.Id}:`, error);
          }
      }
      
      console.log(`✅ Fetched ${recommendations.length} recommendations`);
      
      // Populate Grid 3 with all recommendations
      populateRecommendationsGridMultiRow(recommendations);
      
      // Populate Grid 4 with DEFAULT format using same data
      populateIrrigationDetailsGridDEFAULT(recommendations);
      
      // Load into displayRecords for MCP tools and POST
      loadEventsIntoDisplayRecords(recommendations);
  }
  
  // Populate Grid 3 with multiple recommendation rows
  function populateRecommendationsGridMultiRow(recommendations) {
      console.log('🔍 populateRecommendationsGridMultiRow called with', recommendations.length, 'recommendations');
      const grid = document.getElementById('recommendationsGrid');
      
      if (!recommendations || recommendations.length === 0) {
          grid.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: var(--small-font);">No recommendations</div>';
          return;
      }
      
      // Build multi-row table
      let html = '<table style="width: 100%; font-size: var(--small-font); border-collapse: collapse;">';
      html += '<thead><tr style="background: #f5f5f5;">';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">ID</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Date</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Rec Hrs</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Rec Inch</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Mgr Hrs</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Mgr Inch</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Interval</th>';
      html += '<th style="padding: 4px; border: 1px solid #ddd;">Method</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      
      recommendations.forEach(event => {
          console.log('Event:', event.Id, 'Data:', {
              MgrInch: event.ManagerAmountRecommendation,
              MgrHrs: event.ManagerAmountRecommendationHours,
              RecInch: event.RecommendedIrrigationAmount,
              Interval: event.RecommendedInterval
          });
          
          let formattedDate = '-';
          if (event.EventDate) {
              const dateObj = new Date(event.EventDate);
              formattedDate = formatDate(dateObj);
          }
          
          const recInch = parseFloat(event.RecommendedIrrigationAmount) || 0;
          const recHrs = recInch > 0 ? (recInch / 0.3).toFixed(2) : '-';
          
          html += '<tr style="border-bottom: 1px solid #eee;">';
          html += `<td style="padding: 4px; border: 1px solid #ddd;">${event.Id || '-'}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd;">${formattedDate}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${recHrs}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${recInch || '-'}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${event.ManagerAmountRecommendationHours || '-'}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: right; font-weight: 600; color: #ff0000;">${event.ManagerAmountRecommendation || '-'}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: center;">${event.RecommendedInterval ? parseFloat(event.RecommendedInterval).toFixed(2) : '-'}</td>`;
          html += `<td style="padding: 4px; border: 1px solid #ddd; text-align: center;">${event.IrrigationMethodId || '-'}</td>`;
          html += '</tr>';
      });
      
      html += '</tbody></table>';
      grid.innerHTML = html;
      console.log('✅ Grid 3 populated with', recommendations.length, 'recommendation rows');
  }
  
  // Populate Grid 4 with DEFAULT irrigation records format
  function populateIrrigationDetailsGridDEFAULT(recommendations) {
      console.log('🔍 populateIrrigationDetailsGridDEFAULT called with', recommendations.length, 'recommendations');
      const tbody = document.getElementById('irrigationDetailsBody');
      
      if (!recommendations || recommendations.length === 0) {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #999; padding: 20px;">No data</td></tr>';
          return;
      }
      
      tbody.innerHTML = '';
      recommendations.forEach(event => {
          let formattedDate = '-';
          if (event.EventDate) {
              const dateObj = new Date(event.EventDate);
              formattedDate = formatDate(dateObj);
          }
          
          const recInch = parseFloat(event.RecommendedIrrigationAmount) || 0;
          const recHrs = recInch > 0 ? (recInch / 0.3).toFixed(2) : '-';
          
          const row = tbody.insertRow();
          row.style.borderBottom = '1px solid #eee';
          row.style.cursor = 'pointer';
          row.id = `event-row-${event.Id}`;
          row.onclick = () => selectEventForPost(event.Id, row);
          
          const ranchCell = row.insertCell(0);
          ranchCell.textContent = event.RanchName || selectedRanchName || '-';
          ranchCell.style.padding = '4px';
          
          const plantingCell = row.insertCell(1);
          plantingCell.textContent = event.PlantingName || selectedPlantingName || '-';
          plantingCell.style.padding = '4px';
          
          const dateCell = row.insertCell(2);
          dateCell.textContent = formattedDate;
          dateCell.style.padding = '4px';
          
          const recHrsCell = row.insertCell(3);
          recHrsCell.textContent = recHrs;
          recHrsCell.style.padding = '4px';
          recHrsCell.style.textAlign = 'right';
          recHrsCell.style.fontWeight = '600';
          recHrsCell.style.color = '#ff0000';
          
          const intervalCell = row.insertCell(4);
          intervalCell.textContent = event.RecommendedInterval ? parseFloat(event.RecommendedInterval).toFixed(2) : '-';
          intervalCell.style.padding = '4px';
          intervalCell.style.textAlign = 'center';
          
          const mgrHrsCell = row.insertCell(5);
          mgrHrsCell.textContent = event.ManagerAmountRecommendationHours || '-';
          mgrHrsCell.style.padding = '4px';
          mgrHrsCell.style.textAlign = 'right';
          mgrHrsCell.style.fontWeight = '600';
          mgrHrsCell.style.color = '#ff0000';
          
          const appliedCell = row.insertCell(6);
          appliedCell.textContent = event.WaterApplied || '-';
          appliedCell.style.padding = '4px';
          appliedCell.style.textAlign = 'right';
          
          const ranchIdCell = row.insertCell(7);
          ranchIdCell.textContent = event.RanchId || selectedRanchId || '-';
          ranchIdCell.style.padding = '4px';
          
          const plantingIdCell = row.insertCell(8);
          plantingIdCell.textContent = event.PlantingId || selectedPlantingId || '-';
          plantingIdCell.style.padding = '4px';
          
          const idCell = row.insertCell(9);
          idCell.textContent = event.Id || '-';
          idCell.style.padding = '4px';
          
          const statusCell = row.insertCell(10);
          statusCell.textContent = '';
          statusCell.style.padding = '4px';
          statusCell.style.textAlign = 'center';
          statusCell.style.fontWeight = '600';
          statusCell.className = 'status-cell';
      });
      
      console.log('✅ Grid 4 populated with', recommendations.length, 'DEFAULT format rows');
      
      if (recommendations.length > 0) {
          const firstEvent = recommendations[0];
          const firstRow = document.getElementById(`event-row-${firstEvent.Id}`);
          if (firstRow) {
              selectEventForPost(firstEvent.Id, firstRow);
          }
      }
  }
  
  // Load API events into displayRecords for MCP tools and POST
  function loadEventsIntoDisplayRecords(events) {
      console.log('🔄 Loading', events.length, 'events into displayRecords');
      
      displayRecords = events.map((event, index) => {
          let scheduledDate = '-';
          if (event.EventDate) {
              const dateObj = new Date(event.EventDate);
              scheduledDate = formatDate(dateObj);
          }
          
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
      
      console.log('✅ displayRecords loaded with', displayRecords.length, 'records from CropManage API');
      
      apiDetailData = JSON.parse(JSON.stringify(displayRecords));
      selectedRecord = null;
      renderTable();
  }
  
  // Refresh Selected Irrigations - handles ALL logic with loops
  async function refreshSelectedIrrigations() {
      if (!selectedRanchId || !selectedPlantingId) {
          logToChat('⚠️ Please select a ranch and planting first', 'M');
          showResult('ℹ️ Please select a ranch and planting before refreshing');
          return;
      }
      
      console.log('🔄 Refreshing - Ranch:', selectedRanchId, 'Planting:', selectedPlantingId);
      
      const pendingCount = displayRecords.filter(r => r.status < 0).length;
      if (pendingCount > 0) {
          const proceed = confirm(`⚠️ Warning: You have ${pendingCount} pending record(s) not posted to CropManage. Refresh will lose these changes. Continue?`);
          if (!proceed) {
              logToChat('ℹ️ Refresh cancelled - pending records preserved', 'M');
              return;
          }
      }
      
      dataSource = 'api';
      
      try {
          displayRecords = [];
          let allEvents = [];
          
          const recommendationsGrid = document.getElementById('recommendationsGrid');
          recommendationsGrid.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: var(--small-font);">Loading...</div>';
          
          const irrigationDetailsBody = document.getElementById('irrigationDetailsBody');
          irrigationDetailsBody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: #999; padding: 20px;">Loading irrigations...</td></tr>';
          
          // SCENARIO 1: ALL Ranches, ALL Plantings
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
          
          // SCENARIO 3: Specific Ranch, Specific Planting
          else {
              console.log('🔄 SCENARIO 3: Single planting');
              logToChat(`🔄 Loading irrigations for ${selectedPlantingName}...`, 'M');
              getIrrigationEventsByPlanting(selectedPlantingId);
              return;
          }
          
      } catch (error) {
          console.error('❌ Error refreshing:', error);
          logToChat(`❌ Error: ${error.message}`, 'M');
      }
  }
  
  // Select event for POST
  function selectEventForPost(eventId, row) {
      const allRows = document.querySelectorAll('#irrigationDetailsBody tr');
      allRows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      selectedEventId = eventId;
      console.log('Event selected:', eventId);
  }
  
  // ========================================
  // MODAL CONTROL FUNCTIONS
  // ========================================
  
  function showPostModal() {
      const modal = document.getElementById('postModal');
      const queueCount = displayRecords.filter(r => r.status === -1).length;
      document.getElementById('modalQueueCount').textContent = queueCount;
      modal.style.display = 'flex';
  }
  
  function closePostModal() {
      const modal = document.getElementById('postModal');
      modal.style.display = 'none';
  }
  
  function postSelected() {
      closePostModal();
      postIrrigationToCropManage();
  }
  
  function postAllQueued() {
      closePostModal();
      batchPostQueue();
  }
  
  // ========================================
  // BATCH QUEUE PROCESSING
  // ========================================
  
  async function batchPostQueue() {
      try {
          const descArea = document.getElementById('scriptDescription');
          const queuedRecords = displayRecords.filter(r => r.status === -1);
          
          if (queuedRecords.length === 0) {
              const msg = 'ℹ️ No records in queue (status=-1)';
              if (descArea) descArea.innerHTML = msg;
              logToChat(msg, 'M');
              return;
          }
          
          const total = queuedRecords.length;
          logToChat(`🚀 Starting batch POST: ${total} records in queue`, 'M');
          if (descArea) descArea.innerHTML = `⏳ Processing ${total} queued records...`;
          
          let successCount = 0;
          let failCount = 0;
          
          for (let i = 0; i < queuedRecords.length; i++) {
              const record = queuedRecords[i];
              const recordNum = i + 1;
              
              try {
                  logToChat(`📤 [${recordNum}/${total}] Processing: ${record.scheduledDate} - ${record.ranchName} / ${record.plantingName}`, 'M');
                  selectedRecord = record;
                  
                  if (record.eventId) {
                      const result = await updateRecordToCropManage();
                      if (result && result.success) {
                          record.status = 0;
                          successCount++;
                          logToChat(`   ✅ Updated Event ID ${record.eventId}`, 'M');
                      } else {
                          failCount++;
                          logToChat(`   ❌ Update failed - staying in queue`, 'M');
                      }
                  } else {
                      const result = await postIrrigationToCropManage();
                      if (result && result.success && result.id) {
                          record.status = 0;
                          record.eventId = result.id;
                          successCount++;
                          logToChat(`   ✅ Posted - New Event ID ${result.id}`, 'M');
                      } else {
                          failCount++;
                          logToChat(`   ❌ Post failed - staying in queue`, 'M');
                      }
                  }
              } catch (error) {
                  failCount++;
                  logToChat(`   ❌ Error: ${error.message}`, 'M');
              }
              
              await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const summary = `✅ Batch complete: ${successCount} synced, ${failCount} failed (remain in queue)`;
          logToChat(summary, 'M');
          if (descArea) descArea.innerHTML = summary;
          renderTable();
          
      } catch (error) {
          console.error('❌ Batch error:', error);
          logToChat(`❌ Batch processing error: ${error.message}`, 'M');
      }
  }
  
  // POST Irrigation Record to CropManage
  async function postIrrigationToCropManage() {
      try {
          const descArea = document.getElementById('scriptDescription');
          
          if (!selectedRecord) {
              if (descArea) descArea.innerHTML = '❌ No record selected in Display Grid. Click a row in the bottom grid first.';
              return { success: false, error: 'No record selected' };
          }
          
          if (selectedRecord.eventId) {
              const msg = `ℹ️ Record already exists in CropManage: ${selectedRecord.scheduledDate} (${selectedRecord.hours} hrs). Event ID: ${selectedRecord.eventId}. Use Update Record to modify.`;
              if (descArea) descArea.innerHTML = msg;
              return { success: true, message: 'Already posted' };
          }
          
          const plantingId = parseInt(selectedRecord.plantingId);
          if (!plantingId || isNaN(plantingId)) throw new Error(`Invalid plantingId: ${selectedRecord.plantingId}`);
          
          const displayDate = selectedRecord.scheduledDate;
          const dateObj = parseEventDate(displayDate);
          const apiDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          
          const payload = {
              eventdate: apiDate,
              irrigationmethodid: 1,
              manageramountrecommendation: parseFloat(selectedRecord.mgrHours) || 0,
              manageramountrecommendationhours: parseFloat(selectedRecord.mgrHours) || 0,
              waterapplied: parseFloat(selectedRecord.appliedHours) || 0,
              waterappliedhours: parseFloat(selectedRecord.appliedHours) || 0
          };
          
          const url = `https://api.dev.cropmanage.ucanr.edu/v3/plantings/${plantingId}/irrigation-events.json`;
          if (descArea) descArea.innerHTML = '⏳ Posting to CropManage...';
          
          const response = await fetch(url, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          const eventId = result.Id || result.id;
          if (!eventId) throw new Error('API did not return an ID');
          
          selectedRecord.eventId = eventId;
          selectedRecord.status = 1;
          selectedRecord.isNew = false;

          // *** v3.0.1 POST-STAMP ***
          // CropManage computed the real UC science values — get them now
          // getEventRecommendation uses IF: MCP online/local, direct fetch offline
          try {
              const recResult = await getEventRecommendation(eventId);
              if (recResult.success && recResult.event) {
                  const rec = recResult.event;
                  const recInch = parseFloat(rec.RecommendedIrrigationAmount) || 0;
                  selectedRecord.hours            = recInch > 0 ? parseFloat((recInch / 0.3).toFixed(1)) : selectedRecord.hours;
                  selectedRecord.mgrHours         = rec.ManagerAmountRecommendationHours || selectedRecord.mgrHours;
                  selectedRecord.recommendedInches = rec.RecommendedIrrigationAmount || selectedRecord.recommendedInches;
                  const appliedInch = parseFloat(rec.WaterApplied) || 0;
                  selectedRecord.appliedHours     = appliedInch > 0 ? parseFloat((appliedInch / 0.3).toFixed(1)) : selectedRecord.appliedHours;
                  console.log(`✅ POST-STAMP: Real CropManage Rec Hrs = ${selectedRecord.hours}`);
              }
          } catch (e) {
              console.warn('⚠️ POST-STAMP getEventRecommendation failed — showing original values:', e.message);
          }
          // *** END POST-STAMP ***

          const recordIndex = displayRecords.findIndex(r => r === selectedRecord);
          if (recordIndex !== -1) displayRecords[recordIndex] = selectedRecord;

          renderTable();
          const msg = `✅ Posted to CropManage! ${selectedRecord.scheduledDate} (${selectedRecord.hours} hrs) - Event ID: ${eventId}`;
          if (descArea) descArea.innerHTML = msg;
          return { success: true, id: eventId, result: result };
          
      } catch (error) {
          console.error('❌ Error:', error);
          const msg = `❌ Post failed: ${error.message}`;
          const descArea = document.getElementById('scriptDescription');
          if (descArea) descArea.innerHTML = msg;
          return { success: false, error: error.message };
      }
  }
  
  // UPDATE Irrigation Record to CropManage
  async function updateRecordToCropManage() {
      try {
          const descArea = document.getElementById('scriptDescription');
          
          if (!selectedRecord) {
              if (descArea) descArea.innerHTML = '❌ No record selected in Display Grid. Click a row in the bottom grid first.';
              return { success: false, error: 'No record selected' };
          }
          
          const eventId = selectedRecord.eventId;
          if (!eventId) {
              const msg = `❌ Cannot update: Record has no CropManage Event ID.`;
              if (descArea) descArea.innerHTML = msg;
              return { success: false, error: 'No Event ID' };
          }
          
          const displayDate = selectedRecord.scheduledDate;
          const dateObj = parseEventDate(displayDate);
          const apiDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
          
          const managerInches = parseFloat((selectedRecord.mgrHours * 0.3).toFixed(2));
          const appliedInches = parseFloat((selectedRecord.appliedHours * 0.3).toFixed(2));
          
          const payload = {
              EventDate: apiDate,
              IrrigationMethodId: 1,
              WaterApplied: appliedInches,
              WaterAppliedHours: parseFloat(selectedRecord.appliedHours) || 0,
              ManagerAmountRecommendation: managerInches,
              ManagerAmountRecommendationHours: parseFloat(selectedRecord.mgrHours) || 0
          };
          
          const url = `https://api.dev.cropmanage.ucanr.edu/v3/irrigation-events/${eventId}.json`;
          if (descArea) descArea.innerHTML = '⏳ Updating in CropManage...';
          
          const response = await fetch(url, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          selectedRecord.status = 1;
          selectedRecord.isUpdated = false;
          
          const recordIndex = displayRecords.findIndex(r => r === selectedRecord);
          if (recordIndex !== -1) displayRecords[recordIndex] = selectedRecord;
          
          renderTable();
          const msg = `✅ Updated in CropManage! ${selectedRecord.scheduledDate} (${selectedRecord.hours} hrs) - Event ID: ${eventId}`;
          if (descArea) descArea.innerHTML = msg;
          return { success: true, id: eventId, result: result };
          
      } catch (error) {
          console.error('❌ Error:', error);
          const msg = `❌ Update failed: ${error.message}`;
          const descArea = document.getElementById('scriptDescription');
          if (descArea) descArea.innerHTML = msg;
          return { success: false, error: error.message };
      }
  }
  
  // ========================================
  // AUTO-LOAD TOKEN ON PAGE STARTUP
  // ========================================
  window.addEventListener('DOMContentLoaded', async function() {
      try {
          const tokenResult = await getToken();
          if (!tokenResult.success) return;
          
          const ranchesResult = await getRanches();
          if (!ranchesResult.success) return;
          
          if (defaultRanchName && ranchData && ranchData.length > 0) {
              const defaultRanch = ranchData.find(r => r.Name === defaultRanchName);
              if (defaultRanch) {
                  selectRanch(defaultRanch.Id, defaultRanch.Ranch_External_GUID, defaultRanch.Name);
              } else {
                  selectRanch('ALL', 'ALL', 'All Ranches');
              }
          } else {
              selectRanch('ALL', 'ALL', 'All Ranches');
          }
          
      } catch (error) {
          // Error already shown in script description area
      }
  });
