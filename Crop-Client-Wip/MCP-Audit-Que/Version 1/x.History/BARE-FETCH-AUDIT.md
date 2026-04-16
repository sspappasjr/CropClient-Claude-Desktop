# Bare Fetch Audit — Version 1 → Version 2 Changes
# Every bare fetch to api.dev.cropmanage.ucanr.edu found and replaced

## What Was Wrong
Client-side code had bare `fetch()` calls directly to CropManage API.
From file:// origin = CORS death. From any browser = bypasses mcp-engine.
Inconsistent with the integrated pair pattern (mcpEngineSend ↔ makeRequest).

## Bare Fetches Found & Fixed

| Function | Was (bare fetch) | Now (mcpEngineSend) | Status |
|----------|-------------------|---------------------|--------|
| getToken | fetch('https://api.dev.cropmanage.ucanr.edu/Token') | mcpEngineSend('get_token', {username, password}) | ✅ Fixed |
| getRanches | fetch('.../v2/ranches.json') | mcpEngineSend('get_ranches', {}) | ✅ Fixed |
| getRanches offline fallback | fetch('.../v2/ranches.json') | REMOVED — returns error | ✅ Killed |
| getPlantingsByRanch | fetch('.../v2/ranches/{guid}/plantings.json') | mcpEngineSend('get_plantings', {ranchGuid}) | ✅ Fixed |
| getPlantingsByRanch offline fallback | fetch('.../v2/ranches/{guid}/plantings.json') | REMOVED — returns error | ✅ Killed |
| loadAllPlantings offline branch | fetch('.../v2/ranches/{guid}/plantings.json') | REMOVED — skips | ✅ Killed |
| getIrrigationEventsByPlanting | fetch('.../v2/plantings/{id}/irrigation-events/details.json') | mcpEngineSend('get_irrigation_details', {plantingId}) | ✅ Fixed |
| getIrrigationEventsByPlanting direct fallback | fetch('.../v2/plantings/{id}/...') | REMOVED — returns error | ✅ Killed |
| fetchAllRecommendations (THE LOOP) | fetch('.../v2/irrigation-events/{eventId}.json') per event | mcpEngineSend('get_irrigation_details', {plantingId}) per planting group | ✅ Fixed |
| getIndividualEvent | fetch('.../v2/irrigation-events/{eventId}.json') | Looks up displayRecords locally (already enriched) | ✅ Fixed |
| postIrrigationToCropManage | fetch('.../v3/plantings/{id}/irrigation-events.json', POST) | mcpEngineSend('post_new_irrigation', {...}) | ✅ Fixed |
| updateRecordToCropManage | fetch('.../v3/irrigation-events/{id}.json', PUT) | mcpEngineSend('update_irrigation', {...}) | ✅ Fixed |
| refreshSelectedIrrigations Scenario 1 | fetch for plantings + events per ranch | mcpEngineSend for get_plantings + get_irrigation_details | ✅ Fixed |
| refreshSelectedIrrigations Scenario 2 | fetch for events per planting | mcpEngineSend for get_irrigation_details per planting | ✅ Fixed |

## The Rule
Every call to CropManage goes through the integrated pair:
- Client: mcpEngineSend → server
- Server: makeRequest → CropManage
No exceptions. No bare fetch. No direct fallback. No mode change on failure.
