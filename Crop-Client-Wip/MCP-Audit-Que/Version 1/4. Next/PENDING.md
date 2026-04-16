# PENDING — What Still Needs To Be Done for Version 2

## DONE (in Version 1 on disk now)
- [x] All bare fetch to CropManage replaced with mcpEngineSend
- [x] All direct/offline fallbacks removed — fail loudly, no mode change
- [x] mcpCall replaced with mcpEngineSend for token, ranches, plantings, irrigation
- [x] post and update use mcpEngineSend to server tools
- [x] fetchAllRecommendations uses mcpEngineSend per planting group (server does event loop)
- [x] getIndividualEvent looks up displayRecords locally (no fetch)
- [x] Scenario 1 & 2 use mcpEngineSend loops
- [x] APIServer2.5.2.js created with Irrigation-Selected-Array support
- [x] VERSION-2-SPEC.md written

## TODO — Before Version 2 is Demo-Ready
- [ ] Test single planting refresh (Scenario 3) — does displayRecords load in bottom grid?
- [ ] Test "All Plantings" (Scenario 2) — does mcpEngineSend loop work correctly?
- [ ] Test offline mode — does app load with 12 JSON records, no errors?
- [ ] Verify CRUD buttons still work (Create, Reset, Apply, Update) with displayRecords format
- [ ] Wire client to use Irrigation-Selected-Array for Scenario 2 (one mcpEngineSend instead of loop)
- [ ] Remove dead code: CC_STATE, getMcpBase, mcpCall, mcpSendTokenAndValidate (Dashboard block)
- [ ] Clean up the dead direct fallback code block in getIrrigationEventsByPlanting
- [ ] Copy clean files to Version 2 folder (html as 2.0, src files, server as 2.5.2)
- [ ] Test harness: node "2. Src=/APIServer2.5.2.js" from Version 2, dropdown to Local
- [ ] Deploy APIServer2.5.2.js to api.cropclient.com when harness passes

## FUTURE — Version 2.1+
- [ ] Irrigation-Selected-Array: client builds array, sends ONE call, server loops
- [ ] Remove Scenario 1/2 client-side loops entirely (server handles via plantings array)
- [ ] POST modal: batch_post_queue via mcpEngineSend (already wired, needs testing)
- [ ] Save/Restore: saveDirect and restoreDirect still use direct fetch to server (not CropManage, OK for now)
