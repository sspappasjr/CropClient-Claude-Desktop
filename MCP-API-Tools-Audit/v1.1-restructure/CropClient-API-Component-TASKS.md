# CropClient API Component Cleanup Tasks

## Principle

**APISERVICE_COMPONENT = JSON + CropManage API calls ONLY**

No DOM. No grid IDs. No chat logs. No UI logic.

The calling component (Dashboard UI - top left) handles all rendering using the JSON data returned by APISERVICE.

---

## Task List

### DOM Functions to Remove from APISERVICE

| # | Function | Current Location | Move To | Status |
|---|----------|------------------|---------|--------|
| 1 | `populateRanchesGrid()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 2 | `populatePlantingsGrid()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 3 | `populateRecommendationsGrid()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 4 | `populateRecommendationsGridMultiRow()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 5 | `populateIrrigationDetailsGrid()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 6 | `populateIrrigationDetailsGridDEFAULT()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 7 | `displayFullRecommendation()` | APISERVICE | Dashboard UI | ⬜ TODO |

### DOM Element References to Remove from APISERVICE

| # | Element ID | Used In | Status |
|---|------------|---------|--------|
| 8 | `document.getElementById('ranchesGrid')` | populateRanchesGrid | ⬜ TODO |
| 9 | `document.getElementById('plantingsGrid')` | populatePlantingsGrid | ⬜ TODO |
| 10 | `document.getElementById('recommendationsGrid')` | multiple functions | ⬜ TODO |
| 11 | `document.getElementById('irrigationDetailsBody')` | multiple functions | ⬜ TODO |
| 12 | `document.getElementById('scriptDescription')` | multiple functions | ⬜ TODO |
| 13 | `document.getElementById('tokenDisplay')` | getToken | ⬜ TODO |

### UI Functions to Remove from APISERVICE

| # | Function | Current Location | Move To | Status |
|---|----------|------------------|---------|--------|
| 14 | `logToChat()` | Called in APISERVICE | Dashboard UI | ⬜ TODO |
| 15 | `showResult()` | Called in APISERVICE | Dashboard UI | ⬜ TODO |
| 16 | `selectRanch()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 17 | `selectPlanting()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 18 | `selectEvent()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 19 | `selectEventForPost()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 20 | `showPostModal()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 21 | `closePostModal()` | APISERVICE | Dashboard UI | ⬜ TODO |

### Script/UI Router Functions to Remove from APISERVICE

| # | Function | Current Location | Move To | Status |
|---|----------|------------------|---------|--------|
| 22 | `selectScript()` | APISERVICE | Dashboard UI | ⬜ TODO |
| 23 | `runScript()` | APISERVICE | Dashboard UI | ⬜ TODO |

---

## Refactor Pattern

### Before (UI mixed in APISERVICE)

```javascript
// In APISERVICE - WRONG
async function getRanches() {
    const response = await fetch(url, {...});
    const data = await response.json();
    ranchData = data;
    populateRanchesGrid(data);  // ❌ DOM call
    logToChat('✅ Loaded', 'M');  // ❌ UI call
}
```

### After (Clean separation)

```javascript
// In APISERVICE - CORRECT
async function getRanches() {
    const response = await fetch(url, {...});
    const data = await response.json();
    ranchData = data;
    return {
        success: true,
        ranches: data,
        count: data.length
    };
}

// In Dashboard UI - handles rendering
async function onGetRanchesClick() {
    const result = await getRanches();
    if (result.success) {
        populateRanchesGrid(result.ranches);
        logToChat('✅ Loaded ' + result.count + ' ranches', 'M');
    }
}
```

---

## Execution Plan

1. Work ONE task at a time
2. Test app after each change
3. Verify button still works with 29 records
4. Get approval before next task
5. Mark task complete ✅

---

## Variables That Stay in APISERVICE

These are data variables - they belong in APISERVICE:

- `apiToken`
- `ranchData`
- `plantingsData`
- `lotsData`
- `selectedRanchId`
- `selectedRanchGuid`
- `selectedRanchName`
- `selectedPlantingId`
- `selectedPlantingName`
- `selectedEventId`
- `dataSource`
- `apiDetailData`
- `displayRecords`

---

## Functions That Stay in APISERVICE

These are pure API/data functions (after removing UI calls):

- `getToken()`
- `getRanches()`
- `getPlantingsByRanch()`
- `getIrrigationEventsByPlanting()`
- `getIndividualEvent()`
- `refreshSelectedIrrigations()`
- `fetchAllRecommendations()`
- `loadEventsIntoDisplayRecords()`
- `loadAllPlantings()`
- `postIrrigationToCropManage()`
- `updateRecordToCropManage()`
- `batchPostQueue()`

---

## Final Goal

After all tasks complete:

1. APISERVICE_COMPONENT = pure JSON + API
2. Extract WHOLE component to api-component.js
3. No adapters needed - clean code
4. App works (button → 29 records)
5. MCP works (tool → 29 records)

---

*Created: January 28, 2026*
*Status: Ready to begin*
