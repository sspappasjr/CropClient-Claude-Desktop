# Server-Side Flow — get_irrigation_details → loadIntoDisplayRecords

## The Integrated Pair
- Client calls: mcpEngineSend → hits server endpoint /tools/get_irrigation_details
- Server calls: makeRequest (Node https) → CropManage API
- No bare fetch anywhere. Closed loop.

## Flow: Single Planting

```
CLIENT                          SERVER                          CROPMANAGE
  |                               |                               |
  |-- mcpEngineSend ------------->|                               |
  |   get_irrigation_details      |                               |
  |   { plantingId: 64199 }       |                               |
  |                               |                               |
  |                               |-- get handler ------          |
  |                               |   validates params  |         |
  |                               |   sets context      |         |
  |                               |   calls load -------+         |
  |                               |                     |         |
  |                               |   loadIntoDisplayRecords      |           wrong placement  this is only after the source is complete demo or api then display 
  |                               |   |                           |
  |                               |   |-- getIrrigationDetails -->|
  |                               |   |   (1 call, 1 plantingId)  |
  |                               |   |<-- events[] --------------|
  |                               |   |                           |
  |                               |   |-- FOR EACH event:         |
  |                               |   |   fetchEventRecommendation|
  |                               |   |   (1 call per event.Id) ->|
  |                               |   |<-- recommendation --------|
  |                               |   |   (enrich event)          |
  |                               |   |                           |
  |                               |   |-- ALL DONE                |                      now you cando   "lloadIntoDisplayRecord"
  |                               |   |   transformToDisplayRecords
  |                               |   |   return { displayRecords }
  |                               |                               |
  |<-- { displayRecords } --------|                               |
  |                               |                               |
  |-- displayRecords = data       |                               |
  |-- renderTable()               |                               |
  |-- DONE                        |                               |
```

## Flow: Multiple Plantings (Irrigation-Selected-Array) — v2.5.2

```
CLIENT                          SERVER                          CROPMANAGE
  |                               |                               |
  |-- mcpEngineSend ------------->|                               |
  |   get_irrigation_details      |                               |
  |   { plantings: [             |                               |
  |     {selectedPlantingID: 64199, selectedPlanting: '2B', ...} |
  |     {selectedPlantingID: 64200, selectedPlanting: '2A', ...} |
  |   ]}                          |                               |
  |                               |                               |
  |                               |-- get handler ------          |
  |                               |   builds plantingList         |
  |                               |   creates workRecords = []    |
  |                               |                               |
  |                               |   FOR EACH planting:          |
  |                               |     set context (name, id)    |
  |                               |     loadIntoDisplayRecords    |
  |                               |       (full loop as above)    |
  |                               |     workRecords.concat(result)|
  |                               |                               |
  |                               |   ALL PLANTINGS DONE          |
  |                               |   sort workRecords            |
  |                               |   renumber IDs (1,2,3...)     |
  |                               |   return { displayRecords }   |
  |                               |                               |
  |<-- { displayRecords } --------|                               |
  |                               |                               |
  |-- displayRecords = data       |                               |
  |-- renderTable()               |                               |
  |-- DONE                        |                               |
```

## Key: loadIntoDisplayRecords does ALL the work
- Gets base events (1 API call)
- Loops each event, fetches recommendation (1 call per event ID)
- Waits for ALL to finish
- Transforms to displayRecords format
- Returns the finished package

## Key: get handler understands the request
- Validates params
- Resolves single plantingId OR plantings array
- Loops plantings, accumulates into work variable
- Final render: sort + renumber
- Returns one combined result set

## Key: Display doesn't start until load is DONE
- await loadIntoDisplayRecords — blocks until complete
- Client await mcpEngineSend — blocks until server returns
- No partial display. No race conditions.
