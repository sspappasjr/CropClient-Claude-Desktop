# CropClient MCP Audit — Version 2 Spec
## Irrigation-Selected-Array Pattern

### Summary
The client builds an `Irrigation-Selected-Array` before calling the server.
Each entry carries the ranch name, ranch ID, planting name, and planting ID.
The word "ALL" is never sent to the server — only resolved data.

### Array Structure
```
Irrigation-Selected-Array[n] = {
    selectedRanch:      "Steve Ranch 2",
    selectedRanchID:    17150,
    selectedPlanting:   "Planting 2B",
    selectedPlantingID: 64199
}
```

### Flow
1. User selects ranch + planting (or "All Plantings")
2. Client resolves "All" into the actual array from plantingsData
3. Client sends ONE mcpEngineSend:
   `get_irrigation_details({ plantings: Irrigation-Selected-Array })`
4. Server's `get` handler receives the array
5. Server creates work variable (accumulator)
6. For each entry: calls loadIntoDisplayRecords(plantingId)
   - loadIntoDisplayRecords gets base events (1 call)
   - loops each event, fetches recommendation by event.Id (1 call per event)
   - waits for ALL to finish
   - transforms to displayRecords
   - returns to get handler
7. get handler accumulates each result into work variable
8. After ALL plantings done: final render
   - renumber sequential IDs (1, 2, 3...)
   - ranch/planting names already baked in from the array
   - sort by ranch → planting → date
   - return one combined displayRecords result set
9. Client receives ONE response
10. Client loads displayRecords → renderTable() → done

### Rules
- NO bare fetch to CropManage from client — everything through mcpEngineSend
- NO "ALL" passed to server — only resolved arrays
- NO direct fallback — if MCP fails, fail loudly
- Server does the recommendation loop (loadIntoDisplayRecords)
- Client just sends and displays
- Offline mode uses local JSON data only (originalData)

### Files (Version 2)
- Crop-Client-MCP-Audit-Que-2.0.html (client harness)
- 2. Src=/mcp-engine.js (client MCP engine)
- 2. Src=/irrigation-component-1.1.js (irrigation component)
- 2. Src=/APIServer2.5.2.js (harness server with array support)

### Harness Testing
Run local: `node "2. Src=/APIServer2.5.2.js"` from Version 2 folder
Set dropdown to Local → mcp-engine hits localhost:3101
When working → deploy to api.cropclient.com
